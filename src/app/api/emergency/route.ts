import { NextRequest } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { AuditEventType, AuditSeverity } from '@/lib/security/audit-types';
import { withTenantContext } from '@/lib/db/tenant-context';
import { apiRateLimiter } from '@/lib/security/rate-limiter';

// Zod schemas
const GetEmergencySchema = z.object({
  id: z.string().optional(),
});

const CreateEmergencySchema = z.object({
  type: z.string().min(1, 'type es requerido'),
  location: z.string().min(1, 'location es requerido'),
  description: z.string().optional(),
});

// GET - Obtener información de emergencia
export async function GET(request: NextRequest) {
  // 1. Rate limit check
  const rl = await apiRateLimiter.checkRateLimit(request);
  if (!rl.success) return apiError('RATE_LIMIT', 'Too many requests', 429);

  // 2. Extract auth context — any authenticated user can read emergency info
  const ctx = getUserContext(request);
  if (!ctx.userId) return apiUnauthorized();

  try {
    const result = await withTenantContext(ctx.tenantId, async () => {
      const { searchParams } = new URL(request.url);
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
      };

      return emergencyData;
    });

    return apiSuccess(result);
  } catch (error) {
    logger.error('[API/Emergency] Error GET:', error instanceof Error ? error : undefined, { module: 'emergency' });
    return apiServerError();
  }
}

// POST - Crear nueva emergencia
export async function POST(request: NextRequest) {
  // 1. Rate limit check
  const rl = await apiRateLimiter.checkRateLimit(request);
  if (!rl.success) return apiError('RATE_LIMIT', 'Too many requests', 429);

  // 2. Extract auth context — any authenticated user can report an emergency
  const ctx = getUserContext(request);
  if (!ctx.userId) return apiUnauthorized();

  // 3. Validate input with Zod
  let body: unknown;
  try { body = await request.json(); } catch { return apiError('INVALID_JSON', 'Invalid JSON', 400); }
  const parsed = CreateEmergencySchema.safeParse(body);
  if (!parsed.success) return apiError('VALIDATION_ERROR', 'Invalid input', 422, parsed.error.flatten());

  try {
    const result = await withTenantContext(ctx.tenantId, async () => {
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

      return newEmergency;
    });

    // 4. Audit log for all emergency reports
    auditLogger.logEvent({
      eventType: AuditEventType.DATA_CREATE,
      severity: AuditSeverity.HIGH,
      userId: ctx.userId,
      userRole: ctx.role,
      resource: 'emergency',
      action: 'create',
      details: {
        emergencyId: result.id,
        type: result.type,
        location: result.location,
        tenantId: ctx.tenantId,
      },
      success: true,
    });

    return apiSuccess(result, 201);
  } catch (error) {
    logger.error('[API/Emergency] Error POST:', error instanceof Error ? error : undefined, { module: 'emergency' });
    return apiServerError();
  }
}
