/**
 * MESSAGING: CUNA EVENT PUBLISHER — TIER 0
 *
 * Publicador de eventos de dominio del módulo Cuñas.
 * Desacopla los domain events del bus de eventos de infraestructura.
 * En producción, puede usar un bus en memoria, Redis Pub/Sub o un
 * message broker como RabbitMQ / Kafka.
 */

import type { CunaAprobadaEvent } from '../../domain/events/CunaAprobadaEvent';
import type { CunaEnAireEvent } from '../../domain/events/CunaEnAireEvent';
import type { CunaVencidaEvent } from '../../domain/events/CunaVencidaEvent';

export type CunaDomainEvent =
  | CunaAprobadaEvent
  | CunaEnAireEvent
  | CunaVencidaEvent;

export type EventHandler<T extends CunaDomainEvent = CunaDomainEvent> = (
  event: T
) => Promise<void>;

/**
 * Bus de eventos en memoria para desarrollo y testing.
 * Reemplazar por implementación de broker real en producción.
 */
class InMemoryEventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  subscribe<T extends CunaDomainEvent>(eventName: string, handler: EventHandler<T>): void {
    const existing = this.handlers.get(eventName) ?? [];
    this.handlers.set(eventName, [...existing, handler as EventHandler]);
  }

  async publish(event: CunaDomainEvent): Promise<void> {
    const eventName = event.constructor.name;
    const handlers = this.handlers.get(eventName) ?? [];

    await Promise.allSettled(
      handlers.map(handler =>
        handler(event).catch(err =>
          console.error(`[EventBus] Error en handler para ${eventName}:`, err)
        )
      )
    );
  }
}

// Singleton del bus de eventos
const eventBus = new InMemoryEventBus();

export class CunaEventPublisher {
  /**
   * Publica un evento CunaAprobada.
   * Notifica a: AlertaVencimientos, WideOrbit, Email al anunciante.
   */
  static async publicarCunaAprobada(event: CunaAprobadaEvent): Promise<void> {
    console.info(`[CunaEventPublisher] CunaAprobada: cunaId=${event.cunaId}`);
    await eventBus.publish(event);
  }

  /**
   * Publica un evento CunaEnAire.
   * Notifica a: sistemas de broadcast, dashboard de operaciones.
   */
  static async publicarCunaEnAire(event: CunaEnAireEvent): Promise<void> {
    console.info(`[CunaEventPublisher] CunaEnAire: cunaId=${event.cunaId}`);
    await eventBus.publish(event);
  }

  /**
   * Publica un evento CunaVencida.
   * Notifica a: módulo Vencimientos, alertas gerenciales, ejecutivo.
   */
  static async publicarCunaVencida(event: CunaVencidaEvent): Promise<void> {
    console.info(`[CunaEventPublisher] CunaVencida: cunaId=${event.cunaId}`);
    await eventBus.publish(event);
  }

  /** Registra un handler para un tipo de evento específico */
  static suscribir<T extends CunaDomainEvent>(
    eventName: string,
    handler: EventHandler<T>
  ): void {
    eventBus.subscribe(eventName, handler);
  }
}
