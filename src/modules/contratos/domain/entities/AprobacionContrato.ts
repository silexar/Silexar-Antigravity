/**
 * ENTIDAD APROBACIÓN DE CONTRATO - TIER 0
 * 
 * @description Flujo de aprobaciones multinivel con automatización
 */

export interface AprobacionContratoProps {
  id: string
  contratoId: string
  nivel: number
  aprobadorId: string
  aprobador: string
  rol: string
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'escalado'
  fechaSolicitud: Date
  fechaRespuesta?: Date
  fechaLimite: Date
  observaciones?: string
  requiereJustificacion: boolean
  justificacion?: string
  valorContrato: number
  factoresEscalamiento: string[]
}

export class AprobacionContrato {
  private constructor(private props: AprobacionContratoProps) {
    this.validate()
  }

  static create(params: {
    contratoId: string
    nivel: number
    aprobadorId: string
    aprobador: string
    rol: string
    valorContrato: number
    requiereJustificacion?: boolean
    factoresEscalamiento?: string[]
  }): AprobacionContrato {
    const fechaSolicitud = new Date()
    const fechaLimite = AprobacionContrato.calcularFechaLimite(params.nivel, params.valorContrato)
    
    return new AprobacionContrato({
      id: this.generateId(),
      estado: 'pendiente',
      fechaSolicitud,
      fechaLimite,
      requiereJustificacion: params.requiereJustificacion || params.valorContrato > 50000000,
      factoresEscalamiento: params.factoresEscalamiento || [],
      ...params
    })
  }

  static fromPersistence(props: AprobacionContratoProps): AprobacionContrato {
    return new AprobacionContrato(props)
  }

  private static generateId(): string {
    return `aprob_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  private static calcularFechaLimite(nivel: number, valorContrato: number): Date {
    const horasLimite = {
      1: 2,   // Supervisor: 2 horas
      2: 4,   // Gerente: 4 horas  
      3: 24,  // Gerente General: 24 horas
      4: 48,  // Directorio: 48 horas
      5: 72   // Casos especiales: 72 horas
    }
    
    // Contratos grandes tienen más tiempo
    const multiplicador = valorContrato > 100000000 ? 2 : 1
    const horas = (horasLimite[nivel as keyof typeof horasLimite] || 24) * multiplicador
    
    return new Date(Date.now() + horas * 60 * 60 * 1000)
  }

  private validate(): void {
    if (this.props.nivel < 1 || this.props.nivel > 5) {
      throw new Error('Nivel de aprobación debe estar entre 1 y 5')
    }
    
    if (this.props.valorContrato <= 0) {
      throw new Error('Valor de contrato debe ser mayor a cero')
    }
    
    if (this.props.fechaLimite <= this.props.fechaSolicitud) {
      throw new Error('Fecha límite debe ser posterior a fecha de solicitud')
    }
  }

  // Getters
  get id(): string { return this.props.id }
  get contratoId(): string { return this.props.contratoId }
  get nivel(): number { return this.props.nivel }
  get aprobador(): string { return this.props.aprobador }
  get estado(): string { return this.props.estado }
  get fechaLimite(): Date { return this.props.fechaLimite }
  get requiereJustificacion(): boolean { return this.props.requiereJustificacion }

  // Métodos de negocio
  aprobar(justificacion?: string): void {
    if (this.props.estado !== 'pendiente') {
      throw new Error('Solo se pueden aprobar solicitudes pendientes')
    }
    
    if (this.props.requiereJustificacion && !justificacion) {
      throw new Error('Justificación requerida para esta aprobación')
    }
    
    this.props.estado = 'aprobado'
    this.props.fechaRespuesta = new Date()
    this.props.justificacion = justificacion
  }

  rechazar(observaciones: string): void {
    if (this.props.estado !== 'pendiente') {
      throw new Error('Solo se pueden rechazar solicitudes pendientes')
    }
    
    if (!observaciones?.trim()) {
      throw new Error('Observaciones son requeridas para rechazar')
    }
    
    this.props.estado = 'rechazado'
    this.props.fechaRespuesta = new Date()
    this.props.observaciones = observaciones
  }

  escalar(): void {
    if (this.props.estado !== 'pendiente') {
      throw new Error('Solo se pueden escalar solicitudes pendientes')
    }
    
    this.props.estado = 'escalado'
    this.props.fechaRespuesta = new Date()
  }

  estaVencida(): boolean {
    return new Date() > this.props.fechaLimite && this.props.estado === 'pendiente'
  }

  horasRestantes(): number {
    const ahora = new Date()
    const diferencia = this.props.fechaLimite.getTime() - ahora.getTime()
    return Math.max(0, diferencia / (1000 * 60 * 60))
  }

  get urgencia(): 'critica' | 'alta' | 'media' | 'baja' {
    const horas = this.horasRestantes()
    
    if (horas <= 1) return 'critica'
    if (horas <= 4) return 'alta'
    if (horas <= 12) return 'media'
    return 'baja'
  }

  get colorUrgencia(): string {
    const colores = {
      'critica': 'text-red-400 bg-red-500/10',
      'alta': 'text-orange-400 bg-orange-500/10',
      'media': 'text-yellow-400 bg-yellow-500/10',
      'baja': 'text-green-400 bg-green-500/10'
    }
    
    return colores[this.urgencia]
  }

  toSnapshot(): AprobacionContratoProps {
    return { ...this.props }
  }
}