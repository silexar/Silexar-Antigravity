import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { rateLimit } from '@/lib/security/rate-limiter'
import { loadBackup } from '@/lib/backup/state-backup'
import { appendAudit } from '@/lib/security/audit-trail'
import { getAuthContext, requireRole, forbid } from '@/lib/security/rbac'
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = getAuthContext(request)
    if (!requireRole(ctx, ['TM_SENIOR'])) return forbid()
    const rl = await rateLimit({ key: `backup_restore:${params.id}`, limit: 30, window: 60_000 })
    if (!rl.success) return NextResponse.json({ success: false, error: 'RATE_LIMIT' }, { status: 429 })
    const body = await request.json().catch(() => ({}))
    const version = String(body.version || '')
    const data = loadBackup(params.id, version)
    if (!data) return NextResponse.json({ success: false, error: 'NOT_FOUND' }, { status: 404 })
    appendAudit(params.id, { actor: ctx?.userId, action: 'BACKUP_RESTORE', meta: { version } })
    return NextResponse.json({ success: true, state: data.state, version }, { status: 200 })
  } catch (error) {
    logger.error('[API/Campanas/Backup/Restore] Error POST:', error instanceof Error ? error : undefined, { module: 'campanas/backup/restore', action: 'POST' })
    return apiServerError()
  }
}

