/**
 * GET /api/auth/me — Current user profile
 *
 * Reads user context injected by Edge middleware (JWT already verified).
 * withApiRoute adds session blacklist check + audit logging on top.
 */

import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { withApiRoute } from '@/lib/api/with-api-route'
import { apiSuccess, apiUnauthorized, apiServerError } from '@/lib/api/response'
import { isDatabaseConnected, getDB } from '@/lib/db'
import { users } from '@/lib/db/users-schema'
import { logger } from '@/lib/observability';

export const GET = withApiRoute(
  { skipCsrf: true, rateLimit: 'api' },  // no RBAC needed — any authenticated user
  async ({ ctx }) => {
    // DB unavailable — return JWT-derived context
    if (!isDatabaseConnected()) {
      return apiSuccess({
        user: {
          userId: ctx.userId,
          email: '',
          role: ctx.role,
          tenantId: ctx.tenantId,
          tenantSlug: ctx.tenantSlug,
          sessionId: ctx.sessionId,
        },
      }) as unknown as NextResponse
    }

    try {
      const db = getDB()
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          category: users.category,
          status: users.status,
          tenantId: users.tenantId,
          isSuperAdmin: users.isSuperAdmin,
          isTenantAdmin: users.isTenantAdmin,
          twoFactorEnabled: users.twoFactorEnabled,
          lastLoginAt: users.lastLoginAt,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, ctx.userId))
        .limit(1)

      if (!user) {
        return apiUnauthorized('User not found') as unknown as NextResponse
      }

      if (user.status !== 'active') {
        return apiUnauthorized('Account is inactive') as unknown as NextResponse
      }

      return apiSuccess({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          category: user.category,
          status: user.status,
          tenantId: user.tenantId,
          tenantSlug: ctx.tenantSlug,
          sessionId: ctx.sessionId,
          isSuperAdmin: user.isSuperAdmin,
          isTenantAdmin: user.isTenantAdmin,
          twoFactorEnabled: user.twoFactorEnabled,
          lastLoginAt: user.lastLoginAt,
        },
      }) as unknown as NextResponse
    } catch (error) {
      logger.error('Error in auth me', error instanceof Error ? error : undefined, { module: 'auth', action: 'me' })
      return apiServerError('Failed to retrieve user profile') as unknown as NextResponse
    }
  }
)

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
