/**
 * SILEXAR PULSE - API Aprobaciones de Campaña TIER 0
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability';
import { apiSuccess, apiServerError } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';

type Nivel = 'COMERCIAL' | 'TECNICO' | 'FINANCIERO';
type Estado = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

const store: Record<string, { id: string, nivel: Nivel, estado: Estado, solicitante: string, observacion?: string, ts: number }[]> = {};

/**
 * GET - Listar aprobaciones
 * Requiere: campanas:read
 */
export const GET = withApiRoute(
  { resource: 'campanas', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        // Extraer ID de campaña de la URL
        const url = new URL(req.url);
        const pathParts = url.pathname.split('/');
        const campanaId = pathParts[pathParts.indexOf('campanas') + 1];
        
        return NextResponse.json({ 
          success: true, 
          items: store[campanaId] || [],
          campanaId,
          consultadoPor: ctx.userId
        }, { status: 200 });
      });
    } catch (error) {
      logger.error('[API/Campanas/Aprobaciones] Error GET:', error instanceof Error ? error : undefined, { 
        module: 'campanas/aprobaciones', 
        action: 'GET',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);

/**
 * POST - Solicitar aprobación
 * Requiere: campanas:update
 */
export const POST = withApiRoute(
  { resource: 'campanas', action: 'update' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        // Extraer ID de campaña de la URL
        const url = new URL(req.url);
        const pathParts = url.pathname.split('/');
        const campanaId = pathParts[pathParts.indexOf('campanas') + 1];
        
        const body = await req.json().catch((_e) => null);
        const item = {
          id: `apr_${crypto.randomUUID()}`,
          nivel: ((body?.nivel) || 'COMERCIAL') as Nivel,
          estado: 'PENDIENTE' as Estado,
          solicitante: ctx.userId,
          ts: Date.now()
        };
        
        store[campanaId] = [item, ...(store[campanaId] || [])];
        
        return NextResponse.json({ 
          success: true, 
          item,
          campanaId,
          timestamp: new Date().toISOString()
        }, { status: 201 });
      });
    } catch (error) {
      logger.error('[API/Campanas/Aprobaciones] Error POST:', error instanceof Error ? error : undefined, { 
        module: 'campanas/aprobaciones', 
        action: 'POST',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);

/**
 * PATCH - Resolver aprobación
 * Requiere: campanas:update
 */
export const PATCH = withApiRoute(
  { resource: 'campanas', action: 'update' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        // Extraer ID de campaña de la URL
        const url = new URL(req.url);
        const pathParts = url.pathname.split('/');
        const campanaId = pathParts[pathParts.indexOf('campanas') + 1];
        
        const body = await req.json().catch((_e) => null);
        const { id, estado, observacion } = body ?? {};
        const list = store[campanaId] || [];
        const found = list.find(x => x.id === id);
        
        if (!found) {
          return NextResponse.json({ success: false, error: 'NOT_FOUND' }, { status: 404 });
        }
        
        found.estado = (estado || 'APROBADO') as Estado;
        found.observacion = observacion;
        
        return NextResponse.json({ 
          success: true, 
          item: found,
          resueltoPor: ctx.userId,
          timestamp: new Date().toISOString()
        }, { status: 200 });
      });
    } catch (error) {
      logger.error('[API/Campanas/Aprobaciones] Error PATCH:', error instanceof Error ? error : undefined, { 
        module: 'campanas/aprobaciones', 
        action: 'PATCH',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);
