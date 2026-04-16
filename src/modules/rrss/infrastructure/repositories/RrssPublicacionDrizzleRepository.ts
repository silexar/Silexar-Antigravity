import { eq, and, lte, desc, asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { rrssPublicaciones } from '@/lib/db/rrss-schema';
import { IRrssPublicacionRepository } from '../../domain/repositories/IRrssPublicacionRepository';
import { RrssPublicacion } from '../../domain/entities/RrssPublicacion';

export class RrssPublicacionDrizzleRepository implements IRrssPublicacionRepository {
  async findPublicacionById(id: string, tenantId: string): Promise<RrssPublicacion | null> {
    const row = await db.query.rrssPublicaciones.findFirst({
      where: and(eq(rrssPublicaciones.id, id), eq(rrssPublicaciones.tenantId, tenantId)),
    });
    return row ? this.mapPublicacionToDomain(row) : null;
  }

  async findPublicacionesByTenant(tenantId: string, limit?: number, offset?: number): Promise<RrssPublicacion[]> {
    const rows = await db.query.rrssPublicaciones.findMany({
      where: eq(rrssPublicaciones.tenantId, tenantId),
      orderBy: [desc(rrssPublicaciones.creadoEn)],
      limit,
      offset,
    });
    return rows.map((r) => this.mapPublicacionToDomain(r));
  }

  async findByCampana(campanaId: string, tenantId: string): Promise<RrssPublicacion[]> {
    const rows = await db.query.rrssPublicaciones.findMany({
      where: and(eq(rrssPublicaciones.campanaId, campanaId), eq(rrssPublicaciones.tenantId, tenantId)),
      orderBy: [desc(rrssPublicaciones.creadoEn)],
    });
    return rows.map((r) => this.mapPublicacionToDomain(r));
  }

  async findByContrato(contratoId: string, tenantId: string): Promise<RrssPublicacion[]> {
    const rows = await db.query.rrssPublicaciones.findMany({
      where: and(eq(rrssPublicaciones.contratoId, contratoId), eq(rrssPublicaciones.tenantId, tenantId)),
      orderBy: [desc(rrssPublicaciones.creadoEn)],
    });
    return rows.map((r) => this.mapPublicacionToDomain(r));
  }

  async findByConnection(connectionId: string, tenantId: string): Promise<RrssPublicacion[]> {
    const rows = await db.query.rrssPublicaciones.findMany({
      where: and(eq(rrssPublicaciones.connectionId, connectionId), eq(rrssPublicaciones.tenantId, tenantId)),
      orderBy: [desc(rrssPublicaciones.creadoEn)],
    });
    return rows.map((r) => this.mapPublicacionToDomain(r));
  }

  async findProgramadasPendientes(tenantId: string, antesDe: Date): Promise<RrssPublicacion[]> {
    const rows = await db.query.rrssPublicaciones.findMany({
      where: and(
        eq(rrssPublicaciones.tenantId, tenantId),
        eq(rrssPublicaciones.estado, 'programada' as any),
        lte(rrssPublicaciones.scheduledAt, antesDe)
      ),
      orderBy: [asc(rrssPublicaciones.scheduledAt)],
    });
    return rows.map((r) => this.mapPublicacionToDomain(r));
  }

  async findAllProgramadasPendientes(antesDe: Date): Promise<RrssPublicacion[]> {
    const rows = await db.query.rrssPublicaciones.findMany({
      where: and(eq(rrssPublicaciones.estado, 'programada' as any), lte(rrssPublicaciones.scheduledAt, antesDe)),
      orderBy: [asc(rrssPublicaciones.scheduledAt)],
    });
    return rows.map((r) => this.mapPublicacionToDomain(r));
  }

  async savePublicacion(publicacion: RrssPublicacion): Promise<void> {
    await db.insert(rrssPublicaciones).values(this.mapPublicacionToDb(publicacion));
  }

  async updatePublicacion(publicacion: RrssPublicacion): Promise<void> {
    await db
      .update(rrssPublicaciones)
      .set(this.mapPublicacionToDb(publicacion))
      .where(and(eq(rrssPublicaciones.id, publicacion.id), eq(rrssPublicaciones.tenantId, publicacion.tenantId)));
  }

  async deletePublicacion(id: string, tenantId: string): Promise<void> {
    await db
      .delete(rrssPublicaciones)
      .where(and(eq(rrssPublicaciones.id, id), eq(rrssPublicaciones.tenantId, tenantId)));
  }

  private mapPublicacionToDomain(row: any): RrssPublicacion {
    return RrssPublicacion.reconstitute({
      id: row.id,
      tenantId: row.tenantId,
      connectionId: row.connectionId,
      campanaId: row.campanaId ?? null,
      contratoId: row.contratoId ?? null,
      contenido: row.contenido,
      hashtags: row.hashtags ?? [],
      mediaUrls: row.mediaUrls ?? [],
      estado: row.estado,
      scheduledAt: row.scheduledAt ?? null,
      publishedAt: row.publishedAt ?? null,
      externalPostId: row.externalPostId ?? null,
      externalPostUrl: row.externalPostUrl ?? null,
      errorLog: row.errorLog ?? null,
      creadoPorId: row.creadoPorId,
      creadoEn: row.creadoEn,
      actualizadoEn: row.actualizadoEn ?? null,
    });
  }

  private mapPublicacionToDb(entity: RrssPublicacion): any {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      connectionId: entity.connectionId,
      campanaId: entity.campanaId ?? null,
      contratoId: entity.contratoId ?? null,
      contenido: entity.contenido,
      hashtags: entity.hashtags,
      mediaUrls: entity.mediaUrls,
      estado: entity.estado as any,
      scheduledAt: entity.scheduledAt ?? null,
      publishedAt: entity.publishedAt ?? null,
      externalPostId: entity.externalPostId ?? null,
      externalPostUrl: entity.externalPostUrl ?? null,
      errorLog: entity.errorLog ?? null,
      creadoPorId: entity.creadoPorId,
      creadoEn: entity.creadoEn,
      actualizadoEn: entity.actualizadoEn ?? null,
    };
  }
}
