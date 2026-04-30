/**
 * Módulo de Configuración - Silexar Pulse
 * Infrastructure Layer - Drizzle Repository
 * 
 * Implementación del repositorio usando Drizzle ORM.
 * Maneja la persistencia de configuraciones y auditoría.
 */

import { eq, and, like, or, desc, asc, sql, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { withTenantContext } from '@/lib/db/tenant-context';
import { logger } from '@/lib/observability';
import {
    configuraciones,
    configuracionesAuditoria,
    configuracionesGrupos,
    configuracionesFavoritas,
    type ConfiguracionRow,
    type NewConfiguracionRow,
    type ConfiguracionAuditoriaRow,
    type NewConfiguracionAuditoriaRow,
} from '@/lib/db/configuracion-schema';
import type { IConfiguracionRepository, IAuditoriaRepository, ListarOpciones, ConfiguracionFiltros } from '@/modules/configuracion/domain/repositories';
import { Configuracion, ConfiguracionFactory } from '@/modules/configuracion/domain/entities';
import { TipoConfiguracion, CategoriaConfiguracion, NivelSeguridad } from '@/modules/configuracion/domain/value-objects';
import { RegistroAuditoria } from '@/modules/configuracion/domain/value-objects';

/**
 * Implementación del repositorio de configuraciones
 */
export class ConfiguracionDrizzleRepository implements IConfiguracionRepository {
    /**
     * Convierte una fila de BD a entidad de dominio
     */
    private toDomain(row: ConfiguracionRow): Configuracion {
        return Configuracion.reconstituir({
            id: row.id,
            tenantId: row.tenantId,
            clave: row.clave,
            valor: row.valor,
            tipo: row.tipo,
            categoria: row.categoria,
            descripcion: row.descripcion ?? undefined,
            editable: row.editable,
            visible: row.visible,
            nivelSeguridad: row.nivelSeguridad,
            grupo: row.grupo ?? undefined,
            orden: row.orden,
            creadaPor: row.creadaPor ?? undefined,
            actualizadaPor: row.actualizadaPor ?? undefined,
            creadaEn: row.createdAt,
            actualizadaEn: row.updatedAt,
        });
    }

    /**
     * Convierte una entidad a formato de BD
     */
    private toRow(configuracion: Configuracion): NewConfiguracionRow {
        return {
            id: configuracion.id as unknown as string,
            tenantId: configuracion.tenantId,
            clave: configuracion.clave,
            valor: configuracion.valor as object,
            tipo: configuracion.tipo,
            categoria: configuracion.categoria,
            descripcion: configuracion.descripcion ?? null,
            editable: configuracion.editable,
            visible: configuracion.visible,
            nivelSeguridad: configuracion.nivelSeguridad ?? null,
            grupo: configuracion.grupo ?? null,
            orden: configuracion.orden ?? 0,
            creadaPor: configuracion.creadaPor ?? null,
            actualizadaPor: configuracion.actualizadaPor ?? null,
        };
    }

    async guardar(configuracion: Configuracion): Promise<void> {
        await withTenantContext(configuracion.tenantId, async () => {
            try {
                const row = this.toRow(configuracion);
                await db.insert(configuraciones).values(row);
                logger.info(`[ConfiguracionRepository] Configuración creada: ${configuracion.clave}`);
            } catch (error) {
                logger.error('Error al guardar configuración', error instanceof Error ? error : undefined);
                throw error;
            }
        });
    }

    async actualizar(configuracion: Configuracion): Promise<void> {
        await withTenantContext(configuracion.tenantId, async () => {
            try {
                await db.update(configuraciones)
                    .set({
                        valor: configuracion.valor as object,
                        descripcion: configuracion.descripcion,
                        visible: configuracion.visible,
                        grupo: configuracion.grupo,
                        orden: configuracion.orden,
                        actualizadaPor: configuracion.actualizadaPor,
                        updatedAt: new Date(),
                    })
                    .where(and(
                        eq(configuraciones.id, configuracion.id as unknown as string),
                        eq(configuraciones.tenantId, configuracion.tenantId)
                    ));
                logger.info(`[ConfiguracionRepository] Configuración actualizada: ${configuracion.clave}`);
            } catch (error) {
                logger.error('Error al actualizar configuración', error instanceof Error ? error : undefined);
                throw error;
            }
        });
    }

    async eliminar(id: string, tenantId: string): Promise<void> {
        await withTenantContext(tenantId, async () => {
            try {
                await db.delete(configuraciones)
                    .where(and(
                        eq(configuraciones.id, id),
                        eq(configuraciones.tenantId, tenantId)
                    ));
                logger.info(`[ConfiguracionRepository] Configuración eliminada: ${id}`);
            } catch (error) {
                logger.error('Error al eliminar configuración', error instanceof Error ? error : undefined);
                throw error;
            }
        });
    }

    async buscarPorId(id: string, tenantId: string): Promise<Configuracion | null> {
        return withTenantContext(tenantId, async () => {
            try {
                const result = await db.select()
                    .from(configuraciones)
                    .where(and(
                        eq(configuraciones.id, id),
                        eq(configuraciones.tenantId, tenantId)
                    ))
                    .limit(1);

                if (!result.length) return null;
                return this.toDomain(result[0]);
            } catch (error) {
                logger.error('Error al buscar configuración por ID', error instanceof Error ? error : undefined);
                throw error;
            }
        });
    }

    async buscarPorClave(clave: string, tenantId: string): Promise<Configuracion | null> {
        return withTenantContext(tenantId, async () => {
            try {
                const result = await db.select()
                    .from(configuraciones)
                    .where(and(
                        eq(configuraciones.clave, clave),
                        eq(configuraciones.tenantId, tenantId)
                    ))
                    .limit(1);

                if (!result.length) return null;
                return this.toDomain(result[0]);
            } catch (error) {
                logger.error('Error al buscar configuración por clave', error instanceof Error ? error : undefined);
                throw error;
            }
        });
    }

    async listarTodas(tenantId: string, opciones?: ListarOpciones): Promise<Configuracion[]> {
        return withTenantContext(tenantId, async () => {
            try {
                const limit = opciones?.limite || 100;
                const offset = opciones?.offset || 0;
                const orderColumn = opciones?.ordenarPor ? opciones.ordenarPor : 'clave';
                const orderDir = opciones?.orden || 'ASC';

                const orderBy = orderDir === 'DESC' ? desc : asc;
                const orderClause = orderColumn === 'creadaEn'
                    ? orderBy(configuraciones.createdAt)
                    : orderColumn === 'actualizadaEn'
                        ? orderBy(configuraciones.updatedAt)
                        : orderColumn === 'categoria'
                            ? orderBy(configuraciones.categoria)
                            : orderBy(configuraciones.clave);

                const result = await db.select()
                    .from(configuraciones)
                    .where(eq(configuraciones.tenantId, tenantId))
                    .orderBy(orderClause)
                    .limit(limit)
                    .offset(offset);

                return result.map(row => this.toDomain(row));
            } catch (error) {
                logger.error('Error al listar configuraciones', error instanceof Error ? error : undefined);
                throw error;
            }
        });
    }

    async listarPorCategoria(categoria: string, tenantId: string): Promise<Configuracion[]> {
        return withTenantContext(tenantId, async () => {
            try {
                const result = await db.select()
                    .from(configuraciones)
                    .where(and(
                        eq(configuraciones.categoria, categoria),
                        eq(configuraciones.tenantId, tenantId)
                    ))
                    .orderBy(configuraciones.clave);

                return result.map(row => this.toDomain(row));
            } catch (error) {
                logger.error('Error al listar por categoría', error instanceof Error ? error : undefined);
                throw error;
            }
        });
    }

    async listarVisibles(tenantId: string): Promise<Configuracion[]> {
        return withTenantContext(tenantId, async () => {
            try {
                const result = await db.select()
                    .from(configuraciones)
                    .where(and(
                        eq(configuraciones.tenantId, tenantId),
                        eq(configuraciones.visible, true)
                    ))
                    .orderBy(configuraciones.clave);

                return result.map(row => this.toDomain(row));
            } catch (error) {
                logger.error('Error al listar visibles', error instanceof Error ? error : undefined);
                throw error;
            }
        });
    }

    async listarEditables(tenantId: string): Promise<Configuracion[]> {
        return withTenantContext(tenantId, async () => {
            try {
                const result = await db.select()
                    .from(configuraciones)
                    .where(and(
                        eq(configuraciones.tenantId, tenantId),
                        eq(configuraciones.editable, true)
                    ))
                    .orderBy(configuraciones.clave);

                return result.map(row => this.toDomain(row));
            } catch (error) {
                logger.error('Error al listar editables', error instanceof Error ? error : undefined);
                throw error;
            }
        });
    }

    async buscarPorGrupo(grupo: string, tenantId: string): Promise<Configuracion[]> {
        return withTenantContext(tenantId, async () => {
            try {
                const result = await db.select()
                    .from(configuraciones)
                    .where(and(
                        eq(configuraciones.grupo, grupo),
                        eq(configuraciones.tenantId, tenantId)
                    ))
                    .orderBy(configuraciones.orden);

                return result.map(row => this.toDomain(row));
            } catch (error) {
                logger.error('Error al buscar por grupo', error instanceof Error ? error : undefined);
                throw error;
            }
        });
    }

    async buscarConFiltros(filtros: ConfiguracionFiltros, tenantId: string): Promise<Configuracion[]> {
        return withTenantContext(tenantId, async () => {
            try {
                const conditions = [eq(configuraciones.tenantId, tenantId)];

                if (filtros.categoria) {
                    conditions.push(eq(configuraciones.categoria, filtros.categoria));
                }
                if (filtros.grupo) {
                    conditions.push(eq(configuraciones.grupo, filtros.grupo));
                }
                if (filtros.tipo) {
                    conditions.push(eq(configuraciones.tipo, filtros.tipo));
                }
                if (filtros.editable !== undefined) {
                    conditions.push(eq(configuraciones.editable, filtros.editable));
                }
                if (filtros.visible !== undefined) {
                    conditions.push(eq(configuraciones.visible, filtros.visible));
                }
                if (filtros.buscar) {
                    conditions.push(
                        or(
                            like(configuraciones.clave, `%${filtros.buscar}%`),
                            like(configuraciones.descripcion, `%${filtros.buscar}%`)
                        )!
                    );
                }

                const limit = filtros.limite || 100;
                const offset = filtros.offset || 0;
                const orderColumn = filtros.ordenarPor ? filtros.ordenarPor : 'clave';
                const orderDir = filtros.orden || 'ASC';

                const orderBy = orderDir === 'DESC' ? desc : asc;
                const orderClause = orderBy(configuraciones.clave);

                const result = await db.select()
                    .from(configuraciones)
                    .where(and(...conditions))
                    .orderBy(orderClause)
                    .limit(limit)
                    .offset(offset);

                return result.map(row => this.toDomain(row));
            } catch (error) {
                logger.error('Error al buscar con filtros', error instanceof Error ? error : undefined);
                throw error;
            }
        });
    }

    async existeClave(clave: string, tenantId: string): Promise<boolean> {
        return withTenantContext(tenantId, async () => {
            try {
                const result = await db.select({ count: sql<number>`count(*)` })
                    .from(configuraciones)
                    .where(and(
                        eq(configuraciones.clave, clave),
                        eq(configuraciones.tenantId, tenantId)
                    ));

                return Number(result[0]?.count) > 0;
            } catch (error) {
                logger.error('Error al verificar clave', error instanceof Error ? error : undefined);
                throw error;
            }
        });
    }

    async contarPorCategoria(tenantId: string): Promise<Record<string, number>> {
        return withTenantContext(tenantId, async () => {
            try {
                const result = await db.select({
                    categoria: configuraciones.categoria,
                    count: sql<number>`count(*)`,
                })
                    .from(configuraciones)
                    .where(eq(configuraciones.tenantId, tenantId))
                    .groupBy(configuraciones.categoria);

                const counts: Record<string, number> = {};
                result.forEach(row => {
                    counts[row.categoria] = Number(row.count);
                });
                return counts;
            } catch (error) {
                logger.error('Error al contar por categoría', error instanceof Error ? error : undefined);
                throw error;
            }
        });
    }

    async obtenerCategorias(tenantId: string): Promise<string[]> {
        return withTenantContext(tenantId, async () => {
            try {
                const result = await db.selectDistinct({ categoria: configuraciones.categoria })
                    .from(configuraciones)
                    .where(eq(configuraciones.tenantId, tenantId));

                return result.map(r => r.categoria);
            } catch (error) {
                logger.error('Error al obtener categorías', error instanceof Error ? error : undefined);
                throw error;
            }
        });
    }

    async obtenerGrupos(tenantId: string): Promise<string[]> {
        return withTenantContext(tenantId, async () => {
            try {
                const result = await db.selectDistinct({ grupo: configuraciones.grupo })
                    .from(configuraciones)
                    .where(and(
                        eq(configuraciones.tenantId, tenantId),
                        sql`${configuraciones.grupo} IS NOT NULL`
                    ));

                return result.map(r => r.grupo!).filter(Boolean);
            } catch (error) {
                logger.error('Error al obtener grupos', error instanceof Error ? error : undefined);
                throw error;
            }
        });
    }

    async buscarPorClaveExacta(clave: string, tenantId: string): Promise<Configuracion | null> {
        return this.buscarPorClave(clave, tenantId);
    }
}

/**
 * Implementación del repositorio de auditoría
 */
export class AuditoriaDrizzleRepository implements IAuditoriaRepository {
    private toDomain(row: ConfiguracionAuditoriaRow): RegistroAuditoria {
        return RegistroAuditoria.create({
            id: row.id,
            configuracionId: row.configuracionId || '',
            usuarioId: row.usuarioId,
            accion: row.accion as 'CREATE' | 'UPDATE' | 'DELETE' | 'READ',
            valorAnterior: row.valorAnterior,
            valorNuevo: row.valorNuevo,
            ipAddress: row.ipAddress || undefined,
            userAgent: row.userAgent || undefined,
            timestamp: row.createdAt,
        });
    }

    async registrar(evento: RegistroAuditoria, tenantId: string): Promise<void> {
        await withTenantContext(tenantId, async () => {
            try {
                await db.insert(configuracionesAuditoria).values({
                    configuracionId: evento.configuracionId as unknown as string,
                    tenantId: tenantId,
                    usuarioId: evento.usuarioId,
                    accion: evento.accion,
                    valorAnterior: evento.valorAnterior as object,
                    valorNuevo: evento.valorNuevo as object,
                    ipAddress: evento.ipAddress,
                    userAgent: evento.userAgent,
                });
                logger.info('AuditoriaRepository: Evento registrado', { accion: evento.accion });
            } catch (error) {
                logger.error('Error al registrar auditoría', error instanceof Error ? error : undefined);
                throw error;
            }
        });
    }

    async obtenerHistorialConfiguracion(
        configuracionId: string,
        tenantId: string,
        limite: number = 50
    ): Promise<RegistroAuditoria[]> {
        return withTenantContext(tenantId, async () => {
            try {
                const result = await db.select()
                    .from(configuracionesAuditoria)
                    .where(eq(configuracionesAuditoria.configuracionId, configuracionId))
                    .orderBy(desc(configuracionesAuditoria.createdAt))
                    .limit(limite);

                return result.map(row => this.toDomain(row));
            } catch (error) {
                logger.error('Error al obtener historial', error instanceof Error ? error : undefined);
                throw error;
            }
        });
    }

    async obtenerHistorialUsuario(
        usuarioId: string,
        tenantId: string,
        limite: number = 50
    ): Promise<RegistroAuditoria[]> {
        return withTenantContext(tenantId, async () => {
            try {
                const result = await db.select()
                    .from(configuracionesAuditoria)
                    .where(eq(configuracionesAuditoria.usuarioId, usuarioId))
                    .orderBy(desc(configuracionesAuditoria.createdAt))
                    .limit(limite);

                return result.map(row => this.toDomain(row));
            } catch (error) {
                logger.error('Error al obtener historial de usuario', error instanceof Error ? error : undefined);
                throw error;
            }
        });
    }

    async obtenerPorRangoFechas(
        tenantId: string,
        fechaInicio: Date,
        fechaFin: Date,
        limite: number = 100
    ): Promise<RegistroAuditoria[]> {
        return withTenantContext(tenantId, async () => {
            try {
                const result = await db.select()
                    .from(configuracionesAuditoria)
                    .where(and(
                        eq(configuracionesAuditoria.tenantId, tenantId),
                        sql`${configuracionesAuditoria.createdAt} >= ${fechaInicio}`,
                        sql`${configuracionesAuditoria.createdAt} <= ${fechaFin}`
                    ))
                    .orderBy(desc(configuracionesAuditoria.createdAt))
                    .limit(limite);

                return result.map(row => this.toDomain(row));
            } catch (error) {
                logger.error('Error al obtener por rango', error instanceof Error ? error : undefined);
                throw error;
            }
        });
    }

    async obtenerRecientes(tenantId: string, limite: number = 50): Promise<RegistroAuditoria[]> {
        return withTenantContext(tenantId, async () => {
            try {
                const result = await db.select()
                    .from(configuracionesAuditoria)
                    .where(eq(configuracionesAuditoria.tenantId, tenantId))
                    .orderBy(desc(configuracionesAuditoria.createdAt))
                    .limit(limite);

                return result.map(row => this.toDomain(row));
            } catch (error) {
                logger.error('Error al obtener recientes', error instanceof Error ? error : undefined);
                throw error;
            }
        });
    }

    async obtenerPorTipoAccion(
        accion: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ',
        tenantId: string,
        limite: number = 50
    ): Promise<RegistroAuditoria[]> {
        return withTenantContext(tenantId, async () => {
            try {
                const result = await db.select()
                    .from(configuracionesAuditoria)
                    .where(and(
                        eq(configuracionesAuditoria.tenantId, tenantId),
                        eq(configuracionesAuditoria.accion, accion)
                    ))
                    .orderBy(desc(configuracionesAuditoria.createdAt))
                    .limit(limite);

                return result.map(row => this.toDomain(row));
            } catch (error) {
                logger.error('Error al obtener por tipo', error instanceof Error ? error : undefined);
                throw error;
            }
        });
    }

    async contarPorTipoAccion(tenantId: string): Promise<Record<string, number>> {
        return withTenantContext(tenantId, async () => {
            try {
                const result = await db.select({
                    accion: configuracionesAuditoria.accion,
                    count: sql<number>`count(*)`,
                })
                    .from(configuracionesAuditoria)
                    .where(eq(configuracionesAuditoria.tenantId, tenantId))
                    .groupBy(configuracionesAuditoria.accion);

                const counts: Record<string, number> = {};
                result.forEach(row => {
                    counts[row.accion] = Number(row.count);
                });
                return counts;
            } catch (error) {
                logger.error('Error al contar por tipo', error instanceof Error ? error : undefined);
                throw error;
            }
        });
    }

    async obtenerEstadisticas(tenantId: string): Promise<{
        totalEventos: number;
        eventosPorTipo: Record<string, number>;
        eventosPorUsuario: Record<string, number>;
        configuracionesMasModificadas: Array<{ configuracionId: string; clave: string; cantidad: number }>;
        primerEvento: Date | null;
        ultimoEvento: Date | null;
    }> {
        return withTenantContext(tenantId, async () => {
            try {
                const [totales, porTipo, porUsuario, masModificadas, rangoFechas] = await Promise.all([
                    db.select({ count: sql<number>`count(*)` }).from(configuracionesAuditoria).where(eq(configuracionesAuditoria.tenantId, tenantId)),
                    this.contarPorTipoAccion(tenantId),
                    db.select({ usuarioId: configuracionesAuditoria.usuarioId, count: sql<number>`count(*)` })
                        .from(configuracionesAuditoria)
                        .where(eq(configuracionesAuditoria.tenantId, tenantId))
                        .groupBy(configuracionesAuditoria.usuarioId),
                    db.select({
                        configuracionId: configuracionesAuditoria.configuracionId,
                        claveConfig: configuracionesAuditoria.claveConfig,
                        count: sql<number>`count(*)`,
                    })
                        .from(configuracionesAuditoria)
                        .where(and(
                            eq(configuracionesAuditoria.tenantId, tenantId),
                            sql`${configuracionesAuditoria.accion} = 'UPDATE'`
                        ))
                        .groupBy(configuracionesAuditoria.configuracionId, configuracionesAuditoria.claveConfig)
                        .orderBy(desc(sql`count(*)`))
                        .limit(10),
                    db.select({
                        first: sql`MIN(${configuracionesAuditoria.createdAt})`,
                        last: sql`MAX(${configuracionesAuditoria.createdAt})`,
                    })
                        .from(configuracionesAuditoria)
                        .where(eq(configuracionesAuditoria.tenantId, tenantId)),
                ]);

                return {
                    totalEventos: Number(totales[0]?.count) || 0,
                    eventosPorTipo: porTipo,
                    eventosPorUsuario: porUsuario.reduce((acc, curr) => {
                        acc[curr.usuarioId] = Number(curr.count);
                        return acc;
                    }, {} as Record<string, number>),
                    configuracionesMasModificadas: masModificadas.map(m => ({
                        configuracionId: m.configuracionId || '',
                        clave: m.claveConfig || '',
                        cantidad: Number(m.count),
                    })),
                    primerEvento: rangoFechas[0]?.first as Date | null,
                    ultimoEvento: rangoFechas[0]?.last as Date | null,
                };
            } catch (error) {
                logger.error('Error al obtener estadísticas', error instanceof Error ? error : undefined);
                throw error;
            }
        });
    }
}

// Exportar repositories
export const configuracionRepository = new ConfiguracionDrizzleRepository();
export const auditoriaRepository = new AuditoriaDrizzleRepository();
