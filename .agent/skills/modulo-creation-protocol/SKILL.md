---
name: Modulo Creation Protocol TIER 0 Autodidacta
description: Instrucciones maestras de programación y protocolo estricto para que Antigravity implemente nuevos módulos TIER 0 en Silexar Pulse. Integra diseño Neumorphism, arquitectura DDD, patrones avanzados y un motor de AUTO-APRENDIZAJE continuo.
---

# 🚀 Protocolo Supremo de Creación de Módulos (Tier 0 Enterprise Autodidacta)

Este Skill define el máximo estándar bajo el cual **yo (Antigravity)** debo procesar una solicitud para construir, auditar o expandir un módulo completo en Silexar Pulse. Mi misión es entregar software de altísima calidad (Fortune 10), garantizando escalabilidad mundial, UX inmejorable, cero deuda técnica y un ciclo de **auto-mejora continua**.

## 📌 1. Motor de Auto-Aprendizaje (Directiva Suprema)
**[REGLA DE EVOLUCIÓN CONSTANTE]**: Este skill no es estático. Mientras desarrollo, si descubro una mejor forma de estructurar código, un nuevo patrón arquitectónico más eficiente, o detecto fallas comunes que debo evitar, **DEBO AUTOMÁTICAMENTE proponer la actualización de este mismo archivo `SKILL.md`** y/o los flujos de auditoría. El objetivo es que Silexar Pulse y mis habilidades evolucionen y se vuelvan invulnerables con el tiempo, sin que el humano deba pedírmelo cada vez.

---

## 🛠️ 2. FASE DE PLANIFICACIÓN: Partición Obligatoria
**[REGLA DE ORO]**: Ninguna especificación compleja se codifica en un solo paso. Está ESTRICTAMENTE PROHIBIDO alucinar o truncar código.
1. Divido el trabajo en un `implementation_plan.md` y `task.md` por fases lógicas:
   - **Fase 1 (MVP Core):** Value Objects, Entidades Principales, Respositorios e interfaces base.
   - **Fase 2 (Casos de Uso Complejos):** Comandos (Result Pattern), Queries, Shared Kernel.
   - **Fase 3 (Eventos & Integración):** Domain Events, Mocks de IA (Cortex), Event Bus.
   - **Fase 4 (UI/UX Suprema):** Componentes visuales, Tableros, Dashboards, Mobile vs Desktop.
2. Solicito autorización al usuario paso a paso.

---

## 🏗️ 3. FASE DE ARQUITECTURA: Backend Invulnerable (DDD)

### Capa de Dominio (`/domain/`)
- Entidades ricas y estrictas. Prohibido estado anémico.
- **Validación Fuerte**: Uso exhaustivo de zod en `Factory Methods`.
- **Domain Events**: Toda mutación crítica dispara eventos internos.

### Capa de Aplicación (`/application/`)
- Mapear Commands (Mutación) y Queries (Lectura).
- **[PATRÓN OBLIGATORIO] Result Pattern**: Prohibido usar `throw` para reglas de negocio. Todas las operaciones devuelven `Result<T, AppError>`. Manejo de errores predecible al 100%.

### Capa de Infraestructura (`/infrastructure/`)
- Fachadas y repositorios. Integración limpia con la UI o APIs.
- **Shared Kernel**: Todo módulo debe proteger sus entidades de otros módulos exponiendo únicamente métodos de consulta inmutables a través de una fachada.

---

## 💎 4. FASE DE UI/UX: Identidad Neumorphism (Neumorfismo)

TODO módulo nuevo debe alinearse de manera idéntica al estándar visual de Silexar Pulse. **Queda terminantemente prohibido el diseño plano, genérico o con glassmorphism transparente de iteraciones previas.**

### 🎨 Core Tokens Obligatorios
- **Fondo Base del Sistema**: `bg-[#F0EDE8]` (Sólido y limpio).
- **Contenedores (Cards/Paneles)**: Fondos sólidos `bg-[#F0EDE8]`, sombras dobles para crear relieve de elevación exterior (`shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]`).
- **Textos**: Grises jerárquicos corporativos (`text-gray-800` para títulos principales, `text-gray-500` secundarios, `text-gray-400` para captions/placeholders).
- **Semáforo UI/UX (Soft Pastels)**:
  - Riesgo/Crítico: `bg-red-50 text-red-600` (Bordes rojos 20%).
  - Advertencias: `bg-amber-50 text-amber-600`.
  - Éxito/Aprobado: `bg-emerald-50 text-emerald-600`.
  - Destacados/Acciones: `bg-blue-50 text-blue-600` o degradados sutiles.

### 🖱️ Componentes Precisos
- **Botones**: Forma obligatoria `rounded-full` (píldoras), con sombras blancas proyectadas para dar volumen (`shadow-md shadow-white/50` o sombras de color diluidas). Interacción requerida: `hover:bg-opacity-80 active:scale-95 transition-all`.
- **Botones Grises Secundarios**: `bg-gray-100/80 text-gray-600 hover:bg-gray-200`. No bordes gruesos.
- **Inputs/Selects**: Fondos hundidos `bg-[#F0EDE8]`, sombreado inset `shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]`, bordes invisibles, texto definido.

### 🪟 Modales e Interactividad (REGLA DE PARIDAD)
1. **Desktop (Draggable Floating Glass)**: No existen los overlays bloqueantes tradicionales. Todo modal, cotizador, o panel emergente en escritorio DEBE ser arrastrable por el usuario (`onMouseDown`, `onMouseMove` React hooks actualizando Left/Top) preservando el `backdrop-blur-2xl`.
2. **Mobile (Swipeable Bottom Sheets)**: En vista de teléfonos, el layout emergente DEBE anclarse abajo (`items-end`), ocupando una parte relativa de la pantalla (ej. `85vh`), y ser arrastrable hacia abajo para ocultarse (Swipe-to- dismiss). Se debe integrar un "Drag Handle" (píldora gris).

---

## ⚡ 5. EXPERIENCIA OPERATIVA MÓVEL (MOBILE FIRST)
* Posicionamiento táctico: Siempre evaluar "¿Cómo se siente esto en un iPhone o Android?".
* Mantener la fluidez a 60fps usando delegación de animaciones a GPU cuando sea apropiado (usar `transform`, no `top`/`left` para animaciones pesadas o draggings en móvil).
* Cuidar de que todos los "botones y taps" tengan el tamaño mínimo de interacción por estándares (min 44px de alto táctil).

---

## 📋 6. Autochecklist Final TIER 0
Antes de notificar cualquier avance al usuario, realizo este examen mental y auto-ejecutable:
- [ ] ¿El diseño visual sigue el estándar **Neumorphism** exacto (sin rastros dark/slate ni transparencias glassmorphism)?
- [ ] ¿Los modales son ventanas arrastrables en Desktop y Swipeables en Mobile?
- [ ] ¿La arquitectura Backend utiliza DDD, Domain Events y Result Pattern?
- [ ] ¿TypeScript compila sin un solo error de tipo o lint?
- [ ] **¿Hay algo nuevo que aprendí haciendo esto que debería retroalimentar y escribir en la base de conocimientos o en este mismo SKILL?** Si es así, procedo a implementarlo.
