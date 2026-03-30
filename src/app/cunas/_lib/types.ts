/**
 * 🎵 SILEXAR PULSE — Cuñas: Tipos e Interfaces
 * 
 * Tipos compartidos para el módulo de cuñas/spots.
 * Extraído de page.tsx para modularización.
 * 
 * @module cunas/types
 * @version 2026.3.0
 */

export type TipoCuna = 'audio' | 'mencion' | 'presentacion' | 'cierre' | 'promo_ida' | 'jingle';
export type EstadoCuna = 'borrador' | 'pendiente_validacion' | 'aprobada' | 'en_aire' | 'pausada' | 'vencida' | 'finalizada';
export type UrgenciaCuna = 'critica' | 'urgente' | 'programada' | 'standby';

export interface Cuna {
  id: string;
  spxCodigo: string;
  nombre: string;
  tipo: TipoCuna;
  anuncianteNombre: string;
  producto: string | null;
  duracionSegundos: number;
  duracionFormateada: string;
  estado: EstadoCuna;
  urgencia: UrgenciaCuna;
  diasRestantes: number;
  scoreTecnico: number;
  scoreBrandSafety: number;
  totalEmisiones: number;
  fechaCreacion: string;
  esCritica: boolean;
  audioUrl?: string;
  programacion?: {
    emisoraId: string;
    emisoraNombre: string;
    emisoraLogo?: string;
    proximaEmision: string;
    horarioBloque: string;
    frecuencia: string;
    totalEmisorasHoy: number;
  };
}

export interface MetricasOperativas {
  totalCunas: number;
  enAire: number;
  pendientesValidacion: number;
  porVencer: number;
  emisionesHoy: number;
  tasaAprobacion: number;
  cambioVsAyer: number;
}

export interface AlertaOperativa {
  id: string;
  tipo: 'vencimiento' | 'validacion' | 'distribucion' | 'emision';
  prioridad: 'critica' | 'alta' | 'media';
  mensaje: string;
  cunaId?: string;
  cunaCodigo?: string;
  accion: string;
}
