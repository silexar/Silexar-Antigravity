## 1. Descripción General del Producto

El módulo de **Contratos** es el núcleo central del sistema de gestión publicitaria, diseñado para administrar el ciclo de vida completo de contratos de publicidad radial. Permite crear, gestionar y hacer seguimiento de contratos con anunciantes, incluyendo especificaciones detalladas de emisoras, condiciones de facturación y documentación asociada.

**Objetivo Principal:** Centralizar la gestión de contratos publicitarios con capacidad de búsqueda inteligente, generación automática de números de contrato, cálculo de descuentos y exportación a formatos PDF/Excel. El sistema integra información de módulos de anunciantes, productos, agencias y vendedores para crear un flujo de trabajo cohesivo.

**Valor de Mercado:** Optimiza el proceso de venta de espacios publicitarios radiales, reduce errores manuales en cálculos de descuentos y comisiones, y proporciona trazabilidad completa de modificaciones para cumplimiento legal y auditoría.

## 2. Funcionalidades Principales

### 2.1 Roles de Usuario

| Rol | Método de Registro | Permisos Principales |
|-----|-------------------|----------------------|
| **Vendedor** | Asignado por administrador | Crear contratos propios, editar contratos creados, ver contratos del equipo |
| **Jefe de Ventas** | Asignado por administrador | Crear/editar todos los contratos del equipo, aprobar contratos, generar reportes |
| **Administrador** | Registro manual | Control total sobre todos los contratos, configuración del sistema, gestión de usuarios |
| **Anunciante** | Invitación vía email | Ver solo contratos propios, descargar documentos, aprobar/rechazar contratos |
| **Contador** | Asignado por administrador | Ver todos los contratos, generar facturas, exportar datos financieros |

### 2.2 Módulos de Funcionalidad

El módulo de Contratos consta de las siguientes páginas principales:

1. **Página Principal de Contratos**: Tabla maestra con todos los contratos, búsqueda inteligente y acciones rápidas
2. **Formulario de Creación de Contrato**: Interfaz multi-pestaña para crear contratos con validación en tiempo real
3. **Editor de Contrato**: Modificación de contratos existentes con control de versiones
4. **Vista de Contrato**: Visualización detallada de un contrato específico
5. **Generador de Reportes**: Exportación de datos a Excel/PDF con filtros avanzados
6. **Panel de Documentos**: Gestión de archivos adjuntos y documentación relacionada

### 2.3 Detalle de Páginas y Funcionalidades

#### **Página Principal de Contratos**
| Módulo | Función Principal |
|--------|------------------|
| **Tabla de Contratos** | Mostrar todos los contratos con columnas: Número, Tipo, Estado, Anunciante, Comisión, Fechas, Valores, Vendedor |
| **Búsqueda Inteligente** | Buscar por: palabras clave, nombre anunciante, número contrato, RUT, vendedor, estado, rango de fechas |
| **Filtros Avanzados** | Filtrar por: tipo de contrato, estado, vendedor, equipo de ventas, rango de valores, fechas |
| **Acciones Rápidas** | Crear nuevo contrato, exportar seleccionados, imprimir, cambiar estado masivamente |
| **Ordenamiento** | Ordenar por cualquier columna con opción de ordenamiento múltiple |
| **Paginación** | Mostrar 25, 50, 100 o todos los registros por página |

#### **Formulario de Creación de Contrato (Multi-pestaña)**

**Pestaña "Tapa Contrato"**
| Campo | Descripción de Funcionalidad |
|-------|------------------------------|
| **Nombre Contrato** | Texto libre con validación de longitud mínima 10 caracteres |
| **Fecha Inicio/Fin** | Datepicker con validación de rango mínimo 1 día, máximo 365 días |
| **RUT Anunciante** | Input con formato chileno que autocompleta nombre y valida DV |
| **Anunciante** | Autocompleta al ingresar RUT, permite búsqueda por nombre |
| **Producto** | Selector con búsqueda, opción "Crear Producto" abre modal |
| **Agencia Publicidad** | Selector con búsqueda de agencias registradas |
| **Agencia Medios** | Selector con búsqueda de agencias de medios |
| **Vendedor** | Selector con búsqueda, filtra por equipo de ventas del usuario |
| **Equipo de Ventas** | Asignación automática según vendedor, editable por admin |
| **Dirección Envío** | Dropdown: Anunciante, Agencia Publicidad, Agencia Medios |
| **Comisión Agencia** | Input numérico 0-100%, calcula automáticamente según agencia |
| **Propiedades** | Checkboxes de propiedades configurables del sistema |
| **Valores Totales** | Campos calculados: Bruto, Neto, Saldo (se actualiza al agregar items) |

**Modal "Crear Producto"**
| Campo | Funcionalidad |
|-------|---------------|
| **Nombre Producto** | Texto libre con validación de unicidad |
| **Agencia Publicidad** | Búsqueda y selección de agencias existentes |
| **Agencia Medios** | Búsqueda y selección de agencias de medios |
| **Vendedor** | Búsqueda y selección de vendedores activos |
| **Guardar** | Valida duplicados, crea producto y lo asigna al contrato |

**Pestaña "Facturación"**
| Campo | Funcionalidad |
|-------|---------------|
| **Facturación** | Dropdown: Combinar por campaña, Cuotas |
| **Tipo Factura** | Dropdown: Facturar a posterior, Factura por adelantado, Efectivo, Transferencia, Cheque |
| **Dirección Factura** | Dropdown: Anunciante, Agencia de Medio |
| **IVA** | Input numérico, default 19% para Chile, editable para otros países |
| **Facturar Comisión** | Checkbox que habilita/deshabilita campos de comisión |
| **Plazo Pago** | Input numérico en días, se activa si tipo es "a posterior" |

**Pestaña "Observaciones"**
| Campo | Funcionalidad |
|-------|---------------|
| **Notas** | Textarea de 5000 caracteres con editor básico (negrita, itálica, listas) |
| **Instrucciones Especiales** | Campo adicional para instrucciones de producción o entrega |

**Pestaña "Especificaciones de la Emisora"**
| Campo | Funcionalidad |
|-------|---------------|
| **Tabla de Items** | Lista todos los items del contrato con columnas calculadas |
| **Agregar Registro** | Botón que abre modal para crear nuevo item |
| **Acciones por Item** | Editar, duplicar, eliminar cada línea de contrato |
| **Totales Calculados** | Suma de valores, cuñas totales, descuentos aplicados |

**Modal "Agregar Item de Emisora"**
| Campo | Funcionalidad |
|-------|---------------|
| **Emisora** | Búsqueda y selección de emisoras activas |
| **Tipo Bloque** | Dropdown que filtra paquetes disponibles |
| **Paquete** | Muestra opciones según tipo bloque seleccionado |
| **Fechas Inicio/Fin** | Rango válido dentro del período del contrato |
| **Duración** | Segundos del spot (15, 30, 45, 60) |
| **Cuñas por Día** | Cantidad de spots diarios |
| **Cuñas Bonificadas** | Spots adicionales sin costo |
| **Valor Frase** | Precio por spot (se sugiere según paquete) |
| **Importe Total** | Valor total negociado (calculado pero editable) |
| **Nota** | Observaciones específicas del item |

**Pestaña "Historial"**
| Campo | Funcionalidad |
|-------|---------------|
| **Log de Cambios** | Lista cronológica de todas las modificaciones |
| **Detalle de Modificaciones** | Campo modificado, valor anterior/nuevo, usuario, fecha/hora |
| **Filtros de Historial** | Por usuario, tipo de cambio, rango de fechas |
| **Exportar Historial** | Generar PDF del historial completo |

**Pestaña "Imprimir"**
| Campo | Funcionalidad |
|-------|---------------|
| **Vista Previa** | Muestra formato del contrato antes de imprimir |
| **Opciones de Impresión** | Seleccionar secciones a incluir/excluir |
| **Formato PDF** | Genera PDF profesional con logo y formato legal |
| **Enviar por Email** | Opción de enviar PDF directamente al anunciante |

**Pestaña "Cuñas"**
| Campo | Funcionalidad |
|-------|---------------|
| **Listado de Cuñas** | Muestra todas las cuñas asociadas al anunciante |
| **Filtros** | Por fecha, emisora, estado de aprobación |
| **Estado de Cuñas** | Indica cuáles están aprobadas, pendientes o rechazadas |
| **Acciones** | Ver detalle, aprobar, rechazar, solicitar modificación |

**Pestaña "Facturas"**
| Campo | Funcionalidad |
|-------|---------------|
| **Listado de Facturas** | Todas las facturas generadas para el contrato |
| **Estado de Facturas** | Pagada, pendiente, vencida, anulada |
| **Detalle de Factura** | Número, fecha, monto, forma de pago |
| **Acciones** | Ver PDF, enviar por email, registrar pago |

**Pestaña "Documentos"**
| Campo | Funcionalidad |
|-------|---------------|
| **Área de Drag & Drop** | Zona para arrastrar archivos del computador |
| **Tipos de Archivos** | Permite PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (máx 10MB) |
| **Organización** | Carpetas por tipo: Contratos, Ordenes de Compra, Facturas, Otros |
| **Previsualización** | Vista previa de documentos sin descargar |
| **Compartir** | Generar link de acceso temporal para externos |

**Pestaña "Cerrar"**
| Campo | Funcionalidad |
|-------|---------------|
| **Guardar y Cerrar** | Botón principal para finalizar edición |
| **Seleccionar Estado Final** | Dropdown obligatorio: Confirmado, Pendiente, No Aprobado, Rechazado |
| **Justificación de Estado** | Campo obligatorio si se selecciona "No Aprobado" o "Rechazado" |
| **Notificación** | Opción de notificar por email al anunciante sobre el estado |

## 3. Flujos de Trabajo Principales

### 3.1 Flujo de Creación de Contrato
```mermaid
graph TD
    A[Usuario Accede a Módulo Contratos] --> B{Tiene Permisos?}
    B -->|Sí| C[Click en "Crear Contrato"]
    B -->|No| D[Mostrar Mensaje de Error]
    C --> E[Completar Pestaña Tapa Contrato]
    E --> F[Validar RUT y Autocompletar Datos]
    F --> G{Producto Existe?}
    G -->|Sí| H[Seleccionar Producto]
    G -->|No| I[Abrir Modal Crear Producto]
    I --> J[Completar Datos Producto]
    J --> H
    H --> K[Completar Pestaña Facturación]
    K --> L[Agregar Items en Especificaciones Emisora]
    L --> M{Agregar Más Items?}
    M -->|Sí| N[Completar Modal Item Emisora]
    N --> L
    M -->|No| O[Revisar Observaciones]
    O --> P[Click en Guardar y Cerrar]
    P --> Q[Seleccionar Estado Final]
    Q --> R[Guardar Contrato en Base de Datos]
    R --> S[Generar Número de Contrato]
    S --> T[Mostrar Confirmación]
    T --> U[Redirigir a Vista Contrato]
```

### 3.2 Flujo de Aprobación de Contrato
```mermaid
graph TD
    A[Contrato en Estado "Nuevo"] --> B{Usuario con Permisos}
    B -->|Vendedor| C[Editar Contrato]
    B -->|Jefe Ventas| D[Revisar y Aprobar]
    B -->|Anunciante| E[Ver y Aprobar/Rechazar]
    C --> F{Validar Montos y Condiciones}
    F -->|Correcto| G[Cambiar Estado a "Pendiente"]
    F -->|Incorrecto| H[Realizar Ajustes]
    H --> C
    G --> I[Notificar a Aprobadores]
    D --> J{Revisión Completa?}
    J -->|Aprobar| K[Cambiar Estado a "Confirmado"]
    J -->|Rechazar| L[Cambiar Estado a "No Aprobado"]
    J -->|Requerir Cambios| M[Cambiar Estado a "Modificado"]
    E --> N{Decisión}
    N -->|Aprobar| O[Cambiar Estado a "Confirmado"]
    N -->|Rechazar| P[Cambiar Estado a "Rechazado"]
    K --> Q[Generar Notificación]
    L --> Q
    M --> Q
    O --> Q
    P --> Q
```

### 3.3 Flujo de Exportación a Excel/PDF
```mermaid
graph TD
    A[Usuario en Tabla Contratos] --> B[Seleccionar Contratos]
    B --> C[Click en "Exportar"]
    C --> D{Seleccionar Formato}
    D -->|Excel| E[Configurar Columnas]
    D -->|PDF| F[Seleccionar Template]
    E --> G[Aplicar Filtros]
    F --> G
    G --> H[Procesar Exportación]
    H --> I{Datos Extensos?}
    I -->|Sí| J[Procesar en Background]
    J --> K[Notificar cuando Listo]
    K --> L[Descargar Archivo]
    I -->|No| M[Generar Inmediatamente]
    M --> L
    L --> N[Abrir/Guardar Archivo]
```

## 4. Diseño de Interfaz de Usuario

### 4.1 Estilo de Diseño General

**Colores Principales:**
- **Primario**: Azul corporativo (#1E40AF) - encabezados y acciones principales
- **Secundario**: Verde éxito (#059669) - estados confirmados y aprobados
- **Advertencia**: Ámbar (#D97706) - estados pendientes y alertas
- **Error**: Rojo (#DC2626) - estados rechazados y errores
- **Neutros**: Grises para fondos y texto secundario

**Estilo de Botones:**
- **Primarios**: Rounded-md con sombra sutil, hover con transición
- **Secundarios**: Bordes con fondo transparente, hover con fondo tenue
- **Acciones Destructivas**: Rojo con confirmación modal
- **Estado**: Cambian de color según el estado del contrato

**Tipografía:**
- **Principal**: Inter para interfaces modernas y legibilidad
- **Títulos**: Bold, tamaños 2xl-4xl según jerarquía
- **Cuerpo**: Regular, tamaño base 14px, línea 1.5
- **Tablas**: Texto 13px con buen espaciado para densidad de información

**Iconografía:**
- **Estilo**: Line icons de Heroicons para consistencia
- **Categorías**: Documentos, estados, acciones, navegación
- **Estado**: Iconos de color según estado del contrato

### 4.2 Diseño por Páginas

#### **Página Principal de Contratos**
| Elemento | Estilo y Comportamiento |
|----------|------------------------|
| **Header** | Barra superior con logo, breadcrumbs, usuario actual y notificaciones |
| **Barra de Búsqueda** | Input grande prominente con icono de búsqueda, sugerencias en tiempo real |
| **Filtros** | Badges removibles que se acumulan debajo de la búsqueda |
| **Tabla** | Diseño zebra-striping, hover con fondo tenue, columnas ordenables |
| **Acciones por Fila** | Menú dropdown con iconos: Ver, Editar, Imprimir, Clonar, Eliminar |
| **Footer de Tabla** | Información de paginación, selector de filas por página, total de registros |
| **Estado de Carga** | Skeleton mientras carga datos, mensaje si no hay resultados |

#### **Formulario de Creación Multi-pestaña**
| Elemento | Estilo y Comportamiento |
|----------|------------------------|
| **Navegación Pestañas** | Indicador de progreso por pestaña, validación visual de completitud |
| **Formularios** | Labels arriba de inputs, validación inline con mensajes de error |
| **Modales** | Overlay semi-transparente, centrado, cierre con ESC o click fuera |
| **Validación** | Bordes rojos en errores, verdes en válidos, mensajes contextuales |
| **Guardado Automático** | Indicador de "Guardando..." cada 30 segundos en borradores |
| **Ayuda Contextual** | Tooltips en iconos de ayuda, enlaces a documentación |

#### **Modal de Creación de Producto**
| Elemento | Estilo y Comportamiento |
|----------|------------------------|
| **Layout** | Formulario vertical con secciones claramente separadas |
| **Búsquedas** | Combobox con búsqueda instantánea y resultados destacados |
| **Validación Duplicados** | Verificación en tiempo real al escribir nombre del producto |
| **Confirmación** | Resumen de datos antes de guardar, botón principal prominente |

#### **Tabla de Especificaciones de Emisora**
| Elemento | Estilo y Comportamiento |
|----------|------------------------|
| **Cabeceras** | Fijas al hacer scroll, con tooltips explicativos |
| **Filas** | Expandibles para ver detalles adicionales |
| **Cálculos** | Campos calculados se actualizan en tiempo real al editar |
| **Agregar Item** | Botón flotante sticky en esquina inferior derecha |
| **Totales** | Barra inferior fija con sumatorios y promedios |

### 4.3 Responsive y Accesibilidad

**Diseño Adaptativo:**
- **Desktop (1200px+)**: Tabla completa con todas las columnas, sidebar expandido
- **Tablet (768px-1199px)**: Tabla con columnas prioritarias, menú colapsado
- **Mobile (<768px)**: Cards en lugar de tabla, acciones en menú inferior

**Optimización Touch:**
- Botones mínimo 44x44px
- Espaciado entre elementos 8px mínimo
- Gestos swipe para navegación entre pestañas
- Zoom permitido en formularios

**Accesibilidad WCAG 2.1 AA:**
- Contraste mínimo 4.5:1 para texto normal, 3:1 para grande
- Navegación completa por teclado con tabulación lógica
- Screen readers con ARIA labels apropiados
- Modo de alto contraste disponible
- Animaciones pueden ser desactivadas

**Rendimiento:**
- Lazy loading de imágenes y datos
- Paginación server-side para tablas grandes
- Debounce en búsquedas (300ms)
- Virtual scrolling para listas extensas
- Cache de datos frecuentes

## 5. Consideraciones Técnicas Adicionales

### 5.1 Rendimiento
- **Virtualización**: Implementar react-window para tablas con >1000 filas
- **Debouncing**: Aplicar en búsquedas y filtros para reducir llamadas API
- **Cache**: Implementar SWR o React Query para cache inteligente de datos
- **Lazy Loading**: Cargar componentes de pestañas solo cuando sean visibles

### 5.2 Seguridad
- **Validación Cliente/Servidor**: Validar todos los inputs en ambos lados
- **Sanitización**: Limpiar todos los textos antes de mostrarlos (XSS prevention)
- **Rate Limiting**: Limitar creación de contratos por usuario/hora
- **Encriptación**: Encriptar datos sensibles en localStorage
- **CORS**: Configurar apropiadamente para prevenir acceso no autorizado

### 5.3 Testing
- **Unit Tests**: Cobertura mínima 80% para lógica de negocio
- **Integration Tests**: Flujos completos de creación y modificación
- **E2E Tests**: Cypress para flujos críticos con datos reales
- **Performance Tests**: Verificar tiempos de carga con 10k+ contratos
- **Accessibility Tests**: axe-core para verificar cumplimiento WCAG

### 5.4 Documentación de Usuario
- **Onboarding**: Tutorial interactivo para primeros usuarios
- **Ayuda Contextual**: Tooltips y enlaces a guías específicas
- **Videos Tutoriales**: Grabaciones de flujos principales
- **FAQ Dinámico**: Preguntas frecuentes según página actual
- **Chat Soporte**: Integración con sistema de tickets para ayuda inmediata

Este documento representa la fuente única de verdad para el desarrollo del módulo de Contratos, asegurando que todas las funcionalidades esenciales estén implementadas correctamente.