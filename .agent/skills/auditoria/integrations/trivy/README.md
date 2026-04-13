# Trivy Integration - Silexar Pulse

Integración con Trivy para escaneo de vulnerabilidades en contenedores, dependencias, secrets e infraestructura.

## Instalación

```bash
# macOS/Linux
brew install aquasecurity/trivy/trivy

# Windows
choco install trivy
# o
scoop install trivy

# Docker
docker pull aquasec/trivy
```

## Uso

### Escaneo de Sistema de Archivos
```bash
# Escaneo completo
trivy fs --config trivy-config.yaml .

# Solo vulnerabilidades críticas y altas
trivy fs --severity CRITICAL,HIGH .

# Generar reporte SARIF
trivy fs --format sarif --output trivy-fs.sarif .
```

### Escaneo de Imagen Docker
```bash
# Construir imagen
docker build -t silexar-pulse:latest .

# Escanear imagen
trivy image --config trivy-config.yaml silexar-pulse:latest

# Escanear imagen base
trivy image node:20-alpine
```

### Escaneo de Repositorio Git
```bash
# Escanear repo remoto
trivy repo https://github.com/silexar/pulse

# Escanear repo local
trivy repo .
```

### Escaneo de Configuraciones IaC
```bash
# Terraform
trivy config --severity HIGH,CRITICAL terraform/

# Kubernetes
trivy config k8s/

# Docker
trivy config Dockerfile
```

## Comandos para Silexar Pulse

```bash
# Auditoría completa con Trivy
npm run security:trivy:fs          # Sistema de archivos
npm run security:trivy:image       # Imagen Docker
npm run security:trivy:config      # Configuraciones IaC
npm run security:trivy:all         # Todo
```

## Integración CI/CD

```yaml
# .github/workflows/trivy.yml
name: Trivy Security Scan

on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: '0 0 * * 1'  # Semanal

jobs:
  trivy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Trivy filesystem scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-fs.sarif'
          severity: 'CRITICAL,HIGH'
      
      - name: Run Trivy config scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'config'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-config.sarif'
      
      - name: Upload to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-fs.sarif'
```

## Tipos de Escaneo

| Tipo | Comando | Qué escanea |
|------|---------|-------------|
| Filesystem | `trivy fs .` | Dependencias npm, código fuente |
| Image | `trivy image <name>` | Imagen Docker completa |
| Repository | `trivy repo <url>` | Repositorio Git remoto |
| Config | `trivy config .` | Terraform, K8s, Docker |
| Filesystem Secrets | `trivy fs --scanners secret .` | Secrets hardcodeados |

## Severidades

| Severidad | Peso | Acción |
|-----------|------|--------|
| CRITICAL | 10 | Bloquea deploy |
| HIGH | 5 | Debe corregirse |
| MEDIUM | 2 | Recomendado |
| LOW | 1 | Opcional |
| UNKNOWN | 0 | Revisar |

## Reglas Personalizadas

### Secrets (5 reglas)
- `silexar-openai-key` - OpenAI API keys
- `silexar-stripe-key` - Stripe secret keys
- `silexar-supabase-key` - Supabase JWTs
- `silexar-jwt-secret` - JWT secrets

### Misconfigurations
- Docker: No root, no latest tag
- Terraform: No open security groups
- K8s: Resource limits, security contexts

## Reportes

```bash
# Tabla (default)
trivy fs .

# JSON
trivy fs --format json -o report.json .

# SARIF (GitHub)
trivy fs --format sarif -o report.sarif .

# HTML
trivy fs --format html -o report.html .
```

---

*Trivy Integration v3.0.0 - Fort Knox Edition*
