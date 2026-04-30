/**
 * GET /api/configuracion/auditoria/[configuracionId]
 * Obtiene el historial de auditoría de una configuración
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/api/response';
import { checkPermission } from '@/lib/security/rbac';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api/response';
import { configuracionHandler } from '@/modules/configuracion/application/handlers';

interface AuditoriaRouteParams {
    params: Promise<{ configuracionId: string }>;
}

/**
 * GET /api/configuracion/auditoria/[configuracionId]
 * Obtiene el historial de auditoría
 */
export async function GET(
    request: NextRequest,
    { params }: AuditoriaRouteParams
) {
    const ctx = getUserContext(request);
    if (!ctx.userId) return apiUnauthorized();

    const perm = checkPermission(ctx, 'configuracion', 'read');
    if (!perm) return apiForbidden();

    try {
        const { configuracionId } = await params;
        const { searchParams } = new URL(request.url);
        const limite = Math.min(parseInt(searchParams.get('limite') || '50'), 100);

        const result = await configuracionHandler.obtenerAuditoria(configuracionId, ctx.tenantId, limite);

        if (!result.success) {
            return apiError(result.error!.code, result.error!.message, 400);
        }

        return apiSuccess(result.data);
    } catch (error) {
        console.error('[ConfiguracionController] GET auditoria error:', error);
        return apiError('INTERNAL_ERROR', 'Error al obtener auditoría', 500);
    }
}
