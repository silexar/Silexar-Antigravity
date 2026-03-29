/**
 * SILEXAR PULSE - TIER0+ CORTEX EVENT BUS (REDIS IMPLEMENTATION)
 * Implementación de producción usando Redis Pub/Sub
 * 
 * Este módulo provee la implementación real del bus de eventos
 * usando Redis Pub/Sub para alta velocidad y escalabilidad.
 * 
 * @version 2.0.0
 * @author Silexar Pulse Team
 */

import { logger } from '@/lib/observability';
import type {
  CortexEventBus,
  CortexTopic,
  EventHandler,
  EventBusStats,
} from './cortex-event-bus';

// ============================================================================
// CONFIGURACIÓN DE REDIS
// ============================================================================

export interface RedisEventBusConfig {
  readonly host: string;
  readonly port: number;
  readonly password?: string;
  readonly db?: number;
  readonly keyPrefix?: string;
  readonly retryAttempts?: number;
  readonly retryDelayMs?: number;
  readonly connectionTimeout?: number;
  readonly enableTLS?: boolean;
}

const DEFAULT_CONFIG: RedisEventBusConfig = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB ?? '0', 10),
  keyPrefix: 'cortex:',
  retryAttempts: 5,
  retryDelayMs: 1000,
  connectionTimeout: 10000,
  enableTLS: process.env.REDIS_TLS === 'true',
};

// ============================================================================
// IMPLEMENTACIÓN REDIS PUB/SUB
// ============================================================================

/**
 * Implementación del bus de eventos usando Redis Pub/Sub
 * Para uso en producción con alta concurrencia
 */
export class RedisEventBus implements CortexEventBus {
  private publisher: RedisClientType | null = null;
  private subscriber: RedisClientType | null = null;
  private handlers: Map<string, Set<EventHandler<unknown>>> = new Map();
  private config: RedisEventBusConfig;
  private connected = false;
  private stats: EventBusStats = {
    publishedCount: 0,
    receivedCount: 0,
    errorCount: 0,
    activeSubscriptions: 0,
    averageLatencyMs: 0,
  };
  private latencies: number[] = [];

  constructor(config: Partial<RedisEventBusConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Inicializa las conexiones Redis
   */
  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      // Importación dinámica para evitar errores en cliente
      const redis = await import('redis');
      
      const clientOptions = {
        socket: {
          host: this.config.host,
          port: this.config.port,
          connectTimeout: this.config.connectionTimeout,
          ...(this.config.enableTLS && { tls: true }),
        },
        ...(this.config.password && { password: this.config.password }),
        database: this.config.db,
      };

      // Crear cliente para publicar
      this.publisher = redis.createClient(clientOptions) as unknown as RedisClientType;
      await this.publisher.connect();

      // Crear cliente separado para suscripciones
      this.subscriber = redis.createClient(clientOptions) as unknown as RedisClientType;
      await this.subscriber.connect();

      // Configurar manejo de errores
      this.publisher.on('error', (err: Error) => {
        logger.error('[Cortex-Context Redis] Publisher error:', err instanceof Error ? err as Error : undefined);
        this.stats = { ...this.stats, errorCount: this.stats.errorCount + 1 };
      });

      this.subscriber.on('error', (err: Error) => {
        logger.error('[Cortex-Context Redis] Subscriber error:', err instanceof Error ? err as Error : undefined);
        this.stats = { ...this.stats, errorCount: this.stats.errorCount + 1 };
      });

      this.connected = true;
      logger.info('[Cortex-Context] Redis Event Bus connected successfully');
    } catch (error) {
      logger.error('[Cortex-Context] Failed to connect to Redis:', error instanceof Error ? error as Error : undefined);
      throw error;
    }
  }

  /**
   * Cierra las conexiones Redis
   */
  async disconnect(): Promise<void> {
    if (this.publisher) {
      await this.publisher.quit();
      this.publisher = null;
    }
    if (this.subscriber) {
      await this.subscriber.quit();
      this.subscriber = null;
    }
    this.connected = false;
    logger.info('[Cortex-Context] Redis Event Bus disconnected');
  }

  async publish<T>(topic: CortexTopic, event: T): Promise<void> {
    if (!this.connected || !this.publisher) {
      throw new Error('[Cortex-Context] Redis not connected. Call connect() first.');
    }

    const startTime = performance.now();
    const channel = `${this.config.keyPrefix}${topic}`;

    try {
      const message = JSON.stringify({
        topic,
        data: event,
        timestamp: new Date().toISOString(),
        source: 'cortex-event-bus',
      });

      await this.publisher.publish(channel, message);

      const latency = performance.now() - startTime;
      this.recordLatency(latency);

      this.stats = {
        ...this.stats,
        publishedCount: this.stats.publishedCount + 1,
        lastEventTimestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(`[Cortex-Context] Publish error for topic ${topic}:`, error instanceof Error ? error as Error : undefined);
      this.stats = { ...this.stats, errorCount: this.stats.errorCount + 1 };
      throw error;
    }
  }

  subscribe<T>(topic: CortexTopic, handler: EventHandler<T>): () => void {
    if (!this.subscriber) {
      throw new Error('[Cortex-Context] Redis not connected. Call connect() first.');
    }

    const channel = `${this.config.keyPrefix}${topic}`;

    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set());

      // Solo suscribirse al canal de Redis si es la primera suscripción a este topic
      this.subscriber.subscribe(channel, (message: string) => {
        try {
          const parsed = JSON.parse(message);
          const topicHandlers = this.handlers.get(topic);
          
          if (topicHandlers) {
            topicHandlers.forEach(async (h) => {
              try {
                await h(parsed.data);
                this.stats = { ...this.stats, receivedCount: this.stats.receivedCount + 1 };
              } catch (handlerError) {
                logger.error(`[Cortex-Context] Handler error:`, handlerError instanceof Error ? handlerError as Error : undefined);
                this.stats = { ...this.stats, errorCount: this.stats.errorCount + 1 };
              }
            });
          }
        } catch (parseError) {
          logger.error('[Cortex-Context] Failed to parse message:', parseError instanceof Error ? parseError as Error : undefined);
          this.stats = { ...this.stats, errorCount: this.stats.errorCount + 1 };
        }
      });
    }

    const handlers = this.handlers.get(topic)!;
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

      // Si no hay más handlers para este topic, cancelar suscripción de Redis
      if (handlers.size === 0) {
        this.subscriber?.unsubscribe(channel);
        this.handlers.delete(topic);
      }
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

  private recordLatency(latency: number): void {
    this.latencies.push(latency);
    if (this.latencies.length > 100) {
      this.latencies.shift();
    }
    this.stats = {
      ...this.stats,
      averageLatencyMs: this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length,
    };
  }
}

// ============================================================================
// TIPO AUXILIAR PARA REDIS CLIENT
// ============================================================================

interface RedisClientType {
  connect(): Promise<void>;
  quit(): Promise<void>;
  publish(channel: string, message: string): Promise<number>;
  subscribe(channel: string, listener: (message: string) => void): Promise<void>;
  unsubscribe(channel: string): Promise<void>;
  on(event: string, handler: (err: Error) => void): void;
}

// ============================================================================
// FACTORY PARA PRODUCCIÓN
// ============================================================================

let redisEventBusInstance: RedisEventBus | null = null;

/**
 * Obtiene o crea la instancia de Redis Event Bus para producción
 */
export async function getRedisEventBus(
  config?: Partial<RedisEventBusConfig>
): Promise<RedisEventBus> {
  if (!redisEventBusInstance) {
    redisEventBusInstance = new RedisEventBus(config);
    await redisEventBusInstance.connect();
  }
  return redisEventBusInstance;
}

/**
 * Cierra la conexión del bus de eventos Redis
 */
export async function closeRedisEventBus(): Promise<void> {
  if (redisEventBusInstance) {
    await redisEventBusInstance.disconnect();
    redisEventBusInstance = null;
  }
}

export default RedisEventBus;
