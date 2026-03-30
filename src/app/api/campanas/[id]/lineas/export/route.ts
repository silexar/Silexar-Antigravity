import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    return NextResponse.json({ success: true, data: { campanaId: params.id, exportedAt: new Date().toISOString() } });
  } catch (error) {
    logger.error('[API/Campanas/Lineas/Export] Error GET:', error instanceof Error ? error : undefined, { module: 'campanas/lineas/export', action: 'GET' })
    return apiServerError()
  }
}
