/**
 * ENTIDAD: SEÑAL ESPECIAL - TIER 0 ENTERPRISE
 *
 * @description Temperatura, Micros informativos, Cortinas musicales
 * con precios, exclusividad y cupos.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

export type TipoSenal = 'temperatura' | 'micro_informativo' | 'micro_entretenimiento' | 'cortina_entrada' | 'cortina_cierre'

export interface SenalEspecialProps {
  id: string
  emisoraId: string
  tipo: TipoSenal
  nombre: string
  descripcion: string
  formato: string
  horarios: string[]
  duracionSegundos: number
  frecuenciaDiaria: number
  precioMensual: number
  cuposMaximos: number
  cuposOcupados: number
  exclusividad: boolean
  clienteActualId?: string
  clienteActualNombre?: string
  estado: 'disponible' | 'ocupado' | 'parcialmente_ocupado' | 'inactivo'
  fechaCreacion: Date
  fechaActualizacion: Date
  version: number
}

export class SenalEspecial {
  private _domainEvents: string[] = []

  private constructor(private props: SenalEspecialProps) {}

  static create(props: Omit<SenalEspecialProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'version'>): SenalEspecial {
    const now = new Date()
    return new SenalEspecial({
      ...props,
      id: `senal_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      fechaCreacion: now,
      fechaActualizacion: now,
      version: 1
    })
  }

  static fromPersistence(props: SenalEspecialProps): SenalEspecial {
    return new SenalEspecial(props)
  }

  // ── Getters ──
  get id(): string { return this.props.id }
  get emisoraId(): string { return this.props.emisoraId }
  get tipo(): TipoSenal { return this.props.tipo }
  get nombre(): string { return this.props.nombre }
  get descripcion(): string { return this.props.descripcion }
  get formato(): string { return this.props.formato }
  get horarios(): string[] { return [...this.props.horarios] }
  get duracionSegundos(): number { return this.props.duracionSegundos }
  get frecuenciaDiaria(): number { return this.props.frecuenciaDiaria }
  get precioMensual(): number { return this.props.precioMensual }
  get cuposMaximos(): number { return this.props.cuposMaximos }
  get cuposOcupados(): number { return this.props.cuposOcupados }
  get exclusividad(): boolean { return this.props.exclusividad }
  get clienteActualNombre(): string | undefined { return this.props.clienteActualNombre }
  get estado(): string { return this.props.estado }
  get version(): number { return this.props.version }
  get domainEvents(): string[] { return [...this._domainEvents] }

  get cuposDisponibles(): number {
    return Math.max(0, this.props.cuposMaximos - this.props.cuposOcupados)
  }

  get estaDisponible(): boolean {
    return this.cuposDisponibles > 0 && this.props.estado !== 'inactivo'
  }

  get tipoLabel(): string {
    const labels: Record<TipoSenal, string> = {
      'temperatura': '🌡️ Temperatura',
      'micro_informativo': '📻 Micro Informativo',
      'micro_entretenimiento': '📻 Micro Entretenimiento',
      'cortina_entrada': '🎼 Cortina Entrada',
      'cortina_cierre': '🎼 Cortina Cierre'
    }
    return labels[this.props.tipo]
  }

  get precioFormateado(): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(this.props.precioMensual)
  }

  // ── Métodos ──
  asignarCliente(clienteId: string, clienteNombre: string): void {
    if (!this.estaDisponible) throw new Error('Señal especial no disponible')
    this.props.clienteActualId = clienteId
    this.props.clienteActualNombre = clienteNombre
    this.props.cuposOcupados++
    this.props.estado = this.cuposDisponibles === 0 ? 'ocupado' : 'parcialmente_ocupado'
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.addDomainEvent(`SenalAsignada: ${this.props.nombre} → ${clienteNombre}`)
  }

  liberarCliente(): void {
    const anterior = this.props.clienteActualNombre
    this.props.clienteActualId = undefined
    this.props.clienteActualNombre = undefined
    this.props.cuposOcupados = Math.max(0, this.props.cuposOcupados - 1)
    this.props.estado = this.props.cuposOcupados === 0 ? 'disponible' : 'parcialmente_ocupado'
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.addDomainEvent(`SenalLiberada: ${this.props.nombre} (antes: ${anterior})`)
  }

  actualizarPrecio(nuevoPrecio: number): void {
    this.props.precioMensual = nuevoPrecio
    this.props.fechaActualizacion = new Date()
    this.props.version++
  }

  private addDomainEvent(event: string): void { this._domainEvents.push(event) }
  clearDomainEvents(): void { this._domainEvents = [] }
  toSnapshot(): SenalEspecialProps { return { ...this.props } }
}
