/**
 * Paquetes Schema - Drizzle ORM definitions
 * 
 * @description Schema definitions for the Paquetes module tables.
 * 
 * @version 1.0.0
 */

import { pgTable, text, timestamp, integer, bigint, decimal, date, time, boolean, uuid, unique, pgEnum } from 'drizzle-orm/pg-core'
import { eq, and, isNull, like, or, desc, sql } from 'drizzle-orm'

// ─── Enums ──────────────────────────────────────────────────────────────────

export const tipoPaqueteEnum = pgEnum('tipo_paquete', [
    'PRIME',
    'REPARTIDO',
    'NOCTURNO',
    'SENALES',
    'ESPECIAL',
    'EXCLUSIVO'
])

export const estadoPaqueteEnum = pgEnum('estado_paquete', [
    'ACTIVO',
    'INACTIVO',
    'MANTENIMIENTO',
    'BORRADO'
])

export const nivelExclusividadEnum = pgEnum('nivel_exclusividad', [
    'EXCLUSIVO',
    'COMPARTIDO',
    'ABIERTO'
])

export const tipoRestriccionEnum = pgEnum('tipo_restriccion', [
    'INDUSTRIA',
    'HORARIO',
    'EXCLUSIVIDAD',
    'COMPETENCIA'
])

// ─── Tables ─────────────────────────────────────────────────────────────────

/**
 * Paquetes principales - Inventory packages for advertising
 */
export const paquetes = pgTable('paquetes', {
    id: text('id').primaryKey(),
    codigo: text('codigo').notNull().unique(),  // PAQ-2025-XXXXX
    nombre: text('nombre').notNull(),
    descripcion: text('descripcion').default(''),
    tipo: text('tipo').notNull(),  // PRIME, REPARTIDO, NOCTURNO, SENALES, ESPECIAL, EXCLUSIVO
    estado: text('estado').notNull().default('ACTIVO'),  // ACTIVO, INACTIVO, MANTENIMIENTO, BORRADO

    // Emisora y programa
    editoraId: text('editora_id').notNull(),
    editoraNombre: text('editora_nombre').notNull(),
    programaId: text('programa_id').notNull(),
    programaNombre: text('programa_nombre').notNull(),

    // Horarios
    horarioInicio: time('horario_inicio').notNull(),
    horarioFin: time('horario_fin').notNull(),
    diasSemana: text('dias_semana').array().notNull(),  // ['L','M','M','J','V','S','D']

    // Duraciones disponibles
    duraciones: integer('duraciones').array().notNull(),  // [15, 30, 45]

    // Pricing
    precioBase: bigint('precio_base', { mode: 'number' }).notNull(),  // En CLP sin decimales
    precioActual: bigint('precio_actual', { mode: 'number' }).notNull(),

    // Exclusividad
    nivelExclusividad: text('nivel_exclusividad').notNull(),  // EXCLUSIVO, COMPARTIDO, ABIERTO

    // Fechas
    vigenciaDesde: date('vigencia_desde').notNull(),
    vigenciaHasta: date('vigencia_hasta').notNull(),

    // Auditoría
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: text('created_by').notNull(),
    updatedBy: text('updated_by').notNull(),
    version: integer('version').default(1).notNull(),

    // Soft delete
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }).$type<Date | null>()
}, (table) => ({
    idxCodigo: unique('idx_paquetes_codigo').on(table.codigo),
    idxTipo: unique('idx_paquetes_tipo').on(table.tipo),
    idxEstado: unique('idx_paquetes_estado').on(table.estado),
    idxEditora: unique('idx_paquetes_editora').on(table.editoraId),
    idxPrograma: unique('idx_paquetes_programa').on(table.programaId),
}))

/**
 * Historial de precios
 */
export const paquetesHistorialPrecio = pgTable('paquetes_historial_precio', {
    id: text('id').primaryKey(),
    paqueteId: text('paquete_id').notNull().references(() => paquetes.id, { onDelete: 'cascade' }),
    precioBase: bigint('precio_base', { mode: 'number' }).notNull(),
    factorDemanda: decimal('factor_demanda', { precision: 5, scale: 4 }).default('1.0000'),
    factorEstacional: decimal('factor_estacional', { precision: 5, scale: 4 }).default('1.0000'),
    factorPerformance: decimal('factor_performance', { precision: 5, scale: 4 }).default('1.0000'),
    precioFinal: bigint('precio_final', { mode: 'number' }).notNull(),
    fechaVigencia: date('fecha_vigencia').notNull(),
    creadoPor: text('creado_por').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

/**
 * Disponibilidad e inventario
 */
export const paquetesDisponibilidad = pgTable('paquetes_disponibilidad', {
    id: text('id').primaryKey(),
    paqueteId: text('paquete_id').notNull().references(() => paquetes.id, { onDelete: 'cascade' }),
    fecha: date('fecha').notNull(),
    cuposTotales: integer('cupos_totales').notNull().default(0),
    cuposOcupados: integer('cupos_ocupados').notNull().default(0),
    disponiblePct: decimal('disponible_pct', { precision: 5, scale: 2 }).notNull().default('100.00'),
    spotsProgramados: integer('spots_programados').default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
    uniqPaqueteFecha: unique('uq_paquete_fecha').on(table.paqueteId, table.fecha)
}))

/**
 * Restricciones por paquete
 */
export const paquetesRestricciones = pgTable('paquetes_restricciones', {
    id: text('id').primaryKey(),
    paqueteId: text('paquete_id').notNull().references(() => paquetes.id, { onDelete: 'cascade' }),
    tipoRestriccion: text('tipo_restriccion').notNull(),  // INDUSTRIA, HORARIO, EXCLUSIVIDAD, COMPETENCIA
    descripcion: text('descripcion').notNull(),
    rubroAfectado: text('rubro_afectado'),
    horarioInicio: time('horario_inicio'),
    horarioFin: time('horario_fin'),
    activos: boolean('activos').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

/**
 * Factores estacionales predefinidos
 */
export const paquetesFactoresEstacionales = pgTable('paquetes_factores_estacionales', {
    id: text('id').primaryKey(),
    nombre: text('nombre').notNull(),
    factor: decimal('factor', { precision: 5, scale: 4 }).notNull(),
    mesInicio: integer('mes_inicio').notNull(),  // 1-12
    mesFin: integer('mes_fin').notNull(),
    diaInicio: integer('dia_inicio'),
    diaFin: integer('dia_fin'),
    activo: boolean('activo').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

/**
 * Performance por paquete
 */
export const paquetesPerformance = pgTable('paquetes_performance', {
    id: text('id').primaryKey(),
    paqueteId: text('paquete_id').notNull().references(() => paquetes.id, { onDelete: 'cascade' }),
    fecha: date('fecha').notNull(),
    impresiones: integer('impresiones').default(0),
    clics: integer('clics').default(0),
    conversiones: integer('conversiones').default(0),
    revenue: bigint('revenue', { mode: 'number' }).default(0),
    reachPct: decimal('reach_pct', { precision: 5, scale: 2 }).default('0.00'),
    frecuenciaPromedio: decimal('frecuencia_promedio', { precision: 5, scale: 2 }).default('0.00'),
    ctr: decimal('ctr', { precision: 5, scale: 4 }).default('0.0000'),
    cpafinal: bigint('cpafinal', { mode: 'number' }).default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

// ─── Types ──────────────────────────────────────────────────────────────────

export type Paquete = typeof paquetes.$inferSelect
export type NewPaquete = typeof paquetes.$inferInsert

export type PaqueteHistorialPrecio = typeof paquetesHistorialPrecio.$inferSelect
export type NewPaqueteHistorialPrecio = typeof paquetesHistorialPrecio.$inferInsert

export type PaqueteDisponibilidad = typeof paquetesDisponibilidad.$inferSelect
export type NewPaqueteDisponibilidad = typeof paquetesDisponibilidad.$inferInsert

export type PaqueteRestriccion = typeof paquetesRestricciones.$inferSelect
export type NewPaqueteRestriccion = typeof paquetesRestricciones.$inferInsert

export type PaqueteFactorEstacional = typeof paquetesFactoresEstacionales.$inferSelect
export type NewPaqueteFactorEstacional = typeof paquetesFactoresEstacionales.$inferInsert

export type PaquetePerformance = typeof paquetesPerformance.$inferSelect
export type NewPaquetePerformance = typeof paquetesPerformance.$inferInsert
