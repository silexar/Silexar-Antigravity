/**
 * SILEXAR PULSE - Cache Service
 * 
 * @description In-memory cache service with TTL, invalidation patterns,
 *              and optional Redis backend support.
 * 
 * @example
 * ```typescript
 * import { cacheService, CacheOptions } from '@/lib/cache/CacheService';
 * 
 * // Basic usage
 * const user = await cacheService.getOrSet(
 *   `user:${id}`,
 *   () => fetchUserFromDB(id),
 *   { ttl: 300 } // 5 minutes
 * );
 * 
 * // Invalidate on update
 * await cacheService.invalidate(`user:${id}`);
 * 
 * // Pattern invalidation
 * await cacheService.invalidatePattern('user:*');
 * 
 * // Delete
 * await cacheService.delete('user:123');
 * ```
 */

import { logger } from '@/lib/observability';
import { AppError } from '@/lib/errors';

// ═══════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export interface CacheOptions {
    ttl?: number;           // Time to live in seconds (default: 300)
    namespace?: string;     // Namespace prefix for keys
    compress?: boolean;     // Compress large values (default: false)
    maxSize?: number;       // Max entries in memory store (default: 1000)
}

export interface CacheEntry<T = unknown> {
    key: string;
    value: T;
    expiresAt: number;      // Unix timestamp
    hitCount: number;
    createdAt: number;
}

export interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    totalKeys: number;
    hitRate: number;
}

export interface CacheConfig {
    defaultTTL: number;
    maxMemory: number;
    redisUrl?: string;
    enableRedis: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// IN-MEMORY STORE
// ═══════════════════════════════════════════════════════════════════

class InMemoryCacheStore {
    private store: Map<string, CacheEntry> = new Map();
    private maxSize: number;
    private stats: CacheStats = { hits: 0, misses: 0, size: 0, totalKeys: 0, hitRate: 0 };

    constructor(maxSize = 1000) {
        this.maxSize = maxSize;

        // Periodic cleanup of expired entries
        if (typeof setInterval !== 'undefined') {
            setInterval(() => this.cleanup(), 60 * 1000); // Every minute
        }
    }

    private cleanup(): void {
        const now = Date.now();
        let expired = 0;

        for (const [key, entry] of this.store.entries()) {
            if (entry.expiresAt <= now) {
                this.store.delete(key);
                expired++;
            }
        }

        if (expired > 0) {
            logger.debug(`[Cache] Cleaned up ${expired} expired entries`);
        }
    }

    get<T>(key: string): T | null {
        const entry = this.store.get(key);

        if (!entry) {
            this.stats.misses++;
            this.updateHitRate();
            return null;
        }

        // Check expiration
        if (entry.expiresAt <= Date.now()) {
            this.store.delete(key);
            this.stats.misses++;
            this.updateHitRate();
            return null;
        }

        // Update hit count
        entry.hitCount++;
        this.stats.hits++;
        this.updateHitRate();

        return entry.value as T;
    }

    set<T>(key: string, value: T, ttlMs: number): void {
        // Evict if at capacity
        if (this.store.size >= this.maxSize && !this.store.has(key)) {
            this.evictLRU();
        }

        const entry: CacheEntry<T> = {
            key,
            value,
            expiresAt: Date.now() + ttlMs,
            hitCount: 0,
            createdAt: Date.now(),
        };

        this.store.set(key, entry as CacheEntry);
        this.stats.size = this.store.size;
    }

    delete(key: string): boolean {
        const deleted = this.store.delete(key);
        this.stats.size = this.store.size;
        return deleted;
    }

    invalidatePattern(pattern: string): number {
        const regex = this.patternToRegex(pattern);
        let invalidated = 0;

        for (const key of this.store.keys()) {
            if (regex.test(key)) {
                this.store.delete(key);
                invalidated++;
            }
        }

        this.stats.size = this.store.size;
        return invalidated;
    }

    clear(): void {
        this.store.clear();
        this.stats.size = 0;
        this.stats.totalKeys = 0;
    }

    private evictLRU(): void {
        // Find entry with lowest hit count and oldest
        let lruKey: string | null = null;
        let lruScore = Infinity;

        for (const [key, entry] of this.store.entries()) {
            const score = entry.hitCount / (Date.now() - entry.createdAt);
            if (score < lruScore) {
                lruScore = score;
                lruKey = key;
            }
        }

        if (lruKey) {
            this.store.delete(lruKey);
        }
    }

    private patternToRegex(pattern: string): RegExp {
        const escaped = pattern
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
            .replace(/\*/g, '.*');
        return new RegExp(`^${escaped}$`);
    }

    private updateHitRate(): void {
        const total = this.stats.hits + this.stats.misses;
        this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
    }

    getStats(): CacheStats {
        this.stats.totalKeys = this.store.size;
        return { ...this.stats };
    }

    keys(): string[] {
        return Array.from(this.store.keys());
    }

    has(key: string): boolean {
        const entry = this.store.get(key);
        if (!entry) return false;
        if (entry.expiresAt <= Date.now()) {
            this.store.delete(key);
            return false;
        }
        return true;
    }
}

// ═══════════════════════════════════════════════════════════════════
// CACHE SERVICE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════

export class CacheService {
    private store: InMemoryCacheStore;
    private defaultTTL: number;
    private namespace: string;
    private enableCompression: boolean;

    constructor(config: CacheConfig) {
        this.store = new InMemoryCacheStore(config.maxMemory);
        this.defaultTTL = config.defaultTTL;
        this.namespace = 'silexar';
        this.enableCompression = config.enableRedis || false;
    }

    /**
     * Build full cache key with namespace
     */
    private buildKey(key: string): string {
        return `${this.namespace}:${key}`;
    }

    /**
     * Get value from cache, or execute factory and cache result
     */
    async getOrSet<T>(
        key: string,
        factory: () => Promise<T>,
        options: CacheOptions = {}
    ): Promise<T> {
        const fullKey = this.buildKey(key);
        const ttl = (options.ttl ?? this.defaultTTL) * 1000; // Convert to ms

        // Try cache first
        const cached = this.store.get<T>(fullKey);
        if (cached !== null) {
            logger.debug(`[Cache] HIT: ${key}`);
            return cached;
        }

        logger.debug(`[Cache] MISS: ${key}`);

        // Execute factory
        const value = await factory();

        // Cache result
        this.store.set(fullKey, value, ttl);

        return value;
    }

    /**
     * Get value directly from cache
     */
    get<T>(key: string): T | null {
        return this.store.get<T>(this.buildKey(key));
    }

    /**
     * Set value in cache
     */
    set<T>(key: string, value: T, options: CacheOptions = {}): void {
        const fullKey = this.buildKey(key);
        const ttl = (options.ttl ?? this.defaultTTL) * 1000;
        this.store.set(fullKey, value, ttl);
    }

    /**
     * Delete specific key
     */
    delete(key: string): boolean {
        return this.store.delete(this.buildKey(key));
    }

    /**
     * Invalidate key(s) by pattern
     * @example cache.invalidatePattern('user:*')
     */
    invalidatePattern(pattern: string): number {
        const fullPattern = this.buildKey(pattern);
        return this.store.invalidatePattern(fullPattern);
    }

    /**
     * Invalidate single key
     */
    invalidate(key: string): void {
        this.store.delete(this.buildKey(key));
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.store.clear();
    }

    /**
     * Get cache statistics
     */
    getStats(): CacheStats {
        return this.store.getStats();
    }

    /**
     * Check if key exists (without affecting hit count)
     */
    has(key: string): boolean {
        return this.store.has(this.buildKey(key));
    }

    /**
     * Get all keys matching pattern
     */
    keys(pattern?: string): string[] {
        const fullPattern = pattern ? this.buildKey(pattern) : this.buildKey('*');
        const regex = new RegExp(`^${fullPattern.replace(/\*/g, '.*')}$`);
        return this.store.keys().filter(k => regex.test(k));
    }
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: CacheConfig = {
    defaultTTL: 300,         // 5 minutes
    maxMemory: 1000,          // 1000 entries
    enableRedis: false,       // In-memory only by default
    redisUrl: process.env.REDIS_URL,
};

let cacheServiceInstance: CacheService | null = null;

export function getCacheService(): CacheService {
    if (!cacheServiceInstance) {
        cacheServiceInstance = new CacheService(DEFAULT_CONFIG);
    }
    return cacheServiceInstance;
}

// Named export for convenience
export const cacheService = new CacheService(DEFAULT_CONFIG);

// ═══════════════════════════════════════════════════════════════════
// DECORATORS
// ═══════════════════════════════════════════════════════════════════

/**
 * Cache decorator for class methods
 * @example
 * ```typescript
 * class UserService {
 *   @Cacheable('user:{id}', { ttl: 300 })
 *   async getUser(id: string): Promise<User> {
 *     // DB call
 *   }
 * }
 * ```
 */
export function Cacheable(keyPattern: string, options: CacheOptions = {}) {
    return function <T>(
        target: unknown,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<(...args: unknown[]) => Promise<T>>
    ) {
        const originalMethod = descriptor.value;
        if (!originalMethod) return descriptor;

        descriptor.value = async function (...args: unknown[]): Promise<T> {
            // Build key from pattern and args
            const key = keyPattern.replace(/\{(\d+)\}/g, (_, index) => String(args[parseInt(index)]));
            const keyWithProperty = `${propertyKey}:${key}`;

            const service = getCacheService();

            return service.getOrSet(
                keyWithProperty,
                () => originalMethod.apply(this, args),
                options
            );
        };

        return descriptor;
    };
}

/**
 * Invalidate cache decorator for class methods
 * @example
 * ```typescript
 * class UserService {
 *   @CacheInvalidate('user:{id}')
 *   async updateUser(id: string, data: UpdateUserDTO): Promise<User> {
 *     // Update DB
 *   }
 * }
 * ```
 */
export function CacheInvalidate(keyPattern: string) {
    return function <T>(
        target: unknown,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<(...args: unknown[]) => Promise<T>>
    ) {
        const originalMethod = descriptor.value;
        if (!originalMethod) return descriptor;

        descriptor.value = async function (...args: unknown[]): Promise<T> {
            // Build key from pattern and args
            const key = keyPattern.replace(/\{(\d+)\}/g, (_, index) => String(args[parseInt(index)]));
            const keyWithProperty = `${propertyKey}:${key}`;

            const service = getCacheService();

            // Execute method first
            const result = await originalMethod.apply(this, args);

            // Then invalidate
            service.invalidate(keyWithProperty);

            return result;
        };

        return descriptor;
    };
}