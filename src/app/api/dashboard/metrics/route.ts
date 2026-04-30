/**
 * GET /api/dashboard/metrics — Aggregate KPIs for the main dashboard
 *
 * Returns counts and totals across all major business modules.
 * When DB is not connected returns zero-filled structure so the
 * dashboard UI still renders without errors.
 *
 * Security: withApiRoute enforces JWT auth, RBAC, rate limiting, CSRF, and audit logging.
 * Multi-tenancy: withTenantContext enforces RLS on all queries.
 * Validation: Zod schema for query parameters.
 */

import { sql } from 'drizzle-orm'
import { z } from 'zod'
import { withApiRoute } from '@/lib/api/with-api-route'
import { withTenantContext } from '@/lib/db/tenant-context'
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response'
import { isDatabaseConnected } from '@/lib/db'
import { auditLogger } from '@/lib/security/audit-logger'
import { AuditEventType } from '@/lib/security/audit-types'

export const dynamic = 'force-dynamic'

// ─── Zod Schema for Query Validation ────────────────────────

const metricsQuerySchema = z.object({
  refresh: z.enum(['true', 'false']).optional().default('false'),
  period: z.enum(['day', 'week', 'month', 'year']).optional().default('month'),
}).strict()

type MetricsQuery = z.infer<typeof metricsQuerySchema>

// ─── Zero-fill fallback ───────────────────────────────────────

const EMPTY_METRICS = {
  campanas: { total: 0, activas: 0, valorTotal: 0 },
  contratos: { total: 0, activos: 0 },
  anunciantes: { total: 0, activos: 0 },
  emisoras: { total: 0 },
  facturas: { total: 0, pendiente: 0 },
  vendedores: { total: 0 },
}

// ─── Type for Metrics Response ────────────────────────────────

interface DashboardMetrics {
  campanas: { total: number; activas: number; valorTotal: number }
  contratos: { total: number; activos: number }
  anunciantes: { total: number; activos: number }
  emisoras: { total: number }
  facturas: { total: number; pendiente: number }
  vendedores: { total: number }
}

// ─── Handler ─────────────────────────────────────────────────

export const GET = withApiRoute(
  { resource: 'dashboard', action: 'read', skipCsrf: true, rateLimit: 'api' },
  async ({ ctx, req }) => {
    const { tenantId, userId } = ctx

    // ─── Audit Logging ──────────────────────────────────────────
    auditLogger.log({
      type: AuditEventType.DATA_READ,
      userId,
      metadata: {
        tenantId,
        resource: 'dashboard',
        resourceId: 'metrics',
        module: 'dashboard',
        endpoint: '/api/dashboard/metrics',
        action: 'read_metrics',
      },
    })

    // ─── Validate Query Parameters ──────────────────────────────
    const url = new URL(req.url)
    const rawParams = {
      refresh: url.searchParams.get('refresh') || 'false',
      period: url.searchParams.get('period') || 'month',
    }

    const parsed = metricsQuerySchema.safeParse(rawParams)
    if (!parsed.success) {
      return apiError(
        'VALIDATION_ERROR',
        'Parámetros inválidos',
        422,
        parsed.error.flatten().fieldErrors
      )
    }

    const { refresh, period } = parsed.data as MetricsQuery

    // ─── Check Database Connection ────────────────────────────────
    if (!isDatabaseConnected()) {
      // Still log even with empty data
      auditLogger.log({
        type: AuditEventType.DATA_READ,
        userId,
        metadata: {
          tenantId,
          resource: 'dashboard',
          resourceId: 'metrics',
          source: 'no_database',
          period,
        },
      })
      return apiSuccess(EMPTY_METRICS, 200, { source: 'no_database', period })
    }

    // ─── Execute Queries with Multi-tenancy ──────────────────────
    try {
      const metrics = await withTenantContext(tenantId, async (db) => {
        const [
          campanasResult,
          contratosResult,
          anunciantesResult,
          emisorasResult,
          facturasResult,
          vendedoresResult,
        ] = await Promise.all([
          db.execute(sql`
            SELECT
              COUNT(*)::int                                         AS total,
              COUNT(*) FILTER (WHERE estado = 'activa')::int        AS activas,
              COALESCE(SUM(valor_neto), 0)::float                  AS valor_total
            FROM campanas WHERE tenant_id = ${tenantId}::uuid
          `),
          db.execute(sql`
            SELECT
              COUNT(*)::int                                         AS total,
              COUNT(*) FILTER (WHERE estado = 'activo')::int        AS activos
            FROM contratos WHERE tenant_id = ${tenantId}::uuid
          `),
          db.execute(sql`
            SELECT
              COUNT(*)::int                                         AS total,
              COUNT(*) FILTER (WHERE activo = true)::int            AS activos
            FROM anunciantes WHERE tenant_id = ${tenantId}::uuid
          `),
          db.execute(sql`
            SELECT COUNT(*)::int AS total
            FROM emisoras WHERE tenant_id = ${tenantId}::uuid
          `),
          db.execute(sql`
            SELECT
              COUNT(*)::int                                               AS total,
              COUNT(*) FILTER (WHERE estado NOT IN ('pagada','anulada'))::int AS pendiente
            FROM facturas WHERE tenant_id = ${tenantId}::uuid
          `),
          db.execute(sql`
            SELECT COUNT(*)::int AS total
            FROM vendedores WHERE tenant_id = ${tenantId}::uuid
          `),
        ])

        // Type helper for row extraction
        const row = <T>(res: typeof campanasResult): T => (res[0] ?? {}) as T

        const metricsData: DashboardMetrics = {
          campanas: {
            total: Number(row<{ total: number }>(campanasResult).total ?? 0),
            activas: Number(row<{ activas: number }>(campanasResult).activas ?? 0),
            valorTotal: Number(row<{ valor_total: number }>(campanasResult).valor_total ?? 0),
          },
          contratos: {
            total: Number(row<{ total: number }>(contratosResult).total ?? 0),
            activos: Number(row<{ activos: number }>(contratosResult).activos ?? 0),
          },
          anunciantes: {
            total: Number(row<{ total: number }>(anunciantesResult).total ?? 0),
            activos: Number(row<{ activos: number }>(anunciantesResult).activos ?? 0),
          },
          emisoras: {
            total: Number(row<{ total: number }>(emisorasResult).total ?? 0),
          },
          facturas: {
            total: Number(row<{ total: number }>(facturasResult).total ?? 0),
            pendiente: Number(row<{ pendiente: number }>(facturasResult).pendiente ?? 0),
          },
          vendedores: {
            total: Number(row<{ total: number }>(vendedoresResult).total ?? 0),
          },
        }

        return metricsData
      })

      // Log successful metrics retrieval
      auditLogger.log({
        type: AuditEventType.DATA_READ,
        userId,
        metadata: {
          tenantId,
          resource: 'dashboard',
          resourceId: 'metrics',
          source: 'database',
          period,
          refresh,
          campanasCount: metrics.campanas.total,
          contratosCount: metrics.contratos.total,
        },
      })

      return apiSuccess(metrics, 200, { source: 'database', period, refresh })

    } catch (error) {
      // Log error
      auditLogger.log({
        type: AuditEventType.DATA_READ,
        userId,
        metadata: {
          tenantId,
          resource: 'dashboard',
          resourceId: 'metrics',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          source: 'database',
          period,
        },
      })

      console.error('[Dashboard Metrics] Database error:', error)
      return apiServerError()
    }
  }
)
