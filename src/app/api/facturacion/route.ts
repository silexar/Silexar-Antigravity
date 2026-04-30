/**
 * GET /api/facturacion  — Listar facturas
 * POST /api/facturacion — Crear factura
 *
 * Uses facturacion DDD module (Tier Core).
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { eq, and, desc, count, sql } from 'drizzle-orm'
import { withApiRoute } from '@/lib/api/with-api-route'
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response'
import { logger } from '@/lib/observability'
import { auditLogger, AuditEventType, AuditSeverity } from '@/lib/security/audit-logger'
import { withTenantContext } from '@/lib/db/tenant-context'
import { getDB } from '@/lib/db'
import { facturas } from '@/lib/db/schema'

import { FacturaDrizzleRepository } from '@/modules/facturacion/infrastructure/repositories/FacturaDrizzleRepository'
import { BuscarFacturasHandler } from '@/modules/facturacion/application/handlers/BuscarFacturasHandler'
import { BuscarFacturasQuery } from '@/modules/facturacion/application/queries/BuscarFacturasQuery'
import { CrearFacturaHandler } from '@/modules/facturacion/application/handlers/CrearFacturaHandler'
import { CrearFacturaCommand } from '@/modules/facturacion/application/commands/CrearFacturaCommand'

const repository = new FacturaDrizzleRepository();
const buscarHandler = new BuscarFacturasHandler(repository);
const crearHandler = new CrearFacturaHandler(repository);

const createFacturaSchema = z.object({
  anuncianteId: z.string().uuid().optional(),
  agenciaId: z.string().uuid().optional(),
  receptorRut: z.string().min(1).max(12),
  receptorRazonSocial: z.string().min(1).max(255),
  receptorGiro: z.string().max(200).optional(),
  receptorDireccion: z.string().max(500).optional(),
  receptorCiudad: z.string().max(100).optional(),
  receptorComuna: z.string().max(100).optional(),
  fechaEmision: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fechaVencimientos: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  montoNeto: z.number().positive(),
  montoExento: z.number().min(0).default(0),
  tasaIva: z.number().min(0).max(100).default(19),
  formaPago: z.enum(['contado', 'credito_30', 'credito_45', 'credito_60', 'credito_90']).default('credito_30'),
  observaciones: z.string().optional(),
})

export const GET = withApiRoute(
  { resource: 'facturacion', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const { searchParams } = new URL(req.url)
      const search = searchParams.get('search') || ''
      const estado = searchParams.get('estado') || ''
      const tipoDocumento = searchParams.get('tipo') || ''
      const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
      const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '20', 10)), 100)

      const query = new BuscarFacturasQuery({
        tenantId: ctx.tenantId,
        search: search || undefined,
        estado: (estado as any) || undefined,
        tipoDocumento: (tipoDocumento as any) || undefined,
        page,
        limit,
      })

      const [result, stats] = await Promise.all([
        buscarHandler.execute(query),
        withTenantContext(ctx.tenantId, async () => {
          const db = getDB()
          const facturasActivas = await db
            .select({ montoTotal: facturas.montoTotal, estado: facturas.estado, saldoPendiente: facturas.saldoPendiente })
            .from(facturas)
            .where(and(eq(facturas.tenantId, ctx.tenantId), eq(facturas.anulada, false), eq(facturas.tipoDocumento, 'factura_electronica')))
          return {
            totalFacturas: facturasActivas.length,
            montoEmitido: facturasActivas.reduce((sum, f) => sum + Number(f.montoTotal), 0),
            montoPendiente: facturasActivas.filter(f => f.estado !== 'pagada').reduce((sum, f) => sum + Number(f.saldoPendiente || f.montoTotal), 0),
            vencidas: facturasActivas.filter(f => f.estado === 'vencida').length,
          }
        }),
      ])

      if (!result.ok) {
        return apiError('SERVER_ERROR', result.error.message, 500) as unknown as NextResponse
      }

      return apiSuccess(result.data.data.map((f: any) => f.toJSON()), 200, {
        stats,
        pagination: {
          total: result.data.total,
          page: result.data.page,
          limit: result.data.limit,
          totalPages: result.data.totalPages,
          hasNextPage: result.data.page < result.data.totalPages,
          hasPreviousPage: result.data.page > 1,
        },
      }) as unknown as NextResponse
    } catch (error) {
      logger.error('Error in facturacion GET', error instanceof Error ? error : undefined, { module: 'facturacion' })

      auditLogger.log({
        type: AuditEventType.ACCESS_DENIED,
        message: 'Error al obtener facturas',
        userId: ctx.userId,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          module: 'facturacion',
          resource: 'facturacion',
          action: 'read',
          success: false
        }
      })

      return apiServerError() as unknown as NextResponse
    }
  }
)

export const POST = withApiRoute(
  { resource: 'facturacion', action: 'create' },
  async ({ ctx, req }) => {
    try {
      let body: unknown
      try {
        body = await req.json()
      } catch {
        return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse
      }

      const parsed = createFacturaSchema.safeParse(body)
      if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Error en validación', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse
      }

      const command = new CrearFacturaCommand({
        tenantId: ctx.tenantId,
        creadoPorId: ctx.userId,
        ...parsed.data,
      })

      const result = await crearHandler.execute(command)
      if (!result.ok) {
        return apiError('SERVER_ERROR', result.error.message, 500) as unknown as NextResponse
      }

      auditLogger.log({
        type: AuditEventType.DATA_CREATE,
        message: 'Factura creada exitosamente',
        userId: ctx.userId,
        metadata: {
          facturaId: result.data.id,
          module: 'facturacion',
          resource: 'facturacion',
          action: 'create',
          success: true
        }
      })

      return apiSuccess(result.data.toJSON(), 201, { message: 'Factura creada exitosamente' }) as unknown as NextResponse
    } catch (error) {
      logger.error('Error in facturacion POST', error instanceof Error ? error : undefined, { module: 'facturacion' })

      auditLogger.log({
        type: AuditEventType.ACCESS_DENIED,
        message: 'Error al crear factura',
        userId: ctx.userId,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          module: 'facturacion',
          resource: 'facturacion',
          action: 'create',
          success: false
        }
      })

      return apiServerError() as unknown as NextResponse
    }
  }
)
