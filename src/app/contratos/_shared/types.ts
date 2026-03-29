/**
 * 📋 SHARED TYPES: Contratos
 * 
 * Tipos compartidos entre desktop y mobile para garantizar paridad 1:1.
 * Basado en los DTOs del Mobile API Controller existente.
 * 
 * @tier TIER_0_ENTERPRISE
 * @module contratos
 */

// ═══════════════════════════════════════════════════════════════
// CONTRATO
// ═══════════════════════════════════════════════════════════════

export interface ContratoMobile {
  id: string;
  numero: string;
  titulo: string;
  cliente: {
    id: string;
    nombre: string;
    logoUrl?: string;
  };
  estado: string;
  estadoColor: string;
  valor: number;
  moneda: string;
  fechaInicio: string;
  fechaFin: string;
  diasRestantes: number;
  progreso: number;
  ejecutivo: {
    id: string;
    nombre: string;
    avatar?: string;
  };
  acciones: AccionDisponible[];
  alertas: number;
  urgencia: 'alta' | 'media' | 'normal';
  ultimaActividad: string;
}

export interface AccionDisponible {
  id: string;
  tipo: 'aprobar' | 'rechazar' | 'firmar' | 'enviar' | 'comentar' | 'llamar' | 'email';
  label: string;
  icono: string;
  requiereConfirmacion: boolean;
  disponible: boolean;
  razonNoDisponible?: string;
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════

export interface DashboardKPIs {
  contratosActivos: number;
  valorCartera: number;
  accionesPendientes: number;
  metaMes: number;
  metaCompletada: number;
  alertasUrgentes: number;
}

export interface PipelineEtapa {
  etapa: string;
  cantidad: number;
  valor: number;
  color: string;
}

export interface ActividadReciente {
  id: string;
  tipo: string;
  descripcion: string;
  hace: string;
  icono: string;
}

export interface DashboardMobile {
  usuario: {
    id: string;
    nombre: string;
    avatar?: string;
    rol: string;
  };
  kpis: DashboardKPIs;
  pipeline: PipelineEtapa[];
  actividadReciente: ActividadReciente[];
}

// ═══════════════════════════════════════════════════════════════
// ALERTAS
// ═══════════════════════════════════════════════════════════════

export interface AlertaContrato {
  id: string;
  tipo: 'urgente' | 'vencimiento' | 'aprobacion' | 'renovacion' | 'pago' | 'info';
  prioridad: 'critica' | 'alta' | 'media' | 'baja';
  titulo: string;
  descripcion: string;
  contratoId?: string;
  contratoNumero?: string;
  clienteNombre?: string;
  fechaCreacion: string;
  accion?: {
    tipo: string;
    label: string;
    url?: string;
  };
  leida: boolean;
}

// ═══════════════════════════════════════════════════════════════
// CALENDARIO
// ═══════════════════════════════════════════════════════════════

export type TipoEvento = 'vencimiento' | 'renovacion' | 'reunion' | 'pago' | 'obligacion' | 'recordatorio';

export interface EventoCalendario {
  id: string;
  tipo: TipoEvento;
  titulo: string;
  descripcion?: string;
  fecha: string;
  horaInicio?: string;
  horaFin?: string;
  todoElDia: boolean;
  contratoId?: string;
  clienteNombre?: string;
  valor?: number;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  completado: boolean;
}

// ═══════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════

export interface PrediccionIA {
  id: string;
  cliente: string;
  prediccion: string;
  probabilidad: number;
  tipo: 'positivo' | 'neutro' | 'advertencia';
}

export interface RecomendacionIA {
  id: string;
  accion: string;
  cliente: string;
  prioridad: 'alta' | 'media' | 'baja';
  impactoEstimado: string;
  razon: string;
}

// ═══════════════════════════════════════════════════════════════
// COBRANZA
// ═══════════════════════════════════════════════════════════════

export interface CasoCobranzaMobile {
  id: string;
  folio: string;
  clienteNombre: string;
  montoVencido: number;
  diasMora: number;
  nivel: 'preventivo' | 'temprano' | 'intermedio' | 'intensivo' | 'legal';
  telefono: string;
  email: string;
  probabilidadRecuperacion: number;
}

// ═══════════════════════════════════════════════════════════════
// API RESPONSE
// ═══════════════════════════════════════════════════════════════

export interface MobileAPIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
  syncToken?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════
// TABS & FILTERS
// ═══════════════════════════════════════════════════════════════

export type ContratoTab = 'home' | 'contratos' | 'pipeline' | 'calendario' | 'analytics' | 'mas';

export type FiltroUrgencia = 'todos' | 'alta' | 'media' | 'normal';
export type FiltroEstado = 'todos' | 'activo' | 'pendiente' | 'borrador' | 'firmado';

export const FILTROS_URGENCIA: { id: FiltroUrgencia; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'alta', label: 'Urgentes' },
  { id: 'media', label: 'Media' },
  { id: 'normal', label: 'Normal' },
];

export const FILTROS_ESTADO: { id: FiltroEstado; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'activo', label: 'Activos' },
  { id: 'pendiente', label: 'Pendientes' },
  { id: 'borrador', label: 'Borradores' },
  { id: 'firmado', label: 'Firmados' },
];
