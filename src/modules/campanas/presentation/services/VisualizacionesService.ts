/**
 * 📊 SERVICIO DE VISUALIZACIONES TIER0
 * Generación de visualizaciones avanzadas para programación de campañas
 * Timeline interactivo, heatmaps de saturación, y análisis predictivo
 */

export interface TimelineEvent {
    id: string;
    titulo: string;
    fecha: Date;
    tipo: 'SPOT' | 'MILESTONE' | 'CONFLICTO' | 'OPTIMIZACION';
    descripcion: string;
    color: string;
    icono: string;
}

export interface HeatmapData {
    dia: string;
    hora: string;
    valor: number; // 0-100 (saturación)
    spots: number;
    disponibilidad: number;
    color: string;
}

export interface SaturacionBloque {
    bloqueId: string;
    nombreBloque: string;
    saturacion: number; // 0-100
    spotsActuales: number;
    capacidadMaxima: number;
    tendencia: 'SUBIENDO' | 'ESTABLE' | 'BAJANDO';
    prediccionSemana: number;
}

export class VisualizacionesService {
    /**
     * 📅 Genera datos para timeline interactivo
     */
    generarTimeline(
        fechaInicio: Date,
        fechaTermino: Date,
        spots: Record<string, unknown>[]
    ): TimelineEvent[] {
        const eventos: TimelineEvent[] = [];

        // Agregar evento de inicio
        eventos.push({
            id: 'inicio',
            titulo: 'Inicio de Campaña',
            fecha: fechaInicio,
            tipo: 'MILESTONE',
            descripcion: 'Comienza la emisión de la campaña',
            color: '#10b981',
            icono: 'play'
        });

        // Agregar spots como eventos
        spots.forEach((spot, index) => {
            const fechaSpot = new Date(fechaInicio);
            fechaSpot.setDate(fechaSpot.getDate() + Math.floor(index / 10)); // Distribuir en el tiempo

            eventos.push({
                id: `spot_${spot['id'] as string}`,
                titulo: `Spot en ${spot['bloqueNombre'] as string}`,
                fecha: fechaSpot,
                tipo: 'SPOT',
                descripcion: `Emisora: ${spot['emisoraNombre'] as string} - ${spot['hora'] as string}`,
                color: '#3b82f6',
                icono: 'radio'
            });
        });

        // Agregar hitos de optimización cada semana
        const duracionDias = Math.ceil((fechaTermino.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
        const semanas = Math.ceil(duracionDias / 7);

        for (let i = 1; i <= semanas; i++) {
            const fechaOptimizacion = new Date(fechaInicio);
            fechaOptimizacion.setDate(fechaOptimizacion.getDate() + (i * 7));

            if (fechaOptimizacion <= fechaTermino) {
                eventos.push({
                    id: `opt_${i}`,
                    titulo: `Optimización Automática`,
                    fecha: fechaOptimizacion,
                    tipo: 'OPTIMIZACION',
                    descripcion: `Análisis y ajuste automático de programación`,
                    color: '#8b5cf6',
                    icono: 'zap'
                });
            }
        }

        // Agregar evento de término
        eventos.push({
            id: 'termino',
            titulo: 'Fin de Campaña',
            fecha: fechaTermino,
            tipo: 'MILESTONE',
            descripcion: 'Finaliza la emisión de la campaña',
            color: '#ef4444',
            icono: 'stop'
        });

        // Ordenar por fecha
        eventos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

        return eventos;
    }

    /**
     * 🔥 Genera heatmap de saturación por día y hora
     */
    generarHeatmap(spots: Record<string, unknown>[]): HeatmapData[] {
        const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const horas = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

        const heatmapData: HeatmapData[] = [];

        // Generar matriz de saturación
        dias.forEach(dia => {
            horas.forEach(hora => {
                // Contar spots en este día/hora
                const spotsEnCelda = spots.filter(s =>
                    s['dia'] === dia && (s['hora'] as string).startsWith(hora.substring(0, 2))
                ).length;

                // Calcular saturación (0-100)
                const capacidadMaxima = 10; // Máximo spots por hora
                const saturacion = Math.min(100, (spotsEnCelda / capacidadMaxima) * 100);

                // Determinar color basado en saturación
                let color = '#10b981'; // Verde (baja saturación)
                if (saturacion > 70) {
                    color = '#ef4444'; // Rojo (alta saturación)
                } else if (saturacion > 40) {
                    color = '#f59e0b'; // Amarillo (saturación media)
                }

                heatmapData.push({
                    dia,
                    hora,
                    valor: saturacion,
                    spots: spotsEnCelda,
                    disponibilidad: 100 - saturacion,
                    color
                });
            });
        });

        return heatmapData;
    }

    /**
     * 📊 Analiza saturación por bloque
     */
    analizarSaturacionBloques(
        bloques: Record<string, unknown>[],
        spots: Record<string, unknown>[]
    ): SaturacionBloque[] {
        return bloques.map(bloque => {
            const spotsEnBloque = spots.filter(s => s['bloqueId'] === bloque['id']).length;
            const saturacion = (spotsEnBloque / (bloque['capacidadMaxima'] as number)) * 100;

            // Simular tendencia
            const tendencia = saturacion > 80 ? 'SUBIENDO' :
                saturacion < 30 ? 'BAJANDO' : 'ESTABLE';

            // Predicción para próxima semana (simulada)
            let prediccion = saturacion;
            if (tendencia === 'SUBIENDO') {
                prediccion = Math.min(100, saturacion + 10);
            } else if (tendencia === 'BAJANDO') {
                prediccion = Math.max(0, saturacion - 10);
            }

            return {
                bloqueId: bloque['id'] as string,
                nombreBloque: bloque['nombre'] as string,
                saturacion: Math.round(saturacion),
                spotsActuales: spotsEnBloque,
                capacidadMaxima: bloque['capacidadMaxima'] as number,
                tendencia,
                prediccionSemana: Math.round(prediccion)
            };
        });
    }

    /**
     * 📈 Genera datos para gráfico de distribución temporal
     */
    generarDistribucionTemporal(
        spots: Record<string, unknown>[],
        fechaInicio: Date,
        fechaTermino: Date
    ): { fecha: string; spots: number; alcanceEstimado: number }[] {
        const datos: { fecha: string; spots: number; alcanceEstimado: number }[] = [];
        const duracionDias = Math.ceil((fechaTermino.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));

        // Agrupar spots por semana
        const semanas = Math.ceil(duracionDias / 7);

        for (let i = 0; i < semanas; i++) {
            const fechaSemana = new Date(fechaInicio);
            fechaSemana.setDate(fechaSemana.getDate() + (i * 7));

            // Simular distribución de spots
            const spotsEnSemana = Math.floor(spots.length / semanas) + Math.floor(Math.random() * 5);
            const alcance = spotsEnSemana * 50000; // 50k alcance por spot

            datos.push({
                fecha: fechaSemana.toLocaleDateString('es-CL'),
                spots: spotsEnSemana,
                alcanceEstimado: alcance
            });
        }

        return datos;
    }

    /**
     * 🎯 Genera mapa de cobertura por emisora
     */
    generarMapaCobertura(spots: Record<string, unknown>[]): { emisora: string; spots: number; alcance: number; porcentaje: number }[] {
        const emisorasMap = new Map<string, number>();

        // Contar spots por emisora
        spots.forEach(spot => {
            const emisoraNombre = spot['emisoraNombre'] as string;
            const count = emisorasMap.get(emisoraNombre) || 0;
            emisorasMap.set(emisoraNombre, count + 1);
        });

        const totalSpots = spots.length;

        // Convertir a array y calcular métricas
        return Array.from(emisorasMap.entries()).map(([emisora, spotsCount]) => ({
            emisora,
            spots: spotsCount,
            alcance: spotsCount * 100000, // 100k alcance por spot
            porcentaje: Math.round((spotsCount / totalSpots) * 100)
        })).sort((a, b) => b.spots - a.spots);
    }

    /**
     * 🔮 Genera predicción de performance
     */
    generarPrediccionPerformance(
        spots: Record<string, unknown>[],
        presupuesto: number
    ): {
        impactosEstimados: number;
        alcanceEstimado: number;
        frecuenciaPromedio: number;
        cpm: number; // Costo por mil impresiones
        roi: number; // Return on Investment estimado
        confianza: number; // 0-100
    } {
        const totalSpots = spots.length;

        // Cálculos simulados basados en ML
        const impactosPorSpot = 50000;
        const impactosEstimados = totalSpots * impactosPorSpot;
        const alcanceEstimado = impactosEstimados * 0.7; // 70% de alcance único
        const frecuenciaPromedio = impactosEstimados / alcanceEstimado;
        const cpm = (presupuesto / impactosEstimados) * 1000;
        const roi = 2.5; // ROI estimado de 2.5x
        const confianza = 85; // 85% de confianza en la predicción

        return {
            impactosEstimados,
            alcanceEstimado: Math.round(alcanceEstimado),
            frecuenciaPromedio: Math.round(frecuenciaPromedio * 10) / 10,
            cpm: Math.round(cpm),
            roi,
            confianza
        };
    }

    /**
     * ⚡ Genera análisis de eficiencia
     */
    generarAnalisisEficiencia(
        spots: Record<string, unknown>[],
        presupuesto: number
    ): {
        eficienciaGeneral: number; // 0-100
        costoPorSpot: number;
        distribucionOptima: boolean;
        recomendaciones: string[];
    } {
        const totalSpots = spots.length;
        const costoPorSpot = presupuesto / totalSpots;

        // Analizar distribución
        const emisorasUnicas = new Set(spots.map(s => s['emisoraId'])).size;
        const bloquesUnicos = new Set(spots.map(s => s['bloqueId'])).size;

        // Calcular eficiencia
        let eficiencia = 50; // Base
        eficiencia += emisorasUnicas * 5; // Más emisoras = más eficiencia
        eficiencia += bloquesUnicos * 3; // Más bloques = más eficiencia
        eficiencia = Math.min(100, eficiencia);

        const distribucionOptima = eficiencia > 70;

        // Generar recomendaciones
        const recomendaciones: string[] = [];
        if (emisorasUnicas < 3) {
            recomendaciones.push('Considerar agregar más emisoras para aumentar alcance');
        }
        if (bloquesUnicos < 5) {
            recomendaciones.push('Diversificar bloques horarios para mejor cobertura');
        }
        if (costoPorSpot > 50000) {
            recomendaciones.push('Costo por spot es alto, buscar bloques más económicos');
        }
        if (eficiencia < 60) {
            recomendaciones.push('Ejecutar optimización automática para mejorar eficiencia');
        }

        return {
            eficienciaGeneral: Math.round(eficiencia),
            costoPorSpot: Math.round(costoPorSpot),
            distribucionOptima,
            recomendaciones
        };
    }
}

export const visualizacionesService = new VisualizacionesService();
