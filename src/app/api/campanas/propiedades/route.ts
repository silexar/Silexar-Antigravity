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
    const rl = await rateLimit({ key: `campanas_propiedades:${clientIP}`, limit: 300, window: 60_000 })
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'RATE_LIMIT' }, { status: 429, headers: baseHeaders })
    }

    const propiedades = [
      { id: 'posicion_fija', nombre: 'Posición Fija', tipo: 'SELECT', categoria: 'programacion', opciones: ['NINGUNO', 'INICIO', 'SEGUNDO', 'TERCERO', 'ULTIMO'], requerida: false, descripcion: 'Ubicación fija en el bloque' },
      { id: 'bloques_preferentes', nombre: 'Bloques Preferentes', tipo: 'SELECT', categoria: 'programacion', opciones: ['AM', 'PRIME', 'PM', 'NOCHE'], requerida: false, descripcion: 'Prioridad de bloques' },
      { id: 'tono', nombre: 'Tono', tipo: 'SELECT', categoria: 'material', opciones: ['INFORMATIVO', 'HUMOR', 'EMOTIVO', 'TESTIMONIAL'], requerida: false, descripcion: 'Estilo creativo' },
      { id: 'audiencia_objetivo', nombre: 'Audiencia Objetivo', tipo: 'TEXT', categoria: 'estrategia', requerida: true, descripcion: 'Segmento objetivo' },
    ]

    return NextResponse.json({ success: true, propiedades }, { status: 200, headers: baseHeaders })
  } catch (error) {
    logger.error('[API/Campanas/Propiedades] Error GET:', error instanceof Error ? error : undefined, { module: 'campanas/propiedades', action: 'GET' })
    return apiServerError()
  }
}

