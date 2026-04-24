/**
 * 📱 SILEXAR PULSE - Mobile SDK Types & Configuration TIER 0
 * 
 * @description Tipos y configuración compartida para apps móviles.
 * Este archivo sirve como contrato de API entre el backend y las
 * aplicaciones móviles (React Native, Flutter, iOS nativo, Android nativo).
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 * @platforms iOS, Android, React Native, Flutter
 */

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN BASE
// ═══════════════════════════════════════════════════════════════

export const MOBILE_CONFIG = {
  // Versión mínima requerida para cada plataforma
  VERSION: {
    MIN_IOS: '2.0.0',
    MIN_ANDROID: '2.0.0',
    CURRENT: '2.5.0'
  },
  
  // Endpoints base
  ENDPOINTS: {
    BASE: '/api/mobile',
    AUTH: '/api/mobile/auth',
    CONTRATOS: '/api/mobile/contratos',
    SYNC: '/api/mobile/sync',
    FILES: '/api/mobile/files',
    FACTURACION: '/api/mobile/facturacion',
    COBRANZA: '/api/mobile/cobranza'
  },
  
  // Timeouts (ms)
  TIMEOUTS: {
    DEFAULT: 30000,
    UPLOAD: 120000,
    SYNC: 60000
  },
  
  // Límites
  LIMITS: {
    PAGE_SIZE_DEFAULT: 20,
    PAGE_SIZE_MAX: 100,
    OFFLINE_QUEUE_MAX: 100,
    ATTACHMENT_SIZE_MB: 25
  },
  
  // Intervalos de sync (ms)
  SYNC: {
    INTERVAL_ACTIVE: 30000,      // Cada 30 seg cuando la app está activa
    INTERVAL_BACKGROUND: 300000, // Cada 5 min en background
    RETRY_DELAY: 5000,           // 5 seg antes de reintentar
    MAX_RETRIES: 3
  },
  
  // Cache
  CACHE: {
    TTL_CONTRATOS: 300000,   // 5 minutos
    TTL_DASHBOARD: 60000,    // 1 minuto
    TTL_ALERTAS: 120000,     // 2 minutos
    MAX_ITEMS: 500
  }
} as const;

// ═══════════════════════════════════════════════════════════════
// TIPOS DE RESPUESTA API
// ═══════════════════════════════════════════════════════════════

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: ApiError;
  timestamp: string;
  syncToken?: string;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  retryable: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

// ═══════════════════════════════════════════════════════════════
// TIPOS DE ENTIDADES MÓVILES
// ═══════════════════════════════════════════════════════════════

export interface ContratoMobile {
  id: string;
  numero: string;
  titulo: string;
  cliente: ClienteResumen;
  estado: EstadoContrato;
  estadoColor: string;
  valor: number;
  moneda: Moneda;
  fechaInicio: string;
  fechaFin: string;
  diasRestantes: number;
  progreso: number;
  ejecutivo: UsuarioResumen;
  acciones: AccionDisponible[];
  alertas: number;
  urgencia: NivelUrgencia;
  ultimaActividad: string;
  offline?: boolean; // Creado/modificado offline
}

export interface ClienteResumen {
  id: string;
  nombre: string;
  logoUrl?: string;
  rut?: string;
}

export interface UsuarioResumen {
  id: string;
  nombre: string;
  email?: string;
  avatar?: string;
  rol?: string;
}

export interface AccionDisponible {
  id: string;
  tipo: TipoAccion;
  label: string;
  icono: string;
  requiereConfirmacion: boolean;
  disponible: boolean;
  razonNoDisponible?: string;
}

export type TipoAccion = 
  | 'aprobar' 
  | 'rechazar' 
  | 'firmar' 
  | 'enviar' 
  | 'comentar' 
  | 'llamar' 
  | 'email' 
  | 'whatsapp'
  | 'ver_detalle'
  | 'editar'
  | 'duplicar'
  | 'cancelar';

export type EstadoContrato = 
  | 'Borrador'
  | 'Pendiente Aprobación'
  | 'Aprobado'
  | 'Firma Pendiente'
  | 'Activo'
  | 'En Ejecución'
  | 'Pausado'
  | 'Completado'
  | 'Cancelado'
  | 'Vencido';

export type NivelUrgencia = 'critica' | 'alta' | 'media' | 'normal' | 'baja';

export type Moneda = 'CLP' | 'USD' | 'UF' | 'EUR';

// ═══════════════════════════════════════════════════════════════
// TIPOS DASHBOARD MÓVIL
// ═══════════════════════════════════════════════════════════════

export interface DashboardMobile {
  usuario: UsuarioResumen;
  kpis: DashboardKPIs;
  pipeline: PipelineEtapa[];
  actividadReciente: ActividadItem[];
  alertasUrgentes: AlertaMobile[];
  proximasAcciones: AccionProgramada[];
}

export interface DashboardKPIs {
  contratosActivos: number;
  valorCartera: number;
  accionesPendientes: number;
  metaMes: number;
  metaCompletada: number;
  porcentajeMeta: number;
  alertasUrgentes: number;
  contratosDia: number;
  valorDia: number;
}

export interface PipelineEtapa {
  id: string;
  etapa: string;
  cantidad: number;
  valor: number;
  color: string;
  icono?: string;
}

export interface ActividadItem {
  id: string;
  tipo: TipoActividad;
  descripcion: string;
  hace: string;
  icono: string;
  contratoId?: string;
  url?: string;
}

export type TipoActividad = 
  | 'aprobacion' 
  | 'firma' 
  | 'comentario' 
  | 'creacion' 
  | 'edicion' 
  | 'pago' 
  | 'vencimientos' 
  | 'sistema';

export interface AccionProgramada {
  id: string;
  tipo: string;
  descripcion: string;
  fechaHora: string;
  contratoId?: string;
  clienteNombre?: string;
  prioridad: NivelUrgencia;
}

// ═══════════════════════════════════════════════════════════════
// TIPOS ALERTAS MÓVIL
// ═══════════════════════════════════════════════════════════════

export interface AlertaMobile {
  id: string;
  tipo: TipoAlerta;
  prioridad: NivelUrgencia;
  titulo: string;
  descripcion: string;
  contratoId?: string;
  contratoNumero?: string;
  clienteNombre?: string;
  fechaCreacion: string;
  accion?: AlertaAccion;
  leida: boolean;
  expirada?: boolean;
}

export interface AlertaAccion {
  tipo: string;
  label: string;
  url?: string;
  datos?: Record<string, unknown>;
}

export type TipoAlerta = 
  | 'urgente' 
  | 'vencimientos' 
  | 'aprobacion' 
  | 'renovacion' 
  | 'pago' 
  | 'firma' 
  | 'info' 
  | 'sistema';

// ═══════════════════════════════════════════════════════════════
// TIPOS AUTENTICACIÓN MÓVIL
// ═══════════════════════════════════════════════════════════════

export interface LoginRequest {
  email: string;
  password: string;
  dispositivo: DispositivoInfo;
  biometriaDisponible?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  usuario: UsuarioCompleto;
  permisos: string[];
  configuracion: ConfiguracionUsuario;
}

export interface UsuarioCompleto extends UsuarioResumen {
  cargo: string;
  empresa: string;
  empresaLogo?: string;
  telefono?: string;
  timezone: string;
}

export interface DispositivoInfo {
  id: string;
  nombre: string;
  plataforma: 'ios' | 'android';
  version: string;
  modelo: string;
  osVersion: string;
}

export interface ConfiguracionUsuario {
  tema: 'light' | 'dark' | 'system';
  notificacionesPush: boolean;
  notificacionesEmail: boolean;
  biometriaHabilitada: boolean;
  idioma: string;
  monedaPredeterminada: Moneda;
  formatoFecha: string;
  formatoNumero: string;
  syncAutomatico: boolean;
  intervaloSync: number;
}

// ═══════════════════════════════════════════════════════════════
// TIPOS SINCRONIZACIÓN OFFLINE
// ═══════════════════════════════════════════════════════════════

export interface SyncRequest {
  ultimoSyncToken?: string;
  dispositivoId: string;
  plataforma: 'ios' | 'android';
  version: string;
  entidades?: string[];
}

export interface SyncResponse {
  nuevoSyncToken: string;
  deltas: DeltaSync[];
  conflictos: ConflictoSync[];
  timestamp: string;
}

export interface DeltaSync {
  tipo: 'crear' | 'actualizar' | 'eliminar';
  entidad: string;
  id: string;
  datos?: Record<string, unknown>;
  timestamp: string;
}

export interface ConflictoSync {
  id: string;
  entidad: string;
  entidadId: string;
  versionLocal: Record<string, unknown>;
  versionServidor: Record<string, unknown>;
  fechaLocal: string;
  fechaServidor: string;
}

export interface AccionOffline {
  id: string;
  tipo: string;
  entidad: string;
  entidadId: string;
  datos: Record<string, unknown>;
  timestamp: string;
  intentos: number;
}

// ═══════════════════════════════════════════════════════════════
// TIPOS PUSH NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

export interface PushNotification {
  id: string;
  tipo: TipoAlerta;
  titulo: string;
  cuerpo: string;
  icono?: string;
  imagen?: string;
  datos: Record<string, unknown>;
  prioridad: NivelUrgencia;
  sonido: boolean;
  badge?: number;
}

export interface PushConfig {
  alertasUrgentes: boolean;
  aprobacionesPendientes: boolean;
  vencimientos: boolean;
  pagos: boolean;
  firmasPendientes: boolean;
  mensajesEquipo: boolean;
  resumenDiario: boolean;
  horarioInicio: string;
  horarioFin: string;
  diasActivos: string[];
  silenciarFinesSemana: boolean;
}

// ═══════════════════════════════════════════════════════════════
// CÓDIGOS DE ERROR
// ═══════════════════════════════════════════════════════════════

export const ERROR_CODES = {
  // Auth
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_BIOMETRIA_FAILED: 'AUTH_BIOMETRIA_FAILED',
  AUTH_DISPOSITIVO_BLOQUEADO: 'AUTH_DISPOSITIVO_BLOQUEADO',
  
  // Network
  NET_OFFLINE: 'NET_OFFLINE',
  NET_TIMEOUT: 'NET_TIMEOUT',
  NET_SERVER_ERROR: 'NET_SERVER_ERROR',
  
  // Validación
  VAL_CAMPO_REQUERIDO: 'VAL_CAMPO_REQUERIDO',
  VAL_FORMATO_INVALIDO: 'VAL_FORMATO_INVALIDO',
  VAL_RANGO_EXCEDIDO: 'VAL_RANGO_EXCEDIDO',
  
  // Negocio
  BIZ_CONTRATO_NO_ENCONTRADO: 'BIZ_CONTRATO_NO_ENCONTRADO',
  BIZ_ACCION_NO_PERMITIDA: 'BIZ_ACCION_NO_PERMITIDA',
  BIZ_ESTADO_INVALIDO: 'BIZ_ESTADO_INVALIDO',
  BIZ_CUPO_EXCEDIDO: 'BIZ_CUPO_EXCEDIDO',
  
  // Sync
  SYNC_CONFLICTO: 'SYNC_CONFLICTO',
  SYNC_VERSION_OBSOLETA: 'SYNC_VERSION_OBSOLETA',
  SYNC_COLA_LLENA: 'SYNC_COLA_LLENA'
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS PARA SDK
// ═══════════════════════════════════════════════════════════════

export function buildEndpoint(path: string, params?: Record<string, string | number | boolean>): string {
  let url = `${MOBILE_CONFIG.ENDPOINTS.BASE}${path}`;
  
  if (params) {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    if (query) url += `?${query}`;
  }
  
  return url;
}

export function formatCurrencyMobile(value: number, moneda: Moneda = 'CLP'): string {
  const configs: Record<Moneda, { locale: string; currency: string; decimals: number }> = {
    CLP: { locale: 'es-CL', currency: 'CLP', decimals: 0 },
    USD: { locale: 'en-US', currency: 'USD', decimals: 2 },
    EUR: { locale: 'es-ES', currency: 'EUR', decimals: 2 },
    UF: { locale: 'es-CL', currency: 'CLF', decimals: 2 }
  };
  
  const config = configs[moneda];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    maximumFractionDigits: config.decimals
  }).format(value);
}

export function formatFechaMobile(fecha: string | Date, formato: 'short' | 'long' | 'relative' = 'short'): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  if (formato === 'relative') {
    const diff = Date.now() - date.getTime();
    const minutos = Math.floor(diff / 60000);
    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `${minutos}m`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas}h`;
    const dias = Math.floor(horas / 24);
    if (dias < 7) return `${dias}d`;
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
  }
  
  const options: Intl.DateTimeFormatOptions = formato === 'short' 
    ? { day: '2-digit', month: 'short' }
    : { day: '2-digit', month: 'long', year: 'numeric' };
    
  return date.toLocaleDateString('es-CL', options);
}

export function generarIdDispositivo(): string {
  return `dev_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function obtenerColorEstado(estado: EstadoContrato): string {
  const colores: Record<EstadoContrato, string> = {
    'Borrador': '#94a3b8',
    'Pendiente Aprobación': '#f59e0b',
    'Aprobado': '#22c55e',
    'Firma Pendiente': '#8b5cf6',
    'Activo': '#3b82f6',
    'En Ejecución': '#06b6d4',
    'Pausado': '#f97316',
    'Completado': '#10b981',
    'Cancelado': '#ef4444',
    'Vencido': '#dc2626'
  };
  return colores[estado] || '#64748b';
}

export function obtenerIconoAlerta(tipo: TipoAlerta): string {
  const iconos: Record<TipoAlerta, string> = {
    urgente: 'alert-triangle',
    vencimientos: 'clock',
    aprobacion: 'check-circle',
    renovacion: 'refresh-cw',
    pago: 'dollar-sign',
    firma: 'pen-tool',
    info: 'info',
    sistema: 'settings'
  };
  return iconos[tipo] || 'bell';
}
