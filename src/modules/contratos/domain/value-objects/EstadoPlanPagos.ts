/**
 * SILEXAR PULSE QUANTUM - TIER 0 ENTERPRISE
 * Value Object: EstadoPlanPagos
 * Nivel Fortune 10 - Gestión Empresarial Avanzada
 */

export enum EstadoPlanPagosEnum {
  ACTIVO = 'activo',
  PAUSADO = 'pausado',
  COMPLETADO = 'completado',
  VENCIDO = 'vencido',
  CANCELADO = 'cancelado'
}

export interface EstadoPlanPagosProps {
  estado: EstadoPlanPagosEnum;
  fechaCambio: Date;
  motivoCambio?: string;
  usuarioResponsable?: string;
}

export class EstadoPlanPagos {
  private readonly _estado: EstadoPlanPagosEnum;
  private readonly _fechaCambio: Date;
  private readonly _motivoCambio?: string;
  private readonly _usuarioResponsable?: string;

  private static readonly TRANSICIONES_VALIDAS: Map<EstadoPlanPagosEnum, EstadoPlanPagosEnum[]> = new Map([
    [EstadoPlanPagosEnum.ACTIVO, [EstadoPlanPagosEnum.PAUSADO, EstadoPlanPagosEnum.COMPLETADO, EstadoPlanPagosEnum.VENCIDO, EstadoPlanPagosEnum.CANCELADO]],
    [EstadoPlanPagosEnum.PAUSADO, [EstadoPlanPagosEnum.ACTIVO, EstadoPlanPagosEnum.CANCELADO]],
    [EstadoPlanPagosEnum.COMPLETADO, []],
    [EstadoPlanPagosEnum.VENCIDO, [EstadoPlanPagosEnum.ACTIVO, EstadoPlanPagosEnum.CANCELADO]],
    [EstadoPlanPagosEnum.CANCELADO, []]
  ]);

  constructor(props: EstadoPlanPagosProps) {
    this._estado = props.estado;
    this._fechaCambio = props.fechaCambio;
    this._motivoCambio = props.motivoCambio;
    this._usuarioResponsable = props.usuarioResponsable;
  }

  static create(estado: EstadoPlanPagosEnum, motivoCambio?: string, usuarioResponsable?: string): EstadoPlanPagos {
    return new EstadoPlanPagos({
      estado,
      fechaCambio: new Date(),
      motivoCambio,
      usuarioResponsable
    });
  }

  get estado(): EstadoPlanPagosEnum {
    return this._estado;
  }

  get fechaCambio(): Date {
    return this._fechaCambio;
  }

  get motivoCambio(): string | undefined {
    return this._motivoCambio;
  }

  get usuarioResponsable(): string | undefined {
    return this._usuarioResponsable;
  }

  /**
   * Verifica si el plan requiere acción inmediata
   */
  requiereAccion(): boolean {
    return this._estado === EstadoPlanPagosEnum.VENCIDO || 
           this._estado === EstadoPlanPagosEnum.PAUSADO;
  }

  /**
   * Verifica si el plan está activo
   */
  esActivo(): boolean {
    return this._estado === EstadoPlanPagosEnum.ACTIVO;
  }

  /**
   * Verifica si el plan está finalizado
   */
  esFinalizado(): boolean {
    return this._estado === EstadoPlanPagosEnum.COMPLETADO || 
           this._estado === EstadoPlanPagosEnum.CANCELADO;
  }

  /**
   * Verifica si es posible transicionar a un nuevo estado
   */
  puedeTransicionarA(nuevoEstado: EstadoPlanPagosEnum): boolean {
    const transicionesPermitidas = EstadoPlanPagos.TRANSICIONES_VALIDAS.get(this._estado);
    return transicionesPermitidas?.includes(nuevoEstado) ?? false;
  }

  /**
   * Obtiene los estados válidos para transición
   */
  getEstadosValidosParaTransicion(): EstadoPlanPagosEnum[] {
    return EstadoPlanPagos.TRANSICIONES_VALIDAS.get(this._estado) ?? [];
  }

  /**
   * Crea una nueva instancia con estado actualizado
   */
  transicionarA(nuevoEstado: EstadoPlanPagosEnum, motivoCambio?: string, usuarioResponsable?: string): EstadoPlanPagos {
    if (!this.puedeTransicionarA(nuevoEstado)) {
      throw new Error(`Transición inválida de ${this._estado} a ${nuevoEstado}`);
    }

    return EstadoPlanPagos.create(nuevoEstado, motivoCambio, usuarioResponsable);
  }

  /**
   * Obtiene el nivel de prioridad del estado
   */
  getNivelPrioridad(): number {
    const prioridades: Record<EstadoPlanPagosEnum, number> = {
      [EstadoPlanPagosEnum.VENCIDO]: 5,
      [EstadoPlanPagosEnum.PAUSADO]: 4,
      [EstadoPlanPagosEnum.ACTIVO]: 3,
      [EstadoPlanPagosEnum.COMPLETADO]: 2,
      [EstadoPlanPagosEnum.CANCELADO]: 1
    };
    return prioridades[this._estado];
  }

  equals(other: EstadoPlanPagos): boolean {
    return this._estado === other._estado;
  }

  toString(): string {
    return this._estado;
  }

  toSnapshot(): Record<string, unknown> {
    return {
      estado: this._estado,
      fechaCambio: this._fechaCambio.toISOString(),
      motivoCambio: this._motivoCambio,
      usuarioResponsable: this._usuarioResponsable
    };
  }
}