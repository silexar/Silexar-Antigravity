import { NextRequest } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/observability';
import { apiSuccess, apiUnauthorized, apiServerError, apiValidationError, getUserContext, apiForbidden } from '@/lib/api/response';
import { checkPermission } from '@/lib/security/rbac';
import { auditLogger } from '@/lib/security/audit-logger';

// Schema estricto — NUNCA reflejar body sin validar (reflection attack)
const BillingEventSchema = z.object({
  eventType: z.enum(['impression', 'click', 'conversion', 'view', 'complete']),
  campaignId: z.string().uuid(),
  amount: z.number().positive().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  const ctx = getUserContext(request);
  if (!ctx.userId) return apiUnauthorized();

  const perm = checkPermission(ctx, 'campanas', 'read');
  if (!perm) return apiForbidden();

  try {
    const rawBody: unknown = await request.json();
    const parsed = BillingEventSchema.safeParse(rawBody);
    if (!parsed.success) return apiValidationError(parsed.error);

    // Respuesta con solo campos controlados — sin ...body (reflection eliminado)
    const eventId = `evt_${crypto.randomUUID()}`;
    await auditLogger.log({ type: 'DATA_CREATE', userId: ctx.userId, metadata: { module: 'billing-events', eventId, eventType: parsed.data.eventType, campaignId: parsed.data.campaignId } });
    return apiSuccess({ eventId, processed: true, eventType: parsed.data.eventType });
  } catch (error) {
    logger.error('[API/V2/Billing/Events/Process] Error:', error instanceof Error ? error : undefined);
    return apiServerError();
  }
}
