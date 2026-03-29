/**
 * Silexar Pulse — tRPC API Gateway
 * Handles all tRPC requests at /api/trpc/*
 */

import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { type NextRequest } from 'next/server'
import { appRouter } from '@/lib/trpc/root'
import { createTRPCContext } from '@/lib/trpc/context'
import { logger } from '@/lib/observability';

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req, res: undefined } as unknown as Parameters<typeof createTRPCContext>[0]),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            logger.error('tRPC error', error instanceof Error ? error : undefined, { module: 'trpc', path: path ?? '<no-path>' })
          }
        : undefined,
  })

export { handler as GET, handler as POST }
