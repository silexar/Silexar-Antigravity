import { AppError } from './AppError';

export class ValidationError extends AppError {
    public readonly errors?: Array<{ field: string; message: string }>;

    constructor(
        message: string = 'Validation failed',
        errors?: Array<{ field: string; message: string }>,
        context?: Record<string, unknown>
    ) {
        super(message, 'VALIDATION_ERROR', 422, true, context);
        this.name = 'ValidationError';
        this.errors = errors;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }

    toJSON(): Record<string, unknown> {
        return {
            ...super.toJSON(),
            errors: this.errors,
        };
    }
}
