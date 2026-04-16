/**
 * GET /api/anunciantes  — List advertisers
 * POST /api/anunciantes — Create advertiser
 *
 * Uses anunciantes DDD module (Tier Core).
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiRoute } from '@/lib/api/with-api-route'
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response'
import { logger } from '@/lib/observability'
import { auditLogger } from '@/lib/security/audit-logger'
import { AuditEventType } from '@/lib/security/audit-types'

import { AnuncianteDrizzleRepository } from '@/modules/anunciantes/infrastructure/repositories/AnuncianteDrizzleRepository'
import { BuscarAnunciantesHandler } from '@/modules/anunciantes/application/handlers/BuscarAnunciantesHandler'
import { BuscarAnunciantesQuery } from '@/modules/anunciantes/application/queries/BuscarAnunciantesQuery'
import { CrearAnuncianteHandler } from '@/modules/anunciantes/application/handlers/CrearAnuncianteHandler'
import { CrearAnuncianteCommand } from '@/modules/anunciantes/application/commands/CrearAnuncianteCommand'

const repository = new AnuncianteDrizzleRepository();
const buscarHandler = new BuscarAnunciantesHandler(repository);
const crearHandler = new CrearAnuncianteHandler(repository);

const createAnuncianteSchema = z.object({
  nombreRazonSocial: z.string().min(1, 'La razón social es requerida').max(255),
  rut: z.string().max(12).optional(),
  giroActividad: z.string().optional(),
  direccion: z.string().optional(),
  ciudad: z.string().max(100).optional(),
  comunaProvincia: z.string().max(100).optional(),
  pais: z.string().max(100).optional().default('Chile'),
  emailContacto: z.string().email('Email de contacto inválido').max(255).optional(),
  telefonoContacto: z.string().max(20).optional(),
  paginaWeb: z.string().max(255).optional(),
  nombreContactoPrincipal: z.string().max(255).optional(),
  cargoContactoPrincipal: z.string().max(100).optional(),
  tieneFacturacionElectronica: z.boolean().optional().default(false),
  direccionFacturacion: z.string().optional(),
  emailFacturacion: z.string().email('Email de facturación inválido').max(255).optional(),
  notas: z.string().optional(),
})

export const GET = withApiRoute(
  { resource: 'anunciantes', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const { searchParams } = new URL(req.url)
      const search = searchParams.get('search') || ''
      const estado = searchParams.get('estado') || ''
      const activoParam = searchParams.get('activo')
      const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
      const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '20', 10)), 100)

      const query = new BuscarAnunciantesQuery({
        tenantId: ctx.tenantId,
        search: search || undefined,
        estado: estado ? (estado as any) : undefined,
        activo: activoParam !== null && activoParam !== '' ? activoParam === 'true' : undefined,
        page,
        limit,
      })

      const result = await buscarHandler.execute(query)
      if (!result.ok) {
        return apiError('SERVER_ERROR', result.error.message, 500) as unknown as NextResponse
      }

      return apiSuccess(result.data.data.map((a: any) => a.toJSON()), 200, {
        pagination: {
          total: result.data.total,
          page: result.data.page,
          limit: result.data.limit,
          totalPages: result.data.totalPages,
          hasNextPage: result.data.page < result.data.totalPages,
          hasPreviousPage: result.data.page > 1,
        },
      }) as unknown as NextResponse
    } catch (error) {
      logger.error('Error in anunciantes GET', error instanceof Error ? error : undefined, { module: 'anunciantes', action: 'GET' })
      return apiServerError() as unknown as NextResponse
    }
  }
)

export const POST = withApiRoute(
  { resource: 'anunciantes', action: 'create' },
  async ({ ctx, req }) => {
    try {
      let body: unknown
      try {
        body = await req.json()
      } catch {
        return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse
      }

      const parsed = createAnuncianteSchema.safeParse(body)
      if (!parsed.success) {
        return apiError(
          'VALIDATION_ERROR',
          'Error en la validación de los datos',
          422,
          parsed.error.flatten().fieldErrors
        ) as unknown as NextResponse
      }

      const command = new CrearAnuncianteCommand({
        tenantId: ctx.tenantId,
        creadoPorId: ctx.userId,
        ...parsed.data,
      })

      const result = await crearHandler.execute(command)
      if (!result.ok) {
        if (result.error.message.includes('Ya existe un anunciante con el RUT')) {
          return apiError('DUPLICATE_ENTRY', result.error.message, 409) as unknown as NextResponse
        }
        return apiError('SERVER_ERROR', result.error.message, 500) as unknown as NextResponse
      }

      auditLogger.log({
        type: AuditEventType.DATA_CREATE,
        userId: ctx.userId,
        metadata: { module: 'anunciantes', resourceId: result.data.id },
      })

      return apiSuccess(result.data.toJSON(), 201, { message: 'Anunciante creado exitosamente' }) as unknown as NextResponse
    } catch (error) {
      logger.error('Error in anunciantes POST', error instanceof Error ? error : undefined, { module: 'anunciantes', action: 'POST' })
      return apiServerError() as unknown as NextResponse
    }
  }
)
