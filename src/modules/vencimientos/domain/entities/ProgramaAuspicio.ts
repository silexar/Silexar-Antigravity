/**
 * ENTIDAD: PROGRAMA DE AUSPICIO - TIER 0 ENTERPRISE
 *
 * @description Entidad central que representa un programa con slots comerciales:
 * nombre, conductores, horario, cupos Tipo A/B/Menciones, derechos, métricas.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

import { HorarioEmision } from '../value-objects/HorarioEmision.js'
import { CupoDisponible } from '../value-objects/CupoDisponible.js'

export interface ConductorPrograma {
  id: string
  nombre: string
  rol: 'conductor_principal' | 'co_conductor' | 'productor' | 'panelista'
}

export interface ProgramaAuspicioProps {
  id: string
  emisoraId: string
  emisoraNombre: string
  nombre: string
  descripcion: string
  conductores: ConductorPrograma[]

  // Horario
  horario: HorarioEmision

  // Cupos por tipo
  cuposTipoA: CupoDisponible
  cuposTipoB: CupoDisponible
  cuposMenciones: CupoDisponible

  // Comercial
  revenueActual: number
  revenuePotencial: number
  listaEsperaCount: number

  // Estado
  estado: 'borrador' | 'activo' | 'pausado' | 'archivado'

  // Auditoría
  fechaCreacion: Date
  fechaActualizacion: Date
  creadoPor: string
  actualizadoPor: string
  version: number
}

export class ProgramaAuspicio {
  private _domainEvents: string[] = []

  private constructor(private props: ProgramaAuspicioProps) {
    this.validate()
  }

  static create(props: Omit<ProgramaAuspicioProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'version'>): ProgramaAuspicio {
    const now = new Date()
    return new ProgramaAuspicio({
      ...props,
      id: ProgramaAuspicio.generateId(),
      fechaCreacion: now,
      fechaActualizacion: now,
      version: 1
    })
  }

  static fromPersistence(props: ProgramaAuspicioProps): ProgramaAuspicio {
    return new ProgramaAuspicio(props)
  }

  private static generateId(): string {
    return `prog_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  private validate(): void {
    if (!this.props.nombre?.trim()) throw new Error('Nombre del programa es requerido')
    if (!this.props.emisoraId?.trim()) throw new Error('Emisora es requerida')
    if (this.props.conductores.length === 0) throw new Error('Al menos un conductor es requerido')
  }

  // ── Getters ──
  get id(): string { return this.props.id }
  get emisoraId(): string { return this.props.emisoraId }
  get emisoraNombre(): string { return this.props.emisoraNombre }
  get nombre(): string { return this.props.nombre }
  get descripcion(): string { return this.props.descripcion }
  get conductores(): ConductorPrograma[] { return [...this.props.conductores] }
  get horario(): HorarioEmision { return this.props.horario }
  get cuposTipoA(): CupoDisponible { return this.props.cuposTipoA }
  get cuposTipoB(): CupoDisponible { return this.props.cuposTipoB }
  get cuposMenciones(): CupoDisponible { return this.props.cuposMenciones }
  get revenueActual(): number { return this.props.revenueActual }
  get revenuePotencial(): number { return this.props.revenuePotencial }
  get listaEsperaCount(): number { return this.props.listaEsperaCount }
  get estado(): string { return this.props.estado }
  get fechaCreacion(): Date { return this.props.fechaCreacion }
  get fechaActualizacion(): Date { return this.props.fechaActualizacion }
  get version(): number { return this.props.version }
  get domainEvents(): string[] { return [...this._domainEvents] }

  /** Total general de cupos (todos los tipos) */
  get totalCupos(): number {
    return this.props.cuposTipoA.capacidadTotal +
      this.props.cuposTipoB.capacidadTotal +
      this.props.cuposMenciones.capacidadTotal
  }

  /** Total de cupos ocupados (todos los tipos) */
  get totalOcupados(): number {
    return this.props.cuposTipoA.cuposOcupados +
      this.props.cuposTipoB.cuposOcupados +
      this.props.cuposMenciones.cuposOcupados
  }

  /** Total de cupos disponibles */
  get totalDisponibles(): number {
    return this.props.cuposTipoA.disponibles +
      this.props.cuposTipoB.disponibles +
      this.props.cuposMenciones.disponibles
  }

  /** Porcentaje general de ocupación */
  get ocupacionGeneral(): number {
    if (this.totalCupos === 0) return 0
    return Math.round((this.totalOcupados / this.totalCupos) * 100)
  }

  /** Conductor principal */
  get conductorPrincipal(): ConductorPrograma | undefined {
    return this.props.conductores.find(c => c.rol === 'conductor_principal')
  }

  /** Nombres de conductores formateados */
  get conductoresDisplay(): string {
    return this.props.conductores.map(c => c.nombre).join(', ')
  }

  get esPrime(): boolean {
    return this.props.horario.esPrime()
  }

  get tieneEspacioDisponible(): boolean {
    return this.totalDisponibles > 0
  }

  get estaCompleto(): boolean {
    return this.totalDisponibles === 0
  }

  // ── Métodos de negocio ──

  agregarConductor(conductor: ConductorPrograma, responsable: string): void {
    if (this.props.conductores.find(c => c.id === conductor.id)) {
      throw new Error(`Conductor ${conductor.nombre} ya está asignado al programa`)
    }
    this.props.conductores.push(conductor)
    this.props.actualizadoPor = responsable
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.addDomainEvent(`ConductorAgregado: ${conductor.nombre}`)
  }

  removerConductor(conductorId: string, responsable: string): void {
    const conductor = this.props.conductores.find(c => c.id === conductorId)
    if (!conductor) throw new Error('Conductor no encontrado')
    if (this.props.conductores.length <= 1) throw new Error('El programa necesita al menos un conductor')
    this.props.conductores = this.props.conductores.filter(c => c.id !== conductorId)
    this.props.actualizadoPor = responsable
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.addDomainEvent(`ConductorRemovido: ${conductor.nombre}`)
  }

  actualizarCuposTipoA(cupos: CupoDisponible, responsable: string): void {
    this.props.cuposTipoA = cupos
    this.props.actualizadoPor = responsable
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.evaluarAlertas()
  }

  actualizarCuposTipoB(cupos: CupoDisponible, responsable: string): void {
    this.props.cuposTipoB = cupos
    this.props.actualizadoPor = responsable
    this.props.fechaActualizacion = new Date()
    this.props.version++
    this.evaluarAlertas()
  }

  actualizarCuposMenciones(cupos: CupoDisponible, responsable: string): void {
    this.props.cuposMenciones = cupos
    this.props.actualizadoPor = responsable
    this.props.fechaActualizacion = new Date()
    this.props.version++
  }

  actualizarRevenue(actual: number, potencial: number): void {
    this.props.revenueActual = actual
    this.props.revenuePotencial = potencial
    this.props.fechaActualizacion = new Date()
  }

  activar(): void {
    this.props.estado = 'activo'
    this.addDomainEvent(`ProgramaActivado: ${this.props.nombre}`)
  }

  pausar(): void {
    this.props.estado = 'pausado'
    this.addDomainEvent(`ProgramaPausado: ${this.props.nombre}`)
  }

  archivar(): void {
    this.props.estado = 'archivado'
    this.addDomainEvent(`ProgramaArchivado: ${this.props.nombre}`)
  }

  private evaluarAlertas(): void {
    if (this.props.cuposTipoA.nivelAlerta === 'rojo' || this.props.cuposTipoA.nivelAlerta === 'sin_cupo') {
      this.addDomainEvent(`AlertaCuposCriticos: Tipo A en ${this.props.nombre} — ${this.props.cuposTipoA.nivelAlertaDescripcion}`)
    }
    if (this.props.cuposTipoB.nivelAlerta === 'rojo' || this.props.cuposTipoB.nivelAlerta === 'sin_cupo') {
      this.addDomainEvent(`AlertaCuposCriticos: Tipo B en ${this.props.nombre} — ${this.props.cuposTipoB.nivelAlertaDescripcion}`)
    }
  }

  private addDomainEvent(event: string): void { this._domainEvents.push(event) }
  clearDomainEvents(): void { this._domainEvents = [] }
  toSnapshot(): ProgramaAuspicioProps { return { ...this.props } }
}
