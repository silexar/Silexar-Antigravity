import { NextRequest } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/observability'
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response'
import { withTenantContext } from '@/lib/db/tenant-context'
import { checkPermission } from '@/lib/security/rbac'
import { apiRateLimiter } from '@/lib/security/rate-limiter'

const AutocompletarSchema = z.object({
  nombreAnunciante: z.string().max(200).optional(),
  tipoPedidoCampana: z.string().max(100).optional(),
})

export async function POST(request: NextRequest) {
  // 1. Rate limit check (standard API: 100/min)
  const rl = await apiRateLimiter.checkRateLimit(request)
  if (!rl.success) return apiError('RATE_LIMIT', 'Too many requests', 429)

  // 2. Extract auth context
  const ctx = getUserContext(request)
  if (!ctx.userId) return apiUnauthorized()

  // 3. Validate input with Zod
  let body: unknown
  try { body = await request.json() } catch { return apiError('INVALID_JSON', 'Invalid JSON', 400) }
  const parsed = AutocompletarSchema.safeParse(body)
  if (!parsed.success) return apiError('VALIDATION_ERROR', 'Invalid input', 422, parsed.error.flatten())

  // 4. Check permissions (RBAC)
  if (!checkPermission(ctx, 'campanas', 'read')) return apiForbidden()

  try {
    const result = await withTenantContext(ctx.tenantId, async () => {
      const { nombreAnunciante, tipoPedidoCampana } = parsed.data
      const sugerencias: Record<string, unknown> = {}

      if (nombreAnunciante) {
        sugerencias.nombreCampana = `${nombreAnunciante} - ${tipoPedidoCampana || 'Campaña'} ${new Date().getFullYear()}`
      }
      if (tipoPedidoCampana === 'AUSPICIO') {
        sugerencias.posicionFija = 'INICIO'
      }

      return { sugerencias }
    })

    return apiSuccess(result)
  } catch (error) {
    logger.error('[API/Campanas/IA/Autocompletar] Error:', error instanceof Error ? error : undefined, { module: 'campanas' })
    return apiServerError()
  }
}
