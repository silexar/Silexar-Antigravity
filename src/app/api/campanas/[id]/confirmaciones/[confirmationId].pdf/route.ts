import { NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

export async function GET() {
  try {
    return new NextResponse('PDF Content', { status: 200, headers: { 'Content-Type': 'application/pdf' } });
  } catch (error) {
    logger.error('[API/Campanas/Confirmaciones/PDF] Error GET:', error instanceof Error ? error : undefined, { module: 'campanas/confirmaciones/pdf', action: 'GET' })
    return apiServerError()
  }
}
