import { eq, and, lte } from 'drizzle-orm';
import { db as _db } from '@/lib/db';
const db = _db!;
import { clipsEvidencia as clipsTable } from '@/lib/db/emision-schema';
import { ClipEvidencia } from '../../domain/entities/ClipEvidencia';
import type { IClipEvidenciaRepository, ClipEvidenciaFilters } from '../../domain/repositories/IClipEvidenciaRepository';

export class DrizzleClipEvidenciaRepository implements IClipEvidenciaRepository {
  async buscarPorId(id: string, tenantId: string): Promise<ClipEvidencia | null> {
    const rows = await db
      .select()
      .from(clipsTable)
      .where(and(eq(clipsTable.id, id), eq(clipsTable.tenantId, tenantId)))
      .limit(1);
    if (rows.length === 0) return null;
    return this._toDomain(rows[0]);
  }

  async listarPorVerificacion(verificacionId: string, tenantId: string): Promise<ClipEvidencia[]> {
    const rows = await db
      .select()
      .from(clipsTable)
      .where(and(eq(clipsTable.verificacionId, verificacionId), eq(clipsTable.tenantId, tenantId)));
    return rows.map(r => this._toDomain(r));
  }

  async listar(filtros: ClipEvidenciaFilters): Promise<ClipEvidencia[]> {
    const conditions = [eq(clipsTable.tenantId, filtros.tenantId)];
    if (filtros.verificacionId) conditions.push(eq(clipsTable.verificacionId, filtros.verificacionId));
    if (typeof filtros.aprobado === 'boolean') conditions.push(eq(clipsTable.aprobado, filtros.aprobado));
    const rows = await db.select().from(clipsTable).where(and(...conditions));
    return rows.map(r => this._toDomain(r));
  }

  async guardar(clip: ClipEvidencia): Promise<void> {
    await db.insert(clipsTable).values(this._toRow(clip));
  }

  async actualizar(clip: ClipEvidencia): Promise<void> {
    await db
      .update(clipsTable)
      .set(this._toRow(clip))
      .where(and(eq(clipsTable.id, clip.id), eq(clipsTable.tenantId, clip.tenantId)));
  }

  async eliminar(id: string, tenantId: string): Promise<void> {
    await db
      .delete(clipsTable)
      .where(and(eq(clipsTable.id, id), eq(clipsTable.tenantId, tenantId)));
  }

  async listarExpirados(tenantId: string, fechaCorte: Date): Promise<ClipEvidencia[]> {
    const rows = await db
      .select()
      .from(clipsTable)
      .where(and(eq(clipsTable.tenantId, tenantId), lte(clipsTable.fechaExpiracion, fechaCorte)));
    return rows.map(r => this._toDomain(r));
  }

  private _toDomain(row: typeof clipsTable.$inferSelect): ClipEvidencia {
    return ClipEvidencia.reconstituir({
      id: row.id,
      tenantId: row.tenantId,
      verificacionId: row.verificacionId,
      deteccionId: row.deteccionId ?? undefined,
      urlArchivo: row.urlArchivo,
      duracionSegundos: row.duracionSegundos,
      formato: row.formato,
      horaInicioClip: row.horaInicioClip,
      horaFinClip: row.horaFinClip,
      hashSha256: row.hashSha256,
      transcripcion: row.transcripcion ?? undefined,
      aprobado: row.aprobado,
      aprobadoPorId: row.aprobadoPorId ?? undefined,
      fechaAprobacion: row.fechaAprobacion ?? undefined,
      fechaExpiracion: row.fechaExpiracion,
      creadoPorId: row.creadoPorId ?? undefined,
      creadoEn: row.fechaCreacion,
    });
  }

  private _toRow(clip: ClipEvidencia): typeof clipsTable.$inferInsert {
    return {
      id: clip.id,
      tenantId: clip.tenantId,
      verificacionId: clip.verificacionId,
      deteccionId: clip.deteccionId ?? null,
      urlArchivo: clip.urlArchivo,
      duracionSegundos: clip.duracionSegundos,
      formato: clip.formato,
      horaInicioClip: clip.horaInicioClip,
      horaFinClip: clip.horaFinClip,
      hashSha256: clip.hashSha256.valor,
      transcripcion: clip.transcripcion ?? null,
      aprobado: clip.aprobado,
      aprobadoPorId: clip.aprobadoPorId ?? null,
      fechaAprobacion: clip.fechaAprobacion ?? null,
      fechaExpiracion: clip.fechaExpiracion,
      creadoPorId: clip.creadoPorId ?? null,
      fechaCreacion: clip.creadoEn,
    };
  }
}
