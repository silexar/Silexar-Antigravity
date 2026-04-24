/**
 * 📋 SERVICE: Generación Automática de Órdenes de Pauta
 * 
 * Genera órdenes de pauta automáticamente al aprobar un contrato.
 * Envía las órdenes a Traffic/Programación (WideOrbit, Sara, Dalet).
 * 
 * Especificación: "Generación automática de órdenes de pauta al aprobar"
 * 
 * @tier TIER_0_ENTERPRISE
 * @module contratos
 */

'use server';

import { logger } from '@/lib/observability';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface LineaOrdenPauta {
    id: string;
    ordenPautaId: string;
    lineaContratoId: string;
    medioId: string;
    medioNombre: string;
    productoId: string;
    productoNombre: string;
    horarioInicio: string;
    horarioFin: string;
    fechaInicio: string;
    fechaFin: string;
    cantidadSpots: number;
    tarifaUnitaria: number;
    subtotal: number;
    estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
}

export interface OrdenPauta {
    id: string;
    contratoId: string;
    contratoNumero: string;
    anuncianteId: string;
    anuncianteNombre: string;
    campanaId?: string;
    campanaNombre?: string;
    tipo: 'automatica' | 'manual';
    estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
    lineas: LineaOrdenPauta[];
    observaciones?: string;
    creadoEn: string;
    actualizadoEn: string;
    creadoPorId: string;
}

export interface GenerarOrdenPautaInput {
    contratoId: string;
    contratoNumero: string;
    anuncianteId: string;
    anuncianteNombre: string;
    campanaId?: string;
    campanaNombre?: string;
    lineasContrato: Array<{
        id: string;
        medioId: string;
        medioNombre: string;
        productoId: string;
        productoNombre: string;
        horarioInicio: string;
        horarioFin: string;
        fechaInicio: string;
        fechaFin: string;
        cantidadSpots: number;
        tarifaUnitaria: number;
    }>;
    observaciones?: string;
    userId: string;
}

export interface OrdenPautaResult {
    success: boolean;
    ordenPauta?: OrdenPauta;
    ordenesEnviadas?: string[];
    errores: string[];
    advertencias: string[];
}

// ═══════════════════════════════════════════════════════════════
// STORAGE (en producción usar DB)
// ═══════════════════════════════════════════════════════════════

const ordenesStore = new Map<string, OrdenPauta>();

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

async function enviarAWideOrbit(orden: OrdenPauta): Promise<void> {
    // STUB: En producción, usar WideOrbitService real
    // await wideOrbitService.createOrdenPauta(orden);
    logger.info('[OrdenPauta→WideOrbit] Enviando orden', { ordenId: orden.id });
    await new Promise(resolve => setTimeout(resolve, 100));
}

async function enviarASara(orden: OrdenPauta): Promise<void> {
    // STUB: Implementar SaraIntegrationService real
    logger.info('[OrdenPauta→Sara] Enviando orden', { ordenId: orden.id });
    await new Promise(resolve => setTimeout(resolve, 50));
}

async function enviarADalet(orden: OrdenPauta): Promise<void> {
    // STUB: Implementar DaletIntegrationService real
    logger.info('[OrdenPauta→Dalet] Enviando orden', { ordenId: orden.id });
    await new Promise(resolve => setTimeout(resolve, 50));
}

async function enviarASistemas(orden: OrdenPauta): Promise<string[]> {
    const sistemasEnviados: string[] = [];

    try { await enviarAWideOrbit(orden); sistemasEnviados.push('wideorbit'); }
    catch { logger.warn('[OrdenPauta] Error enviando a WideOrbit', { ordenId: orden.id }); }

    try { await enviarASara(orden); sistemasEnviados.push('sara'); }
    catch { logger.warn('[OrdenPauta] Error enviando a Sara', { ordenId: orden.id }); }

    try { await enviarADalet(orden); sistemasEnviados.push('dalet'); }
    catch { logger.warn('[OrdenPauta] Error enviando a Dalet', { ordenId: orden.id }); }

    return sistemasEnviados;
}

// ═══════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════

export const OrdenPautaService = {
    /**
     * Genera una orden de pauta a partir de un contrato aprobado
     */
    async generarOrden(input: GenerarOrdenPautaInput): Promise<OrdenPautaResult> {
        logger.info('[OrdenPauta] Generando orden de pauta', {
            contratoId: input.contratoId,
            numeroLineas: input.lineasContrato.length
        });

        const result: OrdenPautaResult = { success: false, errores: [], advertencias: [] };

        try {
            const ordenId = `OP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

            const lineas: LineaOrdenPauta[] = input.lineasContrato.map((linea, idx) => ({
                id: `OPL-${ordenId}-${idx + 1}`,
                ordenPautaId: ordenId,
                lineaContratoId: linea.id,
                medioId: linea.medioId,
                medioNombre: linea.medioNombre,
                productoId: linea.productoId,
                productoNombre: linea.productoNombre,
                horarioInicio: linea.horarioInicio,
                horarioFin: linea.horarioFin,
                fechaInicio: linea.fechaInicio,
                fechaFin: linea.fechaFin,
                cantidadSpots: linea.cantidadSpots,
                tarifaUnitaria: linea.tarifaUnitaria,
                subtotal: linea.cantidadSpots * linea.tarifaUnitaria,
                estado: 'pendiente'
            }));

            const ordenPauta: OrdenPauta = {
                id: ordenId,
                contratoId: input.contratoId,
                contratoNumero: input.contratoNumero,
                anuncianteId: input.anuncianteId,
                anuncianteNombre: input.anuncianteNombre,
                campanaId: input.campanaId,
                campanaNombre: input.campanaNombre,
                tipo: 'automatica',
                estado: 'pendiente',
                lineas,
                observaciones: input.observaciones,
                creadoEn: new Date().toISOString(),
                actualizadoEn: new Date().toISOString(),
                creadoPorId: input.userId
            };

            ordenesStore.set(ordenId, ordenPauta);

            const ordenesEnviadas = await enviarASistemas(ordenPauta);
            result.ordenesEnviadas = ordenesEnviadas;

            if (ordenesEnviadas.length > 0) {
                ordenPauta.estado = 'en_proceso';
                ordenesStore.set(ordenId, ordenPauta);
            }

            result.success = true;
            result.ordenPauta = ordenPauta;

            logger.info('[OrdenPauta] Orden generada', { ordenId, sistemasEnviados: ordenesEnviadas });
            return result;

        } catch (error) {
            logger.error('[OrdenPauta] Error', { error: error instanceof Error ? error.message : 'Unknown' });
            result.errores.push('Error al generar orden de pauta');
            return result;
        }
    },

    async obtenerOrden(ordenId: string): Promise<OrdenPauta | null> {
        return ordenesStore.get(ordenId) || null;
    },

    async obtenerOrdenesPorContrato(contratoId: string): Promise<OrdenPauta[]> {
        const ordenes: OrdenPauta[] = [];
        ordenesStore.forEach(orden => {
            if (orden.contratoId === contratoId) ordenes.push(orden);
        });
        return ordenes;
    },

    async cancelarOrden(ordenId: string, motivo: string): Promise<boolean> {
        const orden = ordenesStore.get(ordenId);
        if (!orden) return false;
        orden.estado = 'cancelada';
        orden.observaciones = orden.observaciones ? `${orden.observaciones}\n[CANCELADA] ${motivo}` : `[CANCELADA] ${motivo}`;
        orden.actualizadoEn = new Date().toISOString();
        ordenesStore.set(ordenId, orden);
        return true;
    },

    async actualizarEstadoLinea(ordenId: string, lineaId: string, estado: LineaOrdenPauta['estado']): Promise<boolean> {
        const orden = ordenesStore.get(ordenId);
        if (!orden) return false;
        const linea = orden.lineas.find(l => l.id === lineaId);
        if (!linea) return false;
        linea.estado = estado;
        orden.actualizadoEn = new Date().toISOString();
        if (orden.lineas.every(l => l.estado === 'completada')) orden.estado = 'completada';
        ordenesStore.set(ordenId, orden);
        return true;
    }
};

export default OrdenPautaService;
