/**
 * 🌐 SILEXAR PULSE - Interfaz Repository Emisoras
 * 
 * @description Define el contrato para acceso a datos de emisoras
 * Implementa el patrón Repository para desacoplar la lógica de dominio de la persistencia
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import type { Emisora } from '@/lib/db/emisoras-schema';

// ═══════════════════════════════════════════════════════════════
// TIPOS DE FILTRO
// ═══════════════════════════════════════════════════════════════

export interface EmisoraFilters {
    search?: string;
    ciudad?: string;
    estado?: string;
    tipoFrecuencia?: string;
}

export interface EmisoraSortOptions {
    field: 'nombre' | 'frecuencia' | 'ciudad' | 'fechaCreacion';
    direction: 'asc' | 'desc';
}

// ═══════════════════════════════════════════════════════════════
// INTERFAZ PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export interface IEmisoraRepository {
    /**
     * Busca una emisora por ID y tenant
     */
    findById(id: string, tenantId: string): Promise<Emisora | null>;

    /**
     * Busca una emisora por código dentro de un tenant
     */
    findByCodigo(codigo: string, tenantId: string): Promise<Emisora | null>;

    /**
     * Obtiene todas las emisoras de un tenant con filtros opcionales
     */
    findAll(
        tenantId: string,
        filters?: EmisoraFilters,
        sort?: EmisoraSortOptions,
        limit?: number,
        offset?: number
    ): Promise<Emisora[]>;

    /**
     * Cuenta el total de emisoras que coinciden con los filtros
     */
    count(tenantId: string, filters?: EmisoraFilters): Promise<number>;

    /**
     * Crea una nueva emisora
     */
    create(emisor: Omit<Emisora, 'id' | 'fechaCreacion'>): Promise<Emisora>;

    /**
     * Actualiza una emisora existente
     */
    update(id: string, tenantId: string, data: Partial<Emisora>): Promise<Emisora | null>;

    /**
     * Eliminación lógica (soft delete)
     */
    softDelete(id: string, tenantId: string, userId: string): Promise<void>;

    /**
     * Verifica si existe una emisora con el mismo código en el tenant
     */
    existsByCodigo(codigo: string, tenantId: string, excludeId?: string): Promise<boolean>;

    /**
     * Genera el siguiente código secuencial para una emisora
     */
    generateCode(tenantId: string): Promise<string>;

    /**
     * Obtiene emisoras por ciudad
     */
    findByCiudad(ciudad: string, tenantId: string): Promise<Emisora[]>;

    /**
     * Obtieneemisoras activas
     */
    findActive(tenantId: string): Promise<Emisora[]>;
}