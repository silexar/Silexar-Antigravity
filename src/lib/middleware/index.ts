/**
 * SILEXAR PULSE - Middleware Module
 * 
 * @description Barrel export for all middleware components
 */

// ═══════════════════════════════════════════════════════════════════
// AUTHENTICATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════

export {
    extractAuthContext,
    requireAuth,
    optionalAuth,
    authMiddleware,
    unauthorizedResponse,
    forbiddenResponse,
    type AuthTokenPayload,
    type AuthContext,
    type AuthResult,
} from './authentication';

// ═══════════════════════════════════════════════════════════════════
// AUTHORIZATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════

export {
    authorize,
    requireRole,
    requirePermission,
    requireAnyRole,
    requireAllRoles,
    requireMinRole,
    composeMiddleware,
    hasPermission,
    hasAnyRole,
    hasAllRoles,
    type PermissionAction,
    type PermissionResource,
    type Permission,
    type RBACCheckResult,
    type AuthContext as RouteAuthContext,
} from './authorization';

// ═══════════════════════════════════════════════════════════════════
// VALIDATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════

export {
    validateBody,
    validateQuery,
    validateParams,
    validateMiddleware,
    validateRequest,
    validateBodyMiddleware,
    validateQueryMiddleware,
    validateParamsMiddleware,
    createValidator,
    formatZodErrors,
    paginationSchema,
    idParamSchema,
    searchQuerySchema,
    dateRangeSchema,
    type ValidationResult,
    type ValidationErrorDetail,
    type ValidatedRequest,
    type FullValidationSchemas,
} from './validation';

// ═══════════════════════════════════════════════════════════════════
// REQUEST LOGGING MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════

export {
    requestLogger,
    withRequestLogging,
    logRequestStart,
    logRequestEnd,
    logRequestError,
    requestLog,
    type RequestLogData,
    type RequestLogOptions,
} from './request-logger';

// ═══════════════════════════════════════════════════════════════════
// RATE LIMITING MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════

export {
    rateLimit,
    checkRateLimit,
    isRateLimited,
    rateLimitExceededResponse,
    addRateLimitHeaders,
    strict,
    moderate,
    relaxed,
    authLimit,
    tierFromRouteConfig,
    RateLimitTier,
    type RateLimitConfig,
    type RateLimitResult,
} from './rate-limit';

// ═══════════════════════════════════════════════════════════════════
// COMPOSED MIDDLEWARE COMBINE FUNCTION
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { authorize } from './authorization';
import { validateBodyMiddleware } from './validation';
import { rateLimit } from './rate-limit';
import { requestLogger } from './request-logger';
import { PermissionAction } from './authorization';

/**
 * Compose multiple middleware into a single handler wrapper
 * Middleware are applied in reverse order (last applied runs first)
 */
export function compose(
    ...middlewares: Array<(handler: RouteHandler) => RouteHandler>
): (handler: RouteHandler) => RouteHandler {
    return (handler: RouteHandler): RouteHandler => {
        return middlewares.reduceRight((acc, mw) => mw(acc), handler);
    };
}

type RouteHandler = (req: NextRequest, context?: Record<string, string>) => Promise<NextResponse>;

/**
 * Common middleware composition for CRUD operations
 */
export function crudMiddleware(
    resource: string,
    action: PermissionAction,
    options?: {
        rateLimitTier?: import('./rate-limit').RateLimitTier;
        validationSchema?: import('zod').ZodSchema;
    }
) {
    const middlewares: Array<(handler: RouteHandler) => RouteHandler> = [
        requestLogger(),
    ];

    if (options?.rateLimitTier) {
        middlewares.push(rateLimit({ tier: options.rateLimitTier }));
    }

    middlewares.push(authorize(resource, action));

    if (options?.validationSchema) {
        middlewares.push(validateBodyMiddleware(options.validationSchema));
    }

    return compose(...middlewares);
}

// ═══════════════════════════════════════════════════════════════════
// DEFAULT EXPORTS
// ═══════════════════════════════════════════════════════════════════

export { handleError as errorHandler } from './error-handler';