/**
 * ENTIDAD: SOLICITUD DE EXTENSIÓN - TIER 0 ENTERPRISE (R1)
 *
 * @description Solicitud de extensión de fecha con cadena de aprobación escalonada.
 * 1ª ext: automática | 2ª ext: jefe comercial | 3ª+: gerente comercial
 * Todo queda registrado en historial inmutable.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

import { NivelAprobacion } from '../value-objects/NivelAprobacion.js'
import { PeriodoVigencia } from '../value-objects/PeriodoVigencia.js'

export interface SolicitudExtensionProps {
  id: string
  cupoComercialId: string
  programaId: string
  emisoraId: string
  clienteId: string
  clienteNombre: string
  ejecutivoId: string
  ejecutivoNombre: string

  // Fechas
  periodoOriginal: PeriodoVigencia
  periodoSolicitado: PeriodoVigencia
  motivoSolicitud: string

  // Aprobación escalonada (R1)
  nivelAprobacion: NivelAprobacion
  extensionesPrevias: number

  // Estado
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada'

  // Auditoría
  fechaCreacion: Date
  fechaActualizacion: Date
  version: number
}

export class SolicitudExtension {
  private _domainEvents: string[] = []

  private constructor(private props: SolicitudExtensionProps) {
    this.validate()
  }

  static create(data: {
    cupoComercialId: string
    programaId: string
    emisoraId: string
    clienteId: string
    clienteNombre: string
    ejecutivoId: string
    ejecutivoNombre: string
    periodoOriginal: PeriodoVigencia
    nuevaFechaInicio: Date
    nuevaFechaFin: Date
    motivoSolicitud: string
    extensionesPrevias: number
  }): SolicitudExtension {
    const now = new Date()
    const periodoSolicitado = PeriodoVigencia.create({
      fechaInicio: data.nuevaFechaInicio,
      fechaFin: data.nuevaFechaFin
    })
    const nivelAprobacion = NivelAprobacion.calcularNivel(data.extensionesPrevias)

    const solicitud = new SolicitudExtension({
      id: `ext_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      cupoComercialId: data.cupoComercialId,
      programaId: data.programaId,
      emisoraId: data.emisoraId,
      clienteId: data.clienteId,
      clienteNombre: data.clienteNombre,
      ejecutivoId: data.ejecutivoId,
      ejecutivoNombre: data.ejecutivoNombre,
      periodoOriginal: data.periodoOriginal,
      periodoSolicitado,
      motivoSolicitud: data.motivoSolicitud,
      nivelAprobacion,
      extensionesPrevias: data.extensionesPrevias,
      estado: 'pendiente',
      fechaCreacion: now,
      fechaActualizacion: now,
      version: 1
    })

    // Auto-aprobación si es nivel automático (1ª extensión)
    if (nivelAprobacion.esAutoAprobable()) {
      solicitud.autoAprobar()
    } else {
      solicitud.addDomainEvent(
        `ExtensionSolicitada: ${data.clienteNombre} requiere ${nivelAprobacion.descripcionNivel}`
      )
    }

    return solicitud
  }

  static fromPersistence(props: SolicitudExtensionProps): SolicitudExtension {
    return new SolicitudExtension(props)
  }

  private validate(): void {
    if (!this.props.cupoComercialId?.trim()) throw new Error('Cupo comercial es requerido')
    if (!this.props.motivoSolicitud?.trim()) throw new Error('Motivo de solicitud es requerido')
  }

  // ── Getters ──
  get id(): string { return this.props.id }
  get cupoComercialId(): string { return this.props.cupoComercialId }
  get programaId(): string { return this.props.programaId }
  get emisoraId(): string { return this.props.emisoraId }
  get clienteId(): string { return this.props.clienteId }
  get clienteNombre(): string { return this.props.clienteNombre }
  get ejecutivoId(): string { return this.props.ejecutivoId }
  get ejecutivoNombre(): string { return this.props.ejecutivoNombre }
  get periodoOriginal(): PeriodoVigencia { return this.props.periodoOriginal }
  get periodoSolicitado(): PeriodoVigencia { return this.props.periodoSolicitado }
  get motivoSolicitud(): string { return this.props.motivoSolicitud }
  get nivelAprobacion(): NivelAprobacion { return this.props.nivelAprobacion }
  get extensionesPrevias(): number { return this.props.extensionesPrevias }
  get estado(): string { return this.props.estado }
  get version(): number { return this.props.version }
  get domainEvents(): string[] { return [...this._domainEvents] }

  get requiereAprobacionManual(): boolean {
    return this.props.nivelAprobacion.requiereAprobacionManual()
  }

  get numeroExtensionActual(): number {
    return this.props.extensionesPrevias + 1
  }

  get estadoLabel(): string {
    const labels: Record<string, string> = {
      'pendiente': '⏳ Pendiente aprobación',
      'aprobada': '✅ Aprobada',
      'rechazada': '❌ Rechazada',
      'cancelada': '🚫 Cancelada'
    }
    return labels[this.props.estado] || this.props.estado
  }

  // ── Métodos de negocio ──

  /** Auto-aprobación para 1ª extensión */
  private autoAprobar(): void {
    this.props.nivelAprobacion = this.props.nivelAprobacion.autoAprobar()
    this.props.estado = 'aprobada'
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.addDomainEvent(`ExtensionAutoAprobada: ${this.props.clienteNombre} (1ª extensión)`)
  }

  /** Aprobar manualmente (jefe/gerente comercial) */
  aprobar(aprobadorId: string, aprobadorNombre: string): void {
    if (this.props.estado !== 'pendiente') {
      throw new Error(`No se puede aprobar: estado actual = ${this.props.estado}`)
    }
    this.props.nivelAprobacion = this.props.nivelAprobacion.aprobar(aprobadorId, aprobadorNombre)
    this.props.estado = 'aprobada'
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.addDomainEvent(
      `ExtensionAprobada: ${this.props.clienteNombre} por ${aprobadorNombre} (ext #${this.numeroExtensionActual})`
    )
  }

  /** Rechazar extensión */
  rechazar(aprobadorId: string, aprobadorNombre: string, motivo: string): void {
    if (this.props.estado !== 'pendiente') {
      throw new Error(`No se puede rechazar: estado actual = ${this.props.estado}`)
    }
    this.props.nivelAprobacion = this.props.nivelAprobacion.rechazar(aprobadorId, aprobadorNombre, motivo)
    this.props.estado = 'rechazada'
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.addDomainEvent(
      `ExtensionRechazada: ${this.props.clienteNombre} por ${aprobadorNombre} — ${motivo}`
    )
  }

  cancelar(): void {
    this.props.estado = 'cancelada'
    this.props.fechaActualizacion = new Date()
    this.props.version++
  }

  private addDomainEvent(event: string): void { this._domainEvents.push(event) }
  clearDomainEvents(): void { this._domainEvents = [] }
  toSnapshot(): SolicitudExtensionProps { return { ...this.props } }
}
