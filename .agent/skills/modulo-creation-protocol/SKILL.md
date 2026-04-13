---
name: Modulo Creation Protocol TIER 0 v2.0 - Enterprise Supreme
description: Protocolo definitivo para construcción de módulos DDD Fortune 10 en Silexar Pulse. Incluye templates de código, Result Pattern, Neumorphism exacto, seguridad 8 capas, y auto-verificación. ÚNICO estándar aprobado para construcción de módulos.
version: 2.0.0
last_updated: 2026-04-03
author: Agente CEO Kimi
---

# 🚀 PROTOCOLO SUPREMO DE CREACIÓN DE MÓDULOS v2.0
## Silexar Pulse - Estándar Fortune 10 / Tier 0

> **ADVERTENCIA:** Este es el ÚNICO protocolo aprobado. Desviaciones deben ser documentadas en `.agent/knowledge/SYSTEM_KNOWLEDGE_BASE.md` con justificación técnica.

---

## 📚 PREREQUISITOS OBLIGATORIOS

Antes de tocar código, DEBES leer:
1. `.agent/knowledge/SYSTEM_KNOWLEDGE_BASE.md` - Patrones y errores conocidos
2. `.agent/skills/architecture-ddd/SKILL.md` - Reglas DDD estrictas
3. `.agent/skills/neumorphism-design/SKILL.md` - Tokens visuales exactos
4. `CLAUDE.md` - Sección "Module Construction Protocol"

---

## 🎯 FLUJO DE TRABAJO (6 FASES INAMOVIBLES)

```
┌─────────────────────────────────────────────────────────────────┐
│  FASE 1: ANÁLISIS Y PLANIFICACIÓN                               │
│  └─ Leer knowledge base → Crear implementation_plan.md          │
├─────────────────────────────────────────────────────────────────┤
│  FASE 2: DOMINIO (Domain Layer)                                 │
│  └─ Entities + Value Objects + Repositories (interfaces)        │
├─────────────────────────────────────────────────────────────────┤
│  FASE 3: APLICACIÓN (Application Layer)                         │
│  └─ Commands + Queries + Handlers (Result Pattern OBLIGATORIO)  │
├─────────────────────────────────────────────────────────────────┤
│  FASE 4: INFRAESTRUCTURA                                        │
│  └─ Repositorios Drizzle + Externos + Mappers                   │
├─────────────────────────────────────────────────────────────────┤
│  FASE 5: PRESENTACIÓN (UI/UX Neumorphism)                       │
│  └─ Components + Pages + Hooks (Mobile + Desktop)               │
├─────────────────────────────────────────────────────────────────┤
│  FASE 6: VALIDACIÓN Y QC                                        │
│  └─ Tests + TypeScript strict + ESLint + Audit TIER 0           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 FASE 1: PLANIFICACIÓN (Anti-Alucinación)

**[REGLA INQUEBRANTABLE]:** Ningún módulo se construye sin `implementation_plan.md` aprobado.

### Estructura del Plan

```markdown
# Plan de Implementación: [Nombre Módulo]

## 1. Alcance
- **Entidades principales:** [Lista]
- **Casos de uso:** [Lista]
- **Integraciones externas:** [SII, Cortex, etc.]

## 2. Estructura de Directorios
src/modules/{nombre-modulo}/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   └── repositories/
├── application/
│   ├── commands/
│   ├── queries/
│   └── handlers/
├── infrastructure/
│   ├── repositories/
│   └── external/
└── presentation/
    ├── components/
    └── hooks/

## 3. Fases de Implementación
- [ ] Fase 1: Domain (estimado: X horas)
- [ ] Fase 2: Application (estimado: X horas)
- [ ] Fase 3: Infrastructure (estimado: X horas)
- [ ] Fase 4: Presentation (estimado: X horas)
- [ ] Fase 5: Testing + QC (estimado: X horas)

## 4. Riesgos Identificados
- [Riesgo 1]: Mitigación...
```

---

## 🏗️ FASE 2: DOMAIN LAYER (La Base Sólida)

### 2.1 Entity Template

```typescript
// src/modules/{modulo}/domain/entities/{Entidad}.ts
import { z } from 'zod';
import { DomainEvent } from '../events/DomainEvent';

// Schema de validación Zod
export const EntidadSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  nombre: z.string().min(1).max(200),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'PENDIENTE']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type EntidadProps = z.infer<typeof EntidadSchema>;

export class Entidad {
  private constructor(private props: EntidadProps) {
    this.validate();
  }

  // Factory Method - ÚNICA forma de crear instancias
  static create(props: Omit<EntidadProps, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Entidad {
    const now = new Date();
    return new Entidad({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  // Reconstitución desde DB (sin validación estricta)
  static reconstitute(props: EntidadProps): Entidad {
    return new Entidad(props);
  }

  // Validación de invariantes
  private validate(): void {
    const result = EntidadSchema.safeParse(this.props);
    if (!result.success) {
      throw new Error(`Invalid Entidad: ${result.error.message}`);
    }
  }

  // Getters (inmutables)
  get id(): string { return this.props.id; }
  get tenantId(): string { return this.props.tenantId; }
  get nombre(): string { return this.props.nombre; }
  get estado(): string { return this.props.estado; }

  // Comportamiento de dominio (métodos de negocio)
  activar(): Result<Entidad, DomainError> {
    if (this.props.estado === 'ACTIVO') {
      return Result.err(new DomainError('La entidad ya está activa'));
    }
    
    this.props.estado = 'ACTIVO';
    this.props.updatedAt = new Date();
    
    // Registrar evento de dominio
    this.registerEvent(new EntidadActivadaEvent(this.props.id));
    
    return Result.ok(this);
  }

  toJSON(): EntidadProps {
    return { ...this.props };
  }
}
```

### 2.2 Value Object Template

```typescript
// src/modules/{modulo}/domain/value-objects/{NombreVO}.ts
import { z } from 'zod';

export const EmailVOSchema = z.string().email().max(255);

export class EmailVO {
  private readonly _value: string;

  constructor(value: string) {
    const result = EmailVOSchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Email inválido: ${value}`);
    }
    this._value = value.toLowerCase().trim();
  }

  get value(): string { return this._value; }

  equals(other: EmailVO): boolean {
    return this._value === other._value;
  }

  toString(): string { return this._value; }
}
```

### 2.3 Repository Interface

```typescript
// src/modules/{modulo}/domain/repositories/I{Entidad}Repository.ts
import { Entidad } from '../entities/Entidad';

export interface IEntidadRepository {
  findById(id: string, tenantId: string): Promise<Entidad | null>;
  findAll(tenantId: string, pagination: PaginationParams): Promise<Entidad[]>;
  save(entidad: Entidad): Promise<void>;
  update(entidad: Entidad): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  count(tenantId: string, filters?: FilterParams): Promise<number>;
}
```

---

## ⚙️ FASE 3: APPLICATION LAYER (Result Pattern)

### 3.1 Result Pattern (Base)

```typescript
// src/lib/utils/Result.ts
export class Result<T, E = Error> {
  private constructor(
    private readonly _isOk: boolean,
    private readonly _value?: T,
    private readonly _error?: E
  ) {}

  static ok<T>(value: T): Result<T, never> {
    return new Result(true, value);
  }

  static err<E>(error: E): Result<never, E> {
    return new Result(false, undefined, error);
  }

  get isOk(): boolean { return this._isOk; }
  get isErr(): boolean { return !this._isOk; }

  unwrap(): T {
    if (this._isOk) return this._value!;
    throw this._error;
  }

  unwrapOr(defaultValue: T): T {
    return this._isOk ? this._value! : defaultValue;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return this._isOk ? Result.ok(fn(this._value!)) : Result.err(this._error!);
  }
}
```

### 3.2 Command Template

```typescript
// src/modules/{modulo}/application/commands/Crear{Entidad}Command.ts
import { z } from 'zod';
import { Result } from '@/lib/utils/Result';

export const CrearEntidadSchema = z.object({
  tenantId: z.string().uuid(),
  nombre: z.string().min(1).max(200),
  // ... más campos
});

export type CrearEntidadInput = z.infer<typeof CrearEntidadSchema>;

export class CrearEntidadCommand {
  constructor(public readonly input: CrearEntidadInput) {
    const result = CrearEntidadSchema.safeParse(input);
    if (!result.success) {
      throw new ValidationError('Input inválido', result.error);
    }
  }
}
```

### 3.3 Handler Template

```typescript
// src/modules/{modulo}/application/handlers/CrearEntidadHandler.ts
import { Result } from '@/lib/utils/Result';
import { IEntidadRepository } from '../../domain/repositories/IEntidadRepository';
import { Entidad } from '../../domain/entities/Entidad';
import { CrearEntidadCommand } from '../commands/CrearEntidadCommand';

export class CrearEntidadHandler {
  constructor(private readonly repository: IEntidadRepository) {}

  async execute(command: CrearEntidadCommand): Promise<Result<Entidad, AppError>> {
    try {
      // 1. Validar reglas de negocio
      const existente = await this.repository.findByNombre(
        command.input.nombre, 
        command.input.tenantId
      );
      
      if (existente) {
        return Result.err(new BusinessError('Ya existe una entidad con ese nombre'));
      }

      // 2. Crear entidad de dominio
      const entidad = Entidad.create({
        tenantId: command.input.tenantId,
        nombre: command.input.nombre,
        estado: 'ACTIVO',
      });

      // 3. Persistir
      await this.repository.save(entidad);

      // 4. Publicar eventos (si aplica)
      // await this.eventBus.publish(entidad.getEvents());

      return Result.ok(entidad);
    } catch (error) {
      return Result.err(new InfrastructureError('Error al crear entidad', error));
    }
  }
}
```

---

## 🗄️ FASE 4: INFRASTRUCTURE LAYER

### 4.1 Drizzle Repository

```typescript
// src/modules/{modulo}/infrastructure/repositories/EntidadDrizzleRepository.ts
import { db } from '@/lib/db';
import { entidades } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { withTenantContext } from '@/lib/db/tenant-context';
import { IEntidadRepository } from '../../domain/repositories/IEntidadRepository';
import { Entidad } from '../../domain/entities/Entidad';

export class EntidadDrizzleRepository implements IEntidadRepository {
  async findById(id: string, tenantId: string): Promise<Entidad | null> {
    return withTenantContext(tenantId, async () => {
      const row = await db.query.entidades.findFirst({
        where: and(eq(entidades.id, id), eq(entidades.tenantId, tenantId)),
      });
      
      return row ? Entidad.reconstitute(row) : null;
    });
  }

  async save(entidad: Entidad): Promise<void> {
    const data = entidad.toJSON();
    
    await withTenantContext(data.tenantId, async () => {
      await db.insert(entidades).values(data);
    });
  }

  // ... otros métodos
}
```

---

## 🎨 FASE 5: PRESENTATION LAYER (Neumorphism Exacto)

### 5.1 Page Structure Template

```typescript
// src/app/{modulo}/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';

export default function ModuloPage() {
  const [vistaActiva, setVistaActiva] = useState<'lista' | 'detalle' | 'form'>('lista');

  return (
    <main className="min-h-screen bg-[#F0EDE8] p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Nombre del Módulo</h1>
        <NeumorphicButton onClick={() => setVistaActiva('form')}>
          + Nuevo
        </NeumorphicButton>
      </div>

      {/* Content */}
      <NeumorphicCard className="p-6">
        {vistaActiva === 'lista' && <ListaView />}
        {vistaActiva === 'detalle' && <DetalleView />}
        {vistaActiva === 'form' && <FormView />}
      </NeumorphicCard>
    </main>
  );
}
```

### 5.2 Component Neumorphic Template

```typescript
// src/components/ui/neumorphic-card.tsx
import { cn } from '@/lib/utils';

interface NeumorphicCardProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
}

export function NeumorphicCard({ children, className, inset }: NeumorphicCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-[#F0EDE8]',
        inset 
          ? 'shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]'
          : 'shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]',
        className
      )}
    >
      {children}
    </div>
  );
}
```

---

## ✅ FASE 6: CHECKLIST FINAL TIER 0

Antes de declarar "LISTO", verificar:

### Backend (DDD)
- [ ] Domain NO importa de infrastructure/ ni app/
- [ ] Todos los Commands usan Result Pattern
- [ ] Repositorios tienen interfaces en domain/
- [ ] Entities tienen factory methods y validación
- [ ] Value Objects son inmutables
- [ ] No hay `throw` para lógica de negocio

### Seguridad
- [ ] Todas las queries usan `withTenantContext()`
- [ ] Inputs validados con Zod
- [ ] RBAC implementado en endpoints
- [ ] No hay secrets hardcodeados
- [ ] Rate limiting configurado

### UI/UX
- [ ] Fondo `#F0EDE8` en todas las páginas
- [ ] Componentes usan sombras Neumorphism
- [ ] Texto usa `text-gray-800/500/400`
- [ ] Botones `rounded-full`
- [ ] Modales draggable (desktop) / swipeable (mobile)
- [ ] Mobile view existe (`/movil/`)

### Calidad de Código
- [ ] TypeScript compila sin errores (`npm run check`)
- [ ] ESLint pasa sin errores (`npm run lint`)
- [ ] Tests unitarios pasan (`npm run test`)
- [ ] Cobertura >80%
- [ ] No hay `any` o `@ts-ignore`
- [ ] No hay `console.log` en producción

### Documentación
- [ ] Se actualizó `.agent/knowledge/SYSTEM_KNOWLEDGE_BASE.md` con nuevos patrones
- [ ] Se documentaron lecciones aprendidas
- [ ] Se creó/actualizó README del módulo

---

## 🔄 POST-CONSTRUCCIÓN (Obligatorio)

1. **Ejecutar Auditoría:**
   ```bash
   npx tsc --noEmit
   npm run lint
   npm run test
   ```

2. **Actualizar Knowledge Base:**
   - Si encontraste un nuevo patrón útil → Agregar a SYSTEM_KNOWLEDGE_BASE.md
   - Si cometiste un error y lo corregiste → Agregar a LESSONS_LEARNED.md
   - Si mejoraste este skill → Proponer actualización a este archivo

3. **Reportar al CEO Kimi:**
   ```markdown
   ## Módulo [Nombre] Completado
   
   - **Tiempo total:** X horas
   - **Fases completadas:** 6/6
   - **Tests:** X tests, Y% cobertura
   - **Estado:** ✅ Aprobado / 🟡 Necesita revisión
   - **Lecciones agregadas:** [Sí/No]
   ```

---

> **"La excelencia no es un acto, sino una práctica continua documentada."**
> 
> *— Agente CEO Kimi, Silexar Pulse Engineering*
