/**
 * EncryptionService Entity - Enterprise Encryption and Security
 * CATEGORY: CRITICAL - DDD + CQRS
 * 
 * Sistema de encriptación de datos, key rotation, HSM integration,
 * secrets management y quantum-resistant algorithms
 */

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// ==================== VALUE OBJECTS ====================

/**
 * EncryptionAlgorithm - Algoritmo de encriptación
 */
export type EncryptionAlgorithm =
    | 'AES_256_GCM'
    | 'AES_256_CBC'
    | 'CHACHA20_POLY1305'
    | 'RSA_2048'
    | 'RSA_4096'
    | 'EC_SECP256R1'
    | 'POST_QUANTUM_KYBER'
    | 'POST_QUANTUM_NTRU';
export const EncryptionAlgorithmSchema = z.enum([
    'AES_256_GCM',
    'AES_256_CBC',
    'CHACHA20_POLY1305',
    'RSA_2048',
    'RSA_4096',
    'EC_SECP256R1',
    'POST_QUANTUM_KYBER',
    'POST_QUANTUM_NTRU',
]);

/**
 * KeyStatus - Estado de la clave
 */
export type KeyStatus = 'ACTIVE' | 'ROTATING' | 'DEPRECATED' | 'EXPIRED' | 'COMPROMISED';
export const KeyStatusSchema = z.enum(['ACTIVE', 'ROTATING', 'DEPRECATED', 'EXPIRED', 'COMPROMISED']);

/**
 * KeyType - Tipo de clave
 */
export type KeyType = 'MASTER' | 'DATA_ENCRYPTION' | 'SIGNING' | 'AUTHENTICATION' | 'FIELD_LEVEL';
export const KeyTypeSchema = z.enum(['MASTER', 'DATA_ENCRYPTION', 'SIGNING', 'AUTHENTICATION', 'FIELD_LEVEL']);

/**
 * SecretType - Tipo de secreto
 */
export type SecretType = 'API_KEY' | 'DATABASE_PASSWORD' | 'CERTIFICATE' | 'PRIVATE_KEY' | 'TOKEN' | 'CREDENTIAL';
export const SecretTypeSchema = z.enum(['API_KEY', 'DATABASE_PASSWORD', 'CERTIFICATE', 'PRIVATE_KEY', 'TOKEN', 'CREDENTIAL']);

// ==================== DOMAIN ERRORS ====================

export class EncryptionDomainError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly context: Record<string, unknown> = {}
    ) {
        super(message);
        this.name = 'EncryptionDomainError';
    }
}

// ==================== SCHEMAS ====================

export const KeyRotationPolicySchema = z.object({
    automaticRotation: z.boolean().default(true),
    rotationIntervalDays: z.number().min(1).max(365).default(90),
    rotationWarningDays: z.number().min(1).max(30).default(14),
    minKeyVersions: z.number().min(1).max(20).default(3),
    allowManualRotation: z.boolean().default(true),
});

export const KeyVersionSchema = z.object({
    version: z.number(),
    createdAt: z.string().datetime(),
    createdById: z.string().uuid(),
    algorithm: EncryptionAlgorithmSchema,
    status: KeyStatusSchema,
    expiresAt: z.string().datetime().optional(),
    rotatedAt: z.string().datetime().optional(),
    rotatedById: z.string().uuid().optional(),
});

export const FieldEncryptionSchema = z.object({
    tableName: z.string(),
    columnName: z.string(),
    algorithm: EncryptionAlgorithmSchema.default('AES_256_GCM'),
    keyId: z.string().uuid(),
    enableSearch: z.boolean().default(false), // If true, can search encrypted values
    preserveFormat: z.boolean().default(false), // If true, preserves original format length
});

export const SecretMetadataSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(255),
    type: SecretTypeSchema,
    description: z.string().max(500).optional(),
    tags: z.array(z.string()).default([]),
    createdAt: z.string().datetime(),
    createdById: z.string().uuid(),
    updatedAt: z.string().datetime(),
    updatedById: z.string().uuid().optional(),
    expiresAt: z.string().datetime().optional(),
    lastUsedAt: z.string().datetime().optional(),
    lastRotatedAt: z.string().datetime().optional(),
    rotationPolicyDays: z.number().optional(),
    notifyOnAccess: z.boolean().default(false),
    accessCount: z.number().default(0),
    metadata: z.record(z.string(), z.unknown()).default({}),
});

export const EncryptionServicePropsSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string(),

    // Configuración general
    nombre: z.string().min(1).max(255),
    descripcion: z.string().max(500).optional(),
    activo: z.boolean().default(true),

    // Algoritmo por defecto
    defaultAlgorithm: EncryptionAlgorithmSchema.default('AES_256_GCM'),

    // HSM Configuration
    hsmEnabled: z.boolean().default(false),
    hsmProvider: z.enum(['AWS_KMS', 'AZURE_KEY_VAULT', 'GCP_CLOUD_KMS', 'LOCAL_HSM', 'SOFTWARE']).default('SOFTWARE'),
    hsmConfig: z.object({
        endpoint: z.string().url().optional(),
        keyPoolId: z.string().optional(),
        region: z.string().optional(),
        projectId: z.string().optional(),
    }).optional(),

    // Key Management
    masterKeyId: z.string().uuid().optional(),
    keys: z.array(z.object({
        id: z.string().uuid(),
        name: z.string(),
        type: KeyTypeSchema,
        algorithm: EncryptionAlgorithmSchema,
        status: KeyStatusSchema,
        keyHash: z.string(), // Hash of encrypted key material
        createdAt: z.string().datetime(),
        createdById: z.string().uuid(),
        version: z.number().default(1),
        rotatedAt: z.string().datetime().optional(),
        rotatedById: z.string().uuid().optional(),
        expiresAt: z.string().datetime().optional(),
        metadata: z.record(z.string(), z.unknown()).default({}),
    })).default([]),

    // Rotation policy
    rotationPolicy: z.object({
        automaticRotation: z.boolean().default(true),
        rotationIntervalDays: z.number().min(1).max(365).default(90),
        rotationWarningDays: z.number().min(1).max(30).default(14),
        minKeyVersions: z.number().min(1).max(20).default(3),
        allowManualRotation: z.boolean().default(true),
    }).optional(),

    // Field-level encryption
    fieldEncryptions: z.array(z.object({
        tableName: z.string(),
        columnName: z.string(),
        algorithm: EncryptionAlgorithmSchema.default('AES_256_GCM'),
        keyId: z.string().uuid(),
        enableSearch: z.boolean().default(false),
        preserveFormat: z.boolean().default(false),
    })).default([]),

    // Secrets vault
    secrets: z.array(z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(255),
        type: SecretTypeSchema,
        description: z.string().max(500).optional(),
        tags: z.array(z.string()).default([]),
        createdAt: z.string().datetime(),
        createdById: z.string().uuid(),
        updatedAt: z.string().datetime(),
        updatedById: z.string().uuid().optional(),
        expiresAt: z.string().datetime().optional(),
        lastUsedAt: z.string().datetime().optional(),
        lastRotatedAt: z.string().datetime().optional(),
        rotationPolicyDays: z.number().optional(),
        notifyOnAccess: z.boolean().default(false),
        accessCount: z.number().default(0),
        metadata: z.record(z.string(), z.unknown()).default({}),
    })).default([]),

    // Access control
    accessControl: z.object({
        requireMFA: z.boolean().default(true),
        requireApproval: z.boolean().default(false),
        approvers: z.array(z.string().uuid()).default([]),
        allowedTeams: z.array(z.string()).default([]),
        auditAllAccess: z.boolean().default(true),
    }).optional(),

    // Audit
    auditLog: z.array(z.object({
        id: z.string().uuid(),
        timestamp: z.string().datetime(),
        userId: z.string().uuid(),
        action: z.enum(['ENCRYPT', 'DECRYPT', 'ROTATE', 'CREATE_KEY', 'DELETE_KEY', 'ACCESS_SECRET', 'UPDATE_SECRET']),
        resourceType: z.string(),
        resourceId: z.string(),
        success: z.boolean(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
    })).default([]),

    // Auditoría
    creadoPorId: z.string().uuid().optional(),
    creadoAt: z.string().datetime(),
    actualizadoPorId: z.string().uuid().optional(),
    actualizadoAt: z.string().datetime(),
    version: z.number().default(1),
});

export type EncryptionServiceProps = z.infer<typeof EncryptionServicePropsSchema>;

// ==================== ENTITY ====================

export class EncryptionService {
    private constructor(private props: EncryptionServiceProps) {
        this.validate();
    }

    // Factory methods
    static create(props: Omit<EncryptionServiceProps, 'id' | 'version' | 'creadoAt' | 'actualizadoAt' | 'keys' | 'secrets' | 'auditLog' | 'defaultAlgorithm' | 'rotationPolicy'>): EncryptionService {
        const now = new Date().toISOString();
        return new EncryptionService({
            ...props,
            id: uuidv4(),
            version: 1,
            defaultAlgorithm: 'AES_256_GCM',
            keys: [],
            secrets: [],
            auditLog: [],
            rotationPolicy: {
                automaticRotation: true,
                rotationIntervalDays: 90,
                rotationWarningDays: 14,
                minKeyVersions: 3,
                allowManualRotation: true,
            },
            creadoAt: now,
            actualizadoAt: now,
        });
    }

    static createDefault(tenantId: string, nombre: string): EncryptionService {
        return EncryptionService.create({
            tenantId,
            nombre,
            descripcion: 'Servicio de encriptación para el tenant',
            activo: true,
            hsmEnabled: false,
            hsmProvider: 'SOFTWARE',
            fieldEncryptions: [],
            accessControl: {
                requireMFA: true,
                requireApproval: false,
                approvers: [],
                allowedTeams: [],
                auditAllAccess: true,
            },
        });
    }

    static fromSnapshot(props: EncryptionServiceProps): EncryptionService {
        return new EncryptionService(props);
    }

    // Validation
    private validate(): void {
        // HSM requires config
        if (this.props.hsmEnabled && this.props.hsmProvider !== 'SOFTWARE' && !this.props.hsmConfig) {
            throw new EncryptionDomainError(
                'HSM config requerido cuando HSM no es SOFTWARE',
                'HSM_CONFIG_REQUIRED'
            );
        }

        // Keys array consistency
        for (const key of this.props.keys) {
            if (key.status === 'ACTIVE' && this.props.keys.filter(k => k.type === key.type && k.status === 'ACTIVE').length > 1) {
                throw new EncryptionDomainError(
                    `Solo puede haber una clave ACTIVE por tipo: ${key.type}`,
                    'MULTIPLE_ACTIVE_KEYS'
                );
            }
        }
    }

    // Key Management
    createKey(data: {
        name: string;
        type: KeyType;
        algorithm?: EncryptionAlgorithm;
        expiresAt?: string;
    }): string {
        // Check if active key of same type exists
        const existingActive = this.props.keys.find(k => k.type === data.type && k.status === 'ACTIVE');
        if (existingActive && data.type !== 'FIELD_LEVEL') {
            throw new EncryptionDomainError(
                `Ya existe clave ACTIVE para tipo ${data.type}. Debe rotar primero.`,
                'KEY_EXISTS'
            );
        }

        const keyId = uuidv4();
        const now = new Date().toISOString();
        const version = this.props.keys.filter(k => k.name === data.name).length + 1;

        this.props.keys.push({
            id: keyId,
            name: data.name,
            type: data.type,
            algorithm: data.algorithm || this.props.defaultAlgorithm,
            status: 'ACTIVE',
            keyHash: this.generateKeyHash(), // Simulated
            createdAt: now,
            createdById: this.props.creadoPorId || 'system',
            version,
            expiresAt: data.expiresAt,
            metadata: {},
        });

        this.logAudit('CREATE_KEY', 'KEY', keyId, true);
        this.props.actualizadoAt = now;

        return keyId;
    }

    rotateKey(keyId: string, rotatedById: string): void {
        const key = this.props.keys.find(k => k.id === keyId);
        if (!key) {
            throw new EncryptionDomainError('Clave no encontrada', 'KEY_NOT_FOUND');
        }

        if (key.status === 'COMPROMISED') {
            throw new EncryptionDomainError('No se puede rotar clave comprometida', 'KEY_COMPROMISED');
        }

        const now = new Date().toISOString();

        // Mark old key as deprecated
        key.status = 'DEPRECATED';
        key.rotatedAt = now;
        key.rotatedById = rotatedById;

        // Create new version
        const newVersion = this.props.keys.filter(k => k.name === key.name).length + 1;
        this.props.keys.push({
            id: uuidv4(),
            name: key.name,
            type: key.type,
            algorithm: key.algorithm,
            status: 'ACTIVE',
            keyHash: this.generateKeyHash(),
            createdAt: now,
            createdById: rotatedById,
            version: newVersion,
            metadata: { previousVersion: key.version },
        });

        this.logAudit('ROTATE', 'KEY', keyId, true);
        this.props.actualizadoAt = now;
    }

    deprecateKey(keyId: string, reason: string): void {
        const key = this.props.keys.find(k => k.id === keyId);
        if (!key) {
            throw new EncryptionDomainError('Clave no encontrada', 'KEY_NOT_FOUND');
        }

        key.status = 'DEPRECATED';
        this.logAudit('DEPRECATE_KEY', 'KEY', keyId, true);
        this.props.actualizadoAt = new Date().toISOString();
    }

    markKeyCompromised(keyId: string): void {
        const key = this.props.keys.find(k => k.id === keyId);
        if (!key) {
            throw new EncryptionDomainError('Clave no encontrada', 'KEY_NOT_FOUND');
        }

        key.status = 'COMPROMISED';
        this.logAudit('MARK_COMPROMISED', 'KEY', keyId, true);
        this.props.actualizadoAt = new Date().toISOString();
    }

    // Encryption/Decryption simulation
    encrypt(data: string, keyId?: string): { ciphertext: string; keyId: string; algorithm: EncryptionAlgorithm } {
        const key = keyId ? this.props.keys.find(k => k.id === keyId) : this.props.keys.find(k => k.status === 'ACTIVE');
        if (!key) {
            throw new EncryptionDomainError('No hay clave activa', 'NO_ACTIVE_KEY');
        }

        // In production, would use actual encryption
        const ciphertext = Buffer.from(data).toString('base64');

        this.logAudit('ENCRYPT', 'DATA', key.id, true);

        return {
            ciphertext,
            keyId: key.id,
            algorithm: key.algorithm,
        };
    }

    decrypt(ciphertext: string, keyId: string): string {
        const key = this.props.keys.find(k => k.id === keyId);
        if (!key) {
            throw new EncryptionDomainError('Clave no encontrada', 'KEY_NOT_FOUND');
        }

        // In production, would use actual decryption
        const data = Buffer.from(ciphertext, 'base64').toString();

        this.logAudit('DECRYPT', 'DATA', keyId, true);

        return data;
    }

    // Secrets Management
    storeSecret(data: {
        name: string;
        type: SecretType;
        value: string; // Will be encrypted
        description?: string;
        tags?: string[];
        expiresAt?: string;
        rotationPolicyDays?: number;
    }): string {
        const secretId = uuidv4();
        const now = new Date().toISOString();

        this.props.secrets.push({
            id: secretId,
            name: data.name,
            type: data.type,
            description: data.description,
            tags: data.tags || [],
            createdAt: now,
            createdById: this.props.creadoPorId || 'system',
            updatedAt: now,
            expiresAt: data.expiresAt,
            rotationPolicyDays: data.rotationPolicyDays,
            notifyOnAccess: false,
            accessCount: 0,
            metadata: {},
        });

        this.logAudit('CREATE_SECRET', 'SECRET', secretId, true);
        this.props.actualizadoAt = now;

        return secretId;
    }

    accessSecret(secretId: string, userId: string): string | null {
        const secret = this.props.secrets.find(s => s.id === secretId);
        if (!secret) {
            throw new EncryptionDomainError('Secreto no encontrado', 'SECRET_NOT_FOUND');
        }

        secret.lastUsedAt = new Date().toISOString();
        secret.accessCount += 1;

        this.logAudit('ACCESS_SECRET', 'SECRET', secretId, true, userId);
        this.props.actualizadoAt = new Date().toISOString();

        // In production, would return decrypted value
        return `[DECRYPTED_SECRET_${secretId}]`;
    }

    updateSecret(secretId: string, updates: {
        name?: string;
        description?: string;
        tags?: string[];
        expiresAt?: string;
        rotationPolicyDays?: number;
    }): void {
        const secret = this.props.secrets.find(s => s.id === secretId);
        if (!secret) {
            throw new EncryptionDomainError('Secreto no encontrado', 'SECRET_NOT_FOUND');
        }

        if (updates.name) secret.name = updates.name;
        if (updates.description !== undefined) secret.description = updates.description;
        if (updates.tags) secret.tags = updates.tags;
        if (updates.expiresAt) secret.expiresAt = updates.expiresAt;
        if (updates.rotationPolicyDays) secret.rotationPolicyDays = updates.rotationPolicyDays;
        secret.updatedAt = new Date().toISOString();
        secret.updatedById = this.props.creadoPorId;

        this.logAudit('UPDATE_SECRET', 'SECRET', secretId, true);
        this.props.actualizadoAt = new Date().toISOString();
    }

    rotateSecret(secretId: string): void {
        const secret = this.props.secrets.find(s => s.id === secretId);
        if (!secret) {
            throw new EncryptionDomainError('Secreto no encontrado', 'SECRET_NOT_FOUND');
        }

        secret.lastRotatedAt = new Date().toISOString();
        secret.updatedAt = new Date().toISOString();

        this.logAudit('ROTATE', 'SECRET', secretId, true);
        this.props.actualizadoAt = new Date().toISOString();
    }

    deleteSecret(secretId: string): void {
        const index = this.props.secrets.findIndex(s => s.id === secretId);
        if (index === -1) {
            throw new EncryptionDomainError('Secreto no encontrado', 'SECRET_NOT_FOUND');
        }

        this.props.secrets.splice(index, 1);
        this.logAudit('DELETE_SECRET', 'SECRET', secretId, true);
        this.props.actualizadoAt = new Date().toISOString();
    }

    // Field Encryption
    addFieldEncryption(config: {
        tableName: string;
        columnName: string;
        algorithm?: EncryptionAlgorithm;
        enableSearch?: boolean;
        preserveFormat?: boolean;
    }): void {
        const keyId = config.tableName + '_' + config.columnName; // Simplified key assignment

        this.props.fieldEncryptions.push({
            tableName: config.tableName,
            columnName: config.columnName,
            algorithm: config.algorithm || 'AES_256_GCM',
            keyId: this.props.keys.find(k => k.type === 'FIELD_LEVEL')?.id || this.createKey({
                name: `FIELD_${config.tableName}_${config.columnName}`,
                type: 'FIELD_LEVEL',
                algorithm: config.algorithm as EncryptionAlgorithm || 'AES_256_GCM',
            }),
            enableSearch: config.enableSearch || false,
            preserveFormat: config.preserveFormat || false,
        });

        this.props.actualizadoAt = new Date().toISOString();
    }

    // Rotation Policy
    updateRotationPolicy(policy: {
        automaticRotation?: boolean;
        rotationIntervalDays?: number;
        rotationWarningDays?: number;
        minKeyVersions?: number;
        allowManualRotation?: boolean;
    }): void {
        this.props.rotationPolicy = {
            automaticRotation: this.props.rotationPolicy?.automaticRotation ?? true,
            rotationIntervalDays: this.props.rotationPolicy?.rotationIntervalDays ?? 90,
            rotationWarningDays: this.props.rotationPolicy?.rotationWarningDays ?? 14,
            minKeyVersions: this.props.rotationPolicy?.minKeyVersions ?? 3,
            allowManualRotation: this.props.rotationPolicy?.allowManualRotation ?? true,
            ...policy,
        };
        this.props.actualizadoAt = new Date().toISOString();
    }

    // Audit
    private logAudit(action: string, resourceType: string, resourceId: string, success: boolean, userId?: string): void {
        this.props.auditLog.push({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            userId: userId || this.props.creadoPorId || 'system',
            action: action as any,
            resourceType,
            resourceId,
            success,
            metadata: {},
        });

        // Keep only last 10000 entries
        if (this.props.auditLog.length > 10000) {
            this.props.auditLog = this.props.auditLog.slice(-10000);
        }
    }

    getAuditLog(limit: number = 100): typeof this.props.auditLog {
        return this.props.auditLog.slice(-limit);
    }

    // Helper
    private generateKeyHash(): string {
        return `hash_${uuidv4().replace(/-/g, '')}_${Date.now()}`;
    }

    // Queries
    getActiveKey(type: KeyType): typeof this.props.keys[0] | null {
        return this.props.keys.find(k => k.type === type && k.status === 'ACTIVE') || null;
    }

    getKeysNeedingRotation(): typeof this.props.keys {
        const warningDays = this.props.rotationPolicy?.rotationWarningDays ?? 14;
        const warningTime = Date.now() - (warningDays * 24 * 60 * 60 * 1000);

        return this.props.keys.filter(k => {
            if (k.status !== 'ACTIVE') return false;
            const createdTime = new Date(k.createdAt).getTime();
            return createdTime < warningTime;
        });
    }

    getSecretsExpiringSoon(days: number = 7): typeof this.props.secrets {
        const cutoff = Date.now() + (days * 24 * 60 * 60 * 1000);
        return this.props.secrets.filter(s => {
            if (!s.expiresAt) return false;
            return new Date(s.expiresAt).getTime() < cutoff;
        });
    }

    getAuditStats(days: number = 30): {
        totalOperations: number;
        encryptCount: number;
        decryptCount: number;
        secretAccessCount: number;
        failedOperations: number;
    } {
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
        const recentLogs = this.props.auditLog.filter(l => new Date(l.timestamp).getTime() > cutoff);

        return {
            totalOperations: recentLogs.length,
            encryptCount: recentLogs.filter(l => l.action === 'ENCRYPT').length,
            decryptCount: recentLogs.filter(l => l.action === 'DECRYPT').length,
            secretAccessCount: recentLogs.filter(l => l.action === 'ACCESS_SECRET').length,
            failedOperations: recentLogs.filter(l => !l.success).length,
        };
    }

    // Snapshot
    toSnapshot(): EncryptionServiceProps {
        return { ...this.props };
    }

    toJSON(): Record<string, unknown> {
        return {
            id: this.props.id,
            tenantId: this.props.tenantId,
            nombre: this.props.nombre,
            activo: this.props.activo,
            defaultAlgorithm: this.props.defaultAlgorithm,
            hsmEnabled: this.props.hsmEnabled,
            hsmProvider: this.props.hsmProvider,
            keysCount: this.props.keys.length,
            activeKeysCount: this.props.keys.filter(k => k.status === 'ACTIVE').length,
            secretsCount: this.props.secrets.length,
            fieldEncryptionsCount: this.props.fieldEncryptions.length,
            keysNeedingRotation: this.getKeysNeedingRotation().length,
            rotationPolicy: this.props.rotationPolicy,
        };
    }
}

// ==================== EXPORTS ====================

export const ENCRYPTION_ALGORITHM_LABELS: Record<EncryptionAlgorithm, { label: string; type: string; quantum_resistant: boolean }> = {
    AES_256_GCM: { label: 'AES-256-GCM', type: 'Symmetric', quantum_resistant: false },
    AES_256_CBC: { label: 'AES-256-CBC', type: 'Symmetric', quantum_resistant: false },
    CHACHA20_POLY1305: { label: 'ChaCha20-Poly1305', type: 'Symmetric', quantum_resistant: false },
    RSA_2048: { label: 'RSA-2048', type: 'Asymmetric', quantum_resistant: false },
    RSA_4096: { label: 'RSA-4096', type: 'Asymmetric', quantum_resistant: false },
    EC_SECP256R1: { label: 'ECDSA P-256', type: 'Elliptic Curve', quantum_resistant: false },
    POST_QUANTUM_KYBER: { label: 'Kyber-1024', type: 'Post-Quantum', quantum_resistant: true },
    POST_QUANTUM_NTRU: { label: 'NTRU-HRSS-701', type: 'Post-Quantum', quantum_resistant: true },
};

export const KEY_TYPE_LABELS: Record<KeyType, string> = {
    MASTER: 'Master Key',
    DATA_ENCRYPTION: 'Data Encryption Key',
    SIGNING: 'Signing Key',
    AUTHENTICATION: 'Authentication Key',
    FIELD_LEVEL: 'Field-Level Encryption Key',
};

export const SECRET_TYPE_LABELS: Record<SecretType, string> = {
    API_KEY: 'API Key',
    DATABASE_PASSWORD: 'Database Password',
    CERTIFICATE: 'Certificate',
    PRIVATE_KEY: 'Private Key',
    TOKEN: 'Token',
    CREDENTIAL: 'Credential',
};