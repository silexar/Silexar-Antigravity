/**
 * FeatureFlag Entity - Enterprise Feature Flags System
 * CATEGORY: CRITICAL - DDD + CQRS
 * 
 * Sistema de feature flags para control de funcionalidades,
 * gradual rollout, A/B testing y kill switches
 */

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// ==================== VALUE OBJECTS ====================

/**
 * FlagType - Tipo de feature flag
 */
export type FlagType = 'BOOLEAN' | 'PERCENTAGE' | 'USER_LIST' | 'ROLLOUT';
export const FlagTypeSchema = z.enum(['BOOLEAN', 'PERCENTAGE', 'USER_LIST', 'ROLLOUT']);

/**
 * FlagStatus - Estado del flag
 */
export type FlagStatus = 'ACTIVE' | 'INACTIVE' | 'DEPRECATED' | 'KILLED';
export const FlagStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'DEPRECATED', 'KILLED']);

/**
 * TargetType - Tipo de targeting
 */
export type TargetType = 'ALL' | 'PLAN' | 'ROLE' | 'USER' | 'REGION' | 'PERCENTAGE';
export const TargetTypeSchema = z.enum(['ALL', 'PLAN', 'ROLE', 'USER', 'REGION', 'PERCENTAGE']);

/**
 * PlanType - Plan del tenant
 */
export type PlanType = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'PLATINUM';
export const PlanTypeSchema = z.enum(['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'PLATINUM']);

// ==================== DOMAIN ERRORS ====================

export class FeatureFlagDomainError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly context: Record<string, unknown> = {}
    ) {
        super(message);
        this.name = 'FeatureFlagDomainError';
    }
}

// ==================== SCHEMAS ====================

export const TargetingRuleSchema = z.object({
    id: z.string().uuid(),
    tipo: TargetTypeSchema,
    operador: z.enum(['EQUALS', 'NOT_EQUALS', 'IN', 'NOT_IN', 'CONTAINS', 'GREATER_THAN', 'LESS_THAN']).default('EQUALS'),
    valor: z.string() || z.number() || z.array(z.string()),
    priority: z.number().default(0),
});

export const FlagVariationSchema = z.object({
    id: z.string().uuid(),
    nombre: z.string().min(1).max(100),
    valor: z.unknown(), // boolean, string, number, object
    weight: z.number().min(0).max(100).default(100), // For percentage-based
    description: z.string().max(500).optional(),
});

export const FlagDependencySchema = z.object({
    flagId: z.string().uuid(),
    required: z.boolean().default(true), // If true, parent must be enabled
    action: z.enum(['ENABLE', 'DISABLE', 'IGNORE']).default('ENABLE'),
});

export const FlagMetricsSchema = z.object({
    evaluacionesTotales: z.number().default(0),
    evaluacionesExitosas: z.number().default(0),
    usuariosUnicos: z.number().default(0),
    ultimoEvaluadoAt: z.string().datetime().optional(),
    conversionRate: z.number().optional(),
});

export const FeatureFlagPropsSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().optional(), // null for system-wide flags

    // Información básica
    key: z.string().min(1).max(100).regex(/^[A-Z][A-Z0-9_]*$/),
    nombre: z.string().min(1).max(255),
    descripcion: z.string().max(1000).optional(),
    categoria: z.string().max(100).optional(),

    // Tipo y estado
    tipo: FlagTypeSchema.default('BOOLEAN'),
    estado: FlagStatusSchema.default('INACTIVE'),

    // Valores
    defaultValue: z.unknown(), // Valor por defecto
    currentValue: z.unknown(), // Valor actual activo
    variations: z.array(z.object({
        id: z.string().uuid(),
        nombre: z.string().min(1).max(100),
        valor: z.unknown(),
        weight: z.number().min(0).max(100).default(100),
        description: z.string().max(500).optional(),
    })).default([]),

    // Targeting
    targetType: TargetTypeSchema.default('ALL'),
    targetingRules: z.array(z.object({
        id: z.string().uuid(),
        tipo: TargetTypeSchema,
        operador: z.enum(['EQUALS', 'NOT_EQUALS', 'IN', 'NOT_IN', 'CONTAINS', 'GREATER_THAN', 'LESS_THAN']).default('EQUALS'),
        valor: z.union([z.string(), z.number(), z.array(z.string())]),
        priority: z.number().default(0),
    })).default([]),

    // Rollout gradual
    rolloutPercentage: z.number().min(0).max(100).default(0),
    rolloutStartDate: z.string().datetime().optional(),
    rolloutEndDate: z.string().datetime().optional(),

    // Lista de usuarios específicos (para USER_LIST tipo)
    userList: z.array(z.string().uuid()).default([]),

    // Dependencias entre flags
    dependencies: z.array(z.object({
        flagId: z.string().uuid(),
        required: z.boolean().default(true),
        action: z.enum(['ENABLE', 'DISABLE', 'IGNORE']).default('ENABLE'),
    })).default([]),

    // Owner y tags
    ownerTeam: z.string().max(100).optional(),
    ownerContact: z.string().max(255).optional(),
    tags: z.array(z.string()).default([]),
    documentationUrl: z.string().url().optional(),

    // Seasons/Launches
    seasonId: z.string().uuid().optional(),
    launchDate: z.string().datetime().optional(),

    // Métricas
    metrics: z.object({
        evaluacionesTotales: z.number().default(0),
        evaluacionesExitosas: z.number().default(0),
        usuariosUnicos: z.number().default(0),
        ultimoEvaluadoAt: z.string().datetime().optional(),
        conversionRate: z.number().optional(),
    }).optional(),

    //Kill switch
    isKillSwitch: z.boolean().default(false),
    killReason: z.string().max(500).optional(),
    killedAt: z.string().datetime().optional(),
    killedById: z.string().uuid().optional(),

    // Auditoría
    creadoPorId: z.string().uuid().optional(),
    creadoAt: z.string().datetime(),
    actualizadoPorId: z.string().uuid().optional(),
    actualizadoAt: z.string().datetime(),
    version: z.number().default(1),
});

export type FeatureFlagProps = z.infer<typeof FeatureFlagPropsSchema>;

// ==================== ENTITY ====================

export class FeatureFlag {
    private constructor(private props: FeatureFlagProps) {
        this.validate();
    }

    // Factory methods
    static create(props: Omit<FeatureFlagProps, 'id' | 'version' | 'creadoAt' | 'actualizadoAt' | 'metrics' | 'estado'>): FeatureFlag {
        const now = new Date().toISOString();
        return new FeatureFlag({
            ...props,
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
        });
    }

    static createBoolean(
        key: string,
        nombre: string,
        defaultValue: boolean = false
    ): FeatureFlag {
        return FeatureFlag.create({
            key,
            nombre,
            tipo: 'BOOLEAN',
            defaultValue,
            currentValue: defaultValue,
            targetType: 'ALL',
            targetingRules: [],
            rolloutPercentage: 0,
            userList: [],
            dependencies: [],
            variations: [],
            ownerTeam: undefined,
            ownerContact: undefined,
            tags: [],
            isKillSwitch: false,
        });
    }

    static createRollout(
        key: string,
        nombre: string,
        rolloutPercentage: number
    ): FeatureFlag {
        return FeatureFlag.create({
            key,
            nombre,
            tipo: 'ROLLOUT',
            defaultValue: false,
            currentValue: rolloutPercentage > 0,
            targetType: 'PERCENTAGE',
            targetingRules: [],
            rolloutPercentage,
            userList: [],
            dependencies: [],
            variations: [],
            ownerTeam: undefined,
            ownerContact: undefined,
            tags: [],
            isKillSwitch: false,
        });
    }

    static fromSnapshot(props: FeatureFlagProps): FeatureFlag {
        return new FeatureFlag(props);
    }

    // Validation
    private validate(): void {
        // Key format validation
        if (!/^[A-Z][A-Z0-9_]*$/.test(this.props.key)) {
            throw new FeatureFlagDomainError(
                'Key debe empezar con mayúscula y contener solo letras, números y underscores',
                'INVALID_KEY_FORMAT'
            );
        }

        // Rollout percentage validation
        if (this.props.rolloutPercentage < 0 || this.props.rolloutPercentage > 100) {
            throw new FeatureFlagDomainError(
                'Rollout percentage debe estar entre 0 y 100',
                'INVALID_ROLLOUT_PERCENTAGE'
            );
        }

        // Date validations
        if (this.props.rolloutStartDate && this.props.rolloutEndDate) {
            if (new Date(this.props.rolloutEndDate) <= new Date(this.props.rolloutStartDate)) {
                throw new FeatureFlagDomainError(
                    'Fecha fin de rollout debe ser posterior a fecha inicio',
                    'INVALID_ROLLOUT_DATES'
                );
            }
        }

        // Variations weights validation
        if (this.props.variations.length > 0) {
            const totalWeight = this.props.variations.reduce((sum, v) => sum + v.weight, 0);
            if (totalWeight !== 100 && this.props.tipo === 'PERCENTAGE') {
                throw new FeatureFlagDomainError(
                    `Peso total de variaciones debe ser 100%, actualmente: ${totalWeight}%`,
                    'INVALID_VARIATIONS_WEIGHTS'
                );
            }
        }
    }

    // State transitions
    activate(): void {
        if (this.props.isKillSwitch && this.props.estado === 'KILLED') {
            throw new FeatureFlagDomainError(
                'No se puede activar un flag que ha sido matado',
                'FLAG_KILLED'
            );
        }
        this.props.estado = 'ACTIVE';
        this.props.currentValue = this.getEffectiveDefaultValue();
        this.props.actualizadoAt = new Date().toISOString();
    }

    deactivate(): void {
        this.props.estado = 'INACTIVE';
        this.props.currentValue = this.props.defaultValue;
        this.props.actualizadoAt = new Date().toISOString();
    }

    deprecate(): void {
        this.props.estado = 'DEPRECATED';
        this.props.actualizadoAt = new Date().toISOString();
    }

    // Kill switch
    kill(reason: string, killedById: string): void {
        this.props.estado = 'KILLED';
        this.props.isKillSwitch = true;
        this.props.killReason = reason;
        this.props.killedAt = new Date().toISOString();
        this.props.killedById = killedById;
        this.props.currentValue = false; // Kill always disables
        this.props.actualizadoAt = new Date().toISOString();
    }

    // Targeting rules
    addTargetingRule(rule: {
        tipo: TargetType;
        operador: 'EQUALS' | 'NOT_EQUALS' | 'IN' | 'NOT_IN' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN';
        valor: string | number | string[];
        priority?: number;
    }): string {
        const ruleId = uuidv4();
        this.props.targetingRules.push({
            id: ruleId,
            tipo: rule.tipo,
            operador: rule.operador,
            valor: rule.valor,
            priority: rule.priority || 0,
        });

        // Sort by priority (higher first)
        this.props.targetingRules.sort((a, b) => b.priority - a.priority);

        this.props.actualizadoAt = new Date().toISOString();
        return ruleId;
    }

    removeTargetingRule(ruleId: string): void {
        const index = this.props.targetingRules.findIndex(r => r.id === ruleId);
        if (index === -1) {
            throw new FeatureFlagDomainError('Regla no encontrada', 'RULE_NOT_FOUND');
        }
        this.props.targetingRules.splice(index, 1);
        this.props.actualizadoAt = new Date().toISOString();
    }

    // User list management (for USER_LIST type)
    addUsers(userIds: string[]): void {
        const newUsers = userIds.filter(id => !this.props.userList.includes(id));
        this.props.userList.push(...newUsers);
        this.props.actualizadoAt = new Date().toISOString();
    }

    removeUsers(userIds: string[]): void {
        this.props.userList = this.props.userList.filter(id => !userIds.includes(id));
        this.props.actualizadoAt = new Date().toISOString();
    }

    // Rollout management
    setRolloutPercentage(percentage: number): void {
        if (percentage < 0 || percentage > 100) {
            throw new FeatureFlagDomainError('Porcentaje debe estar entre 0 y 100', 'INVALID_PERCENTAGE');
        }
        this.props.rolloutPercentage = percentage;
        this.props.currentValue = percentage > 0;
        this.props.actualizadoAt = new Date().toISOString();
    }

    setRolloutSchedule(startDate?: string, endDate?: string): void {
        if (startDate) this.props.rolloutStartDate = startDate;
        if (endDate) this.props.rolloutEndDate = endDate;
        this.props.actualizadoAt = new Date().toISOString();
    }

    // Variations
    addVariation(variation: {
        nombre: string;
        valor: unknown;
        weight: number;
        description?: string;
    }): string {
        const variationId = uuidv4();
        this.props.variations.push({
            id: variationId,
            nombre: variation.nombre,
            valor: variation.valor,
            weight: variation.weight,
            description: variation.description,
        });
        this.props.actualizadoAt = new Date().toISOString();
        return variationId;
    }

    removeVariation(variationId: string): void {
        const index = this.props.variations.findIndex(v => v.id === variationId);
        if (index === -1) {
            throw new FeatureFlagDomainError('Variación no encontrada', 'VARIATION_NOT_FOUND');
        }
        this.props.variations.splice(index, 1);
        this.props.actualizadoAt = new Date().toISOString();
    }

    // Dependencies
    addDependency(flagId: string, required: boolean = true, action: 'ENABLE' | 'DISABLE' | 'IGNORE' = 'ENABLE'): void {
        const exists = this.props.dependencies.some(d => d.flagId === flagId);
        if (!exists) {
            this.props.dependencies.push({ flagId, required, action });
            this.props.actualizadoAt = new Date().toISOString();
        }
    }

    removeDependency(flagId: string): void {
        this.props.dependencies = this.props.dependencies.filter(d => d.flagId !== flagId);
        this.props.actualizadoAt = new Date().toISOString();
    }

    // Evaluation
    evaluate(context: {
        userId?: string;
        role?: string;
        plan?: PlanType;
        region?: string;
        attributes?: Record<string, unknown>;
    }): { enabled: boolean; value: unknown; matchedRule?: string; variation?: string } {
        // Check if killed
        if (this.props.estado === 'KILLED') {
            this.recordEvaluation(false);
            return { enabled: false, value: false };
        }

        // Check if inactive
        if (this.props.estado === 'INACTIVE') {
            this.recordEvaluation(false);
            return { enabled: false, value: this.props.defaultValue };
        }

        // Check rollout schedule dates
        const now = new Date();
        if (this.props.rolloutStartDate && now < new Date(this.props.rolloutStartDate)) {
            this.recordEvaluation(false);
            return { enabled: false, value: this.props.defaultValue };
        }
        if (this.props.rolloutEndDate && now > new Date(this.props.rolloutEndDate)) {
            this.recordEvaluation(false);
            return { enabled: false, value: this.props.defaultValue };
        }

        // Check dependencies
        // In production, would evaluate parent flags here
        for (const dep of this.props.dependencies) {
            if (dep.required && dep.action === 'ENABLE') {
                // Parent flag must be active - would check in production
            }
        }

        // Evaluate targeting rules
        for (const rule of this.props.targetingRules) {
            const matches = this.evaluateRule(rule, context);
            if (matches) {
                this.recordEvaluation(true);
                return {
                    enabled: true,
                    value: this.getValueForRule(rule),
                    matchedRule: rule.id,
                };
            }
        }

        // Default targeting
        switch (this.props.targetType) {
            case 'ALL':
                this.recordEvaluation(true);
                return { enabled: true, value: this.props.currentValue };

            case 'USER':
                if (context.userId && this.props.userList.includes(context.userId)) {
                    this.recordEvaluation(true);
                    return { enabled: true, value: this.props.currentValue };
                }
                break;

            case 'PERCENTAGE':
                if (context.userId) {
                    const hash = this.hashUserId(context.userId);
                    const percentage = hash % 100;
                    const enabled = percentage < this.props.rolloutPercentage;
                    this.recordEvaluation(enabled);
                    return {
                        enabled,
                        value: enabled ? this.props.currentValue : this.props.defaultValue,
                    };
                }
                break;

            case 'PLAN':
                if (context.plan) {
                    // Check if plan is targeted
                    this.recordEvaluation(true);
                    return { enabled: true, value: this.props.currentValue };
                }
                break;
        }

        this.recordEvaluation(false);
        return { enabled: false, value: this.props.defaultValue };
    }

    private evaluateRule(
        rule: { tipo: TargetType; operador: string; valor: string | number | string[] },
        context: { userId?: string; role?: string; plan?: PlanType; region?: string; attributes?: Record<string, unknown> }
    ): boolean {
        switch (rule.tipo) {
            case 'USER':
                return rule.operador === 'EQUALS' && context.userId === rule.valor;

            case 'ROLE':
                return rule.operador === 'EQUALS' && context.role === rule.valor;

            case 'PLAN':
                return rule.operador === 'EQUALS' && context.plan === rule.valor;

            case 'REGION':
                return rule.operador === 'EQUALS' && context.region === rule.valor;

            case 'PERCENTAGE':
                if (typeof rule.valor === 'number' && context.userId) {
                    const hash = this.hashUserId(context.userId);
                    return (hash % 100) < rule.valor;
                }
                return false;

            default:
                return false;
        }
    }

    private getValueForRule(rule: { tipo: TargetType }): unknown {
        // Could return different values based on rule in future
        return this.props.currentValue;
    }

    private hashUserId(userId: string): number {
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            const char = userId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    private recordEvaluation(success: boolean): void {
        if (!this.props.metrics) {
            this.props.metrics = {
                evaluacionesTotales: 0,
                evaluacionesExitosas: 0,
                usuariosUnicos: 0,
            };
        }
        this.props.metrics.evaluacionesTotales += 1;
        if (success) {
            this.props.metrics.evaluacionesExitosas += 1;
        }
        this.props.metrics.ultimoEvaluadoAt = new Date().toISOString();
    }

    private getEffectiveDefaultValue(): unknown {
        if (this.props.tipo === 'BOOLEAN') {
            return this.props.defaultValue ?? false;
        }
        return this.props.defaultValue;
    }

    // Update methods
    updateMetadata(nombre?: string, descripcion?: string, categoria?: string): void {
        if (nombre) this.props.nombre = nombre;
        if (descripcion) this.props.descripcion = descripcion;
        if (categoria) this.props.categoria = categoria;
        this.props.actualizadoAt = new Date().toISOString();
    }

    setOwner(team?: string, contact?: string): void {
        this.props.ownerTeam = team;
        this.props.ownerContact = contact;
        this.props.actualizadoAt = new Date().toISOString();
    }

    addTag(tag: string): void {
        if (!this.props.tags.includes(tag)) {
            this.props.tags.push(tag);
            this.props.actualizadoAt = new Date().toISOString();
        }
    }

    removeTag(tag: string): void {
        this.props.tags = this.props.tags.filter(t => t !== tag);
        this.props.actualizadoAt = new Date().toISOString();
    }

    // Queries
    isActive(): boolean {
        return this.props.estado === 'ACTIVE';
    }

    isKillSwitch(): boolean {
        return this.props.isKillSwitch;
    }

    getConversionRate(): number {
        if (!this.props.metrics || this.props.metrics.evaluacionesTotales === 0) return 0;
        return (this.props.metrics.evaluacionesExitosas / this.props.metrics.evaluacionesTotales) * 100;
    }

    // Snapshot
    toSnapshot(): FeatureFlagProps {
        return { ...this.props };
    }

    toJSON(): Record<string, unknown> {
        return {
            id: this.props.id,
            key: this.props.key,
            nombre: this.props.nombre,
            tipo: this.props.tipo,
            estado: this.props.estado,
            isKillSwitch: this.props.isKillSwitch,
            rolloutPercentage: this.props.rolloutPercentage,
            targetingRulesCount: this.props.targetingRules.length,
            userListCount: this.props.userList.length,
            metrics: this.props.metrics,
            ownerTeam: this.props.ownerTeam,
            tags: this.props.tags,
        };
    }
}

// ==================== EXPORTS ====================

export const FLAG_TYPE_LABELS: Record<FlagType, string> = {
    BOOLEAN: 'Boolean (On/Off)',
    PERCENTAGE: 'Percentage Rollout',
    USER_LIST: 'User List',
    ROLLOUT: 'Gradual Rollout',
};

export const FLAG_STATUS_LABELS: Record<FlagStatus, { label: string; color: string; icon: string }> = {
    ACTIVE: { label: 'Activo', color: '#10B981', icon: 'toggle-on' },
    INACTIVE: { label: 'Inactivo', color: '#6B7280', icon: 'toggle-off' },
    DEPRECATED: { label: 'Deprecado', color: '#F59E0B', icon: 'archive' },
    KILLED: { label: 'Eliminado', color: '#DC2626', icon: 'x-circle' },
};

export const PLAN_TYPE_LABELS: Record<PlanType, string> = {
    FREE: 'Free',
    STARTER: 'Starter',
    PROFESSIONAL: 'Professional',
    ENTERPRISE: 'Enterprise',
    PLATINUM: 'Platinum',
};