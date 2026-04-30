/**
 * 🌐 SILEXAR PULSE - Repository Interface for Inventario
 * 
 * @description Interface defining the contract for Inventario/Vencimientos data access
 * Following DDD principles with repository pattern
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { inventarioCupos, vencimientos } from '@/lib/db/vencimientos-schema';
import type { InventarioCupo, Vencimientos, EstadoCupo, TipoInventario } from '@/lib/db/vencimientos-schema';

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PaginationParams {
    page: number;
    limit: number;
}

export interface InventarioFilters {
    fecha?: string;
    emiId?: string;
    tipoInventario?: TipoInventario;
    estado?: EstadoCupo;
}

export interface VencimientosFilters {
    fecha?: string;
    inventarioId?: string;
    estado?: EstadoCupo;
    anuncianteId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIPO RESULTADO CON INFORMACIÓN DE VENCIMIENTOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface CupoWithVencimientos {
    id: string;
    codigo: string;
    nombre: string;
    tipoInventario: TipoInventario;
    horaInicio: string;
    duracionSegundos: number;
    tarifaBase: number;
    emiId: string;
    emiNombre: string;
    programaId: string | null;
    programaNombre: string | null;
    activo: boolean;
    vencimientos: {
        id: string;
        fecha: Date;
        estado: EstadoCupo;
        precioVenta: number | null;
        anuncianteId: string | null;
        anuncianteNombre: string | null;
    } | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPOSITORY INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

export interface IInventarioRepository {
    /**
     * Find all cupos with optional filters
     * @param tenantId - Tenant context for RLS
     * @param filters - Optional search and filter parameters
     * @param pagination - Page number and limit
     */
    findCupos(
        tenantId: string,
        filters?: InventarioFilters,
        pagination?: PaginationParams
    ): Promise<CupoWithVencimientos[]>;

    /**
     * Find a single cupo by ID
     * @param id - The cupo UUID
     * @param tenantId - Tenant context for RLS
     */
    findCupoById(id: string, tenantId: string): Promise<CupoWithVencimientos | null>;

    /**
     * Count total cupos matching filters
     * @param tenantId - Tenant context for RLS
     * @param filters - Optional search and filter parameters
     */
    countCupos(tenantId: string, filters?: InventarioFilters): Promise<number>;

    /**
     * Find vencimientos by fecha
     * @param tenantId - Tenant context for RLS
     * @param fecha - Date to filter vencimientos
     * @param emiId - Optional emissora filter
     */
    findVencimientosByFecha(
        tenantId: string,
        fecha: string,
        emiId?: string
    ): Promise<Vencimientos[]>;

    /**
     * Create a new vencimientos
     * @param data - Creation data
     * @param tenantId - Tenant context for RLS
     * @param userId - Creator user ID for audit
     */
    createVencimientos(
        data: {
            inventarioId: string;
            fecha: string;
            estado?: EstadoCupo;
            anuncianteId?: string;
            precioVenta?: number;
            notas?: string;
        },
        tenantId: string,
        userId: string
    ): Promise<Vencimientos>;

    /**
     * Update a vencimientos
     * @param id - Vencimientos ID
     * @param data - Update data
     * @param tenantId - Tenant context for RLS
     * @param userId - Modifier user ID for audit
     */
    updateVencimientos(
        id: string,
        data: {
            estado?: EstadoCupo;
            anuncianteId?: string;
            precioVenta?: number;
            notas?: string;
        },
        tenantId: string,
        userId: string
    ): Promise<Vencimientos>;

    /**
     * Get inventory stats for a date range
     * @param tenantId - Tenant context for RLS
     * @param fecha - Date to get stats for
     */
    getStats(tenantId: string, fecha: string): Promise<{
        totalCupos: number;
        disponibles: number;
        vendidos: number;
        reservados: number;
        ocupacionPorcentaje: number;
    }>;

    /**
     * Find cupos by emissora
     * @param emiId - Emisora UUID
     * @param tenantId - Tenant context for RLS
     */
    findByEmisora(emiId: string, tenantId: string): Promise<InventarioCupo[]>;

    /**
     * Find active cupos
     * @param tenantId - Tenant context for RLS
     */
    findActive(tenantId: string): Promise<InventarioCupo[]>;
}