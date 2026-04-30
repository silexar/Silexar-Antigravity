/**
 * Silexar Pulse - Repository Interface
 * Base interface for all repositories following domain-driven design.
 */

export interface IRepository<T = unknown, ID = string> {
    save(entity: T): Promise<T>;
    findById(id: ID): Promise<T | null>;
    findAll(filters?: Record<string, unknown>): Promise<T[]>;
    update(id: ID, entity: Partial<T>): Promise<T>;
    delete(id: ID): Promise<boolean>;
}