/**
 * Silexar Pulse - Service Interface
 * Base interface for all services following domain-driven design.
 */

export interface IService<T = unknown> {
    create(data: Partial<T>): Promise<T>;
    findById(id: string): Promise<T | null>;
    findAll(filters?: Record<string, unknown>): Promise<T[]>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<boolean>;
}

export interface IPaginatedService<T = unknown> extends IService<T> {
    findPaginated(
        page: number,
        pageSize: number,
        filters?: Record<string, unknown>
    ): Promise<{
        data: T[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
}
