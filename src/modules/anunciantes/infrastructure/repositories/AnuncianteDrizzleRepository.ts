import { eq, and, ilike, or, ne, count, desc, gte } from 'drizzle-orm';
import { getDB } from '@/lib/db';
import { anunciantes, contratos, campanas, cunas, registroEmisiones } from '@/lib/db/schema';
import { withTenantContext } from '@/lib/db/tenant-context';
import { Anunciante } from '../../domain/entities/Anunciante';
import { IAnuncianteRepository, BuscarAnunciantesFilters, PaginationParams, AnuncianteEnriquecido } from '../../domain/repositories/IAnuncianteRepository';

export class AnuncianteDrizzleRepository implements IAnuncianteRepository {
  async findById(id: string, tenantId: string): Promise<Anunciante | null> {
    return withTenantContext(tenantId, async () => {
      const [row] = await getDB()
        .select()
        .from(anunciantes)
        .where(and(eq(anunciantes.id, id), eq(anunciantes.tenantId, tenantId), eq(anunciantes.eliminado, false)))
        .limit(1);
      return row ? this.toDomain(row) : null;
    });
  }

  async findAll(tenantId: string, filters: BuscarAnunciantesFilters, pagination: PaginationParams): Promise<Anunciante[]> {
    return withTenantContext(tenantId, async () => {
      const conditions = [eq(anunciantes.tenantId, tenantId), eq(anunciantes.eliminado, false)];

      if (filters.search) {
        const s = `%${filters.search}%`;
        conditions.push(or(
          ilike(anunciantes.nombreRazonSocial, s),
          ilike(anunciantes.rut, s),
          ilike(anunciantes.emailContacto, s),
          ilike(anunciantes.codigo, s)
        ) as ReturnType<typeof eq>);
      }
      if (filters.estado) {
        conditions.push(eq(anunciantes.estado, filters.estado));
      }
      if (filters.activo !== undefined) {
        conditions.push(eq(anunciantes.activo, filters.activo));
      }

      const rows = await getDB()
        .select()
        .from(anunciantes)
        .where(and(...conditions))
        .orderBy(desc(anunciantes.fechaCreacion))
        .limit(pagination.limit)
        .offset((pagination.page - 1) * pagination.limit);

      return rows.map(r => this.toDomain(r));
    });
  }

  async save(anunciante: Anunciante): Promise<void> {
    const data = anunciante.toJSON();
    await withTenantContext(data.tenantId, async () => {
      await getDB().insert(anunciantes).values({
        id: data.id,
        tenantId: data.tenantId,
        codigo: data.codigo,
        rut: data.rut,
        nombreRazonSocial: data.nombreRazonSocial,
        giroActividad: data.giroActividad,
        direccion: data.direccion,
        ciudad: data.ciudad,
        comunaProvincia: data.comunaProvincia,
        pais: data.pais,
        emailContacto: data.emailContacto,
        telefonoContacto: data.telefonoContacto,
        paginaWeb: data.paginaWeb,
        nombreContactoPrincipal: data.nombreContactoPrincipal,
        cargoContactoPrincipal: data.cargoContactoPrincipal,
        tieneFacturacionElectronica: data.tieneFacturacionElectronica,
        direccionFacturacion: data.direccionFacturacion,
        emailFacturacion: data.emailFacturacion,
        notas: data.notas,
        estado: data.estado,
        activo: data.activo,
        eliminado: data.eliminado,
        fechaCreacion: data.fechaCreacion,
        fechaModificacion: data.fechaModificacion,
        fechaEliminacion: data.fechaEliminacion,
        creadoPorId: data.creadoPorId,
        modificadoPorId: data.modificadoPorId,
        eliminadoPorId: data.eliminadoPorId,
        createdAt: data.fechaCreacion,
        updatedAt: data.fechaModificacion ?? data.fechaCreacion,
      });
    });
  }

  async update(anunciante: Anunciante): Promise<void> {
    const data = anunciante.toJSON();
    await withTenantContext(data.tenantId, async () => {
      await getDB()
        .update(anunciantes)
        .set({
          codigo: data.codigo,
          rut: data.rut,
          nombreRazonSocial: data.nombreRazonSocial,
          giroActividad: data.giroActividad,
          direccion: data.direccion,
          ciudad: data.ciudad,
          comunaProvincia: data.comunaProvincia,
          pais: data.pais,
          emailContacto: data.emailContacto,
          telefonoContacto: data.telefonoContacto,
          paginaWeb: data.paginaWeb,
          nombreContactoPrincipal: data.nombreContactoPrincipal,
          cargoContactoPrincipal: data.cargoContactoPrincipal,
          tieneFacturacionElectronica: data.tieneFacturacionElectronica,
          direccionFacturacion: data.direccionFacturacion,
          emailFacturacion: data.emailFacturacion,
          notas: data.notas,
          estado: data.estado,
          activo: data.activo,
          eliminado: data.eliminado,
          fechaModificacion: data.fechaModificacion,
          fechaEliminacion: data.fechaEliminacion,
          modificadoPorId: data.modificadoPorId,
          eliminadoPorId: data.eliminadoPorId,
          updatedAt: new Date(),
        })
        .where(and(eq(anunciantes.id, data.id), eq(anunciantes.tenantId, data.tenantId)));
    });
  }

  async softDelete(id: string, tenantId: string, userId: string): Promise<void> {
    await withTenantContext(tenantId, async () => {
      await getDB()
        .update(anunciantes)
        .set({
          eliminado: true,
          eliminadoPorId: userId,
          fechaEliminacion: new Date(),
          activo: false,
          estado: 'inactivo',
          updatedAt: new Date(),
        })
        .where(and(eq(anunciantes.id, id), eq(anunciantes.tenantId, tenantId)));
    });
  }

  async count(tenantId: string, filters: BuscarAnunciantesFilters): Promise<number> {
    return withTenantContext(tenantId, async () => {
      const conditions = [eq(anunciantes.tenantId, tenantId), eq(anunciantes.eliminado, false)];
      if (filters.search) {
        const s = `%${filters.search}%`;
        conditions.push(or(
          ilike(anunciantes.nombreRazonSocial, s),
          ilike(anunciantes.rut, s),
          ilike(anunciantes.emailContacto, s),
          ilike(anunciantes.codigo, s)
        ) as ReturnType<typeof eq>);
      }
      if (filters.estado) conditions.push(eq(anunciantes.estado, filters.estado));
      if (filters.activo !== undefined) conditions.push(eq(anunciantes.activo, filters.activo));

      const [{ total }] = await getDB()
        .select({ total: count() })
        .from(anunciantes)
        .where(and(...conditions));
      return Number(total);
    });
  }

  async existsByRut(rut: string, tenantId: string, excludeId?: string): Promise<boolean> {
    return withTenantContext(tenantId, async () => {
      const conditions = [
        eq(anunciantes.tenantId, tenantId),
        eq(anunciantes.eliminado, false),
        ilike(anunciantes.rut, `%${rut.replace(/[.\-]/g, '')}%`),
      ];
      if (excludeId) conditions.push(ne(anunciantes.id, excludeId));
      const [{ total }] = await getDB()
        .select({ total: count() })
        .from(anunciantes)
        .where(and(...conditions))
        .limit(1);
      return Number(total) > 0;
    });
  }

  async generateCode(tenantId: string): Promise<string> {
    return withTenantContext(tenantId, async () => {
      const [{ total }] = await getDB()
        .select({ total: count() })
        .from(anunciantes)
        .where(and(eq(anunciantes.tenantId, tenantId), ne(anunciantes.eliminado, true)));
      return `ANU-${(Number(total) + 1).toString().padStart(4, '0')}`;
    });
  }

  async findEnriched(tenantId: string, search?: string, limit: number = 10): Promise<AnuncianteEnriquecido[]> {
    return withTenantContext(tenantId, async () => {
      const db = getDB();

      // Construir condiciones base con tenant y no eliminado
      const baseConditions = [eq(anunciantes.tenantId, tenantId), eq(anunciantes.eliminado, false)];

      // Agregar búsqueda si existe
      if (search) {
        const s = `%${search}%`;
        baseConditions.push(or(
          ilike(anunciantes.nombreRazonSocial, s),
          ilike(anunciantes.rut, s),
          ilike(anunciantes.giroActividad, s)
        ) as ReturnType<typeof eq>);
      }

      // Obtener anunciantes
      const rows = await db
        .select()
        .from(anunciantes)
        .where(and(...baseConditions))
        .limit(limit);

      // Para cada anunciante, calcular datos enriquecidos
      const enrichedResults: AnuncianteEnriquecido[] = [];

      for (const row of rows) {
        // Contar contratos activos del anunciante
        const [contratosCountResult] = await db
          .select({ total: count() })
          .from(contratos)
          .where(and(
            eq(contratos.anuncianteId, row.id),
            eq(contratos.tenantId, tenantId),
            eq(contratos.eliminado, false)
          ));

        // Contar cuñas activas (últimos 30 días) - vía campañas del anunciante
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

        // Contar emisiones directamente por anuncianteId y fecha de última emisión
        const [cunasCountResult] = await db
          .select({ total: count() })
          .from(registroEmisiones)
          .innerJoin(cunas, eq(registroEmisiones.cunaId, cunas.id))
          .innerJoin(campanas, eq(cunas.campanaId, campanas.id))
          .where(and(
            eq(cunas.anuncianteId, row.id),
            eq(campanas.tenantId, tenantId),
            eq(campanas.eliminado, false),
            gte(registroEmisiones.fechaEmision, thirtyDaysAgoStr)
          ));

        // Obtener última actividad (fecha más reciente de emisión o modificación)
        // Por simplicidad, usamos la fecha de creación del anunciante como proxy
        const ultimaActividad = row.fechaCreacion?.toISOString() || new Date().toISOString();

        // Calcular riskScore basado en estado y actividad
        let riskScore = 500; // default
        let riskLevel: 'bajo' | 'medio' | 'alto' = 'medio';

        if (row.estado === 'activo') {
          riskScore = Number(contratosCountResult?.total || 0) > 0 ? 700 : 500;
          riskLevel = 'bajo';
        } else if (row.estado === 'inactivo' || row.estado === 'suspendido') {
          riskScore = 300;
          riskLevel = 'alto';
        }

        // Calcular creditScore basado en número de contratos
        const creditScore = Math.min(100, (Number(contratosCountResult?.total || 0) * 15) + 40);

        enrichedResults.push({
          id: row.id,
          nombre: row.nombreRazonSocial,
          razonSocial: row.nombreRazonSocial,
          rut: row.rut || '',
          industria: row.giroActividad || 'General',
          estado: row.estado as 'activo' | 'inactivo' | 'suspendido',
          contratosActivos: Number(contratosCountResult?.total || 0),
          cunasActivas: Number(cunasCountResult?.total || 0),
          ultimaActividad,
          riskLevel,
          riskScore,
          creditScore,
        });
      }

      return enrichedResults;
    });
  }

  private toDomain(row: typeof anunciantes.$inferSelect): Anunciante {
    return Anunciante.reconstitute({
      id: row.id,
      tenantId: row.tenantId,
      codigo: row.codigo,
      rut: row.rut,
      nombreRazonSocial: row.nombreRazonSocial,
      giroActividad: row.giroActividad,
      direccion: row.direccion,
      ciudad: row.ciudad,
      comunaProvincia: row.comunaProvincia,
      pais: row.pais || '',
      emailContacto: row.emailContacto,
      telefonoContacto: row.telefonoContacto,
      paginaWeb: row.paginaWeb,
      nombreContactoPrincipal: row.nombreContactoPrincipal,
      cargoContactoPrincipal: row.cargoContactoPrincipal,
      tieneFacturacionElectronica: row.tieneFacturacionElectronica,
      direccionFacturacion: row.direccionFacturacion,
      emailFacturacion: row.emailFacturacion,
      notas: row.notas,
      estado: row.estado,
      activo: row.activo,
      eliminado: row.eliminado,
      fechaCreacion: row.fechaCreacion,
      fechaModificacion: row.fechaModificacion,
      fechaEliminacion: row.fechaEliminacion,
      creadoPorId: row.creadoPorId,
      modificadoPorId: row.modificadoPorId,
      eliminadoPorId: row.eliminadoPorId,
    });
  }
}
