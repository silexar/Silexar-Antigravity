import { DomainEvent } from '../../domain/events/DomainEvent'
import { domainEventBus } from '@/lib/events/DomainEventBus'

export interface IEventPublisher {
  publish(event: DomainEvent): Promise<void>
  publishAll(events: DomainEvent[]): Promise<void>
}

export class EventBusPublisher implements IEventPublisher {
  async publish(event: DomainEvent): Promise<void> {
    await domainEventBus.publish({
      eventName: event.eventName ?? event.constructor.name,
      occurredAt: event.occurredAt.toISOString(),
      data: event as unknown as Record<string, unknown>,
    })
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    await domainEventBus.publishAll(
      events.map((e) => ({
        eventName: e.eventName ?? e.constructor.name,
        occurredAt: e.occurredAt.toISOString(),
        data: e as unknown as Record<string, unknown>,
      }))
    )
  }
}
