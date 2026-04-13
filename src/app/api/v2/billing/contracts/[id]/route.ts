import { NextRequest } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiUnauthorized, apiServerError, getUserContext, apiForbidden} from '@/lib/api/response';
import { checkPermission } from '@/lib/security/rbac';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const ctx = getUserContext(request);
  if (!ctx.userId) return apiUnauthorized();

  const perm = checkPermission(ctx, 'campanas', 'read');
  if (!perm) return apiForbidden();
  try {
    return apiSuccess({ id: params.id });
  } catch (error) {
    logger.error('[API/V2/Billing/Contracts] Error:', error instanceof Error ? error : undefined);
    return apiServerError();
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const ctx = getUserContext(request);
  if (!ctx.userId) return apiUnauthorized();
  try {
    const body = await request.json();
    return apiSuccess({ id: params.id, ...body });
  } catch (error) {
    logger.error('[API/V2/Billing/Contracts] Error:', error instanceof Error ? error : undefined);
    return apiServerError();
  }
}
