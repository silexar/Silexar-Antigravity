import { NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';
import { auditLogger } from '@/lib/security/audit-logger';
import { AuditEventType } from '@/lib/security/audit-types';

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const disponibilidadSchema = z.object({
  fechaInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD inválido para fechaInicio').optional(),
  fechaTermino: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD inválido para fechaTermino').optional(),
}).strict()

// ─── POST /api/campanas/programacion/disponibilidad ──────────────────────────────────

export const POST = withApiRoute(
  { resource: 'campanas', action: 'read' },
  async ({ ctx, req }) => {
    const tenantId = ctx.tenantId
    const userId = ctx.userId

    try {
      let body: unknown;
      try {
        body = await req.json()
      } catch {
        return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse
      }

      const parseResult = disponibilidadSchema.safeParse(body)
      if (!parseResult.success) {
        return apiError(
          'VALIDATION_ERROR',
          'Error en la validación de los datos',
          400,
          parseResult.error.flatten().fieldErrors
        ) as unknown as NextResponse
      }

      const { fechaInicio, fechaTermino } = parseResult.data

      // Mock disponibilidad por bloque [0..1]
      const disponibilidad = {
        AM: 0.75,
        MEDIODIA: 0.6,
        PM: 0.5,
        NOCHE: 0.8,
        PRIME: 0.35,
      }

      // Log de auditoría para consulta de disponibilidad
      auditLogger.log({
        type: AuditEventType.DATA_READ,
        userId,
        metadata: {
          resource: 'campanas',
          resourceId: 'disponibilidad',
          tenantId,
          fechaInicio,
          fechaTermino
        }
      })

      return apiSuccess({
        success: true,
        fechaInicio,
        fechaTermino,
        disponibilidad
      }, 200) as unknown as NextResponse

    } catch (error) {
      logger.error('[API/Campanas/Programacion/Disponibilidad] Error POST:', error instanceof Error ? error : undefined, {
        module: 'campanas/programacion/disponibilidad',
        action: 'POST',
        tenantId
      })

      // Log de auditoría para fallo
      auditLogger.log({
        type: AuditEventType.API_ERROR,
        userId: ctx.userId,
        metadata: {
          module: 'campanas',
          accion: 'disponibilidad',
          tenantId: ctx.tenantId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      return apiServerError() as unknown as NextResponse
    }
  }
);
