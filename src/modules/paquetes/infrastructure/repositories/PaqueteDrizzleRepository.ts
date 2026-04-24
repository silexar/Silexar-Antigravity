/**
 * REPOSITORY: PAQUETE DRIZZLE REPOSITORY
 * 
 * @description Implementación del repositorio usando Drizzle ORM.
 * 
 * @version 1.0.0
 */

import { getDB } from '@/lib/db'
import { paquetes } from '@/lib/db/paquetes-schema'
import { eq, and, isNull, desc } from 'drizzle-orm'
import type { Paquete as PaqueteRow } from '@/lib/db/paquetes-schema'
import { Paquete, PaqueteProps } from '../../domain/entities/Paquete.js'
import type { PaqueteRepository, PaqueteBusquedaCriteria } from '../../domain/repositories/IPaqueteRepository.js'
import { CodigoPaquete } from '../../domain/value-objects/CodigoPaquete.js'
import { TipoPaquete } from '../../domain/value-objects/TipoPaquete.js'
import { HorarioEmision } from '../../domain/value-objects/HorarioEmision.js'
import { PrecioBase } from '../../domain/value-objects/PrecioBase.js'
import { NivelExclusividad } from '../../domain/value-objects/NivelExclusividad.js'

function mapDrizzleToPaquete(row: PaqueteRow): Paquete {
    const codigoResult = CodigoPaquete.crear(row.codigo)
    const tipoResult = TipoPaquete.create(row.tipo)
    const horarioResult = HorarioEmision.crear(row.horarioInicio, row.horarioFin)
    const precioResult = PrecioBase.crear(row.precioBase)
    const nivelResult = NivelExclusividad.create(row.nivelExclusividad)

    if (!codigoResult.success || !tipoResult.success || !horarioResult.success || !precioResult.success || !nivelResult.success) {
        throw new Error('Error mapeando paquete desde Drizzle')
    }

    const props: PaqueteProps = {
        id: row.id,
        codigo: codigoResult.data,
        nombre: row.nombre,
        descripcion: row.descripcion || '',
        tipo: tipoResult.data,
        estado: row.estado as any,
        editoraId: row.editoraId,
        editoraNombre: row.editoraNombre,
        programaId: row.programaId,
        programaNombre: row.programaNombre,
        horario: horarioResult.data,
        diasSemana: row.diasSemana,
        duraciones: row.duraciones as any,
        precioBase: precioResult.data,
        precioActual: row.precioActual,
        nivelExclusividad: nivelResult.data,
        vigenciaDesde: new Date(row.vigenciaDesde),
        vigenciaHasta: new Date(row.vigenciaHasta),
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        createdBy: row.createdBy,
        updatedBy: row.updatedBy,
        version: row.version,
        domainEvents: []
    }

    return Paquete.fromPersistence(props)
}

export class PaqueteDrizzleRepository implements PaqueteRepository {
    async findById(id: string): Promise<Paquete | null> {
        try {
            const db = getDB()
            const result = await db.select()
                .from(paquetes)
                .where(and(eq(paquetes.id, id), isNull(paquetes.deletedAt)))
                .limit(1)

            if (result.length === 0) return null
            return mapDrizzleToPaquete(result[0])
        } catch (error) {
            console.error('[PaqueteRepository] findById error:', error)
            return null
        }
    }

    async findByCodigo(codigo: string): Promise<Paquete | null> {
        try {
            const db = getDB()
            const result = await db.select()
                .from(paquetes)
                .where(and(eq(paquetes.codigo, codigo), isNull(paquetes.deletedAt)))
                .limit(1)

            if (result.length === 0) return null
            return mapDrizzleToPaquete(result[0])
        } catch (error) {
            console.error('[PaqueteRepository] findByCodigo error:', error)
            return null
        }
    }

    async findAll(criteria?: PaqueteBusquedaCriteria): Promise<Paquete[]> {
        try {
            const db = getDB()
            let filtered = await db.select()
                .from(paquetes)
                .where(isNull(paquetes.deletedAt))
                .orderBy(desc(paquetes.createdAt))

            if (criteria?.texto) {
                const texto = criteria.texto.toLowerCase()
                filtered = filtered.filter(p =>
                    p.nombre.toLowerCase().includes(texto) ||
                    p.codigo.toLowerCase().includes(texto)
                )
            }
            if (criteria?.tipo) {
                filtered = filtered.filter(p => p.tipo === criteria.tipo)
            }
            if (criteria?.estado) {
                filtered = filtered.filter(p => p.estado === criteria.estado)
            }
            if (criteria?.editoraId) {
                filtered = filtered.filter(p => p.editoraId === criteria.editoraId)
            }

            return filtered.map(p => mapDrizzleToPaquete(p))
        } catch (error) {
            console.error('[PaqueteRepository] findAll error:', error)
            return []
        }
    }

    async save(paquete: Paquete): Promise<void> {
        const snapshot = paquete.toSnapshot()
        const db = getDB()

        await db.insert(paquetes).values({
            id: snapshot.id,
            codigo: snapshot.codigo.value,
            nombre: snapshot.nombre,
            descripcion: snapshot.descripcion,
            tipo: snapshot.tipo.value,
            estado: snapshot.estado,
            editoraId: snapshot.editoraId,
            editoraNombre: snapshot.editoraNombre,
            programaId: snapshot.programaId,
            programaNombre: snapshot.programaNombre,
            horarioInicio: snapshot.horario.horaInicio,
            horarioFin: snapshot.horario.horaFin,
            diasSemana: snapshot.diasSemana,
            duraciones: snapshot.duraciones,
            precioBase: snapshot.precioBase.value,
            precioActual: snapshot.precioActual,
            nivelExclusividad: snapshot.nivelExclusividad.value,
            vigenciaDesde: typeof snapshot.vigenciaDesde === 'string' ? snapshot.vigenciaDesde : snapshot.vigenciaDesde.toISOString().split('T')[0],
            vigenciaHasta: typeof snapshot.vigenciaHasta === 'string' ? snapshot.vigenciaHasta : snapshot.vigenciaHasta.toISOString().split('T')[0],
            createdBy: snapshot.createdBy,
            updatedBy: snapshot.updatedBy
        })
    }

    async update(paquete: Paquete): Promise<void> {
        const snapshot = paquete.toSnapshot()
        const db = getDB()

        await db.update(paquetes)
            .set({
                nombre: snapshot.nombre,
                descripcion: snapshot.descripcion,
                tipo: snapshot.tipo.value,
                estado: snapshot.estado,
                editoraId: snapshot.editoraId,
                editoraNombre: snapshot.editoraNombre,
                programaId: snapshot.programaId,
                programaNombre: snapshot.programaNombre,
                horarioInicio: snapshot.horario.horaInicio,
                horarioFin: snapshot.horario.horaFin,
                diasSemana: snapshot.diasSemana,
                duraciones: snapshot.duraciones,
                precioBase: snapshot.precioBase.value,
                precioActual: snapshot.precioActual,
                nivelExclusividad: snapshot.nivelExclusividad.value,
                vigenciaDesde: typeof snapshot.vigenciaDesde === 'string' ? snapshot.vigenciaDesde : snapshot.vigenciaDesde.toISOString().split('T')[0],
                vigenciaHasta: typeof snapshot.vigenciaHasta === 'string' ? snapshot.vigenciaHasta : snapshot.vigenciaHasta.toISOString().split('T')[0],
                updatedBy: snapshot.updatedBy,
                updatedAt: new Date(),
                version: snapshot.version + 1
            })
            .where(eq(paquetes.id, snapshot.id))
    }

    async delete(id: string): Promise<void> {
        const db = getDB()
        await db.update(paquetes)
            .set({
                estado: 'BORRADO',
                deletedAt: new Date()
            })
            .where(eq(paquetes.id, id))
    }

    async findByEditora(editoraId: string): Promise<Paquete[]> {
        return this.findAll({ editoraId })
    }

    async findByTipo(tipo: string): Promise<Paquete[]> {
        return this.findAll({ tipo })
    }

    async findActivos(): Promise<Paquete[]> {
        return this.findAll({ estado: 'ACTIVO' })
    }

    async findVigentes(): Promise<Paquete[]> {
        const paquetes = await this.findAll()
        return paquetes.filter(p => p.estaVigente())
    }

    async count(criteria?: PaqueteBusquedaCriteria): Promise<number> {
        const all = await this.findAll(criteria)
        return all.length
    }
}
