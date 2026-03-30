import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { verifyAudit } from '@/lib/security/audit-trail'
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ok = verifyAudit(params.id)
    return NextResponse.json({ success: ok }, { status: ok ? 200 : 500 })
  } catch (error) {
    logger.error('[API/Campanas/Audit/Verify] Error GET:', error instanceof Error ? error : undefined, { module: 'campanas/audit/verify', action: 'GET' })
    return apiServerError()
  }
}

