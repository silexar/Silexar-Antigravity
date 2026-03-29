/**
 * GET /api/dashboard/metrics — Aggregate KPIs for the main dashboard
 *
 * Returns counts and totals across all major business modules.
 * When DB is not connected returns zero-filled structure so the
 * dashboard UI still renders without errors.
 */

import { sql } from 'drizzle-orm'
import { apiSuccess, getUserContext, apiForbidden} from '@/lib/api/response'
import { secureHandler } from '@/lib/api/secure-handler'
import { isDatabaseConnected } from '@/lib/db'
import { checkPermission } from '@/lib/security/rbac';
import { auditLogger } from '@/lib/security/audit-logger';

export const dynamic = 'force-dynamic'

// ─── Zero-fill fallback ───────────────────────────────────────

const EMPTY_METRICS = {
  campanas:    { total: 0, activas: 0, valorTotal: 0 },
  contratos:   { total: 0, activos: 0 },
  anunciantes: { total: 0, activos: 0 },
  emisoras:    { total: 0 },
  facturas:    { total: 0, pendiente: 0 },
  vendedores:  { total: 0 },
}

// ─── Handler ─────────────────────────────────────────────────

export const GET = secureHandler(
  { resource: 'dashboard', action: 'read' },
  async (_request, { user, db }) => {
    if (!isDatabaseConnected()) {
      return apiSuccess(EMPTY_METRICS, 200, { source: 'no_database' })
    }

    // RLS is active via withTenantContext — no need for manual WHERE tenant_id
    // But these are raw SQL queries, so we still pass tenantId explicitly
    const tenantId = user.tenantId

    const [
      campanas,
      contratos,
      anunciantes,
      emisoras,
      facturas,
      vendedores,
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

    const row = <T>(res: typeof campanas): T => (res[0] ?? {}) as T

    return apiSuccess({
      campanas: {
        total:      Number(row<{ total: number }>(campanas).total ?? 0),
        activas:    Number(row<{ activas: number }>(campanas).activas ?? 0),
        valorTotal: Number(row<{ valor_total: number }>(campanas).valor_total ?? 0),
      },
      contratos: {
        total:   Number(row<{ total: number }>(contratos).total ?? 0),
        activos: Number(row<{ activos: number }>(contratos).activos ?? 0),
      },
      anunciantes: {
        total:   Number(row<{ total: number }>(anunciantes).total ?? 0),
        activos: Number(row<{ activos: number }>(anunciantes).activos ?? 0),
      },
      emisoras: {
        total: Number(row<{ total: number }>(emisoras).total ?? 0),
      },
      facturas: {
        total:     Number(row<{ total: number }>(facturas).total ?? 0),
        pendiente: Number(row<{ pendiente: number }>(facturas).pendiente ?? 0),
      },
      vendedores: {
        total: Number(row<{ total: number }>(vendedores).total ?? 0),
      },
    })
  }
)
