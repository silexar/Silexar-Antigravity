/**
 * SILEXAR PULSE - Controller Integration with withApiRoute
 * 
 * @description Bridge between withApiRoute middleware and BaseController pattern
 *              This allows controllers to use the existing RBAC, tenant context, and audit logging
 * 
 * @example
 * ```typescript
 * import { createControllerRoute } from '@/lib/controllers/adapters/withApiRouteAdapter';
 * import { UsuarioController } from './examples/UsuarioController';
 * 
 * const controller = new UsuarioController();
 * 
 * export const GET = createControllerRoute(controller, 'list', {
 *   resource: 'usuarios',
 *   action: 'read',
 * });
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiRoute, RouteConfig, RouteContext } from '@/lib/api/with-api-route';
import { BaseController, ControllerContext } from '@/lib/controllers/BaseController';
import { AppError } from '@/lib/errors';

/**
 * Extract tenant context from withApiRoute's ctx parameter
 */
function extractContext(ctx: RouteContext['ctx']): ControllerContext {
    return {
        userId: ctx.userId || '',
        role: ctx.role || '',
        tenantId: ctx.tenantId || '',
        tenantSlug: ctx.tenantSlug || '',
        sessionId: ctx.sessionId || '',
        requestId: ctx.requestId || '',
        isImpersonating: ctx.isImpersonating,
    };
}

/**
 * Options for creating a controller route
 */
interface ControllerRouteOptions {
    resource: string;
    action: 'create' | 'read' | 'update' | 'delete';
    skipCsrf?: boolean;
    rateLimit?: 'strict' | 'moderate' | 'relaxed';
}

/**
 * Creates a route handler from a controller method with withApiRoute integration
 * 
 * @param controller - The controller instance
 * @param methodName - Name of the method to call on the controller
 * @param config - Route configuration (resource, action, etc.)
 * @param contextExtractor - Optional function to extract ControllerContext from route ctx
 */
export function createControllerRoute<T extends BaseController>(
    controller: T,
    methodName: string,
    config: RouteConfig,
    contextExtractor?: (ctx: RouteContext['ctx']) => ControllerContext
): (req: NextRequest) => Promise<NextResponse> {
    return withApiRoute(config, async ({ ctx, req }) => {
        // Extract context (for future use or validation)
        contextExtractor?.(ctx);

        // Use reflection to call the controller method
        const method = (controller as Record<string, unknown>)[methodName] as (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>;

        if (typeof method !== 'function') {
            throw new AppError(`Controller method "${methodName}" not found`, 'METHOD_NOT_FOUND', 500);
        }

        // Call the controller method with the request
        const response = await method.call(controller, req);

        return response;
    });
}

/**
 * Creates a route handler with ID parameter (for /api/resource/[id])
 */
export function createIdRoute<T extends BaseController>(
    controller: T,
    methodName: string,
    config: RouteConfig
): (req: NextRequest) => Promise<NextResponse> {
    return withApiRoute(config, async ({ req }) => {
        // Get ID from searchParams
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id') || '';

        const method = (controller as Record<string, unknown>)[methodName] as (req: NextRequest, id: string) => Promise<NextResponse>;

        if (typeof method !== 'function') {
            throw new AppError(`Controller method "${methodName}" not found`, 'METHOD_NOT_FOUND', 500);
        }

        const response = await method.call(controller, req, id);

        return response;
    });
}

/**
 * Hook to wrap controller methods with tenant context
 */
export function withControllerContext<T extends BaseController>(
    controller: T,
    ctx: RouteContext['ctx']
): T {
    const extractedCtx = extractContext(ctx);
    if ('setContext' in controller && typeof controller.setContext === 'function') {
        controller.setContext(extractedCtx);
    }
    return controller;
}

/**
 * Type-safe route registration helper
 */
export class ControllerRouteBuilder<T extends BaseController> {
    constructor(
        private controller: T,
        private defaultContextExtractor: (ctx: RouteContext['ctx']) => ControllerContext = extractContext
    ) { }

    /**
     * Register a GET list route
     */
    getList(config: RouteConfig, methodName: 'list' | 'getAll' = 'list'): (req: NextRequest) => Promise<NextResponse> {
        return createControllerRoute(this.controller, methodName, config, this.defaultContextExtractor);
    }

    /**
     * Register a GET by ID route
     */
    getById(config: RouteConfig, methodName: 'getById' | 'get' = 'getById'): (req: NextRequest) => Promise<NextResponse> {
        return createIdRoute(this.controller, methodName, config);
    }

    /**
     * Register a POST create route
     */
    post(config: RouteConfig, methodName: 'create' | 'createOne' = 'create'): (req: NextRequest) => Promise<NextResponse> {
        return createControllerRoute(this.controller, methodName, config, this.defaultContextExtractor);
    }

    /**
     * Register a PATCH update route
     */
    patch(config: RouteConfig, methodName: 'update' | 'updateOne' = 'update'): (req: NextRequest) => Promise<NextResponse> {
        return createIdRoute(this.controller, methodName, config);
    }

    /**
     * Register a DELETE route
     */
    delete(config: RouteConfig, methodName: 'delete' | 'remove' = 'delete'): (req: NextRequest) => Promise<NextResponse> {
        return createIdRoute(this.controller, methodName, config);
    }
}

/**
 * Create a new ControllerRouteBuilder for a controller
 */
export function buildControllerRoutes<T extends BaseController>(controller: T): ControllerRouteBuilder<T> {
    return new ControllerRouteBuilder(controller);
}