/**
 * SILEXAR PULSE - Validation Middleware
 * 
 * @description Desacoplado validation middleware usando Zod schemas.
 *              Compatible con Next.js App Router y el sistema de errores unificado.
 * 
 * @example
 * ```typescript
 * import { validateBody, validateQuery, createValidator } from '@/lib/middleware/validation';
 * import { z } from 'zod';
 * 
 * const CreateUserSchema = z.object({
 *   email: z.string().email(),
 *   nombre: z.string().min(2),
 * });
 * 
 * export const POST = validateBody(CreateUserSchema)(async ({ ctx, req }) => {
 *   // Body is already validated and parsed
 * });
 * 
 * // Or use the factory
 * const validate = createValidator();
 * export const GET = validate.query(SearchSchema)(async ({ ctx, req }) => {
 *   // Query is validated
 * });
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError, ZodObject, z } from 'zod';
import { ValidationError } from '@/lib/errors';
import { logger } from '@/lib/observability';

// ═══════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export interface ValidationResult<T = unknown> {
    valid: boolean;
    data?: T;
    errors?: ValidationErrorDetail[];
}

export interface ValidationErrorDetail {
    field: string;
    message: string;
    code?: string;
}

export interface ValidatedRequest<T = unknown> {
    data: T;
    errors?: ValidationErrorDetail[];
}

type RouteHandler = (req: NextRequest, context?: Record<string, unknown>) => Promise<NextResponse>;

// ═══════════════════════════════════════════════════════════════════
// ZOD SCHEMA UTILITIES
// ═══════════════════════════════════════════════════════════════════

/**
 * Extract field path as string from Zod issue
 */
function formatFieldPath(path: (string | number)[]): string {
    return path.join('.');
}

/**
 * Convert ZodError to our ValidationErrorDetail format
 */
export function formatZodErrors(error: ZodError): ValidationErrorDetail[] {
    return error.issues.map((issue) => ({
        field: formatFieldPath(issue.path as (string | number)[]),
        message: issue.message,
        code: issue.code,
    }));
}

/**
 * Check if value is a ZodError
 */
function isZodError(error: unknown): error is ZodError {
    return error instanceof ZodError;
}

// ═══════════════════════════════════════════════════════════════════
// VALIDATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Validate request body against a Zod schema
 */
export async function validateBody<T>(
    request: NextRequest,
    schema: ZodSchema<T>
): Promise<ValidationResult<T>> {
    try {
        const body = await request.clone().json();
        const parsed = await schema.parseAsync(body);
        return { valid: true, data: parsed };
    } catch (error) {
        if (isZodError(error)) {
            return { valid: false, errors: formatZodErrors(error) };
        }
        return {
            valid: false,
            errors: [{ field: 'body', message: 'Invalid request body' }]
        };
    }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T>(
    request: NextRequest,
    schema: ZodSchema<T>
): ValidationResult<T> {
    try {
        const { searchParams } = new URL(request.url);
        const query: Record<string, string> = {};

        searchParams.forEach((value, key) => {
            query[key] = value;
        });

        const parsed = schema.parse(query);
        return { valid: true, data: parsed };
    } catch (error) {
        if (isZodError(error)) {
            return { valid: false, errors: formatZodErrors(error) };
        }
        return {
            valid: false,
            errors: [{ field: 'query', message: 'Invalid query parameters' }]
        };
    }
}

/**
 * Validate URL params against a Zod schema
 */
export function validateParams<T>(
    params: Record<string, string>,
    schema: ZodSchema<T>
): ValidationResult<T> {
    try {
        const parsed = schema.parse(params);
        return { valid: true, data: parsed };
    } catch (error) {
        if (isZodError(error)) {
            return { valid: false, errors: formatZodErrors(error) };
        }
        return {
            valid: false,
            errors: [{ field: 'params', message: 'Invalid URL parameters' }]
        };
    }
}

/**
 * Validate all parts of a request (body, query, params)
 */
export interface FullValidationSchemas {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}

export async function validateRequest<T = unknown>(
    request: NextRequest,
    schemas: FullValidationSchemas
): Promise<{
    valid: boolean;
    body?: T;
    query?: Record<string, unknown>;
    params?: Record<string, string>;
    errors?: ValidationErrorDetail[];
}> {
    const errors: ValidationErrorDetail[] = [];

    // Validate body
    if (schemas.body) {
        const bodyResult = await validateBody(request, schemas.body);
        if (!bodyResult.valid && bodyResult.errors) {
            errors.push(...bodyResult.errors);
        }
    }

    // Validate query
    if (schemas.query) {
        const queryResult = validateQuery(request, schemas.query);
        if (!queryResult.valid && queryResult.errors) {
            errors.push(...queryResult.errors);
        }
    }

    // Note: params validation requires separate call with actual params

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    // Parse all valid schemas
    const result: {
        valid: boolean;
        body?: T;
        query?: Record<string, unknown>;
        params?: Record<string, string>;
        errors?: ValidationErrorDetail[];
    } = { valid: true };

    if (schemas.body) {
        const bodyResult = await validateBody(request, schemas.body);
        if (bodyResult.valid && bodyResult.data !== undefined) {
            result.body = bodyResult.data as T;
        }
    }

    if (schemas.query) {
        const queryResult = validateQuery(request, schemas.query);
        if (queryResult.valid && queryResult.data !== undefined) {
            result.query = queryResult.data as Record<string, unknown>;
        }
    }

    return result;
}

// ═══════════════════════════════════════════════════════════════════
// MIDDLEWARE DECORATORS
// ═══════════════════════════════════════════════════════════════════

/**
 * Create a body validation middleware
 */
export function validateBodyMiddleware<T>(schema: ZodSchema<T>) {
    return (handler: RouteHandler): RouteHandler => {
        return async (req: NextRequest, ctx?: Record<string, unknown>): Promise<NextResponse> => {
            const result = await validateBody(req, schema);

            if (!result.valid) {
                logger.warn('[Validation] Body validation failed', { errors: result.errors });
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: 'VALIDATION_ERROR',
                            message: 'Invalid request body',
                            details: result.errors,
                        },
                    },
                    { status: 400 }
                );
            }

            // Attach validated data to request context for downstream use
            const enrichedContext = {
                ...ctx,
                validatedBody: result.data,
            };

            return handler(req, enrichedContext);
        };
    };
}

/**
 * Create a query validation middleware
 */
export function validateQueryMiddleware<T>(schema: ZodSchema<T>) {
    return (handler: RouteHandler): RouteHandler => {
        return async (req: NextRequest, ctx?: Record<string, unknown>): Promise<NextResponse> => {
            const result = validateQuery(req, schema);

            if (!result.valid) {
                logger.warn('[Validation] Query validation failed', { errors: result.errors });
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: 'VALIDATION_ERROR',
                            message: 'Invalid query parameters',
                            details: result.errors,
                        },
                    },
                    { status: 400 }
                );
            }

            const enrichedContext = {
                ...ctx,
                validatedQuery: result.data,
            };

            return handler(req, enrichedContext);
        };
    };
}

/**
 * Create a params validation middleware
 */
export function validateParamsMiddleware<T>(schema: ZodSchema<T>) {
    return (handler: RouteHandler): RouteHandler => {
        return async (req: NextRequest, ctx?: Record<string, unknown>): Promise<NextResponse> => {
            // Params come from ctx when using withApiRoute
            const params = ctx || {};

            // Filter to only include actual params (not auth context)
            const actualParams: Record<string, string> = {};
            const knownContextKeys = ['userId', 'role', 'tenantId', 'tenantSlug', 'sessionId', 'requestId', 'isImpersonating'];

            for (const [key, value] of Object.entries(params)) {
                if (!knownContextKeys.includes(key) && typeof value === 'string') {
                    actualParams[key] = value;
                }
            }

            const result = validateParams(actualParams, schema);

            if (!result.valid) {
                logger.warn('[Validation] Params validation failed', { errors: result.errors });
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: 'VALIDATION_ERROR',
                            message: 'Invalid URL parameters',
                            details: result.errors,
                        },
                    },
                    { status: 400 }
                );
            }

            const enrichedContext = {
                ...ctx,
                validatedParams: result.data,
            };

            return handler(req, enrichedContext);
        };
    };
}

/**
 * Create combined validation middleware for body + query
 */
export function validateMiddleware(schemas: FullValidationSchemas) {
    return (handler: RouteHandler): RouteHandler => {
        return async (req: NextRequest, ctx?: Record<string, unknown>): Promise<NextResponse> => {
            const result = await validateRequest(req, schemas);

            if (!result.valid) {
                logger.warn('[Validation] Request validation failed', { errors: result.errors });
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: 'VALIDATION_ERROR',
                            message: 'Validation failed',
                            details: result.errors,
                        },
                    },
                    { status: 400 }
                );
            }

            const enrichedContext = {
                ...ctx,
                validatedBody: result.body,
                validatedQuery: result.query,
                validatedParams: result.params,
            };

            return handler(req, enrichedContext);
        };
    };
}

// ═══════════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Alias for validateBodyMiddleware
 */
export const validateBodyDecorator = validateBodyMiddleware;

/**
 * Alias for validateQueryMiddleware
 */
export const validateQueryDecorator = validateQueryMiddleware;

/**
 * Alias for validateParamsMiddleware
 */
export const validateParamsDecorator = validateParamsMiddleware;

/**
 * Create a full validator with typed schemas
 */
export function createValidator() {
    return {
        body: <T>(schema: ZodSchema<T>) => validateBodyMiddleware(schema),
        query: <T>(schema: ZodSchema<T>) => validateQueryMiddleware(schema),
        params: <T>(schema: ZodSchema<T>) => validateParamsMiddleware(schema),
        all: (schemas: FullValidationSchemas) => validateMiddleware(schemas),
    };
}

// ═══════════════════════════════════════════════════════════════════
// SCHEMA FACTORIES (reusable patterns)
// ═══════════════════════════════════════════════════════════════════

/**
 * Common pagination schema
 */
export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Common ID parameter schema
 */
export const idParamSchema = z.object({
    id: z.string().uuid('Invalid ID format'),
});

/**
 * Common search query schema
 */
export const searchQuerySchema = z.object({
    query: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Common date range schema
 */
export const dateRangeSchema = z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
});

// ═══════════════════════════════════════════════════════════════════
// RE-EXPORT
// ═══════════════════════════════════════════════════════════════════

export type { ZodSchema, ZodObject, ZodError } from 'zod';
export { z } from 'zod';
export { ValidationError } from '@/lib/errors';