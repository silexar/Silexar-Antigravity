# 🎯 SIMULACIÓN OPERADOR 24/7 - ANÁLISIS MICRO-OPERATIVO PROFUNDO

## Contexto: Me siento frente al sistema a las 06:00 AM

Voy a simular CADA acción que necesito realizar durante un turno completo
y documentar EXACTAMENTE qué falta.

---

## 📻 ESCENARIO 1: INGRESAR NUEVA CAMPAÑA DIARIA (07:15 AM)

### FLUJO ACTUAL vs. FLUJO IDEAL

| Paso | Acción                             | EXISTE        | FALTA                       |
| ---- | ---------------------------------- | ------------- | --------------------------- |
| 1    | Abrir campaña nueva                | ✅            | -                           |
| 2    | Seleccionar anunciante             | ✅            | -                           |
| 3    | Seleccionar contrato               | ✅            | -                           |
| 4    | **VER cuñas del anunciante**       | ⚠️ Solo lista | 📋 Vista previa completa    |
| 5    | **ESCUCHAR cuña antes de asignar** | ⚠️ Basic      | 🔊 Player real con waveform |
| 6    | **Ver duración exacta**            | ✅            | -                           |
| 7    | **Ver vencimiento de cuña**        | ❌            | ⚠️ Alerta si vence pronto   |
| 8    | **Ver Copy Instructions**          | ❌            | 📋 Texto de mención visible |
| 9    | Asignar cuña a línea               | ✅            | -                           |
| 10   | **Asignar CUÑA GEMELA**            | ❌            | 👯 Sistema de cuñas gemelas |
| 11   | **Ver slots ocupados**             | ⚠️            | 📊 Mapa visual de ocupación |
| 12   | Guardar                            | ✅            | -                           |

---

## 🔧 GAPS IDENTIFICADOS - GESTIÓN DE CUÑAS

### 1. 👯 CUÑAS GEMELAS (Twin Spots) - **CRÍTICO**

**¿Qué es?** Dos cuñas que DEBEN ir juntas en el mismo bloque.

- Ejemplo: "Cuña de apertura" + "Cuña de cierre" de un programa
- Ejemplo: "Presentador dice..." + "Cuña comercial"

**Lo que falta:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 👯 CUÑAS GEMELAS                                                │
├─────────────────────────────────────────────────────────────────┤
│ Cuña Principal: BANCO CHILE - Verano 30s                       │
│ Cuña Gemela: BANCO CHILE - Cierre 10s                          │
│                                                                  │
│ Configuración:                                                   │
│ ○ Ir ANTES de la principal                                      │
│ ● Ir DESPUÉS de la principal                                    │
│ [ ] Separación máxima: [2] spots entre ellas                    │
│ [✓] Deben ir en el MISMO bloque                                │
│                                                                  │
│ [Vincular Cuñas] [Desvincular]                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. 🔊 REPRODUCTOR DE AUDIO REAL - **CRÍTICO**

**Estado actual:** Solo un mock que simula 3 segundos
**Lo que falta:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔊 REPRODUCTOR DE CUÑA                                          │
├─────────────────────────────────────────────────────────────────┤
│ BCH-VER25-001 - BANCO CHILE Verano 2025                        │
│                                                                  │
│ ▶ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ◼             │
│   0:12 ──────────────────────────────────▷─────── 0:30          │
│                                                                  │
│ [▌▌ Pausa] [⟲ -5s] [⟳ +5s] [🔊 Vol: 75%]                       │
│                                                                  │
│ ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆▅▄▃▂▁ (waveform)                       │
│                                                                  │
│ Metadata:                                                        │
│ • Formato: MP3 320kbps | Sample: 44.1kHz                        │
│ • Subido: 05/02/2025 | Por: Ana García                          │
│ • Vigencia: 01/01/2025 - 28/02/2025                             │
└─────────────────────────────────────────────────────────────────┘
```

### 3. ❌ CANCELAR/ELIMINAR CUÑA DE PROGRAMACIÓN - **CRÍTICO**

**¿Qué pasa cuando el cliente llama y dice "cancelen esa cuña"?**

**Lo que falta:**

```
┌─────────────────────────────────────────────────────────────────┐
│ ❌ CANCELAR CUÑA DE PROGRAMACIÓN                                │
├─────────────────────────────────────────────────────────────────┤
│ Cuña: BCH-VER25-001 - BANCO CHILE Verano                       │
│ Línea: Prime Matinal                                            │
│ Spots programados: 45                                           │
│                                                                  │
│ ¿Qué desea hacer?                                               │
│                                                                  │
│ ○ Cancelar TODOS los spots de esta cuña                         │
│ ○ Cancelar spots desde: [fecha] hasta: [fecha]                  │
│ ○ Cancelar spots de hoy en adelante                             │
│ ○ Cancelar spots específicos: [seleccionar en grid]             │
│                                                                  │
│ Motivo de cancelación: [________________]                       │
│ [ ] Liberar espacio para reasignar                              │
│ [ ] Mantener espacio bloqueado                                  │
│                                                                  │
│ [Cancelar Cuña] [Volver]                                        │
│                                                                  │
│ ⚠️ Esta acción quedará registrada en el historial              │
└─────────────────────────────────────────────────────────────────┘
```

### 4. 🔄 REEMPLAZAR CUÑA - **CRÍTICO**

**Caso:** "Cambien la cuña del Banco por la versión nueva"

**Lo que falta:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔄 REEMPLAZAR CUÑA                                              │
├─────────────────────────────────────────────────────────────────┤
│ Cuña actual: BCH-VER25-001 (v1)                                │
│ Spots afectados: 45                                             │
│                                                                  │
│ Reemplazar por:                                                  │
│ [▼ BCH-VER25-002 (v2) - Duración: 30s ✅ compatible           ] │
│                                                                  │
│ Aplicar a:                                                       │
│ ○ Todos los spots programados                                   │
│ ○ Solo spots futuros (desde hoy)                                │
│ ○ Rango de fechas: [inicio] - [fin]                            │
│                                                                  │
│ [Vista previa cambios] [Aplicar reemplazo]                     │
└─────────────────────────────────────────────────────────────────┘
```

### 5. ↩️ DESHACER (UNDO) - **CRÍTICO**

**Lo que falta:**

```
┌─────────────────────────────────────────────────────────────────┐
│ ↩️ HISTORIAL DE ACCIONES                                        │
├─────────────────────────────────────────────────────────────────┤
│ Últimas acciones:                                               │
│                                                                  │
│ 🕐 07:32:15  Asignó BCH-VER25-001 a Prime Matinal    [DESHACER]│
│ 🕐 07:31:42  Cambió rotación de cuñas                [DESHACER]│
│ 🕐 07:30:18  Eliminó cuña de línea Mañana            [DESHACER]│
│ 🕐 07:28:55  Agregó Línea Prime Matinal              [DESHACER]│
│ 🕐 07:25:33  Creó campaña BANCO-2025-0123            [----]     │
│                                                                  │
│ [Deshacer última acción: Ctrl+Z]                                │
└─────────────────────────────────────────────────────────────────┘
```

### 6. 🔓 LIBERAR ESPACIO - **ALTO**

**Caso:** Se cancela una cuña pero quiero que el espacio quede libre para vender

**Lo que falta:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔓 LIBERAR ESPACIO EN PARRILLA                                  │
├─────────────────────────────────────────────────────────────────┤
│ Bloque: Prime Matinal 07:00-08:00                               │
│ Espacio a liberar: 30 segundos                                  │
│                                                                  │
│ Cuña a remover: BCH-VER25-001                                   │
│                                                                  │
│ ¿Qué hacer con el espacio?                                      │
│ ● Liberar para venta (disponible)                               │
│ ○ Mantener bloqueado (reservado)                                │
│ ○ Asignar a otra cuña: [seleccionar]                           │
│                                                                  │
│ [Liberar] [Cancelar]                                            │
└─────────────────────────────────────────────────────────────────┘
```

### 7. 📋 CLONAR/DUPLICAR LÍNEA - **ALTO**

**Caso:** "Quiero la misma configuración para otra emisora"

**Lo que falta:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 📋 DUPLICAR LÍNEA                                               │
├─────────────────────────────────────────────────────────────────┤
│ Línea origen: Prime Matinal - Radio Pudahuel                    │
│                                                                  │
│ Copiar a:                                                        │
│ [✓] Radio ADN                                                   │
│ [✓] Radio Futuro                                                │
│ [ ] Oasis FM                                                    │
│                                                                  │
│ ¿Qué copiar?                                                     │
│ [✓] Cuñas asignadas                                             │
│ [✓] Horarios                                                    │
│ [✓] Cantidad de spots                                           │
│ [ ] Copy Instructions                                           │
│                                                                  │
│ [Duplicar a seleccionadas] [Cancelar]                          │
└─────────────────────────────────────────────────────────────────┘
```

### 8. 🔀 MOVER CUÑA ENTRE LÍNEAS - **ALTO**

**Lo que falta:**

- Drag & drop de cuña de una línea a otra
- Validación automática de compatibilidad (duración)
- Confirmación si hay conflictos

### 9. 📊 VISTA DE OCUPACIÓN POR BLOQUE - **ALTO**

**Lo que falta:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 📊 OCUPACIÓN DE BLOQUE: Prime Matinal 07:00-08:00              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Capacidad: 180 segundos                                         │
│ Ocupado:   145 segundos (80.5%)                                 │
│ Disponible: 35 segundos                                         │
│                                                                  │
│ ████████████████████████████░░░░░░░ 80.5%                       │
│                                                                  │
│ CUÑAS EN ESTE BLOQUE:                                           │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ 1. BCH-VER25-001  │ 30s │ BANCO CHILE    │ [▶] [✕] [↕]     ││
│ │ 2. ENT-PRO-001    │ 30s │ ENTEL          │ [▶] [✕] [↕]     ││
│ │ 3. FAL-BF-003     │ 45s │ FALABELLA      │ [▶] [✕] [↕]     ││
│ │ 4. CLR-INS-002    │ 20s │ CLARO          │ [▶] [✕] [↕]     ││
│ │ 5. PAR-NAV-001    │ 20s │ PARIS          │ [▶] [✕] [↕]     ││
│ │                                                              ││
│ │ [+ Agregar cuña al bloque] [Optimizar orden]                ││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 10. 🎚️ REORDENAR CUÑAS EN BLOQUE - **MEDIO**

**Lo que falta:**

- Drag & drop para cambiar orden
- Mover arriba/abajo
- "Enviar al inicio" / "Enviar al final"
- Respeto de reglas anti-competencia

### 11. ⏰ ALERTA DE VENCIMIENTO DE CUÑA - **MEDIO**

**Lo que falta:**

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ ALERTAS DE VENCIMIENTO                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 🔴 VENCE HOY:                                                   │
│    BCH-VER25-001 - Vigente hasta: 28/12/2024                   │
│    Spots afectados: 15 (hoy)                                    │
│    [Ver] [Reemplazar] [Extender vigencia]                      │
│                                                                  │
│ 🟠 VENCE EN 3 DÍAS:                                             │
│    ENT-PRO-001 - Vigente hasta: 31/12/2024                     │
│    Spots afectados: 45                                          │
│    [Ver] [Reemplazar]                                          │
│                                                                  │
│ 🟡 VENCE EN 7 DÍAS:                                             │
│    FAL-BF-003 - Vigente hasta: 04/01/2025                      │
└─────────────────────────────────────────────────────────────────┘
```

### 12. 📝 NOTAS POR SPOT - **MEDIO**

**Caso:** "Este spot debe ir AL INICIO del bloque, no al final"

**Lo que falta:**

- Campo de notas por spot individual
- Instrucciones especiales
- Alertas visuales cuando hay notas

---

## 📋 RESUMEN DE GAPS CRÍTICOS

| #   | Funcionalidad                 | Prioridad  | Tiempo Est. |
| --- | ----------------------------- | ---------- | ----------- |
| 1   | Cuñas Gemelas (Twin Spots)    | 🔴 CRÍTICO | 4h          |
| 2   | Reproductor de Audio Real     | 🔴 CRÍTICO | 3h          |
| 3   | Cancelar Cuña de Programación | 🔴 CRÍTICO | 3h          |
| 4   | Reemplazar Cuña               | 🔴 CRÍTICO | 3h          |
| 5   | Sistema de Undo               | 🔴 CRÍTICO | 4h          |
| 6   | Liberar Espacio               | 🟠 ALTO    | 2h          |
| 7   | Duplicar Línea                | 🟠 ALTO    | 2h          |
| 8   | Mover Cuña entre Líneas       | 🟠 ALTO    | 2h          |
| 9   | Vista Ocupación Bloque        | 🟠 ALTO    | 3h          |
| 10  | Reordenar Cuñas en Bloque     | 🟡 MEDIO   | 2h          |
| 11  | Alertas Vencimiento           | 🟡 MEDIO   | 2h          |
| 12  | Notas por Spot                | 🟡 MEDIO   | 1h          |

---

## ✅ COMPONENTES IMPLEMENTADOS (28-12-2024)

### FUNCIONALIDADES YA CREADAS

| #   | Componente             | Archivo                      | Estado      |
| --- | ---------------------- | ---------------------------- | ----------- |
| 1   | Cuñas Gemelas          | `CunasGemelasManager.tsx`    | ✅ COMPLETO |
| 2   | Reproductor Audio      | `ReproductorAudioCuna.tsx`   | ✅ COMPLETO |
| 3   | Operaciones Cuñas      | `GestorOperacionesCunas.tsx` | ✅ COMPLETO |
| 4   | Vista Ocupación        | `VistaOcupacionBloque.tsx`   | ✅ COMPLETO |
| 5   | Alertas Vencimiento    | `AlertasVencimiento.tsx`     | ✅ COMPLETO |
| 6   | Hook Atajos Teclado    | `hooks/useAtajosTeclado.ts`  | ✅ COMPLETO |
| 7   | Notas por Spot         | `NotasSpotManager.tsx`       | ✅ COMPLETO |
| 8   | Panel Bulk Operaciones | `PanelBulkOperaciones.tsx`   | ✅ COMPLETO |
| 9   | Drag & Drop Líneas     | `DragDropLineas.tsx`         | ✅ COMPLETO |
| 10  | Panel Atajos Visual    | `PanelAtajosTeclado.tsx`     | ✅ COMPLETO |
| 11  | Validador Competencia  | `ValidadorCompetencia.tsx`   | ✅ COMPLETO |
| 12  | Copiar/Extender        | `CopiarExtenderCampana.tsx`  | ✅ COMPLETO |
| 13  | Monitor Saturación     | `MonitorSaturacion.tsx`      | ✅ COMPLETO |

### TABLAS DE BASE DE DATOS AGREGADAS

| Tabla                   | Descripción                               |
| ----------------------- | ----------------------------------------- |
| `cunas_gemelas`         | Vinculación de cuñas twin spots           |
| `historial_operaciones` | Para sistema Undo/Redo                    |
| `reglas_competencia`    | Reglas anti-competencia entre anunciantes |
| `notas_spots`           | Notas e instrucciones por spot individual |

---

## 🔄 ACCIONES BULK QUE FALTAN

| Acción                         | Estado          |
| ------------------------------ | --------------- |
| Seleccionar múltiples cuñas    | ✅ IMPLEMENTADO |
| Cancelar múltiples cuñas       | ✅ IMPLEMENTADO |
| Mover múltiples cuñas          | ✅ IMPLEMENTADO |
| Reemplazar en múltiples líneas | ✅ IMPLEMENTADO |
| Duplicar a múltiples emisoras  | ✅ IMPLEMENTADO |
| Extender vigencia masiva       | ✅ IMPLEMENTADO |

---

## 🎹 ATAJOS DE TECLADO QUE FALTAN

| Atajo   | Acción             | Estado          |
| ------- | ------------------ | --------------- |
| Ctrl+Z  | Deshacer           | ✅ IMPLEMENTADO |
| Ctrl+Y  | Rehacer            | ✅ IMPLEMENTADO |
| Ctrl+D  | Duplicar línea     | ✅ IMPLEMENTADO |
| Ctrl+S  | Guardar            | ✅ IMPLEMENTADO |
| Espacio | Play/Pause cuña    | ✅ IMPLEMENTADO |
| Delete  | Eliminar selección | ✅ IMPLEMENTADO |
| Ctrl+A  | Seleccionar todo   | ✅ IMPLEMENTADO |
| Ctrl+F  | Buscar cuña        | ✅ IMPLEMENTADO |

```

```
