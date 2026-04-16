/**
 * GET /api/digital/especificaciones/[id]
 * PUT /api/digital/especificaciones/[id]
 * DELETE /api/digital/especificaciones/[id]
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { logger } from '@/lib/observability';

import { EspecificacionDigitalDrizzleRepository } from '@/modules/digital/infrastructure/repositories/EspecificacionDigitalDrizzleRepository';
import { ObtenerEspecificacionDigitalHandler } from '@/modules/digital/application/handlers/ObtenerEspecificacionDigitalHandler';
import { ActualizarEspecificacionDigitalHandler } from '@/modules/digital/application/handlers/ActualizarEspecificacionDigitalHandler';
import { ObtenerEspecificacionDigitalQuery } from '@/modules/digital/application/queries/ObtenerEspecificacionDigitalQuery';
import { ActualizarEspecificacionDigitalCommand } from '@/modules/digital/application/commands/ActualizarEspecificacionDigitalCommand';

const repository = new EspecificacionDigitalDrizzleRepository();
const obtenerHandler = new ObtenerEspecificacionDigitalHandler(repository);
const actualizarHandler = new ActualizarEspecificacionDigitalHandler(repository);

const updateSchema = z.object({
  plataformas: z.array(z.string()).optional(),
  presupuestoDigital: z.number().min(0).optional(),
  moneda: z.string().max(3).optional(),
  tipoPresupuesto: z.enum(['diario', 'total']).optional(),
  objetivos: z.record(z.string(), z.any()).optional(),
  trackingLinks: z.array(z.string()).optional(),
  configuracionTargeting: z.record(z.string(), z.any()).optional(),
  estado: z.string().max(50).optional(),
  notas: z.string().optional(),
});

function extractId(req: Request): string {
  const url = new URL(req.url);
  const parts = url.pathname.split('/');
  return parts[parts.length - 1] || '';
}

export const GET = withApiRoute(
  { resource: 'digital', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const id = extractId(req);
      const query = new ObtenerEspecificacionDigitalQuery({ id, tenantId: ctx.tenantId });
      const result = await obtenerHandler.execute(query);
      if (!result.ok) {
        return apiServerError() as unknown as NextResponse;
      }
      if (!result.data) {
        return apiError('NOT_FOUND', 'Especificacion digital no encontrada', 404) as unknown as NextResponse;
      }
      return apiSuccess(result.data.toJSON()) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error in digital/especificaciones/[id] GET', error instanceof Error ? error : undefined, { module: 'digital' });
      return apiServerError() as unknown as NextResponse;
    }
  }
);

export const PUT = withApiRoute(
  { resource: 'digital', action: 'update' },
  async ({ ctx, req }) => {
    try {
      const id = extractId(req);
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse;
      }

      const parsed = updateSchema.safeParse(body);
      if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Error en validacion', 400, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
      }

      const command = new ActualizarEspecificacionDigitalCommand({
        id,
        tenantId: ctx.tenantId,
        ...parsed.data,
      });

      const result = await actualizarHandler.execute(command);
      if (!result.ok) {
        if (result.error.message === 'Especificacion digital no encontrada') {
          return apiError('NOT_FOUND', result.error.message, 404) as unknown as NextResponse;
        }
        return apiError('SERVER_ERROR', result.error.message, 500) as unknown as NextResponse;
      }

      return apiSuccess(result.data.toJSON(), 200, { message: 'Especificacion digital actualizada exitosamente' }) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error in digital/especificaciones/[id] PUT', error instanceof Error ? error : undefined, { module: 'digital' });
      return apiServerError() as unknown as NextResponse;
    }
  }
);

export const DELETE = withApiRoute(
  { resource: 'digital', action: 'delete' },
  async ({ ctx, req }) => {
    try {
      const id = extractId(req);
      await repository.delete(id, ctx.tenantId);
      return apiSuccess(null, 200, { message: 'Especificacion digital eliminada exitosamente' }) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error in digital/especificaciones/[id] DELETE', error instanceof Error ? error : undefined, { module: 'digital' });
      return apiServerError() as unknown as NextResponse;
    }
  }
);
