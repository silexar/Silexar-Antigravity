/**
 * SILEXAR PULSE - API Validación Formulario TIER 0
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
 * POST - Validar formulario de campaña
 * Requiere: campanas:read
 */
export const POST = withApiRoute(
  { resource: 'campanas', action: 'read' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const body = await req.json().catch((_e) => null)
        const validaciones: Array<{ campo: string; tipo: string; mensaje: string; sugerencia?: string; autoCorregible: boolean; criticidad: string }> = []
        const correccionesAutomaticas: Record<string, unknown> = {}

        if (!body?.nombreCampana || String(body.nombreCampana).length < 3) {
          validaciones.push({ campo: 'nombreCampana', tipo: 'ERROR', mensaje: 'Nombre de campaña es obligatorio', autoCorregible: false, criticidad: 'ALTA' })
        }
        if (body?.comisionAgencia && (body.comisionAgencia < 0 || body.comisionAgencia > 25)) {
          validaciones.push({ campo: 'comisionAgencia', tipo: 'WARNING', mensaje: 'Comisión agencia fuera de rango (0-25%)', sugerencia: 'Ajustar al 15%', autoCorregible: true, criticidad: 'MEDIA' })
          correccionesAutomaticas['comisionAgencia'] = 15
        }

        return NextResponse.json({ 
          success: true, 
          validaciones, 
          correccionesAutomaticas,
          validadoPor: ctx.userId
        }, { status: 200, headers: baseHeaders });
      });
    } catch (error) {
      logger.error('[API/Campanas/Validacion/Formulario] Error POST:', error instanceof Error ? error : undefined, { 
        module: 'campanas/validacion/formulario', 
        action: 'POST',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);
