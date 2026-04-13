# Integración con Audit System (15 Fases)

Este documento describe cómo el skill `security-audit` se integra con el skill `audit-system` de 15 fases.

## Diagrama de Integración

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUDIT SYSTEM (15 Fases)                             │
│                                                                             │
│  F1: Estructura          F6: Conexiones         F11: Calidad Código        │
│  F2: Arquitectura DDD    F7: Testing            F12: DevOps                │
│  F3: Frontend            F8: Error Handling     F13: Observabilidad        │
│  F4: Seguridad ◄─────────F9: Performance        F14: Data Layer            │
│       │                  F10: Accesibilidad     F15: Agente Operador       │
│       │                                                                     │
│       │         SECURITY AUDIT SKILL (v3.0)                                 │
│       │                      │                                              │
│       └──────────────────────┼──────────────────────────────────────────────┘
│                              │                                              │
│                    ┌─────────▼──────────┐                                   │
│                    │  AGENT COORDINATOR  │                                   │
│                    │  (AC)               │                                   │
│                    └─────────┬───────────┘                                   │
│                              │                                              │
│         ┌────────────────────┼────────────────────┐                         │
│         │                    │                    │                         │
│    ┌────▼────┐         ┌────▼─────┐       ┌──────▼──────┐                  │
│    │   AS    │         │   ASE    │       │   ASAST     │                  │
│    │ Static  │         │ Secrets  │       │   SAST      │                  │
│    └────┬────┘         └────┬─────┘       └──────┬──────┘                  │
│         │                   │                    │                         │
│         └───────────────────┴────────────────────┘                         │
│                             │                                              │
│                    ┌────────▼────────┐                                     │
│                    │  CONSOLIDATION  │                                     │
│                    │                 │                                     │
│                    │  Hallazgos ────►│────► F4 (Seguridad)                 │
│                    │  de calidad ───►│────► F11 (Calidad Código)           │
│                    │  de datos ─────►│────► F14 (Data Layer)               │
│                    └─────────────────┘                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Modos de Integración

### Modo 1: Auditoría Completa (Full Stack)

Cuando el usuario solicita "auditoría completa del sistema":

```yaml
Ejecución:
  1. audit-system ejecuta las 15 fases
  2. En F4 (Seguridad), delega a security-audit
  3. security-audit ejecuta sus 6 agentes
  4. Hallazgos de seguridad se integran en F4
  5. Hallazgos de calidad de código se integran en F11
  6. Hallazgos de datos se integran en F14
  7. Informe final consolidado

Comando:
  /audit full
  # o
  npm run audit:full
```

### Modo 2: Auditoría de Seguridad Especializada

Cuando el usuario solicita "auditoría de seguridad":

```yaml
Ejecución:
  1. Solo security-audit se ejecuta
  2. Pero usa los checks de F4, F11 (security), F14 de audit-system
  3. Reporte enfocado exclusivamente en seguridad

Comando:
  npm run security:audit
```

### Modo 3: Pre-commit Hook

Antes de cada commit:

```yaml
Ejecución:
  1. security-audit modo rápido (< 30 segundos)
  2. Solo agentes ASE y ASAST
  3. Solo archivos modificados (staged)
  4. Bloquea commit si hay secrets o vulnerabilidades críticas

Comando:
  npm run security:precommit
```

## Mapeo de Hallazgos

### Hallazgos de Security Audit → Fases de Audit System

| Hallazgo Security Audit | Fase Destino | Check Específico |
|------------------------|--------------|------------------|
| Secrets hardcodeados | F4 (Seguridad) | D5 - Secret Detection |
| OWASP A01-A10 | F4 (Seguridad) | D1 - OWASP Top 10 |
| Capas AI L1-L8 | F4 (Seguridad) | D3 - 8 Capas AI |
| Defense D1-D8 | F4 (Seguridad) | D4 - Defense in Depth |
| SAST vulnerabilities | F4 (Seguridad) | D6 - SAST |
| Infra security issues | F12 (DevOps) | D8 - Infrastructure |
| any en código | F11 (Calidad) | 11F - Type Safety |
| Non-null assertions | F11 (Calidad) | 11F - Type Safety |
| @ts-ignore | F5 (TypeScript) | 5C - Anti-patterns |
| DB sin RLS | F14 (Data) | 14D - Seguridad de Datos |
| Queries sin limit | F14 (Data) | 14B - Optimización |
| N+1 queries | F14 (Data) | 14B - Optimización |

## Formato de Intercambio

### Hallazgo de Security Audit (entrada)

```typescript
interface SecurityFinding {
  id: string;
  agent: 'AS' | 'ASE' | 'ASAST' | 'AD' | 'AIAC';
  dimension: string; // D1-D15
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  file: string;
  line: number;
  message: string;
  snippet: string;
  remediation: string;
  owasp?: string;
  cwe?: string;
}
```

### Hallazgo consolidado en Audit System (salida)

```typescript
interface ConsolidatedFinding {
  id: string;
  phase: 'F4' | 'F11' | 'F14' | 'F12';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  file: string;
  line: number;
  description: string;
  originalFinding: SecurityFinding;
  remediation: string;
  effort: 'QUICK' | 'MEDIUM' | 'LARGE';
}
```

## Casos de Uso

### UC1: PR Review con Security Focus

```yaml
Trigger: Pull Request creado

Acciones:
  1. GitHub Action ejecuta security-audit
  2. Agente ASE escanea secrets en archivos modificados
  3. Agente ASAST escanea vulnerabilidades
  4. Si hallazgo CRITICAL:
     - Bloquear PR
     - Comentar en PR con detalles
  5. Si hallazgo HIGH:
     - Comentar warning
     - Requerir review de security team
  6. Reporte SARIF subido a GitHub Security tab
```

### UC2: Auditoría Mensal

```yaml
Trigger: Primer lunes de cada mes

Acciones:
  1. Ejecutar audit-system completo (15 fases)
  2. Ejecutar security-audit completo (6 agentes)
  3. Consolidar hallazgos
  4. Comparar con auditoría anterior
  5. Generar informe ejecutivo
  6. Enviar a stakeholders
  7. Crear tickets de JIRA para hallazgos críticos
```

### UC3: Pre-deploy Check

```yaml
Trigger: Antes de deploy a producción

Acciones:
  1. security-audit modo CI
  2. Verificar:
     - Score >= 8.0
     - 0 vulnerabilidades CRITICAL
     - < 5 vulnerabilidades HIGH
  3. Si pasa:
     - Permitir deploy
  4. Si falla:
     - Bloquear deploy
     - Notificar equipo
```

## Comandos de Integración

```bash
# Auditoría completa (audit-system + security-audit)
npm run audit:full

# Auditoría de seguridad standalone
npm run security:audit

# Auditoría de seguridad de un módulo específico
npm run security:audit:module -- --module=auth

# Auditoría rápida (pre-commit)
npm run security:quick

# Reporte SARIF para GitHub
npm run security:audit:sarif

# Comparar con auditoría anterior
npm run security:audit:compare -- --with=security-report-prev.json
```

## Reglas de Colaboración

### Cuando audit-system encuentra un issue de seguridad:

1. Si es un check que security-audit también hace:
   - Usar el resultado más detallado de security-audit
   - Agregar contexto de fase de audit-system

2. Si es un check específico de audit-system:
   - Mantener en audit-system
   - Referenciar en informe de security-audit si es relevante

### Cuando security-audit encuentra un issue:

1. Si es CRITICAL o HIGH:
   - Reportar inmediatamente
   - Sugerir bloqueo de deploy

2. Si es MEDIUM o LOW:
   - Acumular para informe
   - Agrupar por categoría

3. Si es un falso positivo:
   - Marcar para ignorar en futuras auditorías
   - Actualizar patterns si es necesario

## Métricas de Integración

| Métrica | Target | Descripción |
|---------|--------|-------------|
| Coverage overlap | > 90% | Checks de seguridad cubiertos por ambos skills |
| False positive rate | < 5% | Hallazgos que son falsos positivos |
| Detection rate | > 95% | Vulnerabilidades reales detectadas |
| Execution time | < 10 min | Tiempo total de auditoría completa |
| Integration latency | < 1s | Tiempo de consolidación de hallazgos |

---

> **Nota:** Esta integración permite que Silexar Pulse tenga la cobertura de seguridad más completa posible, combinando el análisis profundo de 15 fases con la especialización en seguridad de los 6 agentes.
