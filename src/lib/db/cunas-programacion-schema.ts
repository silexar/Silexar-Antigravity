/**
 * 📅 SILEXAR PULSE - Schema Programación de Bloques TIER 0
 * 
 * Tablas para programación horaria de cuñas,
 * parrilla de emisión y tracking de material
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { pgTable, varchar, uuid, timestamp, integer, text, boolean, jsonb, time, date, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { tenants } from './users-schema';
import { cunas } from './cunas-schema';
import { anunciantes } from './anunciantes-schema';
import { contratos } from './contratos-schema';
import { vencimientos } from './vencimientos-schema';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const diaSemanaEnum = pgEnum('dia_semana', [
  'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'
]);

export const tipoBloqueEnum = pgEnum('tipo_bloque', [
  'matinal', 'mediodia', 'tarde', 'prime', 'nocturno', 'madrugada', 'especial'
]);

export const estadoBloqueEnum = pgEnum('estado_bloque', [
  'disponible', 'parcial', 'completo', 'bloqueado'
]);

export const estadoEmisionEnum = pgEnum('estado_emision', [
  'programada', 'emitida', 'fallida', 'cancelada', 'reprogramada'
]);

export const estadoMaterialEnum = pgEnum('estado_material', [
  'pendiente', 'recibido', 'en_revision', 'aprobado', 'rechazado', 'vencido'
]);

export const origenMaterialEnum = pgEnum('origen_material', [
  'email', 'whatsapp', 'upload_manual', 'api', 'ftp', 'produccion_interna'
]);

// ═══════════════════════════════════════════════════════════════
// BLOQUES DE PROGRAMACIÓN
// ═══════════════════════════════════════════════════════════════

export const bloquesProgramacion = pgTable('bloques_programacion', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Identificación
  codigo: varchar('codigo', { length: 20 }).notNull(), // BLQ-001
  nombre: varchar('nombre', { length: 100 }).notNull(), // "Prime Time Noche"
  tipoBloqueHorario: tipoBloqueEnum('tipo_bloque').notNull(),
  
  // Horario
  horaInicio: time('hora_inicio').notNull(),
  horaFin: time('hora_fin').notNull(),
  duracionMinutos: integer('duracion_minutos').notNull(),
  
  // Días activos (array de strings)
  diasActivos: jsonb('dias_activos').$type<string[]>().default(['lunes', 'martes', 'miercoles', 'jueves', 'viernes']),
  
  // Capacidad
  duracionTotalSegundos: integer('duracion_total_segundos').default(180), // 3 minutos
  duracionUsadaSegundos: integer('duracion_usada_segundos').default(0),
  maxCunas: integer('max_cunas').default(6),
  cunasActuales: integer('cunas_actuales').default(0),
  
  // Tarifas (referencia)
  tarifaBase: integer('tarifa_base'), // en centavos
  multiplicadorPrime: integer('multiplicador_prime').default(100), // 100 = 1x
  
  // Restricciones
  categoriasBloqueadas: jsonb('categorias_bloqueadas').$type<string[]>().default([]),
  anunciantesExclusivos: jsonb('anunciantes_exclusivos').$type<string[]>().default([]),
  
  // Estado
  estado: estadoBloqueEnum('estado').default('disponible'),
  esActivo: boolean('es_activo').default(true),
  
  // Metadata
  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
  fechaActualizacion: timestamp('fecha_actualizacion').defaultNow(),
  creadoPorId: uuid('creado_por_id')
}, (table) => ({
  tenantIdx: index('bloques_tenant_idx').on(table.tenantId),
  horarioIdx: index('bloques_horario_idx').on(table.horaInicio, table.horaFin),
  tipoIdx: index('bloques_tipo_idx').on(table.tipoBloqueHorario)
}));

// ═══════════════════════════════════════════════════════════════
// PROGRAMACIÓN DE CUÑAS EN BLOQUES
// ═══════════════════════════════════════════════════════════════

export const programacionCunas = pgTable('programacion_cunas', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Relaciones
  bloqueId: uuid('bloque_id').references(() => bloquesProgramacion.id).notNull(),
  cunaId: uuid('cuna_id').references(() => cunas.id).notNull(),
  vencimientoId: uuid('vencimiento_id').references(() => vencimientos.id), // Vinculación con auspicio
  
  // Posición
  posicionEnBloque: integer('posicion_en_bloque').default(1), // Orden dentro del bloque
  prioridad: integer('prioridad').default(5), // 1-10
  
  // Vigencia de la programación
  fechaInicio: date('fecha_inicio').notNull(),
  fechaFin: date('fecha_fin').notNull(),
  
  // Días específicos (si difiere del bloque)
  diasEspecificos: jsonb('dias_especificos').$type<string[]>(),
  
  // Frecuencia
  frecuenciaDiaria: integer('frecuencia_diaria').default(1), // Veces por día
  frecuenciaSemanal: integer('frecuencia_semanal'), // Veces por semana
  
  // Estado
  esActiva: boolean('es_activa').default(true),
  pausadaTemporalmente: boolean('pausada_temporalmente').default(false),
  motivoPausa: text('motivo_pausa'),
  
  // Restricciones
  noJuntoA: jsonb('no_junto_a').$type<string[]>().default([]), // IDs de anunciantes competidores
  
  // Metadata
  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
  creadoPorId: uuid('creado_por_id')
}, (table) => ({
  bloqueIdx: index('prog_bloque_idx').on(table.bloqueId),
  cunaIdx: index('prog_cuna_idx').on(table.cunaId),
  fechasIdx: index('prog_fechas_idx').on(table.fechaInicio, table.fechaFin),
  activaIdx: index('prog_activa_idx').on(table.esActiva)
}));

// ═══════════════════════════════════════════════════════════════
// REGISTRO DE EMISIONES
// ═══════════════════════════════════════════════════════════════

export const registroEmisiones = pgTable('registro_emisiones', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Relaciones
  programacionId: uuid('programacion_id').references(() => programacionCunas.id),
  cunaId: uuid('cuna_id').references(() => cunas.id).notNull(),
  bloqueId: uuid('bloque_id').references(() => bloquesProgramacion.id),
  
  // Cuando se emitió
  fechaEmision: date('fecha_emision').notNull(),
  horaEmision: time('hora_emision').notNull(),
  timestampExacto: timestamp('timestamp_exacto'),
  
  // Estado
  estado: estadoEmisionEnum('estado').default('emitida'),
  duracionReal: integer('duracion_real_segundos'),
  
  // Verificación
  verificadoPor: uuid('verificado_por_id'),
  verificadoEn: timestamp('verificado_en'),
  evidenciaUrl: varchar('evidencia_url', { length: 500 }),
  
  // Origen del registro
  origenRegistro: varchar('origen_registro', { length: 50 }), // 'automatico', 'manual', 'sistema_emision'
  sistemaEmision: varchar('sistema_emision', { length: 50 }), // 'wideorbit', 'sara', etc.
  referenciaExterna: varchar('referencia_externa', { length: 100 }),
  
  // Metadata
  fechaCreacion: timestamp('fecha_creacion').defaultNow()
}, (table) => ({
  cunaIdx: index('emis_cuna_idx').on(table.cunaId),
  fechaIdx: index('emis_fecha_idx').on(table.fechaEmision),
  estadoIdx: index('emis_estado_idx').on(table.estado)
}));

// ═══════════════════════════════════════════════════════════════
// TRACKING DE MATERIAL PENDIENTE
// ═══════════════════════════════════════════════════════════════

export const materialPendiente = pgTable('material_pendiente', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Relaciones
  anuncianteId: uuid('anunciante_id').references(() => anunciantes.id).notNull(),
  contratoId: uuid('contrato_id').references(() => contratos.id),
  vencimientoId: uuid('vencimiento_id').references(() => vencimientos.id),
  cunaAsignadaId: uuid('cuna_asignada_id').references(() => cunas.id), // Si ya se asignó
  
  // Descripción del material esperado
  tipoMaterial: varchar('tipo_material', { length: 50 }).notNull(), // 'spot', 'mencion', 'presentacion'
  descripcion: text('descripcion'),
  duracionEsperada: integer('duracion_esperada_segundos'),
  especificaciones: text('especificaciones'),
  
  // Fechas
  fechaSolicitud: timestamp('fecha_solicitud').defaultNow(),
  fechaLimiteEntrega: timestamp('fecha_limite_entrega').notNull(),
  fechaRecepcion: timestamp('fecha_recepcion'),
  
  // Estado
  estado: estadoMaterialEnum('estado').default('pendiente'),
  
  // Seguimiento
  recordatoriosEnviados: integer('recordatorios_enviados').default(0),
  ultimoRecordatorio: timestamp('ultimo_recordatorio'),
  
  // Contacto
  contactoNombre: varchar('contacto_nombre', { length: 200 }),
  contactoEmail: varchar('contacto_email', { length: 200 }),
  contactoTelefono: varchar('contacto_telefono', { length: 50 }),
  
  // Notas
  notas: text('notas'),
  motivoRechazo: text('motivo_rechazo'),
  
  // Metadata
  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
  fechaActualizacion: timestamp('fecha_actualizacion').defaultNow(),
  creadoPorId: uuid('creado_por_id')
}, (table) => ({
  anuncianteIdx: index('mat_anunciante_idx').on(table.anuncianteId),
  estadoIdx: index('mat_estado_idx').on(table.estado),
  fechaLimiteIdx: index('mat_fecha_limite_idx').on(table.fechaLimiteEntrega)
}));

// ═══════════════════════════════════════════════════════════════
// INBOX DE CUÑAS (RECEPCIÓN AUTOMÁTICA)
// ═══════════════════════════════════════════════════════════════

export const cunasInbox = pgTable('cunas_inbox', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Origen
  origen: origenMaterialEnum('origen').notNull(),
  origenDetalle: varchar('origen_detalle', { length: 200 }), // email address, phone number
  
  // Email/WhatsApp info
  asunto: varchar('asunto', { length: 500 }),
  cuerpoMensaje: text('cuerpo_mensaje'),
  remitente: varchar('remitente', { length: 200 }),
  fechaRecepcion: timestamp('fecha_recepcion').defaultNow(),
  
  // Adjuntos
  adjuntos: jsonb('adjuntos').$type<{
    nombre: string;
    tipo: string;
    tamano: number;
    url: string;
    esAudio: boolean;
  }[]>().default([]),
  
  // Detección automática
  anuncianteDetectadoId: uuid('anunciante_detectado_id').references(() => anunciantes.id),
  anuncianteDetectadoNombre: varchar('anunciante_detectado_nombre', { length: 200 }),
  confianzaDeteccion: integer('confianza_deteccion').default(0), // 0-100
  
  // Estado de procesamiento
  procesado: boolean('procesado').default(false),
  cunaCreada: boolean('cuna_creada').default(false),
  cunaResultanteId: uuid('cuna_resultante_id').references(() => cunas.id),
  
  // Asignación manual
  asignadoAId: uuid('asignado_a_id'),
  fechaAsignacion: timestamp('fecha_asignacion'),
  
  // Notas
  notas: text('notas'),
  
  // Metadata
  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
  fechaProcesamiento: timestamp('fecha_procesamiento')
}, (table) => ({
  tenantIdx: index('inbox_tenant_idx').on(table.tenantId),
  procesadoIdx: index('inbox_procesado_idx').on(table.procesado),
  fechaIdx: index('inbox_fecha_idx').on(table.fechaRecepcion),
  anuncianteIdx: index('inbox_anunciante_idx').on(table.anuncianteDetectadoId)
}));

// ═══════════════════════════════════════════════════════════════
// VINCULACIÓN CUÑAS - VENCIMIENTOS (AUSPICIOS)
// ═══════════════════════════════════════════════════════════════

export const cunasVencimientos = pgTable('cunas_vencimientos', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Relaciones
  cunaId: uuid('cuna_id').references(() => cunas.id).notNull(),
  vencimientoId: uuid('vencimiento_id').references(() => vencimientos.id).notNull(),
  
  // Tipo de uso
  tipoUso: varchar('tipo_uso', { length: 50 }).notNull(), // 'presentacion', 'cierre', 'spot_principal'
  esPrincipal: boolean('es_principal').default(false),
  
  // Validación
  validado: boolean('validado').default(false),
  validadoPorId: uuid('validado_por_id'),
  fechaValidacion: timestamp('fecha_validacion'),
  
  // Notas
  notas: text('notas'),
  
  // Metadata
  fechaCreacion: timestamp('fecha_creacion').defaultNow()
}, (table) => ({
  cunaIdx: index('cv_cuna_idx').on(table.cunaId),
  vencimientoIdx: index('cv_vencimiento_idx').on(table.vencimientoId),
  validadoIdx: index('cv_validado_idx').on(table.validado)
}));

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const bloquesProgramacionRelations = relations(bloquesProgramacion, ({ many }) => ({
  programaciones: many(programacionCunas),
  emisiones: many(registroEmisiones)
}));

export const programacionCunasRelations = relations(programacionCunas, ({ one, many }) => ({
  bloque: one(bloquesProgramacion, {
    fields: [programacionCunas.bloqueId],
    references: [bloquesProgramacion.id]
  }),
  cuna: one(cunas, {
    fields: [programacionCunas.cunaId],
    references: [cunas.id]
  }),
  emisiones: many(registroEmisiones)
}));

export const materialPendienteRelations = relations(materialPendiente, ({ one }) => ({
  anunciante: one(anunciantes, {
    fields: [materialPendiente.anuncianteId],
    references: [anunciantes.id]
  }),
  cunaAsignada: one(cunas, {
    fields: [materialPendiente.cunaAsignadaId],
    references: [cunas.id]
  })
}));

export const cunasInboxRelations = relations(cunasInbox, ({ one }) => ({
  anuncianteDetectado: one(anunciantes, {
    fields: [cunasInbox.anuncianteDetectadoId],
    references: [anunciantes.id]
  }),
  cunaResultante: one(cunas, {
    fields: [cunasInbox.cunaResultanteId],
    references: [cunas.id]
  })
}));
