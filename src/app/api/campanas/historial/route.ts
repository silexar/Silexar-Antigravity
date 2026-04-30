/**
 * GET  /api/campanas/historial  — Operation history (undo/redo log)
 * POST /api/campanas/historial  — Register an operation
 * 
 * Security: withApiRoute enforces JWT auth, RBAC, rate limiting, CSRF, and audit logging.
 */

import { z } from 'zod'
import { and, desc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { apiSuccess, apiError, apiServerError, apiNotFound } from '@/lib/api/response'
import { withApiRoute } from '@/lib/api/with-api-route'
import { isDatabaseConnected } from '@/lib/db'
import { historialOperaciones } from '@/lib/db/schema'
import { getDB } from '@/lib/db'
import { logger } from '@/lib/observability'
import { auditLogger } from '@/lib/security/audit-logger'
import { AuditEventType } from '@/lib/security/audit-types'

// ─── Validation ─────────────────────────────────────────────────────────────

const querySchema = z.object({
  campanaId: z.string().uuid().optional(),
  limite: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

const createSchema = z.object({
  tipoOperacion: z.string().min(1, 'El tipo de operación es requerido').max(50),
  descripcion: z.string().min(1, 'La descripción es requerida').max(500),
  entidadTipo: z.string().min(1, 'El tipo de entidad es requerido').max(50),
  entidadId: z.string().uuid('El ID de entidad debe ser un UUID válido'),
  campanaId: z.string().uuid().optional(),
  datosAnteriores: z.record(z.string(), z.unknown()).optional(),
  datosNuevos: z.record(z.string(), z.unknown()).optional(),
  revertible: z.boolean().default(true),
})

// ─── GET /api/campanas/historial ─────────────────────────────────────────────────

export const GET = withApiRoute(
  { resource: 'campanas', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    const tenantId = ctx.tenantId
    const userId = ctx.userId

    try {
      const { searchParams } = new URL(req.url)
      const query = querySchema.safeParse({
        campanaId: searchParams.get('campanaId') || undefined,
        limite: searchParams.get('limite') || 50,
        offset: searchParams.get('offset') || 0,
      })

      if (!query.success) {
        return apiError(
          'VALIDATION_ERROR',
          'Parámetros de consulta inválidos',
          400,
          query.error.flatten().fieldErrors
        ) as unknown as NextResponse
      }

      if (!isDatabaseConnected()) {
        return apiSuccess([], 200, { source: 'no_database' }) as unknown as NextResponse
      }

      const conditions = [eq(historialOperaciones.tenantId, tenantId)]
      if (query.data.campanaId) {
        conditions.push(eq(historialOperaciones.campanaId, query.data.campanaId))
      }

      const rows = await getDB()
        .select()
        .from(historialOperaciones)
        .where(and(...conditions))
        .orderBy(desc(historialOperaciones.fechaOperacion))
        .limit(query.data.limite)
        .offset(query.data.offset)

      // Log de auditoría para lectura de historial
      auditLogger.log({
        type: AuditEventType.DATA_READ,
        userId,
        metadata: {
          resource: 'campanas',
          resourceId: 'historial',
          tenantId,
          campanaId: query.data.campanaId || 'todos',
          registrosLeidos: rows.length
        }
      })

      return apiSuccess(rows, 200) as unknown as NextResponse

    } catch (error) {
      logger.error('Error in campanas historial GET', error instanceof Error ? error : undefined, {
        module: 'campanas',
        action: 'historial_GET',
        tenantId
      })

      // Log de auditoría para fallo
      auditLogger.log({
        type: AuditEventType.API_ERROR,
        userId,
        metadata: {
          module: 'campanas',
          accion: 'historial',
          tenantId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      return apiServerError() as unknown as NextResponse
    }
  }
)

// ─── POST /api/campanas/historial ───────────────────────────────────────────────

export const POST = withApiRoute(
  { resource: 'campanas', action: 'create' },
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

      const parsed = createSchema.safeParse(rawBody)
      if (!parsed.success) {
        return apiError(
          'VALIDATION_ERROR',
          'Error en la validación de los datos',
          400,
          parsed.error.flatten().fieldErrors
        ) as unknown as NextResponse
      }

      if (!isDatabaseConnected()) {
        return apiError('SERVICE_UNAVAILABLE', 'Database not connected', 503) as unknown as NextResponse
      }

      const [nueva] = await getDB()
        .insert(historialOperaciones)
        .values({
          tenantId,
          usuarioId: userId,
          tipoOperacion: parsed.data.tipoOperacion,
          descripcion: parsed.data.descripcion,
          entidadTipo: parsed.data.entidadTipo,
          entidadId: parsed.data.entidadId,
          campanaId: parsed.data.campanaId,
          datosAnteriores: parsed.data.datosAnteriores ?? null,
          datosNuevos: parsed.data.datosNuevos ?? null,
          revertible: parsed.data.revertible,
          revertido: false,
        })
        .returning()

      // Log de auditoría para creación de registro de historial
      auditLogger.log({
        type: AuditEventType.DATA_CREATE,
        userId,
        metadata: {
          module: 'campanas',
          accion: 'crear_historial',
          tenantId,
          entidadTipo: parsed.data.entidadTipo,
          entidadId: parsed.data.entidadId,
          campanaId: parsed.data.campanaId
        }
      })

      return apiSuccess(nueva, 201, { message: 'Registro de historial creado' }) as unknown as NextResponse

    } catch (error) {
      logger.error('Error in campanas historial POST', error instanceof Error ? error : undefined, {
        module: 'campanas',
        action: 'historial_POST',
        tenantId
      })

      // Log de auditoría para fallo
      auditLogger.log({
        type: AuditEventType.API_ERROR,
        userId,
        metadata: {
          module: 'campanas',
          accion: 'crear_historial',
          tenantId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      return apiServerError() as unknown as NextResponse
    }
  }
)
