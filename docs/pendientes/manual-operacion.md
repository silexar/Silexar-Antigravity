# 📋 Manual de Operación - Silexar Pulse

## Guía del Operador para Administración del Sistema

**Versión**: 2.0.0  
**Última actualización**: 2025-12-15

---

## 📖 Índice

1. [Arquitectura General](#arquitectura-general)
2. [Módulos Principales](#módulos-principales)
3. [Operaciones Diarias](#operaciones-diarias)
4. [Monitoreo](#monitoreo)
5. [Troubleshooting](#troubleshooting)
6. [Procedimientos de Emergencia](#procedimientos-de-emergencia)

---

## Arquitectura General

### Stack Tecnológico

| Capa          | Tecnología                                 |
| ------------- | ------------------------------------------ |
| Frontend      | Next.js 14+, React, TypeScript             |
| Backend       | NestJS v10+, Node.js                       |
| Base de Datos | PostgreSQL 15                              |
| Cache         | Redis                                      |
| Mensajería    | Google Cloud Pub/Sub (o Redis alternativo) |
| IA Generativa | Vertex AI (Gemini Pro, Imagen)             |
| ML            | TensorFlow Federated                       |

### Componentes Core

1. **Motor Cortex**: 23+ motores de IA/ML
2. **Bus de Eventos**: Procesamiento en tiempo real
3. **SDK Móvil**: iOS/Android con FL
4. **Constructor MRAID**: Micro-apps publicitarias

---

## Módulos Principales

### 1. Aprendizaje Federado (FL)

**Ubicación**: `/api/v2/events/fl-update`, `/api/v2/fl/model`

**Operaciones**:

- Los modelos se agregan automáticamente cada 100 actualizaciones
- Verificar estado en `/api/v2/fl/model?action=stats`

**Comandos útiles**:

```bash
# Forzar agregación manual (requiere auth admin)
curl -X POST /api/v2/fl/model \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"action": "force_aggregation"}'
```

### 2. SDK Móvil

**Ubicación**: `/api/v2/sdk/config`

**Gestión de API Keys**:

- Panel: `/admin/sdk-management`
- Revocar keys comprometidas inmediatamente
- Rotación recomendada: cada 90 días

### 3. Constructor MRAID

**Ubicación**: `/api/v2/mraid/generate`

**Plantillas disponibles**:

- loan_calculator
- currency_converter
- travel_checklist
- memory_game
- tip_calculator
- bmi_calculator

### 4. IA Generativa

**Ubicación**: `/api/v2/generate/image`, `/api/v2/generate/text`

**Límites**:

- Imágenes: 100/hora por tenant
- Texto: 1000 tokens/solicitud

---

## Operaciones Diarias

### Inicio del Día

1. **Verificar salud del sistema**

   ```bash
   npm run health-check
   ```

2. **Revisar logs de errores**

   ```bash
   tail -f /var/log/silexar/error.log
   ```

3. **Verificar modelos FL activos**
   ```bash
   curl /api/v2/fl/model?action=stats
   ```

### Fin del Día

1. **Revisar eventos en dead letter queue**

   ```sql
   SELECT COUNT(*) FROM event_dead_letters WHERE NOT resolved;
   ```

2. **Verificar métricas de billing**
   ```sql
   SELECT billing_model, SUM(total_events)
   FROM daily_billing_metrics
   WHERE date = CURRENT_DATE
   GROUP BY billing_model;
   ```

---

## Monitoreo

### Métricas Críticas

| Métrica         | Umbral Warning | Umbral Critical |
| --------------- | -------------- | --------------- |
| CPU             | 70%            | 90%             |
| Memoria         | 75%            | 90%             |
| Latencia API    | 500ms          | 2000ms          |
| Error Rate      | 1%             | 5%              |
| FL Updates/hour | < 10           | < 1             |

### Dashboards

- **Sistema**: `/monitoring/dashboard`
- **Narrativas**: `/narrative-dashboard`
- **IA**: `/ai-dashboard`
- **SDK**: `/admin/sdk-management` (tab Analytics)

### Alertas Configuradas

1. **Alta latencia de API** - Email + Slack
2. **Error rate > 5%** - PagerDuty
3. **FL no recibe updates en 24h** - Email
4. **Dead letters > 100** - Slack

---

## Troubleshooting

### Error: "MRAID generation failed"

**Causa**: Template inválido o configuración de marca incompleta

**Solución**:

1. Verificar que `template_type` sea válido
2. Verificar que `brand.name` esté presente
3. Revisar logs: `/var/log/silexar/mraid.log`

### Error: "FL aggregation failed"

**Causa**: Insuficientes actualizaciones o modelo corrupto

**Solución**:

1. Verificar número de updates en la ronda actual
2. Reiniciar ronda si es necesario:
   ```bash
   curl -X POST /api/v2/fl/model \
     -d '{"action": "new_round", "modelVersion": "1.0.x"}'
   ```

### Error: "SDK API key invalid"

**Causa**: Key expirada o revocada

**Solución**:

1. Verificar estado de la key en BD
2. Generar nueva key si es necesario
3. Notificar al cliente para actualizar

### Error: "Vertex AI quota exceeded"

**Causa**: Límite de API alcanzado

**Solución**:

1. Esperar reset de quota (generalmente por hora)
2. Solicitar aumento de quota en GCP Console
3. Implementar throttling temporal

---

## Procedimientos de Emergencia

### 1. Rollback de Modelo FL

```bash
# 1. Identificar versión anterior estable
curl /api/v2/fl/model?action=stats

# 2. Activar modelo anterior (requiere acceso BD)
UPDATE fl_global_models
SET status = 'active'
WHERE version = 'X.X.X';

UPDATE fl_global_models
SET status = 'rollback'
WHERE version = 'Y.Y.Y';
```

### 2. Revocar SDK Masivo

```sql
-- Revocar todas las keys de un tenant
UPDATE sdk_configurations
SET status = 'revoked', revoked_at = NOW()
WHERE tenant_id = 'xxx';
```

### 3. Limpiar Dead Letter Queue

```sql
-- Marcar como resueltos eventos antiguos
UPDATE event_dead_letters
SET resolved = true, resolved_at = NOW()
WHERE created_at < NOW() - INTERVAL '7 days'
  AND NOT resolved;
```

### 4. Reiniciar Bus de Eventos

```bash
# Detener procesadores
pm2 stop cortex-event-processor

# Limpiar cache Redis
redis-cli FLUSHDB

# Reiniciar
pm2 start cortex-event-processor
```

---

## Contactos de Escalamiento

| Nivel | Contacto            | Tiempo Respuesta |
| ----- | ------------------- | ---------------- |
| L1    | soporte@silexar.com | 4 horas          |
| L2    | devops@silexar.com  | 2 horas          |
| L3    | CTO                 | 30 minutos       |

---

## Changelog

| Fecha      | Versión | Cambios                            |
| ---------- | ------- | ---------------------------------- |
| 2025-12-15 | 2.0.0   | Versión inicial con FL, MRAID, SDK |
