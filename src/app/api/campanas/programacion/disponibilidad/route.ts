import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { rateLimit } from '@/lib/security/rate-limiter'
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';
import { withApiRoute } from '@/lib/api/with-api-route';

const baseHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
}

export const POST = withApiRoute(
  { resource: 'campanas', action: 'read' },
  async ({ ctx, req }) => {
    try {
      const body = await req.json().catch((_e) => null)
      const { fechaInicio, fechaTermino } = body || {}
      // Mock disponibilidad por bloque [0..1]
      const disponibilidad = {
        AM: 0.75,
        MEDIODIA: 0.6,
        PM: 0.5,
        NOCHE: 0.8,
        PRIME: 0.35,
      }
      return NextResponse.json({ success: true, fechaInicio, fechaTermino, disponibilidad }, { status: 200, headers: baseHeaders })
    } catch (error) {
      logger.error('[API/Campanas/Programacion/Disponibilidad] Error POST:', error instanceof Error ? error : undefined, { module: 'campanas/programacion/disponibilidad', action: 'POST' })
      return apiServerError()
    }
  }
);
