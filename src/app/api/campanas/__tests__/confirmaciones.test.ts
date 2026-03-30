/**
 * Confirmaciones API tests (generar/enviar)
 */
import { vi, describe, it, expect, beforeEach } from 'vitest'
vi.mock('next/server');

// Mocks de repos y servicios
vi.mock('@/modules/campanas/infrastructure/repositories/DrizzleConfirmacionRepository', () => ({
  DrizzleConfirmacionRepository: vi.fn().mockImplementation(() => ({
    crear: vi.fn().mockResolvedValue({ id: 'conf_1' }),
    actualizarArchivo: vi.fn().mockResolvedValue(undefined),
    obtenerPorId: vi.fn().mockResolvedValue({ id: 'conf_1', campaignId: 'camp_1', file: { data: Buffer.from('%PDF-1.4 test').toString('base64') } }),
    marcarEnviada: vi.fn().mockResolvedValue(undefined),
  })),
}))

vi.mock('@/modules/campanas/infrastructure/repositories/DrizzleHistoryRepository', () => ({
  DrizzleHistoryRepository: vi.fn().mockImplementation(() => ({
    log: vi.fn().mockResolvedValue(undefined),
  })),
}))

vi.mock('@/modules/campanas/infrastructure/repositories/DrizzleLineaRepository', () => ({
  DrizzleLineaRepository: vi.fn().mockImplementation(() => ({
    listar: vi.fn().mockResolvedValue([
      { lineNumber: 1, blockType: 'REPARTIDO', startTime: '06:00', endTime: '22:00', spots: 10 },
    ]),
  })),
}))

vi.mock('@/modules/campanas/infrastructure/services/EmailSenderService', () => ({
  EmailSenderService: vi.fn().mockImplementation(() => ({
    sendConfirmation: vi.fn().mockResolvedValue(undefined),
  })),
}))

vi.mock('@/lib/security/rate-limiter', () => ({ rateLimit: vi.fn().mockResolvedValue({ success: true, limit: 300, remaining: 299, resetTime: Date.now() + 60000 }) }))

vi.mock('@/lib/security/rbac', () => ({
  getAuthContext: vi.fn().mockReturnValue({ userId: 'u1', role: 'TM_SENIOR', email: 'tm@acme.io' }),
  requireRole: vi.fn().mockReturnValue(true),
  forbid: vi.fn().mockReturnValue({ status: 403, json: async () => ({ success: false }) }),
}))

interface MockNextResponseInit {
  status?: number;
  headers?: Record<string, string>;
}

// Mock minimal NextResponse helpers
vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, opts?: MockNextResponseInit) => ({
      status: opts?.status ?? 200,
      headers: opts?.headers ?? {},
      async json() { return body },
    }),
  },
}))

const { POST: GENERAR } = require('@/app/api/campanas/[id]/confirmaciones/generar/route')
const { POST: ENVIAR } = require('@/app/api/campanas/[id]/confirmaciones/[confirmationId]/enviar/route')

describe('Confirmaciones API', () => {
  it('POST /[id]/confirmaciones/generar devuelve previewUrl', async () => {
    const req: { headers: { get: () => string }; json: () => Promise<Record<string, unknown>>; url?: string } = {
      headers: { get: () => '127.0.0.1' },
      json: async () => ({}),
    }
    const res = await GENERAR(req, { params: { id: 'camp_1' } })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(typeof data.previewUrl).toBe('string')
  })

  it('POST /[id]/confirmaciones/[confirmationId]/enviar envía y marca ENVIADA', async () => {
    const req: { headers: { get: () => string }; json: () => Promise<Record<string, unknown>>; url?: string } = {
      headers: { get: () => '127.0.0.1' },
      json: async () => ({ destinatarios: ['client@acme.io'] }),
      url: 'http://localhost'
    }
    const res = await ENVIAR(req, { params: { id: 'camp_1', confirmationId: 'conf_1' } })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.sent).toBe(true)
  })
})

