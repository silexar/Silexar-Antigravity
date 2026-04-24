/**
 * GET  /api/registro-emision/registros-aire  — Listar registros de aire
 * POST /api/registro-emision/registros-aire  — Crear registro de aire
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { logger } from '@/lib/observability';

import {
  DrizzleRegistroAireRepository,
  CrearRegistroAireUseCase,
} from '@/modules/registro-emision';

const repo = new DrizzleRegistroAireRepository();
const crearUseCase = new CrearRegistroAireUseCase(repo);

const createSchema = z.object({
  emisoraId: z.string().uuid(),
  fechaEmision: z.string().datetime(),
  urlArchivo: z.string().min(1),
  duracionSegundos: z.number().int().positive(),
  formato: z.string().min(1).max(10),
  tamanioBytes: z.number().int().positive().optional(),
  hashSha256: z.string().length(64).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const GET = withApiRoute(
  { resource: 'emisiones', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const { searchParams } = new URL(req.url);
      const pagina = Math.max(0, parseInt(searchParams.get('pagina') || '0', 10));
      const tamano = Math.min(Math.max(1, parseInt(searchParams.get('tamano') || '20', 10)), 100);
      const emisoraId = searchParams.get('emisoraId') || undefined;
      const estado = searchParams.get('estado') || undefined;

      const result = await repo.listar(
        { tenantId: ctx.tenantId, emisoraId, estado: estado as any },
        pagina,
        tamano,
      );

      return apiSuccess(result.datos.map(r => ({
        id: r.id,
        emisoraId: r.emisoraId,
        fechaEmision: r.fechaEmision,
        urlArchivo: r.urlArchivo,
        duracionSegundos: r.duracionSegundos,
        formato: r.formato,
        estado: r.estado.valor,
        hashSha256: r.hashSha256?.valor,
        creadoEn: r.creadoEn,
      })), 200, {
        pagination: {
          total: result.total,
          pagina: result.pagina,
          tamanoPagina: result.tamanoPagina,
          totalPaginas: result.totalPaginas,
        },
      }) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error in registros-aire GET', error instanceof Error ? error : undefined, { module: 'registro-emision', action: 'GET' });
      return apiServerError() as unknown as NextResponse;
    }
  }
);

export const POST = withApiRoute(
  { resource: 'emisiones', action: 'create' },
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
        return apiError('VALIDATION_ERROR', 'Error en la validación de los datos', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
      }

      const { fechaEmision: _fe, ...rest } = parsed.data;
      const result = await crearUseCase.execute({
        tenantId: ctx.tenantId,
        creadoPorId: ctx.userId,
        fechaEmision: new Date(parsed.data.fechaEmision),
        ...rest,
      });

      return apiSuccess(result, 201, { message: 'Registro de aire creado exitosamente' }) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error in registros-aire POST', error instanceof Error ? error : undefined, { module: 'registro-emision', action: 'POST' });
      return apiServerError() as unknown as NextResponse;
    }
  }
);
