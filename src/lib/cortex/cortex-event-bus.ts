/**
 * SILEXAR PULSE - TIER0+ CORTEX EVENT BUS
 * Sistema de Bus de Eventos en Tiempo Real
 * 
 * Implementación del Cortex-Context según la visión original:
 * - Bus de eventos central para comunicación en tiempo real
 * - Topics definidos: ad_requests, contextual_triggers, user_interactions
 * - Integración con Redis Pub/Sub para alta velocidad
 * 
 * @version 2.0.0
 * @author Silexar Pulse Team
 */

'use client';

// ============================================================================
// TIPOS Y ESQUEMAS DE EVENTOS (según visión original)
// ============================================================================

/**
 * Evento de solicitud de anuncio - Topic: ad_requests
 */
export interface AdRequestEvent {
  readonly requestId: string;
  readonly userId: string; // hashed_id
  readonly placementId: string;
  readonly deviceInfo: DeviceInfo;
  readonly timestamp: string; // ISO date
  readonly sessionId: string;
  readonly pageContext: PageContext;
}

/**
 * Información del dispositivo
 */
export interface DeviceInfo {
  readonly type: 'mobile' | 'tablet' | 'desktop' | 'smart_tv' | 'other';
  readonly os: string;
  readonly osVersion: string;
  readonly browser?: string;
  readonly browserVersion?: string;
  readonly screenWidth: number;
  readonly screenHeight: number;
  readonly connectionType?: 'wifi' | '4g' | '3g' | '2g' | 'ethernet' | 'unknown';
}

/**
 * Contexto de la página
 */
export interface PageContext {
  readonly url: string;
  readonly domain: string;
  readonly category?: string;
  readonly keywords?: string[];
  readonly contentType?: 'article' | 'video' | 'audio' | 'social' | 'commerce' | 'other';
}

/**
 * Evento de trigger contextual - Topic: contextual_triggers
 * Enviado por el SDK móvil a través del gateway
 */
export interface ContextualTriggerEvent {
  readonly requestId: string;
  readonly contextType: ContextType;
  readonly confidence: number; // 0-1
  readonly sensorData?: SensorData;
  readonly timestamp: string;
}

export type ContextType = 
  | 'in_transit'     // Usuario en movimiento/transporte
  | 'stationary'     // Usuario estático
  | 'at_home'        // Detectado en hogar (segunda pantalla)
  | 'at_work'        // Detectado en lugar de trabajo
  | 'commuting'      // En trayecto regular
  | 'shopping'       // En zona comercial
  | 'entertainment'  // En zona de entretenimiento
  | 'outdoor'        // Actividad exterior
  | 'unknown';

/**
 * Datos de sensores (anonimizados y agregados)
 */
export interface SensorData {
  readonly activityLevel: 'low' | 'medium' | 'high';
  readonly ambientLight?: 'dark' | 'dim' | 'bright';
  readonly noiseLevelCategory?: 'quiet' | 'moderate' | 'loud';
}

/**
 * Evento de interacción del usuario - Topic: user_interactions
 */
export interface UserInteractionEvent {
  readonly requestId: string;
  readonly interactionType: InteractionType;
  readonly creativeId: string;
  readonly timestamp: string;
  readonly metadata?: InteractionMetadata;
}

export type InteractionType = 
  | 'impression'
  | 'viewable_impression'
  | 'click'
  | 'video_start'
  | 'video_25'
  | 'video_50'
  | 'video_75'
  | 'video_complete'
  | 'audio_start'
  | 'audio_complete'
  | 'engagement'
  | 'conversion'
  | 'skip'
  | 'mute'
  | 'unmute'
  | 'expand'
  | 'collapse'
  | 'custom';

export interface InteractionMetadata {
  readonly viewTimeMs?: number;
  readonly scrollDepth?: number;
  readonly customEventName?: string;
  readonly customEventValue?: string | number;
}

/**
 * Evento de progreso narrativo - Topic: narrative_progress
 */
export interface NarrativeProgressEvent {
  readonly requestId: string;
  readonly userId: string;
  readonly campaignId: string;
  readonly currentNodeId: string;
  readonly previousNodeId?: string;
  readonly transitionRule: string;
  readonly timestamp: string;
  readonly narrativeStage: number;
  readonly isCompletion: boolean;
}

/**
 * Evento de decisión publicitaria - Topic: ad_decisions
 * Respuesta del Cortex-Orchestrator
 */
export interface AdDecisionEvent {
  readonly requestId: string;
  readonly creativeId: string;
  readonly campaignId: string;
  readonly confidence: number;
  readonly decisionTimeMs: number;
  readonly optimizationType: 'narrative' | 'mab' | 'contextual' | 'standard';
  readonly metadata?: Record<string, unknown>;
}

/**
 * Solicitud enriquecida - Topic: enriched_ad_requests
 */
export interface EnrichedAdRequestEvent extends AdRequestEvent {
  readonly contextualTrigger?: ContextualTriggerEvent;
  readonly userHistory?: UserHistoryContext;
  readonly audienceSegments?: string[];
}

export interface UserHistoryContext {
  readonly previousInteractions: number;
  readonly narrativeState?: {
    readonly campaignId: string;
    readonly currentNodeId: string;
    readonly nodesVisited: string[];
  };
  readonly lastInteractionTimestamp?: string;
}

// ============================================================================
// TIPOS DE TOPICS
// ============================================================================

export const CORTEX_TOPICS = {
  AD_REQUESTS: 'silexar:ad_requests',
  CONTEXTUAL_TRIGGERS: 'silexar:contextual_triggers',
  USER_INTERACTIONS: 'silexar:user_interactions',
  NARRATIVE_PROGRESS: 'silexar:narrative_progress',
  ENRICHED_AD_REQUESTS: 'silexar:enriched_ad_requests',
  AD_DECISIONS: 'silexar:ad_decisions',
  BILLING_EVENTS: 'silexar:billing_events',
  SYSTEM_ALERTS: 'silexar:system_alerts',
} as const;

export type CortexTopic = typeof CORTEX_TOPICS[keyof typeof CORTEX_TOPICS];

// ============================================================================
// UNION TYPE PARA TODOS LOS EVENTOS
// ============================================================================

export type CortexEvent = 
  | { topic: typeof CORTEX_TOPICS.AD_REQUESTS; data: AdRequestEvent }
  | { topic: typeof CORTEX_TOPICS.CONTEXTUAL_TRIGGERS; data: ContextualTriggerEvent }
  | { topic: typeof CORTEX_TOPICS.USER_INTERACTIONS; data: UserInteractionEvent }
  | { topic: typeof CORTEX_TOPICS.NARRATIVE_PROGRESS; data: NarrativeProgressEvent }
  | { topic: typeof CORTEX_TOPICS.ENRICHED_AD_REQUESTS; data: EnrichedAdRequestEvent }
  | { topic: typeof CORTEX_TOPICS.AD_DECISIONS; data: AdDecisionEvent };

// ============================================================================
// INTERFAZ DEL BUS DE EVENTOS
// ============================================================================

export type EventHandler<T> = (event: T) => void | Promise<void>;

export interface CortexEventBus {
  /**
   * Publicar un evento a un topic específico
   */
  publish<T>(topic: CortexTopic, event: T): Promise<void>;
  
  /**
   * Suscribirse a un topic para recibir eventos
   */
  subscribe<T>(topic: CortexTopic, handler: EventHandler<T>): () => void;
  
  /**
   * Suscribirse a múltiples topics
   */
  subscribeMultiple(topics: CortexTopic[], handler: EventHandler<unknown>): () => void;
  
  /**
   * Verificar si el bus está conectado
   */
  isConnected(): boolean;
  
  /**
   * Obtener estadísticas del bus
   */
  getStats(): EventBusStats;
}

export interface EventBusStats {
  readonly publishedCount: number;
  readonly receivedCount: number;
  readonly errorCount: number;
  readonly activeSubscriptions: number;
  readonly lastEventTimestamp?: string;
  readonly averageLatencyMs: number;
}

// ============================================================================
// IMPLEMENTACIÓN IN-MEMORY (para desarrollo y testing)
// ============================================================================

class InMemoryEventBus implements CortexEventBus {
  private subscribers: Map<string, Set<EventHandler<unknown>>> = new Map();
  private stats: EventBusStats = {
    publishedCount: 0,
    receivedCount: 0,
    errorCount: 0,
    activeSubscriptions: 0,
    averageLatencyMs: 0,
  };
  private latencies: number[] = [];
  private connected = true;

  async publish<T>(topic: CortexTopic, event: T): Promise<void> {
    const startTime = performance.now();
    
    try {
      const handlers = this.subscribers.get(topic);
      if (handlers) {
        const promises = Array.from(handlers).map(async (handler) => {
          try {
            await handler(event);
            this.stats = { ...this.stats, receivedCount: this.stats.receivedCount + 1 };
          } catch (error) {
            logger.error(`[Cortex-Context] Handler error for topic ${topic}:`, error instanceof Error ? error : undefined);
            this.stats = { ...this.stats, errorCount: this.stats.errorCount + 1 };
          }
        });
        await Promise.all(promises);
      }
      
      const latency = performance.now() - startTime;
      this.latencies.push(latency);
      if (this.latencies.length > 100) this.latencies.shift();
      
      this.stats = {
        ...this.stats,
        publishedCount: this.stats.publishedCount + 1,
        lastEventTimestamp: new Date().toISOString(),
        averageLatencyMs: this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length,
      };
    } catch (error) {
      logger.error(`[Cortex-Context] Publish error for topic ${topic}:`, error instanceof Error ? error : undefined);
      this.stats = { ...this.stats, errorCount: this.stats.errorCount + 1 };
      throw error;
    }
  }

  subscribe<T>(topic: CortexTopic, handler: EventHandler<T>): () => void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    
    const handlers = this.subscribers.get(topic)!;
    handlers.add(handler as EventHandler<unknown>);
    
    this.stats = { 
      ...this.stats, 
      activeSubscriptions: this.stats.activeSubscriptions + 1 
    };
    
    // Retorna función de unsubscribe
    return () => {
      handlers.delete(handler as EventHandler<unknown>);
      this.stats = { 
        ...this.stats, 
        activeSubscriptions: Math.max(0, this.stats.activeSubscriptions - 1) 
      };
    };
  }

  subscribeMultiple(topics: CortexTopic[], handler: EventHandler<unknown>): () => void {
    const unsubscribes = topics.map(topic => this.subscribe(topic, handler));
    return () => unsubscribes.forEach(unsub => unsub());
  }

  isConnected(): boolean {
    return this.connected;
  }

  getStats(): EventBusStats {
    return { ...this.stats };
  }
}

// ============================================================================
// SINGLETON Y FACTORY
// ============================================================================

let eventBusInstance: CortexEventBus | null = null;

/**
 * Obtiene la instancia del bus de eventos (singleton)
 */
export function getCortexEventBus(): CortexEventBus {
  if (!eventBusInstance) {
    // En desarrollo usamos InMemory, en producción se usará Redis
    eventBusInstance = new InMemoryEventBus();
    logger.info('[Cortex-Context] Event Bus initialized (in-memory mode)');
  }
  return eventBusInstance;
}

/**
 * Reinicia el bus de eventos (para testing)
 */
export function resetCortexEventBus(): void {
  eventBusInstance = null;
}

// ============================================================================
// HOOKS DE REACT PARA USO EN COMPONENTES
// ============================================================================

import { useEffect, useState, useCallback, useRef } from 'react';
import { logger } from '@/lib/observability';

/**
 * Hook para publicar eventos al bus
 */
export function useCortexPublisher() {
  const bus = getCortexEventBus();
  
  const publish = useCallback(async <T>(topic: CortexTopic, event: T) => {
    await bus.publish(topic, event);
  }, [bus]);
  
  return { publish, isConnected: bus.isConnected() };
}

/**
 * Hook para suscribirse a eventos
 */
export function useCortexSubscription<T>(
  topic: CortexTopic | CortexTopic[],
  handler: EventHandler<T>
): { isConnected: boolean; stats: EventBusStats } {
  const bus = getCortexEventBus();
  const handlerRef = useRef(handler);
  const [stats, setStats] = useState<EventBusStats>(bus.getStats());
  
  // Mantener referencia actualizada del handler
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);
  
  useEffect(() => {
    const topics = Array.isArray(topic) ? topic : [topic];
    const wrappedHandler: EventHandler<T> = (event) => {
      handlerRef.current(event);
      setStats(bus.getStats());
    };
    
    const unsubscribe = Array.isArray(topic)
      ? bus.subscribeMultiple(topics, wrappedHandler as EventHandler<unknown>)
      : bus.subscribe(topic, wrappedHandler);
    
    return unsubscribe;
  }, [topic, bus]);
  
  return { 
    isConnected: bus.isConnected(), 
    stats 
  };
}

/**
 * Hook para obtener estadísticas del bus
 */
export function useCortexStats(): EventBusStats {
  const bus = getCortexEventBus();
  const [stats, setStats] = useState<EventBusStats>(bus.getStats());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(bus.getStats());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [bus]);
  
  return stats;
}

// ============================================================================
// UTILIDADES PARA CREAR EVENTOS
// ============================================================================

/**
 * Genera un ID único para requests
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Crea un evento de solicitud de anuncio
 */
export function createAdRequestEvent(
  userId: string,
  placementId: string,
  deviceInfo: DeviceInfo,
  pageContext: PageContext,
  sessionId?: string
): AdRequestEvent {
  return {
    requestId: generateRequestId(),
    userId,
    placementId,
    deviceInfo,
    pageContext,
    sessionId: sessionId ?? `session_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Crea un evento de interacción
 */
export function createUserInteractionEvent(
  requestId: string,
  creativeId: string,
  interactionType: InteractionType,
  metadata?: InteractionMetadata
): UserInteractionEvent {
  return {
    requestId,
    interactionType,
    creativeId,
    timestamp: new Date().toISOString(),
    metadata,
  };
}

/**
 * Crea un evento de trigger contextual
 */
export function createContextualTriggerEvent(
  requestId: string,
  contextType: ContextType,
  confidence: number,
  sensorData?: SensorData
): ContextualTriggerEvent {
  return {
    requestId,
    contextType,
    confidence,
    sensorData,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Crea un evento de progreso narrativo
 */
export function createNarrativeProgressEvent(
  userId: string,
  campaignId: string,
  currentNodeId: string,
  previousNodeId: string | undefined,
  transitionRule: string,
  narrativeStage: number,
  isCompletion: boolean = false
): NarrativeProgressEvent {
  return {
    requestId: generateRequestId(),
    userId,
    campaignId,
    currentNodeId,
    previousNodeId,
    transitionRule,
    timestamp: new Date().toISOString(),
    narrativeStage,
    isCompletion,
  };
}

// ============================================================================
// EXPORTACIÓN POR DEFECTO
// ============================================================================

export default getCortexEventBus;
