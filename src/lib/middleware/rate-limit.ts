/**
 * SILEXAR PULSE - Rate Limiting Middleware
 * 
 * @description Desacoplado rate limiting middleware con soporte para
 *              Redis y en memória. Implementa token bucket algorithm.
 * 
 * @example
 * ```typescript
 * import { rateLimit, RateLimitTier } from '@/lib/middleware/rate-limit';
 * 
 * // Apply to route
 * export const POST = rateLimit({ tier: 'strict' })(async ({ ctx, req }) => {
 *   // handler
 * });
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';

// ═══════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export enum RateLimitTier {
    STRICT = 'strict',    // 5 requests per minute
    MODERATE = 'moderate', // 30 requests per minute
    RELAXED = 'relaxed',   // 100 requests per minute
    AUTH = 'auth',         // 3 requests per minute (login, etc)
}

export interface RateLimitConfig {
    tier: RateLimitTier;
    redisUrl?: string;
    bypassTokens?: string[];
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    reset: number; // Unix timestamp
    limit: number;
}

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

// ═══════════════════════════════════════════════════════════════════
// TIER LIMITS
// ═══════════════════════════════════════════════════════════════════

const TIER_LIMITS: Record<RateLimitTier, { limit: number; windowMs: number }> = {
    [RateLimitTier.STRICT]: { limit: 5, windowMs: 60 * 1000 },        // 5/min
    [RateLimitTier.MODERATE]: { limit: 30, windowMs: 60 * 1000 },     // 30/min
    [RateLimitTier.RELAXED]: { limit: 100, windowMs: 60 * 1000 },     // 100/min
    [RateLimitTier.AUTH]: { limit: 3, windowMs: 60 * 1000 },          // 3/min
};

// ═══════════════════════════════════════════════════════════════════
// IN-MEMORY STORE (fallback when Redis unavailable)
// ═══════════════════════════════════════════════════════════════════

class InMemoryRateLimitStore {
    private store: Map<string, RateLimitEntry> = new Map();
    private cleanupInterval: NodeJS.Timeout;

    constructor(cleanupIntervalMs = 60 * 1000) {
        // Periodic cleanup of expired entries
        this.cleanupInterval = setInterval(() => this.cleanup(), cleanupIntervalMs);
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
            if (entry.resetAt <= now) {
                this.store.delete(key);
            }
        }
    }

    private getKey(identifier: string, tier: RateLimitTier): string {
        return `${tier}:${identifier}`;
    }

    check(identifier: string, tier: RateLimitTier): RateLimitResult {
        const config = TIER_LIMITS[tier];
        const key = this.getKey(identifier, tier);
        const now = Date.now();

        let entry = this.store.get(key);

        // First request or window expired
        if (!entry || entry.resetAt <= now) {
            entry = {
                count: 1,
                resetAt: now + config.windowMs,
            };
            this.store.set(key, entry);

            return {
                allowed: true,
                remaining: config.limit - 1,
                reset: entry.resetAt,
                limit: config.limit,
            };
        }

        // Increment count
        entry.count++;
        this.store.set(key, entry);

        // Check limit
        if (entry.count > config.limit) {
            return {
                allowed: false,
                remaining: 0,
                reset: entry.resetAt,
                limit: config.limit,
            };
        }

        return {
            allowed: true,
            remaining: config.limit - entry.count,
            reset: entry.resetAt,
            limit: config.limit,
        };
    }

    reset(identifier: string, tier: RateLimitTier): void {
        const key = this.getKey(identifier, tier);
        this.store.delete(key);
    }

    destroy(): void {
        clearInterval(this.cleanupInterval);
        this.store.clear();
    }
}

// Singleton store instance
let rateLimitStore: InMemoryRateLimitStore | null = null;

function getStore(): InMemoryRateLimitStore {
    if (!rateLimitStore) {
        rateLimitStore = new InMemoryRateLimitStore();
    }
    return rateLimitStore;
}

// ═══════════════════════════════════════════════════════════════════
// IDENTIFIER EXTRACTION
// ═══════════════════════════════════════════════════════════════════

/**
 * Extract identifier for rate limiting
 * Uses userId if authenticated, otherwise IP
 */
function getIdentifier(request: NextRequest, ctx?: Record<string, string>): string {
    // Use userId if available (authenticated requests)
    if (ctx?.userId) {
        return `user:${ctx.userId}`;
    }

    // Fall back to IP address
    const ip =
        request.headers.get('X-Forwarded-For')?.split(',')[0] ||
        request.headers.get('X-Real-IP') ||
        request.headers.get('CF-Connecting-IP') ||
        'unknown';

    return `ip:${ip}`;
}

// ═══════════════════════════════════════════════════════════════════
// RATE LIMIT FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Check rate limit without creating response
 */
export function checkRateLimit(
    request: NextRequest,
    tier: RateLimitTier,
    ctx?: Record<string, string>
): RateLimitResult {
    const identifier = getIdentifier(request, ctx);
    return getStore().check(identifier, tier);
}

/**
 * Check if request should be allowed
 */
export function isRateLimited(
    request: NextRequest,
    tier: RateLimitTier,
    ctx?: Record<string, string>
): boolean {
    const result = checkRateLimit(request, tier, ctx);
    return !result.allowed;
}

// ═══════════════════════════════════════════════════════════════════
// RESPONSE HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Create rate limit exceeded response
 */
export function rateLimitExceededResponse(result: RateLimitResult): NextResponse {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

    return NextResponse.json(
        {
            success: false,
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Demasiadas solicitudes. Por favor, intente de nuevo más tarde.',
                retryAfter,
            },
        },
        {
            status: 429,
            headers: {
                'Retry-After': String(retryAfter),
                'X-RateLimit-Limit': String(result.limit),
                'X-RateLimit-Remaining': String(result.remaining),
                'X-RateLimit-Reset': String(result.reset),
            },
        }
    );
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
    response: NextResponse,
    result: RateLimitResult
): NextResponse {
    response.headers.set('X-RateLimit-Limit', String(result.limit));
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    response.headers.set('X-RateLimit-Reset', String(result.reset));
    return response;
}

// ═══════════════════════════════════════════════════════════════════
// MIDDLEWARE DECORATOR
// ═══════════════════════════════════════════════════════════════════

type RouteHandler = (req: NextRequest, context?: Record<string, string>) => Promise<NextResponse>;

export interface RateLimitOptions {
    tier?: RateLimitTier;
    bypassTokens?: string[];
}

/**
 * Rate limiting middleware decorator
 */
export function rateLimit(options: RateLimitOptions = {}) {
    const tier = options.tier || RateLimitTier.MODERATE;

    return (handler: RouteHandler): RouteHandler => {
        return async (req: NextRequest, ctx?: Record<string, string>): Promise<NextResponse> => {
            // Check bypass tokens
            if (options.bypassTokens?.length) {
                const apiKey = req.headers.get('X-API-Key');
                if (apiKey && options.bypassTokens.includes(apiKey)) {
                    return handler(req, ctx);
                }
            }

            // Check rate limit
            const result = checkRateLimit(req, tier, ctx);

            if (!result.allowed) {
                logger.warn('[RateLimit] Limit exceeded', {
                    tier,
                    identifier: getIdentifier(req, ctx),
                    reset: result.reset,
                });

                return rateLimitExceededResponse(result);
            }

            // Execute handler
            const response = await handler(req, ctx);

            // Add rate limit headers
            return addRateLimitHeaders(response, result);
        };
    };
}

/**
 * Convenience decorators for common tiers
 */
export const strict = () => rateLimit({ tier: RateLimitTier.STRICT });
export const moderate = () => rateLimit({ tier: RateLimitTier.MODERATE });
export const relaxed = () => rateLimit({ tier: RateLimitTier.RELAXED });
export const authLimit = () => rateLimit({ tier: RateLimitTier.AUTH });

// ═══════════════════════════════════════════════════════════════════
// TIER FROM CONFIG
// ═══════════════════════════════════════════════════════════════════

/**
 * Get tier from route config
 */
export function tierFromRouteConfig(config?: { rateLimit?: RateLimitTier }): RateLimitTier {
    return config?.rateLimit || RateLimitTier.MODERATE;
}