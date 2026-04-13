/**
 * Better-Auth Configuration
 *
 * Self-hosted authentication with Drizzle ORM adapter, multi-tenant organization
 * support, 2FA, and admin management for Silexar Pulse.
 */

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { twoFactor } from 'better-auth/plugins/two-factor'
import { admin } from 'better-auth/plugins/admin'
import { organization } from 'better-auth/plugins/organization'
import { multiSession } from 'better-auth/plugins/multi-session'
import { bearer } from 'better-auth/plugins/bearer'
import * as argon2 from 'argon2'
import { getDB } from '@/lib/db'
import { auditLogger } from '@/lib/security/audit-logger'
import { logger } from '@/lib/observability'

// Validate required environment variables in production
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = [
    'DATABASE_URL',
    'BETTER_AUTH_SECRET',
    'NEXT_PUBLIC_APP_URL',
  ] as const

  const missing = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  )

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for Better Auth in production: ${missing.join(', ')}`
    )
  }
}

export const auth = betterAuth({
  // BETTER_AUTH_SECRET is required in all environments
  secret: process.env.BETTER_AUTH_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') throw new Error('BETTER_AUTH_SECRET is required in production');
    throw new Error('BETTER_AUTH_SECRET must be set. Generate with: openssl rand -base64 32');
  })(),

  database: drizzleAdapter(getDB(), {
    provider: 'pg',
    schema: {
      user: 'users',
      session: 'sessions',
      account: 'accounts',
      verification: 'verifications',
    },
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: process.env.NODE_ENV === 'production',
    minPasswordLength: 8,
    maxPasswordLength: 128,
    password: {
      hash: async (password: string) => {
        return argon2.hash(password, {
          type: argon2.argon2id,
          memoryCost: 65536,    // 64 MB — OWASP recommended
          parallelism: 4,       // Match PasswordSecurityEngine — OWASP recommended
          timeCost: 3,
        })
      },
      verify: async (data: { password: string; hash: string }) => {
        return argon2.verify(data.hash, data.password)
      },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      enabled: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      enabled: !!(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET),
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      enabled: !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET),
    },
  },

  session: {
    expiresIn: 60 * 60,           // 1 hour access token
    updateAge: 60 * 15,           // refresh every 15 min
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,             // 5 minute cache
    },
  },

  rateLimit: {
    window: 60,
    max: 10,
    // In production, configure Redis via environment
    storage: process.env.REDIS_URL ? 'database' : 'memory',
  },

  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.COOKIE_DOMAIN || '.silexar.com',
    },
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      logger.info(`Email verification sent to: ${user.email}`)

      await auditLogger.auth('Email verification sent', undefined, {
        event: 'EMAIL_VERIFICATION_SENT',
        userId: user.id,
        email: user.email?.substring(0, 10) + '***',
      })

      // TODO: Integrate with SendGrid/Resend/AWS SES
      // await sendVerificationEmail(user.email, url)
    },
  },

  plugins: [
    twoFactor({
      issuer: 'Silexar Pulse',
    }),
    admin(),
    organization(),
    multiSession(),
    bearer(),
  ],

  onError: async (error: unknown) => {
    logger.error('Better-Auth error', error instanceof Error ? error : undefined)
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
