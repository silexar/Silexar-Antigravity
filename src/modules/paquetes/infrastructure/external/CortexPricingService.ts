/**
 * SERVICE: CORTEX PRICING - AI PRICE OPTIMIZATION
 * 
 * @description Motor de optimización de precios usando IA.
 * Analiza demanda, competencia y factores para sugerir precios óptimos.
 * 
 * @version 1.0.0
 */

export interface PricingAnalysis {
    paqueteId: string
    precioActual: number
    precioOptimo: number
    factorDemanda: number
    factorEstacional: number
    factorCompetencia: number
    confianza: number              // 0-100%
    estrategias: PricingStrategy[]
}

export interface PricingStrategy {
    tipo: 'COMPETITIVO' | 'OPTIMO' | 'PREMIUM'
    precioSugerido: number
    justificacion: string
    riesgoNivel: 'BAJO' | 'MEDIO' | 'ALTO'
    impactoEstimado: number        // % cambio en demanda
}

export interface CompetitorPrice {
    nombre: string
    precio: number
    fuente: string
    fechaActualizacion: Date
}

export interface FactorEstacionalInfo {
    nombre: string
    factor: number                 // ej: 1.25 para +25%
    fechaInicio: Date
    fechaFin: Date
    activo: boolean
}

const FACTORES_ESTACIONALES_POR_DEFECTO: FactorEstacionalInfo[] = [
    { nombre: 'Navidad', factor: 1.25, fechaInicio: new Date('2025-12-01'), fechaFin: new Date('2025-12-31'), activo: true },
    { nombre: 'Verano', factor: 1.05, fechaInicio: new Date('2025-01-15'), fechaFin: new Date('2025-02-28'), activo: true },
    { nombre: 'Vuelta clases', factor: 1.15, fechaInicio: new Date('2025-03-01'), fechaFin: new Date('2025-03-31'), activo: true },
    { nombre: 'Día enamorados', factor: 1.10, fechaInicio: new Date('2025-02-14'), fechaFin: new Date('2025-02-14'), activo: true },
    { nombre: 'Black Friday', factor: 1.20, fechaInicio: new Date('2025-11-29'), fechaFin: new Date('2025-11-29'), activo: true },
    { nombre: 'Fiestas Patrias', factor: 1.22, fechaInicio: new Date('2025-09-18'), fechaFin: new Date('2025-09-20'), activo: true },
    { nombre: 'Invierno', factor: 0.95, fechaInicio: new Date('2025-06-01'), fechaFin: new Date('2025-08-31'), activo: true },
    { nombre: 'Normal', factor: 1.0, fechaInicio: new Date('2025-01-01'), fechaFin: new Date('2025-12-31'), activo: true }
]

export class CortexPricingService {
    private competidores: Map<string, CompetitorPrice[]> = new Map()
    private factoresEstacionales: FactorEstacionalInfo[] = [...FACTORES_ESTACIONALES_POR_DEFECTO]

    constructor() {
        // Inicializar con datos simulados de competidores
        this.inicializarCompetidoresSimulados()
    }

    private inicializarCompetidoresSimulados() {
        // Simulación de datos de competencia
        this.competidores.set('PRIME', [
            { nombre: 'Radio Tiempo', precio: 14200, fuente: 'MarketScan', fechaActualizacion: new Date() },
            { nombre: 'FM Plus', precio: 16800, fuente: 'MarketScan', fechaActualizacion: new Date() },
            { nombre: 'Mix FM', precio: 11500, fuente: 'MarketScan', fechaActualizacion: new Date() }
        ])

        this.competidores.set('REPARTIDO', [
            { nombre: 'Radio Zero', precio: 8500, fuente: 'MarketScan', fechaActualizacion: new Date() },
            { nombre: 'Activa', precio: 9200, fuente: 'MarketScan', fechaActualizacion: new Date() }
        ])

        this.competidores.set('NOCTURNO', [
            { nombre: 'Radio Paula', precio: 5500, fuente: 'MarketScan', fechaActualizacion: new Date() }
        ])
    }

    /**
     * Analizar y sugerir precio óptimo para un paquete
     */
    async analizarPrecio(params: {
        paqueteId: string
        tipo: string
        precioBase: number
        ocupacionActual: number       // 0-100
        ocupacionHistorico: number[]  // Últimos 6 meses
    }): Promise<PricingAnalysis> {
        const { paqueteId, tipo, precioBase, ocupacionActual, ocupacionHistorico } = params

        // 1. Calcular factor demanda basado en ocupación
        const factorDemanda = this.calcularFactorDemanda(ocupacionActual)

        // 2. Calcular factor estacional
        const factorEstacional = this.calcularFactorEstacionalDataActual()

        // 3. Obtener factor competencia
        const factorCompetencia = await this.calcularFactorCompetencia(tipo, precioBase)

        // 4. Calcular precio óptimo
        const precioOptimo = Math.round(
            precioBase * factorDemanda * factorEstacional * factorCompetencia
        )

        // 5. Calcular confianza basada en calidad de datos
        const confianza = this.calcularConfianza(ocupacionHistorico.length, this.competidores.has(tipo))

        // 6. Generar estrategias
        const estrategias = this.generarEstrategias(precioBase, precioOptimo, factorDemanda)

        return {
            paqueteId,
            precioActual: precioBase,
            precioOptimo,
            factorDemanda,
            factorEstacional,
            factorCompetencia,
            confianza,
            estrategias
        }
    }

    private calcularFactorDemanda(ocupacion: number): number {
        // Ocupación > 85% = Alta demanda = precio puede subir
        if (ocupacion >= 90) return 1.15
        if (ocupacion >= 85) return 1.10
        if (ocupacion >= 75) return 1.05
        if (ocupacion >= 60) return 1.0
        if (ocupacion >= 40) return 0.95
        return 0.90  // Baja ocupación = descuento recomendado
    }

    private calcularFactorEstacionalDataActual(): number {
        const hoy = new Date()
        let factorMax = 1.0

        for (const factor of this.factoresEstacionales) {
            if (factor.activo && hoy >= factor.fechaInicio && hoy <= factor.fechaFin) {
                if (factor.factor > factorMax) {
                    factorMax = factor.factor
                }
            }
        }

        return factorMax
    }

    private async calcularFactorCompetencia(tipo: string, precioBase: number): Promise<number> {
        const competidores = this.competidores.get(tipo) || []

        if (competidores.length === 0) return 1.0

        const precioPromedioCompetencia = competidores.reduce((sum, c) => sum + c.precio, 0) / competidores.length
        const ratio = precioPromedioCompetencia / precioBase

        // Si estamos muy por debajo del mercado, podemos subir
        if (ratio > 1.10) return 1.08
        // Si estamos encima del mercado, suavemente reducir o mantener
        if (ratio < 0.90) return 0.95
        return 1.0
    }

    private calcularConfianza(datosHistoricos: number, hayCompetidores: boolean): number {
        let confianza = 50 // Base

        if (datosHistoricos >= 6) confianza += 30
        else if (datosHistoricos >= 3) confianza += 15

        if (hayCompetidores) confianza += 20

        return Math.min(100, Math.max(0, confianza))
    }

    private generarEstrategias(precioBase: number, precioOptimo: number, factorDemanda: number): PricingStrategy[] {
        const estrategias: PricingStrategy[] = []

        // Estrategia Competitiva (-5% vs mercado)
        estrategias.push({
            tipo: 'COMPETITIVO',
            precioSugerido: Math.round(precioBase * 0.95),
            justificacion: 'Estrategia para ganar share o enfrentar competencia directa',
            riesgoNivel: 'BAJO',
            impactoEstimado: 5
        })

        // Estrategia Óptima (IA recomendada)
        estrategias.push({
            tipo: 'OPTIMO',
            precioSugerido: precioOptimo,
            justificacion: `Optimizado por IA considerando demanda (${Math.round(factorDemanda * 100)}%) y estacionalidad`,
            riesgoNivel: factorDemanda > 1.1 ? 'MEDIO' : 'BAJO',
            impactoEstimado: Math.round((precioOptimo / precioBase - 1) * 100)
        })

        // Estrategia Premium (+10% vs mercado)
        if (factorDemanda >= 1.10) {
            estrategias.push({
                tipo: 'PREMIUM',
                precioSugerido: Math.round(precioBase * 1.10),
                justificacion: 'Alta demanda justifica pricing premium',
                riesgoNivel: 'MEDIO',
                impactoEstimado: -8  // Pequeña pérdida de volumen esperada
            })
        }

        return estrategias
    }

    /**
     * Obtener factores estacionales activos
     */
    getFactoresEstacionales(): FactorEstacionalInfo[] {
        return this.factoresEstacionales.filter(f => f.activo)
    }

    /**
     * Actualizar factor estacional
     */
    actualizarFactorEstacionalData(nombre: string, factor: number): void {
        const existente = this.factoresEstacionales.find(f => f.nombre === nombre)
        if (existente) {
            existente.factor = factor
        }
    }

    /**
     * Agregar dato de competidor
     */
    agregarCompetidor(tipo: string, competidor: CompetitorPrice): void {
        const existentes = this.competidores.get(tipo) || []
        existentes.push(competidor)
        this.competidores.set(tipo, existentes)
    }

    /**
     * Simular impacto de cambio de precio
     */
    simularImpacto(precioActual: number, nuevoPrecio: number, ocupacionActual: number): {
        cambioPorcentaje: number
        perdidaClientesEstimada: number
        ingresoAdicional: number
    } {
        const cambioPorcentaje = Math.round(((nuevoPrecio - precioActual) / precioActual) * 100)

        // Estimación simple: por cada 5% de incremento, pierdes ~3% de clientes
        const perdidaClientesEstimada = Math.abs(cambioPorcentaje) > 5
            ? Math.round(Math.abs(cambioPorcentaje) / 5 * 3)
            : 0

        // Ingreso adicional asume que mantienes la mayoría de clientes
        const clientesRetenidos = 100 - perdidaClientesEstimada
        const ingresoAdicional = Math.round(
            nuevoPrecio * clientesRetenidos / 100 - precioActual
        )

        return {
            cambioPorcentaje,
            perdidaClientesEstimada,
            ingresoAdicional
        }
    }
}

// Singleton instance
export const cortexPricingService = new CortexPricingService()