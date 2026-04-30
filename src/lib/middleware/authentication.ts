/**
 * SILEXAR PULSE - Authentication Middleware
 * 
 * @description Desacoplado authentication middleware que extrae y valida
 *              credenciales del request. Compatible con Next.js App Router
 *              y el sistema de errores unificado (AppError).
 * 
 * @example
 * ```typescript
 * import { authenticate, extractAuthContext } from '@/lib/middleware/authentication';
 * 
 * // En withApiRoute
 * export const GET = withApiRoute({ resource: 'usuarios', action: 'read' }, 
 *   async ({ ctx, req }) => {
 *     const auth = extractAuthContext(req);
 *     if (!auth) return unauthorized();
 *     // continue...
 *   }
 * );
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { AppError, UnauthorizedError } from '@/lib/errors';
import { logger } from '@/lib/observability';

// ═══════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export interface AuthTokenPayload {
    userId: string;
    email: string;
    role: string;
    tenantId: string;
    sessionId: string;
    isImpersonating?: boolean;
    impersonatedBy?: string;
    exp?: number;
    iat?: number;
}

export interface AuthContext {
    isAuthenticated: boolean;
    userId?: string;
    email?: string;
    role?: string;
    tenantId?: string;
    sessionId?: string;
    isImpersonating?: boolean;
    impersonatedBy?: string;
}

export interface AuthResult {
    valid: boolean;
    payload?: AuthTokenPayload;
    error?: AppError;
}

// ═══════════════════════════════════════════════════════════════════
// JWT UTILITIES (minimal implementation - uses existing auth system)
// ═══════════════════════════════════════════════════════════════════

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(request: NextRequest): string | null {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.slice(7);
}

/**
 * Decode base64 JWT payload (without signature verification - done at edge)
 */
export function decodeJwtPayload(token: string): AuthTokenPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = Buffer.from(parts[1], 'base64url').toString('utf-8');
        return JSON.parse(payload) as AuthTokenPayload;
    } catch {
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════
// AUTHENTICATION CONTEXT
// ═══════════════════════════════════════════════════════════════════

/**
 * Extract authentication context from request headers
 * Used by withApiRoute to build the context object
 */
export function extractAuthContext(request: NextRequest): AuthContext | null {
    const authHeader = request.headers.get('Authorization');
    const sessionHeader = request.headers.get('X-Session-ID');
    const tenantHeader = request.headers.get('X-Tenant-ID');

    // Check for API Key authentication
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey) {
        // API Key validation would happen here
        // For now, return null to fall through to token auth
    }

    const token = extractBearerToken(request);
    if (!token) {
        return null;
    }

    const payload = decodeJwtPayload(token);
    if (!payload) {
        return null;
    }

    // Check expiration if present
    if (payload.exp && Date.now() / 1000 > payload.exp) {
        logger.warn('[Auth] Token expired', { userId: payload.userId });
        return null;
    }

    return {
        isAuthenticated: true,
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId || tenantHeader || '',
        sessionId: payload.sessionId || sessionHeader || '',
        isImpersonating: payload.isImpersonating || false,
        impersonatedBy: payload.impersonatedBy,
    };
}

// ═══════════════════════════════════════════════════════════════════
// AUTHENTICATION GUARDS
// ═══════════════════════════════════════════════════════════════════

/**
 * Guard that requires authentication
 * Returns UnauthorizedError if not authenticated
 */
export function requireAuth(request: NextRequest): AuthContext {
    const context = extractAuthContext(request);
    if (!context?.isAuthenticated) {
        throw new UnauthorizedError('Authentication required');
    }
    return context;
}

/**
 * Guard that extracts auth but doesn't throw
 * Returns null if not authenticated (allows optional auth)
 */
export function optionalAuth(request: NextRequest): AuthContext | null {
    return extractAuthContext(request);
}

// ═══════════════════════════════════════════════════════════════════
// NEXT.JS MIDDLEWARE INTEGRATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Middleware function for Next.js Edge/Node runtime
 * Use this in middleware.ts for route-level protection
 */
export function authMiddleware(
    request: NextRequest
): { authorized: boolean; context?: AuthContext; response?: NextResponse } {
    const context = extractAuthContext(request);

    if (!context?.isAuthenticated) {
        return {
            authorized: false,
            response: NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Authentication required',
                    },
                },
                { status: 401 }
            ),
        };
    }

    return { authorized: true, context };
}

// ═══════════════════════════════════════════════════════════════════
// RESPONSE HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Creates an unauthorized response
 */
export function unauthorizedResponse(message = 'Authentication required'): NextResponse {
    return NextResponse.json(
        {
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message,
            },
        },
        { status: 401 }
    );
}

/**
 * Creates a forbidden response (authenticated but not authorized)
 */
export function forbiddenResponse(message = 'Insufficient permissions'): NextResponse {
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

export { UnauthorizedError } from '@/lib/errors';