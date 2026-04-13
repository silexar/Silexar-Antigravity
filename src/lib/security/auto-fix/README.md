# 🔒 Sistema de Auto-Corrección de Seguridad - Silexar Pulse

Sistema inteligente de detección y corrección automática de issues de seguridad en código TypeScript/JavaScript.

## Características

- 🔍 **Detección automática** de 12 tipos de issues de seguridad
- 🤖 **Auto-fix inteligente** con aprendizaje de patrones
- 📊 **Reportes detallados** en múltiples formatos (JSON, Markdown, HTML, Console)
- 🧠 **Sistema de aprendizaje** que mejora con cada corrección
- 💾 **Backups automáticos** antes de modificar archivos
- 🔄 **Integración CI/CD** lista para usar

## Instalación Rápida

El sistema ya está incluido en el proyecto. Solo necesitas:

```bash
# Asegurar que glob está instalado
npm install glob

# Ejecutar setup inicial
npm run security:autofix -- info
```

## Uso

### CLI

```bash
# Escanear archivos
npm run security:scan

# Aplicar correcciones automáticas
npm run security:autofix

# Verificar sin aplicar cambios (CI/CD)
npm run security:check

# Generar reporte HTML
npx tsx scripts/security-autofix/cli.ts report --format html --output report.html
```

### Programático

```typescript
import { SecurityAutoFixer } from '@/lib/security/auto-fix';

const fixer = new SecurityAutoFixer({
  include: ['src/**/*.ts'],
  autoFixHigh: true,
  autoFixLow: true,
  enableLearning: true,
});

// Escanear
const results = await fixer.scan();

// Aplicar fixes
const result = await fixer.run({ dryRun: false });
console.log(`Fixed ${result.issuesFixed} issues`);
```

## Tipos de Issues Detectados

### 🔴 HIGH (Auto-fix inmediato)
- `console_sensitive_data`: Console.log con datos sensibles
- `hardcoded_secret`: Secretos hardcodeados
- `sql_injection_risk`: Riesgos de SQL injection
- `xss_vulnerability`: Vulnerabilidades XSS

### 🟡 MEDIUM (Sugerir fix)
- `as_any_cast`: Uso de `as any`
- `insecure_random`: Math.random en contexto criptográfico
- `missing_validation`: Inputs sin validación
- `unsafe_regex`: Expresiones regulares peligrosas

### 🔵 LOW (Auto-fix opcional)
- `unused_import`: Imports no utilizados
- `unused_variable`: Variables no utilizadas
- `weak_crypto`: Algoritmos criptográficos débiles
- `prototype_pollution`: Riesgos de prototype pollution

## Estrategias de Corrección

### Console.log con Datos Sensibles
```typescript
// ANTES
console.log('Password:', user.password);

// DESPUÉS
auditLogger.security("Datos sensibles detectados en log", { 
  context: "Password", 
  data: "[REDACTED]" 
});
```

### Uso de `as any`
```typescript
// ANTES
const data = response as any;

// DESPUÉS
const data = response /* @ts-expect-error: tipo temporal */;
```

### Imports No Usados
```typescript
// ANTES
import { useState, useEffect } from 'react';
// useEffect nunca se usa

// DESPUÉS
import { useState } from 'react';
```

## Configuración

```typescript
interface AutoFixConfig {
  // Directorios a escanear
  include: string[];
  
  // Directorios a ignorar
  exclude: string[];
  
  // Auto-fix por severidad
  autoFixHigh: boolean;    // default: true
  autoFixMedium: boolean;  // default: false
  autoFixLow: boolean;     // default: true
  
  // Opciones avanzadas
  requireConfirmation: boolean;  // default: false
  createBackup: boolean;         // default: true
  minConfidenceThreshold: number; // default: 0.75
  enableLearning: boolean;       // default: true
}
```

## Sistema de Aprendizaje

El sistema aprende de las correcciones exitosas y mejora con el tiempo:

```typescript
import { SecurityLearning } from '@/lib/security/auto-fix';

const learning = new SecurityLearning();
await learning.initialize();

// Registrar corrección exitosa
await learning.recordSuccess(issue, originalCode, fixedCode);

// Obtener sugerencia basada en patrones aprendidos
const suggestion = await learning.getSuggestion(issue);

// Ver estadísticas
const stats = await learning.getStatistics();
console.log(`Patrones aprendidos: ${stats.totalPatterns}`);
```

## Integración CI/CD

### GitHub Actions

```yaml
name: Security Check
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run security:check
```

### Pre-commit Hook

El hook ya está configurado en `.husky/pre-commit`. Verifica issues HIGH antes de cada commit.

## Scripts npm

Agrega a tu `package.json`:

```json
{
  "scripts": {
    "security:scan": "tsx scripts/security-autofix/cli.ts scan",
    "security:autofix": "tsx scripts/security-autofix/cli.ts fix",
    "security:check": "tsx scripts/security-autofix/cli.ts check",
    "security:report": "tsx scripts/security-autofix/cli.ts report --format html --output security-report.html"
  }
}
```

## Reportes

### Markdown (default)
```bash
npx tsx scripts/security-autofix/cli.ts report --format markdown
```

### HTML
```bash
npx tsx scripts/security-autofix/cli.ts report --format html --output report.html
```

### JSON
```bash
npx tsx scripts/security-autofix/cli.ts report --format json --output report.json
```

### Console
```bash
npx tsx scripts/security-autofix/cli.ts report --format console
```

## Backups

Los backups se crean automáticamente antes de cada modificación:

```bash
# Limpiar backups antiguos (> 24h)
npx tsx scripts/security-autofix/cli.ts backup clean

# Limpiar backups antiguos (> 48h)
npx tsx scripts/security-autofix/cli.ts backup clean --maxAge 48

# Restaurar desde backup
npx tsx scripts/security-autofix/cli.ts backup restore --file src/test.ts
```

## Testing

```bash
# Ejecutar tests
npm test -- src/lib/security/auto-fix/__tests__

# Tests específicos
npm test -- FixStrategies.test.ts
npm test -- SecurityLearning.test.ts
npm test -- SecurityAutoFixer.test.ts
```

## Contribuir

Para agregar una nueva estrategia de corrección:

1. Define la estrategia en `FixStrategies.ts`
2. Implementa `detect()` y `fix()`
3. Agrega tests en `__tests__/FixStrategies.test.ts`
4. Actualiza la documentación

Ejemplo:

```typescript
{
  name: 'mi-nueva-estrategia',
  description: 'Descripción de lo que hace',
  severity: 'MEDIUM',
  autoFixable: true,
  requiresConfirmation: false,
  detect: (filePath, content) => {
    // Retornar array de SecurityIssue
  },
  fix: (issue, content) => {
    // Retornar código corregido o null
  },
}
```

## Licencia

MIT - Silexar Security Team
