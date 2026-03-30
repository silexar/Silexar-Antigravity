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
    const rl = await rateLimit({ key: `campanas_val_form:${clientIP}`, limit: 300, window: 60_000 })
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'RATE_LIMIT' }, { status: 429, headers: baseHeaders })
    }

    const body = await request.json().catch(() => ({}))
    const validaciones: Array<{ campo: string; tipo: string; mensaje: string; sugerencia?: string; autoCorregible: boolean; criticidad: string }> = []
    const correccionesAutomaticas: Record<string, unknown> = {}

    if (!body?.nombreCampana || String(body.nombreCampana).length < 3) {
      validaciones.push({ campo: 'nombreCampana', tipo: 'ERROR', mensaje: 'Nombre de campaña es obligatorio', autoCorregible: false, criticidad: 'ALTA' })
    }
    if (body?.comisionAgencia && (body.comisionAgencia < 0 || body.comisionAgencia > 25)) {
      validaciones.push({ campo: 'comisionAgencia', tipo: 'WARNING', mensaje: 'Comisión agencia fuera de rango (0-25%)', sugerencia: 'Ajustar al 15%', autoCorregible: true, criticidad: 'MEDIA' })
      correccionesAutomaticas['comisionAgencia'] = 15
    }

    return NextResponse.json({ success: true, validaciones, correccionesAutomaticas }, { status: 200, headers: baseHeaders })
  } catch (error) {
    logger.error('[API/Campanas/Validacion/Formulario] Error POST:', error instanceof Error ? error : undefined, { module: 'campanas/validacion/formulario', action: 'POST' })
    return apiServerError()
  }
}

