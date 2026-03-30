export { ProyectoCreativoHandler } from './ProyectoCreativoHandler';

export interface HandlerResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export type CommandHandler<TCommand, TResult> = {
    handle(command: TCommand): Promise<HandlerResult<TResult>>;
};