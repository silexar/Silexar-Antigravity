/**
 * Silexar Pulse - Server-Side Session Store
 *
 * Enables token revocation by tracking active sessions.
 * Primary: Redis (via getRedisClient)
 * Fallback: In-memory Map (per-instance)
 *
 * Sessions are created on login, revoked on logout.
 * secureHandler checks session validity before processing requests.
 */

import { getRedisClient } from '@/lib/cache/redis-client'

// ─── Types ──────────────────────────────────────────────────────────────────

interface SessionData {
  userId: string
  tenantId: string
  role: string
  createdAt: number
}

const SESSION_PREFIX = 'session:'
const SESSION_TTL_SECONDS = 86400 // 24 hours (matches JWT expiry)

// ─── In-memory fallback ─────────────────────────────────────────────────────

const memoryStore = new Map<string, SessionData>()

// Clean up expired sessions every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, data] of memoryStore.entries()) {
    if (now - data.createdAt > SESSION_TTL_SECONDS * 1000) {
      memoryStore.delete(key)
    }
  }
}, 10 * 60_000)

// ─── Session Store ──────────────────────────────────────────────────────────

export const sessionStore = {
  /**
   * Create a new session (called on login)
   */
  async create(sessionId: string, data: Omit<SessionData, 'createdAt'>): Promise<void> {
    const session: SessionData = { ...data, createdAt: Date.now() }
    const redis = getRedisClient()

    if (redis) {
      try {
        await redis.setex(
          SESSION_PREFIX + sessionId,
          SESSION_TTL_SECONDS,
          JSON.stringify(session)
        )
        return
      } catch {
        // Fall through to memory
      }
    }

    memoryStore.set(sessionId, session)
  },

  /**
   * Check if a session is valid (called by secureHandler)
   */
  async isValid(sessionId: string): Promise<boolean> {
    if (!sessionId) return false

    const redis = getRedisClient()

    if (redis) {
      try {
        const exists = await redis.exists(SESSION_PREFIX + sessionId)
        return exists === 1
      } catch {
        // Fall through to memory
      }
    }

    const session = memoryStore.get(sessionId)
    if (!session) return false

    // Check expiry
    if (Date.now() - session.createdAt > SESSION_TTL_SECONDS * 1000) {
      memoryStore.delete(sessionId)
      return false
    }

    return true
  },

  /**
   * Revoke a session (called on logout)
   */
  async revoke(sessionId: string): Promise<void> {
    if (!sessionId) return

    const redis = getRedisClient()

    if (redis) {
      try {
        await redis.del(SESSION_PREFIX + sessionId)
      } catch {
        // Silently continue
      }
    }

    memoryStore.delete(sessionId)
  },

  /**
   * Revoke all sessions for a user (forced logout / password change)
   */
  async revokeAllForUser(userId: string): Promise<void> {
    // In-memory: iterate and remove
    for (const [key, data] of memoryStore.entries()) {
      if (data.userId === userId) {
        memoryStore.delete(key)
      }
    }

    // Redis: scan for user sessions (best-effort)
    const redis = getRedisClient()
    if (redis) {
      try {
        let cursor = '0'
        do {
          const [nextCursor, keys] = await redis.scan(
            cursor,
            'MATCH',
            `${SESSION_PREFIX}*`,
            'COUNT',
            100
          )
          cursor = nextCursor

          for (const key of keys) {
            const raw = await redis.get(key)
            if (raw) {
              try {
                const session = JSON.parse(raw) as SessionData
                if (session.userId === userId) {
                  await redis.del(key)
                }
              } catch {
                // Skip malformed entries
              }
            }
          }
        } while (cursor !== '0')
      } catch {
        // Best-effort cleanup
      }
    }
  },
}
