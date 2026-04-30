# Módulo Configuración - Documentación API

> **Versión:** 1.0.0  
> **Fecha:** 2026-04-27  
> **Clasificación:** INTERNO - CONFIDENCIAL

---

## 📋 Resumen de Endpoints

| Módulo | Endpoint Base | Métodos | Descripción |
|--------|--------------|---------|-------------|
| **Usuarios** | `/api/usuarios` | GET, POST | CRUD completo de usuarios |
| **Roles** | `/api/roles` | GET, POST | Gestión de roles |
| **Permisos** | `/api/permisos` | GET | Matriz de permisos |
| **Notificaciones** | `/api/notificaciones` | GET, POST | Configuración de notificaciones |
| **Políticas** | `/api/politicas` | GET, POST | Motor de políticas de negocio |
| **Cortex** | `/api/cortex` | GET | Dashboard de inteligencia |
| **SSO** | `/api/sso` | GET, POST | Configuración SSO |
| **Sellos** | `/api/sellos` | GET, POST | Certificaciones y sellos |
| **Brand Safety** | `/api/brand-safety` | GET, POST | Configuración de seguridad de marca |
| **Health** | `/api/health` | GET | Monitoreo de salud |
| **Backup** | `/api/backup` | GET, POST | Configuración de backup |
| **Feature Flags** | `/api/feature-flags` | GET, POST | Flags de características |
| **Kill Switches** | `/api/kill-switches` | GET, POST | Interruptores de emergencia |
| **Encryption** | `/api/encryption` | GET, POST | Servicio de encriptación |

---

## 🔐 Autenticación y Autorización

### Headers Requeridos

```
Authorization: Bearer <JWT_TOKEN>
X-Tenant-ID: <TENANT_UUID>
Content-Type: application/json
```

### Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| 200 | Éxito |
| 201 | Creado |
| 400 | Bad Request - Validación fallida |
| 401 | No autenticado |
| 403 | No autorizado (sin permisos) |
| 404 | Recurso no encontrado |
| 422 | Error de validación de negocio |
| 429 | Rate limit excedido |
| 500 | Error interno del servidor |

---

## 👥 MÓDULO: USUARIOS

### GET /api/usuarios

Lista todos los usuarios del tenant.

**Query Parameters:**
```typescript
{
  page?: number;        // default: 1
  limit?: number;       // default: 20, max: 100
  search?: string;      // Búsqueda por nombre/email
  estado?: 'ACTIVO' | 'INACTIVO' | 'PENDIENTE';
  rol?: string;
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "usuario@empresa.com",
      "nombre": "Juan Pérez",
      "rol": "ADMIN",
      "estado": "ACTIVO",
      "creadoAt": "2026-04-27T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### POST /api/usuarios

Crea un nuevo usuario.

**Body:**
```typescript
{
  email: string;           // Requerido, email válido
  nombre: string;          // Requerido, 1-200 caracteres
  rol: 'USUARIO' | 'ADMIN_CLIENTE' | 'SUPER_ADMIN';
  passwordTemporal?: boolean; // default: true
}
```

### GET /api/usuarios/[id]

Obtiene detalle de un usuario.

### PUT /api/usuarios/[id]

Actualiza un usuario.

### PATCH /api/usuarios/[id]

Actualización parcial de usuario (ej: cambiar estado).

### DELETE /api/usuarios/[id]

Elimina (soft delete) un usuario.

---

## 🎭 MÓDULO: ROLES

### GET /api/roles

Lista todos los roles disponibles.

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nombre": "ADMIN",
      "descripcion": "Administrador del sistema",
      "permisosCount": 45,
      "usuariosCount": 5
    }
  ]
}
```

### POST /api/roles

Crea un nuevo rol.

**Body:**
```typescript
{
  nombre: string;          // Requerido, único
  descripcion?: string;
  permisos: string[];      // Array de IDs de permisos
}
```

### GET /api/roles/[id]/permisos

Obtiene permisos de un rol específico.

### PUT /api/roles/[id]/permisos

Actualiza permisos de un rol.

---

## 🔑 MÓDULO: PERMISOS

### GET /api/permisos

Obtiene la matriz completa de permisos.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "roles": ["USUARIO", "ADMIN_CLIENTE", "SUPER_ADMIN"],
    "recursos": ["usuarios", "roles", "contratos", "campanas", "reportes"],
    "acciones": ["create", "read", "update", "delete", "export", "admin"],
    "matriz": {
      "USUARIO": {
        "usuarios": ["read"],
        "contratos": ["create", "read", "update"],
        "campanas": ["create", "read", "update", "delete"],
        "reportes": ["read", "export"]
      }
    }
  }
}
```

---

## 📢 MÓDULO: NOTIFICACIONES

### GET /api/notificaciones

Lista configuraciones de notificación.

**Query Parameters:**
```typescript
{
  canal?: 'EMAIL' | 'PUSH' | 'SMS' | 'IN_APP';
  tipo?: string;
  activa?: boolean;
}
```

### POST /api/notificaciones

Crea configuración de notificación.

**Body:**
```typescript
{
  nombre: string;
  canal: 'EMAIL' | 'PUSH' | 'SMS' | 'IN_APP';
  tipo: string;
  plantilla: string;
  activa: boolean;
  reglas: {
    timing?: string;
    condiciones?: Record<string, unknown>;
  };
}
```

---

## ⚙️ MÓDULO: POLÍTICAS DE NEGOCIO

### GET /api/politicas

Lista todas las políticas de negocio.

**Query Parameters:**
```typescript
{
  tipo?: 'VALIDACION' | 'AUTOMATIZACION' | 'NOTIFICACION';
  estado?: 'ACTIVA' | 'INACTIVA' | 'BORRADOR';
  prioridad?: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
}
```

### POST /api/politicas

Crea una nueva política.

**Body:**
```typescript
{
  nombre: string;
  descripcion: string;
  tipo: 'VALIDACION' | 'AUTOMATIZACION' | 'NOTIFICACION';
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  condiciones: {
    operador: 'AND' | 'OR';
    reglas: Array<{
      campo: string;
      operador: 'eq' | 'ne' | 'gt' | 'lt' | 'contains' | 'in';
      valor: unknown;
    }>;
  };
  acciones: Array<{
    tipo: 'APROBAR' | 'RECHAZAR' | 'NOTIFICAR' | 'ASIGNAR' | 'WEBHOOK';
    parametros: Record<string, unknown>;
  }>;
  estado: 'ACTIVA' | 'INACTIVA' | 'BORRADOR';
}
```

### POST /api/politicas/evaluar

Evalúa políticas para un contexto dado.

**Body:**
```typescript
{
  contexto: Record<string, unknown>;
  tipo?: string;
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "aplicadas": ["POL-001", "POL-003"],
    "resultado": "APROBADO",
    "detalle": [
      { "politicaId": "POL-001", "resultado": "APROBADA", "accionesEjecutadas": [] },
      { "politicaId": "POL-003", "resultado": "APROBADA", "accionesEjecutadas": ["NOTIFICAR"] }
    ]
  }
}
```

---

## 🧠 MÓDULO: CORTEX (Dashboard de Inteligencia)

### GET /api/cortex

Obtiene dashboard con métricas e inteligencia.

**Query Parameters:**
```typescript
{
  rango?: '24H' | '7D' | '30D' | '90D';
  granularidad?: '1H' | '1D' | '1W';
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "resumen": {
      "totalUsuarios": 1500,
      "usuariosActivos": 1200,
      "tasaCrecimiento": 5.2,
      "alertasPendientes": 3
    },
    "metricas": {
      "loginPorDia": [...],
      "usuariosPorRol": [...],
      "operacionesPorModulo": [...]
    },
    "tendencias": {
      "crecimientoUsuarios": [...],
      "usagePatterns": [...]
    },
    "alertas": [
      {
        "id": "alert-001",
        "tipo": "SEGURIDAD",
        "severidad": "ALTA",
        "mensaje": "Múltiples intentos de login fallidos",
        "timestamp": "2026-04-27T08:00:00Z"
      }
    ]
  }
}
```

---

## 🔐 MÓDULO: SSO (Single Sign-On)

### GET /api/sso

Lista configuraciones SSO disponibles.

### POST /api/sso

Crea configuración SSO.

**Body:**
```typescript
{
  nombre: string;
  proveedor: 'ACTIVE_DIRECTORY' | 'LDAP' | 'SAML' | 'OAUTH2' | 'OIDC' | 'GOOGLE_WORKSPACE' | 'MICROSOFT_GRAPH';
  configuracion: {
    // Para Active Directory
    servidor?: string;
    puerto?: number;
    baseDN?: string;
    
    // Para SAML
    idpEntityId?: string;
    idpSsoUrl?: string;
    idpCertificate?: string;
    
    // Para OAuth/OIDC
    clienteId?: string;
    clienteSecret?: string;
    issuerUrl?: string;
    
    // Configuración general
    enabled: boolean;
    autoProvisionamiento: boolean;
    sincronizarGrupos: boolean;
  };
}
```

### POST /api/sso/[id]/connect

Prueba conexión SSO.

---

## 🏅 MÓDULO: SELLOS DE CONFIANZA

### GET /api/sellos

Lista configuraciones de sellos.

### POST /api/sellos

Crea configuración de sello.

**Body:**
```typescript
{
  nombre: string;
  nivel: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  certificado: string;
  fechaObtencion: string;  // ISO date
  fechaVencimientos?: string;
  emisor: string;
  urlVerificacion?: string;
  requisitos: Record<string, boolean>;
}
```

---

## 🛡️ MÓDULO: BRAND SAFETY

### GET /api/brand-safety

Obtiene configuración de brand safety.

### POST /api/brand-safety

Crea/actualiza configuración.

**Body:**
```typescript
{
  nombre: string;
  categoria: 'MEDIA_BROADCAST' | 'DIGITAL_ADVERTISING' | 'E_COMMERCE' | 'FINANCIAL' | 'HEALTHCARE';
  estado: 'ACTIVO' | 'INACTIVO';
  restricciones: Array<{
    tipo: 'KEYWORD_BLOCK' | 'CATEGORY_BLOCK' | 'DOMAIN_BLOCK' | 'IPLOCATION_BLOCK';
    valor: string;
    accion: 'HIDE' | 'REJECT' | 'ALERT';
  }>;
  regulaciones: ('GDPR' | 'CCPA' | 'COPPA')[];
  horariosBloqueo: Array<{
    diaSemana: number[];
    horaInicio: string;
    horaFin: string;
    razon: string;
  }>;
}
```

---

## 💚 MÓDULO: HEALTH MONITORING

### GET /api/health

Obtiene estado de salud del sistema.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "estado": "HEALTHY",
    "timestamp": "2026-04-27T10:00:00Z",
    "componentes": {
      "database": { "status": "UP", "latencyMs": 12 },
      "cache": { "status": "UP", "latencyMs": 2 },
      "externalServices": { "status": "DEGRADED", "details": {...} }
    },
    "metricas": {
      "cpu": 45,
      "memory": 62,
      "disk": 38
    },
    "incidentesActivos": [
      {
        "id": "INC-001",
        "titulo": "Latencia elevada en API",
        "severidad": "P3",
        "inicio": "2026-04-27T08:00:00Z"
      }
    ],
    "sla": {
      "uptime24h": 99.95,
      "uptime30d": 99.98,
      "tiempoRespuestaP99": 245
    }
  }
}
```

---

## 💾 MÓDULO: BACKUP

### GET /api/backup

Lista configuraciones de backup.

### POST /api/backup

Crea configuración de backup.

**Body:**
```typescript
{
  nombre: string;
  tipo: 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL';
  frecuencia: {
    tipo: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    hora?: string;
    diaSemana?: number;
    diaMes?: number;
  };
  retencion: {
    diaria: number;    // Días
    semanal: number;  // Semanas
    mensual: number;   // Meses
    anual: number;     // Años
  };
  destino: {
    tipo: 'S3' | 'GCS' | 'AZURE_BLOB' | 'LOCAL';
    bucket?: string;
    ruta?: string;
    encriptado: boolean;
  };
  estado: 'ACTIVO' | 'PAUSADO';
}
```

---

## 🚩 MÓDULO: FEATURE FLAGS

### GET /api/feature-flags

Lista todos los feature flags.

**Query Parameters:**
```typescript
{
  ambiente?: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
  habilitado?: boolean;
}
```

### POST /api/feature-flags

Crea feature flag.

**Body:**
```typescript
{
  nombre: string;
  descripcion?: string;
  clave: string;        // Único, formato: FLAG-NOMBRE
  ambiente: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
  habilitado: boolean;
  reglas: Array<{
    tipo: 'ROL' | 'PORCENTAJE' | 'FECHA' | 'PARAMETRO';
    valor: unknown;
    prioridad: number;
  }>;
  metadata?: Record<string, unknown>;
}
```

---

## 🛑 MÓDULO: KILL SWITCHES

### GET /api/kill-switches

Lista kill switches.

### POST /api/kill-switches

Activa kill switch.

**Body:**
```typescript
{
  tipo: 'EMERGENCY_STOP' | 'MAINTENANCE_MODE' | 'SECURITY_LOCKDOWN' | 'RATE_LIMIT' | 'FEATURE_DISABLE' | 'CIRCUIT_BREAKER';
 理由: string;
  duracion?: number;     // Minutos, 0 = indefinido
  alcance: 'GLOBAL' | 'MODULO' | 'TENANT' | 'USUARIO';
  modulo?: string;       // Si alcance es MODULO
  parametro?: string;    // Si tipo es FEATURE_DISABLE o RATE_LIMIT
  metadata?: Record<string, unknown>;
}
```

### DELETE /api/kill-switches/[id]

Desactiva kill switch.

---

## 🔒 MÓDULO: ENCRYPTION SERVICE

### GET /api/encryption

Obtiene estado del servicio de encriptación.

### POST /api/encryption/encrypt

Encripta datos.

**Body:**
```typescript
{
  datos: string;
  tipo: 'AES_256_GCM' | 'RSA_4096';
  claveId?: string;      // Si no se provee, usa clave por defecto
  metadata?: Record<string, unknown>;
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "datosEncriptados": "base64...",
    "claveId": "key-2026-04",
    "algoritmo": "AES-256-GCM",
    "iv": "base64...",
    "tag": "base64..."
  }
}
```

### POST /api/encryption/decrypt

Desencripta datos.

---

## 📊 SCHEMAS COMPARTIDOS

### Pagination

```typescript
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

### API Response

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  pagination?: Pagination;
}
```

### Auditoría

Todos los endpoints de escritura (POST, PUT, PATCH, DELETE) generan logs de auditoría con:

```typescript
{
  timestamp: string;      // ISO 8601
  userId: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  resource: string;
  resourceId: string;
  tenantId: string;
  ipAddress: string;
  userAgent: string;
}
```

---

## 🔒 SEGURIDAD

### Rate Limiting

| Endpoint | Límite |
|----------|--------|
| `/api/auth/*` | 10 req/min/IP |
| `/api/usuarios` | 30 req/min/usuario |
| `/api/politicas/evaluar` | 100 req/min/usuario |
| Otros | 60 req/min/usuario |

### Validación

Todos los inputs son validados con Zod schemas. Los campos no definidos en el schema son rechazados (`.strict()`).

### Multi-tenancy

Todos los endpoints (excepto `/api/health` y `/api/auth/*`) requieren header `X-Tenant-ID`. Los datos son automáticamente filtrados por tenant.

---

## 📝 NOTAS DE VERSIÓN

### v1.0.0 (2026-04-27)
- Versión inicial del Módulo Configuración
- Implementación Enterprise-Grade completa
- 14 módulos de API documentados

---

*Documento clasificado como CONFIDENCIAL - Solo para uso interno*
