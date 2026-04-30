# Módulo Configuración - Runbooks de Operaciones

> **Versión:** 1.0.0  
> **Fecha:** 2026-04-27  
> **Clasificación:** INTERNO

---

## 🚨 PLAYBOOKS DE INCIDENTES

### INC-001: Múltiples Intentos de Login Fallidos

**Severidad:** 🟡 MEDIA  
** SLA:** 15 minutos

**Síntomas:**
- Alertas de "Múltiples login failures" en Cortex
- Users reporting account lockout

**Pasos de Investigación:**
```bash
# 1. Verificar origen de los intentos
SELECT ip_address, COUNT(*) as attempts 
FROM audit_logs 
WHERE action = 'LOGIN_FAILURE' 
AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
ORDER BY attempts DESC;

# 2. Verificar si es brute force o user error
# 3. Check si IP está en whitelist/blacklist
```

**Respuesta:**
1. Si IP ≠ whitelist → Bloquear IP por 24h
2. Si usuario específico → Reset password + MFA
3. Si bulk attack → Activar rate limit estricto
4. Documentar en incidente

---

### INC-002: Degradación de Performance en API

**Severidad:** 🟠 ALTA  
**SLA:** 30 minutos

**Síntomas:**
- Latencia elevada (>500ms p99)
- Timeout errors en logs
- Alertas de CPU/Memory en Grafana

**Pasos de Investigación:**
```bash
# 1. Ver métricas de la DB
SELECT query, calls, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

# 2. Ver estado del connection pool
# 3. Verificar cache hit rate
# 4. Check para slow queries
```

**Respuesta:**
1. Si DB → Optimizar query o scale up
2. Si connection pool → Increase pool size
3. Si cache bajo → Verificar Redis
4. Si CPU → Scale horizontal

---

### INC-003: Kill Switch Activado Accidentemente

**Severidad:** 🔴 CRÍTICA  
**SLA:** 5 minutos

**Síntomas:**
- Servicio no responde
- Alerta de "Kill Switch Active"
- Users unable to access

**Pasos de Investigación:**
```bash
# 1. Identificar kill switch activo
GET /api/kill-switches?estado=ACTIVO

# 2. Ver quien lo activó
SELECT * FROM audit_logs 
WHERE action = 'KILL_SWITCH_ACTIVATE'
AND timestamp > NOW() - INTERVAL '1 hour';
```

**Respuesta:**
1. **INMEDIATAMENTE** → DELETE /api/kill-switches/{id}
2. Verificar servicio restaurado
3. Notificar stakeholders
4. Documentar causa raíz
5. Prevenir recurrencia: agregar approval workflow

---

### INC-004: Alerta de Seguridad - Acceso No Autorizado

**Severidad:** 🔴 CRÍTICA  
**SLA:** 15 minutos

**Síntomas:**
- Alerta de behavioral analytics
- Usuario accediendo desde ubicación inusual
- Intentos de acceder recursos fuera de rol

**Pasos de Investigación:**
```bash
# 1. Ver actividad reciente del usuario
SELECT * FROM audit_logs 
WHERE user_id = '{user_id}'
AND timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;

# 2. Ver sesiones activas
# 3. Verificar location anomaly

# 4. SI ES CONFIRMADO:
```

**Respuesta:**
1. **INMEDIATAMENTE** → Invalidar todas las sesiones del usuario
2. Disable cuenta temporalmente
3. Reset credentials
4. Notificar security team
5. Escalar a compliance si hay data breach
6. Preserve logs para forensics

---

### INC-005: Datos No Cifrados Detectados

**Severidad:** 🔴 CRÍTICA  
**SLA:** 1 hora

**Síntomas:**
- Alerta de escaneo de datos sensibles
- Campos sensibles sin encrypt

**Respuesta:**
1. Identificar tabla/campo afectado
2. Si en producción → Iniciar incident response
3. Remediar: encrypt datos + rotation keys
4. Audit de otros campos similares
5. Update threat model

---

## 🔧 OPERACIONES DE MANTENIMIENTO

### OPS-001: Rotación de Claves de Encriptación

**Frecuencia:** Trimestral  
**Requiere:** Approval de Security Lead

```bash
# 1. Crear nueva clave
POST /api/encryption/keys
{
  "nombre": "key-2026-Q3",
  "algoritmo": "AES-256-GCM",
  "fechaActivacion": "2026-07-01T00:00:00Z"
}

# 2. Re-encriptar datos con nueva clave
# (Proceso batch - ejecutar en maintenance window)

# 3. Verificar integridad post-rotación

# 4. Marcar clave antigua para expiración
DELETE /api/encryption/keys/{old_key_id}
```

---

### OPS-002: Backup Verification

**Frecuencia:** Semanal

```bash
# 1. Listar backups recientes
GET /api/backup?estado=COMPLETADO

# 2. Verificar último backup
# Debe existir backup de las últimas 24h

# 3. Test restore en environment de staging
# (Documentar resultado)

# 4. Verificar encryption del backup
# (Confirmar que backup está encrypted)
```

---

### OPS-003: Purga de Logs Antiguos

**Frecuencia:** Mensual

```bash
# 1. Ver retention actual
# Audit logs: 90 días online, 7 años archive
# Security events: 1 año

# 2. Ejecutar purga (si no está automatizado)
# (Usar scheduled job, no manual en producción)

# 3. Verificar que no hay datos de compliance retention

# 4. Documentar en compliance log
```

---

### OPS-004: Review de Accesos

**Frecuencia:** Trimestral

```bash
# 1. Extraer todos los usuarios con rol ADMIN o SUPER_ADMIN
SELECT email, rol, ultimo_login 
FROM users 
WHERE rol IN ('ADMIN', 'SUPER_ADMIN')
AND estado = 'ACTIVO';

# 2. Verificar que todos tienen MFA habilitado
# 3. Revocar accesos que ya no son necesarios
# 4. Update permissions matrix
# 5. Documentar cambios
```

---

## 📊 MONITORING

### Métricas Clave (KPIs)

| Métrica | Target | Alert Threshold |
|---------|--------|----------------|
| API Availability | >99.9% | <99.5% |
| Latency p99 | <200ms | >500ms |
| Error Rate | <0.1% | >1% |
| CPU Usage | <70% | >85% |
| Memory Usage | <80% | >90% |
| DB Connections | <80% pool | >90% pool |
| Cache Hit Rate | >95% | <85% |

### Dashboards

- **Grafana:** `https://grafana.silexar.com/d/configuracion`
- **Metrics:** Prometheus queries en `/monitoring/prometheus`
- **Alerts:** Configuradas en `/monitoring/prometheus/rules`

### Log Aggregation

- **Elasticsearch:** `https://logs.silexar.com`
- **Indices:** `silexar-audit-*`, `silexar-security-*`
- **Retention:** 90 días hot, 7 años cold

---

## 🔄 DEPLOYMENT CHECKLIST

### Pre-Deployment

```bash
[ ] Verify all tests pass in CI
[ ] Run lint check: npm run lint
[ ] Run type check: npm run check
[ ] Review migration scripts
[ ] Backup database (production only)
[ ] Notify stakeholders of maintenance window
[ ] Verify rollback plan
```

### Post-Deployment

```bash
[ ] Verify health endpoint: GET /api/health
[ ] Run smoke tests
[ ] Check error rates in Grafana
[ ] Monitor latency for 15 minutes
[ ] Verify no new security alerts
[ ] Document deployment in changelog
[ ] Notify stakeholders deployment complete
```

### Rollback Procedure

```bash
# Si hay problemas críticos post-deploy:
[ ] Execute: ./scripts/rollback.sh {version}
[ ] Verify health endpoint
[ ] Notify stakeholders
[ ] Open incident if issues persist
```

---

## 📞 CONTACTOS DE EMERGENCIA

| Rol | Nombre | Teléfono | Slack |
|-----|--------|----------|-------|
| Security Lead | [NOMBRE] | [TEL] | @security |
| DevOps Lead | [NOMBRE] | [TEL] | @devops |
| On-Call | PagerDuty | *PagerDuty* | #incidents |
| CTO | [NOMBRE] | [TEL] | @cto |

---

*Documento para uso interno. Actualizar contactos regularmente.*
