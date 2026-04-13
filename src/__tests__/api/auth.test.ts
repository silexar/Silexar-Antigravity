/**
 * Tests for /api/auth/login and /api/auth/me
 *
 * Strategy:
 * - login route: pure handler (no withApiRoute), mock all I/O deps
 * - me route: uses withApiRoute, mock the wrapper to pass ctx through
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Global mocks (must be before any imports) ─────────────────────────────────

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) =>
      new Response(JSON.stringify(body), {
        status: init?.status ?? 200,
        headers: { 'content-type': 'application/json' },
      }),
  },
}))

// Mock argon2 — fast, no native bindings in test
vi.mock('argon2', () => ({
  hash: vi.fn().mockResolvedValue('$argon2id$hashed'),
  verify: vi.fn().mockResolvedValue(true),
}))

// Mock JWT signing
vi.mock('@/lib/api/jwt', () => ({
  signToken: vi.fn().mockResolvedValue('mock.access.token'),
  signRefreshToken: vi.fn().mockResolvedValue('mock.refresh.token'),
  verifyTokenServer: vi.fn().mockResolvedValue({ userId: 'user-001' }),
}))

// Mock DB
const mockSelect = vi.fn()
const mockDbChain = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue([]),
}
vi.mock('@/lib/db', () => ({
  isDatabaseConnected: vi.fn().mockReturnValue(true),
  getDB: vi.fn(() => mockDbChain),
  db: mockDbChain,
}))

// Mock schemas (only the exports the route uses)
vi.mock('@/lib/db/users-schema', () => ({
  users: { email: 'email', id: 'id', tenantId: 'tenantId' },
  tenants: { id: 'id', slug: 'slug' },
}))

// Mock security deps
vi.mock('@/lib/security/audit-logger', () => ({
  auditLogger: {
    log: vi.fn().mockResolvedValue(undefined),
    logEvent: vi.fn().mockResolvedValue(undefined),
  },
}))
vi.mock('@/lib/security/audit-types', () => ({
  AuditEventType: {
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
    SECURITY_VIOLATION: 'SECURITY_VIOLATION',
    DATA_READ: 'DATA_READ',
    DATA_CREATE: 'DATA_CREATE',
    API_CALL: 'API_CALL',
  },
}))
vi.mock('@/lib/security/rate-limiter', () => ({
  authRateLimiter: { checkRateLimit: vi.fn().mockResolvedValue({ success: true }) },
  apiRateLimiter:  { checkRateLimit: vi.fn().mockResolvedValue({ success: true }) },
  cortexRateLimiter: { checkRateLimit: vi.fn().mockResolvedValue({ success: true }) },
}))
vi.mock('@/lib/security/session-store', () => ({
  sessionStore: { create: vi.fn().mockResolvedValue(undefined) },
}))
vi.mock('@/lib/security/password-security', () => ({
  PasswordSecurityManager: {
    checkBreached: vi.fn().mockResolvedValue({ breached: false, count: 0 }),
  },
}))
vi.mock('@/lib/security/session-blacklist', () => ({
  isTokenRevoked: vi.fn().mockResolvedValue(false),
}))
vi.mock('@/lib/observability', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
  traceRequest: vi.fn(),
}))

// ── withApiRoute mock — simulates JWT extraction from headers ─────────────────
vi.mock('@/lib/api/with-api-route', () => ({
  withApiRoute: (
    config: { skipCsrf?: boolean; allowPublic?: boolean; resource?: string; action?: string },
    handler: (args: { ctx: Record<string, string | boolean>; req: Request; ip: string }) => Promise<Response>
  ) =>
    async (req: Request) => {
      const userId = req.headers.get('x-silexar-user-id') || ''
      if (!userId && !config.allowPublic) {
        return new Response(JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }), { status: 401 })
      }
      const ctx = {
        userId,
        role: req.headers.get('x-silexar-user-role') || 'VIEWER',
        tenantId: req.headers.get('x-silexar-tenant-id') || 'tenant-001',
        tenantSlug: 'test-tenant',
        sessionId: 'sess-test',
        requestId: 'req-test',
        isImpersonating: false,
      }
      return handler({ ctx, req: req as never, ip: '127.0.0.1' })
    },
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

async function json(res: Response) {
  return res.json() as Promise<Record<string, unknown>>
}

function makeLoginRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

function makeGetRequest(path: string, headers: Record<string, string> = {}) {
  return new Request(`http://localhost:3000${path}`, { headers })
}

// ── Active user fixture ───────────────────────────────────────────────────────

const activeUser = {
  id: 'user-001',
  email: 'admin@test.com',
  name: 'Test Admin',
  passwordHash: '$argon2id$hashed',
  category: 'ADMIN',
  status: 'active',
  tenantId: 'tenant-001',
  isSuperAdmin: false,
  isTenantAdmin: false,
  twoFactorEnabled: false,
  lastLoginAt: null,
  createdAt: new Date(),
}

const activeTenant = {
  id: 'tenant-001',
  slug: 'test-tenant',
  name: 'Test Tenant',
  status: 'active',
}

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/auth/login
// ══════════════════════════════════════════════════════════════════════════════

describe('POST /api/auth/login', () => {
  let POST: (req: Request) => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()
    // Reset DB chain to return empty by default
    mockDbChain.limit.mockResolvedValue([])
    const mod = await import('@/app/api/auth/login/route')
    POST = mod.POST as (req: Request) => Promise<Response>
  })

  // ── Validation ─────────────────────────────────────────────────────────────

  it('returns 422 when email is missing', async () => {
    const res = await POST(makeLoginRequest({ password: 'Passw0rd!ABCDE' }))
    expect(res.status).toBe(422)
  })

  it('returns 422 when email is invalid format', async () => {
    const res = await POST(makeLoginRequest({ email: 'not-an-email', password: 'Passw0rd!ABCDE' }))
    expect(res.status).toBe(422)
  })

  it('returns 422 when password is missing', async () => {
    const res = await POST(makeLoginRequest({ email: 'admin@test.com' }))
    expect(res.status).toBe(422)
  })

  it('returns 400 on malformed JSON', async () => {
    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not-json',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  // ── Auth failures ──────────────────────────────────────────────────────────

  it('returns 401 when user not found', async () => {
    mockDbChain.limit.mockResolvedValue([]) // no user
    const res = await POST(makeLoginRequest({ email: 'nobody@test.com', password: 'Passw0rd!ABCDE' }))
    expect(res.status).toBe(401)
    const body = await json(res)
    expect((body.error as Record<string, unknown>).code).toBe('INVALID_CREDENTIALS')
  })

  it('returns 401 when password is wrong', async () => {
    mockDbChain.limit
      .mockResolvedValueOnce([activeUser]) // user found
      .mockResolvedValueOnce([activeTenant]) // tenant found
    const argon2 = await import('argon2')
    vi.mocked(argon2.verify).mockResolvedValueOnce(false)

    const res = await POST(makeLoginRequest({ email: 'admin@test.com', password: 'WrongPass123' }))
    expect(res.status).toBe(401)
  })

  it('returns 403 when account is not active', async () => {
    mockDbChain.limit.mockResolvedValueOnce([{ ...activeUser, status: 'suspended' }])
    const res = await POST(makeLoginRequest({ email: 'admin@test.com', password: 'Passw0rd!ABCDE' }))
    expect(res.status).toBe(403)
    const body = await json(res)
    expect((body.error as Record<string, unknown>).code).toBe('ACCOUNT_DISABLED')
  })

  it('returns 429 when rate limit exceeded', async () => {
    const { authRateLimiter } = await import('@/lib/security/rate-limiter')
    vi.mocked(authRateLimiter.checkRateLimit).mockResolvedValueOnce({
      success: false,
      retryAfter: 60,
      limit: 5,
      remaining: 0,
      resetAt: Date.now() + 60_000,
    })
    const res = await POST(makeLoginRequest({ email: 'admin@test.com', password: 'Passw0rd!ABCDE' }))
    expect(res.status).toBe(429)
  })

  it('returns 503 when DB is unavailable', async () => {
    const db = await import('@/lib/db')
    vi.mocked(db.isDatabaseConnected).mockReturnValueOnce(false)
    const res = await POST(makeLoginRequest({ email: 'admin@test.com', password: 'Passw0rd!ABCDE' }))
    expect(res.status).toBeGreaterThanOrEqual(500)
  })

  // ── Success path ───────────────────────────────────────────────────────────

  it('returns 200 with accessToken on valid credentials', async () => {
    mockDbChain.limit
      .mockResolvedValueOnce([activeUser])
      .mockResolvedValueOnce([activeTenant])

    const res = await POST(makeLoginRequest({ email: 'admin@test.com', password: 'Passw0rd!ABCDE' }))
    expect(res.status).toBe(200)
    const body = await json(res)
    expect(body.success).toBe(true)
    const data = body.data as Record<string, unknown>
    expect(data.accessToken).toBe('mock.access.token')
  })

  it('includes user data in success response', async () => {
    mockDbChain.limit
      .mockResolvedValueOnce([activeUser])
      .mockResolvedValueOnce([activeTenant])

    const res = await POST(makeLoginRequest({ email: 'admin@test.com', password: 'Passw0rd!ABCDE' }))
    const body = await json(res)
    const data = body.data as Record<string, unknown>
    const user = data.user as Record<string, unknown>
    expect(user.email).toBe('admin@test.com')
    expect(user.category).toBe('ADMIN')
  })

  it('adds PASSWORD_BREACHED warning when password is in known breaches', async () => {
    mockDbChain.limit
      .mockResolvedValueOnce([activeUser])
      .mockResolvedValueOnce([activeTenant])
    const { PasswordSecurityManager } = await import('@/lib/security/password-security')
    vi.mocked(PasswordSecurityManager.checkBreached).mockResolvedValueOnce({ breached: true, count: 42 })

    const res = await POST(makeLoginRequest({ email: 'admin@test.com', password: 'Passw0rd!ABCDE' }))
    expect(res.status).toBe(200)
    const body = await json(res)
    const data = body.data as Record<string, unknown>
    expect(data.warning).toBe('PASSWORD_BREACHED')
  })

  it('still returns 200 even when HIBP check throws', async () => {
    mockDbChain.limit
      .mockResolvedValueOnce([activeUser])
      .mockResolvedValueOnce([activeTenant])
    const { PasswordSecurityManager } = await import('@/lib/security/password-security')
    vi.mocked(PasswordSecurityManager.checkBreached).mockRejectedValueOnce(new Error('HIBP down'))

    const res = await POST(makeLoginRequest({ email: 'admin@test.com', password: 'Passw0rd!ABCDE' }))
    expect(res.status).toBe(200)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/auth/me
// ══════════════════════════════════════════════════════════════════════════════

describe('GET /api/auth/me', () => {
  let GET: (req: Request) => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()
    mockDbChain.limit.mockResolvedValue([])
    const mod = await import('@/app/api/auth/me/route')
    GET = mod.GET as (req: Request) => Promise<Response>
  })

  it('returns 401 when no auth headers present', async () => {
    const res = await GET(makeGetRequest('/api/auth/me'))
    expect(res.status).toBe(401)
  })

  it('returns user from DB when authenticated and DB available', async () => {
    mockDbChain.limit.mockResolvedValueOnce([activeUser])

    const res = await GET(makeGetRequest('/api/auth/me', {
      'x-silexar-user-id': 'user-001',
      'x-silexar-user-role': 'ADMIN',
      'x-silexar-tenant-id': 'tenant-001',
    }))
    expect(res.status).toBe(200)
    const body = await json(res)
    expect(body.success).toBe(true)
    const data = body.data as Record<string, unknown>
    const user = data.user as Record<string, unknown>
    expect(user.email).toBe('admin@test.com')
  })

  it('returns JWT-derived context when DB is unavailable', async () => {
    const db = await import('@/lib/db')
    vi.mocked(db.isDatabaseConnected).mockReturnValueOnce(false)

    const res = await GET(makeGetRequest('/api/auth/me', {
      'x-silexar-user-id': 'user-001',
      'x-silexar-user-role': 'ADMIN',
      'x-silexar-tenant-id': 'tenant-001',
    }))
    expect(res.status).toBe(200)
    const body = await json(res)
    const data = body.data as Record<string, unknown>
    const user = data.user as Record<string, unknown>
    expect(user.userId).toBe('user-001')
    expect(user.role).toBe('ADMIN')
  })

  it('returns 401 when user record not found in DB', async () => {
    mockDbChain.limit.mockResolvedValueOnce([]) // user not found

    const res = await GET(makeGetRequest('/api/auth/me', {
      'x-silexar-user-id': 'ghost-user',
      'x-silexar-user-role': 'VIEWER',
      'x-silexar-tenant-id': 'tenant-001',
    }))
    expect(res.status).toBe(401)
  })

  it('returns 401 when user account is inactive', async () => {
    mockDbChain.limit.mockResolvedValueOnce([{ ...activeUser, status: 'suspended' }])

    const res = await GET(makeGetRequest('/api/auth/me', {
      'x-silexar-user-id': 'user-001',
      'x-silexar-user-role': 'ADMIN',
      'x-silexar-tenant-id': 'tenant-001',
    }))
    expect(res.status).toBe(401)
  })
})
