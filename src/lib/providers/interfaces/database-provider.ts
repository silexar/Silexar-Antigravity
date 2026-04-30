/**
 * Database Provider Interface
 * 
 * For PostgreSQL/database services (Supabase, Google Cloud SQL, AWS RDS)
 * 
 * Line Reference: database-provider.ts:1
 */

import { IProvider, ProviderHealth } from './base-provider';

export interface DatabaseMetrics {
    connectionsUsed: number;
    connectionsMax: number;
    queryLatency: number;
    replicationLag?: number;
    storageUsed: number;
    storageMax: number;
}

export interface IDatabaseProvider extends IProvider {
    /** Execute a raw SQL query */
    query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;

    /** Execute a transaction */
    transaction<T = unknown>(
        operations: (client: unknown) => Promise<T>
    ): Promise<T>;

    /** Get database metrics */
    getMetrics(): Promise<DatabaseMetrics>;

    /** Check if this is the primary database */
    checkIsPrimary(): boolean;

    /** Promote this database to primary (for failover) */
    promote(): Promise<void>;

    /** Get replication status */
    getReplicationStatus(): Promise<{
        isReplicating: boolean;
        lag?: number;
        lastReplication?: Date;
    }>;
}
