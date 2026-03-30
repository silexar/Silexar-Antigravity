---
description: Motor de Auditoría TIER 0 — Análisis total del sistema Silexar Pulse (arquitectura, frontend, backend, seguridad, TypeScript, diseño). Entrega informe ejecutivo + plan de remediación priorizado antes de ejecutar cambios.
---

# /audit — Motor de Auditoría Suprema TIER 0 Fortune 10

> **IMPORTANTE**: Este workflow es de ANÁLISIS PRIMERO. No modifica ningún archivo. Entrega el informe al usuario para su aprobación antes de ejecutar cualquier corrección.

## Pasos

### PASO 0 — Activar el Skill y Leer Contexto

1. Leer el skill maestro de auditoría:
   - `.agent/skills/audit-system/SKILL.md` ← **LEER COMPLETO**

2. Leer simultáneamente (en paralelo — Ola 1):
   - `CLAUDE.md` (fuente de verdad del sistema)
   - `package.json` (dependencias reales)
   - `.agent/skills/quality-assurance-qc/SKILL.md`
   - `.agent/skills/security-audit/SKILL.md`
   - `.agent/skills/architecture-ddd/SKILL.md`
   - `.agent/skills/code-review/SKILL.md`
   - `.agent/skills/neumorphism-design/SKILL.md`

---

### FASE 1 — Análisis Estructural (CLAUDE.md vs Realidad)

3. Mapear estructura declarada vs directorios reales (Ola 2 — paralelo):
   - `list_dir src/modules/` → verificar módulos DDD
   - `list_dir src/lib/ai/` → verificar L1–L8 security layers
   - `list_dir src/lib/security/` → verificar archivos seguridad
   - `list_dir src/lib/trpc/` → verificar tRPC setup
   - `list_dir src/lib/db/` → verificar schemas
   - `list_dir src/components/ui/` → verificar Radix primitives

4. Verificar stack: comparar `package.json` vs CLAUDE.md tech stack.

5. Detectar archivos raíz superfluos:
   - `vite.config.*.ts` en Next.js, `biome.json` + `eslint.config.js`, `index.html`, middleware duplicado

---

### FASE 2 — Arquitectura DDD

6. Verificar capas DDD en cada módulo:
   `domain/` → `application/` → `infrastructure/` → `presentation/`

7. Pureza del dominio + cross-module imports (Ola 4 — paralelo):
   ```bash
   grep -rn "from.*infrastructure\|from.*app/" src/modules/*/domain/
   grep -rn "from.*modules/" src/modules/
   ```

8. Result Pattern (no `throw` para negocio):
   ```bash
   grep -rn "throw new Error" src/modules/
   ```

9. Interfaces I*Repository → implementaciones correspondientes.

10. Naming conventions (Entity, Command, Query, Handler).

---

### FASE 3 — Frontend: Neumorphism + UX + Conexiones

11. Violaciones de diseño (Ola 3 — paralelo):
    ```bash
    bg-slate-950, bg-black, bg-gray-900, rounded-none
    onClick vacíos, console.log, Dialog/Modal sin drag
    ```

12. Componentes huérfanos en `_components/`.

13. Paridad Desktop/Mobile por módulo.

---

### FASE 4 — Seguridad (8 capas + OWASP Top 10)

14. Existencia capas L1–L8 + sus funciones exportadas.

15. Secrets hardcodeados, XSS, eval, dangerouslySetInnerHTML.

16. RBAC en API routes con mutaciones.

17. Middleware: JWT, rate limiting, CSRF, security headers.

// turbo
18. npm audit:
    ```bash
    npm audit --audit-level=high
    ```

// turbo
19. npm outdated:
    ```bash
    npm outdated
    ```

---

### FASE 5 — TypeScript + ESLint + Deuda Técnica

// turbo
20. Compilación TypeScript:
    ```bash
    npx tsc --noEmit 2>&1
    ```

21. Anti-patrones (paralelo):
    ```bash
    ": any", "as any", "@ts-ignore", "@ts-nocheck", "eslint-disable"
    ```

22. Código duplicado: `Intl.NumberFormat`, `formatDate`, `fetch('/api` directo.

23. TODO/FIXME/HACK sin ticket reference.

24. Configs conflictivos (biome vs eslint).

---

### FASE 6 — Conexiones y Routing

25. API routes vs módulos DDD (lógica inline = violación).
26. tRPC routers registrados.
27. Providers en `layout.tsx` (auth, query, trpc, theme).
28. Schemas Drizzle registrados.
29. Variables de entorno no usadas.

---

### FASE 7 — Testing & Cobertura *(NUEVA)*

30. Buscar archivos de test:
    ```bash
    find *.test.ts, *.test.tsx, *.spec.ts, __tests__/ en src/
    ```

// turbo
31. Ejecutar tests:
    ```bash
    npx vitest run --reporter=verbose 2>&1
    ```

32. Cobertura por módulo DDD.
33. E2E tests (Playwright) en e2e/.

---

### FASE 8 — Error Handling & Resilience *(NUEVA)*

34. Error Boundaries en React.
35. Try/catch en CADA API route.
36. Estados UI: Loading/Empty/Error en listas con `.map()`.
37. React Query onError handlers.

---

### FASE 9 — Performance *(NUEVA)*

38. React.memo en componentes pesados.
39. useMemo/useCallback.
40. Lazy loading (React.lazy / next/dynamic).
41. Debounce en búsquedas.
42. Virtualización en listas largas.

---

### FASE 10 — Accesibilidad WCAG 2.1 AA *(NUEVA)*

43. `<div onClick>` sin role="button".
44. Inputs sin aria-label.
45. Imágenes sin alt.
46. Focus management (focus:ring).
47. Semantic HTML (nav, main, article, section).

---

### ENTREGABLE FINAL

48. Calcular **Score Global** con la fórmula ponderada de 10 dimensiones.

49. Generar informe ejecutivo completo con:
    - Score global + certificación (🏆/✅/🟡/🟠/🔴)
    - Métricas cuantitativas (conteo exacto por tipo)
    - Hallazgos por severidad con archivo + línea + acción
    - Archivos candidatos a eliminar
    - Código duplicado
    - Plan de remediación en 3 Sprints
    - Puntos fuertes del sistema
    - Comparativo histórico (si existe auditoría previa)

50. Registrar anti-patrones en `.agent/skills/quality-assurance-qc/qc_knowledge.md`.

51. **Notificar al usuario con el informe completo** para revisión y aprobación antes de ejecutar cualquier cambio.
