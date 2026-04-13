/**
 * Tests for API response helpers
 * src/lib/api/response.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Sentry before import
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}))

// Mock NextResponse to work outside Next.js context
vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) =>
      new Response(JSON.stringify(body), {
        status: init?.status ?? 200,
        headers: { 'content-type': 'application/json' },
      }),
  },
}))

import {
  apiSuccess,
  apiError,
  apiUnauthorized,
  apiForbidden,
  apiNotFound,
  apiValidationError,
  apiServerError,
  getUserContext,
} from '@/lib/api/response'
import * as Sentry from '@sentry/nextjs'

// Helper
async function parseJson(response: Response) {
  return response.json()
}

// ── apiSuccess ────────────────────────────────────────────────────────────────

describe('apiSuccess', () => {
  it('returns status 200 by default', () => {
    const res = apiSuccess({ id: 1 })
    expect(res.status).toBe(200)
  })

  it('returns custom status code', () => {
    const res = apiSuccess({ id: 1 }, 201)
    expect(res.status).toBe(201)
  })

  it('body has success:true', async () => {
    const res = apiSuccess({ name: 'test' })
    const body = await parseJson(res)
    expect(body.success).toBe(true)
  })

  it('body has correct data', async () => {
    const data = { id: '123', name: 'Contrato A' }
    const res = apiSuccess(data)
    const body = await parseJson(res)
    expect(body.data).toEqual(data)
  })

  it('includes meta when provided', async () => {
    const res = apiSuccess([], 200, { page: 1, total: 50 })
    const body = await parseJson(res)
    expect(body.meta).toEqual({ page: 1, total: 50 })
  })

  it('no meta field when meta is undefined', async () => {
    const res = apiSuccess({ x: 1 })
    const body = await parseJson(res)
    expect(body.meta).toBeUndefined()
  })
})

// ── apiError ──────────────────────────────────────────────────────────────────

describe('apiError', () => {
  it('returns status 400 by default', () => {
    const res = apiError('BAD', 'bad request')
    expect(res.status).toBe(400)
  })

  it('returns custom status', () => {
    const res = apiError('NOT_FOUND', 'not found', 404)
    expect(res.status).toBe(404)
  })

  it('body has success:false', async () => {
    const res = apiError('CODE', 'message')
    const body = await parseJson(res)
    expect(body.success).toBe(false)
  })

  it('body has error.code and error.message', async () => {
    const res = apiError('MY_CODE', 'My error message')
    const body = await parseJson(res)
    expect(body.error.code).toBe('MY_CODE')
    expect(body.error.message).toBe('My error message')
  })

  it('includes details when provided', async () => {
    const res = apiError('VALIDATION_ERROR', 'invalid', 422, { field: 'email' })
    const body = await parseJson(res)
    expect(body.error.details).toEqual({ field: 'email' })
  })

  it('no details when not provided', async () => {
    const res = apiError('ERR', 'msg')
    const body = await parseJson(res)
    expect(body.error.details).toBeUndefined()
  })
})

// ── apiUnauthorized ───────────────────────────────────────────────────────────

describe('apiUnauthorized', () => {
  it('returns 401', () => {
    expect(apiUnauthorized().status).toBe(401)
  })

  it('has UNAUTHORIZED code', async () => {
    const body = await parseJson(apiUnauthorized())
    expect(body.error.code).toBe('UNAUTHORIZED')
  })

  it('uses custom message', async () => {
    const body = await parseJson(apiUnauthorized('Token expired'))
    expect(body.error.message).toBe('Token expired')
  })
})

// ── apiForbidden ──────────────────────────────────────────────────────────────

describe('apiForbidden', () => {
  it('returns 403', () => {
    expect(apiForbidden().status).toBe(403)
  })

  it('has FORBIDDEN code', async () => {
    const body = await parseJson(apiForbidden())
    expect(body.error.code).toBe('FORBIDDEN')
  })
})

// ── apiNotFound ───────────────────────────────────────────────────────────────

describe('apiNotFound', () => {
  it('returns 404', () => {
    expect(apiNotFound().status).toBe(404)
  })

  it('has NOT_FOUND code', async () => {
    const body = await parseJson(apiNotFound())
    expect(body.error.code).toBe('NOT_FOUND')
  })

  it('includes resource name in message', async () => {
    const body = await parseJson(apiNotFound('Contrato'))
    expect(body.error.message).toContain('Contrato')
  })
})

// ── apiValidationError ────────────────────────────────────────────────────────

describe('apiValidationError', () => {
  it('returns 422', () => {
    expect(apiValidationError({}).status).toBe(422)
  })

  it('has VALIDATION_ERROR code', async () => {
    const body = await parseJson(apiValidationError({ email: 'required' }))
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('includes field errors in details', async () => {
    const details = { email: ['Invalid email'], name: ['Too short'] }
    const body = await parseJson(apiValidationError(details))
    expect(body.error.details).toEqual(details)
  })
})

// ── apiServerError ────────────────────────────────────────────────────────────

describe('apiServerError', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 500', () => {
    expect(apiServerError().status).toBe(500)
  })

  it('has INTERNAL_ERROR code', async () => {
    const body = await parseJson(apiServerError())
    expect(body.error.code).toBe('INTERNAL_ERROR')
  })

  it('calls Sentry.captureException for Error instances', () => {
    const err = new Error('DB connection failed')
    apiServerError(err)
    expect(Sentry.captureException).toHaveBeenCalledWith(err)
  })

  it('does NOT call Sentry.captureException for string messages', () => {
    apiServerError('Database unavailable')
    expect(Sentry.captureException).not.toHaveBeenCalled()
  })

  it('accepts string message override', async () => {
    const res = apiServerError('Database unavailable')
    const body = await parseJson(res)
    expect(body.error.message).toBe('Database unavailable')
  })

  it('calls Sentry for unknown error objects', () => {
    const unknownErr = { message: 'weird error', code: 42 }
    apiServerError(unknownErr)
    expect(Sentry.captureException).toHaveBeenCalledWith(unknownErr)
  })
})

// ── getUserContext ────────────────────────────────────────────────────────────

describe('getUserContext', () => {
  function makeRequest(headers: Record<string, string> = {}): Request {
    return new Request('https://app.silexar.com/api/test', { headers })
  }

  it('extracts all standard headers', () => {
    const req = makeRequest({
      'x-silexar-user-id': 'user-001',
      'x-silexar-user-role': 'ADMIN',
      'x-silexar-tenant-id': 'tenant-001',
      'x-silexar-tenant-slug': 'silexar',
      'x-silexar-session-id': 'session-abc',
      'x-silexar-jti': 'jti-xyz',
      'x-request-id': 'req-123',
      'x-silexar-impersonation': 'false',
    })

    const ctx = getUserContext(req)
    expect(ctx.userId).toBe('user-001')
    expect(ctx.role).toBe('ADMIN')
    expect(ctx.tenantId).toBe('tenant-001')
    expect(ctx.tenantSlug).toBe('silexar')
    expect(ctx.sessionId).toBe('session-abc')
    expect(ctx.jti).toBe('jti-xyz')
    expect(ctx.requestId).toBe('req-123')
    expect(ctx.isImpersonating).toBe(false)
  })

  it('defaults all fields to empty string when headers are missing', () => {
    const ctx = getUserContext(makeRequest())
    expect(ctx.userId).toBe('')
    expect(ctx.role).toBe('')
    expect(ctx.tenantId).toBe('')
    expect(ctx.tenantSlug).toBe('')
    expect(ctx.sessionId).toBe('')
    expect(ctx.jti).toBe('')
    expect(ctx.requestId).toBe('')
    expect(ctx.isImpersonating).toBe(false)
  })

  it('detects impersonation flag', () => {
    const req = makeRequest({ 'x-silexar-impersonation': 'true' })
    const ctx = getUserContext(req)
    expect(ctx.isImpersonating).toBe(true)
  })

  it('isImpersonating is false for any value other than "true"', () => {
    expect(getUserContext(makeRequest({ 'x-silexar-impersonation': 'false' })).isImpersonating).toBe(false)
    expect(getUserContext(makeRequest({ 'x-silexar-impersonation': '1' })).isImpersonating).toBe(false)
    expect(getUserContext(makeRequest({ 'x-silexar-impersonation': 'yes' })).isImpersonating).toBe(false)
    expect(getUserContext(makeRequest({})).isImpersonating).toBe(false)
  })
})
