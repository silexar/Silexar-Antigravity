import { DomainEvent } from "../../domain/entities/base/AggregateRoot";
import { logger } from '@/lib/observability';

export class DomainEventPublisher {
  private static handlers: Map<string, Function[]> = new Map();

  public static subscribe(eventName: string, handler: Function): void {
    const current = this.handlers.get(eventName) || [];
    this.handlers.set(eventName, [...current, handler]);
  }

  public static async publish(event: DomainEvent): Promise<void> {
    const eventName = event.constructor.name;
    logger.info(`[EventPublisher] Publicando evento: ${eventName}`);
    
    const handlers = this.handlers.get(eventName) || [];
    for (const handler of handlers) {
      await handler(event);
    }
  }
}
