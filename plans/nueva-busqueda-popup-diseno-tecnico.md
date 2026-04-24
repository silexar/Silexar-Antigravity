# Diseño Técnico: Ventana Emergenté de Nueva Búsqueda - Registro de Emisión

## 1. Visión General

**Objetivo:** Crear una ventana emergente (popup) que permita al usuario realizar una nueva búsqueda de registro de emisión con un flujo paso a paso intuitivo. La ventana será movible y redimensionable, permitiendo al usuario consultar información de fondo mientras trabaja.

**Endpoints relacionados:**
- `/registro-emision/nueva-busqueda` - Página principal del popup

---

## 2. Arquitectura del Popup

### 2.1 Apertura del Popup

```typescript
// En src/app/registro-emision/page.tsx
const abrirNuevaBusqueda = () => {
  window.open(
    '/registro-emision/nueva-busqueda',
    'NuevaBusqueda',
    'width=900,height=700,left=100,top=100,resizable=yes,scrollbars=yes'
  );
};
```

### 2.2 Características de la Ventana
- **Dimensiones iniciales:** 900x700px
- **Posicionable:** Puede moverse a cualquier parte de la pantalla
- **Redimensionable:** El usuario puede cambiar el tamaño
- **Scrollbars:** Habilitados para contenido largo
- **Comunicación con padre:** Via `postMessage` para notificar resultados

### 2.3 Estructura de Archivos
```
src/app/registro-emision/nueva-busqueda/
├── page.tsx                    # Página principal del popup
├── _components/
│   ├── StepAnunciante.tsx       # Step 1: Autocomplete anunciante
│   ├── StepContrato.tsx         # Step 2: Selector contrato
│   ├── StepCampana.tsx          # Step 3: Selector campaña
│   ├── StepRadio.tsx            # Step 4: Filtro radio (opcional)
│   ├── StepFecha.tsx             # Step 5: Selector fecha
│   ├── StepSPX.tsx              # Step 6: Multi-select SPX
│   ├── StepResultados.tsx        # Step 7: Resultados y player
│   └── StepExportar.tsx         # Step 8: Opciones de exportación
├── _hooks/
│   ├── useBusquedaFlow.ts       # Estado y lógica del flujo
│   └── useAnuncianteSearch.ts   # Búsqueda con debounce
├── _types/
│   └── index.ts                 # Tipos del flujo
└── _services/
    └── index.ts                 # Llamadas API
```

---

## 3. Flujo de Datos (Step by Step)

### Step 1: Seleccionar Anunciante
**Componente:** `StepAnunciante`
**Funcionalidad:**
- Input con autocomplete mientras el usuario escribe
- Debounce de 300ms para evitar múltiples llamadas
- Busca en `/api/anunciantes` con filtro de búsqueda
- Muestra máximo 10 resultados
- Al seleccionar, pasa al Step 2

**API:**
```
GET /api/anunciantes?search={query}&limit=10
Response: { data: [{ id, nombreRazonSocial, rut }] }
```

### Step 2: Seleccionar Contrato (Año en Curso)
**Componente:** `StepContrato`
**Funcionalidad:**
- Muestra contratos activos del anunciante para el año en curso
- Filtrado por `fechaInicio` >= `01-01-{year}` AND `fechaFin` <= `31-12-{year}`
- Lista contratos con número, cliente, y estado
- Al seleccionar, pasa al Step 3

**API:**
```
GET /api/contratos?anuncianteId={id}&año={year}&estado=activo
Response: { data: [{ id, numero, titulo, estado, valor }] }
```

### Step 3: Seleccionar Campaña
**Componente:** `StepCampana`
**Funcionalidad:**
- Muestra campañas del contrato seleccionado
- Lista con nombre, fechas, tipo, y cantidad de SPX
- Al seleccionar, pasa al Step 4 (o Step 5 si no hay radio)

**API:**
```
GET /api/campanas?contratoId={id}
Response: { data: [{ id, nombre, fechaInicio, fechaFin, tipo, spxCount }] }
```

### Step 4: Filtrar por Radio (Opcional)
**Componente:** `StepRadio`
**Funcionalidad:**
- Muestraemisoras disponibles para la campaña
- Checkboxes para seleccionar una o más emisoras
- Botón "Siguiente sin filtrar" para saltar este paso
- Al seleccionar, pasa al Step 5

**API:**
```
GET /api/emisoras?campanaId={id}
Response: { data: [{ id, nombre, frecuencia }] }
```

### Step 5: Seleccionar Fecha
**Componente:** `StepFecha`
**Funcionalidad:**
- **Lógica de fecha:**
  - Si es mes en curso: solo selector de día (1-31)
  - Si es fecha pasada: calendario completo o input de fecha manual
- Input para hora específica (HH:MM)
- El sistema ajustará automáticamente ±10 minutos

**Ejemplo:**
```
Usuario busca SPX a las 17:59
Sistema busca desde 17:49 hasta 18:09
```

### Step 6: Seleccionar SPX
**Componente:** `StepSPX`
**Funcionalidad:**
- Lista todos los SPX disponibles para la fecha seleccionada
- Checkbox para seleccionar múltiples SPX
- Información: código, hora, duracion, tipo (audio/mencion)
- Botón "Ejecutar Búsqueda"

**API:**
```
GET /api/registro-emision/buscar/spx?campanaId={id}&fecha={fecha}
Response: { data: [{ id, codigo, hora, duracion, tipo, emisora }] }
```

---

## 4. Step 7: Resultados y Reproducción

### StepResultados
**Funcionalidades:**
- Waveform visualizer para reproducir el audio
- Controles: play/pause, skip ±5s, zoom
- Selector de región para generar clip
- Indicador de "tipo de material" (audio pregrabado vs mención en vivo)

### Detección de Tipo de Material
```typescript
const detectarTipoMaterial = (spx: SPX): 'audio_pregrabado' | 'mencion_vivo' => {
  // Las menciones típicamente tienen duracion < 20 segundos
  // Audio pregrabado usualmente > 25 segundos
  if (spx.duracion <= 20) return 'mencion_vivo';
  return 'audio_pregrabado';
};
```

### Lógica de Búsqueda en Registro
```typescript
const ejecutarBusqueda = async (spx: SPX, fecha: Date, hora: string) => {
  // Parsear hora y calcular rango ±10 min
  const [horaStr, minutoStr] = hora.split(':');
  const horaBase = parseInt(horaStr);
  const minutoBase = parseInt(minutoStr);
  
  const horaInicio = `${String(horaBase).padStart(2,'0')}:${String(Math.max(0, minutoBase - 10)).padStart(2,'0')}:00`;
  const horaFin = `${String(horaBase).padStart(2,'0')}:${String(Math.min(59, minutoBase + 10)).padStart(2,'0')}:00`;

  // Llamar API de búsqueda con rango horario
  const resultado = await buscarEnRegistro({
    campanhaId: spx.campanaId,
    fecha,
    horaInicio,
    horaFin,
    tipo: detectarTipoMaterial(spx)
  });

  return resultado;
};
```

---

## 5. Step 8: Exportación y Links

### Opciones de Exportación
1. **Guardar en el sistema** - Agrega a la cesta de evidencia
2. **Enviar por email** - Formulario con email del cliente
3. **Generar Link con Código Único** - Link temporal con autenticación

### SecureLink
```typescript
interface SecureLink {
  id: string;              // UUID único
  codigo: string;         // Código de 6 caracteres alfanumérico
  url: string;             // URL completa
  expiresAt: Date;         // Fecha de expiración
  maxAccessCount: number;  // Veces que puede ser accedido (0 = ilimitado)
  requireCode: boolean;    // Si requiere código adicional
  estado: 'activo' | 'usado' | 'expirado' | 'revocado';
}
```

### Flujo de Creación de Link
```typescript
const generarSecureLink = async (materialId: string, opciones: SecureLinkOptions) => {
  const response = await fetch('/api/registro-emision/secure-link', {
    method: 'POST',
    body: JSON.stringify({
      materialId,
      ...opciones
    })
  });
  
  const { data } = await response.json();
  return data; // { url, codigo, expiresAt }
};
```

### Página Pública del Link
`/registro-emision/escuchar/[codigo]`
- Página pública (no requiere auth)
- Pide código de acceso si `requireCode: true`
- Player de audio inline
- Opción de descargar

---

## 6. Historial de Búsquedas

### Estructura de Datos
```typescript
interface HistorialBusqueda {
  id: string;
  anunciante: string;
  anuncianteId: string;
  contrato: string;
  contratoId: string;
  campana: string;
  campanaId: string;
  fecha: string;           // DD/MM/YYYY
  hora: string;            // HH:MM
  spxCodes: string[];      // Array de códigos SPX buscados
  resultado: 'encontrado' | 'no_encontrado' | 'pendiente';
  fechaBusqueda: Date;     // Cuándo se hizo la búsqueda
  usuarioId: string;
}
```

### Almacenamiento
- **Frontend:** localStorage con key `registro-emision-historial`
- **Backend (futuro):** Tabla `historial_busquedas` en PostgreSQL
- **Límite:** Máximo 50 registros por usuario (FIFO)

### Mostrar Historial
- Panel inferior en la página principal de Registro de Emisión
- Expandible/colapsable
- Cada entrada muestra: anunciante, fecha, resultado (iconos)
- Click para "repetir búsqueda" con los mismos parámetros

---

## 7. Modelo de Datos (Drizzle Schema)

### Tabla: `historial_busquedas`
```typescript
export const historialBusquedas = pgTable('historial_busquedas', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  usuarioId: uuid('usuario_id').notNull(),
  
  anuncianteId: uuid('anunciante_id'),
  anuncianteNombre: varchar('anunciante_nombre', 255),
  contratoId: uuid('contrato_id'),
  contratoNumero: varchar('contrato_numero', 50),
  campanaId: uuid('campana_id'),
  campanaNombre: varchar('campana_nombre', 255),
  
  fechaBusqueda: date('fecha_busqueda').notNull(),
  horaBusqueda: varchar('hora_busqueda', 5),  // HH:MM
  
  spxCodes: jsonb('spx_codes').default([]),  // Array de strings
  
  resultado: varchar('resultado', 20).default('pendiente'),  // encontrado | no_encontrado | pendiente
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### Tabla: `secure_links` (ya existe)
```typescript
export const secureLinks = pgTable('secure_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  codigo: varchar('codigo', 6).notNull().unique(),
  materialId: uuid('material_id').notNull(),
  // ... otros campos
});
```

---

## 8. Componentes UI - Diseño Detallado

### 8.1 Autocomplete de Anunciante
```typescript
// Características:
// - Input con icono de búsqueda
// - Dropdown con resultados mientras escribe
// - Resalta texto coincidente
// - Navegación con flechas + Enter
// - Click para seleccionar
```

### 8.2 Selector de Contrato
```typescript
// Características:
// - Lista de cards con información del contrato
// - Badge de estado (activo/pendiente)
// - Año del contrato visible
```

### 8.3 Calendario de Fecha
```typescript
// Características:
// - Si es mes en curso: grid simple de días
// - Si es pasado: calendario completo
// - Input manual también disponible
// - Validación de fines de semana opcional
```

### 8.4 Multi-Select de SPX
```typescript
// Características:
// - Lista con checkboxes
// - Select all / Deselect all
// - Filtro por hora
// - Info de duracion y tipo
```

### 8.5 Waveform Player
```typescript
// Características:
// - Visualización de forma de onda
// - Play/pause con espacio
// - Skip ±5s con flechas
// - Zoom in/out
// - Selección de región para clip
```

---

## 9. Estados de Error

| Escenario | Mensaje | Acción |
|-----------|---------|--------|
| API de anunciantes falla | "No se pudo cargar anunciantes. Reintentar?" | Retry button |
| Sin contratos para ese año | "No hay contratos activos para {año}" | Mostrar historial |
| Sin campañas en contrato | "Este contrato no tiene campañas" | Volver a contratos |
| SPX no encontrado en fecha | "No se encontraron registros para esa fecha/hora" | Ajustar rango |
| Error en búsqueda de registro | "Error en el sistema. Contactar soporte" | Log + retry |
| Link no válido/expirado | "Este link ha expirado o no existe" | Página pública |

---

## 10. Implementación en Fases

### Fase 1: Estructura Base
- [ ] Crear página `/registro-emision/nueva-busqueda/page.tsx`
- [ ] Implementar popup con window.open
- [ ] Crear layout básico con steps

### Fase 2: Flujo de Selección
- [ ] Step 1: Autocomplete Anunciante
- [ ] Step 2: Selector Contrato
- [ ] Step 3: Selector Campaña
- [ ] Step 4: Filtro Radio
- [ ] Step 5: Selector Fecha
- [ ] Step 6: Multi-select SPX

### Fase 3: Ejecución y Resultados
- [ ] Lógica de búsqueda con rango ±10 min
- [ ] Step 7: Mostrar resultados
- [ ] Waveform player
- [ ] Detectar tipo de material

### Fase 4: Exportación
- [ ] Guardar en cesta
- [ ] Enviar por email
- [ ] Generar secure link
- [ ] Página pública de escucha

### Fase 5: Historial
- [ ] Guardar búsquedas en localStorage
- [ ] Mostrar historial en dashboard
- [ ] Funcionalidad "repetir búsqueda"

---

## 11. APIs Required

| Endpoint | Método | Descripción |
|----------|--------|------------|
| `/api/anunciantes` | GET | Buscar anunciantes con filtro |
| `/api/contratos` | GET | Listar contratos por anunciante y año |
| `/api/campanas` | GET | Listar campañas por contrato |
| `/api/emisoras` | GET | Listar emisoras por campaña |
| `/api/registro-emision/buscar/spx` | GET | Buscar SPX por fecha y campaña |
| `/api/registro-emision/buscar/registro` | POST | Buscar en registros de aire |
| `/api/registro-emision/secure-link` | POST | Crear link seguro |
| `/api/registro-emision/secure-link/[codigo]` | GET | Validar código de link |

---

## 12. Diagrama de Flujo

```mermaid
graph TD
    A[Abrir Popup] --> B[Step 1: Seleccionar Anunciante]
    B --> C[API: Buscar Anunciantes]
    C --> D{Seleccionó?}
    D -->|Sí| E[Step 2: Seleccionar Contrato]
    D -->|No| B
    E --> F[API: Contratos por Año]
    F --> G{ Seleccionó?}
    G -->|Sí| H[Step 3: Seleccionar Campaña]
    G -->|No| E
    H --> I[API: Campañas]
    I --> J{Seleccionó?}
    J -->|Sí| K[Step 4: Filtrar por Radio]
    J -->|No| H
    K --> L[Opcional: Seleccionar Emisoras]
    L --> M[Step 5: Seleccionar Fecha]
    M --> N{Fecha es mes actual?}
    N -->|Sí| O[Solo selector de día]
    N -->|No| P[Calendario completo]
    O --> Q[Step 6: Seleccionar SPX]
    P --> Q
    Q --> R[API: SPX disponibles]
    R --> S{Ejecutar?}
    S -->|Botón| T[Buscar en Registros ±10min]
    T --> U{Material encontrado?}
    U -->|Sí| V[Step 7: Reproducir]
    U -->|No| W[Mostrar "No encontrado"]
    V --> X[Step 8: Exportar]
    X --> Y[Guardar / Email / Link]
    Y --> Z[Cerrar Popup + Notificar Padre]
```

---

## 13. Secure Link - Página Pública

### `/registro-emision/escuchar/[codigo]`

**Query Params:**
- `code` - Código de acceso (si `requireCode: true`)

**Funcionalidades:**
1. **Validación Inicial:**
   - Verificar que el link existe y está activo
   - Verificar fecha de expiración
   - Verificar contador de accesos

2. **Autenticación (si requiere código):**
   - Input para código de 6 caracteres
   - Máximo 3 intentos
   - lockout de 15 minutos si falla

3. **Player de Audio:**
   - Reproducción inline
   - Descarga directa
   - Sin requerimiento de login

4. ** Datos del Material:**
   - Cliente/Anunciante
   - Campaña
   - Fecha y hora
   - Duración

---

## 14. Consideraciones de Performance

1. **Debounce en Autocomplete:** 300ms
2. **Lazy Loading de SPX:** Solo cargar al seleccionar fecha
3. **Caching de Resultados:** 5 minutos en localStorage
4. **Compresión de Waveform:** Usar Web Audio API para generar preview
5. **Streaming de Audio:** Para archivos largos, usar range requests

---

## 15. Testing Checklist

- [ ] Popup se abre en nueva ventana
- [ ] Popup es movible y redimensionable
- [ ] Autocomplete muestra sugerencias correctas
- [ ] Filtro de contratos por año funciona
- [ ] Selector de fecha distingue mes actual vs pasado
- [ ] Rango de ±10 minutos se calcula correctamente
- [ ] Waveform player reproduce audio
- [ ] Clip selection funciona
- [ ] Secure link se genera con código único
- [ ] Página pública reproduce con código válido
- [ ] Historial se guarda y muestra correctamente
- [ ] Error handling para APIs caídas
