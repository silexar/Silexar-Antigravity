import { logger } from "@/lib/observability";
/**
 * 📱 SILEXAR PULSE - WhatsApp Business Integration Service TIER 0
 *
 * @description Procesamiento automático de órdenes por WhatsApp,
 * parser inteligente de mensajes y flujo automatizado.
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface MensajeWhatsApp {
  id: string;
  from: string;
  fromNombre?: string;
  timestamp: Date;
  tipo: "texto" | "imagen" | "documento" | "audio" | "video";
  contenido: string;
  mediaUrl?: string;
  contexto?: {
    esRespuesta: boolean;
    mensajeOriginalId?: string;
  };
}

export interface DatosExtraidos {
  confianza: number;
  cliente?: {
    nombre: string;
    identificador?: string;
    telefono: string;
    email?: string;
    existeEnBD: boolean;
    idExistente?: string;
  };
  producto?: {
    descripcion: string;
    tipo?: string;
    duracion?: string;
  };
  fechas?: {
    inicio?: string;
    fin?: string;
    duracionDias?: number;
  };
  valores?: {
    mencionado?: number;
    moneda?: string;
  };
  medios?: string[];
  urgencia?: "alta" | "normal" | "baja";
  camposFaltantes: string[];
  inconsistencias: string[];
  sugerencias: string[];
}

export interface BorradorContrato {
  id: string;
  origenMensajeId: string;
  telefonoOrigen: string;
  datosExtraidos: DatosExtraidos;
  estado:
    | "PENDIENTE_VALIDACION"
    | "VALIDADO"
    | "ENVIADO"
    | "ACEPTADO"
    | "RECHAZADO";
  ejecutivoAsignado?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface RespuestaAutomatica {
  tipo: "confirmacion" | "solicitud_info" | "propuesta" | "error";
  mensaje: string;
  botonesRapidos?: { id: string; texto: string }[];
}

// ═══════════════════════════════════════════════════════════════
// PARSER INTELIGENTE
// ═══════════════════════════════════════════════════════════════

const patrones = {
  cliente:
    /(?:para|cliente|anunciante|empresa)[:\s]+([A-Za-zÀ-ÿ\s]+?)(?:\.|,|$)/i,
  producto:
    /(?:campaña|pauta|producto|spots?)[:\s]+([A-Za-zÀ-ÿ0-9\s]+?)(?:\.|,|$)/i,
  fechas:
    /(?:del?\s*)?(\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\s*(?:al?|hasta|-)?\s*(\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)?/i,
  valor: /\$\s*([\d.,]+)(?:\s*(mil|k|millones?|m|MM))?/i,
  medios:
    /(radio|tv|televisión|digital|redes|facebook|instagram|youtube|via\s*pública|pantallas?)/gi,
  duracion: /(\d+)\s*(segundos?|seg|s|minutos?|min)/i,
  urgencia: /(urgente|asap|hoy|mañana|esta\s*semana|lo\s*antes\s*posible)/i,
};

// ═══════════════════════════════════════════════════════════════
// SERVICIO
// ═══════════════════════════════════════════════════════════════

class WhatsAppIntegrationServiceClass {
  private static instance: WhatsAppIntegrationServiceClass;
  private borradores: Map<string, BorradorContrato> = new Map();
  private ejecutivosAsignados: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): WhatsAppIntegrationServiceClass {
    if (!this.instance) {
      this.instance = new WhatsAppIntegrationServiceClass();
    }
    return this.instance;
  }

  // ═══════════════════════════════════════════════════════════════
  // PROCESAMIENTO DE MENSAJES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Procesa un mensaje entrante de WhatsApp
   */
  async procesarMensaje(mensaje: MensajeWhatsApp): Promise<{
    borrador: BorradorContrato;
    respuesta: RespuestaAutomatica;
  }> {
    // Extraer datos del mensaje
    const datosExtraidos = await this.extraerDatos(mensaje);

    // Crear borrador
    const borrador = await this.crearBorrador(mensaje, datosExtraidos);

    // Asignar ejecutivo
    await this.asignarEjecutivo(borrador);

    // Generar respuesta automática
    const respuesta = this.generarRespuesta(datosExtraidos);

    return { borrador, respuesta };
  }

  /**
   * Extrae datos estructurados del mensaje usando NLP
   */
  async extraerDatos(mensaje: MensajeWhatsApp): Promise<DatosExtraidos> {
    const texto = mensaje.contenido;
    const camposFaltantes: string[] = [];
    const inconsistencias: string[] = [];
    const sugerencias: string[] = [];
    let confianza = 100;

    // Extraer cliente
    const matchCliente = texto.match(patrones.cliente);
    const clienteNombre = matchCliente ? matchCliente[1].trim() : undefined;
    if (!clienteNombre) {
      camposFaltantes.push("Nombre del cliente");
      confianza -= 20;
    }

    // Verificar si cliente existe en BD (simulado)
    const clienteExiste = clienteNombre
      ? await this.verificarCliente(clienteNombre, mensaje.from)
      : false;

    // Extraer producto
    const matchProducto = texto.match(patrones.producto);
    const productoDesc = matchProducto ? matchProducto[1].trim() : undefined;
    if (!productoDesc) {
      camposFaltantes.push("Descripción del producto/campaña");
      confianza -= 15;
    }

    // Extraer fechas
    const matchFechas = texto.match(patrones.fechas);
    let fechaInicio: string | undefined;
    let fechaFin: string | undefined;
    if (matchFechas) {
      fechaInicio = matchFechas[1];
      fechaFin = matchFechas[2];
    } else {
      camposFaltantes.push("Fechas de campaña");
      confianza -= 15;
    }

    // Extraer valor
    const matchValor = texto.match(patrones.valor);
    let valorMencionado: number | undefined;
    if (matchValor) {
      let num = parseFloat(matchValor[1].replace(/[.,]/g, ""));
      const multiplicador = matchValor[2]?.toLowerCase();
      if (multiplicador === "mil" || multiplicador === "k") num *= 1000;
      if (
        multiplicador === "millones" || multiplicador === "m" ||
        multiplicador === "mm"
      ) num *= 1000000;
      valorMencionado = num;
    } else {
      sugerencias.push("Confirmar valor del contrato con el cliente");
    }

    // Extraer medios
    const matchMedios = texto.match(patrones.medios);
    const medios = matchMedios
      ? [...new Set(matchMedios.map((m) => m.toLowerCase()))]
      : [];
    if (medios.length === 0) {
      camposFaltantes.push("Medios/canales de la campaña");
      confianza -= 10;
    }

    // Detectar urgencia
    const matchUrgencia = texto.match(patrones.urgencia);
    const urgencia: "alta" | "normal" | "baja" = matchUrgencia
      ? "alta"
      : "normal";
    if (urgencia === "alta") {
      sugerencias.push("⚠️ Cliente indica urgencia - priorizar respuesta");
    }

    // Validaciones cruzadas
    if (fechaInicio && fechaFin) {
      // Validar que fecha fin sea posterior a inicio
      // Simplificado para demo
    }

    return {
      confianza: Math.max(0, confianza),
      cliente: clienteNombre
        ? {
          nombre: clienteNombre,
          telefono: mensaje.from,
          existeEnBD: clienteExiste,
          idExistente: clienteExiste ? "cli-001" : undefined,
        }
        : undefined,
      producto: productoDesc
        ? {
          descripcion: productoDesc,
        }
        : undefined,
      fechas: (fechaInicio || fechaFin)
        ? { inicio: fechaInicio, fin: fechaFin }
        : undefined,
      valores: valorMencionado
        ? { mencionado: valorMencionado, moneda: "CLP" }
        : undefined,
      medios,
      urgencia,
      camposFaltantes,
      inconsistencias,
      sugerencias,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async verificarCliente(
    _nombre: string,
    _telefono: string,
  ): Promise<boolean> {
    // Simulación de verificación en BD
    await new Promise((resolve) => setTimeout(resolve, 100));
    return Math.random() > 0.3; // 70% probabilidad de que exista
  }

  // ═══════════════════════════════════════════════════════════════
  // GESTIÓN DE BORRADORES
  // ═══════════════════════════════════════════════════════════════

  private async crearBorrador(
    mensaje: MensajeWhatsApp,
    datos: DatosExtraidos,
  ): Promise<BorradorContrato> {
    const borrador: BorradorContrato = {
      id: `bor-wa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      origenMensajeId: mensaje.id,
      telefonoOrigen: mensaje.from,
      datosExtraidos: datos,
      estado: "PENDIENTE_VALIDACION",
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    };

    this.borradores.set(borrador.id, borrador);
    return borrador;
  }

  private async asignarEjecutivo(borrador: BorradorContrato): Promise<void> {
    // Buscar ejecutivo previamente asignado a este número
    let ejecutivo = this.ejecutivosAsignados.get(borrador.telefonoOrigen);

    if (!ejecutivo) {
      // Asignar por round-robin o carga de trabajo (simulado)
      ejecutivo = "ej-001";
      this.ejecutivosAsignados.set(borrador.telefonoOrigen, ejecutivo);
    }

    borrador.ejecutivoAsignado = ejecutivo;

    // Notificar al ejecutivo (en producción: push notification, email, SMS)
    await this.notificarEjecutivo(ejecutivo, borrador);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async notificarEjecutivo(
    _ejecutivoId: string,
    _borrador: BorradorContrato,
  ): Promise<void> {
    // Simulación de notificación
    logger.info("Notificación enviada al ejecutivo");
  }

  // ═══════════════════════════════════════════════════════════════
  // GENERACIÓN DE RESPUESTAS
  // ═══════════════════════════════════════════════════════════════

  private generarRespuesta(datos: DatosExtraidos): RespuestaAutomatica {
    if (datos.camposFaltantes.length > 3) {
      return {
        tipo: "solicitud_info",
        mensaje:
          `¡Gracias por contactarnos! 📋\n\nPara procesar su solicitud necesitamos algunos datos adicionales:\n\n${
            datos.camposFaltantes.map((c) => `• ${c}`).join("\n")
          }\n\nPor favor envíe la información para continuar.`,
        botonesRapidos: [
          { id: "llamar", texto: "📞 Prefiero que me llamen" },
          { id: "email", texto: "📧 Enviar por email" },
        ],
      };
    }

    if (datos.confianza >= 70) {
      const resumen = [];
      if (datos.cliente) resumen.push(`• Cliente: ${datos.cliente.nombre}`);
      if (datos.producto) {
        resumen.push(`• Campaña: ${datos.producto.descripcion}`);
      }
      if (datos.fechas) {
        resumen.push(
          `• Período: ${datos.fechas.inicio || "?"} - ${
            datos.fechas.fin || "?"
          }`,
        );
      }
      if (datos.valores) {
        resumen.push(`• Valor: $${datos.valores.mencionado?.toLocaleString()}`);
      }
      if (datos.medios?.length) {
        resumen.push(`• Medios: ${datos.medios.join(", ")}`);
      }

      return {
        tipo: "confirmacion",
        mensaje:
          `¡Recibido! ✅\n\nHemos capturado la siguiente información:\n\n${
            resumen.join("\n")
          }\n\nUn ejecutivo revisará los detalles y le enviará una propuesta formal en breve.${
            datos.urgencia === "alta"
              ? "\n\n⚡ Hemos marcado esto como URGENTE."
              : ""
          }`,
        botonesRapidos: [
          { id: "correcto", texto: "✅ Correcto" },
          { id: "corregir", texto: "✏️ Corregir datos" },
          { id: "agregar", texto: "➕ Agregar info" },
        ],
      };
    }

    return {
      tipo: "solicitud_info",
      mensaje:
        `¡Gracias por su mensaje! 📋\n\nNecesitamos confirmar algunos datos:\n\n${
          datos.camposFaltantes.map((c) => `❓ ${c}`).join("\n")
        }\n\n¿Puede proporcionar esta información?`,
      botonesRapidos: [
        { id: "enviar", texto: "📝 Enviar datos" },
        { id: "llamar", texto: "📞 Llamarme" },
      ],
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // ACCIONES DEL EJECUTIVO
  // ═══════════════════════════════════════════════════════════════

  /**
   * Ejecutivo valida y ajusta el borrador
   */
  async validarBorrador(
    borradorId: string,
    ajustes: Partial<DatosExtraidos>,
  ): Promise<BorradorContrato> {
    const borrador = this.borradores.get(borradorId);
    if (!borrador) throw new Error("Borrador no encontrado");

    borrador.datosExtraidos = { ...borrador.datosExtraidos, ...ajustes };
    borrador.estado = "VALIDADO";
    borrador.fechaActualizacion = new Date();

    return borrador;
  }

  /**
   * Envía propuesta de vuelta por WhatsApp
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async enviarPropuesta(borradorId: string, _propuesta: {
    mensaje: string;
    adjuntoUrl?: string;
  }): Promise<{ exito: boolean; mensajeId: string }> {
    const borrador = this.borradores.get(borradorId);
    if (!borrador) throw new Error("Borrador no encontrado");

    // Simular envío
    await new Promise((resolve) => setTimeout(resolve, 500));

    borrador.estado = "ENVIADO";
    borrador.fechaActualizacion = new Date();

    return {
      exito: true,
      mensajeId: `wa-out-${Date.now()}`,
    };
  }

  /**
   * Obtiene borradores pendientes para un ejecutivo
   */
  getBorradoresPendientes(ejecutivoId: string): BorradorContrato[] {
    return Array.from(this.borradores.values())
      .filter((b) =>
        b.ejecutivoAsignado === ejecutivoId &&
        b.estado === "PENDIENTE_VALIDACION"
      )
      .sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime());
  }

  /**
   * Estadísticas de procesamiento
   */
  getEstadisticas(): {
    procesadosHoy: number;
    pendientesValidacion: number;
    tasaConversion: number;
    tiempoPromedioRespuesta: number;
  } {
    const borradores = Array.from(this.borradores.values());
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return {
      procesadosHoy: borradores.filter((b) => b.fechaCreacion >= hoy).length,
      pendientesValidacion:
        borradores.filter((b) => b.estado === "PENDIENTE_VALIDACION").length,
      tasaConversion: 72, // Simulado
      tiempoPromedioRespuesta: 5.3, // minutos
    };
  }
}

export const WhatsAppIntegrationService = WhatsAppIntegrationServiceClass
  .getInstance();

// Hook para uso en componentes React
export function useWhatsAppIntegration() {
  return WhatsAppIntegrationService;
}
