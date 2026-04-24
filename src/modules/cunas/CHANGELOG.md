# Changelog - Módulo Cuñas

Todas las modificaciones importantes al módulo Cuñas serán documentadas en este archivo.

## [1.0.0] - 2026-04-17

### Añadido
- Estructura base del módulo siguiendo principios DDD
- Entidad principal `Cuna` con reglas de negocio completas
- Entidades secundarias: `Mencion`, `Presentacion`, `Cierre`
- Value Objects: `CunaId`, `EstadoCuna`, `Duracion`, `CalidadAudio`
- Comandos y handlers para creación y actualización de cuñas
- Servicio de integración con Cortex-Voice para generación de audio
- Servicio de exportación a sistemas de emisión (WideOrbit, Sara, Dalet)
- Componentes UI con diseño neumórfico
- Vistas principales: Dashboard y Crear Cuña
- Archivos de documentación: README, estado actual, ejemplo de integración

### Cambiado
- N/A (Versión inicial)

### Obsoleto
- N/A (Versión inicial)

### Eliminado
- N/A (Versión inicial)

### Corregido
- N/A (Versión inicial)

### Seguridad
- N/A (Versión inicial)

---

## Conceptos

- Los commits seguirán el estándar de [Conventional Commits](https://www.conventionalcommits.org/)
- Las versiones seguirán el estándar de [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
- Las versiones de API seguirán el estándar de [Calendar Versioning](https://calver.org/spec.html) en formato YYYY.N.P
  - YYYY: Año de lanzamiento
  - N: Número de release principal del año (1, 2, 3...)
  - P: Número de parche incremental (0, 1, 2...)

## Tipos de Commits

- `feat`: Una nueva característica
- `fix`: Una corrección de error
- `docs`: Cambios en la documentación
- `style`: Cambios que no afectan la lógica (espacios, puntos, comas, etc.)
- `refactor`: Cambios que no corrigen errores ni añaden características
- `perf`: Cambios que mejoran el rendimiento
- `test`: Añadir o corregir tests
- `build`: Cambios que afectan al sistema de builds
- `ci`: Cambios en ficheros de configuración CI
- `chore`: Otros cambios que no modifican src o test
- `revert`: Revertir un commit anterior

## Etiquetas

- `[added]`: Nueva característica
- `[changed]`: Cambios en funcionalidad existente
- `[deprecated]`: Característica que será removida
- `[removed]`: Característica removida
- `[fixed]`: Corrección de error
- `[security]`: Vulnerabilidad de seguridad corregida