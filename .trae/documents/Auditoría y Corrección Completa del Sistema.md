## Alcance
- Revisar seguridad, estabilidad, configuración y calidad de `Next.js` + `TypeScript` con API, BD (Drizzle/Postgres), CI/CD y Docker.
- Auditar rutas críticas (auth, campanas, salud/monitoring), middleware y configuración de despliegue.

## Hallazgos Críticos
- Falta `Content-Security-Policy` en middleware: `src/middleware.ts:4–12` (no se fija CSP; se expone `X-Powered-By`).
- CSP permisiva y timers perpetuos: `src/lib/security/security-headers.ts:141–146` incluye `'unsafe-inline'` y `'unsafe-eval'`; `setInterval` sin ciclo de vida `246–252`.
- Secretos por defecto en JWT: `src/app/api/auth/login/route.ts:457–468` usa claves débiles si faltan env vars.
- CORS demasiado abierto: `src/app/api/auth/login/route.ts:552–555` permite `'*'`.
- Credenciales BD por defecto: `src/lib/db/config.ts:117–121` y `drizzle.config.ts:8–13` hardcodean usuario/clave.
- Script inline con `dangerouslySetInnerHTML`: `src/app/layout.tsx:147–232` requiere nonce/hash y CSP efectiva.
- Docker espera `.next/standalone` sin configurarlo: `Dockerfile.production:85` y `next.config.js:2–14` (no hay `output: 'standalone'`).
- Build oculta problemas: `next.config.js:9–13` ignora errores de TypeScript y ESLint.
- Manejo de errores genérico en `campanas`: `src/app/api/campanas/route.ts:48–51` devuelve `INTERNAL_ERROR` con `message` sin auditoría.

## Correcciones Propuestas (Faseadas)
### Fase 1 — Seguridad y Configuración
- Integrar CSP y políticas cruzadas en middleware
  - Usar `securityHeaders.applySecurityHeaders(req,res)` y fijar `CSP`, `Permissions-Policy`, `COOP/COEP/CORP`.
  - Eliminar `X-Powered-By`: `src/middleware.ts:11`.
- Endurecer CSP
  - Quitar `'unsafe-eval'`, minimizar `'unsafe-inline'` con `nonce` y `hash`.
  - Añadir endpoint de reportes `POST /api/security/csp-report` y `report-to`.
- Secretos obligatorios
  - Requerir `JWT_SECRET` y `JWT_REFRESH_SECRET`; fallar si faltan (sin defaults): `src/app/api/auth/login/route.ts`.
  - Extraer a util `env.ts` que valide todas las vars críticas.
- CORS restringido
  - `OPTIONS` auth: limitar `Access-Control-Allow-Origin` a lista blanca (`NEXT_PUBLIC_APP_URL` o `AUTH_ALLOWED_ORIGINS`).
- Base de datos segura
  - `src/lib/db/config.ts` y `drizzle.config.ts`: leer credenciales desde env, sin valores por defecto; `ssl` con CA/CLIENT certs solo si definidos.
- Script inline
  - Externalizar a archivo estático y referenciar con `nonce`; o activar solo en `development` y proteger con CSP hash.

### Fase 2 — Estabilidad y Rendimiento
- Gestionar `setInterval`
  - Encapsular timers con singleton y cancelación; condicionar por `NODE_ENV` y evitar múltiples instancias en serverless.
- Docker + Next
  - Añadir `output: 'standalone'` en `next.config.js` o ajustar Docker a `next start` si no se usa standalone.
- Calidad de build
  - Dejar de ignorar errores TS/ESLint en `next.config.js`; mover tolerancias a CI con excepciones puntuales.
- Lint-staged coherente
  - Usar `biome` en `lint-staged` o añadir `eslint`/`prettier` si se mantienen.

### Fase 3 — Manejo de Errores y Auditoría
- Respuestas estándar
  - Crear helper de respuesta de error con `code`, `correlationId`, `severity`, cabeceras de seguridad y auditoría (`auditLogger`).
  - Aplicarlo en `src/app/api/campanas/**/route.ts` y rutas utilitarias.
- Logging y trazabilidad
  - Correlation ID en middleware y propagación a rutas.

### Fase 4 — Validación
- Pruebas unitarias
  - Middleware: presencia de headers (CSP, HSTS, COOP/COEP/CORP).
  - Auth: fallo si faltan secretos; CORS restringido.
  - DB: configuración rechaza credenciales por defecto.
- E2E
  - Flujo de login, listados de campanas y salud (`/api/health`).
- Seguridad
  - Auditoría de dependencias y escaneo de Docker.

## Entregables
- Código actualizado con cambios descritos y referencias exactas.
- Informe de auditoría final con lista de correcciones y evidencias.
- Suite de pruebas pasando y reporte de cobertura actualizado.

¿Confirmas que proceda con estas correcciones faseadas? Tras tu confirmación, implementaré cada cambio y validaré con pruebas y ejecución local.