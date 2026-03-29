/**
 * POST /api/campanas/cunas-gemelas   — Create twin-spot link
 * GET  /api/campanas/cunas-gemelas   — List twin-spot links for a campaign
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

const createSchema = z.object({
  cunaPrincipalId: z.string().uuid('cunaPrincipalId debe ser UUID'),
  cunaGemelaId:    z.string().uuid('cunaGemelaId debe ser UUID'),
  posicion:        z.enum(['antes', 'despues']).default('despues'),
  separacionMaxima: z.number().int().min(0).max(999).default(0),
  mismoBloque:     z.boolean().default(true),
})

const querySchema = z.object({
  campanaId: z.string().uuid().optional(),
})

// ─── GET ─────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const ctx = getUserContext(request)
    if (!ctx) return apiError('UNAUTHORIZED', 'Autenticación requerida', 401)

    const { searchParams } = new URL(request.url)
    const query = querySchema.safeParse({ campanaId: searchParams.get('campanaId') || undefined })
    if (!query.success) return apiValidationError(query.error.issues)

    const db = getDB()
    if (!isDatabaseConnected() || !db) {
      return apiSuccess([], 200, { source: 'no_database' })
    }

    const rows = await db
      .select()
      .from(cunasGemelas)
      .where(eq(cunasGemelas.tenantId, ctx.tenantId))

    return apiSuccess(rows)
  } catch (error) {
    return apiServerError(error instanceof Error ? error.message : undefined)
  }
}

// ─── POST ─────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const ctx = getUserContext(request)
    if (!ctx) return apiError('UNAUTHORIZED', 'Autenticación requerida', 401)

    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return apiValidationError(parsed.error.issues)

    const db = getDB()
    if (!isDatabaseConnected() || !db) {
      return apiError('SERVICE_UNAVAILABLE', 'Database not connected', 503)
    }

    // Prevent self-link
    if (parsed.data.cunaPrincipalId === parsed.data.cunaGemelaId) {
      return apiError('VALIDATION_ERROR', 'Una cuña no puede ser gemela de sí misma', 400)
    }

    // Prevent duplicate link
    const existing = await db
      .select({ id: cunasGemelas.id })
      .from(cunasGemelas)
      .where(
        and(
          eq(cunasGemelas.tenantId, ctx.tenantId),
          eq(cunasGemelas.cunaPrincipalId, parsed.data.cunaPrincipalId),
          eq(cunasGemelas.cunaGemelaId, parsed.data.cunaGemelaId),
          eq(cunasGemelas.activo, true),
        )
      )
      .limit(1)

    if (existing.length > 0) {
      return apiError('CONFLICT', 'Ya existe un vínculo gemela entre estas cuñas', 409)
    }

    const [nueva] = await db
      .insert(cunasGemelas)
      .values({
        tenantId:         ctx.tenantId,
        cunaPrincipalId:  parsed.data.cunaPrincipalId,
        cunaGemelaId:     parsed.data.cunaGemelaId,
        posicion:         parsed.data.posicion,
        separacionMaxima: parsed.data.separacionMaxima,
        mismoBloque:      parsed.data.mismoBloque,
        activo:           true,
        creadoPorId:      ctx.userId,
      })
      .returning()

    return apiSuccess(nueva, 201)
  } catch (error) {
    return apiServerError(error instanceof Error ? error.message : undefined)
  }
}
