# SILEXAR PULSE - Implementation Checklist

## New API Module Checklist

Use this checklist when creating new API modules to ensure architectural compliance.

### Phase 1: Error System ✓
- [x] Use AppError subclasses (NotFoundError, ValidationError, etc.)
- [x] Never throw plain strings
- [x] Use apiSuccess, apiError, apiValidationError, apiServerError responses
- [x] Log errors with context using logger

### Phase 2: Service Layer
- [ ] Create service extending BaseService
- [ ] Define interface (IService<T>)
- [ ] Implement CRUD methods with proper error handling
- [ ] Use repository pattern for data access
- [ ] Log all service operations

### Phase 3: Controller Layer + DI
- [ ] Create controller extending BaseController
- [ ] Use handleRequest() for all operations
- [ ] Use resolve() to get services from DI container
- [ ] Set ControllerContext for multi-tenant support
- [ ] Register services in DI container

### Phase 4: Middleware
- [ ] Use withApiRoute for RBAC/auth
- [ ] Use validateBody/Zod for request validation
- [ ] Use requestLogger for logging
- [ ] Use rateLimit middleware
- [ ] Compose middlewares with compose()

### Phase 5: Caching + Transactions
- [ ] Use cacheService.getOrSet() for reads
- [ ] Invalidate cache on writes (cacheService.invalidate())
- [ ] Use withTransaction for multi-step operations
- [ ] Use distributedLock for critical sections
- [ ] Handle serialization failures with retry

### Phase 6: Standards
- [ ] Follow naming conventions (recurso:action)
- [ ] Add proper JSDoc comments
- [ ] Update this checklist
- [ ] Add tests for new functionality

---

## File Naming Conventions

```
src/app/api/{recurso}/
├── route.ts           # CRUD operations
├── [id]/
│   └── route.ts       # Single resource operations
└── schema.ts          # Zod schemas

src/lib/services/
├── interfaces/
│   └── I{Service}Service.ts
├── base/
│   └── Base{Service}Service.ts
└── {service}/
    └── {Service}Service.ts

src/lib/controllers/
├── BaseController.ts
├── adapters/
│   └── withApiRouteAdapter.ts
└── {recurso}/
    └── {Controller}Controller.ts
```

---

## Quick Reference

### Error Types
```typescript
throw new NotFoundError('Resource', id);
throw new ValidationError('Invalid data', details);
throw new UnauthorizedError('Not authenticated');
throw new ForbiddenError('No permissions');
throw new ConflictError('Already exists');
throw new DatabaseError('DB operation failed');
```

### Cache Patterns
```typescript
// Read-through
const data = await cacheService.getOrSet(key, () => dbQuery(), { ttl: 300 });

// Write-invalidate
await dbUpdate();
cacheService.invalidate(key);
cacheService.invalidatePattern('list:*');
```

### Transaction Patterns
```typescript
// With auto-retry
const result = await withTransaction(async (tx) => {
  // operations
}, { maxRetries: 3 });

// With lock
await distributedLock.execute('resource-key', async () => {
  return withTransaction(async (tx) => {
    // critical operations
  });
});
```

### Middleware Composition
```typescript
export const POST = compose(
  requestLogger(),
  rateLimit({ tier: RateLimitTier.STRICT }),
  authorize('recurso', 'create'),
  validateBody(CreateSchema)
)(asyncHandler);
```

---

## Migration Guide

### Old Pattern → New Pattern

**Before:**
```typescript
export const GET = withApiRoute({ resource: 'users' }, async ({ ctx, req }) => {
  try {
    const users = await db.select().from(users);
    return { success: true, data: users };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Server error' };
  }
});
```

**After:**
```typescript
export const GET = withApiRoute(
  { resource: 'usuarios', action: 'read' },
  async ({ ctx, req }) => {
    return cacheService.getOrSet('usuarios:list', async () => {
      return withTransaction(async (tx) => {
        const db = getDB();
        const users = await db.select().from(usuarios).where(eq(usuarios.tenantId, ctx.tenantId));
        return apiSuccess(users);
      });
    }, { ttl: 300 });
  }
);
```

---

## Testing Checklist

- [ ] Unit tests for service layer
- [ ] Unit tests for validation schemas
- [ ] Integration tests for API routes
- [ ] Test error handling paths
- [ ] Test cache invalidation
- [ ] Test transaction rollback
- [ ] Test lock acquisition/release

---

## Review Checklist

Before merging new modules:

- [ ] ESLint passes (no architectural violations)
- [ ] All new files have proper exports
- [ ] Error types used correctly
- [ ] Caching implemented for read-heavy operations
- [ ] Transactions used for multi-step writes
- [ ] Locks used for critical sections
- [ ] Logging present for operations
- [ ] Documentation updated (if public API)
- [ ] Tests added and passing