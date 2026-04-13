/**
 * Security headers for Silexar Pulse responses.
 *
 * Applies CSP, HSTS, X-Frame-Options, and related protective headers
 * to every Next.js response. Called from middleware or API routes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability'

// ─── CSP configuration ───────────────────────────────────────────────────────

const DEV = process.env.NODE_ENV === 'development'

const CSP_DIRECTIVES: Record<string, string[]> = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    ...(DEV ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
    'https://vercel.live',
    'https://*.vercel.app',
    'https://va.vercel-scripts.com',
  ],
  // 'unsafe-inline' intentionally omitted — nonce-based CSP is applied by middleware.ts
  // for every page request. This fallback only covers API responses without a nonce.
  'style-src': ["'self'", 'https://fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'blob:', 'https:', 'https://*.vercel.app', 'https://images.unsplash.com'],
  'connect-src': [
    "'self'",
    'https://vercel.live',
    'https://*.vercel.app',
    'wss://ws-us3.pusher.com',
    'https://vitals.vercel-insights.com',
  ],
  'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
  'object-src': ["'none'"],
  'media-src': ["'self'", 'data:', 'blob:'],
  'frame-src': ["'self'", 'https://vercel.live'],
  'worker-src': ["'self'", 'blob:'],
  'manifest-src': ["'self'"],
}

// ─── Header application ──────────────────────────────────────────────────────

export function applySecurityHeaders(
  _request: NextRequest,
  response: NextResponse,
  nonce?: string
): NextResponse {
  try {
    // Middleware generates a per-request nonce and owns the page CSP.
    // This function is used for API route responses — inject nonce into style-src
    // if provided, otherwise fall back to the static policy (no 'unsafe-inline').
    const directives = { ...CSP_DIRECTIVES }
    if (nonce) {
      directives['style-src'] = ["'self'", `'nonce-${nonce}'`, 'https://fonts.googleapis.com']
    }
    const csp = Object.entries(directives)
      .map(([k, v]) => `${k} ${v.join(' ')}`)
      .concat(['upgrade-insecure-requests', 'block-all-mixed-content', 'report-uri /api/security/csp-report'])
      .join('; ')
    response.headers.set('Content-Security-Policy', csp)

    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )

    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=(self), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
    )

    response.headers.set('X-DNS-Prefetch-Control', 'off')
    response.headers.set('X-Download-Options', 'noopen')
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')
  } catch (error) {
    logger.error(
      'Error applying security headers:',
      error instanceof Error ? error : undefined
    )
    // Minimal fallback — never leave a response without basic protection
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  }

  return response
}

// ─── Legacy singleton shim ───────────────────────────────────────────────────
// Kept for backwards compatibility with any future callers.
// New code should call applySecurityHeaders() directly.

export const securityHeaders = {
  applySecurityHeaders,
} as const
