/**
 * ⚙️ SILEXAR PULSE - Motor de Reglas de Negocio
 * 
 * @description Rule Engine que evalúa políticas contra contextos
 * Implementa el patrón Strategy para diferentes tipos de evaluación
 */

import { PoliticaNegocio } from '../domain/entities/PoliticaNegocio';
import type { AccionAutomaticaProps } from '../domain/entities/PoliticaNegocio';

export interface ResultadoEvaluacion {
    politicaId: string;
    politicaNombre: string;
    categoria: string;
    prioridad: string;
    cumplo: boolean;
    accionesTriggerdas: Array<{
        tipo: string;
        destino?: string;
        parametros: Record<string, unknown>;
    }>;
    timestamp: Date;
}

export interface ContextoEvaluacion {
    tenantId: string;
    usuarioId?: string;
    tipoEntidad?: string;
    entidadId?: string;
    datos: Record<string, unknown>;
}

export class RuleEngine {
    private politicas: Map<string, { politica: PoliticaNegocio; snapshot: ReturnType<PoliticaNegocio['toSnapshot']> }> = new Map();
    private historialEvaluaciones: Map<string, ResultadoEvaluacion[]> = new Map();

    /**
     * Carga políticas activas en el motor
     */
    cargarPoliticas(politicas: PoliticaNegocio[]): void {
        this.politicas.clear();
        for (const politica of politicas) {
            if (politica.estaVigente()) {
                this.politicas.set(politica.id, {
                    politica,
                    snapshot: politica.toSnapshot()
                });
            }
        }
        console.log(`[RuleEngine] Cargadas ${this.politicas.size} políticas activas`);
    }

    /**
     * Agrega una política individual al motor
     */
    agregarPolitica(politica: PoliticaNegocio): void {
        if (politica.estaVigente()) {
            this.politicas.set(politica.id, {
                politica,
                snapshot: politica.toSnapshot()
            });
        }
    }

    /**
     * Elimina una política del motor
     */
    eliminarPolitica(politicaId: string): void {
        this.politicas.delete(politicaId);
    }

    /**
     * Evalúa todas las políticas aplicables a un contexto
     */
    evaluar(contexto: ContextoEvaluacion): ResultadoEvaluacion[] {
        const resultados: ResultadoEvaluacion[] = [];

        for (const [id, { politica, snapshot }] of this.politicas) {
            if (snapshot.tenantId !== contexto.tenantId) continue;

            const cumplo = politica.evaluarCondiciones(contexto.datos);
            const accionesTriggerdas = cumplo
                ? snapshot.acciones.map((a: AccionAutomaticaProps) => ({
                    tipo: a.tipo,
                    destino: a.destino,
                    parametros: {
                        ...a.parametros,
                        politicaId: id,
                        politicaNombre: snapshot.nombre
                    }
                }))
                : [];

            const resultado: ResultadoEvaluacion = {
                politicaId: id,
                politicaNombre: snapshot.nombre,
                categoria: snapshot.categoria,
                prioridad: snapshot.prioridad,
                cumplo,
                accionesTriggerdas,
                timestamp: new Date()
            };

            resultados.push(resultado);

            // Guardar en historial
            this.guardarHistorial(contexto.tenantId, resultado);
        }

        return resultados;
    }

    /**
     * Evalúa y retorna solo las políticas que aplican (cumplo = true)
     */
    evaluarYAplicar(contexto: ContextoEvaluacion): ResultadoEvaluacion[] {
        return this.evaluar(contexto).filter(r => r.cumplo);
    }

    /**
     * Evalúa una política específica
     */
    evaluarPolitica(politicaId: string, contexto: ContextoEvaluacion): ResultadoEvaluacion | null {
        const entry = this.politicas.get(politicaId);
        if (!entry) return null;

        const { politica, snapshot } = entry;
        const cumplo = politica.evaluarCondiciones(contexto.datos);

        return {
            politicaId: politicaId,
            politicaNombre: snapshot.nombre,
            categoria: snapshot.categoria,
            prioridad: snapshot.prioridad,
            cumplo,
            accionesTriggerdas: cumplo ? snapshot.acciones.map((a: AccionAutomaticaProps) => ({
                tipo: a.tipo,
                destino: a.destino,
                parametros: a.parametros || {}
            })) : [],
            timestamp: new Date()
        };
    }

    /**
     * Simula la evaluación de una política con datos de prueba
     */
    simular(politica: PoliticaNegocio, datosPrueba: Record<string, unknown>): boolean {
        return politica.evaluarCondiciones(datosPrueba);
    }

    /**
     * Obtiene métricas de evaluación
     */
    getMetricas(): {
        totalPoliticas: number;
        politicasPorCategoria: Record<string, number>;
        politicasPorPrioridad: Record<string, number>;
        evaluacionesTotales: number;
    } {
        const politicasPorCategoria: Record<string, number> = {};
        const politicasPorPrioridad: Record<string, number> = {};

        for (const { snapshot } of this.politicas.values()) {
            const cat = snapshot.categoria;
            const pri = snapshot.prioridad;
            politicasPorCategoria[cat] = (politicasPorCategoria[cat] || 0) + 1;
            politicasPorPrioridad[pri] = (politicasPorPrioridad[pri] || 0) + 1;
        }

        const evaluacionesTotales = Array.from(this.historialEvaluaciones.values())
            .reduce((sum, arr) => sum + arr.length, 0);

        return {
            totalPoliticas: this.politicas.size,
            politicasPorCategoria,
            politicasPorPrioridad,
            evaluacionesTotales
        };
    }

    /**
     * Obtiene historial de evaluaciones para un tenant
     */
    getHistorial(tenantId: string, limite = 100): ResultadoEvaluacion[] {
        const historial = this.historialEvaluaciones.get(tenantId) || [];
        return historial.slice(-limite);
    }

    private guardarHistorial(tenantId: string, resultado: ResultadoEvaluacion): void {
        if (!this.historialEvaluaciones.has(tenantId)) {
            this.historialEvaluaciones.set(tenantId, []);
        }
        const historial = this.historialEvaluaciones.get(tenantId)!;
        historial.push(resultado);

        // Mantener solo últimos 1000 registros
        if (historial.length > 1000) {
            historial.shift();
        }
    }
}

// Singleton instance
export const ruleEngine = new RuleEngine();