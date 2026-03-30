/**
 * GET  /api/campanas/historial  — Operation history (undo/redo log)
 * POST /api/campanas/historial  — Register an operation
 */

import { z } from 'zod'
import { and, desc, eq } from 'drizzle-orm'
import { apiSuccess, apiError, apiValidationError, getUserContext, apiForbidden} from '@/lib/api/response'
import { secureHandler } from '@/lib/api/secure-handler'
import { isDatabaseConnected } from '@/lib/db'
import { historialOperaciones } from '@/lib/db/materiales-schema'
import { checkPermission } from '@/lib/security/rbac';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

// ─── Validation ─────────────────────────────────────────────

const querySchema = z.object({
  campanaId: z.string().uuid().optional(),
  limite:    z.coerce.number().int().min(1).max(200).default(50),
  offset:    z.coerce.number().int().min(0).default(0),
})

const createSchema = z.object({
  tipoOperacion:   z.string().min(1).max(50),
  descripcion:     z.string().min(1).max(500),
  entidadTipo:     z.string().min(1).max(50),
  entidadId:       z.string().uuid(),
  campanaId:       z.string().uuid().optional(),
  datosAnteriores: z.record(z.string(), z.unknown()).optional(),
  datosNuevos:     z.record(z.string(), z.unknown()).optional(),
  revertible:      z.boolean().default(true),
})

// ─── GET ─────────────────────────────────────────────────────

export const GET = secureHandler(
  { resource: 'campanas', action: 'read' },
  async (request, { user, db }) => {
    const { searchParams } = new URL(request.url)
    const query = querySchema.safeParse({
      campanaId: searchParams.get('campanaId') || undefined,
      limite:    searchParams.get('limite') || 50,
      offset:    searchParams.get('offset') || 0,
    })
    if (!query.success) return apiValidationError(query.error.issues)

    if (!isDatabaseConnected()) {
      return apiSuccess([], 200, { source: 'no_database' })
    }

    const conditions = [eq(historialOperaciones.tenantId, user.tenantId)]
    if (query.data.campanaId) {
      conditions.push(eq(historialOperaciones.campanaId, query.data.campanaId))
    }

    const rows = await db
      .select()
      .from(historialOperaciones)
      .where(and(...conditions))
      .orderBy(desc(historialOperaciones.fechaOperacion))
      .limit(query.data.limite)
      .offset(query.data.offset)

    return apiSuccess(rows)
  }
)

// ─── POST ─────────────────────────────────────────────────────

export const POST = secureHandler(
  { resource: 'campanas', action: 'update' },
  async (request, { user, db }) => {
    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return apiValidationError(parsed.error.issues)

    if (!isDatabaseConnected()) {
      return apiError('SERVICE_UNAVAILABLE', 'Database not connected', 503)
    }

    const [nueva] = await db
      .insert(historialOperaciones)
      .values({
        tenantId:        user.tenantId,
        usuarioId:       user.userId,
        tipoOperacion:   parsed.data.tipoOperacion,
        descripcion:     parsed.data.descripcion,
        entidadTipo:     parsed.data.entidadTipo,
        entidadId:       parsed.data.entidadId,
        campanaId:       parsed.data.campanaId,
        datosAnteriores: parsed.data.datosAnteriores ?? null,
        datosNuevos:     parsed.data.datosNuevos ?? null,
        revertible:      parsed.data.revertible,
        revertido:       false,
      })
      .returning()

    return apiSuccess(nueva, 201)
  }
)
