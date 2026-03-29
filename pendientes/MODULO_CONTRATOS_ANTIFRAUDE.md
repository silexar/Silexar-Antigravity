# 📋 PENDIENTES - Módulo de Contratos y Sistema Anti-Fraude

**Fecha de última actualización:** 24 de Diciembre de 2024  
**Estado:** Pre-Producción  
**Responsable:** _Por asignar_

---

## 🔴 CRÍTICO - Antes de Producción

### 1. Migraciones de Base de Datos

- [ ] Ejecutar migraciones para crear las nuevas tablas:
  - `contratos_evidencias`
  - `contratos_aprobaciones`
  - `contratos_historial_cambios`
- [ ] Agregar nuevos campos al enum `estado_contrato`:
  - `pendiente_evidencia`
  - `aprobado_parcial`
  - `pendiente_reaprobacion`
  - `operativo`
- [ ] Agregar enum `tipo_cliente` (`comercial`, `asistencia`, `beneficencia`)
- [ ] Agregar campo `tipo_cliente` a la tabla `contratos`

**Comando sugerido:**

```bash
npx drizzle-kit push:pg
# o
npx drizzle-kit generate:pg && npx drizzle-kit migrate
```

---

### 2. Autenticación y Permisos

- [ ] Conectar `usePermisosContrato.ts` con el sistema de autenticación real
  - Actualmente usa un usuario mock (`getMockUsuarioActual`)
  - Debe obtener el usuario de: Contexto de autenticación / JWT / Sesión
- [ ] Conectar `ContratoAuthorizationMiddleware.ts` con el sistema de usuarios real
  - Actualmente `validateToken` retorna un contexto mock
- [ ] Configurar los aprobadores por nivel jerárquico en la base de datos
  - ¿Quién es la "Jefatura Directa" de cada ejecutivo?
  - ¿Quién es el "Gerente Comercial"?
  - ¿Quién es el "Gerente General"?

---

### 3. Almacenamiento de Archivos

- [ ] Configurar servicio de almacenamiento para evidencias (GCS, S3, etc.)
- [ ] Implementar subida real de archivos en `AutorizacionPanel.tsx`
  - El callback `onEvidenciaUpload` debe conectarse al servicio
- [ ] Generar URLs firmadas para descarga segura de evidencias
- [ ] Implementar generación de hash SHA-256 real en `generarHashDocumento()`

---

### 4. Servicios Backend

- [ ] Implementar endpoint real para `CampanaService.obtenerContratoValidacion()`
  - Actualmente retorna datos mock
  - Debe consultar la BD real
- [ ] Crear endpoints REST/GraphQL para:
  - `POST /api/contratos/:id/evidencias` - Subir evidencia
  - `POST /api/contratos/:id/aprobaciones` - Registrar aprobación
  - `GET /api/contratos/:id/autorizacion` - Obtener estado de autorización

---

## 🟡 IMPORTANTE - Requiere Antes de Go-Live

### 5. Notificaciones

- [ ] Implementar sistema de notificaciones para aprobadores
  - Email cuando se requiere su aprobación
  - Recordatorios si no aprueban en X horas
  - Notificación de cambios que requieren re-aprobación
- [ ] Integrar con servicio de email (SendGrid, SES, etc.)

### 6. Validación de Especificaciones FM/Digital

- [ ] Implementar validación detallada en `StepEspecificaciones.tsx`:
  - FM/Radio: emisora, programa, horario, duración, spots
  - Digital: plataforma, formato, impresiones
- [ ] Crear UI para capturar estos campos específicos

### 7. Testing

- [ ] Escribir tests unitarios para `AntiFraudeService.ts`
- [ ] Escribir tests unitarios para `CampanaValidacionService.ts`
- [ ] Pruebas de integración del flujo completo:
  - Crear contrato → Subir evidencia → Aprobar → Crear campaña
- [ ] Pruebas de la excepción asistencia/beneficencia
- [ ] Pruebas de re-aprobación tras modificación

---

## 🟢 DESEABLE - Mejoras Post-Lanzamiento

### 8. Mejoras de UX

- [ ] Agregar indicadores de progreso en el proceso de aprobación
- [ ] Implementar preview de documentos adjuntos
- [ ] Agregar timeline visual del historial de cambios
- [ ] Notificaciones en tiempo real (WebSocket)

### 9. Analytics y Reportes

- [ ] Dashboard de contratos por estado de autorización
- [ ] Tiempo promedio de aprobación por nivel
- [ ] Contratos rechazados y motivos
- [ ] Alertas de contratos con descuentos atípicos

### 10. Auditoría Avanzada

- [ ] Integrar con sistema de logging centralizado
- [ ] Registrar IP y dispositivo de cada acción
- [ ] Reportes de auditoría para compliance

---

## 📝 Notas Técnicas

### Archivos Principales del Sistema Anti-Fraude

| Archivo                              | Ubicación                    | Descripción               |
| ------------------------------------ | ---------------------------- | ------------------------- |
| `AntiFraudeService.ts`               | `WizardContrato/services/`   | Lógica de negocio         |
| `AutorizacionPanel.tsx`              | `WizardContrato/enterprise/` | UI del paso 6             |
| `usePermisosContrato.ts`             | `WizardContrato/hooks/`      | Hook de permisos frontend |
| `CampanaValidacionService.ts`        | `campanas/services/`         | Validación para campañas  |
| `CampanaService.ts`                  | `campanas/services/`         | Servicio de campañas      |
| `contratos-schema.ts`                | `lib/db/`                    | Schema de BD              |
| `ContratoAuthorizationMiddleware.ts` | `contratos/middleware/`      | Middleware backend        |

### Umbrales de Descuento

| Rango      | Aprobadores                              | Justificación       |
| ---------- | ---------------------------------------- | ------------------- |
| 0% - 50%   | Jefatura Directa                         | No                  |
| 51% - 64%  | Jefatura + Gerente Comercial             | No                  |
| 65% - 100% | Jefatura + Gte. Comercial + Gte. General | **Sí, obligatoria** |

### Tipos de Cliente

| Tipo           | Validación   | Excepción                                   |
| -------------- | ------------ | ------------------------------------------- |
| `comercial`    | Completa     | Ninguna                                     |
| `asistencia`   | Simplificada | Puede crear campañas sin contrato operativo |
| `beneficencia` | Simplificada | Puede crear campañas sin contrato operativo |

---

## ✅ Checklist Pre-Deploy

- [ ] Migraciones ejecutadas en staging
- [ ] Usuarios de prueba configurados con diferentes niveles
- [ ] Servicio de almacenamiento configurado
- [ ] Sistema de autenticación conectado
- [ ] Tests pasando
- [ ] Revisión de código completada
- [ ] Documentación actualizada

---

> **Contacto:** Para dudas técnicas sobre este módulo, revisar el walkthrough en `.gemini/antigravity/brain/.../walkthrough.md`
