/**
 * Silexar Pulse — Edge Middleware
 *
 * Single source of truth for edge request processing.
 * Runs at the Edge (Vercel/CDN) before every request.
 *
 * Responsibilities:
 *   1. Fast path — skip static assets
 *   2. Rate limiting — per IP (20 req/min general, 10 req/min auth)
 *   3. CSRF protection — origin/host check on mutations
 *   4. JWT verification — validates silexar_session cookie
 *   5. Coarse RBAC — super-admin route guard
 *   6. Tenant isolation — slug-based cross-tenant block + impersonation audit
 *   7. Auth context headers — inject User-Id, Role, Tenant-Id, JTI for downstream
 *   8. Security headers — CSP nonce, HSTS, X-Frame-Options, etc.
 *   9. Role-based redirect — landing page on post-login
 *
 * Runtime: Edge (no Node.js APIs — jose only, no ioredis)
 */

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { edgeRateLimiter } from '@/lib/security/edge-rate-limiter'

// ─── Constants ────────────────────────────────────────────────

const COOKIE_NAME = 'silexar_session'

const PUBLIC_PATHS = [
  '/login',
  '/registro',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/logout',
  '/api/health',
  '/api/security/csp-violation',
  '/api/security/csp-report',
  '/_next',
  '/favicon.ico',
  '/manifest.json',
  '/sw.js',
  '/icons',
  '/images',
  '/_vercel',
  '/api/webhooks',
]

const AUTH_PATHS = ['/api/auth/login', '/api/auth/register', '/api/mobile/auth']

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL ?? '',
  'https://app.silexar.com',
  'https://silexar.com',
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://localhost:3001'] : []),
].filter(Boolean)

const API_KEY_ROUTES = [
  '/api/v2/events/fl-update',
  '/api/webhooks/',
]

const SYSTEM_PREFIXES = new Set([
  'admin', 'super-admin', 'login', 'registro', 'api', 'dashboard', 'settings',
  '_next', 'static', 'favicon.ico', 'monitoring', 'command-center', 'security',
  'enterprise', 'campaigns', 'campanas', 'analytics', 'ai-dashboard', 'wil',
  'facturacion', 'contratos', 'anunciantes', 'propiedades', 'emisoras',
  'agencias-creativas', 'equipos-ventas', 'conciliacion', 'vencimientos',
  'cunas', 'usuarios', 'vendedores', 'registro-emision', 'cortex',
  'ai-assistant', 'auth', 'forgot-password', 'reset-password',
  'admin-cliente', 'plataformas-digitales', 'ecosistema-digital', 'sistemas-playout',
])

const ROLE_REDIRECT: Record<string, string> = {
  SUPER_CEO:          '/super-admin',
  ADMIN:              '/super-admin',
  CLIENT_ADMIN:       '/admin-cliente',
  GERENTE_VENTAS:     '/dashboard',
  EJECUTIVO_VENTAS:   '/dashboard',
  EJECUTIVO:          '/dashboard',
  TM_SENIOR:          '/dashboard',
  FINANCIERO:         '/dashboard',
  PROGRAMADOR:        '/dashboard',
  OPERADOR_EMISION:   '/dashboard',
  AGENCIA:            '/dashboard',
  ANUNCIANTE:         '/dashboard',
  VIEWER:             '/dashboard',
  USER:               '/dashboard',
}

// ─── JWT Payload ──────────────────────────────────────────────

interface SilexarJWT {
  userId?: string
  email?: string
  role?: string
  tenantId?: string
  tenantSlug?: string
  sessionId?: string
  jti?: string
  sub?: string
  exp?: number
  mfaVerified?: boolean
}

// Routes that require MFA verification in the JWT
const MFA_REQUIRED_PREFIXES = ['/super-admin', '/admin', '/api/super-admin', '/api/admin']
const MFA_REQUIRED_ROLES = new Set(['SUPER_CEO', 'ADMIN', 'CLIENT_ADMIN'])

// ─── Helpers ──────────────────────────────────────────────────

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p)
  )
}

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((p) => pathname.startsWith(p))
}

function isMutation(method: string): boolean {
  return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)
}

function getIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}

/**
 * Genera un nonce criptográficamente seguro para CSP
 */
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Construye el header CSP con nonce para scripts y estilos
 * El nonce se genera por request para prevenir ataques XSS
 */
function buildCSP(nonce: string): string {
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' data: https: blob:`,
    `font-src 'self' data:`,
    `connect-src 'self' https://*.supabase.co https://api.anthropic.com wss:`,
    `frame-src 'none'`,
    `object-src 'none'`,
    `form-action 'self'`,
    `base-uri 'self'`,
    `upgrade-insecure-requests`,
  ].join('; ')
}

/**
 * Añade headers de seguridad con CSP nonce-based
 * El nonce se inyecta en el header para ser usado por el cliente
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  const nonce = generateNonce();
  const headers = response.headers
  
  // CSP con nonce para scripts y estilos
  headers.set('Content-Security-Policy', buildCSP(nonce))
  
  // Headers de seguridad estándar
  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  
  // Headers anti-fingerprinting
  headers.delete('X-Powered-By')
  headers.delete('Server')
  
  // Exponer el nonce al cliente mediante header (para uso en meta tags)
  headers.set('X-CSP-Nonce', nonce)
  
  return response
}

async function verifyJwt(token: string): Promise<SilexarJWT | null> {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    return null
  }
  try {
    const key = new TextEncoder().encode(secret)
    const { payload } = await jwtVerify(token, key, {
      issuer: 'silexar-pulse',
      audience: 'silexar-pulse-app',
      clockTolerance: 30,
    })
    const jwt = payload as SilexarJWT
    if (!jwt.userId && !jwt.sub) return null
    return { ...jwt, userId: jwt.userId || jwt.sub }
  } catch {
    return null
  }
}

// ─── Main Proxy ───────────────────────────────────────────────

export default async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl
  const method = request.method
  const ip = getIP(request)

  // 1. Fast path — skip static assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    /\.(ico|svg|png|jpg|webp|woff2?|ttf)$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  // 2. Rate limit — auth: 10/min, general: 20/min
  const isAuth = isAuthPath(pathname)
  const rlResult = await edgeRateLimiter.checkRateLimit(
    `${isAuth ? 'auth' : 'edge'}:${ip}`,
    isAuth ? 10 : 20,
    60_000,
    request
  )
  if (!rlResult.success) {
    const res = NextResponse.json(
      { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
      { status: 429 }
    )
    res.headers.set('Retry-After', String(rlResult.retryAfter ?? 60))
    res.headers.set('X-RateLimit-Limit', String(rlResult.limit))
    res.headers.set('X-RateLimit-Remaining', '0')
    return addSecurityHeaders(res)
  }

  // 3. Allow public paths without JWT
  if (isPublicPath(pathname)) {
    const res = NextResponse.next()
    res.headers.set('X-RateLimit-Remaining', String(rlResult.remaining))
    return addSecurityHeaders(res)
  }

  // 4. CSRF check on mutations
  if (isMutation(method)) {
    const isApiKeyRoute = API_KEY_ROUTES.some((p) => pathname.startsWith(p))
    if (isApiKeyRoute) {
      const providedKey = request.headers.get('x-silexar-api-key')
      const expectedKey = process.env.SILEXAR_WEBHOOK_SECRET ?? ''
      if (!expectedKey || providedKey !== expectedKey) {
        return addSecurityHeaders(
          NextResponse.json(
            { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid API key' } },
            { status: 401 }
          )
        )
      }
    } else {
      const origin = request.headers.get('origin')
      const host = request.headers.get('host')
      if (origin) {
        try {
          const originHost = new URL(origin).host
          if (originHost !== host && !ALLOWED_ORIGINS.includes(origin)) {
            return addSecurityHeaders(
              NextResponse.json(
                { success: false, error: { code: 'CSRF_DETECTED', message: 'Invalid origin' } },
                { status: 403 }
              )
            )
          }
        } catch {
          return addSecurityHeaders(
            NextResponse.json(
              { success: false, error: { code: 'CSRF_DETECTED', message: 'Malformed origin' } },
              { status: 403 }
            )
          )
        }
      }
    }
  }

  // 5. Extract + verify JWT
  const token =
    request.cookies.get(COOKIE_NAME)?.value ??
    request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return addSecurityHeaders(
        NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
          { status: 401 }
        )
      )
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const user = await verifyJwt(token)
  if (!user) {
    if (pathname.startsWith('/api/')) {
      return addSecurityHeaders(
        NextResponse.json(
          { success: false, error: { code: 'TOKEN_INVALID', message: 'Invalid or expired token' } },
          { status: 401 }
        )
      )
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    const res = NextResponse.redirect(loginUrl)
    res.cookies.delete(COOKIE_NAME)
    return res
  }

  const isSuperUser = user.role === 'SUPER_CEO' || user.role === 'ADMIN'

  // 6a. MFA enforcement — super-admin, admin routes require mfaVerified in JWT
  const requiresMfa = MFA_REQUIRED_PREFIXES.some((p) => pathname.startsWith(p))
  if (requiresMfa && MFA_REQUIRED_ROLES.has(user.role ?? '')) {
    if (!user.mfaVerified) {
      if (pathname.startsWith('/api/')) {
        return addSecurityHeaders(
          NextResponse.json(
            { success: false, error: { code: 'MFA_REQUIRED', message: 'Multi-factor authentication required for this resource' } },
            { status: 403 }
          )
        )
      }
      const mfaUrl = new URL('/login', request.url)
      mfaUrl.searchParams.set('mfa', 'required')
      mfaUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(mfaUrl)
    }
  }

  // 6b. Coarse RBAC — super-admin route guard
  if (pathname.startsWith('/super-admin') && !isSuperUser) {
    if (pathname.startsWith('/api/')) {
      return addSecurityHeaders(
        NextResponse.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
          { status: 403 }
        )
      )
    }
    return NextResponse.redirect(
      new URL(user.tenantSlug ? `/${user.tenantSlug}` : '/login', request.url)
    )
  }

  // 7. Tenant isolation — block cross-tenant access
  const pathParts = pathname.split('/').filter(Boolean)
  const potentialSlug = pathParts[0]?.toLowerCase()
  if (potentialSlug && !SYSTEM_PREFIXES.has(potentialSlug)) {
    if (!isSuperUser && user.tenantSlug && user.tenantSlug !== pathParts[0]) {
      if (pathname.startsWith('/api/')) {
        return addSecurityHeaders(
          NextResponse.json(
            { success: false, error: { code: 'TENANT_MISMATCH', message: 'Access denied to this tenant' } },
            { status: 403 }
          )
        )
      }
      return NextResponse.redirect(new URL(`/${user.tenantSlug}`, request.url))
    }
  }

  // 8. Role-based redirect on login landing
  if (pathname === '/login' && user.userId) {
    const landing = ROLE_REDIRECT[user.role ?? ''] ?? '/dashboard'
    return NextResponse.redirect(new URL(landing, request.url))
  }

  // 9. Inject auth context headers for downstream handlers
  const res = NextResponse.next()
  res.headers.set('X-Silexar-User-Id', user.userId ?? '')
  res.headers.set('X-Silexar-User-Role', user.role ?? '')
  res.headers.set('X-Silexar-Tenant-Id', user.tenantId ?? '')
  res.headers.set('X-Silexar-Tenant-Slug', user.tenantSlug ?? '')
  res.headers.set('X-Silexar-Session-Id', user.sessionId ?? '')
  if (user.jti) res.headers.set('X-Silexar-JTI', user.jti)
  res.headers.set('X-Request-Id', crypto.randomUUID())
  res.headers.set('X-RateLimit-Remaining', String(rlResult.remaining))

  // Super-admin impersonation audit trail
  if (
    isSuperUser &&
    potentialSlug &&
    !SYSTEM_PREFIXES.has(potentialSlug) &&
    user.tenantSlug !== potentialSlug
  ) {
    res.headers.set('X-Silexar-Impersonation', 'true')
    res.headers.set('X-Silexar-Original-User', user.userId ?? '')
  }

  return addSecurityHeaders(res)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons/|images/|sw.js|manifest.json).*)',
  ],
}
