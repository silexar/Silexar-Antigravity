/**
 * SILEXAR PULSE - Infrastructure Services
 * 
 * @description Unified export for all infrastructure services:
 *              Cache, Transactions, Locking, and Middleware
 * 
 * Usage:
 * import { cacheService, withTransaction, distributedLock } from '@/lib/infrastructure';
 */

export * from '../cache';
export * from '../db';
export * from '../lock';
export * from '../middleware';

// ═══════════════════════════════════════════════════════════════════
// CONVENIENCE RE-EXPORTS FOR COMMON PATTERNS
// ═══════════════════════════════════════════════════════════════════

// Cache
export { cacheService, getCacheService, Cacheable, CacheInvalidate } from '../cache';

// Transactions
export { withTransaction, batchTransaction, transactionManager } from '../db';

// Locking
export { distributedLock, lock, withLock } from '../lock';

// Middleware
export {
    extractAuthContext,
    requireAuth,
    authorize,
    requirePermission,
    validateBody,
    validateQuery,
    createValidator,
    requestLogger,
    rateLimit,
    RateLimitTier,
    compose,
    crudMiddleware,
} from '../middleware';