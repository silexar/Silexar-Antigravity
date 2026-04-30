# 📅 PLAN DE IMPLEMENTACIÓN - MÓDULO VENCIMIENTOS
## SILEXAR PULSE | Enterprise-Grade Construction Protocol v2.0

**Categoría:** CRITICAL — DDD Completo + CQRS + Event Sourcing  
**Módulo:** Vencimientos / Centro de Comando de Inventario Comercial  
**Fecha:** 2026-04-29  
**Estado Inicial:** ~43% completado (dominio avanzado, infraestructura crítica, API mock, UI parcial)  

---

## 🎯 ALCANCE

Reconstrucción completa del módulo Vencimientos para alcanzar **100% funcional** siguiendo el protocolo enterprise-grade:

1. **Base de datos:** Crear todas las tablas faltantes en Drizzle schema
2. **Repositorios:** Implementar mappers domain↔DB y repositorios reales
3. **API:** Reemplazar todos los mocks por endpoints reales con Zod + RBAC + Audit
4. **Frontend:** Dashboard operativo + Wizard 5 pasos + Centro de Alertas + Analytics
5. **Automatización:** Cron jobs stubs (no conexiones reales externas)
6. **Integraciones:** Stubs estructurados para Contratos, Cuñas, Facturación

**EXCLUSIONES (por instrucción del usuario):**
- NO conexiones reales con APIs externas
- NO WhatsApp Business API real (stub con estructura completa)
- NO Cortex IA real (stub con estructura completa)

---

## 🏗️ ENTIDADES DEL DOMINIO

### Entidades Core (ya existen — requieren tablas DB)
| Entidad | Estado Código | Tabla DB Requerida |
|---------|--------------|-------------------|
| `VencimientoAuspicio` | ✅ Completo | `vencimientos_auspicio` (ampliar) |
| `AlertaProgramador` | ✅ Completo | `alertas_programador` (nueva) |
| `SolicitudExtension` | ✅ Completo | `solicitudes_extension` (nueva) |
| `ListaEspera` | ✅ Completo | `listas_espera` (nueva) |
| `ProgramaAuspicio` | ✅ Completo | `programas` (ya existe, ampliar) |
| `CupoComercial` | ✅ Completo | `cupo_comercial` (nueva) |
| `TarifarioPrograma` | ✅ Completo | `tarifarios` (nueva) |
| `TandaComercial` | ✅ Completo | `tandas_comerciales` (nueva) |
| `SenalEspecial` | ✅ Completo | `senales_especiales` (nueva) |
| `ExclusividadRubro` | ✅ Completo | `exclusividades_rubro` (nueva) |
| `ConfiguracionTarifa` | ✅ Completo | `configuracion_tarifa` (nueva) |
| `HistorialOcupacion` | ✅ Completo | `historial_ocupacion` (nueva) |

---

## 📋 FASES DE CONSTRUCCIÓN

### FASE 1: SCHEMA + MIGRACIONES (Semana 1)
- Crear 10+ tablas faltantes en `src/lib/db/vencimientos-schema.ts`
- Generar migraciones con `drizzle-kit generate`
- Asegurar `tenant_id` en todas las tablas
- Asegurar índices para queries frecuentes

### FASE 2: REPOSITORIOS + DOMAIN MAPPERS (Semana 1-2)
- Crear mappers: Entity ↔ DTO ↔ Drizzle Row
- Implementar `VencimientosDrizzleRepository` completo
- Implementar `ProgramaAuspicioDrizzleRepository`
- Implementar `CupoComercialDrizzleRepository`
- Implementar `TarifarioDrizzleRepository`
- Implementar `DisponibilidadDrizzleRepository`
- Todos con `withTenantContext()`

### FASE 3: API ROUTES (Semana 2)
- `GET/POST /api/vencimientos/programas`
- `GET/PUT/DELETE /api/vencimientos/programas/[id]`
- `GET/POST /api/vencimientos/vencimientos`
- `GET/POST /api/vencimientos/alertas`
- `POST /api/vencimientos/extensiones`
- `PATCH /api/vencimientos/extensiones/[id]`
- `GET/POST /api/vencimientos/lista-espera`
- `GET /api/vencimientos/disponibilidad`
- `GET/POST /api/vencimientos/tandas`
- `GET/POST /api/vencimientos/tarifario`
- Todos con `withApiRoute`, Zod, audit logging

### FASE 4: FRONTEND (Semana 2-3)
- Dashboard principal conectado a APIs reales
- Wizard 5 pasos: Info Básica → Cupos → Exclusividades → Tarifario → Validación
- Centro de Alertas Programadores
- Gestión de Tandas Comerciales
- Configuración de Señales Especiales
- Tarifario Dinámico Admin
- Analytics Dashboard (stubs estructurados)
- Vista Móvil
- Neumorphism exacto + ModuleNavMenu + botón Ventana

### FASE 5: AUTOMATIZACIÓN (Semana 3)
- Jobs stubs: `procesarAlertasTrafico`, `procesarNoIniciados`, `verificarCountdown48h`
- Servicios de notificación stubs (Email, WhatsApp, Push)
- Matriz de notificaciones definida

### FASE 6: INTEGRACIONES + QC (Semana 4)
- `ContratoSyncService` stub estructurado
- `CortexAnalyticsService` stub estructurado
- `PricingOptimizationService` stub estructurado
- Tests de integración
- `npm run check` sin errores nuevos

---

## 🔐 REGLAS DE SEGURIDAD APLICABLES

- `withApiRoute` en TODOS los endpoints
- Zod `.strict()` en TODOS los inputs
- `withTenantContext` en TODAS las queries DB
- Audit logging en CREATE, UPDATE, DELETE
- Security headers en responses
- Neumorphism exacto en UI
- ModuleNavMenu en todas las páginas
- Botón "Ventana" popup en nuevo/ver

---

## ✅ CHECKLIST FINAL

- [ ] 12+ tablas en schema Drizzle
- [ ] 5+ repositorios implementados
- [ ] 10+ API routes protegidos
- [ ] Dashboard conectado a DB real
- [ ] Wizard 5 pasos funcional
- [ ] Centro de alertas operativo
- [ ] Jobs de automatización stubs
- [ ] Integraciones stubs estructuradas
- [ ] Tests de integración
- [ ] `npm run check` sin errores
- [ ] Neumorphism compliance 100%
