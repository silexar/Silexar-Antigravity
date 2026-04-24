/**
 * GET /api/contratos/:id/analisis — Análisis completo AI (Cortex-Risk + Cortex-Flow)
 * 
 * Combina análisis de riesgo crediticio y predicciones de flujo
 */

import { NextResponse } from 'next/server'
import { withApiRoute } from '@/lib/api/with-api-route'
import { apiSuccess, apiError, apiServerError, apiNotFound } from '@/lib/api/response'
import { DrizzleContratoRepository } from '@/modules/contratos/infrastructure/repositories/DrizzleContratoRepository'
import { CortexRiskIntegrationService } from '@/modules/contratos/infrastructure/external/CortexRiskIntegrationService'
import { CortexFlowPredictionService } from '@/modules/contratos/infrastructure/external/CortexFlowPredictionService'
import { logger } from '@/lib/observability'
import { ContratoProps } from '@/modules/contratos/domain/entities/Contrato'
import { CortexRiskEvaluationResponse } from '@/modules/contratos/infrastructure/external/CortexRiskIntegrationService'
import { CortexFlowAnalysisResponse } from '@/modules/contratos/infrastructure/external/CortexFlowPredictionService'

// ─── Configuración de servicios AI ──────────────────────────────────────────

const cortexRisk = new CortexRiskIntegrationService({
    baseUrl: process.env.CORTEX_RISK_URL || 'http://localhost:3001',
    apiKey: process.env.CORTEX_RISK_API_KEY || 'dev-key',
    timeout: 8000
})

const cortexFlow = new CortexFlowPredictionService({
    baseUrl: process.env.CORTEX_FLOW_URL || 'http://localhost:3002',
    apiKey: process.env.CORTEX_FLOW_API_KEY || 'dev-key',
    timeout: 12000
})

// ─── GET /api/contratos/:id/analisis ─────────────────────────────────────────

export const GET = withApiRoute(
    { resource: 'contratos', action: 'read' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId
        const url = new URL(req.url)
        const pathParts = url.pathname.split('/')
        const idIndex = pathParts.findIndex(p => p === 'contratos') + 1
        const id = pathParts[idIndex]

        if (!id) {
            return apiError('MISSING_ID', 'ID de contrato es requerido', 400) as unknown as NextResponse
        }

        try {
            const repo = new DrizzleContratoRepository(tenantId)
            const contrato = await repo.findById(id)

            if (!contrato) {
                return apiNotFound('Contrato no encontrado') as unknown as NextResponse
            }

            const snap = contrato.toSnapshot()

            // Ejecutar análisis en paralelo
            const [riskResult, flowResult] = await Promise.allSettled([
                cortexRisk.evaluateClient({
                    rutCliente: snap.rutAnunciante,
                    contractValue: snap.totales.valorNeto,
                    paymentTerms: snap.terminosPago.dias,
                    contractType: snap.tipoContrato as 'A' | 'B' | 'C',
                    isExchange: snap.esCanje
                }),
                cortexFlow.analyzeContract({
                    contratoId: id,
                    anuncianteId: snap.anuncianteId,
                    valorContrato: snap.totales.valorNeto,
                    tipoContrato: snap.tipoContrato as 'A' | 'B' | 'C',
                    fechaInicio: snap.fechaInicio,
                    fechaFin: snap.fechaFin
                })
            ])

            // Procesar resultados
            const riskAnalysis = riskResult.status === 'fulfilled' ? riskResult.value : null
            const flowAnalysis = flowResult.status === 'fulfilled' ? flowResult.value : null

            // Calcular nivel de riesgo combinado
            const riesgoScore = riskAnalysis?.score || 650
            const riesgoNivel = riskAnalysis?.riskLevel || 'medio'
            const confianza = riskAnalysis?.confidence || 0.5

            // Generar insights combinados
            const insights = generateInsights(snap, riskAnalysis, flowAnalysis)

            // Calcular pricing optimizado
            const pricingOptimizado = flowAnalysis?.pricingOptimization?.optimalPricing
                || snap.totales.valorNeto

            const response = {
                contratoId: id,
                numeroContrato: snap.numero.valor,
                timestamp: new Date().toISOString(),

                // Análisis de Riesgo (Cortex-Risk)
                riesgo: {
                    score: riesgoScore,
                    nivel: riesgoNivel,
                    confianza,
                    factores: riskAnalysis?.factors || [],
                    recomendaciones: riskAnalysis?.recommendations || [],
                    limiteCredito: riskAnalysis?.creditLimit,
                    terminosPagoRecomendados: riskAnalysis?.recommendedPaymentTerms
                },

                // Predicciones (Cortex-Flow)
                prediccion: {
                    renovacion: flowAnalysis?.renewalPrediction?.probability || 0.75,
                    confianzaRenovacion: flowAnalysis?.renewalPrediction?.confidence || 0.6,
                    riesgoIncumplimiento: flowAnalysis?.defaultRisk?.probability || 0.15,
                    nivelRiesgoIncumplimiento: flowAnalysis?.defaultRisk?.riskLevel || 'medio',
                    TimingRenovacionOptimo: flowAnalysis?.renewalPrediction?.optimalRenewalTiming
                },

                // Insights y Recomendaciones
                insights,

                // Optimización de Pricing
                pricing: {
                    precioActual: snap.totales.valorNeto,
                    precioOptimizado: pricingOptimizado,
                    descuentoMaximo: pricingOptimizado > snap.totales.valorNeto
                        ? 0
                        : ((snap.totales.valorNeto - pricingOptimizado) / snap.totales.valorNeto * 100).toFixed(1),
                    variacion: ((pricingOptimizado - snap.totales.valorNeto) / snap.totales.valorNeto * 100).toFixed(1)
                },

                // Oportunidades de Negocio
                oportunidades: flowAnalysis?.upsellingOpportunities || [],

                // Satisfacción Predicha
                satisfaccion: flowAnalysis?.customerSatisfaction || {
                    currentScore: 85,
                    predictedScore3Months: 87,
                    trend: 'stable' as const
                },

                // Recomendaciones Estratégicas
                recomendacionesEstrategicas: flowAnalysis?.strategicRecommendations || [],

                // Estados de servicios
                servicios: {
                    cortexRisk: riskResult.status === 'fulfilled' ? 'ok' : 'fallback',
                    cortexFlow: flowResult.status === 'fulfilled' ? 'ok' : 'fallback'
                }
            }

            logger.info('Análisis generado:', { contratoId: id, riesgoScore, riesgoNivel })

            return apiSuccess(response, 200, { message: 'Análisis completado' }) as unknown as NextResponse

        } catch (error) {
            logger.error('Error en análisis de contrato:', error instanceof Error ? error : undefined, {
                module: 'contratos',
                action: 'analisis',
                contratoId: id
            })
            return apiServerError() as unknown as NextResponse
        }
    }
)

// ─── Helper: Generar Insights ────────────────────────────────────────────────

function generateInsights(
    snap: ContratoProps,
    riskAnalysis: CortexRiskEvaluationResponse | null,
    flowAnalysis: CortexFlowAnalysisResponse | null
): Array<{ tipo: string; titulo: string; descripcion: string; prioridad: 'alta' | 'media' | 'baja' }> {
    const insights: Array<{ tipo: string; titulo: string; descripcion: string; prioridad: 'alta' | 'media' | 'baja' }> = []

    // Insight de riesgo
    if (riskAnalysis) {
        if (riskAnalysis.riskLevel === 'alto') {
            insights.push({
                tipo: 'riesgo',
                titulo: 'Cliente de alto riesgo',
                descripcion: `Score: ${riskAnalysis.score}. Requiere garantías o términos reducidos.`,
                prioridad: 'alta'
            })
        } else if (riskAnalysis.riskLevel === 'bajo') {
            insights.push({
                tipo: 'oportunidad',
                titulo: 'Cliente de bajo riesgo',
                descripcion: 'Apto para términos extendidos y descuentos por volumen.',
                prioridad: 'media'
            })
        }
    }

    // Insight de renovación
    if (flowAnalysis?.renewalPrediction) {
        const prob = flowAnalysis.renewalPrediction.probability
        if (prob >= 0.85) {
            insights.push({
                tipo: 'renovacion',
                titulo: 'Alta probabilidad de renovación',
                descripcion: `Contactar 30 días antes del ${flowAnalysis.renewalPrediction.optimalRenewalTiming.toISOString().split('T')[0]} para maximizar conversión.`,
                prioridad: 'media'
            })
        } else if (prob < 0.5) {
            insights.push({
                tipo: 'renovacion',
                titulo: 'Riesgo de no renovación',
                descripcion: 'Implementar plan de retención. Revisar satisfacción del cliente.',
                prioridad: 'alta'
            })
        }
    }

    // Insight de pricing
    if (flowAnalysis?.pricingOptimization) {
        const diff = (flowAnalysis.pricingOptimization.optimalPricing - snap.totales.valorNeto) / snap.totales.valorNeto
        if (diff > 0.1) {
            insights.push({
                tipo: 'pricing',
                titulo: 'Precio subvaluado detectado',
                descripcion: `El precio está ${(diff * 100).toFixed(0)}% bajo el optimal de mercado. Considerar ajuste.`,
                prioridad: 'media'
            })
        }
    }

    // Insight de upselling
    if (flowAnalysis?.upsellingOpportunities?.length) {
        const mejorOp = flowAnalysis.upsellingOpportunities[0]
        insights.push({
            tipo: 'upselling',
            titulo: `Oportunidad: ${mejorOp.type}`,
            descripcion: `Valor estimado: $${(mejorOp.estimatedValue / 1000000).toFixed(1)}M. Probabilidad: ${(mejorOp.probability * 100).toFixed(0)}%`,
            prioridad: 'media'
        })
    }

    // Insight de ejecución
    if (snap.progreso < 50 && snap.estado.valor === 'activo') {
        insights.push({
            tipo: 'ejecucion',
            titulo: 'Ejecución por debajo del ritmo esperado',
            descripcion: `Solo ${snap.progreso}% ejecutado con ${((snap.fechaFin.getTime() - Date.now()) / (1000 * 60 * 60 * 24)).toFixed(0)} días restantes.`,
            prioridad: 'alta'
        })
    }

    return insights.slice(0, 5)
}
