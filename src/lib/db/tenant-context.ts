/**
 * Silexar Pulse - Tenant Context for RLS
 * Sets PostgreSQL session variables for Row Level Security enforcement
 */

import { sql } from 'drizzle-orm'
import { getDB } from '@/lib/db'
import { logger } from '@/lib/observability'

// ─── Super-admin rate limiter (in-memory sliding window) ─────────────────────
// Prevents a compromised super-admin token from bulk-exfiltrating cross-tenant data.
// Limit: 30 calls per minute per userId. No Redis dependency — this runs at the
// DB layer where request context may not be available.

const SUPER_ADMIN_WINDOW_MS  = 60_000   // 1 minute
const SUPER_ADMIN_MAX_CALLS  = 30       // per userId per window

const superAdminCallLog = new Map<string, number[]>()

// Prune stale entries every 5 min to avoid unbounded memory growth
setInterval(() => {
  const cutoff = Date.now() - SUPER_ADMIN_WINDOW_MS
  for (const [key, times] of superAdminCallLog.entries()) {
    const fresh = times.filter(t => t >= cutoff)
    if (fresh.length === 0) superAdminCallLog.delete(key)
    else superAdminCallLog.set(key, fresh)
  }
}, 5 * 60_000).unref?.()   // .unref() so the timer doesn't block process exit in tests

function checkSuperAdminRateLimit(userId: string): { allowed: boolean; count: number } {
  const cutoff = Date.now() - SUPER_ADMIN_WINDOW_MS
  const times  = (superAdminCallLog.get(userId) ?? []).filter(t => t >= cutoff)
  times.push(Date.now())
  superAdminCallLog.set(userId, times)
  return { allowed: times.length <= SUPER_ADMIN_MAX_CALLS, count: times.length }
}

/**
 * Execute a callback with RLS tenant isolation active.
 * Sets app.current_tenant_id before the callback and resets it after.
 *
 * Usage in API routes:
 *   const result = await withTenantContext(tenantId, async (db) => {
 *     return db.select().from(campaigns).where(...)
 *   })
 */
export async function withTenantContext<T>(
  tenantId: string,
  callback: (db: ReturnType<typeof getDB>) => Promise<T>,
  options?: { isSuperAdmin?: boolean }
): Promise<T> {
  const db = getDB()

  try {
    // Set tenant context for RLS policy evaluation
    await db.execute(sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`)

    if (options?.isSuperAdmin) {
      await db.execute(sql`SELECT set_config('app.is_super_admin', 'true', true)`)
    }

    return await callback(db)
  } finally {
    // Always reset to prevent context leaking between requests
    await db.execute(sql`SELECT set_config('app.current_tenant_id', '', true)`)
    await db.execute(sql`SELECT set_config('app.is_super_admin', '', true)`)
  }
}

/**
 * Execute as super admin — bypasses RLS for cross-tenant operations.
 * Always logs the access for audit compliance (D7: SOC2 / GDPR).
 *
 * @param callback   The operation to execute with RLS bypassed
 * @param auditCtx   Who is performing this operation and why (required for audit trail)
 */
export async function withSuperAdminContext<T>(
  callback: (db: ReturnType<typeof getDB>) => Promise<T>,
  auditCtx?: { userId?: string; action?: string; targetTenantId?: string }
): Promise<T> {
  const db = getDB()
  const userId = auditCtx?.userId ?? 'unknown'

  // ── Rate limit: 30 calls/min per super-admin userId ───────────────────────
  // Prevents bulk cross-tenant exfiltration from a compromised token.
  const { allowed, count } = checkSuperAdminRateLimit(userId)
  if (!allowed) {
    logger.error('[TenantContext] 🚨 Super-admin rate limit exceeded — RLS bypass denied', {
      event: 'SUPER_ADMIN_RATE_LIMIT_EXCEEDED',
      userId,
      action: auditCtx?.action,
      callsInWindow: count,
      maxCalls: SUPER_ADMIN_MAX_CALLS,
      windowMs: SUPER_ADMIN_WINDOW_MS,
      severity: 'CRITICAL',
    })
    throw new Error('SUPER_ADMIN_RATE_LIMIT_EXCEEDED')
  }

  // ── Audit log: every RLS bypass must be traceable ─────────────────────────
  logger.warn('[TenantContext] Super admin context activated — RLS bypassed', {
    event: 'SUPER_ADMIN_RLS_BYPASS',
    userId,
    action: auditCtx?.action ?? 'unspecified',
    targetTenantId: auditCtx?.targetTenantId,
    callsInWindow: count,
    timestamp: new Date().toISOString(),
    severity: 'HIGH',
  })

  try {
    await db.execute(sql`SELECT set_config('app.is_super_admin', 'true', true)`)
    return await callback(db)
  } finally {
    await db.execute(sql`SELECT set_config('app.is_super_admin', '', true)`)
  }
}
