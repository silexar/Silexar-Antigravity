/**
 * 🏢 Repository Interface: IContactoAgenciaRepository
 * 
 * Define el contrato para la persistencia de contactos de agencia
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

import { ContactoAgencia } from '../entities/ContactoAgencia'
import { RolContactoAgencia } from '../entities/ContactoAgencia'

export interface ContactoAgenciaFilters {
    agenciaId?: string
    tenantId?: string
    rol?: RolContactoAgencia
    esPrincipal?: boolean
    esDecisor?: boolean
    activa?: boolean
}

export interface IContactoAgenciaRepository {
    /**
     * Guarda un contacto
     */
    save(contacto: ContactoAgencia): Promise<void>

    /**
     * Busca contacto por ID
     */
    findById(id: string): Promise<ContactoAgencia | null>

    /**
     * Busca contactos por agencia
     */
    findByAgenciaId(agenciaId: string, activosSolo?: boolean): Promise<ContactoAgencia[]>

    /**
     * Busca contacto principal de una agencia
     */
    findPrincipalByAgenciaId(agenciaId: string): Promise<ContactoAgencia | null>

    /**
     * Busca contactos por rol
     */
    findByRol(agenciaId: string, rol: RolContactoAgencia): Promise<ContactoAgencia[]>

    /**
     * Busca contactos activos
     */
    findActiveByAgenciaId(agenciaId: string): Promise<ContactoAgencia[]>

    /**
     * Lista contactos con filtros
     */
    findAll(
        filtros: ContactoAgenciaFilters,
        limite?: number,
        offset?: number
    ): Promise<{ contactos: ContactoAgencia[]; total: number }>

    /**
     * Obtiene el conteo de contactos por agencia
     */
    countByAgenciaId(agenciaId: string): Promise<number>

    /**
     * Obtiene contactos de alto impacto (decisores)
     */
    findHighImpactByAgenciaId(agenciaId: string): Promise<ContactoAgencia[]>

    /**
     * Verifica si existe email para la agencia
     */
    existsByEmail(email: string, agenciaId: string): Promise<boolean>

    /**
     * Elimina un contacto
     */
    delete(id: string): Promise<void>
}
