/**
 * 🎨 SILEXAR PULSE - Schema Drizzle Agencias Creativas
 * 
 * @description Definición de tablas para Agencias Creativas/Publicidad
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { pgTable, uuid, varchar, text, boolean, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants, users } from './users-schema';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const tipoAgenciaEnum = pgEnum('tipo_agencia', [
  'publicidad',
  'medios',
  'digital',
  'btl',
  'integral',
  'boutique'
]);

export const estadoAgenciaEnum = pgEnum('estado_agencia', [
  'activa',
  'inactiva',
  'suspendida',
  'pendiente'
]);

// ═══════════════════════════════════════════════════════════════
// TABLA: AGENCIAS CREATIVAS
// ═══════════════════════════════════════════════════════════════

export const agenciasCreativas = pgTable('agencias_creativas', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Identificación
  codigo: varchar('codigo', { length: 20 }).notNull(),
  rut: varchar('rut', { length: 15 }),
  razonSocial: varchar('razon_social', { length: 200 }).notNull(),
  nombreFantasia: varchar('nombre_fantasia', { length: 200 }),
  tipoAgencia: tipoAgenciaEnum('tipo_agencia').default('publicidad').notNull(),
  
  // Ubicación
  direccion: varchar('direccion', { length: 300 }),
  ciudad: varchar('ciudad', { length: 100 }),
  pais: varchar('pais', { length: 100 }).default('Chile'),
  
  // Contacto general
  emailGeneral: varchar('email_general', { length: 150 }),
  telefonoGeneral: varchar('telefono_general', { length: 30 }),
  paginaWeb: varchar('pagina_web', { length: 200 }),
  
  // Contacto ejecutivo
  nombreContacto: varchar('nombre_contacto', { length: 150 }),
  cargoContacto: varchar('cargo_contacto', { length: 100 }),
  emailContacto: varchar('email_contacto', { length: 150 }),
  telefonoContacto: varchar('telefono_contacto', { length: 30 }),
  
  // Comercial
  porcentajeComision: integer('porcentaje_comision').default(15),
  
  // Estado
  estado: estadoAgenciaEnum('estado').default('activa').notNull(),
  activa: boolean('activa').default(true).notNull(),
  notas: text('notas'),
  
  // Auditoría
  eliminado: boolean('eliminado').default(false).notNull(),
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion'),
  eliminadoPorId: uuid('eliminado_por_id').references(() => users.id),
  fechaEliminacion: timestamp('fecha_eliminacion')
});

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const agenciasCreativasRelations = relations(agenciasCreativas, ({ one }) => ({
  tenant: one(tenants, {
    fields: [agenciasCreativas.tenantId],
    references: [tenants.id]
  }),
  creadoPor: one(users, {
    fields: [agenciasCreativas.creadoPorId],
    references: [users.id]
  }),
  modificadoPor: one(users, {
    fields: [agenciasCreativas.modificadoPorId],
    references: [users.id]
  })
}));

// ═══════════════════════════════════════════════════════════════
// TIPOS EXPORTADOS
// ═══════════════════════════════════════════════════════════════

export type AgenciaCreativaSelect = typeof agenciasCreativas.$inferSelect;
export type AgenciaCreativaInsert = typeof agenciasCreativas.$inferInsert;

export interface AgenciaCreativaDTO {
  id: string;
  codigo: string;
  rut: string | null;
  razonSocial: string;
  nombreFantasia: string | null;
  nombreMostrar: string;
  tipoAgencia: string;
  direccion: string | null;
  ciudad: string | null;
  emailGeneral: string | null;
  telefonoGeneral: string | null;
  porcentajeComision: number;
  estado: string;
  activa: boolean;
}
