# 📋 PENDIENTES - Módulo de Campañas y Control de Planificación

**Fecha de última actualización:** 24 de Diciembre de 2024  
**Estado:** Pre-Producción  
**Responsable:** _Por asignar_

---

## 🔴 CRÍTICO - Antes de Producción

### 1. Migraciones de Base de Datos

- [ ] Ejecutar migraciones para agregar nuevos campos a `campanas`:
  - `facturada` (boolean)
  - `fechaFacturacion` (timestamp)
  - `facturaId` (uuid)
  - `bloqueadaParaEdicion` (boolean)
  - `desbloqueadaPorId` (uuid)
  - `fechaDesbloqueo` (timestamp)
  - `motivoDesbloqueo` (text)
  - `especificacionesValidadas` (boolean)
  - `motivoBloqueoEspecificaciones` (text)
- [ ] Agregar nuevos estados al enum `estado_campana`:
  - `armada`
  - `confirmada`

**Comando sugerido:**

```bash
npx drizzle-kit push:pg
```

---

### 2. Conexión con Sistema Real de Especificaciones

- [ ] Implementar `obtenerEspecificacionesContrato()` en `CampanaControlService.ts`
  - Actualmente retorna datos mock
  - Debe consultar la tabla `contratosItems` o `contratosEspecificaciones`
- [ ] Crear endpoint API: `GET /api/contratos/:id/especificaciones`

---

### 3. Sistema de Permisos

- [ ] Conectar `useControlCampana.ts` con sistema de autenticación real
  - Actualmente usa `getMockUsuario()`
- [ ] Configurar niveles de permiso en la base de datos:
  - `programador`: Crear y editar campañas
  - `ejecutivo`: Todo lo anterior + aprobar
  - `jefatura`: Todo lo anterior + desbloquear
  - `supervisor_facturacion`: Desbloquear campañas facturadas
  - `admin`: Todos los permisos

---

### 4. Integración con Facturación

- [ ] Al facturar una campaña, actualizar automáticamente:
  - `facturada = true`
  - `fechaFacturacion = now()`
  - `facturaId = <id de factura>`
  - `bloqueadaParaEdicion = true`
- [ ] Crear endpoint: `POST /api/campanas/:id/desbloquear`

---

## 🟡 IMPORTANTE - Requiere Antes de Go-Live

### 5. Notificaciones

- [ ] Alertar a jefatura cuando se solicita desbloqueo
- [ ] Notificar al usuario cuando campaña es desbloqueada
- [ ] Log de auditoría de desbloqueos

### 6. UI/UX

- [ ] Agregar modal de confirmación para desbloqueo
- [ ] Mostrar historial de modificaciones en campaña
- [ ] Mejorar mensaje cuando campaña está en estado "armada"

### 7. Testing

- [ ] Tests unitarios para `CampanaControlService.ts`
- [ ] Tests de integración del flujo de planificación
- [ ] Pruebas de permisos por nivel

---

## 🟢 DESEABLE - Mejoras Post-Lanzamiento

### 8. Mejoras de Flujo

- [ ] Permitir planificación parcial (solo emisoras con especificación)
- [ ] Workflow de aprobación para campañas armadas
- [ ] Integración con calendario de disponibilidad

### 9. Analytics

- [ ] Dashboard de campañas por estado
- [ ] Métricas de tiempo de aprobación
- [ ] Reporte de campañas bloqueadas

---

## 📝 Notas Técnicas

### Archivos Principales del Control de Campañas

| Archivo                       | Ubicación                    | Descripción                    |
| ----------------------------- | ---------------------------- | ------------------------------ |
| `CampanaControlService.ts`    | `modules/campanas/services/` | Lógica de validación y control |
| `useControlCampana.ts`        | `WizardCampana/hooks/`       | Hook frontend                  |
| `AlertaValidacionCampana.tsx` | `WizardCampana/`             | Componente de alertas          |
| `StepProgramacionCampana.tsx` | `WizardCampana/`             | Step con validación integrada  |
| `campanas-schema.ts`          | `lib/db/`                    | Schema actualizado             |

### Estados de Campaña

| Estado          | Descripción                      | Puede Planificar            |
| --------------- | -------------------------------- | --------------------------- |
| `planificacion` | En edición                       | ✅ Si especificaciones OK   |
| `armada`        | Sin especificaciones en contrato | ❌ No                       |
| `aprobacion`    | Pendiente de aprobación          | ❌ No                       |
| `confirmada`    | Aprobada                         | ⚠️ Solo supervisor/jefatura |
| `programada`    | Planificada                      | ⚠️ Solo supervisor/jefatura |
| `en_aire`       | Emitiendo                        | ❌ No                       |
| `completada`    | Finalizada                       | ❌ No                       |

### Niveles de Permiso para Desbloqueo

| Nivel                    | Puede Desbloquear | Puede Modificar Facturada |
| ------------------------ | ----------------- | ------------------------- |
| `programador`            | ❌                | ❌                        |
| `ejecutivo`              | ❌                | ❌                        |
| `jefatura`               | ✅                | ✅                        |
| `supervisor_facturacion` | ✅                | ✅                        |
| `admin`                  | ✅                | ✅                        |

---

## ✅ Checklist Pre-Deploy

- [ ] Migraciones ejecutadas en staging
- [ ] Permisos configurados
- [ ] Especificaciones de contratos migradas
- [ ] Tests pasando
- [ ] Documentación actualizada
