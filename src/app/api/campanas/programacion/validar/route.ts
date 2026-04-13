/**
 * SILEXAR PULSE - API Validar Programación TIER 0
 * 
 * Validación de líneas de programación de campaña
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability';
import { apiSuccess, apiServerError } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';

const baseHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
}

/**
 * POST - Validar líneas de programación
 * Requiere: campanas:read
 */
export const POST = withApiRoute(
  { resource: 'campanas', action: 'read' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const body = await req.json().catch((_e) => null)
        const { lineas = [] } = body || {}

        const alertas: string[] = []
        lineas.forEach((l: Record<string, unknown>, idx: number) => {
          if (l?.posicionFija && l.posicionFija !== 'NINGUNO' && l?.bloque === 'PM') {
            alertas.push(`Línea ${idx + 1}: posición fija en PM podría saturar el bloque`)
          }
        })

        return NextResponse.json({ 
          success: true, 
          esValido: alertas.length === 0, 
          alertas,
          validadoPor: ctx.userId,
          timestamp: new Date().toISOString()
        }, { status: 200, headers: baseHeaders })
      });
    } catch (error) {
      logger.error('[API/Campanas/Programacion/Validar] Error POST:', error instanceof Error ? error : undefined, { 
        module: 'campanas/programacion/validar', 
        action: 'POST',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError()
    }
  }
);
