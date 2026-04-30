import { AppError } from './AppError';

export class UnauthorizedError extends AppError {
    public readonly reason?: string;

    constructor(
        message: string = 'Authentication required',
        reason?: string,
        context?: Record<string, unknown>
    ) {
        super(message, 'UNAUTHORIZED', 401, true, context);
        this.name = 'UnauthorizedError';
        this.reason = reason;
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }

    toJSON(): Record<string, unknown> {
        return {
            ...super.toJSON(),
            reason: this.reason,
        };
    }
}