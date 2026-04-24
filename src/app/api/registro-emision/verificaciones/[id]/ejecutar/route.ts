/**
 * POST /api/registro-emision/verificaciones/[id]/ejecutar
 * Ejecuta la verificación de emisión (Shazam Militar).
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { logger } from '@/lib/observability';

import {
  DrizzleVerificacionEmisionRepository,
  DrizzleRegistroAireRepository,
  DrizzleRegistroDeteccionRepository,
  AudioFingerprintStub,
  SpeechToTextStub,
  EjecutarVerificacionUseCase,
} from '@/modules/registro-emision';

const schema = z.object({
  materiales: z.array(z.object({
    id: z.string().uuid(),
    nombre: z.string().min(1),
    tipo: z.enum(['audio_pregrabado', 'mencion_vivo', 'presentacion', 'cierre']),
    url: z.string().optional(),
    palabrasClave: z.array(z.string()).optional(),
    spxCode: z.string().optional(),
  })).min(1),
});

function extractId(req: Request): string {
  const url = new URL(req.url);
  const parts = url.pathname.split('/');
  // /api/registro-emision/verificaciones/[id]/ejecutar
  return parts[parts.length - 2] || '';
}

export const POST = withApiRoute(
  { resource: 'emisiones', action: 'update' },
  async ({ ctx, req }) => {
    try {
      const id = extractId(req);
      if (!id) {
        return apiError('VALIDATION_ERROR', 'ID de verificación requerido', 400) as unknown as NextResponse;
      }

      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse;
      }

      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Error en la validación de los datos', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
      }

      const useCase = new EjecutarVerificacionUseCase(
        new DrizzleVerificacionEmisionRepository(),
        new DrizzleRegistroAireRepository(),
        new AudioFingerprintStub(),
        new SpeechToTextStub(),
        new DrizzleRegistroDeteccionRepository(),
      );

      const result = await useCase.execute({
        verificacionId: id,
        tenantId: ctx.tenantId,
        ejecutadoPorId: ctx.userId,
        materiales: parsed.data.materiales,
      });

      return apiSuccess(result, 200, { message: 'Verificación ejecutada' }) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error ejecutando verificación', error instanceof Error ? error : undefined, { module: 'registro-emision', action: 'EJECUTAR' });
      return apiServerError() as unknown as NextResponse;
    }
  }
);
