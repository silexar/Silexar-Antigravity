---
name: Input Validation
description: Patrones de validación y sanitización de datos para Silexar Pulse — Zod schemas, React Hook Form, class-validator, sanitización XSS/SQLi
---

# 🛡️ Input Validation Skill

Patrones estándar de validación y sanitización de datos en todas las capas de Silexar Pulse Antygravity.

## Cuándo Usar Este Skill

- Al crear formularios o inputs de usuario
- Al definir schemas de API (request/response)
- Al crear entidades o value objects de dominio
- Al procesar datos de fuentes externas

## Archivos Existentes

- `src/lib/security/input-validation.ts` — Funciones de validación base
- `src/lib/security/input-validator.ts` — Validador avanzado con reglas
- `src/lib/security/password-security.ts` — Reglas de contraseñas

## Principio Fundamental

> **Nunca confíes en datos del usuario.** Valida en CADA capa donde los datos entran.

```
[Usuario] → [Presentación: RHF + Zod] → [Application: Zod schema] → [Domain: entity validation] → [Infrastructure: DB constraints]
```

## Capa 1: Frontend — React Hook Form + Zod

### Schema de Formulario

```typescript
import { z } from "zod";

// Definir schema de validación
export const crearEquipoSchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .trim()
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]+$/, "Solo letras, espacios y guiones"),

  email: z.string().email("Email inválido").toLowerCase().trim(),

  telefono: z
    .string()
    .regex(/^\+?[0-9]{8,15}$/, "Formato de teléfono inválido")
    .optional(),

  monto: z
    .number()
    .positive("El monto debe ser positivo")
    .max(999999999, "Monto excede el límite"),

  fechaInicio: z.date().min(new Date(), "La fecha debe ser futura"),

  estado: z.enum(["activo", "inactivo", "suspendido"]),

  tags: z
    .array(z.string().trim().min(1))
    .max(10, "Máximo 10 tags")
    .optional()
    .default([]),
});

export type CrearEquipoInput = z.infer<typeof crearEquipoSchema>;
```

### Uso en Componente React

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { crearEquipoSchema, type CrearEquipoInput } from './schemas';

function CrearEquipoForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<CrearEquipoInput>({
    resolver: zodResolver(crearEquipoSchema),
    defaultValues: {
      estado: 'activo',
      tags: [],
    },
  });

  const onSubmit = async (data: CrearEquipoInput) => {
    // 'data' ya está validado y tipado
    await crearEquipo(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('nombre')} />
      {errors.nombre && <span className="text-red-500">{errors.nombre.message}</span>}
      {/* ... */}
    </form>
  );
}
```

## Capa 2: Application — Validación en Commands/Queries

```typescript
import { z } from "zod";

const crearEquipoCommandSchema = z.object({
  nombre: z.string().min(3).max(100).trim(),
  responsableId: z.string().uuid(),
  meta: z.number().positive(),
});

export class CrearEquipoCommand {
  async execute(input: unknown): Promise<Equipo> {
    // Validar SIEMPRE, aunque venga del frontend
    const validated = crearEquipoCommandSchema.parse(input);

    const equipo = Equipo.create({
      nombre: validated.nombre,
      responsableId: validated.responsableId,
      meta: validated.meta,
    });

    await this.repo.save(equipo);
    return equipo;
  }
}
```

## Capa 3: Domain — Validación en Entidades

```typescript
export class Equipo {
  static create(props: CrearEquipoProps): Equipo {
    // Invariantes de dominio
    if (!props.nombre || props.nombre.trim().length < 3) {
      throw new DomainError("Nombre de equipo inválido");
    }
    if (props.meta <= 0) {
      throw new DomainError("La meta debe ser positiva");
    }
    // ...crear entidad
  }
}
```

## Sanitización de Strings

### Contra XSS

```typescript
/**
 * Sanitiza string para prevenir XSS
 * Usar SIEMPRE antes de renderizar contenido dinámico
 */
export function sanitizeForXSS(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}
```

### Contra SQL Injection

```typescript
/**
 * NOTA: Usar SIEMPRE queries parametrizadas con Drizzle/TypeORM.
 * Esta función es un safety net adicional, NO un reemplazo.
 */
export function sanitizeForSQL(input: string): string {
  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/;/g, "") // Remove semicolons
    .replace(/--/g, "") // Remove SQL comments
    .replace(/\/\*/g, "") // Remove block comments
    .replace(/xp_/gi, "") // Remove dangerous procs
    .replace(/UNION\s+SELECT/gi, "") // Remove UNION attacks
    .trim();
}
```

### Contra Path Traversal

```typescript
export function sanitizePath(input: string): string {
  return input
    .replace(/\.\./g, "") // Remove directory traversal
    .replace(/\0/g, "") // Remove null bytes
    .replace(/[<>:"|?*]/g, ""); // Remove invalid path chars (Windows)
}
```

## Validación de Archivos

```typescript
const archivoSchema = z.object({
  nombre: z.string().min(1).max(255),
  tipo: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "audio/mpeg",
    "audio/wav",
  ]),
  tamaño: z.number().max(50 * 1024 * 1024, "Archivo excede 50MB"),
});

export function validarArchivo(file: File): {
  valido: boolean;
  error?: string;
} {
  const result = archivoSchema.safeParse({
    nombre: file.name,
    tipo: file.type,
    tamaño: file.size,
  });

  if (!result.success) {
    return { valido: false, error: result.error.errors[0]?.message };
  }
  return { valido: true };
}
```

## Patrón de Error Unificado

```typescript
// Error unificado para validación
export class ValidationError extends Error {
  constructor(
    public readonly campo: string,
    public readonly mensaje: string,
    public readonly codigo: string = "VALIDATION_ERROR",
  ) {
    super(mensaje);
    this.name = "ValidationError";
  }
}

// Error de dominio
export class DomainError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "DomainError";
  }
}

// Response estandarizado para API
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}
```

## Reglas

1. **Validar en CADA capa** — no asumir que otra capa ya validó
2. **Zod como estándar** — usar para schemas de validación en frontend y backend
3. **Mensajes en español** — para el usuario final
4. **Nunca usar `dangerouslySetInnerHTML`** sin sanitización previa
5. **Queries parametrizadas SIEMPRE** — nunca concatenar valores en SQL
6. **Validar archivos** antes de procesarlos (tipo, tamaño, nombre)
7. **Trim TODOS los strings** entrantes
