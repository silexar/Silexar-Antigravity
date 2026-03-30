'use client';

import React from 'react';
import { Landmark, TrendingUp, Search, Plus, ListFilter, ChevronRight, RefreshCw } from 'lucide-react';
import { AgenciaMedios } from '../page';

interface DashboardProps {
  stats: {
    total: number;
    activas: number;
    inactiva: number;
  };
  recentAgencias: AgenciaMedios[];
  onRefresh: () => void;
  onOpenNuevo: () => void;
  onOpenList: () => void;
  loading: boolean;
}

export const MobileMediosDashboard: React.FC<DashboardProps> = ({ 
  stats, recentAgencias, onRefresh, onOpenNuevo, onOpenList, loading 
}) => {
  return (
    <div className="space-y-6 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Agencias de Medios</h2>
          <p className="text-xs text-slate-500">Gestión de compra e intermediación</p>
        </div>
        <button 
          onClick={onRefresh}
          className={`p-2.5 rounded-full bg-white shadow-[2px_2px_8px_rgba(0,0,0,0.05),-2px_-2px_8px_rgba(255,255,255,0.8)] text-indigo-500 active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)] ${loading ? 'animate-spin text-slate-400' : ''}`}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 rounded-3xl p-5 bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-[8px_8px_16px_rgba(99,102,241,0.3),-4px_-4px_12px_rgba(255,255,255,0.8)] relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-indigo-100 text-sm font-medium mb-1">Total Agencias Medios</p>
              <h3 className="text-4xl font-extrabold text-white">{stats.total}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Landmark className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl p-5 bg-gradient-to-br from-slate-50 to-slate-100 shadow-md shadow-slate-200/50 border border-white/60">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <h4 className="text-2xl font-bold text-slate-800">{stats.activas}</h4>
          <p className="text-xs text-slate-500 font-medium mt-1">Operativas</p>
        </div>
        
        <div className="rounded-3xl p-5 bg-gradient-to-br from-slate-50 to-slate-100 shadow-md shadow-slate-200/50 border border-white/60">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
            <ListFilter className="w-5 h-5 text-blue-600" />
          </div>
          <h4 className="text-2xl font-bold text-slate-800">12.5%</h4>
          <p className="text-xs text-slate-500 font-medium mt-1">Com. Promedio</p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">Accesos Rápidos</h3>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
        {[
          { icon: Plus, label: "Registrar", color: "text-indigo-600", bg: "bg-indigo-100", action: onOpenNuevo },
          { icon: Search, label: "Buscar", color: "text-blue-600", bg: "bg-blue-100", action: onOpenList },
          { icon: Landmark, label: "Holdings", color: "text-emerald-600", bg: "bg-emerald-100", action: onOpenList },
        ].map((btn, idx) => (
          <button 
            key={idx}
            onClick={btn.action}
            className="flex flex-col items-center justify-center min-w-[80px] p-4 rounded-3xl bg-slate-50 shadow-sm shadow-slate-200/50 border border-white/60 transition-all flex-shrink-0"
          >
            <div className={`w-12 h-12 rounded-full ${btn.bg} flex items-center justify-center mb-2`}>
              <btn.icon className={`w-5 h-5 ${btn.color}`} />
            </div>
            <span className="text-xs font-semibold text-slate-600">{btn.label}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-between items-end mt-4 mb-4">
        <h3 className="text-lg font-bold text-slate-800">Recientes</h3>
        <button onClick={onOpenList} className="text-sm font-semibold text-indigo-600">Ver todas</button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando...</p>
        ) : recentAgencias.length === 0 ? (
          <div className="p-6 text-center rounded-3xl bg-slate-50 border border-dashed border-slate-200">
            <Landmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No hay agencias recientes</p>
          </div>
        ) : (
          recentAgencias.map(agencia => (
            <div 
              key={agencia.id}
              className="flex items-center p-4 rounded-3xl bg-slate-50 shadow-sm shadow-slate-200/50 border border-white/60 active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shadow-inner bg-indigo-100 text-indigo-600">
                <Landmark className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 truncate">{agencia.nombreRazonSocial}</h4>
                <p className="text-xs text-slate-500 truncate mt-0.5">{agencia.tipoAgencia} • {agencia.comisionPorcentaje}% com. </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          ))
        )}
      </div>

    </div>
  );
};
