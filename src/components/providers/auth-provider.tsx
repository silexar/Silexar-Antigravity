'use client'

/**
 * Auth context re-export.
 *
 * Auth state is managed entirely by SecurityInitializer (JWT verified server-side).
 * This re-exports useAuth so components can import from a short path:
 *
 *   import { useAuth } from '@/components/providers/auth-provider'
 *
 * Never add local hardcoded state here — all auth state lives in SecurityInitializer.
 */

export { useAuth } from '@/components/security-initializer'
