import { logger } from '@/lib/observability';
/**
 * Performance utilities for Next.js handlers (framework-agnostic)
 */

export interface RequestLike { path?: string; method?: string; user?: Record<string, unknown> }
export interface ResponseLike { setHeader?: (k: string, v: string) => void; statusCode?: number }

export function monitorPerformance(handlerName = 'handler') {
  return async (fn: () => Promise<unknown>, req: RequestLike, res?: ResponseLike) => {
    const start = process.hrtime.bigint();
    const startMem = process.memoryUsage();
    try {
      const result = await fn();
      return result;
    } finally {
      const end = process.hrtime.bigint();
      const endMem = process.memoryUsage();
      const durationMs = Number(end - start) / 1_000_000;
      const memDeltaKb = Math.round((endMem.heapUsed - startMem.heapUsed) / 1024);
      if (res?.setHeader) {
        res.setHeader('X-Response-Time', `${durationMs.toFixed(2)}ms`);
        res.setHeader('X-Memory-Delta', `${memDeltaKb}KB`);
      }
      // Optionally log slow requests
      if (durationMs > 5000) {
        logger.warn('Request lento detectado', { handlerName, durationMs, path: req.path, method: req.method });
      }
    }
  };
}

