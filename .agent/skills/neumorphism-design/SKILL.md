---
name: Neumorphism Design System TIER 0
description: Guía suprema para implementar la identidad visual Neumórfica en Silexar Pulse. Diseño táctil, sombras exactas con efecto arena/plastilina y sistema de ventanas flotantes estilo SO para experiencia premium enterprise.
---

# Neumorphism Design System (Tier 0 Enterprise)

Este skill define el estándar visual para **Silexar Pulse**. Toda la interfaz debe sentirse como un sistema operativo avanzado, táctil, limpio y orgánico, donde los elementos tienen volumen y reaccionan a la luz.

La referencia visual definitiva es el **módulo de Nuevo Contrato** — unificado, elegante, moderno, sin distracciones de color. Un solo acento azul lavanda con degradados y opacidades para crear jerarquía visual.


## 📌 1. Reglas Fundamentales del Neumorfismo

El Neumorfismo se basa en la extrusión (elevación) o intrusión (hundimiento) del mismo material de fondo. **Queda prohibido usar fondos negros, blancos puros o transparencias de cristal en contenedores base.**

### 🎨 Tokens de Color Oficiales — Silexar Pulse

| Token | Valor | Uso |
|-------|-------|-----|
| `base` | `#dfeaff` | Fondo universal desktop — azul lavanda perlado |
| `base-alt` | `#F0EDE8` | Fondo alternativo mobile/cards |
| `dark` | `#bec8de` | Sombra oscura neumórfica |
| `light` | `#ffffff` | Contraluz blanca |
| `accent` | `#6888ff` | **UNICO color permitido** — botones, iconos, tabs, badges, indicadores, éxito, info, estados |
| `accentHover` | `#5572ee` | Hover del acento |
| `accentLight` | `#8ba4ff` | Variante clara para degradados |
| `accentDark` | `#4a6de5` | Variante oscura para degradados |
| `text` | `#69738c` | Texto primario — gris azulado elegante |
| `sub` | `#9aa3b8` | Texto secundario / placeholder |

### 🚫 Paleta Prohibida (NUNCA usar)

- ❌ **Verde** (`#22c55e`, `#16a34a`, `green-*`, `emerald-*`) — para éxito, OK, completado
- ❌ **Rojo** (`#ef4444`, `#dc2626`, `red-*`, `rose-*`) — para error, peligro, crítico
- ❌ **Amarillo/Naranja** (`#f59e0b`, `#f97316`, `#eab308`, `yellow-*`, `orange-*`, `amber-*`) — para warning, alerta, atención
- ❌ **Morado / Violeta** (`#a855f7`, `#8b5cf6`, `#7c3aed`, `#9333ea`, `#6366f1`, `purple-*`, `violet-*`, `indigo-*`)
- ❌ **Rosa / Fucsia** (`#ec4899`, `#db2777`, `pink-*`)
- ❌ **Cian / Turquesa** (`#06b6d4`, `#0891b2`, `cyan-*`, `teal-*`)
- ❌ **Azul brillante** (`#3b82f6`, `#2563eb`, `#0ea5e9`, `blue-*` que no sea `#6888ff`)
- ❌ **Negro puro** (`#000000`) o **blanco puro** (`#ffffff`) en textos
- ❌ **Transparencias de cristal** (`backdrop-blur` + fondo semi-transparente oscuro) en modales base

**UNICA línea de color permitted is:** `#6888ff` (azul accent) para TODO: estados, iconos, badges, indicadores, isotipos, éxito, error, warning.

**Para crear variación visual:** usar degradados del azul (`#6888ff` → `#5572ee`, `#8ba4ff`, `#4a6de5`) y opacidades (`#6888ff10`, `#6888ff20`, `#6888ff50`, `#6888ff80`). Nunca introducir colores de otro matiz.

### 🌟 El Secreto del Neuromorfismo: Contraste Dual de Sombras

**El efecto 3D se logra con el contraste entre DOS sombras opuestas:**

1. **Sombra oscura** (`#bec8de`) → Proyectada hacia abajo-derecha (simula profundidad)
2. **Sombra clara** (`#ffffff`) → Proyectada hacia arriba-izquierda (simula luz reflejada)

Este juego de sombras opuestas crea la ilusión de volumen y textura de arena/plastilina. Sin ambas sombras, el efecto se pierde.

```
┌─────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← Contraluz blanca (arriba-izquierda)
│  ░                               ░  │
│  ░     [ELEMENTO ELEVADO]        ░  │  ← Material base #dfeaff
│  ░                               ░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← Sombra oscura (abajo-derecha)
└─────────────────────────────────────┘
```


## 🎨 2. Sistema de Sombras

### Definición de Constantes

```ts
const N = { 
  base: '#dfeaff',      // Fondo
  dark: '#bec8de',      // Sombra oscura (abajo-derecha)
  light: '#ffffff',     // Contraluz (arriba-izquierda)
  accent: '#6888ff',    // UNICO color permitido
  accentHover: '#5572ee',
  accentLight: '#8ba4ff',
  accentDark: '#4a6de5',
  text: '#69738c',      // Texto primario
  sub: '#9aa3b8'        // Texto secundario
};
```

### Patrones de Sombras

| Nombre | Shadow String | Uso |
|--------|---------------|-----|
| **neu** (elevado grande) | `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}` | Cards, paneles, MetricCards |
| **neuMd** (elevado medio) | `6px 6px 12px ${N.dark},-6px -6px 12px ${N.light}` | QuickLinks, elementos de lista |
| **neuSm** (elevado pequeño) | `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` | Botones, iconos, badges |
| **inset** (hundido) | `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}` | Inputs, áreas de texto |
| **insetSm** (hundido pequeño) | `inset 2px 2px 4px ${N.dark},inset -2px -2px 4px ${N.light}` | Progress bars, contenedores de íconos |

### Degradados Permitidos (del mismo matiz azul)

| Degradado | CSS | Uso |
|-----------|-----|-----|
| **Principal** | `linear-gradient(135deg, #6888ff, #5572ee)` | Headers sólidos, botones primarios, hero cards |
| **Claro** | `linear-gradient(135deg, #8ba4ff, #6888ff)` | Icon containers, highlights sutiles |
| **Oscuro** | `linear-gradient(135deg, #5572ee, #4a6de5)` | Botones hover, acciones importantes |
| **Sutil** | `linear-gradient(135deg, #dfeaff, #bec8de)` | Cards con fondo neumórfico sutil |

### Clases Tailwind por Elemento

| Elemento | Clases Tailwind | Efecto |
|----------|------------------|--------|
| **Fondo Pantalla** | `bg-[#dfeaff] text-[#69738c]` | Lienzo base |
| **Card Elevada** | `bg-[#dfeaff] rounded-2xl shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] border border-white/40` | Panel elevado |
| **QuickLink/Card Media** | `bg-[#dfeaff] rounded-2xl shadow-[6px_6px_12px_#bec8de,-6px_-6px_16px_#ffffff]` | Enlaces rápidos |
| **Icon Container** | `bg-[#dfeaff] rounded-xl shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]` | Contenedor de ícono |
| **Input Hundido** | `bg-[#dfeaff] rounded-xl shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:ring-2 focus:ring-[#6888ff]/30` | Campo de texto |
| **Botón Primario** | `bg-[#6888ff] text-white rounded-xl shadow-[4px_4px_8px_#bec8de,-2px_-2px_6px_#ffffff] hover:bg-[#5572ee] active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)] transition-all duration-200` | Botón con color acento |
| **Botón Secundario** | `bg-[#dfeaff] text-[#69738c] rounded-xl shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff] transition-all` | Botón elevado básico |
| **Header Sólido** | `bg-gradient-to-r from-[#6888ff] to-[#5572ee] text-white rounded-2xl shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]` | Cards de análisis, resumen, Cortex-Risk |
| **Badge/Píldora de Estado** | `bg-[#6888ff15] text-[#6888ff] rounded-full shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff] px-3 py-1 text-xs font-semibold` | Estados (siempre azul) |
| **Badge Inactivo** | `bg-[#9aa3b815] text-[#9aa3b8] rounded-full shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff] px-3 py-1 text-xs font-semibold` | Estados neutrales |
| **Progress Bar** | `bg-[#dfeaff] rounded-full shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]` | Barra de progreso |
| **Progress Fill** | `bg-[#6888ff] rounded-full` | Fill siempre azul |
| **Stat Card / Widget** | `bg-[#dfeaff] rounded-2xl shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]` | Card elevada con métrica |
| **Stat Icon Container** | `bg-[#dfeaff] rounded-xl shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]` | Icono hundido dentro del stat card |
| **Action Card** | `bg-[#dfeaff] rounded-2xl shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:scale-[1.02] active:scale-[0.98]` | Botón de acción rápida |

### Patrones de Widgets Modernos (Referencia Dashboard Admin)

#### Stat Card Premium
Estructura completa para métricas del sistema. **NUNCA** usar cajas hundidas planas (`bg-[#6888ff]10` + inset) — siempre elevarlas.

```tsx
<div style={{
  background: N.base,
  borderRadius: 16,
  boxShadow: '6px 6px 12px #bec8de,-6px -6px 12px #ffffff',
  padding: '1.25rem 1rem',
  textAlign: 'center'
}}>
  {/* Icon Container INSET — hundido para contraste táctil */}
  <div style={{
    width: 40, height: 40, borderRadius: 10,
    background: N.base,
    boxShadow: 'inset 2px 2px 4px #bec8de,inset -2px -2px 4px #ffffff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 0.75rem',
    color: N.accent
  }}>
    <Activity style={{ width: 18, height: 18 }} />
  </div>
  {/* Número grande en accent */}
  <p style={{ color: N.accent, fontSize: '1.5rem', fontWeight: 800 }}>99.97%</p>
  {/* Label uppercase tracking-wider */}
  <p style={{ color: N.textSub, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
    Uptime
  </p>
</div>
```

#### Quick Action Card
Para acciones rápidas tipo grid. Card elevada con icono inset + label centrado.

```tsx
<button style={{
  background: N.base,
  borderRadius: 16,
  boxShadow: '4px 4px 8px #bec8de,-4px -4px 8px #ffffff',
  padding: '1rem',
  textAlign: 'center',
  transition: 'all 0.2s ease'
}} className="hover:scale-[1.02] active:scale-[0.98]">
  <div style={{
    width: 36, height: 36, borderRadius: 10,
    background: N.base,
    boxShadow: 'inset 2px 2px 4px #bec8de,inset -2px -2px 4px #ffffff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 0.5rem',
    color: N.accent
  }}>
    <HardDrive style={{ width: 18, height: 18 }} />
  </div>
  <span style={{ color: N.text, fontSize: '0.75rem', fontWeight: 500 }}>Backup Full</span>
</button>
```

#### Header Sólido con Degradado
Para cards de resumen tipo "Análisis Cortex-Risk" en el wizard de contratos.

```tsx
<div style={{
  background: 'linear-gradient(135deg, #6888ff, #5572ee)',
  borderRadius: 16,
  boxShadow: '8px 8px 16px #bec8de,-8px -8px 16px #ffffff',
  padding: '1.5rem',
  color: '#fff'
}}>
  <h3 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Resumen del Contrato</h3>
  <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>Valores desde Paso 1</p>
</div>
```

### Sistema Mobile (Colores Cálidos)

| Elemento | Shadow |
|----------|--------|
| **Card Mobile** | `shadow-[6px_6px_14px_#D4D1CC,-6px_-6px_14px_#FFFFFF]` |
| **Header Mobile** | `shadow-[0_4px_12px_#D4D1CC]` |
| **Nav Mobile** | `shadow-[0_-4px_12px_#D4D1CC]` |


## 🪟 3. Sistema de Ventanas Flotantes (OS Paradigm)

Los modales tradicionales con fondo negro transparente **ESTÁN PROHIBIDOS**. Se adopta el **Operating System Window Paradigm**.

Una ventana debe ser:
1. **Draggable**: Arrastrable desde su header
2. **Minimizable**: Puede encogerse
3. **Sin overlay oscuro**: Solo `bg-[#dfeaff]/60 backdrop-blur-sm`
4. **Neuromórfica extrema**: `shadow-[12px_12px_24px_#bec8de,-12px_-12px_24px_#ffffff] border border-white/40`

### Boilerplate NeuromorphicWindow

```tsx
import { NeuromorphicWindow } from '@/components/ui/NeuromorphicWindow';

<NeuromorphicWindow
  title="Detalle Contrato"
  isOpen={isOpen}
  onClose={onClose}
  icon={<FileText className="w-5 h-5" />}
  defaultPosition={{ x: 100, y: 100 }}
  width={700}
>
  {/* Contenido */}
</NeuromorphicWindow>
```

### Isotipos de Controles (Botones OS)

```tsx
// Todos los controles usan color neumórfico base
// NO usar rojo, amarillo, verde para los botones de ventana

// Cerrar / Minimizar / Maximizar — estilo neumórfico
<button className="w-3 h-3 rounded-full bg-[#dfeaff] shadow-[2px_2px_4px_#bec8de,-1px_-1px_3px_#ffffff] hover:shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff] transition-all" />

// Alternativa con borde accent
<button className="w-3 h-3 rounded-full border border-[#6888ff]/30 shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] hover:bg-[#6888ff]/10 transition-all" />
```


### 3.1 Ventana Nativa del Navegador (Popup OS Window)

Para funcionalidades donde el usuario debe poder **trabajar en múltiples módulos simultáneamente** o tener una ventana independiente de la SPA, se usa **`window.open()`** nativo del navegador. Esto crea una ventana real del sistema operativo (no un div React), redimensionable con los controles nativos de Windows/macOS.

> **Aplica a:** Formularios de creación (`nuevo/page.tsx`), formularios de edición, y **ventanas de detalle/visualización** (`ver/page.tsx`). Toda ventana flotante del sistema DEBE incluir la opción "Ventana" popup nativa.

#### Especificación del Botón "Ventana"

```tsx
const openWindow = () => {
  const w = window.screen.availWidth;
  const h = window.screen.availHeight;
  window.open(
    '/{modulo}/nuevo?popup=1',
    '_blank',
    `width=${w},height=${h},left=0,top=0,resizable=yes,scrollbars=yes,menubar=no,toolbar=no,location=no,status=no`
  );
};

// En ventanas flotantes (detalle), el botón va en el header:
<button
  onClick={openWindow}
  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
  style={{
    background: '#dfeaff',
    color: '#69738c',
    boxShadow: '2px 2px 4px #bec8de,-2px -2px 4px #ffffff',
  }}
  title="Abrir en ventana nueva"
>
  <ExternalLink className="w-3.5 h-3.5" />
  <span>Ventana</span>
</button>
```

#### Requisitos de la Página Popup

1. **Query param `?popup=1`** (creación) o **`?id=XXX`** (detalle): La URL debe incluir el parámetro correspondiente para que la página detecte el modo ventana emergente
2. **Layout responsive pantalla completa**: Detectar modo popup. Cuando es popup, quitar `max-w-5xl` y usar ancho completo (`w-full`)
3. **Grids fluidos en popup**: Usar `grid-cols-[repeat(auto-fill,minmax(260px,1fr))]` en vez de breakpoints fijos (`lg:grid-cols-4`). Esto crea tantas columnas como quepan en el ancho disponible y se reajusta automáticamente cuando el usuario redimensiona la ventana
4. **Botón oculto en popup**: El botón "Ventana" NO debe mostrarse cuando `isPopup === true`
5. **Cierre automático tras guardar** (solo creación/edición): Si `isPopup && window.opener`, ejecutar `window.close()` después de guardar exitosamente
6. **Sincronización de estado** (creación/edición): Usar `localStorage` + `BroadcastChannel` para mantener el draft sincronizado entre la ventana principal y el popup. El draft debe incluir **tres claves**: `form` (datos), `currentStep` (paso visual actual), y `maxStepReached` (paso más alto visitado — evita bloquear pasos completados al navegar hacia atrás)
7. **Limpiar draft al montar página nueva**: La página `nuevo/page.tsx` (cuando NO es popup) debe limpiar `localStorage.removeItem(DRAFT_KEY)` en `useEffect` al montar, para que siempre empiece con campos vacíos

#### Sincronización de Draft (localStorage + BroadcastChannel)

```tsx
const DRAFT_KEY = 'silexar_{modulo}_draft';
const SYNC_CHANNEL = 'silexar_{modulo}_sync';

// Estados que se sincronizan
const [form, setForm] = useState(defaultData);
const [currentStep, setCurrentStep] = useState(1);
const [maxStepReached, setMaxStepReached] = useState(1);

// Guardar en cada cambio
useEffect(() => {
  if (mode === 'create') {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, currentStep, maxStepReached }));
  }
}, [form, currentStep, maxStepReached, mode]);

// Cargar al montar (incluye paso actual y maxStepReached)
useEffect(() => {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (raw) {
    const draft = JSON.parse(raw);
    if (draft.form) setForm(prev => ({ ...prev, ...draft.form }));
    if (draft.currentStep) setCurrentStep(draft.currentStep);
    if (draft.maxStepReached) setMaxStepReached(draft.maxStepReached);
  }
}, []);

// Escuchar limpieza y actualizaciones desde otras ventanas
useEffect(() => {
  const bc = new BroadcastChannel(SYNC_CHANNEL);
  bc.onmessage = (ev) => {
    if (ev.data?.type === 'CLEAR_DRAFT') {
      setForm(defaultData);
      setCurrentStep(1);
      setMaxStepReached(1);
    }
  };
  // También escuchar storage event para sincronización cross-tab
  const onStorage = (e: StorageEvent) => {
    if (e.key === DRAFT_KEY && e.newValue) {
      const draft = JSON.parse(e.newValue);
      if (draft.form) setForm(prev => ({ ...prev, ...draft.form }));
      if (draft.currentStep) setCurrentStep(draft.currentStep);
      if (draft.maxStepReached) setMaxStepReached(draft.maxStepReached);
    }
  };
  window.addEventListener('storage', onStorage);
  return () => { bc.close(); window.removeEventListener('storage', onStorage); };
}, []);

// Avanzar paso: actualizar currentStep Y maxStepReached
const handleNext = () => {
  if (validateStep(currentStep)) {
    const next = Math.min(currentStep + 1, TOTAL_STEPS);
    setCurrentStep(next);
    setMaxStepReached(prev => Math.max(prev, next));
  }
};

// Stepper clickeable: usar maxStepReached, no currentStep
const isClickable = step.id <= maxStepReached;

// Al guardar exitosamente: limpiar y notificar
localStorage.removeItem(DRAFT_KEY);
const bc = new BroadcastChannel(SYNC_CHANNEL);
bc.postMessage({ type: 'CLEAR_DRAFT' });
bc.close();
if (isPopup) window.close();
```


### 3.2 Scrollbars Neumórficas

**NUNCA** dejar los scrollbars grises/oscuros por defecto del sistema operativo. Todos los scrollbars del módulo deben usar los tonos neumórficos.

#### CSS Global (aplicar en cada página del módulo)

```tsx
<style>{`
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: #dfeaff; border-radius: 10px; }
  ::-webkit-scrollbar-thumb { background: #bec8de; border-radius: 10px; box-shadow: inset 1px 1px 2px rgba(0,0,0,0.08); }
  ::-webkit-scrollbar-thumb:hover { background: #6888ff; }
  ::-webkit-scrollbar-corner { background: #dfeaff; }
`}</style>
```

| Parte | Valor | Descripción |
|-------|-------|-------------|
| **Track** | `#dfeaff` | Fondo igual al base del sistema — se integra visualmente |
| **Thumb** | `#bec8de` | Tono sombra neumórfica — sutil y elegante |
| **Thumb hover** | `#6888ff` | Acento al pasar el mouse — feedback claro |
| **Corner** | `#dfeaff` | Esquina donde se cruzan scrollbars |

#### Clase Reutilizable `.neu-scrollbar`

Para contenedores internos (modales, drawers, listas):

```css
.neu-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
.neu-scrollbar::-webkit-scrollbar-track { background: #dfeaff; border-radius: 10px; }
.neu-scrollbar::-webkit-scrollbar-thumb { background: #bec8de; border-radius: 10px; box-shadow: inset 1px 1px 2px rgba(0,0,0,0.08); }
.neu-scrollbar::-webkit-scrollbar-thumb:hover { background: #6888ff; }
```

```tsx
<div className="overflow-y-auto neu-scrollbar">
  {/* contenido scrollable */}
</div>
#### Menú de Navegación de Módulos (`ModuleNavMenu`) — Elemento Fijo Global

Toda página del sistema DEBE incluir el **menú de navegación de módulos** al costado izquierdo del header, junto al botón de regreso. Este menú permite saltar rápidamente a cualquier módulo sin volver al dashboard.

**Especificación:**
- **Componente**: `ModuleNavMenu` ubicado en `src/components/module-nav-menu.tsx`
- **Posición**: Siempre al costado izquierdo, inmediatamente después del botón ← (volver)
- **Ícono**: Solo `LayoutGrid` (cuadrícula) — **sin ícono secundario** del módulo actual
- **Comportamiento**: Click abre dropdown neumórfico con los módulos habilitados
- **Resaltado**: El módulo actual aparece en azul `#6888ff`; los demás en `#69738c`
- **Cierre**: Click fuera del menú lo cierra automáticamente

**Módulos disponibles (todos los del sistema):**
Dashboard, Dashboard Ejecutivo, Anunciantes, Contratos, Campañas, Cuñas, Tandas, Exportar Pauta, Facturación, Vencimientos, Menciones, Agencias Creativas, Agencias Medios, Cotizador, CRM, Propuestas, Evidencia, Inventario, Emisoras, Vendedores, Equipos Ventas, Centro Mando, Conciliación, Configuración, Usuarios, Analytics, Cierre Mensual, Cortex, AI Assistant, Portal Cliente.

**Configuración:** La lista de módulos visibles se guarda en `localStorage` (clave: `silexar_navigation_modules`). El admin la edita desde **Configuración > Navegación de Módulos** (`/configuracion/navegacion`), que funciona como página standalone con botón **"Ventana"** que abre popup nativo (`window.open('/configuracion/navegacion?popup=1')`) con dimensiones de pantalla completa, scrollbar neumórfica, grid fluido y cierre automático al guardar.

**Páginas donde DEBE estar obligatoriamente:**
- `page.tsx` del listado principal
- `nuevo/page.tsx` (formulario de creación)
- `ver/page.tsx` (detalle standalone)
- Cualquier subpágina del módulo (edición, configuración, etc.)

```tsx
// Header estándar de cualquier página
<div className="flex items-center gap-3">
  <button onClick={() => router.push('/dashboard')}>
    <ArrowLeft />
  </button>
  <ModuleNavMenu />
  {/* Título del módulo (opcional, si no está duplicado en el contenido) */}
</div>
```

#### Header de Ventanas Flotantes — Controles Permitidos

**PROHIBIDO** usar los 3 círculos de colores estilo Mac OS (rojo, amarillo, verde) en el header de las ventanas flotantes. Estos no son funcionales ni entonan con el sistema neumórfico.

**Controles permitidos en el header:**
- Título + icono del módulo (izquierda)
- Badge de estado (derecha)
- Botón **"Ventana"** con icono `ExternalLink` (derecha) — abre popup nativo
- Botón **Maximizar/Restaurar** con icono `Maximize2`/`Minimize2` (derecha)
- Botón **Cerrar** con icono `X` (derecha)

```tsx
// Header correcto — sin círculos de colores
<div className="flex items-center justify-between px-5 py-3">
  {/* Izquierda: Icono + Título */}
  <div className="flex items-center gap-2">
    <Building2 className="w-4 h-4" style={{ color: '#6888ff' }} />
    <span className="text-sm font-bold" style={{ color: '#69738c' }}>Nombre</span>
  </div>
  {/* Derecha: Estado + Ventana + Maximizar + Cerrar */}
  <div className="flex items-center gap-2">
    <StatusBadge estado="activo" />
    <button title="Abrir en ventana nueva">Ventana</button>
    <button title="Maximizar"><Maximize2 /></button>
    <button title="Cerrar"><X /></button>
  </div>
</div>
```


## 🖋️ 4. Tipografía

- **Font Principal**: `Inter` con tracking amplio (`tracking-tight`, `tracking-widest`)
- **Textos Primarios**: `text-[#69738c]` — Nunca negro puro `#000`
- **Textos Secundarios**: `text-[#9aa3b8]` para información adicional
- **Títulos**: `text-[#69738c] font-bold` para jerarquía clara
- **Acentos/Números**: `text-[#6888ff]` para destacados
- **Estados**: `text-[#6888ff]` con opacidad variable para diferenciar


## 🔄 5. Microinteracciones

| Estado | Efecto |
|--------|--------|
| **Hover** | `hover:shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:scale-[1.01] transition-all duration-300` |
| **Active** | `active:shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]` |
| **Focus** | `focus:outline-none focus:ring-2 focus:ring-[#6888ff]/30` |
| **Disabled** | `disabled:opacity-50 disabled:cursor-not-allowed` |


## 📋 6. Protocolo de Implementación

### Al crear/modificar una página:

1. **Fondo Base**: `bg-[#dfeaff]` para desktop, `bg-[#F0EDE8]` para mobile
2. **Cards (MetricCard, etc)**: 
   - Card principal: `rounded-3xl` con sombra neu
   - Icon container interior: `rounded-2xl` con sombra neuSm
   - Ambos usan sombra oscura ABAJO-DERECHA y sombra clara ARRIBA-IZQUIERDA
3. **Inputs**: sombra inset
4. **Botones**: Usar patrones de la tabla
5. **Textos**: Siempre `text-[#69738c]` o `text-[#9aa3b8]`
6. **Estados/Badges**: SIEMPRE `text-[#6888ff]` con opacidad o degradado — NUNCA verde, rojo, amarillo, morado, cyan, rosa
7. **Headers destacados**: Usar degradado `linear-gradient(135deg, #6888ff, #5572ee)` como en el wizard de contratos
8. **Progress bars**: Fill siempre `#6888ff`, nunca rojo/verde/naranja según valor
9. **PROHIBIDO**: Todo color que no sea `#6888ff` y sus degradados/opacidades para acentos


## ✅ 7. Checklist de Verificación

- [ ] Fondo base: `bg-[#dfeaff]` (desktop) o `bg-[#F0EDE8]` (mobile)
- [ ] **SOMBRAS DUALES**: Toda sombra elevada debe tener ambas partes:
  - Oscura (`#bec8de`) hacia abajo-derecha
  - Clara (`#ffffff`) hacia arriba-izquierda
- [ ] **UNICA LINEA DE COLOR**: Solo `#6888ff` y sus degradados/opacidades para estados, iconos, badges, isotipos
- [ ] **Degradados permitidos**: Solo del matiz azul (`#6888ff` → `#5572ee`, `#8ba4ff`, `#4a6de5`)
- [ ] `border border-white/40` donde aplique
- [ ] Textos: `text-[#69738c]` (primario) y `text-[#9aa3b8]` (secundario)
- [ ] Transiciones: `transition-all duration-200`
- [ ] Estados hover/active en todos los elementos interactivos
- [ ] Progress bars con shadow inset, fill `#6888ff`
- [ ] **PROHIBIDO**: Verde, rojo, amarillo, naranja, morado, violeta, rosa, cyan, azul brillante para estados
- [ ] No usar bordes duros `border-gray-XXX`
- [ ] No usar negro puro `#000` ni blanco puro `#fff` en textos
- [ ] **Scrollbars neumórficas**: Todos los scrollbars del módulo usan `#dfeaff` track + `#bec8de` thumb + `#6888ff` hover
- [ ] **Botón "Ventana"**: La página `nuevo/page.tsx` incluye el botón `window.open()` con dimensiones pantalla completa
- [ ] **Popup responsive**: Cuando `?popup=1`, el layout usa ancho completo (`max-w-full`) sin contenedores centrados
- [ ] **Draft sincroniza paso actual**: El draft en localStorage incluye `currentStep` para que popup y ventana principal siempre muestren el mismo paso
- [ ] **Draft sincroniza maxStepReached**: El draft incluye `maxStepReached` para que los pasos completados nunca se bloqueen al navegar hacia atrás
- [ ] **Limpiar draft al montar**: `nuevo/page.tsx` limpia el draft al montar (cuando no es popup) para empezar siempre con campos vacíos
