/**
 * Base DomainEvent for the vencimientos module.
 * All domain events in this module extend this class.
 */
export abstract class DomainEvent {
  public readonly occurredAt: Date = new Date()
  public readonly ocurredOn: Date = this.occurredAt
  public abstract readonly eventName: string
}
