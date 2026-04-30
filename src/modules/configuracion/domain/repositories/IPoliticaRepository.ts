/**
 * 📁 SILEXAR PULSE - Repositorio de Políticas de Negocio
 * 
 * @description Interfaz del repositorio para Políticas de Negocio
 * Implementa el patrón Repository del DDD
 */

import { PoliticaNegocio, PoliticaNegocioProps } from '../entities/PoliticaNegocio';

export interface IPoliticaRepository {
    /**
     * Busca una política por su ID
     */
    findById(id: string): Promise<PoliticaNegocio | null>;

    /**
     * Busca todas las políticas de un tenant
     */
    findByTenant(tenantId: string): Promise<PoliticaNegocio[]>;

    /**
     * Busca políticas activas de un tenant
     */
    findActivas(tenantId: string): Promise<PoliticaNegocio[]>;

    /**
     * Busca políticas por categoría
     */
    findByCategoria(tenantId: string, categoria: string): Promise<PoliticaNegocio[]>;

    /**
     * Busca políticas por prioridad
     */
    findByPrioridad(tenantId: string, prioridad: string): Promise<PoliticaNegocio[]>;

    /**
     * Guarda una nueva política
     */
    save(politica: PoliticaNegocio): Promise<PoliticaNegocio>;

    /**
     * Actualiza una política existente
     */
    update(politica: PoliticaNegocio): Promise<PoliticaNegocio>;

    /**
     * Elimina una política (soft delete)
     */
    delete(id: string): Promise<void>;

    /**
     * Busca políticas que aplican a un contexto específico
     */
    findAplicables(tenantId: string, contexto: Record<string, unknown>): Promise<PoliticaNegocio[]>;

    /**
     * Obtiene el historial de versiones de una política
     */
    getHistorialVersiones(politicaId: string): Promise<PoliticaNegocioProps[]>;
}