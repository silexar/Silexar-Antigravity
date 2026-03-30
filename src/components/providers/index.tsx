'use client'

import { QueryProvider } from './query-provider'
import { TRPCProvider } from './trpc-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <TRPCProvider>
        {children}
      </TRPCProvider>
    </QueryProvider>
  )
}