/**
 * 📋 MOBILE: Vista de Contratos
 * 
 * Lista completa con búsqueda, filtros por urgencia, cards con acciones
 * rápidas (aprobar, llamar, email). Paridad 1:1 con desktop.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  Search, Filter, CheckCircle2, Phone, Mail, AlertTriangle,
  ChevronRight, RefreshCw, FileText, Clock, Star
} from 'lucide-react';
import type { ContratoMobile, FiltroUrgencia } from '../../_shared/types';
import { FILTROS_URGENCIA } from '../../_shared/types';
import { useContratosLista, useContratosAcciones, formatCurrency } from '../../_shared/useContratos';

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function MobileContratosView() {
  const {
    contratos, loading, search, filtroUrgencia,
    setSearch, setFiltroUrgencia, refresh,
  } = useContratosLista();

  const { aprobar, processing } = useContratosAcciones();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-5">
      {/* SEARCH */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar contrato, cliente..."
            aria-label="Buscar contrato o cliente"
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold focus:ring-2 focus:ring-indigo-400 outline-none text-base"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3.5 rounded-xl border transition-all active:scale-90 ${
            showFilters ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-500'
          }`}
        >
          <Filter className="w-5 h-5" />
        </button>
        <button onClick={refresh} className="p-3.5 rounded-xl bg-white border border-slate-200 active:scale-90">
          <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* FILTER CHIPS */}
      {showFilters && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTROS_URGENCIA.map(f => (
            <button
              key={f.id}
              onClick={() => setFiltroUrgencia(f.id as FiltroUrgencia)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                filtroUrgencia === f.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white text-slate-500 border border-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* RESULTS COUNT */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {contratos.length} contrato{contratos.length !== 1 ? 's' : ''}
        </p>
        {filtroUrgencia !== 'todos' && (
          <button onClick={() => setFiltroUrgencia('todos')} className="text-xs text-indigo-600 font-bold">
            Limpiar filtro
          </button>
        )}
      </div>

      {/* LIST */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
          <p className="text-sm font-bold text-slate-400">Cargando contratos...</p>
        </div>
      ) : contratos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <FileText className="w-16 h-16 text-slate-200 mb-4" />
          <p className="font-bold text-slate-500">Sin contratos</p>
          <p className="text-xs text-slate-400 mt-1">Prueba cambiando los filtros</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contratos.map(contrato => (
            <ContratoCard
              key={contrato.id}
              contrato={contrato}
              onAprobar={() => aprobar(contrato.id)}
              processingAction={processing}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: ContratoCard
// ═══════════════════════════════════════════════════════════════

function ContratoCard({ contrato, onAprobar, processingAction }: {
  contrato: ContratoMobile;
  onAprobar: () => void;
  processingAction: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const urgenciaStyles = {
    alta: 'border-l-red-500',
    media: 'border-l-amber-500',
    normal: 'border-l-slate-300',
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-100 border-l-4 ${urgenciaStyles[contrato.urgencia]} shadow-sm overflow-hidden`}>
      {/* MAIN ROW */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left active:bg-slate-50 transition-colors"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-800 text-sm truncate">{contrato.cliente.nombre}</p>
              {contrato.alertas > 0 && (
                <span className="w-5 h-5 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                  {contrato.alertas}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate">{contrato.titulo}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-slate-800 text-sm">{formatCurrency(contrato.valor)}</p>
            <p className="text-[10px] text-slate-400 font-mono">{contrato.numero}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: contrato.estadoColor }}
            >
              {contrato.estado}
            </span>
            {contrato.diasRestantes > 0 && (
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {contrato.diasRestantes}d
              </span>
            )}
          </div>
          <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>

        {/* PROGRESS BAR */}
        {contrato.progreso > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${contrato.progreso}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400">{contrato.progreso}%</span>
          </div>
        )}
      </button>

      {/* EXPANDED ACTIONS */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3">
          <div className="text-xs text-slate-500">
            <span className="font-bold text-slate-600">Ejecutivo:</span> {contrato.ejecutivo.nombre}
          </div>

          <div className="flex gap-2 flex-wrap">
            {contrato.acciones.filter(a => a.disponible).map(accion => (
              <ActionButton
                key={accion.id}
                accion={accion}
                onPress={accion.tipo === 'aprobar' ? onAprobar : undefined}
                disabled={processingAction}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: ActionButton
// ═══════════════════════════════════════════════════════════════

function ActionButton({ accion, onPress, disabled }: {
  accion: ContratoMobile['acciones'][0];
  onPress?: () => void;
  disabled?: boolean;
}) {
  const iconMap: Record<string, React.ReactNode> = {
    aprobar: <CheckCircle2 className="w-3.5 h-3.5" />,
    rechazar: <AlertTriangle className="w-3.5 h-3.5" />,
    firmar: <Star className="w-3.5 h-3.5" />,
    llamar: <Phone className="w-3.5 h-3.5" />,
    email: <Mail className="w-3.5 h-3.5" />,
  };

  const colorMap: Record<string, string> = {
    aprobar: 'bg-emerald-100 text-emerald-700',
    rechazar: 'bg-red-100 text-red-700',
    firmar: 'bg-purple-100 text-purple-700',
    llamar: 'bg-blue-100 text-blue-700',
    email: 'bg-amber-100 text-amber-700',
  };

  return (
    <button
      onClick={onPress}
      disabled={disabled}
      className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50 ${
        colorMap[accion.tipo] || 'bg-slate-100 text-slate-600'
      }`}
    >
      {iconMap[accion.tipo]}
      {accion.label}
    </button>
  );
}
