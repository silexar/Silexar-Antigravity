/**
 * 📡 SILEXAR PULSE - Emisión y Pauta Schema
 * Schema de base de datos para operación de emisión radial
 *
 * @description Gestión de tandas comerciales, esqueleto de pauta,
 * programación de spots y conciliación de emisiones
 *
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  pgEnum,
  index,
  date,
  time,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants, users } from "./users-schema";
import { emisoras } from "./emisoras-schema";
import { cunas } from "./cunas-schema";
import { campanas } from "./campanas-schema";

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const estadoTandaEnum = pgEnum("estado_tanda", [
  "planificada",
  "en_revision",
  "aprobada",
  "exportada",
  "emitida",
  "verificada",
]);

export const estadoSpotPautaEnum = pgEnum("estado_spot_pauta", [
  "programado",
  "emitido",
  "confirmado",
  "no_emitido",
  "reagendado",
]);

export const metodoConfirmacionEnum = pgEnum("metodo_confirmacion", [
  "manual",
  "shazam",
  "fingerprint",
  "automatico",
  "speech_to_text",
]);

// ═══════════════════════════════════════════════════════════════
// TABLA: TANDAS COMERCIALES (Bloques de spots)
// ═══════════════════════════════════════════════════════════════

export const tandas = pgTable(
  "tandas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    emisoraId: uuid("emisora_id")
      .references(() => emisoras.id)
      .notNull(),

    // Identificación
    codigo: varchar("codigo", { length: 30 }).notNull(),
    nombre: varchar("nombre", { length: 100 }),

    // Fecha y hora
    fecha: date("fecha").notNull(),
    horaInicio: time("hora_inicio").notNull(),
    horaFin: time("hora_fin"),

    // Duración
    duracionMaximaSegundos: integer("duracion_maxima_segundos").default(180), // 3 min típico
    duracionProgramadaSegundos: integer("duracion_programada_segundos").default(
      0,
    ),

    // Spots
    spotsMaximos: integer("spots_maximos").default(6),
    spotsProgramados: integer("spots_programados").default(0),

    // Estado
    estado: estadoTandaEnum("estado").default("planificada").notNull(),

    // Exportación
    exportada: boolean("exportada").default(false).notNull(),
    fechaExportacion: timestamp("fecha_exportacion"),
    archivoExportacion: text("archivo_exportacion"), // Ruta al archivo generado

    // Auditoría
    creadoPorId: uuid("creado_por_id").references(() => users.id),
    fechaCreacion: timestamp("fecha_creacion").defaultNow().notNull(),
    modificadoPorId: uuid("modificado_por_id").references(() => users.id),
    fechaModificacion: timestamp("fecha_modificacion"),
  },
  (table) => ({
    tenantIdx: index("tandas_tenant_idx").on(table.tenantId),
    emisoraIdx: index("tandas_emisora_idx").on(table.emisoraId),
    fechaIdx: index("tandas_fecha_idx").on(table.fecha),
    horarioIdx: index("tandas_horario_idx").on(table.fecha, table.horaInicio),
    estadoIdx: index("tandas_estado_idx").on(table.estado),
  }),
);

// ═══════════════════════════════════════════════════════════════
// TABLA: SPOTS EN TANDA (Orden de emisión)
// ═══════════════════════════════════════════════════════════════

export const spotsTanda = pgTable(
  "spots_tanda",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    tandaId: uuid("tanda_id")
      .references(() => tandas.id, { onDelete: "cascade" })
      .notNull(),
    cunaId: uuid("cuna_id")
      .references(() => cunas.id)
      .notNull(),
    campanaId: uuid("campana_id").references(() => campanas.id),

    // Posición en la tanda
    orden: integer("orden").notNull(),

    // Duración
    duracionSegundos: integer("duracion_segundos").notNull(),

    // Estado
    estado: estadoSpotPautaEnum("estado").default("programado").notNull(),

    // Confirmación de emisión
    emitido: boolean("emitido").default(false).notNull(),
    horaEmisionReal: time("hora_emision_real"),
    fechaHoraConfirmacion: timestamp("fecha_hora_confirmacion"),
    metodoConfirmacion: metodoConfirmacionEnum("metodo_confirmacion"),
    confianzaConfirmacion: integer("confianza_confirmacion"), // 0-100

    // Reagendado
    reagendadoA: uuid("reagendado_a"), // Referencia a otro spot_tanda
    motivoReagendado: text("motivo_reagendado"),

    // Notas
    notas: text("notas"),

    // Auditoría
    fechaCreacion: timestamp("fecha_creacion").defaultNow().notNull(),
  },
  (table) => ({
    tandaIdx: index("spots_tanda_tanda_idx").on(table.tandaId),
    cunaIdx: index("spots_tanda_cuna_idx").on(table.cunaId),
    ordenIdx: index("spots_tanda_orden_idx").on(table.tandaId, table.orden),
    estadoIdx: index("spots_tanda_estado_idx").on(table.estado),
  }),
);

// ═══════════════════════════════════════════════════════════════
// TABLA: CONCILIACIÓN (Pauta vs Emisión)
// ═══════════════════════════════════════════════════════════════

export const conciliacion = pgTable(
  "conciliacion",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    emisoraId: uuid("emisora_id")
      .references(() => emisoras.id)
      .notNull(),

    // Fecha de conciliación
    fecha: date("fecha").notNull(),

    // Métricas
    spotsProgramados: integer("spots_programados").default(0),
    spotsEmitidos: integer("spots_emitidos").default(0),
    spotsConfirmados: integer("spots_confirmados").default(0),
    spotsNoEmitidos: integer("spots_no_emitidos").default(0),
    spotsReagendados: integer("spots_reagendados").default(0),

    // Porcentaje de cumplimiento
    porcentajeCumplimiento: decimal("porcentaje_cumplimiento", {
      precision: 5,
      scale: 2,
    }).default("0"),

    // Estado
    procesada: boolean("procesada").default(false).notNull(),
    fechaProcesamiento: timestamp("fecha_procesamiento"),

    // Detalles adicionales
    observaciones: text("observaciones"),
    discrepanciasJson: jsonb("discrepancias_json"), // Detalle de diferencias

    // Auditoría
    procesadoPorId: uuid("procesado_por_id").references(() => users.id),
    fechaCreacion: timestamp("fecha_creacion").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index("conciliacion_tenant_idx").on(table.tenantId),
    emisoraIdx: index("conciliacion_emisora_idx").on(table.emisoraId),
    fechaIdx: index("conciliacion_fecha_idx").on(table.fecha),
    tenantFechaIdx: index("conciliacion_tenant_fecha_idx").on(
      table.tenantId,
      table.fecha,
    ),
  }),
);

// ═══════════════════════════════════════════════════════════════
// TABLA: REGISTRO DE DETECCIÓN (Shazam/Fingerprint)
// ═══════════════════════════════════════════════════════════════

export const registroDeteccion = pgTable(
  "registro_deteccion",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    emisoraId: uuid("emisora_id")
      .references(() => emisoras.id)
      .notNull(),

    // Detección
    fechaHoraDeteccion: timestamp("fecha_hora_deteccion").notNull(),

    // Cuña detectada
    cunaId: uuid("cuna_id").references(() => cunas.id),
    spotTandaId: uuid("spot_tanda_id").references(() => spotsTanda.id),

    // Método y confianza
    metodoDeteccion: metodoConfirmacionEnum("metodo_deteccion").notNull(),
    confianza: integer("confianza").notNull(), // 0-100

    // Audio fingerprint
    fingerprint: text("fingerprint"),
    duracionDetectada: integer("duracion_detectada"), // Segundos

    // Para speech-to-text (menciones)
    textoDetectado: text("texto_detectado"),
    palabrasClave: jsonb("palabras_clave"),

    // Validación
    validado: boolean("validado").default(false).notNull(),
    validadoPorId: uuid("validado_por_id").references(() => users.id),
    fechaValidacion: timestamp("fecha_validacion"),

    // Auditoría
    fechaCreacion: timestamp("fecha_creacion").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index("deteccion_tenant_idx").on(table.tenantId),
    emisoraIdx: index("deteccion_emisora_idx").on(table.emisoraId),
    fechaIdx: index("deteccion_fecha_idx").on(table.fechaHoraDeteccion),
    cunaIdx: index("deteccion_cuna_idx").on(table.cunaId),
  }),
);

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const tandasRelations = relations(tandas, ({ one, many }) => ({
  tenant: one(tenants, { fields: [tandas.tenantId], references: [tenants.id] }),
  emisora: one(emisoras, {
    fields: [tandas.emisoraId],
    references: [emisoras.id],
  }),
  spots: many(spotsTanda),
}));

export const spotsTandaRelations = relations(spotsTanda, ({ one }) => ({
  tanda: one(tandas, { fields: [spotsTanda.tandaId], references: [tandas.id] }),
  cuna: one(cunas, { fields: [spotsTanda.cunaId], references: [cunas.id] }),
  campana: one(campanas, {
    fields: [spotsTanda.campanaId],
    references: [campanas.id],
  }),
}));

export const conciliacionRelations = relations(conciliacion, ({ one }) => ({
  emisora: one(emisoras, {
    fields: [conciliacion.emisoraId],
    references: [emisoras.id],
  }),
}));

export const registroDeteccionRelations = relations(
  registroDeteccion,
  ({ one }) => ({
    emisora: one(emisoras, {
      fields: [registroDeteccion.emisoraId],
      references: [emisoras.id],
    }),
    cuna: one(cunas, {
      fields: [registroDeteccion.cunaId],
      references: [cunas.id],
    }),
    spotTanda: one(spotsTanda, {
      fields: [registroDeteccion.spotTandaId],
      references: [spotsTanda.id],
    }),
  }),
);

// ═══════════════════════════════════════════════════════════════
// ENUMS ADICIONALES - VERIFICACIÓN TIER 0
// ═══════════════════════════════════════════════════════════════

export const estadoVerificacionEnum = pgEnum("estado_verificacion", [
  "pendiente",
  "en_proceso",
  "completada",
  "parcial",
  "fallida",
]);

export const tipoMaterialVerificacionEnum = pgEnum(
  "tipo_material_verificacion",
  ["audio_pregrabado", "mencion_vivo", "presentacion", "cierre"],
);

export const prioridadAlertaEnum = pgEnum("prioridad_alerta", [
  "baja",
  "media",
  "alta",
  "critica",
]);

export const estadoAlertaEnum = pgEnum("estado_alerta", [
  "nueva",
  "asignada",
  "en_revision",
  "resuelta",
  "escalada",
  "cerrada",
]);

export const estadoRegistroAireEnum = pgEnum("estado_registro_aire", [
  "pendiente",
  "procesando",
  "procesado",
  "error",
]);

// ═══════════════════════════════════════════════════════════════
// TABLA: REGISTROS DE AIRE (Grabaciones 24h)
// ═══════════════════════════════════════════════════════════════

export const registrosAire = pgTable(
  "registros_aire",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),

    // Fuente
    emisoraId: uuid("emisora_id")
      .references(() => emisoras.id)
      .notNull(),
    fechaEmision: date("fecha_emision").notNull(),

    // Archivo
    urlArchivo: varchar("url_archivo", { length: 500 }).notNull(),
    duracionSegundos: integer("duracion_segundos").notNull(),
    formato: varchar("formato", { length: 10 }).notNull(), // mp3, wav, flac
    tamanioBytes: integer("tamanio_bytes"),

    // Integridad
    hashSha256: varchar("hash_sha256", { length: 64 }),

    // Metadatos técnicos
    metadata: jsonb("metadata").$type<{
      bitrate?: number;
      sampleRate?: number;
      channels?: number;
      codec?: string;
    }>().default({}),

    // Estado
    estado: estadoRegistroAireEnum("estado").default("pendiente").notNull(),
    errorMensaje: text("error_mensaje"),

    // Procesamiento
    procesadoPorId: uuid("procesado_por_id").references(() => users.id),
    fechaProcesamiento: timestamp("fecha_procesamiento"),

    // Auditoría
    creadoPorId: uuid("creado_por_id").references(() => users.id),
    fechaCreacion: timestamp("fecha_creacion").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index("aire_tenant_idx").on(table.tenantId),
    emisoraIdx: index("aire_emisora_idx").on(table.emisoraId),
    fechaIdx: index("aire_fecha_idx").on(table.fechaEmision),
    estadoIdx: index("aire_estado_idx").on(table.estado),
  }),
);

export const registrosAireRelations = relations(
  registrosAire,
  ({ one }) => ({
    emisora: one(emisoras, {
      fields: [registrosAire.emisoraId],
      references: [emisoras.id],
    }),
    procesadoPor: one(users, {
      fields: [registrosAire.procesadoPorId],
      references: [users.id],
    }),
  }),
);

// ═══════════════════════════════════════════════════════════════
// TABLA: VERIFICACIONES DE EMISIÓN (Shazam Militar)
// ═══════════════════════════════════════════════════════════════

export const verificacionesEmision = pgTable(
  "verificaciones_emision",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),

    // Contexto comercial
    anuncianteId: uuid("anunciante_id"),
    campanaId: uuid("campana_id").references(() => campanas.id),
    contratoId: uuid("contrato_id"),
    ejecutivoId: uuid("ejecutivo_id").references(() => users.id),

    // Configuración de búsqueda
    fechaBusqueda: date("fecha_busqueda").notNull(),
    horaInicio: time("hora_inicio").notNull(),
    horaFin: time("hora_fin").notNull(),
    emisorasIds: jsonb("emisoras_ids").$type<string[]>().default([]),
    registrosAireIds: jsonb("registros_aire_ids").$type<string[]>().default([]),

    // Materiales buscados
    materialesIds: jsonb("materiales_ids").$type<string[]>().default([]),
    tiposMaterial: jsonb("tipos_material").$type<string[]>().default([]),

    // Configuración avanzada
    toleranciaMinutos: integer("tolerancia_minutos").default(10),
    sensibilidadPorcentaje: integer("sensibilidad_porcentaje").default(95),

    // Estado y progreso
    estado: estadoVerificacionEnum("estado").default("pendiente").notNull(),
    progresoPorcentaje: integer("progreso_porcentaje").default(0),

    // Resultados
    totalMaterialesBuscados: integer("total_materiales_buscados").default(0),
    materialesEncontrados: integer("materiales_encontrados").default(0),
    materialesNoEncontrados: integer("materiales_no_encontrados").default(0),
    accuracyPromedio: integer("accuracy_promedio").default(0),

    // Tiempos
    tiempoProcesamientoMs: integer("tiempo_procesamiento_ms"),
    fechaInicioProceso: timestamp("fecha_inicio_proceso"),
    fechaFinProceso: timestamp("fecha_fin_proceso"),

    // Resultados detallados (JSON)
    resultadosJson: jsonb("resultados_json").$type<{
      encontrados: Array<{
        materialId: string;
        tipoMaterial: string;
        nombreMaterial: string;
        horaEmision: string;
        accuracy: number;
        clipUrl?: string;
        transcripcion?: string;
      }>;
      noEncontrados: Array<{
        materialId: string;
        tipoMaterial: string;
        nombreMaterial: string;
        posibleCausa?: string;
      }>;
    }>(),

    // Auditoría
    creadoPorId: uuid("creado_por_id").references(() => users.id),
    fechaCreacion: timestamp("fecha_creacion").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index("verif_tenant_idx").on(table.tenantId),
    estadoIdx: index("verif_estado_idx").on(table.estado),
    fechaIdx: index("verif_fecha_idx").on(table.fechaBusqueda),
    campanaIdx: index("verif_campana_idx").on(table.campanaId),
  }),
);

// ═══════════════════════════════════════════════════════════════
// TABLA: CERTIFICADOS DE EMISIÓN (Blockchain)
// ═══════════════════════════════════════════════════════════════

export const certificadosEmision = pgTable(
  "certificados_emision",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    verificacionId: uuid("verificacion_id")
      .references(() => verificacionesEmision.id)
      .notNull(),

    // Información del certificado
    numeroCertificado: varchar("numero_certificado", { length: 50 }).notNull(),
    titulo: varchar("titulo", { length: 200 }).notNull(),
    descripcion: text("descripcion"),

    // Contexto
    anuncianteNombre: varchar("anunciante_nombre", { length: 200 }),
    campanaNombre: varchar("campana_nombre", { length: 200 }),
    fechaEmision: date("fecha_emision").notNull(),
    emisoraNombre: varchar("emisora_nombre", { length: 200 }),

    // Resumen de verificación
    totalSpots: integer("total_spots").default(0),
    spotsVerificados: integer("spots_verificados").default(0),
    porcentajeCumplimiento: integer("porcentaje_cumplimiento").default(0),

    // Blockchain
    hashBlockchain: varchar("hash_blockchain", { length: 128 }),
    timestampBlockchain: timestamp("timestamp_blockchain"),
    esValidoLegalmente: boolean("es_valido_legalmente").default(true),

    // Archivos generados
    pdfUrl: varchar("pdf_url", { length: 500 }),
    clipsZipUrl: varchar("clips_zip_url", { length: 500 }),

    // Entrega
    enviadoPorEmail: boolean("enviado_por_email").default(false),
    emailDestinatarios: jsonb("email_destinatarios")
      .$type<string[]>()
      .default([]),
    fechaEnvioEmail: timestamp("fecha_envio_email"),

    subidoADrive: boolean("subido_a_drive").default(false),
    driveUrl: varchar("drive_url", { length: 500 }),
    fechaSubidaDrive: timestamp("fecha_subida_drive"),

    // Auditoría
    creadoPorId: uuid("creado_por_id").references(() => users.id),
    fechaCreacion: timestamp("fecha_creacion").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index("cert_tenant_idx").on(table.tenantId),
    verificacionIdx: index("cert_verificacion_idx").on(table.verificacionId),
    numeroIdx: index("cert_numero_idx").on(table.numeroCertificado),
  }),
);

// ═══════════════════════════════════════════════════════════════
// TABLA: ALERTAS DE PROGRAMACIÓN
// ═══════════════════════════════════════════════════════════════

export const alertasProgramacion = pgTable(
  "alertas_programacion",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),

    // Origen de la alerta
    verificacionId: uuid("verificacion_id").references(
      () => verificacionesEmision.id,
    ),
    spotTandaId: uuid("spot_tanda_id").references(() => spotsTanda.id),
    cunaId: uuid("cuna_id").references(() => cunas.id),

    // Contexto
    anuncianteId: uuid("anunciante_id"),
    anuncianteNombre: varchar("anunciante_nombre", { length: 200 }),
    campanaNombre: varchar("campana_nombre", { length: 200 }),
    materialNombre: varchar("material_nombre", { length: 300 }),

    // Información del problema
    tipoProblema: varchar("tipo_problema", { length: 100 }).notNull(), // 'no_emitido', 'hora_incorrecta', 'duracion_incorrecta'
    descripcionProblema: text("descripcion_problema").notNull(),
    fechaProgramada: date("fecha_programada"),
    horaProgramada: time("hora_programada"),
    emisoraNombre: varchar("emisora_nombre", { length: 200 }),

    // Análisis IA
    causasPosiblesIa: jsonb("causas_posibles_ia").$type<string[]>().default([]),
    recomendacionIa: text("recomendacion_ia"),

    // Estado
    prioridad: prioridadAlertaEnum("prioridad").default("media").notNull(),
    estado: estadoAlertaEnum("estado").default("nueva").notNull(),

    // Asignación
    asignadoAId: uuid("asignado_a_id").references(() => users.id),
    asignadoANombre: varchar("asignado_a_nombre", { length: 200 }),
    fechaAsignacion: timestamp("fecha_asignacion"),

    // Resolución
    resolucion: text("resolucion"),
    fechaResolucion: timestamp("fecha_resolucion"),
    resueltoPorId: uuid("resuelto_por_id").references(() => users.id),

    // Notificaciones
    notificadosIds: jsonb("notificados_ids").$type<string[]>().default([]),
    fechaUltimaNotificacion: timestamp("fecha_ultima_notificacion"),
    contadorNotificaciones: integer("contador_notificaciones").default(0),

    // Mensajes
    mensajeOriginal: text("mensaje_original"),
    respuestas: jsonb("respuestas")
      .$type<
        Array<{
          usuarioId: string;
          usuarioNombre: string;
          mensaje: string;
          fecha: string;
        }>
      >()
      .default([]),

    // Auditoría
    creadoPorId: uuid("creado_por_id").references(() => users.id),
    creadoPorNombre: varchar("creado_por_nombre", { length: 200 }),
    fechaCreacion: timestamp("fecha_creacion").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index("alert_tenant_idx").on(table.tenantId),
    estadoIdx: index("alert_estado_idx").on(table.estado),
    prioridadIdx: index("alert_prioridad_idx").on(table.prioridad),
    asignadoIdx: index("alert_asignado_idx").on(table.asignadoAId),
  }),
);

// ═══════════════════════════════════════════════════════════════
// RELACIONES ADICIONALES
// ═══════════════════════════════════════════════════════════════

export const verificacionesEmisionRelations = relations(
  verificacionesEmision,
  ({ one, many }) => ({
    campana: one(campanas, {
      fields: [verificacionesEmision.campanaId],
      references: [campanas.id],
    }),
    ejecutivo: one(users, {
      fields: [verificacionesEmision.ejecutivoId],
      references: [users.id],
    }),
    certificados: many(certificadosEmision),
    alertas: many(alertasProgramacion),
  }),
);

export const certificadosEmisionRelations = relations(
  certificadosEmision,
  ({ one }) => ({
    verificacion: one(verificacionesEmision, {
      fields: [certificadosEmision.verificacionId],
      references: [verificacionesEmision.id],
    }),
  }),
);

export const alertasProgramacionRelations = relations(
  alertasProgramacion,
  ({ one }) => ({
    verificacion: one(verificacionesEmision, {
      fields: [alertasProgramacion.verificacionId],
      references: [verificacionesEmision.id],
    }),
    spotTanda: one(spotsTanda, {
      fields: [alertasProgramacion.spotTandaId],
      references: [spotsTanda.id],
    }),
    cuna: one(cunas, {
      fields: [alertasProgramacion.cunaId],
      references: [cunas.id],
    }),
    asignadoA: one(users, {
      fields: [alertasProgramacion.asignadoAId],
      references: [users.id],
    }),
  }),
);

// ═══════════════════════════════════════════════════════════════
// TABLA: LINKS TEMPORALES DE ENTREGA (Secure Client Delivery)
// ═══════════════════════════════════════════════════════════════

export const estadoLinkTemporalEnum = pgEnum("estado_link_temporal", [
  "activo",
  "usado",
  "expirado",
  "revocado",
]);

export const linksTemporales = pgTable(
  "links_temporales",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),

    // Identificadores únicos
    linkUuid: varchar("link_uuid", { length: 64 }).notNull().unique(),
    codigoAcceso: varchar("codigo_acceso", { length: 10 }).notNull(),

    // Contenido del registro
    verificacionId: uuid("verificacion_id").references(
      () => verificacionesEmision.id,
    ),
    clipEvidenciaId: uuid("clip_evidencia_id").references(
      () => clipsEvidencia.id,
    ),
    tipoLink: varchar("tipo_link", { length: 20 }).default("unico").notNull(), // 'unico' | 'basket'
    itemsJson: jsonb("items_json").$type<Array<{
      materialNombre: string;
      spxCode?: string;
      clipUrl?: string;
      imageUrl?: string;
      esDigital?: boolean;
      horaEmision?: string;
    }>>(), // Para baskets con múltiples items

    // Campos legacy para links únicos (o principal del basket)
    materialNombre: varchar("material_nombre", { length: 300 }), // Ahora nullable
    spxCode: varchar("spx_code", { length: 50 }),
    clipUrl: varchar("clip_url", { length: 500 }),
    imageUrl: varchar("image_url", { length: 500 }),
    esDigital: boolean("es_digital").default(false),

    // Contexto del cliente
    clienteNombre: varchar("cliente_nombre", { length: 200 }),
    clienteEmail: varchar("cliente_email", { length: 200 }).notNull(),
    campanaNombre: varchar("campana_nombre", { length: 200 }),

    // Expiración y estado
    estado: estadoLinkTemporalEnum("estado").default("activo").notNull(),
    fechaCreacion: timestamp("fecha_creacion").defaultNow().notNull(),
    fechaExpiracion: timestamp("fecha_expiracion").notNull(),
    fechaAcceso: timestamp("fecha_acceso"), // Cuando el cliente lo abrió (último)
    fechaDescarga: timestamp("fecha_descarga"), // Cuando descargó (último)

    // Control de usos
    usosPermitidos: integer("usos_permitidos").default(0), // 0 = ilimitado
    usosRealizados: integer("usos_realizados").default(0),

    // Tracking
    accesosCount: integer("accesos_count").default(0),
    ipAcceso: varchar("ip_acceso", { length: 50 }),
    userAgentAcceso: varchar("user_agent_acceso", { length: 500 }),

    // Auditoría
    creadoPorId: uuid("creado_por_id").references(() => users.id),
    creadoPorNombre: varchar("creado_por_nombre", { length: 200 }),
  },
  (table) => ({
    tenantIdx: index("links_temp_tenant_idx").on(table.tenantId),
    linkUuidIdx: index("links_temp_uuid_idx").on(table.linkUuid),
    estadoIdx: index("links_temp_estado_idx").on(table.estado),
    expiracionIdx: index("links_temp_expiracion_idx").on(table.fechaExpiracion),
    clienteEmailIdx: index("links_temp_cliente_idx").on(table.clienteEmail),
  }),
);

export const linksTemporalesRelations = relations(
  linksTemporales,
  ({ one, many }) => ({
    verificacion: one(verificacionesEmision, {
      fields: [linksTemporales.verificacionId],
      references: [verificacionesEmision.id],
    }),
    clipEvidencia: one(clipsEvidencia, {
      fields: [linksTemporales.clipEvidenciaId],
      references: [clipsEvidencia.id],
    }),
    creadoPor: one(users, {
      fields: [linksTemporales.creadoPorId],
      references: [users.id],
    }),
    accesos: many(accesosLinkTemporal),
  }),
);

// ═══════════════════════════════════════════════════════════════
// TABLA: CLIPS DE EVIDENCIA
// ═══════════════════════════════════════════════════════════════

export const clipsEvidencia = pgTable(
  "clips_evidencia",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),

    // Relaciones
    verificacionId: uuid("verificacion_id")
      .references(() => verificacionesEmision.id, { onDelete: "cascade" })
      .notNull(),
    deteccionId: uuid("deteccion_id").references(() => registroDeteccion.id),

    // Archivo
    urlArchivo: varchar("url_archivo", { length: 500 }).notNull(),
    duracionSegundos: integer("duracion_segundos").notNull(),
    formato: varchar("formato", { length: 10 }).notNull(), // wav, mp3, flac

    // Metadatos del corte
    horaInicioClip: time("hora_inicio_clip").notNull(),
    horaFinClip: time("hora_fin_clip").notNull(),

    // Hash de integridad
    hashSha256: varchar("hash_sha256", { length: 64 }).notNull(),

    // Transcripción (para menciones)
    transcripcion: text("transcripcion"),

    // Estado y expiración
    aprobado: boolean("aprobado").default(false).notNull(),
    aprobadoPorId: uuid("aprobado_por_id").references(() => users.id),
    fechaAprobacion: timestamp("fecha_aprobacion"),
    fechaExpiracion: timestamp("fecha_expiracion").notNull(),

    // Auditoría
    creadoPorId: uuid("creado_por_id").references(() => users.id),
    fechaCreacion: timestamp("fecha_creacion").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index("clips_tenant_idx").on(table.tenantId),
    verificacionIdx: index("clips_verif_idx").on(table.verificacionId),
    expiracionIdx: index("clips_expiracion_idx").on(table.fechaExpiracion),
    hashIdx: index("clips_hash_idx").on(table.hashSha256),
  }),
);

export const clipsEvidenciaRelations = relations(
  clipsEvidencia,
  ({ one }) => ({
    verificacion: one(verificacionesEmision, {
      fields: [clipsEvidencia.verificacionId],
      references: [verificacionesEmision.id],
    }),
    deteccion: one(registroDeteccion, {
      fields: [clipsEvidencia.deteccionId],
      references: [registroDeteccion.id],
    }),
    aprobadoPor: one(users, {
      fields: [clipsEvidencia.aprobadoPorId],
      references: [users.id],
    }),
  }),
);

// ═══════════════════════════════════════════════════════════════
// TABLA: ACCESOS A LINKS TEMPORALES (Auditoría completa)
// ═══════════════════════════════════════════════════════════════

export const accesosLinkTemporal = pgTable(
  "accesos_link_temporal",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),

    linkTemporalId: uuid("link_temporal_id")
      .references(() => linksTemporales.id, { onDelete: "cascade" })
      .notNull(),

    // Información del acceso
    ipAddress: varchar("ip_address", { length: 50 }),
    userAgent: varchar("user_agent", { length: 500 }),
    accion: varchar("accion", { length: 20 }).notNull(), // 'visualizacion' | 'descarga'

    // Auditoría
    fechaAcceso: timestamp("fecha_acceso").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index("accesos_tenant_idx").on(table.tenantId),
    linkIdx: index("accesos_link_idx").on(table.linkTemporalId),
    fechaIdx: index("accesos_fecha_idx").on(table.fechaAcceso),
  }),
);

export const accesosLinkTemporalRelations = relations(
  accesosLinkTemporal,
  ({ one }) => ({
    linkTemporal: one(linksTemporales, {
      fields: [accesosLinkTemporal.linkTemporalId],
      references: [linksTemporales.id],
    }),
  }),
);

// ═══════════════════════════════════════════════════════════════
// TIPOS EXPORTADOS
// ═══════════════════════════════════════════════════════════════

export type RegistroAire = typeof registrosAire.$inferSelect;
export type NuevoRegistroAire = typeof registrosAire.$inferInsert;
export type ClipEvidencia = typeof clipsEvidencia.$inferSelect;
export type NuevoClipEvidencia = typeof clipsEvidencia.$inferInsert;
export type AccesoLinkTemporal = typeof accesosLinkTemporal.$inferSelect;
export type NuevoAccesoLinkTemporal = typeof accesosLinkTemporal.$inferInsert;

export type Tanda = typeof tandas.$inferSelect;
export type SpotTanda = typeof spotsTanda.$inferSelect;
export type Conciliacion = typeof conciliacion.$inferSelect;
export type RegistroDeteccion = typeof registroDeteccion.$inferSelect;
export type EstadoTanda =
  | "planificada"
  | "en_revision"
  | "aprobada"
  | "exportada"
  | "emitida"
  | "verificada";
export type EstadoSpotPauta =
  | "programado"
  | "emitido"
  | "confirmado"
  | "no_emitido"
  | "reagendado";

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

export interface TandaDTO {
  id: string;
  codigo: string;
  emisoraNombre: string;
  fecha: Date;
  horaInicio: string;
  duracionMaxima: number;
  duracionProgramada: number;
  spotsMaximos: number;
  spotsProgramados: number;
  estado: EstadoTanda;
}

export interface ConciliacionResumenDTO {
  fecha: Date;
  emisorasCount: number;
  spotsProgramados: number;
  spotsEmitidos: number;
  spotsConfirmados: number;
  porcentajeCumplimiento: number;
}
