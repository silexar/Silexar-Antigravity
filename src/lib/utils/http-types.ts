/**
 * Minimal HTTP request/response interfaces for Express-style controllers.
 * Used in DDD presentation/controllers that are NOT Next.js route handlers.
 */

export interface HttpRequest {
  body: Record<string, unknown>
  params?: Record<string, string>
  query?: Record<string, string>
  headers?: Record<string, string>
  user?: { id: string; tenantId: string; role: string }
}

export interface HttpResponse {
  status: (code: number) => HttpResponse
  json: (data: unknown) => void
  send: (data: unknown) => void
}
