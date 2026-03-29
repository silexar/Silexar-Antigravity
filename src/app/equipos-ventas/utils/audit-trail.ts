/**
 * UTILITY: AUDIT TRAIL LOGGER (FRONTEND STUB)
 * 
 * @description Registra todas las acciones críticas del usuario para
 * compliance, forensics, y accountability. Logs queued in-memory;
 * in production, flush to backend via POST /api/audit.
 * 
 * ⚠️ PRODUCTION: 
 *   - Flush logs to encrypted backend storage
 *   - Include JWT claims for user identity
 *   - Implement tamper-proof log chain (HMAC)
 *   - Set retention policies per compliance requirements (SOC2, GDPR)
 */

/* ─── TYPES ───────────────────────────────────────────────────── */

export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  details: string;
  severity: AuditSeverity;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
}

/* ─── IN-MEMORY LOG STORE ─────────────────────────────────────── */

const auditLog: AuditEntry[] = [];
const MAX_LOCAL_ENTRIES = 500;

function generateId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

/* ─── LOGGER ──────────────────────────────────────────────────── */

/**
 * Log an auditable action.
 * In production, this would POST to /api/audit with auth headers.
 */
export function logAuditAction(
  action: string,
  resource: string,
  details: string,
  severity: AuditSeverity = 'INFO'
): AuditEntry {
  const entry: AuditEntry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    userId: 'SANDBOX_USER', // In production: from JWT
    action,
    resource,
    details,
    severity,
    ipAddress: '127.0.0.1', // In production: from request
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
    sessionId: 'SANDBOX_SESSION', // In production: from session store
  };

  auditLog.push(entry);

  // Trim oldest entries if over limit
  if (auditLog.length > MAX_LOCAL_ENTRIES) {
    auditLog.splice(0, auditLog.length - MAX_LOCAL_ENTRIES);
  }

  // Console log for dev visibility
  const logFn = severity === 'CRITICAL' ? console.error 
    : severity === 'WARNING' ? console.warn 
    : console.info;
  logFn(`[AUDIT:${severity}] ${action} → ${resource}: ${details}`);

  return entry;
}

/* ─── PREDEFINED AUDIT ACTIONS ────────────────────────────────── */

export const AuditActions = {
  ROLE_SWITCH: 'ROLE_SWITCH',
  DEAL_VIEW: 'DEAL_VIEW',
  DEAL_EDIT: 'DEAL_EDIT',
  COMMISSION_VIEW: 'COMMISSION_VIEW',
  COMMISSION_EXPORT: 'COMMISSION_EXPORT',
  FORECAST_SUBMIT: 'FORECAST_SUBMIT',
  TEAM_CREATE: 'TEAM_CREATE',
  TEAM_MODIFY: 'TEAM_MODIFY',
  SESSION_START: 'SESSION_START',
  SESSION_EXTEND: 'SESSION_EXTEND',
  SESSION_TIMEOUT: 'SESSION_TIMEOUT',
  SECURITY_CONFIG_VIEW: 'SECURITY_CONFIG_VIEW',
  EXPORT_DATA: 'EXPORT_DATA',
  SEARCH_QUERY: 'SEARCH_QUERY',
} as const;

/* ─── READ-ONLY ACCESS ────────────────────────────────────────── */

export function getAuditLog(): ReadonlyArray<AuditEntry> {
  return [...auditLog];
}

export function getAuditLogByAction(action: string): ReadonlyArray<AuditEntry> {
  return auditLog.filter(e => e.action === action);
}

export function getAuditLogBySeverity(severity: AuditSeverity): ReadonlyArray<AuditEntry> {
  return auditLog.filter(e => e.severity === severity);
}
