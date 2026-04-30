/**
 * 🔐 SILEXAR PULSE - API de Gestión de Roles
 * 
 * @description API REST completa para CRUD de Roles y Permisos
 * Implementación TIER FUNCTIONAL siguiendo SILEXAR MODULE BUILDER PROTOCOL
 * 
 * @version 2025.1.0
 * @tier TIER_FUNCTIONAL
 * @phase FASE 2 - Seguridad y API
 * 
 * Endpoints:
 *   GET    /api/roles          - Listar roles (con filtros y paginación)
 *   POST   /api/roles          - Crear nuevo rol custom
 *   GET    /api/roles/[id]     - Obtener rol por ID
 *   PUT    /api/roles/[id]     - Actualizar rol
 *   DELETE /api/roles/[id]     - Eliminar rol (soft delete si es protegido)
 *   GET    /api/roles/[id]/permisos - Obtener permisos del rol
 *   PUT    /api/roles/[id]/permisos - Actualizar permisos del rol
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiRoute } from '@/lib/api/with-api-route';
import { checkPermission, type Resource, type PermissionAction } from '@/lib/security/rbac';
import { AuditLogger, AuditEventType, AuditSeverity } from '@/lib/security/audit-logger';
import { SistemaRBAC, Rol } from '@/lib/services/sistema-rbac';
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════
// SCHEMAS DE VALIDACIÓN ZOD
// ═══════════════════════════════════════════════════════════════════

const PermisoSchema = z.object({
    recurso: z.enum([
        'anunciantes', 'agencias', 'emisoras', 'cunas', 'campanas',
        'contratos', 'facturacion', 'inventario', 'pauta', 'tandas',
        'emision', 'conciliacion', 'informes', 'usuarios', 'configuracion'
    ]),
    acciones: z.array(z.enum(['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'])).min(1)
});

const CreateRolSchema = z.object({
    nombre: z.string().min(2).max(50),
    descripcion: z.string().max(255).optional(),
    permisos: z.array(PermisoSchema).min(1),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    icono: z.string().max(50).optional(),
    nivel: z.enum(['sistema', 'custom']).default('custom'),
    activo: z.boolean().default(true)
});

const UpdateRolSchema = z.object({
    nombre: z.string().min(2).max(50).optional(),
    descripcion: z.string().max(255).optional(),
    permisos: z.array(PermisoSchema).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    icono: z.string().max(50).optional(),
    activo: z.boolean().optional()
});

const SearchRolesSchema = z.object({
    busqueda: z.string().max(100).optional(),
    nivel: z.enum(['sistema', 'custom', 'all']).default('all'),
    activo: z.boolean().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20)
});

// ═══════════════════════════════════════════════════════════════════
// TIPOS Y CONSTANTES
// ═══════════════════════════════════════════════════════════════════

const ROLES_SISTEMA = [
    { id: 'super_admin', nombre: 'Super Administrador', nivel: 'sistema' as const },
    { id: 'admin_tenant', nombre: 'Administrador', nivel: 'sistema' as const },
    { id: 'gerente_ventas', nombre: 'Gerente de Ventas', nivel: 'sistema' as const },
    { id: 'ejecutivo_ventas', nombre: 'Ejecutivo de Ventas', nivel: 'sistema' as const },
    { id: 'operador_pauta', nombre: 'Operador de Pauta', nivel: 'sistema' as const },
    { id: 'operador_trafico', nombre: 'Operador de Tráfico', nivel: 'sistema' as const },
    { id: 'contador', nombre: 'Contador', nivel: 'sistema' as const },
    { id: 'auditor', nombre: 'Auditor', nivel: 'sistema' as const },
    { id: 'cliente_externo', nombre: 'Cliente Externo', nivel: 'sistema' as const }
];

const auditLogger = new AuditLogger();

// ═══════════════════════════════════════════════════════════════════
// HELPERS LOCALES
// ═══════════════════════════════════════════════════════════════════

function generateRolId(): string {
    return `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function apiForbidden(message: string = 'Acceso denegado'): NextResponse {
    return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message } },
        { status: 403 }
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

// ═══════════════════════════════════════════════════════════════════
// GET /api/roles - Listar roles
// ═══════════════════════════════════════════════════════════════════

export const GET = withApiRoute(
    { resource: 'configuracion', action: 'read', skipCsrf: true },
    async ({ ctx, req }) => {
        try {
            const { searchParams } = new URL(req.url);
            const params = SearchRolesSchema.parse({
                busqueda: searchParams.get('busqueda') || undefined,
                nivel: searchParams.get('nivel') || 'all',
                activo: searchParams.get('activo') !== null ? searchParams.get('activo') === 'true' : undefined,
                page: searchParams.get('page') || '1',
                limit: searchParams.get('limit') || '20'
            });

            let rolesMostrar = SistemaRBAC.getRoles().map(r => ({
                ...r,
                nivel: ROLES_SISTEMA.find(rs => rs.id === r.id) ? 'sistema' as const : 'custom' as const,
                permisos: SistemaRBAC.getPermisosRol(r.id as Rol),
                esEditable: !ROLES_SISTEMA.find(rs => rs.id === r.id)
            }));

            if (params.busqueda) {
                const termino = params.busqueda.toLowerCase();
                rolesMostrar = rolesMostrar.filter(r =>
                    r.nombre.toLowerCase().includes(termino) ||
                    r.descripcion.toLowerCase().includes(termino)
                );
            }

            if (params.nivel !== 'all') {
                rolesMostrar = rolesMostrar.filter(r => r.nivel === params.nivel);
            }

            if (params.activo !== undefined) {
                rolesMostrar = rolesMostrar.filter(r =>
                    r.nivel === 'sistema' ? true : params.activo
                );
            }

            const total = rolesMostrar.length;
            const totalPages = Math.ceil(total / params.limit);
            const offset = (params.page - 1) * params.limit;
            const rolesPaginados = rolesMostrar.slice(offset, offset + params.limit);

            await auditLogger.logEvent({
                eventType: AuditEventType.DATA_READ,
                severity: AuditSeverity.LOW,
                success: true,
                action: 'read',
                resource: 'roles',
                userId: ctx.userId || 'unknown',
                ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
                userAgent: req.headers.get('user-agent') || 'unknown',
                metadata: {
                    filters: params,
                    resultCount: rolesPaginados.length
                }
            });

            return apiSuccess({
                roles: rolesPaginados,
                pagination: {
                    page: params.page,
                    limit: params.limit,
                    total,
                    totalPages
                },
                filtrosAplicados: params
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

            if (error instanceof z.ZodError) {
                return apiError('Datos inválidos', 400, error.issues);
            }
            return apiError('Error al obtener roles', 500);
        }
    }
);

// ═══════════════════════════════════════════════════════════════════
// POST /api/roles - Crear rol custom
// ═══════════════════════════════════════════════════════════════════

export const POST = withApiRoute(
    { resource: 'configuracion', action: 'create' },
    async ({ ctx, req }) => {
        try {
            const body = await req.json();
            const data = CreateRolSchema.parse(body);

            const rolesExistentes = SistemaRBAC.getRoles();
            const nombreExistente = rolesExistentes.find(r =>
                r.nombre.toLowerCase() === data.nombre.toLowerCase()
            );
            if (nombreExistente) {
                return apiError('Ya existe un rol con ese nombre', 400);
            }

            const nuevoRol = {
                id: generateRolId(),
                nombre: data.nombre,
                descripcion: data.descripcion || '',
                permisos: data.permisos,
                color: data.color || '#6366F1',
                icono: data.icono || 'shield',
                nivel: 'custom' as const,
                activo: data.activo !== false,
                esEditable: true,
                createdAt: new Date().toISOString(),
                createdBy: ctx.userId
            };

            await auditLogger.logEvent({
                eventType: AuditEventType.DATA_CREATE,
                severity: AuditSeverity.MEDIUM,
                success: true,
                action: 'create',
                resource: 'roles',
                userId: ctx.userId || 'unknown',
                ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
                userAgent: req.headers.get('user-agent') || 'unknown',
                metadata: {
                    rolCreado: nuevoRol.id,
                    nombre: data.nombre
                }
            });

            return apiSuccess(nuevoRol, 201);

        } catch (error) {
            await auditLogger.logEvent({
                eventType: AuditEventType.DATA_CREATE,
                severity: AuditSeverity.MEDIUM,
                success: false,
                action: 'create',
                resource: 'roles',
                userId: ctx.userId || 'unknown',
                ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
                errorMessage: error instanceof Error ? error.message : 'Error desconocido'
            });

            if (error instanceof z.ZodError) {
                return apiError('Datos inválidos', 400, error.issues);
            }
            return apiError('Error al crear rol', 500);
        }
    }
);