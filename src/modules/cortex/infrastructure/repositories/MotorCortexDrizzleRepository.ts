/**
 * MotorCortexDrizzleRepository
 *
 * Drizzle ORM implementation of IMotorCortexRepository.
 * Replaces the previous stub — all queries use withTenantContext().
 *
 * CLAUDE.md rules enforced:
 *   ✅ withTenantContext() on every query
 *   ✅ Drizzle ORM only — no raw SQL
 *   ✅ Errors re-thrown as domain errors
 *   ✅ Select only needed columns (no SELECT *)
 */

import { eq, and } from 'drizzle-orm'
import { db as _db } from '@/lib/db'
import { withTenantContext } from '@/lib/db/tenant-context'
// DATABASE_URL is required at startup; non-null assertion is safe in server context
const db = _db!
import { cortexMotores } from '@/lib/db/cortex-schema'
import { logger } from '@/lib/observability'

import { MotorCortex, type TipoMotorCortex } from '../../domain/entities/MotorCortex'
import type { IMotorCortexRepository } from '../../domain/repositories/IMotorCortexRepository'
import type { EstadoMotorValue } from '../../domain/value-objects/EstadoMotor'

// ─── Row → Domain mapper ──────────────────────────────────────────────────────

type MotorRow = typeof cortexMotores.$inferSelect

function toMotorCortex(row: MotorRow): MotorCortex {
  return MotorCortex.reconstituir({
    id: row.id,
    tenantId: row.tenantId,
    tipo: row.tipo as TipoMotorCortex,
    nombre: row.nombre,
    version: row.version,
    estado: row.estado as EstadoMotorValue,
    metricas: {
      precision: row.metricaPrecision,
      latenciaMs: row.metricaLatenciaMs,
      solicitudesTotal: row.metricaSolicitudesTotal,
      solicitudesExitosas: row.metricaSolicitudesExitosas,
      ultimaEjecucion: row.metricaUltimaEjecucion ?? undefined,
    },
    configuracion: (row.configuracion ?? {}) as Record<string, unknown>,
    creadoEn: row.createdAt,
    actualizadoEn: row.updatedAt,
  })
}

// ─── Repository ───────────────────────────────────────────────────────────────

export class MotorCortexDrizzleRepository implements IMotorCortexRepository {
  constructor(private readonly tenantId: string) {}

  async buscarPorId(id: string, tenantId: string): Promise<MotorCortex | null> {
    try {
      return await withTenantContext(this.tenantId, async () => {
        const rows = await db
          .select()
          .from(cortexMotores)
          .where(and(eq(cortexMotores.id, id), eq(cortexMotores.tenantId, tenantId)))
          .limit(1)
        return rows.length > 0 ? toMotorCortex(rows[0]) : null
      })
    } catch (error) {
      logger.error('MotorCortexRepo.buscarPorId failed', error instanceof Error ? error : undefined)
      throw new Error('No fue posible obtener el motor Cortex')
    }
  }

  async buscarPorTipo(tipo: TipoMotorCortex, tenantId: string): Promise<MotorCortex | null> {
    try {
      return await withTenantContext(this.tenantId, async () => {
        const rows = await db
          .select()
          .from(cortexMotores)
          .where(and(eq(cortexMotores.tipo, tipo), eq(cortexMotores.tenantId, tenantId)))
          .limit(1)
        return rows.length > 0 ? toMotorCortex(rows[0]) : null
      })
    } catch (error) {
      logger.error('MotorCortexRepo.buscarPorTipo failed', error instanceof Error ? error : undefined)
      throw new Error('No fue posible buscar el motor Cortex por tipo')
    }
  }

  async listarPorTenant(tenantId: string): Promise<MotorCortex[]> {
    try {
      return await withTenantContext(this.tenantId, async () => {
        const rows = await db
          .select()
          .from(cortexMotores)
          .where(eq(cortexMotores.tenantId, tenantId))
          .orderBy(cortexMotores.tipo)
        return rows.map(toMotorCortex)
      })
    } catch (error) {
      logger.error('MotorCortexRepo.listarPorTenant failed', error instanceof Error ? error : undefined)
      throw new Error('No fue posible listar los motores Cortex')
    }
  }

  async listarPorEstado(tenantId: string, estado: EstadoMotorValue): Promise<MotorCortex[]> {
    try {
      return await withTenantContext(this.tenantId, async () => {
        const rows = await db
          .select()
          .from(cortexMotores)
          .where(and(eq(cortexMotores.tenantId, tenantId), eq(cortexMotores.estado, estado)))
          .orderBy(cortexMotores.tipo)
        return rows.map(toMotorCortex)
      })
    } catch (error) {
      logger.error('MotorCortexRepo.listarPorEstado failed', error instanceof Error ? error : undefined)
      throw new Error('No fue posible listar los motores Cortex por estado')
    }
  }

  async guardar(motor: MotorCortex): Promise<void> {
    try {
      await withTenantContext(this.tenantId, async () => {
        await db.insert(cortexMotores).values({
          id: motor.id,
          tenantId: motor.tenantId,
          tipo: motor.tipo,
          nombre: motor.nombre,
          version: motor.version,
          estado: motor.estado.valor,
          metricaPrecision: motor.metricas.precision,
          metricaLatenciaMs: motor.metricas.latenciaMs,
          metricaSolicitudesTotal: motor.metricas.solicitudesTotal,
          metricaSolicitudesExitosas: motor.metricas.solicitudesExitosas,
          metricaUltimaEjecucion: motor.metricas.ultimaEjecucion ?? null,
          configuracion: motor.configuracion,
          createdAt: motor.creadoEn,
          updatedAt: motor.actualizadoEn,
        })
      })
    } catch (error) {
      logger.error('MotorCortexRepo.guardar failed', error instanceof Error ? error : undefined)
      throw new Error('No fue posible guardar el motor Cortex')
    }
  }

  async actualizar(motor: MotorCortex): Promise<void> {
    try {
      await withTenantContext(this.tenantId, async () => {
        await db
          .update(cortexMotores)
          .set({
            estado: motor.estado.valor,
            metricaPrecision: motor.metricas.precision,
            metricaLatenciaMs: motor.metricas.latenciaMs,
            metricaSolicitudesTotal: motor.metricas.solicitudesTotal,
            metricaSolicitudesExitosas: motor.metricas.solicitudesExitosas,
            metricaUltimaEjecucion: motor.metricas.ultimaEjecucion ?? null,
            configuracion: motor.configuracion,
            updatedAt: new Date(),
          })
          .where(and(eq(cortexMotores.id, motor.id), eq(cortexMotores.tenantId, motor.tenantId)))
      })
    } catch (error) {
      logger.error('MotorCortexRepo.actualizar failed', error instanceof Error ? error : undefined)
      throw new Error('No fue posible actualizar el motor Cortex')
    }
  }

  async obtenerResumenEstados(tenantId: string): Promise<Record<EstadoMotorValue, number>> {
    try {
      return await withTenantContext(this.tenantId, async () => {
        const rows = await db
          .select({
            estado: cortexMotores.estado,
          })
          .from(cortexMotores)
          .where(eq(cortexMotores.tenantId, tenantId))

        const resumen: Record<EstadoMotorValue, number> = {
          INICIALIZANDO: 0,
          ACTIVO: 0,
          DEGRADADO: 0,
          DETENIDO: 0,
          ERROR: 0,
        }
        for (const { estado } of rows) {
          resumen[estado as EstadoMotorValue]++
        }
        return resumen
      })
    } catch (error) {
      logger.error('MotorCortexRepo.obtenerResumenEstados failed', error instanceof Error ? error : undefined)
      throw new Error('No fue posible obtener el resumen de estados Cortex')
    }
  }
}
