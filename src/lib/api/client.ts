/**
 * Silexar Pulse — Centralized API Client
 *
 * Usage (from any Client Component):
 *   const { data, error } = await apiClient.get<Campana[]>('/api/campanas')
 *   const { data } = await apiClient.post('/api/campanas', { nombre: '...' })
 *
 * Features:
 *  - Automatic JSON handling
 *  - Auth cookie forwarded automatically (credentials: 'include')
 *  - Consistent error shape: { code, message, details? }
 *  - Typed response wrapper: ApiResult<T>
 *  - Retry on 401 → refresh token → retry once
 *  - Abort signal support for cancellable requests
 */

// ─── Types ───────────────────────────────────────────────────

export interface ApiMeta {
  total?: number
  page?: number
  limit?: number
  hasMore?: boolean
  [key: string]: unknown
}

export interface ApiResult<T = unknown> {
  data: T | null
  meta?: ApiMeta
  error: ApiError | null
  status: number
}

export interface ApiError {
  code: string
  message: string
  details?: unknown
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  params?: Record<string, string | number | boolean | undefined | null>
  signal?: AbortSignal
}

// ─── Helpers ─────────────────────────────────────────────────

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const base = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')
  const url = new URL(path, base.endsWith('/') ? base : base + '/')

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v))
      }
    }
  }

  // Fix: URL constructor adds trailing slash to base — normalize
  return url.pathname + url.search
}

async function parseResponse<T>(res: Response): Promise<ApiResult<T>> {
  let json: { success?: boolean; data?: T; meta?: ApiMeta; error?: string; code?: string; details?: unknown; message?: string } | null = null

  try {
    json = await res.json()
  } catch {
    // Non-JSON response (204, etc.)
    if (res.ok) return { data: null, error: null, status: res.status }
    return {
      data: null,
      error: { code: 'PARSE_ERROR', message: 'Response is not valid JSON' },
      status: res.status,
    }
  }

  if (res.ok && json?.success !== false) {
    return {
      data: (json?.data ?? json) as T,
      meta: json?.meta,
      error: null,
      status: res.status,
    }
  }

  return {
    data: null,
    error: {
      code: json?.code ?? String(res.status),
      message: json?.error ?? json?.message ?? res.statusText,
      details: json?.details,
    },
    status: res.status,
  }
}

// ─── Core fetch wrapper ───────────────────────────────────────

let _refreshing = false
let _refreshPromise: Promise<boolean> | null = null

async function refreshTokenOnce(): Promise<boolean> {
  if (_refreshing && _refreshPromise) return _refreshPromise

  _refreshing = true
  _refreshPromise = fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  }).then(r => r.ok).finally(() => {
    _refreshing = false
    _refreshPromise = null
  })

  return _refreshPromise
}

async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {},
  retry = true,
): Promise<ApiResult<T>> {
  const { body, params, signal, headers: extraHeaders, ...rest } = options

  const url = buildUrl(path, params)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(extraHeaders as Record<string, string> ?? {}),
  }

  const res = await fetch(url, {
    method,
    credentials: 'include',   // sends auth cookie automatically
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
    ...rest,
  })

  // 401 → attempt token refresh, then retry once
  if (res.status === 401 && retry) {
    const refreshed = await refreshTokenOnce()
    if (refreshed) return request<T>(method, path, options, false)
  }

  return parseResponse<T>(res)
}

// ─── Public API ───────────────────────────────────────────────

export const apiClient = {
  get<T>(path: string, options?: RequestOptions) {
    return request<T>('GET', path, options)
  },

  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>('POST', path, { ...options, body })
  },

  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>('PUT', path, { ...options, body })
  },

  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>('PATCH', path, { ...options, body })
  },

  delete<T>(path: string, options?: RequestOptions) {
    return request<T>('DELETE', path, options)
  },
}

export default apiClient
