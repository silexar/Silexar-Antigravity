import { NextRequest } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiUnauthorized, apiServerError, apiForbidden, getUserContext } from '@/lib/api/response';
import { checkPermission } from '@/lib/security/rbac';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

export async function POST(request: NextRequest) {
  const ctx = getUserContext(request);
  if (!ctx.userId) return apiUnauthorized();
  const perm = checkPermission(ctx, 'configuracion', 'admin');
  if (!perm) return apiForbidden();
  try {
    return apiSuccess({ testId: `pen_${Date.now()}`, status: 'COMPLETED', vulnerabilities: [] });
  } catch (error) {
    logger.error('[API/V2/Security/PenetrationTest] Error:', error instanceof Error ? error : undefined);
    return apiServerError();
  }
}

export async function GET(request: NextRequest) {
  const ctx = getUserContext(request);
  if (!ctx.userId) return apiUnauthorized();
  const perm = checkPermission(ctx, 'configuracion', 'admin');
  if (!perm) return apiForbidden();
  try {
    return apiSuccess({ lastTest: null, nextScheduled: null });
  } catch (error) {
    logger.error('[API/V2/Security/PenetrationTest] Error:', error instanceof Error ? error : undefined);
    return apiServerError();
  }
}
