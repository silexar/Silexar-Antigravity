/**
 * 👤 SILEXAR PULSE - Vendedores Schema
 * Schema de base de datos para el módulo de Vendedores
 * 
 * @description Los vendedores son ejecutivos comerciales que gestionan cuentas
 * Incluye comisiones, metas, y asignación de clientes
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { pgTable, uuid, varchar, text, timestamp, boolean, decimal, integer, pgEnum, index, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants, users } from './users-schema';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const estadoVendedorEnum = pgEnum('estado_vendedor', ['activo', 'inactivo', 'licencia', 'vacaciones', 'desvinculado']);
export const tipoVendedorEnum = pgEnum('tipo_vendedor', ['ejecutivo', 'senior', 'junior', 'freelance', 'gerente']);
export const tipoComisionVendedorEnum = pgEnum('tipo_comision_vendedor', ['porcentaje_venta', 'fijo_mensual', 'mixto', 'escalonado']);

// ═══════════════════════════════════════════════════════════════
// TABLA: VENDEDORES
// ═══════════════════════════════════════════════════════════════

export const vendedores = pgTable('vendedores', {
  // Identificadores
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id), // Puede estar vinculado a un usuario del sistema
  codigo: varchar('codigo', { length: 20 }).notNull(), // VEN-001
  
  // Información personal
  rut: varchar('rut', { length: 12 }),
  nombres: varchar('nombres', { length: 100 }).notNull(),
  apellidos: varchar('apellidos', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  telefono: varchar('telefono', { length: 20 }),
  celular: varchar('celular', { length: 20 }),
  
  // Información laboral
  tipoVendedor: tipoVendedorEnum('tipo_vendedor').default('ejecutivo').notNull(),
  fechaIngreso: date('fecha_ingreso'),
  equipoId: uuid('equipo_id'), // Se vincula a equipos_venta
  supervisorId: uuid('supervisor_id'), // Referencia a otro vendedor
  
  // Comisiones
  tipoComision: tipoComisionVendedorEnum('tipo_comision').default('porcentaje_venta').notNull(),
  comisionPorcentaje: decimal('comision_porcentaje', { precision: 5, scale: 2 }).default('5.00'),
  comisionFija: decimal('comision_fija', { precision: 12, scale: 2 }),
  bonoPorMeta: decimal('bono_por_meta', { precision: 12, scale: 2 }),
  
  // Metas mensuales
  metaMensualMonto: decimal('meta_mensual_monto', { precision: 14, scale: 2 }),
  metaMensualContratos: integer('meta_mensual_contratos'),
  
  // Estado
  estado: estadoVendedorEnum('estado').default('activo').notNull(),
  activo: boolean('activo').default(true).notNull(),
  
  // Foto y notas
  fotoUrl: text('foto_url'),
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
  tenantIdx: index('vendedores_tenant_idx').on(table.tenantId),
  emailIdx: index('vendedores_email_idx').on(table.email),
  codigoIdx: index('vendedores_codigo_idx').on(table.codigo),
  equipoIdx: index('vendedores_equipo_idx').on(table.equipoId),
  estadoIdx: index('vendedores_estado_idx').on(table.estado)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: EQUIPOS DE VENTA
// ═══════════════════════════════════════════════════════════════

export const equiposVenta = pgTable('equipos_venta', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  codigo: varchar('codigo', { length: 20 }).notNull(),
  
  // Información del equipo
  nombre: varchar('nombre', { length: 100 }).notNull(),
  descripcion: text('descripcion'),
  color: varchar('color', { length: 7 }), // Color hex para UI
  
  // Líder del equipo
  liderId: uuid('lider_id').references(() => vendedores.id),
  
  // Metas del equipo
  metaMensualEquipo: decimal('meta_mensual_equipo', { precision: 14, scale: 2 }),
  metaAnualEquipo: decimal('meta_anual_equipo', { precision: 14, scale: 2 }),
  
  // Zona/Región asignada
  zonaAsignada: varchar('zona_asignada', { length: 100 }),
  segmentoMercado: varchar('segmento_mercado', { length: 100 }), // Retail, Banca, Automotriz, etc.
  
  // Estado
  activo: boolean('activo').default(true).notNull(),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion')
}, (table) => ({
  tenantIdx: index('equipos_venta_tenant_idx').on(table.tenantId),
  codigoIdx: index('equipos_venta_codigo_idx').on(table.codigo),
  liderIdx: index('equipos_venta_lider_idx').on(table.liderId)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: METAS Y RESULTADOS
// ═══════════════════════════════════════════════════════════════

export const metasVendedor = pgTable('metas_vendedor', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  vendedorId: uuid('vendedor_id').references(() => vendedores.id, { onDelete: 'cascade' }).notNull(),
  
  // Período
  anio: integer('anio').notNull(),
  mes: integer('mes').notNull(),
  
  // Metas
  metaMonto: decimal('meta_monto', { precision: 14, scale: 2 }).notNull(),
  metaContratos: integer('meta_contratos'),
  metaNuevosClientes: integer('meta_nuevos_clientes'),
  
  // Resultados
  ventasRealizadas: decimal('ventas_realizadas', { precision: 14, scale: 2 }).default('0'),
  contratosRealizados: integer('contratos_realizados').default(0),
  clientesNuevos: integer('clientes_nuevos').default(0),
  
  // Porcentaje de cumplimiento
  porcentajeCumplimiento: decimal('porcentaje_cumplimiento', { precision: 5, scale: 2 }).default('0'),
  
  // Comisiones generadas
  comisionGenerada: decimal('comision_generada', { precision: 12, scale: 2 }).default('0'),
  bonoGenerado: decimal('bono_generado', { precision: 12, scale: 2 }).default('0'),
  
  // Auditoría
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  fechaActualizacion: timestamp('fecha_actualizacion')
}, (table) => ({
  vendedorIdx: index('metas_vendedor_idx').on(table.vendedorId),
  periodoIdx: index('metas_periodo_idx').on(table.anio, table.mes),
  tenantPeriodoIdx: index('metas_tenant_periodo_idx').on(table.tenantId, table.anio, table.mes)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: ASIGNACIÓN DE CLIENTES
// ═══════════════════════════════════════════════════════════════

export const asignacionClientes = pgTable('asignacion_clientes', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  vendedorId: uuid('vendedor_id').references(() => vendedores.id, { onDelete: 'cascade' }).notNull(),
  
  // Cliente asignado (puede ser anunciante o agencia)
  anuncianteId: uuid('anunciante_id'),
  agenciaId: uuid('agencia_id'),
  
  // Tipo de asignación
  tipoCuenta: varchar('tipo_cuenta', { length: 20 }).default('directo'), // 'directo', 'agencia'
  esPrincipal: boolean('es_principal').default(true).notNull(), // Vendedor principal de la cuenta
  
  // Fechas
  fechaAsignacion: timestamp('fecha_asignacion').defaultNow().notNull(),
  fechaFinAsignacion: timestamp('fecha_fin_asignacion'),
  
  // Estado
  activo: boolean('activo').default(true).notNull(),
  
  // Notas
  notas: text('notas')
}, (table) => ({
  vendedorIdx: index('asignacion_vendedor_idx').on(table.vendedorId),
  anuncianteIdx: index('asignacion_anunciante_idx').on(table.anuncianteId),
  agenciaIdx: index('asignacion_agencia_idx').on(table.agenciaId)
}));

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const vendedoresRelations = relations(vendedores, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [vendedores.tenantId],
    references: [tenants.id]
  }),
  user: one(users, {
    fields: [vendedores.userId],
    references: [users.id]
  }),
  equipo: one(equiposVenta, {
    fields: [vendedores.equipoId],
    references: [equiposVenta.id]
  }),
  supervisor: one(vendedores, {
    fields: [vendedores.supervisorId],
    references: [vendedores.id]
  }),
  metas: many(metasVendedor),
  clientes: many(asignacionClientes)
}));

export const equiposVentaRelations = relations(equiposVenta, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [equiposVenta.tenantId],
    references: [tenants.id]
  }),
  lider: one(vendedores, {
    fields: [equiposVenta.liderId],
    references: [vendedores.id]
  }),
  miembros: many(vendedores)
}));

export const metasVendedorRelations = relations(metasVendedor, ({ one }) => ({
  vendedor: one(vendedores, {
    fields: [metasVendedor.vendedorId],
    references: [vendedores.id]
  })
}));

export const asignacionClientesRelations = relations(asignacionClientes, ({ one }) => ({
  vendedor: one(vendedores, {
    fields: [asignacionClientes.vendedorId],
    references: [vendedores.id]
  })
}));

// ═══════════════════════════════════════════════════════════════
// TIPOS EXPORTADOS
// ═══════════════════════════════════════════════════════════════

export type Vendedor = typeof vendedores.$inferSelect;
export type NewVendedor = typeof vendedores.$inferInsert;
export type EquipoVenta = typeof equiposVenta.$inferSelect;
export type MetaVendedor = typeof metasVendedor.$inferSelect;
export type AsignacionCliente = typeof asignacionClientes.$inferSelect;
export type EstadoVendedor = 'activo' | 'inactivo' | 'licencia' | 'vacaciones' | 'desvinculado';
export type TipoVendedor = 'ejecutivo' | 'senior' | 'junior' | 'freelance' | 'gerente';

// ═══════════════════════════════════════════════════════════════
// INTERFACES PARA EL FRONTEND
// ═══════════════════════════════════════════════════════════════

export interface VendedorDTO {
  id: string;
  codigo: string;
  nombreCompleto: string;
  email: string;
  telefono: string | null;
  tipoVendedor: TipoVendedor;
  equipoNombre: string | null;
  estado: EstadoVendedor;
  activo: boolean;
  metaActual: number | null;
  cumplimientoActual: number | null;
  clientesAsignados: number;
  fechaCreacion: Date;
}

export interface EquipoVentaDTO {
  id: string;
  codigo: string;
  nombre: string;
  color: string | null;
  liderNombre: string | null;
  miembrosCount: number;
  metaMensual: number | null;
  cumplimientoMensual: number | null;
  zonaAsignada: string | null;
  activo: boolean;
}
