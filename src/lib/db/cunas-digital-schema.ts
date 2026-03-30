/**
 * 🧬 SILEXAR PULSE - CUÑAS DIGITAL TIER X SCHEMA
 * 
 * Schema de base de datos para el sistema "Quantum Generative Neural-Interface"
 * Soporta: Digital Assets, Deep Device Intelligence, Neuromorphic Resonance
 * 
 * @version 2050.X.0
 * @tier TIER_X_SINGULARITY
 */

import { pgTable, uuid, varchar, text, integer, boolean, timestamp, index, pgEnum, jsonb, decimal, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants, users } from './users-schema';
import { cunas } from './cunas-schema';
import { campanas } from './campanas-schema';

// ═══════════════════════════════════════════════════════════════
// ENUMS - TIER X DIGITAL
// ═══════════════════════════════════════════════════════════════

export const tipoAssetDigitalEnum = pgEnum('tipo_asset_digital', [
  'VIDEO_HORIZONTAL',    // 16:9 Pre-roll/YouTube
  'VIDEO_VERTICAL',      // 9:16 Stories/Reels/TikTok
  'VIDEO_SQUARE',        // 1:1 Feed
  'BANNER_STATIC',       // JPG/PNG
  'BANNER_ANIMATED',     // GIF/APNG
  'BANNER_HTML5',        // Interactive HTML5
  'AUDIO_STREAMING',     // Podcast/Spotify
  'AUDIO_3D_SPATIAL',    // Dolby Atmos/Spatial Audio
  'COMPANION_DISPLAY',   // Synced with audio
  'AR_EXPERIENCE',       // WebXR 3D
  'STORY_CAROUSEL'       // Multi-slide
]);

export const formatoAssetDigitalEnum = pgEnum('formato_asset_digital', [
  'MP4', 'WEBM', 'MOV', 'HLS',           // Video
  'JPG', 'PNG', 'WEBP', 'AVIF', 'GIF',   // Image
  'HTML5', 'VAST', 'VPAID',              // Interactive
  'MP3', 'AAC', 'OPUS', 'DOLBY_ATMOS',   // Audio
  'GLB', 'GLTF', 'USDZ'                  // 3D/AR
]);

export const modoOperacionCunaEnum = pgEnum('modo_operacion_cuna', [
  'FM_ONLY',       // Solo radiodifusión tradicional
  'DIGITAL_ONLY',  // Solo canales digitales
  'HYBRID'         // Omnicanal FM + Digital
]);

export const tipoDispositivoEnum = pgEnum('tipo_dispositivo', [
  'MOBILE_IOS',
  'MOBILE_ANDROID',
  'TABLET_IOS',
  'TABLET_ANDROID',
  'DESKTOP_WINDOWS',
  'DESKTOP_MAC',
  'DESKTOP_LINUX',
  'SMART_TV',
  'CAR_PLAY',
  'ANDROID_AUTO',
  'SMART_SPEAKER',
  'SMART_WATCH',
  'VR_HEADSET',
  'AR_GLASSES'
]);

export const estadoAnimoEnum = pgEnum('estado_animo', [
  'HIGH_ENERGY',
  'FOCUS',
  'PARTY',
  'CHILL',
  'WORKOUT',
  'ROMANTIC',
  'MELANCHOLIC',
  'AMBIENT',
  'DRIVING',
  'SLEEPING'
]);

export const tipoConexionEnum = pgEnum('tipo_conexion', [
  'WIFI_6', 'WIFI_5', 'WIFI_4',
  '5G', '4G_LTE', '4G', '3G',
  'ETHERNET', 'SATELLITE',
  'OFFLINE'
]);

export const estadoMovimientoEnum = pgEnum('estado_movimiento', [
  'STATIONARY',
  'WALKING',
  'RUNNING',
  'CYCLING',
  'DRIVING',
  'PUBLIC_TRANSPORT',
  'FLYING'
]);

export const cargaCognitivaEnum = pgEnum('carga_cognitiva', [
  'VERY_LOW',   // Usuario muy relajado
  'LOW',        // Scroll lento, lectura
  'MEDIUM',     // Navegación normal
  'HIGH',       // Scroll rápido, búsqueda
  'VERY_HIGH'   // Ansiedad, multitasking
]);

// ═══════════════════════════════════════════════════════════════
// TABLA: DIGITAL ASSETS (Activos Digitales Polimórficos)
// ═══════════════════════════════════════════════════════════════

export const digitalAssets = pgTable('digital_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  cunaId: uuid('cuna_id').references(() => cunas.id, { onDelete: 'cascade' }).notNull(),
  
  // Identificación
  codigo: varchar('codigo', { length: 50 }).notNull(), // DA-2026-0001
  nombre: varchar('nombre', { length: 255 }).notNull(),
  
  // Tipo y Formato
  tipoAsset: tipoAssetDigitalEnum('tipo_asset').notNull(),
  formato: formatoAssetDigitalEnum('formato').notNull(),
  
  // Archivo
  urlOriginal: text('url_original').notNull(),
  urlOptimizada: text('url_optimizada'),
  urlThumbnail: text('url_thumbnail'),
  
  // Dimensiones
  anchoPixeles: integer('ancho_pixeles'),
  altoPixeles: integer('alto_pixeles'),
  aspectRatio: varchar('aspect_ratio', { length: 20 }), // "16:9", "9:16", "1:1"
  
  // Métricas técnicas
  duracionSegundos: real('duracion_segundos'),
  duracionMilisegundos: integer('duracion_milisegundos'),
  pesoBytes: integer('peso_bytes').notNull(),
  bitrate: integer('bitrate'), // Kbps
  fps: real('fps'),
  
  // Calidad y validación
  calidadScore: integer('calidad_score'), // 0-100
  validacionTecnica: jsonb('validacion_tecnica').$type<{
    resolucionAdecuada: boolean;
    formatoCompatible: boolean;
    pesoOptimizado: boolean;
    colorSpaceCorrect: boolean;
    audioSyncValid: boolean;
    observaciones: string[];
  }>(),
  
  // Adaptaciones automáticas generadas por IA
  adaptacionesGeneradas: jsonb('adaptaciones_generadas').$type<{
    id: string;
    tipoAdaptacion: string;
    url: string;
    ancho: number;
    alto: number;
    generadoPorIA: boolean;
    fechaGeneracion: string;
  }[]>().default([]),
  
  // Análisis IA
  analisisIA: jsonb('analisis_ia').$type<{
    objetosDetectados: string[];
    coloresDominantes: string[];
    sentimientoDetectado: string;
    textoExtraido: string;
    marcasDetectadas: string[];
    scoreBrandSafety: number;
    sugerenciasOptimizacion: string[];
  }>(),
  
  // Estado
  estado: varchar('estado', { length: 50 }).default('pendiente_validacion').notNull(),
  activo: boolean('activo').default(true).notNull(),
  
  // Auditoría
  subidoPorId: uuid('subido_por_id').references(() => users.id).notNull(),
  fechaSubida: timestamp('fecha_subida').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion')
}, (table) => ({
  tenantIdx: index('digital_assets_tenant_idx').on(table.tenantId),
  cunaIdx: index('digital_assets_cuna_idx').on(table.cunaId),
  tipoIdx: index('digital_assets_tipo_idx').on(table.tipoAsset),
  estadoIdx: index('digital_assets_estado_idx').on(table.estado)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: AD TARGETING PROFILE (Deep Device Intelligence)
// ═══════════════════════════════════════════════════════════════

export const adTargetingProfiles = pgTable('ad_targeting_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  cunaId: uuid('cuna_id').references(() => cunas.id, { onDelete: 'cascade' }).notNull(),
  campanaId: uuid('campana_id').references(() => campanas.id, { onDelete: 'cascade' }), // Conexión con Campañas
  
  nombre: varchar('nombre', { length: 255 }).notNull(),
  descripcion: text('descripcion'),
  
  // ─── SEGMENTACIÓN DEMOGRÁFICA ───
  edadMinima: integer('edad_minima'),
  edadMaxima: integer('edad_maxima'),
  generos: jsonb('generos').$type<string[]>().default(['M', 'F', 'X']),
  
  // ─── SEGMENTACIÓN POR DISPOSITIVO ───
  dispositivos: jsonb('dispositivos').$type<string[]>().default([]),
  sistemasOperativos: jsonb('sistemas_operativos').$type<string[]>().default([]),
  navegadores: jsonb('navegadores').$type<string[]>().default([]),
  
  // ─── DEEP DEVICE INTELLIGENCE ───
  // Nivel de batería
  bateriaMinima: integer('bateria_minima'), // % mínimo requerido
  bateriaOptima: integer('bateria_optima'), // % para contenido pesado
  
  // Conexión de red
  tiposConexion: jsonb('tipos_conexion').$type<string[]>().default([]),
  velocidadMinimaMbps: real('velocidad_minima_mbps'),
  
  // Estado de movimiento
  estadosMovimiento: jsonb('estados_movimiento').$type<string[]>().default([]),
  velocidadMaximaKmh: real('velocidad_maxima_kmh'), // Seguridad conducción
  
  // Preferencias de pantalla
  modosPantalla: jsonb('modos_pantalla').$type<('DARK' | 'LIGHT' | 'ANY')[]>().default(['ANY']),
  orientaciones: jsonb('orientaciones').$type<('PORTRAIT' | 'LANDSCAPE' | 'ANY')[]>().default(['ANY']),
  
  // ─── TARGETING CONTEXTUAL ───
  estadosAnimo: jsonb('estados_animo').$type<string[]>().default([]),
  horasActivas: jsonb('horas_activas').$type<{ inicio: string; fin: string }[]>().default([]),
  diasSemana: jsonb('dias_semana').$type<number[]>().default([0, 1, 2, 3, 4, 5, 6]),
  
  // ─── GEO-FENCING ───
  geoFences: jsonb('geo_fences').$type<{
    id: string;
    nombre: string;
    latitud: number;
    longitud: number;
    radioKm: number;
    tipo: 'INCLUDE' | 'EXCLUDE';
  }[]>().default([]),
  paises: jsonb('paises').$type<string[]>().default([]),
  regiones: jsonb('regiones').$type<string[]>().default([]),
  ciudades: jsonb('ciudades').$type<string[]>().default([]),
  
  // ─── WEATHER TARGETING ───
  condicionesClima: jsonb('condiciones_clima').$type<string[]>().default([]), // SUNNY, RAIN, SNOW, etc.
  temperaturaMinima: real('temperatura_minima'),
  temperaturaMaxima: real('temperatura_maxima'),
  
  // ─── REGLAS DE EXCLUSIÓN ───
  reglasExclusion: jsonb('reglas_exclusion').$type<{
    tipo: string;
    valor: string;
    motivo: string;
  }[]>().default([]),
  
  // Prioridad y peso
  prioridad: integer('prioridad').default(50), // 1-100
  pesoDistribucion: decimal('peso_distribucion', { precision: 5, scale: 2 }).default('1.00'),
  
  activo: boolean('activo').default(true).notNull(),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion')
}, (table) => ({
  tenantIdx: index('ad_targeting_tenant_idx').on(table.tenantId),
  cunaIdx: index('ad_targeting_cuna_idx').on(table.cunaId),
  activoIdx: index('ad_targeting_activo_idx').on(table.activo)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: DIGITAL TRACKER (Tracking & Attribution)
// ═══════════════════════════════════════════════════════════════

export const digitalTrackers = pgTable('digital_trackers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  cunaId: uuid('cuna_id').references(() => cunas.id, { onDelete: 'cascade' }).notNull(),
  
  // URLs de acción
  clickUrl: text('click_url'),
  clickUrlMobile: text('click_url_mobile'),
  clickUrlDesktop: text('click_url_desktop'),
  
  // Pixeles de tracking
  impressionPixels: jsonb('impression_pixels').$type<{
    id: string;
    nombre: string;
    url: string;
    tipo: 'IMPRESSION' | 'VIEWABILITY' | 'COMPLETION' | 'CLICK';
    activo: boolean;
  }[]>().default([]),
  
  // VAST/VPAID tags para video
  vastTag: text('vast_tag'),
  vpaidTag: text('vpaid_tag'),
  
  // UTM Parameters (Auto-generados)
  utmSource: varchar('utm_source', { length: 100 }),
  utmMedium: varchar('utm_medium', { length: 100 }),
  utmCampaign: varchar('utm_campaign', { length: 100 }),
  utmContent: varchar('utm_content', { length: 100 }),
  utmTerm: varchar('utm_term', { length: 100 }),
  
  // QR Code
  qrCodeUrl: text('qr_code_url'),
  qrCodeConfig: jsonb('qr_code_config').$type<{
    size: number;
    color: string;
    backgroundColor: string;
    logoUrl?: string;
    errorCorrection: 'L' | 'M' | 'Q' | 'H';
  }>(),
  
  // Deep Links
  universalLink: text('universal_link'),
  androidAppLink: text('android_app_link'),
  iosAppLink: text('ios_app_link'),
  
  // Voice Commands
  voiceCommands: jsonb('voice_commands').$type<{
    id: string;
    trigger: string;
    respuesta: string;
    accion: string;
    plataforma: 'ALEXA' | 'GOOGLE' | 'SIRI' | 'ALL';
  }[]>().default([]),
  
  // Webhooks de eventos
  webhooks: jsonb('webhooks').$type<{
    evento: string;
    url: string;
    headers: Record<string, string>;
    activo: boolean;
  }[]>().default([]),
  
  activo: boolean('activo').default(true).notNull(),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull()
}, (table) => ({
  tenantIdx: index('digital_trackers_tenant_idx').on(table.tenantId),
  cunaIdx: index('digital_trackers_cuna_idx').on(table.cunaId)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: BRAND DNA (ADN de Marca para Generación)
// ═══════════════════════════════════════════════════════════════

export const brandDNA = pgTable('brand_dna', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  cunaId: uuid('cuna_id').references(() => cunas.id, { onDelete: 'cascade' }).notNull(),
  
  // Identidad visual
  colorPrimario: varchar('color_primario', { length: 9 }), // #RRGGBBAA
  colorSecundario: varchar('color_secundario', { length: 9 }),
  colorAcento: varchar('color_acento', { length: 9 }),
  paletaCompleta: jsonb('paleta_completa').$type<string[]>().default([]),
  
  // Tipografía
  fuentePrincipal: varchar('fuente_principal', { length: 100 }),
  fuenteSecundaria: varchar('fuente_secundaria', { length: 100 }),
  
  // Logos y assets base
  logoUrl: text('logo_url'),
  logoMinimoUrl: text('logo_minimo_url'),
  productModel3DUrl: text('product_model_3d_url'), // Para AR
  fondosPreferidos: jsonb('fondos_preferidos').$type<string[]>().default([]),
  
  // Tono de voz
  tonoVoz: varchar('tono_voz', { length: 50 }), // EPICO, AMIGABLE, PROFESIONAL, etc.
  voiceCloneId: varchar('voice_clone_id', { length: 100 }), // ID de voz clonada
  voiceConfig: jsonb('voice_config').$type<{
    velocidad: number;
    tono: number;
    emocion: string;
    idioma: string;
  }>(),
  
  // Keywords y mensajes
  keywordsPrincipales: jsonb('keywords_principales').$type<string[]>().default([]),
  frasesProhibidas: jsonb('frases_prohibidas').$type<string[]>().default([]),
  callToActions: jsonb('call_to_actions').$type<string[]>().default([]),
  
  // Reglas de generación
  reglasGenerativas: jsonb('reglas_generativas').$type<{
    permitirVariaciones: boolean;
    maxDuracionSegundos: number;
    minDuracionSegundos: number;
    estilosPermitidos: string[];
    estilosProhibidos: string[];
    intensidadMaxima: number; // 1-10
  }>(),
  
  // Música y audio
  estilosMusicales: jsonb('estilos_musicales').$type<string[]>().default([]),
  bancoMusicaUrls: jsonb('banco_musica_urls').$type<string[]>().default([]),
  efectosSonidoUrls: jsonb('efectos_sonido_urls').$type<string[]>().default([]),
  
  activo: boolean('activo').default(true).notNull(),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion')
}, (table) => ({
  tenantIdx: index('brand_dna_tenant_idx').on(table.tenantId),
  cunaIdx: index('brand_dna_cuna_idx').on(table.cunaId)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: NEUROMORPHIC PROFILE (Sincronización Cognitiva)
// ═══════════════════════════════════════════════════════════════

export const neuromorphicProfiles = pgTable('neuromorphic_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  cunaId: uuid('cuna_id').references(() => cunas.id, { onDelete: 'cascade' }).notNull(),
  
  // Configuración de pacing adaptativo
  pacingConfig: jsonb('pacing_config').$type<{
    habilitado: boolean;
    ajusteVelocidadMax: number; // % máximo de ajuste (ej: 20%)
    ajusteTonoMax: number; // % máximo de ajuste
    suavizadoTransicion: boolean;
  }>(),
  
  // Mapeo de carga cognitiva a comportamiento
  mapeoCognitivo: jsonb('mapeo_cognitivo').$type<{
    cargaCognitiva: string;
    ajusteVelocidad: number;
    ajusteTono: number;
    complejidadMensaje: 'SIMPLE' | 'NORMAL' | 'DETALLADO';
    duracionOptima: number;
  }[]>().default([]),
  
  // Umbrales de detección
  umbralesScroll: jsonb('umbrales_scroll').$type<{
    velocidadBaja: number;   // px/seg
    velocidadMedia: number;
    velocidadAlta: number;
  }>(),
  
  // Adaptación de contenido
  adaptacionContenido: jsonb('adaptacion_contenido').$type<{
    usuarioRapido: {
      saltarIntro: boolean;
      mostrarCTAAntes: boolean;
      reducirDuracion: number; // segundos
    };
    usuarioLento: {
      extenderMensaje: boolean;
      agregarDetalles: boolean;
      musicaMasSubtle: boolean;
    };
  }>(),
  
  // Métricas de rendimiento
  metricas: jsonb('metricas').$type<{
    totalImpresiones: number;
    adaptacionesRealizadas: number;
    mejoraCTRPromedio: number;
    tiempoRetencionPromedio: number;
  }>(),
  
  activo: boolean('activo').default(true).notNull(),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull()
}, (table) => ({
  tenantIdx: index('neuromorphic_tenant_idx').on(table.tenantId),
  cunaIdx: index('neuromorphic_cuna_idx').on(table.cunaId)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: CROSS DEVICE SEQUENCE (Journey Mapping)
// ═══════════════════════════════════════════════════════════════

export const crossDeviceSequences = pgTable('cross_device_sequences', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  cunaId: uuid('cuna_id').references(() => cunas.id, { onDelete: 'cascade' }).notNull(),
  
  nombre: varchar('nombre', { length: 255 }).notNull(),
  descripcion: text('descripcion'),
  
  // Secuencia de pasos
  pasos: jsonb('pasos').$type<{
    orden: number;
    nombre: string;
    canal: 'AUDIO' | 'VIDEO' | 'DISPLAY' | 'SOCIAL' | 'PUSH';
    dispositivos: string[];
    assetId: string; // Referencia al digital_asset
    delayMinutos: number;
    condicionActivacion?: {
      tipo: string;
      valor: string;
    };
  }[]>().default([]),
  
  // Configuración de frecuencia
  frecuencia: jsonb('frecuencia').$type<{
    maxImpresionesUsuario: number;
    periodoHoras: number;
    respetarOptOut: boolean;
  }>(),
  
  // Métricas
  metricas: jsonb('metricas').$type<{
    usuariosAlcanzados: number;
    secuenciasCompletadas: number;
    conversionesAtribuidas: number;
    tiempoPromedioJourney: number;
  }>(),
  
  activo: boolean('activo').default(true).notNull(),
  
  // Fechas
  fechaInicio: timestamp('fecha_inicio'),
  fechaFin: timestamp('fecha_fin'),
  
  // Auditoría
  creadoPorId: uuid('creado_por_id').references(() => users.id).notNull(),
  fechaCreacion: timestamp('fecha_creacion').defaultNow().notNull(),
  modificadoPorId: uuid('modificado_por_id').references(() => users.id),
  fechaModificacion: timestamp('fecha_modificacion')
}, (table) => ({
  tenantIdx: index('cross_device_tenant_idx').on(table.tenantId),
  cunaIdx: index('cross_device_cuna_idx').on(table.cunaId),
  activoIdx: index('cross_device_activo_idx').on(table.activo)
}));

// ═══════════════════════════════════════════════════════════════
// TABLA: PERFORMANCE PREDICTIONS (Predicciones IA)
// ═══════════════════════════════════════════════════════════════

export const performancePredictions = pgTable('performance_predictions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  cunaId: uuid('cuna_id').references(() => cunas.id, { onDelete: 'cascade' }).notNull(),
  campanaId: uuid('campana_id').references(() => campanas.id, { onDelete: 'cascade' }), // Conexión con Campañas
  assetId: uuid('asset_id').references(() => digitalAssets.id),
  
  // Predicciones de rendimiento
  clickRatePredicho: decimal('click_rate_predicho', { precision: 5, scale: 2 }), // CTR %
  viewabilityPredicha: decimal('viewability_predicha', { precision: 5, scale: 2 }), // %
  completionRatePredicho: decimal('completion_rate_predicho', { precision: 5, scale: 2 }), // %
  
  // Scores de atención
  attentionRetainmentScore: decimal('attention_retainment_score', { precision: 5, scale: 2 }), // 0-10
  segundoCaidaAtencion: real('segundo_caida_atencion'), // En qué segundo cae la atención
  
  // Perfil emocional
  perfilEmocional: jsonb('perfil_emocional').$type<{
    energia: number;       // -1 a 1
    valencia: number;      // -1 a 1 (Negativo/Positivo)
    arousal: number;       // 0 a 1
    dominancia: number;    // 0 a 1
  }>(),
  
  // Sugerencias de optimización
  sugerencias: jsonb('sugerencias').$type<{
    id: string;
    tipo: 'CRITICA' | 'IMPORTANTE' | 'SUGERENCIA';
    categoria: string;
    mensaje: string;
    impactoEstimado: number; // % de mejora
    autoAplicable: boolean;
  }[]>().default([]),
  
  // Eye tracking simulado (para banners)
  eyeTrackingHeatmap: jsonb('eye_tracking_heatmap').$type<{
    zonas: { x: number; y: number; intensidad: number }[];
    logoVisible: boolean;
    ctaVisible: boolean;
  }>(),
  
  // Coherencia con campaña
  coherenciaMarca: decimal('coherencia_marca', { precision: 5, scale: 2 }),
  coherenciaMensaje: decimal('coherencia_mensaje', { precision: 5, scale: 2 }),
  
  fechaAnalisis: timestamp('fecha_analisis').defaultNow().notNull()
}, (table) => ({
  tenantIdx: index('performance_pred_tenant_idx').on(table.tenantId),
  cunaIdx: index('performance_pred_cuna_idx').on(table.cunaId),
  assetIdx: index('performance_pred_asset_idx').on(table.assetId)
}));

// ═══════════════════════════════════════════════════════════════
// RELACIONES
// ═══════════════════════════════════════════════════════════════

export const digitalAssetsRelations = relations(digitalAssets, ({ one }) => ({
  cuna: one(cunas, {
    fields: [digitalAssets.cunaId],
    references: [cunas.id]
  }),
  subidoPor: one(users, {
    fields: [digitalAssets.subidoPorId],
    references: [users.id]
  })
}));

export const adTargetingProfilesRelations = relations(adTargetingProfiles, ({ one }) => ({
  cuna: one(cunas, {
    fields: [adTargetingProfiles.cunaId],
    references: [cunas.id]
  }),
  campana: one(campanas, {
    fields: [adTargetingProfiles.campanaId],
    references: [campanas.id]
  }),
  creadoPor: one(users, {
    fields: [adTargetingProfiles.creadoPorId],
    references: [users.id]
  })
}));

export const digitalTrackersRelations = relations(digitalTrackers, ({ one }) => ({
  cuna: one(cunas, {
    fields: [digitalTrackers.cunaId],
    references: [cunas.id]
  }),
  creadoPor: one(users, {
    fields: [digitalTrackers.creadoPorId],
    references: [users.id]
  })
}));

export const brandDNARelations = relations(brandDNA, ({ one }) => ({
  cuna: one(cunas, {
    fields: [brandDNA.cunaId],
    references: [cunas.id]
  }),
  creadoPor: one(users, {
    fields: [brandDNA.creadoPorId],
    references: [users.id]
  })
}));

export const neuromorphicProfilesRelations = relations(neuromorphicProfiles, ({ one }) => ({
  cuna: one(cunas, {
    fields: [neuromorphicProfiles.cunaId],
    references: [cunas.id]
  }),
  creadoPor: one(users, {
    fields: [neuromorphicProfiles.creadoPorId],
    references: [users.id]
  })
}));

export const crossDeviceSequencesRelations = relations(crossDeviceSequences, ({ one }) => ({
  cuna: one(cunas, {
    fields: [crossDeviceSequences.cunaId],
    references: [cunas.id]
  }),
  creadoPor: one(users, {
    fields: [crossDeviceSequences.creadoPorId],
    references: [users.id]
  })
}));

export const performancePredictionsRelations = relations(performancePredictions, ({ one }) => ({
  cuna: one(cunas, {
    fields: [performancePredictions.cunaId],
    references: [cunas.id]
  }),
  campana: one(campanas, {
    fields: [performancePredictions.campanaId],
    references: [campanas.id]
  }),
  asset: one(digitalAssets, {
    fields: [performancePredictions.assetId],
    references: [digitalAssets.id]
  })
}));

// ═══════════════════════════════════════════════════════════════
// TIPOS EXPORTADOS
// ═══════════════════════════════════════════════════════════════

export type DigitalAsset = typeof digitalAssets.$inferSelect;
export type NewDigitalAsset = typeof digitalAssets.$inferInsert;

export type AdTargetingProfile = typeof adTargetingProfiles.$inferSelect;
export type NewAdTargetingProfile = typeof adTargetingProfiles.$inferInsert;

export type DigitalTracker = typeof digitalTrackers.$inferSelect;
export type NewDigitalTracker = typeof digitalTrackers.$inferInsert;

export type BrandDNA = typeof brandDNA.$inferSelect;
export type NewBrandDNA = typeof brandDNA.$inferInsert;

export type NeuromorphicProfile = typeof neuromorphicProfiles.$inferSelect;
export type NewNeuromorphicProfile = typeof neuromorphicProfiles.$inferInsert;

export type CrossDeviceSequence = typeof crossDeviceSequences.$inferSelect;
export type NewCrossDeviceSequence = typeof crossDeviceSequences.$inferInsert;

export type PerformancePrediction = typeof performancePredictions.$inferSelect;
export type NewPerformancePrediction = typeof performancePredictions.$inferInsert;
