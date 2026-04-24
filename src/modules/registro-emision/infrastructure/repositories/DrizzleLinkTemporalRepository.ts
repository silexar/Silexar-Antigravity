import { eq, and, lte, count } from 'drizzle-orm';
import { db as _db } from '@/lib/db';
const db = _db!;
import { linksTemporales as linksTable } from '@/lib/db/emision-schema';
import { AccesoSeguro } from '../../domain/entities/AccesoSeguro';
import type { ILinkTemporalRepository, AccesoSeguroFilters } from '../../domain/repositories/ILinkTemporalRepository';

export class DrizzleLinkTemporalRepository implements ILinkTemporalRepository {
  async buscarPorId(id: string, tenantId: string): Promise<AccesoSeguro | null> {
    const rows = await db
      .select()
      .from(linksTable)
      .where(and(eq(linksTable.id, id), eq(linksTable.tenantId, tenantId)))
      .limit(1);
    if (rows.length === 0) return null;
    return this._toDomain(rows[0]);
  }

  async buscarPorCodigo(codigoAcceso: string, tenantId: string): Promise<AccesoSeguro | null> {
    const rows = await db
      .select()
      .from(linksTable)
      .where(and(eq(linksTable.codigoAcceso, codigoAcceso), eq(linksTable.tenantId, tenantId)))
      .limit(1);
    if (rows.length === 0) return null;
    return this._toDomain(rows[0]);
  }

  async buscarPorUuid(linkUuid: string, tenantId: string): Promise<AccesoSeguro | null> {
    const rows = await db
      .select()
      .from(linksTable)
      .where(and(eq(linksTable.linkUuid, linkUuid), eq(linksTable.tenantId, tenantId)))
      .limit(1);
    if (rows.length === 0) return null;
    return this._toDomain(rows[0]);
  }

  async listar(
    filtros: AccesoSeguroFilters,
    pagina: number,
    tamanoPagina: number,
  ): Promise<{
    datos: AccesoSeguro[];
    total: number;
    pagina: number;
    tamanoPagina: number;
    totalPaginas: number;
  }> {
    const conditions = [eq(linksTable.tenantId, filtros.tenantId)];
    if (filtros.verificacionId) conditions.push(eq(linksTable.verificacionId, filtros.verificacionId));
    if (filtros.estado) conditions.push(eq(linksTable.estado, filtros.estado));
    if (filtros.clienteEmail) conditions.push(eq(linksTable.clienteEmail, filtros.clienteEmail));

    const offset = pagina * tamanoPagina;
    const where = and(...conditions);

    const [rows, [{ total }]] = await Promise.all([
      db.select().from(linksTable).where(where).limit(tamanoPagina).offset(offset),
      db.select({ total: count() }).from(linksTable).where(where),
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

  async guardar(acceso: AccesoSeguro): Promise<void> {
    await db.insert(linksTable).values(this._toRow(acceso));
  }

  async actualizar(acceso: AccesoSeguro): Promise<void> {
    await db
      .update(linksTable)
      .set(this._toRow(acceso))
      .where(and(eq(linksTable.id, acceso.id), eq(linksTable.tenantId, acceso.tenantId)));
  }

  async eliminar(id: string, tenantId: string): Promise<void> {
    await db
      .delete(linksTable)
      .where(and(eq(linksTable.id, id), eq(linksTable.tenantId, tenantId)));
  }

  async listarExpirados(tenantId: string, fechaCorte: Date): Promise<AccesoSeguro[]> {
    const rows = await db
      .select()
      .from(linksTable)
      .where(and(eq(linksTable.tenantId, tenantId), lte(linksTable.fechaExpiracion, fechaCorte)));
    return rows.map(r => this._toDomain(r));
  }

  private _toDomain(row: typeof linksTable.$inferSelect): AccesoSeguro {
    return AccesoSeguro.reconstituir({
      id: row.id,
      tenantId: row.tenantId,
      linkUuid: row.linkUuid,
      codigoAcceso: row.codigoAcceso,
      verificacionId: row.verificacionId ?? undefined,
      clipEvidenciaId: row.clipEvidenciaId ?? undefined,
      tipoLink: (row.tipoLink as 'unico' | 'basket') ?? 'unico',
      itemsJson: (row.itemsJson as AccesoSeguro['itemsJson']) ?? undefined,
      materialNombre: row.materialNombre ?? undefined,
      spxCode: row.spxCode ?? undefined,
      clipUrl: row.clipUrl ?? undefined,
      imageUrl: row.imageUrl ?? undefined,
      esDigital: row.esDigital ?? false,
      clienteNombre: row.clienteNombre ?? undefined,
      clienteEmail: row.clienteEmail,
      campanaNombre: row.campanaNombre ?? undefined,
      estado: row.estado,
      creadoEn: row.fechaCreacion,
      fechaExpiracion: row.fechaExpiracion,
      fechaAcceso: row.fechaAcceso ?? undefined,
      fechaDescarga: row.fechaDescarga ?? undefined,
      usosPermitidos: row.usosPermitidos ?? 0,
      usosRealizados: row.usosRealizados ?? 0,
      accesosCount: row.accesosCount ?? 0,
      ipAcceso: row.ipAcceso ?? undefined,
      userAgentAcceso: row.userAgentAcceso ?? undefined,
      creadoPorId: row.creadoPorId ?? undefined,
      creadoPorNombre: row.creadoPorNombre ?? undefined,
    });
  }

  private _toRow(acceso: AccesoSeguro): typeof linksTable.$inferInsert {
    return {
      id: acceso.id,
      tenantId: acceso.tenantId,
      linkUuid: acceso.linkUuid,
      codigoAcceso: acceso.codigoAcceso.valor,
      verificacionId: acceso.verificacionId ?? null,
      clipEvidenciaId: acceso.clipEvidenciaId ?? null,
      tipoLink: acceso.tipoLink,
      itemsJson: acceso.itemsJson ?? null,
      materialNombre: acceso.materialNombre ?? null,
      spxCode: acceso.spxCode ?? null,
      clipUrl: acceso.clipUrl ?? null,
      imageUrl: acceso.imageUrl ?? null,
      esDigital: acceso.esDigital,
      clienteNombre: acceso.clienteNombre ?? null,
      clienteEmail: acceso.clienteEmail,
      campanaNombre: acceso.campanaNombre ?? null,
      estado: acceso.estado,
      fechaCreacion: acceso.creadoEn,
      fechaExpiracion: acceso.fechaExpiracion,
      fechaAcceso: acceso.fechaAcceso ?? null,
      fechaDescarga: acceso.fechaDescarga ?? null,
      usosPermitidos: acceso.usosPermitidos,
      usosRealizados: acceso.usosRealizados,
      accesosCount: acceso.accesosCount,
      ipAcceso: acceso.ipAcceso ?? null,
      userAgentAcceso: acceso.userAgentAcceso ?? null,
      creadoPorId: acceso.creadoPorId ?? null,
      creadoPorNombre: acceso.creadoPorNombre ?? null,
    };
  }
}
