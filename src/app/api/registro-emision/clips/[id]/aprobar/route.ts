/**
 * POST /api/registro-emision/clips/[id]/aprobar
 * Aprueba un clip de evidencia y genera certificado.
 */

import { NextResponse } from 'next/server';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { logger } from '@/lib/observability';

import {
  DrizzleClipEvidenciaRepository,
  DrizzleVerificacionEmisionRepository,
  CertificateGeneratorStub,
  AprobarClipUseCase,
} from '@/modules/registro-emision';

function extractId(req: Request): string {
  const url = new URL(req.url);
  const parts = url.pathname.split('/');
  return parts[parts.length - 2] || '';
}

export const POST = withApiRoute(
  { resource: 'emisiones', action: 'update' },
  async ({ ctx, req }) => {
    try {
      const id = extractId(req);
      if (!id) {
        return apiError('VALIDATION_ERROR', 'ID de clip requerido', 400) as unknown as NextResponse;
      }

      const useCase = new AprobarClipUseCase(
        new DrizzleClipEvidenciaRepository(),
        new DrizzleVerificacionEmisionRepository(),
        new CertificateGeneratorStub(),
      );

      const result = await useCase.execute({
        clipId: id,
        tenantId: ctx.tenantId,
        aprobadoPorId: ctx.userId,
      });

      return apiSuccess(result, 200, { message: 'Clip aprobado y certificado generado' }) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error aprobando clip', error instanceof Error ? error : undefined, { module: 'registro-emision', action: 'APROBAR_CLIP' });
      return apiServerError() as unknown as NextResponse;
    }
  }
);
