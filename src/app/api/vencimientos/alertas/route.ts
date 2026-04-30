/**
 * API ROUTE: /api/vencimientos/alertas
 *
 * @description CRUD de alertas de programador.
 * @version 1.0.0
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withApiRoute, RouteContext } from '@/lib/api/with-api-route'
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response'
import { withTenantContext } from '@/lib/db/tenant-context'
import { VencimientosDrizzleRepository } from '@/modules/vencimientos/infrastructure/repositories/VencimientosDrizzleRepository'

const AlertaQuerySchema = z.object({
  destinatarioId: z.string().optional(),
  emisoraId: z.string().optional(),
  estado: z.string().optional().default('pendiente'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
})

const CrearAlertaSchema = z.object({
  emisoraId: z.string().min(1),
  programaId: z.string().min(1),
  programaNombre: z.string().optional().default(''),
  cupoComercialId: z.string().min(1),
  clienteNombre: z.string().min(1),
  tipo: z.string().min(1),
  titulo: z.string().min(1),
  mensaje: z.string().min(1),
  prioridad: z.enum(['baja', 'media', 'alta', 'critica']).default('media'),
  destinatarioId: z.string().min(1),
  destinatarioNombre: z.string().optional().default(''),
  canalesNotificacion: z.array(z.string()).optional().default([]),
})

const mockAlertas: any[] = []

export const GET = withApiRoute(
  { resource: 'vencimientos.alertas', action: 'read', skipCsrf: true },
  async (ctx: RouteContext) => {
    try {
      const req = ctx.req as NextRequest
      const tenantId = ctx.tenantId || 'default'
      const sp = req.nextUrl.searchParams

      const parsed = AlertaQuerySchema.safeParse({
        destinatarioId: sp.get('destinatarioId') ?? undefined,
        emisoraId: sp.get('emisoraId') ?? undefined,
        estado: sp.get('estado') ?? undefined,
        page: sp.get('page') ?? undefined,
        limit: sp.get('limit') ?? undefined,
      })
      if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Parámetros inválidos', 400, parsed.error.flatten().fieldErrors)
      }

      const { destinatarioId, emisoraId, estado, page, limit } = parsed.data
      let items: any[] = []

      try {
        const repo = new VencimientosDrizzleRepository()
        items = await withTenantContext(tenantId, async () => {
          if (destinatarioId) return repo.findAlertasByDestinatario(destinatarioId)
          if (emisoraId) return repo.findAlertasByEmisora(emisoraId)
          return repo.findAlertasPendientes()
        })
      } catch {
        items = mockAlertas.filter((a: any) => {
          if (destinatarioId && a.destinatarioId !== destinatarioId) return false
          if (emisoraId && a.emisoraId !== emisoraId) return false
          if (estado && a.estadoConfirmacion !== estado) return false
          return true
        })
      }

      const start = (page - 1) * limit
      return apiSuccess({ items: items.slice(start, start + limit), total: items.length, page, limit })
    } catch (error) {
      console.error('[Alertas] GET error:', error)
      return apiServerError('Error interno')
    }
  }
)

export const POST = withApiRoute(
  { resource: 'vencimientos.alertas', action: 'create' },
  async (ctx: RouteContext) => {
    try {
      const req = ctx.req as NextRequest
      const body = await req.json()

      const parsed = CrearAlertaSchema.safeParse(body)
      if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Datos inválidos', 400, parsed.error.flatten().fieldErrors)
      }

      const data = parsed.data
      const id = `alert_${Date.now()}`
      const alerta = {
        id,
        ...data,
        estadoConfirmacion: 'pendiente',
        leida: false,
        createdAt: new Date().toISOString(),
      }

      mockAlertas.push(alerta)
      return apiSuccess(alerta, 201)
    } catch (error) {
      console.error('[Alertas] POST error:', error)
      return apiServerError('Error interno')
    }
  }
)
