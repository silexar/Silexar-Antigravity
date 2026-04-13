# 🧠 SILEXAR PULSE - BASE DE CONOCIMIENTOS DEL SISTEMA
## Sistema de Auto-Aprendizaje y Memoria Organizacional

> **Versión:** 1.0.0  
> **Última actualización:** 2026-04-03  
> **Agente CEO Kimi:** Sistema de memoria para evolución continua

---

## 📋 ESTRUCTURA DE CONOCIMIENTO

Esta base de conocimientos es la **memoria colectiva** de Silexar Pulse. Todo agente que trabaje en el sistema DEBE:

1. **LEER** esta base antes de comenzar cualquier tarea
2. **REGISTRAR** nuevas lecciones aprendidas
3. **ACTUALIZAR** contadores de recurrencia cuando se repitan patrones
4. **CONSULTAR** antes de tomar decisiones arquitectónicas

---

## 🔴 ERRORES CRÍTICOS (NUNCA REPETIR)

### [E001] Archivos Temporales en Repositorio
**Fecha detectado:** 2026-04-03  
**Detectado por:** Agente CEO Kimi  
**Severidad:** 🔴 CRÍTICO  
**Recurrencia:** 1

**Descripción:**
Archivos de build (`*.tsbuildinfo`, `*.timestamp-*.mjs`) estaban en el repositorio, aumentando el tamaño y causando conflictos.

**Archivos afectados:**
- `tsconfig.campanas.tsbuildinfo` (~100KB)
- `tsconfig.tsbuildinfo` (~1MB)
- `vitest.config.ts.timestamp-*.mjs`

**Solución aplicada:**
```bash
# Eliminados y agregados a .gitignore
*.tsbuildinfo
tsconfig*.tsbuildinfo
vitest.config.ts.timestamp-*.mjs
```

**Checklist preventivo:**
- [ ] Revisar archivos antes de commit
- [ ] `git status` debe mostrar solo archivos intencionales
- [ ] Nunca commitear `*.tsbuildinfo`, `node_modules/`, `.next/`

---

### [E002] Nombres de Archivos con Espacios y Caracteres Especiales
**Fecha detectado:** 2026-04-03  
**Detectado por:** Agente CEO Kimi  
**Severidad:** 🔴 CRÍTICO  
**Recurrencia:** 1

**Descripción:**
Archivos como `# ?? SILEXAR PULSE QUANTUM - SISTEM.txt` y `Manifiesto de Arquitectura Definitiva silexar pulse 2025.txt` con espacios, emojis y caracteres especiales causan problemas en:
- Scripts de automatización
- CI/CD pipelines
- Referencias cruzadas
- Portabilidad entre sistemas operativos

**Solución aplicada:**
```
ANTES:  # ?? SILEXAR PULSE QUANTUM - SISTEM.txt
DESPUÉS: docs/VISION_ESTRATEGICA_SILEXAR_PULSE.md

ANTES:  Manifiesto de Arquitectura Definitiva silexar pulse 2025.txt
DESPUÉS: docs/MANIFIESTO_ARQUITECTURA_2025.md
```

**Convención de nombres ESTRICTA:**
- ✅ `NOMBRE_DESCRIPITVO_EXTENSION`
- ✅ `modulo-nombre-archivo.ts`
- ✅ `ComponenteReact.tsx`
- ❌ `archivo con espacios.txt`
- ❌ `# archivo-con-emojis !!.txt`
- ❌ `Archivo.Con.Puntos.Multiples.txt`

---

### [E003] Documentación Dispersa en Múltiples Ubicaciones
**Fecha detectado:** 2026-04-03  
**Detectado por:** Agente CEO Kimi  
**Severidad:** 🟠 ALTO  
**Recurrencia:** 1

**Descripción:**
Documentación estratégica estaba en:
- `pendientes/` (carpeta raíz)
- `Pendientes y Manuales/` (carpeta raíz con espacios)
- Archivos sueltos en raíz

Esto dificulta encontrar información y mantener consistencia.

**Solución aplicada:**
```
TODA documentación centralizada en docs/:
├── docs/
│   ├── VISION_ESTRATEGICA_SILEXAR_PULSE.md
│   ├── MANIFIESTO_ARQUITECTURA_2025.md
│   ├── pendientes/ (subcarpeta organizada)
│   └── ... otros documentos
```

---

## 🟡 PATRONES DE CÓDIGO (MEJORES PRÁCTICAS)

### [P001] Estructura DDD Obligatoria
**Categoría:** Arquitectura  
**Frecuencia de uso:** CADA nuevo módulo

```
src/modules/{modulo}/
├── domain/
│   ├── entities/          # Entidades ricas con comportamiento
│   ├── value-objects/     # Tipos inmutables y validados
│   ├── repositories/      # Interfaces (I*Repository)
│   └── events/            # Domain events
├── application/
│   ├── commands/          # Operaciones de escritura
│   ├── queries/           # Operaciones de lectura
│   └── handlers/          # Orquestación de casos de uso
├── infrastructure/
│   ├── repositories/      # Implementación con Drizzle
│   ├── external/          # APIs externas (SII, Cortex, etc.)
│   └── mappers/           # Transformación de datos
└── presentation/
    ├── components/        # Componentes React
    ├── pages/             # Páginas específicas del módulo
    └── hooks/             # Hooks custom del módulo
```

**Validación:**
- [ ] ¿Tiene las 4 capas?
- [ ] ¿Domain NO importa de infrastructure/ o app/?
- [ ] ¿Los repositorios tienen interfaces?
- [ ] ¿Commands usan Result Pattern (no throw)?

---

### [P002] Sistema de Diseño Neumorphism
**Categoría:** UI/UX  
**Frecuencia de uso:** CADA componente visual

**Tokens OBLIGATORIOS:**
```css
/* Fondo base */
--surface-base: #F0EDE8
bg-[#F0EDE8]

/* Sombras Neumorphism */
shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]     /* Elevado */
shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]  /* Hundido */

/* Border radius */
rounded-2xl / rounded-3xl / rounded-full

/* Texto */
text-gray-800    /* Primario */
text-gray-500    /* Secundario */
text-gray-400    /* Placeholder */
```

**PROHIBIDO:**
- ❌ `bg-slate-950`, `bg-black` (fondos oscuros)
- ❌ `rounded-none`, `rounded-sm` (esquinas cuadradas)
- ❌ `text-white` fuera de botones primarios
- ❌ Modales sin `backdrop-blur` y sin capacidad de drag

---

### [P003] Seguridad AI - 8 Capas
**Categoría:** Seguridad  
**Frecuencia de uso:** CADA interacción con IA

| Capa | Archivo | Función Clave |
|------|---------|---------------|
| L1 | `src/lib/ai/system-prompt.ts` | `buildSystemPrompt()` |
| L2 | `src/lib/ai/input-filter.ts` | `filterInput()` |
| L3 | `src/lib/db/tenant-context.ts` | `withTenantContext()` |
| L4 | `src/lib/security/rate-limiter.ts` | Rate limiting |
| L5 | `src/lib/ai/judge.ts` | `JudgeVerdict` |
| L6 | `src/lib/ai/output-validator.ts` | Validación output |
| L7 | `src/lib/ai/anomaly-detector.ts` | Detección anomalías |
| L8 | `src/lib/cortex/action-proxy.ts` | Zero trust proxy |

**Validación:**
- [ ] ¿Todas las llamadas a IA pasan por L1-L3 mínimo?
- [ ] ¿El user input NUNCA se concatena directamente al prompt?
- [ ] ¿Las acciones de IA pasan por action-proxy?

---

### [P004] Multi-Tenancy con RLS
**Categoría:** Seguridad de Datos  
**Frecuencia de uso:** CADA query a base de datos

**Patrón obligatorio:**
```typescript
// ✅ CORRECTO
const result = await withTenantContext(ctx.tenantId, async () => {
  return db.select().from(campanas).where(eq(campanas.estado, 'ACTIVA'));
});

// ❌ PROHIBIDO - Sin contexto de tenant
const result = await db.select().from(campanas);  // PELIGROSO
```

**Checklist:**
- [ ] ¿Toda tabla tiene `tenant_id`?
- [ ] ¿RLS está habilitado en PostgreSQL?
- [ ] ¿Nunca se filtra por tenantId manualmente en queries?

---

### [P005] API Response Standard
**Categoría:** Backend  
**Frecuencia de uso:** CADA endpoint API

```typescript
// Éxito
return apiSuccess(data, 200, { total, page, pageSize });
// { success: true, data: T, meta?: {...} }

// Error
return apiError('CODIGO_ERROR', 'Mensaje descriptivo', 400, detalles);
// { success: false, error: { code, message, details? } }

// Autorización
return apiUnauthorized();   // 401
return apiForbidden();      // 403
return apiNotFound('recurso');  // 404
return apiValidationError(zodError);  // 422
```

**Checklist:**
- [ ] ¿Todas las rutas usan `getUserContext()`?
- [ ] ¿Todas validan con Zod antes de procesar?
- [ ] ¿Todas chequean RBAC con `checkPermission()`?
- [ ] ¿Todas están en try/catch con `apiError()`?

---

## 🟢 DECISIONES ARQUITECTÓNICAS (ADRs)

### [ADR001] Uso de Drizzle ORM sobre Prisma/TypeORM
**Fecha:** 2025-11-01  
**Estado:** ACEPTADO  
**Contexto:**
Necesitábamos un ORM type-safe con mínimo overhead runtime para arquitectura multi-tenant.

**Decisión:**
Usar Drizzle ORM 0.44+ por:
- Zero runtime overhead (SQL compilado)
- TypeScript-first
- PostgreSQL nativo con RLS
- Migrations nativas

**Consecuencias:**
- ✅ Queries SQL explícitas y optimizables
- ✅ Sin prisma client generation
- ⚠️ Menos "magia" que Prisma, más explícito

---

### [ADR002] Better-Auth sobre NextAuth/Auth0
**Fecha:** 2025-11-01  
**Estado:** ACEPTADO  
**Contexto:**
Necesitábamos autenticación type-safe, multi-tenant, con organizaciones y 2FA.

**Decisión:**
Usar better-auth 1.4+ por:
- TypeScript nativo
- Multi-tenant integrado
- Organizaciones/roles
- 2FA/TOTP
- Sin vendor lock-in

---

### [ADR003] Neumorphism sobre Material/MUI
**Fecha:** 2025-09-01  
**Estado:** ACEPTADO  
**Contexto:**
Queríamos identidad visual única, táctil, moderna que diferenciara Silexar Pulse.

**Decisión:**
Sistema de diseño Neumorphism propio con:
- Fondo `#F0EDE8`
- Sombras dobles para relieve
- Esquinas redondeadas generosas
- Modales arrastrables (OS-like)

---

## 📊 ESTADÍSTICAS DEL SISTEMA

### Métricas de Calidad (Target vs Actual)

| Métrica | Target | Actual | Estado |
|---------|--------|--------|--------|
| Cobertura de tests | >80% | ? | 🟡 Pendiente auditoría |
| TypeScript strict | 0 errores | ? | 🟡 Pendiente auditoría |
| ESLint errors | 0 | ? | 🟡 Pendiente auditoría |
| Módulos con DDD completo | 12 | 10 | 🟡 83% |
| UI Neumorphism compliance | 100% | ? | 🟡 Pendiente auditoría |
| Seguridad OWASP | 100% | ? | 🟡 Pendiente auditoría |

### Módulos Implementados (10/12)

| # | Módulo | Capas DDD | Tests | UI | Status |
|---|--------|-----------|-------|-----|--------|
| 1 | agencias-creativas | ✅ | ? | ? | 🟡 |
| 2 | contratos | ✅ | ? | ? | 🟡 |
| 3 | campanas | ✅ | ? | ✅ | 🟡 |
| 4 | equipos-ventas | ✅ | ? | ? | 🟡 |
| 5 | vencimientos | ✅ | ? | ? | 🟡 |
| 6 | conciliacion | ✅ | ? | ? | 🟡 |
| 7 | propiedades | ✅ | ? | ? | 🟡 |
| 8 | cortex | ✅ | ? | ? | 🟡 |
| 9 | auth | ✅ | ? | ? | 🟡 |
| 10 | narratives | ✅ | ? | ? | 🟡 |
| 11 | ? | - | - | - | 🔴 Pendiente |
| 12 | ? | - | - | - | 🔴 Pendiente |

---

## 🎯 ROADMAP DE MEJORAS IDENTIFICADAS

### Inmediatas (Próxima semana)
1. [ ] Ejecutar auditoría completa con skill `audit-system`
2. [ ] Limpiar componentes huérfanos
3. [ ] Verificar mobile views en todos los módulos
4. [ ] Centralizar helpers duplicados (`formatDate`, `formatCurrency`)

### Corto plazo (Próximo mes)
1. [ ] Completar 2 módulos DDD faltantes
2. [ ] Alcanzar 80% cobertura de tests
3. [ ] Implementar E2E con Playwright
4. [ ] Optimizar bundle size (<150KB inicial)

### Mediano plazo (Próximo trimestre)
1. [ ] Auditoría de seguridad externa
2. [ ] Performance optimization (Web Vitals >90)
3. [ ] Documentación API completa (OpenAPI)
4. [ ] Preparación certificación SOC2

---

## 📝 CÓMO AGREGAR NUEVAS LECCIONES

Cuando encuentres un nuevo patrón o error:

1. **Asignar ID único:** `[E###]` para errores, `[P###]` para patrones, `[ADR###]` para decisiones
2. **Documentar:** Fecha, detector, severidad, descripción
3. **Solución:** Código o proceso específico
4. **Checklist:** Items verificables
5. **Actualizar:** Este archivo con `Recurrencia: N`

---

> **Recuerda:** "La calidad no es un acto, es un hábito." - Aristóteles
> 
> **Agente CEO Kimi:** *"Construimos no solo código, sino conocimiento que evoluciona."*

---

## 🔗 ENLACES RÁPIDOS

- [CLAUDE.md](../CLAUDE.md) - Fuente de verdad del sistema
- [SKILL: QA TIER 0](../skills/quality-assurance-qc/SKILL.md) - Protocolo QC
- [SKILL: DDD](../skills/architecture-ddd/SKILL.md) - Arquitectura DDD
- [SKILL: Security](../skills/security-audit/SKILL.md) - Seguridad
- [docs/](../../docs/) - Documentación del proyecto
