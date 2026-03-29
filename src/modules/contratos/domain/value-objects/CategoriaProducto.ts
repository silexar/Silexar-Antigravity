/**
 * SILEXAR PULSE QUANTUM - TIER 0 ENTERPRISE
 * Value Object: CategoriaProducto
 * Nivel Fortune 10 - Gestión Empresarial Avanzada
 */

export enum TipoCategoria {
  RADIO = 'radio',
  TELEVISION = 'television',
  DIGITAL = 'digital',
  STREAMING = 'streaming',
  PODCAST = 'podcast',
  OUTDOOR = 'outdoor',
  PRINT = 'print',
  EVENTO = 'evento',
  PATROCINIO = 'patrocinio',
  BRANDED_CONTENT = 'branded_content'
}

export enum NivelCategoria {
  PREMIUM = 'premium',
  STANDARD = 'standard',
  BASICO = 'basico',
  PROMOCIONAL = 'promocional'
}

export interface CategoriaProductoProps {
  tipo: TipoCategoria;
  nivel: NivelCategoria;
  descripcion: string;
  codigoInterno?: string;
  multiplicadorPrecio: number;
  requiereAprobacionEspecial: boolean;
  diasMinimosPauta: number;
  diasMaximosPauta: number;
  audienciaObjetivo?: string[];
  restriccionesHorario?: string[];
  metadatos?: Record<string, unknown>;
}

export class CategoriaProducto {
  private readonly _tipo: TipoCategoria;
  private readonly _nivel: NivelCategoria;
  private readonly _descripcion: string;
  private readonly _codigoInterno: string;
  private readonly _multiplicadorPrecio: number;
  private readonly _requiereAprobacionEspecial: boolean;
  private readonly _diasMinimosPauta: number;
  private readonly _diasMaximosPauta: number;
  private readonly _audienciaObjetivo: string[];
  private readonly _restriccionesHorario: string[];
  private readonly _metadatos: Record<string, unknown>;

  // Configuraciones empresariales Fortune 10
  private static readonly MULTIPLICADORES_BASE: Record<TipoCategoria, number> = {
    [TipoCategoria.RADIO]: 1.0,
    [TipoCategoria.TELEVISION]: 2.5,
    [TipoCategoria.DIGITAL]: 1.8,
    [TipoCategoria.STREAMING]: 2.2,
    [TipoCategoria.PODCAST]: 1.3,
    [TipoCategoria.OUTDOOR]: 1.5,
    [TipoCategoria.PRINT]: 0.8,
    [TipoCategoria.EVENTO]: 3.0,
    [TipoCategoria.PATROCINIO]: 2.8,
    [TipoCategoria.BRANDED_CONTENT]: 3.5
  };

  private static readonly MULTIPLICADORES_NIVEL: Record<NivelCategoria, number> = {
    [NivelCategoria.PREMIUM]: 2.0,
    [NivelCategoria.STANDARD]: 1.0,
    [NivelCategoria.BASICO]: 0.7,
    [NivelCategoria.PROMOCIONAL]: 0.5
  };

  private static readonly APROBACION_ESPECIAL_REQUERIDA: TipoCategoria[] = [
    TipoCategoria.EVENTO,
    TipoCategoria.PATROCINIO,
    TipoCategoria.BRANDED_CONTENT
  ];

  constructor(props: CategoriaProductoProps) {
    this.validarPropiedades(props);

    this._tipo = props.tipo;
    this._nivel = props.nivel;
    this._descripcion = props.descripcion;
    this._codigoInterno = props.codigoInterno || this.generarCodigoInterno();
    this._multiplicadorPrecio = props.multiplicadorPrecio;
    this._requiereAprobacionEspecial = props.requiereAprobacionEspecial;
    this._diasMinimosPauta = props.diasMinimosPauta;
    this._diasMaximosPauta = props.diasMaximosPauta;
    this._audienciaObjetivo = props.audienciaObjetivo || [];
    this._restriccionesHorario = props.restriccionesHorario || [];
    this._metadatos = props.metadatos || {};
  }

  static create(
    tipo: TipoCategoria,
    nivel: NivelCategoria,
    descripcion: string,
    opciones?: Partial<Omit<CategoriaProductoProps, 'tipo' | 'nivel' | 'descripcion'>>
  ): CategoriaProducto {
    const multiplicadorBase = CategoriaProducto.MULTIPLICADORES_BASE[tipo];
    const multiplicadorNivel = CategoriaProducto.MULTIPLICADORES_NIVEL[nivel];
    const multiplicadorFinal = multiplicadorBase * multiplicadorNivel;

    return new CategoriaProducto({
      tipo,
      nivel,
      descripcion,
      multiplicadorPrecio: opciones?.multiplicadorPrecio || multiplicadorFinal,
      requiereAprobacionEspecial: opciones?.requiereAprobacionEspecial ?? 
        CategoriaProducto.APROBACION_ESPECIAL_REQUERIDA.includes(tipo),
      diasMinimosPauta: opciones?.diasMinimosPauta || CategoriaProducto.getDiasMinimosPorTipo(tipo),
      diasMaximosPauta: opciones?.diasMaximosPauta || CategoriaProducto.getDiasMaximosPorTipo(tipo),
      ...opciones
    });
  }

  // Getters
  get tipo(): TipoCategoria { return this._tipo; }
  get nivel(): NivelCategoria { return this._nivel; }
  get descripcion(): string { return this._descripcion; }
  get codigoInterno(): string { return this._codigoInterno; }
  get multiplicadorPrecio(): number { return this._multiplicadorPrecio; }
  get requiereAprobacionEspecial(): boolean { return this._requiereAprobacionEspecial; }
  get diasMinimosPauta(): number { return this._diasMinimosPauta; }
  get diasMaximosPauta(): number { return this._diasMaximosPauta; }
  get audienciaObjetivo(): string[] { return [...this._audienciaObjetivo]; }
  get restriccionesHorario(): string[] { return [...this._restriccionesHorario]; }
  get metadatos(): Record<string, unknown> { return { ...this._metadatos }; }

  /**
   * Calcula el precio base aplicando el multiplicador
   */
  calcularPrecioBase(precioReferencia: number): number {
    return precioReferencia * this._multiplicadorPrecio;
  }

  /**
   * Verifica si la categoría es compatible con otra
   */
  esCompatibleCon(otraCategoria: CategoriaProducto): boolean {
    // Lógica de compatibilidad empresarial
    const categoriasIncompatibles: Record<TipoCategoria, TipoCategoria[]> = {
      [TipoCategoria.RADIO]: [TipoCategoria.TELEVISION],
      [TipoCategoria.TELEVISION]: [TipoCategoria.RADIO],
      [TipoCategoria.DIGITAL]: [],
      [TipoCategoria.STREAMING]: [],
      [TipoCategoria.PODCAST]: [TipoCategoria.RADIO],
      [TipoCategoria.OUTDOOR]: [],
      [TipoCategoria.PRINT]: [],
      [TipoCategoria.EVENTO]: [TipoCategoria.PATROCINIO],
      [TipoCategoria.PATROCINIO]: [TipoCategoria.EVENTO],
      [TipoCategoria.BRANDED_CONTENT]: []
    };

    const incompatibles = categoriasIncompatibles[this._tipo] || [];
    return !incompatibles.includes(otraCategoria._tipo);
  }

  /**
   * Verifica si la duración de pauta es válida
   */
  validarDuracionPauta(dias: number): boolean {
    return dias >= this._diasMinimosPauta && dias <= this._diasMaximosPauta;
  }

  /**
   * Obtiene las restricciones aplicables para una fecha/hora
   */
  getRestriccionesParaFecha(fecha: Date): string[] {
    const restriccionesAplicables: string[] = [];
    const hora = fecha.getHours();
    const diaSemana = fecha.getDay();

    // Aplicar restricciones por horario
    this._restriccionesHorario.forEach(restriccion => {
      if (this.evaluarRestriccionHorario(restriccion, hora, diaSemana)) {
        restriccionesAplicables.push(restriccion);
      }
    });

    return restriccionesAplicables;
  }

  /**
   * Calcula el nivel de prioridad para scheduling
   */
  calcularPrioridadScheduling(): number {
    let prioridad = 0;

    // Prioridad por tipo
    const prioridadesTipo: Record<TipoCategoria, number> = {
      [TipoCategoria.EVENTO]: 10,
      [TipoCategoria.PATROCINIO]: 9,
      [TipoCategoria.BRANDED_CONTENT]: 8,
      [TipoCategoria.TELEVISION]: 7,
      [TipoCategoria.STREAMING]: 6,
      [TipoCategoria.DIGITAL]: 5,
      [TipoCategoria.RADIO]: 4,
      [TipoCategoria.PODCAST]: 3,
      [TipoCategoria.OUTDOOR]: 2,
      [TipoCategoria.PRINT]: 1
    };

    prioridad += prioridadesTipo[this._tipo];

    // Prioridad por nivel
    const prioridadesNivel: Record<NivelCategoria, number> = {
      [NivelCategoria.PREMIUM]: 4,
      [NivelCategoria.STANDARD]: 3,
      [NivelCategoria.BASICO]: 2,
      [NivelCategoria.PROMOCIONAL]: 1
    };

    prioridad += prioridadesNivel[this._nivel];

    return prioridad;
  }

  /**
   * Genera recomendaciones de optimización
   */
  generarRecomendacionesOptimizacion(): string[] {
    const recomendaciones: string[] = [];

    if (this._nivel === NivelCategoria.PROMOCIONAL) {
      recomendaciones.push('Considerar upgrade a nivel Standard para mejor performance');
    }

    if (this._diasMinimosPauta < 7) {
      recomendaciones.push('Extender duración mínima para mejor impacto');
    }

    if (this._audienciaObjetivo.length === 0) {
      recomendaciones.push('Definir audiencia objetivo para mejor segmentación');
    }

    if (this._restriccionesHorario.length > 5) {
      recomendaciones.push('Simplificar restricciones horarias para mayor flexibilidad');
    }

    return recomendaciones;
  }

  /**
   * Métodos estáticos de utilidad
   */
  private static getDiasMinimosPorTipo(tipo: TipoCategoria): number {
    const diasMinimos: Record<TipoCategoria, number> = {
      [TipoCategoria.RADIO]: 7,
      [TipoCategoria.TELEVISION]: 14,
      [TipoCategoria.DIGITAL]: 3,
      [TipoCategoria.STREAMING]: 7,
      [TipoCategoria.PODCAST]: 7,
      [TipoCategoria.OUTDOOR]: 30,
      [TipoCategoria.PRINT]: 1,
      [TipoCategoria.EVENTO]: 1,
      [TipoCategoria.PATROCINIO]: 30,
      [TipoCategoria.BRANDED_CONTENT]: 14
    };
    return diasMinimos[tipo];
  }

  private static getDiasMaximosPorTipo(tipo: TipoCategoria): number {
    const diasMaximos: Record<TipoCategoria, number> = {
      [TipoCategoria.RADIO]: 365,
      [TipoCategoria.TELEVISION]: 365,
      [TipoCategoria.DIGITAL]: 180,
      [TipoCategoria.STREAMING]: 365,
      [TipoCategoria.PODCAST]: 365,
      [TipoCategoria.OUTDOOR]: 365,
      [TipoCategoria.PRINT]: 30,
      [TipoCategoria.EVENTO]: 7,
      [TipoCategoria.PATROCINIO]: 365,
      [TipoCategoria.BRANDED_CONTENT]: 180
    };
    return diasMaximos[tipo];
  }

  private evaluarRestriccionHorario(restriccion: string, hora: number, diaSemana: number): boolean {
    // Implementación simplificada - en producción sería más compleja
    if (restriccion.includes('prime-time') && (hora < 19 || hora > 23)) {
      return true;
    }
    if (restriccion.includes('weekend') && (diaSemana === 0 || diaSemana === 6)) {
      return true;
    }
    return false;
  }

  private generarCodigoInterno(): string {
    const tipoCode = this._tipo.substring(0, 3).toUpperCase();
    const nivelCode = this._nivel.substring(0, 2).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${tipoCode}-${nivelCode}-${timestamp}`;
  }

  private validarPropiedades(props: CategoriaProductoProps): void {
    if (!props.descripcion || props.descripcion.trim().length === 0) {
      throw new Error('La descripción es requerida');
    }

    if (props.multiplicadorPrecio <= 0) {
      throw new Error('El multiplicador de precio debe ser mayor a 0');
    }

    if (props.diasMinimosPauta < 0) {
      throw new Error('Los días mínimos de pauta no pueden ser negativos');
    }

    if (props.diasMaximosPauta < props.diasMinimosPauta) {
      throw new Error('Los días máximos deben ser mayores o iguales a los días mínimos');
    }
  }

  equals(other: CategoriaProducto): boolean {
    return this._tipo === other._tipo && 
           this._nivel === other._nivel &&
           this._codigoInterno === other._codigoInterno;
  }

  toString(): string {
    return `${this._tipo}-${this._nivel}`;
  }

  toSnapshot(): Record<string, unknown> {
    return {
      tipo: this._tipo,
      nivel: this._nivel,
      descripcion: this._descripcion,
      codigoInterno: this._codigoInterno,
      multiplicadorPrecio: this._multiplicadorPrecio,
      requiereAprobacionEspecial: this._requiereAprobacionEspecial,
      diasMinimosPauta: this._diasMinimosPauta,
      diasMaximosPauta: this._diasMaximosPauta,
      audienciaObjetivo: this._audienciaObjetivo,
      restriccionesHorario: this._restriccionesHorario,
      metadatos: this._metadatos
    };
  }
}