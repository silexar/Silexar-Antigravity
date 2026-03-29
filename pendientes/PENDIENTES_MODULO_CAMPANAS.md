# 📋 PENDIENTES PARA PRODUCCIÓN - MÓDULO CAMPAÑAS

> **Última actualización:** 2025-12-28
> **Estado:** Pre-producción - Componentes Enterprise Completos
> **Prioridad:** Crítico antes de deploy
> **Versión:** 2050.1.0 TIER0

---

## 📊 RESUMEN EJECUTIVO

El módulo de Campañas tiene **100% de componentes UI** desarrollados. Lo pendiente es la conexión con la base de datos real.

| Área             | Estado  | Notas                  |
| ---------------- | ------- | ---------------------- |
| Componentes UI   | ✅ 100% | 64 componentes creados |
| Hooks de Datos   | ✅ 100% | 5 hooks principales    |
| API Routes       | ✅ 100% | 6 endpoints (mock)     |
| Database Schema  | ✅ 100% | Drizzle ORM listo      |
| Conexión DB Real | ⏳ 0%   | Pendiente descomentar  |
| Tests            | ⏳ 0%   | Pendiente              |

---

## 🔴 CRÍTICOS (Bloquean producción)

### 1. Conectar APIs con Base de Datos Real

**Descripción:** Los API routes tienen queries Drizzle comentadas usando datos mock. Hay que descomentar.

**Archivos a modificar:**

| Archivo                                             | Líneas a descomentar |
| --------------------------------------------------- | -------------------- |
| `src/app/api/campanas/cunas-gemelas/route.ts`       | 3-5, 18-25, 54-65    |
| `src/app/api/campanas/cunas-gemelas/[id]/route.ts`  | 3-5, 18-21, 38-42    |
| `src/app/api/campanas/reglas-competencia/route.ts`  | 3-5, 14-16, 43-54    |
| `src/app/api/campanas/historial/route.ts`           | 3-5, 17-28, 55-70    |
| `src/app/api/campanas/historial/[id]/undo/route.ts` | 3-5, 18-35           |
| `src/app/api/campanas/operaciones-bulk/route.ts`    | 3, 25-45             |

**Patrón a seguir:**

```typescript
// ANTES (comentado)
// const gemelas = await db.select().from(cunasGemelas)...

// DESPUÉS (descomentar)
const gemelas = await db.select().from(cunasGemelas)...
```

---

### 2. Ejecutar Migraciones Drizzle

**Descripción:** Crear las nuevas tablas agregadas en el schema.

**Comando:**

```bash
cd "Silexar Pulse Antygravity"
npx drizzle-kit push
```

**Tablas nuevas que se crearán:**

| Tabla                   | Schema               | Propósito                    |
| ----------------------- | -------------------- | ---------------------------- |
| `cunas_gemelas`         | materiales-schema.ts | Vincular twin spots          |
| `historial_operaciones` | materiales-schema.ts | Undo/Redo sistema            |
| `reglas_competencia`    | materiales-schema.ts | Anti-competencia anunciantes |
| `notas_spots`           | materiales-schema.ts | Instrucciones por spot       |

---

### 3. Variables de Entorno de Producción

**Archivo:** `.env.production`

```env
# Base de datos
DATABASE_URL=postgresql://user:password@host:5432/silexar_prod

# Auth
NEXTAUTH_SECRET=your-production-secret-key-min-32-chars
NEXTAUTH_URL=https://app.silexar.com

# API
NEXT_PUBLIC_API_URL=https://api.silexar.com
```

---

### 4. Componentes con Datos Mock a Conectar

**Descripción:** Los siguientes componentes usan `MOCK_DATA`. Reemplazar por hooks reales.

| Componente                   | Hook a usar                     | Ubicación                      |
| ---------------------------- | ------------------------------- | ------------------------------ |
| `CunasGemelasManager.tsx`    | `useCunasGemelas()`             | hooks/useOperacionesCampana.ts |
| `NotasSpotManager.tsx`       | `useNotasSpot()`                | hooks/useOperacionesCampana.ts |
| `ValidadorCompetencia.tsx`   | `useReglasCompetencia()`        | hooks/useOperacionesCampana.ts |
| `GestorOperacionesCunas.tsx` | `useHistorialOperaciones()`     | hooks/useOperacionesCampana.ts |
| `PanelBulkOperaciones.tsx`   | `useOperacionesBulk()`          | hooks/useOperacionesCampana.ts |
| `VistaOcupacionBloque.tsx`   | Endpoint `/api/bloques`         | Crear endpoint                 |
| `AlertasVencimiento.tsx`     | Endpoint `/api/alertas`         | Crear endpoint                 |
| `MonitorSaturacion.tsx`      | Endpoint `/api/saturacion`      | Crear endpoint                 |
| `DragDropLineas.tsx`         | Datos de campaña actual         | Props del padre                |
| `CopiarExtenderCampana.tsx`  | Endpoint `/api/campanas/copiar` | Crear endpoint                 |

**Ejemplo de conexión:**

```typescript
// ANTES (mock)
const CUNAS_MOCK = [...];
const cunas = CUNAS_MOCK;

// DESPUÉS (hook real)
import { useCunasGemelas } from './hooks/useOperacionesCampana';
const { vinculos, vincular, desvincular } = useCunasGemelas(campanaId);
```

---

## 🟡 IMPORTANTES (Recomendados antes de producción)

### 5. Crear Endpoints Faltantes

**Descripción:** Algunos componentes necesitan endpoints adicionales.

| Endpoint                                 | Método            | Propósito                |
| ---------------------------------------- | ----------------- | ------------------------ |
| `/api/campanas/copiar`                   | POST              | Copiar campaña completa  |
| `/api/campanas/extender`                 | PATCH             | Extender vigencia        |
| `/api/campanas/[id]/saturacion`          | GET               | Datos saturación emisora |
| `/api/campanas/[id]/alertas-vencimiento` | GET               | Cuñas próximas a vencer  |
| `/api/spots/[id]/notas`                  | GET, POST, DELETE | Notas por spot           |
| `/api/bloques/[id]/ocupacion`            | GET               | Ocupación de bloque      |

---

### 6. Integrar Atajos de Teclado Globales

**Descripción:** El hook `useAtajosTeclado` está creado pero debe integrarse en el layout principal.

**Archivo:** `src/app/campanas/layout.tsx` o componente padre

**Código a agregar:**

```typescript
import { useAtajosTeclado } from "./crear/components/WizardCampana/hooks/useAtajosTeclado";

function CampanasLayout({ children }) {
  const { atajos } = useAtajosTeclado({
    onUndo: () => historialOperaciones.deshacer(ultimaRevertible?.id),
    onRedo: () => {
      /* implementar */
    },
    onGuardar: () => guardarCampana(),
    onBuscar: () => setMostrarBusqueda(true),
  });

  return <>{children}</>;
}
```

---

### 7. Agregar Panel de Atajos en UI

**Descripción:** Incluir el botón flotante de atajos.

**Archivo:** `src/app/campanas/crear/page.tsx` o layout

**Código:**

```tsx
import { PanelAtajosTeclado } from "./components/WizardCampana/PanelAtajosTeclado";

// En el JSX
<PanelAtajosTeclado />;
```

---

### 8. Actualizar Index de Exports

**Descripción:** Crear archivo index para exportar todos los nuevos componentes.

**Archivo a crear:** `src/app/campanas/crear/components/WizardCampana/index.ts`

```typescript
// Operaciones
export * from "./GestorOperacionesCunas";
export * from "./PanelBulkOperaciones";
export * from "./DragDropLineas";

// Cuñas Gemelas
export * from "./CunasGemelasManager";

// Audio
export * from "./ReproductorAudioCuna";

// Ocupación y Saturación
export * from "./VistaOcupacionBloque";
export * from "./MonitorSaturacion";

// Alertas
export * from "./AlertasVencimiento";

// Notas
export * from "./NotasSpotManager";

// Validación
export * from "./ValidadorCompetencia";

// Copiar/Extender
export * from "./CopiarExtenderCampana";

// Atajos
export * from "./PanelAtajosTeclado";
export * from "./hooks/useAtajosTeclado";
export * from "./hooks/useOperacionesCampana";
```

---

## 🟢 RECOMENDADOS (Post-producción)

### 9. Tests de Integración

**Tests sugeridos para los nuevos componentes:**

| Componente             | Test a crear                       |
| ---------------------- | ---------------------------------- |
| CunasGemelasManager    | Vincular/Desvincular cuñas gemelas |
| PanelBulkOperaciones   | Operación masiva cancelar 10 items |
| ValidadorCompetencia   | Detectar violación y resolverla    |
| GestorOperacionesCunas | Flujo completo Undo/Redo           |
| DragDropLineas         | Mover cuña entre líneas            |

---

### 10. Documentar API Endpoints

**Descripción:** Agregar documentación Swagger/OpenAPI para los nuevos endpoints.

**Archivo:** `docs/API_CAMPANAS_OPERACIONES.md`

---

## ✅ CHECKLIST PRE-DEPLOY ACTUALIZADO

```
[ ] 1. Migraciones Drizzle ejecutadas (4 tablas nuevas)
[ ] 2. Variables de entorno de producción configuradas
[ ] 3. API routes conectados a DB real (6 archivos)
[ ] 4. Componentes conectados a hooks reales (10 componentes)
[ ] 5. Endpoints faltantes creados (6 endpoints)
[ ] 6. Atajos de teclado integrados en layout
[ ] 7. Panel de atajos visible
[ ] 8. Index de exports creado
[ ] 9. Build exitoso: `npm run build`
[ ] 10. Tests básicos pasando
```

---

## 📁 ESTRUCTURA DE ARCHIVOS NUEVOS

```
src/app/campanas/crear/components/WizardCampana/
├── hooks/
│   ├── useAtajosTeclado.ts         ← ⌨️ Atajos globales
│   └── useOperacionesCampana.ts    ← 🔌 5 hooks de datos
├── AlertasVencimiento.tsx          ← ⏰ Alertas vencimiento
├── CopiarExtenderCampana.tsx       ← 🔄 Copiar/Extender
├── CunasGemelasManager.tsx         ← 👯 Twin spots
├── DragDropLineas.tsx              ← 🔀 Drag & drop
├── GestorOperacionesCunas.tsx      ← 🔧 Cancel/Replace/etc
├── MonitorSaturacion.tsx           ← 📊 Heatmap saturación
├── NotasSpotManager.tsx            ← 📝 Notas por spot
├── PanelAtajosTeclado.tsx          ← ⚡ Panel visual atajos
├── PanelBulkOperaciones.tsx        ← 🎯 Operaciones masivas
├── ReproductorAudioCuna.tsx        ← 🔊 Player audio
├── ValidadorCompetencia.tsx        ← 🛡️ Anti-competencia
└── VistaOcupacionBloque.tsx        ← 📊 Ocupación bloque

src/app/api/campanas/
├── cunas-gemelas/
│   ├── route.ts                    ← GET, POST
│   └── [id]/route.ts               ← DELETE, PATCH
├── reglas-competencia/
│   └── route.ts                    ← GET, POST
├── historial/
│   ├── route.ts                    ← GET, POST
│   └── [id]/undo/route.ts          ← POST (undo)
└── operaciones-bulk/
    └── route.ts                    ← POST

src/lib/db/
└── materiales-schema.ts            ← 4 tablas nuevas agregadas
```

---

## 📊 TABLAS DE BASE DE DATOS NUEVAS

### cunas_gemelas

```sql
CREATE TABLE cunas_gemelas (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  cuna_principal_id UUID REFERENCES cunas(id),
  cuna_gemela_id UUID REFERENCES cunas(id),
  posicion VARCHAR(10), -- 'antes' | 'despues'
  separacion_maxima INTEGER DEFAULT 0,
  mismo_bloque BOOLEAN DEFAULT TRUE,
  activo BOOLEAN DEFAULT TRUE,
  creado_por_id UUID REFERENCES users(id),
  fecha_creacion TIMESTAMP DEFAULT NOW()
);
```

### historial_operaciones

```sql
CREATE TABLE historial_operaciones (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  tipo_operacion VARCHAR(50),
  descripcion TEXT,
  entidad_tipo VARCHAR(50),
  entidad_id UUID,
  campana_id UUID REFERENCES campanas(id),
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  revertible BOOLEAN DEFAULT TRUE,
  revertido BOOLEAN DEFAULT FALSE,
  fecha_reversion TIMESTAMP,
  usuario_id UUID REFERENCES users(id),
  fecha_operacion TIMESTAMP DEFAULT NOW()
);
```

### reglas_competencia

```sql
CREATE TABLE reglas_competencia (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  anunciante_a VARCHAR(255),
  anunciante_b VARCHAR(255),
  separacion_minima INTEGER DEFAULT 10,
  misma_tanda_prohibida BOOLEAN DEFAULT TRUE,
  prioridad VARCHAR(10) DEFAULT 'alta',
  categoria VARCHAR(100),
  activa BOOLEAN DEFAULT TRUE,
  creado_por_id UUID REFERENCES users(id),
  fecha_creacion TIMESTAMP DEFAULT NOW()
);
```

### notas_spots

```sql
CREATE TABLE notas_spots (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  spot_id UUID,
  campana_id UUID REFERENCES campanas(id),
  tipo VARCHAR(20) DEFAULT 'instruccion',
  titulo VARCHAR(255),
  contenido TEXT,
  prioridad VARCHAR(10) DEFAULT 'media',
  visible_en_log BOOLEAN DEFAULT TRUE,
  fijada BOOLEAN DEFAULT FALSE,
  creado_por_id UUID REFERENCES users(id),
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  modificado_por_id UUID REFERENCES users(id),
  fecha_modificacion TIMESTAMP
);
```

---

## 🚀 PRÓXIMOS PASOS RECOMENDADOS

1. **Ejecutar migraciones** - `npx drizzle-kit push`
2. **Descomentar queries DB** en los 6 API routes
3. **Conectar componentes** a hooks reales
4. **Probar flujo completo** de crear campaña
5. **Deploy a staging** para QA

---

## 📞 NOTAS TÉCNICAS

- **ORM:** Drizzle ORM (PostgreSQL)
- **Frontend:** Next.js 14 App Router
- **UI:** Shadcn UI + Tailwind CSS
- **State:** React hooks (useState, useMemo, useCallback)
- **Tier:** TIER_0_FORTUNE_10

---

_Documento generado automáticamente - Silexar Pulse 2050_
