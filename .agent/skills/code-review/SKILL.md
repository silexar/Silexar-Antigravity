---
name: Code Review
description: Checklist TIER0+ de revisión de código para Silexar Pulse — TypeScript, ESLint, performance, accesibilidad, seguridad, documentación
---

# ✅ Code Review Skill

Checklist exhaustivo de revisión de código que garantiza calidad TIER0+ enterprise en cada cambio de Silexar Pulse Antygravity.

## Cuándo Usar Este Skill

- Antes de hacer commit de cualquier cambio significativo
- Al revisar código generado o modificado
- Al cerrar un feature o módulo
- Como paso previo a deploy

## Checklist TIER0+ de Revisión

### 1. TypeScript — Tipado Estricto

```
[ ] Sin uso de `any` — usar tipos específicos o `unknown`
    - Si es absolutamente necesario: // eslint-disable-next-line @typescript-eslint/no-explicit-any
[ ] Sin `@ts-ignore` — resolver el error en su lugar
[ ] Interfaces/Types definidos para todos los props de componentes
[ ] Return types explícitos en funciones públicas
[ ] Enums o union types para valores predefinidos (no strings mágicos)
[ ] Generics usados apropiadamente para reutilización
```

### 2. ESLint — Zero Warnings

```
[ ] npm run lint — SIN errores ni warnings
[ ] Sin eslint-disable innecesarios
[ ] Variables no usadas removidas o prefijadas con _
[ ] Imports ordenados y sin duplicados
[ ] react-hooks/rules-of-hooks respetado
[ ] react-hooks/exhaustive-deps respetado
```

### 3. Naming Conventions

```
[ ] Componentes React: PascalCase (MiComponente.tsx)
[ ] Hooks: usePascalCase (useEquipoVentas.ts)
[ ] Funciones: camelCase (calcularTotal)
[ ] Constantes: UPPER_SNAKE_CASE (MAX_ITEMS)
[ ] Archivos: kebab-case para utils, PascalCase para componentes
[ ] Variables boolean: con prefijo is/has/can/should (isLoading, hasError)
[ ] Event handlers: con prefijo handle/on (handleClick, onSubmit)
```

### 4. Performance

```
[ ] React.memo() en componentes que reciben props estables y renderizan listas
[ ] useMemo/useCallback para cálculos costosos y callbacks en props
[ ] Lazy loading con React.lazy() para rutas y componentes pesados
[ ] Virtualización (@tanstack/react-virtual) para listas > 50 items
[ ] Imágenes optimizadas (WebP, lazy loading, dimensiones definidas)
[ ] Sin re-renders innecesarios (verificar con React DevTools)
[ ] Debounce/throttle en inputs de búsqueda y scroll handlers
```

### 5. Accesibilidad (a11y)

```
[ ] Semantic HTML (nav, main, article, section, aside, header, footer)
[ ] ARIA labels en elementos interactivos sin texto visible
[ ] role= solo cuando semantic HTML no es suficiente
[ ] Navegación por teclado (Tab, Enter, Escape) funcional
[ ] Focus visible en elementos interactivos
[ ] Color contrast ratio mínimo 4.5:1 (AA level)
[ ] alt="" en imágenes decorativas, alt descriptivo en informativas
```

### 6. Error Handling

```
[ ] Try/catch en operaciones async (fetch, IO, parsing)
[ ] Error Boundaries para secciones de UI independientes
[ ] Estados de error visibles al usuario (no consola silenciosa)
[ ] Validación Zod en inputs del usuario
[ ] Mensajes de error útiles y en español para el usuario final
[ ] Fallbacks para datos faltantes (loading/empty/error states)
[ ] Sin console.log() en producción — usar logger apropiado
```

### 7. Seguridad

```
[ ] Inputs sanitizados antes de usar (ver input-validation skill)
[ ] Sin innerHTML o dangerouslySetInnerHTML sin sanitización
[ ] URLs validadas antes de redirección
[ ] Headers de seguridad configurados (middleware.ts)
[ ] CORS configurado apropiadamente
[ ] Sin secretos hardcodeados en código
```

### 8. Arquitectura DDD

```
[ ] Código en la capa correcta (domain, application, infrastructure, presentation)
[ ] Sin imports cruzados entre módulos
[ ] Domain layer sin dependencias de infraestructura
[ ] Validación en la capa de dominio, no en presentación
[ ] Repository pattern respetado (interfaz en domain, impl en infra)
```

### 9. Documentación

```
[ ] JSDoc en funciones y clases públicas
[ ] README actualizado si cambia la funcionalidad
[ ] Comentarios para lógica compleja o no obvia
[ ] TODO con ticket/issue reference (no TODOs sueltos)
```

### 10. Tests

```
[ ] Test file creado para cada nuevo archivo
[ ] Happy path testeado
[ ] Edge cases testeados (null, vacío, límites)
[ ] Error paths testeados
[ ] npm test pasa sin fallos
```

## Niveles de Severidad

| Nivel           | Acción                         | Ejemplo                            |
| --------------- | ------------------------------ | ---------------------------------- |
| 🔴 **Blocker**  | No se puede mergear            | Vulnerabilidad de seguridad, crash |
| 🟠 **Critical** | Debe corregirse antes de merge | any types, no error handling       |
| 🟡 **Major**    | Corregir en el mismo sprint    | Naming inconsistente, sin tests    |
| 🟢 **Minor**    | Nice-to-have                   | Optimización de performance        |

## Resultado

El review produce uno de estos veredictos:

| Veredicto                         | Significado                                    |
| --------------------------------- | ---------------------------------------------- |
| ✅ **APROBADO**                   | Código listo para merge/deploy                 |
| 🟡 **APROBADO CON OBSERVACIONES** | Merge OK, pero corregir items menores pronto   |
| 🔴 **REQUIERE CAMBIOS**           | Corregir items blocker/critical antes de merge |
