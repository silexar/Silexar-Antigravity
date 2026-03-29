import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    return NextResponse.json({ success: true, data: { campanaId: params.id, historial: [] } });
  } catch (error) {
    logger.error('[API/Campanas/Historial] Error GET:', error instanceof Error ? error : undefined, { module: 'campanas/historial', action: 'GET' })
    return apiServerError()
  }
}
