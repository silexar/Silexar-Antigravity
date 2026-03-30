---
description: Ejecutar tests y verificar cobertura de código
---

# /test — Ejecutar Tests y Cobertura

## Pasos

// turbo

1. **Ejecutar todos los tests**:

   ```bash
   npm test -- --run
   ```

2. **Si hay fallos**, investigar y corregir. Leer el skill de testing para patrones:
   - Ruta: `.agent/skills/testing/SKILL.md`

// turbo 3. **Ejecutar tests con cobertura**:

```bash
npm run test:coverage
```

4. **Verificar umbrales de cobertura**:
   - Global: ≥80% (branches, functions, lines, statements)
   - UI (`src/components/ui/`): ≥90%
   - Hooks (`src/hooks/`): ≥95%
   - Lib (`src/lib/`): ≥85%

5. **Si la cobertura es insuficiente**, crear tests adicionales siguiendo los templates del skill de testing

6. **Para un módulo específico** (opcional):

   ```bash
   npx vitest run src/modules/<nombre-modulo> --coverage
   ```

7. **Para UI interactiva de tests** (opcional):
   ```bash
   npm run test:ui
   ```
