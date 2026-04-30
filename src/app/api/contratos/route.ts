/**
 * GET /api/contratos  — List contracts
 * POST /api/contratos — Create contract
 *
 * Security: withApiRoute enforces JWT auth, RBAC, rate limiting, CSRF, and audit logging.
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiRoute } from '@/lib/api/with-api-route'
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response'
import { PropiedadesIntegrationAPI } from '../../../modules/propiedades/api/PropiedadesIntegrationAPI'
import { TipoPropiedadDrizzleRepository, ValorPropiedadDrizzleRepository } from '../../../modules/propiedades/infrastructure/repositories/PropiedadesDrizzleRepository'
import { logger } from '@/lib/observability'
import { auditLogger } from '@/lib/security/audit-logger'
import { AuditEventType } from '@/lib/security/audit-types'
import { DrizzleContratoRepository } from '@/modules/contratos/infrastructure/repositories/DrizzleContratoRepository'
import { Contrato } from '@/modules/contratos/domain/entities/Contrato'
import { NumeroContrato } from '@/modules/contratos/domain/value-objects/NumeroContrato'
import { TotalesContrato } from '@/modules/contratos/domain/value-objects/TotalesContrato'
import { TerminosPago } from '@/modules/contratos/domain/value-objects/TerminosPago'
import { RiesgoCredito } from '@/modules/contratos/domain/value-objects/RiesgoCredito'
import { MetricasRentabilidad } from '@/modules/contratos/domain/value-objects/MetricasRentabilidad'
import { EstadoContrato } from '@/modules/contratos/domain/value-objects/EstadoContrato'

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const createContratoSchema = z.object({
  titulo: z.string().min(1, 'El título es requerido'),
  anuncianteId: z.string().uuid('UUID inválido').optional(),
  agenciaId: z.string().uuid('UUID inválido').optional(),
  fechaInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD inválido'),
  fechaFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD inválido'),
  valorTotalBruto: z.number().nonnegative().optional().default(0),
  descuentoPorcentaje: z.number().min(0).max(100).optional().default(0),
  tipoContrato: z.enum(['campaña', 'evento', 'anual', 'canje']).optional().default('campaña'),
  medio: z.enum(['fm', 'digital', 'hibrido']).optional().default('fm'),
  ejecutivoId: z.string().uuid('UUID inválido').optional(),
  propiedadesSeleccionadas: z.array(z.object({ tipoCodigo: z.string(), valorCodigoRef: z.string() })).optional().default([])
}).refine(data => data.anuncianteId || data.agenciaId, {
  message: 'Debe especificar al menos un anunciante o una agencia',
  path: ['anuncianteId'],
})

const listContratoQuerySchema = z.object({
  search: z.string().optional().default(''),
  estado: z.string().optional(),
  tipo: z.string().optional(),
  contratoId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict()

// Pipeline metric shape returned by repo.getPipelineData
interface PipelineMetric {
  estado: string
  cantidad: number
  valor: number
}

// ─── GET /api/contratos ──────────────────────────────────────────────────────

export const GET = withApiRoute(
  { resource: 'contratos', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    const tenantId = ctx.tenantId
    const userId = ctx.userId
    try {
      const { searchParams } = new URL(req.url)

      // Zod validation for query parameters
      const queryValidation = listContratoQuerySchema.safeParse({
        search: searchParams.get('search') ?? undefined,
        estado: searchParams.get('estado') ?? undefined,
        tipo: searchParams.get('tipo') ?? undefined,
        contratoId: searchParams.get('contratoId') ?? undefined,
        page: searchParams.get('page') ?? undefined,
        limit: searchParams.get('limit') ?? undefined,
      })

      if (!queryValidation.success) {
        return apiError(
          'VALIDATION_ERROR',
          'Parámetros de consulta inválidos',
          400,
          queryValidation.error.flatten().fieldErrors
        ) as unknown as NextResponse
      }

      const validatedQuery = queryValidation.data

      const cr = {
        busquedaTexto: validatedQuery.search,
        estados: validatedQuery.estado ? [validatedQuery.estado] : undefined,
        anuncianteId: searchParams.get('anuncianteId') || undefined,
        pagina: validatedQuery.page,
        tamanoPagina: validatedQuery.limit,
      }

      const repo = new DrizzleContratoRepository(tenantId)
      const data = await repo.search(cr)

      // Transformar para el formato esperado por el frontend
      const contratosFrontend = data.contratos.map(c => {
        const snap = c.toSnapshot()
        return {
          id: snap.id,
          numeroContrato: snap.numero.valor,
          titulo: snap.producto,
          clienteNombre: snap.anunciante,
          tipoContrato: snap.tipoContrato,
          medio: snap.medio,
          fechaInicio: snap.fechaInicio,
          fechaFin: snap.fechaFin,
          valorTotalNeto: snap.totales.valorNeto,
          moneda: snap.moneda,
          estado: snap.estado.valor,
          porcentajeEjecutado: snap.progreso,
          ejecutivoNombre: snap.ejecutivo || 'Sin Asignar',
          fechaCreacion: snap.fechaCreacion,
        }
      })

      // Estadísticas rápidas
      const metrics = await repo.getPipelineData({}) as PipelineMetric[]
      let totalValue = 0
      let activos = 0
      let completados = 0

      metrics.forEach(m => {
        totalValue += m.valor
        if (m.estado === 'activo' || m.estado === 'aprobado' || m.estado === 'firmado') activos += m.cantidad
        if (m.estado === 'completado' || m.estado === 'finalizado') completados += m.cantidad
      })

      const stats = {
        total: data.total,
        activos,
        completados,
        valorTotal: totalValue,
      }

      // Audit logging for successful read
      auditLogger.log({
        type: AuditEventType.DATA_ACCESS,
        userId,
        metadata: {
          module: 'contratos',
          accion: 'listar',
          tenantId,
          resultado: {
            total: data.total,
            pagina: data.pagina,
            tamanoPagina: data.tamanoPagina,
            filtros: {
              search: validatedQuery.search,
              estado: validatedQuery.estado,
              tipo: validatedQuery.tipo,
            }
          }
        }
      })

      return apiSuccess(contratosFrontend, 200, {
        stats,
        pagination: {
          total: data.total,
          page: data.pagina,
          limit: data.tamanoPagina,
          totalPages: data.totalPaginas,
          hasNextPage: data.pagina < data.totalPaginas,
          hasPreviousPage: data.pagina > 1,
        },
      }) as unknown as NextResponse
    } catch (error) {
      logger.error('Error in contratos GET', error instanceof Error ? error : undefined, { module: 'contratos', action: 'GET' })

      // Log de auditoría para errores
      auditLogger.log({
        type: AuditEventType.API_ERROR,
        userId: ctx.userId,
        metadata: {
          module: 'contratos',
          accion: 'listar',
          tenantId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      return apiServerError() as unknown as NextResponse
    }
  }
)

// ─── POST /api/contratos ─────────────────────────────────────────────────────

export const POST = withApiRoute(
  { resource: 'contratos', action: 'create' },
  async ({ ctx, req }) => {
    const tenantId = ctx.tenantId
    const userId = ctx.userId
    try {
      let rawBody: unknown
      try {
        rawBody = await req.json()
      } catch {
        return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse
      }

      const parseResult = createContratoSchema.safeParse(rawBody)

      if (!parseResult.success) {
        return apiError(
          'VALIDATION_ERROR',
          'Error en la validación de los datos',
          400,
          parseResult.error.flatten().fieldErrors
        ) as unknown as NextResponse
      }

      const body = parseResult.data

      const valorNeto = body.valorTotalBruto * (1 - body.descuentoPorcentaje / 100)

      // DDD Cross-module property validation
      if (body.propiedadesSeleccionadas && body.propiedadesSeleccionadas.length > 0) {
        const propiedadesAPI = new PropiedadesIntegrationAPI(
          new TipoPropiedadDrizzleRepository(tenantId),
          new ValorPropiedadDrizzleRepository(tenantId)
        )
        const validacion = await propiedadesAPI.validarCoherenciaPropiedades(body.propiedadesSeleccionadas)
        if (!validacion.isSuccess) {
          return apiError(
            'VALIDATION_ERROR',
            `Contrato Rechazado: ${validacion.error?.message || 'Error de coherencia en propiedades.'}`,
            400
          ) as unknown as NextResponse
        }
      }

      const repo = new DrizzleContratoRepository(tenantId)

      // NumeroContrato.generate() uses internal sequence — no static create(year, num) exists
      const numeroC = NumeroContrato.generate()
      const totales = TotalesContrato.create(body.valorTotalBruto, valorNeto)
      const riesgoCredito = RiesgoCredito.create(50)
      const metricas = MetricasRentabilidad.create({ margenBruto: 30, roi: 20, valorVida: valorNeto * 1.5, costoAdquisicion: 0 })

      // Map front-end tipoContrato values to the domain enum ('A' | 'B' | 'C')
      const tipoMap: Record<string, 'A' | 'B' | 'C'> = {
        campaña: 'A',
        evento: 'B',
        anual: 'A',
        canje: 'C',
      }
      const tipoContratoDomain = tipoMap[body.tipoContrato] ?? 'A'

      const contratoDomain = Contrato.create({
        numero: numeroC,
        anuncianteId: body.anuncianteId || '',
        anunciante: 'Validado por Creador',
        rutAnunciante: '',
        producto: body.titulo,
        agenciaId: body.agenciaId || '',
        agencia: '',
        ejecutivoId: body.ejecutivoId || userId,
        ejecutivo: '',
        totales,
        moneda: 'CLP',
        fechaInicio: new Date(body.fechaInicio),
        fechaFin: new Date(body.fechaFin),
        prioridad: 'media',
        tipoContrato: tipoContratoDomain,
        medio: body.medio,
        terminosPago: TerminosPago.create(30),
        modalidadFacturacion: 'cuotas',
        tipoFactura: 'posterior',
        esCanje: body.tipoContrato === 'canje',
        facturarComisionAgencia: false,
        riesgoCredito,
        metricas,
        creadoPor: userId,
        estado: EstadoContrato.borrador(),
        etapaActual: 'creacion',
        progreso: 0,
        proximaAccion: 'revision',
        responsableActual: userId,
        fechaLimiteAccion: new Date(body.fechaFin),
        alertas: [],
        tags: [],
        actualizadoPor: userId,
      })

      await repo.save(contratoDomain)

      auditLogger.log({
        type: AuditEventType.DATA_CREATE,
        userId,
        metadata: { module: 'contratos', contratoId: contratoDomain.id.toString(), num: numeroC.valor, tenantId },
      })

      const snap = contratoDomain.toSnapshot()

      const newContrato = {
        id: snap.id,
        numeroContrato: snap.numero.valor,
        titulo: snap.producto,
        clienteNombre: snap.anunciante,
        tipoContrato: snap.tipoContrato,
        medio: snap.medio,
        fechaInicio: snap.fechaInicio,
        fechaFin: snap.fechaFin,
        valorTotalNeto: snap.totales.valorNeto,
        moneda: snap.moneda,
        estado: snap.estado.valor,
        porcentajeEjecutado: snap.progreso,
        ejecutivoNombre: snap.ejecutivo,
        propiedadesAsignadas: body.propiedadesSeleccionadas,
        fechaCreacion: snap.fechaCreacion,
      }

      return apiSuccess(newContrato, 201, { message: 'Contrato creado exitosamente' }) as unknown as NextResponse
    } catch (error) {
      logger.error('Error in contratos POST', error instanceof Error ? error : undefined, { module: 'contratos', action: 'POST' })

      // Log de auditoría para errores
      auditLogger.log({
        type: AuditEventType.API_ERROR,
        userId,
        metadata: {
          module: 'contratos',
          accion: 'crear',
          tenantId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      return apiServerError() as unknown as NextResponse
    }
  }
)
