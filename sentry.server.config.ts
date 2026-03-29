/**
 * Silexar Pulse — Sentry Server Configuration
 * Runs on the Node.js server. Captures API errors, slow queries, and server-side issues.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  environment: process.env.NODE_ENV ?? 'development',
  release: process.env.NEXT_PUBLIC_APP_VERSION,

  // Trace 5% of server requests in production to avoid overhead
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,

  integrations: [
    // Auto-instrument database queries
    Sentry.prismaIntegration(),
  ],

  // Filter errors not worth alerting
  ignoreErrors: [
    'NEXT_NOT_FOUND',
    'NEXT_REDIRECT',
    'AbortError',
    /rate.?limit/i,
  ],

  beforeSend(event) {
    // Scrub sensitive fields from server errors
    if (event.extra) {
      const scrubKeys = ['password', 'passwordHash', 'token', 'apiKey', 'secret', 'jwt'];
      for (const key of scrubKeys) {
        if (key in event.extra) {
          event.extra[key] = '[SCRUBBED]';
        }
      }
    }
    return event;
  },
});
