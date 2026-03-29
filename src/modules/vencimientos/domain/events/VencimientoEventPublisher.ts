import { logger } from '@/lib/observability';
/**
 * DOMAIN EVENT: VENCIMIENTO EVENT PUBLISHER - TIER 0 ENTERPRISE
 *
 * @description Publica eventos de dominio cuando un auspicio vence,
 * se acerca al vencimiento, o cambia su estado de vigencia.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

export interface VencimientoEvent {
  id: string
  type: string
  aggregateId: string
  timestamp: Date
  payload: Record<string, unknown>
  metadata: {
    correlationId: string
    causationId?: string
    userId?: string
    source: string
    version: number
  }
}

export type VencimientoEventType =
  | 'VencimientoProximo'
  | 'VencimientoAlcanzado'
  | 'AuspicioExpirado'
  | 'Countdown48hIniciado'
  | 'Countdown48hExpirado'
  | 'AuspicioEliminadoPorNoInicio'
  | 'ExtensionSolicitada'
  | 'ExtensionAprobada'
  | 'ExtensionRechazada'

type EventHandler = (event: VencimientoEvent) => Promise<void>

export class VencimientoEventPublisher {
  private handlers = new Map<string, EventHandler[]>()
  private eventLog: VencimientoEvent[] = []

  subscribe(eventType: VencimientoEventType, handler: EventHandler): () => void {
    const existing = this.handlers.get(eventType) || []
    existing.push(handler)
    this.handlers.set(eventType, existing)
    return () => {
      const handlers = this.handlers.get(eventType) || []
      this.handlers.set(eventType, handlers.filter(h => h !== handler))
    }
  }

  async publish(eventType: VencimientoEventType, aggregateId: string, payload: Record<string, unknown>, userId?: string): Promise<void> {
    const event: VencimientoEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      type: eventType,
      aggregateId,
      timestamp: new Date(),
      payload,
      metadata: {
        correlationId: `cor_${Date.now()}`,
        userId,
        source: 'vencimientos',
        version: 1
      }
    }

    this.eventLog.push(event)
    logger.info(`[VencimientoEvent] ${eventType} | Aggregate: ${aggregateId}`)

    const handlers = this.handlers.get(eventType) || []
    await Promise.allSettled(handlers.map(h => h(event)))
  }

  getEventLog(limit = 50): VencimientoEvent[] {
    return this.eventLog.slice(-limit)
  }

  clearEventLog(): void {
    this.eventLog = []
  }
}
