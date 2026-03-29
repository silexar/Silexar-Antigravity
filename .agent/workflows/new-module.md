---
description: Crear un nuevo módulo DDD completo con todas las capas
---

# /new-module — Crear Nuevo Módulo DDD

## Prerequisitos

- Leer el skill de arquitectura DDD: `.agent/skills/architecture-ddd/SKILL.md`
- Tener claro el nombre del módulo y las entidades principales

## Pasos

1. **Definir el nombre del módulo** en kebab-case (ej: `gestion-clientes`)

2. **Crear estructura de carpetas**:

   ```
   src/modules/<nombre-modulo>/
   ├── domain/
   │   ├── entities/
   │   │   └── __tests__/
   │   ├── value-objects/
   │   │   └── __tests__/
   │   └── repositories/
   ├── application/
   │   ├── commands/
   │   │   └── __tests__/
   │   ├── queries/
   │   │   └── __tests__/
   │   └── handlers/
   ├── infrastructure/
   │   ├── repositories/
   │   ├── mappers/
   │   └── api/
   └── presentation/
       ├── components/
       ├── pages/
       └── hooks/
   ```

3. **Crear entidades del dominio** con:
   - Constructor privado
   - Factory method `create` con validación Zod
   - Métodos de negocio
   - Tests unitarios

4. **Crear value objects** necesarios con:
   - Inmutabilidad (readonly)
   - Método `equals`
   - Validación en constructor
   - Tests unitarios

5. **Crear interfaces de repositorios** en `domain/repositories/`:
   - `findById`, `findAll`, `save`, `update`, `delete`, `count`

6. **Crear commands y queries** en `application/`:
   - Un command por cada operación de escritura
   - Un query por cada operación de lectura
   - Validación Zod en cada uno
   - Tests unitarios con mocks

7. **Crear implementaciones de repositorios** en `infrastructure/`:
   - Implementar las interfaces definidas en domain
   - Usar Drizzle ORM o TypeORM según corresponda

8. **Crear componentes de presentación** en `presentation/`:
   - Componentes React con props tipados
   - Hooks específicos del módulo
   - Páginas con estados UX (loading, error, empty)

9. **Verificar checklist de arquitectura** del skill DDD

// turbo 10. **Ejecutar tests** del nuevo módulo:
`bash
    npx vitest run src/modules/<nombre-modulo>
    `

// turbo 11. **Ejecutar lint**:
`bash
    npm run lint -- --no-error-on-unmatched-pattern
    `
