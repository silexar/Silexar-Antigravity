/**
 * ENTITY: PAQUETE - TIER 0 ENTERPRISE
 * 
 * @description Entidad principal del módulo Paquetes.
 * Representa un producto comercializable en el catálogo de Silexar Pulse.
 * 
 * @version 1.0.0
 * @tier TIER_0_FORTUNE_10
 */

import { Result } from '../../../shared/domain/Result'
import { CodigoPaquete } from '../value-objects/CodigoPaquete.js'
import { TipoPaquete, TipoPaqueteValues } from '../value-objects/TipoPaquete.js'
import { HorarioEmision } from '../value-objects/HorarioEmision.js'
import { DuracionPublicidad, DuracionValues } from '../value-objects/DuracionPublicidad.js'
import { NivelExclusividad, NivelExclusividadValues } from '../value-objects/NivelExclusividad.js'
import { PrecioBase } from '../value-objects/PrecioBase.js'

export type EstadoPaquete = 'ACTIVO' | 'INACTIVO' | 'MANTENIMIENTO' | 'BORRADO'

export interface PaqueteProps {
    id: string
    codigo: CodigoPaquete
    nombre: string
    descripcion: string
    tipo: TipoPaquete
    estado: EstadoPaquete

    // Emisora y programa
    editoraId: string
    editoraNombre: string
    programaId: string
    programaNombre: string

    // Horarios
    horario: HorarioEmision
    diasSemana: string[]

    // Duraciones disponibles
    duraciones: DuracionValues[]

    // Pricing
    precioBase: PrecioBase
    precioActual: number

    // Exclusividad
    nivelExclusividad: NivelExclusividad

    // Fechas
    vigenciaDesde: Date
    vigenciaHasta: Date

    // Metadatos
    createdAt: Date
    updatedAt: Date
    createdBy: string
    updatedBy: string
    version: number

    // Eventos de dominio
    domainEvents: string[]
}

export class Paquete {
    private props: PaqueteProps
    private _domainEvents: string[] = []

    private constructor(props: PaqueteProps) {
        this.props = props
    }

    // Factory methods
    static create(params: {
        nombre: string
        descripcion: string
        tipo: TipoPaqueteValues
        editoraId: string
        editoraNombre: string
        programaId: string
        programaNombre: string
        horario: { inicio: string; fin: string }
        diasSemana: string[]
        duraciones: DuracionValues[]
        precioBase: number
        nivelExclusividad: NivelExclusividadValues
        vigenciaDesde: Date
        vigenciaHasta: Date
        creadoPor: string
    }): Result<Paquete> {
        // Validaciones
        if (!params.nombre || params.nombre.trim().length === 0) {
            return Result.fail('Nombre es requerido')
        }
        if (params.nombre.length > 200) {
            return Result.fail('Nombre no puede exceder 200 caracteres')
        }
        if (params.diasSemana.length === 0) {
            return Result.fail('Al menos un día de la semana es requerido')
        }
        if (params.precioBase <= 0) {
            return Result.fail('Precio base debe ser mayor a 0')
        }

        const codigoResult = CodigoPaquete.generar()
        if (!codigoResult.success) {
            return Result.fail(codigoResult.error)
        }

        const horarioResult = HorarioEmision.crear(params.horario.inicio, params.horario.fin)
        if (!horarioResult.success) {
            return Result.fail(horarioResult.error!)
        }

        const precioBaseResult = PrecioBase.crear(params.precioBase)
        if (!precioBaseResult.success) {
            return Result.fail(precioBaseResult.error!)
        }

        const ahora = new Date()
        const props: PaqueteProps = {
            id: `paq_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            codigo: codigoResult.data,
            nombre: params.nombre.trim(),
            descripcion: params.descripcion.trim(),
            tipo: (() => {
                const r = TipoPaquete.create(params.tipo)
                if (!r.success) return Result.fail(r.error), null as never
                return r.data
            })(),
            estado: 'ACTIVO',
            editoraId: params.editoraId,
            editoraNombre: params.editoraNombre,
            programaId: params.programaId,
            programaNombre: params.programaNombre,
            horario: horarioResult.data,
            diasSemana: params.diasSemana,
            duraciones: params.duraciones,
            precioBase: precioBaseResult.data,
            precioActual: params.precioBase,
            nivelExclusividad: (() => {
                const r = NivelExclusividad.create(params.nivelExclusividad)
                if (!r.success) return Result.fail(r.error), null as never
                return r.data
            })(),
            vigenciaDesde: params.vigenciaDesde,
            vigenciaHasta: params.vigenciaHasta,
            createdAt: ahora,
            updatedAt: ahora,
            createdBy: params.creadoPor,
            updatedBy: params.creadoPor,
            version: 1,
            domainEvents: []
        }

        const paquete = new Paquete(props)
        paquete.addDomainEvent(`PaqueteCreado: ${props.codigo.value}`)
        return Result.ok(paquete)
    }

    static fromPersistence(props: PaqueteProps): Paquete {
        return new Paquete({ ...props, domainEvents: [] })
    }

    // Getters
    get id(): string { return this.props.id }
    get codigo(): CodigoPaquete { return this.props.codigo }
    get nombre(): string { return this.props.nombre }
    get descripcion(): string { return this.props.descripcion }
    get tipo(): TipoPaquete { return this.props.tipo }
    get estado(): EstadoPaquete { return this.props.estado }
    get editoraId(): string { return this.props.editoraId }
    get editoraNombre(): string { return this.props.editoraNombre }
    get programaId(): string { return this.props.programaId }
    get programaNombre(): string { return this.props.programaNombre }
    get horario(): HorarioEmision { return this.props.horario }
    get diasSemana(): string[] { return [...this.props.diasSemana] }
    get duraciones(): DuracionValues[] { return [...this.props.duraciones] }
    get precioBase(): PrecioBase { return this.props.precioBase }
    get precioActual(): number { return this.props.precioActual }
    get nivelExclusividad(): NivelExclusividad { return this.props.nivelExclusividad }
    get vigenciaDesde(): Date { return this.props.vigenciaDesde }
    get vigenciaHasta(): Date { return this.props.vigenciaHasta }
    get isActivo(): boolean { return this.props.estado === 'ACTIVO' }
    get version(): number { return this.props.version }
    get domainEvents(): string[] { return [...this._domainEvents] }

    // Business methods
    estaVigente(): boolean {
        const hoy = new Date()
        return hoy >= this.props.vigenciaDesde && hoy <= this.props.vigenciaHasta
    }

    calcularUtilizacion(cuposOcupados: number, cuposTotales: number): number {
        if (cuposTotales === 0) return 0
        return Math.round((cuposOcupados / cuposTotales) * 100 * 100) / 100
    }

    puedeSerVendido(): boolean {
        return this.isActivo && this.estaVigente()
    }

    // Commands
    actualizar(params: {
        nombre?: string
        descripcion?: string
        precioBase?: number
        duraciones?: DuracionValues[]
        diasSemana?: string[]
        horario?: { inicio: string; fin: string }
        nivelExclusividad?: NivelExclusividadValues
        vigenciaDesde?: Date
        vigenciaHasta?: Date
        actualizadoPor: string
    }): Result<void> {
        if (params.nombre !== undefined) {
            if (params.nombre.trim().length === 0) return Result.fail('Nombre no puede estar vacío')
            if (params.nombre.length > 200) return Result.fail('Nombre no puede exceder 200 caracteres')
            this.props.nombre = params.nombre.trim()
        }

        if (params.descripcion !== undefined) {
            this.props.descripcion = params.descripcion.trim()
        }

        if (params.precioBase !== undefined) {
            if (params.precioBase <= 0) return Result.fail('Precio debe ser mayor a 0')
            const precioResult = PrecioBase.crear(params.precioBase)
            if (!precioResult.success) return Result.fail(precioResult.error!)
            this.props.precioBase = precioResult.data
            this.props.precioActual = params.precioBase
        }

        if (params.duraciones !== undefined) {
            this.props.duraciones = params.duraciones
        }

        if (params.diasSemana !== undefined) {
            if (params.diasSemana.length === 0) return Result.fail('Al menos un día es requerido')
            this.props.diasSemana = params.diasSemana
        }

        if (params.horario !== undefined) {
            const horarioResult = HorarioEmision.crear(params.horario.inicio, params.horario.fin)
            if (!horarioResult.success) return Result.fail(horarioResult.error)
            this.props.horario = horarioResult.data
        }

        if (params.nivelExclusividad !== undefined) {
            const nivelResult = NivelExclusividad.create(params.nivelExclusividad)
            if (!nivelResult.success) return Result.fail(nivelResult.error!)
            this.props.nivelExclusividad = nivelResult.data
        }

        if (params.vigenciaDesde !== undefined) this.props.vigenciaDesde = params.vigenciaDesde
        if (params.vigenciaHasta !== undefined) this.props.vigenciaHasta = params.vigenciaHasta

        this.props.updatedAt = new Date()
        this.props.updatedBy = params.actualizadoPor
        this.props.version++
        this.addDomainEvent(`PaqueteActualizado: ${this.props.codigo.value}`)
        return { success: true as const, data: undefined as void }
    }

    activar(responsable: string): void {
        if (this.props.estado === 'BORRADO') {
            throw new Error('No se puede activar un paquete borrado')
        }
        this.props.estado = 'ACTIVO'
        this.props.updatedAt = new Date()
        this.props.updatedBy = responsable
        this.props.version++
        this.addDomainEvent(`PaqueteActivado: ${this.props.codigo.value}`)
    }

    desactivar(responsable: string, motivo: string): void {
        this.props.estado = 'INACTIVO'
        this.props.updatedAt = new Date()
        this.props.updatedBy = responsable
        this.props.version++
        this.addDomainEvent(`PaqueteDesactivado: ${this.props.codigo.value} - ${motivo}`)
    }

    marcarComoBorrado(responsable: string): void {
        this.props.estado = 'BORRADO'
        this.props.updatedAt = new Date()
        this.props.updatedBy = responsable
        this.props.version++
        this.addDomainEvent(`PaqueteBorrado: ${this.props.codigo.value}`)
    }

    establecerPrecioActual(precio: number, responsable: string): void {
        if (precio < 0) throw new Error('Precio no puede ser negativo')
        this.props.precioActual = precio
        this.props.updatedAt = new Date()
        this.props.updatedBy = responsable
        this.props.version++
        this.addDomainEvent(`PrecioActualizado: ${this.props.codigo.value} → $${precio.toLocaleString('es-CL')}`)
    }

    // Snapshot
    toSnapshot(): PaqueteProps {
        return { ...this.props }
    }

    private addDomainEvent(event: string): void {
        this._domainEvents.push(event)
    }

    clearDomainEvents(): void {
        this._domainEvents = []
    }
}