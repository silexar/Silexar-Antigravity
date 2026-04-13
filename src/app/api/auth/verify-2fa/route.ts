/**
 * POST /api/auth/verify-2fa
 *
 * Verifies a TOTP code for the development mock login flow.
 * Production authentication uses Better Auth (which handles 2FA natively
 * via /api/auth/[...auth] — this endpoint is unreachable in production).
 *
 * Required body: { userId: string; code: string }
 * Response:      { success: true } | { success: false; error: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyTOTP } from '@/lib/auth/totp'
import { authRateLimiter } from '@/lib/security/rate-limiter'

// ─── Dev TOTP secret ──────────────────────────────────────────────────────────
// Per-user dev secrets. In a real deployment these live in the DB, encrypted.
// For the dev mock users, they are fixed and documented in .env.local.example.
// Configure DEV_2FA_SECRET in .env.local — if absent, this endpoint returns 403.
//
// To get your current code during development:
//   node -e "const {generateTOTP}=require('./src/lib/auth/totp'); console.log(generateTOTP(process.env.DEV_2FA_SECRET))"
//
// Or add the secret to any authenticator app (Google Authenticator, Authy, etc.)

const DEV_SECRETS: Record<string, string | undefined> = {
  // dev user id → base-32 TOTP secret (from env or per-user override)
  user_001: process.env.DEV_2FA_SECRET_USER_001 ?? process.env.DEV_2FA_SECRET,
}

export async function POST(request: NextRequest) {
  // ── Block in production ────────────────────────────────────────────────────
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'Not available in production' },
      { status: 403 }
    )
  }

  // ── Rate-limit: 5 attempts / minute per IP ─────────────────────────────────
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const limited = await authRateLimiter.isRateLimited(`verify-2fa:${ip}`)
  if (limited) {
    return NextResponse.json(
      { success: false, error: 'Demasiados intentos. Espera un momento.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Cuerpo inválido' }, { status: 400 })
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).userId !== 'string' ||
    typeof (body as Record<string, unknown>).code !== 'string'
  ) {
    return NextResponse.json(
      { success: false, error: 'userId y code son requeridos' },
      { status: 400 }
    )
  }

  const { userId, code } = body as { userId: string; code: string }

  // ── Validate code format ──────────────────────────────────────────────────
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { success: false, error: 'El código debe tener exactamente 6 dígitos numéricos' },
      { status: 400 }
    )
  }

  // ── Look up secret ────────────────────────────────────────────────────────
  const secret = DEV_SECRETS[userId]

  if (!secret) {
    return NextResponse.json(
      {
        success: false,
        error:
          'DEV_2FA_SECRET no configurado. Agrega DEV_2FA_SECRET=<base32-secret> en .env.local ' +
          'y escanea el QR en tu app de autenticación.',
      },
      { status: 403 }
    )
  }

  // ── Verify TOTP (RFC 6238, ±30 s window) ─────────────────────────────────
  const valid = verifyTOTP(code, secret)

  if (!valid) {
    return NextResponse.json(
      { success: false, error: 'Código incorrecto o expirado' },
      { status: 401 }
    )
  }

  return NextResponse.json({ success: true })
}
