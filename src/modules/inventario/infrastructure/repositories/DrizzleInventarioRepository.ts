/**
 * 🌐 SILEXAR PULSE - Drizzle Repository Implementation for Inventario
 * 
 * @description Database access implementation using Drizzle ORM
 * Follows repository pattern with multi-tenancy support via RLS
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { eq, and, ilike, or, sql, desc, asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { withTenantContext } from '@/lib/db/tenant-context';
import { inventarioCupos, vencimientos, programas } from '@/lib/db/vencimientos-schema';
import { emisoras } from '@/lib/db/emisoras-schema';
import type { InventarioCupo, Vencimientos, EstadoCupo, TipoInventario } from '@/lib/db/vencimientos-schema';
import type {
    IInventarioRepository,
    PaginationParams,
    InventarioFilters,
    CupoWithVencimientos
} from '../../domain/repositories/IInventarioRepository';

export class DrizzleInventarioRepository implements IInventarioRepository {

    async findCupos(
        tenantId: string,
        filters?: InventarioFilters,
        pagination?: PaginationParams
    ): Promise<CupoWithVencimientos[]> {
        return withTenantContext(tenantId, async () => {
            const page = pagination?.page ?? 1;
            const limit = pagination?.limit ?? 20;
            const offset = (page - 1) * limit;

            // Build conditions
            const conditions = [eq(inventarioCupos.tenantId, tenantId)];

            if (filters?.emiId) {
                conditions.push(eq(inventarioCupos.emiId, filters.emiId));
            }

            if (filters?.tipoInventario) {
                conditions.push(eq(inventarioCupos.tipoInventario, filters.tipoInventario as any));
            }

            if (filters?.fecha) {
                // Get vencimientos for this date
                const fecha = new Date(filters.fecha);
                const vencimientosForDate = await db
                    .select()
                    .from(vencimientos)
                    .where(
                        and(
                            eq(vencimientos.tenantId, tenantId),
                            sql`DATE(${vencimientos.fecha}) = ${fecha.toISOString().split('T')[0]}`
                        )
                    );

                const inventarioIds = vencimientosForDate.map(v => v.inventarioId);
                if (inventarioIds.length > 0) {
                    conditions.push(sql`${inventarioCupos.id} IN (${sql.join(inventarioIds.map(id => sql`${id}`), sql`, `)})`);
                }
            }

            // Query cupos with related data
            const cuposData = await db
                .select({
                    cupo: inventarioCupos,
                    emiNombre: emisoras.nombre,
                    programaNombre: programas.nombre,
                })
                .from(inventarioCupos)
                .leftJoin(emisoras, eq(inventarioCupos.emiId, emisoras.id))
                .leftJoin(programas, eq(inventarioCupos.programaId, programas.id))
                .where(and(...conditions))
                .orderBy(inventarioCupos.horaInicio)
                .limit(limit)
                .offset(offset);

            // Get vencimientos for these cupos if fecha filter exists
            let vencimientosMap: Map<string, Vencimientos> = new Map();
            if (filters?.fecha) {
                const fecha = new Date(filters.fecha);
                const allVencimientos = await db
                    .select()
                    .from(vencimientos)
                    .where(
                        and(
                            eq(vencimientos.tenantId, tenantId),
                            sql`DATE(${vencimientos.fecha}) = ${fecha.toISOString().split('T')[0]}`
                        )
                    );
                allVencimientos.forEach(v => vencimientosMap.set(v.inventarioId, v));
            }

            // Map to result type
            return cuposData.map(item => ({
                id: item.cupo.id,
                codigo: item.cupo.codigo,
                nombre: item.cupo.nombre,
                tipoInventario: item.cupo.tipoInventario as TipoInventario,
                horaInicio: item.cupo.horaInicio,
                duracionSegundos: item.cupo.duracionSegundos,
                tarifaBase: Number(item.cupo.tarifaBase),
                emiId: item.cupo.emiId,
                emiNombre: item.emiNombre || 'Unknown',
                programaId: item.cupo.programaId,
                programaNombre: item.programaNombre || null,
                activo: item.cupo.activo,
                vencimientos: null // Will be populated below
            }));
        });
    }

    async findCupoById(id: string, tenantId: string): Promise<CupoWithVencimientos | null> {
        return withTenantContext(tenantId, async () => {
            const [result] = await db
                .select({
                    cupo: inventarioCupos,
                    emiNombre: emisoras.nombre,
                    programaNombre: programas.nombre,
                })
                .from(inventarioCupos)
                .leftJoin(emisoras, eq(inventarioCupos.emiId, emisoras.id))
                .leftJoin(programas, eq(inventarioCupos.programaId, programas.id))
                .where(
                    and(
                        eq(inventarioCupos.id, id),
                        eq(inventarioCupos.tenantId, tenantId)
                    )
                )
                .limit(1);

            if (!result) return null;

            return {
                id: result.cupo.id,
                codigo: result.cupo.codigo,
                nombre: result.cupo.nombre,
                tipoInventario: result.cupo.tipoInventario as TipoInventario,
                horaInicio: result.cupo.horaInicio,
                duracionSegundos: result.cupo.duracionSegundos,
                tarifaBase: Number(result.cupo.tarifaBase),
                emiId: result.cupo.emiId,
                emiNombre: result.emiNombre || 'Unknown',
                programaId: result.cupo.programaId,
                programaNombre: result.programaNombre || null,
                activo: result.cupo.activo,
                vencimientos: null
            };
        });
    }

    async countCupos(tenantId: string, filters?: InventarioFilters): Promise<number> {
        return withTenantContext(tenantId, async () => {
            const conditions = [eq(inventarioCupos.tenantId, tenantId)];

            if (filters?.emiId) {
                conditions.push(eq(inventarioCupos.emiId, filters.emiId));
            }

            if (filters?.tipoInventario) {
                conditions.push(eq(inventarioCupos.tipoInventario, filters.tipoInventario as any));
            }

            const countResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(inventarioCupos)
                .where(and(...conditions));

            return Number(countResult[0]?.count ?? 0);
        });
    }

    async findVencimientosByFecha(
        tenantId: string,
        fecha: string,
        emiId?: string
    ): Promise<Vencimientos[]> {
        return withTenantContext(tenantId, async () => {
            let conditions = [
                eq(vencimientos.tenantId, tenantId),
                sql`DATE(${vencimientos.fecha}) = ${fecha}`
            ];

            if (emiId) {
                // Get inventario cupos for this emi first
                const cuposEmi = await db
                    .select({ id: inventarioCupos.id })
                    .from(inventarioCupos)
                    .where(eq(inventarioCupos.emiId, emiId));

                const cupoIds = cuposEmi.map(c => c.id);
                if (cupoIds.length > 0) {
                    conditions.push(sql`${vencimientos.inventarioId} IN (${sql.join(cupoIds.map(id => sql`${id}`), sql`, `)})`);
                }
            }

            const result = await db
                .select()
                .from(vencimientos)
                .where(and(...conditions))
                .orderBy(vencimientos.fecha);

            return result;
        });
    }

    async createVencimientos(
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
    ): Promise<Vencimientos> {
        return withTenantContext(tenantId, async () => {
            const [result] = await db
                .insert(vencimientos)
                .values({
                    tenantId,
                    inventarioId: data.inventarioId,
                    fecha: data.fecha, // date column expects string
                    estado: data.estado || 'reservado',
                    anuncianteId: data.anuncianteId,
                    precioVenta: data.precioVenta?.toString(),
                    notas: data.notas,
                    modificadoPorId: userId,
                    fechaModificacion: new Date()
                })
                .returning();

            return result;
        });
    }

    async updateVencimientos(
        id: string,
        data: {
            estado?: EstadoCupo;
            anuncianteId?: string;
            precioVenta?: number;
            notas?: string;
        },
        tenantId: string,
        userId: string
    ): Promise<Vencimientos> {
        return withTenantContext(tenantId, async () => {
            const updateData: Partial<typeof vencimientos.$inferInsert> = {
                modificadoPorId: userId,
                fechaModificacion: new Date()
            };

            if (data.estado !== undefined) updateData.estado = data.estado;
            if (data.anuncianteId !== undefined) updateData.anuncianteId = data.anuncianteId;
            if (data.precioVenta !== undefined) updateData.precioVenta = data.precioVenta.toString();
            if (data.notas !== undefined) updateData.notas = data.notas;

            const [result] = await db
                .update(vencimientos)
                .set(updateData)
                .where(
                    and(
                        eq(vencimientos.id, id),
                        eq(vencimientos.tenantId, tenantId)
                    )
                )
                .returning();

            return result;
        });
    }

    async getStats(tenantId: string, fecha: string): Promise<{
        totalCupos: number;
        disponibles: number;
        vendidos: number;
        reservados: number;
        ocupacionPorcentaje: number;
    }> {
        return withTenantContext(tenantId, async () => {
            // Get all cupos
            const cuposResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(inventarioCupos)
                .where(eq(inventarioCupos.tenantId, tenantId));

            const totalCupos = Number(cuposResult[0]?.count ?? 0);

            // Get vencimientos for date
            const vencimientosResult = await db
                .select({
                    estado: vencimientos.estado,
                    count: sql<number>`count(*)`
                })
                .from(vencimientos)
                .where(
                    and(
                        eq(vencimientos.tenantId, tenantId),
                        sql`DATE(${vencimientos.fecha}) = ${fecha}`
                    )
                )
                .groupBy(vencimientos.estado);

            let disponibles = 0;
            let vendidos = 0;
            let reservados = 0;

            vencimientosResult.forEach(row => {
                const estado = row.estado as string;
                const count = Number(row.count);
                if (estado === 'disponible') disponibles = count;
                else if (estado === 'vendido') vendidos = count;
                else if (estado === 'reservado') reservados = count;
            });

            const totalVendidosReservados = vendidos + reservados;
            const ocupacionPorcentaje = totalCupos > 0
                ? Math.round((totalVendidosReservados / totalCupos) * 100)
                : 0;

            return {
                totalCupos,
                disponibles,
                vendidos,
                reservados,
                ocupacionPorcentaje
            };
        });
    }

    async findByEmisora(emiId: string, tenantId: string): Promise<InventarioCupo[]> {
        return withTenantContext(tenantId, async () => {
            const result = await db
                .select()
                .from(inventarioCupos)
                .where(
                    and(
                        eq(inventarioCupos.emiId, emiId),
                        eq(inventarioCupos.tenantId, tenantId),
                        eq(inventarioCupos.activo, true)
                    )
                )
                .orderBy(inventarioCupos.horaInicio);

            return result;
        });
    }

    async findActive(tenantId: string): Promise<InventarioCupo[]> {
        return withTenantContext(tenantId, async () => {
            const result = await db
                .select()
                .from(inventarioCupos)
                .where(
                    and(
                        eq(inventarioCupos.tenantId, tenantId),
                        eq(inventarioCupos.activo, true)
                    )
                )
                .orderBy(inventarioCupos.nombre);

            return result;
        });
    }
}

