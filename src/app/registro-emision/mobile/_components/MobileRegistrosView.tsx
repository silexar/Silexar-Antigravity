/**
 * 📋 MOBILE: Vista de Registros
 * 
 * Lista completa de emisiones con date picker, filtros, acciones de confirmación.
 * Replica la funcionalidad de la página principal desktop en formato mobile.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import {
  CheckCircle, XCircle, AlertCircle, Clock,
  RefreshCw, ChevronLeft, ChevronRight,
  Music, Fingerprint, Mic, User, Zap,
  RotateCcw, Check
} from 'lucide-react';
import type { Registro, FiltroEstado } from '../../_shared/types';
import { FILTROS } from '../../_shared/types';
import { useRegistroEmision } from '../../_shared/useRegistroEmision';

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function MetodoBadge({ metodo }: { metodo: string | null }) {
  const config: Record<string, { bg: string; icon: React.ElementType }> = {
    manual: { bg: 'bg-slate-400', icon: User },
    fingerprint: { bg: 'bg-purple-500', icon: Fingerprint },
    shazam: { bg: 'bg-cyan-500', icon: Music },
    speech_to_text: { bg: 'bg-emerald-500', icon: Mic },
    automatico: { bg: 'bg-blue-500', icon: Zap },
  };
  const { bg, icon: Icon } = config[metodo || 'manual'] || config.manual;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${bg}`}>
      <Icon className="w-3 h-3" />
      {metodo || 'N/A'}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function MobileRegistrosView() {
  const {
    registros, stats, loading, fecha, filtro,
    cambiarFecha, confirmarEmision, registrarManual,
    setFiltro, refresh,
  } = useRegistroEmision();

  return (
    <div className="space-y-5">
      {/* DATE PICKER */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-3 shadow-sm border border-slate-100">
        <button onClick={() => cambiarFecha(-1)} className="p-2 rounded-xl bg-slate-50 active:bg-slate-100">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="text-center">
          <p className="font-bold text-slate-800">
            {new Date(fecha + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Fecha de Emisión</p>
        </div>
        <button onClick={() => cambiarFecha(1)} className="p-2 rounded-xl bg-slate-50 active:bg-slate-100">
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-700', bg: 'bg-slate-50' },
          { label: 'Confirm.', value: stats.confirmados, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pend.', value: stats.pendientes, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'No Emit.', value: stats.noEmitidos, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-xl p-3 text-center`}>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      {/* FILTER CHIPS */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id as FiltroEstado)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
              filtro === f.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'bg-white text-slate-500 border border-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={refresh}
          className="p-2 rounded-full bg-white border border-slate-200 active:scale-95 transition-transform shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* REGISTROS LIST */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
          <p className="text-sm font-bold text-slate-400">Cargando emisiones...</p>
        </div>
      ) : registros.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Music className="w-16 h-16 text-slate-200 mb-4" />
          <p className="font-bold text-slate-500">Sin registros para esta fecha</p>
          <p className="text-xs text-slate-400 mt-1">Prueba con otra fecha o filtro</p>
        </div>
      ) : (
        <div className="space-y-2">
          {registros.map((reg) => (
            <RegistroCard
              key={reg.id}
              registro={reg}
              onConfirm={() => confirmarEmision(reg.id)}
              onManual={() => registrarManual(reg)}
            />
          ))}
        </div>
      )}

      {/* FOOTER STATS */}
      {!loading && registros.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 text-white text-center shadow-xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-black">{stats.porcentajeEmision}%</p>
              <p className="text-[10px] font-bold uppercase opacity-70">Tasa Emisión</p>
            </div>
            <div>
              <p className="text-2xl font-black">{stats.confianzaPromedio}%</p>
              <p className="text-[10px] font-bold uppercase opacity-70">Confianza Prom.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: RegistroCard
// ═══════════════════════════════════════════════════════════════

interface RegistroCardProps {
  registro: Registro;
  onConfirm: () => void;
  onManual: () => void;
}

function RegistroCard({ registro: reg, onConfirm, onManual }: RegistroCardProps) {
  return (
    <div className={`p-4 rounded-xl border transition-all ${
      reg.confirmado ? 'border-emerald-200 bg-emerald-50/50' :
      !reg.emitido ? 'border-red-200 bg-red-50/50' :
      'border-amber-200 bg-amber-50/50'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            reg.confirmado ? 'bg-emerald-500' : !reg.emitido ? 'bg-red-500' : 'bg-amber-500'
          }`}>
            {reg.confirmado ? <CheckCircle className="w-4 h-4 text-white" /> :
             !reg.emitido ? <XCircle className="w-4 h-4 text-white" /> :
             <AlertCircle className="w-4 h-4 text-white" />}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 text-sm truncate">{reg.cunaNombre}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" /> {reg.horaProgra}
              </span>
              {reg.horaEmision && (
                <span className="text-xs text-emerald-600 font-mono">→ {reg.horaEmision}</span>
              )}
              {reg.metodo && <MetodoBadge metodo={reg.metodo} />}
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-1 shrink-0">
          {reg.confianza > 0 && (
            <span className={`text-xs font-bold ${
              reg.confianza >= 90 ? 'text-emerald-600' :
              reg.confianza >= 80 ? 'text-blue-600' :
              reg.confianza >= 60 ? 'text-amber-600' : 'text-red-600'
            }`}>{reg.confianza}%</span>
          )}
          {!reg.emitido && (
            <button onClick={onManual} className="p-2 rounded-lg bg-blue-100 text-blue-600 active:scale-90 transition-transform">
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          {reg.emitido && !reg.confirmado && (
            <button onClick={onConfirm} className="p-2 rounded-lg bg-emerald-100 text-emerald-600 active:scale-90 transition-transform">
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
