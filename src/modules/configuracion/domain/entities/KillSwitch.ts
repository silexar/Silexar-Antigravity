/**
 * KillSwitch Entity - Enterprise Kill Switches and Emergency Controls
 * CATEGORY: CRITICAL - DDD + CQRS
 * 
 * Sistema de kill switches para emergencia, maintenance mode,
 * emergency stop, y security lockdown
 */

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// ==================== VALUE OBJECTS ====================

/**
 * KillSwitchType - Tipo de kill switch
 */
export type KillSwitchType =
    | 'EMERGENCY_STOP'
    | 'MAINTENANCE_MODE'
    | 'SECURITY_LOCKDOWN'
    | 'READ_ONLY_MODE'
    | 'RATE_LIMIT_EMERGENCY'
    | 'CIRCUIT_BREAKER_OPEN'
    | 'DATA_EXPORT_BLOCK'
    | 'PAYMENT_GATEWAY_DISABLE';
export const KillSwitchTypeSchema = z.enum([
    'EMERGENCY_STOP',
    'MAINTENANCE_MODE',
    'SECURITY_LOCKDOWN',
    'READ_ONLY_MODE',
    'RATE_LIMIT_EMERGENCY',
    'CIRCUIT_BREAKER_OPEN',
    'DATA_EXPORT_BLOCK',
    'PAYMENT_GATEWAY_DISABLE',
]);

/**
 * KillSwitchStatus - Estado del kill switch
 */
export type KillSwitchStatus = 'ACTIVE' | 'INACTIVE' | 'TRIGGERED' | 'AUTO_REVERTED' | 'MANUAL_OVERRIDE';
export const KillSwitchStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'TRIGGERED', 'AUTO_REVERTED', 'MANUAL_OVERRIDE']);

/**
 * KillScope - Alcance del kill switch
 */
export type KillScope = 'GLOBAL' | 'TENANT' | 'MODULE' | 'COMPONENT' | 'USER_GROUP';
export const KillScopeSchema = z.enum(['GLOBAL', 'TENANT', 'MODULE', 'COMPONENT', 'USER_GROUP']);

// ==================== DOMAIN ERRORS ====================

export class KillSwitchDomainError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly context: Record<string, unknown> = {}
    ) {
        super(message);
        this.name = 'KillSwitchDomainError';
    }
}

// ==================== SCHEMAS ====================

export const KillSwitchPropsSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().optional(), // null for global switches

    // Información básica
    key: z.string().min(1).max(100).regex(/^[A-Z][A-Z0-9_]*$/),
    nombre: z.string().min(1).max(255),
    descripcion: z.string().max(1000).optional(),
    tipo: KillSwitchTypeSchema,

    // Alcance
    scope: KillScopeSchema.default('GLOBAL'),
    targetModules: z.array(z.string()).default([]), // Module names if MODULE scope
    targetComponents: z.array(z.string()).default([]), // Component IDs if COMPONENT scope
    targetUserGroups: z.array(z.string()).default([]), // User group IDs if USER_GROUP scope

    // Estado
    status: KillSwitchStatusSchema.default('INACTIVE'),
    isGlobal: z.boolean().default(false), // If true, affects all tenants

    // Configuración de activación
    autoTriggerEnabled: z.boolean().default(false),
    triggerConditions: z.array(z.object({
        metricType: z.string(), // e.g., 'ERROR_RATE', 'LATENCY', 'CPU'
        operator: z.enum(['GT', 'LT', 'GTE', 'LTE', 'EQ']),
        threshold: z.number(),
        windowSeconds: z.number().default(300),
        consecutiveBreaches: z.number().default(3),
    })).default([]),

    // Revertir
    autoRevertEnabled: z.boolean().default(true),
    autoRevertAfterMinutes: z.number().min(1).max(1440).default(30), // Max 24 hours
    lastTriggeredAt: z.string().datetime().optional(),
    autoRevertAt: z.string().datetime().optional(),
    autoReverted: z.boolean().default(false),

    // Rollback
    rollbackEnabled: z.boolean().default(true),
    rollbackProcedure: z.string().max(2000).optional(), // JSON or description of rollback steps
    previousState: z.unknown().optional(), // State before trigger

    // Impacto estimado
    estimatedImpact: z.object({
        affectedUsers: z.number().default(0),
        affectedModules: z.array(z.string()).default([]),
        estimatedDowntimeMinutes: z.number().default(0),
        revenueImpactUSD: z.number().default(0),
        dataProcessingImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('NONE'),
    }).optional(),

    // Notificaciones
    notifyChannels: z.array(z.enum(['EMAIL', 'SMS', 'PUSH', 'SLACK', 'TEAMS', 'WEBHOOK'])).default(['EMAIL']),
    notifyRecipients: z.array(z.string()).default([]),
    notifyOnTrigger: z.boolean().default(true),
    notifyOnRevert: z.boolean().default(true),

    // Permission requirements
    requireApproval: z.boolean().default(true),
    requiredRole: z.string().max(100).optional(), // Role required to trigger
    requiredRoleKiller: z.string().max(100).default('super_admin'), // Role required to kill
    approvers: z.array(z.string().uuid()).default([]), // User IDs that can approve

    // Historial
    triggerHistory: z.array(z.object({
        id: z.string().uuid(),
        triggeredAt: z.string().datetime(),
        triggeredById: z.string().uuid(),
        triggeredByName: z.string(),
        reason: z.string(),
        scope: KillScopeSchema,
        autoTriggered: z.boolean(),
        revertedAt: z.string().datetime().optional(),
        revertedById: z.string().uuid().optional(),
        revertedByName: z.string().optional(),
        revertedAutomatically: z.boolean(),
        rollbackExecuted: z.boolean(),
        durationMinutes: z.number().optional(),
        postMortem: z.object({
            lecciones: z.array(z.string()).default([]),
            acciones: z.array(z.object({
                descripcion: z.string(),
                responsable: z.string(),
                fechaLimite: z.string().datetime(),
                completada: z.boolean().default(false),
            })).default([]),
            documentoUrl: z.string().url().optional(),
        }).optional(),
    })).default([]),

    // Metadatos
    tags: z.array(z.string()).default([]),
    documentationUrl: z.string().url().optional(),
    runbookUrl: z.string().url().optional(),

    // Auditoría
    creadoPorId: z.string().uuid().optional(),
    creadoAt: z.string().datetime(),
    actualizadoPorId: z.string().uuid().optional(),
    actualizadoAt: z.string().datetime(),
    version: z.number().default(1),
});

export type KillSwitchProps = z.infer<typeof KillSwitchPropsSchema>;

// ==================== ENTITY ====================

export class KillSwitch {
    private constructor(private props: KillSwitchProps) {
        this.validate();
    }

    // Factory methods
    static create(props: Omit<KillSwitchProps, 'id' | 'version' | 'creadoAt' | 'actualizadoAt' | 'status' | 'triggerHistory' | 'estimatedImpact' | 'lastTriggeredAt' | 'autoRevertAt' | 'autoReverted'>): KillSwitch {
        const now = new Date().toISOString();
        return new KillSwitch({
            ...props,
            id: uuidv4(),
            version: 1,
            status: 'INACTIVE',
            triggerHistory: [],
            estimatedImpact: {
                affectedUsers: 0,
                affectedModules: [],
                estimatedDowntimeMinutes: 0,
                revenueImpactUSD: 0,
                dataProcessingImpact: 'NONE',
            },
            autoReverted: false,
            creadoAt: now,
            actualizadoAt: now,
        });
    }

    static createEmergencyStop(tenantId?: string): KillSwitch {
        return KillSwitch.create({
            tenantId,
            key: 'EMERGENCY_STOP_GLOBAL',
            nombre: 'Emergency Stop Global',
            descripcion: 'Detiene todas las operaciones del sistema inmediatamente',
            tipo: 'EMERGENCY_STOP',
            scope: tenantId ? 'TENANT' : 'GLOBAL',
            isGlobal: !tenantId,
            targetModules: [],
            targetComponents: [],
            targetUserGroups: [],
            autoTriggerEnabled: false,
            triggerConditions: [],
            autoRevertEnabled: false, // Emergency stop should be manual
            autoRevertAfterMinutes: 0,
            rollbackEnabled: true,
            rollbackProcedure: JSON.stringify({ step: 'Review system state', action: 'Restart services' }),
            notifyChannels: ['EMAIL', 'SLACK', 'SMS'],
            notifyRecipients: [],
            notifyOnTrigger: true,
            notifyOnRevert: true,
            requireApproval: true,
            requiredRole: 'super_admin',
            requiredRoleKiller: 'super_admin',
            approvers: [],
            tags: ['emergency', 'critical', 'production'],
        });
    }

    static createMaintenanceMode(tenantId?: string): KillSwitch {
        return KillSwitch.create({
            tenantId,
            key: 'MAINTENANCE_MODE',
            nombre: 'Maintenance Mode',
            descripcion: 'Activa modo mantenimiento con pantalla de espera',
            tipo: 'MAINTENANCE_MODE',
            scope: 'GLOBAL',
            isGlobal: true,
            targetModules: [],
            targetComponents: [],
            targetUserGroups: [],
            autoTriggerEnabled: false,
            triggerConditions: [],
            autoRevertEnabled: true,
            autoRevertAfterMinutes: 120, // 2 hours default
            rollbackEnabled: true,
            notifyChannels: ['EMAIL'],
            notifyRecipients: [],
            notifyOnTrigger: true,
            notifyOnRevert: true,
            requireApproval: false,
            requiredRoleKiller: 'admin',
            approvers: [],
            tags: ['maintenance', 'operations'],
        });
    }

    static createSecurityLockdown(): KillSwitch {
        return KillSwitch.create({
            tenantId: undefined,
            key: 'SECURITY_LOCKDOWN',
            nombre: 'Security Lockdown',
            descripcion: 'Bloquea todas las operaciones por sospecha de breach',
            tipo: 'SECURITY_LOCKDOWN',
            scope: 'GLOBAL',
            isGlobal: true,
            targetModules: [],
            targetComponents: [],
            targetUserGroups: [],
            autoTriggerEnabled: true,
            triggerConditions: [
                {
                    metricType: 'SECURITY_VIOLATIONS',
                    operator: 'GT',
                    threshold: 100,
                    windowSeconds: 60,
                    consecutiveBreaches: 1,
                },
            ],
            autoRevertEnabled: false, // Security lockdown must be manual
            autoRevertAfterMinutes: 0,
            rollbackEnabled: false,
            notifyChannels: ['SMS', 'SLACK'],
            notifyRecipients: ['security-team'],
            notifyOnTrigger: true,
            notifyOnRevert: true,
            requireApproval: true,
            requiredRoleKiller: 'security_admin',
            approvers: [],
            tags: ['security', 'critical'],
        });
    }

    static fromSnapshot(props: KillSwitchProps): KillSwitch {
        return new KillSwitch(props);
    }

    // Validation
    private validate(): void {
        // Global switches must have no tenant
        if (this.props.isGlobal && this.props.tenantId) {
            throw new KillSwitchDomainError(
                'Kill switches globales no pueden tener tenantId',
                'INVALID_SCOPE'
            );
        }

        // Auto revert requires auto revert enabled
        if (this.props.autoRevertAfterMinutes > 0 && !this.props.autoRevertEnabled) {
            throw new KillSwitchDomainError(
                'autoRevertAfterMinutes requiere autoRevertEnabled=true',
                'INVALID_CONFIG'
            );
        }

        // Trigger conditions require auto trigger enabled
        if (this.props.triggerConditions.length > 0 && !this.props.autoTriggerEnabled) {
            throw new KillSwitchDomainError(
                'Trigger conditions requieren autoTriggerEnabled=true',
                'INVALID_CONFIG'
            );
        }
    }

    // State transitions
    activate(): void {
        this.props.status = 'ACTIVE';
        this.props.actualizadoAt = new Date().toISOString();
    }

    deactivate(): void {
        if (this.props.status === 'TRIGGERED') {
            throw new KillSwitchDomainError(
                'No se puede desactivar un kill switch que está triggered. Debe revertirse primero.',
                'INVALID_STATE'
            );
        }
        this.props.status = 'INACTIVE';
        this.props.actualizadoAt = new Date().toISOString();
    }

    // Trigger kill switch
    trigger(triggeredById: string, triggeredByName: string, reason: string, autoTriggered: boolean = false): string {
        if (this.props.status === 'TRIGGERED') {
            throw new KillSwitchDomainError(
                'Kill switch ya está activo',
                'ALREADY_TRIGGERED'
            );
        }

        const triggerId = uuidv4();
        const now = new Date().toISOString();

        this.props.status = 'TRIGGERED';
        this.props.lastTriggeredAt = now;

        // Calculate auto revert time if enabled
        if (this.props.autoRevertEnabled && this.props.autoRevertAfterMinutes > 0) {
            const revertTime = new Date(now);
            revertTime.setMinutes(revertTime.getMinutes() + this.props.autoRevertAfterMinutes);
            this.props.autoRevertAt = revertTime.toISOString();
        }

        // Add to history
        this.props.triggerHistory.push({
            id: triggerId,
            triggeredAt: now,
            triggeredById,
            triggeredByName,
            reason,
            scope: this.props.scope,
            autoTriggered,
            revertedAutomatically: false,
            rollbackExecuted: false,
        });

        this.props.actualizadoAt = now;

        return triggerId;
    }

    // Revert kill switch
    revert(revertedById: string, revertedByName: string, automatically: boolean = false): void {
        if (this.props.status !== 'TRIGGERED') {
            throw new KillSwitchDomainError(
                'Solo se pueden revertir kill switches activos',
                'INVALID_STATE'
            );
        }

        const now = new Date().toISOString();
        const currentTrigger = this.props.triggerHistory[this.props.triggerHistory.length - 1];

        if (currentTrigger) {
            currentTrigger.revertedAt = now;
            currentTrigger.revertedById = revertedById;
            currentTrigger.revertedByName = revertedByName;
            currentTrigger.revertedAutomatically = automatically;

            if (currentTrigger.triggeredAt) {
                const triggeredTime = new Date(currentTrigger.triggeredAt).getTime();
                const revertedTime = new Date(now).getTime();
                currentTrigger.durationMinutes = Math.round((revertedTime - triggeredTime) / 60000);
            }
        }

        this.props.status = automatically ? 'AUTO_REVERTED' : 'INACTIVE';
        this.props.autoReverted = automatically;
        this.props.autoRevertAt = undefined;
        this.props.actualizadoAt = now;
    }

    // Manual override (bypass automatic reversion)
    manualOverride(overriderId: string, overriderName: string, reason: string): void {
        if (this.props.status !== 'TRIGGERED') {
            throw new KillSwitchDomainError(
                'Solo se puede hacer override en kill switches activos',
                'INVALID_STATE'
            );
        }

        this.props.status = 'MANUAL_OVERRIDE';

        const currentTrigger = this.props.triggerHistory[this.props.triggerHistory.length - 1];
        if (currentTrigger) {
            currentTrigger.revertedAt = new Date().toISOString();
            currentTrigger.revertedById = overriderId;
            currentTrigger.revertedByName = overriderName;
            currentTrigger.revertedAutomatically = false;
        }

        this.props.actualizadoAt = new Date().toISOString();
    }

    // Post-mortem
    addPostMortem(triggerId: string, postMortem: {
        lecciones: string[];
        acciones: Array<{
            descripcion: string;
            responsable: string;
            fechaLimite: string;
        }>;
        documentoUrl?: string;
    }): void {
        const trigger = this.props.triggerHistory.find(t => t.id === triggerId);
        if (!trigger) {
            throw new KillSwitchDomainError('Trigger no encontrado', 'TRIGGER_NOT_FOUND');
        }

        trigger.postMortem = {
            lecciones: postMortem.lecciones,
            acciones: postMortem.acciones.map(a => ({
                ...a,
                completada: false,
            })),
            documentoUrl: postMortem.documentoUrl,
        };

        this.props.actualizadoAt = new Date().toISOString();
    }

    // Configuration
    updateTriggerConditions(conditions: Array<{
        metricType: string;
        operator: 'GT' | 'LT' | 'GTE' | 'LTE' | 'EQ';
        threshold: number;
        windowSeconds?: number;
        consecutiveBreaches?: number;
    }>): void {
        this.props.triggerConditions = conditions.map(c => ({
            metricType: c.metricType,
            operator: c.operator,
            threshold: c.threshold,
            windowSeconds: c.windowSeconds || 300,
            consecutiveBreaches: c.consecutiveBreaches || 3,
        }));
        this.props.actualizadoAt = new Date().toISOString();
    }

    enableAutoTrigger(): void {
        this.props.autoTriggerEnabled = true;
        this.props.actualizadoAt = new Date().toISOString();
    }

    disableAutoTrigger(): void {
        this.props.autoTriggerEnabled = false;
        this.props.triggerConditions = [];
        this.props.actualizadoAt = new Date().toISOString();
    }

    setAutoRevert(minutes: number): void {
        if (minutes < 1) {
            throw new KillSwitchDomainError('Minutos debe ser al menos 1', 'INVALID_CONFIG');
        }
        this.props.autoRevertEnabled = true;
        this.props.autoRevertAfterMinutes = minutes;
        this.props.actualizadoAt = new Date().toISOString();
    }

    disableAutoRevert(): void {
        this.props.autoRevertEnabled = false;
        this.props.autoRevertAfterMinutes = 0;
        this.props.autoRevertAt = undefined;
        this.props.actualizadoAt = new Date().toISOString();
    }

    // Notification
    addNotifyRecipient(recipient: string): void {
        if (!this.props.notifyRecipients.includes(recipient)) {
            this.props.notifyRecipients.push(recipient);
            this.props.actualizadoAt = new Date().toISOString();
        }
    }

    removeNotifyRecipient(recipient: string): void {
        this.props.notifyRecipients = this.props.notifyRecipients.filter(r => r !== recipient);
        this.props.actualizadoAt = new Date().toISOString();
    }

    // Impact assessment
    updateImpact(impact: {
        affectedUsers?: number;
        affectedModules?: string[];
        estimatedDowntimeMinutes?: number;
        revenueImpactUSD?: number;
        dataProcessingImpact?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    }): void {
        this.props.estimatedImpact = {
            affectedUsers: this.props.estimatedImpact?.affectedUsers ?? 0,
            affectedModules: this.props.estimatedImpact?.affectedModules ?? [],
            estimatedDowntimeMinutes: this.props.estimatedImpact?.estimatedDowntimeMinutes ?? 0,
            revenueImpactUSD: this.props.estimatedImpact?.revenueImpactUSD ?? 0,
            dataProcessingImpact: this.props.estimatedImpact?.dataProcessingImpact ?? 'NONE',
            ...impact,
        };
        this.props.actualizadoAt = new Date().toISOString();
    }

    // Queries
    isActive(): boolean {
        return this.props.status === 'TRIGGERED';
    }

    canAutoRevert(): boolean {
        if (!this.props.autoRevertEnabled) return false;
        if (!this.props.autoRevertAt) return false;
        return new Date() >= new Date(this.props.autoRevertAt);
    }

    getTimeUntilAutoRevert(): number | null {
        if (!this.props.autoRevertAt) return null;
        const diff = new Date(this.props.autoRevertAt).getTime() - Date.now();
        return Math.max(0, Math.floor(diff / 60000)); // Minutes remaining
    }

    getLastTrigger(): typeof this.props.triggerHistory[0] | null {
        if (this.props.triggerHistory.length === 0) return null;
        return this.props.triggerHistory[this.props.triggerHistory.length - 1];
    }

    getTotalTriggers(): number {
        return this.props.triggerHistory.length;
    }

    getSuccessfulReverts(): number {
        return this.props.triggerHistory.filter(t => t.revertedAt !== undefined).length;
    }

    getAverageDurationMinutes(): number {
        const completed = this.props.triggerHistory.filter(t => t.durationMinutes !== undefined);
        if (completed.length === 0) return 0;
        const sum = completed.reduce((acc, t) => acc + (t.durationMinutes || 0), 0);
        return Math.round(sum / completed.length);
    }

    // Snapshot
    toSnapshot(): KillSwitchProps {
        return { ...this.props };
    }

    toJSON(): Record<string, unknown> {
        return {
            id: this.props.id,
            key: this.props.key,
            nombre: this.props.nombre,
            tipo: this.props.tipo,
            status: this.props.status,
            scope: this.props.scope,
            isGlobal: this.props.isGlobal,
            isActive: this.isActive(),
            autoTriggerEnabled: this.props.autoTriggerEnabled,
            autoRevertEnabled: this.props.autoRevertEnabled,
            autoRevertAfterMinutes: this.props.autoRevertAfterMinutes,
            timeUntilAutoRevert: this.getTimeUntilAutoRevert(),
            lastTriggeredAt: this.props.lastTriggeredAt,
            totalTriggers: this.getTotalTriggers(),
            successfulReverts: this.getSuccessfulReverts(),
            averageDurationMinutes: this.getAverageDurationMinutes(),
            estimatedImpact: this.props.estimatedImpact,
            tags: this.props.tags,
        };
    }
}

// ==================== EXPORTS ====================
// Note: KillSwitchProps is already exported via the type declaration above

export const KILL_SWITCH_TYPE_LABELS: Record<KillSwitchType, string> = {
    EMERGENCY_STOP: 'Emergency Stop',
    MAINTENANCE_MODE: 'Maintenance Mode',
    SECURITY_LOCKDOWN: 'Security Lockdown',
    READ_ONLY_MODE: 'Read-Only Mode',
    RATE_LIMIT_EMERGENCY: 'Rate Limit Emergency',
    CIRCUIT_BREAKER_OPEN: 'Circuit Breaker Open',
    DATA_EXPORT_BLOCK: 'Data Export Block',
    PAYMENT_GATEWAY_DISABLE: 'Payment Gateway Disable',
};

export const KILL_SWITCH_STATUS_LABELS: Record<KillSwitchStatus, { label: string; color: string; icon: string }> = {
    ACTIVE: { label: 'Activo', color: '#10B981', icon: 'toggle-on' },
    INACTIVE: { label: 'Inactivo', color: '#6B7280', icon: 'toggle-off' },
    TRIGGERED: { label: 'Disparado', color: '#DC2626', icon: 'alert-triangle' },
    AUTO_REVERTED: { label: 'Auto Revirtido', color: '#F59E0B', icon: 'rotate-ccw' },
    MANUAL_OVERRIDE: { label: 'Override Manual', color: '#8B5CF6', icon: 'settings' },
};

export const SCOPE_LABELS: Record<KillScope, string> = {
    GLOBAL: 'Global (Todos los tenants)',
    TENANT: 'Tenant específico',
    MODULE: 'Módulo específico',
    COMPONENT: 'Componente específico',
    USER_GROUP: 'Grupo de usuarios',
};