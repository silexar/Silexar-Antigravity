---
name: Silexar Module Builder — Protocolo Unificado de Construcción de Módulos
version: 1.0.0
tier: TIER_0_FORTUNE_10
description: >
  Único protocolo aprobado para construir, crear o desarrollar nuevos módulos en Silexar Pulse.
  Se activa automáticamente ante solicitudes como "construir módulo", "nuevo módulo", 
  "crear módulo", "module creation", "build module", " desarrollar módulo" o 
  "necesito un módulo de [negocio]". Unifica CLAUDE.md, DDD architecture, 
  modulo-creation-protocol, auditoría de seguridad y diseño neumorphism.
author: CEO Kimi — Silexar Pulse Engineering
last_updated: 2026-04-15
---

# 🚀 SILEXAR MODULE BUILDER — PROTOCOLO UNIFICADO v1.0

> **ADVERTENCIA:** Este es el ÚNICO protocolo aprobado para construcción de módulos en Silexar Pulse. Desviaciones deben ser documentadas en `.agent/knowledge/SYSTEM_KNOWLEDGE_BASE.md` con justificación técnica explícita.

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

---

## 🛑 PRE-FLIGHT CHECKLIST (OBLIGATORIO ANTES DE ESCRIBIR CÓDIGO)

Antes de tocar cualquier archivo de código, el agente DEBE:

1. **Leer `.agent/knowledge/SYSTEM_KNOWLEDGE_BASE.md`** — Buscar errores recurrentes [E###] y patrones [P###].
2. **Leer `CLAUDE.md`** — Confirmar stack tecnológico, estructura de carpetas y reglas de seguridad.
3. **Leer `.agent/skills/neumorphism-design/SKILL.md`** — Tokens visuales exactos.
4. **Decidir el tier del módulo**:
   - **Tier Core**: Negocio complejo, múltiples entidades, reglas de dominio ricas, escalabilidad futura → **DDD completo en `src/modules/{modulo}/`**
   - **Tier Functional**: CRUD con reglas simples, soporte administrativo, poca lógica de negocio → Puede vivir en `src/app/{modulo}/` + `src/app/api/{modulo}/` con estructura mínima
5. **Crear `implementation_plan.md`** en `.agent/knowledge/plans/{modulo}/` con alcance, entidades, casos de uso y estimación.
6. **Validar que no exista ya** un módulo con nombre similar o funcionalidad superpuesta.

---

## 🏗️ ESTRUCTURA DE CONSTRUCCIÓN POR TIER

### TIER CORE — DDD Completo (`src/modules/{modulo}/`)

Use este tier para módulos que serán el corazón del negocio: contratos, campañas, anunciantes (si se refactorea), facturación (si se refactorea), equipos de ventas, conciliación.

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
│   └── events/
│       └── EntidadCreadaEvent.ts
├── application/
│   ├── commands/
│   │   ├── CrearEntidadCommand.ts       # Zod schema + Command class
│   │   ├── ActualizarEntidadCommand.ts
│   │   └── __tests__/
│   ├── queries/
│   │   ├── BuscarEntidadesQuery.ts
│   │   └── __tests__/
│   └── handlers/
│       ├── CrearEntidadHandler.ts       # Result Pattern obligatorio
│       └── __tests__/
├── infrastructure/
│   ├── repositories/
│   │   └── EntidadDrizzleRepository.ts  # withTenantContext() en TODO query
│   ├── mappers/
│   │   └── EntidadMapper.ts
│   └── external/
│       └── MiServicioExterno.ts
└── presentation/
    ├── components/
    │   └── EntidadCard.tsx
    ├── pages/
    │   └── EntidadListPage.tsx
    └── hooks/
        └── useEntidades.ts
```

**Reglas inquebrantables para Tier Core:**
- `domain/` NO importa de `application/`, `infrastructure/`, `presentation/`, ni de otros módulos.
- `application/` solo importa `domain/` y contratos de `infrastructure/` (interfaces).
- `infrastructure/` importa `domain/` (interfaces) pero NO `application/`.
- `presentation/` importa `application/` y tipos de `domain/`.
- Commands y Handlers usan **Result Pattern** (`Result<T, Error>`).
- Toda query a base de datos usa `withTenantContext(tenantId, async () => { ... })`.

### TIER FUNCTIONAL — CRUD Seguro (`src/app/{modulo}/` + `src/app/api/{modulo}/`)

Use este tier para utilidades administrativas, catálogos simples, configuraciones, dashboards de soporte.

```
src/app/{modulo}/
├── page.tsx                     # Listado
├── [id]/
│   ├── page.tsx                 # Detalle
│   └── editar/
│       └── page.tsx             # Edición
├── nuevo/
│   └── page.tsx                 # Creación
├── _components/
│   └── ModuloForm.tsx           # Formulario reutilizable
├── _hooks/
│   └── useModuloData.ts
└── layout.tsx (si aplica)

src/app/api/{modulo}/
├── route.ts                     # GET list + POST create
└── [id]/
    └── route.ts                 # GET detail + PUT update + PATCH + DELETE
```

**Reglas inquebrantables para Tier Functional:**
- Todos los `route.ts` DEBEN usar `withApiRoute()`.
- Todos los inputs DEBEN validarse con **Zod**.
- Toda query a DB DEBE usar `withTenantContext()`.
- DEBE haber **audit logging** en CREATE, UPDATE, DELETE.
- El frontend DEBE usar los tokens neumorphism exactos.
- Si el módulo crece más de 3 entidades → **refactor obligatorio a Tier Core**.

---

## 📋 LAS 6 FASES INAMOVIBLES DE CONSTRUCCIÓN

```
FASE 1: PLAN + SCHEMA
  └─ implementation_plan.md + Diseño DB (Drizzle schema)

FASE 2: SEGURIDAD + API
  └─ API routes con withApiRoute + Zod + withTenantContext + audit

FASE 3: DOMINIO / LÓGICA DE NEGOCIO
  └─ Tier Core: Entities + VOs + Commands + Handlers (Result Pattern)
  └─ Tier Functional: Services + validaciones de negocio en API

FASE 4: FRONTEND
  └─ Páginas + Componentes con Neumorphism exacto + Mobile responsive

FASE 5: INTEGRACIÓN Y FLUJO COMPLETO
  └─ Conectar frontend → API → DB. Probar creación, edición, listado, eliminación.

FASE 6: QC + REGISTRO DE ERRORES
  └─ Verificar TypeScript, eliminar stubs, documentar lecciones aprendidas.
```

---

## 🔒 PATRONES DE SEGURIDAD OBLIGATORIOS

### API Routes (D16 — CRÍTICO)
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

### Validación de Inputs
```typescript
import { z } from 'zod';

const crearSchema = z.object({
  nombre: z.string().min(1).max(255),
  email: z.string().email().optional(),
  monto: z.number().positive(),
});

const parsed = crearSchema.safeParse(body);
if (!parsed.success) {
  return apiError('VALIDATION_ERROR', 'Datos inválidos', 422, parsed.error.flatten().fieldErrors);
}
```

### Multi-tenancy con RLS
```typescript
import { withTenantContext } from '@/lib/db/tenant-context';

const result = await withTenantContext(ctx.tenantId, async () => {
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

### Template: Entity Tier Core
```typescript
// src/modules/{modulo}/domain/entities/MiEntidad.ts
import { z } from 'zod';

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

  toJSON(): MiEntidadProps {
    return { ...this.props };
  }
}
```

### Template: API Route Base (Tier Functional)
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
});

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
    <div className="min-h-screen bg-[#F0EDE8] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="rounded-2xl p-6 bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50">
          <h1 className="text-2xl font-bold text-slate-800">Módulo</h1>
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
- [ ] Todos los inputs validados con Zod
- [ ] Todas las queries a DB usan `withTenantContext()`
- [ ] Si es Tier Core: Domain no importa de infrastructure/presentation
- [ ] Si es Tier Core: Commands y Handlers usan Result Pattern
- [ ] Audit logging en CREATE, UPDATE, DELETE
- [ ] No hay secrets hardcodeados
- [ ] No hay `eval()` ni `new Function()`

### Frontend
- [ ] Fondo `#F0EDE8` en todas las páginas del módulo
- [ ] Cards usan `bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50`
- [ ] Botones principales tienen `rounded-xl` o `rounded-full` y sombra neumorphism
- [ ] Mobile existe o al menos es responsive (vista funciona en 375px)
- [ ] No hay `dangerouslySetInnerHTML` sin sanitizar

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
   - Tier elegido y justificación
   - Estructura de archivos creada
   - Estado del checklist (X/16 items)
   - Lecciones aprendidas registradas (Sí/No)

---

> **"La excelencia no es un acto, sino una práctica continua documentada."**
>
> *— Silexar Pulse Engineering*
