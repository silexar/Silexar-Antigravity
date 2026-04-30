/**
 * 🌐 SILEXAR PULSE - Drizzle Repository Implementation for Agencias de Medios
 * 
 * @description Database access implementation using Drizzle ORM
 * Follows repository pattern with multi-tenancy support via RLS
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { eq, and, or, like, ilike, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { withTenantContext } from '@/lib/db/tenant-context';
import { agenciasMedios } from '@/lib/db/agencias-medios-schema';
import type {
    AgenciaMedios,
    CreateAgenciaMediosDTO,
    UpdateAgenciaMediosDTO
} from '@/lib/db/agencias-medios-schema';
import type {
    IAgenciaMediosRepository,
    PaginationParams,
    BuscarAgenciasFilters
} from '../../domain/repositories/IAgenciaMediosRepository';

export class DrizzleAgenciaMediosRepository implements IAgenciaMediosRepository {

    async findById(id: string, tenantId: string): Promise<AgenciaMedios | null> {
        return withTenantContext(tenantId, async () => {
            const result = await db
                .select()
                .from(agenciasMedios)
                .where(
                    and(
                        eq(agenciasMedios.id, id),
                        eq(agenciasMedios.eliminado, false)
                    )
                )
                .limit(1);

            return result[0] || null;
        });
    }

    async findByCodigo(codigo: string, tenantId: string): Promise<AgenciaMedios | null> {
        return withTenantContext(tenantId, async () => {
            const result = await db
                .select()
                .from(agenciasMedios)
                .where(
                    and(
                        eq(agenciasMedios.codigo, codigo),
                        eq(agenciasMedios.eliminado, false)
                    )
                )
                .limit(1);

            return result[0] || null;
        });
    }

    async findAll(
        tenantId: string,
        filters?: BuscarAgenciasFilters,
        pagination?: PaginationParams
    ): Promise<AgenciaMedios[]> {
        return withTenantContext(tenantId, async () => {
            const page = pagination?.page ?? 1;
            const limit = pagination?.limit ?? 20;
            const offset = (page - 1) * limit;

            let conditions = [eq(agenciasMedios.eliminado, false)];

            if (filters?.search) {
                const searchLower = filters.search.toLowerCase();
                conditions.push(
                    or(
                        ilike(agenciasMedios.nombreRazonSocial, `%${searchLower}%`),
                        ilike(agenciasMedios.codigo, `%${searchLower}%`),
                        ilike(agenciasMedios.rut, `%${searchLower}%`),
                        ilike(agenciasMedios.nombreComercial, `%${searchLower}%`)
                    )!
                );
            }

            if (filters?.estado) {
                conditions.push(eq(agenciasMedios.estado, filters.estado as any));
            }

            if (filters?.tipoAgencia) {
                conditions.push(eq(agenciasMedios.tipoAgencia, filters.tipoAgencia as any));
            }

            if (filters?.ciudad) {
                conditions.push(ilike(agenciasMedios.ciudad, filters.ciudad));
            }

            const result = await db
                .select()
                .from(agenciasMedios)
                .where(and(...conditions))
                .orderBy(agenciasMedios.nombreRazonSocial)
                .limit(limit)
                .offset(offset);

            return result;
        });
    }

    async count(tenantId: string, filters?: BuscarAgenciasFilters): Promise<number> {
        return withTenantContext(tenantId, async () => {
            let conditions = [eq(agenciasMedios.eliminado, false)];

            if (filters?.search) {
                const searchLower = filters.search.toLowerCase();
                conditions.push(
                    or(
                        ilike(agenciasMedios.nombreRazonSocial, `%${searchLower}%`),
                        ilike(agenciasMedios.codigo, `%${searchLower}%`),
                        ilike(agenciasMedios.rut, `%${searchLower}%`),
                        ilike(agenciasMedios.nombreComercial, `%${searchLower}%`)
                    )!
                );
            }

            if (filters?.estado) {
                conditions.push(eq(agenciasMedios.estado, filters.estado as any));
            }

            if (filters?.tipoAgencia) {
                conditions.push(eq(agenciasMedios.tipoAgencia, filters.tipoAgencia as any));
            }

            if (filters?.ciudad) {
                conditions.push(ilike(agenciasMedios.ciudad, filters.ciudad));
            }

            const countResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(agenciasMedios)
                .where(and(...conditions));

            return Number(countResult[0]?.count ?? 0);
        });
    }

    async create(
        data: CreateAgenciaMediosDTO,
        tenantId: string,
        userId: string
    ): Promise<AgenciaMedios> {
        return withTenantContext(tenantId, async () => {
            const codigo = await this.generateCode(tenantId);

            const [result] = await db
                .insert(agenciasMedios)
                .values({
                    tenantId,
                    codigo,
                    rut: data.rut,
                    nombreRazonSocial: data.nombreRazonSocial,
                    nombreComercial: data.nombreComercial,
                    tipoAgencia: data.tipoAgencia ?? 'medios',
                    giroActividad: data.giroActividad,
                    direccion: data.direccion,
                    ciudad: data.ciudad,
                    comunaProvincia: data.comunaProvincia,
                    pais: data.pais ?? 'Chile',
                    emailContacto: data.emailContacto,
                    telefonoContacto: data.telefonoContacto,
                    paginaWeb: data.paginaWeb,
                    nombreEjecutivo: data.nombreEjecutivo,
                    emailEjecutivo: data.emailEjecutivo,
                    telefonoEjecutivo: data.telefonoEjecutivo,
                    comisionPorcentaje: data.comisionPorcentaje?.toString() ?? '15.00',
                    tipoComision: 'porcentaje',
                    estado: 'activa',
                    activa: true,
                    tieneFacturacionElectronica: data.tieneFacturacionElectronica ?? false,
                    diasCredito: data.diasCredito ?? '30',
                    emailFacturacion: data.emailFacturacion,
                    notas: data.notas,
                    creadoPorId: userId
                })
                .returning();

            return result;
        });
    }

    async update(
        id: string,
        data: UpdateAgenciaMediosDTO,
        tenantId: string,
        userId: string
    ): Promise<AgenciaMedios> {
        return withTenantContext(tenantId, async () => {
            const updateData: Partial<typeof agenciasMedios.$inferInsert> = {
                modificadoPorId: userId,
                fechaModificacion: new Date()
            };

            // Only update provided fields
            if (data.rut !== undefined) updateData.rut = data.rut;
            if (data.nombreRazonSocial !== undefined) updateData.nombreRazonSocial = data.nombreRazonSocial;
            if (data.nombreComercial !== undefined) updateData.nombreComercial = data.nombreComercial;
            if (data.tipoAgencia !== undefined) updateData.tipoAgencia = data.tipoAgencia;
            if (data.giroActividad !== undefined) updateData.giroActividad = data.giroActividad;
            if (data.direccion !== undefined) updateData.direccion = data.direccion;
            if (data.ciudad !== undefined) updateData.ciudad = data.ciudad;
            if (data.comunaProvincia !== undefined) updateData.comunaProvincia = data.comunaProvincia;
            if (data.pais !== undefined) updateData.pais = data.pais;
            if (data.emailContacto !== undefined) updateData.emailContacto = data.emailContacto;
            if (data.telefonoContacto !== undefined) updateData.telefonoContacto = data.telefonoContacto;
            if (data.paginaWeb !== undefined) updateData.paginaWeb = data.paginaWeb;
            if (data.nombreEjecutivo !== undefined) updateData.nombreEjecutivo = data.nombreEjecutivo;
            if (data.emailEjecutivo !== undefined) updateData.emailEjecutivo = data.emailEjecutivo;
            if (data.telefonoEjecutivo !== undefined) updateData.telefonoEjecutivo = data.telefonoEjecutivo;
            if (data.comisionPorcentaje !== undefined) updateData.comisionPorcentaje = data.comisionPorcentaje.toString();
            if (data.diasCredito !== undefined) updateData.diasCredito = data.diasCredito;
            if (data.tieneFacturacionElectronica !== undefined) updateData.tieneFacturacionElectronica = data.tieneFacturacionElectronica;
            if (data.emailFacturacion !== undefined) updateData.emailFacturacion = data.emailFacturacion;
            if (data.notas !== undefined) updateData.notas = data.notas;
            if (data.activa !== undefined) updateData.activa = data.activa;
            if (data.estado !== undefined) updateData.estado = data.estado;

            const [result] = await db
                .update(agenciasMedios)
                .set(updateData)
                .where(
                    and(
                        eq(agenciasMedios.id, id),
                        eq(agenciasMedios.tenantId, tenantId),
                        eq(agenciasMedios.eliminado, false)
                    )
                )
                .returning();

            return result;
        });
    }

    async softDelete(id: string, tenantId: string, userId: string): Promise<void> {
        return withTenantContext(tenantId, async () => {
            await db
                .update(agenciasMedios)
                .set({
                    eliminado: true,
                    fechaEliminacion: new Date(),
                    eliminadoPorId: userId,
                    activa: false,
                    estado: 'inactiva' as any
                })
                .where(
                    and(
                        eq(agenciasMedios.id, id),
                        eq(agenciasMedios.tenantId, tenantId),
                        eq(agenciasMedios.eliminado, false)
                    )
                );
        });
    }

    async existsByRut(rut: string, tenantId: string, excludeId?: string): Promise<boolean> {
        return withTenantContext(tenantId, async () => {
            let conditions = [
                eq(agenciasMedios.rut, rut),
                eq(agenciasMedios.eliminado, false)
            ];

            if (excludeId) {
                conditions.push(sql`${agenciasMedios.id} != ${excludeId}`);
            }

            const result = await db
                .select({ id: agenciasMedios.id })
                .from(agenciasMedios)
                .where(and(...conditions))
                .limit(1);

            return result.length > 0;
        });
    }

    async existsByCodigo(codigo: string, tenantId: string, excludeId?: string): Promise<boolean> {
        return withTenantContext(tenantId, async () => {
            let conditions = [
                eq(agenciasMedios.codigo, codigo),
                eq(agenciasMedios.eliminado, false)
            ];

            if (excludeId) {
                conditions.push(sql`${agenciasMedios.id} != ${excludeId}`);
            }

            const result = await db
                .select({ id: agenciasMedios.id })
                .from(agenciasMedios)
                .where(and(...conditions))
                .limit(1);

            return result.length > 0;
        });
    }

    async generateCode(tenantId: string): Promise<string> {
        return withTenantContext(tenantId, async () => {
            const year = new Date().getFullYear();
            const prefix = `AGM-${year}-`;

            // Get the highest sequence number for this year
            const result = await db
                .select({ codigo: agenciasMedios.codigo })
                .from(agenciasMedios)
                .where(
                    and(
                        like(agenciasMedios.codigo, `${prefix}%`),
                        eq(agenciasMedios.tenantId, tenantId)
                    )
                )
                .orderBy(sql`${agenciasMedios.codigo} desc`)
                .limit(1);

            let nextNum = 1;
            if (result.length > 0) {
                const lastCode = result[0].codigo;
                const match = lastCode?.match(/AGM-\d{4}-(\d+)/);
                if (match) {
                    nextNum = parseInt(match[1], 10) + 1;
                }
            }

            return `${prefix}${nextNum.toString().padStart(4, '0')}`;
        });
    }

    async findByCiudad(ciudad: string, tenantId: string): Promise<AgenciaMedios[]> {
        return withTenantContext(tenantId, async () => {
            const result = await db
                .select()
                .from(agenciasMedios)
                .where(
                    and(
                        ilike(agenciasMedios.ciudad, ciudad),
                        eq(agenciasMedios.eliminado, false)
                    )
                )
                .orderBy(agenciasMedios.nombreRazonSocial);

            return result;
        });
    }

    async findActive(tenantId: string): Promise<AgenciaMedios[]> {
        return withTenantContext(tenantId, async () => {
            const result = await db
                .select()
                .from(agenciasMedios)
                .where(
                    and(
                        eq(agenciasMedios.activa, true),
                        eq(agenciasMedios.eliminado, false)
                    )
                )
                .orderBy(agenciasMedios.nombreRazonSocial);

            return result;
        });
    }
}
