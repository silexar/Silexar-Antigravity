'use client';

import React from 'react';
import { Palette, TrendingUp, Search, Plus, Award, ChevronRight, RefreshCw, FolderOpen } from 'lucide-react';
import { AgenciaCreativa } from '../page';

interface DashboardProps {
  stats: {
    total: number;
    activas: number;
    scorePromedio: number;
  };
  recentAgencias: AgenciaCreativa[];
  onRefresh: () => void;
  onOpenNuevo: () => void;
  onOpenList: () => void;
  loading: boolean;
}

export const MobileCreativasDashboard: React.FC<DashboardProps> = ({ 
  stats, recentAgencias, onRefresh, onOpenNuevo, onOpenList, loading 
}) => {
  return (
    <div className="space-y-6 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Dirección Creativa</h2>
          <p className="text-xs text-slate-500">Supervisión de talento y campañas</p>
        </div>
        <button 
          onClick={onRefresh}
          className={`p-2.5 rounded-full bg-white shadow-[2px_2px_8px_rgba(0,0,0,0.05),-2px_-2px_8px_rgba(255,255,255,0.8)] text-pink-500 active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)] ${loading ? 'animate-spin text-slate-400' : ''}`}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 rounded-3xl p-5 bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-200/50 border border-white/20 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-pink-100 text-sm font-medium mb-1">Red Creativa Global</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-extrabold text-white">{stats.total}</h3>
                <span className="text-pink-200 text-sm font-medium">Partners</span>
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm shadow-inner">
              <Palette className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl p-5 bg-white/60 backdrop-blur-xl shadow-sm shadow-slate-200/50 border border-white/60">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <h4 className="text-2xl font-bold text-slate-800">{stats.activas}</h4>
          <p className="text-xs text-slate-500 font-medium mt-1">Activas</p>
        </div>
        
        <div className="rounded-3xl p-5 bg-white/60 backdrop-blur-xl shadow-sm shadow-slate-200/50 border border-white/60">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
            <Award className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <h4 className="text-2xl font-bold text-slate-800">{stats.scorePromedio.toFixed(1)}</h4>
            <span className="text-xs font-bold text-slate-400">/ 10</span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">Quality Score</p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">Herramientas</h3>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
        {[
          { icon: Plus, label: "Partner", color: "text-pink-600", bg: "bg-pink-100", action: onOpenNuevo },
          { icon: Search, label: "Buscar", color: "text-purple-600", bg: "bg-purple-100", action: onOpenList },
          { icon: FolderOpen, label: "Piezas", color: "text-orange-600", bg: "bg-orange-100", action: onOpenList },
        ].map((btn, idx) => (
          <button 
            key={idx}
            onClick={btn.action}
            className="flex flex-col items-center justify-center min-w-[80px] p-4 rounded-3xl bg-white/60 backdrop-blur-sm shadow-sm shadow-slate-200/50 border border-white/60 transition-all flex-shrink-0"
          >
            <div className={`w-12 h-12 rounded-full ${btn.bg} flex items-center justify-center mb-2`}>
              <btn.icon className={`w-5 h-5 ${btn.color}`} />
            </div>
            <span className="text-xs font-semibold text-slate-600">{btn.label}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-between items-end mt-4 mb-4">
        <h3 className="text-lg font-bold text-slate-800">Top Rendimiento</h3>
        <button onClick={onOpenList} className="text-sm font-semibold text-pink-600">Ver Catálogo</button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando...</p>
        ) : recentAgencias.length === 0 ? (
          <div className="p-6 text-center rounded-3xl bg-slate-50 border border-dashed border-slate-200">
            <Palette className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No hay agencias disponibles</p>
          </div>
        ) : (
          recentAgencias.map((agencia, idx) => (
            <div 
              key={agencia.id}
              className="flex items-center p-4 rounded-3xl bg-white/60 backdrop-blur-sm shadow-md shadow-slate-200/50 active:scale-[0.98] transition-transform border border-white/60 relative overflow-hidden"
            >
              {idx === 0 && <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-300 to-transparent opacity-20 pointer-events-none" />}
              
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shadow-inner bg-pink-100 text-pink-600 relative">
                {idx === 0 && <Award className="w-3.5 h-3.5 text-amber-500 absolute -top-1 -right-1" />}
                <Palette className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 truncate">{agencia.razonSocial}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-slate-500 truncate">{agencia.tipoAgencia}</p>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5"><Award className="w-3 h-3"/>{agencia.scoreRendimiento}/10</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          ))
        )}
      </div>

    </div>
  );
};
