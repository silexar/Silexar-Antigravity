/**
 * API ROUTE: /api/vencimientos/extensiones
 *
 * @description CRUD de solicitudes de extensión.
 * @version 1.0.0
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withApiRoute, RouteContext } from '@/lib/api/with-api-route'
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response'

const ExtensionQuerySchema = z.object({
  cupoId: z.string().optional(),
  estado: z.string().optional().default('pendiente'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
})

const CrearExtensionSchema = z.object({
  cupoComercialId: z.string().min(1),
  programaId: z.string().min(1),
  emisoraId: z.string().min(1),
  clienteId: z.string().min(1),
  clienteNombre: z.string().min(1),
  ejecutivoId: z.string().min(1),
  ejecutivoNombre: z.string().optional().default(''),
  fechaInicioOriginal: z.string().min(1),
  fechaFinOriginal: z.string().min(1),
  fechaInicioSolicitada: z.string().min(1),
  fechaFinSolicitada: z.string().min(1),
  motivoSolicitud: z.string().min(1),
})

const mockExtensiones: any[] = []

export const GET = withApiRoute(
  { resource: 'vencimientos.extensiones', action: 'read', skipCsrf: true },
  async (ctx: RouteContext) => {
    try {
      const req = ctx.req as NextRequest
      const sp = req.nextUrl.searchParams

      const parsed = ExtensionQuerySchema.safeParse({
        cupoId: sp.get('cupoId') ?? undefined,
        estado: sp.get('estado') ?? undefined,
        page: sp.get('page') ?? undefined,
        limit: sp.get('limit') ?? undefined,
      })
      if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Parámetros inválidos', 400, parsed.error.flatten().fieldErrors)
      }

      const { cupoId, estado, page, limit } = parsed.data
      let items = mockExtensiones.filter((e: any) => {
        if (cupoId && e.cupoComercialId !== cupoId) return false
        if (estado && e.estado !== estado) return false
        return true
      })

      const start = (page - 1) * limit
      return apiSuccess({ items: items.slice(start, start + limit), total: items.length, page, limit })
    } catch (error) {
      console.error('[Extensiones] GET error:', error)
      return apiServerError('Error interno')
    }
  }
)

export const POST = withApiRoute(
  { resource: 'vencimientos.extensiones', action: 'create' },
  async (ctx: RouteContext) => {
    try {
      const req = ctx.req as NextRequest
      const body = await req.json()

      const parsed = CrearExtensionSchema.safeParse(body)
      if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Datos inválidos', 400, parsed.error.flatten().fieldErrors)
      }

      const data = parsed.data
      const id = `ext_${Date.now()}`
      const extension = {
        id,
        ...data,
        nivelAprobacion: 'automatico',
        extensionesPrevias: 0,
        estado: 'pendiente',
        createdAt: new Date().toISOString(),
      }

      mockExtensiones.push(extension)
      return apiSuccess(extension, 201)
    } catch (error) {
      console.error('[Extensiones] POST error:', error)
      return apiServerError('Error interno')
    }
  }
)
