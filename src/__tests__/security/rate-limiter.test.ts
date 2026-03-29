/**
 * TEST 3 — Rate Limiter (src/lib/security/rate-limiter.ts)
 *
 * Tests the in-memory sliding-window fallback path (Redis is mocked to null)
 * so that tests are hermetic and fast.
 *
 * Covers:
 *   - rateLimit() simple helper
 *   - EnterpriseRateLimiter.checkRateLimit() via a fake NextRequest
 *   - Pre-configured limiters (authRateLimiter, apiRateLimiter, cortexRateLimiter)
 *   - Key isolation (different keys don't share counters)
 *   - onLimitReached callback
 *   - createRateLimitMiddleware() response shape
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ─── Mock Redis to force in-memory fallback ───────────────────────────────────

vi.mock('@/lib/cache/redis-client', () => ({
  getRedisClient: () => null,
}))

// ─── Mock audit logger to silence side effects ────────────────────────────────

vi.mock('@/lib/security/audit-logger', () => ({
  logError: vi.fn(),
  logSecurity: vi.fn(),
  auditLogger: { logEvent: vi.fn() },
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a minimal NextRequest with controllable IP and tenant headers. */
function makeRequest(ip: string = '127.0.0.1', tenantId: string = 'tenant-test'): NextRequest {
  const req = new NextRequest('http://localhost/api/test', {
    method: 'GET',
    headers: {
      'x-forwarded-for': ip,
      'x-tenant-id': tenantId,
    },
  })
  return req
}

/**
 * Drive checkRateLimit() N times in a row on the same limiter + request pair.
 * Returns an array of all results.
 */
async function fireRequests(
  limiter: { checkRateLimit: (r: NextRequest) => Promise<{ success: boolean; remaining: number; limit: number }> },
  request: NextRequest,
  count: number,
) {
  const results = []
  for (let i = 0; i < count; i++) {
    results.push(await limiter.checkRateLimit(request))
  }
  return results
}

// ─── 1. rateLimit() helper ────────────────────────────────────────────────────

describe('rateLimit() — simple helper', () => {
  // Each test uses a unique key so the in-memory store starts fresh
  let keyCounter = 0
  const nextKey = () => `test:rl:${Date.now()}:${++keyCounter}`

  it('returns success:true for the first request', async () => {
    const { rateLimit } = await import('@/lib/security/rate-limiter')
    const result = await rateLimit({ key: nextKey(), limit: 5, window: 60_000 })
    expect(result.success).toBe(true)
  })

  it('decrements remaining with each call', async () => {
    const { rateLimit } = await import('@/lib/security/rate-limiter')
    const key = nextKey()
    const first = await rateLimit({ key, limit: 5, window: 60_000 })
    const second = await rateLimit({ key, limit: 5, window: 60_000 })
    expect(second.remaining).toBeLessThan(first.remaining)
  })

  it('blocks when the limit is exceeded', async () => {
    const { rateLimit } = await import('@/lib/security/rate-limiter')
    const key = nextKey()
    // Exhaust the limit
    for (let i = 0; i < 3; i++) {
      await rateLimit({ key, limit: 3, window: 60_000 })
    }
    // This 4th call exceeds the limit
    const over = await rateLimit({ key, limit: 3, window: 60_000 })
    expect(over.success).toBe(false)
  })

  it('returns remaining = 0 when blocked', async () => {
    const { rateLimit } = await import('@/lib/security/rate-limiter')
    const key = nextKey()
    for (let i = 0; i <= 2; i++) {
      await rateLimit({ key, limit: 2, window: 60_000 })
    }
    const result = await rateLimit({ key, limit: 2, window: 60_000 })
    expect(result.remaining).toBe(0)
  })

  it('sets retryAfter only when blocked', async () => {
    const { rateLimit } = await import('@/lib/security/rate-limiter')
    const key = nextKey()
    const ok = await rateLimit({ key, limit: 10, window: 60_000 })
    expect(ok.retryAfter).toBeUndefined()

    for (let i = 0; i <= 10; i++) {
      await rateLimit({ key, limit: 10, window: 60_000 })
    }
    const blocked = await rateLimit({ key, limit: 10, window: 60_000 })
    expect(blocked.retryAfter).toBeGreaterThan(0)
  })

  it('returns correct limit value in result', async () => {
    const { rateLimit } = await import('@/lib/security/rate-limiter')
    const result = await rateLimit({ key: nextKey(), limit: 42, window: 60_000 })
    expect(result.limit).toBe(42)
  })

  it('returns a resetTime in the future', async () => {
    const { rateLimit } = await import('@/lib/security/rate-limiter')
    const before = Date.now()
    const result = await rateLimit({ key: nextKey(), limit: 5, window: 60_000 })
    expect(result.resetTime).toBeGreaterThan(before)
  })

  it('different keys do not interfere with each other', async () => {
    const { rateLimit } = await import('@/lib/security/rate-limiter')
    const keyA = nextKey()
    const keyB = nextKey()
    // Exhaust keyA
    for (let i = 0; i <= 2; i++) {
      await rateLimit({ key: keyA, limit: 2, window: 60_000 })
    }
    // keyB should still have full budget
    const resultB = await rateLimit({ key: keyB, limit: 2, window: 60_000 })
    expect(resultB.success).toBe(true)
  })
})

// ─── 2. EnterpriseRateLimiter.checkRateLimit() ────────────────────────────────

describe('EnterpriseRateLimiter — checkRateLimit()', () => {
  it('returns success:true on first request', async () => {
    const { EnterpriseRateLimiter } = await import('@/lib/security/rate-limiter')
    const limiter = new EnterpriseRateLimiter({ windowMs: 60_000, maxRequests: 10 })
    const req = makeRequest(`10.0.${Date.now() % 255}.1`)
    const result = await limiter.checkRateLimit(req)
    expect(result.success).toBe(true)
  })

  it('returns success:false after exceeding maxRequests', async () => {
    const { EnterpriseRateLimiter } = await import('@/lib/security/rate-limiter')
    const limiter = new EnterpriseRateLimiter({ windowMs: 60_000, maxRequests: 3 })
    // Use a unique IP to avoid conflicts with other tests
    const req = makeRequest(`192.168.${Date.now() % 255}.${(Date.now() % 100) + 1}`)
    const results = await fireRequests(limiter, req, 4)
    expect(results[3].success).toBe(false)
  })

  it('remaining decreases on each request', async () => {
    const { EnterpriseRateLimiter } = await import('@/lib/security/rate-limiter')
    const limiter = new EnterpriseRateLimiter({ windowMs: 60_000, maxRequests: 10 })
    const ip = `172.16.${Date.now() % 255}.${(Date.now() % 100) + 1}`
    const req = makeRequest(ip)
    const r1 = await limiter.checkRateLimit(req)
    const r2 = await limiter.checkRateLimit(req)
    expect(r2.remaining).toBeLessThan(r1.remaining)
  })

  it('exposes retryAfter when limit is exceeded', async () => {
    const { EnterpriseRateLimiter } = await import('@/lib/security/rate-limiter')
    const limiter = new EnterpriseRateLimiter({ windowMs: 60_000, maxRequests: 2 })
    const ip = `10.1.${Date.now() % 255}.${(Date.now() % 100) + 1}`
    const req = makeRequest(ip)
    await fireRequests(limiter, req, 3)
    const blocked = await limiter.checkRateLimit(req)
    expect(blocked.success).toBe(false)
    expect(blocked.retryAfter).toBeGreaterThan(0)
  })

  it('calls onLimitReached callback when limit is exceeded', async () => {
    const { EnterpriseRateLimiter } = await import('@/lib/security/rate-limiter')
    const callback = vi.fn()
    const limiter = new EnterpriseRateLimiter({
      windowMs: 60_000,
      maxRequests: 2,
      onLimitReached: callback,
    })
    const ip = `10.2.${Date.now() % 255}.${(Date.now() % 100) + 1}`
    const req = makeRequest(ip)
    await fireRequests(limiter, req, 3)
    expect(callback).toHaveBeenCalled()
  })

  it('does NOT call onLimitReached when under the limit', async () => {
    const { EnterpriseRateLimiter } = await import('@/lib/security/rate-limiter')
    const callback = vi.fn()
    const limiter = new EnterpriseRateLimiter({
      windowMs: 60_000,
      maxRequests: 10,
      onLimitReached: callback,
    })
    const req = makeRequest(`10.3.${Date.now() % 255}.1`)
    await limiter.checkRateLimit(req)
    expect(callback).not.toHaveBeenCalled()
  })

  it('requests from different IPs do not share counters', async () => {
    const { EnterpriseRateLimiter } = await import('@/lib/security/rate-limiter')
    const limiter = new EnterpriseRateLimiter({ windowMs: 60_000, maxRequests: 2 })
    const ipA = `10.10.${Date.now() % 200}.1`
    const ipB = `10.10.${Date.now() % 200}.2`
    const reqA = makeRequest(ipA, 'tenant-isolation-test')
    const reqB = makeRequest(ipB, 'tenant-isolation-test')

    // Exhaust ipA
    await fireRequests(limiter, reqA, 3)

    // ipB should still have full budget
    const resultB = await limiter.checkRateLimit(reqB)
    expect(resultB.success).toBe(true)
  })

  it('returns limit = maxRequests from the config', async () => {
    const { EnterpriseRateLimiter } = await import('@/lib/security/rate-limiter')
    const limiter = new EnterpriseRateLimiter({ windowMs: 60_000, maxRequests: 77 })
    const req = makeRequest(`10.4.${Date.now() % 255}.1`)
    const result = await limiter.checkRateLimit(req)
    expect(result.limit).toBe(77)
  })
})

// ─── 3. Pre-configured limiters ──────────────────────────────────────────────

describe('authRateLimiter — 5 req/min', () => {
  it('allows the 5th request', async () => {
    const { authRateLimiter } = await import('@/lib/security/rate-limiter')
    const ip = `203.0.${Date.now() % 200}.${(Date.now() % 50) + 1}`
    const req = makeRequest(ip)
    const results = await fireRequests(authRateLimiter, req, 5)
    expect(results[4].success).toBe(true)
  })

  it('blocks the 6th request', async () => {
    const { authRateLimiter } = await import('@/lib/security/rate-limiter')
    const ip = `203.1.${Date.now() % 200}.${(Date.now() % 50) + 1}`
    const req = makeRequest(ip)
    await fireRequests(authRateLimiter, req, 5)
    const blocked = await authRateLimiter.checkRateLimit(req)
    expect(blocked.success).toBe(false)
  })
})

describe('apiRateLimiter — 100 req/min', () => {
  it('allows the 100th request', async () => {
    const { apiRateLimiter } = await import('@/lib/security/rate-limiter')
    const ip = `198.51.${Date.now() % 200}.${(Date.now() % 50) + 1}`
    const req = makeRequest(ip)
    const results = await fireRequests(apiRateLimiter, req, 100)
    expect(results[99].success).toBe(true)
  })

  it('blocks the 101st request', async () => {
    const { apiRateLimiter } = await import('@/lib/security/rate-limiter')
    const ip = `198.52.${Date.now() % 200}.${(Date.now() % 50) + 1}`
    const req = makeRequest(ip)
    await fireRequests(apiRateLimiter, req, 100)
    const blocked = await apiRateLimiter.checkRateLimit(req)
    expect(blocked.success).toBe(false)
  })
})

describe('cortexRateLimiter — 50 req/min', () => {
  it('allows the 50th request', async () => {
    const { cortexRateLimiter } = await import('@/lib/security/rate-limiter')
    const ip = `192.0.${Date.now() % 200}.${(Date.now() % 50) + 1}`
    const req = makeRequest(ip)
    const results = await fireRequests(cortexRateLimiter, req, 50)
    expect(results[49].success).toBe(true)
  })

  it('blocks the 51st request', async () => {
    const { cortexRateLimiter } = await import('@/lib/security/rate-limiter')
    const ip = `192.1.${Date.now() % 200}.${(Date.now() % 50) + 1}`
    const req = makeRequest(ip)
    await fireRequests(cortexRateLimiter, req, 50)
    const blocked = await cortexRateLimiter.checkRateLimit(req)
    expect(blocked.success).toBe(false)
  })
})

// ─── 4. createRateLimitMiddleware() response shape ────────────────────────────

describe('createRateLimitMiddleware()', () => {
  it('returns a 429 Response when limit exceeded', async () => {
    const { EnterpriseRateLimiter, createRateLimitMiddleware } = await import(
      '@/lib/security/rate-limiter'
    )
    const limiter = new EnterpriseRateLimiter({ windowMs: 60_000, maxRequests: 1 })
    const middleware = createRateLimitMiddleware(limiter)
    const ip = `10.99.${Date.now() % 200}.1`
    const req = makeRequest(ip)

    // First request — under limit, middleware returns headers object (not a Response)
    await middleware(req)
    // Second request — over limit, should return a 429 Response
    const response = await middleware(req)

    expect(response).toBeInstanceOf(Response)
    if (response instanceof Response) {
      expect(response.status).toBe(429)
    }
  })

  it('429 response body has success:false and RATE_LIMIT_EXCEEDED code', async () => {
    const { EnterpriseRateLimiter, createRateLimitMiddleware } = await import(
      '@/lib/security/rate-limiter'
    )
    const limiter = new EnterpriseRateLimiter({ windowMs: 60_000, maxRequests: 1 })
    const middleware = createRateLimitMiddleware(limiter)
    const ip = `10.98.${Date.now() % 200}.1`
    const req = makeRequest(ip)
    await middleware(req)
    const response = (await middleware(req)) as Response
    const body = await response.json() as Record<string, unknown>
    expect(body.success).toBe(false)
    const error = body.error as Record<string, unknown>
    expect(error.code).toBe('RATE_LIMIT_EXCEEDED')
  })

  it('429 response includes Retry-After header', async () => {
    const { EnterpriseRateLimiter, createRateLimitMiddleware } = await import(
      '@/lib/security/rate-limiter'
    )
    const limiter = new EnterpriseRateLimiter({ windowMs: 60_000, maxRequests: 1 })
    const middleware = createRateLimitMiddleware(limiter)
    const ip = `10.97.${Date.now() % 200}.1`
    const req = makeRequest(ip)
    await middleware(req)
    const response = (await middleware(req)) as Response
    expect(response.headers.get('Retry-After')).toBeTruthy()
  })

  it('returns headers object (not Response) when under limit', async () => {
    const { EnterpriseRateLimiter, createRateLimitMiddleware } = await import(
      '@/lib/security/rate-limiter'
    )
    const limiter = new EnterpriseRateLimiter({ windowMs: 60_000, maxRequests: 100 })
    const middleware = createRateLimitMiddleware(limiter)
    const req = makeRequest(`10.96.${Date.now() % 200}.1`)
    const result = await middleware(req)
    // Not a Response — it's a plain object with headers
    expect(result).not.toBeInstanceOf(Response)
    const headers = (result as { headers: Record<string, string> }).headers
    expect(headers['X-RateLimit-Limit']).toBeTruthy()
    expect(headers['X-RateLimit-Remaining']).toBeTruthy()
  })
})

// ─── 5. Key isolation between tenants ─────────────────────────────────────────

describe('Rate limiter — tenant-level key isolation', () => {
  it('exhausting limit for tenant-A does not block tenant-B', async () => {
    const { EnterpriseRateLimiter } = await import('@/lib/security/rate-limiter')
    const limiter = new EnterpriseRateLimiter({ windowMs: 60_000, maxRequests: 3 })
    const sharedIp = `172.20.${Date.now() % 200}.1`

    // Same IP but different tenant headers produce different keys
    const reqA = makeRequest(sharedIp, 'tenant-aaa')
    const reqB = makeRequest(sharedIp, 'tenant-bbb')

    // Exhaust tenant-A
    await fireRequests(limiter, reqA, 4)

    // Tenant-B with same IP should still be allowed
    const resultB = await limiter.checkRateLimit(reqB)
    expect(resultB.success).toBe(true)
  })
})
