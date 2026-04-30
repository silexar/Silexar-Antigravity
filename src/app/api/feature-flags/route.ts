/**
 * Feature Flags API - Enterprise Feature Flags System
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
import { FeatureFlag, FeatureFlagProps, FLAG_TYPE_LABELS, FLAG_STATUS_LABELS } from '@/modules/configuracion/domain/entities/FeatureFlag';

// ==================== MOCK DATABASE ====================

const mockFlags = new Map<string, FeatureFlagProps>();

function getFlagsByTenant(tenantId?: string): FeatureFlagProps[] {
    return Array.from(mockFlags.values()).filter(f =>
        f.tenantId === tenantId || f.tenantId === undefined
    );
}

function getFlagById(id: string): FeatureFlagProps | undefined {
    return mockFlags.get(id);
}

function getFlagByKey(key: string): FeatureFlagProps | undefined {
    return Array.from(mockFlags.values()).find(f => f.key === key);
}

function createFlag(data: Omit<FeatureFlagProps, 'id' | 'version' | 'creadoAt' | 'actualizadoAt' | 'metrics' | 'estado'>): FeatureFlagProps {
    const now = new Date().toISOString();
    const flag: FeatureFlagProps = {
        ...data,
        id: uuidv4(),
        version: 1,
        estado: 'INACTIVE',
        metrics: {
            evaluacionesTotales: 0,
            evaluacionesExitosas: 0,
            usuariosUnicos: 0,
        },
        creadoAt: now,
        actualizadoAt: now,
    } as FeatureFlagProps;
    mockFlags.set(flag.id, flag);
    return flag;
}

function updateFlag(id: string, updates: Partial<FeatureFlagProps>): FeatureFlagProps | undefined {
    const existing = mockFlags.get(id);
    if (!existing) return undefined;

    const updated: FeatureFlagProps = {
        ...existing,
        ...updates,
        version: existing.version + 1,
        actualizadoAt: new Date().toISOString(),
    } as FeatureFlagProps;
    mockFlags.set(id, updated);
    return updated;
}

// ==================== SCHEMAS ====================

const CreateFlagSchema = z.object({
    key: z.string().min(1).max(100).regex(/^[A-Z][A-Z0-9_]*$/),
    nombre: z.string().min(1).max(255),
    descripcion: z.string().max(1000).optional(),
    categoria: z.string().max(100).optional(),
    tipo: z.enum(['BOOLEAN', 'PERCENTAGE', 'USER_LIST', 'ROLLOUT']).default('BOOLEAN'),
    defaultValue: z.unknown().default(false),
    targetType: z.enum(['ALL', 'PLAN', 'ROLE', 'USER', 'REGION', 'PERCENTAGE']).default('ALL'),
    rolloutPercentage: z.number().min(0).max(100).default(0),
    ownerTeam: z.string().max(100).optional(),
    tags: z.array(z.string()).default([]),
    isKillSwitch: z.boolean().default(false),
});

const AddTargetingRuleSchema = z.object({
    tipo: z.enum(['ALL', 'PLAN', 'ROLE', 'USER', 'REGION', 'PERCENTAGE']),
    operador: z.enum(['EQUALS', 'NOT_EQUALS', 'IN', 'NOT_IN', 'CONTAINS', 'GREATER_THAN', 'LESS_THAN']).default('EQUALS'),
    valor: z.union([z.string(), z.number(), z.array(z.string())]),
    priority: z.number().default(0),
});

const EvaluateFlagSchema = z.object({
    userId: z.string().uuid().optional(),
    role: z.string().optional(),
    plan: z.enum(['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'PLATINUM']).optional(),
    region: z.string().optional(),
    attributes: z.record(z.string(), z.unknown()).optional(),
});

// ==================== GET /api/feature-flags ====================

export const GET = withApiRoute(
    { resource: 'feature_flags', action: 'read', skipCsrf: true },
    async ({ ctx, req }) => {
        try {
            const tenantId = ctx.tenantId;
            const searchParams = req.nextUrl.searchParams;
            const key = searchParams.get('key');
            const categoria = searchParams.get('categoria');
            const estado = searchParams.get('estado');

            // If requesting specific flag by key
            if (key) {
                const flag = getFlagByKey(key);
                if (!flag) {
                    return apiError('NOT_FOUND', `Feature flag '${key}' no encontrado`, 404) as unknown as NextResponse;
                }
                return apiSuccess({
                    ...flag,
                    tipoInfo: FLAG_TYPE_LABELS[flag.tipo as keyof typeof FLAG_TYPE_LABELS],
                    estadoInfo: FLAG_STATUS_LABELS[flag.estado as keyof typeof FLAG_STATUS_LABELS],
                    metrics: flag.metrics,
                }) as unknown as NextResponse;
            }

            // List all flags for tenant (including system-wide)
            let flags = getFlagsByTenant(tenantId);
            flags = flags.concat(getFlagsByTenant(undefined)); // Include system flags

            // Filter by categoria and estado
            if (categoria) {
                flags = flags.filter(f => f.categoria === categoria);
            }
            if (estado) {
                flags = flags.filter(f => f.estado === estado);
            }

            const response = flags.map(flag => ({
                id: flag.id,
                key: flag.key,
                nombre: flag.nombre,
                descripcion: flag.descripcion,
                categoria: flag.categoria,
                tipo: flag.tipo,
                tipoInfo: FLAG_TYPE_LABELS[flag.tipo as keyof typeof FLAG_TYPE_LABELS],
                estado: flag.estado,
                estadoInfo: FLAG_STATUS_LABELS[flag.estado as keyof typeof FLAG_STATUS_LABELS],
                rolloutPercentage: flag.rolloutPercentage,
                targetingRulesCount: flag.targetingRules.length,
                userListCount: flag.userList.length,
                isKillSwitch: flag.isKillSwitch,
                ownerTeam: flag.ownerTeam,
                tags: flag.tags,
                metrics: flag.metrics,
                createdAt: flag.creadoAt,
                updatedAt: flag.actualizadoAt,
            }));

            return apiSuccess({
                items: response,
                total: response.length,
                categories: [...new Set(response.map(f => f.categoria).filter(Boolean))],
                estados: FLAG_STATUS_LABELS,
                tipos: FLAG_TYPE_LABELS,
            }) as unknown as NextResponse;
        } catch (error) {
            logger.error('Error GET /api/feature-flags', error instanceof Error ? error : undefined);
            return apiServerError() as unknown as NextResponse;
        }
    }
);

// ==================== POST /api/feature-flags ====================

export const POST = withApiRoute(
    { resource: 'feature_flags', action: 'create' },
    async ({ ctx, req }) => {
        try {
            const tenantId = ctx.tenantId;
            const userId = ctx.userId;
            const body = await req.json();
            const { action } = body;

            switch (action) {
                case 'create': {
                    const parsed = CreateFlagSchema.safeParse(body.data || body);
                    if (!parsed.success) {
                        return apiError('VALIDATION_ERROR', 'Error de validación', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
                    }

                    // Check if key already exists
                    const existingKey = getFlagByKey(parsed.data.key);
                    if (existingKey) {
                        return apiError('DUPLICATE_KEY', `Feature flag '${parsed.data.key}' ya existe`, 409) as unknown as NextResponse;
                    }

                    const flag = createFlag({
                        tenantId,
                        key: parsed.data.key,
                        nombre: parsed.data.nombre,
                        descripcion: parsed.data.descripcion,
                        categoria: parsed.data.categoria,
                        tipo: parsed.data.tipo as any,
                        defaultValue: parsed.data.defaultValue ?? false,
                        currentValue: parsed.data.defaultValue ?? false,
                        variations: [],
                        targetType: parsed.data.targetType as any,
                        targetingRules: [],
                        rolloutPercentage: parsed.data.rolloutPercentage,
                        rolloutStartDate: undefined,
                        rolloutEndDate: undefined,
                        userList: [],
                        dependencies: [],
                        ownerTeam: parsed.data.ownerTeam,
                        tags: parsed.data.tags,
                        documentationUrl: undefined,
                        seasonId: undefined,
                        launchDate: undefined,
                        isKillSwitch: parsed.data.isKillSwitch,
                    });

                    auditLogger.log({
                        type: AuditEventType.DATA_CREATE,
                        userId,
                        metadata: { module: 'feature_flags', resourceId: flag.id, key: flag.key },
                    });

                    return apiSuccess({
                        id: flag.id,
                        key: flag.key,
                        nombre: flag.nombre,
                        tipo: flag.tipo,
                        estado: flag.estado,
                    }, 201) as unknown as NextResponse;
                }

                case 'activate': {
                    const flagId = body.flagId;
                    const flag = getFlagById(flagId);

                    if (!flag || (flag.tenantId && flag.tenantId !== tenantId)) {
                        return apiError('NOT_FOUND', 'Feature flag no encontrado', 404) as unknown as NextResponse;
                    }

                    const entity = FeatureFlag.fromSnapshot(flag);
                    entity.activate();
                    updateFlag(flagId, entity.toSnapshot());

                    auditLogger.log({
                        type: AuditEventType.DATA_UPDATE,
                        userId,
                        metadata: { module: 'feature_flags', resourceId: flagId, action: 'activated' },
                    });

                    return apiSuccess({ activated: true, key: flag.key }) as unknown as NextResponse;
                }

                case 'deactivate': {
                    const flagId = body.flagId;
                    const flag = getFlagById(flagId);

                    if (!flag || (flag.tenantId && flag.tenantId !== tenantId)) {
                        return apiError('NOT_FOUND', 'Feature flag no encontrado', 404) as unknown as NextResponse;
                    }

                    const entity = FeatureFlag.fromSnapshot(flag);
                    entity.deactivate();
                    updateFlag(flagId, entity.toSnapshot());

                    return apiSuccess({ deactivated: true, key: flag.key }) as unknown as NextResponse;
                }

                case 'kill': {
                    const flagId = body.flagId;
                    const reason = body.reason || 'Kill switch activated';
                    const flag = getFlagById(flagId);

                    if (!flag || (flag.tenantId && flag.tenantId !== tenantId)) {
                        return apiError('NOT_FOUND', 'Feature flag no encontrado', 404) as unknown as NextResponse;
                    }

                    const entity = FeatureFlag.fromSnapshot(flag);
                    entity.kill(reason, userId);
                    updateFlag(flagId, entity.toSnapshot());

                    auditLogger.log({
                        type: AuditEventType.KILL_SWITCH_ACTIVATED,
                        userId,
                        metadata: { module: 'feature_flags', resourceId: flagId, key: flag.key, reason },
                    });

                    return apiSuccess({ killed: true, key: flag.key, reason }) as unknown as NextResponse;
                }

                case 'add_targeting_rule': {
                    const flagId = body.flagId;
                    const parsed = AddTargetingRuleSchema.safeParse(body.rule || body);

                    if (!parsed.success) {
                        return apiError('VALIDATION_ERROR', 'Error de validación', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
                    }

                    const flag = getFlagById(flagId);
                    if (!flag || (flag.tenantId && flag.tenantId !== tenantId)) {
                        return apiError('NOT_FOUND', 'Feature flag no encontrado', 404) as unknown as NextResponse;
                    }

                    const entity = FeatureFlag.fromSnapshot(flag);
                    const ruleId = entity.addTargetingRule({
                        tipo: parsed.data.tipo as any,
                        operador: parsed.data.operador as any,
                        valor: parsed.data.valor as any,
                        priority: parsed.data.priority,
                    });
                    updateFlag(flagId, entity.toSnapshot());

                    return apiSuccess({ ruleId, added: true }) as unknown as NextResponse;
                }

                case 'add_users': {
                    const flagId = body.flagId;
                    const userIds = body.userIds;

                    if (!Array.isArray(userIds) || userIds.length === 0) {
                        return apiError('VALIDATION_ERROR', 'userIds debe ser un array no vacío', 422) as unknown as NextResponse;
                    }

                    const flag = getFlagById(flagId);
                    if (!flag || (flag.tenantId && flag.tenantId !== tenantId)) {
                        return apiError('NOT_FOUND', 'Feature flag no encontrado', 404) as unknown as NextResponse;
                    }

                    const entity = FeatureFlag.fromSnapshot(flag);
                    entity.addUsers(userIds);
                    updateFlag(flagId, entity.toSnapshot());

                    return apiSuccess({ added: true, count: userIds.length }) as unknown as NextResponse;
                }

                case 'set_rollout': {
                    const flagId = body.flagId;
                    const percentage = body.percentage;

                    if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
                        return apiError('VALIDATION_ERROR', 'percentage debe estar entre 0 y 100', 422) as unknown as NextResponse;
                    }

                    const flag = getFlagById(flagId);
                    if (!flag || (flag.tenantId && flag.tenantId !== tenantId)) {
                        return apiError('NOT_FOUND', 'Feature flag no encontrado', 404) as unknown as NextResponse;
                    }

                    const entity = FeatureFlag.fromSnapshot(flag);
                    entity.setRolloutPercentage(percentage);
                    updateFlag(flagId, entity.toSnapshot());

                    return apiSuccess({ updated: true, rolloutPercentage: percentage }) as unknown as NextResponse;
                }

                case 'evaluate': {
                    const parsed = EvaluateFlagSchema.safeParse(body.context || body);

                    const flagId = body.flagId;
                    const flag = getFlagById(flagId);

                    if (!flag) {
                        // Check if it's a key
                        const flagByKey = getFlagByKey(body.flagId || body.key);
                        if (!flagByKey) {
                            return apiError('NOT_FOUND', 'Feature flag no encontrado', 404) as unknown as NextResponse;
                        }

                        const entity = FeatureFlag.fromSnapshot(flagByKey);
                        const result = entity.evaluate({
                            userId: parsed.data?.userId,
                            role: parsed.data?.role,
                            plan: parsed.data?.plan as any,
                            region: parsed.data?.region,
                            attributes: parsed.data?.attributes as Record<string, unknown>,
                        });

                        return apiSuccess({
                            flagKey: flagByKey.key,
                            enabled: result.enabled,
                            value: result.value,
                            matchedRule: result.matchedRule,
                        }) as unknown as NextResponse;
                    }

                    const entity = FeatureFlag.fromSnapshot(flag);
                    const result = entity.evaluate({
                        userId: parsed.data?.userId,
                        role: parsed.data?.role,
                        plan: parsed.data?.plan as any,
                        region: parsed.data?.region,
                        attributes: parsed.data?.attributes as Record<string, unknown>,
                    });

                    return apiSuccess({
                        flagKey: flag.key,
                        enabled: result.enabled,
                        value: result.value,
                        matchedRule: result.matchedRule,
                    }) as unknown as NextResponse;
                }

                default:
                    return apiError('INVALID_ACTION', `Acción no válida: ${action}`, 400) as unknown as NextResponse;
            }
        } catch (error) {
            logger.error('Error POST /api/feature-flags', error instanceof Error ? error : undefined);
            return apiServerError() as unknown as NextResponse;
        }
    }
);