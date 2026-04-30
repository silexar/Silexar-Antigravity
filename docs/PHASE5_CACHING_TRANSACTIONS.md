# FASE 5: Caching + Transactions + Distributed Locking

## Resumen

La Fase 5 implementa servicios de caching, manejo de transacciones y locks distribuidos para координа de operaciones concurrentes.

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                      Service Layer                              │
│                  (Business Logic)                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
   ┌──────────┐     ┌──────────┐     ┌──────────┐
   │  Cache   │     │  Trans   │     │   Lock   │
   │ Service  │     │  Helper  │     │ Service  │
   └─────┬────┘     └─────┬────┘     └─────┬────┘
         │                 │                 │
         ▼                 ▼                 ▼
   ┌──────────┐     ┌──────────┐     ┌──────────┐
   │ In-Mem   │     │  Drizzle │     │ In-Mem   │
   │ Store    │     │    TX    │     │ Store    │
   └──────────┘     └──────────┘     └──────────┘
```

## Componentes Implementados

### 1. CacheService

**Archivo**: [`src/lib/cache/CacheService.ts`](src/lib/cache/CacheService.ts)

```typescript
import { cacheService } from '@/lib/cache';

// Basic get/set
cacheService.set('user:123', userData, { ttl: 300 });
const user = cacheService.get('user:123');

// Get-or-set pattern (cache-aside)
const user = await cacheService.getOrSet(
  `user:${id}`,
  () => fetchUserFromDB(id),
  { ttl: 300 }
);

// Invalidation
cacheService.invalidate('user:123');
cacheService.invalidatePattern('user:*');

// Stats
const stats = cacheService.getStats();
```

**Características**:
- TTL con expiración automática
- LRU eviction cuando se alcanza capacidad
- Pattern-based invalidation (`user:*`)
- Decorators: `@Cacheable`, `@CacheInvalidate`

### 2. TransactionHelper

**Archivo**: [`src/lib/db/TransactionHelper.ts`](src/lib/db/TransactionHelper.ts)

```typescript
import { withTransaction, transactionManager } from '@/lib/db';

// Simple transaction
const user = await withTransaction(async (tx) => {
  const user = await tx.insert(users).values(data).returning();
  await tx.insert(preferences).values({ userId: user.id });
  return user;
});

// With options
const result = await withTransaction(async (tx) => {
  // operations
}, {
  isolationLevel: 'serializable',
  maxRetries: 3,
  onRetry: (attempt, error, delay) => {
    logger.warn(`Retry ${attempt}`, { delay });
  }
});

// Batch operations
const results = await batchTransaction([
  () => operation1(),
  () => operation2(),
]);

// Transaction manager for long-running operations
const tx = await transactionManager.begin('migration-001');
try {
  // operations
  await transactionManager.commit('migration-001');
} catch {
  await transactionManager.rollback('migration-001');
}
```

**Características**:
- Retry con exponential backoff para serialization failures
- Configurable isolation level
- Timeout support
- Savepoints para transacciones anidadas

### 3. DistributedLock

**Archivo**: [`src/lib/lock/DistributedLock.ts`](src/lib/lock/DistributedLock.ts)

```typescript
import { distributedLock } from '@/lib/lock';

// Simple acquire/release
const lock = await distributedLock.acquire('job:123');
try {
  await processJob();
} finally {
  await lock.release();
}

// Execute with lock
await distributedLock.execute('critical-operation', async () => {
  return await criticalOperation();
}, { ttl: 30000 });

// Try-acquire (non-blocking)
const lock = await distributedLock.tryAcquire('resource', { ttl: 5000 });
if (lock) {
  // do work
  await lock.release();
} else {
  // handle lock not available
}

// Decorator
class PaymentService {
  @withLock('payment:{id}', { ttl: 60000 })
  async processPayment(id: string) {
    // Only one at a time per payment ID
  }
}
```

**Características**:
- Token-based release validation
- Auto-expire con TTL
- Retry con exponential backoff
- Force release para admin/debugging

## Exports Centrales

```typescript
// src/lib/cache/index.ts
export { CacheService, cacheService, getCacheService, Cacheable, CacheInvalidate }

// src/lib/db/index.ts
export { withTransaction, batchTransaction, withSavepoint, transactionManager }

// src/lib/lock/index.ts
export { distributedLock, lock, withLock, LockError }
```

## Ejemplo de Integración

```typescript
import { cacheService } from '@/lib/cache';
import { withTransaction } from '@/lib/db';
import { distributedLock } from '@/lib/lock';

async function createOrder(orderData: OrderDTO): Promise<Order> {
  return distributedLock.execute(`order:create:${orderData.userId}`, async () => {
    return withTransaction(async (tx) => {
      // Check cache first
      const cached = cacheService.get(`cart:${orderData.cartId}`);
      
      // Create order
      const order = await tx.insert(orders).values(orderData).returning();
      
      // Invalidate cache
      cacheService.invalidate(`cart:${orderData.cartId}`);
      
      return order;
    }, { isolationLevel: 'read-committed' });
  }, { ttl: 30000 });
}
```

## Siguiente Paso

**Fase 6: Estandarización**
- Templates para nuevos módulos
- ESLint rules para enforce pattern
- Documentación del equipo

## Patrones Recomendados

1. **Cache-Aside**: Check cache → miss → load from DB → store in cache
2. **Write-Through**: Update DB → invalidate cache
3. **Transaction Boundary**: Keep transactions short, retry on serialization failure
4. **Lock Scope**: Minimum necessary, always release in finally block