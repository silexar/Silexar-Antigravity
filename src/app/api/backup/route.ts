/**
 * Backup API - Enterprise Backup and Disaster Recovery
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
import { BackupConfig, BackupConfigProps, STORAGE_LOCATION_LABELS, BACKUP_TYPE_LABELS } from '@/modules/configuracion/domain/entities/BackupConfig';

// ==================== MOCK DATABASE ====================

const mockBackups = new Map<string, BackupConfigProps>();

function getBackupByTenant(tenantId: string): BackupConfigProps | undefined {
    return Array.from(mockBackups.values()).find(b => b.tenantId === tenantId);
}

function createBackup(data: Omit<BackupConfigProps, 'id' | 'version' | 'creadoAt' | 'actualizadoAt'>): BackupConfigProps {
    const now = new Date().toISOString();
    const backup: BackupConfigProps = {
        ...data,
        id: uuidv4(),
        version: 1,
        creadoAt: now,
        actualizadoAt: now,
    } as BackupConfigProps;
    mockBackups.set(backup.id, backup);
    return backup;
}

function updateBackup(id: string, updates: Partial<BackupConfigProps>): BackupConfigProps | undefined {
    const existing = mockBackups.get(id);
    if (!existing) return undefined;

    const updated: BackupConfigProps = {
        ...existing,
        ...updates,
        version: existing.version + 1,
        actualizadoAt: new Date().toISOString(),
    } as BackupConfigProps;
    mockBackups.set(id, updated);
    return updated;
}

// ==================== SCHEMAS ====================

const CreateBackupSchema = z.object({
    nombre: z.string().min(1).max(255),
    modo: z.enum(['MANUAL', 'AUTOMATED', 'CONTINUOUS']).default('AUTOMATED'),
    rtoMinutes: z.number().min(1).default(60),
    rpoMinutes: z.number().min(1).default(15),
    primaryLocation: z.enum(['LOCAL', 'S3', 'GCS', 'AZURE_BLOB', 'CROSS_REGION']).default('S3'),
    crossRegionEnabled: z.boolean().default(false),
});

const AddScheduleSchema = z.object({
    nombre: z.string().min(1).max(255),
    tipo: z.enum(['FULL', 'INCREMENTAL', 'DIFFERENTIAL', 'CONTINUOUS']),
    frecuencia: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'CONTINUOUS']),
    hora: z.number().min(0).max(23).optional(),
    minuto: z.number().min(0).max(59).default(0),
    diaSemana: z.number().min(0).max(6).optional(),
    retentionDays: z.number().min(1).max(365).default(30),
});

const InitiateRestoreSchema = z.object({
    restorePointId: z.string().uuid(),
    targetEnvironment: z.string().optional(),
    targetDatabase: z.string().optional(),
    tablesToRestore: z.array(z.string()).optional(),
});

// ==================== GET /api/backup ====================

export const GET = withApiRoute(
    { resource: 'backup_restore', action: 'read', skipCsrf: true },
    async ({ ctx }) => {
        try {
            const tenantId = ctx.tenantId;
            let backup = getBackupByTenant(tenantId);

            // Create default if not exists
            if (!backup) {
                const entity = BackupConfig.createDefault(tenantId, 'Backup Configuration');
                backup = entity.toSnapshot();
                createBackup(backup);
            }

            return apiSuccess({
                id: backup.id,
                nombre: backup.nombre,
                modo: backup.modo,
                activo: backup.activo,
                rtoMinutes: backup.rtoMinutes,
                rpoMinutes: backup.rpoMinutes,
                rtoCumplido: backup.rtoCumplido,
                rpoCumplido: backup.rpoCumplido,
                schedules: backup.schedules.map(s => ({
                    id: s.id,
                    nombre: s.nombre,
                    tipo: s.tipo,
                    tipoInfo: BACKUP_TYPE_LABELS[s.tipo],
                    frecuencia: s.frecuencia,
                    hora: s.hora,
                    minuto: s.minuto,
                    diaSemana: s.diaSemana,
                    habilitado: s.habilitado,
                    retentionDays: s.retentionDays,
                    lastRunAt: s.lastRunAt,
                    lastRunStatus: s.lastRunStatus,
                    lastRunDurationSeconds: s.lastRunDurationSeconds,
                    lastRunSizeBytes: s.lastRunSizeBytes,
                    nextRunAt: s.nextRunAt,
                    primaryLocation: s.primaryLocation,
                    locationInfo: STORAGE_LOCATION_LABELS[s.primaryLocation],
                })),
                schedulesCount: backup.schedules.length,
                restorePointsCount: backup.restorePoints.length,
                verifiedRestorePoints: backup.restorePoints.filter(p => p.verified).length,
                restoreOperationsCount: backup.restoreOperations.length,
                stats: backup.stats ? {
                    totalBackups: backup.stats.totalBackups,
                    successfulBackups: backup.stats.successfulBackups,
                    failedBackups: backup.stats.failedBackups,
                    successRate: backup.stats.totalBackups > 0
                        ? Math.round((backup.stats.successfulBackups / backup.stats.totalBackups) * 10000) / 100
                        : 100,
                    averageBackupDurationSeconds: backup.stats.averageBackupDurationSeconds,
                    averageRestoreDurationSeconds: backup.stats.averageRestoreDurationSeconds,
                    totalStorageUsedBytes: backup.stats.totalStorageUsedBytes,
                    totalStorageUsedGB: Math.round(backup.stats.totalStorageUsedBytes / (1024 * 1024 * 1024) * 100) / 100,
                    lastBackupAt: backup.stats.lastBackupAt,
                    lastRestoreAt: backup.stats.lastRestoreAt,
                } : null,
                crossRegionEnabled: backup.crossRegionConfig?.enabled || false,
                testRestoreEnabled: backup.testRestoreConfig?.enabled || false,
                testRestoreLastResult: backup.testRestoreConfig?.lastTestResult,
            }) as unknown as NextResponse;
        } catch (error) {
            logger.error('Error GET /api/backup', error instanceof Error ? error : undefined);
            return apiServerError() as unknown as NextResponse;
        }
    }
);

// ==================== POST /api/backup ====================

export const POST = withApiRoute(
    { resource: 'backup_restore', action: 'create' },
    async ({ ctx, req }) => {
        try {
            const tenantId = ctx.tenantId;
            const userId = ctx.userId;
            const body = await req.json();
            const { action } = body;

            let backup = getBackupByTenant(tenantId);
            if (!backup) {
                const entity = BackupConfig.createDefault(tenantId, 'Backup Configuration');
                backup = entity.toSnapshot();
                createBackup(backup);
            }

            switch (action) {
                case 'create': {
                    const parsed = CreateBackupSchema.safeParse(body.data || body);
                    if (!parsed.success) {
                        return apiError('VALIDATION_ERROR', 'Error de validación', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
                    }

                    const entity = BackupConfig.create({
                        tenantId,
                        nombre: parsed.data.nombre,
                        modo: parsed.data.modo,
                        activo: true,
                        rtoMinutes: parsed.data.rtoMinutes,
                        rpoMinutes: parsed.data.rpoMinutes,
                        schedules: [],
                        crossRegionConfig: {
                            enabled: parsed.data.crossRegionEnabled,
                            primaryRegion: 'us-east-1',
                            secondaryRegion: 'us-west-2',
                            replicationFrequencyMinutes: 60,
                        },
                        testRestoreConfig: {
                            enabled: true,
                            frequencyDays: 7,
                            targetEnvironment: 'staging',
                        },
                    });

                    const snapshot = entity.toSnapshot();
                    createBackup(snapshot);

                    auditLogger.log({
                        type: AuditEventType.DATA_CREATE,
                        userId,
                        metadata: { module: 'backup_config', resourceId: snapshot.id },
                    });

                    return apiSuccess({ id: snapshot.id, nombre: snapshot.nombre }, 201) as unknown as NextResponse;
                }

                case 'add_schedule': {
                    const parsed = AddScheduleSchema.safeParse(body.data || body);
                    if (!parsed.success) {
                        return apiError('VALIDATION_ERROR', 'Error de validación', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
                    }

                    const entity = BackupConfig.fromSnapshot(backup);
                    const scheduleId = entity.addSchedule({
                        nombre: parsed.data.nombre,
                        tipo: parsed.data.tipo as 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL' | 'CONTINUOUS',
                        frecuencia: parsed.data.frecuencia as 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CONTINUOUS',
                        hora: parsed.data.hora,
                        minuto: parsed.data.minuto,
                        diaSemana: parsed.data.diaSemana,
                        retentionDays: parsed.data.retentionDays,
                        primaryLocation: 'S3' as any,
                    });

                    updateBackup(backup.id, entity.toSnapshot());

                    return apiSuccess({ id: scheduleId, nombre: parsed.data.nombre }, 201) as unknown as NextResponse;
                }

                case 'initiate_restore': {
                    const parsed = InitiateRestoreSchema.safeParse(body.data || body);
                    if (!parsed.success) {
                        return apiError('VALIDATION_ERROR', 'Error de validación', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
                    }

                    const entity = BackupConfig.fromSnapshot(backup);
                    const operationId = entity.initiateRestore(parsed.data.restorePointId, {
                        initiatedById: userId,
                        targetEnvironment: parsed.data.targetEnvironment,
                        targetDatabase: parsed.data.targetDatabase,
                        tablesToRestore: parsed.data.tablesToRestore,
                    });

                    updateBackup(backup.id, entity.toSnapshot());

                    auditLogger.log({
                        type: AuditEventType.DATA_ACCESS,
                        userId,
                        metadata: { action: 'restore_initiated', restorePointId: parsed.data.restorePointId },
                    });

                    return apiSuccess({ operationId, status: 'IN_PROGRESS' }, 202) as unknown as NextResponse;
                }

                case 'complete_restore': {
                    const operationId = body.operationId;
                    const result = body.result || {};

                    const entity = BackupConfig.fromSnapshot(backup);
                    entity.completeRestore(operationId, {
                        success: result.success ?? true,
                        rowsRestored: result.rowsRestored,
                        errors: result.errors,
                    });

                    updateBackup(backup.id, entity.toSnapshot());

                    return apiSuccess({ completed: true, operationId }) as unknown as NextResponse;
                }

                case 'verify_restore_point': {
                    const pointId = body.restorePointId;
                    const location = body.location || 'S3';

                    const entity = BackupConfig.fromSnapshot(backup);
                    entity.verifyRestorePoint(pointId, location as any);
                    updateBackup(backup.id, entity.toSnapshot());

                    return apiSuccess({ verified: true, restorePointId: pointId, location }) as unknown as NextResponse;
                }

                case 'test_restore': {
                    const entity = BackupConfig.fromSnapshot(backup);
                    const result = entity.runTestRestore();
                    updateBackup(backup.id, entity.toSnapshot());

                    return apiSuccess(result) as unknown as NextResponse;
                }

                case 'replicate': {
                    const entity = BackupConfig.fromSnapshot(backup);
                    entity.replicateToSecondary();
                    updateBackup(backup.id, entity.toSnapshot());

                    return apiSuccess({ replicated: true, timestamp: new Date().toISOString() }) as unknown as NextResponse;
                }

                default:
                    return apiError('INVALID_ACTION', `Acción no válida: ${action}`, 400) as unknown as NextResponse;
            }
        } catch (error) {
            logger.error('Error POST /api/backup', error instanceof Error ? error : undefined);
            return apiServerError() as unknown as NextResponse;
        }
    }
);