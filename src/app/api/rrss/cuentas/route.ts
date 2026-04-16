/**
 * GET /api/rrss/cuentas
 * POST /api/rrss/cuentas
 * DELETE /api/rrss/cuentas (body con id)
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { logger } from '@/lib/observability';

import { RrssConnectionDrizzleRepository } from '@/modules/rrss/infrastructure/repositories/RrssConnectionDrizzleRepository';
import { CryptoTokenService } from '@/modules/rrss/infrastructure/services/CryptoTokenService';
import { ConectarCuentaRrssCommand } from '@/modules/rrss/application/commands/ConectarCuentaRrssCommand';
import { EliminarCuentaRrssCommand } from '@/modules/rrss/application/commands/EliminarCuentaRrssCommand';
import { ConectarCuentaRrssHandler } from '@/modules/rrss/application/handlers/ConectarCuentaRrssHandler';
import { EliminarCuentaRrssHandler } from '@/modules/rrss/application/handlers/EliminarCuentaRrssHandler';
import { ListarCuentasRrssHandler } from '@/modules/rrss/application/handlers/ListarCuentasRrssHandler';
import { ListarCuentasRrssQuery } from '@/modules/rrss/application/queries/ListarCuentasRrssQuery';

const repository = new RrssConnectionDrizzleRepository();
const cryptoService = new CryptoTokenService(
  process.env.RRSS_TOKEN_SECRET || 'silexar-rrss-default-secret-key-must-be-32-chars-long'
);
const conectarHandler = new ConectarCuentaRrssHandler(repository, cryptoService);
const eliminarHandler = new EliminarCuentaRrssHandler(repository);
const listarHandler = new ListarCuentasRrssHandler(repository);

const connectSchema = z.object({
  plataforma: z.enum(['instagram', 'facebook', 'tiktok', 'linkedin', 'twitter', 'youtube']),
  accountId: z.string().min(1),
  accountName: z.string().optional(),
  accountAvatar: z.string().url().optional(),
  accessToken: z.string().min(1),
  refreshToken: z.string().optional(),
  scopes: z.array(z.string()).default([]),
  expiresAt: z.coerce.date().optional(),
});

const deleteSchema = z.object({
  id: z.string().uuid(),
});

export const GET = withApiRoute(
  { resource: 'rrss', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const { searchParams } = new URL(req.url);
      const plataforma = searchParams.get('plataforma') || undefined;

      const query = new ListarCuentasRrssQuery({ tenantId: ctx.tenantId, plataforma });
      const result = await listarHandler.execute(query);

      if (!result.ok) {
        return apiError('SERVER_ERROR', result.error.message, 500) as unknown as NextResponse;
      }

      return apiSuccess(result.data.map((c) => c.toJSON())) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error in rrss/cuentas GET', error instanceof Error ? error : undefined, { module: 'rrss' });
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

      const parsed = connectSchema.safeParse(body);
      if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Error en validacion', 400, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
      }

      const command = new ConectarCuentaRrssCommand({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        ...parsed.data,
      });

      const result = await conectarHandler.execute(command);
      if (!result.ok) {
        return apiError('SERVER_ERROR', result.error.message, 500) as unknown as NextResponse;
      }

      return apiSuccess(result.data.toJSON(), 201, { message: 'Cuenta RRSS conectada exitosamente' }) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error in rrss/cuentas POST', error instanceof Error ? error : undefined, { module: 'rrss' });
      return apiServerError() as unknown as NextResponse;
    }
  }
);

export const DELETE = withApiRoute(
  { resource: 'rrss', action: 'delete' },
  async ({ ctx, req }) => {
    try {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse;
      }

      const parsed = deleteSchema.safeParse(body);
      if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Error en validacion', 400, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
      }

      const command = new EliminarCuentaRrssCommand({
        id: parsed.data.id,
        tenantId: ctx.tenantId,
      });

      const result = await eliminarHandler.execute(command);
      if (!result.ok) {
        return apiError('SERVER_ERROR', result.error.message, 500) as unknown as NextResponse;
      }

      return apiSuccess(null, 200, { message: 'Cuenta RRSS eliminada exitosamente' }) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error in rrss/cuentas DELETE', error instanceof Error ? error : undefined, { module: 'rrss' });
      return apiServerError() as unknown as NextResponse;
    }
  }
);
