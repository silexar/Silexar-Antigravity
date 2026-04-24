# Módulo Cuñas - Silexar Pulse

## Descripción

El módulo Cuñas es el centro neurálgico de gestión de contenido publicitario en Silexar Pulse. Funciona como el repositorio inteligente donde convergen todos los activos creativos de audio, textos de locución, presentaciones, cierres y contenido promocional que alimentan las campañas publicitarias.

## Arquitectura

El módulo sigue principios de Domain-Driven Design (DDD) con una estructura claramente definida:

```
src/modules/cunas/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   └── repositories/
├── application/
│   ├── commands/
│   ├── queries/
│   └── handlers/
├── infrastructure/
│   ├── repositories/
│   ├── mappers/
│   ├── external/
│   └── messaging/
└── presentation/
    ├── controllers/
    ├── views/
    └── ui/
```

## Características

### 1. Gestión de Activos Creativos
- **Cuñas**: Contenido de audio pregrabado
- **Menciones**: Textos para locución en vivo
- **Presentaciones**: Introducciones a programas auspiciados
- **Cierres**: Conclusiones de programas auspiciados

### 2. Validaciones de Negocio
- Control de estados con reglas de transición
- Validación de calidad de audio
- Verificación de duración y formato

### 3. Integración con IA (Cortex-Voice)
- Generación de audio desde texto
- Validación de calidad de audio
- Extracción de texto desde audio

### 4. Exportación Automática
- Integración con sistemas de emisión (WideOrbit, Sara, Dalet)
- Validación de estado antes de exportar
- Soporte para exportación de paquetes

### 5. Interfaz Neumórfica
- Diseño moderno y atractivo
- Enfoque mobile-first
- Experiencia de usuario intuitiva

## Uso

### Crear una Cuña

```typescript
import { CrearCunaCommand } from './application/commands/CrearCunaCommand';
import { CrearCunaHandler } from './application/handlers/CrearCunaHandler';

const crearCunaHandler = new CrearCunaHandler(repository);

const command = new CrearCunaCommand({
  tenantId: 'tenant-123',
  nombre: 'Promoción Verano Cliente X',
  tipo: 'spot',
  anuncianteId: 'anunciante-456',
  pathAudio: 'ruta-al-archivo-audio',
  duracionSegundos: 30,
  subidoPorId: 'usuario-789',
});

const resultado = await crearCunaHandler.execute(command);
if (resultado.isSuccess) {
  const nuevaCuna = resultado.getValue();
  console.log(`Cuña creada: ${nuevaCuna.codigo}`);
}
```

### Actualizar una Cuña

```typescript
import { ActualizarCunaCommand } from './application/commands/ActualizarCunaCommand';
import { ActualizarCunaHandler } from './application/handlers/ActualizarCunaHandler';

const actualizarCunaHandler = new ActualizarCunaHandler(repository);

const command = new ActualizarCunaCommand({
  id: 'cuna-id',
  tenantId: 'tenant-123',
  nombre: 'Nuevo nombre para la cuña',
  modificadoPorId: 'usuario-789',
});

const resultado = await actualizarCunaHandler.execute(command);
if (resultado.isSuccess) {
  const cuñaActualizada = resultado.getValue();
  console.log(`Cuña actualizada: ${cuñaActualizada.codigo}`);
}
```

## Integración con Sistemas Externos

### Cortex-Voice (Generación de Audio)
```typescript
const voiceService = new CortexVoiceService(apiUrl, apiKey);

// Procesar una mención para generar audio
await voiceService.procesarMencion(mencion);
```

### Exportación a Sistemas de Emisión
```typescript
const exportService = new EmisionExportService(wideOrbitUrl, saraUrl, daletUrl, apiKey);

// Exportar una cuña a WideOrbit
await exportService.exportarACuña(cuna, 'wideorbit');
```

## Contribución

Para contribuir al módulo Cuñas:

1. Haz fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/NuevaCaracteristica`)
3. Haz commit de tus cambios (`git commit -m 'Añadir NuevaCaracteristica'`)
4. Haz push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo los términos del archivo LICENSE en la raíz del proyecto.

## Documentación Adicional

- [Documentación del Estado Actual](./DOCUMENTACION_ESTADO_ACTUAL.md)
- [Ejemplo de Integración](./integration-example.ts)
- [Guía de API](./docs/api.md) *(pendiente)*
- [Guía de UI](./docs/ui.md) *(pendiente)*