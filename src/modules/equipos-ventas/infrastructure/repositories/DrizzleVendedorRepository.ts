/**
 * 👥 SILEXAR PULSE - Drizzle Repository Vendedores
 * 
 * @description Implementación del repositorio de vendedores usando Drizzle ORM
 * Sigue el patrón Repository con soporte completo para multi-tenancy
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { eq, and, or, ilike, desc, asc, count } from 'drizzle-orm';
import { getDB } from '@/lib/db';
import { withTenantContext } from '@/lib/db/tenant-context';
import { vendedores, equiposVentas, metasVentas, tipoComisionEnum } from '@/lib/db/equipos-ventas-schema';
import type { IVendedorRepository, VendedorFilters, VendedorSortOptions } from '../../domain/repositories/IVendedorRepository';
import type { VendedorSelect } from '@/lib/db/equipos-ventas-schema';

// ═══════════════════════════════════════════════════════════════
// IMPLEMENTACIÓN DEL REPOSITORIO
// ═══════════════════════════════════════════════════════════════

export class DrizzleVendedorRepository implements IVendedorRepository {

    /**
     * Busca un vendedor por ID y tenant
     */
    async findById(id: string, tenantId: string): Promise<VendedorSelect | null> {
        return withTenantContext(tenantId, async () => {
            const db = getDB();
            const [result] = await db
                .select()
                .from(vendedores)
                .where(and(
                    eq(vendedores.id, id),
                    eq(vendedores.tenantId, tenantId),
                    eq(vendedores.eliminado, false)
                ))
                .limit(1);
            return result || null;
        });
    }

    /**
     * Busca un vendedor por email dentro de un tenant
     */
    async findByEmail(email: string, tenantId: string): Promise<VendedorSelect | null> {
        return withTenantContext(tenantId, async () => {
            const db = getDB();
            const [result] = await db
                .select()
                .from(vendedores)
                .where(and(
                    ilike(vendedores.email, email),
                    eq(vendedores.tenantId, tenantId),
                    eq(vendedores.eliminado, false)
                ))
                .limit(1);
            return result || null;
        });
    }

    /**
     * Obtiene todos los vendedores de un tenant con filtros opcionales
     */
    async findAll(
        tenantId: string,
        filters?: VendedorFilters,
        sort?: VendedorSortOptions,
        limit: number = 100,
        offset: number = 0
    ): Promise<VendedorSelect[]> {
        return withTenantContext(tenantId, async () => {
            const db = getDB();

            // Construir condiciones base
            const conditions = [eq(vendedores.tenantId, tenantId), eq(vendedores.eliminado, false)];

            if (filters?.estado) {
                conditions.push(eq(vendedores.estado, filters.estado as 'activo' | 'inactivo' | 'vacaciones' | 'licencia'));
            }

            if (filters?.equipoId) {
                conditions.push(eq(vendedores.equipoId, filters.equipoId));
            }

            if (filters?.tipoComision) {
                conditions.push(eq(vendedores.tipoComision, filters.tipoComision as 'porcentaje' | 'escalonada' | 'fija'));
            }

            if (filters?.search) {
                const searchPattern = `%${filters.search}%`;
                conditions.push(
                    or(
                        ilike(vendedores.nombre, searchPattern),
                        ilike(vendedores.apellido, searchPattern),
                        ilike(vendedores.email, searchPattern),
                        ilike(vendedores.codigo, searchPattern)
                    ) as ReturnType<typeof eq>
                );
            }

            // Determinar orden
            const orderField = sort?.field === 'nombre' ? vendedores.nombre
                : sort?.field === 'ventasAcumuladas' ? vendedores.ventasAcumuladas
                    : sort?.field === 'rankingActual' ? vendedores.rankingActual
                        : sort?.field === 'fechaIngreso' ? vendedores.fechaIngreso
                            : vendedores.fechaCreacion;

            const orderDirection = sort?.direction === 'desc' ? desc : asc;

            const results = await db
                .select()
                .from(vendedores)
                .where(and(...conditions))
                .orderBy(orderDirection === desc ? desc(orderField) : orderField)
                .limit(limit)
                .offset(offset);

            return results;
        });
    }

    /**
     * Cuenta el total de vendedores que coinciden con los filtros
     */
    async count(tenantId: string, filters?: VendedorFilters): Promise<number> {
        return withTenantContext(tenantId, async () => {
            const db = getDB();

            const conditions = [eq(vendedores.tenantId, tenantId), eq(vendedores.eliminado, false)];

            if (filters?.estado) {
                conditions.push(eq(vendedores.estado, filters.estado as 'activo' | 'inactivo' | 'vacaciones' | 'licencia'));
            }

            if (filters?.search) {
                const searchPattern = `%${filters.search}%`;
                conditions.push(
                    or(
                        ilike(vendedores.nombre, searchPattern),
                        ilike(vendedores.apellido, searchPattern),
                        ilike(vendedores.email, searchPattern)
                    ) as ReturnType<typeof eq>
                );
            }

            const [{ total }] = await db
                .select({ total: count() })
                .from(vendedores)
                .where(and(...conditions));

            return Number(total);
        });
    }

    /**
     * Crea un nuevo vendedor
     */
    async create(data: VendedorInsert): Promise<VendedorSelect> {
        return withTenantContext(data.tenantId, async () => {
            const db = getDB();
            const id = crypto.randomUUID();
            const now = new Date();

            const [result] = await db
                .insert(vendedores)
                .values({
                    ...data,
                    id,
                    fechaCreacion: now
                })
                .returning();

            return result;
        });
    }

    /**
     * Actualiza un vendedor existente
     */
    async update(id: string, tenantId: string, data: Partial<VendedorSelect>): Promise<VendedorSelect | null> {
        return withTenantContext(tenantId, async () => {
            const db = getDB();

            const [result] = await db
                .update(vendedores)
                .set({
                    ...data,
                    modificadoPorId: data.modificadoPorId,
                    fechaModificacion: new Date()
                })
                .where(and(
                    eq(vendedores.id, id),
                    eq(vendedores.tenantId, tenantId),
                    eq(vendedores.eliminado, false)
                ))
                .returning();

            return result || null;
        });
    }

    /**
     * Eliminación lógica (soft delete)
     */
    async softDelete(id: string, tenantId: string, userId: string): Promise<void> {
        return withTenantContext(tenantId, async () => {
            const db = getDB();

            await db
                .update(vendedores)
                .set({
                    eliminado: true,
                    modificadoPorId: userId,
                    fechaModificacion: new Date(),
                    estado: 'inactivo'
                })
                .where(and(
                    eq(vendedores.id, id),
                    eq(vendedores.tenantId, tenantId)
                ));
        });
    }

    /**
     * Verifica si existe un email en el tenant
     */
    async existsByEmail(email: string, tenantId: string, excludeId?: string): Promise<boolean> {
        return withTenantContext(tenantId, async () => {
            const db = getDB();

            const conditions = [
                ilike(vendedores.email, email),
                eq(vendedores.tenantId, tenantId),
                eq(vendedores.eliminado, false)
            ];

            if (excludeId) {
                conditions.push(eq(vendedores.id, excludeId) as ReturnType<typeof eq>);
            }

            const [{ total }] = await db
                .select({ total: count() })
                .from(vendedores)
                .where(and(...conditions))
                .limit(1);

            return Number(total) > 0;
        });
    }

    /**
     * Genera el siguiente código secuencial para un vendedor
     */
    async generateCode(tenantId: string): Promise<string> {
        return withTenantContext(tenantId, async () => {
            const db = getDB();

            const [{ total }] = await db
                .select({ total: count() })
                .from(vendedores)
                .where(and(
                    eq(vendedores.tenantId, tenantId),
                    eq(vendedores.eliminado, false)
                ));

            return `VEN-${(Number(total) + 1).toString().padStart(4, '0')}`;
        });
    }

    /**
     * Obtiene los vendedores de un equipo
     */
    async findByEquipo(equipoId: string, tenantId: string): Promise<VendedorSelect[]> {
        return withTenantContext(tenantId, async () => {
            const db = getDB();

            const results = await db
                .select()
                .from(vendedores)
                .where(and(
                    eq(vendedores.equipoId, equipoId),
                    eq(vendedores.tenantId, tenantId),
                    eq(vendedores.eliminado, false),
                    eq(vendedores.estado, 'activo')
                ))
                .orderBy(asc(vendedores.nombre));

            return results;
        });
    }

    /**
     * Actualiza el ranking de vendedores basado en ventas
     */
    async actualizarRankings(tenantId: string): Promise<void> {
        return withTenantContext(tenantId, async () => {
            const db = getDB();

            // Obtener todos los vendedores ordenados por ventas
            const vendedoresOrdenados = await db
                .select()
                .from(vendedores)
                .where(and(
                    eq(vendedores.tenantId, tenantId),
                    eq(vendedores.eliminado, false)
                ))
                .orderBy(desc(vendedores.ventasAcumuladas));

            // Actualizar ranking para cada vendedor
            for (let i = 0; i < vendedoresOrdenados.length; i++) {
                await db
                    .update(vendedores)
                    .set({
                        rankingActual: i + 1,
                        fechaModificacion: new Date()
                    })
                    .where(eq(vendedores.id, vendedoresOrdenados[i].id));
            }
        });
    }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTACIÓN POR DEFECTO
// ═══════════════════════════════════════════════════════════════

export default DrizzleVendedorRepository;═

export default DrizzleVendedorRepository;