---
name: Audit System TIER 0 v3.0 — Silexar Pulse Antygravity (15 Fases Fortune 10)
description: Motor de auditoría suprema Fortune 10 con 15 Fases. Analiza arquitectura DDD, frontend, backend, seguridad OWASP, TypeScript, diseño Neumorphism, testing, error handling, performance, accesibilidad, calidad profunda del código (complejidad ciclomática, legibilidad, modularidad, comentarios, DRY), DevOps/CI-CD, observabilidad/logging, data layer/DB, y un Agente Operador que opera el sistema como usuario real usando browser_subagent. Entrega informe ejecutivo cuantitativo + plan de remediación priorizado. Activar con /audit o cuando el usuario pida "auditoría", "audit", "control de calidad global", "QA global" o "estado del sistema".
---

# 🛡️ AUDIT SYSTEM TIER 0 — Motor de Auditoría Suprema Fortune 10

Este Skill convierte a Antigravity en un **ejército de 15 ingenieros senior auditando en paralelo** todo el sistema Silexar Pulse — arquitectura, frontend, backend, seguridad, testing, performance, accesibilidad, error handling, diseño, código, DevOps, observabilidad, datos y operación real del usuario. Al finalizar entrega un **Informe Ejecutivo con métricas cuantitativas + Plan de Remediación priorizado** antes de ejecutar cualquier cambio.

> [!IMPORTANT]
> **REGLA DE ORO**: Este skill es de ANÁLISIS PRIMERO. Nunca modifica archivos durante la auditoría. Solo reporta hallazgos y propone el plan. El usuario aprueba antes de que se ejecute cualquier corrección.

> [!CAUTION]
> **INTEGRACIÓN CON SKILLS**: Este skill NO reemplaza los otros skills — los ORQUESTA. Durante la ejecución, invoca las reglas de `architecture-ddd`, `security-audit`, `code-review`, `quality-assurance-qc` y `neumorphism-design` como sub-auditorías especializadas.

---

## ⚙️ ACTIVACIÓN DEL MOTOR

Cuando se active este skill, Antigravity debe:

1. Anunciar: *"🛡️ Motor de Auditoría TIER 0 activado — 15 Fases, análisis completo del sistema."*
2. Ejecutar las **15 Fases** en orden, usando herramientas del sistema (`find_by_name`, `grep_search`, `view_file`, `run_command`, `browser_subagent`).
3. Para cada fase, registrar hallazgos con **severidad + archivo exacto + línea + acción recomendada**.
4. Calcular el **Score Global** con la fórmula matemática cuantitativa de este documento.
5. Al final, consolidar el **Informe Ejecutivo** y el **Plan de Remediación en 3 Sprints**.
6. Notificar al usuario con el informe completo para su aprobación.

**No usar `browser_subagent` durante la auditoría** (solo análisis de código estático y comandos de compilación/test).

---

## 📋 PRE-FLIGHT: LECTURA DE CONTEXTO (Obligatorio — Paso 0)

Antes de cualquier fase, Antigravity DEBE leer **todos estos archivos en PARALELO**:

### Grupo de Lectura Paralelo 0 (OBLIGATORIO):
```
view_file  →  CLAUDE.md                                          (fuente de verdad del sistema)
view_file  →  package.json                                       (dependencias reales)
view_file  →  .agent/skills/quality-assurance-qc/SKILL.md        (pipeline QA 14 bloques)
view_file  →  .agent/skills/architecture-ddd/SKILL.md            (reglas DDD + naming + patterns)
view_file  →  .agent/skills/security-audit/SKILL.md              (OWASP Top 10 + checklist)
view_file  →  .agent/skills/neumorphism-design/SKILL.md          (DNA visual obligatorio)
view_file  →  .agent/skills/code-review/SKILL.md                 (checklist TIER0+ de review)
```

Si algún archivo no existe en el path, registrarlo como hallazgo 🟠 y continuar.

Si existe `.agent/skills/quality-assurance-qc/qc_knowledge.md`, leerlo para incorporar lecciones de auditorías pasadas al análisis (no repetir errores ya conocidos).

Si existe una auditoría previa en el directorio de artefactos, leerla para generar comparativo histórico en el informe final.

---

## 🔍 FASE 1 — ANÁLISIS ESTRUCTURAL (CLAUDE.md vs Realidad del Código)

**Objetivo:** Verificar que lo declarado en CLAUDE.md existe físicamente en el código. Si CLAUDE.md miente, la base es débil.

**Puntos máximos: 100 pts**

### 1A — Stack Tecnológico (30 pts)
Leer `package.json` → comparar con Tech Stack declarado en CLAUDE.md.

**Checklist de dependencias a verificar:**
```
next             ≈ 16.x        react / react-dom   ≈ 19.x
typescript       ≈ 5.8.x       tailwindcss         ≈ 3.4.x
@tanstack/react-query           zustand             ≈ 5.x
react-hook-form  ≈ 7.x         zod                 ≈ 4.x
drizzle-orm      ≈ 0.44.x      better-auth         ≈ 1.4.x
ioredis / redis                 kafkajs             ≈ 2.x
framer-motion    ≈ 12.x        @sentry/nextjs      ≈ 10.x
vitest           ≈ 2.x         playwright          ≈ 1.x
```

**Scoring 1A:**
- Cada dependencia declarada en CLAUDE.md que existe en package.json = +2 pts (15 deps × 2 = 30 max)
- Cada dependencia en CLAUDE.md que NO existe en package.json = 🔴 hallazgo CRÍTICO
- Cada dependencia en package.json que NO está documentada en CLAUDE.md = 🟡 hallazgo (documentar o eliminar)

### 1B — Estructura de Directorios (30 pts)
Verificar existencia de directorios/archivos declarados en CLAUDE.md:

```
src/app/api/                    src/app/dashboard/
src/app/super-admin/            src/app/admin/
src/app/campanas/               src/app/contratos/
src/app/cunas/                  src/app/vencimientos/
src/app/anunciantes/            src/components/ui/
src/components/admin/           src/lib/api/    (jwt.ts, response.ts, client.ts)
src/lib/db/                     src/lib/security/
src/lib/ai/                     src/lib/cortex/
src/lib/trpc/                   src/lib/wil/
src/lib/observability/          src/lib/cache/
src/lib/auth/                   src/modules/
middleware.ts
```

Herramientas: `list_dir` y `find_by_name` en paralelo.

**Scoring 1B:**
- Cada directorio/archivo declarado que existe = +1.5 pts (20 items × 1.5 = 30 max)
- Marcar: ✅ existe | ❌ FALTANTE (🔴) | ⚠️ existe pero vacío (🟠)

### 1C — Módulos DDD Declarados (20 pts)
CLAUDE.md declara 12 módulos DDD en `/src/modules/`. Auditar:

| Módulo | Declarado en CLAUDE.md | ¿Existe? | ¿Capas DDD completas? |
|--------|------------------------|----------|----------------------|
| agencias-creativas | 9 entities, 8 VOs | | |
| contratos | 11 entities, state machine | | |
| campanas | 100+ presentation components | | |
| equipos-ventas | 30+ entities | | |
| vencimientos | 15 entities, 48h countdown | | |
| conciliacion | Financial reconciliation + Kafka | | |
| propiedades | Media asset management | | |
| cortex | AI engine module | | |
| auth | Guards | | |
| campaigns | Legacy NestJS DTOs | | |
| narratives | Presentation layer | | |

Estructura DDD requerida por módulo (del skill `architecture-ddd`):
```
modules/{módulo}/
├── domain/          (entities/, value-objects/, repositories/, events/)
├── application/     (commands/, queries/, handlers/)
├── infrastructure/  (repositories/, external/, config/)
└── presentation/    (controllers/, middleware/, routes/)
```

**Scoring 1C:**
- Módulo existe y tiene las 4 capas = +2 pts
- Módulo existe pero incompleto = +1 pt
- Módulo declarado pero no existe = 0 pts + 🔴 hallazgo
- Max: 10 módulos × 2 = 20 pts

### 1D — Archivos Raíz Superfluos (20 pts)
Revisar archivos en raíz que podrían ser basura o duplicados:

```
Verificar necesidad de:
- tsconfig.campanas.json         →  grep_search para ver si algo lo referencia
- tsconfig.minimal.json          →  grep_search
- tsconfig.server.json           →  grep_search
- vite.config.deploy.ts          →  ¿se usa si el proyecto es Next.js?
- vite.config.optimize.ts        →  ¿duplicado?
- vite.config.tier0.ts           →  ¿duplicado?
- vite.config.ts                 →  ¿o solo se usa next.config.js?
- index.html                     →  ¿en proyecto Next.js? (Next genera su propio)
- biome.json                     →  ¿coexiste con eslint.config.js? (conflicto de linters)
- src/middleware.ts               →  ¿duplicado de middleware.ts en raíz?
- Carpeta PENDIENTES_PRODUCCION  →  ¿código legacy sin limpiar?
- Carpeta PENDIENTE/             →  ¿planificación suelta?
- Carpeta FUNCIONES/             →  ¿documentación fuera de lugar?
- Carpeta MANUALES/              →  ¿documentación fuera de lugar?
- Carpeta -p/                    →  ¿artefacto roto?
```

Para cada archivo dudoso: `grep_search` o `find_by_name` para ver si algo lo referencia. Si nadie lo importa → candidato a 🗑️ eliminar.

**Scoring 1D:**
- 20 pts si no hay archivos basura
- -2 pts por cada archivo superfluo encontrado (min 0)

---

## 🏛️ FASE 2 — ARQUITECTURA DDD (Integrando skill `architecture-ddd`)

**Objetivo:** Verificar que la arquitectura DDD cumple con las reglas del skill `architecture-ddd` + detectar acoplamiento entre módulos.

**Puntos máximos: 100 pts**

### 2A — Pureza del Dominio — Domain Purity (25 pts)
Para CADA módulo en `src/modules/`:
```
grep_search "from.*infrastructure"  en  src/modules/{módulo}/domain/    → INVÁLIDO 🔴
grep_search "from.*application"     en  src/modules/{módulo}/domain/    → INVÁLIDO 🔴
grep_search "from.*components"      en  src/modules/{módulo}/domain/    → INVÁLIDO 🔴
grep_search "from.*lib/db"          en  src/modules/{módulo}/domain/    → INVÁLIDO 🔴
grep_search "from.*app/"            en  src/modules/{módulo}/domain/    → INVÁLIDO 🔴
```

Regla del skill DDD: *"Domain solo puede importar de librerías base (Zod, uuid) y de sí mismo."*

**Scoring:** 25 pts si cero violaciones → -5 pts por cada import prohibido.

### 2B — Cross-Module Imports — Acoplamiento Prohibido (25 pts)
Verificar que NINGÚN módulo importa directamente de otro:
```
grep_search "from.*modules/contratos"     en  src/modules/campanas/
grep_search "from.*modules/campanas"      en  src/modules/contratos/
grep_search "from.*modules/vencimientos"  en  src/modules/campanas/
(... repetir para todas las combinaciones de módulos activos)
```

Regla del skill DDD: *"❌ PROHIBIDO: Imports cruzados entre módulos"*

Si módulos necesitan comunicarse → debe ser vía Shared Kernel, Events, o API pública (Facade Pattern). Nunca import directo.

**Scoring:** 25 pts si cero cross-imports → -5 pts por cada violación.

### 2C — Result Pattern (15 pts)
Verificar que handlers/commands NO usan `throw` para lógica de negocio:
```
grep_search "throw new Error"       en  src/modules/   (solo archivos .ts)
grep_search "throw new.*Exception"  en  src/modules/   (solo archivos .ts)
```

Excepciones válidas: errores de infra genuinos (DB no disponible). NO válido para: validación, reglas de negocio, estado inválido.

**Scoring:** 15 pts si cero throws en application layer → -3 pts por cada throw de negocio.

### 2D — Interfaces de Repositorios (15 pts)
Para cada módulo verificar:
- Existe `I{Nombre}Repository.ts` en `domain/repositories/`
- Existe implementación en `infrastructure/repositories/`
- La implementación implementa (`implements`) la interfaz

```
find_by_name  "I*Repository*"   en  src/modules/   (interfaces)
find_by_name  "*Repository*"    en  src/modules/   excluyendo I-prefijo (implementaciones)
```

**Scoring:** 15 pts → -3 pts por interface sin implementación o implementación sin interface.

### 2E — Naming Conventions (10 pts)
Del skill `architecture-ddd`, verificar naming:

| Tipo | Formato Esperado | Check |
|------|-----------------|-------|
| Entidad | PascalCase.ts | `find_by_name` en entities/ |
| Value Object | PascalCase.ts | `find_by_name` en value-objects/ |
| Interface Repo | I + PascalCase | grep por `^export interface I` |
| Command | PascalCase + Command | `find_by_name` en commands/ |
| Query | PascalCase + Query | `find_by_name` en queries/ |
| Handler | PascalCase + Handler | `find_by_name` en handlers/ |

**Scoring:** 10 pts si naming es consistente → -1 pt por violación de naming.

### 2F — Archivos Huérfanos en Módulos (10 pts)
Para cada archivo `.ts` en `application/commands/` y `application/handlers/`:
```
grep_search "{NombreExport}" en src/ --include="*.ts" --include="*.tsx"
```
Si solo aparece en su propia definición → archivo huérfano 🟠.

**Scoring:** 10 pts → -2 pts por archivo huérfano.

---

## 🖥️ FASE 3 — FRONTEND: Diseño Neumorphism + UX (Integrando skill `neumorphism-design`)

**Objetivo:** Verificar que TODA la UI respeta el DNA visual del skill `neumorphism-design` y que la UX es funcionalmente completa.

**Puntos máximos: 100 pts**

### 3A — Violaciones de Identidad Visual Neumorphism (25 pts)
Búsquedas PARALELAS en `src/app/` y `src/components/`:
```
grep_search "bg-slate-950"   en src/app/  (Includes: *.tsx)   → 🔴 fondo oscuro prohibido
grep_search "bg-slate-900"   en src/app/  (Includes: *.tsx)   → 🔴
grep_search "bg-black"       en src/app/  (Includes: *.tsx)   → 🔴
grep_search "bg-gray-900"    en src/app/  (Includes: *.tsx)   → 🔴
grep_search "bg-zinc-900"    en src/app/  (Includes: *.tsx)   → 🔴
grep_search "rounded-none"   en src/app/  (Includes: *.tsx)   → 🔴 esquinas cuadradas prohibidas
grep_search "rounded-sm"     en src/app/  (Includes: *.tsx)   → 🟠
```

Regla del skill Neumorphism: *"Queda terminantemente prohibido el uso de fondos negros, blancos puros o transparencias de cristal en contenedores base."*

**Scoring:** 25 pts → -1 pt por cada archivo con violación (min 0).

### 3B — Modales Sin Drag — Violación Paradigma OS (15 pts)
```
grep_search "Dialog"       en src/app/ (Includes: *.tsx)
grep_search "AlertDialog"  en src/app/ (Includes: *.tsx)
grep_search "Modal"        en src/app/ (Includes: *.tsx)
```

Para cada modal encontrado: verificar si implementa `onMouseDown`/`onMouseMove` drag o Framer Motion `drag`.

Regla del skill Neumorphism: *"Los Modales tradicionales que bloquean la pantalla con un fondo negro transparente ESTÁN PROHIBIDOS."*

**Scoring:** 15 pts → -3 pts por modal sin drag.

### 3C — Botones y Handlers Vacíos (15 pts)
```
grep_search "onClick={() => {}}"    en src/app/ (Includes: *.tsx)
grep_search "onClick={()=>{}}"      en src/app/ (Includes: *.tsx)
grep_search "onClick.*console.log"  en src/app/ (Includes: *.tsx)
```

**Scoring:** 15 pts → -2 pts por handler vacío.

### 3D — Componentes Huérfanos y Archivos No Importados (15 pts)
Para cada módulo, obtener lista de archivos `.tsx` en `_components/`:
```
find_by_name "*.tsx" en src/app/{módulo}/_components/
```
Para cada archivo encontrado:
```
grep_search "{NombreComponente}" en src/app/{módulo}/ (Includes: *.tsx)
```
Si solo aparece en su propia definición → huérfano → candidato a 🗑️ eliminar.

**Scoring:** 15 pts → -1 pt por componente huérfano.

### 3E — Paridad Desktop/Mobile (15 pts)
Verificar existencia de `/movil/` para cada módulo:
```
app/campanas/       →  app/campanas/movil/
app/contratos/      →  app/contratos/movil/
app/vencimientos/   →  app/vencimientos/movil/
app/cunas/          →  app/cunas/movil/
app/anunciantes/    →  app/anunciantes/movil/
app/super-admin/    →  app/super-admin/movil/
app/dashboard/      →  app/dashboard/movil/
```

**Scoring:** 15 pts → -2 pts por módulo sin vista mobile.

### 3F — Console.logs en Producción (15 pts)
```
grep_search "console.log"    en src/app/ (Includes: *.tsx,*.ts)
grep_search "console.warn"   en src/app/ (Includes: *.tsx,*.ts)
grep_search "console.debug"  en src/components/ (Includes: *.tsx,*.ts)
```

**Scoring:** 15 pts si ≤ 5 console.logs | 10 pts si 6-15 | 5 pts si 16-30 | 0 pts si > 30

---

## 🔒 FASE 4 — SEGURIDAD (Integrando skill `security-audit` + OWASP Top 10)

**Objetivo:** Verificar las 8 capas de seguridad AI de CLAUDE.md + OWASP Top 10 completo del skill `security-audit`.

**Puntos máximos: 100 pts**

### 4A — Capas de Seguridad AI (L1–L8) (30 pts)
Verificar existencia y contenido de cada capa:

| Capa | Archivo Esperado | Función/Export a Verificar | Pts |
|------|-----------------|---------------------------|-----|
| L1 | `src/lib/ai/system-prompt.ts` | `buildSystemPrompt`, `wrapUserInput` | 4 |
| L2 | `src/lib/ai/input-filter.ts` | `filterInput`, `INJECTION_PATTERNS` | 4 |
| L3 | Schemas Drizzle con RLS | `withTenantContext` en `src/lib/db/tenant-context.ts` | 4 |
| L4 | `src/lib/security/rate-limiter.ts` | Rate limit config | 4 |
| L5 | `src/lib/ai/judge.ts` | `JudgeVerdict`, verdict logic | 4 |
| L6 | `src/lib/ai/output-validator.ts` | `DANGEROUS_OUTPUT`, `SENSITIVE_DATA` | 4 |
| L7 | `src/lib/ai/anomaly-detector.ts` | Conversation pattern analysis | 3 |
| L8 | `src/lib/cortex/action-proxy.ts` | `AgentAction`, proxy validation | 3 |

Verificar con `find_by_name` para existencia + `grep_search` para verificar que exportan las funciones declaradas.

### 4B — OWASP Top 10 Checklist (del skill `security-audit`) (25 pts)

**A01 Broken Access Control:**
```
grep_search "getUserContext"  en  src/app/api/  (Includes: *.ts)   → debe estar en CADA route
```
Verificar que API routes con mutaciones (POST/PUT/DELETE) validan rol.

**A03 Injection:**
```
grep_search "dangerouslySetInnerHTML"  en src/ (Includes: *.tsx)   → 🔴 XSS
grep_search "innerHTML"                en src/ (Includes: *.ts,*.tsx)
grep_search "eval("                    en src/ (Includes: *.ts,*.tsx)   → 🔴 Code injection
grep_search "new Function("           en src/ (Includes: *.ts,*.tsx)   → 🔴
```

**A05 Security Misconfiguration:**
- Leer `middleware.ts`: verificar JWT verify, rate limiting, security headers, CSRF check
- Verificar: HSTS, X-Frame-Options: DENY, CSP, X-Content-Type-Options

### 4C — Secrets Hardcodeados (20 pts)
```
grep_search "apiKey"    en src/ (Includes: *.ts,*.tsx)   → verificar que no sea valor literal
grep_search "Bearer "   en src/ (Includes: *.ts,*.tsx)   → verificar que sea variable
grep_search "sk-"       en src/ (Includes: *.ts,*.tsx)   → API Stripe/OpenAI key
grep_search "pk_live_"  en src/ (Includes: *.ts,*.tsx)
grep_search "password"  en src/ (Includes: *.ts,*.tsx)   → verificar contexto
```

EXCLUIR: archivos de regex de detección (`input-filter.ts`), tipos/interfaces, y `.test.` files.

**Scoring:** 20 pts si cero secrets hardcodeados → 0 pts si se encuentra alguno.

### 4D — Variables de Entorno y .env en Git (15 pts)
```
run_command: git ls-files .env .env.local .env.production
```
Si algún .env está trackeado por git → 🔴 CRÍTICO.

Comparar `.env.example` vs `.env.local` → verificar que `.env.example` solo tiene placeholders.

### 4E — Dependencias Vulnerables y Desactualizadas (10 pts)
```
run_command: npm audit --audit-level=high
run_command: npm outdated
```

**Scoring:**
- 0 vulnerabilidades high/critical = 5 pts
- ≤ 5 deps desactualizadas = 5 pts
- 6-15 desactualizadas = 3 pts
- > 15 desactualizadas = 0 pts

### 4F — Seguridad IA/LLM (OWASP Top 10 for LLM 2025) (Bonus: +15 pts)

Si el sistema usa IA (Cortex, OpenAI, etc.), verificar contra OWASP Top 10 LLM:

```
# LLM01 Prompt Injection — ¿El input del usuario se inyecta directamente en prompts?
grep_search "buildSystemPrompt"    en src/lib/ai/ (Includes: *.ts)
grep_search "systemPrompt"         en src/lib/ai/ (Includes: *.ts)
grep_search "userMessage"          en src/lib/ai/ (Includes: *.ts)
# Verificar que userMessage NUNCA se concatena directamente con systemPrompt
# Correcto: separar system message del user message en la API call
# Incorrecto: `prompt = systemPrompt + userInput` → 🔴 Prompt Injection

# LLM02 Sensitive Information Disclosure — ¿El prompt del sistema se puede filtrar?
grep_search "SYSTEM_PROMPT"        en src/ (Includes: *.ts)   → ¿expuesto en client-side?
grep_search "system.*prompt"       en src/app/ (Includes: *.tsx)   → 🔴 si está en frontend

# LLM06 Excessive Agency — ¿La IA puede ejecutar acciones sin aprobación humana?
grep_search "AgentAction"          en src/lib/cortex/ (Includes: *.ts)
grep_search "executeAction"        en src/lib/cortex/ (Includes: *.ts)
# Verificar human-in-the-loop para acciones críticas (delete, create, modify db)

# LLM05 Improper Output Handling — ¿Se renderiza output de IA sin sanitizar?
grep_search "dangerouslySetInnerHTML"  en src/ (Includes: *.tsx)
# Si el output de IA se renderiza como HTML → 🔴 XSS vía LLM
```

**Scoring:** +15 pts bonus si tiene defensas anti-prompt-injection → -5 pts por cada vulnerabilidad LLM.

### 4G — Supply Chain Security & Prototype Pollution (Bonus: +10 pts)

Ataques de cadena de suministro y contaminación de prototipos JavaScript:

```
# Dependency Confusion — ¿Hay paquetes privados que podrían ser suplantados?
grep_search "@silexar/"          en package.json   → ¿scoped packages? (buena práctica)
grep_search "private.*true"      en package.json   → ¿marcado como privado?

# Lock file integrity — ¿package-lock.json está en git?
run_command: git ls-files package-lock.json
# Si NO está en git → 🔴 builds no son deterministas

# Prototype Pollution — merges dinámicos con input del usuario
grep_search "Object.assign("     en src/ (Includes: *.ts,*.tsx)   → ¿con user input? 🔴
grep_search "...req.body"        en src/ (Includes: *.ts)         → spread de user input 🟠
grep_search "__proto__"          en src/ (Includes: *.ts,*.tsx)   → 🔴 si se accede
grep_search "constructor.prototype" en src/ (Includes: *.ts)     → 🔴

# Timing attacks — comparaciones de secretos
grep_search "===.*token"         en src/lib/ (Includes: *.ts)    → debe usar crypto.timingSafeEqual
grep_search "===.*secret"        en src/lib/ (Includes: *.ts)
```

**Scoring:** +10 pts si lock file en git + 0 prototype pollution → -5 pts por vulnerabilidad de supply chain.

---

## ⚡ FASE 5 — CÓDIGO TypeScript + ESLint + DEUDA TÉCNICA

**Objetivo:** Estado de compilación, type safety y deuda técnica cuantificada.

**Puntos máximos: 100 pts**

### 5A — Compilación TypeScript (35 pts)
```
run_command: npx tsc --noEmit 2>&1
```

- Contar número TOTAL de errores.
- Agrupar por tipo (TS2305, TS2339, TS2345, TS2322, etc.).
- Identificar los 10 archivos con más errores.

**Scoring 5A:**
| Errores TS | Puntos |
|-----------|--------|
| 0 errores | 35 pts 🏆 |
| 1–10 | 28 pts |
| 11–30 | 20 pts |
| 31–50 | 12 pts |
| 51–100 | 5 pts |
| > 100 | 0 pts 🔴 |

### 5B — ESLint (20 pts)
```
run_command: npx eslint src/ --ext .ts,.tsx --format=json 2>&1
```

**Scoring 5B:**
| Errores ESLint | Puntos |
|---------------|--------|
| 0 errors, 0 warnings | 20 pts 🏆 |
| 0 errors, ≤ 10 warnings | 15 pts |
| 1–5 errors | 10 pts |
| 6–20 errors | 5 pts |
| > 20 errors | 0 pts 🔴 |

### 5C — Anti-Patrones TypeScript (20 pts)
Búsquedas paralelas:
```
grep_search ": any"          en src/ (Includes: *.ts,*.tsx)   → contar
grep_search "as any"         en src/ (Includes: *.ts,*.tsx)   → contar
grep_search "@ts-ignore"     en src/ (Includes: *.ts,*.tsx)   → contar
grep_search "@ts-nocheck"    en src/ (Includes: *.ts,*.tsx)   → contar 🔴
grep_search "eslint-disable" en src/ (Includes: *.ts,*.tsx)   → verificar justificación
```

**Scoring 5C:**
- 0 `any` + 0 `@ts-ignore` = 20 pts 🏆
- ≤ 5 `any` = 15 pts
- 6–15 `any` = 10 pts
- > 15 `any` o cualquier `@ts-nocheck` = 5 pts
- > 30 `any` = 0 pts

### 5D — Código Duplicado (15 pts)
Buscar funciones que deberían estar centralizadas:
```
grep_search "Intl.NumberFormat"         en src/app/ (Includes: *.tsx)     → si > 3 archivos: duplicado
grep_search "toLocaleString"            en src/app/ (Includes: *.tsx)     → contar archivos
grep_search "formatDate"                en src/app/ (Includes: *.tsx)     → ¿existe helper central?
grep_search "fetch('/api"               en src/app/ (Includes: *.tsx,*.ts) → debe usar cliente centralizado
grep_search "fetch(\"/api"              en src/app/ (Includes: *.tsx,*.ts) → debe usar cliente centralizado
```

**Scoring:** 15 pts si helpers están centralizados → -3 pts por cada patrón duplicado.

### 5E — Archivos y Configs Conflictivos (10 pts)
- ¿`biome.json` y `eslint.config.js` coexisten? → conflicto 🟠
- ¿Múltiples `vite.config.*.ts` en proyecto Next.js? → sobra 🟠
- ¿`src/middleware.ts` duplica funcionalidad de `middleware.ts` en raíz? → verificar
- `TODO/FIXME/HACK` sin referencia a ticket:
```
grep_search "TODO"    en src/ (Includes: *.ts,*.tsx)
grep_search "FIXME"   en src/ (Includes: *.ts,*.tsx)
grep_search "HACK"    en src/ (Includes: *.ts,*.tsx)
```

**Scoring:** 10 pts → -2 pts por conflicto de config, -1 pt por TODO sin ticket.

---

## 📐 FASE 6 — CONEXIONES Y ROUTING

**Objetivo:** Mapa de conexiones rotas, imports huérfanos y rutas sin implementación real.

**Puntos máximos: 100 pts**

### 6A — API Routes vs Módulos DDD (30 pts)
Para cada API route en `src/app/api/`:
- ¿Importa del módulo DDD correcto o tiene lógica inline?
- ¿Llama a un Command/Query del módulo DDD?
- Registrar routes con lógica de negocio inline (violación de arquitectura).

```
list_dir src/app/api/
```
Para cada subdirectorio, leer el `route.ts` y verificar que importa de `@/modules/`.

**Scoring:** 30 pts → -3 pts por API route con lógica inline sin Command/Query.

### 6B — tRPC Routers (15 pts)
```
find_by_name "*.ts" en src/lib/trpc/routers/
grep_search "appRouter"  en src/lib/trpc/ (Includes: *.ts)
```
Verificar que todos los routers están registrados.

### 6C — Providers en Layout Root (15 pts)
Leer `src/app/layout.tsx` → verificar que incluye:
- `AuthProvider` o `SecurityInitializer`
- `QueryProvider` (React Query)
- `TRPCProvider` (si aplica)
- `ThemeProvider`

```
view_file src/app/layout.tsx
```

**Scoring:** +4 pts por cada provider presente (max 15).

### 6D — Schemas de Base de Datos (20 pts)
```
find_by_name "*-schema.ts"  en src/lib/db/
grep_search "from.*schema"  en src/lib/db/index.ts
```
Verificar que módulos DDD activos tienen su schema registrado en `src/lib/db/`.

### 6E — Variables de Entorno No Usadas (20 pts)
```
grep_search "process.env."  en src/  (Includes: *.ts,*.tsx)
```
Cruzar contra variables definidas en `.env.local` y `.env.example`. Variables definidas pero no usadas → candidatas a eliminar.

---

## 🧪 FASE 7 — TESTING & COBERTURA *(NUEVA)*

**Objetivo:** Verificar que el sistema tiene tests, que corren, y qué porcentaje del código está cubierto.

**Puntos máximos: 100 pts**

### 7A — Tests Existen (30 pts)
```
find_by_name "*.test.ts"   en src/
find_by_name "*.test.tsx"  en src/
find_by_name "*.spec.ts"   en src/
find_by_name "__tests__"   en src/     (Type: directory)
```

**Scoring:**
| Tests encontrados | Puntos |
|------------------|--------|
| > 50 test files | 30 pts 🏆 |
| 20–50 | 20 pts |
| 5–19 | 10 pts |
| 1–4 | 5 pts |
| 0 tests | 0 pts 🔴 |

### 7B — Tests Corren (30 pts)
```
run_command: npx vitest run --reporter=verbose 2>&1
```
O si vitest no está configurado, intentar: `npm test 2>&1`

**Scoring:**
| Resultado | Puntos |
|-----------|--------|
| Todos pasan | 30 pts 🏆 |
| > 80% pasan | 20 pts |
| > 50% pasan | 10 pts |
| < 50% pasan o no corren | 0 pts 🔴 |

### 7C — Cobertura por Módulo DDD (20 pts)
Verificar qué módulos tienen tests y cuáles no:
```
find_by_name "*.test.ts"  en src/modules/agencias-creativas/
find_by_name "*.test.ts"  en src/modules/contratos/
find_by_name "*.test.ts"  en src/modules/campanas/
find_by_name "*.test.ts"  en src/modules/vencimientos/
find_by_name "*.test.ts"  en src/modules/conciliacion/
find_by_name "*.test.ts"  en src/modules/equipos-ventas/
```

**Scoring:** 20 pts si todos los módulos activos tienen tests → -3 pts por módulo sin tests.

### 7D — E2E Tests (20 pts)
```
find_by_name "*.spec.ts"  en e2e/
list_dir e2e/
```
Verificar que existe estructura Playwright con tests de flujos críticos.

**Scoring:** 20 pts si existen E2E → 10 pts si existen pero vacíos → 0 pts si no existen.

---

## 🛑 FASE 8 — ERROR HANDLING & RESILIENCE *(NUEVA)*

**Objetivo:** Verificar que el sistema no se cae silenciosamente. Todo error es capturado, loggeado y mostrado al usuario.

**Puntos máximos: 100 pts**

### 8A — Error Boundaries en React (25 pts)
```
grep_search "ErrorBoundary"    en src/ (Includes: *.tsx)
grep_search "error-boundary"   en src/ (Includes: *.tsx)
grep_search "componentDidCatch" en src/ (Includes: *.tsx)
```

¿Hay al menos un Error Boundary wrapping secciones de la app?

**Scoring:** 25 pts si existe y envuelve las rutas → 10 pts si existe pero no envuelve todo → 0 pts si no existe 🔴.

### 8B — Try/Catch en API Routes (25 pts)
Para CADA API route con `export async function POST/PUT/DELETE/GET`:
```
grep_search "try {"  en  src/app/api/  (Includes: *.ts)
```
Verificar que CADA handler de API envuelve su lógica en try/catch y responde con formato de error consistente (`apiError()`).

**Scoring:** 25 pts → -3 pts por API route sin try/catch.

### 8C — Estados UI: Loading / Empty / Error (25 pts)
```
grep_search ".map("   en src/app/ (Includes: *.tsx)
```
Para CADA `.map()` encontrado, verificar que antes existe:
- Check de array vacío: `items.length === 0 && <EmptyState />`
- Check de loading: `isLoading && <Skeleton />`
- Check de error: `isError && <ErrorMessage />`

**Scoring:** 25 pts → -2 pts por lista sin estado vacío/loading.

### 8D — React Query Error Handlers (25 pts)
```
grep_search "useQuery"    en src/ (Includes: *.tsx,*.ts)
grep_search "useMutation" en src/ (Includes: *.tsx,*.ts)
```
Verificar que las queries/mutations manejan `onError` o que existe un `QueryClient` con `defaultOptions.queries.onError` global.

**Scoring:** 25 pts si hay manejo global o por query → -3 pts por query/mutation sin error handling.

---

## ⚡ FASE 9 — PERFORMANCE & OPTIMIZATION *(NUEVA)*

**Objetivo:** Identificar anti-patrones de rendimiento React que degradan la UX.

**Puntos máximos: 100 pts**

### 9A — React.memo en Componentes Pesados (25 pts)
```
grep_search "React.memo"  en src/ (Includes: *.tsx)
grep_search "memo("        en src/ (Includes: *.tsx)
```
Verificar que componentes que renderizan listas largas o reciben props estables usan `memo`.

**Scoring:** 25 pts si los componentes de lista usan memo → -5 pts por componente pesado sin memo.

### 9B — useMemo y useCallback (25 pts)
```
grep_search "useMemo"      en src/ (Includes: *.tsx)
grep_search "useCallback"  en src/ (Includes: *.tsx)
```
Verificar que cálculos costosos y callbacks pasados a hijos usan memoization.

Buscar anti-patrón: objetos/arrays creados inline en JSX que causan re-renders innecesarios:
```
grep_search "style={{"     en src/app/ (Includes: *.tsx)    → inline style object (re-render)
grep_search "className={`"  en src/app/ (Includes: *.tsx)    → template literal recalculado
```

### 9C — Lazy Loading de Rutas (20 pts)
```
grep_search "React.lazy"     en src/ (Includes: *.tsx)
grep_search "dynamic("       en src/ (Includes: *.tsx)     → Next.js dynamic import
grep_search "next/dynamic"   en src/ (Includes: *.tsx)
```
¿Se usa lazy loading para componentes pesados que no se necesitan en el render inicial?

**Scoring:** 20 pts si hay lazy loading implementado → 5 pts si no hay.

### 9D — Debounce en Búsquedas (15 pts)
```
grep_search "debounce"          en src/ (Includes: *.tsx,*.ts)
grep_search "useDeferredValue"  en src/ (Includes: *.tsx)
grep_search "setTimeout"        en src/ (Includes: *.tsx)   → verificar si es debounce manual
```
Inputs de búsqueda/filtro SIN debounce disparan re-renders en cada keystroke.

### 9E — Listas Largas sin Virtualización (15 pts)
```
grep_search "react-virtual"     en package.json
grep_search "@tanstack/virtual" en package.json
```
Si hay listas con > 50 items renderizados simultáneamente sin virtualización → 🟠.

---

## ♿ FASE 10 — ACCESIBILIDAD WCAG 2.1 AA *(NUEVA)*

**Objetivo:** Verificar que el sistema es usable para personas con discapacidad.

**Puntos máximos: 100 pts**

### 10A — Divs Clickeables sin Semántica (30 pts)
```
grep_search "<div.*onClick"  en src/app/ (Includes: *.tsx)
```
Cada `<div onClick>` DEBE ser reemplazado por `<button>` o tener `role="button" tabIndex={0} onKeyDown`.

**Scoring:** 30 pts → -3 pts por div clickeable sin role.

### 10B — Inputs sin Label (25 pts)
```
grep_search "<input"     en src/app/ (Includes: *.tsx)
grep_search "<select"    en src/app/ (Includes: *.tsx)
grep_search "<textarea"  en src/app/ (Includes: *.tsx)
```
Para cada input: verificar presencia de `aria-label`, `aria-labelledby`, o `<label htmlFor>`.

**Scoring:** 25 pts → -2 pts por input sin label.

### 10C — Imágenes sin Alt (20 pts)
```
grep_search "<img"    en src/ (Includes: *.tsx)
grep_search "<Image"  en src/ (Includes: *.tsx)   → Next/Image
```
Verificar presencia de `alt=`. Imágenes decorativas deben tener `alt=""`.

### 10D — Focus Management (15 pts)
```
grep_search "focus:ring"    en src/ (Includes: *.tsx)
grep_search "focus:outline" en src/ (Includes: *.tsx)
grep_search "tabIndex"      en src/ (Includes: *.tsx)
```
¿Los elementos interactivos tienen estilos de focus visibles?

### 10E — Semantic HTML (10 pts)
```
grep_search "<nav"      en src/ (Includes: *.tsx)
grep_search "<main"     en src/ (Includes: *.tsx)
grep_search "<article"  en src/ (Includes: *.tsx)
grep_search "<section"  en src/ (Includes: *.tsx)
grep_search "<aside"    en src/ (Includes: *.tsx)
```
¿Se usan elementos HTML semánticos en lugar de divs para todo?

---

## 🔬 FASE 11 — CALIDAD PROFUNDA DEL CÓDIGO (Code Craftsmanship)

**Objetivo:** Verificar que el código no solo funciona, sino que está escrito con técnica profesional — legible, modular, reutilizable, con complejidad controlada y manejo de errores robusto. Esta fase diferencia código "que pasa los tests" de código "que un equipo Fortune 10 firmaría con su nombre".

**Puntos máximos: 100 pts**

### 11A — Complejidad Ciclomática y Funciones Largas (20 pts)

Detectar funciones/componentes con complejidad excesiva:

```
# Componentes React con más de 300 líneas → candidatos a split
find_by_name "*.tsx"  en src/app/  → para cada archivo, contar líneas con view_file

# Nesting profundo (>3 niveles de if/for/while anidados)
grep_search "            if ("    en src/ (Includes: *.ts,*.tsx)   → 5+ niveles 🔴
grep_search "        if ("        en src/ (Includes: *.ts,*.tsx)   → 4+ niveles 🟠

# Switch con >7 cases (candidato a Strategy Pattern o Map)
grep_search "switch ("            en src/modules/ (Includes: *.ts)
```

Para cada archivo en `src/modules/` y componentes principales en `src/app/`:
- Contar líneas del archivo con `view_file`.
- Si función > 50 líneas → 🟠 "función larga, candidata a extract method".
- Si componente > 300 líneas → 🟠 "componente monolítico, dividir en sub-componentes".
- Si nesting > 3 niveles → 🟡 "considerar early return o extract method".

**Scoring:**
| Hallazgo | Puntos |
|----------|--------|
| 0 funciones largas + 0 componentes monolíticos | 20 pts 🏆 |
| ≤ 5 hallazgos | 15 pts |
| 6–15 hallazgos | 10 pts |
| > 15 hallazgos | 5 pts |
| > 30 hallazgos | 0 pts 🔴 |

### 11B — Legibilidad y Clean Code (20 pts)

Verificar que el código se lee como prosa técnica:

```
# Magic numbers (números sin constante nombrada)
grep_search "=== [0-9]"        en src/modules/ (Includes: *.ts) (IsRegex: true)
grep_search "> [0-9][0-9]"     en src/modules/ (Includes: *.ts) (IsRegex: true)

# Magic strings usados en >3 archivos (deben ser enum/constante)
grep_search "'activo'"          en src/app/ (Includes: *.tsx)
grep_search "'pendiente'"       en src/app/ (Includes: *.tsx)
grep_search "'aprobado'"        en src/app/ (Includes: *.tsx)

# Variables de 1-2 letras (excepto i,j,k en loops, e en catches)
grep_search "const [a-z] ="     en src/ (Includes: *.ts,*.tsx) (IsRegex: true)

# Funciones con >4 parámetros (usar objeto de configuración)
grep_search "function.*,.*,.*,.*,"  en src/modules/ (Includes: *.ts) (IsRegex: true)
```

**Principios a verificar al leer código (sampling de 5 archivos por módulo):**
- ¿Las funciones hacen UNA sola cosa? (Single Responsibility)
- ¿Los nombres son verbos descriptivos? (`calcularDescuento`, NO `calc` o `doStuff`)
- ¿Se usa early return para evitar else profundos?
- ¿Los ternarios son simples o deberían ser if/else?

**Scoring:** 20 pts → -2 pts por cada patrón de ilegibilidad (min 0).

### 11C — Modularidad y Reutilización DRY (20 pts)

```
# Funciones de utilidad duplicadas en múltiples archivos
grep_search "formatDate"       en src/app/ (Includes: *.tsx)   → si >2 archivos: centralizar
grep_search "formatCurrency"   en src/app/ (Includes: *.tsx)
grep_search "formatNumber"     en src/app/ (Includes: *.tsx)
grep_search "truncate"         en src/app/ (Includes: *.tsx)

# Componentes UI repetidos entre módulos (deben estar en /components/ui/)
grep_search "StatusBadge"      en src/app/ (Includes: *.tsx)
grep_search "EmptyState"       en src/app/ (Includes: *.tsx)
grep_search "LoadingSkeleton"  en src/app/ (Includes: *.tsx)
grep_search "SearchInput"      en src/app/ (Includes: *.tsx)

# Hooks custom duplicados
grep_search "useDebounce"      en src/ (Includes: *.ts,*.tsx)
grep_search "useLocalStorage"  en src/ (Includes: *.ts,*.tsx)

# ¿Existe directorio central de helpers y hooks compartidos?
list_dir src/lib/helpers/
list_dir src/lib/utils/
list_dir src/hooks/
```

**Scoring:** 20 pts → -3 pts por patrón duplicado → -5 pts si no existe directorio central de helpers.

### 11D — Calidad de Comentarios (Sin Sobre-Documentar) (15 pts)

El código debe auto-documentarse. Comentarios solo explican el **POR QUÉ**, nunca el **QUÉ**:

```
# Funciones exportadas en domain/application SIN JSDoc
grep_search "export function"   en src/modules/ (Includes: *.ts)
grep_search "export class"      en src/modules/ (Includes: *.ts)
# Verificar que exports principales tienen /** */ JSDoc

# Código comentado (dead code) → debe eliminarse, git lo preserva
grep_search "// function"       en src/ (Includes: *.ts,*.tsx)
grep_search "// const"          en src/ (Includes: *.ts,*.tsx)
grep_search "// import"         en src/ (Includes: *.ts,*.tsx)

# Comentarios útiles (buena práctica ✅)
grep_search "// NOTE:"          en src/ (Includes: *.ts,*.tsx)
grep_search "// SECURITY:"      en src/ (Includes: *.ts,*.tsx)
grep_search "// WHY:"           en src/ (Includes: *.ts,*.tsx)
```

**Criterios:**
- ✅ JSDoc en funciones públicas de domain + application layer
- ✅ Comentarios `// WHY:` o `// NOTE:` para decisiones no obvias
- ❌ Comentarios que repiten lo que el código dice (`// suma dos números`)
- ❌ Código comentado (dead code)
- ❌ `// TODO` sin ticket de referencia

**Scoring:** 15 pts → -2 pts por función pública sin JSDoc → -1 pt por dead code comentado.

### 11E — Manejo de Errores en Profundidad (15 pts)

Más allá de try/catch (Fase 8), verificar la CALIDAD del error handling:

```
# Catch blocks vacíos o con solo console.log
grep_search "catch"              en src/ (Includes: *.ts,*.tsx)
# Para cada catch verificar que NO es:
#   catch (e) {}                    → 🔴 silencia errores
#   catch (e) { console.log(e) }   → 🟠 log sin acción recuperativa

# Promesas sin .catch ni await en try/catch
grep_search "\.then("            en src/ (Includes: *.ts,*.tsx)   → verificar .catch
grep_search "Promise.all"        en src/ (Includes: *.ts,*.tsx)   → manejo de fallos parciales

# ¿Existe sistema de error types?
find_by_name "*Error*"  en src/lib/   (Type: file)
find_by_name "*error*"  en src/lib/   (Type: file)
```

**Criterios:**
- ✅ Error types específicos (`ValidationError`, `NotFoundError`, `AuthorizationError`)
- ✅ Mensajes con contexto (`"Contrato ${id} no encontrado"`)
- ❌ `catch {}` vacío → 🔴
- ❌ Mensajes genéricos (`"Error"`, `"Something went wrong"`) → 🟠

**Scoring:** 15 pts → -3 pts por catch vacío → -2 pts por error genérico → -1 pt por promesa sin catch.

### 11F — Type Safety Avanzado (10 pts)

```
# Non-null assertions (peligroso, puede causar runtime crashes)
grep_search "!."                en src/ (Includes: *.ts,*.tsx)   → contar
grep_search "!,"                en src/ (Includes: *.ts,*.tsx)

# Type assertions excesivas
grep_search "as "               en src/ (Includes: *.ts,*.tsx)   → verificar necesidad

# Buenas prácticas ✅
grep_search "??"                en src/ (Includes: *.ts,*.tsx)   → nullish coalescing
grep_search "satisfies"         en src/ (Includes: *.ts,*.tsx)   → type-safe checking
```

**Scoring:** 10 pts → -2 pts por `!.` sin justificación → -1 pt por type assertion innecesaria.

### 11G — Memory Leaks y Cleanup (Bonus: +10 pts)

Fugas de memoria que degradan el rendimiento progresivamente y pueden crashear el browser del usuario:

```
# useEffect sin cleanup (suscripciones, intervals, event listeners que nunca se limpian)
grep_search "setInterval"       en src/ (Includes: *.tsx,*.ts)   → DEBE tener clearInterval en cleanup
grep_search "setTimeout"        en src/ (Includes: *.tsx,*.ts)   → verificar clearTimeout
grep_search "addEventListener"  en src/ (Includes: *.tsx,*.ts)   → DEBE tener removeEventListener
grep_search "subscribe"         en src/ (Includes: *.tsx,*.ts)   → DEBE tener unsubscribe en cleanup
grep_search "new WebSocket"     en src/ (Includes: *.ts)         → DEBE tener .close() en cleanup
grep_search "new AbortController" en src/ (Includes: *.ts,*.tsx) → buena práctica ✅ (cancelar fetch)
```

Para cada `setInterval` / `addEventListener` / `subscribe` encontrado:
- Verificar que el `useEffect` que lo contiene tiene un return con cleanup.
- Si NO tiene cleanup → 🔴 **Memory leak confirmado**.

```
# Verificar patrón correcto:
# useEffect(() => {
#   const interval = setInterval(...);
#   return () => clearInterval(interval);   ← DEBE existir
# }, []);
```

**Scoring:** +10 pts bonus si 0 leaks → -3 pts por cada leak detectado.

### 11H — Race Conditions y Estado Asíncrono (Bonus: +10 pts)

Bugs sutiles que causan datos incorrectos en pantalla intermitentemente:

```
# Estado que se actualiza después de unmount (memory leak + crash)
grep_search "setState"    en src/app/ (Includes: *.tsx)
# Verificar que operaciones async cancelan si el componente se desmonta

# Fetch sin AbortController (no se cancela si el usuario navega)
grep_search "fetch("      en src/ (Includes: *.tsx,*.ts)
grep_search "axios"       en src/ (Includes: *.tsx,*.ts)
# Si hay fetch en useEffect sin AbortController → 🟠 race condition posible

# Stale closures en useCallback/useEffect sin deps correctas
grep_search "useCallback"  en src/app/ (Includes: *.tsx)
grep_search "useEffect"    en src/app/ (Includes: *.tsx)
# Verificar que las dependency arrays incluyen todas las variables usadas dentro
```

**Anti-patrones a detectar:**
- ❌ `setState` dentro de `.then()` sin verificar si componente sigue montado
- ❌ `fetch` en `useEffect` sin `AbortController` para cancelar
- ❌ `useCallback` con dependency array vacía `[]` pero usa variables de scope externo
- ✅ Uso de `AbortController` en fetch dentro de useEffect
- ✅ Uso de `useRef(true)` para tracking de mount status (legacy)
- ✅ React Query / tRPC (manejan cancelación automáticamente)

**Scoring:** +10 pts bonus si usa React Query/tRPC o AbortController → -3 pts por fetch sin cancelación.

### 11I — React Anti-Patrones Críticos (Bonus: +10 pts)

Errores de React que causan renders infinitos, bugs de estado, y comportamiento impredecible:

```
# Conditional hooks (VIOLACIÓN de reglas de hooks — crash garantizado)
grep_search "if.*useEffect"    en src/app/ (Includes: *.tsx) (IsRegex: true)
grep_search "if.*useState"     en src/app/ (Includes: *.tsx) (IsRegex: true)
grep_search "if.*useCallback"  en src/app/ (Includes: *.tsx) (IsRegex: true)
grep_search "&&.*useEffect"    en src/app/ (Includes: *.tsx) (IsRegex: true)

# State mutation directa (en vez de crear nuevo objeto/array)
grep_search ".push("           en src/app/ (Includes: *.tsx)   → ¿muta estado directamente?
grep_search ".splice("         en src/app/ (Includes: *.tsx)   → ¿muta array de estado?
grep_search "delete "          en src/app/ (Includes: *.tsx)   → ¿muta objeto de estado?
# Correcto: setItems([...items, newItem]) | Incorrecto: items.push(newItem); setItems(items)

# Key prop en listas (causa bugs de reconciliación React)
grep_search ".map("            en src/app/ (Includes: *.tsx)
# Para cada .map(): verificar que el JSX retornado tiene key={uniqueId}, NO key={index}
grep_search "key={i}"          en src/app/ (Includes: *.tsx)   → 🟠 index como key
grep_search "key={index}"      en src/app/ (Includes: *.tsx)   → 🟠 index como key

# Prop drilling excesivo (>3 niveles de props pasadas manualmente)
# Detectar componentes con más de 8 props → candidato a Context o Zustand store
```

**Scoring:** +10 pts si 0 anti-patrones → -5 pts por hook condicional 🔴 → -3 pts por mutación directa → -1 pt por index como key.

### 11J — Validación de Contratos API (Bonus: +10 pts)

Verificar que las respuestas de API se validan ANTES de usarlas (defensa contra datos corruptos o ataques):

```
# ¿Se validan las respuestas de API con Zod o schemas?
grep_search "safeParse"        en src/ (Includes: *.ts,*.tsx)   → buena práctica ✅
grep_search ".parse("          en src/ (Includes: *.ts,*.tsx)   → verificar contexto
grep_search "z.object"         en src/lib/api/ (Includes: *.ts)  → response schemas

# ¿Las API routes validan el body del request?
grep_search "request.json()"   en src/app/api/ (Includes: *.ts)
# Para cada request.json(): verificar que el resultado se valida con Zod ANTES de usar

# ¿Los hooks de data fetching validan la respuesta?
grep_search "useQuery"         en src/ (Includes: *.tsx,*.ts)
# Verificar que las funciones de queryFn validan la respuesta del servidor
```

**Principio:** Nunca confiar en datos que vienen del exterior (API, base de datos, localStorage, URL params). Todo dato externo se valida con schema.

**Scoring:** +10 pts si validación consistente → -3 pts por API route sin validación de body → -2 pts por fetch sin validación de respuesta.

> [!CAUTION]
> **SCORING BONUS F11:** Los sub-checks 11G-11K son bonus (+10 cada uno = +50 posible). La fase mantiene 100 pts base de 11A-11F, pero los bonus pueden sumar hasta 150 pts. Para el cálculo del Score Global, F11 se capea en 100 pts pero los bonus se reportan como "excelencia" en el informe. Si los bonus son negativos, SÍ restan del score base.

### 11K — TypeScript Mastery Avanzado (Bonus: +10 pts)

Patrones de TypeScript que elevan el código de "funcional" a "elite Fortune 10":

```
# Discriminated Unions (hacer estados imposibles imposibles)
grep_search "type.*=.*|"          en src/modules/ (Includes: *.ts) (IsRegex: true)
# Verificar que estados complejos usan discriminated unions:
# type Estado = { kind: 'loading' } | { kind: 'success'; data: T } | { kind: 'error'; error: string }
# En vez de: { isLoading: boolean; isError: boolean; data?: T }  → permite estados inválidos

# Exhaustive checks con never (garantiza que todos los cases se manejan)
grep_search "never"              en src/modules/ (Includes: *.ts)
# Patrón correcto en switch:
# default: { const _exhaustive: never = action; return _exhaustive; }
# Si se agrega un nuevo case y no se maneja → TypeScript da error en compilación

# Barrel files (pueden causar circular imports y bundles inflados)
find_by_name "index.ts"          en src/modules/ (Type: file)
find_by_name "index.tsx"         en src/app/ (Type: file)
# Si un barrel file re-exporta >20 items → 🟠 riesgo de tree-shaking roto
# Atlassian redujo 75% del build time al eliminar barrel files

# Strict TypeScript config
view_file tsconfig.json
# Verificar que tiene:
#   "strict": true
#   "noImplicitAny": true
#   "noUncheckedIndexedAccess": true     → 🏆 previene crashes en array[index]
#   "exactOptionalPropertyTypes": true   → 🏆 distingue undefined de missing

# Const assertions y satisfies (type checking sin perder tipos literales)
grep_search "as const"           en src/modules/ (Includes: *.ts)   → buena práctica ✅
grep_search "satisfies"          en src/modules/ (Includes: *.ts)   → buena práctica ✅

# Zod .brand() para tipos nominales (distinguir IDs de strings normales)
grep_search ".brand"             en src/modules/ (Includes: *.ts)   → buena práctica ✅
```

**Criterios:**
- ✅ Discriminated unions para estados complejos (loading/success/error)
- ✅ Exhaustive `never` checks en switch statements
- ✅ `tsconfig.json` con `strict: true` + `noUncheckedIndexedAccess`
- ✅ `as const` + `satisfies` para type-safe config objects
- 🟠 Barrel files con >20 re-exports (considerar eliminar)
- ❌ `tsconfig` sin strict mode → 🔴

**Scoring:** +10 pts si strict TS + patterns avanzados → -5 pts si `strict: false` → -2 pts por barrel file problemático.

---

## 🚀 FASE 12 — DEVOPS & CI/CD PIPELINE

**Objetivo:** Verificar que el sistema tiene pipeline profesional de integración/entrega continua y gestión de entornos que garantice deployments seguros y reproducibles.

**Puntos máximos: 100 pts**

### 12A — Pipeline de CI/CD (35 pts)

```
find_by_name "*.yml"    en .github/workflows/  (Type: file)
find_by_name "*.yaml"   en .github/workflows/  (Type: file)
list_dir .github/
```

Verificar que existe pipeline con:
- [ ] `npm ci` (instalación determinista)
- [ ] `npx tsc --noEmit` (type checking)
- [ ] `npm run lint` (linting)
- [ ] `npm test` (tests unitarios)
- [ ] Se ejecuta en cada push/PR

**Scoring:**
| Pipeline | Puntos |
|----------|--------|
| CI completo (lint + types + tests + build) | 35 pts 🏆 |
| CI parcial (solo build) | 15 pts |
| No existe pipeline | 0 pts 🔴 |

### 12B — Containerización (25 pts)

```
find_by_name "Dockerfile"        en ./  (MaxDepth: 2)
find_by_name "docker-compose*"   en ./  (MaxDepth: 2)
find_by_name ".dockerignore"     en ./  (MaxDepth: 1)
```

Verificar: Dockerfile con multi-stage build, `.dockerignore` correcto, sin secretos en imagen.

**Scoring:** +8 pts por cada item presente (max 25).

### 12C — Gestión de Entornos (25 pts)

```
find_by_name ".env*"  en ./  (MaxDepth: 1)
view_file .env.example
run_command: git ls-files .env .env.local .env.production
grep_search "NODE_ENV"  en src/ (Includes: *.ts,*.tsx)
```

Verificar:
- [ ] `.env.example` con TODAS las variables con placeholders
- [ ] Separación: `.env.local` (dev), `.env.production` (prod)
- [ ] Variables validadas al arrancar (Zod schema de env vars)
- [ ] Ningún `.env` real en git

**Scoring:** 25 pts → -5 pts si `.env.example` incompleto → -15 pts si `.env` real en git 🔴.

### 12D — Estrategia de Deploy (15 pts)

```
grep_search "deploy"   en package.json
find_by_name "vercel.json"  en ./  (MaxDepth: 1)
```

Verificar: plataforma definida, script de deploy, preview deployments para PRs.

**Scoring:** 15 pts si deployment automatizado con preview → 8 pts si manual → 0 pts si no hay.

---

## 📡 FASE 13 — OBSERVABILIDAD, LOGGING & MONITOREO

**Objetivo:** Verificar que el sistema en producción es observable — errores se detectan automáticamente, performance se mide, y el equipo tiene visibilidad operacional.

**Puntos máximos: 100 pts**

### 13A — Logging Estructurado (30 pts)

```
find_by_name "*logger*"       en src/lib/ (Type: file)
find_by_name "*logging*"      en src/lib/ (Type: file)
grep_search "import.*logger"  en src/ (Includes: *.ts)
grep_search "console.log"     en src/app/api/ (Includes: *.ts)   → debe usar logger
grep_search "logger."         en src/app/api/ (Includes: *.ts)
```

Verificar: logger centralizado con JSON estructurado, niveles (`info`/`warn`/`error`/`debug`), `correlationId`, timestamp.

**Scoring:** 30 pts si logger usado consistentemente → 15 pts si existe pero no se usa → 0 pts si solo `console.log`.

### 13B — APM & Error Tracking (25 pts)

```
grep_search "@sentry"                   en package.json
grep_search "Sentry.init"               en src/ (Includes: *.ts,*.tsx)
grep_search "Sentry.captureException"   en src/ (Includes: *.ts,*.tsx)
find_by_name "sentry*"                  en src/ (Type: file)
```

Verificar: Sentry (o equivalente) instalado, `init()` en entry point, `captureException` en API catches, source maps.

**Scoring:** 25 pts si integrado + alertas → 10 pts si instalado no integrado → 0 pts si no existe.

### 13C — Health Checks (20 pts)

```
find_by_name "*health*"   en src/app/api/ (Type: file)
grep_search "/api/health"  en src/ (Includes: *.ts,*.tsx)
```

Verificar: endpoint `/api/health` con status + uptime + check DB + check cache.

**Scoring:** 20 pts si completo → 10 pts si parcial → 0 pts si no existe.

### 13D — Métricas y Alertas (25 pts)

```
find_by_name "*metrics*"   en src/lib/ (Type: file)
find_by_name "*monitor*"   en src/lib/ (Type: file)
grep_search "performance"  en src/lib/ (Includes: *.ts)
```

Verificar: métricas de request duration, error rate, métricas de negocio.

**Scoring:** 25 pts si métricas completas → 10 pts si solo analytics básico → 0 pts si nada.

---

## 🗄️ FASE 14 — DATA LAYER & BASE DE DATOS

**Objetivo:** Verificar integridad, seguridad y eficiencia de la capa de datos — esquemas, migraciones, queries, y protección de información sensible.

**Puntos máximos: 100 pts**

### 14A — Esquemas y Migraciones (30 pts)

```
find_by_name "*schema*"     en src/lib/db/ (Type: file)
find_by_name "*migration*"  en src/lib/db/ (Type: file)
list_dir src/lib/db/
grep_search "drizzle"       en package.json
grep_search "prisma"        en package.json
```

Verificar:
- [ ] ORM configurado (Drizzle o Prisma) con tipos estrictos
- [ ] Migraciones versionadas (no editar schemas en producción sin migración)
- [ ] Índices en columnas consultadas frecuentemente (IDs, fechas, estados)
- [ ] Relaciones foreign key definidas
- [ ] `notNull()` en campos obligatorios

Para cada schema: `view_file` y verificar presencia de `index()`, `references()`, `notNull()`, `unique()`.

**Scoring:** 30 pts si schemas con índices y FK → 15 pts si schemas sin índices → 0 pts si no hay schemas.

### 14B — Optimización de Queries (25 pts)

```
# N+1 Detection: queries dentro de loops
grep_search "for.*await"        en src/modules/ (Includes: *.ts)
grep_search "map.*await"        en src/modules/ (Includes: *.ts)
grep_search "forEach.*await"    en src/modules/ (Includes: *.ts)

# Queries sin limit (pueden traer millones de rows)
grep_search "findMany()"        en src/ (Includes: *.ts)   → sin parámetros = sin limit
grep_search ".select()"         en src/ (Includes: *.ts)   → verificar .limit()
```

Verificar: no hay queries en loops (N+1), queries de lista tienen `.limit()` o paginación, queries pesados usan cache.

**Scoring:** 25 pts → -5 pts por N+1 detectado → -3 pts por query sin limit.

### 14C — Integridad y Transacciones (25 pts)

```
grep_search "insert("       en src/modules/ (Includes: *.ts)
grep_search "update("       en src/modules/ (Includes: *.ts)
grep_search "delete("       en src/modules/ (Includes: *.ts)
grep_search "transaction"   en src/modules/ (Includes: *.ts)
grep_search "deletedAt"     en src/lib/db/ (Includes: *.ts)
```

Verificar: validación Zod ANTES de escritura, transacciones para ops multi-tabla, soft-delete donde aplique.

**Scoring:** 25 pts → -5 pts por escritura sin validación → -5 pts por op multi-tabla sin transacción.

### 14D — Seguridad de Datos y PII (20 pts)

```
grep_search "email"          en src/lib/db/ (Includes: *.ts)
grep_search "telefono"       en src/lib/db/ (Includes: *.ts)
grep_search "rut"            en src/lib/db/ (Includes: *.ts)
grep_search "password"       en src/lib/db/ (Includes: *.ts)   → DEBE estar hasheado
grep_search "tenantId"       en src/lib/db/ (Includes: *.ts)
grep_search "organizationId" en src/lib/db/ (Includes: *.ts)
```

Verificar: contraseñas NUNCA en texto plano, datos PII identificados, tenant isolation si multi-tenant.

**Scoring:** 20 pts → 0 pts si contraseñas en texto plano 🔴 → -5 pts si PII sin protección.

---

## 🧑‍💻 FASE 15 — AGENTE OPERADOR (Simulación de Usuario Real)

**Objetivo:** Un agente se sienta frente al sistema y lo OPERA como un usuario real haría diariamente — navega cada módulo, presiona cada botón, verifica cada flujo, detecta lo que NO funciona y propone mejoras de UX desde la perspectiva del usuario final.

**Puntos máximos: 100 pts**

> [!IMPORTANT]
> Esta fase usa `browser_subagent` con el servidor de desarrollo corriendo. Si el servidor NO está activo, esta fase se aplaza y se registra como N/A en el scoring (los pesos se redistribuyen entre F1-F14).

### Pre-requisito: Servidor Activo
```
run_command: npm run dev   (verificar que responde en http://localhost:3000)
```

### 15A — Navegación Global y Rutas (15 pts)

Usar `browser_subagent` con viewport **1440×900** (desktop):

1. Navegar a `http://localhost:3000/dashboard` → ¿Carga? ¿Hay contenido?
2. Navegar a cada módulo principal:
   - `/campanas` → ¿Carga sin error? ¿Hay datos/demo?
   - `/contratos` → ¿Carga?
   - `/vencimientos` → ¿Carga?
   - `/cunas` → ¿Carga?
   - `/anunciantes` → ¿Carga?
   - `/super-admin` → ¿Carga?
   - `/conciliacion` → ¿Carga?
3. Navegar a rutas inexistentes (`/ruta-fake`) → ¿Hay página 404 o pantalla blanca?
4. **Capturar screenshot** de cada módulo.

**Registrar:** Rutas que dan error, pantallas blancas, 404 sin diseño, redirects inesperados.

**Scoring:** 15 pts si todas las rutas cargan → -2 pts por ruta rota → -5 pts si no hay 404 page.

### 15B — Operación de Tabs y Navegación Interna (20 pts)

Para CADA módulo principal que cargó en 15A:

1. Click en CADA tab/pestaña visible → ¿Carga contenido o queda en blanco?
2. Click en botones de navegación interna ("Ver detalle", "Abrir", "Expandir") → ¿Navega correctamente?
3. Verificar breadcrumbs o indicadores de ubicación.
4. Verificar botón "Volver" en sub-vistas.
5. **Capturar screenshot** de cada vista/tab.

**Registrar:** Tabs que no cargan contenido, navegación que no responde, vistas sin botón de retorno.

**Scoring:** 20 pts → -3 pts por tab sin contenido → -2 pts por sub-vista sin "Volver".

### 15C — Operación de Botones y Acciones (25 pts)

Para CADA módulo, identificar y ejecutar:

1. **Botones de acción principal** ("Crear", "Guardar", "Activar", "Reservar") → ¿Abre modal/formulario? ¿Hay feedback?
2. **Botones de filtro/búsqueda** → ¿Los filtros funcionan? ¿Cambian los datos mostrados?
3. **Botones de exportar** → ¿Descargan algo o dan feedback?
4. **Botones de eliminar/cancelar** → ¿Piden confirmación?
5. **Iconos con tooltip** → ¿Muestran información al hover?
6. **Modales** → ¿Se abren? ¿Son arrastrables? ¿Se cierran con X y Escape?
7. **Formularios** → ¿Los inputs aceptan texto? ¿Muestran validación al enviar vacío?

**Registrar:** Botones que no hacen nada, acciones sin feedback, modales que no se pueden cerrar, formularios sin validación.

**Scoring:** 25 pts → -2 pts por botón muerto → -3 pts por acción sin feedback → -5 pts por formulario sin validación.

### 15D — Detección de Errores Visuales y de Datos (20 pts)

Mientras se opera el sistema, verificar:

1. **Texto cortado** o con overflow visible.
2. **`[Object object]`** renderizado en pantalla.
3. **`undefined`** o **`null`** visible como texto.
4. **`NaN`** en campos numéricos.
5. **Datos mock incoherentes** (ej: un programa con 8 cupos mostrando 12 ocupados).
6. **Fechas con formato inconsistente** (mezcla de `01/01/2026` y `2026-01-01`).
7. **Montos sin formato** (números sin separadores de miles).
8. **Imágenes rotas** (iconos que no cargan).
9. **Scroll horizontal no deseado** en contenedores.
10. **Z-index conflicts** (elementos tapando otros).

**Capturar screenshot** de cada error visual encontrado.

**Scoring:** 20 pts → -2 pts por cada error visual encontrado (min 0).

### 15E — Operación Mobile (20 pts)

Usar `browser_subagent` con viewport **375×812** (iPhone):

1. Navegar a cada módulo con ruta `/movil` → ¿Carga? ¿Existe versión mobile?
2. **Bottom Navigation Bar** → ¿Existe? ¿Funciona cada item?
3. **Touch targets** → ¿Los botones son suficientemente grandes (≥44px)?
4. **Scroll** → ¿El contenido scrollea correctamente? ¿No hay overflow horizontal?
5. **Texto legible** → ¿No hay texto menor a 10px?
6. **Modales/Sheets** → ¿Se adaptan al viewport mobile? ¿Son swipeables?
7. **Capturar screenshot** de cada vista mobile.

**Registrar:** Módulos sin vista mobile, bottom nav roto, botones demasiado pequeños, overflow.

**Scoring:** 20 pts → -3 pts por módulo sin mobile → -2 pts por UX mobile rota.

---

## 📊 SCORING GLOBAL — FÓRMULA MATEMÁTICA CUANTITATIVA (15 FASES)

Al finalizar las 15 fases, calcular el Score por dimensión y el Score Global ponderado:

### Tabla de Pesos por Fase

| Fase | Dimensión | Peso | Pts Max | Score Real |
|------|-----------|------|---------|------------|
| F1 | Estructura vs CLAUDE.md | 6% | 100 | ? |
| F2 | Arquitectura DDD | 10% | 100 | ? |
| F3 | Frontend Neumorphism + UX | 8% | 100 | ? |
| F4 | Seguridad (8 capas + OWASP) | 10% | 100 | ? |
| F5 | TypeScript/ESLint/Deuda | 8% | 100 | ? |
| F6 | Conexiones/Routing | 5% | 100 | ? |
| F7 | Testing & Cobertura | 7% | 100 | ? |
| F8 | Error Handling & Resilience | 4% | 100 | ? |
| F9 | Performance | 4% | 100 | ? |
| F10 | Accesibilidad WCAG | 3% | 100 | ? |
| F11 | **Calidad Profunda del Código** | **12%** | 100 | ? |
| F12 | DevOps & CI/CD | 5% | 100 | ? |
| F13 | Observabilidad & Logging | 5% | 100 | ? |
| F14 | Data Layer & Base de Datos | 5% | 100 | ? |
| F15 | **Agente Operador (UX Real)** | **8%** | 100 | ? |
| | **TOTAL** | **100%** | | **?/100** |

### Fórmula:
```
SCORE_GLOBAL = (F1 × 0.06) + (F2 × 0.10) + (F3 × 0.08) + (F4 × 0.10)
             + (F5 × 0.08) + (F6 × 0.05) + (F7 × 0.07) + (F8 × 0.04)
             + (F9 × 0.04) + (F10 × 0.03) + (F11 × 0.12) + (F12 × 0.05)
             + (F13 × 0.05) + (F14 × 0.05) + (F15 × 0.08)
```

> [!NOTE]
> **F11 (Calidad del Código)** tiene el peso más alto (12%) porque la técnica de construcción del código es el pilar de un sistema Fortune 10. Combinado con F5 (8%) da un **20% total** dedicado a calidad de código.
> **F15 (Agente Operador)** tiene 8% porque la operatividad real del usuario es la prueba definitiva del sistema.

### Certificaciones:
| Score | Certificación | Significado |
|-------|--------------|-------------|
| 🏆 **95–100** | SUPREME TIER 0 | Sistema certificado Fortune 10 — 0 deuda técnica |
| ✅ **85–94** | CERTIFIED ENTERPRISE | Sistema sólido, correcciones menores pendientes |
| 🟡 **70–84** | NEEDS WORK | Deuda técnica significativa, correcciones obligatorias antes de producción |
| 🟠 **50–69** | AT RISK | Base inestable, requiere sprint de remediación completo |
| 🔴 **< 50** | FAILED | Base no apta para producción enterprise |

---

## 📋 ENTREGABLE FINAL: INFORME EJECUTIVO

Al finalizar TODAS las 15 fases, generar el informe como artefacto en el directorio de artefactos del cerebro:

```markdown
# 📊 INFORME AUDITORÍA TIER 0 — Silexar Pulse
**Fecha:** [YYYY-MM-DD]
**Auditor:** Antigravity (Motor TIER 0 Fortune 10)
**Versión del Skill:** v3.0 (15 Fases — Fortune 10 Completo)

---

## 🎯 SCORE GLOBAL: [X]/100 — [CERTIFICACIÓN EMOJI + NOMBRE]

| Fase | Dimensión | Score | Estado |
|------|-----------|-------|--------|
| F1 | Estructura vs CLAUDE.md | X/100 | ✅/🟡/🔴 |
| F2 | Arquitectura DDD | X/100 | |
| F3 | Frontend Neumorphism | X/100 | |
| F4 | Seguridad | X/100 | |
| F5 | TypeScript/ESLint | X/100 | |
| F6 | Conexiones/Routing | X/100 | |
| F7 | Testing | X/100 | |
| F8 | Error Handling | X/100 | |
| F9 | Performance | X/100 | |
| F10 | Accesibilidad | X/100 | |
| F11 | **Calidad Profunda Código** | X/100 | |
| F12 | DevOps & CI/CD | X/100 | |
| F13 | Observabilidad | X/100 | |
| F14 | Data Layer & DB | X/100 | |
| F15 | **Agente Operador** | X/100 | |

---

## 📈 MÉTRICAS CUANTITATIVAS

| Métrica | Valor |
|---------|-------|
| Total archivos `.ts`/`.tsx` en `src/` | [N] |
| Errores TypeScript (`tsc --noEmit`) | [N] |
| Errores ESLint | [N] |
| Usos de `any` | [N] |
| `@ts-ignore` / `@ts-nocheck` | [N] |
| `console.log` en producción | [N] |
| Test files | [N] |
| Tests pasando / fallando | [N]/[N] |
| Componentes huérfanos | [N] |
| Archivos candidatos a eliminar | [N] |
| Secrets hardcodeados | [N] |
| API routes sin auth guard | [N] |
| Modales sin drag | [N] |
| Violaciones Neumorphism (fondos oscuros) | [N] |
| Cross-module imports (violación DDD) | [N] |
| Divs clickeables sin role | [N] |
| Funciones >50 líneas (complejidad) | [N] |
| Componentes >300 líneas (monolíticos) | [N] |
| Catch blocks vacíos | [N] |
| Magic numbers/strings sin constante | [N] |
| Non-null assertions (`!.`) | [N] |
| Código duplicado (helpers no centralizados) | [N] |
| N+1 queries detectados | [N] |
| Rutas rotas (Agente Operador) | [N] |
| Botones muertos (sin acción) | [N] |
| Errores visuales (texto cortado, NaN, etc.) | [N] |
| Screenshots capturados (evidencia) | [N] |

---

## 🔴 HALLAZGOS CRÍTICOS (bloquean producción enterprise)
| # | Archivo | Línea | Descripción | Acción Recomendada |
|---|---------|-------|-------------|-------------------|

## 🟠 HALLAZGOS ALTOS (deuda técnica grave)
| # | Archivo | Línea | Descripción | Acción Recomendada |
|---|---------|-------|-------------|-------------------|

## 🟡 HALLAZGOS MEDIOS (mejoras importantes)
[Listado con archivo + descripción + acción]

## 🟢 HALLAZGOS MENORES (optimizaciones)
[Listado]

---

## 🗑️ ARCHIVOS CANDIDATOS A ELIMINAR
| Archivo | Razón | Verificación |
|---------|-------|-------------|

## 📋 CÓDIGO DUPLICADO DETECTADO
| Patrón | Archivos Afectados | Helper Central Sugerido |
|--------|-------------------|----------------------|

---

## 🚀 PLAN DE REMEDIACIÓN (Priorizado para aprobación)

### Sprint 1 — Críticos 🔴 (ejecutar primero)
| # | Tarea | Archivos | Cambio | Esfuerzo |
|---|-------|----------|--------|----------|

### Sprint 2 — Altos 🟠
| # | Tarea | Archivos | Cambio | Esfuerzo |
|---|-------|----------|--------|----------|

### Sprint 3 — Optimizaciones 🟡🟢
| # | Tarea | Archivos | Cambio | Esfuerzo |
|---|-------|----------|--------|----------|

---

## ✅ PUNTOS FUERTES DEL SISTEMA
[Lo que ya está bien construido — reconocer el trabajo]

---

## 📈 COMPARATIVO HISTÓRICO (si existe auditoría previa)
| Métrica | Auditoría Anterior | Esta Auditoría | Δ |
|---------|-------------------|----------------|---|

---

## 📝 LECCIONES PARA qc_knowledge.md
[Nuevos anti-patrones descubiertos para registrar]
```

---

## 🤖 PROTOCOLO DE AGENTES PARALELOS (Optimizado)

### Ola 1 — Pre-Flight (PARALELO — 0 dependencias):
```
view_file  CLAUDE.md
view_file  package.json
view_file  .agent/skills/quality-assurance-qc/SKILL.md
view_file  .agent/skills/architecture-ddd/SKILL.md
view_file  .agent/skills/security-audit/SKILL.md
view_file  .agent/skills/code-review/SKILL.md
view_file  .agent/skills/neumorphism-design/SKILL.md
```

### Ola 2 — Estructura (PARALELO — depende de Ola 1):
```
list_dir  src/modules/
list_dir  src/app/api/
list_dir  src/lib/ai/
list_dir  src/lib/security/
list_dir  src/lib/trpc/
list_dir  src/lib/db/
list_dir  src/components/ui/
```

### Ola 3 — Greps de Violaciones (PARALELO — 0 dependencias):
```
grep_search  "bg-slate-950"            en src/app/
grep_search  "bg-black"                en src/app/
grep_search  "rounded-none"            en src/app/
grep_search  "onClick={() => {}}"      en src/app/
grep_search  "console.log"             en src/
grep_search  ": any"                   en src/
grep_search  "@ts-ignore"              en src/
grep_search  "dangerouslySetInnerHTML"  en src/
grep_search  "eval("                   en src/
grep_search  "<div.*onClick"           en src/app/
```

### Ola 4 — Módulos DDD (PARALELO — depende de Ola 2):
```
list_dir  src/modules/contratos/
list_dir  src/modules/campanas/
list_dir  src/modules/vencimientos/
list_dir  src/modules/agencias-creativas/
list_dir  src/modules/equipos-ventas/
list_dir  src/modules/conciliacion/
grep_search  "from.*infrastructure"  en src/modules/*/domain/
grep_search  "from.*modules/"        en src/modules/   (cross-module)
grep_search  "throw new Error"       en src/modules/
```

### Ola 5 — Compilación (SECUENCIAL — esperar resultados):
```
run_command  npx tsc --noEmit          → esperar resultado completo
run_command  npx vitest run --reporter=verbose   → esperar resultado completo
run_command  npm audit --audit-level=high        → esperar resultado
```

### Ola 6 — Tests y Performance (PARALELO):
```
find_by_name  "*.test.ts"    en src/
find_by_name  "*.test.tsx"   en src/
grep_search   "ErrorBoundary" en src/
grep_search   "React.memo"    en src/
grep_search   "useCallback"   en src/
grep_search   "useMemo"       en src/
grep_search   "dynamic("      en src/
```

### Ola 7 — Calidad Profunda del Código F11 (PARALELO):
```
grep_search   "switch ("         en src/modules/
grep_search   "=== [0-9]"        en src/modules/ (IsRegex: true)
grep_search   "'activo'"         en src/app/
grep_search   "formatDate"       en src/app/
grep_search   "formatCurrency"   en src/app/
grep_search   "catch"            en src/
grep_search   "!."               en src/
grep_search   "// const"         en src/
grep_search   "// import"        en src/
grep_search   "export function"  en src/modules/
grep_search   "setInterval"      en src/
grep_search   "addEventListener" en src/
grep_search   "fetch("           en src/
grep_search   ".push("           en src/app/
grep_search   "key={index}"      en src/app/
grep_search   "request.json()"   en src/app/api/
grep_search   "safeParse"        en src/
```

### Ola 8 — DevOps + Observabilidad + Data F12-F14 (PARALELO):
```
list_dir      .github/
find_by_name  "Dockerfile"       en ./
find_by_name  ".dockerignore"    en ./
find_by_name  "*logger*"         en src/lib/
grep_search   "Sentry.init"      en src/
find_by_name  "*health*"         en src/app/api/
find_by_name  "*schema*"         en src/lib/db/
find_by_name  "*migration*"      en src/lib/db/
grep_search   "for.*await"       en src/modules/
grep_search   "transaction"      en src/modules/
```

### Ola 9 — Agente Operador F15 (SECUENCIAL — requiere servidor activo):
```
run_command    npm run dev    (iniciar servidor si no está activo)
browser_subagent  viewport 1440×900 → navegar /dashboard, /campanas, /contratos, /vencimientos, etc.
browser_subagent  viewport 1440×900 → click en cada tab, botón, modal de cada módulo
browser_subagent  viewport 375×812  → navegar rutas /movil, operar nav bar, verificar responsive
Capturar screenshots como evidencia visual
```

### Ola 10 — Informe Final (SECUENCIAL):
- Calcular scores por fase con la fórmula de 15 fases
- Generar informe ejecutivo como artefacto
- Registrar lecciones en qc_knowledge.md
- Adjuntar screenshots del Agente Operador
- Notificar al usuario con el informe completo

---

## 🔁 AUTO-APRENDIZAJE POST-AUDITORÍA

Al finalizar, Antigravity DEBE:

1. Abrir (o crear) `.agent/skills/quality-assurance-qc/qc_knowledge.md`.
2. Registrar los **5 anti-patrones más frecuentes** encontrados:

```markdown
### [NNN] Título del Anti-patrón
**Módulo origen:** [nombre del módulo o "Global"]
**Fase de detección:** [F1–F15]
**Fecha:** [YYYY-MM-DD]
**Situación:** [descripción de qué se encontró]
**Lección (Qué revisar):** [grep o check específico para detectarlo en futuras auditorías]
**Auto-Fix aplicado:** [N/A — solo auditoría]
**Severidad:** 🔴|🟠|🟡|🟢
**🔁 Recurrencia:** 1
```

3. Si una lección ya existía → incrementar su `🔁 Recurrencia`.
4. Actualizar las estadísticas globales del knowledge base.
5. Si se descubrieron patrones nuevos que este SKILL no contempla → proponer actualización del SKILL al usuario.

---

## 🏁 REGLAS FINALES DEL AUDITOR FORTUNE 10

> **Este skill no ejecuta cambios — solo detecta y reporta.**
> **El informe se entrega ANTES de cualquier corrección.**
> **El usuario aprueba el plan antes de que Antigravity ejecute.**
> **Todo hallazgo tiene: archivo exacto + línea + severidad + acción recomendada.**
> **Sin hallazgos genéricos — cada uno es accionable y medible.**
> **El score es HONESTO — no se infla para hacer sentir bien al usuario.**
> **Si el score es bajo, la noticia se da directamente con plan claro y estimación de esfuerzo.**
> **La calidad del código es el pilar — legibilidad, modularidad y técnica son no negociables.**
> **El Agente Operador prueba el sistema como un usuario REAL — si no funciona en la práctica, no funciona.**
> **Cada auditoría hace a Silexar Pulse más invulnerable.**
> **La base perfecta es el prerequisito de los módulos perfectos.**
> **Un sistema TIER 0 Fortune 10 no tiene atajos — tiene estándares.**
> **Si no se puede medir, no se puede mejorar. Todo queda cuantificado.**
> **15 Fases. 0 excusas. 100% cobertura enterprise.**
