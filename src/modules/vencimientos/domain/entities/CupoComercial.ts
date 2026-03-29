/**
 * ENTIDAD: CUPO COMERCIAL - TIER 0 ENTERPRISE
 *
 * @description Cupo individual con tracking completo: cliente, rubro,
 * inversión, ejecutivo, fechas, estado, historial de extensiones (R1).
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

import { TipoAuspicio } from '../value-objects/TipoAuspicio.js'
import { EstadoAuspicio } from '../value-objects/EstadoAuspicio.js'
import { ValorComercial } from '../value-objects/ValorComercial.js'
import { PeriodoVigencia } from '../value-objects/PeriodoVigencia.js'

export interface HistorialModificacion {
  id: string
  fecha: Date
  tipo: 'creacion' | 'extension' | 'cambio_estado' | 'cambio_fecha' | 'cambio_valor' | 'cancelacion'
  descripcion: string
  realizadoPor: string
  valorAnterior?: string
  valorNuevo?: string
}

export interface CupoComercialProps {
  id: string
  programaId: string
  programaNombre: string
  emisoraId: string
  emisoraNombre: string
  slotId: string

  // Tipo y estado
  tipoAuspicio: TipoAuspicio
  estado: EstadoAuspicio

  // Cliente
  clienteId: string
  clienteNombre: string
  clienteRubro: string
  clienteRut?: string

  // Inversión
  inversion: ValorComercial
  valorAuspicioCompleto: number
  valorMencionesIndividual: number

  // Fechas y vigencia
  periodoVigencia: PeriodoVigencia
  fechaIngresoCliente: Date

  // Ejecutivo
  ejecutivoId: string
  ejecutivoNombre: string

  // Extensiones (R1)
  numeroExtensiones: number
  extensionesHistorial: string[] // IDs de SolicitudExtension

  // Historial
  historialModificaciones: HistorialModificacion[]

  // Auditoría
  fechaCreacion: Date
  fechaActualizacion: Date
  creadoPor: string
  actualizadoPor: string
  version: number
}

export class CupoComercial {
  private _domainEvents: string[] = []

  private constructor(private props: CupoComercialProps) {
    this.validate()
  }

  static create(props: Omit<CupoComercialProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'version' | 'historialModificaciones' | 'numeroExtensiones' | 'extensionesHistorial'>): CupoComercial {
    const now = new Date()
    const cupo = new CupoComercial({
      ...props,
      id: `cupo_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      fechaCreacion: now,
      fechaActualizacion: now,
      version: 1,
      historialModificaciones: [],
      numeroExtensiones: 0,
      extensionesHistorial: []
    })
    cupo.agregarHistorial('creacion', `Cupo creado para ${props.clienteNombre}`, props.creadoPor)
    return cupo
  }

  static fromPersistence(props: CupoComercialProps): CupoComercial {
    return new CupoComercial(props)
  }

  private validate(): void {
    if (!this.props.clienteId?.trim()) throw new Error('Cliente es requerido')
    if (!this.props.ejecutivoId?.trim()) throw new Error('Ejecutivo es requerido')
    if (!this.props.programaId?.trim()) throw new Error('Programa es requerido')
  }

  // ── Getters ──
  get id(): string { return this.props.id }
  get programaId(): string { return this.props.programaId }
  get programaNombre(): string { return this.props.programaNombre }
  get emisoraId(): string { return this.props.emisoraId }
  get emisoraNombre(): string { return this.props.emisoraNombre }
  get tipoAuspicio(): TipoAuspicio { return this.props.tipoAuspicio }
  get estado(): EstadoAuspicio { return this.props.estado }
  get clienteId(): string { return this.props.clienteId }
  get clienteNombre(): string { return this.props.clienteNombre }
  get clienteRubro(): string { return this.props.clienteRubro }
  get inversion(): ValorComercial { return this.props.inversion }
  get valorAuspicioCompleto(): number { return this.props.valorAuspicioCompleto }
  get valorMencionesIndividual(): number { return this.props.valorMencionesIndividual }
  get periodoVigencia(): PeriodoVigencia { return this.props.periodoVigencia }
  get fechaIngresoCliente(): Date { return this.props.fechaIngresoCliente }
  get ejecutivoId(): string { return this.props.ejecutivoId }
  get ejecutivoNombre(): string { return this.props.ejecutivoNombre }
  get numeroExtensiones(): number { return this.props.numeroExtensiones }
  get historialModificaciones(): HistorialModificacion[] { return [...this.props.historialModificaciones] }
  get version(): number { return this.props.version }
  get domainEvents(): string[] { return [...this._domainEvents] }

  /** R1: Verifica si este cupo superó su fecha de inicio sin arrancar */
  get superoFechaInicio(): boolean {
    return this.props.periodoVigencia.superoFechaInicio() &&
           (this.props.estado.esPendiente() || this.props.estado.esConfirmado())
  }

  /** R1: Verifica si pasaron 48h sin iniciar */
  get supero48hSinIniciar(): boolean {
    return this.props.periodoVigencia.supero48hSinIniciar() &&
           (this.props.estado.esPendiente() || this.props.estado.esConfirmado() || this.props.estado.esNoIniciado())
  }

  /** Días restantes del cupo */
  get diasRestantes(): number { return this.props.periodoVigencia.diasRestantes }

  /** R2: Verifica si termina mañana */
  get terminaManana(): boolean { return this.props.periodoVigencia.terminaManana() }

  /** R2: Verifica si termina hoy */
  get terminaHoy(): boolean { return this.props.periodoVigencia.terminaHoy() }

  // ── Métodos de negocio ──

  /** Cambiar estado del cupo */
  cambiarEstado(nuevoEstado: EstadoAuspicio, responsable: string): void {
    const estadoAnterior = this.props.estado.valor
    if (!this.props.estado.puedeTransicionarA(nuevoEstado)) {
      throw new Error(`Transición de ${estadoAnterior} a ${nuevoEstado.valor} no permitida`)
    }
    this.props.estado = nuevoEstado
    this.props.actualizadoPor = responsable
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.agregarHistorial('cambio_estado', `Estado: ${estadoAnterior} → ${nuevoEstado.valor}`, responsable)
    this.addDomainEvent(`CupoEstadoCambiado: ${this.props.clienteNombre} ${estadoAnterior} → ${nuevoEstado.valor}`)
  }

  /** R1: Marcar como no iniciado */
  marcarNoIniciado(responsable: string): void {
    this.cambiarEstado(EstadoAuspicio.noIniciado(), responsable)
    this.addDomainEvent(`CupoNoIniciado: ${this.props.clienteNombre} superó fecha inicio sin arrancar`)
  }

  /** R1: Registrar extensión */
  registrarExtension(solicitudExtensionId: string, responsable: string): void {
    this.props.numeroExtensiones++
    this.props.extensionesHistorial.push(solicitudExtensionId)
    this.props.actualizadoPor = responsable
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.agregarHistorial('extension', `Extensión #${this.props.numeroExtensiones} registrada`, responsable)
    this.addDomainEvent(`CupoExtendido: ${this.props.clienteNombre} ext #${this.props.numeroExtensiones}`)
  }

  /** R1: Eliminar por no inicio (48h) */
  eliminarPorNoInicio(responsable: string): void {
    this.cambiarEstado(EstadoAuspicio.cancelado(), responsable)
    this.agregarHistorial('cancelacion', 'Eliminado por no inicio tras 48h (R1)', responsable)
    this.addDomainEvent(`CupoEliminado48h: ${this.props.clienteNombre} eliminado por no inicio`)
  }

  /** Actualizar inversión */
  actualizarInversion(nuevaInversion: ValorComercial, responsable: string): void {
    const anterior = this.props.inversion.valorFormateado
    this.props.inversion = nuevaInversion
    this.props.actualizadoPor = responsable
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.agregarHistorial('cambio_valor', `Inversión: ${anterior} → ${nuevaInversion.valorFormateado}`, responsable)
  }

  private agregarHistorial(tipo: HistorialModificacion['tipo'], descripcion: string, realizadoPor: string): void {
    this.props.historialModificaciones.push({
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fecha: new Date(),
      tipo,
      descripcion,
      realizadoPor
    })
  }

  private addDomainEvent(event: string): void { this._domainEvents.push(event) }
  clearDomainEvents(): void { this._domainEvents = [] }
  toSnapshot(): CupoComercialProps { return { ...this.props } }
}
