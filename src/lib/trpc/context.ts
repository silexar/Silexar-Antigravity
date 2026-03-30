/**
 * tRPC Context — Silexar Pulse
 *
 * Builds request context from the incoming JWT (httpOnly cookie or Authorization header).
 * All user data is derived from the verified token — NO hardcoded users.
 *
 * Compatible with trpc.ts which expects: ctx.user, ctx.metrics, ctx.hasPermission(),
 * ctx.hasRole(), ctx.hasConsciousnessLevel(), ctx.isQuantumEnhanced(), ctx.auditLog
 */

import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { type NextRequest } from 'next/server'
import { verifyTokenServer } from '@/lib/api/jwt'
import { auditLogger } from '@/lib/security/audit-logger'
import { AuditEventType, AuditSeverity } from '@/lib/security/audit-types'
import { db } from '@/lib/db'
import rbac from '@/lib/security/rbac'

// ── User shape ─────────────────────────────────────────────────────────────────
// Kept compatible with trpc.ts middleware checks:
//   ctx.user.consciousnessLevel  >= 0.5 / 0.95  → always 1.0
//   ctx.user.quantumEnhanced                     → always true
//   ctx.user.permissions                         → derived from RBAC
export interface QuantumUser {
  id: string
  email: string
  name: string
  role: string
  tenantId: string
  permissions: string[]
  consciousnessLevel: number
  quantumEnhanced: boolean
  securityLevel: string
}

export interface QuantumSession {
  id: string
  userId: string
  token: string
  expiresAt: Date
  consciousnessValidated: boolean
  quantumSecured: boolean
  securityLevel: string
}

interface QuantumContextMetrics {
  requestId: string
  correlationId: string
  startTime: number
  consciousnessLevel: number
  quantumEnhanced: boolean
  securityValidated: boolean
  performanceOptimized: boolean
}

// ── Public context interface ───────────────────────────────────────────────────
export interface TRPCContext {
  req: NextRequest
  res: Response | undefined
  db: typeof db
  user: QuantumUser | null
  session: QuantumSession | null
  metrics: QuantumContextMetrics
  isAuthenticated: boolean
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  hasConsciousnessLevel: (level: number) => boolean
  isQuantumEnhanced: () => boolean
  auditLog: typeof auditLogger
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

function generateCorrelationId(): string {
  const ts = Date.now().toString(36)
  const rnd = Math.random().toString(36).substring(2, 15)
  return `trpc_${ts}_${rnd}`
}

/**
 * Derive flat permission strings from the RBAC matrix for a given role.
 * Returns strings like "campanas:read", "contratos:create", etc.
 */
function permissionsForRole(role: string): string[] {
  const matrix = rbac.ROLE_PERMISSIONS as Record<string, Record<string, string[]>>
  const resourceMap = matrix[role]
  if (!resourceMap) return []

  const perms: string[] = []
  for (const [resource, actions] of Object.entries(resourceMap)) {
    for (const action of actions) {
      perms.push(`${resource}:${action}`)
    }
  }
  return perms
}

// ── Context factory ────────────────────────────────────────────────────────────

export async function createTRPCContext(
  opts: CreateNextContextOptions,
): Promise<TRPCContext> {
  const { req, res } = opts
  const startTime = performance.now()

  const metrics: QuantumContextMetrics = {
    requestId: generateRequestId(),
    correlationId: generateCorrelationId(),
    startTime,
    consciousnessLevel: 0,
    quantumEnhanced: false,
    securityValidated: false,
    performanceOptimized: false,
  }

  let user: QuantumUser | null = null
  let session: QuantumSession | null = null

  try {
    // 1. Extract token — Authorization header OR silexar_session cookie
    const authHeader =
      req.headers.authorization ??
      (req.headers as unknown as Record<string, string>)['authorization']

    const cookieHeader =
      (req.headers as unknown as Record<string, string>)['cookie'] ?? ''

    let token: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7)
    } else {
      // Parse cookie header for silexar_session
      const match = cookieHeader.match(/(?:^|;\s*)silexar_session=([^;]+)/)
      if (match) token = decodeURIComponent(match[1])
    }

    if (token) {
      // 2. Verify token using the canonical jose-based verifier
      const payload = await verifyTokenServer(token)

      if (payload) {
        const role = payload.role ?? 'USER'
        const permissions = permissionsForRole(role)

        user = {
          id: payload.userId,
          email: payload.email,
          name: payload.email, // name is not in JWT — use email until profile DB query
          role,
          tenantId: payload.tenantId,
          permissions,
          // Legacy fields required by trpc.ts middleware gates — fixed values
          consciousnessLevel: 1.0,
          quantumEnhanced: true,
          securityLevel: 'standard',
        }

        session = {
          id: payload.sessionId,
          userId: payload.userId,
          token,
          expiresAt: new Date((payload.exp ?? 0) * 1000),
          consciousnessValidated: true,
          quantumSecured: true,
          securityLevel: 'standard',
        }

        metrics.consciousnessLevel = 1.0
        metrics.quantumEnhanced = true
        metrics.securityValidated = true
      } else {
        // Token present but invalid/expired
        auditLogger.logEvent({
          eventType: AuditEventType.LOGIN_FAILURE,
          severity: AuditSeverity.MEDIUM,
          resource: 'TRPC_AUTH',
          action: 'TOKEN_INVALID',
          details: { correlationId: metrics.correlationId },
          success: false,
        })
      }
    }

    metrics.performanceOptimized = performance.now() - startTime < 5

    return {
      req: req as unknown as NextRequest,
      res: res as unknown as Response,
      db,
      user,
      session,
      metrics,
      isAuthenticated: !!user,
      hasPermission: (permission: string) => {
        if (!user) return false
        return (
          user.permissions.includes(permission) ||
          user.role === 'SUPER_CEO' ||
          user.role === 'ADMIN'
        )
      },
      hasRole: (role: string) => {
        if (!user) return false
        return user.role === role
      },
      hasConsciousnessLevel: (_level: number) => !!user, // always true for authenticated users
      isQuantumEnhanced: () => !!user,
      auditLog: auditLogger,
    }
  } catch (error) {
    auditLogger.logEvent({
      eventType: AuditEventType.SYSTEM_STOP,
      severity: AuditSeverity.CRITICAL,
      resource: 'TRPC_CONTEXT',
      action: 'CONTEXT_CREATION_FAILED',
      details: {
        error: (error as Error).message,
        correlationId: metrics.correlationId,
      },
      success: false,
    })

    return {
      req: req as unknown as NextRequest,
      res: res as unknown as Response,
      db,
      user: null,
      session: null,
      metrics,
      isAuthenticated: false,
      hasPermission: () => false,
      hasRole: () => false,
      hasConsciousnessLevel: () => false,
      isQuantumEnhanced: () => false,
      auditLog: auditLogger,
    }
  }
}

export type { QuantumContextMetrics }
