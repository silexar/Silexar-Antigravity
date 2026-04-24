// @ts-nocheck

import { logger } from '@/lib/observability';
import { DrizzleContratoRepository } from '@/modules/contratos/infrastructure/repositories/DrizzleContratoRepository';
import { AprobacionContrato } from '@/modules/contratos/domain/entities/AprobacionContrato';
import { EstadoContrato } from '@/modules/contratos/domain/value-objects/EstadoContrato';

/**
 * MANEJADOR DE FLUJO DE APROBACIONES - TIER 0
 * 
 * @description Orchestrates the multi-level approval workflow for contracts
 * based on value thresholds and risk assessment.
 */

export interface ApprovalRequest {
    contratoId: string;
    solicitanteId: string;
    solicitante: string;
    valorContrato: number;
    riesgoNivel: string;
    tipoContrato: 'A' | 'B' | 'C';
    observaciones?: string;
}

export interface ApprovalResult {
    success: boolean;
    aprobacionId?: string;
    nivelRequerido: string;
    aprobadorAsignado?: string;
    fechaLimite?: Date;
    requiereJustificacion: boolean;
    mensaje: string;
}

export interface ApprovalDecision {
    aprobado: boolean;
    aprobadorId: string;
    aprobador: string;
    nivel: number;
    observaciones?: string;
    justificacion?: string;
}

interface ApprovalLevel {
    nivel: number;
    nombre: string;
    rol: string;
    limiteInferior: number;
    limiteSuperior: number;
    tiempoLimiteHoras: number;
}

const APPROVAL_LEVELS: ApprovalLevel[] = [
    { nivel: 0, nombre: 'automatico', rol: 'system', limiteInferior: 0, limiteSuperior: 10_000_000, tiempoLimiteHoras: 0 },
    { nivel: 1, nombre: 'supervisor', rol: 'supervisor', limiteInferior: 10_000_001, limiteSuperior: 50_000_000, tiempoLimiteHoras: 2 },
    { nivel: 2, nombre: 'gerente_comercial', rol: 'gerente_comercial', limiteInferior: 50_000_001, limiteSuperior: 100_000_000, tiempoLimiteHoras: 4 },
    { nivel: 3, nombre: 'gerente_general', rol: 'gerente_general', limiteInferior: 100_000_001, limiteSuperior: 500_000_000, tiempoLimiteHoras: 24 },
    { nivel: 4, nombre: 'directorio', rol: 'admin', limiteInferior: 500_000_001, limiteSuperior: Number.MAX_SAFE_INTEGER, tiempoLimiteHoras: 48 }
];

class AprobacionWorkflowHandlerImpl {
    private repo(tenantId: string): DrizzleContratoRepository {
        return new DrizzleContratoRepository(tenantId);
    }

    /**
     * Solicitar aprobación para un contrato
     */
    async solicitarAprobacion(request: ApprovalRequest, tenantId: string): Promise<ApprovalResult> {
        logger.info('Solicitando aprobación:', { contratoId: request.contratoId, valor: request.valorContrato });

        try {
            const nivelRequerido = this.determinarNivelAprobacion(request.valorContrato, request.riesgoNivel);

            if (nivelRequerido.nombre === 'automatico') {
                return {
                    success: true,
                    nivelRequerido: 'automatico',
                    requiereJustificacion: false,
                    mensaje: 'Contrato aprobado automáticamente por bajo valor y riesgo'
                };
            }

            const aprobador = this.asignarAprobador(nivelRequerido, tenantId);
            const justificacionRequerida = request.valorContrato > 50_000_000;

            const aprobacion = AprobacionContrato.create({
                contratoId: request.contratoId,
                nivel: nivelRequerido.nivel,
                aprobadorId: aprobador.id,
                aprobador: aprobador.nombre,
                rol: nivelRequerido.rol,
                valorContrato: request.valorContrato,
                requiereJustificacion: justificacionRequerida,
                factoresEscalamiento: this.calcularFactoresEscalamiento(request)
            });

            const repo = this.repo(tenantId);
            const contrato = await repo.findById(request.contratoId);

            if (!contrato) {
                return { success: false, mensaje: 'Contrato no encontrado' };
            }

            contrato.agregarAlerta(`Solicitud de aprobación enviada a ${aprobador.nombre}`);
            await repo.save(contrato);

            logger.info('Aprobación solicitada:', { aprobacionId: aprobacion.id, nivel: nivelRequerido.nombre });

            return {
                success: true,
                aprobacionId: aprobacion.id,
                nivelRequerido: nivelRequerido.nombre,
                aprobadorAsignado: aprobador.nombre,
                fechaLimite: aprobacion.fechaLimite,
                requiereJustificacion: justificacionRequerida,
                mensaje: `Aprobación enviada a ${aprobador.nombre} (${nivelRequerido.nombre})`
            };

        } catch (error) {
            logger.error('Error en solicitarAprobacion:', error instanceof Error ? error : undefined);
            return { success: false, nivelRequerido: 'error', requiereJustificacion: false, mensaje: 'Error interno' };
        }
    }

    /**
     * Procesar decisión de aprobación
     */
    async procesarDecision(decision: ApprovalDecision, aprobacionId: string, tenantId: string): Promise<{
        success: boolean;
        contratoActualizado: boolean;
        proximoNivel?: string;
        mensaje: string;
    }> {
        logger.info('Procesando decisión de aprobación:', { aprobacionId, aprobado: decision.aprobado });

        try {
            const repo = this.repo(tenantId);
            const contrato = await repo.findById(decision.aprobado ? this.getContratoIdFromAprobacion(aprobacionId) : '');

            if (!contrato) {
                return { success: false, contratoActualizado: false, mensaje: 'Contrato no encontrado' };
            }

            const snap = contrato.toSnapshot();

            if (decision.aprobado) {
                const siguienteNivel = this.obtenerSiguienteNivel(snap.totales.valorNeto);

                if (siguienteNivel) {
                    contrato.agregarAlerta(`Aprobación nivel ${decision.nivel} completada. Esperando ${siguienteNivel.nombre}`);
                    return {
                        success: true,
                        contratoActualizado: true,
                        proximoNivel: siguienteNivel.nombre,
                        mensaje: `Aprobación completada. Enviando a siguiente nivel: ${siguienteNivel.nombre}`
                    };
                } else {
                    contrato.actualizarEstado(EstadoContrato.firmado(), decision.aprobadorId);
                    contrato.agregarAlerta(`Contrato aprobado y listo para firma`);
                    return {
                        success: true,
                        contratoActualizado: true,
                        mensaje: 'Contrato fully approved and ready for signing'
                    };
                }
            } else {
                contrato.agregarAlerta(`Rechazado por ${decision.aprobador}: ${decision.observaciones}`);
                return {
                    success: true,
                    contratoActualizado: true,
                    mensaje: `Contrato rechazado: ${decision.observaciones}`
                };
            }

        } catch (error) {
            logger.error('Error en procesarDecision:', error instanceof Error ? error : undefined);
            return { success: false, contratoActualizado: false, mensaje: 'Error interno' };
        }
    }

    /**
     * Escalar aprobación por timeout
     */
    async escalarPorTimeout(aprobacionId: string, tenantId: string): Promise<{
        success: boolean;
        nuevoNivel?: string;
        mensaje: string;
    }> {
        logger.info('Escalando aprobación por timeout:', { aprobacionId });

        try {
            const nivelActual = this.obtenerNivelPorAprobacionId(aprobacionId);
            const siguienteNivel = APPROVAL_LEVELS.find(l => l.nivel === nivelActual + 1);

            if (!siguienteNivel) {
                return { success: false, mensaje: 'No hay siguiente nivel para escalar' };
            }

            const repo = this.repo(tenantId);
            const contrato = await repo.findById(this.getContratoIdFromAprobacion(aprobacionId));

            if (contrato) {
                contrato.agregarAlerta(`Escalado a ${siguienteNivel.nombre} por timeout`);
                await repo.save(contrato);
            }

            return {
                success: true,
                nuevoNivel: siguienteNivel.nombre,
                mensaje: `Escalado a ${siguienteNivel.nombre}`
            };

        } catch (error) {
            logger.error('Error en escalarPorTimeout:', error instanceof Error ? error : undefined);
            return { success: false, mensaje: 'Error interno' };
        }
    }

    /**
     * Obtener estado de aprobaciones pendientes para un contrato
     */
    async obtenerEstadoAprobaciones(contratoId: string, tenantId: string): Promise<{
        tienePendientes: boolean;
        total: number;
        pendientes: number;
        urgentes: number;
        siguienteAccion?: string;
    }> {
        try {
            const repo = this.repo(tenantId);
            const contrato = await repo.findById(contratoId);

            if (!contrato) {
                return { tienePendientes: false, total: 0, pendientes: 0, urgentes: 0 };
            }

            const snap = contrato.toSnapshot();
            const estado = snap.estado.valor;

            if (estado === 'aprobacion' || estado === 'revision') {
                return {
                    tienePendientes: true,
                    total: 1,
                    pendientes: 1,
                    urgentes: this.calcularUrgencia(snap.fechaLimiteAccion),
                    siguienteAccion: 'Esperando aprobación de supervisor'
                };
            }

            return { tienePendientes: false, total: 0, pendientes: 0, urgentes: 0 };

        } catch (error) {
            logger.error('Error en obtenerEstadoAprobaciones:', error instanceof Error ? error : undefined);
            return { tienePendientes: false, total: 0, pendientes: 0, urgentes: 0 };
        }
    }

    private determinarNivelAprobacion(valorNeto: number, riesgoNivel: string): ApprovalLevel {
        let nivel = APPROVAL_LEVELS.find(l => valorNeto >= l.limiteInferior && valorNeto <= l.limiteSuperior);

        if (!nivel) {
            nivel = APPROVAL_LEVELS[APPROVAL_LEVELS.length - 1];
        }

        if (riesgoNivel === 'alto' && nivel.nivel > 0) {
            const nivelAjustado = Math.min(nivel.nivel + 1, APPROVAL_LEVELS.length - 1);
            nivel = APPROVAL_LEVELS.find(l => l.nivel === nivelAjustado) || nivel;
        }

        return nivel;
    }

    private asignarAprobador(nivel: ApprovalLevel, tenantId: string): { id: string; nombre: string } {
        const aprobadoresPorNivel: Record<string, { id: string; nombre: string }[]> = {
            supervisor: [
                { id: 'sup_001', nombre: 'María González' },
                { id: 'sup_002', nombre: 'Carlos Rodríguez' }
            ],
            gerente_comercial: [
                { id: 'gc_001', nombre: 'Ana Martínez' },
                { id: 'gc_002', nombre: 'Luis Hernández' }
            ],
            gerente_general: [
                { id: 'gg_001', nombre: 'Carmen López' }
            ],
            directorio: [
                { id: 'dir_001', nombre: 'Roberto Sánchez' }
            ]
        };

        const aprobadores = nivel.nombre === 'automatico'
            ? [{ id: 'system', nombre: 'Sistema' }]
            : (aprobadoresPorNivel[nivel.nombre] || [{ id: 'admin', nombre: 'Administrador' }]);

        return aprobadores[0];
    }

    private calcularFactoresEscalamiento(request: ApprovalRequest): string[] {
        const factores: string[] = [];

        if (request.valorContrato > 100_000_000) {
            factores.push('alto_valor');
        }

        if (request.riesgoNivel === 'alto') {
            factores.push('riesgo_alto');
        }

        if (request.tipoContrato === 'C') {
            factores.push('tipo_contrato_c');
        }

        return factores;
    }

    private obtenerSiguienteNivel(valorNeto: number): ApprovalLevel | null {
        const nivelActual = this.determinarNivelAprobacion(valorNeto, 'medio');
        const siguienteNivel = APPROVAL_LEVELS.find(l => l.nivel === nivelActual.nivel + 1);
        return siguienteNivel?.nombre === 'automatico' ? null : siguienteNivel || null;
    }

    private calcularUrgencia(fechaLimite?: Date): number {
        if (!fechaLimite) return 0;

        const ahora = new Date();
        const horasRestantes = (fechaLimite.getTime() - ahora.getTime()) / (1000 * 60 * 60);

        if (horasRestantes <= 1) return 1;
        if (horasRestantes <= 4) return 1;
        return 0;
    }

    private getContratoIdFromAprobacion(aprobacionId: string): string {
        return aprobacionId.split('_')[1] || '';
    }

    private obtenerNivelPorAprobacionId(aprobacionId: string): number {
        return 1;
    }
}

export const AprobacionWorkflowHandler = new AprobacionWorkflowHandlerImpl();
export default AprobacionWorkflowHandler;