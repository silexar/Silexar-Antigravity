# Plan de Actualización de Dependencias - Silexar Pulse

## Estado Actual
- **Vulnerabilidades de seguridad:** 0 críticas reportadas por `npm audit`
- **Paquetes desactualizados:** ~50 (mezcla de patch, minor y major)
- **Estrategia:** Actualizar de forma ordenada, NUNCA todo de golpe

---

## Script Automatizado

Ejecutar desde PowerShell como **Administrador**:

```powershell
.\scripts\update-dependencies-safe.ps1
```

Este script hace:
1. Limpia `node_modules` bloqueado
2. Restaura `package-lock.json` desde git
3. Corre `npm ci` para validar estado base
4. Actualiza automáticamente **patches y minors seguras**
5. Corre `tsc --noEmit` y `npm run build` para verificar
6. Genera un reporte de **majors pendientes** que requieren migración manual

---

## Categorías de Riesgo

### 🟢 PATCH / MINOR SEGURAS (actualizar automáticamente)

| Paquete | Tipo | Nota |
|---------|------|------|
| `@azure/keyvault-secrets` | patch | Seguridad Azure |
| `@sentry/nextjs` | minor | Error tracking |
| `@supabase/supabase-js` | minor | Base de datos |
| `@tanstack/react-query` | minor | Caché de datos |
| `@vitest/*`, `vitest` | minor | Testing framework |
| `better-auth` | patch | Auth (revisar changelog) |
| `dotenv`, `isomorphic-dompurify`, `postcss`, `postgres`, `prettier` | patch | Infra/utilidades |
| `jose`, `jsonwebtoken` | minor | Seguridad JWT |
| `react` / `react-dom` | patch | Core framework |
| `undici` | minor | Fetch HTTP |
| `zod`, `zustand`, `framer-motion`, `d3` | minor | Librerías de UI/estado |

### 🟡 MODERADAS (requieren revisión de código tras update)

| Paquete | Tipo | Riesgo |
|---------|------|--------|
| `lucide-react` | major (0.x→1.x) | Posibles iconos renombrados |
| `recharts` | major (2→3) | Cambios en tipos de gráficos |
| `date-fns` | major (2→4) | Cambios en imports/locales |

### 🔴 MAJORS PELIGROSAS (requieren migración planificada, UNA POR UNA)

| Paquete | Salto | Riesgo | Acción requerida |
|---------|-------|--------|------------------|
| `tailwindcss` | 3.4 → 4.2 | **MUY ALTO** | Reescritura total de configuración. Migrar `tailwind.config.js` a CSS-based config. |
| `next` | 15 → 16 | **ALTO** | Cambios de runtime, posibles breaking en App Router y middleware. |
| `eslint` | 9 → 10 | **ALTO** | Peer deps rotos. `eslint-plugin-react-hooks` aún no soporta v10 oficialmente. |
| `@eslint/js` | 9 → 10 | **ALTO** | Debe actualizarse junto con `eslint`. |
| `eslint-plugin-react-hooks` | 5 → 7 | **ALTO** | Cambios en reglas, verificar compatibilidad con ESLint. |
| `typescript` | 5.8 → 6.0 | **MEDIO-ALTO** | Type-checking más estricto. Miles de errores potenciales en proyecto grande. |
| `vite` | 6 → 8 | **ALTO** | Saltos de 2 majors. Revisar todos los plugins de Vite. |
| `@types/node` | 22 → 25 | **MEDIO** | Tipos más estrictos. Actualizar cuando suba Node.js en prod. |
| `redis` | 4 → 5 | **MEDIO** | Cambios en API del cliente de Redis. Revisar `src/lib/cache/redis-cache.ts`. |
| `storybook` ecosystem | 8 → 10 | **ALTO** | Migración de addons y configuración. Solo si se usa activamente. |

---

## Proceso Recomendado

### Fase 1: Ahora (después de reiniciar PC)
```powershell
.\scripts\update-dependencies-safe.ps1
```
Commit del resultado.

### Fase 2: Migrar majors (una por semana, no de golpe)
1. Semana 1: `date-fns` 2→4
2. Semana 2: `lucide-react` 0→1 + `recharts` 2→3
3. Semana 3: `redis` 4→5
4. Semana 4: `@types/node` 22→25
5. **Después de estabilizar:** `next` 15→16
6. **Mucho después:** `tailwindcss` 3→4 (la más destructiva)
7. **Último:** `typescript` 5→6 + `eslint` 9→10 + `vite` 6→8

---

## Workflows de Seguridad Configurados

Todos los "perros de guardia" ya están en `.github/workflows/` y funcionan:

- `security-scan.yml` — NPM Audit + CodeQL
- `security.yml` — npm audit report-only + TypeScript check + secret grep
- `security-hardening.yml` — Secret scan + dependency audit + SAST + security tests
- `scheduled-security-audit.yml` — Reporte semanal con Issue automático si hay críticas
- `security-report.yml` — Reporte diario con score de seguridad
- `performance-monitoring.yml` — Tests de performance (con `--if-present` para no fallar si faltan scripts)
- `ci.yml` — CI principal (non-blocking temporalmente mientras se estabilizan errores)

---

## Nota Importante

> **"Mejor prevenir que corregir en producción"** es cierto, pero **"actualizar todo de golpe" no es prevenir, es jugar a la ruleta rusa**. Las empresas enterprise nunca hacen eso. Hacen updates graduales, con tests, rollback plan y ventanas de mantenimiento.

Este plan te da seguridad sin romper tu ritmo de desarrollo.
