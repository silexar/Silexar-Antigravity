/**
 * DomainEventBus — global event bus for DDD domain events.
 *
 * Architecture:
 *  - In-memory handlers: synchronous, called immediately within the same request.
 *    Useful for cross-module reactions that must complete before the response returns.
 *
 *  - Redis Streams (XADD): durable, append-only log on the `domain:events` stream.
 *    Async consumers (Kafka bridge, audit workers, etc.) can read and replay them.
 *    Falls back silently if Redis is unavailable — in-memory handlers still fire.
 *
 * Usage:
 *   import { domainEventBus } from '@/lib/events/DomainEventBus'
 *
 *   // Publish (from a command handler or aggregate):
 *   await domainEventBus.publish({
 *     eventName: 'CampanaActivated',
 *     tenantId: ctx.tenantId,
 *     aggregateId: campana.id,
 *     data: { estado: 'ACTIVA', ... },
 *   })
 *
 *   // Subscribe (on module bootstrap):
 *   const unsubscribe = domainEventBus.subscribe('CampanaActivated', async (event) => {
 *     await notifyVendedor(event.data)
 *   })
 */

import { getRedisClient } from '@/lib/cache/redis-client'
import { logger } from '@/lib/observability'
import { randomUUID } from 'crypto'

// ─── Public types ─────────────────────────────────────────────────────────────

export interface DomainEventPayload {
  /** Unique event id (auto-generated if omitted) */
  eventId?: string
  /** e.g. "CampanaActivated", "ContratoVencido" */
  eventName: string
  /** ISO-8601 timestamp (auto-set if omitted) */
  occurredAt?: string
  /** Tenant scope — used to route events to the correct consumer */
  tenantId?: string
  /** The aggregate that raised the event */
  aggregateId?: string
  /** Arbitrary event payload */
  data: Record<string, unknown>
}

/** Resolved event — all optional fields are guaranteed to be set */
export interface ResolvedDomainEvent extends Required<DomainEventPayload> {}

export type EventHandler = (event: ResolvedDomainEvent) => Promise<void> | void

// ─── Redis stream constants ───────────────────────────────────────────────────

const STREAM_KEY = 'domain:events'
/** Keep at most 10 000 events in the stream (older trimmed automatically). */
const STREAM_MAXLEN = 10_000

// ─── Bus implementation ───────────────────────────────────────────────────────

class DomainEventBusImpl {
  /** eventName → set of handlers registered in this process */
  private readonly handlers = new Map<string, Set<EventHandler>>()

  // ── publish ──────────────────────────────────────────────────────────────

  async publish(raw: DomainEventPayload): Promise<void> {
    const event: ResolvedDomainEvent = {
      eventId: raw.eventId ?? randomUUID(),
      eventName: raw.eventName,
      occurredAt: raw.occurredAt ?? new Date().toISOString(),
      tenantId: raw.tenantId ?? '',
      aggregateId: raw.aggregateId ?? '',
      data: raw.data,
    }

    // 1. Persist to Redis Streams for async consumers and replay capability
    await this.persistToRedis(event)

    // 2. Dispatch to in-process subscribers synchronously
    await this.dispatchLocally(event)
  }

  /** Publish multiple events in order — useful from aggregate roots. */
  async publishAll(events: DomainEventPayload[]): Promise<void> {
    for (const event of events) {
      await this.publish(event)
    }
  }

  // ── subscribe ─────────────────────────────────────────────────────────────

  /**
   * Register an in-memory handler for a specific event type.
   * Returns an unsubscribe function — call it to remove the handler.
   */
  subscribe(eventName: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set())
    }
    this.handlers.get(eventName)!.add(handler)

    return () => {
      this.handlers.get(eventName)?.delete(handler)
    }
  }

  /** Remove all in-process handlers (useful in tests). */
  clear(): void {
    this.handlers.clear()
  }

  // ── private ───────────────────────────────────────────────────────────────

  private async persistToRedis(event: ResolvedDomainEvent): Promise<void> {
    const redis = getRedisClient()
    if (!redis) return // Redis unavailable — in-memory handlers still run

    try {
      // XADD with MAXLEN to cap stream size
      await redis.xadd(
        STREAM_KEY,
        'MAXLEN',
        '~',
        String(STREAM_MAXLEN),
        '*', // auto-generate stream entry id
        'eventId', event.eventId,
        'eventName', event.eventName,
        'occurredAt', event.occurredAt,
        'tenantId', event.tenantId,
        'aggregateId', event.aggregateId,
        'data', JSON.stringify(event.data)
      )
    } catch (err) {
      // Log but never throw — a Redis failure must not break the business operation
      logger.error(
        '[DomainEventBus] Failed to persist event to Redis stream',
        err instanceof Error ? err : new Error(String(err))
      )
    }
  }

  private async dispatchLocally(event: ResolvedDomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName)
    if (!handlers || handlers.size === 0) return

    for (const handler of handlers) {
      try {
        await handler(event)
      } catch (err) {
        // Isolate handler failures — one broken handler must not affect others
        logger.error(
          `[DomainEventBus] Handler error for event "${event.eventName}"`,
          err instanceof Error ? err : new Error(String(err))
        )
      }
    }
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

export const domainEventBus = new DomainEventBusImpl()
