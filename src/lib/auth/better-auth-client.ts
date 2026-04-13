/**
 * Better-Auth Client Configuration
 *
 * Client-side authentication interface for Silexar Pulse.
 * Provides type-safe authentication operations that integrate with
 * the server-side Better-Auth configuration.
 */

import { createAuthClient as createBetterAuthClient } from 'better-auth/react'

export interface BetterAuthSession {
  userId: string
  token: string
  expiresAt: Date
}

/**
 * Creates a configured Better-Auth client instance
 */
export const createAuthClient = () => {
  const client = createBetterAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  })

  return {
    /** Sign in with email and password */
    signIn: client.signIn.email,
    /** Sign up with email and password */
    signUp: client.signUp.email,
    /** Sign out current session */
    signOut: client.signOut,
    /** Get current session */
    getSession: client.getSession,
    /** Raw client for advanced usage */
    client,
  }
}

/** Default auth client instance */
export const betterAuthClient = createAuthClient()

export default betterAuthClient
