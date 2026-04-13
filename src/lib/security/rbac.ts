/**
 * 🛡️ SILEXAR PULSE — RBAC (Role-Based Access Control)
 * 
 * Sistema real de control de acceso por roles.
 * Valida permisos de usuario contra políticas definidas.
 * 
 * @version 2026.3.0
 * @security OWASP A01 — Broken Access Control
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS Y CONSTANTES
// ═══════════════════════════════════════════════════════════════

export type UserRole =
  | 'SUPER_CEO'
  | 'ADMIN'
  | 'CLIENT_ADMIN'
  | 'GERENTE_VENTAS'
  | 'EJECUTIVO_VENTAS'
  | 'EJECUTIVO'          // Ejecutivo general (contratos y campanas)
  | 'TM_SENIOR'          // Traffic Manager Senior (gestión de pauta y emisión)
  | 'FINANCIERO'         // Analista financiero (facturación y contratos)
  | 'PROGRAMADOR'        // Programador de emisora (scheduling de cuñas)
  | 'OPERADOR_EMISION'
  | 'AGENCIA'
  | 'ANUNCIANTE'
  | 'VIEWER'
  | 'USER';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'admin' | 'export' | 'approve';

export type Resource = 
  | 'contratos'
  | 'campanas'
  | 'cunas'
  | 'emisiones'
  | 'anunciantes'
  | 'equipos-ventas'
  | 'facturacion'
  | 'inventario'
  | 'emisoras'
  | 'usuarios'
  | 'reportes'
  | 'configuracion'
  | 'dashboard'
  | 'analytics';

export interface RBACPolicy {
  resource: Resource;
  actions: PermissionAction[];
  roles: UserRole[];
}

export interface AuthContext {
  userId: string;
  role: UserRole | string;
  tenantId: string;
  permissions?: string[];
}

// ═══════════════════════════════════════════════════════════════
// MATRIZ DE PERMISOS POR ROL
// ═══════════════════════════════════════════════════════════════

const ROLE_PERMISSIONS: Record<UserRole, Record<Resource, PermissionAction[]>> = {
  SUPER_CEO: {
    contratos: ['create', 'read', 'update', 'delete', 'admin', 'export', 'approve'],
    campanas: ['create', 'read', 'update', 'delete', 'admin', 'export', 'approve'],
    cunas: ['create', 'read', 'update', 'delete', 'admin', 'export', 'approve'],
    emisiones: ['create', 'read', 'update', 'delete', 'admin', 'export', 'approve'],
    anunciantes: ['create', 'read', 'update', 'delete', 'admin', 'export'],
    'equipos-ventas': ['create', 'read', 'update', 'delete', 'admin'],
    facturacion: ['create', 'read', 'update', 'delete', 'admin', 'export', 'approve'],
    inventario: ['create', 'read', 'update', 'delete', 'admin'],
    emisoras: ['create', 'read', 'update', 'delete', 'admin'],
    usuarios: ['create', 'read', 'update', 'delete', 'admin'],
    reportes: ['read', 'export', 'admin'],
    configuracion: ['read', 'update', 'admin'],
    dashboard: ['read', 'admin'],
    analytics: ['read', 'export', 'admin'],
  },
  ADMIN: {
    contratos: ['create', 'read', 'update', 'delete', 'export', 'approve'],
    campanas: ['create', 'read', 'update', 'delete', 'export', 'approve'],
    cunas: ['create', 'read', 'update', 'delete', 'export'],
    emisiones: ['create', 'read', 'update', 'delete', 'export'],
    anunciantes: ['create', 'read', 'update', 'delete', 'export'],
    'equipos-ventas': ['create', 'read', 'update', 'delete'],
    facturacion: ['create', 'read', 'update', 'delete', 'export', 'approve'],
    inventario: ['create', 'read', 'update', 'delete'],
    emisoras: ['create', 'read', 'update', 'delete'],
    usuarios: ['create', 'read', 'update', 'delete'],
    reportes: ['read', 'export'],
    configuracion: ['read', 'update'],
    dashboard: ['read'],
    analytics: ['read', 'export'],
  },
  CLIENT_ADMIN: {
    contratos: ['create', 'read', 'update', 'export', 'approve'],
    campanas: ['create', 'read', 'update', 'export'],
    cunas: ['create', 'read', 'update'],
    emisiones: ['read'],
    anunciantes: ['read', 'update'],
    'equipos-ventas': ['read', 'update'],
    facturacion: ['read', 'export'],
    inventario: ['read'],
    emisoras: ['read'],
    usuarios: ['create', 'read', 'update'],
    reportes: ['read', 'export'],
    configuracion: ['read'],
    dashboard: ['read'],
    analytics: ['read'],
  },
  GERENTE_VENTAS: {
    contratos: ['create', 'read', 'update', 'export', 'approve'],
    campanas: ['create', 'read', 'update'],
    cunas: ['read'],
    emisiones: ['read'],
    anunciantes: ['create', 'read', 'update'],
    'equipos-ventas': ['read', 'update'],
    facturacion: ['read'],
    inventario: ['read'],
    emisoras: ['read'],
    usuarios: ['read'],
    reportes: ['read', 'export'],
    configuracion: [],
    dashboard: ['read'],
    analytics: ['read', 'export'],
  },
  EJECUTIVO_VENTAS: {
    contratos: ['create', 'read', 'update'],
    campanas: ['create', 'read'],
    cunas: ['read'],
    emisiones: ['read'],
    anunciantes: ['create', 'read', 'update'],
    'equipos-ventas': ['read'],
    facturacion: ['read'],
    inventario: ['read'],
    emisoras: ['read'],
    usuarios: [],
    reportes: ['read'],
    configuracion: [],
    dashboard: ['read'],
    analytics: ['read'],
  },
  EJECUTIVO: {
    contratos: ['create', 'read', 'update', 'export'],
    campanas: ['create', 'read', 'update', 'approve'],
    cunas: ['read'],
    emisiones: ['read'],
    anunciantes: ['create', 'read', 'update'],
    'equipos-ventas': ['read'],
    facturacion: ['read'],
    inventario: ['read'],
    emisoras: ['read'],
    usuarios: [],
    reportes: ['read', 'export'],
    configuracion: [],
    dashboard: ['read'],
    analytics: ['read'],
  },
  TM_SENIOR: {
    contratos: ['read'],
    campanas: ['create', 'read', 'update', 'delete', 'export', 'approve'],
    cunas: ['create', 'read', 'update', 'delete', 'export'],
    emisiones: ['create', 'read', 'update', 'delete', 'export'],
    anunciantes: ['read'],
    'equipos-ventas': ['read'],
    facturacion: ['read'],
    inventario: ['create', 'read', 'update', 'delete'],
    emisoras: ['read', 'update'],
    usuarios: [],
    reportes: ['read', 'export'],
    configuracion: [],
    dashboard: ['read'],
    analytics: ['read', 'export'],
  },
  FINANCIERO: {
    contratos: ['read', 'export', 'approve'],
    campanas: ['read'],
    cunas: [],
    emisiones: [],
    anunciantes: ['read'],
    'equipos-ventas': [],
    facturacion: ['create', 'read', 'update', 'delete', 'export', 'approve'],
    inventario: ['read'],
    emisoras: [],
    usuarios: [],
    reportes: ['read', 'export'],
    configuracion: [],
    dashboard: ['read'],
    analytics: ['read', 'export'],
  },
  PROGRAMADOR: {
    contratos: ['read'],
    campanas: ['read', 'update'],
    cunas: ['create', 'read', 'update', 'delete'],
    emisiones: ['create', 'read', 'update', 'delete'],
    anunciantes: ['read'],
    'equipos-ventas': [],
    facturacion: [],
    inventario: ['read', 'update'],
    emisoras: ['read', 'update'],
    usuarios: [],
    reportes: ['read'],
    configuracion: [],
    dashboard: ['read'],
    analytics: ['read'],
  },
  OPERADOR_EMISION: {
    contratos: ['read'],
    campanas: ['read', 'update'],
    cunas: ['create', 'read', 'update'],
    emisiones: ['create', 'read', 'update'],
    anunciantes: ['read'],
    'equipos-ventas': [],
    facturacion: [],
    inventario: ['read', 'update'],
    emisoras: ['read', 'update'],
    usuarios: [],
    reportes: ['read'],
    configuracion: [],
    dashboard: ['read'],
    analytics: ['read'],
  },
  AGENCIA: {
    contratos: ['read'],
    campanas: ['read'],
    cunas: ['create', 'read', 'update'],
    emisiones: ['read'],
    anunciantes: [],
    'equipos-ventas': [],
    facturacion: [],
    inventario: [],
    emisoras: [],
    usuarios: [],
    reportes: ['read'],
    configuracion: [],
    dashboard: ['read'],
    analytics: ['read'],
  },
  ANUNCIANTE: {
    contratos: ['read'],
    campanas: ['read'],
    cunas: ['read'],
    emisiones: ['read'],
    anunciantes: ['read'],
    'equipos-ventas': [],
    facturacion: ['read'],
    inventario: [],
    emisoras: [],
    usuarios: [],
    reportes: ['read'],
    configuracion: [],
    dashboard: ['read'],
    analytics: ['read'],
  },
  VIEWER: {
    contratos: ['read'],
    campanas: ['read'],
    cunas: ['read'],
    emisiones: ['read'],
    anunciantes: ['read'],
    'equipos-ventas': ['read'],
    facturacion: ['read'],
    inventario: ['read'],
    emisoras: ['read'],
    usuarios: [],
    reportes: ['read'],
    configuracion: [],
    dashboard: ['read'],
    analytics: ['read'],
  },
  USER: {
    contratos: ['read'],
    campanas: ['read'],
    cunas: ['read'],
    emisiones: ['read'],
    anunciantes: [],
    'equipos-ventas': [],
    facturacion: [],
    inventario: [],
    emisoras: [],
    usuarios: [],
    reportes: [],
    configuracion: [],
    dashboard: ['read'],
    analytics: [],
  },
};

// ═══════════════════════════════════════════════════════════════
// JERARQUÍA DE ROLES
// ═══════════════════════════════════════════════════════════════

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_CEO: 100,
  ADMIN: 90,
  CLIENT_ADMIN: 80,
  GERENTE_VENTAS: 70,
  TM_SENIOR: 65,
  EJECUTIVO_VENTAS: 60,
  EJECUTIVO: 58,
  FINANCIERO: 55,
  PROGRAMADOR: 52,
  OPERADOR_EMISION: 50,
  AGENCIA: 40,
  ANUNCIANTE: 30,
  VIEWER: 20,
  USER: 10,
};

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DE VALIDACIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * Obtener contexto de autenticación desde la request
 * En producción, esto decodifica el JWT verificado
 */
export function getAuthContext(request?: Request): AuthContext | null {
  if (!request) return null;
  
  // Extraer token del header o cookie
  const authHeader = request.headers?.get?.('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) return null;

  // En producción, el middleware ya verificó el JWT
  // Aquí extraemos los datos del header que el middleware inyectó
  const userId = request.headers?.get?.('x-silexar-user-id');
  const role = request.headers?.get?.('x-silexar-user-role') as UserRole;
  const tenantId = request.headers?.get?.('x-silexar-tenant-id');
  
  if (!userId || !role || !tenantId) return null;

  return { userId, role, tenantId };
}

/**
 * Verificar si un usuario tiene permiso para una acción sobre un recurso
 */
export function checkPermission(
  ctx: AuthContext,
  resource: Resource,
  action: PermissionAction
): boolean {
  if (!ctx || !ctx.role) return false;

  // SUPER_CEO tiene acceso total a todos los recursos y acciones
  if (ctx.role === 'SUPER_CEO') return true;

  const rolePermissions = ROLE_PERMISSIONS[ctx.role as UserRole];
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action);
}

/**
 * Verificar si un usuario tiene al menos uno de los roles requeridos
 */
export function requireRole(
  ctx: AuthContext | null,
  roles: UserRole[]
): boolean {
  if (!ctx || !ctx.role) return false;
  if (!roles || roles.length === 0) return false;

  // Verificar pertenencia directa al rol
  if (roles.includes(ctx.role as UserRole)) return true;

  // Verificar jerarquía: un rol superior incluye permisos de roles inferiores
  const userLevel = ROLE_HIERARCHY[ctx.role as UserRole] ?? 0;
  const requiredMinLevel = Math.min(...roles.map(r => ROLE_HIERARCHY[r] ?? Infinity));

  return userLevel >= requiredMinLevel;
}

/**
 * Verificar si el contexto puede validar una política RBAC
 */
export function validatePolicy(ctx: AuthContext, policy: RBACPolicy): boolean {
  if (!ctx || !policy) return false;

  // Verificar que el rol está en la lista de roles permitidos
  if (!policy.roles.includes(ctx.role as UserRole)) {
    // Verificar jerarquía
    const userLevel = ROLE_HIERARCHY[ctx.role as UserRole] ?? 0;
    const requiredMinLevel = Math.min(...policy.roles.map(r => ROLE_HIERARCHY[r] ?? Infinity));
    if (userLevel < requiredMinLevel) return false;
  }

  // Verificar que tiene al menos una de las acciones requeridas
  return policy.actions.some(action => checkPermission(ctx, policy.resource, action));
}

/**
 * Retornar respuesta 403 Forbidden estándar
 */
export function forbid(message = 'No tiene permisos para realizar esta acción'): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message,
      },
      timestamp: new Date().toISOString(),
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  );
}

/**
 * Retornar respuesta 401 Unauthorized estándar
 */
export function unauthorized(message = 'Autenticación requerida'): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message,
      },
      timestamp: new Date().toISOString(),
    }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'WWW-Authenticate': 'Bearer realm="Silexar Pulse"',
      },
    }
  );
}

/**
 * Helper: verificar permisos o retornar error
 */
export function requirePermission(
  ctx: AuthContext | null,
  resource: Resource,
  action: PermissionAction
): Response | null {
  if (!ctx) return unauthorized();
  if (!checkPermission(ctx, resource, action)) {
    return forbid(`No tiene permisos para ${action} en ${resource}`);
  }
  return null; // null = autorizado
}

export default {
  getAuthContext,
  checkPermission,
  requireRole,
  validatePolicy,
  forbid,
  unauthorized,
  requirePermission,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
};
