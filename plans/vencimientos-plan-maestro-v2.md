# 📅 MÓDULO VENCIMIENTOS - PLAN MAESTRO V2.0
## Superando a la Competencia en el Fortune 10

**Fecha:** 2026-04-23  
**Versión:** 2.0 (Enhanced Edition)  
**Visión:** El módulo de inventario comercial más avanzado del mundo

---

## 🎯 FILOSOFÍA DEL DISEÑO

> *"Como Ejecutivo de Ventas, necesito SABER en tiempo real qué cupos tengo disponibles, cuáles están por vencer, y qué puedo vender AHORA para cerrar la venta antes que la competencia."*

El módulo debe funcionar como un **centro de comando de ventas** donde cada segundo cuenta, cada cupo es una oportunidad, y cada vencimiento es una conversación pendiente.

---

## 🏆 CARACTERÍSTICAS QUE NOS DISTINGUEN DE LA COMPETENCIA

### 1. 🚀 VISTA EN TIEMPO REAL - "COMANDO DE VENTAS"

**Lo que la competencia NO tiene:**
- Actualización en tiempo real de cupos sin refrescar página
- Indicadores de "última venta hace X minutos" 
- Alertas visuales cuando un cupo se libera
- Contador de countdown para vencimientos inminentes

**Cómo lo implementamos:**
```typescript
// Sistema de actualización en tiempo real
interface LiveInventoryUpdate {
  type: 'CUPO_OCUPADO' | 'CUPO_LIBERADO' | 'VENCIMIENTO_UPDATE'
  programaId: string
 cupoId: string
  timestamp: Date
  changes: CupoDisponible
}
```

### 2. 🎹 KEYBOARD-FIRST NAVIGATION

**Lo que la competencia NO tiene:**
- Power user shortcuts para operaciones rápidas
- Búsqueda con shortcuts sin mouse
- Quick actions desde cualquier lugar

**Shortcuts implementados:**
| Shortcut | Acción |
|----------|--------|
| `Ctrl + K` | Buscar programa/cliente |
| `Ctrl + N` | Nuevo programa |
| `Ctrl + F` | Filtros rápidos |
| `Ctrl + R` | Refrescar todo |
| `1-9` | Ir a programa en lista |
| `Esc` | Cerrar modal/filtro |
| `Enter` | Confirmar acción |
| `Space` | Toggle selección |

### 3. 📊 DASHBOARD DE VENTAS "ONE-SCREEN"

**Lo que la competencia NO tiene:**
- Todo lo crítico visible en UNA pantalla
- Revenue del día/mes/trimestre de un vistazo
- Top programas por revenue
- Alertas priorizadas por urgencia

**Layout propuesto:**
```
┌──────────────────────────────────────────────────────────────┐
│ 📅 VENCIMIENTOS - COMANDO DE VENTAS          🔔 3 │ 👤 Yo │
├──────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ 💰 HOY      │ │ 📅 ESTA SEM  │ │ 📈 MES       │          │
│  │ $12.5M      │ │ $45M        │ │ $890M       │          │
│  │ ↑ 23%       │ │ 🔥 5 aging   │ │ meta: 74%   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                            │
│  🔥 VENCIMIENTOS PRIORITARIOS (hoy/mañana)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⚠️ Cencosud - Mesa Central    Vence mañana  💰$4.2M  │   │
│  │ ⚠️ Falabella - Tarde Deportiva Vence en 3 días 💰$2M  │   │
│  │ 💡 AutoMax - Deportivo        Libera en 5 días      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
│  📺 PROGRAMAS DISPONIBLES PARA VENDER                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔵 Mesa Central Matinal  │ 🔵 Sonar Informativo     │   │
│  │    2 cupos disponibles   │    0 cupos disponibles  │   │
│  │    $4.5M/mes c/u         │    Lista espera: 8      │   │
│  │    Prime AM              │    💰 $125M/mes total    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
│  [🎯 VER todos los programas]  [📊 ANALYTICS]  [➕ NUEVO]  │
└──────────────────────────────────────────────────────────────┘
```

### 4. 🔍 BÚSQUEDA INTELIGENTE "CLIPBOARD-TO-PURCHASE"

**Lo que la competencia NO tiene:**
- Pega un texto y el sistema auto-detecta qué buscas
- Búsqueda por fragments de nombres
- Sugerencias contextuales basadas en tu historial

**Ejemplo UX:**
```
Usuario escribe: "mesa central banco"
→ Sistema interpreta: Programa="Mesa Central", Cliente="Banco" (partial match)
→ Muestra: Mesa Central + cupos donde Banco está próximo a vencer
```

### 5. 📱 RESPONSIVE "TABLET-FIRST"

**Lo que la competencia NO tiene:**
- Optimizado para uso en terreno con tablet
- Modo offline cuando no hay conexión
- Touch gestures para acciones rápidas

**Layout tablet:**
```
┌────────────────────────────────────┐
│ ≡  COMANDO VENTAS        🔔 3  👤  │
├────────────────────────────────────┤
│                                    │
│  ┌──────────────────────────────┐  │
│  │ 🔥 VENCIMIENTOS HOY (2)      │  │
│  │  ├ Cencosud - Mesa Central  │  │
│  │  └ Falabella - Tarde Dep    │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ 📺 DISPONIBLES HOY           │  │
│  │  ├ Mesa Central (2 cupos)    │  │
│  │  ├ Deportivo (1 cupo)        │  │
│  │  └ Musical (5 cupos)         │  │
│  └──────────────────────────────┘  │
│                                    │
│  [LLAMAR] [EMAIL] [RESERVAR] [Waze] │
└────────────────────────────────────┘
```

### 6. 🧠 CORTEX "SALES CO-PILOT"

**Lo que la competencia NO tiene:**
- Sugerencias proactivas de próxima mejor venta
- Alertas de "cliente en lista de espera disponible"
- Predicción de qué programas tendrán cupos pronto

**Cortex Suggestions:**
```
💡 Cortex dice:
"Cliente 'TechStart SpA' buscó 'programas prime AM' hace 3 días.
Tienes 2 cupos disponibles en Mesa Central Prime AM. 
¿ Querés que le mande una propuesta ?"
```

### 7. 📈 ANALYTICS "REVENUE COMMAND CENTER"

**Lo que la competencia NO tiene:**
- Forecast de revenue por programa
- Pipeline de renovaciones可视化
- Comparativa EMISORA vs COMPETENCIA

**Métricas clave:**
- Revenue potencial vs realizado (by programa)
- Ocupación % en tiempo real
- Days-to-expiry distribution
- Renewal rate prediction
- Price elasticity by time slot

---

## 📋 FASE 1: API ROUTES (HTTP Layer) ⭐ PRIORIDAD ALTA

### Rutas a implementar:
```
/api/vencimientos/
├── programas/
│   ├── GET    → Lista programas (con filtros)
│   ├── POST   → Crear programa (wizard step 1-5)
│   └── [id]/
│       ├── GET    → Detalle programa
│       ├── PATCH  → Actualizar programa
│       └── DELETE → Archivar programa
│
├── cupos/
│   ├── GET    → Lista cupos (filtros: programa, tipo, estado)
│   ├── POST   → Reservar cupo temporal
│   └── [id]/
│       ├── GET       → Detalle cupo
│       ├── PATCH     → Actualizar estado
│       └── DELETE    → Liberar cupo
│
├── disponibilidad/
│   ├── GET    → Cupos disponibles (by programa/emisora/fecha)
│   └── [programaId]/
│       └── GET    → Disponibilidad programa específico
│
├── tarifario/
│   ├── GET    → Tarifas vigentes
│   ├── POST   → Crear/modificar tarifas
│   └── tanda/
│       └── GET → Tarifas por tanda
│
├── vencimientos/
│   ├── GET    → Lista vencimientos (filtros: dias, estado)
│   ├── POST   → Crear vencimiento manual
│   └── [id]/
│       ├── PATCH → Actualizar estado/alerta
│       └── POST  → Confirmar inicio/fin
│
├── alertas/
│   ├── GET    → Alertas programadas
│   ├── PATCH  → Marcar leída
│   └── stats  → Estadísticas de alertas
│
├── analytics/
│   ├── revenue    → Métricas revenue
│   ├── ocupacion  → % ocupación por programa
│   ├── forecast   → Predicciones
│   └── pipeline   → Pipeline renovaciones
│
└── search/
    ├── GET → Búsqueda general
    └── suggestions → Auto-complete
```

### Middleware a incluir:
- RBAC validation per route
- Request validation (Zod schemas)
- Audit logging
- Rate limiting

---

## 📋 FASE 2: PRISMA REPOSITORIES ⭐ PRIORIDAD ALTA

### Schema a implementar:
```prisma
// Nuevos modelos para vencimientos
model ProgramaAuspicio {
  id              String   @id @default(cuid())
  emisoraId       String
  nombre          String
  descripcion     String?
  horarioInicio   String   // "07:00"
  horarioFin      String   // "09:30"
  diasSemana      Int[]    // [1,2,3,4,5] = L-V
  cuposTipoA      Int      @default(8)
  cuposTipoB      Int      @default(4)
  cuposMenciones  Int      @default(20)
  estado          String   @default("activo")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  cupos           CupoComercial[]
  emisora         Emisora          @relation(...)
}

model CupoComercial {
  id              String   @id @default(cuid())
  programaId      String
  tipoAuspicio    String   // "TIPO_A" | "TIPO_B" | "MENCION"
  clienteId       String
  clienteNombre   String
  estado          String   // "pendiente"|"confirmado"|"activo"|"no_iniciado"|"cancelado"
  fechaInicio     DateTime
  fechaFin        DateTime
  valor           Int      // en CLP
  ejecutivoId     String
  countdown48h    Boolean  @default(false)
  countdownExpira DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  programa        ProgramaAuspicio @relation(...)
  cliente         Cliente          @relation(...)
}

model VencimientoAuspicio {
  id              String   @id @default(cuid())
  cupoId          String   @unique
  nivelAlerta     String   // "verde"|"amarillo"|"rojo"|"critico"|"no_iniciado"
  accionSugerida  String
  notificacionEnviada Boolean @default(false)
  historialAcciones Json[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  cupo            CupoComercial @relation(...)
}

model AlertaProgramador {
  id          String   @id @default(cuid())
  tipo        String   // "INICIO"|"VENCIMIENTO"|"COUNTDOWN"
  mensaje     String
  prioridad   String   // "alta"|"media"|"baja"
  leida       Boolean  @default(false)
  programaId  String
  cupoId      String?
  createdAt   DateTime @default(now())
}
```

### Repository implementations:
- `PrismaProgramaRepository` → implements `IProgramaAuspicioRepository`
- `PrismaCupoRepository` → implements `ICupoComercialRepository`
- `PrismaVencimientoRepository` → implements `IVencimientoRepository`
- `PrismaDisponibilidadRepository` → implements `IDisponibilidadRepository`
- `PrismaTarifaRepository` → implements `ITarifarioRepository`

---

## 📋 FASE 3: UI DASHBOARD ⭐ PRIORIDAD CRÍTICA

### Páginas a crear:
```
src/app/vencimientos/
├── page.tsx                    → Dashboard principal
├── layout.tsx                  → Layout con sidebar
├── componentes/
│   ├── DashboardHeader.tsx     → Stats + search + user
│   ├── VencimientosPanel.tsx   → Lista vencimientos
│   ├── ProgramasGrid.tsx       → Grid programas
│   ├── CupoCard.tsx            → Cardcupo individual
│   ├── FiltrosBar.tsx          → Barra de filtros
│   ├── CrearProgramaWizard.tsx → Wizard 5 pasos
│   ├── AlertasCentro.tsx       → Centro alertas
│   ├── AnalyticsDashboard.tsx  → Gráficos
│   └── MobileNav.tsx           → Navegación móvil
├── hooks/
│   ├── useVencimientosRealTime.ts → WebSocket/SSE
│   ├── useBusquedaInteligente.ts  → Search logic
│   └── useKeyboardShortcuts.ts    → Hotkeys
└── api/ ( Next.js route handlers ya en fase 1 )
```

### Componentes de UI por prioridad:
1. **DashboardHeader** - KPIs + search + user menu
2. **VencimientosPanel** - Lista priorizada
3. **ProgramasGrid** - Cards con disponibilidad
4. **FiltrosBar** - Filtros completos
5. **CrearProgramaWizard** - 5-step wizard
6. **AnalyticsDashboard** - Gráficos revenue
7. **AlertasCentro** - Centro de notificaciones

---

## 📋 FASE 4: TIEMPO REAL & OPTIMIZACIONES

### Implementaciones:

#### 1. Server-Sent Events (SSE) para live updates
```typescript
// app/api/vencimientos/live/route.ts
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      // Suscribirse a eventos de inventario
      eventEmitter.on('cupoUpdate', (data) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`)
      })
    }
  })
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
```

#### 2. Virtual Scrolling para listas grandes
- Usar `@tanstack/react-virtual` para programas
- Renderizar solo elementos visibles
- Soportar 1000+ programas sin lag

#### 3. Optimistic UI Updates
- Actualizar UI inmediatamente al reservar
- Revertir si API falla
- Mostrar loading state brevemente

#### 4. Service Worker para offline
```typescript
// public/sw.js
// Cache programas para acceso offline
// Sincronizar cambios cuando reconecta
// Mostrar indicador "modo offline"
```

#### 5. Keyboard Shortcuts System
```typescript
interface KeyboardShortcut {
  key: string
  modifiers?: ('ctrl' | 'alt' | 'shift')[]
  action: () => void
  description: string
}
```

---

## 📋 FASE 5: ANALYTICS AVANZADOS

### Dashboard Analytics:

#### 1. Revenue Command Center
```
┌─────────────────────────────────────────────────────────────┐
│ 📊 ANALYTICS - REVENUE COMMAND CENTER                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  💰 REVENUE OVERVIEW (este mes)                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │ $890M   │  │ $1.2B   │  │  74%    │  │ +23%    │      │
│  │ Real    │  │ Meta    │  │ logress │  │ vs 2024 │      │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │
│                                                             │
│  📈 REVENUE TREND (últimos 12 meses)                        │
│  [========📈===========]                                   │
│                                                             │
│  🎯 TOP PROGRAMAS                                          │
│  1. Mesa Central: $125M (95% occ)                          │
│  2. Sonar Informativo: $78M (100% occ)                     │
│  3. Tarde Deportiva: $67M (85% occ)                        │
│                                                             │
│  📊 PIPELINE RENOVACIONES                                   │
│  Venciendo en 30 días: $234M                               │
│  Probabilidad renovación: 89%                               │
│  Riesgo de pérdida: $45M                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 2. Forecast Predictions
- Predicción de revenue para próximos 90 días
- Análisis de estacionalidad
- Alertas de "cliente en riesgo de churn"

#### 3. Pipeline View
- Kanban de renovaciones por estado
- Timeline可视化 de vencimientos
- Acciones rápidas por cliente

---

## 📋 FASE 6: COLLABORATION & SHARING

### Features de equipo:

1. **Notas por Programa**
   ```typescript
   interface NotaPrograma {
     id: string
     programaId: string
     usuarioId: string
     contenido: string
     tipo: 'seguimiento' | 'alerta' | 'info'
     createdAt: Date
   }
   ```

2. **Actividad Reciente**
   - Timeline de cambios por programa
   - Notificaciones de actividad del equipo
   - @menciones entre ejecutivos

3. **Team Availability View**
   - Ver qué programas manejan otros ejecutivos
   - Transferir responsabilidad
   - Compartir cargas de trabajo

4. **Comments & Discussions**
   - Threaded comments por cliente
   - Tags de @usuario
   - Resolución de threads

---

## 🎯 FEATURES EXCLUSIVAS "FORTUNE 10"

### Lo que nos hace ÚNICOS:

1. **🎯 Sales Velocity Score**
   --score que predice velocidad de venta por programa
   - Basado en: historico de venta, demanda actual, competencia
   - Actualizado en tiempo real

2. **📊 Competitive Gap Analysis**
   - Comparativa vs competencia
   - Identificación de oportunidades de pricing
   - Alertas de "precio bajo mercado"

3. **🔮 Renewal DNA**
   - Análisis de patrones de renovación
   - Predicción de probabilidad de renewal
   - Intervención proactiva

4. **⚡ Instant Pipeline**
   - Crear propuesta en 3 clicks
   - Templates de email pre-cargados
   - WhatsApp/Email integration (solo email, no WA)

5. **🎨 Visual Inventory Map**
   - Heatmap de ocupación por horario
   -identify gaps visuales
   - Drag-drop para reubicar cupos

6. **📱 Mobile-First Operations**
   - Modo offline completo
   - Quick actions con swipe
   - Voice input para notas

7. **🧠 AI Copilot Suggestions**
   - "Based on cliente X history, suggest programa Y"
   - Auto-generate renewal proposal
   - Risk alerts antes de que expire

---

## ⏱️ CRONOGRAMA SUGERIDO

| Semana | Fases | Entregables |
|--------|-------|-------------|
| 1 | FASE 1 | API Routes core (programas, cupos, disponibilidad) |
| 2 | FASE 1 | API Routes restantes + middleware |
| 3 | FASE 2 | Prisma schema + repositories |
| 4 | FASE 2 | Repository implementation + integration tests |
| 5 | FASE 3 | Dashboard básico + search |
| 6 | FASE 3 | Dashboard completo + filtros |
| 7 | FASE 3 | Wizard + CRUD completo |
| 8 | FASE 4 | SSE + real-time updates |
| 9 | FASE 4 | Keyboard shortcuts + offline |
| 10 | FASE 5 | Analytics dashboard |
| 11 | FASE 5 | Forecast + pipeline view |
| 12 | FASE 6 | Collaboration features |

**Total estimado: 12 semanas**

---

## 🔧 TECHNICAL STACK

### Frontend:
- Next.js 14+ (App Router)
- React 18 + Server Components
- Tailwind CSS (design system)
- Zustand (client state)
- @tanstack/react-query (server state)
- @tanstack/react-virtual (virtualization)
- recharts (analytics charts)
- sonner (toast notifications)
- cmdk (command palette / search)

### Backend:
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- Server-Sent Events (native)
- Zod (validation)
- RBAC middleware (existing)

### Infrastructure:
- Vercel (deployment)
- PostgreSQL (Neon/Supabase)
- Redis (cache, optional)
- Service Worker (offline)

---

## 📊 MÉTRICAS DE ÉXITO

### Medir al final del proyecto:
- **Time-to-Sell**: Tiempo desde búsqueda hasta reserva
- **Dashboard Load Time**: < 2 segundos
- **Search Response**: < 200ms
- **Cupo Availability Lag**: < 1 segundo para actualizar
- **Mobile Usage %**: > 30% de usuarios usan tablet/mobile
- **Keyboard Shortcut Usage**: > 50% power users
- **Renewal Rate**: +5% vs año anterior
- **Revenue per Ejecutive**: +15% improvement

---

## 🚀 EL FUTURO

Una vez completado este plan, el módulo Vencimientos será:

1. **El más rápido** - Tiempo real sin delays
2. **El más inteligente** - AI copilot para sugerencias
3. **El más completo** - Todo en una pantalla
4. **El más usable** - Keyboard-first, mobile-ready
5. **El más colaborativo** - Features de equipo

**Esto nos pone en posición de ser el mejor sistema de inventario comercial del mundo, superando a cualquier competencia en el mercado Fortune 10.**

---

*Plan Maestro V2.0 - Silexar Pulse - Vencimientos Module*
*Generado: 2026-04-23*
