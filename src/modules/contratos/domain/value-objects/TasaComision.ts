/**
 * VALUE OBJECT: TASA DE COMISIÓN - TIER 0
 * 
 * @description Comisiones con cálculo automático y validaciones
 */

export interface TasaComisionProps {
  porcentaje: number
  montoFijo?: number
  tipo: 'porcentaje' | 'fijo' | 'mixto'
  aplicaSobre: 'bruto' | 'neto'
  minimo?: number
  maximo?: number
}

export class TasaComision {
  private constructor(private readonly props: TasaComisionProps) {
    this.validate()
  }

  static porcentaje(porcentaje: number, aplicaSobre: 'bruto' | 'neto' = 'neto'): TasaComision {
    return new TasaComision({
      porcentaje,
      tipo: 'porcentaje',
      aplicaSobre
    })
  }

  static fijo(montoFijo: number): TasaComision {
    return new TasaComision({
      porcentaje: 0,
      montoFijo,
      tipo: 'fijo',
      aplicaSobre: 'neto'
    })
  }

  static mixto(porcentaje: number, montoFijo: number, aplicaSobre: 'bruto' | 'neto' = 'neto'): TasaComision {
    return new TasaComision({
      porcentaje,
      montoFijo,
      tipo: 'mixto',
      aplicaSobre
    })
  }

  static fromProps(props: TasaComisionProps): TasaComision {
    return new TasaComision(props)
  }

  private validate(): void {
    if (this.props.porcentaje < 0 || this.props.porcentaje > 100) {
      throw new Error('Porcentaje de comisión debe estar entre 0% y 100%')
    }

    if (this.props.montoFijo && this.props.montoFijo < 0) {
      throw new Error('Monto fijo no puede ser negativo')
    }

    if (this.props.tipo === 'fijo' && !this.props.montoFijo) {
      throw new Error('Comisión fija requiere monto fijo')
    }

    if (this.props.minimo && this.props.maximo && this.props.minimo > this.props.maximo) {
      throw new Error('Mínimo no puede ser mayor que máximo')
    }
  }

  get porcentaje(): number {
    return this.props.porcentaje
  }

  get montoFijo(): number | undefined {
    return this.props.montoFijo
  }

  get tipo(): 'porcentaje' | 'fijo' | 'mixto' {
    return this.props.tipo
  }

  calcularComision(valorBase: number): number {
    let comision = 0

    switch (this.props.tipo) {
      case 'porcentaje':
        comision = valorBase * (this.props.porcentaje / 100)
        break
      case 'fijo':
        comision = this.props.montoFijo || 0
        break
      case 'mixto':
        comision = valorBase * (this.props.porcentaje / 100) + (this.props.montoFijo || 0)
        break
    }

    // Aplicar límites si existen
    if (this.props.minimo && comision < this.props.minimo) {
      comision = this.props.minimo
    }

    if (this.props.maximo && comision > this.props.maximo) {
      comision = this.props.maximo
    }

    return comision
  }

  toSnapshot(): TasaComisionProps {
    return { ...this.props }
  }

  equals(other: TasaComision): boolean {
    return (
      this.props.porcentaje === other.props.porcentaje &&
      this.props.montoFijo === other.props.montoFijo &&
      this.props.tipo === other.props.tipo
    )
  }

  toString(): string {
    switch (this.props.tipo) {
      case 'porcentaje':
        return `${this.props.porcentaje}%`
      case 'fijo':
        return `$${this.props.montoFijo?.toLocaleString()}`
      case 'mixto':
        return `${this.props.porcentaje}% + $${this.props.montoFijo?.toLocaleString()}`
      default:
        return '0%'
    }
  }
}