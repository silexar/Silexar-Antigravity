/**
 * Módulo de Configuración - Silexar Pulse
 * Domain Layer - Index
 * 
 * Punto de entrada para el dominio de configuración.
 * Exporta todas las entidades, value objects y tipos.
 */

// Entities
export { Configuracion, ConfiguracionGrupo, ConfiguracionFactory } from './entities';
export type { ConfiguracionProps, ConfiguracionGrupoProps } from './entities';

// Value Objects
export {
    TipoConfiguracion,
    CategoriaConfiguracion,
    TipoConfig,
    CategoriaConfig,
    ValorConfig,
    ClaveConfig,
    NivelSeguridad,
    NivelSeguridadVO,
    RegistroAuditoria,
} from './value-objects';
export type { RegistroAuditoriaProps } from './value-objects';

// Repositories
export type {
    IConfiguracionRepository,
    IAuditoriaRepository,
} from './repositories';
export {
    StubConfiguracionRepository,
    StubAuditoriaRepository,
} from './repositories';
export type { ListarOpciones, ConfiguracionFiltros, AuditoriaEstadisticas } from './repositories';

// Events
export {
    ConfiguracionEventType,
    ConfiguracionEventFactory,
} from './events';
export type {
    ConfiguracionEvent,
    ConfiguracionCreadaEvent,
    ConfiguracionActualizadaEvent,
    ConfiguracionEliminadaEvent,
    ConfiguracionExportadaEvent,
    ConfiguracionImportadaEvent,
    ConfiguracionVisibilidadCambiadaEvent,
    ConfiguracionGrupoCambiadoEvent,
    ConfiguracionEventPayload,
} from './events';
