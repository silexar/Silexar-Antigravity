import { NextResponse } from 'next/server'

import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

export async function GET() {
  try {
    const metrics = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: Date.now(),
      app: 'Silexar Pulse - Campaigns',
    }
    return NextResponse.json({ success: true, metrics }, { status: 200 })
  } catch (error) {
    logger.error('[API/Monitoring/Metrics] Error GET:', error instanceof Error ? error : undefined, { module: 'monitoring/metrics', action: 'GET' })
    return apiServerError()
  }
}

