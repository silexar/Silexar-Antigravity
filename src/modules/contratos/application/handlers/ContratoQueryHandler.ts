import { logger } from '@/lib/observability';
import { DrizzleContratoRepository } from '@/modules/contratos/infrastructure/repositories/DrizzleContratoRepository';
/**
 * SILEXAR PULSE - TIER0+ CONTRATO QUERY HANDLER
 * Handler de Consultas de Contratos con implementacion real usando DrizzleContratoRepository
 */

export interface ContratoQuery {
    readonly tipo: 'POR_ID' | 'LISTADO' | 'BUSQUEDA' | 'PIPELINE' | 'METRICAS';
    readonly id?: string;
    readonly filtros?: Record<string, unknown>;
}

export interface ContratoQueryResult<T> {
    readonly success: boolean;
    readonly data?: T;
    readonly error?: string;
}

interface PipelineFilters {
    estados?: string[];
    vendedorId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
}

interface MetricFilters {
    vendedorId: string;
    fechaDesde: string;
    fechaHasta: string;
}

class ContratoQueryHandlerImpl {
    private repo(tenantId: string): DrizzleContratoRepository {
        return new DrizzleContratoRepository(tenantId);
    }

    async ejecutar(query: ContratoQuery, tenantId: string): Promise<ContratoQueryResult<unknown>> {
        logger.info('Ejecutando query:', { tipo: query.tipo });

        switch (query.tipo) {
            case 'POR_ID':
                return this.obtenerPorId(query.id!, tenantId);
            case 'LISTADO':
                return this.listar(tenantId, query.filtros);
            case 'BUSQUEDA':
                return this.buscar(query.filtros?.busquedaTexto as string || '', tenantId);
            case 'PIPELINE':
                return this.obtenerPipeline(query.filtros as PipelineFilters, tenantId);
            case 'METRICAS':
                return this.obtenerMetricas(query.filtros as unknown as MetricFilters, tenantId);
            default:
                return { success: false, error: 'Tipo de query no soportado' };
        }
    }

    async obtenerPorId(id: string, tenantId: string): Promise<ContratoQueryResult<unknown>> {
        try {
            const repo = this.repo(tenantId);
            const contrato = await repo.findById(id);

            if (!contrato) {
                return { success: false, error: 'Contrato no encontrado' };
            }

            const snap = contrato.toSnapshot();
            return {
                success: true,
                data: {
                    id: snap.id,
                    numero: snap.numero.valor,
                    titulo: snap.producto,
                    clienteNombre: snap.anunciante,
                    rutAnunciante: snap.rutAnunciante,
                    tipoContrato: snap.tipoContrato,
                    medio: snap.medio,
                    fechaInicio: snap.fechaInicio,
                    fechaFin: snap.fechaFin,
                    valorTotalBruto: snap.totales.valorBruto,
                    valorTotalNeto: snap.totales.valorNeto,
                    descuentoPorcentaje: snap.totales.descuentoPorcentaje,
                    moneda: snap.moneda,
                    estado: snap.estado.valor,
                    porcentajeEjecutado: snap.progreso,
                    fechaCreacion: snap.fechaCreacion,
                    etapaActual: snap.etapaActual,
                    proximaAccion: snap.proximaAccion,
                    riesgo: snap.riesgoCredito,
                    metricas: snap.metricas,
                }
            };
        } catch (error) {
            logger.error('Error en obtenerPorId:', error instanceof Error ? error : undefined);
            return { success: false, error: 'Error al obtener contrato' };
        }
    }

    async listar(tenantId: string, filtros?: Record<string, unknown>): Promise<ContratoQueryResult<unknown[]>> {
        try {
            const repo = this.repo(tenantId);
            const cr = {
                busquedaTexto: (filtros?.busquedaTexto as string) || '',
                estados: filtros?.estados as string[] | undefined,
                anuncianteId: filtros?.anuncianteId as string | undefined,
                pagina: (filtros?.pagina as number) || 1,
                tamanoPagina: Math.min((filtros?.tamanoPagina as number) || 20, 100),
            };

            const data = await repo.search(cr);
            const contratos = data.contratos.map(c => {
                const snap = c.toSnapshot();
                return {
                    id: snap.id,
                    numeroContrato: snap.numero.valor,
                    titulo: snap.producto,
                    clienteNombre: snap.anunciante,
                    tipoContrato: snap.tipoContrato,
                    medio: snap.medio,
                    fechaInicio: snap.fechaInicio,
                    fechaFin: snap.fechaFin,
                    valorTotalNeto: snap.totales.valorNeto,
                    moneda: snap.moneda,
                    estado: snap.estado.valor,
                    porcentajeEjecutado: snap.progreso,
                    fechaCreacion: snap.fechaCreacion,
                };
            });

            return { success: true, data: contratos };
        } catch (error) {
            logger.error('Error en listar:', error instanceof Error ? error : undefined);
            return { success: false, error: 'Error al listar contratos' };
        }
    }

    async buscar(termino: string, tenantId: string): Promise<ContratoQueryResult<unknown[]>> {
        try {
            const repo = this.repo(tenantId);
            const data = await repo.search({
                busquedaTexto: termino,
                pagina: 1,
                tamanoPagina: 50,
            });

            const contratos = data.contratos.map(c => {
                const snap = c.toSnapshot();
                return {
                    id: snap.id,
                    numeroContrato: snap.numero.valor,
                    titulo: snap.producto,
                    clienteNombre: snap.anunciante,
                    valorTotalNeto: snap.totales.valorNeto,
                    estado: snap.estado.valor,
                };
            });

            return { success: true, data: contratos };
        } catch (error) {
            logger.error('Error en buscar:', error instanceof Error ? error : undefined);
            return { success: false, error: 'Error en búsqueda' };
        }
    }

    async obtenerPipeline(filtros: PipelineFilters = {}, tenantId: string): Promise<ContratoQueryResult<unknown>> {
        try {
            const repo = this.repo(tenantId);
            const pipeline = await repo.getPipelineData(filtros);
            return { success: true, data: pipeline };
        } catch (error) {
            logger.error('Error en obtenerPipeline:', error instanceof Error ? error : undefined);
            return { success: false, error: 'Error al obtener pipeline' };
        }
    }

    async obtenerMetricas(filtros: MetricFilters, tenantId: string): Promise<ContratoQueryResult<unknown>> {
        try {
            const repo = this.repo(tenantId);
            const metricas = await repo.getMetricasEjecutivo(filtros.vendedorId, {
                fechaDesde: new Date(filtros.fechaDesde),
                fechaHasta: new Date(filtros.fechaHasta)
            });
            return { success: true, data: metricas };
        } catch (error) {
            logger.error('Error en obtenerMetricas:', error instanceof Error ? error : undefined);
            return { success: false, error: 'Error al obtener métricas' };
        }
    }
}

export const ContratoQueryHandler = new ContratoQueryHandlerImpl();
export default ContratoQueryHandler;