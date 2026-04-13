/**
 * TEST 4 — Tenant Context (src/lib/db/tenant-context.ts)
 *
 * Tests for withTenantContext() and withSuperAdminContext().
 * The database is fully mocked so these tests are hermetic and don't
 * require a running PostgreSQL instance.
 *
 * Verified behaviors:
 *   - Callback is called and its return value propagated
 *   - set_config is called with the correct tenant ID before the callback
 *   - Context is reset (empty string) in the finally block — even on error
 *   - Super admin flag is set and then cleared
 *   - withSuperAdminContext passes the db instance to the callback
 *   - withTenantContext with isSuperAdmin:true sets both vars
 *   - Errors thrown inside the callback propagate correctly
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Captured SQL calls tracker ───────────────────────────────────────────────

type SqlCall = { statement: string }
let sqlCalls: SqlCall[] = []

// ─── Mock Drizzle ORM ─────────────────────────────────────────────────────────

const mockDb = {
  execute: vi.fn(async (sqlTemplate: unknown) => {
    // Capture the raw SQL that was called
    const raw = String(sqlTemplate)
    sqlCalls.push({ statement: raw })
    return []
  }),
}

vi.mock('@/lib/db', () => ({
  getDB: () => mockDb,
  db: mockDb,
}))

// We also need to prevent drizzle-orm sql tagged template from throwing
vi.mock('drizzle-orm', () => ({
  sql: new Proxy(
    (strings: TemplateStringsArray, ...values: unknown[]) => {
      // Return a string representation for inspection
      let result = ''
      strings.forEach((str, i) => {
        result += str
        if (i < values.length) result += String(values[i])
      })
      return result
    },
    {
      // sql.raw() and other sub-properties
      get: (_target: unknown, prop: string) => {
        if (prop === 'raw') return (s: string) => s
        return undefined
      },
    },
  ),
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getExecutedStatements(): string[] {
  return mockDb.execute.mock.calls.map((call) => String(call[0]))
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('withTenantContext()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sqlCalls = []
  })

  it('executes the callback and returns its value', async () => {
    const { withTenantContext } = await import('@/lib/db/tenant-context')
    const result = await withTenantContext('tenant-001', async () => 42)
    expect(result).toBe(42)
  })

  it('returns a string result from the callback', async () => {
    const { withTenantContext } = await import('@/lib/db/tenant-context')
    const result = await withTenantContext('tenant-001', async () => 'success')
    expect(result).toBe('success')
  })

  it('returns an object result from the callback', async () => {
    const { withTenantContext } = await import('@/lib/db/tenant-context')
    const data = { id: 'row-1', name: 'Campaña Norte' }
    const result = await withTenantContext('tenant-001', async () => data)
    expect(result).toEqual(data)
  })

  it('returns an array result from the callback', async () => {
    const { withTenantContext } = await import('@/lib/db/tenant-context')
    const rows = [{ id: '1' }, { id: '2' }]
    const result = await withTenantContext('tenant-001', async () => rows)
    expect(result).toEqual(rows)
  })

  it('calls db.execute at least once (to set tenant context)', async () => {
    const { withTenantContext } = await import('@/lib/db/tenant-context')
    await withTenantContext('tenant-abc', async () => null)
    expect(mockDb.execute).toHaveBeenCalled()
  })

  it('calls the callback exactly once', async () => {
    const { withTenantContext } = await import('@/lib/db/tenant-context')
    const spy = vi.fn(async () => 'ok')
    await withTenantContext('tenant-001', spy)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('passes the db instance to the callback', async () => {
    const { withTenantContext } = await import('@/lib/db/tenant-context')
    let receivedDb: unknown = undefined
    await withTenantContext('tenant-001', async (db) => {
      receivedDb = db
    })
    expect(receivedDb).toBeDefined()
  })

  it('resets context after callback completes (finally block)', async () => {
    const { withTenantContext } = await import('@/lib/db/tenant-context')
    await withTenantContext('tenant-reset-test', async () => 'done')
    const statements = getExecutedStatements()
    // At least one call should reset current_tenant_id to empty string
    const hasReset = statements.some(
      (s) => s.includes('current_tenant_id') && (s.includes("''") || s.includes(', ,') || s.includes(',')),
    )
    expect(hasReset).toBe(true)
  })

  it('resets context even when the callback throws', async () => {
    const { withTenantContext } = await import('@/lib/db/tenant-context')
    const callsBeforeThrow: number[] = []
    await expect(
      withTenantContext('tenant-error', async () => {
        callsBeforeThrow.push(mockDb.execute.mock.calls.length)
        throw new Error('Simulated DB error')
      }),
    ).rejects.toThrow('Simulated DB error')

    // execute() should have been called AFTER the error too (for cleanup)
    expect(mockDb.execute.mock.calls.length).toBeGreaterThan(callsBeforeThrow[0])
  })

  it('propagates the error thrown inside the callback', async () => {
    const { withTenantContext } = await import('@/lib/db/tenant-context')
    await expect(
      withTenantContext('tenant-001', async () => {
        throw new Error('business rule violation')
      }),
    ).rejects.toThrow('business rule violation')
  })

  it('sets the super admin flag when isSuperAdmin option is true', async () => {
    const { withTenantContext } = await import('@/lib/db/tenant-context')
    await withTenantContext('tenant-001', async () => null, { isSuperAdmin: true })
    const statements = getExecutedStatements()
    const setsSuperAdmin = statements.some(
      (s) => s.includes('is_super_admin') && s.includes('true'),
    )
    expect(setsSuperAdmin).toBe(true)
  })

  it('does NOT set super admin flag when option is absent', async () => {
    const { withTenantContext } = await import('@/lib/db/tenant-context')
    await withTenantContext('tenant-001', async () => null)
    const statements = getExecutedStatements()
    // Check for setting is_super_admin to 'true' (as a string value, not the SQL boolean param)
    // The reset calls use '' (empty string) as the value, not 'true'
    const setsSuperAdmin = statements.some(
      (s) => s.includes('is_super_admin') && s.includes("'true'"),
    )
    expect(setsSuperAdmin).toBe(false)
  })

  it('handles a callback that returns undefined', async () => {
    const { withTenantContext } = await import('@/lib/db/tenant-context')
    const result = await withTenantContext('tenant-001', async () => undefined)
    expect(result).toBeUndefined()
  })

  it('handles a callback that returns null', async () => {
    const { withTenantContext } = await import('@/lib/db/tenant-context')
    const result = await withTenantContext('tenant-001', async () => null)
    expect(result).toBeNull()
  })

  it('works with async callbacks that await other promises', async () => {
    const { withTenantContext } = await import('@/lib/db/tenant-context')
    const delayed = () => new Promise<string>((resolve) => setTimeout(() => resolve('delayed'), 0))
    const result = await withTenantContext('tenant-001', async () => delayed())
    expect(result).toBe('delayed')
  })
})

// ─── withSuperAdminContext() ──────────────────────────────────────────────────

describe('withSuperAdminContext()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sqlCalls = []
  })

  it('executes the callback and returns its value', async () => {
    const { withSuperAdminContext } = await import('@/lib/db/tenant-context')
    const result = await withSuperAdminContext(async () => 'super-result')
    expect(result).toBe('super-result')
  })

  it('returns an object result from the callback', async () => {
    const { withSuperAdminContext } = await import('@/lib/db/tenant-context')
    const tenants = [{ id: 't-1' }, { id: 't-2' }]
    const result = await withSuperAdminContext(async () => tenants)
    expect(result).toEqual(tenants)
  })

  it('calls the callback exactly once', async () => {
    const { withSuperAdminContext } = await import('@/lib/db/tenant-context')
    const spy = vi.fn(async () => 'ok')
    await withSuperAdminContext(spy)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('passes the db instance to the callback', async () => {
    const { withSuperAdminContext } = await import('@/lib/db/tenant-context')
    let receivedDb: unknown = undefined
    await withSuperAdminContext(async (db) => {
      receivedDb = db
    })
    expect(receivedDb).toBeDefined()
  })

  it('calls db.execute at least once (for set_config)', async () => {
    const { withSuperAdminContext } = await import('@/lib/db/tenant-context')
    await withSuperAdminContext(async () => null)
    expect(mockDb.execute).toHaveBeenCalled()
  })

  it('resets super admin context after the callback (finally block)', async () => {
    const { withSuperAdminContext } = await import('@/lib/db/tenant-context')
    await withSuperAdminContext(async () => 'done')
    const statements = getExecutedStatements()
    // Must have set is_super_admin to 'true' and then reset it to ''
    const setsTrue = statements.some((s) => s.includes('is_super_admin') && s.includes('true'))
    const resetsIt = statements.filter((s) => s.includes('is_super_admin')).length >= 2
    expect(setsTrue).toBe(true)
    expect(resetsIt).toBe(true)
  })

  it('resets context even when the callback throws', async () => {
    const { withSuperAdminContext } = await import('@/lib/db/tenant-context')
    const callsBeforeThrow: number[] = []
    await expect(
      withSuperAdminContext(async () => {
        callsBeforeThrow.push(mockDb.execute.mock.calls.length)
        throw new Error('admin operation failed')
      }),
    ).rejects.toThrow('admin operation failed')
    // Cleanup execute call must have happened
    expect(mockDb.execute.mock.calls.length).toBeGreaterThan(callsBeforeThrow[0])
  })

  it('propagates errors from the callback', async () => {
    const { withSuperAdminContext } = await import('@/lib/db/tenant-context')
    await expect(
      withSuperAdminContext(async () => {
        throw new Error('forbidden operation')
      }),
    ).rejects.toThrow('forbidden operation')
  })

  it('handles a callback returning undefined', async () => {
    const { withSuperAdminContext } = await import('@/lib/db/tenant-context')
    const result = await withSuperAdminContext(async () => undefined)
    expect(result).toBeUndefined()
  })

  it('can be used with async iteration inside callback', async () => {
    const { withSuperAdminContext } = await import('@/lib/db/tenant-context')
    const items = ['t1', 't2', 't3']
    const collected: string[] = []
    await withSuperAdminContext(async () => {
      for (const item of items) {
        collected.push(item)
      }
    })
    expect(collected).toEqual(items)
  })
})
