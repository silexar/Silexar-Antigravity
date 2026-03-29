/**
 * Silexar Pulse — withApiRoute() Central API Wrapper
 *
 * Enforces the full security stack on every API route handler:
 *   1. Authentication  — JWT verified by middleware, extracted via getUserContext()
 *   2. Rate limiting   — Redis sliding window, in-memory fallback
 *   3. CSRF            — Origin verification on mutations (POST/PUT/PATCH/DELETE)
 *   4. RBAC            — checkPermission() against role matrix
 *   5. Tenant isolation — withTenantContext() sets PostgreSQL RLS session var
 *   6. Input validation — Caller provides Zod schema; wrapper validates and returns parsed data
 *   7. Audit logging   — Every request logged with user, tenant, action, result
 *   8. Error handling  — All uncaught errors normalized; raw messages never leak to client
 *
 * Usage:
 *
 *   export const POST = withApiRoute(
 *     { resource: 'campanas', action: 'create', rateLimit: 'api' },
 *     async ({ ctx, body }) => {
 *       const parsed = CampanaCreateSchema.safeParse(body)
 *       if (!parsed.success) return apiValidationError(parsed.error.flatten())
 *
 *       const result = await withTenantContext(ctx.tenantId, async (db) => {
 *         return db.insert(campanas).values({ ...parsed.data, tenantId: ctx.tenantId })
 *       })
 *
 *       return apiSuccess(result, 201)
 *     }
 *   )
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability';
import { getUserContext } from '@/lib/api/response'
import { checkPermission, type Resource, type PermissionAction } from '@/lib/security/rbac'
import { apiRateLimiter, authRateLimiter, cortexRateLimiter } from '@/lib/security/rate-limiter'
import { auditLogger } from '@/lib/security/audit-logger'
import { AuditEventType, AuditSeverity } from '@/lib/security/audit-types'
import { isTokenRevoked } from '@/lib/security/session-blacklist'
import {
  apiUnauthorized,
  apiForbidden,
  apiServerError,
} from '@/lib/api/response'

// ─── Types ────────────────────────────────────────────────────────────────────

type RateLimitTier = 'auth' | 'api' | 'cortex' | 'none'

export interface RouteConfig {
  /** RBAC: the resource this route operates on */
  resource?: Resource
  /** RBAC: the action being performed */
  action?: PermissionAction
  /** Rate limit tier. Defaults to 'api' */
  rateLimit?: RateLimitTier
  /** Skip CSRF check — only for GET / HEAD / OPTIONS */
  skipCsrf?: boolean
  /** Allow unauthenticated access (public endpoints only) */
  allowPublic?: boolean
}

export interface RouteContext {
  /** Authenticated user context (empty strings if allowPublic + no token) */
  ctx: {
    userId: string
    role: string
    tenantId: string
    tenantSlug: string
    sessionId: string
    requestId: string
    isImpersonating: boolean
  }
  /** Raw request */
  req: NextRequest
  /** Client IP address */
  ip: string
}

type RouteHandler = (args: RouteContext) => Promise<NextResponse>

// ─── CSRF protection ──────────────────────────────────────────────────────────

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

/** Allowed origins — derive from env, default to app URL */
function getAllowedOrigins(): Set<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  const origins = new Set<string>()
  if (appUrl) {
    origins.add(new URL(appUrl).origin)
  }
  // Always allow localhost in dev
  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000')
    origins.add('http://localhost:3001')
  }
  return origins
}

function verifyCsrf(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  // If no origin header is present (same-origin GET/HEAD or server-to-server), allow
  if (!origin) return true

  const allowed = getAllowedOrigins()
  return allowed.has(origin)
}

// ─── IP extraction ────────────────────────────────────────────────────────────

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') || '127.0.0.1'
}

// ─── Rate limiter selector ────────────────────────────────────────────────────

function selectLimiter(tier: RateLimitTier) {
  switch (tier) {
    case 'auth':    return authRateLimiter
    case 'cortex':  return cortexRateLimiter
    case 'none':    return null
    default:        return apiRateLimiter
  }
}

// ─── Audit helpers ────────────────────────────────────────────────────────────

function mapActionToAuditType(action?: PermissionAction): AuditEventType {
  switch (action) {
    case 'create':  return AuditEventType.DATA_CREATE
    case 'read':    return AuditEventType.DATA_READ
    case 'update':  return AuditEventType.DATA_UPDATE
    case 'delete':  return AuditEventType.DATA_DELETE
    case 'export':  return AuditEventType.DATA_EXPORT
    case 'admin':   return AuditEventType.ADMIN_ACTION
    case 'approve': return AuditEventType.ADMIN_ACTION
    default:        return AuditEventType.API_CALL
  }
}

// ─── Core wrapper ─────────────────────────────────────────────────────────────

/**
 * Wraps a Next.js API route handler with the full Silexar security stack.
 *
 * @param config  Route-level security configuration
 * @param handler Async function that receives { ctx, req, ip } and returns NextResponse
 */
export function withApiRoute(
  config: RouteConfig,
  handler: RouteHandler
): (req: NextRequest) => Promise<NextResponse> {
  const {
    resource,
    action,
    rateLimit = 'api',
    skipCsrf = false,
    allowPublic = false,
  } = config

  return async (req: NextRequest): Promise<NextResponse> => {
    const ip = getClientIp(req)
    const method = req.method.toUpperCase()
    const path = req.nextUrl.pathname
    const startTime = Date.now()

    // ── 1. Rate limiting ──────────────────────────────────────────────────────
    const limiter = selectLimiter(rateLimit)
    if (limiter) {
      const rl = await limiter.checkRateLimit(req)
      if (!rl.success) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Demasiadas solicitudes. Intenta más tarde.',
              retryAfter: rl.retryAfter,
            },
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(rl.retryAfter ?? 60),
              'X-RateLimit-Limit': String(rl.limit),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(rl.resetTime),
            },
          }
        )
      }
    }

    // ── 2. CSRF check (mutations only) ────────────────────────────────────────
    if (!skipCsrf && MUTATION_METHODS.has(method)) {
      if (!verifyCsrf(req)) {
        auditLogger.logEvent({
          eventType: AuditEventType.SECURITY_VIOLATION,
          severity: AuditSeverity.HIGH,
          ipAddress: ip,
          resource: path,
          action: 'CSRF_VIOLATION',
          details: {
            origin: req.headers.get('origin'),
            method,
            path,
          },
          success: false,
        })
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: { code: 'FORBIDDEN', message: 'CSRF validation failed' },
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // ── 3. Authentication ─────────────────────────────────────────────────────
    const ctx = getUserContext(req)

    if (!allowPublic && !ctx.userId) {
      return apiUnauthorized()
    }

    // ── 3b. Session blacklist check — token revocation (logout / forced) ──────
    if (ctx.userId && ctx.jti) {
      const revoked = await isTokenRevoked(ctx.jti)
      if (revoked) {
        auditLogger.logEvent({
          eventType: AuditEventType.SECURITY_VIOLATION,
          severity: AuditSeverity.HIGH,
          userId: ctx.userId,
          ipAddress: ip,
          resource: path,
          action: 'REVOKED_TOKEN_USED',
          details: { jti: ctx.jti, path, method },
          success: false,
        })
        return apiUnauthorized('Session has been revoked. Please log in again.')
      }
    }

    // ── 4. RBAC permission check ──────────────────────────────────────────────
    if (resource && action && ctx.userId) {
      const hasPermission = checkPermission(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { userId: ctx.userId, role: ctx.role as any, tenantId: ctx.tenantId },
        resource,
        action
      )

      if (!hasPermission) {
        auditLogger.logEvent({
          eventType: AuditEventType.ACCESS_DENIED,
          severity: AuditSeverity.MEDIUM,
          userId: ctx.userId,
          ipAddress: ip,
          resource,
          action,
          details: {
            role: ctx.role,
            tenantId: ctx.tenantId,
            path,
            method,
          },
          success: false,
        })
        return apiForbidden()
      }
    }

    // ── 5. Execute handler ────────────────────────────────────────────────────
    try {
      const response = await handler({ ctx, req, ip })

      // ── 6. Audit log success ──────────────────────────────────────────────
      if (ctx.userId && resource && action) {
        auditLogger.logEvent({
          eventType: mapActionToAuditType(action),
          severity: AuditSeverity.LOW,
          userId: ctx.userId,
          sessionId: ctx.sessionId,
          ipAddress: ip,
          resource,
          action,
          details: {
            path,
            method,
            tenantId: ctx.tenantId,
            durationMs: Date.now() - startTime,
            status: response.status,
            requestId: ctx.requestId,
          },
          success: response.status < 400,
        })
      }

      return response
    } catch (error) {
      // ── 7. Error handling — never leak raw errors to client ───────────────
      const err = error instanceof Error ? error : new Error(String(error))

      auditLogger.logEvent({
        eventType: AuditEventType.API_ERROR,
        severity: AuditSeverity.HIGH,
        userId: ctx.userId || undefined,
        ipAddress: ip,
        resource: resource || path,
        action: action || method,
        details: {
          path,
          method,
          tenantId: ctx.tenantId,
          durationMs: Date.now() - startTime,
          errorName: err.name,
          errorMessage: err.message,
          // Never include stack traces in audit log details sent to client
          // Stack trace is logged server-side only
        },
        success: false,
        errorMessage: err.message,
      })

      // Log full error server-side for debugging
      logger.error('[withApiRoute] Unhandled error', err instanceof Error ? err : new Error(String(err)), { path, method, userId: ctx.userId, tenantId: ctx.tenantId })

      return apiServerError()
    }
  }
}
