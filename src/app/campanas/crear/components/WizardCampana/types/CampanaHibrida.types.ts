/**
 * 🌐 SILEXAR PULSE - Tipos para Sistema Híbrido FM + Digital 2050
 * 
 * @description Definiciones TypeScript completas para el sistema de
 * programación híbrida que soporta radio FM tradicional y publicidad
 * digital programática con targeting avanzado.
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// ENUMS Y TIPOS BASE
// ═══════════════════════════════════════════════════════════════

/** Medio de distribución */
export type MedioCampana = 'fm' | 'digital' | 'hibrido';

/** Tipos de contenido para radio FM */
export type TipoContenidoFM = 
  | 'cuna'      // Spot pregrabado
  | 'mencion'   // Texto para locutor en vivo
  | 'frase'     // Frase corta promocional
  | 'auspicio'; // Patrocinio de segmento/programa

/** Tipos de contenido para digital */
export type TipoContenidoDigital = 
  | 'banner'       // Imagen estática o animada
  | 'audio_ad'     // Audio para streaming
  | 'video_ad'     // Video corto
  | 'rich_media'   // HTML5 interactivo
  | 'native_ad';   // Anuncio nativo integrado

/** Tipo de contenido unificado */
export type TipoContenido = TipoContenidoFM | TipoContenidoDigital;

/** Formatos de banner estándar IAB */
export type FormatoBanner = 
  | '320x50'    // Mobile Leaderboard
  | '320x100'   // Large Mobile Banner
  | '300x250'   // Medium Rectangle
  | '336x280'   // Large Rectangle
  | '728x90'    // Leaderboard
  | '160x600'   // Wide Skyscraper
  | '300x600'   // Half Page
  | '970x90'    // Large Leaderboard
  | '970x250';  // Billboard

/** Estados posibles de un elemento */
export type EstadoElemento = 
  | 'borrador'     // Sin programar
  | 'programado'   // Listo para emitir
  | 'activo'       // Actualmente al aire
  | 'pausado'      // Temporalmente detenido
  | 'completado'   // Finalizado
  | 'rechazado'    // Rechazado por validación
  | 'bloqueado';   // Bloqueado por usuario

/** Prioridad de elemento */
export type PrioridadElemento = 'urgente' | 'alta' | 'normal' | 'baja';

// ═══════════════════════════════════════════════════════════════
// TARGETING DEMOGRÁFICO
// ═══════════════════════════════════════════════════════════════

export interface RangoEdad {
  id: string;
  label: string;
  min: number;
  max: number;
}

export const RANGOS_EDAD: RangoEdad[] = [
  { id: '13-17', label: '13-17 años', min: 13, max: 17 },
  { id: '18-24', label: '18-24 años', min: 18, max: 24 },
  { id: '25-34', label: '25-34 años', min: 25, max: 34 },
  { id: '35-44', label: '35-44 años', min: 35, max: 44 },
  { id: '45-54', label: '45-54 años', min: 45, max: 54 },
  { id: '55-64', label: '55-64 años', min: 55, max: 64 },
  { id: '65+', label: '65+ años', min: 65, max: 120 },
];

export const NIVELES_NSE = ['ABC1', 'C2', 'C3', 'D', 'E'] as const;
export type NivelNSE = typeof NIVELES_NSE[number];

export const GENEROS = ['M', 'F', 'O', 'todos'] as const;
export type Genero = typeof GENEROS[number];

export interface TargetingDemografico {
  edades: string[];           // IDs de rangos de edad
  generos: Genero[];          // M, F, O, todos
  nse: NivelNSE[];            // Niveles socioeconómicos
  intereses: string[];        // Tags de intereses
  idiomas: string[];          // Códigos ISO (es, en, pt)
  ocupaciones: string[];      // Profesiones/ocupaciones
}

// ═══════════════════════════════════════════════════════════════
// TARGETING GEOGRÁFICO
// ═══════════════════════════════════════════════════════════════

export interface Coordenadas {
  lat: number;
  lng: number;
}

export interface GeoFence {
  id: string;
  nombre: string;
  tipo: 'circulo' | 'poligono';
  centro?: Coordenadas;
  radioKm?: number;           // Para tipo circulo
  vertices?: Coordenadas[];   // Para tipo poligono
  activo: boolean;
}

export interface TargetingGeografico {
  paises: string[];           // Códigos ISO país (CL, AR, PE)
  regiones: string[];         // Regiones/Estados
  ciudades: string[];         // Ciudades
  codigosPostales: string[];  // Códigos postales específicos
  geofences: GeoFence[];      // Zonas de inclusión
  exclusiones: GeoFence[];    // Zonas de exclusión
  radioDefaultKm: number;     // Radio por defecto para geofences
  usarGPSPreciso: boolean;    // Usar GPS en vez de IP
}

// ═══════════════════════════════════════════════════════════════
// TARGETING CONTEXTUAL
// ═══════════════════════════════════════════════════════════════

export interface RangoHorario {
  inicio: string;  // HH:mm
  fin: string;     // HH:mm
}

export type DiaSemanaBit = 0 | 1 | 2 | 3 | 4 | 5 | 6; // DOM=0, SAB=6

export type TipoDispositivo = 'mobile' | 'tablet' | 'desktop' | 'smart_tv' | 'smart_speaker';
export type SistemaOperativo = 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'otros';
export type CondicionClima = 'soleado' | 'nublado' | 'lluvia' | 'nieve' | 'tormenta' | 'caluroso' | 'frio';

export interface TargetingContextual {
  horasPermitidas: RangoHorario[];
  diasSemana: DiaSemanaBit[];             // [1,2,3,4,5] = L-V
  dispositivos: TipoDispositivo[];
  sistemasOperativos: SistemaOperativo[];
  condicionesClima: CondicionClima[];
  rangoTemperatura?: {
    min: number;
    max: number;
    unidad: 'celsius' | 'fahrenheit';
  };
  conexion?: ('wifi' | 'celular' | 'ethernet')[];
  velocidadMinimaMbps?: number;
}

// ═══════════════════════════════════════════════════════════════
// TARGETING COMPORTAMENTAL (IA)
// ═══════════════════════════════════════════════════════════════

export interface TargetingComportamental {
  // Categorías de interés detectadas por IA
  categoriasInteres: string[];
  
  // Engagement mínimo requerido (0-100)
  engagementMinimo: number;
  
  // Detección de sensores
  vozActiva: boolean | null;        // null = no importa
  pantallaActiva: boolean | null;   // null = no importa
  
  // Comportamiento en app
  tiempoMinimoAppSegundos: number;
  scrollDepthMinimo: number;        // 0-100%
  
  // Predicciones IA
  intencionCompraMinima: number;    // 0-100
  momentoOptimoRequerido: boolean;
  
  // Frecuencia
  maxImpresionesUsuario: number;
  maxImpresionesUsuarioPorDia: number;
  separacionMinutosEntreImpresiones: number;
}

// ═══════════════════════════════════════════════════════════════
// TARGETING COMPLETO
// ═══════════════════════════════════════════════════════════════

export interface TargetingCompleto {
  demografico: TargetingDemografico;
  geografico: TargetingGeografico;
  contextual: TargetingContextual;
  comportamental: TargetingComportamental;
  
  // Modo de operación
  modoMatching: 'todos' | 'cualquiera';  // AND vs OR
  
  // Estimación de alcance
  alcanceEstimado?: {
    usuariosUnicos: number;
    impresionesEstimadas: number;
    porcentajePoblacion: number;
  };
}

// ═══════════════════════════════════════════════════════════════
// SISTEMA DE TRACKING
// ═══════════════════════════════════════════════════════════════

export interface ParametrosUTM {
  source: string;      // silexar_pulse
  medium: string;      // streaming_radio, banner, audio_ad
  campaign: string;    // nombre de campaña
  content?: string;    // identificador de creatividad
  term?: string;       // término de búsqueda (opcional)
}

export interface PixelTracking {
  id: string;
  plataforma: 'google_analytics' | 'meta_pixel' | 'google_ads' | 'tiktok' | 'linkedin' | 'custom';
  pixelId: string;
  eventos: string[];   // Eventos a trackear
  activo: boolean;
}

export interface ConfiguracionTracking {
  urlDestino: string;
  urlDestinoValidada: boolean;
  
  // UTM
  utm: ParametrosUTM;
  urlConUTM: string;
  urlAcortada?: string;
  
  // QR
  codigoQR?: string;      // Base64 del QR generado
  qrTamanoPx?: number;
  
  // Deep links
  deepLinkiOS?: string;
  deepLinkAndroid?: string;
  
  // Pixels
  pixels: PixelTracking[];
  
  // Pixel propio Silexar
  silexarPixelId: string;
  silexarPixelCode: string;
}

// ═══════════════════════════════════════════════════════════════
// CONTENIDO DE ELEMENTOS
// ═══════════════════════════════════════════════════════════════

/** Contenido para cuña (material de audio) */
export interface ContenidoCuna {
  tipo: 'cuna';
  materialId: string;
  materialCodigo: string;
  materialNombre: string;
  duracionSegundos: number;
  archivoUrl?: string;
}

/** Contenido para mención en vivo */
export interface ContenidoMencion {
  tipo: 'mencion';
  texto: string;
  palabras: number;
  tiempoEstimadoSegundos: number;
  variables: Record<string, string>;  // {{ANUNCIANTE}}: "Banco Chile"
  plantillaId?: string;
}

/** Contenido para frase */
export interface ContenidoFrase {
  tipo: 'frase';
  texto: string;
  duracionMaximaSegundos: number;
  locutor?: string;
}

/** Contenido para auspicio */
export interface ContenidoAuspicio {
  tipo: 'auspicio';
  programa: string;
  segmento: string;
  textoIntro?: string;
  textoSalida?: string;
  materiales: ContenidoCuna[];
}

/** Contenido para banner digital */
export interface ContenidoBanner {
  tipo: 'banner';
  formato: FormatoBanner;
  creativoUrl: string;
  creativoAltText: string;
  animado: boolean;
  tipoArchivo: 'jpg' | 'png' | 'gif' | 'webp' | 'html5';
  pesoBytesMax: number;
  clickUrl: string;
}

/** Contenido para audio ad digital */
export interface ContenidoAudioAd {
  tipo: 'audio_ad';
  archivoUrl: string;
  duracionSegundos: number;
  tipoArchivo: 'mp3' | 'aac' | 'wav';
  companionBanner?: ContenidoBanner;
  skippable: boolean;
  skipDespuesSegundos?: number;
}

/** Contenido para video ad */
export interface ContenidoVideoAd {
  tipo: 'video_ad';
  archivoUrl: string;
  duracionSegundos: number;
  tipoArchivo: 'mp4' | 'webm';
  resolucion: { width: number; height: number };
  skippable: boolean;
  skipDespuesSegundos?: number;
  vastUrl?: string;
}

/** Contenido para rich media */
export interface ContenidoRichMedia {
  tipo: 'rich_media';
  htmlUrl: string;
  fallbackImageUrl: string;
  interactivo: boolean;
  expandible: boolean;
  dimensionesExpandidas?: { width: number; height: number };
}

/** Unión de todos los tipos de contenido */
export type ContenidoElemento = 
  | ContenidoCuna 
  | ContenidoMencion 
  | ContenidoFrase 
  | ContenidoAuspicio
  | ContenidoBanner 
  | ContenidoAudioAd 
  | ContenidoVideoAd 
  | ContenidoRichMedia;

// ═══════════════════════════════════════════════════════════════
// HORARIO Y PROGRAMACIÓN
// ═══════════════════════════════════════════════════════════════

export interface DistribucionSemanal {
  lunes: number;
  martes: number;
  miercoles: number;
  jueves: number;
  viernes: number;
  sabado: number;
  domingo: number;
}

export interface HorarioElemento {
  fechaInicio: string;        // YYYY-MM-DD
  fechaFin: string;           // YYYY-MM-DD
  horaInicio: string;         // HH:mm
  horaFin: string;            // HH:mm
  distribucion: DistribucionSemanal;
  bonificadas?: DistribucionSemanal;
  posicionFija?: string;      // 'inicio', 'final', 'ninguno'
  bloqueTipo?: string;        // 'PRIME', 'AUSPICIO', 'ROTATIVO'
}

// ═══════════════════════════════════════════════════════════════
// ELEMENTO PROGRAMADO (ENTIDAD PRINCIPAL)
// ═══════════════════════════════════════════════════════════════

export interface ElementoProgramado {
  id: string;
  campanaId: string;
  lineaId?: string;           // Referencia a línea original
  
  // Clasificación
  medio: MedioCampana;
  tipo: TipoContenido;
  prioridad: PrioridadElemento;
  
  // Contenido
  contenido: ContenidoElemento;
  
  // Programación
  horario: HorarioElemento;
  
  // Targeting (solo digital)
  targeting?: TargetingCompleto;
  
  // Tracking (solo digital)
  tracking?: ConfiguracionTracking;
  
  // Estado
  estado: EstadoElemento;
  bloqueado: boolean;
  bloqueadoPor?: string;
  fechaBloqueo?: string;
  motivoBloqueo?: string;
  
  // Sincronización cross-media
  sincronizacionId?: string;
  elementosSincronizados?: string[];
  
  // Métricas en tiempo real
  metricas?: MetricasElemento;
  
  // Auditoría
  creadoPor: string;
  creadoEn: string;
  modificadoPor?: string;
  modificadoEn?: string;
  version: number;
}

// ═══════════════════════════════════════════════════════════════
// MÉTRICAS Y ANALYTICS
// ═══════════════════════════════════════════════════════════════

export interface MetricasElemento {
  impresiones: number;
  impresionesUnicas: number;
  clicks: number;
  ctr: number;                // Click-through rate
  conversiones: number;
  cvr: number;                // Conversion rate
  costoTotal: number;
  cpm: number;                // Costo por mil
  cpc: number;                // Costo por click
  roi: number;                // Return on investment
  tiempoExposicionPromedio: number;  // Segundos
  completionRate: number;     // Para video/audio
  engagementScore: number;    // 0-100 calculado por IA
  ultimaActualizacion: string;
}

// ═══════════════════════════════════════════════════════════════
// SINCRONIZACIÓN CROSS-MEDIA
// ═══════════════════════════════════════════════════════════════

export interface ConfiguracionSincronizacion {
  id: string;
  nombre: string;
  activa: boolean;
  
  // Trigger FM
  elementoFMId: string;
  
  // Acción Digital
  elementoDigitalId: string;
  
  // Timing
  delaySegundos: number;      // Delay después del trigger FM
  duracionSegundos: number;   // Duración de la sincronización
  
  // Targeting adicional
  soloOyentesStreaming: boolean;
  soloAppActiva: boolean;
  
  // Estimaciones
  oyentesFMEstimados: number;
  oyentesStreamingEstimados: number;
  impresionesCoordinadasEstimadas: number;
  amplificacionPorcentaje: number;
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATES Y PRESETS
// ═══════════════════════════════════════════════════════════════

export interface TemplateLinea {
  id: string;
  nombre: string;
  descripcion: string;
  medio: MedioCampana;
  tipo: TipoContenido;
  contenidoDefault: Partial<ContenidoElemento>;
  horarioDefault: Partial<HorarioElemento>;
  targetingDefault?: Partial<TargetingCompleto>;
  creadoPor: string;
  compartido: boolean;
  usos: number;
}

export interface PlantillaMencion {
  id: string;
  nombre: string;
  categoria: string;
  texto: string;
  variables: string[];        // Variables usadas {{VAR}}
  duracionEstimada: number;
  ejemplos: string[];
}

// ═══════════════════════════════════════════════════════════════
// HISTORIAL Y AUDITORÍA
// ═══════════════════════════════════════════════════════════════

export type TipoAccion = 
  | 'crear' 
  | 'editar' 
  | 'eliminar' 
  | 'bloquear' 
  | 'desbloquear'
  | 'mover'
  | 'duplicar'
  | 'pausar'
  | 'reactivar'
  | 'sincronizar';

export interface HistorialCambio {
  id: string;
  elementoId: string;
  accion: TipoAccion;
  usuarioId: string;
  usuarioNombre: string;
  timestamp: string;
  datosAntes?: Partial<ElementoProgramado>;
  datosDespues?: Partial<ElementoProgramado>;
  descripcion: string;
  reversible: boolean;
}

// ═══════════════════════════════════════════════════════════════
// FILTROS Y BÚSQUEDA
// ═══════════════════════════════════════════════════════════════

export interface FiltrosElementos {
  busqueda?: string;
  medios?: MedioCampana[];
  tipos?: TipoContenido[];
  estados?: EstadoElemento[];
  prioridades?: PrioridadElemento[];
  bloqueado?: boolean;
  fechaDesde?: string;
  fechaHasta?: string;
  creadoPor?: string;
}

// ═══════════════════════════════════════════════════════════════
// CONTEXTO DEL USUARIO (PARA TARGETING IA)
// ═══════════════════════════════════════════════════════════════

export interface ContextoUsuarioStreaming {
  sessionId: string;
  deviceFingerprint: string;
  
  // Geolocalización
  ubicacion: {
    pais: string;
    region: string;
    ciudad: string;
    coordenadas?: Coordenadas;
    precision: 'gps' | 'ip' | 'wifi' | 'celltower';
    zonaHoraria: string;
  };
  
  // Dispositivo
  dispositivo: {
    tipo: TipoDispositivo;
    os: string;
    osVersion: string;
    browser: string;
    browserVersion: string;
    screenSize: { width: number; height: number };
    idioma: string;
    conexion: 'wifi' | 'celular' | 'ethernet';
    velocidadMbps: number;
  };
  
  // Contexto temporal
  temporal: {
    fechaLocal: string;
    horaLocal: string;
    diaSemana: DiaSemanaBit;
    zonaHoraria: string;
    esFeriado: boolean;
  };
  
  // Contexto ambiental
  ambiental?: {
    clima: CondicionClima;
    temperatura: number;
    humedadPorcentaje: number;
    esDeNoche: boolean;
  };
  
  // Comportamiento
  comportamiento: {
    tiempoEnAppSegundos: number;
    scrollDepth: number;
    clicksRecientes: number;
    busquedasRecientes: string[];
    categoriasMasVisitadas: string[];
    ultimaCompra?: string;
    frecuenciaUso: 'nuevo' | 'ocasional' | 'regular' | 'power_user';
  };
  
  // Sensores (si disponibles)
  sensores?: {
    vozActiva: boolean;
    pantallaActiva: boolean;
    movimiento: 'quieto' | 'caminando' | 'corriendo' | 'vehiculo';
    nivelLuz: 'oscuro' | 'normal' | 'brillante';
    audiculares: boolean;
  };
  
  // Predicciones IA
  prediccionesIA: {
    intencionCompra: number;        // 0-100
    categoriaInteresActual: string;
    momentoOptimo: boolean;
    fatigaPublicitaria: number;     // 0-100
    engagementScore: number;        // 0-100
    probabilidadClick: number;      // 0-100
    probabilidadConversion: number; // 0-100
  };
  
  // Historial de ads
  historialAds: {
    adsVistosHoy: number;
    ultimoAdTimestamp?: string;
    adsClickeadosUltimaSemana: number;
    categoriasMasReceptivas: string[];
  };
}
