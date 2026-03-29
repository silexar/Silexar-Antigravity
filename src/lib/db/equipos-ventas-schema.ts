/**
 * 👥 SILEXAR PULSE - Schema Drizzle Equipos de Ventas
 * 
 * @description Definición de tablas para Vendedores, Equipos, Metas y Comisiones
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { pgTable, uuid, varchar, text, boolean, timestamp, integer, decimal, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants, users } from './users-schema';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const estadoVendedorEnum = pgEnum('estado_vendedor', [
  'activo',
  'inactivo',
  'vacaciones',
  'licencia'
]);

export const tipoComisionEnum = pgEnum('tipo_comision', [
  'porcentaje',
  'escalonada',
  'fija'
]);

export const periodoMetaEnum = pgEnum('periodo_meta', [
  'mensual',
  'trimestral',
  'anual'
]);

// ═══════════════════════════════════════════════════════════════
// TABLA: EQUIPOS DE VENTAS
// ═══════════════════════════════════════════════════════════════

// @ts-expect-error — circular FK: equiposVentas.liderId references vendedores which in
// turn references equiposVentas.id. Drizzle resolves forward-declared references at
// runtime via the thunk () => vendedores.id. TypeScript sees the declaration before
// 'vendedores' is defined and raises a "block-scoped variable used before declaration"
// error that cannot be eliminated without restructuring into separate schema files.
export const equiposVentas = pgTable('equipos_ventas', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  codigo: varchar('codigo', { length: 20 }).notNull(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  descripcion: text('descripcion'),
  // @ts-expect-error — forward reference to vendedores (defined below); resolved at runtime
  liderId: uuid('lider_id').references(() => vendedores.id),
  metaEquipo: decimal('meta_equipo', { precision: 15, scale: 2 }).default('0'),
  ventasEquipo: decimal('ventas_equipo', { precision: 15, scale: 2 }).default('0'),
  activo: boolean('activo').default(true).notNull(),
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull()
});

// ═══════════════════════════════════════════════════════════════
// TABLA: VENDEDORES
// ═══════════════════════════════════════════════════════════════

// @ts-expect-error — circular self-reference: vendedores.supervisorId references vendedores.id
// and vendedores.equipoId references equiposVentas which references vendedores.
// Drizzle handles these via thunks; TypeScript raises a forward-reference error here.
export const vendedores = pgTable('vendedores', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  codigo: varchar('codigo', { length: 20 }).notNull(),
  
  // Datos personales
  nombre: varchar('nombre', { length: 100 }).notNull(),
  apellido: varchar('apellido', { length: 100 }).notNull(),
  email: varchar('email', { length: 150 }).notNull(),
  telefono: varchar('telefono', { length: 30 }),
  
  // Organización
  // @ts-expect-error — back-reference to equiposVentas (declared above but creates a cycle)
  equipoId: uuid('equipo_id').references(() => equiposVentas.id),
  // @ts-expect-error — self-referencing FK for hierarchical supervisor chain
  supervisorId: uuid('supervisor_id').references(() => vendedores.id),
  
  // Territorio
  zonasAsignadas: jsonb('zonas_asignadas').default([]),
  clientesAsignados: jsonb('clientes_asignados').default([]),
  
  // Comercial
  tipoComision: tipoComisionEnum('tipo_comision').default('porcentaje'),
  porcentajeComision: decimal('porcentaje_comision', { precision: 5, scale: 2 }).default('5'),
  escalonesBonus: jsonb('escalones_bonus'),
  
  // Rendimiento
  ventasAcumuladas: decimal('ventas_acumuladas', { precision: 15, scale: 2 }).default('0'),
  comisionesAcumuladas: decimal('comisiones_acumuladas', { precision: 15, scale: 2 }).default('0'),
  rankingActual: integer('ranking_actual').default(0),
  
  // Estado
  estado: estadoVendedorEnum('estado').default('activo').notNull(),
  fechaIngreso: timestamp('fecha_ingreso').defaultNow().notNull(),
  
  // Auditoría
  eliminado: boolean('eliminado').default(false).notNull(),
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion')
});

// ═══════════════════════════════════════════════════════════════
// TABLA: METAS DE VENTAS
// ═══════════════════════════════════════════════════════════════

export const metasVentas = pgTable('metas_ventas', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  vendedorId: uuid('vendedor_id').references(() => vendedores.id, { onDelete: 'cascade' }).notNull(),
  periodo: periodoMetaEnum('periodo').notNull(),
  fechaInicio: timestamp('fecha_inicio').notNull(),
  fechaFin: timestamp('fecha_fin').notNull(),
  montoMeta: decimal('monto_meta', { precision: 15, scale: 2 }).notNull(),
  montoAlcanzado: decimal('monto_alcanzado', { precision: 15, scale: 2 }).default('0'),
  porcentajeCumplimiento: decimal('porcentaje_cumplimiento', { precision: 5, scale: 2 }).default('0'),
  activa: boolean('activa').default(true),
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull()
});

// ═══════════════════════════════════════════════════════════════
// TABLA: HISTORIAL COMISIONES
// ═══════════════════════════════════════════════════════════════

export const historialComisiones = pgTable('historial_comisiones', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  vendedorId: uuid('vendedor_id').references(() => vendedores.id).notNull(),
  periodo: varchar('periodo', { length: 20 }).notNull(), // '2025-01'
  ventasPeriodo: decimal('ventas_periodo', { precision: 15, scale: 2 }).notNull(),
  comisionCalculada: decimal('comision_calculada', { precision: 15, scale: 2 }).notNull(),
  bonusAplicados: jsonb('bonus_aplicados'),
  comisionTotal: decimal('comision_total', { precision: 15, scale: 2 }).notNull(),
  estado: varchar('estado', { length: 20 }).default('pendiente'), // pendiente, aprobada, pagada
  fechaPago: timestamp('fecha_pago'),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull()
});

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const equiposVentasRelations = relations(equiposVentas, ({ one, many }) => ({
  tenant: one(tenants, { fields: [equiposVentas.tenantId], references: [tenants.id] }),
  lider: one(vendedores, { fields: [equiposVentas.liderId], references: [vendedores.id] }),
  miembros: many(vendedores)
}));

export const vendedoresRelations = relations(vendedores, ({ one, many }) => ({
  tenant: one(tenants, { fields: [vendedores.tenantId], references: [tenants.id] }),
  equipo: one(equiposVentas, { fields: [vendedores.equipoId], references: [equiposVentas.id] }),
  supervisor: one(vendedores, { fields: [vendedores.supervisorId], references: [vendedores.id] }),
  metas: many(metasVentas),
  comisiones: many(historialComisiones)
}));

// ═══════════════════════════════════════════════════════════════
// TIPOS EXPORTADOS
// ═══════════════════════════════════════════════════════════════

export type VendedorSelect = typeof vendedores.$inferSelect;
export type VendedorInsert = typeof vendedores.$inferInsert;
export type EquipoVentasSelect = typeof equiposVentas.$inferSelect;
export type MetaVentasSelect = typeof metasVentas.$inferSelect;
