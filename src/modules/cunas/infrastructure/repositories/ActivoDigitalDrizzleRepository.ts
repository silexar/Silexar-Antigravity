/**
 * REPOSITORY: ACTIVO DIGITAL DRIZZLE
 *
 * Implementación PostgreSQL/Drizzle de IActivoDigitalRepository.
 */

import { eq, and, ilike, or, sql, desc, asc } from 'drizzle-orm';
import { getDB } from '@/lib/db';
import { digitalAssets } from '@/lib/db/schema';
import { withTenantContext } from '@/lib/db/tenant-context';
import { ActivoDigital } from '../../domain/entities/ActivoDigital';
import { ActivoDigitalMapper } from '../mappers/ActivoDigitalMapper';
import type {
  IActivoDigitalRepository,
  ActivoDigitalFilter,
  ActivoDigitalListResult,
} from '../../domain/repositories/IActivoDigitalRepository';
import type { EstadoActivoDigitalValor, TipoActivoDigitalValor } from '../../domain/entities/ActivoDigital';

export class ActivoDigitalDrizzleRepository implements IActivoDigitalRepository {
  async findById(id: string, tenantId: string): Promise<ActivoDigital | null> {
    return withTenantContext(tenantId, async () => {
      const [row] = await getDB()
        .select()
        .from(digitalAssets)
        .where(
          and(
            eq(digitalAssets.id, id),
            eq(digitalAssets.tenantId, tenantId),
            eq(digitalAssets.activo, true)
          )
        )
        .limit(1);
      return row ? ActivoDigitalMapper.toEntity(row) : null;
    });
  }

  async findByCodigo(codigo: string, tenantId: string): Promise<ActivoDigital | null> {
    return withTenantContext(tenantId, async () => {
      const [row] = await getDB()
        .select()
        .from(digitalAssets)
        .where(
          and(
            eq(digitalAssets.codigo, codigo),
            eq(digitalAssets.tenantId, tenantId),
            eq(digitalAssets.activo, true)
          )
        )
        .limit(1);
      return row ? ActivoDigitalMapper.toEntity(row) : null;
    });
  }

  async findMany(filter: ActivoDigitalFilter, tenantId: string): Promise<ActivoDigitalListResult> {
    return withTenantContext(tenantId, async () => {
      const page = Math.max(filter.page ?? 1, 1);
      const limit = Math.min(filter.limit ?? 20, 100);
      const offset = (page - 1) * limit;

      const conditions = [
        eq(digitalAssets.tenantId, tenantId),
        eq(digitalAssets.activo, true),
      ];

      if (filter.search) {
        const s = `%${filter.search}%`;
        const searchCond = or(
          ilike(digitalAssets.nombre, s),
          ilike(digitalAssets.codigo, s)
        );
        if (searchCond) conditions.push(searchCond);
      }

      if (filter.tipo) {
        const dbTipo = ActivoDigitalMapper['mapTipoHaciaDB'](filter.tipo as TipoActivoDigitalValor);
        conditions.push(eq(digitalAssets.tipoAsset, dbTipo));
      }

      if (filter.estado) {
        conditions.push(eq(digitalAssets.estado, filter.estado as EstadoActivoDigitalValor));
      }

      if (filter.cunaId) {
        conditions.push(eq(digitalAssets.cunaId, filter.cunaId));
      }

      if (filter.anuncianteId) {
        conditions.push(eq(digitalAssets.anuncianteId, filter.anuncianteId));
      }

      if (filter.formato) {
        conditions.push(eq(digitalAssets.formato, filter.formato as any));
      }

      if (filter.soloActivos) {
        conditions.push(eq(digitalAssets.estado, 'activo'));
      }

      if (filter.soloVigentes) {
        // digitalAssets no tiene fechaInicio/fechaFin directamente,
        // se resuelve via cuna → campaña
      }

      const orderFn = filter.orderDir === 'asc' ? asc : desc;

      const [rows, [countRow]] = await Promise.all([
        getDB()
          .select()
          .from(digitalAssets)
          .where(and(...conditions))
          .orderBy(orderFn(digitalAssets.fechaSubida))
          .limit(limit)
          .offset(offset),
        getDB()
          .select({ count: sql<number>`count(*)` })
          .from(digitalAssets)
          .where(and(...conditions)),
      ]);

      const total = Number(countRow?.count ?? 0);
      return {
        items: rows.map((r) => ActivoDigitalMapper.toEntity(r)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    });
  }

  async save(activo: ActivoDigital): Promise<void> {
    const data = ActivoDigitalMapper.toPersistence(activo);
    await withTenantContext(activo.tenantId, async () => {
      await getDB()
        .insert(digitalAssets)
        .values(data)
        .onConflictDoUpdate({
          target: digitalAssets.id,
          set: {
            nombre: data.nombre,
            tipoAsset: data.tipoAsset,
            formato: data.formato,
            urlOriginal: data.urlOriginal,
            urlOptimizada: data.urlOptimizada,
            urlThumbnail: data.urlThumbnail,
            anchoPixeles: data.anchoPixeles,
            altoPixeles: data.altoPixeles,
            aspectRatio: data.aspectRatio,
            duracionSegundos: data.duracionSegundos,
            pesoBytes: data.pesoBytes,
            calidadScore: data.calidadScore,
            validacionTecnica: data.validacionTecnica,
            adaptacionesGeneradas: data.adaptacionesGeneradas,
            analisisIA: data.analisisIA,
            estado: data.estado,
            anuncianteId: data.anuncianteId,
            fechaModificacion: new Date(),
            modificadoPorId: data.modificadoPorId,
          },
        });
    });
  }

  async delete(id: string, tenantId: string, _eliminadoPorId: string): Promise<void> {
    await withTenantContext(tenantId, async () => {
      await getDB()
        .update(digitalAssets)
        .set({
          activo: false,
          estado: 'archivado',
          fechaModificacion: new Date(),
        })
        .where(and(eq(digitalAssets.id, id), eq(digitalAssets.tenantId, tenantId)));
    });
  }

  async reserveNextCodigo(tenantId: string): Promise<string> {
    return withTenantContext(tenantId, async () => {
      const year = new Date().getFullYear();
      const [result] = await getDB()
        .select({
          maxCodigo: sql<string>`MAX(codigo)`,
        })
        .from(digitalAssets)
        .where(eq(digitalAssets.tenantId, tenantId));

      let nextSeq = 1;
      if (result?.maxCodigo && /^DA-\d{4}-\d{4}$/.test(result.maxCodigo)) {
        nextSeq = parseInt(result.maxCodigo.split('-')[2], 10) + 1;
      }

      return `DA-${year}-${String(nextSeq).padStart(4, '0')}`;
    });
  }

  async exists(id: string, tenantId: string): Promise<boolean> {
    return withTenantContext(tenantId, async () => {
      const [row] = await getDB()
        .select({ id: digitalAssets.id })
        .from(digitalAssets)
        .where(and(
          eq(digitalAssets.id, id),
          eq(digitalAssets.tenantId, tenantId),
          eq(digitalAssets.activo, true)
        ))
        .limit(1);
      return !!row;
    });
  }
}
