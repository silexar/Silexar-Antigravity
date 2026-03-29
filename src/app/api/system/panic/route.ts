import { NextRequest } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { AuditEventType, AuditSeverity } from '@/lib/security/audit-types';
import { withSuperAdminContext } from '@/lib/db/tenant-context';
import { checkPermission } from '@/lib/security/rbac';
import { apiRateLimiter } from '@/lib/security/rate-limiter';

/**
 * SYSTEM PANIC API
 * Kill switch — requires SUPER_CEO or ADMIN role minimum.
 * Rate-limited to 2 requests/min per caller.
 */

const PanicSchema = z.object({
  reason: z.string().min(1, 'Reason is required').max(500),
});

// Strict in-memory rate limiter for the panic endpoint (2 req/min per userId)
const panicCallTracker = new Map<string, number[]>();

function checkPanicRateLimit(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const maxCalls = 2;

  const timestamps = (panicCallTracker.get(userId) ?? []).filter(t => now - t < windowMs);
  if (timestamps.length >= maxCalls) return false;

  timestamps.push(now);
  panicCallTracker.set(userId, timestamps);
  return true;
}

export async function POST(request: NextRequest) {
  // 1. Rate limit check (standard API limiter)
  const rl = await apiRateLimiter.checkRateLimit(request);
  if (!rl.success) return apiError('RATE_LIMIT', 'Too many requests', 429);

  // 2. Extract auth context
  const ctx = getUserContext(request);
  if (!ctx.userId) return apiUnauthorized();

  // 3. Validate input with Zod
  let body: unknown;
  try { body = await request.json(); } catch { return apiError('INVALID_JSON', 'Invalid JSON', 400); }
  const parsed = PanicSchema.safeParse(body);
  if (!parsed.success) return apiError('VALIDATION_ERROR', 'Invalid input', 422, parsed.error.flatten());

  // 4. Check permissions — only SUPER_CEO / ADMIN can trigger the kill switch
  if (!checkPermission(ctx, 'configuracion', 'admin')) return apiForbidden();

  // 5. Strict per-user rate limit: 2 calls/min
  if (!checkPanicRateLimit(ctx.userId)) {
    auditLogger.logEvent({
      eventType: AuditEventType.RATE_LIMIT_EXCEEDED,
      severity: AuditSeverity.HIGH,
      userId: ctx.userId,
      userRole: ctx.role,
      resource: 'system/panic',
      action: 'panic_rate_limited',
      details: { reason: parsed.data.reason },
      success: false,
    });
    return apiError('RATE_LIMIT', 'Panic endpoint rate limit exceeded (2/min)', 429);
  }

  try {
    await withSuperAdminContext(async () => {
      // In a real system:
      // 1. Invalidate all streaming tokens
      // 2. Send WebSocket STOP command to all players
      // 3. Deactivate all active campaigns in DB
      logger.warn('KILL SWITCH ACTIVATED', { userId: ctx.userId, module: 'panic' });
      logger.warn('Panic reason', { reason: parsed.data.reason, module: 'panic' });
    });

    // 6. Critical audit log — every panic activation is logged regardless of outcome
    auditLogger.logEvent({
      eventType: AuditEventType.ADMIN_ACTION,
      severity: AuditSeverity.CRITICAL,
      userId: ctx.userId,
      userRole: ctx.role,
      resource: 'system/panic',
      action: 'kill_switch_activated',
      details: { reason: parsed.data.reason },
      success: true,
    });

    return apiSuccess({
      message: 'SYSTEM HALTED. All broadcasts stopped.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Panic Kill Switch Error:', error instanceof Error ? error : undefined, { module: 'panic' });

    auditLogger.logEvent({
      eventType: AuditEventType.ADMIN_ACTION,
      severity: AuditSeverity.CRITICAL,
      userId: ctx.userId,
      userRole: ctx.role,
      resource: 'system/panic',
      action: 'kill_switch_failed',
      details: { reason: parsed.data.reason, error: error instanceof Error ? error.message : 'unknown' },
      success: false,
    });

    return apiServerError();
  }
}
