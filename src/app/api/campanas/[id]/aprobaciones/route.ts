import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { rateLimit } from '@/lib/security/rate-limiter'
import { appendAudit } from '@/lib/security/audit-trail'
import { getAuthContext, requireRole, forbid } from '@/lib/security/rbac'
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

type Nivel = 'COMERCIAL' | 'TECNICO' | 'FINANCIERO'
type Estado = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'

const store: Record<string, { id: string, nivel: Nivel, estado: Estado, solicitante: string, observacion?: string, ts: number }[]> = {}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    return NextResponse.json({ success: true, items: store[params.id] || [] }, { status: 200 })
  } catch (error) {
    logger.error('[API/Campanas/Aprobaciones] Error GET:', error instanceof Error ? error : undefined, { module: 'campanas/aprobaciones', action: 'GET' })
    return apiServerError()
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = getAuthContext(request)
    if (!requireRole(ctx, ['EJECUTIVO', 'TM_SENIOR', 'EJECUTIVO_VENTAS'])) return forbid()
    const rl = await rateLimit({ key: `aprobaciones_create:${params.id}`, limit: 60, window: 60_000 })
    if (!rl.success) return NextResponse.json({ success: false, error: 'RATE_LIMIT' }, { status: 429 })
    const body = await request.json().catch(() => ({}))
    const item = { id: `apr_${Date.now()}`, nivel: (body.nivel || 'COMERCIAL') as Nivel, estado: 'PENDIENTE' as Estado, solicitante: ctx!.userId, ts: Date.now() }
    store[params.id] = [item, ...(store[params.id] || [])]
    appendAudit(params.id, { actor: ctx?.userId, action: 'APROBACION_SOLICITADA', meta: { id: item.id, nivel: item.nivel } })
    return NextResponse.json({ success: true, item }, { status: 201 })
  } catch (error) {
    logger.error('[API/Campanas/Aprobaciones] Error POST:', error instanceof Error ? error : undefined, { module: 'campanas/aprobaciones', action: 'POST' })
    return apiServerError()
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = getAuthContext(request)
    if (!requireRole(ctx, ['TM_SENIOR', 'FINANCIERO'])) return forbid()
    const rl = await rateLimit({ key: `aprobaciones_update:${params.id}`, limit: 60, window: 60_000 })
    if (!rl.success) return NextResponse.json({ success: false, error: 'RATE_LIMIT' }, { status: 429 })
    const body = await request.json().catch(() => ({}))
    const { id, estado, observacion } = body
    const list = store[params.id] || []
    const found = list.find(x => x.id === id)
    if (!found) return NextResponse.json({ success: false, error: 'NOT_FOUND' }, { status: 404 })
    found.estado = (estado || 'APROBADO') as Estado
    found.observacion = observacion
    appendAudit(params.id, { actor: ctx?.userId, action: 'APROBACION_RESUELTA', meta: { id, estado: found.estado } })
    return NextResponse.json({ success: true, item: found }, { status: 200 })
  } catch (error) {
    logger.error('[API/Campanas/Aprobaciones] Error PATCH:', error instanceof Error ? error : undefined, { module: 'campanas/aprobaciones', action: 'PATCH' })
    return apiServerError()
  }
}

