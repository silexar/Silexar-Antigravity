/**
 * Módulo de Configuración - Silexar Pulse
 * Application Layer - Handlers
 * 
 * Handlers para los commands del módulo de configuración.
 * Orchestran la lógica de negocio entre dominio e infraestructura.
 */

import { logger } from '@/lib/observability';
import { auditLogger } from '@/lib/security/audit-logger';
import { Configuracion, ConfiguracionFactory } from '@/modules/configuracion/domain/entities';
import { NivelSeguridad } from '@/modules/configuracion/domain/value-objects';
import { ConfiguracionEventFactory } from '@/modules/configuracion/domain/events';
import type { IConfiguracionRepository, IAuditoriaRepository, ConfiguracionFiltros } from '@/modules/configuracion/domain/repositories';
import { configuracionRepository, auditoriaRepository } from '@/modules/configuracion/infrastructure/repositories';
import type {
    CrearConfiguracionCommand,
    ActualizarConfiguracionCommand,
    EliminarConfiguracionesCommand,
    ImportarConfiguracionesCommand,
    ExportarConfiguracionesCommand,
    BuscarConfiguracionesCommand,
    CambiarVisibilidadCommand,
    ToggleFavoritaCommand,
} from '../commands';

/**
 * Resultado de una operación
 */
export interface OperationResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
}

/**
 * Handler para operaciones de configuración
 */
export class ConfiguracionHandler {
    private repository: IConfiguracionRepository;
    private auditoriaRepo: IAuditoriaRepository;

    constructor(
        repo: IConfiguracionRepository = configuracionRepository,
        auditoria: IAuditoriaRepository = auditoriaRepository
    ) {
        this.repository = repo;
        this.auditoriaRepo = auditoria;
    }

    /**
     * Crea una nueva configuración
     */
    async crear(command: CrearConfiguracionCommand): Promise<OperationResult> {
        try {
            const { tenantId, usuarioId, payload, ipAddress, userAgent } = command;

            // Verificar si la clave ya existe
            const existe = await this.repository.existeClave(payload.clave, tenantId);
            if (existe) {
                return {
                    success: false,
                    error: {
                        code: 'CLAVE_EXISTE',
                        message: `Ya existe una configuración con la clave: ${payload.clave}`,
                    },
                };
            }

            // Crear la entidad
            const configuracion = Configuracion.crear({
                tenantId,
                clave: payload.clave,
                valor: payload.valor,
                tipo: payload.tipo,
                categoria: payload.categoria,
                descripcion: payload.descripcion,
                editable: payload.editable,
                visible: payload.visible,
                nivelSeguridad: payload.nivelSeguridad || 'publico',
                grupo: payload.grupo,
                orden: payload.orden || 0,
                creadaPor: usuarioId,
            });

            // Persistir
            await this.repository.guardar(configuracion);

            // Registrar auditoría
            await this.registrarAuditoria({
                configuracionId: configuracion.id,
                tenantId,
                usuarioId,
                accion: 'CREATE',
                valorAnterior: null,
                valorNuevo: configuracion.valor,
                clave: configuracion.clave,
                ipAddress,
                userAgent,
            });

            // Registrar evento de dominio
            const evento = ConfiguracionEventFactory.crearCreada({
                tenantId,
                configuracionId: configuracion.id,
                clave: configuracion.clave,
                usuarioId,
                valor: configuracion.valor,
                categoria: configuracion.categoria,
            });

            logger.info(`[ConfiguracionHandler] Configuración creada: ${configuracion.clave}`);

            return {
                success: true,
                data: configuracion.toAPIModel(),
            };
        } catch (error) {
            logger.error('Error al crear configuración', error instanceof Error ? error : undefined);
            return {
                success: false,
                error: {
                    code: 'CREATE_ERROR',
                    message: 'No fue posible crear la configuración',
                    details: error instanceof Error ? error.message : null,
                },
            };
        }
    }

    /**
     * Actualiza una configuración existente
     */
    async actualizar(command: ActualizarConfiguracionCommand): Promise<OperationResult> {
        try {
            const { tenantId, usuarioId, configuracionId, payload, ipAddress, userAgent } = command;

            // Buscar la configuración actual
            const actual = await this.repository.buscarPorId(configuracionId, tenantId);
            if (!actual) {
                return {
                    success: false,
                    error: {
                        code: 'NO_ENCONTRADA',
                        message: 'Configuración no encontrada',
                    },
                };
            }

            // Verificar si es editable
            if (!actual.editable) {
                return {
                    success: false,
                    error: {
                        code: 'NO_EDITABLE',
                        message: 'Esta configuración no puede ser editada',
                    },
                };
            }

            // Guardar valor anterior para auditoría
            const valorAnterior = actual.valor;

            // Actualizar valores
            if (payload.valor !== undefined) {
                actual.actualizarValor(payload.valor, usuarioId);
            }
            if (payload.descripcion !== undefined) {
                actual.actualizarDescripcion(payload.descripcion);
            }
            if (payload.visible !== undefined) {
                actual.actualizarVisibilidad(payload.visible);
            }
            if (payload.grupo !== undefined) {
                actual.actualizarGrupo(payload.grupo);
            }
            if (payload.orden !== undefined) {
                actual.actualizarOrden(payload.orden);
            }

            // Persistir cambios
            await this.repository.actualizar(actual);

            // Registrar auditoría
            await this.registrarAuditoria({
                configuracionId: actual.id,
                tenantId,
                usuarioId,
                accion: 'UPDATE',
                valorAnterior,
                valorNuevo: actual.valor,
                clave: actual.clave,
                ipAddress,
                userAgent,
            });

            // Registrar evento de dominio
            const evento = ConfiguracionEventFactory.crearActualizada({
                tenantId,
                configuracionId: actual.id,
                clave: actual.clave,
                usuarioId,
                valorAnterior,
                valorNuevo: actual.valor,
            });

            logger.info(`[ConfiguracionHandler] Configuración actualizada: ${actual.clave}`);

            return {
                success: true,
                data: actual.toAPIModel(),
            };
        } catch (error) {
            logger.error('Error al actualizar configuración', error instanceof Error ? error : undefined);
            return {
                success: false,
                error: {
                    code: 'UPDATE_ERROR',
                    message: 'No fue posible actualizar la configuración',
                    details: error instanceof Error ? error.message : null,
                },
            };
        }
    }

    /**
     * Elimina una o varias configuraciones
     */
    async eliminar(command: EliminarConfiguracionesCommand): Promise<OperationResult> {
        try {
            const { tenantId, usuarioId, payload, ipAddress, userAgent } = command;
            const { ids } = payload;

            const resultados = {
                eliminadas: 0,
                errores: [] as string[],
            };

            for (const id of ids) {
                // Verificar que existe y es editable
                const config = await this.repository.buscarPorId(id, tenantId);
                if (!config) {
                    resultados.errores.push(`No encontrada: ${id}`);
                    continue;
                }
                if (!config.editable) {
                    resultados.errores.push(`No editable: ${config.clave}`);
                    continue;
                }

                // Guardar datos para auditoría
                const valorEliminado = config.valor;
                const claveEliminada = config.clave;

                // Eliminar
                await this.repository.eliminar(id, tenantId);

                // Registrar auditoría
                await this.registrarAuditoria({
                    configuracionId: id,
                    tenantId,
                    usuarioId,
                    accion: 'DELETE',
                    valorAnterior: valorEliminado,
                    valorNuevo: null,
                    clave: claveEliminada,
                    ipAddress,
                    userAgent,
                });

                resultados.eliminadas++;
            }

            logger.info(`[ConfiguracionHandler] Eliminadas: ${resultados.eliminadas}, Errores: ${resultados.errores.length}`);

            return {
                success: resultados.errores.length === 0,
                data: resultados,
                error: resultados.errores.length > 0 ? {
                    code: 'ELIMINACION_PARCIAL',
                    message: `${resultados.eliminadas} configuraciones eliminadas, ${resultados.errores.length} con errores`,
                    details: resultados.errores,
                } : undefined,
            };
        } catch (error) {
            logger.error('Error al eliminar configuraciones', error instanceof Error ? error : undefined);
            return {
                success: false,
                error: {
                    code: 'DELETE_ERROR',
                    message: 'No fue posible eliminar las configuraciones',
                    details: error instanceof Error ? error.message : null,
                },
            };
        }
    }

    /**
     * Importa configuraciones desde un JSON
     */
    async importar(command: ImportarConfiguracionesCommand): Promise<OperationResult> {
        try {
            const { tenantId, usuarioId, payload, ipAddress, userAgent } = command;
            const { configuraciones: configs, opcionConflictos } = payload;

            const resultados = {
                importadas: 0,
                omitidas: 0,
                sobrescritas: 0,
                errores: [] as string[],
            };

            for (const config of configs) {
                try {
                    const existe = await this.repository.existeClave(config.clave, tenantId);

                    if (existe) {
                        switch (opcionConflictos) {
                            case 'omitir':
                                resultados.omitidas++;
                                continue;
                            case 'sobreescribir':
                                const existente = await this.repository.buscarPorClave(config.clave, tenantId)!;
                                if (!existente!.editable) {
                                    resultados.errores.push(`No editable: ${config.clave}`);
                                    continue;
                                }
                                existente!.actualizarValor(config.valor, usuarioId);
                                await this.repository.actualizar(existente!);
                                resultados.sobrescritas++;
                                break;
                            case 'error':
                                resultados.errores.push(`Conflicto: ${config.clave} ya existe`);
                                continue;
                        }
                    } else {
                        const nueva = Configuracion.crear({
                            tenantId,
                            clave: config.clave,
                            valor: config.valor,
                            tipo: config.tipo,
                            categoria: config.categoria,
                            descripcion: config.descripcion,
                            nivelSeguridad: config.nivelSeguridad as NivelSeguridad || NivelSeguridad.PUBLICO,
                            grupo: config.grupo,
                            orden: config.orden || 0,
                            creadaPor: usuarioId,
                        });
                        await this.repository.guardar(nueva);
                        resultados.importadas++;
                    }
                } catch (error) {
                    resultados.errores.push(`Error en ${config.clave}: ${error instanceof Error ? error.message : 'Unknown'}`);
                }
            }

            // Registrar auditoría de importación
            await this.registrarAuditoria({
                configuracionId: 'import',
                tenantId,
                usuarioId,
                accion: 'CREATE',
                valorAnterior: null,
                valorNuevo: { total: configs.length, conflictos: resultados.errores.length },
                clave: '__IMPORT__',
                ipAddress,
                userAgent,
            });

            logger.info(`[ConfiguracionHandler] Importación: ${resultados.importadas} nuevas, ${resultados.sobrescritas} sobrescritas, ${resultados.omitidas} omitidas`);

            return {
                success: true,
                data: resultados,
            };
        } catch (error) {
            logger.error('Error al importar configuraciones', error instanceof Error ? error : undefined);
            return {
                success: false,
                error: {
                    code: 'IMPORT_ERROR',
                    message: 'No fue posible importar las configuraciones',
                    details: error instanceof Error ? error.message : null,
                },
            };
        }
    }

    /**
     * Exporta configuraciones
     */
    async exportar(command: ExportarConfiguracionesCommand): Promise<OperationResult> {
        try {
            const { tenantId, payload } = command;
            const { formato, categorias, grupos, soloVisibles } = payload;

            let configs = soloVisibles
                ? await this.repository.listarVisibles(tenantId)
                : await this.repository.listarTodas(tenantId);

            // Filtrar por categorías
            if (categorias && categorias.length > 0) {
                configs = configs.filter(c => categorias.includes(c.categoria));
            }

            // Filtrar por grupos
            if (grupos && grupos.length > 0) {
                configs = configs.filter(c => c.grupo && grupos.includes(c.grupo));
            }

            // Formatear según el formato
            let contenido: string;
            if (formato === 'json') {
                contenido = JSON.stringify(configs.map(c => c.toJSON()), null, 2);
            } else {
                // CSV
                const headers = ['clave', 'valor', 'tipo', 'categoria', 'descripcion', 'editable', 'visible'];
                const rows = configs.map(c => [
                    c.clave,
                    String(c.valor),
                    c.tipo,
                    c.categoria,
                    c.descripcion,
                    c.editable ? 'true' : 'false',
                    c.visible ? 'true' : 'false',
                ]);
                contenido = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            }

            return {
                success: true,
                data: {
                    cantidad: configs.length,
                    formato,
                    contenido,
                    nombre: `configuraciones_${new Date().toISOString().split('T')[0]}.${formato}`,
                },
            };
        } catch (error) {
            logger.error('Error al exportar configuraciones', error instanceof Error ? error : undefined);
            return {
                success: false,
                error: {
                    code: 'EXPORT_ERROR',
                    message: 'No fue posible exportar las configuraciones',
                    details: error instanceof Error ? error.message : null,
                },
            };
        }
    }

    /**
     * Busca configuraciones con filtros
     */
    async buscar(command: BuscarConfiguracionesCommand): Promise<OperationResult> {
        try {
            const { tenantId, payload } = command;

            const filtros: ConfiguracionFiltros = {
                categoria: payload.categoria,
                grupo: payload.grupo,
                tipo: payload.tipo,
                editable: payload.editable,
                visible: payload.visible,
                buscar: payload.buscar,
                limite: payload.limite,
                offset: payload.offset,
                ordenarPor: payload.ordenarPor,
                orden: payload.orden,
            };

            const configs = await this.repository.buscarConFiltros(filtros, tenantId);
            const conteos = await this.repository.contarPorCategoria(tenantId);

            return {
                success: true,
                data: {
                    configuraciones: configs.map(c => c.toAPIModel()),
                    total: configs.length,
                    conteosPorCategoria: conteos,
                },
            };
        } catch (error) {
            logger.error('Error al buscar configuraciones', error instanceof Error ? error : undefined);
            return {
                success: false,
                error: {
                    code: 'SEARCH_ERROR',
                    message: 'No fue posible buscar las configuraciones',
                    details: error instanceof Error ? error.message : null,
                },
            };
        }
    }

    /**
     * Cambia la visibilidad de una configuración
     */
    async cambiarVisibilidad(command: CambiarVisibilidadCommand): Promise<OperationResult> {
        try {
            const { tenantId, usuarioId, configuracionId, payload, ipAddress, userAgent } = command;

            const config = await this.repository.buscarPorId(configuracionId, tenantId);
            if (!config) {
                return {
                    success: false,
                    error: {
                        code: 'NO_ENCONTRADA',
                        message: 'Configuración no encontrada',
                    },
                };
            }

            const visibilidadAnterior = config.visible;
            config.actualizarVisibilidad(payload.visible);
            await this.repository.actualizar(config);

            // Registrar auditoría
            await this.registrarAuditoria({
                configuracionId: config.id,
                tenantId,
                usuarioId,
                accion: 'UPDATE',
                valorAnterior: visibilidadAnterior,
                valorNuevo: payload.visible,
                clave: config.clave,
                ipAddress,
                userAgent,
            });

            return {
                success: true,
                data: config.toAPIModel(),
            };
        } catch (error) {
            logger.error('Error al cambiar visibilidad', error instanceof Error ? error : undefined);
            return {
                success: false,
                error: {
                    code: 'VISIBILITY_ERROR',
                    message: 'No fue posible cambiar la visibilidad',
                    details: error instanceof Error ? error.message : null,
                },
            };
        }
    }

    /**
     * Obtiene una configuración por ID
     */
    async obtenerPorId(tenantId: string, configuracionId: string): Promise<OperationResult> {
        try {
            const config = await this.repository.buscarPorId(configuracionId, tenantId);
            if (!config) {
                return {
                    success: false,
                    error: {
                        code: 'NO_ENCONTRADA',
                        message: 'Configuración no encontrada',
                    },
                };
            }

            return {
                success: true,
                data: config.toAPIModel(),
            };
        } catch (error) {
            logger.error('Error al obtener configuración', error instanceof Error ? error : undefined);
            return {
                success: false,
                error: {
                    code: 'GET_ERROR',
                    message: 'No fue posible obtener la configuración',
                },
            };
        }
    }

    /**
     * Lista todas las configuraciones
     */
    async listarTodas(tenantId: string, limite: number = 50, offset: number = 0): Promise<OperationResult> {
        try {
            const configs = await this.repository.listarTodas(tenantId, { limite, offset });
            const conteos = await this.repository.contarPorCategoria(tenantId);

            return {
                success: true,
                data: {
                    configuraciones: configs.map(c => c.toAPIModel()),
                    total: configs.length,
                    conteosPorCategoria: conteos,
                },
            };
        } catch (error) {
            logger.error('Error al listar configuraciones', error instanceof Error ? error : undefined);
            return {
                success: false,
                error: {
                    code: 'LIST_ERROR',
                    message: 'No fue posible listar las configuraciones',
                },
            };
        }
    }

    /**
     * Obtiene el historial de auditoría de una configuración
     */
    async obtenerAuditoria(configuracionId: string, tenantId: string, limite: number = 50): Promise<OperationResult> {
        try {
            const historial = await this.auditoriaRepo.obtenerHistorialConfiguracion(configuracionId, tenantId, limite);

            return {
                success: true,
                data: {
                    historial: historial.map(h => h.toJSON()),
                    total: historial.length,
                },
            };
        } catch (error) {
            logger.error('Error al obtener auditoría', error instanceof Error ? error : undefined);
            return {
                success: false,
                error: {
                    code: 'AUDIT_ERROR',
                    message: 'No fue posible obtener el historial de auditoría',
                },
            };
        }
    }

    /**
     * Registra un evento de auditoría
     */
    private async registrarAuditoria(params: {
        configuracionId: string;
        tenantId: string;
        usuarioId: string;
        accion: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ';
        valorAnterior: unknown;
        valorNuevo: unknown;
        clave: string;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<void> {
        try {
            const { RegistroAuditoria } = await import('@/modules/configuracion/domain/value-objects');

            const registro = RegistroAuditoria.create({
                id: crypto.randomUUID(),
                configuracionId: params.configuracionId,
                usuarioId: params.usuarioId,
                accion: params.accion,
                valorAnterior: params.valorAnterior,
                valorNuevo: params.valorNuevo,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                timestamp: new Date(),
            });

            await this.auditoriaRepo.registrar(registro, params.tenantId);
        } catch (error) {
            // No fallar la operación principal por errores de auditoría
            logger.error('Error al registrar auditoría', error instanceof Error ? error : undefined);
        }
    }
}

// Exportar handler
export const configuracionHandler = new ConfiguracionHandler();
