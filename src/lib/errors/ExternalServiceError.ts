import { AppError } from './AppError';

export class ExternalServiceError extends AppError {
    public readonly serviceName?: string;
    public readonly originalError?: string;

    constructor(
        message: string = 'External service failed',
        serviceName?: string,
        originalError?: string,
        context?: Record<string, unknown>
    ) {
        super(message, 'EXTERNAL_SERVICE_ERROR', 502, false, context);
        this.name = 'ExternalServiceError';
        this.serviceName = serviceName;
        this.originalError = originalError;
        Object.setPrototypeOf(this, ExternalServiceError.prototype);
    }

    toJSON(): Record<string, unknown> {
        return {
            ...super.toJSON(),
            serviceName: this.serviceName,
            originalError: this.originalError,
        };
    }
}
