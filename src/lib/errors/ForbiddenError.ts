import { AppError } from './AppError';

export class ForbiddenError extends AppError {
    public readonly requiredPermission?: string;

    constructor(
        message: string = 'Insufficient permissions',
        requiredPermission?: string,
        context?: Record<string, unknown>
    ) {
        super(message, 'FORBIDDEN', 403, true, context);
        this.name = 'ForbiddenError';
        this.requiredPermission = requiredPermission;
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }

    toJSON(): Record<string, unknown> {
        return {
            ...super.toJSON(),
            requiredPermission: this.requiredPermission,
        };
    }
}
