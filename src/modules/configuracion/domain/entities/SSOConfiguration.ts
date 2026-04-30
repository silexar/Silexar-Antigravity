/**
 * SSOConfiguration Entity - Enterprise Single Sign-On Configuration
 * CATEGORY: CRITICAL - DDD Completo + CQRS + Event Sourcing
 * 
 * Maneja la configuración de directorios empresariales y autenticación SSO
 * para integración con sistemas corporativos (ActiveDirectory, LDAP, SAML, etc.)
 */

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// ==================== VALUE OBJECTS ====================

/**
 * ProviderType - Tipo de proveedor de autenticación
 */
export type ProviderType = 'ACTIVE_DIRECTORY' | 'LDAP' | 'SAML' | 'OAUTH2' | 'OIDC' | 'GOOGLE_WORKSPACE' | 'MICROSOFT_GRAPH';

export const ProviderTypeSchema = z.enum([
    'ACTIVE_DIRECTORY',
    'LDAP',
    'SAML',
    'OAUTH2',
    'OIDC',
    'GOOGLE_WORKSPACE',
    'MICROSOFT_GRAPH'
]);

/**
 * ConnectionStatus - Estado de conexión con directorio
 */
export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'AUTHENTICATED' | 'ERROR' | 'MAINTENANCE';

export const ConnectionStatusSchema = z.enum([
    'DISCONNECTED',
    'CONNECTING',
    'CONNECTED',
    'AUTHENTICATED',
    'ERROR',
    'MAINTENANCE'
]);

/**
 * SyncStatus - Estado de sincronización de usuarios
 */
export type SyncStatus = 'IDLE' | 'SYNCING' | 'COMPLETED' | 'FAILED' | 'PARTIAL';

export const SyncStatusSchema = z.enum(['IDLE', 'SYNCING', 'COMPLETED', 'FAILED', 'PARTIAL']);

/**
 * SelloNivel - Nivel de certificación de confianza
 */
export type SelloNivel = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export const SelloNivelSchema = z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']);

// ==================== DOMAIN ERRORS ====================

export class SSODomainError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly context: Record<string, unknown> = {}
    ) {
        super(message);
        this.name = 'SSODomainError';
    }
}

// ==================== SCHEMAS ====================

export const AttributeMappingSchema = z.object({
    directorioAttribute: z.string().min(1),
    userField: z.string().min(1),
    transform: z.enum(['NONE', 'LOWER', 'UPPER', 'TITLE_CASE', 'CUSTOM']).optional(),
    customTransform: z.string().optional(),
    required: z.boolean().default(false),
});

export const SyncConfigurationSchema = z.object({
    baseDn: z.string().optional(),
    userFilter: z.string().optional(),
    groupFilter: z.string().optional(),
    syncIntervalMinutes: z.number().min(15).max(1440).default(60),
    autoSync: z.boolean().default(true),
    syncNestedGroups: z.boolean().default(false),
    attributeMappings: z.array(AttributeMappingSchema).default([]),
    conflictResolution: z.enum(['DIRECTORY_WINS', 'LOCAL_WINS', 'ASK']).default('ASK'),
});

export const SSOConfigurationPropsSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string(),
    nombre: z.string().min(1).max(255),
    proveedor: ProviderTypeSchema,
    estado: ConnectionStatusSchema.default('DISCONNECTED'),

    // Configuración de conexión
    host: z.string().optional(),
    puerto: z.number().min(1).max(65535).optional(),
    sslHabilitado: z.boolean().default(false),
    certificatePath: z.string().optional(),

    // Credenciales (cifradas)
    adminDn: z.string().optional(),
    adminPasswordEncrypted: z.string().optional(),
    clientId: z.string().optional(),
    clientSecretEncrypted: z.string().optional(),

    // Metadata SSO
    metadataUrl: z.string().url().optional(),
    entityId: z.string().optional(),
    acsUrl: z.string().url().optional(),
    sloUrl: z.string().url().optional(),
    certificateMetadata: z.string().optional(),

    // Configuración de sincronización
    syncConfig: SyncConfigurationSchema,
    ultimoSyncAt: z.string().datetime().optional(),
    syncStatus: SyncStatusSchema.default('IDLE'),
    syncErrores: z.array(z.object({
        timestamp: z.string().datetime(),
        mensaje: z.string(),
        usuarioOGrupo: z.string().optional(),
    })).default([]),

    // JIT Provisioning
    jitEnabled: z.boolean().default(false),
    jitDefaultRoleId: z.string().uuid().optional(),
    jitAutoCreateUsers: z.boolean().default(true),

    // Configuración de logout
    singleLogoutEnabled: z.boolean().default(true),
    logoutRedirectUrl: z.string().url().optional(),

    // Estados y métricas
    intentosConexion: z.number().default(0),
    ultimoIntentoAt: z.string().datetime().optional(),
    ultimoError: z.string().optional(),
    uptimeSeconds: z.number().default(0),

    // Feature flags
    estaActivo: z.boolean().default(false),
    esDefault: z.boolean().default(false),

    // Auditoría
    creadoPorId: z.string().uuid().optional(),
    creadoAt: z.string().datetime(),
    actualizadoPorId: z.string().uuid().optional(),
    actualizadoAt: z.string().datetime(),
    version: z.number().default(1),
});

export type SSOConfigurationProps = z.infer<typeof SSOConfigurationPropsSchema>;

// ==================== ENTITY ====================

export class SSOConfiguration {
    private constructor(private props: SSOConfigurationProps) {
        this.validate();
    }

    // Factory methods
    static create(props: Omit<SSOConfigurationProps, 'id' | 'version' | 'creadoAt' | 'actualizadoAt'>): SSOConfiguration {
        const now = new Date().toISOString();
        return new SSOConfiguration({
            ...props,
            id: uuidv4(),
            version: 1,
            creadoAt: now,
            actualizadoAt: now,
        });
    }

    static createActiveDirectory(
        tenantId: string,
        nombre: string,
        host: string,
        puerto: number,
        adminDn: string,
        adminPassword: string
    ): SSOConfiguration {
        return SSOConfiguration.create({
            tenantId,
            nombre,
            proveedor: 'ACTIVE_DIRECTORY',
            host,
            puerto,
            adminDn,
            adminPasswordEncrypted: adminPassword, // Encrypt in infrastructure layer
            sslHabilitado: puerto === 636,
            estado: 'DISCONNECTED',
            syncConfig: { syncIntervalMinutes: 60, autoSync: true, syncNestedGroups: false, attributeMappings: [], conflictResolution: 'ASK' },
            syncStatus: 'IDLE',
            syncErrores: [],
            jitEnabled: false,
            jitAutoCreateUsers: true,
            singleLogoutEnabled: true,
            intentosConexion: 0,
            uptimeSeconds: 0,
            estaActivo: false,
            esDefault: false,
        });
    }

    static createSAML(
        tenantId: string,
        nombre: string,
        entityId: string,
        metadataUrl: string,
        acsUrl: string
    ): SSOConfiguration {
        return SSOConfiguration.create({
            tenantId,
            nombre,
            proveedor: 'SAML',
            entityId,
            metadataUrl,
            acsUrl,
            sslHabilitado: false,
            estado: 'DISCONNECTED',
            syncConfig: { syncIntervalMinutes: 60, autoSync: false, syncNestedGroups: false, attributeMappings: [], conflictResolution: 'ASK' },
            syncStatus: 'IDLE',
            syncErrores: [],
            jitEnabled: false,
            jitAutoCreateUsers: true,
            singleLogoutEnabled: true,
            intentosConexion: 0,
            uptimeSeconds: 0,
            estaActivo: false,
            esDefault: false,
        });
    }

    static createGoogleWorkspace(
        tenantId: string,
        nombre: string,
        clientId: string,
        clientSecret: string
    ): SSOConfiguration {
        return SSOConfiguration.create({
            tenantId,
            nombre,
            proveedor: 'GOOGLE_WORKSPACE',
            clientId,
            clientSecretEncrypted: clientSecret,
            sslHabilitado: false,
            estado: 'DISCONNECTED',
            syncConfig: { syncIntervalMinutes: 60, autoSync: false, syncNestedGroups: false, attributeMappings: [], conflictResolution: 'ASK' },
            syncStatus: 'IDLE',
            syncErrores: [],
            jitEnabled: true,
            jitAutoCreateUsers: true,
            singleLogoutEnabled: true,
            intentosConexion: 0,
            uptimeSeconds: 0,
            estaActivo: false,
            esDefault: false,
        });
    }

    static fromSnapshot(props: SSOConfigurationProps): SSOConfiguration {
        return new SSOConfiguration(props);
    }

    // Validation
    private validate(): void {
        const requiredByProvider: Record<ProviderType, (keyof SSOConfigurationProps)[]> = {
            ACTIVE_DIRECTORY: ['host', 'puerto', 'adminDn', 'adminPasswordEncrypted'],
            LDAP: ['host', 'puerto', 'adminDn', 'adminPasswordEncrypted'],
            SAML: ['entityId', 'acsUrl'],
            OAUTH2: ['clientId', 'clientSecretEncrypted'],
            OIDC: ['clientId', 'clientSecretEncrypted'],
            GOOGLE_WORKSPACE: ['clientId', 'clientSecretEncrypted'],
            MICROSOFT_GRAPH: ['clientId', 'clientSecretEncrypted'],
        };

        const required = requiredByProvider[this.props.proveedor] || [];
        for (const field of required) {
            if (!this.props[field]) {
                throw new SSODomainError(
                    `Campo requerido para ${this.props.proveedor}: ${field}`,
                    'MISSING_REQUIRED_FIELD',
                    { provider: this.props.proveedor, field }
                );
            }
        }

        // Validate URL fields if present
        if (this.props.metadataUrl && !this.isValidUrl(this.props.metadataUrl)) {
            throw new SSODomainError('metadataUrl inválido', 'INVALID_URL');
        }
        if (this.props.sloUrl && !this.isValidUrl(this.props.sloUrl)) {
            throw new SSODomainError('sloUrl inválido', 'INVALID_URL');
        }
    }

    private isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // State transitions
    connect(): void {
        if (this.props.estado === 'MAINTENANCE') {
            throw new SSODomainError('No se puede conectar durante mantenimiento', 'MAINTENANCE_MODE');
        }
        this.props.estado = 'CONNECTING';
    }

    connectionSuccess(): void {
        this.props.estado = 'CONNECTED';
        this.props.intentosConexion = 0;
        this.props.ultimoError = undefined;
        this.props.ultimoIntentoAt = new Date().toISOString();
    }

    connectionFailed(error: string): void {
        this.props.estado = 'ERROR';
        this.props.intentosConexion += 1;
        this.props.ultimoError = error;
        this.props.ultimoIntentoAt = new Date().toISOString();
    }

    authenticate(): void {
        if (this.props.estado !== 'CONNECTED') {
            throw new SSODomainError('Debe estar conectado antes de autenticar', 'INVALID_STATE');
        }
        this.props.estado = 'AUTHENTICATED';
        this.props.uptimeSeconds = 0;
    }

    maintenance(): void {
        this.props.estado = 'MAINTENANCE';
    }

    disconnect(): void {
        this.props.estado = 'DISCONNECTED';
    }

    // Sync operations
    startSync(): void {
        this.props.syncStatus = 'SYNCING';
        this.props.ultimoSyncAt = new Date().toISOString();
    }

    completeSync(): void {
        this.props.syncStatus = 'COMPLETED';
        this.props.syncErrores = [];
    }

    failSync(errores: Array<{ timestamp: string; mensaje: string; usuarioOGrupo?: string }>): void {
        this.props.syncStatus = 'FAILED';
        this.props.syncErrores = errores;
    }

    partialSync(errores: Array<{ timestamp: string; mensaje: string; usuarioOGrupo?: string }>): void {
        this.props.syncStatus = 'PARTIAL';
        this.props.syncErrores = errores;
    }

    // Activation
    activate(): void {
        this.props.estaActivo = true;
        this.props.actualizadoAt = new Date().toISOString();
    }

    deactivate(): void {
        this.props.estaActivo = false;
        this.props.actualizadoAt = new Date().toISOString();
    }

    setAsDefault(): void {
        this.props.esDefault = true;
    }

    unsetDefault(): void {
        this.props.esDefault = false;
    }

    // Update methods
    updateHost(newHost: string): void {
        this.props.host = newHost;
        this.props.version += 1;
        this.props.actualizadoAt = new Date().toISOString();
    }

    updateCredentials(newPassword?: string, newClientSecret?: string): void {
        if (newPassword) this.props.adminPasswordEncrypted = newPassword;
        if (newClientSecret) this.props.clientSecretEncrypted = newClientSecret;
        this.props.version += 1;
        this.props.actualizadoAt = new Date().toISOString();
    }

    updateSyncConfig(config: Partial<SSOConfigurationProps['syncConfig']>): void {
        this.props.syncConfig = { ...this.props.syncConfig, ...config };
        this.props.version += 1;
        this.props.actualizadoAt = new Date().toISOString();
    }

    // Queries
    isActive(): boolean {
        return this.props.estaActivo && this.props.estado === 'AUTHENTICATED';
    }

    isConnected(): boolean {
        return ['CONNECTED', 'AUTHENTICATED'].includes(this.props.estado);
    }

    needsReconnection(): boolean {
        return this.props.intentosConexion > 3 || this.props.estado === 'ERROR';
    }

    getUptimeMinutes(): number {
        return Math.floor(this.props.uptimeSeconds / 60);
    }

    getSyncAgeMinutes(): number {
        if (!this.props.ultimoSyncAt) return Infinity;
        const lastSync = new Date(this.props.ultimoSyncAt).getTime();
        const now = Date.now();
        return Math.floor((now - lastSync) / 60000);
    }

    canSync(): boolean {
        if (this.props.syncStatus === 'SYNCING') return false;
        const ageMinutes = this.getSyncAgeMinutes();
        return ageMinutes >= this.props.syncConfig.syncIntervalMinutes;
    }

    // Snapshot
    toSnapshot(): SSOConfigurationProps {
        return { ...this.props };
    }

    toJSON(): Record<string, unknown> {
        const { adminPasswordEncrypted, clientSecretEncrypted, certificatePath, ...publicProps } = this.props;
        return {
            ...publicProps,
            tieneCredenciales: !!(adminPasswordEncrypted || clientSecretEncrypted),
            tieneCertificado: !!certificatePath,
        };
    }
}

// ==================== EXPORTS ====================

export const SSO_CONFIGURATION_STATES = {
    DISCONNECTED: 'DISCONNECTED',
    CONNECTING: 'CONNECTING',
    CONNECTED: 'CONNECTED',
    AUTHENTICATED: 'AUTHENTICATED',
    ERROR: 'ERROR',
    MAINTENANCE: 'MAINTENANCE',
} as const;

export const SSO_PROVIDER_LABELS: Record<ProviderType, string> = {
    ACTIVE_DIRECTORY: 'Microsoft Active Directory',
    LDAP: 'Directorio LDAP',
    SAML: 'SAML 2.0',
    OAUTH2: 'OAuth 2.0',
    OIDC: 'OpenID Connect',
    GOOGLE_WORKSPACE: 'Google Workspace',
    MICROSOFT_GRAPH: 'Microsoft Graph',
};

export const SSO_SYNC_CONFLICT_RESOLUTION = {
    DIRECTORY_WINS: 'DIRECTORY_WINS',
    LOCAL_WINS: 'LOCAL_WINS',
    ASK: 'ASK',
} as const;