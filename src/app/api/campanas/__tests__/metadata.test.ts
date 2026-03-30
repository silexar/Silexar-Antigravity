/**
 * Metadata APIs tests (emisoras/bloques)
 */
import { vi, describe, it, expect, beforeEach } from 'vitest'
vi.mock('next/server');
const { GET: GET_EMISORAS } = require('@/app/api/campanas/metadata/emisoras/route')
const { GET: GET_BLOQUES } = require('@/app/api/campanas/metadata/bloques/route')

interface MockNextResponseInit {
  status?: number;
  headers?: Record<string, string>;
}

// Mock minimal NextResponse.json to run in Jest without Next runtime
vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, opts?: MockNextResponseInit) => ({
      status: opts?.status ?? 200,
      headers: opts?.headers ?? {},
      async json() { return body },
    }),
  },
}))

vi.mock('@/lib/security/rate-limiter', () => ({ rateLimit: vi.fn().mockResolvedValue({ success: true, limit: 300, remaining: 299, resetTime: Date.now() + 60000 }) }))

describe.skip('Campañas Metadata API', () => {
  it('GET /metadata/emisoras', async () => {
    const req: { headers: { get: () => string } } = { headers: { get: () => '127.0.0.1' } }
    const res = await GET_EMISORAS(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.emisoras)).toBe(true)
  })

  it('GET /metadata/bloques', async () => {
    const req: { headers: { get: () => string } } = { headers: { get: () => '127.0.0.1' } }
    const res = await GET_BLOQUES(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.bloques)).toBe(true)
  })
})
