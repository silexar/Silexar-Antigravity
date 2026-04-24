/**
 * 🏛️ SILEXAR PULSE - Agencias de Medios Schema
 * Schema de base de datos para el módulo de Agencias de Medios
 * 
 * @description Las agencias de medios son intermediarios entre anunciantes y emisoras
 * Gestionan la planificación, compra y ejecución de campañas publicitarias
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { pgTable, uuid, varchar, text, timestamp, boolean, decimal, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants, users } from './users-schema';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const agenciaStatusEnum = pgEnum('agencia_status', ['activa', 'inactiva', 'suspendida', 'pendiente']);
export const tipoAgenciaMediosEnum = pgEnum('tipo_agencia_medios', ['medios', 'creativa', 'digital', 'integral', 'btl']);
export const nivelColaboracionEnum = pgEnum('nivel_colaboracion', ['estrategico', 'preferencial', 'estandar', 'transaccional', 'prospecto']);

// ═══════════════════════════════════════════════════════════════
// TABLA: AGENCIAS DE MEDIOS
// ═══════════════════════════════════════════════════════════════

export const agenciasMedios = pgTable('agencias_medios', {
  // Identificadores
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  codigo: varchar('codigo', { length: 20 }).notNull(), // Código interno ej: "AGM-0001"

  // Información legal
  rut: varchar('rut', { length: 12 }),
  nombreRazonSocial: varchar('nombre_razon_social', { length: 255 }).notNull(),
  nombreComercial: varchar('nombre_comercial', { length: 255 }), // Nombre de fantasía
  giroActividad: text('giro_actividad'),
  tipoAgencia: tipoAgenciaMediosEnum('tipo_agencia').default('medios').notNull(),

  // Dirección
  direccion: text('direccion'),
  ciudad: varchar('ciudad', { length: 100 }),
  comunaProvincia: varchar('comuna_provincia', { length: 100 }),
  pais: varchar('pais', { length: 100 }).default('Chile'),
  codigoPostal: varchar('codigo_postal', { length: 20 }),

  // Contacto principal
  emailContacto: varchar('email_contacto', { length: 255 }),
  telefonoContacto: varchar('telefono_contacto', { length: 20 }),
  paginaWeb: varchar('pagina_web', { length: 255 }),

  // Ejecutivo de cuenta asignado
  nombreEjecutivo: varchar('nombre_ejecutivo', { length: 255 }),
  emailEjecutivo: varchar('email_ejecutivo', { length: 255 }),
  telefonoEjecutivo: varchar('telefono_ejecutivo', { length: 20 }),

  // Comisiones
  comisionPorcentaje: decimal('comision_porcentaje', { precision: 5, scale: 2 }).default('15.00'), // 15% por defecto
  comisionFija: decimal('comision_fija', { precision: 12, scale: 2 }),
  tipoComision: varchar('tipo_comision', { length: 20 }).default('porcentaje'), // 'porcentaje', 'fija', 'mixta'

  // Campos extendidos para el nuevo módulo TIER 0
  nivelColaboracion: nivelColaboracionEnum('nivel_colaboracion').default('estandar'),
  scorePartnership: decimal('score_partnership', { precision: 5, scale: 2 }).default('500.00'), // 0-1000
  tendenciaScore: varchar('tendencia_score', { length: 10 }).default('stable'), // 'up', 'down', 'stable'
  fechaUltimaActualizacionScore: timestamp('fecha_ultima_actualizacion_score'),

  // Especializaciones y capacidades (JSON)
  especializacionesVerticales: text('especializaciones_verticales'), // JSON array
  capacidadesDigitales: text('capacidades_digitales'), // JSON array
  certificaciones: text('certificaciones'), // JSON array

  // Información financiera extendida
  revenueAnual: decimal('revenue_anual', { precision: 14, scale: 2 }),
  fechaFundacion: timestamp('fecha_fundacion'),
  empleadosCantidad: decimal('empleados_cantidad', { precision: 8, scale: 0 }),
  region: varchar('region', { length: 100 }),

  // Configuración de facturación
  tieneFacturacionElectronica: boolean('tiene_facturacion_electronica').default(false).notNull(),
  diasCredito: varchar('dias_credito', { length: 10 }).default('30'), // 30, 45, 60 días
  emailFacturacion: varchar('email_facturacion', { length: 255 }),

  // Estado y control
  estado: agenciaStatusEnum('estado').default('activa').notNull(),
  activa: boolean('activa').default(true).notNull(),

  // Notas
  notas: text('notas'),

  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion'),

  // Soft delete
  eliminado: boolean('eliminado').default(false).notNull(),
  fechaEliminacion: timestamp('fecha_eliminacion'),
  eliminadoPorId: uuid('eliminado_por_id')
}, (table) => ({
  // Índices para búsquedas
  tenantIdx: index('agencias_medios_tenant_idx').on(table.tenantId),
  rutIdx: index('agencias_medios_rut_idx').on(table.rut),
  nombreIdx: index('agencias_medios_nombre_idx').on(table.nombreRazonSocial),
  estadoIdx: index('agencias_medios_estado_idx').on(table.estado),
  tipoIdx: index('agencias_medios_tipo_idx').on(table.tipoAgencia),
  codigoIdx: index('agencias_medios_codigo_idx').on(table.codigo)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: CONTACTOS DE AGENCIA
// ═══════════════════════════════════════════════════════════════

export const contactosAgencia = pgTable('contactos_agencia', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  agenciaId: uuid('agencia_id').references(() => agenciasMedios.id, { onDelete: 'cascade' }).notNull(),

  // Datos del contacto
  nombre: varchar('nombre', { length: 255 }).notNull(),
  apellido: varchar('apellido', { length: 255 }),
  cargo: varchar('cargo', { length: 100 }),
  departamento: varchar('departamento', { length: 100 }),
  email: varchar('email', { length: 255 }),
  telefono: varchar('telefono', { length: 20 }),
  telefonoMovil: varchar('telefono_movil', { length: 20 }),

  // Campos extendidos para TIER 0
  rol: varchar('rol', { length: 50 }).default('contact_principal'),
  nivelDecision: varchar('nivel_decision', { length: 20 }).default('operativo'),
  esDecisor: boolean('es_decisor').default(false),
  esInfluencer: boolean('es_influencer').default(false),
  linkedIn: varchar('linkedin', { length: 255 }),
  fotoUrl: varchar('foto_url', { length: 255 }),
  notas: text('notas'),

  // Rol del contacto
  esPrincipal: boolean('es_principal').default(false).notNull(),
  recibeFacturas: boolean('recibe_facturas').default(false).notNull(),
  recibeReportes: boolean('recibe_reportes').default(false).notNull(),

  // Estado
  activo: boolean('activo').default(true).notNull(),

  // Auditoría
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  fechaModificacion: timestamp('fecha_modificacion')
}, (table) => ({
  agenciaIdx: index('contactos_agencia_agencia_idx').on(table.agenciaId),
  tenantIdx: index('contactos_agencia_tenant_idx').on(table.tenantId)
}));

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const agenciasMediosRelations = relations(agenciasMedios, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [agenciasMedios.tenantId],
    references: [tenants.id]
  }),
  creadoPor: one(users, {
    fields: [agenciasMedios.creadoPorId],
    references: [users.id]
  }),
  contactos: many(contactosAgencia)
}));

export const contactosAgenciaRelations = relations(contactosAgencia, ({ one }) => ({
  agencia: one(agenciasMedios, {
    fields: [contactosAgencia.agenciaId],
    references: [agenciasMedios.id]
  })
}));

// ═══════════════════════════════════════════════════════════════
// TIPOS EXPORTADOS
// ═══════════════════════════════════════════════════════════════

export type AgenciaMedios = typeof agenciasMedios.$inferSelect;
export type NewAgenciaMedios = typeof agenciasMedios.$inferInsert;
export type ContactoAgencia = typeof contactosAgencia.$inferSelect;
export type NewContactoAgencia = typeof contactosAgencia.$inferInsert;
export type AgenciaStatus = 'activa' | 'inactiva' | 'suspendida' | 'pendiente';
export type TipoAgencia = 'medios' | 'creativa' | 'digital' | 'integral' | 'btl';

// ═══════════════════════════════════════════════════════════════
// INTERFACES PARA EL FRONTEND
// ═══════════════════════════════════════════════════════════════

export interface AgenciaMediosDTO {
  id: string;
  codigo: string;
  rut: string | null;
  nombreRazonSocial: string;
  nombreComercial: string | null;
  tipoAgencia: TipoAgencia;
  ciudad: string | null;
  emailContacto: string | null;
  telefonoContacto: string | null;
  comisionPorcentaje: number;
  estado: AgenciaStatus;
  activa: boolean;
  fechaCreacion: Date;
}

export interface CreateAgenciaMediosDTO {
  rut?: string;
  nombreRazonSocial: string;
  nombreComercial?: string;
  tipoAgencia?: TipoAgencia;
  giroActividad?: string;
  direccion?: string;
  ciudad?: string;
  comunaProvincia?: string;
  pais?: string;
  emailContacto?: string;
  telefonoContacto?: string;
  paginaWeb?: string;
  nombreEjecutivo?: string;
  emailEjecutivo?: string;
  telefonoEjecutivo?: string;
  comisionPorcentaje?: number;
  diasCredito?: string;
  tieneFacturacionElectronica?: boolean;
  emailFacturacion?: string;
  notas?: string;
}

export interface UpdateAgenciaMediosDTO extends Partial<CreateAgenciaMediosDTO> {
  activa?: boolean;
  estado?: AgenciaStatus;
}
