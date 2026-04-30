/**
 * Módulo de Configuración - Silexar Pulse
 * Database Schema
 * 
 * Schema de Drizzle para el módulo de configuración.
 * Incluye tablas para configuraciones y auditoría.
 */

import { pgTable, uuid, varchar, text, jsonb, boolean, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { tenants, users } from './schema';

/**
 * Tabla: configuraciones
 * Almacena las configuraciones del sistema por tenant
 */
export const configuraciones = pgTable('configuraciones', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    clave: varchar('clave', { length: 255 }).notNull(),
    valor: jsonb('valor').notNull(),
    tipo: varchar('tipo', { length: 50 }).notNull(),
    categoria: varchar('categoria', { length: 100 }).notNull(),
    descripcion: text('descripcion'),
    editable: boolean('editable').default(true).notNull(),
    visible: boolean('visible').default(true).notNull(),
    nivelSeguridad: varchar('nivel_seguridad', { length: 50 }).default('publico').notNull(),
    grupo: varchar('grupo', { length: 100 }),
    orden: integer('orden').default(0).notNull(),
    creadaPor: uuid('creada_por').references(() => users.id),
    actualizadaPor: uuid('actualizada_por').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index('idx_configuraciones_tenant_id').on(table.tenantId),
    index('idx_configuraciones_categoria').on(table.categoria),
    index('idx_configuraciones_clave').on(table.clave),
    index('idx_configuraciones_tenant_categoria').on(table.tenantId, table.categoria),
    index('idx_configuraciones_grupo').on(table.grupo),
]);

/**
 * Tabla: configuraciones_auditoria
 * Almacena el historial de cambios en configuraciones
 */
export const configuracionesAuditoria = pgTable('configuraciones_auditoria', {
    id: uuid('id').defaultRandom().primaryKey(),
    configuracionId: uuid('configuracion_id').references(() => configuraciones.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    usuarioId: uuid('usuario_id').notNull().references(() => users.id),
    accion: varchar('accion', { length: 50 }).notNull(),
    valorAnterior: jsonb('valor_anterior'),
    valorNuevo: jsonb('valor_nuevo'),
    claveConfig: varchar('clave_config', { length: 255 }),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index('idx_config_auditoria_tenant').on(table.tenantId),
    index('idx_config_auditoria_usuario').on(table.usuarioId),
    index('idx_config_auditoria_fecha').on(table.createdAt),
    index('idx_config_auditoria_configuracion').on(table.configuracionId),
    index('idx_config_auditoria_accion').on(table.accion),
]);

/**
 * Tabla: configuraciones_grupos
 * Agrupa configuraciones relacionadas
 */
export const configuracionesGrupos = pgTable('configuraciones_grupos', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    nombre: varchar('nombre', { length: 100 }).notNull(),
    descripcion: text('descripcion'),
    categoria: varchar('categoria', { length: 100 }).notNull(),
    orden: integer('orden').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index('idx_config_grupos_tenant').on(table.tenantId),
    index('idx_config_grupos_categoria').on(table.categoria),
]);

/**
 * Tabla: configuraciones_favoritas
 * Almacena las configuraciones marcadas como favoritas por usuario
 */
export const configuracionesFavoritas = pgTable('configuraciones_favoritas', {
    id: uuid('id').defaultRandom().primaryKey(),
    configuracionId: uuid('configuracion_id').notNull().references(() => configuraciones.id, { onDelete: 'cascade' }),
    usuarioId: uuid('usuario_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index('idx_config_fav_usuario').on(table.usuarioId),
    index('idx_config_fav_config').on(table.configuracionId),
]);

/**
 * Tipos inferidos de las tablas
 */
export type ConfiguracionRow = typeof configuraciones.$inferSelect;
export type NewConfiguracionRow = typeof configuraciones.$inferInsert;
export type ConfiguracionAuditoriaRow = typeof configuracionesAuditoria.$inferSelect;
export type NewConfiguracionAuditoriaRow = typeof configuracionesAuditoria.$inferInsert;
export type ConfiguracionGrupoRow = typeof configuracionesGrupos.$inferSelect;
export type NewConfiguracionGrupoRow = typeof configuracionesGrupos.$inferInsert;
export type ConfiguracionFavoritaRow = typeof configuracionesFavoritas.$inferSelect;
export type NewConfiguracionFavoritaRow = typeof configuracionesFavoritas.$inferInsert;
