/**
 * 📻 SILEXAR PULSE - Emisoras Schema
 * Schema de base de datos para el módulo de Emisoras
 * 
 * @description Las emisoras son las estaciones de radio donde se emiten los spots
 * Incluye configuración de frecuencias, templates de exportación y horarios
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { pgTable, uuid, varchar, text, timestamp, boolean, integer, decimal, pgEnum, index, time } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants, users } from './users-schema';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const tipoFrencuenciaEnum = pgEnum('tipo_frecuencia', ['am', 'fm', 'online', 'dab']);
export const formatoExportacionEnum = pgEnum('formato_exportacion', ['dalet', 'rcs', 'enco', 'csv', 'xml', 'txt']);
export const emisoraStatusEnum = pgEnum('emisora_status', ['activa', 'inactiva', 'mantenimiento', 'pruebas']);

// ═══════════════════════════════════════════════════════════════
// TABLA: EMISORAS
// ═══════════════════════════════════════════════════════════════

export const emisoras = pgTable('emisoras', {
  // Identificadores
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  codigo: varchar('codigo', { length: 20 }).notNull(), // Código interno ej: "EMI-001"
  
  // Información de la emisora
  nombre: varchar('nombre', { length: 255 }).notNull(),
  nombreComercial: varchar('nombre_comercial', { length: 255 }),
  slogan: text('slogan'),
  
  // Frecuencia y banda
  tipoFrecuencia: tipoFrencuenciaEnum('tipo_frecuencia').default('fm').notNull(),
  frecuencia: varchar('frecuencia', { length: 20 }), // Ej: "98.5"
  banda: varchar('banda', { length: 10 }), // "AM" o "FM"
  potenciaKw: decimal('potencia_kw', { precision: 8, scale: 2 }),
  cobertura: text('cobertura'), // Área de cobertura
  
  // Ubicación
  direccion: text('direccion'),
  ciudad: varchar('ciudad', { length: 100 }),
  region: varchar('region', { length: 100 }),
  pais: varchar('pais', { length: 100 }).default('Chile'),
  
  // Contacto
  emailContacto: varchar('email_contacto', { length: 255 }),
  telefonoContacto: varchar('telefono_contacto', { length: 20 }),
  paginaWeb: varchar('pagina_web', { length: 255 }),
  streamUrl: varchar('stream_url', { length: 500 }), // URL de streaming online
  
  // Configuración de emisión
  horaInicioEmision: time('hora_inicio_emision').default('06:00:00'),
  horaFinEmision: time('hora_fin_emision').default('00:00:00'),
  emite24Horas: boolean('emite_24_horas').default(false).notNull(),
  
  // Configuración de exportación
  formatoExportacion: formatoExportacionEnum('formato_exportacion').default('csv').notNull(),
  pathExportacion: text('path_exportacion'), // Directorio de exportación
  prefijoArchivo: varchar('prefijo_archivo', { length: 50 }),
  incluirMetadatos: boolean('incluir_metadatos').default(true).notNull(),
  
  // Configuración de spots
  duracionSpotDefault: integer('duracion_spot_default').default(30), // Segundos
  maxSpotsHora: integer('max_spots_hora').default(12),
  maxSpotsTanda: integer('max_spots_tanda').default(6),
  duracionMaxTanda: integer('duracion_max_tanda').default(180), // 3 minutos
  
  // Tarifas base (por segundo o por spot)
  tarifaPorSegundo: decimal('tarifa_por_segundo', { precision: 10, scale: 2 }),
  tarifaSpot30: decimal('tarifa_spot_30', { precision: 10, scale: 2 }),
  moneda: varchar('moneda', { length: 3 }).default('CLP'),
  
  // Estado
  estado: emisoraStatusEnum('estado').default('activa').notNull(),
  activa: boolean('activa').default(true).notNull(),
  
  // Notas
  notas: text('notas'),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion'),

  // Timestamps estándar (CLAUDE.md mandatory fields)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  // Soft delete
  eliminado: boolean('eliminado').default(false).notNull(),
  fechaEliminacion: timestamp('fecha_eliminacion'),
  eliminadoPorId: uuid('eliminado_por_id')
}, (table) => ({
  // Índices
  tenantIdx: index('emisoras_tenant_idx').on(table.tenantId),
  nombreIdx: index('emisoras_nombre_idx').on(table.nombre),
  frecuenciaIdx: index('emisoras_frecuencia_idx').on(table.frecuencia),
  ciudadIdx: index('emisoras_ciudad_idx').on(table.ciudad),
  estadoIdx: index('emisoras_estado_idx').on(table.estado),
  codigoIdx: index('emisoras_codigo_idx').on(table.codigo)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: PROGRAMAS DE EMISORA
// ═══════════════════════════════════════════════════════════════

export const programasEmisora = pgTable('programas_emisora', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  emisoraId: uuid('emisora_id').references(() => emisoras.id, { onDelete: 'cascade' }).notNull(),
  
  // Información del programa
  nombre: varchar('nombre', { length: 255 }).notNull(),
  descripcion: text('descripcion'),
  conductor: varchar('conductor', { length: 255 }),
  genero: varchar('genero', { length: 100 }), // Noticias, Música, Deportes, etc.
  
  // Horario
  horaInicio: time('hora_inicio').notNull(),
  horaFin: time('hora_fin').notNull(),
  diasEmision: varchar('dias_emision', { length: 50 }), // "L-V", "S-D", "L-D", etc.
  
  // Tarifas específicas del programa
  tarifaPremium: boolean('tarifa_premium').default(false),
  multiplicadorTarifa: decimal('multiplicador_tarifa', { precision: 4, scale: 2 }).default('1.00'),
  
  // Estado
  activo: boolean('activo').default(true).notNull(),
  
  // Auditoría
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  fechaModificacion: timestamp('fecha_modificacion')
}, (table) => ({
  emisoraIdx: index('prog_emis_emisora_id_idx').on(table.emisoraId),
  tenantIdx: index('prog_emis_tenant_id_idx').on(table.tenantId),
  horarioIdx: index('prog_emis_horario_idx').on(table.horaInicio, table.horaFin)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: BLOQUES COMERCIALES (TANDAS)
// ═══════════════════════════════════════════════════════════════

export const bloquesComerciales = pgTable('bloques_comerciales', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  emisoraId: uuid('emisora_id').references(() => emisoras.id, { onDelete: 'cascade' }).notNull(),
  programaId: uuid('programa_id').references(() => programasEmisora.id),
  
  // Información del bloque
  nombre: varchar('nombre', { length: 100 }).notNull(), // Ej: "Tanda 1", "Bloque Matinal"
  horaInicio: time('hora_inicio').notNull(),
  duracionMinutos: integer('duracion_minutos').default(3).notNull(),
  
  // Configuración
  maxSpots: integer('max_spots').default(6).notNull(),
  esPremium: boolean('es_premium').default(false).notNull(),
  multiplicadorPrecio: decimal('multiplicador_precio', { precision: 4, scale: 2 }).default('1.00'),
  
  // Disponibilidad
  diasDisponible: varchar('dias_disponible', { length: 50 }).default('L-D'),
  
  // Estado
  activo: boolean('activo').default(true).notNull(),
  
  // Auditoría
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull()
}, (table) => ({
  emisoraIdx: index('bloques_emisora_idx').on(table.emisoraId),
  programaIdx: index('bloques_programa_idx').on(table.programaId),
  horarioIdx: index('emisoras_bloques_horario_idx').on(table.horaInicio)
}));

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const emisorasRelations = relations(emisoras, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [emisoras.tenantId],
    references: [tenants.id]
  }),
  creadoPor: one(users, {
    fields: [emisoras.creadoPorId],
    references: [users.id]
  }),
  programas: many(programasEmisora),
  bloques: many(bloquesComerciales)
}));

export const programasEmisoraRelations = relations(programasEmisora, ({ one, many }) => ({
  emisora: one(emisoras, {
    fields: [programasEmisora.emisoraId],
    references: [emisoras.id]
  }),
  bloques: many(bloquesComerciales)
}));

export const bloquesComercialesRelations = relations(bloquesComerciales, ({ one }) => ({
  emisora: one(emisoras, {
    fields: [bloquesComerciales.emisoraId],
    references: [emisoras.id]
  }),
  programa: one(programasEmisora, {
    fields: [bloquesComerciales.programaId],
    references: [programasEmisora.id]
  })
}));

// ═══════════════════════════════════════════════════════════════
// TIPOS EXPORTADOS
// ═══════════════════════════════════════════════════════════════

export type Emisora = typeof emisoras.$inferSelect;
export type NewEmisora = typeof emisoras.$inferInsert;
export type ProgramaEmisora = typeof programasEmisora.$inferSelect;
export type BloqueComercial = typeof bloquesComerciales.$inferSelect;
export type TipoFrecuencia = 'am' | 'fm' | 'online' | 'dab';
export type FormatoExportacion = 'dalet' | 'rcs' | 'enco' | 'csv' | 'xml' | 'txt';
export type EmisoraStatus = 'activa' | 'inactiva' | 'mantenimiento' | 'pruebas';

// ═══════════════════════════════════════════════════════════════
// INTERFACES PARA EL FRONTEND
// ═══════════════════════════════════════════════════════════════

export interface EmisoraDTO {
  id: string;
  codigo: string;
  nombre: string;
  nombreComercial: string | null;
  tipoFrecuencia: TipoFrecuencia;
  frecuencia: string | null;
  ciudad: string | null;
  streamUrl: string | null;
  formatoExportacion: FormatoExportacion;
  estado: EmisoraStatus;
  activa: boolean;
  programasCount?: number;
  fechaCreacion: Date;
}

export interface CreateEmisoraDTO {
  nombre: string;
  nombreComercial?: string;
  slogan?: string;
  tipoFrecuencia?: TipoFrecuencia;
  frecuencia?: string;
  banda?: string;
  potenciaKw?: number;
  cobertura?: string;
  direccion?: string;
  ciudad?: string;
  region?: string;
  pais?: string;
  emailContacto?: string;
  telefonoContacto?: string;
  paginaWeb?: string;
  streamUrl?: string;
  formatoExportacion?: FormatoExportacion;
  pathExportacion?: string;
  duracionSpotDefault?: number;
  maxSpotsHora?: number;
  tarifaPorSegundo?: number;
  tarifaSpot30?: number;
  notas?: string;
}
