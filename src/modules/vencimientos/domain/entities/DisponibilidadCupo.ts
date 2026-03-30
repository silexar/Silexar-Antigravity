/**
 * ENTIDAD: DISPONIBILIDAD CUPO - TIER 0 ENTERPRISE
 *
 * @description Estado en tiempo real de disponibilidad por programa/fecha
 * con cálculos dinámicos y semáforo de salud (Mejora 8).
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

export type SaludInventario = 'optimo' | 'saludable' | 'atencion' | 'critico' | 'sub_utilizado'

export interface DisponibilidadCupoProps {
  id: string
  programaId: string
  programaNombre: string
  emisoraId: string
  fecha: Date
  totalCuposTipoA: number
  ocupadosTipoA: number
  totalCuposTipoB: number
  ocupadosTipoB: number
  totalMenciones: number
  ocupadasMenciones: number
  reservasActivas: number
  listaEsperaCount: number
  revenueRealizado: number
  revenuePotencial: number
  revenuePerdido: number
  fechaActualizacion: Date
  version: number
}

export class DisponibilidadCupo {
  private constructor(private props: DisponibilidadCupoProps) {}

  static create(props: Omit<DisponibilidadCupoProps, 'id' | 'fechaActualizacion' | 'version'>): DisponibilidadCupo {
    return new DisponibilidadCupo({
      ...props,
      id: `disp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      fechaActualizacion: new Date(),
      version: 1
    })
  }

  static fromPersistence(props: DisponibilidadCupoProps): DisponibilidadCupo {
    return new DisponibilidadCupo(props)
  }

  // ── Getters ──
  get id(): string { return this.props.id }
  get programaId(): string { return this.props.programaId }
  get programaNombre(): string { return this.props.programaNombre }
  get emisoraId(): string { return this.props.emisoraId }
  get fecha(): Date { return this.props.fecha }
  get version(): number { return this.props.version }

  get totalCupos(): number {
    return this.props.totalCuposTipoA + this.props.totalCuposTipoB + this.props.totalMenciones
  }

  get totalOcupados(): number {
    return this.props.ocupadosTipoA + this.props.ocupadosTipoB + this.props.ocupadasMenciones
  }

  get totalDisponibles(): number { return Math.max(0, this.totalCupos - this.totalOcupados) }

  get porcentajeOcupacion(): number {
    if (this.totalCupos === 0) return 0
    return Math.round((this.totalOcupados / this.totalCupos) * 100)
  }

  /** Mejora 8: Semáforo de salud de inventario */
  get saludInventario(): SaludInventario {
    const pct = this.porcentajeOcupacion
    if (pct >= 90) return 'optimo'
    if (pct >= 60) return 'saludable'
    if (pct >= 40) return 'atencion'
    if (pct >= 20) return 'sub_utilizado'
    return 'critico'
  }

  get saludColor(): string {
    const colores: Record<SaludInventario, string> = {
      'optimo': 'bg-green-600',
      'saludable': 'bg-green-400',
      'atencion': 'bg-yellow-500',
      'critico': 'bg-red-500',
      'sub_utilizado': 'bg-red-700'
    }
    return colores[this.saludInventario]
  }

  get saludLabel(): string {
    const labels: Record<SaludInventario, string> = {
      'optimo': '🟢 Óptimo (>90%)',
      'saludable': '🟢 Saludable (60-90%)',
      'atencion': '🟡 Atención (40-60%)',
      'critico': '🔴 Crítico (<20%)',
      'sub_utilizado': '🔴 Sub-utilizado (20-40%)'
    }
    return labels[this.saludInventario]
  }

  /** Mejora 9: Revenue perdido calculado */
  get revenuePerdido(): number { return this.props.revenuePerdido }
  get revenueRealizado(): number { return this.props.revenueRealizado }
  get revenuePotencial(): number { return this.props.revenuePotencial }

  get porcentajeRevenueRealizado(): number {
    if (this.props.revenuePotencial === 0) return 0
    return Math.round((this.props.revenueRealizado / this.props.revenuePotencial) * 100)
  }

  // ── Métodos ──
  actualizar(data: Partial<DisponibilidadCupoProps>): void {
    Object.assign(this.props, data)
    this.props.fechaActualizacion = new Date()
    this.props.version++
  }

  toSnapshot(): DisponibilidadCupoProps { return { ...this.props } }
}
