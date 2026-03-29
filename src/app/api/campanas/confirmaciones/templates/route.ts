import { NextRequest, NextResponse } from 'next/server'

import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

export async function GET(_request: NextRequest) {
  try {
    const templates = [
      { id: 'default', nombre: 'Estándar Corporativo' },
      { id: 'premium', nombre: 'Premium con Métricas' },
      { id: 'minimal', nombre: 'Minimal Cliente' },
    ]
    return NextResponse.json({ success: true, templates }, { status: 200 })
  } catch (error) {
    logger.error('[API/Campanas/Confirmaciones/Templates] Error GET:', error instanceof Error ? error : undefined, { module: 'campanas/confirmaciones/templates', action: 'GET' })
    return apiServerError()
  }
}

