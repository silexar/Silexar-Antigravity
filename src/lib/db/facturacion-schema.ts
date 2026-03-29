/**
 * 📊 SILEXAR PULSE - Facturación Schema
 * Schema de base de datos para el módulo de Facturación
 * 
 * @description Gestión de facturas, notas de crédito y documentos tributarios
 * Compatible con normativa SII Chile (DTE)
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { pgTable, uuid, varchar, text, timestamp, boolean, decimal, integer, pgEnum, index, date, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants, users } from './users-schema';
import { anunciantes } from './anunciantes-schema';
import { agenciasMedios } from './agencias-medios-schema';
import { contratos } from './contratos-schema';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const tipoDocumentoTributarioEnum = pgEnum('tipo_documento_tributario', [
  'factura_electronica',        // 33 - Factura Electrónica
  'factura_exenta',             // 34 - Factura No Afecta o Exenta Electrónica
  'boleta_electronica',         // 39 - Boleta Electrónica
  'nota_credito',               // 61 - Nota de Crédito Electrónica
  'nota_debito',                // 56 - Nota de Débito Electrónica
  'guia_despacho'               // 52 - Guía de Despacho Electrónica
]);

export const estadoFacturaEnum = pgEnum('estado_factura', [
  'borrador',
  'emitida',
  'enviada',
  'aceptada_sii',
  'rechazada_sii',
  'pagada',
  'parcialmente_pagada',
  'vencida',
  'anulada'
]);

export const formaPagoEnum = pgEnum('forma_pago', [
  'contado',
  'credito_30',
  'credito_45',
  'credito_60',
  'credito_90'
]);

// ═══════════════════════════════════════════════════════════════
// TABLA: FACTURAS
// ═══════════════════════════════════════════════════════════════

export const facturas = pgTable('facturas', {
  // Identificadores
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Numeración
  numeroFactura: integer('numero_factura').notNull(),
  folio: integer('folio'), // Folio SII
  tipoDocumento: tipoDocumentoTributarioEnum('tipo_documento').default('factura_electronica').notNull(),
  codigoSii: integer('codigo_sii').default(33), // 33=Factura, 61=NC, 56=ND
  
  // Cliente (Anunciante o Agencia)
  anuncianteId: uuid('anunciante_id').references(() => anunciantes.id),
  agenciaId: uuid('agencia_id').references(() => agenciasMedios.id),
  contratoId: uuid('contrato_id').references(() => contratos.id),
  
  // Datos del receptor (copiados al momento de emisión)
  receptorRut: varchar('receptor_rut', { length: 12 }).notNull(),
  receptorRazonSocial: varchar('receptor_razon_social', { length: 255 }).notNull(),
  receptorGiro: text('receptor_giro'),
  receptorDireccion: text('receptor_direccion'),
  receptorCiudad: varchar('receptor_ciudad', { length: 100 }),
  receptorComuna: varchar('receptor_comuna', { length: 100 }),
  
  // Fechas
  fechaEmision: date('fecha_emision').notNull(),
  fechaVencimiento: date('fecha_vencimiento'),
  
  // Montos
  montoNeto: decimal('monto_neto', { precision: 14, scale: 2 }).notNull(),
  montoExento: decimal('monto_exento', { precision: 14, scale: 2 }).default('0'),
  tasaIva: decimal('tasa_iva', { precision: 4, scale: 2 }).default('19.00'), // 19% en Chile
  montoIva: decimal('monto_iva', { precision: 14, scale: 2 }).notNull(),
  montoTotal: decimal('monto_total', { precision: 14, scale: 2 }).notNull(),
  moneda: varchar('moneda', { length: 3 }).default('CLP'),
  
  // Forma de pago
  formaPago: formaPagoEnum('forma_pago').default('credito_30').notNull(),
  
  // Estado
  estado: estadoFacturaEnum('estado').default('borrador').notNull(),
  
  // Pagos
  montoPagado: decimal('monto_pagado', { precision: 14, scale: 2 }).default('0'),
  fechaPago: timestamp('fecha_pago'),
  saldoPendiente: decimal('saldo_pendiente', { precision: 14, scale: 2 }),
  
  // Referencias (para NC/ND)
  facturaReferenciaId: uuid('factura_referencia_id'),
  motivoReferencia: text('motivo_referencia'),
  
  // DTE/SII
  trackId: varchar('track_id', { length: 50 }), // Track ID del SII
  estadoSii: varchar('estado_sii', { length: 50 }),
  fechaEnvioSii: timestamp('fecha_envio_sii'),
  fechaRespuestaSii: timestamp('fecha_respuesta_sii'),
  xmlDte: text('xml_dte'), // XML del DTE firmado
  pdfUrl: text('pdf_url'), // URL del PDF generado
  
  // Observaciones
  observaciones: text('observaciones'),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion'),

  // Timestamps estándar (CLAUDE.md mandatory fields)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  // Anulación
  anulada: boolean('anulada').default(false).notNull(),
  fechaAnulacion: timestamp('fecha_anulacion'),
  motivoAnulacion: text('motivo_anulacion')
}, (table) => ({
  tenantIdx: index('facturas_tenant_idx').on(table.tenantId),
  numeroIdx: index('facturas_numero_idx').on(table.numeroFactura),
  folioIdx: index('facturas_folio_idx').on(table.folio),
  anuncianteIdx: index('facturas_anunciante_idx').on(table.anuncianteId),
  agenciaIdx: index('facturas_agencia_idx').on(table.agenciaId),
  estadoIdx: index('facturas_estado_idx').on(table.estado),
  fechaEmisionIdx: index('facturas_fecha_emision_idx').on(table.fechaEmision),
  vencimientoIdx: index('facturas_vencimiento_idx').on(table.fechaVencimiento)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: DETALLES DE FACTURA
// ═══════════════════════════════════════════════════════════════

export const facturasDetalle = pgTable('facturas_detalle', {
  id: uuid('id').primaryKey().defaultRandom(),
  facturaId: uuid('factura_id').references(() => facturas.id, { onDelete: 'cascade' }).notNull(),
  
  // Detalle del ítem
  descripcion: text('descripcion').notNull(),
  cantidad: decimal('cantidad', { precision: 12, scale: 4 }).default('1').notNull(),
  unidad: varchar('unidad', { length: 20 }).default('UNID'),
  precioUnitario: decimal('precio_unitario', { precision: 12, scale: 2 }).notNull(),
  
  // Descuento por línea
  descuentoPorcentaje: decimal('descuento_porcentaje', { precision: 5, scale: 2 }).default('0'),
  descuentoMonto: decimal('descuento_monto', { precision: 12, scale: 2 }).default('0'),
  
  // Totales
  subtotal: decimal('subtotal', { precision: 14, scale: 2 }).notNull(),
  esExento: boolean('es_exento').default(false).notNull(),
  
  // Referencia a contrato/campaña
  contratoItemId: uuid('contrato_item_id'),
  campanaId: uuid('campana_id'),
  
  // Período del servicio
  periodoDesde: date('periodo_desde'),
  periodoHasta: date('periodo_hasta'),
  
  // Orden
  orden: integer('orden').default(0)
}, (table) => ({
  facturaIdx: index('facturas_detalle_factura_idx').on(table.facturaId)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: PAGOS
// ═══════════════════════════════════════════════════════════════

export const pagos = pgTable('pagos', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  facturaId: uuid('factura_id').references(() => facturas.id).notNull(),
  
  // Información del pago
  fechaPago: date('fecha_pago').notNull(),
  monto: decimal('monto', { precision: 14, scale: 2 }).notNull(),
  
  // Medio de pago
  medioPago: varchar('medio_pago', { length: 50 }).notNull(), // Transferencia, Cheque, Efectivo, etc.
  numeroReferencia: varchar('numero_referencia', { length: 100 }), // Número de transferencia, cheque, etc.
  bancoOrigen: varchar('banco_origen', { length: 100 }),
  
  // Comprobante
  comprobanteUrl: text('comprobante_url'),
  
  // Notas
  notas: text('notas'),
  
  // Auditoría
  registradoPorId: uuid('registrado_por_id').references(() => users.id).notNull(),
  fechaRegistro: timestamp('fecha_registro').defaultNow().notNull()
}, (table) => ({
  facturaIdx: index('pagos_factura_idx').on(table.facturaId),
  fechaIdx: index('pagos_fecha_idx').on(table.fechaPago)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: FOLIOS DTE
// ═══════════════════════════════════════════════════════════════

export const foliosDte = pgTable('folios_dte', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Tipo de documento
  tipoDocumento: integer('tipo_documento').notNull(), // 33, 34, 39, 61, 56
  
  // Rango de folios
  folioDesde: integer('folio_desde').notNull(),
  folioHasta: integer('folio_hasta').notNull(),
  folioActual: integer('folio_actual').notNull(),
  
  // Estado
  activo: boolean('activo').default(true).notNull(),
  agotado: boolean('agotado').default(false).notNull(),
  
  // CAF (Código de Autorización de Folios)
  xmlCaf: text('xml_caf'),
  fechaAutorizacion: timestamp('fecha_autorizacion'),
  fechaVencimiento: timestamp('fecha_vencimiento'),
  
  // Auditoría
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull()
}, (table) => ({
  tenantTipoIdx: index('folios_tenant_tipo_idx').on(table.tenantId, table.tipoDocumento)
}));

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const facturasRelations = relations(facturas, ({ one, many }) => ({
  tenant: one(tenants, { fields: [facturas.tenantId], references: [tenants.id] }),
  anunciante: one(anunciantes, { fields: [facturas.anuncianteId], references: [anunciantes.id] }),
  agencia: one(agenciasMedios, { fields: [facturas.agenciaId], references: [agenciasMedios.id] }),
  contrato: one(contratos, { fields: [facturas.contratoId], references: [contratos.id] }),
  creadoPor: one(users, { fields: [facturas.creadoPorId], references: [users.id] }),
  facturaReferencia: one(facturas, { fields: [facturas.facturaReferenciaId], references: [facturas.id] }),
  detalles: many(facturasDetalle),
  pagos: many(pagos)
}));

export const facturasDetalleRelations = relations(facturasDetalle, ({ one }) => ({
  factura: one(facturas, { fields: [facturasDetalle.facturaId], references: [facturas.id] })
}));

export const pagosRelations = relations(pagos, ({ one }) => ({
  factura: one(facturas, { fields: [pagos.facturaId], references: [facturas.id] }),
  registradoPor: one(users, { fields: [pagos.registradoPorId], references: [users.id] })
}));

// ═══════════════════════════════════════════════════════════════
// TIPOS EXPORTADOS
// ═══════════════════════════════════════════════════════════════

export type Factura = typeof facturas.$inferSelect;
export type NewFactura = typeof facturas.$inferInsert;
export type FacturaDetalle = typeof facturasDetalle.$inferSelect;
export type Pago = typeof pagos.$inferSelect;
export type FolioDte = typeof foliosDte.$inferSelect;
export type TipoDocumentoTributario = 'factura_electronica' | 'factura_exenta' | 'boleta_electronica' | 'nota_credito' | 'nota_debito' | 'guia_despacho';
export type EstadoFactura = 'borrador' | 'emitida' | 'enviada' | 'aceptada_sii' | 'rechazada_sii' | 'pagada' | 'parcialmente_pagada' | 'vencida' | 'anulada';

// ═══════════════════════════════════════════════════════════════
// INTERFACES PARA EL FRONTEND
// ═══════════════════════════════════════════════════════════════

export interface FacturaDTO {
  id: string;
  numeroFactura: number;
  folio: number | null;
  tipoDocumento: TipoDocumentoTributario;
  clienteNombre: string;
  clienteRut: string;
  fechaEmision: Date;
  fechaVencimiento: Date | null;
  montoNeto: number;
  montoIva: number;
  montoTotal: number;
  estado: EstadoFactura;
  saldoPendiente: number | null;
  diasVencida: number | null;
}
