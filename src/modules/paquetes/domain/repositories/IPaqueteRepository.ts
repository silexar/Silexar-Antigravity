/**
 * REPOSITORY: INTERFACE PAQUETE
 * 
 * @description Interfaz para el repositorio de paquetes.
 * Implementa el patrón Repository para desacoplar dominio de infraestructura.
 * 
 * @version 1.0.0
 */

import { Paquete, PaqueteProps } from '../entities/Paquete.js'

export interface PaqueteBusquedaCriteria {
    texto?: string
    tipo?: string
    estado?: string
    editoraId?: string
    vigencia?: 'vigentes' | 'vencidos' | 'todos'
}

export interface PaqueteRepository {
    // CRUD básico
    findById(id: string): Promise<Paquete | null>
    findByCodigo(codigo: string): Promise<Paquete | null>
    findAll(criteria?: PaqueteBusquedaCriteria): Promise<Paquete[]>

    // Persistencia
    save(paquete: Paquete): Promise<void>
    update(paquete: Paquete): Promise<void>
    delete(id: string): Promise<void>

    // Queries específicos
    findByEditora(editoraId: string): Promise<Paquete[]>
    findByTipo(tipo: string): Promise<Paquete[]>
    findActivos(): Promise<Paquete[]>
    findVigentes(): Promise<Paquete[]>

    // Counting
    count(criteria?: PaqueteBusquedaCriteria): Promise<number>
}