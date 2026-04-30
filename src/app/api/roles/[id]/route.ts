/**
 * 🔐 SILEXAR PULSE - API de Gestión de Rol Individual
 * 
 * @description Endpoints para obtener, actualizar y eliminar un rol específico
 * Sigue el protocolo SILEXAR MODULE BUILDER - TIER FUNCTIONAL
 * 
 * @version 2025.1.0
 * @tier TIER_FUNCTIONAL
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiRoute } from '@/lib/api/with-api-route';
import { AuditLogger, AuditEventType, AuditSeverity } from '@/lib/security/audit-logger';
import { SistemaRBAC, Rol } from '@/lib/services/sistema-rbac';
import { z } from 'zod';

// ==================== SCHEMAS DE VALIDACIÓN ====================

const PermisoSchema = z.object({
    recurso: z.enum([
        'anunciantes', 'agencias', 'emisoras', 'cunas', 'campanas',
        'contratos', 'facturacion', 'inventario', 'pauta', 'tandas',
        'emision', 'conciliacion', 'informes', 'usuarios', 'configuracion'
    ]),
    acciones: z.array(z.enum(['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'])).min(1)
});

const UpdateRolSchema = z.object({
    nombre: z.string().min(2).max(50).optional(),
    descripcion: z.string().max(255).optional(),
    permisos: z.array(PermisoSchema).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    icono: z.string().max(50).optional(),
    activo: z.boolean().optional()
});

// ==================== HELPERS ====================

const ROLES_SISTEMA = ['super_admin', 'admin_tenant', 'gerente_ventas', 'ejecutivo_ventas',
    'operador_pauta', 'operador_trafico', 'contador', 'auditor', 'cliente_externo'];

const auditLogger = new AuditLogger();

// ==================== FUNCIONES HELPER LOCALES ====================

function apiForbidden(message: string = 'Acceso denegado'): NextResponse {
    return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message } },
        { status: 403 }
    );
}

function apiNotFound(message: string = 'Recurso no encontrado'): NextResponse {
    return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message } },
        { status: 404 }
    );
}

function apiError(message: string, status: number = 500, details?: unknown): NextResponse {
    return NextResponse.json(
        { success: false, error: { code: 'ERROR', message, details } },
        { status }
    );
}

function apiSuccess(data: unknown, status: number = 200): NextResponse {
    return NextResponse.json(
        { success: true, data },
        { status }
    );
}

// ==================== GET /api/roles/[id] ====================

export const GET = withApiRoute(
    { resource: 'configuracion', action: 'read', skipCsrf: true },
    async ({ ctx, req, params }) => {
        try {
            const { id } = params as { id: string };

            // Buscar el rol en el sistema RBAC
            const roles = SistemaRBAC.getRoles();
            const rol = roles.find(r => r.id === id);

            if (!rol) {
                return apiNotFound('Rol no encontrado');
            }

            // Obtener permisos del rol
            const permisos = SistemaRBAC.getPermisosRol(id as Rol);
            const esSistema = ROLES_SISTEMA.includes(id);
            const esEditable = !esSistema;

            // Log de auditoría
            await auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.LOW,
                success: true,
                action: 'read',
                resource: 'roles',
                userId: ctx.userId || 'unknown',
                ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
                userAgent: req.headers.get('user-agent') || 'unknown',
                metadata: { rolId: id }
            });

            return apiSuccess({
                id: rol.id,
                nombre: rol.nombre,
                descripcion: rol.descripcion,
                nivel: esSistema ? 'sistema' : 'custom',
                permisos,
                esEditable,
                esSistema
            });

        } catch (error) {
            await auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.MEDIUM,
                success: false,
                action: 'read',
                resource: 'roles',
                userId: ctx.userId || 'unknown',
                ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
                errorMessage: error instanceof Error ? error.message : 'Error desconocido'
            });

            return apiError('Error al obtener rol', 500);
        }
    }
);

// ==================== PUT /api/roles/[id] ====================

export const PUT = withApiRoute(
    { resource: 'configuracion', action: 'update' },
    async ({ ctx, req, params }) => {
        try {
            const { id } = params as { id: string };

            // Los roles de sistema no pueden ser modificados
            if (ROLES_SISTEMA.includes(id)) {
                return apiError('Los roles de sistema no pueden ser modificados', 403);
            }

            // Parsear y validar body
            const body = await req.json();
            const data = UpdateRolSchema.parse(body);

            // Verificar que no exista otro rol con el mismo nombre
            if (data.nombre) {
                const roles = SistemaRBAC.getRoles();
                const nombreExistente = roles.find(r =>
                    r.id !== id && r.nombre.toLowerCase() === data.nombre!.toLowerCase()
                );
                if (nombreExistente) {
                    return apiError('Ya existe otro rol con ese nombre', 400);
                }
            }

            // Simular actualización
            const rolActualizado = {
                id,
                nombre: data.nombre || 'Rol Custom',
                descripcion: data.descripcion || '',
                nivel: 'custom',
                permisos: data.permisos || [],
                color: data.color || '#6366F1',
                icono: data.icono || 'shield',
                activo: data.activo !== false,
                esEditable: true,
                updatedAt: new Date().toISOString(),
                updatedBy: ctx.userId
            };

            // Log de auditoría
            await auditLogger.logEvent({
                eventType: AuditEventType.DATA_UPDATE,
                severity: AuditSeverity.MEDIUM,
                success: true,
                action: 'update',
                resource: 'roles',
                userId: ctx.userId || 'unknown',
                ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
                userAgent: req.headers.get('user-agent') || 'unknown',
                metadata: { rolId: id, cambios: Object.keys(data) }
            });

            return apiSuccess(rolActualizado);

        } catch (error) {
            await auditLogger.logEvent({
                eventType: AuditEventType.DATA_UPDATE,
                severity: AuditSeverity.MEDIUM,
                success: false,
                action: 'update',
                resource: 'roles',
                userId: ctx.userId || 'unknown',
                ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
                errorMessage: error instanceof Error ? error.message : 'Error desconocido'
            });

            if (error instanceof z.ZodError) {
                const fieldErrors = Object.entries(error.flatten().fieldErrors).flatMap(
                    ([field, messages]) => (messages as string[]).map(message => ({ field, message }))
                );
                return apiError('Datos inválidos', 400, fieldErrors);
            }
            return apiError('Error al actualizar rol', 500);
        }
    }
);

// ==================== DELETE /api/roles/[id] ====================

export const DELETE = withApiRoute(
    { resource: 'configuracion', action: 'delete' },
    async ({ ctx, req, params }) => {
        try {
            const { id } = params as { id: string };

            // Los roles de sistema no pueden ser eliminados
            if (ROLES_SISTEMA.includes(id)) {
                return apiError('Los roles de sistema no pueden ser eliminados', 403);
            }

            // Buscar el rol
            const roles = SistemaRBAC.getRoles();
            const rol = roles.find(r => r.id === id);

            if (!rol) {
                return apiNotFound('Rol no encontrado');
            }

            // En una implementación real, haríamos un soft delete en BD
            // Simular eliminación
            const eliminado = {
                id,
                nombre: rol.nombre,
                deletedAt: new Date().toISOString(),
                deletedBy: ctx.userId
            };

            // Log de auditoría
            await auditLogger.logEvent({
                eventType: AuditEventType.DATA_DELETE,
                severity: AuditSeverity.HIGH,
                success: true,
                action: 'delete',
                resource: 'roles',
                userId: ctx.userId || 'unknown',
                ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
                userAgent: req.headers.get('user-agent') || 'unknown',
                metadata: { rolId: id, rolNombre: rol.nombre }
            });

            return apiSuccess({ message: 'Rol eliminado correctamente', rol: eliminado });

        } catch (error) {
            await auditLogger.logEvent({
                eventType: AuditEventType.DATA_DELETE,
                severity: AuditSeverity.HIGH,
                success: false,
                action: 'delete',
                resource: 'roles',
                userId: ctx.userId || 'unknown',
                ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
                errorMessage: error instanceof Error ? error.message : 'Error desconocido'
            });

            return apiError('Error al eliminar rol', 500);
        }
    }
);
