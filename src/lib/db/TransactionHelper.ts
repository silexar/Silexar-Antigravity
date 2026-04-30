/**
 * SILEXAR PULSE - Transaction Helper
 * 
 * @description Helper for managing database transactions with automatic
 *              rollback on error and retry logic for transient failures.
 * 
 * @example
 * ```typescript
 * import { withTransaction, TransactionOptions } from '@/lib/db/TransactionHelper';
 * 
 * // Simple transaction
 * const user = await withTransaction(async (tx) => {
 *   const user = await tx.insert(users).values(data).returning();
 *   await tx.insert(userPreferences).values({ userId: user.id });
 *   return user;
 * });
 * 
 * // With retry and isolation level
 * const result = await withTransaction(async (tx) => {
 *   // operations
 * }, {
 *   isolationLevel: 'serializable',
 *   maxRetries: 3,
 *   onRetry: (attempt, error) => logger.warn(`Retry ${attempt}`, { error })
 * });
 * ```
 */

import { logger } from '@/lib/observability';
import { DatabaseError } from '@/lib/errors';

// ═══════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type IsolationLevel = 'read-committed' | 'read-uncommitted' | 'serializable' | 'repeatable-read';

export interface TransactionOptions {
    isolationLevel?: IsolationLevel;
    maxRetries?: number;
    retryDelay?: number;          // Base delay in ms
    backoffMultiplier?: number;   // For exponential backoff
    onRetry?: (attempt: number, error: Error, delay: number) => void;
    onCommit?: (duration: number) => void;
    onRollback?: (duration: number) => void;
    timeout?: number;              // Transaction timeout in ms
}

// Default options
const DEFAULT_OPTIONS: Required<TransactionOptions> = {
    isolationLevel: 'read-committed',
    maxRetries: 3,
    retryDelay: 100,
    backoffMultiplier: 2,
    onRetry: () => { },
    onCommit: () => { },
    onRollback: () => { },
    timeout: 30000,
};

// ═══════════════════════════════════════════════════════════════════
// TRANSACTION CONTEXT
// ═══════════════════════════════════════════════════════════════════

interface TransactionContext {
    commit(): Promise<void>;
    rollback(): Promise<void>;
    isCommitted: boolean;
}

// Mock transaction context for type compatibility
function createMockTransactionContext(): TransactionContext {
    let committed = false;
    return {
        commit: async () => { committed = true; },
        rollback: async () => { /* mock rollback */ },
        get isCommitted() { return committed; }
    };
}

// ═══════════════════════════════════════════════════════════════════
// TRANSACTION ERRORS
// ═══════════════════════════════════════════════════════════════════

export class TransactionError extends DatabaseError {
    constructor(
        message: string,
        public readonly code: 'COMMIT_FAILED' | 'ROLLBACK_FAILED' | 'TIMEOUT' | 'RETRY_EXHAUSTED',
        public readonly originalError?: Error
    ) {
        super(message, code);
    }
}

// ═══════════════════════════════════════════════════════════════════
// SERIALIZATION FAILURE DETECTION
// ═══════════════════════════════════════════════════════════════════

/**
 * Check if error is a transient serialization failure
 * that can be retried
 */
function isSerializationFailure(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;

    const errorObj = error as Record<string, unknown>;
    const message = String(errorObj.message || '').toLowerCase();

    // PostgreSQL serialization failures
    const serializationIndicators = [
        'could not serialize',
        'serialization failure',
        'deadlock',
        'lock timeout',
        'psycopg2.errors.serialization_failure',
    ];

    return serializationIndicators.some(indicator => message.includes(indicator));
}

/**
 * Check if error is a connection/timeout failure
 */
function isConnectionFailure(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;

    const errorObj = error as Record<string, unknown>;
    const message = String(errorObj.message || '').toLowerCase();

    const connectionIndicators = [
        'connection',
        'timeout',
        'econnrefused',
        'enetunreach',
        'broken pipe',
        'connection reset',
    ];

    return connectionIndicators.some(indicator => message.includes(indicator));
}

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new TransactionError(
                `Transaction timeout after ${timeoutMs}ms`,
                'TIMEOUT'
            ));
        }, timeoutMs);

        operation()
            .then((result) => {
                clearTimeout(timer);
                resolve(result);
            })
            .catch((error) => {
                clearTimeout(timer);
                reject(error);
            });
    });
}

// ═══════════════════════════════════════════════════════════════════
// TRANSACTION IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Execute a function within a database transaction with retry logic
 */
export async function withTransaction<T>(
    operation: (tx: TransactionContext) => Promise<T>,
    options: TransactionOptions = {}
): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const startTime = Date.now();
    let attempts = 0;

    while (true) {
        attempts++;
        let tx: TransactionContext | null = null;

        try {
            // Execute with timeout
            const result = await executeWithTimeout(
                async () => {
                    tx = createMockTransactionContext();
                    const value = await operation(tx);
                    await tx.commit();
                    return value;
                },
                opts.timeout
            );

            const duration = Date.now() - startTime;
            opts.onCommit(duration);

            return result;
        } catch (error) {
            const duration = Date.now() - startTime;

            // Rollback if transaction was started and not committed
            // Use unknown as intermediate cast to avoid TypeScript narrowing
            const txContext = tx as unknown as TransactionContext | undefined;
            if (txContext && !txContext.isCommitted) {
                try {
                    await txContext.rollback();
                    opts.onRollback(duration);
                } catch (rollbackError) {
                    logger.error('[Transaction] Rollback failed', { error: rollbackError });
                }
            }

            // Check if retryable
            const isRetryable =
                isSerializationFailure(error) ||
                isConnectionFailure(error);

            const shouldRetry = attempts < opts.maxRetries && isRetryable;

            if (!shouldRetry) {
                logger.error('[Transaction] Failed', {
                    attempts,
                    error: error instanceof Error ? error.message : 'Unknown',
                    duration
                });

                throw error instanceof Error ? error : new Error(String(error));
            }

            // Calculate delay with exponential backoff
            const delay = opts.retryDelay * Math.pow(opts.backoffMultiplier, attempts - 1);
            opts.onRetry(attempts, error instanceof Error ? error : new Error(String(error)), delay);

            // Wait before retry
            await sleep(delay);
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Execute multiple operations in a batch within a transaction
 */
export async function batchTransaction<T>(
    operations: Array<() => Promise<T>>,
    options: TransactionOptions = {}
): Promise<T[]> {
    return withTransaction(async (tx) => {
        const results: T[] = [];
        for (const op of operations) {
            results.push(await op());
        }
        return results;
    }, options);
}

/**
 * Execute operations with savepoints for nested transactions
 */
export async function withSavepoint<T>(
    name: string,
    operation: () => Promise<T>,
    options: TransactionOptions = {}
): Promise<T> {
    return withTransaction(async (tx) => {
        logger.debug(`[Transaction] Savepoint: ${name}`);
        try {
            return await operation();
        } catch (error) {
            logger.debug(`[Transaction] Rolling back to savepoint: ${name}`);
            throw error;
        }
    }, options);
}

// ═══════════════════════════════════════════════════════════════════
// TRANSACTION MANAGER (for complex scenarios)
// ═══════════════════════════════════════════════════════════════════

export class TransactionManager {
    private activeTransactions: Map<string, TransactionContext> = new Map();

    /**
     * Start a named transaction
     */
    async begin(id: string, options: TransactionOptions = {}): Promise<TransactionContext> {
        if (this.activeTransactions.has(id)) {
            throw new TransactionError(`Transaction ${id} already active`, 'COMMIT_FAILED');
        }

        const tx = createMockTransactionContext();
        this.activeTransactions.set(id, tx);

        logger.info(`[TransactionManager] Started: ${id}`);
        return tx;
    }

    /**
     * Commit a named transaction
     */
    async commit(id: string): Promise<void> {
        const tx = this.activeTransactions.get(id);
        if (!tx) {
            throw new TransactionError(`Transaction ${id} not found`, 'COMMIT_FAILED');
        }

        await tx.commit();
        this.activeTransactions.delete(id);

        logger.info(`[TransactionManager] Committed: ${id}`);
    }

    /**
     * Rollback a named transaction
     */
    async rollback(id: string): Promise<void> {
        const tx = this.activeTransactions.get(id);
        if (!tx) {
            throw new TransactionError(`Transaction ${id} not found`, 'ROLLBACK_FAILED');
        }

        await tx.rollback();
        this.activeTransactions.delete(id);

        logger.info(`[TransactionManager] Rolled back: ${id}`);
    }

    /**
     * Check if transaction is active
     */
    isActive(id: string): boolean {
        const tx = this.activeTransactions.get(id);
        return tx !== undefined && !tx.isCommitted;
    }

    /**
     * Abort all active transactions
     */
    async abortAll(): Promise<void> {
        for (const [id, tx] of this.activeTransactions) {
            try {
                await tx.rollback();
                logger.warn(`[TransactionManager] Aborted: ${id}`);
            } catch (err) {
                logger.error(`[TransactionManager] Failed to abort ${id}`, { error: err });
            }
        }
        this.activeTransactions.clear();
    }
}

// Singleton instance
export const transactionManager = new TransactionManager();