/**
 * DrizzleCampanaRepository — Infrastructure implementation of ICampanaRepository
 * Maps between domain entities and the Drizzle schema.
 * Always executes inside withTenantContext() for RLS enforcement.
 */

import { eq, and, gte, lte, ilike, sql, count } from 'drizzle-orm';

import { db as _db } from '@/lib/db';
// DATABASE_URL is required at startup; non-null assertion is safe in server context
const db = _db!;
import { campanas as campanasTable, campanasCunas, campanasEmisoras } from '@/lib/db/campanas-schema';

// ─── Types for related records ──────────────────────────────────
export interface CampanaCunaInput {
  cunaId: string
  pesoRotacion?: number
  prioridad?: number
}

export interface CampanaEmisoraInput {
  emisoraId: string
  spotsContratados: number
  costoTotal?: number
  notas?: string
}
import { Campana } from '../../domain/entities/Campana';
import type { ICampanaRepository, CampanaFilters, CampanaPaginada } from '../../domain/repositories/ICampanaRepository';
import type { EstadoCampanaValue } from '../../domain/value-objects/EstadoCampana';
import type { TipoCampana } from '../../domain/entities/Campana';

// ─── Estado mapping: domain → DB enum ───────────────────────────
const DOMAIN_TO_DB_ESTADO: Record<EstadoCampanaValue, string> = {
  BORRADOR:   'planificacion',
  ACTIVA:     'en_aire',
  PAUSADA:    'pausada',
  FINALIZADA: 'completada',
  CANCELADA:  'cancelada',
};

const DB_TO_DOMAIN_ESTADO: Record<string, EstadoCampanaValue> = {
  planificacion: 'BORRADOR',
  armada:        'BORRADOR',
  aprobacion:    'BORRADOR',
  confirmada:    'BORRADOR',
  programada:    'BORRADOR',
  en_aire:       'ACTIVA',
  pausada:       'PAUSADA',
  completada:    'FINALIZADA',
  cancelada:     'CANCELADA',
};

// ─── Tipo mapping: domain → DB enum ─────────────────────────────
const DOMAIN_TO_DB_TIPO: Partial<Record<TipoCampana, string>> = {
  REPARTIDO:             'promocional',
  REPARTIDO_DETERMINADO: 'promocional',
  PRIME:                 'branding',
  PRIME_DETERMINADO:     'branding',
  MENCION:               'institucional',
  AUSPICIO:              'institucional',
  NOCHE:                 'estacional',
  MICRO:                 'evento',
  SENAL_HORARIA:         'mantencion',
  SENAL_TEMPERATURA:     'mantencion',
  CUSTOM:                'mantencion',
};

export class DrizzleCampanaRepository implements ICampanaRepository {

  async buscarPorId(id: string, tenantId: string): Promise<Campana | null> {
    const rows = await db
      .select()
      .from(campanasTable)
      .where(and(
        eq(campanasTable.id, id),
        eq(campanasTable.tenantId, tenantId),
        eq(campanasTable.eliminado, false),
      ))
      .limit(1);

    if (rows.length === 0) return null;
    return this._toDomain(rows[0]);
  }

  async listar(filtros: CampanaFilters, pagina: number, tamanoPagina: number): Promise<CampanaPaginada> {
    const conditions = [
      eq(campanasTable.tenantId, filtros.tenantId),
      eq(campanasTable.eliminado, false),
    ];

    if (filtros.estado) {
      const dbEstado = DOMAIN_TO_DB_ESTADO[filtros.estado];
      if (dbEstado) conditions.push(eq(campanasTable.estado, dbEstado as never));
    }
    if (filtros.anuncianteId) {
      conditions.push(eq(campanasTable.anuncianteId, filtros.anuncianteId));
    }
    if (filtros.contratoId) {
      conditions.push(eq(campanasTable.contratoId, filtros.contratoId));
    }
    if (filtros.fechaInicioDesde) {
      conditions.push(gte(campanasTable.fechaInicio, filtros.fechaInicioDesde.toISOString().split('T')[0]));
    }
    if (filtros.fechaFinHasta) {
      conditions.push(lte(campanasTable.fechaFin, filtros.fechaFinHasta.toISOString().split('T')[0]));
    }
    if (filtros.busqueda) {
      conditions.push(ilike(campanasTable.nombre, `%${filtros.busqueda}%`));
    }

    const offset = pagina * tamanoPagina;
    const where = and(...conditions);

    const [rows, [{ total }]] = await Promise.all([
      db.select().from(campanasTable).where(where).limit(tamanoPagina).offset(offset),
      db.select({ total: count() }).from(campanasTable).where(where),
    ]);

    const totalNum = Number(total);
    return {
      datos: rows.map(r => this._toDomain(r)),
      total: totalNum,
      pagina,
      tamanoPagina,
      totalPaginas: Math.ceil(totalNum / tamanoPagina),
    };
  }

  async guardar(campana: Campana): Promise<void> {
    // WHY: transaction wrapper ensures atomicity even as side-effects are added later
    await db.transaction(async (tx) => {
      await tx.insert(campanasTable).values(this._toRow(campana))
    })
  }

  /**
   * Atomic save of campana + its cunas + emisoras.
   * WHY: campana, cunas assignment, and emisoras form a single business operation.
   * If any part fails, the whole operation rolls back — no partial data.
   */
  async guardarConRelaciones(
    campana: Campana,
    cunas: CampanaCunaInput[],
    emisoras: CampanaEmisoraInput[],
  ): Promise<void> {
    await db.transaction(async (tx) => {
      // 1. Insert main campana record
      await tx.insert(campanasTable).values(this._toRow(campana))

      // 2. Insert cunas assignments
      if (cunas.length > 0) {
        await tx.insert(campanasCunas).values(
          cunas.map((c) => ({
            tenantId: campana.tenantId,
            campanaId: campana.id,
            cunaId: c.cunaId,
            pesoRotacion: c.pesoRotacion ?? 1,
            prioridad: c.prioridad ?? 0,
            activo: true,
          })),
        )
      }

      // 3. Insert emisoras assignments
      if (emisoras.length > 0) {
        await tx.insert(campanasEmisoras).values(
          emisoras.map((e) => ({
            tenantId: campana.tenantId,
            campanaId: campana.id,
            emisoraId: e.emisoraId,
            spotsContratados: e.spotsContratados,
            costoTotal: e.costoTotal != null ? String(e.costoTotal) : null,
            notas: e.notas ?? null,
            activo: true,
          })),
        )
      }
    })
  }

  async actualizar(campana: Campana): Promise<void> {
    // WHY: transaction wrapper ensures atomicity even as side-effects are added later
    await db.transaction(async (tx) => {
      await tx
        .update(campanasTable)
        .set({
          nombre: campana.nombre,
          estado: DOMAIN_TO_DB_ESTADO[campana.estado.valor] as never,
          presupuestoTotal: String(campana.presupuesto.monto),
          moneda: campana.presupuesto.moneda,
          notas: campana.observaciones ?? null,
          fechaModificacion: campana.actualizadoEn,
        })
        .where(and(
          eq(campanasTable.id, campana.id),
          eq(campanasTable.tenantId, campana.tenantId),
        ))
    })
  }

  /**
   * Atomic update of campana + full replacement of its cunas and emisoras.
   * WHY: updating a campaign's media plan (cunas + emisoras) must be atomic —
   * reading a half-updated plan would produce incorrect emission scheduling.
   */
  async actualizarConRelaciones(
    campana: Campana,
    cunas: CampanaCunaInput[],
    emisoras: CampanaEmisoraInput[],
  ): Promise<void> {
    await db.transaction(async (tx) => {
      // 1. Update main campana record
      await tx
        .update(campanasTable)
        .set({
          nombre: campana.nombre,
          estado: DOMAIN_TO_DB_ESTADO[campana.estado.valor] as never,
          presupuestoTotal: String(campana.presupuesto.monto),
          moneda: campana.presupuesto.moneda,
          notas: campana.observaciones ?? null,
          fechaModificacion: campana.actualizadoEn,
        })
        .where(and(
          eq(campanasTable.id, campana.id),
          eq(campanasTable.tenantId, campana.tenantId),
        ))

      // 2. Replace cunas: deactivate all, then insert new set
      if (cunas.length > 0) {
        await tx
          .update(campanasCunas)
          .set({ activo: false })
          .where(and(
            eq(campanasCunas.campanaId, campana.id),
            eq(campanasCunas.tenantId, campana.tenantId),
          ))
        await tx.insert(campanasCunas).values(
          cunas.map((c) => ({
            tenantId: campana.tenantId,
            campanaId: campana.id,
            cunaId: c.cunaId,
            pesoRotacion: c.pesoRotacion ?? 1,
            prioridad: c.prioridad ?? 0,
            activo: true,
          })),
        )
      }

      // 3. Replace emisoras: deactivate all, then insert new set
      if (emisoras.length > 0) {
        await tx
          .update(campanasEmisoras)
          .set({ activo: false })
          .where(and(
            eq(campanasEmisoras.campanaId, campana.id),
            eq(campanasEmisoras.tenantId, campana.tenantId),
          ))
        await tx.insert(campanasEmisoras).values(
          emisoras.map((e) => ({
            tenantId: campana.tenantId,
            campanaId: campana.id,
            emisoraId: e.emisoraId,
            spotsContratados: e.spotsContratados,
            costoTotal: e.costoTotal != null ? String(e.costoTotal) : null,
            notas: e.notas ?? null,
            activo: true,
          })),
        )
      }
    })
  }

  async existePorNumero(numero: string, tenantId: string): Promise<boolean> {
    const rows = await db
      .select({ id: campanasTable.id })
      .from(campanasTable)
      .where(and(
        eq(campanasTable.tenantId, tenantId),
        eq(campanasTable.codigo, numero),
        eq(campanasTable.eliminado, false),
      ))
      .limit(1);
    return rows.length > 0;
  }

  async obtenerSiguienteSecuencial(tenantId: string, anio: number): Promise<number> {
    const prefix = `CAMP-${anio}-`;
    const [{ maxCodigo }] = await db
      .select({ maxCodigo: sql<string>`MAX(codigo)` })
      .from(campanasTable)
      .where(and(
        eq(campanasTable.tenantId, tenantId),
        sql`codigo LIKE ${prefix + '%'}`,
      ));

    if (!maxCodigo) return 1;
    const parts = maxCodigo.split('-');
    const lastNum = parseInt(parts[parts.length - 1] ?? '0', 10);
    return isNaN(lastNum) ? 1 : lastNum + 1;
  }

  async listarProximasAVencer(tenantId: string, diasUmbral: number): Promise<Campana[]> {
    const umbral = new Date();
    umbral.setDate(umbral.getDate() + diasUmbral);

    const rows = await db
      .select()
      .from(campanasTable)
      .where(and(
        eq(campanasTable.tenantId, tenantId),
        eq(campanasTable.estado, 'en_aire' as never),
        eq(campanasTable.eliminado, false),
        lte(campanasTable.fechaFin, umbral.toISOString().split('T')[0]),
      ));

    return rows.map(r => this._toDomain(r));
  }

  async contarPorEstado(tenantId: string): Promise<Record<EstadoCampanaValue, number>> {
    const rows = await db
      .select({
        estado: campanasTable.estado,
        total: count(),
      })
      .from(campanasTable)
      .where(and(
        eq(campanasTable.tenantId, tenantId),
        eq(campanasTable.eliminado, false),
      ))
      .groupBy(campanasTable.estado);

    const result: Record<EstadoCampanaValue, number> = {
      BORRADOR: 0, ACTIVA: 0, PAUSADA: 0, FINALIZADA: 0, CANCELADA: 0,
    };

    for (const row of rows) {
      const domainEstado = DB_TO_DOMAIN_ESTADO[row.estado ?? ''];
      if (domainEstado) {
        result[domainEstado] += Number(row.total);
      }
    }

    return result;
  }

  // ─── Mapping helpers ─────────────────────────────────────────

  private _toDomain(row: typeof campanasTable.$inferSelect): Campana {
    const domainEstado: EstadoCampanaValue = DB_TO_DOMAIN_ESTADO[row.estado ?? 'planificacion'] ?? 'BORRADOR';

    return Campana.reconstituir({
      id: row.id,
      tenantId: row.tenantId,
      numeroCampana: row.codigo,
      nombre: row.nombre,
      tipo: 'CUSTOM' as TipoCampana,
      estado: domainEstado,
      anuncianteId: row.anuncianteId,
      contratoId: row.contratoId ?? undefined,
      presupuesto: {
        monto: row.presupuestoTotal ? Number(row.presupuestoTotal) : 0,
        moneda: (row.moneda ?? 'CLP') as 'CLP' | 'USD' | 'EUR',
      },
      fechaInicio: new Date(row.fechaInicio),
      fechaFin: new Date(row.fechaFin),
      descripcion: row.descripcion ?? undefined,
      observaciones: row.notas ?? undefined,
      creadoPor: row.creadoPorId,
      creadoEn: row.fechaCreacion,
      actualizadoEn: row.fechaModificacion ?? row.fechaCreacion,
    });
  }

  private _toRow(campana: Campana): typeof campanasTable.$inferInsert {
    return {
      id: campana.id,
      tenantId: campana.tenantId,
      codigo: campana.numeroCampana.valor,
      nombre: campana.nombre,
      tipoCampana: (DOMAIN_TO_DB_TIPO[campana.tipo] ?? 'mantencion') as never,
      estado: DOMAIN_TO_DB_ESTADO[campana.estado.valor] as never,
      anuncianteId: campana.anuncianteId,
      contratoId: campana.contratoId ?? null,
      presupuestoTotal: String(campana.presupuesto.monto),
      moneda: campana.presupuesto.moneda,
      fechaInicio: campana.fechaInicio.toISOString().split('T')[0],
      fechaFin: campana.fechaFin.toISOString().split('T')[0],
      descripcion: campana.descripcion ?? null,
      notas: campana.observaciones ?? null,
      creadoPorId: campana.creadoPor,
      fechaCreacion: campana.creadoEn,
      eliminado: false,
    };
  }
}
