/**
 * Módulo de Configuración - Silexar Pulse
 * Domain Layer - Domain Events
 * 
 * Eventos de dominio para el módulo de configuración.
 * Publicados cuando ocurren cambios significativos.
 */

export enum ConfiguracionEventType {
    CONFIGURACION_CREADA = 'configuracion.creada',
    CONFIGURACION_ACTUALIZADA = 'configuracion.actualizada',
    CONFIGURACION_ELIMINADA = 'configuracion.eliminada',
    CONFIGURACION_EXPORTADA = 'configuracion.exportada',
    CONFIGURACION_IMPORTADA = 'configuracion.importada',
    CONFIGURACION_VISIBILIDAD_CAMBiada = 'configuracion.visibilidad_cambiada',
    CONFIGURACION_GRUPO_CAMBIAcdo = 'configuracion.grupo_cambiado',
}

/**
 * Evento base para configuraciones
 */
export interface ConfiguracionEvent {
    tipo: ConfiguracionEventType;
    tenantId: string;
    configuracionId: string;
    clave: string;
    usuarioId: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

/**
 * Evento: Configuración creada
 */
export interface ConfiguracionCreadaEvent extends ConfiguracionEvent {
    tipo: ConfiguracionEventType.CONFIGURACION_CREADA;
    valor: unknown;
    categoria: string;
}

/**
 * Evento: Configuración actualizada
 */
export interface ConfiguracionActualizadaEvent extends ConfiguracionEvent {
    tipo: ConfiguracionEventType.CONFIGURACION_ACTUALIZADA;
    valorAnterior: unknown;
    valorNuevo: unknown;
}

/**
 * Evento: Configuración eliminada
 */
export interface ConfiguracionEliminadaEvent extends ConfiguracionEvent {
    tipo: ConfiguracionEventType.CONFIGURACION_ELIMINADA;
    valor: unknown;
}

/**
 * Evento: Configuración exportada
 */
export interface ConfiguracionExportadaEvent extends ConfiguracionEvent {
    tipo: ConfiguracionEventType.CONFIGURACION_EXPORTADA;
    cantidad: number;
    formato: 'json' | 'csv';
}

/**
 * Evento: Configuración importada
 */
export interface ConfiguracionImportadaEvent extends ConfiguracionEvent {
    tipo: ConfiguracionEventType.CONFIGURACION_IMPORTADA;
    cantidad: number;
    conflictos: number;
}

/**
 * Evento: Visibilidad cambiada
 */
export interface ConfiguracionVisibilidadCambiadaEvent extends ConfiguracionEvent {
    tipo: ConfiguracionEventType.CONFIGURACION_VISIBILIDAD_CAMBiada;
    visibleAnterior: boolean;
    visibleNuevo: boolean;
}

/**
 * Evento: Grupo cambiado
 */
export interface ConfiguracionGrupoCambiadoEvent extends ConfiguracionEvent {
    tipo: ConfiguracionEventType.CONFIGURACION_GRUPO_CAMBIAcdo;
    grupoAnterior: string;
    grupoNuevo: string;
}

/**
 * Tipo union de todos los eventos
 */
export type ConfiguracionEventPayload =
    | ConfiguracionCreadaEvent
    | ConfiguracionActualizadaEvent
    | ConfiguracionEliminadaEvent
    | ConfiguracionExportadaEvent
    | ConfiguracionImportadaEvent
    | ConfiguracionVisibilidadCambiadaEvent
    | ConfiguracionGrupoCambiadoEvent;

/**
 * Factory para crear eventos
 */
export const ConfiguracionEventFactory = {
    /**
     * Crea un evento de configuración creada
     */
    crearCreada(params: {
        tenantId: string;
        configuracionId: string;
        clave: string;
        usuarioId: string;
        valor: unknown;
        categoria: string;
    }): ConfiguracionCreadaEvent {
        return {
            tipo: ConfiguracionEventType.CONFIGURACION_CREADA,
            tenantId: params.tenantId,
            configuracionId: params.configuracionId,
            clave: params.clave,
            usuarioId: params.usuarioId,
            timestamp: new Date(),
            valor: params.valor,
            categoria: params.categoria,
        };
    },

    /**
     * Crea un evento de configuración actualizada
     */
    crearActualizada(params: {
        tenantId: string;
        configuracionId: string;
        clave: string;
        usuarioId: string;
        valorAnterior: unknown;
        valorNuevo: unknown;
    }): ConfiguracionActualizadaEvent {
        return {
            tipo: ConfiguracionEventType.CONFIGURACION_ACTUALIZADA,
            tenantId: params.tenantId,
            configuracionId: params.configuracionId,
            clave: params.clave,
            usuarioId: params.usuarioId,
            timestamp: new Date(),
            valorAnterior: params.valorAnterior,
            valorNuevo: params.valorNuevo,
        };
    },

    /**
     * Crea un evento de configuración eliminada
     */
    crearEliminada(params: {
        tenantId: string;
        configuracionId: string;
        clave: string;
        usuarioId: string;
        valor: unknown;
    }): ConfiguracionEliminadaEvent {
        return {
            tipo: ConfiguracionEventType.CONFIGURACION_ELIMINADA,
            tenantId: params.tenantId,
            configuracionId: params.configuracionId,
            clave: params.clave,
            usuarioId: params.usuarioId,
            timestamp: new Date(),
            valor: params.valor,
        };
    },

    /**
     * Crea un evento de exportación
     */
    crearExportada(params: {
        tenantId: string;
        configuracionId: string;
        clave: string;
        usuarioId: string;
        cantidad: number;
        formato: 'json' | 'csv';
    }): ConfiguracionExportadaEvent {
        return {
            tipo: ConfiguracionEventType.CONFIGURACION_EXPORTADA,
            tenantId: params.tenantId,
            configuracionId: params.configuracionId,
            clave: params.clave,
            usuarioId: params.usuarioId,
            timestamp: new Date(),
            cantidad: params.cantidad,
            formato: params.formato,
        };
    },

    /**
     * Crea un evento de importación
     */
    crearImportada(params: {
        tenantId: string;
        configuracionId: string;
        clave: string;
        usuarioId: string;
        cantidad: number;
        conflictos: number;
    }): ConfiguracionImportadaEvent {
        return {
            tipo: ConfiguracionEventType.CONFIGURACION_IMPORTADA,
            tenantId: params.tenantId,
            configuracionId: params.configuracionId,
            clave: params.clave,
            usuarioId: params.usuarioId,
            timestamp: new Date(),
            cantidad: params.cantidad,
            conflictos: params.conflictos,
        };
    },
};
