/**
 * 🌐 SILEXAR PULSE - Repository Interface for Agencias de Medios
 * 
 * @description Interface defining the contract for AgenciaMedios data access
 * Following DDD principles with repository pattern
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { AgenciaMedios, CreateAgenciaMediosDTO, UpdateAgenciaMediosDTO } from '@/lib/db/agencias-medios-schema';

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PaginationParams {
    page: number;
    limit: number;
}

export interface BuscarAgenciasFilters {
    search?: string;
    estado?: string;
    tipoAgencia?: string;
    ciudad?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPOSITORY INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

export interface IAgenciaMediosRepository {
    /**
     * Find a single agencia by ID
     * @param id - The agencia UUID
     * @param tenantId - Tenant context for RLS
     */
    findById(id: string, tenantId: string): Promise<AgenciaMedios | null>;

    /**
     * Find an agencia by its unique code
     * @param codigo - The agency code (e.g., "AGM-0001")
     * @param tenantId - Tenant context for RLS
     */
    findByCodigo(codigo: string, tenantId: string): Promise<AgenciaMedios | null>;

    /**
     * Find all agencias with optional filters and pagination
     * @param tenantId - Tenant context for RLS
     * @param filters - Optional search and filter parameters
     * @param pagination - Page number and limit
     */
    findAll(
        tenantId: string,
        filters?: BuscarAgenciasFilters,
        pagination?: PaginationParams
    ): Promise<AgenciaMedios[]>;

    /**
     * Count total agencias matching filters
     * @param tenantId - Tenant context for RLS
     * @param filters - Optional search and filter parameters
     */
    count(tenantId: string, filters?: BuscarAgenciasFilters): Promise<number>;

    /**
     * Create a new agencia
     * @param data - Creation data
     * @param tenantId - Tenant context for RLS
     * @param userId - Creator user ID for audit
     */
    create(data: CreateAgenciaMediosDTO, tenantId: string, userId: string): Promise<AgenciaMedios>;

    /**
     * Update an existing agencia
     * @param id - Agencia ID
     * @param data - Update data
     * @param tenantId - Tenant context for RLS
     * @param userId - Modifier user ID for audit
     */
    update(id: string, data: UpdateAgenciaMediosDTO, tenantId: string, userId: string): Promise<AgenciaMedios>;

    /**
     * Soft delete an agencia (marks as eliminated)
     * @param id - Agencia ID
     * @param tenantId - Tenant context for RLS
     * @param userId - Deleter user ID for audit
     */
    softDelete(id: string, tenantId: string, userId: string): Promise<void>;

    /**
     * Check if an agencia exists by RUT
     * @param rut - RUT to check
     * @param tenantId - Tenant context for RLS
     * @param excludeId - Optional ID to exclude from check (for updates)
     */
    existsByRut(rut: string, tenantId: string, excludeId?: string): Promise<boolean>;

    /**
     * Check if an agencia exists by code
     * @param codigo - Code to check
     * @param tenantId - Tenant context for RLS
     * @param excludeId - Optional ID to exclude from check (for updates)
     */
    existsByCodigo(codigo: string, tenantId: string, excludeId?: string): Promise<boolean>;

    /**
     * Generate a unique code for new agencia
     * @param tenantId - Tenant context for RLS
     */
    generateCode(tenantId: string): Promise<string>;

    /**
     * Find agencias by ciudad
     * @param ciudad - City name
     * @param tenantId - Tenant context for RLS
     */
    findByCiudad(ciudad: string, tenantId: string): Promise<AgenciaMedios[]>;

    /**
     * Find only active agencias
     * @param tenantId - Tenant context for RLS
     */
    findActive(tenantId: string): Promise<AgenciaMedios[]>;
}
