import { NextRequest } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiUnauthorized, getUserContext, apiForbidden} from '@/lib/api/response';
import { checkPermission } from '@/lib/security/rbac';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

export async function POST(request: NextRequest) {
  const ctx = getUserContext(request);
  if (!ctx.userId) return apiUnauthorized();

  const perm = checkPermission(ctx, 'campanas', 'read');
  if (!perm) return apiForbidden();
  const body = await request.json();
  return apiSuccess({ eventId: `evt_${Date.now()}`, type: 'NARRATIVE_PROGRESS', ...body });
}
