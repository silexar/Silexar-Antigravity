import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability'
import { apiServerError } from '@/lib/api/response'
import { rateLimit } from '@/lib/security/rate-limiter'
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

export async function POST(request: NextRequest) {
  try {
    const rl = await rateLimit({ key: `campanas_ia_optimizacion`, limit: 200, window: 60_000 })
    if (!rl.success) return NextResponse.json({ success: false, error: 'RATE_LIMIT' }, { status: 429 })
    const body = await request.json().catch(() => ({}))
    const { presupuesto = 0 } = body
    const plan = {
      redistribucion: presupuesto > 0 ? [
        { bloque: 'AM', porcentaje: 0.25 },
        { bloque: 'PM', porcentaje: 0.35 },
        { bloque: 'PRIME', porcentaje: 0.40 },
      ] : [],
      recomendaciones: ['Incrementar presencia en PRIME si el objetivo es alcance']
    }
    return NextResponse.json({ success: true, plan }, { status: 200 })
  } catch (error) {
    logger.error('[API/Campanas/IA/Optimizacion] Error POST:', error instanceof Error ? error : undefined, { module: 'campanas/ia/optimizacion', action: 'POST' })
    return apiServerError()
  }
}

