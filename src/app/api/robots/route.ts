import { NextResponse } from 'next/server'

import { logger } from '@/lib/observability';
export async function GET() {
  const content = `User-agent: *
Disallow: /` 
  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

