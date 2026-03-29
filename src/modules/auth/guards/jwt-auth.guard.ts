/**
 * JWTAuthGuard — thin adapter around src/lib/api/jwt.ts
 *
 * Use for non-HTTP contexts (WebSocket, background jobs, tests).
 * For Next.js API routes, use getUserContext() from @/lib/api/response instead.
 * For Edge middleware protection, use src/middleware.ts.
 *
 * AUTH_DECISION.md explains why auth is NOT a full DDD module.
 */

import { verifyTokenServer } from '@/lib/api/jwt'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  tenantId: string
  sessionId: string
  exp: number
}

/**
 * Validates a JWT string and returns its decoded payload, or null if invalid.
 */
export async function validateJWT(token: string): Promise<JWTPayload | null> {
  try {
    const payload = await verifyTokenServer(token)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

/**
 * Returns true if the payload's exp timestamp is in the past.
 */
export function isTokenExpired(payload: JWTPayload): boolean {
  return Date.now() / 1000 > payload.exp
}

/**
 * Guard class for contexts that require synchronous canActivate() style checks.
 * Stores a pre-validated payload; call validate() before using.
 */
export class JWTAuthGuard {
  private _payload: JWTPayload | null = null

  async validate(token: string): Promise<boolean> {
    this._payload = await validateJWT(token)
    return this._payload !== null && !isTokenExpired(this._payload)
  }

  canActivate(_context: unknown): boolean {
    return this._payload !== null
  }

  get payload(): JWTPayload | null {
    return this._payload
  }
}

export default { validateJWT, isTokenExpired, JWTAuthGuard }
