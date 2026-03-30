/**
 * Silexar Pulse — Sentry Edge Configuration
 * Runs in the Edge Runtime (middleware). Minimal config — no Node.js APIs.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'development',
  // Lower sample rate for edge — high volume
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.5,
});
