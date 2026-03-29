/**
 * SILEXAR PULSE - TIER0+ CORTEX STREAM PROCESSOR
 * Procesador de Flujo para Enriquecimiento de Eventos
 * 
 * Este módulo implementa el procesador que:
 * - Escucha ad_requests y contextual_triggers
 * - Enriquece los datos juntándolos por requestId
 * - Publica en enriched_ad_requests para el Orchestrator
 * 
 * @version 2.0.0
 * @author Silexar Pulse Team
 */

import { logger } from '@/lib/observability';
import {
  getCortexEventBus,
  CORTEX_TOPICS,
  type AdRequestEvent,
  type ContextualTriggerEvent,
  type EnrichedAdRequestEvent,
  type UserHistoryContext,
  type CortexEventBus,
} from './cortex-event-bus';

// ============================================================================
// CONFIGURACIÓN DEL PROCESADOR
// ============================================================================

export interface StreamProcessorConfig {
  /** Tiempo máximo de espera para correlacionar eventos (ms) */
  readonly correlationTimeoutMs: number;
  /** Tamaño máximo del buffer de eventos pendientes */
  readonly maxBufferSize: number;
  /** Intervalo de limpieza de eventos vencidos (ms) */
  readonly cleanupIntervalMs: number;
  /** Habilitar logging detallado */
  readonly verboseLogging: boolean;
}

const DEFAULT_CONFIG: StreamProcessorConfig = {
  correlationTimeoutMs: 5000,
  maxBufferSize: 10000,
  cleanupIntervalMs: 10000,
  verboseLogging: process.env.NODE_ENV === 'development',
};

// ============================================================================
// BUFFER DE CORRELACIÓN
// ============================================================================

interface PendingRequest {
  readonly adRequest: AdRequestEvent;
  readonly contextualTrigger?: ContextualTriggerEvent;
  readonly receivedAt: number;
  readonly enriched: boolean;
}

class CorrelationBuffer {
  private buffer: Map<string, PendingRequest> = new Map();
  private config: StreamProcessorConfig;

  constructor(config: StreamProcessorConfig) {
    this.config = config;
  }

  /**
   * Agrega o actualiza un ad_request en el buffer
   */
  addAdRequest(event: AdRequestEvent): PendingRequest | null {
    const existing = this.buffer.get(event.requestId);
    
    if (existing) {
      // Ya existe un contextual trigger, podemos enriquecer
      const updated: PendingRequest = {
        ...existing,
        adRequest: event,
      };
      this.buffer.set(event.requestId, updated);
      return updated;
    }

    // Nuevo request, esperar por trigger contextual
    const pending: PendingRequest = {
      adRequest: event,
      receivedAt: Date.now(),
      enriched: false,
    };
    this.buffer.set(event.requestId, pending);
    
    // Verificar límite del buffer
    this.enforceBufferLimit();
    
    return null;
  }

  /**
   * Agrega un contextual_trigger y busca el ad_request correspondiente
   */
  addContextualTrigger(event: ContextualTriggerEvent): PendingRequest | null {
    const existing = this.buffer.get(event.requestId);
    
    if (existing && !existing.enriched) {
      // Encontramos el ad_request correspondiente
      const updated: PendingRequest = {
        ...existing,
        contextualTrigger: event,
      };
      this.buffer.set(event.requestId, updated);
      return updated;
    }

    // El trigger llegó antes que el ad_request, guardarlo
    if (!existing) {
      const pending: PendingRequest = {
        adRequest: null as unknown as AdRequestEvent, // Se llenará después
        contextualTrigger: event,
        receivedAt: Date.now(),
        enriched: false,
      };
      this.buffer.set(event.requestId, pending);
    }

    return null;
  }

  /**
   * Marca un request como procesado
   */
  markEnriched(requestId: string): void {
    const existing = this.buffer.get(requestId);
    if (existing) {
      this.buffer.set(requestId, { ...existing, enriched: true });
    }
  }

  /**
   * Obtiene requests pendientes que han expirado (para procesamiento sin trigger)
   */
  getExpiredRequests(): PendingRequest[] {
    const now = Date.now();
    const expired: PendingRequest[] = [];
    
    this.buffer.forEach((pending, requestId) => {
      if (
        !pending.enriched &&
        pending.adRequest &&
        now - pending.receivedAt > this.config.correlationTimeoutMs
      ) {
        expired.push(pending);
        this.markEnriched(requestId);
      }
    });

    return expired;
  }

  /**
   * Limpia entradas antiguas del buffer
   */
  cleanup(): number {
    const now = Date.now();
    const maxAge = this.config.correlationTimeoutMs * 2;
    let removed = 0;

    this.buffer.forEach((pending, requestId) => {
      if (now - pending.receivedAt > maxAge) {
        this.buffer.delete(requestId);
        removed++;
      }
    });

    return removed;
  }

  /**
   * Obtiene estadísticas del buffer
   */
  getStats(): { size: number; pending: number; enriched: number } {
    let pending = 0;
    let enriched = 0;
    
    this.buffer.forEach((p) => {
      if (p.enriched) enriched++;
      else pending++;
    });

    return { size: this.buffer.size, pending, enriched };
  }

  private enforceBufferLimit(): void {
    if (this.buffer.size > this.config.maxBufferSize) {
      // Eliminar los más antiguos
      const entries = Array.from(this.buffer.entries())
        .sort((a, b) => a[1].receivedAt - b[1].receivedAt);
      
      const toRemove = entries.slice(0, this.buffer.size - this.config.maxBufferSize);
      toRemove.forEach(([key]) => this.buffer.delete(key));
    }
  }
}

// ============================================================================
// PROCESADOR DE FLUJO PRINCIPAL
// ============================================================================

export class CortexStreamProcessor {
  private eventBus: CortexEventBus;
  private buffer: CorrelationBuffer;
  private config: StreamProcessorConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private running = false;
  private unsubscribers: Array<() => void> = [];
  private userHistoryCache: Map<string, UserHistoryContext> = new Map();

  constructor(config: Partial<StreamProcessorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.eventBus = getCortexEventBus();
    this.buffer = new CorrelationBuffer(this.config);
  }

  /**
   * Inicia el procesador de flujo
   */
  start(): void {
    if (this.running) {
      logger.warn('[Cortex-StreamProcessor] Already running');
      return;
    }

    this.log('Starting Cortex Stream Processor...');

    // Suscribirse a ad_requests
    const unsubAdRequests = this.eventBus.subscribe<AdRequestEvent>(
      CORTEX_TOPICS.AD_REQUESTS,
      this.handleAdRequest.bind(this)
    );
    this.unsubscribers.push(unsubAdRequests);

    // Suscribirse a contextual_triggers
    const unsubContextual = this.eventBus.subscribe<ContextualTriggerEvent>(
      CORTEX_TOPICS.CONTEXTUAL_TRIGGERS,
      this.handleContextualTrigger.bind(this)
    );
    this.unsubscribers.push(unsubContextual);

    // Iniciar interval de limpieza y procesamiento de expirados
    this.cleanupInterval = setInterval(() => {
      this.processExpiredRequests();
      const removed = this.buffer.cleanup();
      if (removed > 0) {
        this.log(`Cleaned up ${removed} expired buffer entries`);
      }
    }, this.config.cleanupIntervalMs);

    this.running = true;
    this.log('Cortex Stream Processor started successfully');
  }

  /**
   * Detiene el procesador de flujo
   */
  stop(): void {
    if (!this.running) return;

    this.log('Stopping Cortex Stream Processor...');

    // Cancelar suscripciones
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];

    // Limpiar interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.running = false;
    this.log('Cortex Stream Processor stopped');
  }

  /**
   * Obtiene estadísticas del procesador
   */
  getStats(): {
    running: boolean;
    buffer: { size: number; pending: number; enriched: number };
    userHistoryCacheSize: number;
  } {
    return {
      running: this.running,
      buffer: this.buffer.getStats(),
      userHistoryCacheSize: this.userHistoryCache.size,
    };
  }

  /**
   * Maneja un evento de ad_request
   */
  private async handleAdRequest(event: AdRequestEvent): Promise<void> {
    this.log(`Received ad_request: ${event.requestId}`);

    const pending = this.buffer.addAdRequest(event);
    
    if (pending && pending.contextualTrigger) {
      // Ya tenemos el trigger contextual, podemos enriquecer
      await this.processEnrichedRequest(pending);
    }
  }

  /**
   * Maneja un evento de contextual_trigger
   */
  private async handleContextualTrigger(event: ContextualTriggerEvent): Promise<void> {
    this.log(`Received contextual_trigger: ${event.requestId} (${event.contextType})`);

    const pending = this.buffer.addContextualTrigger(event);
    
    if (pending && pending.adRequest) {
      // Ya tenemos el ad_request, podemos enriquecer
      await this.processEnrichedRequest(pending);
    }
  }

  /**
   * Procesa y enriquece un request completo
   */
  private async processEnrichedRequest(pending: PendingRequest): Promise<void> {
    try {
      const userHistory = await this.getUserHistory(pending.adRequest.userId);
      const audienceSegments = this.inferAudienceSegments(pending);

      const enrichedEvent: EnrichedAdRequestEvent = {
        ...pending.adRequest,
        contextualTrigger: pending.contextualTrigger,
        userHistory,
        audienceSegments,
      };

      // Publicar al topic enriched_ad_requests
      await this.eventBus.publish(
        CORTEX_TOPICS.ENRICHED_AD_REQUESTS,
        enrichedEvent
      );

      this.buffer.markEnriched(pending.adRequest.requestId);
      this.log(`Published enriched request: ${pending.adRequest.requestId}`);
    } catch (error) {
      logger.error('[Cortex-StreamProcessor] Error enriching request:', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Procesa requests que han expirado sin recibir trigger contextual
   */
  private async processExpiredRequests(): Promise<void> {
    const expired = this.buffer.getExpiredRequests();
    
    for (const pending of expired) {
      if (pending.adRequest) {
        // Procesar sin trigger contextual
        const fakeComplete: PendingRequest = {
          ...pending,
          contextualTrigger: undefined,
        };
        await this.processEnrichedRequest(fakeComplete);
      }
    }

    if (expired.length > 0) {
      this.log(`Processed ${expired.length} expired requests without contextual triggers`);
    }
  }

  /**
   * Obtiene el historial del usuario desde Redis o cache
   */
  private async getUserHistory(userId: string): Promise<UserHistoryContext | undefined> {
    // Primero revisar cache local
    if (this.userHistoryCache.has(userId)) {
      return this.userHistoryCache.get(userId);
    }

    // TODO: En producción, consultar Redis para historial real
    // Por ahora retornamos un placeholder
    return {
      previousInteractions: 0,
      narrativeState: undefined,
      lastInteractionTimestamp: undefined,
    };
  }

  /**
   * Infiere segmentos de audiencia basado en el contexto
   */
  private inferAudienceSegments(pending: PendingRequest): string[] {
    const segments: string[] = [];
    const { adRequest, contextualTrigger } = pending;

    // Segmentos basados en dispositivo
    if (adRequest.deviceInfo.type === 'mobile') {
      segments.push('mobile_users');
    } else if (adRequest.deviceInfo.type === 'desktop') {
      segments.push('desktop_users');
    }

    // Segmentos basados en contexto
    if (contextualTrigger) {
      switch (contextualTrigger.contextType) {
        case 'in_transit':
          segments.push('commuters', 'mobile_first');
          break;
        case 'at_home':
          segments.push('at_home', 'second_screen');
          break;
        case 'at_work':
          segments.push('professionals', 'b2b_potential');
          break;
        case 'shopping':
          segments.push('shoppers', 'high_intent');
          break;
        case 'entertainment':
          segments.push('entertainment_seekers');
          break;
      }

      // Alta receptividad si confidence > 0.8
      if (contextualTrigger.confidence > 0.8) {
        segments.push('high_receptivity');
      }
    }

    // Segmentos basados en contenido de página
    if (adRequest.pageContext.category) {
      segments.push(`content_${adRequest.pageContext.category}`);
    }

    return segments;
  }

  private log(message: string): void {
    if (this.config.verboseLogging) {
      logger.info(`[Cortex-StreamProcessor] ${message}`);
    }
  }
}

// ============================================================================
// SINGLETON Y FACTORY
// ============================================================================

let streamProcessorInstance: CortexStreamProcessor | null = null;

/**
 * Obtiene la instancia del procesador de flujo (singleton)
 */
export function getCortexStreamProcessor(
  config?: Partial<StreamProcessorConfig>
): CortexStreamProcessor {
  if (!streamProcessorInstance) {
    streamProcessorInstance = new CortexStreamProcessor(config);
  }
  return streamProcessorInstance;
}

/**
 * Inicia el procesador de flujo
 */
export function startStreamProcessor(
  config?: Partial<StreamProcessorConfig>
): CortexStreamProcessor {
  const processor = getCortexStreamProcessor(config);
  processor.start();
  return processor;
}

/**
 * Detiene el procesador de flujo
 */
export function stopStreamProcessor(): void {
  if (streamProcessorInstance) {
    streamProcessorInstance.stop();
  }
}

export default CortexStreamProcessor;
