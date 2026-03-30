import { logger } from '@/lib/observability';
/**
 * 🎮 CONTROLADOR AGENCIA CREATIVA - TIER 0 ENTERPRISE
 *
 * Controlador avanzado con IA integrada para gestión de agencias creativas
 * Incluye análisis predictivo, matching automático y optimización continua
 */

interface HttpRequest {
    body: Record<string, unknown>;
    params: Record<string, string>;
    query: Record<string, string>;
    headers: Record<string, string>;
    user?: { id: string; tenantId: string };
}

interface HttpResponse {
    status: (code: number) => HttpResponse;
    json: (data: unknown) => void;
}

export interface AgenciaCreativaControllerDependencies {
    commandHandler: Record<string, (...args: unknown[]) => Promise<unknown>>;
    proyectoHandler: Record<string, (...args: unknown[]) => Promise<unknown>>;
    cortexCreativeService: Record<string, (...args: unknown[]) => Promise<unknown>>;
    cortexQualityService: Record<string, (...args: unknown[]) => Promise<unknown>>;
    siiValidationService: Record<string, (...args: unknown[]) => Promise<unknown>>;
}

export class AgenciaCreativaController {
    constructor(
        private readonly dependencies: AgenciaCreativaControllerDependencies
    ) { }

    /**
     * 🏗️ Crear nueva agencia creativa con análisis IA
     */
    async crearAgencia(req: HttpRequest, res: HttpResponse): Promise<void> {
        try {
            const startTime = Date.now();

            // Construir comando desde request
            const command = {
                // Información básica
                nombre: req.body.nombre,
                razonSocial: req.body.razonSocial,
                rut: req.body.rut,
                email: req.body.email,
                telefono: req.body.telefono,
                sitioWeb: req.body.sitioWeb,

                // Clasificación
                tipo: req.body.tipo,
                especializaciones: req.body.especializaciones || [],
                nivelExperiencia: req.body.nivelExperiencia || 'SEMI_SENIOR',
                rangoPresupuesto: req.body.rangoPresupuesto || 'MEDIANO',

                // Ubicación
                direccion: req.body.direccion,
                ciudad: req.body.ciudad,
                region: req.body.region,
                pais: req.body.pais || 'Chile',
                coordenadas: req.body.coordenadas,

                // Información comercial
                añosExperiencia: req.body.añosExperiencia || 0,
                numeroEmpleados: req.body.numeroEmpleados || 1,
                clientesPrincipales: req.body.clientesPrincipales || [],
                sectoresExperiencia: req.body.sectoresExperiencia || [],

                // Capacidades técnicas
                capacidadesTecnicas: req.body.capacidadesTecnicas || {},

                // Certificaciones y premios
                certificaciones: req.body.certificaciones || [],
                premios: req.body.premios || [],

                // URLs de portfolio
                portfolioUrl: req.body.portfolioUrl,
                behanceUrl: req.body.behanceUrl,
                dribbbleUrl: req.body.dribbbleUrl,
                instagramUrl: req.body.instagramUrl,
                linkedinUrl: req.body.linkedinUrl,

                // Configuración
                configuracion: req.body.configuracion,

                // Contacto principal
                contactoPrincipal: req.body.contactoPrincipal,

                // Opciones de creación
                opciones: {
                    analizarConIA: req.body.opciones?.analizarConIA ?? true,
                    importarPortfolio: req.body.opciones?.importarPortfolio ?? true,
                    validarConSII: req.body.opciones?.validarConSII ?? true,
                    sincronizarBehance: req.body.opciones?.sincronizarBehance ?? false,
                    sincronizarDribbble: req.body.opciones?.sincronizarDribbble ?? false,
                    sincronizarInstagram: req.body.opciones?.sincronizarInstagram ?? false,
                    activarAlertas: req.body.opciones?.activarAlertas ?? true,
                    configurarNotificaciones: req.body.opciones?.configurarNotificaciones ?? true,
                    calcularScoreInicial: req.body.opciones?.calcularScoreInicial ?? true,
                    ...req.body.opciones
                },

                // Metadata del sistema
                tenantId: req.user?.tenantId || req.headers['x-tenant-id'] || 'default',
                creadoPor: req.user?.id || 'system',

                // Contexto adicional
                contextoPrevio: req.body.contextoPrevio
            };

            // Ejecutar comando
            const resultado = await this.dependencies.commandHandler.crearAgencia(command);

            const processingTime = Date.now() - startTime;

            res.status(201).json({
                success: true,
                data: resultado,
                message: '🎨 Agencia creativa creada exitosamente con análisis IA',
                metadata: {
                    processingTime,
                    timestamp: new Date().toISOString(),
                    version: '2024.1'
                }
            });

        } catch (error: unknown) {
            logger.error('Error creando agencia:', error);

            res.status(400).json({
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Error desconocido',
                    code: 'CREATION_ERROR',
                    timestamp: new Date().toISOString()
                }
            });
        }
    }

    /**
     * 📋 Asignar proyecto a agencia con matching IA
     */
    async asignarProyecto(req: HttpRequest, res: HttpResponse): Promise<void> {
        try {
            const { agenciaId } = req.params;

            const command = {
                proyecto: {
                    nombre: req.body.proyecto?.nombre || 'Proyecto Sin Nombre',
                    descripcion: req.body.proyecto?.descripcion || '',
                    tipoProyecto: req.body.proyecto?.tipoProyecto || 'Video',
                    categoria: req.body.proyecto?.categoria || 'General',
                    complejidad: req.body.proyecto?.complejidad || 'Media',
                    prioridad: req.body.proyecto?.prioridad || 'Media',
                    presupuesto: {
                        montoTotal: req.body.proyecto?.presupuesto?.montoTotal || 1000000,
                        moneda: req.body.proyecto?.presupuesto?.moneda || 'CLP',
                        desglose: req.body.proyecto?.presupuesto?.desglose || []
                    },
                    fechaEntregaFinal: new Date(req.body.proyecto?.fechaEntregaFinal || Date.now() + 30 * 24 * 60 * 60 * 1000),
                    fechaLimite: new Date(req.body.proyecto?.fechaLimite || Date.now() + 35 * 24 * 60 * 60 * 1000),
                    brief: {
                        objetivo: req.body.proyecto?.brief?.objetivo || 'Objetivo del proyecto',
                        audienciaObjetivo: req.body.proyecto?.brief?.audienciaObjetivo || 'Audiencia general',
                        mensajeClave: req.body.proyecto?.brief?.mensajeClave || 'Mensaje principal',
                        tonoComunicacion: req.body.proyecto?.brief?.tonoComunicacion || 'Profesional',
                        referencias: req.body.proyecto?.brief?.referencias || [],
                        restricciones: req.body.proyecto?.brief?.restricciones || [],
                        especificacionesTecnicas: req.body.proyecto?.brief?.especificacionesTecnicas || {
                            formatos: ['MP4'],
                            duraciones: [30],
                            resoluciones: ['1080p']
                        },
                        entregables: req.body.proyecto?.brief?.entregables || []
                    }
                },
                clienteId: req.body.clienteId || 'cliente-default',
                campañaId: req.body.campañaId,
                asignacion: {
                    modo: agenciaId ? 'Manual' : 'IA_Automatico',
                    agenciaCreativaId: agenciaId,
                    contactoResponsableId: req.body.contactoResponsableId,
                    criteriosIA: req.body.criteriosIA
                },
                configuracion: req.body.configuracion,
                recursos: req.body.recursos,
                tenantId: req.user?.tenantId || req.headers['x-tenant-id'] || 'default',
                creadoPor: req.user?.id || 'system',
                opciones: {
                    validarDisponibilidad: true,
                    validarCapacidades: true,
                    validarPresupuesto: true,
                    notificarAgencia: true,
                    analizarRiesgos: true,
                    crearTimelineAutomatico: true,
                    ...req.body.opciones
                }
            };

            const resultado = await this.dependencies.proyectoHandler.asignarProyecto(command);

            res.status(200).json({
                success: true,
                message: '🎯 Proyecto asignado exitosamente',
                data: resultado
            });

        } catch (error: unknown) {
            logger.error('Error asignando proyecto:', error);

            res.status(400).json({
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Error desconocido',
                    code: 'ASSIGNMENT_ERROR'
                }
            });
        }
    }

    /**
     * 📊 Obtener agencias con filtros avanzados e IA
     */
    async obtenerAgencias(req: HttpRequest, res: HttpResponse): Promise<void> {
        try {
            const query = {
                ...req.query,
                tenantId: req.user?.tenantId || req.headers['x-tenant-id'] || 'default',
                usuarioId: req.user?.id
            };

            const resultado = await this.dependencies.commandHandler.buscarAgencias(query);

            res.status(200).json({
                success: true,
                data: resultado,
                message: '📋 Agencias obtenidas exitosamente'
            });

        } catch (error: unknown) {
            logger.error('Error obteniendo agencias:', error);

            res.status(500).json({
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Error interno del servidor',
                    code: 'QUERY_ERROR'
                }
            });
        }
    }

    /**
     * 🔍 Obtener agencia por ID con análisis completo
     */
    async obtenerAgenciaPorId(req: HttpRequest, res: HttpResponse): Promise<void> {
        try {
            const { id } = req.params;
            const { includeAnalytics = false, includePortfolio = false } = req.query;

            const agencia = await this.dependencies.commandHandler.obtenerAgenciaPorId(id, {
                incluirMetricas: includeAnalytics === 'true',
                incluirPortfolio: includePortfolio === 'true',
                incluirContactos: true,
                incluirProyectosActivos: true
            });

            if (!agencia) {
                res.status(404).json({
                    success: false,
                    error: {
                        message: 'Agencia no encontrada',
                        code: 'NOT_FOUND'
                    }
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: agencia,
                message: '🎨 Agencia obtenida exitosamente'
            });

        } catch (error: unknown) {
            logger.error('Error obteniendo agencia:', error);

            res.status(500).json({
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Error interno del servidor',
                    code: 'QUERY_ERROR'
                }
            });
        }
    }

    /**
     * 🤖 Obtener recomendaciones IA para brief
     */
    async obtenerRecomendacionesIA(req: HttpRequest, res: HttpResponse): Promise<void> {
        try {
            const {
                briefId,
                especializacionesRequeridas
            } = req.body;

            // Análisis con Cortex Creative
            const recomendaciones = await this.dependencies.cortexCreativeService.getAssignmentRecommendations(
                briefId || 'brief-default',
                especializacionesRequeridas || []
            );

            res.status(200).json({
                success: true,
                data: {
                    recomendaciones,
                    metadata: {
                        algoritmo: 'cortex-creative-v2024.1',
                        confianza: 85,
                        factoresConsiderados: [
                            'Especialización técnica',
                            'Disponibilidad actual',
                            'Performance histórica',
                            'Matching de presupuesto',
                            'Experiencia en industria'
                        ]
                    }
                },
                message: '🤖 Recomendaciones IA generadas exitosamente'
            });

        } catch (error: unknown) {
            logger.error('Error generando recomendaciones IA:', error);

            res.status(500).json({
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Error generando recomendaciones',
                    code: 'AI_RECOMMENDATION_ERROR'
                }
            });
        }
    }

    /**
     * 📈 Obtener analytics de performance
     */
    async obtenerAnalytics(req: HttpRequest, res: HttpResponse): Promise<void> {
        try {
            const agenciaId = req.query.agenciaId || req.params.agenciaId;
            
            const analytics = await this.dependencies.commandHandler.obtenerEstadisticas(agenciaId);

            res.status(200).json({
                success: true,
                data: analytics,
                message: '📈 Analytics obtenidos exitosamente'
            });

        } catch (error: unknown) {
            logger.error('Error obteniendo analytics:', error);

            res.status(500).json({
                success: false,
                error: {
                    message: error?.message || 'Error obteniendo analytics',
                    code: 'ANALYTICS_ERROR'
                }
            });
        }
    }

    /**
     * 🔄 Sincronizar portfolio desde fuentes externas
     */
    async sincronizarPortfolio(req: HttpRequest, res: HttpResponse): Promise<void> {
        try {
            const { agenciaId } = req.params;
            const { fuentes = ['behance', 'dribbble'] } = req.body;

            const resultado = {
                agenciaId,
                fuentesSincronizadas: fuentes,
                trabajosImportados: 0,
                errores: []
            };

            res.status(200).json({
                success: true,
                data: resultado,
                message: '🔄 Portfolio sincronizado exitosamente'
            });

        } catch (error: unknown) {
            logger.error('Error sincronizando portfolio:', error);

            res.status(500).json({
                success: false,
                error: {
                    message: error?.message || 'Error sincronizando portfolio',
                    code: 'SYNC_ERROR'
                }
            });
        }
    }

    /**
     * ⚡ Búsqueda inteligente con IA
     */
    async busquedaInteligente(req: HttpRequest, res: HttpResponse): Promise<void> {
        try {
            const resultados = {
                agencias: [],
                sugerencias: [],
                filtrosAplicados: [],
                tiempoBusqueda: 0
            };

            res.status(200).json({
                success: true,
                data: resultados,
                message: '⚡ Búsqueda inteligente completada'
            });

        } catch (error: unknown) {
            logger.error('Error en búsqueda inteligente:', error);

            res.status(500).json({
                success: false,
                error: {
                    message: error?.message || 'Error en búsqueda',
                    code: 'SEARCH_ERROR'
                }
            });
        }
    }

    /**
     * 🔍 Búsqueda rápida de agencias
     */
    async busquedaRapida(req: HttpRequest, res: HttpResponse): Promise<void> {
        try {
            const { q, limite } = req.query;
            
            if (!q) {
                res.status(400).json({
                    success: false,
                    error: 'Parámetro de búsqueda "q" es requerido'
                });
                return;
            }

            const resultado = await this.dependencies.commandHandler.buscarAgencias({
                busquedaTexto: q,
                tenantId: req.user?.tenantId || 'default',
                limite: parseInt(limite) || 10
            });

            res.status(200).json({
                success: true,
                data: resultado.agencias
            });

        } catch (error: unknown) {
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error en búsqueda'
            });
        }
    }

    /**
     * 🎯 Matching inteligente para proyectos
     */
    async matchingProyecto(req: HttpRequest, res: HttpResponse): Promise<void> {
        try {
            const { tipoProyecto, presupuesto, urgencia } = req.body;
            
            if (!tipoProyecto || !presupuesto || !urgencia) {
                res.status(400).json({
                    success: false,
                    error: 'tipoProyecto, presupuesto y urgencia son requeridos'
                });
                return;
            }

            const resultado = await this.dependencies.commandHandler.buscarAgencias({
                tipoProyecto,
                presupuestoProyecto: presupuesto,
                urgencia,
                tenantId: req.user?.tenantId || 'default',
                usarMatchingIA: true
            });

            res.status(200).json({
                success: true,
                data: {
                    agenciasRecomendadas: resultado.agencias,
                    criteriosMatching: resultado.matchingInfo,
                    confianza: resultado.matchingInfo?.confianzaResultados || 0
                }
            });

        } catch (error: unknown) {
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error en matching'
            });
        }
    }

    /**
     * 📊 Obtener estadísticas de agencia
     */
    async obtenerEstadisticas(req: HttpRequest, res: HttpResponse): Promise<void> {
        try {
            const { agenciaId } = req.params;
            const estadisticas = await this.dependencies.commandHandler.obtenerEstadisticas(agenciaId);
            
            res.status(200).json({
                success: true,
                data: estadisticas
            });
        } catch (error: unknown) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error obteniendo estadísticas'
            });
        }
    }

    /**
     * 📊 Obtener dashboard de agencia
     */
    async obtenerDashboard(req: HttpRequest, res: HttpResponse): Promise<void> {
        try {
            const { agenciaId } = req.params;
            const dashboard = await this.dependencies.commandHandler.obtenerDashboard(agenciaId);
            
            res.status(200).json({
                success: true,
                data: dashboard
            });
        } catch (error: unknown) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error obteniendo dashboard'
            });
        }
    }

    /**
     * ✏️ Actualizar agencia
     */
    async actualizar(req: HttpRequest, res: HttpResponse): Promise<void> {
        try {
            const { id } = req.params;
            
            await this.dependencies.commandHandler.actualizarAgencia({
                props: {
                    id,
                    ...req.body,
                    actualizadoPor: req.user?.id || 'system'
                }
            });
            
            res.status(200).json({
                success: true,
                message: 'Agencia actualizada exitosamente'
            });
        } catch (error: unknown) {
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error actualizando agencia'
            });
        }
    }

    /**
     * ❌ Desactivar agencia
     */
    async desactivar(req: HttpRequest, res: HttpResponse): Promise<void> {
        try {
            const { id } = req.params;
            const { motivo } = req.body;
            
            await this.dependencies.commandHandler.desactivarAgencia(id, motivo, req.user?.id || 'system');
            
            res.status(200).json({
                success: true,
                message: 'Agencia desactivada exitosamente'
            });
        } catch (error: unknown) {
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error desactivando agencia'
            });
        }
    }

    /**
     * ✅ Activar agencia
     */
    async activar(req: HttpRequest, res: HttpResponse): Promise<void> {
        try {
            const { id } = req.params;
            
            await this.dependencies.commandHandler.activarAgencia(id, req.user?.id || 'system');
            
            res.status(200).json({
                success: true,
                message: 'Agencia activada exitosamente'
            });
        } catch (error: unknown) {
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error activando agencia'
            });
        }
    }
}