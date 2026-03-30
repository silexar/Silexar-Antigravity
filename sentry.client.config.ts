/**
 * Silexar Pulse — Sentry Client Configuration
 * Runs in the browser. Captures client-side errors, performance, and user sessions.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV ?? 'development',
  release: process.env.NEXT_PUBLIC_APP_VERSION,

  // Performance — trace 10% of requests in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session replay — capture 1% of sessions, 100% of sessions with errors
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      // Mask all text and inputs for privacy (GDPR)
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Filter out noise
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
    // Network errors
    'NetworkError',
    'Failed to fetch',
    'Load failed',
    // Cancelled requests
    'AbortError',
  ],

  // Don't send PII to Sentry
  beforeSend(event) {
    // Remove sensitive query params from request URL
    if (event.request?.url) {
      try {
        const url = new URL(event.request.url);
        url.searchParams.delete('token');
        url.searchParams.delete('apiKey');
        event.request.url = url.toString();
      } catch {
        // ignore
      }
    }
    return event;
  },
});
