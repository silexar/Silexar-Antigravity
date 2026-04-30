/**
 * 👥 SILEXAR PULSE - Interfaz Repository Vendedores
 * 
 * @description Define el contrato para acceso a datos de vendedores y equipos de ventas
 * Implementa el patrón Repository para desacoplar la lógica de dominio de la persistencia
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import type { VendedorSelect, VendedorInsert, EquipoVentasSelect, MetaVentasSelect } from '@/lib/db/equipos-ventas-schema';

// ═══════════════════════════════════════════════════════════════
// TIPOS DE FILTRO
// ═══════════════════════════════════════════════════════════════

export interface VendedorFilters {
    search?: string;
    estado?: string;
    equipoId?: string;
    tipoComision?: string;
}

export interface VendedorSortOptions {
    field: 'nombre' | 'ventasAcumuladas' | 'rankingActual' | 'fechaIngreso';
    direction: 'asc' | 'desc';
}

// ═══════════════════════════════════════════════════════════════
// INTERFAZ PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export interface IVendedorRepository {
    /**
     * Busca un vendedor por ID y tenant
     */
    findById(id: string, tenantId: string): Promise<VendedorSelect | null>;

    /**
     * Busca un vendedor por email dentro de un tenant
     */
    findByEmail(email: string, tenantId: string): Promise<VendedorSelect | null>;

    /**
     * Obtiene todos los vendedores de un tenant con filtros opcionales
     */
    findAll(
        tenantId: string,
        filters?: VendedorFilters,
        sort?: VendedorSortOptions,
        limit?: number,
        offset?: number
    ): Promise<VendedorSelect[]>;

    /**
     * Cuenta el total de vendedores que coinciden con los filtros
     */
    count(tenantId: string, filters?: VendedorFilters): Promise<number>;

    /**
     * Crea un nuevo vendedor
     */
    create(vendedor: VendedorInsert): Promise<VendedorSelect>;

    /**
     * Actualiza un vendedor existente
     */
    update(id: string, tenantId: string, data: Partial<VendedorSelect>): Promise<VendedorSelect | null>;

    /**
     * Eliminación lógica (soft delete)
     */
    softDelete(id: string, tenantId: string, userId: string): Promise<void>;

    /**
     * Verifica si existe un email en el tenant
     */
    existsByEmail(email: string, tenantId: string, excludeId?: string): Promise<boolean>;

    /**
     * Genera el siguiente código secuencial para un vendedor
     */
    generateCode(tenantId: string): Promise<string>;

    /**
     * Obtiene los vendedores de un equipo
     */
    findByEquipo(equipoId: string, tenantId: string): Promise<VendedorSelect[]>;

    /**
     * Actualiza el ranking de vendedores basado en ventas
     */
    actualizarRankings(tenantId: string): Promise<void>;
}

// ═══════════════════════════════════════════════════════════════
// INTERFAZ EQUIPOS DE VENTAS
// ═══════════════════════════════════════════════════════════════

export interface IEquipoVentaRepository {
    findById(id: string, tenantId: string): Promise<EquipoVentasSelect | null>;
    findAll(tenantId: string, includeInactive?: boolean): Promise<EquipoVentasSelect[]>;
    create(equipo: Omit<EquipoVentasSelect, 'id' | 'fechaCreacion'>): Promise<EquipoVentasSelect>;
    update(id: string, tenantId: string, data: Partial<EquipoVentasSelect>): Promise<EquipoVentasSelect | null>;
    getMetricasEquipo(equipoId: string, tenantId: string): Promise<{
        totalVendedores: number;
        ventasTotales: number;
        metaEquipo: number;
        cumplimiento: number;
    }>;
}

// ═══════════════════════════════════════════════════════════════
// INTERFAZ METAS DE VENTAS
// ═══════════════════════════════════════════════════════════════

export interface IMetaVentaRepository {
    findByVendedor(vendedorId: string, tenantId: string): Promise<MetaVentasSelect[]>;
    findActivas(vendedorId: string, tenantId: string): Promise<MetaVentasSelect | null>;
    create(meta: Omit<MetaVentasSelect, 'id' | 'fechaCreacion'>): Promise<MetaVentasSelect>;
    updateProgress(id: string, montoAlcanzado: number, porcentajeCumplimiento: number): Promise<void>;
}centajeCumplimiento: number): Promise<void>;
}