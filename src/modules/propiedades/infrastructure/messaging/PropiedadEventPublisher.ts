import { IDomainEvent } from '../../../../core/domain/Entity';
import { logger } from '@/lib/observability';

/**
 * MESSAGING: Event Bus de Dominio (Publisher TIER 0)
 * 
 * Implementación central para despachar Eventos de Dominio disparados por las entidades
 * hacia Message Brokers reales (Kafka, RabbitMQ, o EventBridge) en producción.
 */
export class PropiedadEventPublisher {
  
  public static publishAll(events: IDomainEvent[]): void {
    events.forEach(event => {
      this.publish(event);
    });
  }

  private static publish(event: IDomainEvent): void {
    // 1. Obtener el nombre de la clase del evento (Ej: PropiedadCreadaEvent)
    const eventName = event.constructor.name;
    
    // 2. Trazabilidad en consola para Dev
    logger.info(`[EventBus/TIER0] Publicando evento asíncrono: ${eventName} | AggregateID: ${event.getAggregateId()}`);

    // 3. (Futuro) Aquí se despacharía hacia el broker externo:
    // await kafkaProducer.send({ topic: 'propiedades.events', messages: [ { value: event } ] });
  }
}
