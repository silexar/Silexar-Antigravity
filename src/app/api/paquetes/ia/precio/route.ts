/**
 * API ROUTE: /api/paquetes/ia/precio
 * 
 * @description Endpoint para análisis de precios con IA (Cortex-Pricing).
 * FASE 3: Inteligencia Artificial - Cortex
 * 
 * @version 1.0.0
 */

import { z } from 'zod'
import { NextRequest } from 'next/server'
import { withApiRoute } from '@/lib/api/with-api-route'
import { auditLogger, AuditEventType, AuditSeverity } from '@/lib/security/audit-logger'
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response'
import { cortexPricingService, type PricingAnalysis, type PricingStrategy } from '@/modules/paquetes/infrastructure/external/CortexPricingService'

// ═══════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════

const AnalizarPrecioSchema = z.object({
    paqueteId: z.string().min(1, 'ID de paquete es requerido'),
    tipo: z.string().min(1, 'Tipo de paquete es requerido'),
    precioBase: z.number().positive('Precio base debe ser mayor a 0'),
    ocupacionActual: z.number().min(0).max(100),
    ocupacionHistorico: z.array(z.number()).optional().default([])
})

const SimularImpactoSchema = z.object({
    precioActual: z.number().positive(),
    nuevoPrecio: z.number().positive(),
    ocupacionActual: z.number().min(0).max(100)
})

// ═══════════════════════════════════════════════════════════════
// POST /api/paquetes/ia/precio/analizar - Analizar precio con IA
// ═══════════════════════════════════════════════════════════════

export const POST = withApiRoute(
    { resource: 'paquetes', action: 'read' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId || 'default'
        const userId = ctx.userId || 'anonymous'

        try {
            const body = await req.json()
            const validation = AnalizarPrecioSchema.safeParse(body)
            if (!validation.success) {
                return apiError(
                    'VALIDATION_ERROR',
                    'Datos inválidos para análisis de precio',
                    400,
                    validation.error.flatten().fieldErrors
                )
            }

            const { paqueteId, tipo, precioBase, ocupacionActual, ocupacionHistorico } = validation.data

            // Invocar servicio de IA
            const analisis: PricingAnalysis = await cortexPricingService.analizarPrecio({
                paqueteId,
                tipo,
                precioBase,
                ocupacionActual,
                ocupacionHistorico
            })

            auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.MEDIUM,
                userId,
                resource: 'paquetes',
                action: 'ia_analysis',
                success: true,
                details: {
                    paqueteId,
                    tipo,
                    precioBase,
                    precioOptimo: analisis.precioOptimo,
                    confianza: analisis.confianza,
                    estrategiasCount: analisis.estrategias.length,
                    tenantId
                }
            })

            return apiSuccess({
                analisis,
                recomendaciones: generarRecomendaciones(analisis),
                factores: {
                    demanda: {
                        valor: analisis.factorDemanda,
                        interpretacion: interpretarFactor(analisis.factorDemanda, 'demanda')
                    },
                    estacional: {
                        valor: analisis.factorEstacional,
                        interpretacion: interpretarFactor(analisis.factorEstacional, 'estacional')
                    },
                    competencia: {
                        valor: analisis.factorCompetencia,
                        interpretacion: interpretarFactor(analisis.factorCompetencia, 'competencia')
                    }
                },
                timestamp: new Date().toISOString()
            })

        } catch (error) {
            console.error('[Paquetes-IA] POST error:', error)
            auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.HIGH,
                userId,
                resource: 'paquetes',
                action: 'ia_analysis',
                success: false,
                details: { error: String(error), tenantId }
            })
            return apiServerError('Error en análisis de precio con IA')
        }
    }
)

// ═══════════════════════════════════════════════════════════════
// GET /api/paquetes/ia/precio/estrategias - Obtener estrategias disponibles
// ═══════════════════════════════════════════════════════════════

export const GET = withApiRoute(
    { resource: 'paquetes', action: 'read', skipCsrf: true },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId || 'default'
        const userId = ctx.userId || 'anonymous'

        try {
            const { searchParams } = new URL(req.url)
            const tipo = searchParams.get('tipo')
            const precioBase = parseFloat(searchParams.get('precioBase') || '0')

            if (!tipo || precioBase <= 0) {
                return apiError('MISSING_PARAMETER', 'tipo y precioBase son requeridos', 400)
            }

            // Obtener factores estacionales
            const factores = cortexPricingService.getFactoresEstacionales()

            // Generar análisis rápido para obtener estrategias
            const analisis = await cortexPricingService.analizarPrecio({
                paqueteId: 'preview',
                tipo,
                precioBase,
                ocupacionActual: 50,
                ocupacionHistorico: [45, 50, 55, 48, 52, 50]
            })

            auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.LOW,
                userId,
                resource: 'paquetes',
                action: 'ia_estrategias',
                success: true,
                details: { tipo, precioBase, estrategiasCount: analisis.estrategias.length, tenantId }
            })

            return apiSuccess({
                tipo,
                precioBase,
                estrategias: analisis.estrategias,
                factoresEstacionales: factores,
                fechaActualizacion: new Date().toISOString()
            })

        } catch (error) {
            console.error('[Paquetes-IA] GET error:', error)
            auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.HIGH,
                userId,
                resource: 'paquetes',
                action: 'ia_estrategias',
                success: false,
                details: { error: String(error), tenantId }
            })
            return apiServerError('Error al obtener estrategias de precio')
        }
    }
)

// ═══════════════════════════════════════════════════════════════
// PUT /api/paquetes/ia/precio/simular - Simular impacto de cambio de precio
// ═══════════════════════════════════════════════════════════════

export const PUT = withApiRoute(
    { resource: 'paquetes', action: 'read' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId || 'default'
        const userId = ctx.userId || 'anonymous'

        try {
            const body = await req.json()
            const validation = SimularImpactoSchema.safeParse(body)

            if (!validation.success) {
                return apiError(
                    'VALIDATION_ERROR',
                    'Datos inválidos para simulación',
                    400,
                    validation.error.flatten().fieldErrors
                )
            }

            const { precioActual, nuevoPrecio, ocupacionActual } = validation.data

            const impacto = cortexPricingService.simularImpacto(precioActual, nuevoPrecio, ocupacionActual)

            auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.LOW,
                userId,
                resource: 'paquetes',
                action: 'ia_simulacion',
                success: true,
                details: {
                    precioActual,
                    nuevoPrecio,
                    cambioPorcentaje: impacto.cambioPorcentaje,
                    tenantId
                }
            })

            return apiSuccess({
                simulacion: {
                    precioActual,
                    nuevoPrecio,
                    cambioPorcentaje: impacto.cambioPorcentaje,
                    perdidaClientesEstimada: impacto.perdidaClientesEstimada,
                    ingresoAdicional: impacto.ingresoAdicional,
                    interpretacion: interpretarCambio(impacto)
                },
                recomendacion: generarRecomendacionSimulacion(impacto),
                timestamp: new Date().toISOString()
            })

        } catch (error) {
            console.error('[Paquetes-IA] PUT error:', error)
            auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.HIGH,
                userId,
                resource: 'paquetes',
                action: 'ia_simulacion',
                success: false,
                details: { error: String(error), tenantId }
            })
            return apiServerError('Error en simulación de precio')
        }
    }
)

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function interpretarFactor(factor: number, tipo: 'demanda' | 'estacional' | 'competencia'): string {
    const interpretaciones = {
        demanda: {
            above: 'Alta demanda - considerar subir precio',
            neutral: 'Demanda normal',
            below: 'Baja demanda - considerar descuento'
        },
        estacional: {
            above: 'Temporada alta - precio premium',
            neutral: 'Período normal',
            below: 'Temporada baja - puede haber espacio para descuentos'
        },
        competencia: {
            above: 'Por encima de competencia - mantener vigilancia',
            neutral: 'En línea con mercado',
            below: 'Por debajo del mercado - oportunidad de subir'
        }
    }

    if (factor > 1.05) return interpretaciones[tipo].above
    if (factor < 0.95) return interpretaciones[tipo].below
    return interpretaciones[tipo].neutral
}

function generarRecomendaciones(analisis: PricingAnalysis): string[] {
    const recomendaciones: string[] = []

    if (analisis.factorDemanda >= 1.10) {
        recomendaciones.push('La demanda actual es alta. Se recomienda implementar estrategia PREMIUM.')
    }

    if (analisis.factorEstacional > 1.10) {
        recomendaciones.push('Nos encontramos en temporada alta. Considerar ajustar precios al alza.')
    }

    if (analisis.confianza >= 80) {
        recomendaciones.push(`Alta confianza en el análisis (${analisis.confianza}%). Las estrategias sugeridas son robustas.`)
    } else if (analisis.confianza < 50) {
        recomendaciones.push('Confianza baja en el análisis. Se recomienda collecting more historical data.')
    }

    // Recomendación de mejor estrategia
    const estrategiaOptima = analisis.estrategias.find(e => e.tipo === 'OPTIMO')
    if (estrategiaOptima) {
        recomendaciones.push(`Estrategia óptima: $${estrategiaOptima.precioSugerido.toLocaleString('es-CL')} (${estrategiaOptima.justificacion})`)
    }

    return recomendaciones
}

function interpretarCambio(impacto: { cambioPorcentaje: number; perdidaClientesEstimada: number; ingresoAdicional: number }): string {
    if (impacto.cambioPorcentaje > 10) {
        return 'Incremento significativo puede impactar volume negatively. Monitorear de cerca.'
    }
    if (impacto.cambioPorcentaje > 5) {
        return 'Incremento moderado. Expect impact minor en ocupación.'
    }
    if (impacto.cambioPorcentaje < -10) {
        return 'Descuento significativo puede afectar percepción de marca.'
    }
    if (impacto.cambioPorcentaje < -5) {
        return 'Descuento moderado puede ayudar a mantener ocupación.'
    }
    return 'Cambio de precio нейтральный. Continuar monitoreando.'
}

function generarRecomendacionSimulacion(impacto: { cambioPorcentaje: number; perdidaClientesEstimada: number; ingresoAdicional: number }): string {
    if (impacto.ingresoAdicional > 0 && impacto.perdidaClientesEstimada <= 5) {
        return 'SIMULAR: El cambio es favorable. Ingreso adicional projected with minimal client loss.'
    }
    if (impacto.ingresoAdicional > 0 && impacto.perdidaClientesEstimada <= 10) {
        return 'ACEPTABLE: El cambio genera más ingresos pero hay cierta pérdida de clientes.'
    }
    if (impacto.ingresoAdicional < 0 && impacto.perdidaClientesEstimada > 10) {
        return 'NO RECOMENDADO: El cambio impactaría negatively both revenue y client retention.'
    }
    return 'EVALUAR: Se recomienda analizar más factores antes de implementar.'
}