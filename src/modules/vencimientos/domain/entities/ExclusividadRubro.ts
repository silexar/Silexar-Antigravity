/**
 * ENTIDAD: EXCLUSIVIDAD POR RUBRO - TIER 0 ENTERPRISE
 *
 * @description Reglas de exclusividad por rubro con detección automática
 * de conflictos entre anunciantes competidores.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

export type PoliticaExclusividad = 'exclusivo' | 'limitado' | 'sin_restriccion'

export interface ClienteEnRubro {
  clienteId: string
  clienteNombre: string
  subcategoria?: string
}

export interface ExclusividadRubroProps {
  id: string
  programaId: string
  emisoraId: string
  rubro: string
  politica: PoliticaExclusividad
  maxClientesPorPrograma: number
  clientesActuales: ClienteEnRubro[]
  requiereSeparacionMinutos: number
  validarBrandSafety: boolean
  notas: string
  estado: 'activa' | 'inactiva'
  fechaCreacion: Date
  fechaActualizacion: Date
  version: number
}

export class ExclusividadRubro {
  private _domainEvents: string[] = []

  private constructor(private props: ExclusividadRubroProps) {}

  static create(props: Omit<ExclusividadRubroProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'version'>): ExclusividadRubro {
    const now = new Date()
    return new ExclusividadRubro({
      ...props,
      id: `excl_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      fechaCreacion: now,
      fechaActualizacion: now,
      version: 1
    })
  }

  static fromPersistence(props: ExclusividadRubroProps): ExclusividadRubro {
    return new ExclusividadRubro(props)
  }

  // ── Getters ──
  get id(): string { return this.props.id }
  get programaId(): string { return this.props.programaId }
  get emisoraId(): string { return this.props.emisoraId }
  get rubro(): string { return this.props.rubro }
  get politica(): PoliticaExclusividad { return this.props.politica }
  get maxClientesPorPrograma(): number { return this.props.maxClientesPorPrograma }
  get clientesActuales(): ClienteEnRubro[] { return [...this.props.clientesActuales] }
  get requiereSeparacionMinutos(): number { return this.props.requiereSeparacionMinutos }
  get version(): number { return this.props.version }
  get domainEvents(): string[] { return [...this._domainEvents] }

  get espaciosDisponibles(): number {
    return Math.max(0, this.props.maxClientesPorPrograma - this.props.clientesActuales.length)
  }

  get estaCompleto(): boolean { return this.espaciosDisponibles === 0 }
  get tieneClientes(): boolean { return this.props.clientesActuales.length > 0 }

  get politicaLabel(): string {
    const labels: Record<PoliticaExclusividad, string> = {
      'exclusivo': '🚫 Exclusivo (1 cliente)',
      'limitado': `⚠️ Limitado (máx ${this.props.maxClientesPorPrograma})`,
      'sin_restriccion': '✅ Sin restricciones'
    }
    return labels[this.props.politica]
  }

  // ── Métodos de negocio ──

  /** Verifica si un nuevo cliente puede entrar sin conflicto */
  puedeIngresarCliente(clienteRubro: string, clienteNombre: string, subcategoria?: string): {
    permitido: boolean
    razon?: string
    conflictos?: ClienteEnRubro[]
  } {
    if (this.props.estado === 'inactiva') {
      return { permitido: true }
    }

    if (clienteRubro.toLowerCase() !== this.props.rubro.toLowerCase()) {
      return { permitido: true }
    }

    if (this.props.politica === 'sin_restriccion') {
      return { permitido: true }
    }

    if (this.estaCompleto) {
      return {
        permitido: false,
        razon: `Rubro "${this.props.rubro}" ha alcanzado el máximo de ${this.props.maxClientesPorPrograma} clientes`,
        conflictos: this.props.clientesActuales
      }
    }

    // Verificar competencia directa en misma subcategoría
    if (subcategoria) {
      const competidorDirecto = this.props.clientesActuales.find(
        c => c.subcategoria?.toLowerCase() === subcategoria.toLowerCase()
      )
      if (competidorDirecto && this.props.politica === 'exclusivo') {
        return {
          permitido: false,
          razon: `Competencia directa: ${competidorDirecto.clienteNombre} ya está en subcategoría "${subcategoria}"`,
          conflictos: [competidorDirecto]
        }
      }
    }

    return { permitido: true }
  }

  /** Registrar un nuevo cliente en el rubro */
  registrarCliente(cliente: ClienteEnRubro): void {
    const validacion = this.puedeIngresarCliente(this.props.rubro, cliente.clienteNombre, cliente.subcategoria)
    if (!validacion.permitido) {
      throw new Error(validacion.razon || 'No se puede registrar el cliente por conflicto de exclusividad')
    }
    this.props.clientesActuales.push(cliente)
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.addDomainEvent(`ClienteRegistradoEnRubro: ${cliente.clienteNombre} en ${this.props.rubro}`)
  }

  /** Remover un cliente del rubro */
  removerCliente(clienteId: string): void {
    const cliente = this.props.clientesActuales.find(c => c.clienteId === clienteId)
    if (!cliente) throw new Error('Cliente no encontrado en este rubro')
    this.props.clientesActuales = this.props.clientesActuales.filter(c => c.clienteId !== clienteId)
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.addDomainEvent(`ClienteRemovidoDeRubro: ${cliente.clienteNombre} de ${this.props.rubro}`)
  }

  private addDomainEvent(event: string): void { this._domainEvents.push(event) }
  clearDomainEvents(): void { this._domainEvents = [] }
  toSnapshot(): ExclusividadRubroProps { return { ...this.props } }
}
