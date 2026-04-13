# 🔒 Security Audit Skill v3.0 — Fort Knox Edition

> Sistema de auditoría de seguridad más avanzado del mundo para Silexar Pulse.

## 🚀 Quick Start

```bash
# Auditoría completa (6 agentes en paralelo)
npm run security:audit

# Verbose con todos los detalles
npm run security:audit:verbose

# Solo módulo de autenticación
npm run security:audit:module -- --module=auth

# Solo archivos modificados
npm run security:audit:incremental

# Reporte SARIF para GitHub
npm run security:audit:sarif
```

## 📋 Qué Audita

### 15 Dimensiones de Seguridad

| Dimensión | Agente | Descripción |
|-----------|--------|-------------|
| OWASP Top 10 2021 | ASAST | Inyección, XSS, CSRF, etc. |
| OWASP Top 10 LLM | AS | Prompt injection, AI judge |
| 8 Capas AI | AS | L1-L8 completo |
| Defense in Depth | AS | D1-D8 Fortune 10 |
| Secret Detection | ASE | 50+ patrones de credenciales |
| SAST | ASAST | Análisis estático avanzado |
| Supply Chain | AS | Dependencias vulnerables |
| Infrastructure | AIAC | Terraform, Docker, K8s |
| Auth & Session | AD | Tests dinámicos |
| RBAC | AS | Control de acceso |
| Data Protection | AS | Encriptación |
| Input Validation | ASAST | Zod validation |
| Error Handling | ASAST | Manejo seguro |
| Logging | AS | Sin datos sensibles |
| Compliance | AS | SOC2, GDPR, SII |

## 🏛️ Arquitectura Multi-Agente

```
Agent Coordinator (AC)
├── Agent Static Analyzer (AS)
├── Agent Secrets Scanner (ASE)
├── Agent SAST Analyzer (ASAST)
├── Agent Dynamic Tester (AD)
└── Agent IaC Scanner (AIAC)
```

## 📊 Score de Seguridad

| Score | Certificación | Estado |
|-------|--------------|--------|
| 95-100 | 🏆 FORT KNOX | Listo para Fortune 10 |
| 85-94 | ✅ ENTERPRISE | Producción enterprise |
| 70-84 | 🟡 PRODUCTION | Correcciones menores |
| 50-69 | 🟠 WARNING | Sprint remediación |
| < 50 | 🔴 CRITICAL | No apto producción |

## 🔍 Reglas No Negociables

Estas reglas **bloquean automáticamente** el deploy:

1. ❌ NO secrets hardcodeados
2. ❌ NO .env files en git
3. ❌ NO eval() o new Function()
4. ❌ NO dangerouslySetInnerHTML sin DOMPurify
5. ❌ NO raw SQL (solo ORM)
6. ❌ NO any en archivos de seguridad
7. ❌ NO console.log en API routes
8. ❌ NO RLS deshabilitado
9. ❌ NO JWT sin expiración
10. ❌ NO contraseñas en texto plano

## 📁 Estructura

```
.agent/skills/security-audit/
├── SKILL.md                    # Documentación principal
├── README.md                   # Este archivo
├── agents/                     # Definiciones de agentes
│   ├── coordinator.agent.md
│   ├── static-analyzer.agent.md
│   ├── secrets-scanner.agent.md
│   ├── sast-analyzer.agent.md
│   ├── dynamic-tester.agent.md
│   └── iac-scanner.agent.md
├── modules/                    # Módulos de análisis
│   ├── owasp-top10/
│   ├── ai-security/
│   ├── sast/
│   ├── secrets/
│   ├── dependencies/
│   ├── infrastructure/
│   └── compliance/
├── patterns/                   # Patrones de detección
│   ├── injection-patterns.ts
│   └── secret-patterns.ts
├── strategies/                 # Estrategias de análisis
│   └── batch-strategy.ts
├── integration/                # Integraciones
│   └── audit-system.md
└── scripts/                    # Scripts ejecutables
    └── audit.js
```

## 🔗 Integraciones

- **audit-system**: Se integra como F4 especializado
- **GitHub Actions**: Reportes SARIF automáticos
- **Slack**: Notificaciones de hallazgos críticos
- **JIRA**: Creación automática de tickets

## 📚 Documentación

- [SKILL.md](SKILL.md) - Documentación completa
- [agents/coordinator.agent.md](agents/coordinator.agent.md) - Agente coordinador
- [integration/audit-system.md](integration/audit-system.md) - Integración con 15 fases

---

**Versión:** 3.0.0 - Fort Knox Edition  
**Tier:** TIER_0_FORT_KNOX  
**Actualizado:** 2026-04-05
