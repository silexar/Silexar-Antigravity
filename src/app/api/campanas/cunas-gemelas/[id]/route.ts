/**
 * PATCH  /api/campanas/cunas-gemelas/[id]  — Update twin-spot link
 * DELETE /api/campanas/cunas-gemelas/[id]  — Soft-delete twin-spot link
 */

import { NextRequest } from 'next/server'
import { logger } from '@/lib/observability';
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { getUserContext, apiSuccess, apiError, apiServerError, apiValidationError, apiForbidden} from '@/lib/api/response'
import { isDatabaseConnected, getDB } from '@/lib/db'
import { cunasGemelas } from '@/lib/db/materiales-schema'
import { checkPermission } from '@/lib/security/rbac';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

// ─── Validation ─────────────────────────────────────────────

const patchSchema = z.object({
  posicion:         z.enum(['antes', 'despues']).optional(),
  separacionMaxima: z.number().int().min(0).max(999).optional(),
  mismoBloque:      z.boolean().optional(),
}).strict()

// ─── PATCH ───────────────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = getUserContext(request)
    if (!ctx) return apiError('UNAUTHORIZED', 'Autenticación requerida', 401)

    const { id } = await params
    if (!id) return apiError('BAD_REQUEST', 'ID requerido', 400)

    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) return apiValidationError(parsed.error.issues)

    if (Object.keys(parsed.data).length === 0) {
      return apiError('BAD_REQUEST', 'Se debe enviar al menos un campo a actualizar', 400)
    }

    const db = getDB()
    if (!isDatabaseConnected() || !db) {
      return apiError('SERVICE_UNAVAILABLE', 'Database not connected', 503)
    }

    const [updated] = await db
      .update(cunasGemelas)
      .set(parsed.data)
      .where(
        and(
          eq(cunasGemelas.id, id),
          eq(cunasGemelas.tenantId, ctx.tenantId),
          eq(cunasGemelas.activo, true),
        )
      )
      .returning()

    if (!updated) {
      return apiError('NOT_FOUND', 'Vínculo gemela no encontrado', 404)
    }

    return apiSuccess(updated)
  } catch (error) {
    return apiServerError(error instanceof Error ? error.message : undefined)
  }
}

// ─── DELETE (soft) ───────────────────────────────────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = getUserContext(request)
    if (!ctx) return apiError('UNAUTHORIZED', 'Autenticación requerida', 401)

    const { id } = await params
    if (!id) return apiError('BAD_REQUEST', 'ID requerido', 400)

    const db = getDB()
    if (!isDatabaseConnected() || !db) {
      return apiError('SERVICE_UNAVAILABLE', 'Database not connected', 503)
    }

    const [deleted] = await db
      .update(cunasGemelas)
      .set({ activo: false })
      .where(
        and(
          eq(cunasGemelas.id, id),
          eq(cunasGemelas.tenantId, ctx.tenantId),
        )
      )
      .returning({ id: cunasGemelas.id })

    if (!deleted) {
      return apiError('NOT_FOUND', 'Vínculo gemela no encontrado', 404)
    }

    return apiSuccess({ id: deleted.id, eliminado: true })
  } catch (error) {
    return apiServerError(error instanceof Error ? error.message : undefined)
  }
}
