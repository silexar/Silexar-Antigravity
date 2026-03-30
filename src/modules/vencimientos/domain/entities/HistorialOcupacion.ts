/**
 * ENTIDAD: HISTORIAL DE OCUPACIÓN - TIER 0 ENTERPRISE
 *
 * @description Analytics históricos de ocupación por programa, emisora y período.
 * Base para Mejora 10 (Comparador de Períodos).
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

export interface MetricaPeriodo {
  mes: number
  anio: number
  ocupacionPromedio: number
  revenueTotal: number
  cuposUsados: number
  cuposDisponibles: number
  clientesUnicos: number
}

export interface HistorialOcupacionProps {
  id: string
  programaId: string
  programaNombre: string
  emisoraId: string
  emisoraNombre: string
  metricas: MetricaPeriodo[]
  ultimaActualizacion: Date
  version: number
}

export class HistorialOcupacion {
  private constructor(private props: HistorialOcupacionProps) {}

  static create(props: Omit<HistorialOcupacionProps, 'id' | 'ultimaActualizacion' | 'version'>): HistorialOcupacion {
    return new HistorialOcupacion({
      ...props,
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      ultimaActualizacion: new Date(),
      version: 1
    })
  }

  static fromPersistence(props: HistorialOcupacionProps): HistorialOcupacion {
    return new HistorialOcupacion(props)
  }

  // ── Getters ──
  get id(): string { return this.props.id }
  get programaId(): string { return this.props.programaId }
  get programaNombre(): string { return this.props.programaNombre }
  get emisoraId(): string { return this.props.emisoraId }
  get metricas(): MetricaPeriodo[] { return [...this.props.metricas] }
  get version(): number { return this.props.version }

  get ocupacionPromedioTotal(): number {
    if (this.props.metricas.length === 0) return 0
    return Math.round(this.props.metricas.reduce((s, m) => s + m.ocupacionPromedio, 0) / this.props.metricas.length)
  }

  get revenueAcumulado(): number {
    return this.props.metricas.reduce((s, m) => s + m.revenueTotal, 0)
  }

  /** Mejora 10: Comparar dos períodos */
  compararPeriodos(
    p1: { mes: number; anio: number },
    p2: { mes: number; anio: number }
  ): {
    periodo1: MetricaPeriodo | undefined
    periodo2: MetricaPeriodo | undefined
    deltaOcupacion: number
    deltaRevenue: number
    tendencia: 'crecimiento' | 'estable' | 'decrecimiento'
  } {
    const m1 = this.props.metricas.find(m => m.mes === p1.mes && m.anio === p1.anio)
    const m2 = this.props.metricas.find(m => m.mes === p2.mes && m.anio === p2.anio)

    const deltaOcupacion = (m2?.ocupacionPromedio ?? 0) - (m1?.ocupacionPromedio ?? 0)
    const deltaRevenue = (m2?.revenueTotal ?? 0) - (m1?.revenueTotal ?? 0)

    let tendencia: 'crecimiento' | 'estable' | 'decrecimiento' = 'estable'
    if (deltaOcupacion > 5) tendencia = 'crecimiento'
    else if (deltaOcupacion < -5) tendencia = 'decrecimiento'

    return { periodo1: m1, periodo2: m2, deltaOcupacion, deltaRevenue, tendencia }
  }

  agregarMetrica(metrica: MetricaPeriodo): void {
    const existente = this.props.metricas.findIndex(
      m => m.mes === metrica.mes && m.anio === metrica.anio
    )
    if (existente >= 0) {
      this.props.metricas[existente] = metrica
    } else {
      this.props.metricas.push(metrica)
    }
    this.props.ultimaActualizacion = new Date()
    this.props.version++
  }

  toSnapshot(): HistorialOcupacionProps { return { ...this.props } }
}
