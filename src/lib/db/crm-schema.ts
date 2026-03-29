/**
 * 🤝 SILEXAR PULSE - Schema CRM
 * 
 * @description Tablas para gestión de leads, oportunidades y pipeline
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { pgTable, uuid, varchar, text, boolean, timestamp, integer, decimal, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants, users } from './users-schema';
import { vendedores } from './equipos-ventas-schema';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const origenLeadEnum = pgEnum('origen_lead', [
  'web',
  'referido',
  'evento',
  'llamada',
  'linkedin',
  'email',
  'publicidad',
  'otro'
]);

export const etapaLeadEnum = pgEnum('etapa_lead', [
  'nuevo',
  'contactado',
  'calificado',
  'propuesta',
  'negociacion',
  'cerrado_ganado',
  'cerrado_perdido'
]);

export const prioridadLeadEnum = pgEnum('prioridad_lead', [
  'baja',
  'media',
  'alta',
  'urgente'
]);

// ═══════════════════════════════════════════════════════════════
// TABLA: LEADS
// ═══════════════════════════════════════════════════════════════

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Contacto
  nombre: varchar('nombre', { length: 150 }).notNull(),
  empresa: varchar('empresa', { length: 200 }),
  cargo: varchar('cargo', { length: 100 }),
  email: varchar('email', { length: 150 }).notNull(),
  telefono: varchar('telefono', { length: 50 }),
  linkedinUrl: varchar('linkedin_url', { length: 300 }),
  
  // Origen y clasificación
  origen: origenLeadEnum('origen').default('otro').notNull(),
  origenDetalle: varchar('origen_detalle', { length: 200 }),
  interes: varchar('interes', { length: 200 }),
  
  // Calificación
  presupuestoEstimado: decimal('presupuesto_estimado', { precision: 15, scale: 2 }).default('0'),
  scoreIA: integer('score_ia').default(0),
  scoreFactores: jsonb('score_factores').default([]),
  prioridad: prioridadLeadEnum('prioridad').default('media'),
  
  // Estado
  etapa: etapaLeadEnum('etapa').default('nuevo').notNull(),
  motivoPerdida: text('motivo_perdida'),
  convertidoAClienteId: uuid('convertido_a_cliente_id'),
  
  // Asignación
  vendedorAsignadoId: uuid('vendedor_asignado_id').references(() => vendedores.id),
  
  // Seguimiento
  proximaAccion: varchar('proxima_accion', { length: 200 }),
  fechaProximaAccion: timestamp('fecha_proxima_accion'),
  notas: jsonb('notas').default([]),
  
  // Auditoría
  ultimaInteraccion: timestamp('ultima_interaccion'),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion')
});

// ═══════════════════════════════════════════════════════════════
// TABLA: OPORTUNIDADES
// ═══════════════════════════════════════════════════════════════

export const oportunidades = pgTable('oportunidades', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  leadId: uuid('lead_id').references(() => leads.id),
  
  // Identificación
  nombre: varchar('nombre', { length: 200 }).notNull(),
  descripcion: text('descripcion'),
  
  // Valor
  valor: decimal('valor', { precision: 15, scale: 2 }).default('0').notNull(),
  probabilidad: integer('probabilidad').default(50),
  valorPonderado: decimal('valor_ponderado', { precision: 15, scale: 2 }).default('0'),
  
  // Pipeline
  etapa: etapaLeadEnum('etapa').default('nuevo').notNull(),
  fechaCierreEstimada: timestamp('fecha_cierre_estimada'),
  diasEnEtapa: integer('dias_en_etapa').default(0),
  
  // Asignación
  vendedorId: uuid('vendedor_id').references(() => vendedores.id),
  
  // Productos (JSON)
  productos: jsonb('productos').default([]),
  
  // Competencia
  competidores: jsonb('competidores').default([]),
  
  // IA
  factoresCierre: jsonb('factores_cierre').default([]),
  factoresRiesgo: jsonb('factores_riesgo').default([]),
  prediccionIA: jsonb('prediccion_ia'),
  
  // Auditoría
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  fechaGanada: timestamp('fecha_ganada'),
  fechaPerdida: timestamp('fecha_perdida'),
  motivoPerdida: text('motivo_perdida')
});

// ═══════════════════════════════════════════════════════════════
// TABLA: ACTIVIDADES CRM
// ═══════════════════════════════════════════════════════════════

export const actividadesCRM = pgTable('actividades_crm', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Vinculación
  leadId: uuid('lead_id').references(() => leads.id),
  oportunidadId: uuid('oportunidad_id').references(() => oportunidades.id),
  
  // Actividad
  tipo: varchar('tipo', { length: 50 }).notNull(), // llamada, email, reunion, tarea
  asunto: varchar('asunto', { length: 200 }).notNull(),
  descripcion: text('descripcion'),
  resultado: varchar('resultado', { length: 100 }),
  
  // Programación
  fechaProgramada: timestamp('fecha_programada'),
  fechaRealizacion: timestamp('fecha_realizacion'),
  duracionMinutos: integer('duracion_minutos'),
  completada: boolean('completada').default(false),
  
  // Asignación
  usuarioId: uuid('usuario_id').references(() => users.id).notNull(),
  
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull()
});

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const leadsRelations = relations(leads, ({ one, many }) => ({
  tenant: one(tenants, { fields: [leads.tenantId], references: [tenants.id] }),
  vendedorAsignado: one(vendedores, { fields: [leads.vendedorAsignadoId], references: [vendedores.id] }),
  oportunidades: many(oportunidades),
  actividades: many(actividadesCRM)
}));

export const oportunidadesRelations = relations(oportunidades, ({ one, many }) => ({
  tenant: one(tenants, { fields: [oportunidades.tenantId], references: [tenants.id] }),
  lead: one(leads, { fields: [oportunidades.leadId], references: [leads.id] }),
  vendedor: one(vendedores, { fields: [oportunidades.vendedorId], references: [vendedores.id] }),
  actividades: many(actividadesCRM)
}));

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type LeadSelect = typeof leads.$inferSelect;
export type LeadInsert = typeof leads.$inferInsert;
export type OportunidadSelect = typeof oportunidades.$inferSelect;
export type OportunidadInsert = typeof oportunidades.$inferInsert;
