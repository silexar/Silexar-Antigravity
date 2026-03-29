/**
 * 💰 SILEXAR PULSE - Schema Cotizaciones
 * 
 * @description Tablas para cotizaciones, propuestas y seguimiento
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { pgTable, uuid, varchar, text, boolean, timestamp, integer, decimal, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { anunciantes } from './anunciantes-schema';
import { tenants } from './users-schema';
import { users } from './users-schema';
import { vendedores } from './equipos-ventas-schema';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const estadoCotizacionEnum = pgEnum('estado_cotizacion', [
  'borrador',
  'enviada',
  'vista',
  'negociando',
  'aceptada',
  'rechazada',
  'vencida',
  'convertida'
]);

// ═══════════════════════════════════════════════════════════════
// TABLA: COTIZACIONES
// ═══════════════════════════════════════════════════════════════

export const cotizaciones = pgTable('cotizaciones', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Identificación
  numero: integer('numero').notNull(),
  codigo: varchar('codigo', { length: 20 }).notNull(), // COT-2025-0001
  
  // Cliente
  clienteId: uuid('cliente_id').references(() => anunciantes.id),
  clienteNombre: varchar('cliente_nombre', { length: 200 }).notNull(),
  clienteRut: varchar('cliente_rut', { length: 20 }),
  contactoNombre: varchar('contacto_nombre', { length: 100 }),
  contactoEmail: varchar('contacto_email', { length: 150 }),
  
  // Vendedor
  vendedorId: uuid('vendedor_id').references(() => vendedores.id),
  
  // Fechas
  fechaEmision: timestamp('fecha_emision').defaultNow().notNull(),
  fechaValidez: timestamp('fecha_validez').notNull(),
  fechaEnvio: timestamp('fecha_envio'),
  fechaRespuesta: timestamp('fecha_respuesta'),
  
  // Período de campaña
  periodoInicio: timestamp('periodo_inicio'),
  periodoFin: timestamp('periodo_fin'),
  
  // Líneas (JSON para flexibilidad)
  lineas: jsonb('lineas').default([]).notNull(),
  /*
    [{
      productoId: string,
      productoNombre: string,
      cantidad: number,
      duracion?: number,
      horario?: string,
      precioUnitario: number,
      descuentos: [],
      subtotal: number
    }]
  */
  
  // Totales
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).default('0'),
  totalDescuentos: decimal('total_descuentos', { precision: 15, scale: 2 }).default('0'),
  netoTotal: decimal('neto_total', { precision: 15, scale: 2 }).default('0'),
  iva: decimal('iva', { precision: 15, scale: 2 }).default('0'),
  total: decimal('total', { precision: 15, scale: 2 }).default('0'),
  
  // Descuentos aplicados (JSON)
  descuentosAplicados: jsonb('descuentos_aplicados').default([]),
  
  // IA
  probabilidadAceptacion: integer('probabilidad_aceptacion').default(50),
  recomendacionesIA: jsonb('recomendaciones_ia').default([]),
  
  // Estado
  estado: estadoCotizacionEnum('estado').default('borrador').notNull(),
  motivoRechazo: text('motivo_rechazo'),
  contratoGenerado: uuid('contrato_generado'),
  
  // Observaciones
  observaciones: text('observaciones'),
  notasInternas: text('notas_internas'),
  
  // Tracking
  vecesVista: integer('veces_vista').default(0),
  ultimaVista: timestamp('ultima_vista'),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion')
});

// ═══════════════════════════════════════════════════════════════
// TABLA: HISTORIAL COTIZACION
// ═══════════════════════════════════════════════════════════════

export const historialCotizacion = pgTable('historial_cotizacion', {
  id: uuid('id').primaryKey().defaultRandom(),
  cotizacionId: uuid('cotizacion_id').references(() => cotizaciones.id, { onDelete: 'cascade' }).notNull(),
  
  accion: varchar('accion', { length: 50 }).notNull(), // creada, enviada, vista, negociacion, aceptada, rechazada
  estadoAnterior: varchar('estado_anterior', { length: 30 }),
  estadoNuevo: varchar('estado_nuevo', { length: 30 }).notNull(),
  
  detalles: jsonb('detalles'),
  observacion: text('observacion'),
  
  usuarioId: uuid('usuario_id').references(() => users.id),
  fechaAccion: timestamp('fecha_accion').defaultNow().notNull()
});

// ═══════════════════════════════════════════════════════════════
// TABLA: TARIFARIO
// ═══════════════════════════════════════════════════════════════

export const tarifario = pgTable('tarifario', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  productoId: varchar('producto_id', { length: 50 }).notNull(),
  productoNombre: varchar('producto_nombre', { length: 100 }).notNull(),
  descripcion: text('descripcion'),
  unidad: varchar('unidad', { length: 30 }).notNull(), // segundo, mencion, dia
  
  // Precios
  precioNormal: decimal('precio_normal', { precision: 12, scale: 2 }).notNull(),
  precioTemporadaAlta: decimal('precio_temporada_alta', { precision: 12, scale: 2 }),
  precioTemporadaBaja: decimal('precio_temporada_baja', { precision: 12, scale: 2 }),
  
  // Vigencia
  vigenciaDesde: timestamp('vigencia_desde').notNull(),
  vigenciaHasta: timestamp('vigencia_hasta'),
  
  activo: boolean('activo').default(true).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull()
});

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const cotizacionesRelations = relations(cotizaciones, ({ one, many }) => ({
  tenant: one(tenants, { fields: [cotizaciones.tenantId], references: [tenants.id] }),
  cliente: one(anunciantes, { fields: [cotizaciones.clienteId], references: [anunciantes.id] }),
  vendedor: one(vendedores, { fields: [cotizaciones.vendedorId], references: [vendedores.id] }),
  historial: many(historialCotizacion),
  creadoPor: one(users, { fields: [cotizaciones.creadoPorId], references: [users.id] })
}));

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type CotizacionSelect = typeof cotizaciones.$inferSelect;
export type CotizacionInsert = typeof cotizaciones.$inferInsert;
export type TarifarioSelect = typeof tarifario.$inferSelect;
