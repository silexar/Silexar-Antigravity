/**
 * SERVICE: CORTEX DEMAND - AI DEMAND PREDICTION
 * 
 * @description Motor de predicción de demanda usando análisis de tendencias
 * y patrones históricos. Proporciona forecasting de ocupación a 30/60/90 días.
 * 
 * @version 1.0.0
 */

export interface DemandPrediction {
    paqueteId: string
    predicciones: PrediccionPeriodo[]
    tendencia: 'CRECIENDO' | 'ESTABLE' | 'DECLINANDO'
    confianza: number
    factoresDetectados: FactorDetectado[]
    alertas: AlertaDemanda[]
}

export interface PrediccionPeriodo {
    dias: number                          // 30, 60, o 90
    ocupacionEstimada: number             // 0-100%
    revenueEstimado: number
    cuposDisponibles: number
    factorEstacional: string
}

export interface FactorDetectado {
    tipo: 'TEMPORADA' | 'COMPETENCIA' | 'TENDENCIA' | 'EVENTO'
    descripcion: string
    impacto: number                       // % de cambio esperado
}

export interface AlertaDemanda {
    tipo: 'SATURACION' | 'OPORTUNIDAD' | 'DECLIVE' | 'OPTIMO'
    mensaje: string
    accionSugerida: string
    prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA'
}

export interface HistoricoPunto {
    fecha: Date
    ocupacion: number
    revenue: number
}

export class CortexDemandService {
    /**
     * Predecir demanda para un paquete en los próximos 90 días
     */
    async predecirDemanda(params: {
        paqueteId: string
        tipo: string
        horario: { inicio: string; fin: string }
        historial: HistoricoPunto[]
        eventosProximos?: { fecha: Date; nombre: string }[]
    }): Promise<DemandPrediction> {
        const { paqueteId, tipo, horario, historial, eventosProximos = [] } = params

        // 1. Calcular tendencia base
        const tendencia = this.calcularTendencia(historial)

        // 2. Generar predicciones por período
        const predicciones = this.generarPredicciones(historial, tendencia, eventosProximos)

        // 3. Detectar factores
        const factoresDetectados = this.detectarFactores(historial, tendencia, tipo, eventosProximos)

        // 4. Generar alertas
        const alertas = this.generarAlertas(predicciones, historial)

        // 5. Calcular confianza
        const confianza = this.calcularConfianza(historial.length, eventosProximos.length)

        return {
            paqueteId,
            predicciones,
            tendencia,
            confianza,
            factoresDetectados,
            alertas
        }
    }

    private calcularTendencia(historial: HistoricoPunto[]): 'CRECIENDO' | 'ESTABLE' | 'DECLINANDO' {
        if (historial.length < 2) return 'ESTABLE'

        // Tomar último mes vs mes anterior
        const mesActual = historial.slice(-4)  // ~4 semanas
        const mesAnterior = historial.slice(-8, -4)

        if (mesActual.length === 0 || mesAnterior.length === 0) return 'ESTABLE'

        const avgActual = mesActual.reduce((s, p) => s + p.ocupacion, 0) / mesActual.length
        const avgAnterior = mesAnterior.reduce((s, p) => s + p.ocupacion, 0) / mesAnterior.length

        const cambio = ((avgActual - avgAnterior) / avgAnterior) * 100

        if (cambio > 10) return 'CRECIENDO'
        if (cambio < -10) return 'DECLINANDO'
        return 'ESTABLE'
    }

    private generarPredicciones(
        historial: HistoricoPunto[],
        tendencia: 'CRECIENDO' | 'ESTABLE' | 'DECLINANDO',
        eventos: { fecha: Date; nombre: string }[]
    ): PrediccionPeriodo[] {
        if (historial.length === 0) {
            return [
                { dias: 30, ocupacionEstimada: 50, revenueEstimado: 0, cuposDisponibles: 0, factorEstacional: 'NORMAL' },
                { dias: 60, ocupacionEstimada: 50, revenueEstimado: 0, cuposDisponibles: 0, factorEstacional: 'NORMAL' },
                { dias: 90, ocupacionEstimada: 50, revenueEstimado: 0, cuposDisponibles: 0, factorEstacional: 'NORMAL' }
            ]
        }

        // Calcular ocupación promedio histórico
        const ocupacionPromedio = historial.reduce((s, p) => s + p.ocupacion, 0) / historial.length
        const revenuePromedio = historial.reduce((s, p) => s + p.revenue, 0) / historial.length

        // Ajustar según tendencia
        let factorTendencia = 1.0
        if (tendencia === 'CRECIENDO') factorTendencia = 1.15
        if (tendencia === 'DECLINANDO') factorTendencia = 0.85

        // Ajustar según eventos próximos
        const factorEventos = this.calcularFactorEventos(eventos)

        const predicciones: PrediccionPeriodo[] = []

        for (const dias of [30, 60, 90]) {
            const factorProyeccion = 1 + (dias / 100) * (factorTendencia - 1)
            const ocupacionEstimada = Math.min(100, Math.round(ocupacionPromedio * factorProyeccion * factorEventos))

            predicciones.push({
                dias,
                ocupacionEstimada,
                revenueEstimado: Math.round(revenuePromedio * ocupacionEstimada / 100),
                cuposDisponibles: Math.round(100 - ocupacionEstimada),
                factorEstacional: this.getFactorEstacionalLabel(dias)
            })
        }

        return predicciones
    }

    private calcularFactorEventos(eventos: { fecha: Date; nombre: string }[]): number {
        if (eventos.length === 0) return 1.0

        let factor = 1.0
        for (const evento of eventos) {
            // Eventos especiales aumentan demanda
            if (evento.nombre.toLowerCase().includes('navidad')) factor *= 1.25
            else if (evento.nombre.toLowerCase().includes('año')) factor *= 1.20
            else if (evento.nombre.toLowerCase().includes('fiestas patrias')) factor *= 1.22
            else if (evento.nombre.toLowerCase().includes('black')) factor *= 1.20
            else factor *= 1.10
        }

        return Math.min(1.5, factor) // Cap a 150%
    }

    private getFactorEstacionalLabel(dias: number): string {
        const hoy = new Date()
        const mes = hoy.getMonth() + 1

        if (mes === 12) return 'NAVIDAD'
        if (mes === 9) return 'FIESTAS PATRIAS'
        if (mes === 1 || mes === 2) return 'VERANO'
        if (mes === 3) return 'VUELTA CLASES'
        if (mes >= 6 && mes <= 8) return 'INVIERNO'
        return 'NORMAL'
    }

    private detectarFactores(
        historial: HistoricoPunto[],
        tendencia: 'CRECIENDO' | 'ESTABLE' | 'DECLINANDO',
        tipo: string,
        eventos: { fecha: Date; nombre: string }[]
    ): FactorDetectado[] {
        const factores: FactorDetectado[] = []

        // Detectar estacionalidad del tipo
        if (tipo === 'PRIME') {
            factores.push({
                tipo: 'TEMPORADA',
                descripcion: 'Horarios Prime tienen mayor demanda en mañanas de weekdays',
                impacto: 15
            })
        }

        // Detectar tendencia
        if (tendencia === 'CRECIENDO') {
            factores.push({
                tipo: 'TENDENCIA',
                descripcion: 'Patrón de crecimiento detectado en últimos 30 días',
                impacto: 10
            })
        } else if (tendencia === 'DECLINANDO') {
            factores.push({
                tipo: 'TENDENCIA',
                descripcion: 'Patrón de declive detectado. Considerar promociones.',
                impacto: -12
            })
        }

        // Detectar eventos
        if (eventos.length > 0) {
            factores.push({
                tipo: 'EVENTO',
                descripcion: `${eventos.length} evento(s) especial(es) detectado(s) en próximos 90 días`,
                impacto: 20
            })
        }

        return factores
    }

    private generarAlertas(
        predicciones: PrediccionPeriodo[],
        historial: HistoricoPunto[]
    ): AlertaDemanda[] {
        const alertas: AlertaDemanda[] = []

        // Alerta de saturación
        if (predicciones[0]?.ocupacionEstimada >= 90) {
            alertas.push({
                tipo: 'SATURACION',
                mensaje: 'Predicción de saturación (>90%) en próximos 30 días',
                accionSugerida: 'Considerar incremento de precio o activar lista de espera',
                prioridad: 'ALTA'
            })
        }

        // Alerta de oportunidad
        if (predicciones[0]?.ocupacionEstimada < 50) {
            alertas.push({
                tipo: 'OPORTUNIDAD',
                mensaje: 'Paquete sub-utilizado (<50%). Ideal para promociones.',
                accionSugerida: 'Crear paquete promocional Early Bird o descuento por volumen',
                prioridad: 'MEDIA'
            })
        }

        // Alerta de declive
        if (predicciones[0] && predicciones[0].ocupacionEstimada < historial[historial.length - 1]?.ocupacion - 15) {
            alertas.push({
                tipo: 'DECLIVE',
                mensaje: 'Declive significativo proyectado. Acción recomendada.',
                accionSugerida: 'Revisar pricing y considerar repositionamiento',
                prioridad: 'CRITICA'
            })
        }

        // Alerta de óptimo
        if (predicciones[0]?.ocupacionEstimada >= 70 && predicciones[0]?.ocupacionEstimada < 85) {
            alertas.push({
                tipo: 'OPTIMO',
                mensaje: 'Nivel de ocupación óptimo para revenue',
                accionSugerida: 'Mantener estrategia actual',
                prioridad: 'BAJA'
            })
        }

        return alertas
    }

    private calcularConfianza(historialLength: number, eventosLength: number): number {
        let confianza = 40 // Base

        if (historialLength >= 12) confianza += 40
        else if (historialLength >= 6) confianza += 25
        else if (historialLength >= 3) confianza += 15

        if (eventosLength > 0) confianza += 15

        return Math.min(95, Math.max(30, confianza))
    }

    /**
     * Sugerir mejores fechas para nuevos paquetes
     */
    async sugerirFechasOptimas(params: {
        tipo: string
        duracionDeseada: number          // días
    }): Promise<{ fecha: Date; razon: string; factorDemanda: number }[]> {
        const sugerencias: { fecha: Date; razon: string; factorDemanda: number }[] = []

        const hoy = new Date()

        // Analizar últimos 90 días
        for (let i = 0; i < 90; i++) {
            const fecha = new Date(hoy)
            fecha.setDate(fecha.getDate() + i)

            const factor = this.calcularFactorDemandaFecha(fecha, params.tipo)

            if (factor > 1.15) {
                sugerencias.push({
                    fecha,
                    razon: this.getRazonFactor(fecha, factor),
                    factorDemanda: factor
                })
            }
        }

        // Ordenar por factor de demanda
        sugerencias.sort((a, b) => b.factorDemanda - a.factorDemanda)

        return sugerencias.slice(0, 5)
    }

    private calcularFactorDemandaFecha(fecha: Date, tipo: string): number {
        let factor = 1.0
        const mes = fecha.getMonth() + 1
        const dia = fecha.getDate()

        // Factores mensuales
        if (mes === 12) factor *= 1.25
        else if (mes === 9) factor *= 1.22
        else if (mes === 1 || mes === 2) factor *= 1.08
        else if (mes === 3) factor *= 1.12
        else if (mes >= 6 && mes <= 8) factor *= 0.95

        // Días específicos
        if (mes === 12 && dia >= 15) factor *= 1.10
        if (mes === 9 && dia >= 18 && dia <= 20) factor *= 1.15
        if (mes === 2 && dia === 14) factor *= 1.10

        return factor
    }

    private getRazonFactor(fecha: Date, factor: number): string {
        const mes = fecha.getMonth() + 1
        const dia = fecha.getDate()

        if (mes === 12 && dia >= 15) return 'Temporada navideña alta'
        if (mes === 12) return 'Fin de año'
        if (mes === 9 && dia >= 18 && dia <= 20) return 'Fiestas Patrias'
        if (mes === 9) return 'Septiembre'
        if (mes === 2 && dia === 14) return 'Día de San Valentín'
        if (mes === 3) return 'Vuelta a clases'
        if (factor > 1.15) return 'Alta demanda proyectada'

        return 'Factor de demanda positivo'
    }
}

// Singleton instance
export const cortexDemandService = new CortexDemandService()