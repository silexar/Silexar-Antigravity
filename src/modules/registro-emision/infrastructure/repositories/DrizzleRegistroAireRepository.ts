import { eq, and, gte, lte, count } from 'drizzle-orm';
import { db as _db } from '@/lib/db';
const db = _db!;
import { registrosAire as registrosAireTable } from '@/lib/db/emision-schema';
import { RegistroAire } from '../../domain/entities/RegistroAire';
import type { IRegistroAireRepository, RegistroAireFilters, RegistroAirePaginado } from '../../domain/repositories/IRegistroAireRepository';

export class DrizzleRegistroAireRepository implements IRegistroAireRepository {
  async buscarPorId(id: string, tenantId: string): Promise<RegistroAire | null> {
    const rows = await db
      .select()
      .from(registrosAireTable)
      .where(and(eq(registrosAireTable.id, id), eq(registrosAireTable.tenantId, tenantId)))
      .limit(1);
    if (rows.length === 0) return null;
    return this._toDomain(rows[0]);
  }

  async listar(filtros: RegistroAireFilters, pagina: number, tamanoPagina: number): Promise<RegistroAirePaginado> {
    const conditions = [eq(registrosAireTable.tenantId, filtros.tenantId)];
    if (filtros.emisoraId) conditions.push(eq(registrosAireTable.emisoraId, filtros.emisoraId));
    if (filtros.estado) conditions.push(eq(registrosAireTable.estado, filtros.estado));
    if (filtros.fechaDesde) conditions.push(gte(registrosAireTable.fechaEmision, filtros.fechaDesde.toISOString().split('T')[0]));
    if (filtros.fechaHasta) conditions.push(lte(registrosAireTable.fechaEmision, filtros.fechaHasta.toISOString().split('T')[0]));

    const offset = pagina * tamanoPagina;
    const where = and(...conditions);

    const [rows, [{ total }]] = await Promise.all([
      db.select().from(registrosAireTable).where(where).limit(tamanoPagina).offset(offset),
      db.select({ total: count() }).from(registrosAireTable).where(where),
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

  async guardar(registro: RegistroAire): Promise<void> {
    await db.insert(registrosAireTable).values(this._toRow(registro));
  }

  async actualizar(registro: RegistroAire): Promise<void> {
    await db
      .update(registrosAireTable)
      .set(this._toRow(registro))
      .where(and(eq(registrosAireTable.id, registro.id), eq(registrosAireTable.tenantId, registro.tenantId)));
  }

  async eliminar(id: string, tenantId: string): Promise<void> {
    await db
      .delete(registrosAireTable)
      .where(and(eq(registrosAireTable.id, id), eq(registrosAireTable.tenantId, tenantId)));
  }

  async listarExpirados(tenantId: string, fechaCorte: Date): Promise<RegistroAire[]> {
    const rows = await db
      .select()
      .from(registrosAireTable)
      .where(
        and(
          eq(registrosAireTable.tenantId, tenantId),
          lte(registrosAireTable.fechaCreacion, fechaCorte),
        ),
      );
    return rows.map(r => this._toDomain(r));
  }

  private _toDomain(row: typeof registrosAireTable.$inferSelect): RegistroAire {
    return RegistroAire.reconstituir({
      id: row.id,
      tenantId: row.tenantId,
      emisoraId: row.emisoraId,
      fechaEmision: new Date(row.fechaEmision),
      urlArchivo: row.urlArchivo,
      duracionSegundos: row.duracionSegundos,
      formato: row.formato,
      tamanioBytes: row.tamanioBytes ?? undefined,
      hashSha256: row.hashSha256 ?? undefined,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      estado: row.estado,
      errorMensaje: row.errorMensaje ?? undefined,
      procesadoPorId: row.procesadoPorId ?? undefined,
      fechaProcesamiento: row.fechaProcesamiento ?? undefined,
      creadoPorId: row.creadoPorId ?? undefined,
      creadoEn: row.fechaCreacion,
    });
  }

  private _toRow(registro: RegistroAire): typeof registrosAireTable.$inferInsert {
    return {
      id: registro.id,
      tenantId: registro.tenantId,
      emisoraId: registro.emisoraId,
      fechaEmision: registro.fechaEmision.toISOString().split('T')[0],
      urlArchivo: registro.urlArchivo,
      duracionSegundos: registro.duracionSegundos,
      formato: registro.formato,
      tamanioBytes: registro.tamanioBytes ?? null,
      hashSha256: registro.hashSha256?.valor ?? null,
      metadata: registro.metadata,
      estado: registro.estado.valor,
      errorMensaje: registro.errorMensaje ?? null,
      procesadoPorId: registro.procesadoPorId ?? null,
      fechaProcesamiento: registro.fechaProcesamiento ?? null,
      creadoPorId: registro.creadoPorId ?? null,
      fechaCreacion: registro.creadoEn,
    };
  }
}
