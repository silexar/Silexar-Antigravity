/**
 * Módulo de Configuración - Silexar Pulse
 * Domain Layer - Repository Interfaces
 * 
 * Interfaces de repositorio siguiendo el patrón DDD.
 * Definen el contrato entre el dominio y la infraestructura.
 */

import type { Configuracion, ConfiguracionProps } from '../entities';
import type { RegistroAuditoria, RegistroAuditoriaProps } from '../value-objects';

/**
 * Interface para el repositorio de configuraciones
 */
export interface IConfiguracionRepository {
    /**
     * Guarda una nueva configuración
     */
    guardar(configuracion: Configuracion): Promise<void>;

    /**
     * Actualiza una configuración existente
     */
    actualizar(configuracion: Configuracion): Promise<void>;

    /**
     * Elimina una configuración por ID
     */
    eliminar(id: string, tenantId: string): Promise<void>;

    /**
     * Busca una configuración por ID
     */
    buscarPorId(id: string, tenantId: string): Promise<Configuracion | null>;

    /**
     * Busca una configuración por clave
     */
    buscarPorClave(clave: string, tenantId: string): Promise<Configuracion | null>;

    /**
     * Lista todas las configuraciones de un tenant
     */
    listarTodas(tenantId: string, opciones?: ListarOpciones): Promise<Configuracion[]>;

    /**
     * Lista configuraciones por categoría
     */
    listarPorCategoria(categoria: string, tenantId: string): Promise<Configuracion[]>;

    /**
     * Lista configuraciones visibles
     */
    listarVisibles(tenantId: string): Promise<Configuracion[]>;

    /**
     * Lista configuraciones editables
     */
    listarEditables(tenantId: string): Promise<Configuracion[]>;

    /**
     * Busca configuraciones por grupo
     */
    buscarPorGrupo(grupo: string, tenantId: string): Promise<Configuracion[]>;

    /**
     * Busca configuraciones con filtros avanzados
     */
    buscarConFiltros(filtros: ConfiguracionFiltros, tenantId: string): Promise<Configuracion[]>;

    /**
     * Verifica si existe una clave en el tenant
     */
    existeClave(clave: string, tenantId: string): Promise<boolean>;

    /**
     * Cuenta configuraciones por categoría
     */
    contarPorCategoria(tenantId: string): Promise<Record<string, number>>;

    /**
     * Obtiene las categorías únicas de un tenant
     */
    obtenerCategorias(tenantId: string): Promise<string[]>;

    /**
     * Obtiene los grupos únicos de un tenant
     */
    obtenerGrupos(tenantId: string): Promise<string[]>;

    /**
     * Busca configuración por clave exacta
     */
    buscarPorClaveExacta(clave: string, tenantId: string): Promise<Configuracion | null>;
}

/**
 * Interface para el repositorio de auditoría
 */
export interface IAuditoriaRepository {
    /**
     * Registra un evento de auditoría
     */
    registrar(evento: RegistroAuditoria, tenantId: string): Promise<void>;

    /**
     * Obtiene el historial de una configuración
     */
    obtenerHistorialConfiguracion(
        configuracionId: string,
        tenantId: string,
        limite?: number
    ): Promise<RegistroAuditoria[]>;

    /**
     * Obtiene el historial de un usuario
     */
    obtenerHistorialUsuario(
        usuarioId: string,
        tenantId: string,
        limite?: number
    ): Promise<RegistroAuditoria[]>;

    /**
     * Obtiene eventos por rango de fechas
     */
    obtenerPorRangoFechas(
        tenantId: string,
        fechaInicio: Date,
        fechaFin: Date,
        limite?: number
    ): Promise<RegistroAuditoria[]>;

    /**
     * Obtiene los últimos N eventos
     */
    obtenerRecientes(tenantId: string, limite?: number): Promise<RegistroAuditoria[]>;

    /**
     * Obtiene eventos de un tipo específico
     */
    obtenerPorTipoAccion(
        accion: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ',
        tenantId: string,
        limite?: number
    ): Promise<RegistroAuditoria[]>;

    /**
     * Conta eventos por tipo
     */
    contarPorTipoAccion(tenantId: string): Promise<Record<string, number>>;

    /**
     * Obtiene estadísticas de auditoría
     */
    obtenerEstadisticas(tenantId: string): Promise<AuditoriaEstadisticas>;
}

/**
 * Opciones para listar configuraciones
 */
export interface ListarOpciones {
    limite?: number;
    offset?: number;
    ordenarPor?: 'clave' | 'categoria' | 'creadaEn' | 'actualizadaEn';
    orden?: 'ASC' | 'DESC';
}

/**
 * Filtros para búsqueda de configuraciones
 */
export interface ConfiguracionFiltros {
    clave?: string;
    categoria?: string;
    grupo?: string;
    tipo?: string;
    editable?: boolean;
    visible?: boolean;
    buscar?: string;
    limite?: number;
    offset?: number;
    ordenarPor?: 'clave' | 'categoria' | 'creadaEn' | 'actualizadaEn';
    orden?: 'ASC' | 'DESC';
}

/**
 * Estadísticas de auditoría
 */
export interface AuditoriaEstadisticas {
    totalEventos: number;
    eventosPorTipo: Record<string, number>;
    eventosPorUsuario: Record<string, number>;
    configuracionesMasModificadas: Array<{
        configuracionId: string;
        clave: string;
        cantidad: number;
    }>;
    primerEvento: Date | null;
    ultimoEvento: Date | null;
}

// Implementación por defecto (stub)
export const StubConfiguracionRepository: IConfiguracionRepository = {
    async guardar() { throw new Error('Not implemented'); },
    async actualizar() { throw new Error('Not implemented'); },
    async eliminar() { throw new Error('Not implemented'); },
    async buscarPorId() { throw new Error('Not implemented'); },
    async buscarPorClave() { throw new Error('Not implemented'); },
    async listarTodas() { throw new Error('Not implemented'); },
    async listarPorCategoria() { throw new Error('Not implemented'); },
    async listarVisibles() { throw new Error('Not implemented'); },
    async listarEditables() { throw new Error('Not implemented'); },
    async buscarPorGrupo() { throw new Error('Not implemented'); },
    async buscarConFiltros() { throw new Error('Not implemented'); },
    async existeClave() { throw new Error('Not implemented'); },
    async contarPorCategoria() { throw new Error('Not implemented'); },
    async obtenerCategorias() { throw new Error('Not implemented'); },
    async obtenerGrupos() { throw new Error('Not implemented'); },
    async buscarPorClaveExacta() { throw new Error('Not implemented'); },
};

export const StubAuditoriaRepository: IAuditoriaRepository = {
    async registrar(_evento: RegistroAuditoria, _tenantId: string) { throw new Error('Not implemented'); },
    async obtenerHistorialConfiguracion() { throw new Error('Not implemented'); },
    async obtenerHistorialUsuario() { throw new Error('Not implemented'); },
    async obtenerPorRangoFechas() { throw new Error('Not implemented'); },
    async obtenerRecientes() { throw new Error('Not implemented'); },
    async obtenerPorTipoAccion() { throw new Error('Not implemented'); },
    async contarPorTipoAccion() { throw new Error('Not implemented'); },
    async obtenerEstadisticas() { throw new Error('Not implemented'); },
};
