/**
 * Kill Switches API - Enterprise Emergency Controls
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
import { KillSwitch, KillSwitchProps, KILL_SWITCH_TYPE_LABELS, KILL_SWITCH_STATUS_LABELS, SCOPE_LABELS } from '@/modules/configuracion/domain/entities/KillSwitch';

// ==================== MOCK DATABASE ====================

const mockKillSwitches = new Map<string, KillSwitchProps>();

function getKillSwitchesByTenant(tenantId?: string): KillSwitchProps[] {
    return Array.from(mockKillSwitches.values()).filter(k =>
        k.tenantId === tenantId || k.isGlobal || k.scope === 'GLOBAL'
    );
}

function getKillSwitchById(id: string): KillSwitchProps | undefined {
    return mockKillSwitches.get(id);
}

function getKillSwitchByKey(key: string): KillSwitchProps | undefined {
    return Array.from(mockKillSwitches.values()).find(k => k.key === key);
}

function createKillSwitch(data: Omit<KillSwitchProps, 'id' | 'version' | 'creadoAt' | 'actualizadoAt' | 'status' | 'triggerHistory' | 'estimatedImpact' | 'lastTriggeredAt' | 'autoRevertAt' | 'autoReverted'>): KillSwitchProps {
    const now = new Date().toISOString();
    const killSwitch: KillSwitchProps = {
        ...data,
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
    } as KillSwitchProps;
    mockKillSwitches.set(killSwitch.id, killSwitch);
    return killSwitch;
}

function updateKillSwitch(id: string, updates: Partial<KillSwitchProps>): KillSwitchProps | undefined {
    const existing = mockKillSwitches.get(id);
    if (!existing) return undefined;

    const updated: KillSwitchProps = {
        ...existing,
        ...updates,
        version: existing.version + 1,
        actualizadoAt: new Date().toISOString(),
    } as KillSwitchProps;
    mockKillSwitches.set(id, updated);
    return updated;
}

// Initialize default kill switches
function initializeDefaultKillSwitches(): void {
    const defaults = [
        KillSwitch.createEmergencyStop(),
        KillSwitch.createMaintenanceMode(),
        KillSwitch.createSecurityLockdown(),
    ];

    for (const entity of defaults) {
        const snapshot = entity.toSnapshot();
        if (!getKillSwitchByKey(snapshot.key)) {
            createKillSwitch(snapshot);
        }
    }
}

// Initialize on first load
initializeDefaultKillSwitches();

// ==================== SCHEMAS ====================

const CreateKillSwitchSchema = z.object({
    key: z.string().min(1).max(100).regex(/^[A-Z][A-Z0-9_]*$/),
    nombre: z.string().min(1).max(255),
    descripcion: z.string().max(1000).optional(),
    tipo: z.enum([
        'EMERGENCY_STOP',
        'MAINTENANCE_MODE',
        'SECURITY_LOCKDOWN',
        'READ_ONLY_MODE',
        'RATE_LIMIT_EMERGENCY',
        'CIRCUIT_BREAKER_OPEN',
        'DATA_EXPORT_BLOCK',
        'PAYMENT_GATEWAY_DISABLE',
    ]),
    scope: z.enum(['GLOBAL', 'TENANT', 'MODULE', 'COMPONENT', 'USER_GROUP']).default('TENANT'),
    targetModules: z.array(z.string()).default([]),
    targetComponents: z.array(z.string()).default([]),
    autoTriggerEnabled: z.boolean().default(false),
    triggerConditions: z.array(z.object({
        metricType: z.string(),
        operator: z.enum(['GT', 'LT', 'GTE', 'LTE', 'EQ']),
        threshold: z.number(),
        windowSeconds: z.number().default(300),
        consecutiveBreaches: z.number().default(3),
    })).default([]),
    autoRevertEnabled: z.boolean().default(true),
    autoRevertAfterMinutes: z.number().min(1).max(1440).default(30),
    rollbackEnabled: z.boolean().default(true),
    rollbackProcedure: z.string().max(2000).optional(),
    notifyChannels: z.array(z.enum(['EMAIL', 'SMS', 'PUSH', 'SLACK', 'TEAMS', 'WEBHOOK'])).default(['EMAIL']),
    notifyRecipients: z.array(z.string()).default([]),
    requireApproval: z.boolean().default(true),
    requiredRoleKiller: z.string().max(100).default('super_admin'),
    tags: z.array(z.string()).default([]),
});

const TriggerKillSwitchSchema = z.object({
    reason: z.string().min(1).max(500),
    notify: z.boolean().default(true),
});

const AddPostMortemSchema = z.object({
    triggerId: z.string().uuid(),
    lecciones: z.array(z.string()).min(1),
    acciones: z.array(z.object({
        descripcion: z.string(),
        responsable: z.string(),
        fechaLimite: z.string().datetime(),
    })).min(1),
    documentoUrl: z.string().url().optional(),
});

// ==================== GET /api/kill-switches ====================

export const GET = withApiRoute(
    { resource: 'kill_switches', action: 'read', skipCsrf: true },
    async ({ ctx }) => {
        try {
            const tenantId = ctx.tenantId;

            let killSwitches = getKillSwitchesByTenant(tenantId);

            const response = killSwitches.map(k => ({
                id: k.id,
                key: k.key,
                nombre: k.nombre,
                descripcion: k.descripcion,
                tipo: k.tipo,
                tipoInfo: KILL_SWITCH_TYPE_LABELS[k.tipo as keyof typeof KILL_SWITCH_TYPE_LABELS],
                status: k.status,
                statusInfo: KILL_SWITCH_STATUS_LABELS[k.status as keyof typeof KILL_SWITCH_STATUS_LABELS],
                scope: k.scope,
                scopeInfo: SCOPE_LABELS[k.scope as keyof typeof SCOPE_LABELS],
                isGlobal: k.isGlobal,
                isActive: k.status === 'TRIGGERED',
                targetModules: k.targetModules,
                targetComponents: k.targetComponents,
                targetUserGroups: k.targetUserGroups,
                autoTriggerEnabled: k.autoTriggerEnabled,
                autoRevertEnabled: k.autoRevertEnabled,
                autoRevertAfterMinutes: k.autoRevertAfterMinutes,
                autoReverted: k.autoReverted,
                lastTriggeredAt: k.lastTriggeredAt,
                totalTriggers: k.triggerHistory.length,
                estimatedImpact: k.estimatedImpact,
                tags: k.tags,
                requiredRoleKiller: k.requiredRoleKiller,
                approvers: k.approvers,
                createdAt: k.creadoAt,
            }));

            return apiSuccess({
                items: response,
                total: response.length,
                activeCount: response.filter(k => k.isActive).length,
                types: KILL_SWITCH_TYPE_LABELS,
                statuses: KILL_SWITCH_STATUS_LABELS,
                scopes: SCOPE_LABELS,
            }) as unknown as NextResponse;
        } catch (error) {
            logger.error('Error GET /api/kill-switches', error instanceof Error ? error : undefined);
            return apiServerError() as unknown as NextResponse;
        }
    }
);

// ==================== POST /api/kill-switches ====================

export const POST = withApiRoute(
    { resource: 'kill_switches', action: 'create' },
    async ({ ctx, req }) => {
        try {
            const tenantId = ctx.tenantId;
            const userId = ctx.userId;
            const userRole = ctx.role;
            const body = await req.json();
            const { action } = body;

            switch (action) {
                case 'create': {
                    const parsed = CreateKillSwitchSchema.safeParse(body.data || body);
                    if (!parsed.success) {
                        return apiError('VALIDATION_ERROR', 'Error de validación', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
                    }

                    // Check if key already exists
                    const existingKey = getKillSwitchByKey(parsed.data.key);
                    if (existingKey) {
                        return apiError('DUPLICATE_KEY', `Kill switch '${parsed.data.key}' ya existe`, 409) as unknown as NextResponse;
                    }

                    const entity = KillSwitch.create({
                        tenantId: parsed.data.scope === 'GLOBAL' ? undefined : tenantId,
                        key: parsed.data.key,
                        nombre: parsed.data.nombre,
                        descripcion: parsed.data.descripcion,
                        tipo: parsed.data.tipo as any,
                        scope: parsed.data.scope as any,
                        isGlobal: parsed.data.scope === 'GLOBAL',
                        targetModules: parsed.data.targetModules,
                        targetComponents: parsed.data.targetComponents,
                        targetUserGroups: [],
                        autoTriggerEnabled: parsed.data.autoTriggerEnabled,
                        triggerConditions: parsed.data.triggerConditions,
                        autoRevertEnabled: parsed.data.autoRevertEnabled,
                        autoRevertAfterMinutes: parsed.data.autoRevertAfterMinutes,
                        rollbackEnabled: parsed.data.rollbackEnabled,
                        rollbackProcedure: parsed.data.rollbackProcedure,
                        notifyChannels: parsed.data.notifyChannels,
                        notifyRecipients: parsed.data.notifyRecipients,
                        notifyOnTrigger: true,
                        notifyOnRevert: true,
                        requireApproval: parsed.data.requireApproval,
                        requiredRole: undefined,
                        requiredRoleKiller: parsed.data.requiredRoleKiller,
                        approvers: [],
                        tags: parsed.data.tags,
                        documentationUrl: undefined,
                        runbookUrl: undefined,
                    });

                    const snapshot = entity.toSnapshot();
                    createKillSwitch(snapshot);

                    auditLogger.log({
                        type: AuditEventType.DATA_CREATE,
                        userId,
                        metadata: { module: 'kill_switches', resourceId: snapshot.id, key: snapshot.key },
                    });

                    return apiSuccess({
                        id: snapshot.id,
                        key: snapshot.key,
                        nombre: snapshot.nombre,
                        tipo: snapshot.tipo,
                        status: snapshot.status,
                    }, 201) as unknown as NextResponse;
                }

                case 'trigger': {
                    const killSwitchId = body.killSwitchId || body.key;
                    const reason = body.reason;

                    if (!reason) {
                        return apiError('VALIDATION_ERROR', 'Reason es requerido', 422) as unknown as NextResponse;
                    }

                    // Find kill switch by id or key
                    let killSwitch = getKillSwitchById(killSwitchId);
                    if (!killSwitch) {
                        killSwitch = getKillSwitchByKey(killSwitchId);
                    }

                    if (!killSwitch) {
                        return apiError('NOT_FOUND', 'Kill switch no encontrado', 404) as unknown as NextResponse;
                    }

                    // Check role permission
                    if (killSwitch.requiredRoleKiller && userRole !== killSwitch.requiredRoleKiller && userRole !== 'super_admin') {
                        return apiError('FORBIDDEN', `Se requiere rol '${killSwitch.requiredRoleKiller}' para activar este kill switch`, 403) as unknown as NextResponse;
                    }

                    const entity = KillSwitch.fromSnapshot(killSwitch);
                    const triggerId = entity.trigger(userId, userId, reason, false);
                    updateKillSwitch(killSwitch.id, entity.toSnapshot());

                    auditLogger.log({
                        type: AuditEventType.KILL_SWITCH_TRIGGERED,
                        userId,
                        metadata: {
                            module: 'kill_switches',
                            resourceId: killSwitch.id,
                            key: killSwitch.key,
                            reason,
                            triggerId,
                        },
                    });

                    // In production, would send notifications here
                    console.log(`[KILL_SWITCH] Triggered: ${killSwitch.key} by ${userId}`);

                    return apiSuccess({
                        triggered: true,
                        killSwitchKey: killSwitch.key,
                        triggerId,
                        status: 'TRIGGERED',
                        autoRevertAfterMinutes: killSwitch.autoRevertEnabled ? killSwitch.autoRevertAfterMinutes : null,
                    }) as unknown as NextResponse;
                }

                case 'revert': {
                    const killSwitchId = body.killSwitchId || body.key;

                    let killSwitch = getKillSwitchById(killSwitchId);
                    if (!killSwitch) {
                        killSwitch = getKillSwitchByKey(killSwitchId);
                    }

                    if (!killSwitch) {
                        return apiError('NOT_FOUND', 'Kill switch no encontrado', 404) as unknown as NextResponse;
                    }

                    if (killSwitch.status !== 'TRIGGERED') {
                        return apiError('INVALID_STATE', 'El kill switch no está activo', 400) as unknown as NextResponse;
                    }

                    const entity = KillSwitch.fromSnapshot(killSwitch);
                    entity.revert(userId, userId, false);
                    updateKillSwitch(killSwitch.id, entity.toSnapshot());

                    auditLogger.log({
                        type: AuditEventType.KILL_SWITCH_REVERTED,
                        userId,
                        metadata: {
                            module: 'kill_switches',
                            resourceId: killSwitch.id,
                            key: killSwitch.key,
                        },
                    });

                    return apiSuccess({
                        reverted: true,
                        killSwitchKey: killSwitch.key,
                        status: 'INACTIVE',
                    }) as unknown as NextResponse;
                }

                case 'override': {
                    const killSwitchId = body.killSwitchId || body.key;
                    const reason = body.reason || 'Manual override';

                    let killSwitch = getKillSwitchById(killSwitchId);
                    if (!killSwitch) {
                        killSwitch = getKillSwitchByKey(killSwitchId);
                    }

                    if (!killSwitch) {
                        return apiError('NOT_FOUND', 'Kill switch no encontrado', 404) as unknown as NextResponse;
                    }

                    const entity = KillSwitch.fromSnapshot(killSwitch);
                    entity.manualOverride(userId, userId, reason);
                    updateKillSwitch(killSwitch.id, entity.toSnapshot());

                    auditLogger.log({
                        type: AuditEventType.KILL_SWITCH_OVERRIDE,
                        userId,
                        metadata: {
                            module: 'kill_switches',
                            resourceId: killSwitch.id,
                            key: killSwitch.key,
                            reason,
                        },
                    });

                    return apiSuccess({
                        overridden: true,
                        killSwitchKey: killSwitch.key,
                        status: 'MANUAL_OVERRIDE',
                    }) as unknown as NextResponse;
                }

                case 'post_mortem': {
                    const parsed = AddPostMortemSchema.safeParse(body.data || body);
                    if (!parsed.success) {
                        return apiError('VALIDATION_ERROR', 'Error de validación', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
                    }

                    // Find the kill switch that has this trigger
                    let killSwitch = Array.from(mockKillSwitches.values()).find(k =>
                        k.triggerHistory.some(t => t.id === parsed.data.triggerId)
                    );

                    if (!killSwitch) {
                        return apiError('NOT_FOUND', 'Trigger no encontrado', 404) as unknown as NextResponse;
                    }

                    const entity = KillSwitch.fromSnapshot(killSwitch);
                    entity.addPostMortem(parsed.data.triggerId, {
                        lecciones: parsed.data.lecciones,
                        acciones: parsed.data.acciones,
                        documentoUrl: parsed.data.documentoUrl,
                    });
                    updateKillSwitch(killSwitch.id, entity.toSnapshot());

                    return apiSuccess({ added: true, triggerId: parsed.data.triggerId }) as unknown as NextResponse;
                }

                case 'activate': {
                    const killSwitchId = body.killSwitchId;

                    const killSwitch = getKillSwitchById(killSwitchId);
                    if (!killSwitch) {
                        return apiError('NOT_FOUND', 'Kill switch no encontrado', 404) as unknown as NextResponse;
                    }

                    const entity = KillSwitch.fromSnapshot(killSwitch);
                    entity.activate();
                    updateKillSwitch(killSwitch.id, entity.toSnapshot());

                    return apiSuccess({ activated: true, key: killSwitch.key }) as unknown as NextResponse;
                }

                case 'deactivate': {
                    const killSwitchId = body.killSwitchId;

                    const killSwitch = getKillSwitchById(killSwitchId);
                    if (!killSwitch) {
                        return apiError('NOT_FOUND', 'Kill switch no encontrado', 404) as unknown as NextResponse;
                    }

                    const entity = KillSwitch.fromSnapshot(killSwitch);
                    entity.deactivate();
                    updateKillSwitch(killSwitch.id, entity.toSnapshot());

                    return apiSuccess({ deactivated: true, key: killSwitch.key }) as unknown as NextResponse;
                }

                case 'configure_auto_trigger': {
                    const killSwitchId = body.killSwitchId;
                    const conditions = body.conditions;

                    const killSwitch = getKillSwitchById(killSwitchId);
                    if (!killSwitch) {
                        return apiError('NOT_FOUND', 'Kill switch no encontrado', 404) as unknown as NextResponse;
                    }

                    const entity = KillSwitch.fromSnapshot(killSwitch);
                    entity.updateTriggerConditions(conditions);
                    entity.enableAutoTrigger();
                    updateKillSwitch(killSwitch.id, entity.toSnapshot());

                    return apiSuccess({ configured: true, autoTriggerEnabled: true }) as unknown as NextResponse;
                }

                default:
                    return apiError('INVALID_ACTION', `Acción no válida: ${action}`, 400) as unknown as NextResponse;
            }
        } catch (error) {
            logger.error('Error POST /api/kill-switches', error instanceof Error ? error : undefined);
            return apiServerError() as unknown as NextResponse;
        }
    }
);