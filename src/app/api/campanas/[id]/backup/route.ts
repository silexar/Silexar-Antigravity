import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { rateLimit } from '@/lib/security/rate-limiter'
import { createBackup, listBackups } from '@/lib/backup/state-backup'
import { appendAudit } from '@/lib/security/audit-trail'
import { getAuthContext, requireRole, forbid } from '@/lib/security/rbac'
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rl = await rateLimit({ key: `backup_list:${params.id}`, limit: 120, window: 60_000 })
    if (!rl.success) return NextResponse.json({ success: false, error: 'RATE_LIMIT' }, { status: 429 })
    const versions = listBackups(params.id)
    return NextResponse.json({ success: true, versions }, { status: 200 })
  } catch (error) {
    logger.error('[API/Campanas/Backup] Error GET:', error instanceof Error ? error : undefined, { module: 'campanas/backup', action: 'GET' })
    return apiServerError()
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = getAuthContext(request)
    if (!requireRole(ctx, ['TM_SENIOR', 'PROGRAMADOR'])) return forbid()
    const rl = await rateLimit({ key: `backup_create:${params.id}`, limit: 60, window: 60_000 })
    if (!rl.success) return NextResponse.json({ success: false, error: 'RATE_LIMIT' }, { status: 429 })
    const body = await request.json().catch(() => ({}))
    const state = body.state || { note: 'no-state-provided' }
    const { version } = createBackup(params.id, state)
    appendAudit(params.id, { actor: ctx?.userId, action: 'BACKUP_CREATE', meta: { version } })
    return NextResponse.json({ success: true, version }, { status: 201 })
  } catch (error) {
    logger.error('[API/Campanas/Backup] Error POST:', error instanceof Error ? error : undefined, { module: 'campanas/backup', action: 'POST' })
    return apiServerError()
  }
}

