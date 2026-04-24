/**
 * 💾 SILEXAR PULSE - Contrato Draft API TIER 0
 * 
 * @description API para auto-guardado de borradores de contratos.
 * Este endpoint recibe guarda el estado del wizard sin crear un contrato formal.
 * 
 * Endpoints:
 *   POST /api/contratos/draft - Guarda un borrador
 *   GET /api/contratos/draft?sessionId=X - Recupera un borrador
 * 
 * @version 2025.6.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';

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
        try {
            const body = await req.json();
            const { sessionId, ...wizardState } = body;

            if (!sessionId) {
                return NextResponse.json({
                    success: false,
                    error: 'sessionId es requerido'
                }, { status: 400 });
            }

            // Guardar en cache
            draftsCache.set(sessionId, {
                data: wizardState,
                tenantId: ctx.tenantId,
                userId: ctx.userId,
                updatedAt: new Date()
            });

            logger.debug('[API/Contratos/Draft] Borrador guardado', {
                sessionId,
                tenantId: ctx.tenantId,
                userId: ctx.userId
            });

            return NextResponse.json({
                success: true,
                message: 'Borrador guardado',
                sessionId,
                savedAt: new Date().toISOString()
            });
        } catch (error) {
            logger.error('[API/Contratos/Draft] Error al guardar:', error instanceof Error ? error : undefined, {
                module: 'contratos/draft',
                action: 'POST',
                userId: ctx.userId,
                tenantId: ctx.tenantId
            });
            return NextResponse.json({
                success: false,
                error: 'Error al guardar borrador'
            }, { status: 500 });
        }
    }
);

// ═══════════════════════════════════════════════════════════════
// GET: Recuperar borrador
// ═══════════════════════════════════════════════════════════════

export const GET = withApiRoute(
    { resource: 'contratos', action: 'read', skipCsrf: true },
    async ({ ctx, req }) => {
        try {
            const { searchParams } = new URL(req.url);
            const sessionId = searchParams.get('sessionId');

            if (!sessionId) {
                return NextResponse.json({
                    success: false,
                    error: 'sessionId es requerido'
                }, { status: 400 });
            }

            const draft = draftsCache.get(sessionId);

            // Verificar que el draft existe y pertenece al tenant
            if (!draft || draft.tenantId !== ctx.tenantId) {
                return NextResponse.json({
                    success: false,
                    error: 'Borrador no encontrado'
                }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                data: draft.data,
                savedAt: draft.updatedAt.toISOString()
            });
        } catch (error) {
            logger.error('[API/Contratos/Draft] Error al recuperar:', error instanceof Error ? error : undefined, {
                module: 'contratos/draft',
                action: 'GET',
                userId: ctx.userId,
                tenantId: ctx.tenantId
            });
            return NextResponse.json({
                success: false,
                error: 'Error al recuperar borrador'
            }, { status: 500 });
        }
    }
);

// ═══════════════════════════════════════════════════════════════
// DELETE: Eliminar borrador
// ═══════════════════════════════════════════════════════════════

export const DELETE = withApiRoute(
    { resource: 'contratos', action: 'delete', skipCsrf: true },
    async ({ ctx, req }) => {
        try {
            const { searchParams } = new URL(req.url);
            const sessionId = searchParams.get('sessionId');

            if (!sessionId) {
                return NextResponse.json({
                    success: false,
                    error: 'sessionId es requerido'
                }, { status: 400 });
            }

            const draft = draftsCache.get(sessionId);

            // Verificar que el draft existe y pertenece al tenant
            if (!draft || draft.tenantId !== ctx.tenantId) {
                return NextResponse.json({
                    success: false,
                    error: 'Borrador no encontrado'
                }, { status: 404 });
            }

            draftsCache.delete(sessionId);

            return NextResponse.json({
                success: true,
                message: 'Borrador eliminado'
            });
        } catch (error) {
            logger.error('[API/Contratos/Draft] Error al eliminar:', error instanceof Error ? error : undefined, {
                module: 'contratos/draft',
                action: 'DELETE',
                userId: ctx.userId,
                tenantId: ctx.tenantId
            });
            return NextResponse.json({
                success: false,
                error: 'Error al eliminar borrador'
            }, { status: 500 });
        }
    }
);
