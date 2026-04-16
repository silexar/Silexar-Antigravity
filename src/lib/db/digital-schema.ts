/**
 * SILEXAR PULSE - Digital Specifications Schema
 * Schema de base de datos para especificaciones digitales de campanas y contratos
 */

import { pgTable, uuid, varchar, text, timestamp, decimal, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants, users } from './users-schema';
import { campanas } from './campanas-schema';
import { contratos } from './contratos-schema';

export const especificacionesDigitales = pgTable('especificaciones_digitales', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  campanaId: uuid('campana_id').references(() => campanas.id, { onDelete: 'cascade' }),
  contratoId: uuid('contrato_id').references(() => contratos.id, { onDelete: 'cascade' }),

  // Plataformas destino
  plataformas: jsonb('plataformas').$type<string[]>().default([]),

  // Presupuesto digital
  presupuestoDigital: decimal('presupuesto_digital', { precision: 15, scale: 2 }),
  moneda: varchar('moneda', { length: 3 }).default('CLP'),
  tipoPresupuesto: varchar('tipo_presupuesto', { length: 20 }), // diario, total

  // Objetivos de campana (JSON flexible)
  objetivos: jsonb('objetivos'),

  // Tracking links
  trackingLinks: jsonb('tracking_links').$type<string[]>().default([]),

  // Configuracion de targeting (audiencia, geolocalizacion, etc.)
  configuracionTargeting: jsonb('configuracion_targeting'),

  // Estado de la especificacion
  estado: varchar('estado', { length: 50 }).default('borrador'),

  // Observaciones
  notas: text('notas'),

  // Auditoria
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  fechaModificacion: timestamp('fecha_modificacion'),
}, (table) => ({
  tenantIdx: index('espec_digitales_tenant_idx').on(table.tenantId),
  campanaIdx: index('espec_digitales_campana_idx').on(table.campanaId),
  contratoIdx: index('espec_digitales_contrato_idx').on(table.contratoId),
}));

export const especificacionesDigitalesRelations = relations(especificacionesDigitales, ({ one }) => ({
  tenant: one(tenants, { fields: [especificacionesDigitales.tenantId], references: [tenants.id] }),
  campana: one(campanas, { fields: [especificacionesDigitales.campanaId], references: [campanas.id] }),
  contrato: one(contratos, { fields: [especificacionesDigitales.contratoId], references: [contratos.id] }),
  creadoPor: one(users, { fields: [especificacionesDigitales.creadoPorId], references: [users.id] }),
}));

export type EspecificacionDigital = typeof especificacionesDigitales.$inferSelect;
export type NewEspecificacionDigital = typeof especificacionesDigitales.$inferInsert;
