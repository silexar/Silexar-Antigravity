# Arquitectura de Silexar Pulse Quantum

## Visión General

Silexar Pulse Quantum sigue una arquitectura **hexagonal/layered** con principios **Domain-Driven Design (DDD)** y **Clean Architecture**. El sistema está diseñado para escalar horizontalmente y soportar múltiples tenants.

## Diagrama de Arquitectura

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        Browser["Browser / Mobile App"]
        PWA["PWA / Service Worker"]
    end

    subgraph Edge["Edge Layer (Vercel)"]
        CDN["CDN / Static Assets"]
        EdgeFuncs["Edge Functions"]
        Middleware["Auth Middleware"]
    end

    subgraph App["Application Layer"]
        NextJS["Next.js 16 App Router"]
        RSC["React Server Components"]
        RCC["React Client Components"]
        APIRoutes["API Routes (tRPC)"]
    end

    subgraph Domain["Domain Layer"]
        Entities["Entities"]
        ValueObjects["Value Objects"]
        Services["Domain Services"]
        Events["Domain Events"]
    end

    subgraph Infrastructure["Infrastructure Layer"]
        DB[("PostgreSQL<br/>Drizzle ORM")]
        Redis[("Redis<br/>Cache/Rate Limit")]
        Kafka["Kafka<br/>Event Streaming"]
        S3["S3/Azure Blob<br/>File Storage"]
    end

    subgraph External["External Services"]
        Auth["Better Auth"]
        Sentry["Sentry Monitoring"]
        AI["Cortex AI / OpenAI"]
        OAuth["OAuth Providers"]
    end

    Browser --> CDN
    PWA --> EdgeFuncs
    CDN --> NextJS
    EdgeFuncs --> Middleware
    Middleware --> APIRoutes
    NextJS --> RSC
    NextJS --> RCC
    RCC --> APIRoutes
    APIRoutes --> Domain
    Domain --> Infrastructure
    Domain --> External
```

## Flujo de Datos

```mermaid
sequenceDiagram
    actor User as Usuario
    participant Browser as Navegador
    participant Edge as Vercel Edge
    participant Next as Next.js
    participant TRPC as tRPC Router
    participant Service as Domain Service
    participant DB as PostgreSQL
    participant Redis as Redis
    participant AI as Cortex AI

    User->>Browser: Acción (click/form)
    Browser->>Edge: HTTP Request
    Edge->>Edge: Validar JWT/Rate Limit
    Edge->>Next: Forward Request
    
    alt Server Component
        Next->>TRPC: Llamada directa
        TRPC->>Service: Ejecutar lógica
        Service->>DB: Query
        DB-->>Service: Resultado
        Service-->>TRPC: Entity
        TRPC-->>Next: Props
        Next-->>Edge: HTML Streaming
        Edge-->>Browser: Rendered Page
    else Client Component
        Next-->>Browser: Hydrated App
        Browser->>TRPC: tRPC Call (React Query)
        TRPC->>Service: Validar + Ejecutar
        Service->>Redis: Cache Check
        alt Cache Hit
            Redis-->>Service: Cached Data
        else Cache Miss
            Service->>DB: Query
            DB-->>Service: Resultado
            Service->>Redis: Cache Set
        end
        opt IA Feature
            Service->>AI: Process
            AI-->>Service: Insights
        end
        Service-->>TRPC: Resultado
        TRPC-->>Browser: JSON Response
    end
```

## Capas del Sistema

### 1. Presentation Layer (src/app/)

**Responsabilidades:**
- Routing y navegación
- Renderizado SSR/CSR
- Gestión de estado local
- UI/UX con Tailwind CSS

**Estructura:**
```
src/app/
├── layout.tsx          # Root layout con providers
├── page.tsx            # Home / Dashboard
├── loading.tsx         # Loading UI
├── error.tsx           # Error boundaries
├── api/                # API Routes
│   ├── auth/           # Auth endpoints
│   ├── campanas/       # Campaign endpoints
│   ├── contratos/      # Contract endpoints
│   └── trpc/           # tRPC router
├── (routes)/           # Page routes
│   ├── campanas/       # Campaign pages
│   ├── contratos/      # Contract pages
│   └── ...
```

### 2. API Layer (src/lib/trpc/)

**Responsabilidades:**
- Validación de requests (Zod)
- Rate limiting (Redis)
- Autenticación/Autorización
- Enrutamiento a domain services

**Routers:**
- `auth.router.ts` - Autenticación y sesiones
- `campaigns.router.ts` - Gestión de campañas
- `contracts.router.ts` - Gestión de contratos
- `cortex.router.ts` - IA y analytics
- `analytics.router.ts` - Reportes y métricas

### 3. Domain Layer (src/lib/modules/)

**Responsabilidades:**
- Lógica de negocio pura
- Reglas de dominio
- Validaciones complejas
- Eventos de dominio

**Módulos principales:**
- `campanas/` - Dominio de campañas
- `contratos/` - Dominio de contratos
- `cunas/` - Dominio de cuñas/spots
- `registro-emision/` - Dominio de emisiones

### 4. Infrastructure Layer (src/lib/)

**Responsabilidades:**
- Persistencia de datos
- Caching distribuido
- Comunicación con servicios externos
- Manejo de colas

**Servicios:**
- `db/` - Drizzle ORM schemas y queries
- `cache/` - Redis client y caching
- `security/` - Rate limiting, encryption
- `integrations/` - APIs externas

## Modelo de Datos

```mermaid
erDiagram
    TENANT ||--o{ USUARIO : contains
    TENANT ||--o{ CAMPANA : contains
    TENANT ||--o{ CONTRATO : contains
    TENANT ||--o{ CUNA : contains
    
    USUARIO ||--o{ CAMPANA : creates
    USUARIO ||--o{ CONTRATO : negotiates
    
    ANUNCIANTE ||--o{ CAMPANA : hires
    ANUNCIANTE ||--o{ CONTRATO : signs
    
    CONTRATO ||--o{ CAMPANA : funds
    CONTRATO ||--o{ CUNA : includes
    
    CAMPANA ||--o{ LINEA_PAUTA : has
    CAMPANA ||--o{ CONFIRMACION : generates
    
    LINEA_PAUTA }o--|| EMISORA : broadcasts_on
    LINEA_PAUTA }o--|| BLOQUE : scheduled_in
    
    CUNA ||--o{ MATERIAL : contains
```

## Arquitectura de Autenticación

```mermaid
flowchart TB
    subgraph AuthFlow["Authentication Flow"]
        User["Usuario"]
        Login["/login"]
        BetterAuth["Better Auth"]
        JWT["JWT Tokens"]
        Session["Session Store"]
    end

    subgraph Authorization["Authorization"]
        RBAC["RBAC Middleware"]
        Permissions["Permissions Check"]
        Tenancy["Tenant Isolation"]
    end

    subgraph Providers["OAuth Providers"]
        Google["Google"]
        Microsoft["Microsoft"]
        GitHub["GitHub"]
    end

    User --> Login
    Login --> BetterAuth
    BetterAuth --> JWT
    BetterAuth --> Session
    BetterAuth --> Providers
    JWT --> RBAC
    RBAC --> Permissions
    Permissions --> Tenancy
```

## Arquitectura de Cortex AI

```mermaid
flowchart TB
    subgraph Cortex["Cortex AI System"]
        subgraph Input["Input Processing"]
            NLP["NLP Engine"]
            Filter["Input Filter"]
            Validator["Output Validator"]
        end
        
        subgraph Core["AI Core"]
            Orchestrator["Orchestrator"]
            Prophet["Predictive Engine"]
            Sense["Sense & Analytics"]
        end
        
        subgraph Output["Output"]
            Insights["Insights"]
            Actions["Actions"]
            Recommendations["Recommendations"]
        end
    end

    Input --> Core
    Core --> Output
```

## Decisiones Técnicas

### 1. Next.js App Router sobre Pages Router

**Decisión:** Migrar a App Router de Next.js 16

**Razones:**
- Server Components por defecto (menos JS en cliente)
- Streaming SSR para mejor TTFB
- Nested layouts más eficientes
- Mejor integración con React 19

**Trade-offs:**
- Curva de aprendizaje más pronunciada
- Algunas librerías aún no son 100% compatibles

### 2. tRPC sobre REST tradicional

**Decisión:** Usar tRPC para type-safety end-to-end

**Razones:**
- Inferencia automática de tipos
- Menor boilerplate
- Excelente DX (autocompletado)
- Subscriptions/WebSockets soportados

**Trade-offs:**
- Acoplamiento entre frontend y backend
- No es estándar HTTP puro

### 3. Drizzle ORM sobre Prisma

**Decisión:** Adoptar Drizzle ORM

**Razones:**
- Zero runtime overhead
- SQL-like API natural
- Mejor performance en queries complejas
- Más control sobre SQL generado

**Trade-offs:**
- Menos maduro que Prisma
- Menos features de migración automática

### 4. Better Auth sobre NextAuth.js

**Decisión:** Migrar a Better Auth

**Razones:**
- TypeScript first
- Plugins extensibles
- Soporte nativo multi-tenant
- RBAC integrado

**Trade-offs:**
- Más nuevo en el ecosistema
- Menos documentación comunitaria

### 5. Neumorphism Design System

**Decisión:** Implementar diseño neumórfico custom

**Razones:**
- Diferenciación visual
- Sensación táctil en UI
- Accesibilidad mantenida

**Trade-offs:**
- Más CSS custom requerido
- Testing visual más complejo

## Escalabilidad

### Horizontal Scaling

```mermaid
flowchart TB
    subgraph LoadBalancer["Load Balancer"]
        Nginx["Nginx / Vercel Edge"]
    end

    subgraph AppCluster["App Cluster"]
        App1["App Instance 1"]
        App2["App Instance 2"]
        AppN["App Instance N"]
    end

    subgraph DataLayer["Data Layer"]
        Postgres[("PostgreSQL<br/>Primary")]
        PostgresR[("PostgreSQL<br/>Replicas")]
        RedisCluster[("Redis Cluster")]
    end

    Nginx --> App1
    Nginx --> App2
    Nginx --> AppN
    App1 --> Postgres
    App2 --> PostgresR
    AppN --> RedisCluster
```

### Multi-Tenancy

```mermaid
flowchart LR
    subgraph Tenants["Tenants"]
        T1["Tenant A"]
        T2["Tenant B"]
        T3["Tenant C"]
    end

    subgraph App["Application"]
        Middleware["Tenant Middleware"]
        Context["Tenant Context"]
    end

    subgraph DB["Database"]
        RLS["Row Level Security"]
    end

    T1 --> Middleware
    T2 --> Middleware
    T3 --> Middleware
    Middleware --> Context
    Context --> RLS
```

## Monitoreo y Observabilidad

```mermaid
flowchart TB
    subgraph App["Application"]
        Metrics["Metrics Collector"]
        Logs["Structured Logs"]
        Traces["Distributed Traces"]
    end

    subgraph Monitoring["Monitoring Stack"]
        Sentry["Sentry"]
        VercelAnalytics["Vercel Analytics"]
        Custom["Custom Dashboard"]
    end

    App --> Monitoring
```

## Seguridad

```mermaid
flowchart TB
    subgraph Security["Security Layers"]
        direction TB
        
        Edge["Edge Security"]
        App["Application Security"]
        Data["Data Security"]
        
        Edge --> WAF["WAF"]
        Edge --> DDoS["DDoS Protection"]
        Edge --> Geo["Geo Blocking"]
        
        App --> Auth["Auth/JWT"]
        App --> RBAC["RBAC"]
        App --> RateLimit["Rate Limiting"]
        
        Data --> Encryption["Encryption at Rest"]
        Data --> RLS["Row Level Security"]
        Data --> Audit["Audit Logging"]
    end
```

## Stack Tecnológico Detallado

### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Next.js | 16.0.7 | Framework React |
| React | 19.2.1 | UI Library |
| TypeScript | 5.8.3 | Tipado estático |
| Tailwind CSS | 3.4.17 | Estilos |
| Framer Motion | 12.23.24 | Animaciones |
| Radix UI | 1.x | Componentes base |
| Zustand | 5.0.3 | State management |
| React Query | 5.x | Server state |

### Backend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Better Auth | 1.4.11 | Autenticación |
| tRPC | 11.7.2 | API type-safe |
| Drizzle ORM | 0.44.7 | ORM PostgreSQL |
| Zod | 4.1.13 | Validación |
| ioredis | 5.8.2 | Redis client |

### Infraestructura
| Tecnología | Uso |
|------------|-----|
| Vercel | Hosting/Edge |
| PostgreSQL | Base de datos |
| Redis | Cache/Sessions |
| Sentry | Error tracking |
| Docker | Containerización |

### Testing
| Tecnología | Uso |
|------------|-----|
| Vitest | Unit tests |
| Playwright | E2E tests |
| React Testing Library | Component tests |

## Referencias

- [Next.js Architecture](https://nextjs.org/docs/architecture)
- [tRPC Concepts](https://trpc.io/docs/concepts)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
