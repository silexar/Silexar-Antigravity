/**
 * GET  /api/registro-emision/verificaciones  — Listar verificaciones
 * POST /api/registro-emision/verificaciones  — Crear verificación
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { logger } from '@/lib/observability';

import {
  DrizzleVerificacionEmisionRepository,
  CrearVerificacionUseCase,
} from '@/modules/registro-emision';

const repo = new DrizzleVerificacionEmisionRepository();
const crearUseCase = new CrearVerificacionUseCase(repo);

const createSchema = z.object({
  anuncianteId: z.string().uuid().optional(),
  campanaId: z.string().uuid().optional(),
  contratoId: z.string().uuid().optional(),
  fechaBusqueda: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  horaInicio: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/),
  horaFin: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/),
  emisorasIds: z.array(z.string().uuid()).default([]),
  registrosAireIds: z.array(z.string().uuid()).default([]),
  materialesIds: z.array(z.string().uuid()).default([]),
  tiposMaterial: z.array(z.enum(['audio_pregrabado', 'mencion_vivo', 'presentacion', 'cierre'])).default([]),
  toleranciaMinutos: z.number().int().min(0).max(60).optional(),
  sensibilidadPorcentaje: z.number().int().min(0).max(100).optional(),
});

export const GET = withApiRoute(
  { resource: 'emisiones', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const { searchParams } = new URL(req.url);
      const pagina = Math.max(0, parseInt(searchParams.get('pagina') || '0', 10));
      const tamano = Math.min(Math.max(1, parseInt(searchParams.get('tamano') || '20', 10)), 100);
      const estado = searchParams.get('estado') || undefined;
      const campanaId = searchParams.get('campanaId') || undefined;

      const result = await repo.listar(
        { tenantId: ctx.tenantId, estado: estado as any, campanaId },
        pagina,
        tamano,
      );

      return apiSuccess(result.datos.map(v => ({
        id: v.id,
        estado: v.estado.valor,
        progresoPorcentaje: v.progresoPorcentaje,
        fechaBusqueda: v.fechaBusqueda,
        rangoHorario: v.rangoHorario.toJSON(),
        materialesEncontrados: v.materialesEncontrados,
        materialesNoEncontrados: v.materialesNoEncontrados,
        accuracyPromedio: v.accuracyPromedio,
        creadoEn: v.creadoEn,
      })), 200, {
        pagination: {
          total: result.total,
          pagina: result.pagina,
          tamanoPagina: result.tamanoPagina,
          totalPaginas: result.totalPaginas,
        },
      }) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error in verificaciones GET', error instanceof Error ? error : undefined, { module: 'registro-emision', action: 'GET' });
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

      const { fechaBusqueda: _fb, ...rest } = parsed.data;
      const result = await crearUseCase.execute({
        tenantId: ctx.tenantId,
        ejecutivoId: ctx.userId,
        fechaBusqueda: new Date(parsed.data.fechaBusqueda),
        ...rest,
      });

      return apiSuccess(result, 201, { message: 'Verificación creada exitosamente' }) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error in verificaciones POST', error instanceof Error ? error : undefined, { module: 'registro-emision', action: 'POST' });
      return apiServerError() as unknown as NextResponse;
    }
  }
);
