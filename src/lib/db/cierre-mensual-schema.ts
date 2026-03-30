/**
 * 📊 SILEXAR PULSE - Schema Cierre Mensual
 * 
 * @description Tablas para gestión de cierres mensuales de ventas y facturación
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { pgTable, uuid, varchar, text, timestamp, integer, decimal, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants, users } from './users-schema';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const estadoCierreMensualEnum = pgEnum('estado_cierre', [
  'abierto',
  'pre_cierre',
  'validando',
  'cerrado',
  'reabierto'
]);

export const tipoCierreEnum = pgEnum('tipo_cierre', [
  'ventas',
  'facturacion',
  'completo'
]);

// ═══════════════════════════════════════════════════════════════
// TABLA: PERIODOS DE CIERRE
// ═══════════════════════════════════════════════════════════════

export const periodosCierre = pgTable('periodos_cierre', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Identificación del período
  anio: integer('anio').notNull(),
  mes: integer('mes').notNull(), // 1-12
  codigo: varchar('codigo', { length: 10 }).notNull(), // '2025-12'
  
  // Estado del período
  estado: estadoCierreMensualEnum('estado').default('abierto').notNull(),
  tipoCierre: tipoCierreEnum('tipo_cierre').default('completo').notNull(),
  
  // Totales de ventas
  totalVentasBrutas: decimal('total_ventas_brutas', { precision: 18, scale: 2 }).default('0'),
  totalDescuentos: decimal('total_descuentos', { precision: 18, scale: 2 }).default('0'),
  totalVentasNetas: decimal('total_ventas_netas', { precision: 18, scale: 2 }).default('0'),
  totalComisiones: decimal('total_comisiones', { precision: 18, scale: 2 }).default('0'),
  
  // Totales de facturación
  totalFacturado: decimal('total_facturado', { precision: 18, scale: 2 }).default('0'),
  totalPendienteFacturar: decimal('total_pendiente_facturar', { precision: 18, scale: 2 }).default('0'),
  cantidadFacturas: integer('cantidad_facturas').default(0),
  
  // Contadores
  campanasVendidas: integer('campanas_vendidas').default(0),
  campanasBonificadas: integer('campanas_bonificadas').default(0),
  contratosActivos: integer('contratos_activos').default(0),
  clientesActivos: integer('clientes_activos').default(0),
  
  // Validaciones
  erroresValidacion: jsonb('errores_validacion').default([]),
  advertenciasValidacion: jsonb('advertencias_validacion').default([]),
  campanassinValor: integer('campanas_sin_valor').default(0),
  
  // Fechas del proceso
  fechaPreCierre: timestamp('fecha_pre_cierre'),
  fechaCierre: timestamp('fecha_cierre'),
  fechaReapertura: timestamp('fecha_reapertura'),
  
  // Auditoría
  preCierreUserId: uuid('pre_cierre_user_id').references(() => users.id),
  cierreUserId: uuid('cierre_user_id').references(() => users.id),
  reaperturaUserId: uuid('reapertura_user_id').references(() => users.id),
  motivoReapertura: text('motivo_reapertura'),
  
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  fechaModificacion: timestamp('fecha_modificacion')
});

// ═══════════════════════════════════════════════════════════════
// TABLA: HISTORIAL DE ACCIONES DE CIERRE
// ═══════════════════════════════════════════════════════════════

export const historialCierre = pgTable('historial_cierre', {
  id: uuid('id').primaryKey().defaultRandom(),
  periodoId: uuid('periodo_id').references(() => periodosCierre.id, { onDelete: 'cascade' }).notNull(),
  
  accion: varchar('accion', { length: 50 }).notNull(), // 'pre_cierre', 'validacion', 'cierre', 'reapertura'
  estadoAnterior: varchar('estado_anterior', { length: 20 }),
  estadoNuevo: varchar('estado_nuevo', { length: 20 }).notNull(),
  
  detalles: jsonb('detalles'), // Snapshot de totales al momento
  observaciones: text('observaciones'),
  
  usuarioId: uuid('usuario_id').references(() => users.id).notNull(),
  fechaAccion: timestamp('fecha_accion').defaultNow().notNull()
});

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const periodosCierreRelations = relations(periodosCierre, ({ one, many }) => ({
  tenant: one(tenants, { fields: [periodosCierre.tenantId], references: [tenants.id] }),
  historial: many(historialCierre),
  preCierrePor: one(users, { fields: [periodosCierre.preCierreUserId], references: [users.id] }),
  cierrePor: one(users, { fields: [periodosCierre.cierreUserId], references: [users.id] })
}));

export const historialCierreRelations = relations(historialCierre, ({ one }) => ({
  periodo: one(periodosCierre, { fields: [historialCierre.periodoId], references: [periodosCierre.id] }),
  usuario: one(users, { fields: [historialCierre.usuarioId], references: [users.id] })
}));

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type PeriodoCierreSelect = typeof periodosCierre.$inferSelect;
export type PeriodoCierreInsert = typeof periodosCierre.$inferInsert;
export type HistorialCierreSelect = typeof historialCierre.$inferSelect;
