/**
 * ENTITY: PERFORMANCE PAQUETE - TIER 0 ENTERPRISE
 * 
 * @description Métricas de rendimiento y analytics de un paquete.
 * Tracking de revenue, conversión, ROI y tendencias.
 * 
 * @version 1.0.0
 */

export interface MetricaPerformance {
    fecha: Date
    valor: number
    tipo: 'revenue' | 'utilizacion' | 'conversion' | 'roi'
}

export interface PerformancePaqueteProps {
    id: string
    paqueteId: string

    // Métricas acumuladas
    revenueYTD: number
    revenueMTD: number
    revenueHistorico: number

    utilizacionPromedio: number
    conversionRate: number         // % de propuestas que cierran
    roiPromedio: number            // Return on Investment

    // Tendencias
    tendenciaUtilizacion: number   // % cambio vs mes anterior
    tendenciaRevenue: number

    // Rankings
    rankingTipo: number            // Posición entre paquetes del mismo tipo
    rankingGlobal: number         // Posición global

    // clientes
    mejorCliente: string
    totalClientesActivos: number

    // Predicciones
    prediccionProximoMes: number

    updatedAt: Date
}

export class PerformancePaquete {
    private constructor(private props: PerformancePaqueteProps) { }

    static crear(params: {
        paqueteId: string
    }): PerformancePaquete {
        const props: PerformancePaqueteProps = {
            id: `perf_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            paqueteId: params.paqueteId,
            revenueYTD: 0,
            revenueMTD: 0,
            revenueHistorico: 0,
            utilizacionPromedio: 0,
            conversionRate: 0,
            roiPromedio: 0,
            tendenciaUtilizacion: 0,
            tendenciaRevenue: 0,
            rankingTipo: 0,
            rankingGlobal: 0,
            mejorCliente: '',
            totalClientesActivos: 0,
            prediccionProximoMes: 0,
            updatedAt: new Date()
        }
        return new PerformancePaquete(props)
    }

    static fromPersistence(props: PerformancePaqueteProps): PerformancePaquete {
        return new PerformancePaquete({ ...props })
    }

    // Getters
    get id(): string { return this.props.id }
    get paqueteId(): string { return this.props.paqueteId }
    get revenueYTD(): number { return this.props.revenueYTD }
    get revenueMTD(): number { return this.props.revenueMTD }
    get utilizacionPromedio(): number { return this.props.utilizacionPromedio }
    get conversionRate(): number { return this.props.conversionRate }
    get roiPromedio(): number { return this.props.roiPromedio }
    get tendenciaUtilizacion(): number { return this.props.tendenciaUtilizacion }
    get tendenciaRevenue(): number { return this.props.tendenciaRevenue }
    get rankingGlobal(): number { return this.props.rankingGlobal }
    get mejorCliente(): string { return this.props.mejorCliente }

    // Calculated
    get esTopPerformer(): boolean {
        return this.props.rankingGlobal <= 10
    }

    get estaCreciendo(): boolean {
        return this.props.tendenciaRevenue > 0 || this.props.tendenciaUtilizacion > 0
    }

    get estaDeclinando(): boolean {
        return this.props.tendenciaRevenue < -10 || this.props.tendenciaUtilizacion < -10
    }

    // Business methods
    registrarRevenue(monto: number): void {
        this.props.revenueMTD += monto
        this.props.revenueYTD += monto
        this.props.revenueHistorico += monto
        this.props.updatedAt = new Date()
    }

    actualizarMetricas(params: {
        utilizacionPromedio?: number
        conversionRate?: number
        roiPromedio?: number
    }): void {
        if (params.utilizacionPromedio !== undefined) {
            this.props.utilizacionPromedio = params.utilizacionPromedio
        }
        if (params.conversionRate !== undefined) {
            this.props.conversionRate = params.conversionRate
        }
        if (params.roiPromedio !== undefined) {
            this.props.roiPromedio = params.roiPromedio
        }
        this.props.updatedAt = new Date()
    }

    calcularTendencias(mesAnterior: {
        revenue: number
        utilizacion: number
    }): void {
        if (mesAnterior.revenue > 0) {
            this.props.tendenciaRevenue = Math.round(
                ((this.props.revenueMTD - mesAnterior.revenue) / mesAnterior.revenue) * 10000
            ) / 100
        }
        if (mesAnterior.utilizacion > 0) {
            this.props.tendenciaUtilizacion = Math.round(
                ((this.props.utilizacionPromedio - mesAnterior.utilizacion) / mesAnterior.utilizacion) * 10000
            ) / 100
        }
        this.props.updatedAt = new Date()
    }

    predecirProximoMes(historial: MetricaPerformance[]): void {
        if (historial.length < 3) {
            this.props.prediccionProximoMes = this.props.revenueMTD
            return
        }

        // Media simple de últimos 3 meses
        const ultimos = historial.slice(-3)
        const promedio = ultimos.reduce((sum, m) => sum + m.valor, 0) / ultimos.length
        this.props.prediccionProximoMes = Math.round(promedio)
        this.props.updatedAt = new Date()
    }

    actualizarRanking(rankingTipo: number, rankingGlobal: number): void {
        this.props.rankingTipo = rankingTipo
        this.props.rankingGlobal = rankingGlobal
        this.props.updatedAt = new Date()
    }

    toSnapshot(): PerformancePaqueteProps {
        return { ...this.props }
    }
}