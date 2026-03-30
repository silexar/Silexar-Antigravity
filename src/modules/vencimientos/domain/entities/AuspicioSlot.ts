/**
 * ENTIDAD: AUSPICIO SLOT - TIER 0 ENTERPRISE
 *
 * @description Espacio específico de auspicio con tipo, valor, estado y asignación.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

import { TipoAuspicio } from '../value-objects/TipoAuspicio.js'
import { EstadoAuspicio } from '../value-objects/EstadoAuspicio.js'
import { ValorComercial } from '../value-objects/ValorComercial.js'

export interface AuspicioSlotProps {
  id: string
  programaId: string
  emisoraId: string
  numeroCupo: number
  tipo: TipoAuspicio
  estado: EstadoAuspicio
  valor: ValorComercial

  // Asignación
  clienteId?: string
  clienteNombre?: string
  clienteRubro?: string
  ejecutivoId?: string
  ejecutivoNombre?: string

  // Reserva temporal
  reservadoPor?: string
  reservaExpira?: Date

  // Auditoría
  fechaCreacion: Date
  fechaActualizacion: Date
  version: number
}

export class AuspicioSlot {
  private _domainEvents: string[] = []

  private constructor(private props: AuspicioSlotProps) {}

  static create(props: Omit<AuspicioSlotProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'version'>): AuspicioSlot {
    const now = new Date()
    return new AuspicioSlot({
      ...props,
      id: `slot_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      fechaCreacion: now,
      fechaActualizacion: now,
      version: 1
    })
  }

  static fromPersistence(props: AuspicioSlotProps): AuspicioSlot {
    return new AuspicioSlot(props)
  }

  // ── Getters ──
  get id(): string { return this.props.id }
  get programaId(): string { return this.props.programaId }
  get emisoraId(): string { return this.props.emisoraId }
  get numeroCupo(): number { return this.props.numeroCupo }
  get tipo(): TipoAuspicio { return this.props.tipo }
  get estado(): EstadoAuspicio { return this.props.estado }
  get valor(): ValorComercial { return this.props.valor }
  get clienteId(): string | undefined { return this.props.clienteId }
  get clienteNombre(): string | undefined { return this.props.clienteNombre }
  get clienteRubro(): string | undefined { return this.props.clienteRubro }
  get ejecutivoId(): string | undefined { return this.props.ejecutivoId }
  get ejecutivoNombre(): string | undefined { return this.props.ejecutivoNombre }
  get version(): number { return this.props.version }
  get domainEvents(): string[] { return [...this._domainEvents] }

  get estaDisponible(): boolean {
    return !this.props.clienteId && !this.props.reservadoPor && !this.props.estado.ocupaCupo()
  }

  get estaReservado(): boolean {
    return !!this.props.reservadoPor && !!this.props.reservaExpira && new Date() < this.props.reservaExpira
  }

  get estaOcupado(): boolean {
    return this.props.estado.ocupaCupo()
  }

  // ── Métodos de negocio ──

  /** Reservar temporalmente (24h) para evitar doble-venta */
  reservar(ejecutivoId: string): void {
    if (!this.estaDisponible) throw new Error('Slot no disponible para reserva')
    const expira = new Date()
    expira.setHours(expira.getHours() + 24)
    this.props.reservadoPor = ejecutivoId
    this.props.reservaExpira = expira
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.addDomainEvent(`SlotReservado: Cupo #${this.props.numeroCupo} por ${ejecutivoId} (24h)`)
  }

  /** Liberar reserva temporal */
  liberarReserva(): void {
    this.props.reservadoPor = undefined
    this.props.reservaExpira = undefined
    this.props.fechaActualizacion = new Date()
    this.props.version++
  }

  /** Asignar cliente al slot */
  asignarCliente(data: {
    clienteId: string; clienteNombre: string; clienteRubro: string
    ejecutivoId: string; ejecutivoNombre: string
  }): void {
    if (this.estaOcupado) throw new Error('Slot ya está ocupado')
    this.props.clienteId = data.clienteId
    this.props.clienteNombre = data.clienteNombre
    this.props.clienteRubro = data.clienteRubro
    this.props.ejecutivoId = data.ejecutivoId
    this.props.ejecutivoNombre = data.ejecutivoNombre
    this.props.estado = EstadoAuspicio.pendiente()
    this.props.reservadoPor = undefined
    this.props.reservaExpira = undefined
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.addDomainEvent(`ClienteAsignado: ${data.clienteNombre} en cupo #${this.props.numeroCupo}`)
  }

  /** Liberar slot completamente */
  liberar(): void {
    const clienteAnterior = this.props.clienteNombre
    this.props.clienteId = undefined
    this.props.clienteNombre = undefined
    this.props.clienteRubro = undefined
    this.props.ejecutivoId = undefined
    this.props.ejecutivoNombre = undefined
    this.props.reservadoPor = undefined
    this.props.reservaExpira = undefined
    this.props.estado = EstadoAuspicio.pendiente()
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.addDomainEvent(`SlotLiberado: Cupo #${this.props.numeroCupo} (antes: ${clienteAnterior || 'vacío'})`)
  }

  cambiarEstado(nuevoEstado: EstadoAuspicio): void {
    if (!this.props.estado.puedeTransicionarA(nuevoEstado)) {
      throw new Error(`Transición de ${this.props.estado.valor} a ${nuevoEstado.valor} no permitida`)
    }
    this.props.estado = nuevoEstado
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.addDomainEvent(`EstadoCambiado: Cupo #${this.props.numeroCupo} → ${nuevoEstado.valor}`)
  }

  private addDomainEvent(event: string): void { this._domainEvents.push(event) }
  clearDomainEvents(): void { this._domainEvents = [] }
  toSnapshot(): AuspicioSlotProps { return { ...this.props } }
}
