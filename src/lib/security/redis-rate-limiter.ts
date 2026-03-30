/**
 * Silexar Pulse - Rate Limiter with Redis + In-Memory Fallback
 *
 * Low-level Redis sliding-window implementation exposing a generic
 * RateLimiter class (.check / .increment / .evaluate / .reset / .cleanup).
 * Exported as RedisRateLimiter singleton.
 *
 * DIFFERENT FROM rate-limiter.ts — that file is the application-level facade
 * (authRateLimiter / apiRateLimiter / cortexRateLimiter) that calls this or
 * an equivalent implementation internally.
 *
 * @security OWASP A04 — Rate Limiting
 */

import { getRedisClient } from '@/lib/cache/redis-client'
import { logger } from '@/lib/observability';

// ─── Types ───────────────────────────────────────────────────

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  keyPrefix?: string
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfterMs: number
}

// ─── In-Memory Fallback ──────────────────────────────────────

const memoryBuckets = new Map<string, number[]>()

function evaluateInMemory(
  key: string,
  config: RateLimitConfig,
  increment = true
): RateLimitResult {
  const now = Date.now()
  const windowStart = now - config.windowMs

  let timestamps = memoryBuckets.get(key) || []
  timestamps = timestamps.filter(t => t > windowStart)

  const allowed = timestamps.length < config.maxRequests

  if (allowed && increment) {
    timestamps.push(now)
    memoryBuckets.set(key, timestamps)
  }

  const resetAt = timestamps.length > 0
    ? timestamps[0] + config.windowMs
    : now + config.windowMs

  return {
    allowed,
    remaining: Math.max(0, config.maxRequests - timestamps.length),
    resetAt,
    retryAfterMs: allowed ? 0 : resetAt - now,
  }
}

// ─── Redis Implementation ────────────────────────────────────

async function evaluateWithRedis(
  key: string,
  config: RateLimitConfig,
  increment = true
): Promise<RateLimitResult> {
  const redis = getRedisClient()
  if (!redis) {
    return evaluateInMemory(key, config, increment)
  }

  const now = Date.now()
  const windowStart = now - config.windowMs

  try {
    // Atomic sliding window with Redis pipeline
    const pipeline = redis.pipeline()

    // Remove expired entries
    pipeline.zremrangebyscore(key, 0, windowStart)

    // Count current entries
    pipeline.zcard(key)

    // Add new entry if incrementing
    if (increment) {
      pipeline.zadd(key, now, `${now}:${Math.random().toString(36).slice(2, 8)}`)
    }

    // Set TTL to auto-cleanup
    pipeline.pexpire(key, config.windowMs)

    const results = await pipeline.exec()
    if (!results) {
      return evaluateInMemory(key, config, increment)
    }

    const currentCount = (results[1]?.[1] as number) || 0
    const allowed = currentCount < config.maxRequests

    // If we added when we shouldn't have, remove it
    if (!allowed && increment) {
      await redis.zremrangebyscore(key, now, now)
    }

    return {
      allowed,
      remaining: Math.max(0, config.maxRequests - currentCount - (increment && allowed ? 1 : 0)),
      resetAt: now + config.windowMs,
      retryAfterMs: allowed ? 0 : config.windowMs,
    }
  } catch (error) {
    logger.error('[RateLimit] Redis error, falling back to memory', error instanceof Error ? error : new Error(String(error)))
    return evaluateInMemory(key, config, increment)
  }
}

// ─── Public API ──────────────────────────────────────────────

class RateLimiter {
  async check(key: string, config: RateLimitConfig): Promise<boolean> {
    const result = await this.evaluate(key, config, false)
    return result.allowed
  }

  async increment(key: string, config: RateLimitConfig): Promise<number> {
    const result = await this.evaluate(key, config, true)
    return config.maxRequests - result.remaining
  }

  async evaluate(
    key: string,
    config: RateLimitConfig,
    increment = true
  ): Promise<RateLimitResult> {
    const fullKey = config.keyPrefix ? `${config.keyPrefix}:${key}` : key
    return evaluateWithRedis(fullKey, config, increment)
  }

  async reset(key: string): Promise<void> {
    memoryBuckets.delete(key)
    const redis = getRedisClient()
    if (redis) {
      await redis.del(key).catch(() => {})
    }
  }

  cleanup(maxAgeMs = 3_600_000): void {
    const cutoff = Date.now() - maxAgeMs
    for (const [key, timestamps] of memoryBuckets.entries()) {
      const recent = timestamps.filter(t => t > cutoff)
      if (recent.length === 0) {
        memoryBuckets.delete(key)
      } else {
        memoryBuckets.set(key, recent)
      }
    }
  }
}

export const RedisRateLimiter = new RateLimiter()
export default RedisRateLimiter
