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
  emisoraId: uuid('emisora_id').references(() => emisoras.id, { onDelete: 'cascade' }).notNull(),
  codigo: varchar('codigo', { length: 30 }).notNull(),
  
  // Información del programa
  nombre: varchar('nombre', { length: 255 }).notNull(),
  descripcion: text('descripcion'),
  tipoPrograma: tipoProgramaEnum('tipo_programa').default('magazin').notNull(),
  
  // Horario
  horaInicio: time('hora_inicio').notNull(),
  horaFin: time('hora_fin').notNull(),
  diasEmision: varchar('dias_emision', { length: 20 }).default('LMMJVSD'), // L=Lunes, M=Martes, etc.
  
  // Conductor/Locutor
  conductorPrincipal: varchar('conductor_principal', { length: 255 }),
  
  // Audiencia estimada
  audienciaPromedio: integer('audiencia_promedio'),
  rating: decimal('rating', { precision: 4, scale: 2 }),
  
  // Tarifas base
  tarifaAuspicio: decimal('tarifa_auspicio', { precision: 12, scale: 2 }),
  tarifaMencion: decimal('tarifa_mencion', { precision: 12, scale: 2 }),
  tarifaSpot: decimal('tarifa_spot', { precision: 12, scale: 2 }),
  
  // Estado
  activo: boolean('activo').default(true).notNull(),
  
  // Auditoría
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull()
}, (table) => ({
  emisoraIdx: index('programas_emisora_idx').on(table.emisoraId),
  tipoIdx: index('programas_tipo_idx').on(table.tipoPrograma),
  horarioIdx: index('programas_horario_idx').on(table.horaInicio, table.horaFin)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: INVENTARIO DE CUPOS
// ═══════════════════════════════════════════════════════════════

export const inventarioCupos = pgTable('inventario_cupos', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  emisoraId: uuid('emisora_id').references(() => emisoras.id).notNull(),
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
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull()
}, (table) => ({
  emisoraIdx: index('inventario_emisora_idx').on(table.emisoraId),
  programaIdx: index('inventario_programa_idx').on(table.programaId),
  tipoIdx: index('inventario_tipo_idx').on(table.tipoInventario)
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
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull()
}, (table) => ({
  programaIdx: index('auspicios_programa_idx').on(table.programaId),
  anuncianteIdx: index('auspicios_anunciante_idx').on(table.anuncianteId),
  fechasIdx: index('auspicios_fechas_idx').on(table.fechaInicio, table.fechaFin)
}));

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const programasRelations = relations(programas, ({ one, many }) => ({
  tenant: one(tenants, { fields: [programas.tenantId], references: [tenants.id] }),
  emisora: one(emisoras, { fields: [programas.emisoraId], references: [emisoras.id] }),
  inventario: many(inventarioCupos),
  auspicios: many(auspicios)
}));

export const inventarioCuposRelations = relations(inventarioCupos, ({ one, many }) => ({
  tenant: one(tenants, { fields: [inventarioCupos.tenantId], references: [tenants.id] }),
  emisora: one(emisoras, { fields: [inventarioCupos.emisoraId], references: [emisoras.id] }),
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

// ═══════════════════════════════════════════════════════════════
// TIPOS EXPORTADOS
// ═══════════════════════════════════════════════════════════════

export type Programa = typeof programas.$inferSelect;
export type InventarioCupo = typeof inventarioCupos.$inferSelect;
export type Vencimiento = typeof vencimientos.$inferSelect;
export type Auspicio = typeof auspicios.$inferSelect;
export type EstadoCupo = 'disponible' | 'reservado' | 'vendido' | 'bloqueado' | 'cortesia';
export type TipoInventario = 'auspicio_programa' | 'tanda_comercial' | 'mencion_programa' | 'spot_horario' | 'patrocinio' | 'banner_digital';

// ═══════════════════════════════════════════════════════════════
// DTOs PARA TORPEDO DIGITAL
// ═══════════════════════════════════════════════════════════════

export interface TorpedoDigitalDTO {
  fecha: Date;
  emisoras: {
    emisoraId: string;
    emisoraNombre: string;
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
  emisoraNombre: string;
  fecha: Date;
  estado: EstadoCupo;
  precio: number;
  anuncianteNombre: string | null;
}
