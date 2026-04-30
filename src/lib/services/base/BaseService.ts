import { IService, IPaginatedService } from '../interfaces/IService';
import { NotFoundError } from '@/lib/errors/NotFoundError';
import { logger } from '@/lib/observability';

export abstract class BaseService<T extends { id: string }> implements IService<T> {
    protected serviceName: string;

    constructor(serviceName: string) {
        this.serviceName = serviceName;
    }

    protected log(message: string, meta?: Record<string, unknown>): void {
        logger.info(`[${this.serviceName}] ${message}`, meta);
    }

    async create(data: Partial<T>): Promise<T> {
        throw new Error('Method not implemented');
    }

    async findById(id: string): Promise<T | null> {
        throw new Error('Method not implemented');
    }

    async findAll(_filters?: Record<string, unknown>): Promise<T[]> {
        throw new Error('Method not implemented');
    }

    async update(id: string, data: Partial<T>): Promise<T> {
        const existing = await this.findById(id);
        if (!existing) {
            throw new NotFoundError(`${this.serviceName} not found`, this.serviceName, id);
        }
        throw new Error('Method not implemented');
    }

    async delete(id: string): Promise<boolean> {
        const existing = await this.findById(id);
        if (!existing) {
            throw new NotFoundError(`${this.serviceName} not found`, this.serviceName, id);
        }
        throw new Error('Method not implemented');
    }
}

export abstract class BasePaginatedService<T extends { id: string }> extends BaseService<T> implements IPaginatedService<T> {
    async findPaginated(
        page: number = 1,
        pageSize: number = 20,
        _filters?: Record<string, unknown>
    ): Promise<{
        data: T[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }> {
        throw new Error('Method not implemented');
    }
}