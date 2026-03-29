/**
 * Silexar Pulse - Tenant Management API Routes
 *
 * GET  /api/tenants  — List all tenants (SUPER_CEO / ADMIN only)
 * POST /api/tenants  — Create a new tenant (SUPER_CEO / ADMIN only)
 */

import { NextRequest } from 'next/server'
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiValidationError, getUserContext, apiForbidden} from '@/lib/api/response'
import { secureHandler } from '@/lib/api/secure-handler'
import { tenants } from '@/lib/db/users-schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { checkPermission } from '@/lib/security/rbac';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

// ═══════════════════════════════════════════════════════════════
// GET — List all tenants
// ═══════════════════════════════════════════════════════════════

export const GET = secureHandler(
  { resource: 'usuarios', action: 'admin', skipTenantContext: true },
  async (_request, { db }) => {
    const allTenants = await db
      .select()
      .from(tenants)
      .orderBy(tenants.createdAt)

    allTenants.reverse()
    return apiSuccess(allTenants)
  }
)

// ═══════════════════════════════════════════════════════════════
// POST — Create a new tenant
// ═══════════════════════════════════════════════════════════════

const createTenantSchema = z.object({
  nombre: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  plan: z.enum(['starter', 'professional', 'enterprise', 'custom']),
  contactoEmail: z.string().email(),
  contactoNombre: z.string(),
})

export const POST = secureHandler(
  { resource: 'usuarios', action: 'admin', skipTenantContext: true },
  async (request, { user, db }) => {
    const body = await request.json()
    const parsed = createTenantSchema.safeParse(body)

    if (!parsed.success) {
      return apiValidationError(parsed.error.flatten().fieldErrors)
    }

    const { nombre, slug, plan, contactoEmail, contactoNombre } = parsed.data

    // Check slug uniqueness
    const existingTenant = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1)

    if (existingTenant.length > 0) {
      return apiError('SLUG_TAKEN', `The slug "${slug}" is already in use`, 409)
    }

    // Insert new tenant
    const [tenant] = await db
      .insert(tenants)
      .values({
        name: nombre,
        slug,
        plan,
        email: contactoEmail,
        settings: { contactoNombre },
      })
      .returning()

    return apiSuccess(tenant, 201)
  }
)
