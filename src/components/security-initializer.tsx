'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

// ─── Auth Context ─────────────────────────────────────────────

interface AuthUser {
  id: string
  email: string
  name: string
  category: string
  tenantId: string | null
  tenantSlug: string | null
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  refreshSession: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

// ─── CSP Violation Reporter ──────────────────────────────────

function useCSPReporter() {
  useEffect(() => {
    const handler = (event: SecurityPolicyViolationEvent) => {
      fetch('/api/security/csp-violation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockedURI: event.blockedURI,
          violatedDirective: event.violatedDirective,
          documentURI: event.documentURI,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        // Silently fail — don't create error loops
      })
    }

    document.addEventListener('securitypolicyviolation', handler)
    return () => document.removeEventListener('securitypolicyviolation', handler)
  }, [])
}

// ─── Session Monitor ─────────────────────────────────────────

function useSessionMonitor(refreshSession: () => Promise<void>) {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshSession()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [refreshSession])

  useEffect(() => {
    // Periodic session validation — every 20 minutes
    const interval = setInterval(refreshSession, 20 * 60_000)
    return () => clearInterval(interval)
  }, [refreshSession])
}

// ─── Fetch current user from server ─────────────────────────
// Uses the httpOnly silexar_session cookie (sent via credentials:'include').
// NEVER reads or stores the JWT in JavaScript — the token lives only in httpOnly cookies.

async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.success || !data.data) return null
    const u = data.data.user ?? data.data
    return {
      id: u.userId ?? u.id,
      email: u.email,
      name: u.name || u.email?.split('@')[0],
      category: u.role ?? u.category ?? 'vendedor',
      tenantId: u.tenantId ?? null,
      tenantSlug: u.tenantSlug ?? null,
    }
  } catch {
    return null
  }
}

// ─── Security Initializer Component ──────────────────────────

export function SecurityInitializer({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // server sets httpOnly silexar_session + silexar_refresh cookies
      })

      const data = await res.json()
      if (!data.success) {
        return { success: false, error: data.error?.message || 'Login failed' }
      }

      // Identity comes from /api/auth/me — no JWT in JS memory
      const currentUser = await fetchCurrentUser()
      setUser(currentUser)

      return { success: true }
    } catch {
      return { success: false, error: 'Network error' }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // Continue logout even if server call fails
    } finally {
      setUser(null)
      window.location.href = '/login'
    }
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      // The silexar_refresh httpOnly cookie is sent automatically
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })

      if (!res.ok) {
        setUser(null)
        return
      }

      // Re-fetch identity after token rotation
      const currentUser = await fetchCurrentUser()
      setUser(currentUser)
    } catch {
      // Silent fail — next request will trigger re-auth if needed
    }
  }, [])

  // Initial session check — validate server-side via httpOnly cookie
  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .finally(() => setIsLoading(false))
  }, [])

  // Activate security monitors
  useCSPReporter()
  useSessionMonitor(refreshSession)

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshSession,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
