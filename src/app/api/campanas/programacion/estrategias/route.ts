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

export async function GET(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rl = await rateLimit({ key: `campanas_prog_estrategias:${clientIP}`, limit: 300, window: 60_000 })
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'RATE_LIMIT' }, { status: 429, headers: baseHeaders })
    }

    const estrategias = [
      { id: 'EQUILIBRADA', nombre: 'Equilibrada' },
      { id: 'ALCANCE', nombre: 'Máximo Alcance' },
      { id: 'FRECUENCIA', nombre: 'Máxima Frecuencia' },
      { id: 'PRIME', nombre: 'Prime Time' },
    ]
    return NextResponse.json({ success: true, estrategias }, { status: 200, headers: baseHeaders })
  } catch (error) {
    logger.error('[API/Campanas/Programacion/Estrategias] Error GET:', error instanceof Error ? error : undefined, { module: 'campanas/programacion/estrategias', action: 'GET' })
    return apiServerError()
  }
}

