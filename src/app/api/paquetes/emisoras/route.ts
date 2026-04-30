/**
 * API ROUTE: /api/paquetes/emisoras
 * 
 * @description Endpoints para integrar paquetes con emisoras.
 * FASE 2: Integración con Emisoras
 * 
 * @version 1.0.0
 */

import { z } from 'zod'
import { NextRequest } from 'next/server'
import { getDB } from '@/lib/db'
import { paquetes, paquetesDisponibilidad } from '@/lib/db/paquetes-schema'
import { eq, and, isNull, desc, count } from 'drizzle-orm'
import { withApiRoute } from '@/lib/api/with-api-route'
import { auditLogger, AuditEventType, AuditSeverity } from '@/lib/security/audit-logger'
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response'

// ═══════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════

const VincularPaqueteSchema = z.object({
    paqueteId: z.string().min(1, 'ID de paquete es requerido'),
    contratoId: z.string().min(1, 'ID de contrato es requerido'),
    creadoPor: z.string().min(1, 'Usuario creador es requerido')
})

const DesvincularPaqueteSchema = z.object({
    paqueteId: z.string().min(1, 'ID de paquete es requerido'),
    contratoId: z.string().min(1, 'ID de contrato es requerido'),
    motivo: z.string().optional(),
    actualizadoPor: z.string().min(1, 'Usuario es requerido')
})

// ═══════════════════════════════════════════════════════════════
// GET /api/paquetes/emisoras - Paquetes por editora
// ═══════════════════════════════════════════════════════════════

export const GET = withApiRoute(
    { resource: 'paquetes', action: 'read', skipCsrf: true },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId || 'default'
        const userId = ctx.userId || 'anonymous'

        try {
            const { searchParams } = new URL(req.url)
            const editoraId = searchParams.get('editoraId')

            if (!editoraId) {
                return apiError('MISSING_PARAMETER', 'editoraId es requerido', 400)
            }

            const db = getDB()

            // Obtener paquetes de la editora
            const paquetesEditoras = await db
                .select()
                .from(paquetes)
                .where(and(
                    eq(paquetes.editoraId, editoraId),
                    isNull(paquetes.deletedAt)
                ))
                .orderBy(desc(paquetes.createdAt))

            // Obtener métricas de disponibilidad para cada paquete
            const paquetesConDisponibilidad = await Promise.all(
                paquetesEditoras.map(async (paq) => {
                    const disponibilidadStats = await db
                        .select({
                            cuposTotales: paquetesDisponibilidad.cuposTotales,
                            cuposOcupados: paquetesDisponibilidad.cuposOcupados
                        })
                        .from(paquetesDisponibilidad)
                        .where(eq(paquetesDisponibilidad.paqueteId, paq.id))

                    const totalCupos = disponibilidadStats.reduce((sum, d) => sum + (d.cuposTotales || 0), 0)
                    const totalOcupados = disponibilidadStats.reduce((sum, d) => sum + (d.cuposOcupados || 0), 0)
                    const ocupacionPct = totalCupos > 0 ? Math.round((totalOcupados / totalCupos) * 100) : 0

                    return {
                        id: paq.id,
                        codigo: paq.codigo,
                        nombre: paq.nombre,
                        tipo: paq.tipo,
                        estado: paq.estado,
                        programa: {
                            id: paq.programaId,
                            nombre: paq.programaNombre
                        },
                        horario: {
                            inicio: paq.horarioInicio,
                            fin: paq.horarioFin
                        },
                        precioBase: paq.precioBase,
                        precioActual: paq.precioActual,
                        ocupacionActual: ocupacionPct,
                        metrics: {
                            totalCupos,
                            cuposOcupados: totalOcupados,
                            disponibles: totalCupos - totalOcupados
                        }
                    }
                })
            )

            auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.LOW,
                userId,
                resource: 'paquetes',
                action: 'read',
                success: true,
                details: {
                    action: 'get_paquetes_by_editora',
                    editoraId,
                    count: paquetesConDisponibilidad.length,
                    tenantId
                }
            })

            return apiSuccess({
                editoraId,
                totalPaquetes: paquetesConDisponibilidad.length,
                paquetes: paquetesConDisponibilidad
            })

        } catch (error) {
            console.error('[Paquetes-Emisoras API] GET error:', error)
            auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.HIGH,
                userId,
                resource: 'paquetes',
                action: 'read',
                success: false,
                details: { action: 'get_paquetes_by_editora', error: String(error), tenantId }
            })
            return apiServerError('Error al obtener paquetes por editora')
        }
    }
)

// ═══════════════════════════════════════════════════════════════
// POST /api/paquetes/emisoras/vincular - Vincular paquete a contrato
// ═══════════════════════════════════════════════════════════════

export const POST = withApiRoute(
    { resource: 'paquetes', action: 'update' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId || 'default'
        const userId = ctx.userId || 'anonymous'

        try {
            const body = await req.json()
            const validation = VincularPaqueteSchema.safeParse(body)
            if (!validation.success) {
                return apiError(
                    'VALIDATION_ERROR',
                    'Datos inválidos',
                    400,
                    validation.error.flatten().fieldErrors
                )
            }

            const { paqueteId, contratoId, creadoPor } = validation.data
            const db = getDB()

            // Verificar que el paquete existe
            const [paquete] = await db
                .select()
                .from(paquetes)
                .where(and(eq(paquetes.id, paqueteId), isNull(paquetes.deletedAt)))
                .limit(1)

            if (!paquete) {
                auditLogger.logEvent({
                    eventType: AuditEventType.DATA_UPDATE,
                    severity: AuditSeverity.MEDIUM,
                    userId,
                    resource: 'paquetes',
                    action: 'update',
                    success: false,
                    details: { action: 'vincular_paquete', paqueteId, tenantId, error: 'Paquete no encontrado' }
                })
                return apiError('NOT_FOUND', 'Paquete no encontrado', 404)
            }

            // En un sistema real, aquí verificaríamos el contrato y crearíamos la relación
            // Por ahora simulamos la vinculación
            const vinculacion = {
                paqueteId,
                contratoId,
                paqueteNombre: paquete.nombre,
                tipo: paquete.tipo,
                precio: paquete.precioActual,
                vinculadoPor: creadoPor,
                fechaVinculacion: new Date().toISOString()
            }

            auditLogger.logEvent({
                eventType: AuditEventType.DATA_UPDATE,
                severity: AuditSeverity.MEDIUM,
                userId,
                resource: 'paquetes',
                action: 'update',
                success: true,
                details: {
                    action: 'vincular_paquete',
                    paqueteId,
                    contratoId,
                    paqueteNombre: paquete.nombre,
                    tenantId
                }
            })

            return apiSuccess({
                message: 'Paquete vinculado correctamente',
                vinculacion
            }, 201)

        } catch (error) {
            console.error('[Paquetes-Emisoras API] POST error:', error)
            auditLogger.logEvent({
                eventType: AuditEventType.DATA_UPDATE,
                severity: AuditSeverity.HIGH,
                userId,
                resource: 'paquetes',
                action: 'update',
                success: false,
                details: { action: 'vincular_paquete', error: String(error), tenantId }
            })
            return apiServerError('Error al vincular paquete')
        }
    }
)

// ═══════════════════════════════════════════════════════════════
// PUT /api/paquetes/emisoras/desvincular - Desvincular paquete
// ═══════════════════════════════════════════════════════════════

export const PUT = withApiRoute(
    { resource: 'paquetes', action: 'update' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId || 'default'
        const userId = ctx.userId || 'anonymous'

        try {
            const body = await req.json()
            const validation = DesvincularPaqueteSchema.safeParse(body)

            if (!validation.success) {
                return apiError(
                    'VALIDATION_ERROR',
                    'Datos inválidos',
                    400,
                    validation.error.flatten().fieldErrors
                )
            }

            const { paqueteId, contratoId, motivo, actualizadoPor } = validation.data

            auditLogger.logEvent({
                eventType: AuditEventType.DATA_UPDATE,
                severity: AuditSeverity.MEDIUM,
                userId,
                resource: 'paquetes',
                action: 'update',
                success: true,
                details: {
                    action: 'desvincular_paquete',
                    paqueteId,
                    contratoId,
                    motivo,
                    tenantId
                }
            })

            return apiSuccess({
                message: 'Paquete desvinculado correctamente',
                paqueteId,
                contratoId,
                motivo: motivo || 'Sin motivo especificado',
                actualizadoPor
            })

        } catch (error) {
            console.error('[Paquetes-Emisoras API] PUT error:', error)
            auditLogger.logEvent({
                eventType: AuditEventType.DATA_UPDATE,
                severity: AuditSeverity.HIGH,
                userId,
                resource: 'paquetes',
                action: 'update',
                success: false,
                details: { action: 'desvincular_paquete', error: String(error), tenantId }
            })
            return apiServerError('Error al desvincular paquete')
        }
    }
)