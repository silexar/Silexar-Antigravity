---
name: Silexar Module Builder — Enterprise-Grade Construction Protocol
version: 2.0.0
tier: ENTERPRISE_GRADE
description: >
  Protocolo Enterprise-Grade para construcción de módulos en Silexar Pulse.
  NO es un sistema MVP o TIER - es un sistema de PRODUCCIÓN empresarial.
  Se activa automáticamente ante solicitudes como "construir módulo", "nuevo módulo", 
  "crear módulo", "module creation", "build module" o "desarrollar módulo".
  Este protocolo garantiza sistemas de nivel empresarial con alta disponibilidad,
  seguridad hardened, escalabilidad, y cumplimiento normativo.
author: CEO Kimi — Silexar Pulse Engineering
last_updated: 2026-04-27
classification: ENTERPRISE_PRODUCTION
---

# 🚀 SILEXAR MODULE BUILDER — PROTOCOLO ENTERPRISE-GRADE v2.0

> **ADVERTENCIA CRÍTICA:** Este NO es un protocolo MVP, TIER 0, o construcción básica.
> Es un protocolo de PRODUCCIÓN EMPRESARIAL para sistemas que operan 24/7,
> manejan datos sensibles, y requieren uptime del 99.9%+. 
> Toda desviación debe justificarse técnicamente y documentarse.

---

## 🎯 CUÁNDO SE ACTIVA ESTE SKILL

Este skill DEBE usarse cuando el usuario solicite:
- "Construir el módulo de X"
- "Nuevo módulo de X"
- "Crear módulo de X"
- "Module creation for X"
- "Build a module for X"
- "Desarrollar módulo de X"
- "Necesito un módulo que haga X"
- "Agregar funcionalidad de X al sistema"
- Cualquier solicitud que involucre crear o modificar funcionalidades del sistema

---

## 🛑 PRE-FLIGHT CHECKLIST (OBLIGATORIO ANTES DE ESCRIBIR CÓDIGO)

Antes de tocar cualquier archivo de código, el agente DEBE:

1. **Leer `.agent/knowledge/SYSTEM_KNOWLEDGE_BASE.md`** — Buscar errores recurrentes [E###] y patrones [P###].
2. **Leer `CLAUDE.md`** — Confirmar stack tecnológico, estructura de carpetas y reglas de seguridad.
3. **Leer `.agent/skills/neumorphism-design/SKILL.md`** — Tokens visuales exactos.
4. **Decidir la categoría del módulo** (ver sección de categorías abajo)
5. **Crear `implementation_plan.md`** en `.agent/knowledge/plans/{modulo}/` con alcance, entidades, casos de uso y estimación.
6. **Validar que no exista ya** un módulo con nombre similar o funcionalidad superpuesta.

---

## 🏗️ ESTRUCTURA DE CONSTRUCCIÓN POR CATEGORÍA

### CATEGORÍA CRITICAL — DDD Completo + CQRS + Event Sourcing

Use esta categoría para módulos que serán el corazón del negocio: contratos, campañas, facturación, pagos, equipos de ventas, conciliación.

```
src/modules/{nombre-modulo}/
├── domain/
│   ├── entities/
│   │   ├── EntidadPrincipal.ts          # Factory create() + validación Zod
│   │   └── __tests__/
│   ├── value-objects/
│   │   ├── MiValueObject.ts             # Inmutable, equals(), toString()
│   │   └── __tests__/
│   ├── repositories/
│   │   └── IEntidadRepository.ts        # Interfaces puras
│   ├── domain-services/
│   │   └── MiDominioServicio.ts
│   ├── events/
│   │   └── EntidadCreadaEvent.ts
│   └── errors/
│       └── DomainErrors.ts
├── application/
│   ├── commands/
│   │   ├── CrearEntidadCommand.ts       # Zod schema + Command class
│   │   ├── ActualizarEntidadCommand.ts
│   │   └── __tests__/
│   ├── queries/
│   │   ├── BuscarEntidadesQuery.ts
│   │   └── __tests__/
│   ├── handlers/
│   │   ├── CrearEntidadHandler.ts       # Result Pattern obligatorio
│   │   └── __tests__/
│   ├── dto/
│   │   └── EntidadDTO.ts
│   └── interfaces/
│       └── IServicioExterno.ts
├── infrastructure/
│   ├── persistence/
│   │   └── EntidadDrizzleRepository.ts  # withTenantContext() en TODA query
│   ├── messaging/
│   │   └── EventPublisher.ts
│   ├── external/
│   │   └── MiServicioExterno.ts
│   └── security/
│       └── SeguridadImplementacion.ts
└── presentation/
    ├── api/
    │   ├── route.ts
    │   └── [id]/route.ts
    ├── components/
    │   └── EntidadCard.tsx
    ├── pages/
    │   └── EntidadListPage.tsx
    └── hooks/
        └── useEntidades.ts
```

**Reglas inquebrantables para Categoría CRITICAL:**
- `domain/` NO importa de `application/`, `infrastructure/`, `presentation/`, ni de otros módulos.
- `application/` solo importa `domain/` y contratos de `infrastructure/` (interfaces).
- `infrastructure/` importa `domain/` (interfaces) pero NO `application/`.
- `presentation/` importa `application/` y tipos de `domain/`.
- Commands y Handlers usan **Result Pattern** (`Result<T, Error>`).
- Toda query a base de datos usa `withTenantContext(tenantId, async () => { ... })`.
- **CQRS obligatorio**: Commands para writes, Queries para reads.
- **Event Sourcing**: Guardar historial de cambios como eventos.

### CATEGORÍA HIGH — DDD Parcial + Repository Pattern

Use esta categoría para módulos importantes: usuarios, permisos, anunciantes, agencias, emisoras.

```
src/modules/{nombre-modulo}/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── repositories/
│   └── events/
├── application/
│   ├── commands/
│   ├── queries/
│   └── handlers/
├── infrastructure/
│   ├── persistence/
│   └── external/
└── presentation/
    ├── api/
    └── components/
```

**Reglas:**
- Commands/Handlers usan Result Pattern
- Repository Pattern para acceso a datos
- withTenantContext() en todas las queries

### CATEGORÍA STANDARD — Service Layer Simple

Use esta categoría para utilidades administrativas, catálogos simples, configuraciones, dashboards de soporte.

```
src/app/{modulo}/
├── page.tsx                     # Listado + ModuleNavMenu
├── [id]/
│   ├── page.tsx                  # Detalle + ModuleNavMenu
│   └── editar/
│       └── page.tsx              # Edición + ModuleNavMenu
├── nuevo/
│   └── page.tsx                  # Creación + Botón "Ventana" (window.open popup) + ModuleNavMenu
├── ver/
│   └── page.tsx                  # Detalle standalone para ventana popup nativa (recibe ?id=XXX) + ModuleNavMenu
├── _components/
│   └── ModuloForm.tsx           # Formulario reutilizable
├── _hooks/
│   └── useModuloData.ts
└── layout.tsx (si aplica)

src/components/
└── module-nav-menu.tsx           # Menú de navegación global (importado en todas las páginas)

src/app/api/{modulo}/
├── route.ts                      # GET list + POST create
└── [id]/
    └── route.ts                  # GET detail + PUT update + PATCH + DELETE
```

**Reglas inquebrantables para Categoría STANDARD:**
- Todos los `route.ts` DEBEN usar `withApiRoute()`.
- Todos los inputs DEBEN validarse con **Zod**.
- Toda query a DB DEBE usar `withTenantContext()`.
- DEBE haber **audit logging** en CREATE, UPDATE, DELETE.
- El frontend DEBE usar los tokens neumorphism exactos.

---

## 📋 LAS 6 FASES INAMOVIBLES DE CONSTRUCCIÓN

```
FASE 1: PLAN + SCHEMA
  └─ implementation_plan.md + Diseño DB (Drizzle schema)

FASE 2: SEGURIDAD + API
  └─ API routes con withApiRoute + Zod + withTenantContext + audit

FASE 3: DOMINIO / LÓGICA DE NEGOCIO
  └─ Categoría CRITICAL: Entities + VOs + Commands + Handlers (Result Pattern)
  └─ Categoría STANDARD: Services + validaciones de negocio en API

FASE 4: FRONTEND
  └─ Páginas + Componentes con Neumorphism exacto + Mobile responsive + Scrollbars neumórficas + Botón "Ventana" popup + Menú de navegación `ModuleNavMenu` en todas las páginas

FASE 5: INTEGRACIÓN Y FLUJO COMPLETO
  └─ Conectar frontend → API → DB. Probar creación, edición, listado, eliminación.

FASE 6: QC + REGISTRO DE ERRORES
  └─ Verificar TypeScript, eliminar stubs, documentar lecciones aprendidas.
```

---

## 🔐 ESTÁNDARES DE ENCRIPTACIÓN OBLIGATORIOS (AES-256 ENTERPRISE)

### Requisito Inquebrantable: AES-256-GCM
**TODO** el manejo de datos sensibles DEBE usar AES-256-GCM como estándar mínimo. No se permite:
- AES-128 (insuficiente para nivel Enterprise)
- DES o 3DES (obsoletos)
- RC4 (comprometido)
- MD5 para hashing de passwords (usar bcrypt/argon2)

```
ALGORITMOS PERMITIDOS:
├── Symmetric Encryption:     AES-256-GCM (preferido), AES-256-CBC, ChaCha20-Poly1305
├── Asymmetric Encryption:     RSA-4096, EC-SECP256R1 (NIST P-256)
├── Hashing:                   bcrypt (passwords), SHA-256 (integridad)
├── MAC:                       HMAC-SHA256
├── Key Derivation:           Argon2id, PBKDF2 (min 100k iterations)
└── Post-Quantum (opcional):   Kyber-1024, NTRU-HRSS-701

ALGORITMOS PROHIBIDOS:
├── AES-128, DES, 3DES, RC4
├── MD5, SHA-1 (para passwords/integridad)
├── ECB mode (sin IV)
└── Any custom/legacy crypto
```

### Implementación de Encriptación
```typescript
// Datos en REST: Todos los campos sensibles (passwords, tokens, keys) DEBEN estar encriptados
// Datos en DB: AES-256-GCM con IV único por registro
// Datos en tránsito: TLS 1.3 mínimo (1.2 como fallback)

// Ejemplo de encriptación correcta:
interface EncryptedData {
  ciphertext: string;  // Base64 encoded
  iv: string;            // Base64 encoded, 12 bytes para GCM
  tag: string;           // Base64 encoded, 16 bytes para GCM
  keyId: string;         // Reference to key version
}

// Key rotation obligatoria: Máximo 90 días por clave
// Mínimo 3 versiones de clave activas
```

---

## 🏛️ COMPLIANCE FRAMEWORK (SOC 2 Tipo II + ISO 27001)

### Requisitos de Certificación
Para nivel Enterprise, los módulos DEBEN ser auditables para:
- **SOC 2 Tipo II**: Seguridad, disponibilidad, confidencialidad, privacidad
- **ISO 27001**: Sistema de gestión de seguridad de la información

```
CHECKLIST DE COMPLIANCE OBLIGATORIO:
├── [ ] Control de acceso basado en roles (RBAC)
├── [ ] Autenticación multi-factor (MFA)
├── [ ] Encriptación en reposo (AES-256)
├── [ ] Encriptación en tránsito (TLS 1.3)
├── [ ] Logs de auditoría inmutables (min 90 días)
├── [ ] Gestión de claves (key rotation, HSM)
├── [ ] Backups verificados y testeados
├── [ ] Plan de recuperación de desastres (DRP)
├── [ ] Notificación de incidentes (SLA 72 horas)
├── [ ] Pruebas de penetración anuales
└── [ ] Revisión de acceso trimestral
```

### Auditoría Continua
```typescript
// TODO acceso a datos DEBE generar log de auditoría
interface AuditEntry {
  timestamp: string;           // ISO 8601 UTC
  userId: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'LOGIN' | 'LOGOUT';
  resource: string;
  resourceId: string;
  tenantId: string;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, unknown>;
  result: 'SUCCESS' | 'FAILURE';
  complianceTags: string[];     // Para SOC2/ISO categorization
}
```

---

## 🛡️ ARQUITECTURA ZERO TRUST (Zero Trust Architecture)

### Principio Fundamental
**NUNCA confiar, SIEMPRE verificar** — Cada solicitud debe ser autenticada y autorizada, sin importar origen (red interna o externa).

```
ZERO TRUST MANDAMENTS:
1. Verify explicitly    → Autenticación + Autorización en cada request
2. Use least privilege → Mínimo acceso necesario para完成任务
3. Assume breach       → Segmentar red, encryptar todo, monitorear
4. Never trust, always verify → Microsegmentación, MFA everywhere
```

### Implementación Zero Trust en API
```typescript
// TODO: Middleware de verificación obligatorio
// Cada request DEBE pasar por:
1. Authentication  → JWT/Token validation, MFA check
2. Authorization   → RBAC + Attribute-based (ABAC)
3. Context check  → Device posture, location, time
4. Threat scan     → Rate limiting, anomaly detection

// Example Zero Trust middleware
async function zeroTrustVerify(ctx: RequestContext): Promise<boolean> {
  // 1. Token validation (no expired, no revoked)
  const token = await validateToken(ctx.token);
  
  // 2. MFA verification (if sensitive operation)
  if (ctx.operation.sensitivity === 'HIGH') {
    const mfaVerified = await verifyMFA(ctx.userId, ctx.mfaToken);
    if (!mfaVerified) return false;
  }
  
  // 3. Device trust (corporate device only for sensitive data)
  if (ctx.operation.requiresCorporateDevice) {
    const deviceTrusted = await verifyDevice(ctx.deviceId);
    if (!deviceTrusted) return false;
  }
  
  // 4. Location check (geo-blocking option)
  const locationAllowed = await verifyLocation(ctx.ipAddress, ctx.resource);
  if (!locationAllowed) return false;
  
  return true;
}
```

---

## 📊 AUDIT TRAILS EXHAUSTIVOS (Complete Audit Logging)

### Requisito: Cada clic, cambio o descarga DEBE ser logged
El sistema DEBE capturar absolutamente TODO para que el departamento de seguridad del cliente pueda auditar:

```
CATEGORÍAS DE AUDITORÍA OBLIGATORIAS:
├── DATA_ACCESS     → READ de cualquier recurso
├── DATA_MODIFICATION→ CREATE, UPDATE, DELETE
├── DATA_EXPORT     → Cualquier descarga de datos
├── AUTH_EVENTS     → Login, logout, MFA, password change
├── CONFIG_CHANGES  → Cambios en configuración del sistema
├── SECURITY_EVENTS → Intentos fallidos, violaciones, alertas
├── ADMIN_ACTIONS   → Operaciones de admins
└── API_ACCESS      → Cada llamada a API (opcional en alta frecuencia)
```

### Implementación de Audit Trail
```typescript
// TODO: Logging obligatorio en TODA operación sensible
interface CompleteAuditLog {
  // Identificación
  id: string;                    // UUID único
  timestamp: string;             // UTC ISO 8601, precision milliseconds
  
  // Quién
  userId: string;
  userEmail: string;
  userRole: string;
  sessionId: string;
  
  // Qué
  action: AuditAction;           // CREATE, READ, UPDATE, DELETE, EXPORT, etc.
  resource: string;              // Entity type: 'user', 'contract', 'config'
  resourceId: string;           // Specific resource ID
  resourceName?: string;        // Human readable name
  
  // Contexto
  tenantId: string;
  ipAddress: string;
  userAgent: string;
  location?: {                  // Geo location si disponible
    country: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  
  // Detalles
  requestMethod: string;         // GET, POST, PUT, DELETE
  requestPath: string;
  requestBody?: Record<string, unknown>; // Sanitized (no passwords)
  responseStatus: number;
  responseTimeMs: number;
  
  // Compliance
  complianceCategories: string[]; // ['SOC2', 'ISO27001', 'GDPR', 'HIPAA']
  dataClassification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  
  // Metadata
  metadata: Record<string, unknown>;
  previousValue?: unknown;       // Para tracking de cambios
  newValue?: unknown;
}

// LogRetention: Mínimo 90 días online, 7 años archivado
// Immutable: Una vez escrito, NUNCA se modifica o elimina
```

---

## 🔒 PATRONES DE SEGURIDAD ENTERPRISE (NO OPCIONALES)

### API Routes (CRÍTICO)
Cada `route.ts` que no sea público DEBE usar uno de estos wrappers:

```typescript
import { withApiRoute } from '@/lib/api/with-api-route';

export const GET = withApiRoute(
  { resource: 'modulo', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => { /* ... */ }
);

export const POST = withApiRoute(
  { resource: 'modulo', action: 'create' },
  async ({ ctx, req }) => { /* ... */ }
);
```

### Validación de Inputs (Zod - OBLIGATORIO)
```typescript
import { z } from 'zod';

// Validación exhaustiva con mensajes de error customizados
const crearSchema = z.object({
  nombre: z.string().min(1).max(255).regex(/^[a-zA-Z0-9\s]+$/, 'Solo letras, números y espacios'),
  email: z.string().email().optional(),
  monto: z.number().positive(),
}).strict(); // No permite campos extra

const parsed = crearSchema.safeParse(body);
if (!parsed.success) {
  return apiError('VALIDATION_ERROR', 'Datos inválidos', 422, parsed.error.flatten().fieldErrors);
}
```

### Multi-tenancy con RLS
```typescript
import { withTenantContext } from '@/lib/db/tenant-context';

const result = await withTenantContext(ctx.tenantId, async (db) => {
  return await db.select().from(tabla).where(eq(tabla.tenantId, ctx.tenantId));
});
```

### Audit Logging
```typescript
import { auditLogger } from '@/lib/security/audit-logger';
import { AuditEventType } from '@/lib/security/audit-types';

auditLogger.log({
  type: AuditEventType.DATA_CREATE,
  userId: ctx.userId,
  metadata: { module: 'modulo', resourceId: nuevoRegistro.id },
});
```

### Security Headers (OBLIGATORIO)
```typescript
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline';",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};
```

---

## 🛡️ CLIENT-SIDE SECURITY & ANTI-RECONNAISSANCE (PROTECCIÓN NAVEGADOR)

### Principio Fundamental
**El navegador es territorio enemigo** — Un atacante puede abrir DevTools, examinar código, manipular DOM, e interceptar requests. El código JavaScript enviado al cliente NUNCA debe revelar la estructura real del sistema, endpoints sensibles, o lógica de negocio crítica.

```
OBJETIVOS DE ANTI-RECONNAISSANCE:
1. Ofuscar estructura real del sistema
2. Generar ruido/distracción para analistas maliciosos
3. Detectar y responder a herramientas de análisis
4. Proteger API endpoints de descubrimiento
5. Prevenir manipulación del lado cliente
```

### 1. JavaScript Obfuscation (OBLIGATORIO en Producción)

```javascript
// next.config.js - Configuración de obfuscación
module.exports = {
  compiler: {
    // Eliminar console.log en producción
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Usar Terser para minificación agresiva
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info', 'console.debug'],
    },
    mangle: {
      // Mangle de nombres de variables
      properties: {
        regex: /^_/,
      },
    },
    format: {
      // Eliminar comentarios
      comments: false,
    },
  },
};

// Output: Código minificado sin nombres legibles
// Variables como: _0x1a2b3c, _0x4d5e6f en lugar de 'userId', 'tenantId'
```

### 2. DevTools Detection & Countermeasures

```typescript
// src/lib/security/devtools-detector.ts

/**
 * Detecta cuando un usuario abre DevTools y toma medidas defensivas.
 * IMPORTANTE: No revela que estamos detectando - solo actúa silenciosamente.
 */

type DetectionMethod = 'window-size' | 'debugger' | 'console-divert' | 'Timing';

interface DevToolsState {
  isOpen: boolean;
  detectionMethod: DetectionMethod;
  openCount: number;
  firstOpenTime?: Date;
  lastOpenTime?: Date;
}

class DevToolsDetector {
  private state: DevToolsState = {
    isOpen: false,
    detectionMethod: 'window-size',
    openCount: 0,
  };
  
  private readonly THRESHOLD_MS = 500;
  private readonly CHECK_INTERVAL = 500;
  private intervalId?: ReturnType<typeof setInterval>;

  constructor() {
    // Detección multi-method para mayor efectividad
    this.detectWindowSize();
    this.detectDebugger();
    this.startMonitoring();
  }

  private detectWindowSize(): void {
    // Técnica: Medir diferencia entre window.outerWidth y window.innerWidth
    // DevTools abierto = diferencia significativa
    const threshold = window.outerWidth - window.innerWidth;
    if (threshold > 200) {
      this.handleDevToolsOpen('window-size');
    }
  }

  private detectDebugger(): void {
    // Técnica: Medir tiempo de ejecución de debugger detection
    // Si debugger está activo, this check toma > threshold ms
    const start = performance.now();
    debugger; // No removed - intentional breakpoint check
    const elapsed = performance.now() - start;
    
    // Si toma más de threshold, probablemente debugger estaba activo
    if (elapsed > this.THRESHOLD_MS) {
      this.handleDevToolsOpen('debugger');
    }
  }

  private handleDevToolsOpen(method: DetectionMethod): void {
    this.state.openCount++;
    
    if (!this.state.isOpen) {
      this.state.firstOpenTime = new Date();
      this.state.isOpen = true;
      
      // Acciones defensivas SILENCIOSAS (no alert al usuario)
      // 1. Inyectar código corrupto en variables globales sensibles
      this.injectGarbageData();
      
      // 2. Destruir referencias a objetos sensibles
      this.clearSensitiveCache();
      
      // 3. Loggear el evento silenciosamente
      this.logSecurityEvent(method);
    }
    
    this.state.lastOpenTime = new Date();
  }

  private injectGarbageData(): void {
    // Sobrescribir window.__NEXT_DATA__ con datos falsos
    if (typeof window !== 'undefined') {
      try {
        // Crear referencias basura que confunden analysis
        const garbageKeys = ['_NEXT_DATA', '__INITIAL_STATE__', '__REDUX__'];
        garbageKeys.forEach(key => {
          try {
            const fakeData = this.generateFakeAppState();
            Object.defineProperty(window, key, {
              value: fakeData,
              writable: true,
              configurable: true,
            });
          } catch {
            // Silently fail if property can't be overwritten
          }
        });
      } catch {
        // Ignore errors
      }
    }
  }

  private generateFakeAppState(): Record<string, unknown> {
    // Generar estado falso que parece real pero no lo es
    return {
      props: {
        pageProps: {
          _N_T: this.randomString(16),
          _U: this.randomString(32),
          __R: this.randomString(8),
        },
      },
      __NEXT_DATA__: {
        buildId: this.randomString(32),
        runtimeConfig: {
          public: {
            API_URL: 'https://api.decoy-site.com',
            CDN_URL: 'https://cdn.decoy-cdn.net',
          },
        },
      },
    };
  }

  private randomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private clearSensitiveCache(): void {
    // Limpiar cualquier cache en memoria que contenga datos sensibles
    try {
      if (typeof sessionStorage !== 'undefined') {
        // No limpiamos todo - eso sería sospechoso
        // Solo limpiamos items específicos que podrían ser útiles para attackers
        const sensitiveKeys = ['apiTokens', 'debug_session', 'devToolsOpen'];
        sensitiveKeys.forEach(key => sessionStorage.removeItem(key));
      }
    } catch {
      // Ignore errors
    }
  }

  private logSecurityEvent(method: DetectionMethod): void {
    // Enviar log al servidor de manera no-blockeante
    try {
      fetch('/api/security/devtools-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          sessionId: this.getSessionId(),
        }),
      }).catch(() => {
        // Silently fail - no throw
      });
    } catch {
      // Ignore errors
    }
  }

  private getSessionId(): string {
    // Retornar session ID actual o 'unknown'
    try {
      return sessionStorage.getItem('session_id') || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private startMonitoring(): void {
    // Check periódico para DevTools
    this.intervalId = setInterval(() => {
      this.detectWindowSize();
    }, this.CHECK_INTERVAL);
  }

  public destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

// Singleton para uso global
let detectorInstance: DevToolsDetector | null = null;

export function initDevToolsProtection(): DevToolsDetector {
  if (typeof window === 'undefined') {
    throw new Error('DevTools protection only works in browser');
  }
  
  if (!detectorInstance) {
    detectorInstance = new DevToolsDetector();
  }
  
  return detectorInstance;
}

export { DevToolsDetector };
```

### 3. Console Distraction Patterns (DISTRACTORES DE SEGURIDAD)

```typescript
// src/lib/security/console-distractor.ts

/**
 * Sistema de distracción via console.log
 * Cuando un attacker abre la consola, ve ruido falso que no tiene relación con el sistema real.
 * Los logs reales son encriptados o enviados via fetch, no via console.
 */

interface DistractorConfig {
  enabled: boolean;
  noiseLevel: 'minimal' | 'moderate' | 'aggressive';
  fakeModules: string[];
  fakeEndpoints: string[];
  fakeErrors: string[];
}

class ConsoleDistractor {
  private config: DistractorConfig;
  private originalConsole: typeof console;
  private noiseInterval?: ReturnType<typeof setInterval>;
  
  // Módulos falsos que parecen reales pero no existen
  private readonly FAKE_MODULES = [
    'AnalyticsService', 'TrackingModule', 'MetricsCollector',
    'UserBehaviorTracker', 'HeatmapGenerator', 'SessionRecorder',
    'ABTestEngine', 'FeatureFlagClient', 'RemoteConfigReader',
    'CacheSyncManager', 'WebSocketManager', 'PushNotificationHandler',
  ];

  // Endpoints falsos para confundir analysis de red
  private readonly FAKE_ENDPOINTS = [
    '/api/v1/analytics/pageview',
    '/api/v2/metrics/performance',
    '/api/internal/telemetry',
    '/api/cdn/asset-manifest',
    '/api/tracking/click',
    '/api/session/heartbeat',
    '/api/push/subscribe',
    '/api/remote-config/sync',
  ];

  // Mensajes de error falsos que no revelan nada real
  private readonly FAKE_ERRORS = [
    'Failed to load analytics module: Network timeout',
    'Tracking pixel not found: Using fallback',
    'Metrics buffer full: Draining to localStorage',
    'WebSocket connection failed: Attempting reconnect',
    'Feature flag timeout: Using default value',
    'Cache miss for key: recalculating',
    'Session sync failed: Will retry in 30s',
    'CDN asset manifest outdated: Using bundled assets',
  ];

  constructor(config: DistractorConfig) {
    this.config = config;
    this.originalConsole = { ...console };
    
    if (config.enabled && typeof window !== 'undefined') {
      this.installDistractors();
    }
  }

  private installDistractors(): void {
    // Sobrescribir console.log con versión que inyecta ruido
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args: unknown[]) => {
      // Solo interceptar logs nuestros, no de librerías
      const firstArg = args[0];
      if (typeof firstArg === 'string' && firstArg.startsWith('[Silexar]')) {
        // Es un log real - reenviar silenciosamente via fetch
        this.sendRealLog('log', args);
        // No mostrar en consola en producción
        if (process.env.NODE_ENV !== 'production') {
          originalLog.apply(console, args);
        }
      } else {
        // Log normal o de librería
        originalLog.apply(console, args);
      }
    };

    console.warn = (...args: unknown[]) => {
      this.sendRealLog('warn', args);
      if (process.env.NODE_ENV !== 'production') {
        originalWarn.apply(console, args);
      }
    };

    console.error = (...args: unknown[]) => {
      // En producción, mostrar error falso pero no el real
      if (process.env.NODE_ENV === 'production') {
        this.injectFakeError();
      } else {
        originalError.apply(console, args);
      }
    };

    // Inyectar periódicamente logs de ruido
    this.startNoiseInjection();
  }

  private sendRealLog(level: string, args: unknown[]): void {
    // Enviar logs reales al servidor de logging, NO a la consola
    try {
      fetch('/api/internal/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          args: this.sanitizeArgs(args),
          timestamp: Date.now(),
          sessionId: this.getSessionId(),
        }),
        keepalive: true, // Enviar incluso si la página se cierra
      }).catch(() => {
        // Silently fail
      });
    } catch {
      // Ignore
    }
  }

  private sanitizeArgs(args: unknown[]): unknown[] {
    // Remover cualquier dato sensible de los logs
    return args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        const sanitized = { ...arg } as Record<string, unknown>;
        const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'auth'];
        sensitiveKeys.forEach(key => {
          if (key in sanitized) {
            sanitized[key] = '[REDACTED]';
          }
        });
        return sanitized;
      }
      return arg;
    });
  }

  private startNoiseInjection(): void {
    if (this.config.noiseLevel === 'minimal') return;

    const interval = this.config.noiseLevel === 'aggressive' ? 3000 : 8000;
    
    this.noiseInterval = setInterval(() => {
      this.injectNoise();
    }, interval);
  }

  private injectNoise(): void {
    if (this.config.noiseLevel === 'minimal') return;

    const { noiseLevel, fakeModules, fakeEndpoints } = this.config;

    // Injectar logs falsos de módulos que no existen
    if (noiseLevel !== 'minimal') {
      const module = fakeModules[Math.floor(Math.random() * fakeModules.length)];
      const action = Math.random() > 0.5 ? 'initialized' : 'syncing';
      this.originalConsole.log.call(console, 
        `%c[Internal] ${module} ${action}`,
        'color: #888; font-size: 10px;'
      );
    }

    // Injectar logs de endpoints falsos
    if (noiseLevel === 'aggressive') {
      const endpoint = fakeEndpoints[Math.floor(Math.random() * fakeEndpoints.length)];
      const methods = ['GET', 'POST', 'PUT'];
      const method = methods[Math.floor(Math.random() * methods.length)];
      
      this.originalConsole.log.call(console,
        `%c[Network] ${method} ${endpoint} 200 OK`,
        'color: #666; font-size: 10px;',
        { duration: Math.floor(Math.random() * 500) + 50, size: Math.floor(Math.random() * 1000) }
      );
    }
  }

  private injectFakeError(): void {
    // Mostrar error falso, no el real
    const fakeError = this.FAKE_ERRORS[
      Math.floor(Math.random() * this.FAKE_ERRORS.length)
    ];
    
    this.originalConsole.error.call(console,
      `%cError: ${fakeError}`,
      'color: #cc0000; font-weight: bold;'
    );
  }

  private getSessionId(): string {
    try {
      return sessionStorage.getItem('session_id') || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  public destroy(): void {
    if (this.noiseInterval) {
      clearInterval(this.noiseInterval);
    }
    // Restaurar console original
    console.log = this.originalConsole.log;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
  }
}

// Factory function para inicializar
export function initConsoleProtection(
  noiseLevel: DistractorConfig['noiseLevel'] = 'moderate'
): ConsoleDistractor {
  return new ConsoleDistractor({
    enabled: true,
    noiseLevel,
    fakeModules: [], // Usar defaults
    fakeEndpoints: [],
    fakeErrors: [],
  });
}
```

### 4. Content Security Policy (CSP) Hardening

```typescript
// src/lib/security/csp-hardener.ts

/**
 * CSP estricto para prevenir XSS, injection, y acceso a recursos no autorizados.
 * Implementación Enterprise-Grade con reporting de violaciones.
 */

interface CSPDirectives {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'font-src': string[];
  'connect-src': string[];
  'frame-src': string[];
  'object-src': string[];
  'base-uri': string[];
  'form-action': string[];
  'frame-ancestors': string[];
  'report-uri'?: string;
  'report-to'?: string;
}

class CSPHardener {
  private directives: CSPDirectives;
  private reportListener?: (event: SecurityPolicyViolationEvent) => void;

  constructor() {
    this.directives = this.getDefaultDirectives();
  }

  private getDefaultDirectives(): CSPDirectives {
    return {
      // Solo permitir recursos del mismo origen por defecto
      'default-src': ["'self'"],
      
      // Scripts: solo del mismo origen y inline para Next.js
      // NOTA: En producción, considerar Content-Security-Policy-Report-Only
      // y migrar a scripts externos gradualmente
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Next.js requiere estos
      
      // Styles: solo inline y del mismo origen (Next.js)
      'style-src': ["'self'", "'unsafe-inline'"],
      
      // Imágenes: mismo origen + CDNs legítimos
      'img-src': [
        "'self'",
        'data:', // Para SVGs inline
        'blob:', // Para imágenes blob
        'https://images.unsplash.com', // Ejemplo CDN válido
        'https://*.s3.amazonaws.com', // Ejemplo storage válido
      ],
      
      // Fonts: Google Fonts u otros CDNs aprobados
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
      ],
      
      // Conexiones: solo APIs nuestro
      'connect-src': [
        "'self'",
        // IMPORTANTE: No incluir APIs externas aquí
        // Cada API externa debe listarse explícitamente
      ],
      
      // Frames: ninguno permitido (previene clickjacking)
      'frame-src': ["'none'"],
      
      // Objects: ninguno (previene Flash-based attacks)
      'object-src': ["'none'"],
      
      // Base URI: solo mismo origen
      'base-uri': ["'self'"],
      
      // Form actions: solo a nuestro dominio
      'form-action': ["'self'"],
      
      // Frame ancestors: prevenir clickjacking
      'frame-ancestors': ["'none'"],
    };
  }

  /**
   * Añadir dominio a whitelist de img-src
   */
  addAllowedImageDomain(domain: string): void {
    if (!this.directives['img-src'].includes(domain)) {
      this.directives['img-src'].push(domain);
    }
  }

  /**
   * Añadir API endpoint a connect-src
   */
  addAllowedApiEndpoint(endpoint: string): void {
    if (!this.directives['connect-src'].includes(endpoint)) {
      this.directives['connect-src'].push(endpoint);
    }
  }

  /**
   * Generar header CSP string
   */
  buildPolicy(): string {
    const parts: string[] = [];
    
    for (const [directive, values] of Object.entries(this.directives)) {
      if (values.length > 0) {
        parts.push(`${directive} ${values.join(' ')}`);
      }
    }
    
    return parts.join('; ');
  }

  /**
   * Aplicar CSP al documento actual
   */
  apply(): void {
    if (typeof document === 'undefined') return;

    const policy = this.buildPolicy();
    
    // Aplicar como meta tag (para有些浏览器不支持 header)
    let meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'Content-Security-Policy');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', policy);
  }

  /**
   * Configurar reporting de violaciones CSP
   */
  enableReporting(reportUri: string): void {
    this.directives['report-uri'] = reportUri;
    
    // Crear endpoint de reporting en el servidor
    // POST /api/security/csp-violation con body:
    // { "csp-report": { "document-uri": "...", "violated-directive": "...", ... } }
    
    if (typeof document !== 'undefined') {
      this.reportListener = (event: SecurityPolicyViolationEvent) => {
        // Enviar reporte silenciosamente
        fetch(reportUri, {
          method: 'POST',
          mode: 'no-cors', // No esperamos respuesta
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            'csp-report': {
              'document-uri': event.documentURI,
              'referrer': event.referrer,
              'violated-directive': event.violatedDirective,
              'original-policy': event.originalPolicy,
              'blocked-uri': event.blockedURI,
              'timestamp': Date.now(),
            },
          }),
        }).catch(() => {
          // Silently fail
        });
      };

      document.addEventListener('securitypolicyviolation', this.reportListener);
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.reportListener && typeof document !== 'undefined') {
      document.removeEventListener('securitypolicyviolation', this.reportListener);
    }
  }
}

// Singleton
let cspInstance: CSPHardener | null = null;

export function initCSP(): CSPHardener {
  if (!cspInstance) {
    cspInstance = new CSPHardener();
    
    // En producción, aplicar CSP
    if (process.env.NODE_ENV === 'production') {
      cspInstance.apply();
      // Habilitar reporting en endpoint propio
      cspInstance.enableReporting('/api/security/csp-violation');
    }
  }
  
  return cspInstance;
}
```

### 5. Anti-Tampering Measures (Protección contra Manipulación)

```typescript
// src/lib/security/anti-tamper.ts

/**
 * Detecta y responde a manipulación del lado cliente:
 * - Modificación de DOM
 * - Inyección de scripts
 * - Uso de proxies/mitm
 * - Modificación de cookies/localStorage
 */

interface TamperEvent {
  type: 'dom-modification' | 'script-injection' | 'proxy-detected' | 'storage-tamper';
  timestamp: number;
  details: string;
  severity: 'low' | 'medium' | 'high';
}

class AntiTamperProtection {
  private events: TamperEvent[] = [];
  private mutationObserver?: MutationObserver;
  private readonly MAX_EVENTS = 100;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initDOMMonitoring();
      this.checkForProxies();
      this.monitorStorage();
    }
  }

  private initDOMMonitoring(): void {
    // Observar mutaciones del DOM para detectar inyección
    const targetNode = document.documentElement;
    
    this.mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // Detectar scripts inyectados
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node instanceof HTMLScriptElement) {
              // Script añadido dinámicamente - verificar si es nuestro
              if (!this.isTrustedScript(node)) {
                this.handleTamperEvent({
                  type: 'script-injection',
                  timestamp: Date.now(),
                  details: `Script injected: ${node.src || node.textContent?.substring(0, 100)}`,
                  severity: 'high',
                });
              }
            }
          }
        }
        
        // Detectar cambios en atributos
        if (mutation.type === 'attributes') {
          const target = mutation.target as HTMLElement;
          // Verificar si se modificó algo sensible
          if (target.tagName === 'FORM' || target.tagName === 'INPUT') {
            this.handleTamperEvent({
              type: 'dom-modification',
              timestamp: Date.now(),
              details: `Attribute changed on ${target.tagName}: ${mutation.attributeName}`,
              severity: 'low',
            });
          }
        }
      }
    });

    this.mutationObserver.observe(targetNode, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['action', 'method', 'type', 'name'], // Solo atributos sensibles
    });
  }

  private isTrustedScript(script: HTMLScriptElement): boolean {
    // Verificar si el script es de una fuente confiable
    const src = script.src;
    const selfOrigin = window.location.origin;
    
    // Scripts del mismo origen son trusteds
    if (src.startsWith(selfOrigin)) return true;
    
    // Scripts con nonce (CSP) son trusteds
    if (script.nonce) return true;
    
    // CDNs externos autorizados deben listarse aquí
    const trustedDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://unpkg.com', // Deshabilitar en producción
      'https://cdnjs.cloudflare.com',
    ];
    
    return trustedDomains.some(domain => src.startsWith(domain));
  }

  private checkForProxies(): void {
    // Detectar uso de proxies como Burp Suite, Charles, Fiddler
    // Estos proxies típicamente añaden headers específicos
    
    const proxyIndicators = [
      ' _captain', // Charles Proxy
      ' __proto__ ', // General proxy indicator
    ];

    // Check for proxy-modified objects
    try {
      // Intentar acceder a propiedades que solo existen con proxies
      const test = (window as unknown as Record<string, unknown>)[' _captain'];
      if (test !== undefined) {
        this.handleTamperEvent({
          type: 'proxy-detected',
          timestamp: Date.now(),
          details: 'Charles Proxy or similar detected',
          severity: 'medium',
        });
      }
    } catch {
      // Ignore
    }
  }

  private monitorStorage(): void {
    // Monitorear cambios en sessionStorage y localStorage
    // Un attacker podría intentar manipular estos valores
    
    const originalSetItem = Storage.prototype.setItem;
    const originalRemoveItem = Storage.prototype.removeItem;
    
    Storage.prototype.setItem = (...args: [string, string]) => {
      // Loggear intento de escritura (no bloquear - eso sería detectable)
      if (args[0].match(/(token|auth|key|session)/i)) {
        this.handleTamperEvent({
          type: 'storage-tamper',
          timestamp: Date.now(),
          details: `Attempting to set sensitive key: ${args[0]}`,
          severity: 'low',
        });
      }
      return originalSetItem.apply(this, args);
    };
    
    Storage.prototype.removeItem = (...args: [string]) => {
      if (args[0].match(/(token|auth|key|session)/i)) {
        this.handleTamperEvent({
          type: 'storage-tamper',
          timestamp: Date.now(),
          details: `Attempting to remove sensitive key: ${args[0]}`,
          severity: 'medium',
        });
      }
      return originalRemoveItem.apply(this, args);
    };
  }

  private handleTamperEvent(event: TamperEvent): void {
    this.events.push(event);
    
    // Mantener solo últimos MAX_EVENTS
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }
    
    // Enviar al servidor de seguridad
    this.reportEvent(event);
    
    // Respuesta basada en severity
    if (event.severity === 'high') {
      this.respondToHighSeverityTamper(event);
    }
  }

  private respondToHighSeverityTamper(event: TamperEvent): void {
    // Acciones defensivas para eventos de alta severidad
    // No alert() - eso es muy obvio
    
    // 1. Invalidar sesión actual
    try {
      fetch('/api/security/invalidate-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'tamper_detected',
          eventType: event.type,
          timestamp: event.timestamp,
        }),
      }).catch(() => {});
    } catch {}
    
    // 2. Limpiar datos sensibles de memoria
    try {
      sessionStorage.clear();
    } catch {}
    
    // 3. Redirigir a página de error genérica (no revelar el problema)
    setTimeout(() => {
      window.location.href = '/error?code=SESSION_ERROR';
    }, 100);
  }

  private reportEvent(event: TamperEvent): void {
    // Enviar reporte al servidor
    try {
      fetch('/api/security/tamper-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }

  public getEvents(): TamperEvent[] {
    return [...this.events];
  }

  public destroy(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }
}

// Singleton
let antiTamperInstance: AntiTamperProtection | null = null;

export function initAntiTamper(): AntiTamperProtection {
  if (typeof window === 'undefined') {
    throw new Error('Anti-tamper only works in browser');
  }
  
  if (!antiTamperInstance) {
    antiTamperInstance = new AntiTamperProtection();
  }
  
  return antiTamperInstance;
}
```

### 6. API Security Endpoint (Backend Required)

```typescript
// src/app/api/security/devtools-event/route.ts
// src/app/api/security/csp-violation/route.ts  
// src/app/api/security/tamper-event/route.ts

/**
 * Endpoints internos para recibir eventos de seguridad del cliente.
 * NO son públicos - deben estar protegidos por IP whitelist o similar.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiRoute } from '@/lib/api/with-api-route';
import { auditLogger } from '@/lib/security/audit-logger';
import { AuditEventType } from '@/lib/security/audit-types';

const devtoolsEventSchema = z.object({
  method: z.string(),
  timestamp: z.string(),
  userAgent: z.string(),
  sessionId: z.string(),
});

// Honeypot: Endpoint que parece existir pero realmente es un distractor
// Los requests legítimos nunca vendrán aquí - solo atacantes escaneando

export const POST = withApiRoute(
  { resource: 'internal', action: 'create', skipCsrf: true, skipTenant: true },
  async ({ req }) => {
    try {
      const body = await req.json();
      const parsed = devtoolsEventSchema.safeParse(body);
      
      if (!parsed.success) {
        // Invalidar sesión por intento de malformed request
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
      }

      // Log el evento
      auditLogger.log({
        type: AuditEventType.SECURITY_ALERT,
        userId: 'SYSTEM',
        metadata: {
          event: 'devtools_opened',
          method: parsed.data.method,
          userAgent: parsed.data.userAgent,
          sessionId: parsed.data.sessionId,
          ip: req.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      // Posibles acciones:
      // 1. Marcar sesión para revisión
      // 2. Alertar a security team
      // 3. Iniciar captura de session para forensics
      // 4. Bloquear IP si hay múltiples intentos

      return NextResponse.json({ received: true });
    } catch (error) {
      return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
  }
);
```

### 7. Integration in _app.tsx or layout.tsx

```typescript
// src/app/providers.tsx o src/app/layout.tsx

'use client';

import { useEffect } from 'react';

export function SecurityProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Solo inicializar en el cliente, nunca en SSR
    if (typeof window === 'undefined') return;

    // 1. DevTools Protection
    try {
      const { initDevToolsProtection } = await import('@/lib/security/devtools-detector');
      initDevToolsProtection();
    } catch {}

    // 2. Console Distractors
    try {
      const { initConsoleProtection } = await import('@/lib/security/console-distractor');
      initConsoleProtection('moderate'); // 'minimal' | 'moderate' | 'aggressive'
    } catch {}

    // 3. CSP Hardening
    try {
      const { initCSP } = await import('@/lib/security/csp-hardener');
      initCSP();
    } catch {}

    // 4. Anti-Tamper
    try {
      const { initAntiTamper } = await import('@/lib/security/anti-tamper');
      initAntiTamper();
    } catch {}
  }, []);

  return <>{children}</>;
}
```

### Checklist de Client-Side Security

```
CLIENT-SIDE ANTI-RECONNAISSANCE CHECKLIST:
├── [ ] JavaScript minification enabled (removeConsole: true)
├── [ ] DevTools detection implemented
├── [ ] Console distraction noise configured
├── [ ] CSP headers strict (frame-ancestors 'none')
├── [ ] Anti-tampering monitoring active
├── [ ] Sensitive data NOT logged to console
├── [ ] Real logs sent via fetch, not console.log
├── [ ] No source maps in production
├── [ ] API endpoints NOT exposed in client-side code
├── [ ] Fake/honeypot endpoints configured (optional)
├── [ ] Canary tokens in place (optional)
└── [ ] Security event logging to server configured
```

---

## 🎯 THREAT MODELING FORMAL (STRIDE/MITRE ATT&CK)

### Principio Fundamental
**Todo sistema DEBE documentar sus amenazas** — Antes de construir, identificar qué puede salir mal, quién puede atacar, cómo lo harían, y qué mitigaciones existen. Sin threat modeling, estás construyendo a ciegas.

```
THREAT MODELING ES OBLIGATORIO PARA:
├── Módulos Categoría CRITICAL (contratos, pagos, facturación)
├── Módulos que manejan datos sensibles (PII, financieros)
├── Módulos con APIs externas (SSO, webhooks)
├── Módulos con componentes de IA (Will, asistente)
└── Cualquier módulo nuevo ANTES de iniciar desarrollo
```

### 1. STRIDE Threat Modeling

```typescript
// STRIDE: Framework de Microsoft para categorizar amenazas
// Cada amenaza encaja en una de estas categorías:

/*
┌─────────┬─────────────────────────────────────────────────────────────┐
│ THREAT  │ DESCRIPCIÓN                                                │
├─────────┼─────────────────────────────────────────────────────────────┤
│ S       │ Spoofing - Falsificar identidad                            │
│ T       │ Tampering - Modificar datos o código                       │
│ R       │ Repudiation - Negar haber realizado una acción             │
│ I       │ Information Disclosure - Exponer información confidencial  │
│ D       │ Denial of Service - Hacer sistema no disponible           │
│ E       │ Elevation of Privilege - Obtener acceso no autorizado      │
└─────────┴─────────────────────────────────────────────────────────────┘
*/
```

### 2. MITRE ATT&CK Framework Integration

```typescript
// MITRE ATT&CK: Matriz de técnicas de ataque conocidas
// Mapear cada amenaza a técnicas específicas para saber exactamente 
// cómo se defenderían.

// Ejemplo de Threat Model para Módulo de Usuarios:

const THREAT_MODEL_USERS = {
  name: 'User Management Module',
  category: 'CRITICAL',
  
  // Assets (qué estamos protegiendo)
  assets: [
    { name: 'User Credentials', classification: 'RESTRICTED' },
    { name: 'Personal Identifiable Information', classification: 'CONFIDENTIAL' },
    { name: 'Session Tokens', classification: 'RESTRICTED' },
    { name: 'Role/Permission Mappings', classification: 'INTERNAL' },
  ],
  
  // TRUST BOUNDARIES (dónde cambian los niveles de confianza)
  trustBoundaries: [
    { from: 'Internet', to: 'Load Balancer', trust: 'NONE' },
    { from: 'Load Balancer', to: 'API Gateway', trust: 'PARTIAL' },
    { from: 'API Gateway', to: 'Application', trust: 'AUTHENTICATED' },
    { from: 'Application', to: 'Database', trust: 'FULL' },
  ],
  
  // DATA FLOWS (cómo viajan los datos)
  dataFlows: [
    { flow: 'Login Form → API', protocol: 'HTTPS', encryption: 'TLS 1.3' },
    { flow: 'API → Database', protocol: 'PostgreSQL', encryption: 'SSL' },
    { flow: 'API → Cache', protocol: 'Redis', encryption: 'TLS' },
  ],
  
  // THREATS (analizados con STRIDE + ATT&CK)
  threats: [
    {
      id: 'T1',
      stride: 'S', // Spoofing
      name: 'Credential Stuffing',
      att&ck: ['T1110.001', 'Brute Force - Password Guessing'],
      description: 'Attacker uses leaked credentials from other breaches',
      likelihood: 'HIGH',
      impact: 'CRITICAL',
      mitigations: [
        { control: 'Rate Limiting', implementation: 'max 5 attempts per 15min' },
        { control: 'MFA Enforcement', implementation: 'TOTP required for all users' },
        { control: 'Password Breach Checking', implementation: 'HaveIBeenPwned API' },
        { control: 'CAPTCHA', implementation: 'After 3 failed attempts' },
      ],
    },
    {
      id: 'T2',
      stride: 'T', // Tampering
      name: 'SQL Injection',
      att&ck: ['T1190', 'Exploit Public-Facing Application'],
      description: 'Malicious SQL via unsanitized input',
      likelihood: 'MEDIUM',
      impact: 'CRITICAL',
      mitigations: [
        { control: 'Input Validation', implementation: 'Zod schemas on all inputs' },
        { control: 'Parameterized Queries', implementation: 'Drizzle ORM only' },
        { control: 'WAF Rules', implementation: 'SQLi protection rules' },
        { control: 'Least Privilege DB', implementation: 'App user cannot DDL' },
      ],
    },
    {
      id: 'T3',
      stride: 'R', // Repudiation
      name: 'User Denies Action',
      att&ck: ['T0808', 'Golden Ticket'],
      description: 'User claims they did not perform an action',
      likelihood: 'LOW',
      impact: 'MEDIUM',
      mitigations: [
        { control: 'Audit Logging', implementation: 'Every action logged with timestamp' },
        { control: 'Digital Signatures', implementation: 'Response signed with HMAC' },
        { control: 'Immutable Logs', implementation: 'WORM storage for audit' },
      ],
    },
    {
      id: 'T4',
      stride: 'I', // Information Disclosure
      name: 'Data Breach via API',
      att&ck: ['T1040', 'Network Sniffing'],
      description: 'Sensitive data exposed via API response or logs',
      likelihood: 'MEDIUM',
      impact: 'CRITICAL',
      mitigations: [
        { control: 'Field-Level Encryption', implementation: 'AES-256 for PII fields' },
        { control: 'No Sensitive Data in Logs', implementation: 'Sanitize function for all logs' },
        { control: 'Response Filtering', implementation: 'Only return authorized fields' },
        { control: 'TLS 1.3', implementation: 'All traffic encrypted' },
      ],
    },
    {
      id: 'T5',
      stride: 'D', // Denial of Service
      name: 'API Rate Exhaustion',
      att&ck: ['T1499.002', 'Service Exhaustion Flood'],
      description: 'Attacker overwhelms API with requests',
      likelihood: 'HIGH',
      impact: 'HIGH',
      mitigations: [
        { control: 'Rate Limiting', implementation: 'per-user and per-IP limits' },
        { control: 'Circuit Breaker', implementation: 'Open on 80% capacity' },
        { control: 'CDN/DDoS Protection', implementation: 'CloudFlare or similar' },
        { control: 'Auto-scaling', implementation: 'Scale at 70% CPU' },
      ],
    },
    {
      id: 'T6',
      stride: 'E', // Elevation of Privilege
      name: 'Role Escalation',
      att&ck: ['T1068', 'Exploitation for Privilege Escalation'],
      description: 'User elevates their role without authorization',
      likelihood: 'LOW',
      impact: 'CRITICAL',
      mitigations: [
        { control: 'ABAC Enforcement', implementation: 'Attribute-based access control' },
        { control: 'Role Change Audit', implementation: 'All role changes logged' },
        { control: 'Approval Workflow', implementation: 'Role elevation requires approval' },
        { control: 'Session Re-validation', implementation: 'Re-authenticate for sensitive actions' },
      ],
    },
  ],
  
  // ATT&CK TECHNIQUES MAPPING
  att&ckTechniques: {
    'Initial Access': ['T1190', 'Exploit Public-Facing Application'],
    'Execution': ['T1059.003', 'Command and Scripting Interpreter - JavaScript'],
    'Persistence': ['T1078', 'Valid Accounts'],
    'Privilege Escalation': ['T1068', 'Exploitation for Privilege Escalation'],
    'Defense Evasion': ['T1070.003', 'Clear Command History'],
    'Credential Access': ['T1110', 'Brute Force'],
    'Discovery': ['T1082', 'System Information Discovery'],
    'Collection': ['T1005', 'Data from Local System'],
    'Exfiltration': ['T1041', 'Exfiltration Over C2 Channel'],
    'Impact': ['T1486', 'Data Encrypted for Impact'],
  },
};

// Threat Model Debe actualizarse:
// - Antes de iniciar desarrollo de módulo
// - Después de cada penetration test
// - Cuando se añaden nuevas integraciones
// - Trimestralmente como revisión de seguridad
```

### 3. Attack Tree Example

```typescript
// Attack Trees: Modelar todos los paths de ataque hacia un objetivo

const ATTACK_TREE_COMPROMISE_ADMIN = {
  goal: 'Compromise Admin Account',
  
  children: [
    {
      name: 'Phishing',
      children: [
        { name: 'Send convincing email', probability: 0.3 },
        { name: 'User clicks link', probability: 0.1 },
        { name: 'Credential entry on fake site', probability: 0.08 },
      ],
      AND: false, // Any child achieves this node
      probability: 0.3 * 0.1 * 0.08, // 0.0024
    },
    {
      name: 'Credential Stuffing',
      children: [
        { name: 'Obtain leaked credentials', probability: 0.4 },
        { name: 'Try credentials on our system', probability: 0.15 },
        { name: 'MFA not enabled on account', probability: 0.1 },
      ],
      AND: true, // All children required
      probability: 0.4 * 0.15 * 0.1, // 0.006
    },
    {
      name: 'Session Hijacking',
      children: [
        { name: 'Intercept session token', probability: 0.2 },
        { name: 'Token not bound to IP/UserAgent', probability: 0.15 },
        { name: 'Session still valid', probability: 0.3 },
      ],
      AND: true,
      probability: 0.2 * 0.15 * 0.3, // 0.009
    },
    {
      name: 'Insider Threat',
      children: [
        { name: 'Existing employee with admin access', probability: 0.05 },
        { name: 'Motivated to abuse access', probability: 0.02 },
      ],
      AND: true,
      probability: 0.05 * 0.02, // 0.001
    },
  ],
  
  // Mitigations reduce probability
  mitigations: [
    { name: 'MFA Enforcement', impact: 'Reduces Phishing by 95%, Credential Stuffing by 99%' },
    { name: 'Session Binding', impact: 'Reduces Session Hijacking by 90%' },
    { name: 'Behavioral Analytics', impact: 'Detects Insider Threat 80% of time' },
  ],
};
```

### 4. Threat Modeling Checklist

```
THREAT MODELING OBLIGATORIO:
├── [ ] Identificar y documentar todos los assets
├── [ ] Mapear todos los trust boundaries
├── [ ] Documentar todos los data flows
├── [ ] Analizar cada flujo con STRIDE
├── [ ] Mapear amenazas a MITRE ATT&CK
├── [ ] Crear attack tree para objetivos críticos
├── [ ] Asignar likelihood e impact a cada amenaza
├── [ ] Documentar mitigaciones existentes
├── [ ] Identificar gaps (threats sin mitigación)
├── [ ] Crear plan de mitigación para gaps
├── [ ] Revisar threat model con equipo de seguridad
├── [ ] Actualizar después de cada incidente
└── [ ] Aprobar threat model antes de desarrollo
```

---

## 🔐 SECRETS MANAGEMENT (GESTIÓN DE SECRETOS)

### Principio Fundamental
**NUNCA hardcodear secrets en código** — API keys, passwords, tokens, y cualquier credencial DEBE vivir en un secrets manager con rotación automática. El código fuente en un repositorio público o filtrado = todos los secrets expuestos.

```
SECRETS JAMÁS DEBEN ESTAR EN:
├── Código fuente (.ts, .js, .py)
├── Archivos de configuración (.json, .yaml, .env)
├── Scripts de deploy
├── Comentarios
├── Historial de git
├── Logs
├── Variables de frontend
└── Binarios compilados
```

### 1. Vault Integration Pattern

```typescript
// src/lib/security/vault-client.ts

/**
 * Cliente para HashiCorp Vault / AWS Secrets Manager / Azure Key Vault
 * Implementación genérica que funciona con cualquier provider.
 */

interface SecretConfig {
  provider: 'vault' | 'aws' | 'azure';
  endpoint: string;
  role: string;
  secretPath: string;
  cacheTTL: number; // seconds
}

interface SecretValue {
  key: string;
  value: string;
  version: number;
  expiresAt?: Date;
}

class VaultSecretClient {
  private config: SecretConfig;
  private cache: Map<string, { value: string; expiresAt: Date }> = new Map();
  
  constructor(config: SecretConfig) {
    this.config = config;
  }

  /**
   * Obtiene un secret del vault
   */
  async getSecret(key: string): Promise<string> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > new Date()) {
      return cached.value;
    }

    // Fetch from vault
    const secret = await this.fetchFromVault(key);
    
    // Update cache
    this.cache.set(key, {
      value: secret.value,
      expiresAt: new Date(Date.now() + this.config.cacheTTL * 1000),
    });

    return secret.value;
  }

  /**
   * Obtiene múltiples secrets de una sola vez
   */
  async getSecrets(keys: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    
    // Fetch in parallel
    const promises = keys.map(key => this.getSecret(key));
    const values = await Promise.all(promises);
    
    keys.forEach((key, index) => {
      result[key] = values[index];
    });

    return result;
  }

  /**
   * Fuerza refresh del cache
   */
  async invalidate(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * Lista todos los secrets disponibles (sin leer valores)
   */
  async listSecrets(): Promise<string[]> {
    switch (this.config.provider) {
      case 'vault':
        return this.listVaultSecrets();
      case 'aws':
        return this.listAWSSecrets();
      case 'azure':
        return this.listAzureSecrets();
    }
  }

  private async fetchFromVault(key: string): Promise<SecretValue> {
    // Implementación Vault
    const path = `${this.config.secretPath}/${key}`;
    
    const response = await fetch(`${this.config.endpoint}/v1/${path}`, {
      headers: {
        'X-Vault-Token': await this.getVaultToken(),
      },
    });

    if (!response.ok) {
      throw new Error(`Vault error: ${response.status}`);
    }

    const data = await response.json();
    return {
      key,
      value: data.data.data.value,
      version: data.data.version,
    };
  }

  private async getVaultToken(): Promise<string> {
    // Usar Vault Agent o Kubernetes Service Account para autenticación
    // NO hardcodear token root
    return process.env.VAULT_TOKEN || '';
  }

  private async listVaultSecrets(): Promise<string[]> {
    const response = await fetch(
      `${this.config.endpoint}/v1/${this.config.secretPath}/metadata`,
      { headers: { 'X-Vault-Token': await this.getVaultToken() } }
    );
    const data = await response.json();
    return data.data.keys;
  }

  private async listAWSSecrets(): Promise<string[]> {
    // AWS Secrets Manager ListSecrets API
    throw new Error('AWS implementation required');
  }

  private async listAzureSecrets(): Promise<string[]> {
    // Azure Key Vault GetSecrets API
    throw new Error('Azure implementation required');
  }
}

// Singleton
let vaultClient: VaultSecretClient | null = null;

export function getVaultClient(): VaultSecretClient {
  if (!vaultClient) {
    vaultClient = new VaultSecretClient({
      provider: process.env.SECRETS_PROVIDER as 'vault' | 'aws' | 'azure',
      endpoint: process.env.SECRETS_ENDPOINT!,
      role: process.env.SECRETS_ROLE!,
      secretPath: process.env.SECRETS_PATH!,
      cacheTTL: 300, // 5 min cache
    });
  }
  return vaultClient;
}
```

### 2. Environment Variable Injection

```typescript
// src/lib/config/secure-config.ts

/**
 * Carga configuración de secrets de forma segura.
 * NO pasar secrets a través de window.__ENV__ en frontend.
 */

interface SecureConfig {
  // Database
  databaseUrl: string;
  databasePassword: string;
  
  // API Keys (solo backend)
  openaiApiKey: string;
  sendgridApiKey: string;
  s3SecretKey: string;
  
  // JWT
  jwtSecret: string;
  jwtRefreshSecret: string;
  
  // Encryption
  encryptionMasterKey: string;
}

let configCache: SecureConfig | null = null;

export async function loadSecureConfig(): Promise<SecureConfig> {
  if (configCache) {
    return configCache;
  }

  const vault = getVaultClient();
  
  // Cargar todos los secrets necesarios de una vez
  const secrets = await vault.getSecrets([
    'database/url',
    'database/password',
    'api/openai',
    'api/sendgrid',
    'aws/s3-secret',
    'jwt/secret',
    'jwt/refresh-secret',
    'encryption/master-key',
  ]);

  configCache = {
    databaseUrl: secrets['database/url'],
    databasePassword: secrets['database/password'],
    openaiApiKey: secrets['api/openai'],
    sendgridApiKey: secrets['api/sendgrid'],
    s3SecretKey: secrets['aws/s3-secret'],
    jwtSecret: secrets['jwt/secret'],
    jwtRefreshSecret: secrets['jwt/refresh-secret'],
    encryptionMasterKey: secrets['encryption/master-key'],
  };

  return configCache;
}

/**
 * Para AWS Lambda/Container Environments:
 * Los secrets se injectan como environment variables por el runtime
 * Pero sigue siendo mejor práctica usar Vault para rotation
 */

// src/lib/config/env-config.ts
export function getConfigFromEnv(): Partial<SecureConfig> {
  return {
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    // etc - solo leyendo de process.env
  };
}
```

### 3. Secrets Rotation Pattern

```typescript
// src/lib/security/secrets-rotation.ts

/**
 * Rotation de secrets sin downtime.
 * Usar versionado en Vault y migración gradual.
 */

interface SecretVersion {
  version: number;
  value: string;
  createdAt: Date;
  createdBy: string;
}

class SecretsRotation {
  private vault: VaultSecretClient;
  private readonly ROTATION_WINDOW_DAYS = 7;
  private readonly MIN_VERSION_ACTIVE = 2;

  /**
   * Rota un secret de forma segura
   * 1. Genera nuevo secret
   * 2. Lo añade como nueva versión (no replace)
   * 3. Actualiza aplicaciones para usar nueva versión
   * 4. Una vez todas usan la nueva, marca antiguas para expiración
   */
  async rotateSecret(secretName: string): Promise<void> {
    // 1. Generar nuevo secret
    const newValue = this.generateSecureSecret(secretName);
    
    // 2. Añadir como nueva versión (Vault mantiene historial)
    await this.vault.addSecretVersion(secretName, newValue);
    
    // 3. Enviar notificación a equipos para actualizar
    await this.notifyTeamsAboutNewVersion(secretName);
    
    // 4. Después de ventana de rotación, marcar antiguas para expire
    await this.scheduleOldVersionExpiry(secretName);
  }

  /**
   * Verifica que todas las aplicaciones están usando versión actual
   */
  async verifyAllUsingLatestVersion(secretName: string): Promise<boolean> {
    const usageMetrics = await this.getSecretUsageMetrics(secretName);
    
    // Todas las versiones menos las últimas 2 deberían tener 0 uso
    const oldVersions = usageMetrics.filter(v => v.usageCount > 0 && v.version <= this.MIN_VERSION_ACTIVE);
    
    return oldVersions.length === 0;
  }

  private generateSecureSecret(type: string): string {
    // Usar crypto seguro para generar
    const length = type === 'jwt' ? 64 : 32;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => chars[byte % chars.length]).join('');
  }

  private async getSecretUsageMetrics(secretName: string): Promise<{ version: number; usageCount: number }[]> {
    // Consultar métricas de qué versiones están siendo usadas
    // En producción, esto vendría de Vault telemetry o un сторожевой sistema
    return [];
  }

  private async notifyTeamsAboutNewVersion(secretName: string): Promise<void> {
    // Enviar email/Slack a equipos notificando nueva versión disponible
  }

  private async scheduleOldVersionExpiry(secretName: string): Promise<void> {
    // En producción, esto programa job para marcar antiguas para expire
  }
}
```

### 4. Secrets Management Checklist

```
SECRETS MANAGEMENT CHECKLIST:
├── [ ] All secrets in Vault/AWS/Azure Key Vault (NO hardcoded)
├── [ ] No .env files committed to repository
├── [ ] No secrets in git history (git-secrets or similar)
├── [ ] Secrets have automatic rotation configured
├── [ ] Application reads secrets at startup from Vault
├── [ ] No secrets passed to frontend (use opaque tokens instead)
├── [ ] Database credentials rotated every 90 days
├── [ ] API keys rotated every 60 days
├── [ ] JWT secrets rotated every 30 days
├── [ ] Emergency break-glass procedure documented
├── [ ] Access to secrets logged and audited
└── [ ] Secrets access requires approval workflow
```

---

## 🌐 WAF & DDoS PROTECTION (WEB APPLICATION FIREWALL)

### Principio Fundamental
**El perímetro de la red debe estar protegido** — Aunque la aplicación sea segura, hay ataques de volumetría que solo se mitigan en la capa de infraestructura: WAF, CDN, y protección DDoS.

```
CAPAS DE PROTECCIÓN DE INFRAESTRUCTURA:
├── CDN (Content Delivery Network) → Geolocalización, Caching, SSL termination
├── WAF (Web Application Firewall) → Filtrado de requests maliciosos
├── DDoS Protection → Scrubbing de tráfico malicioso
├── Rate Limiting per IP → Prevenir brute force
└── BGP Blackholing → Como último recurso para ataques masivos
```

### 1. WAF Rules Configuration

```typescript
// Implementación conceptual - Aplicar en CloudFlare, AWS WAF, o ModSecurity

const WAF_RULES = {
  // OWASP Top 10 Protection
  owaspProtection: {
    enabled: true,
    rules: [
      {
        id: 'OWASP-001',
        name: 'SQL Injection',
        action: 'BLOCK',
        conditions: [
          // SQL keywords
          { type: 'regex', pattern: /(\b(SELECT|UNION|INSERT|UPDATE|DELETE|DROP|EXEC|EXECUTE)\b)/i },
          // SQL comments
          { type: 'regex', pattern: /(--|\/\*|\*\/)/ },
          // Common SQLi patterns
          { type: 'regex', pattern: /(\bOR\b.*=.*\bOR\b|\bAND\b.*=.*\bAND\b)/i },
        ],
      },
      {
        id: 'OWASP-002',
        name: 'XSS Attack',
        action: 'BLOCK',
        conditions: [
          // Script tags
          { type: 'regex', pattern: /<script[^>]*>.*?<\/script>/gi },
          // Event handlers
          { type: 'regex', pattern: /\bon\w+\s*=/gi },
          // JavaScript URI
          { type: 'regex', pattern: /javascript:/gi },
          // Data URIs
          { type: 'regex', pattern: /data:/gi },
        ],
      },
      {
        id: 'OWASP-003',
        name: 'Path Traversal',
        action: 'BLOCK',
        conditions: [
          { type: 'regex', pattern: /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e\/)/gi },
        ],
      },
      {
        id: 'OWASP-004',
        name: 'Local File Inclusion',
        action: 'BLOCK',
        conditions: [
          { type: 'regex', pattern: /(proc\/self\/environ|etc\/passwd|boot\.ini)/gi },
        ],
      },
      {
        id: 'OWASP-005',
        name: 'Remote File Inclusion',
        action: 'BLOCK',
        conditions: [
          { type: 'regex', pattern: /(http:\/\/|https:\/\/|ftp:\/\/)/gi },
        ],
      },
    ],
  },

  // Rate Limiting
  rateLimiting: {
    enabled: true,
    rules: [
      {
        id: 'RATE-001',
        name: 'Global Rate Limit',
        action: 'THROTTLE',
        conditions: {
          threshold: 100, // requests
          window: 60, // seconds per IP
        },
        response: {
          status: 429,
          message: 'Too many requests. Please slow down.',
          retryAfter: 60,
        },
      },
      {
        id: 'RATE-002',
        name: 'Login Endpoint',
        action: 'THROTTLE',
        conditions: {
          threshold: 10,
          window: 60,
          endpoints: ['/api/auth/login', '/api/auth/password-reset'],
        },
        response: {
          status: 429,
          message: 'Too many login attempts.',
          retryAfter: 300,
        },
      },
      {
        id: 'RATE-003',
        name: 'API Burst',
        action: 'BLOCK',
        conditions: {
          threshold: 50,
          window: 10, // seconds - burst protection
        },
      },
    ],
  },

  // Geographic Blocking
  geoBlocking: {
    enabled: false, // Solo activar si es necesario
    blockList: [], // Country codes to block
    allowList: [], // If populated, only these are allowed
    challengeOnly: ['RU', 'CN', 'KP', 'IR'], // Show captcha instead of block
  },

  // Bot Protection
  botProtection: {
    enabled: true,
    rules: [
      {
        id: 'BOT-001',
        name: 'Known Bot IPs',
        action: 'BLOCK',
        check: 'ipReputation',
      },
      {
        id: 'BOT-002',
        name: 'Headless Browser Detection',
        action: 'DETECT',
        conditions: ['navigator.webdriver === true', 'selenium detected'],
      },
      {
        id: 'BOT-003',
        name: 'Behavioral Analysis',
        action: 'CHALLENGE',
        conditions: ['impossible browsing speed', 'no mouse movement', 'no scroll'],
      },
    ],
  },
};
```

### 2. DDoS Mitigation Configuration

```typescript
// Configuración para CloudFlare o similar

const DDOS_CONFIG = {
  // Layer 7 (Application) DDoS
  layer7Protection: {
    enabled: true,
    sensitivityLevel: 'medium', // low, medium, high, under_attack
    
    // Automatic thresholds (machine learning)
    automaticDetection: true,
    
    // Manual overrides
    thresholds: {
      requestsPerSecond: 1000,
      bandwidthGbps: 10,
      newConnectionsPerSecond: 500,
    },
    
    // Challenge responses
    challenges: {
      badBrowser: true,      // Show CAPTCHA
      missingUserAgent: true,
      suspiciousCountry: 'challenge',
      torExitNode: 'challenge',
    },
  },

  // Layer 3/4 (Network) DDoS
  networkProtection: {
    enabled: true,
    
    // Always-On mitigation
    alwaysOn: true,
    
    // Scrubbing centers
    autoScrubbing: true,
    
    // Rate limits for SYN, UDP, etc.
    protocolLimits: {
      'tcp-syn': { pps: 50000, burst: 100000 },
      'udp': { pps: 10000, burst: 50000 },
      'icmp': { pps: 5000, burst: 10000 },
    },
  },

  // Under Attack Mode
  underAttackMode: {
    enabled: false, // Activar manualmente durante ataque real
    challengeInterval: 'every10minutes',
    minimumChallengeScore: 10,
  },
};
```

### 3. Implementation Example (Next.js)

```typescript
// next.config.js - Configuración de seguridad de infraestructura

module.exports = {
  // Security headers (complementa CSP del skill)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // HSTS (HTTP Strict Transport Security)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // X-Frame-Options
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // X-Content-Type-Options
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Cache-Control for sensitive pages
          {
            source: '/api/(.*)',
            headers: [
              {
                key: 'Cache-Control',
                value: 'no-store, max-age=0',
              },
            ],
          },
        ],
      },
    ];
  },

  // Rate limiting via Vercel Edge (o propio middleware)
  async redirects() {
    return [
      // Force HTTPS (si no es manejado por CDN)
    ];
  },
};

// src/middleware.ts - Rate limiting en edge
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RATE_LIMIT_WINDOW = 60; // seconds
const MAX_REQUESTS = 100;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function middleware(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  
  let clientData = rateLimitMap.get(ip);
  
  if (!clientData || now > clientData.resetAt) {
    clientData = { count: 0, resetAt: now + RATE_LIMIT_WINDOW * 1000 };
    rateLimitMap.set(ip, clientData);
  }
  
  clientData.count++;
  
  if (clientData.count > MAX_REQUESTS) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

### 4. WAF Checklist

```
WAF & DDoS PROTECTION CHECKLIST:
├── [ ] WAF enabled with OWASP Top 10 rules
├── [ ] Rate limiting configured per endpoint
├── [ ] Geographic blocking rules defined (if needed)
├── [ ] Bot protection enabled
├── [ ] DDoS protection configured (CDN layer)
├── [ ] Security headers applied to all responses
├── [ ] SSL/TLS configured with modern protocols only (TLS 1.2+)
├── [ ] CDN caching configured appropriately
├── [ ] Origin IP hidden (use CDN as reverse proxy)
├── [ ] DDoS emergency playbook documented
├── [ ] Tested WAF rules in staging (avoid blocking legitimate traffic)
└── [ ] DDoS protection tested under load (use monitoring tools)
```

---

## 💥 CHAOS ENGINEERING (RESILIENCE TESTING)

### Principio Fundamental
**Los sistemas seguros deben ser también resilientes** — No basta con tener controles de seguridad; hay que probar que funcionan bajo condiciones adversas: fallos de red, sobrecarga, dependencias caídas, y ataques.

```
CHAOS ENGINEERING PREGUNTAS CLAVE:
├── ¿El sistema degrada elegantemente si Redis cae?
├── ¿Los rate limits funcionan cuando el sistema está bajo carga?
├── ¿El circuit breaker abre correctamente?
├── ¿Los logs de auditoría se escriben incluso bajo ataque?
├── ¿El timeout de la DB está configurado correctamente?
└── ¿Qué pasa si el servicio de encryption está down?
```

### 1. Chaos Test Suite

```typescript
// src/lib/chaos/chaos-suite.ts

/**
 * Suite de pruebas de caos para verificar resiliencia.
 * NO ejecutar en producción - solo en entornos de staging/testing.
 */

interface ChaosExperiment {
  name: string;
  description: string;
  target: 'database' | 'cache' | 'api' | 'network' | 'dependency';
  action: 'latency' | 'timeout' | 'error' | 'blackhole' | 'packet-loss';
  intensity: number; // 0-100%
  duration: number; // seconds
  expectedBehavior: string;
}

const CHAOS_EXPERIMENTS: ChaosExperiment[] = [
  {
    name: 'Database Slow Query',
    description: 'Inyectar latencia en queries a la base de datos',
    target: 'database',
    action: 'latency',
    intensity: 50, // 50% de queries con 500ms extra
    duration: 60,
    expectedBehavior: 'Circuit breaker abre después de 5 queries lentas consecutivas',
  },
  {
    name: 'Cache Failure',
    description: 'Simular que Redis está completamente down',
    target: 'cache',
    action: 'blackhole',
    intensity: 100,
    duration: 30,
    expectedBehavior: 'Sistema sigue funcionando, queries van directo a DB',
  },
  {
    name: 'Dependency Timeout',
    description: 'Simular timeout en API de autenticación',
    target: 'api',
    action: 'timeout',
    intensity: 100,
    duration: 45,
    expectedBehavior: 'Auth failures no bloquean requests, fallback a cache',
  },
  {
    name: 'Network Packet Loss',
    description: 'Simular 10% de packet loss en red interna',
    target: 'network',
    action: 'packet-loss',
    intensity: 10,
    duration: 120,
    expectedBehavior: 'Retry con exponential backoff funciona correctamente',
  },
  {
    name: 'Encryption Service Down',
    description: 'Simular que el servicio de encriptación no responde',
    target: 'dependency',
    action: 'error',
    intensity: 100,
    duration: 60,
    expectedBehavior: 'Operaciones de lectura funcionan, writes enqueue para retry',
  },
  {
    name: 'Audit Log Overflow',
    description: 'Simular que el sistema de auditoría está saturado',
    target: 'audit',
    action: 'latency',
    intensity: 100,
    duration: 30,
    expectedBehavior: 'Audit writes no bloquean operaciones principales',
  },
];

class ChaosEngine {
  private experiments: ChaosExperiment[] = CHAOS_EXPERIMENTS;
  private runningExperiments: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Ejecuta un experimento de caos
   */
  async runExperiment(experimentName: string): Promise<{
    success: boolean;
    actualBehavior: string;
    expectedBehavior: string;
    match: boolean;
  }> {
    const experiment = this.experiments.find(e => e.name === experimentName);
    if (!experiment) {
      throw new Error(`Experiment ${experimentName} not found`);
    }

    console.log(`[CHAOS] Starting experiment: ${experiment.name}`);
    console.log(`[CHAOS] Target: ${experiment.target}, Action: ${experiment.action}`);

    // Aplicar caos
    await this.injectChaos(experiment);
    
    // Esperar duración
    await this.sleep(experiment.duration * 1000);
    
    // Medir comportamiento
    const actualBehavior = await this.measureBehavior(experiment);
    
    // Limpiar caos
    await this.cleanupChaos(experiment);

    const match = actualBehavior.includes(experiment.expectedBehavior.split('(')[0]);

    return {
      success: match,
      actualBehavior,
      expectedBehavior: experiment.expectedBehavior,
      match,
    };
  }

  /**
   * Run all experiments
   */
  async runAllExperiments(): Promise<Record<string, { success: boolean; duration: number }>> {
    const results: Record<string, { success: boolean; duration: number }> = {};
    
    for (const experiment of this.experiments) {
      const start = Date.now();
      try {
        const result = await this.runExperiment(experiment.name);
        results[experiment.name] = { success: result.match, duration: Date.now() - start };
      } catch (error) {
        results[experiment.name] = { success: false, duration: Date.now() - start };
      }
    }
    
    return results;
  }

  private async injectChaos(experiment: ChaosExperiment): Promise<void> {
    // Implementación depende de herramienta (Toxiproxy, Chaos Monkey, etc.)
    // Ejemplo conceptual:
    
    switch (experiment.target) {
      case 'database':
        await this.injectLatency('postgres', experiment.intensity, 500);
        break;
      case 'cache':
        await this.blackhole('redis');
        break;
      case 'network':
        await this.packetLoss(experiment.intensity);
        break;
    }
  }

  private async measureBehavior(experiment: ChaosExperiment): Promise<string> {
    // Medir métricas reales durante el experimento
    // Return descripción de lo que pasó
    
    // Para producción, integrar con Prometheus/Datadog
    const metrics = await this.getMetrics();
    
    return `Error rate: ${metrics.errorRate}%, Latency p99: ${metrics.latencyP99}ms, Circuit open: ${metrics.circuitOpen}`;
  }

  private async cleanupChaos(experiment: ChaosExperiment): Promise<void> {
    // Remover inyecciones de caos
  }

  private injectLatency(service: string, intensity: number, latencyMs: number): Promise<void> {
    // Placeholder - usar Toxiproxy o similar
    return Promise.resolve();
  }

  private blackhole(service: string): Promise<void> {
    return Promise.resolve();
  }

  private packetLoss(percentage: number): Promise<void> {
    return Promise.resolve();
  }

  private getMetrics(): Promise<{ errorRate: number; latencyP99: number; circuitOpen: boolean }> {
    return Promise.resolve({ errorRate: 0, latencyP99: 0, circuitOpen: false });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const chaosEngine = new ChaosEngine();
```

### 2. Resilience Test Checklist

```
CHAOS ENGINEERING CHECKLIST:
├── [ ] Database failure test - system continues
├── [ ] Cache failure test - graceful degradation
├── [ ] Network latency test - retry works
├── [ ] Dependency timeout test - circuit breaker opens
├── [ ] Audit overflow test - main ops not blocked
├── [ ] Encryption service down test - reads work
├── [ ] DDoS simulation - rate limits work
├── [ ] Memory pressure test - no OOM crash
├── [ ] Disk full test - critical ops protected
└── [ ] All tests pass in staging before production
```

---

## 🔒 RUNTIME INTEGRITY (VERIFICACIÓN DE INTEGRIDAD)

### Principio Fundamental
**El código que corre DEBE ser el código que desplegaste** — Un atacante con acceso privilegiado podría modificar archivos en runtime. Necesitamos verificar integridad del sistema durante ejecución.

```
INTEGRITY CHECKS OBLIGATORIOS:
├── File integrity monitoring (FIM)
├── Running process verification
├── Configuration drift detection
├── Code signing verification
├── Memory corruption detection
└── Anomaly detection en system calls
```

### 1. File Integrity Monitoring

```typescript
// src/lib/security/file-integrity.ts

/**
 * Monitorea integridad de archivos críticos del sistema.
 * Usa hashes para detectar modificaciones no autorizadas.
 */

interface FileHash {
  path: string;
  hash: string;
  algorithm: 'sha256' | 'sha384' | 'sha512';
  lastVerified: Date;
  criticality: 'HIGH' | 'MEDIUM' | 'LOW';
}

class FileIntegrityMonitor {
  private baseline: Map<string, FileHash> = new Map();
  private readonly CRITICAL_PATHS = [
    // Application code
    '/app/src/**/*.ts',
    '/app/src/**/*.js',
    '/app/build/**/*.js',
    
    // Configuration
    '/app/config/**/*.{json,yaml,env}',
    
    // System binaries
    '/usr/local/bin/*',
    
    // Startup scripts
    '/app/scripts/**/*.sh',
    '/app/scripts/**/*.ps1',
  ];

  /**
   * Establece baseline de hashes para archivos críticos
   */
  async establishBaseline(): Promise<void> {
    for (const pattern of this.CRITICAL_PATHS) {
      const files = await this.globFiles(pattern);
      for (const file of files) {
        const hash = await this.computeHash(file);
        this.baseline.set(file, {
          path: file,
          hash,
          algorithm: 'sha256',
          lastVerified: new Date(),
          criticality: this.getCriticality(file),
        });
      }
    }
    
    // Guardar baseline de forma segura (no en el server que monitorea)
    await this.saveBaselineSecurely(this.baseline);
  }

  /**
   * Verifica integridad de todos los archivos
   */
  async verifyIntegrity(): Promise<{
    allValid: boolean;
    violations: FileHash[];
  }> {
    const violations: FileHash[] = [];
    
    for (const [path, baseline] of this.baseline) {
      const currentHash = await this.computeHash(path);
      
      if (currentHash !== baseline.hash) {
        violations.push({
          ...baseline,
          hash: currentHash,
          lastVerified: new Date(),
        });
      }
    }
    
    if (violations.length > 0) {
      await this.handleViolation(violations);
    }
    
    return {
      allValid: violations.length === 0,
      violations,
    };
  }

  /**
   * Verifica un archivo específico
   */
  async verifyFile(path: string): Promise<boolean> {
    const baseline = this.baseline.get(path);
    if (!baseline) return true; // No baseline = no check
    
    const currentHash = await this.computeHash(path);
    return currentHash === baseline.hash;
  }

  private async computeHash(path: string): Promise<string> {
    // Usar crypto.subtle para SHA-256
    const data = await this.readFile(path);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async handleViolation(violations: FileHash[]): Promise<void> {
    // Alertar inmediatamente
    console.error(`[INTEGRITY] ${violations.length} file(s) modified unexpectedly!`);
    
    // Notificar security team
    await fetch('/api/security/integrity-violation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        violations,
        timestamp: new Date().toISOString(),
        server: process.env.HOSTNAME,
      }),
    });
    
    // Opcional: iniciar respuesta automática
    // - Bloquear acceso
    // - Escalar a incidentes
    // - Iniciar forensic collection
  }

  private getCriticality(path: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (path.includes('auth') || path.includes('encryption')) return 'HIGH';
    if (path.includes('.env') || path.includes('config')) return 'HIGH';
    if (path.endsWith('.sh') || path.endsWith('.ps1')) return 'HIGH';
    return 'MEDIUM';
  }

  private globFiles(pattern: string): Promise<string[]> {
    // Placeholder - implementar con glob o similar
    return Promise.resolve([]);
  }

  private readFile(path: string): Promise<ArrayBuffer> {
    // Placeholder
    return Promise.resolve(new ArrayBuffer(0));
  }

  private async saveBaselineSecurely(baseline: Map<string, FileHash>): Promise<void> {
    // Guardar en location seguro, separado del servidor de aplicación
  }
}

export const fileIntegrityMonitor = new FileIntegrityMonitor();
```

### 2. Runtime Integrity Checklist

```
RUNTIME INTEGRITY CHECKLIST:
├── [ ] File integrity baseline established
├── [ ] Critical files monitored (code, config, scripts)
├── [ ] Integrity checks scheduled (hourly or continuous)
├── [ ] Hash algorithm: SHA-256 or stronger
├── [ ] Violations trigger immediate alert
├── [ ] Process verification (expected binaries only)
├── [ ] Configuration drift detection active
├── [ ] Code signing verification on deploy
├── [ ] Immutable infrastructure (containers)
├── [ ] Rootkit detection tools installed
└── [ ] Intrusion detection system (OSSEC, Wazuh)
```

---

## 📋 ULTIMATE SECURITY CHECKLIST (COMPLETO)

```
╔══════════════════════════════════════════════════════════════════════╗
║           SILEXAR MODULE BUILDER - SECURITY COMPLETO                 ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  FUNDATION                                                          ║
║  ├── [✓] DDD + CQRS + Event Sourcing (Category CRITICAL)            ║
║  ├── [✓] AES-256-GCM encryption mandatory                           ║
║  ├── [✓] SOC 2 Tipo II + ISO 27001 compliance                       ║
║  ├── [✓] Zero Trust Architecture                                    ║
║  └── [✓] Complete Audit Trails (every click/change/export)         ║
║                                                                      ║
║  BROWSER / CLIENT                                                    ║
║  ├── [✓] DevTools detection + garbage injection                      ║
║  ├── [✓] Console distraction (real logs via fetch)                 ║
║  ├── [✓] CSP hardening (frame-ancestors, object-src)               ║
║  ├── [✓] Anti-tampering (MutationObserver, script injection)       ║
║  ├── [✓] No source maps in production                               ║
║  └── [✓] JavaScript minification (Terser, drop console)            ║
║                                                                      ║
║  API / NETWORK                                                       ║
║  ├── [✓] Zod validation on ALL inputs                              ║
║  ├── [✓] RBAC + ABAC authorization                                  ║
║  ├── [✓] Rate limiting (per-user, per-IP, per-endpoint)            ║
║  ├── [✓] WAF rules (OWASP Top 10)                                  ║
║  ├── [✓] DDoS protection (CDN layer)                               ║
║  ├── [✓] TLS 1.3 only (1.2 fallback)                               ║
║  └── [✓] Security headers (HSTS, X-Frame, etc.)                    ║
║                                                                      ║
║  DATA / DATABASE                                                      ║
║  ├── [✓] AES-256 encryption at rest                                ║
║  ├── [✓] Row Level Security (RLS) for multi-tenancy                 ║
║  ├── [✓] Parameterized queries only (no SQL raw)                    ║
║  ├── [✓] Secrets in Vault (no hardcoded)                            ║
║  └── [✓] Encrypted backups                                           ║
║                                                                      ║
║  AI / LLM                                                            ║
║  ├── [✓] Input sanitization (prompt injection detection)           ║
║  ├── [✓] Output filtering (PII removal)                             ║
║  ├── [✓] Jailbreak attempt detection                                 ║
║  ├── [✓] AI-specific rate limiting                                  ║
║  └── [✓] AI audit trail (every interaction logged)                  ║
║                                                                      ║
║  INSIDER THREAT                                                      ║
║  ├── [✓] Behavioral analytics (baseline + anomaly detection)         ║
║  ├── [✓] DLP guards (bulk export blocking)                          ║
║  ├── [✓] Session hijacking detection (fingerprint, impossible travel)║
║  ├── [✓] Privilege escalation detector                               ║
║  ├── [✓] Concurrent session limits                                  ║
║  └── [✓] All alerts to SIEM                                         ║
║                                                                      ║
║  THREAT MODELING                                                     ║
║  ├── [✓] STRIDE threat analysis per module                           ║
║  ├── [✓] MITRE ATT&CK technique mapping                             ║
║  ├── [✓] Attack trees for critical objectives                       ║
║  ├── [✓] Threat model documented before development                  ║
║  └── [✓] Regular threat model updates                                ║
║                                                                      ║
║  SECRETS MANAGEMENT                                                   ║
║  ├── [✓] All secrets in Vault/AWS Secrets Manager                   ║
║  ├── [✓] Automatic secret rotation (90/60/30 days)                  ║
║  ├── [✓] No secrets in git history                                  ║
║  ├── [✓] No secrets in frontend code                                ║
║  └── [✓] Break-glass procedure documented                           ║
║                                                                      ║
║  CHAOS / RESILIENCE                                                  ║
║  ├── [✓] Chaos engineering experiments defined                       ║
║  ├── [✓] Database failure tested                                    ║
║  ├── [✓] Cache failure tested                                       ║
║  ├── [✓] Network latency tested                                     ║
║  ├── [✓] Circuit breaker verified                                    ║
║  └── [✓] Audit overflow tested                                      ║
║                                                                      ║
║  RUNTIME INTEGRITY                                                   ║
║  ├── [✓] File integrity monitoring (FIM)                            ║
║  ├── [✓] Critical file hash baseline                                ║
║  ├── [✓] Configuration drift detection                              ║
║  ├── [✓] Process verification                                       ║
║  └── [✓] Immutable infrastructure (containers)                      ║
║                                                                      ║
║  COMPLIANCE                                                          ║
║  ├── [✓] SOC 2 Tipo II documentation                               ║
║  ├── [✓] ISO 27001 controls mapped                                 ║
║  ├── [✓] GDPR data handling                                         ║
║  ├── [✓] Audit log retention (90 days online, 7 years archive)     ║
║  └── [✓] Incident response plan                                     ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝

NIVEL ALCANZADO: ★★★★★ ENTERPRISE MAXIMUM (MILITARY/FinTech GRADE)
```

---

## 🎭 INSIDER THREAT PROTECTION (PROTECCIÓN CONTRA USUARIOS AUTORIZADOS MALICIOSOS)

### Principio Fundamental
**El usuario autenticado es el vector más peligroso** — Tiene credenciales válidas, acceso legítimo, y puede evadir controles tradicionales. Un empleado disgustado, contractor comprometida, o cuenta robada puede causar daño masivo desde dentro.

```
INSIDER THREAT VECTORS:
├── Data Exfiltration      → Bulk download de datos sensibles
├── Sabotage              → Eliminar/modificar datos críticos
├── Privilege Escalation  → Intentar obtener acceso admin
├── Session Hijacking     → Usar cuenta de otro usuario
├── Credential Abuse      → Compartir credenciales
├── Unusual Access Patterns → Acceder datos fuera de su rol
├── After-Hours Activity  → Acceso en horarios sospechosos
├── Geographic Anomaly    → Acceso desde ubicación inusual
└── API Abuse             → Requests excesivos para extraer data
```

### 1. Behavioral Analytics (Detección de Anomalías)

```typescript
// src/lib/security/behavioral-analytics.ts

interface UserBaseline {
  userId: string;
  tenantId: string;
  typicalWorkHours: { start: number; end: number }; // 9-18
  typicalDays: number[]; // [1,2,3,4,5] = Lunes-Viernes
  typicalLocations: string[]; // Códigos de país/IP
  typicalEndpoints: string[]; // APIs que usa normalmente
  typicalDataAccess: { resource: string; avgPerDay: number };
  lastUpdated: Date;
}

interface AnomalyAlert {
  userId: string;
  alertType: AnomalyType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number; // 0-100
  description: string;
  evidence: Record<string, unknown>;
  recommendedAction: string;
  timestamp: Date;
}

type AnomalyType = 
  | 'UNUSUAL_HOUR'
  | 'UNUSUAL_LOCATION'
  | 'UNUSUAL_DATA_ACCESS'
  | 'BULK_DOWNLOAD'
  | 'PRIVILEGE_ESCALATION_ATTEMPT'
  | 'API_ABUSE'
  | 'FAILED_AUTH_SPIKE'
  | 'SENSITIVE_DATA_EXPORT'
  | 'CROSS_TENANT_ACCESS';

class BehavioralAnalytics {
  private baselines: Map<string, UserBaseline> = new Map();
  private recentAlerts: AnomalyAlert[] = [];
  private readonly MAX_ALERTS = 1000;
  
  // Thresholds para detección
  private readonly THRESHOLDS = {
    bulkDownloadRows: 1000,           // >1000 rows en 1 hora = alerta
    apiRequestsPerMinute: 100,         // >100 req/min = posible abuse
    failedAuthWindow: 5,              // >5 intentos fallidos = alerta
    unusualHourStart: 22,             // 10PM - 6AM = inusual
    unusualHourEnd: 6,
  };

  /**
   * Analiza una acción del usuario contra su baseline
   */
  analyzeAction(action: {
    userId: string;
    tenantId: string;
    action: string;
    endpoint: string;
    method: string;
    rowCount?: number;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
  }): AnomalyAlert | null {
    const baseline = this.getOrCreateBaseline(action.userId, action.tenantId);
    const alerts: AnomalyAlert[] = [];

    // 1. Verificar horario inusual
    const hourAlert = this.checkUnusualHour(action.timestamp, baseline);
    if (hourAlert) alerts.push(hourAlert);

    // 2. Verificar ubicación inusual
    const locationAlert = await this.checkUnusualLocation(action.ipAddress, baseline);
    if (locationAlert) alerts.push(locationAlert);

    // 3. Verificar acceso a datos fuera de lo normal
    const dataAlert = this.checkUnusualDataAccess(action, baseline);
    if (dataAlert) alerts.push(dataAlert);

    // 4. Verificar bulk download
    const bulkAlert = this.checkBulkDownload(action);
    if (bulkAlert) alerts.push(bulkAlert);

    // 5. Verificar API abuse
    const abuseAlert = await this.checkApiAbuse(action.userId);
    if (abuseAlert) alerts.push(abuseAlert);

    // Retornar alerta de mayor severidad
    if (alerts.length === 0) return null;
    
    const highest = alerts.sort((a, b) => {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return order[a.severity] - order[b.severity];
    })[0];

    this.addAlert(highest);
    return highest;
  }

  private checkUnusualHour(timestamp: Date, baseline: UserBaseline): AnomalyAlert | null {
    const hour = timestamp.getHours();
    const dayOfWeek = timestamp.getDay();
    
    // Es horario inusual?
    const isUnusualHour = hour >= this.THRESHOLDS.unusualHourStart || hour < this.THRESHOLDS.unusualHourEnd;
    const isUnusualDay = !baseline.typicalDays.includes(dayOfWeek);
    
    if (isUnusualHour && isUnusualDay) {
      return {
        userId: baseline.userId,
        alertType: 'UNUSUAL_HOUR',
        severity: 'MEDIUM',
        confidence: 75,
        description: `User accessing system at unusual hour (${hour}:00) on unusual day`,
        evidence: { hour, dayOfWeek, typicalHours: baseline.typicalWorkHours },
        recommendedAction: 'Review access necessity, consider additional verification',
        timestamp: new Date(),
      };
    }
    
    return null;
  }

  private async checkUnusualLocation(ipAddress: string, baseline: UserBaseline): Promise<AnomalyAlert | null> {
    // Geo-IP lookup simplificado (en producción usar MaxMind o similar)
    const currentCountry = await this.geoLookup(ipAddress);
    
    if (!baseline.typicalLocations.includes(currentCountry) && baseline.typicalLocations.length > 0) {
      return {
        userId: baseline.userId,
        alertType: 'UNUSUAL_LOCATION',
        severity: 'HIGH',
        confidence: 85,
        description: `User accessing from unusual location: ${currentCountry}`,
        evidence: { 
          currentCountry, 
          typicalLocations: baseline.typicalLocations,
          ipAddress 
        },
        recommendedAction: 'Immediate session invalidation and user verification',
        timestamp: new Date(),
      };
    }
    
    return null;
  }

  private checkUnusualDataAccess(action: {
    endpoint: string;
    rowCount?: number;
  }, baseline: UserBaseline): AnomalyAlert | null {
    // Verificar si el endpoint es nuevo para este usuario
    if (!baseline.typicalEndpoints.includes(action.endpoint)) {
      return {
        userId: baseline.userId,
        alertType: 'UNUSUAL_DATA_ACCESS',
        severity: 'LOW',
        confidence: 50,
        description: `User accessing endpoint not in their typical pattern: ${action.endpoint}`,
        evidence: { endpoint: action.endpoint, typicalEndpoints: baseline.typicalEndpoints },
        recommendedAction: 'Log for pattern learning, monitor closely',
        timestamp: new Date(),
      };
    }
    
    return null;
  }

  private checkBulkDownload(action: {
    userId: string;
    endpoint: string;
    rowCount?: number;
    timestamp: Date;
  }): AnomalyAlert | null {
    if (action.rowCount && action.rowCount > this.THRESHOLDS.bulkDownloadRows) {
      return {
        userId: action.userId,
        alertType: 'BULK_DOWNLOAD',
        severity: 'HIGH',
        confidence: 90,
        description: `User downloading large amount of data: ${action.rowCount} rows`,
        evidence: { 
          rowCount: action.rowCount, 
          endpoint: action.endpoint,
          threshold: this.THRESHOLDS.bulkDownloadRows 
        },
        recommendedAction: 'Block download, notify security team, require justification',
        timestamp: new Date(),
      };
    }
    
    return null;
  }

  private async checkApiAbuse(userId: string): Promise<AnomalyAlert | null> {
    // Verificar rate de requests en ventana de tiempo
    const recentRequests = await this.getRequestCount(userId, 60000); // última minuto
    
    if (recentRequests > this.THRESHOLDS.apiRequestsPerMinute) {
      return {
        userId,
        alertType: 'API_ABUSE',
        severity: 'MEDIUM',
        confidence: 80,
        description: `High API request rate: ${recentRequests} requests/min`,
        evidence: { requestCount: recentRequests, threshold: this.THRESHOLDS.apiRequestsPerMinute },
        recommendedAction: 'Implement temporary rate limit, investigate',
        timestamp: new Date(),
      };
    }
    
    return null;
  }

  private async geoLookup(ipAddress: string): Promise<string> {
    // Placeholder - en producción usar MaxMind GeoIP2 o similar
    // Por ahora retornar código de país basado en IP
    if (ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.')) {
      return 'LOCAL'; // VPN o red interna
    }
    return 'XX'; // Desconocido
  }

  private async getRequestCount(userId: string, windowMs: number): Promise<number> {
    // Consultar logs de auditoría para contar requests recientes
    // Placeholder implementation
    return 0;
  }

  private getOrCreateBaseline(userId: string, tenantId: string): UserBaseline {
    const key = `${tenantId}:${userId}`;
    
    if (!this.baselines.has(key)) {
      // Crear baseline inicial con valores por defecto
      // Se ajustará con el tiempo según el comportamiento
      this.baselines.set(key, {
        userId,
        tenantId,
        typicalWorkHours: { start: 9, end: 18 },
        typicalDays: [1, 2, 3, 4, 5],
        typicalLocations: [],
        typicalEndpoints: [],
        typicalDataAccess: { resource: 'unknown', avgPerDay: 0 },
        lastUpdated: new Date(),
      });
    }
    
    return this.baselines.get(key)!;
  }

  private addAlert(alert: AnomalyAlert): void {
    this.recentAlerts.push(alert);
    if (this.recentAlerts.length > this.MAX_ALERTS) {
      this.recentAlerts = this.recentAlerts.slice(-this.MAX_ALERTS);
    }
    
    // Enviar a SIEM/security team
    this.reportAlert(alert);
  }

  private async reportAlert(alert: AnomalyAlert): Promise<void> {
    // Enviar alerta a sistema de monitoreo
    try {
      await fetch('/api/security/behavioral-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
        keepalive: true,
      });
    } catch {}
  }

  getAlerts(filters?: { userId?: string; severity?: string }): AnomalyAlert[] {
    let result = this.recentAlerts;
    
    if (filters?.userId) {
      result = result.filter(a => a.userId === filters.userId);
    }
    if (filters?.severity) {
      result = result.filter(a => a.severity === filters.severity);
    }
    
    return result.slice(-100);
  }
}

export const behavioralAnalytics = new BehavioralAnalytics();
```

### 2. Data Loss Prevention (DLP)

```typescript
// src/lib/security/dlp-guard.ts

/**
 * Previene exfiltración de datos sensibles.
 * Monitorea y bloquea intentos de exportar datos fuera del sistema.
 */

interface DLPViolation {
  userId: string;
  tenantId: string;
  violationType: DLPViolationType;
  dataDescription: string;
  estimatedRecords: number;
  destination?: string;
  timestamp: Date;
  blocked: boolean;
}

type DLPViolationType = 
  | 'BULK_EXPORT'
  | 'SENSITIVE_FIELD_EXPORT'
  | 'UNAUTHORIZED_FORMAT'
  | 'EXTERNAL_UPLOAD'
  | 'AUTOMATED_DOWNLOAD';

interface DLPConfig {
  maxExportRecords: number;        // Máximo records por export
  maxExportsPerDay: number;        // Exports permitidos por día
  blockedFormats: string[];         // Formatos no permitidos
  sensitiveFields: string[];        // Campos que requieren aprobación
  requireApprovalForFields: string[];
}

class DLPGuard {
  private config: DLPConfig = {
    maxExportRecords: 10000,
    maxExportsPerDay: 20,
    blockedFormats: ['.exe', '.bat', '.cmd', '.ps1', '.sh'],
    sensitiveFields: [
      'password', 'token', 'secret', 'apiKey', 'creditCard',
      'ssn', 'rut', 'pasaporte', 'fechaNacimiento',
    ],
    requireApprovalForFields: [
      'email', 'phone', 'address', 'salary', 'document',
    ],
  };

  private userExportCounts: Map<string, { date: string; count: number }> = new Map();

  /**
   * Verifica si un export es permitido
   */
  checkExport(params: {
    userId: string;
    tenantId: string;
    resourceType: string;
    recordCount: number;
    format?: string;
    fields: string[];
    destination?: string;
  }): { allowed: boolean; reason?: string; requiresApproval?: boolean } {
    // 1. Verificar formato
    if (params.format && this.isBlockedFormat(params.format)) {
      return { 
        allowed: false, 
        reason: `Format ${params.format} is not allowed for security reasons` 
      };
    }

    // 2. Verificar cantidad de records
    if (params.recordCount > this.config.maxExportRecords) {
      return {
        allowed: false,
        reason: `Export exceeds maximum allowed records (${this.config.maxExportRecords}). Request approval for larger exports.`,
      };
    }

    // 3. Verificar campos sensibles
    const sensitiveFieldsInExport = params.fields.filter(f => 
      this.config.sensitiveFields.some(sf => f.toLowerCase().includes(sf))
    );
    
    if (sensitiveFieldsInExport.length > 0) {
      return {
        allowed: false,
        reason: `Export contains sensitive fields that require special approval: ${sensitiveFieldsInExport.join(', ')}`,
      };
    }

    // 4. Verificar rate limit de exports
    const exportKey = `${params.userId}:${new Date().toISOString().split('T')[0]}`;
    const currentCount = this.userExportCounts.get(exportKey);
    
    if (currentCount && currentCount.count >= this.config.maxExportsPerDay) {
      return {
        allowed: false,
        reason: `Daily export limit reached (${this.config.maxExportsPerDay}). Try again tomorrow.`,
      };
    }

    // 5. Verificar campos que requieren aprobación
    const approvalRequiredFields = params.fields.filter(f =>
      this.config.requireApprovalForFields.some(arf => f.toLowerCase().includes(arf))
    );
    
    if (approvalRequiredFields.length > 0) {
      return {
        allowed: true,
        requiresApproval: true,
        reason: `Export will be logged for compliance. Fields requiring review: ${approvalRequiredFields.join(', ')}`,
      };
    }

    // Todo OK
    this.incrementExportCount(exportKey);
    return { allowed: true };
  }

  /**
   * Loggear intento de exportación (successful o blocked)
   */
  logExportAttempt(violation: DLPViolation): void {
    try {
      fetch('/api/security/dlp-violation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(violation),
        keepalive: true,
      });
    } catch {}
  }

  private isBlockedFormat(format: string): boolean {
    return this.config.blockedFormats.some(f => format.toLowerCase().endsWith(f));
  }

  private incrementExportCount(key: string): void {
    const today = key.split(':')[1];
    const existing = this.userExportCounts.get(key);
    
    if (existing && existing.date === today) {
      existing.count++;
    } else {
      this.userExportCounts.set(key, { date: today, count: 1 });
    }
  }
}

export const dlpGuard = new DLPGuard();
```

### 3. Session Security & hijacking Detection

```typescript
// src/lib/security/session-guard.ts

/**
 * Detecta y previene session hijacking y credential sharing.
 */

interface SessionProfile {
  userId: string;
  fingerprint: string;      // Browser fingerprint
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastSeen: Date;
  riskScore: number;
}

class SessionGuard {
  private activeSessions: Map<string, SessionProfile> = new Map();
  private readonly MAX_CONCURRENT_SESSIONS = 3;
  private readonly FINGERPRINT_STABILITY_WINDOW = 300000; // 5 min

  /**
   * Valida una sesión y detecta anomalías
   */
  validateSession(params: {
    sessionId: string;
    userId: string;
    currentFingerprint: string;
    currentIpAddress: string;
    currentUserAgent: string;
  }): { valid: boolean; action?: 'CONTINUE' | 'CHALLENGE' | 'TERMINATE' } {
    const existing = this.activeSessions.get(params.sessionId);

    // Nueva sesión para este usuario
    if (!existing) {
      this.registerSession(params);
      return { valid: true, action: 'CONTINUE' };
    }

    // Verificar fingerprint
    if (existing.fingerprint !== params.currentFingerprint) {
      const riskScore = this.calculateFingerprintRisk(existing, params);
      
      if (riskScore > 80) {
        // Posible session hijacking
        this.handleSuspiciousSession(params.sessionId, 'FINGERPRINT_MISMATCH', riskScore);
        return { valid: false, action: 'TERMINATE' };
      } else if (riskScore > 50) {
        // Requiere verificación adicional
        return { valid: true, action: 'CHALLENGE' };
      }
    }

    // Verificar IP changes frecuentes
    if (existing.ipAddress !== params.currentIpAddress) {
      const locationChange = this.detectLocationChange(existing.ipAddress, params.currentIpAddress);
      
      if (locationChange === 'IMPOSSIBLE_TRAVEL') {
        // Usuario en Chile y USA en 5 minutos = imposible
        this.handleSuspiciousSession(params.sessionId, 'IMPOSSIBLE_TRAVEL', 95);
        return { valid: false, action: 'TERMINATE' };
      }
    }

    // Update session
    existing.lastSeen = new Date();
    return { valid: true, action: 'CONTINUE' };
  }

  /**
   * Registra una nueva sesión
   */
  private registerSession(params: {
    sessionId: string;
    userId: string;
    currentFingerprint: string;
    currentIpAddress: string;
    currentUserAgent: string;
  }): void {
    // Verificar límite de sesiones concurrentes
    const userSessions = Array.from(this.activeSessions.values())
      .filter(s => s.userId === params.userId);

    if (userSessions.length >= this.MAX_CONCURRENT_SESSIONS) {
      // Terminar sesión más antigua
      const oldest = userSessions.sort((a, b) => a.lastSeen.getTime() - b.lastSeen.getTime())[0];
      this.activeSessions.delete(oldest.fingerprint);
    }

    // Registrar nueva sesión
    this.activeSessions.set(params.sessionId, {
      userId: params.userId,
      fingerprint: params.currentFingerprint,
      ipAddress: params.currentIpAddress,
      userAgent: params.currentUserAgent,
      createdAt: new Date(),
      lastSeen: new Date(),
      riskScore: 0,
    });
  }

  private calculateFingerprintRisk(existing: SessionProfile, current: {
    currentFingerprint: string;
    currentIpAddress: string;
    currentUserAgent: string;
  }): number {
    let risk = 0;

    // Fingerprint diferente
    if (existing.fingerprint !== current.currentFingerprint) risk += 30;
    
    // User Agent diferente
    if (existing.userAgent !== current.currentUserAgent) risk += 20;
    
    // IP diferente
    if (existing.ipAddress !== current.currentIpAddress) risk += 40;
    
    // Cambio muy reciente desde última actividad
    const timeSinceLastSeen = Date.now() - existing.lastSeen.getTime();
    if (timeSinceLastSeen < this.FINGERPRINT_STABILITY_WINDOW) {
      risk += 10;
    }

    return Math.min(risk, 100);
  }

  private detectLocationChange(oldIp: string, newIp: string): 'SAME' | 'DIFFERENT' | 'IMPOSSIBLE_TRAVEL' {
    // Placeholder - en producción usar geo-IP con timestamps
    // Imposible travel = diferentes países en < 2 horas
    return oldIp === newIp ? 'SAME' : 'DIFFERENT';
  }

  private handleSuspiciousSession(sessionId: string, reason: string, riskScore: number): void {
    // Invalidar sesión inmediatamente
    this.activeSessions.delete(sessionId);

    // Notificar al usuario (email/push)
    try {
      fetch('/api/security/session-anomaly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          reason,
          riskScore,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {}

    // Loggear para forensia
    console.warn(`[SECURITY] Session anomaly detected: ${reason} (risk: ${riskScore})`);
  }

  /**
   * Termina todas las sesiones de un usuario (ej: al detectar compromiso)
   */
  terminateAllUserSessions(userId: string): void {
    for (const [sessionId, profile] of this.activeSessions.entries()) {
      if (profile.userId === userId) {
        this.activeSessions.delete(sessionId);
      }
    }
  }
}

export const sessionGuard = new SessionGuard();
```

### 4. Privilege Escalation Detection

```typescript
// src/lib/security/privilege-escalation-detector.ts

/**
 * Detecta intentos de escalar privilegios más allá de los asignados.
 */

const PRIVILEGE_ESCALATION_PATTERNS = [
  // Intentos directos
  /make\s+(me|us|yourself)\s+an?\s*(admin|administrator|root)/i,
  /grant\s+(me|us)\s*(admin|root|superuser)/i,
  /set\s+(my|our)\s*role\s+to\s+(admin|super)/i,
  /update.*role.*admin/i,
  
  // Via API directa
  /PUT.*\/roles.*admin/i,
  /PATCH.*\/users.*role.*admin/i,
  /POST.*\/permissions.*grant.*all/i,
];

class PrivilegeEscalationDetector {
  /**
   * Analiza request para detectar intentos de privilege escalation
   */
  detectEscalationAttempt(params: {
    userId: string;
    userRole: string;
    requestedRole?: string;
    requestedPermissions?: string[];
    requestPath: string;
    requestBody?: Record<string, unknown>;
  }): { isEscalation: boolean; details?: string } {
    // 1. Verificar si está pidiendo rol más alto
    if (params.requestedRole) {
      const currentLevel = this.getRoleLevel(params.userRole);
      const requestedLevel = this.getRoleLevel(params.requestedRole);
      
      if (requestedLevel > currentLevel) {
        this.reportEscalationAttempt(params.userId, 'ROLE_ESCALATION', {
          currentRole: params.userRole,
          requestedRole: params.requestedRole,
        });
        return { isEscalation: true, details: `Attempting to escalate from ${params.userRole} to ${params.requestedRole}` };
      }
    }

    // 2. Verificar patrones conocidos en request
    const requestString = JSON.stringify(params.requestBody || {});
    for (const pattern of PRIVILEGE_ESCALATION_PATTERNS) {
      if (pattern.test(requestString)) {
        this.reportEscalationAttempt(params.userId, 'PATTERN_MATCH', {
          pattern: pattern.source,
          requestPath: params.requestPath,
        });
        return { isEscalation: true, details: 'Request matches known privilege escalation pattern' };
      }
    }

    // 3. Verificar si está pidiendo permisos prohibidos
    if (params.requestedPermissions) {
      const forbiddenPermissions = ['*', 'admin:*', 'superuser', 'root'];
      const requestedForbidden = params.requestedPermissions.filter(p => 
        forbiddenPermissions.includes(p) || p.startsWith('admin:')
      );
      
      if (requestedForbidden.length > 0) {
        this.reportEscalationAttempt(params.userId, 'PERMISSION_ESCALATION', {
          requestedPermissions: requestedForbidden,
        });
        return { isEscalation: true, details: 'Requesting forbidden permissions' };
      }
    }

    return { isEscalation: false };
  }

  private getRoleLevel(role: string): number {
    const levels: Record<string, number> = {
      'viewer': 1,
      'user': 2,
      'editor': 3,
      'manager': 4,
      'admin': 5,
      'super_admin': 6,
      'root': 7,
    };
    return levels[role.toLowerCase()] || 0;
  }

  private reportEscalationAttempt(userId: string, type: string, details: Record<string, unknown>): void {
    try {
      fetch('/api/security/privilege-escalation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type,
          details,
          timestamp: new Date().toISOString(),
          severity: 'CRITICAL',
        }),
        keepalive: true,
      });
    } catch {}
  }
}

export const privilegeEscalationDetector = new PrivilegeEscalationDetector();
```

### Checklist de Insider Threat Protection

```
INSIDER THREAT PROTECTION CHECKLIST:
├── [ ] Behavioral analytics active for all users
├── [ ] User baselines established after 2 weeks
├── [ ] DLP guards blocking bulk exports
├── [ ] Session hijacking detection enabled
├── [ ] Impossible travel detection configured
├── [ ] Privilege escalation patterns blocklisted
├── [ ] Concurrent session limits enforced
├── [ ] All alerts routed to SIEM
├── [ ] Automated response playbooks defined
├── [ ] Security team on-call for HIGH alerts
└── [ ] Red team exercises scheduled quarterly
```

---

## 🤖 AI/LLM SECURITY (PROTECCIÓN DE INTELIGENCIA ARTIFICIAL)

### Principio Fundamental
**Los sistemas de IA son vectores de ataque de alta prioridad** — Un atacante puede:
- Manipular comportamiento del asistente (prompt injection)
- Extraer datos sensibles via respuestas de IA
- Envenenar contexto con información maliciosa
- Realizar jailbreak para evadir restricciones
- Usar la IA como trampolín para atacar otros sistemas

```
ATAQUES CONOCIDOS CONTRA LLM:
├── Prompt Injection      → Inyectar instrucciones maliciosas en inputs
├── Indirect Prompt Injection → Envenenar datos que alimenta la IA
├── System Prompt Extraction → Extraer el prompt original/privado
├── Jailbreaking          → Evadir restricciones de seguridad
├── Data Exfiltration     → Extraer datos via respuestas manipuladas
├── Context Poisoning     → Corromper contexto de conversación
├── Training Data Extraction → Extraer info del entrenamiento
└── Denial of Service     → Agotar recursos con prompts泛滥
```

### 1. Input Sanitization para LLM (OBLIGATORIO)

```typescript
// src/lib/security/llm-input-sanitizer.ts

interface SanitizationResult {
  sanitized: string;
  threats: LLMThreat[];
  blocked: boolean;
}

type LLMThreat = 
  | 'PROMPT_INJECTION'
  | 'JAILBREAK_ATTEMPT'
  | 'SUSPICIOUS_ENCODING'
  | 'CONTEXT_OVERFLOW'
  | 'ROLE_CONFUSION';

class LLMInputSanitizer {
  private readonly MAX_INPUT_LENGTH = 8000;
  
  // Patrones conocidos de inyección de prompt
  private readonly INJECTION_PATTERNS = [
    // Ignorar instrucciones anteriores
    /\b(ignore previous|ignore all previous|disregard prior|forget everything)\b/i,
    // Intentos de rol-playing para evadir
    /\b(you are now|pretend to be|act as if you are|simulate)\b.*\b(admin|root|developer|god mode)\b/i,
    // Delimitadores para intentar escapar
    /[\<\>]\s*(system|user|assistant)\s*:?/i,
    // Intentos de override
    /\b(instead of|rather than|change your|special instructions)\b/i,
    // Comportamiento override
    /\b(always|never|disable|turn off)\s+\w+\s+(filter|restriction|rule|safety)\b/i,
    // Base64 u otros encodes para ocultar
    /\b(base64|hex|decode|encode)\s*[:=]/i,
    // URLs con payloads
    /https?:\/\/[^\s]*\b(inject|payload|xss|malware)\b/i,
  ];

  // Palabras clave sensibles que NUNCA deben procesarse como instrucción
  private readonly SENSITIVE_INSTRUCTIONS = [
    'password', 'secret', 'api_key', 'token', 'credentials',
    'sudo', 'rm -rf', 'delete everything', 'drop table',
    'exec(', 'eval(', 'system(', '__import__',
  ];

  /**
   * Analiza y sanitiza input antes de enviarlo a cualquier LLM
   */
  sanitize(input: string, context?: { userRole: string; sessionId: string }): SanitizationResult {
    const threats: LLMThreat[] = [];
    let sanitized = input;
    let blocked = false;

    // 1. Detectar prompt injection
    for (const pattern of this.INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        threats.push('PROMPT_INJECTION');
        // NO bloquear - solo loggear y continuar con sanitización
        sanitized = this.neutralizePrompt(sanitized);
      }
    }

    // 2. Detectar jailbreak attempts
    if (this.detectJailbreakAttempt(input)) {
      threats.push('JAILBREAK_ATTEMPT');
      sanitized = this.neutralizePrompt(sanitized);
    }

    // 3. Detectar encoding sospechoso
    if (this.containsSuspiciousEncoding(input)) {
      threats.push('SUSPICIOUS_ENCODING');
      sanitized = this.decodeAndStrip(sanitized);
    }

    // 4. Verificar overflow de contexto
    if (input.length > this.MAX_INPUT_LENGTH) {
      threats.push('CONTEXT_OVERFLOW');
      sanitized = sanitized.substring(0, this.MAX_INPUT_LENGTH);
    }

    // 5. Verificar role confusion
    if (this.detectRoleConfusion(input)) {
      threats.push('ROLE_CONFUSION');
      sanitized = this.stripRoleInstructions(sanitized);
    }

    // Loggear si hay threats
    if (threats.length > 0) {
      this.logThreat(input, threats, context);
    }

    return { sanitized, threats, blocked };
  }

  private neutralizePrompt(input: string): string {
    // Remover patrones de inyección manteniendo el contenido útil
    let result = input;
    
    // Remover líneas que empiecen con "ignore", "disregard", etc.
    result = result.replace(/^.*\b(ignore previous|ignore all previous|disregard prior|forget everything).*$/gim, '[FILTERED]');
    
    // Remover delimitadores de turnos
    result = result.replace(/<\/?(?:system|user|assistant)[^>]*>/gi, '');
    
    // Remover intentos de override
    result = result.replace(/^.*\b(instead of|rather than|change your).*$/gim, '[FILTERED]');
    
    return result.trim();
  }

  private detectJailbreakAttempt(input: string): boolean {
    const jailbreakPatterns = [
      /DAN\s+mode/i,                    // Do Anything Now
      /STFU\s+mode/i,                  // Shut Up and Do Nothing
      /evil\s+mode/i,
      /\b(developer|dev)\s*(mode|menu|command)\b/i,
      /\[\s* SYSTEM\s* \]/i,           // Intento de disfrazar system prompt
      /hypothetically\s+(describe|explain|how to)\s+(harmful|illegal)/i,
      /for\s+(educational|research)\s+purposes?\s+only/i,
    ];
    
    return jailbreakPatterns.some(pattern => pattern.test(input));
  }

  private containsSuspiciousEncoding(input: string): boolean {
    // Detectar strings que parecen estar encoded
    const hexPattern = /^[a-f0-9\s]{32,}$/i;
    const base64Suspicious = /^[A-Za-z0-9+\/=]{50,}$/;
    
    return hexPattern.test(input) || base64Suspicious.test(input);
  }

  private decodeAndStrip(input: string): string {
    // Intentar decodear pero NO ejecutar - solo para mostrar en logs
    try {
      return `[Encoded content - ${input.length} chars removed for security]`;
    } catch {
      return input;
    }
  }

  private detectRoleConfusion(input: string): boolean {
    // Detectar intentos de hacer que el modelo asuma roles no autorizados
    const rolePatterns = [
      /you\s+are\s+(now\s+)?(a|an)\s+(different|new)/i,
      /forget\s+that\s+you\s+are?/i,
      /you\s+(can|should)\s+(only|just)\s+respond\s+as/i,
      /as\s+a\s+(security expert|hacker|admin)/i,
    ];
    
    return rolePatterns.some(pattern => pattern.test(input));
  }

  private stripRoleInstructions(input: string): string {
    return input
      .replace(/^.*\b(you are now|pretend to be|act as if you are).*$/gim, '')
      .replace(/^.*\b(forget that you are|forget your).*$/gim, '')
      .trim();
  }

  private logThreat(input: string, threats: LLMThreat[], context?: { userRole: string; sessionId: string }): void {
    // Enviar log de amenaza al servidor de seguridad
    try {
      fetch('/api/security/llm-threat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          threats,
          inputLength: input.length,
          inputPreview: input.substring(0, 200), // Solo preview, no contenido completo
          userRole: context?.userRole || 'unknown',
          sessionId: context?.sessionId || 'unknown',
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }
}

export const llmInputSanitizer = new LLMInputSanitizer();
```

### 2. AI Output Filtering (OBLIGATORIO)

```typescript
// src/lib/security/llm-output-filter.ts

/**
 * Filtra respuestas de IA para:
 * - Prevenir leakage de datos sensibles
 * - Remover información de sistema/prompts
 * - Sanitizar respuestas peligrosas
 */

interface OutputFilterResult {
  filtered: string;
  filteredParts: string[];
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

class LLMOutputFilter {
  // Patrones de información sensible que NO debe salir nunca
  private readonly SENSITIVE_PATTERNS = [
    // IPs, emails, phones
    /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,           // IP addresses
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Emails
    /\+?\d{1,4}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g, // Phones
    
    // API keys, tokens
    /\b(ai|api|sk|key|token)[_-]?[a-zA-Z0-9]{20,}\b/gi,
    
    // System prompts internos
    /\[SYSTEM_PROMPT\]:.*/gi,
    /<system>.*<\/system>/gi,
    /{{system}}.*{{\/system}}/gi,
    
    // Credenciales
    /(password|passwd|pwd)\s*[:=]\s*\S+/gi,
    /(secret|token|key)\s*[:=]\s*\S+/gi,
  ];

  // Palabras que indican respuesta potencialmente peligrosa
  private readonly DANGEROUS_INDICATORS = [
    'exec(', 'eval(', '__import__', 'os.system', 'subprocess',
    'DROP TABLE', 'DELETE FROM', 'TRUNCATE', 'ALTER TABLE',
    'rm -rf', 'format', 'del /', 'fdisk',
  ];

  filter(output: string, requestContext?: { query: string; userId: string }): OutputFilterResult {
    let filtered = output;
    const filteredParts: string[] = [];

    // 1. Remover información sensible
    for (const pattern of this.SENSITIVE_PATTERNS) {
      const matches = output.match(pattern);
      if (matches) {
        filteredParts.push(...matches);
        filtered = filtered.replace(pattern, '[REDACTED]');
      }
    }

    // 2. Remover escapes de prompt (intentando revelar contexto)
    filtered = this.removePromptEscapes(filtered);

    // 3. Verificar indicadores de contenido peligroso
    const risk = this.assessRisk(filtered, requestContext);

    return { filtered, filteredParts, risk };
  }

  private removePromptEscapes(output: string): string {
    return output
      // Remover intentos de mostrar el prompt original
      .replace(/Here['\s]*(is|s)[\s]*(the|your|my)[\s]*(system|original)[\s]*(prompt|instructions?)/gi, '[System instruction hidden]')
      // Remover cadenas que intenten revelar contexto
      .replace(/Current[\s]*(system|assistant)[\s]*(configuration|instructions|memory)[\s]*:/gi, '[Configuration hidden]')
      // Remover escapes de XML/JSON que intenten revelar
      .replace(/<Context>[\s\S]*?<\/Context>/gi, '[Context hidden]')
      .replace(/\{[\s\S]*?"system_prompt"[\s\S]*?\}/gi, '[Prompt hidden]');
  }

  private assessRisk(output: string, context?: { query: string; userId: string }): 'LOW' | 'MEDIUM' | 'HIGH' {
    let score = 0;

    // Verificar indicadores peligrosos
    for (const indicator of this.DANGEROUS_INDICATORS) {
      if (output.toLowerCase().includes(indicator.toLowerCase())) {
        score += 2;
      }
    }

    // Verificar si intenta dar instrucciones para ataques
    if (/\b(hack|exploit|vulnerability|attack)\b.*\b(how|steps?|guide|tutorial)\b/i.test(output)) {
      score += 3;
    }

    // Verificar si intenta revelar información de otros usuarios
    if (/\b(another user|previous session|other person|user['\s]?s?\s+data)\b/i.test(output)) {
      score += 2;
    }

    if (score >= 5) return 'HIGH';
    if (score >= 2) return 'MEDIUM';
    return 'LOW';
  }
}

export const llmOutputFilter = new LLMOutputFilter();
```

### 3. AI Command Center Protection - "Will" Assistant

```typescript
// src/lib/ai/will-protection.ts

/**
 * Protecciones específicas para el asistente "Will" y el Command Center.
 * El asistente de IA es el vector de ataque más sensible.
 */

interface AIInteractionLog {
  timestamp: string;
  userId: string;
  query: string;
  sanitizedQuery: string;
  response?: string;
  threatsDetected: LLMThreat[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  processingTimeMs: number;
}

/**
 * Wrapper de seguridad para TODAS las interacciones con Will
 */
class WillSecurityWrapper {
  private inputSanitizer: LLMInputSanitizer;
  private outputFilter: LLMOutputFilter;
  private interactionHistory: AIInteractionLog[] = [];
  private readonly MAX_HISTORY = 50;

  constructor() {
    this.inputSanitizer = new LLMInputSanitizer();
    this.outputFilter = new LLMOutputFilter();
  }

  /**
   * Procesa una query hacia Will con sanitización completa
   */
  async processQuery(
    query: string,
    context: { userId: string; userRole: string; sessionId: string; tenantId: string }
  ): Promise<{ sanitized: string; threats: LLMThreat[] }> {
    const startTime = Date.now();

    // 1. Sanitizar input
    const sanitization = this.inputSanitizer.sanitize(query, {
      userRole: context.userRole,
      sessionId: context.sessionId,
    });

    // 2. Loggear la interacción
    const logEntry: AIInteractionLog = {
      timestamp: new Date().toISOString(),
      userId: context.userId,
      query: query.substring(0, 500), // Guardar preview, no todo
      sanitizedQuery: sanitization.sanitized.substring(0, 500),
      threatsDetected: sanitization.threats,
      riskLevel: sanitization.threats.length > 0 ? 'HIGH' : 'LOW',
      processingTimeMs: Date.now() - startTime,
    };

    this.addToHistory(logEntry);

    // 3. Si threats de alta severidad, notificar
    if (sanitization.threats.includes('PROMPT_INJECTION') || sanitization.threats.includes('JAILBREAK_ATTEMPT')) {
      await this.notifySecurityTeam(logEntry);
    }

    return {
      sanitized: sanitization.sanitized,
      threats: sanitization.threats,
    };
  }

  /**
   * Filtra respuesta de Will antes de entregarla al usuario
   */
  filterResponse(
    response: string,
    context: { userId: string; query: string }
  ): string {
    const result = this.outputFilter.filter(response, context);
    
    // Si riesgo alto, marcar para revisión humana
    if (result.risk === 'HIGH') {
      this.flagForReview(result.filtered, context);
    }

    return result.filtered;
  }

  private addToHistory(entry: AIInteractionLog): void {
    this.interactionHistory.push(entry);
    if (this.interactionHistory.length > this.MAX_HISTORY) {
      this.interactionHistory = this.interactionHistory.slice(-this.MAX_HISTORY);
    }
  }

  private async notifySecurityTeam(log: AIInteractionLog): Promise<void> {
    try {
      await fetch('/api/security/ai-threat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'WILL_INTERACTION_THREAT',
          ...log,
        }),
        keepalive: true,
      });
    } catch {}
  }

  private flagForReview(response: string, context: { userId: string; query: string }): void {
    // Guardar respuesta para revisión humana
    try {
      fetch('/api/security/ai-review-flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responsePreview: response.substring(0, 500),
          userId: context.userId,
          queryPreview: context.query.substring(0, 200),
          timestamp: new Date().toISOString(),
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }

  getRecentInteractions(userId: string): AIInteractionLog[] {
    return this.interactionHistory.filter(i => i.userId === userId).slice(-10);
  }
}

export const willSecurity = new WillSecurityWrapper();
```

### 4. Rate Limiting para AI Endpoints

```typescript
// src/lib/security/ai-rate-limiter.ts

/**
 * Rate limiting específico para endpoints de IA.
 * Previene abuso y consumo excesivo de recursos.
 */

interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxTokensPerMinute: number;
  maxConcurrentRequests: number;
  cooldownPeriodSeconds: number;
}

class AIAgentLimiter {
  private requests: Map<string, number[]> = new Map();
  private tokens: Map<string, number[]> = new Map();
  private concurrentRequests: Map<string, number> = new Map();
  private cooldowns: Map<string, number> = new Map();

  private readonly DEFAULT_CONFIG: RateLimitConfig = {
    maxRequestsPerMinute: 30,      // 1 request cada 2 segundos
    maxTokensPerMinute: 50000,     // ~4000 tokens/min
    maxConcurrentRequests: 3,      // Max 3 requests simultáneos
    cooldownPeriodSeconds: 60,    // 1 min de cooldown si se pasa
  };

  checkLimit(
    userId: string,
    tokenEstimate: number,
    config?: Partial<RateLimitConfig>
  ): { allowed: boolean; retryAfter?: number } {
    const cfg = { ...this.DEFAULT_CONFIG, ...config };
    const now = Date.now();

    // 1. Verificar cooldown
    const cooldownUntil = this.cooldowns.get(userId) || 0;
    if (now < cooldownUntil) {
      return { allowed: false, retryAfter: Math.ceil((cooldownUntil - now) / 1000) };
    }

    // 2. Verificar requests por minuto
    const userRequests = this.requests.get(userId) || [];
    const recentRequests = userRequests.filter(t => now - t < 60000);
    if (recentRequests.length >= cfg.maxRequestsPerMinute) {
      this.applyCooldown(userId, cfg.cooldownPeriodSeconds * 1000);
      return { allowed: false, retryAfter: cfg.cooldownPeriodSeconds };
    }

    // 3. Verificar tokens por minuto
    const userTokens = this.tokens.get(userId) || [];
    const recentTokens = userTokens.filter(t => now - t < 60000);
    const totalTokens = recentTokens.reduce((sum, t) => sum + t, 0) + tokenEstimate;
    if (totalTokens > cfg.maxTokensPerMinute) {
      return { allowed: false, retryAfter: 30 };
    }

    // 4. Verificar concurrentes
    const concurrent = this.concurrentRequests.get(userId) || 0;
    if (concurrent >= cfg.maxConcurrentRequests) {
      return { allowed: false, retryAfter: 10 };
    }

    // Todo OK - registrar
    this.requests.set(userId, [...recentRequests, now]);
    this.tokens.set(userId, [...recentTokens, tokenEstimate]);
    this.concurrentRequests.set(userId, concurrent + 1);

    // Cleanup histórico (cada hora)
    if (Math.random() < 0.01) {
      this.cleanup();
    }

    return { allowed: true };
  }

  release(userId: string): void {
    const current = this.concurrentRequests.get(userId) || 0;
    if (current > 0) {
      this.concurrentRequests.set(userId, current - 1);
    }
  }

  private applyCooldown(userId: string, durationMs: number): void {
    this.cooldowns.set(userId, Date.now() + durationMs);
    
    // Log el evento
    try {
      fetch('/api/security/rate-limit-breach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          cooldownUntil: new Date(Date.now() + durationMs).toISOString(),
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    } catch {}
  }

  private cleanup(): void {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    
    for (const [userId, times] of this.requests.entries()) {
      const filtered = times.filter(t => t > oneHourAgo);
      if (filtered.length === 0) {
        this.requests.delete(userId);
      } else {
        this.requests.set(userId, filtered);
      }
    }
  }
}

export const aiRateLimiter = new AIAgentLimiter();
```

### 5. AI Audit Trail Específico

```typescript
// Cada interacción con IA DEBE ser loggeada con este formato:
interface AIAuditEntry {
  id: string;
  timestamp: string;
  
  // Quién
  userId: string;
  userEmail: string;
  userRole: string;
  tenantId: string;
  
  // Qué AI
  agentName: string;           // 'Will', 'Assistant', 'Analyzer', etc.
  interactionType: 'QUERY' | 'ANALYSIS' | 'GENERATION' | 'SUMMARY';
  
  // Input
  queryPreview: string;        // Primeros 200 chars
  queryTokens: number;
  threatsDetected: LLMThreat[];
  
  // Output
  responsePreview: string;      // Primeros 200 chars
  responseTokens: number;
  responseRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  
  // Contexto técnico
  model: string;               // 'gpt-4', 'claude-3', etc.
  latency: number;             // ms
  cost: number;                // USD
  
  // Compliance
  dataClassification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL';
  retentionDays: number;       // Min 90 para compliance
}

// El log se persiste en tabla separada: ai_audit_logs
// NUNCA se modifica o elimina (immutable)
```

### Checklist de AI/LLM Security

```
AI/LLM SECURITY CHECKLIST:
├── [ ] Input sanitization implemented for ALL AI calls
├── [ ] Output filtering implemented for ALL AI responses
├── [ ] Will assistant wrapped with WillSecurityWrapper
├── [ ] Rate limiting on AI endpoints configured
├── [ ] AI-specific audit logging enabled
├── [ ] Prompt injection patterns blocklisted
├── [ ] Jailbreak attempts detection active
├── [ ] Role confusion attacks detection active
├── [ ] Context overflow protection (MAX_INPUT_LENGTH)
├── [ ] Security team notification on HIGH risk threats
├── [ ] Human review flagging for HIGH risk responses
├── [ ] Training: Users informed about AI limitations
└── [ ] Red team testing for AI systems scheduled
```

---

## 🔒 HERRAMIENTAS DE SEGURIDAD AUTOMATIZADAS (CI/CD)

### Principio Fundamental
**Toda seguridad implementada DEBEN ejecutarse automáticamente en CI/CD** — No basta con escribir código de seguridad; hay que verificar continuamente que funciona, que no hay vulnerabilidades, y que nuevas contribuciones no introducen gaps.

```
HERRAMIENTAS DE SEGURIDAD IMPLEMENTADAS:
├── OWASP ZAP Scan      → Escaneo automático de vulnerabilidades web
├── SQLMap              → Pruebas automáticas de SQL injection
├── Redis Verification  → Verificación de configuración multi-instance
├── API Versioning      → Estructura de versionado con deprecación
└── Security Headers    → Headers aplicados globalmente
```

### 1. OWASP ZAP - Escaneo Automatizado de Vulnerabilidades

```yaml
# .github/workflows/zap-scan.yml
# Workflow de CI/CD que ejecuta OWASP ZAP automáticamente
# Se ejecuta en: push a main/develop, semanalmente, y on-demand

ESCANOS INCLUIDOS:
├── Baseline Scan        → Escaneo rápido de todos los endpoints
├── API Scan           → Validación de OpenAPI/Swagger
├── Full Scan          → Escaneo completo activo (semanal)
├── SQL Injection Scan → Pruebas específicas de SQLi
└── CSP Analysis       → Verificación de Content Security Policy
```

**Para usar en nuevo módulo:** No requiere configuración adicional. El workflow escanea automáticamente todos los endpoints `/api/*`.

### 2. SQLMap - Pruebas de SQL Injection

```yaml
# .github/workflows/sqlmap-scan.yml
# Escaneo automático de SQL injection en todos los endpoints API
# Detecta vulnerabilidades SQLi antes de producción

NIVELES DE ESCANEO:
├── Level 1 (Quick)     → Patrones básicos de SQLi
├── Level 2 (Standard)  → Patrones intermedios +data parameter testing
└── Level 3 (Full)      → Todos los patrones + crawling profundo

ENDPOINTS ESCANEADOS:
- /api/usuarios
- /api/campanas
- /api/roles
- /api/auth/*
- Todos los endpoints del módulo
```

**Para usar en nuevo módulo:** Agregar nuevos endpoints al array de ENDPOINTS en el workflow si el módulo tiene endpoints críticos.

### 3. Redis Multi-Instance Verification

```typescript
// scripts/verify-redis-mult-instance.ts
# Verificación de configuración Redis para producción multi-instance

INSTANCIAS VERIFICADAS:
├── cache-primary       → Redis principal de cache
├── cache-replica-1     → Réplica para HA
├── session-primary     → Redis de sesiones
└── rate-limit          → Redis para rate limiting

VALIDACIONES:
├── Conectividad a todas las instancias
├── Latencia de cada instancia
├── Memoria y ops/sec
├── Configuración de cluster HA
└── Recomendaciones de producción
```

**Para usar:** Ejecutar `npx ts-node scripts/verify-redis-mult-instance.ts` para verificar configuración Redis.

### 4. API Versioning - Estructura de Versionado

```typescript
// src/lib/api/api-versioning.ts
# Sistema de versionado API con soporte para v1 (deprecated) y v2 (current)

VERSIONES SOPORTADAS:
├── v1 (Deprecated)     → Sunset: 2026-12-31
│   └── MigrationUrl: /api/v2
└── v2 (Current)       → Versión activa

HEADER DE NEGOCIACIÓN:
X-API-Version: v2
Accept: application/vnd.silexar.v2

DEPRECIACIÓN:
├── Headers deprecation: X-API-Deprecated: true
├── Header sunset: Sunset: Sat, 31 Dec 2026 23:59:59 GMT
└── Header migration: X-API-Migration-URL: /api/v2
```

**Para usar en nuevo módulo:**
```typescript
import { createVersionedRoute } from '@/lib/api/api-versioning';

export const GET = createVersionedRoute(
  { v2: handlerV2, v1: handlerV1 },
  defaultHandler  // Handler por defecto para versiones no especificadas
);
```

### 5. Security Headers Globales

Los security headers se aplican automáticamente a todas las respuestas via `withApiRoute` y `security-headers.ts`:

```typescript
// Headers aplicados automáticamente:
Content-Security-Policy        // CSP estricto
Strict-Transport-Security     // HSTS (31536000 segundos)
X-Frame-Options               // DENY
X-Content-Type-Options        // nosniff
Referrer-Policy               // strict-origin-when-cross-origin
Cross-Origin-Resource-Policy  // same-origin
Permissions-Policy            // Deshabilita features no usados
X-RateLimit-Version           // Versión de API del request
```

### Checklist de Herramientas de Seguridad

```
HERRAMIENTAS DE SEGURIDAD CHECKLIST:
├── [✓] OWASP ZAP configurado en CI/CD
├── [✓] SQLMap configurado en CI/CD
├── [✓] Redis verification script disponible
├── [✓] API versioning implementado (v1/v2)
├── [✓] Security headers aplicados globalmente
├── [ ] Nuevo módulo: agregar endpoints críticos a SQLMap scan
├── [ ] Nuevo módulo: usar createVersionedRoute si hay breaking changes
├── [ ] Nuevo módulo: verificar con Redis script antes de producción
└── [ ] Ejecutar ZAP scan antes de cada release
```

---

## 📊 PATRONES DE RESILIENCIA ENTERPRISE

### Circuit Breaker Pattern
```typescript
import { CircuitBreaker } from '@lib/resilience';

const circuitBreaker = new CircuitBreaker({
  name: 'external-service',
  threshold: 5,
  timeout: 30000,
  resetTimeout: 60000,
});

await circuitBreaker.execute(() => externalService.call());
```

### Retry with Exponential Backoff
```typescript
import { retry } from '@lib/resilience';

const result = await retry(
  () => potentiallyFailingOperation(),
  { maxAttempts: 3, initialDelay: 1000, maxDelay: 10000, backoffMultiplier: 2 }
);
```

### Outbox Pattern
```typescript
await withUnitOfWork(async (uow) => {
  await uow.save(entity);
  await uow.publish(new EntityCreatedEvent(entity.id));
});
```

---

## 🎨 DISEÑO NEUMORPHISM EXACTO

### Tokens Visuales Obligatorios
```css
/* FONDO */
bg-[#F0EDE8]

/* SOMBRAS */
shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]        /* Elevado */
shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] /* Hundido */

/* BORDES */
rounded-2xl | rounded-3xl | rounded-full
border border-white/60

/* TEXTO */
text-slate-800   /* Primario */
text-slate-500   /* Secundario */
text-slate-400   /* Placeholder */
```

### PROHIBIDO en UI
- `bg-slate-950`, `bg-black` (fondos oscuros)
- `rounded-none`, `rounded-sm`
- `text-white` fuera de botones primarios
- Modales sin `backdrop-blur`

### Template de Card Base
```tsx
<div className="rounded-2xl p-6 bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50">
  {children}
</div>
```

---

## 🧱 TEMPLATES DE CÓDIGO COPIABLES

### Template: Entity Categoría CRITICAL
```typescript
// src/modules/{modulo}/domain/entities/MiEntidad.ts
import { z } from 'zod';
import { DomainEvent } from '../events/DomainEvent';

export const MiEntidadSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  nombre: z.string().min(1).max(200),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'PENDIENTE']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MiEntidadProps = z.infer<typeof MiEntidadSchema>;

export class MiEntidad {
  private constructor(private props: MiEntidadProps) {
    this.validate();
  }

  static create(props: Omit<MiEntidadProps, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): MiEntidad {
    const now = new Date();
    return new MiEntidad({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: MiEntidadProps): MiEntidad {
    return new MiEntidad(props);
  }

  private validate(): void {
    const result = MiEntidadSchema.safeParse(this.props);
    if (!result.success) {
      throw new Error(`MiEntidad inválida: ${result.error.message}`);
    }
  }

  get id(): string { return this.props.id; }
  get tenantId(): string { return this.props.tenantId; }
  get nombre(): string { return this.props.nombre; }
  get estado(): string { return this.props.estado; }

  toSnapshot(): MiEntidadProps {
    return { ...this.props };
  }
}
```

### Template: API Route Base (Categoría STANDARD)
```typescript
// src/app/api/{modulo}/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, and, desc, count } from 'drizzle-orm';
import { withApiRoute } from '@/lib/api/with-api-route';
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response';
import { logger } from '@/lib/observability';
import { auditLogger } from '@/lib/security/audit-logger';
import { AuditEventType } from '@/lib/security/audit-types';
import { withTenantContext } from '@/lib/db/tenant-context';
import { getDB } from '@/lib/db';
import { miTabla } from '@/lib/db/schema';

const createSchema = z.object({
  nombre: z.string().min(1).max(255),
}).strict();

export const GET = withApiRoute(
  { resource: 'modulo', action: 'read', skipCsrf: true },
  async ({ ctx }) => {
    try {
      const data = await withTenantContext(ctx.tenantId, async () => {
        return await getDB()
          .select()
          .from(miTabla)
          .where(and(eq(miTabla.tenantId, ctx.tenantId), eq(miTabla.eliminado, false)))
          .orderBy(desc(miTabla.createdAt));
      });
      return apiSuccess(data) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error GET modulo', error instanceof Error ? error : undefined);
      return apiServerError() as unknown as NextResponse;
    }
  }
);

export const POST = withApiRoute(
  { resource: 'modulo', action: 'create' },
  async ({ ctx, req }) => {
    try {
      const body = await req.json();
      const parsed = createSchema.safeParse(body);
      if (!parsed.success) {
        return apiError('VALIDATION_ERROR', 'Error de validación', 422, parsed.error.flatten().fieldErrors) as unknown as NextResponse;
      }

      const nuevo = await withTenantContext(ctx.tenantId, async () => {
        const [inserted] = await getDB()
          .insert(miTabla)
          .values({
            tenantId: ctx.tenantId,
            nombre: parsed.data.nombre,
            creadoPorId: ctx.userId,
          })
          .returning();
        return inserted;
      });

      auditLogger.log({ type: AuditEventType.DATA_CREATE, userId: ctx.userId, metadata: { module: 'modulo', resourceId: nuevo.id } });
      return apiSuccess(nuevo, 201) as unknown as NextResponse;
    } catch (error) {
      logger.error('Error POST modulo', error instanceof Error ? error : undefined);
      return apiServerError() as unknown as NextResponse;
    }
  }
);
```

### Template: Página Frontend Base
```tsx
// src/app/{modulo}/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function ModuloPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('/api/modulo')
      .then(r => r.json())
      .then(json => { if (json.success) setItems(json.data); });
  }, []);

  return (
    <div className="min-h-screen bg-[#dfeaff] p-6 lg:p-8">
      <style>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #dfeaff; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: #bec8de; border-radius: 10px; box-shadow: inset 1px 1px 2px rgba(0,0,0,0.08); }
        ::-webkit-scrollbar-thumb:hover { background: #6888ff; }
        ::-webkit-scrollbar-corner { background: #dfeaff; }
      `}</style>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="rounded-3xl p-6 bg-[#dfeaff] border border-white/40 shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]">
          <h1 className="text-2xl font-bold text-[#69738c]">Módulo</h1>
        </div>
      </div>
    </div>
  );
}
```

---

## 🛡️ SISTEMA DE GUARDADO DE ERRORES (Anti-Recurrencia)

Cada vez que durante la construcción se encuentre un error, DEBE registrarse en `.agent/knowledge/SYSTEM_KNOWLEDGE_BASE.md` con este formato:

```markdown
### [E###] {Nombre corto del error}
**Fecha detectado:** YYYY-MM-DD  
**Detectado por:** Agente {Nombre}  
**Severidad:** 🔴 CRÍTICO / 🟠 ALTO / 🟡 MEDIO  
**Recurrencia:** {N}

**Descripción:**
{Qué pasó y por qué}

**Archivos afectados:**
- `{ruta}`

**Solución aplicada:**
```
{código o pasos}
```

**Checklist preventivo:**
- [ ] {Acción para evitar que vuelva a ocurrir}
```

### Categorías de errores que SIEMPRE deben registrarse:
1. **Errores de arquitectura**: Domain importando de infrastructure, imports cruzados entre módulos.
2. **Errores de seguridad**: Ruta sin `withApiRoute`, query sin `withTenantContext`, input sin Zod.
3. **Errores de UI**: Fondo incorrecto, sombras neumorphism faltantes, mobile roto.
4. **Errores de calidad**: Tests vacíos (`expect(true).toBe(true)`), `any` sin justificar, `console.log` en producción.
5. **Errores de proceso**: Construir sin plan, no actualizar knowledge base, no ejecutar QC.

---

## ✅ CHECKLIST FINAL ANTES DE ENTREGAR UN MÓDULO

### Backend
- [ ] Todos los endpoints protegidos con `withApiRoute()` (excepto auth/login/health/webhooks)
- [ ] Todos los inputs validados con Zod (`.strict()`)
- [ ] Todas las queries a DB usan `withTenantContext()`
- [ ] Si es Categoría CRITICAL: Domain no importa de infrastructure/presentation
- [ ] Si es Categoría CRITICAL: Commands y Handlers usan Result Pattern
- [ ] Audit logging en CREATE, UPDATE, DELETE
- [ ] Security headers en todas las respuestas
- [ ] No hay secrets hardcodeados
- [ ] No hay `eval()` ni `new Function()`

### Frontend
- [ ] Fondo `#dfeaff` en desktop, `#F0EDE8` en mobile
- [ ] Cards usan `bg-[#dfeaff] rounded-3xl shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] border border-white/40`
- [ ] Botones principales tienen `rounded-xl` o `rounded-full` y sombra neumorphism dual
- [ ] Mobile existe o al menos es responsive (vista funciona en 375px)
- [ ] No hay `dangerouslySetInnerHTML` sin sanitizar
- [ ] **Scrollbars neumórficas**: Toda página incluye estilos globales `::-webkit-scrollbar` con `#dfeaff` track + `#bec8de` thumb + `#6888ff` hover
- [ ] **Menú de navegación de módulos (`ModuleNavMenu`)**: Toda página incluye `<ModuleNavMenu />` al costado izquierdo junto al botón ←. El menú lee los módulos habilitados desde `localStorage` (configurables por el admin). ~30 módulos del sistema. La configuración se edita en `/configuracion/navegacion?popup=1` como ventana popup nativa con grid fluido, scrollbar neumórfica y cierre automático al guardar
- [ ] **Botón "Ventana" popup**: La página `nuevo/page.tsx` incluye botón que abre `window.open('/{modulo}/nuevo?popup=1')` con `screen.availWidth/availHeight`
- [ ] **Ventana de detalle con popup**: Toda ventana flotante de detalle/visualización incluye botón "Ventana" que abre `window.open('/{modulo}/ver?id=' + record.id)`
- [ ] **Página `ver/page.tsx`**: Existe página standalone para mostrar detalle en popup nativo con scrollbar neumórfica y layout responsive
- [ ] **Header limpio**: Ventanas flotantes NO usan los 3 círculos de colores estilo Mac OS — solo título, badge, Ventana, Maximizar, Cerrar
- [ ] **Popup responsive**: Cuando `?popup=1`, el formulario usa ancho completo (`max-w-full`) y se adapta al resize nativo del SO
- [ ] **Grids fluidos en popup**: Las páginas `ver/page.tsx` y `nuevo/page.tsx?popup=1` usan `grid-cols-[repeat(auto-fill,minmax(260px,1fr))]` para crear columnas dinámicas según el ancho de la ventana
- [ ] **Draft sincroniza paso actual**: El draft en localStorage incluye `currentStep` para que popup y ventana principal muestren el mismo paso del wizard
- [ ] **Draft sincroniza maxStepReached**: El draft incluye `maxStepReached` para mantener clickeables los pasos completados al navegar hacia atrás
- [ ] **Limpiar draft al montar**: La página de creación limpia `localStorage.removeItem(DRAFT_KEY)` al montar (modo no-popup) para empezar siempre limpio

### Calidad
- [ ] `npm run check` (o `tsc --noEmit`) sin errores nuevos
- [ ] `npm run lint` sin errores bloqueantes nuevos
- [ ] No se agregaron tests dummy vacíos
- [ ] No se dejaron stubs sin implementar
- [ ] No se agregaron archivos de backup (.backup, .tmp, .old)

### Documentación
- [ ] `implementation_plan.md` creado y aprobado
- [ ] Si hubo errores durante construcción → registrados en `SYSTEM_KNOWLEDGE_BASE.md`
- [ ] Si hubo desviaciones del protocolo → justificadas en `SYSTEM_KNOWLEDGE_BASE.md`

---

## 🔄 POST-CONSTRUCCIÓN OBLIGATORIA

1. Ejecutar:
   ```bash
   npm run check   # o npx tsc --noEmit
   npm run lint
   ```
2. Si hay errores: corregir, registrar en knowledge base, y repetir.
3. Si todo pasa: reportar al usuario con:
   - Categoría elegida y justificación
   - Estructura de archivos creada
   - Estado del checklist (X/16 items)
   - Lecciones aprendidas registradas (Sí/No)

---

## 🎯 NIVELES DE MADUREZ EMPRESARIAL

Este protocolo garantiza implementación en los siguientes niveles:

| Nivel | Características | Time to Market |
|-------|-----------------|----------------|
| **PRODUCTION** | 100% features, 0% shortcuts | 8-12 semanas |
| **STAGING** | 95% features, testing completo | 4-6 semanas |
| **MVP** | NO LONGER ACCEPTED | N/A |

> **NOTA:** El usuario ha solicitado explícitamente NO usar niveles MVP/TIER.
> Todos los módulos deben construirse al nivel PRODUCTION enterprise.

---

> **"La excelencia empresarial no es opcional — es la única manera de operar."**
>
> *— Silexar Pulse Engineering*
