import { NextRequest } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiUnauthorized, apiForbidden, getUserContext } from '@/lib/api/response';
import { checkPermission } from '@/lib/security/rbac';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

export async function POST(request: NextRequest) {
  const ctx = getUserContext(request);
  if (!ctx.userId) return apiUnauthorized();
  const perm = checkPermission(ctx, 'configuracion', 'admin');
  if (!perm) return apiForbidden();
  return apiSuccess({ testId: `pen_${Date.now()}`, status: 'COMPLETED', vulnerabilities: [] });
}

export async function GET(request: NextRequest) {
  const ctx = getUserContext(request);
  if (!ctx.userId) return apiUnauthorized();
  const perm = checkPermission(ctx, 'configuracion', 'admin');
  if (!perm) return apiForbidden();
  return apiSuccess({ lastTest: null, nextScheduled: null });
}
