/**
 * SILEXAR PULSE - API Propiedades Categorías TIER 0
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
 * GET - Listar categorías de propiedades
 * Requiere: campanas:read
 */
export const GET = withApiRoute(
  { resource: 'campanas', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const categorias = ['programacion', 'material', 'estrategia', 'comercial']
        return NextResponse.json({ 
          success: true, 
          categorias,
          consultadoPor: ctx.userId
        }, { status: 200, headers: baseHeaders });
      });
    } catch (error) {
      logger.error('[API/Campanas/Propiedades/Categorias] Error GET:', error instanceof Error ? error : undefined, { 
        module: 'campanas/propiedades/categorias', 
        action: 'GET',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);
