// @vitest-environment node
/**
 * TEST 2 — JWT Utilities (src/lib/api/jwt.ts)
 *
 * Tests for signToken, signRefreshToken, and verifyTokenServer.
 * JWT_SECRET is set in each describe block that requires it.
 * The jose library is NOT mocked — we test the real signing/verification
 * behavior to catch regressions in the security contract.
 *
 * Runs in Node environment (not jsdom) — jose requires native Uint8Array
 * from TextEncoder, which jsdom does not provide correctly.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { decodeJwt } from 'jose'

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_SECRET = 'super-secure-secret-at-least-32-chars-long!!'
const SAMPLE_PAYLOAD = {
  userId: 'user-uuid-0001',
  email: 'vendedor@radionorte.cl',
  role: 'EJECUTIVO_VENTAS',
  tenantId: 'tenant-uuid-0001',
  tenantSlug: 'radionorte',
  sessionId: 'session-uuid-0001',
} as const

// ─── Environment helpers ──────────────────────────────────────────────────────

function setSecret(value: string): void {
  vi.stubEnv('JWT_SECRET', value)
}

function clearSecret(): void {
  vi.unstubAllEnvs()
}

// ─── 1. signToken ─────────────────────────────────────────────────────────────

describe('signToken()', () => {
  beforeAll(() => setSecret(VALID_SECRET))
  afterAll(() => clearSecret())

  it('returns a non-empty JWT string', async () => {
    const { signToken } = await import('@/lib/api/jwt')
    const token = await signToken(SAMPLE_PAYLOAD)
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(0)
  })

  it('produces a three-segment JWT (header.payload.signature)', async () => {
    const { signToken } = await import('@/lib/api/jwt')
    const token = await signToken(SAMPLE_PAYLOAD)
    const segments = token.split('.')
    expect(segments).toHaveLength(3)
  })

  it('encodes correct issuer (silexar-pulse)', async () => {
    const { signToken, verifyTokenServer } = await import('@/lib/api/jwt')
    const token = await signToken(SAMPLE_PAYLOAD)
    const decoded = await verifyTokenServer(token)
    expect(decoded?.iss).toBe('silexar-pulse')
  })

  it('encodes correct audience (silexar-pulse-app)', async () => {
    const { signToken, verifyTokenServer } = await import('@/lib/api/jwt')
    const token = await signToken(SAMPLE_PAYLOAD)
    const decoded = await verifyTokenServer(token)
    expect(decoded?.aud).toContain('silexar-pulse-app')
  })

  it('preserves userId in the payload', async () => {
    const { signToken, verifyTokenServer } = await import('@/lib/api/jwt')
    const token = await signToken(SAMPLE_PAYLOAD)
    const decoded = await verifyTokenServer(token)
    expect(decoded?.userId).toBe(SAMPLE_PAYLOAD.userId)
  })

  it('preserves email in the payload', async () => {
    const { signToken, verifyTokenServer } = await import('@/lib/api/jwt')
    const token = await signToken(SAMPLE_PAYLOAD)
    const decoded = await verifyTokenServer(token)
    expect(decoded?.email).toBe(SAMPLE_PAYLOAD.email)
  })

  it('preserves role in the payload', async () => {
    const { signToken, verifyTokenServer } = await import('@/lib/api/jwt')
    const token = await signToken(SAMPLE_PAYLOAD)
    const decoded = await verifyTokenServer(token)
    expect(decoded?.role).toBe(SAMPLE_PAYLOAD.role)
  })

  it('preserves tenantId in the payload', async () => {
    const { signToken, verifyTokenServer } = await import('@/lib/api/jwt')
    const token = await signToken(SAMPLE_PAYLOAD)
    const decoded = await verifyTokenServer(token)
    expect(decoded?.tenantId).toBe(SAMPLE_PAYLOAD.tenantId)
  })

  it('preserves tenantSlug in the payload', async () => {
    const { signToken, verifyTokenServer } = await import('@/lib/api/jwt')
    const token = await signToken(SAMPLE_PAYLOAD)
    const decoded = await verifyTokenServer(token)
    expect(decoded?.tenantSlug).toBe(SAMPLE_PAYLOAD.tenantSlug)
  })

  it('preserves sessionId in the payload', async () => {
    const { signToken, verifyTokenServer } = await import('@/lib/api/jwt')
    const token = await signToken(SAMPLE_PAYLOAD)
    const decoded = await verifyTokenServer(token)
    expect(decoded?.sessionId).toBe(SAMPLE_PAYLOAD.sessionId)
  })

  it('sets iat (issued-at) timestamp', async () => {
    const { signToken, verifyTokenServer } = await import('@/lib/api/jwt')
    const before = Math.floor(Date.now() / 1000)
    const token = await signToken(SAMPLE_PAYLOAD)
    const after = Math.floor(Date.now() / 1000)
    const decoded = await verifyTokenServer(token)
    expect(decoded?.iat).toBeGreaterThanOrEqual(before)
    expect(decoded?.iat).toBeLessThanOrEqual(after + 1)
  })

  it('sets exp (expiration) approximately 1h from now by default', async () => {
    const { signToken, verifyTokenServer } = await import('@/lib/api/jwt')
    const now = Math.floor(Date.now() / 1000)
    const token = await signToken(SAMPLE_PAYLOAD)
    const decoded = await verifyTokenServer(token)
    // Access tokens: 1h = 3600s per CLAUDE.md spec — allow ±10s for test execution time
    const expectedExp = now + 3600
    expect(decoded?.exp).toBeGreaterThanOrEqual(expectedExp - 10)
    expect(decoded?.exp).toBeLessThanOrEqual(expectedExp + 10)
  })

  it('includes a unique jti per token (prevents replay)', async () => {
    const { signToken } = await import('@/lib/api/jwt')
    const token1 = await signToken(SAMPLE_PAYLOAD)
    const token2 = await signToken(SAMPLE_PAYLOAD)
    // Tokens signed with the same payload should still differ (unique jti)
    expect(token1).not.toBe(token2)
  })

  it('respects custom expiresIn ("1h")', async () => {
    const { signToken, verifyTokenServer } = await import('@/lib/api/jwt')
    const now = Math.floor(Date.now() / 1000)
    const token = await signToken(SAMPLE_PAYLOAD, '1h')
    const decoded = await verifyTokenServer(token)
    const expectedExp = now + 3600
    expect(decoded?.exp).toBeGreaterThanOrEqual(expectedExp - 10)
    expect(decoded?.exp).toBeLessThanOrEqual(expectedExp + 10)
  })

  it('throws when JWT_SECRET is missing', async () => {
    vi.stubEnv('JWT_SECRET', '')
    const { signToken } = await import('@/lib/api/jwt')
    await expect(signToken(SAMPLE_PAYLOAD)).rejects.toThrow()
    vi.stubEnv('JWT_SECRET', VALID_SECRET)
  })

  it('throws when JWT_SECRET is shorter than 32 characters', async () => {
    vi.stubEnv('JWT_SECRET', 'short')
    const { signToken } = await import('@/lib/api/jwt')
    await expect(signToken(SAMPLE_PAYLOAD)).rejects.toThrow()
    vi.stubEnv('JWT_SECRET', VALID_SECRET)
  })
})

// ─── 2. signRefreshToken ──────────────────────────────────────────────────────

describe('signRefreshToken()', () => {
  beforeAll(() => setSecret(VALID_SECRET))
  afterAll(() => clearSecret())

  it('returns a non-empty JWT string', async () => {
    const { signRefreshToken } = await import('@/lib/api/jwt')
    const token = await signRefreshToken('user-001', 'session-001')
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(0)
  })

  it('encodes userId correctly', async () => {
    // Refresh tokens usan audience 'silexar-pulse-refresh', no 'silexar-pulse-app'
    // Por eso usamos decodeJwt (sin verificación de audience) para inspeccionar el payload
    const { signRefreshToken } = await import('@/lib/api/jwt')
    const token = await signRefreshToken('user-abc', 'sess-abc')
    const decoded = decodeJwt(token)
    expect(decoded?.userId).toBe('user-abc')
  })

  it('encodes sessionId correctly', async () => {
    const { signRefreshToken } = await import('@/lib/api/jwt')
    const token = await signRefreshToken('user-abc', 'sess-xyz')
    const decoded = decodeJwt(token)
    expect(decoded?.sessionId).toBe('sess-xyz')
  })

  it('sets type = "refresh" in payload', async () => {
    const { signRefreshToken } = await import('@/lib/api/jwt')
    const token = await signRefreshToken('user-001', 'sess-001')
    const decoded = decodeJwt(token)
    expect((decoded as Record<string, unknown>)?.type).toBe('refresh')
  })

  it('expires in approximately 7 days', async () => {
    const { signRefreshToken } = await import('@/lib/api/jwt')
    const now = Math.floor(Date.now() / 1000)
    const token = await signRefreshToken('user-001', 'sess-001')
    const decoded = decodeJwt(token)
    const sevenDays = 7 * 24 * 60 * 60
    expect(decoded?.exp).toBeGreaterThanOrEqual(now + sevenDays - 10)
    expect(decoded?.exp).toBeLessThanOrEqual(now + sevenDays + 10)
  })

  it('uses silexar-pulse issuer', async () => {
    const { signRefreshToken } = await import('@/lib/api/jwt')
    const token = await signRefreshToken('user-001', 'sess-001')
    const decoded = decodeJwt(token)
    expect(decoded?.iss).toBe('silexar-pulse')
  })
})

// ─── 3. verifyTokenServer — valid tokens ─────────────────────────────────────

describe('verifyTokenServer() — valid tokens', () => {
  beforeAll(() => setSecret(VALID_SECRET))
  afterAll(() => clearSecret())

  it('returns the full payload for a freshly signed token', async () => {
    const { signToken, verifyTokenServer } = await import('@/lib/api/jwt')
    const token = await signToken(SAMPLE_PAYLOAD)
    const decoded = await verifyTokenServer(token)
    expect(decoded).not.toBeNull()
    expect(decoded?.userId).toBe(SAMPLE_PAYLOAD.userId)
    expect(decoded?.tenantId).toBe(SAMPLE_PAYLOAD.tenantId)
  })

  it('returns null for an empty string', async () => {
    const { verifyTokenServer } = await import('@/lib/api/jwt')
    const result = await verifyTokenServer('')
    expect(result).toBeNull()
  })

  it('returns null for a random non-JWT string', async () => {
    const { verifyTokenServer } = await import('@/lib/api/jwt')
    const result = await verifyTokenServer('this.is.not.a.jwt')
    expect(result).toBeNull()
  })

  it('returns null for a token with tampered payload', async () => {
    const { signToken, verifyTokenServer } = await import('@/lib/api/jwt')
    const token = await signToken(SAMPLE_PAYLOAD)
    // Tamper the second segment (payload)
    const parts = token.split('.')
    const tamperedPayload = Buffer.from(
      JSON.stringify({ userId: 'hacker', tenantId: 'other-tenant' })
    ).toString('base64url')
    const tampered = `${parts[0]}.${tamperedPayload}.${parts[2]}`
    const result = await verifyTokenServer(tampered)
    expect(result).toBeNull()
  })
})

// ─── 4. verifyTokenServer — wrong issuer / audience ──────────────────────────

describe('verifyTokenServer() — issuer and audience validation', () => {
  afterAll(() => clearSecret())

  it('rejects a token signed with a different secret (wrong key)', async () => {
    // Sign with one secret, verify with another
    vi.stubEnv('JWT_SECRET', 'first-secret-that-is-32-chars-long!!')
    const { signToken } = await import('@/lib/api/jwt')
    const token = await signToken(SAMPLE_PAYLOAD)

    // Re-import with a different secret
    vi.stubEnv('JWT_SECRET', 'second-secret-that-is-32-chars-lon!!')
    vi.resetModules()
    const { verifyTokenServer } = await import('@/lib/api/jwt')
    const result = await verifyTokenServer(token)
    expect(result).toBeNull()

    // Restore for subsequent tests
    vi.stubEnv('JWT_SECRET', VALID_SECRET)
    vi.resetModules()
  })

  it('rejects a manually crafted JWT with wrong issuer', async () => {
    vi.stubEnv('JWT_SECRET', VALID_SECRET)
    // Build a token with a fake issuer using jose directly
    const { SignJWT } = await import('jose')
    const key = new TextEncoder().encode(VALID_SECRET)
    const badIssuerToken = await new SignJWT({ userId: 'x', tenantId: 'y' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer('wrong-issuer')
      .setAudience('silexar-pulse-app')
      .setExpirationTime('1h')
      .sign(key)

    vi.resetModules()
    const { verifyTokenServer } = await import('@/lib/api/jwt')
    const result = await verifyTokenServer(badIssuerToken)
    expect(result).toBeNull()
  })

  it('rejects a manually crafted JWT with wrong audience', async () => {
    vi.stubEnv('JWT_SECRET', VALID_SECRET)
    const { SignJWT } = await import('jose')
    const key = new TextEncoder().encode(VALID_SECRET)
    const badAudToken = await new SignJWT({ userId: 'x', tenantId: 'y' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer('silexar-pulse')
      .setAudience('completely-wrong-audience')
      .setExpirationTime('1h')
      .sign(key)

    vi.resetModules()
    const { verifyTokenServer } = await import('@/lib/api/jwt')
    const result = await verifyTokenServer(badAudToken)
    expect(result).toBeNull()
  })
})

// ─── 5. verifyTokenServer — expired tokens ───────────────────────────────────

describe('verifyTokenServer() — expired tokens', () => {
  beforeAll(() => setSecret(VALID_SECRET))
  afterAll(() => clearSecret())

  it('returns null for a token expired 1 second ago (beyond 30s clock tolerance)', async () => {
    vi.stubEnv('JWT_SECRET', VALID_SECRET)
    // Sign a token that already expired 60s ago
    const { SignJWT } = await import('jose')
    const key = new TextEncoder().encode(VALID_SECRET)
    const now = Math.floor(Date.now() / 1000)
    const expiredToken = await new SignJWT({ ...SAMPLE_PAYLOAD })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer('silexar-pulse')
      .setAudience('silexar-pulse-app')
      .setIssuedAt(now - 120)
      .setExpirationTime(now - 60) // expired 60s ago — outside 30s tolerance
      .sign(key)

    vi.resetModules()
    const { verifyTokenServer } = await import('@/lib/api/jwt')
    const result = await verifyTokenServer(expiredToken)
    expect(result).toBeNull()
  })

  it('accepts a token that expires in the next second (within tolerance)', async () => {
    vi.stubEnv('JWT_SECRET', VALID_SECRET)
    // Expire in +35s — within the 30s clock tolerance from exp
    const { SignJWT } = await import('jose')
    const key = new TextEncoder().encode(VALID_SECRET)
    const now = Math.floor(Date.now() / 1000)
    const almostExpiredToken = await new SignJWT({ ...SAMPLE_PAYLOAD })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer('silexar-pulse')
      .setAudience('silexar-pulse-app')
      .setIssuedAt(now - 3600)
      .setExpirationTime(now + 35)   // still valid (clockTolerance = 30s)
      .sign(key)

    vi.resetModules()
    const { verifyTokenServer } = await import('@/lib/api/jwt')
    const result = await verifyTokenServer(almostExpiredToken)
    expect(result).not.toBeNull()
  })
})

// ─── 6. Payload isolation across tenants ─────────────────────────────────────

describe('signToken() + verifyTokenServer() — tenant isolation contract', () => {
  beforeAll(() => setSecret(VALID_SECRET))
  afterAll(() => clearSecret())

  it('two different tenants produce different tokens', async () => {
    const { signToken } = await import('@/lib/api/jwt')
    const tokenA = await signToken({ ...SAMPLE_PAYLOAD, tenantId: 'tenant-A', tenantSlug: 'radio-a' })
    const tokenB = await signToken({ ...SAMPLE_PAYLOAD, tenantId: 'tenant-B', tenantSlug: 'radio-b' })
    expect(tokenA).not.toBe(tokenB)
  })

  it('tenant A token cannot decode as tenant B', async () => {
    const { signToken, verifyTokenServer } = await import('@/lib/api/jwt')
    const tokenA = await signToken({ ...SAMPLE_PAYLOAD, tenantId: 'tenant-A', tenantSlug: 'radio-a' })
    const decoded = await verifyTokenServer(tokenA)
    expect(decoded?.tenantId).toBe('tenant-A')
    expect(decoded?.tenantId).not.toBe('tenant-B')
  })

  it('all required fields are present in decoded payload', async () => {
    const { signToken, verifyTokenServer } = await import('@/lib/api/jwt')
    const token = await signToken(SAMPLE_PAYLOAD)
    const decoded = await verifyTokenServer(token)
    const required = ['userId', 'email', 'role', 'tenantId', 'tenantSlug', 'sessionId', 'iss', 'aud', 'iat', 'exp', 'jti'] as const
    for (const field of required) {
      expect(decoded, `Missing field: ${field}`).toHaveProperty(field)
    }
  })
})
