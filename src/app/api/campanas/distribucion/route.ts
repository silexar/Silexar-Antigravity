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
    const rl = await rateLimit({ key: `campanas_distribucion:${clientIP}`, limit: 200, window: 60_000 })
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'RATE_LIMIT' }, { status: 429, headers: baseHeaders })
    }

    const body = await request.json().catch(() => ({}))
    const { lineas = [] } = body || {}

    const lineasDistribuidas = lineas.map((l: Record<string, unknown>) => {
      const rawCunas = typeof l.cantidadCunas === 'number' ? l.cantidadCunas : 0;
      const total = rawCunas > 0 ? rawCunas : 7
      const base = Math.floor(total / 7)
      const resto = total % 7
      const dias = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo']
      const asignacion: Record<string, unknown> = {}
      dias.forEach((d, i) => { asignacion[d] = base + (i < resto ? 1 : 0) })
      return { ...l, cunasPorDia: asignacion, totalCunas: total }
    })

    return NextResponse.json({ success: true, lineasProcesadas: lineasDistribuidas.length, lineas: lineasDistribuidas }, { status: 200, headers: baseHeaders })
  } catch (error) {
    logger.error('[API/Campanas/Distribucion] Error POST:', error instanceof Error ? error : undefined, { module: 'campanas/distribucion', action: 'POST' })
    return apiServerError()
  }
}

