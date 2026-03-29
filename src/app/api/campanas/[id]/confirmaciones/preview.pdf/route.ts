import { NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: { pdfUrl: '/preview.pdf' } });
  } catch (error) {
    logger.error('[API/Campanas/Confirmaciones/Preview] Error GET:', error instanceof Error ? error : undefined, { module: 'campanas/confirmaciones/preview', action: 'GET' })
    return apiServerError()
  }
}
