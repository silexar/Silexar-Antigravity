# Semgrep Integration - Silexar Pulse

Integración con Semgrep para análisis estático de seguridad con reglas personalizadas.

## Instalación

```bash
# Instalar Semgrep
pip install semgrep
# o
brew install semgrep
# o
docker pull returntocorp/semgrep
```

## Uso

```bash
# Ejecutar con reglas Silexar
semgrep --config=.agent/skills/security-audit/integrations/semgrep/semgrep-config.yml src/

# Incluir en CI
semgrep --config=semgrep-config.yml --error src/

# Generar reporte JSON
semgrep --config=semgrep-config.yml --json --output=semgrep-report.json src/

# Generar reporte SARIF
semgrep --config=semgrep-config.yml --sarif --output=semgrep-report.sarif src/
```

## Reglas Personalizadas (25+)

### Críticas (Bloquean deploy)
1. `silexar-no-secrets-hardcoded` - No secrets en código
2. `silexar-no-eval` - No eval/new Function
3. `silexar-no-dangerouslySetInnerHTML` - No XSS
4. `silexar-no-raw-sql` - No SQL injection
5. `silexar-no-console-log-api` - No console.log en APIs

### Altas (Deben corregirse)
6. `silexar-no-any-in-security` - No any en código de seguridad
7. `silexar-no-ts-ignore` - No @ts-ignore
8. `silexar-no-non-null-assertion` - No non-null assertions
9. `silexar-no-missing-zod-validation` - Validación Zod obligatoria
10. `silexar-no-innerHTML` - No innerHTML sin sanitizar
11. `silexar-ai-no-prompt-concatenation` - No concatenación de prompts
12. `silexar-ai-require-input-filter` - Filtro de input obligatorio
13. `silexar-ai-require-tenant-context` - Contexto de tenant obligatorio
14. `silexar-auth-require-getUserContext` - Auth en API routes
15. `silexar-auth-require-permission-check` - RBAC en mutations

### Medias y Bajas
16. `silexar-error-no-raw-exposure` - No exponer errores crudos
17. `silexar-error-require-try-catch` - Try-catch obligatorio
18. `silexar-code-no-floating-promises` - No floating promises
19. `silexar-code-no-magic-numbers` - No magic numbers
20. `silexar-react-no-key-index` - No index como key
21. `silexar-react-no-effect-without-cleanup` - Cleanup en effects
22. `silexar-docker-no-root` - No root en Docker

## Integración con CI/CD

```yaml
# .github/workflows/semgrep.yml
name: Semgrep Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  semgrep:
    runs-on: ubuntu-latest
    container:
      image: returntocorp/semgrep
    steps:
      - uses: actions/checkout@v4
      - run: semgrep --config=.agent/skills/security-audit/integrations/semgrep/semgrep-config.yml --error src/
```

## Puntuación

| Severidad | Peso |
|-----------|------|
| ERROR | 10 pts |
| WARNING | 5 pts |
| INFO | 1 pt |

Score máximo: 100 pts

---

*Integración Semgrep v3.0.0 - Fort Knox Edition*
