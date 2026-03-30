/**
 * 🎵 SILEXAR PULSE - Cuñas (Spots) Schema
 * Schema de base de datos para el módulo de Cuñas/Spots publicitarios
 * 
 * @description Las cuñas son los archivos de audio publicitario que se emiten
 * Incluye metadatos, versionado y detección automática de duración
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { pgTable, uuid, varchar, text, timestamp, boolean, integer, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants, users } from './users-schema';
import { anunciantes } from './anunciantes-schema';
import { campanas } from './campanas-schema';
import { contratos } from './contratos-schema';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const tipoCunaEnum = pgEnum('tipo_cuna', ['spot', 'mencion', 'auspicio', 'jingle', 'promo', 'institucional']);
export const estadoCunaEnum = pgEnum('estado_cuna', ['borrador', 'pendiente_aprobacion', 'aprobada', 'en_aire', 'pausada', 'finalizada', 'rechazada']);
export const formatoAudioEnum = pgEnum('formato_audio', ['mp3', 'wav', 'aac', 'flac', 'ogg']);

// ═══════════════════════════════════════════════════════════════
// TABLA: CUÑAS (SPOTS)
// ═══════════════════════════════════════════════════════════════

export const cunas = pgTable('cunas', {
  // Identificadores
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  codigo: varchar('codigo', { length: 30 }).notNull(), // Código único ej: "CUN-2025-0001"
  
  // Relaciones Globales (Ecosistema)
  anuncianteId: uuid('anunciante_id').references(() => anunciantes.id).notNull(),
  campanaId: uuid('campana_id').references(() => campanas.id), // Conexión directa a Campaña
  contratoId: uuid('contrato_id').references(() => contratos.id), // Conexión a Contrato
  
  // Información de la cuña
  nombre: varchar('nombre', { length: 255 }).notNull(), // Nombre descriptivo
  tipoCuna: tipoCunaEnum('tipo_cuna').default('spot').notNull(),
  descripcion: text('descripcion'),
  
  // Conexión a Productos (Futuro Módulo)
  productoId: uuid('producto_id'), // Placeholder: references(() => productos.id)
  productoNombre: varchar('producto', { length: 255 }), // Fallback visual
  campanaNombre: varchar('campana', { length: 255 }), // Legacy/Fallback visual
  
  // Información del archivo de audio
  pathAudio: text('path_audio').notNull(), // Ruta en Google Cloud Storage
  nombreArchivoOriginal: varchar('nombre_archivo_original', { length: 255 }),
  formatoAudio: formatoAudioEnum('formato_audio').default('mp3').notNull(),
  duracionSegundos: integer('duracion_segundos').notNull(), // Duración en segundos
  duracionMilisegundos: integer('duracion_milisegundos'), // Precisión adicional
  tamanoBytes: integer('tamano_bytes'),
  bitrate: integer('bitrate'), // Kbps
  sampleRate: integer('sample_rate'), // Hz
  
  // Versionado
  version: integer('version').default(1).notNull(),
  esVersionActual: boolean('es_version_actual').default(true).notNull(),
  versionAnteriorId: uuid('version_anterior_id'), // Para historial de versiones
  
  // Vigencia
  fechaInicioVigencia: timestamp('fecha_inicio_vigencia'),
  fechaFinVigencia: timestamp('fecha_fin_vigencia'),
  
  // Estado y aprobación
  estado: estadoCunaEnum('estado').default('borrador').notNull(),
  aprobadoPorId: uuid('aprobado_por_id').references(() => users.id),
  fechaAprobacion: timestamp('fecha_aprobacion'),
  motivoRechazo: text('motivo_rechazo'),
  
  // Metadatos adicionales
  fingerprint: varchar('fingerprint', { length: 64 }), // Audio fingerprint para detección
  transcripcion: text('transcripcion'), // Transcripción del audio (Speech-to-Text)
  idioma: varchar('idioma', { length: 10 }).default('es'),
  
  // Notas
  notas: text('notas'),
  
  // Auditoría
  subidoPorId: uuid('subido_por_id').references(() => users.id).notNull(),
  fechaSubida: timestamp('fecha_subida').defaultNow().notNull(),
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
  tenantIdx: index('cunas_tenant_idx').on(table.tenantId),
  anuncianteIdx: index('cunas_anunciante_idx').on(table.anuncianteId),
  campanaIdx: index('cunas_campana_idx').on(table.campanaId),
  contratoIdx: index('cunas_contrato_idx').on(table.contratoId),
  codigoIdx: index('cunas_codigo_idx').on(table.codigo),
  tipoCunaIdx: index('cunas_tipo_idx').on(table.tipoCuna),
  estadoIdx: index('cunas_estado_idx').on(table.estado),
  vigenciaIdx: index('cunas_vigencia_idx').on(table.fechaInicioVigencia, table.fechaFinVigencia),
  fingerprintIdx: index('cunas_fingerprint_idx').on(table.fingerprint)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: HISTORIAL DE REPRODUCCIONES
// ═══════════════════════════════════════════════════════════════

export const reproduccionesCuna = pgTable('reproducciones_cuna', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  cunaId: uuid('cuna_id').references(() => cunas.id, { onDelete: 'cascade' }).notNull(),
  
  // Información de reproducción
  fechaHoraReproduccion: timestamp('fecha_hora_reproduccion').notNull(),
  emisoraId: uuid('emisora_id'), // Referencia a la tabla emisoras
  programaId: uuid('programa_id'),
  bloqueId: uuid('bloque_id'),
  
  // Detección
  detectadoPorShazam: boolean('detectado_por_shazam').default(false),
  confianzaDeteccion: integer('confianza_deteccion'), // Porcentaje 0-100
  
  // Verificación
  verificado: boolean('verificado').default(false),
  verificadoPorId: uuid('verificado_por_id').references(() => users.id),
  fechaVerificacion: timestamp('fecha_verificacion'),
  
  // Auditoría
  fechaRegistro: timestamp('fecha_registro').defaultNow().notNull()
}, (table) => ({
  cunaIdx: index('reproducciones_cuna_idx').on(table.cunaId),
  fechaIdx: index('reproducciones_fecha_idx').on(table.fechaHoraReproduccion),
  emisoraIdx: index('reproducciones_emisora_idx').on(table.emisoraId)
}));

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const cunasRelations = relations(cunas, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [cunas.tenantId],
    references: [tenants.id]
  }),
  anunciante: one(anunciantes, {
    fields: [cunas.anuncianteId],
    references: [anunciantes.id]
  }),
  campana: one(campanas, {
    fields: [cunas.campanaId],
    references: [campanas.id]
  }),
  contrato: one(contratos, {
    fields: [cunas.contratoId],
    references: [contratos.id]
  }),
  subidoPor: one(users, {
    fields: [cunas.subidoPorId],
    references: [users.id]
  }),
  aprobadoPor: one(users, {
    fields: [cunas.aprobadoPorId],
    references: [users.id]
  }),
  reproducciones: many(reproduccionesCuna)
}));

export const reproduccionesCunaRelations = relations(reproduccionesCuna, ({ one }) => ({
  cuna: one(cunas, {
    fields: [reproduccionesCuna.cunaId],
    references: [cunas.id]
  })
}));

// ═══════════════════════════════════════════════════════════════
// TIPOS EXPORTADOS
// ═══════════════════════════════════════════════════════════════

export type Cuna = typeof cunas.$inferSelect;
export type NewCuna = typeof cunas.$inferInsert;
export type ReproduccionCuna = typeof reproduccionesCuna.$inferSelect;
export type TipoCuna = 'spot' | 'mencion' | 'auspicio' | 'jingle' | 'promo' | 'institucional';
export type EstadoCuna = 'borrador' | 'pendiente_aprobacion' | 'aprobada' | 'en_aire' | 'pausada' | 'finalizada' | 'rechazada';
export type FormatoAudio = 'mp3' | 'wav' | 'aac' | 'flac' | 'ogg';

// ═══════════════════════════════════════════════════════════════
// INTERFACES PARA EL FRONTEND
// ═══════════════════════════════════════════════════════════════

export interface CunaDTO {
  id: string;
  codigo: string;
  nombre: string;
  tipoCuna: TipoCuna;
  anuncianteNombre: string;
  producto: string | null;
  duracionSegundos: number;
  duracionFormateada: string; // "0:30"
  formatoAudio: FormatoAudio;
  estado: EstadoCuna;
  fechaInicioVigencia: Date | null;
  fechaFinVigencia: Date | null;
  reproduccionesTotal: number;
  fechaSubida: Date;
}

export interface CreateCunaDTO {
  anuncianteId: string;
  nombre: string;
  tipoCuna?: TipoCuna;
  descripcion?: string;
  producto?: string;
  campana?: string;
  fechaInicioVigencia?: Date;
  fechaFinVigencia?: Date;
  idioma?: string;
  notas?: string;
  // El archivo de audio se sube por separado
}

export interface UploadCunaAudioDTO {
  cunaId: string;
  file: File;
}

// ═══════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════

/**
 * Formatea la duración en segundos a formato mm:ss
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calcula si una cuña está vigente
 */
export function isCunaVigente(cuna: { fechaInicioVigencia: Date | null; fechaFinVigencia: Date | null }): boolean {
  const now = new Date();
  if (cuna.fechaInicioVigencia && now < cuna.fechaInicioVigencia) return false;
  if (cuna.fechaFinVigencia && now > cuna.fechaFinVigencia) return false;
  return true;
}
