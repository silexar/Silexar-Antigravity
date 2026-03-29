---
description: Checklist de revisión de código antes de merge o deploy
---

# /code-review — Revisión de Código

## Prerequisitos

- Leer el skill de code review: `.agent/skills/code-review/SKILL.md`

## Pasos

// turbo

1. **Verificar compilación TypeScript**:
   ```bash
   npx tsc --noEmit --pretty 2>&1 | head -50
   ```

// turbo 2. **Ejecutar ESLint**:

```bash
npm run lint 2>&1 | tail -20
```

// turbo 3. **Ejecutar tests**:

```bash
npm test -- --run 2>&1 | tail -30
```

4. **Aplicar checklist TIER0+** del skill de code review:
   - TypeScript tipado estricto
   - Naming conventions
   - Performance (memo, lazy, virtualización)
   - Accesibilidad (ARIA, semantic HTML)
   - Error handling (try/catch, Zod, estados UX)
   - Seguridad (sanitización, no secretos)
   - Arquitectura DDD (capas correctas, no imports cruzados)

5. **Revisar documentación**:
   - JSDoc en funciones públicas
   - Comentarios en lógica compleja

6. **Emitir veredicto**:
   - ✅ APROBADO — listo para merge
   - 🟡 APROBADO CON OBSERVACIONES — merge OK, corregir pronto
   - 🔴 REQUIERE CAMBIOS — corregir antes de merge
