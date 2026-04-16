/**
 * 🌐 SILEXAR PULSE - RRSS Media Schema
 *
 * Base de datos para conexiones de redes sociales, publicaciones
 * programadas y métricas de engagement.
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

import { pgTable, uuid, varchar, text, timestamp, jsonb, index, pgEnum, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants, users } from './users-schema';
import { campanas } from './campanas-schema';
import { contratos } from './contratos-schema';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const plataformaRrssEnum = pgEnum('plataforma_rrss', [
  'instagram',
  'facebook',
  'tiktok',
  'linkedin',
  'twitter',
  'youtube'
]);

export const estadoPublicacionRrssEnum = pgEnum('estado_publicacion_rrss', [
  'borrador',
  'programada',
  'publicada',
  'fallida',
  'cancelada'
]);

// ═══════════════════════════════════════════════════════════════
// TABLA: CONEXIONES RRSS
// ═══════════════════════════════════════════════════════════════

export const rrssConnections = pgTable('rrss_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  plataforma: plataformaRrssEnum('plataforma').notNull(),
  accountId: varchar('account_id', { length: 255 }).notNull(),
  accountName: varchar('account_name', { length: 255 }),
  accountAvatar: text('account_avatar'),

  // Tokens cifrados (AES-256-GCM)
  accessTokenCipher: text('access_token_cipher').notNull(),
  refreshTokenCipher: text('refresh_token_cipher'),
  tokenIv: varchar('token_iv', { length: 32 }).notNull(),
  tokenAuthTag: varchar('token_auth_tag', { length: 64 }).notNull(),

  scopes: jsonb('scopes').$type<string[]>().default([]),
  expiresAt: timestamp('expires_at'),

  // Auditoría
  creadoEn: timestamp('creado_en').defaultNow().notNull(),
  actualizadoEn: timestamp('actualizado_en'),
}, (table) => ({
  tenantIdx: index('rrss_conn_tenant_idx').on(table.tenantId),
  userIdx: index('rrss_conn_user_idx').on(table.userId),
  plataformaIdx: index('rrss_conn_plataforma_idx').on(table.plataforma),
  accountIdx: index('rrss_conn_account_idx').on(table.accountId),
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: PUBLICACIONES RRSS
// ═══════════════════════════════════════════════════════════════

export const rrssPublicaciones = pgTable('rrss_publicaciones', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),

  connectionId: uuid('connection_id').references(() => rrssConnections.id, { onDelete: 'cascade' }).notNull(),
  campanaId: uuid('campana_id').references(() => campanas.id, { onDelete: 'set null' }),
  contratoId: uuid('contrato_id').references(() => contratos.id, { onDelete: 'set null' }),

  contenido: text('contenido').notNull(),
  hashtags: jsonb('hashtags').$type<string[]>().default([]),
  mediaUrls: jsonb('media_urls').$type<string[]>().default([]),

  estado: estadoPublicacionRrssEnum('estado').default('borrador').notNull(),
  scheduledAt: timestamp('scheduled_at'),
  publishedAt: timestamp('published_at'),
  externalPostId: varchar('external_post_id', { length: 255 }),
  externalPostUrl: text('external_post_url'),
  errorLog: text('error_log'),

  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  creadoEn: timestamp('creado_en').defaultNow().notNull(),
  actualizadoEn: timestamp('actualizado_en'),
}, (table) => ({
  tenantIdx: index('rrss_pub_tenant_idx').on(table.tenantId),
  connectionIdx: index('rrss_pub_connection_idx').on(table.connectionId),
  campanaIdx: index('rrss_pub_campana_idx').on(table.campanaId),
  contratoIdx: index('rrss_pub_contrato_idx').on(table.contratoId),
  estadoScheduledIdx: index('rrss_pub_estado_scheduled_idx').on(table.estado, table.scheduledAt),
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: MÉTRICAS RRSS
// ═══════════════════════════════════════════════════════════════

export const rrssMetricas = pgTable('rrss_metricas', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  publicacionId: uuid('publicacion_id').references(() => rrssPublicaciones.id, { onDelete: 'cascade' }).notNull(),

  likes: integer('likes').default(0),
  comments: integer('comments').default(0),
  shares: integer('shares').default(0),
  reach: integer('reach').default(0),
  impressions: integer('impressions').default(0),
  saves: integer('saves').default(0),
  clicks: integer('clicks').default(0),
  videoViews: integer('video_views').default(0),

  collectedAt: timestamp('collected_at').defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index('rrss_met_tenant_idx').on(table.tenantId),
  pubIdx: index('rrss_met_pub_idx').on(table.publicacionId),
  collectedIdx: index('rrss_met_collected_idx').on(table.collectedAt),
}));

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const rrssConnectionsRelations = relations(rrssConnections, ({ one, many }) => ({
  tenant: one(tenants, { fields: [rrssConnections.tenantId], references: [tenants.id] }),
  user: one(users, { fields: [rrssConnections.userId], references: [users.id] }),
  publicaciones: many(rrssPublicaciones),
}));

export const rrssPublicacionesRelations = relations(rrssPublicaciones, ({ one, many }) => ({
  tenant: one(tenants, { fields: [rrssPublicaciones.tenantId], references: [tenants.id] }),
  connection: one(rrssConnections, { fields: [rrssPublicaciones.connectionId], references: [rrssConnections.id] }),
  campana: one(campanas, { fields: [rrssPublicaciones.campanaId], references: [campanas.id] }),
  contrato: one(contratos, { fields: [rrssPublicaciones.contratoId], references: [contratos.id] }),
  creadoPor: one(users, { fields: [rrssPublicaciones.creadoPorId], references: [users.id] }),
  metricas: many(rrssMetricas),
}));

export const rrssMetricasRelations = relations(rrssMetricas, ({ one }) => ({
  tenant: one(tenants, { fields: [rrssMetricas.tenantId], references: [tenants.id] }),
  publicacion: one(rrssPublicaciones, { fields: [rrssMetricas.publicacionId], references: [rrssPublicaciones.id] }),
}));

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type RrssConnection = typeof rrssConnections.$inferSelect;
export type NewRrssConnection = typeof rrssConnections.$inferInsert;

export type RrssPublicacion = typeof rrssPublicaciones.$inferSelect;
export type NewRrssPublicacion = typeof rrssPublicaciones.$inferInsert;

export type RrssMetrica = typeof rrssMetricas.$inferSelect;
export type NewRrssMetrica = typeof rrssMetricas.$inferInsert;
