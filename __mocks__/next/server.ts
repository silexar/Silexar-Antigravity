// Minimal mock for next/server to run API route tests in Jest

class MockHeaders {
  private map = new Map<string, string>()
  constructor(init?: Record<string, string>) {
    if (init) {
      for (const k of Object.keys(init)) this.map.set(k.toLowerCase(), String(init[k]))
    }
  }
  get(name: string): string | null {
    return this.map.get(name.toLowerCase()) ?? null
  }
  set(name: string, value: string) {
    this.map.set(name.toLowerCase(), String(value))
  }
}

export class NextRequest {
  public headers: MockHeaders
  constructor(public url: string, init?: { headers?: Record<string, string> }) {
    this.headers = new MockHeaders(init?.headers)
  }
}

export const NextResponse = {
  json(body: any, opts?: { status?: number; headers?: Record<string, string> }) {
    return {
      status: opts?.status ?? 200,
      headers: opts?.headers ?? {},
      async json() {
        return body
      },
    } as any
  },
}

