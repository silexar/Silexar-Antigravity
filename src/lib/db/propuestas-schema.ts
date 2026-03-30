/**
 * 📊 SILEXAR PULSE - Propuestas Comerciales Schema
 * Schema de base de datos para el módulo de Propuestas
 * 
 * @description Las propuestas son documentos comerciales que se envían
 * a clientes potenciales con proyecciones de alcance, inversión y ROI
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { pgTable, uuid, varchar, text, timestamp, boolean, integer, decimal, pgEnum, index, date, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants, users } from './users-schema';
import { anunciantes } from './anunciantes-schema';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const estadoPropuestaEnum = pgEnum('estado_propuesta', [
  'borrador',
  'enviada',
  'vista',
  'en_negociacion',
  'aprobada',
  'rechazada',
  'expirada'
]);

// ═══════════════════════════════════════════════════════════════
// TABLA: PROPUESTAS COMERCIALES
// ═══════════════════════════════════════════════════════════════

export const propuestasComerciales = pgTable('propuestas_comerciales', {
  // Identificadores
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  codigo: varchar('codigo', { length: 30 }).notNull(), // PROP-2025-0001
  
  // Relaciones
  anuncianteId: uuid('anunciante_id').references(() => anunciantes.id),
  ejecutivoId: uuid('ejecutivo_id').references(() => users.id).notNull(),
  
  // Datos del cliente
  clienteNombre: varchar('cliente_nombre', { length: 255 }).notNull(),
  contactoNombre: varchar('contacto_nombre', { length: 255 }),
  contactoEmail: varchar('contacto_email', { length: 255 }),
  contactoTelefono: varchar('contacto_telefono', { length: 50 }),
  
  // Contenido
  titulo: varchar('titulo', { length: 255 }).notNull(),
  descripcion: text('descripcion'),
  objetivo: text('objetivo'),
  
  // Fechas de campaña propuesta
  fechaInicioPropuesta: date('fecha_inicio_propuesta'),
  fechaFinPropuesta: date('fecha_fin_propuesta'),
  
  // Mix de medios (JSON)
  mixMediosFm: jsonb('mix_medios_fm'), // [{emisoraId, nombre, spots, costo}, ...]
  mixMediosDigital: jsonb('mix_medios_digital'), // [{formato, impresiones, costo}, ...]
  
  // Financiero
  presupuestoTotal: decimal('presupuesto_total', { precision: 14, scale: 2 }),
  descuentoOfrecido: decimal('descuento_ofrecido', { precision: 5, scale: 2 }).default('0'),
  moneda: varchar('moneda', { length: 3 }).default('CLP'),
  
  // Proyecciones
  reachEstimado: decimal('reach_estimado', { precision: 5, scale: 2 }),
  frequencyEstimado: decimal('frequency_estimado', { precision: 5, scale: 2 }),
  grpsEstimados: decimal('grps_estimados', { precision: 10, scale: 2 }),
  audienciaEstimada: integer('audiencia_estimada'),
  impresionesDigitales: integer('impresiones_digitales'),
  
  // Archivos
  pdfUrl: text('pdf_url'),
  linkPublico: varchar('link_publico', { length: 100 }), // Token para acceso sin login
  
  // Estado
  estado: estadoPropuestaEnum('estado').default('borrador').notNull(),
  
  // Tracking
  fechaEnvio: timestamp('fecha_envio'),
  fechaPrimeraVista: timestamp('fecha_primera_vista'),
  vecesVista: integer('veces_vista').default(0),
  fechaRespuesta: timestamp('fecha_respuesta'),
  motivoRechazo: text('motivo_rechazo'),
  
  // Validez
  fechaExpiracion: date('fecha_expiracion'),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion'),
  
  // Soft delete
  eliminado: boolean('eliminado').default(false).notNull()
}, (table) => ({
  tenantIdx: index('propuestas_tenant_idx').on(table.tenantId),
  codigoIdx: index('propuestas_codigo_idx').on(table.codigo),
  anuncianteIdx: index('propuestas_anunciante_idx').on(table.anuncianteId),
  ejecutivoIdx: index('propuestas_ejecutivo_idx').on(table.ejecutivoId),
  estadoIdx: index('propuestas_estado_idx').on(table.estado),
  linkPublicoIdx: index('propuestas_link_idx').on(table.linkPublico)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: TEMPLATES DE CAMPAÑA
// ═══════════════════════════════════════════════════════════════

export const templatesCampana = pgTable('templates_campana', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Identificación
  nombre: varchar('nombre', { length: 255 }).notNull(),
  descripcion: text('descripcion'),
  categoria: varchar('categoria', { length: 50 }).default('custom'),
  medioCampana: varchar('medio_campana', { length: 20 }).default('hibrido'), // fm, digital, hibrido
  
  // Configuración guardada (JSON)
  configuracion: jsonb('configuracion').notNull(),
  /* Estructura:
  {
    duracionDias: number,
    spotsPorDia: number,
    duracionSpot: number,
    horariosPreferidos: string[],
    emisorasDefault: string[],
    patron: string,
    incluirDigital: boolean,
    formatosDigitales: string[],
    targetingDefault: object
  }
  */
  
  // Stats
  favorito: boolean('favorito').default(false),
  usosCount: integer('usos_count').default(0),
  ultimoUso: timestamp('ultimo_uso'),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion'),
  
  // Soft delete
  eliminado: boolean('eliminado').default(false).notNull()
}, (table) => ({
  tenantIdx: index('templates_tenant_idx').on(table.tenantId),
  categoriaIdx: index('templates_categoria_idx').on(table.categoria),
  creadoPorIdx: index('templates_creador_idx').on(table.creadoPorId)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: ASIGNACIONES DE TURNO
// ═══════════════════════════════════════════════════════════════

export const asignacionesTurno = pgTable('asignaciones_turno', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Operador
  operadorId: uuid('operador_id').references(() => users.id).notNull(),
  
  // Turno
  fecha: date('fecha').notNull(),
  turnoInicio: timestamp('turno_inicio').notNull(),
  turnoFin: timestamp('turno_fin').notNull(),
  
  // Emisoras asignadas (JSON array de IDs)
  emisorasAsignadas: jsonb('emisoras_asignadas'),
  
  // Estadísticas del turno
  campanasAsignadas: integer('campanas_asignadas').default(0),
  campanasCompletadas: integer('campanas_completadas').default(0),
  spotsProgamados: integer('spots_programados').default(0),
  
  // Estado
  activo: boolean('activo').default(true),
  
  // Notas
  notas: text('notas'),
  
  // Auditoría
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull()
}, (table) => ({
  operadorIdx: index('turnos_operador_idx').on(table.operadorId),
  fechaIdx: index('turnos_fecha_idx').on(table.fecha)
}));

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const propuestasComercialesRelations = relations(propuestasComerciales, ({ one }) => ({
  tenant: one(tenants, { fields: [propuestasComerciales.tenantId], references: [tenants.id] }),
  anunciante: one(anunciantes, { fields: [propuestasComerciales.anuncianteId], references: [anunciantes.id] }),
  ejecutivo: one(users, { fields: [propuestasComerciales.ejecutivoId], references: [users.id] }),
  creadoPor: one(users, { fields: [propuestasComerciales.creadoPorId], references: [users.id] })
}));

export const templatesCampanaRelations = relations(templatesCampana, ({ one }) => ({
  tenant: one(tenants, { fields: [templatesCampana.tenantId], references: [tenants.id] }),
  creadoPor: one(users, { fields: [templatesCampana.creadoPorId], references: [users.id] })
}));

export const asignacionesTurnoRelations = relations(asignacionesTurno, ({ one }) => ({
  tenant: one(tenants, { fields: [asignacionesTurno.tenantId], references: [tenants.id] }),
  operador: one(users, { fields: [asignacionesTurno.operadorId], references: [users.id] })
}));

// ═══════════════════════════════════════════════════════════════
// TIPOS EXPORTADOS
// ═══════════════════════════════════════════════════════════════

export type PropuestaComercial = typeof propuestasComerciales.$inferSelect;
export type NewPropuestaComercial = typeof propuestasComerciales.$inferInsert;
export type TemplateCampana = typeof templatesCampana.$inferSelect;
export type NewTemplateCampana = typeof templatesCampana.$inferInsert;
export type AsignacionTurno = typeof asignacionesTurno.$inferSelect;
export type EstadoPropuesta = 'borrador' | 'enviada' | 'vista' | 'en_negociacion' | 'aprobada' | 'rechazada' | 'expirada';

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

export interface PropuestaDTO {
  id: string;
  codigo: string;
  titulo: string;
  clienteNombre: string;
  estado: EstadoPropuesta;
  presupuestoTotal: number;
  reachEstimado: number;
  fechaCreacion: Date;
  fechaEnvio?: Date;
  ejecutivoNombre: string;
}

export interface DashboardTurnoDTO {
  operadorId: string;
  operadorNombre: string;
  turnoActual: {
    inicio: Date;
    fin: Date;
  };
  inbox: {
    nuevas: number;
    modificaciones: number;
    confirmaciones: number;
    urgentes: number;
  };
  stats: {
    programadas: number;
    enProceso: number;
    pendientes: number;
    completadasHoy: number;
    spotsHoy: number;
  };
  alertas: Array<{
    id: string;
    tipo: 'critica' | 'advertencia' | 'info';
    mensaje: string;
    campanaId?: string;
  }>;
}
