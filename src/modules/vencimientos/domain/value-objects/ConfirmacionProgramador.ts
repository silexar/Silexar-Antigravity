/**
 * VALUE OBJECT: CONFIRMACIÓN DE PROGRAMADOR - TIER 0 ENTERPRISE
 *
 * @description Estado de confirmación manual del programador de tráfico
 * para inicio/fin de auspicios con timestamp, comentarios y tracking.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

export type EstadoConfirmacion = 'pendiente' | 'confirmado' | 'rechazado' | 'pospuesto'

export interface ConfirmacionProgramadorProps {
  estado: EstadoConfirmacion
  programadorId: string
  programadorNombre: string
  fechaDecision?: Date
  comentario?: string
  fechaPospuesto?: Date
}

export class ConfirmacionProgramador {
  private constructor(
    private readonly _estado: EstadoConfirmacion,
    private readonly _programadorId: string,
    private readonly _programadorNombre: string,
    private readonly _fechaDecision: Date | undefined,
    private readonly _comentario: string | undefined,
    private readonly _fechaPospuesto: Date | undefined
  ) {}

  static pendiente(programadorId: string, programadorNombre: string): ConfirmacionProgramador {
    return new ConfirmacionProgramador('pendiente', programadorId, programadorNombre, undefined, undefined, undefined)
  }

  static create(props: ConfirmacionProgramadorProps): ConfirmacionProgramador {
    return new ConfirmacionProgramador(
      props.estado, props.programadorId, props.programadorNombre,
      props.fechaDecision, props.comentario, props.fechaPospuesto
    )
  }

  static fromPersistence(props: ConfirmacionProgramadorProps): ConfirmacionProgramador {
    return new ConfirmacionProgramador(
      props.estado, props.programadorId, props.programadorNombre,
      props.fechaDecision, props.comentario, props.fechaPospuesto
    )
  }

  // ── Getters ──
  get estado(): EstadoConfirmacion { return this._estado }
  get programadorId(): string { return this._programadorId }
  get programadorNombre(): string { return this._programadorNombre }
  get fechaDecision(): Date | undefined { return this._fechaDecision }
  get comentario(): string | undefined { return this._comentario }
  get fechaPospuesto(): Date | undefined { return this._fechaPospuesto }

  get descripcion(): string {
    const desc: Record<EstadoConfirmacion, string> = {
      'pendiente': `Pendiente confirmación de ${this._programadorNombre}`,
      'confirmado': `Confirmado por ${this._programadorNombre}`,
      'rechazado': `Rechazado por ${this._programadorNombre}`,
      'pospuesto': `Pospuesto por ${this._programadorNombre}`
    }
    return desc[this._estado]
  }

  get color(): string {
    const colores: Record<EstadoConfirmacion, string> = {
      'pendiente': 'bg-yellow-500',
      'confirmado': 'bg-green-500',
      'rechazado': 'bg-red-500',
      'pospuesto': 'bg-orange-500'
    }
    return colores[this._estado]
  }

  get icono(): string {
    const iconos: Record<EstadoConfirmacion, string> = {
      'pendiente': '⏳',
      'confirmado': '✅',
      'rechazado': '❌',
      'pospuesto': '⏰'
    }
    return iconos[this._estado]
  }

  // ── Métodos de transición ──
  confirmar(comentario?: string): ConfirmacionProgramador {
    if (this._estado !== 'pendiente' && this._estado !== 'pospuesto') {
      throw new Error(`No se puede confirmar desde estado: ${this._estado}`)
    }
    return new ConfirmacionProgramador(
      'confirmado', this._programadorId, this._programadorNombre,
      new Date(), comentario, undefined
    )
  }

  rechazar(comentario: string): ConfirmacionProgramador {
    if (this._estado !== 'pendiente' && this._estado !== 'pospuesto') {
      throw new Error(`No se puede rechazar desde estado: ${this._estado}`)
    }
    if (!comentario?.trim()) {
      throw new Error('El rechazo requiere un comentario explicativo')
    }
    return new ConfirmacionProgramador(
      'rechazado', this._programadorId, this._programadorNombre,
      new Date(), comentario, undefined
    )
  }

  posponer(horas: number = 24, comentario?: string): ConfirmacionProgramador {
    if (this._estado !== 'pendiente') {
      throw new Error(`No se puede posponer desde estado: ${this._estado}`)
    }
    const fechaPospuesto = new Date()
    fechaPospuesto.setHours(fechaPospuesto.getHours() + horas)
    return new ConfirmacionProgramador(
      'pospuesto', this._programadorId, this._programadorNombre,
      new Date(), comentario || `Pospuesto ${horas}h`, fechaPospuesto
    )
  }

  // ── Consultas ──
  esPendiente(): boolean { return this._estado === 'pendiente' }
  esConfirmado(): boolean { return this._estado === 'confirmado' }
  esRechazado(): boolean { return this._estado === 'rechazado' }
  esPospuesto(): boolean { return this._estado === 'pospuesto' }

  requiereAccion(): boolean {
    return this._estado === 'pendiente' || this._estado === 'pospuesto'
  }

  equals(other: ConfirmacionProgramador): boolean {
    return this._estado === other._estado &&
           this._programadorId === other._programadorId
  }

  toString(): string { return this.descripcion }

  toJSON(): ConfirmacionProgramadorProps {
    return {
      estado: this._estado,
      programadorId: this._programadorId,
      programadorNombre: this._programadorNombre,
      fechaDecision: this._fechaDecision,
      comentario: this._comentario,
      fechaPospuesto: this._fechaPospuesto
    }
  }
}
