/**
 * Incident Response Playbooks — Barrel Export
 *
 * Usage:
 *   import { handlePromptInjection } from '@/lib/security/incident-response'
 *   import { handleCrossTenantAttempt } from '@/lib/security/incident-response'
 *   import { handleLoginFailure, resetLoginFailures } from '@/lib/security/incident-response'
 *   import { handleSuspiciousAgentOutput } from '@/lib/security/incident-response'
 */

export {
  handlePromptInjection,
  getPromptInjectionBlockCount,
} from './prompt-injection'

export type {
  PromptInjectionEvent,
  PromptInjectionResult,
} from './prompt-injection'

export {
  handleCrossTenantAttempt,
} from './cross-tenant-attempt'

export type {
  CrossTenantAttemptEvent,
  CrossTenantAttemptResult,
} from './cross-tenant-attempt'

export {
  handleLoginFailure,
  resetLoginFailures,
} from './mass-login-failure'

export type {
  LoginFailureEvent,
  LoginFailureResult,
} from './mass-login-failure'

export {
  handleSuspiciousAgentOutput,
} from './suspicious-agent-output'

export type {
  SuspiciousAgentOutputEvent,
  SuspiciousAgentOutputResult,
  SuspiciousOutputReason,
} from './suspicious-agent-output'
