/**
 * Encryption API - Enterprise Encryption and Security
 * CATEGORY: CRITICAL - DDD + CQRS
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { logger } from '@/lib/observability';
import { auditLogger } from '@/lib/security/audit-logger';
import { AuditEventType } from '@/lib/security/audit-types';
import { v4 as uuidv4 } from 'uuid';
import { EncryptionService, EncryptionServiceProps, ENCRYPTION_ALGORITHM_LABELS, KEY_TYPE_LABELS, SECRET_TYPE_LABELS } from '@/modules/configuracion/domain/entities/EncryptionService';

// ==================== MOCK DATABASE ====================

const mockEncryptionServices = new Map<string, EncryptionServiceProps>();

function getEncryptionByTenant(tenantId: string): EncryptionServiceProps | undefined {
    return Array.from(mockEncryptionServices.values()).find(e => e.tenantId === tenantId);
}

function createEncryption(data: Omit<EncryptionServiceProps, 'id' | 'version' | 'creadoAt' | 'actualizadoAt'>): EncryptionServiceProps {
    const now = new Date().toISOString();
    const service: EncryptionServiceProps = {
        ...data,
        id: uuidv4(),
        version: 1,
        creadoAt: now,
        actualizadoAt: now,
    } as EncryptionServiceProps;
    mockEncryptionServices.set(service.id, service);
    return service;
}

function updateEncryption(id: string, updates: Partial<EncryptionServiceProps>): EncryptionServiceProps | undefined {
    const existing = mockEncryptionServices.get(id);
    if (!existing) return undefined;

    const updated: EncryptionServiceProps = {
        ...existing,
        ...updates,
        version: existing.version + 1,
        actualizadoAt: new Date().toISOString(),
    } as EncryptionServiceProps;
    mockEncryptionServices.set(id, updated);
    return updated;
}

// ==================== SCHEMAS ====================

const CreateEncryptionServiceSchema = z.object({
    nombre: z.string().min(1).max(255),
    descripcion: z.string().max(500).optional(),
    defaultAlgorithm: z.enum([
        'AES_256_GCM', 'AES_256_CBC', 'CHACHA20_POLY1305',
        'RSA_2048', 'RSA_4096', 'EC_SECP256R1',
        'POST_QUANTUM_KYBER', 'POST_QUANTUM_NTRU',
    ]).default('AES_256_GCM'),
    hsmEnabled: z.boolean().default(false),
    hsmProvider: z.enum(['AWS_KMS', 'AZURE_KEY_VAULT', 'GCP_CLOUD_KMS', 'LOCAL_HSM', 'SOFTWARE']).default('SOFTWARE'),
    hsmEndpoint: z.string().url().optional(),
});

const CreateKeySchema = z.object({
    name: z.string().min(1).max(255),
    type: z.enum(['MASTER', 'DATA_ENCRYPTION', 'SIGNING', 'AUTHENTICATION', 'FIELD_LEVEL']),
    algorithm: z.enum([
        'AES_256_GCM', 'AES_256_CBC', 'CHACHA20_POLY1305',
        'RSA_2048', 'RSA_4096', 'EC_SECP256R1',
        'POST_QUANTUM_KYBER', 'POST_QUANTUM_NTRU',
    ]).optional(),
    expiresAt: z.string().datetime().optional(),
});

const StoreSecretSchema = z.object({
    name: z.string().min(1).max(255),
    type: z.enum(['API_KEY', 'DATABASE_PASSWORD', 'CERTIFICATE', 'PRIVATE_KEY', 'TOKEN', 'CREDENTIAL']),
    value: z.string().min(1),
    description: z.string().max(500).optional(),
    tags: z.array(z.string()).default([]),
    expiresAt: z.string().datetime().optional(),
    rotationPolicyDays: z.number().min(1).max(365).optional(),
});

const EncryptDataSchema = z.object({
    plaintext: z.string().min(1),
    keyId: z.string().uuid().optional(),
    algorithm: z.enum(['AES_256_GCM', 'AES_256_CBC', 'CHACHA20_POLY1305']).optional(),
});

const DecryptDataSchema = z.object({
    ciphertext: z.string().min(1),
    keyId: z.string().uuid(),
});

// ==================== GET /api/encryption ====================

export const GET = withApiRoute(
    { resource: 'encryption', action: 'read', skipCsrf: true },
    async ({ ctx }) => {
        try {
            const tenantId = ctx.tenantId;
            let encryption = getEncryptionByTenant(tenantId);

            // Create default if not exists
            if (!encryption) {
                const entity = EncryptionService.createDefault(tenantId, 'Encryption Service');
                encryption = entity.toSnapshot();
                createEncryption(encryption);
            }

            return apiSuccess({
                id: encryption.id,
                nombre: encryption.nombre,
                descripcion: encryption.descripcion,
                activo: encryption.activo,
                defaultAlgorithm: encryption.defaultAlgorithm,
                defaultAlgorithmInfo: ENCRYPTION_ALGORITHM_LABELS[encryption.defaultAlgorithm as keyof typeof ENCRYPTION_ALGORITHM_LABELS],
                hsmEnabled: encryption.hsmEnabled,
                hsmProvider: encryption.hsmProvider,
                keys: encryption.keys.map(k => ({
                    id: k.id,
                    name: k.name,
                    type: k.type,
                    typeInfo: KEY_TYPE_LABELS[k.type as keyof typeof KEY_TYPE_LABELS],
                    algorithm: k.algorithm,
                    algorithmInfo: ENCRYPTION_ALGORITHM_LABELS[k.algorithm as keyof typeof ENCRYPTION_ALGORITHM_LABELS],
                    status: k.status,
                    version: k.version,
                    createdAt: k.createdAt,
                    rotatedAt: k.rotatedAt,
                    expiresAt: k.expiresAt,
                })),
                keysCount: encryption.keys.length,
                activeKeysCount: encryption.keys.filter(k => k.status === 'ACTIVE').length,
                secretsCount: encryption.secrets.length,
                fieldEncryptionsCount: encryption.fieldEncryptions.length,
                rotationPolicy: encryption.rotationPolicy,
                accessControl: encryption.accessControl,
                auditStats: {
                    totalOperations: encryption.auditLog.length,
                    encryptCount: encryption.auditLog.filter(l => l.action === 'ENCRYPT').length,
                    decryptCount: encryption.auditLog.filter(l => l.action === 'DECRYPT').length,
                    secretAccessCount: encryption.auditLog.filter(l => l.action === 'ACCESS_SECRET').length,
                },
            }) as unknown as NextResponse;
        } catch (error) {
            logger.error('Error GET /api/encryption', error instanceof Error ? error : undefined);
            return apiServerError() as unknown as NextResponse;
        }
    }
);

// ==================== POST /api/encryption ====================

export const POST = withApiRoute(
    { resource: 'encryption', action: 'create' },
    async ({ ctx, req }) => {
        try {
            const tenantId = ctx.tenantId;
            const userId = ctx.userId;
            const body = await req.json();
            const { action } = body;

            let encryption = getEncryptionByTenant(tenantId);
            if (!encryption) {
                const entity = EncryptionService.createDefault(tenantId, 'Encryption Service');
                encryption = entity.toSnapshot();
                createEncryption(encryption);
            }

            switch (action) {
                case 'create': {
                    const parsed = CreateEncryptionServiceSchema.safeParse(body.data || body);
                    if (!parsed.success) {
                        return apiError('VALIDATION_ERROR', 'Error de validación', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
                    }

                    const entity = EncryptionService.create({
                        tenantId,
                        nombre: parsed.data.nombre,
                        descripcion: parsed.data.descripcion,
                        activo: true,
                        hsmEnabled: parsed.data.hsmEnabled,
                        hsmProvider: parsed.data.hsmProvider as any,
                        hsmConfig: parsed.data.hsmEndpoint ? { endpoint: parsed.data.hsmEndpoint } : undefined,
                        fieldEncryptions: [],
                        accessControl: {
                            requireMFA: true,
                            requireApproval: false,
                            approvers: [],
                            allowedTeams: [],
                            auditAllAccess: true,
                        },
                    });

                    const snapshot = entity.toSnapshot();
                    createEncryption(snapshot);

                    auditLogger.log({
                        type: AuditEventType.DATA_CREATE,
                        userId,
                        metadata: { module: 'encryption', resourceId: snapshot.id },
                    });

                    return apiSuccess({ id: snapshot.id, nombre: snapshot.nombre }, 201) as unknown as NextResponse;
                }

                case 'create_key': {
                    const parsed = CreateKeySchema.safeParse(body.data || body);
                    if (!parsed.success) {
                        return apiError('VALIDATION_ERROR', 'Error de validación', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
                    }

                    const entity = EncryptionService.fromSnapshot(encryption);
                    const keyId = entity.createKey({
                        name: parsed.data.name,
                        type: parsed.data.type as any,
                        algorithm: parsed.data.algorithm as any,
                        expiresAt: parsed.data.expiresAt,
                    });

                    updateEncryption(encryption.id, entity.toSnapshot());

                    auditLogger.log({
                        type: AuditEventType.DATA_CREATE,
                        userId,
                        metadata: { module: 'encryption_key', resourceId: keyId },
                    });

                    return apiSuccess({ id: keyId, name: parsed.data.name, type: parsed.data.type }, 201) as unknown as NextResponse;
                }

                case 'rotate_key': {
                    const keyId = body.keyId;

                    const entity = EncryptionService.fromSnapshot(encryption);
                    entity.rotateKey(keyId, userId);
                    updateEncryption(encryption.id, entity.toSnapshot());

                    auditLogger.log({
                        type: AuditEventType.DATA_UPDATE,
                        userId,
                        metadata: { module: 'encryption_key', resourceId: keyId, action: 'rotate' },
                    });

                    return apiSuccess({ rotated: true, keyId }) as unknown as NextResponse;
                }

                case 'deprecate_key': {
                    const keyId = body.keyId;
                    const reason = body.reason || 'Manual deprecation';

                    const entity = EncryptionService.fromSnapshot(encryption);
                    entity.deprecateKey(keyId, reason);
                    updateEncryption(encryption.id, entity.toSnapshot());

                    return apiSuccess({ deprecated: true, keyId }) as unknown as NextResponse;
                }

                case 'mark_compromised': {
                    const keyId = body.keyId;

                    const entity = EncryptionService.fromSnapshot(encryption);
                    entity.markKeyCompromised(keyId);
                    updateEncryption(encryption.id, entity.toSnapshot());

                    auditLogger.log({
                        type: AuditEventType.SECURITY_VIOLATION,
                        userId,
                        metadata: { module: 'encryption_key', resourceId: keyId, action: 'compromised' },
                    });

                    return apiSuccess({ compromised: true, keyId, warning: 'Key marked as compromised. Immediate rotation recommended.' }) as unknown as NextResponse;
                }

                case 'store_secret': {
                    const parsed = StoreSecretSchema.safeParse(body.data || body);
                    if (!parsed.success) {
                        return apiError('VALIDATION_ERROR', 'Error de validación', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
                    }

                    const entity = EncryptionService.fromSnapshot(encryption);
                    const secretId = entity.storeSecret({
                        name: parsed.data.name,
                        type: parsed.data.type as any,
                        value: parsed.data.value,
                        description: parsed.data.description,
                        tags: parsed.data.tags,
                        expiresAt: parsed.data.expiresAt,
                        rotationPolicyDays: parsed.data.rotationPolicyDays,
                    });

                    updateEncryption(encryption.id, entity.toSnapshot());

                    auditLogger.log({
                        type: AuditEventType.DATA_CREATE,
                        userId,
                        metadata: { module: 'encryption_secret', resourceId: secretId },
                    });

                    return apiSuccess({ id: secretId, name: parsed.data.name, type: parsed.data.type }, 201) as unknown as NextResponse;
                }

                case 'access_secret': {
                    const secretId = body.secretId;

                    const entity = EncryptionService.fromSnapshot(encryption);
                    const value = entity.accessSecret(secretId, userId);
                    updateEncryption(encryption.id, entity.toSnapshot());

                    return apiSuccess({
                        secretId,
                        value: '***ENCRYPTED***', // Don't return actual secret in response
                        accessedAt: new Date().toISOString(),
                        accessCount: encryption.secrets.find(s => s.id === secretId)?.accessCount || 0,
                    }) as unknown as NextResponse;
                }

                case 'rotate_secret': {
                    const secretId = body.secretId;

                    const entity = EncryptionService.fromSnapshot(encryption);
                    entity.rotateSecret(secretId);
                    updateEncryption(encryption.id, entity.toSnapshot());

                    return apiSuccess({ rotated: true, secretId }) as unknown as NextResponse;
                }

                case 'encrypt': {
                    const parsed = EncryptDataSchema.safeParse(body.data || body);
                    if (!parsed.success) {
                        return apiError('VALIDATION_ERROR', 'Error de validación', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
                    }

                    const entity = EncryptionService.fromSnapshot(encryption);
                    const result = entity.encrypt(parsed.data.plaintext, parsed.data.keyId);
                    updateEncryption(encryption.id, entity.toSnapshot());

                    return apiSuccess({
                        ciphertext: result.ciphertext,
                        keyId: result.keyId,
                        algorithm: result.algorithm,
                    }) as unknown as NextResponse;
                }

                case 'decrypt': {
                    const parsed = DecryptDataSchema.safeParse(body.data || body);
                    if (!parsed.success) {
                        return apiError('VALIDATION_ERROR', 'Error de validación', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
                    }

                    const entity = EncryptionService.fromSnapshot(encryption);
                    const plaintext = entity.decrypt(parsed.data.ciphertext, parsed.data.keyId);
                    updateEncryption(encryption.id, entity.toSnapshot());

                    return apiSuccess({ plaintext }) as unknown as NextResponse;
                }

                case 'add_field_encryption': {
                    const fieldConfig = body.config || body;

                    const entity = EncryptionService.fromSnapshot(encryption);
                    entity.addFieldEncryption({
                        tableName: fieldConfig.tableName,
                        columnName: fieldConfig.columnName,
                        algorithm: fieldConfig.algorithm as any,
                        enableSearch: fieldConfig.enableSearch,
                        preserveFormat: fieldConfig.preserveFormat,
                    });
                    updateEncryption(encryption.id, entity.toSnapshot());

                    return apiSuccess({ added: true, tableName: fieldConfig.tableName, columnName: fieldConfig.columnName }) as unknown as NextResponse;
                }

                case 'update_rotation_policy': {
                    const policy = body.policy;

                    const entity = EncryptionService.fromSnapshot(encryption);
                    entity.updateRotationPolicy({
                        automaticRotation: policy.automaticRotation,
                        rotationIntervalDays: policy.rotationIntervalDays,
                        rotationWarningDays: policy.rotationWarningDays,
                        minKeyVersions: policy.minKeyVersions,
                        allowManualRotation: policy.allowManualRotation,
                    });
                    updateEncryption(encryption.id, entity.toSnapshot());

                    return apiSuccess({ updated: true, rotationPolicy: entity.toSnapshot().rotationPolicy }) as unknown as NextResponse;
                }

                case 'get_audit_log': {
                    const limit = body.limit || 100;

                    const entity = EncryptionService.fromSnapshot(encryption);
                    const logs = entity.getAuditLog(limit);

                    return apiSuccess({
                        items: logs,
                        total: logs.length,
                    }) as unknown as NextResponse;
                }

                default:
                    return apiError('INVALID_ACTION', `Acción no válida: ${action}`, 400) as unknown as NextResponse;
            }
        } catch (error) {
            logger.error('Error POST /api/encryption', error instanceof Error ? error : undefined);
            return apiServerError() as unknown as NextResponse;
        }
    }
);