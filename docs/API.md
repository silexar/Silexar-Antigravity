# API Documentation - Silexar Pulse Quantum

## Base URL

```
Desarrollo: http://localhost:3000
Producción: https://api.silexarpulse.com
```

## Autenticación

### Better Auth Integration

El sistema utiliza **Better Auth** para autenticación con soporte para:
- Email/Password con verificación
- OAuth (Google, Microsoft, GitHub)
- JWT con refresh tokens
- Two-Factor Authentication (2FA)
- Session management

### Headers Requeridos

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
X-Tenant-ID: <tenant_uuid>  # Para multi-tenancy
```

### Endpoints de Autenticación

#### POST `/api/auth/login`

Autenticación de usuario.

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "securePassword123",
  "remember": true
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "nombre": "Juan Pérez",
    "roles": ["admin", "vendedor"],
    "tenantId": "tenant-uuid"
  },
  "token": "eyJhbGciOiJSUzI1NiIs...",
  "refreshToken": "refresh_token_here"
}
```

**Response (401):**
```json
{
  "error": "Invalid credentials",
  "code": "AUTH_INVALID_CREDENTIALS"
}
```

#### POST `/api/auth/refresh`

Renovar token JWT.

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIs...",
  "expiresIn": 3600
}
```

#### POST `/api/auth/logout`

Cerrar sesión.

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "success": true
}
```

#### GET `/api/auth/me`

Obtener información del usuario actual.

**Response (200):**
```json
{
  "id": "uuid",
  "email": "usuario@ejemplo.com",
  "nombre": "Juan Pérez",
  "avatar": "https://...",
  "roles": ["admin"],
  "permissions": ["campanas.create", "contratos.read"],
  "tenantId": "tenant-uuid",
  "createdAt": "2026-01-15T10:30:00Z"
}
```

---

## tRPC Routers

### Auth Router (`/api/trpc/auth.`)

#### `auth.getSession`

Obtiene la sesión actual del usuario.

```typescript
// Cliente
trpc.auth.getSession.query()

// Response
{
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
  } | null
}
```

#### `auth.updateProfile`

Actualiza el perfil del usuario.

```typescript
// Input
{
  nombre?: string;
  avatar?: string;
  telefono?: string;
}

// Cliente
trpc.auth.updateProfile.mutate({ nombre: "Nuevo Nombre" })
```

### Campaigns Router (`/api/trpc/campaigns.`)

#### `campaigns.getAll`

Lista campañas con filtros y paginación.

```typescript
// Input
{
  page?: number;
  limit?: number;
  estado?: 'borrador' | 'activa' | 'pausada' | 'finalizada';
  anuncianteId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  search?: string;
}

// Cliente
trpc.campaigns.getAll.query({ 
  page: 1, 
  limit: 20, 
  estado: 'activa' 
})

// Response
{
  campaigns: Campaign[];
  total: number;
  pages: number;
}
```

#### `campaigns.getById`

Obtiene detalle de una campaña.

```typescript
// Input
{
  id: string;
}

// Response
{
  id: string;
  numero: string;
  nombre: string;
  estado: string;
  presupuesto: number;
  presupuestoConsumido: number;
  anunciante: {
    id: string;
    nombre: string;
    razonSocial: string;
  };
  contrato: {
    id: string;
    numero: string;
  };
  lineasPauta: LineaPauta[];
  confirmaciones: Confirmacion[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### `campaigns.create`

Crea una nueva campaña.

```typescript
// Input
{
  nombre: string;
  anuncianteId: string;
  contratoId: string;
  presupuesto: number;
  fechaInicio: Date;
  fechaFin: Date;
  producto?: string;
  notas?: string;
}

// Cliente
trpc.campaigns.create.mutate({
  nombre: "Campaña Verano 2026",
  anuncianteId: "uuid-anunciante",
  contratoId: "uuid-contrato",
  presupuesto: 5000000,
  fechaInicio: new Date("2026-01-01"),
  fechaFin: new Date("2026-03-31")
})
```

#### `campaigns.update`

Actualiza una campaña existente.

```typescript
// Input
{
  id: string;
  nombre?: string;
  estado?: string;
  presupuesto?: number;
  fechaInicio?: Date;
  fechaFin?: Date;
}
```

#### `campaigns.delete`

Elimina una campaña (soft delete).

```typescript
// Input
{
  id: string;
}
```

#### `campaigns.addLineaPauta`

Agrega una línea de pauta a la campaña.

```typescript
// Input
{
  campanaId: string;
  emisoraId: string;
  bloqueId: string;
  fecha: Date;
  duracion: number; // segundos
  tarifa: number;
  cantidad: number;
}
```

### Contracts Router (`/api/trpc/contracts.`)

#### `contracts.getAll`

Lista contratos con filtros.

```typescript
// Input
{
  page?: number;
  limit?: number;
  estado?: 'borrador' | 'pendiente' | 'activo' | 'vencido' | 'cancelado';
  anuncianteId?: string;
  vendedorId?: string;
}
```

#### `contracts.getById`

Obtiene detalle de un contrato.

```typescript
// Response
{
  id: string;
  numero: string;
  estado: string;
  montoTotal: number;
  fechaInicio: Date;
  fechaFin: Date;
  anunciante: Anunciante;
  vendedor: Usuario;
  clausulas: Clausula[];
  cronograma: CronogramaPago[];
  campanas: CampanaSummary[];
}
```

#### `contracts.create`

Crea un nuevo contrato.

```typescript
// Input
{
  anuncianteId: string;
  vendedorId: string;
  montoTotal: number;
  fechaInicio: Date;
  fechaFin: Date;
  comision: number;
  clausulas?: ClausulaInput[];
}
```

### Cortex AI Router (`/api/trpc/cortex.`)

#### `cortex.getInsights`

Obtiene insights de IA para una entidad.

```typescript
// Input
{
  entityType: 'campana' | 'contrato' | 'anunciante';
  entityId: string;
}

// Response
{
  insights: {
    tipo: string;
    descripcion: string;
    severidad: 'info' | 'warning' | 'critical';
    recomendacion: string;
  }[];
  predicciones: {
    metrica: string;
    valorPredicho: number;
    confianza: number;
  }[];
}
```

#### `cortex.optimizeCampaign`

Optimiza una campaña usando IA.

```typescript
// Input
{
  campanaId: string;
  objetivo: 'alcance' | 'frecuencia' | 'conversion';
  restricciones?: {
    presupuestoMax?: number;
    fechasLocked?: boolean;
  };
}

// Response
{
  recomendaciones: {
    tipo: string;
    descripcion: string;
    impactoEstimado: number;
  }[];
  nuevaDistribucion?: LineaPauta[];
}
```

#### `cortex.predictDemand`

Predice demanda futura.

```typescript
// Input
{
  periodo: 'semana' | 'mes' | 'trimestre';
  emisoraId?: string;
  categoria?: string;
}

// Response
{
  predicciones: {
    fecha: Date;
    demandaPredicha: number;
    intervaloConfianza: [number, number];
  }[];
  factores: {
    factor: string;
    impacto: number;
  }[];
}
```

### Analytics Router (`/api/trpc/analytics.`)

#### `analytics.getDashboardMetrics`

Métricas para el dashboard principal.

```typescript
// Input
{
  periodo: '7d' | '30d' | '90d' | '1y';
  tenantId?: string;
}

// Response
{
  resumen: {
    totalCampanas: number;
    campanasActivas: number;
    presupuestoTotal: number;
    presupuestoEjecutado: number;
    conversionRate: number;
  };
  tendencias: {
    fecha: Date;
    valor: number;
  }[];
  topAnunciantes: {
    id: string;
    nombre: string;
    monto: number;
  }[];
}
```

---

## REST API Endpoints

### Health Check

#### GET `/api/health`

Verifica el estado del sistema.

**Response (200):**
```json
{
  "status": "healthy",
  "version": "2040.6.0",
  "timestamp": "2026-04-03T14:16:09Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "ai": "available"
  }
}
```

### Campaigns

#### GET `/api/campanas`

Lista campañas (REST alternativo).

**Query Parameters:**
- `page`: número de página
- `limit`: items por página
- `estado`: filtrar por estado
- `search`: búsqueda por nombre/número

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "numero": "C-2026-0001",
      "nombre": "Campaña Verano",
      "estado": "activa",
      "presupuesto": 5000000
    }
  ],
  "pagination": {
    "total": 150,
    "pages": 8,
    "current": 1,
    "limit": 20
  }
}
```

#### POST `/api/campanas`

Crear campaña vía REST.

**Request:**
```json
{
  "nombre": "Nueva Campaña",
  "anuncianteId": "uuid",
  "contratoId": "uuid",
  "presupuesto": 1000000
}
```

#### GET `/api/campanas/:id`

Obtener campaña por ID.

#### PUT `/api/campanas/:id`

Actualizar campaña.

#### DELETE `/api/campanas/:id`

Eliminar campaña.

### Confirmaciones

#### POST `/api/campanas/:id/confirmaciones/generar`

Generar confirmación de campaña.

**Request:**
```json
{
  "tipo": "orden_agencia",
  "incluirTarifas": true,
  "incluirBonificaciones": true
}
```

**Response (200):**
```json
{
  "confirmacionId": "uuid",
  "downloadUrl": "/api/campanas/uuid/confirmaciones/uuid.pdf",
  "previewUrl": "/api/campanas/uuid/confirmaciones/preview.pdf"
}
```

#### GET `/api/campanas/:id/confirmaciones/:confirmationId.pdf`

Descargar confirmación en PDF.

### Anunciantes

#### GET `/api/anunciantes`

Lista anunciantes.

#### POST `/api/anunciantes`

Crear anunciante.

**Request:**
```json
{
  "razonSocial": "Empresa S.A.",
  "rut": "76.123.456-7",
  "giro": "Retail",
  "contacto": {
    "nombre": "Juan Pérez",
    "email": "juan@empresa.cl",
    "telefono": "+56912345678"
  }
}
```

#### GET `/api/anunciantes/search`

Buscar anunciantes.

**Query Parameters:**
- `q`: término de búsqueda
- `limit`: máximo resultados

**Response (200):**
```json
{
  "results": [
    {
      "id": "uuid",
      "razonSocial": "Empresa S.A.",
      "rut": "76.123.456-7",
      "matchScore": 0.95
    }
  ]
}
```

### Emisiones

#### GET `/api/registro-emision/grilla`

Obtener grilla de emisiones.

**Query Parameters:**
- `fecha`: fecha específica
- `emisoraId`: filtrar por emisora
- `bloqueId`: filtrar por bloque

**Response (200):**
```json
{
  "fecha": "2026-04-03",
  "emisora": {
    "id": "uuid",
    "nombre": "Radio Ejemplo",
    "frecuencia": "100.1 FM"
  },
  "bloques": [
    {
      "id": "uuid",
      "nombre": "Mañana",
      "horaInicio": "08:00",
      "horaFin": "12:00",
      "emisones": [
        {
          "id": "uuid",
          "hora": "08:30",
          "cunaId": "uuid",
          "nombreCuna": "Spot Coca-Cola",
          "duracion": 30,
          "estado": "emitido"
        }
      ]
    }
  ]
}
```

---

## Webhooks

### Configuración

Los webhooks se configuran en `/api/webhooks`.

### Eventos Disponibles

| Evento | Descripción |
|--------|-------------|
| `campana.creada` | Nueva campaña creada |
| `campana.aprobada` | Campaña aprobada |
| `contrato.firmado` | Contrato firmado digitalmente |
| `cuna.emitida` | Cuña emitida en radio |
| `factura.generada` | Factura generada |
| `pago.recibido` | Pago recibido |

### Payload de Webhook

```json
{
  "id": "event-uuid",
  "type": "campana.creada",
  "timestamp": "2026-04-03T14:16:09Z",
  "tenantId": "tenant-uuid",
  "data": {
    "campanaId": "uuid",
    "numero": "C-2026-0001",
    "nombre": "Campaña Verano",
    "anuncianteId": "uuid"
  }
}
```

### Verificación de Firma

```typescript
import { createHmac } from 'crypto';

const signature = createHmac('sha256', webhookSecret)
  .update(JSON.stringify(payload))
  .digest('hex');

// Comparar con header X-Webhook-Signature
```

---

## Errores

### Formatos de Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El campo 'nombre' es requerido",
    "details": [
      {
        "field": "nombre",
        "message": "Campo requerido"
      }
    ],
    "requestId": "req-uuid",
    "timestamp": "2026-04-03T14:16:09Z"
  }
}
```

### Códigos de Error

| Código | HTTP | Descripción |
|--------|------|-------------|
| `UNAUTHORIZED` | 401 | Token inválido o expirado |
| `FORBIDDEN` | 403 | Sin permisos suficientes |
| `NOT_FOUND` | 404 | Recurso no encontrado |
| `VALIDATION_ERROR` | 400 | Error de validación |
| `RATE_LIMITED` | 429 | Límite de requests excedido |
| `INTERNAL_ERROR` | 500 | Error interno del servidor |
| `SERVICE_UNAVAILABLE` | 503 | Servicio temporalmente no disponible |

### Rate Limiting

Los headers de rate limiting se incluyen en todas las respuestas:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1712152569
```

---

## SDKs

### JavaScript/TypeScript

```typescript
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/routers/_app';

const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'https://api.silexarpulse.com/api/trpc',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  ],
});

// Uso
const campaigns = await trpc.campaigns.getAll.query({ page: 1 });
```

### React Hook

```typescript
import { trpc } from '@/lib/trpc/client';

function CampaignList() {
  const { data, isLoading } = trpc.campaigns.getAll.useQuery({
    page: 1,
    limit: 20,
  });

  const createMutation = trpc.campaigns.create.useMutation();

  return (
    // JSX
  );
}
```

---

## Versionado

La API sigue versionado semántico:

- **URL**: `/api/v2/...` (actual)
- **Breaking changes**: Nueva versión mayor
- **Features**: Nueva versión menor
- **Bug fixes**: Patch version

### Changelog API

Ver [CHANGELOG.md](../CHANGELOG.md) para cambios en la API.

---

## Soporte

- **Email**: api-support@silexarpulse.com
- **Documentación**: https://docs.silexarpulse.com
- **Status Page**: https://status.silexarpulse.com
