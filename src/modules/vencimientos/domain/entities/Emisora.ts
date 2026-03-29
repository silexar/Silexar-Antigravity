/**
 * ENTIDAD: EMISORA - TIER 0 ENTERPRISE
 *
 * @description Entidad raíz de emisora (Radio/TV) con configuración específica,
 * operador de tráfico asignado (R2), métricas de ocupación y revenue.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

export interface ReglaNoInicioConfig {
  tipo: 'estricta' | 'flexible' | 'manual'
  horasDefecto: number
}

export interface EmisoraProps {
  id: string
  nombre: string
  tipo: 'fm' | 'am' | 'digital' | 'podcast' | 'tv'
  frecuencia?: string
  descripcion: string
  logoUrl?: string
  estado: 'activa' | 'inactiva' | 'mantenimiento'

  // R2 — Operador de tráfico asignado
  operadorTraficoId: string
  operadorTraficoNombre: string

  // Fase 5 — Regla R1 configurable y Matriz Notificaciones
  reglaNoInicio: ReglaNoInicioConfig

  // Configuración comercial
  totalProgramas: number
  totalCuposGlobal: number
  cuposOcupados: number

  // Métricas
  ocupacionPromedio: number     // Porcentaje 0-100
  revenueActual: number         // Revenue acumulado
  revenuePotencial: number      // Revenue si estuviera 100%

  // Alertas
  alertasCriticas: number
  oportunidadesAbiertas: number

  // Auditoría
  fechaCreacion: Date
  fechaActualizacion: Date
  creadoPor: string
  actualizadoPor: string
  version: number
}

export class Emisora {
  private _domainEvents: string[] = []

  private constructor(private props: EmisoraProps) {
    this.validate()
  }

  static create(props: Omit<EmisoraProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'version'>): Emisora {
    const now = new Date()
    return new Emisora({
      ...props,
      id: Emisora.generateId(),
      reglaNoInicio: props.reglaNoInicio || { tipo: 'estricta', horasDefecto: 48 },
      fechaCreacion: now,
      fechaActualizacion: now,
      version: 1
    })
  }

  static fromPersistence(props: EmisoraProps): Emisora {
    return new Emisora(props)
  }

  private static generateId(): string {
    return `emi_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  private validate(): void {
    if (!this.props.nombre?.trim()) throw new Error('Nombre de emisora es requerido')
    if (!this.props.operadorTraficoId?.trim()) throw new Error('Operador de tráfico es requerido (R2)')
  }

  // ── Getters ──
  get id(): string { return this.props.id }
  get nombre(): string { return this.props.nombre }
  get tipo(): string { return this.props.tipo }
  get frecuencia(): string | undefined { return this.props.frecuencia }
  get descripcion(): string { return this.props.descripcion }
  get logoUrl(): string | undefined { return this.props.logoUrl }
  get estado(): string { return this.props.estado }
  get operadorTraficoId(): string { return this.props.operadorTraficoId }
  get operadorTraficoNombre(): string { return this.props.operadorTraficoNombre }
  get reglaNoInicio(): ReglaNoInicioConfig { return this.props.reglaNoInicio }
  get totalProgramas(): number { return this.props.totalProgramas }
  get totalCuposGlobal(): number { return this.props.totalCuposGlobal }
  get cuposOcupados(): number { return this.props.cuposOcupados }
  get ocupacionPromedio(): number { return this.props.ocupacionPromedio }
  get revenueActual(): number { return this.props.revenueActual }
  get revenuePotencial(): number { return this.props.revenuePotencial }
  get alertasCriticas(): number { return this.props.alertasCriticas }
  get oportunidadesAbiertas(): number { return this.props.oportunidadesAbiertas }
  get version(): number { return this.props.version }
  get domainEvents(): string[] { return [...this._domainEvents] }

  get cuposDisponibles(): number {
    return Math.max(0, this.props.totalCuposGlobal - this.props.cuposOcupados)
  }

  get porcentajeRevenueRealizado(): number {
    if (this.props.revenuePotencial === 0) return 0
    return Math.round((this.props.revenueActual / this.props.revenuePotencial) * 100)
  }

  get tipoLabel(): string {
    const labels: Record<string, string> = {
      'fm': '📻 FM', 'am': '📻 AM', 'digital': '💻 Digital',
      'podcast': '🎙️ Podcast', 'tv': '📺 TV'
    }
    return labels[this.props.tipo] || this.props.tipo
  }

  get estadoOnline(): boolean { return this.props.estado === 'activa' }

  // ── Métodos de negocio ──

  /** R2: Asignar nuevo operador de tráfico */
  asignarOperadorTrafico(operadorId: string, operadorNombre: string, responsable: string): void {
    const anterior = this.props.operadorTraficoNombre
    this.props.operadorTraficoId = operadorId
    this.props.operadorTraficoNombre = operadorNombre
    this.props.actualizadoPor = responsable
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.addDomainEvent(`OperadorTraficoAsignado: ${anterior} → ${operadorNombre}`)
  }

  /** Fase 5: Configurar Regla R1 */
  configurarReglaNoInicio(config: ReglaNoInicioConfig, responsable: string): void {
    this.props.reglaNoInicio = config
    this.props.actualizadoPor = responsable
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.addDomainEvent(`ReglaNoInicioConfigurada: ${config.tipo} (${config.horasDefecto}h) por ${responsable}`)
  }

  actualizarMetricas(metricas: {
    ocupacionPromedio: number
    revenueActual: number
    revenuePotencial: number
    alertasCriticas: number
    oportunidadesAbiertas: number
  }): void {
    this.props.ocupacionPromedio = metricas.ocupacionPromedio
    this.props.revenueActual = metricas.revenueActual
    this.props.revenuePotencial = metricas.revenuePotencial
    this.props.alertasCriticas = metricas.alertasCriticas
    this.props.oportunidadesAbiertas = metricas.oportunidadesAbiertas
    this.props.fechaActualizacion = new Date()
  }

  incrementarProgramas(): void {
    this.props.totalProgramas++
    this.props.fechaActualizacion = new Date()
  }

  actualizarCupos(totalGlobal: number, ocupados: number): void {
    this.props.totalCuposGlobal = totalGlobal
    this.props.cuposOcupados = ocupados
    this.props.fechaActualizacion = new Date()
  }

  activar(): void { this.props.estado = 'activa' }
  desactivar(): void { this.props.estado = 'inactiva' }
  mantenimiento(): void { this.props.estado = 'mantenimiento' }

  private addDomainEvent(event: string): void {
    this._domainEvents.push(event)
  }

  clearDomainEvents(): void {
    this._domainEvents = []
  }

  toSnapshot(): EmisoraProps { return { ...this.props } }
}
