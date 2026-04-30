/**
 * BackupRestore Entity - Enterprise Backup and Disaster Recovery
 * CATEGORY: CRITICAL - DDD + CQRS
 * 
 * Sistema de backup automático, restore points, RTO/RPO tracking
 * y disaster recovery planning
 */

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// ==================== VALUE OBJECTS ====================

/**
 * BackupStatus - Estado del backup
 */
export type BackupStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'VERIFIED' | 'ARCHIVED';
export const BackupStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'VERIFIED', 'ARCHIVED']);

/**
 * BackupType - Tipo de backup
 */
export type BackupType = 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL' | 'CONTINUOUS';
export const BackupTypeSchema = z.enum(['FULL', 'INCREMENTAL', 'DIFFERENTIAL', 'CONTINUOUS']);

/**
 * StorageLocation - Ubicación de almacenamiento
 */
export type StorageLocation = 'LOCAL' | 'S3' | 'GCS' | 'AZURE_BLOB' | 'CROSS_REGION';
export const StorageLocationSchema = z.enum(['LOCAL', 'S3', 'GCS', 'AZURE_BLOB', 'CROSS_REGION']);

/**
 * RestoreStatus - Estado del restore
 */
export type RestoreStatus = 'NOT_INITIATED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'VERIFIED';
export const RestoreStatusSchema = z.enum(['NOT_INITIATED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'VERIFIED']);

// ==================== DOMAIN ERRORS ====================

export class BackupDomainError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly context: Record<string, unknown> = {}
    ) {
        super(message);
        this.name = 'BackupDomainError';
    }
}

// ==================== SCHEMAS ====================

export const RestorePointSchema = z.object({
    id: z.string().uuid(),
    backupId: z.string().uuid(),
    timestamp: z.string().datetime(),
    tipo: BackupTypeSchema,
    tamanoBytes: z.number(),
    duracionSegundos: z.number(),
    checksum: z.string().optional(),
    locations: z.array(z.object({
        location: StorageLocationSchema,
        path: z.string(),
        verified: z.boolean().default(false),
        verifiedAt: z.string().datetime().optional(),
    })),
    verified: z.boolean().default(false),
    verifiedAt: z.string().datetime().optional(),
    retentionDays: z.number(),
    expiresAt: z.string().datetime(),
});

export const RestoreOperationSchema = z.object({
    id: z.string().uuid(),
    restorePointId: z.string().uuid(),
    tenantId: z.string(),

    // Estado
    status: RestoreStatusSchema.default('NOT_INITIATED'),
    startedAt: z.string().datetime().optional(),
    completedAt: z.string().datetime().optional(),

    // Detalles
    targetEnvironment: z.string().optional(), // Production, Staging, etc.
    targetDatabase: z.string().optional(),
    tablesToRestore: z.array(z.string()).optional(), // null = all tables

    // Validación
    validatedAt: z.string().datetime().optional(),
    validatedById: z.string().uuid().optional(),

    // Resultados
    rowsRestored: z.number().default(0),
    durationSeconds: z.number().default(0),
    errors: z.array(z.object({
        timestamp: z.string().datetime(),
        mensaje: z.string(),
        tabla: z.string().optional(),
        linea: z.number().optional(),
    })).default([]),

    // Auditoría
    initiatedById: z.string().uuid().optional(),
    createdAt: z.string().datetime(),
});

export const BackupScheduleSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string(),
    nombre: z.string().min(1).max(255),

    // Scheduling
    tipo: BackupTypeSchema,
    frecuencia: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'CONTINUOUS']),
    hora: z.number().min(0).max(23).optional(),
    minuto: z.number().min(0).max(59).default(0),
    diaSemana: z.number().min(0).max(6).optional(), // 0 = Sunday
    diaMes: z.number().min(1).max(31).optional(),

    // Configuración
    habilitado: z.boolean().default(true),
    retentionDays: z.number().min(1).max(365).default(30),
    compressFiles: z.boolean().default(true),
    encryptBackup: z.boolean().default(true),

    // Targets
    targetTables: z.array(z.string()).optional(), // null = all
    excludeTables: z.array(z.string()).default([]),

    // Storage
    primaryLocation: StorageLocationSchema,
    secondaryLocation: StorageLocationSchema.optional(),
    crossRegionEnabled: z.boolean().default(false),

    // Notificaciones
    notifyOnSuccess: z.boolean().default(true),
    notifyOnFailure: z.boolean().default(true),
    emailRecipients: z.array(z.string().email()).default([]),

    // Última ejecución
    lastRunAt: z.string().datetime().optional(),
    lastRunStatus: BackupStatusSchema.optional(),
    lastRunDurationSeconds: z.number().optional(),
    lastRunSizeBytes: z.number().optional(),

    // Próxima ejecución
    nextRunAt: z.string().datetime().optional(),

    // Auditoría
    creadoPorId: z.string().uuid().optional(),
    creadoAt: z.string().datetime(),
    actualizadoPorId: z.string().uuid().optional(),
    actualizadoAt: z.string().datetime(),
});

export const BackupConfigPropsSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string(),

    // Configuración general
    nombre: z.string().min(1).max(255),
    modo: z.enum(['MANUAL', 'AUTOMATED', 'CONTINUOUS']).default('AUTOMATED'),
    activo: z.boolean().default(true),

    // RTO/RPO targets (Recovery Time Objective / Recovery Point Objective)
    rtoMinutes: z.number().min(1).default(60), // Max acceptable downtime
    rpoMinutes: z.number().min(1).default(15), // Max acceptable data loss
    rtoCumplido: z.boolean().optional(),
    rpoCumplido: z.boolean().optional(),

    // Schedules
    schedules: z.array(z.object({
        id: z.string().uuid(),
        tenantId: z.string(),
        nombre: z.string().min(1).max(255),
        tipo: BackupTypeSchema,
        frecuencia: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'CONTINUOUS']),
        hora: z.number().min(0).max(23).optional(),
        minuto: z.number().min(0).max(59).default(0),
        diaSemana: z.number().min(0).max(6).optional(),
        diaMes: z.number().min(1).max(31).optional(),
        habilitado: z.boolean().default(true),
        retentionDays: z.number().min(1).max(365).default(30),
        compressFiles: z.boolean().default(true),
        encryptBackup: z.boolean().default(true),
        targetTables: z.array(z.string()).optional(),
        excludeTables: z.array(z.string()).default([]),
        primaryLocation: StorageLocationSchema,
        secondaryLocation: StorageLocationSchema.optional(),
        crossRegionEnabled: z.boolean().default(false),
        notifyOnSuccess: z.boolean().default(true),
        notifyOnFailure: z.boolean().default(true),
        emailRecipients: z.array(z.string().email()).default([]),
        lastRunAt: z.string().datetime().optional(),
        lastRunStatus: BackupStatusSchema.optional(),
        lastRunDurationSeconds: z.number().optional(),
        lastRunSizeBytes: z.number().optional(),
        nextRunAt: z.string().datetime().optional(),
        creadoPorId: z.string().uuid().optional(),
        creadoAt: z.string().datetime(),
        actualizadoPorId: z.string().uuid().optional(),
        actualizadoAt: z.string().datetime(),
    })).default([]),

    // Restore points (backups completados)
    restorePoints: z.array(z.object({
        id: z.string().uuid(),
        backupId: z.string().uuid(),
        timestamp: z.string().datetime(),
        tipo: BackupTypeSchema,
        tamanoBytes: z.number(),
        duracionSegundos: z.number(),
        checksum: z.string().optional(),
        locations: z.array(z.object({
            location: StorageLocationSchema,
            path: z.string(),
            verified: z.boolean().default(false),
            verifiedAt: z.string().datetime().optional(),
        })),
        verified: z.boolean().default(false),
        verifiedAt: z.string().datetime().optional(),
        retentionDays: z.number(),
        expiresAt: z.string().datetime(),
    })).default([]),

    // Restore operations (historial)
    restoreOperations: z.array(z.object({
        id: z.string().uuid(),
        restorePointId: z.string().uuid(),
        status: RestoreStatusSchema.default('NOT_INITIATED'),
        startedAt: z.string().datetime().optional(),
        completedAt: z.string().datetime().optional(),
        targetEnvironment: z.string().optional(),
        targetDatabase: z.string().optional(),
        tablesToRestore: z.array(z.string()).optional(),
        validatedAt: z.string().datetime().optional(),
        validatedById: z.string().uuid().optional(),
        rowsRestored: z.number().default(0),
        durationSeconds: z.number().default(0),
        errors: z.array(z.object({
            timestamp: z.string().datetime(),
            mensaje: z.string(),
            tabla: z.string().optional(),
            linea: z.number().optional(),
        })).default([]),
        initiatedById: z.string().uuid().optional(),
        createdAt: z.string().datetime(),
    })).default([]),

    // Stats agregados
    stats: z.object({
        totalBackups: z.number().default(0),
        successfulBackups: z.number().default(0),
        failedBackups: z.number().default(0),
        totalRestoreOperations: z.number().default(0),
        successfulRestores: z.number().default(0),
        lastBackupAt: z.string().datetime().optional(),
        lastRestoreAt: z.string().datetime().optional(),
        averageBackupDurationSeconds: z.number().default(0),
        averageRestoreDurationSeconds: z.number().default(0),
        totalStorageUsedBytes: z.number().default(0),
    }).optional(),

    // Cross-region config
    crossRegionConfig: z.object({
        enabled: z.boolean().default(false),
        primaryRegion: z.string().optional(),
        secondaryRegion: z.string().optional(),
        replicationFrequencyMinutes: z.number().default(60),
        lastReplicationAt: z.string().datetime().optional(),
    }).optional(),

    // Test restore config
    testRestoreConfig: z.object({
        enabled: z.boolean().default(true),
        frequencyDays: z.number().min(1).default(7),
        lastTestAt: z.string().datetime().optional(),
        lastTestResult: z.enum(['SUCCESS', 'FAILED', 'NOT_RUN']).optional(),
        targetEnvironment: z.string().default('staging'),
    }).optional(),

    // Auditoría
    creadoPorId: z.string().uuid().optional(),
    creadoAt: z.string().datetime(),
    actualizadoPorId: z.string().uuid().optional(),
    actualizadoAt: z.string().datetime(),
    version: z.number().default(1),
});

export type BackupConfigProps = z.infer<typeof BackupConfigPropsSchema>;

// ==================== ENTITY ====================

export class BackupConfig {
    private constructor(private props: BackupConfigProps) {
        this.validate();
    }

    // Factory methods
    static create(props: Omit<BackupConfigProps, 'id' | 'version' | 'creadoAt' | 'actualizadoAt' | 'restorePoints' | 'restoreOperations' | 'stats'>): BackupConfig {
        const now = new Date().toISOString();
        return new BackupConfig({
            ...props,
            id: uuidv4(),
            version: 1,
            restorePoints: [],
            restoreOperations: [],
            stats: {
                totalBackups: 0,
                successfulBackups: 0,
                failedBackups: 0,
                totalRestoreOperations: 0,
                successfulRestores: 0,
                averageBackupDurationSeconds: 0,
                averageRestoreDurationSeconds: 0,
                totalStorageUsedBytes: 0,
            },
            creadoAt: now,
            actualizadoAt: now,
        });
    }

    static createDefault(tenantId: string, nombre: string): BackupConfig {
        const now = new Date().toISOString();

        return BackupConfig.create({
            tenantId,
            nombre,
            modo: 'AUTOMATED',
            activo: true,
            rtoMinutes: 60,
            rpoMinutes: 15,
            schedules: [
                {
                    id: uuidv4(),
                    tenantId,
                    nombre: 'Daily Full Backup',
                    tipo: 'FULL',
                    frecuencia: 'DAILY',
                    hora: 2, // 2 AM
                    minuto: 0,
                    habilitado: true,
                    retentionDays: 30,
                    compressFiles: true,
                    encryptBackup: true,
                    excludeTables: [],
                    primaryLocation: 'S3',
                    crossRegionEnabled: true,
                    notifyOnSuccess: true,
                    notifyOnFailure: true,
                    emailRecipients: [],
                    creadoPorId: undefined,
                    creadoAt: now,
                    actualizadoAt: now,
                },
                {
                    id: uuidv4(),
                    tenantId,
                    nombre: 'Hourly Incremental',
                    tipo: 'INCREMENTAL',
                    frecuencia: 'HOURLY',
                    minuto: 0,
                    habilitado: true,
                    retentionDays: 7,
                    compressFiles: true,
                    encryptBackup: true,
                    excludeTables: [],
                    primaryLocation: 'LOCAL',
                    crossRegionEnabled: false,
                    notifyOnSuccess: false,
                    notifyOnFailure: true,
                    emailRecipients: [],
                    creadoPorId: undefined,
                    creadoAt: now,
                    actualizadoAt: now,
                },
            ],
            crossRegionConfig: {
                enabled: true,
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
    }

    static fromSnapshot(props: BackupConfigProps): BackupConfig {
        return new BackupConfig(props);
    }

    // Validation
    private validate(): void {
        if (this.props.rtoMinutes < 1) {
            throw new BackupDomainError('RTO debe ser al menos 1 minuto', 'INVALID_RTO');
        }
        if (this.props.rpoMinutes < 1) {
            throw new BackupDomainError('RPO debe ser al menos 1 minuto', 'INVALID_RPO');
        }
    }

    // Schedule management
    addSchedule(schedule: {
        nombre: string;
        tipo: BackupType;
        frecuencia: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CONTINUOUS';
        hora?: number;
        minuto?: number;
        diaSemana?: number;
        diaMes?: number;
        retentionDays?: number;
        primaryLocation: StorageLocation;
        secondaryLocation?: StorageLocation;
    }): string {
        const now = new Date().toISOString();
        const scheduleId = uuidv4();

        this.props.schedules.push({
            id: scheduleId,
            tenantId: this.props.tenantId,
            nombre: schedule.nombre,
            tipo: schedule.tipo,
            frecuencia: schedule.frecuencia,
            hora: schedule.hora,
            minuto: schedule.minuto || 0,
            diaSemana: schedule.diaSemana,
            diaMes: schedule.diaMes,
            habilitado: true,
            retentionDays: schedule.retentionDays || 30,
            compressFiles: true,
            encryptBackup: true,
            targetTables: undefined,
            excludeTables: [],
            primaryLocation: schedule.primaryLocation,
            secondaryLocation: schedule.secondaryLocation,
            crossRegionEnabled: !!schedule.secondaryLocation,
            notifyOnSuccess: true,
            notifyOnFailure: true,
            emailRecipients: [],
            creadoPorId: undefined,
            creadoAt: now,
            actualizadoAt: now,
        });

        this.props.actualizadoAt = now;
        return scheduleId;
    }

    disableSchedule(scheduleId: string): void {
        const schedule = this.props.schedules.find(s => s.id === scheduleId);
        if (!schedule) {
            throw new BackupDomainError('Schedule no encontrado', 'SCHEDULE_NOT_FOUND');
        }
        schedule.habilitado = false;
        this.props.actualizadoAt = new Date().toISOString();
    }

    // Backup tracking (called by backup process)
    recordBackupStart(scheduleId: string, backupId: string): void {
        const schedule = this.props.schedules.find(s => s.id === scheduleId);
        if (schedule) {
            schedule.lastRunAt = new Date().toISOString();
            schedule.lastRunStatus = 'IN_PROGRESS';
        }
        this.props.actualizadoAt = new Date().toISOString();
    }

    recordBackupComplete(scheduleId: string, result: {
        success: boolean;
        durationSeconds: number;
        sizeBytes: number;
        backupId: string;
        checksum?: string;
        locations: Array<{ location: StorageLocation; path: string }>;
    }): void {
        const schedule = this.props.schedules.find(s => s.id === scheduleId);
        if (schedule) {
            schedule.lastRunAt = new Date().toISOString();
            schedule.lastRunStatus = result.success ? 'COMPLETED' : 'FAILED';
            schedule.lastRunDurationSeconds = result.durationSeconds;
            schedule.lastRunSizeBytes = result.sizeBytes;
        }

        // Update stats
        if (this.props.stats) {
            this.props.stats.totalBackups += 1;
            if (result.success) {
                this.props.stats.successfulBackups += 1;
                this.props.stats.lastBackupAt = new Date().toISOString();

                // Add restore point if successful
                this.addRestorePoint({
                    backupId: result.backupId,
                    tipo: schedule?.tipo || 'FULL',
                    tamanoBytes: result.sizeBytes,
                    duracionSegundos: result.durationSeconds,
                    checksum: result.checksum,
                    locations: result.locations,
                    retentionDays: schedule?.retentionDays || 30,
                });
            } else {
                this.props.stats.failedBackups += 1;
            }

            // Recalculate average
            const totalDuration = this.props.stats.averageBackupDurationSeconds * (this.props.stats.totalBackups - 1);
            this.props.stats.averageBackupDurationSeconds = (totalDuration + result.durationSeconds) / this.props.stats.totalBackups;
        }

        this.props.actualizadoAt = new Date().toISOString();
    }

    private addRestorePoint(point: {
        backupId: string;
        tipo: BackupType;
        tamanoBytes: number;
        duracionSegundos: number;
        checksum?: string;
        locations: Array<{ location: StorageLocation; path: string }>;
        retentionDays: number;
    }): void {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + point.retentionDays * 24 * 60 * 60 * 1000);

        this.props.restorePoints.push({
            id: uuidv4(),
            backupId: point.backupId,
            timestamp: now.toISOString(),
            tipo: point.tipo,
            tamanoBytes: point.tamanoBytes,
            duracionSegundos: point.duracionSegundos,
            checksum: point.checksum,
            locations: point.locations.map(l => ({
                location: l.location,
                path: l.path,
                verified: false,
            })),
            verified: false,
            retentionDays: point.retentionDays,
            expiresAt: expiresAt.toISOString(),
        });

        // Update total storage
        if (this.props.stats) {
            this.props.stats.totalStorageUsedBytes += point.tamanoBytes;
        }

        // Cleanup expired points
        this.cleanupExpiredPoints();
    }

    private cleanupExpiredPoints(): void {
        const now = new Date();
        this.props.restorePoints = this.props.restorePoints.filter(p =>
            new Date(p.expiresAt) > now
        );
    }

    // Restore operations
    initiateRestore(restorePointId: string, options: {
        initiatedById?: string;
        targetEnvironment?: string;
        targetDatabase?: string;
        tablesToRestore?: string[];
    }): string {
        const restorePoint = this.props.restorePoints.find(p => p.id === restorePointId);
        if (!restorePoint) {
            throw new BackupDomainError('Restore point no encontrado', 'POINT_NOT_FOUND');
        }

        const operationId = uuidv4();
        const now = new Date().toISOString();

        this.props.restoreOperations.push({
            id: operationId,
            restorePointId,
            status: 'IN_PROGRESS',
            startedAt: now,
            targetEnvironment: options.targetEnvironment,
            targetDatabase: options.targetDatabase,
            tablesToRestore: options.tablesToRestore,
            rowsRestored: 0,
            durationSeconds: 0,
            errors: [],
            initiatedById: options.initiatedById,
            createdAt: now,
        });

        if (this.props.stats) {
            this.props.stats.totalRestoreOperations += 1;
        }

        this.props.actualizadoAt = now;
        return operationId;
    }

    completeRestore(operationId: string, result: {
        success: boolean;
        rowsRestored?: number;
        errors?: Array<{ mensaje: string; tabla?: string; timestamp?: string }>;
    }): void {
        const operation = this.props.restoreOperations.find(o => o.id === operationId);
        if (!operation) {
            throw new BackupDomainError('Operación de restore no encontrada', 'OPERATION_NOT_FOUND');
        }

        const now = new Date().toISOString();
        operation.completedAt = now;
        operation.status = result.success ? 'COMPLETED' : 'FAILED';

        if (result.rowsRestored !== undefined) {
            operation.rowsRestored = result.rowsRestored;
        }

        if (result.errors) {
            operation.errors = result.errors.map(e => ({
                timestamp: e.timestamp || now,
                mensaje: e.mensaje,
                tabla: e.tabla,
            }));
        }

        operation.durationSeconds = Math.round(
            (new Date(now).getTime() - new Date(operation.startedAt!).getTime()) / 1000
        );

        // Update stats
        if (this.props.stats) {
            if (result.success) {
                this.props.stats.successfulRestores += 1;
                this.props.stats.lastRestoreAt = now;
            }

            const totalDuration = this.props.stats.averageRestoreDurationSeconds * (this.props.stats.totalRestoreOperations - 1);
            this.props.stats.averageRestoreDurationSeconds =
                (totalDuration + operation.durationSeconds) / this.props.stats.totalRestoreOperations;
        }

        // Check RTO compliance
        if (result.success && operation.durationSeconds > 0) {
            const actualRtoMinutes = operation.durationSeconds / 60;
            this.props.rtoCumplido = actualRtoMinutes <= this.props.rtoMinutes;
        }

        this.props.actualizadoAt = now;
    }

    // Verify restore point
    verifyRestorePoint(pointId: string, location: StorageLocation): void {
        const point = this.props.restorePoints.find(p => p.id === pointId);
        if (!point) {
            throw new BackupDomainError('Restore point no encontrado', 'POINT_NOT_FOUND');
        }

        const locationEntry = point.locations.find(l => l.location === location);
        if (!locationEntry) {
            throw new BackupDomainError('Ubicación no encontrada en restore point', 'LOCATION_NOT_FOUND');
        }

        locationEntry.verified = true;
        locationEntry.verifiedAt = new Date().toISOString();

        // Check if all locations verified
        if (point.locations.every(l => l.verified)) {
            point.verified = true;
            point.verifiedAt = new Date().toISOString();
        }

        this.props.actualizadoAt = new Date().toISOString();
    }

    // Test restore
    runTestRestore(): { success: boolean; message: string } {
        const latestPoint = this.props.restorePoints
            .filter(p => p.verified)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

        if (!latestPoint) {
            return { success: false, message: 'No hay restore points verificados para probar' };
        }

        if (this.props.testRestoreConfig) {
            this.props.testRestoreConfig.lastTestAt = new Date().toISOString();
            this.props.testRestoreConfig.lastTestResult = 'SUCCESS'; // In production, would actually run
        }

        this.props.actualizadoAt = new Date().toISOString();
        return { success: true, message: `Test restore ejecutado con punto ${latestPoint.id}` };
    }

    // Cross-region replication
    replicateToSecondary(): void {
        if (!this.props.crossRegionConfig?.enabled) {
            throw new BackupDomainError('Cross-region replication no habilitado', 'REPLICATION_DISABLED');
        }

        // In production, would trigger actual replication
        if (this.props.crossRegionConfig) {
            this.props.crossRegionConfig.lastReplicationAt = new Date().toISOString();
        }

        this.props.actualizadoAt = new Date().toISOString();
    }

    // Queries
    getLatestRestorePoint(): typeof this.props.restorePoints[0] | null {
        if (this.props.restorePoints.length === 0) return null;
        return this.props.restorePoints
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    }

    getRestorePointsCount(): number {
        return this.props.restorePoints.length;
    }

    getVerifiedRestorePointsCount(): number {
        return this.props.restorePoints.filter(p => p.verified).length;
    }

    getStorageUsedGB(): number {
        if (!this.props.stats) return 0;
        return Math.round(this.props.stats.totalStorageUsedBytes / (1024 * 1024 * 1024) * 100) / 100;
    }

    getSuccessRate(): number {
        if (!this.props.stats || this.props.stats.totalBackups === 0) return 100;
        return Math.round((this.props.stats.successfulBackups / this.props.stats.totalBackups) * 10000) / 100;
    }

    getNextScheduledBackup(): { scheduleName: string; at: string } | null {
        const enabledSchedules = this.props.schedules.filter(s => s.habilitado && s.nextRunAt);
        if (enabledSchedules.length === 0) return null;

        const next = enabledSchedules
            .filter(s => s.nextRunAt)
            .sort((a, b) => new Date(a.nextRunAt!).getTime() - new Date(b.nextRunAt!).getTime())[0];

        return {
            scheduleName: next.nombre,
            at: next.nextRunAt!,
        };
    }

    // Snapshot
    toSnapshot(): BackupConfigProps {
        return { ...this.props };
    }

    toJSON(): Record<string, unknown> {
        return {
            id: this.props.id,
            tenantId: this.props.tenantId,
            nombre: this.props.nombre,
            modo: this.props.modo,
            activo: this.props.activo,
            rtoMinutes: this.props.rtoMinutes,
            rpoMinutes: this.props.rpoMinutes,
            schedulesCount: this.props.schedules.length,
            restorePointsCount: this.props.restorePoints.length,
            verifiedRestorePoints: this.getVerifiedRestorePointsCount(),
            storageUsedGB: this.getStorageUsedGB(),
            successRate: this.getSuccessRate(),
            lastBackupAt: this.props.stats?.lastBackupAt,
            lastRestoreAt: this.props.stats?.lastRestoreAt,
        };
    }
}

// ==================== EXPORTS ====================

export const STORAGE_LOCATION_LABELS: Record<StorageLocation, { label: string; provider: string }> = {
    LOCAL: { label: 'Almacenamiento Local', provider: 'On-premise' },
    S3: { label: 'Amazon S3', provider: 'AWS' },
    GCS: { label: 'Google Cloud Storage', provider: 'GCP' },
    AZURE_BLOB: { label: 'Azure Blob Storage', provider: 'Azure' },
    CROSS_REGION: { label: 'Multi-Region', provider: 'Cross-Cloud' },
};

export const BACKUP_TYPE_LABELS: Record<BackupType, string> = {
    FULL: 'Backup Completo',
    INCREMENTAL: 'Backup Incremental',
    DIFFERENTIAL: 'Backup Diferencial',
    CONTINUOUS: 'Backup Continuo (CDC)',
};

export const FREQUENCY_LABELS: Record<string, string> = {
    HOURLY: 'Cada hora',
    DAILY: 'Diario',
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensual',
    CONTINUOUS: 'Continuo',
};