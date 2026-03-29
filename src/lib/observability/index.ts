/**
 * Silexar Pulse - Observability Setup
 * Structured logging + request tracing for Next.js API routes
 *
 * In production, connect to:
 * - Sentry for error tracking (already in deps as @sentry/nextjs)
 * - OpenTelemetry for distributed tracing
 * - Datadog/Grafana for metrics
 */

// ─── Structured Logger ───────────────────────────────────────

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  requestId?: string
  userId?: string
  tenantId?: string
  duration?: number
  metadata?: Record<string, unknown>
}

function createLogEntry(
  level: LogLevel,
  message: string,
  metadata?: Record<string, unknown>
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...metadata,
  } as LogEntry
}

function emit(entry: LogEntry): void {
  // In production, this would send to a log aggregator (Datadog, CloudWatch, etc.)
  // For now, structured JSON to stdout (compatible with most log parsers)
  const output = JSON.stringify(entry)

  switch (entry.level) {
    case 'error':
      console.error(output)
      break
    case 'warn':
      console.warn(output)
      break
    case 'debug':
      if (process.env.NODE_ENV === 'development') console.debug(output)
      break
    default:
      console.log(output)
  }
}

export const logger = {
  debug: (message: string, metadata?: Record<string, unknown>) =>
    emit(createLogEntry('debug', message, metadata)),
  info: (message: string, metadata?: Record<string, unknown>) =>
    emit(createLogEntry('info', message, metadata)),
  warn: (message: string, metadata?: Record<string, unknown>) =>
    emit(createLogEntry('warn', message, metadata)),
  error: (message: string, error?: Error, metadata?: Record<string, unknown>) =>
    emit(
      createLogEntry('error', message, {
        ...metadata,
        errorName: error?.name,
        errorMessage: error?.message,
        errorStack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      })
    ),
}

// ─── Request Tracing ─────────────────────────────────────────

export function traceRequest(
  request: Request,
  handler: () => Promise<Response>
): Promise<Response> {
  const start = performance.now()
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()
  const method = request.method
  const url = new URL(request.url).pathname

  return handler()
    .then((response) => {
      const duration = Math.round(performance.now() - start)
      logger.info(`${method} ${url} ${response.status}`, {
        requestId,
        duration,
        status: response.status,
        userId: request.headers.get('x-silexar-user-id') || undefined,
        tenantId: request.headers.get('x-silexar-tenant-id') || undefined,
      } as Record<string, unknown>)
      return response
    })
    .catch((error) => {
      const duration = Math.round(performance.now() - start)
      logger.error(`${method} ${url} FAILED`, error as Error, {
        requestId,
        duration,
        userId: request.headers.get('x-silexar-user-id') || undefined,
      })
      throw error
    })
}

// ─── Sentry Integration ──────────────────────────────────────

export function initSentry(): void {
  // @sentry/nextjs is already in dependencies
  // Sentry auto-initializes via sentry.client.config.ts and sentry.server.config.ts
  // This function is a placeholder for explicit initialization if needed
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    logger.info('Sentry DSN configured', {
      environment: process.env.NODE_ENV,
    })
  } else {
    logger.warn('Sentry DSN not configured — error tracking disabled')
  }
}
