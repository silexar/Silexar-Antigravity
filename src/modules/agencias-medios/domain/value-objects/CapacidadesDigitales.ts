/**
 * 🏢 Value Object: CapacidadesDigitales
 * 
 * Define las capacidades digitales de una agencia de medios
 * Programmatic, Social, Search, Native, Video, etc.
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

export enum CapacidadDigitalValue {
    PROGRAMMATIC = 'PROGRAMMATIC',
    SOCIAL_MEDIA = 'SOCIAL_MEDIA',
    SEARCH_ENGINE = 'SEARCH_ENGINE',
    NATIVE_ADVERTISING = 'NATIVE_ADVERTISING',
    VIDEO_ADVERTISING = 'VIDEO_ADVERTISING',
    DISPLAY_ADVERTISING = 'DISPLAY_ADVERTISING',
    SEO = 'SEO',
    SEM = 'SEM',
    AFFILIATE_MARKETING = 'AFFILIATE_MARKETING',
    EMAIL_MARKETING = 'EMAIL_MARKETING',
    CONTENT_MARKETING = 'CONTENT_MARKETING',
    INFLUENCER_MARKETING = 'INFLUENCER_MARKETING',
    MOBILE_MARKETING = 'MOBILE_MARKETING',
    ANALYTICS = 'ANALYTICS',
    DATA_MANAGEMENT = 'DATA_MANAGEMENT',
    CRM = 'CRM',
    MARKETING_AUTOMATION = 'MARKETING_AUTOMATION',
    E_COMMERCE = 'E_COMMERCE',
    APP_DEVELOPMENT = 'APP_DEVELOPMENT',
    UX_UI = 'UX_UI'
}

export enum NivelCapacidad {
    BASIC = 'BASIC',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
    EXPERT = 'EXPERT'
}

export interface CapacidadDigitalConfig {
    nombre: string
    descripcion: string
    icono: string
    plataformas: string[]
    certificaciones: string[]
}

const CAPACIDADES_CONFIG: Record<CapacidadDigitalValue, CapacidadDigitalConfig> = {
    [CapacidadDigitalValue.PROGRAMMATIC]: {
        nombre: 'Programmatic',
        descripcion: 'Compra programática de medios',
        icono: '📊',
        plataformas: ['DV360', 'Trade Desk', 'MediaMath', 'TheTradeDesk'],
        certificaciones: ['Google DV360', 'Trade Desk Certified']
    },
    [CapacidadDigitalValue.SOCIAL_MEDIA]: {
        nombre: 'Social Media',
        descripcion: 'Gestión de redes sociales',
        icono: '📱',
        plataformas: ['Meta', 'TikTok', 'LinkedIn', 'X', 'Snapchat'],
        certificaciones: ['Meta Business Partner', 'LinkedIn Marketing Partner']
    },
    [CapacidadDigitalValue.SEARCH_ENGINE]: {
        nombre: 'Search Engine',
        descripcion: 'Marketing en buscadores',
        icono: '🔍',
        plataformas: ['Google Ads', 'Bing Ads'],
        certificaciones: ['Google Ads Search Certification']
    },
    [CapacidadDigitalValue.NATIVE_ADVERTISING]: {
        nombre: 'Native Advertising',
        descripcion: 'Publicidad nativa',
        icono: '📰',
        plataformas: ['Taboola', 'Outbrain', 'MGID'],
        certificaciones: []
    },
    [CapacidadDigitalValue.VIDEO_ADVERTISING]: {
        nombre: 'Video Advertising',
        descripcion: 'Publicidad en video',
        icono: '🎬',
        plataformas: ['YouTube', 'CTV', 'Roku', 'Fire TV'],
        certificaciones: ['Google Video 360', 'YouTube Certified']
    },
    [CapacidadDigitalValue.DISPLAY_ADVERTISING]: {
        nombre: 'Display Advertising',
        descripcion: 'Display y banners',
        icono: '🖼️',
        plataformas: ['Google Display', 'Microsoft Advertising'],
        certificaciones: ['Google Display Certification']
    },
    [CapacidadDigitalValue.SEO]: {
        nombre: 'SEO',
        descripcion: 'Optimización para buscadores',
        icono: '🔎',
        plataformas: ['Google Search', 'Bing', 'SEMrush', 'Ahrefs'],
        certificaciones: ['Google SEO Partner']
    },
    [CapacidadDigitalValue.SEM]: {
        nombre: 'SEM',
        descripcion: 'Search Engine Marketing',
        icono: '💰',
        plataformas: ['Google Ads', 'Bing Ads', 'Yahoo!'],
        certificaciones: ['Google Ads Search']
    },
    [CapacidadDigitalValue.AFFILIATE_MARKETING]: {
        nombre: 'Affiliate Marketing',
        descripcion: 'Marketing de afiliados',
        icono: '🤝',
        plataformas: ['Rakuten', 'Awin', 'CJ Affiliate'],
        certificaciones: []
    },
    [CapacidadDigitalValue.EMAIL_MARKETING]: {
        nombre: 'Email Marketing',
        descripcion: 'Email marketing y automation',
        icono: '📧',
        plataformas: ['Mailchimp', 'Salesforce', 'HubSpot', 'SendGrid'],
        certificaciones: ['Salesforce Partner', 'HubSpot Partner']
    },
    [CapacidadDigitalValue.CONTENT_MARKETING]: {
        nombre: 'Content Marketing',
        descripcion: 'Marketing de contenidos',
        icono: '✍️',
        plataformas: [],
        certificaciones: []
    },
    [CapacidadDigitalValue.INFLUENCER_MARKETING]: {
        nombre: 'Influencer Marketing',
        descripcion: 'Marketing de influencers',
        icono: '⭐',
        plataformas: ['AspireIQ', 'Grin', 'IZEA', 'Heepsy'],
        certificaciones: []
    },
    [CapacidadDigitalValue.MOBILE_MARKETING]: {
        nombre: 'Mobile Marketing',
        descripcion: 'Marketing móvil',
        icono: '📲',
        plataformas: ['AppsFlyer', 'Adjust', 'Branch'],
        certificaciones: ['AppsFlyer Certified']
    },
    [CapacidadDigitalValue.ANALYTICS]: {
        nombre: 'Analytics',
        descripcion: 'Analítica y métricas',
        icono: '📈',
        plataformas: ['Google Analytics', 'Adobe Analytics', 'Mixpanel'],
        certificaciones: ['Google Analytics Certified', 'Adobe Analytics Certified']
    },
    [CapacidadDigitalValue.DATA_MANAGEMENT]: {
        nombre: 'Data Management',
        descripcion: 'Gestión de datos y DMP',
        icono: '🗄️',
        plataformas: ['Salesforce DMP', 'Oracle BlueKai', 'Neustar'],
        certificaciones: []
    },
    [CapacidadDigitalValue.CRM]: {
        nombre: 'CRM',
        descripcion: 'Customer Relationship Management',
        icono: '💎',
        plataformas: ['Salesforce', 'HubSpot', 'Microsoft Dynamics'],
        certificaciones: ['Salesforce Certified']
    },
    [CapacidadDigitalValue.MARKETING_AUTOMATION]: {
        nombre: 'Marketing Automation',
        descripcion: 'Automatización de marketing',
        icono: '⚙️',
        plataformas: ['HubSpot', 'Marketo', 'Pardot', 'ActiveCampaign'],
        certificaciones: ['HubSpot Partner', 'Marketo Certified']
    },
    [CapacidadDigitalValue.E_COMMERCE]: {
        nombre: 'E-Commerce',
        descripcion: 'E-commerce y retail media',
        icono: '🛒',
        plataformas: ['Amazon Ads', 'Walmart Connect', 'Instore'],
        certificaciones: ['Amazon Ads Partner']
    },
    [CapacidadDigitalValue.APP_DEVELOPMENT]: {
        nombre: 'App Development',
        descripcion: 'Desarrollo de aplicaciones',
        icono: '📱',
        plataformas: [],
        certificaciones: []
    },
    [CapacidadDigitalValue.UX_UI]: {
        nombre: 'UX/UI',
        descripcion: 'Diseño UX/UI',
        icono: '🎨',
        plataformas: [],
        certificaciones: []
    }
}

export { CAPACIDADES_CONFIG }

/**
 * Representa una capacidad digital con su nivel
 */
export class CapacidadDigital {
    private readonly _value: CapacidadDigitalValue
    private readonly _nivel: NivelCapacidad

    constructor(value: CapacidadDigitalValue, nivel: NivelCapacidad = NivelCapacidad.INTERMEDIATE) {
        if (!Object.values(CapacidadDigitalValue).includes(value)) {
            throw new Error(`Capacidad digital inválida: ${value}`)
        }
        this._value = value
        this._nivel = nivel
    }

    get value(): CapacidadDigitalValue { return this._value }
    get nivel(): NivelCapacidad { return this._nivel }

    get config(): CapacidadDigitalConfig {
        return CAPACIDADES_CONFIG[this._value]
    }

    get nombre(): string { return this.config.nombre }
    get descripcion(): string { return this.config.descripcion }
    get icono(): string { return this.config.icono }
    get plataformas(): string[] { return this.config.plataformas }
    get certificaciones(): string[] { return this.config.certificaciones }

    get esAvanzado(): boolean {
        return this._nivel === NivelCapacidad.ADVANCED || this._nivel === NivelCapacidad.EXPERT
    }

    get nivelNumero(): number {
        const niveles: Record<NivelCapacidad, number> = {
            [NivelCapacidad.BASIC]: 1,
            [NivelCapacidad.INTERMEDIATE]: 2,
            [NivelCapacidad.ADVANCED]: 3,
            [NivelCapacidad.EXPERT]: 4
        }
        return niveles[this._nivel]
    }

    equals(other: CapacidadDigital): boolean {
        return this._value === other._value
    }

    toString(): string {
        return `${this.icono} ${this.nombre} (${this._nivel})`
    }
}

/**
 * Colección de capacidades digitales
 */
export class CapacidadesDigitales {
    private readonly _capacidades: Map<CapacidadDigitalValue, NivelCapacidad>

    constructor(capacidades: Array<{ capacidad: CapacidadDigitalValue; nivel?: NivelCapacidad }> = []) {
        this._capacidades = new Map()
        for (const item of capacidades) {
            this._capacidades.set(item.capacidad, item.nivel || NivelCapacidad.INTERMEDIATE)
        }
    }

    /**
     * Agrega una capacidad
     */
    agregar(capacidad: CapacidadDigitalValue, nivel: NivelCapacidad = NivelCapacidad.INTERMEDIATE): void {
        this._capacidades.set(capacidad, nivel)
    }

    /**
     * Obtiene una capacidad específica
     */
    get(capacidad: CapacidadDigitalValue): NivelCapacidad | undefined {
        return this._capacidades.get(capacidad)
    }

    /**
     * Verifica si tiene una capacidad
     */
    tiene(capacidad: CapacidadDigitalValue): boolean {
        return this._capacidades.has(capacidad)
    }

    /**
     * Obtiene todas las capacidades
     */
    get all(): CapacidadDigital[] {
        const result: CapacidadDigital[] = []
        this._capacidades.forEach((nivel, capacidad) => {
            result.push(new CapacidadDigital(capacidad, nivel))
        })
        return result
    }

    /**
     * Obtiene solo las capacidades avanzadas
     */
    get avanzadas(): CapacidadDigital[] {
        return this.all.filter(c => c.esAvanzado)
    }

    /**
     * Obtiene el conteo de capacidades
     */
    get count(): number {
        return this._capacidades.size
    }

    /**
     * Obtiene un score basado en capacidades
     */
    getScore(): number {
        const pesos: Record<NivelCapacidad, number> = {
            [NivelCapacidad.BASIC]: 10,
            [NivelCapacidad.INTERMEDIATE]: 20,
            [NivelCapacidad.ADVANCED]: 35,
            [NivelCapacidad.EXPERT]: 50
        }

        let score = 0
        this._capacidades.forEach((nivel) => {
            score += pesos[nivel]
        })

        return Math.min(score, 500) // Max 500 puntos
    }
}
