
/**
 * Incident Response Playbook — Prompt Injection Attack (L2/L5 detection)
 *
 * Triggered when the input filter (L2) or AI Judge (L5) blocks a request.
 * Implements the D6 playbook from CLAUDE.md:
 *   - Auto: log event, increment user risk score, apply rate limit
 *   - If same user > 3 blocks in 1h: auto-suspend account, alert admin
 *   - Resolution: document in incident log, update patterns if new variant
 */

import { logger } from '@/lib/observability'
import { auditLogger } from '@/lib/security/audit-logger'
import { AuditEventType, AuditSeverity } from '@/lib/security/audit-types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PromptInjectionEvent {
  userId: string
  tenantId: string
  ipAddress: string
  sessionId?: string
  detectionLayer: 'L2_REGEX' | 'L5_JUDGE'
  riskScore: number           // 0-100 from L2/L5
  inputSnippet: string        // First 200 chars — never full input (GDPR)
  detectedPattern?: string    // Which regex pattern triggered, or Judge's reasoning
  conversationTurn?: number   // For multi-turn attack tracking
}

export interface PromptInjectionResult {
  action: 'LOGGED' | 'FLAGGED' | 'SUSPENDED'
  suspendUser: boolean
  notifyAdmin: boolean
  incidentId: string
  blockCountInWindow: number
}

// ─── In-memory sliding window: blocks per userId in last 1h ──────────────────
// Keyed by userId → list of UTC timestamps (epoch ms) of each block

const blockWindow = new Map<string, number[]>()

const WINDOW_MS = 60 * 60 * 1000   // 1 hour
const SUSPEND_THRESHOLD = 3         // blocks in 1h → suspend

function getBlocksInWindow(userId: string): number[] {
  const cutoff = Date.now() - WINDOW_MS
  const blocks = (blockWindow.get(userId) ?? []).filter(t => t >= cutoff)
  blockWindow.set(userId, blocks)
  return blocks
}

function recordBlock(userId: string): number {
  const blocks = getBlocksInWindow(userId)
  blocks.push(Date.now())
  blockWindow.set(userId, blocks)
  return blocks.length
}

// ─── Playbook ─────────────────────────────────────────────────────────────────

/**
 * Handle a detected prompt injection attempt.
 * Call this immediately after L2 or L5 blocks a request.
 */
export function handlePromptInjection(event: PromptInjectionEvent): PromptInjectionResult {
  const incidentId = `pi_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`
  const blockCount = recordBlock(event.userId)

  const shouldSuspend = blockCount >= SUSPEND_THRESHOLD
  const severity = shouldSuspend ? AuditSeverity.CRITICAL : AuditSeverity.HIGH

  // ── Step 1: Structured audit log ─────────────────────────────────────────
  auditLogger.logEvent({
    eventType: AuditEventType.SECURITY_VIOLATION,
    severity,
    userId: event.userId,
    sessionId: event.sessionId,
    ipAddress: event.ipAddress,
    resource: 'AI_SECURITY',
    action: 'PROMPT_INJECTION_BLOCKED',
    details: {
      incidentId,
      detectionLayer: event.detectionLayer,
      riskScore: event.riskScore,
      tenantId: event.tenantId,
      inputSnippet: event.inputSnippet.slice(0, 200),
      detectedPattern: event.detectedPattern,
      conversationTurn: event.conversationTurn,
      blockCountInWindow: blockCount,
      willSuspend: shouldSuspend,
    },
    success: false,
    errorMessage: `Prompt injection blocked by ${event.detectionLayer} (score=${event.riskScore})`,
  })

  // ── Step 2: Structured log for SIEM pipeline ─────────────────────────────
  logger.warn('[IncidentResponse] Prompt injection blocked', {
    event: 'PROMPT_INJECTION_DETECTED',
    incidentId,
    userId: event.userId,
    tenantId: event.tenantId,
    detectionLayer: event.detectionLayer,
    riskScore: event.riskScore,
    blockCountInWindow: blockCount,
    suspendTriggered: shouldSuspend,
    severity,
  })

  // ── Step 3: Suspension — if threshold exceeded ────────────────────────────
  if (shouldSuspend) {
    logger.error('[IncidentResponse] 🚨 User auto-suspended — prompt injection threshold exceeded', {
      event: 'USER_AUTO_SUSPENDED',
      incidentId,
      userId: event.userId,
      tenantId: event.tenantId,
      reason: `${blockCount} prompt injection blocks in 1h (threshold=${SUSPEND_THRESHOLD})`,
      severity: 'CRITICAL',
    })

    // NOTE: Actual DB suspension must be done by the calling API route.
    // This playbook records the decision and returns suspendUser=true.
    // The route then executes: db.update(users).set({ status: 'suspended', ... })
  }

  return {
    action: shouldSuspend ? 'SUSPENDED' : blockCount >= 2 ? 'FLAGGED' : 'LOGGED',
    suspendUser: shouldSuspend,
    notifyAdmin: shouldSuspend || blockCount >= 2,
    incidentId,
    blockCountInWindow: blockCount,
  }
}

/**
 * Query how many times a user has been blocked in the current 1h window.
 * Useful for dashboards and L7 anomaly detection.
 */
export function getPromptInjectionBlockCount(userId: string): number {
  return getBlocksInWindow(userId).length
}
