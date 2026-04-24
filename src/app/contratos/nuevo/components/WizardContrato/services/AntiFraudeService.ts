/**
 * 🔐 SILEXAR PULSE - Servicio Anti-Fraude TIER 0
 *
 * @description Servicio que centraliza toda la lógica de validación anti-fraude
 * para contratos, incluyendo evidencias, aprobaciones por descuento, y detección
 * de modificaciones.
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type TipoEvidenciaNegociacion =
  | "email_cliente"
  | "orden_compra"
  | "cotizacion_firmada"
  | "whatsapp_chat"
  | "grabacion_llamada"
  | "minuta_reunion"
  | "otro";

export interface EvidenciaNegociacion {
  id: string;
  tipo: TipoEvidenciaNegociacion;
  nombre: string;
  url: string;
  fechaSubida: Date;
  subidoPor: {
    id: string;
    nombre: string;
  };
  validado: boolean;
  validadoPor?: {
    id: string;
    nombre: string;
    fecha: Date;
  };
  comentarios?: string;
  hash: string;
}

export type NivelAprobacionAntiFraude =
  | "jefatura_directa"
  | "gerente_comercial"
  | "gerente_general";

export interface AprobacionContrato {
  nivel: NivelAprobacionAntiFraude;
  aprobadorId: string;
  aprobadorNombre: string;
  aprobadorEmail: string;
  estado: "pendiente" | "aprobado" | "rechazado";
  fecha?: Date;
  comentarios?: string;
  justificacion?: string;
  documentosAdjuntos?: { nombre: string; url: string }[];
}

export interface JustificacionDescuento {
  texto: string;
  documentos: { nombre: string; url: string }[];
  fechaCreacion: Date;
  creadoPor: {
    id: string;
    nombre: string;
  };
}

export type EstadoContratoAntiFraude =
  | "borrador"
  | "pendiente_evidencia"
  | "pendiente_aprobacion"
  | "aprobado_parcial"
  | "pendiente_reaprobacion"
  | "operativo"
  | "rechazado"
  | "suspendido";

export interface ConfiguracionAntiFraude {
  evidenciasSubidas: EvidenciaNegociacion[];
  aprobaciones: AprobacionContrato[];
  justificacionDescuento?: JustificacionDescuento;
  estado: EstadoContratoAntiFraude;
  puedeCargarCampanas: boolean;
  motivoBloqueo?: string;
  historialCambios: CambioDetectado[];
  ultimaModificacion: Date;
  versionAprobada?: number;
}

export interface CambioDetectado {
  id: string;
  campo: "descuento" | "valorBruto" | "valorNeto" | "lineas";
  valorAnterior: number | string;
  valorNuevo: number | string;
  fecha: Date;
  usuarioId: string;
  usuarioNombre: string;
  requiereReaprobacion: boolean;
}

export interface ReglasAprobacion {
  nivelesRequeridos: NivelAprobacionAntiFraude[];
  requiereJustificacion: boolean;
  tiempoLimiteHoras: number;
}

export interface ValidacionContrato {
  esValido: boolean;
  errores: string[];
  advertencias: string[];
  puedeCrearCampana: boolean;
}

// ═══════════════════════════════════════════════════════════════
// SERVICIO ANTI-FRAUDE
// ═══════════════════════════════════════════════════════════════

class AntiFraudeServiceClass {
  private static instance: AntiFraudeServiceClass;

  private constructor() {}

  static getInstance(): AntiFraudeServiceClass {
    if (!this.instance) {
      this.instance = new AntiFraudeServiceClass();
    }
    return this.instance;
  }

  // ═══════════════════════════════════════════════════════════════
  // REGLAS DE APROBACIÓN POR DESCUENTO
  // ═══════════════════════════════════════════════════════════════

  /**
   * Determina los niveles de aprobación requeridos según el porcentaje de descuento
   */
  determinarNivelesAprobacion(descuentoPorcentaje: number): ReglasAprobacion {
    if (descuentoPorcentaje <= 50) {
      return {
        nivelesRequeridos: ["jefatura_directa"],
        requiereJustificacion: false,
        tiempoLimiteHoras: 24,
      };
    }

    if (descuentoPorcentaje <= 64) {
      return {
        nivelesRequeridos: ["jefatura_directa", "gerente_comercial"],
        requiereJustificacion: false,
        tiempoLimiteHoras: 48,
      };
    }

    // 65% o más
    return {
      nivelesRequeridos: [
        "jefatura_directa",
        "gerente_comercial",
        "gerente_general",
      ],
      requiereJustificacion: true,
      tiempoLimiteHoras: 72,
    };
  }

  /**
   * Obtiene descripción legible de los niveles requeridos
   */
  getDescripcionNiveles(reglas: ReglasAprobacion): string {
    const nombresNiveles: Record<NivelAprobacionAntiFraude, string> = {
      "jefatura_directa": "Jefatura Directa",
      "gerente_comercial": "Gerente Comercial",
      "gerente_general": "Gerente General",
    };

    return reglas.nivelesRequeridos
      .map((n) => nombresNiveles[n])
      .join(" → ");
  }

  // ═══════════════════════════════════════════════════════════════
  // VALIDACIÓN DE EVIDENCIAS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Valida que el contrato tenga al menos una evidencia de negociación
   */
  validarEvidencias(evidencias: EvidenciaNegociacion[]): {
    valido: boolean;
    mensaje: string;
  } {
    if (!evidencias || evidencias.length === 0) {
      return {
        valido: false,
        mensaje:
          "Debe adjuntar al menos 1 documento que evidencie la negociación con el cliente",
      };
    }

    return {
      valido: true,
      mensaje: `${evidencias.length} evidencia(s) adjuntada(s)`,
    };
  }

  /**
   * Genera hash para integridad de documento
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  generarHashDocumento(_archivo: File): Promise<string> {
    return new Promise((resolve) => {
      // Simulación - en producción usar crypto.subtle.digest
      const hash = `SHA256-${Date.now().toString(36)}-${
        Math.random().toString(36).substr(2, 9)
      }`;
      resolve(hash);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // VALIDACIÓN DE ESPECIFICACIONES DE EMISORA
  // ═══════════════════════════════════════════════════════════════

  /**
   * Valida que las especificaciones de emisora/digital estén completas
   */
  validarEspecificacionesEmisora(
    lineas: Array<{
      medioTipo: "RADIO" | "TV" | "DIGITAL";
      emisora?: string;
      programa?: string;
      horario?: string;
      cantidadCunas?: number;
      plataforma?: string;
      formato?: string;
      impresiones?: number;
    }>,
  ): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!lineas || lineas.length === 0) {
      return {
        valido: false,
        errores: ["Debe agregar al menos una línea de especificación"],
      };
    }

    lineas.forEach((linea, idx) => {
      const numLinea = idx + 1;

      if (linea.medioTipo === "RADIO" || linea.medioTipo === "TV") {
        if (!linea.emisora) {
          errores.push(`Línea ${numLinea}: Falta nombre de emisora`);
        }
        if (!linea.programa) {
          errores.push(`Línea ${numLinea}: Falta nombre del programa`);
        }
        if (!linea.horario) {
          errores.push(`Línea ${numLinea}: Falta horario de emisión`);
        }
        if (!linea.cantidadCunas || linea.cantidadCunas <= 0) {
          errores.push(
            `Línea ${numLinea}: Cantidad de cuñas debe ser mayor a 0`,
          );
        }
      }

      if (linea.medioTipo === "DIGITAL") {
        if (!linea.plataforma) {
          errores.push(`Línea ${numLinea}: Falta plataforma digital`);
        }
        if (!linea.formato) {
          errores.push(`Línea ${numLinea}: Falta formato del anuncio`);
        }
        if (!linea.impresiones || linea.impresiones <= 0) {
          errores.push(
            `Línea ${numLinea}: Cantidad de impresiones debe ser mayor a 0`,
          );
        }
      }
    });

    return {
      valido: errores.length === 0,
      errores,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // DETECCIÓN DE MODIFICACIONES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Detecta cambios críticos que requieren re-aprobación
   */
  detectarCambiosCriticos(
    contratoAnterior: {
      descuento: number;
      valorBruto: number;
      valorNeto: number;
      cantidadLineas: number;
    },
    contratoNuevo: {
      descuento: number;
      valorBruto: number;
      valorNeto: number;
      cantidadLineas: number;
    },
    usuarioId: string,
    usuarioNombre: string,
  ): CambioDetectado[] {
    const cambios: CambioDetectado[] = [];
    const ahora = new Date();

    // Descuento: cualquier cambio invalida
    if (contratoAnterior.descuento !== contratoNuevo.descuento) {
      cambios.push({
        id: crypto.randomUUID(),
        campo: "descuento",
        valorAnterior: contratoAnterior.descuento,
        valorNuevo: contratoNuevo.descuento,
        fecha: ahora,
        usuarioId,
        usuarioNombre,
        requiereReaprobacion: true,
      });
    }

    // Valor bruto: cambios >5% invalidan
    const cambioBruto = contratoAnterior.valorBruto > 0
      ? Math.abs(contratoNuevo.valorBruto - contratoAnterior.valorBruto) /
        contratoAnterior.valorBruto
      : 1;

    if (cambioBruto > 0.05) {
      cambios.push({
        id: crypto.randomUUID(),
        campo: "valorBruto",
        valorAnterior: contratoAnterior.valorBruto,
        valorNuevo: contratoNuevo.valorBruto,
        fecha: ahora,
        usuarioId,
        usuarioNombre,
        requiereReaprobacion: true,
      });
    }

    // Valor neto: cambios >5% invalidan
    const cambioNeto = contratoAnterior.valorNeto > 0
      ? Math.abs(contratoNuevo.valorNeto - contratoAnterior.valorNeto) /
        contratoAnterior.valorNeto
      : 1;

    if (cambioNeto > 0.05) {
      cambios.push({
        id: crypto.randomUUID(),
        campo: "valorNeto",
        valorAnterior: contratoAnterior.valorNeto,
        valorNuevo: contratoNuevo.valorNeto,
        fecha: ahora,
        usuarioId,
        usuarioNombre,
        requiereReaprobacion: true,
      });
    }

    // Líneas: cualquier cambio en cantidad
    if (contratoAnterior.cantidadLineas !== contratoNuevo.cantidadLineas) {
      cambios.push({
        id: crypto.randomUUID(),
        campo: "lineas",
        valorAnterior: contratoAnterior.cantidadLineas,
        valorNuevo: contratoNuevo.cantidadLineas,
        fecha: ahora,
        usuarioId,
        usuarioNombre,
        requiereReaprobacion: true,
      });
    }

    return cambios;
  }

  /**
   * Verifica si los cambios requieren nueva aprobación
   */
  requiereReaprobacion(cambios: CambioDetectado[]): boolean {
    return cambios.some((c) => c.requiereReaprobacion);
  }

  // ═══════════════════════════════════════════════════════════════
  // VALIDACIÓN COMPLETA DEL CONTRATO
  // ═══════════════════════════════════════════════════════════════

  /**
   * Validación completa del contrato para determinar si puede crear campañas
   */
  validarContrato(
    config: ConfiguracionAntiFraude,
    descuento: number,
  ): ValidacionContrato {
    const errores: string[] = [];
    const advertencias: string[] = [];

    // 1. Validar evidencias
    const validacionEvidencias = this.validarEvidencias(
      config.evidenciasSubidas,
    );
    if (!validacionEvidencias.valido) {
      errores.push(validacionEvidencias.mensaje);
    }

    // 2. Validar aprobaciones según descuento
    const reglas = this.determinarNivelesAprobacion(descuento);
    const aprobacionesPendientes = reglas.nivelesRequeridos.filter((nivel) => {
      const aprobacion = config.aprobaciones.find((a) => a.nivel === nivel);
      return !aprobacion || aprobacion.estado !== "aprobado";
    });

    if (aprobacionesPendientes.length > 0) {
      errores.push(
        `Faltan aprobaciones de: ${aprobacionesPendientes.join(", ")}`,
      );
    }

    // 3. Validar justificación si descuento >= 65%
    if (reglas.requiereJustificacion && !config.justificacionDescuento?.texto) {
      errores.push("Se requiere justificación escrita para descuentos ≥65%");
    }

    // 4. Verificar si hay cambios pendientes de re-aprobación
    if (config.estado === "pendiente_reaprobacion") {
      errores.push("El contrato fue modificado y requiere nueva aprobación");
    }

    // Advertencias
    if (descuento >= 50) {
      advertencias.push(`Descuento alto (${descuento}%) - Bajo supervisión`);
    }

    return {
      esValido: errores.length === 0,
      errores,
      advertencias,
      puedeCrearCampana: errores.length === 0 && config.estado === "operativo",
    };
  }

  /**
   * Determina el estado del contrato según las validaciones
   */
  determinarEstadoContrato(
    tieneEvidencias: boolean,
    todasAprobaciones: boolean,
    tieneJustificacion: boolean,
    requiereJustificacion: boolean,
    fueModificado: boolean,
  ): EstadoContratoAntiFraude {
    if (fueModificado) {
      return "pendiente_reaprobacion";
    }

    if (!tieneEvidencias) {
      return "pendiente_evidencia";
    }

    if (!todasAprobaciones) {
      return "pendiente_aprobacion";
    }

    if (requiereJustificacion && !tieneJustificacion) {
      return "pendiente_aprobacion";
    }

    return "operativo";
  }

  // ═══════════════════════════════════════════════════════════════
  // ACCIONES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Invalida todas las aprobaciones del contrato
   */
  invalidarAprobaciones(
    aprobaciones: AprobacionContrato[],
  ): AprobacionContrato[] {
    return aprobaciones.map((a) => ({
      ...a,
      estado: "pendiente" as const,
      fecha: undefined,
      comentarios: "Invalidada por modificación del contrato",
    }));
  }

  /**
   * Registra una aprobación
   */
  registrarAprobacion(
    aprobaciones: AprobacionContrato[],
    nivel: NivelAprobacionAntiFraude,
    aprobadorId: string,
    aprobadorNombre: string,
    aprobadorEmail: string,
    aprobado: boolean,
    comentarios?: string,
    justificacion?: string,
    documentos?: { nombre: string; url: string }[],
  ): AprobacionContrato[] {
    const idx = aprobaciones.findIndex((a) => a.nivel === nivel);

    const nuevaAprobacion: AprobacionContrato = {
      nivel,
      aprobadorId,
      aprobadorNombre,
      aprobadorEmail,
      estado: aprobado ? "aprobado" : "rechazado",
      fecha: new Date(),
      comentarios,
      justificacion,
      documentosAdjuntos: documentos,
    };

    if (idx >= 0) {
      const nuevas = [...aprobaciones];
      nuevas[idx] = nuevaAprobacion;
      return nuevas;
    }

    return [...aprobaciones, nuevaAprobacion];
  }

  /**
   * Verifica si todas las aprobaciones requeridas están completas
   */
  todasAprobacionesCompletas(
    aprobaciones: AprobacionContrato[],
    nivelesRequeridos: NivelAprobacionAntiFraude[],
  ): boolean {
    return nivelesRequeridos.every((nivel) => {
      const aprobacion = aprobaciones.find((a) => a.nivel === nivel);
      return aprobacion?.estado === "aprobado";
    });
  }

  /**
   * Genera configuración anti-fraude inicial
   */
  getConfiguracionInicial(): ConfiguracionAntiFraude {
    return {
      evidenciasSubidas: [],
      aprobaciones: [],
      estado: "borrador",
      puedeCargarCampanas: false,
      historialCambios: [],
      ultimaModificacion: new Date(),
    };
  }
}

// Singleton export
export const AntiFraudeService = AntiFraudeServiceClass.getInstance();
export default AntiFraudeService;
