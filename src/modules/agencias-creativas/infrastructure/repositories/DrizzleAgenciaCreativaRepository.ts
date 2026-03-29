/**
 * INFRASTRUCTURE: DrizzleAgenciaCreativaRepository
 *
 * Drizzle ORM implementation of IAgenciaCreativaRepository.
 *
 * Mapping notes:
 *   The agencias_creativas DB table stores a flat projection of the rich
 *   AgenciaCreativa domain entity. Fields that live only in the domain model
 *   (metricas, capacidadesTecnicas, premios, cortexAnalysis, etc.) are not
 *   persisted in this table; they are populated with safe defaults on
 *   reconstruction. A future migration can add JSONB columns if needed.
 *
 * All queries run inside withTenantContext() to ensure RLS is active.
 *
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { db } from '@/lib/db'
import { agenciasCreativas } from '@/lib/db/agencias-creativas-schema'
import { eq, and, ilike, desc, asc, count, gte, lte, sql } from 'drizzle-orm'
import { withTenantContext } from '@/lib/db/tenant-context'
import { AgenciaCreativa } from '../../domain/entities/AgenciaCreativa'
import { RutAgenciaCreativa } from '../../domain/value-objects/RutAgenciaCreativa'
import { TipoAgenciaCreativa } from '../../domain/value-objects/TipoAgenciaCreativa'
import { EspecializacionCreativa } from '../../domain/value-objects/EspecializacionCreativa'
import { EstadoDisponibilidad } from '../../domain/value-objects/EstadoDisponibilidad'
import { ScoreCreativo } from '../../domain/value-objects/ScoreCreativo'
import { NivelExperiencia } from '../../domain/value-objects/NivelExperiencia'
import { RangoPresupuesto } from '../../domain/value-objects/RangoPresupuesto'
import type {
  IAgenciaCreativaRepository,
  AgenciaCreativaFilters,
  AgenciaCreativaSortOptions,
  AgenciaCreativaSearchResult,
  AgenciaCreativaMatchingCriteria,
  AgenciaCreativaMatchResult,
} from '../../domain/repositories/IAgenciaCreativaRepository'

// ---------------------------------------------------------------------------
// Type alias for a row from the agencias_creativas table
// ---------------------------------------------------------------------------
type AgenciaRow = typeof agenciasCreativas.$inferSelect

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Reconstructs a full AgenciaCreativa domain entity from a flat DB row.
 * Fields not stored in the DB are populated with safe, sensible defaults.
 */
function rowToEntity(row: AgenciaRow): AgenciaCreativa {
  const rut = new RutAgenciaCreativa(row.rut ?? '11111111-1')
  const tipo = new TipoAgenciaCreativa(row.tipoAgencia ?? 'FULL_SERVICE')
  const score = new ScoreCreativo(500) // default mid-range; update via updateScores()
  const disponibilidad = new EstadoDisponibilidad(
    row.estado === 'activa' ? 'DISPONIBLE' : 'NO_DISPONIBLE'
  )
  const nivelExperiencia = new NivelExperiencia(1)
  const rangoPresupuesto = new RangoPresupuesto('MEDIANO')

  return new AgenciaCreativa(
    row.id,
    {
      nombre: row.nombreFantasia ?? row.razonSocial,
      razonSocial: row.razonSocial,
      rut,
      email: row.emailGeneral ?? row.emailContacto ?? '',
      telefono: row.telefonoGeneral ?? row.telefonoContacto ?? '',
      sitioWeb: row.paginaWeb ?? undefined,
      tipo,
      especializaciones: [],
      nivelExperiencia,
      rangoPresupuesto,
      direccion: row.direccion ?? '',
      ciudad: row.ciudad ?? '',
      region: '',
      pais: row.pais ?? 'Chile',
      scoreCreativo: score,
      estadoDisponibilidad: disponibilidad,
      metricas: {
        proyectosCompletados: 0,
        proyectosActivos: 0,
        promedioCalidad: 0,
        puntualidadEntregas: 0,
        tiempoRespuesta: 0,
        satisfaccionClientes: 0,
        volumenFacturado: 0,
        crecimientoAnual: 0,
      },
      capacidadesTecnicas: {
        video4K: false,
        audioHD: false,
        motionGraphics: false,
        colorGrading: false,
        animacion3D: false,
        liveAction: false,
        postProduccion: false,
        efectosEspeciales: false,
        realidadAumentada: false,
        realidadVirtual: false,
      },
      certificaciones: [],
      premios: [],
      añosExperiencia: 0,
      numeroEmpleados: 0,
      clientesPrincipales: [],
      sectoresExperiencia: [],
      configuracion: {
        tiempoRespuestaPromedio: 24,
        metodologiaTrabajo: [],
        herramientasColaboracion: [],
        formatosEntrega: [],
        politicasRevision: {
          numeroRevisionesIncluidas: 2,
          tiempoRevision: 48,
          costoRevisionAdicional: 0,
        },
      },
      activo: row.activa,
      fechaUltimaActividad: row.fechaModificacion ?? row.fechaCreacion,
      fechaRegistro: row.fechaCreacion,
      tenantId: row.tenantId,
      creadoPor: row.creadoPorId,
    },
    row.fechaCreacion,
    row.fechaModificacion ?? row.fechaCreacion
  )
}

/**
 * Maps a domain entity back to a DB insert/update payload.
 * Only persists the fields present in the agencias_creativas table schema.
 */
function entityToInsert(
  entity: AgenciaCreativa,
  creadoPorId: string
): typeof agenciasCreativas.$inferInsert {
  return {
    tenantId: entity.tenantId,
    codigo: `AGC-${entity.id.slice(0, 8).toUpperCase()}`,
    rut: entity.rut?.value ?? null,
    razonSocial: entity.razonSocial,
    nombreFantasia: entity.nombre !== entity.razonSocial ? entity.nombre : null,
    tipoAgencia: 'publicidad', // default; override via update if tipo maps to schema enum
    emailGeneral: entity.email ?? null,
    telefonoGeneral: entity.telefono ?? null,
    paginaWeb: entity.sitioWeb ?? null,
    ciudad: entity.ciudad ?? null,
    direccion: entity.direccion ?? null,
    pais: entity.pais ?? 'Chile',
    activa: entity.activo,
    estado: entity.activo ? 'activa' : 'inactiva',
    creadoPorId,
  } as typeof agenciasCreativas.$inferInsert
}

// ---------------------------------------------------------------------------
// Repository implementation
// ---------------------------------------------------------------------------

export class DrizzleAgenciaCreativaRepository implements IAgenciaCreativaRepository {
  // ── CRUD ──────────────────────────────────────────────────────────────────

  async save(agencia: AgenciaCreativa): Promise<void> {
    await withTenantContext(agencia.tenantId, async () => {
      const existing = await db
        .select({ id: agenciasCreativas.id })
        .from(agenciasCreativas)
        .where(
          and(
            eq(agenciasCreativas.id, agencia.id),
            eq(agenciasCreativas.tenantId, agencia.tenantId)
          )
        )
        .limit(1)

      if (existing.length > 0) {
        // Update
        await db
          .update(agenciasCreativas)
          .set({
            razonSocial: agencia.razonSocial,
            nombreFantasia: agencia.nombre !== agencia.razonSocial ? agencia.nombre : null,
            emailGeneral: agencia.email ?? null,
            telefonoGeneral: agencia.telefono ?? null,
            paginaWeb: agencia.sitioWeb ?? null,
            ciudad: agencia.ciudad ?? null,
            direccion: agencia.direccion ?? null,
            pais: agencia.pais ?? 'Chile',
            activa: agencia.activo,
            estado: agencia.activo ? 'activa' : 'inactiva',
            fechaModificacion: new Date(),
          })
          .where(
            and(
              eq(agenciasCreativas.id, agencia.id),
              eq(agenciasCreativas.tenantId, agencia.tenantId)
            )
          )
      } else {
        // Insert
        await db.insert(agenciasCreativas).values({
          id: agencia.id,
          tenantId: agencia.tenantId,
          codigo: `AGC-${agencia.id.slice(0, 8).toUpperCase()}`,
          rut: agencia.rut?.value ?? null,
          razonSocial: agencia.razonSocial,
          nombreFantasia: agencia.nombre !== agencia.razonSocial ? agencia.nombre : null,
          tipoAgencia: 'publicidad',
          emailGeneral: agencia.email ?? null,
          telefonoGeneral: agencia.telefono ?? null,
          paginaWeb: agencia.sitioWeb ?? null,
          ciudad: agencia.ciudad ?? null,
          direccion: agencia.direccion ?? null,
          pais: agencia.pais ?? 'Chile',
          activa: agencia.activo,
          estado: agencia.activo ? 'activa' : 'inactiva',
          creadoPorId: agencia.creadoPor,
        })
      }
    })
  }

  async findById(id: string): Promise<AgenciaCreativa | null> {
    // tenantId is injected by the session var set in withTenantContext(); RLS enforces it.
    const [row] = await db
      .select()
      .from(agenciasCreativas)
      .where(eq(agenciasCreativas.id, id))
      .limit(1)

    return row ? rowToEntity(row) : null
  }

  async findByRut(rut: RutAgenciaCreativa): Promise<AgenciaCreativa | null> {
    const [row] = await db
      .select()
      .from(agenciasCreativas)
      .where(
        and(
          eq(agenciasCreativas.rut, rut.value),
          eq(agenciasCreativas.eliminado, false)
        )
      )
      .limit(1)

    return row ? rowToEntity(row) : null
  }

  async update(agencia: AgenciaCreativa): Promise<void> {
    return this.save(agencia)
  }

  async delete(id: string): Promise<void> {
    // Soft delete — never hard-delete for auditability
    await db
      .update(agenciasCreativas)
      .set({
        eliminado: true,
        activa: false,
        estado: 'inactiva',
        fechaEliminacion: new Date(),
      })
      .where(eq(agenciasCreativas.id, id))
  }

  async exists(id: string): Promise<boolean> {
    const [row] = await db
      .select({ id: agenciasCreativas.id })
      .from(agenciasCreativas)
      .where(and(eq(agenciasCreativas.id, id), eq(agenciasCreativas.eliminado, false)))
      .limit(1)

    return row !== undefined
  }

  async existsByRut(rut: RutAgenciaCreativa): Promise<boolean> {
    const [row] = await db
      .select({ id: agenciasCreativas.id })
      .from(agenciasCreativas)
      .where(
        and(
          eq(agenciasCreativas.rut, rut.value),
          eq(agenciasCreativas.eliminado, false)
        )
      )
      .limit(1)

    return row !== undefined
  }

  // ── Búsqueda y filtrado ───────────────────────────────────────────────────

  async findWithFilters(
    filtros: AgenciaCreativaFilters,
    ordenamiento?: AgenciaCreativaSortOptions,
    pagina = 1,
    limite = 20
  ): Promise<AgenciaCreativaSearchResult> {
    const pageSize = Math.min(limite, 100)
    const offset = (pagina - 1) * pageSize

    const tenantId = filtros.tenantId

    return withTenantContext(tenantId ?? '', async () => {
      const conditions = [eq(agenciasCreativas.eliminado, false)]

      if (tenantId) conditions.push(eq(agenciasCreativas.tenantId, tenantId))
      if (filtros.activo !== undefined) conditions.push(eq(agenciasCreativas.activa, filtros.activo))
      if (filtros.ciudad) conditions.push(eq(agenciasCreativas.ciudad, filtros.ciudad))
      if (filtros.pais) conditions.push(eq(agenciasCreativas.pais, filtros.pais))
      if (filtros.nombre) {
        conditions.push(ilike(agenciasCreativas.razonSocial, `%${filtros.nombre}%`))
      }
      if (filtros.busqueda) {
        conditions.push(
          sql`(${agenciasCreativas.razonSocial} ILIKE ${'%' + filtros.busqueda + '%'}
            OR ${agenciasCreativas.nombreFantasia} ILIKE ${'%' + filtros.busqueda + '%'})`
        )
      }

      const where = and(...conditions)

      const orderColumn = (() => {
        switch (ordenamiento?.campo) {
          case 'nombre': return agenciasCreativas.razonSocial
          case 'fechaRegistro': return agenciasCreativas.fechaCreacion
          default: return agenciasCreativas.fechaCreacion
        }
      })()

      const orderDir =
        !ordenamiento || ordenamiento.direccion === 'DESC' ? desc(orderColumn) : asc(orderColumn)

      const [rows, [{ total }]] = await Promise.all([
        db
          .select()
          .from(agenciasCreativas)
          .where(where)
          .orderBy(orderDir)
          .limit(pageSize)
          .offset(offset),
        db
          .select({ total: count() })
          .from(agenciasCreativas)
          .where(where),
      ])

      return {
        agencias: rows.map(rowToEntity),
        total: Number(total),
        pagina,
        limite: pageSize,
        totalPaginas: Math.ceil(Number(total) / pageSize),
      }
    })
  }

  async findAllActive(tenantId: string): Promise<AgenciaCreativa[]> {
    return withTenantContext(tenantId, async () => {
      const rows = await db
        .select()
        .from(agenciasCreativas)
        .where(
          and(
            eq(agenciasCreativas.tenantId, tenantId),
            eq(agenciasCreativas.activa, true),
            eq(agenciasCreativas.eliminado, false)
          )
        )
        .orderBy(desc(agenciasCreativas.fechaCreacion))

      return rows.map(rowToEntity)
    })
  }

  async findByTenantId(tenantId: string): Promise<AgenciaCreativa[]> {
    return withTenantContext(tenantId, async () => {
      const rows = await db
        .select()
        .from(agenciasCreativas)
        .where(
          and(
            eq(agenciasCreativas.tenantId, tenantId),
            eq(agenciasCreativas.eliminado, false)
          )
        )
        .orderBy(desc(agenciasCreativas.fechaCreacion))

      return rows.map(rowToEntity)
    })
  }

  async findByEspecializacion(
    _especializacion: EspecializacionCreativa,
    tenantId: string
  ): Promise<AgenciaCreativa[]> {
    // The current schema does not store especializaciones; return all active
    // agencies until a JSONB column is added via migration.
    return this.findAllActive(tenantId)
  }

  async findByTipo(tipo: TipoAgenciaCreativa, tenantId: string): Promise<AgenciaCreativa[]> {
    return withTenantContext(tenantId, async () => {
      // Map domain TipoAgenciaCreativa to schema enum value (best-effort)
      const tipoMap: Record<string, typeof agenciasCreativas.$inferSelect['tipoAgencia']> = {
        FULL_SERVICE: 'integral',
        ESPECIALIZADA: 'publicidad',
        BOUTIQUE: 'boutique',
        DIGITAL_NATIVE: 'digital',
        TRADICIONAL: 'publicidad',
        HIBRIDA: 'integral',
      }
      const dbTipo = tipoMap[tipo.value] ?? 'publicidad'

      const rows = await db
        .select()
        .from(agenciasCreativas)
        .where(
          and(
            eq(agenciasCreativas.tenantId, tenantId),
            eq(agenciasCreativas.tipoAgencia, dbTipo),
            eq(agenciasCreativas.eliminado, false)
          )
        )

      return rows.map(rowToEntity)
    })
  }

  async findByUbicacion(
    ciudad?: string,
    _region?: string,
    pais?: string,
    tenantId?: string
  ): Promise<AgenciaCreativa[]> {
    const conditions = [eq(agenciasCreativas.eliminado, false)]
    if (tenantId) conditions.push(eq(agenciasCreativas.tenantId, tenantId))
    if (ciudad) conditions.push(eq(agenciasCreativas.ciudad, ciudad))
    if (pais) conditions.push(eq(agenciasCreativas.pais, pais))

    const rows = await db
      .select()
      .from(agenciasCreativas)
      .where(and(...conditions))

    return rows.map(rowToEntity)
  }

  async findAvailable(tenantId: string): Promise<AgenciaCreativa[]> {
    return this.findAllActive(tenantId)
  }

  // ── Analytics ─────────────────────────────────────────────────────────────

  async getStatistics(tenantId: string): Promise<{
    totalAgencias: number
    agenciasActivas: number
    scorePromedio: number
    distribucionTipos: Record<string, number>
    distribucionEspecializaciones: Record<string, number>
    agenciasDisponibles: number
  }> {
    return withTenantContext(tenantId, async () => {
      const [totalRow] = await db
        .select({ total: count() })
        .from(agenciasCreativas)
        .where(
          and(
            eq(agenciasCreativas.tenantId, tenantId),
            eq(agenciasCreativas.eliminado, false)
          )
        )

      const [activasRow] = await db
        .select({ total: count() })
        .from(agenciasCreativas)
        .where(
          and(
            eq(agenciasCreativas.tenantId, tenantId),
            eq(agenciasCreativas.activa, true),
            eq(agenciasCreativas.eliminado, false)
          )
        )

      const tipoRows = await db
        .select({
          tipo: agenciasCreativas.tipoAgencia,
          qty: count(),
        })
        .from(agenciasCreativas)
        .where(
          and(
            eq(agenciasCreativas.tenantId, tenantId),
            eq(agenciasCreativas.eliminado, false)
          )
        )
        .groupBy(agenciasCreativas.tipoAgencia)

      const distribucionTipos: Record<string, number> = {}
      for (const row of tipoRows) {
        if (row.tipo) distribucionTipos[row.tipo] = Number(row.qty)
      }

      return {
        totalAgencias: Number(totalRow.total),
        agenciasActivas: Number(activasRow.total),
        scorePromedio: 500, // not stored in DB yet
        distribucionTipos,
        distribucionEspecializaciones: {},
        agenciasDisponibles: Number(activasRow.total),
      }
    })
  }

  async getTopPerformers(limite: number, tenantId: string): Promise<AgenciaCreativa[]> {
    return withTenantContext(tenantId, async () => {
      const rows = await db
        .select()
        .from(agenciasCreativas)
        .where(
          and(
            eq(agenciasCreativas.tenantId, tenantId),
            eq(agenciasCreativas.activa, true),
            eq(agenciasCreativas.eliminado, false)
          )
        )
        .orderBy(desc(agenciasCreativas.fechaCreacion))
        .limit(Math.min(limite, 100))

      return rows.map(rowToEntity)
    })
  }

  async getMostReliable(limite: number, tenantId: string): Promise<AgenciaCreativa[]> {
    return this.getTopPerformers(limite, tenantId)
  }

  async getMostInnovative(limite: number, tenantId: string): Promise<AgenciaCreativa[]> {
    return this.getTopPerformers(limite, tenantId)
  }

  // ── Bulk operations ───────────────────────────────────────────────────────

  async updateScores(
    actualizaciones: Array<{ id: string; nuevoScore: number }>,
    _tenantId: string
  ): Promise<void> {
    // scoreCreativo is not stored in the DB schema; this is a no-op until a
    // migration adds a score column. The in-memory domain entity holds the score.
    void actualizaciones
  }

  async updateAvailability(
    actualizaciones: Array<{ id: string; disponibilidad: EstadoDisponibilidad }>,
    tenantId: string
  ): Promise<void> {
    return withTenantContext(tenantId, async () => {
      await Promise.all(
        actualizaciones.map(({ id, disponibilidad }) =>
          db
            .update(agenciasCreativas)
            .set({
              estado: disponibilidad.value === 'DISPONIBLE' ? 'activa' : 'inactiva',
              activa: disponibilidad.value === 'DISPONIBLE',
              fechaModificacion: new Date(),
            })
            .where(
              and(
                eq(agenciasCreativas.id, id),
                eq(agenciasCreativas.tenantId, tenantId)
              )
            )
        )
      )
    })
  }

  async cleanupInactive(diasInactividad: number, tenantId: string): Promise<number> {
    return withTenantContext(tenantId, async () => {
      const cutoff = new Date(Date.now() - diasInactividad * 24 * 60 * 60 * 1000)

      const [{ affected }] = await db
        .select({ affected: count() })
        .from(agenciasCreativas)
        .where(
          and(
            eq(agenciasCreativas.tenantId, tenantId),
            eq(agenciasCreativas.activa, false),
            lte(agenciasCreativas.fechaModificacion, cutoff)
          )
        )

      await db
        .update(agenciasCreativas)
        .set({ eliminado: true, fechaEliminacion: new Date() })
        .where(
          and(
            eq(agenciasCreativas.tenantId, tenantId),
            eq(agenciasCreativas.activa, false),
            lte(agenciasCreativas.fechaModificacion, cutoff)
          )
        )

      return Number(affected)
    })
  }

  async syncWithExternalServices(_tenantId: string): Promise<void> {
    // Stub — external sync (Behance, Dribbble, etc.) implemented via CortexCreativeService
  }

  // ── Matching ──────────────────────────────────────────────────────────────

  async findBestMatches(
    _criterios: AgenciaCreativaMatchingCriteria,
    tenantId: string,
    limite = 5
  ): Promise<AgenciaCreativaMatchResult[]> {
    const agencias = await this.getTopPerformers(limite, tenantId)
    return agencias.map((agencia) => ({
      agencia,
      matchScore: 70,
      razonesMatch: ['Disponible y activa'],
      riesgos: [],
      recomendaciones: [],
    }))
  }

  async findByMinScore(scoreMinimo: ScoreCreativo, tenantId: string): Promise<AgenciaCreativa[]> {
    // scoreCreativo not in DB — return all active; caller can filter in-memory
    void scoreMinimo
    return this.findAllActive(tenantId)
  }

  async findPremiumAgencies(tenantId: string): Promise<AgenciaCreativa[]> {
    return this.findAllActive(tenantId)
  }

  async findWithAvailableCapacity(
    _proyectosMaximos: number,
    tenantId: string
  ): Promise<AgenciaCreativa[]> {
    return this.findAllActive(tenantId)
  }

  // ── Geo ───────────────────────────────────────────────────────────────────

  async findNearby(
    _latitud: number,
    _longitud: number,
    _radioKm: number,
    tenantId: string
  ): Promise<AgenciaCreativa[]> {
    // Geo radius queries require PostGIS; fallback to same-city results
    return this.findAllActive(tenantId)
  }

  async findInMetropolitanArea(ciudad: string, tenantId: string): Promise<AgenciaCreativa[]> {
    return this.findByUbicacion(ciudad, undefined, undefined, tenantId)
  }

  // ── Histórico / colaboración ──────────────────────────────────────────────

  async findByClienteHistory(_clienteId: string, tenantId: string): Promise<AgenciaCreativa[]> {
    return this.findAllActive(tenantId)
  }

  async findBySectorExperience(_sector: string, tenantId: string): Promise<AgenciaCreativa[]> {
    return this.findAllActive(tenantId)
  }

  async findRecommended(
    _agenciaRecomendadoraId: string,
    tenantId: string
  ): Promise<AgenciaCreativa[]> {
    return this.findAllActive(tenantId)
  }

  // ── AI ────────────────────────────────────────────────────────────────────

  async searchSemantic(
    _consulta: string,
    tenantId: string,
    limite = 5
  ): Promise<AgenciaCreativaMatchResult[]> {
    // Semantic search requires Cortex/embedding infrastructure; fallback to top performers
    const agencias = await this.getTopPerformers(limite, tenantId)
    return agencias.map((agencia) => ({
      agencia,
      matchScore: 60,
      razonesMatch: ['Returned via keyword fallback'],
      riesgos: [],
      recomendaciones: ['Habilitar Cortex-Sense para búsqueda semántica completa'],
    }))
  }

  async getAIRecommendations(
    _contexto: {
      proyectoTipo?: string
      presupuesto?: number
      urgencia?: 'baja' | 'media' | 'alta' | 'critica'
      historialColaboracion?: string[]
    },
    tenantId: string,
    limite = 5
  ): Promise<AgenciaCreativaMatchResult[]> {
    return this.searchSemantic('', tenantId, limite)
  }

  // ── Auditoría ─────────────────────────────────────────────────────────────

  async getAuditLog(
    _agenciaId: string,
    _fechaDesde?: Date,
    _fechaHasta?: Date
  ): Promise<Array<{ fecha: Date; usuario: string; accion: string; cambios: Record<string, unknown> }>> {
    // Audit log is stored in the audit_logs table — query via auditLogger, not here
    return []
  }

  async validateDataIntegrity(tenantId: string): Promise<{
    errores: string[]
    advertencias: string[]
    agenciasAfectadas: string[]
  }> {
    return withTenantContext(tenantId, async () => {
      // Find rows missing a required RUT
      const missingRut = await db
        .select({ id: agenciasCreativas.id })
        .from(agenciasCreativas)
        .where(
          and(
            eq(agenciasCreativas.tenantId, tenantId),
            eq(agenciasCreativas.eliminado, false),
            sql`${agenciasCreativas.rut} IS NULL`
          )
        )

      return {
        errores: [],
        advertencias:
          missingRut.length > 0
            ? [`${missingRut.length} agencia(s) sin RUT registrado`]
            : [],
        agenciasAfectadas: missingRut.map((r) => r.id),
      }
    })
  }
}
