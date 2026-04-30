/**
 * SILEXAR PULSE - Request Logging Middleware
 * 
 * @description Desacoplado request logging middleware que registra
 *              todas las requests con structured logging.
 * 
 * @example
 * ```typescript
 * import { requestLogger, requestLog } from '@/lib/middleware/request-logger';
 * 
 * export const GET = requestLogger(async ({ ctx, req }) => {
 *   // handler
 * });
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';

// ═══════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export interface RequestLogData {
    method: string;
    url: string;
    status?: number;
    duration?: number;
    userAgent?: string;
    clientIp?: string;
    requestId?: string;
    userId?: string;
    tenantId?: string;
    role?: string;
    error?: string;
}

export interface RequestLogOptions {
    includeHeaders?: boolean;
    includeBody?: boolean;
    logResponseBody?: boolean;
    slowThreshold?: number; // ms
}

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Extract client IP from request headers
 */
function getClientIp(request: NextRequest): string {
    return (
        request.headers.get('X-Forwarded-For')?.split(',')[0] ||
        request.headers.get('X-Real-IP') ||
        request.headers.get('CF-Connecting-IP') || // Cloudflare
        'unknown'
    );
}

/**
 * Generate or extract request ID
 */
function getRequestId(request: NextRequest, ctx?: Record<string, string>): string {
    return (
        ctx?.requestId ||
        request.headers.get('X-Request-ID') ||
        crypto.randomUUID()
    );
}

/**
 * Calculate duration between two timestamps
 */
function formatDuration(start: number, end: number): string {
    const diff = end - start;
    if (diff < 1000) return `${diff}ms`;
    if (diff < 60000) return `${(diff / 1000).toFixed(1)}s`;
    return `${(diff / 60000).toFixed(1)}m`;
}

// ═══════════════════════════════════════════════════════════════════
// LOGGING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Log incoming request
 */
export function logRequestStart(request: NextRequest, ctx?: Record<string, string>): string {
    const requestId = getRequestId(request, ctx);
    const clientIp = getClientIp(request);
    const userAgent = request.headers.get('User-Agent') || 'unknown';

    logger.info('Request started', {
        type: 'request_start',
        requestId,
        method: request.method,
        url: request.url,
        clientIp,
        userAgent,
        userId: ctx?.userId,
        tenantId: ctx?.tenantId,
        role: ctx?.role,
    });

    return requestId;
}

/**
 * Log completed request
 */
export function logRequestEnd(
    requestId: string,
    request: NextRequest,
    response: NextResponse,
    startTime: number,
    ctx?: Record<string, string>
): void {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const status = response.status;
    const clientIp = getClientIp(request);

    const logData: RequestLogData = {
        method: request.method,
        url: request.url,
        status,
        duration,
        clientIp,
        requestId,
        userId: ctx?.userId,
        tenantId: ctx?.tenantId,
    };

    // Determine log level based on status
    if (status >= 500) {
        logger.error('Request ended with error', {
            type: 'request_end',
            ...logData,
            level: 'error',
        });
    } else if (status >= 400) {
        logger.warn('Request ended with warning', {
            type: 'request_end',
            ...logData,
            level: 'warn',
        });
    } else {
        logger.info('Request ended', {
            type: 'request_end',
            ...logData,
            level: 'info',
        });
    }
}

/**
 * Log request error
 */
export function logRequestError(
    requestId: string,
    request: NextRequest,
    error: unknown,
    startTime: number,
    ctx?: Record<string, string>
): void {
    const duration = Date.now() - startTime;
    const clientIp = getClientIp(request);
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error('Request error', {
        type: 'request_error',
        requestId,
        method: request.method,
        url: request.url,
        duration,
        clientIp,
        userId: ctx?.userId,
        tenantId: ctx?.tenantId,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
    });
}

// ═══════════════════════════════════════════════════════════════════
// MIDDLEWARE DECORATOR
// ═══════════════════════════════════════════════════════════════════

type RouteHandler = (req: NextRequest, context?: Record<string, string>) => Promise<NextResponse>;

/**
 * Request logging middleware decorator
 */
export function requestLogger(options: RequestLogOptions = {}) {
    const {
        slowThreshold = 3000, // 3 seconds
    } = options;

    return (handler: RouteHandler): RouteHandler => {
        return async (req: NextRequest, ctx?: Record<string, string>): Promise<NextResponse> => {
            const startTime = Date.now();
            const requestId = getRequestId(req, ctx);

            // Add request ID to headers for traceability
            const modifiedReq = new NextRequest(req.url, {
                headers: {
                    ...Object.fromEntries(req.headers.entries()),
                    'X-Request-ID': requestId,
                },
                signal: req.signal,
                cache: req.cache,
                credentials: req.credentials,
                mode: req.mode,
                redirect: req.redirect,
                referrer: req.referrer,
            });

            try {
                // Log request start
                logRequestStart(modifiedReq, ctx);

                // Execute handler
                const response = await handler(modifiedReq, ctx);

                // Log request end
                logRequestEnd(requestId, modifiedReq, response, startTime, ctx);

                // Add request ID to response headers
                response.headers.set('X-Request-ID', requestId);

                // Check for slow requests
                const duration = Date.now() - startTime;
                if (duration > slowThreshold) {
                    logger.warn('Slow request detected', {
                        type: 'slow_request',
                        requestId,
                        duration,
                        threshold: slowThreshold,
                        method: modifiedReq.method,
                        url: modifiedReq.url,
                    });
                }

                return response;
            } catch (error) {
                // Log error
                logRequestError(requestId, modifiedReq, error, startTime, ctx);

                // Re-throw for error handler middleware
                throw error;
            }
        };
    };
}

/**
 * Convenience: apply request logging to a handler
 */
export function withRequestLogging(handler: RouteHandler): RouteHandler {
    return requestLogger()(handler);
}

// ═══════════════════════════════════════════════════════════════════
// STANDALONE LOG FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Log any message with request context
 */
export function requestLog(
    message: string,
    data?: Partial<RequestLogData> & Record<string, unknown>
): void {
    logger.info(message, {
        type: 'request_log',
        ...data,
    });
}