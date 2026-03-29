/**
 * 🗄️ SILEXAR PULSE - Digital Assets Database Schema TIER 0
 * 
 * Schema de base de datos para activos publicitarios digitales
 * con segmentación avanzada y tracking
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { pgTable, uuid, varchar, text, integer, boolean, timestamp, index, pgEnum, jsonb, decimal, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { tenants, users } from './users-schema';
import { anunciantes } from './anunciantes-schema';
import { campanas } from './campanas-schema';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const tipoActivoDigitalEnum = pgEnum('tipo_activo_digital', [
  // Audio
  'audio_spot', 'audio_mencion', 'audio_jingle', 'audio_podcast',
  // Visual
  'banner_display', 'banner_html5', 'banner_responsive',
  'video_preroll', 'video_midroll', 'video_bumper', 'video_outstream', 'video_vertical',
  // Social
  'native_ad', 'story_ad', 'reel_ad', 'carousel',
  // Interactive
  'interstitial', 'playable_ad', 'lead_form', 'ar_ad',
  // DOOH
  'dooh_pantalla', 'dooh_totem'
]);

export const estadoActivoDigitalEnum = pgEnum('estado_activo_digital', [
  'borrador', 'pendiente_revision', 'en_revision', 'rechazado',
  'aprobado', 'programado', 'activo', 'pausado', 'completado', 'archivado'
]);

export const plataformaDestinoEnum = pgEnum('plataforma_destino', [
  'google_dv360', 'google_ads', 'meta_ads', 'tiktok_ads', 'linkedin_ads',
  'twitter_ads', 'amazon_dsp', 'the_trade_desk', 'spotify', 'deezer',
  'soundcloud', 'podcast_networks', 'clear_channel', 'jcdecaux',
  'radio_tradicional', 'radio_streaming', 'sitio_propio', 'app_propia'
]);

export const formatoVisualEnum = pgEnum('formato_visual', [
  '300x250', '728x90', '160x600', '320x50', '320x100', '300x600',
  '970x250', '336x280', '1920x1080', '1080x1920', '1080x1080',
  '1200x628', '1200x627', 'responsive', 'custom'
]);

export const tipoEstrategiaPujaEnum = pgEnum('tipo_estrategia_puja', [
  'cpm', 'cpc', 'cpa', 'cpv', 'auto', 'target_roas', 'maximize_conversions'
]);

// ═══════════════════════════════════════════════════════════════
// TABLA PRINCIPAL: ACTIVOS DIGITALES
// ═══════════════════════════════════════════════════════════════

export const activosDigitales = pgTable('activos_digitales', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  
  // Identificación
  codigo: varchar('codigo', { length: 20 }).notNull().unique(), // ADX000000
  nombre: varchar('nombre', { length: 255 }).notNull(),
  descripcion: text('descripcion'),
  tipo: tipoActivoDigitalEnum('tipo').notNull(),
  estado: estadoActivoDigitalEnum('estado').default('borrador').notNull(),
  
  // Relaciones
  anuncianteId: uuid('anunciante_id').references(() => anunciantes.id).notNull(),
  campanaId: uuid('campana_id').references(() => campanas.id),
  grupoActivosId: uuid('grupo_activos_id'),
  
  // Plataformas destino (array)
  plataformas: jsonb('plataformas').$type<string[]>().default([]),
  configuracionPlataformas: jsonb('configuracion_plataformas'),
  
  // Presupuesto
  presupuestoTipo: varchar('presupuesto_tipo', { length: 20 }), // diario, total, ilimitado
  presupuestoMonto: decimal('presupuesto_monto', { precision: 15, scale: 2 }),
  presupuestoMoneda: varchar('presupuesto_moneda', { length: 3 }).default('CLP'),
  presupuestoGastado: decimal('presupuesto_gastado', { precision: 15, scale: 2 }).default('0'),
  
  // Estrategia de puja
  estrategiaPuja: tipoEstrategiaPujaEnum('estrategia_puja'),
  pujaMaxima: decimal('puja_maxima', { precision: 10, scale: 4 }),
  objetivoOptimizacion: varchar('objetivo_optimizacion', { length: 100 }),
  
  // Programación
  fechaInicio: timestamp('fecha_inicio').notNull(),
  fechaFin: timestamp('fecha_fin').notNull(),
  timezone: varchar('timezone', { length: 50 }).default('America/Santiago'),
  programacionHoraria: jsonb('programacion_horaria'),
  
  // Métricas agregadas
  impresiones: integer('impresiones').default(0),
  clics: integer('clics').default(0),
  ctr: real('ctr').default(0),
  conversiones: integer('conversiones').default(0),
  costoTotal: decimal('costo_total', { precision: 15, scale: 2 }).default('0'),
  cpm: real('cpm').default(0),
  cpc: real('cpc').default(0),
  cpa: real('cpa').default(0),
  roas: real('roas').default(0),
  viewability: real('viewability').default(0),
  videoCompletions: integer('video_completions').default(0),
  vtr: real('vtr').default(0),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion'),
  version: integer('version').default(1),
  eliminado: boolean('eliminado').default(false),
  fechaEliminacion: timestamp('fecha_eliminacion')
}, (table) => ({
  codigoIdx: index('activos_digitales_codigo_idx').on(table.codigo),
  tenantIdx: index('activos_digitales_tenant_idx').on(table.tenantId),
  estadoIdx: index('activos_digitales_estado_idx').on(table.estado),
  tipoIdx: index('activos_digitales_tipo_idx').on(table.tipo),
  anuncianteIdx: index('activos_digitales_anunciante_idx').on(table.anuncianteId),
  campanaIdx: index('activos_digitales_campana_idx').on(table.campanaId),
  fechasIdx: index('activos_digitales_fechas_idx').on(table.fechaInicio, table.fechaFin)
}));

// ═══════════════════════════════════════════════════════════════
// CREATIVIDADES
// ═══════════════════════════════════════════════════════════════

export const creatividadesActivo = pgTable('creatividades_activo', {
  id: uuid('id').primaryKey().defaultRandom(),
  activoId: uuid('activo_id').references(() => activosDigitales.id, { onDelete: 'cascade' }).notNull(),
  
  nombre: varchar('nombre', { length: 255 }).notNull(),
  formato: formatoVisualEnum('formato').notNull(),
  
  // Archivos
  urlPrincipal: text('url_principal').notNull(),
  urlFallback: text('url_fallback'),
  urlsPorFormato: jsonb('urls_por_formato').$type<Record<string, string>>().default({}),
  
  // Metadatos
  pesoBytes: integer('peso_bytes'),
  duracionSegundos: real('duracion_segundos'),
  width: integer('width'),
  height: integer('height'),
  mimeType: varchar('mime_type', { length: 100 }),
  
  // Textos
  titulo: varchar('titulo', { length: 255 }),
  descripcion: text('descripcion'),
  ctaTexto: varchar('cta_texto', { length: 50 }),
  textoLegal: text('texto_legal'),
  
  // Aprobación por plataforma
  aprobacionPlataformas: jsonb('aprobacion_plataformas').$type<Record<string, boolean>>().default({}),
  motivosRechazo: jsonb('motivos_rechazo').$type<Record<string, string>>().default({}),
  
  esActiva: boolean('es_activa').default(true),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull()
}, (table) => ({
  activoIdx: index('creatividades_activo_idx').on(table.activoId)
}));

// ═══════════════════════════════════════════════════════════════
// SEGMENTACIÓN DEMOGRÁFICA
// ═══════════════════════════════════════════════════════════════

export const segmentacionDemografica = pgTable('segmentacion_demografica', {
  id: uuid('id').primaryKey().defaultRandom(),
  activoId: uuid('activo_id').references(() => activosDigitales.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Edad
  edadRangos: jsonb('edad_rangos').$type<string[]>().default([]), // ['18-24', '25-34']
  edadMinima: integer('edad_minima'),
  edadMaxima: integer('edad_maxima'),
  
  // Género
  generos: jsonb('generos').$type<string[]>().default([]), // masculino, femenino, no_binario
  
  // Estado civil
  estadoCivil: jsonb('estado_civil').$type<string[]>().default([]),
  
  // Educación
  nivelEducativo: jsonb('nivel_educativo').$type<string[]>().default([]),
  
  // NSE
  nivelSocioeconomico: jsonb('nivel_socioeconomico').$type<string[]>().default([]), // ABC1, C2, C3, D, E
  
  // Ocupación
  ocupaciones: jsonb('ocupaciones').$type<string[]>().default([]),
  
  // Ingresos
  ingresoMinimo: decimal('ingreso_minimo', { precision: 15, scale: 2 }),
  ingresoMaximo: decimal('ingreso_maximo', { precision: 15, scale: 2 }),
  ingresoMoneda: varchar('ingreso_moneda', { length: 3 }),
  
  // Idiomas
  idiomas: jsonb('idiomas').$type<string[]>().default([]),
  
  // Familia
  tieneHijos: boolean('tiene_hijos'),
  edadesHijos: jsonb('edades_hijos').$type<string[]>().default([]),
  
  fechaModificacion: timestamp('fecha_modificacion').defaultNow()
}, (table) => ({
  activoIdx: index('seg_demografica_activo_idx').on(table.activoId)
}));

// ═══════════════════════════════════════════════════════════════
// SEGMENTACIÓN GEOGRÁFICA
// ═══════════════════════════════════════════════════════════════

export const segmentacionGeografica = pgTable('segmentacion_geografica', {
  id: uuid('id').primaryKey().defaultRandom(),
  activoId: uuid('activo_id').references(() => activosDigitales.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Ubicaciones
  paises: jsonb('paises').$type<string[]>().default([]),
  regiones: jsonb('regiones').$type<string[]>().default([]),
  ciudades: jsonb('ciudades').$type<string[]>().default([]),
  comunas: jsonb('comunas').$type<string[]>().default([]),
  codigosPostales: jsonb('codigos_postales').$type<string[]>().default([]),
  dmaRegions: jsonb('dma_regions').$type<string[]>().default([]),
  
  // Geopoints con radio
  geopoints: jsonb('geopoints').$type<{
    lat: number;
    lng: number;
    radioMetros: number;
    nombre: string;
  }[]>().default([]),
  
  // Zonas excluidas
  zonasExcluidas: jsonb('zonas_excluidas').$type<{
    lat: number;
    lng: number;
    radioMetros: number;
  }[]>().default([]),
  
  // POIs
  tiposPOI: jsonb('tipos_poi').$type<string[]>().default([]),
  poisEspecificos: jsonb('pois_especificos').$type<string[]>().default([]),
  
  fechaModificacion: timestamp('fecha_modificacion').defaultNow()
}, (table) => ({
  activoIdx: index('seg_geografica_activo_idx').on(table.activoId)
}));

// ═══════════════════════════════════════════════════════════════
// SEGMENTACIÓN POR DISPOSITIVO
// ═══════════════════════════════════════════════════════════════

export const segmentacionDispositivo = pgTable('segmentacion_dispositivo', {
  id: uuid('id').primaryKey().defaultRandom(),
  activoId: uuid('activo_id').references(() => activosDigitales.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Tipo de dispositivo
  tipos: jsonb('tipos').$type<string[]>().default([]), // desktop, mobile, tablet, smart_tv
  
  // Sistema operativo
  sistemasOperativos: jsonb('sistemas_operativos').$type<string[]>().default([]),
  versionesOS: jsonb('versiones_os').$type<{
    os: string;
    minVersion?: string;
    maxVersion?: string;
  }[]>().default([]),
  
  // Navegadores
  navegadores: jsonb('navegadores').$type<string[]>().default([]),
  
  // Marcas y modelos
  marcasDispositivo: jsonb('marcas_dispositivo').$type<string[]>().default([]),
  modelosEspecificos: jsonb('modelos_especificos').$type<string[]>().default([]),
  
  // Conexión
  tiposConexion: jsonb('tipos_conexion').$type<string[]>().default([]), // wifi, 5g, 4g
  carriers: jsonb('carriers').$type<string[]>().default([]), // Movistar, Entel, Claro
  
  // Pantalla
  resolucionesPantalla: jsonb('resoluciones_pantalla').$type<string[]>().default([]),
  
  fechaModificacion: timestamp('fecha_modificacion').defaultNow()
}, (table) => ({
  activoIdx: index('seg_dispositivo_activo_idx').on(table.activoId)
}));

// ═══════════════════════════════════════════════════════════════
// SEGMENTACIÓN CONDUCTUAL
// ═══════════════════════════════════════════════════════════════

export const segmentacionConductual = pgTable('segmentacion_conductual', {
  id: uuid('id').primaryKey().defaultRandom(),
  activoId: uuid('activo_id').references(() => activosDigitales.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Intereses
  intereses: jsonb('intereses').$type<string[]>().default([]),
  categoriasIAB: jsonb('categorias_iab').$type<string[]>().default([]),
  afinidades: jsonb('afinidades').$type<string[]>().default([]),
  
  // Intención
  intencionCompra: jsonb('intencion_compra').$type<string[]>().default([]),
  eventosVida: jsonb('eventos_vida').$type<string[]>().default([]),
  
  // Comportamiento de compra
  historialCompras: jsonb('historial_compras').$type<string[]>().default([]),
  valorCarritoMin: decimal('valor_carrito_min', { precision: 15, scale: 2 }),
  valorCarritoMax: decimal('valor_carrito_max', { precision: 15, scale: 2 }),
  frecuenciaCompra: varchar('frecuencia_compra', { length: 50 }),
  
  // Relación marca
  relacionMarca: varchar('relacion_marca', { length: 50 }),
  incluirClientesActuales: boolean('incluir_clientes_actuales'),
  audienciasRetargeting: jsonb('audiencias_retargeting').$type<string[]>().default([]),
  
  // Lookalike
  audienciasLookalike: jsonb('audiencias_lookalike').$type<{
    audienciaBase: string;
    porcentajeSimilitud: number;
    tamanioEstimado: number;
  }[]>().default([]),
  
  // Custom
  listasCRM: jsonb('listas_crm').$type<string[]>().default([]),
  pixelAudiences: jsonb('pixel_audiences').$type<string[]>().default([]),
  
  fechaModificacion: timestamp('fecha_modificacion').defaultNow()
}, (table) => ({
  activoIdx: index('seg_conductual_activo_idx').on(table.activoId)
}));

// ═══════════════════════════════════════════════════════════════
// SEGMENTACIÓN CONTEXTUAL
// ═══════════════════════════════════════════════════════════════

export const segmentacionContextual = pgTable('segmentacion_contextual', {
  id: uuid('id').primaryKey().defaultRandom(),
  activoId: uuid('activo_id').references(() => activosDigitales.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Temporal
  horasDelDia: jsonb('horas_del_dia').$type<number[]>().default([]), // 0-23
  diasSemana: jsonb('dias_semana').$type<number[]>().default([]), // 0-6
  mesesActivos: jsonb('meses_activos').$type<number[]>().default([]), // 1-12
  fechasEspecificas: jsonb('fechas_especificas').$type<string[]>().default([]),
  
  // Clima
  condicionesClima: jsonb('condiciones_clima').$type<string[]>().default([]),
  temperaturaMin: integer('temperatura_min'),
  temperaturaMax: integer('temperatura_max'),
  
  // Actividad usuario
  actividadDetectada: jsonb('actividad_detectada').$type<string[]>().default([]),
  velocidadMovimiento: jsonb('velocidad_movimiento').$type<string[]>().default([]),
  ubicacionTipo: jsonb('ubicacion_tipo').$type<string[]>().default([]), // en_casa, trabajo, transito
  
  // Contenido
  categoriasContenido: jsonb('categorias_contenido').$type<string[]>().default([]),
  keywordsContextuales: jsonb('keywords_contextuales').$type<string[]>().default([]),
  sentimientoContenido: jsonb('sentimiento_contenido').$type<string[]>().default([]),
  brandSafetyLevel: varchar('brand_safety_level', { length: 20 }), // floor, standard, strict
  
  // Eventos
  eventosActuales: jsonb('eventos_actuales').$type<string[]>().default([]),
  temporadas: jsonb('temporadas').$type<string[]>().default([]),
  
  fechaModificacion: timestamp('fecha_modificacion').defaultNow()
}, (table) => ({
  activoIdx: index('seg_contextual_activo_idx').on(table.activoId)
}));

// ═══════════════════════════════════════════════════════════════
// SEGMENTACIÓN GEOFENCING
// ═══════════════════════════════════════════════════════════════

export const segmentacionGeofencing = pgTable('segmentacion_geofencing', {
  id: uuid('id').primaryKey().defaultRandom(),
  activoId: uuid('activo_id').references(() => activosDigitales.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Geofences
  geofences: jsonb('geofences').$type<{
    id: string;
    nombre: string;
    tipo: 'circulo' | 'poligono';
    coordenadas: { lat: number; lng: number }[];
    radioMetros?: number;
    triggerEntrada: boolean;
    triggerSalida: boolean;
    triggerPermanencia: boolean;
    tiempoPermanenciaMinutos?: number;
  }[]>().default([]),
  
  // Conquesting
  zonasCompetidores: jsonb('zonas_competidores').$type<{
    competidor: string;
    radioMetros: number;
    mostrarOferta: boolean;
  }[]>().default([]),
  
  // Retargeting ubicación
  visitasAnteriores: jsonb('visitas_anteriores').$type<{
    ubicacion: string;
    diasDesdeVisita: number;
    frecuenciaMinima: number;
  }[]>().default([]),
  
  fechaModificacion: timestamp('fecha_modificacion').defaultNow()
}, (table) => ({
  activoIdx: index('seg_geofencing_activo_idx').on(table.activoId)
}));

// ═══════════════════════════════════════════════════════════════
// TRACKING Y CONVERSIONES
// ═══════════════════════════════════════════════════════════════

export const trackingActivo = pgTable('tracking_activo', {
  id: uuid('id').primaryKey().defaultRandom(),
  activoId: uuid('activo_id').references(() => activosDigitales.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // URLs
  urlDestino: text('url_destino').notNull(),
  urlDestinoMovil: text('url_destino_movil'),
  urlDestinoDesktop: text('url_destino_desktop'),
  
  // UTM
  utmSource: varchar('utm_source', { length: 100 }),
  utmMedium: varchar('utm_medium', { length: 100 }),
  utmCampaign: varchar('utm_campaign', { length: 100 }),
  utmContent: varchar('utm_content', { length: 100 }),
  utmTerm: varchar('utm_term', { length: 100 }),
  
  // Custom params
  parametrosCustom: jsonb('parametros_custom').$type<Record<string, string>>().default({}),
  
  // Short link
  shortLinkActivo: boolean('short_link_activo').default(false),
  shortLinkUrl: varchar('short_link_url', { length: 100 }),
  shortLinkCodigo: varchar('short_link_codigo', { length: 20 }),
  
  // Pixels
  pixelFacebook: varchar('pixel_facebook', { length: 50 }),
  pixelGoogle: varchar('pixel_google', { length: 50 }),
  pixelTikTok: varchar('pixel_tiktok', { length: 50 }),
  pixelLinkedIn: varchar('pixel_linkedin', { length: 50 }),
  pixelsCustom: jsonb('pixels_custom').$type<string[]>().default([]),
  
  // Server-side
  serverSideTracking: boolean('server_side_tracking').default(false),
  postbackUrl: text('postback_url'),
  
  // Eventos conversión
  eventosConversion: jsonb('eventos_conversion').$type<{
    nombre: string;
    tipo: string;
    valor?: number;
    moneda?: string;
  }[]>().default([]),
  
  fechaModificacion: timestamp('fecha_modificacion').defaultNow()
}, (table) => ({
  activoIdx: index('tracking_activo_idx').on(table.activoId),
  shortLinkIdx: index('tracking_shortlink_idx').on(table.shortLinkCodigo)
}));

// ═══════════════════════════════════════════════════════════════
// MÉTRICAS HISTÓRICAS
// ═══════════════════════════════════════════════════════════════

export const metricasActivoHistorico = pgTable('metricas_activo_historico', {
  id: uuid('id').primaryKey().defaultRandom(),
  activoId: uuid('activo_id').references(() => activosDigitales.id, { onDelete: 'cascade' }).notNull(),
  
  fecha: timestamp('fecha').notNull(),
  hora: integer('hora'), // 0-23, null si es agregado diario
  
  // Métricas
  impresiones: integer('impresiones').default(0),
  clics: integer('clics').default(0),
  conversiones: integer('conversiones').default(0),
  costo: decimal('costo', { precision: 15, scale: 4 }).default('0'),
  
  // Video
  videoStarts: integer('video_starts').default(0),
  video25: integer('video_25').default(0),
  video50: integer('video_50').default(0),
  video75: integer('video_75').default(0),
  video100: integer('video_100').default(0),
  
  // Engagement
  likes: integer('likes').default(0),
  shares: integer('shares').default(0),
  comments: integer('comments').default(0),
  saves: integer('saves').default(0),
  
  // Breakdown
  plataforma: varchar('plataforma', { length: 50 }),
  dispositivo: varchar('dispositivo', { length: 30 }),
  pais: varchar('pais', { length: 50 }),
  region: varchar('region', { length: 100 }),
  
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull()
}, (table) => ({
  activoIdx: index('metricas_historico_activo_idx').on(table.activoId),
  fechaIdx: index('metricas_historico_fecha_idx').on(table.fecha),
  comboIdx: index('metricas_historico_combo_idx').on(table.activoId, table.fecha)
}));

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const activosDigitalesRelations = relations(activosDigitales, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [activosDigitales.tenantId],
    references: [tenants.id]
  }),
  anunciante: one(anunciantes, {
    fields: [activosDigitales.anuncianteId],
    references: [anunciantes.id]
  }),
  campana: one(campanas, {
    fields: [activosDigitales.campanaId],
    references: [campanas.id]
  }),
  creatividades: many(creatividadesActivo),
  segDemografica: one(segmentacionDemografica),
  segGeografica: one(segmentacionGeografica),
  segDispositivo: one(segmentacionDispositivo),
  segConductual: one(segmentacionConductual),
  segContextual: one(segmentacionContextual),
  segGeofencing: one(segmentacionGeofencing),
  tracking: one(trackingActivo),
  metricasHistoricas: many(metricasActivoHistorico)
}));

export const creatividadesRelations = relations(creatividadesActivo, ({ one }) => ({
  activo: one(activosDigitales, {
    fields: [creatividadesActivo.activoId],
    references: [activosDigitales.id]
  })
}));
