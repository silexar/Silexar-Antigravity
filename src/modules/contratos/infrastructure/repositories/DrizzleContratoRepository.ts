/**
 * REPOSITORIO DRIZZLE CONTRATOS - TIER 0
 * 
 * @description Implementación del repositorio con Drizzle ORM
 * Multi-tenant safe, full type-safety y reemplazo directo de Prisma.
 */

import { IContratoRepository, BusquedaCriteria } from '../../domain/repositories/IContratoRepository.js'
import { Contrato } from '../../domain/entities/Contrato.js'
import { NumeroContrato } from '../../domain/value-objects/NumeroContrato.js'
import { EstadoContrato } from '../../domain/value-objects/EstadoContrato.js'
import { TerminosPago } from '../../domain/value-objects/TerminosPago.js'
import { TotalesContrato } from '../../domain/value-objects/TotalesContrato.js'
import { RiesgoCredito } from '../../domain/value-objects/RiesgoCredito.js'
import { MetricasRentabilidad } from '../../domain/value-objects/MetricasRentabilidad.js'

import { db as _db } from '@/lib/db'
import { contratos } from '@/lib/db/schema'
// DATABASE_URL is required at startup; non-null assertion is safe in server context
const db = _db!
import { eq, or, desc, inArray, gte, lte, and, sql, asc, ilike } from 'drizzle-orm'

export class DrizzleContratoRepository implements IContratoRepository {
  // El tenantId es inyectado por el servicio de dominio para hacer el repositorio Multi-Tenant safe (Fase 2 Tarea 14)
  constructor(private tenantId: string) {}

  async save(contrato: Contrato): Promise<void> {
    const data = this.mapToDatabase(contrato)
    
    // Upsert equivalent in Drizzle
    await db.insert(contratos).values(data).onConflictDoUpdate({
      target: contratos.id,
      set: data
    })
  }

  async findById(id: string): Promise<Contrato | null> {
    const result = await db.query.contratos.findFirst({
      where: and(eq(contratos.id, id), eq(contratos.tenantId, this.tenantId)),
      with: {
        items: true,
        vencimientos: true
      }
    })

    return result ? this.mapFromDatabase(result) : null
  }

  async findByNumero(numero: string): Promise<Contrato | null> {
    const result = await db.query.contratos.findFirst({
      where: and(eq(contratos.numeroContrato, numero), eq(contratos.tenantId, this.tenantId)),
      with: {
        items: true,
        vencimientos: true
      }
    })

    return result ? this.mapFromDatabase(result) : null
  }

  async findByAnunciante(anuncianteId: string): Promise<Contrato[]> {
    const results = await db.query.contratos.findMany({
      where: and(eq(contratos.anuncianteId, anuncianteId), eq(contratos.tenantId, this.tenantId)),
      orderBy: [desc(contratos.fechaCreacion)],
      with: {
        items: true,
        vencimientos: true
      }
    })

    return results.map(item => this.mapFromDatabase(item))
  }

  async search(criteria: BusquedaCriteria): Promise<{ contratos: Contrato[]; total: number; pagina: number; tamanoPagina: number; totalPaginas: number }> {
    const conditions = [];

    // Multi-tenant check obligatorio
    conditions.push(eq(contratos.tenantId, this.tenantId));

    if (criteria.busquedaTexto) {
      conditions.push(
        or(
          ilike(contratos.titulo, `%${criteria.busquedaTexto}%`),
          ilike(contratos.numeroContrato, `%${criteria.busquedaTexto}%`)
        )
      )
    }

    if (criteria.estados && criteria.estados.length > 0) {
      conditions.push(inArray(contratos.estado, criteria.estados as string[]))
    }

    if (criteria.anuncianteId) {
      conditions.push(eq(contratos.anuncianteId, criteria.anuncianteId))
    }

    if (criteria.ejecutivoId) {
      conditions.push(eq(contratos.ejecutivoId, criteria.ejecutivoId))
    }

    if (criteria.valorMinimoNeto) {
      conditions.push(gte(contratos.valorTotalNeto, String(criteria.valorMinimoNeto)))
    }

    if (criteria.valorMaximoNeto) {
      conditions.push(lte(contratos.valorTotalNeto, String(criteria.valorMaximoNeto)))
    }

    if (criteria.fechaCreacionDesde) {
      conditions.push(gte(contratos.fechaCreacion, new Date(criteria.fechaCreacionDesde)))
    }

    if (criteria.fechaCreacionHasta) {
      conditions.push(lte(contratos.fechaCreacion, new Date(criteria.fechaCreacionHasta)))
    }

    const whereCondition = and(...conditions);

    // Pagination
    const page = criteria.pagina || 1;
    const pageSize = criteria.tamanoPagina || 10;
    const offset = (page - 1) * pageSize;

    const data = await db.query.contratos.findMany({
      where: whereCondition,
      limit: pageSize,
      offset: offset,
      orderBy: [desc(contratos.fechaCreacion)], // default order
      with: { items: true, vencimientos: true }
    });

    const totalRes = await db.select({ count: sql<number>`count(*)` }).from(contratos).where(whereCondition);
    const total = Number(totalRes[0].count);

    return {
      contratos: data.map(item => this.mapFromDatabase(item)),
      total,
      pagina: page,
      tamanoPagina: pageSize,
      totalPaginas: Math.ceil(total / pageSize)
    }
  }

  async getNextSequence(año: number): Promise<number> {
    const ultimoContrato = await db.query.contratos.findFirst({
      where: and(
        ilike(contratos.numeroContrato, `CON-${año}-%`),
        eq(contratos.tenantId, this.tenantId)
      ),
      orderBy: [desc(contratos.numeroContrato)]
    })

    if (!ultimoContrato) {
      return 1
    }

    const partes = ultimoContrato.numeroContrato.split('-')
    const ultimaSecuencia = parseInt(partes[2])
    return isNaN(ultimaSecuencia) ? 1 : ultimaSecuencia + 1
  }

  async getPipelineData(filtros: unknown): Promise<unknown> {
    const f = filtros as { ejecutivoId?: string };
    const conditions = [eq(contratos.tenantId, this.tenantId)];

    if (f.ejecutivoId) {
      conditions.push(eq(contratos.ejecutivoId, f.ejecutivoId));
    }

    const result = await db.select({
      estado: contratos.estado,
      cantidad: sql<number>`count(${contratos.id})`,
      valor: sql<number>`sum(${contratos.valorTotalNeto})`
    })
    .from(contratos)
    .where(and(...conditions))
    .groupBy(contratos.estado);

    return result.map(item => ({
      estado: item.estado,
      cantidad: Number(item.cantidad),
      valor: Number(item.valor || 0)
    }))
  }

  async getMetricasEjecutivo(ejecutivoId: string, periodo: { fechaDesde: Date | string; fechaHasta: Date | string }): Promise<unknown> {
    const ventasResult = await db.select({
      cantidad: sql<number>`count(${contratos.id})`,
      valorTotal: sql<number>`sum(${contratos.valorTotalNeto})`,
      valorPromedio: sql<number>`avg(${contratos.valorTotalNeto})`
    })
    .from(contratos)
    .where(and(
      eq(contratos.tenantId, this.tenantId),
      eq(contratos.ejecutivoId, ejecutivoId),
      eq(contratos.estado, 'aprobado' as string), // mapping it to approved since 'firmado' is not an enum in Drizzle
      gte(contratos.fechaCreacion, new Date(periodo.fechaDesde)),
      lte(contratos.fechaCreacion, new Date(periodo.fechaHasta))
    ));

    const pipelineResult = await db.select({
      cantidad: sql<number>`count(${contratos.id})`,
      valorTotal: sql<number>`sum(${contratos.valorTotalNeto})`
    })
    .from(contratos)
    .where(and(
      eq(contratos.tenantId, this.tenantId),
      eq(contratos.ejecutivoId, ejecutivoId),
      inArray(contratos.estado, ['borrador', 'pendiente_aprobacion'] as string[])
    ));

    const conversionData = await db.select({
      estado: contratos.estado,
      cantidad: sql<number>`count(${contratos.id})`
    })
    .from(contratos)
    .where(and(
      eq(contratos.tenantId, this.tenantId),
      eq(contratos.ejecutivoId, ejecutivoId)
    ))
    .groupBy(contratos.estado);

    const totalCount = conversionData.reduce((acc, curr) => acc + Number(curr.cantidad), 0);
    const firmadosCount = Number(conversionData.find(c => c.estado === 'aprobado')?.cantidad || 0);

    return {
      ventas: {
        cantidad: Number(ventasResult[0]?.cantidad || 0),
        valorTotal: Number(ventasResult[0]?.valorTotal || 0),
        valorPromedio: Number(ventasResult[0]?.valorPromedio || 0)
      },
      pipeline: {
        contratosActivos: Number(pipelineResult[0]?.cantidad || 0),
        valorPipeline: Number(pipelineResult[0]?.valorTotal || 0)
      },
      conversion: totalCount > 0 ? (firmadosCount / totalCount) * 100 : 0
    }
  }

  private mapToDatabase(contrato: Contrato): Record<string, unknown> {
    const snapshot = contrato.toSnapshot()
    
    return {
      id: snapshot.id,
      tenantId: this.tenantId,
      numeroContrato: snapshot.numero.valor,
      titulo: snapshot.producto || 'Default',
      anuncianteId: snapshot.anuncianteId,
      agenciaId: snapshot.agenciaId,
      ejecutivoId: snapshot.ejecutivoId,
      
      // Valores financieros
      valorTotalBruto: snapshot.totales.valorBruto.toString(),
      valorTotalNeto: snapshot.totales.valorNeto.toString(),
      moneda: snapshot.moneda,
      
      // Fechas
      fechaInicio: snapshot.fechaInicio.toISOString().split('T')[0],
      fechaFin: snapshot.fechaFin.toISOString().split('T')[0],
      fechaCreacion: snapshot.fechaCreacion,
      fechaModificacion: snapshot.fechaActualizacion,
      
      // Estado y clasificación
      estado: snapshot.estado.valor,
      tipoContrato: 'campaña', // default fallback based on mapping requirement
      
      // Términos comerciales
      diasCredito: snapshot.terminosPago.dias,
      
      // Auditoría
      creadoPorId: snapshot.creadoPor || this.tenantId, // fallback
    }
  }

  private mapFromDatabase(data: Record<string, unknown>): Contrato {
    const numero = NumeroContrato.fromString(data.numeroContrato as string)
    const estado = EstadoContrato.fromString(data.estado as string)
    const terminosPago = TerminosPago.create((data.diasCredito as number | undefined) || 30)
    const totales = TotalesContrato.create(Number(data.valorTotalBruto), Number(data.valorTotalNeto))

    const riesgoCredito = RiesgoCredito.create(50)
    const metricas = MetricasRentabilidad.create({
      margenBruto: 30,
      roi: 25,
      valorVida: Number(data.valorTotalNeto) * 1.5,
      costoAdquisicion: Number(data.valorTotalNeto) * 0.3
    })

    return Contrato.fromPersistence({
      id: data.id as string,
      numero,
      anuncianteId: (data.anuncianteId as string | undefined) || '',
      anunciante: (data.anuncianteNombre as string | undefined) || 'Desconocido',
      rutAnunciante: '-',
      producto: data.titulo as string,
      agenciaId: data.agenciaId as string | undefined,
      agencia: '',
      ejecutivoId: data.ejecutivoId as string | undefined,
      ejecutivo: '',
      totales,
      moneda: (data.moneda as string | undefined) || 'CLP',
      fechaInicio: data.fechaInicio ? new Date(data.fechaInicio as string | number) : new Date(),
      fechaFin: data.fechaFin ? new Date(data.fechaFin as string | number) : new Date(),
      fechaCreacion: data.fechaCreacion as Date,
      fechaActualizacion: (data.fechaModificacion || data.fechaCreacion) as Date,
      estado,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prioridad: 'normal' as any,
      tipoContrato: data.tipoContrato as string,
      terminosPago,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      modalidadFacturacion: 'mensual' as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tipoFactura: 'normal' as any,
      esCanje: false,
      facturarComisionAgencia: false,
      riesgoCredito,
      metricas,
      etapaActual: data.estado as string,
      progreso: 0,
      proximaAccion: '',
      responsableActual: data.ejecutivoId as string | undefined,
      fechaLimiteAccion: null as unknown as Date,
      alertas: [],
      tags: [],
      creadoPor: data.creadoPorId as string | undefined,
      actualizadoPor: data.modificadoPorId as string | undefined,
      version: 1
    })
  }

  async delete(id: string): Promise<void> {
    await db.delete(contratos).where(and(eq(contratos.id, id), eq(contratos.tenantId, this.tenantId)))
  }

  async findByEjecutivo(ejecutivoId: string): Promise<Contrato[]> {
    const data = await db.query.contratos.findMany({
      where: and(eq(contratos.ejecutivoId, ejecutivoId), eq(contratos.tenantId, this.tenantId)),
      orderBy: [desc(contratos.fechaCreacion)],
      with: { items: true, vencimientos: true }
    })
    return data.map(item => this.mapFromDatabase(item))
  }

  async findByEstado(estado: string): Promise<Contrato[]> {
    const data = await db.query.contratos.findMany({
      where: and(eq(contratos.estado, estado as string), eq(contratos.tenantId, this.tenantId)),
      orderBy: [desc(contratos.fechaCreacion)],
      with: { items: true, vencimientos: true }
    })
    return data.map(item => this.mapFromDatabase(item))
  }

  async findVencenEnDias(dias: number): Promise<Contrato[]> {
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() + dias)

    const data = await db.query.contratos.findMany({
      where: and(
        lte(contratos.fechaFin, fechaLimite.toISOString().split('T')[0]),
        inArray(contratos.estado, ['activo', 'aprobado'] as string[]),
        eq(contratos.tenantId, this.tenantId)
      ),
      orderBy: [asc(contratos.fechaFin)]
    })
    return data.map(item => this.mapFromDatabase(item))
  }

  async getAnalisisRentabilidad(filtros: unknown): Promise<unknown> {
    const f = filtros as { ejecutivoId?: string; fechaDesde?: string | Date; fechaHasta?: string | Date };
    const conditions = [eq(contratos.tenantId, this.tenantId)];

    if (f.ejecutivoId) conditions.push(eq(contratos.ejecutivoId, f.ejecutivoId));
    if (f.fechaDesde) conditions.push(gte(contratos.fechaCreacion, new Date(f.fechaDesde)));
    if (f.fechaHasta) conditions.push(lte(contratos.fechaCreacion, new Date(f.fechaHasta)));

    const analisis = await db.select({
      valorPromedio: sql<number>`avg(${contratos.valorTotalNeto})`,
      valorTotal: sql<number>`sum(${contratos.valorTotalNeto})`,
      cantidad: sql<number>`count(${contratos.id})`
    })
    .from(contratos)
    .where(and(...conditions));

    return {
      valorPromedio: Number(analisis[0]?.valorPromedio || 0),
      valorTotal: Number(analisis[0]?.valorTotal || 0),
      cantidadContratos: Number(analisis[0]?.cantidad || 0),
      margenPromedioEstimado: 30
    }
  }

  async getContratosParaRenovacion(diasAnticipacion: number): Promise<Contrato[]> {
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() + diasAnticipacion)

    const data = await db.query.contratos.findMany({
      where: and(
        lte(contratos.fechaFin, fechaLimite.toISOString().split('T')[0]),
        eq(contratos.estado, 'activo' as string),
        eq(contratos.tenantId, this.tenantId)
      ),
      orderBy: [asc(contratos.fechaFin)]
    })
    return data.map(item => this.mapFromDatabase(item))
  }

  async existeNumero(numero: string): Promise<boolean> {
    const contrato = await db.query.contratos.findFirst({
      where: and(eq(contratos.numeroContrato, numero), eq(contratos.tenantId, this.tenantId))
    })
    return contrato !== undefined
  }

  async saveMany(contratosArr: Contrato[]): Promise<void> {
    const records = contratosArr.map(c => this.mapToDatabase(c));
    await db.insert(contratos).values(records).onConflictDoNothing();
  }

  async updateEstadoMasivo(ids: string[], nuevoEstado: string): Promise<number> {
    const result = await db.update(contratos)
      .set({ estado: nuevoEstado as string, fechaModificacion: new Date() })
      .where(and(inArray(contratos.id, ids), eq(contratos.tenantId, this.tenantId)))
      .returning({ updatedId: contratos.id });
      
    return result.length;
  }
}
