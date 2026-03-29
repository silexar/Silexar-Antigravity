/**
 * Silexar Pulse — Edge Proxy (Next.js 16)
 *
 * Entry point for the Edge Proxy layer. All routing and security logic
 * is delegated to src/middleware.ts, which is the single source of truth
 * for edge-level JWT verification, rate limiting, RBAC, tenant isolation,
 * security headers, and CSRF protection.
 *
 * CLAUDE.md: "src/proxy.ts — Edge Proxy (Next.js 16): same as middleware.ts"
 *
 * This file exists as a separate proxy entry point so that additional
 * edge proxy configurations (CDN rewrites, A/B routing, geo-routing) can
 * be added here without modifying the core middleware logic.
 *
 * Usage: imported by Next.js edge runtime when deploying with a custom proxy.
 */

export { middleware, config } from './middleware'

/**
 * Edge proxy metadata — used by monitoring/observability tools
 * to distinguish proxy-layer requests from direct middleware requests.
 */
export const PROXY_VERSION = '1.0.0'
export const PROXY_LAYER = 'edge-proxy'
