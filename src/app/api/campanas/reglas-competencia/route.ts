/**
 * GET  /api/campanas/reglas-competencia  — List anti-competition rules
 * POST /api/campanas/reglas-competencia  — Create a new anti-competition rule
 */

import { z } from 'zod'
import { eq, and, or, ilike } from 'drizzle-orm'
import { apiSuccess, apiError, apiValidationError, getUserContext, apiForbidden} from '@/lib/api/response'
import { secureHandler } from '@/lib/api/secure-handler'
import { isDatabaseConnected } from '@/lib/db'
import { reglasCompetencia } from '@/lib/db/materiales-schema'
import { checkPermission } from '@/lib/security/rbac';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

// ─── Validation ─────────────────────────────────────────────

const createSchema = z.object({
  anuncianteA:          z.string().min(1).max(255),
  anuncianteB:          z.string().min(1).max(255),
  separacionMinima:     z.number().int().min(0).max(3600).default(10),
  mismaTandaProhibida:  z.boolean().default(true),
  prioridad:            z.enum(['alta', 'media', 'baja']).default('alta'),
  categoria:            z.string().max(100).optional(),
})

const querySchema = z.object({
  buscar:   z.string().max(100).optional(),
  activa:   z.enum(['true', 'false']).optional(),
  categoria: z.string().max(100).optional(),
})

// ─── GET ─────────────────────────────────────────────────────

export const GET = secureHandler(
  { resource: 'campanas', action: 'read' },
  async (request, { user, db }) => {
    const { searchParams } = new URL(request.url)
    const query = querySchema.safeParse({
      buscar:    searchParams.get('buscar')    || undefined,
      activa:    searchParams.get('activa')    || undefined,
      categoria: searchParams.get('categoria') || undefined,
    })
    if (!query.success) return apiValidationError(query.error.issues)

    if (!isDatabaseConnected()) {
      return apiSuccess([], 200, { source: 'no_database' })
    }

    const conditions = [eq(reglasCompetencia.tenantId, user.tenantId)]

    if (query.data.activa !== undefined) {
      conditions.push(eq(reglasCompetencia.activa, query.data.activa === 'true'))
    }
    if (query.data.categoria) {
      conditions.push(eq(reglasCompetencia.categoria, query.data.categoria))
    }
    if (query.data.buscar) {
      const term = `%${query.data.buscar}%`
      const buscarCond = or(
        ilike(reglasCompetencia.anuncianteA, term),
        ilike(reglasCompetencia.anuncianteB, term),
      );
      if (buscarCond) conditions.push(buscarCond);
    }

    const rows = await db
      .select()
      .from(reglasCompetencia)
      .where(and(...conditions))

    return apiSuccess(rows)
  }
)

// ─── POST ─────────────────────────────────────────────────────

export const POST = secureHandler(
  { resource: 'campanas', action: 'create' },
  async (request, { user, db }) => {
    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return apiValidationError(parsed.error.issues)

    if (parsed.data.anuncianteA.toLowerCase() === parsed.data.anuncianteB.toLowerCase()) {
      return apiError('VALIDATION_ERROR', 'Los dos anunciantes deben ser distintos', 400)
    }

    if (!isDatabaseConnected()) {
      return apiError('SERVICE_UNAVAILABLE', 'Database not connected', 503)
    }

    // Check duplicate rule (any direction A↔B)
    const existing = await db
      .select({ id: reglasCompetencia.id })
      .from(reglasCompetencia)
      .where(
        and(
          eq(reglasCompetencia.tenantId, user.tenantId),
          eq(reglasCompetencia.activa, true),
          or(
            and(
              eq(reglasCompetencia.anuncianteA, parsed.data.anuncianteA),
              eq(reglasCompetencia.anuncianteB, parsed.data.anuncianteB),
            ),
            and(
              eq(reglasCompetencia.anuncianteA, parsed.data.anuncianteB),
              eq(reglasCompetencia.anuncianteB, parsed.data.anuncianteA),
            ),
          ),
        )
      )
      .limit(1)

    if (existing.length > 0) {
      return apiError('CONFLICT', 'Ya existe una regla activa para estos anunciantes', 409)
    }

    const [nueva] = await db
      .insert(reglasCompetencia)
      .values({
        tenantId:             user.tenantId,
        anuncianteA:          parsed.data.anuncianteA,
        anuncianteB:          parsed.data.anuncianteB,
        separacionMinima:     parsed.data.separacionMinima,
        mismaTandaProhibida:  parsed.data.mismaTandaProhibida,
        prioridad:            parsed.data.prioridad,
        categoria:            parsed.data.categoria ?? null,
        activa:               true,
        creadoPorId:          user.userId,
      })
      .returning()

    return apiSuccess(nueva, 201)
  }
)
