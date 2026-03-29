/**
 * 📣 SILEXAR PULSE - Campañas Radiales Schema
 * Schema de base de datos para el módulo de Campañas
 * 
 * @description Las campañas son conjuntos de spots que se emiten en múltiples emisoras
 * con programación específica, presupuesto y métricas de rendimiento
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { pgTable, uuid, varchar, text, timestamp, boolean, integer, decimal, pgEnum, index, date, time } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants, users } from './users-schema';
import { anunciantes } from './anunciantes-schema';
import { agenciasMedios } from './agencias-medios-schema';
import { contratos } from './contratos-schema';
import { cunas } from './cunas-schema';
import { emisoras } from './emisoras-schema';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const estadoCampanaEnum = pgEnum('estado_campana', [
  'planificacion',
  'armada',           // Campaña armada pero no planificada (falta especificaciones en contrato)
  'aprobacion',
  'confirmada',       // Campaña confirmada/aprobada
  'programada',
  'en_aire',
  'pausada',
  'completada',
  'cancelada'
]);

export const tipoCampanaEnum = pgEnum('tipo_campana', [
  'branding',
  'promocional',
  'lanzamiento',
  'estacional',
  'institucional',
  'evento',
  'mantencion'
]);

export const prioridadCampanaEnum = pgEnum('prioridad_campana', ['baja', 'normal', 'alta', 'urgente']);

// ═══════════════════════════════════════════════════════════════
// TABLA: CAMPAÑAS
// ═══════════════════════════════════════════════════════════════

export const campanas = pgTable('campanas', {
  // Identificadores
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  codigo: varchar('codigo', { length: 30 }).notNull(), // CAM-2025-0001
  
  // Relaciones
  anuncianteId: uuid('anunciante_id').references(() => anunciantes.id).notNull(),
  agenciaId: uuid('agencia_id').references(() => agenciasMedios.id),
  contratoId: uuid('contrato_id').references(() => contratos.id),
  
  // Información de la campaña
  nombre: varchar('nombre', { length: 255 }).notNull(),
  descripcion: text('descripcion'),
  tipoCampana: tipoCampanaEnum('tipo_campana').default('promocional').notNull(),
  prioridad: prioridadCampanaEnum('prioridad').default('normal').notNull(),
  
  // Período de emisión
  fechaInicio: date('fecha_inicio').notNull(),
  fechaFin: date('fecha_fin').notNull(),
  
  // Presupuesto
  presupuestoTotal: decimal('presupuesto_total', { precision: 14, scale: 2 }),
  presupuestoConsumido: decimal('presupuesto_consumido', { precision: 14, scale: 2 }).default('0'),
  moneda: varchar('moneda', { length: 3 }).default('CLP'),
  
  // Objetivos
  objetivoSpots: integer('objetivo_spots'), // Total de spots a emitir
  objetivoGrps: decimal('objetivo_grps', { precision: 10, scale: 2 }), // Gross Rating Points
  objetivoReach: decimal('objetivo_reach', { precision: 5, scale: 2 }), // % de alcance
  
  // Resultados
  spotsEmitidos: integer('spots_emitidos').default(0),
  spotsConfirmados: integer('spots_confirmados').default(0),
  grpsAlcanzados: decimal('grps_alcanzados', { precision: 10, scale: 2 }).default('0'),
  
  // Estado
  estado: estadoCampanaEnum('estado').default('planificacion').notNull(),
  
  // Notas
  notas: text('notas'),
  
  // Ejecutivo asignado
  ejecutivoId: uuid('ejecutivo_id').references(() => users.id),
  
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
  
  // Control de Facturación y Modificación
  facturada: boolean('facturada').default(false).notNull(),
  fechaFacturacion: timestamp('fecha_facturacion'),
  facturaId: uuid('factura_id'), // Referencia a la factura
  bloqueadaParaEdicion: boolean('bloqueada_para_edicion').default(false).notNull(),
  desbloqueadaPorId: uuid('desbloqueada_por_id').references(() => users.id),
  fechaDesbloqueo: timestamp('fecha_desbloqueo'),
  motivoDesbloqueo: text('motivo_desbloqueo'),
  
  // Validación de especificaciones
  especificacionesValidadas: boolean('especificaciones_validadas').default(false).notNull(),
  motivoBloqueoEspecificaciones: text('motivo_bloqueo_especificaciones')
}, (table) => ({
  tenantIdx: index('campanas_tenant_idx').on(table.tenantId),
  codigoIdx: index('campanas_codigo_idx').on(table.codigo),
  anuncianteIdx: index('campanas_anunciante_idx').on(table.anuncianteId),
  estadoIdx: index('campanas_estado_idx').on(table.estado),
  fechasIdx: index('campanas_fechas_idx').on(table.fechaInicio, table.fechaFin),
  ejecutivoIdx: index('campanas_ejecutivo_idx').on(table.ejecutivoId)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: CUÑAS DE CAMPAÑA (Spots asignados)
// ═══════════════════════════════════════════════════════════════

export const campanasCunas = pgTable('campanas_cunas', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  campanaId: uuid('campana_id').references(() => campanas.id, { onDelete: 'cascade' }).notNull(),
  cunaId: uuid('cuna_id').references(() => cunas.id).notNull(),
  
  // Peso/Prioridad de la cuña en la campaña
  pesoRotacion: integer('peso_rotacion').default(1), // Para rotación ponderada
  prioridad: integer('prioridad').default(0),
  
  // Estado
  activo: boolean('activo').default(true).notNull(),
  
  // Auditoría
  fechaAsignacion: timestamp('fecha_asignacion').defaultNow().notNull()
}, (table) => ({
  campanaIdx: index('campanas_cunas_campana_idx').on(table.campanaId),
  cunaIdx: index('campanas_cunas_cuna_idx').on(table.cunaId)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: EMISORAS DE CAMPAÑA (Medios contratados)
// ═══════════════════════════════════════════════════════════════

export const campanasEmisoras = pgTable('campanas_emisoras', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  campanaId: uuid('campana_id').references(() => campanas.id, { onDelete: 'cascade' }).notNull(),
  emisoraId: uuid('emisora_id').references(() => emisoras.id).notNull(),
  
  // Cupos/Spots asignados a esta emisora
  spotsContratados: integer('spots_contratados').notNull(),
  spotsEmitidos: integer('spots_emitidos').default(0),
  
  // Costo específico
  costoTotal: decimal('costo_total', { precision: 14, scale: 2 }),
  
  // Notas
  notas: text('notas'),
  
  // Estado
  activo: boolean('activo').default(true).notNull()
}, (table) => ({
  campanaIdx: index('campanas_emisoras_campana_idx').on(table.campanaId),
  emisoraIdx: index('campanas_emisoras_emisora_idx').on(table.emisoraId)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: PAUTA DE CAMPAÑA (Programación detallada)
// ═══════════════════════════════════════════════════════════════

export const pautaCampana = pgTable('pauta_campana', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  campanaId: uuid('campana_id').references(() => campanas.id, { onDelete: 'cascade' }).notNull(),
  emisoraId: uuid('emisora_id').references(() => emisoras.id).notNull(),
  cunaId: uuid('cuna_id').references(() => cunas.id).notNull(),
  
  // Programación
  fecha: date('fecha').notNull(),
  horaInicio: time('hora_inicio').notNull(),
  horaFin: time('hora_fin'),
  bloqueId: uuid('bloque_id'), // Referencia al bloque comercial
  
  // Estado de emisión
  programado: boolean('programado').default(true).notNull(),
  emitido: boolean('emitido').default(false).notNull(),
  confirmado: boolean('confirmado').default(false).notNull(),
  
  // Timestamps de emisión real
  horaEmisionReal: time('hora_emision_real'),
  fechaHoraConfirmacion: timestamp('fecha_hora_confirmacion'),
  
  // Método de confirmación
  metodoConfirmacion: varchar('metodo_confirmacion', { length: 50 }), // 'manual', 'shazam', 'automatico'
  confianzaConfirmacion: integer('confianza_confirmacion'), // 0-100
  
  // Notas
  notas: text('notas'),
  
  // Auditoría
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull()
}, (table) => ({
  campanaIdx: index('pauta_campana_idx').on(table.campanaId),
  emisoraIdx: index('pauta_emisora_idx').on(table.emisoraId),
  fechaIdx: index('pauta_fecha_idx').on(table.fecha),
  horarioIdx: index('pauta_horario_idx').on(table.fecha, table.horaInicio)
}));

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const campanasRelations = relations(campanas, ({ one, many }) => ({
  tenant: one(tenants, { fields: [campanas.tenantId], references: [tenants.id] }),
  anunciante: one(anunciantes, { fields: [campanas.anuncianteId], references: [anunciantes.id] }),
  agencia: one(agenciasMedios, { fields: [campanas.agenciaId], references: [agenciasMedios.id] }),
  contrato: one(contratos, { fields: [campanas.contratoId], references: [contratos.id] }),
  ejecutivo: one(users, { fields: [campanas.ejecutivoId], references: [users.id] }),
  creadoPor: one(users, { fields: [campanas.creadoPorId], references: [users.id] }),
  cunas: many(campanasCunas),
  emisoras: many(campanasEmisoras),
  pauta: many(pautaCampana)
}));

export const campanasCunasRelations = relations(campanasCunas, ({ one }) => ({
  campana: one(campanas, { fields: [campanasCunas.campanaId], references: [campanas.id] }),
  cuna: one(cunas, { fields: [campanasCunas.cunaId], references: [cunas.id] })
}));

export const campanasEmisorasRelations = relations(campanasEmisoras, ({ one }) => ({
  campana: one(campanas, { fields: [campanasEmisoras.campanaId], references: [campanas.id] }),
  emisora: one(emisoras, { fields: [campanasEmisoras.emisoraId], references: [emisoras.id] })
}));

export const pautaCampanaRelations = relations(pautaCampana, ({ one }) => ({
  campana: one(campanas, { fields: [pautaCampana.campanaId], references: [campanas.id] }),
  emisora: one(emisoras, { fields: [pautaCampana.emisoraId], references: [emisoras.id] }),
  cuna: one(cunas, { fields: [pautaCampana.cunaId], references: [cunas.id] })
}));

// ═══════════════════════════════════════════════════════════════
// TIPOS EXPORTADOS
// ═══════════════════════════════════════════════════════════════

export type Campana = typeof campanas.$inferSelect;
export type NewCampana = typeof campanas.$inferInsert;
export type CampanaCuna = typeof campanasCunas.$inferSelect;
export type CampanaEmisora = typeof campanasEmisoras.$inferSelect;
export type PautaCampana = typeof pautaCampana.$inferSelect;
export type EstadoCampana = 'planificacion' | 'armada' | 'aprobacion' | 'confirmada' | 'programada' | 'en_aire' | 'pausada' | 'completada' | 'cancelada';
export type TipoCampana = 'branding' | 'promocional' | 'lanzamiento' | 'estacional' | 'institucional' | 'evento' | 'mantencion';

// ═══════════════════════════════════════════════════════════════
// INTERFACES PARA EL FRONTEND
// ═══════════════════════════════════════════════════════════════

export interface CampanaDTO {
  id: string;
  codigo: string;
  nombre: string;
  anuncianteNombre: string;
  tipoCampana: TipoCampana;
  fechaInicio: Date;
  fechaFin: Date;
  presupuestoTotal: number | null;
  presupuestoConsumido: number;
  estado: EstadoCampana;
  objetivoSpots: number | null;
  spotsEmitidos: number;
  porcentajeAvance: number;
  emisorasCount: number;
  cunasCount: number;
  ejecutivoNombre: string | null;
}
