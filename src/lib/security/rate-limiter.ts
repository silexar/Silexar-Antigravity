/**
 * Enterprise Rate Limiting — Redis sliding window + in-memory fallback
 *
 * Strategy:
 *   1. Try Redis sorted-set sliding window (ZADD / ZCOUNT / ZREMRANGEBYSCORE)
 *   2. If Redis unavailable → fall back to Map-based in-process counter
 *
 * @security OWASP rate-limiting best practices
 */

import { NextRequest } from 'next/server'
import * as crypto from 'crypto'
import { getRedisClient } from '@/lib/cache/redis-client'
import { logError, logSecurity } from './audit-logger'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (request: NextRequest) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  onLimitReached?: (key: string, request: NextRequest) => void
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
}

// ─── In-memory fallback store ─────────────────────────────────────────────────

interface MemoryWindow {
  timestamps: number[]
  purgedAt: number
}

const memoryStore = new Map<string, MemoryWindow>()

// Prune stale entries every 1 min to avoid memory leaks (high-frequency cleanup)
setInterval(() => {
  const cutoff = Date.now() - 1 * 60 * 1000
  for (const [key, win] of memoryStore.entries()) {
    if (win.purgedAt < cutoff) memoryStore.delete(key)
  }
}, 1 * 60 * 1000)

// ─── Core class ───────────────────────────────────────────────────────────────

class EnterpriseRateLimiter {
  private config: Required<Pick<RateLimitConfig, 'windowMs' | 'maxRequests'>> &
    RateLimitConfig

  constructor(config: RateLimitConfig) {
    const windowMs = config.windowMs || 60_000
    const maxRequests = config.maxRequests || 100
    this.config = {
      keyGenerator: this.defaultKeyGenerator.bind(this),
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config,
      windowMs,
      maxRequests,
    }
  }

  // ── Key helpers ─────────────────────────────────────────────────────────────

  private defaultKeyGenerator(request: NextRequest): string {
    const ip = this.getClientIP(request)
    const tenantId = request.headers.get('x-tenant-id') || 'default'
    return `rl:${tenantId}:${ip}`
  }

  private getClientIP(request: NextRequest): string {
    const fwd = request.headers.get('x-forwarded-for')
    if (fwd) return fwd.split(',')[0].trim()
    return request.headers.get('x-real-ip') || '127.0.0.1'
  }

  // ── Redis sliding window ────────────────────────────────────────────────────

  private async redisCount(key: string, windowStart: number, now: number): Promise<number | null> {
    const redis = getRedisClient()
    if (!redis) return null

    try {
      // Remove expired entries, add current timestamp, count window
      await redis
        .multi()
        .zremrangebyscore(key, '-inf', windowStart)
        .zadd(key, now, `${now}-${crypto.randomUUID()}`)
        .expire(key, Math.ceil(this.config.windowMs / 1000) + 1)
        .exec()

      const count = await redis.zcount(key, windowStart, '+inf')
      return count
    } catch (err) {
      logError('Redis rate-limit error', err as Error, { key })
      return null // fall through to in-memory
    }
  }

  // ── In-memory sliding window ────────────────────────────────────────────────

  private memoryCount(key: string, windowStart: number, now: number): number {
    const win = memoryStore.get(key) ?? { timestamps: [], purgedAt: now }
    // Prune outside window
    win.timestamps = win.timestamps.filter(t => t > windowStart)
    win.timestamps.push(now)
    win.purgedAt = now
    memoryStore.set(key, win)
    return win.timestamps.length
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  async checkRateLimit(request: NextRequest): Promise<RateLimitResult> {
    const key = this.config.keyGenerator!(request)
    const now = Date.now()
    const windowStart = now - this.config.windowMs
    const resetTime = now + this.config.windowMs

    try {
      // Try Redis first, fall back to in-memory
      let count = await this.redisCount(key, windowStart, now)
      if (count === null) {
        count = this.memoryCount(key, windowStart, now)
      }

      const remaining = Math.max(0, this.config.maxRequests - count)

      if (count > this.config.maxRequests) {
        await this.logViolation(request, key, count)
        if (this.config.onLimitReached) this.config.onLimitReached(key, request)

        return {
          success: false,
          limit: this.config.maxRequests,
          remaining: 0,
          resetTime,
          retryAfter: Math.ceil(this.config.windowMs / 1000),
        }
      }

      return { success: true, limit: this.config.maxRequests, remaining, resetTime }
    } catch (error) {
      // Auth rate limiter: fail CLOSED — reject if we cannot determine state
      logError('Rate limiter unexpected error', error as Error, { key })
      return {
        success: false,
        limit: this.config.maxRequests,
        remaining: 0,
        resetTime,
        retryAfter: Math.ceil(this.config.windowMs / 1000),
      }
    }
  }

  private async logViolation(request: NextRequest, key: string, count: number): Promise<void> {
    await logSecurity('Rate limit exceeded', {
      event: 'RATE_LIMIT_EXCEEDED',
      ip: this.getClientIP(request),
      userAgent: request.headers.get('user-agent'),
      path: request.nextUrl.pathname,
      key,
      requestCount: count,
      limit: this.config.maxRequests,
      windowMs: this.config.windowMs,
      severity: 'HIGH',
      timestamp: new Date().toISOString(),
    })
  }
}

// ─── Pre-configured limiters ──────────────────────────────────────────────────

export const authRateLimiter = new EnterpriseRateLimiter({
  windowMs: 60_000,        // 1 minute
  maxRequests: 5,          // 5 login attempts per minute
  onLimitReached: async (key, request) => {
    await logSecurity('Auth brute-force detected', {
      event: 'AUTH_BRUTE_FORCE_DETECTED',
      key,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      severity: 'CRITICAL',
    })
  },
})

export const apiRateLimiter = new EnterpriseRateLimiter({
  windowMs: 60_000,
  maxRequests: 100,
})

export const cortexRateLimiter = new EnterpriseRateLimiter({
  windowMs: 60_000,
  maxRequests: 50,
})

// ─── Middleware factory ────────────────────────────────────────────────────────

export function createRateLimitMiddleware(limiter: EnterpriseRateLimiter) {
  return async (request: NextRequest) => {
    const result = await limiter.checkRateLimit(request)

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
            retryAfter: result.retryAfter,
          },
          metadata: {
            limit: result.limit,
            remaining: result.remaining,
            resetTime: result.resetTime,
            timestamp: new Date().toISOString(),
          },
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': (result.retryAfter ?? 60).toString(),
          },
        },
      )
    }

    return {
      headers: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetTime.toString(),
      },
    }
  }
}

// ─── Simple helper (backward compat) ─────────────────────────────────────────

export async function rateLimit(options: {
  key: string
  limit: number
  window: number
}): Promise<RateLimitResult> {
  const now = Date.now()
  const windowStart = now - options.window
  const redis = getRedisClient()

  if (redis) {
    try {
      await redis
        .multi()
        .zremrangebyscore(options.key, '-inf', windowStart)
        .zadd(options.key, now, `${now}-${crypto.randomUUID()}`)
        .expire(options.key, Math.ceil(options.window / 1000) + 1)
        .exec()
      const count = await redis.zcount(options.key, windowStart, '+inf')
      const remaining = Math.max(0, options.limit - count)
      return {
        success: count <= options.limit,
        limit: options.limit,
        remaining,
        resetTime: now + options.window,
        retryAfter: count > options.limit ? Math.ceil(options.window / 1000) : undefined,
      }
    } catch {
      // fall through
    }
  }

  // In-memory fallback
  const win = memoryStore.get(options.key) ?? { timestamps: [], purgedAt: now }
  win.timestamps = win.timestamps.filter(t => t > windowStart)
  win.timestamps.push(now)
  win.purgedAt = now
  memoryStore.set(options.key, win)
  const count = win.timestamps.length
  return {
    success: count <= options.limit,
    limit: options.limit,
    remaining: Math.max(0, options.limit - count),
    resetTime: now + options.window,
    retryAfter: count > options.limit ? Math.ceil(options.window / 1000) : undefined,
  }
}

export { EnterpriseRateLimiter }
export type { RateLimitConfig, RateLimitResult }
