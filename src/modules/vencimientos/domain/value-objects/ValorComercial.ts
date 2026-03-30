/**
 * VALUE OBJECT: VALOR COMERCIAL - TIER 0 ENTERPRISE
 *
 * @description Precio comercial con moneda, descuentos aplicados,
 * factor de ajuste y cálculo de valor final.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

export type MonedaComercial = 'CLP' | 'USD' | 'UF'

export interface ValorComercialProps {
  valorBase: number
  moneda: MonedaComercial
  descuentoPorcentaje: number
  factorAjuste: number
  motivoDescuento?: string
}

export class ValorComercial {
  private constructor(
    private readonly _valorBase: number,
    private readonly _moneda: MonedaComercial,
    private readonly _descuentoPorcentaje: number,
    private readonly _factorAjuste: number,
    private readonly _motivoDescuento?: string
  ) {}

  static create(props: ValorComercialProps): ValorComercial {
    ValorComercial.validate(props)
    return new ValorComercial(
      props.valorBase,
      props.moneda,
      props.descuentoPorcentaje,
      props.factorAjuste,
      props.motivoDescuento
    )
  }

  static fromPersistence(props: ValorComercialProps): ValorComercial {
    return new ValorComercial(
      props.valorBase, props.moneda, props.descuentoPorcentaje,
      props.factorAjuste, props.motivoDescuento
    )
  }

  /** Crea un valor comercial sin descuentos */
  static sinDescuento(valorBase: number, moneda: MonedaComercial = 'CLP'): ValorComercial {
    return new ValorComercial(valorBase, moneda, 0, 1.0)
  }

  private static validate(props: ValorComercialProps): void {
    if (props.valorBase < 0) throw new Error('Valor base no puede ser negativo')
    if (props.descuentoPorcentaje < 0 || props.descuentoPorcentaje > 100) {
      throw new Error('Descuento debe estar entre 0 y 100')
    }
    if (props.factorAjuste <= 0) throw new Error('Factor de ajuste debe ser positivo')
    const monedasValidas: MonedaComercial[] = ['CLP', 'USD', 'UF']
    if (!monedasValidas.includes(props.moneda)) {
      throw new Error(`Moneda inválida: ${props.moneda}`)
    }
  }

  // ── Getters ──
  get valorBase(): number { return this._valorBase }
  get moneda(): MonedaComercial { return this._moneda }
  get descuentoPorcentaje(): number { return this._descuentoPorcentaje }
  get factorAjuste(): number { return this._factorAjuste }
  get motivoDescuento(): string | undefined { return this._motivoDescuento }

  /** Valor final después de aplicar descuento y factor */
  get valorFinal(): number {
    const conDescuento = this._valorBase * (1 - this._descuentoPorcentaje / 100)
    return Math.round(conDescuento * this._factorAjuste)
  }

  /** Monto del descuento aplicado */
  get montoDescuento(): number {
    return Math.round(this._valorBase * (this._descuentoPorcentaje / 100))
  }

  /** Valor formateado para display */
  get valorFormateado(): string {
    const formatter = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: this._moneda === 'UF' ? 'CLP' : this._moneda,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
    if (this._moneda === 'UF') {
      return `${this.valorFinal.toLocaleString('es-CL')} UF`
    }
    return formatter.format(this.valorFinal)
  }

  get tieneDescuento(): boolean {
    return this._descuentoPorcentaje > 0
  }

  // ── Métodos de negocio ──

  /** Aplica un descuento adicional sobre el valor actual */
  conDescuento(porcentaje: number, motivo: string): ValorComercial {
    const nuevoDescuento = Math.min(100, this._descuentoPorcentaje + porcentaje)
    return ValorComercial.create({
      valorBase: this._valorBase,
      moneda: this._moneda,
      descuentoPorcentaje: nuevoDescuento,
      factorAjuste: this._factorAjuste,
      motivoDescuento: motivo
    })
  }

  /** Aplica un factor de ajuste al valor */
  conFactor(factor: number): ValorComercial {
    return ValorComercial.create({
      valorBase: this._valorBase,
      moneda: this._moneda,
      descuentoPorcentaje: this._descuentoPorcentaje,
      factorAjuste: this._factorAjuste * factor,
      motivoDescuento: this._motivoDescuento
    })
  }

  /** Calcula valor por período (mensual, trimestral, anual) */
  valorPorPeriodo(meses: number): number {
    return this.valorFinal * meses
  }

  // ── Igualdad ──
  equals(other: ValorComercial): boolean {
    return this._valorBase === other._valorBase &&
           this._moneda === other._moneda &&
           this._descuentoPorcentaje === other._descuentoPorcentaje &&
           this._factorAjuste === other._factorAjuste
  }

  toString(): string { return this.valorFormateado }

  toJSON(): ValorComercialProps {
    return {
      valorBase: this._valorBase,
      moneda: this._moneda,
      descuentoPorcentaje: this._descuentoPorcentaje,
      factorAjuste: this._factorAjuste,
      motivoDescuento: this._motivoDescuento
    }
  }
}
