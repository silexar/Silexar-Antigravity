import { ConciliacionCompletadaEvent } from "../../domain/entities/ConciliacionDiaria";
import { logger } from '@/lib/observability';

export interface IEventPublisher {
  publish(event: unknown): Promise<void>;
  publishAll(events: unknown[]): Promise<void>;
}

export class ConciliacionEventPublisher implements IEventPublisher {
  
  public async publish(event: unknown): Promise<void> {
    if (event instanceof ConciliacionCompletadaEvent) {
      logger.info(`[EventBus] ConciliacionCompletadaEvent publicado: ID ${event.conciliacionId} a las ${event.fecha.toISOString()}`);
      // Aquí se enviaría a SNS/SQS, Kafka, RabbitMQ, o un Event Emitter en memoria
    } else {
        logger.info(`[EventBus] Evento publicado no tipificado: ${JSON.stringify(event)}`);
    }
  }

  public async publishAll(events: unknown[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}
