import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    return NextResponse.json({ success: true, data: { campanaId: params.id, materiales: [] } });
  } catch (error) {
    logger.error('[API/Campanas/Materiales] Error GET:', error instanceof Error ? error : undefined, { module: 'campanas/materiales', action: 'GET' })
    return apiServerError()
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, data: { id: `mat_${Date.now()}`, campanaId: params.id, ...body } });
  } catch (error) {
    logger.error('[API/Campanas/Materiales] Error POST:', error instanceof Error ? error : undefined, { module: 'campanas/materiales', action: 'POST' })
    return apiServerError()
  }
}
