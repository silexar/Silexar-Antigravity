# Módulo Configuración - Threat Model

> **Versión:** 1.0.0  
> **Fecha:** 2026-04-27  
> **Clasificación:** INTERNO - CONFIDENCIAL  
> **Framework:** STRIDE + MITRE ATT&CK

---

## 📋 Resumen Ejecutivo

Este documento presenta el análisis de amenazas completo para el **Módulo Configuración** de Silexar Pulse. El módulo maneja datos críticos incluyendo usuarios, roles, permisos, configuraciones SSO, políticas de negocio, y sellos de certificación.

**Nivel de Criticidad:** 🔴 CRÍTICO  
**Assets Principales:** 14+ entidades de configuración, datos de usuario, políticas de negocio  
**team:** Platform Security + Development Team

---

## 🎯 ASSETS PROTEGIDOS

### Activos de Alto Valor

| Asset | Clasificación | Descripción |
|-------|--------------|-------------|
| **User Credentials** | 🔴 RESTRICTED | passwords, tokens, session data |
| **Role/Permission Mappings** | 🟠 CONFIDENTIAL | Control de acceso completo |
| **SSO Configuration** | 🔴 RESTRICTED | Credenciales de integración empresarial |
| **Business Policies** | 🟠 CONFIDENTIAL | Lógica de negocio central |
| **Encryption Keys** | 🔴 RESTRICTED | Master keys para encriptación |
| **Tenant Data** | 🔴 RESTRICTED | Aislamiento multi-tenant |
| **Audit Logs** | 🟠 CONFIDENTIAL | Compliance y forensics |
| **Feature Flags** | 🟡 INTERNAL | Control de feature releases |
| **Kill Switch Configs** | 🔴 RESTRICTED | Controles de emergencia |

### Trust Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│  INTERNET (No confiable)                                        │
│  └── HTTPS → WAF → Rate Limiter                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  API GATEWAY (Autenticado)                                       │
│  └── JWT Validation → RBAC → Tenant Context                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  APPLICATION LAYER (Autorizado)                                  │
│  └── Zod Validation → Business Logic → Audit Logger            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  DATABASE (Confiado)                                             │
│  └── PostgreSQL + RLS → Encrypted at Rest → Audit Trail        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 ANÁLISIS STRIDE

### S - Spoofing (Falsificación de Identidad)

| ID | Amenaza | Probabilidad | Impacto | Mitigaciones |
|----|---------|-------------|---------|--------------|
| S-01 | Credential Stuffing | 🟡 MEDIA | 🔴 CRÍTICO | MFA obligatorio, rate limiting, breach detection |
| S-02 | Token Hijacking | 🟢 BAJA | 🔴 CRÍTICO | Token binding a IP/UserAgent, short expiry |
| S-03 | Session Fixation | 🟢 BAJA | 🟠 ALTO | Regeneración de session ID en login |
| S-04 | LDAP Injection | 🟡 MEDIA | 🔴 CRÍTICO | Input sanitization, parameterized queries |

### T - Tampering (Modificación No Autorizada)

| ID | Amenaza | Probabilidad | Impacto | Mitigaciones |
|----|---------|-------------|---------|--------------|
| T-01 | SQL Injection | 🟡 MEDIA | 🔴 CRÍTICO | Drizzle ORM, parameterized queries, WAF rules |
| T-02 | Parameter Pollution | 🟢 BAJA | 🟠 ALTO | Zod validation, .strict() schema |
| T-03 | Policy Manipulation | 🟢 BAJA | 🔴 CRÍTICO | Approval workflow para cambios de políticas |
| T-04 | Role Escalation | 🟢 BAJA | 🔴 CRÍTICO | ABAC enforcement, role change audit |
| T-05 | Configuration Tampering | 🟢 BAJA | 🟠 ALTO | Immutable config after approval |

### R - Repudiation (Negación)

| ID | Amenaza | Probabilidad | Impacto | Mitigaciones |
|----|---------|-------------|---------|--------------|
| R-01 | User Denies Action | 🟡 MEDIA | 🟠 ALTO | Immutable audit logs, digital signatures |
| R-02 | Admin Denies Change | 🟢 BAJA | 🟠 ALTO | Separate admin audit log |
| R-03 | Log Deletion | 🟢 BAJA | 🔴 CRÍTICO | WORM storage, centralized log server |

### I - Information Disclosure (Exposición de Información)

| ID | Amenaza | Probabilidad | Impacto | Mitigaciones |
|----|---------|-------------|---------|--------------|
| I-01 | Data Breach via API | 🟡 MEDIA | 🔴 CRÍTICO | Field-level encryption, response filtering |
| I-02 | PII Exposure in Logs | 🟡 MEDIA | 🟠 ALTO | Sanitization, no sensitive data in console |
| I-03 | SSO Config Leakage | 🟢 BAJA | 🔴 CRÍTICO | Encrypted storage, no secrets in code |
| I-04 | Audit Log Exposure | 🟢 BAJA | 🟠 ALTO | Separate access controls, encryption |
| I-05 | DevTools Reconnaissance | 🟡 MEDIA | 🟠 ALTO | DevTools detection, console distraction |

### D - Denial of Service (Denegación de Servicio)

| ID | Amenaza | Probabilidad | Impacto | Mitigaciones |
|----|---------|-------------|---------|--------------|
| D-01 | API Rate Exhaustion | 🟡 MEDIA | 🟠 ALTO | Per-user/per-IP rate limits, CDN |
| D-02 | Database Connection Exhaustion | 🟢 BAJA | 🔴 CRÍTICO | Connection pooling, circuit breaker |
| D-03 | Policy Evaluation Loop | 🟢 BAJA | 🟠 ALTO | Max iterations limit, timeout |
| D-04 | Large Payload DoS | 🟡 MEDIA | 🟠 ALTO | Input size limits, Zod validation |

### E - Elevation of Privilege (Escalación de Privilegios)

| ID | Amenaza | Probabilidad | Impacto | Mitigaciones |
|----|---------|-------------|---------|--------------|
| E-01 | Role Escalation | 🟢 BAJA | 🔴 CRÍTICO | ABAC, approval workflow, re-auth for sensitive |
| E-02 | Tenant Isolation Bypass | 🟢 BAJA | 🔴 CRÍTICO | RLS, tenant context validation |
| E-03 | Admin Account Takeover | 🟢 BAJA | 🔴 CRÍTICO | MFA, separate admin credentials |
| E-04 | API Key Privilege Escalation | 🟢 BAJA | 🟠 ALTO | Scoped API keys, least privilege |

---

## 🛡️ MITRE ATT&CK MAPPING

### Initial Access

| Técnica | ID | Descripción | Controles |
|---------|-----|-------------|------------|
| Exploit Public-Facing Application | T1190 | Vulnerabilidades en API expuesta | WAF, patching, hardening |
| Phishing | T1566 | Credenciales vía phishing | MFA, security awareness |
| Valid Accounts | T1078 | Credenciales robadas | MFA, breach detection |

### Execution

| Técnica | ID | Descripción | Controles |
|---------|-----|-------------|------------|
| Command and Scripting Interpreter | T1059 | Scripts maliciosos | No eval(), input validation |
| User Execution | T1204 | Usuario engaado ejecutando | Security training, warnings |

### Persistence

| Técnica | ID | Descripción | Controles |
|---------|-----|-------------|------------|
| Account Manipulation | T1098 | Agregar cuentas backdoor | Audit role changes |
| Valid Accounts | T1078 | Mantener acceso con cuentas válidas | MFA, anomaly detection |

### Privilege Escalation

| Técnica | ID | Descripción | Controles |
|---------|-----|-------------|------------|
| Exploitation for Privilege Escalation | T1068 | Explorar vulnerabilidad | Patching, least privilege |
| Access Token Manipulation | T1134 | Robar tokens de admin | Token binding, short expiry |

### Defense Evasion

| Técnica | ID | Descripción | Controles |
|---------|-----|-------------|------------|
| Clear Command History | T1070.003 | Borrar evidencia | Immutable logs |
| Impair Defenses | T1562 | Deshabilitar controles | Integrity monitoring |

### Credential Access

| Técnica | ID | Descripción | Controles |
|---------|-----|-------------|------------|
| Brute Force | T1110 | Fuerza bruta de credenciales | Rate limiting, MFA |
| Credentials from Password Stores | T1552 | Robar passwords guardados | Encrypted storage, monitoring |

### Discovery

| Técnica | ID | Descripción | Controles |
|---------|-----|-------------|------------|
| System Information Discovery | T1082 | Enumeração del sistema | Console protection |
| Account Discovery | T1087 | Enumerar usuarios | Audit logging |

### Collection

| Técnica | ID | Descripción | Controles |
|---------|-----|-------------|------------|
| Data from Local System | T1005 | Extraer datos locales | DLP, monitoring |
| Input Capture | T1056 | Capturar keystrokes | Secure input fields |

### Exfiltration

| Técnica | ID | Descripción | Controles |
|---------|-----|-------------|------------|
| Exfiltration Over C2 Channel | T1041 | Exfiltrar vía canal de comando | Network monitoring |
| Data Transfer Size Limits | T1030 | Large data exfiltration | DLP, bulk export limits |

### Impact

| Técnica | ID | Descripción | Controles |
|---------|-----|-------------|------------|
| Data Encrypted for Impact | T1486 | Ransomware | Backups, access controls |
| Service Stop | T1489 | Detener servicios críticos | Kill switch protection |

---

## 🌳 ATTACK TREES

### Objetivo: Comprometer Cuenta Admin

```
[COMPROMETER CUENTA ADMIN]
├── [Phishing] (prob: 0.01)
│   ├── Enviar email convincente
│   ├── Usuario hace click
│   └── Ingresa credenciales en sitio falso
│       └── MITIGACIÓN: MFA + Training
│
├── [Credential Stuffing] (prob: 0.02)
│   ├── Obtener credenciales leakadas
│   ├── Probar en nuestro sistema
│   └── MFA no habilitado
│       └── MITIGACIÓN: MFA obligatorio + breach detection
│
├── [Session Hijacking] (prob: 0.005)
│   ├── Interceptar session token
│   ├── Token no está bindeado
│   └── Sesión todavía válida
│       └── MITIGACIÓN: Token binding + short expiry
│
└── [Insider Threat] (prob: 0.001)
    ├── Empleado con acceso admin
    ├── Motivación para abusar
    └── Sin controles internos
        └── MITIGACIÓN: Behavioral analytics + DLP
```

### Objetivo: Extraer Datos Sensibles

```
[EXTRAER DATOS SENSIBLES]
├── [API Abuse] (prob: 0.03)
│   ├── Hacer múltiples requests
│   ├── Exportar bulk data
│   └── DLP no configurado
│       └── MITIGACIÓN: DLP + rate limiting
│
├── [SQL Injection] (prob: 0.01)
│   ├── Encontrar input vulnerable
│   ├── Inyectar SQL malicioso
│   └── Extraer datos
│       └── MITIGACIÓN: ORM + WAF + sanitization
│
├── [Unauthorized Access] (prob: 0.02)
│   ├── Comprometer cuenta de otro
│   ├── Acceder datos de su tenant
│   └── RLS no funciona
│       └── MITIGACIÓN: RLS + tenant isolation
│
└── [Audit Log Manipulation] (prob: 0.005)
    ├── Obtener acceso a logs
    ├── Modificar o eliminar
    └── Cubrir huellas
        └── MITIGACIÓN: Immutable logs + separate access
```

---

## 🛠️ CONTROLES DE MITIGACIÓN

### Controles Detectivos

| Control | Implementación | Cobertura |
|---------|----------------|-----------|
| Behavioral Analytics | Monitoreo de patrones de uso | Insider threats |
| Audit Logging | Logs estructurados en cada operación | All write operations |
| Rate Limiting | Límites por usuario/IP | DoS, brute force |
| Anomaly Detection | ML para detección de anomalías | Unknown threats |
| Integrity Monitoring | Hash baseline de archivos críticos | Tampering |

### Controles Preventivos

| Control | Implementación | Cobertura |
|---------|----------------|-----------|
| MFA | TOTP obligatorio para admins | Credential compromise |
| Input Validation | Zod schemas strict | Injection attacks |
| WAF | OWASP Top 10 rules | Web attacks |
| RLS | Row Level Security en DB | Tenant isolation |
| Encryption | AES-256-GCM | Data at rest |
| CSP | Content Security Policy | XSS |

### Controles Correctivos

| Control | Implementación | Cobertura |
|---------|----------------|-----------|
| Kill Switches | Emergency stops | System failures |
| Circuit Breaker | Open on failure | Cascading failures |
| Backup & Recovery | encrypted backups | Data loss |
| Incident Response | Playbooks documentados | Security incidents |

---

## 📊 EVALUACIÓN DE RIESGO RESIDUAL

| Categoría | Riesgo Inicial | Controles | Riesgo Residual |
|------------|----------------|-----------|-----------------|
| Spoofing | 🔴 ALTO | MFA + Monitoring | 🟡 MEDIO |
| Tampering | 🟡 MEDIO | ORM + Validation | 🟢 BAJO |
| Repudiation | 🟡 MEDIO | Immutable Logs | 🟢 BAJO |
| Information Disclosure | 🔴 ALTO | Encryption + DLP | 🟡 MEDIO |
| Denial of Service | 🟡 MEDIO | Rate Limiting + CDN | 🟢 BAJO |
| Elevation of Privilege | 🔴 ALTO | ABAC + RLS | 🟡 MEDIO |

---

## 📅 MANTENIMIENTO DEL THREAT MODEL

### Revisiones Programadas

| Tipo | Frecuencia | Responsables |
|------|------------|--------------|
| Revisión completa | Trimestral | Security Team |
| Actualización de controles | Mensual | Dev Team |
| Review de incidentes | Post-incidente | Security + Dev |
| Validación de mitigaciones | Semanal | DevOps |

### Triggers para Actualización

- Nuevo feature o integración
- Incidente de seguridad
- Cambio en arquitectura
- Feedback de penetration test
- Cambios regulatorios

---

## ✅ CHECKLIST DE CUMPLIMIENTO

```
THREAT MODEL CHECKLIST:
├── [✓] Assets identificados y clasificados
├── [✓] Trust boundaries mapeados
├── [✓] Amenazas STRIDE analizadas
├── [✓] MITRE ATT&CK techniques mapeadas
├── [✓] Attack trees creadas
├── [✓] Controles de mitigación documentados
├── [✓] Riesgo residual evaluado
├── [✓] Plan de mantenimiento definido
├── [ ] Validación por penetration test
├── [ ] Aprobación por Security Team
└── [ ] Fecha de próxima revisión: 2026-07-27
```

---

*Documento clasificado como CONFIDENCIAL*  
*Última actualización: 2026-04-27*  
*Próxima revisión: 2026-07-27*
