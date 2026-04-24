/**
 * 🏢 Value Object: EstructuraComision
 * 
 * Define la estructura de comisiones para una agencia de medios
 * Incluye tipos de comisión, percentages, fees fijos e incentivos
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

export enum TipoComision {
    PORCENTAJE = 'PORCENTAJE',           // Porcentage del gasto en medios
    FEE_FIJO = 'FEE_FIJO',               // Fee fijo mensual/anual
    HYBRID = 'HYBRID',                   // Combinación de % + fee fijo
    PERFORMANCE = 'PERFORMANCE',         // Basada en resultados
    VOLUME = 'VOLUME'                    // Descuentos por volumen
}

export interface EstructuraComisionConfig {
    tipo: TipoComision
    porcentajeMediosTradicionales: number
    porcentajeMediosDigitales: number
    porcentajeProgrammatic: number
    porcentajeProduccion: number
    feeFijo?: number
    feeFrecuencia?: 'mensual' | 'trimestral' | 'anual'
    incentives?: {
        crecimientoMinimo: number
        bonusPorcentaje: number
        nuevoClienteBonus?: number
    }
    limites: {
        comisionMin: number
        comisionMax: number
        feeMaximo?: number
    }
}

/**
 * Value Object para estructura de comisión
 */
export class EstructuraComision {
    private readonly _tipo: TipoComision
    private readonly _porcentajeMediosTradicionales: number
    private readonly _porcentajeMediosDigitales: number
    private readonly _porcentajeProgrammatic: number
    private readonly _porcentajeProduccion: number
    private readonly _feeFijo: number | null
    private readonly _feeFrecuencia: 'mensual' | 'trimestral' | 'anual' | null
    private readonly _incentives: EstructuraComisionConfig['incentives']
    private readonly _limites: EstructuraComisionConfig['limites']

    constructor(config: EstructuraComisionConfig) {
        this._tipo = config.tipo
        this._porcentajeMediosTradicionales = config.porcentajeMediosTradicionales
        this._porcentajeMediosDigitales = config.porcentajeMediosDigitales
        this._porcentajeProgrammatic = config.porcentajeProgrammatic
        this._porcentajeProduccion = config.porcentajeProduccion
        this._feeFijo = config.feeFijo || null
        this._feeFrecuencia = config.feeFrecuencia || null
        this._incentives = config.incentives
        this._limites = config.limites

        this.validar()
    }

    private validar(): void {
        // Validar percentages están en rango válido
        const percentages = [
            this._porcentajeMediosTradicionales,
            this._porcentajeMediosDigitales,
            this._porcentajeProgrammatic,
            this._porcentajeProduccion
        ]

        for (const pct of percentages) {
            if (pct < this._limites.comisionMin || pct > this._limites.comisionMax) {
                throw new Error(`Porcentaje ${pct}% fuera del rango permitido (${this._limites.comisionMin}% - ${this._limites.comisionMax}%)`)
            }
        }

        // Fee fijo no puede superar el límite
        if (this._feeFijo && this._limites.feeMaximo && this._feeFijo > this._limites.feeMaximo) {
            throw new Error(`Fee fijo ${this._feeFijo} supera el máximo permitido (${this._limites.feeMaximo})`)
        }
    }

    get tipo(): TipoComision { return this._tipo }
    get porcentajeMediosTradicionales(): number { return this._porcentajeMediosTradicionales }
    get porcentajeMediosDigitales(): number { return this._porcentajeMediosDigitales }
    get porcentajeProgrammatic(): number { return this._porcentajeProgrammatic }
    get porcentajeProduccion(): number { return this._porcentajeProduccion }
    get feeFijo(): number | null { return this._feeFijo }
    get feeFrecuencia(): 'mensual' | 'trimestral' | 'anual' | null { return this._feeFrecuencia }
    get incentives(): EstructuraComisionConfig['incentives'] | undefined { return this._incentives }

    /**
     * Obtiene el tipo de comisión como string legible
     */
    get tipoDisplay(): string {
        const nombres: Record<TipoComision, string> = {
            [TipoComision.PORCENTAJE]: 'Por Porcentaje',
            [TipoComision.FEE_FIJO]: 'Fee Fijo',
            [TipoComision.HYBRID]: 'Híbrido',
            [TipoComision.PERFORMANCE]: 'Por Performance',
            [TipoComision.VOLUME]: 'Por Volumen'
        }
        return nombres[this._tipo]
    }

    /**
     * Calcula la comisión para un tipo de medio específico
     */
    getComisionPorTipoMedio(tipoMedio: 'tradicional' | 'digital' | 'programmatic' | 'produccion'): number {
        switch (tipoMedio) {
            case 'tradicional': return this._porcentajeMediosTradicionales
            case 'digital': return this._porcentajeMediosDigitales
            case 'programmatic': return this._porcentajeProgrammatic
            case 'produccion': return this._porcentajeProduccion
            default: return this._porcentajeMediosTradicionales
        }
    }

    /**
     * Calcula el promedio ponderado de comisión
     */
    getComisionPromedio(): number {
        const pesos = { tradicional: 0.4, digital: 0.3, programmatic: 0.2, produccion: 0.1 }
        return (
            this._porcentajeMediosTradicionales * pesos.tradicional +
            this._porcentajeMediosDigitales * pesos.digital +
            this._porcentajeProgrammatic * pesos.programmatic +
            this._porcentajeProduccion * pesos.produccion
        )
    }

    /**
     * Calcula el incentivo por crecimiento
     */
    calcularIncentivo(crecimientoPorcentaje: number): number {
        if (!this._incentives || !this._incentives.crecimientoMinimo) {
            return 0
        }

        if (crecimientoPorcentaje >= this._incentives.crecimientoMinimo) {
            return this._incentives.bonusPorcentaje
        }
        return 0
    }

    /**
     * Verifica si la estructura es válida para el nivel de partnership
     */
    esValidaParaNivel(nivel: string): boolean {
        const comisionPromedio = this.getComisionPromedio()

        // Niveles estratégicos tienen más flexibilidad
        if (nivel === 'ESTRATEGICO') {
            return comisionPromedio >= 10 && comisionPromedio <= 20
        }
        if (nivel === 'PREFERENCIAL') {
            return comisionPromedio >= 8 && comisionPromedio <= 17
        }
        return comisionPromedio >= 5 && comisionPromedio <= 15
    }

    /**
     * Serializa para persistencia
     */
    toJSON(): Record<string, unknown> {
        return {
            tipo: this._tipo,
            porcentajeMediosTradicionales: this._porcentajeMediosTradicionales,
            porcentajeMediosDigitales: this._porcentajeMediosDigitales,
            porcentajeProgrammatic: this._porcentajeProgrammatic,
            porcentajeProduccion: this._porcentajeProduccion,
            feeFijo: this._feeFijo,
            feeFrecuencia: this._feeFrecuencia,
            incentives: this._incentives,
            limites: this._limites
        }
    }

    equals(other: EstructuraComision): boolean {
        return JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON())
    }
}

/**
 * Crea una estructura de comisión por defecto
 */
export function createEstructuraComisionDefault(): EstructuraComision {
    return new EstructuraComision({
        tipo: TipoComision.PORCENTAJE,
        porcentajeMediosTradicionales: 15,
        porcentajeMediosDigitales: 12,
        porcentajeProgrammatic: 10,
        porcentajeProduccion: 8,
        limites: { comisionMin: 0, comisionMax: 25 }
    })
}

/**
 * Crea una estructura de comisión desde datos
 */
export function createEstructuraComision(config: EstructuraComisionConfig): EstructuraComision {
    return new EstructuraComision(config)
}
