/**
 * GET /api/rrss/publicaciones
 * POST /api/rrss/publicaciones
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { logger } from '@/lib/observability';

import { RrssPublicacionDrizzleRepository } from '@/modules/rrss/infrastructure/repositories/RrssPublicacionDrizzleRepository';
import { CrearPublicacionRrssCommand } from '@/modules/rrss/application/commands/CrearPublicacionRrssCommand';
import { CrearPublicacionRrssHandler } from '@/modules/rrss/application/handlers/CrearPublicacionRrssHandler';
import { ListarPublicacionesRrssHandler } from '@/modules/rrss/application/handlers/ListarPublicacionesRrssHandler';
import { ListarPublicacionesRrssQuery } from '@/modules/rrss/application/queries/ListarPublicacionesRrssQuery';

const repository = new RrssPublicacionDrizzleRepository();
const crearHandler = new CrearPublicacionRrssHandler(repository);
const listarHandler = new ListarPublicacionesRrssHandler(repository);

const createSchema = z.object({
  connectionId: z.string().uuid(),
  campanaId: z.string().uuid().optional(),
  contratoId: z.string().uuid().optional(),
  contenido: z.string().min(1).max(2200),
  hashtags: z.array(z.string()).default([]),
  mediaUrls: z.array(z.string().url()).default([]),
  estado: z.enum(['borrador', 'programada']).default('borrador'),
  scheduledAt: z.coerce.date().optional(),
});

export const GET = withApiRoute(
  { resource: 'rrss', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const { searchParams } = new URL(req.url);
      const query = new ListarPublicacionesRrssQuery({
        tenantId: ctx.tenantId,
        campanaId: searchParams.get('campanaId') || undefined,
        contratoId: searchParams.get('contratoId') || undefined,
        connectionId: searchParams.get('connectionId') || undefined,
        estado: searchParams.get('estado') || undefined,
        limit: searchParams.has('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined,
        offset: searchParams.has('offset') ? parseInt(searchParams.get('offset')!, 10) : undefined,
      });

      const result = await listarHandler.execute(query);
      if (!result.ok) {
        return apiError('SERVER_ERROR', result.error.message, 500) as unknown as NextResponse;
      }

      return apiSuccess(result.data.map((p) => p.toJSON())) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error in rrss/publicaciones GET', error instanceof Error ? error : undefined, { module: 'rrss' });
      return apiServerError() as unknown as NextResponse;
    }
  }
);

export const POST = withApiRoute(
  { resource: 'rrss', action: 'create' },
  async ({ ctx, req }) => {
    try {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse;
      }

      const parsed = createSchema.safeParse(body);
      if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Error en validacion', 400, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
      }

      const command = new CrearPublicacionRrssCommand({
        tenantId: ctx.tenantId,
        creadoPorId: ctx.userId,
        ...parsed.data,
      });

      const result = await crearHandler.execute(command);
      if (!result.ok) {
        return apiError('SERVER_ERROR', result.error.message, 500) as unknown as NextResponse;
      }

      return apiSuccess(result.data.toJSON(), 201, { message: 'Publicación RRSS creada exitosamente' }) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error in rrss/publicaciones POST', error instanceof Error ? error : undefined, { module: 'rrss' });
      return apiServerError() as unknown as NextResponse;
    }
  }
);
