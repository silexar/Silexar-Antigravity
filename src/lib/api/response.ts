/**
 * Silexar Pulse - Standardized API Response Helpers
 */

import { NextResponse } from 'next/server'

interface ApiSuccessResponse<T> {
  success: true
  data: T
  meta?: Record<string, unknown>
}

interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export function apiSuccess<T>(data: T, status = 200, meta?: Record<string, unknown>) {
  const body: ApiSuccessResponse<T> = { success: true, data }
  if (meta) body.meta = meta
  return NextResponse.json(body, { status })
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  details?: unknown
) {
  const body: ApiErrorResponse = {
    success: false,
    error: { code, message },
  }
  if (details) body.error.details = details
  return NextResponse.json(body, { status })
}

export function apiUnauthorized(message = 'Authentication required') {
  return apiError('UNAUTHORIZED', message, 401)
}

export function apiForbidden(message = 'Insufficient permissions') {
  return apiError('FORBIDDEN', message, 403)
}

export function apiNotFound(resource = 'Resource') {
  return apiError('NOT_FOUND', `${resource} not found`, 404)
}

export function apiValidationError(details: unknown) {
  return apiError('VALIDATION_ERROR', 'Invalid request data', 422, details)
}

export function apiServerError(message = 'Internal server error') {
  return apiError('INTERNAL_ERROR', message, 500)
}

/**
 * Extract authenticated user context from middleware-injected headers.
 * All values are strings — empty string means not present (never null/undefined).
 *
 * Headers injected by middleware.ts:
 *   X-Silexar-User-Id, X-Silexar-User-Role, X-Silexar-Tenant-Id,
 *   X-Silexar-Tenant-Slug, X-Silexar-Session-Id, X-Silexar-JTI,
 *   X-Request-Id, X-Silexar-Impersonation
 */
export function getUserContext(request: Request) {
  return {
    userId:          request.headers.get('x-silexar-user-id')     || '',
    role:            request.headers.get('x-silexar-user-role')   || '',
    tenantId:        request.headers.get('x-silexar-tenant-id')   || '',
    tenantSlug:      request.headers.get('x-silexar-tenant-slug') || '',
    sessionId:       request.headers.get('x-silexar-session-id')  || '',
    /** JWT unique token ID — used to check session blacklist in withApiRoute */
    jti:             request.headers.get('x-silexar-jti')         || '',
    requestId:       request.headers.get('x-request-id')          || '',
    isImpersonating: request.headers.get('x-silexar-impersonation') === 'true',
  }
}

/** Convenience type for the context returned by getUserContext */
export type UserContext = ReturnType<typeof getUserContext>
