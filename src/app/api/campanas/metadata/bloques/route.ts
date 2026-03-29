import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { rateLimit } from '@/lib/security/rate-limiter'
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

const baseHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
}

export async function GET(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rl = await rateLimit({ key: `campanas_bloques:${clientIP}`, limit: 300, window: 60_000 })
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'RATE_LIMIT' }, { status: 429, headers: baseHeaders })
    }

    const bloques = [
      { id: 'am', nombre: 'AM', rango: { inicio: '06:00', fin: '11:59' } },
      { id: 'md', nombre: 'MEDIODÍA', rango: { inicio: '12:00', fin: '13:59' } },
      { id: 'pm', nombre: 'PM', rango: { inicio: '14:00', fin: '18:59' } },
      { id: 'nt', nombre: 'NOCHE', rango: { inicio: '19:00', fin: '23:59' } },
      { id: 'prm', nombre: 'PRIME', rango: { inicio: '07:00', fin: '09:59' } },
    ]

    return NextResponse.json({ success: true, bloques }, { status: 200, headers: baseHeaders })
  } catch (error) {
    logger.error('[API/Campanas/Metadata/Bloques] Error GET:', error instanceof Error ? error : undefined, { module: 'campanas/metadata/bloques', action: 'GET' })
    return apiServerError()
  }
}

