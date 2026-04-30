/**
 * REPOSITORY: CUPO COMERCIAL DRIZZLE REPOSITORY
 *
 * @description Implementación de ICupoComercialRepository usando Drizzle ORM.
 * @version 1.0.0
 */

import { getDB } from '@/lib/db'
import { cupoComercial } from '@/lib/db/vencimientos-schema'
import { eq, and, gte, lte, sql, desc, isNull } from 'drizzle-orm'
import type { InferSelectModel } from 'drizzle-orm'

import { CupoComercial, type CupoComercialProps, type HistorialModificacion } from '../../domain/entities/CupoComercial.js'
import { TipoAuspicio } from '../../domain/value-objects/TipoAuspicio.js'
import { EstadoAuspicio } from '../../domain/value-objects/EstadoAuspicio.js'
import { ValorComercial } from '../../domain/value-objects/ValorComercial.js'
import { PeriodoVigencia } from '../../domain/value-objects/PeriodoVigencia.js'
import type { ICupoComercialRepository, CupoBusquedaCriteria } from '../../domain/repositories/ICupoComercialRepository.js'

type CupoRow = InferSelectModel<typeof cupoComercial>

function mapRowToEntity(row: CupoRow): CupoComercial {
  const historial: HistorialModificacion[] = row.historialModificaciones
    ? JSON.parse(row.historialModificaciones)
    : []

  const props: CupoComercialProps = {
    id: row.id,
    programaId: row.programaId ?? '',
    programaNombre: '',
    emisoraId: row.emisoraId ?? '',
    emisoraNombre: '',
    slotId: row.id,
    tipoAuspicio: TipoAuspicio.fromString(row.tipoAuspicio ?? 'tipo_a'),
    estado: EstadoAuspicio.fromString(row.estado ?? 'pendiente'),
    clienteId: row.clienteId ?? '',
    clienteNombre: row.clienteNombre ?? '',
    clienteRubro: '',
    inversion: ValorComercial.sinDescuento(Number(row.valor) || 0, 'CLP'),
    valorAuspicioCompleto: Number(row.valor) || 0,
    valorMencionesIndividual: 0,
    periodoVigencia: PeriodoVigencia.fromPersistence({
      fechaInicio: row.fechaInicio ? new Date(row.fechaInicio) : new Date(),
      fechaFin: row.fechaFin ? new Date(row.fechaFin) : new Date(),
    }),
    fechaIngresoCliente: row.createdAt ? new Date(row.createdAt) : new Date(),
    ejecutivoId: row.ejecutivoId ?? '',
    ejecutivoNombre: row.ejecutivoNombre ?? '',
    numeroExtensiones: 0,
    extensionesHistorial: [],
    historialModificaciones: historial,
    fechaCreacion: row.createdAt ? new Date(row.createdAt) : new Date(),
    fechaActualizacion: row.updatedAt ? new Date(row.updatedAt) : new Date(),
    creadoPor: '',
    actualizadoPor: '',
    version: row.version ?? 1,
  }

  return CupoComercial.fromPersistence(props)
}

function mapEntityToRow(cupo: CupoComercial): Omit<CupoRow, 'createdAt' | 'updatedAt'> {
  const snap = cupo.toSnapshot()
  return {
    id: snap.id,
    tenantId: 'default', // Se sobrescribe en la capa de aplicación con withTenantContext
    programaId: snap.programaId,
    emisoraId: snap.emisoraId,
    clienteId: snap.clienteId || null,
    clienteNombre: snap.clienteNombre || null,
    ejecutivoId: snap.ejecutivoId || null,
    ejecutivoNombre: snap.ejecutivoNombre || null,
    tipoAuspicio: snap.tipoAuspicio.valor,
    estado: snap.estado.valor,
    fechaInicio: snap.periodoVigencia.fechaInicio.toISOString().split('T')[0] as unknown as Date,
    fechaFin: snap.periodoVigencia.fechaFin.toISOString().split('T')[0] as unknown as Date,
    valor: snap.inversion.valorFinal.toString(),
    historialModificaciones: JSON.stringify(snap.historialModificaciones),
    version: snap.version,
  }
}

export class CupoComercialDrizzleRepository implements ICupoComercialRepository {
  async save(cupo: CupoComercial): Promise<void> {
    try {
      const db = getDB()
      const row = mapEntityToRow(cupo)

      await db.insert(cupoComercial).values(row as CupoRow).onConflictDoUpdate({
        target: cupoComercial.id,
        set: {
          estado: row.estado,
          fechaInicio: row.fechaInicio,
          fechaFin: row.fechaFin,
          valor: row.valor,
          historialModificaciones: row.historialModificaciones,
          version: (row.version ?? 1) + 1,
          updatedAt: new Date(),
        },
      })
    } catch (error) {
      console.error('[CupoComercialRepository] save error:', error)
      throw error
    }
  }

  async findById(id: string): Promise<CupoComercial | null> {
    try {
      const db = getDB()
      const result = await db.select().from(cupoComercial)
        .where(eq(cupoComercial.id, id))
        .limit(1)
      return result.length ? mapRowToEntity(result[0]) : null
    } catch (error) {
      console.error('[CupoComercialRepository] findById error:', error)
      return null
    }
  }

  async findByPrograma(programaId: string): Promise<CupoComercial[]> {
    try {
      const db = getDB()
      const result = await db.select().from(cupoComercial)
        .where(eq(cupoComercial.programaId, programaId))
        .orderBy(desc(cupoComercial.createdAt))
      return result.map(mapRowToEntity)
    } catch (error) {
      console.error('[CupoComercialRepository] findByPrograma error:', error)
      return []
    }
  }

  async findByEmisora(emisoraId: string): Promise<CupoComercial[]> {
    try {
      const db = getDB()
      const result = await db.select().from(cupoComercial)
        .where(eq(cupoComercial.emisoraId, emisoraId))
        .orderBy(desc(cupoComercial.createdAt))
      return result.map(mapRowToEntity)
    } catch (error) {
      console.error('[CupoComercialRepository] findByEmisora error:', error)
      return []
    }
  }

  async findByCliente(clienteId: string): Promise<CupoComercial[]> {
    try {
      const db = getDB()
      const result = await db.select().from(cupoComercial)
        .where(eq(cupoComercial.clienteId, clienteId))
        .orderBy(desc(cupoComercial.createdAt))
      return result.map(mapRowToEntity)
    } catch (error) {
      console.error('[CupoComercialRepository] findByCliente error:', error)
      return []
    }
  }

  async findByEjecutivo(ejecutivoId: string): Promise<CupoComercial[]> {
    try {
      const db = getDB()
      const result = await db.select().from(cupoComercial)
        .where(eq(cupoComercial.ejecutivoId, ejecutivoId))
        .orderBy(desc(cupoComercial.createdAt))
      return result.map(mapRowToEntity)
    } catch (error) {
      console.error('[CupoComercialRepository] findByEjecutivo error:', error)
      return []
    }
  }

  async findByEstado(estado: string): Promise<CupoComercial[]> {
    try {
      const db = getDB()
      const result = await db.select().from(cupoComercial)
        .where(eq(cupoComercial.estado, estado))
        .orderBy(desc(cupoComercial.createdAt))
      return result.map(mapRowToEntity)
    } catch (error) {
      console.error('[CupoComercialRepository] findByEstado error:', error)
      return []
    }
  }

  async findNoIniciados(): Promise<CupoComercial[]> {
    try {
      const db = getDB()
      const hoy = new Date().toISOString().split('T')[0]
      const result = await db.select().from(cupoComercial)
        .where(
          and(
            lte(cupoComercial.fechaInicio, hoy as unknown as Date),
            eq(cupoComercial.estado, 'confirmado')
          )
        )
        .orderBy(desc(cupoComercial.createdAt))
      return result.map(mapRowToEntity).filter(c => c.superoFechaInicio)
    } catch (error) {
      console.error('[CupoComercialRepository] findNoIniciados error:', error)
      return []
    }
  }

  async findPorVencer(dias: number): Promise<CupoComercial[]> {
    try {
      const db = getDB()
      const hoy = new Date()
      const limite = new Date()
      limite.setDate(limite.getDate() + dias)
      const hoyStr = hoy.toISOString().split('T')[0]
      const limiteStr = limite.toISOString().split('T')[0]

      const result = await db.select().from(cupoComercial)
        .where(
          and(
            gte(cupoComercial.fechaFin, hoyStr as unknown as Date),
            lte(cupoComercial.fechaFin, limiteStr as unknown as Date),
            eq(cupoComercial.estado, 'activo')
          )
        )
        .orderBy(cupoComercial.fechaFin)
      return result.map(mapRowToEntity)
    } catch (error) {
      console.error('[CupoComercialRepository] findPorVencer error:', error)
      return []
    }
  }

  async findTerminanManana(): Promise<CupoComercial[]> {
    try {
      const db = getDB()
      const manana = new Date()
      manana.setDate(manana.getDate() + 1)
      const pasado = new Date()
      pasado.setDate(pasado.getDate() + 2)
      const mStr = manana.toISOString().split('T')[0]
      const pStr = pasado.toISOString().split('T')[0]

      const result = await db.select().from(cupoComercial)
        .where(
          and(
            gte(cupoComercial.fechaFin, mStr as unknown as Date),
            lte(cupoComercial.fechaFin, pStr as unknown as Date),
            eq(cupoComercial.estado, 'activo')
          )
        )
      return result.map(mapRowToEntity)
    } catch (error) {
      console.error('[CupoComercialRepository] findTerminanManana error:', error)
      return []
    }
  }

  async findTerminanHoy(): Promise<CupoComercial[]> {
    try {
      const db = getDB()
      const hoy = new Date()
      const manana = new Date()
      manana.setDate(manana.getDate() + 1)
      const hStr = hoy.toISOString().split('T')[0]
      const mStr = manana.toISOString().split('T')[0]

      const result = await db.select().from(cupoComercial)
        .where(
          and(
            gte(cupoComercial.fechaFin, hStr as unknown as Date),
            lte(cupoComercial.fechaFin, mStr as unknown as Date),
            eq(cupoComercial.estado, 'activo')
          )
        )
      return result.map(mapRowToEntity)
    } catch (error) {
      console.error('[CupoComercialRepository] findTerminanHoy error:', error)
      return []
    }
  }

  async search(criteria: CupoBusquedaCriteria): Promise<{ cupos: CupoComercial[]; total: number }> {
    try {
      const db = getDB()
      const offset = (criteria.pagina - 1) * criteria.tamanoPagina
      const conditions: Parameters<typeof and>[0][] = []

      if (criteria.programaId) conditions.push(eq(cupoComercial.programaId, criteria.programaId))
      if (criteria.emisoraId) conditions.push(eq(cupoComercial.emisoraId, criteria.emisoraId))
      if (criteria.clienteId) conditions.push(eq(cupoComercial.clienteId, criteria.clienteId))
      if (criteria.ejecutivoId) conditions.push(eq(cupoComercial.ejecutivoId, criteria.ejecutivoId))
      if (criteria.estado) conditions.push(eq(cupoComercial.estado, criteria.estado))
      if (criteria.tipoAuspicio) conditions.push(eq(cupoComercial.tipoAuspicio, criteria.tipoAuspicio))
      if (criteria.fechaDesde) conditions.push(gte(cupoComercial.fechaInicio, criteria.fechaDesde.toISOString().split('T')[0] as unknown as Date))
      if (criteria.fechaHasta) conditions.push(lte(cupoComercial.fechaFin, criteria.fechaHasta.toISOString().split('T')[0] as unknown as Date))

      const whereClause = conditions.length ? and(...conditions) : undefined

      const countResult = await db.select({ count: sql<number>`count(*)::int` })
        .from(cupoComercial)
        .where(whereClause)

      const total = countResult[0]?.count || 0

      const result = await db.select().from(cupoComercial)
        .where(whereClause)
        .orderBy(desc(cupoComercial.createdAt))
        .limit(criteria.tamanoPagina)
        .offset(offset)

      return { cupos: result.map(mapRowToEntity), total }
    } catch (error) {
      console.error('[CupoComercialRepository] search error:', error)
      return { cupos: [], total: 0 }
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const db = getDB()
      await db.delete(cupoComercial).where(eq(cupoComercial.id, id))
    } catch (error) {
      console.error('[CupoComercialRepository] delete error:', error)
      throw error
    }
  }

  async saveMany(cupos: CupoComercial[]): Promise<void> {
    if (cupos.length === 0) return
    try {
      const db = getDB()
      const rows = cupos.map(mapEntityToRow)
      await db.insert(cupoComercial).values(rows as CupoRow[])
    } catch (error) {
      console.error('[CupoComercialRepository] saveMany error:', error)
      throw error
    }
  }
}

export default CupoComercialDrizzleRepository
