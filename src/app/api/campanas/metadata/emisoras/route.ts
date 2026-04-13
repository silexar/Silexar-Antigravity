/**
 * SILEXAR PULSE - API Metadata Emisoras TIER 0
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
 * GET - Listar emisoras para campañas
 * Requiere: campanas:read
 */
export const GET = withApiRoute(
  { resource: 'campanas', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const emisoras = [
          { id: 't13', nombre: 'T13 RADIO', frecuencia: '103.3 FM', plaza: 'Santiago' },
          { id: 'play', nombre: 'PLAY FM', frecuencia: '100.9 FM', plaza: 'Santiago' },
          { id: 'rnp', nombre: 'ROCK & POP', frecuencia: '94.1 FM', plaza: 'Santiago' },
          { id: 'concierto', nombre: 'RADIO CONCIERTO', frecuencia: '88.5 FM', plaza: 'Santiago' },
        ];

        return NextResponse.json({ 
          success: true, 
          emisoras,
          consultadoPor: ctx.userId
        }, { status: 200, headers: baseHeaders });
      });
    } catch (error) {
      logger.error('[API/Campanas/Metadata/Emisoras] Error GET:', error instanceof Error ? error : undefined, { 
        module: 'campanas/metadata/emisoras', 
        action: 'GET',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);
