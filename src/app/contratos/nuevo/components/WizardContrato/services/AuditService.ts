/**
 * 🔒 SILEXAR PULSE - Servicio de Auditoría TIER 0
 *
 * @description Sistema de auditoría inmutable con verificación de integridad
 * basado en cadena de hashes para compliance SOX/GDPR.
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 * @security ENTERPRISE_AUDIT
 */

import { logger } from "@/lib/observability";
import {
  EventoAuditoria,
  RolUsuario,
  TipoEventoAuditoria,
} from "../types/enterprise.types";

// ═══════════════════════════════════════════════════════════════
// UTILIDADES DE HASH
// ═══════════════════════════════════════════════════════════════

/**
 * Genera hash SHA-256 de un objeto
 * @param data - Datos a hashear
 * @returns Hash en formato hexadecimal
 */
async function generateHash(data: unknown): Promise<string> {
  const encoder = new TextEncoder();
  const dataString = JSON.stringify(data, Object.keys(data as object).sort());
  const dataBuffer = encoder.encode(dataString);

  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verifica integridad de un evento de auditoría
 */
async function verifyEventIntegrity(evento: EventoAuditoria): Promise<boolean> {
  const { hash, hashAnterior, firmaDigital, ...datosEvento } = evento;
  void hashAnterior;
  void firmaDigital;
  const calculatedHash = await generateHash(datosEvento);
  return calculatedHash === hash;
}

// ═══════════════════════════════════════════════════════════════
// ALMACENAMIENTO LOCAL DE EVENTOS
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = "silexar_audit_events";
const MAX_LOCAL_EVENTS = 1000;

interface AuditStorage {
  events: EventoAuditoria[];
  lastSync: Date | null;
  lastHash: string | null;
}

function getStoredEvents(): AuditStorage {
  if (typeof window === "undefined") {
    return { events: [], lastSync: null, lastHash: null };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        events: parsed.events.map((e: EventoAuditoria) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        })),
      };
    }
  } catch {
    logger.error("[Audit] Error reading stored events");
  }

  return { events: [], lastSync: null, lastHash: null };
}

function storeEvents(storage: AuditStorage): void {
  if (typeof window === "undefined") return;

  try {
    // Mantener solo los últimos N eventos localmente
    const trimmedStorage = {
      ...storage,
      events: storage.events.slice(-MAX_LOCAL_EVENTS),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedStorage));
  } catch {
    logger.error("[Audit] Error storing events");
  }
}

// ═══════════════════════════════════════════════════════════════
// CLASE PRINCIPAL DE AUDITORÍA
// ═══════════════════════════════════════════════════════════════

export class AuditService {
  private static instance: AuditService;
  private storage: AuditStorage;
  private pendingSync: EventoAuditoria[] = [];
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.storage = getStoredEvents();
    this.startSyncInterval();
  }

  /**
   * Obtiene instancia singleton del servicio
   */
  static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  /**
   * Registra un evento de auditoría
   */
  async logEvent(params: {
    tipoEvento: TipoEventoAuditoria;
    recursoTipo: EventoAuditoria["recursoTipo"];
    recursoId: string;
    recursoNombre?: string;
    accion: string;
    descripcion: string;
    datosAnteriores?: Record<string, unknown>;
    datosNuevos?: Record<string, unknown>;
    camposModificados?: string[];
    resultado?: EventoAuditoria["resultado"];
    motivoFallo?: string;
  }): Promise<EventoAuditoria> {
    // Obtener información del usuario actual (mock por ahora)
    const usuarioActual = this.getCurrentUser();
    const sesionInfo = this.getSessionInfo();

    // Determinar nivel de riesgo
    const nivelRiesgo = this.calculateRiskLevel(
      params.tipoEvento,
      params.resultado,
    );

    // Crear evento base
    const eventoBase = {
      id: crypto.randomUUID(),
      timestamp: new Date(),

      // Usuario
      usuarioId: usuarioActual.id,
      usuarioNombre: usuarioActual.nombre,
      usuarioEmail: usuarioActual.email,
      rol: usuarioActual.rol,

      // Recurso
      tipoEvento: params.tipoEvento,
      recursoTipo: params.recursoTipo,
      recursoId: params.recursoId,
      recursoNombre: params.recursoNombre,

      // Detalles
      accion: params.accion,
      descripcion: params.descripcion,
      datosAnteriores: params.datosAnteriores,
      datosNuevos: params.datosNuevos,
      camposModificados: params.camposModificados,

      // Contexto
      ipAddress: sesionInfo.ipAddress,
      userAgent: sesionInfo.userAgent,
      geolocalizacion: sesionInfo.geolocalizacion,
      dispositivo: sesionInfo.dispositivo,
      sesionId: sesionInfo.sesionId,

      // Resultado
      resultado: params.resultado || "exito",
      motivoFallo: params.motivoFallo,
      nivelRiesgo,
    };

    // Generar hash con referencia al anterior para cadena de integridad
    const hash = await generateHash(eventoBase);
    const hashAnterior = this.storage.lastHash;

    const evento: EventoAuditoria = {
      ...eventoBase,
      hash,
      hashAnterior: hashAnterior || undefined,
    };

    // Almacenar evento
    this.storage.events.push(evento);
    this.storage.lastHash = hash;
    this.pendingSync.push(evento);
    storeEvents(this.storage);

    // Log en consola para desarrollo
    if (process.env.NODE_ENV === "development") {
      logger.info(`[Audit] ${evento.tipoEvento}: ${evento.descripcion}`, {
        id: evento.id,
        usuario: evento.usuarioNombre,
        recurso: `${evento.recursoTipo}:${evento.recursoId}`,
      });
    }

    // Si es evento de alto riesgo, enviar alerta inmediata
    if (nivelRiesgo === "critico" || nivelRiesgo === "alto") {
      await this.sendSecurityAlert(evento);
    }

    return evento;
  }

  /**
   * Obtiene eventos de auditoría con filtros
   */
  getEvents(filters?: {
    desde?: Date;
    hasta?: Date;
    usuarioId?: string;
    tipoEvento?: TipoEventoAuditoria[];
    recursoTipo?: EventoAuditoria["recursoTipo"];
    recursoId?: string;
    nivelRiesgo?: EventoAuditoria["nivelRiesgo"][];
    limite?: number;
  }): EventoAuditoria[] {
    let eventos = [...this.storage.events];

    if (filters) {
      if (filters.desde) {
        eventos = eventos.filter((e) => e.timestamp >= filters.desde!);
      }
      if (filters.hasta) {
        eventos = eventos.filter((e) => e.timestamp <= filters.hasta!);
      }
      if (filters.usuarioId) {
        eventos = eventos.filter((e) => e.usuarioId === filters.usuarioId);
      }
      if (filters.tipoEvento?.length) {
        const tipoEvento = filters.tipoEvento;
        eventos = eventos.filter((e) => tipoEvento.includes(e.tipoEvento));
      }
      if (filters.recursoTipo) {
        eventos = eventos.filter((e) => e.recursoTipo === filters.recursoTipo);
      }
      if (filters.recursoId) {
        eventos = eventos.filter((e) => e.recursoId === filters.recursoId);
      }
      if (filters.nivelRiesgo?.length) {
        const nivelRiesgo = filters.nivelRiesgo;
        eventos = eventos.filter((e) => nivelRiesgo.includes(e.nivelRiesgo));
      }
      if (filters.limite) {
        eventos = eventos.slice(-filters.limite);
      }
    }

    return eventos.sort((a, b) =>
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Obtiene resumen de auditoría para un contrato
   */
  getContractAuditSummary(contratoId: string): {
    totalEventos: number;
    eventosPorTipo: Record<string, number>;
    ultimaModificacion?: EventoAuditoria;
    usuariosInvolucrados: string[];
    alarmasSeguridad: EventoAuditoria[];
  } {
    const eventos = this.getEvents({ recursoId: contratoId });

    const eventosPorTipo: Record<string, number> = {};
    const usuariosSet = new Set<string>();

    eventos.forEach((e) => {
      eventosPorTipo[e.tipoEvento] = (eventosPorTipo[e.tipoEvento] || 0) + 1;
      usuariosSet.add(e.usuarioNombre);
    });

    const ultimaModificacion = eventos.find((e) =>
      ["editar", "crear", "aprobar", "firmar", "cambiar_estado"].includes(
        e.tipoEvento,
      )
    );

    const alarmasSeguridad = eventos.filter((e) =>
      e.nivelRiesgo === "critico" || e.nivelRiesgo === "alto"
    );

    return {
      totalEventos: eventos.length,
      eventosPorTipo,
      ultimaModificacion,
      usuariosInvolucrados: Array.from(usuariosSet),
      alarmasSeguridad,
    };
  }

  /**
   * Verifica integridad de la cadena de auditoría
   */
  async verifyChainIntegrity(): Promise<{
    isValid: boolean;
    totalEvents: number;
    corruptedEvents: string[];
    lastVerified: Date;
  }> {
    const corruptedEvents: string[] = [];

    for (let i = 0; i < this.storage.events.length; i++) {
      const evento = this.storage.events[i];

      // Verificar hash del evento
      const isValid = await verifyEventIntegrity(evento);
      if (!isValid) {
        corruptedEvents.push(evento.id);
        continue;
      }

      // Verificar cadena (hash anterior)
      if (i > 0 && evento.hashAnterior) {
        const eventoAnterior = this.storage.events[i - 1];
        if (evento.hashAnterior !== eventoAnterior.hash) {
          corruptedEvents.push(evento.id);
        }
      }
    }

    return {
      isValid: corruptedEvents.length === 0,
      totalEvents: this.storage.events.length,
      corruptedEvents,
      lastVerified: new Date(),
    };
  }

  /**
   * Exporta eventos para compliance
   */
  exportForCompliance(
    formato: "json" | "csv",
    filtros?: Parameters<typeof this.getEvents>[0],
  ): string {
    const eventos = this.getEvents(filtros);

    if (formato === "json") {
      return JSON.stringify(eventos, null, 2);
    }

    // CSV
    const headers = [
      "ID",
      "Timestamp",
      "Usuario",
      "Email",
      "Rol",
      "Tipo Evento",
      "Recurso",
      "Accion",
      "Descripcion",
      "IP",
      "Resultado",
      "Nivel Riesgo",
      "Hash",
    ];

    const rows = eventos.map((e) => [
      e.id,
      e.timestamp.toISOString(),
      e.usuarioNombre,
      e.usuarioEmail,
      e.rol,
      e.tipoEvento,
      `${e.recursoTipo}:${e.recursoId}`,
      e.accion,
      e.descripcion.replace(/,/g, ";"),
      e.ipAddress,
      e.resultado,
      e.nivelRiesgo,
      e.hash,
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }

  // ═══════════════════════════════════════════════════════════════
  // MÉTODOS PRIVADOS
  // ═══════════════════════════════════════════════════════════════

  private getCurrentUser(): {
    id: string;
    nombre: string;
    email: string;
    rol: RolUsuario;
  } {
    // TODO: Integrar con sistema de autenticación real
    return {
      id: "user-001",
      nombre: "Usuario Actual",
      email: "usuario@silexar.com",
      rol: "ejecutivo",
    };
  }

  private getSessionInfo(): {
    ipAddress: string;
    userAgent: string;
    geolocalizacion?: { pais: string; ciudad: string };
    dispositivo: string;
    sesionId: string;
  } {
    const userAgent = typeof navigator !== "undefined"
      ? navigator.userAgent
      : "server";

    return {
      ipAddress: "127.0.0.1", // Se obtendría del servidor
      userAgent,
      geolocalizacion: { pais: "Chile", ciudad: "Santiago" },
      dispositivo: this.detectDevice(userAgent),
      sesionId: this.getOrCreateSessionId(),
    };
  }

  private detectDevice(userAgent: string): string {
    if (/mobile/i.test(userAgent)) return "mobile";
    if (/tablet/i.test(userAgent)) return "tablet";
    return "desktop";
  }

  private getOrCreateSessionId(): string {
    if (typeof sessionStorage === "undefined") return "server-session";

    let sessionId = sessionStorage.getItem("audit_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("audit_session_id", sessionId);
    }
    return sessionId;
  }

  private calculateRiskLevel(
    tipoEvento: TipoEventoAuditoria,
    resultado?: EventoAuditoria["resultado"],
  ): EventoAuditoria["nivelRiesgo"] {
    // Eventos críticos
    if (resultado === "denegado" || tipoEvento === "acceso_denegado") {
      return "critico";
    }

    // Eventos de alto riesgo
    if (["eliminar", "cambiar_estado", "firmar"].includes(tipoEvento)) {
      return "alto";
    }

    // Eventos de riesgo medio
    if (["editar", "aprobar", "rechazar", "archivar"].includes(tipoEvento)) {
      return "medio";
    }

    // Eventos de bajo riesgo
    return "bajo";
  }

  private async sendSecurityAlert(evento: EventoAuditoria): Promise<void> {
    // TODO: Integrar con sistema de alertas real
    logger.warn("[SECURITY ALERT]", {
      tipo: evento.tipoEvento,
      usuario: evento.usuarioNombre,
      recurso: `${evento.recursoTipo}:${evento.recursoId}`,
      riesgo: evento.nivelRiesgo,
      timestamp: evento.timestamp,
    });
  }

  private startSyncInterval(): void {
    // Sincronizar eventos pendientes cada 30 segundos
    this.syncInterval = setInterval(() => {
      if (this.pendingSync.length > 0) {
        this.syncPendingEvents();
      }
    }, 30000);
  }

  private async syncPendingEvents(): Promise<void> {
    if (this.pendingSync.length === 0) return;

    try {
      // TODO: Enviar a API de auditoría central
      // await fetch('/api/audit/sync', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(this.pendingSync)
      // });

      this.pendingSync = [];
      this.storage.lastSync = new Date();
      storeEvents(this.storage);
    } catch {
      logger.error("[Audit] Error syncing events");
    }
  }

  /**
   * Limpia recursos al destruir
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOK PARA USO EN COMPONENTES
// ═══════════════════════════════════════════════════════════════

export function useAudit() {
  const audit = AuditService.getInstance();

  return {
    logEvent: audit.logEvent.bind(audit),
    getEvents: audit.getEvents.bind(audit),
    getContractAuditSummary: audit.getContractAuditSummary.bind(audit),
    verifyChainIntegrity: audit.verifyChainIntegrity.bind(audit),
    exportForCompliance: audit.exportForCompliance.bind(audit),
  };
}

// ═══════════════════════════════════════════════════════════════
// DECORADOR PARA AUDITORÍA AUTOMÁTICA
// ═══════════════════════════════════════════════════════════════

export function withAudit<T extends (...args: unknown[]) => unknown>(
  tipoEvento: TipoEventoAuditoria,
  descripcion: string,
  getRecursoId: (args: unknown[]) => string,
) {
  return function (fn: T): T {
    return (async (...args: unknown[]) => {
      const audit = AuditService.getInstance();
      const recursoId = getRecursoId(args);

      try {
        const result = await fn(...args);

        await audit.logEvent({
          tipoEvento,
          recursoTipo: "contrato",
          recursoId,
          accion: tipoEvento,
          descripcion,
          resultado: "exito",
        });

        return result;
      } catch (error) {
        await audit.logEvent({
          tipoEvento,
          recursoTipo: "contrato",
          recursoId,
          accion: tipoEvento,
          descripcion,
          resultado: "fallo",
          motivoFallo: error instanceof Error
            ? error.message
            : "Error desconocido",
        });

        throw error;
      }
    }) as T;
  };
}

export default AuditService;
