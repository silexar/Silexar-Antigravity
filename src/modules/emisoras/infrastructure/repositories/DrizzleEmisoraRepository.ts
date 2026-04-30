/**
 * 🌐 SILEXAR PULSE - Drizzle Repository Emisoras
 * 
 * @description Implementación del repositorio de emisoras usando Drizzle ORM
 * Sigue el patrón Repository con soporte completo para multi-tenancy
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { eq, and, or, ilike, desc, asc, count } from 'drizzle-orm';
import { getDB } from '@/lib/db';
import { withTenantContext } from '@/lib/db/tenant-context';
import { emisoras } from '@/lib/db/emisoras-schema';
import type { IEmisoraRepository, EmisoraFilters, EmisoraSortOptions } from '../../domain/repositories/IEmisoraRepository';
import type { Emisora, NewEmisora } from '@/lib/db/emisoras-schema';

// ═══════════════════════════════════════════════════════════════
// IMPLEMENTACIÓN DEL REPOSITORIO
// ═══════════════════════════════════════════════════════════════

export class DrizzleEmisoraRepository implements IEmisoraRepository {

    /**
     * Busca una emisora por ID y tenant
     */
    async findById(id: string, tenantId: string): Promise<Emisora | null> {
        return withTenantContext(tenantId, async () => {
            const db = getDB();
            const [result] = await db
                .select()
                .from(emisoras)
                .where(and(
                    eq(emisoras.id, id),
                    eq(emisoras.tenantId, tenantId)
                ))
                .limit(1);
            return result || null;
        });
    }

    /**
     * Busca una emisora por código dentro de un tenant
     */
    async findByCodigo(codigo: string, tenantId: string): Promise<Emisora | null> {
        return withTenantContext(tenantId, async () => {
            const db = getDB();
            const [result] = await db
                .select()
                .from(emisoras)
                .where(and(
                    eq(emisoras.codigo, codigo),
                    eq(emisoras.tenantId, tenantId)
                ))
                .limit(1);
            return result || null;
        });
    }

    /**
     * Obtiene todas las emisoras de un tenant con filtros opcionales
     */
    async findAll(
        tenantId: string,
        filters?: EmisoraFilters,
        sort?: EmisoraSortOptions,
        limit: number = 100,
        offset: number = 0
    ): Promise<Emisora[]> {
        return withTenantContext(tenantId, async () => {
            const db = getDB();

            // Construir condiciones base
            const conditions = [eq(emisoras.tenantId, tenantId)];

            if (filters?.estado) {
                conditions.push(eq(emisoras.estado, filters.estado as 'activa' | 'inactiva' | 'mantenimiento' | 'pruebas'));
            }

            if (filters?.ciudad) {
                conditions.push(eq(emisoras.ciudad, filters.ciudad));
            }

            if (filters?.tipoFrecuencia) {
                conditions.push(eq(emisoras.tipoFrecuencia, filters.tipoFrecuencia as 'fm' | 'am' | 'dab' | 'online'));
            }

            if (filters?.search) {
                const searchPattern = `%${filters.search}%`;
                conditions.push(
                    or(
                        ilike(emisoras.nombre, searchPattern),
                        ilike(emisoras.codigo, searchPattern),
                        ilike(emisoras.frecuencia, searchPattern)
                    ) as ReturnType<typeof eq>
                );
            }

            // Determinar orden
            const orderField = sort?.field === 'nombre' ? emisoras.nombre
                : sort?.field === 'frecuencia' ? emisoras.frecuencia
                    : sort?.field === 'ciudad' ? emisoras.ciudad
                        : sort?.field === 'fechaCreacion' ? emisoras.fechaCreacion
                            : emisoras.nombre;

            const orderDirection = sort?.direction === 'desc' ? desc : asc;

            const results = await db
                .select()
                .from(emisoras)
                .where(and(...conditions))
                .orderBy(orderDirection === desc ? desc(orderField) : orderField)
                .limit(limit)
                .offset(offset);

            return results;
        });
    }

    /**
     * Cuenta el total de emisoras que coinciden con los filtros
     */
    async count(tenantId: string, filters?: EmisoraFilters): Promise<number> {
        return withTenantContext(tenantId, async () => {
            const db = getDB();

            const conditions = [eq(emisoras.tenantId, tenantId)];

            if (filters?.search) {
                const searchPattern = `%${filters.search}%`;
                conditions.push(
                    or(
                        ilike(emisoras.nombre, searchPattern),
                        ilike(emisoras.codigo, searchPattern)
                    ) as ReturnType<typeof eq>
                );
            }

            if (filters?.ciudad) {
                conditions.push(eq(emisoras.ciudad, filters.ciudad));
            }

            const [{ total }] = await db
                .select({ total: count() })
                .from(emisoras)
                .where(and(...conditions));

            return Number(total);
        });
    }

    /**
     * Crea una nueva emisora
     */
    async create(data: NewEmisora): Promise<Emisora> {
        return withTenantContext(data.tenantId, async () => {
            const db = getDB();
            const id = crypto.randomUUID();
            const now = new Date();

            const [result] = await db
                .insert(emisoras)
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
     * Actualiza una emisora existente
     */
    async update(id: string, tenantId: string, data: Partial<Emisora>): Promise<Emisora | null> {
        return withTenantContext(tenantId, async () => {
            const db = getDB();

            const [result] = await db
                .update(emisoras)
                .set({
                    ...data,
                    modificadoPorId: data.modificadoPorId,
                    fechaModificacion: new Date()
                })
                .where(and(
                    eq(emisoras.id, id),
                    eq(emisoras.tenantId, tenantId)
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
                .update(emisoras)
                .set({
                    activa: false,
                    estado: 'inactiva',
                    modificadoPorId: userId,
                    fechaModificacion: new Date()
                })
                .where(and(
                    eq(emisoras.id, id),
                    eq(emisoras.tenantId, tenantId)
                ));
        });
    }

    /**
     * Verifica si existe una emisora con el mismo código en el tenant
     */
    async existsByCodigo(codigo: string, tenantId: string, excludeId?: string): Promise<boolean> {
        return withTenantContext(tenantId, async () => {
            const db = getDB();

            const conditions = [
                eq(emisoras.codigo, codigo),
                eq(emisoras.tenantId, tenantId)
            ];

            if (excludeId) {
                conditions.push(eq(emisoras.id, excludeId) as ReturnType<typeof eq>);
            }

            const [{ total }] = await db
                .select({ total: count() })
                .from(emisoras)
                .where(and(...conditions))
                .limit(1);

            return Number(total) > 0;
        });
    }

    /**
     * Genera el siguiente código secuencial para una emisora
     */
    async generateCode(tenantId: string): Promise<string> {
        return withTenantContext(tenantId, async () => {
            const db = getDB();

            const [{ total }] = await db
                .select({ total: count() })
                .from(emisoras)
                .where(eq(emisoras.tenantId, tenantId));

            return `EMI-${(Number(total) + 1).toString().padStart(4, '0')}`;
        });
    }

    /**
     * Obtiene emisoras por ciudad
     */
    async findByCiudad(ciudad: string, tenantId: string): Promise<Emisora[]> {
        return withTenantContext(tenantId, async () => {
            const db = getDB();

            const results = await db
                .select()
                .from(emisoras)
                .where(and(
                    eq(emisoras.ciudad, ciudad),
                    eq(emisoras.tenantId, tenantId),
                    eq(emisoras.activa, true)
                ))
                .orderBy(asc(emisoras.nombre));

            return results;
        });
    }

    /**
     * Obtiene emisoras activas
     */
    async findActive(tenantId: string): Promise<Emisora[]> {
        return withTenantContext(tenantId, async () => {
            const db = getDB();

            const results = await db
                .select()
                .from(emisoras)
                .where(and(
                    eq(emisoras.tenantId, tenantId),
                    eq(emisoras.activa, true),
                    eq(emisoras.estado, 'activa')
                ))
                .orderBy(asc(emisoras.nombre));

            return results;
        });
    }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTACIÓN POR DEFECTO
// ═══════════════════════════════════════════════════════════════

export default DrizzleEmisoraRepository;