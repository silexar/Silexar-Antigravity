/**
 * VALUE OBJECT: NIVEL DE APROBACIÓN - TIER 0 ENTERPRISE
 *
 * @description Nivel de aprobación escalonado para extensiones de fecha (R1).
 * Calcula automáticamente qué nivel requiere según extensiones previas.
 * 1ª extensión: automática | 2ª: jefe comercial | 3ª+: gerente comercial
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

export type NivelAprobacionValor = 'automatico' | 'jefe_comercial' | 'gerente_comercial'

export type EstadoAprobacion = 'pendiente' | 'aprobado' | 'rechazado'

export interface NivelAprobacionProps {
  nivel: NivelAprobacionValor
  numeroExtension: number
  estado: EstadoAprobacion
  aprobadorId?: string
  aprobadorNombre?: string
  fechaAprobacion?: Date
  motivoRechazo?: string
}

export class NivelAprobacion {
  private constructor(
    private readonly _nivel: NivelAprobacionValor,
    private readonly _numeroExtension: number,
    private readonly _estado: EstadoAprobacion,
    private readonly _aprobadorId: string | undefined,
    private readonly _aprobadorNombre: string | undefined,
    private readonly _fechaAprobacion: Date | undefined,
    private readonly _motivoRechazo: string | undefined
  ) {}

  /** Calcula automáticamente el nivel requerido según extensiones previas */
  static calcularNivel(extensionesPrevias: number): NivelAprobacion {
    const numeroExtension = extensionesPrevias + 1
    let nivel: NivelAprobacionValor

    if (numeroExtension <= 1) {
      nivel = 'automatico'
    } else if (numeroExtension === 2) {
      nivel = 'jefe_comercial'
    } else {
      nivel = 'gerente_comercial'
    }

    return new NivelAprobacion(nivel, numeroExtension, 'pendiente', undefined, undefined, undefined, undefined)
  }

  static create(props: NivelAprobacionProps): NivelAprobacion {
    NivelAprobacion.validate(props)
    return new NivelAprobacion(
      props.nivel, props.numeroExtension, props.estado,
      props.aprobadorId, props.aprobadorNombre, props.fechaAprobacion, props.motivoRechazo
    )
  }

  static fromPersistence(props: NivelAprobacionProps): NivelAprobacion {
    return new NivelAprobacion(
      props.nivel, props.numeroExtension, props.estado,
      props.aprobadorId, props.aprobadorNombre, props.fechaAprobacion, props.motivoRechazo
    )
  }

  private static validate(props: NivelAprobacionProps): void {
    if (props.numeroExtension < 1) throw new Error('Número de extensión debe ser >= 1')
    if (props.estado === 'rechazado' && !props.motivoRechazo) {
      throw new Error('El rechazo requiere un motivo')
    }
  }

  // ── Getters ──
  get nivel(): NivelAprobacionValor { return this._nivel }
  get numeroExtension(): number { return this._numeroExtension }
  get estado(): EstadoAprobacion { return this._estado }
  get aprobadorId(): string | undefined { return this._aprobadorId }
  get aprobadorNombre(): string | undefined { return this._aprobadorNombre }
  get fechaAprobacion(): Date | undefined { return this._fechaAprobacion }
  get motivoRechazo(): string | undefined { return this._motivoRechazo }

  get descripcionNivel(): string {
    const descripciones: Record<NivelAprobacionValor, string> = {
      'automatico': 'Aprobación automática (1ª extensión)',
      'jefe_comercial': 'Requiere aprobación del Jefe Comercial (2ª extensión)',
      'gerente_comercial': 'Requiere aprobación del Gerente Comercial (3ª+ extensión)'
    }
    return descripciones[this._nivel]
  }

  get color(): string {
    const colores: Record<NivelAprobacionValor, string> = {
      'automatico': 'bg-green-500',
      'jefe_comercial': 'bg-amber-500',
      'gerente_comercial': 'bg-red-500'
    }
    return colores[this._nivel]
  }

  get estadoColor(): string {
    const colores: Record<EstadoAprobacion, string> = {
      'pendiente': 'bg-yellow-500',
      'aprobado': 'bg-green-500',
      'rechazado': 'bg-red-500'
    }
    return colores[this._estado]
  }

  get icono(): string {
    const iconos: Record<NivelAprobacionValor, string> = {
      'automatico': '✅',
      'jefe_comercial': '👔',
      'gerente_comercial': '🏛️'
    }
    return iconos[this._nivel]
  }

  get urgencia(): number {
    const urgencias: Record<NivelAprobacionValor, number> = {
      'automatico': 1,
      'jefe_comercial': 5,
      'gerente_comercial': 10
    }
    return urgencias[this._nivel]
  }

  // ── Métodos de negocio ──

  /** Verifica si requiere intervención humana */
  requiereAprobacionManual(): boolean {
    return this._nivel !== 'automatico'
  }

  /** Verifica si puede ser auto-aprobado */
  esAutoAprobable(): boolean {
    return this._nivel === 'automatico'
  }

  /** Aprueba la extensión */
  aprobar(aprobadorId: string, aprobadorNombre: string): NivelAprobacion {
    if (this._estado !== 'pendiente') {
      throw new Error(`No se puede aprobar desde estado: ${this._estado}`)
    }
    return NivelAprobacion.create({
      nivel: this._nivel,
      numeroExtension: this._numeroExtension,
      estado: 'aprobado',
      aprobadorId,
      aprobadorNombre,
      fechaAprobacion: new Date(),
      motivoRechazo: undefined
    })
  }

  /** Rechaza la extensión */
  rechazar(aprobadorId: string, aprobadorNombre: string, motivo: string): NivelAprobacion {
    if (this._estado !== 'pendiente') {
      throw new Error(`No se puede rechazar desde estado: ${this._estado}`)
    }
    return NivelAprobacion.create({
      nivel: this._nivel,
      numeroExtension: this._numeroExtension,
      estado: 'rechazado',
      aprobadorId,
      aprobadorNombre,
      fechaAprobacion: new Date(),
      motivoRechazo: motivo
    })
  }

  /** Auto-aprueba si es nivel automático */
  autoAprobar(): NivelAprobacion {
    if (!this.esAutoAprobable()) {
      throw new Error('Solo extensiones de nivel automático pueden ser auto-aprobadas')
    }
    return this.aprobar('SISTEMA', 'Aprobación Automática')
  }

  // ── Queries ──
  esPendiente(): boolean { return this._estado === 'pendiente' }
  esAprobado(): boolean { return this._estado === 'aprobado' }
  esRechazado(): boolean { return this._estado === 'rechazado' }

  equals(other: NivelAprobacion): boolean {
    return this._nivel === other._nivel &&
           this._numeroExtension === other._numeroExtension &&
           this._estado === other._estado
  }

  toString(): string {
    return `Ext #${this._numeroExtension}: ${this.descripcionNivel} (${this._estado})`
  }

  toJSON(): NivelAprobacionProps {
    return {
      nivel: this._nivel,
      numeroExtension: this._numeroExtension,
      estado: this._estado,
      aprobadorId: this._aprobadorId,
      aprobadorNombre: this._aprobadorNombre,
      fechaAprobacion: this._fechaAprobacion,
      motivoRechazo: this._motivoRechazo
    }
  }
}
