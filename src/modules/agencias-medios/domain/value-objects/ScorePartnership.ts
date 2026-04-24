/**
 * 🏢 Value Object: ScorePartnership
 * 
 * Sistema de scoring 0-1000 para evaluar partnerships
 * Incluye clasificación automática y tendencias
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

export enum ClasificacionScore {
    PREMIUM_PARTNER = 'PREMIUM_PARTNER',   // 900-1000
    PREMIER_PARTNER = 'PREMIER_PARTNER',   // 750-899
    PREFERRED_PARTNER = 'PREFERRED_PARTNER', // 600-749
    STANDARD_PARTNER = 'STANDARD_PARTNER', // 450-599
    BASIC_PARTNER = 'BASIC_PARTNER',       // 300-449
    AT_RISK = 'AT_RISK'                  // < 300
}

export interface ScorePartnershipConfig {
    min: number
    max: number
    nombre: string
    icono: string
    color: string
    descripcion: string
    beneficios: string[]
}

const SCORE_CONFIG: Record<ClasificacionScore, ScorePartnershipConfig> = {
    [ClasificacionScore.PREMIUM_PARTNER]: {
        min: 900,
        max: 1000,
        nombre: 'Premium Partner',
        icono: '💎',
        color: '#FFD700',
        descripcion: 'El partnership de más alto valor',
        beneficios: [
            'Acceso prioritario a inventario premium',
            'Ejecutivo de cuenta dedicado 24/7',
            'Términos comerciales exclusivos',
            'Participación en decisiones estratégicas',
            'Roadmap prioritario'
        ]
    },
    [ClasificacionScore.PREMIER_PARTNER]: {
        min: 750,
        max: 899,
        nombre: 'Premier Partner',
        icono: '🌟',
        color: '#C0C0C0',
        descripcion: 'Partnership de alto valor',
        beneficios: [
            'Soporte premium',
            'Descuentos por volumen',
            'Acceso anticipado a nuevos productos',
            'Análisis personalizados'
        ]
    },
    [ClasificacionScore.PREFERRED_PARTNER]: {
        min: 600,
        max: 749,
        nombre: 'Preferred Partner',
        icono: '💎',
        color: '#CD7F32',
        descripcion: 'Partnership establecido',
        beneficios: [
            'Soporte prioritario',
            'Descuentos por volumen',
            'Reportes avanzados'
        ]
    },
    [ClasificacionScore.STANDARD_PARTNER]: {
        min: 450,
        max: 599,
        nombre: 'Standard Partner',
        icono: '🤝',
        color: '#4CAF50',
        descripcion: 'Partnership activo',
        beneficios: [
            'Soporte estándar',
            'Reportes mensuales'
        ]
    },
    [ClasificacionScore.BASIC_PARTNER]: {
        min: 300,
        max: 449,
        nombre: 'Basic Partner',
        icono: '📈',
        color: '#FFC107',
        descripcion: 'Partnership en desarrollo',
        beneficios: [
            'Soporte por email',
            'Reportes trimestrales'
        ]
    },
    [ClasificacionScore.AT_RISK]: {
        min: 0,
        max: 299,
        nombre: 'At Risk',
        icono: '⚠️',
        color: '#F44336',
        descripcion: 'Partnership requiere atención inmediata',
        beneficios: []
    }
}

export { SCORE_CONFIG }

/**
 * Value Object para el Score de Partnership
 */
export class ScorePartnership {
    private readonly _value: number
    private readonly _tendencia: 'up' | 'down' | 'stable'
    private readonly _ultimaActualizacion: Date

    constructor(
        value: number,
        tendencia: 'up' | 'down' | 'stable' = 'stable',
        ultimaActualizacion?: Date
    ) {
        if (value < 0 || value > 1000) {
            throw new Error(`Score inválido: debe estar entre 0 y 1000 (valor: ${value})`)
        }
        this._value = Math.round(value)
        this._tendencia = tendencia
        this._ultimaActualizacion = ultimaActualizacion || new Date()
    }

    get value(): number {
        return this._value
    }

    get tendencia(): 'up' | 'down' | 'stable' {
        return this._tendencia
    }

    get ultimaActualizacion(): Date {
        return this._ultimaActualizacion
    }

    /**
     * Obtiene la clasificación basada en el score
     */
    get clasificacion(): ClasificacionScore {
        if (this._value >= 900) return ClasificacionScore.PREMIUM_PARTNER
        if (this._value >= 750) return ClasificacionScore.PREMIER_PARTNER
        if (this._value >= 600) return ClasificacionScore.PREFERRED_PARTNER
        if (this._value >= 450) return ClasificacionScore.STANDARD_PARTNER
        if (this._value >= 300) return ClasificacionScore.BASIC_PARTNER
        return ClasificacionScore.AT_RISK
    }

    get config(): ScorePartnershipConfig {
        return SCORE_CONFIG[this.clasificacion]
    }

    get nombre(): string {
        return this.config.nombre
    }

    get icono(): string {
        return this.config.icono
    }

    get color(): string {
        return this.config.color
    }

    get esPremium(): boolean {
        return this._value >= 900
    }

    get estaEnRiesgo(): boolean {
        return this._value < 300
    }

    get requiereAtencion(): boolean {
        return this._value < 450 || this._tendencia === 'down'
    }

    /**
     * Calcula el cambio necesario para mejorar a siguiente clasificación
     */
    get puntosParaSiguienteNivel(): number | null {
        const clasificaciones = Object.values(ClasificacionScore)
        const indiceActual = clasificaciones.indexOf(this.clasificacion)

        if (indiceActual === 0) return null // Ya es el máximo

        const siguienteClasificacion = clasificaciones[indiceActual - 1]
        const puntosNecesarios = SCORE_CONFIG[siguienteClasificacion].min - this._value

        return puntosNecesarios > 0 ? puntosNecesarios : null
    }

    /**
     * Simula el score con cambios propuestos
     */
    simulateChange(metricas: {
        performanceChange?: number     // -100 a +100
        satisfactionChange?: number    // -50 a +50
        growthChange?: number         // -50 a +50
    }): ScorePartnership {
        let nuevoValor = this._value

        if (metricas.performanceChange) {
            nuevoValor += metricas.performanceChange * 5 // Peso: 5x
        }
        if (metricas.satisfactionChange) {
            nuevoValor += metricas.satisfactionChange * 3 // Peso: 3x
        }
        if (metricas.growthChange) {
            nuevoValor += metricas.growthChange * 2 // Peso: 2x
        }

        // Clamp entre 0 y 1000
        nuevoValor = Math.max(0, Math.min(1000, nuevoValor))

        return new ScorePartnership(nuevoValor, 'stable', this._ultimaActualizacion)
    }

    equals(other: ScorePartnership): boolean {
        return this._value === other._value
    }

    toString(): string {
        const flecha = this._tendencia === 'up' ? '↗️' : this._tendencia === 'down' ? '↘️' : '➡️'
        return `${this.icono} ${this._value}/1000 ${flecha}`
    }
}

/**
 * Crea un ScorePartnership con validación
 */
export function createScorePartnership(
    value: number,
    tendencia?: 'up' | 'down' | 'stable',
    ultimaActualizacion?: Date
): ScorePartnership {
    return new ScorePartnership(value, tendencia, ultimaActualizacion)
}

/**
 * Calcula score inicial basado en datos de la agencia
 */
export function calcularScoreInicial(params: {
    tipoAgencia: string
    tamanoEmpleados?: number
    certificaciones?: string[]
    revenueEstimado?: number
}): number {
    let score = 500 // Base

    // Tipo de agencia
    if (params.tipoAgencia === 'FULL_SERVICE') score += 100
    else if (params.tipoAgencia === 'DIGITAL') score += 80
    else if (params.tipoAgencia === 'SPECIALIZED') score += 60

    // Tamaño
    if (params.tamanoEmpleados) {
        if (params.tamanoEmpleados > 200) score += 100
        else if (params.tamanoEmpleados > 50) score += 50
        else if (params.tamanoEmpleados > 10) score += 25
    }

    // Certificaciones
    if (params.certificaciones) {
        score += Math.min(params.certificaciones.length * 25, 150)
    }

    // Revenue estimado
    if (params.revenueEstimado) {
        if (params.revenueEstimado > 100000000) score += 150
        else if (params.revenueEstimado > 50000000) score += 100
        else if (params.revenueEstimado > 10000000) score += 50
    }

    return Math.min(score, 1000)
}
