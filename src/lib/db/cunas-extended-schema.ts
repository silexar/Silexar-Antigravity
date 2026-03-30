/**
 * 🗄️ SILEXAR PULSE - CUÑAS EXTENDED DATABASE SCHEMA
 * 
 * Extensión del schema de base de datos para funcionalidades enterprise
 * Compatible con Drizzle ORM y PostgreSQL/Neon
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { pgTable, uuid, varchar, text, integer, boolean, timestamp, index, pgEnum, jsonb, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants, users } from './users-schema';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { anunciantes } from './anunciantes-schema';
import { cunas } from './cunas-schema';

// ═══════════════════════════════════════════════════════════════
// ENUMS ADICIONALES
// ═══════════════════════════════════════════════════════════════

export const estadoMencionEnum = pgEnum('estado_mencion', [
  'borrador', 'pendiente_revision', 'aprobada', 'en_uso', 'retirada'
]);

export const estadoPresentacionEnum = pgEnum('estado_presentacion', [
  'pendiente', 'validada', 'en_uso', 'vencida', 'retirada'
]);

export const estadoCierreEnum = pgEnum('estado_cierre', [
  'borrador', 'asociado', 'en_uso', 'retirado'
]);

export const tipoDestinatarioEnum = pgEnum('tipo_destinatario', [
  'operador_emision', 'ejecutivo_comercial', 'supervisor', 'gerente', 'programacion', 'cliente', 'otro'
]);

export const metodoContactoEnum = pgEnum('metodo_contacto', [
  'email', 'whatsapp', 'sms', 'llamada'
]);

export const estadoEnvioEnum = pgEnum('estado_envio', [
  'pendiente', 'enviando', 'enviado', 'entregado', 'abierto', 'descargado', 'confirmado', 'fallido', 'rebotado'
]);

export const prioridadAlertaCunasEnum = pgEnum('prioridad_alerta', [
  'baja', 'media', 'alta', 'critica'
]);

// ═══════════════════════════════════════════════════════════════
// MENCIONES
// ═══════════════════════════════════════════════════════════════

export const menciones = pgTable('menciones', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  cunaId: uuid('cuna_id').references(() => cunas.id, { onDelete: 'cascade' }).notNull(),
  
  texto: text('texto').notNull(),
  marcadores: jsonb('marcadores').$type<{
    tipo: string;
    inicio: number;
    fin: number;
    valor?: string;
  }[]>().default([]),
  
  // Análisis
  analisis: jsonb('analisis').$type<{
    palabras: number;
    caracteres: number;
    wpm: number;
    tiempoEstimadoSegundos: number;
    complejidad: string;
  }>(),
  
  estado: estadoMencionEnum('estado').default('borrador').notNull(),
  version: integer('version').default(1).notNull(),
  
  // Audio generado por IA
  audioGeneradoUrl: text('audio_generado_url'),
  cortexVoiceId: varchar('cortex_voice_id', { length: 100 }),
  configVoz: jsonb('config_voz'),
  
  // Programas asociados
  programasIds: jsonb('programas_ids').$type<string[]>().default([]),
  diasSemana: jsonb('dias_semana').$type<number[]>().default([1, 2, 3, 4, 5]),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion')
}, (table) => ({
  cunaIdx: index('menciones_cuna_idx').on(table.cunaId),
  estadoIdx: index('menciones_estado_idx').on(table.estado)
}));

// ═══════════════════════════════════════════════════════════════
// PRESENTACIONES
// ═══════════════════════════════════════════════════════════════

export const presentaciones = pgTable('presentaciones', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  cunaId: uuid('cuna_id').references(() => cunas.id, { onDelete: 'cascade' }).notNull(),
  
  // Programa
  programaId: uuid('programa_id').notNull(),
  programaNombre: varchar('programa_nombre', { length: 255 }).notNull(),
  emisoraId: uuid('emisora_id').notNull(),
  emisoraNombre: varchar('emisora_nombre', { length: 255 }).notNull(),
  horarioPrograma: varchar('horario_programa', { length: 50 }),
  
  // Textos por día
  textosPorDia: jsonb('textos_por_dia').$type<{
    dia: number;
    nombreDia: string;
    texto: string;
    tiempoEstimado: number;
    activo: boolean;
  }[]>().default([]),
  
  // Vigencia
  fechaInicio: timestamp('fecha_inicio').notNull(),
  fechaFin: timestamp('fecha_fin').notNull(),
  
  // Validación con vencimientos
  validacionVencimientos: jsonb('validacion_vencimientos').$type<{
    esValida: boolean;
    vencimientoId?: string;
    programaId: string;
    observaciones: string[];
    fechaValidacion: Date;
  }>(),
  
  estado: estadoPresentacionEnum('estado').default('pendiente').notNull(),
  coherenciaMarca: decimal('coherencia_marca', { precision: 5, scale: 2 }),
  alineacionAudiencia: decimal('alineacion_audiencia', { precision: 5, scale: 2 }),
  
  // Cierre asociado
  cierreAsociadoId: uuid('cierre_asociado_id'),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion')
}, (table) => ({
  cunaIdx: index('presentaciones_cuna_idx').on(table.cunaId),
  programaIdx: index('presentaciones_programa_idx').on(table.programaId),
  vigenciaIdx: index('presentaciones_vigencia_idx').on(table.fechaInicio, table.fechaFin),
  estadoIdx: index('presentaciones_estado_idx').on(table.estado)
}));

// ═══════════════════════════════════════════════════════════════
// CIERRES
// ═══════════════════════════════════════════════════════════════

export const cierres = pgTable('cierres', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  cunaId: uuid('cuna_id').references(() => cunas.id, { onDelete: 'cascade' }).notNull(),
  
  // Asociación
  presentacionId: uuid('presentacion_id').references(() => presentaciones.id),
  programaId: uuid('programa_id').notNull(),
  programaNombre: varchar('programa_nombre', { length: 255 }).notNull(),
  emisoraId: uuid('emisora_id').notNull(),
  
  // Variantes
  variantes: jsonb('variantes').$type<{
    id: string;
    nombre: string;
    texto: string;
    tiempoEstimado: number;
    activa: boolean;
    diasAplica: number[];
  }[]>().default([]),
  
  estado: estadoCierreEnum('estado').default('borrador').notNull(),
  
  // Sugerencias IA
  sugerenciasGeneradas: boolean('sugerencias_generadas').default(false),
  opcionesSugeridas: jsonb('opciones_sugeridas').$type<{ texto: string; score: number }[]>(),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion')
}, (table) => ({
  cunaIdx: index('cierres_cuna_idx').on(table.cunaId),
  presentacionIdx: index('cierres_presentacion_idx').on(table.presentacionId),
  programaIdx: index('cierres_programa_idx').on(table.programaId)
}));

// ═══════════════════════════════════════════════════════════════
// PROMO IDA (Variables Dinámicas)
// ═══════════════════════════════════════════════════════════════

export const promoIDA = pgTable('promo_ida', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  cunaId: uuid('cuna_id').references(() => cunas.id, { onDelete: 'cascade' }).notNull(),
  
  plantillaBase: text('plantilla_base').notNull(),
  variables: jsonb('variables').$type<{
    nombre: string;
    tipo: string;
    valor?: string;
    valorPorDefecto?: string;
    esRequerida: boolean;
    formula?: string;
    sistemaFuente?: string;
  }[]>().default([]),
  
  previewGenerado: text('preview_generado'),
  
  // Evento
  eventoNombre: varchar('evento_nombre', { length: 255 }),
  eventoFecha: timestamp('evento_fecha'),
  eventoLugar: varchar('evento_lugar', { length: 255 }),
  
  // Vigencia promo
  fechaInicioPromo: timestamp('fecha_inicio_promo').notNull(),
  fechaFinPromo: timestamp('fecha_fin_promo').notNull(),
  
  tiempoEstimadoSegundos: integer('tiempo_estimado_segundos'),
  activa: boolean('activa').default(true),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion')
}, (table) => ({
  cunaIdx: index('promo_ida_cuna_idx').on(table.cunaId),
  activaIdx: index('promo_ida_activa_idx').on(table.activa)
}));

// ═══════════════════════════════════════════════════════════════
// GRUPOS DE DISTRIBUCIÓN
// ═══════════════════════════════════════════════════════════════

export const gruposDistribucion = pgTable('grupos_distribucion', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  nombre: varchar('nombre', { length: 255 }).notNull(),
  descripcion: text('descripcion'),
  tipo: varchar('tipo', { length: 50 }).default('personalizado').notNull(),
  
  destinatarios: jsonb('destinatarios').$type<{
    id: string;
    nombre: string;
    email?: string;
    telefono?: string;
    tipo: string;
    metodoPreferido: string;
    activo: boolean;
    emisoraId?: string;
    emisoraNombre?: string;
    turno?: string;
  }[]>().default([]),
  
  autoAgregar: boolean('auto_agregar').default(false),
  criteriosAutoAgregar: jsonb('criterios_auto_agregar'),
  
  // Estadísticas
  totalEnvios: integer('total_envios').default(0),
  tasaConfirmacion: decimal('tasa_confirmacion', { precision: 5, scale: 2 }).default('0'),
  tiempoPromedioConfirmacion: integer('tiempo_promedio_confirmacion').default(0),
  
  activo: boolean('activo').default(true),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion')
}, (table) => ({
  tenantIdx: index('grupos_distribucion_tenant_idx').on(table.tenantId),
  activoIdx: index('grupos_distribucion_activo_idx').on(table.activo)
}));

// ═══════════════════════════════════════════════════════════════
// ENVÍOS DE DISTRIBUCIÓN
// ═══════════════════════════════════════════════════════════════

export const enviosDistribucion = pgTable('envios_distribucion', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  cunaId: uuid('cuna_id').references(() => cunas.id, { onDelete: 'cascade' }).notNull(),
  
  cunaCodigo: varchar('cuna_codigo', { length: 30 }).notNull(),
  cunaNombre: varchar('cuna_nombre', { length: 255 }).notNull(),
  
  gruposIds: jsonb('grupos_ids').$type<string[]>().default([]),
  registrosEnvio: jsonb('registros_envio').$type<{
    id: string;
    destinatarioId: string;
    destinatarioNombre: string;
    metodoUsado: string;
    estado: string;
    fechaEnvio?: string;
    fechaEntrega?: string;
    fechaConfirmacion?: string;
    error?: string;
    intentos: number;
  }[]>().default([]),
  
  contenido: jsonb('contenido').$type<{
    incluyeAudio: boolean;
    incluyeInfo: boolean;
    incluyeInstrucciones: boolean;
    incluyeTranscripcion: boolean;
    notasEspeciales?: string;
  }>(),
  
  plantillaEmail: varchar('plantilla_email', { length: 100 }),
  solicitarConfirmacion: boolean('solicitar_confirmacion').default(true),
  alertarSinConfirmacion: boolean('alertar_sin_confirmacion').default(true),
  horasLimiteConfirmacion: integer('horas_limite_confirmacion').default(24),
  
  estado: varchar('estado', { length: 50 }).default('enviando').notNull(),
  programadoPara: timestamp('programado_para'),
  
  totalDestinatarios: integer('total_destinatarios').default(0),
  enviados: integer('enviados').default(0),
  confirmados: integer('confirmados').default(0),
  fallidos: integer('fallidos').default(0),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  fechaInicio: timestamp('fecha_inicio'),
  fechaCompletado: timestamp('fecha_completado')
}, (table) => ({
  cunaIdx: index('envios_distribucion_cuna_idx').on(table.cunaId),
  estadoIdx: index('envios_distribucion_estado_idx').on(table.estado)
}));

// ═══════════════════════════════════════════════════════════════
// ALERTAS DE VENCIMIENTO
// ═══════════════════════════════════════════════════════════════

export const alertasCuna = pgTable('alertas_cuna', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  cunaId: uuid('cuna_id').references(() => cunas.id, { onDelete: 'cascade' }).notNull(),
  
  tipo: varchar('tipo', { length: 50 }).notNull(),
  prioridad: prioridadAlertaCunasEnum('prioridad').default('media').notNull(),
  mensaje: text('mensaje').notNull(),
  
  fechaAlerta: timestamp('fecha_alerta').notNull(),
  horaAlerta: varchar('hora_alerta', { length: 10 }).default('09:00'),
  
  destinatariosIds: jsonb('destinatarios_ids').$type<string[]>().default([]),
  
  enviada: boolean('enviada').default(false),
  fechaEnvio: timestamp('fecha_envio'),
  
  leida: boolean('leida').default(false),
  fechaLectura: timestamp('fecha_lectura'),
  
  resuelta: boolean('resuelta').default(false),
  fechaResolucion: timestamp('fecha_resolucion'),
  resueltaPorId: uuid('resuelta_por_id').references(() => users.id),
  
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull()
}, (table) => ({
  cunaIdx: index('alertas_cuna_idx').on(table.cunaId),
  prioridadIdx: index('alertas_prioridad_idx').on(table.prioridad),
  fechaAlertaIdx: index('alertas_fecha_idx').on(table.fechaAlerta),
  enviadaIdx: index('alertas_enviada_idx').on(table.enviada)
}));

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const mencionesRelations = relations(menciones, ({ one }) => ({
  cuna: one(cunas, {
    fields: [menciones.cunaId],
    references: [cunas.id]
  }),
  creadoPor: one(users, {
    fields: [menciones.creadoPorId],
    references: [users.id]
  })
}));

export const presentacionesRelations = relations(presentaciones, ({ one }) => ({
  cuna: one(cunas, {
    fields: [presentaciones.cunaId],
    references: [cunas.id]
  }),
  creadoPor: one(users, {
    fields: [presentaciones.creadoPorId],
    references: [users.id]
  })
}));

export const cierresRelations = relations(cierres, ({ one }) => ({
  cuna: one(cunas, {
    fields: [cierres.cunaId],
    references: [cunas.id]
  }),
  presentacion: one(presentaciones, {
    fields: [cierres.presentacionId],
    references: [presentaciones.id]
  }),
  creadoPor: one(users, {
    fields: [cierres.creadoPorId],
    references: [users.id]
  })
}));

export const promoIDARelations = relations(promoIDA, ({ one }) => ({
  cuna: one(cunas, {
    fields: [promoIDA.cunaId],
    references: [cunas.id]
  }),
  creadoPor: one(users, {
    fields: [promoIDA.creadoPorId],
    references: [users.id]
  })
}));

export const enviosDistribucionRelations = relations(enviosDistribucion, ({ one }) => ({
  cuna: one(cunas, {
    fields: [enviosDistribucion.cunaId],
    references: [cunas.id]
  }),
  creadoPor: one(users, {
    fields: [enviosDistribucion.creadoPorId],
    references: [users.id]
  })
}));

export const alertasCunaRelations = relations(alertasCuna, ({ one }) => ({
  cuna: one(cunas, {
    fields: [alertasCuna.cunaId],
    references: [cunas.id]
  }),
  resueltaPor: one(users, {
    fields: [alertasCuna.resueltaPorId],
    references: [users.id]
  })
}));
