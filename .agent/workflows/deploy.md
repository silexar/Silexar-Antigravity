---
description: Proceso de despliegue seguro a producción
---

# /deploy — Deploy a Producción

## Pre-deploy Checklist

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

4. **Revisar que no hay secretos hardcodeados**:

   ```bash
   grep -rn "apiKey\|secret\|password\|token" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v ".test." | grep -v "type\|interface\|Schema"
   ```

5. **Verificar variables de entorno** están configuradas:
   - Comparar `.env.production.example` con las variables reales en Vercel

## Build

// turbo 6. **Build de producción**:

```bash
npm run build:deploy
```

7. **Verificar que build fue exitoso** (sin errores)

## Deploy

8. **Deploy vía Vercel CLI** (si está configurado):

   ```bash
   npx vercel --prod
   ```

   O alternativamente, push a la rama `main` para deploy automático.

## Post-deploy

9. **Verificar que el sitio está online** visitando la URL de producción

10. **Verificar logs** en Vercel dashboard por errores de runtime

11. **Ejecutar auditoría de seguridad post-deploy** (opcional):
    - Usar el workflow `/audit`
