import { eq, and, gte, lte, count } from 'drizzle-orm';
import { db as _db } from '@/lib/db';
const db = _db!;
import { verificacionesEmision as verificacionesTable } from '@/lib/db/emision-schema';
import { VerificacionEmision } from '../../domain/entities/VerificacionEmision';
import type { IVerificacionEmisionRepository, VerificacionEmisionFilters, VerificacionEmisionPaginada } from '../../domain/repositories/IVerificacionEmisionRepository';

export class DrizzleVerificacionEmisionRepository implements IVerificacionEmisionRepository {
  async buscarPorId(id: string, tenantId: string): Promise<VerificacionEmision | null> {
    const rows = await db
      .select()
      .from(verificacionesTable)
      .where(and(eq(verificacionesTable.id, id), eq(verificacionesTable.tenantId, tenantId)))
      .limit(1);
    if (rows.length === 0) return null;
    return this._toDomain(rows[0]);
  }

  async listar(filtros: VerificacionEmisionFilters, pagina: number, tamanoPagina: number): Promise<VerificacionEmisionPaginada> {
    const conditions = [eq(verificacionesTable.tenantId, filtros.tenantId)];
    if (filtros.estado) conditions.push(eq(verificacionesTable.estado, filtros.estado));
    if (filtros.campanaId) conditions.push(eq(verificacionesTable.campanaId, filtros.campanaId));
    if (filtros.anuncianteId) conditions.push(eq(verificacionesTable.anuncianteId, filtros.anuncianteId));
    if (filtros.ejecutivoId) conditions.push(eq(verificacionesTable.ejecutivoId, filtros.ejecutivoId));
    if (filtros.fechaDesde) conditions.push(gte(verificacionesTable.fechaBusqueda, filtros.fechaDesde.toISOString().split('T')[0]));
    if (filtros.fechaHasta) conditions.push(lte(verificacionesTable.fechaBusqueda, filtros.fechaHasta.toISOString().split('T')[0]));

    const offset = pagina * tamanoPagina;
    const where = and(...conditions);

    const [rows, [{ total }]] = await Promise.all([
      db.select().from(verificacionesTable).where(where).limit(tamanoPagina).offset(offset),
      db.select({ total: count() }).from(verificacionesTable).where(where),
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

  async guardar(verificacion: VerificacionEmision): Promise<void> {
    await db.insert(verificacionesTable).values(this._toRow(verificacion));
  }

  async actualizar(verificacion: VerificacionEmision): Promise<void> {
    await db
      .update(verificacionesTable)
      .set(this._toRow(verificacion))
      .where(and(eq(verificacionesTable.id, verificacion.id), eq(verificacionesTable.tenantId, verificacion.tenantId)));
  }

  async eliminar(id: string, tenantId: string): Promise<void> {
    await db
      .delete(verificacionesTable)
      .where(and(eq(verificacionesTable.id, id), eq(verificacionesTable.tenantId, tenantId)));
  }

  private _toDomain(row: typeof verificacionesTable.$inferSelect): VerificacionEmision {
    return VerificacionEmision.reconstituir({
      id: row.id,
      tenantId: row.tenantId,
      anuncianteId: row.anuncianteId ?? undefined,
      campanaId: row.campanaId ?? undefined,
      contratoId: row.contratoId ?? undefined,
      ejecutivoId: row.ejecutivoId ?? undefined,
      fechaBusqueda: new Date(row.fechaBusqueda),
      horaInicio: row.horaInicio,
      horaFin: row.horaFin,
      emisorasIds: (row.emisorasIds as string[]) ?? [],
      registrosAireIds: (row.registrosAireIds as string[]) ?? [],
      materialesIds: (row.materialesIds as string[]) ?? [],
      tiposMaterial: (row.tiposMaterial as import('../../domain/entities/VerificacionEmision').TipoMaterialVerificacion[]) ?? [],
      toleranciaMinutos: row.toleranciaMinutos ?? 10,
      sensibilidadPorcentaje: row.sensibilidadPorcentaje ?? 95,
      estado: row.estado,
      progresoPorcentaje: row.progresoPorcentaje ?? 0,
      totalMaterialesBuscados: row.totalMaterialesBuscados ?? 0,
      materialesEncontrados: row.materialesEncontrados ?? 0,
      materialesNoEncontrados: row.materialesNoEncontrados ?? 0,
      accuracyPromedio: row.accuracyPromedio ?? 0,
      tiempoProcesamientoMs: row.tiempoProcesamientoMs ?? undefined,
      fechaInicioProceso: row.fechaInicioProceso ?? undefined,
      fechaFinProceso: row.fechaFinProceso ?? undefined,
      resultadosDetalle: (row.resultadosJson as unknown as Record<string, unknown>[]) ?? [],
      creadoPorId: row.creadoPorId ?? undefined,
      creadoEn: row.fechaCreacion,
      actualizadoEn: row.fechaCreacion,
    });
  }

  private _toRow(verificacion: VerificacionEmision): typeof verificacionesTable.$inferInsert {
    return {
      id: verificacion.id,
      tenantId: verificacion.tenantId,
      anuncianteId: verificacion.anuncianteId ?? null,
      campanaId: verificacion.campanaId ?? null,
      contratoId: verificacion.contratoId ?? null,
      ejecutivoId: verificacion.ejecutivoId ?? null,
      fechaBusqueda: verificacion.fechaBusqueda.toISOString().split('T')[0],
      horaInicio: verificacion.rangoHorario.inicio,
      horaFin: verificacion.rangoHorario.fin,
      emisorasIds: verificacion.emisorasIds,
      registrosAireIds: verificacion.registrosAireIds,
      materialesIds: verificacion.materialesIds,
      tiposMaterial: verificacion.tiposMaterial,
      toleranciaMinutos: verificacion.toleranciaMinutos,
      sensibilidadPorcentaje: verificacion.sensibilidadPorcentaje,
      estado: verificacion.estado.valor,
      progresoPorcentaje: verificacion.progresoPorcentaje,
      totalMaterialesBuscados: verificacion.totalMaterialesBuscados,
      materialesEncontrados: verificacion.materialesEncontrados,
      materialesNoEncontrados: verificacion.materialesNoEncontrados,
      accuracyPromedio: verificacion.accuracyPromedio,
      tiempoProcesamientoMs: verificacion.tiempoProcesamientoMs ?? null,
      fechaInicioProceso: verificacion.fechaInicioProceso ?? null,
      fechaFinProceso: verificacion.fechaFinProceso ?? null,
      resultadosJson: verificacion.resultadosDetalle as unknown as typeof verificacionesTable.$inferInsert['resultadosJson'],
      creadoPorId: verificacion.creadoPorId ?? null,
      fechaCreacion: verificacion.creadoEn,
    };
  }
}
