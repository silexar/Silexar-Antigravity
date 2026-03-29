/**
 * 📦 SILEXAR PULSE - Materiales y Creativos Schema
 * Schema de base de datos para gestión de materiales, creativos,
 * copy instructions, rotación de cuñas y biblioteca DAM
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { pgTable, uuid, varchar, text, timestamp, boolean, integer, decimal, pgEnum, index, date, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants, users } from './users-schema';
import { cunas } from './cunas-schema';
import { campanas } from './campanas-schema';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const estadoAprobacionMaterialEnum = pgEnum('estado_aprobacion_material', [
  'borrador',
  'qa_pendiente',
  'cliente_pendiente',
  'aprobado',
  'rechazado'
]);

export const tipoCreativoEnum = pgEnum('tipo_creativo', [
  'banner',
  'audio',
  'video',
  'html5',
  'documento'
]);

export const tipoRotacionEnum = pgEnum('tipo_rotacion', [
  'equitativo',
  'ponderado',
  'secuencial',
  'ab_test',
  'por_fecha'
]);

// ═══════════════════════════════════════════════════════════════
// TABLA: COPY INSTRUCTIONS
// ═══════════════════════════════════════════════════════════════

export const copyInstructions = pgTable('copy_instructions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Relación con cuña
  cunaId: uuid('cuna_id').references(() => cunas.id, { onDelete: 'cascade' }).notNull(),
  
  // Texto principal
  textoMencion: text('texto_mencion').notNull(),
  guiaPronunciacion: text('guia_pronunciacion'),
  audioReferenciaUrl: text('audio_referencia_url'),
  
  // Variaciones por horario (JSON)
  variacionesPorHorario: jsonb('variaciones_por_horario'),
  /* Estructura:
  [{
    horario: string,
    tono: string,
    enfasis: string,
    notas: string
  }]
  */
  
  // Restricciones (JSON)
  restricciones: jsonb('restricciones'),
  /* Estructura:
  {
    competidoresExcluidos: string[],
    separacionMinutosCompetencia: number,
    horariosProhibidos: string[],
    programasProhibidos: string[],
    notasRestricciones: string
  }
  */
  
  // Vigencia
  fechaInicioVigencia: date('fecha_inicio_vigencia'),
  fechaFinVigencia: date('fecha_fin_vigencia'),
  
  // Aprobación
  estadoAprobacion: estadoAprobacionMaterialEnum('estado_aprobacion').default('borrador'),
  aprobadoPorCliente: boolean('aprobado_por_cliente').default(false),
  nombreAprobadorCliente: varchar('nombre_aprobador_cliente', { length: 255 }),
  fechaAprobacionCliente: timestamp('fecha_aprobacion_cliente'),
  
  // Versionado
  version: integer('version').default(1).notNull(),
  esVersionActual: boolean('es_version_actual').default(true).notNull(),
  versionAnteriorId: uuid('version_anterior_id'),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion'),
  
  // Soft delete
  eliminado: boolean('eliminado').default(false).notNull()
}, (table) => ({
  tenantIdx: index('copy_instructions_tenant_idx').on(table.tenantId),
  cunaIdx: index('copy_instructions_cuna_idx').on(table.cunaId),
  estadoIdx: index('copy_instructions_estado_idx').on(table.estadoAprobacion)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: CREATIVOS DIGITALES (DAM)
// ═══════════════════════════════════════════════════════════════

export const creativosDigitales = pgTable('creativos_digitales', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Identificación
  nombre: varchar('nombre', { length: 255 }).notNull(),
  tipoCreativo: tipoCreativoEnum('tipo_creativo').notNull(),
  formato: varchar('formato', { length: 10 }).notNull(), // jpg, png, mp3, mp4, html
  
  // Archivos
  urlArchivo: text('url_archivo').notNull(),
  urlThumbnail: text('url_thumbnail'),
  
  // Metadatos técnicos
  dimensiones: jsonb('dimensiones'), // {width: number, height: number}
  duracionSegundos: integer('duracion_segundos'),
  tamanoBytes: integer('tamano_bytes'),
  
  // Organización
  carpetaId: uuid('carpeta_id'),
  tags: text('tags').array(),
  descripcion: text('descripcion'),
  
  // Versionado
  version: integer('version').default(1).notNull(),
  creativoPadreId: uuid('creativo_padre_id'),
  esUltimaVersion: boolean('es_ultima_version').default(true),
  
  // Estado y aprobaciones
  estado: estadoAprobacionMaterialEnum('estado').default('borrador'),
  
  // Aprobación QA
  aprobadoQA: boolean('aprobado_qa').default(false),
  aprobadoQAPorId: uuid('aprobado_qa_por_id').references(() => users.id),
  fechaAprobacionQA: timestamp('fecha_aprobacion_qa'),
  notasQA: text('notas_qa'),
  
  // Aprobación Cliente
  aprobadoCliente: boolean('aprobado_cliente').default(false),
  nombreAprobadorCliente: varchar('nombre_aprobador_cliente', { length: 255 }),
  fechaAprobacionCliente: timestamp('fecha_aprobacion_cliente'),
  notasCliente: text('notas_cliente'),
  
  // Derechos y licencias
  licenciaTipo: varchar('licencia_tipo', { length: 100 }),
  licenciaFechaExpiracion: date('licencia_fecha_expiracion'),
  modeloContratoFirmado: boolean('modelo_contrato_firmado').default(false),
  derechosNotas: text('derechos_notas'),
  
  // Métricas
  impresionesTotal: integer('impresiones_total').default(0),
  clicksTotal: integer('clicks_total').default(0),
  campanasUsadoCount: integer('campanas_usado_count').default(0),
  
  // Auditoría
  subidoPorId: uuid('subido_por_id').references(() => users.id).notNull(),
  fechaSubida: timestamp('fecha_subida').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion'),
  
  // Soft delete
  eliminado: boolean('eliminado').default(false).notNull()
}, (table) => ({
  tenantIdx: index('creativos_tenant_idx').on(table.tenantId),
  tipoIdx: index('creativos_tipo_idx').on(table.tipoCreativo),
  estadoIdx: index('creativos_estado_idx').on(table.estado),
  carpetaIdx: index('creativos_carpeta_idx').on(table.carpetaId)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: CARPETAS DAM
// ═══════════════════════════════════════════════════════════════

export const carpetasDAM = pgTable('carpetas_dam', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  nombre: varchar('nombre', { length: 255 }).notNull(),
  parentId: uuid('parent_id'),
  iconoColor: varchar('icono_color', { length: 7 }).default('#3B82F6'),
  orden: integer('orden').default(0),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull()
}, (table) => ({
  tenantIdx: index('carpetas_tenant_idx').on(table.tenantId),
  parentIdx: index('carpetas_parent_idx').on(table.parentId)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: ROTACIÓN DE CUÑAS
// ═══════════════════════════════════════════════════════════════

export const rotacionCunas = pgTable('rotacion_cunas', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Relaciones
  campanaId: uuid('campana_id').references(() => campanas.id, { onDelete: 'cascade' }).notNull(),
  lineaId: uuid('linea_id').notNull(), // ID de la línea dentro de la campaña
  
  // Configuración
  tipoRotacion: tipoRotacionEnum('tipo_rotacion').default('equitativo').notNull(),
  
  // Cuñas en rotación (JSON)
  cunasEnRotacion: jsonb('cunas_en_rotacion').notNull(),
  /* Estructura:
  [{
    id: string,
    cunaId: string,
    cunaCodigo: string,
    cunaNombre: string,
    duracion: number,
    peso: number,
    fechaInicio?: string,
    fechaFin?: string,
    activa: boolean,
    emisiones: number,
    esVarianteAB?: boolean
  }]
  */
  
  // Cuña de backup
  cunaBackupId: uuid('cuna_backup_id').references(() => cunas.id),
  
  // A/B Testing
  abTestActivo: boolean('ab_test_activo').default(false),
  splitPorcentaje: integer('split_porcentaje').default(50), // 50/50
  
  // Métricas A/B
  emisionesVarianteA: integer('emisiones_variante_a').default(0),
  emisionesVarianteB: integer('emisiones_variante_b').default(0),
  
  // Estado
  activo: boolean('activo').default(true),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion')
}, (table) => ({
  tenantIdx: index('rotacion_tenant_idx').on(table.tenantId),
  campanaIdx: index('rotacion_campana_idx').on(table.campanaId),
  lineaIdx: index('rotacion_linea_idx').on(table.lineaId)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: ASIGNACIÓN CREATIVO-CAMPAÑA
// ═══════════════════════════════════════════════════════════════

export const creativosCampana = pgTable('creativos_campana', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  creativoId: uuid('creativo_id').references(() => creativosDigitales.id, { onDelete: 'cascade' }).notNull(),
  campanaId: uuid('campana_id').references(() => campanas.id, { onDelete: 'cascade' }).notNull(),
  
  // Configuración de tracking
  urlDestino: text('url_destino'),
  parametrosUTM: jsonb('parametros_utm'),
  
  // Métricas de esta campaña
  impresiones: integer('impresiones').default(0),
  clicks: integer('clicks').default(0),
  ctr: decimal('ctr', { precision: 5, scale: 2 }),
  
  // Estado
  activo: boolean('activo').default(true),
  
  // Auditoría
  fechaAsignacion: timestamp('fecha_asignacion').defaultNow().notNull(),
  asignadoPorId: uuid('asignado_por_id').references(() => users.id).notNull()
}, (table) => ({
  creativoIdx: index('creativos_campana_creativo_idx').on(table.creativoId),
  campanaIdx: index('creativos_campana_campana_idx').on(table.campanaId)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: CUÑAS GEMELAS (Twin Spots)
// ═══════════════════════════════════════════════════════════════

export const cunasGemelas = pgTable('cunas_gemelas', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Cuñas vinculadas
  cunaPrincipalId: uuid('cuna_principal_id').references(() => cunas.id, { onDelete: 'cascade' }).notNull(),
  cunaGemelaId: uuid('cuna_gemela_id').references(() => cunas.id, { onDelete: 'cascade' }).notNull(),
  
  // Configuración
  posicion: varchar('posicion', { length: 10 }).notNull(), // 'antes' | 'despues'
  separacionMaxima: integer('separacion_maxima').default(0), // máximo spots entre ellas
  mismoBloque: boolean('mismo_bloque').default(true),
  
  // Estado
  activo: boolean('activo').default(true),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull()
}, (table) => ({
  tenantIdx: index('gemelas_tenant_idx').on(table.tenantId),
  principalIdx: index('gemelas_principal_idx').on(table.cunaPrincipalId),
  gemelaIdx: index('gemelas_gemela_idx').on(table.cunaGemelaId)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: HISTORIAL DE OPERACIONES (para Undo)
// ═══════════════════════════════════════════════════════════════

export const historialOperaciones = pgTable('historial_operaciones', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Información de la operación
  tipoOperacion: varchar('tipo_operacion', { length: 50 }).notNull(), // 'asignar', 'cancelar', 'reemplazar', etc
  descripcion: text('descripcion').notNull(),
  
  // Entidad afectada
  entidadTipo: varchar('entidad_tipo', { length: 50 }).notNull(), // 'cuna', 'linea', 'campana'
  entidadId: uuid('entidad_id').notNull(),
  campanaId: uuid('campana_id').references(() => campanas.id),
  
  // Datos para revertir (JSON)
  datosAnteriores: jsonb('datos_anteriores'),
  datosNuevos: jsonb('datos_nuevos'),
  
  // Estado
  revertible: boolean('revertible').default(true),
  revertido: boolean('revertido').default(false),
  fechaReversion: timestamp('fecha_reversion'),
  
  // Auditoría
  usuarioId: uuid('usuario_id').references(() => users.id).notNull(),
  fechaOperacion: timestamp('fecha_operacion').defaultNow().notNull()
}, (table) => ({
  tenantIdx: index('historial_tenant_idx').on(table.tenantId),
  campanaIdx: index('historial_campana_idx').on(table.campanaId),
  fechaIdx: index('historial_fecha_idx').on(table.fechaOperacion)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: REGLAS ANTI-COMPETENCIA
// ═══════════════════════════════════════════════════════════════

export const reglasCompetencia = pgTable('reglas_competencia', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Anunciantes
  anuncianteA: varchar('anunciante_a', { length: 255 }).notNull(),
  anuncianteB: varchar('anunciante_b', { length: 255 }).notNull(),
  
  // Configuración
  separacionMinima: integer('separacion_minima').default(10).notNull(), // minutos
  mismaTandaProhibida: boolean('misma_tanda_prohibida').default(true).notNull(),
  prioridad: varchar('prioridad', { length: 10 }).default('alta').notNull(),
  categoria: varchar('categoria', { length: 100 }),
  
  // Estado
  activa: boolean('activa').default(true).notNull(),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull()
}, (table) => ({
  tenantIdx: index('reglas_comp_tenant_idx').on(table.tenantId),
  anuncianteAIdx: index('reglas_comp_a_idx').on(table.anuncianteA),
  anuncianteBIdx: index('reglas_comp_b_idx').on(table.anuncianteB)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: NOTAS DE SPOTS
// ═══════════════════════════════════════════════════════════════

export const notasSpots = pgTable('notas_spots', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Relación
  spotId: uuid('spot_id').notNull(),
  campanaId: uuid('campana_id').references(() => campanas.id),
  
  // Contenido
  tipo: varchar('tipo', { length: 20 }).default('instruccion').notNull(), // instruccion, alerta, info, prioridad, ubicacion
  titulo: varchar('titulo', { length: 255 }).notNull(),
  contenido: text('contenido'),
  prioridad: varchar('prioridad', { length: 10 }).default('media').notNull(),
  
  // Opciones
  visibleEnLog: boolean('visible_en_log').default(true),
  fijada: boolean('fijada').default(false),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion')
}, (table) => ({
  tenantIdx: index('notas_spots_tenant_idx').on(table.tenantId),
  spotIdx: index('notas_spots_spot_idx').on(table.spotId),
  campanaIdx: index('notas_spots_campana_idx').on(table.campanaId)
}));

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const copyInstructionsRelations = relations(copyInstructions, ({ one }) => ({
  tenant: one(tenants, { fields: [copyInstructions.tenantId], references: [tenants.id] }),
  cuna: one(cunas, { fields: [copyInstructions.cunaId], references: [cunas.id] }),
  creadoPor: one(users, { fields: [copyInstructions.creadoPorId], references: [users.id] })
}));

export const creativosDigitalesRelations = relations(creativosDigitales, ({ one, many }) => ({
  tenant: one(tenants, { fields: [creativosDigitales.tenantId], references: [tenants.id] }),
  carpeta: one(carpetasDAM, { fields: [creativosDigitales.carpetaId], references: [carpetasDAM.id] }),
  subidoPor: one(users, { fields: [creativosDigitales.subidoPorId], references: [users.id] }),
  campanas: many(creativosCampana)
}));

export const carpetasDAMRelations = relations(carpetasDAM, ({ one, many }) => ({
  tenant: one(tenants, { fields: [carpetasDAM.tenantId], references: [tenants.id] }),
  parent: one(carpetasDAM, { fields: [carpetasDAM.parentId], references: [carpetasDAM.id] }),
  creativos: many(creativosDigitales)
}));

export const rotacionCunasRelations = relations(rotacionCunas, ({ one }) => ({
  tenant: one(tenants, { fields: [rotacionCunas.tenantId], references: [tenants.id] }),
  campana: one(campanas, { fields: [rotacionCunas.campanaId], references: [campanas.id] }),
  cunaBackup: one(cunas, { fields: [rotacionCunas.cunaBackupId], references: [cunas.id] }),
  creadoPor: one(users, { fields: [rotacionCunas.creadoPorId], references: [users.id] })
}));

export const creativosCampanaRelations = relations(creativosCampana, ({ one }) => ({
  creativo: one(creativosDigitales, { fields: [creativosCampana.creativoId], references: [creativosDigitales.id] }),
  campana: one(campanas, { fields: [creativosCampana.campanaId], references: [campanas.id] }),
  asignadoPor: one(users, { fields: [creativosCampana.asignadoPorId], references: [users.id] })
}));

// ═══════════════════════════════════════════════════════════════
// TIPOS EXPORTADOS
// ═══════════════════════════════════════════════════════════════

export type CopyInstruction = typeof copyInstructions.$inferSelect;
export type NewCopyInstruction = typeof copyInstructions.$inferInsert;
export type CreativoDigital = typeof creativosDigitales.$inferSelect;
export type NewCreativoDigital = typeof creativosDigitales.$inferInsert;
export type CarpetaDAM = typeof carpetasDAM.$inferSelect;
export type RotacionCuna = typeof rotacionCunas.$inferSelect;
export type CreativoCampana = typeof creativosCampana.$inferSelect;

export type EstadoAprobacionMaterial = 'borrador' | 'qa_pendiente' | 'cliente_pendiente' | 'aprobado' | 'rechazado';
export type TipoCreativo = 'banner' | 'audio' | 'video' | 'html5' | 'documento';
export type TipoRotacion = 'equitativo' | 'ponderado' | 'secuencial' | 'ab_test' | 'por_fecha';

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

export interface CreativoDTO {
  id: string;
  nombre: string;
  tipo: TipoCreativo;
  formato: string;
  thumbnailUrl?: string;
  estado: EstadoAprobacionMaterial;
  impresiones: number;
  clicks: number;
  fechaSubida: Date;
}

export interface CopyInstructionDTO {
  id: string;
  cunaId: string;
  cunaCodigo: string;
  textoMencion: string;
  estadoAprobacion: EstadoAprobacionMaterial;
  aprobadoPorCliente: boolean;
  vigenciaInicio?: Date;
  vigenciaFin?: Date;
}
