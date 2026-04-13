/**
 * CONTROLADOR DASHBOARD - TIER 0
 * 
 * @description API para dashboard ejecutivo con métricas en tiempo real
 */

// Tipos locales compatibles con Next.js App Router (no depende de express)
interface Request {
  query: Record<string, string | string[] | undefined>;
  user?: {
    id: string;
    role?: string;
    permissions?: string[];
  };
}

interface Response {
  json: (data: unknown) => void;
  status: (code: number) => Response;
}

interface IAlert {
  prioridad: string;
  categoria?: string;
  fechaCreacion: string | Date;
  [key: string]: unknown;
}

interface IContratoData {
  id: string;
  numero: string;
  cliente: string;
  valor: number;
  diasEnEtapa: number;
  probabilidadCierre: number;
  proximaAccion: string;
  ejecutivo: string;
  estado?: string;
  [key: string]: unknown;
}

interface IEstadoPipeline {
  estado: string;
  cantidad: number;
  valorTotal: number;
  contratos: IContratoData[];
}

interface IPipeline {
  resumen: {
    totalContratos: number;
    valorTotal: number;
    tasaConversion: number;
    prediccionCierre: unknown;
  };
  contratosPorEstado: IEstadoPipeline[];
  metricas?: {
    tiempoPromedioTotal: number;
    embudo: unknown[];
  };
}

export class DashboardController {
  constructor(
    private contratoQueryHandler: {
      obtenerPipelineVentas: (filtros: unknown) => Promise<IPipeline>;
      obtenerMetricasEjecutivo: (filtros: unknown) => Promise<Exclude<unknown, null>>;
      obtenerAlertasCriticas: (filtros: unknown) => Promise<IAlert[]>;
      generarPrediccionRenovacion: (filtros: unknown) => Promise<Exclude<unknown, null>>;
      obtenerAlertas: (filtros: unknown) => Promise<IAlert[]>;
    },
    private metricsService: {
      obtenerMetricasEnVivo: () => Promise<Exclude<unknown, null>>;
    },
    private logger: { error: (msg: string, err?: unknown) => void }
  ) {}

  // GET /api/contratos/dashboard/ejecutivo
  async obtenerDashboardEjecutivo(req: Request, res: Response): Promise<void> {
    try {
      const ejecutivoId = req.query.ejecutivoId as string || req.user?.id
      const periodo = req.query.periodo as string || 'mes'

      const [pipeline, metricasRaw, alertas, prediccionesRaw] = await Promise.all([
        this.contratoQueryHandler.obtenerPipelineVentas({ ejecutivoId, incluirPredicciones: true }),
        this.contratoQueryHandler.obtenerMetricasEjecutivo({ ejecutivoId, periodo }),
        this.contratoQueryHandler.obtenerAlertasCriticas({ ejecutivoId }),
        this.contratoQueryHandler.generarPrediccionRenovacion({ ejecutivoId, diasAnticipacion: 30 })
      ])

      // Narrowing seguro: los datos vienen de un handler tipado como unknown
      const metricas = metricasRaw as {
        objetivos?: { metaMensual?: number; cumplimientoActual?: number };
        metricas?: {
          ventasRealizadas?: unknown;
          performance?: { tendenciaMensual?: number[] };
          calidad?: unknown;
        };
      };
      const predicciones = prediccionesRaw as {
        contratos?: unknown[];
        resumenGeneral?: { valorEnRiesgo?: number; accionesRecomendadas?: number };
      };

      const dashboard = {
        resumen: {
          contratosActivos: pipeline.resumen.totalContratos,
          valorPipeline: pipeline.resumen.valorTotal,
          tasaConversion: pipeline.resumen.tasaConversion,
          metaMensual: metricas.objetivos?.metaMensual || 0,
          cumplimientoMeta: metricas.objetivos?.cumplimientoActual || 0
        },
        pipeline: {
          estados: pipeline.contratosPorEstado,
          prediccionCierre: pipeline.resumen.prediccionCierre
        },
        metricas: {
          ventasRealizadas: metricas.metricas?.ventasRealizadas,
          performance: metricas.metricas?.performance,
          calidad: metricas.metricas?.calidad
        },
        alertas: {
          criticas: alertas.filter(a => a.prioridad === 'critica').length,
          importantes: alertas.filter(a => a.prioridad === 'alta').length,
          total: alertas.length,
          items: alertas.slice(0, 5) // Top 5 alertas
        },
        renovaciones: {
          proximasVencer: predicciones.contratos?.length || 0,
          valorEnRiesgo: predicciones.resumenGeneral?.valorEnRiesgo || 0,
          accionesRequeridas: predicciones.resumenGeneral?.accionesRecomendadas || 0
        },
        tendencias: this.calcularTendencias(metricas.metricas?.performance?.tendenciaMensual)
      }

      res.json({
        success: true,
        data: dashboard,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      this.logger.error('Error en dashboard ejecutivo:', error)
      res.status(500).json({
        error: 'DASHBOARD_ERROR',
        message: 'Error obteniendo dashboard ejecutivo'
      })
    }
  }

  // GET /api/contratos/dashboard/pipeline
  async obtenerPipelineKanban(req: Request, res: Response): Promise<void> {
    try {
      const filtros = {
        ejecutivoId: req.query.ejecutivoId as string,
        equipoId: req.query.equipoId as string,
        incluirMetricas: true,
        incluirPredicciones: true
      }

      const pipeline = await this.contratoQueryHandler.obtenerPipelineVentas(filtros)

      const kanban = {
        columnas: pipeline.contratosPorEstado.map(estado => ({
          id: estado.estado,
          titulo: this.formatearTituloEstado(estado.estado),
          color: this.obtenerColorEstado(estado.estado),
          cantidad: estado.cantidad,
          valor: estado.valorTotal,
          contratos: estado.contratos.map(contrato => ({
            id: contrato.id,
            numero: contrato.numero,
            cliente: contrato.cliente,
            valor: contrato.valor,
            urgencia: this.calcularUrgencia(contrato),
            diasEnEtapa: contrato.diasEnEtapa,
            probabilidadCierre: contrato.probabilidadCierre,
            proximaAccion: contrato.proximaAccion,
            ejecutivo: contrato.ejecutivo || 'No asignado'
          }))
        })),
        metricas: {
          valorTotal: pipeline.resumen.valorTotal,
          tasaConversion: pipeline.resumen.tasaConversion,
          tiempoPromedioVenta: pipeline.metricas?.tiempoPromedioTotal || 0,
          embudo: pipeline.metricas?.embudo || []
        },
        acciones: this.generarAccionesRapidas(pipeline)
      }

      res.json({
        success: true,
        data: kanban,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      this.logger.error('Error en pipeline Kanban:', error)
      res.status(500).json({
        error: 'PIPELINE_ERROR',
        message: 'Error obteniendo pipeline Kanban'
      })
    }
  }

  // GET /api/contratos/dashboard/alertas
  async obtenerCentroAlertas(req: Request, res: Response): Promise<void> {
    try {
      const filtros = {
        usuarioId: req.user?.id,
        incluirResueltas: req.query.incluirResueltas === 'true',
        prioridad: req.query.prioridad as string,
        limite: parseInt(req.query.limite as string) || 50
      }

      const alertas = await this.contratoQueryHandler.obtenerAlertas(filtros)

      const centroAlertas = {
        resumen: {
          criticas: alertas.filter(a => a.prioridad === 'critica').length,
          importantes: alertas.filter(a => a.prioridad === 'alta').length,
          informativas: alertas.filter(a => a.prioridad === 'media').length,
          total: alertas.length
        },
        alertasPorCategoria: this.agruparAlertasPorCategoria(alertas),
        alertasRecientes: alertas
          .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
          .slice(0, 10),
        accionesDisponibles: [
          'marcar_como_leida',
          'asignar_responsable',
          'escalar',
          'resolver',
          'posponer'
        ]
      }

      res.json({
        success: true,
        data: centroAlertas,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      this.logger.error('Error en centro de alertas:', error)
      res.status(500).json({
        error: 'ALERTS_ERROR',
        message: 'Error obteniendo centro de alertas'
      })
    }
  }

  // GET /api/contratos/dashboard/metricas-tiempo-real
  async obtenerMetricasTiempoReal(req: Request, res: Response): Promise<void> {
    try {
      const metricasRaw = await this.metricsService.obtenerMetricasEnVivo()
      const metricas = metricasRaw as {
        contratosCreados?: unknown;
        valorGenerado?: unknown;
        aprobacionesPendientes?: unknown;
        firmasCompletadas?: unknown;
        alertasActivas?: unknown;
        tendenciaUltimaHora?: unknown;
        tendenciaUltimoDia?: unknown;
        tendenciaUltimaSemana?: unknown;
        tiempoRespuestaPromedio?: unknown;
        throughput?: unknown;
      };

      res.json({
        success: true,
        data: {
          timestamp: new Date().toISOString(),
          metricas: {
            contratosCreados: metricas.contratosCreados,
            valorGenerado: metricas.valorGenerado,
            aprobacionesPendientes: metricas.aprobacionesPendientes,
            firmasCompletadas: metricas.firmasCompletadas,
            alertasActivas: metricas.alertasActivas
          },
          tendencias: {
            ultimaHora: metricas.tendenciaUltimaHora,
            ultimoDia: metricas.tendenciaUltimoDia,
            ultimaSemana: metricas.tendenciaUltimaSemana
          },
          performance: {
            tiempoRespuestaPromedio: metricas.tiempoRespuestaPromedio,
            throughput: metricas.throughput,
          }
        }
      })

    } catch (error) {
      this.logger.error('Error en métricas tiempo real:', error)
      res.status(500).json({
        error: 'METRICS_ERROR',
        message: 'Error obteniendo métricas en tiempo real'
      })
    }
  }

  private formatearTituloEstado(estado: string): string {
    // Safe switch to prevent object injection
    switch (estado) {
      case 'borrador': return '📋 Borrador';
      case 'revision': return '👀 En Revisión';
      case 'aprobacion': return '⏳ Aprobación';
      case 'firmado': return '✅ Firmado';
      case 'activo': return '🚀 Activo';
      case 'finalizado': return '🏁 Finalizado';
      default: return estado;
    }
  }

  private obtenerColorEstado(estado: string): string {
    // Safe switch to prevent object injection
    switch (estado) {
      case 'borrador': return '#6B7280';
      case 'revision': return '#3B82F6';
      case 'aprobacion': return '#F59E0B';
      case 'firmado': return '#8B5CF6';
      case 'activo': return '#10B981';
      case 'finalizado': return '#6B7280';
      default: return '#6B7280';
    }
  }

  private calcularUrgencia(contrato: IContratoData): 'baja' | 'media' | 'alta' | 'critica' {
    const diasEnEtapa = contrato.diasEnEtapa || 0
    const valor = contrato.valor || 0

    if (diasEnEtapa > 7 && valor > 100000) return 'critica'
    if (diasEnEtapa > 5 || valor > 50000) return 'alta'
    if (diasEnEtapa > 3) return 'media'
    return 'baja'
  }

  private generarAccionesRapidas(pipeline: IPipeline): unknown[] {
    const acciones = []

    if (pipeline.resumen.tasaConversion < 50) {
      acciones.push({
        tipo: 'mejora_conversion',
        titulo: 'Mejorar Tasa de Conversión',
        descripcion: 'La tasa de conversión está por debajo del 50%',
        accion: 'revisar_pipeline'
      })
    }

    return acciones
  }

  private agruparAlertasPorCategoria(alertas: IAlert[]): Record<string, IAlert[]> {
    const grupos: Record<string, IAlert[]> = {};
    
    for (const alerta of alertas) {
      const categoria = alerta.categoria || 'general';
      // Safe property initialization using Map approach to avoid injection
      const grupoExistente = this.getGrupoSeguro(grupos, categoria);
      if (!grupoExistente) {
        this.setGrupoSeguro(grupos, categoria, []);
      }
      this.getGrupoSeguro(grupos, categoria)?.push(alerta);
    }
    
    return grupos;
  }

  // Safe getter to prevent object injection
  private getGrupoSeguro(grupos: Record<string, IAlert[]>, categoria: string): IAlert[] | undefined {
    // Use Object.entries to safely check for key existence
    const entries = Object.entries(grupos);
    const found = entries.find(([key]) => key === categoria);
    return found ? found[1] : undefined;
  }

  // Safe setter to prevent object injection  
  private setGrupoSeguro(grupos: Record<string, IAlert[]>, categoria: string, valor: IAlert[]): void {
    // Safe assignment using Object.defineProperty to prevent prototype pollution
    Object.defineProperty(grupos, categoria, {
      value: valor,
      writable: true,
      enumerable: true,
      configurable: true
    });
  }

  private calcularTendencias(datos: number[] | undefined): Record<string, unknown> {
    if (!datos || datos.length < 2) {
      return { direccion: 'estable', porcentaje: 0 }
    }

    const ultimo = datos[datos.length - 1] || 0
    const anterior = datos[datos.length - 2] || 0
    const cambio = anterior !== 0 ? ((ultimo - anterior) / anterior) * 100 : 0

    return {
      direccion: cambio > 5 ? 'subiendo' : cambio < -5 ? 'bajando' : 'estable',
      porcentaje: Math.abs(cambio),
      datos: datos.slice(-12)
    }
  }
}
