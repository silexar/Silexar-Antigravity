import { IRepository } from '../interfaces/IRepository';
import { getDB } from '@/lib/db';
import { DatabaseError } from '@/lib/errors/DatabaseError';
import { logger } from '@/lib/observability';

export abstract class BaseRepository<T, ID = string> implements IRepository<T, ID> {
    protected tableName: string = 'unknown_table';

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    protected get db() {
        return getDB();
    }

    protected log(message: string, meta?: Record<string, unknown>): void {
        logger.info(`[${this.tableName}] ${message}`, meta);
    }

    async save(entity: T): Promise<T> {
        try {
            this.log('Save operation not implemented');
            throw new Error('Method not implemented');
        } catch (error) {
            throw new DatabaseError(
                `Failed to save entity: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'save',
                this.tableName
            );
        }
    }

    async findById(id: ID): Promise<T | null> {
        try {
            this.log('FindById operation not implemented');
            throw new Error('Method not implemented');
        } catch (error) {
            throw new DatabaseError(
                `Failed to find entity: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'findById',
                this.tableName
            );
        }
    }

    async findAll(_filters?: Record<string, unknown>): Promise<T[]> {
        try {
            this.log('FindAll operation not implemented');
            throw new Error('Method not implemented');
        } catch (error) {
            throw new DatabaseError(
                `Failed to find entities: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'findAll',
                this.tableName
            );
        }
    }

    async update(id: ID, _entity: Partial<T>): Promise<T> {
        try {
            this.log('Update operation not implemented');
            throw new Error('Method not implemented');
        } catch (error) {
            throw new DatabaseError(
                `Failed to update entity: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'update',
                this.tableName
            );
        }
    }

    async delete(id: ID): Promise<boolean> {
        try {
            this.log('Delete operation not implemented');
            throw new Error('Method not implemented');
        } catch (error) {
            throw new DatabaseError(
                `Failed to delete entity: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'delete',
                this.tableName
            );
        }
    }
}