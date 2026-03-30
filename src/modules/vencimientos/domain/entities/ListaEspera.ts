/**
 * ENTIDAD: LISTA DE ESPERA - TIER 0 ENTERPRISE (MEJORA 7)
 *
 * @description Cola priorizada de clientes esperando cupo en programa lleno.
 * Al liberarse un cupo, se notifica automáticamente al siguiente.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

export interface ClienteEspera {
  clienteId: string
  clienteNombre: string
  clienteRubro: string
  ejecutivoId: string
  ejecutivoNombre: string
  tipoAuspicioDeseado: 'tipo_a' | 'tipo_b' | 'solo_menciones'
  fechaRegistro: Date
  prioridad: 'normal' | 'alta' | 'urgente'
  notas?: string
  notificado: boolean
}

export interface ListaEsperaProps {
  id: string
  programaId: string
  programaNombre: string
  emisoraId: string
  emisoraNombre: string
  clientes: ClienteEspera[]
  maxEspera: number
  notificacionAutomatica: boolean
  fechaCreacion: Date
  fechaActualizacion: Date
  version: number
}

export class ListaEspera {
  private _domainEvents: string[] = []

  private constructor(private props: ListaEsperaProps) {}

  static create(props: Omit<ListaEsperaProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'version'>): ListaEspera {
    const now = new Date()
    return new ListaEspera({
      ...props,
      id: `lista_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      fechaCreacion: now,
      fechaActualizacion: now,
      version: 1
    })
  }

  static fromPersistence(props: ListaEsperaProps): ListaEspera {
    return new ListaEspera(props)
  }

  // ── Getters ──
  get id(): string { return this.props.id }
  get programaId(): string { return this.props.programaId }
  get programaNombre(): string { return this.props.programaNombre }
  get emisoraId(): string { return this.props.emisoraId }
  get clientes(): ClienteEspera[] { return [...this.props.clientes] }
  get totalEnEspera(): number { return this.props.clientes.length }
  get version(): number { return this.props.version }
  get domainEvents(): string[] { return [...this._domainEvents] }

  get tieneClientes(): boolean { return this.props.clientes.length > 0 }

  /** Obtener siguiente en la cola (por prioridad y fecha) */
  get siguiente(): ClienteEspera | undefined {
    if (!this.tieneClientes) return undefined
    return [...this.props.clientes]
      .sort((a, b) => {
        const prioridades = { 'urgente': 3, 'alta': 2, 'normal': 1 }
        const prioDiff = prioridades[b.prioridad] - prioridades[a.prioridad]
        if (prioDiff !== 0) return prioDiff
        return a.fechaRegistro.getTime() - b.fechaRegistro.getTime()
      })[0]
  }

  // ── Métodos ──

  agregarCliente(cliente: ClienteEspera): void {
    if (this.props.clientes.length >= this.props.maxEspera) {
      throw new Error(`Lista de espera llena (máx: ${this.props.maxEspera})`)
    }
    if (this.props.clientes.find(c => c.clienteId === cliente.clienteId)) {
      throw new Error(`Cliente ${cliente.clienteNombre} ya está en lista de espera`)
    }
    this.props.clientes.push(cliente)
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.addDomainEvent(`ClienteAgregadoListaEspera: ${cliente.clienteNombre} en ${this.props.programaNombre}`)
  }

  removerCliente(clienteId: string): void {
    const cliente = this.props.clientes.find(c => c.clienteId === clienteId)
    if (!cliente) throw new Error('Cliente no encontrado en lista de espera')
    this.props.clientes = this.props.clientes.filter(c => c.clienteId !== clienteId)
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.addDomainEvent(`ClienteRemovidoListaEspera: ${cliente.clienteNombre}`)
  }

  /** Notificar al siguiente cuando se libera un cupo */
  notificarSiguiente(): ClienteEspera | undefined {
    const next = this.siguiente
    if (!next) return undefined
    const idx = this.props.clientes.findIndex(c => c.clienteId === next.clienteId)
    if (idx >= 0) this.props.clientes[idx].notificado = true
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.addDomainEvent(`NotificacionListaEspera: Cupo liberado → ${next.clienteNombre}`)
    return next
  }

  private addDomainEvent(event: string): void { this._domainEvents.push(event) }
  clearDomainEvents(): void { this._domainEvents = [] }
  toSnapshot(): ListaEsperaProps { return { ...this.props } }
}
