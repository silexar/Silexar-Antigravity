/**
 * SILEXAR PULSE QUANTUM - TIER 0 ENTERPRISE
 * Value Object: MetricasProducto
 * Nivel Fortune 10 - Gestión Empresarial Avanzada
 */

export interface MetricasRendimientoProps {
  impresiones: number;
  clics: number;
  conversiones: number;
  alcance: number;
  frecuencia: number;
  ctr: number; // Click Through Rate
  cpm: number; // Cost Per Mille
  cpc: number; // Cost Per Click
  cpa: number; // Cost Per Acquisition
  roas: number; // Return on Ad Spend
}

export interface MetricasAudienciaProps {
  audienciaTotal: number;
  audienciaObjetivo: number;
  demograficos: Record<string, number>;
  geograficos: Record<string, number>;
  intereses: Record<string, number>;
  dispositivos: Record<string, number>;
}

export interface MetricasTemporalesProps {
  fechaInicio: Date;
  fechaFin: Date;
  duracionTotal: number; // en días
  horasPico: number[];
  diasSemanaOptimos: number[];
  estacionalidad: Record<string, number>;
}

export interface MetricasProductoProps {
  id?: string;
  productoId: string;
  periodoInicio: Date;
  periodoFin: Date;
  rendimiento: MetricasRendimientoProps;
  audiencia: MetricasAudienciaProps;
  temporales: MetricasTemporalesProps;
  inversion: number;
  ingresoGenerado: number;
  margenBruto: number;
  satisfaccionCliente: number; // 1-10
  nps: number; // Net Promoter Score
  metadatos?: Record<string, unknown>;
  fechaActualizacion: Date;
}

export class MetricasProducto {
  private readonly _id: string;
  private readonly _productoId: string;
  private readonly _periodoInicio: Date;
  private readonly _periodoFin: Date;
  private readonly _rendimiento: MetricasRendimientoProps;
  private readonly _audiencia: MetricasAudienciaProps;
  private readonly _temporales: MetricasTemporalesProps;
  private readonly _inversion: number;
  private readonly _ingresoGenerado: number;
  private readonly _margenBruto: number;
  private readonly _satisfaccionCliente: number;
  private readonly _nps: number;
  private readonly _metadatos: Record<string, unknown>;
  private readonly _fechaActualizacion: Date;

  // Benchmarks empresariales Fortune 10
  private static readonly BENCHMARKS_INDUSTRIA = {
    CTR_PROMEDIO: 2.5,
    CPM_PROMEDIO: 15.0,
    CPC_PROMEDIO: 1.5,
    ROAS_MINIMO: 3.0,
    NPS_EXCELENTE: 70,
    SATISFACCION_MINIMA: 7.0
  };

  constructor(props: MetricasProductoProps) {
    this.validarPropiedades(props);

    this._id = props.id || this.generarId();
    this._productoId = props.productoId;
    this._periodoInicio = props.periodoInicio;
    this._periodoFin = props.periodoFin;
    this._rendimiento = props.rendimiento;
    this._audiencia = props.audiencia;
    this._temporales = props.temporales;
    this._inversion = props.inversion;
    this._ingresoGenerado = props.ingresoGenerado;
    this._margenBruto = props.margenBruto;
    this._satisfaccionCliente = props.satisfaccionCliente;
    this._nps = props.nps;
    this._metadatos = props.metadatos || {};
    this._fechaActualizacion = props.fechaActualizacion;
  }

  static create(
    productoId: string,
    periodoInicio: Date,
    periodoFin: Date,
    inversion: number,
    opciones?: Partial<Omit<MetricasProductoProps, 'productoId' | 'periodoInicio' | 'periodoFin' | 'inversion'>>
  ): MetricasProducto {
    return new MetricasProducto({
      productoId,
      periodoInicio,
      periodoFin,
      inversion,
      rendimiento: opciones?.rendimiento || MetricasProducto.crearRendimientoVacio(),
      audiencia: opciones?.audiencia || MetricasProducto.crearAudienciaVacia(),
      temporales: opciones?.temporales || MetricasProducto.crearTemporalesVacias(periodoInicio, periodoFin),
      ingresoGenerado: opciones?.ingresoGenerado || 0,
      margenBruto: opciones?.margenBruto || 0,
      satisfaccionCliente: opciones?.satisfaccionCliente || 0,
      nps: opciones?.nps || 0,
      fechaActualizacion: new Date(),
      ...opciones
    });
  }

  // Getters
  get id(): string { return this._id; }
  get productoId(): string { return this._productoId; }
  get periodoInicio(): Date { return this._periodoInicio; }
  get periodoFin(): Date { return this._periodoFin; }
  get rendimiento(): MetricasRendimientoProps { return { ...this._rendimiento }; }
  get audiencia(): MetricasAudienciaProps { return { ...this._audiencia }; }
  get temporales(): MetricasTemporalesProps { return { ...this._temporales }; }
  get inversion(): number { return this._inversion; }
  get ingresoGenerado(): number { return this._ingresoGenerado; }
  get margenBruto(): number { return this._margenBruto; }
  get satisfaccionCliente(): number { return this._satisfaccionCliente; }
  get nps(): number { return this._nps; }
  get metadatos(): Record<string, unknown> { return { ...this._metadatos }; }
  get fechaActualizacion(): Date { return this._fechaActualizacion; }

  /**
   * Calcula el ROI (Return on Investment)
   */
  calcularROI(): number {
    if (this._inversion === 0) return 0;
    return ((this._ingresoGenerado - this._inversion) / this._inversion) * 100;
  }

  /**
   * Calcula el ROAS (Return on Ad Spend)
   */
  calcularROAS(): number {
    if (this._inversion === 0) return 0;
    return this._ingresoGenerado / this._inversion;
  }

  /**
   * Calcula la eficiencia de conversión
   */
  calcularEficienciaConversion(): number {
    if (this._rendimiento.clics === 0) return 0;
    return (this._rendimiento.conversiones / this._rendimiento.clics) * 100;
  }

  /**
   * Calcula el costo por conversión
   */
  calcularCostoPorConversion(): number {
    if (this._rendimiento.conversiones === 0) return 0;
    return this._inversion / this._rendimiento.conversiones;
  }

  /**
   * Evalúa el rendimiento general del producto
   */
  evaluarRendimientoGeneral(): {
    puntuacion: number;
    nivel: 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'DEFICIENTE';
    areas_mejora: string[];
    fortalezas: string[];
  } {
    const puntuaciones: number[] = [];
    const areasMejora: string[] = [];
    const fortalezas: string[] = [];

    // Evaluar CTR
    const ctrScore = this.evaluarMetrica(
      this._rendimiento.ctr,
      MetricasProducto.BENCHMARKS_INDUSTRIA.CTR_PROMEDIO,
      'CTR',
      areasMejora,
      fortalezas
    );
    puntuaciones.push(ctrScore);

    // Evaluar ROAS
    const roasScore = this.evaluarMetrica(
      this.calcularROAS(),
      MetricasProducto.BENCHMARKS_INDUSTRIA.ROAS_MINIMO,
      'ROAS',
      areasMejora,
      fortalezas
    );
    puntuaciones.push(roasScore);

    // Evaluar NPS
    const npsScore = this.evaluarMetrica(
      this._nps,
      MetricasProducto.BENCHMARKS_INDUSTRIA.NPS_EXCELENTE,
      'NPS',
      areasMejora,
      fortalezas
    );
    puntuaciones.push(npsScore);

    // Evaluar satisfacción del cliente
    const satisfaccionScore = this.evaluarMetrica(
      this._satisfaccionCliente,
      MetricasProducto.BENCHMARKS_INDUSTRIA.SATISFACCION_MINIMA,
      'Satisfacción',
      areasMejora,
      fortalezas
    );
    puntuaciones.push(satisfaccionScore);

    const puntuacionPromedio = puntuaciones.reduce((sum, score) => sum + score, 0) / puntuaciones.length;

    let nivel: 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'DEFICIENTE';
    if (puntuacionPromedio >= 90) nivel = 'EXCELENTE';
    else if (puntuacionPromedio >= 75) nivel = 'BUENO';
    else if (puntuacionPromedio >= 60) nivel = 'REGULAR';
    else nivel = 'DEFICIENTE';

    return {
      puntuacion: Math.round(puntuacionPromedio),
      nivel,
      areas_mejora: areasMejora,
      fortalezas
    };
  }

  /**
   * Compara con benchmarks de la industria
   */
  compararConBenchmarks(): {
    ctr: { valor: number; benchmark: number; diferencia: number; estado: string };
    cpm: { valor: number; benchmark: number; diferencia: number; estado: string };
    roas: { valor: number; benchmark: number; diferencia: number; estado: string };
    nps: { valor: number; benchmark: number; diferencia: number; estado: string };
  } {
    return {
      ctr: this.compararMetrica(this._rendimiento.ctr, MetricasProducto.BENCHMARKS_INDUSTRIA.CTR_PROMEDIO),
      cpm: this.compararMetrica(this._rendimiento.cpm, MetricasProducto.BENCHMARKS_INDUSTRIA.CPM_PROMEDIO, false),
      roas: this.compararMetrica(this.calcularROAS(), MetricasProducto.BENCHMARKS_INDUSTRIA.ROAS_MINIMO),
      nps: this.compararMetrica(this._nps, MetricasProducto.BENCHMARKS_INDUSTRIA.NPS_EXCELENTE)
    };
  }

  /**
   * Genera recomendaciones de optimización
   */
  generarRecomendacionesOptimizacion(): string[] {
    const recomendaciones: string[] = [];

    // Análisis de CTR
    if (this._rendimiento.ctr < MetricasProducto.BENCHMARKS_INDUSTRIA.CTR_PROMEDIO) {
      recomendaciones.push('Optimizar creativos para mejorar CTR - considerar A/B testing');
    }

    // Análisis de ROAS
    if (this.calcularROAS() < MetricasProducto.BENCHMARKS_INDUSTRIA.ROAS_MINIMO) {
      recomendaciones.push('Revisar estrategia de targeting para mejorar ROAS');
    }

    // Análisis de audiencia
    const cobertura = (this._audiencia.audienciaObjetivo / this._audiencia.audienciaTotal) * 100;
    if (cobertura < 70) {
      recomendaciones.push('Mejorar segmentación de audiencia objetivo');
    }

    // Análisis temporal
    if (this._temporales.horasPico.length < 3) {
      recomendaciones.push('Identificar más horarios pico para optimizar scheduling');
    }

    // Análisis de satisfacción
    if (this._satisfaccionCliente < MetricasProducto.BENCHMARKS_INDUSTRIA.SATISFACCION_MINIMA) {
      recomendaciones.push('Implementar mejoras en experiencia del cliente');
    }

    // Análisis de NPS
    if (this._nps < MetricasProducto.BENCHMARKS_INDUSTRIA.NPS_EXCELENTE) {
      recomendaciones.push('Desarrollar programa de fidelización de clientes');
    }

    return recomendaciones;
  }

  /**
   * Calcula tendencias comparando con período anterior
   */
  calcularTendencias(metricsAnteriores: MetricasProducto): {
    roi: { actual: number; anterior: number; tendencia: number };
    roas: { actual: number; anterior: number; tendencia: number };
    ctr: { actual: number; anterior: number; tendencia: number };
    satisfaccion: { actual: number; anterior: number; tendencia: number };
  } {
    return {
      roi: {
        actual: this.calcularROI(),
        anterior: metricsAnteriores.calcularROI(),
        tendencia: this.calcularCambioPortcentual(this.calcularROI(), metricsAnteriores.calcularROI())
      },
      roas: {
        actual: this.calcularROAS(),
        anterior: metricsAnteriores.calcularROAS(),
        tendencia: this.calcularCambioPortcentual(this.calcularROAS(), metricsAnteriores.calcularROAS())
      },
      ctr: {
        actual: this._rendimiento.ctr,
        anterior: metricsAnteriores._rendimiento.ctr,
        tendencia: this.calcularCambioPortcentual(this._rendimiento.ctr, metricsAnteriores._rendimiento.ctr)
      },
      satisfaccion: {
        actual: this._satisfaccionCliente,
        anterior: metricsAnteriores._satisfaccionCliente,
        tendencia: this.calcularCambioPortcentual(this._satisfaccionCliente, metricsAnteriores._satisfaccionCliente)
      }
    };
  }

  /**
   * Métodos de utilidad privados
   */
  private evaluarMetrica(
    valor: number,
    benchmark: number,
    nombreMetrica: string,
    areasMejora: string[],
    fortalezas: string[]
  ): number {
    const ratio = valor / benchmark;
    
    if (ratio >= 1.2) {
      fortalezas.push(`${nombreMetrica} supera benchmark en ${Math.round((ratio - 1) * 100)}%`);
      return 100;
    } else if (ratio >= 1.0) {
      fortalezas.push(`${nombreMetrica} cumple con benchmark`);
      return 85;
    } else if (ratio >= 0.8) {
      return 70;
    } else {
      areasMejora.push(`${nombreMetrica} está ${Math.round((1 - ratio) * 100)}% por debajo del benchmark`);
      return 50;
    }
  }

  private compararMetrica(valor: number, benchmark: number, mayorEsMejor: boolean = true): {
    valor: number;
    benchmark: number;
    diferencia: number;
    estado: string;
  } {
    const diferencia = ((valor - benchmark) / benchmark) * 100;
    let estado: string;

    if (mayorEsMejor) {
      estado = diferencia > 0 ? 'SUPERIOR' : diferencia < -10 ? 'INFERIOR' : 'NORMAL';
    } else {
      estado = diferencia < 0 ? 'SUPERIOR' : diferencia > 10 ? 'INFERIOR' : 'NORMAL';
    }

    return { valor, benchmark, diferencia: Math.round(diferencia), estado };
  }

  private calcularCambioPortcentual(actual: number, anterior: number): number {
    if (anterior === 0) return 0;
    return ((actual - anterior) / anterior) * 100;
  }

  private static crearRendimientoVacio(): MetricasRendimientoProps {
    return {
      impresiones: 0,
      clics: 0,
      conversiones: 0,
      alcance: 0,
      frecuencia: 0,
      ctr: 0,
      cpm: 0,
      cpc: 0,
      cpa: 0,
      roas: 0
    };
  }

  private static crearAudienciaVacia(): MetricasAudienciaProps {
    return {
      audienciaTotal: 0,
      audienciaObjetivo: 0,
      demograficos: {},
      geograficos: {},
      intereses: {},
      dispositivos: {}
    };
  }

  private static crearTemporalesVacias(inicio: Date, fin: Date): MetricasTemporalesProps {
    const duracion = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    return {
      fechaInicio: inicio,
      fechaFin: fin,
      duracionTotal: duracion,
      horasPico: [],
      diasSemanaOptimos: [],
      estacionalidad: {}
    };
  }

  private validarPropiedades(props: MetricasProductoProps): void {
    if (!props.productoId) {
      throw new Error('El ID del producto es requerido');
    }

    if (props.periodoFin <= props.periodoInicio) {
      throw new Error('El período de fin debe ser posterior al período de inicio');
    }

    if (props.inversion < 0) {
      throw new Error('La inversión no puede ser negativa');
    }

    if (props.satisfaccionCliente < 0 || props.satisfaccionCliente > 10) {
      throw new Error('La satisfacción del cliente debe estar entre 0 y 10');
    }

    if (props.nps < -100 || props.nps > 100) {
      throw new Error('El NPS debe estar entre -100 y 100');
    }
  }

  private generarId(): string {
    return `metrics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  equals(other: MetricasProducto): boolean {
    return this._id === other._id;
  }

  toString(): string {
    return `Métricas ${this._productoId} (ROI: ${this.calcularROI().toFixed(2)}%)`;
  }

  toSnapshot(): Record<string, unknown> {
    return {
      id: this._id,
      productoId: this._productoId,
      periodoInicio: this._periodoInicio.toISOString(),
      periodoFin: this._periodoFin.toISOString(),
      rendimiento: this._rendimiento,
      audiencia: this._audiencia,
      temporales: {
        ...this._temporales,
        fechaInicio: this._temporales.fechaInicio.toISOString(),
        fechaFin: this._temporales.fechaFin.toISOString()
      },
      inversion: this._inversion,
      ingresoGenerado: this._ingresoGenerado,
      margenBruto: this._margenBruto,
      satisfaccionCliente: this._satisfaccionCliente,
      nps: this._nps,
      metadatos: this._metadatos,
      fechaActualizacion: this._fechaActualizacion.toISOString()
    };
  }
}