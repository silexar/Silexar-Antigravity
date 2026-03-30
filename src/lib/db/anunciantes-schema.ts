/**
 * 🏢 SILEXAR PULSE - Anunciantes Schema
 * Schema de base de datos para el módulo de Gestión de Anunciantes
 * 
 * @description Database Schema para anunciantes (clientes publicitarios)
 * siguiendo especificaciones Fortune 10 con arquitectura multi-tenant
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { pgTable, uuid, varchar, text, timestamp, boolean, pgEnum, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { tenants } from './users-schema'

// ═══════════════════════════════════════════════════════════════
// ENUMS PARA ANUNCIANTES
// ═══════════════════════════════════════════════════════════════

export const anuncianteStatusEnum = pgEnum('anunciante_status', ['activo', 'inactivo', 'suspendido', 'pendiente'])

// ═══════════════════════════════════════════════════════════════
// TABLA PRINCIPAL: ANUNCIANTES
// ═══════════════════════════════════════════════════════════════

export const anunciantes = pgTable('anunciantes', {
  // Identificadores
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  codigo: varchar('codigo', { length: 20 }).notNull(), // Código interno ej: "ANU-0001"
  
  // Información legal/fiscal
  rut: varchar('rut', { length: 12 }), // RUT con puntos y guión (ej: 76.XXX.XXX-X)
  nombreRazonSocial: varchar('nombre_razon_social', { length: 255 }).notNull(),
  giroActividad: text('giro_actividad'), // Actividad comercial o giro SII
  
  // Dirección
  direccion: text('direccion'),
  ciudad: varchar('ciudad', { length: 100 }),
  comunaProvincia: varchar('comuna_provincia', { length: 100 }),
  pais: varchar('pais', { length: 100 }).default('Chile'),
  codigoPostal: varchar('codigo_postal', { length: 20 }),
  
  // Contacto
  emailContacto: varchar('email_contacto', { length: 255 }),
  telefonoContacto: varchar('telefono_contacto', { length: 20 }),
  paginaWeb: varchar('pagina_web', { length: 255 }),
  
  // Contacto secundario
  nombreContactoPrincipal: varchar('nombre_contacto_principal', { length: 255 }),
  cargoContactoPrincipal: varchar('cargo_contacto_principal', { length: 100 }),
  emailContactoSecundario: varchar('email_contacto_secundario', { length: 255 }),
  telefonoContactoSecundario: varchar('telefono_contacto_secundario', { length: 20 }),
  
  // Configuración de facturación
  tieneFacturacionElectronica: boolean('tiene_facturacion_electronica').default(false).notNull(),
  direccionFacturacion: text('direccion_facturacion'),
  emailFacturacion: varchar('email_facturacion', { length: 255 }),
  
  // Estado y control
  estado: anuncianteStatusEnum('estado').default('activo').notNull(),
  activo: boolean('activo').default(true).notNull(),
  
  // Notas/observaciones
  notas: text('notas'),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id'),
  fechaModificacion: timestamp('fecha_modificacion'),

  // Timestamps estándar (CLAUDE.md mandatory fields)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  // Soft delete
  eliminado: boolean('eliminado').default(false).notNull(),
  fechaEliminacion: timestamp('fecha_eliminacion'),
  eliminadoPorId: uuid('eliminado_por_id')
}, (table) => ({
  // Índices para búsquedas optimizadas
  tenantIdx: index('anunciantes_tenant_idx').on(table.tenantId),
  rutIdx: index('anunciantes_rut_idx').on(table.rut),
  nombreIdx: index('anunciantes_nombre_idx').on(table.nombreRazonSocial),
  estadoIdx: index('anunciantes_estado_idx').on(table.estado),
  activoIdx: index('anunciantes_activo_idx').on(table.activo),
  codigoIdx: index('anunciantes_codigo_idx').on(table.codigo)
}))

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const anunciantesRelations = relations(anunciantes, ({ one }) => ({
  tenant: one(tenants, {
    fields: [anunciantes.tenantId],
    references: [tenants.id]
  })
}))

// ═══════════════════════════════════════════════════════════════
// TIPOS EXPORTADOS
// ═══════════════════════════════════════════════════════════════

export type Anunciante = typeof anunciantes.$inferSelect
export type NewAnunciante = typeof anunciantes.$inferInsert
export type AnuncianteStatus = 'activo' | 'inactivo' | 'suspendido' | 'pendiente'

// ═══════════════════════════════════════════════════════════════
// INTERFACES PARA EL FRONTEND
// ═══════════════════════════════════════════════════════════════

export interface AnuncianteDTO {
  id: string
  codigo: string
  rut: string | null
  nombreRazonSocial: string
  giroActividad: string | null
  direccion: string | null
  ciudad: string | null
  comunaProvincia: string | null
  pais: string
  emailContacto: string | null
  telefonoContacto: string | null
  paginaWeb: string | null
  nombreContactoPrincipal: string | null
  tieneFacturacionElectronica: boolean
  estado: AnuncianteStatus
  activo: boolean
  fechaCreacion: Date
  fechaModificacion: Date | null
}

export interface CreateAnuncianteDTO {
  rut?: string
  nombreRazonSocial: string
  giroActividad?: string
  direccion?: string
  ciudad?: string
  comunaProvincia?: string
  pais?: string
  emailContacto?: string
  telefonoContacto?: string
  paginaWeb?: string
  nombreContactoPrincipal?: string
  cargoContactoPrincipal?: string
  tieneFacturacionElectronica?: boolean
  direccionFacturacion?: string
  emailFacturacion?: string
  notas?: string
}

export interface UpdateAnuncianteDTO extends Partial<CreateAnuncianteDTO> {
  activo?: boolean
  estado?: AnuncianteStatus
}

export interface AnuncianteFilters {
  search?: string
  estado?: AnuncianteStatus
  activo?: boolean
  ciudad?: string
  page?: number
  limit?: number
  sortBy?: keyof Anunciante
  sortOrder?: 'asc' | 'desc'
}
