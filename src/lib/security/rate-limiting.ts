/**
 * 🛡️ SILEXAR PULSE QUANTUM - RATE LIMITING SYSTEM
 *
 * In-memory rate limiter with named config profiles (.checkRateLimit / .addConfig /
 * .getStatistics / .clearRateLimit).  Used by security-tests.ts and
 * validate-sprint1-security.ts for testing named config profiles.
 *
 * DIFFERENT FROM rate-limiter.ts — that file is the production-grade Redis sliding-window
 * limiter (authRateLimiter / apiRateLimiter / cortexRateLimiter).
 * This file intentionally kept separate because its API surface is incompatible.
 *
 * @version 2040.1.0
 * @classification TIER 0 - SECURITY FOUNDATION
 */

import { qualityLogger } from '../quality/quality-logger';

// 🎯 Rate Limit Configuration
interface RateLimitConfig {
  windowMs: number;        // Ventana de tiempo en ms
  maxRequests: number;     // Máximo número de requests
  keyGenerator?: (req: unknown) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
  statusCode?: number;
}

// 📊 Rate Limit Status
interface RateLimitStatus {
  limit: number;
  remaining: number;
  resetTime: Date;
  blocked: boolean;
}

// 🔧 Rate Limit Store (Redis simulation)
class RateLimitStore {
  private store: Map<string, { count: number; resetTime: number }>;

  constructor() {
    this.store = new Map();
    
    // Cleanup expired entries every minute
    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() > entry.resetTime) {
      this.store.delete(key);
      return null;
    }
    
    return entry;
  }

  async set(key: string, count: number, resetTime: number): Promise<void> {
    this.store.set(key, { count, resetTime });
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const existing = await this.get(key);
    
    if (existing) {
      existing.count++;
      this.store.set(key, existing);
      return existing;
    } else {
      const resetTime = Date.now() + windowMs;
      const entry = { count: 1, resetTime };
      this.store.set(key, entry);
      return entry;
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * 🛡️ Rate Limiter Class
 */
export class RateLimiter {
  private store: RateLimitStore;
  private configs: Map<string, RateLimitConfig>;

  constructor() {
    this.store = new RateLimitStore();
    this.configs = new Map();
    
    // Default configurations
    this.setupDefaultConfigs();

    qualityLogger.info('Rate Limiter initialized', 'RATE_LIMITER', {
      defaultConfigs: Array.from(this.configs.keys())
    });
  }

  /**
   * 🔧 Setup Default Rate Limit Configurations
   */
  private setupDefaultConfigs(): void {
    // API General
    this.configs.set('api-general', {
      windowMs: 15 * 60 * 1000, // 15 minutos
      maxRequests: 1000,
      message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos',
      statusCode: 429
    });

    // API Authentication
    this.configs.set('api-auth', {
      windowMs: 15 * 60 * 1000, // 15 minutos
      maxRequests: 5,
      message: 'Demasiados intentos de login, intenta de nuevo en 15 minutos',
      statusCode: 429,
      skipSuccessfulRequests: true
    });

    // API Admin
    this.configs.set('api-admin', {
      windowMs: 5 * 60 * 1000, // 5 minutos
      maxRequests: 100,
      message: 'Límite de API admin excedido, intenta de nuevo en 5 minutos',
      statusCode: 429
    });

    // API Upload
    this.configs.set('api-upload', {
      windowMs: 60 * 60 * 1000, // 1 hora
      maxRequests: 50,
      message: 'Límite de uploads excedido, intenta de nuevo en 1 hora',
      statusCode: 429
    });

    // API Search
    this.configs.set('api-search', {
      windowMs: 1 * 60 * 1000, // 1 minuto
      maxRequests: 30,
      message: 'Demasiadas búsquedas, intenta de nuevo en 1 minuto',
      statusCode: 429
    });
  }

  /**
   * 🎯 Check Rate Limit
   * @param identifier - Unique identifier (IP, user ID, etc.)
   * @param configName - Configuration name to use
   * @returns Rate limit status
   */
  async checkRateLimit(identifier: string, configName: string = 'api-general'): Promise<RateLimitStatus> {
    const config = this.configs.get(configName);
    if (!config) {
      throw new Error(`Rate limit configuration '${configName}' not found`);
    }

    const key = `${configName}:${identifier}`;
    const entry = await this.store.increment(key, config.windowMs);

    const status: RateLimitStatus = {
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: new Date(entry.resetTime),
      blocked: entry.count > config.maxRequests
    };

    // Log rate limit events
    if (status.blocked) {
      qualityLogger.warn(`Rate limit exceeded for ${identifier}`, 'RATE_LIMITER', {
        identifier,
        configName,
        count: entry.count,
        limit: config.maxRequests,
        resetTime: status.resetTime
      });
    }

    return status;
  }

  /**
   * 🚫 Block Request if Rate Limited
   * @param identifier - Unique identifier
   * @param configName - Configuration name
   * @returns True if blocked, false if allowed
   */
  async isBlocked(identifier: string, configName: string = 'api-general'): Promise<boolean> {
    const status = await this.checkRateLimit(identifier, configName);
    return status.blocked;
  }

  /**
   * ⚙️ Add Custom Rate Limit Configuration
   * @param name - Configuration name
   * @param config - Rate limit configuration
   */
  addConfig(name: string, config: RateLimitConfig): void {
    this.configs.set(name, config);
    
    qualityLogger.info(`Rate limit configuration added: ${name}`, 'RATE_LIMITER', {
      name,
      windowMs: config.windowMs,
      maxRequests: config.maxRequests
    });
  }

  /**
   * 📊 Get Rate Limit Statistics
   * @param configName - Configuration name (optional)
   * @returns Statistics
   */
  getStatistics(configName?: string): {
    totalConfigs: number;
    activeKeys: number;
    configStats?: {
      name: string;
      windowMs: number;
      maxRequests: number;
    }[];
  } {
    const stats = {
      totalConfigs: this.configs.size,
      activeKeys: this.store['store'].size,
    };

    if (configName) {
      const config = this.configs.get(configName);
      if (config) {
        return {
          ...stats,
          configStats: [{
            name: configName,
            windowMs: config.windowMs,
            maxRequests: config.maxRequests
          }]
        };
      }
    }

    return {
      ...stats,
      configStats: Array.from(this.configs.entries()).map(([name, config]) => ({
        name,
        windowMs: config.windowMs,
        maxRequests: config.maxRequests
      }))
    };
  }

  /**
   * 🧹 Clear Rate Limits for Identifier
   * @param identifier - Identifier to clear
   * @param configName - Configuration name (optional)
   */
  async clearRateLimit(identifier: string, configName?: string): Promise<void> {
    if (configName) {
      const key = `${configName}:${identifier}`;
      this.store['store'].delete(key);
    } else {
      // Clear all configs for this identifier
      for (const config of this.configs.keys()) {
        const key = `${config}:${identifier}`;
        this.store['store'].delete(key);
      }
    }

    qualityLogger.info(`Rate limits cleared for ${identifier}`, 'RATE_LIMITER', {
      identifier,
      configName: configName || 'all'
    });
  }
}

// 🛡️ Global Rate Limiter Instance
export const rateLimiter = new RateLimiter();

// 🔧 Utility Functions
export function createRateLimiter(): RateLimiter {
  return new RateLimiter();
}

export async function checkApiRateLimit(identifier: string): Promise<RateLimitStatus> {
  return rateLimiter.checkRateLimit(identifier, 'api-general');
}

export async function checkAuthRateLimit(identifier: string): Promise<RateLimitStatus> {
  return rateLimiter.checkRateLimit(identifier, 'api-auth');
}

export async function checkAdminRateLimit(identifier: string): Promise<RateLimitStatus> {
  return rateLimiter.checkRateLimit(identifier, 'api-admin');
}

// 🎯 Express Middleware (for Next.js API routes)
export function createRateLimitMiddleware(configName: string = 'api-general') {
  return async (req: Record<string, unknown>, res: Record<string, unknown> & { setHeader: (name: string, value: string | number) => void; status: (code: number) => { json: (body: Record<string, unknown>) => void } }, next: () => void) => {
    try {
      // Get identifier (IP address or user ID)
      const connection = req.connection as Record<string, unknown> | undefined
      const headers = req.headers as Record<string, unknown> | undefined
      const forwarded = headers?.['x-forwarded-for'] as string | undefined
      const identifier = (req.ip as string) ||
                        (connection?.remoteAddress as string) ||
                        forwarded?.split(',')[0] ||
                        'unknown';

      const status = await rateLimiter.checkRateLimit(identifier, configName);

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', status.limit);
      res.setHeader('X-RateLimit-Remaining', status.remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(status.resetTime.getTime() / 1000));

      if (status.blocked) {
        const config = rateLimiter['configs'].get(configName);
        return res.status(config?.statusCode || 429).json({
          error: 'Rate limit exceeded',
          message: config?.message || 'Too many requests',
          retryAfter: Math.ceil((status.resetTime.getTime() - Date.now()) / 1000)
        });
      }

      next();
    } catch (error) {
      qualityLogger.error('Rate limit middleware error', 'RATE_LIMITER', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(); // Continue on error to avoid blocking legitimate requests
    }
  };
}