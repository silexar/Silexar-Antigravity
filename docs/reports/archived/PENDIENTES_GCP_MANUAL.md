# 📋 PENDIENTES DE CONFIGURACIÓN MANUAL - GCP

> **IMPORTANTE**: Este archivo lista TODAS las configuraciones manuales que deberás hacer en Google Cloud Console al momento del deploy. NO hacer ahora - hacer cuando el software esté listo para producción.

---

## 🔐 GCP SECURITY SERVICES

### 1. Cloud Armor (WAF) - ~$5/mes

```
Console → Network Security → Cloud Armor
1. Create Security Policy: "silexar-waf-policy"
2. Import rules from: backend/src/config/gcp/cloud-armor-policy.yaml
3. Attach to Load Balancer
```

- [ ] Crear política
- [ ] Configurar reglas OWASP
- [ ] Configurar geofencing Chile
- [ ] Attach a Load Balancer

---

### 2. VPC Network - GRATIS

```
Console → VPC Network → Create VPC
Referencia: backend/src/config/gcp/vpc-config.yaml
```

- [ ] Crear VPC: silexar-vpc-prod
- [ ] Crear subnet: silexar-frontend (10.0.1.0/24)
- [ ] Crear subnet: silexar-backend (10.0.2.0/24)
- [ ] Crear subnet: silexar-database (10.0.3.0/24)
- [ ] Habilitar Private Google Access
- [ ] Configurar Cloud NAT

---

### 3. Secret Manager - ~$0.50/mes

```
Console → Security → Secret Manager
```

Migrar estas variables:

- [ ] JWT_SECRET
- [ ] DATABASE_URL
- [ ] CORS_ORIGIN
- [ ] REQUEST_SIGNING_SECRET
- [ ] BLIND_INDEX_KEY
- [ ] PagerDuty routing key (si usas)
- [ ] Slack webhook URL (si usas)

---

### 4. Cloud KMS - ~$0.10/mes

```
Console → Security → Key Management
```

- [ ] Crear keyring: silexar-keyring
- [ ] Crear key: silexar-master-key (para EnvelopeEncryption)
- [ ] Crear key: silexar-signing-key (para HMAC)
- [ ] Configurar rotación automática: 90 días

---

### 5. Security Command Center - GRATIS (Standard)

```
Console → Security → Security Command Center
```

- [ ] Habilitar Security Command Center
- [ ] Configurar notificaciones
- [ ] Revisar findings iniciales

---

### 6. IAM Roles - GRATIS

```
Console → IAM & Admin
Referencia: backend/src/config/gcp/iam-roles.yaml
```

- [ ] Crear Service Account: silexar-backend-sa
- [ ] Asignar roles mínimos
- [ ] Configurar Workload Identity (NO crear keys)

---

## 🔔 INTEGRACIONES OPCIONALES

### PagerDuty (Alertas críticas)

- [ ] Crear cuenta PagerDuty (gratis hasta 5 usuarios)
- [ ] Obtener Routing Key
- [ ] Agregar a Secret Manager

### Slack (Notificaciones)

- [ ] Crear Slack App
- [ ] Obtener Webhook URL
- [ ] Agregar a Secret Manager

---

## 💰 RESUMEN DE COSTOS

| Servicio       | Costo Base     | Variable            |
| -------------- | -------------- | ------------------- |
| Cloud Armor    | $5/mes         | +$0.75/M requests   |
| VPC            | GRATIS         | Flow Logs: $0.50/GB |
| Secret Manager | $0.06/secret   | $0.03/10k access    |
| Cloud KMS      | $0.06/key      | $0.03/10k ops       |
| SCC Standard   | GRATIS         | —                   |
| **TOTAL**      | **~$6-15/mes** | Depende uso         |

---

## ⚠️ SERVICIOS OPCIONALES (COSTO ALTO)

Solo activar si es requerido para compliance específico:

| Servicio    | Costo         | Cuándo usar                |
| ----------- | ------------- | -------------------------- |
| Cloud IDS   | $1,080/mes    | Enterprise compliance      |
| Cloud HSM   | $1/key/mes    | PCI-DSS, gobierno          |
| SCC Premium | $0.0025/asset | Container threat detection |

---

**Última actualización**: 2025-12-11
