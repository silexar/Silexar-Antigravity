/**
 * VALUE OBJECT: FACTOR DE TARIFA - TIER 0 ENTERPRISE
 *
 * @description Multiplicador de precios por horario, programa, temporada
 * y demanda con cálculo automático del precio resultante.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

export type MotiveFactor =
  | 'horario'           // Factor Prime AM/PM/Repartida/Noche
  | 'temporada_alta'    // Diciembre, eventos especiales
  | 'temporada_baja'    // Enero, Febrero
  | 'alta_demanda'      // Ocupación > 90%
  | 'cliente_nuevo'     // Incentivo para nuevos clientes
  | 'renovacion'        // Descuento por fidelización
  | 'rating'            // Ajuste por rating audiencia
  | 'inflacion'         // Ajuste IPC
  | 'personalizado'     // Factor manual

export interface FactorTarifaProps {
  valor: number
  motivo: MotiveFactor
  descripcion: string
  vigenciaDesde?: Date
  vigenciaHasta?: Date
  aplicaAutomaticamente: boolean
}

export class FactorTarifa {
  private constructor(
    private readonly _valor: number,
    private readonly _motivo: MotiveFactor,
    private readonly _descripcion: string,
    private readonly _vigenciaDesde: Date | undefined,
    private readonly _vigenciaHasta: Date | undefined,
    private readonly _aplicaAutomaticamente: boolean
  ) {}

  static create(props: FactorTarifaProps): FactorTarifa {
    FactorTarifa.validate(props)
    return new FactorTarifa(
      props.valor, props.motivo, props.descripcion,
      props.vigenciaDesde, props.vigenciaHasta, props.aplicaAutomaticamente
    )
  }

  static fromPersistence(props: FactorTarifaProps): FactorTarifa {
    return new FactorTarifa(
      props.valor, props.motivo, props.descripcion,
      props.vigenciaDesde, props.vigenciaHasta, props.aplicaAutomaticamente
    )
  }

  // ── Factores predefinidos ──
  static primeAM(): FactorTarifa {
    return new FactorTarifa(2.5, 'horario', 'Factor Prime AM (2.5x)', undefined, undefined, true)
  }
  static primePM(): FactorTarifa {
    return new FactorTarifa(2.2, 'horario', 'Factor Prime PM (2.2x)', undefined, undefined, true)
  }
  static repartida(): FactorTarifa {
    return new FactorTarifa(1.0, 'horario', 'Factor Repartida estándar (1.0x)', undefined, undefined, true)
  }
  static noche(): FactorTarifa {
    return new FactorTarifa(0.7, 'horario', 'Factor Noche (0.7x)', undefined, undefined, true)
  }
  static temporadaAlta(): FactorTarifa {
    return new FactorTarifa(1.25, 'temporada_alta', 'Temporada alta (+25%)', undefined, undefined, true)
  }
  static temporadaBaja(): FactorTarifa {
    return new FactorTarifa(0.90, 'temporada_baja', 'Temporada baja (-10%)', undefined, undefined, true)
  }
  static altaDemanda(): FactorTarifa {
    return new FactorTarifa(1.20, 'alta_demanda', 'Alta demanda (+20%)', undefined, undefined, true)
  }
  static clienteNuevo(): FactorTarifa {
    return new FactorTarifa(0.95, 'cliente_nuevo', 'Incentivo cliente nuevo (-5%)', undefined, undefined, false)
  }
  static renovacionTemprana(): FactorTarifa {
    return new FactorTarifa(0.90, 'renovacion', 'Descuento renovación temprana (-10%)', undefined, undefined, false)
  }

  private static validate(props: FactorTarifaProps): void {
    if (props.valor <= 0) throw new Error('Factor de tarifa debe ser positivo')
    if (props.valor > 10) throw new Error('Factor de tarifa no puede exceder 10x')
    if (props.vigenciaDesde && props.vigenciaHasta && props.vigenciaHasta <= props.vigenciaDesde) {
      throw new Error('Vigencia hasta debe ser posterior a vigencia desde')
    }
  }

  // ── Getters ──
  get valor(): number { return this._valor }
  get motivo(): MotiveFactor { return this._motivo }
  get descripcion(): string { return this._descripcion }
  get vigenciaDesde(): Date | undefined { return this._vigenciaDesde }
  get vigenciaHasta(): Date | undefined { return this._vigenciaHasta }
  get aplicaAutomaticamente(): boolean { return this._aplicaAutomaticamente }

  get esDescuento(): boolean { return this._valor < 1 }
  get esRecargo(): boolean { return this._valor > 1 }
  get esNeutro(): boolean { return this._valor === 1 }

  get porcentajeAjuste(): number {
    return Math.round((this._valor - 1) * 100)
  }

  get porcentajeFormateado(): string {
    const pct = this.porcentajeAjuste
    return pct >= 0 ? `+${pct}%` : `${pct}%`
  }

  // ── Métodos ──
  aplicarA(precioBase: number): number {
    return Math.round(precioBase * this._valor)
  }

  estaVigente(fecha: Date = new Date()): boolean {
    if (!this._vigenciaDesde && !this._vigenciaHasta) return true
    if (this._vigenciaDesde && fecha < this._vigenciaDesde) return false
    if (this._vigenciaHasta && fecha > this._vigenciaHasta) return false
    return true
  }

  equals(other: FactorTarifa): boolean {
    return this._valor === other._valor && this._motivo === other._motivo
  }

  toString(): string { return `${this._descripcion}: ${this._valor}x` }
}

/** Combina múltiples factores multiplicándolos */
export function combinarFactores(factores: FactorTarifa[]): number {
  return factores.reduce((acum, f) => acum * f.valor, 1)
}
