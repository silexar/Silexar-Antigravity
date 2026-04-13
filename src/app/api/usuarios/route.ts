/**
 * SILEXAR PULSE - API Routes Usuarios RBAC
 *
 * @description API REST endpoints para gestión de usuarios y roles
 *
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { SistemaRBAC, type Rol, type Usuario, type Recurso, type Accion } from '@/lib/services/sistema-rbac';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, apiNotFound, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { AuditEventType, AuditSeverity } from '@/lib/security/audit-types';
import { withTenantContext } from '@/lib/db/tenant-context';
import { withApiRoute } from '@/lib/api/with-api-route';

// Mock de usuarios
const mockUsuarios: Usuario[] = [
  { id: 'usr-001', email: 'admin@silexarpulse.com', nombre: 'Administrador General', rol: 'super_admin', tenantId: 'tenant-001', activo: true },
  { id: 'usr-002', email: 'gerente@example.com', nombre: 'Carlos Mendoza', rol: 'gerente_ventas', tenantId: 'tenant-001', activo: true },
  { id: 'usr-003', email: 'ejecutivo1@example.com', nombre: 'María López', rol: 'ejecutivo_ventas', tenantId: 'tenant-001', activo: true, anunciantesAsignados: ['anc-001', 'anc-002'] },
  { id: 'usr-004', email: 'operador@example.com', nombre: 'Juan Pérez', rol: 'operador_pauta', tenantId: 'tenant-001', activo: true, emisorasAsignadas: ['emi-001'] },
  { id: 'usr-005', email: 'trafico@example.com', nombre: 'Ana Silva', rol: 'operador_trafico', tenantId: 'tenant-001', activo: true },
  { id: 'usr-006', email: 'contador@example.com', nombre: 'Pedro García', rol: 'contador', tenantId: 'tenant-001', activo: true },
  { id: 'usr-007', email: 'auditor@example.com', nombre: 'Laura Torres', rol: 'auditor', tenantId: 'tenant-001', activo: false }
];

// Zod schemas
const RolSchema = z.enum([
  'super_admin', 'gerente_ventas', 'ejecutivo_ventas', 'operador_pauta',
  'operador_trafico', 'contador', 'auditor'
] as [string, ...string[]]);

const CreateUsuarioSchema = z.object({
  email: z.string().email('Email inválido'),
  nombre: z.string().min(2, 'Nombre demasiado corto').max(100),
  rol: RolSchema,
  tenantId: z.string().optional(),
  emisorasAsignadas: z.array(z.string()).optional(),
  anunciantesAsignados: z.array(z.string()).optional(),
});

const UpdateUsuarioSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
  nombre: z.string().min(2).max(100).optional(),
  rol: RolSchema.optional(),
  activo: z.boolean().optional(),
  emisorasAsignadas: z.array(z.string()).optional(),
  anunciantesAsignados: z.array(z.string()).optional(),
});

const CheckPermissionSchema = z.object({
  userId: z.string().min(1, 'userId requerido'),
  recurso: z.string().min(1, 'recurso requerido'),
  accion: z.string().min(1, 'accion requerida'),
});

export const GET = withApiRoute(
  { resource: 'usuarios', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const result = await withTenantContext(ctx.tenantId, async () => {
        const { searchParams } = new URL(req.url);
        const rol = searchParams.get('rol') || '';
        const estado = searchParams.get('estado') || '';

        let filtered = [...mockUsuarios];

        if (rol) {
          filtered = filtered.filter(u => u.rol === rol);
        }

        if (estado === 'activo') {
          filtered = filtered.filter(u => u.activo);
        } else if (estado === 'inactivo') {
          filtered = filtered.filter(u => !u.activo);
        }

        const usuariosConPermisos = filtered.map(u => ({
          ...u,
          rolDescripcion: SistemaRBAC.getDescripcionRol(u.rol),
          permisos: SistemaRBAC.getPermisosRol(u.rol),
          modulosAccesibles: SistemaRBAC.getRecursosAccesibles(u)
        }));

        const stats = {
          total: mockUsuarios.length,
          activos: mockUsuarios.filter(u => u.activo).length,
          inactivos: mockUsuarios.filter(u => !u.activo).length,
          porRol: SistemaRBAC.getRoles().map(r => ({
            rol: r.nombre,
            cantidad: mockUsuarios.filter(u => u.rol === r.id).length
          }))
        };

        return { usuarios: usuariosConPermisos, roles: SistemaRBAC.getRoles(), stats };
      });

      return apiSuccess(result);
    } catch (error) {
      logger.error('[API/Usuarios] Error GET:', error instanceof Error ? error : undefined, { module: 'usuarios' });
      return apiServerError();
    }
  }
);

export const POST = withApiRoute(
  { resource: 'usuarios', action: 'admin' },
  async ({ ctx, req }) => {
    // Validate input with Zod
    let body: unknown;
    try { body = await req.json(); } catch { return apiError('INVALID_JSON', 'Invalid JSON', 400); }
    const parsed = CreateUsuarioSchema.safeParse(body);
    if (!parsed.success) return apiError('VALIDATION_ERROR', 'Invalid input', 422, parsed.error.flatten());

    try {
      const result = await withTenantContext(ctx.tenantId, async () => {
        const { email, nombre, rol, tenantId, emisorasAsignadas, anunciantesAsignados } = parsed.data;

        // Verificar email único
        if (mockUsuarios.some(u => u.email === email)) {
          return null; // Signal duplicate
        }

        const newUsuario: Usuario = {
          id: `usr-${Date.now()}`,
          email,
          nombre,
          rol: rol as Rol,
          tenantId: tenantId || ctx.tenantId,
          activo: true,
          ...(emisorasAsignadas && { emisorasAsignadas }),
          ...(anunciantesAsignados && { anunciantesAsignados }),
        };

        mockUsuarios.push(newUsuario);
        return newUsuario;
      });

      if (result === null) {
        return apiError('DUPLICATE_EMAIL', 'Email ya registrado', 400);
      }

      // Audit log
      auditLogger.logEvent({
        eventType: AuditEventType.USER_CREATED,
        severity: AuditSeverity.MEDIUM,
        userId: ctx.userId,
        userRole: ctx.role,
        resource: 'usuarios',
        action: 'create',
        details: { createdUserId: result.id, email: result.email, rol: result.rol, tenantId: ctx.tenantId },
        success: true,
      });

      return apiSuccess({
        ...result,
        rolDescripcion: SistemaRBAC.getDescripcionRol(result.rol),
        permisos: SistemaRBAC.getPermisosRol(result.rol)
      }, 201);
    } catch (error) {
      logger.error('[API/Usuarios] Error POST:', error instanceof Error ? error : undefined, { module: 'usuarios' });
      return apiServerError();
    }
  }
);

export const PUT = withApiRoute(
  { resource: 'usuarios', action: 'admin' },
  async ({ ctx, req }) => {
    // Validate input with Zod
    let body: unknown;
    try { body = await req.json(); } catch { return apiError('INVALID_JSON', 'Invalid JSON', 400); }
    const parsed = UpdateUsuarioSchema.safeParse(body);
    if (!parsed.success) return apiError('VALIDATION_ERROR', 'Invalid input', 422, parsed.error.flatten());

    try {
      const result = await withTenantContext(ctx.tenantId, async () => {
        const usuario = mockUsuarios.find(u => u.id === parsed.data.id);
        if (!usuario) return null;

        if (parsed.data.nombre) usuario.nombre = parsed.data.nombre;
        if (parsed.data.rol) usuario.rol = parsed.data.rol as Rol;
        if (typeof parsed.data.activo === 'boolean') usuario.activo = parsed.data.activo;
        if (parsed.data.emisorasAsignadas) usuario.emisorasAsignadas = parsed.data.emisorasAsignadas;
        if (parsed.data.anunciantesAsignados) usuario.anunciantesAsignados = parsed.data.anunciantesAsignados;

        return usuario;
      });

      if (!result) return apiNotFound('usuario');

      // Audit log
      auditLogger.logEvent({
        eventType: AuditEventType.USER_UPDATED,
        severity: AuditSeverity.MEDIUM,
        userId: ctx.userId,
        userRole: ctx.role,
        resource: 'usuarios',
        action: 'update',
        details: { updatedUserId: parsed.data.id, changes: parsed.data, tenantId: ctx.tenantId },
        success: true,
      });

      return apiSuccess(result);
    } catch (error) {
      logger.error('[API/Usuarios] Error PUT:', error instanceof Error ? error : undefined, { module: 'usuarios' });
      return apiServerError();
    }
  }
);

// Endpoint para verificar permisos
export const PATCH = withApiRoute(
  { resource: 'usuarios', action: 'read' },
  async ({ ctx, req }) => {
    // Validate input with Zod
    let body: unknown;
    try { body = await req.json(); } catch { return apiError('INVALID_JSON', 'Invalid JSON', 400); }
    const parsed = CheckPermissionSchema.safeParse(body);
    if (!parsed.success) return apiError('VALIDATION_ERROR', 'Invalid input', 422, parsed.error.flatten());

    try {
      const result = await withTenantContext(ctx.tenantId, async () => {
        const usuario = mockUsuarios.find(u => u.id === parsed.data.userId);
        if (!usuario) return null;

        const tienePermiso = SistemaRBAC.tienePermiso(
          usuario,
          parsed.data.recurso as Recurso,
          parsed.data.accion as Accion
        );

        return {
          tienePermiso,
          usuario: usuario.nombre,
          rol: usuario.rol,
          recurso: parsed.data.recurso,
          accion: parsed.data.accion
        };
      });

      if (!result) return apiNotFound('usuario');

      return apiSuccess(result);
    } catch (error) {
      logger.error('[API/Usuarios] Error PATCH:', error instanceof Error ? error : undefined, { module: 'usuarios' });
      return apiServerError();
    }
  }
);
