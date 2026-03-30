/**
 * 📎 SILEXAR PULSE - Archivos Adjuntos Schema
 * Schema genérico polimórfico para archivos adjuntos
 * 
 * @description Tabla genérica que permite asociar archivos a cualquier módulo
 * (anunciantes, agencias, contratos, campañas, etc.) usando un sistema polimórfico
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { pgTable, uuid, varchar, text, timestamp, integer, pgEnum, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { tenants, users } from './users-schema'

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const moduloAsociadoEnum = pgEnum('modulo_asociado', [
  'anunciantes',
  'agencias_medios',
  'agencias_creativas',
  'contratos',
  'campanas',
  'cunas',
  'emisoras',
  'vendedores',
  'productos',
  'facturas'
])

export const tipoArchivoEnum = pgEnum('tipo_archivo_categoria', [
  'documento',
  'imagen',
  'audio',
  'video',
  'otro'
])

// ═══════════════════════════════════════════════════════════════
// TABLA: ARCHIVOS ADJUNTOS
// ═══════════════════════════════════════════════════════════════

export const archivosAdjuntos = pgTable('archivos_adjuntos', {
  // Identificadores
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Información del archivo
  nombreArchivo: varchar('nombre_archivo', { length: 255 }).notNull(),
  nombreOriginal: varchar('nombre_original', { length: 255 }).notNull(),
  pathStorage: text('path_storage').notNull(), // Ruta en Google Cloud Storage
  
  // Metadatos del archivo
  tipoMime: varchar('tipo_mime', { length: 100 }).notNull(), // ej: application/pdf, image/jpeg
  categoria: tipoArchivoEnum('categoria').default('documento').notNull(),
  tamanoBytes: integer('tamano_bytes').notNull(),
  extension: varchar('extension', { length: 20 }), // ej: pdf, jpg, mp3
  
  // Asociación polimórfica
  moduloAsociado: moduloAsociadoEnum('modulo_asociado').notNull(),
  registroAsociadoId: uuid('registro_asociado_id').notNull(),
  
  // Descripción/notas
  descripcion: text('descripcion'),
  
  // Control de versiones
  version: integer('version').default(1).notNull(),
  esVersionActual: boolean('es_version_actual').default(true).notNull(),
  archivoAnteriorId: uuid('archivo_anterior_id'), // Para versionado
  
  // Auditoría
  subidoPorId: uuid('subido_por_id').references(() => users.id).notNull(),
  fechaSubida: timestamp('fecha_subida').defaultNow().notNull(),
  
  // Soft delete
  eliminado: boolean('eliminado').default(false).notNull(),
  fechaEliminacion: timestamp('fecha_eliminacion'),
  eliminadoPorId: uuid('eliminado_por_id')
}, (table) => ({
  // Índices para búsquedas optimizadas
  tenantIdx: index('archivos_tenant_idx').on(table.tenantId),
  moduloIdx: index('archivos_modulo_idx').on(table.moduloAsociado),
  registroIdx: index('archivos_registro_idx').on(table.registroAsociadoId),
  moduloRegistroIdx: index('archivos_modulo_registro_idx').on(table.moduloAsociado, table.registroAsociadoId),
  tipoMimeIdx: index('archivos_tipo_mime_idx').on(table.tipoMime)
}))

// Importar boolean después de usarlo
import { boolean } from 'drizzle-orm/pg-core'

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const archivosAdjuntosRelations = relations(archivosAdjuntos, ({ one }) => ({
  tenant: one(tenants, {
    fields: [archivosAdjuntos.tenantId],
    references: [tenants.id]
  }),
  subidoPor: one(users, {
    fields: [archivosAdjuntos.subidoPorId],
    references: [users.id]
  })
}))

// ═══════════════════════════════════════════════════════════════
// TIPOS EXPORTADOS
// ═══════════════════════════════════════════════════════════════

export type ArchivoAdjunto = typeof archivosAdjuntos.$inferSelect
export type NewArchivoAdjunto = typeof archivosAdjuntos.$inferInsert
export type ModuloAsociado = 
  | 'anunciantes' 
  | 'agencias_medios' 
  | 'agencias_creativas' 
  | 'contratos' 
  | 'campanas' 
  | 'cunas' 
  | 'emisoras' 
  | 'vendedores' 
  | 'productos' 
  | 'facturas'

export type TipoArchivoCategoria = 'documento' | 'imagen' | 'audio' | 'video' | 'otro'

// ═══════════════════════════════════════════════════════════════
// INTERFACES PARA EL FRONTEND
// ═══════════════════════════════════════════════════════════════

export interface ArchivoAdjuntoDTO {
  id: string
  nombreArchivo: string
  nombreOriginal: string
  tipoMime: string
  categoria: TipoArchivoCategoria
  tamanoBytes: number
  tamanoFormateado: string // Calculado: "2.5 MB"
  extension: string | null
  descripcion: string | null
  subidoPorNombre: string
  fechaSubida: Date
  urlDescarga: string // URL firmada de GCS
}

export interface UploadArchivoDTO {
  moduloAsociado: ModuloAsociado
  registroAsociadoId: string
  descripcion?: string
}

export interface ArchivoFilters {
  moduloAsociado?: ModuloAsociado
  registroAsociadoId?: string
  categoria?: TipoArchivoCategoria
  search?: string
}

// ═══════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════

/**
 * Formatea el tamaño del archivo en formato legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Determina la categoría del archivo basado en el tipo MIME
 */
export function determinarCategoria(tipoMime: string): TipoArchivoCategoria {
  if (tipoMime.startsWith('image/')) return 'imagen'
  if (tipoMime.startsWith('audio/')) return 'audio'
  if (tipoMime.startsWith('video/')) return 'video'
  if (tipoMime.includes('pdf') || tipoMime.includes('document') || tipoMime.includes('spreadsheet')) return 'documento'
  return 'otro'
}
