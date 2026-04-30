import { AppError } from './AppError';

export class BadRequestError extends AppError {
    public readonly reason?: string;

    constructor(
        message: string = 'Bad request',
        reason?: string,
        context?: Record<string, unknown>
    ) {
        super(message, 'BAD_REQUEST', 400, true, context);
        this.name = 'BadRequestError';
        this.reason = reason;
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }

    toJSON(): Record<string, unknown> {
        return {
            ...super.toJSON(),
            reason: this.reason,
        };
    }
}
