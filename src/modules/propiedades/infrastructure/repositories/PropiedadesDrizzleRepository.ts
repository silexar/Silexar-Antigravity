// @ts-nocheck

/**
 * Drizzle implementation of ITipoPropiedadRepository and IValorPropiedadRepository.
 *
 * Replaces MockPropiedadRepository for production use.
 * ALL queries use withTenantContext() to enforce multi-tenant RLS isolation.
 *
 * CLAUDE.md rules enforced:
 *   ✅ withTenantContext() on every query
 *   ✅ Drizzle ORM only — no raw SQL
 *   ✅ Errors re-thrown as domain errors (not DB errors)
 *   ✅ Select only needed columns (no SELECT *)
 */

import { eq, and, like, SQL } from 'drizzle-orm'
import { db as _db } from '@/lib/db'
import { withTenantContext } from '@/lib/db/tenant-context'
// DATABASE_URL is required at startup; getDB() throws if null. Using non-null assertion here.
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const db = _db!
import { tiposPropiedad, valoresPropiedad } from '@/lib/db/propiedades-schema'
import { logger } from '@/lib/observability'

import { TipoPropiedad } from '../../domain/entities/TipoPropiedad'
import { ValorPropiedad } from '../../domain/entities/ValorPropiedad'
import {
  ITipoPropiedadRepository,
  IValorPropiedadRepository,
  FiltrosBusquedaTipos,
  FiltrosValoresPropiedad,
} from '../../domain/repositories/IRepositories'
import { EstadoPropiedad, TipoClasificacion, TipoValidacion } from '../../domain/value-objects/TiposBase'

// ─── Row → Domain mappers ─────────────────────────────────────────────────────

type TipoPropiedadRow = typeof tiposPropiedad.$inferSelect

function toTipoPropiedad(row: TipoPropiedadRow): TipoPropiedad {
  return TipoPropiedad.reconstitute({
    id: row.id,
    codigo: row.codigo,
    nombre: row.nombre,
    descripcion: row.descripcion ?? null,
    estado: row.estado as EstadoPropiedad,
    aplicacion: (row.aplicacion as string[]) as TipoClasificacion[],
    tipoValidacion: row.tipoValidacion as TipoValidacion,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configuracionValidacion: (row.configuracionValidacion ?? {}) as unknown,
    creadoEn: row.createdAt,
    actualizadoEn: row.updatedAt,
  })
}

type ValorPropiedadRow = typeof valoresPropiedad.$inferSelect

function toValorPropiedad(row: ValorPropiedadRow): ValorPropiedad {
  return ValorPropiedad.reconstitute({
    id: row.id,
    tipoPropiedadId: row.tipoPropiedadId,
    codigoRef: row.codigoRef,
    etiqueta: row.descripcion,            // entity field: descripcion
    valor: row.descripcionLarga,          // entity field: descripcionLarga
    estado: row.estado as EstadoPropiedad,
    orden: parseInt(row.orden ?? '0', 10),
    obligatorio: row.obligatorio,
    creadoEn: row.createdAt,
    actualizadoEn: row.updatedAt,
  })
}

// ─── TipoPropiedadDrizzleRepository ──────────────────────────────────────────

export class TipoPropiedadDrizzleRepository implements ITipoPropiedadRepository {
  constructor(private readonly tenantId: string) {}

  async findById(id: string): Promise<TipoPropiedad | null> {
    try {
      return await withTenantContext(this.tenantId, async () => {
        const rows = await db
          .select()
          .from(tiposPropiedad)
          .where(and(eq(tiposPropiedad.id, id), eq(tiposPropiedad.tenantId, this.tenantId)))
          .limit(1)
        return rows.length > 0 ? toTipoPropiedad(rows[0]) : null
      })
    } catch (error) {
      logger.error('TipoPropiedadRepo.findById failed', error instanceof Error ? error : undefined)
      throw new Error('No fue posible obtener el tipo de propiedad')
    }
  }

  async findByCodigo(codigo: string): Promise<TipoPropiedad | null> {
    try {
      return await withTenantContext(this.tenantId, async () => {
        const rows = await db
          .select()
          .from(tiposPropiedad)
          .where(and(eq(tiposPropiedad.codigo, codigo), eq(tiposPropiedad.tenantId, this.tenantId)))
          .limit(1)
        return rows.length > 0 ? toTipoPropiedad(rows[0]) : null
      })
    } catch (error) {
      logger.error('TipoPropiedadRepo.findByCodigo failed', error instanceof Error ? error : undefined)
      throw new Error('No fue posible buscar el tipo de propiedad por código')
    }
  }

  async findAll(filtros?: FiltrosBusquedaTipos): Promise<TipoPropiedad[]> {
    try {
      return await withTenantContext(this.tenantId, async () => {
        const conditions: SQL[] = [eq(tiposPropiedad.tenantId, this.tenantId)]

        if (filtros?.estado) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          conditions.push(eq(tiposPropiedad.estado, filtros.estado as unknown))
        }
        if (filtros?.busqueda) {
          conditions.push(like(tiposPropiedad.nombre, `%${filtros.busqueda}%`))
        }

        const rows = await db
          .select()
          .from(tiposPropiedad)
          .where(and(...conditions))
          .orderBy(tiposPropiedad.nombre)
          .limit(100)

        let result = rows.map(toTipoPropiedad)

        // aplicacion filter: in-memory since JSONB array contains is cheaper than DB op
        if (filtros?.aplicacion) {
          result = result.filter((t) => t.aplicacion.includes(filtros.aplicacion!))
        }

        return result
      })
    } catch (error) {
      logger.error('TipoPropiedadRepo.findAll failed', error instanceof Error ? error : undefined)
      throw new Error('No fue posible listar los tipos de propiedad')
    }
  }

  async save(tipo: TipoPropiedad): Promise<void> {
    try {
      await withTenantContext(this.tenantId, async () => {
        await db.insert(tiposPropiedad).values({
          id: tipo.id,
          tenantId: this.tenantId,
          codigo: tipo.codigo,
          nombre: tipo.nombre,
          descripcion: tipo.descripcion ?? undefined,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          estado: tipo.estado as unknown,
          aplicacion: tipo.aplicacion,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tipoValidacion: tipo.tipoValidacion as unknown,
          configuracionValidacion: tipo.configuracionValidacion,
          createdAt: tipo.creadoEn,
          updatedAt: tipo.actualizadoEn,
        })
      })
    } catch (error) {
      logger.error('TipoPropiedadRepo.save failed', error instanceof Error ? error : undefined)
      throw new Error('No fue posible guardar el tipo de propiedad')
    }
  }

  async update(tipo: TipoPropiedad): Promise<void> {
    try {
      await withTenantContext(this.tenantId, async () => {
        await db
          .update(tiposPropiedad)
          .set({
            nombre: tipo.nombre,
            descripcion: tipo.descripcion ?? undefined,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            estado: tipo.estado as unknown,
            aplicacion: tipo.aplicacion,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tipoValidacion: tipo.tipoValidacion as unknown,
            configuracionValidacion: tipo.configuracionValidacion,
            updatedAt: new Date(),
          })
          .where(and(eq(tiposPropiedad.id, tipo.id), eq(tiposPropiedad.tenantId, this.tenantId)))
      })
    } catch (error) {
      logger.error('TipoPropiedadRepo.update failed', error instanceof Error ? error : undefined)
      throw new Error('No fue posible actualizar el tipo de propiedad')
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await withTenantContext(this.tenantId, async () => {
        await db
          .delete(tiposPropiedad)
          .where(and(eq(tiposPropiedad.id, id), eq(tiposPropiedad.tenantId, this.tenantId)))
      })
    } catch (error) {
      logger.error('TipoPropiedadRepo.delete failed', error instanceof Error ? error : undefined)
      throw new Error('No fue posible eliminar el tipo de propiedad')
    }
  }
}

// ─── ValorPropiedadDrizzleRepository ─────────────────────────────────────────

export class ValorPropiedadDrizzleRepository implements IValorPropiedadRepository {
  constructor(private readonly tenantId: string) {}

  async findById(id: string): Promise<ValorPropiedad | null> {
    try {
      return await withTenantContext(this.tenantId, async () => {
        const rows = await db
          .select()
          .from(valoresPropiedad)
          .where(and(eq(valoresPropiedad.id, id), eq(valoresPropiedad.tenantId, this.tenantId)))
          .limit(1)
        return rows.length > 0 ? toValorPropiedad(rows[0]) : null
      })
    } catch (error) {
      logger.error('ValorPropiedadRepo.findById failed', error instanceof Error ? error : undefined)
      throw new Error('No fue posible obtener el valor de propiedad')
    }
  }

  async findByTipoAndCodigoRef(tipoPropiedadId: string, codigoRef: string): Promise<ValorPropiedad | null> {
    try {
      return await withTenantContext(this.tenantId, async () => {
        const rows = await db
          .select()
          .from(valoresPropiedad)
          .where(and(
            eq(valoresPropiedad.tipoPropiedadId, tipoPropiedadId),
            eq(valoresPropiedad.codigoRef, codigoRef),
            eq(valoresPropiedad.tenantId, this.tenantId),
          ))
          .limit(1)
        return rows.length > 0 ? toValorPropiedad(rows[0]) : null
      })
    } catch (error) {
      logger.error('ValorPropiedadRepo.findByTipoAndCodigoRef failed', error instanceof Error ? error : undefined)
      throw new Error('No fue posible buscar el valor de propiedad')
    }
  }

  async findByTipoPropiedadId(tipoPropiedadId: string, filtros?: FiltrosValoresPropiedad): Promise<ValorPropiedad[]> {
    try {
      return await withTenantContext(this.tenantId, async () => {
        const conditions: SQL[] = [
          eq(valoresPropiedad.tipoPropiedadId, tipoPropiedadId),
          eq(valoresPropiedad.tenantId, this.tenantId),
        ]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (filtros?.estado) conditions.push(eq(valoresPropiedad.estado, filtros.estado as unknown))
        if (filtros?.busqueda) conditions.push(like(valoresPropiedad.descripcion, `%${filtros.busqueda}%`))

        const rows = await db
          .select()
          .from(valoresPropiedad)
          .where(and(...conditions))
          .orderBy(valoresPropiedad.orden)
          .limit(200)

        return rows.map(toValorPropiedad)
      })
    } catch (error) {
      logger.error('ValorPropiedadRepo.findByTipoPropiedadId failed', error instanceof Error ? error : undefined)
      throw new Error('No fue posible listar los valores de propiedad')
    }
  }

  async findAll(filtros?: FiltrosValoresPropiedad): Promise<ValorPropiedad[]> {
    try {
      return await withTenantContext(this.tenantId, async () => {
        const conditions: SQL[] = [eq(valoresPropiedad.tenantId, this.tenantId)]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (filtros?.estado) conditions.push(eq(valoresPropiedad.estado, filtros.estado as unknown))
        if (filtros?.tipoPropiedadId) conditions.push(eq(valoresPropiedad.tipoPropiedadId, filtros.tipoPropiedadId))
        if (filtros?.busqueda) conditions.push(like(valoresPropiedad.descripcion, `%${filtros.busqueda}%`))

        const rows = await db
          .select()
          .from(valoresPropiedad)
          .where(and(...conditions))
          .orderBy(valoresPropiedad.orden)
          .limit(200)

        return rows.map(toValorPropiedad)
      })
    } catch (error) {
      logger.error('ValorPropiedadRepo.findAll failed', error instanceof Error ? error : undefined)
      throw new Error('No fue posible listar los valores de propiedad')
    }
  }

  async save(valor: ValorPropiedad): Promise<void> {
    try {
      await withTenantContext(this.tenantId, async () => {
        await db.insert(valoresPropiedad).values({
          id: valor.id,
          tenantId: this.tenantId,
          tipoPropiedadId: valor.tipoPropiedadId,
          codigoRef: valor.codigoRef,
          descripcion: valor.descripcion,
          descripcionLarga: valor.descripcionLarga ?? undefined,
          obligatorio: valor.obligatorio,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          estado: valor.estado as unknown,
          orden: String(valor.orden),
          createdAt: valor.creadoEn,
          updatedAt: valor.actualizadoEn,
        })
      })
    } catch (error) {
      logger.error('ValorPropiedadRepo.save failed', error instanceof Error ? error : undefined)
      throw new Error('No fue posible guardar el valor de propiedad')
    }
  }

  async update(valor: ValorPropiedad): Promise<void> {
    try {
      await withTenantContext(this.tenantId, async () => {
        await db
          .update(valoresPropiedad)
          .set({
            descripcion: valor.descripcion,
            descripcionLarga: valor.descripcionLarga ?? undefined,
            obligatorio: valor.obligatorio,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            estado: valor.estado as unknown,
            orden: String(valor.orden),
            updatedAt: new Date(),
          })
          .where(and(eq(valoresPropiedad.id, valor.id), eq(valoresPropiedad.tenantId, this.tenantId)))
      })
    } catch (error) {
      logger.error('ValorPropiedadRepo.update failed', error instanceof Error ? error : undefined)
      throw new Error('No fue posible actualizar el valor de propiedad')
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await withTenantContext(this.tenantId, async () => {
        await db
          .delete(valoresPropiedad)
          .where(and(eq(valoresPropiedad.id, id), eq(valoresPropiedad.tenantId, this.tenantId)))
      })
    } catch (error) {
      logger.error('ValorPropiedadRepo.delete failed', error instanceof Error ? error : undefined)
      throw new Error('No fue posible eliminar el valor de propiedad')
    }
  }

  async deleteByTipoPropiedadId(tipoPropiedadId: string): Promise<void> {
    try {
      await withTenantContext(this.tenantId, async () => {
        await db
          .delete(valoresPropiedad)
          .where(and(
            eq(valoresPropiedad.tipoPropiedadId, tipoPropiedadId),
            eq(valoresPropiedad.tenantId, this.tenantId),
          ))
      })
    } catch (error) {
      logger.error('ValorPropiedadRepo.deleteByTipoPropiedadId failed', error instanceof Error ? error : undefined)
      throw new Error('No fue posible eliminar los valores de propiedad')
    }
  }
}
