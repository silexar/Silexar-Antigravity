/**
 * SILEXAR PULSE - API Backup de Campaña TIER 0
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability';
import { apiSuccess, apiServerError } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';
import { createBackup, listBackups } from '@/lib/backup/state-backup'
import { withTenantContext } from '@/lib/db/tenant-context';

/**
 * GET - Listar backups
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
        
        const versions = listBackups(campanaId);
        return NextResponse.json({ 
          success: true, 
          versions,
          campanaId,
          consultadoPor: ctx.userId
        }, { status: 200 });
      });
    } catch (error) {
      logger.error('[API/Campanas/Backup] Error GET:', error instanceof Error ? error : undefined, { 
        module: 'campanas/backup', 
        action: 'GET',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);

/**
 * POST - Crear backup
 * Requiere: campanas:update (solo TM_SENIOR o PROGRAMADOR)
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
        const state = body?.state ?? { note: 'no-state-provided' };
        const { version } = createBackup(campanaId, state);
        
        return NextResponse.json({ 
          success: true, 
          version,
          campanaId,
          creadoPor: ctx.userId,
          timestamp: new Date().toISOString()
        }, { status: 201 });
      });
    } catch (error) {
      logger.error('[API/Campanas/Backup] Error POST:', error instanceof Error ? error : undefined, { 
        module: 'campanas/backup', 
        action: 'POST',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);
