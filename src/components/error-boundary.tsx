'use client'

import React from 'react'
// WHY: client components can't import server logger — use a structured console.error
// which is acceptable in error boundaries (React itself uses console.error for error reporting).
// Sentry is the primary error capture; this log is a fallback for local debugging.
// NOTE: console.error is kept intentionally — it's semantically correct for an error boundary
// and is not a banned pattern (only console.log is flagged by guard-rails in API routes).

interface ErrorBoundaryState {
  hasError: boolean
  errorId?: string
}

// Type guard para verificar si window tiene __SENTRY__
interface WindowWithSentry extends Window {
  __SENTRY__?: {
    captureException: (e: Error, ctx?: object) => void
  }
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback?: React.ReactNode }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{ fallback?: React.ReactNode }>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true, errorId: crypto.randomUUID?.() }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Structured error log — console.error is semantically correct here (not console.log)
    // Primary capture: Sentry (below). This is a fallback for local/staging environments.
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      source: 'ErrorBoundary',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    }))

    // Report to Sentry if available (loaded by @sentry/nextjs)
    if (typeof window !== 'undefined') {
      const win = window as WindowWithSentry
      if (win.__SENTRY__) {
        try {
          win.__SENTRY__.captureException(error, {
            extra: { componentStack: errorInfo.componentStack },
          })
        } catch {
          // Sentry not initialized — ignore
        }
      }
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F0EDE8]">
          <div
            className="text-center p-8 rounded-2xl max-w-md"
            style={{ boxShadow: '6px 6px 14px #D4D1CC, -6px -6px 14px #FFFFFF' }}
          >
            <div className="w-16 h-16 rounded-full bg-[#E8E5E0] flex items-center justify-center mx-auto mb-4"
              style={{ boxShadow: 'inset 3px 3px 8px #D4D1CC, inset -3px -3px 8px #FFFFFF' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A32D2D" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#2C2C2A] mb-2">
              Ocurrió un error inesperado
            </h2>
            <p className="text-sm text-[#5F5E5A] mb-6">
              El equipo ha sido notificado. Intenta recargar la página.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false })
                window.location.reload()
              }}
              className="px-6 py-3 rounded-xl font-medium text-white bg-[#1D5AE8]
                shadow-[4px_4px_10px_#D4D1CC,-4px_-4px_10px_#FFFFFF]
                active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2)]
                transition-all duration-150 hover:brightness-105"
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
