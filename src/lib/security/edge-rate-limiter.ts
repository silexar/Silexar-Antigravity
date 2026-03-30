/**
 * Edge-safe in-memory rate limiter for middleware/runtime 'edge'.
 * Keeps logic minimal to avoid Node.js APIs and external deps.
 *
 * This is the ONLY rate limiter that can run in the Next.js Edge Runtime
 * (middleware.ts / proxy.ts).  Redis and Node.js net APIs are not available
 * in the edge — this file intentionally has NO external imports.
 *
 * Used by: src/middleware.ts, src/proxy.ts
 */

import type { NextRequest } from 'next/server'

type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
}

class EdgeMemoryRateLimiter {
  private buckets: Map<string, number[]> = new Map()

  async checkRateLimit(
    key: string,
    limit: number,
    windowMs: number,
    _request?: NextRequest
  ): Promise<RateLimitResult> {
    const now = Date.now()
    const cutoff = now - windowMs

    const arr = this.buckets.get(key) || []
    // purge old timestamps
    const recent = arr.filter((t) => t > cutoff)

    if (recent.length >= limit) {
      const resetIn = windowMs - (now - recent[0])
      return {
        success: false,
        limit,
        remaining: 0,
        resetTime: now + resetIn,
        retryAfter: Math.ceil(resetIn / 1000),
      }
    }

    recent.push(now)
    this.buckets.set(key, recent)
    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - recent.length),
      resetTime: recent[0] + windowMs,
    }
  }
}

export const edgeRateLimiter = new EdgeMemoryRateLimiter()

