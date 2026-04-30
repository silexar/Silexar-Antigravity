/**
 * 💾 SILEXAR PULSE - Contrato Draft API TIER 0
 * 
 * @description API para auto-guardado de borradores de contratos.
 * Este endpoint recibe guarda el estado del wizard sin crear un contrato formal.
 * 
 * Endpoints:
 *   POST /api/contratos/draft - Guarda un borrador
 *   GET /api/contratos/draft?sessionId=X - Recupera un borrador
 *   DELETE /api/contratos/draft?sessionId=X - Elimina un borrador
 * 
 * @version 2025.6.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextResponse } from 'next/server';
import { z } from 'zod'
import { logger } from '@/lib/observability';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError, apiNotFound } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { AuditEventType } from '@/lib/security/audit-types';

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const draftBodySchema = z.object({
    sessionId: z.string().min(1, 'sessionId es requerido'),
    titulo: z.string().min(1).optional(),
    anuncianteId: z.string().uuid().optional(),
    fechaInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    fechaFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    valorTotalBruto: z.number().nonnegative().optional(),
}).strict()

// ═══════════════════════════════════════════════════════════════
// STORAGE KEY PARA DRAFTS (usando cache en memoria para demo)
// En producción usar Redis o la base de datos
// ═══════════════════════════════════════════════════════════════

const draftsCache = new Map<string, {
    data: Record<string, unknown>;
    tenantId: string;
    userId: string;
    updatedAt: Date;
}>();

// Limpiar drafts mayores a 7 días cada hora
setInterval(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    for (const [key, value] of draftsCache.entries()) {
        if (value.updatedAt < sevenDaysAgo) {
            draftsCache.delete(key);
        }
    }
}, 60 * 60 * 1000);

// ═══════════════════════════════════════════════════════════════
// POST: Guardar borrador
// ═══════════════════════════════════════════════════════════════

export const POST = withApiRoute(
    { resource: 'contratos', action: 'create', skipCsrf: true },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId
        const userId = ctx.userId

        try {
            let rawBody: unknown;
            try {
                rawBody = await req.json();
            } catch {
                return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse;
            }

            const parseResult = draftBodySchema.safeParse(rawBody);
            if (!parseResult.success) {
                return apiError(
                    'VALIDATION_ERROR',
                    'Error en la validación de los datos',
                    400,
                    parseResult.error.flatten().fieldErrors
                ) as unknown as NextResponse;
            }

            const body = parseResult.data;
            const { sessionId, ...wizardState } = body;

            // Guardar en cache
            draftsCache.set(sessionId, {
                data: wizardState,
                tenantId,
                userId,
                updatedAt: new Date()
            });

            // Log de auditoría
            auditLogger.log({
                type: AuditEventType.DATA_CREATE,
                userId,
                metadata: {
                    module: 'contratos',
                    accion: 'guardar_draft',
                    sessionId,
                    tenantId
                }
            });

            logger.debug('[API/Contratos/Draft] Borrador guardado', {
                sessionId,
                tenantId,
                userId
            });

            return apiSuccess({
                success: true,
                message: 'Borrador guardado',
                sessionId,
                savedAt: new Date().toISOString()
            }, 200, { message: 'Borrador guardado' }) as unknown as NextResponse;

        } catch (error) {
            logger.error('[API/Contratos/Draft] Error al guardar:', error instanceof Error ? error : undefined, {
                module: 'contratos/draft',
                action: 'POST',
                userId: ctx.userId,
                tenantId: ctx.tenantId
            });

            // Log de auditoría para fallo
            auditLogger.log({
                type: AuditEventType.API_ERROR,
                userId: ctx.userId,
                metadata: {
                    module: 'contratos',
                    accion: 'guardar_draft',
                    tenantId: ctx.tenantId,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            });

            return apiServerError() as unknown as NextResponse;
        }
    }
);

// ═══════════════════════════════════════════════════════════════
// GET: Recuperar borrador
// ═══════════════════════════════════════════════════════════════

export const GET = withApiRoute(
    { resource: 'contratos', action: 'read', skipCsrf: true },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId
        const userId = ctx.userId

        try {
            const { searchParams } = new URL(req.url);
            const sessionId = searchParams.get('sessionId');

            if (!sessionId) {
                return apiError('MISSING_PARAM', 'sessionId es requerido', 400) as unknown as NextResponse;
            }

            const draft = draftsCache.get(sessionId);

            // Verificar que el draft existe y pertenece al tenant
            if (!draft || draft.tenantId !== tenantId) {
                return apiNotFound('Borrador no encontrado') as unknown as NextResponse;
            }

            // Log de auditoría para lectura de draft
            auditLogger.log({
                type: AuditEventType.DATA_READ,
                userId,
                metadata: {
                    module: 'contratos',
                    accion: 'recuperar_draft',
                    sessionId,
                    tenantId
                }
            });

            return apiSuccess({
                success: true,
                data: draft.data,
                savedAt: draft.updatedAt.toISOString()
            }, 200, { message: 'Borrador recuperado' }) as unknown as NextResponse;

        } catch (error) {
            logger.error('[API/Contratos/Draft] Error al recuperar:', error instanceof Error ? error : undefined, {
                module: 'contratos/draft',
                action: 'GET',
                userId: ctx.userId,
                tenantId: ctx.tenantId
            });

            // Log de auditoría para fallo
            auditLogger.log({
                type: AuditEventType.API_ERROR,
                userId: ctx.userId,
                metadata: {
                    module: 'contratos',
                    accion: 'recuperar_draft',
                    tenantId: ctx.tenantId,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            });

            return apiServerError() as unknown as NextResponse;
        }
    }
);

// ═══════════════════════════════════════════════════════════════
// DELETE: Eliminar borrador
// ═══════════════════════════════════════════════════════════════

export const DELETE = withApiRoute(
    { resource: 'contratos', action: 'delete', skipCsrf: true },
    async ({ ctx, req }) => {
        const tenantId = ctx.tenantId
        const userId = ctx.userId

        try {
            const { searchParams } = new URL(req.url);
            const sessionId = searchParams.get('sessionId');

            if (!sessionId) {
                return apiError('MISSING_PARAM', 'sessionId es requerido', 400) as unknown as NextResponse;
            }

            const draft = draftsCache.get(sessionId);

            // Verificar que el draft existe y pertenece al tenant
            if (!draft || draft.tenantId !== tenantId) {
                return apiNotFound('Borrador no encontrado') as unknown as NextResponse;
            }

            draftsCache.delete(sessionId);

            // Log de auditoría
            auditLogger.log({
                type: AuditEventType.DATA_DELETE,
                userId,
                metadata: {
                    module: 'contratos',
                    accion: 'eliminar_draft',
                    sessionId,
                    tenantId
                }
            });

            logger.debug('[API/Contratos/Draft] Borrador eliminado', {
                sessionId,
                tenantId,
                userId
            });

            return apiSuccess({
                success: true,
                message: 'Borrador eliminado'
            }, 200, { message: 'Borrador eliminado' }) as unknown as NextResponse;

        } catch (error) {
            logger.error('[API/Contratos/Draft] Error al eliminar:', error instanceof Error ? error : undefined, {
                module: 'contratos/draft',
                action: 'DELETE',
                userId: ctx.userId,
                tenantId: ctx.tenantId
            });

            // Log de auditoría para fallo
            auditLogger.log({
                type: AuditEventType.API_ERROR,
                userId: ctx.userId,
                metadata: {
                    module: 'contratos',
                    accion: 'eliminar_draft',
                    tenantId: ctx.tenantId,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            });

            return apiServerError() as unknown as NextResponse;
        }
    }
);
