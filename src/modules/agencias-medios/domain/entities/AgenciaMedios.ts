/**
 * 🏢 Entidad: AgenciaMedios
 * 
 * Entidad principal que representa una agencia de medios en el sistema
 * Incluye toda la información, capacidades y métricas de performance
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

import { v4 as uuidv4 } from 'uuid'
import { RutAgenciaMedios } from '../value-objects/RutAgenciaMedios'
import { TipoAgenciaMedios, TipoAgenciaMediosValue } from '../value-objects/TipoAgenciaMedios'
import { NivelColaboracion, NivelColaboracionValue } from '../value-objects/NivelColaboracion'
import { ScorePartnership, ClasificacionScore } from '../value-objects/ScorePartnership'

export interface AgenciaMediosProps {
    id?: string
    tenantId: string
    codigo: string
    rut: RutAgenciaMedios
    razonSocial: string
    nombreComercial?: string
    tipoAgencia: TipoAgenciaMedios
    nivelColaboracion: NivelColaboracion
    scorePartnership: ScorePartnership

    // Información de contacto
    emailGeneral?: string
    telefonoGeneral?: string
    paginaWeb?: string
    direccion?: string
    ciudad?: string
    region?: string
    pais?: string

    // Información comercial
    giroActividad?: string
    fechaFundacion?: Date
    empleadosCantidad?: number

    // Especializaciones
    especializacionesVerticales: string[]
    capacidadesDigitales: string[]
    certificaciones: string[]

    // Información financiera
    revenueAnual?: number
    comisionDefault?: number

    // Control de estado
    activa: boolean
    estado: 'activa' | 'inactiva' | 'suspendida' | 'pendiente'

    // Metadata
    creadoPor: string
    fechaCreacion: Date
    fechaModificacion?: Date
}

export interface PerformanceAgencia {
    revenueYTD: number
    revenueAnualAnterior: number
    crecimientoYoY: number
    satisfactionScore: number
    campaignsActivas: number
    campaignsCompletadas: number
    renewalProbability: number
    tendenciaScore: 'up' | 'down' | 'stable'
}

export interface MetricasAgencia {
    clientesActivos: number
    campaignsTotales: number
    revenueTotal: number
    comisionTotal: number
    promedioDuracionContrato: number
    scoreActual: number
}

/**
 * Entidad AgenciaMedios - Dominio completo
 */
export class AgenciaMedios {
    private props: AgenciaMediosProps

    constructor(props: AgenciaMediosProps) {
        this.props = {
            ...props,
            id: props.id || uuidv4(),
            activa: props.activa ?? true,
            estado: props.estado || 'activa',
            pais: props.pais || 'Chile',
            especializacionesVerticales: props.especializacionesVerticales || [],
            capacidadesDigitales: props.capacidadesDigitales || [],
            certificaciones: props.certificaciones || [],
            creadoPor: props.creadoPor,
            fechaCreacion: props.fechaCreacion || new Date()
        }
        this.validar()
    }

    private validar(): void {
        if (!this.props.tenantId?.trim()) {
            throw new Error('El tenantId es requerido')
        }
        if (!this.props.codigo?.trim()) {
            throw new Error('El código es requerido')
        }
        if (!this.props.razonSocial?.trim()) {
            throw new Error('La razón social es requerida')
        }
        if (!this.props.rut) {
            throw new Error('El RUT es requerido')
        }
        if (!this.props.tipoAgencia) {
            throw new Error('El tipo de agencia es requerido')
        }
        if (!this.props.creadoPor?.trim()) {
            throw new Error('El creador es requerido')
        }
    }

    // Getters principales
    get id(): string { return this.props.id! }
    get tenantId(): string { return this.props.tenantId }
    get codigo(): string { return this.props.codigo }
    get rut(): RutAgenciaMedios { return this.props.rut }
    get razonSocial(): string { return this.props.razonSocial }
    get nombreComercial(): string | undefined { return this.props.nombreComercial }
    get nombre(): string { return this.props.nombreComercial || this.props.razonSocial }
    get tipoAgencia(): TipoAgenciaMedios { return this.props.tipoAgencia }
    get nivelColaboracion(): NivelColaboracion { return this.props.nivelColaboracion }
    get scorePartnership(): ScorePartnership { return this.props.scorePartnership }

    get email(): string | undefined { return this.props.emailGeneral }
    get telefono(): string | undefined { return this.props.telefonoGeneral }
    get sitioWeb(): string | undefined { return this.props.paginaWeb }
    get direccion(): string | undefined { return this.props.direccion }
    get ciudad(): string | undefined { return this.props.ciudad }
    get region(): string | undefined { return this.props.region }
    get pais(): string { return this.props.pais || 'Chile' }

    get activa(): boolean { return this.props.activa }
    get estado(): string { return this.props.estado }

    get especializaciones(): string[] { return this.props.especializacionesVerticales }
    get capacidades(): string[] { return this.props.capacidadesDigitales }
    get certificaciones(): string[] { return this.props.certificaciones }

    get revenueAnual(): number | undefined { return this.props.revenueAnual }
    get comisionDefault(): number | undefined { return this.props.comisionDefault }

    get creadoPor(): string { return this.props.creadoPor }
    get fechaCreacion(): Date { return this.props.fechaCreacion }
    get fechaModificacion(): Date | undefined { return this.props.fechaModificacion }

    // Métodos de negocio

    /**
     * Verifica si la agencia está activa y puede operar
     */
    puedeOperar(): boolean {
        return this.props.activa && this.props.estado === 'activa'
    }

    /**
     * Verifica si tiene una certificación específica
     */
    tieneCertificacion(certificacion: string): boolean {
        return this.props.certificaciones.some(c =>
            c.toLowerCase().includes(certificacion.toLowerCase())
        )
    }

    /**
     * Verifica si puede atingir un nivel de partnership
     */
    puedeAlcanzarNivel(nivel: NivelColaboracionValue): boolean {
        return this.props.nivelColaboracion.puedeHacerUpgrade(
            new NivelColaboracion(nivel)
        )
    }

    /**
     * Agrega una especialización vertical
     */
    agregarEspecializacion(vertical: string): void {
        if (!this.props.especializacionesVerticales.includes(vertical)) {
            this.props.especializacionesVerticales.push(vertical)
            this.props.fechaModificacion = new Date()
        }
    }

    /**
     * Agrega una capacidad digital
     */
    agregarCapacidad(capacidad: string): void {
        if (!this.props.capacidadesDigitales.includes(capacidad)) {
            this.props.capacidadesDigitales.push(capacidad)
            this.props.fechaModificacion = new Date()
        }
    }

    /**
     * Agrega una certificación
     */
    agregarCertificacion(certificacion: string): void {
        if (!this.tieneCertificacion(certificacion)) {
            this.props.certificaciones.push(certificacion)
            this.props.fechaModificacion = new Date()
        }
    }

    /**
     * Activa la agencia
     */
    activar(): void {
        if (this.props.estado === 'suspendida') {
            throw new Error('No se puede activar una agencia suspendida')
        }
        this.props.activa = true
        this.props.estado = 'activa'
        this.props.fechaModificacion = new Date()
    }

    /**
     * Desactiva la agencia
     */
    desactivar(motivo?: string): void {
        this.props.activa = false
        this.props.estado = 'inactiva'
        this.props.fechaModificacion = new Date()
    }

    /**
     * Suspende la agencia
     */
    suspender(motivo: string): void {
        this.props.activa = false
        this.props.estado = 'suspendida'
        this.props.fechaModificacion = new Date()
    }

    /**
     * Actualiza el score de partnership
     */
    actualizarScore(nuevoScore: number, tendencia: 'up' | 'down' | 'stable'): void {
        this.props.scorePartnership = new ScorePartnership(nuevoScore, tendencia)
        this.props.fechaModificacion = new Date()
    }

    /**
     * Actualiza el nivel de colaboración basado en revenue
     */
    actualizarNivelPorRevenue(): void {
        if (this.props.revenueAnual !== undefined) {
            const { determinarNivelPorRevenue } = require('../value-objects/NivelColaboracion')
            this.props.nivelColaboracion = determinarNivelPorRevenue(this.props.revenueAnual)
            this.props.fechaModificacion = new Date()
        }
    }

    /**
     * Obtiene el resumen de performance
     */
    getPerformanceSummary(): PerformanceAgencia {
        return {
            revenueYTD: this.props.revenueAnual || 0,
            revenueAnualAnterior: 0,
            crecimientoYoY: 0,
            satisfactionScore: 0,
            campaignsActivas: 0,
            campaignsCompletadas: 0,
            renewalProbability: this.props.scorePartnership.value / 1000,
            tendenciaScore: this.props.scorePartnership.tendencia
        }
    }

    /**
     * Serializa la entidad para persistencia
     */
    toPersistence(): Record<string, unknown> {
        return {
            id: this.props.id,
            tenantId: this.props.tenantId,
            codigo: this.props.codigo,
            rut: this.props.rut.value,
            razonSocial: this.props.razonSocial,
            nombreComercial: this.props.nombreComercial,
            tipoAgencia: this.props.tipoAgencia.value,
            nivelColaboracion: this.props.nivelColaboracion.value,
            scorePartnership: this.props.scorePartnership.value,
            emailGeneral: this.props.emailGeneral,
            telefonoGeneral: this.props.telefonoGeneral,
            paginaWeb: this.props.paginaWeb,
            direccion: this.props.direccion,
            ciudad: this.props.ciudad,
            region: this.props.region,
            pais: this.props.pais,
            giroActividad: this.props.giroActividad,
            fechaFundacion: this.props.fechaFundacion,
            empleadosCantidad: this.props.empleadosCantidad,
            especializacionesVerticales: JSON.stringify(this.props.especializacionesVerticales),
            capacidadesDigitales: JSON.stringify(this.props.capacidadesDigitales),
            certificaciones: JSON.stringify(this.props.certificaciones),
            revenueAnual: this.props.revenueAnual,
            comisionDefault: this.props.comisionDefault,
            activa: this.props.activa,
            estado: this.props.estado,
            creadoPorId: this.props.creadoPor,
            fechaCreacion: this.props.fechaCreacion,
            fechaModificacion: this.props.fechaModificacion
        }
    }

    /**
     * Crea una entidad desde datos persistidos
     */
    static fromPersistence(data: Record<string, unknown>): AgenciaMedios {
        const rut = new RutAgenciaMedios(data.rut as string)
        const tipo = new TipoAgenciaMedios(data.tipoAgencia as TipoAgenciaMediosValue)
        const nivel = new NivelColaboracion(data.nivelColaboracion as NivelColaboracionValue)
        const score = new ScorePartnership(
            (data.scorePartnership as number) || 500,
            'stable'
        )

        let especializaciones: string[] = []
        let capacidades: string[] = []
        let certificaciones: string[] = []

        try {
            if (data.especializacionesVerticales && typeof data.especializacionesVerticales === 'string') {
                especializaciones = JSON.parse(data.especializacionesVerticales as string)
            }
            if (data.capacidadesDigitales && typeof data.capacidadesDigitales === 'string') {
                capacidades = JSON.parse(data.capacidadesDigitales as string)
            }
            if (data.certificaciones && typeof data.certificaciones === 'string') {
                certificaciones = JSON.parse(data.certificaciones as string)
            }
        } catch {
            // Si falla el parsing, usar arrays vacíos
        }

        return new AgenciaMedios({
            id: data.id as string,
            tenantId: data.tenantId as string,
            codigo: data.codigo as string,
            rut,
            razonSocial: data.razonSocial as string,
            nombreComercial: data.nombreComercial as string | undefined,
            tipoAgencia: tipo,
            nivelColaboracion: nivel,
            scorePartnership: score,
            emailGeneral: data.emailGeneral as string | undefined,
            telefonoGeneral: data.telefonoGeneral as string | undefined,
            paginaWeb: data.paginaWeb as string | undefined,
            direccion: data.direccion as string | undefined,
            ciudad: data.ciudad as string | undefined,
            region: data.region as string | undefined,
            pais: data.pais as string | undefined,
            giroActividad: data.giroActividad as string | undefined,
            fechaFundacion: data.fechaFundacion as Date | undefined,
            empleadosCantidad: data.empleadosCantidad as number | undefined,
            especializacionesVerticales: especializaciones,
            capacidadesDigitales: capacidades,
            certificaciones,
            revenueAnual: data.revenueAnual as number | undefined,
            comisionDefault: data.comisionDefault as number | undefined,
            activa: data.activa as boolean,
            estado: data.estado as 'activa' | 'inactiva' | 'suspendida' | 'pendiente',
            creadoPor: data.creadoPorId as string,
            fechaCreacion: data.fechaCreacion as Date,
            fechaModificacion: data.fechaModificacion as Date | undefined
        })
    }
}

/**
 * Crea una nueva agencia de medios con validación
 */
export function createAgenciaMedios(props: Omit<AgenciaMediosProps, 'id' | 'fechaCreacion'>): AgenciaMedios {
    return new AgenciaMedios({
        ...props,
        fechaCreacion: new Date()
    } as AgenciaMediosProps)
}
