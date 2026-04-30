# FASE 3: Controller Layer + Dependency Injection

## Resumen

La Fase 3 implementa el patrón **Controller** junto con un **Contenedor de Inyección de Dependencias (DI)** para separar la lógica de las rutas API de la lógica de negocio.

## Arquitectura Implementada

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Route (route.ts)                      │
│                  withApiRoute (RBAC, Tenant, Audit)              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              withApiRouteAdapter.ts                              │
│         (Bridge: withApiRoute → Controller)                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BaseController.ts                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ - handleRequest(): Wraps operations with try/catch        │   │
│  │ - resolve(): Gets services from DI container              │   │
│  │ - log(): Logging estructurado por controlador            │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌────────────────────────┐   ┌────────────────────────┐
│   DI Container         │   │   Concrete Controllers │
│   - register()         │   │   - UsuarioController  │
│   - resolve()          │   │   - RolController     │
│   - singleton/transient│   │   - ...               │
└────────────────────────┘   └────────────────────────┘
```

## Archivos Creados

### 1. Contenedor DI (`src/lib/di/`)

#### Container.ts
```typescript
// Registro de servicios
container.register('UsuarioService', () => new UsuarioService(), 'singleton');
container.register('EmailService', () => new EmailService(), 'transient');

// Resolución
const service = container.resolve<UsuarioService>('UsuarioService');
```

**Patrones de Lifetime:**
- **singleton**: Una sola instancia para toda la aplicación
- **transient**: Nueva instancia cada vez que se resuelve

### 2. Base Controller (`src/lib/controllers/`)

#### BaseController.ts
```typescript
abstract class BaseController {
  protected serviceName: string;
  
  // Envuelve operaciones con manejo de errores centralizado
  protected async handleRequest<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<NextResponse>

  // Obtiene servicios del contenedor DI
  protected resolve<T>(token: string): T
}
```

**Beneficios:**
- Manejo de errores centralizado (AppError → JSON response)
- Logging estructurado por operación
- Response格式统一的

#### ControllerContext
```typescript
interface ControllerContext {
  userId: string;
  role: string;
  tenantId: string;
  tenantSlug: string;
  sessionId: string;
  requestId: string;
  isImpersonating: boolean;
}
```

### 3. Adaptador withApiRoute (`src/lib/controllers/adapters/`)

#### withApiRouteAdapter.ts
```typescript
const controller = new UsuarioController();

// Crear rutas REST desde controlador
export const GET = createControllerRoute(controller, 'list', {
  resource: 'usuarios',
  action: 'read',
});

export const POST = createControllerRoute(controller, 'create', {
  resource: 'usuarios',
  action: 'create',
});

// O usando el builder
const routes = buildControllerRoutes(controller);
export const GET_LIST = routes.getList({ resource: 'usuarios', action: 'read' });
export const GET_BY_ID = routes.getById({ resource: 'usuarios', action: 'read' });
```

### 4. Ejemplo Concreto (`src/lib/controllers/examples/`)

#### UsuarioController.ts
```typescript
export class UsuarioController extends BaseController {
  async list(req: NextRequest): Promise<NextResponse> {
    return this.handleRequest('list', async () => {
      // Lógica de negocio
      const db = getDB();
      const users = await db.select().from(users).where(eq(users.tenantId, this.getContext().tenantId));
      return { usuarios: users };
    });
  }

  async create(req: NextRequest): Promise<NextResponse> {
    return this.handleRequest('create', async () => {
      const body = await req.json();
      const parsed = CreateUsuarioSchema.safeParse(body);
      
      if (!parsed.success) {
        throw new ValidationError('Datos inválidos', parsed.error.flatten());
      }
      // ... crear usuario
    });
  }
}
```

## Migración Paso a Paso

### Paso 1: Crear el Controlador
```typescript
// src/lib/controllers/examples/NombreControlador.ts
export class NombreController extends BaseController {
  constructor() {
    super('NombreController');
  }

  async list(req: NextRequest): Promise<NextResponse> {
    return this.handleRequest('list', async () => {
      // Tu lógica actual de GET
    });
  }

  async create(req: NextRequest): Promise<NextResponse> {
    return this.handleRequest('create', async () => {
      // Tu lógica actual de POST
    });
  }
}
```

### Paso 2: Crear el Adaptador de Rutas
```typescript
// En tu route.ts
import { buildControllerRoutes } from '@/lib/controllers/adapters/withApiRouteAdapter';
import { NombreController } from '@/lib/controllers/examples/NombreController';

const controller = new NombreController();
const routes = buildControllerRoutes(controller);

export const GET = routes.getList({ resource: 'nombre', action: 'read' }, 'list');
export const POST = routes.post({ resource: 'nombre', action: 'create' }, 'create');
```

### Paso 3: Registrar en DI (opcional)
```typescript
// src/lib/di/register-services.ts
import { container } from '@/lib/di/Container';
import { NombreController } from '@/lib/controllers/examples/NombreController';

container.register('NombreController', () => new NombreController(), 'singleton');
```

## Beneficios del Patrón

1. **Separación de Concerns**: Routes solo manejan HTTP, Controllers manejan lógica de negocio
2. **Testabilidad**: Controllers pueden probarse unitariamente con mocks del DI
3. **Reutilización**: Un controller puede usarse en múltiples rutas
4. **Manejo de Errores Centralizado**: handleRequest envuelve todas las operaciones
5. **Type-Safety**: Tipado completo con TypeScript

## siguiente pasos

### Fase 4: Middleware Desacoplado
- Authentication middleware terpisah dari route
- Authorization middleware sebagai decorator
- Validation middleware sebagai pre-processor

### Fase 5: Caching + Transactions
- CacheService dengan invalidate pattern
- Transaction helper untuk operasi complejas

### Fase 6: Estandarización
- Templates para nuevos módulos
- ESLint rules untuk enforce pattern
- Documentación del equipo

## Archivo index.ts Actualizado

```typescript
// src/lib/controllers/index.ts
export { BaseController } from './BaseController';
export type { ControllerContext, ControllerRequest } from './BaseController';
export { container } from '@/lib/di/Container';
```

## Compatibilidad

Este patrón es **compatible hacia atrás** con las rutas existentes que usan `withApiRoute` directamente. La migración puede hacerse de forma incremental: primero crear el controlador, luego迁移 las rutas una por una.