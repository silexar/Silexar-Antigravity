# 🚀 PENDIENTES PARA PRODUCCIÓN — Módulo Vencimientos

> **Fecha:** 2026-04-30  
> **Módulo:** Vencimientos (Módulo 11)  
> **Estado:** ~85% completado — listo para staging, con pendientes críticos documentados antes de pasar a producción.

---

## ✅ LO QUE YA ESTÁ LISTO

| Área | Estado | Detalle |
|------|--------|---------|
| **DB Schema** | ✅ Listo | 14 tablas (4 originales + 10 nuevas), índices, FKs, RLS-ready |
| **Migración SQL** | ✅ Listo | `drizzle/migrations/0007_vencimientos_entities.sql` |
| **Repositorios Drizzle** | ✅ Listo | 5 repos: Programa, Vencimientos, CupoComercial, Tarifario |
| **API Routes** | ✅ Listo | 9 rutas con RBAC, Zod, audit logging, fallback mock |
| **Cron Jobs** | ✅ Listo | 3 endpoints: R1 (no-iniciados), R2 (alertas tráfico), Daily Maintenance |
| **Frontend** | ✅ Listo | Dashboard consume APIs reales con parsing correcto |
| **Seed Script** | ✅ Listo | `scripts/seed-vencimientos.ts` — 8 entidades pobladas |
| **Application Handlers** | ✅ Listo | 15 handlers CQRS existentes, compatibles con repos nuevos |
| **Domain Entities** | ✅ Listo | Entidades ricas con value objects, domain events, validaciones |

---

## 🔴 PENDIENTES CRÍTICOS — DEBE RESOLVERSE ANTES DE PRODUCCIÓN

### 1. Ejecutar Migración SQL en Base de Datos

```bash
# Opción A: Drizzle Kit
drizzle-kit migrate

# Opción B: SQL directo (si usas migraciones manuales)
psql $DATABASE_URL -f drizzle/migrations/0007_vencimientos_entities.sql
```

**Impacto:** Sin esto, las tablas nuevas no existen y todos los repositorios caerán al fallback mock.

---

### 2. Configurar Variables de Entorno

Asegurar que existan en `.env.production`:

```env
# Base de datos
DATABASE_URL=postgresql://...
DB_MAX_CONNECTIONS=20

# Seguridad cron
CRON_SECRET=super-secret-cron-key-min-32-chars

# Servicios externos (cuando estén disponibles)
CORTEX_API_URL=https://cortex.silexar.io
CORTEX_API_KEY=...
CONTRATOS_SYNC_WEBHOOK=https://...
WHATSAPP_BUSINESS_API_KEY=...
EMAIL_SMTP_HOST=...
```

---

### 3. Activar Cron Jobs en Vercel

El archivo `vercel.json` ya tiene la configuración:

```json
{
  "crons": [
    { "path": "/api/cron/vencimientos/r1-procesar-no-iniciados", "schedule": "0 */6 * * *" },
    { "path": "/api/cron/vencimientos/r2-alertas-trafico", "schedule": "0 7,18 * * *" },
    { "path": "/api/cron/vencimientos/daily-maintenance", "schedule": "0 6 * * *" }
  ]
}
```

**Pendiente:** Desplegar y verificar en Vercel Dashboard que los cron jobs aparecen activos.

---

### 4. Integraciones Externas — Stubs → Conectores Reales

Los siguientes servicios tienen stubs funcionales pero requieren endpoints reales:

| Servicio | Stub Location | Conector Real Pendiente |
|----------|--------------|------------------------|
| `ContratoSyncService` | `application/services/ContratoSyncService.ts` | Webhook desde módulo Contratos |
| `CortexAnalyticsService` | `application/services/CortexAnalyticsService.ts` | API Cortex AI |
| `CortexFlowPredictionService` | `application/services/CortexFlowPredictionService.ts` | API Cortex AI |
| `CortexInventoryIntelligence` | `application/services/CortexInventoryIntelligence.ts` | API Cortex AI |
| `PricingOptimizationService` | `application/services/PricingOptimizationService.ts` | Algoritmo ML o API externa |
| `WhatsAppBusinessService` | `application/services/WhatsAppBusinessService.ts` | WhatsApp Business API |
| `EmailAutomationService` | `application/services/EmailAutomationService.ts` | SMTP / SendGrid / AWS SES |

**Acción:** Cuando los servicios externos estén disponibles, reemplazar la lógica mock dentro de cada servicio por llamadas reales. La interfaz no cambia.

---

### 5. Conectar `IEmisoraRepository` al Repo Real

El `VencimientosHandler` y `SincronizacionHandler` inyectan `IEmisoraRepository`. Existe `DrizzleEmisoraRepository` en `src/modules/emisoras/infrastructure/repositories/` pero **no implementa la interfaz del módulo vencimientos**.

**Acción:** Crear un adapter o extender `DrizzleEmisoraRepository` para que implemente `IEmisoraRepository` del módulo vencimientos.

**Archivos afectados:**
- `src/modules/vencimientos/application/handlers/VencimientoHandler.ts`
- `src/modules/vencimientos/application/handlers/SincronizacionHandler.ts`
- `src/modules/vencimientos/application/handlers/DisponibilidadHandler.ts`

---

### 6. Tests de Integración para Nuevos Repositorios

Se crearon 3 repositorios nuevos pero **no tienen tests**:

- `CupoComercialDrizzleRepository.ts`
- `TarifarioDrizzleRepository.ts`
- `VencimientosDrizzleRepository.ts` (actualizado)

**Acción:** Crear tests en `__tests__/modules/vencimientos/infrastructure/` usando Vitest + `pg-mem` o una DB de test.

---

### 7. Validar RLS (Row Level Security)

Las tablas nuevas tienen `tenantId` y FKs, pero **no tienen políticas RLS explícitas** en la migración SQL.

**Acción:** Agregar `ENABLE ROW LEVEL SECURITY` y políticas por tenant en PostgreSQL:

```sql
ALTER TABLE vencimientos_auspicio ENABLE ROW LEVEL SECURITY;
CREATE POLICY vencimientos_auspicio_tenant_isolation ON vencimientos_auspicio
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

Nota: El proyecto ya tiene `withTenantContext()` que setea la variable de sesión, por lo que las queries Drizzle respetarán RLS una vez habilitado.

---

### 8. Rate Limiting en API Routes

Las rutas nuevas (`/cupos`, `/alertas`, `/vencimientos`, `/extensiones`) usan `withApiRoute` que ya tiene rate limiting por defecto. Sin embargo, los **cron jobs no tienen rate limiting adicional** más allá del `CRON_SECRET`.

**Acción:** Considerar agregar `x-vercel-signature` validation si se ejecutan desde GitHub Actions o sistemas externos.

---

### 9. Monitoreo y Alertas de Error

Los cron jobs loguean via `logger` (pino/observability) pero **no tienen alertas automáticas** si fallan.

**Acción:** Configurar Sentry alerts o PagerDuty para errores 500 en `/api/cron/vencimientos/*`.

---

### 10. Documentación de API (OpenAPI/Swagger)

Las rutas nuevas no están documentadas en `docs/API.md` ni en Swagger.

**Acción:** Agregar ejemplos de request/response en `docs/API.md` o generar automáticamente desde los schemas Zod.

---

## 🟡 MEJORAS RECOMENDADAS (No bloqueantes)

1. **Cache Redis** para `GET /api/vencimientos/programas` (alta frecuencia de lectura)
2. **Index adicional compuesto** en `vencimientos_auspicio(tenant_id, estado, fecha_vencimientos)` para queries de dashboard
3. **Materialized View** para métricas de analytics (evitar cálculos en tiempo real)
4. **WebSocket real** para el SSE del dashboard (actualmente envía heartbeat estático)
5. **Feature Flags** para activar/desactivar cron jobs por tenant

---

## 📋 CHECKLIST PRE-PRODUCCIÓN

```markdown
- [ ] Migración 0007 ejecutada en DB de producción
- [ ] CRON_SECRET configurado en Vercel
- [ ] Cron jobs visibles en Vercel Dashboard
- [ ] Seed ejecutado en staging para validar
- [ ] RLS habilitado en todas las tablas nuevas
- [ ] Integraciones externas conectadas (o stubs activos con feature flag)
- [ ] Tests de integración pasando
- [ ] Sentry configurado para alertas de cron
- [ ] Load test en /api/vencimientos/programas (100 req/s)
- [ ] Backup strategy definido para tablas de vencimientos
```

---

## 🏗️ ARQUITECTURA ACTUAL (Resumen)

```
Frontend (Next.js)
  └── src/app/vencimientos/page.tsx
      └── fetch() → /api/vencimientos/*

API Routes (Next.js App Router)
  ├── /api/vencimientos/programas     → ProgramaAuspicioDrizzleRepository
  ├── /api/vencimientos/cupos         → CupoComercialDrizzleRepository
  ├── /api/vencimientos/vencimientos  → VencimientosDrizzleRepository
  ├── /api/vencimientos/alertas       → VencimientosDrizzleRepository
  ├── /api/vencimientos/extensiones   → (mock → DB cuando conecte)
  ├── /api/vencimientos/analytics     → CupoComercial + Programa repos
  └── /api/cron/vencimientos/*        → Cron jobs R1/R2/Daily

Application Layer (CQRS)
  ├── Commands  → CrearProgramaAuspicioCommand, ActivarAuspicioCommand, etc.
  ├── Handlers  → VencimientoHandler, CupoManagementHandler, etc.
  ├── Queries   → ObtenerDisponibilidadCuposQuery, etc.
  └── Services  → AlertNotificationService, NoInicioWatchdogService, etc.

Domain Layer (DDD Tier 0)
  ├── Entities     → ProgramaAuspicio, CupoComercial, VencimientosAuspicio, etc.
  ├── Value Objects → HorarioEmision, CupoDisponible, ValorComercial, etc.
  └── Repositories  → IProgramaAuspicioRepository, ICupoComercialRepository, etc.

Infrastructure Layer
  ├── Drizzle Repositories → ProgramaAuspicioDrizzleRepository, etc.
  ├── External Services    → ContratoSyncService (stub), CortexAnalyticsService (stub)
  └── Messaging            → EventBusPublisher

Database (PostgreSQL)
  └── 14 tablas en schema vencimientos
```

---

## 📞 CONTACTO Y RESPONSABLES

| Rol | Responsabilidad |
|-----|----------------|
| **Backend Lead** | Revisar pendientes 1, 2, 5, 6, 7 |
| **DevOps/SRE** | Revisar pendientes 2, 3, 8, 9 |
| **Data/ML** | Revisar pendiente 4 (Cortex + Pricing) |
| **QA** | Revisar pendiente 6 (tests) + checklist completo |
| **Product** | Revisar pendiente 10 (documentación API) |

---

*Documento generado automáticamente por el agente de construcción Silexar Pulse.*
*Última actualización: 2026-04-30*
