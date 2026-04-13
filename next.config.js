/**
 * Silexar Pulse - Next.js 16 Configuration
 * Enterprise-grade with security headers, Turbopack y Sentry
 */

// @ts-check
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  productionBrowserSourceMaps: false,

  // TypeScript strict — fail build on errors
  typescript: {
    ignoreBuildErrors: false,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Server-only packages (Next.js 16 top-level config)
  serverExternalPackages: [
    'drizzle-orm',
    'postgres',
    'better-auth',
    'bcryptjs',
    'ioredis',
    'kafkajs',
    'jsonwebtoken',
  ],

  // Package optimization — tree-shake heavy libraries
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'recharts',
      'date-fns',
      'd3',
      'chart.js',
    ],
    clientTraceMetadata: [],
  },

  // Turbopack configuration (default bundler in Next.js 16)
  turbopack: {
    root: process.cwd(),
  },

  // Security headers — applied to ALL responses
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'strict-dynamic' https:; style-src 'self'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.anthropic.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests"
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()'
          },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // DSN y org se leen de env vars — nunca hardcodeados
  silent: true,
  sourcemaps: {
    disable: true,
  },
  tunnelRoute: '/monitoring/sentry-tunnel',
  // Next.js 16: use webpack options instead of deprecated autoInstrumentServerFunctions
  webpack: {
    // Disable auto-instrumentation (we handle errors manually)
    autoInstrumentServerFunctions: false,
    // Remove debug logging in production
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
