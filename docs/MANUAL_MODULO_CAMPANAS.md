# 📖 MANUAL DE USUARIO - MÓDULO CAMPAÑAS

> **Sistema:** Silexar Pulse Antygravity
> **Versión:** Enterprise 2050
> **Última actualización:** 2025-12-19

---

## 📑 ÍNDICE

1. [Introducción](#1-introducción)
2. [Acceso al Módulo](#2-acceso-al-módulo)
3. [Panel Principal de Campañas](#3-panel-principal-de-campañas)
4. [Crear Nueva Campaña (Wizard)](#4-crear-nueva-campaña-wizard)
5. [Funcionalidades Avanzadas](#5-funcionalidades-avanzadas)
6. [Portal Cliente](#6-portal-cliente)
7. [App Móvil](#7-app-móvil)
8. [Atajos de Teclado](#8-atajos-de-teclado)
9. [Solución de Problemas](#9-solución-de-problemas)

---

## 1. INTRODUCCIÓN

El Módulo de Campañas es el corazón del sistema Silexar Pulse. Permite gestionar el ciclo completo de campañas publicitarias desde la creación hasta la facturación.

### Roles de Usuario

| Rol                        | Acceso                                 |
| -------------------------- | -------------------------------------- |
| **Traffic Manager Senior** | Acceso completo a todas las funciones  |
| **Ejecutivo Comercial**    | Tarifas, confirmaciones, observaciones |
| **Programador**            | Programación técnica y materiales      |
| **Cliente Portal**         | Solo visualización de campañas propias |
| **Admin**                  | Acceso total + configuración           |

---

## 2. ACCESO AL MÓDULO

### Ruta de acceso

```
https://app.silexar.com/campanas
```

### Navegación

- Desde el menú lateral, selecciona "Campañas"
- El panel principal mostrará todas las campañas activas

---

## 3. PANEL PRINCIPAL DE CAMPAÑAS

### Estadísticas superiores

El dashboard muestra 4 KPIs principales:

- **Total Campañas:** Número total de campañas
- **En Programación:** Campañas siendo configuradas
- **Ejecutándose:** Campañas activas al aire
- **Valor Total:** Suma del valor de todas las campañas

### Tabla de Campañas

| Columna        | Descripción                                       |
| -------------- | ------------------------------------------------- |
| **N° Campaña** | Identificador único (CMP-YYYY-XXX)                |
| **Cliente**    | Nombre del anunciante                             |
| **Campaña**    | Nombre descriptivo                                |
| **Estado**     | Borrador, En Programación, Ejecutando, Finalizada |
| **Período**    | Fecha inicio - Fecha fin                          |
| **Valor**      | Monto neto de la campaña                          |
| **Progreso**   | Porcentaje de avance                              |
| **Acciones**   | Botones de acción rápida                          |

### Filtros disponibles

- Por estado
- Por cliente
- Por fecha
- Por ejecutivo
- Búsqueda por texto

### Acciones rápidas

- ✏️ **Editar:** Abre el wizard de edición
- 👁️ **Ver:** Vista detallada solo lectura
- 📋 **Clonar:** Duplica la campaña
- 📧 **Confirmación:** Genera confirmación horaria
- 🗑️ **Eliminar:** Elimina la campaña (requiere confirmación)

---

## 4. CREAR NUEVA CAMPAÑA (WIZARD)

### Acceso

Clic en botón **"+ Nueva Campaña"** en la esquina superior derecha.

### Barra de estado de guardado

En la parte superior del wizard verás:

- 🟢 **Guardado:** Cambios guardados automáticamente
- 🟡 **Cambios pendientes:** Hay cambios sin guardar
- Botón **Guardar:** Guarda manualmente
- Botón **Limpiar:** Elimina el borrador

⚠️ **Nota:** El sistema guarda automáticamente cada 30 segundos y al cambiar de paso.

---

### PASO 1: ORIGEN

**Objetivo:** Seleccionar cómo se creará la campaña.

#### Opciones disponibles:

| Opción                     | Descripción                             | Recomendación  |
| -------------------------- | --------------------------------------- | -------------- |
| **Desde Contrato**         | Carga datos desde un contrato existente | ⭐ Recomendado |
| **Desde Orden de Agencia** | Sube un PDF/Excel y la IA extrae datos  | 🤖 Con OCR     |
| **Nueva (Manual)**         | Ingreso manual de todos los datos       | Básico         |
| **Clonar Existente**       | Usa otra campaña como plantilla         | Rápido         |

#### Desde Contrato (Búsqueda inteligente)

1. Selecciona "Desde Contrato Existente"
2. En el buscador, ingresa: cliente, N° contrato o nombre campaña
3. El sistema mostrará contratos que coincidan
4. Los contratos muestran estado: 🟢 Vigente, 🟡 Por vencer, 🔴 Vencido
5. Clic en el contrato deseado para seleccionarlo

#### Desde Orden de Agencia (OCR)

1. Selecciona "Desde Orden de Agencia"
2. Arrastra o selecciona el archivo PDF/Excel
3. La IA extraerá automáticamente:
   - Cliente
   - Tipo de pauta
   - Fechas
   - Líneas de programación
4. Revisa y confirma los datos extraídos

---

### PASO 2: TAPA (Datos Generales)

**Objetivo:** Ingresar información comercial de la campaña.

#### Campos principales:

| Campo                  | Descripción                 | Requerido |
| ---------------------- | --------------------------- | --------- |
| **Nombre Campaña**     | Nombre descriptivo          | ✅ Sí     |
| **Referencia Cliente** | Código interno del cliente  | No        |
| **Orden Agencia**      | N° orden de la agencia      | No        |
| **Orden Compra**       | N° OC para facturación      | No        |
| **HES**                | Hoja Entrada Servicio (SAP) | No        |
| **Fecha Inicio**       | Inicio de emisión           | ✅ Sí     |
| **Fecha Fin**          | Término de emisión          | ✅ Sí     |

#### Información comercial:

| Campo                 | Descripción                  |
| --------------------- | ---------------------------- |
| **Anunciante**        | Empresa que contrata         |
| **Producto**          | Producto/servicio anunciado  |
| **Agencia Creativa**  | Agencia que creó el material |
| **Agencia Medios**    | Central de medios            |
| **Ejecutivo**         | Vendedor responsable         |
| **Emisora Principal** | Radio principal de emisión   |

#### Panel de Propiedades (derecha)

Configura:

- **Tipo Pedido:** Normal, Auspicio, Canje
- **Tipo Pauta:** Prime, Rotativo, Programa específico
- **Categoría:** Automotriz, Financiero, Retail, etc.

---

### PASO 3: TARIFAS

**Objetivo:** Configurar el modelo financiero.

#### Modalidad de venta:

| Modalidad            | Descripción                |
| -------------------- | -------------------------- |
| **Paquete Acordado** | Valor fijo total           |
| **Tarifa Unitaria**  | Precio por spot individual |

#### Valor bruto

Ingresa el valor total de la campaña antes de descuentos.

#### Descuentos aplicables

Switch para activar/desactivar:

- ✅ Descuento Agencia (ej: 5%)
- ✅ Descuento Volumen (ej: 3%)
- ✅ Pronto Pago (ej: 2%)

#### Tabla de Descuentos Avanzada

Para agregar descuentos personalizados:

1. Clic en "+ Agregar Descuento"
2. Ingresa nombre, tipo y porcentaje
3. El sistema calcula automáticamente el monto

#### Comisión Agencia

Slider para ajustar comisión (0-30%)

#### Resumen Financiero

Panel derecho muestra en tiempo real:

- Valor Bruto
- (-) Descuentos
- = Subtotal
- (-) Comisión
- = **Valor Neto Final**

---

### PASO 4: FACTURACIÓN

**Objetivo:** Configurar cómo se facturará la campaña.

#### Estilo de Facturación

| Opción          | Descripción               |
| --------------- | ------------------------- |
| **Posterior**   | Factura después de emitir |
| **Inmediata**   | Factura al confirmar      |
| **Intercambio** | Sin factura (canje)       |

#### Facturación Por

| Opción        | Descripción          |
| ------------- | -------------------- |
| **Mensual**   | Una factura por mes  |
| **Global**    | Una factura al final |
| **Por Línea** | Factura cada línea   |

#### Días de Pago

Selecciona: 15, 30, 45, 60, 90 días

#### Dirección de Facturación

- Al Anunciante
- A la Agencia
- Otra dirección

#### Tabla de Facturas

Muestra las facturas generadas con:

- N° Factura
- Fecha
- Monto
- Estado (Pendiente, Emitida, Pagada)
- Acciones

---

### PASO 5: LÍNEAS

**Objetivo:** Definir las líneas de programación.

#### Agregar línea

Clic en "+ Agregar Línea"

#### Campos por línea:

| Campo               | Descripción                       |
| ------------------- | --------------------------------- |
| **Programa**        | Nombre del programa               |
| **Hora Inicio**     | Hora de inicio del bloque         |
| **Hora Fin**        | Hora de fin del bloque            |
| **Días**            | LUN, MAR, MIÉ, JUE, VIE, SÁB, DOM |
| **Cantidad Diaria** | Spots por día                     |
| **Duración**        | Segundos del spot                 |
| **Valor Unitario**  | Precio por spot                   |

#### Cálculos automáticos

El sistema calcula:

- Total spots por línea
- Valor total por línea
- Total de campaña

#### Acciones por línea

- ✏️ Editar
- 📋 Duplicar
- 🗑️ Eliminar

---

### PASO 6: PROGRAMACIÓN

**Objetivo:** Ejecutar la planificación inteligente de spots.

#### Motor de Planificación IA

1. Revisa el checklist de validaciones
2. Clic en **"🤖 Ejecutar Planificación IA"**
3. El sistema asignará automáticamente los spots

#### Validaciones previas:

- ✅ Verificación duplicados
- ✅ Coherencia de posición
- ✅ Límites de tiempo
- ✅ Conflictos de categoría

#### Panel de resultados:

- Líneas planificadas vs totales
- Cuñas rechazadas
- Conflictos detectados/resueltos

#### Mapa de Calor de Saturación

Visualiza la ocupación de cada bloque horario:

- 🟢 Verde: Disponible
- 🟡 Amarillo: Medio lleno
- 🔴 Rojo: Saturado

#### Predicción de Conflictos

El sistema detecta:

- 🔴 Competencia directa
- 🟠 Saturación de bloque
- 🟡 Exclusividad de categoría

---

### PASO 7: REVISIÓN FINAL

**Objetivo:** Revisar y confirmar la campaña.

#### Checklist de validación:

- ✅ Datos cliente completos
- ✅ Fechas válidas
- ✅ Tarifas configuradas
- ✅ Líneas definidas
- ✅ Programación ejecutada
- ✅ Sin conflictos pendientes

#### Preview de campaña:

- Resumen general
- Detalle financiero
- Líneas programadas
- Materiales asignados

#### Acciones finales:

- 💾 **Guardar como Borrador**
- ✅ **Confirmar Campaña**

#### Atajos de teclado:

- `Ctrl + Enter` = Confirmar campaña
- `Esc` = Cerrar modal

---

## 5. FUNCIONALIDADES AVANZADAS

### Gestión de Cuñas Rechazadas

Acceso: `/campanas/rechazadas`

Permite:

- Ver cuñas que no pudieron programarse
- Re-asignar manualmente
- Re-asignar con IA
- Ver mapa de bloques disponibles

### Observaciones y Colaboración

Acceso: `/campanas/observaciones`

Permite:

- Agregar notas por paso del wizard
- Mencionar usuarios (@usuario)
- Marcar como alerta
- Ver historial de observaciones

### Historial de Cambios

Acceso: `/campanas/historial`

Muestra:

- Timeline de todos los cambios
- Usuario que realizó cada cambio
- Datos anteriores vs nuevos
- Opción de rollback (restaurar versión anterior)

### Generador de Confirmaciones

Permite:

- Seleccionar período
- Elegir template
- Agregar destinatarios
- Preview del documento
- Enviar por email o descargar PDF

---

## 6. PORTAL CLIENTE

### Acceso

```
https://app.silexar.com/portal-cliente
```

### Funcionalidades:

- Ver campañas propias
- Estado de programación
- Descargar confirmaciones horarias
- Ver notificaciones
- Contactar ejecutivo asignado

---

## 7. APP MÓVIL

### Instalación PWA

1. Abre la aplicación en Chrome/Safari móvil
2. Toca "Agregar a pantalla de inicio"
3. La app se instalará como aplicación nativa

### Funcionalidades móviles:

- 🏠 **Home:** Dashboard con KPIs
- 🎯 **Campañas:** Lista de campañas
- 📊 **Stats:** Estadísticas
- 💬 **Chat:** Mensajes
- ⚙️ **Config:** Configuración

### Acciones rápidas:

- Ver campañas activas
- Estado de programación
- Alertas y conflictos
- Generar confirmación
- Sincronizar datos

---

## 8. ATAJOS DE TECLADO

| Atajo          | Acción          |
| -------------- | --------------- |
| `Ctrl + N`     | Nueva campaña   |
| `Ctrl + S`     | Guardar         |
| `Ctrl + Enter` | Confirmar       |
| `Esc`          | Cerrar modal    |
| `Tab`          | Siguiente campo |
| `Shift + Tab`  | Campo anterior  |

---

## 9. SOLUCIÓN DE PROBLEMAS

### "No se guardaron los cambios"

- Verifica tu conexión a internet
- Clic en "Guardar" manualmente
- Los cambios se guardan en localStorage temporalmente

### "Conflicto no resuelto"

- Revisa el panel de Predicción de Conflictos
- Acepta una de las sugerencias de la IA
- O reubica manualmente el spot

### "Cuña rechazada"

- Accede a Gestión de Cuñas Rechazadas
- Usa "Re-asignar con IA" para encontrar un bloque disponible

### "No puedo editar la campaña"

- Verifica que tengas permisos de edición
- Las campañas "Ejecutando" tienen edición limitada
- Contacta al administrador si necesitas acceso

---

## 📞 SOPORTE

Para asistencia técnica:

- Email: soporte@silexar.com
- Teléfono: +56 2 XXXX XXXX
- Horario: Lunes a Viernes 9:00 - 18:00

---

_© 2025 Silexar Pulse Antygravity - Todos los derechos reservados_
