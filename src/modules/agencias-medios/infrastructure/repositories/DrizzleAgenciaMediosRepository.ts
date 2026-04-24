/**
 * 🏢 Infrastructure: DrizzleAgenciaMediosRepository
 * 
 * Implementación del repositorio usando Drizzle ORM
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

import { db } from '@/lib/db'
import { agenciasMedios, contactosAgencia } from '@/lib/db/agencias-medios-schema'
import { eq, and, ilike, or, desc, asc, count, gte, lte, sql } from 'drizzle-orm'
import { withTenantContext } from '@/lib/db/tenant-context'
import { AgenciaMedios } from '../../domain/entities/AgenciaMedios'
import { ContactoAgencia } from '../../domain/entities/ContactoAgencia'
import { IAgenciaMediosRepository, AgenciaMediosFilters, Ordenamiento } from '../../domain/repositories/IAgenciaMediosRepository'
import { IContactoAgenciaRepository, ContactoAgenciaFilters } from '../../domain/repositories/IContactoAgenciaRepository'
import { RutAgenciaMedios } from '../../domain/value-objects/RutAgenciaMedios'
import { TipoAgenciaMedios, TipoAgenciaMediosValue } from '../../domain/value-objects/TipoAgenciaMedios'
import { NivelColaboracion, NivelColaboracionValue } from '../../domain/value-objects/NivelColaboracion'
import { ScorePartnership } from '../../domain/value-objects/ScorePartnership'
import { Logger } from '@/lib/observability'

export interface DrizzleAgenciaMediosRepositoryDeps {
    logger?: Logger
}

/**
 * Implementación del repositorio de agencias de medios usando Drizzle
 */
export class DrizzleAgenciaMediosRepository implements IAgenciaMediosRepository {
    private logger: Logger | undefined

    constructor(deps: DrizzleAgenciaMediosRepositoryDeps = {}) {
        this.logger = deps.logger
    }

    async save(agencia: AgenciaMedios): Promise<void> {
        await withTenantContext(agencia.tenantId, async () => {
            const existing = await db
                .select({ id: agenciasMedios.id })
                .from(agenciasMedios)
                .where(eq(agenciasMedios.id, agencia.id))
                .limit(1)

            const data = agencia.toPersistence()

            if (existing.length > 0) {
                await db
                    .update(agenciasMedios)
                    .set({
                        nombreRazonSocial: data.razonSocial as string,
                        nombreComercial: data.nombreComercial as string | null,
                        tipoAgencia: data.tipoAgencia as any,
                        nivelColaboracion: data.nivelColaboracion as any,
                        emailContacto: data.emailGeneral as string | null,
                        telefonoContacto: data.telefonoGeneral as string | null,
                        paginaWeb: data.paginaWeb as string | null,
                        direccion: data.direccion as string | null,
                        ciudad: data.ciudad as string | null,
                        region: data.region as string | null,
                        pais: data.pais as string | null,
                        giroActividad: data.giroActividad as string | null,
                        empleadosCantidad: data.empleadosCantidad !== null ? String(data.empleadosCantidad) : null,
                        especializacionesVerticales: data.especializacionesVerticales as string,
                        capacidadesDigitales: data.capacidadesDigitales as string,
                        certificaciones: data.certificaciones as string,
                        revenueAnual: data.revenueAnual !== null ? String(data.revenueAnual) : null,
                        activa: data.activa as boolean,
                        estado: data.estado as 'activa' | 'inactiva' | 'suspendida' | 'pendiente',
                        fechaModificacion: new Date()
                    })
                    .where(eq(agenciasMedios.id, agencia.id))
            } else {
                await db.insert(agenciasMedios).values({
                    id: agencia.id,
                    tenantId: agencia.tenantId,
                    codigo: data.codigo as string,
                    rut: data.rut as string,
                    nombreRazonSocial: data.razonSocial as string,
                    nombreComercial: data.nombreComercial as string | null,
                    tipoAgencia: data.tipoAgencia as any,
                    nivelColaboracion: data.nivelColaboracion as any,
                    scorePartnership: data.scorePartnership !== null ? String(data.scorePartnership) : null,
                    emailContacto: data.emailGeneral as string | null,
                    telefonoContacto: data.telefonoGeneral as string | null,
                    paginaWeb: data.paginaWeb as string | null,
                    direccion: data.direccion as string | null,
                    ciudad: data.ciudad as string | null,
                    region: data.region as string | null,
                    pais: data.pais as string | null,
                    activa: data.activa as boolean,
                    estado: data.estado as 'activa' | 'inactiva' | 'suspendida' | 'pendiente',
                    creadoPorId: data.creadoPorId as string,
                    fechaCreacion: data.fechaCreacion as Date
                })
            }
        })
    }

    async findById(id: string): Promise<AgenciaMedios | null> {
        const [row] = await db
            .select()
            .from(agenciasMedios)
            .where(eq(agenciasMedios.id, id))
            .limit(1)

        if (!row) return null

        return this.rowToEntity(row)
    }

    async findByRut(rut: string, tenantId: string): Promise<AgenciaMedios | null> {
        const [row] = await db
            .select()
            .from(agenciasMedios)
            .where(
                and(
                    eq(agenciasMedios.rut, rut),
                    eq(agenciasMedios.tenantId, tenantId)
                )
            )
            .limit(1)

        if (!row) return null

        return this.rowToEntity(row)
    }

    async findByCodigo(codigo: string, tenantId: string): Promise<AgenciaMedios | null> {
        const [row] = await db
            .select()
            .from(agenciasMedios)
            .where(
                and(
                    eq(agenciasMedios.codigo, codigo),
                    eq(agenciasMedios.tenantId, tenantId)
                )
            )
            .limit(1)

        if (!row) return null

        return this.rowToEntity(row)
    }

    async findAll(
        filtros: AgenciaMediosFilters,
        ordenamiento?: Ordenamiento,
        limite: number = 20,
        offset: number = 0
    ): Promise<{ agencias: AgenciaMedios[]; total: number; metricas: { totalAgencias: number; agenciasActivas: number; scorePromedio: number; revenueTotal: number } }> {
        return withTenantContext(filtros.tenantId || '', async () => {
            const conditions: any[] = []

            if (filtros.tenantId) conditions.push(eq(agenciasMedios.tenantId, filtros.tenantId))
            if (filtros.activa !== undefined) conditions.push(eq(agenciasMedios.activa, filtros.activa))
            if (filtros.tipoAgencia) conditions.push(eq(agenciasMedios.tipoAgencia, filtros.tipoAgencia as any))
            if (filtros.nivelColaboracion) conditions.push(eq(agenciasMedios.nivelColaboracion, filtros.nivelColaboracion as any))
            if (filtros.ciudad) conditions.push(eq(agenciasMedios.ciudad, filtros.ciudad))
            if (filtros.pais) conditions.push(eq(agenciasMedios.pais, filtros.pais))

            if (filtros.busqueda) {
                conditions.push(
                    or(
                        ilike(agenciasMedios.nombreRazonSocial, `%${filtros.busqueda}%`),
                        ilike(agenciasMedios.nombreComercial, `%${filtros.busqueda}%`),
                        ilike(agenciasMedios.codigo, `%${filtros.busqueda}%`)
                    )
                )
            }

            let query = db.select().from(agenciasMedios).where(and(...conditions))

            if (ordenamiento) {
                const orderCol = ordenamiento.campo === 'nombre'
                    ? agenciasMedios.nombreRazonSocial
                    : ordenamiento.campo === 'fechaCreacion'
                        ? agenciasMedios.fechaCreacion
                        : ordenamiento.campo === 'scorePartnership'
                            ? agenciasMedios.scorePartnership
                            : agenciasMedios.revenueAnual

                query = query.orderBy(ordenamiento.direccion === 'asc' ? asc(orderCol) : desc(orderCol)) as any
            }

            query = query.limit(limite).offset(offset) as any

            const rows = await query

            const [{ total }] = await db
                .select({ total: count() })
                .from(agenciasMedios)
                .where(and(...conditions))

            const [{ total: totalActivas }] = await db
                .select({ total: count() })
                .from(agenciasMedios)
                .where(and(...conditions, eq(agenciasMedios.activa, true)))

            const [{ avg: avgScore }] = await db
                .select({ avg: sql`AVG(${agenciasMedios.scorePartnership})` })
                .from(agenciasMedios)
                .where(and(...conditions))

            const [{ sum: sumRevenue }] = await db
                .select({ sum: sql`COALESCE(SUM(${agenciasMedios.revenueAnual}), 0)` })
                .from(agenciasMedios)
                .where(and(...conditions))

            return {
                agencias: rows.map(row => this.rowToEntity(row)),
                total: Number(total),
                metricas: {
                    totalAgencias: Number(total),
                    agenciasActivas: Number(totalActivas),
                    scorePromedio: Number(avgScore) || 500,
                    revenueTotal: Number(sumRevenue)
                }
            }
        })
    }

    async findAllActive(tenantId: string): Promise<AgenciaMedios[]> {
        const rows = await db
            .select()
            .from(agenciasMedios)
            .where(
                and(
                    eq(agenciasMedios.tenantId, tenantId),
                    eq(agenciasMedios.activa, true)
                )
            )
            .orderBy(desc(agenciasMedios.fechaCreacion))

        return rows.map(row => this.rowToEntity(row))
    }

    async findByTipo(tipo: string, tenantId: string): Promise<AgenciaMedios[]> {
        const rows = await db
            .select()
            .from(agenciasMedios)
            .where(
                and(
                    eq(agenciasMedios.tenantId, tenantId),
                    eq(agenciasMedios.tipoAgencia, tipo as any)
                )
            )

        return rows.map(row => this.rowToEntity(row))
    }

    async findByNivel(nivel: string, tenantId: string): Promise<AgenciaMedios[]> {
        const rows = await db
            .select()
            .from(agenciasMedios)
            .where(
                and(
                    eq(agenciasMedios.tenantId, tenantId),
                    eq(agenciasMedios.nivelColaboracion, nivel as any)
                )
            )

        return rows.map(row => this.rowToEntity(row))
    }

    async findPremiumAgencies(tenantId: string, minScore: number = 750): Promise<AgenciaMedios[]> {
        const rows = await db
            .select()
            .from(agenciasMedios)
            .where(
                and(
                    eq(agenciasMedios.tenantId, tenantId),
                    gte(agenciasMedios.scorePartnership, String(minScore)),
                    eq(agenciasMedios.activa, true)
                )
            )
            .orderBy(desc(agenciasMedios.scorePartnership))

        return rows.map(row => this.rowToEntity(row))
    }

    async findAgenciesNeedingAttention(tenantId: string): Promise<AgenciaMedios[]> {
        const rows = await db
            .select()
            .from(agenciasMedios)
            .where(
                and(
                    eq(agenciasMedios.tenantId, tenantId),
                    lte(agenciasMedios.scorePartnership, '450'),
                    eq(agenciasMedios.activa, true)
                )
            )
            .orderBy(asc(agenciasMedios.scorePartnership))

        return rows.map(row => this.rowToEntity(row))
    }

    async getPortfolioStats(tenantId: string): Promise<{
        totalAgencias: number
        agenciasActivas: number
        scorePromedio: number
        distribucionTipos: Record<string, number>
        distribucionNiveles: Record<string, number>
        revenueTotal: number
        comisionPromedio: number
    }> {
        const [{ total }] = await db
            .select({ total: count() })
            .from(agenciasMedios)
            .where(eq(agenciasMedios.tenantId, tenantId))

        const [{ count: activas }] = await db
            .select({ count: count() })
            .from(agenciasMedios)
            .where(and(eq(agenciasMedios.tenantId, tenantId), eq(agenciasMedios.activa, true)))

        const [{ avg: avgScore }] = await db
            .select({ avg: sql`AVG(${agenciasMedios.scorePartnership})` })
            .from(agenciasMedios)
            .where(eq(agenciasMedios.tenantId, tenantId))

        const tipos = await db
            .select({
                tipo: agenciasMedios.tipoAgencia,
                count: count()
            })
            .from(agenciasMedios)
            .where(eq(agenciasMedios.tenantId, tenantId))
            .groupBy(agenciasMedios.tipoAgencia)

        const niveles = await db
            .select({
                nivel: agenciasMedios.nivelColaboracion,
                count: count()
            })
            .from(agenciasMedios)
            .where(eq(agenciasMedios.tenantId, tenantId))
            .groupBy(agenciasMedios.nivelColaboracion)

        const [{ sum: revenue }] = await db
            .select({ sum: sql`COALESCE(SUM(${agenciasMedios.revenueAnual}), 0)` })
            .from(agenciasMedios)
            .where(eq(agenciasMedios.tenantId, tenantId))

        const [{ avg: comision }] = await db
            .select({ avg: sql`AVG(${agenciasMedios.comisionPorcentaje})` })
            .from(agenciasMedios)
            .where(and(eq(agenciasMedios.tenantId, tenantId), sql`${agenciasMedios.comisionPorcentaje} IS NOT NULL`))

        return {
            totalAgencias: Number(total),
            agenciasActivas: Number(activas),
            scorePromedio: Number(avgScore) || 500,
            distribucionTipos: Object.fromEntries(tipos.map(t => [t.tipo, Number(t.count)])),
            distribucionNiveles: Object.fromEntries(niveles.map(n => [n.nivel, Number(n.count)])),
            revenueTotal: Number(revenue),
            comisionPromedio: Number(comision) || 0
        }
    }

    async getTopPerformers(limite: number, tenantId: string): Promise<AgenciaMedios[]> {
        const rows = await db
            .select()
            .from(agenciasMedios)
            .where(
                and(
                    eq(agenciasMedios.tenantId, tenantId),
                    eq(agenciasMedios.activa, true)
                )
            )
            .orderBy(desc(agenciasMedios.scorePartnership))
            .limit(limite)

        return rows.map(row => this.rowToEntity(row))
    }

    async findSimilar(agenciaId: string, limite: number, tenantId: string): Promise<AgenciaMedios[]> {
        const agencia = await this.findById(agenciaId)
        if (!agencia) return []

        const rows = await db
            .select()
            .from(agenciasMedios)
            .where(
                and(
                    eq(agenciasMedios.tenantId, tenantId),
                    eq(agenciasMedios.tipoAgencia, agencia.tipoAgencia.value as any),
                    sql`${agenciasMedios.id} != ${agenciaId}`
                )
            )
            .limit(limite)

        return rows.map(row => this.rowToEntity(row))
    }

    async findByVertical(vertical: string, tenantId: string): Promise<AgenciaMedios[]> {
        const rows = await db
            .select()
            .from(agenciasMedios)
            .where(
                and(
                    eq(agenciasMedios.tenantId, tenantId),
                    ilike(agenciasMedios.especializacionesVerticales, `%${vertical}%`)
                )
            )

        return rows.map(row => this.rowToEntity(row))
    }

    async findByCertificacion(certificacion: string, tenantId: string): Promise<AgenciaMedios[]> {
        const rows = await db
            .select()
            .from(agenciasMedios)
            .where(
                and(
                    eq(agenciasMedios.tenantId, tenantId),
                    ilike(agenciasMedios.certificaciones, `%${certificacion}%`)
                )
            )

        return rows.map(row => this.rowToEntity(row))
    }

    async existsByRut(rut: string, tenantId: string): Promise<boolean> {
        const [row] = await db
            .select({ id: agenciasMedios.id })
            .from(agenciasMedios)
            .where(
                and(
                    eq(agenciasMedios.rut, rut),
                    eq(agenciasMedios.tenantId, tenantId)
                )
            )
            .limit(1)

        return !!row
    }

    async delete(id: string, tenantId: string): Promise<void> {
        await db
            .update(agenciasMedios)
            .set({
                activa: false,
                estado: 'inactiva',
                fechaModificacion: new Date()
            })
            .where(
                and(
                    eq(agenciasMedios.id, id),
                    eq(agenciasMedios.tenantId, tenantId)
                )
            )
    }

    // === Métodos privados ===

    private rowToEntity(row: any): AgenciaMedios {
        return AgenciaMedios.fromPersistence(row)
    }
}

/**
 * Implementación del repositorio de contactos
 */
export class DrizzleContactoAgenciaRepository implements IContactoAgenciaRepository {
    async save(contacto: ContactoAgencia): Promise<void> {
        await withTenantContext(contacto.tenantId, async () => {
            const existing = await db
                .select({ id: contactosAgencia.id })
                .from(contactosAgencia)
                .where(eq(contactosAgencia.id, contacto.id))
                .limit(1)

            if (existing.length > 0) {
                await db
                    .update(contactosAgencia)
                    .set({
                        nombre: contacto.nombre,
                        apellido: contacto.apellido,
                        email: contacto.email,
                        telefono: contacto.telefono,
                        telefonoMovil: contacto.telefonoMovil,
                        cargo: contacto.cargo,
                        departamento: contacto.departamento,
                        rol: contacto.rol,
                        nivelDecision: contacto.nivelDecision,
                        esPrincipal: contacto.esPrincipal,
                        esDecisor: contacto.esDecisor,
                        esInfluencer: contacto.esInfluencer,
                        linkedIn: contacto.linkedIn,
                        notas: contacto.notas,
                        activo: contacto.activa,
                        fechaModificacion: new Date()
                    })
                    .where(eq(contactosAgencia.id, contacto.id))
            } else {
                await db.insert(contactosAgencia).values({
                    tenantId: contacto.tenantId,
                    agenciaId: contacto.agenciaId,
                    nombre: contacto.nombre,
                    apellido: contacto.apellido,
                    email: contacto.email,
                    telefono: contacto.telefono,
                    telefonoMovil: contacto.telefonoMovil,
                    cargo: contacto.cargo,
                    departamento: contacto.departamento,
                    rol: contacto.rol,
                    nivelDecision: contacto.nivelDecision,
                    esPrincipal: contacto.esPrincipal,
                    esDecisor: contacto.esDecisor,
                    esInfluencer: contacto.esInfluencer,
                    linkedIn: contacto.linkedIn,
                    activo: contacto.activa,
                    fechaCreacion: contacto.fechaCreacion
                })
            }
        })
    }

    async findById(id: string): Promise<ContactoAgencia | null> {
        const [row] = await db
            .select()
            .from(contactosAgencia)
            .where(eq(contactosAgencia.id, id))
            .limit(1)

        if (!row) return null

        return ContactoAgencia.fromPersistence(row)
    }

    async findByAgenciaId(agenciaId: string, activosSolo: boolean = true): Promise<ContactoAgencia[]> {
        const conditions = [eq(contactosAgencia.agenciaId, agenciaId)]
        if (activosSolo) {
            conditions.push(eq(contactosAgencia.activo, true))
        }

        const rows = await db
            .select()
            .from(contactosAgencia)
            .where(and(...conditions))

        return rows.map(row => ContactoAgencia.fromPersistence(row))
    }

    async findPrincipalByAgenciaId(agenciaId: string): Promise<ContactoAgencia | null> {
        const [row] = await db
            .select()
            .from(contactosAgencia)
            .where(
                and(
                    eq(contactosAgencia.agenciaId, agenciaId),
                    eq(contactosAgencia.esPrincipal, true),
                    eq(contactosAgencia.activo, true)
                )
            )
            .limit(1)

        if (!row) return null

        return ContactoAgencia.fromPersistence(row)
    }

    async findByRol(agenciaId: string, rol: any): Promise<ContactoAgencia[]> {
        const rows = await db
            .select()
            .from(contactosAgencia)
            .where(
                and(
                    eq(contactosAgencia.agenciaId, agenciaId),
                    eq(contactosAgencia.rol, rol),
                    eq(contactosAgencia.activo, true)
                )
            )

        return rows.map(row => ContactoAgencia.fromPersistence(row))
    }

    async findActiveByAgenciaId(agenciaId: string): Promise<ContactoAgencia[]> {
        return this.findByAgenciaId(agenciaId, true)
    }

    async findAll(filtros: ContactoAgenciaFilters, limite?: number, offset?: number): Promise<{ contactos: ContactoAgencia[]; total: number }> {
        const conditions: any[] = []

        if (filtros.agenciaId) conditions.push(eq(contactosAgencia.agenciaId, filtros.agenciaId))
        if (filtros.tenantId) conditions.push(eq(contactosAgencia.tenantId, filtros.tenantId))
        if (filtros.rol) conditions.push(eq(contactosAgencia.rol, filtros.rol))
        if (filtros.esPrincipal !== undefined) conditions.push(eq(contactosAgencia.esPrincipal, filtros.esPrincipal))
        if (filtros.esDecisor !== undefined) conditions.push(eq(contactosAgencia.esDecisor, filtros.esDecisor))
        if (filtros.activa !== undefined) conditions.push(eq(contactosAgencia.activo, filtros.activa))

        let query = db.select().from(contactosAgencia).where(and(...conditions))

        if (limite) query = query.limit(limite) as any
        if (offset) query = query.offset(offset) as any

        const rows = await query

        const [{ total }] = await db
            .select({ total: count() })
            .from(contactosAgencia)
            .where(and(...conditions))

        return {
            contactos: rows.map(row => ContactoAgencia.fromPersistence(row)),
            total: Number(total)
        }
    }

    async countByAgenciaId(agenciaId: string): Promise<number> {
        const [{ count: totalCount }] = await db
            .select({ count: count() })
            .from(contactosAgencia)
            .where(
                and(
                    eq(contactosAgencia.agenciaId, agenciaId),
                    eq(contactosAgencia.activo, true)
                )
            )

        return Number(totalCount)
    }

    async findHighImpactByAgenciaId(agenciaId: string): Promise<ContactoAgencia[]> {
        const rows = await db
            .select()
            .from(contactosAgencia)
            .where(
                and(
                    eq(contactosAgencia.agenciaId, agenciaId),
                    eq(contactosAgencia.esDecisor, true),
                    eq(contactosAgencia.activo, true)
                )
            )

        return rows.map(row => ContactoAgencia.fromPersistence(row))
    }

    async existsByEmail(email: string, agenciaId: string): Promise<boolean> {
        const [row] = await db
            .select({ id: contactosAgencia.id })
            .from(contactosAgencia)
            .where(
                and(
                    eq(contactosAgencia.email, email),
                    eq(contactosAgencia.agenciaId, agenciaId)
                )
            )
            .limit(1)

        return !!row
    }

    async delete(id: string): Promise<void> {
        await db
            .update(contactosAgencia)
            .set({ activo: false, fechaModificacion: new Date() })
            .where(eq(contactosAgencia.id, id))
    }
}
