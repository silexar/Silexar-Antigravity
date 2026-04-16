/**
 * POST /api/rrss/publicaciones/:id/publicar
 */

import { NextResponse } from 'next/server';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { logger } from '@/lib/observability';

import { RrssPublicacionDrizzleRepository } from '@/modules/rrss/infrastructure/repositories/RrssPublicacionDrizzleRepository';
import { RrssConnectionDrizzleRepository } from '@/modules/rrss/infrastructure/repositories/RrssConnectionDrizzleRepository';
import { CryptoTokenService } from '@/modules/rrss/infrastructure/services/CryptoTokenService';
import { RrssPublisherService } from '@/modules/rrss/infrastructure/services/RrssPublisherService';
import { PublicarAhoraRrssCommand } from '@/modules/rrss/application/commands/PublicarAhoraRrssCommand';
import { PublicarAhoraRrssHandler } from '@/modules/rrss/application/handlers/PublicarAhoraRrssHandler';

const pubRepo = new RrssPublicacionDrizzleRepository();
const connRepo = new RrssConnectionDrizzleRepository();
const cryptoService = new CryptoTokenService(
  process.env.RRSS_TOKEN_SECRET || 'silexar-rrss-default-secret-key-must-be-32-chars-long'
);
const publisher = new RrssPublisherService(cryptoService);
const publicarHandler = new PublicarAhoraRrssHandler(pubRepo, connRepo, publisher);

export const POST = withApiRoute(
  { resource: 'rrss', action: 'update' },
  async ({ ctx, req }) => {
    try {
      const segments = new URL(req.url).pathname.split('/');
      const id = segments[segments.length - 2];

      const command = new PublicarAhoraRrssCommand({
        id,
        tenantId: ctx.tenantId,
      });

      const result = await publicarHandler.execute(command);
      if (!result.ok) {
        return apiError('SERVER_ERROR', result.error.message, 500) as unknown as NextResponse;
      }

      return apiSuccess(result.data.toJSON(), 200, { message: 'Publicación RRSS publicada exitosamente' }) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error in rrss/publicaciones/[id]/publicar POST', error instanceof Error ? error : undefined, { module: 'rrss' });
      return apiServerError() as unknown as NextResponse;
    }
  }
);
