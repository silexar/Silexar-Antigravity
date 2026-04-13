// CQRS interfaces — Command Query Responsibility Segregation

// Marker interface for commands (write operations).
// Intentionally empty — used for type-level tagging only.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ICommand {}

// Marker interface for queries (read operations).
// TResult is a phantom type used by IQueryHandler to infer the return type.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IQuery<TResult = unknown> {
  // Phantom property — never instantiated, used only for type inference.
  readonly _result?: TResult;
}

export interface ICommandHandler<TCommand extends ICommand, TResult = void> {
  execute(command: TCommand): Promise<TResult>;
}

export interface IQueryHandler<TQuery extends IQuery<TResult>, TResult = unknown> {
  execute(query: TQuery): Promise<TResult>;
}
