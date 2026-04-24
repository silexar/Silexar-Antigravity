/**
 * 🏢 Value Object: CertificacionesPlataforma
 * 
 * Define las certificaciones de plataformas que puede tener una agencia
 * Google Premier, Meta Business Partner, etc.
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

export enum PlataformaCertificacion {
    GOOGLE_PREMIER_PARTNER = 'GOOGLE_PREMIER_PARTNER',
    GOOGLE_PARTNER = 'GOOGLE_PARTNER',
    META_BUSINESS_PARTNER = 'META_BUSINESS_PARTNER',
    META_MARKETING_PARTNER = 'META_MARKETING_PARTNER',
    LINKEDIN_MARKETING_PARTNER = 'LINKEDIN_MARKETING_PARTNER',
    TIKTOK_PARTNER = 'TIKTOK_PARTNER',
    AMAZON_ADS_PARTNER = 'AMAZON_ADS_PARTNER',
    SNAPCHAT_PARTNER = 'SNAPCHAT_PARTNER',
    PINTEREST_PARTNER = 'PINTEREST_PARTNER',
    TWITTER_PARTNER = 'TWITTER_PARTNER',
    DV360_CERTIFIED = 'DV360_CERTIFIED',
    TRADE_DESK_CERTIFIED = 'TRADE_DESK_CERTIFIED',
    YAHOO_PARTNER = 'YAHOO_PARTNER',
    TABOOLA_PARTNER = 'TABOOLA_PARTNER',
    OUTBRAIN_PARTNER = 'OUTBRAIN_PARTNER'
}

export enum NivelCertificacion {
    BASIC = 'BASIC',
    CERTIFIED = 'CERTIFIED',
    PREMIER = 'PREMIER',
    PREMIUM = 'PREMIUM'
}

export interface CertificacionPlataformaConfig {
    nombre: string
    plataforma: string
    icono: string
    descripcion: string
    niveles: NivelCertificacion[]
    requiereExamen: boolean
    renewaAnual: boolean
}

const CERTIFICACIONES_CONFIG: Record<PlataformaCertificacion, CertificacionPlataformaConfig> = {
    [PlataformaCertificacion.GOOGLE_PREMIER_PARTNER]: {
        nombre: 'Google Premier Partner',
        plataforma: 'Google',
        icono: '🔵',
        descripcion: 'Partner Premier de Google con capacidades avanzadas',
        niveles: [NivelCertificacion.CERTIFIED, NivelCertificacion.PREMIER],
        requiereExamen: true,
        renewaAnual: true
    },
    [PlataformaCertificacion.GOOGLE_PARTNER]: {
        nombre: 'Google Partner',
        plataforma: 'Google',
        icono: '🔵',
        descripcion: 'Partner certificado de Google',
        niveles: [NivelCertificacion.BASIC, NivelCertificacion.CERTIFIED],
        requiereExamen: true,
        renewaAnual: true
    },
    [PlataformaCertificacion.META_BUSINESS_PARTNER]: {
        nombre: 'Meta Business Partner',
        plataforma: 'Meta',
        icono: '💙',
        descripcion: 'Partner oficial de Meta para soluciones de negocio',
        niveles: [NivelCertificacion.CERTIFIED, NivelCertificacion.PREMIER],
        requiereExamen: true,
        renewaAnual: true
    },
    [PlataformaCertificacion.META_MARKETING_PARTNER]: {
        nombre: 'Meta Marketing Partner',
        plataforma: 'Meta',
        icono: '💙',
        descripcion: 'Partner especializado en marketing Meta',
        niveles: [NivelCertificacion.CERTIFIED, NivelCertificacion.PREMIER],
        requiereExamen: true,
        renewaAnual: true
    },
    [PlataformaCertificacion.LINKEDIN_MARKETING_PARTNER]: {
        nombre: 'LinkedIn Marketing Partner',
        plataforma: 'LinkedIn',
        icono: '💼',
        descripcion: 'Partner certificado de LinkedIn Marketing',
        niveles: [NivelCertificacion.CERTIFIED],
        requiereExamen: true,
        renewaAnual: true
    },
    [PlataformaCertificacion.TIKTOK_PARTNER]: {
        nombre: 'TikTok Partner',
        plataforma: 'TikTok',
        icono: '🎵',
        descripcion: 'Partner de TikTok para publicidad',
        niveles: [NivelCertificacion.BASIC, NivelCertificacion.CERTIFIED, NivelCertificacion.PREMIER],
        requiereExamen: true,
        renewaAnual: true
    },
    [PlataformaCertificacion.AMAZON_ADS_PARTNER]: {
        nombre: 'Amazon Ads Partner',
        plataforma: 'Amazon',
        icono: '📦',
        descripcion: 'Partner de Amazon Ads',
        niveles: [NivelCertificacion.CERTIFIED, NivelCertificacion.PREMIER],
        requiereExamen: true,
        renewaAnual: true
    },
    [PlataformaCertificacion.SNAPCHAT_PARTNER]: {
        nombre: 'Snapchat Partner',
        plataforma: 'Snapchat',
        icono: '👻',
        descripcion: 'Partner certificado de Snapchat',
        niveles: [NivelCertificacion.CERTIFIED],
        requiereExamen: true,
        renewaAnual: true
    },
    [PlataformaCertificacion.PINTEREST_PARTNER]: {
        nombre: 'Pinterest Partner',
        plataforma: 'Pinterest',
        icono: '📌',
        descripcion: 'Partner de Pinterest para marketing',
        niveles: [NivelCertificacion.CERTIFIED],
        requiereExamen: true,
        renewaAnual: true
    },
    [PlataformaCertificacion.TWITTER_PARTNER]: {
        nombre: 'Twitter Partner',
        plataforma: 'Twitter/X',
        icono: '🐦',
        descripcion: 'Partner certificado de Twitter/X',
        niveles: [NivelCertificacion.CERTIFIED],
        requiereExamen: true,
        renewaAnual: true
    },
    [PlataformaCertificacion.DV360_CERTIFIED]: {
        nombre: 'DV360 Certified',
        plataforma: 'Google DV360',
        icono: '📺',
        descripcion: 'Certificación en DoubleClick Bid Manager',
        niveles: [NivelCertificacion.CERTIFIED, NivelCertificacion.PREMIER],
        requiereExamen: true,
        renewaAnual: true
    },
    [PlataformaCertificacion.TRADE_DESK_CERTIFIED]: {
        nombre: 'The Trade Desk Certified',
        plataforma: 'The Trade Desk',
        icono: '🖥️',
        descripcion: 'Certificación en The Trade Desk',
        niveles: [NivelCertificacion.CERTIFIED],
        requiereExamen: true,
        renewaAnual: true
    },
    [PlataformaCertificacion.YAHOO_PARTNER]: {
        nombre: 'Yahoo Partner',
        plataforma: 'Yahoo',
        icono: '🟣',
        descripcion: 'Partner certificado de Yahoo',
        niveles: [NivelCertificacion.CERTIFIED],
        requiereExamen: true,
        renewaAnual: true
    },
    [PlataformaCertificacion.TABOOLA_PARTNER]: {
        nombre: 'Taboola Partner',
        plataforma: 'Taboola',
        icono: '📰',
        descripcion: 'Partner de Taboola para native advertising',
        niveles: [NivelCertificacion.CERTIFIED, NivelCertificacion.PREMIER],
        requiereExamen: false,
        renewaAnual: false
    },
    [PlataformaCertificacion.OUTBRAIN_PARTNER]: {
        nombre: 'Outbrain Partner',
        plataforma: 'Outbrain',
        icono: '📑',
        descripcion: 'Partner de Outbrain para contenido nativo',
        niveles: [NivelCertificacion.CERTIFIED],
        requiereExamen: false,
        renewaAnual: false
    }
}

export { CERTIFICACIONES_CONFIG }

/**
 * Representa una certificación de plataforma
 */
export class CertificacionPlataforma {
    private readonly _plataforma: PlataformaCertificacion
    private readonly _nivel: NivelCertificacion
    private readonly _fechaObtencion: Date
    private readonly _fechaExpiracion?: Date
    private readonly _verificado: boolean

    constructor(
        plataforma: PlataformaCertificacion,
        nivel: NivelCertificacion = NivelCertificacion.CERTIFIED,
        fechaObtencion?: Date,
        verificado: boolean = false
    ) {
        this._plataforma = plataforma
        this._nivel = nivel
        this._fechaObtencion = fechaObtencion || new Date()
        this._verificado = verificado

        // Verificar que el nivel es válido para esta plataforma
        const config = this.config
        if (!config.niveles.includes(nivel)) {
            throw new Error(`Nivel ${nivel} no válido para ${config.nombre}`)
        }
    }

    get plataforma(): PlataformaCertificacion { return this._plataforma }
    get nivel(): NivelCertificacion { return this._nivel }
    get fechaObtencion(): Date { return this._fechaObtencion }
    get verificado(): boolean { return this._verificado }

    get config(): CertificacionPlataformaConfig {
        return CERTIFICACIONES_CONFIG[this._plataforma]
    }

    get nombre(): string { return this.config.nombre }
    get plataformaNombre(): string { return this.config.plataforma }
    get icono(): string { return this.config.icono }
    get descripcion(): string { return this.config.descripcion }

    get estaExpirada(): boolean {
        if (!this._fechaExpiracion) return false
        return new Date() > this._fechaExpiracion
    }

    get estaPorExpirar(): boolean {
        if (!this._fechaExpiracion) return false
        const diasRestantes = Math.ceil((this._fechaExpiracion.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        return diasRestantes <= 30 && diasRestantes > 0
    }

    get diasParaExpiracion(): number | null {
        if (!this._fechaExpiracion) return null
        return Math.ceil((this._fechaExpiracion.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    }

    /**
     * Obtiene el score de la certificación
     */
    getScore(): number {
        const pesosNivel: Record<NivelCertificacion, number> = {
            [NivelCertificacion.BASIC]: 25,
            [NivelCertificacion.CERTIFIED]: 50,
            [NivelCertificacion.PREMIER]: 100,
            [NivelCertificacion.PREMIUM]: 150
        }

        let score = pesosNivel[this._nivel]

        // Bonus por estar verificado
        if (this._verificado) score *= 1.2

        // Penalización si está por expirar
        if (this.estaPorExpirar) score *= 0.9

        // Penalización fuerte si está expirado
        if (this.estaExpirada) score *= 0.5

        return Math.round(score)
    }

    equals(other: CertificacionPlataforma): boolean {
        return this._plataforma === other._plataforma
    }

    toString(): string {
        return `${this.icono} ${this.nombre} (${this._nivel})${this._verificado ? ' ✓' : ''}`
    }
}

/**
 * Colección de certificaciones de plataforma
 */
export class CertificacionesPlataforma {
    private readonly _certificaciones: Map<PlataformaCertificacion, CertificacionPlataforma>

    constructor(certificaciones: CertificacionPlataforma[] = []) {
        this._certificaciones = new Map()
        for (const cert of certificaciones) {
            this._certificaciones.set(cert.plataforma, cert)
        }
    }

    /**
     * Agrega una certificación
     */
    agregar(cert: CertificacionPlataforma): void {
        this._certificaciones.set(cert.plataforma, cert)
    }

    /**
     * Obtiene una certificación
     */
    get(plataforma: PlataformaCertificacion): CertificacionPlataforma | undefined {
        return this._certificaciones.get(plataforma)
    }

    /**
     * Verifica si tiene una certificación
     */
    tiene(plataforma: PlataformaCertificacion): boolean {
        const cert = this._certificaciones.get(plataforma)
        return cert !== undefined && !cert.estaExpirada
    }

    /**
     * Obtiene todas las certificaciones
     */
    get all(): CertificacionPlataforma[] {
        return Array.from(this._certificaciones.values())
    }

    /**
     * Obtiene certificaciones activas (no expiradas)
     */
    get activas(): CertificacionPlataforma[] {
        return this.all.filter(c => !c.estaExpirada)
    }

    /**
     * Obtiene certificaciones premium
     */
    get premium(): CertificacionPlataforma[] {
        return this.all.filter(c =>
            c.nivel === NivelCertificacion.PREMIER ||
            c.nivel === NivelCertificacion.PREMIUM
        )
    }

    /**
     * Obtiene certificaciones por expirar
     */
    get porExpirar(): CertificacionPlataforma[] {
        return this.all.filter(c => c.estaPorExpirar)
    }

    /**
     * Obtiene el conteo
     */
    get count(): number {
        return this._certificaciones.size
    }

    /**
     * Obtiene el score total
     */
    getScore(): number {
        let score = 0
        this._certificaciones.forEach((cert) => {
            score += cert.getScore()
        })
        return Math.min(score, 500)
    }
}
