/**
 * SILEXAR PULSE - API Confirmaciones Templates TIER 0
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability';
import { apiSuccess, apiServerError } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';

/**
 * GET - Listar templates de confirmaciones
 * Requiere: campanas:read
 */
export const GET = withApiRoute(
  { resource: 'campanas', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const templates = [
          { id: 'default', nombre: 'Estándar Corporativo' },
          { id: 'premium', nombre: 'Premium con Métricas' },
          { id: 'minimal', nombre: 'Minimal Cliente' },
        ]
        return NextResponse.json({ 
          success: true, 
          templates,
          consultadoPor: ctx.userId
        }, { status: 200 });
      });
    } catch (error) {
      logger.error('[API/Campanas/Confirmaciones/Templates] Error GET:', error instanceof Error ? error : undefined, { 
        module: 'campanas/confirmaciones/templates', 
        action: 'GET',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);
