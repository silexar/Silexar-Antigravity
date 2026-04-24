/**
 * 🏢 Value Object: NivelColaboracion
 * 
 * Define el nivel de colaboración/partnership con la agencia
 * Basado en revenue anual y potencial de crecimiento
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

import { TipoAgenciaMediosValue } from './TipoAgenciaMedios'

export enum NivelColaboracionValue {
    ESTRATEGICO = 'ESTRATEGICO',         // $100M+ revenue anual
    PREFERENCIAL = 'PREFERENCIAL',       // $50M-100M revenue
    ESTANDAR = 'ESTANDAR',               // $10M-50M revenue
    TRANSACCIONAL = 'TRANSACCIONAL',     // $1M-10M revenue
    PROSPECTO = 'PROSPECTO'              // Sin revenue histórico
}

export interface NivelColaboracionConfig {
    nombre: string
    icono: string
    descripcion: string
    revenueMinAnual: number
    commissionMin: number
    commissionMax: number
    beneficios: string[]
    requiereContratoMarco: boolean
    nivelMinimoPersonal: number
}

const NIVELES_CONFIG: Record<NivelColaboracionValue, NivelColaboracionConfig> = {
    [NivelColaboracionValue.ESTRATEGICO]: {
        nombre: 'Estratégico',
        icono: '🌟',
        descripcion: 'Partnership estratégico de máximo nivel',
        revenueMinAnual: 100000000,
        commissionMin: 12,
        commissionMax: 20,
        beneficios: [
            'Ejecutivo de cuenta dedicado',
            'Acceso prioritario a inventario',
            'Términos comerciales preferenciales',
            'Participación en roadmap de producto',
            'acceso a nuevos formatos primero',
            'Team de soporte expandido'
        ],
        requiereContratoMarco: true,
        nivelMinimoPersonal: 5
    },
    [NivelColaboracionValue.PREFERENCIAL]: {
        nombre: 'Preferencial',
        icono: '💎',
        descripcion: 'Partnership preferencial con beneficios exclusivos',
        revenueMinAnual: 50000000,
        commissionMin: 10,
        commissionMax: 17,
        beneficios: [
            'Descuentos por volumen',
            'Prioridad en soporte técnico',
            'Acceso a datos exclusivos de mercado',
            'Invitaciones a eventos exclusivos'
        ],
        requiereContratoMarco: true,
        nivelMinimoPersonal: 3
    },
    [NivelColaboracionValue.ESTANDAR]: {
        nombre: 'Estándar',
        icono: '🥇',
        descripcion: 'Partnership estándar con términos comerciales definidos',
        revenueMinAnual: 10000000,
        commissionMin: 8,
        commissionMax: 15,
        beneficios: [
            'Soporte técnico estándar',
            'Acceso a analytics básicos',
            'Descuentos por pronto pago'
        ],
        requiereContratoMarco: false,
        nivelMinimoPersonal: 1
    },
    [NivelColaboracionValue.TRANSACCIONAL]: {
        nombre: 'Transaccional',
        icono: '🥈',
        descripcion: 'Relación comercial transaccional',
        revenueMinAnual: 1000000,
        commissionMin: 5,
        commissionMax: 12,
        beneficios: [
            'Términos comerciales estándar',
            'Soporte por email'
        ],
        requiereContratoMarco: false,
        nivelMinimoPersonal: 0
    },
    [NivelColaboracionValue.PROSPECTO]: {
        nombre: 'Prospecto',
        icono: '🆕',
        descripcion: 'Prospecto sin revenue histórico aún',
        revenueMinAnual: 0,
        commissionMin: 0,
        commissionMax: 10,
        beneficios: [
            'Periodo de evaluación',
            'Soporte limitado',
            'Sin compromisos de volumen'
        ],
        requiereContratoMarco: false,
        nivelMinimoPersonal: 0
    }
}

/**
 * Value Object para el nivel de colaboración
 */
export class NivelColaboracion {
    private readonly _value: NivelColaboracionValue

    constructor(value: NivelColaboracionValue) {
        if (!Object.values(NivelColaboracionValue).includes(value)) {
            throw new Error(`Nivel de colaboración inválido: ${value}`)
        }
        this._value = value
    }

    get value(): NivelColaboracionValue {
        return this._value
    }

    get config(): NivelColaboracionConfig {
        return NIVELES_CONFIG[this._value]
    }

    get nombre(): string {
        return this.config.nombre
    }

    get icono(): string {
        return this.config.icono
    }

    get descripcion(): string {
        return this.config.descripcion
    }

    get beneficios(): string[] {
        return this.config.beneficios
    }

    get commissionRange(): { min: number; max: number } {
        return { min: this.config.commissionMin, max: this.config.commissionMax }
    }

    get requiereContratoMarco(): boolean {
        return this.config.requiereContratoMarco
    }

    /**
     * Determina si puede hacer upgrade a otro nivel
     */
    puedeHacerUpgrade(other: NivelColaboracion): boolean {
        const ordenJerarquico: Record<NivelColaboracionValue, number> = {
            [NivelColaboracionValue.PROSPECTO]: 0,
            [NivelColaboracionValue.TRANSACCIONAL]: 1,
            [NivelColaboracionValue.ESTANDAR]: 2,
            [NivelColaboracionValue.PREFERENCIAL]: 3,
            [NivelColaboracionValue.ESTRATEGICO]: 4
        }
        return ordenJerarquico[other._value] > ordenJerarquico[this._value]
    }

    equals(other: NivelColaboracion): boolean {
        return this._value === other._value
    }

    toString(): string {
        return `${this.config.icono} ${this.config.nombre}`
    }
}

/**
 * Determina el nivel de colaboración basado en revenue
 */
export function determinarNivelPorRevenue(revenueAnual: number): NivelColaboracion {
    if (revenueAnual >= 100000000) {
        return new NivelColaboracion(NivelColaboracionValue.ESTRATEGICO)
    }
    if (revenueAnual >= 50000000) {
        return new NivelColaboracion(NivelColaboracionValue.PREFERENCIAL)
    }
    if (revenueAnual >= 10000000) {
        return new NivelColaboracion(NivelColaboracionValue.ESTANDAR)
    }
    if (revenueAnual >= 1000000) {
        return new NivelColaboracion(NivelColaboracionValue.TRANSACCIONAL)
    }
    return new NivelColaboracion(NivelColaboracionValue.PROSPECTO)
}

/**
 * Crea un NivelColaboracion con validación
 */
export function createNivelColaboracion(value: NivelColaboracionValue): NivelColaboracion {
    return new NivelColaboracion(value)
}
