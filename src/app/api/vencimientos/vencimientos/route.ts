/**
 * API ROUTE: /api/vencimientos/vencimientos
 *
 * @description CRUD de vencimientos de auspicio.
 * @version 1.0.0
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withApiRoute, RouteContext } from '@/lib/api/with-api-route'
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response'
import { withTenantContext } from '@/lib/db/tenant-context'
import { VencimientosDrizzleRepository } from '@/modules/vencimientos/infrastructure/repositories/VencimientosDrizzleRepository'

const VencimientoQuerySchema = z.object({
  programaId: z.string().optional(),
  estado: z.string().optional().default('ACTIVO'),
  dias: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
})

const CrearVencimientoSchema = z.object({
  codigo: z.string().min(1),
  programaId: z.string().min(1),
  programaNombre: z.string().optional().default(''),
  clienteId: z.string().min(1),
  clienteNombre: z.string().min(1),
  contratoId: z.string().optional(),
  contratoCodigo: z.string().optional(),
  tipo: z.string().default('auspicio_programa'),
  fechaInicio: z.string().min(1),
  fechaVencimientos: z.string().min(1),
  nivel: z.string().default('verde'),
  estado: z.string().default('ACTIVO'),
  valorContrato: z.number().optional().default(0),
  ejecutivoId: z.string().optional(),
  ejecutivoNombre: z.string().optional().default(''),
})

const mockVencimientos: any[] = []

export const GET = withApiRoute(
  { resource: 'vencimientos.vencimientos', action: 'read', skipCsrf: true },
  async (ctx: RouteContext) => {
    try {
      const req = ctx.req as NextRequest
      const tenantId = ctx.tenantId || 'default'
      const sp = req.nextUrl.searchParams

      const parsed = VencimientoQuerySchema.safeParse({
        programaId: sp.get('programaId') ?? undefined,
        estado: sp.get('estado') ?? undefined,
        dias: sp.get('dias') ?? undefined,
        page: sp.get('page') ?? undefined,
        limit: sp.get('limit') ?? undefined,
      })
      if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Parámetros inválidos', 400, parsed.error.flatten().fieldErrors)
      }

      const { programaId, estado, dias, page, limit } = parsed.data
      let items: any[] = []

      try {
        const repo = new VencimientosDrizzleRepository()
        items = await withTenantContext(tenantId, async () => {
          if (dias) return repo.findVencimientosProximos(dias)
          if (programaId) {
            const v = await repo.findVencimientosByCupo(programaId)
            return v ? [v] : []
          }
          return repo.findVencimientosProximos(30)
        })
      } catch {
        items = mockVencimientos.filter((v: any) => {
          if (programaId && v.programaId !== programaId) return false
          if (estado && v.estado !== estado) return false
          return true
        })
      }

      const start = (page - 1) * limit
      return apiSuccess({ items: items.slice(start, start + limit), total: items.length, page, limit })
    } catch (error) {
      console.error('[Vencimientos] GET error:', error)
      return apiServerError('Error interno')
    }
  }
)

export const POST = withApiRoute(
  { resource: 'vencimientos.vencimientos', action: 'create' },
  async (ctx: RouteContext) => {
    try {
      const req = ctx.req as NextRequest
      const body = await req.json()

      const parsed = CrearVencimientoSchema.safeParse(body)
      if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Datos inválidos', 400, parsed.error.flatten().fieldErrors)
      }

      const data = parsed.data
      const id = `venc_${Date.now()}`
      const vencimiento = {
        id,
        ...data,
        diasRestantes: 0,
        montoPagado: 0,
        montoPendiente: data.valorContrato,
        notificacion48hEnviada: false,
        notificacion7diasEnviada: false,
        alertaTraficoEnviada: false,
        alertaTraficoFinalEnviada: false,
        createdAt: new Date().toISOString(),
      }

      mockVencimientos.push(vencimiento)
      return apiSuccess(vencimiento, 201)
    } catch (error) {
      console.error('[Vencimientos] POST error:', error)
      return apiServerError('Error interno')
    }
  }
)
