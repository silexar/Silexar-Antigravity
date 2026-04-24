/**
 * 🏢 Value Object: TipoAgenciaMedios
 * 
 * Define los diferentes tipos de agencias de medios
 * y sus características específicas en el mercado chileno
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

export enum NivelColaboracionValue {
    ESTRATEGICO = 'ESTRATEGICO',         // $100M+ revenue anual
    PREFERENCIAL = 'PREFERENCIAL',       // $50M-100M revenue
    ESTANDAR = 'ESTANDAR',               // $10M-50M revenue
    TRANSACCIONAL = 'TRANSACCIONAL',     // $1M-10M revenue
    PROSPECTO = 'PROSPECTO'             // Sin revenue histórico
}

export enum TipoAgenciaMediosValue {
    FULL_SERVICE = 'FULL_SERVICE',       // Agencia integral
    BOUTIQUE = 'BOUTIQUE',               // Agencia especializada en nicho
    DIGITAL = 'DIGITAL',                  // Agencia digital pura
    MEDIA_BUYING = 'MEDIA_BUYING',       // Compra de medios
    SPECIALIZED = 'SPECIALIZED',         // Especializada por vertical
    INDEPENDENT = 'INDEPENDENT'         // Independiente
}

export interface TipoAgenciaCaracteristicas {
    descripcion: string
    tamanoTipico: 'grande' | 'mediano' | 'pequeno'
    especializacionTipica: string[]
    serviciosTipicos: string[]
    comisionesTipicas: { min: number; max: number }
    nivelPartnershipMin: NivelColaboracionValue
}

/**
 * Características por tipo de agencia
 */
const CARACTERISTICAS_POR_TIPO: Record<TipoAgenciaMediosValue, TipoAgenciaCaracteristicas> = {
    [TipoAgenciaMediosValue.FULL_SERVICE]: {
        descripcion: 'Agencia que ofrece servicios integrales de medios y estrategia',
        tamanoTipico: 'grande',
        especializacionTipica: ['TV', 'Radio', 'Digital', 'Print', 'OOH'],
        serviciosTipicos: ['Planificación', 'Compra', 'Estrategia', 'Analytics', 'Content'],
        comisionesTipicas: { min: 10, max: 20 },
        nivelPartnershipMin: NivelColaboracionValue.PREFERENCIAL
    },
    [TipoAgenciaMediosValue.BOUTIQUE]: {
        descripcion: 'Agencia especializada en nichos específicos de mercado',
        tamanoTipico: 'pequeno',
        especializacionTipica: ['Vertical específico', 'Tecnología', 'Creatividad'],
        serviciosTipicos: ['Estrategia', 'Creatividad', 'Digital'],
        comisionesTipicas: { min: 8, max: 15 },
        nivelPartnershipMin: NivelColaboracionValue.ESTANDAR
    },
    [TipoAgenciaMediosValue.DIGITAL]: {
        descripcion: 'Agencia enfocada exclusivamente en medios digitales',
        tamanoTipico: 'mediano',
        especializacionTipica: ['Programmatic', 'Social', 'Search', 'Native', 'Video'],
        serviciosTipicos: ['Programmatic', 'Social Media', 'SEO/SEM', 'Analytics'],
        comisionesTipicas: { min: 8, max: 18 },
        nivelPartnershipMin: NivelColaboracionValue.PREFERENCIAL
    },
    [TipoAgenciaMediosValue.MEDIA_BUYING]: {
        descripcion: 'Agencia enfocada en la compra de inventario publicitario',
        tamanoTipico: 'mediano',
        especializacionTipica: ['TV', 'Radio', 'Digital', 'OOH'],
        serviciosTipicos: ['Compra de medios', 'Negociación', 'Optimización'],
        comisionesTipicas: { min: 5, max: 12 },
        nivelPartnershipMin: NivelColaboracionValue.ESTANDAR
    },
    [TipoAgenciaMediosValue.SPECIALIZED]: {
        descripcion: 'Agencia especializada en un vertical específico (FMCG, Finance, Pharma, etc.)',
        tamanoTipico: 'mediano',
        especializacionTipica: ['Vertical específico', 'Expertise sectorial'],
        serviciosTipicos: ['Estrategia', 'Planificación', 'Insights'],
        comisionesTipicas: { min: 10, max: 18 },
        nivelPartnershipMin: NivelColaboracionValue.ESTRATEGICO
    },
    [TipoAgenciaMediosValue.INDEPENDENT]: {
        descripcion: 'Agencia independiente sin affiliation a grupo mayor',
        tamanoTipico: 'pequeno',
        especializacionTipica: ['Flexibilidad', 'Personalización'],
        serviciosTipicos: ['Estrategia', 'Creatividad', 'Digital'],
        comisionesTipicas: { min: 8, max: 15 },
        nivelPartnershipMin: NivelColaboracionValue.ESTANDAR
    }
}

export { CARACTERISTICAS_POR_TIPO }

/**
 * Value Object para el tipo de agencia de medios
 */
export class TipoAgenciaMedios {
    private readonly _value: TipoAgenciaMediosValue
    private readonly _displayName: string

    constructor(value: TipoAgenciaMediosValue) {
        if (!Object.values(TipoAgenciaMediosValue).includes(value)) {
            throw new Error(`Tipo de agencia inválido: ${value}`)
        }
        this._value = value
        this._displayName = this._getDisplayName()
    }

    private _getDisplayName(): string {
        const names: Record<TipoAgenciaMediosValue, string> = {
            [TipoAgenciaMediosValue.FULL_SERVICE]: 'Full Service',
            [TipoAgenciaMediosValue.BOUTIQUE]: 'Boutique',
            [TipoAgenciaMediosValue.DIGITAL]: 'Digital',
            [TipoAgenciaMediosValue.MEDIA_BUYING]: 'Media Buying',
            [TipoAgenciaMediosValue.SPECIALIZED]: 'Especializada',
            [TipoAgenciaMediosValue.INDEPENDENT]: 'Independiente'
        }
        return names[this._value]
    }

    get value(): TipoAgenciaMediosValue {
        return this._value
    }

    get displayName(): string {
        return this._displayName
    }

    get caracteristicas(): TipoAgenciaCaracteristicas {
        return CARACTERISTICAS_POR_TIPO[this._value]
    }

    get esGrande(): boolean {
        return this.caracteristicas.tamanoTipico === 'grande'
    }

    get esDigital(): boolean {
        return this._value === TipoAgenciaMediosValue.DIGITAL
    }

    equals(other: TipoAgenciaMedios): boolean {
        return this._value === other._value
    }

    toString(): string {
        return this._displayName
    }
}

/**
 * Crea un TipoAgenciaMedios con validación
 */
export function createTipoAgenciaMedios(value: TipoAgenciaMediosValue): TipoAgenciaMedios {
    return new TipoAgenciaMedios(value)
}

/**
 * Obtiene todos los tipos disponibles
 */
export function getAllTiposAgenciaMedios(): TipoAgenciaMediosValue[] {
    return Object.values(TipoAgenciaMediosValue)
}
