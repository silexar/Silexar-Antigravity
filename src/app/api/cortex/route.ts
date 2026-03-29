import { NextRequest } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { AuditEventType, AuditSeverity } from '@/lib/security/audit-types';
import { withTenantContext } from '@/lib/db/tenant-context';
import { checkPermission } from '@/lib/security/rbac';
import { cortexRateLimiter } from '@/lib/security/rate-limiter';

// Zod schema for POST body
const CortexCommandSchema = z.object({
  engine: z.string().min(1, 'engine es requerido').optional(),
  action: z.string().min(1, 'action es requerida').optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(request: NextRequest) {
  // 1. Rate limit check (cortex: 50/min)
  const rl = await cortexRateLimiter.checkRateLimit(request);
  if (!rl.success) return apiError('RATE_LIMIT', 'Too many requests', 429);

  // 2. Extract auth context
  const ctx = getUserContext(request);
  if (!ctx.userId) return apiUnauthorized();

  // 3. Check permissions — dashboard read to view cortex status
  if (!checkPermission(ctx, 'dashboard', 'read')) return apiForbidden();

  try {
    const result = await withTenantContext(ctx.tenantId, async () => {
      return {
        status: 'ACTIVE',
        engines: ['creative', 'audience', 'sense'],
        tenantId: ctx.tenantId,
      };
    });

    return apiSuccess(result);
  } catch (error) {
    logger.error('[API/Cortex] Error GET:', error instanceof Error ? error : undefined, { module: 'cortex' });
    return apiServerError();
  }
}

export async function POST(request: NextRequest) {
  // 1. Rate limit check (cortex: 50/min)
  const rl = await cortexRateLimiter.checkRateLimit(request);
  if (!rl.success) return apiError('RATE_LIMIT', 'Too many requests', 429);

  // 2. Extract auth context
  const ctx = getUserContext(request);
  if (!ctx.userId) return apiUnauthorized();

  // 3. Validate input with Zod
  let body: unknown;
  try { body = await request.json(); } catch { return apiError('INVALID_JSON', 'Invalid JSON', 400); }
  const parsed = CortexCommandSchema.safeParse(body);
  if (!parsed.success) return apiError('VALIDATION_ERROR', 'Invalid input', 422, parsed.error.flatten());

  // 4. Check permissions — admin-level to issue cortex commands
  if (!checkPermission(ctx, 'configuracion', 'admin')) return apiForbidden();

  try {
    const result = await withTenantContext(ctx.tenantId, async () => {
      return {
        processed: true,
        engine: parsed.data.engine,
        action: parsed.data.action,
        tenantId: ctx.tenantId,
      };
    });

    // 5. Audit log
    auditLogger.logEvent({
      eventType: AuditEventType.ADMIN_ACTION,
      severity: AuditSeverity.MEDIUM,
      userId: ctx.userId,
      userRole: ctx.role,
      resource: 'cortex',
      action: 'cortex_command',
      details: { engine: parsed.data.engine, action: parsed.data.action, tenantId: ctx.tenantId },
      success: true,
    });

    return apiSuccess(result);
  } catch (error) {
    logger.error('[API/Cortex] Error POST:', error instanceof Error ? error : undefined, { module: 'cortex' });
    return apiServerError();
  }
}
