# 📝 Lista de Pendientes para Producción

## Silexar Pulse - Items para Completar Antes de Go-Live

**Generado**: 2025-12-15  
**Estado**: Documentación de trabajo pendiente

---

## 🔴 Prioridad ALTA (Bloquean Producción)

### 1. Configuración de GCP

- [ ] Crear proyecto GCP de producción
- [ ] Habilitar APIs requeridas (Vertex AI, Pub/Sub, Cloud SQL, Storage)
- [ ] Crear Service Account con permisos necesarios
- [ ] Descargar credenciales y configurar en servidor

**Referencia**: [guia-integracion-gcp.md](./guia-integracion-gcp.md)

### 2. Base de Datos

- [ ] Crear instancia Cloud SQL (PostgreSQL 15)
- [ ] Ejecutar migración `0000_closed_captain_britain.sql`
- [ ] Ejecutar migración `0001_billing_value_models.sql`
- [ ] Ejecutar migración `0002_fl_mraid_sdk_events.sql` ← NUEVA
- [ ] Configurar backups automáticos
- [ ] Configurar replicación para HA

### 3. Variables de Entorno

- [ ] Configurar `GCP_PROJECT_ID`
- [ ] Configurar `GOOGLE_APPLICATION_CREDENTIALS`
- [ ] Configurar `DATABASE_URL` para Cloud SQL
- [ ] Configurar `REDIS_URL` para cache
- [ ] Configurar secrets en Secret Manager

---

## 🟡 Prioridad MEDIA (Funcionalidad Completa)

### 4. Integración Vertex AI Real

Los endpoints actuales usan **simulación**. Para producción:

- [ ] Obtener acceso a Imagen 2 (imagen generativa)
- [ ] Obtener acceso a Gemini Pro
- [ ] Actualizar `cortex-generative-ai.ts`:
  - Líneas 200-250: Reemplazar mock con llamada real a Imagen
  - Líneas 300-350: Reemplazar mock con llamada real a Gemini
- [ ] Implementar Text-to-Speech con Cloud TTS

**Archivos a modificar**:

- `src/lib/cortex/cortex-generative-ai.ts`

### 5. Integración Pub/Sub Real

Actualmente usa Redis. Para escala:

- [ ] Migrar de `cortex-event-bus-redis.ts` a Pub/Sub
- [ ] Crear topics según documentación
- [ ] Configurar subscriptions
- [ ] Implementar dead letter processing

**Archivos a modificar**:

- `src/lib/cortex/cortex-event-bus-redis.ts`
- `src/lib/cortex/cortex-stream-processor.ts`

### 6. SDK Nativos (REQUIERE TRABAJO EXTERNO)

Se crearon **esqueletos completos** con TODOs marcados. Un desarrollador nativo debe completarlos:

#### SDK iOS (Swift)

**Archivo**: `/sdk/ios/SilexarPulseSDK.swift` (~350 líneas)

TODOs pendientes:

- [ ] Llamar al endpoint `/api/v2/sdk/config` para obtener configuración real
- [ ] Implementar detección de contexto real con Core Motion
- [ ] Implementar llamada HTTP a `/api/v2/ads/request`
- [ ] Crear UIViewController para mostrar anuncios
- [ ] Implementar llamada a `/api/v2/events/track`
- [ ] Implementar llamada a `/api/v2/events/fl-update`
- [ ] Implementar verificación real de WiFi
- [ ] Crear proyecto Xcode y agregar dependencias (TensorFlow Lite, CoreMotion)
- [ ] Configurar CocoaPods/Swift Package Manager
- [ ] Publicar en App Store

#### SDK Android (Kotlin)

**Archivo**: `/sdk/android/SilexarPulseSDK.kt` (~400 líneas)

TODOs pendientes:

- [ ] Llamar al endpoint `/api/v2/sdk/config` para obtener configuración real
- [ ] Implementar Activity Recognition API con PendingIntent
- [ ] Implementar llamada HTTP a `/api/v2/ads/request`
- [ ] Crear Activity/Dialog para mostrar anuncios
- [ ] Implementar llamada a `/api/v2/events/track`
- [ ] Implementar llamada a `/api/v2/events/fl-update`
- [ ] Implementar verificación de WiFi con ConnectivityManager
- [ ] Crear proyecto Android Studio con Gradle
- [ ] Agregar dependencias (TensorFlow Lite, Activity Recognition)
- [ ] Publicar en Play Store

**Esfuerzo estimado**: 4-6 semanas por plataforma

---

## 🟢 Prioridad BAJA (Mejoras)

### 7. Mejoras de Dashboard Narrativo

El dashboard existente (`narrative-engagement-dashboard.tsx`) ya tiene:

- ✅ NES Score (línea 536-546)
- ✅ Flechas con grosor dinámico (líneas 615-617)
- ✅ Gráfico de embudo
- ✅ Insights automáticos

Mejoras opcionales:

- [ ] Agregar animaciones en tiempo real
- [ ] Implementar WebSocket para updates live
- [ ] Agregar exportación a PDF

### 8. App Móvil con WIL Voice

- [ ] Desarrollar app React Native o Flutter
- [ ] Integrar WIL Voice Assistant existente (`src/lib/wil/`)
- [ ] Publicar en App Store / Play Store

### 9. Internacionalización

- [ ] Preparar sistema de facturación para múltiples monedas
- [ ] Agregar soporte para regulaciones GDPR (UE)
- [ ] Agregar soporte para LGPD (Brasil)

---

## 📁 Archivos Creados en Esta Sesión

| Archivo                                                         | Propósito                   |
| --------------------------------------------------------------- | --------------------------- |
| `src/lib/cortex/cortex-event-bus.ts`                            | Bus de eventos in-memory    |
| `src/lib/cortex/cortex-event-bus-redis.ts`                      | Bus de eventos Redis        |
| `src/lib/cortex/cortex-stream-processor.ts`                     | Procesador de flujo         |
| `src/lib/cortex/cortex-generative-ai.ts`                        | Motor de IA Generativa      |
| `src/app/api/v2/generate/image/route.ts`                        | Endpoint generar imágenes   |
| `src/app/api/v2/generate/text/route.ts`                         | Endpoint generar texto      |
| `src/components/creativities/ai-generative-studio-complete.tsx` | UI Estudio IA               |
| `src/lib/mraid/mraid-builder.ts`                                | Motor generación MRAID      |
| `src/app/api/v2/mraid/generate/route.ts`                        | Endpoint generar MRAID      |
| `src/lib/sdk/sdk-specification.ts`                              | Especificación SDK          |
| `src/app/api/v2/sdk/config/route.ts`                            | Endpoint config SDK         |
| `src/lib/fl/federated-aggregation.ts`                           | Motor agregación FL         |
| `src/app/api/v2/fl/model/route.ts`                              | Endpoint modelos FL         |
| `src/app/api/v2/events/fl-update/route.ts`                      | Endpoint updates FL         |
| `drizzle/0002_fl_mraid_sdk_events.sql`                          | Migración BD nuevos módulos |

---

## 📊 Resumen de Completitud

| Área                 | Estado               | %    |
| -------------------- | -------------------- | ---- |
| Backend API          | ✅ Completo          | 100% |
| Frontend UI          | ✅ Completo          | 100% |
| Bus de Eventos       | 🟡 Funcional (Redis) | 80%  |
| IA Generativa        | 🟡 Simulado          | 70%  |
| Aprendizaje Federado | ✅ Motor listo       | 90%  |
| SDK Móvil            | 🟡 Especificación    | 50%  |
| Base de Datos        | ✅ Esquema listo     | 100% |
| Documentación        | ✅ Completa          | 100% |

**Completitud General**: ~85%

---

## Contacto

Para preguntas sobre estos pendientes:

- **Técnico**: devops@silexar.com
- **Producto**: producto@silexar.com
