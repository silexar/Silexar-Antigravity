/**
 * ISSSOConfigurationRepository - Repository Interface for SSO Configuration
 * CATEGORY: CRITICAL - DDD Completo + CQRS
 */

import { SSOConfiguration, SSOConfigurationProps } from '../entities/SSOConfiguration';

export interface ISSSOConfigurationRepository {
    // CRUD operations
    create(config: SSOConfiguration): Promise<SSOConfiguration>;
    findById(id: string): Promise<SSOConfiguration | null>;
    findByTenant(tenantId: string): Promise<SSOConfiguration[]>;
    findActivo(tenantId: string): Promise<SSOConfiguration | null>;
    findByProvider(tenantId: string, provider: string): Promise<SSOConfiguration | null>;
    findDefault(tenantId: string): Promise<SSOConfiguration | null>;

    // Update operations
    update(config: SSOConfiguration): Promise<SSOConfiguration>;
    updateState(id: string, estado: string): Promise<void>;
    updateSyncStatus(id: string, status: string, errores?: Array<{ timestamp: string; mensaje: string; usuarioOGrupo?: string }>): Promise<void>;

    // Activation/Deactivation
    activate(id: string): Promise<void>;
    deactivate(id: string): Promise<void>;
    setDefault(id: string, tenantId: string): Promise<void>;

    // Queries
    findWithErrors(tenantId: string): Promise<SSOConfiguration[]>;
    countByTenant(tenantId: string): Promise<number>;

    // Delete
    delete(id: string): Promise<void>;
}

export interface ISyncLogRepository {
    createLog(entry: {
        ssoConfigId: string;
        tenantId: string;
        startedAt: string;
        completedAt?: string;
        usuariosSync: number;
        gruposSync: number;
        erroresCount: number;
        status: string;
    }): Promise<void>;

    findBySSOConfig(ssoConfigId: string, limit?: number): Promise<Array<{
        id: string;
        startedAt: string;
        completedAt?: string;
        usuariosSync: number;
        gruposSync: number;
        erroresCount: number;
        status: string;
    }>>;

    getStatistics(ssoConfigId: string, days: number): Promise<{
        totalSyncs: number;
        successfulSyncs: number;
        failedSyncs: number;
        averageUsuariosSync: number;
        averageDurationSeconds: number;
    }>;
}