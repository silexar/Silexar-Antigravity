/**
 * Query Provider for TIER 0 SILEXAR PULSE QUANTUM
 */

'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/observability'

// WHY: queryClient se crea con useState para que cada usuario (SSR) tenga
// su propio cliente y no compartan estado entre requests.
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
        // WHY: onError global evita tener que manejar errores en cada useQuery.
        // Loguea + reporta a Sentry automáticamente.
        throwOnError: false,
        retry: (failureCount, error) => {
          // No reintentar en errores de auth o permisos
          if (error instanceof Error) {
            const msg = error.message.toLowerCase()
            if (msg.includes('401') || msg.includes('403') || msg.includes('unauthorized') || msg.includes('forbidden')) {
              return false
            }
          }
          return failureCount < 2
        },
      },
      mutations: {
        onError: (error: unknown) => {
          logger.error('[QueryClient] Mutation error', error instanceof Error ? error : undefined)
          Sentry.captureException(error)
        },
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: siempre crear nuevo cliente
    return makeQueryClient()
  }
  // Browser: reutilizar cliente singleton
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

const queryClient = getQueryClient()

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}