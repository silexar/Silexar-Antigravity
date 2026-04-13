/**
 * SILEXAR PULSE - API Propiedades Sugerencias TIER 0
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
 * POST - Obtener sugerencias de propiedades
 * Requiere: campanas:read
 */
export const POST = withApiRoute(
  { resource: 'campanas', action: 'read' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const body = await req.json().catch((_e) => null);
        const { anunciante, tipoCampana } = body || {};

        // Sugerencias simples basadas en contexto
        const sugerencias: Array<Record<string, unknown>> = [];
        if (tipoCampana === 'AUSPICIO') {
          sugerencias.push({ id: 'posicion_fija', nombre: 'Posición Fija', tipo: 'SELECT', categoria: 'programacion', opciones: ['INICIO', 'SEGUNDO', 'ULTIMO'], requerida: false, descripcion: 'Ubicación fija recomendada' });
        }
        if (anunciante && String(anunciante).toLowerCase().includes('banco')) {
          sugerencias.push({ id: 'bloques_preferentes', nombre: 'Bloques Preferentes', tipo: 'SELECT', categoria: 'programacion', opciones: ['AM', 'PRIME'], requerida: false, descripcion: 'Optimiza alcance financiero' });
        }

        return NextResponse.json({ 
          success: true, 
          sugerencias,
          generadoPor: ctx.userId
        }, { status: 200, headers: baseHeaders });
      });
    } catch (error) {
      logger.error('[API/Campanas/Propiedades/Sugerencias] Error POST:', error instanceof Error ? error : undefined, { 
        module: 'campanas/propiedades/sugerencias', 
        action: 'POST',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);
