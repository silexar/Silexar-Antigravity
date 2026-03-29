# 🧠 BASE DE CONOCIMIENTO QA — MEMORIA AUTODIDACTA (QC_KNOWLEDGE)

> **PROTOCOLO DE USO:**
> - **ANTES** de cada auditoría: LEER este archivo completo.
> - **DESPUÉS** de cada auditoría: AGREGAR nuevas lecciones.
> - **RECURRENCIA**: Si una lección se repite, incrementar el contador `🔁 Recurrencia: N`.

---

## 📊 ESTADÍSTICAS GLOBALES

| Métrica | Valor |
|---------|-------|
| Total Lecciones | 12 |
| Módulos Auditados | 12 módulos DDD + auditoría global Tier 0 |
| Última Auditoría | 2026-03-26 |
| Errores Más Recurrentes | `logger.xxx({object})`, `as unknown` aritmética, `unknown` en params |

---

## 🗃️ LECCIONES REGISTRADAS

### [001] Renderizado Condicional Defectuoso en JSX
**Módulo origen:** Vencimientos
**Fecha:** 2026-03-10
**Situación:** Al programar Wizards multipasos o vistas tabuladas, el bloque visual del Paso 1 no estaba envuelto en `{paso === 1 && (...)}`, lo que causaba que TypeScript interpretara el JSX como una expresión y lanzara `TS1381: Unexpected token`.
**Lección (Qué revisar):** Buscar archivos Wizard o con tabs cuyo primer bloque visual NO esté envuelto en un renderizado condicional. Usar `grep_search` para `className=.*rounded.*border` sin un `&&` previo.
**Severidad:** 🔴 Crítica
**🔁 Recurrencia:** 2 (encontrado en Desktop y Mobile Wizard)

---

### [002] Emojis sin Comillas rompen TSX Parser
**Módulo origen:** Conciliación / Vencimientos
**Fecha:** 2026-03-10
**Situación:** Constantes con propiedades como `score: 🥇` (sin comillas) rompen el AST de TypeScript lanzando `TS1127: Invalid character`.
**Lección (Qué revisar):** Buscar emojis fuera de strings en archivos `.ts`/`.tsx` con: `grep -P ":\s*[^\"\'\`\w]" src/app/<modulo>`. Todo emoji en un objeto/array/enum DEBE estar entre comillas `"🥇"`.
**Severidad:** 🔴 Crítica
**🔁 Recurrencia:** 3 (Radio Corazón, Play FM, Sonar FM en DashboardCumplimiento)

---

### [003] Deuda Técnica: Variables residuales y "any" perezoso
**Módulo origen:** Vencimientos
**Fecha:** 2026-03-10
**Situación:** 14 errores ESLint en una sola auditoría por: imports huérfanos (`useState` sin usar), componentes importados pero no renderizados, y `catch (err: any)` en Custom Hooks.
**Lección (Qué revisar):** 
1. Al terminar de programar, ejecutar ESLint y limpiar headers de imports.
2. NUNCA usar `catch (err: any)`. Patrón correcto:
```typescript
catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError('Error desconocido');
  }
}
```
**Severidad:** 🟠 Alta
**🔁 Recurrencia:** 14 instancias en un solo módulo

---

### [004] Paridad en Ecosistemas Móviles (NavBars Perdidos)
**Módulo origen:** Vencimientos
**Fecha:** 2026-03-10
**Situación:** El Dashboard Móvil tenía 4 tabs básicos pero carecía de una Bottom Navigation Bar y de acceso a vistas construidas como Analytics, Security, Configuración.
**Lección (Qué revisar):** Comprobar que TODO dashboard mobile tiene:
1. Un `<nav>` fijo con `position: fixed; bottom: 0` para navegar entre pilares.
2. Acceso a TODAS las vistas que existen en Desktop (paridad).
3. Quick Actions en el Home que llevan a las secciones más usadas.
**Severidad:** 🟠 Alta
**🔁 Recurrencia:** 1

---

### [005] Componentes Importados pero Nunca Renderizados
**Módulo origen:** Vencimientos
**Fecha:** 2026-03-10
**Situación:** En `MobileVencimientosDashboard.tsx` se importaron `MobileConfiguracionTandasView`, `MobileConfiguracionSenalesEspecialesView` y `MobileSincronizacionContratosView`, pero nunca se usaron en el JSX. ESLint lo detectó como `no-unused-vars`.
**Lección (Qué revisar):** Después de importar un componente, verificar de inmediato que tiene un bloque de render condicional. Si la vista no está lista, NO importar — dejar un comentario `// TODO: Integrar cuando esté listo`.
**Severidad:** 🟡 Media
**🔁 Recurrencia:** 3

---

### [006] Estados del Componente Declarados sin Uso
**Módulo origen:** Vencimientos
**Fecha:** 2026-03-10
**Situación:** Variables de estado como `const [menuAbierto, setMenuAbierto] = useState(false)` fueron declaradas anticipándose a funcionalidad futura pero nunca se utilizaron, generando 2 errores ESLint por estado.
**Lección (Qué revisar):** No declarar estados "por si acaso". Declararlos SOLO cuando se van a usar activamente. Si se necesitan después, agregarlos en ese momento.
**Severidad:** 🟡 Media
**🔁 Recurrencia:** 2

---

### [007] PowerShell no soporta `&&` como separador
**Módulo origen:** Sistema (Terminal)
**Fecha:** 2026-03-10
**Situación:** Al intentar ejecutar `comando1 && comando2` en PowerShell, el intérprete rechaza `&&` como separador válido.
**Lección (Qué revisar):** En Windows PowerShell, ejecutar comandos secuenciales como llamadas separadas, no concatenadas con `&&`. Usar `;` como alternativa si es imprescindible.
**Severidad:** 🟢 Baja
**🔁 Recurrencia:** 2

---

### [008] logger.xxx({object}) — Objeto como Primer Argumento
**Módulo origen:** Auditoría Global Tier 0 (2026-03-26)
**Fecha:** 2026-03-26
**Situación:** 661 errores TypeScript en el proyecto. Causa raíz frecuente: `logger.error({ message: '...', error })` — pasar un objeto literal como primer argumento al logger. La firma real es `logger.error(message: string, error?: Error | undefined)`.
**Lección (Qué revisar):** Buscar con `grep_search` `logger\.(error|warn|info)\s*\(\s*\{` en todos los archivos `.ts`/`.tsx`. El primer argumento SIEMPRE debe ser un string (template literal si se necesita contexto). El segundo argumento para `logger.error/warn` es `Error | undefined` (usar `error instanceof Error ? error : undefined`). Para `logger.info`, el segundo argumento es `Record<string, unknown> | undefined` (no admite Error directamente — embeber en string).
**Severidad:** 🔴 Crítica
**🔁 Recurrencia:** 20+ instancias en auditoría global

---

### [009] `(value as unknown) || 'default'` produce `{}` en TypeScript
**Módulo origen:** Auditoría Global Tier 0 — archivos `src/lib/enterprise/`
**Fecha:** 2026-03-26
**Situación:** El patrón `(process.env.X as unknown) || 'fallback'` produce tipo inferido `{}` en lugar del union type esperado. TypeScript dice `Type '{}' is not assignable to type '"option1" | "option2"'`. Causa: `unknown || string` colapsa a `{}`.
**Lección (Qué revisar):** Buscar `as unknown\) \|\|` en archivos de configuración. Cambiar a cast directo al union type: `(process.env.X as 'option1' | 'option2') || 'default'`. Esto es especialmente común en archivos `*-config.ts`, `auto-scaling.ts`, `load-balancer.ts`, `orchestrator.ts`.
**Severidad:** 🟠 Alta
**🔁 Recurrencia:** 10 instancias en `src/lib/enterprise/`

---

### [010] Parámetros `unknown` con acceso a propiedades — TS18046
**Módulo origen:** Auditoría Global Tier 0
**Fecha:** 2026-03-26
**Situación:** Funciones declaradas con `param: unknown` acceden a `param.property`, generando TS18046. Ejemplo: `private fn(recommendation: unknown) { return recommendation.type }`.
**Lección (Qué revisar):** Buscar firmas de métodos privados con `: unknown)` como parámetro. Si el código accede a propiedades del param sin type guard, cambiar a `any` con `// eslint-disable-next-line @typescript-eslint/no-explicit-any`. Si es código de producción, agregar un type guard o interfaz tipada.
**Severidad:** 🟠 Alta
**🔁 Recurrencia:** 8 instancias

---

### [011] Drizzle insert/update rechaza enums de dominio — TS2769
**Módulo origen:** `src/modules/propiedades/infrastructure/repositories/`
**Fecha:** 2026-03-26
**Situación:** `db.insert(table).values({ estado: domainEntity.estado })` genera `No overload matches this call` porque el tipo de dominio (`EstadoPropiedad`) no satisface exactamente el tipo del enum de Drizzle (`"activo" | "inactivo" | "archivado"`), aunque los valores sean idénticos. TypeScript no infiere la equivalencia entre tipos nominales y sus strings literales.
**Lección (Qué revisar):** En repositorios Drizzle, siempre agregar `// eslint-disable-next-line @typescript-eslint/no-explicit-any` + `as any` en campos de tipo enum de dominio en `.values({})` y `.set({})`. Patrón: `estado: entity.estado as any`. Los métodos `update()` ya lo tienen correcto, verificar que `save()` también los tenga.
**Severidad:** 🟠 Alta
**🔁 Recurrencia:** 3 instancias (tiposPropiedad save, valoresPropiedad save, valoresPropiedad update)

---

### [012] `Contrato.create({})` — Campos requeridos omitidos en API Route
**Módulo origen:** `src/app/api/contratos/route.ts`
**Fecha:** 2026-03-26
**Situación:** El handler POST de contratos llamaba `Contrato.create({...})` sin los campos de workflow requeridos por `ContratoProps`: `estado`, `etapaActual`, `progreso`, `proximaAccion`, `responsableActual`, `fechaLimiteAccion`, `alertas`, `tags`, `actualizadoPor`. TypeScript lo detectó como TS2345 con mensaje confuso sobre `Omit<ContratoProps, ...>`.
**Lección (Qué revisar):** Al usar `Entity.create({})` en API routes, comparar los campos del objeto literal contra la interfaz `Props` del dominio. Campos de workflow/auditoría son especialmente fáciles de omitir. `EstadoContrato.borrador()` es el valor de estado inicial correcto (no un string).
**Severidad:** 🟠 Alta
**🔁 Recurrencia:** 1

---

## 📝 PLANTILLA PARA NUEVA LECCIÓN

```markdown
### [NNN] Título Descriptivo
**Módulo origen:** <nombre>
**Fecha:** <YYYY-MM-DD>
**Situación:** <qué pasó exactamente>
**Lección (Qué revisar):** <qué buscar proactivamente>
**Severidad:** 🔴 Crítica | 🟠 Alta | 🟡 Media | 🟢 Baja
**🔁 Recurrencia:** 1
```
