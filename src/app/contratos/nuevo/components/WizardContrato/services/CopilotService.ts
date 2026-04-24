/**
 * 🤖 SILEXAR PULSE - Servicio Copilot TIER 0
 *
 * @description Asistente conversacional inteligente para contratos
 * con procesamiento de lenguaje natural y sugerencias contextuales.
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

import {
  AccionCopilot,
  ContextoCopilot,
  IntentoCopilot,
  MensajeCopilot,
  SugerenciaCopilot,
} from "../types/enterprise.types";
import { WizardContratoState } from "../types/wizard.types";

// ═══════════════════════════════════════════════════════════════
// PATRONES DE INTENCIÓN
// ═══════════════════════════════════════════════════════════════

const PATRONES_INTENCION: { patron: RegExp; intento: IntentoCopilot }[] = [
  { patron: /crear|nuevo|generar.*contrato/i, intento: "crear_contrato" },
  { patron: /buscar|encontrar|mostrar.*contrato/i, intento: "buscar_contrato" },
  {
    patron: /modificar|cambiar|editar.*contrato/i,
    intento: "modificar_contrato",
  },
  { patron: /aprobar|autorizar/i, intento: "aprobar_contrato" },
  { patron: /clausula|agregar.*clausula/i, intento: "generar_clausula" },
  { patron: /riesgo|analizar.*riesgo|score/i, intento: "analizar_riesgo" },
  { patron: /terminos|condiciones|pago/i, intento: "sugerir_terminos" },
  { patron: /comparar|diferencia/i, intento: "comparar_contratos" },
  { patron: /resumen|resumir/i, intento: "resumir_contrato" },
  {
    patron: /\?|cómo|qué|cuándo|dónde|por qué|cuál/i,
    intento: "responder_pregunta",
  },
];

// ═══════════════════════════════════════════════════════════════
// RESPUESTAS PREDEFINIDAS
// ═══════════════════════════════════════════════════════════════

const RESPUESTAS_CONTEXTUALES: Record<string, string[]> = {
  saludo: [
    "¡Hola! Soy el Copilot de Contratos. ¿En qué puedo ayudarte hoy?",
    "¡Bienvenido! Estoy aquí para asistirte con la gestión de contratos. ¿Qué necesitas?",
  ],
  crear_contrato: [
    "Perfecto, vamos a crear un nuevo contrato. ¿Para qué cliente será?",
    "Entendido. Para crear el contrato necesito saber: ¿Quién es el anunciante y qué tipo de campaña será?",
  ],
  sugerencia_descuento: [
    "Basándome en el historial del cliente, sugiero un descuento del {descuento}%. Este cliente ha mantenido un excelente historial de pagos.",
    "Para este cliente, el descuento máximo recomendado es {descuento}% según su score de riesgo de {score}.",
  ],
  alerta_riesgo: [
    "⚠️ Atención: Este cliente tiene un score de riesgo de {score}. Recomiendo revisar los términos de pago.",
    "⚠️ El análisis Cortex-Risk indica nivel {nivel}. Sugiero reducir los días de pago a {dias} días.",
  ],
  confirmacion: [
    "✅ Perfecto, he registrado esa información.",
    "✅ Entendido. ¿Hay algo más que necesites configurar?",
  ],
};

// ═══════════════════════════════════════════════════════════════
// CLASE PRINCIPAL DEL COPILOT
// ═══════════════════════════════════════════════════════════════

export class CopilotService {
  private static instance: CopilotService;
  private contexto: ContextoCopilot;

  private constructor() {
    this.contexto = {
      historialConversacion: [],
      preferenciasUsuario: {},
      ultimasAcciones: [],
    };
  }

  static getInstance(): CopilotService {
    if (!CopilotService.instance) {
      CopilotService.instance = new CopilotService();
    }
    return CopilotService.instance;
  }

  // ═══════════════════════════════════════════════════════════════
  // PROCESAMIENTO DE MENSAJES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Procesa un mensaje del usuario y genera respuesta
   */
  async procesarMensaje(
    mensaje: string,
    estadoWizard?: WizardContratoState,
  ): Promise<MensajeCopilot> {
    const inicio = Date.now();

    // Crear mensaje del usuario
    const mensajeUsuario: MensajeCopilot = {
      id: crypto.randomUUID(),
      rol: "usuario",
      contenido: mensaje,
      timestamp: new Date(),
    };
    this.contexto.historialConversacion.push(mensajeUsuario);

    // Detectar intención
    const intento = this.detectarIntencion(mensaje);

    // Extraer entidades
    const entidades = this.extraerEntidades(mensaje);

    // Generar respuesta según contexto
    const respuesta = await this.generarRespuesta(
      mensaje,
      intento,
      entidades,
      estadoWizard,
    );

    // Crear mensaje de respuesta
    const mensajeRespuesta: MensajeCopilot = {
      id: crypto.randomUUID(),
      rol: "asistente",
      contenido: respuesta.texto,
      timestamp: new Date(),
      intento,
      entidades,
      acciones: respuesta.acciones,
      contratosRelacionados: respuesta.contratosRelacionados,
      tiempoRespuesta: Date.now() - inicio,
    };

    this.contexto.historialConversacion.push(mensajeRespuesta);

    return mensajeRespuesta;
  }

  /**
   * Detecta la intención del usuario
   */
  private detectarIntencion(mensaje: string): IntentoCopilot {
    for (const { patron, intento } of PATRONES_INTENCION) {
      if (patron.test(mensaje)) {
        return intento;
      }
    }
    return "otro";
  }

  /**
   * Extrae entidades del mensaje
   */
  private extraerEntidades(mensaje: string): MensajeCopilot["entidades"] {
    const entidades: MensajeCopilot["entidades"] = [];

    // Detectar montos
    const montoMatch = mensaje.match(
      /\$?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(millones?|M)?/i,
    );
    if (montoMatch) {
      let monto = parseFloat(
        montoMatch[1].replace(/\./g, "").replace(",", "."),
      );
      if (montoMatch[2]) monto *= 1000000;
      entidades.push({
        tipo: "monto",
        valor: monto.toString(),
        confianza: 0.9,
      });
    }

    // Detectar porcentajes
    const porcentajeMatch = mensaje.match(/(\d+(?:[.,]\d+)?)\s*%/);
    if (porcentajeMatch) {
      entidades.push({
        tipo: "porcentaje",
        valor: porcentajeMatch[1].replace(",", "."),
        confianza: 0.95,
      });
    }

    // Detectar fechas relativas
    if (
      /hoy|mañana|próxima semana|próximo mes|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre/i
        .test(mensaje)
    ) {
      entidades.push({ tipo: "fecha", valor: "detectada", confianza: 0.7 });
    }

    // Detectar tipos de medio
    const medios = [
      "radio",
      "tv",
      "televisión",
      "digital",
      "prensa",
      "exterior",
    ];
    medios.forEach((medio) => {
      if (mensaje.toLowerCase().includes(medio)) {
        entidades.push({ tipo: "medio", valor: medio, confianza: 0.95 });
      }
    });

    return entidades;
  }

  /**
   * Genera respuesta basada en contexto
   */
  private async generarRespuesta(
    mensaje: string,
    intento: IntentoCopilot,
    entidades: MensajeCopilot["entidades"],
    estadoWizard?: WizardContratoState,
  ): Promise<{
    texto: string;
    acciones?: AccionCopilot[];
    contratosRelacionados?: string[];
  }> {
    switch (intento) {
      case "crear_contrato":
        return {
          texto: this.getRespuesta("crear_contrato"),
          acciones: [{
            tipo: "navegar",
            titulo: "Ir al Wizard de Contratos",
            descripcion: "Abrir el formulario de nuevo contrato",
            url: "/contratos/nuevo",
            requiereConfirmacion: false,
          }],
        };

      case "analizar_riesgo":
        if (estadoWizard?.anunciante) {
          const score = estadoWizard.anunciante.scoreRiesgo;
          const nivel = estadoWizard.anunciante.nivelRiesgo;
          return {
            texto: this.getRespuesta("alerta_riesgo")
              .replace("{score}", score.toString())
              .replace("{nivel}", nivel)
              .replace(
                "{dias}",
                estadoWizard.anunciante.terminosPreferenciales.diasPago
                  .toString(),
              ),
            acciones: [{
              tipo: "modificar",
              titulo: "Ajustar Términos de Pago",
              descripcion:
                `Cambiar a ${estadoWizard.anunciante.terminosPreferenciales.diasPago} días`,
              requiereConfirmacion: true,
            }],
          };
        }
        return {
          texto:
            "Para analizar el riesgo, primero necesito que selecciones un anunciante.",
        };

      case "sugerir_terminos":
        return await this.sugerirTerminos(estadoWizard);

      case "generar_clausula":
        return {
          texto:
            "¿Qué tipo de cláusula necesitas? Puedo sugerirte:\n\n• Cláusula de exclusividad\n• Cláusula de confidencialidad\n• Cláusula de penalización\n• Cláusula de renovación automática",
          acciones: [
            {
              tipo: "generar",
              titulo: "Exclusividad",
              descripcion: "Agregar cláusula de exclusividad",
              requiereConfirmacion: true,
            },
            {
              tipo: "generar",
              titulo: "Confidencialidad",
              descripcion: "Agregar cláusula NDA",
              requiereConfirmacion: true,
            },
          ],
        };

      case "resumir_contrato":
        if (estadoWizard) {
          return {
            texto: this.generarResumenContrato(estadoWizard),
          };
        }
        return { texto: "No hay un contrato activo para resumir." };

      case "responder_pregunta":
        return this.responderPregunta(mensaje, estadoWizard);

      default:
        return {
          texto: this.getRespuesta("saludo"),
        };
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SUGERENCIAS INTELIGENTES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Genera sugerencias para el paso actual del wizard
   */
  getSugerenciasContextuales(
    estadoWizard: WizardContratoState,
  ): SugerenciaCopilot[] {
    const sugerencias: SugerenciaCopilot[] = [];

    // Sugerencias según el paso actual
    switch (estadoWizard.currentStep) {
      case 1:
        // Sugerencias de tipo de contrato
        if (!estadoWizard.anunciante && estadoWizard.tipoContrato === "nuevo") {
          sugerencias.push({
            tipo: "cliente",
            valor: "Seleccionar cliente frecuente",
            razonamiento:
              "Los clientes frecuentes tienen mejores condiciones preferenciales",
            confianza: 0.8,
            basadoEn: ["historial_contratos"],
            aplicar: () => {},
          });
        }
        break;

      case 2:
        // Sugerencias de descuento
        if (estadoWizard.anunciante) {
          const descuentoMax =
            estadoWizard.anunciante.terminosPreferenciales.descuentoMaximo;
          if (estadoWizard.descuentoPorcentaje === 0) {
            sugerencias.push({
              tipo: "descuento",
              valor: Math.floor(descuentoMax * 0.7),
              razonamiento:
                `Cliente con score ${estadoWizard.anunciante.scoreRiesgo}. Descuento óptimo para mantener rentabilidad.`,
              confianza: 0.85,
              basadoEn: ["score_riesgo", "historial_pagos"],
              aplicar: () => {},
            });
          }
        }

        // Sugerencias de términos de pago
        if (
          estadoWizard.anunciante &&
          estadoWizard.terminosPago.diasPago >
            estadoWizard.anunciante.terminosPreferenciales.diasPago
        ) {
          sugerencias.push({
            tipo: "termino",
            valor: {
              diasPago: estadoWizard.anunciante.terminosPreferenciales.diasPago,
            },
            razonamiento:
              `El cliente tiene términos preferenciales de ${estadoWizard.anunciante.terminosPreferenciales.diasPago} días`,
            confianza: 0.9,
            basadoEn: ["terminos_preferenciales"],
            aplicar: () => {},
          });
        }
        break;

      case 3:
        // Sugerencias de medios
        if (estadoWizard.lineasEspecificacion.length === 0) {
          sugerencias.push({
            tipo: "medio",
            valor: "Radio Prime + Digital",
            razonamiento: "Combinación con mejor ROI para campañas similares",
            confianza: 0.75,
            basadoEn: ["campanas_similares", "industria_cliente"],
            aplicar: () => {},
          });
        }
        break;
    }

    return sugerencias;
  }

  // ═══════════════════════════════════════════════════════════════
  // MÉTODOS AUXILIARES
  // ═══════════════════════════════════════════════════════════════

  private getRespuesta(tipo: keyof typeof RESPUESTAS_CONTEXTUALES): string {
    const respuestas = RESPUESTAS_CONTEXTUALES[tipo];
    return respuestas[Math.floor(Math.random() * respuestas.length)];
  }

  private async sugerirTerminos(estadoWizard?: WizardContratoState): Promise<{
    texto: string;
    acciones?: AccionCopilot[];
  }> {
    if (!estadoWizard?.anunciante) {
      return {
        texto:
          "Primero selecciona un anunciante para que pueda sugerirte términos personalizados.",
      };
    }

    const { terminosPreferenciales, scoreRiesgo, nivelRiesgo } =
      estadoWizard.anunciante;

    let texto =
      `📊 **Análisis de Términos para ${estadoWizard.anunciante.nombre}**\n\n`;
    texto += `• **Score de Riesgo:** ${scoreRiesgo}/1000 (${nivelRiesgo})\n`;
    texto +=
      `• **Días de Pago Sugeridos:** ${terminosPreferenciales.diasPago} días\n`;
    texto +=
      `• **Descuento Máximo:** ${terminosPreferenciales.descuentoMaximo}%\n`;
    texto +=
      `• **Límite de Crédito:** $${terminosPreferenciales.limiteCredito.toLocaleString()}\n\n`;

    if (nivelRiesgo === "bajo") {
      texto +=
        "✅ Este cliente tiene excelente historial. Puedes ofrecer condiciones flexibles.";
    } else if (nivelRiesgo === "medio") {
      texto += "⚠️ Cliente con riesgo moderado. Recomiendo términos estándar.";
    } else {
      texto +=
        "🚨 Cliente de alto riesgo. Sugiero requerir garantía o pago anticipado.";
    }

    return {
      texto,
      acciones: [{
        tipo: "ejecutar",
        titulo: "Aplicar Términos Sugeridos",
        descripcion:
          `Configurar ${terminosPreferenciales.diasPago} días de pago`,
        requiereConfirmacion: true,
      }],
    };
  }

  private generarResumenContrato(estado: WizardContratoState): string {
    let resumen = `📄 **Resumen del Contrato ${estado.numeroContrato}**\n\n`;

    if (estado.anunciante) {
      resumen += `**Cliente:** ${estado.anunciante.nombre}\n`;
    }
    if (estado.campana) {
      resumen += `**Campaña:** ${estado.campana}\n`;
    }
    if (estado.fechaInicio && estado.fechaFin) {
      resumen +=
        `**Vigencia:** ${estado.fechaInicio.toLocaleDateString()} - ${estado.fechaFin.toLocaleDateString()}\n`;
    }
    resumen += `**Valor Bruto:** $${estado.valorBruto.toLocaleString()}\n`;
    resumen += `**Descuento:** ${estado.descuentoPorcentaje}%\n`;
    resumen += `**Valor Neto:** $${estado.valorNeto.toLocaleString()}\n`;
    resumen += `**Términos de Pago:** ${estado.terminosPago.diasPago} días\n`;
    resumen += `**Líneas de Pauta:** ${estado.lineasEspecificacion.length}\n`;

    if (estado.flujoAprobacion) {
      resumen +=
        `\n**Nivel Aprobación:** ${estado.flujoAprobacion.nivelRequerido}\n`;
      resumen +=
        `**Aprobadores:** ${estado.flujoAprobacion.aprobadores.length}\n`;
    }

    return resumen;
  }

  private responderPregunta(
    pregunta: string,
    estadoWizard?: WizardContratoState,
  ): { texto: string; acciones?: AccionCopilot[] } {
    const preguntaLower = pregunta.toLowerCase();

    // Preguntas sobre proceso
    if (preguntaLower.includes("cómo") && preguntaLower.includes("contrato")) {
      return {
        texto:
          "Para crear un contrato, sigue estos pasos:\n\n1. Selecciona el tipo de contrato y cliente\n2. Configura los términos comerciales\n3. Agrega las líneas de especificación\n4. Revisa el flujo de aprobación\n5. Genera y firma los documentos\n\n¿En qué paso necesitas ayuda específica?",
      };
    }

    // Preguntas sobre descuentos
    if (
      preguntaLower.includes("descuento") && preguntaLower.includes("máximo")
    ) {
      if (estadoWizard?.anunciante) {
        return {
          texto:
            `El descuento máximo para ${estadoWizard.anunciante.nombre} es **${estadoWizard.anunciante.terminosPreferenciales.descuentoMaximo}%** según su score de riesgo.`,
        };
      }
      return {
        texto:
          "Selecciona un cliente primero para ver el descuento máximo permitido.",
      };
    }

    // Preguntas sobre aprobación
    if (
      preguntaLower.includes("aprobación") || preguntaLower.includes("aprobar")
    ) {
      return {
        texto:
          "El nivel de aprobación se determina automáticamente según:\n\n• Valor del contrato\n• Porcentaje de descuento\n• Días de pago\n• Si es cliente nuevo o recurrente\n\nContratos menores a $10M con descuento ≤10% y cliente recurrente se aprueban automáticamente.",
      };
    }

    return {
      texto:
        "No estoy seguro de entender tu pregunta. ¿Podrías reformularla o ser más específico? Puedo ayudarte con:\n\n• Crear o modificar contratos\n• Analizar riesgo de clientes\n• Sugerir términos comerciales\n• Explicar el proceso de aprobación",
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // CONTEXTO Y ESTADO
  // ═══════════════════════════════════════════════════════════════

  /**
   * Actualiza el contexto del copilot
   */
  actualizarContexto(updates: Partial<ContextoCopilot>): void {
    this.contexto = { ...this.contexto, ...updates };
  }

  /**
   * Obtiene el historial de conversación
   */
  getHistorial(): MensajeCopilot[] {
    return this.contexto.historialConversacion;
  }

  /**
   * Limpia el historial de conversación
   */
  limpiarHistorial(): void {
    this.contexto.historialConversacion = [];
  }

  /**
   * Registra una acción del usuario
   */
  registrarAccion(accion: string): void {
    this.contexto.ultimasAcciones = [
      accion,
      ...this.contexto.ultimasAcciones.slice(0, 9),
    ];
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOK PARA USO EN COMPONENTES
// ═══════════════════════════════════════════════════════════════

export function useCopilot(estadoWizard?: WizardContratoState) {
  const copilot = CopilotService.getInstance();

  return {
    procesarMensaje: (mensaje: string) =>
      copilot.procesarMensaje(mensaje, estadoWizard),
    getSugerencias: () =>
      estadoWizard ? copilot.getSugerenciasContextuales(estadoWizard) : [],
    getHistorial: copilot.getHistorial.bind(copilot),
    limpiarHistorial: copilot.limpiarHistorial.bind(copilot),
    registrarAccion: copilot.registrarAccion.bind(copilot),
  };
}

export default CopilotService;
