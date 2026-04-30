/**
 * SILEXAR PULSE - Authorization Middleware
 * 
 * @description Desacoplado authorization middleware con patron decorator
 *              para verificar permisos RBAC. Compatible con el sistema de
 *              errores unificado (AppError).
 * 
 * @example
 * ```typescript
 * import { authorize, requirePermission, requireRole } from '@/lib/middleware/authorization';
 * 
 * // Decorator pattern - apply to route handlers
 * export const POST = authorize('usuarios', 'create')(async ({ ctx, req }) => {
 *   // Only reaches here if authorized
 * });
 * 
 * // Or use guards directly
 * requirePermission(ctx, 'usuarios', 'create');
 * requireRole(ctx, ['admin', 'super_admin']);
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { AppError, ForbiddenError, UnauthorizedError } from '@/lib/errors';
import { logger } from '@/lib/observability';

// ═══════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'admin';
export type PermissionResource = string;

export interface Permission {
    resource: PermissionResource;
    actions: PermissionAction[];
}

export interface RBACCheckResult {
    allowed: boolean;
    reason?: string;
}

// ═══════════════════════════════════════════════════════════════════
// RBAC UTILITIES
// ═══════════════════════════════════════════════════════════════════

/**
 * Role hierarchy - higher roles inherit lower permissions
 */
const ROLE_HIERARCHY: Record<string, number> = {
    super_admin: 100,
    admin: 80,
    tenant_admin: 60,
    manager: 40,
    user: 20,
    guest: 10,
};

/**
 * Resource-action to role mapping
 */
const RESOURCE_PERMISSIONS: Record<string, Record<PermissionAction, string[]>> = {
    usuarios: {
        create: ['super_admin', 'admin', 'tenant_admin'],
        read: ['super_admin', 'admin', 'tenant_admin', 'manager', 'user'],
        update: ['super_admin', 'admin', 'tenant_admin', 'manager'],
        delete: ['super_admin', 'admin', 'tenant_admin'],
        admin: ['super_admin', 'admin'],
    },
    roles: {
        create: ['super_admin'],
        read: ['super_admin', 'admin', 'tenant_admin'],
        update: ['super_admin'],
        delete: ['super_admin'],
        admin: ['super_admin'],
    },
    politicas: {
        create: ['super_admin', 'admin'],
        read: ['super_admin', 'admin', 'tenant_admin', 'manager', 'user'],
        update: ['super_admin', 'admin'],
        delete: ['super_admin'],
        admin: ['super_admin', 'admin'],
    },
    campanas: {
        create: ['super_admin', 'admin', 'tenant_admin', 'manager'],
        read: ['super_admin', 'admin', 'tenant_admin', 'manager', 'user'],
        update: ['super_admin', 'admin', 'tenant_admin', 'manager'],
        delete: ['super_admin', 'admin', 'tenant_admin'],
        admin: ['super_admin', 'admin', 'tenant_admin'],
    },
    reportes: {
        create: ['super_admin', 'admin', 'tenant_admin', 'manager'],
        read: ['super_admin', 'admin', 'tenant_admin', 'manager', 'user'],
        update: ['super_admin', 'admin', 'tenant_admin'],
        delete: ['super_admin', 'admin'],
        admin: ['super_admin', 'admin'],
    },
    configuraciones: {
        create: ['super_admin', 'admin'],
        read: ['super_admin', 'admin', 'tenant_admin'],
        update: ['super_admin', 'admin'],
        delete: ['super_admin'],
        admin: ['super_admin'],
    },
};

/**
 * Check if a role has permission for a resource-action
 */
export function hasPermission(role: string, resource: string, action: PermissionAction): boolean {
    const allowedRoles = RESOURCE_PERMISSIONS[resource]?.[action];
    if (!allowedRoles) {
        // Unknown resource/action - deny by default in production
        logger.warn('[Auth] Unknown resource/action', { resource, action });
        return false;
    }

    // Check direct role match
    if (allowedRoles.includes(role)) {
        return true;
    }

    // Check hierarchy - if user has higher role, they inherit
    const userLevel = ROLE_HIERARCHY[role] || 0;
    for (const allowedRole of allowedRoles) {
        const allowedLevel = ROLE_HIERARCHY[allowedRole] || 0;
        if (userLevel >= allowedLevel && allowedLevel > 0) {
            return true;
        }
    }

    return false;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(userRole: string, allowedRoles: string[]): boolean {
    const userLevel = ROLE_HIERARCHY[userRole] || 0;

    for (const role of allowedRoles) {
        const roleLevel = ROLE_HIERARCHY[role] || 0;
        if (userLevel >= roleLevel) {
            return true;
        }
    }

    return false;
}

/**
 * Check if user has all specified roles
 */
export function hasAllRoles(userRole: string, requiredRoles: string[]): boolean {
    const userLevel = ROLE_HIERARCHY[userRole] || 0;

    for (const role of requiredRoles) {
        const roleLevel = ROLE_HIERARCHY[role] || 0;
        if (userLevel < roleLevel) {
            return false;
        }
    }

    return true;
}

// ═══════════════════════════════════════════════════════════════════
// AUTHORIZATION CONTEXT
// ═══════════════════════════════════════════════════════════════════

export interface AuthContext {
    userId: string;
    role: string;
    tenantId: string;
    tenantSlug?: string;
    sessionId?: string;
    isImpersonating?: boolean;
    impersonatedBy?: string;
}

/**
 * Context coming from withApiRoute
 */
export type RouteContext = Record<string, string>;

/**
 * Check if context has required RBAC level
 */
export function checkRBAC(ctx: AuthContext | RouteContext): RBACCheckResult {
    if (!ctx.userId || !ctx.role) {
        return { allowed: false, reason: 'Missing authentication context' };
    }

    return { allowed: true };
}

// ═══════════════════════════════════════════════════════════════════
// AUTHORIZATION GUARDS
// ═══════════════════════════════════════════════════════════════════

/**
 * Guard: Require specific permission for resource-action
 */
export function requirePermission(
    ctx: AuthContext | RouteContext,
    resource: string,
    action: PermissionAction
): void {
    const role = ctx.role;

    if (!role) {
        throw new UnauthorizedError('Role information not available');
    }

    if (!hasPermission(role, resource, action)) {
        logger.warn('[Auth] Permission denied', { role, resource, action, userId: ctx.userId });
        throw new ForbiddenError(`No tiene permisos para realizar esta acción: ${resource}:${action}`);
    }
}

/**
 * Guard: Require any of specified roles
 */
export function requireAnyRole(ctx: AuthContext | RouteContext, allowedRoles: string[]): void {
    const role = ctx.role;

    if (!role) {
        throw new UnauthorizedError('Role information not available');
    }

    if (!hasAnyRole(role, allowedRoles)) {
        logger.warn('[Auth] Role denied', { role, allowedRoles, userId: ctx.userId });
        throw new ForbiddenError(`Requires one of roles: ${allowedRoles.join(', ')}`);
    }
}

/**
 * Guard: Require all specified roles
 */
export function requireAllRoles(ctx: AuthContext | RouteContext, requiredRoles: string[]): void {
    const role = ctx.role;

    if (!role) {
        throw new UnauthorizedError('Role information not available');
    }

    if (!hasAllRoles(role, requiredRoles)) {
        logger.warn('[Auth] Missing roles', { role, requiredRoles, userId: ctx.userId });
        throw new ForbiddenError(`Requires all roles: ${requiredRoles.join(', ')}`);
    }
}

/**
 * Guard: Require minimum role level
 */
export function requireMinRole(ctx: AuthContext | RouteContext, minRole: string): void {
    const role = ctx.role;

    if (!role) {
        throw new UnauthorizedError('Role information not available');
    }

    const userLevel = ROLE_HIERARCHY[role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userLevel < requiredLevel) {
        logger.warn('[Auth] Insufficient role level', { role, minRole, userId: ctx.userId });
        throw new ForbiddenError(`Requires minimum role: ${minRole}`);
    }
}

// ═══════════════════════════════════════════════════════════════════
// DECORATOR PATTERN FOR ROUTE HANDLERS
// ═══════════════════════════════════════════════════════════════════

type RouteHandler = (req: NextRequest, context?: Record<string, string>) => Promise<NextResponse>;
type MiddlewareNext = () => Promise<NextResponse> | NextResponse;

/**
 * Creates a middleware that checks authorization before executing handler
 */
export function authorize(
    resource: string,
    action: PermissionAction
): (handler: RouteHandler) => RouteHandler {
    return (handler: RouteHandler): RouteHandler => {
        return async (req: NextRequest, ctx?: Record<string, string>): Promise<NextResponse> => {
            // Extract role from context (set by withApiRoute)
            const role = ctx?.role;

            if (!role) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: 'UNAUTHORIZED',
                            message: 'Role information not available',
                        },
                    },
                    { status: 401 }
                );
            }

            // Check permission
            if (!hasPermission(role, resource, action)) {
                logger.warn('[Auth] Authorization failed', { role, resource, action });
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: 'FORBIDDEN',
                            message: `No tiene permisos para ${action} ${resource}`,
                        },
                    },
                    { status: 403 }
                );
            }

            // Execute handler if authorized
            return handler(req, ctx);
        };
    };
}

/**
 * Creates a middleware that requires specific roles
 */
export function requireRole(...allowedRoles: string[]): (handler: RouteHandler) => RouteHandler {
    return (handler: RouteHandler): RouteHandler => {
        return async (req: NextRequest, ctx?: Record<string, string>): Promise<NextResponse> => {
            const role = ctx?.role;

            if (!role) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: 'UNAUTHORIZED',
                            message: 'Role information not available',
                        },
                    },
                    { status: 401 }
                );
            }

            if (!hasAnyRole(role, allowedRoles)) {
                logger.warn('[Auth] Role requirement not met', { role, allowedRoles });
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: 'FORBIDDEN',
                            message: `Requires one of roles: ${allowedRoles.join(', ')}`,
                        },
                    },
                    { status: 403 }
                );
            }

            return handler(req, ctx);
        };
    };
}

/**
 * Compose multiple middleware
 */
export function composeMiddleware(...middlewares: Array<(next: RouteHandler) => RouteHandler>) {
    return (handler: RouteHandler): RouteHandler => {
        return middlewares.reduceRight((acc, mw) => mw(acc), handler);
    };
}

// ═══════════════════════════════════════════════════════════════════
// RESPONSE HELPERS
// ═══════════════════════════════════════════════════════════════════

export function forbiddenResponse(message = 'No tiene permisos para realizar esta acción'): NextResponse {
    return NextResponse.json(
        {
            success: false,
            error: {
                code: 'FORBIDDEN',
                message,
            },
        },
        { status: 403 }
    );
}

// ═══════════════════════════════════════════════════════════════════
// RE-EXPORT ERROR TYPES
// ═══════════════════════════════════════════════════════════════════

export { ForbiddenError, UnauthorizedError } from '@/lib/errors';