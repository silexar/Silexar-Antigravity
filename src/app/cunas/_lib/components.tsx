/**
 * 🎵 SILEXAR PULSE — Cuñas: Componentes UI Neuromórficos
 * 
 * Componentes reutilizables de diseño neuromórfico para el módulo de cuñas.
 * Extraídos de page.tsx para modularización.
 * 
 * @module cunas/components
 * @version 2026.3.0
 */

'use client';

import Image from 'next/image';
import React from 'react';
import {
  CheckCircle, AlertCircle, XCircle, Volume2, FileAudio,
  Pause, Clock, Music, Mic, Radio, Sparkles, Target,
  Calendar, RefreshCw, ArrowUp, ArrowDown
} from 'lucide-react';
import type { TipoCuna, EstadoCuna, UrgenciaCuna } from './types';

// ═══════════════════════════════════════════════════════════════
// COMPONENTES NEUROMÓRFICOS
// ═══════════════════════════════════════════════════════════════

export const NeuromorphicCard = ({ 
  children, 
  className = '', 
  hover = false,
  glow = false
}: { 
  children: React.ReactNode; 
  className?: string;
  hover?: boolean;
  glow?: boolean;
}) => (
  <div className={`
    rounded-2xl p-6
    ${hover ? 'transition-all duration-300 cursor-pointer' : ''}
    ${glow ? 'ring-1 ring-emerald-400/30' : ''}
    ${className}
  `}
  style={{
    background: '#dfeaff',
    boxShadow: hover
      ? '8px 8px 16px #bec8de,-8px -8px 16px #ffffff'
      : '8px 8px 16px #bec8de,-8px -8px 16px #ffffff',
  }}
  >
    {children}
  </div>
);

export const NeuromorphicButton = ({ 
  children, 
  onClick, 
  variant = 'secondary',
  size = 'md',
  className = '',
  disabled = false
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}) => {
  const variantStyle: Record<typeof variant, React.CSSProperties> = {
    primary:   { background: '#6888ff', color: '#ffffff', boxShadow: '4px 4px 8px #bec8de,-2px -2px 6px #ffffff' },
    secondary: { background: '#dfeaff', color: '#69738c', boxShadow: '6px 6px 12px #bec8de,-6px -6px 12px #ffffff' },
    danger:    { background: '#dfeaff', color: '#ef4444', boxShadow: '4px 4px 8px #bec8de,-4px -4px 8px #ffffff' },
    ghost:     { background: 'transparent', color: '#9aa3b8' },
  };
  const getSizeClass = (s: typeof size): string => {
    switch (s) {
      case 'sm': return 'px-3 py-1.5 text-sm';
      case 'lg': return 'px-6 py-3 text-lg';
      case 'md':
      default: return 'px-4 py-2';
    }
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${getSizeClass(size)} rounded-xl font-bold transition-all duration-300
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={variantStyle[variant]}
    >
      {children}
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════
// BADGES
// ═══════════════════════════════════════════════════════════════

export const EstadoBadge = ({ estado, size = 'md' }: { estado: EstadoCuna; size?: 'sm' | 'md' }) => {
  // Safe switch to prevent object injection
  const getConfig = (e: EstadoCuna) => {
    switch (e) {
      case 'en_aire': return { bg: 'from-emerald-400 to-emerald-500', icon: Volume2, label: 'En Aire' };
      case 'aprobada': return { bg: 'from-blue-400 to-blue-500', icon: CheckCircle, label: 'Aprobada' };
      case 'pendiente_validacion': return { bg: 'from-amber-400 to-amber-500', icon: AlertCircle, label: 'Pendiente' };
      case 'borrador': return { bg: 'from-slate-400 to-slate-500', icon: FileAudio, label: 'Borrador' };
      case 'pausada': return { bg: 'from-orange-400 to-orange-500', icon: Pause, label: 'Pausada' };
      case 'vencida': return { bg: 'from-red-400 to-red-500', icon: Clock, label: 'Vencida' };
      case 'finalizada': return { bg: 'from-gray-400 to-gray-500', icon: XCircle, label: 'Finalizada' };
      default: return { bg: 'from-slate-400 to-slate-500', icon: FileAudio, label: 'Borrador' };
    }
  };
  const { bg, icon: Icon, label } = getConfig(estado);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses} rounded-full font-medium text-white bg-gradient-to-r ${bg} shadow-md`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {label}
    </span>
  );
};

export const UrgenciaBadge = ({ urgencia }: { urgencia: UrgenciaCuna }) => {
  // Safe switch to prevent object injection
  const getConfig = (u: UrgenciaCuna) => {
    switch (u) {
      case 'critica': return { color: 'bg-red-500', label: '🔴 Crítica', pulse: true };
      case 'urgente': return { color: 'bg-amber-500', label: '🟠 Urgente', pulse: false };
      case 'programada': return { color: 'bg-blue-500', label: '🔵 Programada', pulse: false };
      case 'standby': return { color: 'bg-slate-400', label: '⚪ Standby', pulse: false };
      default: return { color: 'bg-slate-400', label: '⚪ Standby', pulse: false };
    }
  };
  const { color, label, pulse } = getConfig(urgencia);
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${color} ${pulse ? 'animate-pulse' : ''}`} />
      <span className="text-xs font-medium" style={{ color: '#9aa3b8' }}>{label}</span>
    </div>
  );
};

export const TipoBadge = ({ tipo }: { tipo: TipoCuna }) => {
  // Safe switch to prevent object injection
  const getConfig = (t: TipoCuna) => {
    switch (t) {
      case 'audio': return { color: 'bg-blue-100 text-blue-700', icon: FileAudio };
      case 'mencion': return { color: 'bg-purple-100 text-purple-700', icon: Mic };
      case 'presentacion': return { color: 'bg-amber-100 text-amber-700', icon: Radio };
      case 'cierre': return { color: 'bg-pink-100 text-pink-700', icon: Target };
      case 'promo_ida': return { color: 'bg-cyan-100 text-cyan-700', icon: Sparkles };
      case 'jingle': return { color: 'bg-green-100 text-green-700', icon: Music };
      default: return { color: 'bg-blue-100 text-blue-700', icon: FileAudio };
    }
  };
  const { color, icon: Icon } = getConfig(tipo);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {tipo.charAt(0).toUpperCase() + tipo.slice(1).replace('_', ' ')}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTES DE PROGRAMACIÓN
// ═══════════════════════════════════════════════════════════════

// eslint-disable-next-line react-refresh/only-export-components
export function calcularTiempoRestante(proximaEmision: string): { texto: string; esInminente: boolean; esCritico: boolean } {
  const ahora = new Date();
  const emision = new Date(proximaEmision);
  const diffMs = emision.getTime() - ahora.getTime();
  if (diffMs < 0) return { texto: 'Emitida', esInminente: false, esCritico: false };
  const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (diffHoras < 1) return { texto: `${diffMinutos}min`, esInminente: true, esCritico: diffMinutos < 15 };
  if (diffHoras < 24) return { texto: `${diffHoras}h ${diffMinutos}m`, esInminente: diffHoras < 2, esCritico: false };
  const diffDias = Math.floor(diffHoras / 24);
  return { texto: `${diffDias}d ${diffHoras % 24}h`, esInminente: false, esCritico: false };
}

export const TiempoRestanteBadge = ({ proximaEmision }: { proximaEmision: string }) => {
  const { texto, esInminente, esCritico } = calcularTiempoRestante(proximaEmision);
  return (
    <span className={`
      inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
      ${esCritico ? 'bg-red-100 text-red-700 animate-pulse' : esInminente ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}
    `}>
      <Clock className="w-3 h-3" />
      {texto}
    </span>
  );
};

export const EmisoraChip = ({ nombre, logo }: { nombre: string; logo?: string }) => (
  <div
    className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
    style={{ background: '#dfeaff', boxShadow: 'inset 2px 2px 4px #bec8de,inset -2px -2px 4px #ffffff' }}
  >
    {logo ? (
      <Image src={logo} alt={nombre} width={16} height={16} className="rounded-full object-cover" />
    ) : (
      <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#dfeaff', boxShadow: '2px 2px 4px #bec8de,-2px -2px 4px #ffffff' }}>
        <Radio className="w-2.5 h-2.5" style={{ color: '#6888ff' }} />
      </div>
    )}
    <span className="text-xs font-bold truncate max-w-[80px]" style={{ color: '#69738c' }}>{nombre}</span>
  </div>
);

export const ProximaEmisionInfo = ({ horarioBloque, frecuencia, totalEmisoras }: { horarioBloque: string; frecuencia: string; totalEmisoras: number; }) => (
  <div className="flex flex-col gap-0.5 text-xs">
    <div className="flex items-center gap-1" style={{ color: '#69738c' }}>
      <Calendar className="w-3 h-3" style={{ color: '#9aa3b8' }} />
      <span className="font-medium">{horarioBloque}</span>
    </div>
    <div className="flex items-center gap-2" style={{ color: '#9aa3b8' }}>
      <span className="flex items-center gap-0.5"><RefreshCw className="w-2.5 h-2.5" />{frecuencia}</span>
      <span className="flex items-center gap-0.5"><Radio className="w-2.5 h-2.5" />{totalEmisoras} emisora{totalEmisoras !== 1 ? 's' : ''}</span>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// MÉTRICA CARD
// ═══════════════════════════════════════════════════════════════

export const MetricaCard = ({
  label, value, icon: Icon, color, trend, trendValue
}: {
  label: string; value: number | string; icon: React.ElementType; color: string;
  trend?: 'up' | 'down' | 'neutral'; trendValue?: string;
}) => (
  <NeuromorphicCard hover className="relative overflow-hidden">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium" style={{ color: '#9aa3b8' }}>{label}</p>
        <p className="text-3xl font-black mt-1" style={{ color: '#69738c' }}>{value}</p>
        {trend && trendValue && (
          <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#9aa3b8' }}>
            {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : trend === 'down' ? <ArrowDown className="w-3 h-3" /> : null}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className="p-4 rounded-2xl" style={{ background: '#dfeaff', boxShadow: '4px 4px 8px #bec8de,-4px -4px 8px #ffffff' }}>
        <Icon className="w-8 h-8" style={{ color }} />
      </div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl" style={{ background: color }} />
  </NeuromorphicCard>
);
