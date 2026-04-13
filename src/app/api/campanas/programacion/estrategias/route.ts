/**
 * SILEXAR PULSE - API Estrategias de Programación TIER 0
 * 
 * Gestión de estrategias de programación de campañas
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
 * GET - Listar estrategias de programación
 * Requiere: campanas:read
 */
export const GET = withApiRoute(
  { resource: 'campanas', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const estrategias = [
          { id: 'EQUILIBRADA', nombre: 'Equilibrada' },
          { id: 'ALCANCE', nombre: 'Máximo Alcance' },
          { id: 'FRECUENCIA', nombre: 'Máxima Frecuencia' },
          { id: 'PRIME', nombre: 'Prime Time' },
        ]

        return NextResponse.json({ 
          success: true, 
          estrategias,
          consultadoPor: ctx.userId,
          timestamp: new Date().toISOString()
        }, { status: 200, headers: baseHeaders })
      });
    } catch (error) {
      logger.error('[API/Campanas/Programacion/Estrategias] Error GET:', error instanceof Error ? error : undefined, { 
        module: 'campanas/programacion/estrategias', 
        action: 'GET',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError()
    }
  }
);
