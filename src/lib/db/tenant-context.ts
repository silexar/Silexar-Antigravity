/**
 * Silexar Pulse - Tenant Context for RLS
 * Sets PostgreSQL session variables for Row Level Security enforcement
 */

import { sql } from 'drizzle-orm'
import { getDB } from '@/lib/db'

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
 * Execute as super admin — bypasses RLS for cross-tenant operations
 */
export async function withSuperAdminContext<T>(
  callback: (db: ReturnType<typeof getDB>) => Promise<T>
): Promise<T> {
  const db = getDB()

  try {
    await db.execute(sql`SELECT set_config('app.is_super_admin', 'true', true)`)
    return await callback(db)
  } finally {
    await db.execute(sql`SELECT set_config('app.is_super_admin', '', true)`)
  }
}
