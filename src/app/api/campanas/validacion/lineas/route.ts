/**
 * SILEXAR PULSE - API Validación Líneas TIER 0
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability';
import { apiSuccess, apiServerError } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';

const baseHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
}

/**
 * POST - Validar líneas de campaña
 * Requiere: campanas:read
 */
export const POST = withApiRoute(
  { resource: 'campanas', action: 'read' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const body = await req.json().catch((_e) => null);
        const lineas = Array.isArray(body) ? body : body?.lineas || [];

        const conflictos: string[] = [];
        lineas.forEach((l: Record<string, unknown>, idx: number) => {
          if (!l.emisora) conflictos.push(`Línea ${idx + 1}: emisora faltante`);
          if (!l.bloque) conflictos.push(`Línea ${idx + 1}: bloque no definido`);
          if (l.horaInicio && l.horaFin && l.horaInicio >= l.horaFin) conflictos.push(`Línea ${idx + 1}: rango horario inválido`);
        });

        return NextResponse.json({ 
          success: true, 
          todasValidas: conflictos.length === 0, 
          conflictos,
          validadoPor: ctx.userId
        }, { status: 200, headers: baseHeaders });
      });
    } catch (error) {
      logger.error('[API/Campanas/Validacion/Lineas] Error POST:', error instanceof Error ? error : undefined, { 
        module: 'campanas/validacion/lineas', 
        action: 'POST',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);
