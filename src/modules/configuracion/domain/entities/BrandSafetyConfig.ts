/**
 * BrandSafety Entity - Enterprise Brand Safety and Compliance
 * CATEGORY: CRITICAL - DDD + CQRS
 * 
 * Maneja reglas de Brand Safety, compliance (GDPR, CCPA, COPPA),
 * categorización IAB, y detección de contenido sensible
 */

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// ==================== VALUE OBJECTS ====================

/**
 * ContentCategory - IAB Content Categories
 */
export type ContentCategory =
    | 'IAB1' | 'IAB2' | 'IAB3' | 'IAB4' | 'IAB5' | 'IAB6' | 'IAB7' | 'IAB8' | 'IAB9' | 'IAB10'
    | 'IAB11' | 'IAB12' | 'IAB13' | 'IAB14' | 'IAB15' | 'IAB16' | 'IAB17' | 'IAB18' | 'IAB19' | 'IAB20'
    | 'IAB21' | 'IAB22' | 'IAB23' | 'IAB24' | 'IAB25' | 'IAB26' | 'IAB27';

export const ContentCategorySchema = z.enum([
    'IAB1', 'IAB2', 'IAB3', 'IAB4', 'IAB5', 'IAB6', 'IAB7', 'IAB8', 'IAB9', 'IAB10',
    'IAB11', 'IAB12', 'IAB13', 'IAB14', 'IAB15', 'IAB16', 'IAB17', 'IAB18', 'IAB19', 'IAB20',
    'IAB21', 'IAB22', 'IAB23', 'IAB24', 'IAB25', 'IAB26', 'IAB27'
]);

/**
 * SafetyLevel - Nivel de restricción de contenido
 */
export type SafetyLevel = 'STRICT' | 'MODERATE' | 'STANDARD' | 'RELAXED';
export const SafetyLevelSchema = z.enum(['STRICT', 'MODERATE', 'STANDARD', 'RELAXED']);

/**
 * ContentClassification - Clasificación de contenido
 */
export type ContentClassification = 'SAFE' | 'CONTEXTUAL' | 'SENSITIVE' | 'CONTROVERSIAL' | 'PROHIBITED';
export const ContentClassificationSchema = z.enum(['SAFE', 'CONTEXTUAL', 'SENSITIVE', 'CONTROVERSIAL', 'PROHIBITED']);

/**
 * PrivacyRegulation - Regulaciones de privacidad
 */
export type PrivacyRegulation = 'GDPR' | 'CCPA' | 'COPPA' | 'PDPD' | 'LGPD' | 'PIPEDA';
export const PrivacyRegulationSchema = z.enum(['GDPR', 'CCPA', 'COPPA', 'PDPD', 'LGPD', 'PIPEDA']);

// ==================== DOMAIN ERRORS ====================

export class BrandSafetyDomainError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly context: Record<string, unknown> = {}
    ) {
        super(message);
        this.name = 'BrandSafetyDomainError';
    }
}

// ==================== SCHEMAS ====================

export const ReglaRestriccionSchema = z.object({
    id: z.string().uuid(),
    nombre: z.string().min(1).max(255),
    descripcion: z.string().max(500).optional(),
    tipo: z.enum(['KEYWORD', 'CATEGORY', 'DOMAIN', 'KEYWORD_LIST', 'GEOGRAPHIC', 'TEMPORAL']),
    valor: z.string(), // keyword, category code, domain, etc.
    accion: z.enum(['BLOCK', 'ALLOW', 'FLAG', 'REVIEW']),
    severidad: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    activo: z.boolean().default(true),
});

export const BlackoutScheduleSchema = z.object({
    id: z.string().uuid(),
    nombre: z.string().min(1).max(255),
    fechaInicio: z.string().datetime(),
    fechaFin: z.string().datetime(),
    diasSemana: z.array(z.number().min(0).max(6)).optional(), // 0=Sunday
    franjasHorarias: z.array(z.object({
        horaInicio: z.number().min(0).max(23),
        horaFin: z.number().min(0).max(23),
    })).optional(),
    motivo: z.string().optional(),
    activo: z.boolean().default(true),
});

export const ConsentimientoSchema = z.object({
    id: z.string().uuid(),
    usuarioId: z.string().uuid().optional(),
    tipoConsentimiento: z.string(), // MARKETING, ANALYTICS, PERSONALIZATION, etc.
    granted: z.boolean(),
    timestamp: z.string().datetime(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    metodo: z.enum(['CLICK', 'FORM', 'IMPLICIT', 'OPT_IN', 'OPT_OUT']),
    region: PrivacyRegulationSchema.optional(),
});

export const BrandSafetyConfigPropsSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string(),
    clienteId: z.string().uuid().optional(),

    // Configuración general
    nombre: z.string().min(1).max(255),
    nivelSeguridad: SafetyLevelSchema.default('MODERATE'),
    activo: z.boolean().default(true),

    // Categorías permitidas/bloqueadas
    categoriasIABPermitidas: z.array(ContentCategorySchema).default([]),
    categoriasIABBloqueadas: z.array(ContentCategorySchema).default([]),

    // Reglas de restricción
    reglasRestriccion: z.array(z.object({
        id: z.string().uuid(),
        nombre: z.string().min(1).max(255),
        descripcion: z.string().max(500).optional(),
        tipo: z.enum(['KEYWORD', 'CATEGORY', 'DOMAIN', 'KEYWORD_LIST', 'GEOGRAPHIC', 'TEMPORAL']),
        valor: z.string(),
        accion: z.enum(['BLOCK', 'ALLOW', 'FLAG', 'REVIEW']),
        severidad: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        activo: z.boolean().default(true),
    })).default([]),

    // Palabras clave
    palabrasClaveBloqueo: z.array(z.string()).default([]),
    palabrasClaveMarca: z.array(z.string()).default([]), // Brand safety keywords

    // Blackout schedules
    blackoutSchedules: z.array(z.object({
        id: z.string().uuid(),
        nombre: z.string().min(1).max(255),
        fechaInicio: z.string().datetime(),
        fechaFin: z.string().datetime(),
        diasSemana: z.array(z.number().min(0).max(6)).optional(),
        franjasHorarias: z.array(z.object({
            horaInicio: z.number().min(0).max(23),
            horaFin: z.number().min(0).max(23),
        })).optional(),
        motivo: z.string().optional(),
        activo: z.boolean().default(true),
    })).default([]),

    // Compliance settings
    regulacionesHabilitadas: z.array(PrivacyRegulationSchema).default([]),
    consentimientoRequerido: z.boolean().default(true),
    edadMinimaConsentimiento: z.number().min(13).max(21).default(16),
    geoRestrictions: z.array(z.object({
        pais: z.string().min(2).max(3),
        restriction: z.enum(['BLOCK', 'REQUIRE_CONSENT', 'ALLOW']),
    })).default([]),

    // Third-party verification
    usarDoubleVerify: z.boolean().default(false),
    usarMoat: z.boolean().default(false),
    usarIAS: z.boolean().default(false),

    // Reporting
    generarReportesAutomaticos: z.boolean().default(true),
    frecuenciaReportes: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).default('WEEKLY'),
    emailReportes: z.array(z.string().email()).default([]),

    // Auditoría
    creadoPorId: z.string().uuid().optional(),
    creadoAt: z.string().datetime(),
    actualizadoPorId: z.string().uuid().optional(),
    actualizadoAt: z.string().datetime(),
    version: z.number().default(1),
});

export type BrandSafetyConfigProps = z.infer<typeof BrandSafetyConfigPropsSchema>;

// ==================== IAB CATEGORY LABELS ====================

export const IAB_CATEGORY_LABELS: Record<ContentCategory, string> = {
    IAB1: 'Arts & Entertainment',
    IAB2: 'Automobiles',
    IAB3: 'Business',
    IAB4: 'Careers',
    IAB5: 'Education',
    IAB6: 'Family & Parenting',
    IAB7: 'Health & Fitness',
    IAB8: 'Food & Drink',
    IAB9: 'Hobbies & Interests',
    IAB10: 'Home & Garden',
    IAB11: 'Law/Govt/Politics',
    IAB12: 'News',
    IAB13: 'Personal Finance',
    IAB14: 'Society',
    IAB15: 'Science',
    IAB16: 'Pets',
    IAB17: 'Sports',
    IAB18: 'Style & Fashion',
    IAB19: 'Technology',
    IAB20: 'Travel',
    IAB21: 'Real Estate',
    IAB22: 'Shopping',
    IAB23: 'Religion',
    IAB24: 'Uncategorized',
    IAB25: 'Non-Standard Content',
    IAB26: 'Illegal Content',
    IAB27: 'Aliyah',
};

// ==================== ENTITY ====================

export class BrandSafetyConfig {
    private constructor(private props: BrandSafetyConfigProps) {
        this.validate();
    }

    // Factory methods
    static create(props: Omit<BrandSafetyConfigProps, 'id' | 'version' | 'creadoAt' | 'actualizadoAt'>): BrandSafetyConfig {
        const now = new Date().toISOString();
        return new BrandSafetyConfig({
            ...props,
            id: uuidv4(),
            version: 1,
            creadoAt: now,
            actualizadoAt: now,
        });
    }

    static createDefault(tenantId: string, nombre: string): BrandSafetyConfig {
        return BrandSafetyConfig.create({
            tenantId,
            nombre,
            nivelSeguridad: 'MODERATE',
            activo: true,
            categoriasIABPermitidas: [],
            categoriasIABBloqueadas: ['IAB26'], // Block illegal content by default
            reglasRestriccion: [],
            palabrasClaveBloqueo: [],
            palabrasClaveMarca: [],
            blackoutSchedules: [],
            regulacionesHabilitadas: ['GDPR', 'CCPA'],
            consentimientoRequerido: true,
            edadMinimaConsentimiento: 16,
            geoRestrictions: [],
            usarDoubleVerify: false,
            usarMoat: false,
            usarIAS: false,
            generarReportesAutomaticos: true,
            frecuenciaReportes: 'WEEKLY',
            emailReportes: [],
        });
    }

    static fromSnapshot(props: BrandSafetyConfigProps): BrandSafetyConfig {
        return new BrandSafetyConfig(props);
    }

    // Validation
    private validate(): void {
        // Validate category arrays don't overlap incorrectly
        const overlap = this.props.categoriasIABPermitidas.filter(c =>
            this.props.categoriasIABBloqueadas.includes(c)
        );
        if (overlap.length > 0) {
            throw new BrandSafetyDomainError(
                `Categorías no pueden estar en permitidas y bloqueadas: ${overlap.join(', ')}`,
                'CATEGORY_CONFLICT'
            );
        }

        // Validate blackout schedule dates
        for (const schedule of this.props.blackoutSchedules) {
            if (new Date(schedule.fechaFin) <= new Date(schedule.fechaInicio)) {
                throw new BrandSafetyDomainError(
                    `Blackout schedule ${schedule.nombre} tiene fecha fin anterior a inicio`,
                    'INVALID_BLACKOUT_DATES'
                );
            }
        }
    }

    // Rule management
    addRestriction(rule: {
        nombre: string;
        descripcion?: string;
        tipo: 'KEYWORD' | 'CATEGORY' | 'DOMAIN' | 'KEYWORD_LIST' | 'GEOGRAPHIC' | 'TEMPORAL';
        valor: string;
        accion: 'BLOCK' | 'ALLOW' | 'FLAG' | 'REVIEW';
        severidad: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    }): void {
        this.props.reglasRestriccion.push({
            id: uuidv4(),
            ...rule,
            activo: true,
        });
        this.props.actualizadoAt = new Date().toISOString();
    }

    updateRestriction(ruleId: string, updates: Partial<{
        nombre: string;
        descripcion: string;
        valor: string;
        accion: 'BLOCK' | 'ALLOW' | 'FLAG' | 'REVIEW';
        severidad: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        activo: boolean;
    }>): void {
        const rule = this.props.reglasRestriccion.find(r => r.id === ruleId);
        if (!rule) {
            throw new BrandSafetyDomainError('Regla no encontrada', 'RULE_NOT_FOUND');
        }

        Object.assign(rule, updates);
        this.props.actualizadoAt = new Date().toISOString();
    }

    removeRestriction(ruleId: string): void {
        const index = this.props.reglasRestriccion.findIndex(r => r.id === ruleId);
        if (index === -1) {
            throw new BrandSafetyDomainError('Regla no encontrada', 'RULE_NOT_FOUND');
        }
        this.props.reglasRestriccion.splice(index, 1);
        this.props.actualizadoAt = new Date().toISOString();
    }

    // Keyword management
    addBloqueoKeyword(keyword: string): void {
        if (!this.props.palabrasClaveBloqueo.includes(keyword)) {
            this.props.palabrasClaveBloqueo.push(keyword);
            this.props.actualizadoAt = new Date().toISOString();
        }
    }

    removeBloqueoKeyword(keyword: string): void {
        const index = this.props.palabrasClaveBloqueo.indexOf(keyword);
        if (index > -1) {
            this.props.palabrasClaveBloqueo.splice(index, 1);
            this.props.actualizadoAt = new Date().toISOString();
        }
    }

    addMarcaKeyword(keyword: string): void {
        if (!this.props.palabrasClaveMarca.includes(keyword)) {
            this.props.palabrasClaveMarca.push(keyword);
            this.props.actualizadoAt = new Date().toISOString();
        }
    }

    // Blackout schedules
    addBlackoutSchedule(schedule: {
        nombre: string;
        fechaInicio: string;
        fechaFin: string;
        diasSemana?: number[];
        franjasHorarias?: Array<{ horaInicio: number; horaFin: number }>;
        motivo?: string;
    }): void {
        if (new Date(schedule.fechaFin) <= new Date(schedule.fechaInicio)) {
            throw new BrandSafetyDomainError('Fecha fin debe ser posterior a fecha inicio', 'INVALID_DATES');
        }

        this.props.blackoutSchedules.push({
            id: uuidv4(),
            ...schedule,
            activo: true,
        });
        this.props.actualizadoAt = new Date().toISOString();
    }

    deactivateBlackoutSchedule(scheduleId: string): void {
        const schedule = this.props.blackoutSchedules.find(s => s.id === scheduleId);
        if (!schedule) {
            throw new BrandSafetyDomainError('Schedule no encontrado', 'SCHEDULE_NOT_FOUND');
        }
        schedule.activo = false;
        this.props.actualizadoAt = new Date().toISOString();
    }

    // Compliance
    enableRegulation(regulation: PrivacyRegulation): void {
        if (!this.props.regulacionesHabilitadas.includes(regulation)) {
            this.props.regulacionesHabilitadas.push(regulation);
            this.props.actualizadoAt = new Date().toISOString();
        }
    }

    disableRegulation(regulation: PrivacyRegulation): void {
        const index = this.props.regulacionesHabilitadas.indexOf(regulation);
        if (index > -1) {
            this.props.regulacionesHabilitadas.splice(index, 1);
            this.props.actualizadoAt = new Date().toISOString();
        }
    }

    // Category management
    permitCategory(category: ContentCategory): void {
        if (!this.props.categoriasIABPermitidas.includes(category)) {
            this.props.categoriasIABPermitidas.push(category);
            // Remove from blocked if present
            const blockedIndex = this.props.categoriasIABBloqueadas.indexOf(category);
            if (blockedIndex > -1) {
                this.props.categoriasIABBloqueadas.splice(blockedIndex, 1);
            }
            this.props.actualizadoAt = new Date().toISOString();
        }
    }

    blockCategory(category: ContentCategory): void {
        if (!this.props.categoriasIABBloqueadas.includes(category)) {
            this.props.categoriasIABBloqueadas.push(category);
            // Remove from permitted if present
            const permittedIndex = this.props.categoriasIABPermitidas.indexOf(category);
            if (permittedIndex > -1) {
                this.props.categoriasIABPermitidas.splice(permittedIndex, 1);
            }
            this.props.actualizadoAt = new Date().toISOString();
        }
    }

    // Content evaluation
    evaluateContent(content: {
        keywords?: string[];
        categories?: ContentCategory[];
        domain?: string;
        country?: string;
        hour?: number;
        dayOfWeek?: number;
    }): {
        classification: ContentClassification;
        blocked: boolean;
        reasons: string[];
        rulesMatched: string[];
    } {
        const reasons: string[] = [];
        const rulesMatched: string[] = [];

        // Check keywords
        if (content.keywords) {
            for (const keyword of content.keywords) {
                if (this.props.palabrasClaveBloqueo.includes(keyword)) {
                    reasons.push(`Keyword bloqueado: ${keyword}`);
                    rulesMatched.push('KEYWORD_BLOCK');
                }
            }
        }

        // Check brand keywords
        if (content.keywords) {
            for (const keyword of content.keywords) {
                if (this.props.palabrasClaveMarca.includes(keyword)) {
                    reasons.push(`Marca detectada: ${keyword}`);
                    rulesMatched.push('BRAND_SAFETY');
                }
            }
        }

        // Check categories
        if (content.categories) {
            for (const category of content.categories) {
                if (this.props.categoriasIABBloqueadas.includes(category)) {
                    reasons.push(`Categoría bloqueada: ${IAB_CATEGORY_LABELS[category]}`);
                    rulesMatched.push('CATEGORY_BLOCK');
                }
            }
        }

        // Check rules
        for (const rule of this.props.reglasRestriccion) {
            if (!rule.activo) continue;

            if (rule.tipo === 'KEYWORD' && content.keywords?.includes(rule.valor)) {
                reasons.push(`Regla "${rule.nombre}": ${rule.valor}`);
                rulesMatched.push(rule.id);
            }

            if (rule.tipo === 'CATEGORY' && content.categories?.includes(rule.valor as ContentCategory)) {
                reasons.push(`Regla "${rule.nombre}": categoría ${rule.valor}`);
                rulesMatched.push(rule.id);
            }

            if (rule.tipo === 'GEOGRAPHIC' && content.country === rule.valor) {
                reasons.push(`Regla "${rule.nombre}": geo restricción ${rule.valor}`);
                rulesMatched.push(rule.id);
            }
        }

        // Check blackout schedules
        const now = new Date();
        for (const schedule of this.props.blackoutSchedules) {
            if (!schedule.activo) continue;

            const scheduleStart = new Date(schedule.fechaInicio);
            const scheduleEnd = new Date(schedule.fechaFin);

            if (now >= scheduleStart && now <= scheduleEnd) {
                // Check day of week if specified
                if (schedule.diasSemana && content.dayOfWeek !== undefined) {
                    if (!schedule.diasSemana.includes(content.dayOfWeek)) continue;
                }

                // Check time window if specified
                if (schedule.franjasHorarias && content.hour !== undefined) {
                    const inWindow = schedule.franjasHorarias.some(f =>
                        content.hour! >= f.horaInicio && content.hour! < f.horaFin
                    );
                    if (!inWindow) continue;
                }

                reasons.push(`Blackout: ${schedule.nombre}`);
                rulesMatched.push(schedule.id);
            }
        }

        // Determine classification
        let classification: ContentClassification;
        let blocked = false;

        if (reasons.some(r => r.includes('PROHIBITED') || r.includes('IAB26'))) {
            classification = 'PROHIBITED';
            blocked = true;
        } else if (rulesMatched.some(r => {
            const rule = this.props.reglasRestriccion.find(reg => reg.id === r);
            return rule?.accion === 'BLOCK';
        })) {
            classification = 'CONTROVERSIAL';
            blocked = true;
        } else if (rulesMatched.some(r => {
            const rule = this.props.reglasRestriccion.find(reg => reg.id === r);
            return rule?.accion === 'FLAG' || rule?.accion === 'REVIEW';
        })) {
            classification = 'SENSITIVE';
            blocked = false;
        } else if (reasons.length > 0) {
            classification = 'CONTEXTUAL';
            blocked = false;
        } else {
            classification = 'SAFE';
            blocked = false;
        }

        return { classification, blocked, reasons, rulesMatched };
    }

    // GDPR Consent checking
    requiresConsent(userRegion?: string): boolean {
        if (!this.props.consentimientoRequerido) return false;

        if (userRegion) {
            const geoRestriction = this.props.geoRestrictions.find(g => g.pais === userRegion);
            if (geoRestriction?.restriction === 'BLOCK') return true;
            if (geoRestriction?.restriction === 'REQUIRE_CONSENT') return true;
        }

        // GDPR applies to EU
        if (this.props.regulacionesHabilitadas.includes('GDPR')) {
            return true; // In production, check if user is in EU
        }

        return false;
    }

    // Activation
    activate(): void {
        this.props.activo = true;
        this.props.actualizadoAt = new Date().toISOString();
    }

    deactivate(): void {
        this.props.activo = false;
        this.props.actualizadoAt = new Date().toISOString();
    }

    // Queries
    isActive(): boolean {
        return this.props.activo;
    }

    getBlockedCategoriesCount(): number {
        return this.props.categoriasIABBloqueadas.length;
    }

    getActiveRulesCount(): number {
        return this.props.reglasRestriccion.filter(r => r.activo).length;
    }

    getActiveBlackouts(): z.infer<typeof BlackoutScheduleSchema>[] {
        const now = new Date();
        return this.props.blackoutSchedules.filter(s => {
            if (!s.activo) return false;
            return now >= new Date(s.fechaInicio) && now <= new Date(s.fechaFin);
        });
    }

    // Snapshot
    toSnapshot(): BrandSafetyConfigProps {
        return { ...this.props };
    }
}

// ==================== EXPORTS ====================

export const SAFETY_LEVEL_CONFIG: Record<SafetyLevel, { label: string; description: string; blockedCategories: number }> = {
    STRICT: { label: 'Estricto', description: 'Máxima protección de marca', blockedCategories: 15 },
    MODERATE: { label: 'Moderado', description: 'Balance entre seguridad y alcance', blockedCategories: 8 },
    STANDARD: { label: 'Estándar', description: 'Cumplimiento básico', blockedCategories: 5 },
    RELAXED: { label: 'Relajado', description: 'Mínimo restricciones', blockedCategories: 2 },
};

export const PRIVACY_REGULATION_LABELS: Record<PrivacyRegulation, { label: string; region: string }> = {
    GDPR: { label: 'GDPR', region: 'Unión Europea' },
    CCPA: { label: 'CCPA', region: 'California, USA' },
    COPPA: { label: 'COPPA', region: 'USA (niños)' },
    PDPD: { label: 'PDPD', region: 'Filipinas' },
    LGPD: { label: 'LGPD', region: 'Brasil' },
    PIPEDA: { label: 'PIPEDA', region: 'Canadá' },
};