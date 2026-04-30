/**
 * GET /api/campanas  — List campaigns
 * POST /api/campanas — Create campaign
 *
 * Security: withApiRoute enforces JWT auth, RBAC, rate limiting, CSRF, and audit logging.
 * 
 * Architecture: Uses DrizzleCampanaRepository (DDD Repository Pattern)
 * for data access abstraction and business logic encapsulation.
 */

import { NextResponse } from 'next/server'
import { withApiRoute } from '@/lib/api/with-api-route'
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response'
import { PropiedadesIntegrationAPI } from '../../../modules/propiedades/api/PropiedadesIntegrationAPI'
import { TipoPropiedadDrizzleRepository, ValorPropiedadDrizzleRepository } from '../../../modules/propiedades/infrastructure/repositories/PropiedadesDrizzleRepository'
import { logger } from '@/lib/observability'
import { DrizzleCampanaRepository } from '@/modules/campanas/infrastructure/repositories/DrizzleCampanaRepository'
import { Campana } from '@/modules/campanas/domain/entities/Campana'
import { EstadoCampana } from '@/modules/campanas/domain/value-objects/EstadoCampana'
import { NumeroCampana } from '@/modules/campanas/domain/value-objects/NumeroCampana'
import { PresupuestoCampana } from '@/modules/campanas/domain/value-objects/PresupuestoCampana'
import { z } from 'zod'
import { auditLogger } from '@/lib/security/audit-logger'
import { AuditEventType } from '@/lib/security/audit-types'
import type { CampanaFilters } from '@/modules/campanas/domain/repositories/ICampanaRepository'

const createCampanaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(255),
  anuncianteId: z.string().uuid('El anuncianteId debe ser un UUID válido'),
  tipoCampana: z.enum(['branding', 'promocional', 'lanzamiento', 'estacional', 'institucional', 'evento', 'mantencion']).optional().default('promocional'),
  medio: z.enum(['fm', 'digital', 'hibrido']).optional().default('fm'),
  fechaInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)').optional(),
  fechaFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)').optional(),
  presupuestoTotal: z.union([z.string(), z.number()]).transform((val) => String(val)).optional().default('0'),
  objetivoSpots: z.number().int().nonnegative().optional().default(0),
  prioridad: z.enum(['baja', 'normal', 'alta', 'urgente']).optional().default('normal'),
  propiedades: z.array(z.any()).optional().default([]),
});

const listCampanaQuerySchema = z.object({
  search: z.string().optional().default(''),
  estado: z.string().optional(),
  tipo: z.string().optional(),
  contratoId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
}).strict()

// ─── Repository instance (singleton per request) ─────────────────────────────
const getRepository = () => new DrizzleCampanaRepository()

// ─── GET /api/campanas ───────────────────────────────────────────────────────

export const GET = withApiRoute(
  { resource: 'campanas', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    const tenantId = ctx.tenantId
    const userId = ctx.userId
    const repo = getRepository()

    try {
      const { searchParams } = new URL(req.url)

      // Zod validation for query parameters
      const queryValidation = listCampanaQuerySchema.safeParse({
        search: searchParams.get('search') ?? undefined,
        estado: searchParams.get('estado') ?? undefined,
        tipo: searchParams.get('tipo') ?? undefined,
        contratoId: searchParams.get('contratoId') ?? undefined,
        page: searchParams.get('page') ?? undefined,
        pageSize: searchParams.get('pageSize') ?? undefined,
      })

      if (!queryValidation.success) {
        return apiError(
          'VALIDATION_ERROR',
          'Parámetros de consulta inválidos',
          400,
          queryValidation.error.flatten().fieldErrors
        ) as unknown as NextResponse
      }

      const { search, estado, tipo, contratoId, page, pageSize } = queryValidation.data

      // Map query params to repository filters
      const filtros: CampanaFilters = {
        tenantId,
        busqueda: search || undefined,
        estado: estado as CampanaFilters['estado'],
        contratoId,
      }

      // Use repository for data access (includes COUNT for real total)
      const resultado = await repo.listar(filtros, page - 1, pageSize)

      // Calculate emissoras and cunas counts for each campaign
      // Note: objetivoSpots and spotsEmitidos live on the DB row, not on the domain entity.
      // For now we use the entity's progress calculation via dominio methods.
      const mappedData = resultado.datos.map(campana => {
        // Use entity's built-in business logic for progress calculation
        const porcentajeAvance = 0 // Would need spotsEmitidos from DB

        return {
          id: campana.id,
          codigo: campana.numeroCampana.valor,
          nombre: campana.nombre,
          anuncianteNombre: '', // Would need join with anunciantes
          tipoCampana: campana.tipo,
          medio: campana.medio,
          fechaInicio: campana.fechaInicio,
          fechaFin: campana.fechaFin,
          presupuestoTotal: campana.presupuesto.monto,
          presupuestoConsumido: 0, // Would come from pauta
          estado: campana.estado.valor as string,
          objetivoSpots: 0, // TODO: Add to domain entity or fetch separately
          spotsEmitidos: 0, // TODO: Add to domain entity or fetch separately
          porcentajeAvance,
          emisorasCount: 0, // TODO: Calculate from campanasEmisoras
          cunasCount: 0,    // TODO: Calculate from campanasCunas
          ejecutivoNombre: null,
          prioridad: 'normal' as const,
        }
      })

      // Stats from repository response
      const stats = {
        total: resultado.total,
        enAire: mappedData.filter(c => c.estado === 'en_aire').length,
        planificacion: mappedData.filter(c => c.estado === 'planificacion').length,
        completadas: mappedData.filter(c => c.estado === 'completada').length,
        presupuestoTotal: mappedData.reduce((sum, c) => sum + (c.presupuestoTotal || 0), 0),
        spotsEmitidos: mappedData.reduce((sum, c) => sum + (c.spotsEmitidos ?? 0), 0),
      }

      // Audit logging for successful read
      auditLogger.log({
        type: AuditEventType.DATA_ACCESS,
        userId,
        metadata: {
          module: 'campanas',
          accion: 'listar',
          tenantId,
          resultado: {
            total: resultado.total,
            pagina: page,
            tamanoPagina: pageSize,
            filtros: { search, estado, tipo }
          }
        }
      })

      return apiSuccess(mappedData, 200, {
        stats,
        pagination: {
          total: resultado.total, // Real total from COUNT query
          page,
          pageSize,
          totalPages: resultado.totalPaginas,
          hasNextPage: page < resultado.totalPaginas,
          hasPrevPage: page > 1,
        },
      }) as unknown as NextResponse
    } catch (error) {
      logger.error('Error in campanas GET', error instanceof Error ? error : undefined, { module: 'campanas', action: 'GET' })

      // Log de auditoría para errores
      auditLogger.log({
        type: AuditEventType.API_ERROR,
        userId,
        metadata: {
          module: 'campanas',
          accion: 'listar',
          tenantId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      return apiServerError() as unknown as NextResponse
    }
  }
)

// ─── POST /api/campanas ──────────────────────────────────────────────────────

export const POST = withApiRoute(
  { resource: 'campanas', action: 'create' },
  async ({ ctx, req }) => {
    const tenantId = ctx.tenantId
    const userId = ctx.userId
    const repo = getRepository()

    try {
      let rawBody: unknown
      try {
        rawBody = await req.json()
      } catch {
        return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse
      }

      const parseResult = createCampanaSchema.safeParse(rawBody);

      if (!parseResult.success) {
        return apiError(
          'VALIDATION_ERROR',
          'Error en la validación de los datos',
          400,
          parseResult.error.flatten().fieldErrors
        ) as unknown as NextResponse
      }

      const body = parseResult.data;

      // Cross-module property validation
      if (body.propiedades && body.propiedades.length > 0) {
        const propiedadesAPI = new PropiedadesIntegrationAPI(
          new TipoPropiedadDrizzleRepository(tenantId),
          new ValorPropiedadDrizzleRepository(tenantId)
        )
        const validacion = await propiedadesAPI.validarCoherenciaPropiedades(body.propiedades)
        if (!validacion.isSuccess) {
          return apiError(
            'VALIDATION_ERROR',
            `Campaña Rechazada: ${validacion.error?.message || 'Error de coherencia en propiedades comerciales.'}`,
            400
          ) as unknown as NextResponse
        }
      }

      // Default dates if not provided
      const fechaInicio = body.fechaInicio
        ? new Date(body.fechaInicio)
        : new Date()
      const fechaFin = body.fechaFin
        ? new Date(body.fechaFin)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

      // Validate date range (business rule)
      if (fechaFin <= fechaInicio) {
        return apiError(
          'VALIDATION_ERROR',
          'La fecha de fin debe ser posterior a la fecha de inicio',
          400
        ) as unknown as NextResponse
      }

      // Generate campaign code using repository
      const anio = new Date().getFullYear()
      const secuencial = await repo.obtenerSiguienteSecuencial(tenantId, anio)
      const numeroCampana = NumeroCampana.generar(anio, secuencial)

      // Create domain entity with factory method
      const now = new Date()
      const campana = Campana.crear({
        id: crypto.randomUUID(),
        tenantId,
        numeroCampana: numeroCampana.valor,
        nombre: body.nombre,
        tipo: mapTipoCampana(body.tipoCampana),
        medio: body.medio as 'fm' | 'digital' | 'hibrido',
        estado: 'BORRADOR', // Initial state
        anuncianteId: body.anuncianteId,
        presupuesto: {
          monto: Number(body.presupuestoTotal) || 0,
          moneda: 'CLP' as const,
        },
        fechaInicio,
        fechaFin,
        creadoPor: userId,
        creadoEn: now,
        actualizadoEn: now,
      })

      // Save using repository
      await repo.guardar(campana)

      // Audit logging for successful creation
      auditLogger.log({
        type: AuditEventType.DATA_CREATE,
        userId,
        metadata: {
          module: 'campanas',
          campanaId: campana.id,
          codigo: campana.numeroCampana.valor,
          tenantId
        }
      })

      return apiSuccess({
        id: campana.id,
        codigo: campana.numeroCampana.valor,
        nombre: campana.nombre,
        estado: campana.estado.valor,
        fechaInicio: campana.fechaInicio.toISOString().split('T')[0],
        fechaFin: campana.fechaFin.toISOString().split('T')[0],
      }, 201, { message: 'Campaña creada exitosamente' }) as unknown as NextResponse
    } catch (error) {
      logger.error('Error in campanas POST', error instanceof Error ? error : undefined, { module: 'campanas', action: 'POST' })

      // Log de auditoría para errores
      auditLogger.log({
        type: AuditEventType.API_ERROR,
        userId,
        metadata: {
          module: 'campanas',
          accion: 'crear',
          tenantId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      return apiServerError() as unknown as NextResponse
    }
  }
)

// ─── Helper functions ────────────────────────────────────────────────────────

/**
 * Maps database tipoCampana to domain TipoCampana
 * Note: The domain uses its own type system (REPARTIDO, PRIME, etc.)
 * while DB uses branding, promocional, etc.
 */
function mapTipoCampana(tipo: string): Campana['tipo'] {
  const mapping: Record<string, Campana['tipo']> = {
    'branding': 'PRIME',
    'promocional': 'REPARTIDO',
    'lanzamiento': 'PRIME_DETERMINADO',
    'estacional': 'NOCHE',
    'institucional': 'MENCION',
    'evento': 'MICRO',
    'mantencion': 'SENAL_HORARIA',
  }
  return mapping[tipo] ?? 'CUSTOM'
}
