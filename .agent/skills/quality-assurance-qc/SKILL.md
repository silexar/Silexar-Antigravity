---
name: Quality Assurance & QC TIER 0
description: Protocolo estricto de Control de Calidad, auditoría UX y Cero Deuda Técnica que Antigravity debe ejecutar obligatoriamente para certificar cualquier módulo construido, con capacidades de lectura/escritura en una base de conocimiento para no repetir errores pasados.
---

# 🛡️ SKILL: QUALITY ASSURANCE SUPREME TIER 0 — AUTO-REPAIR AUTODIDACTA

El protocolo definitivo e ilimitado de control de calidad para **todo** módulo construido o por construir en Silexar Pulse Antygravity. Este Skill es **universal** — se aplica con la misma intensidad a Vencimientos, Conciliación, Contratos, Campañas, Cuñas, Equipos de Ventas, Super-Admin o cualquier módulo futuro. Transforma a Antigravity en un equipo supremo y autónomo de QA Enterprise que **no solo detecta problemas, sino que los CORRIGE automáticamente** y se auto-enseña para nunca repetirlos.

---

## 🎨 IDENTIDAD VISUAL OBLIGATORIA: NEUMORPHISM (NEUROMORPHIC DESIGN) — SILEXAR PULSE

TODO módulo de Silexar Pulse DEBE adherirse al sistema de diseño **Neumorphism**. Esta es la identidad visual inquebrantable de la plataforma — táctil, inmersiva, con relieve y profundidad mediante luces y sombras precisas.

### Color Base del Sistema

| Propiedad | Valor |
|-----------|-------|
| **HEX** | `#F0EDE8` |
| **RGB** | `rgba(240, 237, 232)` |
| **Tailwind** | `bg-[#F0EDE8]` |

### Tokens de Diseño (DNA Visual)

| Propiedad | Valor Obligatorio |
|-----------|-------------------|
| **Fondo base página** | `bg-[#F0EDE8]` — jamás negro, jamás blanco puro |
| **Fondo de cards** | `bg-[#F0EDE8]` (mismo fondo que la página) |
| **Bordes** | Sin bordes duros (o bordes ligeros transparentes/claros) |
| **Border radius** | `rounded-2xl` o `rounded-3xl` (siempre generosamente redondeado) |
| **Sombras cards** | `shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]` (Neumorfismo exterior) |
| **Sombras inputs** | `shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]` (Neumorfismo interior) |
| **Profundidad/3D** | Uso de sombras inset (hundido) u outset (elevado) según el componente |
| **Texto primario** | `text-gray-800` o `text-slate-700` (oscuro sobre fondo claro) |
| **Texto secundario** | `text-gray-500` o `text-slate-400` |
| **Texto micro-labels** | `text-[10px] text-gray-400 uppercase tracking-widest font-semibold` |
| **Acentos de color** | `blue-600`, `emerald-500`, `amber-500`, `red-500` según contexto |
| **Transiciones** | `transition-all duration-300` en TODO elemento interactivo |
| **Hover en cards** | `hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]` (la sombra se reduce sutilmente) |
| **Hover en botones** | `hover:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]` (efecto presionado) |
| **Inputs** | `bg-[#F0EDE8] shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400/50` |
| **Tipografía** | Google Font: **Inter** o **Outfit** (nunca serif, nunca defaults del browser) |

### Patrones Neumorphism Obligatorios

- **Card estándar (Neuromorphic):**
  ```html
  <div className="bg-[#F0EDE8] rounded-2xl p-6 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]">
  ```
- **Input text (Neumorphic Inset):**
  ```html
  <input className="bg-[#F0EDE8] shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] rounded-xl px-4 py-2" />
  ```
- **Label de sección:**
  ```html
  <h3 className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
  ```
- **Botón primario (Redondeado + Sombra Blanca):**
  ```html
  <button className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold shadow-md shadow-blue-200/50 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
  ```
- **Botón secundario (Outline + Profundidad):**
  ```html
  <button className="bg-white/80 border border-gray-200 text-gray-700 px-6 py-3 rounded-full font-medium shadow-sm shadow-white/60 hover:bg-gray-50 hover:shadow-md transition-all">
  ```
- **Tab activo:** `bg-blue-600 text-white rounded-full shadow-md` | **Tab inactivo:** `text-gray-500 hover:text-gray-700`
- **Status Badge (Pagado):** `bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full px-3 py-1 text-xs font-semibold`
- **Status Badge (Pendiente):** `bg-amber-50 text-amber-600 border border-amber-200 rounded-full px-3 py-1 text-xs font-semibold`
- **Sidebar / NavBar:** `bg-white/80 backdrop-blur-xl border-r border-gray-100 shadow-lg`

### Ventanas Emergentes / Modales (Draggable + Transparentes)

TODO modal o ventana emergente en Silexar Pulse DEBE seguir estos principios:

1. **Fondo transparente con blur:** El modal tiene `bg-white/85 backdrop-blur-2xl` para que el contenido del sistema sea visible por detrás.
2. **Overlay semitransparente:** El backdrop del modal usa `bg-black/20 backdrop-blur-sm` (NO negro sólido).
3. **Arrastrable (Draggable):** Los modales deben ser movibles por el usuario. Implementar con:
   - Estado `position` (`useState({ x, y })`) y eventos `onMouseDown`/`onMouseMove`/`onMouseUp`.
   - Cursor `cursor-grab` en la barra de título del modal, `cursor-grabbing` al arrastrar.
   - El modal usa `position: fixed` con `top` y `left` controlados por el state.
4. **Redimensionable:** Opcionalmente, añadir un handle de resize en la esquina inferior derecha.
5. **Botón de cierre:** Siempre visible en la esquina superior derecha con `×`.
6. **Sombra de elevación:** `shadow-2xl shadow-gray-300/40` para que el modal flote visualmente sobre el contenido.

Patrón de modal draggable:
```tsx
// Estado de posición del modal
const [pos, setPos] = useState({ x: window.innerWidth / 2 - 300, y: 100 });
const [dragging, setDragging] = useState(false);
const [offset, setOffset] = useState({ x: 0, y: 0 });

// En el JSX:
<div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />
<div
  className="fixed z-50 bg-white/85 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-2xl shadow-gray-300/40 w-[600px] overflow-hidden"
  style={{ left: pos.x, top: pos.y }}
>
  <div
    className="flex justify-between items-center p-4 border-b border-gray-100 cursor-grab active:cursor-grabbing"
    onMouseDown={(e) => { setDragging(true); setOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y }); }}
  >
    <h2 className="font-semibold text-gray-800">Título del Modal</h2>
    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
  </div>
  <div className="p-6">{/* Contenido */}</div>
</div>
```

> [!IMPORTANT]
> Si un componente usa fondos negros (`bg-slate-950`, `bg-black`), esquinas cuadradas (`rounded-none`), modales sin transparencia ni drag, o colores que no pertenecen a la paleta, VIOLA el DNA visual y DEBE ser corregido hacia el estándar Light Glassmorphism.

> [!CAUTION]
> **FILOSOFÍA CORE: DETECT → FIX → VERIFY**
> Cada bloque sigue un ciclo de 3 fases implacable:
> 1. **DETECT**: Escanear, buscar, inspeccionar el problema.
> 2. **FIX**: Corregir inmediatamente el código con `replace_file_content` o `multi_replace_file_content`. No reportar — ARREGLAR.
> 3. **VERIFY**: Re-ejecutar la prueba para confirmar que el fix funcionó. Si no, volver a DETECT.
>
> **NO SE PERMITE** dejar un hallazgo como "pendiente" si está en tu capacidad arreglarlo. **ARRÉGLALO.**

---

## 📌 CUÁNDO ACTIVAR ESTE SKILL

- **SIEMPRE** al finalizar la construcción de un nuevo módulo o feature.
- **A petición** del usuario ("QC", "QA", "auditoría", "revisar", "control de calidad").
- **Post-hotfix** para verificar cero regresiones.

> Un módulo **NO PUEDE** ser declarado terminado sin que TODOS los bloques hayan pasado con Score ≥ 95%.

---

## ⚙️ PIPELINE DE EJECUCIÓN (14 BLOQUES AUTO-REPAIR)

---

### 🧠 BLOQUE 1: RECUPERACIÓN DE MEMORIA (Self-Learning Input)

**DETECT:**
1. Leer `.agent/skills/quality-assurance-qc/qc_knowledge.md` completo.
2. Extraer TODAS las lecciones con Severidad 🔴 o 🟠.

**FIX (Proactivo):**
3. Para CADA lección crítica/alta, ejecutar `grep_search` en `src/app/<modulo>` buscando el anti-patrón exacto descrito en la lección.
4. Si se encuentra el anti-patrón, **corregirlo inmediatamente** sin preguntar.

**VERIFY:**
5. Re-ejecutar la búsqueda. El anti-patrón ya no debe existir.

---

### 🖥️ BLOQUE 2: AUDITORÍA UX DESKTOP — FLUJO FUNCIONAL COMPLETO

**DETECT:**
1. Abrir `page.tsx` del módulo. Leer completamente.
2. Identificar TODOS los estados de navegación (`vistaActiva`, `tab`, etc.) y sus posibles valores.
3. Para CADA valor de navegación, verificar que existe un bloque `{vistaActiva === 'X' && (...)}` con un componente real renderizado.
4. Revisar CADA `onClick`, `onChange`, `onSubmit` en el archivo. Verificar que:
   - Tiene un handler definido (NO `onClick={() => {}}` vacío).
   - El handler modifica estado, navega o ejecuta lógica real.
   - Los botones de "Guardar", "Activar", "Confirmar" tienen al menos un `alert()`, `toast`, `setState` o llamada API.

**FIX:**
5. Si un `onClick` está vacío o falta, **IMPLEMENTAR** la acción mínima viable:
   - Botón de navegación: `onClick={() => setVistaActiva('destino')}`.
   - Botón de acción: `onClick={() => alert('Funcionalidad ejecutada con éxito')}` como mínimo.
   - Botón de exportar: Implementar descarga (`window.open`, `blob`, o al menos feedback visual).
6. Si una vista falta su componente: crear un componente placeholder funcional con el título correcto y un mensaje informativo.
7. Si falta un estado de navegación para una vista importada: agregarlo al tipo union y al tab bar.

**VERIFY:**
8. Si hay servidor corriendo, usar `browser_subagent` con viewport `1440x900`:
   - Navegar a `http://localhost:3000/<modulo>`.
   - Hacer click en CADA tab. Verificar que carga contenido (no pantalla blanca, no error).
   - Hacer click en botones de acción principales. Verificar respuesta (modal, toast, cambio de estado).
   - Capturar screenshot de CADA tab como evidencia.

---

### 📱 BLOQUE 3: AUDITORÍA UX MOBILE — OPERACIÓN COMO USUARIO MÓVIL

**DETECT:**
1. Abrir el Dashboard Móvil principal (`MobileDashboard.tsx` o equivalente). Leer completamente.
2. Verificar existencia de:
   - `<nav>` con `position: fixed` y `bottom: 0` (Bottom Navigation Bar).
   - Items de navegación que cubran los pilares principales (Home, Cupos, Programas, Hub/Settings).
   - Quick Actions en el Home que naveguen a secciones clave.
3. Para CADA tab/botón del Dashboard Móvil, verificar que el `onClick` ejecuta `setTab(...)` o navegación real.
4. Para CADA vista mobile, verificar:
   - Existe el archivo en `movil/_components/`.
   - Está importado en el Dashboard.
   - Tiene un bloque render condicional `{tab === 'X' && (...)}`.

**FIX:**
5. Si falta Bottom Nav Bar: **CREARLA** con items de navegación estándar.
6. Si un Quick Action no tiene `onClick`: **IMPLEMENTAR** `onClick={() => setTab('destino')}`.
7. Si una vista del Desktop no tiene contraparte Mobile:
   - Crear archivo `Mobile<NombreVista>.tsx` con un layout simplificado.
   - Importarla en el Dashboard.
   - Agregar tab y render condicional.
8. Si hay `padding-bottom` insuficiente en el contenido principal (Bottom Nav tapa contenido): agregar `pb-24`.
9. Si hay textos menores a 10px: ajustar a mínimo `text-[10px]`.
10. Si hay botones menores a 44px de alto: agregar `min-h-[44px]` o padding.

**VERIFY:**
11. Si hay servidor corriendo, usar `browser_subagent`:
    - **Redimensionar a `375x812`** (iPhone viewport).
    - Navegar a `http://localhost:3000/<modulo>/movil`.
    - Tap en CADA item de la Nav Bar.
    - Verificar que cada vista carga contenido.
    - Verificar que no hay overflow horizontal (`overflow-x`).
    - Capturar screenshot de CADA vista móvil como evidencia.

---

### 🎨 BLOQUE 4: AUDITORÍA DE DISEÑO NEUMORPHISM (NEUROMORPHIC)

**Objetivo:** Verificar que TODA la UI del módulo respeta el DNA visual Neumorphism de Silexar Pulse (fondo `#F0EDE8`, sombras dobles para crear relieve interior y exterior).

**DETECT:**
1. Buscar violaciones del sistema de diseño:
```bash
# Fondos oscuros/negros (PROHIBIDOS - estilo viejo)
grep -rn "bg-slate-950\|bg-slate-900\|bg-black\|bg-\[#0a0f1e\]" src/app/<modulo> --include="*.tsx"

# Esquinas cuadradas (PROHIBIDAS)
grep -rn "rounded-none\|rounded-sm" src/app/<modulo> --include="*.tsx"

# Texto blanco sobre fondo claro (ilegible en nuevo estilo)
grep -rn "text-white" src/app/<modulo> --include="*.tsx"
# Nota: text-white es válido SOLO dentro de botones primarios coloreados (bg-blue-600, bg-emerald-600)

# Modales sin backdrop-blur (PROHIBIDO)
grep -rn "fixed.*bg-black/\|fixed.*bg-slate" src/app/<modulo> --include="*.tsx"
```
2. Revisar visual y manualmente que cada componente use:
   - Fondo base `bg-[#ECEFF8]` en el layout principal.
   - Cards con `bg-white/70` o `bg-white/80` + `backdrop-blur-xl`.
   - Bordes suaves (`border-white/40`, `border-gray-200/50`, `border-gray-100`).
   - Border radius generoso (`rounded-xl`, `rounded-2xl`, `rounded-3xl`).
   - Sombras delicadas (`shadow-lg shadow-gray-200/50`).
   - Botones con `rounded-full` y sombra blanca delicada (`shadow-md shadow-white/60`).
   - Texto primario oscuro (`text-gray-800`, `text-slate-700`) sobre fondo claro.

3. Verificar modales y ventanas emergentes:
   - ¿Tienen fondo transparente con blur (`bg-white/85 backdrop-blur-2xl`)?
   - ¿Son arrastrables (draggable) por el usuario?
   - ¿El overlay es semitransparente (`bg-black/20 backdrop-blur-sm`), NO negro sólido?
   - ¿Tienen botón de cierre visible?
   - ¿Permiten ver el contenido detrás de la ventana?

4. Verificar consistencia de paleta de acentos:
   - 🟢 Operativo/Positivo: `emerald-500` con `bg-emerald-50` para badges.
   - 🟡 Alerta/Precaución: `amber-500` con `bg-amber-50` para badges.
   - 🔴 Crítico/Error: `red-500` con `bg-red-50` para badges.
   - 🔵 Primario/Acción: `blue-600` con `bg-blue-50` para badges.

**FIX:**
5. `bg-slate-950` / `bg-black` → reemplazar con `bg-[#ECEFF8]`.
6. `bg-slate-900/50` → reemplazar con `bg-white/70 backdrop-blur-xl`.
7. `text-white` (fuera de botones primarios) → reemplazar con `text-gray-800`.
8. `text-slate-400` → reemplazar con `text-gray-500`.
9. `rounded-none` / `rounded-sm` → reemplazar con `rounded-2xl`.
10. Botones sin redondeo completo → agregar `rounded-full shadow-md shadow-white/60`.
11. Modales sin transparencia → aplicar patrón draggable glassmorphism del DNA Visual.
12. Modales sin drag → implementar `onMouseDown`/`onMouseMove` para arrastre.
13. Cards sin sombra → agregar `shadow-lg shadow-gray-200/50`.
14. Cards sin profundidad en acciones → agregar `hover:shadow-xl` para efecto de elevación.

**VERIFY:**
Re-ejecutar búsquedas. Cero `bg-slate-950`, cero `bg-black`, cero `rounded-none`. Todo el módulo respira Light Glassmorphism Premium.

---

### 🎯 BLOQUE 5: EXPERIENCIA OPERATIVA DEL USUARIO (Fluidez, Velocidad, Información)

**Objetivo:** Verificar que el sistema OPERA como un reloj suizo — rápido, fluido, con la información correcta en el lugar correcto. No basta con que funcione; debe SENTIRSE premium.

**DETECT — Jerarquía Visual y Densidad de Información:**
1. En CADA pantalla/vista del módulo, verificar:
   - **KPIs prominentes**: ¿Los números más importantes (revenue, ocupación, alertas) están en la parte superior con tipografía grande (≥20px) y color contrastante?
   - **Información secundaria subordinada**: ¿Los detalles (fechas, IDs, notas) están en texto pequeño y color atenuado debajo de lo principal?
   - **Agrupación lógica**: ¿Los datos relacionados están juntos en el mismo card/panel? ¿No hay información dispersa que obligue al usuario a buscar?
   - **Sin ruido**: ¿Hay elementos decorativos que distraigan de la información operativa? Si sí, simplificar.

2. **Coherencia de datos mostrados:**
   - ¿Los montos tienen formato consistente? (Ej: siempre `$45.000.000` o siempre `$45M`, no mezclar).
   - ¿Las fechas tienen formato consistente? (Ej: siempre `01-Ene-2026` o `2026-01-01`, no mezclar).
   - ¿Los porcentajes muestran decimales cuando es relevante? (Ej: `78.4%` no `78%` en dashboards analíticos).
   - ¿Los estados/badges usan colores consistentes? (🟢 Activo verde, 🔴 Crítico rojo, 🟡 Pendiente amarillo — SIEMPRE).
   - ¿Los datos mock son realistas y coherentes entre sí? (Un programa con 8 cupos no puede mostrar 12 ocupados).

**DETECT — Velocidad Percibida y Feedback:**
3. En CADA acción del usuario (click en tab, abrir modal, filtrar, buscar):
   - ¿Hay feedback visual INMEDIATO? (cambio de color del tab, spinner, highlight).
   - ¿Las transiciones/animaciones son suaves? (`transition-all`, `animate-in`, `duration-300`).
   - ¿Los filtros/búsquedas responden sin delay perceptible?
   - ¿Los botones tienen estados visuales claros? (`hover`, `active:scale-95`, `disabled:opacity-50`).

4. **Flujo de tarea completa:**
   - Simular una tarea real de principio a fin (Ej: "Consultar disponibilidad de un programa → Ver precio → Reservar cupo → Confirmar").
   - ¿Se puede completar en ≤5 pasos?
   - ¿Cada paso muestra claramente qué hacer a continuación?
   - ¿Hay breadcrumbs o indicadores de progreso en flujos multi-paso?
   - ¿Hay botón de "Volver" o navegación de retorno en cada sub-vista?

5. **Micro-interacciones:**
   - ¿Los badges de conteo se actualizan? (Ej: "Alertas (3)" muestra el número real).
   - ¿Los semáforos de estado reflejan la realidad de los datos? (Si ocupación >80% → verde, <50% → rojo).
   - ¿Los tooltips existen en iconos o abreviaciones que no son auto-explicativas?
   - ¿Los números grandes tienen separadores de miles para legibilidad? (`1.234.567` no `1234567`).

**FIX:**
6. KPIs no prominentes → Aumentar `text-2xl font-black` y color saturado.
7. Datos inconsistentes → Unificar formateadores: crear/usar helper `formatCLP()`, `formatDate()`, `formatPercent()`.
8. Sin feedback en clicks → Agregar `active:scale-95 transition-all` y estados hover.
9. Flujo largo (>5 pasos) → Simplificar combinando pasos o agregando atajos.
10. Datos mock incoherentes → Corregir los arrays de demo para que los números cuadren.
11. Botón de volver faltante → Agregar `← Volver` en la esquina superior de sub-vistas.
12. Números sin formato → Aplicar `Intl.NumberFormat` o helpers de formateo.

**VERIFY:**
13. Re-leer cada vista. ¿Un gerente que la ve por primera vez entiende inmediatamente qué está mirando? ¿Un ejecutivo en terreno puede operar en 3 segundos? Si la respuesta es no, volver a FIX.

---

### 🔘 BLOQUE 6: VERIFICACIÓN FUNCIONAL DE CADA ELEMENTO INTERACTIVO

**DETECT:**
1. En TODOS los archivos `.tsx` del módulo, buscar CADA elemento interactivo:
```bash
grep -rn "onClick\|onChange\|onSubmit\|onBlur\|onFocus\|onKeyDown" src/app/<modulo> --include="*.tsx"
```
2. Para cada match, verificar que el handler:
   - NO es una función vacía `() => {}`.
   - NO es un `console.log` solitario.
   - Ejecuta lógica real (setState, navigate, API call, modal, toast, alert).
3. Buscar botones que dicen "Guardar", "Activar", "Confirmar", "Enviar", "Exportar", "Descargar":
```bash
grep -rn "Guardar\|Activar\|Confirmar\|Enviar\|Exportar\|Descargar\|Reservar\|Cancelar" src/app/<modulo> --include="*.tsx"
```
   Verificar que CADA uno tiene un handler que ejecuta algo.
4. Buscar formularios `<form>` o inputs sin `onChange`:
```bash
grep -rn "<input\|<select\|<textarea" src/app/<modulo> --include="*.tsx" | grep -v "onChange"
```

**FIX:**
5. **Todo botón sin acción**: Implementar la acción apropiada:
   - Botón de navegación → `setTab('X')` o `setVista('X')`.
   - Botón de confirmación → `setState` de éxito + feedback visual.
   - Botón de exportar → `alert('Exportando datos...')` + icon change.
   - Botón de cancelar → `onClose()` o navegación atrás.
6. **Todo input sin onChange**: Conectar a un `useState` con `onChange={e => setX(e.target.value)}`.
7. **Todo select sin onChange**: Conectar a estado con handler.

**VERIFY:**
8. Re-ejecutar los greps. Cero handlers vacíos. Cero inputs desconectados.

---

### 🔗 BLOQUE 7: INTEGRIDAD DE CONEXIONES Y ROUTING

**DETECT:**
1. Listar TODOS los componentes importados en `page.tsx` y `MobileDashboard.tsx`.
2. Para cada import, verificar que existe un render condicional correspondiente en el JSX.
3. Listar TODOS los archivos `.tsx` en `_components/` y `movil/_components/`:
```bash
find_by_name en src/app/<modulo>/_components con extensión .tsx
find_by_name en src/app/<modulo>/movil/_components con extensión .tsx
```
4. Para cada archivo encontrado, verificar que ALGO lo importa:
```bash
grep -rn "NombreDelComponente" src/app/<modulo>/ --include="*.tsx"
```

**FIX:**
5. Component importado pero no renderizado → agregar tab + render condicional.
6. Archivo `.tsx` que nadie importa → importarlo y conectarlo O eliminarlo si es realmente obsoleto.
7. Tab sin componente → crear componente mínimo viable.

**VERIFY:**
8. Re-escanear. Cero huérfanos. Todo import tiene render. Todo archivo está conectado.

---

### 🎨 BLOQUE 8: ESTADOS DE UI COMPLETOS (Loading / Empty / Error / Success)

**DETECT:**
1. Para CADA vista/componente principal del módulo, verificar que existen los 4 estados fundamentales de UI:
   - **Loading**: Skeleton, spinner o shimmer mientras carga datos.
   - **Empty**: Mensaje informativo cuando no hay datos ("No hay registros").
   - **Error**: Mensaje con botón de reintentar cuando falla la carga.
   - **Success**: Feedback visual tras completar una acción ("✅ Guardado exitosamente").
2. Buscar componentes que renderizan listas/tablas SIN manejar el caso vacío:
```bash
grep -rn "\.map(" src/app/<modulo> --include="*.tsx"
```
   Verificar que antes del `.map()` existe un check `if (!data.length)` o `{data.length === 0 && ...}`.

**FIX:**
3. Si falta estado de loading: agregar un skeleton básico o `<p className="text-slate-500 animate-pulse">Cargando...</p>`.
4. Si falta estado vacío: agregar `{items.length === 0 && <p className="text-slate-500 text-center py-8">No hay registros disponibles</p>}`.
5. Si falta feedback de éxito en acciones: agregar `alert('✅ Operación completada')` o un toast visual.

**VERIFY:**
6. Re-escanear. Toda lista tiene estado vacío. Toda acción tiene feedback.

---

### 🔒 BLOQUE 9: AUDITORÍA DE SEGURIDAD ENTERPRISE

**DETECT:**
```bash
# Secretos hardcodeados
grep -rn "apiKey\|api_key\|secret\|password\|Bearer\|sk_live\|pk_live\|PRIVATE_KEY" src/app/<modulo> --include="*.ts" --include="*.tsx"

# XSS
grep -rn "dangerouslySetInnerHTML\|innerHTML" src/app/<modulo> --include="*.tsx"

# Console.log en producción
grep -rn "console\.\(log\|warn\|error\|debug\)" src/app/<modulo> --include="*.ts" --include="*.tsx"

# localStorage con datos sensibles
grep -rn "localStorage\.\(setItem\|getItem\)" src/app/<modulo> --include="*.ts" --include="*.tsx"

# eval o Function constructor
grep -rn "eval(\|new Function(" src/app/<modulo> --include="*.ts" --include="*.tsx"
```

**FIX:**
1. Secretos → mover a `process.env.VARIABLE`.
2. `dangerouslySetInnerHTML` → sanitizar con DOMPurify o reemplazar con texto plano.
3. `console.log` → eliminar o reemplazar con logger de producción.
4. Datos sensibles en localStorage → mover a httpOnly cookies o session storage temporal.
5. `eval` → eliminar completamente, refactorizar la lógica.

**VERIFY:**
Re-ejecutar todos los greps. Cero resultados.

---

### ⚡ BLOQUE 10: PERFORMANCE Y OPTIMIZACIÓN REACT

**DETECT:**
1. Funciones inline en `onClick` de componentes hijo que causan re-renders.
2. Arrays/objetos creados dentro del render que cambian referencia cada ciclo.
3. Listas >20 items sin virtualización ni paginación.
4. Imports de librerías completas cuando se usa una sola función.
5. Inputs de búsqueda sin debounce.

**FIX:**
1. Funciones inline → extraer a `useCallback`.
2. Objetos en render → mover a `useMemo`.
3. Listas enormes → agregar paginación o `slice(0, 20)` con "Ver más".
4. Imports pesados → usar import destructurado.
5. Search inputs sin debounce → agregar `setTimeout`/`useDeferredValue` de 300ms.

**VERIFY:**
Re-escanear. Sin anti-patrones de performance obvios.

---

### ♿ BLOQUE 11: ACCESIBILIDAD (a11y WCAG 2.1 AA)

**DETECT:**
```bash
# Divs clickeables sin role ni semántica
grep -rn "<div.*onClick" src/app/<modulo> --include="*.tsx"

# Inputs sin label
grep -rn "<input" src/app/<modulo> --include="*.tsx" | grep -v "aria-label"

# Imágenes sin alt
grep -rn "<img" src/app/<modulo> --include="*.tsx" | grep -v "alt="
```

**FIX:**
1. `<div onClick>` → cambiar a `<button>` o agregar `role="button" tabIndex={0} onKeyDown={handleEnter}`.
2. `<input>` sin label → agregar `aria-label="Descripción"`.
3. `<img>` sin alt → agregar `alt` descriptivo o `alt=""` si decorativa.
4. Elementos interactivos sin focus → agregar `focus:ring-2 focus:ring-amber-500`.

**VERIFY:**
Re-ejecutar greps. Cero violaciones.

---

### 🏛️ BLOQUE 12: ARQUITECTURA DDD Y CAPAS

**DETECT:**
1. Verificar estructura: `domain/`, `application/`, `infrastructure/` existen.
2. Domain purity:
```bash
grep -rn "from.*infrastructure\|from.*app/" src/modules/<modulo>/domain/ --include="*.ts"
```
3. Result Pattern: commands/handlers no usan `throw` para lógica de negocio.
4. Verificar que DTOs/Interfaces existen para cada Command y Query.

**FIX:**
1. Si falta un directorio → crearlo con archivo `.gitkeep`.
2. Si hay import cross-layer → refactorizar con Facade o SharedKernel.
3. Si faltan DTOs → crear interfaces TypeScript con los campos necesarios.

**VERIFY:**
Re-ejecutar búsquedas. Dominio puro. Capas intactas.

---

### 🔨 BLOQUE 13: COMPILACIÓN TS + LINTER (Cero Errores Absolutos)

**Fase A — TypeScript:**
```bash
npx tsc --noEmit
```
1. Si falla: leer errores, corregir archivos, re-ejecutar.
2. Iterar hasta Exit Code 0. NO se permite `@ts-ignore`.

**Fase B — ESLint:**
```bash
npx eslint src/app/<modulo> --ext .ts,.tsx
```
1. Si hay errores: corregir cada archivo.
2. Iterar hasta `0 problems (0 errors, 0 warnings)`.

**Reglas inquebrantables:**
- ❌ `any` → Usar tipos específicos o `unknown`.
- ❌ `no-unused-vars` → Extirpar.
- ❌ `@ts-ignore` → Resolver el error real.
- ❌ `eslint-disable` sin justificación documentada en comentario.

---

### 🖥️📱 BLOQUE 14: VALIDACIÓN VISUAL + SCORING + AUTO-APRENDIZAJE

**12A — Validación Visual (si hay servidor):**
- Desktop `1440x900`: navegar, click en cada tab, screenshot.
- Mobile `375x812`: navegar ruta `/movil`, tap en Nav Bar, screenshot.
- Verificar: no texto cortado, no `[Object object]`, no pantallas blancas, no overflow.

**14B — QC Score:**

| Bloque | Peso |
|--------|------|
| B1: Memoria RAG | 3% |
| B2: UX Desktop | 8% |
| B3: UX Mobile | 8% |
| B4: **Diseño Neuromórfico** | **8%** |
| B5: **Experiencia Operativa** | **9%** |
| B6: Botones/Acciones | 7% |
| B7: Conexiones | 6% |
| B8: Estados UI | 6% |
| B9: Seguridad | 8% |
| B10: Performance | 6% |
| B11: Accesibilidad | 5% |
| B12: Arquitectura | 6% |
| B13: TS + Lint | 12% |
| B14: Visual + Score | 8% |

- **95-100%**: 🏆 SUPREME TIER 0
- **85-94%**: ✅ CERTIFIED ENTERPRISE
- **70-84%**: 🟡 NEEDS WORK
- **<70%**: 🔴 FAILED

**14C — Auto-Aprendizaje (OBLIGATORIO):**
1. Reflexión: ¿Qué error nuevo encontré? ¿Qué patrón se repitió? ¿La experiencia operativa fue fluida?
2. **Escribir** nueva lección en `qc_knowledge.md` con formato estándar:
```markdown
### [NNN] Título
**Módulo origen:** <nombre>
**Fecha:** <YYYY-MM-DD>
**Situación:** <qué pasó>
**Lección (Qué revisar):** <qué buscar>
**Auto-Fix aplicado:** <qué corrección se hizo automáticamente>
**Severidad:** 🔴|🟠|🟡|🟢
**🔁 Recurrencia:** 1
```
3. Si lección existente se repitió: incrementar `🔁 Recurrencia`.
4. Actualizar estadísticas globales de `qc_knowledge.md`.
5. Registrar también lecciones de UX/Experiencia Operativa (no solo bugs técnicos).

---

## 📋 REPORTE FINAL

Generar `auditoria_calidad_<modulo>.md` con:
1. Tabla de bloques (✅/❌ + correcciones aplicadas).
2. Score numérico y certificación.
3. Total de auto-fixes aplicados.
4. Screenshots Desktop + Mobile.
5. Lecciones nuevas registradas.
6. Veredicto: 🏆 / ✅ / 🟡 / 🔴

---

## 🏁 REGLAS FINALES

> **No reportar — ARREGLAR.**
> **No preguntar — CORREGIR.**
> **No existe Desktop sin Mobile.**
> **No existe módulo sin QC.**
> **No existe botón sin acción.**
> **No existe input sin conexión.**
> **No existe lista sin estado vacío.**
> **No existe acción sin feedback.**
> **No existe componente sin estilo Neumorphism.**
> **No existe card sin transparencia, blur, sombra y bordes suaves.**
> **No existe modal sin transparencia ni capacidad de arrastre.**
> **No existe pantalla sin jerarquía visual clara.**
> **No existe dato sin formato legible.**
> **No existe flujo que tome más de 5 pasos.**
> **No existe operación sin feedback instantáneo.**
> **Si un gerente no entiende la pantalla en 3 segundos, está mal.**
> **Si un ejecutivo en terreno necesita más de 2 taps para operar, está mal.**
> **El Skill evoluciona. Cada auditoría hace a Antigravity invencible.**
