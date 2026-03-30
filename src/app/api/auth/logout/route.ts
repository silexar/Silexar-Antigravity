/**
 * POST /api/auth/logout — End user session
 *
 * Security actions performed:
 *   1. Revokes the JWT's jti in Redis blacklist (immediate token invalidation)
 *   2. Clears the httpOnly session cookie
 *   3. Logs the LOGOUT event to the audit trail
 *
 * This endpoint is in PUBLIC_API_ROUTES in middleware.ts so it works even
 * when the token is about to expire. It reads the JWT claims from the
 * middleware-injected headers (no re-verification needed — middleware already
 * validated the token before injecting the headers).
 */

import { type NextRequest } from 'next/server'
import { logger } from '@/lib/observability';
import { apiSuccess, apiServerError, getUserContext } from '@/lib/api/response'
import { revokeToken } from '@/lib/security/session-blacklist'
import { auditLogger } from '@/lib/security/audit-logger'
import { AuditEventType, AuditSeverity } from '@/lib/security/audit-types'

export async function POST(request: NextRequest) {
  try {
    const ctx = getUserContext(request)

    // Revoke the specific token by JTI (prevents reuse of stolen tokens)
    // Access tokens expire in 24h (86400s) — use that as max TTL for blacklist entry
    if (ctx.jti && ctx.userId) {
      const expiresAt = Math.floor(Date.now() / 1000) + 86_400 // max 24h from now
      await revokeToken(ctx.jti, ctx.userId, expiresAt)
    }

    // Audit log the logout
    if (ctx.userId) {
      auditLogger.logEvent({
        eventType: AuditEventType.LOGOUT,
        severity: AuditSeverity.LOW,
        userId:    ctx.userId,
        sessionId: ctx.sessionId,
        resource:  'AUTH_SYSTEM',
        action:    'LOGOUT',
        details: {
          tenantId:  ctx.tenantId,
          requestId: ctx.requestId,
        },
        success: true,
      })
    }

    const response = apiSuccess({ message: 'Sesión cerrada correctamente' })

    // Clear the httpOnly session cookie
    response.headers.set(
      'Set-Cookie',
      'silexar_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict'
    )

    return response
  } catch (error) {
    logger.error('Error in auth logout', error instanceof Error ? error : undefined, { module: 'auth', action: 'logout' })
    return apiServerError()
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}
