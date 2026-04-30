import { AppError } from './AppError';

export class DatabaseError extends AppError {
    public readonly operation?: string;
    public readonly table?: string;

    constructor(
        message: string = 'Database operation failed',
        operation?: string,
        table?: string,
        context?: Record<string, unknown>
    ) {
        super(message, 'DATABASE_ERROR', 500, false, context);
        this.name = 'DatabaseError';
        this.operation = operation;
        this.table = table;
        Object.setPrototypeOf(this, DatabaseError.prototype);
    }

    toJSON(): Record<string, unknown> {
        return {
            ...super.toJSON(),
            operation: this.operation,
            table: this.table,
        };
    }
}
