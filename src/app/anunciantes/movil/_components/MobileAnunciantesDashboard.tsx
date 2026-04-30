'use client';

import React from 'react';
import { Building2, TrendingUp, AlertCircle, Plus, Search, Filter, ChevronRight, RefreshCw } from 'lucide-react';
import { Anunciante } from '../page';

interface DashboardProps {
  stats: {
    total: number;
    activos: number;
    inactivos: number;
  };
  recentAnunciantes: Anunciante[];
  onRefresh: () => void;
  onOpenNuevo: () => void;
  onOpenList: () => void;
  onOpenDetail: (id: string) => void;
  loading: boolean;
}

export const MobileAnunciantesDashboard: React.FC<DashboardProps> = ({ 
  stats, recentAnunciantes, onRefresh, onOpenNuevo, onOpenList, onOpenDetail, loading 
}) => {
  return (
    <div className="space-y-6 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Resumen */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-xl font-bold text-[#9aa3b8]">Resumen General</h2>
          <p className="text-xs text-[#69738c]">Métricas de anunciantes en tiempo real</p>
        </div>
        <button 
          onClick={onRefresh}
          className={`p-2.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/60 shadow-sm active:scale-95 text-[#6888ff] ${loading ? 'animate-spin text-[#9aa3b8]' : ''}`}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tarjetas de Métricas (Neumórficas) */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total (Ocupa las 2 columnas en mobile a veces, o 1. Haremos 1 grande y 2 chicas) */}
        <div className="col-span-2 rounded-3xl p-5 bg-gradient-to-br from-[#6888ff] to-[#5572ee] shadow-lg shadow-blue-200/50 border border-white/20 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[#6888ff] text-sm font-medium mb-1">Total Anunciantes</p>
              <h3 className="text-4xl font-extrabold text-white">{stats.total}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Activos */}
        <div className="rounded-3xl p-5 bg-white/60 backdrop-blur-xl shadow-sm border border-white/60">
          <div className="w-10 h-10 rounded-xl bg-[#6888ff]/10 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-[#6888ff]" />
          </div>
          <h4 className="text-2xl font-bold text-[#9aa3b8]">{stats.activos}</h4>
          <p className="text-xs text-[#69738c] font-medium mt-1">Activos</p>
        </div>

        {/* Inactivos */}
        <div className="rounded-3xl p-5 bg-white/60 backdrop-blur-xl shadow-sm border border-white/60">
          <div className="w-10 h-10 rounded-xl bg-[#6888ff]/10 flex items-center justify-center mb-3">
            <AlertCircle className="w-5 h-5 text-[#6888ff]" />
          </div>
          <h4 className="text-2xl font-bold text-[#9aa3b8]">{stats.inactivos}</h4>
          <p className="text-xs text-[#69738c] font-medium mt-1">Inactivos</p>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <h3 className="text-lg font-bold text-[#9aa3b8] mt-8 mb-4">Acciones Rápidas</h3>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
        {[
          { icon: Plus, label: "Nuevo", color: "text-[#6888ff]", bg: "bg-[#6888ff]/10", action: onOpenNuevo },
          { icon: Search, label: "Buscar", color: "text-[#6888ff]", bg: "bg-[#6888ff]/10", action: onOpenList },
          { icon: Filter, label: "Filtrar", color: "text-[#6888ff]", bg: "bg-[#6888ff]/10", action: onOpenList },
        ].map((btn, idx) => (
          <button 
            key={idx}
            onClick={btn.action}
            className="flex flex-col items-center justify-center min-w-[80px] p-4 rounded-3xl bg-white/60 backdrop-blur-sm shadow-sm border border-white/60 active:scale-95 transition-all flex-shrink-0"
          >
            <div className={`w-12 h-12 rounded-full ${btn.bg} flex items-center justify-center mb-2`}>
              <btn.icon className={`w-5 h-5 ${btn.color}`} />
            </div>
            <span className="text-xs font-semibold text-[#69738c]">{btn.label}</span>
          </button>
        ))}
      </div>

      {/* Recientes */}
      <div className="flex justify-between items-end mt-4 mb-4">
        <h3 className="text-lg font-bold text-[#9aa3b8]">Agregados Recientemente</h3>
        <button onClick={onOpenList} className="text-sm font-semibold text-[#6888ff]">Ver todos</button>
      </div>

      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={`skeleton-${i}`} className="animate-pulse flex items-center p-4 rounded-2xl bg-white shadow-sm border border-[#bec8de]">
              <div className="w-10 h-10 bg-[#dfeaff] rounded-xl mr-4" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#dfeaff] rounded w-1/2" />
                <div className="h-3 bg-[#dfeaff] rounded w-1/3" />
              </div>
            </div>
          ))
        ) : recentAnunciantes.length === 0 ? (
          <div className="p-6 text-center rounded-3xl bg-[#dfeaff] border border-dashed border-[#bec8de]">
            <Building2 className="w-8 h-8 text-[#9aa3b8] mx-auto mb-2" />
            <p className="text-[#69738c] text-sm">No hay anunciantes recientes</p>
          </div>
        ) : (
          recentAnunciantes.map(anunciante => (
            <div 
              key={anunciante.id}
              onClick={() => onOpenDetail(anunciante.id)}
              className="flex items-center p-4 rounded-3xl bg-white/60 backdrop-blur-sm shadow-sm border border-white/60 active:scale-95 transition-transform"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shadow-inner ${
                anunciante.activo ? 'bg-[#6888ff]/10 text-[#6888ff]' : 'bg-[#dfeaff] text-[#69738c]'
              }`}>
                <Building2 className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-[#9aa3b8] truncate">{anunciante.nombreRazonSocial}</h4>
                <p className="text-xs text-[#69738c] truncate mt-0.5">{anunciante.codigo} • {anunciante.rut}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#9aa3b8]" />
            </div>
          ))
        )}
      </div>

    </div>
  );
};
