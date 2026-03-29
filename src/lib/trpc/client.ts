/**
 * Silexar Pulse — tRPC Client
 *
 * Provides the type-safe tRPC client used by React components.
 * Connects to /api/trpc with:
 *   - httpBatchLink: batches multiple requests into one HTTP call
 *   - superjson transformer: handles Dates, BigInt, Sets, Maps
 *   - Auth header injection from sessionStorage
 */

import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink, loggerLink } from '@trpc/client'
import superjson from 'superjson'
import { type AppRouter } from './root'

// ─── tRPC React hooks ─────────────────────────────────────────────────────────

export const trpc = createTRPCReact<AppRouter>()

// ─── Client factory ───────────────────────────────────────────────────────────

function getBaseUrl(): string {
  if (typeof window !== 'undefined') return '' // Browser: relative URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  return `http://localhost:${process.env.PORT ?? 3000}`
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = sessionStorage.getItem('silexar_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function createTRPCClient() {
  return trpc.createClient({
    links: [
      // Log errors in development
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === 'development' ||
          (opts.direction === 'down' && opts.result instanceof Error),
      }),
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
        headers() {
          return getAuthHeaders()
        },
        // Max batch size — prevents oversized requests
        maxURLLength: 2083,
      }),
    ],
  })
}
