# Snyk Integration - Silexar Pulse

Integración con Snyk para monitoreo continuo de vulnerabilidades en dependencias, código, contenedores e infraestructura.

## Instalación

```bash
# Instalar CLI
npm install -g snyk

# O usar npx
npx snyk

# Autenticar
snyk auth
# Abre navegador para autenticación
```

## Configuración

```bash
# Establecer variables de entorno
export SNYK_TOKEN=<tu-token>
export SNYK_SLACK_WEBHOOK=<webhook-url>
export SNYK_ORG=<tu-organizacion>
```

## Uso

### Escaneo de Dependencias
```bash
# Escaneo de package.json
snyk test

# Escaneo con reporte JSON
snyk test --json > snyk-report.json

# Escaneo de producción solo
snyk test --production

# Escaneo con severidad mínima
snyk test --severity-threshold=high
```

### Monitoreo Continuo
```bash
# Monitorear proyecto
snyk monitor

# Monitorear con tags
snyk monitor --tags=tier0,production
```

### Escaneo de Código
```bash
# Escaneo de código fuente
snyk code test

# Con reporte SARIF
snyk code test --sarif > snyk-code.sarif
```

### Escaneo de Contenedores
```bash
# Escaneo de imagen Docker
snyk container test silexar-pulse:latest

# Monitorear imagen
snyk container monitor silexar-pulse:latest
```

### Escaneo de IaC
```bash
# Escaneo de Terraform
snyk iac test terraform/

# Escaneo de Kubernetes
snyk iac test k8s/
```

## Comandos para Silexar Pulse

```bash
# Auditoría completa con Snyk
npm run security:snyk:test           # Test de dependencias
npm run security:snyk:code           # Test de código
npm run security:snyk:container      # Test de contenedor
npm run security:snyk:iac            # Test de IaC
npm run security:snyk:monitor        # Iniciar monitoreo
npm run security:snyk:all            # Todo
```

## Integración CI/CD

```yaml
# .github/workflows/snyk.yml
name: Snyk Security Scan

on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: '0 9 * * 1'  # Semanal

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Snyk dependency scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
      
      - name: Snyk code scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          command: code test
          args: --severity-threshold=medium
      
      - name: Upload to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: snyk-code.sarif
```

## Características

### Monitoreo Continuo
- Escaneo automático en cada push
- Alertas en tiempo real
- Dashboard web
- API para integraciones

### Fix Automático
- PRs automáticos con fixes
- Patches de seguridad
- Actualizaciones de dependencias
- Revisión requerida antes de merge

### Reportes
- Dashboard visual
- Reportes PDF/HTML
- Integración con JIRA
- Notificaciones Slack/email

### Políticas de Licencias
- Detección de licencias incompatibles
- Políticas personalizables
- Reportes de cumplimiento

## Dashboard

Accede al dashboard en: https://app.snyk.io/org/YOUR_ORG/projects

## Integración con Slack

```yaml
# Configurar en snyk-config.yml
slack:
  webhook: ${SNYK_SLACK_WEBHOOK}
  channel: '#security-alerts'
  severityThreshold: high
```

## Políticas de Severidad

| Severidad | CVSS Score | Acción |
|-----------|------------|--------|
| CRITICAL | 9.0-10.0 | Bloquea deploy, alerta inmediata |
| HIGH | 7.0-8.9 | PR automático, alerta inmediata |
| MEDIUM | 4.0-6.9 | PR semanal, alerta diaria |
| LOW | 0.1-3.9 | Reporte mensual |

## Comandos Útiles

```bash
# Ver ignore list
snyk ignore --list

# Ignorar vulnerabilidad
snyk ignore --id=SNYK-JS-PACKAGE-123 --reason="No exploitable"

# Ver políticas
snyk policy

# Exportar reporte
snyk test --json | snyk-to-html -o report.html

# Ver ayuda
snyk --help
snyk test --help
```

---

*Snyk Integration v3.0.0 - Fort Knox Edition*
