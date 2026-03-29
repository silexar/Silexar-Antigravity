/**
 * VALUE OBJECT: TÉRMINOS DE PAGO - TIER 0
 * 
 * @description Términos con validación de riesgo y políticas automáticas
 */

export interface TerminosPagoProps {
  dias: number
  tipo: 'contado' | 'credito'
  modalidad: 'hitos' | 'cuotas'
  anticipado: boolean
  garantiaRequerida: boolean
  observaciones?: string
}

export class TerminosPago {
  private constructor(private readonly props: TerminosPagoProps) {
    this.validate()
  }

  static create(dias: number, modalidad: 'hitos' | 'cuotas' = 'hitos', anticipado: boolean = false): TerminosPago {
    const tipo = dias === 0 ? 'contado' : 'credito'
    const garantiaRequerida = dias > 60 // Garantía requerida para más de 60 días
    
    return new TerminosPago({
      dias,
      tipo,
      modalidad,
      anticipado,
      garantiaRequerida
    })
  }

  static fromProps(props: TerminosPagoProps): TerminosPago {
    return new TerminosPago(props)
  }

  // Términos predefinidos comunes
  static contado(): TerminosPago {
    return TerminosPago.create(0, 'hitos', false)
  }

  static net15(): TerminosPago {
    return TerminosPago.create(15, 'hitos', false)
  }

  static net30(): TerminosPago {
    return TerminosPago.create(30, 'hitos', false)
  }

  static net45(): TerminosPago {
    return TerminosPago.create(45, 'hitos', false)
  }

  static net60(): TerminosPago {
    return TerminosPago.create(60, 'hitos', false)
  }

  private validate(): void {
    if (this.props.dias < 0) {
      throw new Error('Días de pago no pueden ser negativos')
    }
    
    if (this.props.dias > 180) {
      throw new Error('Términos de pago no pueden exceder 180 días')
    }
    
    if (this.props.tipo === 'contado' && this.props.dias > 0) {
      throw new Error('Pago al contado debe tener 0 días')
    }
    
    if (this.props.tipo === 'credito' && this.props.dias === 0) {
      throw new Error('Pago a crédito debe tener más de 0 días')
    }
  }

  get dias(): number {
    return this.props.dias
  }

  get tipo(): 'contado' | 'credito' {
    return this.props.tipo
  }

  get modalidad(): 'hitos' | 'cuotas' {
    return this.props.modalidad
  }

  get anticipado(): boolean {
    return this.props.anticipado
  }

  get garantiaRequerida(): boolean {
    return this.props.garantiaRequerida
  }

  get observaciones(): string | undefined {
    return this.props.observaciones
  }

  // Métodos de negocio
  esCompatibleConRiesgo(nivelRiesgo: 'bajo' | 'medio' | 'alto'): boolean {
    const limitesRiesgo = {
      'alto': 15,
      'medio': 45,
      'bajo': 90
    }
    
    return this.props.dias <= limitesRiesgo[nivelRiesgo]
  }

  calcularFechaVencimiento(fechaFactura: Date): Date {
    const fechaVencimiento = new Date(fechaFactura)
    fechaVencimiento.setDate(fechaVencimiento.getDate() + this.props.dias)
    return fechaVencimiento
  }

  calcularDescuentoProntosPago(porcentajeDescuento: number, diasDescuento: number): TerminosPago | null {
    if (this.props.dias <= diasDescuento) {
      return null // No aplica descuento si ya es menor al período
    }
    
    return TerminosPago.fromProps({
      ...this.props,
      observaciones: `${porcentajeDescuento}% descuento si paga en ${diasDescuento} días`
    })
  }

  // Validaciones de política empresarial
  cumplePoliticaEmpresarial(): { valido: boolean; errores: string[] } {
    const errores: string[] = []
    
    // Política: Máximo 90 días para clientes nuevos
    if (this.props.dias > 90) {
      errores.push('Términos superiores a 90 días requieren aprobación especial')
    }
    
    // Política: Garantía obligatoria para más de 60 días
    if (this.props.dias > 60 && !this.props.garantiaRequerida) {
      errores.push('Términos superiores a 60 días requieren garantía')
    }
    
    // Política: Facturación anticipada solo para contratos grandes
    if (this.props.anticipado && this.props.dias > 0) {
      errores.push('Facturación anticipada incompatible con términos a crédito')
    }
    
    return {
      valido: errores.length === 0,
      errores
    }
  }

  // Clasificación de riesgo
  get clasificacionRiesgo(): 'bajo' | 'medio' | 'alto' {
    if (this.props.dias <= 15) return 'bajo'
    if (this.props.dias <= 45) return 'medio'
    return 'alto'
  }

  // Descripción legible
  get descripcion(): string {
    if (this.props.tipo === 'contado') {
      return this.props.anticipado ? 'Pago anticipado' : 'Pago al contado'
    }
    
    const modalidadTexto = this.props.modalidad === 'hitos' ? 'por hitos' : 'en cuotas'
    const anticipadoTexto = this.props.anticipado ? ' (anticipado)' : ''
    
    return `${this.props.dias} días ${modalidadTexto}${anticipadoTexto}`
  }

  // Formateo para contratos
  get textoContrato(): string {
    let texto = this.descripcion
    
    if (this.props.garantiaRequerida) {
      texto += ' - Garantía requerida'
    }
    
    if (this.props.observaciones) {
      texto += ` - ${this.props.observaciones}`
    }
    
    return texto
  }

  // Comparaciones
  esMasRestrictivoQue(otros: TerminosPago): boolean {
    return this.props.dias < otros.props.dias
  }

  // Modificaciones
  conObservaciones(observaciones: string): TerminosPago {
    return TerminosPago.fromProps({
      ...this.props,
      observaciones
    })
  }

  conGarantia(requerida: boolean): TerminosPago {
    return TerminosPago.fromProps({
      ...this.props,
      garantiaRequerida: requerida
    })
  }

  // Serialización
  toSnapshot(): TerminosPagoProps {
    return { ...this.props }
  }

  equals(other: TerminosPago): boolean {
    return (
      this.props.dias === other.props.dias &&
      this.props.tipo === other.props.tipo &&
      this.props.modalidad === other.props.modalidad &&
      this.props.anticipado === other.props.anticipado
    )
  }

  toString(): string {
    return this.descripcion
  }
}