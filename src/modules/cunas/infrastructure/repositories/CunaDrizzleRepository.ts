/**
 * REPOSITORY: CUNA DRIZZLE — TIER 0
 *
 * Implementación PostgreSQL/Drizzle de ICunaRepository.
 * TODA query usa withTenantContext() para garantizar aislamiento RLS.
 *
 * Regla: Solo importa de domain/ y lib/. Nunca de application/ ni presentation/.
 */

import { eq, and, ilike, or, gte, lte, sql, desc, asc } from 'drizzle-orm';
import { getDB } from '@/lib/db';
import { cunas } from '@/lib/db/schema';
import type { TipoCuna, EstadoCuna } from '@/lib/db/cunas-schema';
import { withTenantContext } from '@/lib/db/tenant-context';
import { Cuna } from '../../domain/entities/Cuna';
import { CunaId } from '../../domain/value-objects/CunaId';
import { CunaMapper } from '../mappers/CunaMapper';
import type {
  ICunaRepository,
  CunaFilter,
  CunaListResult,
} from '../../domain/repositories/ICunaRepository';

export class CunaDrizzleRepository implements ICunaRepository {
  async findById(id: string, tenantId: string): Promise<Cuna | null> {
    return withTenantContext(tenantId, async () => {
      const [row] = await getDB()
        .select()
        .from(cunas)
        .where(
          and(
            eq(cunas.id, id),
            eq(cunas.tenantId, tenantId),
            eq(cunas.eliminado, false)
          )
        )
        .limit(1);
      return row ? CunaMapper.toEntity(row) : null;
    });
  }

  async findByCodigo(codigo: string, tenantId: string): Promise<Cuna | null> {
    return withTenantContext(tenantId, async () => {
      const [row] = await getDB()
        .select()
        .from(cunas)
        .where(
          and(
            eq(cunas.codigo, codigo),
            eq(cunas.tenantId, tenantId),
            eq(cunas.eliminado, false)
          )
        )
        .limit(1);
      return row ? CunaMapper.toEntity(row) : null;
    });
  }

  async findMany(filter: CunaFilter, tenantId: string): Promise<CunaListResult> {
    return withTenantContext(tenantId, async () => {
      const page = Math.max(filter.page ?? 1, 1);
      const limit = Math.min(filter.limit ?? 20, 100);
      const offset = (page - 1) * limit;

      const conditions = [
        eq(cunas.tenantId, tenantId),
        eq(cunas.eliminado, false),
      ];

      if (filter.search) {
        const s = `%${filter.search}%`;
        const searchCond = or(
          ilike(cunas.nombre, s),
          ilike(cunas.codigo, s)
        );
        if (searchCond) conditions.push(searchCond);
      }

      if (filter.tipo) {
        // Normalización de tipos legacy
        let tipo = filter.tipo as string;
        if (['promo_ida', 'presentacion', 'cierre', 'audio'].includes(tipo)) {
          tipo = tipo === 'audio' ? 'spot' : 'promo';
        }
        conditions.push(eq(cunas.tipoCuna, tipo as TipoCuna));
      }

      if (filter.estado) {
        conditions.push(eq(cunas.estado, filter.estado as EstadoCuna));
      }

      if (filter.anuncianteId) {
        conditions.push(eq(cunas.anuncianteId, filter.anuncianteId));
      }

      if (filter.campanaId) {
        conditions.push(eq(cunas.campanaId, filter.campanaId));
      }

      if (filter.contratoId) {
        conditions.push(eq(cunas.contratoId, filter.contratoId));
      }

      if (filter.venceEnDias !== undefined) {
        const ahora = new Date();
        const limite = new Date(ahora.getTime() + filter.venceEnDias * 24 * 60 * 60 * 1000);
        conditions.push(
          and(
            gte(cunas.fechaFinVigencia, ahora),
            lte(cunas.fechaFinVigencia, limite)
          ) as ReturnType<typeof eq>
        );
      }

      if (filter.soloEnAire) {
        conditions.push(eq(cunas.estado, 'en_aire'));
      }

      if (filter.soloPendientes) {
        conditions.push(eq(cunas.estado, 'pendiente_aprobacion'));
      }

      const orderFn = filter.orderDir === 'asc' ? asc : desc;

      const [rows, [countRow]] = await Promise.all([
        getDB()
          .select()
          .from(cunas)
          .where(and(...conditions))
          .orderBy(orderFn(cunas.createdAt))
          .limit(limit)
          .offset(offset),
        getDB()
          .select({ count: sql<number>`count(*)` })
          .from(cunas)
          .where(and(...conditions)),
      ]);

      const total = Number(countRow?.count ?? 0);
      return {
        items: rows.map(CunaMapper.toEntity),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    });
  }

  async save(cuna: Cuna): Promise<void> {
    const data = CunaMapper.toPersistence(cuna);
    await withTenantContext(cuna.tenantId, async () => {
      await getDB()
        .insert(cunas)
        .values(data)
        .onConflictDoUpdate({
          target: cunas.id,
          set: {
            nombre: data.nombre,
            tipoCuna: data.tipoCuna,
            descripcion: data.descripcion,
            campanaId: data.campanaId,
            contratoId: data.contratoId,
            productoNombre: data.productoNombre,
            estado: data.estado,
            aprobadoPorId: data.aprobadoPorId,
            fechaAprobacion: data.fechaAprobacion,
            motivoRechazo: data.motivoRechazo,
            fechaFinVigencia: data.fechaFinVigencia,
            updatedAt: data.updatedAt,
            modificadoPorId: data.modificadoPorId,
            fechaModificacion: data.fechaModificacion,
          },
        });
    });
  }

  async delete(id: string, tenantId: string, eliminadoPorId: string): Promise<void> {
    await withTenantContext(tenantId, async () => {
      await getDB()
        .update(cunas)
        .set({
          eliminado: true,
          fechaEliminacion: new Date(),
          eliminadoPorId,
          updatedAt: new Date(),
        })
        .where(and(eq(cunas.id, id), eq(cunas.tenantId, tenantId)));
    });
  }

  async reserveNextCodigo(tenantId: string): Promise<CunaId> {
    return withTenantContext(tenantId, async () => {
      // Obtiene el mayor número secuencial SPX del tenant y suma 1
      const [result] = await getDB()
        .select({
          maxCodigo: sql<string>`MAX(codigo)`,
        })
        .from(cunas)
        .where(eq(cunas.tenantId, tenantId));

      let nextSequence = 1;
      if (result?.maxCodigo && /^SPX\d{6}$/.test(result.maxCodigo)) {
        nextSequence = parseInt(result.maxCodigo.slice(3), 10) + 1;
      }

      return CunaId.fromSequence(nextSequence);
    });
  }

  async exists(id: string, tenantId: string): Promise<boolean> {
    return withTenantContext(tenantId, async () => {
      const [row] = await getDB()
        .select({ id: cunas.id })
        .from(cunas)
        .where(and(eq(cunas.id, id), eq(cunas.tenantId, tenantId), eq(cunas.eliminado, false)))
        .limit(1);
      return !!row;
    });
  }
}
