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
import { MockTipoPropiedadRepository, MockValorPropiedadRepository } from '../../../modules/propiedades/infrastructure/repositories/MockPropiedadRepository'
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
  ejecutivoId: z.string().uuid('UUID inválido').optional(),
  propiedadesSeleccionadas: z.array(z.object({ tipoCodigo: z.string(), valorCodigoRef: z.string() })).optional().default([])
}).refine(data => data.anuncianteId || data.agenciaId, {
  message: 'Debe especificar al menos un anunciante o una agencia',
  path: ['anuncianteId'],
})

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
    try {
      const { searchParams } = new URL(req.url)

      const cr = {
        busquedaTexto: searchParams.get('search') || '',
        estados: searchParams.get('estado') ? [searchParams.get('estado')] : undefined,
        anuncianteId: searchParams.get('anuncianteId') || undefined,
        pagina: parseInt(searchParams.get('page') || '1', 10),
        tamanoPagina: Math.min(parseInt(searchParams.get('limit') || '20', 10), 100),
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
          new MockTipoPropiedadRepository(),
          new MockValorPropiedadRepository()
        )
        const validacion = await propiedadesAPI.validarCoherenciaPropiedades(body.propiedadesSeleccionadas)
        if (validacion.isFailure) {
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      return apiServerError() as unknown as NextResponse
    }
  }
)
