/**
 * SILEXAR PULSE - API IA Autocompletar TIER 0
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/observability'
import { apiSuccess, apiServerError, apiError } from '@/lib/api/response'
import { withApiRoute } from '@/lib/api/with-api-route';
import { auditLogger } from '@/lib/security/audit-logger';
import { AuditEventType } from '@/lib/security/audit-types';

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
    const tenantId = ctx.tenantId
    const userId = ctx.userId

    try {
      // Validate input with Zod
      let body: unknown;
      try {
        body = await req.json()
      } catch {
        return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse
      }

      const parsed = AutocompletarSchema.safeParse(body);
      if (!parsed.success) {
        return apiError(
          'VALIDATION_ERROR',
          'Error en la validación de los datos',
          422,
          parsed.error.flatten().fieldErrors
        ) as unknown as NextResponse
      }

      const { nombreAnunciante, tipoPedidoCampana } = parsed.data;
      const sugerencias: Record<string, unknown> = {}

      if (nombreAnunciante) {
        sugerencias.nombreCampana = `${nombreAnunciante} - ${tipoPedidoCampana || 'Campaña'} ${new Date().getFullYear()}`
      }
      if (tipoPedidoCampana === 'AUSPICIO') {
        sugerencias.posicionFija = 'INICIO'
      }

      // Log de auditoría para uso de IA
      auditLogger.log({
        type: AuditEventType.API_CALL,
        userId,
        metadata: {
          module: 'campanas',
          accion: 'ia_autocompletar',
          tenantId,
          nombreAnunciante,
          tipoPedidoCampana
        }
      })

      return apiSuccess({
        sugerencias,
        generadoPor: userId,
        timestamp: new Date().toISOString()
      }, 200) as unknown as NextResponse

    } catch (error) {
      logger.error('[API/Campanas/IA/Autocompletar] Error:', error instanceof Error ? error : undefined, {
        module: 'campanas',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });

      // Log de auditoría para fallo
      auditLogger.log({
        type: AuditEventType.API_ERROR,
        userId: ctx.userId,
        metadata: {
          module: 'campanas',
          accion: 'ia_autocompletar',
          tenantId: ctx.tenantId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      return apiServerError() as unknown as NextResponse
    }
  }
);
