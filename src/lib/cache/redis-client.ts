/**
 * Silexar Pulse - Redis Client Singleton
 * Connects to Redis for caching, rate limiting, and session storage
 * Falls back gracefully when Redis is unavailable
 */

import Redis from 'ioredis'
import { logger } from '@/lib/observability';

let redisClient: Redis | null = null
let connectionAttempted = false

export function getRedisClient(): Redis | null {
  if (connectionAttempted) return redisClient

  connectionAttempted = true
  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    logger.warn('[Redis] REDIS_URL not configured — using in-memory fallback')
    return null
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null // Stop retrying after 3 attempts
        return Math.min(times * 200, 2000)
      },
      connectTimeout: 5000,
      lazyConnect: false,
      enableReadyCheck: true,
    })

    redisClient.on('error', (err) => {
      logger.error('[Redis] Connection error', err instanceof Error ? err : new Error(String(err)))
    })

    redisClient.on('connect', () => {
      logger.info('[Redis] Connected successfully')
    })

    return redisClient
  } catch (error) {
    logger.error('[Redis] Failed to initialize', error instanceof Error ? error : new Error(String(error)))
    redisClient = null
    return null
  }
}

export function isRedisConnected(): boolean {
  return redisClient?.status === 'ready'
}
