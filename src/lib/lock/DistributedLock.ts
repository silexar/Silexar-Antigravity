/**
 * SILEXAR PULSE - Distributed Lock Service
 * 
 * @description In-memory distributed lock implementation for coordination
 *              across async operations. For production, replace with Redis
 *              or database-based locking.
 * 
 * @example
 * ```typescript
 * import { distributedLock, LockOptions } from '@/lib/lock/DistributedLock';
 * 
 * // Simple lock
 * const release = await distributedLock.acquire('job:123');
 * try {
 *   // Critical section
 *   await processJob();
 * } finally {
 *   await release();
 * }
 * 
 * // With timeout and retry
 * const lock = await distributedLock.acquire('critical-operation', {
 *   ttl: 5000,
 *   retryAttempts: 3,
 *   retryDelay: 100,
 * });
 * 
 * // Execute with lock
 * await distributedLock.execute('job:123', async () => {
 *   return await processJob();
 * }, { ttl: 30000 });
 * ```
 */

import { logger } from '@/lib/observability';
import { AppError } from '@/lib/errors';

// ═══════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export interface LockOptions {
    ttl?: number;              // Lock TTL in ms (default: 30000)
    retryAttempts?: number;    // Max acquisition retries (default: 3)
    retryDelay?: number;       // Delay between retries in ms (default: 100)
    onAcquired?: () => void;
    onReleased?: () => void;
    onFailed?: (error: Error) => void;
}

export interface Lock {
    key: string;
    token: string;             // Unique token for release validation
    acquiredAt: number;
    expiresAt: number;
    release(): Promise<boolean>;
}

export interface LockResult {
    success: boolean;
    lock?: Lock;
    error?: Error;
    attempts: number;
}

// Default options
const DEFAULT_OPTIONS: Required<LockOptions> = {
    ttl: 30000,
    retryAttempts: 3,
    retryDelay: 100,
    onAcquired: () => { },
    onReleased: () => { },
    onFailed: () => { },
};

// ═══════════════════════════════════════════════════════════════════
// LOCK STORE
// ═══════════════════════════════════════════════════════════════════

interface LockEntry {
    key: string;
    token: string;
    acquiredAt: number;
    expiresAt: number;
    timer?: NodeJS.Timeout;
}

class InMemoryLockStore {
    private locks: Map<string, LockEntry> = new Map();
    private cleanupInterval: NodeJS.Timeout;

    constructor() {
        // Periodic cleanup of expired locks
        this.cleanupInterval = setInterval(() => this.cleanup(), 10000);
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.locks.entries()) {
            if (entry.expiresAt <= now) {
                this.releaseLock(key, entry.token);
            }
        }
    }

    /**
     * Try to acquire a lock
     */
    tryAcquire(key: string, token: string, ttlMs: number): boolean {
        const existing = this.locks.get(key);

        // Check if lock exists and is still valid
        if (existing && existing.expiresAt > Date.now()) {
            return false; // Lock is held by someone else
        }

        // Clean up existing expired entry
        if (existing) {
            this.clearLock(key);
        }

        // Create new lock
        const entry: LockEntry = {
            key,
            token,
            acquiredAt: Date.now(),
            expiresAt: Date.now() + ttlMs,
        };

        // Auto-release after TTL
        entry.timer = setTimeout(() => {
            this.releaseLock(key, token);
        }, ttlMs);

        this.locks.set(key, entry);
        return true;
    }

    /**
     * Release a lock if token matches
     */
    releaseLock(key: string, token: string): boolean {
        const entry = this.locks.get(key);

        if (!entry) {
            return false;
        }

        // Validate token
        if (entry.token !== token) {
            logger.warn('[Lock] Token mismatch, cannot release', { key });
            return false;
        }

        // Clear and remove
        this.clearLock(key);
        return true;
    }

    private clearLock(key: string): void {
        const entry = this.locks.get(key);
        if (entry?.timer) {
            clearTimeout(entry.timer);
        }
        this.locks.delete(key);
    }

    /**
     * Check if lock is held
     */
    isLocked(key: string): boolean {
        const entry = this.locks.get(key);
        if (!entry) return false;
        return entry.expiresAt > Date.now();
    }

    /**
     * Get lock info
     */
    getLockInfo(key: string): { held: boolean; remainingMs: number; token: string } | null {
        const entry = this.locks.get(key);
        if (!entry) return null;

        const remainingMs = entry.expiresAt - Date.now();
        if (remainingMs <= 0) {
            this.clearLock(key);
            return null;
        }

        return {
            held: true,
            remainingMs,
            token: entry.token,
        };
    }

    /**
     * Force release (for admin/debugging)
     */
    forceRelease(key: string): boolean {
        if (!this.locks.has(key)) return false;
        this.clearLock(key);
        return true;
    }

    /**
     * Get all active locks
     */
    getActiveLocks(): Array<{ key: string; remainingMs: number }> {
        const now = Date.now();
        const active: Array<{ key: string; remainingMs: number }> = [];

        for (const [key, entry] of this.locks.entries()) {
            if (entry.expiresAt > now) {
                active.push({ key, remainingMs: entry.expiresAt - now });
            } else {
                this.clearLock(key);
            }
        }

        return active;
    }

    destroy(): void {
        clearInterval(this.cleanupInterval);
        this.locks.clear();
    }
}

// Singleton store
const lockStore = new InMemoryLockStore();

// ═══════════════════════════════════════════════════════════════════
// LOCK IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════

function generateToken(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

class DistributedLockImpl {
    /**
     * Acquire a lock with retry logic
     */
    async acquire(key: string, options: LockOptions = {}): Promise<Lock> {
        const opts = { ...DEFAULT_OPTIONS, ...options };
        const token = generateToken();
        let attempts = 0;

        while (attempts < opts.retryAttempts) {
            attempts++;

            const acquired = lockStore.tryAcquire(key, token, opts.ttl);

            if (acquired) {
                logger.debug(`[Lock] Acquired: ${key}`, { token, attempts });

                opts.onAcquired();

                return {
                    key,
                    token,
                    acquiredAt: Date.now(),
                    expiresAt: Date.now() + opts.ttl,
                    release: async () => this.release(key, token, opts.onReleased),
                };
            }

            // Wait before retry
            if (attempts < opts.retryAttempts) {
                await this.sleep(opts.retryDelay);
            }
        }

        const error = new Error(`Failed to acquire lock: ${key} after ${attempts} attempts`);
        logger.error('[Lock] Acquisition failed', { key, attempts });
        opts.onFailed(error);
        throw error;
    }

    /**
     * Try to acquire lock without retry
     */
    async tryAcquire(key: string, options: LockOptions = {}): Promise<Lock | null> {
        const opts = { ...DEFAULT_OPTIONS, ...options };
        const token = generateToken();

        const acquired = lockStore.tryAcquire(key, token, opts.ttl);

        if (!acquired) {
            return null;
        }

        logger.debug(`[Lock] Acquired (non-blocking): ${key}`, { token });

        return {
            key,
            token,
            acquiredAt: Date.now(),
            expiresAt: Date.now() + opts.ttl,
            release: async () => this.release(key, token, opts.onReleased),
        };
    }

    /**
     * Release a lock by key and token
     */
    async release(key: string, token: string, onReleased?: () => void): Promise<boolean> {
        const released = lockStore.releaseLock(key, token);

        if (released) {
            logger.debug(`[Lock] Released: ${key}`, { token });
            (onReleased || DEFAULT_OPTIONS.onReleased)();
        } else {
            logger.warn(`[Lock] Release failed (token mismatch or already released): ${key}`, { token });
        }

        return released;
    }

    /**
     * Check if key is locked
     */
    isLocked(key: string): boolean {
        return lockStore.isLocked(key);
    }

    /**
     * Get lock info
     */
    getLockInfo(key: string): { held: boolean; remainingMs: number; token: string } | null {
        return lockStore.getLockInfo(key);
    }

    /**
     * Execute operation with lock
     */
    async execute<T>(
        key: string,
        operation: () => Promise<T>,
        options: LockOptions = {}
    ): Promise<T> {
        const lock = await this.acquire(key, options);

        try {
            return await operation();
        } finally {
            await lock.release();
        }
    }

    /**
     * Execute with try-lock (returns null if lock not available)
     */
    async tryExecute<T>(
        key: string,
        operation: () => Promise<T>,
        options: LockOptions = {}
    ): Promise<{ success: boolean; result?: T; error?: Error }> {
        const lock = await this.tryAcquire(key, options);

        if (!lock) {
            return { success: false, error: new Error('Lock not available') };
        }

        try {
            const result = await operation();
            return { success: true, result };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
        } finally {
            await lock.release();
        }
    }

    /**
     * Force release (use with caution)
     */
    forceRelease(key: string): boolean {
        return lockStore.forceRelease(key);
    }

    /**
     * Get all active locks
     */
    getActiveLocks(): Array<{ key: string; remainingMs: number }> {
        return lockStore.getActiveLocks();
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════

export const distributedLock = new DistributedLockImpl();

// Alias for convenience
export const lock = distributedLock;

// ═══════════════════════════════════════════════════════════════════
// DECORATOR
// ═══════════════════════════════════════════════════════════════════

/**
 * Decorator to ensure method runs with lock
 */
export function withLock(lockKey: string, options: LockOptions = {}) {
    return function <T>(
        target: unknown,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<(...args: unknown[]) => Promise<T>>
    ) {
        const originalMethod = descriptor.value;
        if (!originalMethod) return descriptor;

        descriptor.value = async function (...args: unknown[]): Promise<T> {
            const lockInstance = new DistributedLockImpl();
            return lockInstance.execute(
                lockKey,
                () => originalMethod.apply(this, args),
                options
            );
        };

        return descriptor;
    };
}

// ═══════════════════════════════════════════════════════════════════
// LOCK ERROR
// ═══════════════════════════════════════════════════════════════════

export class LockError extends AppError {
    constructor(message: string, code: 'ACQUISITION_FAILED' | 'RELEASE_FAILED' | 'TIMEOUT') {
        super(message, code, 409);
    }
}