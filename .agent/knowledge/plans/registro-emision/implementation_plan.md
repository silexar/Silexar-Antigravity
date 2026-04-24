# 📋 Plan de Implementación — Módulo Registro de Emisión v2

> **Tier:** Core (DDD Completo)  
> **Ubicación objetivo:** `src/modules/registro-emision/`  
> **Fecha:** 2026-04-16  
> **Basado en:** `silexar-module-builder/SKILL.md` + especificación `🎵 MÓDULO REGISTRO DE EMISIÓN - ESP.txt`

---

## 1. Resumen Ejecutivo

**Objetivo:** Construir el módulo **Registro de Emisión** como un módulo **Tier Core** con arquitectura DDD completa en `src/modules/registro-emision/`, migrando y consolidando el código legacy disperso.

**Innovación diferenciadora clave:** Sistema de **Secure Links con Código de Acceso Exclusivo**. El ejecutivo no envía archivos pesados por email; el sistema genera un **código único + link seguro**. El cliente ingresa el código, escucha la evidencia en línea, puede descargarla, y el registro se autodestruye a los **30 días**. Trazabilidad completa de quién accedió y cuándo.

---

## 2. Estado Actual (Deuda Técnica)

| Ubicación | Estado | Acción |
|-----------|--------|--------|
| `src/lib/modules/registro-emision/` | DDD parcial con mocks. Referencias rotas. | **Migrar + reescribir** a `src/modules/registro-emision/` |
| `src/app/api/registro-emision/route.ts` | Mock data estático. | **Reemplazar** con API real DDD |
| `src/app/api/registro-emision/verificacion/route.ts` | Referencia a módulo antiguo. | **Actualizar** |
| `src/app/api/registro-emision/grilla/route.ts` | Query directa sin DDD. | **Refactorizar** a Query/Handler |
| `src/app/api/registro-emision/secure-link/route.ts` | Mock con `Map<string, LinkData>`. | **Convertir** a servicio real con DB |
| `src/lib/db/emision-schema.ts` | Tiene `tandas`, `spotsTanda`, `registroDeteccion`. **Faltan tablas** para verificaciones, clips, certificados, alertas, tokens. | **Extender** |
| Frontend `src/app/registro-emision/` | UI mock sin conexión real. | **Reescribir y conectar** |

---

## 3. Alcance MVP (Pragmático pero diferenciador)

### ✅ INCLUIDO en MVP
1. **Wizard de verificación** (5 pasos): Cliente → Campaña → Material → Rango Horario → Fuente de Audio
2. **Procesamiento en 3 fases eficiente**:
   - **Fase 1:** FFmpeg corta el registro de aire al rango horario ± tolerancia
   - **Fase 2:** Fingerprinting para spots pregrabados / STT para menciones
   - **Fase 3:** Extracción del fragmento exacto + editor visual de waveform
3. **Editor de audio inline**: Waveform visual con handles arrastrables para ajustar inicio/fin del clip
4. **Sistema de Secure Links**: Generación de código único + link seguro para que el cliente acceda a la evidencia en línea
5. **Autodestrucción a 30 días**: TTL automático en clips y certificados
6. **Certificado de emisión**: PDF/documento legal con hash SHA-256 y metadatos de trazabilidad
7. **Alertas de programación**: Cuando material no se encuentra, se genera alerta al equipo de programación
8. **Dashboard/Grilla**: Registros con filtros, estadísticas y estados
9. **Exportación**: Descarga ZIP o envío por email del **código/link** (no del archivo adjunto)

### ❌ EXCLUIDO del MVP (futuro)
- Blockchain real distribuido (usamos hash SHA-256 como evidencia legal)
- Quantum engines (usamos stubs con interfaces claras)
- Integraciones reales WhatsApp Business / Google Drive (usamos interfaces)
- AR, Voice Clone Detection, Emotional Analysis
- Real-time monitoring en vivo

---

## 4. Entidades y Value Objects

### Aggregate Root
- `RegistroEmision` — Agrupa todo el proceso de auditoría de una campaña.

### Entidades de Dominio
- `SolicitudVerificacion` — Petición del usuario con parámetros de búsqueda.
- `CorteBusqueda` — El trozo cortado del registro de aire.
- `CoincidenciaDetectada` — Match encontrado con timestamp exacto.
- `ClipEvidencia` — Fragmento final aprobado/editado por el usuario.
- `CertificadoEmision` — Documento legal con hash de evidencia.
- `AlertaDiscrepancia` — Notificación cuando hay problema de emisión.
- `TokenAccesoEvidencia` — Código único + link seguro para acceso del cliente.
- `AccesoEvidencia` — Log de auditoría de quién usó el token.

### Value Objects
- `EstadoVerificacion` — `pendiente` | `analizando` | `completada` | `fallida`
- `PorcentajeCoincidencia` — 0-100 con validación
- `TiempoEmision` — Timestamp exacto con timezone
- `TipoMaterial` — `audio_pregrabado` | `mencion` | `presentacion` | `cierre`
- `CalidadAudio` — Métricas técnicas (SNR, bitrate, sample rate)
- `HashEvidencia` — Hash SHA-256 del clip/certificado
- `CodigoAcceso` — Código alfanumérico de 8-12 caracteres único

---

## 5. Extensiones al Schema de Base de Datos

Archivo a extender: `src/lib/db/emision-schema.ts`

### Tablas nuevas

#### `verificacionesEmision`
- `id`, `tenantId`, `campanaId`, `contratoId?`, `clienteId`, `creadoPorId`
- `fechaInicio`, `fechaFin`, `emisoraIds` (jsonb)
- `estado` (enum), `progresoPorcentaje`, `resultadoJson`
- `fechaCreacion`, `fechaModificacion`

#### `clipsEvidencia`
- `id`, `tenantId`, `verificacionId`, `coincidenciaId?`
- `urlArchivo`, `duracionSegundos`, `formato`
- `hashSha256`, `fechaExpiracion` (30 días)
- `fechaCreacion`

#### `certificadosEmision`
- `id`, `tenantId`, `verificacionId`, `campanaId`, `contratoId?`
- `codigoCertificado` (único por tenant), `hashSha256`, `contenidoJson`
- `fechaEmision`, `fechaExpiracion` (30 días)

#### `alertasProgramacion`
- `id`, `tenantId`, `verificacionId`, `materialId`, `campanaId`
- `tipoAlerta` (enum: `no_emitido`, `coincidencia_baja`, `discrepancia_horario`)
- `mensaje`, `estado` (enum: `pendiente`, `en_revision`, `resuelta`)
- `asignadoA?`, `fechaResolucion?`, `fechaCreacion`

#### `tokensAccesoEvidencia` ⭐ (Innovación diferenciadora)
- `id`, `tenantId`, `clipEvidenciaId`, `certificadoId?`
- `codigoAcceso` (string único, indexado)
- `linkUuid` (string único para URL)
- `estado` (enum: `activo`, `usado`, `expirado`, `revocado`)
- `usosPermitidos`, `usosRealizados`
- `fechaExpiracion` (30 días)
- `fechaCreacion`, `fechaUltimoUso?`

#### `accesosEvidencia` (Auditoría)
- `id`, `tenantId`, `tokenId`
- `ipAddress?`, `userAgent?`, `fechaAcceso`

---

## 6. API Routes

Ubicación: `src/app/api/registro-emision/`

| Ruta | Métodos | Propósito |
|------|---------|-----------|
| `/api/registro-emision/` | `GET`, `POST` | Listar / Crear verificación |
| `/api/registro-emision/[id]/` | `GET`, `PUT`, `DELETE` | CRUD verificación |
| `/api/registro-emision/[id]/procesar` | `POST` | Iniciar análisis (corte + fingerprint/STT) |
| `/api/registro-emision/[id]/clip` | `POST` | Guardar clip editado por usuario |
| `/api/registro-emision/[id]/certificado` | `POST`, `GET` | Generar / Obtener certificado |
| `/api/registro-emision/[id]/token` | `POST` | Generar código de acceso exclusivo ⭐ |
| `/api/registro-emision/grilla` | `GET` | Datos de grilla (Query/Handler) |
| `/api/registro-emision/alertas` | `GET`, `POST` | Listar / Crear alertas |
| `/api/registro-emision/secure-link` | `POST`, `GET`, `DELETE` | Crear/Validar/Revocar link seguro |
| `/api/registro-emision/exportar` | `POST` | Exportar ZIP o enviar email con código/link |

Todas las rutas usan `withApiRoute({ resource: 'emisiones', action: '...' })` + Zod + `withTenantContext()`.

---

## 7. Frontend (Reescritura completa)

### Páginas
- `src/app/registro-emision/page.tsx` — Dashboard principal con métricas
- `src/app/registro-emision/verificar/page.tsx` — Wizard de 5 pasos + procesamiento + resultados
- `src/app/registro-emision/grilla/page.tsx` — Grilla de emisiones con filtros
- `src/app/registro-emision/analytics/page.tsx` — Analytics y compliance
- `src/app/registro-emision/validar/[token]/page.tsx` — **Página pública** donde el cliente ingresa el código y escucha la evidencia ⭐

### Componentes clave
- `WizardVerificacion.tsx` — 5 pasos con progreso
- `ProcesadorTiempoReal.tsx` — Visualización de las 3 fases de procesamiento
- `EditorWaveform.tsx` — Waveform con handles arrastrables para recortar inicio/fin
- `PanelResultados.tsx` — Resultados con clips, transcripciones, métricas
- `ModalGenerarToken.tsx` — Genera código único y link para el cliente ⭐
- `PaginaValidacionCliente.tsx` — Interfaz pública para ingresar código y escuchar
- `AlertaProgramacionModal.tsx` — Enviar alerta al equipo de programación

---

## 8. Servicios Externos (Stubs con interfaces claras)

- `FFmpegAudioProcessor` — Corta archivos de audio eficientemente
- `AudioFingerprintingService` — Para spots pregrabados (stub → ACRCloud)
- `SpeechToTextService` — Para menciones del locutor (stub → Whisper/Google STT)
- `CertificationHashService` — Genera hash SHA-256 del certificado
- `EmailNotificationService` — Envía código/link por email
- `FileStorageService` — Guarda archivos localmente (fácil de cambiar a S3/R2)
- `TtlCleanupService` — Job que elimina clips expirados (>30 días)

---

## 9. Fases de Construcción

### FASE 1: PLAN + SCHEMA (2h)
- Extender `emision-schema.ts` con 5 tablas nuevas
- Generar migración Drizzle
- Registrar schema en `src/lib/db/index.ts`

### FASE 2: DOMINIO DDD (4h)
- Entidades: `RegistroEmision`, `SolicitudVerificacion`, `CorteBusqueda`, `CoincidenciaDetectada`, `ClipEvidencia`, `CertificadoEmision`, `AlertaDiscrepancia`, `TokenAccesoEvidencia`, `AccesoEvidencia`
- Value Objects: `EstadoVerificacion`, `PorcentajeCoincidencia`, `TiempoEmision`, `TipoMaterial`, `CalidadAudio`, `HashEvidencia`, `CodigoAcceso`
- Repositories (interfaces)

### FASE 3: APLICACIÓN (4h)
- Commands: `CrearVerificacionCommand`, `ProcesarVerificacionCommand`, `GuardarClipCommand`, `GenerarCertificadoCommand`, `GenerarTokenAccesoCommand`, `CrearAlertaCommand`
- Queries: `ObtenerVerificacionesQuery`, `ObtenerVerificacionPorIdQuery`, `ValidarTokenAccesoQuery`, `ObtenerAlertasQuery`
- Handlers con **Result Pattern**

### FASE 4: INFRAESTRUCTURA (4h)
- Repositorios Drizzle reales con `withTenantContext()`
- Implementación de servicios externos (stubs)
- Mappers `domain <-> db`

### FASE 5: API + SEGURIDAD (3h)
- Reescribir todas las API routes
- Conectar con Commands/Handlers
- Validación Zod + audit logging
- Página pública `/registro-emision/validar/[token]`

### FASE 6: FRONTEND + INTEGRACIÓN (4h)
- Reescribir páginas existentes
- Crear `EditorWaveform.tsx` y `ModalGenerarToken.tsx`
- Conectar todo al backend

### FASE 7: QC + BUILD (2h)
- `tsc --noEmit` limpio
- `next build` exitoso
- Eliminar código legacy muerto
- Documentar lecciones aprendidas

---

## 10. Estimación Total

| Fase | Tiempo estimado |
|------|-----------------|
| Fase 1: Schema | 2h |
| Fase 2: Dominio | 4h |
| Fase 3: Aplicación | 4h |
| Fase 4: Infraestructura | 4h |
| Fase 5: API | 3h |
| Fase 6: Frontend | 4h |
| Fase 7: QC/Build | 2h |
| **TOTAL** | **~23h** |

---

## 11. Riesgos y Mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Código legacy con dependencias rotas | No editar `src/lib/modules/`. Migrar limpio a `src/modules/` |
| Especificación demasiado ambiciosa | MVP pragmático con stubs bien definidos |
| Frontend mock muy acoplado | Reescribir desde cero conectado a APIs reales |
| Procesamiento de audio en servidor | Usar FFmpeg + stubs. Dejar listo para migrar a servicio externo |
| Almacenamiento de archivos | Guardar localmente por ahora. Fácil cambiar a S3/R2 luego |

---

## 12. Pendientes Pre-Producción (Ejecutar antes de deploy)

| # | Tarea | Prioridad | Estimado |
|---|-------|-----------|----------|
| 1 | **Conectar stubs a servicios reales**: Reemplazar `AudioFingerprintStub` por ACRCloud o similar; `SpeechToTextStub` por Whisper API / Google Speech-to-Text; `ClipExtractionStub` por FFmpeg real con streaming; `CertificateGeneratorStub` por Puppeteer/PDFKit. | CRÍTICA | 4h |
| 2 | Configurar storage real (S3/R2/Cloudflare R2) para archivos de audio y certificados. | CRÍTICA | 2h |
| 3 | Configurar cron de limpieza en producción (Vercel Cron o GitHub Actions). | ALTA | 1h |
| 4 | Revisar y ajustar límites de rate-limiting para el endpoint público `/api/registro-emision/accesos/validar`. | MEDIA | 30m |
| 5 | Agregar tests E2E para el flujo completo: wizard → ejecución → aprobación → acceso seguro. | MEDIA | 3h |

## 13. Checklist de Aprobación Final

- [x] Alcance MVP aprobado (excluir blockchain/quantum real)
- [x] Estructura DDD en `src/modules/registro-emision/` aprobada
- [x] Tablas nuevas aprobadas (incluyendo `tokensAccesoEvidencia`)
- [x] Reescritura de API routes aprobada
- [x] Reescritura de frontend aprobada
- [x] Sistema de **código de acceso exclusivo + link seguro** aprobado como diferenciador central
- [x] Autodestrucción a 30 días aprobada
