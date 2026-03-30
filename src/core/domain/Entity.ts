export interface IDomainEvent {
  dateTimeOccurred: Date;
  getAggregateId(): string;
}

export abstract class Entity<T> {
  protected readonly _id: string;
  protected readonly props: T;
  private _domainEvents: IDomainEvent[] = [];

  constructor(props: T, id: string) {
    this._id = id;
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  get domainEvents(): IDomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: IDomainEvent): void {
    // Add the event to this entity's collection of domain events
    this._domainEvents.push(domainEvent);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }
}
