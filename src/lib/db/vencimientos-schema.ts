/**
 * 📅 SILEXAR PULSE - Vencimientos e Inventario Schema
 * Schema de base de datos para gestión de inventario de espacios publicitarios
 * 
 * @description Gestión de cupos disponibles, programas, auspicios y vencimientos
 * Incluye el "Torpedo Digital" para visualización de disponibilidad
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { pgTable, uuid, varchar, text, timestamp, boolean, integer, decimal, pgEnum, index, date, time } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants, users } from './users-schema';
import { emisoras } from './emisoras-schema';
import { anunciantes } from './anunciantes-schema';
import { contratos } from './contratos-schema';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const tipoProgramaEnum = pgEnum('tipo_programa', [
  'noticiero',
  'musical',
  'deportivo',
  'magazin',
  'nocturno',
  'matinal',
  'cultural',
  'entretenimiento',
  'religioso',
  'infantil'
]);

export const tipoInventarioEnum = pgEnum('tipo_inventario', [
  'auspicio_programa',
  'tanda_comercial',
  'mencion_programa',
  'spot_horario',
  'patrocinio',
  'banner_digital'
]);

export const estadoCupoEnum = pgEnum('estado_cupo', [
  'disponible',
  'reservado',
  'vendido',
  'bloqueado',
  'cortesia'
]);

// ═══════════════════════════════════════════════════════════════
// TABLA: PROGRAMAS
// ═══════════════════════════════════════════════════════════════

export const programas = pgTable('programas', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  emiId: uuid('emi_id').references(() => emisoras.id, { onDelete: 'cascade' }).notNull(),
  codigo: varchar('codigo', { length: 30 }).notNull(),

  // Información del programa
  nombre: varchar('nombre', { length: 255 }).notNull(),
  descripcion: text('descripcion'),
  tipoPrograma: tipoProgramaEnum('tipo_programa').default('magazin').notNull(),

  // Horario
  horaInicio: time('hora_inicio').notNull(),
  horaFin: time('hora_fin').notNull(),
  diasSemana: varchar('dias_emision', { length: 20 }).default('LMMJVSD'), // L=Lunes, M=Martes, etc.

  // Conductor/Locutor
  conductorPrincipal: varchar('conductor_principal', { length: 255 }),

  // Audiencia estimada
  audienciaPromedio: integer('audiencia_promedio'),
  rating: decimal('rating', { precision: 4, scale: 2 }),

  // Tarifas base
  tarifaAuspicio: decimal('tarifa_auspicio', { precision: 12, scale: 2 }),
  tarifaMencion: decimal('tarifa_mencion', { precision: 12, scale: 2 }),
  tarifaSpot: decimal('tarifa_spot', { precision: 12, scale: 2 }),

  // Cupos y revenue (para ProgramaAuspicio)
  cuposData: text('cupos_data'), // JSON con { tipoA, tipoB, menciones }
  conductoresData: text('conductores_data'), // JSON array de conductores
  estado: varchar('estado', { length: 20 }).default('borrador'),
  revenueActual: decimal('revenue_actual', { precision: 14, scale: 2 }),
  revenuePotencial: decimal('revenue_potencial', { precision: 14, scale: 2 }),
  listaEsperaCount: integer('lista_espera_count').default(0),

  // Estado
  activo: boolean('activo').default(true).notNull(),

  // Auditoría
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  createdBy: varchar('created_by', { length: 255 }),
  updatedBy: varchar('updated_by', { length: 255 }),
  emiNombre: varchar('emi_nombre', { length: 255 }),
}, (table) => ({
  emiIdx: index('programas_emi_idx').on(table.emiId),
  tipoIdx: index('programas_tipo_idx').on(table.tipoPrograma),
  horarioIdx: index('programas_horario_idx').on(table.horaInicio, table.horaFin),
  estadoIdx: index('programas_estado_idx').on(table.estado),
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: INVENTARIO DE CUPOS
// ═══════════════════════════════════════════════════════════════

export const inventarioCupos = pgTable('inventario_cupos', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  emiId: uuid('emi_id').references(() => emisoras.id).notNull(),
  programaId: uuid('programa_id').references(() => programas.id),

  // Tipo de inventario
  tipoInventario: tipoInventarioEnum('tipo_inventario').notNull(),
  codigo: varchar('codigo', { length: 30 }).notNull(),
  nombre: varchar('nombre', { length: 255 }).notNull(),
  descripcion: text('descripcion'),

  // Horario del cupo
  horaInicio: time('hora_inicio').notNull(),
  horaFin: time('hora_fin'),
  duracionSegundos: integer('duracion_segundos').notNull(),

  // Días disponibles
  diasDisponibles: varchar('dias_disponibles', { length: 20 }).default('LMMJVSD'),

  // Cantidad de spots por tanda/bloque
  spotsMaximos: integer('spots_maximos').default(1),

  // Tarifas
  tarifaBase: decimal('tarifa_base', { precision: 12, scale: 2 }).notNull(),
  tarifaPrimeTime: decimal('tarifa_prime_time', { precision: 12, scale: 2 }),
  moneda: varchar('moneda', { length: 3 }).default('CLP'),

  // Estado
  activo: boolean('activo').default(true).notNull(),

  // Auditoría
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  createdBy: varchar('created_by', { length: 255 }),
  updatedBy: varchar('updated_by', { length: 255 }),
}, (table) => ({
  emiIdx: index('inventario_emi_idx').on(table.emiId),
  programaIdx: index('inventario_programa_idx').on(table.programaId),
  tipoIdx: index('inventario_tipo_idx').on(table.tipoInventario),
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: VENCIMIENTOS (Calendario de disponibilidad)
// ═══════════════════════════════════════════════════════════════

export const vencimientos = pgTable('vencimientos', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  inventarioId: uuid('inventario_id').references(() => inventarioCupos.id, { onDelete: 'cascade' }).notNull(),

  // Fecha específica
  fecha: date('fecha').notNull(),

  // Estado del cupo para esa fecha
  estado: estadoCupoEnum('estado').default('disponible').notNull(),

  // Si está vendido/reservado
  anuncianteId: uuid('anunciante_id').references(() => anunciantes.id),
  contratoId: uuid('contrato_id').references(() => contratos.id),

  // Precio de venta (puede diferir del base)
  precioVenta: decimal('precio_venta', { precision: 12, scale: 2 }),

  // Notas
  notas: text('notas'),

  // Auditoría
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion')
}, (table) => ({
  tenantIdx: index('vencimientos_tenant_idx').on(table.tenantId),
  inventarioIdx: index('vencimientos_inventario_idx').on(table.inventarioId),
  fechaIdx: index('vencimientos_fecha_idx').on(table.fecha),
  estadoIdx: index('vencimientos_estado_idx').on(table.estado),
  tenantFechaIdx: index('vencimientos_tenant_fecha_idx').on(table.tenantId, table.fecha)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: AUSPICIOS (Patrocinios de programas)
// ═══════════════════════════════════════════════════════════════

export const auspicios = pgTable('auspicios', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  programaId: uuid('programa_id').references(() => programas.id, { onDelete: 'cascade' }).notNull(),
  anuncianteId: uuid('anunciante_id').references(() => anunciantes.id).notNull(),
  contratoId: uuid('contrato_id').references(() => contratos.id),

  // Tipo de auspicio
  tipoAuspicio: varchar('tipo_auspicio', { length: 50 }).default('apertura'), // apertura, cierre, segmento
  posicion: integer('posicion').default(1), // Orden en el auspicio

  // Período
  fechaInicio: date('fecha_inicio').notNull(),
  fechaFin: date('fecha_fin').notNull(),

  // Valor
  valorTotal: decimal('valor_total', { precision: 14, scale: 2 }).notNull(),
  valorMensual: decimal('valor_mensual', { precision: 12, scale: 2 }),

  // Contenido
  textoMencion: text('texto_mencion'), // Script de la mención
  cunaId: uuid('cuna_id'), // Cuña asociada si aplica

  // Estado
  activo: boolean('activo').default(true).notNull(),

  // Auditoría
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  createdBy: varchar('created_by', { length: 255 }),
  updatedBy: varchar('updated_by', { length: 255 }),
}, (table) => ({
  programaIdx: index('auspicios_programa_idx').on(table.programaId),
  anuncianteIdx: index('auspicios_anunciante_idx').on(table.anuncianteId),
  fechasIdx: index('auspicios_fechas_idx').on(table.fechaInicio, table.fechaFin),
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: VENCIMIENTOS AUSPICIO (Tracking de vencimientos)
// ═══════════════════════════════════════════════════════════════

export const vencimientosAuspicio = pgTable('vencimientos_auspicio', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  codigo: varchar('codigo', { length: 30 }).notNull(),
  programaId: uuid('programa_id').references(() => programas.id, { onDelete: 'cascade' }).notNull(),
  programaNombre: varchar('programa_nombre', { length: 255 }),
  clienteId: uuid('cliente_id').notNull(),
  clienteNombre: varchar('cliente_nombre', { length: 255 }).notNull(),
  contratoId: uuid('contrato_id').references(() => contratos.id),
  contratoCodigo: varchar('contrato_codigo', { length: 30 }),
  tipo: varchar('tipo', { length: 50 }).default('auspicio_programa').notNull(),
  fechaInicio: date('fecha_inicio').notNull(),
  fechaVencimientos: date('fecha_vencimientos').notNull(),
  nivel: varchar('nivel', { length: 20 }).default('verde').notNull(),
  estado: varchar('estado', { length: 20 }).default('ACTIVO').notNull(),
  diasRestantes: integer('dias_restantes').default(0),
  horasCountdown: integer('horas_countdown'),
  valorContrato: decimal('valor_contrato', { precision: 14, scale: 2 }),
  montoPagado: decimal('monto_pagado', { precision: 14, scale: 2 }).default('0'),
  montoPendiente: decimal('monto_pendiente', { precision: 14, scale: 2 }).default('0'),
  accionesData: text('acciones_data'), // JSON array de acciones
  notificacion48hEnviada: boolean('notificacion_48h_enviada').default(false),
  notificacion7diasEnviada: boolean('notificacion_7dias_enviada').default(false),
  alertaTraficoEnviada: boolean('alerta_trafico_enviada').default(false),
  alertaTraficoFinalEnviada: boolean('alerta_trafico_final_enviada').default(false),
  ejecutivoId: uuid('ejecutivo_id').references(() => users.id),
  ejecutivoNombre: varchar('ejecutivo_nombre', { length: 255 }),
  notas: text('notas'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  version: integer('version').default(1).notNull(),
}, (table) => ({
  tenantIdx: index('venc_auspicio_tenant_idx').on(table.tenantId),
  programaIdx: index('venc_auspicio_programa_idx').on(table.programaId),
  fechaIdx: index('venc_auspicio_fecha_idx').on(table.fechaVencimientos),
  estadoIdx: index('venc_auspicio_estado_idx').on(table.estado),
  clienteIdx: index('venc_auspicio_cliente_idx').on(table.clienteId),
  ejecutivoIdx: index('venc_auspicio_ejecutivo_idx').on(table.ejecutivoId),
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: ALERTAS PROGRAMADOR
// ═══════════════════════════════════════════════════════════════

export const alertasProgramador = pgTable('alertas_programador', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  emisoraId: uuid('emisora_id').references(() => emisoras.id, { onDelete: 'cascade' }).notNull(),
  programaId: uuid('programa_id').references(() => programas.id, { onDelete: 'cascade' }).notNull(),
  programaNombre: varchar('programa_nombre', { length: 255 }),
  cupoComercialId: uuid('cupo_comercial_id').notNull(),
  clienteNombre: varchar('cliente_nombre', { length: 255 }).notNull(),
  tipo: varchar('tipo', { length: 50 }).notNull(),
  titulo: varchar('titulo', { length: 255 }).notNull(),
  mensaje: text('mensaje').notNull(),
  prioridad: varchar('prioridad', { length: 20 }).default('media').notNull(),
  destinatarioId: uuid('destinatario_id').references(() => users.id).notNull(),
  destinatarioNombre: varchar('destinatario_nombre', { length: 255 }),
  canalesNotificacion: text('canales_notificacion'), // JSON array
  estadoConfirmacion: varchar('estado_confirmacion', { length: 20 }).default('pendiente'),
  comentarioConfirmacion: text('comentario_confirmacion'),
  leida: boolean('leida').default(false),
  fechaLectura: timestamp('fecha_lectura'),
  fechaExpiracion: timestamp('fecha_expiracion'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  version: integer('version').default(1).notNull(),
}, (table) => ({
  tenantIdx: index('alertas_prog_tenant_idx').on(table.tenantId),
  destinatarioIdx: index('alertas_prog_dest_idx').on(table.destinatarioId),
  estadoIdx: index('alertas_prog_estado_idx').on(table.estadoConfirmacion),
  prioridadIdx: index('alertas_prog_prio_idx').on(table.prioridad),
  tipoIdx: index('alertas_prog_tipo_idx').on(table.tipo),
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: SOLICITUDES EXTENSIÓN
// ═══════════════════════════════════════════════════════════════

export const solicitudesExtension = pgTable('solicitudes_extension', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  cupoComercialId: uuid('cupo_comercial_id').notNull(),
  programaId: uuid('programa_id').references(() => programas.id, { onDelete: 'cascade' }).notNull(),
  emisoraId: uuid('emisora_id').references(() => emisoras.id, { onDelete: 'cascade' }).notNull(),
  clienteId: uuid('cliente_id').notNull(),
  clienteNombre: varchar('cliente_nombre', { length: 255 }).notNull(),
  ejecutivoId: uuid('ejecutivo_id').references(() => users.id).notNull(),
  ejecutivoNombre: varchar('ejecutivo_nombre', { length: 255 }),
  fechaInicioOriginal: date('fecha_inicio_original').notNull(),
  fechaFinOriginal: date('fecha_fin_original').notNull(),
  fechaInicioSolicitada: date('fecha_inicio_solicitada').notNull(),
  fechaFinSolicitada: date('fecha_fin_solicitada').notNull(),
  motivoSolicitud: text('motivo_solicitud').notNull(),
  nivelAprobacion: varchar('nivel_aprobacion', { length: 50 }).default('automatico').notNull(),
  aprobadorId: uuid('aprobador_id').references(() => users.id),
  aprobadorNombre: varchar('aprobador_nombre', { length: 255 }),
  extensionesPrevias: integer('extensiones_previas').default(0),
  estado: varchar('estado', { length: 20 }).default('pendiente').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  version: integer('version').default(1).notNull(),
}, (table) => ({
  tenantIdx: index('ext_tenant_idx').on(table.tenantId),
  cupoIdx: index('ext_cupo_idx').on(table.cupoComercialId),
  programaIdx: index('ext_programa_idx').on(table.programaId),
  estadoIdx: index('ext_estado_idx').on(table.estado),
  clienteIdx: index('ext_cliente_idx').on(table.clienteId),
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: LISTAS DE ESPERA
// ═══════════════════════════════════════════════════════════════

export const listasEspera = pgTable('listas_espera', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  programaId: uuid('programa_id').references(() => programas.id, { onDelete: 'cascade' }).notNull(),
  programaNombre: varchar('programa_nombre', { length: 255 }),
  emisoraId: uuid('emisora_id').references(() => emisoras.id, { onDelete: 'cascade' }).notNull(),
  emisoraNombre: varchar('emisora_nombre', { length: 255 }),
  clientesData: text('clientes_data'), // JSON array de clientes en espera
  maxEspera: integer('max_espera').default(20).notNull(),
  notificacionAutomatica: boolean('notificacion_automatica').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  version: integer('version').default(1).notNull(),
}, (table) => ({
  tenantIdx: index('lista_espera_tenant_idx').on(table.tenantId),
  programaIdx: index('lista_espera_programa_idx').on(table.programaId),
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: TANDAS COMERCIALES
// ═══════════════════════════════════════════════════════════════

export const tandasComerciales = pgTable('tandas_comerciales', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  emisoraId: uuid('emisora_id').references(() => emisoras.id, { onDelete: 'cascade' }).notNull(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  horaInicio: time('hora_inicio').notNull(),
  horaFin: time('hora_fin').notNull(),
  factorMultiplicador: decimal('factor_multiplicador', { precision: 4, scale: 2 }).default('1.00'),
  audienciaPromedio: integer('audiencia_promedio'),
  ratingPromedio: decimal('rating_promedio', { precision: 4, scale: 2 }),
  tarifasData: text('tarifas_data'), // JSON array de tarifas por duración
  activo: boolean('activo').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index('tandas_tenant_idx').on(table.tenantId),
  emisoraIdx: index('tandas_emisora_idx').on(table.emisoraId),
  nombreIdx: index('tandas_nombre_idx').on(table.nombre),
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: SEÑALES ESPECIALES
// ═══════════════════════════════════════════════════════════════

export const senalesEspeciales = pgTable('senales_especiales', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  emisoraId: uuid('emisora_id').references(() => emisoras.id, { onDelete: 'cascade' }).notNull(),
  tipo: varchar('tipo', { length: 50 }).notNull(),
  nombre: varchar('nombre', { length: 255 }).notNull(),
  horarios: text('horarios'), // JSON array de strings
  duracionSegundos: integer('duracion_segundos'),
  formato: text('formato'),
  precioMensual: decimal('precio_mensual', { precision: 12, scale: 2 }),
  exclusividad: integer('exclusividad').default(1),
  estado: varchar('estado', { length: 20 }).default('disponible'),
  anuncianteId: uuid('anunciante_id').references(() => anunciantes.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index('senales_tenant_idx').on(table.tenantId),
  emisoraIdx: index('senales_emisora_idx').on(table.emisoraId),
  tipoIdx: index('senales_tipo_idx').on(table.tipo),
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: EXCLUSIVIDADES RUBRO
// ═══════════════════════════════════════════════════════════════

export const exclusividadesRubro = pgTable('exclusividades_rubro', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  programaId: uuid('programa_id').references(() => programas.id, { onDelete: 'cascade' }).notNull(),
  rubro: varchar('rubro', { length: 100 }).notNull(),
  tipoRestriccion: varchar('tipo_restriccion', { length: 50 }).default('unico').notNull(),
  maximoClientes: integer('maximo_clientes').default(1),
  separacionMinimaMinutos: integer('separacion_minima_minutos').default(0),
  activo: boolean('activo').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index('excl_tenant_idx').on(table.tenantId),
  programaIdx: index('excl_programa_idx').on(table.programaId),
  rubroIdx: index('excl_rubro_idx').on(table.rubro),
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: CONFIGURACIÓN TARIFA
// ═══════════════════════════════════════════════════════════════

export const configuracionTarifa = pgTable('configuracion_tarifa', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  programaId: uuid('programa_id').references(() => programas.id, { onDelete: 'cascade' }).notNull(),
  tipoAuspicio: varchar('tipo_auspicio', { length: 50 }).notNull(),
  duracionSegundos: integer('duracion_segundos'),
  precioBase: decimal('precio_base', { precision: 12, scale: 2 }).notNull(),
  factorTemporada: decimal('factor_temporada', { precision: 4, scale: 2 }).default('1.00'),
  factorRating: decimal('factor_rating', { precision: 4, scale: 2 }).default('1.00'),
  factorOcupacion: decimal('factor_ocupacion', { precision: 4, scale: 2 }).default('1.00'),
  descuentoClienteNuevo: decimal('descuento_cliente_nuevo', { precision: 4, scale: 2 }).default('0.00'),
  descuentoRenovacion: decimal('descuento_renovacion', { precision: 4, scale: 2 }).default('0.00'),
  vigenciaDesde: date('vigencia_desde'),
  vigenciaHasta: date('vigencia_hasta'),
  activo: boolean('activo').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index('tarifa_tenant_idx').on(table.tenantId),
  programaIdx: index('tarifa_programa_idx').on(table.programaId),
  tipoIdx: index('tarifa_tipo_idx').on(table.tipoAuspicio),
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: HISTORIAL OCUPACIÓN
// ═══════════════════════════════════════════════════════════════

export const historialOcupacion = pgTable('historial_ocupacion', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  emisoraId: uuid('emisora_id').references(() => emisoras.id, { onDelete: 'cascade' }).notNull(),
  programaId: uuid('programa_id').references(() => programas.id, { onDelete: 'cascade' }),
  mes: integer('mes').notNull(),
  anio: integer('anio').notNull(),
  ocupacionPromedio: decimal('ocupacion_promedio', { precision: 5, scale: 2 }),
  revenueTotal: decimal('revenue_total', { precision: 14, scale: 2 }),
  revenuePotencial: decimal('revenue_potencial', { precision: 14, scale: 2 }),
  cuposVendidos: integer('cupos_vendidos'),
  cuposDisponibles: integer('cupos_disponibles'),
  metricasData: text('metricas_data'), // JSON
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index('hist_tenant_idx').on(table.tenantId),
  emisoraIdx: index('hist_emisora_idx').on(table.emisoraId),
  periodoIdx: index('hist_periodo_idx').on(table.anio, table.mes),
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: CUPO COMERCIAL
// ═══════════════════════════════════════════════════════════════

export const cupoComercial = pgTable('cupo_comercial', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  programaId: uuid('programa_id').references(() => programas.id, { onDelete: 'cascade' }).notNull(),
  emisoraId: uuid('emisora_id').references(() => emisoras.id, { onDelete: 'cascade' }).notNull(),
  clienteId: uuid('cliente_id').references(() => anunciantes.id),
  clienteNombre: varchar('cliente_nombre', { length: 255 }),
  ejecutivoId: uuid('ejecutivo_id').references(() => users.id),
  ejecutivoNombre: varchar('ejecutivo_nombre', { length: 255 }),
  tipoAuspicio: varchar('tipo_auspicio', { length: 50 }).notNull(),
  estado: varchar('estado', { length: 20 }).default('disponible').notNull(),
  fechaInicio: date('fecha_inicio'),
  fechaFin: date('fecha_fin'),
  valor: decimal('valor', { precision: 14, scale: 2 }),
  historialModificaciones: text('historial_modificaciones'), // JSON array
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  version: integer('version').default(1).notNull(),
}, (table) => ({
  tenantIdx: index('cupo_tenant_idx').on(table.tenantId),
  programaIdx: index('cupo_programa_idx').on(table.programaId),
  emisoraIdx: index('cupo_emisora_idx').on(table.emisoraId),
  estadoIdx: index('cupo_estado_idx').on(table.estado),
  clienteIdx: index('cupo_cliente_idx').on(table.clienteId),
}));

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const programasRelations = relations(programas, ({ one, many }) => ({
  tenant: one(tenants, { fields: [programas.tenantId], references: [tenants.id] }),
  fija: one(emisoras, { fields: [programas.emiId], references: [emisoras.id] }),
  inventario: many(inventarioCupos),
  auspicios: many(auspicios)
}));

export const inventarioCuposRelations = relations(inventarioCupos, ({ one, many }) => ({
  tenant: one(tenants, { fields: [inventarioCupos.tenantId], references: [tenants.id] }),
  fija: one(emisoras, { fields: [inventarioCupos.emiId], references: [emisoras.id] }),
  programa: one(programas, { fields: [inventarioCupos.programaId], references: [programas.id] }),
  vencimientos: many(vencimientos)
}));

export const vencimientosRelations = relations(vencimientos, ({ one }) => ({
  inventario: one(inventarioCupos, { fields: [vencimientos.inventarioId], references: [inventarioCupos.id] }),
  anunciante: one(anunciantes, { fields: [vencimientos.anuncianteId], references: [anunciantes.id] }),
  contrato: one(contratos, { fields: [vencimientos.contratoId], references: [contratos.id] })
}));

export const auspiciosRelations = relations(auspicios, ({ one }) => ({
  programa: one(programas, { fields: [auspicios.programaId], references: [programas.id] }),
  anunciante: one(anunciantes, { fields: [auspicios.anuncianteId], references: [anunciantes.id] }),
  contrato: one(contratos, { fields: [auspicios.contratoId], references: [contratos.id] })
}));

export const vencimientosAuspicioRelations = relations(vencimientosAuspicio, ({ one }) => ({
  tenant: one(tenants, { fields: [vencimientosAuspicio.tenantId], references: [tenants.id] }),
  programa: one(programas, { fields: [vencimientosAuspicio.programaId], references: [programas.id] }),
  contrato: one(contratos, { fields: [vencimientosAuspicio.contratoId], references: [contratos.id] }),
  ejecutivo: one(users, { fields: [vencimientosAuspicio.ejecutivoId], references: [users.id] }),
}));

export const alertasProgramadorRelations = relations(alertasProgramador, ({ one }) => ({
  tenant: one(tenants, { fields: [alertasProgramador.tenantId], references: [tenants.id] }),
  emisora: one(emisoras, { fields: [alertasProgramador.emisoraId], references: [emisoras.id] }),
  programa: one(programas, { fields: [alertasProgramador.programaId], references: [programas.id] }),
  destinatario: one(users, { fields: [alertasProgramador.destinatarioId], references: [users.id] }),
}));

export const solicitudesExtensionRelations = relations(solicitudesExtension, ({ one }) => ({
  tenant: one(tenants, { fields: [solicitudesExtension.tenantId], references: [tenants.id] }),
  programa: one(programas, { fields: [solicitudesExtension.programaId], references: [programas.id] }),
  emisora: one(emisoras, { fields: [solicitudesExtension.emisoraId], references: [emisoras.id] }),
  ejecutivo: one(users, { fields: [solicitudesExtension.ejecutivoId], references: [users.id] }),
  aprobador: one(users, { fields: [solicitudesExtension.aprobadorId], references: [users.id] }),
}));

export const listasEsperaRelations = relations(listasEspera, ({ one }) => ({
  tenant: one(tenants, { fields: [listasEspera.tenantId], references: [tenants.id] }),
  programa: one(programas, { fields: [listasEspera.programaId], references: [programas.id] }),
  emisora: one(emisoras, { fields: [listasEspera.emisoraId], references: [emisoras.id] }),
}));

export const tandasComercialesRelations = relations(tandasComerciales, ({ one }) => ({
  tenant: one(tenants, { fields: [tandasComerciales.tenantId], references: [tenants.id] }),
  emisora: one(emisoras, { fields: [tandasComerciales.emisoraId], references: [emisoras.id] }),
}));

export const senalesEspecialesRelations = relations(senalesEspeciales, ({ one }) => ({
  tenant: one(tenants, { fields: [senalesEspeciales.tenantId], references: [tenants.id] }),
  emisora: one(emisoras, { fields: [senalesEspeciales.emisoraId], references: [emisoras.id] }),
  anunciante: one(anunciantes, { fields: [senalesEspeciales.anuncianteId], references: [anunciantes.id] }),
}));

export const exclusividadesRubroRelations = relations(exclusividadesRubro, ({ one }) => ({
  tenant: one(tenants, { fields: [exclusividadesRubro.tenantId], references: [tenants.id] }),
  programa: one(programas, { fields: [exclusividadesRubro.programaId], references: [programas.id] }),
}));

export const configuracionTarifaRelations = relations(configuracionTarifa, ({ one }) => ({
  tenant: one(tenants, { fields: [configuracionTarifa.tenantId], references: [tenants.id] }),
  programa: one(programas, { fields: [configuracionTarifa.programaId], references: [programas.id] }),
}));

export const historialOcupacionRelations = relations(historialOcupacion, ({ one }) => ({
  tenant: one(tenants, { fields: [historialOcupacion.tenantId], references: [tenants.id] }),
  emisora: one(emisoras, { fields: [historialOcupacion.emisoraId], references: [emisoras.id] }),
  programa: one(programas, { fields: [historialOcupacion.programaId], references: [programas.id] }),
}));

export const cupoComercialRelations = relations(cupoComercial, ({ one }) => ({
  tenant: one(tenants, { fields: [cupoComercial.tenantId], references: [tenants.id] }),
  programa: one(programas, { fields: [cupoComercial.programaId], references: [programas.id] }),
  emisora: one(emisoras, { fields: [cupoComercial.emisoraId], references: [emisoras.id] }),
  cliente: one(anunciantes, { fields: [cupoComercial.clienteId], references: [anunciantes.id] }),
  ejecutivo: one(users, { fields: [cupoComercial.ejecutivoId], references: [users.id] }),
}));

// ═══════════════════════════════════════════════════════════════
// TIPOS EXPORTADOS
// ═══════════════════════════════════════════════════════════════

export type Programa = typeof programas.$inferSelect;
export type InventarioCupo = typeof inventarioCupos.$inferSelect;
export type Vencimientos = typeof vencimientos.$inferSelect;
export type Auspicio = typeof auspicios.$inferSelect;
export type EstadoCupo = 'disponible' | 'reservado' | 'vendido' | 'bloqueado' | 'cortesia';
export type TipoInventario = 'auspicio_programa' | 'tanda_comercial' | 'mencion_programa' | 'spot_horario' | 'patrocinio' | 'banner_digital';

// ── Nuevos tipos de entidades Vencimientos ──
export type VencimientosAuspicio = typeof vencimientosAuspicio.$inferSelect;
export type AlertaProgramador = typeof alertasProgramador.$inferSelect;
export type SolicitudExtension = typeof solicitudesExtension.$inferSelect;
export type ListaEspera = typeof listasEspera.$inferSelect;
export type TandaComercial = typeof tandasComerciales.$inferSelect;
export type SenalEspecial = typeof senalesEspeciales.$inferSelect;
export type ExclusividadRubro = typeof exclusividadesRubro.$inferSelect;
export type ConfiguracionTarifa = typeof configuracionTarifa.$inferSelect;
export type HistorialOcupacion = typeof historialOcupacion.$inferSelect;
export type CupoComercial = typeof cupoComercial.$inferSelect;

// ═══════════════════════════════════════════════════════════════
// DTOs PARA TORPEDO DIGITAL
// ═══════════════════════════════════════════════════════════════

export interface TorpedoDigitalDTO {
  fecha: Date;
  emisoras: {
    emiId: string;
    emiNombre: string;
    cupos: {
      hora: string;
      cupoId: string;
      nombre: string;
      estado: EstadoCupo;
      anunciante: string | null;
      precio: number;
    }[];
  }[];
}

export interface DisponibilidadDTO {
  inventarioId: string;
  nombre: string;
  emiNombre: string;
  fecha: Date;
  estado: EstadoCupo;
  precio: number;
  anuncianteNombre: string | null;
}
