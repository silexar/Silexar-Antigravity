// Publicador de Eventos (Event Bus Mock) TIER 0
import { DomainEvent } from '../../domain/events/DomainEvent';
import { logger } from '@/lib/observability';

export interface IEventPublisher {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
}

export class EventBusPublisher implements IEventPublisher {
  async publish(event: DomainEvent): Promise<void> {
    logger.info(`[EventBus] Publicando evento interno: ${event.constructor.name} - ${event.ocurredOn.toISOString()}`);
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}
