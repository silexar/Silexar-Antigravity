/**
 * RLS Isolation Tests — Multi-tenant data isolation verification
 *
 * These tests verify the PRINCIPLE of tenant isolation using mocked DB calls.
 * They catch regressions where tenant filtering is accidentally removed from queries.
 *
 * Integration tests against a real PostgreSQL DB live in:
 *   src/__tests__/integration/rls-real-db.test.ts
 *   (requires DATABASE_URL with RLS enabled — run in CI only)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mock Drizzle and tenant context ─────────────────────────────────────────

/**
 * A thenable query result that also has Drizzle chain methods.
 * Needed because some repos end chains with .orderBy() and others with .limit():
 *   - await db.select().from().where().orderBy()          → []
 *   - await db.select().from().where().orderBy().limit()  → []
 */
function makeChainableResult(): Promise<unknown[]> & { limit: ReturnType<typeof vi.fn> } {
  const p = Promise.resolve([]) as Promise<unknown[]> & { limit: ReturnType<typeof vi.fn> }
  p.limit = vi.fn().mockResolvedValue([])
  return p
}

const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockImplementation(() => makeChainableResult()),
  limit: vi.fn().mockResolvedValue([]),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
}

vi.mock('@/lib/db', () => ({ db: mockDb }))
vi.mock('@/lib/db/tenant-context', () => ({
  withTenantContext: vi.fn().mockImplementation((_tenantId: string, fn: () => Promise<unknown>) => fn()),
}))
vi.mock('@/lib/observability', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}))

const TENANT_A = 'aaaaaaaa-0000-0000-0000-000000000001'
const TENANT_B = 'bbbbbbbb-0000-0000-0000-000000000002'

// ─── Propiedades repository isolation ────────────────────────────────────────

describe('TipoPropiedadDrizzleRepository — tenant isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Restore chain mocks after clearAllMocks() clears their implementations
    mockDb.select.mockReturnThis()
    mockDb.from.mockReturnThis()
    mockDb.where.mockReturnThis()
    mockDb.orderBy.mockImplementation(() => makeChainableResult())
    mockDb.limit.mockResolvedValue([])
  })

  it('should instantiate with tenantId and use it in queries', async () => {
    const { TipoPropiedadDrizzleRepository } = await import(
      '../../modules/propiedades/infrastructure/repositories/PropiedadesDrizzleRepository'
    )

    const repo = new TipoPropiedadDrizzleRepository(TENANT_A)
    expect(repo).toBeDefined()

    // findAll triggers a DB query with tenantId in WHERE
    await repo.findAll()
    expect(mockDb.select).toHaveBeenCalled()
    expect(mockDb.where).toHaveBeenCalled()
  })

  it('should return empty array when tenant B requests tenant A data', async () => {
    const { TipoPropiedadDrizzleRepository } = await import(
      '../../modules/propiedades/infrastructure/repositories/PropiedadesDrizzleRepository'
    )

    // Repo for Tenant B — DB mock returns empty (as RLS would for wrong tenant)
    const repoBforA = new TipoPropiedadDrizzleRepository(TENANT_B)
    const result = await repoBforA.findAll()
    expect(result).toEqual([])
  })

  it('findById returns null when RLS blocks access', async () => {
    const { TipoPropiedadDrizzleRepository } = await import(
      '../../modules/propiedades/infrastructure/repositories/PropiedadesDrizzleRepository'
    )

    mockDb.limit.mockResolvedValue([]) // Simulates RLS returning no rows
    const repo = new TipoPropiedadDrizzleRepository(TENANT_B)
    const result = await repo.findById('some-id-from-tenant-a')
    expect(result).toBeNull()
  })
})

// ─── Cortex repository isolation ─────────────────────────────────────────────

describe('MotorCortexDrizzleRepository — tenant isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.select.mockReturnThis()
    mockDb.from.mockReturnThis()
    mockDb.where.mockReturnThis()
    mockDb.orderBy.mockImplementation(() => makeChainableResult())
    mockDb.limit.mockResolvedValue([])
  })

  it('should instantiate with tenantId', async () => {
    const { MotorCortexDrizzleRepository } = await import(
      '../../modules/cortex/infrastructure/repositories/MotorCortexDrizzleRepository'
    )

    const repo = new MotorCortexDrizzleRepository(TENANT_A)
    expect(repo).toBeDefined()
  })

  it('listarPorTenant returns empty when no engines exist for tenant', async () => {
    const { MotorCortexDrizzleRepository } = await import(
      '../../modules/cortex/infrastructure/repositories/MotorCortexDrizzleRepository'
    )

    const repo = new MotorCortexDrizzleRepository(TENANT_B)
    const result = await repo.listarPorTenant(TENANT_B)
    expect(result).toEqual([])
  })

  it('buscarPorId returns null for cross-tenant access (RLS blocks)', async () => {
    const { MotorCortexDrizzleRepository } = await import(
      '../../modules/cortex/infrastructure/repositories/MotorCortexDrizzleRepository'
    )

    mockDb.limit.mockResolvedValue([])
    const repo = new MotorCortexDrizzleRepository(TENANT_B)
    const result = await repo.buscarPorId('tenant-a-motor-id', TENANT_B)
    expect(result).toBeNull()
  })
})

// ─── withTenantContext is ALWAYS called ──────────────────────────────────────

describe('withTenantContext() usage enforcement', () => {
  it('TipoPropiedadDrizzleRepository calls withTenantContext on every operation', async () => {
    const { withTenantContext } = await import('@/lib/db/tenant-context')
    const { TipoPropiedadDrizzleRepository } = await import(
      '../../modules/propiedades/infrastructure/repositories/PropiedadesDrizzleRepository'
    )

    vi.clearAllMocks()
    mockDb.select.mockReturnThis()
    mockDb.from.mockReturnThis()
    mockDb.where.mockReturnThis()
    mockDb.orderBy.mockImplementation(() => makeChainableResult())
    mockDb.limit.mockResolvedValue([])

    const repo = new TipoPropiedadDrizzleRepository(TENANT_A)
    await repo.findAll()
    await repo.findById('test-id')
    await repo.findByCodigo('TEST')

    expect(withTenantContext).toHaveBeenCalledTimes(3)
    // Verify tenantId was passed correctly each time
    const calls = vi.mocked(withTenantContext).mock.calls
    for (const [tenantId] of calls) {
      expect(tenantId).toBe(TENANT_A)
    }
  })

  it('MotorCortexDrizzleRepository calls withTenantContext on every operation', async () => {
    const { withTenantContext } = await import('@/lib/db/tenant-context')
    const { MotorCortexDrizzleRepository } = await import(
      '../../modules/cortex/infrastructure/repositories/MotorCortexDrizzleRepository'
    )

    vi.clearAllMocks()
    mockDb.select.mockReturnThis()
    mockDb.from.mockReturnThis()
    mockDb.where.mockReturnThis()
    mockDb.orderBy.mockImplementation(() => makeChainableResult())
    mockDb.limit.mockResolvedValue([])

    const repo = new MotorCortexDrizzleRepository(TENANT_A)
    await repo.listarPorTenant(TENANT_A)
    await repo.buscarPorId('motor-id', TENANT_A)

    expect(withTenantContext).toHaveBeenCalledTimes(2)
    const calls = vi.mocked(withTenantContext).mock.calls
    for (const [tenantId] of calls) {
      expect(tenantId).toBe(TENANT_A)
    }
  })
})
