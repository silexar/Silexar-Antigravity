/**
 * POST /api/registro-emision/accesos/validar
 * Valida un código de acceso y devuelve los clips disponibles.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { logger } from '@/lib/observability';

import {
  DrizzleLinkTemporalRepository,
  ValidarAccesoSeguroUseCase,
} from '@/modules/registro-emision';

const schema = z.object({
  codigoAcceso: z.string().min(4).max(12),
  tenantId: z.string().uuid(),
});

export const POST = withApiRoute(
  { resource: 'emisiones', action: 'read', skipCsrf: true, allowPublic: true },
  async ({ req }) => {
    try {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse;
      }

      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Código de acceso inválido', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
      }

      const ipAddress = req.headers.get('x-forwarded-for') || undefined;
      const userAgent = req.headers.get('user-agent') || undefined;

      const useCase = new ValidarAccesoSeguroUseCase(new DrizzleLinkTemporalRepository());
      const result = await useCase.execute({
        codigoAcceso: parsed.data.codigoAcceso,
        tenantId: parsed.data.tenantId,
        ipAddress,
        userAgent,
      });

      return apiSuccess(result, 200) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error validando acceso', error instanceof Error ? error : undefined, { module: 'registro-emision', action: 'VALIDAR_ACCESO' });
      if (error instanceof Error && error.message.includes('expirado')) {
        return apiError('ACCESS_EXPIRED', error.message, 410) as unknown as NextResponse;
      }
      if (error instanceof Error && error.message.includes('límite')) {
        return apiError('USAGE_LIMIT_REACHED', error.message, 403) as unknown as NextResponse;
      }
      return apiServerError() as unknown as NextResponse;
    }
  }
);
