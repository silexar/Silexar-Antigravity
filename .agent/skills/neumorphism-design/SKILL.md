---
name: Neumorphism Design System & OS Windows TIER 0
description: Guía suprema para implementar la identidad visual Neumórfica en Silexar Pulse. Componentes táctiles, sombras exactas y sistema de ventanas flotantes estilo S.O (draggables, resizables, minimizables) para una experiencia premium y multitasking.
---

# 🎨 Neumorphism Design System & OS Windows (Tier 0 Enterprise)

Este skill define el máximo estándar visual para **Silexar Pulse Antygravity**. Toda la interfaz debe sentirse como un sistema operativo avanzado, táctil, limpio y orgánico, donde los elementos de la pantalla no son dibujos planos, sino piezas mecánicas con volumen que reaccionan a la luz y al toque del usuario.

## 📌 1. Reglas Sagradas del Neumorfismo

El Neumorfismo se basa en la extrusión (elevación) o intrusión (hundimiento) del mismo material de fondo. **Queda terminantemente prohibido el uso de fondos negros, blancos puros o transparencias de cristal (Glassmorphism) en contenedores base.**

- **Material Base (Fondo Universal)**: `#F0EDE8` (Gris cálido/arena ultra suave). TODOS los fondos de pantalla y contenedores deben llevar este color base.
- **Luz y Sombra**: El volumen se crea con una sombra oscura (`#d1d5db`) proyectada hacia abajo a la derecha, y una contra-luz blanca (`#ffffff`) proyectada hacia arriba a la izquierda.
- **Bordes Inexistentes**: No se usan bordes de 1px a menos que sean un acento ultra fino. La forma la define la luz.

---

## 🎨 2. Paleta y Tokens Tailwind Obligatorios

| Elemento | Clases Tailwind Obligatorias | Efecto / Explicación |
|----------|------------------------------|----------------------|
| **Fondo Pantalla** | `bg-[#F0EDE8] text-slate-700` | El "lienzo" base de Silexar Pulse. |
| **Card / Panel Elevado** | `bg-[#F0EDE8] rounded-2xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]` | Superficie donde vive la información (Outset Shadow). |
| **Input / Área Hundida** | `bg-[#F0EDE8] rounded-xl shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:ring-2 focus:ring-amber-500/30` | Campos de texto y áreas de drop (Inset Shadow). |
| **Botón Primario (Hundido)** | `bg-[#F0EDE8] rounded-full shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] text-indigo-600 font-bold transition-all duration-300` | Botón táctil que se hunde físicamente al presionarlo. |
| **Píldora Destaque** | `bg-indigo-50 text-indigo-600 rounded-full font-semibold shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] px-3 py-1 text-xs` | Para estados o badges. |

---

## 🪟 3. El Paradigma de Ventanas Flotantes (Multi-Tasking OS)

Silexar Pulse es una plataforma de productividad, por lo tanto, los **"Modales" tradicionales que bloquean la pantalla con un fondo negro transparente ESTÁN PROHIBIDOS.** 
Se adopta un **"Operating System Window Paradigm"**.

Si el usuario hace clic para ver un detalle (ej. Un Contrato o una Campaña), esto debe abrirse en una ventana que tenga las siguientes propiedades:

1. **Draggable (Arrastrable)**: El usuario debe poder tomar la ventana desde su barra superior (Header) y moverla por toda la pantalla para poder leer datos críticos que estén por debajo (ej. datos de un anunciante en la tabla principal).
2. **Resizable (Redimensionable)**: La ventana debe tener controles en las esquinas inferiores para ajustar su tamaño a placer del usuario.
3. **Minimizable (Dock)**: Debe poder encogerse hacia una barra de tareas o esquina inferior para guardar el estado y volver a abrirla sin perder la vista.
4. **Overlay Transparente o Inexistente**: NO hay capas oscuras que bloqueen el acceso al resto de la app (`pointer-events-none` en el overlay si existe). El usuario puede arrastrar una ventana y hacer clic en la tabla de fondo para abrir una SEGUNDA ventana.
5. **Estética Volumétrica**: La ventana flotante debe usar Neumorfismo extremo: `bg-[#F0EDE8] shadow-[12px_12px_24px_#d1d5db,-12px_-12px_24px_#ffffff] border border-white/50`.

### Boilerplate Base (Framer Motion WinOS)
```tsx
import { motion, useDragControls } from 'framer-motion';
// Se usa useDragControls para que solo arrastre desde el Header
const dragControls = useDragControls();

<motion.div
  drag
  dragControls={dragControls}
  dragListener={false} // Evita arrastre accidental
  className="absolute z-50 bg-[#F0EDE8] rounded-2xl overflow-hidden shadow-[12px_12px_24px_#d1d5db,-12px_-12px_24px_#ffffff] border-t border-l border-white/40 flex flex-col"
  style={{ width: 600, height: 400, minWidth: 300, minHeight: 200 }}
>
  {/* HEADER - Zona de arrastre */}
  <div 
    onPointerDown={(e) => dragControls.start(e)}
    className="h-12 bg-[#F0EDE8] border-b border-gray-300/30 flex justify-between items-center px-4 cursor-grab active:cursor-grabbing"
  >
    <div className="font-bold text-slate-700">Detalle Contrato</div>
    <div className="flex gap-2">
      {/* Botones estilo Apple / OS */}
      <button onClick={minimizeFn} className="w-3 h-3 rounded-full bg-amber-400 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]" />
      <button onClick={maximizeFn} className="w-3 h-3 rounded-full bg-emerald-400 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]" />
      <button onClick={closeFn} className="w-3 h-3 rounded-full bg-red-400 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]" />
    </div>
  </div>
  
  {/* BODY - Con Scroll */}
  <div className="flex-1 overflow-auto p-4 content-neumorphic">
    {/* Contenido */}
  </div>
  
  {/* RESIZER - Ángulo inferior derecho */}
  <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-transparent" />
</motion.div>
```

---

## 🖋️ 4. Tipografía y Microinteracciones

- **Tipografía**: `Inter` o `Outfit`. Títulos con gran Tracking (espaciado de letras).
- **Textos Secundarios**: Para no romper la magia del Neumorfismo, el texto nunca es negro puro. Usar `text-slate-700` o `text-gray-500`.
- **Microinteracciones**: 
  - Al abrir una ventana flotante, debe "aparecer creciendo" (Scale In) usando Framer Motion (`initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}}`).
  - Al interactuar con un Input, la sombra inset (hundida) debe iluminar ligeramente sus bordes con el color corporativo (`focus:ring-indigo-400/20`).

---

## 📋 5. Protocolo de Ejecución "Design Skill"

Cuando el programador te diga: **"Aplica el Design Skill en esta pantalla"** o **"Crea un modal siguiendo las reglas"**, DEBES ejecutar exactamente este ciclo mental:

1. **Eliminación Total:** Eliminar de la pantalla cualquier remanente de `/50`, `bg-black`, `bg-white` plano, `backdrop-blur` puro sin base sólida, o bordes duros `border-gray-200`. Transforma el canvas general a `bg-[#F0EDE8]`.
2. **Creación de Volúmenes:** Aplicar `shadow-[8px_8px...` a los contenedores primarios (Cards rectangulares).
3. **Profundidades Físicas (Inputs/Botones):** Cambiar los `<input>`, `<textarea>`, y `select` al patrón Inset (`shadow-[inset_4px...`).
4. **Conversión a Multi-Tarea:** Si había un Dialog o Modal nativo bloqueante, reconstruirlo usando un `<motion.div drag>` libre, con Toolbar arrastrable por el cliente (Botones macOS/Windows rojo, amarillo, verde), que permita interactuar por detrás.
5. **Autoevaluación Visual:** Antes de finalizar, garantizar que el usuario tiene total control de la posición de la ventana en pantalla, que no se recorta abruptamente si estipulaste *resize*, y que la ilusión 3D plastilina-arena del Neumorfismo sea impecable.
