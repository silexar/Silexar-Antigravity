/**
 * VALUE OBJECT: CUPO DISPONIBLE - TIER 0 ENTERPRISE
 *
 * @description Cálculo inteligente de disponibilidad de cupos por programa
 * con niveles de alerta (verde/amarillo/rojo), porcentaje de ocupación,
 * y lógica de extensión de cupos.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

export type NivelAlertaCupo = 'verde' | 'amarillo' | 'rojo' | 'sin_cupo' | 'extendido'

export interface CupoDisponibleProps {
  totalCupos: number
  cuposOcupados: number
  cuposReservados: number
  cuposExtendidos: number
  maxExtensiones: number
}

export class CupoDisponible {
  private constructor(
    private readonly _totalCupos: number,
    private readonly _cuposOcupados: number,
    private readonly _cuposReservados: number,
    private readonly _cuposExtendidos: number,
    private readonly _maxExtensiones: number
  ) {}

  static create(props: CupoDisponibleProps): CupoDisponible {
    CupoDisponible.validate(props)
    return new CupoDisponible(
      props.totalCupos,
      props.cuposOcupados,
      props.cuposReservados,
      props.cuposExtendidos,
      props.maxExtensiones
    )
  }

  static fromPersistence(props: CupoDisponibleProps): CupoDisponible {
    return new CupoDisponible(
      props.totalCupos,
      props.cuposOcupados,
      props.cuposReservados,
      props.cuposExtendidos,
      props.maxExtensiones
    )
  }

  private static validate(props: CupoDisponibleProps): void {
    if (props.totalCupos < 0) throw new Error('Total de cupos no puede ser negativo')
    if (props.cuposOcupados < 0) throw new Error('Cupos ocupados no puede ser negativo')
    if (props.cuposReservados < 0) throw new Error('Cupos reservados no puede ser negativo')
    if (props.cuposExtendidos < 0) throw new Error('Cupos extendidos no puede ser negativo')
    if (props.maxExtensiones < 0) throw new Error('Máximo extensiones no puede ser negativo')
  }

  // ── Getters ──
  get totalCupos(): number { return this._totalCupos }
  get cuposOcupados(): number { return this._cuposOcupados }
  get cuposReservados(): number { return this._cuposReservados }
  get cuposExtendidos(): number { return this._cuposExtendidos }
  get maxExtensiones(): number { return this._maxExtensiones }

  /** Cupos efectivamente disponibles para venta */
  get disponibles(): number {
    const capacidadTotal = this._totalCupos + this._cuposExtendidos
    const usados = this._cuposOcupados + this._cuposReservados
    return Math.max(0, capacidadTotal - usados)
  }

  /** Capacidad total incluyendo extensiones */
  get capacidadTotal(): number {
    return this._totalCupos + this._cuposExtendidos
  }

  /** Porcentaje de ocupación (0-100+) */
  get porcentajeOcupacion(): number {
    if (this.capacidadTotal === 0) return 0
    return Math.round(((this._cuposOcupados + this._cuposReservados) / this.capacidadTotal) * 100)
  }

  /** Nivel de alerta basado en disponibilidad */
  get nivelAlerta(): NivelAlertaCupo {
    if (this._cuposExtendidos > 0 && this.disponibles <= 0) return 'sin_cupo'
    if (this._cuposExtendidos > 0) return 'extendido'
    if (this.disponibles <= 0) return 'sin_cupo'
    if (this.disponibles <= 3) return 'rojo'
    if (this.porcentajeOcupacion >= 80) return 'amarillo'
    return 'verde'
  }

  get nivelAlertaColor(): string {
    const colores: Record<NivelAlertaCupo, string> = {
      'verde': 'bg-green-500',
      'amarillo': 'bg-yellow-500',
      'rojo': 'bg-red-500',
      'sin_cupo': 'bg-red-900',
      'extendido': 'bg-purple-500'
    }
    return colores[this.nivelAlerta]
  }

  get nivelAlertaDescripcion(): string {
    const descripciones: Record<NivelAlertaCupo, string> = {
      'verde': `${this.disponibles} cupos disponibles`,
      'amarillo': `Atención: ${this.disponibles} cupos restantes (${this.porcentajeOcupacion}% ocupado)`,
      'rojo': `⚠️ CRÍTICO: Solo ${this.disponibles} cupos disponibles`,
      'sin_cupo': '🚨 SIN CUPOS DISPONIBLES',
      'extendido': `Cupos extendidos: ${this._cuposExtendidos} extra (${this.disponibles} disponibles)`
    }
    return descripciones[this.nivelAlerta]
  }

  // ── Métodos de negocio ──

  /** Verifica si se puede agregar un cupo más */
  puedeAgregarCupo(): boolean {
    return this.disponibles > 0
  }

  /** Verifica si se pueden extender cupos */
  puedeExtender(): boolean {
    return this._cuposExtendidos < this._maxExtensiones
  }

  /** Cuántas extensiones más se pueden hacer */
  extensionesRestantes(): number {
    return Math.max(0, this._maxExtensiones - this._cuposExtendidos)
  }

  /** Verifica si necesita autorización para extensión */
  requiereAutorizacionExtension(): boolean {
    return this.disponibles <= 0 && !this.puedeExtender()
  }

  /** Crea un nuevo VO con un cupo consumido */
  consumirCupo(): CupoDisponible {
    if (!this.puedeAgregarCupo()) {
      throw new Error('No hay cupos disponibles para consumir')
    }
    return CupoDisponible.fromPersistence({
      totalCupos: this._totalCupos,
      cuposOcupados: this._cuposOcupados + 1,
      cuposReservados: this._cuposReservados,
      cuposExtendidos: this._cuposExtendidos,
      maxExtensiones: this._maxExtensiones
    })
  }

  /** Crea un nuevo VO con un cupo liberado */
  liberarCupo(): CupoDisponible {
    if (this._cuposOcupados <= 0) {
      throw new Error('No hay cupos ocupados para liberar')
    }
    return CupoDisponible.fromPersistence({
      totalCupos: this._totalCupos,
      cuposOcupados: this._cuposOcupados - 1,
      cuposReservados: this._cuposReservados,
      cuposExtendidos: this._cuposExtendidos,
      maxExtensiones: this._maxExtensiones
    })
  }

  /** Crea un nuevo VO con un cupo extendido */
  extenderCupo(): CupoDisponible {
    if (!this.puedeExtender()) {
      throw new Error(`No se pueden extender más cupos. Máximo: ${this._maxExtensiones}`)
    }
    return CupoDisponible.fromPersistence({
      totalCupos: this._totalCupos,
      cuposOcupados: this._cuposOcupados,
      cuposReservados: this._cuposReservados,
      cuposExtendidos: this._cuposExtendidos + 1,
      maxExtensiones: this._maxExtensiones
    })
  }

  // ── Igualdad ──
  equals(other: CupoDisponible): boolean {
    return this._totalCupos === other._totalCupos &&
           this._cuposOcupados === other._cuposOcupados &&
           this._cuposReservados === other._cuposReservados &&
           this._cuposExtendidos === other._cuposExtendidos
  }

  toString(): string {
    return `${this._cuposOcupados + this._cuposReservados}/${this.capacidadTotal} (${this.disponibles} disponibles)`
  }

  toJSON(): CupoDisponibleProps {
    return {
      totalCupos: this._totalCupos,
      cuposOcupados: this._cuposOcupados,
      cuposReservados: this._cuposReservados,
      cuposExtendidos: this._cuposExtendidos,
      maxExtensiones: this._maxExtensiones
    }
  }
}
