import { logger } from "@/lib/observability";
/**
 * 🔍 SILEXAR PULSE - AI Anomaly Detection Service TIER 0
 *
 * @description Servicio de detección de anomalías con IA que
 * identifica patrones inusuales, riesgos y oportunidades de
 * forma proactiva.
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type TipoAnomalia =
  | "valor_inusual"
  | "descuento_excesivo"
  | "cliente_inactivo"
  | "patron_fraude"
  | "riesgo_pago"
  | "oportunidad_perdida"
  | "comportamiento_atipico"
  | "tendencia_negativa"
  | "meta_riesgo";

export type SeveridadAnomalia = "critica" | "alta" | "media" | "baja" | "info";

export interface Anomalia {
  id: string;
  tipo: TipoAnomalia;
  severidad: SeveridadAnomalia;
  titulo: string;
  descripcion: string;
  entidadAfectada: {
    tipo: "contrato" | "cliente" | "ejecutivo" | "cartera";
    id: string;
    nombre: string;
  };
  metricas: {
    valorEsperado: number;
    valorActual: number;
    desviacion: number;
    umbral: number;
  };
  confianza: number;
  recomendaciones: string[];
  acciones: {
    id: string;
    label: string;
    tipo: "primaria" | "secundaria";
  }[];
  detectadoEn: Date;
  expiraEn?: Date;
  fuente: "ml_model" | "regla" | "tendencia" | "comparacion";
}

export interface ConfiguracionDeteccion {
  umbralDesviacion: number;
  periodosAnalisis: number;
  sensibilidad: "alta" | "media" | "baja";
  tiposHabilitados: TipoAnomalia[];
  notificarInmediatamente: SeveridadAnomalia[];
}

export interface MetricaHistorica {
  fecha: Date;
  valor: number;
  promedio: number;
  desviacionEstandar: number;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockAnomalias: Anomalia[] = [
  {
    id: "an-001",
    tipo: "descuento_excesivo",
    severidad: "alta",
    titulo: "Descuento 35% Fuera de Política",
    descripcion:
      "El contrato CTR-2025-0147 de Retail XYZ tiene un descuento de 35%, que excede el límite autorizado de 25% para el ejecutivo.",
    entidadAfectada: {
      tipo: "contrato",
      id: "ctr-147",
      nombre: "CTR-2025-0147",
    },
    metricas: {
      valorEsperado: 25,
      valorActual: 35,
      desviacion: 40,
      umbral: 25,
    },
    confianza: 98,
    recomendaciones: [
      "Solicitar aprobación de Gerente Comercial",
      "Documentar justificación del descuento",
      "Verificar si hay compensación en volumen",
    ],
    acciones: [
      { id: "escalar", label: "Escalar a Aprobador", tipo: "primaria" },
      { id: "ajustar", label: "Ajustar Descuento", tipo: "secundaria" },
    ],
    detectadoEn: new Date(),
    fuente: "regla",
  },
  {
    id: "an-002",
    tipo: "riesgo_pago",
    severidad: "critica",
    titulo: "Cliente con Alto Riesgo de Impago",
    descripcion:
      "Empresa ABC tiene 3 facturas vencidas y score de riesgo de crédito de 82. Probabilidad de impago: 67%.",
    entidadAfectada: {
      tipo: "cliente",
      id: "cli-abc",
      nombre: "Empresa ABC",
    },
    metricas: {
      valorEsperado: 30,
      valorActual: 82,
      desviacion: 173,
      umbral: 50,
    },
    confianza: 87,
    recomendaciones: [
      "Solicitar pago anticipado o garantía",
      "Reducir exposición crediticia",
      "Contactar al cliente inmediatamente",
    ],
    acciones: [
      { id: "bloquear", label: "Bloquear Nuevos Contratos", tipo: "primaria" },
      { id: "llamar", label: "Contactar Cliente", tipo: "secundaria" },
    ],
    detectadoEn: new Date(),
    fuente: "ml_model",
  },
  {
    id: "an-003",
    tipo: "oportunidad_perdida",
    severidad: "media",
    titulo: "Cliente con Potencial No Aprovechado",
    descripcion:
      "Banco Delta incrementó 45% inversión en competencia pero nuestro contrato lleva 6 meses sin crecimiento.",
    entidadAfectada: {
      tipo: "cliente",
      id: "cli-delta",
      nombre: "Banco Delta",
    },
    metricas: {
      valorEsperado: 20,
      valorActual: 0,
      desviacion: 100,
      umbral: 10,
    },
    confianza: 78,
    recomendaciones: [
      "Agendar reunión de revisión",
      "Preparar propuesta de expansión",
      "Analizar mix de medios de competencia",
    ],
    acciones: [
      { id: "propuesta", label: "Generar Propuesta", tipo: "primaria" },
      { id: "reunion", label: "Agendar Reunión", tipo: "secundaria" },
    ],
    detectadoEn: new Date(),
    fuente: "tendencia",
  },
  {
    id: "an-004",
    tipo: "tendencia_negativa",
    severidad: "alta",
    titulo: "Caída Sostenida en Tasa de Cierre",
    descripcion:
      "El ejecutivo Juan Pérez tiene una tasa de cierre de 42% vs 68% promedio del equipo. Tendencia negativa por 3 meses.",
    entidadAfectada: {
      tipo: "ejecutivo",
      id: "ej-juanp",
      nombre: "Juan Pérez",
    },
    metricas: {
      valorEsperado: 68,
      valorActual: 42,
      desviacion: -38,
      umbral: 55,
    },
    confianza: 92,
    recomendaciones: [
      "Revisión de cartera asignada",
      "Coaching con supervisor",
      "Análisis de propuestas rechazadas",
    ],
    acciones: [
      { id: "coaching", label: "Programar Coaching", tipo: "primaria" },
      { id: "reasignar", label: "Revisar Cartera", tipo: "secundaria" },
    ],
    detectadoEn: new Date(),
    fuente: "tendencia",
  },
  {
    id: "an-005",
    tipo: "patron_fraude",
    severidad: "critica",
    titulo: "Patrón Sospechoso Detectado",
    descripcion:
      "Múltiples contratos con valores redondeados justo bajo umbral de aprobación ($24.9M). Revisión requerida.",
    entidadAfectada: {
      tipo: "cartera",
      id: "cart-001",
      nombre: "Cartera Norte",
    },
    metricas: {
      valorEsperado: 3,
      valorActual: 8,
      desviacion: 167,
      umbral: 4,
    },
    confianza: 85,
    recomendaciones: [
      "Auditoría inmediata de contratos",
      "Revisar historial del ejecutivo",
      "Notificar a compliance",
    ],
    acciones: [
      { id: "auditoria", label: "Iniciar Auditoría", tipo: "primaria" },
      { id: "compliance", label: "Notificar Compliance", tipo: "secundaria" },
    ],
    detectadoEn: new Date(),
    fuente: "ml_model",
  },
];

// ═══════════════════════════════════════════════════════════════
// MOTOR DE DETECCIÓN DE ANOMALÍAS
// ═══════════════════════════════════════════════════════════════

class AnomalyDetectionEngine {
  private static instance: AnomalyDetectionEngine;
  private configuracion: ConfiguracionDeteccion = {
    umbralDesviacion: 2.5,
    periodosAnalisis: 12,
    sensibilidad: "media",
    tiposHabilitados: [
      "valor_inusual",
      "descuento_excesivo",
      "cliente_inactivo",
      "patron_fraude",
      "riesgo_pago",
      "oportunidad_perdida",
      "comportamiento_atipico",
      "tendencia_negativa",
      "meta_riesgo",
    ],
    notificarInmediatamente: ["critica", "alta"],
  };

  private constructor() {}

  static getInstance(): AnomalyDetectionEngine {
    if (!this.instance) {
      this.instance = new AnomalyDetectionEngine();
    }
    return this.instance;
  }

  /**
   * Obtiene todas las anomalías activas
   */
  async getAnomalias(): Promise<Anomalia[]> {
    // Simular latencia de API
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockAnomalias;
  }

  /**
   * Obtiene anomalías por severidad
   */
  async getAnomaliasBySeveridad(
    severidades: SeveridadAnomalia[],
  ): Promise<Anomalia[]> {
    const todas = await this.getAnomalias();
    return todas.filter((a) => severidades.includes(a.severidad));
  }

  /**
   * Obtiene anomalías para una entidad específica
   */
  async getAnomaliasForEntity(tipo: string, id: string): Promise<Anomalia[]> {
    const todas = await this.getAnomalias();
    return todas.filter((a) =>
      a.entidadAfectada.tipo === tipo && a.entidadAfectada.id === id
    );
  }

  /**
   * Analiza un contrato en tiempo real
   */
  async analizarContrato(contrato: {
    valor: number;
    descuento: number;
    diasPago: number;
    clienteId: string;
    ejecutivoId: string;
  }): Promise<Anomalia[]> {
    const anomalias: Anomalia[] = [];

    // Detectar descuento excesivo
    if (contrato.descuento > 25) {
      anomalias.push({
        id: `an-rt-${Date.now()}-1`,
        tipo: "descuento_excesivo",
        severidad: contrato.descuento > 35 ? "critica" : "alta",
        titulo: "Descuento Fuera de Política",
        descripcion:
          `El descuento de ${contrato.descuento}% excede el límite estándar de 25%.`,
        entidadAfectada: {
          tipo: "contrato",
          id: "nuevo",
          nombre: "Contrato en Creación",
        },
        metricas: {
          valorEsperado: 25,
          valorActual: contrato.descuento,
          desviacion: ((contrato.descuento - 25) / 25) * 100,
          umbral: 25,
        },
        confianza: 100,
        recomendaciones: ["Solicitar aprobación de nivel superior"],
        acciones: [
          { id: "aprobar", label: "Solicitar Aprobación", tipo: "primaria" },
        ],
        detectadoEn: new Date(),
        fuente: "regla",
      });
    }

    // Detectar valor inusual (muy bajo o muy alto)
    const valorPromedio = 80000000; // Mock
    const desviacion = Math.abs(contrato.valor - valorPromedio) /
      valorPromedio * 100;

    if (desviacion > 50) {
      anomalias.push({
        id: `an-rt-${Date.now()}-2`,
        tipo: "valor_inusual",
        severidad: "media",
        titulo: "Valor Atípico del Contrato",
        descripcion: `El valor es ${
          desviacion.toFixed(0)
        }% diferente al promedio histórico.`,
        entidadAfectada: {
          tipo: "contrato",
          id: "nuevo",
          nombre: "Contrato en Creación",
        },
        metricas: {
          valorEsperado: valorPromedio,
          valorActual: contrato.valor,
          desviacion,
          umbral: 50,
        },
        confianza: 85,
        recomendaciones: ["Verificar que el valor sea correcto"],
        acciones: [
          { id: "confirmar", label: "Confirmar Valor", tipo: "secundaria" },
        ],
        detectadoEn: new Date(),
        fuente: "comparacion",
      });
    }

    // Detectar días de pago excesivos
    if (contrato.diasPago > 60) {
      anomalias.push({
        id: `an-rt-${Date.now()}-3`,
        tipo: "riesgo_pago",
        severidad: contrato.diasPago > 90 ? "alta" : "media",
        titulo: "Término de Pago Extendido",
        descripcion:
          `${contrato.diasPago} días de pago incrementa riesgo de cartera.`,
        entidadAfectada: {
          tipo: "contrato",
          id: "nuevo",
          nombre: "Contrato en Creación",
        },
        metricas: {
          valorEsperado: 45,
          valorActual: contrato.diasPago,
          desviacion: ((contrato.diasPago - 45) / 45) * 100,
          umbral: 60,
        },
        confianza: 90,
        recomendaciones: [
          "Considerar descuento por pronto pago",
          "Evaluar historial de pagos del cliente",
        ],
        acciones: [
          { id: "ajustar", label: "Reducir Días", tipo: "secundaria" },
        ],
        detectadoEn: new Date(),
        fuente: "regla",
      });
    }

    return anomalias;
  }

  /**
   * Calcula score de riesgo general
   */
  calcularScoreRiesgo(anomalias: Anomalia[]): number {
    if (anomalias.length === 0) return 0;

    const pesos = {
      critica: 30,
      alta: 20,
      media: 10,
      baja: 5,
      info: 1,
    };

    let score = 0;
    anomalias.forEach((a) => {
      score += pesos[a.severidad] * (a.confianza / 100);
    });

    return Math.min(score, 100);
  }

  /**
   * Obtiene resumen de anomalías
   */
  async getResumen(): Promise<{
    total: number;
    porSeveridad: Record<SeveridadAnomalia, number>;
    scoreRiesgo: number;
    tendencia: "mejorando" | "estable" | "empeorando";
  }> {
    const anomalias = await this.getAnomalias();

    const porSeveridad: Record<SeveridadAnomalia, number> = {
      critica: 0,
      alta: 0,
      media: 0,
      baja: 0,
      info: 0,
    };

    anomalias.forEach((a) => {
      porSeveridad[a.severidad]++;
    });

    return {
      total: anomalias.length,
      porSeveridad,
      scoreRiesgo: this.calcularScoreRiesgo(anomalias),
      tendencia: "estable", // Mock
    };
  }

  /**
   * Marca una anomalía como atendida
   */
  async atenderAnomalia(
    id: string,
    accion: string,
    comentario?: string,
  ): Promise<void> {
    logger.info(
      `Atendiendo anomalía ${id} con acción ${accion}${
        comentario ? ": " + comentario : ""
      }`,
    );
    // Aquí iría la lógica de persistencia
  }

  /**
   * Descarta una anomalía (falso positivo)
   */
  async descartarAnomalia(id: string, motivo: string): Promise<void> {
    logger.info(`Descartando anomalía ${id}: ${motivo}`);
    // Feedback al modelo para reducir falsos positivos
  }

  /**
   * Actualiza configuración
   */
  setConfiguracion(config: Partial<ConfiguracionDeteccion>): void {
    this.configuracion = { ...this.configuracion, ...config };
  }

  getConfiguracion(): ConfiguracionDeteccion {
    return { ...this.configuracion };
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

export const AnomalyDetection = AnomalyDetectionEngine.getInstance();

// Hook para uso en componentes
export function useAnomalyDetection() {
  return AnomalyDetection;
}
