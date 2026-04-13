import { DomainEvent } from '../../domain/entities/base/AggregateRoot'
import { domainEventBus } from '@/lib/events/DomainEventBus'

export class DomainEventPublisher {
  private static inMemoryHandlers: Map<string, Array<(e: DomainEvent) => Promise<void> | void>> = new Map()

  /** Register an in-process handler (legacy API — prefer domainEventBus.subscribe()). */
  public static subscribe(
    eventName: string,
    handler: (event: DomainEvent) => Promise<void> | void
  ): void {
    const current = this.inMemoryHandlers.get(eventName) ?? []
    this.inMemoryHandlers.set(eventName, [...current, handler])
  }

  public static async publish(event: DomainEvent): Promise<void> {
    const eventName = event.constructor.name

    await domainEventBus.publish({
      eventName,
      occurredAt: event.occurredOn.toISOString(),
      data: event as unknown as Record<string, unknown>,
    })

    // Also fire any legacy in-process handlers registered via this class
    const handlers = this.inMemoryHandlers.get(eventName) ?? []
    for (const handler of handlers) {
      await handler(event)
    }
  }
}
