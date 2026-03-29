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
    const rl = await rateLimit({ key: `campanas_prop_sugerencias:${clientIP}`, limit: 200, window: 60_000 })
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'RATE_LIMIT' }, { status: 429, headers: baseHeaders })
    }

    const body = await request.json().catch(() => ({}))
    const { anunciante, tipoCampana } = body || {}

    // Sugerencias simples basadas en contexto
    const sugerencias: Array<Record<string, unknown>> = []
    if (tipoCampana === 'AUSPICIO') {
      sugerencias.push({ id: 'posicion_fija', nombre: 'Posición Fija', tipo: 'SELECT', categoria: 'programacion', opciones: ['INICIO', 'SEGUNDO', 'ULTIMO'], requerida: false, descripcion: 'Ubicación fija recomendada' })
    }
    if (anunciante && String(anunciante).toLowerCase().includes('banco')) {
      sugerencias.push({ id: 'bloques_preferentes', nombre: 'Bloques Preferentes', tipo: 'SELECT', categoria: 'programacion', opciones: ['AM', 'PRIME'], requerida: false, descripcion: 'Optimiza alcance financiero' })
    }

    return NextResponse.json({ success: true, sugerencias }, { status: 200, headers: baseHeaders })
  } catch (error) {
    logger.error('[API/Campanas/Propiedades/Sugerencias] Error POST:', error instanceof Error ? error : undefined, { module: 'campanas/propiedades/sugerencias', action: 'POST' })
    return apiServerError()
  }
}

