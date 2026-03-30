/**
 * tRPC App Router — Silexar Pulse
 *
 * Aggregates all domain routers into one typed AppRouter.
 *
 * Auth operations (login, logout, refresh) are intentionally excluded here —
 * they run as REST API routes (/api/auth/*) because they need to set httpOnly
 * cookies, which tRPC cannot do natively.
 */

import { router } from './trpc'
import { campaignsRouter } from './routers/campaigns'
import { analyticsRouter } from './routers/analytics'
import { cortexRouter } from './routers/cortex'
import { systemRouter } from './routers/system'

export const appRouter = router({
  campaigns: campaignsRouter,
  analytics: analyticsRouter,
  cortex: cortexRouter,
  system: systemRouter,
})

export type AppRouter = typeof appRouter
