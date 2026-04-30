// @ts-nocheck

/**
 * SILEXAR PULSE QUANTUM - TIER 0 ENTERPRISE
 * Query: ObtenerPipelineVentasQuery
 * Nivel Fortune 10 - Gestión Empresarial Avanzada
 */

export enum EtapaPipeline {
  PROSPECTO = 'prospecto',
  CONTACTO_INICIAL = 'contacto_inicial',
  NECESIDAD_IDENTIFICADA = 'necesidad_identificada',
  PROPUESTA_ENVIADA = 'propuesta_enviada',
  NEGOCIACION = 'negociacion',
  APROBACION_INTERNA = 'aprobacion_interna',
  FIRMA_PENDIENTE = 'firma_pendiente',
  CERRADO_GANADO = 'cerrado_ganado',
  CERRADO_PERDIDO = 'cerrado_perdido'
}

export enum FiltroTiempo {
  HOY = 'hoy',
  ESTA_SEMANA = 'esta_semana',
  ESTE_MES = 'este_mes',
  ESTE_TRIMESTRE = 'este_trimestre',
  ESTE_AÑO = 'este_año',
  PERSONALIZADO = 'personalizado'
}

export interface FiltrosPipelineProps {
  ejecutivoId?: string;
  clienteId?: string;
  valorMinimo?: number;
  valorMaximo?: number;
  etapas?: EtapaPipeline[];
  fechaDesde?: Date;
  fechaHasta?: Date;
  filtroTiempo?: FiltroTiempo;
  soloVencimientosProximos?: boolean;
  diasVencimientos?: number;
}

export interface MetricasEtapaProps {
  etapa: EtapaPipeline;
  cantidadContratos: number;
  valorTotal: number;
  valorPromedio: number;
  tiempoPromedioEtapa: number; // días
  tasaConversion: number; // porcentaje
  tendencia: 'subiendo' | 'bajando' | 'estable';
  cambioSemanaAnterior: number; // porcentaje
}

export interface ContratoKanbanProps {
  id: string;
  nombre: string;
  cliente: string;
  ejecutivo: string;
  valor: number;
  etapaActual: EtapaPipeline;
  fechaCreacion: Date;
  fechaUltimaActividad: Date;
  fechaEstimadaCierre: Date;
  probabilidadCierre: number;
  diasEnEtapa: number;
  proximaAccion: string;
  urgencia: 'alta' | 'media' | 'baja';
  riesgo: 'alto' | 'medio' | 'bajo';
  metadatos?: Record<string, unknown>;
}

export interface PrediccionCierreProps {
  contratoId: string;
  probabilidadCierre: number;
  fechaEstimadaCierre: Date;
  valorEstimado: number;
  factoresPositivos: string[];
  factoresRiesgo: string[];
  recomendacionesAccion: string[];
  confianzaPrediccion: number;
}

export interface ObtenerPipelineVentasQueryProps {
  filtros?: FiltrosPipelineProps;
  incluirMetricasTiempoReal?: boolean;
  incluirPredicciones?: boolean;
  incluirComparacionHistorica?: boolean;
  formatoSalida?: 'kanban' | 'tabla' | 'resumen';
  limitePagina?: number;
  paginaActual?: number;
}

export class ObtenerPipelineVentasQuery {
  constructor(public readonly props: ObtenerPipelineVentasQueryProps) {}
}

export class ObtenerPipelineVentasQueryHandler {
  private static readonly ETAPAS_ORDENADAS = [
    EtapaPipeline.PROSPECTO,
    EtapaPipeline.CONTACTO_INICIAL,
    EtapaPipeline.NECESIDAD_IDENTIFICADA,
    EtapaPipeline.PROPUESTA_ENVIADA,
    EtapaPipeline.NEGOCIACION,
    EtapaPipeline.APROBACION_INTERNA,
    EtapaPipeline.FIRMA_PENDIENTE,
    EtapaPipeline.CERRADO_GANADO,
    EtapaPipeline.CERRADO_PERDIDO
  ];

  private static readonly TASAS_CONVERSION_PROMEDIO: Record<EtapaPipeline, number> = {
    [EtapaPipeline.PROSPECTO]: 25,
    [EtapaPipeline.CONTACTO_INICIAL]: 40,
    [EtapaPipeline.NECESIDAD_IDENTIFICADA]: 60,
    [EtapaPipeline.PROPUESTA_ENVIADA]: 75,
    [EtapaPipeline.NEGOCIACION]: 85,
    [EtapaPipeline.APROBACION_INTERNA]: 90,
    [EtapaPipeline.FIRMA_PENDIENTE]: 95,
    [EtapaPipeline.CERRADO_GANADO]: 100,
    [EtapaPipeline.CERRADO_PERDIDO]: 0
  };

  private static readonly TIEMPO_PROMEDIO_ETAPA: Record<EtapaPipeline, number> = {
    [EtapaPipeline.PROSPECTO]: 7,
    [EtapaPipeline.CONTACTO_INICIAL]: 3,
    [EtapaPipeline.NECESIDAD_IDENTIFICADA]: 5,
    [EtapaPipeline.PROPUESTA_ENVIADA]: 10,
    [EtapaPipeline.NEGOCIACION]: 14,
    [EtapaPipeline.APROBACION_INTERNA]: 7,
    [EtapaPipeline.FIRMA_PENDIENTE]: 5,
    [EtapaPipeline.CERRADO_GANADO]: 0,
    [EtapaPipeline.CERRADO_PERDIDO]: 0
  };

  async handle(query: ObtenerPipelineVentasQuery): Promise<{
    success: boolean;
    pipeline: {
      metricasGenerales: {
        totalContratos: number;
        valorTotalPipeline: number;
        valorPromedioContrato: number;
        tasaConversionGeneral: number;
        tiempoPromedioCierre: number;
        velocidadPipeline: number; // contratos/mes
      };
      metricasPorEtapa: MetricasEtapaProps[];
      contratosKanban: ContratoKanbanProps[];
      prediccionesCierre?: PrediccionCierreProps[];
      comparacionHistorica?: {
        periodoAnterior: string;
        cambioTotalContratos: number;
        cambioValorTotal: number;
        cambioTasaConversion: number;
        tendenciaGeneral: 'positiva' | 'negativa' | 'estable';
      };
      alertasUrgentes: Array<{
        tipo: 'vencimientos_proximo' | 'estancado' | 'riesgo_alto' | 'oportunidad';
        contratoId: string;
        mensaje: string;
        prioridad: 'alta' | 'media' | 'baja';
        accionRecomendada: string;
      }>;
    };
    metadatos: {
      fechaConsulta: Date;
      tiempoRespuesta: number;
      filtrosAplicados: FiltrosPipelineProps;
      totalRegistros: number;
      paginaActual: number;
      totalPaginas: number;
    };
  }> {
    const inicioConsulta = Date.now();

    try {
      // 1. Aplicar filtros y obtener contratos del pipeline
      const contratosFiltrados = await this.obtenerContratosPipeline(query.props.filtros);

      // 2. Calcular métricas generales
      const metricasGenerales = await this.calcularMetricasGenerales(contratosFiltrados);

      // 3. Calcular métricas por etapa con métricas en tiempo real
      const metricasPorEtapa = await this.calcularMetricasPorEtapa(
        contratosFiltrados,
        query.props.incluirMetricasTiempoReal !== false
      );

      // 4. Preparar datos para vista Kanban
      const contratosKanban = await this.prepararDatosKanban(
        contratosFiltrados,
        query.props.formatoSalida || 'kanban'
      );

      // 5. Generar predicciones de cierre si es solicitado
      let prediccionesCierre: PrediccionCierreProps[] | undefined;
      if (query.props.incluirPredicciones) {
        prediccionesCierre = await this.generarPrediccionesCierre(contratosFiltrados);
      }

      // 6. Comparar con histórico si es solicitado
      let comparacionHistorica;
      if (query.props.incluirComparacionHistorica) {
        comparacionHistorica = await this.compararConHistorico(
          contratosFiltrados,
          query.props.filtros
        );
      }

      // 7. Generar alertas urgentes
      const alertasUrgentes = await this.generarAlertasUrgentes(contratosFiltrados);

      // 8. Aplicar paginación
      const { contratosPaginados, metadatosPaginacion } = this.aplicarPaginacion(
        contratosKanban,
        query.props.limitePagina || 50,
        query.props.paginaActual || 1
      );

      const tiempoRespuesta = Date.now() - inicioConsulta;

      return {
        success: true,
        pipeline: {
          metricasGenerales,
          metricasPorEtapa,
          contratosKanban: contratosPaginados,
          prediccionesCierre,
          comparacionHistorica,
          alertasUrgentes
        },
        metadatos: {
          fechaConsulta: new Date(),
          tiempoRespuesta,
          filtrosAplicados: query.props.filtros || {},
          ...metadatosPaginacion
        }
      };

    } catch (error) {
      return {
        success: false,
        pipeline: {
          metricasGenerales: {
            totalContratos: 0,
            valorTotalPipeline: 0,
            valorPromedioContrato: 0,
            tasaConversionGeneral: 0,
            tiempoPromedioCierre: 0,
            velocidadPipeline: 0
          },
          metricasPorEtapa: [],
          contratosKanban: [],
          alertasUrgentes: []
        },
        metadatos: {
          fechaConsulta: new Date(),
          tiempoRespuesta: Date.now() - inicioConsulta,
          filtrosAplicados: query.props.filtros || {},
          totalRegistros: 0,
          paginaActual: 1,
          totalPaginas: 0
        }
      };
    }
  }

  private async obtenerContratosPipeline(filtros?: FiltrosPipelineProps): Promise<any[]> {
    // Simular obtención de contratos con filtros
    let contratos = await this.simularContratosPipeline();

    if (filtros) {
      // Aplicar filtros
      if (filtros.ejecutivoId) {
        contratos = contratos.filter(c => c.ejecutivoId === filtros.ejecutivoId);
      }

      if (filtros.clienteId) {
        contratos = contratos.filter(c => c.clienteId === filtros.clienteId);
      }

      if (filtros.valorMinimo) {
        contratos = contratos.filter(c => c.valor >= filtros.valorMinimo!);
      }

      if (filtros.valorMaximo) {
        contratos = contratos.filter(c => c.valor <= filtros.valorMaximo!);
      }

      if (filtros.etapas && filtros.etapas.length > 0) {
        contratos = contratos.filter(c => filtros.etapas!.includes(c.etapaActual));
      }

      if (filtros.soloVencimientosProximos) {
        const diasLimite = filtros.diasVencimientos || 7;
        const fechaLimite = new Date(Date.now() + diasLimite * 24 * 60 * 60 * 1000);
        contratos = contratos.filter(c => c.fechaEstimadaCierre <= fechaLimite);
      }

      // Aplicar filtro de tiempo
      if (filtros.filtroTiempo) {
        contratos = this.aplicarFiltroTiempo(contratos, filtros.filtroTiempo, filtros.fechaDesde, filtros.fechaHasta);
      }
    }

    return contratos;
  }

  private async calcularMetricasGenerales(contratos: unknown[]): Promise<unknown> {
    const totalContratos = contratos.length;
    const valorTotalPipeline = contratos.reduce((sum, c) => sum + c.valor, 0);
    const valorPromedioContrato = totalContratos > 0 ? valorTotalPipeline / totalContratos : 0;

    // Calcular tasa de conversión general
    const contratosGanados = contratos.filter(c => c.etapaActual === EtapaPipeline.CERRADO_GANADO).length;
    const contratosCerrados = contratos.filter(c => 
      c.etapaActual === EtapaPipeline.CERRADO_GANADO || c.etapaActual === EtapaPipeline.CERRADO_PERDIDO
    ).length;
    const tasaConversionGeneral = contratosCerrados > 0 ? (contratosGanados / contratosCerrados) * 100 : 0;

    // Calcular tiempo promedio de cierre
    const contratosConTiempo = contratos.filter(c => c.fechaCierre);
    const tiempoPromedioCierre = contratosConTiempo.length > 0 
      ? contratosConTiempo.reduce((sum, c) => {
          const dias = Math.floor((c.fechaCierre.getTime() - c.fechaCreacion.getTime()) / (1000 * 60 * 60 * 24));
          return sum + dias;
        }, 0) / contratosConTiempo.length
      : 0;

    // Calcular velocidad del pipeline (contratos cerrados por mes)
    const contratosUltimoMes = contratos.filter(c => {
      const unMesAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return c.fechaCierre && c.fechaCierre >= unMesAtras;
    });
    const velocidadPipeline = contratosUltimoMes.length;

    return {
      totalContratos,
      valorTotalPipeline,
      valorPromedioContrato: Math.round(valorPromedioContrato),
      tasaConversionGeneral: Math.round(tasaConversionGeneral * 100) / 100,
      tiempoPromedioCierre: Math.round(tiempoPromedioCierre),
      velocidadPipeline
    };
  }

  private async calcularMetricasPorEtapa(contratos: unknown[], tiempoReal: boolean): Promise<MetricasEtapaProps[]> {
    const metricasPorEtapa: MetricasEtapaProps[] = [];

    for (const etapa of ObtenerPipelineVentasQueryHandler.ETAPAS_ORDENADAS) {
      const contratosEtapa = contratos.filter(c => c.etapaActual === etapa);
      const cantidadContratos = contratosEtapa.length;
      const valorTotal = contratosEtapa.reduce((sum, c) => sum + c.valor, 0);
      const valorPromedio = cantidadContratos > 0 ? valorTotal / cantidadContratos : 0;

      // Calcular tiempo promedio en etapa
      const tiempoPromedioEtapa = cantidadContratos > 0
        ? contratosEtapa.reduce((sum, c) => sum + c.diasEnEtapa, 0) / cantidadContratos
        : ObtenerPipelineVentasQueryHandler.TIEMPO_PROMEDIO_ETAPA[etapa];

      // Obtener tasa de conversión (simulada o calculada)
      const tasaConversion = await this.calcularTasaConversionEtapa(etapa, contratos);

      // Calcular tendencia y cambio semanal
      const { tendencia, cambioSemanaAnterior } = await this.calcularTendenciaEtapa(etapa, tiempoReal);

      metricasPorEtapa.push({
        etapa,
        cantidadContratos,
        valorTotal,
        valorPromedio: Math.round(valorPromedio),
        tiempoPromedioEtapa: Math.round(tiempoPromedioEtapa),
        tasaConversion,
        tendencia,
        cambioSemanaAnterior
      });
    }

    return metricasPorEtapa;
  }

  private async prepararDatosKanban(contratos: unknown[], formato: string): Promise<ContratoKanbanProps[]> {
    const contratosKanban: ContratoKanbanProps[] = [];

    for (const contrato of contratos) {
      // Calcular urgencia basada en fecha estimada de cierre
      const diasHastaCierre = Math.floor(
        (contrato.fechaEstimadaCierre.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      
      let urgencia: 'alta' | 'media' | 'baja' = 'baja';
      if (diasHastaCierre <= 3) urgencia = 'alta';
      else if (diasHastaCierre <= 7) urgencia = 'media';

      // Calcular riesgo basado en tiempo en etapa y probabilidad
      let riesgo: 'alto' | 'medio' | 'bajo' = 'bajo';
      const tiempoEsperadoEtapa = ObtenerPipelineVentasQueryHandler.TIEMPO_PROMEDIO_ETAPA[contrato.etapaActual];
      
      if (contrato.diasEnEtapa > tiempoEsperadoEtapa * 2) riesgo = 'alto';
      else if (contrato.diasEnEtapa > tiempoEsperadoEtapa * 1.5) riesgo = 'medio';

      // Determinar próxima acción
      const proximaAccion = this.determinarProximaAccion(contrato.etapaActual, contrato.diasEnEtapa);

      contratosKanban.push({
        id: contrato.id,
        nombre: contrato.nombre,
        cliente: contrato.cliente,
        ejecutivo: contrato.ejecutivo,
        valor: contrato.valor,
        etapaActual: contrato.etapaActual,
        fechaCreacion: contrato.fechaCreacion,
        fechaUltimaActividad: contrato.fechaUltimaActividad,
        fechaEstimadaCierre: contrato.fechaEstimadaCierre,
        probabilidadCierre: contrato.probabilidadCierre,
        diasEnEtapa: contrato.diasEnEtapa,
        proximaAccion,
        urgencia,
        riesgo,
        metadatos: contrato.metadatos
      });
    }

    // Ordenar por urgencia y valor
    return contratosKanban.sort((a, b) => {
      const urgenciaOrder = { 'alta': 3, 'media': 2, 'baja': 1 };
      const urgenciaA = urgenciaOrder[a.urgencia];
      const urgenciaB = urgenciaOrder[b.urgencia];
      
      if (urgenciaA !== urgenciaB) return urgenciaB - urgenciaA;
      return b.valor - a.valor;
    });
  }

  private async generarPrediccionesCierre(contratos: unknown[]): Promise<PrediccionCierreProps[]> {
    const predicciones: PrediccionCierreProps[] = [];

    for (const contrato of contratos) {
      if (contrato.etapaActual === EtapaPipeline.CERRADO_GANADO || 
          contrato.etapaActual === EtapaPipeline.CERRADO_PERDIDO) {
        continue;
      }

      // Calcular probabilidad basada en etapa y factores
      const probabilidadBase = ObtenerPipelineVentasQueryHandler.TASAS_CONVERSION_PROMEDIO[contrato.etapaActual];
      let probabilidadAjustada = probabilidadBase;

      const factoresPositivos: string[] = [];
      const factoresRiesgo: string[] = [];
      const recomendacionesAccion: string[] = [];

      // Ajustar probabilidad por tiempo en etapa
      const tiempoEsperado = ObtenerPipelineVentasQueryHandler.TIEMPO_PROMEDIO_ETAPA[contrato.etapaActual];
      if (contrato.diasEnEtapa > tiempoEsperado * 2) {
        probabilidadAjustada *= 0.7;
        factoresRiesgo.push('Tiempo excesivo en etapa actual');
        recomendacionesAccion.push('Acelerar proceso de toma de decisión');
      } else if (contrato.diasEnEtapa < tiempoEsperado * 0.5) {
        probabilidadAjustada *= 1.1;
        factoresPositivos.push('Progreso rápido en pipeline');
      }

      // Ajustar por valor del contrato
      if (contrato.valor > 1000000) {
        probabilidadAjustada *= 0.9;
        factoresRiesgo.push('Contrato de alto valor requiere más aprobaciones');
        recomendacionesAccion.push('Involucrar decisores de alto nivel');
      }

      // Ajustar por actividad reciente
      const diasSinActividad = Math.floor(
        (Date.now() - contrato.fechaUltimaActividad.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (diasSinActividad > 14) {
        probabilidadAjustada *= 0.8;
        factoresRiesgo.push('Sin actividad reciente');
        recomendacionesAccion.push('Contactar cliente para reactivar proceso');
      } else if (diasSinActividad < 3) {
        probabilidadAjustada *= 1.05;
        factoresPositivos.push('Actividad reciente alta');
      }

      // Calcular fecha estimada de cierre
      const diasRestantes = ObtenerPipelineVentasQueryHandler.ETAPAS_ORDENADAS
        .slice(ObtenerPipelineVentasQueryHandler.ETAPAS_ORDENADAS.indexOf(contrato.etapaActual) + 1, -2)
        .reduce((sum, etapa) => sum + ObtenerPipelineVentasQueryHandler.TIEMPO_PROMEDIO_ETAPA[etapa], 0);

      const fechaEstimadaCierre = new Date(Date.now() + diasRestantes * 24 * 60 * 60 * 1000);

      // Calcular confianza de la predicción
      const confianzaPrediccion = Math.min(95, Math.max(50, 
        100 - (diasSinActividad * 2) - (Math.abs(contrato.diasEnEtapa - tiempoEsperado) * 3)
      ));

      predicciones.push({
        contratoId: contrato.id,
        probabilidadCierre: Math.round(probabilidadAjustada),
        fechaEstimadaCierre,
        valorEstimado: Math.round(contrato.valor * (probabilidadAjustada / 100)),
        factoresPositivos,
        factoresRiesgo,
        recomendacionesAccion,
        confianzaPrediccion: Math.round(confianzaPrediccion)
      });
    }

    return predicciones.sort((a, b) => b.probabilidadCierre - a.probabilidadCierre);
  }

  private async compararConHistorico(contratos: unknown[], filtros?: FiltrosPipelineProps): Promise<unknown> {
    // Simular comparación con período anterior
    const periodoAnterior = 'Mes anterior';
    
    // Simular datos del período anterior
    const datosAnteriores = {
      totalContratos: Math.floor(contratos.length * (0.8 + Math.random() * 0.4)),
      valorTotal: contratos.reduce((sum, c) => sum + c.valor, 0) * (0.7 + Math.random() * 0.6),
      tasaConversion: 65 + Math.random() * 20
    };

    const datosActuales = {
      totalContratos: contratos.length,
      valorTotal: contratos.reduce((sum, c) => sum + c.valor, 0),
      tasaConversion: 70 // Simulado
    };

    const cambioTotalContratos = ((datosActuales.totalContratos - datosAnteriores.totalContratos) / datosAnteriores.totalContratos) * 100;
    const cambioValorTotal = ((datosActuales.valorTotal - datosAnteriores.valorTotal) / datosAnteriores.valorTotal) * 100;
    const cambioTasaConversion = datosActuales.tasaConversion - datosAnteriores.tasaConversion;

    let tendenciaGeneral: 'positiva' | 'negativa' | 'estable' = 'estable';
    if (cambioTotalContratos > 5 && cambioValorTotal > 5) tendenciaGeneral = 'positiva';
    else if (cambioTotalContratos < -5 || cambioValorTotal < -5) tendenciaGeneral = 'negativa';

    return {
      periodoAnterior,
      cambioTotalContratos: Math.round(cambioTotalContratos * 100) / 100,
      cambioValorTotal: Math.round(cambioValorTotal * 100) / 100,
      cambioTasaConversion: Math.round(cambioTasaConversion * 100) / 100,
      tendenciaGeneral
    };
  }

  private async generarAlertasUrgentes(contratos: unknown[]): Promise<any[]> {
    const alertas: unknown[] = [];

    for (const contrato of contratos) {
      // Alerta por vencimientos próximo
      const diasHastaCierre = Math.floor(
        (contrato.fechaEstimadaCierre.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (diasHastaCierre <= 3 && diasHastaCierre > 0) {
        alertas.push({
          tipo: 'vencimientos_proximo',
          contratoId: contrato.id,
          mensaje: `Contrato ${contrato.nombre} vence en ${diasHastaCierre} días`,
          prioridad: 'alta',
          accionRecomendada: 'Contactar cliente urgentemente para acelerar cierre'
        });
      }

      // Alerta por contrato estancado
      const tiempoEsperado = ObtenerPipelineVentasQueryHandler.TIEMPO_PROMEDIO_ETAPA[contrato.etapaActual];
      if (contrato.diasEnEtapa > tiempoEsperado * 2) {
        alertas.push({
          tipo: 'estancado',
          contratoId: contrato.id,
          mensaje: `Contrato ${contrato.nombre} lleva ${contrato.diasEnEtapa} días en ${contrato.etapaActual}`,
          prioridad: 'media',
          accionRecomendada: 'Revisar obstáculos y acelerar proceso'
        });
      }

      // Alerta por alto riesgo
      if (contrato.probabilidadCierre < 30 && contrato.valor > 500000) {
        alertas.push({
          tipo: 'riesgo_alto',
          contratoId: contrato.id,
          mensaje: `Contrato de alto valor ${contrato.nombre} con baja probabilidad de cierre`,
          prioridad: 'alta',
          accionRecomendada: 'Intervención de gerencia para rescatar oportunidad'
        });
      }

      // Alerta por oportunidad
      if (contrato.probabilidadCierre > 80 && contrato.etapaActual === EtapaPipeline.NEGOCIACION) {
        alertas.push({
          tipo: 'oportunidad',
          contratoId: contrato.id,
          mensaje: `Oportunidad de cierre rápido para ${contrato.nombre}`,
          prioridad: 'media',
          accionRecomendada: 'Acelerar proceso de firma'
        });
      }
    }

    return alertas.sort((a, b) => {
      const prioridadOrder = { 'alta': 3, 'media': 2, 'baja': 1 };
      return prioridadOrder[b.prioridad] - prioridadOrder[a.prioridad];
    });
  }

  // Métodos de utilidad
  private aplicarFiltroTiempo(contratos: unknown[], filtroTiempo: FiltroTiempo, fechaDesde?: Date, fechaHasta?: Date): unknown[] {
    const ahora = new Date();
    let fechaInicio: Date;
    let fechaFin: Date = ahora;

    switch (filtroTiempo) {
      case FiltroTiempo.HOY:
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        break;
      case FiltroTiempo.ESTA_SEMANA:
        fechaInicio = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case FiltroTiempo.ESTE_MES:
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        break;
      case FiltroTiempo.ESTE_TRIMESTRE:
        const trimestre = Math.floor(ahora.getMonth() / 3);
        fechaInicio = new Date(ahora.getFullYear(), trimestre * 3, 1);
        break;
      case FiltroTiempo.ESTE_AÑO:
        fechaInicio = new Date(ahora.getFullYear(), 0, 1);
        break;
      case FiltroTiempo.PERSONALIZADO:
        fechaInicio = fechaDesde || new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
        fechaFin = fechaHasta || ahora;
        break;
      default:
        return contratos;
    }

    return contratos.filter(c => 
      c.fechaCreacion >= fechaInicio && c.fechaCreacion <= fechaFin
    );
  }

  private async calcularTasaConversionEtapa(etapa: EtapaPipeline, contratos: unknown[]): Promise<number> {
    // Simular cálculo de tasa de conversión real
    const tasaBase = ObtenerPipelineVentasQueryHandler.TASAS_CONVERSION_PROMEDIO[etapa];
    const variacion = (Math.random() - 0.5) * 10; // ±5%
    return Math.max(0, Math.min(100, tasaBase + variacion));
  }

  private async calcularTendenciaEtapa(etapa: EtapaPipeline, tiempoReal: boolean): Promise<{
    tendencia: 'subiendo' | 'bajando' | 'estable';
    cambioSemanaAnterior: number;
  }> {
    // Simular cálculo de tendencia
    const cambio = (Math.random() - 0.5) * 20; // ±10%
    
    let tendencia: 'subiendo' | 'bajando' | 'estable' = 'estable';
    if (cambio > 3) tendencia = 'subiendo';
    else if (cambio < -3) tendencia = 'bajando';

    return {
      tendencia,
      cambioSemanaAnterior: Math.round(cambio * 100) / 100
    };
  }

  private determinarProximaAccion(etapa: EtapaPipeline, diasEnEtapa: number): string {
    const acciones: Record<EtapaPipeline, string> = {
      [EtapaPipeline.PROSPECTO]: 'Realizar contacto inicial',
      [EtapaPipeline.CONTACTO_INICIAL]: 'Agendar reunión de descubrimiento',
      [EtapaPipeline.NECESIDAD_IDENTIFICADA]: 'Preparar propuesta comercial',
      [EtapaPipeline.PROPUESTA_ENVIADA]: 'Hacer seguimiento de propuesta',
      [EtapaPipeline.NEGOCIACION]: 'Cerrar términos finales',
      [EtapaPipeline.APROBACION_INTERNA]: 'Seguimiento con aprobadores',
      [EtapaPipeline.FIRMA_PENDIENTE]: 'Coordinar firma de contrato',
      [EtapaPipeline.CERRADO_GANADO]: 'Iniciar implementación',
      [EtapaPipeline.CERRADO_PERDIDO]: 'Analizar lecciones aprendidas'
    };

    let accion = acciones[etapa];
    
    // Ajustar acción si lleva mucho tiempo en la etapa
    const tiempoEsperado = ObtenerPipelineVentasQueryHandler.TIEMPO_PROMEDIO_ETAPA[etapa];
    if (diasEnEtapa > tiempoEsperado * 1.5) {
      accion = `URGENTE: ${accion}`;
    }

    return accion;
  }

  private aplicarPaginacion(contratos: ContratoKanbanProps[], limite: number, pagina: number): {
    contratosPaginados: ContratoKanbanProps[];
    metadatosPaginacion: {
      totalRegistros: number;
      paginaActual: number;
      totalPaginas: number;
    };
  } {
    const totalRegistros = contratos.length;
    const totalPaginas = Math.ceil(totalRegistros / limite);
    const inicio = (pagina - 1) * limite;
    const fin = inicio + limite;
    
    const contratosPaginados = contratos.slice(inicio, fin);

    return {
      contratosPaginados,
      metadatosPaginacion: {
        totalRegistros,
        paginaActual: pagina,
        totalPaginas
      }
    };
  }

  private async simularContratosPipeline(): Promise<any[]> {
    // Simular datos de contratos en pipeline
    const contratos: unknown[] = [];
    const etapas = ObtenerPipelineVentasQueryHandler.ETAPAS_ORDENADAS.slice(0, -2); // Excluir cerrados

    for (let i = 0; i < 50; i++) {
      const etapaActual = etapas[Math.floor(Math.random() * etapas.length)];
      const fechaCreacion = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
      const diasEnEtapa = Math.floor(Math.random() * 30) + 1;
      
      contratos.push({
        id: `contrato_${i + 1}`,
        nombre: `Contrato ${i + 1}`,
        cliente: `Cliente ${i + 1}`,
        ejecutivo: `Ejecutivo ${(i % 5) + 1}`,
        ejecutivoId: `exec_${(i % 5) + 1}`,
        clienteId: `cliente_${i + 1}`,
        valor: Math.floor(Math.random() * 2000000) + 100000,
        etapaActual,
        fechaCreacion,
        fechaUltimaActividad: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
        fechaEstimadaCierre: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000),
        probabilidadCierre: ObtenerPipelineVentasQueryHandler.TASAS_CONVERSION_PROMEDIO[etapaActual] + (Math.random() - 0.5) * 20,
        diasEnEtapa,
        fechaCierre: Math.random() > 0.7 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
        metadatos: {
          origen: Math.random() > 0.5 ? 'web' : 'referido',
          prioridad: Math.random() > 0.7 ? 'alta' : 'media'
        }
      });
    }

    return contratos;
  }
}