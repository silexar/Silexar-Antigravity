import { logger } from "@/lib/observability";
/**
 * 🔔 SILEXAR PULSE - Smart Alerts Service TIER 0
 *
 * @description Sistema de alertas inteligentes proactivas que:
 * - Detecta vencimientos y fechas críticas
 * - Alerta sobre anomalías en contratos
 * - Notifica cambios importantes
 * - Sugiere acciones preventivas
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type TipoAlerta =
  | "VENCIMIENTOS_PROXIMO"
  | "RENOVACION_PENDIENTE"
  | "APROBACION_REQUERIDA"
  | "DESCUENTO_EXCESIVO"
  | "PAGO_VENCIDO"
  | "DOCUMENTO_FALTANTE"
  | "FIRMA_PENDIENTE"
  | "ANOMALIA_DETECTADA"
  | "OPORTUNIDAD"
  | "CUMPLIMIENTO"
  | "SLA_RIESGO"
  | "INACTIVIDAD";

export type PrioridadAlerta = "baja" | "media" | "alta" | "urgente";
export type EstadoAlerta =
  | "activa"
  | "leida"
  | "resuelta"
  | "ignorada"
  | "escalada";

export interface AlertaContrato {
  id: string;
  tipo: TipoAlerta;
  prioridad: PrioridadAlerta;
  estado: EstadoAlerta;

  // Contexto
  contratoId?: string;
  numeroContrato?: string;
  clienteNombre?: string;

  // Contenido
  titulo: string;
  mensaje: string;
  accionSugerida?: string;
  urlAccion?: string;

  // Tiempo
  fechaCreacion: Date;
  fechaExpiracion?: Date;
  fechaResolucion?: Date;

  // Asignación
  destinatarioId?: string;
  destinatarioNombre?: string;
  creadoPor: "SISTEMA" | "USUARIO" | "IA";

  // Metadatos
  datosAdicionales?: Record<string, unknown>;
  etiquetas?: string[];
}

export interface ConfiguracionAlerta {
  tipo: TipoAlerta;
  habilitado: boolean;
  diasAnticipacion?: number;
  destinatarios: string[];
  canales: ("APP" | "EMAIL" | "WHATSAPP" | "SMS")[];
  horarioActivo?: { inicio: string; fin: string };
}

export interface ResumenAlertas {
  total: number;
  urgentes: number;
  sinLeer: number;
  porTipo: Record<TipoAlerta, number>;
  tendencia: "subiendo" | "bajando" | "estable";
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIONES POR DEFECTO
// ═══════════════════════════════════════════════════════════════

const CONFIGURACIONES_DEFAULT: ConfiguracionAlerta[] = [
  {
    tipo: "VENCIMIENTOS_PROXIMO",
    habilitado: true,
    diasAnticipacion: 30,
    destinatarios: ["ejecutivo", "supervisor"],
    canales: ["APP", "EMAIL"],
  },
  {
    tipo: "RENOVACION_PENDIENTE",
    habilitado: true,
    diasAnticipacion: 60,
    destinatarios: ["ejecutivo"],
    canales: ["APP", "EMAIL", "WHATSAPP"],
  },
  {
    tipo: "APROBACION_REQUERIDA",
    habilitado: true,
    destinatarios: ["aprobador"],
    canales: ["APP", "EMAIL"],
  },
  {
    tipo: "DESCUENTO_EXCESIVO",
    habilitado: true,
    destinatarios: ["supervisor", "gerente"],
    canales: ["APP"],
  },
  {
    tipo: "PAGO_VENCIDO",
    habilitado: true,
    destinatarios: ["ejecutivo", "cobranza"],
    canales: ["APP", "EMAIL"],
  },
  {
    tipo: "DOCUMENTO_FALTANTE",
    habilitado: true,
    destinatarios: ["ejecutivo"],
    canales: ["APP"],
  },
  {
    tipo: "FIRMA_PENDIENTE",
    habilitado: true,
    diasAnticipacion: 7,
    destinatarios: ["ejecutivo", "cliente"],
    canales: ["APP", "EMAIL", "WHATSAPP"],
  },
  {
    tipo: "ANOMALIA_DETECTADA",
    habilitado: true,
    destinatarios: ["supervisor", "auditoria"],
    canales: ["APP", "EMAIL"],
  },
  {
    tipo: "OPORTUNIDAD",
    habilitado: true,
    destinatarios: ["ejecutivo"],
    canales: ["APP"],
  },
  {
    tipo: "SLA_RIESGO",
    habilitado: true,
    destinatarios: ["supervisor"],
    canales: ["APP", "EMAIL"],
  },
];

// ═══════════════════════════════════════════════════════════════
// MOTOR DE ALERTAS
// ═══════════════════════════════════════════════════════════════

class SmartAlertsEngine {
  private static instance: SmartAlertsEngine;
  private alertas: AlertaContrato[] = [];
  private configuraciones: ConfiguracionAlerta[] = CONFIGURACIONES_DEFAULT;

  private constructor() {
    this.inicializarAlertasDemo();
  }

  static getInstance(): SmartAlertsEngine {
    if (!this.instance) {
      this.instance = new SmartAlertsEngine();
    }
    return this.instance;
  }

  private inicializarAlertasDemo(): void {
    this.alertas = [
      {
        id: "alerta-001",
        tipo: "VENCIMIENTOS_PROXIMO",
        prioridad: "alta",
        estado: "activa",
        contratoId: "ctr-001",
        numeroContrato: "CTR-2025-001",
        clienteNombre: "Banco Chile",
        titulo: "Contrato próximo a vencer",
        mensaje:
          "El contrato CTR-2025-001 vence en 15 días. Considere iniciar proceso de renovación.",
        accionSugerida: "Iniciar renovación",
        urlAccion: "/contratos/ctr-001/renovar",
        fechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        fechaExpiracion: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        destinatarioNombre: "Carlos Mendoza",
        creadoPor: "SISTEMA",
        etiquetas: ["vencimientos", "renovación"],
      },
      {
        id: "alerta-002",
        tipo: "APROBACION_REQUERIDA",
        prioridad: "urgente",
        estado: "activa",
        contratoId: "ctr-002",
        numeroContrato: "CTR-2025-002",
        clienteNombre: "Falabella",
        titulo: "Aprobación pendiente urgente",
        mensaje:
          "El contrato CTR-2025-002 lleva 36 horas esperando aprobación de nivel 2.",
        accionSugerida: "Aprobar contrato",
        urlAccion: "/contratos/ctr-002/aprobar",
        fechaCreacion: new Date(Date.now() - 36 * 60 * 60 * 1000),
        destinatarioNombre: "Ana García",
        creadoPor: "SISTEMA",
        etiquetas: ["aprobación", "SLA"],
      },
      {
        id: "alerta-003",
        tipo: "DESCUENTO_EXCESIVO",
        prioridad: "alta",
        estado: "activa",
        contratoId: "ctr-003",
        numeroContrato: "CTR-2025-003",
        clienteNombre: "Cencosud",
        titulo: "Descuento fuera de política",
        mensaje:
          "Se solicitó un descuento del 25% que excede el límite de 20% para el rol ejecutivo.",
        accionSugerida: "Revisar y aprobar excepción",
        urlAccion: "/contratos/ctr-003",
        fechaCreacion: new Date(Date.now() - 4 * 60 * 60 * 1000),
        destinatarioNombre: "Roberto Silva",
        creadoPor: "IA",
        datosAdicionales: { descuentoSolicitado: 25, limiteRol: 20 },
        etiquetas: ["descuento", "excepción"],
      },
      {
        id: "alerta-004",
        tipo: "OPORTUNIDAD",
        prioridad: "media",
        estado: "activa",
        contratoId: "ctr-001",
        numeroContrato: "CTR-2025-001",
        clienteNombre: "Banco Chile",
        titulo: "Oportunidad de upselling detectada",
        mensaje:
          "El cliente ha aumentado su inversión un 40% este año. Considere ofrecer paquete premium.",
        accionSugerida: "Ver análisis",
        fechaCreacion: new Date(Date.now() - 12 * 60 * 60 * 1000),
        destinatarioNombre: "Carlos Mendoza",
        creadoPor: "IA",
        datosAdicionales: { crecimiento: 40, potencialAdicional: 50000000 },
        etiquetas: ["oportunidad", "upselling"],
      },
      {
        id: "alerta-005",
        tipo: "FIRMA_PENDIENTE",
        prioridad: "media",
        estado: "activa",
        contratoId: "ctr-004",
        numeroContrato: "CTR-2025-004",
        clienteNombre: "Ripley",
        titulo: "Firma cliente pendiente",
        mensaje:
          "El contrato fue enviado hace 5 días y aún no ha sido firmado por el cliente.",
        accionSugerida: "Enviar recordatorio",
        urlAccion: "/contratos/ctr-004/recordatorio",
        fechaCreacion: new Date(Date.now() - 24 * 60 * 60 * 1000),
        destinatarioNombre: "María López",
        creadoPor: "SISTEMA",
        etiquetas: ["firma", "cliente"],
      },
      {
        id: "alerta-006",
        tipo: "PAGO_VENCIDO",
        prioridad: "alta",
        estado: "activa",
        contratoId: "ctr-005",
        numeroContrato: "CTR-2024-089",
        clienteNombre: "Paris",
        titulo: "Pago vencido",
        mensaje: "La factura #12345 tiene 15 días de mora. Monto: $12.500.000",
        accionSugerida: "Gestionar cobranza",
        urlAccion: "/cobranza/factura-12345",
        fechaCreacion: new Date(Date.now() - 48 * 60 * 60 * 1000),
        destinatarioNombre: "Equipo Cobranza",
        creadoPor: "SISTEMA",
        datosAdicionales: { diasMora: 15, monto: 12500000 },
        etiquetas: ["cobranza", "mora"],
      },
    ];
  }

  // ═══════════════════════════════════════════════════════════════
  // OBTENCIÓN DE ALERTAS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene todas las alertas activas
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAlertasActivas(_usuarioId?: string): AlertaContrato[] {
    return this.alertas
      .filter((a) => a.estado === "activa")
      .sort((a, b) => {
        // Ordenar por prioridad primero
        const prioridadOrden = { urgente: 0, alta: 1, media: 2, baja: 3 };
        const diffPrioridad = prioridadOrden[a.prioridad] -
          prioridadOrden[b.prioridad];
        if (diffPrioridad !== 0) return diffPrioridad;
        // Luego por fecha
        return b.fechaCreacion.getTime() - a.fechaCreacion.getTime();
      });
  }

  /**
   * Obtiene alertas de un contrato específico
   */
  getAlertasContrato(contratoId: string): AlertaContrato[] {
    return this.alertas.filter((a) => a.contratoId === contratoId);
  }

  /**
   * Obtiene resumen de alertas
   */
  getResumen(): ResumenAlertas {
    const activas = this.alertas.filter((a) => a.estado === "activa");

    const porTipo: Record<string, number> = {};
    activas.forEach((a) => {
      porTipo[a.tipo] = (porTipo[a.tipo] || 0) + 1;
    });

    return {
      total: activas.length,
      urgentes: activas.filter((a) => a.prioridad === "urgente").length,
      sinLeer: activas.filter((a) => a.estado === "activa").length,
      porTipo: porTipo as Record<TipoAlerta, number>,
      tendencia: "estable",
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // ACCIONES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Marca alerta como leída
   */
  marcarLeida(alertaId: string): void {
    const alerta = this.alertas.find((a) => a.id === alertaId);
    if (alerta) {
      alerta.estado = "leida";
    }
  }

  /**
   * Resuelve una alerta
   */
  resolver(alertaId: string): void {
    const alerta = this.alertas.find((a) => a.id === alertaId);
    if (alerta) {
      alerta.estado = "resuelta";
      alerta.fechaResolucion = new Date();
    }
  }

  /**
   * Ignora una alerta
   */
  ignorar(alertaId: string): void {
    const alerta = this.alertas.find((a) => a.id === alertaId);
    if (alerta) {
      alerta.estado = "ignorada";
    }
  }

  /**
   * Escala una alerta
   */
  escalar(alertaId: string, nuevoDestinatario: string): void {
    const alerta = this.alertas.find((a) => a.id === alertaId);
    if (alerta) {
      alerta.estado = "escalada";
      alerta.destinatarioNombre = nuevoDestinatario;
      // En producción: enviar notificación al nuevo destinatario
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // GENERACIÓN AUTOMÁTICA
  // ═══════════════════════════════════════════════════════════════

  /**
   * Verifica contratos y genera alertas automáticas
   */
  async verificarYGenerarAlertas(): Promise<AlertaContrato[]> {
    const nuevasAlertas: AlertaContrato[] = [];

    // En producción: consultar BD para contratos próximos a vencer, etc.
    // Por ahora, simulamos el proceso

    logger.info(
      `Verificación de alertas ejecutada: ${new Date().toISOString()}`,
    );

    return nuevasAlertas;
  }

  /**
   * Crea alerta manual
   */
  crearAlerta(
    datos: Omit<AlertaContrato, "id" | "fechaCreacion" | "estado">,
  ): AlertaContrato {
    const alerta: AlertaContrato = {
      ...datos,
      id: `alerta-${Date.now()}`,
      fechaCreacion: new Date(),
      estado: "activa",
    };

    this.alertas.push(alerta);
    return alerta;
  }

  // ═══════════════════════════════════════════════════════════════
  // CONFIGURACIÓN
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene configuración de alertas
   */
  getConfiguracion(): ConfiguracionAlerta[] {
    return [...this.configuraciones];
  }

  /**
   * Actualiza configuración
   */
  actualizarConfiguracion(
    tipo: TipoAlerta,
    config: Partial<ConfiguracionAlerta>,
  ): void {
    const idx = this.configuraciones.findIndex((c) => c.tipo === tipo);
    if (idx !== -1) {
      this.configuraciones[idx] = { ...this.configuraciones[idx], ...config };
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

export const SmartAlerts = SmartAlertsEngine.getInstance();

export function useSmartAlerts() {
  return SmartAlerts;
}

// Helper para obtener info del tipo de alerta
export function getAlertaInfo(
  tipo: TipoAlerta,
): { emoji: string; label: string; color: string } {
  const info: Record<
    TipoAlerta,
    { emoji: string; label: string; color: string }
  > = {
    VENCIMIENTOS_PROXIMO: {
      emoji: "📅",
      label: "Vencimientos próximo",
      color: "bg-amber-100 text-amber-700",
    },
    RENOVACION_PENDIENTE: {
      emoji: "🔄",
      label: "Renovación pendiente",
      color: "bg-blue-100 text-blue-700",
    },
    APROBACION_REQUERIDA: {
      emoji: "✋",
      label: "Aprobación requerida",
      color: "bg-purple-100 text-purple-700",
    },
    DESCUENTO_EXCESIVO: {
      emoji: "💰",
      label: "Descuento excesivo",
      color: "bg-red-100 text-red-700",
    },
    PAGO_VENCIDO: {
      emoji: "💳",
      label: "Pago vencido",
      color: "bg-red-100 text-red-700",
    },
    DOCUMENTO_FALTANTE: {
      emoji: "📎",
      label: "Documento faltante",
      color: "bg-orange-100 text-orange-700",
    },
    FIRMA_PENDIENTE: {
      emoji: "✍️",
      label: "Firma pendiente",
      color: "bg-indigo-100 text-indigo-700",
    },
    ANOMALIA_DETECTADA: {
      emoji: "⚠️",
      label: "Anomalía detectada",
      color: "bg-red-100 text-red-700",
    },
    OPORTUNIDAD: {
      emoji: "🌟",
      label: "Oportunidad",
      color: "bg-green-100 text-green-700",
    },
    CUMPLIMIENTO: {
      emoji: "✅",
      label: "Cumplimiento",
      color: "bg-emerald-100 text-emerald-700",
    },
    SLA_RIESGO: {
      emoji: "⏱️",
      label: "SLA en riesgo",
      color: "bg-orange-100 text-orange-700",
    },
    INACTIVIDAD: {
      emoji: "💤",
      label: "Inactividad",
      color: "bg-slate-100 text-slate-700",
    },
  };
  return info[tipo];
}
