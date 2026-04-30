/**
 * Módulo de Configuración - Silexar Pulse
 * Application Layer - Commands
 * 
 * Commands para el módulo de configuración.
 * Cada command representa una operación que modifica el estado.
 */

import { z } from 'zod';

/**
 * Schema para crear una configuración
 */
export const CrearConfiguracionSchema = z.object({
    clave: z.string().min(1).max(255).regex(/^[A-Z][A-Z0-9_]*$/, 'Clave debe ser MAYÚSCULAS con guiones bajos'),
    valor: z.unknown(),
    tipo: z.enum(['string', 'number', 'boolean', 'json', 'password', 'email', 'url']),
    categoria: z.string().min(1).max(100),
    descripcion: z.string().max(500).optional(),
    editable: z.boolean().default(true),
    visible: z.boolean().default(true),
    nivelSeguridad: z.enum(['publico', 'interno', 'confidencial', 'critico']).default('publico'),
    grupo: z.string().max(100).optional(),
    orden: z.number().int().default(0),
});

export type CrearConfiguracionInput = z.infer<typeof CrearConfiguracionSchema>;

/**
 * Command para crear una configuración
 */
export interface CrearConfiguracionCommand {
    tenantId: string;
    usuarioId: string;
    payload: CrearConfiguracionInput;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Schema para actualizar una configuración
 */
export const ActualizarConfiguracionSchema = z.object({
    valor: z.unknown().optional(),
    descripcion: z.string().max(500).optional(),
    visible: z.boolean().optional(),
    grupo: z.string().max(100).optional(),
    orden: z.number().int().optional(),
});

export type ActualizarConfiguracionInput = z.infer<typeof ActualizarConfiguracionSchema>;

/**
 * Command para actualizar una configuración
 */
export interface ActualizarConfiguracionCommand {
    tenantId: string;
    usuarioId: string;
    configuracionId: string;
    payload: ActualizarConfiguracionInput;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Schema para eliminar configuraciones
 */
export const EliminarConfiguracionesSchema = z.object({
    ids: z.array(z.string().uuid()).min(1),
});

export type EliminarConfiguracionesInput = z.infer<typeof EliminarConfiguracionesSchema>;

/**
 * Command para eliminar configuraciones
 */
export interface EliminarConfiguracionesCommand {
    tenantId: string;
    usuarioId: string;
    payload: EliminarConfiguracionesInput;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Schema para importar configuraciones
 */
export const ImportarConfiguracionesSchema = z.object({
    configuraciones: z.array(z.object({
        clave: z.string(),
        valor: z.unknown(),
        tipo: z.string(),
        categoria: z.string(),
        descripcion: z.string().optional(),
        nivelSeguridad: z.string().optional(),
        grupo: z.string().optional(),
        orden: z.number().optional(),
    })).min(1),
    opcionConflictos: z.enum(['sobreescribir', 'omitir', 'error']).default('omitir'),
});

export type ImportarConfiguracionesInput = z.infer<typeof ImportarConfiguracionesSchema>;

/**
 * Command para importar configuraciones
 */
export interface ImportarConfiguracionesCommand {
    tenantId: string;
    usuarioId: string;
    payload: ImportarConfiguracionesInput;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Schema para exportar configuraciones
 */
export const ExportarConfiguracionesSchema = z.object({
    formato: z.enum(['json', 'csv']).default('json'),
    categorias: z.array(z.string()).optional(),
    grupos: z.array(z.string()).optional(),
    soloVisibles: z.boolean().default(true),
    incluirAuditoria: z.boolean().default(false),
});

export type ExportarConfiguracionesInput = z.infer<typeof ExportarConfiguracionesSchema>;

/**
 * Command para exportar configuraciones
 */
export interface ExportarConfiguracionesCommand {
    tenantId: string;
    usuarioId: string;
    payload: ExportarConfiguracionesInput;
}

/**
 * Schema para búsqueda de configuraciones
 */
export const BuscarConfiguracionesSchema = z.object({
    buscar: z.string().optional(),
    categoria: z.string().optional(),
    grupo: z.string().optional(),
    tipo: z.string().optional(),
    editable: z.boolean().optional(),
    visible: z.boolean().optional(),
    limite: z.number().int().min(1).max(100).default(50),
    offset: z.number().int().min(0).default(0),
    ordenarPor: z.enum(['clave', 'categoria', 'creadaEn', 'actualizadaEn']).default('clave'),
    orden: z.enum(['ASC', 'DESC']).default('ASC'),
});

export type BuscarConfiguracionesInput = z.infer<typeof BuscarConfiguracionesSchema>;

/**
 * Command para buscar configuraciones
 */
export interface BuscarConfiguracionesCommand {
    tenantId: string;
    usuarioId: string;
    payload: BuscarConfiguracionesInput;
}

/**
 * Schema para cambiar visibilidad
 */
export const CambiarVisibilidadSchema = z.object({
    visible: z.boolean(),
});

export type CambiarVisibilidadInput = z.infer<typeof CambiarVisibilidadSchema>;

/**
 * Command para cambiar visibilidad de una configuración
 */
export interface CambiarVisibilidadCommand {
    tenantId: string;
    usuarioId: string;
    configuracionId: string;
    payload: CambiarVisibilidadInput;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Command para marcar/desmarcar favorita
 */
export interface ToggleFavoritaCommand {
    tenantId: string;
    usuarioId: string;
    configuracionId: string;
}

// Exportar todos los commands
export const CONFIGURACION_COMMANDS = {
    CrearConfiguracionCommand: 'CrearConfiguracionCommand',
    ActualizarConfiguracionCommand: 'ActualizarConfiguracionCommand',
    EliminarConfiguracionesCommand: 'EliminarConfiguracionesCommand',
    ImportarConfiguracionesCommand: 'ImportarConfiguracionesCommand',
    ExportarConfiguracionesCommand: 'ExportarConfiguracionesCommand',
    BuscarConfiguracionesCommand: 'BuscarConfiguracionesCommand',
    CambiarVisibilidadCommand: 'CambiarVisibilidadCommand',
    ToggleFavoritaCommand: 'ToggleFavoritaCommand',
} as const;
