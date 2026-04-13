import { NextRequest } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';

/**
 * GET - Obtener confirmaciones de campaña
 * Requiere: campanas:read
 */
export const GET = withApiRoute(
  { resource: 'campanas', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      // Extraer ID de campaña de la URL
      const url = new URL(req.url);
      const pathParts = url.pathname.split('/');
      const campanaId = pathParts[pathParts.indexOf('campanas') + 1];

      return await withTenantContext(ctx.tenantId, async () => {
        return apiSuccess({ 
          campanaId, 
          confirmaciones: [],
          estado: 'pendiente',
          totalConfirmaciones: 0,
          pendientes: 0,
          confirmadas: 0
        });
      });
    } catch (error) {
      logger.error('[API/Campanas/Confirmaciones] Error GET:', error instanceof Error ? error : undefined, { 
        module: 'campanas/confirmaciones', 
        action: 'GET',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);

/**
 * POST - Crear confirmación de campaña
 * Requiere: campanas:update
 */
export const POST = withApiRoute(
  { resource: 'campanas', action: 'update' },
  async ({ ctx, req }) => {
    try {
      const body = await req.json();
      
      // Extraer ID de campaña de la URL
      const url = new URL(req.url);
      const pathParts = url.pathname.split('/');
      const campanaId = pathParts[pathParts.indexOf('campanas') + 1];

      return await withTenantContext(ctx.tenantId, async () => {
        return apiSuccess({ 
          id: `conf_${Date.now()}`, 
          campanaId, 
          ...body,
          estado: 'confirmada',
          confirmadoPor: ctx.userId,
          fechaConfirmacion: new Date().toISOString()
        }, 201);
      });
    } catch (error) {
      logger.error('[API/Campanas/Confirmaciones] Error POST:', error instanceof Error ? error : undefined, { 
        module: 'campanas/confirmaciones', 
        action: 'POST',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);

/**
 * PUT - Actualizar confirmación
 * Requiere: campanas:update
 */
export const PUT = withApiRoute(
  { resource: 'campanas', action: 'update' },
  async ({ ctx, req }) => {
    try {
      const body = await req.json();

      return await withTenantContext(ctx.tenantId, async () => {
        return apiSuccess({ 
          ...body,
          actualizadoPor: ctx.userId,
          fechaActualizacion: new Date().toISOString()
        });
      });
    } catch (error) {
      logger.error('[API/Campanas/Confirmaciones] Error PUT:', error instanceof Error ? error : undefined, { 
        module: 'campanas/confirmaciones', 
        action: 'PUT',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);
