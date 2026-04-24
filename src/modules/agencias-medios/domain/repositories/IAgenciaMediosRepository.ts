/**
 * 🏢 Repository Interface: IAgenciaMediosRepository
 * 
 * Define el contrato para la persistencia de agencias de medios
 * Incluye operaciones CRUD y consultas especializadas
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

import { AgenciaMedios } from '../entities/AgenciaMedios'

export interface AgenciaMediosFilters {
    tenantId?: string
    activa?: boolean
    tipoAgencia?: string
    nivelColaboracion?: string
    ciudad?: string
    pais?: string
    busqueda?: string
}

export interface Ordenamiento {
    campo: 'nombre' | 'fechaCreacion' | 'scorePartnership' | 'revenueAnual'
    direccion: 'asc' | 'desc'
}

export interface AgenciaMediosSearchResult {
    agencias: AgenciaMedios[]
    total: number
    metricas: {
        totalAgencias: number
        agenciasActivas: number
        scorePromedio: number
        revenueTotal: number
    }
}

export interface IAgenciaMediosRepository {
    /**
     * Guarda una agencia (create o update)
     */
    save(agencia: AgenciaMedios): Promise<void>

    /**
     * Busca agencia por ID
     */
    findById(id: string): Promise<AgenciaMedios | null>

    /**
     * Busca agencia por RUT
     */
    findByRut(rut: string, tenantId: string): Promise<AgenciaMedios | null>

    /**
     * Busca agencia por código
     */
    findByCodigo(codigo: string, tenantId: string): Promise<AgenciaMedios | null>

    /**
     * Lista agencias con filtros y paginación
     */
    findAll(
        filtros: AgenciaMediosFilters,
        ordenamiento?: Ordenamiento,
        limite?: number,
        offset?: number
    ): Promise<AgenciaMediosSearchResult>

    /**
     * Busca todas las agencias activas de un tenant
     */
    findAllActive(tenantId: string): Promise<AgenciaMedios[]>

    /**
     * Busca agencias por tipo
     */
    findByTipo(tipo: string, tenantId: string): Promise<AgenciaMedios[]>

    /**
     * Busca agencias por nivel de colaboración
     */
    findByNivel(nivel: string, tenantId: string): Promise<AgenciaMedios[]>

    /**
     * Busca agencias premium (score alto)
     */
    findPremiumAgencies(tenantId: string, minScore?: number): Promise<AgenciaMedios[]>

    /**
     * Busca agencias que requieren atención
     */
    findAgenciesNeedingAttention(tenantId: string): Promise<AgenciaMedios[]>

    /**
     * Obtiene estadísticas del portfolio de agencias
     */
    getPortfolioStats(tenantId: string): Promise<{
        totalAgencias: number
        agenciasActivas: number
        scorePromedio: number
        distribucionTipos: Record<string, number>
        distribucionNiveles: Record<string, number>
        revenueTotal: number
        comisionPromedio: number
    }>

    /**
     * Top agencias por performance
     */
    getTopPerformers(limite: number, tenantId: string): Promise<AgenciaMedios[]>

    /**
     * Buscar agencias similares (para recomendación)
     */
    findSimilar(agenciaId: string, limite: number, tenantId: string): Promise<AgenciaMedios[]>

    /**
     * Buscar agencias por especialización vertical
     */
    findByVertical(vertical: string, tenantId: string): Promise<AgenciaMedios[]>

    /**
     * Buscar agencias con certificaciones específicas
     */
    findByCertificacion(certificacion: string, tenantId: string): Promise<AgenciaMedios[]>

    /**
     * Verifica si existe una agencia con el mismo RUT
     */
    existsByRut(rut: string, tenantId: string): Promise<boolean>

    /**
     * Elimina lógicamente una agencia
     */
    delete(id: string, tenantId: string): Promise<void>
}
