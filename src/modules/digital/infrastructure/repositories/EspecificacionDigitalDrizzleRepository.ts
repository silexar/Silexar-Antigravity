import { eq, and } from 'drizzle-orm';
import { getDB } from '@/lib/db';
import { especificacionesDigitales } from '@/lib/db/schema';
import { withTenantContext } from '@/lib/db/tenant-context';
import { EspecificacionDigital } from '../../domain/entities/EspecificacionDigital';
import { IEspecificacionDigitalRepository } from '../../domain/repositories/IEspecificacionDigitalRepository';

export class EspecificacionDigitalDrizzleRepository implements IEspecificacionDigitalRepository {
  async findById(id: string, tenantId: string): Promise<EspecificacionDigital | null> {
    return withTenantContext(tenantId, async () => {
      const [row] = await getDB()
        .select()
        .from(especificacionesDigitales)
        .where(and(eq(especificacionesDigitales.id, id), eq(especificacionesDigitales.tenantId, tenantId)))
        .limit(1);
      return row ? this.toDomain(row) : null;
    });
  }

  async findByCampanaId(campanaId: string, tenantId: string): Promise<EspecificacionDigital | null> {
    return withTenantContext(tenantId, async () => {
      const [row] = await getDB()
        .select()
        .from(especificacionesDigitales)
        .where(and(
          eq(especificacionesDigitales.campanaId, campanaId),
          eq(especificacionesDigitales.tenantId, tenantId)
        ))
        .limit(1);
      return row ? this.toDomain(row) : null;
    });
  }

  async findByContratoId(contratoId: string, tenantId: string): Promise<EspecificacionDigital | null> {
    return withTenantContext(tenantId, async () => {
      const [row] = await getDB()
        .select()
        .from(especificacionesDigitales)
        .where(and(
          eq(especificacionesDigitales.contratoId, contratoId),
          eq(especificacionesDigitales.tenantId, tenantId)
        ))
        .limit(1);
      return row ? this.toDomain(row) : null;
    });
  }

  async save(especificacion: EspecificacionDigital): Promise<void> {
    const data = especificacion.toJSON();
    await withTenantContext(data.tenantId, async () => {
      await getDB().insert(especificacionesDigitales).values({
        id: data.id,
        tenantId: data.tenantId,
        campanaId: data.campanaId,
        contratoId: data.contratoId,
        plataformas: data.plataformas,
        presupuestoDigital: data.presupuestoDigital !== null ? String(data.presupuestoDigital) : null,
        moneda: data.moneda,
        tipoPresupuesto: data.tipoPresupuesto,
        objetivos: data.objetivos,
        trackingLinks: data.trackingLinks,
        configuracionTargeting: data.configuracionTargeting,
        estado: data.estado,
        notas: data.notas,
        creadoPorId: data.creadoPorId,
        fechaCreacion: data.fechaCreacion,
        fechaModificacion: data.fechaModificacion,
      });
    });
  }

  async update(especificacion: EspecificacionDigital): Promise<void> {
    const data = especificacion.toJSON();
    await withTenantContext(data.tenantId, async () => {
      await getDB()
        .update(especificacionesDigitales)
        .set({
          plataformas: data.plataformas,
          presupuestoDigital: data.presupuestoDigital !== null ? String(data.presupuestoDigital) : null,
          moneda: data.moneda,
          tipoPresupuesto: data.tipoPresupuesto,
          objetivos: data.objetivos,
          trackingLinks: data.trackingLinks,
          configuracionTargeting: data.configuracionTargeting,
          estado: data.estado,
          notas: data.notas,
          fechaModificacion: new Date(),
        })
        .where(and(eq(especificacionesDigitales.id, data.id), eq(especificacionesDigitales.tenantId, data.tenantId)));
    });
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await withTenantContext(tenantId, async () => {
      await getDB()
        .delete(especificacionesDigitales)
        .where(and(eq(especificacionesDigitales.id, id), eq(especificacionesDigitales.tenantId, tenantId)));
    });
  }

  private toDomain(row: typeof especificacionesDigitales.$inferSelect): EspecificacionDigital {
    return EspecificacionDigital.reconstitute({
      id: row.id,
      tenantId: row.tenantId,
      campanaId: row.campanaId ?? null,
      contratoId: row.contratoId ?? null,
      plataformas: row.plataformas ?? [],
      presupuestoDigital: row.presupuestoDigital !== null ? Number(row.presupuestoDigital) : null,
      moneda: row.moneda ?? 'CLP',
      tipoPresupuesto: (row.tipoPresupuesto as 'diario' | 'total') ?? null,
      objetivos: (row.objetivos as any) ?? null,
      trackingLinks: row.trackingLinks ?? [],
      configuracionTargeting: (row.configuracionTargeting as any) ?? null,
      estado: row.estado ?? 'borrador',
      notas: row.notas ?? null,
      creadoPorId: row.creadoPorId,
      fechaCreacion: row.fechaCreacion,
      fechaModificacion: row.fechaModificacion ?? null,
    });
  }
}
