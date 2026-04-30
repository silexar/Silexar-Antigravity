# 📅 PLAN MAESTRO DE IMPLEMENTACIÓN - MÓDULO VENCIMIENTOS
## SILEXAR PULSE | De 43% a 100% TIER 0

**Fecha:** 29 de Abril, 2026  
**Estado Actual:** ~43% completado  
**Objetivo:** Módulo 100% funcional en producción  
**Estimación Total:** 8-10 semanas (2 desarrolladores full-time)  

---

## 🎯 ESTRATEGIA GENERAL

```
FASE 1: FUNDACIÓN (Semanas 1-2)     → Base de datos + API real + fixes críticos
FASE 2: CORE OPERATIVO (Semanas 3-4) → Wizard + Cupos + Tandas + Tarifario
FASE 3: AUTOMATIZACIÓN (Semanas 5-6) → Alertas + Cron jobs + Notificaciones
FASE 4: INTEGRACIÓN (Semanas 7-8)   → Contratos + Cuñas + Facturación + Cortex básico
FASE 5: OPTIMIZACIÓN (Semanas 9-10) → Analytics real + Móvil + Compliance + Tests E2E
```

---

## 🔷 FASE 1: FUNDACIÓN DE DATOS Y API (Semanas 1-2)
**Objetivo:** Que el módulo deje de ser "demo" y comience a persistir datos reales.

### 1.1 Unificación del Modelo de Datos
| Tarea | Días | Detalle |
|-------|------|---------|
| Crear tabla `solicitudes_extension` | 0.5 | Mapear entity `SolicitudExtension` a Drizzle |
| Crear tabla `listas_espera` | 0.5 | Mapear entity `ListaEspera` a Drizzle |
| Crear tabla `alertas_programador` | 0.5 | Mapear entity `AlertaProgramador` a Drizzle |
| Crear tabla `historial_ocupacion` | 0.5 | Para analytics de ocupación mensual |
| Crear tabla `configuracion_tarifa` | 0.5 | Tarifas base por programa/tipo/duración |
| Crear tabla `tandas_comerciales` | 0.5 | Definición de tandas con factores multiplicadores |
| Crear tabla `senales_especiales` | 0.5 | Temperatura, micros, cortinas |
| Crear tabla `exclusividades_rubro` | 0.5 | Reglas de exclusividad por programa |
| Generar migraciones Drizzle | 1 | `drizzle-kit generate` + `migrate` |
| **Subtotal Fase 1.1** | **5 días** | |

### 1.2 Domain Mapper + Repositorio Real
| Tarea | Días | Detalle |
|-------|------|---------|
| Crear `VencimientosDomainMapper` | 1 | Traducir `VencimientosAuspicio` (entity) ↔ `VencimientosAuspicioDTO` (DB) |
| Crear `AlertaDomainMapper` | 0.5 | Traducir `AlertaProgramador` ↔ `AlertaVencimientosDTO` |
| Crear `ExtensionDomainMapper` | 0.5 | Traducir `SolicitudExtension` ↔ DB |
| Crear `ListaEsperaDomainMapper` | 0.5 | Traducir `ListaEspera` ↔ DB |
| Actualizar `VencimientosDrizzleRepository` | 1.5 | Implementar métodos faltantes: saveExtension, findExtension*, saveListaEspera, findListaEspera* |
| Crear `ProgramaAuspicioDrizzleRepository` | 1.5 | Implementar `IProgramaAuspicioRepository` con Drizzle |
| Crear `CupoComercialDrizzleRepository` | 1.5 | Implementar `ICupoComercialRepository` con Drizzle |
| **Subtotal Fase 1.2** | **7 días** | |

### 1.3 API Routes Reales (Reemplazar Mocks)
| Tarea | Días | Detalle |
|-------|------|---------|
| Refactor `GET /api/vencimientos/programas` | 1 | Usar `ProgramaAuspicioDrizzleRepository` en lugar de `mockProgramas` |
| Refactor `POST /api/vencimientos/programas` | 0.5 | Persistir en DB real con validaciones |
| Crear `GET /api/vencimientos/vencimientos` | 0.5 | Listar vencimientos próximos con filtros |
| Crear `GET /api/vencimientos/alertas` | 0.5 | Listar alertas pendientes por destinatario |
| Crear `POST /api/vencimientos/extensiones` | 0.5 | Solicitar extensión de fecha |
| Crear `PATCH /api/vencimientos/extensiones/:id` | 0.5 | Aprobar/rechazar extensión |
| Crear `POST /api/vencimientos/lista-espera` | 0.5 | Agregar cliente a lista de espera |
| Crear `GET /api/vencimientos/disponibilidad` | 0.5 | Consultar disponibilidad por programa/fecha |
| **Subtotal Fase 1.3** | **4.5 días** | |

### 1.4 Frontend: Conectar al API Real
| Tarea | Días | Detalle |
|-------|------|---------|
| Actualizar `useVencimientosAPI` hook | 1 | Conectar todos los endpoints reales |
| Eliminar datos mock del Dashboard | 0.5 | `fetchClientesPrograma` debe usar API real |
| Implementar `onSave` en EditarProgramaModal | 0.5 | Llamar a `PATCH /api/vencimientos/programas/:id` |
| **Subtotal Fase 1.4** | **2 días** | |

### ✅ Entregable Fase 1
> Módulo con datos reales persistidos en PostgreSQL. Dashboard muestra información real de la base de datos. Puede crear programas, ver vencimientos y gestionar alertas.

**Estimación Fase 1: ~19 días (2 semanas)**

---

## 🔷 FASE 2: CORE OPERATIVO (Semanas 3-4)
**Objetivo:** Que el usuario pueda gestionar completamente programas, cupos, tandas y tarifas.

### 2.1 Wizard de Creación de Programa (5 Pasos)
| Tarea | Días | Detalle |
|-------|------|---------|
| Paso 1: Información Básica | 0.5 | Nombre, emisora, horario, días, conductores |
| Paso 2: Configuración de Cupos | 1 | Tipo A (completo), Tipo B (medio), Menciones. Derechos incluidos. Pricing sugerido. |
| Paso 3: Exclusividades y Conflictos | 1 | Rubros configurables, detección automática de conflictos |
| Paso 4: Tarifario Dinámico | 1 | Precios base, factores de ajuste (rating, ocupación, temporada), descuentos |
| Paso 5: Validación y Activación | 0.5 | Resumen, validaciones automáticas, asignación de ejecutivos, activación |
| Integrar Wizard en `/vencimientos/crear` | 0.5 | Flujo completo con navegación entre pasos |
| **Subtotal Fase 2.1** | **4.5 días** | |

### 2.2 Gestión de Tandas Comerciales
| Tarea | Días | Detalle |
|-------|------|---------|
| UI de configuración de tandas | 1 | Prime AM, Prime PM, Repartida, Noche con factores y tarifas por duración |
| API CRUD tandas | 0.5 | Endpoints para crear/editar/eliminar tandas |
| Integrar tandas en programa | 0.5 | Asociar tandas a programas al crear/editar |
| **Subtotal Fase 2.2** | **2 días** | |

### 2.3 Señales Especiales
| Tarea | Días | Detalle |
|-------|------|---------|
| UI configuración señales | 1 | Temperatura (3 slots), Micros (informativo/entretenimiento), Cortinas |
| API CRUD señales | 0.5 | Endpoints para gestionar señales |
| Integrar en disponibilidad | 0.5 | Mostrar señales en dashboard de programa |
| **Subtotal Fase 2.3** | **2 días** | |

### 2.4 Tarifario Inteligente
| Tarea | Días | Detalle |
|-------|------|---------|
| UI administrador de tarifas | 1 | Tabla editable de precios por tipo/duración/horario |
| Lógica de factores de ajuste | 1 | Implementar cálculo real: rating, ocupación, temporada, cliente nuevo, renovación |
| Sugerencias Cortex (básico) | 0.5 | Comparar con precios promedio del mercado (datos internos) |
| **Subtotal Fase 2.4** | **2.5 días** | |

### 2.5 Gestión Avanzada de Cupos
| Tarea | Días | Detalle |
|-------|------|---------|
| Dashboard de disponibilidad por programa | 1 | Vista detallada: ocupados, disponibles, pre-reservas, lista de espera |
| Reservar cupo temporal (4h) | 0.5 | Ejecutivo puede bloquear cupo por 4 horas |
| Pre-cierre → Cierre definitivo | 0.5 | Flujo de checkout comercial |
| **Subtotal Fase 2.5** | **2 días** | |

### ✅ Entregable Fase 2
> Usuario puede crear programas completos con el wizard de 5 pasos, configurar tandas, señales, tarifario dinámico y gestionar cupos en tiempo real.

**Estimación Fase 2: ~13 días (2 semanas)**

---

## 🔷 FASE 3: AUTOMATIZACIÓN Y ALERTAS (Semanas 5-6)
**Objetivo:** Que el sistema trabaje solo: alertas, countdowns, notificaciones.

### 3.1 Cron Jobs y Workers
| Tarea | Días | Detalle |
|-------|------|---------|
| Job diario: `procesarAlertasTrafico()` | 1 | Verificar auspicios que terminan mañana/hoy, crear alertas para programadores |
| Job diario: `procesarNoIniciados()` | 1 | Verificar auspicios que superaron 48h sin iniciar, iniciar countdown |
| Job cada 1h: `verificarCountdown48h()` | 0.5 | Eliminar cupos cuyo countdown expiró |
| Job diario: `evaluarVencimientosProximos()` | 0.5 | Actualizar niveles de alerta (verde→amarillo→rojo→crítico) |
| Job semanal: `reporteOcupacion()` | 0.5 | Generar reporte de ocupación por programa/emisora |
| Scheduler: Implementar con Inngest/BullMQ | 1 | Elegir e implementar la solución de scheduling |
| **Subtotal Fase 3.1** | **4.5 días** | |

### 3.2 Centro de Alertas para Programadores
| Tarea | Días | Detalle |
|-------|------|---------|
| Vista `/vencimientos/alertas` | 1 | Centro de alertas con filtros por tipo/prioridad |
| Acciones: Confirmar / Rechazar / Posponer | 1 | Cada alerta requiere acción del programador |
| Modal de Confirmación de Inicio | 0.5 | Checklist de materiales, notificaciones automáticas |
| Historial de alertas | 0.5 | Log de alertas procesadas con auditoría |
| **Subtotal Fase 3.2** | **3 días** | |

### 3.3 Sistema de Notificaciones
| Tarea | Días | Detalle |
|-------|------|---------|
| Servicio `EmailNotificationService` real | 1 | Integrar con Resend/SendGrid. Templates HTML. |
| Servicio `WhatsAppBusinessService` real | 1 | Integrar con WhatsApp Business API (o Twilio) |
| Servicio `PushNotificationService` real | 0.5 | Integrar con OneSignal/FCM |
| Matriz de notificaciones | 0.5 | Definir quién recibe qué y por qué canal según prioridad |
| **Subtotal Fase 3.3** | **3 días** | |

### 3.4 Lista de Espera Operativa
| Tarea | Días | Detalle |
|-------|------|---------|
| Notificación automática al liberarse cupo | 0.5 | Cuando un auspicio finaliza, notificar al siguiente en cola |
| UI de gestión de lista de espera | 0.5 | Ver, reordenar, eliminar de la cola |
| **Subtotal Fase 3.4** | **1 día** | |

### ✅ Entregable Fase 3
> Sistema automatizado: alertas diarias para programadores, countdown 48h con eliminación automática, notificaciones multi-canal, lista de espera con notificación automática.

**Estimación Fase 3: ~11.5 días (2 semanas)**

---

## 🔷 FASE 4: INTEGRACIONES CON ECOSISTEMA (Semanas 7-8)
**Objetivo:** Conectar Vencimientos con el resto de Silexar.

### 4.1 Integración con Módulo Contratos
| Tarea | Días | Detalle |
|-------|------|---------|
| Webhook: Nuevo contrato creado | 1 | Cuando se crea contrato, detectar campañas asociadas |
| Validación automática de disponibilidad | 1 | Verificar cupo disponible en fechas solicitadas |
| Validación de exclusividades | 0.5 | Verificar que no haya conflictos de rubro |
| Alerta al programador para confirmar | 0.5 | Crear alerta de "nuevo auspicio detectado" |
| Confirmación → Reserva de cupo | 1 | Al confirmar, reservar cupo y sincronizar estados |
| Sincronización bidireccional de estados | 1 | Estado del cupo se refleja en contrato y viceversa |
| **Subtotal Fase 4.1** | **5 días** | |

### 4.2 Integración con Módulo Cuñas
| Tarea | Días | Detalle |
|-------|------|---------|
| Detectar materiales requeridos al activar auspicio | 0.5 | Presentación, cierre, menciones, comerciales |
| Generar tareas automáticas en módulo Cuñas | 0.5 | Crear tareas de producción de material |
| **Subtotal Fase 4.2** | **1 día** | |

### 4.3 Integración con Módulo Facturación
| Tarea | Días | Detalle |
|-------|------|---------|
| Sincronizar valores comerciales | 0.5 | Enviar tarifas y valores de cupos a facturación |
| Trigger facturación al activar auspicio | 0.5 | Iniciar ciclo de facturación automáticamente |
| **Subtotal Fase 4.3** | **1 día** | |

### 4.4 Integración con Anunciantes (Exclusividades)
| Tarea | Días | Detalle |
|-------|------|---------|
| Validar exclusividad al reservar cupo | 1 | Consultar rubro del anunciante y verificar conflictos |
| Sugerir programas alternativos | 0.5 | Si hay conflicto, sugerir otros programas disponibles |
| **Subtotal Fase 4.4** | **1.5 días** | |

### 4.5 Cortex Básico (Primera versión real)
| Tarea | Días | Detalle |
|-------|------|---------|
| Analytics de ocupación real | 1 | Calcular ocupación, revenue, tendencias desde DB |
| Detección de oportunidades simple | 0.5 | Programas con <40% ocupación = oportunidad |
| Recomendación de pricing simple | 0.5 | Si ocupación >85% sugerir +5%, si <50% sugerir -5% |
| **Subtotal Fase 4.5** | **2 días** | |

### ✅ Entregable Fase 4
> Módulo Vencimientos conectado con Contratos, Cuñas, Facturación y Anunciantes. Cortex genera insights reales basados en datos.

**Estimación Fase 4: ~10.5 días (2 semanas)**

---

## 🔷 FASE 5: OPTIMIZACIÓN, MÓVIL Y COMPLIANCE (Semanas 9-10)
**Objetivo:** Pulir, escalar y asegurar calidad de producción.

### 5.1 Analytics y Business Intelligence
| Tarea | Días | Detalle |
|-------|------|---------|
| Dashboard Analytics ejecutivo | 1 | Revenue por emisora, por tipo de auspicio, por horario |
| Ranking de programas por performance | 0.5 | Top performers vs sub-utilizados |
| Tendencias mensuales con gráficos | 1 | Gráficos de línea/barras con Recharts/Tremor |
| Proyecciones de revenue | 0.5 | Revenue proyectado próximo trimestre |
| **Subtotal Fase 5.1** | **3 días** | |

### 5.2 Versión Móvil Ejecutiva
| Tarea | Días | Detalle |
|-------|------|---------|
| Dashboard móvil ejecutivo | 1 | Mi performance, acciones rápidas, oportunidades hot |
| Consulta rápida de disponibilidad | 0.5 | Buscar programa/cupo desde móvil |
| Alertas push en móvil | 0.5 | Notificaciones nativas de vencimientos próximos |
| **Subtotal Fase 5.2** | **2 días** | |

### 5.3 Seguridad y Compliance
| Tarea | Días | Detalle |
|-------|------|---------|
| Auditoría inmutable de cambios | 1 | Log de cada modificación de cupo (quién, qué, cuándo) |
| Validación dual para cambios críticos | 1 | Cambios de precio/cupo requieren 2 aprobaciones |
| RBAC granular refinado | 0.5 | Ajustar permisos por rol según especificación |
| **Subtotal Fase 5.3** | **2.5 días** | |

### 5.4 Tests y Calidad
| Tarea | Días | Detalle |
|-------|------|---------|
| Tests de integración API | 1 | Testear todos los endpoints con datos reales |
| Tests E2E con Playwright | 2 | Flujo completo: crear programa → asignar cupo → alerta → vencimiento |
| Performance testing | 0.5 | Tiempo de carga del dashboard con 100+ programas |
| **Subtotal Fase 5.4** | **3.5 días** | |

### 5.5 Documentación y Handoff
| Tarea | Días | Detalle |
|-------|------|---------|
| Documentación API (OpenAPI) | 0.5 | Especificar todos los endpoints |
| Guía de usuario | 0.5 | Manual para ejecutivos, programadores y gerentes |
| Runbook de operaciones | 0.5 | Cómo monitorear jobs, qué hacer si fallan alertas |
| **Subtotal Fase 5.5** | **1.5 días** | |

### ✅ Entregable Fase 5
> Módulo listo para producción: analytics real, móvil funcional, compliance auditado, tests E2E pasando, documentación completa.

**Estimación Fase 5: ~12.5 días (2 semanas)**

---

## 📋 RESUMEN DEL PLAN

| Fase | Duración | % del Módulo | Acumulado |
|------|----------|-------------|-----------|
| Fase 1: Fundación | 2 semanas | 25% | 25% |
| Fase 2: Core Operativo | 2 semanas | 25% | 50% |
| Fase 3: Automatización | 2 semanas | 20% | 70% |
| Fase 4: Integraciones | 2 semanas | 20% | 90% |
| Fase 5: Optimización | 2 semanas | 10% | 100% |
| **TOTAL** | **10 semanas** | **100%** | **100%** |

> **Nota:** El acumulado parte del 43% actual. Fase 1 lleva a ~55%, Fase 2 a ~70%, Fase 3 a ~82%, Fase 4 a ~92%, Fase 5 a 100%.

---

## 👥 RECURSOS NECESARIOS

| Rol | Cantidad | Dedicación | Fases |
|-----|----------|-----------|-------|
| Backend Developer (Node/TS) | 1 | Full-time | Todas |
| Frontend Developer (React/Next) | 1 | Full-time | Todas |
| DevOps (opcional) | 0.5 | Part-time | Fase 3 (jobs), Fase 5 (deploy) |
| QA Engineer | 0.5 | Part-time | Fase 5 (tests E2E) |

---

## 🚨 RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|-----------|
| Integración con Contratos es más compleja | Media | Alto | Empezar Fase 4 en paralelo a Fase 3 |
| WhatsApp Business API demora aprobación | Media | Medio | Usar Twilio como fallback inicial |
| Performance con muchos programas | Baja | Medio | Índices en DB + paginación + caching |
| Cambios en requisitos del negocio | Media | Medio | Reuniones semanales de validación |

---

## ✅ CRITERIOS DE ACEPTACIÓN POR FASE

### Fase 1
- [ ] Todas las tablas nuevas creadas y migradas
- [ ] Dashboard carga datos reales de PostgreSQL
- [ ] Puedo crear un programa y persiste en DB
- [ ] Puedo ver vencimientos reales

### Fase 2
- [ ] Wizard de 5 pasos funcional end-to-end
- [ ] Puedo configurar tandas y señales
- [ ] Tarifario calcula precios con factores de ajuste
- [ ] Puedo reservar cupo temporal y pre-cierre

### Fase 3
- [ ] Job diario envía alertas de tráfico automáticamente
- [ ] Job diario procesa no-iniciados y countdown 48h
- [ ] Recibo email/WhatsApp cuando mi auspicio vence en 7 días
- [ ] Lista de espera notifica automáticamente

### Fase 4
- [ ] Al crear contrato, se detecta automáticamente en Vencimientos
- [ ] Programador confirma reserva desde alerta
- [ ] Facturación se dispara al activar auspicio
- [ ] Cortex muestra insights basados en datos reales

### Fase 5
- [ ] Tests E2E pasan al 100%
- [ ] Dashboard analytics muestra gráficos reales
- [ ] App móvil funciona en iOS/Android
- [ ] Auditoría registra todos los cambios críticos

---

*Plan Maestro de Implementación - Módulo Vencimientos*  
*Documento generado para revisión y aprobación*
