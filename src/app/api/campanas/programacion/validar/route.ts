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
    const rl = await rateLimit({ key: `campanas_prog_validar:${clientIP}`, limit: 300, window: 60_000 })
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'RATE_LIMIT' }, { status: 429, headers: baseHeaders })
    }

    const body = await request.json().catch(() => ({}))
    const { lineas = [] } = body || {}

    const alertas: string[] = []
    lineas.forEach((l: Record<string, unknown>, idx: number) => {
      if (l?.posicionFija && l.posicionFija !== 'NINGUNO' && l?.bloque === 'PM') {
        alertas.push(`Línea ${idx + 1}: posición fija en PM podría saturar el bloque`)
      }
    })

    return NextResponse.json({ success: true, esValido: alertas.length === 0, alertas }, { status: 200, headers: baseHeaders })
  } catch (error) {
    logger.error('[API/Campanas/Programacion/Validar] Error POST:', error instanceof Error ? error : undefined, { module: 'campanas/programacion/validar', action: 'POST' })
    return apiServerError()
  }
}

