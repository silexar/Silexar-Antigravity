
/**
 * Incident Response Playbook — Cross-Tenant Data Access Attempt
 *
 * Triggered when a user attempts to access data belonging to another tenant.
 * Even though RLS (L3) blocks at the DB engine level, the attempt itself
 * is a CRITICAL security event requiring immediate admin notification.
 *
 * D6 playbook from CLAUDE.md:
 *   - Auto: RLS blocks at DB level, query fails silently to user
 *   - Log: CRITICAL security event with full query context
 *   - Alert: immediate notification to SUPER_CEO
 *   - Investigation: audit which data was attempted, check for exfiltration
 */

import { logger } from '@/lib/observability'
import { auditLogger } from '@/lib/security/audit-logger'
import { AuditEventType, AuditSeverity } from '@/lib/security/audit-types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CrossTenantAttemptEvent {
  /** JWT-derived tenant — who the user ACTUALLY belongs to */
  authenticatedTenantId: string
  /** Tenant the user tried to access */
  targetTenantId: string
  userId: string
  userRole: string
  ipAddress: string
  sessionId?: string
  /** API endpoint or DB operation that was attempted */
  resource: string
  /** HTTP method or query type */
  action: string
  /** Optional: partial query details for forensics (no PII values) */
  queryContext?: Record<string, unknown>
}

export interface CrossTenantAttemptResult {
  incidentId: string
  action: 'BLOCKED_AND_LOGGED'
  notifyAdmin: boolean
  /** True if this userId has attempted cross-tenant access before in this session */
  repeatOffender: boolean
}

// ─── Repeat-offender tracking (per session, in-memory) ───────────────────────

const sessionOffenders = new Map<string, number>() // sessionId → count

function trackSession(sessionId: string | undefined): number {
  if (!sessionId) return 1
  const count = (sessionOffenders.get(sessionId) ?? 0) + 1
  sessionOffenders.set(sessionId, count)
  // Auto-cleanup after 1h to avoid memory growth
  if (count === 1) {
    setTimeout(() => sessionOffenders.delete(sessionId), 60 * 60 * 1000)
  }
  return count
}

// ─── Playbook ─────────────────────────────────────────────────────────────────

/**
 * Handle a detected cross-tenant access attempt.
 *
 * RLS already blocked the query — this function records the incident
 * and returns metadata the caller uses to decide on further action.
 *
 * IMPORTANT: Never expose the reason to the user response.
 * Return a generic 404 or 403 from the API route; log internally only.
 */
export function handleCrossTenantAttempt(event: CrossTenantAttemptEvent): CrossTenantAttemptResult {
  const incidentId = `ct_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`
  const attemptCount = trackSession(event.sessionId)
  const repeatOffender = attemptCount > 1

  // ── Step 1: CRITICAL audit log ────────────────────────────────────────────
  auditLogger.logEvent({
    eventType: AuditEventType.SECURITY_VIOLATION,
    severity: AuditSeverity.CRITICAL,
    userId: event.userId,
    sessionId: event.sessionId,
    ipAddress: event.ipAddress,
    resource: event.resource,
    action: event.action,
    details: {
      incidentId,
      type: 'CROSS_TENANT_ACCESS_ATTEMPT',
      authenticatedTenantId: event.authenticatedTenantId,
      targetTenantId: event.targetTenantId,
      userRole: event.userRole,
      repeatOffender,
      attemptCount,
      queryContext: event.queryContext,
      rlsBlocked: true,
    },
    success: false,
    errorMessage: `Cross-tenant access attempt: authenticated=${event.authenticatedTenantId} target=${event.targetTenantId}`,
  })

  // ── Step 2: CRITICAL structured log → SIEM / immediate alert ─────────────
  logger.error('[IncidentResponse] 🚨 CRITICAL: Cross-tenant data access attempt detected', {
    event: 'CROSS_TENANT_ACCESS_ATTEMPT',
    incidentId,
    userId: event.userId,
    authenticatedTenantId: event.authenticatedTenantId,
    targetTenantId: event.targetTenantId,
    userRole: event.userRole,
    resource: event.resource,
    action: event.action,
    repeatOffender,
    attemptCount,
    severity: 'CRITICAL',
    // Ops team should see this immediately in Grafana / Kibana / Sentry
    alert: 'NOTIFY_SUPER_CEO',
  })

  // ── Step 3: Repeat offender escalation ───────────────────────────────────
  if (repeatOffender) {
    logger.error('[IncidentResponse] 🚨 CRITICAL: Repeat cross-tenant offender — manual review required', {
      event: 'CROSS_TENANT_REPEAT_OFFENDER',
      incidentId,
      userId: event.userId,
      attemptCount,
      severity: 'CRITICAL',
      recommendation: 'IMMEDIATE_ACCOUNT_REVIEW',
    })
  }

  return {
    incidentId,
    action: 'BLOCKED_AND_LOGGED',
    notifyAdmin: true,          // Always notify on cross-tenant attempts
    repeatOffender,
  }
}
