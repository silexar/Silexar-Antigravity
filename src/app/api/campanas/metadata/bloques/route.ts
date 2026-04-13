/**
 * SILEXAR PULSE - API Metadata Bloques TIER 0
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
 * GET - Listar bloques horarios
 * Requiere: campanas:read
 */
export const GET = withApiRoute(
  { resource: 'campanas', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const bloques = [
          { id: 'am', nombre: 'AM', rango: { inicio: '06:00', fin: '11:59' } },
          { id: 'md', nombre: 'MEDIODÍA', rango: { inicio: '12:00', fin: '13:59' } },
          { id: 'pm', nombre: 'PM', rango: { inicio: '14:00', fin: '18:59' } },
          { id: 'nt', nombre: 'NOCHE', rango: { inicio: '19:00', fin: '23:59' } },
          { id: 'prm', nombre: 'PRIME', rango: { inicio: '07:00', fin: '09:59' } },
        ]

        return NextResponse.json({ 
          success: true, 
          bloques,
          consultadoPor: ctx.userId,
          timestamp: new Date().toISOString()
        }, { status: 200, headers: baseHeaders });
      });
    } catch (error) {
      logger.error('[API/Campanas/Metadata/Bloques] Error GET:', error instanceof Error ? error : undefined, { 
        module: 'campanas/metadata/bloques', 
        action: 'GET',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);
