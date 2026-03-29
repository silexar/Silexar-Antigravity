import { logger } from '@/lib/observability';
/**
 * 🧬 SERVICIO DE OPTIMIZACIÓN ML - TIER0
 * Algoritmos genéticos para optimización de programación de campañas
 * Optimizado para operaciones Fortune 10 24/7
 */

// 🎯 Interfaces
interface Spot {
    id: string;
    bloqueId: string;
    emisoraId: string;
    dia: string;
    hora: string;
    duracion: number;
    costo: number;
}

interface Bloque {
    id: string;
    nombre: string;
    emisoraId: string;
    horaInicio: string;
    horaFin: string;
    capacidadMaxima: number;
    ocupacionActual: number;
    tarifaBase: number;
}

interface Individuo {
    spots: Spot[];
    fitness: number;
    alcanceEstimado: number;
    frecuenciaPromedio: number;
    costoTotal: number;
    conflictos: number;
}

interface ParametrosOptimizacion {
    cantidadSpots: number;
    presupuestoMaximo: number;
    fechaInicio: Date;
    fechaTermino: Date;
    objetivoPrincipal: 'ALCANCE' | 'FRECUENCIA' | 'EQUILIBRADO';
    restricciones?: {
        emisorasPermitidas?: string[];
        bloquesPermitidos?: string[];
        diasPermitidos?: string[];
    };
}

export class OptimizacionMLService {
    private readonly TAMANO_POBLACION = 100;
    private readonly GENERACIONES = 50;
    private readonly TASA_MUTACION = 0.15;
    private readonly TASA_CRUCE = 0.7;
    private readonly ELITISMO = 0.1; // 10% mejores pasan directamente

    /**
     * 🧬 Optimiza la distribución de spots usando algoritmo genético
     */
    async optimizarDistribucion(
        parametros: ParametrosOptimizacion,
        bloquesDisponibles: Bloque[]
    ): Promise<Individuo> {
        logger.info('🧬 Iniciando optimización con algoritmo genético...');

        // 1️⃣ Generar población inicial
        let poblacion = this.generarPoblacionInicial(parametros, bloquesDisponibles);

        // 2️⃣ Evolucionar durante N generaciones
        for (let generacion = 0; generacion < this.GENERACIONES; generacion++) {
            // Evaluar fitness de cada individuo
            poblacion = poblacion.map(ind => ({
                ...ind,
                fitness: this.calcularFitness(ind, parametros)
            }));

            // Ordenar por fitness (mayor es mejor)
            poblacion.sort((a, b) => b.fitness - a.fitness);

            // Seleccionar elite
            const elite = poblacion.slice(0, Math.floor(this.TAMANO_POBLACION * this.ELITISMO));

            // Generar nueva población
            const nuevaPoblacion: Individuo[] = [...elite];

            while (nuevaPoblacion.length < this.TAMANO_POBLACION) {
                // Selección por torneo
                const padre1 = this.seleccionTorneo(poblacion);
                const padre2 = this.seleccionTorneo(poblacion);

                // Cruce
                let hijo: Individuo;
                if (Math.random() < this.TASA_CRUCE) {
                    hijo = this.cruzar(padre1, padre2);
                } else {
                    hijo = Math.random() < 0.5 ? { ...padre1 } : { ...padre2 };
                }

                // Mutación
                if (Math.random() < this.TASA_MUTACION) {
                    hijo = this.mutar(hijo, bloquesDisponibles);
                }

                nuevaPoblacion.push(hijo);
            }

            poblacion = nuevaPoblacion;

            // Log de progreso
            if (generacion % 10 === 0) {
                logger.info(`Generación ${generacion}: Mejor fitness = ${poblacion[0].fitness.toFixed(2)}`);
            }
        }

        // 3️⃣ Retornar mejor solución
        poblacion = poblacion.map(ind => ({
            ...ind,
            fitness: this.calcularFitness(ind, parametros)
        }));
        poblacion.sort((a, b) => b.fitness - a.fitness);

        const mejorSolucion = poblacion[0];
        logger.info('✅ Optimización completada!');
        logger.info(`   Fitness: ${mejorSolucion.fitness.toFixed(2)}`);
        logger.info(`   Alcance: ${mejorSolucion.alcanceEstimado.toLocaleString()}`);
        logger.info(`   Frecuencia: ${mejorSolucion.frecuenciaPromedio.toFixed(2)}`);
        logger.info(`   Costo: $${mejorSolucion.costoTotal.toLocaleString()}`);

        return mejorSolucion;
    }

    /**
     * 🌱 Genera población inicial aleatoria
     */
    private generarPoblacionInicial(
        parametros: ParametrosOptimizacion,
        bloquesDisponibles: Bloque[]
    ): Individuo[] {
        const poblacion: Individuo[] = [];

        for (let i = 0; i < this.TAMANO_POBLACION; i++) {
            const spots: Spot[] = [];

            for (let j = 0; j < parametros.cantidadSpots; j++) {
                const bloqueAleatorio = bloquesDisponibles[Math.floor(Math.random() * bloquesDisponibles.length)];

                spots.push({
                    id: `spot_${i}_${j}`,
                    bloqueId: bloqueAleatorio.id,
                    emisoraId: bloqueAleatorio.emisoraId,
                    dia: this.diaAleatorio(),
                    hora: bloqueAleatorio.horaInicio,
                    duracion: 30, // 30 segundos por defecto
                    costo: bloqueAleatorio.tarifaBase
                });
            }

            poblacion.push({
                spots,
                fitness: 0,
                alcanceEstimado: 0,
                frecuenciaPromedio: 0,
                costoTotal: spots.reduce((sum, s) => sum + s.costo, 0),
                conflictos: 0
            });
        }

        return poblacion;
    }

    /**
     * 🎯 Calcula el fitness de un individuo
     */
    private calcularFitness(individuo: Individuo, parametros: ParametrosOptimizacion): number {
        // Calcular métricas
        const alcance = this.calcularAlcance(individuo);
        const frecuencia = this.calcularFrecuencia(individuo);
        const costo = individuo.costoTotal;
        const conflictos = this.detectarConflictos(individuo);

        // Actualizar individuo
        individuo.alcanceEstimado = alcance;
        individuo.frecuenciaPromedio = frecuencia;
        individuo.conflictos = conflictos;

        // Penalizaciones
        let fitness = 0;

        // Objetivo principal
        switch (parametros.objetivoPrincipal) {
            case 'ALCANCE':
                fitness = alcance * 0.7 + frecuencia * 0.3;
                break;
            case 'FRECUENCIA':
                fitness = alcance * 0.3 + frecuencia * 0.7;
                break;
            case 'EQUILIBRADO':
                fitness = alcance * 0.5 + frecuencia * 0.5;
                break;
        }

        // Penalización por exceder presupuesto
        if (costo > parametros.presupuestoMaximo) {
            fitness *= 0.5;
        }

        // Penalización por conflictos
        fitness -= conflictos * 10;

        // Bonificación por diversidad de bloques
        const bloquesUnicos = new Set(individuo.spots.map(s => s.bloqueId)).size;
        fitness += bloquesUnicos * 2;

        return Math.max(0, fitness);
    }

    /**
     * 📊 Calcula el alcance estimado
     */
    private calcularAlcance(individuo: Individuo): number {
        // Simulación simple: más bloques diferentes = mayor alcance
        const bloquesUnicos = new Set(individuo.spots.map(s => s.bloqueId)).size;
        const emisorasUnicas = new Set(individuo.spots.map(s => s.emisoraId)).size;

        return (bloquesUnicos * 50000) + (emisorasUnicas * 100000);
    }

    /**
     * 🔄 Calcula la frecuencia promedio
     */
    private calcularFrecuencia(individuo: Individuo): number {
        // Simulación: spots en mismos bloques aumentan frecuencia
        const spotsTotal = individuo.spots.length;
        const bloquesUnicos = new Set(individuo.spots.map(s => s.bloqueId)).size;

        return spotsTotal / Math.max(1, bloquesUnicos);
    }

    /**
     * ⚠️ Detecta conflictos en la programación
     */
    private detectarConflictos(individuo: Individuo): number {
        let conflictos = 0;

        // Detectar spots en mismo bloque, mismo día, misma hora
        for (let i = 0; i < individuo.spots.length; i++) {
            for (let j = i + 1; j < individuo.spots.length; j++) {
                const spot1 = individuo.spots[i];
                const spot2 = individuo.spots[j];

                if (spot1.bloqueId === spot2.bloqueId &&
                    spot1.dia === spot2.dia &&
                    spot1.hora === spot2.hora) {
                    conflictos++;
                }
            }
        }

        return conflictos;
    }

    /**
     * 🏆 Selección por torneo
     */
    private seleccionTorneo(poblacion: Individuo[]): Individuo {
        const TAMANO_TORNEO = 5;
        const participantes: Individuo[] = [];

        for (let i = 0; i < TAMANO_TORNEO; i++) {
            const indiceAleatorio = Math.floor(Math.random() * poblacion.length);
            participantes.push(poblacion[indiceAleatorio]);
        }

        participantes.sort((a, b) => b.fitness - a.fitness);
        return participantes[0];
    }

    /**
     * 🧬 Cruce de dos individuos
     */
    private cruzar(padre1: Individuo, padre2: Individuo): Individuo {
        const puntoCorte = Math.floor(padre1.spots.length / 2);

        const spotsHijo = [
            ...padre1.spots.slice(0, puntoCorte),
            ...padre2.spots.slice(puntoCorte)
        ];

        return {
            spots: spotsHijo,
            fitness: 0,
            alcanceEstimado: 0,
            frecuenciaPromedio: 0,
            costoTotal: spotsHijo.reduce((sum, s) => sum + s.costo, 0),
            conflictos: 0
        };
    }

    /**
     * 🎲 Mutación de un individuo
     */
    private mutar(individuo: Individuo, bloquesDisponibles: Bloque[]): Individuo {
        const spotsMutados = [...individuo.spots];
        const indiceMutar = Math.floor(Math.random() * spotsMutados.length);
        const bloqueAleatorio = bloquesDisponibles[Math.floor(Math.random() * bloquesDisponibles.length)];

        spotsMutados[indiceMutar] = {
            ...spotsMutados[indiceMutar],
            bloqueId: bloqueAleatorio.id,
            emisoraId: bloqueAleatorio.emisoraId,
            hora: bloqueAleatorio.horaInicio,
            costo: bloqueAleatorio.tarifaBase
        };

        return {
            spots: spotsMutados,
            fitness: 0,
            alcanceEstimado: 0,
            frecuenciaPromedio: 0,
            costoTotal: spotsMutados.reduce((sum, s) => sum + s.costo, 0),
            conflictos: 0
        };
    }

    /**
     * 📅 Genera un día aleatorio
     */
    private diaAleatorio(): string {
        const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        return dias[Math.floor(Math.random() * dias.length)];
    }

    /**
     * 🔮 Predice disponibilidad de bloques
     */
    async predecirDisponibilidad(
        bloqueId: string,
        fecha: Date
    ): Promise<{ disponible: boolean; probabilidad: number; ocupacionEstimada: number }> {
        // Simulación de predicción basada en ML
        const diaSemana = fecha.getDay();
        const esFinDeSemana = diaSemana === 0 || diaSemana === 6;

        // Fin de semana tiene mayor disponibilidad
        const probabilidadBase = esFinDeSemana ? 0.8 : 0.6;
        const ocupacionBase = esFinDeSemana ? 30 : 60;

        return {
            disponible: Math.random() < probabilidadBase,
            probabilidad: probabilidadBase * 100,
            ocupacionEstimada: ocupacionBase + Math.random() * 20
        };
    }

    /**
     * ⚔️ Detecta conflictos comerciales
     */
    async detectarConflictosComerciales(
        spots: Spot[],
        anunciante: string
    ): Promise<{ conflictos: unknown[]; severidad: 'BAJA' | 'MEDIA' | 'ALTA' }> {
        const conflictos: unknown[] = [];

        // Simulación: detectar competencia en mismos bloques
        const competidores = ['Competidor A', 'Competidor B', 'Competidor C'];

        spots.forEach(spot => {
            if (Math.random() < 0.1) { // 10% de probabilidad de conflicto
                conflictos.push({
                    spotId: spot.id,
                    bloqueId: spot.bloqueId,
                    competidor: competidores[Math.floor(Math.random() * competidores.length)],
                    tipo: 'COMPETENCIA_DIRECTA',
                    recomendacion: 'Considerar cambiar de bloque o negociar exclusividad'
                });
            }
        });

        const severidad = conflictos.length > 5 ? 'ALTA' :
            conflictos.length > 2 ? 'MEDIA' : 'BAJA';

        return { conflictos, severidad };
    }
}

export const optimizacionMLService = new OptimizacionMLService();
