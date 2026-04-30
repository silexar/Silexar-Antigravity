# PLAN DE IMPLEMENTACIÓN - MÓDULO 15: PAQUETES

## Resumen Ejecutivo

El Módulo de Paquetes es uno de los más complejos del sistema Silexar Pulse, con integración de IA (Cortex-Pricing, Cortex-Demand) y múltiples integraciones externas (WideOrbit, Sara, Dalet, Nielsen, Kantar). La implementación completa requiere un enfoque por fases para asegurar calidad y reducir riesgos.

---

## FASES DE IMPLEMENTACIÓN

### 🔷 FASE 1: Fundamentos y Core (Semanas 1-3)

#### 1.1 Schema de Base de Datos
- [ ] Verificar `src/lib/db/paquetes-schema.ts` con 4 tablas:
  - `paquetes` (principal)
  - `paquetesHistorialPrecio`
  - `paquetesDisponibilidad`
  - `paquetesRestricciones`
- [ ] Migración existente en `drizzle/0007_paquetes_tables.sql`
- [ ] Agregar índices para rendimiento

#### 1.2 DDD - Domain Layer
- [ ] Crear entidades DDD:
  - `src/modules/paquetes/domain/entities/Paquete.ts`
  - `src/modules/paquetes/domain/value-objects/PrecioPaquete.ts`
  - `src/modules/paquetes/domain/value-objects/RestriccionPaquete.ts`
- [ ] Value objects para horarios, días, duraciones

#### 1.3 DDD - Repository Interfaces
- [ ] `src/modules/paquetes/domain/repositories/IPaqueteRepository.ts`
- [ ] Definir контракт con métodos:
  - `findById()`, `findAll()`, `save()`, `update()`
  - `getDisponibilidad()`, `getHistorialPrecios()`
  - `search(filters)`, `getRelatedToEmisora()`

#### 1.4 API Routes Refactorizadas (YA COMPLETADO)
- [x] `/api/paquetes/route.ts` - GET, POST con withApiRoute
- [x] `/api/paquetes/[id]/route.ts` - GET, PUT, DELETE con withApiRoute

#### 1.5 Validaciones y Auditoría
- [ ] Zod schemas completos para todas las operaciones
- [ ] Audit logging en todos los endpoints

---

### 🔷 FASE 2: Integración con Emisoras (Semanas 3-4)

#### 2.1 Relaciones de Dominio
- [ ] Paquete → Emisora (many-to-one)
- [ ] Paquete → Contratos (one-to-many)
- [ ] Paquete → Vencimientos (one-to-many)

#### 2.2 Endpoints de Relación
- [ ] `GET /api/paquetes?emisoraId=X` - Filtrar por emisora
- [ ] `GET /api/paquetes?contratoId=X` - Filtrar por contrato
- [ ] `POST /api/paquetes/[id]/vincular-contrato`

#### 2.3 Integración de Datos
- [ ] Sincronizar datos de emisoras en paquetes
- [ ] Actualizar automáticamente al cambiar emisora

---

### 🔷 FASE 3: Inteligencia Artificial - Cortex (Semanas 4-6)

#### 3.1 Cortex-Pricing
- [ ] Servicio de pricing inteligente
- [ ] Endpoint: `POST /api/paquetes/ia/calcular-precio`
- [ ] Factores: demanda, temporada, audiencia, competencia
- [ ] Historial de precios con IA

#### 3.2 Cortex-Demand
- [ ] Análisis de demanda por segmento
- [ ] Predicciones de ocupación
- [ ] Endpoint: `GET /api/paquetes/ia/demanda`

#### 3.3 Alertas y Recomendaciones
- [ ] Alertas de demanda alta/baja
- [ ] Recomendaciones de pricing
- [ ] Dashboard de IA en frontend

---

### 🔷 FASE 4: Integraciones Externas (Semanas 6-8)

#### 4.1 WideOrbit Integration
- [ ] Sincronización de inventario
- [ ] Endpoint: `POST /api/paquetes/sync/wideorbit`
- [ ] Mapear estructura de WideOrbit → Paquetes

#### 4.2 Sara Integration
- [ ] Integración con sistema Sara
- [ ] Endpoint: `POST /api/paquetes/sync/sara`

#### 4.3 Dalet Integration
- [ ] Integración con Dalet
- [ ] Endpoint: `POST /api/paquetes/sync/dalet`

#### 4.4 Medición Externa
- [ ] Integración Nielsen (ratings)
- [ ] Integración Kantar (audiencia)
- [ ] Endpoint: `GET /api/paquetes/metricas-externas`

---

### 🔷 FASE 5: Frontend y UI (Semanas 8-10)

#### 5.1 Dashboard de Paquetes
- [ ] Página principal: `src/app/paquetes/page.tsx`
- [ ] Lista con filtros avanzados
- [ ] Búsqueda por nombre, tipo, editora

#### 5.2 Wizard de Creación
- [ ] Formulario multi-step para crear paquete
- [ ] Step 1: Datos básicos
- [ ] Step 2: Programación (horario, días)
- [ ] Step 3: Pricing (precios, descuentos)
- [ ] Step 4: Restricciones

#### 5.3 Vista de Detalle
- [ ] Pestañas: Info, Disponibilidad, Pricing, IA, Historial
- [ ] Gráficos de tendencia de precios
- [ ] Mapa de demanda

---

### 🔷 FASE 6: Reportes e Informes (Semanas 10-11)

#### 6.1 Reportes de Ocupación
- [ ] `GET /api/paquetes/informes/ocupacion`
- [ ] Por periode, por emisora, por tipo

#### 6.2 Reportes de Rentabilidad
- [ ] `GET /api/paquetes/informes/rentabilidad`
- [ ] Margen por paquete, tendencia

#### 6.3 Exportación
- [ ] Exportar a Excel, PDF
- [ ] Integración con módulo de informes

---

### 🔷 FASE 7: Testing y QA (Semana 11-12)

#### 7.1 Pruebas Unitarias
- [ ] Tests para entidades DDD
- [ ] Tests para servicios de IA
- [ ] Coverage > 80%

#### 7.2 Pruebas de Integración
- [ ] Tests de API endpoints
- [ ] Tests de integración externas

#### 7.3 Pruebas E2E
- [ ] Crear paquete completo
- [ ] Flujo de actualización
- [ ] Eliminación suave

---

## PRIORIDADES Y DEPENDENCIAS

```
FASE 1 (Fundamentos)
    ├── Schema DB → lista
    ├── DDD Entities → lista
    ├── API Routes → ✅ COMPLETADO
    └── Validaciones → lista

FASE 2 (Emisoras)
    ├── Requiere: FASE 1 completa
    ├── Relaciones → lista
    └── Endpoints → lista

FASE 3 (IA - Cortex)
    ├── Requiere: FASE 1 completa
    ├── Cortex-Pricing → lista
    └── Cortex-Demand → lista

FASE 4 (Externas)
    ├── Requiere: FASE 2 completa
    ├── WideOrbit → lista
    ├── Sara → lista
    └── Dalet → lista

FASE 5 (Frontend)
    ├── Requiere: FASE 1, 2
    ├── Dashboard → lista
    ├── Wizard → lista
    └── Detalle → lista

FASE 6 (Reportes)
    ├── Requiere: FASE 5 completa
    └── Informes → lista

FASE 7 (QA)
    └── Testing → lista
```

---

## RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Integraciones externas fallan | Media | Alto | Mock servers en desarrollo |
| IA predictions inaccurate | Media | Medio | Human-in-the-loop validation |
| Performance con muchos paquetes | Baja | Alto | Índices y caching |
| Complex DDD implementation | Media | Medio | Pair programming, code review |

---

## RECURSOS NECESARIOS

### Desarrollo
- 1 backend senior (DDD, integraciones)
- 1 frontend senior (UI, wizard)
- 1 data/ML (Cortex AI)

### Infraestructura
- Redis para caché de disponibilidad
- Queue para sync externo
- Monitoring para IA predictions

---

## METRICAS DE ÉXITO

- [ ] 100% endpoints con withApiRoute ✅
- [ ] Audit logging en 100% operaciones ✅
- [ ] < 200ms latency API promedio
- [ ] Coverage tests > 80%
- [ ] 0 errores críticos en producción

---

## PRÓXIMOS PASOS

1. ✅ **COMPLETADO**: RBAC para paquetes
2. ✅ **COMPLETADO**: API routes refactorizadas
3. **PENDIENTE**: Implementar Fase 1 completa (DDD, repositorio)
4. **PENDIENTE**: Crear página frontend básica
5. **PENDIENTE**: Integrar con módulo de campañas

---

*Documento creado: 2026-04-29*
*Plan basado en: `Modulos/📦 MÓDULO PAQUETES - ESPECIFICACIÓN.txt`*
