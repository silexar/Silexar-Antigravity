import { eq, and, desc, sql, ilike, or, count } from 'drizzle-orm';
import { getDB } from '@/lib/db';
import { facturas } from '@/lib/db/schema';
import { withTenantContext } from '@/lib/db/tenant-context';
import { Factura } from '../../domain/entities/Factura';
import { IFacturaRepository, BuscarFacturasFilters, PaginationParams } from '../../domain/repositories/IFacturaRepository';

export class FacturaDrizzleRepository implements IFacturaRepository {
  async findById(id: string, tenantId: string): Promise<Factura | null> {
    return withTenantContext(tenantId, async () => {
      const [row] = await getDB()
        .select()
        .from(facturas)
        .where(and(eq(facturas.id, id), eq(facturas.tenantId, tenantId), eq(facturas.anulada, false)))
        .limit(1);
      return row ? this.toDomain(row) : null;
    });
  }

  async findAll(tenantId: string, filters: BuscarFacturasFilters, pagination: PaginationParams): Promise<Factura[]> {
    return withTenantContext(tenantId, async () => {
      const conditions = [eq(facturas.tenantId, tenantId), eq(facturas.anulada, false)];

      if (filters.search) {
        const s = `%${filters.search}%`;
        conditions.push(or(
          ilike(facturas.receptorRazonSocial, s),
          ilike(facturas.receptorRut, s),
          ilike(sql`CAST(${facturas.numeroFactura} AS TEXT)`, s)
        ) as ReturnType<typeof eq>);
      }
      if (filters.estado) {
        conditions.push(eq(facturas.estado, filters.estado));
      }
      if (filters.tipoDocumento) {
        conditions.push(eq(facturas.tipoDocumento, filters.tipoDocumento));
      }

      const rows = await getDB()
        .select()
        .from(facturas)
        .where(and(...conditions))
        .orderBy(desc(facturas.fechaEmision), desc(facturas.numeroFactura))
        .limit(pagination.limit)
        .offset((pagination.page - 1) * pagination.limit);

      return rows.map(r => this.toDomain(r));
    });
  }

  async save(factura: Factura): Promise<void> {
    const data = factura.toJSON();
    await withTenantContext(data.tenantId, async () => {
      await getDB().insert(facturas).values({
        id: data.id,
        tenantId: data.tenantId,
        numeroFactura: data.numeroFactura,
        folio: data.folio,
        tipoDocumento: data.tipoDocumento,
        codigoSii: data.codigoSii,
        anuncianteId: data.anuncianteId,
        agenciaId: data.agenciaId,
        contratoId: data.contratoId,
        receptorRut: data.receptorRut,
        receptorRazonSocial: data.receptorRazonSocial,
        receptorGiro: data.receptorGiro,
        receptorDireccion: data.receptorDireccion,
        receptorCiudad: data.receptorCiudad,
        receptorComuna: data.receptorComuna,
        fechaEmision: data.fechaEmision,
        fechaVencimiento: data.fechaVencimiento,
        montoNeto: String(data.montoNeto),
        montoExento: String(data.montoExento),
        tasaIva: String(data.tasaIva),
        montoIva: String(data.montoIva),
        montoTotal: String(data.montoTotal),
        moneda: data.moneda,
        formaPago: data.formaPago,
        estado: data.estado,
        montoPagado: String(data.montoPagado),
        fechaPago: data.fechaPago,
        saldoPendiente: data.saldoPendiente !== null ? String(data.saldoPendiente) : null,
        facturaReferenciaId: data.facturaReferenciaId,
        motivoReferencia: data.motivoReferencia,
        observaciones: data.observaciones,
        anulada: data.anulada,
        fechaAnulacion: data.fechaAnulacion,
        creadoPorId: data.creadoPorId,
        fechaCreacion: data.fechaCreacion,
        fechaModificacion: data.fechaModificacion,
        modificadoPorId: data.modificadoPorId,
      });
    });
  }

  async update(factura: Factura): Promise<void> {
    const data = factura.toJSON();
    await withTenantContext(data.tenantId, async () => {
      await getDB()
        .update(facturas)
        .set({
          numeroFactura: data.numeroFactura,
          folio: data.folio,
          tipoDocumento: data.tipoDocumento,
          codigoSii: data.codigoSii,
          anuncianteId: data.anuncianteId,
          agenciaId: data.agenciaId,
          contratoId: data.contratoId,
          receptorRut: data.receptorRut,
          receptorRazonSocial: data.receptorRazonSocial,
          receptorGiro: data.receptorGiro,
          receptorDireccion: data.receptorDireccion,
          receptorCiudad: data.receptorCiudad,
          receptorComuna: data.receptorComuna,
          fechaEmision: data.fechaEmision,
          fechaVencimiento: data.fechaVencimiento,
          montoNeto: String(data.montoNeto),
          montoExento: String(data.montoExento),
          tasaIva: String(data.tasaIva),
          montoIva: String(data.montoIva),
          montoTotal: String(data.montoTotal),
          moneda: data.moneda,
          formaPago: data.formaPago,
          estado: data.estado,
          montoPagado: String(data.montoPagado),
          fechaPago: data.fechaPago,
          saldoPendiente: data.saldoPendiente !== null ? String(data.saldoPendiente) : null,
          facturaReferenciaId: data.facturaReferenciaId,
          motivoReferencia: data.motivoReferencia,
          observaciones: data.observaciones,
          anulada: data.anulada,
          fechaAnulacion: data.fechaAnulacion,
          fechaModificacion: new Date(),
          modificadoPorId: data.modificadoPorId,
        })
        .where(and(eq(facturas.id, data.id), eq(facturas.tenantId, data.tenantId)));
    });
  }

  async count(tenantId: string, filters: BuscarFacturasFilters): Promise<number> {
    return withTenantContext(tenantId, async () => {
      const conditions = [eq(facturas.tenantId, tenantId), eq(facturas.anulada, false)];
      if (filters.search) {
        const s = `%${filters.search}%`;
        conditions.push(or(
          ilike(facturas.receptorRazonSocial, s),
          ilike(facturas.receptorRut, s),
          ilike(sql`CAST(${facturas.numeroFactura} AS TEXT)`, s)
        ) as ReturnType<typeof eq>);
      }
      if (filters.estado) conditions.push(eq(facturas.estado, filters.estado));
      if (filters.tipoDocumento) conditions.push(eq(facturas.tipoDocumento, filters.tipoDocumento));

      const [{ total }] = await getDB()
        .select({ total: count() })
        .from(facturas)
        .where(and(...conditions));
      return Number(total);
    });
  }

  async generateNumeroFactura(tenantId: string): Promise<number> {
    return withTenantContext(tenantId, async () => {
      const [{ max }] = await getDB()
        .select({ max: sql<number>`COALESCE(MAX(numero_factura), 0)::int` })
        .from(facturas)
        .where(eq(facturas.tenantId, tenantId));
      return Number(max) + 1;
    });
  }

  private toDomain(row: typeof facturas.$inferSelect): Factura {
    return Factura.reconstitute({
      id: row.id,
      tenantId: row.tenantId,
      numeroFactura: row.numeroFactura,
      folio: row.folio ?? null,
      tipoDocumento: row.tipoDocumento,
      codigoSii: row.codigoSii ?? 33,
      anuncianteId: row.anuncianteId ?? null,
      agenciaId: row.agenciaId ?? null,
      contratoId: row.contratoId ?? null,
      receptorRut: row.receptorRut,
      receptorRazonSocial: row.receptorRazonSocial,
      receptorGiro: row.receptorGiro ?? null,
      receptorDireccion: row.receptorDireccion ?? null,
      receptorCiudad: row.receptorCiudad ?? null,
      receptorComuna: row.receptorComuna ?? null,
      fechaEmision: row.fechaEmision,
      fechaVencimiento: row.fechaVencimiento ?? null,
      montoNeto: Number(row.montoNeto),
      montoExento: Number(row.montoExento ?? 0),
      tasaIva: Number(row.tasaIva ?? 19),
      montoIva: Number(row.montoIva),
      montoTotal: Number(row.montoTotal),
      moneda: row.moneda ?? 'CLP',
      formaPago: row.formaPago,
      estado: row.estado,
      montoPagado: Number(row.montoPagado ?? 0),
      fechaPago: row.fechaPago,
      saldoPendiente: row.saldoPendiente !== null ? Number(row.saldoPendiente) : null,
      facturaReferenciaId: row.facturaReferenciaId ?? null,
      motivoReferencia: row.motivoReferencia ?? null,
      observaciones: row.observaciones ?? null,
      anulada: row.anulada,
      fechaAnulacion: row.fechaAnulacion,
      creadoPorId: row.creadoPorId,
      fechaCreacion: row.fechaCreacion,
      modificadoPorId: row.modificadoPorId ?? null,
      fechaModificacion: row.fechaModificacion ?? null,
    });
  }
}
