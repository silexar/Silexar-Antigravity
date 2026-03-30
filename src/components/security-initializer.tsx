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
      // Report CSP violations to the server
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
    // Refresh session when tab becomes visible (user returns)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshSession()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [refreshSession])

  useEffect(() => {
    // Periodic token refresh — every 20 minutes
    const interval = setInterval(refreshSession, 20 * 60_000)
    return () => clearInterval(interval)
  }, [refreshSession])
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
        credentials: 'include',
      })

      const data = await res.json()

      if (!data.success) {
        return { success: false, error: data.error?.message || 'Login failed' }
      }

      // Store token in httpOnly cookie via response, and user in state
      setUser(data.data.user)

      // Store access token for API calls (refresh token stays in httpOnly cookie)
      if (data.data.accessToken) {
        sessionStorage.setItem('silexar_token', data.data.accessToken)
      }

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
      sessionStorage.removeItem('silexar_token')
      window.location.href = '/login'
    }
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      // The silexar_refresh httpOnly cookie is sent automatically by the browser
      // because of credentials: 'include'. We never read it from JS (it's httpOnly).
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })

      if (!res.ok) {
        // Refresh token expired or invalid — clear local state
        setUser(null)
        sessionStorage.removeItem('silexar_token')
        return
      }

      const data = await res.json()
      if (data.success && data.data?.accessToken) {
        // Access token returned in body — store for Authorization header use
        sessionStorage.setItem('silexar_token', data.data.accessToken)
        // Silexar_session + silexar_refresh cookies are updated via Set-Cookie in the response
      }
    } catch {
      // Silent fail — next request will trigger re-auth if needed
    }
  }, [])

  // Initial session check
  useEffect(() => {
    const token = sessionStorage.getItem('silexar_token')
    if (!token) {
      setIsLoading(false)
      return
    }

    // Decode JWT payload (no verification — that happens server-side)
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]))
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          setUser({
            id: payload.userId,
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            category: payload.role || 'vendedor',
            tenantId: payload.tenantId || null,
            tenantSlug: payload.tenantSlug || null,
          })
        } else {
          // Token expired — try refresh
          refreshSession()
        }
      }
    } catch {
      sessionStorage.removeItem('silexar_token')
    }

    setIsLoading(false)
  }, [refreshSession])

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
