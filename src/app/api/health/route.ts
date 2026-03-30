/**
 * GET /api/health — System health check
 * Public endpoint, no auth required
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/observability';
import { isDatabaseConnected, getDB } from '@/lib/db'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {}
  let overallStatus = 'healthy'

  // Database health check
  if (isDatabaseConnected()) {
    const start = performance.now()
    try {
      const db = getDB()
      await db.execute(sql`SELECT 1 AS ok`)
      checks.database = {
        status: 'healthy',
        latencyMs: Math.round(performance.now() - start),
      }
    } catch (e) {
      checks.database = {
        status: 'unhealthy',
        latencyMs: Math.round(performance.now() - start),
        error: (e as Error).message,
      }
      overallStatus = 'degraded'
    }
  } else {
    checks.database = { status: 'not_configured' }
    overallStatus = 'degraded'
  }

  // Environment check
  checks.environment = {
    status: process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32
      ? 'healthy'
      : 'misconfigured',
  }
  if (checks.environment.status !== 'healthy') overallStatus = 'degraded'

  return NextResponse.json(
    {
      status: overallStatus,
      version: '1.0.0',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    },
    { status: overallStatus === 'healthy' ? 200 : 503 }
  )
}
