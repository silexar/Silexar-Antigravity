/**
 * Silexar Pulse - Secure API Route Handler
 *
 * Composes 5 security layers into a single reusable wrapper:
 *   1. Rate limiting
 *   2. Authentication (getUserContext)
 *   3. RBAC (checkPermission)
 *   4. Tenant isolation (withTenantContext + RLS)
 *   5. Audit logging
 *
 * Usage:
 *   export const GET = secureHandler(
 *     { resource: 'campanas', action: 'read' },
 *     async (req, { user, db }) => {
 *       const rows = await db.select().from(campanas)
 *       return apiSuccess(rows)
 *     }
 *   )
 */

import { NextRequest } from 'next/server'
import { getUserContext, apiUnauthorized, apiForbidden, apiServerError } from './response'
import {
  checkPermission,
  type AuthContext,
  type Resource,
  type PermissionAction,
  type UserRole,
} from '@/lib/security/rbac'
import { withTenantContext, withSuperAdminContext } from '@/lib/db/tenant-context'
import { getDB } from '@/lib/db'
import { auditLogger } from '@/lib/security/audit-logger'
import { AuditEventType, AuditSeverity } from '@/lib/security/audit-types'
import {
  apiRateLimiter,
  authRateLimiter,
  cortexRateLimiter,
} from '@/lib/security/rate-limiter'
import { sessionStore } from '@/lib/security/session-store'
import { logger } from '@/lib/observability'

// ─── Types ──────────────────────────────────────────────────────────────────

type RateLimitTier = 'auth' | 'api' | 'cortex'

export interface SecureHandlerConfig {
  /** Resource being accessed (from RBAC matrix) */
  resource: Resource
  /** Action being performed */
  action: PermissionAction
  /** Skip tenant context wrapping (for global routes like /api/tenants) */
  skipTenantContext?: boolean
  /** Skip RBAC check (for routes with custom authorization logic) */
  skipRBAC?: boolean
  /** Rate limit tier — defaults to 'api' (100/min) */
  rateLimitTier?: RateLimitTier
  /** Skip rate limiting entirely (e.g., internal health checks) */
  skipRateLimit?: boolean
}

export interface SecureContext {
  /** Authenticated user extracted from middleware headers */
  user: {
    userId: string
    role: UserRole
    tenantId: string
    tenantSlug: string
    sessionId: string
    requestId: string
    isImpersonating: boolean
  }
  /** Database instance — already wrapped in tenant context if applicable */
  db: ReturnType<typeof getDB>
}

// ─── Rate limiter lookup ────────────────────────────────────────────────────

const RATE_LIMITERS = {
  auth: authRateLimiter,
  api: apiRateLimiter,
  cortex: cortexRateLimiter,
} as const

// Super admin roles that bypass tenant context (operate cross-tenant)
const SUPER_ADMIN_ROLES: UserRole[] = ['SUPER_CEO', 'ADMIN']

// ─── Main wrapper ───────────────────────────────────────────────────────────

/**
 * Wraps an API route handler with security enforcement.
 *
 * @param config - Security configuration for this route
 * @param handler - The actual route logic, receives (request, { user, db })
 * @returns A Next.js API route handler function
 */
export function secureHandler(
  config: SecureHandlerConfig,
  handler: (request: NextRequest, ctx: SecureContext) => Promise<Response>
): (request: NextRequest) => Promise<Response> {
  return async (request: NextRequest): Promise<Response> => {
    const startTime = Date.now()
    const method = request.method
    const path = request.nextUrl.pathname

    // ── 1. Rate limiting ──────────────────────────────────────────────────
    if (!config.skipRateLimit) {
      const limiter = RATE_LIMITERS[config.rateLimitTier ?? 'api']
      const rlResult = await limiter.checkRateLimit(request)

      if (!rlResult.success) {
        auditLogger.logEvent({
          eventType: AuditEventType.RATE_LIMIT_EXCEEDED,
          severity: AuditSeverity.HIGH,
          resource: path,
          action: method,
          details: { limit: rlResult.limit, path },
          success: false,
          errorMessage: 'Rate limit exceeded',
        })

        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Too many requests. Please try again later.',
              retryAfter: rlResult.retryAfter,
            },
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': rlResult.limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rlResult.resetTime.toString(),
              'Retry-After': (rlResult.retryAfter ?? 60).toString(),
            },
          }
        )
      }
    }

    // ── 2. Authentication ─────────────────────────────────────────────────
    const rawCtx = getUserContext(request)

    if (!rawCtx.userId || !rawCtx.tenantId) {
      auditLogger.logEvent({
        eventType: AuditEventType.ACCESS_DENIED,
        severity: AuditSeverity.MEDIUM,
        resource: path,
        action: method,
        details: { reason: 'Missing authentication', path },
        success: false,
        errorMessage: 'Unauthenticated request',
      })
      return apiUnauthorized()
    }

    const user = {
      ...rawCtx,
      role: rawCtx.role as UserRole,
    }

    // ── 2b. Session validity (enables logout/revocation) ─────────────────
    if (user.sessionId) {
      const sessionValid = await sessionStore.isValid(user.sessionId)
      if (!sessionValid) {
        auditLogger.logEvent({
          eventType: AuditEventType.ACCESS_DENIED,
          severity: AuditSeverity.MEDIUM,
          userId: user.userId,
          resource: path,
          action: method,
          details: { reason: 'Session revoked or expired', sessionId: user.sessionId },
          success: false,
          errorMessage: 'Session revoked',
        })
        return apiUnauthorized('Session expired or revoked')
      }
    }

    // ── 3. RBAC ───────────────────────────────────────────────────────────
    if (!config.skipRBAC) {
      const authCtx: AuthContext = {
        userId: user.userId,
        role: user.role,
        tenantId: user.tenantId,
      }

      if (!checkPermission(authCtx, config.resource, config.action)) {
        auditLogger.logEvent({
          eventType: AuditEventType.ACCESS_DENIED,
          severity: AuditSeverity.HIGH,
          userId: user.userId,
          userRole: user.role,
          sessionId: user.sessionId,
          resource: config.resource,
          action: config.action,
          details: {
            path,
            method,
            requiredResource: config.resource,
            requiredAction: config.action,
            userRole: user.role,
          },
          success: false,
          errorMessage: `Insufficient permissions: ${config.action} on ${config.resource}`,
        })
        return apiForbidden(`No tiene permisos para ${config.action} en ${config.resource}`)
      }
    }

    // ── 4. Execute with tenant context ────────────────────────────────────
    try {
      let response: Response

      if (config.skipTenantContext) {
        // Global routes (e.g., /api/tenants, /api/health)
        const db = getDB()
        response = await handler(request, { user, db })
      } else {
        const isSuperAdmin = SUPER_ADMIN_ROLES.includes(user.role)

        response = await withTenantContext(
          user.tenantId,
          async (db) => {
            return handler(request, { user, db })
          },
          { isSuperAdmin }
        )
      }

      // ── 5. Audit log on success ───────────────────────────────────────
      const duration = Date.now() - startTime

      auditLogger.logEvent({
        eventType: AuditEventType.API_CALL,
        severity: AuditSeverity.LOW,
        userId: user.userId,
        userRole: user.role,
        sessionId: user.sessionId,
        resource: config.resource,
        action: config.action,
        details: {
          path,
          method,
          statusCode: response.status,
          durationMs: duration,
          tenantId: user.tenantId,
        },
        success: response.status < 400,
      })

      return response
    } catch (error) {
      // ── Error handling ──────────────────────────────────────────────────
      const duration = Date.now() - startTime

      logger.error(
        `secureHandler error: ${path}`,
        error instanceof Error ? error : new Error(String(error)),
        { path, method, userId: user.userId, tenantId: user.tenantId, durationMs: duration }
      )

      auditLogger.logEvent({
        eventType: AuditEventType.API_ERROR,
        severity: AuditSeverity.HIGH,
        userId: user.userId,
        userRole: user.role,
        sessionId: user.sessionId,
        resource: config.resource,
        action: config.action,
        details: {
          path,
          method,
          durationMs: duration,
          error: error instanceof Error ? error.message : String(error),
        },
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      })

      return apiServerError()
    }
  }
}

/**
 * Public route handler — only applies rate limiting and error handling.
 * No auth, no RBAC, no tenant context.
 *
 * Usage:
 *   export const GET = publicHandler(async (req) => {
 *     return apiSuccess({ status: 'ok' })
 *   })
 */
export function publicHandler(
  handler: (request: NextRequest) => Promise<Response>,
  options?: { rateLimitTier?: RateLimitTier; skipRateLimit?: boolean }
): (request: NextRequest) => Promise<Response> {
  return async (request: NextRequest): Promise<Response> => {
    // Rate limiting
    if (!options?.skipRateLimit) {
      const limiter = RATE_LIMITERS[options?.rateLimitTier ?? 'api']
      const rlResult = await limiter.checkRateLimit(request)

      if (!rlResult.success) {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Too many requests. Please try again later.',
            },
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': (rlResult.retryAfter ?? 60).toString(),
            },
          }
        )
      }
    }

    try {
      return await handler(request)
    } catch (error) {
      logger.error(
        `publicHandler error: ${request.nextUrl.pathname}`,
        error instanceof Error ? error : new Error(String(error))
      )
      return apiServerError()
    }
  }
}
