/**
 * SILEXAR PULSE - API Cortex AI TIER 0
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/observability';
import { apiSuccess, apiServerError } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';
import { AuditEventType, AuditSeverity } from '@/lib/security/audit-types';

// Zod schema for POST body
const CortexCommandSchema = z.object({
  engine: z.string().min(1, 'engine es requerido').optional(),
  action: z.string().min(1, 'action es requerida').optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

/**
 * GET - Estado de Cortex
 * Requiere: dashboard:read
 */
export const GET = withApiRoute(
  { resource: 'dashboard', action: 'read', skipCsrf: true, rateLimit: 'cortex' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        return apiSuccess({
          status: 'ACTIVE',
          engines: ['creative', 'audience', 'sense'],
          tenantId: ctx.tenantId,
          consultadoPor: ctx.userId
        });
      });
    } catch (error) {
      logger.error('[API/Cortex] Error GET:', error instanceof Error ? error : undefined, { 
        module: 'cortex',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);

/**
 * POST - Ejecutar comando Cortex
 * Requiere: configuracion:admin
 */
export const POST = withApiRoute(
  { resource: 'configuracion', action: 'admin', rateLimit: 'cortex' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        // Validate input with Zod
        let body: unknown;
        try { body = await req.json(); } catch { 
          return apiSuccess({ error: 'Invalid JSON' }, 400);
        }
        const parsed = CortexCommandSchema.safeParse(body);
        if (!parsed.success) {
          return apiSuccess({ error: 'Invalid input', details: parsed.error.flatten() }, 422);
        }

        return apiSuccess({
          processed: true,
          engine: parsed.data.engine,
          action: parsed.data.action,
          tenantId: ctx.tenantId,
          ejecutadoPor: ctx.userId,
          timestamp: new Date().toISOString()
        });
      });
    } catch (error) {
      logger.error('[API/Cortex] Error POST:', error instanceof Error ? error : undefined, { 
        module: 'cortex',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);
