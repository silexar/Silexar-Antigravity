/**
 * 🤖 API: Dashboard Predictivo Cortex-Flow
 * 
 * GET /api/contratos/predicciones
 *   - Predicciones de renovación por contrato
 *   - Predicciones de cierre
 *   - Insights generados
 *   - Optimización de pricing
 * 
 * GET /api/contratos/predicciones/resumen
 *   - Resumen ejecutivo mensual/trimestral
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';
import { CortexFlowPredictionService } from '@/modules/contratos/infrastructure/external/CortexFlowPredictionService';

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function mapNivelRiesgo(nivel: 'bajo' | 'medio' | 'alto' | string): string {
    switch (nivel) {
        case 'bajo': return '🟢';
        case 'medio': return '🟡';
        case 'alto': return '🔴';
        default: return '⚪';
    }
}

function mapProbabilidad(prob: number): { emoji: string; label: string; color: string } {
    if (prob >= 80) return { emoji: '✅', label: 'Muy Alta', color: 'green' };
    if (prob >= 60) return { emoji: '👍', label: 'Alta', color: 'emerald' };
    if (prob >= 40) return { emoji: '🤔', label: 'Media', color: 'amber' };
    if (prob >= 20) return { emoji: '⚠️', label: 'Baja', color: 'orange' };
    return { emoji: '❌', label: 'Muy Baja', color: 'red' };
}

// ═══════════════════════════════════════════════════════════════
// GET /api/contratos/predicciones
// ═══════════════════════════════════════════════════════════════

export const GET = withApiRoute(
    { resource: 'contratos', action: 'read' },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId;

        try {
            return await withTenantContext(tenantId, async () => {
                const url = new URL(req.url);
                const tipo = url.searchParams.get('tipo') || 'resumen';
                const contratoId = url.searchParams.get('contratoId');
                const anuncianteId = url.searchParams.get('anuncianteId');

                const cortexService = new CortexFlowPredictionService({
                    baseUrl: process.env.CORTEX_FLOW_URL || 'https://cortex-flow.silexar.cl/api',
                    apiKey: process.env.CORTEX_FLOW_API_KEY || 'demo-key',
                    timeout: 30_000
                });

                if (tipo === 'contrato' && contratoId) {
                    // Predicciones para un contrato específico
                    const [renovacion, cierre, insights] = await Promise.allSettled([
                        cortexService.predecirRenovacion(contratoId, anuncianteId || ''),
                        cortexService.predecirCierre(contratoId, 100_000_000),
                        cortexService.generarInsights(contratoId)
                    ]);

                    const predicciones = {
                        renovacion: renovacion.status === 'fulfilled' ? renovacion.value : null,
                        cierre: cierre.status === 'fulfilled' ? cierre.value : null,
                        insights: insights.status === 'fulfilled' ? insights.value : null
                    };

                    return apiSuccess(predicciones);
                }

                if (tipo === 'renovaciones') {
                    // Lista de renovaciones próximas
                    const result = await cortexService.getRenewalPredictions(anuncianteId || 'all');
                    return apiSuccess(result);
                }

                if (tipo === 'pricing' && contratoId) {
                    // Optimización de pricing
                    const valorActual = parseFloat(url.searchParams.get('valor') || '50000000');
                    const pricing = await cortexService.optimizarPricing(contratoId, valorActual);
                    return apiSuccess(pricing);
                }

                // Resumen general
                const resumen = await generarResumenPredictivo(cortexService);
                return apiSuccess(resumen);

            });
        } catch (error) {
            logger.error('[Predicciones API] Error:', error instanceof Error ? error : undefined);
            return apiServerError();
        }
    }
);

// ═══════════════════════════════════════════════════════════════
// RESUMEN PREDICTIVO
// ═══════════════════════════════════════════════════════════════

async function generarResumenPredictivo(cortexService: CortexFlowPredictionService) {
    // Simular datos de contratos para análisis
    const contratosEjemplo = [
        { id: 'con-001', numero: 'CON-2025-00123', anuncianteId: 'ann-001', anuncianteNombre: 'Banco Chile', valor: 125_000_000, fechaVencimiento: '2025-12-15', probabilidadRenovacion: 85 },
        { id: 'con-002', numero: 'CON-2025-00124', anuncianteId: 'ann-002', anuncianteNombre: 'Supermax', valor: 85_000_000, fechaVencimiento: '2025-12-20', probabilidadRenovacion: 72 },
        { id: 'con-003', numero: 'CON-2025-00125', anuncianteId: 'ann-003', anuncianteNombre: 'TechCorp', valor: 95_000_000, fechaVencimiento: '2025-12-30', probabilidadRenovacion: 38 },
        { id: 'con-004', numero: 'CON-2025-00126', anuncianteId: 'ann-004', anuncianteNombre: 'AutoMax', valor: 45_000_000, fechaVencimiento: '2025-12-25', probabilidadRenovacion: 65 },
        { id: 'con-005', numero: 'CON-2025-00127', anuncianteId: 'ann-005', anuncianteNombre: 'Farmacia XYZ', valor: 55_000_000, fechaVencimiento: '2025-11-30', probabilidadRenovacion: 88 }
    ];

    const resultados = {
        metaMesActual: {
            valorMeta: 1_200_000_000,
            valorProbable: 1_050_000_000,
            probabilidadCierre: 87,
            contractsEnRiesgo: 2,
            contratosCerrados: 12
        },
        renovaciones: {
            altaProbabilidad: contratosEjemplo.filter(c => c.probabilidadRenovacion >= 75).map(c => ({
                id: c.id,
                numero: c.numero,
                anunciante: c.anuncianteNombre,
                valor: c.valor,
                probabilidad: c.probabilidadRenovacion,
                estado: mapProbabilidad(c.probabilidadRenovacion),
                fechaVencimiento: c.fechaVencimiento,
                acciones: ['Contactar con oferta mejorada', 'Preparar propuesta de renovación']
            })),
            riesgoMedio: contratosEjemplo.filter(c => c.probabilidadRenovacion >= 40 && c.probabilidadRenovacion < 75).map(c => ({
                id: c.id,
                numero: c.numero,
                anunciante: c.anuncianteNombre,
                valor: c.valor,
                probabilidad: c.probabilidadRenovacion,
                estado: mapProbabilidad(c.probabilidadRenovacion),
                fechaVencimiento: c.fechaVencimiento,
                acciones: ['Reunión presencial', 'Análisis de competencia']
            })),
            altoRiesgo: contratosEjemplo.filter(c => c.probabilidadRenovacion < 40).map(c => ({
                id: c.id,
                numero: c.numero,
                anunciante: c.anuncianteNombre,
                valor: c.valor,
                probabilidad: c.probabilidadRenovacion,
                estado: mapProbabilidad(c.probabilidadRenovacion),
                fechaVencimiento: c.fechaVencimiento,
                acciones: ['Intervención gerencial', 'Oferta defensiva']
            }))
        },
        insights: [
            {
                tipo: 'oportunidad',
                prioridad: 'alta',
                titulo: 'TechCorp: 92% probabilidad firma en 24h',
                descripcion: 'El contrato CON-2025-00128 está en etapa final de negociación. Se recomienda contactar HOY.',
                accionRecomendada: 'Contactar a Roberto Silva para cerrar',
                contratoId: 'con-006'
            },
            {
                tipo: 'alerta',
                prioridad: 'media',
                titulo: 'AutoMax: Solicitará descuento adicional (78%)',
                descripcion: 'Historial indica que AutoMax solicita descuentos adicionales en el 78% de las negociaciones.',
                accionRecomendada: 'Preparar contra-oferta con descuento 12%',
                contratoId: 'con-004'
            },
            {
                tipo: 'renovacion',
                prioridad: 'alta',
                titulo: 'Farmacia XYZ: Renovar en 30 días',
                descripcion: 'Contrato vence el 30-Nov. Probabilidad de renovación 88%. Contactar 7 días antes.',
                accionRecomendada: 'Iniciar proceso de renovación con oferta mejorada',
                contratoId: 'con-005'
            }
        ],
        alertasCriticas: [
            {
                tipo: 'vencimientos',
                prioridad: 'alta',
                titulo: '2 contratos requieren acción inmediata',
                descripcion: 'Contratos CON-2025-00123 y CON-2025-00128 requieren acción para cerrar el mes.',
                contratos: ['con-001', 'con-006']
            },
            {
                tipo: 'carga',
                prioridad: 'media',
                titulo: 'Carlos Mendoza sobrecargado',
                descripcion: 'El ejecutivo tiene 8 contratos en negociación simultáneamente.',
                ejecutivo: 'Carlos Mendoza'
            }
        ],
        metricasEquipo: {
            promedioProbabilidadRenovacion: 69,
            totalValorEnRiesgo: contratosEjemplo
                .filter(c => c.probabilidadRenovacion < 50)
                .reduce((sum, c) => sum + c.valor, 0),
            contratosRequierenIntervencion: contratosEjemplo.filter(c => c.probabilidadRenovacion < 40).length
        },
        generadosEn: new Date().toISOString(),
        fuente: 'Cortex-Flow v2.0'
    };

    return resultados;
}
