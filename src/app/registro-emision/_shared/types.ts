/**
 * 📋 SHARED TYPES: Registro de Emisión
 * 
 * Tipos compartidos entre desktop y mobile para garantizar paridad 1:1.
 * Fuente única de verdad para todas las interfaces del módulo.
 * 
 * @tier TIER_0_ENTERPRISE
 * @module registro-emision
 */

// ═══════════════════════════════════════════════════════════════
// REGISTRO DE EMISIÓN
// ═══════════════════════════════════════════════════════════════

export interface Registro {
  id: string;
  spotTandaId: string;
  cunaNombre: string;
  horaProgra: string;
  horaEmision: string | null;
  emitido: boolean;
  confirmado: boolean;
  metodo: string | null;
  confianza: number;
}

export interface Stats {
  total: number;
  emitidos: number;
  confirmados: number;
  pendientes: number;
  noEmitidos: number;
  porcentajeEmision: number;
  confianzaPromedio: number;
}

export interface RegistroAPIResponse {
  success: boolean;
  data: Registro[];
  stats: Stats;
  fecha: string;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════
// VERIFICACIÓN
// ═══════════════════════════════════════════════════════════════

export interface Material {
  id: string;
  nombre: string;
  tipo: 'audio_pregrabado' | 'mencion_vivo' | 'display_banner';
  selected: boolean;
  duracion?: number;
  spxCode?: string;
  horaProgramada?: string;
  texto?: string;
}

export interface ResultadoVerificacion {
  materialId: string;
  nombreMaterial: string;
  tipoMaterial: 'audio_pregrabado' | 'mencion_vivo' | 'presentacion' | 'cierre' | 'display_banner';
  encontrado: boolean;
  horaEmision?: string;
  horaFin?: string;
  emisora?: string;
  accuracy?: number;
  clipUrl?: string;
  transcripcion?: string;
  locutor?: string;
  posibleCausa?: string;
}

// ═══════════════════════════════════════════════════════════════
// GRILLA
// ═══════════════════════════════════════════════════════════════

export interface GridItem {
  id: string;
  titulo: string;
  cliente: string;
  duracion: number;
  estado: string;
  tipo: 'spot' | 'mencion' | 'bloque';
}

export interface GridBlock {
  id: string;
  hora: string;
  nombre: string;
  estado: 'planificada' | 'en_revision' | 'aprobada' | 'exportada' | 'emitida' | 'verificada';
  ocupacion: number;
  items: GridItem[];
}

// ═══════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════

export interface AnalyticsKPI {
  label: string;
  value: number | string;
  trend: number;
  period: string;
}

export interface AnalyticsPeriod {
  id: 'hoy' | 'semana' | 'mes' | 'trimestre';
  label: string;
}

// ═══════════════════════════════════════════════════════════════
// ALERTAS
// ═══════════════════════════════════════════════════════════════

export interface AlertaEmision {
  id: string;
  client: string;
  issue: string;
  critical: boolean;
  timestamp: string;
  resolved: boolean;
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

export type ExportFormat = 'pdf' | 'csv' | 'email' | 'whatsapp';

export interface ExportConfig {
  format: ExportFormat;
  includeClips: boolean;
  includeTranscriptions: boolean;
  includeBlockchain: boolean;
  recipientEmail?: string;
  recipientPhone?: string;
}

// ═══════════════════════════════════════════════════════════════
// FILTROS
// ═══════════════════════════════════════════════════════════════

export type FiltroEstado = 'todos' | 'confirmado' | 'pendiente' | 'no_emitido';

export const FILTROS: { id: FiltroEstado; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'confirmado', label: 'Confirmados' },
  { id: 'pendiente', label: 'Pendientes' },
  { id: 'no_emitido', label: 'No Emitidos' },
];

// ═══════════════════════════════════════════════════════════════
// TABS MOBILE
// ═══════════════════════════════════════════════════════════════

export type MobileTab = 'home' | 'verificar' | 'registros' | 'grilla' | 'analytics';
