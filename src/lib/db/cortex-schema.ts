/**
 * Silexar Pulse — Cortex AI Engines Schema (Drizzle ORM)
 *
 * Persists the state and metrics of each Cortex AI engine per tenant.
 * The engine logic lives in src/cortex/engines/ — this schema stores
 * their operational data (lifecycle, metrics, configuration).
 *
 * CLAUDE.md: every table must have id, tenantId, createdAt, updatedAt
 */

import {
  pgTable, uuid, varchar, integer, real, timestamp, jsonb, pgEnum, index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { tenants } from './users-schema'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const tipoMotorCortexEnum = pgEnum('tipo_motor_cortex', [
  'SUPREME',
  'ORCHESTRATOR',
  'PROPHET',
  'PROPHET_V2',
  'GUARDIAN',
  'RISK',
  'VOICE',
  'SENSE',
  'AUDIENCE',
  'CREATIVE',
  'SENTIMENT',
  'COMPLIANCE',
  'FLOW',
])

export const estadoMotorCortexEnum = pgEnum('estado_motor_cortex', [
  'INICIALIZANDO',
  'ACTIVO',
  'DEGRADADO',
  'DETENIDO',
  'ERROR',
])

// ─── cortex_motores ───────────────────────────────────────────────────────────

export const cortexMotores = pgTable('cortex_motores', {
  id:       uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),

  tipo:    tipoMotorCortexEnum('tipo').notNull(),
  nombre:  varchar('nombre', { length: 255 }).notNull(),
  version: varchar('version', { length: 50 }).notNull().default('1.0.0'),
  estado:  estadoMotorCortexEnum('estado').notNull().default('INICIALIZANDO'),

  // Metrics stored as individual columns for efficient queries + alerting
  metricaPrecision:          real('metrica_precision').notNull().default(0),
  metricaLatenciaMs:         real('metrica_latencia_ms').notNull().default(0),
  metricaSolicitudesTotal:   integer('metrica_solicitudes_total').notNull().default(0),
  metricaSolicitudesExitosas: integer('metrica_solicitudes_exitosas').notNull().default(0),
  metricaUltimaEjecucion:    timestamp('metrica_ultima_ejecucion'),

  /** Engine-specific configuration (algorithm params, thresholds, etc.) */
  configuracion: jsonb('configuracion').$type<Record<string, unknown>>().notNull().default({}),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  tenantIdx:    index('idx_cortex_motores_tenant').on(t.tenantId),
  tipoIdx:      index('idx_cortex_motores_tipo').on(t.tipo),
  estadoIdx:    index('idx_cortex_motores_estado').on(t.estado),
  // Unique: one engine type per tenant
  tenantTipoIdx: index('idx_cortex_motores_tenant_tipo').on(t.tenantId, t.tipo),
}))

// ─── Relations ────────────────────────────────────────────────────────────────

export const cortexMotoresRelations = relations(cortexMotores, ({ one }) => ({
  tenant: one(tenants, {
    fields: [cortexMotores.tenantId],
    references: [tenants.id],
  }),
}))

// ─── Inferred types ───────────────────────────────────────────────────────────

export type CortexMotorRow    = typeof cortexMotores.$inferSelect
export type CortexMotorInsert = typeof cortexMotores.$inferInsert
