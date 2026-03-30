/**
 * GET /api/registro-emision  — List emission records
 * POST /api/registro-emision — Register an emission
 * PUT /api/registro-emision  — Confirm/update an emission record
 *
 * Security: withApiRoute enforces JWT auth, RBAC, rate limiting, CSRF, and audit logging.
 * Resource: 'emisiones' — accessible by OPERADOR_EMISION, PROGRAMADOR, and above.
 */

import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound, apiServerError, getUserContext } from '@/lib/api/response';

import { withApiRoute } from '@/lib/api/with-api-route'
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

// ─── Mock data (replace with DB query when schema is wired) ──────────────────

const mockRegistros = [
  { id: 'reg-001', spotTandaId: 's1', cunaNombre: 'Spot Banco Chile 30s', horaProgra: '08:00', horaEmision: '08:01', emitido: true, confirmado: true, metodo: 'fingerprint', confianza: 98 },
  { id: 'reg-002', spotTandaId: 's2', cunaNombre: 'Jingle Falabella 20s', horaProgra: '08:00', horaEmision: '08:01', emitido: true, confirmado: true, metodo: 'fingerprint', confianza: 95 },
  { id: 'reg-003', spotTandaId: 's3', cunaNombre: 'Spot Coca-Cola 30s', horaProgra: '08:02', horaEmision: '08:02', emitido: true, confirmado: true, metodo: 'manual', confianza: 100 },
  { id: 'reg-004', spotTandaId: 's4', cunaNombre: 'Mención LATAM 15s', horaProgra: '08:02', horaEmision: null, emitido: false, confirmado: false, metodo: null, confianza: 0 },
  { id: 'reg-005', spotTandaId: 's5', cunaNombre: 'Spot Entel 30s', horaProgra: '12:00', horaEmision: '12:01', emitido: true, confirmado: false, metodo: 'fingerprint', confianza: 72 },
  { id: 'reg-006', spotTandaId: 's6', cunaNombre: 'Spot Ripley 30s', horaProgra: '12:01', horaEmision: '12:01', emitido: true, confirmado: true, metodo: 'shazam', confianza: 92 },
]

// ─── GET /api/registro-emision ───────────────────────────────────────────────

export const GET = withApiRoute(
  { resource: 'emisiones', action: 'read', skipCsrf: true },
  async ({ req }) => {
    const { searchParams } = new URL(req.url)
    const fecha = searchParams.get('fecha') || new Date().toISOString().split('T')[0]
    const estado = searchParams.get('estado') || ''

    let filtered = [...mockRegistros]

    if (estado === 'confirmado') filtered = filtered.filter(r => r.confirmado)
    else if (estado === 'pendiente') filtered = filtered.filter(r => !r.confirmado)
    else if (estado === 'no_emitido') filtered = filtered.filter(r => !r.emitido)

    const confirmedWithConfianza = mockRegistros.filter(r => r.confianza > 0)
    const stats = {
      total: mockRegistros.length,
      emitidos: mockRegistros.filter(r => r.emitido).length,
      confirmados: mockRegistros.filter(r => r.confirmado).length,
      pendientes: mockRegistros.filter(r => r.emitido && !r.confirmado).length,
      noEmitidos: mockRegistros.filter(r => !r.emitido).length,
      porcentajeEmision: Math.round((mockRegistros.filter(r => r.emitido).length / mockRegistros.length) * 100),
      confianzaPromedio: confirmedWithConfianza.length
        ? Math.round(confirmedWithConfianza.reduce((sum, r) => sum + r.confianza, 0) / confirmedWithConfianza.length)
        : 0,
    }

    return apiSuccess({ data: filtered, stats, fecha })
  }
)

// ─── POST /api/registro-emision ──────────────────────────────────────────────

export const POST = withApiRoute(
  { resource: 'emisiones', action: 'create' },
  async ({ req }) => {
    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return apiError('INVALID_JSON', 'Request body must be valid JSON', 400)
    }

    if (!body.spotTandaId) {
      return apiError('VALIDATION_ERROR', 'spotTandaId requerido', 400)
    }

    const newRegistro = {
      id: `reg-${Date.now()}`,
      spotTandaId: body.spotTandaId as string,
      cunaNombre: (body.cunaNombre as string) || 'Sin nombre',
      horaProgra: (body.horaProgramada as string) || '00:00',
      horaEmision:
        (body.horaEmision as string) ||
        new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      emitido: true,
      confirmado: body.metodo === 'manual',
      metodo: (body.metodo as string) || 'manual',
      confianza: (body.confianza as number) || (body.metodo === 'manual' ? 100 : 0),
    }

    mockRegistros.push(newRegistro)

    return apiSuccess(newRegistro, 201, { message: 'Emisión registrada' })
  }
)

// ─── PUT /api/registro-emision ───────────────────────────────────────────────

export const PUT = withApiRoute(
  { resource: 'emisiones', action: 'update' },
  async ({ req }) => {
    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return apiError('INVALID_JSON', 'Request body must be valid JSON', 400)
    }

    if (!body.id) {
      return apiError('VALIDATION_ERROR', 'id requerido', 400)
    }

    const registro = mockRegistros.find(r => r.id === body.id)
    if (!registro) {
      return apiNotFound('registro-emision')
    }

    registro.confirmado = (body.confirmado as boolean) ?? registro.confirmado
    registro.confianza = (body.confianza as number) ?? registro.confianza
    registro.horaEmision = (body.horaEmision as string) ?? registro.horaEmision

    return apiSuccess(registro, 200, { message: 'Registro actualizado' })
  }
)
