/**
 * ENTIDAD LÍNEA DE ESPECIFICACIÓN - TIER 0
 * 
 * @description Líneas de pauta específicas con validación de inventario
 */

export interface LineaEspecificacionProps {
  id: string
  contratoId: string
  medioId: string
  medio: string
  formatoId: string
  formato: string
  horario: string
  fechaInicio: Date
  fechaFin: Date
  frecuencia: number
  duracion: number // en segundos
  valorUnitario: number
  cantidad: number
  valorTotal: number
  estado: 'pendiente' | 'confirmado' | 'ejecutado' | 'cancelado'
  observaciones?: string
  inventarioReservado: boolean
  fechaReserva?: Date
}

export class LineaEspecificacion {
  private constructor(private props: LineaEspecificacionProps) {
    this.validate()
  }

  static create(props: Omit<LineaEspecificacionProps, 'id' | 'valorTotal' | 'estado' | 'inventarioReservado'>): LineaEspecificacion {
    const valorTotal = props.valorUnitario * props.cantidad
    
    return new LineaEspecificacion({
      ...props,
      id: this.generateId(),
      valorTotal,
      estado: 'pendiente',
      inventarioReservado: false
    })
  }

  static fromPersistence(props: LineaEspecificacionProps): LineaEspecificacion {
    return new LineaEspecificacion(props)
  }

  private static generateId(): string {
    return `linea_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  private validate(): void {
    if (this.props.fechaFin <= this.props.fechaInicio) {
      throw new Error('Fecha fin debe ser posterior a fecha inicio')
    }
    
    if (this.props.frecuencia <= 0) {
      throw new Error('Frecuencia debe ser mayor a cero')
    }
    
    if (this.props.duracion <= 0) {
      throw new Error('Duración debe ser mayor a cero')
    }
    
    if (this.props.valorUnitario < 0) {
      throw new Error('Valor unitario no puede ser negativo')
    }
    
    if (this.props.cantidad <= 0) {
      throw new Error('Cantidad debe ser mayor a cero')
    }
  }

  // Getters
  get id(): string { return this.props.id }
  get contratoId(): string { return this.props.contratoId }
  get medio(): string { return this.props.medio }
  get formato(): string { return this.props.formato }
  get horario(): string { return this.props.horario }
  get valorTotal(): number { return this.props.valorTotal }
  get estado(): string { return this.props.estado }
  get inventarioReservado(): boolean { return this.props.inventarioReservado }

  // Métodos de negocio
  reservarInventario(): void {
    if (this.props.inventarioReservado) {
      throw new Error('Inventario ya está reservado')
    }
    
    this.props.inventarioReservado = true
    this.props.fechaReserva = new Date()
    this.props.estado = 'confirmado'
  }

  liberarInventario(): void {
    this.props.inventarioReservado = false
    this.props.fechaReserva = undefined
    this.props.estado = 'pendiente'
  }

  calcularTotalSpots(): number {
    const diasCampana = Math.ceil((this.props.fechaFin.getTime() - this.props.fechaInicio.getTime()) / (1000 * 60 * 60 * 24))
    return diasCampana * this.props.frecuencia
  }

  calcularGRP(): number {
    // Cálculo simplificado - en producción vendría de datos de audiencia
    const rating = 5.2 // Rating promedio estimado
    return this.calcularTotalSpots() * rating
  }

  toSnapshot(): LineaEspecificacionProps {
    return { ...this.props }
  }
}