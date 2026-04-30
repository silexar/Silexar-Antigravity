/**
 * API ROUTE: /api/paquetes/informes
 * 
 * @description Endpoints para reportes e informes del módulo Paquetes.
 * FASE 6: Reportes e Informes
 * 
 * @version 1.0.0
 */

import { z } from 'zod'
import { NextRequest } from 'next/server'
import { getDB } from '@/lib/db'
import { paquetes, paquetesDisponibilidad, paquetesHistorialPrecio, paquetesPerformance } from '@/lib/db/paquetes-schema'
import { eq, and, isNull, desc, gte, lte, count, sum, avg } from 'drizzle-orm'
import { withApiRoute } from '@/lib/api/with-api-route'
import { auditLogger, AuditEventType, AuditSeverity } from '@/lib/security/audit-logger'
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response'

// ═══════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════

const ReporteOcupacionSchema = z.object({
    fechaDesde: z.string().optional(),
    fechaHasta: z.string().optional(),
    tipo: z.string().optional(),
    EditoraId: z.string().optional()
})

const ReporteRentabilidadSchema = z.object({
    fechaDesde: z.string().optional(),
    fechaHasta: z.string().optional(),
    tipo: z.string().optional()
})

// ═══════════════════════════════════════════════════════════════
// GET /api/paquetes/informes/ocupacion - Reporte de ocupación
// ═══════════════════════════════════════════════════════════════

export const GET = withApiRoute(
    { resource: 'paquetes', action: 'read', skipCsrf: true },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId || 'default'
        const userId = ctx.userId || 'anonymous'

        try {
            const { searchParams } = new URL(req.url)
            const tipo = searchParams.get('tipo') || 'ocupacion'
            const fechaDesde = searchParams.get('fechaDesde')
            const fechaHasta = searchParams.get('fechaHasta')
            const EditoraId = searchParams.get('editoraId')

            const db = getDB()

            // Obtener todos los paquetes (con filtros)
            const condiciones = [isNull(paquetes.deletedAt)];
            if (EditoraId) {
                condiciones.push(eq(paquetes.editoraId, EditoraId));
            }

            const paquetesData = await db
                .select({
                    id: paquetes.id,
                    codigo: paquetes.codigo,
                    nombre: paquetes.nombre,
                    tipo: paquetes.tipo,
                    estado: paquetes.estado,
                    editoraId: paquetes.editoraId,
                    editoraNombre: paquetes.editoraNombre,
                    precioActual: paquetes.precioActual
                })
                .from(paquetes)
                .where(and(...condiciones))

            // Obtener disponibilidad de los últimos 30 días
            const disponibilidadData = await db
                .select()
                .from(paquetesDisponibilidad)
                .orderBy(desc(paquetesDisponibilidad.fecha))

            // Calcular métricas por paquete
            const metricasPorPaquete = paquetesData.map(paq => {
                const dispPaquete = disponibilidadData.filter(d => d.paqueteId === paq.id)

                const totalCupos = dispPaquete.reduce((sum, d) => sum + (d.cuposTotales || 0), 0)
                const totalOcupados = dispPaquete.reduce((sum, d) => sum + (d.cuposOcupados || 0), 0)
                const ocupacionPct = totalCupos > 0 ? Math.round((totalOcupados / totalCupos) * 100) : 0

                const revenueEstimado = totalOcupados * paq.precioActual

                return {
                    id: paq.id,
                    codigo: paq.codigo,
                    nombre: paq.nombre,
                    tipo: paq.tipo,
                    estado: paq.estado,
                    editora: paq.editoraNombre,
                    metricas: {
                        totalCupos,
                        cuposOcupados: totalOcupados,
                        disponibles: totalCupos - totalOcupados,
                        ocupacionPct,
                        revenueEstimado
                    }
                }
            })

            // Calcular totales generales
            const totales = {
                totalPaquetes: paquetesData.length,
                totalCupos: metricasPorPaquete.reduce((sum, p) => sum + p.metricas.totalCupos, 0),
                totalOcupados: metricasPorPaquete.reduce((sum, p) => sum + p.metricas.cuposOcupados, 0),
                ocupacionPromedio: metricasPorPaquete.length > 0
                    ? Math.round(metricasPorPaquete.reduce((sum, p) => sum + p.metricas.ocupacionPct, 0) / metricasPorPaquete.length)
                    : 0,
                revenueTotalEstimado: metricasPorPaquete.reduce((sum, p) => sum + p.metricas.revenueEstimado, 0)
            }

            auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.MEDIUM,
                userId,
                resource: 'paquetes',
                action: 'report_ocupacion',
                success: true,
                details: {
                    tenantId,
                    tipoReporte: 'ocupacion',
                    totalPaquetes: paquetesData.length,
                    fechaDesde,
                    fechaHasta
                }
            })

            return apiSuccess({
                reporte: 'Ocupación de Paquetes',
                fechaGeneracion: new Date().toISOString(),
                filtros: { fechaDesde, fechaHasta, tipo, EditoraId },
                totales,
                paquetes: metricasPorPaquete.sort((a, b) => b.metricas.ocupacionPct - a.metricas.ocupacionPct)
            })

        } catch (error) {
            console.error('[Paquetes-Informes] GET error:', error)
            auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.HIGH,
                userId,
                resource: 'paquetes',
                action: 'report_ocupacion',
                success: false,
                details: { error: String(error), tenantId }
            })
            return apiServerError('Error al generar reporte de ocupación')
        }
    }
)

// ═══════════════════════════════════════════════════════════════
// POST /api/paquetes/informes/rentabilidad - Reporte de rentabilidad
// ═══════════════════════════════════════════════════════════════

export const POST = withApiRoute(
    { resource: 'paquetes', action: 'read' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId || 'default'
        const userId = ctx.userId || 'anonymous'

        try {
            const body = await req.json();
            const validation = ReporteRentabilidadSchema.safeParse(body)
            if (!validation.success) {
                return apiError('VALIDATION_ERROR', 'Datos inválidos', 400, validation.error.flatten().fieldErrors)
            }

            const { fechaDesde, fechaHasta, tipo } = validation.data
            const db = getDB()

            // Obtener historial de precios para calcular márgenes
            const historialPrecios = await db
                .select()
                .from(paquetesHistorialPrecio)
                .orderBy(desc(paquetesHistorialPrecio.fechaVigencia))

            // Obtener performance si existe
            const performanceData = await db
                .select()
                .from(paquetesPerformance)
                .orderBy(desc(paquetesPerformance.fecha))

            // Obtener paquetes
            const paquetesData = await db
                .select({
                    id: paquetes.id,
                    codigo: paquetes.codigo,
                    nombre: paquetes.nombre,
                    tipo: paquetes.tipo,
                    precioBase: paquetes.precioBase,
                    precioActual: paquetes.precioActual,
                    nivelExclusividad: paquetes.nivelExclusividad
                })
                .from(paquetes)
                .where(isNull(paquetes.deletedAt))

            // Calcular rentabilidad por paquete
            const rentabilidadPorPaquete = paquetesData.map(paq => {
                // Obtener historial de precios del paquete
                const histPaq = historialPrecios.filter(h => h.paqueteId === paq.id)
                const perfPaq = performanceData.filter(p => p.paqueteId === paq.id)

                // Calcular precio promedio histórico
                const precioPromedio = histPaq.length > 0
                    ? histPaq.reduce((sum, h) => sum + Number(h.precioFinal), 0) / histPaq.length
                    : paq.precioActual

                // Calcular margen
                const margen = paq.precioBase > 0
                    ? Math.round(((paq.precioActual - paq.precioBase) / paq.precioBase) * 100)
                    : 0

                // Revenue total del período
                const revenueTotal = perfPaq.reduce((sum, p) => sum + Number(p.revenue || 0), 0)
                const conversionesTotales = perfPaq.reduce((sum, p) => sum + (p.conversiones || 0), 0)

                return {
                    id: paq.id,
                    codigo: paq.codigo,
                    nombre: paq.nombre,
                    tipo: paq.tipo,
                    precios: {
                        base: paq.precioBase,
                        actual: paq.precioActual,
                        promedio: Math.round(precioPromedio)
                    },
                    margenPorcentaje: margen,
                    nivelExclusividad: paq.nivelExclusividad,
                    performance: {
                        revenueTotal,
                        conversiones: conversionesTotales,
                        ctrPromedio: perfPaq.length > 0
                            ? Math.round(perfPaq.reduce((sum, p) => sum + Number(p.ctr || 0), 0) / perfPaq.length * 100) / 100
                            : 0
                    },
                    estadoMargen: margen > 10 ? 'ALTO' : margen > 0 ? 'NORMAL' : margen < 0 ? 'BAJO' : 'NEUTRAL'
                }
            })

            // Resumen por tipo de paquete
            const resumenPorTipo = paquetesData.reduce((acc, paq) => {
                if (!acc[paq.tipo]) {
                    acc[paq.tipo] = { count: 0, revenueTotal: 0, margenPromedio: 0 }
                }
                const rentable = rentabilidadPorPaquete.find(r => r.id === paq.id)
                acc[paq.tipo].count++
                acc[paq.tipo].revenueTotal += rentable?.performance.revenueTotal || 0
                acc[paq.tipo].margenPromedio += rentable?.margenPorcentaje || 0
                return acc
            }, {} as Record<string, { count: number; revenueTotal: number; margenPromedio: number }>)

            Object.keys(resumenPorTipo).forEach(tipo => {
                const data = resumenPorTipo[tipo]
                data.margenPromedio = data.count > 0 ? Math.round(data.margenPromedio / data.count) : 0
            })

            auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.MEDIUM,
                userId,
                resource: 'paquetes',
                action: 'report_rentabilidad',
                success: true,
                details: {
                    tenantId,
                    tipoReporte: 'rentabilidad',
                    totalPaquetes: paquetesData.length,
                    fechaDesde,
                    fechaHasta
                }
            })

            return apiSuccess({
                reporte: 'Rentabilidad de Paquetes',
                fechaGeneracion: new Date().toISOString(),
                filtros: { fechaDesde, fechaHasta, tipo },
                resumenPorTipo,
                paquetes: rentabilidadPorPaquete.sort((a, b) => b.margenPorcentaje - a.margenPorcentaje)
            })

        } catch (error) {
            console.error('[Paquetes-Informes] POST error:', error)
            auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.HIGH,
                userId,
                resource: 'paquetes',
                action: 'report_rentabilidad',
                success: false,
                details: { error: String(error), tenantId }
            })
            return apiServerError('Error al generar reporte de rentabilidad')
        }
    }
)