/**
 * SILEXAR PULSE - TIER0+ SDK SPECIFICATION
 * Contratos y Tipos para SDK iOS/Android
 * 
 * Este archivo define la especificación completa del SDK móvil
 * que debe ser implementado en Swift (iOS) y Kotlin (Android).
 * Sirve como contrato entre el backend y los SDKs nativos.
 * 
 * @version 2.0.0
 * @author Silexar Pulse Team
 */

// ============================================================================
// CONFIGURACIÓN DEL SDK
// ============================================================================

/**
 * Configuración de inicialización del SDK
 */
export interface SDKConfiguration {
  /** API Key único proporcionado por Silexar Pulse */
  readonly apiKey: string;
  /** URL base del servidor (por defecto: api.silexar.com) */
  readonly serverUrl?: string;
  /** Ambiente: production, staging, development */
  readonly environment: SDKEnvironment;
  /** Configuración de logging */
  readonly logging: LoggingConfig;
  /** Configuración de privacidad */
  readonly privacy: PrivacyConfig;
  /** Configuración de aprendizaje federado */
  readonly federatedLearning: FederatedLearningConfig;
}

export type SDKEnvironment = 'production' | 'staging' | 'development';

export interface LoggingConfig {
  /** Nivel de logs: none, error, warning, info, debug, verbose */
  readonly level: LogLevel;
  /** Enviar logs al servidor para debugging (solo en desarrollo) */
  readonly remoteLogging: boolean;
}

export type LogLevel = 'none' | 'error' | 'warning' | 'info' | 'debug' | 'verbose';

export interface PrivacyConfig {
  /** Consentimiento GDPR/CCPA otorgado */
  readonly hasConsent: boolean;
  /** Habilitar recolección de datos de contexto */
  readonly collectContextData: boolean;
  /** Habilitar recolección de datos de ubicación (requiere permiso) */
  readonly collectLocationData: boolean;
  /** Anononimizar identificadores */
  readonly anonymizeIdentifiers: boolean;
}

export interface FederatedLearningConfig {
  /** Habilitar aprendizaje federado */
  readonly enabled: boolean;
  /** Frecuencia de entrenamiento local (en horas) */
  readonly trainingFrequency: number;
  /** Solo entrenar cuando está conectado a WiFi */
  readonly onlyOnWifi: boolean;
  /** Solo entrenar cuando está cargando */
  readonly onlyWhenCharging: boolean;
  /** Batch size mínimo antes de enviar actualización */
  readonly minBatchSize: number;
}

// ============================================================================
// DETECCIÓN DE CONTEXTO
// ============================================================================

/**
 * Tipos de contexto detectables por el SDK
 */
export type ContextType = 
  | 'IN_TRANSIT'           // Usuario en movimiento (auto, metro, bus)
  | 'WALKING'              // Usuario caminando
  | 'STATIONARY'           // Usuario quieto (ubicación desconocida)
  | 'AT_HOME'              // Usuario en casa (requiere ubicación)
  | 'AT_WORK'              // Usuario en trabajo (requiere ubicación)
  | 'SECOND_SCREEN'        // Usando dispositivo mientras TV está encendida
  | 'ACTIVE_BROWSING'      // Navegando activamente
  | 'PASSIVE_CONSUMPTION'  // Consumiendo contenido pasivamente
  | 'WORK_BREAK'           // Pausa laboral detectada
  | 'EVENING_RELAXATION'   // Horario típico de relajación
  | 'WAITING'              // Usuario esperando (cola, consultorio, etc.)
  | 'SHOPPING'             // Usuario en zona comercial
  | 'ENTERTAINMENT_VENUE'  // Cine, teatro, estadio, etc.
  | 'COMMUTING'            // Traslado casa-trabajo
  | 'UNKNOWN';             // Contexto no determinable

/**
 * Evento de contexto detectado
 */
export interface ContextEvent {
  /** ID único del evento */
  readonly eventId: string;
  /** Tipo de contexto detectado */
  readonly contextType: ContextType;
  /** Confianza de la detección (0.0 - 1.0) */
  readonly confidence: number;
  /** Timestamp ISO 8601 */
  readonly timestamp: string;
  /** Duración del contexto en segundos (si aplica) */
  readonly durationSeconds?: number;
  /** Metadatos adicionales (anonimizados) */
  readonly metadata: ContextMetadata;
}

export interface ContextMetadata {
  /** Nivel de actividad detectado */
  readonly activityLevel: 'low' | 'medium' | 'high';
  /** Horario del día */
  readonly timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  /** Día de la semana */
  readonly dayOfWeek: 'weekday' | 'weekend';
  /** Tipo de red */
  readonly networkType: 'wifi' | 'cellular' | 'offline';
  /** Nivel de batería (porcentaje) */
  readonly batteryLevel: number;
  /** Estado de carga */
  readonly isCharging: boolean;
  /** Brillo de pantalla (0-100) */
  readonly screenBrightness?: number;
  /** Volumen del dispositivo (0-100) */
  readonly deviceVolume?: number;
}

// ============================================================================
// APRENDIZAJE FEDERADO
// ============================================================================

/**
 * Actualización del modelo federado (enviada al servidor)
 */
export interface FederatedModelUpdate {
  /** ID único del SDK (por instalación) */
  readonly sdkId: string;
  /** Versión del modelo base */
  readonly modelVersion: string;
  /** Plataforma */
  readonly platform: 'ios' | 'android';
  /** Gradientes serializados (base64) */
  readonly gradients: string;
  /** Número de muestras usadas */
  readonly numSamples: number;
  /** Épocas de entrenamiento local */
  readonly localEpochs: number;
  /** Loss promedio del entrenamiento */
  readonly avgLoss: number;
  /** Metadatos de la sesión de entrenamiento */
  readonly trainingMetadata: TrainingSessionMetadata;
  /** Firma HMAC para verificación */
  readonly signature: string;
}

export interface TrainingSessionMetadata {
  /** Contexto predominante durante el entrenamiento */
  readonly primaryContext: ContextType;
  /** Duración de la sesión en minutos */
  readonly sessionDurationMinutes: number;
  /** Hash del dispositivo (para deduplicación) */
  readonly deviceHash: string;
  /** Timestamp de inicio */
  readonly startedAt: string;
  /** Timestamp de fin */
  readonly finishedAt: string;
}

/**
 * Respuesta del servidor de agregación
 */
export interface FederatedServerResponse {
  /** Estado de la actualización */
  readonly success: boolean;
  /** Mensaje del servidor */
  readonly message: string;
  /** Nueva versión del modelo (si hay actualización disponible) */
  readonly latestModelVersion?: string;
  /** URL para descargar nuevo modelo */
  readonly modelDownloadUrl?: string;
  /** Próximo momento recomendado para actualizar */
  readonly nextUpdateSchedule?: string;
  /** Estado de la agregación */
  readonly aggregationStatus?: {
    updatesReceived: number;
    requiredForAggregation: number;
  };
}

// ============================================================================
// EVENTOS DE INTERACCIÓN
// ============================================================================

/**
 * Tipos de interacción del usuario
 */
export type InteractionType = 
  | 'AD_IMPRESSION'        // Anuncio mostrado
  | 'AD_CLICK'             // Click en anuncio
  | 'AD_VIEW_COMPLETE'     // Vista completa (video)
  | 'AD_SKIP'              // Anuncio saltado
  | 'AD_MUTE'              // Anuncio silenciado
  | 'AD_UNMUTE'            // Anuncio des-silenciado
  | 'AD_EXPAND'            // Anuncio expandido
  | 'AD_COLLAPSE'          // Anuncio colapsado
  | 'UTILITY_INTERACTION'  // Interacción con micro-app
  | 'CPVI_COMPLETE'        // Interacción valiosa completada
  | 'NARRATIVE_PROGRESS';  // Progreso en narrativa

/**
 * Evento de interacción
 */
export interface InteractionEvent {
  /** ID único del evento */
  readonly eventId: string;
  /** Tipo de interacción */
  readonly interactionType: InteractionType;
  /** ID del ad/creative */
  readonly creativeId?: string;
  /** ID de la campaña */
  readonly campaignId?: string;
  /** ID del placement */
  readonly placementId?: string;
  /** Timestamp ISO 8601 */
  readonly timestamp: string;
  /** Duración de la interacción en ms */
  readonly durationMs?: number;
  /** Contexto al momento de la interacción */
  readonly context?: ContextType;
  /** Datos adicionales del evento */
  readonly eventData?: Record<string, unknown>;
}

// ============================================================================
// SOLICITUDES DE ANUNCIOS
// ============================================================================

/**
 * Solicitud de anuncio
 */
export interface AdRequest {
  /** ID único de la solicitud */
  readonly requestId: string;
  /** ID del SDK */
  readonly sdkId: string;
  /** ID del placement */
  readonly placementId: string;
  /** Formato de creatividad */
  readonly format: AdFormat;
  /** Contexto actual */
  readonly context: ContextType;
  /** Metadatos del contexto */
  readonly contextMetadata: ContextMetadata;
  /** Capacidades del dispositivo */
  readonly deviceCapabilities: DeviceCapabilities;
  /** Timestamp */
  readonly timestamp: string;
}

export type AdFormat = 
  | 'BANNER'           // Banner estándar
  | 'INTERSTITIAL'     // Pantalla completa
  | 'REWARDED_VIDEO'   // Video con recompensa
  | 'NATIVE'           // Anuncio nativo
  | 'AUDIO'            // Audio (para apps de audio)
  | 'MRAID_UTILITY';   // Micro-app MRAID

export interface DeviceCapabilities {
  /** Soporta MRAID */
  readonly mraidSupport: boolean;
  /** Versión de MRAID soportada */
  readonly mraidVersion?: '2.0' | '3.0';
  /** Soporta video */
  readonly videoSupport: boolean;
  /** Ancho de pantalla */
  readonly screenWidth: number;
  /** Alto de pantalla */
  readonly screenHeight: number;
  /** Densidad de píxeles */
  readonly pixelDensity: number;
  /** Soporta audio */
  readonly audioSupport: boolean;
  /** Versión del OS */
  readonly osVersion: string;
  /** Modelo del dispositivo (hash) */
  readonly deviceModelHash: string;
}

/**
 * Respuesta con decisión de anuncio
 */
export interface AdResponse {
  /** ID de la solicitud */
  readonly requestId: string;
  /** ¿Hay anuncio disponible? */
  readonly hasAd: boolean;
  /** Creatividad a mostrar */
  readonly creative?: CreativePayload;
  /** Tiempo de expiración (segundos) */
  readonly expiresInSeconds?: number;
  /** No-fill reason (si no hay anuncio) */
  readonly noFillReason?: string;
}

export interface CreativePayload {
  /** ID de la creatividad */
  readonly creativeId: string;
  /** ID de la campaña */
  readonly campaignId: string;
  /** Formato */
  readonly format: AdFormat;
  /** Contenido (HTML, URL, etc.) */
  readonly content: string;
  /** Tipo de contenido */
  readonly contentType: 'html' | 'url' | 'vast' | 'json';
  /** Dimensiones recomendadas */
  readonly dimensions?: { width: number; height: number };
  /** URLs de tracking */
  readonly tracking: TrackingUrls;
  /** Metadatos de la narrativa (si aplica) */
  readonly narrative?: NarrativeMetadata;
}

export interface TrackingUrls {
  /** URL de impresión */
  readonly impression: string[];
  /** URL de click */
  readonly click: string[];
  /** URLs de cuartiles de video */
  readonly quartiles?: {
    firstQuartile: string[];
    midpoint: string[];
    thirdQuartile: string[];
    complete: string[];
  };
  /** URL de evento CPVI */
  readonly cpviComplete?: string[];
}

export interface NarrativeMetadata {
  /** ID de la narrativa */
  readonly narrativeId: string;
  /** Capítulo actual */
  readonly chapter: number;
  /** Total de capítulos */
  readonly totalChapters: number;
  /** Progreso del usuario (0-100) */
  readonly userProgress: number;
}

// ============================================================================
// CALLBACKS Y DELEGATES
// ============================================================================

/**
 * Delegate/Listener del SDK (para implementar en la app)
 */
export interface SilexarSDKDelegate {
  /** Llamado cuando el SDK está listo */
  onReady(): void;
  
  /** Llamado cuando hay un error */
  onError(error: SDKError): void;
  
  /** Llamado cuando se detecta un cambio de contexto */
  onContextChanged(context: ContextEvent): void;
  
  /** Llamado cuando un anuncio está listo */
  onAdReady(response: AdResponse): void;
  
  /** Llamado cuando un anuncio se muestra */
  onAdShown(creativeId: string): void;
  
  /** Llamado cuando un anuncio se cierra */
  onAdClosed(creativeId: string, completionPercentage: number): void;
  
  /** Llamado cuando hay una recompensa disponible (rewarded video) */
  onRewardEarned(reward: RewardInfo): void;
  
  /** Llamado cuando el modelo federado se actualiza */
  onModelUpdated(version: string): void;
}

export interface SDKError {
  /** Código de error */
  readonly code: SDKErrorCode;
  /** Mensaje de error */
  readonly message: string;
  /** Error subyacente (si aplica) */
  readonly underlyingError?: string;
  /** ¿Es recuperable? */
  readonly isRecoverable: boolean;
}

export type SDKErrorCode = 
  | 'INITIALIZATION_FAILED'
  | 'NETWORK_ERROR'
  | 'INVALID_API_KEY'
  | 'API_KEY_EXPIRED'
  | 'NO_FILL'
  | 'AD_LOAD_FAILED'
  | 'AD_RENDER_FAILED'
  | 'CONTEXT_DETECTION_FAILED'
  | 'FL_TRAINING_FAILED'
  | 'FL_UPLOAD_FAILED'
  | 'PERMISSION_DENIED'
  | 'UNKNOWN_ERROR';

export interface RewardInfo {
  /** Tipo de recompensa */
  readonly rewardType: string;
  /** Cantidad */
  readonly amount: number;
  /** ID de la transacción */
  readonly transactionId: string;
}

// ============================================================================
// MÉTODOS PÚBLICOS DEL SDK (INTERFACE)
// ============================================================================

/**
 * Interface pública del SDK
 * Esta es la API que los desarrolladores usarán en sus apps
 */
export interface SilexarPulseSDK {
  // Inicialización
  initialize(config: SDKConfiguration): Promise<void>;
  isInitialized(): boolean;
  
  // Delegate
  setDelegate(delegate: SilexarSDKDelegate): void;
  
  // Contexto
  getCurrentContext(): ContextType | null;
  getContextHistory(limit?: number): ContextEvent[];
  forceContextRefresh(): Promise<ContextEvent>;
  
  // Anuncios
  requestAd(placementId: string, format: AdFormat): Promise<AdResponse>;
  showAd(requestId: string): Promise<void>;
  isAdReady(placementId: string): boolean;
  
  // Eventos
  trackInteraction(event: Partial<InteractionEvent>): void;
  
  // Aprendizaje Federado
  isFLEnabled(): boolean;
  getLocalModelVersion(): string;
  forceModelUpdate(): Promise<void>;
  
  // Privacidad
  setConsent(hasConsent: boolean): void;
  getConsentStatus(): boolean;
  clearUserData(): Promise<void>;
  
  // Debug
  getSDKVersion(): string;
  getSDKId(): string;
  enableDebugMode(enable: boolean): void;
}

// ============================================================================
// ENDPOINTS DE LA API (CONTRATO)
// ============================================================================

/**
 * Definición de endpoints que el SDK debe consumir
 */
export const SDK_API_ENDPOINTS = {
  /** Configuración inicial del SDK */
  CONFIG: '/api/v2/sdk/config',
  /** Solicitud de anuncios */
  AD_REQUEST: '/api/v2/ads/request',
  /** Tracking de eventos */
  EVENTS: '/api/v2/events/track',
  /** Actualización de modelo federado */
  FL_UPDATE: '/api/v2/events/fl-update',
  /** Descarga de modelo */
  FL_MODEL: '/api/v2/fl/model',
  /** Heartbeat del SDK */
  HEARTBEAT: '/api/v2/sdk/heartbeat',
  /** Logs remotos (solo desarrollo) */
  LOGS: '/api/v2/sdk/logs',
} as const;

export default {
  SDK_API_ENDPOINTS,
};
