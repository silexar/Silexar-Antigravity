/**
 * 🎵 SERVICE: Validación de Material Creativo (Cuñas)
 * 
 * Valida que el anunciante tenga material creativo (cuñas) aprobado
 * y disponible antes de aprobar un contrato.
 * 
 * Especificación: "Verifica si existen cuñas activas para el anunciante"
 * 
 * @tier TIER_0_ENTERPRISE
 * @module contratos
 */

import { logger } from '@/lib/observability';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface MaterialCreativoValidacion {
    announcerId: string;
    announcerNombre: string;
    campanaId?: string;
    campanaNombre?: string;
    cuñasRequeridas: number;
    cuñasDisponibles: number;
    cuñasDetalle: CuñaDetalle[];
    estado: 'completo' | 'parcial' | 'faltante' | 'sin_campana';
    puedeAprobar: boolean;
    mensajes: string[];
    alertas: string[];
    fechaValidacion: string;
}

interface CuñaDetalle {
    id: string;
    codigo: string;
    tipo: string;
    estado: string;
    titulo: string;
    duracion: number;
    fechaAprobacion?: string;
}

export interface ValidacionMaterialInput {
    announcerId: string;
    campanaId?: string;
    productosContrato: Array<{
        productoId: string;
        productoNombre: string;
        cantidadSpots?: number;
    }>;
}

// ═══════════════════════════════════════════════════════════════
// STORAGE TEMPORAL (en producción usar repository real)
// ═══════════════════════════════════════════════════════════════

// Simulación de cuñas por anunciante (en producción, consultaría BD via ICunaRepository)
const cuñasPorAnunciante = new Map<string, CuñaDetalle[]>();

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

async function obtenerCuñasDelAnunciante(announcerId: string, campanaId?: string): Promise<CuñaDetalle[]> {
    // STUB: En producción, inyectar ICunaRepository y hacer consulta real:
    // const cuñas = await cunaRepository.findMany({ anuncianteId: announcerId, campanaId }, tenantId);

    // Simulación basada en datos almacenados
    const stored = cuñasPorAnunciante.get(announcerId) || [];
    if (stored.length > 0) return stored;

    // Datos de ejemplo para演示 (retornar vacío = sin material)
    return [];
}

// ═══════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════

export const MaterialCreativoValidationService = {
    /**
     * Valida disponibilidad de material creativo para un anunciante
     */
    async validarMaterial(input: ValidacionMaterialInput): Promise<MaterialCreativoValidacion> {
        const { announcerId, campanaId, productosContrato } = input;

        logger.info('[MaterialValidation] Validando material para anunciante', { announcerId, campanaId });

        const result: MaterialCreativoValidacion = {
            announcerId,
            announcerNombre: announcerId,
            campanaId,
            campanaNombre: campanaId,
            cuñasRequeridas: productosContrato.reduce((sum, p) => sum + (p.cantidadSpots || 1), 0),
            cuñasDisponibles: 0,
            cuñasDetalle: [],
            estado: 'sin_campana',
            puedeAprobar: false,
            mensajes: [],
            alertas: [],
            fechaValidacion: new Date().toISOString()
        };

        try {
            const cuñas = await obtenerCuñasDelAnunciante(announcerId, campanaId);
            result.cuñasDetalle = cuñas;
            result.cuñasDisponibles = cuñas.filter(c =>
                c.estado === 'aprobada' || c.estado === 'en_aire'
            ).length;

            if (!campanaId) {
                result.estado = result.cuñasDisponibles > 0 ? 'completo' : 'faltante';
                result.puedeAprobar = result.cuñasDisponibles > 0;

                if (result.cuñasDisponibles === 0) {
                    result.mensajes.push('⚠️ Anunciante no tiene material creativo aprobado');
                    result.alertas.push('Crear al menos 1 cuña antes de ejecutar el contrato');
                } else {
                    result.mensajes.push(`✅ ${result.cuñasDisponibles} cuña(s) disponible(s)`);
                }
            } else {
                const requeridas = result.cuñasRequeridas;
                result.estado = result.cuñasDisponibles >= requeridas ? 'completo' :
                    result.cuñasDisponibles > 0 ? 'parcial' : 'faltante';
                result.puedeAprobar = result.cuñasDisponibles > 0;

                if (result.cuñasDisponibles >= requeridas) {
                    result.mensajes.push(`✅ Material completo: ${result.cuñasDisponibles}/${requeridas} cuñas`);
                } else if (result.cuñasDisponibles > 0) {
                    result.mensajes.push(`⚠️ Material parcial: solo ${result.cuñasDisponibles}/${requeridas} cuñas`);
                    result.alertas.push('Crear cuñas adicionales para completar la campaña');
                } else {
                    result.mensajes.push('❌ Material faltante: ninguna cuña aprobada');
                    result.alertas.push('Crear material creativo antes de iniciar campaña');
                }
            }

            if (cuñas.length > 0) {
                result.mensajes.push(`📋 Cuñas del anunciante: ${cuñas.length} total`);
            }

            return result;

        } catch (error) {
            logger.error('[MaterialValidation] Error validando material', {
                error: error instanceof Error ? error.message : 'Unknown',
                announcerId
            });

            result.mensajes.push('❌ Error al validar material creativo');
            result.alertas.push('Verificar manualmente la disponibilidad de cuñas');
            result.puedeAprobar = true;
            return result;
        }
    },

    /**
     * Registra cuñas para un anunciante (para demo/testing)
     */
    registrarCuñasDemo(announcerId: string, cuñas: CuñaDetalle[]): void {
        cuñasPorAnunciante.set(announcerId, cuñas);
        logger.info('[MaterialValidation] Cuñas demo registradas', { announcerId, count: cuñas.length });
    },

    /**
     * Verifica si un anunciante específico tiene material para un producto
     */
    async tieneMaterialParaProducto(announcerId: string, productoId: string): Promise<boolean> {
        const cuñas = await obtenerCuñasDelAnunciante(announcerId);
        return cuñas.some(c => c.estado === 'aprobada' || c.estado === 'en_aire');
    },

    /**
     * Obtiene resumen de material para dashboard
     */
    async getResumenMaterial(announcerIds: string[]): Promise<Record<string, {
        total: number;
        aprobado: number;
        enAire: number;
        pendiente: number;
    }>> {
        const resumen: Record<string, {
            total: number;
            aprobado: number;
            enAire: number;
            pendiente: number;
        }> = {};

        for (const announcerId of announcerIds) {
            const cuñas = await obtenerCuñasDelAnunciante(announcerId);
            resumen[announcerId] = {
                total: cuñas.length,
                aprobado: cuñas.filter(c => c.estado === 'aprobada').length,
                enAire: cuñas.filter(c => c.estado === 'en_aire').length,
                pendiente: cuñas.filter(c => c.estado === 'borrador' || c.estado === 'revision').length
            };
        }

        return resumen;
    }
};

export default MaterialCreativoValidationService;
