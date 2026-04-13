# 🔐 Security Monitoring Scripts - Silexar Pulse

Scripts de monitoreo continuo de seguridad para el proyecto Silexar Pulse.

## Scripts Disponibles

### 1. `continuous-security-scan.js`

Escaneo continuo de seguridad para desarrollo.

**Uso:**
```bash
# Ejecución única
npm run security:scan

# Modo watch (cada 5 minutos + cambios en tiempo real)
npm run security:watch

# Directo con Node
node scripts/security-monitoring/continuous-security-scan.js
node scripts/security-monitoring/continuous-security-scan.js watch
```

**Funcionalidad:**
- Detecta nuevos `console.log` en el código
- Identifica archivos sin validación de inputs
- Reporta cambios en archivos críticos de seguridad
- Notificaciones en terminal
- Guarda estado entre ejecuciones en `.security-scan-state.json`

---

### 2. `security-health-check.js`

Verificación completa del estado de seguridad del sistema.

**Uso:**
```bash
# Modo interactivo
npm run security:health

# Modo CI/CD (output mínimo)
npm run security:health:ci

# Directo con Node
node scripts/security-monitoring/security-health-check.js
node scripts/security-monitoring/security-health-check.js --ci
```

**Códigos de salida:**
- `0` = Todos los checks pasaron ✅
- `1` = Uno o más checks críticos fallaron ❌

**Checks realizados:**
- Variables de entorno configuradas correctamente
- Headers de seguridad funcionando
- Conexión a Redis (rate limiting)
- Integridad de archivos de seguridad
- Protección de archivos `.env` en `.gitignore`

---

### 3. `auto-fix-security.js`

Auto-corrección de problemas menores de seguridad.

**Uso:**
```bash
# Modo dry-run (solo mostrar cambios)
npm run security:fix:dry

# Aplicar correcciones
npm run security:fix

# Directo con Node
node scripts/security-monitoring/auto-fix-security.js --dry-run
node scripts/security-monitoring/auto-fix-security.js --verbose
node scripts/security-monitoring/auto-fix-security.js
```

**Correcciones aplicadas:**
- Eliminar `console.log` de debug
- Formatear código con Prettier (si está disponible)
- Sugerir validaciones faltantes

**Opciones:**
- `--dry-run`: Solo mostrar cambios sin aplicarlos
- `--verbose`: Mostrar información detallada
- `--no-format`: No ejecutar Prettier después de los cambios

**Nota:** No modifica lógica de negocio, solo estilo/debug.

---

### 4. `security-metrics-collector.js`

Calcula score de seguridad y trackea tendencias.

**Uso:**
```bash
# Dashboard en terminal
npm run security:metrics

# Exportar a JSON
npm run security:metrics:export security-metrics.json

# Directo con Node
node scripts/security-monitoring/security-metrics-collector.js --dashboard
node scripts/security-monitoring/security-metrics-collector.js --dashboard --watch
node scripts/security-monitoring/security-metrics-collector.js --export metrics.json
```

**Métricas calculadas:**
- Security Score (0-100)
- Vulnerabilidades por severidad (critical, high, medium, low)
- Archivos con/sin issues
- Features de seguridad implementados
- Tendencias históricas

**Pesos del Score:**
- No console logs: 20 puntos
- Input validation: 20 puntos
- Auth middleware: 15 puntos
- Rate limiting: 15 puntos
- Environment security: 15 puntos
- Error handling: 10 puntos
- Dependency security: 5 puntos

---

## Comando Consolidado

Ejecutar todos los checks de seguridad:

```bash
npm run security:all
```

Esto ejecuta:
1. `security:health`
2. `security:scan`
3. `security:metrics`

---

## Integración CI/CD

### GitHub Actions

```yaml
- name: Security Health Check
  run: npm run security:health:ci

- name: Security Scan
  run: npm run security:scan
```

### Pre-commit Hook

Agregar a `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Security check
npm run security:health:ci || exit 1
npm run security:scan || exit 1
```

---

## Requisitos

- Node.js 18+
- Sistema de archivos con permisos de lectura/escritura
- Prettier (opcional, para formateo automático)

---

## Cross-Platform

Todos los scripts funcionan en:
- ✅ Windows (PowerShell/CMD)
- ✅ macOS
- ✅ Linux

---

## Archivos Generados

| Archivo | Descripción |
|---------|-------------|
| `.security-scan-state.json` | Estado del escaneo continuo |
| `security-metrics-history.json` | Historial de métricas |
| `security-fix-report.json` | Reporte de correcciones aplicadas |

---

## Autor

SILEXAR Security Team
