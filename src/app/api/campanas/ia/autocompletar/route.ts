/**
 * SILEXAR PULSE - API IA Autocompletar TIER 0
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/observability'
import { apiSuccess, apiServerError } from '@/lib/api/response'
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';

const AutocompletarSchema = z.object({
  nombreAnunciante: z.string().max(200).optional(),
  tipoPedidoCampana: z.string().max(100).optional(),
})

/**
 * POST - Autocompletar campaña con IA
 * Requiere: campanas:read
 */
export const POST = withApiRoute(
  { resource: 'campanas', action: 'read' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        // Validate input with Zod
        let body: unknown;
        try { body = await req.json() } catch { 
          return apiSuccess({ error: 'Invalid JSON' }, 400);
        }
        const parsed = AutocompletarSchema.safeParse(body);
        if (!parsed.success) {
          return apiSuccess({ error: 'Invalid input', details: parsed.error.flatten() }, 422);
        }

        const { nombreAnunciante, tipoPedidoCampana } = parsed.data;
        const sugerencias: Record<string, unknown> = {}

        if (nombreAnunciante) {
          sugerencias.nombreCampana = `${nombreAnunciante} - ${tipoPedidoCampana || 'Campaña'} ${new Date().getFullYear()}`
        }
        if (tipoPedidoCampana === 'AUSPICIO') {
          sugerencias.posicionFija = 'INICIO'
        }

        return apiSuccess({ 
          sugerencias,
          generadoPor: ctx.userId,
          timestamp: new Date().toISOString()
        });
      });
    } catch (error) {
      logger.error('[API/Campanas/IA/Autocompletar] Error:', error instanceof Error ? error : undefined, { 
        module: 'campanas',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);
