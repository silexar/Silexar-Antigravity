/**
 * 🏢 Entidad: ContactoAgencia
 * 
 * Representa las personas clave dentro de una agencia de medios
 * Include información de contacto, rol y nivel de decisión
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

import { v4 as uuidv4 } from 'uuid'

export enum RolContactoAgencia {
    CEO_COUNTRY_MANAGER = 'CEO_COUNTRY_MANAGER',
    DIRECTOR_GENERAL = 'DIRECTOR_GENERAL',
    CLIENT_SERVICE_DIRECTOR = 'CLIENT_SERVICE_DIRECTOR',
    MEDIA_DIRECTOR = 'MEDIA_DIRECTOR',
    DIGITAL_DIRECTOR = 'DIGITAL_DIRECTOR',
    PLANNING_DIRECTOR = 'PLANNING_DIRECTOR',
    ACCOUNT_MANAGER = 'ACCOUNT_MANAGER',
    CONTACT_PRINCIPAL = 'CONTACT_PRINCIPAL',
    SUPPORT_CONTACT = 'SUPPORT_CONTACT'
}

export enum NivelDecision {
    ESTRATEGICO = 'ESTRATEGICO',     // Decide presupuesto y estrategia
    TACTICO = 'TACTICO',            // Decide implementación
    OPERATIVO = 'OPERATIVO'         // Ejecuta operaciones
}

export interface ContactoAgenciaProps {
    id?: string
    tenantId: string
    agenciaId: string
    nombre: string
    apellido: string
    email: string
    telefono?: string
    telefonoMovil?: string
    cargo?: string
    departamento?: string
    rol: RolContactoAgencia
    nivelDecision: NivelDecision
    esPrincipal: boolean
    esDecisor: boolean
    esInfluencer: boolean
    linkedIn?: string
    fotoUrl?: string
    notas?: string
    activa: boolean
    creadoPor: string
    fechaCreacion: Date
    fechaModificacion?: Date
}

/**
 * Entidad ContactoAgencia
 */
export class ContactoAgencia {
    private props: ContactoAgenciaProps

    constructor(props: ContactoAgenciaProps) {
        this.props = {
            ...props,
            id: props.id || uuidv4(),
            activa: props.activa ?? true,
            esPrincipal: props.esPrincipal ?? false,
            esDecisor: props.esDecisor ?? false,
            esInfluencer: props.esInfluencer ?? false,
            rol: props.rol || RolContactoAgencia.CONTACT_PRINCIPAL,
            nivelDecision: props.nivelDecision || NivelDecision.OPERATIVO,
            creadoPor: props.creadoPor,
            fechaCreacion: props.fechaCreacion || new Date()
        }
        this.validar()
    }

    private validar(): void {
        if (!this.props.tenantId?.trim()) {
            throw new Error('El tenantId es requerido')
        }
        if (!this.props.agenciaId?.trim()) {
            throw new Error('El ID de la agencia es requerido')
        }
        if (!this.props.nombre?.trim()) {
            throw new Error('El nombre es requerido')
        }
        if (!this.props.apellido?.trim()) {
            throw new Error('El apellido es requerido')
        }
        if (!this.props.email?.trim()) {
            throw new Error('El email es requerido')
        }
        if (!this.props.email.includes('@')) {
            throw new Error('El email no es válido')
        }
        if (!this.props.creadoPor?.trim()) {
            throw new Error('El creador es requerido')
        }
    }

    // Getters
    get id(): string { return this.props.id! }
    get tenantId(): string { return this.props.tenantId }
    get agenciaId(): string { return this.props.agenciaId }
    get nombre(): string { return this.props.nombre }
    get apellido(): string { return this.props.apellido }
    get nombreCompleto(): string { return `${this.props.nombre} ${this.props.apellido}` }
    get email(): string { return this.props.email }
    get telefono(): string | undefined { return this.props.telefono }
    get telefonoMovil(): string | undefined { return this.props.telefonoMovil }
    get cargo(): string | undefined { return this.props.cargo }
    get departamento(): string | undefined { return this.props.departamento }
    get rol(): RolContactoAgencia { return this.props.rol }
    get nivelDecision(): NivelDecision { return this.props.nivelDecision }
    get esPrincipal(): boolean { return this.props.esPrincipal }
    get esDecisor(): boolean { return this.props.esDecisor }
    get esInfluencer(): boolean { return this.props.esInfluencer }
    get linkedIn(): string | undefined { return this.props.linkedIn }
    get fotoUrl(): string | undefined { return this.props.fotoUrl }
    get notas(): string | undefined { return this.props.notas }
    get activa(): boolean { return this.props.activa }
    get creadoPor(): string { return this.props.creadoPor }
    get fechaCreacion(): Date { return this.props.fechaCreacion }
    get fechaModificacion(): Date | undefined { return this.props.fechaModificacion }

    /**
     * Verifica si puede tomar decisiones de cierto nivel
     */
    puedeDecidir(nivel: NivelDecision): boolean {
        const orden: Record<NivelDecision, number> = {
            [NivelDecision.ESTRATEGICO]: 3,
            [NivelDecision.TACTICO]: 2,
            [NivelDecision.OPERATIVO]: 1
        }
        return orden[this.props.nivelDecision] >= orden[nivel]
    }

    /**
     * Verifica si es un contacto de alto impacto
     */
    esAltoImpacto(): boolean {
        return this.esDecisor || this.props.rol === RolContactoAgencia.CEO_COUNTRY_MANAGER ||
            this.props.rol === RolContactoAgencia.DIRECTOR_GENERAL
    }

    /**
     * Establece como contacto principal
     */
    establecerPrincipal(): void {
        this.props.esPrincipal = true
        this.props.rol = RolContactoAgencia.CONTACT_PRINCIPAL
        this.props.fechaModificacion = new Date()
    }

    /**
     * Desactiva el contacto
     */
    desactivar(motivo?: string): void {
        this.props.activa = false
        this.props.fechaModificacion = new Date()
    }

    /**
     * Activa el contacto
     */
    activar(): void {
        this.props.activa = true
        this.props.fechaModificacion = new Date()
    }

    /**
     * Actualiza información de contacto
     */
    actualizar(data: Partial<{
        telefono: string
        telefonoMovil: string
        cargo: string
        linkedIn: string
        notas: string
    }>): void {
        if (data.telefono !== undefined) this.props.telefono = data.telefono
        if (data.telefonoMovil !== undefined) this.props.telefonoMovil = data.telefonoMovil
        if (data.cargo !== undefined) this.props.cargo = data.cargo
        if (data.linkedIn !== undefined) this.props.linkedIn = data.linkedIn
        if (data.notas !== undefined) this.props.notas = data.notas
        this.props.fechaModificacion = new Date()
    }

    /**
     * Serializa para persistencia
     */
    toPersistence(): Record<string, unknown> {
        return {
            id: this.props.id,
            tenantId: this.props.tenantId,
            agenciaId: this.props.agenciaId,
            nombre: this.props.nombre,
            apellido: this.props.apellido,
            email: this.props.email,
            telefono: this.props.telefono,
            telefonoMovil: this.props.telefonoMovil,
            cargo: this.props.cargo,
            departamento: this.props.departamento,
            rol: this.props.rol,
            nivelDecision: this.props.nivelDecision,
            esPrincipal: this.props.esPrincipal,
            esDecisor: this.props.esDecisor,
            esInfluencer: this.props.esInfluencer,
            linkedIn: this.props.linkedIn,
            fotoUrl: this.props.fotoUrl,
            notas: this.props.notas,
            activa: this.props.activa,
            creadoPorId: this.props.creadoPor,
            fechaCreacion: this.props.fechaCreacion,
            fechaModificacion: this.props.fechaModificacion
        }
    }

    /**
     * Crea desde datos persistidos
     */
    static fromPersistence(data: Record<string, unknown>): ContactoAgencia {
        return new ContactoAgencia({
            id: data.id as string,
            tenantId: data.tenantId as string,
            agenciaId: data.agenciaId as string,
            nombre: data.nombre as string,
            apellido: data.apellido as string,
            email: data.email as string,
            telefono: data.telefono as string | undefined,
            telefonoMovil: data.telefonoMovil as string | undefined,
            cargo: data.cargo as string | undefined,
            departamento: data.departamento as string | undefined,
            rol: data.rol as RolContactoAgencia,
            nivelDecision: data.nivelDecision as NivelDecision,
            esPrincipal: data.esPrincipal as boolean,
            esDecisor: data.esDecisor as boolean,
            esInfluencer: data.esInfluencer as boolean,
            linkedIn: data.linkedIn as string | undefined,
            fotoUrl: data.fotoUrl as string | undefined,
            notas: data.notas as string | undefined,
            activa: data.activa as boolean,
            creadoPor: data.creadoPorId as string,
            fechaCreacion: data.fechaCreacion as Date,
            fechaModificacion: data.fechaModificacion as Date | undefined
        })
    }
}

/**
 * Crea un nuevo contacto con validación
 */
export function createContactoAgencia(
    props: Omit<ContactoAgenciaProps, 'id' | 'fechaCreacion'>
): ContactoAgencia {
    return new ContactoAgencia({
        ...props,
        fechaCreacion: new Date()
    } as ContactoAgenciaProps)
}
