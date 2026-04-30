/**
 * REPOSITORY: PROGRAMA AUSPICIO DRIZZLE REPOSITORY
 * 
 * @description Implementación del repositorio usando Drizzle ORM.
 * 
 * @version 1.0.0
 */

import { getDB } from '@/lib/db'
import { programas } from '@/lib/db/vencimientos-schema'
import { eq, and, isNull, desc, ilike, or, sql } from 'drizzle-orm'
import { ProgramaAuspicio, ProgramaAuspicioProps, ConductorPrograma } from '@/modules/vencimientos/domain/entities/ProgramaAuspicio'
import type { IProgramaAuspicioRepository, ProgramaBusquedaCriteria, ProgramaResultadoBusqueda } from '@/modules/vencimientos/domain/repositories/IProgramaAuspicioRepository'
import { HorarioEmision } from '@/modules/vencimientos/domain/value-objects/HorarioEmision'
import { CupoDisponible } from '@/modules/vencimientos/domain/value-objects/CupoDisponible'

// Helper to convert integer days from DB to DiaSemana strings
const DIAS_MAP: Record<number, HorarioEmision['diasEmision'][number]> = {
    1: 'lunes',
    2: 'martes',
    3: 'miercoles',
    4: 'jueves',
    5: 'viernes',
    6: 'sabado',
    7: 'domingo'
}

// Helper to convert integer days to DiaSemana string for saving to DB
const DIAS_REVERSE_MAP: Record<HorarioEmision['diasEmision'][number], number> = {
    'lunes': 1,
    'martes': 2,
    'miercoles': 3,
    'jueves': 4,
    'viernes': 5,
    'sabado': 6,
    'domingo': 7
}

function mapDrizzleToPrograma(row: typeof programas.$inferSelect): ProgramaAuspicio {
    // Parse JSON fields from text columns
    let cuposData = { tipoA: { total: 0, ocupados: 0, precioBase: 0, precioActual: 0 }, tipoB: { total: 0, ocupados: 0, precioBase: 0, precioActual: 0 }, menciones: { total: 0, ocupados: 0, precioBase: 0, precioActual: 0 } }
    if (row.cuposData) {
        try {
            cuposData = JSON.parse(row.cuposData as string)
        } catch { /* use default */ }
    }

    let conductoresData: Array<{ id: string; nombre: string; rol: string }> = []
    if (row.conductoresData) {
        try {
            conductoresData = JSON.parse(row.conductoresData as string)
        } catch { /* use empty array */ }
    }

    const props: ProgramaAuspicioProps = {
        id: row.id,
        emisoraId: row.emiId,
        emisoraNombre: row.emiNombre || '',
        nombre: row.nombre,
        descripcion: row.descripcion || '',
        horario: HorarioEmision.fromPersistence({
            horaInicio: row.horaInicio,
            horaFin: row.horaFin,
            diasEmision: ((row.diasSemana as string) || '').split('').map(d => d.toLowerCase() as HorarioEmision['diasEmision'][number]).filter(Boolean),
        }),
        cuposTipoA: CupoDisponible.fromPersistence({
            totalCupos: cuposData?.tipoA?.total || 0,
            cuposOcupados: cuposData?.tipoA?.ocupados || 0,
            cuposReservados: 0,
            cuposExtendidos: 0,
            maxExtensiones: 0,
        }),
        cuposTipoB: CupoDisponible.fromPersistence({
            totalCupos: cuposData?.tipoB?.total || 0,
            cuposOcupados: cuposData?.tipoB?.ocupados || 0,
            cuposReservados: 0,
            cuposExtendidos: 0,
            maxExtensiones: 0,
        }),
        cuposMenciones: CupoDisponible.fromPersistence({
            totalCupos: cuposData?.menciones?.total || 0,
            cuposOcupados: cuposData?.menciones?.ocupados || 0,
            cuposReservados: 0,
            cuposExtendidos: 0,
            maxExtensiones: 0,
        }),
        revenueActual: Number(row.revenueActual) || 0,
        revenuePotencial: Number(row.revenuePotencial) || 0,
        listaEsperaCount: row.listaEsperaCount || 0,
        conductores: conductoresData.map(c => ({
            id: c.id,
            nombre: c.nombre,
            rol: c.rol as ConductorPrograma['rol']
        })),
        estado: ((row.estado as string) || 'borrador') as ProgramaAuspicioProps['estado'],
        fechaCreacion: new Date(row.createdAt),
        fechaActualizacion: new Date(row.updatedAt),
        creadoPor: row.createdBy || '',
        actualizadoPor: row.updatedBy || '',
        version: 1,
    }
    return ProgramaAuspicio.fromPersistence(props)
}

export class ProgramaAuspicioDrizzleRepository implements IProgramaAuspicioRepository {
    async save(programa: ProgramaAuspicio): Promise<void> {
        try {
            const db = getDB()
            const horario = programa.horario.toJSON()
            const cuposData = {
                tipoA: {
                    total: programa.cuposTipoA.totalCupos,
                    ocupados: programa.cuposTipoA.cuposOcupados,
                    precioBase: 0,
                    precioActual: 0,
                },
                tipoB: {
                    total: programa.cuposTipoB.totalCupos,
                    ocupados: programa.cuposTipoB.cuposOcupados,
                    precioBase: 0,
                    precioActual: 0,
                },
                menciones: {
                    total: programa.cuposMenciones.totalCupos,
                    ocupados: programa.cuposMenciones.cuposOcupados,
                    precioBase: 0,
                    precioActual: 0,
                }
            }

            await db.insert(programas).values({
                id: programa.id,
                codigo: `PRA-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
                emiId: programa.emisoraId,
                emiNombre: programa.emisoraNombre,
                nombre: programa.nombre,
                descripcion: programa.descripcion,
                horaInicio: horario.horaInicio,
                horaFin: horario.horaFin,
                diasSemana: horario.diasEmision.join(''),
                cuposData: JSON.stringify(cuposData),
                estado: programa.estado.toUpperCase(),
                revenueActual: programa.revenueActual.toString(),
                revenuePotencial: programa.revenuePotencial.toString(),
                listaEsperaCount: programa.listaEsperaCount,
                conductoresData: JSON.stringify(programa.conductores),
                createdBy: programa.fechaCreacion.toISOString(),
                updatedBy: programa.fechaActualizacion.toISOString(),
                tenantId: 'default',
            }).onConflictDoUpdate({
                target: programas.id,
                set: {
                    nombre: programa.nombre,
                    descripcion: programa.descripcion,
                    estado: programa.estado.toUpperCase(),
                    revenueActual: programa.revenueActual.toString(),
                    revenuePotencial: programa.revenuePotencial.toString(),
                    updatedAt: new Date(),
                },
            })
        } catch (error) {
            console.error('[ProgramaAuspicioRepository] save error:', error)
            throw error
        }
    }

    async findById(id: string): Promise<ProgramaAuspicio | null> {
        try {
            const db = getDB()
            const result = await db.select()
                .from(programas)
                .where(and(eq(programas.id, id), isNull(programas.deletedAt)))
                .limit(1)

            if (result.length === 0) return null
            return mapDrizzleToPrograma(result[0])
        } catch (error) {
            console.error('[ProgramaAuspicioRepository] findById error:', error)
            return null
        }
    }

    async findByEmisora(emisoraId: string): Promise<ProgramaAuspicio[]> {
        try {
            const db = getDB()
            const result = await db.select()
                .from(programas)
                .where(and(eq(programas.emiId, emisoraId), isNull(programas.deletedAt)))
                .orderBy(desc(programas.createdAt))

            return result.map(mapDrizzleToPrograma)
        } catch (error) {
            console.error('[ProgramaAuspicioRepository] findByEmisora error:', error)
            return []
        }
    }

    async findByEstado(estado: string): Promise<ProgramaAuspicio[]> {
        try {
            const db = getDB()
            const result = await db.select()
                .from(programas)
                .where(and(eq(programas.estado, estado), isNull(programas.deletedAt)))
                .orderBy(desc(programas.createdAt))

            return result.map(mapDrizzleToPrograma)
        } catch (error) {
            console.error('[ProgramaAuspicioRepository] findByEstado error:', error)
            return []
        }
    }

    async findConDisponibilidad(emisoraId: string): Promise<ProgramaAuspicio[]> {
        try {
            const db = getDB()
            const result = await db.select()
                .from(programas)
                .where(
                    and(
                        eq(programas.emiId, emisoraId),
                        eq(programas.estado, 'ACTIVO'),
                        isNull(programas.deletedAt)
                    )
                )
                .orderBy(desc(programas.revenueActual))

            return result.map(mapDrizzleToPrograma)
        } catch (error) {
            console.error('[ProgramaAuspicioRepository] findConDisponibilidad error:', error)
            return []
        }
    }

    async findSinCupos(emisoraId: string): Promise<ProgramaAuspicio[]> {
        try {
            const db = getDB()
            const result = await db.select()
                .from(programas)
                .where(
                    and(
                        eq(programas.emiId, emisoraId),
                        isNull(programas.deletedAt)
                    )
                )

            // Filter in memory for JSON cuposData
            return result
                .map(mapDrizzleToPrograma)
                .filter(p => p.totalDisponibles === 0)
        } catch (error) {
            console.error('[ProgramaAuspicioRepository] findSinCupos error:', error)
            return []
        }
    }

    async search(criteria: ProgramaBusquedaCriteria): Promise<ProgramaResultadoBusqueda> {
        try {
            const db = getDB()
            const offset = (criteria.pagina - 1) * criteria.tamanoPagina

            let conditions = [isNull(programas.deletedAt)]

            if (criteria.emisoraId) {
                conditions.push(eq(programas.emiId, criteria.emisoraId))
            }

            if (criteria.estado) {
                conditions.push(eq(programas.estado, criteria.estado))
            }

            if (criteria.busquedaTexto) {
                conditions.push(
                    or(
                        ilike(programas.nombre, `%${criteria.busquedaTexto}%`),
                        ilike(programas.descripcion, `%${criteria.busquedaTexto}%`)
                    )!
                )
            }

            // Count query
            const countResult = await db.select({ count: sql<number>`count(*)::int` })
                .from(programas)
                .where(and(...conditions))

            const total = countResult[0]?.count || 0

            // Data query
            const orderBy = desc(programas.createdAt)

            const result = await db.select()
                .from(programas)
                .where(and(...conditions))
                .orderBy(orderBy)
                .limit(criteria.tamanoPagina)
                .offset(offset)

            const programasList = result.map(mapDrizzleToPrograma)

            return {
                programas: programasList,
                total,
                pagina: criteria.pagina,
                totalPaginas: Math.ceil(total / criteria.tamanoPagina),
            }
        } catch (error) {
            console.error('[ProgramaAuspicioRepository] search error:', error)
            return {
                programas: [],
                total: 0,
                pagina: criteria.pagina,
                totalPaginas: 0,
            }
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const db = getDB()
            await db.update(programas)
                .set({ deletedAt: new Date() })
                .where(eq(programas.id, id))
        } catch (error) {
            console.error('[ProgramaAuspicioRepository] delete error:', error)
            throw error
        }
    }

    async getTopPerformers(emisoraId: string, limit: number): Promise<ProgramaAuspicio[]> {
        try {
            const db = getDB()
            const result = await db.select()
                .from(programas)
                .where(
                    and(
                        eq(programas.emiId, emisoraId),
                        eq(programas.estado, 'ACTIVO'),
                        isNull(programas.deletedAt)
                    )
                )
                .orderBy(desc(programas.revenueActual))
                .limit(limit)

            return result.map(mapDrizzleToPrograma)
        } catch (error) {
            console.error('[ProgramaAuspicioRepository] getTopPerformers error:', error)
            return []
        }
    }

    async getRankingOcupacion(emisoraId: string): Promise<Array<{ programaId: string; nombre: string; ocupacion: number; revenue: number }>> {
        try {
            const db = getDB()
            const result = await db.select({
                id: programas.id,
                nombre: programas.nombre,
                revenueActual: programas.revenueActual,
            })
                .from(programas)
                .where(
                    and(
                        eq(programas.emiId, emisoraId),
                        isNull(programas.deletedAt)
                    )
                )
                .orderBy(desc(programas.revenueActual))

            return result.map(row => ({
                programaId: row.id,
                nombre: row.nombre,
                ocupacion: 0,
                revenue: Number(row.revenueActual) || 0,
            }))
        } catch (error) {
            console.error('[ProgramaAuspicioRepository] getRankingOcupacion error:', error)
            return []
        }
    }
}
