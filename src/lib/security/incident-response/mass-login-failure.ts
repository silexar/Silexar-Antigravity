// @ts-nocheck

/**
 * Incident Response Playbook — Mass Login Failure (Credential Stuffing)
 *
 * Triggered when login failures from an IP or for an account exceed thresholds.
 * Implements the D6 playbook from CLAUDE.md:
 *   - Auto: account lockout after 5 attempts (15 min)
 *   - Auto: IP rate limit at edge (20 req/min per IP)
 *   - If > 100 failures in 5 min from one IP → block IP at edge
 *   - Alert: admin notification, consider Cloudflare WAF rule
 */

import { logger } from '@/lib/observability'
import { auditLogger } from '@/lib/security/audit-logger'
import { AuditEventType, AuditSeverity } from '@/lib/security/audit-types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoginFailureEvent {
  ipAddress: string
  email: string
  userId?: string          // Populated if account exists
  tenantId?: string
  sessionId?: string
  reason: 'INVALID_PASSWORD' | 'ACCOUNT_NOT_FOUND' | 'ACCOUNT_LOCKED' | 'MFA_FAILED'
  userAgent?: string
}

export interface LoginFailureResult {
  incidentId: string
  /** How many times this IP has failed in the current window */
  ipFailureCount: number
  /** How many times this account has failed */
  accountFailureCount: number
  /** Should the account be locked (threshold reached)? */
  lockAccount: boolean
  /** Lock duration in minutes */
  lockDurationMinutes: number
  /** Should an IP-level block be requested (for WAF/edge)? */
  blockIp: boolean
  notifyAdmin: boolean
}

// ─── Sliding-window counters ──────────────────────────────────────────────────

interface FailureWindow {
  timestamps: number[]
}

const ipFailures   = new Map<string, FailureWindow>()
const acctFailures = new Map<string, FailureWindow>()

// Per-account: 5 failures in 15 min → lock for 15 min
// Per-account: 10 failures in 1h   → lock for 60 min + alert
const ACCOUNT_LOCK_THRESHOLD_1  = 5
const ACCOUNT_LOCK_WINDOW_1_MS  = 15 * 60 * 1000   // 15 min
const ACCOUNT_LOCK_DURATION_1_MIN = 15

const ACCOUNT_LOCK_THRESHOLD_2  = 10
const ACCOUNT_LOCK_WINDOW_2_MS  = 60 * 60 * 1000   // 1h
const ACCOUNT_LOCK_DURATION_2_MIN = 60

// Per-IP: 100 failures in 5 min → WAF block recommendation
const IP_BLOCK_THRESHOLD = 100
const IP_BLOCK_WINDOW_MS = 5 * 60 * 1000   // 5 min

function countInWindow(store: Map<string, FailureWindow>, key: string, windowMs: number): number {
  const cutoff = Date.now() - windowMs
  const w = store.get(key) ?? { timestamps: [] }
  const fresh = w.timestamps.filter(t => t >= cutoff)
  fresh.push(Date.now())
  store.set(key, { timestamps: fresh })
  return fresh.length
}

// ─── Playbook ─────────────────────────────────────────────────────────────────

/**
 * Handle a single login failure event.
 * Returns decisions — the API route executes them (DB lockout, WAF call, etc.).
 */
export function handleLoginFailure(event: LoginFailureEvent): LoginFailureResult {
  const incidentId = `lf_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`

  const ipCount    = countInWindow(ipFailures,   event.ipAddress,       IP_BLOCK_WINDOW_MS)
  const acctCount1 = countInWindow(acctFailures, event.email,           ACCOUNT_LOCK_WINDOW_1_MS)
  // Second window check (re-count within 1h): reuse the already-incremented store
  const acctTimestamps = acctFailures.get(event.email)?.timestamps ?? []
  const acctCount2 = acctTimestamps.filter(t => t >= Date.now() - ACCOUNT_LOCK_WINDOW_2_MS).length

  const lockAccount = acctCount1 >= ACCOUNT_LOCK_THRESHOLD_1 || acctCount2 >= ACCOUNT_LOCK_THRESHOLD_2
  const lockDuration = acctCount2 >= ACCOUNT_LOCK_THRESHOLD_2
    ? ACCOUNT_LOCK_DURATION_2_MIN
    : ACCOUNT_LOCK_DURATION_1_MIN
  const blockIp      = ipCount >= IP_BLOCK_THRESHOLD
  const notifyAdmin  = lockAccount || blockIp || acctCount2 >= ACCOUNT_LOCK_THRESHOLD_2

  const severity = blockIp || acctCount2 >= ACCOUNT_LOCK_THRESHOLD_2
    ? AuditSeverity.CRITICAL
    : lockAccount
    ? AuditSeverity.HIGH
    : AuditSeverity.MEDIUM

  // ── Audit log ─────────────────────────────────────────────────────────────
  auditLogger.logEvent({
    eventType: AuditEventType.LOGIN_FAILURE,
    severity,
    userId: event.userId,
    userEmail: event.email,
    ipAddress: event.ipAddress,
    sessionId: event.sessionId,
    resource: 'AUTH_SYSTEM',
    action: 'LOGIN_FAILURE',
    details: {
      incidentId,
      reason: event.reason,
      ipFailureCount: ipCount,
      accountFailureCount: acctCount1,
      accountFailureCount1h: acctCount2,
      lockAccount,
      lockDurationMinutes: lockDuration,
      blockIp,
      userAgent: event.userAgent,
    },
    success: false,
    errorMessage: event.reason,
  })

  // ── Structured log for SIEM ───────────────────────────────────────────────
  const logLevel = severity === AuditSeverity.CRITICAL ? 'error' : 'warn'

  logger[logLevel](`[IncidentResponse] Login failure ${lockAccount ? '— ACCOUNT LOCKED' : ''}${blockIp ? ' — IP BLOCK RECOMMENDED' : ''}`, {
    event: 'LOGIN_FAILURE',
    incidentId,
    email: event.email,
    ipAddress: event.ipAddress,
    ipFailureCount: ipCount,
    accountFailureCount: acctCount1,
    lockAccount,
    lockDurationMinutes: lockDuration,
    blockIp,
    severity,
  })

  if (blockIp) {
    logger.error('[IncidentResponse] 🚨 CRITICAL: Mass login failures — IP block recommended', {
      event: 'MASS_LOGIN_FAILURE_IP_BLOCK',
      incidentId,
      ipAddress: event.ipAddress,
      failuresInWindow: ipCount,
      windowMinutes: IP_BLOCK_WINDOW_MS / 60_000,
      recommendation: 'ADD_CLOUDFLARE_WAF_RULE',
      severity: 'CRITICAL',
    })
  }

  return {
    incidentId,
    ipFailureCount: ipCount,
    accountFailureCount: acctCount1,
    lockAccount,
    lockDurationMinutes: lockDuration,
    blockIp,
    notifyAdmin,
  }
}

/**
 * Reset failure counters for a user on successful login.
 * Call this from the login success path.
 */
export function resetLoginFailures(email: string): void {
  acctFailures.delete(email)
}
