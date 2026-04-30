# Plan Maestro - Módulo Cuñas: Estado Actual vs Especificación

**Fecha:** 2026-04-22  
**Versión Documento:** 1.0  
**Archivo fuente:** `Modulos/🎵 MÓDULO CUÑAS - ESPECIFICACIÓN TI.txt`

---

## Resumen Ejecutivo

El Módulo Cuñas es el centro neurálgico de gestión de contenido publicitario en Silexar Pulse. Este documento compara la especificación completa contra la implementación real y genera un plan de trabajo para completar el módulo al 100%.

---

## 1. ARQUITECTURA DDD IMPLEMENTADA

### ✅ CONSTRUIDO (verificado en `src/modules/cunas/`)

```
src/modules/cunas/
├── domain/
│   ├── entities/
│   │   ├── Cuna.ts ✅
│   │   ├── Audio.ts ✅
│   │   ├── Mencion.ts ✅
│   │   ├── Presentacion.ts ✅
│   │   ├── Cierre.ts ✅
│   │   ├── PromoIDA.ts ✅
│   │   ├── GrupoDistribucion.ts ✅
│   │   └── ActivoDigital.ts ✅
│   ├── value-objects/
│   │   ├── CunaId.ts ✅
│   │   ├── EstadoCuna.ts ✅
│   │   ├── Duracion.ts ✅
│   │   ├── CalidadAudio.ts ✅
│   │   ├── TiempoLocucion.ts ✅
│   │   └── VariablePersonalizada.ts ✅
│   └── repositories/
│       ├── ICunaRepository.ts ✅
│       ├── IAudioRepository.ts ✅
│       ├── IActivoDigitalRepository.ts ✅
│       └── IDistribucionRepository.ts ✅
├── application/
│   ├── commands/
│   │   ├── CrearCunaCommand.ts ✅
│   │   ├── ActualizarCunaCommand.ts ✅
│   │   ├── CopiarCunaCommand.ts ✅
│   │   ├── CrearActivoDigitalCommand.ts ✅
│   │   ├── ProcesarAudioCommand.ts ✅
│   │   ├── EnviarGrupoDistribucionCommand.ts ✅
│   │   ├── CambiarEstadoCunaCommand.ts ✅
│   │   └── BulkUpdateCunasCommand.ts ✅
│   ├── handlers/
│   │   ├── CrearCunaHandler.ts ✅
│   │   ├── ActualizarCunaHandler.ts ✅
│   │   ├── CopiarCunaHandler.ts ✅
│   │   ├── CrearActivoDigitalHandler.ts ✅
│   │   ├── ProcesarAudioHandler.ts ✅
│   │   ├── EnviarGrupoDistribucionHandler.ts ✅
│   │   ├── CambiarEstadoCunaHandler.ts ✅
│   │   └── BulkUpdateCunasHandler.ts ✅
│   ├── queries/
│   │   ├── BuscarCunasQuery.ts ✅
│   │   ├── ObtenerDetalleCunaQuery.ts ✅
│   │   ├── ObtenerHistorialUsoQuery.ts ✅
│   │   ├── ObtenerPresentacionesFaltantesQuery.ts ✅
│   │   ├── ObtenerCunasPorVencerQuery.ts ✅
│   │   ├── ValidarMaterialContratoQuery.ts ✅
│   │   └── GenerarReporteDistribucionQuery.ts ✅
│   └── services/
│       └── AnuncianteValidatorService.ts ✅
├── infrastructure/
│   ├── repositories/
│   │   ├── CunaDrizzleRepository.ts ✅
│   │   └── ActivoDigitalDrizzleRepository.ts ✅
│   ├── mappers/
│   │   ├── CunaMapper.ts ✅
│   │   └── ActivoDigitalMapper.ts ✅
│   ├── external/
│   │   ├── CortexVoiceService.ts ⚠️ STUB
│   │   ├── CortexSenseService.ts ⚠️ STUB
│   │   ├── EmisionExportService.ts ⚠️ STUB
│   │   ├── BroadcastExportService.ts ⚠️ STUB
│   │   ├── Alertavencimientoservice.ts ⚠️ STUB
│   │   └── VencimientosValidationService.ts ⚠️ STUB
│   └── messaging/
│       ├── CunaEventPublisher.ts ✅
│       └── VencimientosAlertPublisher.ts ✅
└── presentation/
    ├── controllers/
    │   └── CunaController.ts ✅
    ├── views/
    │   ├── CunasDashboardView.tsx ✅
    │   └── CreaCunaView.tsx ✅
    └── ui/
        └── NeumorphicComponents.tsx ✅
```

---

## 2. CAPA DE DOMINIO - Análisis Completo

### 2.1 Entidades ✅ IMPLEMENTADAS

| Entidad | Estado | Notas |
|---------|--------|-------|
| Cuna | ✅ | Entidad principal completa |
| Audio | ✅ | Relación 1:1 con Cuna |
| Mencion | ✅ | Texto para locución |
| Presentacion | ✅ | Entrada de programa |
| Cierre | ✅ | Salida de programa |
| PromoIDA | ✅ | Variables dinámicas |
| CunaVersion | ❌ | No existe - Necesario para versionado |
| HistorialUso | ❌ | No existe - Necesario para tracking |
| GrupoDistribucion | ✅ | Grupos de envío |
| ValidacionVencimientos | ❌ | No existe como entidad - Es servicio |

### 2.2 Value Objects ✅ IMPLEMENTADOS

| Value Object | Estado | Notas |
|--------------|--------|-------|
| CunaId | ✅ | Formato SPX000000 |
| CalidadAudio | ✅ | Especificaciones técnicas |
| Duracion | ✅ | Segundos/frames |
| TiempoLocucion | ✅ | Timing menciones |
| EstadoCuna | ✅ | Estados y transiciones |
| VariablePersonalizada | ✅ | Para IDAs |

**FALTANTES:**
- `DimensionesAsset.ts` ✅ Existe pero no en specification original
- `FormatoBanner.ts` ✅ Existe pero no en specification original
- `PlataformaDestino.ts` ✅ Existe pero no en specification original
- `TipoVideo.ts` ✅ Existe pero no en specification original

---

## 3. API REST - Endpoints Implementados

### ✅ CONSTRUIDOS (en `src/app/api/cunas/`)

| Endpoint | Método | Estado | Funcionalidad |
|----------|--------|--------|--------------|
| `/api/cunas` | GET | ✅ | Listado con filtros |
| `/api/cunas` | POST | ✅ | Crear cuña |
| `/api/cunas` | PUT | ✅ | Bulk update |
| `/api/cunas/[id]` | GET | ✅ | Detalle cuña |
| `/api/cunas/[id]` | PUT | ✅ | Actualizar cuña |
| `/api/cunas/[id]` | DELETE | ✅ | Soft delete |
| `/api/cunas/[id]` | PATCH | ✅ | Acciones específicas |
| `/api/cunas/materiales` | GET | ✅ | Listar materiales |
| `/api/cunas/alerts` | GET/POST/PUT | ✅ | Sistema de alertas |
| `/api/cunas/inbox` | GET/POST/PUT | ✅ | Bandeja de entrada |
| `/api/cunas/programacion` | GET/POST/PUT/DELETE | ✅ | Programación |
| `/api/cunas/reserve-id` | GET/POST/PUT | ✅ | Reserva de IDs |
| `/api/cunas/material-pendiente` | GET/POST/PUT | ✅ | Material pendiente |

### ❌ FALTANTES

| Endpoint | Estado | Notas |
|----------|--------|-------|
| `/api/cunas/[id]/audio` | ❌ | Upload de audio |
| `/api/cunas/[id]/validar` | ❌ | Validación completa |
| `/api/cunas/[id]/distribuir` | ❌ | Envío a operadores |
| `/api/cunas/[id]/exportar` | ❌ | Exportación a sistemas |
| `/api/cunas/buscar` | ⚠️ | Implementado en `/api/registro-emision/buscar/spx` |
| `/api/cunas/metricas` | ❌ | Métricas operativas |

---

## 4. BASE DE DATOS - Esquemas

### ✅ CONSTRUIDOS (en `src/lib/db/`)

| Schema | Archivo | Estado |
|--------|---------|--------|
| cunas | cunas-schema.ts | ✅ Completo |
| cunas_extended | cunas-extended-schema.ts | ✅ Menciones,Presentaciones,Cierres,PromoIDA |
| cunas_digital | cunas-digital-schema.ts | ✅ Digital assets, trackers, targeting |
| cunas_compliance | cunas-compliance-schema.ts | ✅ Compliance, approval overrides |
| cunas_programacion | cunas-programacion-schema.ts | ✅ Programación, bloques |
| materiales | materiales-schema.ts | ✅ Copy instructions, rotacion, cunas gemelas |

### Índices Creados ✅
- `cunas_tenant_idx` - Tenant
- `cunas_anunciante_idx` - Anunciante
- `cunas_campana_idx` - Campaña
- `cunas_contrato_idx` - Contrato
- `cunas_codigo_idx` - Código
- `cunas_spx_code_idx` - SPX Code
- `cunas_tipo_idx` - Tipo
- `cunas_estado_idx` - Estado
- `cunas_vigencia_idx` - Vigencia
- `cunas_fingerprint_idx` - Fingerprint

---

## 5. FRONTEND - Vistas y Componentes

### ✅ IMPLEMENTADO

| Componente | Ruta | Estado |
|-----------|------|--------|
| Dashboard Cuñas | `presentation/views/CunasDashboardView.tsx` | ✅ Funcional |
| Crear Cuña | `presentation/views/CreaCunaView.tsx` | ✅ Funcional |
| Componentes Neumórficos | `presentation/ui/NeumorphicComponents.tsx` | ✅ Completos |
| Gestión Cuñas Rechazadas | `modules/campanas/presentation/components/GestionCunasRechazadas.tsx` | ✅ Compartido |

### ❌ FALTANTES (según especificación)

| Componente | Estado | Notas |
|-----------|--------|-------|
| Editor Audio Profesional (DAW) | ❌ | Especificado en líneas 613-638 |
| Editor Menciones con análisis | ❌ | Especificado en líneas 739-769 |
| Editor Presentaciones por día | ❌ | Especificado en líneas 897-1034 |
| Editor Cierres con sugerencias | ❌ | Especificado en líneas 1035-1063 |
| Editor Promo/IDA con variables | ❌ | Especificado en líneas 1064-1148 |
| Panel Validaciones Completas | ❌ | Especificado en líneas 1149-1390 |
| Centro Distribución y Envíos | ❌ | Especificado en líneas 1392-1640 |
| Configuración Programación/Vencimientos | ❌ | Especificado en líneas 1641-1799 |
| Timeline Historial Completo | ❌ | Especificado en líneas 1800-1934 |
| Wizard Copiar Cuña | ❌ | Especificado en líneas 1935-2097 |
| Dashboard Gerencial | ❌ | Especificado en líneas 2272-2491 |

---

## 6. SERVICIOS EXTERNOS - Estado

### ⚠️ STUBS o PARCIALES

| Servicio | Estado | Implementación |
|----------|--------|----------------|
| CortexVoiceService | ⚠️ STUB | `console.log` - Sin IA real |
| CortexSenseService | ⚠️ STUB | `console.log` - Sin verificación real |
| EmisionExportService | ⚠️ STUB | Logs únicamente |
| BroadcastExportService | ⚠️ STUB | Logs únicamente |
| Alertavencimientoservice | ⚠️ STUB | Solo scheduling básico |
| VencimientosValidationService | ⚠️ STUB | Fetch sin implementación real |

### ❌ NO IMPLEMENTADOS

| Servicio | Estado | Notas |
|----------|--------|-------|
| AudioProcessingService | ❌ | No existe - Necesario para análisis de audio |
| SpeechTimingAnalysisService | ❌ | No existe - Necesario para menciones |
| EmailDistributionService | ❌ | No existe - Necesario para distribución |
| WhatsAppDistributionService | ❌ | No existe - Necesario para distribución |
| WideOrbitExportService | ❌ | No existe - Necesario para emisión |
| SaraExportService | ❌ | No existe - Necesario para emisión |
| DaletExportService | ❌ | No existe - Necesario para emisión |

---

## 7. INTEGRACIONES - Estado

### 7.1 Módulo Contratos ✅ PARCIAL

| Integración | Estado | Implementación |
|-------------|--------|---------------|
| Validación material al crear contrato | ⚠️ | STUB en `MaterialCreativoValidationService` |
| Creación automática desde contrato | ❌ | No implementado |
| Auto-fill de datos | ✅ | En `smart-capture/route.ts` |

### 7.2 Módulo Vencimientos ⚠️ PARCIAL

| Integración | Estado | Implementación |
|-------------|--------|---------------|
| Validación presentaciones | ⚠️ | `VencimientosValidationService` STUB |
| Sincronización bidireccional | ❌ | No implementado |
| Detección material faltante | ❌ | No implementado |

### 7.3 Módulo Campañas ✅ IMPLEMENTADO

| Integración | Estado | Implementación |
|-------------|--------|---------------|
| Asociación cunas-campaña | ✅ | `campanasCunas` table |
| Distribución por campaña | ✅ | En endpoints |
| Cuñas gemelas | ✅ | `cunas_gemelas` table |

### 7.4 Módulo Emisoras ✅ IMPLEMENTADO

| Integración | Estado | Implementación |
|-------------|--------|---------------|
| Association through pauta | ✅ | `pautaCampana` table |
| Programación horaria | ✅ | `programacionCunas` table |

### 7.5 Registro de Emisión ✅ IMPLEMENTADO

| Integración | Estado | Implementación |
|-------------|--------|---------------|
| Tracking reproducción | ✅ | `reproduccionesCuna` table |
| Detección de emisiones | ✅ | `registroDeteccion` table |

### 7.6 Cortex ⚠️ PARCIAL

| Servicio | Estado | Implementación |
|----------|--------|---------------|
| Cortex-Voice (IA Audio) | ⚠️ STUB | Solo logs |
| Cortex-Sense (Verificación) | ⚠️ STUB | Solo logs |

---

## 8. SISTEMA DE PERMISOS (RBAC)

### ✅ IMPLEMENTADO en `src/lib/services/sistema-rbac.ts`

| Rol | Permisos cunas |
|-----|----------------|
| admin | ver, crear, editar, eliminar, aprobar, exportar |
| ejecutivo | ver, crear, editar, exportar |
| operador | ver, crear, editar |
| viewer | ver |

---

## 9. FLUJO DE ESTADOS IMPLEMENTADO

### ✅ ESTADOS Y TRANSICIONES

```
borrador → pendiente_aprobacion → aprobada → en_aire → finalizada
    ↓           ↓                  ↓           ↓
rechazada     pausa              pausa      pausada
    ↓
rechazada
```

**Verificado en:**
- `domain/value-objects/EstadoCuna.ts` ✅
- `application/handlers/CambiarEstadoCunaHandler.ts` ✅
- `application/handlers/BulkUpdateCunasHandler.ts` ✅

---

## 10. CARACTERÍSTICAS ESPECIFICADAS Y NO IMPLEMENTADAS

### 10.1 Editor Audio Profesional (DAW)

**Especificación:** Líneas 613-638 del TXT
- Waveform visual
- Transport controls
- Auto-trim, normalize, fades
- Análisis LUFS, peaks
- Exportación broadcast

**Estado:** ❌ NO IMPLEMENTADO

### 10.2 Sistema Distribución Email/WhatsApp

**Especificación:** Líneas 1392-1640 del TXT
- Grupos de distribución
- Plantillas de email
- Tracking de confirmaciones
- Notificaciones en tiempo real

**Estado:** ❌ NO IMPLEMENTADO

### 10.3 Sistema Alertas Vencimientos Inteligente

**Especificación:** Líneas 1678-1799 del TXT
- Alertas 7 días, 3 días, 1 día
- Análisis predictivo de renovaciones
- ML prediction score
- Notificaciones escaladas

**Estado:** ⚠️ PARCIAL - Solo scheduling básico en `Alertavencimientoservice`

### 10.4 Dashboard Operativo Gerencial

**Especificación:** Líneas 2272-2491 del TXT
- Métricas tiempo real
- Performance equipo
- Análisis predictivo
- Reportes automáticos

**Estado:** ❌ NO IMPLEMENTADO

### 10.5 Copiar Cuña Inteligente

**Especificación:** Líneas 1935-2097 del TXT
- Wizard de copia
- Elementos copiados/no copiados
- Sugerencias de versión
- Series de cuñas

**Estado:** ⚠️ PARCIAL - Handler existe pero sin wizard UI

### 10.6 Exportación a Sistemas de Emisión

**Especificación:** Líneas 2193-2270 del TXT
- WideOrbit format
- Sara format
- Dalet format
- Marketron

**Estado:** ⚠️ PARCIAL - `EmisionExportService` existe con tipos pero sin implementación real

### 10.7 PWA y Experiencia Móvil

**Especificación:** Líneas 2700-2765 del TXT
- Drag & drop móvil
- Voice recording
- Offline queueing
- Push notifications

**Estado:** ❌ NO IMPLEMENTADO

### 10.8 Blockchain Certification

**Especificación:** Líneas 2629-2643 del TXT
- Certificación de emisión
- Hash de verificación

**Estado:** ❌ NO IMPLEMENTADO (futuro)

### 10.9 AI Generative Content

**Especificación:** Líneas 2612-2626 del TXT
- GPT-4/Claude para copy
- Generación variaciones

**Estado:** ⚠️ STUB - CortexVoiceService existe pero sin IA real

---

## 11. RESUMEN DE IMPLEMENTACIÓN

### Porcentaje por Área

| Área | % Implementado | Estado |
|------|---------------|--------|
| Domain Layer (Entities, VOs, Repos) | 85% | ⚠️ Faltan Version, HistorialUso |
| Application Layer (Commands, Handlers) | 90% | ✅ Muy completo |
| Infrastructure (DB, Mappers) | 80% | ⚠️ Servicios externos stubs |
| API REST Endpoints | 70% | ⚠️ Faltan audio upload, exportar |
| Frontend Views | 40% | ❌ Editor audio, dashboard faltan |
| Servicios Externos | 15% | ❌ Mayoría stubs o missing |
| Integraciones | 50% | ⚠️ Parciales |
| UI/UX Completo | 25% | ❌ Mucha UI especificada falta |

### Estado General: ~55% COMPLETO

---

## 12. PLAN DE TRABAJO - TODO LIST MAESTRA

### FASE 1: Core API y Persistencia ✅ YA HECHO
- [x] Esquemas de base de datos completos
- [x] Repositorios Drizzle
- [x] Handlers de dominio
- [x] API routes CRUD básicas
- [x] RBAC permissions

### FASE 2: Completar API REST
- [ ] Implementar `/api/cunas/[id]/audio` - Upload y procesamiento
- [ ] Implementar `/api/cunas/[id]/validar` - Validación completa
- [ ] Implementar `/api/cunas/[id]/distribuir` - Sistema de distribución
- [ ] Implementar `/api/cunas/[id]/exportar` - Exportación a sistemas
- [ ] Implementar `/api/cunas/metricas` - Endpoint métricas

### FASE 3: Audio Processing Service
- [ ] Crear `AudioProcessingService` para análisis técnico
- [ ] Implementar waveform generation
- [ ] Implementar normalización LUFS
- [ ] Implementar validación calidad broadcast
- [ ] Integrar con Cortex-Voice real

### FASE 4: Sistema Distribución
- [ ] Crear `EmailDistributionService`
- [ ] Crear `WhatsAppDistributionService`
- [ ] Implementar grupos de distribución
- [ ] Implementar tracking de confirmaciones
- [ ] Crear plantillas de email

### FASE 5: Validación Cruzada Vencimientos
- [ ] Completar `VencimientosValidationService`
- [ ] Implementar sincronización bidireccional
- [ ] Implementar detección material faltante
- [ ] Crear alertas de desincronización

### FASE 6: Editor Audio Profesional (DAW)
- [ ] Crear componente `AudioEditorView.tsx`
- [ ] Implementar waveform visualization
- [ ] Implementar transport controls
- [ ] Implementar auto-trim, normalize, fades
- [ ] Implementar análisis técnico en tiempo real

### FASE 7: Dashboard Operativo
- [ ] Crear `DashboardOperativoView.tsx`
- [ ] Implementar métricas tiempo real
- [ ] Implementar panel alertas
- [ ] Implementar análisis predictivo
- [ ] Crear reportes automáticos

### FASE 8: Exportación Sistemas de Emisión
- [ ] Implementar `WideOrbitExportService`
- [ ] Implementar `SaraExportService`
- [ ] Implementar `DaletExportService`
- [ ] Implementar formatos específicos por sistema

### FASE 9: Menciones y Presentaciones
- [ ] Crear `MencionEditorView.tsx` con análisis de locución
- [ ] Crear `PresentacionEditorView.tsx` con validación vencimientos
- [ ] Crear `CierreEditorView.tsx` con sugerencias
- [ ] Crear `PromoIDAEditorView.tsx` con variables

### FASE 10: Sistema Alertas Vencimientos
- [ ] Completar `Alertavencimientoservice`
- [ ] Implementar análisis predictivo
- [ ] Implementar ML prediction para renovaciones
- [ ] Implementar notificaciones escaladas

### FASE 11: Wizard Copiar Cuña
- [ ] Crear `CopiarCunaWizard.tsx`
- [ ] Implementar lógica de copia inteligente
- [ ] Implementar sugerencias de serie
- [ ] Implementar versionado automático

### FASE 12: PWA y Mobile
- [ ] Configurar service worker
- [ ] Implementar offline queueing
- [ ] Implementar drag & drop móvil
- [ ] Implementar push notifications

### FASE 13: Testing y Documentación
- [ ] Tests unitarios entidades
- [ ] Tests integración repositorios
- [ ] Tests E2E API
- [ ] Documentación API completa

---

## 13. PRIORIDADES RECOMENDADAS

### URGENTE (Bloquea operación)
1. Audio upload y procesamiento
2. Sistema distribución email/WhatsApp
3. Validación vencimientos

### ALTA PRIORIDAD (Funcionalidad core)
4. Editor audio profesional
5. Exportación sistemas emisión
6. Dashboard operativo

### MEDIA PRIORIDAD (Mejora experiencia)
7. Menciones/Presentaciones editor
8. Sistema alertas vencimientos
9. Wizard copiar cuña

### BAJA PRIORIDAD (Diferido)
10. PWA y mobile
11. Blockchain certification
12. AI generativo avanzado

---

## 14. NOTAS TÉCNICAS

### Dependencias Externas Requeridas
- Google Cloud Storage (GCS) para archivos de audio
- Servicio de email (SendGrid, Resend, etc.)
- WhatsApp Business API
- Cortex-Voice API (IA)
- WideOrbit/Sara/Dalet APIs

### Consideraciones
- Los stubs de servicios externos deben completarse con implementaciones reales
- La UI especificada es extensive - requiere priorización
- Las integraciones con vencimientos son críticas para el flujo de negocio
- El sistema de distribución es clave para operación diaria

---

**Documento generado:** 2026-04-22  
**Siguiente paso:** Ejecutar plan por fases, priorizando urgencia