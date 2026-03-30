---
name: Security Audit
description: Auditoría completa de seguridad para Silexar Pulse — OWASP Top 10, secretos, headers, dependencias, RBAC, XSS/CSRF/SQLi
---

# 🔒 Security Audit Skill

Realiza una auditoría de seguridad exhaustiva del código fuente y configuración de Silexar Pulse Antygravity siguiendo estándares OWASP y mejores prácticas enterprise.

## Cuándo Usar Este Skill

- Antes de cada release o deploy a producción
- Al agregar nuevas rutas API o endpoints
- Al integrar librerías de terceros
- Al modificar autenticación, autorización o manejo de datos sensibles
- Auditorías periódicas de seguridad

## Archivos de Referencia del Proyecto

Los archivos de seguridad existentes están en `src/lib/security/`:

- `input-validation.ts` / `input-validator.ts` — Validación y sanitización de inputs
- `security-headers.ts` — Headers HTTP de seguridad
- `rate-limiter.ts` / `rate-limiting.ts` — Rate limiting
- `rbac.ts` / `SistemaRBAC.tsx` — Control de acceso basado en roles
- `audit-logger.ts` / `audit-trail.ts` — Logging y trazabilidad
- `password-security.ts` — Seguridad de contraseñas
- `owasp-zap-integration.ts` — Integración OWASP ZAP
- `QuantumSecurityShield.ts` — Sistema de seguridad avanzado

## Checklist de Auditoría

### 1. Secretos y Credenciales Hardcodeadas

Buscar en TODO el código fuente:

```bash
# Buscar API keys, tokens, passwords hardcodeados
grep -rn "apiKey\|api_key\|apikey\|secret\|password\|token\|credential" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v ".test."

# Buscar URLs con credenciales embebidas
grep -rn "https\?://.*:.*@" src/ --include="*.ts" --include="*.tsx"

# Verificar que .env no está en git
git ls-files .env .env.local .env.production
```

**Reglas:**

- ❌ NUNCA hardcodear secretos en código fuente
- ✅ Usar variables de entorno via `process.env.VARIABLE`
- ✅ Verificar que `.env`, `.env.local`, `.env.production` están en `.gitignore`
- ✅ Usar el `secret-manager.ts` existente para manejar secretos en producción

### 2. OWASP Top 10 — Checklist

#### A01: Broken Access Control

```
[ ] Verificar que TODAS las rutas API tienen guards de autenticación
[ ] Verificar que RBAC está implementado en cada endpoint sensible
[ ] Verificar que no hay IDOR (Insecure Direct Object References)
[ ] Verificar que los usuarios solo acceden a sus propios recursos
[ ] Verificar path traversal: inputs con "../" deben ser rechazados
```

#### A02: Cryptographic Failures

```
[ ] HTTPS obligatorio en producción
[ ] Contraseñas hasheadas con bcrypt (mínimo 12 rounds) — ver password-security.ts
[ ] JWT con algoritmo RS256 o ES256 (evitar HS256 en producción)
[ ] Datos sensibles cifrados en reposo — ver encryption-at-rest.ts
```

#### A03: Injection

```
[ ] SQLi: Usar SIEMPRE queries parametrizadas (Drizzle ORM / TypeORM)
[ ] XSS: Sanitizar TODOS los inputs antes de renderizar
[ ] Command Injection: No usar exec/eval con inputs del usuario
[ ] Validar con Zod: src/lib/security/input-validation.ts
```

Patrón de validación requerido:

```typescript
import { z } from "zod";

// ✅ CORRECTO: Validar con Zod antes de procesar
const schema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email(),
  id: z.string().uuid(),
});

// ❌ INCORRECTO: Usar input directo sin validar
const name = req.body.name; // PELIGROSO
```

#### A04: Insecure Design

```
[ ] Rate limiting en endpoints de login y API pública — ver rate-limiter.ts
[ ] Límites de intentos de autenticación (lockout después de 5 intentos)
[ ] CAPTCHA o verificación en formularios públicos
```

#### A05: Security Misconfiguration

```
[ ] Headers de seguridad configurados — ver security-headers.ts
[ ] CORS restrictivo (no usar origin: "*" en producción)
[ ] Error messages genéricos (no exponer stack traces al usuario)
[ ] Deshabilitar X-Powered-By header
```

Headers requeridos:

```typescript
// Headers obligatorios en producción
{
  'Content-Security-Policy': "default-src 'self'; script-src 'self'",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}
```

#### A06: Vulnerable and Outdated Components

```
[ ] Ejecutar: npm audit
[ ] Verificar que no hay dependencias con vulnerabilidades críticas
[ ] Actualizar dependencias con parches de seguridad disponibles
```

#### A07: Identification and Authentication Failures

```
[ ] Sesiones con timeout configurado
[ ] Tokens JWT con expiración corta (acceso: 15min, refresh: 7d)
[ ] Regenerar session ID después de login exitoso
[ ] Implementar logout que invalide tokens
```

#### A08: Software and Data Integrity Failures

```
[ ] Verificar integridad de dependencias (package-lock.json en git)
[ ] No ejecutar código dinámico de fuentes no confiables
[ ] Validar schemas de datos entrantes con Zod
```

#### A09: Security Logging and Monitoring Failures

```
[ ] Todos los eventos de auth se registran — ver audit-logger.ts
[ ] Los errores se registran sin exponer datos sensibles
[ ] Alertas configuradas para eventos sospechosos
```

#### A10: Server-Side Request Forgery (SSRF)

```
[ ] Validar y whitelistear URLs para llamadas HTTP desde el servidor
[ ] No permitir al usuario especificar URLs arbitrarias
[ ] Bloquear acceso a metadata de cloud (169.254.169.254)
```

### 3. Revisión de Dependencias

```bash
# Auditoría completa de dependencias
npm audit

# Solo vulnerabilidades altas y críticas
npm audit --audit-level=high

# Verificar dependencias desactualizadas
npm outdated
```

### 4. Configuración de CORS

Buscar en `src/middleware.ts` y archivos de API:

```typescript
// ❌ PELIGROSO en producción
cors({ origin: "*" });

// ✅ CORRECTO
cors({
  origin: ["https://silexar-pulse.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
});
```

### 5. Reporte Final

Al completar la auditoría, generar un reporte con:

1. **Resumen ejecutivo**: estado general de seguridad (🟢/🟡/🔴)
2. **Hallazgos críticos**: vulnerabilidades que requieren acción inmediata
3. **Hallazgos medios**: mejoras recomendadas
4. **Hallazgos bajos**: buenas prácticas pendientes
5. **Acciones tomadas**: correcciones realizadas durante la auditoría
6. **Recomendaciones**: pasos futuros para mejorar la postura de seguridad
