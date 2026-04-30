/**
 * 🌐 SILEXAR PULSE - API Route: Detección de Oportunidades
 * 
 * @description Endpoint para detección automática de oportunidades
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';

export interface Oportunidad {
    oportunidadId: string;
    tipo: 'EXPANSION' | 'NEW_PARTNERSHIP' | 'UPSELL' | 'CROSS_SELL' | 'RENEWAL';
    titulo: string;
    descripcion: string;
    valorPotencial: number;
    probabilidadExito: number;
    agenciaId: string;
    agenciaNombre: string;
    fechaIdentificacion: string;
    fechaExpiracion?: string;
    accionesSugeridas: string[];
    estado: 'DETECTADA' | 'EN_EVALUACION' | 'EN_NEGOCIACION' | 'APROBADA' | 'RECHAZADA';
    metricasRelevantes: {
        scoreActual?: number;
        crecimiento?: number;
        revenueActual?: number;
        tendenciaSatisfaccion?: number;
    };
}

const mockOportunidades: Oportunidad[] = [
    {
        oportunidadId: 'opp-001',
        tipo: 'EXPANSION',
        titulo: 'Expansión a sector Pharma',
        descripcion: 'OMD Chile ha expresado interés en expandir sus servicios al sector farmacéutico. Candidate ideal para nueva especialización.',
        valorPotencial: 850000000,
        probabilidadExito: 0.78,
        agenciaId: 'agm-001',
        agenciaNombre: 'OMD Chile',
        fechaIdentificacion: new Date().toISOString(),
        accionesSugeridas: ['Programar reunión exploratory', 'Preparar caso de éxito en Pharma', 'Conectar con equipo sectorial'],
        estado: 'EN_EVALUACION',
        metricasRelevantes: {
            scoreActual: 847,
            crecimiento: 0.15
        }
    },
    {
        oportunidadId: 'opp-002',
        tipo: 'UPSELL',
        titulo: 'Incremento de inversión en programmatic',
        descripcion: 'Basado en trends de mercado, se detecta oportunidad de incrementarspend en programmatic en 30%.',
        valorPotencial: 320000000,
        probabilidadExito: 0.85,
        agenciaId: 'agm-001',
        agenciaNombre: 'OMD Chile',
        fechaIdentificacion: new Date().toISOString(),
        fechaExpiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        accionesSugeridas: ['Preparar propuesta de expansión', 'Revisar capacidades actuales', 'Definir timeline'],
        estado: 'DETECTADA',
        metricasRelevantes: {
            scoreActual: 847,
            revenueActual: 2500000000
        }
    },
    {
        oportunidadId: 'opp-003',
        tipo: 'CROSS_SELL',
        titulo: 'Cross-sell de servicios de contenido',
        descripcion: 'Detección de oportunidad para ofrecer servicios de content marketing a Havas Media.',
        valorPotencial: 180000000,
        probabilidadExito: 0.65,
        agenciaId: 'agm-002',
        agenciaNombre: 'Havas Media',
        fechaIdentificacion: new Date().toISOString(),
        accionesSugeridas: ['Demo de capacidades contenido', 'Presentar casos de éxito', 'Ofrecer período de prueba'],
        estado: 'DETECTADA',
        metricasRelevantes: {
            scoreActual: 756,
            tendenciaSatisfaccion: -0.03
        }
    },
    {
        oportunidadId: 'opp-004',
        tipo: 'NEW_PARTNERSHIP',
        titulo: 'Nueva agencia digital detectada',
        descripcion: 'Se ha identificado una nueva agencia digital en el mercado con potencial de partnership.',
        valorPotencial: 450000000,
        probabilidadExito: 0.55,
        agenciaId: 'agm-new-001',
        agenciaNombre: 'Digital Edge Chile',
        fechaIdentificacion: new Date().toISOString(),
        accionesSugeridas: ['Investigación de background', 'Solicitar reunión inicial', 'Evaluar fit cultural'],
        estado: 'EN_EVALUACION',
        metricasRelevantes: {}
    },
    {
        oportunidadId: 'opp-005',
        tipo: 'RENEWAL',
        titulo: 'Renovación próximo Q3',
        descripcion: 'Contrato de Havas Media vence en Q3. Opportunity de negociar terms mejores basado en historial.',
        valorPotencial: 220000000,
        probabilidadExito: 0.92,
        agenciaId: 'agm-002',
        agenciaNombre: 'Havas Media',
        fechaIdentificacion: new Date().toISOString(),
        fechaExpiracion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        accionesSugeridas: ['Preparar propuesta de renewal', 'Revisar cumplimiento histórico', 'Programar reunión estratégica'],
        estado: 'EN_NEGOCIACION',
        metricasRelevantes: {
            scoreActual: 756,
            crecimiento: 0.08
        }
    }
];

// GET /api/agencias-medios/[id]/oportunidades - Obtener oportunidades
export const GET = withApiRoute(
    { resource: 'agencias-medios', action: 'read' },
    async ({ ctx, req }) => {
        try {
            const url = new URL(req.url);
            const pathParts = url.pathname.split('/');
            const id = pathParts[pathParts.length - 1] || 'all';
            const tipo = url.searchParams.get('tipo') || 'all';
            const estado = url.searchParams.get('estado');

            let oportunidades = id === 'all'
                ? mockOportunidades
                : mockOportunidades.filter(o => o.agenciaId === id);

            // Filter by tipo
            if (tipo !== 'all') {
                oportunidades = oportunidades.filter(o => o.tipo === tipo);
            }

            // Filter by estado
            if (estado) {
                oportunidades = oportunidades.filter(o => o.estado === estado);
            }

            // Calculate stats
            const stats = {
                total: oportunidades.length,
                valorTotal: oportunidades.reduce((acc, o) => acc + o.valorPotencial, 0),
                promedioProbabilidad: oportunidades.reduce((acc, o) => acc + o.probabilidadExito, 0) / oportunidades.length,
                porTipo: {
                    EXPANSION: oportunidades.filter(o => o.tipo === 'EXPANSION').length,
                    NEW_PARTNERSHIP: oportunidades.filter(o => o.tipo === 'NEW_PARTNERSHIP').length,
                    UPSELL: oportunidades.filter(o => o.tipo === 'UPSELL').length,
                    CROSS_SELL: oportunidades.filter(o => o.tipo === 'CROSS_SELL').length,
                    RENEWAL: oportunidades.filter(o => o.tipo === 'RENEWAL').length
                }
            };

            return apiSuccess({
                oportunidades,
                stats,
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error en Oportunidades API:', error);
            return apiError('INTERNAL_ERROR', 'Error al procesar solicitud', 500);
        }
    }
);

// PUT /api/agencias-medios/[id]/oportunidades - Actualizar oportunidad
export const PUT = withApiRoute(
    { resource: 'agencias-medios', action: 'update' },
    async ({ ctx, req }) => {
        try {
            const body = await req.json();
            const { oportunidadId, accion, datos } = body;

            const oportunidadIndex = mockOportunidades.findIndex(o => o.oportunidadId === oportunidadId);
            if (oportunidadIndex === -1) {
                return apiError('NOT_FOUND', 'Oportunidad no encontrada', 404);
            }

            switch (accion) {
                case 'updateEstado':
                    mockOportunidades[oportunidadIndex].estado = datos.estado;
                    break;
                case 'addAccion':
                    mockOportunidades[oportunidadIndex].accionesSugeridas.push(datos.accion);
                    break;
            }

            return apiSuccess({
                oportunidad: mockOportunidades[oportunidadIndex],
                success: true
            });
        } catch (error) {
            console.error('Error en Oportunidades API:', error);
            return apiError('INTERNAL_ERROR', 'Error al procesar solicitud', 500);
        }
    }
);
