/**
 * GET /api/rrss/callback/:plataforma
 *
 * OAuth callback para conectar cuentas RRSS.
 * Este endpoint es público (el usuario llega desde la plataforma externa).
 */

import { NextResponse } from 'next/server';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError } from '@/lib/api/response';

export const GET = withApiRoute(
  { resource: 'rrss', action: 'read', skipCsrf: true, allowPublic: true },
  async ({ req }) => {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      return apiError('OAUTH_ERROR', errorDescription || error, 400) as unknown as NextResponse;
    }

    if (!code || !state) {
      return apiError('VALIDATION_ERROR', 'Faltan parámetros code o state', 400) as unknown as NextResponse;
    }

    // TODO: Intercambiar code por access_token con la API de la plataforma
    // y redirigir al frontend con el resultado.
    // Por ahora devolvemos un placeholder informativo.

    return apiSuccess({
      code,
      state,
      message: 'OAuth callback recibido. Implementar intercambio de token con la plataforma.',
    }) as unknown as NextResponse;
  }
);
