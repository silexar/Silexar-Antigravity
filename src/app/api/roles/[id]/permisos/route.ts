/**
 * 🔐 SILEXAR PULSE - API de Permisos de Rol
 * 
 * @description Endpoints para gestionar permisos de un rol específico
 * GET: Obtener permisos actuales del rol
 * PUT: Actualizar permisos del rol
 * 
 * @version 2025.1.0
 * @tier TIER_FUNCTIONAL
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiRoute } from '@/lib/api/with-api-route';
import { checkPermission, type Resource, type PermissionAction } from '@/lib/security/rbac';
import { AuditLogger, AuditEventType, AuditSeverity } from '@/lib/security/audit-logger';
import { SistemaRBAC, Rol } from '@/lib/services/sistema-rbac';
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════
// SCHEMAS DE VALIDACIÓN
// ═══════════════════════════════════════════════════════════════════

const PermisoSchema = z.object({
    recurso: z.enum([
        'anunciantes', 'agencias', 'emisoras', 'cunas', 'campanas',
        'contratos', 'facturacion', 'inventario', 'pauta', 'tandas',
        'emision', 'conciliacion', 'informes', 'usuarios', 'configuracion'
    ]),
    acciones: z.array(z.enum(['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'])).min(1)
});

const UpdatePermisosSchema = z.object({
    permisos: z.array(PermisoSchema).min(1)
});

// ═══════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════

const ROLES_SISTEMA = ['super_admin', 'admin_tenant', 'gerente_ventas', 'ejecutivo_ventas',
    'operador_pauta', 'operador_trafico', 'contador', 'auditor', 'cliente_externo'];

const RECURSOS_DISPONIBLES = [
    { id: 'anunciantes', nombre: 'Anunciantes', descripcion: 'Gestión de anunciantes' },
    { id: 'agencias', nombre: 'Agencias', descripcion: 'Gestión de agencias' },
    { id: 'emisoras', nombre: 'Emisoras', descripcion: 'Gestión de emisoras' },
    { id: 'cunas', nombre: 'Cuñas', descripcion: 'Gestión de cuñas publicitarias' },
    { id: 'campanas', nombre: 'Campañas', descripcion: 'Gestión de campañas' },
    { id: 'contratos', nombre: 'Contratos', descripcion: 'Gestión de contratos' },
    { id: 'facturacion', nombre: 'Facturación', descripcion: 'Gestión de facturación' },
    { id: 'inventario', nombre: 'Inventario', descripcion: 'Gestión de inventario' },
    { id: 'pauta', nombre: 'Pauta', descripcion: 'Programación de pauta' },
    { id: 'tandas', nombre: 'Tandas', descripcion: 'Gestión de tandas' },
    { id: 'emision', nombre: 'Emisión', descripcion: 'Control de emisiones' },
    { id: 'conciliacion', nombre: 'Conciliación', descripcion: 'Conciliación de emisiones' },
    { id: 'informes', nombre: 'Informes', descripcion: 'Generación de informes' },
    { id: 'usuarios', nombre: 'Usuarios', descripcion: 'Gestión de usuarios' },
    { id: 'configuracion', nombre: 'Configuración', descripcion: 'Configuración del sistema' }
];

const ACCIONES_DISPONIBLES = [
    { id: 'ver', nombre: 'Ver', descripcion: 'Puede ver el recurso' },
    { id: 'crear', nombre: 'Crear', descripcion: 'Puede crear nuevos registros' },
    { id: 'editar', nombre: 'Editar', descripcion: 'Puede modificar registros' },
    { id: 'eliminar', nombre: 'Eliminar', descripcion: 'Puede eliminar registros' },
    { id: 'aprobar', nombre: 'Aprobar', descripcion: 'Puede aprobar operaciones' },
    { id: 'exportar', nombre: 'Exportar', descripcion: 'Puede exportar datos' }
];

const auditLogger = new AuditLogger();

// ═══════════════════════════════════════════════════════════════════
// GET /api/roles/[id]/permisos - Obtener permisos del rol
// ═══════════════════════════════════════════════════════════════════

export const GET = withApiRoute(
    { resource: 'configuracion' as Resource, action: 'read', skipCsrf: true },
    async ({ ctx, req, params }) => {
        try {
            const id = params?.id as string;

            // Verificar permisos
            if (!checkPermission(ctx, 'configuracion', 'read' as PermissionAction)) {
                return apiForbidden('No tienes permiso para ver permisos de roles');
            }

            // Verificar que el rol exista
            const roles = SistemaRBAC.getRoles();
            const rol = roles.find(r => r.id === id);

            if (!rol) {
                return apiNotFound('Rol no encontrado');
            }

            const permisosActuales = SistemaRBAC.getPermisosRol(id as Rol);
            const esSistema = ROLES_SISTEMA.includes(id);

            // Log de auditoría
            await auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.LOW,
                action: 'read',
                resource: 'roles_permisos',
                userId: ctx.userId || 'unknown',
                success: true,
                ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
                userAgent: req.headers.get('user-agent') || 'unknown',
                metadata: { rolId: id, tenantId: ctx.tenantId }
            });

            return apiSuccess({
                rol: {
                    id: rol.id,
                    nombre: rol.nombre,
                    nivel: esSistema ? 'sistema' : 'custom'
                },
                permisosActuales,
                recursosDisponibles: RECURSOS_DISPONIBLES,
                accionesDisponibles: ACCIONES_DISPONIBLES,
                esEditable: !esSistema
            });

        } catch (error) {
            await auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.MEDIUM,
                action: 'read',
                resource: 'roles_permisos',
                userId: ctx.userId || 'unknown',
                success: false,
                ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
                errorMessage: error instanceof Error ? error.message : 'Error desconocido'
            });

            return apiError('Error al obtener permisos del rol', 500);
        }
    }
);

// ═══════════════════════════════════════════════════════════════════
// PUT /api/roles/[id]/permisos - Actualizar permisos del rol
// ═══════════════════════════════════════════════════════════════════

export const PUT = withApiRoute(
    { resource: 'configuracion' as Resource, action: 'update' },
    async ({ ctx, req, params }) => {
        try {
            const id = params?.id as string;

            // Verificar permisos
            if (!checkPermission(ctx, 'configuracion', 'update' as PermissionAction)) {
                return apiForbidden('No tienes permiso para actualizar permisos de roles');
            }

            // Los roles de sistema no pueden ser modificados
            if (ROLES_SISTEMA.includes(id)) {
                return apiError('Los permisos de roles de sistema no pueden ser modificados', 403);
            }

            // Parsear y validar body
            const body = await req.json();
            const data = UpdatePermisosSchema.parse(body);

            // Validar que no haya permisos duplicados por recurso
            const recursosVistos = new Set<string>();
            for (const permiso of data.permisos) {
                if (recursosVistos.has(permiso.recurso)) {
                    return apiError(`Recurso duplicado: ${permiso.recurso}`, 400);
                }
                recursosVistos.add(permiso.recurso);
            }

            // Validar que todas las acciones sean válidas
            const accionesValidas = ACCIONES_DISPONIBLES.map(a => a.id);
            for (const permiso of data.permisos) {
                for (const accion of permiso.acciones) {
                    if (!accionesValidas.includes(accion)) {
                        return apiError(`Acción inválida: ${accion}`, 400);
                    }
                }
            }

            // En implementación completa, guardaríamos en BD
            const permisosActualizados = data.permisos.map(p => ({
                recurso: p.recurso as string,
                acciones: p.acciones as string[]
            }));

            // Log de auditoría
            await auditLogger.logEvent({
                eventType: AuditEventType.DATA_UPDATE,
                severity: AuditSeverity.MEDIUM,
                action: 'update',
                resource: 'roles_permisos',
                userId: ctx.userId || 'unknown',
                success: true,
                ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
                userAgent: req.headers.get('user-agent') || 'unknown',
                metadata: {
                    rolId: id,
                    tenantId: ctx.tenantId,
                    permisosActualizados: permisosActualizados.length
                }
            });

            return apiSuccess({
                rolId: id,
                permisos: permisosActualizados,
                actualizado: new Date().toISOString()
            });

        } catch (error) {
            await auditLogger.logEvent({
                eventType: AuditEventType.DATA_UPDATE,
                severity: AuditSeverity.HIGH,
                action: 'update',
                resource: 'roles_permisos',
                userId: ctx.userId || 'unknown',
                success: false,
                ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
                errorMessage: error instanceof Error ? error.message : 'Error desconocido'
            });

            if (error instanceof z.ZodError) {
                return apiError('Datos inválidos', 400, error.issues);
            }
            return apiError('Error al actualizar permisos del rol', 500);
        }
    }
);

// ═══════════════════════════════════════════════════════════════════
// Funciones helper locales
// ═══════════════════════════════════════════════════════════════════

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