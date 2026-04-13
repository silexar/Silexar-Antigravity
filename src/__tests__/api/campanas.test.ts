/**
 * Tests for /api/campanas (GET list + POST create)
 *
 * withApiRoute is mocked to simulate auth gate:
 *   - No userId header → 401
 *   - Valid headers → passes ctx to inner handler
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Global mocks ──────────────────────────────────────────────────────────────

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

// ── DB mock ───────────────────────────────────────────────────────────────────

const mockInsertReturning = vi.fn().mockResolvedValue([{
  id: 'camp-001',
  codigo: 'CAM-2025-0001',
  nombre: 'Campaña Test',
  estado: 'planificacion',
  tenantId: 'tenant-001',
}])
const mockInsertValues = vi.fn().mockReturnValue({ returning: mockInsertReturning })
const mockInsert = vi.fn().mockReturnValue({ values: mockInsertValues })

const mockSelectOffset = vi.fn().mockResolvedValue([])
const mockDbChain = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  leftJoin: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  offset: mockSelectOffset,
  insert: mockInsert,
}
vi.mock('@/lib/db', () => ({
  isDatabaseConnected: vi.fn().mockReturnValue(true),
  getDB: vi.fn(() => mockDbChain),
  db: mockDbChain,
}))

vi.mock('@/lib/db/schema', () => ({
  campanas: { id: 'id', tenantId: 'tenantId', nombre: 'nombre', estado: 'estado', tipoCampana: 'tipoCampana' },
  anunciantes: { id: 'id', nombreRazonSocial: 'nombreRazonSocial' },
  users: { id: 'id', name: 'name' },
  campanasCunas: {},
  campanasEmisoras: {},
}))

// PropiedadesIntegrationAPI (cross-module dependency, unused in basic paths)
vi.mock('../../../modules/propiedades/api/PropiedadesIntegrationAPI', () => ({
  PropiedadesIntegrationAPI: vi.fn().mockImplementation(() => ({
    validarCoherenciaPropiedades: vi.fn().mockResolvedValue({ isFailure: false }),
  })),
}))
vi.mock('../../../modules/propiedades/infrastructure/repositories/PropiedadesDrizzleRepository', () => ({
  TipoPropiedadDrizzleRepository: vi.fn(),
  ValorPropiedadDrizzleRepository: vi.fn(),
}))

vi.mock('@/lib/security/audit-logger', () => ({
  auditLogger: { log: vi.fn().mockResolvedValue(undefined), logEvent: vi.fn().mockResolvedValue(undefined) },
}))
vi.mock('@/lib/security/audit-types', () => ({
  AuditEventType: {
    DATA_READ: 'DATA_READ', DATA_CREATE: 'DATA_CREATE', DATA_UPDATE: 'DATA_UPDATE',
    DATA_DELETE: 'DATA_DELETE', DATA_EXPORT: 'DATA_EXPORT', ADMIN_ACTION: 'ADMIN_ACTION',
    API_CALL: 'API_CALL',
  },
  AuditSeverity: { LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH', CRITICAL: 'CRITICAL' },
}))
vi.mock('@/lib/security/rate-limiter', () => ({
  authRateLimiter:   { checkRateLimit: vi.fn().mockResolvedValue({ success: true }) },
  apiRateLimiter:    { checkRateLimit: vi.fn().mockResolvedValue({ success: true }) },
  cortexRateLimiter: { checkRateLimit: vi.fn().mockResolvedValue({ success: true }) },
}))
vi.mock('@/lib/security/rbac', () => ({
  checkPermission: vi.fn().mockReturnValue(true),
}))
vi.mock('@/lib/security/session-blacklist', () => ({
  isTokenRevoked: vi.fn().mockResolvedValue(false),
}))
vi.mock('@/lib/observability', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
  traceRequest: vi.fn(),
}))

// ── withApiRoute mock ─────────────────────────────────────────────────────────

vi.mock('@/lib/api/with-api-route', () => ({
  withApiRoute: (
    _config: { skipCsrf?: boolean; resource?: string; action?: string },
    handler: (args: { ctx: Record<string, string | boolean>; req: Request; ip: string }) => Promise<Response>
  ) =>
    async (req: Request) => {
      const userId = req.headers.get('x-silexar-user-id') || ''
      if (!userId) {
        return new Response(
          JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }),
          { status: 401 }
        )
      }
      const ctx = {
        userId,
        role: req.headers.get('x-silexar-user-role') || 'ADMIN',
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

const AUTH_HEADERS = {
  'x-silexar-user-id': 'user-001',
  'x-silexar-user-role': 'ADMIN',
  'x-silexar-tenant-id': 'tenant-001',
}

async function json(res: Response) {
  return res.json() as Promise<Record<string, unknown>>
}

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/campanas
// ══════════════════════════════════════════════════════════════════════════════

describe('GET /api/campanas', () => {
  let GET: (req: Request) => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()
    mockSelectOffset.mockResolvedValue([])
    const mod = await import('@/app/api/campanas/route')
    GET = mod.GET as (req: Request) => Promise<Response>
  })

  it('returns 401 when unauthenticated', async () => {
    const res = await GET(new Request('http://localhost:3000/api/campanas'))
    expect(res.status).toBe(401)
  })

  it('returns 200 with empty list when no campaigns exist', async () => {
    const res = await GET(new Request('http://localhost:3000/api/campanas', { headers: AUTH_HEADERS }))
    expect(res.status).toBe(200)
    const body = await json(res)
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
  })

  it('returns paginated data with meta.pagination', async () => {
    const res = await GET(new Request('http://localhost:3000/api/campanas?page=1&pageSize=20', { headers: AUTH_HEADERS }))
    expect(res.status).toBe(200)
    const body = await json(res)
    const meta = body.meta as Record<string, unknown>
    expect(meta).toBeDefined()
    expect(meta.pagination).toBeDefined()
  })

  it('returns campaigns list with correct shape when data exists', async () => {
    mockSelectOffset.mockResolvedValueOnce([{
      campana: {
        id: 'camp-001', codigo: 'CAM-2025-0001', nombre: 'Campaña Verano',
        tipoCampana: 'branding', estado: 'en_aire', fechaInicio: '2025-01-01',
        fechaFin: '2025-03-31', presupuestoTotal: '5000000', presupuestoConsumido: '1200000',
        objetivoSpots: 100, spotsEmitidos: 42, tenantId: 'tenant-001', prioridad: 'alta',
        ejecutivoId: null,
      },
      anuncianteNombre: 'Empresa ABC',
      ejecutivoNombre: 'Juan Vendedor',
    }])

    const res = await GET(new Request('http://localhost:3000/api/campanas', { headers: AUTH_HEADERS }))
    expect(res.status).toBe(200)
    const body = await json(res)
    const data = body.data as Record<string, unknown>[]
    expect(data).toHaveLength(1)
    expect(data[0].nombre).toBe('Campaña Verano')
    expect(data[0].estado).toBe('en_aire')
  })

  it('calculates porcentajeAvance correctly', async () => {
    mockSelectOffset.mockResolvedValueOnce([{
      campana: {
        id: 'camp-002', codigo: 'CAM-2025-0002', nombre: 'Campaña B',
        tipoCampana: 'promocional', estado: 'en_aire', fechaInicio: '2025-01-01',
        fechaFin: '2025-06-30', presupuestoTotal: '1000000', presupuestoConsumido: '0',
        objetivoSpots: 200, spotsEmitidos: 50, tenantId: 'tenant-001', prioridad: 'normal',
        ejecutivoId: null,
      },
      anuncianteNombre: null,
      ejecutivoNombre: null,
    }])

    const res = await GET(new Request('http://localhost:3000/api/campanas', { headers: AUTH_HEADERS }))
    const body = await json(res)
    const data = body.data as Record<string, unknown>[]
    expect(data[0].porcentajeAvance).toBe(25) // 50/200 * 100
    expect(data[0].anuncianteNombre).toBe('Sin Anunciante')
  })

  it('supports search query parameter', async () => {
    const res = await GET(new Request(
      'http://localhost:3000/api/campanas?search=Verano',
      { headers: AUTH_HEADERS }
    ))
    expect(res.status).toBe(200)
  })

  it('supports estado filter parameter', async () => {
    const res = await GET(new Request(
      'http://localhost:3000/api/campanas?estado=en_aire',
      { headers: AUTH_HEADERS }
    ))
    expect(res.status).toBe(200)
  })

  it('returns 500 when DB throws unexpectedly', async () => {
    mockSelectOffset.mockRejectedValueOnce(new Error('DB connection lost'))
    const res = await GET(new Request('http://localhost:3000/api/campanas', { headers: AUTH_HEADERS }))
    expect(res.status).toBe(500)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/campanas
// ══════════════════════════════════════════════════════════════════════════════

describe('POST /api/campanas', () => {
  let POST: (req: Request) => Promise<Response>

  const validBody = {
    nombre: 'Campaña Nueva',
    anuncianteId: '00000000-0000-0000-0000-000000000001',
    tipoCampana: 'branding',
    fechaInicio: '2025-06-01',
    fechaFin: '2025-08-31',
    presupuestoTotal: 3000000,
    objetivoSpots: 150,
    prioridad: 'normal',
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    mockInsertReturning.mockResolvedValue([{
      id: 'camp-new-001',
      codigo: 'CAM-2025-0042',
      nombre: 'Campaña Nueva',
      estado: 'planificacion',
      tenantId: 'tenant-001',
    }])
    const mod = await import('@/app/api/campanas/route')
    POST = mod.POST as (req: Request) => Promise<Response>
  })

  it('returns 401 when unauthenticated', async () => {
    const res = await POST(new Request('http://localhost:3000/api/campanas', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validBody),
    }))
    expect(res.status).toBe(401)
  })

  it('creates campaign and returns 201', async () => {
    const res = await POST(new Request('http://localhost:3000/api/campanas', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...AUTH_HEADERS },
      body: JSON.stringify(validBody),
    }))
    expect(res.status).toBe(201)
    const body = await json(res)
    expect(body.success).toBe(true)
    const data = body.data as Record<string, unknown>
    expect(data.id).toBe('camp-new-001')
  })

  it('returns 400 when nombre is missing', async () => {
    const { nombre: _n, ...noNombre } = validBody
    const res = await POST(new Request('http://localhost:3000/api/campanas', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...AUTH_HEADERS },
      body: JSON.stringify(noNombre),
    }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when anuncianteId is not a valid UUID', async () => {
    const res = await POST(new Request('http://localhost:3000/api/campanas', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...AUTH_HEADERS },
      body: JSON.stringify({ ...validBody, anuncianteId: 'not-a-uuid' }),
    }))
    expect(res.status).toBe(400)
  })

  it('returns 400 on malformed JSON body', async () => {
    const res = await POST(new Request('http://localhost:3000/api/campanas', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...AUTH_HEADERS },
      body: 'definitely-not-json',
    }))
    expect(res.status).toBe(400)
  })

  it('returns 500 when DB insert throws', async () => {
    mockInsertReturning.mockRejectedValueOnce(new Error('DB error'))
    const res = await POST(new Request('http://localhost:3000/api/campanas', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...AUTH_HEADERS },
      body: JSON.stringify(validBody),
    }))
    expect(res.status).toBe(500)
  })

  it('accepts campaign without optional fields (uses defaults)', async () => {
    const minimal = {
      nombre: 'Mínima',
      anuncianteId: '00000000-0000-0000-0000-000000000001',
    }
    const res = await POST(new Request('http://localhost:3000/api/campanas', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...AUTH_HEADERS },
      body: JSON.stringify(minimal),
    }))
    expect(res.status).toBe(201)
  })
})
