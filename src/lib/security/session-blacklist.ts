/**
 * Silexar Pulse — Session / Token Blacklist
 *
 * Enables server-side token revocation. When a user logs out or a session
 * is forcibly terminated, the JWT's `jti` (unique token ID) is added to
 * the blacklist in Redis. The middleware then rejects any token whose jti
 * is blacklisted, even if it hasn't expired yet.
 *
 * Storage:
 *   - Primary:  Redis key `bl:jti:<jti>` with TTL = token expiry
 *   - Fallback: In-process Set (single-instance only — acceptable for dev)
 *
 * Security properties:
 *   - Token theft → operator calls revokeSession() → attacker locked out
 *   - Logout → immediate invalidation, not waiting for 24h expiry
 *   - Compomised account → revokeAllUserSessions() removes every active token
 */

import { getRedisClient } from '@/lib/cache/redis-client'

// ─── In-memory fallback ────────────────────────────────────────────────────────

/** jti → expiry timestamp (ms). Used only when Redis is unavailable. */
const memoryBlacklist = new Map<string, number>()

// Prune expired entries every 15 minutes to avoid memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [jti, exp] of memoryBlacklist.entries()) {
    if (exp < now) memoryBlacklist.delete(jti)
  }
}, 15 * 60 * 1000)

// ─── Redis helpers ────────────────────────────────────────────────────────────

function blacklistKey(jti: string): string {
  return `bl:jti:${jti}`
}

function userSessionsKey(userId: string): string {
  return `bl:user:${userId}:sessions`
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Add a token to the blacklist.
 *
 * @param jti       The JWT's unique identifier (jti claim)
 * @param userId    Owner of the token (for bulk revocation)
 * @param expiresAt Unix timestamp (seconds) of token expiry — used as Redis TTL
 */
export async function revokeToken(
  jti: string,
  userId: string,
  expiresAt: number
): Promise<void> {
  const ttlSeconds = Math.max(0, expiresAt - Math.floor(Date.now() / 1000))
  const redis = getRedisClient()

  if (redis) {
    try {
      const pipeline = redis.multi()
      // Mark this specific jti as revoked
      pipeline.set(blacklistKey(jti), userId, 'EX', ttlSeconds)
      // Track all active jtis for this user (for bulk revocation)
      pipeline.sadd(userSessionsKey(userId), jti)
      pipeline.expire(userSessionsKey(userId), ttlSeconds + 60) // extra buffer
      await pipeline.exec()
      return
    } catch {
      // Fall through to in-memory
    }
  }

  // In-memory fallback
  memoryBlacklist.set(jti, expiresAt * 1000)
}

/**
 * Check if a token's jti is on the blacklist.
 * Returns true if the token has been revoked (should be rejected).
 */
export async function isTokenRevoked(jti: string): Promise<boolean> {
  const redis = getRedisClient()

  if (redis) {
    try {
      const result = await redis.get(blacklistKey(jti))
      return result !== null
    } catch {
      // Fall through to in-memory
    }
  }

  // In-memory fallback
  const exp = memoryBlacklist.get(jti)
  if (!exp) return false
  if (exp < Date.now()) {
    memoryBlacklist.delete(jti)
    return false
  }
  return true
}

/**
 * Revoke all active tokens for a user.
 * Use this for: forced logout, account suspension, password change.
 */
export async function revokeAllUserSessions(userId: string): Promise<void> {
  const redis = getRedisClient()

  if (redis) {
    try {
      const jtis = await redis.smembers(userSessionsKey(userId))
      if (jtis.length > 0) {
        const pipeline = redis.multi()
        for (const jti of jtis) {
          // Revoke immediately — set TTL to 1 second
          pipeline.set(blacklistKey(jti), userId, 'EX', 1)
        }
        // Clear the user's session set
        pipeline.del(userSessionsKey(userId))
        await pipeline.exec()
      }
      return
    } catch {
      // Fall through to in-memory
    }
  }

  // In-memory fallback: revoke all matching entries
  const prefix = userId + ':'
  for (const [jti] of memoryBlacklist.entries()) {
    if (jti.startsWith(prefix)) {
      memoryBlacklist.delete(jti)
    }
  }
}

/**
 * Get the count of active (non-revoked) sessions for a user.
 * Useful for admin dashboards and concurrent session enforcement.
 */
export async function getUserActiveSessionCount(userId: string): Promise<number> {
  const redis = getRedisClient()

  if (redis) {
    try {
      return await redis.scard(userSessionsKey(userId))
    } catch {
      return 0
    }
  }

  return 0
}
