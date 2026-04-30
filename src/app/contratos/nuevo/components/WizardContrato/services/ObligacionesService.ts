/**
 * 📋 SILEXAR PULSE - Servicio de Obligaciones TIER 0
 *
 * @description Sistema de gestión de obligaciones contractuales
 * con extracción automática, tracking y alertas inteligentes.
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

import { logger } from "@/lib/observability";
import {
  AlertaInteligente,
  EstadoObligacion,
  FrecuenciaObligacion,
  ObligacionContrato,
  ResumenObligaciones,
  TipoObligacion,
} from "../types/enterprise.types";

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = "silexar_obligaciones";

const PLANTILLAS_OBLIGACIONES: {
  tipo: TipoObligacion;
  titulo: string;
  descripcionBase: string;
  frecuenciaDefault: FrecuenciaObligacion;
  diasAnticipacionDefault: number[];
}[] = [
  {
    tipo: "entrega_material",
    titulo: "Entrega de Material Creativo",
    descripcionBase: "El cliente debe entregar material creativo aprobado",
    frecuenciaDefault: "unico",
    diasAnticipacionDefault: [7, 3, 1],
  },
  {
    tipo: "pago",
    titulo: "Pago de Cuota",
    descripcionBase: "Pago según términos acordados",
    frecuenciaDefault: "mensual",
    diasAnticipacionDefault: [5, 2, 1],
  },
  {
    tipo: "reporte",
    titulo: "Entrega de Reporte de Campaña",
    descripcionBase: "Generar y entregar reporte de performance",
    frecuenciaDefault: "mensual",
    diasAnticipacionDefault: [3, 1],
  },
  {
    tipo: "entrega_pauta",
    titulo: "Ejecución de Pauta",
    descripcionBase: "Emisión de la pauta publicitaria contratada",
    frecuenciaDefault: "diario",
    diasAnticipacionDefault: [1],
  },
  {
    tipo: "facturacion",
    titulo: "Emisión de Factura",
    descripcionBase: "Generar y enviar factura al cliente",
    frecuenciaDefault: "mensual",
    diasAnticipacionDefault: [5, 2],
  },
  {
    tipo: "exclusividad",
    titulo: "Mantener Exclusividad",
    descripcionBase: "No contratar con competidores directos del cliente",
    frecuenciaDefault: "unico",
    diasAnticipacionDefault: [30, 15, 7],
  },
];

// ═══════════════════════════════════════════════════════════════
// ALMACENAMIENTO
// ═══════════════════════════════════════════════════════════════

function getStoredObligaciones(): ObligacionContrato[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored).map((o: ObligacionContrato) => ({
        ...o,
        fechaInicio: new Date(o.fechaInicio),
        fechaLimite: new Date(o.fechaLimite),
        fechaCompletada: o.fechaCompletada
          ? new Date(o.fechaCompletada)
          : undefined,
        fechaCreacion: new Date(o.fechaCreacion),
        ultimaModificacion: new Date(o.ultimaModificacion),
      }));
    }
  } catch {
    logger.error("[Obligaciones] Error reading stored data");
  }

  return [];
}

function storeObligaciones(obligaciones: ObligacionContrato[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obligaciones));
  } catch {
    logger.error("[Obligaciones] Error storing data");
  }
}

// ═══════════════════════════════════════════════════════════════
// CLASE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export class ObligacionesService {
  private static instance: ObligacionesService;
  private obligaciones: ObligacionContrato[] = [];

  private constructor() {
    this.obligaciones = getStoredObligaciones();
  }

  static getInstance(): ObligacionesService {
    if (!ObligacionesService.instance) {
      ObligacionesService.instance = new ObligacionesService();
    }
    return ObligacionesService.instance;
  }

  // ═══════════════════════════════════════════════════════════════
  // CRUD
  // ═══════════════════════════════════════════════════════════════

  /**
   * Crea una nueva obligación
   */
  crear(
    params: Omit<
      ObligacionContrato,
      | "id"
      | "estado"
      | "porcentajeCompletado"
      | "documentosAdjuntos"
      | "alertasEnviadas"
      | "creadoPor"
      | "fechaCreacion"
      | "ultimaModificacion"
      | "extraidaPorIA"
    >,
  ): ObligacionContrato {
    const obligacion: ObligacionContrato = {
      ...params,
      id: crypto.randomUUID(),
      estado: "pendiente",
      porcentajeCompletado: 0,
      documentosAdjuntos: [],
      alertasEnviadas: [],
      creadoPor: "usuario-actual", // TODO: usuario real
      fechaCreacion: new Date(),
      ultimaModificacion: new Date(),
      extraidaPorIA: false,
    };

    this.obligaciones.push(obligacion);
    this.persistir();

    return obligacion;
  }

  /**
   * Actualiza una obligación existente
   */
  actualizar(
    id: string,
    datos: Partial<ObligacionContrato>,
  ): ObligacionContrato | null {
    const index = this.obligaciones.findIndex((o) => o.id === id);
    if (index === -1) return null;

    this.obligaciones[index] = {
      ...this.obligaciones[index],
      ...datos,
      ultimaModificacion: new Date(),
    };

    this.persistir();
    return this.obligaciones[index];
  }

  /**
   * Elimina una obligación
   */
  eliminar(id: string): boolean {
    const index = this.obligaciones.findIndex((o) => o.id === id);
    if (index === -1) return false;

    this.obligaciones.splice(index, 1);
    this.persistir();
    return true;
  }

  /**
   * Obtiene obligación por ID
   */
  obtenerPorId(id: string): ObligacionContrato | null {
    return this.obligaciones.find((o) => o.id === id) || null;
  }

  /**
   * Obtiene todas las obligaciones de un contrato
   */
  obtenerPorContrato(contratoId: string): ObligacionContrato[] {
    return this.obligaciones
      .filter((o) => o.contratoId === contratoId)
      .sort((a, b) => a.fechaLimite.getTime() - b.fechaLimite.getTime());
  }

  // ═══════════════════════════════════════════════════════════════
  // EXTRACCIÓN AUTOMÁTICA (IA)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Extrae obligaciones automáticamente del contrato
   */
  async extraerDeContrato(contrato: {
    id: string;
    numeroContrato: string;
    fechaInicio: Date;
    fechaFin: Date;
    terminosPago: {
      diasPago: number;
      modalidad: string;
      numeroCuotas?: number;
    };
    valorNeto: number;
    esCanje: boolean;
    lineasEspecificacion: {
      medioNombre: string;
      fechaInicio: Date;
      fechaFin: Date;
    }[];
  }): Promise<ObligacionContrato[]> {
    const obligacionesExtraidas: ObligacionContrato[] = [];

    // 1. Obligaciones de pago
    if (
      contrato.terminosPago.modalidad === "cuotas" &&
      contrato.terminosPago.numeroCuotas
    ) {
      const valorCuota = contrato.valorNeto /
        contrato.terminosPago.numeroCuotas;

      for (let i = 0; i < contrato.terminosPago.numeroCuotas; i++) {
        const fechaVencimientos = new Date(contrato.fechaInicio);
        fechaVencimientos.setMonth(fechaVencimientos.getMonth() + i + 1);

        const obligacion = this.crearObligacionExtraida({
          contratoId: contrato.id,
          numeroContrato: contrato.numeroContrato,
          tipo: "pago",
          titulo: `Cuota ${i + 1} de ${contrato.terminosPago.numeroCuotas}`,
          descripcion: `Pago de cuota ${
            i + 1
          } por valor de $${valorCuota.toLocaleString()}`,
          clausulaOrigen: "Cláusula de Pagos",
          responsable: { tipo: "cliente" },
          fechaInicio: contrato.fechaInicio,
          fechaLimite: fechaVencimientos,
          frecuencia: "unico",
          diasAnticipacionAlerta: [5, 2, 1],
          penalizacion: {
            tipo: "interes_mora",
            porcentaje: 1.5,
            descripcion: "Interés por mora del 1.5% mensual",
          },
        });

        obligacionesExtraidas.push(obligacion);
      }
    }

    // 2. Obligación de entrega de material
    const obligacionMaterial = this.crearObligacionExtraida({
      contratoId: contrato.id,
      numeroContrato: contrato.numeroContrato,
      tipo: "entrega_material",
      titulo: "Entrega de Material Creativo",
      descripcion:
        "El cliente debe entregar todo el material creativo para la campaña",
      clausulaOrigen: "Cláusula de Materiales",
      responsable: { tipo: "cliente" },
      fechaInicio: new Date(),
      fechaLimite: new Date(
        contrato.fechaInicio.getTime() - 7 * 24 * 60 * 60 * 1000,
      ), // 7 días antes
      frecuencia: "unico",
      diasAnticipacionAlerta: [7, 3, 1],
    });
    obligacionesExtraidas.push(obligacionMaterial);

    // 3. Obligaciones de entrega de pauta por cada línea
    contrato.lineasEspecificacion.forEach((linea, index) => {
      const obligacionPauta = this.crearObligacionExtraida({
        contratoId: contrato.id,
        numeroContrato: contrato.numeroContrato,
        tipo: "entrega_pauta",
        titulo: `Ejecución Pauta: ${linea.medioNombre}`,
        descripcion: `Emisión de pauta en ${linea.medioNombre}`,
        clausulaOrigen: `Especificación Línea ${index + 1}`,
        responsable: { tipo: "empresa", departamento: "Operaciones" },
        fechaInicio: linea.fechaInicio,
        fechaLimite: linea.fechaFin,
        frecuencia: "diario",
        diasAnticipacionAlerta: [1],
      });
      obligacionesExtraidas.push(obligacionPauta);
    });

    // 4. Obligación de reporte mensual
    const mesesContrato = Math.ceil(
      (contrato.fechaFin.getTime() - contrato.fechaInicio.getTime()) /
        (30 * 24 * 60 * 60 * 1000),
    );

    for (let i = 1; i <= mesesContrato; i++) {
      const fechaReporte = new Date(contrato.fechaInicio);
      fechaReporte.setMonth(fechaReporte.getMonth() + i);
      fechaReporte.setDate(5); // Día 5 de cada mes

      const obligacionReporte = this.crearObligacionExtraida({
        contratoId: contrato.id,
        numeroContrato: contrato.numeroContrato,
        tipo: "reporte",
        titulo: `Reporte Mensual - Mes ${i}`,
        descripcion: "Entrega de reporte de performance de la campaña",
        clausulaOrigen: "Cláusula de Reportes",
        responsable: { tipo: "empresa", departamento: "Analytics" },
        fechaInicio: contrato.fechaInicio,
        fechaLimite: fechaReporte,
        frecuencia: "unico",
        diasAnticipacionAlerta: [3, 1],
      });
      obligacionesExtraidas.push(obligacionReporte);
    }

    // 5. Obligación de facturación
    const obligacionFactura = this.crearObligacionExtraida({
      contratoId: contrato.id,
      numeroContrato: contrato.numeroContrato,
      tipo: "facturacion",
      titulo: "Emisión de Factura",
      descripcion: "Generar y enviar factura al cliente",
      clausulaOrigen: "Cláusula de Facturación",
      responsable: { tipo: "empresa", departamento: "Finanzas" },
      fechaInicio: contrato.fechaInicio,
      fechaLimite: new Date(
        contrato.fechaInicio.getTime() + 5 * 24 * 60 * 60 * 1000,
      ),
      frecuencia: "unico",
      diasAnticipacionAlerta: [2, 1],
    });
    obligacionesExtraidas.push(obligacionFactura);

    return obligacionesExtraidas;
  }

  private crearObligacionExtraida(
    params: Omit<
      ObligacionContrato,
      | "id"
      | "estado"
      | "porcentajeCompletado"
      | "documentosAdjuntos"
      | "alertasEnviadas"
      | "creadoPor"
      | "fechaCreacion"
      | "ultimaModificacion"
      | "extraidaPorIA"
      | "confianzaExtraccion"
    >,
  ): ObligacionContrato {
    const obligacion: ObligacionContrato = {
      ...params,
      id: crypto.randomUUID(),
      estado: "pendiente",
      porcentajeCompletado: 0,
      documentosAdjuntos: [],
      alertasEnviadas: [],
      creadoPor: "sistema-ia",
      fechaCreacion: new Date(),
      ultimaModificacion: new Date(),
      extraidaPorIA: true,
      confianzaExtraccion: 95,
    };

    this.obligaciones.push(obligacion);
    this.persistir();

    return obligacion;
  }

  // ═══════════════════════════════════════════════════════════════
  // TRACKING Y ESTADO
  // ═══════════════════════════════════════════════════════════════

  /**
   * Marca obligación como completada
   */
  marcarCompletada(
    id: string,
    evidencia?: { nombre: string; url: string; tipo: string },
  ): ObligacionContrato | null {
    const obligacion = this.obtenerPorId(id);
    if (!obligacion) return null;

    const actualizacion: Partial<ObligacionContrato> = {
      estado: "completada",
      porcentajeCompletado: 100,
      fechaCompletada: new Date(),
      completadoPor: "usuario-actual", // TODO: usuario real
    };

    if (evidencia) {
      actualizacion.documentosAdjuntos = [
        ...obligacion.documentosAdjuntos,
        { ...evidencia, id: crypto.randomUUID(), fechaSubida: new Date() },
      ];
    }

    return this.actualizar(id, actualizacion);
  }

  /**
   * Actualiza progreso de obligación
   */
  actualizarProgreso(
    id: string,
    porcentaje: number,
  ): ObligacionContrato | null {
    const estado: EstadoObligacion = porcentaje >= 100
      ? "completada"
      : porcentaje > 0
      ? "en_progreso"
      : "pendiente";

    return this.actualizar(id, {
      porcentajeCompletado: Math.min(100, Math.max(0, porcentaje)),
      estado,
      fechaCompletada: estado === "completada" ? new Date() : undefined,
    });
  }

  /**
   * Verifica y actualiza estados vencidos
   */
  verificarVencimientos(): ObligacionContrato[] {
    const ahora = new Date();
    const actualizadas: ObligacionContrato[] = [];

    this.obligaciones.forEach((o) => {
      if (o.estado === "pendiente" || o.estado === "en_progreso") {
        if (o.fechaLimite < ahora) {
          this.actualizar(o.id, { estado: "vencida" });
          actualizadas.push(o);
        }
      }
    });

    return actualizadas;
  }

  // ═══════════════════════════════════════════════════════════════
  // ALERTAS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene alertas pendientes de enviar
   */
  obtenerAlertasPendientes(): AlertaInteligente[] {
    const ahora = new Date();
    const alertas: AlertaInteligente[] = [];

    this.obligaciones.forEach((o) => {
      if (o.estado === "pendiente" || o.estado === "en_progreso") {
        const diasRestantes = Math.ceil(
          (o.fechaLimite.getTime() - ahora.getTime()) / (24 * 60 * 60 * 1000),
        );

        // Verificar si hay alerta pendiente para estos días
        if (o.diasAnticipacionAlerta.includes(diasRestantes)) {
          const yaEnviada = o.alertasEnviadas.some((a) => {
            const diasAlEnviar = Math.ceil(
              (o.fechaLimite.getTime() - a.fecha.getTime()) /
                (24 * 60 * 60 * 1000),
            );
            return diasAlEnviar === diasRestantes;
          });

          if (!yaEnviada) {
            alertas.push({
              id: crypto.randomUUID(),
              tipo: "vencimientos_obligacion",
              titulo: `Obligación próxima a vencer: ${o.titulo}`,
              descripcion:
                `Quedan ${diasRestantes} día(s) para cumplir con: ${o.descripcion}`,
              urgencia: diasRestantes <= 1
                ? "critica"
                : diasRestantes <= 3
                ? "alta"
                : "media",
              fechaGeneracion: new Date(),
              contratoId: o.contratoId,
              accionSugerida: "Revisar estado y completar obligación",
              accionUrl: `/contratos/${o.contratoId}/obligaciones/${o.id}`,
              leida: false,
              descartada: false,
            });
          }
        }

        // Alertas de obligaciones ya vencidas (estado aún no actualizado)
        // Nota: En este punto o.estado es 'pendiente' o 'en_progreso' (filtrado en línea 429)
        // pero el tiempo ya venció, lo que indica que el estado no se ha actualizado aún
        if (diasRestantes < 0) {
          alertas.push({
            id: crypto.randomUUID(),
            tipo: "vencimientos_obligacion",
            titulo: `⚠️ Obligación VENCIDA: ${o.titulo}`,
            descripcion: `La obligación venció hace ${
              Math.abs(diasRestantes)
            } día(s)`,
            urgencia: "critica",
            fechaGeneracion: new Date(),
            contratoId: o.contratoId,
            accionSugerida: "Tomar acción urgente",
            accionUrl: `/contratos/${o.contratoId}/obligaciones/${o.id}`,
            leida: false,
            descartada: false,
          });
        }
      }
    });

    return alertas;
  }

  /**
   * Registra envío de alerta
   */
  registrarAlertaEnviada(
    obligacionId: string,
    canal: "email" | "push" | "sms" | "whatsapp",
    destinatario: string,
  ): void {
    const obligacion = this.obtenerPorId(obligacionId);
    if (!obligacion) return;

    this.actualizar(obligacionId, {
      alertasEnviadas: [
        ...obligacion.alertasEnviadas,
        {
          fecha: new Date(),
          canal,
          destinatario,
          leida: false,
        },
      ],
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // RESUMEN Y ANALYTICS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene resumen general de obligaciones
   */
  obtenerResumen(contratoId?: string): ResumenObligaciones {
    const obligaciones = contratoId
      ? this.obtenerPorContrato(contratoId)
      : this.obligaciones;

    const ahora = new Date();
    const porEstado: Record<EstadoObligacion, number> = {
      pendiente: 0,
      en_progreso: 0,
      completada: 0,
      vencida: 0,
      incumplida: 0,
      dispensada: 0,
      en_disputa: 0,
    };

    let vencidasHoy = 0;
    let proximasVencer = 0;
    const obligacionesCriticas: ObligacionContrato[] = [];

    obligaciones.forEach((o) => {
      porEstado[o.estado]++;

      const diasRestantes = Math.ceil(
        (o.fechaLimite.getTime() - ahora.getTime()) / (24 * 60 * 60 * 1000),
      );

      if (diasRestantes === 0 && o.estado !== "completada") {
        vencidasHoy++;
        obligacionesCriticas.push(o);
      } else if (
        diasRestantes > 0 && diasRestantes <= 7 && o.estado !== "completada"
      ) {
        proximasVencer++;
        if (diasRestantes <= 3) {
          obligacionesCriticas.push(o);
        }
      }
    });

    const completadas = porEstado.completada;
    const total = obligaciones.length;
    const cumplimientoPorcentaje = total > 0
      ? (completadas / total) * 100
      : 100;

    return {
      total,
      porEstado,
      vencidasHoy,
      proximasVencer,
      cumplimientoPorcentaje,
      obligacionesCriticas: obligacionesCriticas.sort((a, b) =>
        a.fechaLimite.getTime() - b.fechaLimite.getTime()
      ),
    };
  }

  /**
   * Obtiene plantillas disponibles
   */
  obtenerPlantillas(): typeof PLANTILLAS_OBLIGACIONES {
    return PLANTILLAS_OBLIGACIONES;
  }

  // ═══════════════════════════════════════════════════════════════
  // PERSISTENCIA
  // ═══════════════════════════════════════════════════════════════

  private persistir(): void {
    storeObligaciones(this.obligaciones);
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOK PARA USO EN COMPONENTES
// ═══════════════════════════════════════════════════════════════

export function useObligaciones(contratoId?: string) {
  const service = ObligacionesService.getInstance();

  return {
    // CRUD
    crear: service.crear.bind(service),
    actualizar: service.actualizar.bind(service),
    eliminar: service.eliminar.bind(service),
    obtenerPorId: service.obtenerPorId.bind(service),
    obtenerPorContrato: contratoId
      ? () => service.obtenerPorContrato(contratoId)
      : service.obtenerPorContrato.bind(service),

    // Extracción IA
    extraerDeContrato: service.extraerDeContrato.bind(service),

    // Tracking
    marcarCompletada: service.marcarCompletada.bind(service),
    actualizarProgreso: service.actualizarProgreso.bind(service),
    verificarVencimientos: service.verificarVencimientos.bind(service),

    // Alertas
    obtenerAlertasPendientes: service.obtenerAlertasPendientes.bind(service),
    registrarAlertaEnviada: service.registrarAlertaEnviada.bind(service),

    // Analytics
    obtenerResumen: () => service.obtenerResumen(contratoId),
    obtenerPlantillas: service.obtenerPlantillas.bind(service),
  };
}

export default ObligacionesService;
