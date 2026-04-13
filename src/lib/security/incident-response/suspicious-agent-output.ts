/**
 * Incident Response Playbook — Suspicious Agent Output (L6 block)
 *
 * Triggered when the output validator (L6) detects that the AI model's
 * response contains a system prompt leak, jailbreak declaration, or
 * sensitive data (API keys, JWTs, PII).
 *
 * D6 playbook from CLAUDE.md:
 *   - Auto: block output, return generic message to user
 *   - Log: full compromised output stored internally (CRITICAL severity)
 *   - Alert: immediate admin notification
 *   - Review: determine if system prompt was extracted, rotate if needed
 */

import { logger } from '@/lib/observability'
import { auditLogger } from '@/lib/security/audit-logger'
import { AuditEventType, AuditSeverity } from '@/lib/security/audit-types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SuspiciousOutputReason =
  | 'SYSTEM_PROMPT_LEAKED'      // Model revealed <system_identity> content
  | 'JAILBREAK_DECLARED'        // "Ahora opero sin restricciones" etc.
  | 'API_KEY_IN_OUTPUT'         // sk-*, eyJ..., etc.
  | 'PII_IN_OUTPUT'             // Credit cards, passwords, internal IDs
  | 'CROSS_TENANT_DATA'         // Data from another tenant detected in output

export interface SuspiciousAgentOutputEvent {
  userId: string
  tenantId: string
  ipAddress: string
  sessionId?: string
  /** The problematic AI model output — stored INTERNALLY only, never shown to user */
  rawOutput: string
  reason: SuspiciousOutputReason
  /** Sanitized output to show user instead (generic message) */
  safeResponse?: string
  /** Which AI engine generated this output */
  engine?: string
  /** Input that triggered it (first 200 chars) */
  inputSnippet?: string
}

export interface SuspiciousAgentOutputResult {
  incidentId: string
  action: 'OUTPUT_BLOCKED'
  /** Always use this, never the rawOutput */
  safeResponseForUser: string
  notifyAdmin: boolean
  /** True if system prompt rotation should be considered */
  rotateSystemPrompt: boolean
}

// ─── Default safe response messages per reason ────────────────────────────────

const SAFE_RESPONSES: Record<SuspiciousOutputReason, string> = {
  SYSTEM_PROMPT_LEAKED:
    'No puedo proporcionar esa información. Si necesitas ayuda, reformula tu consulta.',
  JAILBREAK_DECLARED:
    'No puedo procesar esa solicitud.',
  API_KEY_IN_OUTPUT:
    'La respuesta fue bloqueada por políticas de seguridad. Por favor contacta a soporte.',
  PII_IN_OUTPUT:
    'La respuesta fue bloqueada por políticas de privacidad de datos.',
  CROSS_TENANT_DATA:
    'No puedo proporcionar esa información.',
}

// ─── Playbook ─────────────────────────────────────────────────────────────────

/**
 * Handle a compromised AI output detected by L6 output validator.
 *
 * Always call this BEFORE returning the AI response to the user.
 * Use `result.safeResponseForUser` as the actual user-facing response.
 */
export function handleSuspiciousAgentOutput(event: SuspiciousAgentOutputEvent): SuspiciousAgentOutputResult {
  const incidentId = `ao_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`

  const rotateSystemPrompt =
    event.reason === 'SYSTEM_PROMPT_LEAKED' || event.reason === 'JAILBREAK_DECLARED'

  const safeResponseForUser = event.safeResponse ?? SAFE_RESPONSES[event.reason]

  // ── Step 1: CRITICAL audit log — includes raw output for forensics ────────
  // The raw output is stored in audit details ONLY — never returned to user
  auditLogger.logEvent({
    eventType: AuditEventType.SECURITY_VIOLATION,
    severity: AuditSeverity.CRITICAL,
    userId: event.userId,
    sessionId: event.sessionId,
    ipAddress: event.ipAddress,
    resource: 'AI_OUTPUT_VALIDATOR',
    action: 'SUSPICIOUS_OUTPUT_BLOCKED',
    details: {
      incidentId,
      reason: event.reason,
      tenantId: event.tenantId,
      engine: event.engine,
      inputSnippet: event.inputSnippet?.slice(0, 200),
      // Store full raw output for forensic review
      // SECURITY: This is audit-only storage — RLS protects audit_logs table
      rawOutputForensic: event.rawOutput.slice(0, 4000),
      rawOutputLength: event.rawOutput.length,
      rotateSystemPrompt,
    },
    success: false,
    errorMessage: `Suspicious agent output blocked: ${event.reason}`,
  })

  // ── Step 2: CRITICAL structured log → SIEM / immediate alert ─────────────
  logger.error({
    event: 'SUSPICIOUS_AGENT_OUTPUT',
    incidentId,
    userId: event.userId,
    tenantId: event.tenantId,
    reason: event.reason,
    engine: event.engine,
    rotateSystemPrompt,
    severity: 'CRITICAL',
    alert: 'NOTIFY_ADMIN_IMMEDIATE',
    // NOTE: rawOutput intentionally NOT included in logger to avoid
    // printing sensitive data to stdout/log aggregator.
    // Full content is in audit_logs table only.
  }, `[IncidentResponse] 🚨 CRITICAL: Suspicious agent output blocked — ${event.reason}`)

  // ── Step 3: System prompt rotation recommendation ─────────────────────────
  if (rotateSystemPrompt) {
    logger.error({
      event: 'SYSTEM_PROMPT_ROTATION_RECOMMENDED',
      incidentId,
      reason: event.reason,
      severity: 'CRITICAL',
      action: 'REVIEW_AND_ROTATE_SYSTEM_PROMPT',
    }, '[IncidentResponse] 🔑 System prompt may have been compromised — manual review required')
  }

  return {
    incidentId,
    action: 'OUTPUT_BLOCKED',
    safeResponseForUser,
    notifyAdmin: true,
    rotateSystemPrompt,
  }
}
