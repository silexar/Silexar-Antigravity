/**
 * GET /api/anunciantes/[id]  — Detalle
 * PUT /api/anunciantes/[id]  — Actualizar
 * PATCH /api/anunciantes/[id] — Acciones rápidas (toggle activo)
 * DELETE /api/anunciantes/[id] — Eliminar (soft delete)
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
import { ObtenerAnunciantePorIdHandler } from '@/modules/anunciantes/application/handlers/ObtenerAnunciantePorIdHandler'
import { ObtenerAnunciantePorIdQuery } from '@/modules/anunciantes/application/queries/ObtenerAnunciantePorIdQuery'
import { ActualizarAnuncianteHandler } from '@/modules/anunciantes/application/handlers/ActualizarAnuncianteHandler'
import { ActualizarAnuncianteCommand } from '@/modules/anunciantes/application/commands/ActualizarAnuncianteCommand'
import { EliminarAnuncianteHandler } from '@/modules/anunciantes/application/handlers/EliminarAnuncianteHandler'

const repository = new AnuncianteDrizzleRepository();
const obtenerHandler = new ObtenerAnunciantePorIdHandler(repository);
const actualizarHandler = new ActualizarAnuncianteHandler(repository);
const eliminarHandler = new EliminarAnuncianteHandler(repository);

const updateAnuncianteSchema = z.object({
  nombreRazonSocial: z.string().min(1).max(255).optional(),
  rut: z.string().max(12).optional().nullable(),
  giroActividad: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  ciudad: z.string().max(100).optional().nullable(),
  comunaProvincia: z.string().max(100).optional().nullable(),
  pais: z.string().max(100).optional().nullable(),
  emailContacto: z.string().email().max(255).optional().nullable(),
  telefonoContacto: z.string().max(20).optional().nullable(),
  paginaWeb: z.string().max(255).optional().nullable(),
  nombreContactoPrincipal: z.string().max(255).optional().nullable(),
  cargoContactoPrincipal: z.string().max(100).optional().nullable(),
  tieneFacturacionElectronica: z.boolean().optional(),
  direccionFacturacion: z.string().optional().nullable(),
  emailFacturacion: z.string().email().max(255).optional().nullable(),
  estado: z.enum(['activo', 'inactivo', 'suspendido', 'pendiente']).optional(),
  activo: z.boolean().optional(),
  notas: z.string().optional().nullable(),
})

const patchAnuncianteSchema = z.object({
  action: z.enum(['toggle_activo', 'suspender']),
  motivo: z.string().max(500).optional(),
})

function extractId(req: Request): string {
  const url = new URL(req.url)
  const parts = url.pathname.split('/')
  return parts[parts.length - 1] || ''
}

export const GET = withApiRoute(
  { resource: 'anunciantes', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const id = extractId(req)
      const result = await obtenerHandler.execute(new ObtenerAnunciantePorIdQuery({ id, tenantId: ctx.tenantId }))
      if (!result.ok) {
        return apiServerError() as unknown as NextResponse
      }
      if (!result.data) {
        return apiError('NOT_FOUND', 'Anunciante no encontrado', 404) as unknown as NextResponse
      }
      return apiSuccess(result.data.toJSON()) as unknown as NextResponse
    } catch (error) {
      logger.error('Error in anunciantes/:id GET', error instanceof Error ? error : undefined, { module: 'anunciantes' })
      return apiServerError() as unknown as NextResponse
    }
  }
)

export const PUT = withApiRoute(
  { resource: 'anunciantes', action: 'update' },
  async ({ ctx, req }) => {
    try {
      const id = extractId(req)
      let body: unknown
      try {
        body = await req.json()
      } catch {
        return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse
      }

      const parsed = updateAnuncianteSchema.safeParse(body)
      if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Error en la validación', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse
      }

      const data = parsed.data
      const command = new ActualizarAnuncianteCommand({
        id,
        tenantId: ctx.tenantId,
        modificadoPorId: ctx.userId,
        ...(data.nombreRazonSocial !== undefined && { nombreRazonSocial: data.nombreRazonSocial }),
        ...(data.rut !== undefined && data.rut !== null && { rut: data.rut }),
        ...(data.giroActividad !== undefined && data.giroActividad !== null && { giroActividad: data.giroActividad }),
        ...(data.direccion !== undefined && data.direccion !== null && { direccion: data.direccion }),
        ...(data.ciudad !== undefined && data.ciudad !== null && { ciudad: data.ciudad }),
        ...(data.comunaProvincia !== undefined && data.comunaProvincia !== null && { comunaProvincia: data.comunaProvincia }),
        ...(data.pais !== undefined && data.pais !== null && { pais: data.pais }),
        ...(data.emailContacto !== undefined && data.emailContacto !== null && { emailContacto: data.emailContacto }),
        ...(data.telefonoContacto !== undefined && data.telefonoContacto !== null && { telefonoContacto: data.telefonoContacto }),
        ...(data.paginaWeb !== undefined && data.paginaWeb !== null && { paginaWeb: data.paginaWeb }),
        ...(data.nombreContactoPrincipal !== undefined && data.nombreContactoPrincipal !== null && { nombreContactoPrincipal: data.nombreContactoPrincipal }),
        ...(data.cargoContactoPrincipal !== undefined && data.cargoContactoPrincipal !== null && { cargoContactoPrincipal: data.cargoContactoPrincipal }),
        ...(data.tieneFacturacionElectronica !== undefined && { tieneFacturacionElectronica: data.tieneFacturacionElectronica }),
        ...(data.direccionFacturacion !== undefined && data.direccionFacturacion !== null && { direccionFacturacion: data.direccionFacturacion }),
        ...(data.emailFacturacion !== undefined && data.emailFacturacion !== null && { emailFacturacion: data.emailFacturacion }),
        ...(data.estado !== undefined && { estado: data.estado }),
        ...(data.activo !== undefined && { activo: data.activo }),
        ...(data.notas !== undefined && data.notas !== null && { notas: data.notas }),
      })

      const result = await actualizarHandler.execute(command)
      if (!result.ok) {
        if (result.error.message === 'Anunciante no encontrado') {
          return apiError('NOT_FOUND', result.error.message, 404) as unknown as NextResponse
        }
        if (result.error.message.includes('Ya existe un anunciante con el RUT')) {
          return apiError('DUPLICATE_ENTRY', result.error.message, 409) as unknown as NextResponse
        }
        return apiError('SERVER_ERROR', result.error.message, 500) as unknown as NextResponse
      }

      auditLogger.log({
        type: AuditEventType.DATA_UPDATE,
        userId: ctx.userId,
        metadata: { module: 'anunciantes', resourceId: id },
      })

      return apiSuccess(result.data.toJSON(), 200, { message: 'Anunciante actualizado exitosamente' }) as unknown as NextResponse
    } catch (error) {
      logger.error('Error in anunciantes/:id PUT', error instanceof Error ? error : undefined, { module: 'anunciantes' })
      return apiServerError() as unknown as NextResponse
    }
  }
)

export const PATCH = withApiRoute(
  { resource: 'anunciantes', action: 'update' },
  async ({ ctx, req }) => {
    try {
      const id = extractId(req)
      let body: unknown
      try {
        body = await req.json()
      } catch {
        return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse
      }

      const parsed = patchAnuncianteSchema.safeParse(body)
      if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Acción inválida', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse
      }

      const existingResult = await obtenerHandler.execute(new ObtenerAnunciantePorIdQuery({ id, tenantId: ctx.tenantId }))
      if (!existingResult.ok || !existingResult.data) {
        return apiError('NOT_FOUND', 'Anunciante no encontrado', 404) as unknown as NextResponse
      }
      const existing = existingResult.data

      let patchCommand: ActualizarAnuncianteCommand
      if (parsed.data.action === 'toggle_activo') {
        patchCommand = new ActualizarAnuncianteCommand({
          id,
          tenantId: ctx.tenantId,
          modificadoPorId: ctx.userId,
          activo: !existing.activo,
          estado: !existing.activo ? 'activo' : 'inactivo',
        })
      } else {
        const newNotas = parsed.data.motivo
          ? `SUSPENDIDO: ${parsed.data.motivo}\n\n${existing.notas || ''}`
          : existing.notas || ''
        patchCommand = new ActualizarAnuncianteCommand({
          id,
          tenantId: ctx.tenantId,
          modificadoPorId: ctx.userId,
          activo: false,
          estado: 'suspendido',
          notas: newNotas,
        })
      }

      const result = await actualizarHandler.execute(patchCommand)
      if (!result.ok) {
        return apiServerError() as unknown as NextResponse
      }

      return apiSuccess(result.data.toJSON(), 200, { message: 'Anunciante actualizado exitosamente' }) as unknown as NextResponse
    } catch (error) {
      logger.error('Error in anunciantes/:id PATCH', error instanceof Error ? error : undefined, { module: 'anunciantes' })
      return apiServerError() as unknown as NextResponse
    }
  }
)

export const DELETE = withApiRoute(
  { resource: 'anunciantes', action: 'delete' },
  async ({ ctx, req }) => {
    try {
      const id = extractId(req)

      const result = await eliminarHandler.execute({ id, tenantId: ctx.tenantId, userId: ctx.userId })
      if (!result.ok) {
        return apiServerError() as unknown as NextResponse
      }

      auditLogger.log({
        type: AuditEventType.DATA_DELETE,
        userId: ctx.userId,
        metadata: { module: 'anunciantes', resourceId: id },
      })

      return apiSuccess(null, 200, { message: 'Anunciante eliminado exitosamente' }) as unknown as NextResponse
    } catch (error) {
      logger.error('Error in anunciantes/:id DELETE', error instanceof Error ? error : undefined, { module: 'anunciantes' })
      return apiServerError() as unknown as NextResponse
    }
  }
)
