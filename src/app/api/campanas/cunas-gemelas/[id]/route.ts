/**
 * PATCH  /api/campanas/cunas-gemelas/[id]  — Update twin-spot link
 * DELETE /api/campanas/cunas-gemelas/[id]  — Soft-delete twin-spot link
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest } from 'next/server'
import { logger } from '@/lib/observability';
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { apiSuccess, apiServerError, apiValidationError } from '@/lib/api/response'
import { isDatabaseConnected, getDB } from '@/lib/db'
import { cunasGemelas } from '@/lib/db/materiales-schema'
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';

// ─── Validation ─────────────────────────────────────────────

const patchSchema = z.object({
  posicion:         z.enum(['antes', 'despues']).optional(),
  separacionMaxima: z.number().int().min(0).max(999).optional(),
  mismoBloque:      z.boolean().optional(),
}).strict()

// ─── PATCH ───────────────────────────────────────────────────

export const PATCH = withApiRoute(
  { resource: 'cunas', action: 'update' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        // Extraer ID de la URL
        const url = new URL(req.url);
        const pathParts = url.pathname.split('/');
        const id = pathParts[pathParts.indexOf('cunas-gemelas') + 1];
        
        if (!id) return apiSuccess({ error: 'ID requerido' }, 400);

        const body = await req.json();
        const parsed = patchSchema.safeParse(body);
        if (!parsed.success) return apiValidationError(parsed.error.issues);

        if (Object.keys(parsed.data).length === 0) {
          return apiSuccess({ error: 'Se debe enviar al menos un campo a actualizar' }, 400);
        }

        const db = getDB();
        if (!isDatabaseConnected() || !db) {
          return apiSuccess({ error: 'Database not connected' }, 503);
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
          .returning();

        if (!updated) {
          return apiSuccess({ error: 'Vínculo gemela no encontrado' }, 404);
        }

        return apiSuccess({ ...updated, actualizadoPor: ctx.userId });
      });
    } catch (error) {
      logger.error('[API/CunasGemelas] Error PATCH:', error instanceof Error ? error : undefined, { 
        module: 'cunas-gemelas',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError(error instanceof Error ? error.message : undefined);
    }
  }
);

// ─── DELETE (soft) ───────────────────────────────────────────

export const DELETE = withApiRoute(
  { resource: 'cunas', action: 'delete' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        // Extraer ID de la URL
        const url = new URL(req.url);
        const pathParts = url.pathname.split('/');
        const id = pathParts[pathParts.indexOf('cunas-gemelas') + 1];
        
        if (!id) return apiSuccess({ error: 'ID requerido' }, 400);

        const db = getDB();
        if (!isDatabaseConnected() || !db) {
          return apiSuccess({ error: 'Database not connected' }, 503);
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
          .returning({ id: cunasGemelas.id });

        if (!deleted) {
          return apiSuccess({ error: 'Vínculo gemela no encontrado' }, 404);
        }

        return apiSuccess({ id: deleted.id, eliminado: true, eliminadoPor: ctx.userId });
      });
    } catch (error) {
      logger.error('[API/CunasGemelas] Error DELETE:', error instanceof Error ? error : undefined, { 
        module: 'cunas-gemelas',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError(error instanceof Error ? error.message : undefined);
    }
  }
);
