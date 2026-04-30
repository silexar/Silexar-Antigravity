/**
 * GET /api/configuracion/[id]
 * Obtiene, actualiza o elimina una configuración específica
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/api/response';
import { checkPermission } from '@/lib/security/rbac';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiValidationError, apiNotFound } from '@/lib/api/response';
import { configuracionHandler } from '@/modules/configuracion/application/handlers';
import { ActualizarConfiguracionSchema, CambiarVisibilidadSchema } from '@/modules/configuracion/application/commands';

interface ConfiguracionRouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/configuracion/[id]
 * Obtiene una configuración por ID
 */
export async function GET(
    request: NextRequest,
    { params }: ConfiguracionRouteParams
) {
    const ctx = getUserContext(request);
    if (!ctx.userId) return apiUnauthorized();

    const perm = checkPermission(ctx, 'configuracion', 'read');
    if (!perm) return apiForbidden();

    try {
        const { id } = await params;
        const result = await configuracionHandler.obtenerPorId(ctx.tenantId, id);

        if (!result.success) {
            if (result.error?.code === 'NO_ENCONTRADA') {
                return apiNotFound('configuración');
            }
            return apiError(result.error!.code, result.error!.message, 400);
        }

        return apiSuccess(result.data);
    } catch (error) {
        console.error('[ConfiguracionController] GET [id] error:', error);
        return apiError('INTERNAL_ERROR', 'Error al obtener configuración', 500);
    }
}

/**
 * PUT /api/configuracion/[id]
 * Actualiza una configuración
 */
export async function PUT(
    request: NextRequest,
    { params }: ConfiguracionRouteParams
) {
    const ctx = getUserContext(request);
    if (!ctx.userId) return apiUnauthorized();

    const perm = checkPermission(ctx, 'configuracion', 'admin');
    if (!perm) return apiForbidden();

    try {
        const { id } = await params;
        const body = await request.json();

        // Verificar si es cambio de visibilidad
        if (body.cambiarVisibilidad) {
            const parsed = CambiarVisibilidadSchema.safeParse(body);
            if (!parsed.success) {
                return apiValidationError(parsed.error.flatten());
            }

            const result = await configuracionHandler.cambiarVisibilidad({
                tenantId: ctx.tenantId,
                usuarioId: ctx.userId,
                configuracionId: id,
                payload: parsed.data,
                ipAddress: request.headers.get('x-forwarded-for') || undefined,
                userAgent: request.headers.get('user-agent') || undefined,
            });

            if (!result.success) {
                if (result.error?.code === 'NO_ENCONTRADA') {
                    return apiNotFound('configuración');
                }
                return apiError(result.error!.code, result.error!.message, 400);
            }

            return apiSuccess(result.data);
        }

        // Actualización normal
        const parsed = ActualizarConfiguracionSchema.safeParse(body);
        if (!parsed.success) {
            return apiValidationError(parsed.error.flatten());
        }

        const result = await configuracionHandler.actualizar({
            tenantId: ctx.tenantId,
            usuarioId: ctx.userId,
            configuracionId: id,
            payload: parsed.data,
            ipAddress: request.headers.get('x-forwarded-for') || undefined,
            userAgent: request.headers.get('user-agent') || undefined,
        });

        if (!result.success) {
            if (result.error?.code === 'NO_ENCONTRADA') {
                return apiNotFound('configuración');
            }
            if (result.error?.code === 'NO_EDITABLE') {
                return apiError(result.error!.code, result.error!.message, 403);
            }
            return apiError(result.error!.code, result.error!.message, 400);
        }

        return apiSuccess(result.data);
    } catch (error) {
        console.error('[ConfiguracionController] PUT [id] error:', error);
        return apiError('INTERNAL_ERROR', 'Error al actualizar configuración', 500);
    }
}

/**
 * DELETE /api/configuracion/[id]
 * Elimina una configuración
 */
export async function DELETE(
    request: NextRequest,
    { params }: ConfiguracionRouteParams
) {
    const ctx = getUserContext(request);
    if (!ctx.userId) return apiUnauthorized();

    const perm = checkPermission(ctx, 'configuracion', 'admin');
    if (!perm) return apiForbidden();

    try {
        const { id } = await params;

        const result = await configuracionHandler.eliminar({
            tenantId: ctx.tenantId,
            usuarioId: ctx.userId,
            payload: { ids: [id] },
            ipAddress: request.headers.get('x-forwarded-for') || undefined,
            userAgent: request.headers.get('user-agent') || undefined,
        });

        if (!result.success) {
            if (result.error?.code === 'NO_ENCONTRADA') {
                return apiNotFound('configuración');
            }
            return apiError(result.error!.code, result.error!.message, 400);
        }

        return apiSuccess(result.data);
    } catch (error) {
        console.error('[ConfiguracionController] DELETE [id] error:', error);
        return apiError('INTERNAL_ERROR', 'Error al eliminar configuración', 500);
    }
}
