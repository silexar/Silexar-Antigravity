/**
 * Silexar Pulse — Propiedades Schema (Drizzle ORM)
 *
 * Tablas para el módulo de Propiedades (atributos de campañas, contratos, etc.)
 * Sistema de clasificación y atributos configurable por tenant.
 *
 * CLAUDE.md: every table must have id, tenantId, createdAt, updatedAt
 */

import {
  pgTable, uuid, varchar, text, timestamp, boolean, pgEnum, index, jsonb,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { tenants, users } from './users-schema'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const estadoPropiedadEnum = pgEnum('estado_propiedad', [
  'activo',
  'inactivo',
  'archivado',
])

export const tipoClasificacionEnum = pgEnum('tipo_clasificacion', [
  'campana',
  'contrato',
  'cuna',
  'anunciante',
  'emisora',
  'global',
])

export const tipoValidacionEnum = pgEnum('tipo_validacion', [
  'lista_unica',
  'lista_multiple',
  'texto_libre',
  'numero',
  'fecha',
  'booleano',
])

// ─── tipos_propiedad ──────────────────────────────────────────────────────────

export const tiposPropiedad = pgTable('tipos_propiedad', {
  id:        uuid('id').primaryKey().defaultRandom(),
  tenantId:  uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),

  codigo:    varchar('codigo', { length: 30 }).notNull(),
  nombre:    varchar('nombre', { length: 255 }).notNull(),
  descripcion: text('descripcion'),
  estado:    estadoPropiedadEnum('estado').default('activo').notNull(),

  /** Array of TipoClasificacion values — stored as JSONB array */
  aplicacion: jsonb('aplicacion').$type<string[]>().default(['global']).notNull(),

  tipoValidacion: tipoValidacionEnum('tipo_validacion').default('lista_unica').notNull(),
  configuracionValidacion: jsonb('configuracion_validacion').$type<Record<string, unknown>>(),

  creadoPorId: uuid('creado_por_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index('idx_tipos_propiedad_tenant').on(t.tenantId),
  codigoIdx: index('idx_tipos_propiedad_codigo').on(t.tenantId, t.codigo),
  estadoIdx: index('idx_tipos_propiedad_estado').on(t.estado),
}))

// ─── valores_propiedad ────────────────────────────────────────────────────────
// Field names aligned with the ValorPropiedad domain entity

export const valoresPropiedad = pgTable('valores_propiedad', {
  id:              uuid('id').primaryKey().defaultRandom(),
  tenantId:        uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  tipoPropiedadId: uuid('tipo_propiedad_id').notNull().references(() => tiposPropiedad.id, { onDelete: 'cascade' }),

  codigoRef:         varchar('codigo_ref', { length: 50 }).notNull(),
  descripcion:       varchar('descripcion', { length: 255 }).notNull(),
  descripcionLarga:  text('descripcion_larga'),
  obligatorio:       boolean('obligatorio').default(false).notNull(),
  estado:            estadoPropiedadEnum('estado').default('activo').notNull(),
  orden:             varchar('orden', { length: 10 }).default('0'),
  configuracionContable: jsonb('configuracion_contable').$type<Record<string, unknown>>(),

  creadoPorId: uuid('creado_por_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  tenantIdx:       index('idx_valores_propiedad_tenant').on(t.tenantId),
  tipoIdx:         index('idx_valores_propiedad_tipo').on(t.tipoPropiedadId),
  codigoRefIdx:    index('idx_valores_propiedad_codigo_ref').on(t.tipoPropiedadId, t.codigoRef),
  estadoIdx:       index('idx_valores_propiedad_estado').on(t.estado),
}))

// ─── Relations ────────────────────────────────────────────────────────────────

export const tiposPropiedadRelations = relations(tiposPropiedad, ({ many }) => ({
  valores: many(valoresPropiedad),
}))

export const valoresPropiedadRelations = relations(valoresPropiedad, ({ one }) => ({
  tipo: one(tiposPropiedad, {
    fields: [valoresPropiedad.tipoPropiedadId],
    references: [tiposPropiedad.id],
  }),
}))

// ─── Inferred types ───────────────────────────────────────────────────────────

export type TipoPropiedadRow   = typeof tiposPropiedad.$inferSelect
export type TipoPropiedadInsert = typeof tiposPropiedad.$inferInsert
export type ValorPropiedadRow   = typeof valoresPropiedad.$inferSelect
export type ValorPropiedadInsert = typeof valoresPropiedad.$inferInsert
