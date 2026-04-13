import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';
import { withApiRoute } from '@/lib/api/with-api-route';

export const GET = withApiRoute(
  { resource: 'campanas', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      // Extraer ID de la URL
      const url = new URL(req.url);
      const pathParts = url.pathname.split('/');
      const id = pathParts[pathParts.length - 2]; // /campanas/[id]/materiales
      
      return NextResponse.json({ success: true, data: { campanaId: id, materiales: [] } });
    } catch (error) {
      logger.error('[API/Campanas/Materiales] Error GET:', error instanceof Error ? error : undefined, { module: 'campanas/materiales', action: 'GET' })
      return apiServerError()
    }
  }
);

export const POST = withApiRoute(
  { resource: 'campanas', action: 'create' },
  async ({ ctx, req }) => {
    try {
      // Extraer ID de la URL
      const url = new URL(req.url);
      const pathParts = url.pathname.split('/');
      const id = pathParts[pathParts.length - 2]; // /campanas/[id]/materiales
      
      const body = await req.json();
      return NextResponse.json({ success: true, data: { id: `mat_${Date.now()}`, campanaId: id, ...body } });
    } catch (error) {
      logger.error('[API/Campanas/Materiales] Error POST:', error instanceof Error ? error : undefined, { module: 'campanas/materiales', action: 'POST' })
      return apiServerError()
    }
  }
);
