/**
 * VALUE OBJECT: RIESGO DE CRÉDITO - TIER 0
 * 
 * @description Score dinámico integrado con Cortex-Risk
 */

export interface RiesgoCreditoProps {
  score: number
  nivel: 'bajo' | 'medio' | 'alto'
  factores: string[]
  fechaEvaluacion: Date
  validoHasta: Date
  recomendaciones: string[]
  limiteCredito?: number
  requiereGarantia: boolean
}

export class RiesgoCredito {
  private constructor(private readonly props: RiesgoCreditoProps) {
    this.validate()
  }

  static create(score: number, factores: string[] = []): RiesgoCredito {
    const nivel = RiesgoCredito.calcularNivel(score)
    const fechaEvaluacion = new Date()
    const validoHasta = new Date(fechaEvaluacion.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 días
    const recomendaciones = RiesgoCredito.generarRecomendaciones(nivel, score)
    const requiereGarantia = nivel === 'alto' || score < 600
    
    return new RiesgoCredito({
      score,
      nivel,
      factores,
      fechaEvaluacion,
      validoHasta,
      recomendaciones,
      requiereGarantia
    })
  }

  static fromProps(props: RiesgoCreditoProps): RiesgoCredito {
    return new RiesgoCredito(props)
  }

  private static calcularNivel(score: number): 'bajo' | 'medio' | 'alto' {
    if (score >= 750) return 'bajo'
    if (score >= 600) return 'medio'
    return 'alto'
  }

  private static generarRecomendaciones(nivel: 'bajo' | 'medio' | 'alto', score: number): string[] {
    const recomendaciones: string[] = []
    
    switch (nivel) {
      case 'bajo':
        recomendaciones.push('Cliente de bajo riesgo - Términos estándar aplicables')
        recomendaciones.push('Considerar términos preferenciales para fidelización')
        break
        
      case 'medio':
        recomendaciones.push('Monitorear historial de pagos regularmente')
        recomendaciones.push('Términos de pago no superiores a 45 días')
        if (score < 650) {
          recomendaciones.push('Considerar garantía para montos altos')
        }
        break
        
      case 'alto':
        recomendaciones.push('Requiere aprobación gerencial para cualquier crédito')
        recomendaciones.push('Términos máximos de 15 días')
        recomendaciones.push('Garantía obligatoria')
        recomendaciones.push('Monitoreo semanal de cuenta')
        break
    }
    
    return recomendaciones
  }

  private validate(): void {
    if (this.props.score < 0 || this.props.score > 1000) {
      throw new Error('Score de riesgo debe estar entre 0 y 1000')
    }
    
    if (this.props.fechaEvaluacion > this.props.validoHasta) {
      throw new Error('Fecha de evaluación no puede ser posterior a fecha de validez')
    }
    
    // Validar coherencia entre score y nivel
    const nivelCalculado = RiesgoCredito.calcularNivel(this.props.score)
    if (this.props.nivel !== nivelCalculado) {
      throw new Error(`Nivel ${this.props.nivel} no coincide con score ${this.props.score}`)
    }
  }

  get score(): number {
    return this.props.score
  }

  get nivel(): 'bajo' | 'medio' | 'alto' {
    return this.props.nivel
  }

  get factores(): string[] {
    return [...this.props.factores]
  }

  get fechaEvaluacion(): Date {
    return new Date(this.props.fechaEvaluacion)
  }

  get validoHasta(): Date {
    return new Date(this.props.validoHasta)
  }

  get recomendaciones(): string[] {
    return [...this.props.recomendaciones]
  }

  get limiteCredito(): number | undefined {
    return this.props.limiteCredito
  }

  get requiereGarantia(): boolean {
    return this.props.requiereGarantia
  }

  // Métodos de negocio
  estaVigente(): boolean {
    return new Date() <= this.props.validoHasta
  }

  diasParaVencimiento(): number {
    const ahora = new Date()
    const diferencia = this.props.validoHasta.getTime() - ahora.getTime()
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24))
  }

  requiereActualizacion(): boolean {
    return this.diasParaVencimiento() <= 7
  }

  // Validaciones de términos
  validarTerminosPago(diasPago: number): { valido: boolean; mensaje?: string } {
    const limitesMaximos = {
      'bajo': 90,
      'medio': 45,
      'alto': 15
    }
    
    const limiteMaximo = limitesMaximos[this.props.nivel]
    
    if (diasPago > limiteMaximo) {
      return {
        valido: false,
        mensaje: `Términos de ${diasPago} días exceden límite de ${limiteMaximo} días para riesgo ${this.props.nivel}`
      }
    }
    
    return { valido: true }
  }

  validarMontoCredito(monto: number): { valido: boolean; mensaje?: string } {
    if (!this.props.limiteCredito) {
      return { valido: true }
    }
    
    if (monto > this.props.limiteCredito) {
      return {
        valido: false,
        mensaje: `Monto ${monto.toLocaleString()} excede límite de crédito ${this.props.limiteCredito.toLocaleString()}`
      }
    }
    
    return { valido: true }
  }

  // Clasificación de color para UI
  get colorNivel(): string {
    const colores = {
      'bajo': 'text-green-400',
      'medio': 'text-yellow-400',
      'alto': 'text-red-400'
    }
    
    return colores[this.props.nivel]
  }

  get colorFondo(): string {
    const colores = {
      'bajo': 'bg-green-500/10 border-green-500/20',
      'medio': 'bg-yellow-500/10 border-yellow-500/20',
      'alto': 'bg-red-500/10 border-red-500/20'
    }
    
    return colores[this.props.nivel]
  }

  // Descripción detallada
  get descripcionCompleta(): string {
    const estado = this.estaVigente() ? 'vigente' : 'vencido'
    const dias = this.diasParaVencimiento()
    
    return `Score ${this.props.score} - Riesgo ${this.props.nivel.toUpperCase()} (${estado}, ${dias} días restantes)`
  }

  // Actualización de score
  actualizarScore(nuevoScore: number, nuevosFactores: string[] = []): RiesgoCredito {
    return RiesgoCredito.create(nuevoScore, [...this.props.factores, ...nuevosFactores])
  }

  // Agregar factor de riesgo
  agregarFactor(factor: string): RiesgoCredito {
    if (this.props.factores.includes(factor)) {
      return this
    }
    
    return RiesgoCredito.fromProps({
      ...this.props,
      factores: [...this.props.factores, factor]
    })
  }

  // Establecer límite de crédito
  conLimiteCredito(limite: number): RiesgoCredito {
    return RiesgoCredito.fromProps({
      ...this.props,
      limiteCredito: limite
    })
  }

  // Comparaciones
  esMayorRiesgoQue(otro: RiesgoCredito): boolean {
    const niveles = { 'bajo': 1, 'medio': 2, 'alto': 3 }
    return niveles[this.props.nivel] > niveles[otro.props.nivel]
  }

  // Métricas
  get porcentajeConfianza(): number {
    return (this.props.score / 1000) * 100
  }

  get tendencia(): 'mejorando' | 'estable' | 'empeorando' {
    // En una implementación real, esto compararía con evaluaciones anteriores
    if (this.props.score >= 750) return 'estable'
    if (this.props.score >= 600) return 'mejorando'
    return 'empeorando'
  }

  // Serialización
  toSnapshot(): RiesgoCreditoProps {
    return {
      ...this.props,
      fechaEvaluacion: new Date(this.props.fechaEvaluacion),
      validoHasta: new Date(this.props.validoHasta)
    }
  }

  equals(other: RiesgoCredito): boolean {
    return (
      this.props.score === other.props.score &&
      this.props.nivel === other.props.nivel &&
      this.props.fechaEvaluacion.getTime() === other.props.fechaEvaluacion.getTime()
    )
  }

  toString(): string {
    return `${this.props.score} (${this.props.nivel.toUpperCase()})`
  }
}