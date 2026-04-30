import { AppError } from './AppError';

export class NotFoundError extends AppError {
    public readonly resource?: string;
    public readonly resourceId?: string;

    constructor(
        message: string = 'Resource not found',
        resource?: string,
        resourceId?: string,
        context?: Record<string, unknown>
    ) {
        super(message, 'NOT_FOUND', 404, true, context);
        this.name = 'NotFoundError';
        this.resource = resource;
        this.resourceId = resourceId;
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }

    toJSON(): Record<string, unknown> {
        return {
            ...super.toJSON(),
            resource: this.resource,
            resourceId: this.resourceId,
        };
    }
}
