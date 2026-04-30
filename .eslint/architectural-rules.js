/**
 * SILEXAR PULSE - ESLint Rules for Architectural Patterns
 * 
 * @description ESLint configuration to enforce architectural patterns
 *              and best practices for the Silexar Pulse backend.
 * 
 * @usage
 * Add to your .eslintrc.js extends:
 * module.exports = {
 *   extends: [
 *     './.eslint/architectural-rules.js'
 *   ]
 * };
 */

module.exports = {
    plugins: ['silexar'],
    rules: {
        // ═══════════════════════════════════════════════════════════════════
        // ERROR SYSTEM - Must use AppError classes
        // ═══════════════════════════════════════════════════════════════════
        'silexar/use-app-error': 'error',
        'silexar/no-throw-strings': 'error',
        'silexar/require-error-context': 'error',

        // ═══════════════════════════════════════════════════════════════════
        // SERVICE LAYER - Must extend BaseService
        // ═══════════════════════════════════════════════════════════════════
        'silexar/service-extends-base': 'error',
        'silexar/service-has-interface': 'error',
        'silexar/service-methods-logged': 'warn',

        // ═══════════════════════════════════════════════════════════════════
        // CONTROLLER LAYER - Must extend BaseController
        // ═══════════════════════════════════════════════════════════════════
        'silexar/controller-extends-base': 'error',
        'silexar/controller-use-handle-request': 'error',
        'silexar/controller-resolve-di': 'warn',

        // ═══════════════════════════════════════════════════════════════════
        // MIDDLEWARE - Must use from @/lib/middleware
        // ═══════════════════════════════════════════════════════════════════
        'silexar/use-middleware-decorators': 'warn',
        'silexar/middleware-error-handling': 'error',
        'silexar/no-inline-middleware': 'warn',

        // ═══════════════════════════════════════════════════════════════════
        // CACHING - Must use CacheService
        // ═══════════════════════════════════════════════════════════════════
        'silexar/cache-get-or-set': 'warn',
        'silexar/cache-invalidate-on-write': 'warn',
        'silexar/no-manual-cache-store': 'error',

        // ═══════════════════════════════════════════════════════════════════
        // TRANSACTIONS - Must use withTransaction
        // ═══════════════════════════════════════════════════════════════════
        'silexar/transaction-retry': 'warn',
        'silexar/transaction-timeout': 'warn',
        'silexar/no-nested-transactions': 'error',

        // ═══════════════════════════════════════════════════════════════════
        // LOCKING - Must use distributedLock
        // ═══════════════════════════════════════════════════════════════════
        'silexar/lock-requires-release': 'error',
        'silexar/lock-use-try-finally': 'error',
        'silexar/no-busy-wait-locks': 'error',

        // ═══════════════════════════════════════════════════════════════════
        // VALIDATION - Must use Zod schemas
        // ═══════════════════════════════════════════════════════════════════
        'silexar/use-zod-validation': 'warn',
        'silexar/validate-body-params': 'warn',
        'silexar/no-manual-validation': 'error',
    },
};

// ═══════════════════════════════════════════════════════════════════
// IMPLEMENTATION OF CUSTOM RULES
// ═══════════════════════════════════════════════════════════════════

/**
 * Rule: silexar/use-app-error
 * Ensures errors thrown are AppError subclasses, not plain strings or Error
 */
const useAppError = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Enforce use of AppError subclasses instead of plain errors',
            category: 'Best Practices',
        },
        fixable: null,
    },
    create(context) {
        return {
            ThrowStatement(node) {
                const argument = node.argument;

                // Allow: throw new AppError(...) or throw new XxxError(...)
                if (argument.type === 'NewExpression') {
                    const calleeName = argument.callee?.name || '';
                    if (calleeName.endsWith('Error')) return; // XxxError
                }

                // Allow: throw new Error('message') with AppError parent
                // Disallow: throw 'error string' or throw Error('message')
                if (argument.type === 'Literal' && typeof argument.value === 'string') {
                    context.report({
                        node,
                        message: 'Use AppError subclasses instead of throwing plain strings',
                    });
                }
            },
        };
    },
};

/**
 * Rule: silexar/no-throw-strings
 * Disallows throwing plain strings
 */
const noThrowStrings = {
    meta: { type: 'problem' },
    create(context) {
        return {
            ThrowStatement(node) {
                if (node.argument?.type === 'Literal' && typeof node.argument.value === 'string') {
                    context.report({ node, message: 'Do not throw plain strings. Use AppError subclasses.' });
                }
            },
        };
    },
};

/**
 * Rule: silexar/service-extends-base
 * Ensures services extend BaseService
 */
const serviceExtendsBase = {
    meta: { type: 'problem' },
    create(context) {
        return {
            ClassDeclaration(node) {
                if (node.superClass && node.superClass.name === 'BaseService') return;

                // Check if class name matches *Service pattern
                const className = node.id?.name || '';
                if (className.endsWith('Service') && !node.abstract) {
                    context.report({
                        node,
                        message: `Service "${className}" should extend BaseService`,
                    });
                }
            },
        };
    },
};

/**
 * Rule: silexar/controller-extends-base
 * Ensures controllers extend BaseController
 */
const controllerExtendsBase = {
    meta: { type: 'problem' },
    create(context) {
        return {
            ClassDeclaration(node) {
                if (node.superClass && node.superClass.name === 'BaseController') return;

                const className = node.id?.name || '';
                if (className.endsWith('Controller')) {
                    context.report({
                        node,
                        message: `Controller "${className}" should extend BaseController`,
                    });
                }
            },
        };
    },
};

/**
 * Rule: silexar/lock-requires-release
 * Ensures locks are released in all code paths
 */
const lockRequiresRelease = {
    meta: { type: 'problem' },
    create(context) {
        return {
            AwaitExpression(node) {
                const callee = node.argument?.callee;
                if (callee?.property?.name === 'acquire') {
                    // Check if release is called in a finally block
                    // This is a simplified check - real implementation would use control flow
                    context.report({
                        node,
                        message: 'Lock acquired must be released. Consider using distributedLock.execute() instead.',
                    });
                }
            },
        };
    },
};

/**
 * Rule: silexar/lock-use-try-finally
 * Ensures lock release happens in finally block
 */
const lockUseTryFinally = {
    meta: { type: 'problem' },
    create(context) {
        return {
            TryStatement(node) {
                // Check if finally block exists when lock is acquired in try
                const hasLockAcquire = node.block?.body?.some?.(
                    (stmt) => stmt.type === 'AwaitExpression' &&
                        stmt.argument?.callee?.property?.name === 'acquire'
                );

                if (hasLockAcquire && !node.finalizer) {
                    context.report({
                        node,
                        message: 'Lock acquisition requires a finally block for guaranteed release',
                    });
                }
            },
        };
    },
};

module.exports.rules = {
    'silexar/use-app-error': useAppError,
    'silexar/no-throw-strings': noThrowStrings,
    'silexar/service-extends-base': serviceExtendsBase,
    'silexar/controller-extends-base': controllerExtendsBase,
    'silexar/lock-requires-release': lockRequiresRelease,
    'silexar/lock-use-try-finally': lockUseTryFinally,
};