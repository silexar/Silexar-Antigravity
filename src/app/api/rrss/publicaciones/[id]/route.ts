/**
 * GET /api/rrss/publicaciones/:id
 * PUT /api/rrss/publicaciones/:id
 * DELETE /api/rrss/publicaciones/:id
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { logger } from '@/lib/observability';

import { RrssPublicacionDrizzleRepository } from '@/modules/rrss/infrastructure/repositories/RrssPublicacionDrizzleRepository';
import { ActualizarPublicacionRrssCommand } from '@/modules/rrss/application/commands/ActualizarPublicacionRrssCommand';
import { EliminarPublicacionRrssCommand } from '@/modules/rrss/application/commands/EliminarPublicacionRrssCommand';
import { ActualizarPublicacionRrssHandler } from '@/modules/rrss/application/handlers/ActualizarPublicacionRrssHandler';
import { EliminarPublicacionRrssHandler } from '@/modules/rrss/application/handlers/EliminarPublicacionRrssHandler';
import { ObtenerPublicacionRrssHandler } from '@/modules/rrss/application/handlers/ObtenerPublicacionRrssHandler';
import { ObtenerPublicacionRrssQuery } from '@/modules/rrss/application/queries/ObtenerPublicacionRrssQuery';

const repository = new RrssPublicacionDrizzleRepository();
const actualizarHandler = new ActualizarPublicacionRrssHandler(repository);
const eliminarHandler = new EliminarPublicacionRrssHandler(repository);
const obtenerHandler = new ObtenerPublicacionRrssHandler(repository);

const updateSchema = z.object({
  connectionId: z.string().uuid().optional(),
  campanaId: z.string().uuid().optional().nullable(),
  contratoId: z.string().uuid().optional().nullable(),
  contenido: z.string().min(1).max(2200).optional(),
  hashtags: z.array(z.string()).optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  estado: z.enum(['borrador', 'programada', 'cancelada']).optional(),
  scheduledAt: z.coerce.date().optional().nullable(),
});

export const GET = withApiRoute(
  { resource: 'rrss', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const id = req.url.split('/').pop() || '';
      const query = new ObtenerPublicacionRrssQuery({ id, tenantId: ctx.tenantId });
      const result = await obtenerHandler.execute(query);

      if (!result.ok) {
        return apiError('SERVER_ERROR', result.error.message, 500) as unknown as NextResponse;
      }

      if (!result.data) {
        return apiError('NOT_FOUND', 'Publicación no encontrada', 404) as unknown as NextResponse;
      }

      return apiSuccess(result.data.toJSON()) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error in rrss/publicaciones/[id] GET', error instanceof Error ? error : undefined, { module: 'rrss' });
      return apiServerError() as unknown as NextResponse;
    }
  }
);

export const PUT = withApiRoute(
  { resource: 'rrss', action: 'update' },
  async ({ ctx, req }) => {
    try {
      const id = req.url.split('/').pop() || '';
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

      const command = new ActualizarPublicacionRrssCommand({
        id,
        tenantId: ctx.tenantId,
        ...parsed.data,
      });

      const result = await actualizarHandler.execute(command);
      if (!result.ok) {
        return apiError('SERVER_ERROR', result.error.message, 500) as unknown as NextResponse;
      }

      return apiSuccess(result.data.toJSON(), 200, { message: 'Publicación RRSS actualizada exitosamente' }) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error in rrss/publicaciones/[id] PUT', error instanceof Error ? error : undefined, { module: 'rrss' });
      return apiServerError() as unknown as NextResponse;
    }
  }
);

export const DELETE = withApiRoute(
  { resource: 'rrss', action: 'delete' },
  async ({ ctx, req }) => {
    try {
      const id = req.url.split('/').pop() || '';
      const command = new EliminarPublicacionRrssCommand({
        id,
        tenantId: ctx.tenantId,
      });

      const result = await eliminarHandler.execute(command);
      if (!result.ok) {
        return apiError('SERVER_ERROR', result.error.message, 500) as unknown as NextResponse;
      }

      return apiSuccess(null, 200, { message: 'Publicación RRSS eliminada exitosamente' }) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error in rrss/publicaciones/[id] DELETE', error instanceof Error ? error : undefined, { module: 'rrss' });
      return apiServerError() as unknown as NextResponse;
    }
  }
);
