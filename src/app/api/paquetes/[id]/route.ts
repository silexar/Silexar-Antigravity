/**
 * API ROUTE: /api/paquetes/[id]
 * 
 * @description Endpoints para operaciones CRUD de un paquete específico.
 * 
 * @version 2.0.0 - Refactorizado con withApiRoute, Zod validation y audit logging
 */

import { z } from 'zod'
import { NextRequest } from 'next/server'
import { getDB } from '@/lib/db'
import { paquetes, paquetesHistorialPrecio, paquetesDisponibilidad, paquetesRestricciones } from '@/lib/db/paquetes-schema'
import { eq, and, isNull, desc } from 'drizzle-orm'
import { withApiRoute } from '@/lib/api/with-api-route'
import { auditLogger, AuditEventType, AuditSeverity } from '@/lib/security/audit-logger'
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response'

// Zod schemas para validación
const ActualizarPaqueteSchema = z.object({
    nombre: z.string().min(1, 'Nombre es requerido').optional(),
    descripcion: z.string().nullable().optional(),
    tipo: z.string().optional(),
    estado: z.string().optional(),
    editoraId: z.string().optional(),
    editoraNombre: z.string().optional(),
    programaId: z.string().optional(),
    programaNombre: z.string().optional(),
    horario: z.object({
        inicio: z.string().optional(),
        fin: z.string().optional()
    }).optional(),
    diasSemana: z.array(z.number()).optional(),
    duraciones: z.array(z.number()).optional(),
    precioBase: z.number().positive('Precio debe ser mayor a 0').optional(),
    precioActual: z.number().optional(),
    nivelExclusividad: z.string().optional(),
    vigenciaDesde: z.string().optional(),
    vigenciaHasta: z.string().optional(),
    updatedBy: z.string().optional()
})

// GET /api/paquetes/[id] - Obtener detalle
const GET = withApiRoute(
    { resource: 'paquetes', action: 'read' },
    async ({ ctx, req }) => {
        try {
            const db = getDB()
            const { searchParams } = new URL(req.url)
            const id = searchParams.get('id')

            if (!id) {
                return apiError('MISSING_PARAMETER', 'ID de paquete es requerido', 400)
            }

            const [paquete] = await db
                .select()
                .from(paquetes)
                .where(and(eq(paquetes.id, id), isNull(paquetes.deletedAt)))
                .limit(1)

            if (!paquete) {
                auditLogger.logEvent({
                    eventType: AuditEventType.DATA_READ,
                    severity: AuditSeverity.LOW,
                    userId: ctx.userId,
                    resource: 'paquetes',
                    action: 'read',
                    success: false,
                    details: { paqueteId: id, tenantId: ctx.tenantId, error: 'Paquete no encontrado' }
                })
                return apiError('NOT_FOUND', 'Paquete no encontrado', 404)
            }

            // Obtener historial de precios
            const historialPrecios = await db
                .select()
                .from(paquetesHistorialPrecio)
                .where(eq(paquetesHistorialPrecio.paqueteId, id))
                .orderBy(desc(paquetesHistorialPrecio.fechaVigencia))
                .limit(10)

            // Obtener disponibilidad reciente
            const disponibilidad = await db
                .select()
                .from(paquetesDisponibilidad)
                .where(eq(paquetesDisponibilidad.paqueteId, id))
                .orderBy(desc(paquetesDisponibilidad.fecha))
                .limit(30)

            // Obtener restricciones
            const restricciones = await db
                .select()
                .from(paquetesRestricciones)
                .where(and(eq(paquetesRestricciones.paqueteId, id), eq(paquetesRestricciones.activos, true)))

            auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.LOW,
                userId: ctx.userId,
                resource: 'paquetes',
                action: 'read',
                success: true,
                details: { paqueteId: id, nombre: paquete.nombre, tenantId: ctx.tenantId }
            })

            return apiSuccess({
                ...paquete,
                historialPrecios,
                disponibilidad,
                restricciones
            })
        } catch (error) {
            console.error('[Paquetes API] GET [id] error:', error)
            auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.MEDIUM,
                userId: ctx.userId,
                resource: 'paquetes',
                action: 'read',
                success: false,
                details: { error: 'Error al obtener paquete', tenantId: ctx.tenantId }
            })
            return apiServerError('Error al obtener paquete')
        }
    }
)

export { GET }

// PUT /api/paquetes/[id] - Actualizar paquete
const PUT = withApiRoute(
    { resource: 'paquetes', action: 'update' },
    async ({ ctx, req }) => {
        try {
            const db = getDB()
            const body = await req.json()
            const { searchParams } = new URL(req.url)
            const id = searchParams.get('id')

            if (!id) {
                return apiError('MISSING_PARAMETER', 'ID de paquete es requerido', 400)
            }

            // Validar input con Zod
            const parsed = ActualizarPaqueteSchema.safeParse(body)
            if (!parsed.success) {
                return apiError('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Datos inválidos', 400)
            }

            // Verificar que existe
            const [existente] = await db
                .select()
                .from(paquetes)
                .where(and(eq(paquetes.id, id), isNull(paquetes.deletedAt)))
                .limit(1)

            if (!existente) {
                auditLogger.logEvent({
                    eventType: AuditEventType.DATA_UPDATE,
                    severity: AuditSeverity.MEDIUM,
                    userId: ctx.userId,
                    resource: 'paquetes',
                    action: 'update',
                    success: false,
                    details: { paqueteId: id, tenantId: ctx.tenantId, error: 'Paquete no encontrado' }
                })
                return apiError('NOT_FOUND', 'Paquete no encontrado', 404)
            }

            // Si cambia precio, registrar en historial
            if (parsed.data.precioBase && parsed.data.precioBase !== existente.precioBase) {
                await db.insert(paquetesHistorialPrecio).values({
                    id: `hp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                    paqueteId: id,
                    precioBase: existente.precioBase,
                    precioFinal: parsed.data.precioBase,
                    fechaVigencia: new Date().toISOString().split('T')[0],
                    creadoPor: parsed.data.updatedBy || ctx.userId
                })
            }

            // Build update object
            const updateData: Record<string, unknown> = {
                updatedBy: parsed.data.updatedBy || ctx.userId,
                updatedAt: new Date(),
                version: existente.version + 1
            }

            if (parsed.data.nombre) updateData.nombre = parsed.data.nombre
            if (parsed.data.descripcion !== undefined) updateData.descripcion = parsed.data.descripcion
            if (parsed.data.tipo) updateData.tipo = parsed.data.tipo
            if (parsed.data.estado) updateData.estado = parsed.data.estado
            if (parsed.data.editoraId) {
                updateData.editoraId = parsed.data.editoraId
                updateData.editoraNombre = parsed.data.editoraNombre
            }
            if (parsed.data.programaId) {
                updateData.programaId = parsed.data.programaId
                updateData.programaNombre = parsed.data.programaNombre
            }
            if (parsed.data.horario) {
                updateData.horarioInicio = parsed.data.horario.inicio
                updateData.horarioFin = parsed.data.horario.fin
            }
            if (parsed.data.diasSemana) updateData.diasSemana = parsed.data.diasSemana
            if (parsed.data.duraciones) updateData.duraciones = parsed.data.duraciones
            if (parsed.data.precioBase) {
                updateData.precioBase = parsed.data.precioBase
                updateData.precioActual = parsed.data.precioActual || parsed.data.precioBase
            }
            if (parsed.data.nivelExclusividad) updateData.nivelExclusividad = parsed.data.nivelExclusividad
            if (parsed.data.vigenciaDesde) updateData.vigenciaDesde = parsed.data.vigenciaDesde
            if (parsed.data.vigenciaHasta) updateData.vigenciaHasta = parsed.data.vigenciaHasta

            const [paquete] = await db
                .update(paquetes)
                .set(updateData)
                .where(eq(paquetes.id, id))
                .returning()

            auditLogger.logEvent({
                eventType: AuditEventType.DATA_UPDATE,
                severity: AuditSeverity.MEDIUM,
                userId: ctx.userId,
                resource: 'paquetes',
                action: 'update',
                success: true,
                details: { paqueteId: id, nombre: paquete.nombre, cambios: Object.keys(updateData), tenantId: ctx.tenantId }
            })

            return apiSuccess(paquete)
        } catch (error) {
            console.error('[Paquetes API] PUT [id] error:', error)
            auditLogger.logEvent({
                eventType: AuditEventType.DATA_UPDATE,
                severity: AuditSeverity.MEDIUM,
                userId: ctx.userId,
                resource: 'paquetes',
                action: 'update',
                success: false,
                details: { error: 'Error al actualizar paquete', tenantId: ctx.tenantId }
            })
            return apiServerError('Error al actualizar paquete')
        }
    }
)

export { PUT }

// DELETE /api/paquetes/[id] - Soft delete
const DELETE = withApiRoute(
    { resource: 'paquetes', action: 'delete' },
    async ({ ctx, req }) => {
        try {
            const db = getDB()
            const { searchParams } = new URL(req.url)
            const id = searchParams.get('id')
            const usuario = searchParams.get('usuario') || ctx.userId

            if (!id) {
                return apiError('MISSING_PARAMETER', 'ID de paquete es requerido', 400)
            }

            const [existente] = await db
                .select()
                .from(paquetes)
                .where(and(eq(paquetes.id, id), isNull(paquetes.deletedAt)))
                .limit(1)

            if (!existente) {
                auditLogger.logEvent({
                    eventType: AuditEventType.DATA_DELETE,
                    severity: AuditSeverity.HIGH,
                    userId: ctx.userId,
                    resource: 'paquetes',
                    action: 'delete',
                    success: false,
                    details: { paqueteId: id, tenantId: ctx.tenantId, error: 'Paquete no encontrado' }
                })
                return apiError('NOT_FOUND', 'Paquete no encontrado', 404)
            }

            await db
                .update(paquetes)
                .set({
                    estado: 'BORRADO',
                    deletedAt: new Date(),
                    updatedBy: usuario,
                    updatedAt: new Date()
                })
                .where(eq(paquetes.id, id))

            auditLogger.logEvent({
                eventType: AuditEventType.DATA_DELETE,
                severity: AuditSeverity.HIGH,
                userId: ctx.userId,
                resource: 'paquetes',
                action: 'delete',
                success: true,
                details: { paqueteId: id, nombre: existente.nombre, tenantId: ctx.tenantId }
            })

            return apiSuccess({ success: true, message: 'Paquete eliminado' })
        } catch (error) {
            console.error('[Paquetes API] DELETE [id] error:', error)
            auditLogger.logEvent({
                eventType: AuditEventType.DATA_DELETE,
                severity: AuditSeverity.HIGH,
                userId: ctx.userId,
                resource: 'paquetes',
                action: 'delete',
                success: false,
                details: { error: 'Error al eliminar paquete', tenantId: ctx.tenantId }
            })
            return apiServerError('Error al eliminar paquete')
        }
    }
)

export { DELETE }
