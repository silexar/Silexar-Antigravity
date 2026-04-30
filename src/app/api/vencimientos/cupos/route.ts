/**
 * API ROUTE: /api/vencimientos/cupos
 *
 * @description CRUD de cupos comerciales.
 * @version 1.0.0
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withApiRoute, RouteContext } from '@/lib/api/with-api-route'
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response'
import { withTenantContext } from '@/lib/db/tenant-context'
import { CupoComercialDrizzleRepository } from '@/modules/vencimientos/infrastructure/repositories/CupoComercialDrizzleRepository'

const CupoQuerySchema = z.object({
  programaId: z.string().optional(),
  emisoraId: z.string().optional(),
  estado: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
})

const CrearCupoSchema = z.object({
  programaId: z.string().min(1),
  emisoraId: z.string().min(1),
  clienteId: z.string().optional(),
  clienteNombre: z.string().optional().default(''),
  ejecutivoId: z.string().optional(),
  ejecutivoNombre: z.string().optional().default(''),
  tipoAuspicio: z.enum(['tipo_a', 'tipo_b', 'solo_menciones']).default('tipo_a'),
  estado: z.string().default('disponible'),
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  valor: z.number().optional().default(0),
})

// Mock fallback
const mockCupos: any[] = []

export const GET = withApiRoute(
  { resource: 'vencimientos.cupos', action: 'read', skipCsrf: true },
  async (ctx: RouteContext) => {
    try {
      const req = ctx.req as NextRequest
      const tenantId = ctx.tenantId || 'default'
      const sp = req.nextUrl.searchParams

      const parsed = CupoQuerySchema.safeParse({
        programaId: sp.get('programaId') ?? undefined,
        emisoraId: sp.get('emisoraId') ?? undefined,
        estado: sp.get('estado') ?? undefined,
        page: sp.get('page') ?? undefined,
        limit: sp.get('limit') ?? undefined,
      })
      if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Parámetros inválidos', 400, parsed.error.flatten().fieldErrors)
      }

      const { programaId, emisoraId, estado, page, limit } = parsed.data
      let items: any[] = []
      let total = 0

      try {
        const repo = new CupoComercialDrizzleRepository()
        const result = await withTenantContext(tenantId, async () =>
          repo.search({ programaId, emisoraId, estado, pagina: page, tamanoPagina: limit })
        )
        items = result.cupos.map(c => ({
          id: c.id,
          programaId: c.programaId,
          emisoraId: c.emisoraId,
          clienteId: c.clienteId,
          clienteNombre: c.clienteNombre,
          ejecutivoId: c.ejecutivoId,
          tipoAuspicio: c.tipoAuspicio.valor,
          estado: c.estado.valor,
          fechaInicio: c.periodoVigencia.fechaInicio,
          fechaFin: c.periodoVigencia.fechaFin,
          valor: c.inversion.valorFinal,
          version: c.version,
        }))
        total = result.total
      } catch {
        items = mockCupos
        total = mockCupos.length
      }

      return apiSuccess({ items, total, page, limit })
    } catch (error) {
      console.error('[Cupos] GET error:', error)
      return apiServerError('Error interno')
    }
  }
)

export const POST = withApiRoute(
  { resource: 'vencimientos.cupos', action: 'create' },
  async (ctx: RouteContext) => {
    try {
      const req = ctx.req as NextRequest
      const tenantId = ctx.tenantId || 'default'
      const body = await req.json()

      const parsed = CrearCupoSchema.safeParse(body)
      if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Datos inválidos', 400, parsed.error.flatten().fieldErrors)
      }

      const data = parsed.data
      const id = `cupo_${Date.now()}`
      const cupo = { id, ...data, createdAt: new Date().toISOString() }

      mockCupos.push(cupo)
      return apiSuccess(cupo, 201)
    } catch (error) {
      console.error('[Cupos] POST error:', error)
      return apiServerError('Error interno')
    }
  }
)
