/**
 * Brand Safety API - Enterprise Brand Safety and Compliance
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
import { BrandSafetyConfig, BrandSafetyConfigProps, IAB_CATEGORY_LABELS, SAFETY_LEVEL_CONFIG, PRIVACY_REGULATION_LABELS } from '@/modules/configuracion/domain/entities/BrandSafetyConfig';

// ==================== MOCK DATABASE ====================

const mockBrandSafety = new Map<string, BrandSafetyConfigProps>();

function getBrandSafetyByTenant(tenantId: string): BrandSafetyConfigProps | undefined {
    return Array.from(mockBrandSafety.values()).find(b => b.tenantId === tenantId);
}

function createBrandSafety(data: Omit<BrandSafetyConfigProps, 'id' | 'version' | 'creadoAt' | 'actualizadoAt'>): BrandSafetyConfigProps {
    const now = new Date().toISOString();
    const config: BrandSafetyConfigProps = {
        ...data,
        id: uuidv4(),
        version: 1,
        creadoAt: now,
        actualizadoAt: now,
    } as BrandSafetyConfigProps;
    mockBrandSafety.set(config.id, config);
    return config;
}

function updateBrandSafety(id: string, updates: Partial<BrandSafetyConfigProps>): BrandSafetyConfigProps | undefined {
    const existing = mockBrandSafety.get(id);
    if (!existing) return undefined;

    const updated: BrandSafetyConfigProps = {
        ...existing,
        ...updates,
        version: existing.version + 1,
        actualizadoAt: new Date().toISOString(),
    } as BrandSafetyConfigProps;
    mockBrandSafety.set(id, updated);
    return updated;
}

// ==================== SCHEMAS ====================

const CreateBrandSafetySchema = z.object({
    nombre: z.string().min(1).max(255),
    nivelSeguridad: z.enum(['STRICT', 'MODERATE', 'STANDARD', 'RELAXED']).default('MODERATE'),
    regulaciones: z.array(z.enum(['GDPR', 'CCPA', 'COPPA', 'PDPD', 'LGPD', 'PIPEDA'])).default(['GDPR', 'CCPA']),
    usarDoubleVerify: z.boolean().default(false),
    usarMoat: z.boolean().default(false),
    usarIAS: z.boolean().default(false),
});

const AddRestrictionSchema = z.object({
    nombre: z.string().min(1).max(255),
    descripcion: z.string().max(500).optional(),
    tipo: z.enum(['KEYWORD', 'CATEGORY', 'DOMAIN', 'KEYWORD_LIST', 'GEOGRAPHIC', 'TEMPORAL']),
    valor: z.string().min(1),
    accion: z.enum(['BLOCK', 'ALLOW', 'FLAG', 'REVIEW']),
    severidad: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
});

const EvaluateContentSchema = z.object({
    keywords: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    domain: z.string().optional(),
    country: z.string().optional(),
    hour: z.number().min(0).max(23).optional(),
    dayOfWeek: z.number().min(0).max(6).optional(),
});

// ==================== GET /api/brand-safety ====================

export const GET = withApiRoute(
    { resource: 'brand_safety', action: 'read', skipCsrf: true },
    async ({ ctx }) => {
        try {
            const tenantId = ctx.tenantId;
            let config = getBrandSafetyByTenant(tenantId);

            // Create default if not exists
            if (!config) {
                const entity = BrandSafetyConfig.createDefault(tenantId, 'Brand Safety Configuration');
                config = entity.toSnapshot();
                createBrandSafety(config);
            }

            return apiSuccess({
                id: config.id,
                nombre: config.nombre,
                nivelSeguridad: config.nivelSeguridad,
                nivelInfo: SAFETY_LEVEL_CONFIG[config.nivelSeguridad as keyof typeof SAFETY_LEVEL_CONFIG],
                activo: config.activo,
                categoriasIABPermitidas: config.categoriasIABPermitidas,
                categoriasIABBloqueadas: config.categoriasIABBloqueadas,
                iabCategories: IAB_CATEGORY_LABELS,
                reglasCount: config.reglasRestriccion.length,
                reglasActivas: config.reglasRestriccion.filter(r => r.activo).length,
                palabrasClaveBloqueoCount: config.palabrasClaveBloqueo.length,
                palabrasClaveMarcaCount: config.palabrasClaveMarca.length,
                blackoutSchedulesCount: config.blackoutSchedules.length,
                blackoutActivos: config.blackoutSchedules.filter(s => s.activo).length,
                regulacionesHabilitadas: config.regulacionesHabilitadas,
                regulacionesInfo: PRIVACY_REGULATION_LABELS,
                consentimientoRequerido: config.consentimientoRequerido,
                edadMinimaConsentimiento: config.edadMinimaConsentimiento,
                usarDoubleVerify: config.usarDoubleVerify,
                usarMoat: config.usarMoat,
                usarIAS: config.usarIAS,
                generarReportesAutomaticos: config.generarReportesAutomaticos,
                frecuenciaReportes: config.frecuenciaReportes,
            }) as unknown as NextResponse;
        } catch (error) {
            logger.error('Error GET /api/brand-safety', error instanceof Error ? error : undefined);
            return apiServerError() as unknown as NextResponse;
        }
    }
);

// ==================== POST /api/brand-safety ====================

export const POST = withApiRoute(
    { resource: 'brand_safety', action: 'create' },
    async ({ ctx, req }) => {
        try {
            const tenantId = ctx.tenantId;
            const userId = ctx.userId;
            const body = await req.json();
            const { action } = body;

            let config = getBrandSafetyByTenant(tenantId);
            if (!config) {
                const entity = BrandSafetyConfig.createDefault(tenantId, 'Brand Safety Configuration');
                config = entity.toSnapshot();
                createBrandSafety(config);
            }

            switch (action) {
                case 'create': {
                    const parsed = CreateBrandSafetySchema.safeParse(body.data || body);
                    if (!parsed.success) {
                        return apiError('VALIDATION_ERROR', 'Error de validación', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
                    }

                    const entity = BrandSafetyConfig.create({
                        tenantId,
                        nombre: parsed.data.nombre,
                        nivelSeguridad: parsed.data.nivelSeguridad as any,
                        activo: true,
                        categoriasIABPermitidas: [],
                        categoriasIABBloqueadas: ['IAB26'],
                        reglasRestriccion: [],
                        palabrasClaveBloqueo: [],
                        palabrasClaveMarca: [],
                        blackoutSchedules: [],
                        regulacionesHabilitadas: parsed.data.regulaciones as any[],
                        consentimientoRequerido: true,
                        edadMinimaConsentimiento: 16,
                        geoRestrictions: [],
                        usarDoubleVerify: parsed.data.usarDoubleVerify,
                        usarMoat: parsed.data.usarMoat,
                        usarIAS: parsed.data.usarIAS,
                        generarReportesAutomaticos: true,
                        frecuenciaReportes: 'WEEKLY',
                        emailReportes: [],
                    });

                    const snapshot = entity.toSnapshot();
                    createBrandSafety(snapshot);

                    auditLogger.log({
                        type: AuditEventType.DATA_CREATE,
                        userId,
                        metadata: { module: 'brand_safety', resourceId: snapshot.id },
                    });

                    return apiSuccess({ id: snapshot.id, nombre: snapshot.nombre }, 201) as unknown as NextResponse;
                }

                case 'add_restriction': {
                    const parsed = AddRestrictionSchema.safeParse(body.data || body);
                    if (!parsed.success) {
                        return apiError('VALIDATION_ERROR', 'Error de validación', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
                    }

                    const entity = BrandSafetyConfig.fromSnapshot(config);
                    entity.addRestriction({
                        nombre: parsed.data.nombre,
                        descripcion: parsed.data.descripcion,
                        tipo: parsed.data.tipo as any,
                        valor: parsed.data.valor,
                        accion: parsed.data.accion as any,
                        severidad: parsed.data.severidad as any,
                    });

                    updateBrandSafety(config.id, entity.toSnapshot());

                    return apiSuccess({ added: true, nombre: parsed.data.nombre }) as unknown as NextResponse;
                }

                case 'add_keyword': {
                    const keyword = body.keyword;
                    if (!keyword) {
                        return apiError('VALIDATION_ERROR', 'Keyword es requerido', 422) as unknown as NextResponse;
                    }

                    const entity = BrandSafetyConfig.fromSnapshot(config);
                    entity.addBloqueoKeyword(keyword);
                    updateBrandSafety(config.id, entity.toSnapshot());

                    return apiSuccess({ added: true, keyword }) as unknown as NextResponse;
                }

                case 'add_blackout': {
                    const scheduleData = body.data || body;
                    const entity = BrandSafetyConfig.fromSnapshot(config);
                    entity.addBlackoutSchedule({
                        nombre: scheduleData.nombre,
                        fechaInicio: scheduleData.fechaInicio,
                        fechaFin: scheduleData.fechaFin,
                        diasSemana: scheduleData.diasSemana,
                        franjasHorarias: scheduleData.franjasHorarias,
                        motivo: scheduleData.motivo,
                    });
                    updateBrandSafety(config.id, entity.toSnapshot());

                    return apiSuccess({ added: true, nombre: scheduleData.nombre }) as unknown as NextResponse;
                }

                case 'enable_regulation': {
                    const regulation = body.regulation;
                    const entity = BrandSafetyConfig.fromSnapshot(config);
                    entity.enableRegulation(regulation as any);
                    updateBrandSafety(config.id, entity.toSnapshot());

                    return apiSuccess({ enabled: true, regulation }) as unknown as NextResponse;
                }

                case 'block_category': {
                    const category = body.category;
                    const entity = BrandSafetyConfig.fromSnapshot(config);
                    entity.blockCategory(category as any);
                    updateBrandSafety(config.id, entity.toSnapshot());

                    return apiSuccess({ blocked: true, category, categoryInfo: IAB_CATEGORY_LABELS[category as keyof typeof IAB_CATEGORY_LABELS] }) as unknown as NextResponse;
                }

                case 'evaluate_content': {
                    const parsed = EvaluateContentSchema.safeParse(body.data || body);
                    if (!parsed.success) {
                        return apiError('VALIDATION_ERROR', 'Error de validación', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
                    }

                    const entity = BrandSafetyConfig.fromSnapshot(config);
                    const evaluation = entity.evaluateContent({
                        keywords: parsed.data.keywords,
                        categories: parsed.data.categories as any[],
                        domain: parsed.data.domain,
                        country: parsed.data.country,
                        hour: parsed.data.hour,
                        dayOfWeek: parsed.data.dayOfWeek,
                    });

                    return apiSuccess(evaluation) as unknown as NextResponse;
                }

                case 'activate': {
                    const entity = BrandSafetyConfig.fromSnapshot(config);
                    entity.activate();
                    updateBrandSafety(config.id, entity.toSnapshot());

                    return apiSuccess({ activated: true }) as unknown as NextResponse;
                }

                case 'deactivate': {
                    const entity = BrandSafetyConfig.fromSnapshot(config);
                    entity.deactivate();
                    updateBrandSafety(config.id, entity.toSnapshot());

                    return apiSuccess({ deactivated: true }) as unknown as NextResponse;
                }

                default:
                    return apiError('INVALID_ACTION', `Acción no válida: ${action}`, 400) as unknown as NextResponse;
            }
        } catch (error) {
            logger.error('Error POST /api/brand-safety', error instanceof Error ? error : undefined);
            return apiServerError() as unknown as NextResponse;
        }
    }
);