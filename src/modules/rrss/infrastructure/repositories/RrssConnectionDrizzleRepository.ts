import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { rrssConnections } from '@/lib/db/rrss-schema';
import { IRrssConnectionRepository } from '../../domain/repositories/IRrssConnectionRepository';
import { RrssConnection } from '../../domain/entities/RrssConnection';
import { TokenCifrado } from '../../domain/value-objects/TokenCifrado';

export class RrssConnectionDrizzleRepository implements IRrssConnectionRepository {
  async findConnectionById(id: string, tenantId: string): Promise<RrssConnection | null> {
    const row = await db.query.rrssConnections.findFirst({
      where: and(eq(rrssConnections.id, id), eq(rrssConnections.tenantId, tenantId)),
    });
    return row ? this.mapConnectionToDomain(row) : null;
  }

  async findConnectionsByTenant(tenantId: string): Promise<RrssConnection[]> {
    const rows = await db.query.rrssConnections.findMany({
      where: eq(rrssConnections.tenantId, tenantId),
      orderBy: (table) => [table.creadoEn],
    });
    return rows.map((r) => this.mapConnectionToDomain(r));
  }

  async findByPlataforma(tenantId: string, plataforma: string): Promise<RrssConnection[]> {
    const rows = await db.query.rrssConnections.findMany({
      where: and(eq(rrssConnections.tenantId, tenantId), eq(rrssConnections.plataforma, plataforma as any)),
    });
    return rows.map((r) => this.mapConnectionToDomain(r));
  }

  async findByAccountId(tenantId: string, plataforma: string, accountId: string): Promise<RrssConnection | null> {
    const row = await db.query.rrssConnections.findFirst({
      where: and(
        eq(rrssConnections.tenantId, tenantId),
        eq(rrssConnections.plataforma, plataforma as any),
        eq(rrssConnections.accountId, accountId)
      ),
    });
    return row ? this.mapConnectionToDomain(row) : null;
  }

  async saveConnection(connection: RrssConnection): Promise<void> {
    await db.insert(rrssConnections).values(this.mapConnectionToDb(connection));
  }

  async updateConnection(connection: RrssConnection): Promise<void> {
    await db
      .update(rrssConnections)
      .set(this.mapConnectionToDb(connection))
      .where(and(eq(rrssConnections.id, connection.id), eq(rrssConnections.tenantId, connection.tenantId)));
  }

  async deleteConnection(id: string, tenantId: string): Promise<void> {
    await db
      .delete(rrssConnections)
      .where(and(eq(rrssConnections.id, id), eq(rrssConnections.tenantId, tenantId)));
  }

  private mapConnectionToDomain(row: any): RrssConnection {
    return RrssConnection.reconstitute({
      id: row.id,
      tenantId: row.tenantId,
      userId: row.userId,
      plataforma: row.plataforma,
      accountId: row.accountId,
      accountName: row.accountName ?? undefined,
      accountAvatar: row.accountAvatar ?? undefined,
      accessToken: TokenCifrado.create({
        cipher: row.accessTokenCipher,
        iv: row.tokenIv,
        authTag: row.tokenAuthTag,
      }),
      refreshToken: row.refreshTokenCipher
        ? TokenCifrado.create({
            cipher: row.refreshTokenCipher,
            iv: row.tokenIv,
            authTag: row.tokenAuthTag,
          })
        : undefined,
      scopes: row.scopes ?? [],
      expiresAt: row.expiresAt ?? undefined,
      creadoEn: row.creadoEn,
      actualizadoEn: row.actualizadoEn ?? undefined,
    });
  }

  private mapConnectionToDb(entity: RrssConnection): any {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      userId: entity.userId,
      plataforma: entity.plataforma,
      accountId: entity.accountId,
      accountName: entity.accountName ?? null,
      accountAvatar: entity.accountAvatar ?? null,
      accessTokenCipher: entity.accessToken.cipher,
      refreshTokenCipher: entity.refreshToken?.cipher ?? null,
      tokenIv: entity.accessToken.iv,
      tokenAuthTag: entity.accessToken.authTag,
      scopes: entity.scopes,
      expiresAt: entity.expiresAt ?? null,
      creadoEn: entity.creadoEn,
      actualizadoEn: entity.actualizadoEn ?? null,
    };
  }
}
