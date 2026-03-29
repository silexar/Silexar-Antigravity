/**
 * VALUE OBJECT: TOTALES DE CONTRATO - TIER 0
 * 
 * @description Valores con recálculo automático y validaciones financieras
 */

export interface TotalesContratoProps {
  valorBruto: number
  descuentoPorcentaje: number
  valorNeto: number
  impuestos: number
  valorTotal: number
  moneda: 'CLP' | 'USD' | 'UF'
}

export class TotalesContrato {
  private constructor(private readonly props: TotalesContratoProps) {
    this.validate()
  }

  static create(valorBruto: number, descuentoPorcentaje: number, moneda: 'CLP' | 'USD' | 'UF' = 'CLP'): TotalesContrato {
    const valorNeto = valorBruto * (1 - descuentoPorcentaje / 100)
    const impuestos = valorNeto * 0.19 // IVA 19%
    const valorTotal = valorNeto + impuestos
    
    return new TotalesContrato({
      valorBruto,
      descuentoPorcentaje,
      valorNeto,
      impuestos,
      valorTotal,
      moneda
    })
  }

  static fromValues(props: TotalesContratoProps): TotalesContrato {
    return new TotalesContrato(props)
  }

  private validate(): void {
    if (this.props.valorBruto <= 0) {
      throw new Error('Valor bruto debe ser mayor a cero')
    }
    
    if (this.props.descuentoPorcentaje < 0 || this.props.descuentoPorcentaje > 100) {
      throw new Error('Descuento debe estar entre 0% y 100%')
    }
    
    if (this.props.valorNeto <= 0) {
      throw new Error('Valor neto debe ser mayor a cero')
    }
    
    // Validar coherencia de cálculos
    const valorNetoCalculado = this.props.valorBruto * (1 - this.props.descuentoPorcentaje / 100)
    const tolerance = 0.01 // Tolerancia para errores de redondeo
    
    if (Math.abs(this.props.valorNeto - valorNetoCalculado) > tolerance) {
      throw new Error('Valor neto no coincide con cálculo esperado')
    }
  }

  get valorBruto(): number {
    return this.props.valorBruto
  }

  get descuentoPorcentaje(): number {
    return this.props.descuentoPorcentaje
  }

  get descuentoMonto(): number {
    return this.props.valorBruto - this.props.valorNeto
  }

  get valorNeto(): number {
    return this.props.valorNeto
  }

  get impuestos(): number {
    return this.props.impuestos
  }

  get valorTotal(): number {
    return this.props.valorTotal
  }

  get moneda(): 'CLP' | 'USD' | 'UF' {
    return this.props.moneda
  }

  // Métodos de cálculo
  aplicarDescuentoAdicional(porcentajeAdicional: number): TotalesContrato {
    const nuevoDescuento = this.props.descuentoPorcentaje + porcentajeAdicional
    
    if (nuevoDescuento > 100) {
      throw new Error('Descuento total no puede exceder 100%')
    }
    
    return TotalesContrato.create(this.props.valorBruto, nuevoDescuento, this.props.moneda)
  }

  cambiarMoneda(nuevaMoneda: 'CLP' | 'USD' | 'UF', tasaCambio: number): TotalesContrato {
    if (tasaCambio <= 0) {
      throw new Error('Tasa de cambio debe ser mayor a cero')
    }
    
    return TotalesContrato.fromValues({
      valorBruto: this.props.valorBruto * tasaCambio,
      descuentoPorcentaje: this.props.descuentoPorcentaje,
      valorNeto: this.props.valorNeto * tasaCambio,
      impuestos: this.props.impuestos * tasaCambio,
      valorTotal: this.props.valorTotal * tasaCambio,
      moneda: nuevaMoneda
    })
  }

  // Formateo
  formatearValor(valor: number): string {
    const formatters = {
      'CLP': new Intl.NumberFormat('es-CL', { 
        style: 'currency', 
        currency: 'CLP',
        minimumFractionDigits: 0 
      }),
      'USD': new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      }),
      'UF': new Intl.NumberFormat('es-CL', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })
    }
    
    const formatted = formatters[this.props.moneda].format(valor)
    return this.props.moneda === 'UF' ? `${formatted} UF` : formatted
  }

  get valorBrutoFormateado(): string {
    return this.formatearValor(this.props.valorBruto)
  }

  get valorNetoFormateado(): string {
    return this.formatearValor(this.props.valorNeto)
  }

  get impuestosFormateados(): string {
    return this.formatearValor(this.props.impuestos)
  }

  get valorTotalFormateado(): string {
    return this.formatearValor(this.props.valorTotal)
  }

  // Comparaciones
  esMayorQue(otros: TotalesContrato): boolean {
    if (this.props.moneda !== otros.props.moneda) {
      throw new Error('No se pueden comparar totales en diferentes monedas')
    }
    
    return this.props.valorNeto > otros.props.valorNeto
  }

  // Validaciones de negocio
  validarLimiteDescuento(limiteMaximo: number): boolean {
    return this.props.descuentoPorcentaje <= limiteMaximo
  }

  validarMontoMinimo(montoMinimo: number): boolean {
    return this.props.valorNeto >= montoMinimo
  }

  // Métricas
  get margenDescuento(): number {
    return (this.descuentoMonto / this.props.valorBruto) * 100
  }

  get porcentajeImpuestos(): number {
    return (this.props.impuestos / this.props.valorNeto) * 100
  }

  // Serialización
  toSnapshot(): TotalesContratoProps {
    return { ...this.props }
  }

  equals(other: TotalesContrato): boolean {
    return (
      this.props.valorBruto === other.props.valorBruto &&
      this.props.descuentoPorcentaje === other.props.descuentoPorcentaje &&
      this.props.moneda === other.props.moneda
    )
  }

  toString(): string {
    return `${this.valorNetoFormateado} (${this.props.descuentoPorcentaje}% desc.)`
  }
}