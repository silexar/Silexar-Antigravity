import { AppError } from './AppError';

export class ConflictError extends AppError {
    public readonly conflictingResource?: string;

    constructor(
        message: string = 'Resource conflict',
        conflictingResource?: string,
        context?: Record<string, unknown>
    ) {
        super(message, 'CONFLICT', 409, true, context);
        this.name = 'ConflictError';
        this.conflictingResource = conflictingResource;
        Object.setPrototypeOf(this, ConflictError.prototype);
    }

    toJSON(): Record<string, unknown> {
        return {
            ...super.toJSON(),
            conflictingResource: this.conflictingResource,
        };
    }
}
