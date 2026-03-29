import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability';
import { auditLogger } from '@/lib/security/audit-logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    await auditLogger.security('CSP report received', {
      event: 'CSP_REPORT',
      report: body,
      userAgent: request.headers.get('user-agent') || 'unknown',
      referrer: request.headers.get('referer') || undefined,
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    await auditLogger.error('Failed to process CSP report', error as Error, {})
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

