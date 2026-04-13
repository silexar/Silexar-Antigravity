/**
 * SILEXAR PULSE - API Emergency TIER 0
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { logger } from '@/lib/observability';
import { apiSuccess, apiServerError } from '@/lib/api/response';
import { withApiRoute } from '@/lib/api/with-api-route';
import { withTenantContext } from '@/lib/db/tenant-context';
import { AuditEventType, AuditSeverity } from '@/lib/security/audit-types';

// Zod schemas
const GetEmergencySchema = z.object({
  id: z.string().optional(),
});

const CreateEmergencySchema = z.object({
  type: z.string().min(1, 'type es requerido'),
  location: z.string().min(1, 'location es requerido'),
  description: z.string().optional(),
});

/**
 * GET - Obtener información de emergencia
 * Requiere: emisiones:read
 */
export const GET = withApiRoute(
  { resource: 'emisiones', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        const { searchParams } = new URL(req.url);
        const params = GetEmergencySchema.parse({ id: searchParams.get('id') ?? undefined });

        // Simulation of emergency data — scoped to tenant
        const emergencyData = {
          id: params.id ?? randomUUID(),
          type: 'medical',
          status: 'active',
          location: 'Hospital Central',
          timestamp: new Date().toISOString(),
          description: 'Emergencia médica reportada',
          tenantId: ctx.tenantId,
          consultadoPor: ctx.userId
        };

        return apiSuccess(emergencyData);
      });
    } catch (error) {
      logger.error('[API/Emergency] Error GET:', error instanceof Error ? error : undefined, { 
        module: 'emergency',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);

/**
 * POST - Crear nueva emergencia
 * Requiere: emisiones:create
 */
export const POST = withApiRoute(
  { resource: 'emisiones', action: 'create' },
  async ({ ctx, req }) => {
    try {
      return await withTenantContext(ctx.tenantId, async () => {
        // Validate input with Zod
        let body: unknown;
        try { body = await req.json(); } catch { 
          return apiSuccess({ error: 'Invalid JSON' }, 400);
        }
        const parsed = CreateEmergencySchema.safeParse(body);
        if (!parsed.success) {
          return apiSuccess({ error: 'Invalid input', details: parsed.error.flatten() }, 422);
        }

        const newEmergency = {
          id: randomUUID(),
          type: parsed.data.type,
          location: parsed.data.location,
          description: parsed.data.description ?? 'Sin descripción',
          status: 'active',
          timestamp: new Date().toISOString(),
          tenantId: ctx.tenantId,
          reportedBy: ctx.userId,
        };

        return apiSuccess(newEmergency, 201);
      });
    } catch (error) {
      logger.error('[API/Emergency] Error POST:', error instanceof Error ? error : undefined, { 
        module: 'emergency',
        userId: ctx.userId,
        tenantId: ctx.tenantId
      });
      return apiServerError();
    }
  }
);
