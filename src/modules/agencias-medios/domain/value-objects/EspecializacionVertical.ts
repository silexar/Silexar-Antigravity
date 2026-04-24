/**
 * 🏢 Value Object: EspecializacionVertical
 * 
 * Define las especializaciones verticales de una agencia de medios
 * FMCG, Finance, Tech, Pharma, Retail, Automotive, etc.
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

export enum EspecializacionVerticalValue {
    FMCG = 'FMCG',                   // Fast-Moving Consumer Goods
    FINANCE = 'FINANCE',             // Servicios financieros
    INSURANCE = 'INSURANCE',         // Seguros
    TECHNOLOGY = 'TECHNOLOGY',       // Tecnología
    PHARMA = 'PHARMA',               // Farmacéutico
    HEALTHCARE = 'HEALTHCARE',       // Salud
    RETAIL = 'RETAIL',               // Retail y comercio
    AUTOMOTIVE = 'AUTOMOTIVE',       // Automotriz
    TELECOM = 'TELECOM',             // Telecomunicaciones
    TRAVEL = 'TRAVEL',               // Viajes y turismo
    FOOD_BEVERAGE = 'FOOD_BEVERAGE', // Alimentación y bebidas
    ENTERTAINMENT = 'ENTERTAINMENT', // Entretenimiento
    EDUCATION = 'EDUCATION',         // Educación
    REAL_ESTATE = 'REAL_ESTATE',     // Inmobiliaria
    GOVERNMENT = 'GOVERNMENT',       // Gobierno
    NON_PROFIT = 'NON_PROFIT',       // Sin fines de lucro
    E_COMMERCE = 'E_COMMERCE',       // Comercio electrónico
    GAMING = 'GAMING',               // Videojuegos
    SPORTS = 'SPORTS',               // Deportes
    FASHION = 'FASHION',             // Moda y lujo
    OTHER = 'OTHER'                 // Otra
}

export interface EspecializacionVerticalConfig {
    nombre: string
    descripcion: string
    iconos: string[]
    mercados: string[]
}

const ESPECIALIZACIONES_CONFIG: Record<EspecializacionVerticalValue, EspecializacionVerticalConfig> = {
    [EspecializacionVerticalValue.FMCG]: {
        nombre: 'FMCG',
        descripcion: 'Bienes de consumo de movimiento rápido',
        iconos: ['🛒', '🧴', '🍔', '🥤'],
        mercados: ['Mass market', 'Supermercados', 'Convenience']
    },
    [EspecializacionVerticalValue.FINANCE]: {
        nombre: 'Finance',
        descripcion: 'Servicios financieros y banking',
        iconos: ['🏦', '💳', '📈', '💰'],
        mercados: ['Banca minorista', 'Banca corporativa', 'Wealth management']
    },
    [EspecializacionVerticalValue.INSURANCE]: {
        nombre: 'Insurance',
        descripcion: 'Seguros y gestión de riesgos',
        iconos: ['🛡️', '📋', '⚕️'],
        mercados: ['Vida', 'General', 'Salud']
    },
    [EspecializacionVerticalValue.TECHNOLOGY]: {
        nombre: 'Technology',
        descripcion: 'Tecnología y software',
        iconos: ['💻', '📱', '☁️', '🤖'],
        mercados: ['SaaS', 'Hardware', 'Cloud']
    },
    [EspecializacionVerticalValue.PHARMA]: {
        nombre: 'Pharma',
        descripcion: 'Industria farmacéutica',
        iconos: ['💊', '🧪', '🏥'],
        mercados: ['OTC', 'Prescripción', 'Dispositivos médicos']
    },
    [EspecializacionVerticalValue.HEALTHCARE]: {
        nombre: 'Healthcare',
        descripcion: 'Salud y bienestar',
        iconos: ['🏥', '🩺', '❤️'],
        mercados: ['Hospitales', 'Clínicas', 'Wellness']
    },
    [EspecializacionVerticalValue.RETAIL]: {
        nombre: 'Retail',
        descripcion: 'Comercio minorista',
        iconos: ['🏪', '🛍️', '🛒'],
        mercados: ['Department stores', 'Specialty', 'E-commerce']
    },
    [EspecializacionVerticalValue.AUTOMOTIVE]: {
        nombre: 'Automotive',
        descripcion: 'Industria automotriz',
        iconos: ['🚗', '🚙', '🔧'],
        mercados: ['Vehículos nuevos', 'Usados', 'Post-venta']
    },
    [EspecializacionVerticalValue.TELECOM]: {
        nombre: 'Telecom',
        descripcion: 'Telecomunicaciones',
        iconos: ['📱', '📡', '📶'],
        mercados: ['Operadores', 'Equipos', 'Servicios digitales']
    },
    [EspecializacionVerticalValue.TRAVEL]: {
        nombre: 'Travel',
        descripcion: 'Viajes y turismo',
        iconos: ['✈️', '🏨', '🌎'],
        mercados: ['Airlines', 'Hotels', 'Tour operators']
    },
    [EspecializacionVerticalValue.FOOD_BEVERAGE]: {
        nombre: 'Food & Beverage',
        descripcion: 'Alimentación y bebidas',
        iconos: ['🍔', '☕', '🍷'],
        mercados: ['Restaurantes', 'Bares', 'Catering']
    },
    [EspecializacionVerticalValue.ENTERTAINMENT]: {
        nombre: 'Entertainment',
        descripcion: 'Entretenimiento y medios',
        iconos: ['🎬', '🎮', '🎭'],
        mercados: ['Cine', 'TV', 'Gaming']
    },
    [EspecializacionVerticalValue.EDUCATION]: {
        nombre: 'Education',
        descripcion: 'Educación',
        iconos: ['📚', '🎓', '🏫'],
        mercados: ['K-12', 'Universities', 'E-learning']
    },
    [EspecializacionVerticalValue.REAL_ESTATE]: {
        nombre: 'Real Estate',
        descripcion: 'Inmobiliaria',
        iconos: ['🏠', '🏢', '🌇'],
        mercados: ['Residencial', 'Comercial', 'Industrial']
    },
    [EspecializacionVerticalValue.GOVERNMENT]: {
        nombre: 'Government',
        descripcion: 'Gobierno y sector público',
        iconos: ['🏛️', '📋', '🏤'],
        mercados: ['Central', 'Regional', 'Municipal']
    },
    [EspecializacionVerticalValue.NON_PROFIT]: {
        nombre: 'Non-Profit',
        descripcion: 'Organizaciones sin fines de lucro',
        iconos: ['❤️', '🌍', '🎗️'],
        mercados: ['ONGs', 'Fundaciones', 'Cooperativas']
    },
    [EspecializacionVerticalValue.E_COMMERCE]: {
        nombre: 'E-Commerce',
        descripcion: 'Comercio electrónico',
        iconos: ['🛒', '📦', '📬'],
        mercados: ['Marketplaces', 'D2C', 'Subscriptions']
    },
    [EspecializacionVerticalValue.GAMING]: {
        nombre: 'Gaming',
        descripcion: 'Industria de videojuegos',
        iconos: ['🎮', '🕹️', '🎯'],
        mercados: ['Console', 'Mobile', 'PC']
    },
    [EspecializacionVerticalValue.SPORTS]: {
        nombre: 'Sports',
        descripcion: 'Deportes',
        iconos: ['⚽', '🏆', '🏅'],
        mercados: ['Professional', 'Amateur', 'E-sports']
    },
    [EspecializacionVerticalValue.FASHION]: {
        nombre: 'Fashion',
        descripcion: 'Moda y accesorios de lujo',
        iconos: ['👗', '👜', '💎'],
        mercados: ['Luxury', 'Premium', 'Mass market']
    },
    [EspecializacionVerticalValue.OTHER]: {
        nombre: 'Other',
        descripcion: 'Otras verticales',
        iconos: ['📌'],
        mercados: []
    }
}

export { ESPECIALIZACIONES_CONFIG }

/**
 * Value Object para especialización vertical
 */
export class EspecializacionVertical {
    private readonly _value: EspecializacionVerticalValue

    constructor(value: EspecializacionVerticalValue) {
        if (!Object.values(EspecializacionVerticalValue).includes(value)) {
            throw new Error(`Especialización vertical inválida: ${value}`)
        }
        this._value = value
    }

    get value(): EspecializacionVerticalValue {
        return this._value
    }

    get config(): EspecializacionVerticalConfig {
        return ESPECIALIZACIONES_CONFIG[this._value]
    }

    get nombre(): string {
        return this.config.nombre
    }

    get descripcion(): string {
        return this.config.descripcion
    }

    get iconos(): string[] {
        return this.config.iconos
    }

    get primerIcono(): string {
        return this.config.iconos[0] || '📌'
    }

    equals(other: EspecializacionVertical): boolean {
        return this._value === other._value
    }

    toString(): string {
        return `${this.primerIcono} ${this.nombre}`
    }
}

/**
 * Crea una EspecializacionVertical
 */
export function createEspecializacionVertical(value: EspecializacionVerticalValue): EspecializacionVertical {
    return new EspecializacionVertical(value)
}

/**
 * Obtiene todas las especializaciones disponibles
 */
export function getAllEspecializaciones(): EspecializacionVerticalValue[] {
    return Object.values(EspecializacionVerticalValue)
}
