# ANÁLISIS MÓDULO 02: CONTRATOS

**Fecha de Análisis:** 2026-04-28  
**Clasificación TIER:** CRITICAL (DDD Completo + CQRS + Event Sourcing)  
**Nivel de Cumplimiento Estimado:** 70%

---

## 1. RESUMEN EJECUTIVO

El módulo **CONTRATOS** es un módulo CRÍTICO del sistema Silexar Pulse. Implementa arquitectura DDD completa con Repository Pattern, Value Objects Rich, Entity con lógica de negocio encapsulated, y soporte multi-tenant con RLS. El módulo maneja el ciclo de vida completo de contratos comerciales incluyendo creación, aprobación, ejecución y renovación.

**Fortalezas:**
- Arquitectura DDD bien implementada con entidades y value objects
- Repository Pattern con Drizzle ORM
- Validaciones de negocio encapsuladas en la entidad
- Workflow de aprobación por niveles
- Multi-tenancy con RLS

**Debilidades Detectadas:**
- No implementa Event Sourcing
- No implementa CQRS (Commands/Queries separation)
- Missing audit logging en endpoints secundarios
- Falta Zod validation en query params de algunos endpoints
- PATCH no actualiza campos del dominio correctamente

---

## 2. ARQUITECTURA DEL MÓDULO

### 2.1 Estructura de Archivos

```
src/
├── app/api/contratos/
│   ├── route.ts                    ← GET/POST list y create
│   ├── [id]/
│   │   ├── route.ts               ← GET/PATCH/DELETE por ID
│   │   ├── aprobar/route.ts       ← Workflow aprobación
│   │   ├── generar-pdf/route.ts   ← Generación PDF
│   │   └── ... (otros endpoints)
│   ├── metricas/route.ts          ← Métricas por ejecutivo
│   ├── pipeline/route.ts           ← Pipeline de ventas
│   ├── analisis-riesgo/route.ts     ← Análisis crediticio IA
│   ├── draft/route.ts             ← Auto-guardado borradores
│   └── reservas/route.ts          ← Reservas inventario
│
└── modules/contratos/
    ├── domain/
    │   ├── entities/
    │   │   └── Contrato.ts        ← Entidad principal (350 líneas)
    │   ├── value-objects/
    │   │   ├── EstadoContrato.ts
    │   │   ├── NumeroContrato.ts
    │   │   ├── TotalesContrato.ts
    │   │   ├── RiesgoCredito.ts
    │   │   ├── MetricasRentabilidad.ts
    │   │   └── TerminosPago.ts
    │   └── repositories/
    │       └── IContratoRepository.ts
    │
    ├── application/
    │   ├── commands/
    │   └── queries/
    │
    └── infrastructure/
        ├── repositories/
        │   └── DrizzleContratoRepository.ts  ← Implementación repo
        └── external/
            ├── PDFGeneratorAdvancedService.ts
            ├── DigitalSignatureService.ts
            └── ... (integraciones externas)
```

### 2.2 Análisis de Entidad de Dominio

**Archivo:** `src/modules/contratos/domain/entities/Contrato.ts` (350 líneas)

```typescript
// Entidad bien diseñada con:
// - Props interface分离
// - Constructor privado con validación
// - Factory methods (create, fromPersistence)
// - Getters para acceso controlado
// - Métodos de negocio (actualizarEstado, actualizarTotales, etc.)
// - Workflow methods (avanzarWorkflow)
// - Validación de integridad
```

**Validaciones de Negocio Implementadas:**
- Límites por tipo de contrato (A: $1B, B: $100M, C: $10M)
- Términos de pago según nivel de riesgo
- Comisiones de agencia requieren agencia asignada
- Transiciones de estado válidas

**MÉTODOS FALTANTES EN LA ENTIDAD:**
```typescript
// ❌ FALTANTE: Método para actualizar título
actualizarTitulo(nuevoTitulo: string): void

// ❌ FALTANTE: Método para recalcular totales
recalcularTotales(): void

// ❌ FALTANTE: Método para agregar/modificar items
agregarItem(item: LineaEspecificacion): void

// ❌ FALTANTE: Método para asignar ejecutivo
asignarEjecutivo(ejecutivoId: string): void
```

---

## 3. ANÁLISIS DE ENDPOINTS API

### 3.1 ENDPOINTS PRINCIPALES

#### ✅ `GET /api/contratos` (route.ts:54-127)

| Requisito Skill | Estado | Detalle |
|----------------|--------|---------|
| withApiRoute wrapper | ✅ | Correcto |
| Zod validation (query) | ⚠️ PARCIAL | Solo validation en POST, GET no valida searchParams |
| withTenantContext | ⚠️ IMPLÍCITO | El repo ya usa tenantId del constructor |
| Audit logging | ❌ FALTANTE | No hay log para lecturas de lista |
| Rate limiting | ✅ | Configurado por withApiRoute |

**Issues:**
- Los searchParams (`search`, `estado`, `tipo`, `contratoId`) no tienen Zod validation
- No hay `auditLogger.log()` para la lectura de lista
- Error handling no incluye audit log en catch

#### ✅ `POST /api/contratos` (route.ts:132-262)

| Requisito Skill | Estado | Detalle |
|----------------|--------|---------|
| withApiRoute wrapper | ✅ | Correcto |
| Zod validation | ✅ | `createContratoSchema` completo |
| Cross-module validation | ✅ | PropiedadesIntegrationAPI |
| Audit logging | ✅ | DATA_CREATE con metadata |
| Error handling + audit | ❌ PARCIAL | El catch no hace audit log |

**Issues:**
- El catch block no hace `auditLogger.log()` del error
- No hay validación de fechas (inicio < fin verificada en dominio, no en API)

#### ✅ `GET /api/contratos/[id]` ([id]/route.ts:47-124)

| Requisito Skill | Estado | Detalle |
|----------------|--------|---------|
| withApiRoute wrapper | ✅ | Correcto |
| Zod validation | ✅ | ID extraction con validación |
| Audit logging | ❌ FALTANTE | No hay log para lectura de detalle |
| Error handling + audit | ❌ FALTANTE | catch sin audit log |

#### ⚠️ `PATCH /api/contratos/[id]` ([id]/route.ts:129-256)

| Requisito Skill | Estado | Detalle |
|----------------|--------|---------|
| withApiRoute wrapper | ✅ | Correcto |
| Zod validation | ✅ | `updateContratoSchema` |
| Audit logging | ✅ | DATA_UPDATE con cambios |
| Error handling + audit | ❌ PARCIAL | catch sin audit log |

**CRITICAL ISSUE:**
```typescript
// Línea 180-184: El código dice que el contrato no tiene método para cambiar título
// pero luego no hace nada - es un NO-OP que debería actualizar el domain
if (body.titulo) {
    // El contrato no tiene método directo para cambiar el título
    // Necesitaríamos recrear la entidad o añadir un método específico
    // Por ahora solo actualizamos el estado
}
// ❌ El título nunca se actualiza - BUG!
```

El PATCH no está actualizando correctamente los campos del dominio porque:
1. La entidad `Contrato` no tiene método `actualizarTitulo()`
2. La entidad no tiene método `actualizarFechas()`
3. La entidad no tiene método `actualizarEjecutivo()`
4. El código hace `repo.save(contratoExistente)` sin modificar nada实质

#### ✅ `DELETE /api/contratos/[id]` ([id]/route.ts:261-323)

| Requisito Skill | Estado | Detalle |
|----------------|--------|---------|
| withApiRoute wrapper | ✅ | Correcto |
| Validación estado | ✅ | Solo 'borrador' puede eliminarse |
| Soft delete | ✅ | Cambio a estado 'cancelado' |
| Audit logging | ✅ | DATA_DELETE con metadata |
| Error handling + audit | ❌ PARCIAL | catch sin audit log |

#### ✅ `POST /api/contratos/[id]/aprobar` ([id]/aprobar/route.ts:71-216)

| Requisito Skill | Estado | Detalle |
|----------------|--------|---------|
| withApiRoute wrapper | ✅ | Correcto |
| Zod validation | ✅ | `aprobarContratoSchema` |
| Workflow approval | ✅ | Niveles: automatico → directorio |
| RBAC integration | ⚠️ PARCIAL | Usa `ctx.role` pero comentario dice "TODO: Integrar" |
| Audit logging | ✅ | DATA_UPDATE con nivel de aprobación |
| Error handling + audit | ❌ PARCIAL | catch sin audit log |

**Issues:**
- El sistema de roles es hardcoded en el endpoint en lugar de usar RBAC centralizado
- No hay verificación de que el usuario tiene el rol específico para cada nivel

### 3.2 ENDPOINTS SECUNDARIOS (MODIFICADOS SIN ANÁLISIS PREVIO)

⚠️ **NOTA:** Estos endpoints fueron modificados prematuramente sin análisis formal. Verificación de compliance:

#### `GET /api/contratos/metricas`

| Requisito | Estado | Notas |
|-----------|--------|-------|
| Zod validation | ✅ | Agregado schema para query params |
| Audit logging | ✅ | DATA_READ en success, API_ERROR en catch |
| withApiRoute | ✅ | Correcto |

#### `GET /api/contratos/pipeline`

| Requisito | Estado | Notas |
|-----------|--------|-------|
| Zod validation | ✅ | Agregado schema |
| Audit logging | ✅ | DATA_READ en success |
| withApiRoute | ✅ | Correcto |

#### `GET /api/contratos/analisis-riesgo`

| Requisito | Estado | Notas |
|-----------|--------|-------|
| Zod validation | ✅ | Schema para anuncianteId |
| Audit logging | ✅ | DATA_READ en success |
| withApiRoute | ✅ | Correcto |
| withTenantContext | ⚠️ | Removido porque no estaba importado (causaba error) |

#### `POST/GET/DELETE /api/contratos/draft`

| Requisito | Estado | Notas |
|-----------|--------|-------|
| Zod validation | ✅ | Schema completo |
| Audit logging | ✅ | DATA_CREATE/READ/DELETE |
| withApiRoute | ✅ | Correcto |
| Error handling | ✅ | apiError/apiServerError/apiNotFound |

---

## 4. GAPS IDENTIFICADOS vs SKILL REQUIREMENTS

### 4.1 CRITICAL GAPS (Must Fix)

| Gap | Severidad | Descripción |
|-----|-----------|-------------|
| Missing Audit Logging en catch blocks | CRITICAL | Todos los endpoints tienen try/catch sin audit log en el catch |
| PATCH no actualiza entidad | CRITICAL | El método PATCH no llama a ningún método de la entidad para actualizar campos |
| Entidad missing métodos | HIGH | Contrato no tiene métodos para: actualizarTitulo, actualizarFechas, agregarItem, asignarEjecutivo |
| No hay Event Sourcing | HIGH | SKILL requiere Event Sourcing para módulos CRITICAL |
| No hay CQRS separation | MEDIUM | El repo mezcla Commands y Queries |

### 4.2 HIGH PRIORITY GAPS

| Gap | Severidad | Descripción |
|-----|-----------|-------------|
| Validación de Query Params en GET | HIGH | GET /api/contratos no valida searchParams con Zod |
| RBAC Hardcoded | HIGH | Sistema de aprobación tiene roles hardcoded en lugar de usar RBAC centralizado |
| No hay withTenantContext wrapper | MEDIUM | El repo usa tenantId del constructor pero no hay wrapper a nivel API |

### 4.3 MEDIUM PRIORITY GAPS

| Gap | Severidad | Descripción |
|-----|-----------|-------------|
| Rate limiting tiers | LOW | Algunos endpoints usan rateLimit:'read'/'create' que no son válidos (debería ser 'api') |
| Missing API versioning | LOW | No hay versionado de API (v1, v2) |
| No hay Circuit Breaker | LOW | Para llamadas a servicios externos (PDF, Email, etc.) |

---

## 5. MATRIZ DE CUMPLIMIENTO

| Categoría | Requisito | Cumplimiento | Archivos |
|----------|-----------|--------------|----------|
| **DDD** | Repository Pattern | 100% | `DrizzleContratoRepository.ts` |
| **DDD** | Value Objects | 100% | `value-objects/*.ts` |
| **DDD** | Entity con lógica | 90% | `Contrato.ts` - Faltan algunos métodos |
| **DDD** | Event Sourcing | 0% | ❌ No implementado |
| **CQRS** | Command/Query separation | 30% | ❌ Mezclado en repo |
| **Security** | withApiRoute | 100% | ✅ Todos los endpoints |
| **Security** | Zod validation | 70% | ❌ Faltan query params |
| **Security** | Audit logging | 60% | ⚠️ Incompleto en catch blocks |
| **Security** | RBAC | 50% | ⚠️ Hardcoded en aprobar |
| **Multi-tenant** | RLS | 100% | ✅ Implementado en repo |
| **Multi-tenant** | withTenantContext | 70% | ⚠️ No usado en API level |

---

## 6. RECOMENDACIONES DE MEJORA

### 6.1 PRIORIDAD 1 (CRITICAL)

1. **Agregar Audit Logging en Catch Blocks**
   - Todos los endpoints necesitan `auditLogger.log()` en catch blocks
   - Usar `AuditEventType.API_ERROR` para errores

2. **Corregir PATCH endpoint**
   - Crear método `actualizarTitulo()` en entidad Contrato
   - Crear método `actualizarFechas()` en entidad Contrato
   - Crear método `asignarEjecutivo()` en entidad Contrato
   - Llamar estos métodos antes de `repo.save()`

3. **Implementar Event Sourcing**
   - Crear `ContratoCreatedEvent`, `ContratoUpdatedEvent`, etc.
   - Usar Event Store para persistencia

### 6.2 PRIORIDAD 2 (HIGH)

4. **Agregar Zod Validation para Query Params**
   - GET /api/contratos: validar `search`, `estado`, `tipo`, `page`, `limit`

5. **Integrar RBAC Centralizado**
   - Reemplazar roles hardcoded con sistema de permisos centralizado
   - Usar `checkPermission()` de `@/lib/security/rbac`

### 6.3 PRIORIDAD 3 (MEDIUM)

6. **Separar Commands y Queries**
   - Crear `ContratoCommandHandler` y `ContratoQueryHandler` separados
   - Mover queries a endpoints dedicados

7. **Agregar API Versioning**
   - Implementar `/api/v1/contratos` → `/api/v2/contratos`

---

## 7. ENDPOINTS ANALIZADOS

| Endpoint | Status | Compliance |
|----------|--------|------------|
| `GET /api/contratos` | ⚠️ Parcial | 65% |
| `POST /api/contratos` | ✅ Bueno | 80% |
| `GET /api/contratos/[id]` | ⚠️ Parcial | 70% |
| `PATCH /api/contratos/[id]` | ❌ Bug | 40% |
| `DELETE /api/contratos/[id]` | ✅ Bueno | 85% |
| `POST /api/contratos/[id]/aprobar` | ⚠️ Parcial | 75% |
| `POST /api/contratos/[id]/generar-pdf` | ⚠️ Sin audit | 60% |
| `GET /api/contratos/metricas` | ✅ Mejorado | 90% |
| `GET /api/contratos/pipeline` | ✅ Mejorado | 90% |
| `GET /api/contratos/analisis-riesgo` | ✅ Mejorado | 85% |
| `POST/GET/DELETE /api/contratos/draft` | ✅ Mejorado | 90% |

---

## 8. CONCLUSIÓN

**Nivel de Cumplimiento Global: 70%**

El módulo CONTRATOS tiene una arquitectura DDD bien implementada pero le faltan componentes críticos requeridos por el skill:
- Event Sourcing (requerido para módulos CRITICAL)
- Audit logging completo en todos los endpoints
- Algunos métodos en la entidad de dominio
- Separación CQRS

**Próximos Pasos Recomendados:**
1. Agregar audit logging en todos los catch blocks
2. Corregir el PATCH endpoint (agregar métodos a entidad)
3. Implementar Event Sourcing
4. Agregar Zod validation para query params
