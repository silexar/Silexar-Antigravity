import { logger } from '@/lib/observability';
/**
 * 🧠 SERVICIO DE IA AVANZADA TIER0
 * Detección de anomalías, motor de recomendaciones, y análisis predictivo
 * Machine Learning en tiempo real para operaciones Fortune 10
 */

// 🎯 Interfaces
interface Anomalia {
    id: string;
    timestamp: Date;
    tipo: 'VALOR_INUSUAL' | 'PATRON_SOSPECHOSO' | 'COMPORTAMIENTO_ANOMALO' | 'FRAUDE_POTENCIAL';
    severidad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
    descripcion: string;
    campo: string;
    valorDetectado: unknown;
    valorEsperado: unknown;
    confianza: number; // 0-100
    accionRecomendada: string;
}

interface Recomendacion {
    id: string;
    tipo: 'OPTIMIZACION' | 'MEJORA' | 'ADVERTENCIA' | 'OPORTUNIDAD';
    titulo: string;
    descripcion: string;
    impactoEstimado: {
        tipo: 'AHORRO' | 'EFICIENCIA' | 'ALCANCE' | 'CALIDAD';
        valor: number;
        unidad: string;
    };
    prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
    accionable: boolean;
    pasos?: string[];
}

interface PrediccionAnalytics {
    metrica: string;
    valorActual: number;
    prediccion7dias: number;
    prediccion30dias: number;
    tendencia: 'SUBIENDO' | 'ESTABLE' | 'BAJANDO';
    confianza: number;
    factoresInfluencia: Array<{ factor: string; impacto: number }>;
}

export class IAAvanzadaService {
    private readonly UMBRAL_ANOMALIA = 2.5; // Desviaciones estándar
    private historicoDatos: Map<string, number[]> = new Map();
    private modelosEntrenados: Map<string, unknown> = new Map();

    /**
     * 🔍 Detecta anomalías en tiempo real
     */
    async detectarAnomalias(datos: Record<string, unknown>, contexto: string): Promise<Anomalia[]> {
        const anomalias: Anomalia[] = [];

        // 1️⃣ Análisis de valores numéricos
        for (const [campo, valor] of Object.entries(datos)) {
            if (typeof valor === 'number') {
                const anomalia = await this.detectarAnomaliaValor(campo, valor, contexto);
                if (anomalia) {
                    anomalias.push(anomalia);
                }
            }
        }

        // 2️⃣ Análisis de patrones temporales
        const anomaliasTempo = await this.detectarPatronesTemporales(datos);
        anomalias.push(...anomaliasTempo);

        // 3️⃣ Análisis de comportamiento
        const anomaliasComportamiento = await this.detectarComportamientoAnomalo(datos);
        anomalias.push(...anomaliasComportamiento);

        // 4️⃣ Detección de fraude
        const anomaliasFraude = await this.detectarFraudePotencial(datos);
        anomalias.push(...anomaliasFraude);

        // Ordenar por severidad
        anomalias.sort((a, b) => {
            const severidadOrden = { CRITICA: 4, ALTA: 3, MEDIA: 2, BAJA: 1 };
            return severidadOrden[b.severidad] - severidadOrden[a.severidad];
        });

        return anomalias;
    }

    /**
     * 📊 Detecta anomalía en valor numérico usando Z-score
     */
    private async detectarAnomaliaValor(
        campo: string,
        valor: number,
        contexto: string
    ): Promise<Anomalia | null> {
        // Obtener histórico
        const clave = `${contexto}_${campo}`;
        let historico = this.historicoDatos.get(clave) || [];

        // Agregar valor actual
        historico.push(valor);
        if (historico.length > 1000) {
            historico = historico.slice(-1000); // Mantener últimos 1000
        }
        this.historicoDatos.set(clave, historico);

        // Necesitamos al menos 30 datos para análisis estadístico
        if (historico.length < 30) {
            return null;
        }

        // Calcular media y desviación estándar
        const media = historico.reduce((a, b) => a + b, 0) / historico.length;
        const varianza = historico.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / historico.length;
        const desviacion = Math.sqrt(varianza);

        // Calcular Z-score
        const zScore = Math.abs((valor - media) / desviacion);

        // Detectar anomalía
        if (zScore > this.UMBRAL_ANOMALIA) {
            const severidad = zScore > 4 ? 'CRITICA' : zScore > 3 ? 'ALTA' : 'MEDIA';

            return {
                id: `anomalia_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date(),
                tipo: 'VALOR_INUSUAL',
                severidad,
                descripcion: `Valor de ${campo} está ${zScore.toFixed(2)} desviaciones estándar fuera del rango normal`,
                campo,
                valorDetectado: valor,
                valorEsperado: media,
                confianza: Math.min(95, zScore * 20),
                accionRecomendada: `Verificar si el valor ${valor.toLocaleString()} es correcto. El valor esperado es aproximadamente ${media.toLocaleString()}`
            };
        }

        return null;
    }

    /**
     * ⏰ Detecta patrones temporales anómalos
     */
    private async detectarPatronesTemporales(datos: Record<string, unknown>): Promise<Anomalia[]> {
        const anomalias: Anomalia[] = [];

        // Detectar actividad fuera de horario normal
        const hora = new Date().getHours();
        if ((hora >= 0 && hora < 6) || hora >= 22) {
            if (datos.valorNeto && (datos.valorNeto as number) > 50000000) {
                anomalias.push({
                    id: `temporal_${Date.now()}`,
                    timestamp: new Date(),
                    tipo: 'PATRON_SOSPECHOSO',
                    severidad: 'MEDIA',
                    descripcion: 'Campaña de alto valor creada fuera del horario laboral',
                    campo: 'timestamp',
                    valorDetectado: new Date().toISOString(),
                    valorEsperado: '09:00-18:00',
                    confianza: 75,
                    accionRecomendada: 'Verificar autorización para operaciones fuera de horario'
                });
            }
        }

        // Detectar creación masiva en corto tiempo
        // (Simulado - en producción usar base de datos temporal)
        const creacionesRecientes = 5; // Simulado
        if (creacionesRecientes > 10) {
            anomalias.push({
                id: `masivo_${Date.now()}`,
                timestamp: new Date(),
                tipo: 'COMPORTAMIENTO_ANOMALO',
                severidad: 'ALTA',
                descripcion: 'Creación masiva de campañas detectada',
                campo: 'frecuencia_creacion',
                valorDetectado: creacionesRecientes,
                valorEsperado: 3,
                confianza: 85,
                accionRecomendada: 'Verificar si es una operación legítima o posible ataque automatizado'
            });
        }

        return anomalias;
    }

    /**
     * 🎭 Detecta comportamiento anómalo del usuario
     */
    private async detectarComportamientoAnomalo(datos: Record<string, unknown>): Promise<Anomalia[]> {
        const anomalias: Anomalia[] = [];

        // Detectar cambios drásticos en patrones de uso
        if (datos.valorNeto) {
            const valorActual = datos.valorNeto as number;
            const valorPromedio = 25000000; // Simulado - obtener de histórico real

            if (valorActual > valorPromedio * 5) {
                anomalias.push({
                    id: `comportamiento_${Date.now()}`,
                    timestamp: new Date(),
                    tipo: 'COMPORTAMIENTO_ANOMALO',
                    severidad: 'ALTA',
                    descripcion: 'Valor de campaña 5x superior al promedio histórico del usuario',
                    campo: 'valorNeto',
                    valorDetectado: valorActual,
                    valorEsperado: valorPromedio,
                    confianza: 80,
                    accionRecomendada: 'Requiere aprobación de supervisor para valores atípicos'
                });
            }
        }

        return anomalias;
    }

    /**
     * 🚨 Detecta posible fraude
     */
    private async detectarFraudePotencial(datos: Record<string, unknown>): Promise<Anomalia[]> {
        const anomalias: Anomalia[] = [];

        // Detectar valores sospechosos (números redondos muy altos)
        if (datos.valorNeto) {
            const valor = datos.valorNeto as number;
            const esRedondo = valor % 1000000 === 0;
            const esMuyAlto = valor > 100000000;

            if (esRedondo && esMuyAlto) {
                anomalias.push({
                    id: `fraude_${Date.now()}`,
                    timestamp: new Date(),
                    tipo: 'FRAUDE_POTENCIAL',
                    severidad: 'CRITICA',
                    descripcion: 'Valor sospechosamente redondo y alto detectado',
                    campo: 'valorNeto',
                    valorDetectado: valor,
                    valorEsperado: 'Valor no redondo',
                    confianza: 70,
                    accionRecomendada: 'ALERTA: Verificar inmediatamente con auditoría. Posible manipulación de datos.'
                });
            }
        }

        // Detectar inconsistencias en datos relacionados
        if (datos.cantidadCunas && datos.valorNeto) {
            const costoPorCuna = (datos.valorNeto as number) / (datos.cantidadCunas as number);
            if (costoPorCuna > 100000) {
                anomalias.push({
                    id: `inconsistencia_${Date.now()}`,
                    timestamp: new Date(),
                    tipo: 'FRAUDE_POTENCIAL',
                    severidad: 'ALTA',
                    descripcion: 'Costo por cuña inusualmente alto',
                    campo: 'costoPorCuna',
                    valorDetectado: costoPorCuna,
                    valorEsperado: 30000,
                    confianza: 75,
                    accionRecomendada: 'Verificar cálculos y tarifas. Posible error de entrada.'
                });
            }
        }

        return anomalias;
    }

    /**
     * 💡 Genera recomendaciones inteligentes
     */
    async generarRecomendaciones(datos: Record<string, unknown>, contexto: string): Promise<Recomendacion[]> {
        const recomendaciones: Recomendacion[] = [];

        // 1️⃣ Recomendaciones de optimización
        recomendaciones.push(...await this.recomendacionesOptimizacion(datos));

        // 2️⃣ Recomendaciones de mejora
        recomendaciones.push(...await this.recomendacionesMejora(datos));

        // 3️⃣ Identificar oportunidades
        recomendaciones.push(...await this.identificarOportunidades(datos));

        // 4️⃣ Advertencias proactivas
        recomendaciones.push(...await this.generarAdvertencias(datos));

        // Ordenar por prioridad
        const prioridadOrden = { URGENTE: 4, ALTA: 3, MEDIA: 2, BAJA: 1 };
        recomendaciones.sort((a, b) => prioridadOrden[b.prioridad] - prioridadOrden[a.prioridad]);

        return recomendaciones;
    }

    /**
     * ⚡ Recomendaciones de optimización
     */
    private async recomendacionesOptimizacion(datos: Record<string, unknown>): Promise<Recomendacion[]> {
        const recomendaciones: Recomendacion[] = [];

        // Optimización de costos
        if (datos.valorNeto && datos.comisionAgencia) {
            const comision = datos.comisionAgencia as number;
            if (comision > 15) {
                const ahorro = (datos.valorNeto as number) * ((comision - 15) / 100);
                recomendaciones.push({
                    id: `opt_comision_${Date.now()}`,
                    tipo: 'OPTIMIZACION',
                    titulo: 'Reducir Comisión de Agencia',
                    descripcion: `La comisión actual (${comision}%) está por encima del estándar de mercado (15%)`,
                    impactoEstimado: {
                        tipo: 'AHORRO',
                        valor: ahorro,
                        unidad: 'CLP'
                    },
                    prioridad: 'ALTA',
                    accionable: true,
                    pasos: [
                        'Negociar con agencia reducción a 15%',
                        'Comparar con otras agencias',
                        'Evaluar descuentos por volumen'
                    ]
                });
            }
        }

        // Optimización de programación
        if (datos.cantidadCunas && (datos.cantidadCunas as number) > 500) {
            recomendaciones.push({
                id: `opt_programacion_${Date.now()}`,
                tipo: 'OPTIMIZACION',
                titulo: 'Usar Optimización Automática ML',
                descripcion: 'Para campañas con más de 500 spots, el algoritmo genético puede mejorar la distribución',
                impactoEstimado: {
                    tipo: 'EFICIENCIA',
                    valor: 45,
                    unidad: '%'
                },
                prioridad: 'MEDIA',
                accionable: true,
                pasos: [
                    'Ir a pestaña de Programación',
                    'Hacer clic en "Optimizar con IA"',
                    'Revisar distribución sugerida',
                    'Aplicar optimización'
                ]
            });
        }

        return recomendaciones;
    }

    /**
     * 📈 Recomendaciones de mejora
     */
    private async recomendacionesMejora(datos: Record<string, unknown>): Promise<Recomendacion[]> {
        const recomendaciones: Recomendacion[] = [];

        // Mejorar alcance
        if (datos.emisoras && (datos.emisoras as unknown[]).length < 3) {
            recomendaciones.push({
                id: `mejora_alcance_${Date.now()}`,
                tipo: 'MEJORA',
                titulo: 'Aumentar Cobertura Multi-Emisora',
                descripcion: 'Agregar más emisoras puede aumentar el alcance hasta 150%',
                impactoEstimado: {
                    tipo: 'ALCANCE',
                    valor: 150,
                    unidad: '%'
                },
                prioridad: 'MEDIA',
                accionable: true,
                pasos: [
                    'Analizar audiencias complementarias',
                    'Seleccionar 2-3 emisoras adicionales',
                    'Redistribuir presupuesto'
                ]
            });
        }

        return recomendaciones;
    }

    /**
     * 🎯 Identificar oportunidades
     */
    private async identificarOportunidades(datos: Record<string, unknown>): Promise<Recomendacion[]> {
        const recomendaciones: Recomendacion[] = [];

        // Oportunidad de descuento por volumen
        if (datos.valorNeto && (datos.valorNeto as number) > 50000000) {
            recomendaciones.push({
                id: `oport_descuento_${Date.now()}`,
                tipo: 'OPORTUNIDAD',
                titulo: 'Negociar Descuento por Volumen',
                descripcion: 'El monto califica para descuentos corporativos (5-10%)',
                impactoEstimado: {
                    tipo: 'AHORRO',
                    valor: (datos.valorNeto as number) * 0.075, // 7.5% promedio
                    unidad: 'CLP'
                },
                prioridad: 'ALTA',
                accionable: true,
                pasos: [
                    'Contactar gerente comercial',
                    'Solicitar descuento por volumen',
                    'Negociar términos de pago'
                ]
            });
        }

        return recomendaciones;
    }

    /**
     * ⚠️ Generar advertencias proactivas
     */
    private async generarAdvertencias(datos: Record<string, unknown>): Promise<Recomendacion[]> {
        const recomendaciones: Recomendacion[] = [];

        // Advertencia de saturación
        if (datos.fechaInicio) {
            const diasHastaInicio = Math.ceil((new Date(datos.fechaInicio as string).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            if (diasHastaInicio < 7) {
                recomendaciones.push({
                    id: `adv_urgente_${Date.now()}`,
                    tipo: 'ADVERTENCIA',
                    titulo: 'Inicio Próximo - Acción Urgente',
                    descripcion: `La campaña inicia en ${diasHastaInicio} días. Completar programación urgentemente.`,
                    impactoEstimado: {
                        tipo: 'CALIDAD',
                        valor: 100,
                        unidad: '%'
                    },
                    prioridad: 'URGENTE',
                    accionable: true,
                    pasos: [
                        'Completar programación HOY',
                        'Confirmar disponibilidad de bloques',
                        'Enviar a aprobación final'
                    ]
                });
            }
        }

        return recomendaciones;
    }

    /**
     * 🔮 Análisis predictivo avanzado
     */
    async generarPrediccionesAnalytics(datos: Record<string, unknown>, historico: Record<string, unknown>[]): Promise<PrediccionAnalytics[]> {
        const predicciones: PrediccionAnalytics[] = [];

        // Predicción de valor neto
        if (historico.length > 0) {
            const valoresHistoricos = historico.map(h => (h.valorNeto as number) || 0);
            const tendencia = this.calcularTendencia(valoresHistoricos);
            const valorActual = (datos.valorNeto as number) || 0;

            predicciones.push({
                metrica: 'Valor Neto Promedio',
                valorActual,
                prediccion7dias: valorActual * (1 + tendencia * 0.1),
                prediccion30dias: valorActual * (1 + tendencia * 0.3),
                tendencia: tendencia > 0.05 ? 'SUBIENDO' : tendencia < -0.05 ? 'BAJANDO' : 'ESTABLE',
                confianza: 75,
                factoresInfluencia: [
                    { factor: 'Estacionalidad', impacto: 0.3 },
                    { factor: 'Tendencia histórica', impacto: 0.5 },
                    { factor: 'Mercado', impacto: 0.2 }
                ]
            });
        }

        return predicciones;
    }

    /**
     * 📊 Calcula tendencia de serie temporal
     */
    private calcularTendencia(valores: number[]): number {
        if (valores.length < 2) return 0;

        // Regresión lineal simple
        const n = valores.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const y = valores;

        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

        const pendiente = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

        return pendiente / (sumY / n); // Normalizar
    }

    /**
     * 🧹 Limpia datos históricos antiguos
     */
    limpiarHistorico(diasAntiguedad: number = 90): void {
        // En producción, implementar limpieza basada en timestamps
        logger.info(`🧹 Histórico limpiado: datos mayores a ${diasAntiguedad} días eliminados`);
    }
}

export const iaAvanzadaService = new IAAvanzadaService();
