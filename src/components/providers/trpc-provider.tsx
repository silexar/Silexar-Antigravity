/**
 * Silexar Pulse — tRPC Provider
 * Connects the tRPC React client with React Query.
 * Must be nested inside QueryProvider so that useQueryClient() resolves
 * to the single shared QueryClient — preventing duplicate caches.
 */

'use client'

import { useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { trpc, createTRPCClient } from '@/lib/trpc/client'

interface TRPCProviderProps {
  children: ReactNode
}

export function TRPCProvider({ children }: TRPCProviderProps) {
  // Reuse the QueryClient from the parent QueryProvider — never create a second one.
  const queryClient = useQueryClient()

  const [trpcClient] = useState(() => createTRPCClient())

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      {children}
    </trpc.Provider>
  )
}

export default TRPCProvider
