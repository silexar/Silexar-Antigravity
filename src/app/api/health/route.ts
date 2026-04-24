/**
 * GET /api/health — System health check
 * Public endpoint, no auth required.
 * Used by: Kubernetes liveness probe, Vercel health check, uptime monitoring.
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/observability'
import { isDatabaseConnected, getDB } from '@/lib/db'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

type CheckResult = {
  status: 'healthy' | 'unhealthy' | 'not_configured' | 'misconfigured'
  latencyMs?: number
  error?: string
}

export async function GET() {
  // --- BYPASS DESARROLLO: Devuelve datos simulados sin tocar la BD ---
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.json({
      status: 'healthy',
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? '2040.5.0',
      environment: 'development',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      checks: {
        database: { status: 'healthy', latencyMs: 1 },
        redis: { status: 'not_configured' },
        aiService: { status: 'not_configured' },
        environment: { status: 'healthy' },
      },
    }, { status: 200 })
  }

  const checks: Record<string, CheckResult> = {}
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

  // ── Database ───────────────────────────────────────────────────────────────
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
    // WHY: Sin DB el sistema no puede operar — marcamos como unhealthy, no solo degraded
    overallStatus = 'unhealthy'
  }

  // ── Redis / Cache ──────────────────────────────────────────────────────────
  if (process.env.REDIS_URL) {
    const start = performance.now()
    try {
      // WHY: Import dinámico para no fallar si Redis no está disponible en build
      const { getRedisClient } = await import('@/lib/cache/redis-client')
      const redis = getRedisClient()
      if (redis) {
        await redis.ping()
        checks.redis = {
          status: 'healthy',
          latencyMs: Math.round(performance.now() - start),
        }
      } else {
        checks.redis = { status: 'not_configured' }
      }
    } catch (e) {
      checks.redis = {
        status: 'unhealthy',
        latencyMs: Math.round(performance.now() - start),
        error: (e as Error).message,
      }
      // WHY: Redis es caché — si falla el sistema funciona con fallback en memoria,
      // por eso solo es 'degraded', no 'unhealthy'
      if (overallStatus === 'healthy') overallStatus = 'degraded'
    }
  } else {
    checks.redis = { status: 'not_configured' }
  }

  // ── AI Services ────────────────────────────────────────────────────────────
  // Solo verificamos que la key esté configurada — no hacemos llamadas reales
  // para no gastar créditos y no bloquear el health check
  checks.aiService = {
    status: process.env.ANTHROPIC_API_KEY ? 'healthy' : 'not_configured',
  }

  // ── Environment ────────────────────────────────────────────────────────────
  const requiredEnvVars = ['JWT_SECRET', 'NEXTAUTH_SECRET']
  const missingVars = requiredEnvVars.filter(v => !process.env[v] || (process.env[v] ?? '').length < 16)
  checks.environment = {
    status: missingVars.length === 0 ? 'healthy' : 'misconfigured',
    ...(missingVars.length > 0 && { error: `Missing or weak: ${missingVars.join(', ')}` }),
  }
  if (checks.environment.status !== 'healthy' && overallStatus === 'healthy') {
    overallStatus = 'degraded'
  }

  const httpStatus = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503

  logger.info('[Health] Check completed', { status: overallStatus, checks })

  return NextResponse.json(
    {
      status: overallStatus,
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      checks,
    },
    { status: httpStatus }
  )
}
