# FASE 4: Middleware Desacoplado

## Resumen

La Fase 4 implementa middlewares desacoplados y reutilizables para autenticación, autorización, validación, logging y rate limiting. Todos los middlewares son compatibles con el sistema de errores unificado (AppError).

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         Route Handler                            │
│                  (Controller / withApiRoute)                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
   ┌──────────┐     ┌──────────┐     ┌──────────┐
   │ Auth     │     │ Validate │     │ RateLimit│
   │ Middleware│     │ Middleware│     │ Middleware│
   └─────┬────┘     └─────┬────┘     └─────┬────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                           ▼
                    AppError Handler
```

## Middlewares Implementados

### 1. Authentication Middleware

**Archivo**: [`src/lib/middleware/authentication.ts`](src/lib/middleware/authentication.ts)

```typescript
import { extractAuthContext, requireAuth } from '@/lib/middleware/authentication';

// Extraer contexto sin throwing
const context = extractAuthContext(request);
if (!context) return unauthorizedResponse();

// Requerir autenticación (throws UnauthorizedError)
const auth = requireAuth(request);

// En withApiRoute handler
async ({ ctx, req }) => {
  requireAuth(req); // Throws if not authenticated
  // continue...
}
```

**Funciones**:
- `extractAuthContext(request)` → AuthContext | null
- `requireAuth(request)` → AuthContext (throws)
- `optionalAuth(request)` → AuthContext | null
- `authMiddleware(request)` → { authorized, context?, response? }
- `unauthorizedResponse(message)` → NextResponse
- `forbiddenResponse(message)` → NextResponse

### 2. Authorization Middleware

**Archivo**: [`src/lib/middleware/authorization.ts`](src/lib/middleware/authorization.ts)

```typescript
import { authorize, requirePermission, requireRole } from '@/lib/middleware/authorization';

// Decorator pattern
export const POST = authorize('usuarios', 'create')(async ({ ctx, req }) => {
  // Only reaches here if authorized
});

// Guard pattern (throws ForbiddenError)
requirePermission(ctx, 'usuarios', 'create');
requireRole(ctx, ['admin', 'super_admin']);
requireAnyRole(ctx, ['admin', 'tenant_admin']);
requireMinRole(ctx, 'manager');
```

**RBAC Hierarchy**:
```
super_admin (100) > admin (80) > tenant_admin (60) > manager (40) > user (20) > guest (10)
```

**Recursos definidos**: usuarios, roles, politicas, campanas, reportes, configuraciones

### 3. Validation Middleware

**Archivo**: [`src/lib/middleware/validation.ts`](src/lib/middleware/validation.ts)

```typescript
import { validateBody, createValidator, paginationSchema } from '@/lib/middleware/validation';
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  nombre: z.string().min(2),
});

// Using decorator
export const POST = validateBody(CreateUserSchema)(async ({ ctx, req }) => {
  const validated = ctx.validatedBody; // Typed!
});

// Using factory
const validate = createValidator();
export const GET = validate.query(paginationSchema)(async ({ ctx, req }) => {
  const { page, pageSize } = ctx.validatedQuery;
});

// Standalone functions
const result = await validateBody(request, CreateUserSchema);
if (!result.valid) {
  return NextResponse.json({ error: result.errors }, { status: 400 });
}
```

**Schemas predefinidos**:
- `paginationSchema`: { page, pageSize }
- `idParamSchema`: { id: uuid }
- `searchQuerySchema`: { query?, page, pageSize }
- `dateRangeSchema`: { startDate?, endDate? }

### 4. Request Logging Middleware

**Archivo**: [`src/lib/middleware/request-logger.ts`](src/lib/middleware/request-logger.ts)

```typescript
import { requestLogger, withRequestLogging } from '@/lib/middleware/request-logger';

// Apply via decorator
export const GET = requestLogger({ slowThreshold: 3000 })(async ({ ctx, req }) => {
  // Logs request start and end automatically
});

// Or apply to all routes
export const POST = withRequestLogging(handler);

// Standalone logging
import { logRequestStart, logRequestEnd, requestLog } from '@/lib/middleware/request-logger';

requestLog('Custom log message', { userId: ctx.userId, action: 'create' });
```

**Log fields**: method, url, status, duration, clientIp, userAgent, userId, tenantId, requestId

### 5. Rate Limiting Middleware

**Archivo**: [`src/lib/middleware/rate-limit.ts`](src/lib/middleware/rate-limit.ts)

```typescript
import { rateLimit, strict, moderate, RateLimitTier } from '@/lib/middleware/rate-limit';

// Apply via decorator
export const POST = rateLimit({ tier: RateLimitTier.STRICT })(async ({ ctx, req }) => {
  // Rate limited to 5 requests/minute
});

// Convenience tiers
export const GET = moderate()(async ({ ctx, req }) => {
  // 30 requests/minute
});

// Custom tier
export const POST = rateLimit({ 
  tier: RateLimitTier.AUTH,  // 3/min for sensitive operations
  bypassTokens: ['internal-api-key']
})(handler);

// Standalone check
const result = checkRateLimit(request, RateLimitTier.MODERATE);
if (!result.allowed) {
  return rateLimitExceededResponse(result);
}
```

**Tiers**:
| Tier | Limit | Window |
|------|-------|--------|
| STRICT | 5/min | 60s |
| MODERATE | 30/min | 60s |
| RELAXED | 100/min | 60s |
| AUTH | 3/min | 60s |

## Composición de Middleware

```typescript
import { compose, crudMiddleware } from '@/lib/middleware';

// Compose multiple middlewares
const handler = compose(
  requestLogger(),
  rateLimit({ tier: RateLimitTier.MODERATE }),
  authorize('usuarios', 'create'),
  validateBody(CreateUserSchema)
)(asyncRouteHandler);

// Pre-built CRUD middleware
export const POST = crudMiddleware('usuarios', 'create', {
  rateLimitTier: RateLimitTier.STRICT,
  validationSchema: CreateUserSchema,
})(asyncRouteHandler);
```

## Uso con withApiRoute

Los middlewares son compatibles con el sistema existente:

```typescript
import { withApiRoute } from '@/lib/api/with-api-route';
import { requestLogger } from '@/lib/middleware/request-logger';
import { rateLimit, RateLimitTier } from '@/lib/middleware/rate-limit';
import { authorize } from '@/lib/middleware/authorization';

// Existing pattern still works
export const GET = withApiRoute(
  { resource: 'usuarios', action: 'read', rateLimit: RateLimitTier.MODERATE },
  async ({ ctx, req }) => {
    // Middleware already applied via withApiRoute
  }
);

// Or wrap handler with additional middleware
export const POST = requestLogger()(
  rateLimit({ tier: RateLimitTier.STRICT })(
    withApiRoute({ resource: 'usuarios', action: 'create' },
      async ({ ctx, req }) => {
        // Handler logic
      }
    )
  )
);
```

## Siguiente Paso

**Fase 5: Caching + Transactions**
- CacheService con invalidate pattern
- Transaction helper para operaciones complejas
- Distributed locking

## Exportación Central

```typescript
// src/lib/middleware/index.ts
export { 
  // Authentication
  extractAuthContext,
  requireAuth,
  authMiddleware,
  
  // Authorization  
  authorize,
  requirePermission,
  requireRole,
  
  // Validation
  validateBody,
  validateQuery,
  createValidator,
  
  // Logging
  requestLogger,
  
  // Rate Limiting
  rateLimit,
  RateLimitTier,
  
  // Composition
  compose,
  crudMiddleware,
} from '@/lib/middleware';