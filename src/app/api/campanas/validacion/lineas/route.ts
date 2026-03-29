import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { rateLimit } from '@/lib/security/rate-limiter'
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

const baseHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rl = await rateLimit({ key: `campanas_val_lineas:${clientIP}`, limit: 200, window: 60_000 })
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'RATE_LIMIT' }, { status: 429, headers: baseHeaders })
    }

    const body = await request.json().catch(() => ({}))
    const lineas = Array.isArray(body) ? body : body?.lineas || []

    const conflictos: string[] = []
    lineas.forEach((l: Record<string, unknown>, idx: number) => {
      if (!l.emisora) conflictos.push(`Línea ${idx + 1}: emisora faltante`)
      if (!l.bloque) conflictos.push(`Línea ${idx + 1}: bloque no definido`)
      if (l.horaInicio && l.horaFin && l.horaInicio >= l.horaFin) conflictos.push(`Línea ${idx + 1}: rango horario inválido`)
    })

    return NextResponse.json({ success: true, todasValidas: conflictos.length === 0, conflictos }, { status: 200, headers: baseHeaders })
  } catch (error) {
    logger.error('[API/Campanas/Validacion/Lineas] Error POST:', error instanceof Error ? error : undefined, { module: 'campanas/validacion/lineas', action: 'POST' })
    return apiServerError()
  }
}

