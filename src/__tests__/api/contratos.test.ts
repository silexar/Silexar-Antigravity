/**
 * Tests for /api/contratos (GET list + POST create)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Global mocks ──────────────────────────────────────────────────────────────

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))

// Mock de la capa DB: evita error "DATABASE_URL is required" al importar el route
vi.mock('@/lib/db', () => ({ db: {} }))
vi.mock('@/lib/db/tenant-context', () => ({
  withTenantContext: vi.fn().mockImplementation((_tenantId: string, fn: () => unknown) => fn()),
  withSuperAdminContext: vi.fn().mockImplementation((fn: () => unknown) => fn()),
}))

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) =>
      new Response(JSON.stringify(body), {
        status: init?.status ?? 200,
        headers: { 'content-type': 'application/json' },
      }),
  },
}))

// ── Contrato DDD mocks ────────────────────────────────────────────────────────

const mockContratoSnapshot = {
  id: 'contrato-001',
  numero: { valor: 'CTR-2025-0001' },
  producto: 'Campaña Publicitaria Q1',
  anunciante: 'Empresa ABC',
  tipoContrato: 'campaña',
  fechaInicio: '2025-01-01',
  fechaFin: '2025-03-31',
  totales: { valorNeto: 5000000 },
  moneda: 'CLP',
  estado: { valor: 'activo' },
  progreso: 35,
  ejecutivo: 'Ana García',
  fechaCreacion: '2024-12-01',
}

const mockContrato = {
  toSnapshot: vi.fn(() => mockContratoSnapshot),
}

const mockRepo = {
  search: vi.fn().mockResolvedValue({
    contratos: [],
    total: 0,
    pagina: 1,
    tamanoPagina: 20,
    totalPaginas: 0,
  }),
  getPipelineData: vi.fn().mockResolvedValue([]),
  save: vi.fn().mockResolvedValue(mockContrato),
  findById: vi.fn().mockResolvedValue(null),
}

vi.mock('@/modules/contratos/infrastructure/repositories/DrizzleContratoRepository', () => ({
  // Vitest 4: mockImplementation MUST use a regular function (not arrow) when called with `new`.
  // Arrow functions cannot be used as constructors — Reflect.construct() throws TypeError.
  DrizzleContratoRepository: vi.fn().mockImplementation(function() { return mockRepo }),
}))

// Contrato domain classes
vi.mock('@/modules/contratos/domain/entities/Contrato', () => ({
  Contrato: {
    crear: vi.fn().mockReturnValue({
      id: 'contrato-new-001',
      toSnapshot: vi.fn(() => ({ ...mockContratoSnapshot, id: 'contrato-new-001' })),
    }),
  },
}))
vi.mock('@/modules/contratos/domain/value-objects/NumeroContrato', () => ({
  NumeroContrato: { generar: vi.fn().mockReturnValue({ valor: 'CTR-2025-9999' }) },
}))
vi.mock('@/modules/contratos/domain/value-objects/TotalesContrato', () => ({
  TotalesContrato: vi.fn().mockImplementation(() => ({ valorNeto: 0, valorBruto: 0 })),
}))
vi.mock('@/modules/contratos/domain/value-objects/TerminosPago', () => ({
  TerminosPago: vi.fn().mockImplementation(() => ({})),
}))
vi.mock('@/modules/contratos/domain/value-objects/RiesgoCredito', () => ({
  RiesgoCredito: vi.fn().mockImplementation(() => ({ nivel: 'BAJO' })),
}))
vi.mock('@/modules/contratos/domain/value-objects/MetricasRentabilidad', () => ({
  MetricasRentabilidad: vi.fn().mockImplementation(() => ({})),
}))
vi.mock('@/modules/contratos/domain/value-objects/EstadoContrato', () => ({
  EstadoContrato: vi.fn().mockImplementation(() => ({ valor: 'borrador' })),
}))

// PropiedadesIntegrationAPI
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
// GET /api/contratos
// ══════════════════════════════════════════════════════════════════════════════

describe('GET /api/contratos', () => {
  let GET: (req: Request) => Promise<Response>

  beforeEach(async () => {
    vi.clearAllMocks()
    mockRepo.search.mockResolvedValue({
      contratos: [],
      total: 0,
      pagina: 1,
      tamanoPagina: 20,
      totalPaginas: 0,
    })
    mockRepo.getPipelineData.mockResolvedValue([])
    const mod = await import('@/app/api/contratos/route')
    GET = mod.GET as (req: Request) => Promise<Response>
  })

  it('returns 401 when unauthenticated', async () => {
    const res = await GET(new Request('http://localhost:3000/api/contratos'))
    expect(res.status).toBe(401)
  })

  it('returns 200 with empty list', async () => {
    const res = await GET(new Request('http://localhost:3000/api/contratos', { headers: AUTH_HEADERS }))
    expect(res.status).toBe(200)
    const body = await json(res)
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect((body.data as unknown[]).length).toBe(0)
  })

  it('returns contratos list with correct shape', async () => {
    mockRepo.search.mockResolvedValueOnce({
      contratos: [mockContrato],
      total: 1,
      pagina: 1,
      tamanoPagina: 20,
      totalPaginas: 1,
    })

    const res = await GET(new Request('http://localhost:3000/api/contratos', { headers: AUTH_HEADERS }))
    expect(res.status).toBe(200)
    const body = await json(res)
    const data = body.data as Record<string, unknown>[]
    expect(data).toHaveLength(1)
    expect(data[0].numeroContrato).toBe('CTR-2025-0001')
    expect(data[0].clienteNombre).toBe('Empresa ABC')
  })

  it('includes pagination meta', async () => {
    mockRepo.search.mockResolvedValueOnce({
      contratos: [],
      total: 42,
      pagina: 2,
      tamanoPagina: 20,
      totalPaginas: 3,
    })

    const res = await GET(new Request(
      'http://localhost:3000/api/contratos?page=2&limit=20',
      { headers: AUTH_HEADERS }
    ))
    const body = await json(res)
    const meta = body.meta as Record<string, unknown>
    const pagination = meta.pagination as Record<string, unknown>
    expect(pagination.total).toBe(42)
    expect(pagination.page).toBe(2)
    expect(pagination.hasNextPage).toBe(true)
  })

  it('includes pipeline stats in meta', async () => {
    mockRepo.getPipelineData.mockResolvedValueOnce([
      { estado: 'activo', cantidad: 5, valor: 10_000_000 },
      { estado: 'completado', cantidad: 2, valor: 5_000_000 },
    ])

    const res = await GET(new Request('http://localhost:3000/api/contratos', { headers: AUTH_HEADERS }))
    const body = await json(res)
    const meta = body.meta as Record<string, unknown>
    const stats = meta.stats as Record<string, unknown>
    expect(stats.activos).toBe(5)
    expect(stats.completados).toBe(2)
    expect(stats.valorTotal).toBe(15_000_000)
  })

  it('returns 500 when repo.search throws', async () => {
    mockRepo.search.mockRejectedValueOnce(new Error('DB error'))
    const res = await GET(new Request('http://localhost:3000/api/contratos', { headers: AUTH_HEADERS }))
    expect(res.status).toBe(500)
  })

  it('supports search parameter', async () => {
    const res = await GET(new Request(
      'http://localhost:3000/api/contratos?search=ABC',
      { headers: AUTH_HEADERS }
    ))
    expect(res.status).toBe(200)
    // Verify repo was called with correct params
    expect(mockRepo.search).toHaveBeenCalledWith(
      expect.objectContaining({ busquedaTexto: 'ABC' })
    )
  })

  it('enforces max 100 items per page', async () => {
    await GET(new Request(
      'http://localhost:3000/api/contratos?limit=9999',
      { headers: AUTH_HEADERS }
    ))
    expect(mockRepo.search).toHaveBeenCalledWith(
      expect.objectContaining({ tamanoPagina: 100 })
    )
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/contratos
// ══════════════════════════════════════════════════════════════════════════════

describe('POST /api/contratos', () => {
  let POST: (req: Request) => Promise<Response>

  // Zod v4.3.6 validates UUID format strictly (requires version 4: third group = 4xxx).
  // '00000000-0000-0000-...' fails; use '00000000-0000-4000-8000-...' format instead.
  const validBody = {
    titulo: 'Contrato Campaña Q1 2025',
    anuncianteId: '00000000-0000-4000-8000-000000000001',
    fechaInicio: '2025-01-01',
    fechaFin: '2025-03-31',
    valorTotalBruto: 5000000,
    descuentoPorcentaje: 10,
    tipoContrato: 'campaña',
    ejecutivoId: '00000000-0000-4000-8000-000000000002',
    propiedadesSeleccionadas: [],
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('@/app/api/contratos/route')
    POST = mod.POST as (req: Request) => Promise<Response>
  })

  it('returns 401 when unauthenticated', async () => {
    const res = await POST(new Request('http://localhost:3000/api/contratos', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validBody),
    }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when titulo is missing', async () => {
    const { titulo: _t, ...noTitulo } = validBody
    const res = await POST(new Request('http://localhost:3000/api/contratos', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...AUTH_HEADERS },
      body: JSON.stringify(noTitulo),
    }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when neither anuncianteId nor agenciaId is provided', async () => {
    const { anuncianteId: _a, ...noAnunciante } = validBody
    const res = await POST(new Request('http://localhost:3000/api/contratos', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...AUTH_HEADERS },
      body: JSON.stringify(noAnunciante),
    }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when fechaInicio format is invalid', async () => {
    const res = await POST(new Request('http://localhost:3000/api/contratos', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...AUTH_HEADERS },
      body: JSON.stringify({ ...validBody, fechaInicio: '01-01-2025' }), // wrong format
    }))
    expect(res.status).toBe(400)
  })

  it('returns 400 on malformed JSON', async () => {
    const res = await POST(new Request('http://localhost:3000/api/contratos', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...AUTH_HEADERS },
      body: '{broken',
    }))
    expect(res.status).toBe(400)
  })

  it('accepts body with only anuncianteId (no agenciaId)', async () => {
    const res = await POST(new Request('http://localhost:3000/api/contratos', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...AUTH_HEADERS },
      body: JSON.stringify(validBody),
    }))
    // Should not be 400 (validation passes)
    expect(res.status).not.toBe(400)
  })

  it('accepts body with only agenciaId (no anuncianteId)', async () => {
    const { anuncianteId: _a, ...rest } = validBody
    const res = await POST(new Request('http://localhost:3000/api/contratos', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...AUTH_HEADERS },
      body: JSON.stringify({ ...rest, agenciaId: '00000000-0000-4000-8000-000000000099' }),
    }))
    expect(res.status).not.toBe(400)
  })

  it('returns 500 when repo.save throws', async () => {
    mockRepo.save.mockRejectedValueOnce(new Error('DB failure'))
    const res = await POST(new Request('http://localhost:3000/api/contratos', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...AUTH_HEADERS },
      body: JSON.stringify(validBody),
    }))
    expect(res.status).toBe(500)
  })
})
