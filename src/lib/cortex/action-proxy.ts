/**
 * L8 — Zero Trust Action Proxy (least privilege for AI agents)
 *
 * ALL Wil/Cortex agent actions MUST pass through this proxy before execution.
 * The agent NEVER holds direct database credentials or broad API access.
 *
 * Pre-execution checks (in order):
 *   1. Action type is in the allowedActions whitelist for the authenticated role
 *   2. Action's tenantId matches the JWT-authenticated tenantId (never overridable by agent)
 *   3. Hourly rate limit not exceeded
 *   4. Daily rate limit not exceeded
 *   5. Audit trail written BEFORE the action executes
 *   6. Execute action handler
 *   7. Audit trail updated with result
 *
 * Fail secure: unknown check failure → deny, log CRITICAL, return generic "Action denied".
 * The agent code NEVER learns why — prevents enumeration attacks.
 *
 * Permitted action types (read + notify + generate only — NEVER destructive):
 *   read_contacts, read_campaigns, read_contracts, send_notification,
 *   generate_report, read_cunas, read_analytics, read_vencimientos,
 *   read_anunciantes, read_emisoras, read_dashboard_metrics, read_reports,
 *   create_draft_proposal, search_knowledge_base, analyze_performance
 *
 * NEVER delegated to agents (hardcoded deny-list):
 *   delete_*, drop_*, alter_*, cross_tenant_read, update_user_role,
 *   disable_rls, read_secrets, execute_raw_sql
 */

import { logger } from '@/lib/observability'
import { auditLogger } from '@/lib/security/audit-logger'
import { AuditEventType } from '@/lib/security/audit-types'
import { globalCache } from '@/lib/cache/redis-cache'

// ─── Action Type Registry ─────────────────────────────────────────────────────

/**
 * Every action an AI agent may request.
 * Extend this union when adding new capabilities — never widen to `string`.
 */
export type AgentActionType =
  | 'read_contacts'
  | 'read_campaigns'
  | 'read_contracts'
  | 'read_cunas'
  | 'read_vencimientos'
  | 'read_anunciantes'
  | 'read_emisoras'
  | 'read_dashboard_metrics'
  | 'read_reports'
  | 'read_analytics'
  | 'generate_report'
  | 'send_notification'
  | 'create_draft_proposal'
  | 'search_knowledge_base'
  | 'analyze_performance'

/** Actions that can never be delegated, regardless of role */
const ALWAYS_FORBIDDEN = new Set<string>([
  'delete_campaign',
  'delete_contract',
  'delete_cuna',
  'delete_user',
  'drop_table',
  'alter_schema',
  'cross_tenant_read',
  'update_user_role',
  'disable_rls',
  'read_secrets',
  'execute_raw_sql',
  'truncate_table',
])

// ─── AgentAction Discriminated Union ─────────────────────────────────────────

export type AgentAction =
  | { type: 'read_contacts';        tenantId: string; filter?: string }
  | { type: 'read_campaigns';       tenantId: string; filter?: string }
  | { type: 'read_contracts';       tenantId: string; filter?: string }
  | { type: 'read_cunas';           tenantId: string; filter?: string }
  | { type: 'read_vencimientos';    tenantId: string; filter?: string }
  | { type: 'read_anunciantes';     tenantId: string; filter?: string }
  | { type: 'read_emisoras';        tenantId: string; filter?: string }
  | { type: 'read_dashboard_metrics'; tenantId: string }
  | { type: 'read_reports';         tenantId: string; filter?: string }
  | { type: 'read_analytics';       tenantId: string; period?: string }
  | { type: 'generate_report';      tenantId: string; reportType: 'campaigns' | 'contracts' | 'billing' | 'expiry' }
  | { type: 'send_notification';    tenantId: string; userId: string; message: string }
  | { type: 'create_draft_proposal'; tenantId: string; payload?: Record<string, unknown> }
  | { type: 'search_knowledge_base'; tenantId: string; query?: string }
  | { type: 'analyze_performance';  tenantId: string; period?: string }

// ─── Per-Role Permissions ─────────────────────────────────────────────────────

interface ActionPermissions {
  allowedActions: AgentActionType[]
  maxActionsPerHour: number
  maxActionsPerDay: number
}

/**
 * Defines what each role's AI agent is permitted to do.
 * Roles not listed here receive the minimal "other" fallback set.
 */
const ROLE_PERMISSIONS: Record<string, ActionPermissions> = {
  SUPER_CEO: {
    allowedActions: [
      'read_contacts', 'read_campaigns', 'read_contracts', 'read_cunas',
      'read_vencimientos', 'read_anunciantes', 'read_emisoras',
      'read_dashboard_metrics', 'read_reports', 'read_analytics',
      'generate_report', 'send_notification', 'create_draft_proposal',
      'search_knowledge_base', 'analyze_performance',
    ],
    maxActionsPerHour: 100,
    maxActionsPerDay: 500,
  },
  ADMIN: {
    allowedActions: [
      'read_contacts', 'read_campaigns', 'read_contracts', 'read_cunas',
      'read_vencimientos', 'read_anunciantes', 'read_emisoras',
      'read_dashboard_metrics', 'read_reports', 'read_analytics',
      'generate_report', 'send_notification', 'create_draft_proposal',
      'search_knowledge_base', 'analyze_performance',
    ],
    maxActionsPerHour: 50,
    maxActionsPerDay: 200,
  },
  CLIENT_ADMIN: {
    allowedActions: [
      'read_campaigns', 'read_contracts', 'read_cunas',
      'read_vencimientos', 'read_anunciantes', 'read_emisoras',
      'read_dashboard_metrics', 'read_analytics',
      'generate_report', 'create_draft_proposal',
      'search_knowledge_base', 'analyze_performance',
    ],
    maxActionsPerHour: 30,
    maxActionsPerDay: 100,
  },
  GERENTE_VENTAS: {
    allowedActions: [
      'read_campaigns', 'read_contracts', 'read_vencimientos',
      'read_anunciantes', 'read_dashboard_metrics', 'read_analytics',
      'generate_report', 'create_draft_proposal',
      'search_knowledge_base', 'analyze_performance',
    ],
    maxActionsPerHour: 20,
    maxActionsPerDay: 80,
  },
  EJECUTIVO_VENTAS: {
    allowedActions: [
      'read_campaigns', 'read_contracts', 'read_vencimientos',
      'read_anunciantes', 'create_draft_proposal', 'search_knowledge_base',
    ],
    maxActionsPerHour: 15,
    maxActionsPerDay: 50,
  },
  EJECUTIVO: {
    allowedActions: [
      'read_campaigns', 'read_contracts', 'read_anunciantes',
      'create_draft_proposal', 'search_knowledge_base',
    ],
    maxActionsPerHour: 15,
    maxActionsPerDay: 50,
  },
  OPERADOR_EMISION: {
    allowedActions: [
      'read_cunas', 'read_vencimientos', 'read_emisoras', 'search_knowledge_base',
    ],
    maxActionsPerHour: 10,
    maxActionsPerDay: 40,
  },
  PROGRAMADOR: {
    allowedActions: [
      'read_cunas', 'read_emisoras', 'search_knowledge_base',
    ],
    maxActionsPerHour: 10,
    maxActionsPerDay: 40,
  },
  FINANCIERO: {
    allowedActions: [
      'read_contracts', 'read_reports', 'read_analytics',
      'generate_report', 'search_knowledge_base',
    ],
    maxActionsPerHour: 10,
    maxActionsPerDay: 40,
  },
  AGENCIA: {
    allowedActions: ['read_campaigns', 'search_knowledge_base'],
    maxActionsPerHour: 10,
    maxActionsPerDay: 30,
  },
  ANUNCIANTE: {
    allowedActions: ['read_campaigns', 'search_knowledge_base'],
    maxActionsPerHour: 10,
    maxActionsPerDay: 30,
  },
  VIEWER: {
    allowedActions: ['search_knowledge_base', 'read_analytics'],
    maxActionsPerHour: 5,
    maxActionsPerDay: 20,
  },
}

/** Minimal fallback for unrecognised roles */
const FALLBACK_PERMISSIONS: ActionPermissions = {
  allowedActions: ['search_knowledge_base'],
  maxActionsPerHour: 5,
  maxActionsPerDay: 10,
}

// ─── Action Result ────────────────────────────────────────────────────────────

export interface ActionResult {
  success: boolean
  data?: unknown
  /**
   * Only populated on success.
   * On failure, callers always receive "Action denied" — no reason is exposed.
   */
  auditId: string
}

// ─── Zero Trust Action Proxy ──────────────────────────────────────────────────

export class ZeroTrustActionProxy {
  // ── Rate limit helpers ──────────────────────────────────────────────────

  private async checkAndIncrementHourly(userId: string, actionType: AgentActionType, limit: number): Promise<boolean> {
    const hourKey = `action:hourly:${userId}:${actionType}`
    const hourlyCount = (await globalCache.get<number>(hourKey)) || 0
    if (hourlyCount >= limit) return false
    await globalCache.set(hourKey, hourlyCount + 1, 3_600_000)
    return true
  }

  private async checkAndIncrementDaily(userId: string, limit: number): Promise<boolean> {
    const dayKey = `action:daily:${userId}`
    const dailyCount = (await globalCache.get<number>(dayKey)) || 0
    if (dailyCount >= limit) return false
    await globalCache.set(dayKey, dailyCount + 1, 86_400_000)
    return true
  }

  // ── Core execution ──────────────────────────────────────────────────────

  /**
   * Execute an agent action through the zero-trust proxy.
   *
   * @param userId    - Authenticated user ID from the JWT (NEVER from the agent)
   * @param tenantId  - Authenticated tenant ID from the JWT (NEVER from the agent)
   * @param userRole  - User's role from the JWT
   * @param action    - The action the agent wants to execute
   *
   * On any validation failure the caller receives only `{ success: false, auditId }`.
   * The specific denial reason is logged internally but never sent back to the agent.
   */
  async execute(params: {
    userId: string
    tenantId: string
    userRole: string
    action: AgentAction
  }): Promise<ActionResult> {
    const { userId, tenantId, userRole, action } = params
    const auditId = `agent-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    const { type } = action

    // ── 0. Hard-deny always-forbidden actions ──────────────────────────────
    if (ALWAYS_FORBIDDEN.has(type)) {
      await this.logViolation(userId, tenantId, userRole, type, auditId, 'Attempted always-forbidden action')
      return { success: false, auditId }
    }

    // ── 1. Role allowlist check ────────────────────────────────────────────
    const permissions = ROLE_PERMISSIONS[userRole] ?? FALLBACK_PERMISSIONS
    const allowed = new Set<AgentActionType>(permissions.allowedActions)

    if (!allowed.has(type)) {
      await this.logViolation(userId, tenantId, userRole, type, auditId, `Action not permitted for role ${userRole}`)
      return { success: false, auditId }
    }

    // ── 2. Tenant scope enforcement ────────────────────────────────────────
    // The action carries its own tenantId field (set by the agent).
    // We verify it matches the JWT-derived tenantId. This prevents a
    // compromised agent from reading another tenant's data even if the
    // role check passes.
    if (action.tenantId !== tenantId) {
      await this.logViolation(userId, tenantId, userRole, type, auditId, 'Tenant mismatch: action tenantId does not match authenticated tenantId')
      return { success: false, auditId }
    }

    // ── 3. Hourly rate limit ───────────────────────────────────────────────
    if (!await this.checkAndIncrementHourly(userId, type, permissions.maxActionsPerHour)) {
      await this.logViolation(userId, tenantId, userRole, type, auditId, 'Hourly rate limit exceeded')
      return { success: false, auditId }
    }

    // ── 4. Daily rate limit ────────────────────────────────────────────────
    if (!await this.checkAndIncrementDaily(userId, permissions.maxActionsPerDay)) {
      await this.logViolation(userId, tenantId, userRole, type, auditId, 'Daily rate limit exceeded')
      return { success: false, auditId }
    }

    // ── 5. Audit trail BEFORE execution ───────────────────────────────────
    await auditLogger.log({
      type: AuditEventType.DATA_READ,
      userId,
      message: `Agent action initiated: ${type}`,
      metadata: { auditId, actionType: type, tenantId, role: userRole },
    })

    // ── 6. Execute action ──────────────────────────────────────────────────
    try {
      const data = await this.dispatch(action, tenantId)

      // ── 7. Audit trail after success ─────────────────────────────────────
      await auditLogger.log({
        type: AuditEventType.DATA_READ,
        userId,
        message: `Agent action completed: ${type}`,
        metadata: { auditId, actionType: type, tenantId, role: userRole, status: 'success' },
      })

      return { success: true, data, auditId }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logger.error(`Agent action execution failed — audit:${auditId} action:${type} user:${userId} tenant:${tenantId}: ${message}`)
      await auditLogger.log({
        type: AuditEventType.API_ERROR,
        userId,
        message: `Agent action failed: ${type}`,
        metadata: { auditId, actionType: type, tenantId, error: message },
      })
      // Generic message — never expose internals to the agent
      return { success: false, auditId }
    }
  }

  /**
   * Dispatch to the appropriate business logic handler.
   *
   * Current implementation returns structured intent objects (mock data).
   * Replace each `case` branch with real service/repository calls as the
   * corresponding modules are built out — without touching the proxy logic.
   */
  private async dispatch(action: AgentAction, tenantId: string): Promise<unknown> {
    switch (action.type) {
      case 'read_contacts':
        return { intent: 'read_contacts', tenantId, filter: action.filter ?? null }

      case 'read_campaigns':
        return { intent: 'read_campaigns', tenantId, filter: action.filter ?? null }

      case 'read_contracts':
        return { intent: 'read_contracts', tenantId, filter: action.filter ?? null }

      case 'read_cunas':
        return { intent: 'read_cunas', tenantId, filter: action.filter ?? null }

      case 'read_vencimientos':
        return { intent: 'read_vencimientos', tenantId, filter: action.filter ?? null }

      case 'read_anunciantes':
        return { intent: 'read_anunciantes', tenantId, filter: action.filter ?? null }

      case 'read_emisoras':
        return { intent: 'read_emisoras', tenantId, filter: action.filter ?? null }

      case 'read_dashboard_metrics':
        return { intent: 'read_dashboard_metrics', tenantId }

      case 'read_reports':
        return { intent: 'read_reports', tenantId, filter: action.filter ?? null }

      case 'read_analytics':
        return { intent: 'read_analytics', tenantId, period: action.period ?? '30d' }

      case 'generate_report':
        return { intent: 'generate_report', tenantId, reportType: action.reportType }

      case 'send_notification':
        return {
          intent: 'send_notification',
          tenantId,
          targetUserId: action.userId,
          messageLength: action.message.length,
        }

      case 'create_draft_proposal':
        return { intent: 'create_draft_proposal', tenantId }

      case 'search_knowledge_base':
        return { intent: 'search_knowledge_base', tenantId, query: action.query ?? null }

      case 'analyze_performance':
        return { intent: 'analyze_performance', tenantId, period: action.period ?? '30d' }

      default: {
        // TypeScript exhaustiveness guard — this branch is unreachable at runtime
        // if the AgentAction union stays in sync with the switch cases.
        const _exhaustive: never = action
        throw new Error(`Unhandled action type: ${(_exhaustive as { type: string }).type}`)
      }
    }
  }

  // ── Denial audit helper ─────────────────────────────────────────────────

  private async logViolation(
    userId: string,
    tenantId: string,
    role: string,
    actionType: string,
    auditId: string,
    internalReason: string,
  ): Promise<void> {
    logger.warn(`L8 action proxy: action denied — audit:${auditId} user:${userId} tenant:${tenantId} role:${role} action:${actionType}: ${internalReason}`)
    await auditLogger.log({
      type: AuditEventType.SECURITY_VIOLATION,
      userId,
      message: `Agent action denied: ${actionType}`,
      metadata: { auditId, actionType, tenantId, role, reason: internalReason },
    })
  }

  // ── Public utilities ────────────────────────────────────────────────────

  /**
   * Return the list of action types permitted for a given role.
   * Safe to call from UI or API routes for capability advertising.
   */
  getAllowedActions(userRole: string): AgentActionType[] {
    return [...(ROLE_PERMISSIONS[userRole] ?? FALLBACK_PERMISSIONS).allowedActions]
  }

  /**
   * Return the full permission profile for a role (actions + rate limits).
   * Useful for admin dashboards and capability negotiation.
   */
  getPermissionProfile(userRole: string): ActionPermissions {
    return { ...(ROLE_PERMISSIONS[userRole] ?? FALLBACK_PERMISSIONS) }
  }
}

/** Singleton instance — import this everywhere instead of constructing a new one */
export const actionProxy = new ZeroTrustActionProxy()

// executeAgentAction (deprecated) removed — no callers exist.
// Use actionProxy.execute() for all agent actions.
