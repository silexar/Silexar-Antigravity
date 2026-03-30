/**
 * 🚀 SILEXAR PULSE — Schema Premium Ejecutivo Ventas
 * 
 * Tablas complementarias: deal activities, stakeholders,
 * message templates, objections, meetings, activity logs.
 * 
 * @version 2025.2.0
 * @tier TIER_0_FORTUNE_10
 */

import { pgTable, uuid, varchar, text, boolean, timestamp, integer, decimal, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants, users } from './users-schema';
import { vendedores } from './equipos-ventas-schema';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const dealStageEnum = pgEnum('deal_stage', [
  'prospecto', 'calificado', 'propuesta', 'negociacion', 'cerrado_ganado', 'cerrado_perdido'
]);

export const actividadTipoEnum = pgEnum('actividad_tipo', [
  'llamada', 'email', 'reunion', 'nota', 'documento', 'cambio_estado'
]);

export const urgenciaNivelEnum = pgEnum('urgencia_nivel', [
  'critica', 'alta', 'media', 'baja'
]);

export const objecionCategoriaEnum = pgEnum('objecion_categoria', [
  'precio', 'competencia', 'timing', 'features', 'contrato', 'confianza'
]);

// ═══════════════════════════════════════════════════════════════
// TABLA: DEALS (Oportunidades)
// ═══════════════════════════════════════════════════════════════

export const deals = pgTable('deals', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  vendedorId: uuid('vendedor_id').references(() => vendedores.id).notNull(),
  clienteNombre: varchar('cliente_nombre', { length: 200 }).notNull(),
  clienteContacto: varchar('cliente_contacto', { length: 200 }),
  clienteEmail: varchar('cliente_email', { length: 200 }),
  clienteTelefono: varchar('cliente_telefono', { length: 50 }),
  titulo: varchar('titulo', { length: 300 }).notNull(),
  valor: decimal('valor', { precision: 15, scale: 2 }).notNull(),
  moneda: varchar('moneda', { length: 5 }).default('CLP'),
  stage: dealStageEnum('stage').default('prospecto').notNull(),
  probabilidad: integer('probabilidad').default(10),
  fechaCierreEstimada: timestamp('fecha_cierre_estimada'),
  urgenciaScore: integer('urgencia_score').default(0),
  urgenciaNivel: urgenciaNivelEnum('urgencia_nivel').default('media'),
  diasSinContacto: integer('dias_sin_contacto').default(0),
  notas: text('notas'),
  metadata: jsonb('metadata'),
  activo: boolean('activo').default(true),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  fechaModificacion: timestamp('fecha_modificacion'),
});

// ═══════════════════════════════════════════════════════════════
// TABLA: DEAL ACTIVIDADES
// ═══════════════════════════════════════════════════════════════

export const dealActividades = pgTable('deal_actividades', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  dealId: uuid('deal_id').references(() => deals.id, { onDelete: 'cascade' }).notNull(),
  vendedorId: uuid('vendedor_id').references(() => vendedores.id).notNull(),
  tipo: actividadTipoEnum('tipo').notNull(),
  titulo: varchar('titulo', { length: 300 }).notNull(),
  descripcion: text('descripcion'),
  duracionMinutos: integer('duracion_minutos'),
  resultado: varchar('resultado', { length: 200 }),
  metadata: jsonb('metadata'),
  fechaActividad: timestamp('fecha_actividad').defaultNow().notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
});

// ═══════════════════════════════════════════════════════════════
// TABLA: DEAL STAKEHOLDERS
// ═══════════════════════════════════════════════════════════════

export const dealStakeholders = pgTable('deal_stakeholders', {
  id: uuid('id').primaryKey().defaultRandom(),
  dealId: uuid('deal_id').references(() => deals.id, { onDelete: 'cascade' }).notNull(),
  nombre: varchar('nombre', { length: 200 }).notNull(),
  cargo: varchar('cargo', { length: 200 }),
  email: varchar('email', { length: 200 }),
  telefono: varchar('telefono', { length: 50 }),
  influencia: integer('influencia').default(50), // 0-100
  posicion: varchar('posicion', { length: 50 }).default('neutral'), // champion, supporter, neutral, blocker
  notas: text('notas'),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
});

// ═══════════════════════════════════════════════════════════════
// TABLA: TEMPLATES MENSAJES
// ═══════════════════════════════════════════════════════════════

export const mensajeTemplates = pgTable('mensaje_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  categoria: varchar('categoria', { length: 50 }).notNull(), // prospeccion, follow_up, propuesta, cierre, post_venta
  titulo: varchar('titulo', { length: 200 }).notNull(),
  asunto: varchar('asunto', { length: 300 }),
  cuerpo: text('cuerpo').notNull(),
  variables: jsonb('variables'), // [{nombre, descripcion}]
  canal: varchar('canal', { length: 20 }).default('email'), // email, whatsapp
  vecesUsado: integer('veces_usado').default(0),
  tasaRespuesta: decimal('tasa_respuesta', { precision: 5, scale: 2 }),
  activo: boolean('activo').default(true),
  creadoPorId: uuid('creado_por_id').references(() => users.id),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
});

// ═══════════════════════════════════════════════════════════════
// TABLA: OBJECIONES
// ═══════════════════════════════════════════════════════════════

export const objeciones = pgTable('objeciones', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  categoria: objecionCategoriaEnum('categoria').notNull(),
  objecion: text('objecion').notNull(),
  respuestaSugerida: text('respuesta_sugerida').notNull(),
  ejemploReal: text('ejemplo_real'),
  tasaExito: decimal('tasa_exito', { precision: 5, scale: 2 }),
  vecesUsada: integer('veces_usada').default(0),
  tags: jsonb('tags'),
  activo: boolean('activo').default(true),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
});

// ═══════════════════════════════════════════════════════════════
// TABLA: REUNIONES PREPARACIÓN
// ═══════════════════════════════════════════════════════════════

export const reunionesPrep = pgTable('reuniones_prep', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  vendedorId: uuid('vendedor_id').references(() => vendedores.id).notNull(),
  dealId: uuid('deal_id').references(() => deals.id),
  titulo: varchar('titulo', { length: 300 }).notNull(),
  fechaReunion: timestamp('fecha_reunion').notNull(),
  contactoNombre: varchar('contacto_nombre', { length: 200 }),
  contactoCargo: varchar('contacto_cargo', { length: 200 }),
  briefIA: jsonb('brief_ia'), // {bio, historial, objeciones, talkingPoints, docs}
  completada: boolean('completada').default(false),
  notasPostReunion: text('notas_post_reunion'),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
});

// ═══════════════════════════════════════════════════════════════
// TABLA: ACTIVITY LOG (Heatmap)
// ═══════════════════════════════════════════════════════════════

export const activityLog = pgTable('activity_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  vendedorId: uuid('vendedor_id').references(() => vendedores.id).notNull(),
  tipo: actividadTipoEnum('tipo').notNull(),
  cantidad: integer('cantidad').default(1),
  fecha: timestamp('fecha').defaultNow().notNull(),
  hora: integer('hora'), // 0-23
  metadata: jsonb('metadata'),
});

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const dealsRelations = relations(deals, ({ one, many }) => ({
  vendedor: one(vendedores, { fields: [deals.vendedorId], references: [vendedores.id] }),
  actividades: many(dealActividades),
  stakeholders: many(dealStakeholders),
}));

export const dealActividadesRelations = relations(dealActividades, ({ one }) => ({
  deal: one(deals, { fields: [dealActividades.dealId], references: [deals.id] }),
  vendedor: one(vendedores, { fields: [dealActividades.vendedorId], references: [vendedores.id] }),
}));

export const dealStakeholdersRelations = relations(dealStakeholders, ({ one }) => ({
  deal: one(deals, { fields: [dealStakeholders.dealId], references: [deals.id] }),
}));

// ═══════════════════════════════════════════════════════════════
// TIPOS EXPORTADOS
// ═══════════════════════════════════════════════════════════════

export type DealSelect = typeof deals.$inferSelect;
export type DealInsert = typeof deals.$inferInsert;
export type DealActividadSelect = typeof dealActividades.$inferSelect;
export type DealStakeholderSelect = typeof dealStakeholders.$inferSelect;
export type MensajeTemplateSelect = typeof mensajeTemplates.$inferSelect;
export type ObjecionSelect = typeof objeciones.$inferSelect;
export type ReunionPrepSelect = typeof reunionesPrep.$inferSelect;
export type ActivityLogSelect = typeof activityLog.$inferSelect;
