/**
 * Módulo de Configuración - Silexar Pulse
 * Presentation Layer - Controller
 * 
 * Controlador HTTP para el módulo de configuración.
 * Maneja las peticiones HTTP y delega al handler.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/api/response';
import { checkPermission } from '@/lib/security/rbac';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiValidationError } from '@/lib/api/response';
import { withTenantContext } from '@/lib/db/tenant-context';
import { configuracionHandler } from '@/modules/configuracion/application/handlers';
import {
    CrearConfiguracionSchema,
    ActualizarConfiguracionSchema,
    EliminarConfiguracionesSchema,
    ImportarConfiguracionesSchema,
    ExportarConfiguracionesSchema,
    BuscarConfiguracionesSchema,
    CambiarVisibilidadSchema,
} from '@/modules/configuracion/application/commands';

/**
 * GET /api/configuracion
 * Lista configuraciones con filtros opcionales
 */
export async function GET(request: NextRequest) {
    const ctx = getUserContext(request);
    if (!ctx.userId) return apiUnauthorized();

    const perm = checkPermission(ctx, 'configuracion', 'read');
    if (!perm) return apiForbidden();

    try {
        const { searchParams } = new URL(request.url);
        const limite = parseInt(searchParams.get('limite') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Si hay parámetros de búsqueda
        if (searchParams.has('buscar') || searchParams.has('categoria')) {
            const payload = {
                buscar: searchParams.get('buscar') || undefined,
                categoria: searchParams.get('categoria') || undefined,
                grupo: searchParams.get('grupo') || undefined,
                tipo: searchParams.get('tipo') || undefined,
                limite: Math.min(limite, 100),
                offset,
                ordenarPor: (searchParams.get('ordenarPor') || 'clave') as 'clave' | 'categoria' | 'creadaEn' | 'actualizadaEn',
                orden: (searchParams.get('orden') || 'ASC') as 'ASC' | 'DESC',
            };

            const result = await configuracionHandler.buscar({
                tenantId: ctx.tenantId,
                usuarioId: ctx.userId,
                payload,
            });

            if (!result.success) {
                return apiError(result.error!.code, result.error!.message, 400, result.error!.details);
            }

            return apiSuccess(result.data);
        }

        // Listar todas
        const result = await configuracionHandler.listarTodas(ctx.tenantId, limite, offset);
        if (!result.success) {
            return apiError(result.error!.code, result.error!.message, 400);
        }

        return apiSuccess(result.data);
    } catch (error) {
        console.error('[ConfiguracionController] GET error:', error);
        return apiError('INTERNAL_ERROR', 'Error al obtener configuraciones', 500);
    }
}

/**
 * POST /api/configuracion
 * Crea una nueva configuración
 */
export async function POST(request: NextRequest) {
    const ctx = getUserContext(request);
    if (!ctx.userId) return apiUnauthorized();

    const perm = checkPermission(ctx, 'configuracion', 'admin');
    if (!perm) return apiForbidden();

    try {
        const body = await request.json();
        const parsed = CrearConfiguracionSchema.safeParse(body);

        if (!parsed.success) {
            return apiValidationError(parsed.error.flatten());
        }

        const result = await configuracionHandler.crear({
            tenantId: ctx.tenantId,
            usuarioId: ctx.userId,
            payload: parsed.data,
            ipAddress: request.headers.get('x-forwarded-for') || undefined,
            userAgent: request.headers.get('user-agent') || undefined,
        });

        if (!result.success) {
            return apiError(result.error!.code, result.error!.message, 400, result.error!.details);
        }

        return apiSuccess(result.data, 201);
    } catch (error) {
        console.error('[ConfiguracionController] POST error:', error);
        return apiError('INTERNAL_ERROR', 'Error al crear configuración', 500);
    }
}

/**
 * PUT /api/configuracion
 * Importar o exportar configuraciones
 */
export async function PUT(request: NextRequest) {
    const ctx = getUserContext(request);
    if (!ctx.userId) return apiUnauthorized();

    const perm = checkPermission(ctx, 'configuracion', 'admin');
    if (!perm) return apiForbidden();

    try {
        const body = await request.json();
        const action = body.action;

        if (action === 'import') {
            const parsed = ImportarConfiguracionesSchema.safeParse(body);
            if (!parsed.success) {
                return apiValidationError(parsed.error.flatten());
            }

            const result = await configuracionHandler.importar({
                tenantId: ctx.tenantId,
                usuarioId: ctx.userId,
                payload: parsed.data,
                ipAddress: request.headers.get('x-forwarded-for') || undefined,
                userAgent: request.headers.get('user-agent') || undefined,
            });

            if (!result.success) {
                return apiError(result.error!.code, result.error!.message, 400, result.error!.details);
            }

            return apiSuccess(result.data);
        }

        if (action === 'export') {
            const parsed = ExportarConfiguracionesSchema.safeParse(body);
            if (!parsed.success) {
                return apiValidationError(parsed.error.flatten());
            }

            const result = await configuracionHandler.exportar({
                tenantId: ctx.tenantId,
                usuarioId: ctx.userId,
                payload: parsed.data,
            });

            if (!result.success) {
                return apiError(result.error!.code, result.error!.message, 400, result.error!.details);
            }

            return apiSuccess(result.data);
        }

        return apiError('INVALID_ACTION', 'Acción no válida. Use "import" o "export"', 400);
    } catch (error) {
        console.error('[ConfiguracionController] PUT error:', error);
        return apiError('INTERNAL_ERROR', 'Error en la operación', 500);
    }
}

const controller = { GET, POST, PUT };
export default controller;
