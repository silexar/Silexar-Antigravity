# 📋 ANÁLISIS MÓDULO 11: EXPORTAR-PAUTA / PAUTA

## 📊 RESUMEN EJECUTIVO

| Aspecto | Estado | Notas |
|---------|--------|-------|
| **Recurso withApiRoute** | ⚠️ INCORRECTO | Usa `'reportes'` en vez de `'pauta'` |
| **Multi-tenancy** | ❌ FALTANTE | No usa `ctx.tenantId` |
| **RLS (withTenantContext)** | ❌ FALTANTE | Sin `withTenantContext()` |
| **Zod Validation** | ❌ FALTANTE | Solo validación manual básica |
| **Repository Pattern** | ⚠️ Parcial | Usa `GeneradorPauta` service pero mock data |
| **Audit Logging** | ❌ FALTANTE | Sin `auditLogger.log()` en catch blocks |

---

## 🔍 ANÁLISIS DETALLADO POR ENDPOINT

### 1. GET `/api/exportar-pauta` (Líneas 69-126)

**✅ Lo que está bien:**
- skipCsrf: true para GET
- Usa `GeneradorPauta` service para generar archivos
- Soporta múltiples formatos (csv, xlsx, pdf, json)
- Descarga directa como archivo

**❌ Problemas encontrados:**
1. **Resource incorrecto**: Usa `'reportes'` pero debería ser `'pauta'`
   ```typescript
   export const GET = withApiRoute(
     { resource: 'reportes', action: 'export', skipCsrf: true },  // ❌ INCORRECTO
   ```
2. **Sin usar tenantId** (ctx.tenantId no se usa)
3. **Mock data** para `tandasFiltradas` (líneas 80)
4. **Sin audit logging** en catch block (línea 121-123)

---

### 2. POST `/api/exportar-pauta` (Líneas 128-171)

**✅ Lo que está bien:**
- Usa `GeneradorPauta` service
- Valida campos requeridos

**❌ Problemas encontrados:**
1. **Resource incorrecto**: Usa `'reportes'` pero debería ser `'pauta'`
2. **Sin usar tenantId** (ctx.tenantId no se usa)
3. **Sin Zod validation** - validación manual simple
4. **Sin audit logging** en catch block (línea 166-168)
5. **Sin audit logging de éxito** para exportaciones

---

## 🎯 PROBLEMAS IDENTIFICADOS

| # | Problema | Gravedad | Ubicación |
|---|----------|----------|-----------|
| 1 | Resource incorrecto: 'reportes' vs 'pauta' | 🔴 CRÍTICO | route.ts:70, 129 |
| 2 | Sin usar ctx.tenantId | 🔴 CRÍTICO | GET, POST |
| 3 | Mock data en tanda filtrada | 🟡 HIGH | route.ts:80 |
| 4 | Sin audit logging en GET catch block | 🟡 HIGH | route.ts:121-123 |
| 5 | Sin audit logging en POST catch block | 🟡 HIGH | route.ts:166-168 |
| 6 | Sin Zod validation | 🟡 MEDIUM | route.ts:134-137 |
| 7 | Sin DATA_EXPORTED audit para éxito | 🟡 MEDIUM | route.ts:97-119 |

---

## ✅ CUMPLIMIENTO

| Categoría | % Cumplimiento | Notas |
|-----------|----------------|-------|
| **API Security** | 100% | withApiRoute, RBAC |
| **Multi-tenancy** | 0% | tenantId no usado |
| **Service Pattern** | 70% | GeneradorPauta usado, pero con mock |
| **Zod Validation** | 0% | Validación manual |
| **Audit Logging** | 0% | Sin auditLogger.log() |

### **CUMPLIMIENTO TOTAL: ~35%**

---

## 🛠️ MEJORAS REQUERIDAS

### 1. Fix resource en withApiRoute

```typescript
// Cambiar de:
{ resource: 'reportes', action: 'export', skipCsrf: true }
// A:
{ resource: 'pauta', action: 'export', skipCsrf: true }
```

### 2. Agregar Audit Logging a GET catch block

```typescript
auditLogger.log({
  timestamp: new Date(),
  eventType: AuditEventType.ACCESS_DENIED,
  severity: AuditSeverity.WARNING,
  userId: ctx.userId,
  resource: 'pauta',
  action: 'export',
  success: false,
  ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
  userAgent: req.headers.get('user-agent') || 'unknown',
  details: { error: error.message, module: 'exportar-pauta' }
});
```

### 3. Agregar Audit Logging a POST éxito y error

```typescript
// Éxito
auditLogger.log({
  timestamp: new Date(),
  eventType: AuditEventType.DATA_EXPORTED,
  severity: AuditSeverity.INFO,
  userId: ctx.userId,
  resource: 'pauta',
  action: 'export',
  success: true,
  ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
  userAgent: req.headers.get('user-agent') || 'unknown',
  details: { formato, fecha, cantidadTandas: tiras.length, module: 'exportar-pauta' }
});

// Error (catch block)
auditLogger.log({
  timestamp: new Date(),
  eventType: AuditEventType.ACCESS_DENIED,
  severity: AuditSeverity.WARNING,
  userId: ctx.userId,
  resource: 'pauta',
  action: 'export',
  success: false,
  ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
  userAgent: req.headers.get('user-agent') || 'unknown',
  details: { error: error.message, module: 'exportar-pauta' }
});
```

### 4. Agregar Zod Validation

```typescript
const exportPautaSchema = z.object({
  formato: z.enum(['csv', 'xlsx', 'pdf', 'json']),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  emisora: z.string().optional(),
  emisoraCodigo: z.string().optional(),
  tiras: z.array(z.object({
    codigo: z.string(),
    fecha: z.string(),
    horaInicio: z.string(),
    horaFin: z.string(),
    spots: z.array(z.object({
      orden: z.number(),
      codigo: z.string(),
      nombre: z.string(),
      anunciante: z.string(),
      duracion: z.number(),
      archivo: z.string().optional()
    }))
  }))
});
```

---

## 📋 PRÓXIMOS PASOS

1. [ ] Fix resource de 'reportes' a 'pauta' en GET y POST
2. [ ] Agregar audit logging al catch block de GET
3. [ ] Agregar audit logging al catch block de POST
4. [ ] Agregar DATA_EXPORTED audit para éxito en POST
5. [ ] (Opcional) Agregar Zod validation para body

---

*Documento creado: 2025-04-29*
*Arquitecto: Claude Code*
*Proyecto: Silexar Pulse TIER_0_FORTUNE_10*