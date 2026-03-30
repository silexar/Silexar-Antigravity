/**
 * VALUE OBJECT: MÉTRICAS DE RENTABILIDAD - TIER 0
 * 
 * @description Análisis de margen y ROI con cálculos automáticos
 */

export interface MetricasRentabilidadProps {
  margenBruto: number
  margenNeto: number
  roi: number
  valorVida: number
  costoAdquisicion: number
  fechaCalculo: Date
  proyeccionAnual?: number
}

export class MetricasRentabilidad {
  private constructor(private readonly props: MetricasRentabilidadProps) {
    this.validate()
  }

  static create(params: {
    margenBruto: number
    roi: number
    valorVida: number
    costoAdquisicion: number
    proyeccionAnual?: number
  }): MetricasRentabilidad {
    const margenNeto = params.margenBruto * 0.85 // Estimado después de gastos operativos
    const fechaCalculo = new Date()
    
    return new MetricasRentabilidad({
      ...params,
      margenNeto,
      fechaCalculo
    })
  }

  static fromProps(props: MetricasRentabilidadProps): MetricasRentabilidad {
    return new MetricasRentabilidad(props)
  }

  private validate(): void {
    if (this.props.margenBruto < -100 || this.props.margenBruto > 100) {
      throw new Error('Margen bruto debe estar entre -100% y 100%')
    }
    
    if (this.props.roi < -100) {
      throw new Error('ROI no puede ser menor a -100%')
    }
    
    if (this.props.valorVida < 0) {
      throw new Error('Valor de vida no puede ser negativo')
    }
    
    if (this.props.costoAdquisicion < 0) {
      throw new Error('Costo de adquisición no puede ser negativo')
    }
  }

  get margenBruto(): number {
    return this.props.margenBruto
  }

  get margenNeto(): number {
    return this.props.margenNeto
  }

  get roi(): number {
    return this.props.roi
  }

  get valorVida(): number {
    return this.props.valorVida
  }

  get costoAdquisicion(): number {
    return this.props.costoAdquisicion
  }

  get fechaCalculo(): Date {
    return new Date(this.props.fechaCalculo)
  }

  get proyeccionAnual(): number | undefined {
    return this.props.proyeccionAnual
  }

  // Cálculos derivados
  get ratioValorCosto(): number {
    if (this.props.costoAdquisicion === 0) return Infinity
    return this.props.valorVida / this.props.costoAdquisicion
  }

  get paybackPeriod(): number {
    if (this.props.margenNeto <= 0) return Infinity
    return this.props.costoAdquisicion / (this.props.valorVida * (this.props.margenNeto / 100))
  }

  // Clasificaciones
  get clasificacionRentabilidad(): 'excelente' | 'buena' | 'aceptable' | 'baja' | 'perdida' {
    if (this.props.margenBruto >= 40) return 'excelente'
    if (this.props.margenBruto >= 25) return 'buena'
    if (this.props.margenBruto >= 15) return 'aceptable'
    if (this.props.margenBruto >= 0) return 'baja'
    return 'perdida'
  }

  get clasificacionROI(): 'excelente' | 'bueno' | 'aceptable' | 'bajo' | 'negativo' {
    if (this.props.roi >= 30) return 'excelente'
    if (this.props.roi >= 20) return 'bueno'
    if (this.props.roi >= 10) return 'aceptable'
    if (this.props.roi >= 0) return 'bajo'
    return 'negativo'
  }

  // Colores para UI
  get colorMargen(): string {
    const colores = {
      'excelente': 'text-green-400',
      'buena': 'text-emerald-400',
      'aceptable': 'text-yellow-400',
      'baja': 'text-orange-400',
      'perdida': 'text-red-400'
    }
    
    return colores[this.clasificacionRentabilidad]
  }

  get colorROI(): string {
    const colores = {
      'excelente': 'text-green-400',
      'bueno': 'text-emerald-400',
      'aceptable': 'text-yellow-400',
      'bajo': 'text-orange-400',
      'negativo': 'text-red-400'
    }
    
    return colores[this.clasificacionROI]
  }

  // Validaciones de negocio
  cumpleObjetivosEmpresariales(): { cumple: boolean; observaciones: string[] } {
    const observaciones: string[] = []
    let cumple = true
    
    // Objetivo: Margen mínimo 15%
    if (this.props.margenBruto < 15) {
      observaciones.push(`Margen bruto ${this.props.margenBruto.toFixed(1)}% por debajo del objetivo (15%)`)
      cumple = false
    }
    
    // Objetivo: ROI mínimo 20%
    if (this.props.roi < 20) {
      observaciones.push(`ROI ${this.props.roi.toFixed(1)}% por debajo del objetivo (20%)`)
      cumple = false
    }
    
    // Objetivo: Ratio valor/costo mínimo 3:1
    if (this.ratioValorCosto < 3) {
      observaciones.push(`Ratio valor/costo ${this.ratioValorCosto.toFixed(1)}:1 por debajo del objetivo (3:1)`)
      cumple = false
    }
    
    // Objetivo: Payback máximo 12 meses
    if (this.paybackPeriod > 12) {
      observaciones.push(`Período de recuperación ${this.paybackPeriod.toFixed(1)} meses excede objetivo (12 meses)`)
      cumple = false
    }
    
    if (cumple) {
      observaciones.push('Cumple todos los objetivos de rentabilidad empresarial')
    }
    
    return { cumple, observaciones }
  }

  // Recomendaciones automáticas
  generarRecomendaciones(): string[] {
    const recomendaciones: string[] = []
    
    if (this.props.margenBruto < 15) {
      recomendaciones.push('Revisar estructura de costos para mejorar margen')
      recomendaciones.push('Considerar ajuste de precios o renegociación de términos')
    }
    
    if (this.props.roi < 10) {
      recomendaciones.push('Evaluar viabilidad del contrato - ROI muy bajo')
      recomendaciones.push('Buscar oportunidades de upselling o cross-selling')
    }
    
    if (this.ratioValorCosto < 2) {
      recomendaciones.push('Costo de adquisición muy alto - optimizar proceso comercial')
    }
    
    if (this.paybackPeriod > 18) {
      recomendaciones.push('Período de recuperación muy largo - revisar términos de pago')
    }
    
    if (this.clasificacionRentabilidad === 'excelente') {
      recomendaciones.push('Excelente rentabilidad - considerar como modelo para otros contratos')
    }
    
    return recomendaciones
  }

  // Comparaciones
  esMasRentableQue(otras: MetricasRentabilidad): boolean {
    // Comparación ponderada: 40% margen, 30% ROI, 30% ratio valor/costo
    const scoreThis = (this.props.margenBruto * 0.4) + (this.props.roi * 0.3) + (this.ratioValorCosto * 10 * 0.3)
    const scoreOther = (otras.props.margenBruto * 0.4) + (otras.props.roi * 0.3) + (otras.ratioValorCosto * 10 * 0.3)
    
    return scoreThis > scoreOther
  }

  // Proyecciones
  proyectarAnual(factorCrecimiento: number = 1.0): MetricasRentabilidad {
    const proyeccionAnual = this.props.valorVida * 12 * factorCrecimiento
    
    return MetricasRentabilidad.fromProps({
      ...this.props,
      proyeccionAnual
    })
  }

  // Formateo
  formatearPorcentaje(valor: number): string {
    return `${valor.toFixed(1)}%`
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(valor)
  }

  get margenBrutoFormateado(): string {
    return this.formatearPorcentaje(this.props.margenBruto)
  }

  get margenNetoFormateado(): string {
    return this.formatearPorcentaje(this.props.margenNeto)
  }

  get roiFormateado(): string {
    return this.formatearPorcentaje(this.props.roi)
  }

  get valorVidaFormateado(): string {
    return this.formatearMoneda(this.props.valorVida)
  }

  get costoAdquisicionFormateado(): string {
    return this.formatearMoneda(this.props.costoAdquisicion)
  }

  // Actualización
  actualizarConNuevosDatos(params: Partial<{
    margenBruto: number
    roi: number
    valorVida: number
    costoAdquisicion: number
  }>): MetricasRentabilidad {
    return MetricasRentabilidad.create({
      margenBruto: params.margenBruto ?? this.props.margenBruto,
      roi: params.roi ?? this.props.roi,
      valorVida: params.valorVida ?? this.props.valorVida,
      costoAdquisicion: params.costoAdquisicion ?? this.props.costoAdquisicion,
      proyeccionAnual: this.props.proyeccionAnual
    })
  }

  // Serialización
  toSnapshot(): MetricasRentabilidadProps {
    return {
      ...this.props,
      fechaCalculo: new Date(this.props.fechaCalculo)
    }
  }

  equals(other: MetricasRentabilidad): boolean {
    return (
      Math.abs(this.props.margenBruto - other.props.margenBruto) < 0.01 &&
      Math.abs(this.props.roi - other.props.roi) < 0.01 &&
      Math.abs(this.props.valorVida - other.props.valorVida) < 0.01
    )
  }

  toString(): string {
    return `Margen: ${this.margenBrutoFormateado}, ROI: ${this.roiFormateado}, Ratio: ${this.ratioValorCosto.toFixed(1)}:1`
  }
}