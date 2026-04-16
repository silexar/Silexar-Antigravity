/**
 * GET /api/digital/especificaciones  — Obtener por campana/contrato
 * POST /api/digital/especificaciones — Crear especificacion digital
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { logger } from '@/lib/observability';

import { EspecificacionDigitalDrizzleRepository } from '@/modules/digital/infrastructure/repositories/EspecificacionDigitalDrizzleRepository';
import { CrearEspecificacionDigitalHandler } from '@/modules/digital/application/handlers/CrearEspecificacionDigitalHandler';
import { CrearEspecificacionDigitalCommand } from '@/modules/digital/application/commands/CrearEspecificacionDigitalCommand';
import { ObtenerEspecificacionDigitalHandler } from '@/modules/digital/application/handlers/ObtenerEspecificacionDigitalHandler';
import { ObtenerEspecificacionDigitalQuery } from '@/modules/digital/application/queries/ObtenerEspecificacionDigitalQuery';

const repository = new EspecificacionDigitalDrizzleRepository();
const crearHandler = new CrearEspecificacionDigitalHandler(repository);
const obtenerHandler = new ObtenerEspecificacionDigitalHandler(repository);

const createSchema = z.object({
  campanaId: z.string().uuid().optional(),
  contratoId: z.string().uuid().optional(),
  plataformas: z.array(z.string()).default([]),
  presupuestoDigital: z.number().min(0).optional(),
  moneda: z.string().max(3).default('CLP'),
  tipoPresupuesto: z.enum(['diario', 'total']).optional(),
  objetivos: z.record(z.string(), z.any()).optional(),
  trackingLinks: z.array(z.string()).default([]),
  configuracionTargeting: z.record(z.string(), z.any()).optional(),
  estado: z.string().max(50).default('borrador'),
  notas: z.string().optional(),
}).refine(data => data.campanaId || data.contratoId, {
  message: 'Debe especificar al menos campanaId o contratoId',
});

export const GET = withApiRoute(
  { resource: 'digital', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const { searchParams } = new URL(req.url);
      const campanaId = searchParams.get('campanaId') || '';
      const contratoId = searchParams.get('contratoId') || '';

      if (!campanaId && !contratoId) {
        return apiError('VALIDATION_ERROR', 'Debe proporcionar campanaId o contratoId', 400) as unknown as NextResponse;
      }

      const query = new ObtenerEspecificacionDigitalQuery({
        tenantId: ctx.tenantId,
        ...(campanaId && { campanaId }),
        ...(contratoId && { contratoId }),
      });

      const result = await obtenerHandler.execute(query);
      if (!result.ok) {
        return apiError('SERVER_ERROR', result.error.message, 500) as unknown as NextResponse;
      }

      return apiSuccess(result.data ? result.data.toJSON() : null) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error in digital/especificaciones GET', error instanceof Error ? error : undefined, { module: 'digital' });
      return apiServerError() as unknown as NextResponse;
    }
  }
);

export const POST = withApiRoute(
  { resource: 'digital', action: 'create' },
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

      const command = new CrearEspecificacionDigitalCommand({
        tenantId: ctx.tenantId,
        creadoPorId: ctx.userId,
        ...parsed.data,
      });

      const result = await crearHandler.execute(command);
      if (!result.ok) {
        return apiError('SERVER_ERROR', result.error.message, 500) as unknown as NextResponse;
      }

      return apiSuccess(result.data.toJSON(), 201, { message: 'Especificacion digital creada exitosamente' }) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error in digital/especificaciones POST', error instanceof Error ? error : undefined, { module: 'digital' });
      return apiServerError() as unknown as NextResponse;
    }
  }
);
