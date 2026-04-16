/**
 * 📝 SILEXAR PULSE - Contratos Schema
 * Schema de base de datos para el módulo de Contratos
 * 
 * @description Los contratos definen los acuerdos comerciales entre anunciantes/agencias
 * y las emisoras, incluyendo condiciones, tarifas y vigencias
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { pgTable, uuid, varchar, text, timestamp, boolean, integer, decimal, pgEnum, index, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants, users } from './users-schema';
import { anunciantes } from './anunciantes-schema';
import { agenciasMedios } from './agencias-medios-schema';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const estadoContratoEnum = pgEnum('estado_contrato', [
  'borrador', 
  'pendiente_evidencia',    // Anti-fraude: falta evidencia de negociación
  'pendiente_aprobacion', 
  'aprobado_parcial',       // Anti-fraude: algunas aprobaciones pendientes
  'pendiente_reaprobacion', // Anti-fraude: requiere nueva aprobación por cambios
  'operativo',              // Anti-fraude: completamente autorizado, puede crear campañas
  'aprobado', 
  'activo', 
  'pausado', 
  'completado', 
  'cancelado', 
  'vencido'
]);

export const tipoContratoEnum = pgEnum('tipo_contrato', [
  'anual', 
  'semestral', 
  'trimestral', 
  'mensual', 
  'campaña', 
  'evento', 
  'marco'
]);

// Anti-fraude: Tipo de cliente para reglas de validación
export const tipoClienteEnum = pgEnum('tipo_cliente', [
  'comercial',     // Cliente normal - requiere todas las validaciones
  'asistencia',    // Asistencia social - excepciones en validación
  'beneficencia'   // Beneficencia - excepciones en validación
]);

export const modalidadPagoEnum = pgEnum('modalidad_pago', [
  'anticipado', 
  'mensual', 
  'por_emisiones', 
  'post_pago', 
  'mixto'
]);

export const medioContratoEnum = pgEnum('medio_contrato', ['fm', 'digital', 'hibrido']);

// ═══════════════════════════════════════════════════════════════
// TABLA: CONTRATOS
// ═══════════════════════════════════════════════════════════════

export const contratos = pgTable('contratos', {
  // Identificadores
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  numeroContrato: varchar('numero_contrato', { length: 30 }).notNull().unique(), // CON-2025-0001
  
  // Relaciones - Cliente (Anunciante o Agencia)
  anuncianteId: uuid('anunciante_id').references(() => anunciantes.id, { onDelete: 'restrict' }),
  agenciaId: uuid('agencia_id').references(() => agenciasMedios.id, { onDelete: 'restrict' }),
  esDirecto: boolean('es_directo').default(false).notNull(), // Si es contrato directo o a través de agencia
  tipoCliente: tipoClienteEnum('tipo_cliente').default('comercial').notNull(), // Anti-fraude: tipo de cliente
  
  // Información del contrato
  titulo: varchar('titulo', { length: 255 }).notNull(),
  descripcion: text('descripcion'),
  tipoContrato: tipoContratoEnum('tipo_contrato').default('campaña').notNull(),
  medio: medioContratoEnum('medio').default('fm').notNull(),
  
  // Vigencia
  fechaInicio: date('fecha_inicio').notNull(),
  fechaFin: date('fecha_fin').notNull(),
  fechaFirma: date('fecha_firma'),
  
  // Valores económicos
  valorTotalBruto: decimal('valor_total_bruto', { precision: 14, scale: 2 }).notNull(),
  descuentoPorcentaje: decimal('descuento_porcentaje', { precision: 5, scale: 2 }).default('0.00'),
  valorTotalNeto: decimal('valor_total_neto', { precision: 14, scale: 2 }).notNull(),
  moneda: varchar('moneda', { length: 3 }).default('CLP'),
  
  // Comisiones (si hay agencia)
  comisionAgenciaPorcentaje: decimal('comision_agencia_porcentaje', { precision: 5, scale: 2 }),
  comisionAgenciaValor: decimal('comision_agencia_valor', { precision: 14, scale: 2 }),
  
  // Condiciones de pago
  modalidadPago: modalidadPagoEnum('modalidad_pago').default('mensual').notNull(),
  diasCredito: integer('dias_credito').default(30),
  
  // Cupos contratados
  cuposContratados: integer('cupos_contratados'), // Número total de spots
  duracionTotalContratada: integer('duracion_total_contratada'), // Segundos totales
  
  // Estado
  estado: estadoContratoEnum('estado').default('borrador').notNull(),
  
  // Observaciones
  condicionesEspeciales: text('condiciones_especiales'),
  notas: text('notas'),
  
  // Documento adjunto
  pathDocumento: text('path_documento'), // PDF del contrato firmado
  
  // Aprobaciones
  aprobadoPorId: uuid('aprobado_por_id').references(() => users.id, { onDelete: 'set null' }),
  fechaAprobacion: timestamp('fecha_aprobacion'),

  // Ejecutivo asignado
  ejecutivoId: uuid('ejecutivo_id').references(() => users.id, { onDelete: 'set null' }),

  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id, { onDelete: 'restrict' }).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id, { onDelete: 'set null' }),
  fechaModificacion: timestamp('fecha_modificacion'),

  // Timestamps estándar (CLAUDE.md mandatory fields — para queries genéricas y paginación)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  // Soft delete
  eliminado: boolean('eliminado').default(false).notNull(),
  fechaEliminacion: timestamp('fecha_eliminacion'),
  eliminadoPorId: uuid('eliminado_por_id')
}, (table) => ({
  // Índices
  tenantIdx: index('contratos_tenant_idx').on(table.tenantId),
  numeroIdx: index('contratos_numero_idx').on(table.numeroContrato),
  anuncianteIdx: index('contratos_anunciante_idx').on(table.anuncianteId),
  agenciaIdx: index('contratos_agencia_idx').on(table.agenciaId),
  estadoIdx: index('contratos_estado_idx').on(table.estado),
  tenantEstadoIdx: index('idx_contratos_tenant_estado').on(table.tenantId, table.estado),
  vigenciaIdx: index('contratos_vigencia_idx').on(table.fechaInicio, table.fechaFin),
  fechaFinIdx: index('contratos_fecha_fin_idx').on(table.fechaFin),
  ejecutivoIdx: index('contratos_ejecutivo_idx').on(table.ejecutivoId),
  fechaCreacionIdx: index('idx_contratos_fecha_creacion').on(table.fechaCreacion)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: ITEMS/LÍNEAS DEL CONTRATO
// ═══════════════════════════════════════════════════════════════

export const contratosItems = pgTable('contratos_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  contratoId: uuid('contrato_id').references(() => contratos.id, { onDelete: 'cascade' }).notNull(),
  
  // Detalle del item
  descripcion: varchar('descripcion', { length: 500 }).notNull(),
  emisoraId: uuid('emisora_id'), // Opcional, referencia a emisora específica
  
  // Cantidad y precios
  cantidad: integer('cantidad').notNull(), // Número de spots/menciones
  duracionPorUnidad: integer('duracion_por_unidad'), // Segundos por spot
  precioUnitario: decimal('precio_unitario', { precision: 12, scale: 2 }).notNull(),
  subtotal: decimal('subtotal', { precision: 14, scale: 2 }).notNull(),
  
  // Período de ejecución
  fechaInicio: date('fecha_inicio'),
  fechaFin: date('fecha_fin'),
  
  // Horario preferido
  horaInicio: varchar('hora_inicio', { length: 8 }),
  horaFin: varchar('hora_fin', { length: 8 }),
  diasSemana: varchar('dias_semana', { length: 20 }), // "L-V", "S-D", etc.
  
  // Estado de ejecución
  cantidadEjecutada: integer('cantidad_ejecutada').default(0),
  porcentajeEjecutado: decimal('porcentaje_ejecutado', { precision: 5, scale: 2 }).default('0.00'),
  
  // Orden
  orden: integer('orden').default(0),
  
  // Auditoría
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull()
}, (table) => ({
  contratoIdx: index('contratos_items_contrato_idx').on(table.contratoId),
  tenantIdx: index('contratos_items_tenant_idx').on(table.tenantId)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: VENCIMIENTOS DE CONTRATO (FACTURACIÓN)
// ═══════════════════════════════════════════════════════════════

export const contratosVencimientos = pgTable('contratos_vencimientos', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  contratoId: uuid('contrato_id').references(() => contratos.id, { onDelete: 'cascade' }).notNull(),
  
  // Información del vencimiento
  numeroCuota: integer('numero_cuota').notNull(),
  fechaVencimiento: date('fecha_vencimiento').notNull(),
  monto: decimal('monto', { precision: 14, scale: 2 }).notNull(),
  
  // Estado de facturación
  facturado: boolean('facturado').default(false).notNull(),
  facturaId: uuid('factura_id'), // Referencia a factura cuando se emita
  fechaFacturacion: timestamp('fecha_facturacion'),
  
  // Estado de pago
  pagado: boolean('pagado').default(false).notNull(),
  fechaPago: timestamp('fecha_pago'),
  
  // Notas
  notas: text('notas'),
  
  // Auditoría
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull()
}, (table) => ({
  contratoIdx: index('contratos_venc_contrato_id_idx').on(table.contratoId),
  fechaIdx: index('contratos_venc_fecha_idx').on(table.fechaVencimiento),
  estadoIdx: index('contratos_venc_estado_idx').on(table.facturado, table.pagado)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: EVIDENCIAS DE NEGOCIACIÓN (Anti-Fraude)
// ═══════════════════════════════════════════════════════════════

export const tipoEvidenciaEnum = pgEnum('tipo_evidencia', [
  'correo',
  'orden_compra',
  'cotizacion_firmada',
  'chat_whatsapp',
  'grabacion_llamada',
  'minuta_reunion',
  'otro'
]);

export const contratosEvidencias = pgTable('contratos_evidencias', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  contratoId: uuid('contrato_id').references(() => contratos.id, { onDelete: 'cascade' }).notNull(),
  
  // Información de la evidencia
  tipo: tipoEvidenciaEnum('tipo').notNull(),
  nombre: varchar('nombre', { length: 255 }).notNull(),
  descripcion: text('descripcion'),
  urlArchivo: text('url_archivo').notNull(),
  hashArchivo: varchar('hash_archivo', { length: 64 }), // SHA-256 para integridad
  
  // Subida
  subidoPorId: uuid('subido_por_id').references(() => users.id).notNull(),
  fechaSubida: timestamp('fecha_subida').defaultNow().notNull(),
  
  // Validación
  validado: boolean('validado').default(false).notNull(),
  validadoPorId: uuid('validado_por_id').references(() => users.id),
  fechaValidacion: timestamp('fecha_validacion'),
  comentarioValidacion: text('comentario_validacion')
}, (table) => ({
  contratoIdx: index('evidencias_contrato_idx').on(table.contratoId),
  tenantIdx: index('evidencias_tenant_idx').on(table.tenantId),
  tipoIdx: index('evidencias_tipo_idx').on(table.tipo)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: APROBACIONES DE CONTRATO (Anti-Fraude)
// ═══════════════════════════════════════════════════════════════

export const nivelAprobacionEnum = pgEnum('nivel_aprobacion', [
  'jefatura_directa',
  'gerente_comercial',
  'gerente_general'
]);

export const estadoAprobacionEnum = pgEnum('estado_aprobacion', [
  'pendiente',
  'aprobado',
  'rechazado'
]);

export const contratosAprobaciones = pgTable('contratos_aprobaciones', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  contratoId: uuid('contrato_id').references(() => contratos.id, { onDelete: 'cascade' }).notNull(),
  
  // Nivel y aprobador
  nivel: nivelAprobacionEnum('nivel').notNull(),
  aprobadorId: uuid('aprobador_id').references(() => users.id).notNull(),
  
  // Estado
  estado: estadoAprobacionEnum('estado').default('pendiente').notNull(),
  fechaDecision: timestamp('fecha_decision'),
  
  // Comentarios y justificación
  comentarios: text('comentarios'),
  justificacionDescuento: text('justificacion_descuento'), // Requerido para descuentos >= 65%
  
  // Versión del contrato (para re-aprobaciones)
  versionContrato: integer('version_contrato').default(1).notNull(),
  
  // Auditoría
  fechaSolicitud: timestamp('fecha_solicitud').defaultNow().notNull(),
  solicitadoPorId: uuid('solicitado_por_id').references(() => users.id).notNull()
}, (table) => ({
  contratoIdx: index('aprobaciones_contrato_idx').on(table.contratoId),
  aprobadorIdx: index('aprobaciones_aprobador_idx').on(table.aprobadorId),
  estadoIdx: index('aprobaciones_estado_idx').on(table.estado),
  nivelIdx: index('aprobaciones_nivel_idx').on(table.nivel)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: HISTORIAL DE CAMBIOS (Anti-Fraude)
// ═══════════════════════════════════════════════════════════════

export const contratosHistorialCambios = pgTable('contratos_historial_cambios', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  contratoId: uuid('contrato_id').references(() => contratos.id, { onDelete: 'cascade' }).notNull(),
  
  // Detalle del cambio
  campo: varchar('campo', { length: 100 }).notNull(),
  valorAnterior: text('valor_anterior'),
  valorNuevo: text('valor_nuevo'),
  
  // Control
  requiereReaprobacion: boolean('requiere_reaprobacion').default(false).notNull(),
  
  // Auditoría
  modificadoPorId: uuid('modificado_por_id').references(() => users.id).notNull(),
  fechaCambio: timestamp('fecha_cambio').defaultNow().notNull()
}, (table) => ({
  contratoIdx: index('contratos_historial_contrato_idx').on(table.contratoId),
  fechaIdx: index('contratos_historial_fecha_idx').on(table.fechaCambio)
}));

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const contratosRelations = relations(contratos, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [contratos.tenantId],
    references: [tenants.id]
  }),
  anunciante: one(anunciantes, {
    fields: [contratos.anuncianteId],
    references: [anunciantes.id]
  }),
  agencia: one(agenciasMedios, {
    fields: [contratos.agenciaId],
    references: [agenciasMedios.id]
  }),
  creadoPor: one(users, {
    fields: [contratos.creadoPorId],
    references: [users.id]
  }),
  ejecutivo: one(users, {
    fields: [contratos.ejecutivoId],
    references: [users.id]
  }),
  items: many(contratosItems),
  vencimientos: many(contratosVencimientos)
}));

export const contratosItemsRelations = relations(contratosItems, ({ one }) => ({
  contrato: one(contratos, {
    fields: [contratosItems.contratoId],
    references: [contratos.id]
  })
}));

export const contratosVencimientosRelations = relations(contratosVencimientos, ({ one }) => ({
  contrato: one(contratos, {
    fields: [contratosVencimientos.contratoId],
    references: [contratos.id]
  })
}));

// ═══════════════════════════════════════════════════════════════
// TIPOS EXPORTADOS
// ═══════════════════════════════════════════════════════════════

export type Contrato = typeof contratos.$inferSelect;
export type NewContrato = typeof contratos.$inferInsert;
export type ContratoItem = typeof contratosItems.$inferSelect;
export type ContratoVencimiento = typeof contratosVencimientos.$inferSelect;
export type EstadoContrato = 'borrador' | 'pendiente_aprobacion' | 'aprobado' | 'activo' | 'pausado' | 'completado' | 'cancelado' | 'vencido';
export type TipoContrato = 'anual' | 'semestral' | 'trimestral' | 'mensual' | 'campaña' | 'evento' | 'marco';
export type ModalidadPago = 'anticipado' | 'mensual' | 'por_emisiones' | 'post_pago' | 'mixto';
export type MedioContrato = 'fm' | 'digital' | 'hibrido';

// ═══════════════════════════════════════════════════════════════
// INTERFACES PARA EL FRONTEND
// ═══════════════════════════════════════════════════════════════

export interface ContratoDTO {
  id: string;
  numeroContrato: string;
  titulo: string;
  clienteNombre: string; // Anunciante o Agencia
  tipoContrato: TipoContrato;
  fechaInicio: Date;
  fechaFin: Date;
  valorTotalNeto: number;
  moneda: string;
  estado: EstadoContrato;
  porcentajeEjecutado: number;
  ejecutivoNombre: string | null;
  fechaCreacion: Date;
}

export interface CreateContratoDTO {
  anuncianteId?: string;
  agenciaId?: string;
  esDirecto: boolean;
  titulo: string;
  descripcion?: string;
  tipoContrato: TipoContrato;
  fechaInicio: Date;
  fechaFin: Date;
  valorTotalBruto: number;
  descuentoPorcentaje?: number;
  modalidadPago?: ModalidadPago;
  diasCredito?: number;
  condicionesEspeciales?: string;
  notas?: string;
  ejecutivoId?: string;
}
