/**
 * Módulo de Configuración - Silexar Pulse
 * Module Index
 * 
 * Punto de entrada principal del módulo de configuración.
 * Re-exporta todas las funcionalidades públicas.
 */

// Domain
export * from './domain';

// Application
export * from './application';

// Infrastructure
export * from './infrastructure';

// Presentation
export * from './presentation';

/**
 * Configuración por defecto para el módulo
 */
export const CONFIGURACION_MODULE_CONFIG = {
    name: 'configuracion',
    displayName: 'Configuración',
    description: 'Gestión centralizada de configuraciones del sistema',
    version: '1.0.0',
    permissions: {
        read: ['configuracion:read'],
        write: ['configuracion:admin'],
        admin: ['configuracion:admin'],
    },
    routes: {
        api: '/api/configuracion',
        page: '/configuracion',
    },
} as const;

export type ConfiguracionModuleConfig = typeof CONFIGURACION_MODULE_CONFIG;
