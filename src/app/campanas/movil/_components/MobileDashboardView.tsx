/**
 * 🎯 SILEXAR PULSE — Campañas Mobile: Dashboard View
 * 
 * Vista de métricas y resumen general para móviles.
 * 
 * @module campanas/movil/components
 * @version 2026.3.0
 */

import React from 'react';
import { 
  TrendingUp, AlertTriangle, 
  CheckCircle2, Clock, Activity, Zap 
} from 'lucide-react';
import { CampanasStats } from '../../_lib/types';

interface MobileDashboardViewProps {
  stats: CampanasStats;
  onNavigate?: (tab: string) => void;
}

export function MobileDashboardView({ stats, onNavigate }: MobileDashboardViewProps) {
  // Helpers locales para UI neuromórfica
  const NeumoCard = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <div className={`
      bg-white rounded-3xl p-5
      shadow-[8px_8px_16px_#e6e9ef,-8px_-8px_16px_#ffffff]
      border border-white/40 ${className}
    `}>
      {children}
    </div>
  );

  const StatBox = ({ title, value, icon: Icon, colorClass, tabDestino }: { title: string; value: number; icon: React.ElementType; colorClass: string; tabDestino?: string }) => (
    <div 
      className="
        bg-white/50 rounded-2xl p-4
        shadow-[inset_4px_4px_8px_#e6e9ef,inset_-4px_-4px_8px_#ffffff]
        flex flex-col gap-2 cursor-pointer active:scale-95 transition-transform
      "
      onClick={() => onNavigate && tabDestino && onNavigate(tabDestino)}
    >
      <div className="flex justify-between items-start">
        <Icon className={`w-5 h-5 ${colorClass}`} />
        <span className="text-2xl font-bold text-gray-800">{value}</span>
      </div>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</span>
    </div>
  );

  return (
    <div className="space-y-6 pb-24">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Mi Rendimiento</h2>
          <p className="text-sm text-gray-500">Resumen de campañas activas</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shadow-[4px_4px_8px_#e6e9ef,-4px_-4px_8px_#ffffff]">
          <Activity className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      {/* METRICAS PRINCIPALES */}
      <NeumoCard>
        <div className="grid grid-cols-2 gap-4">
          <StatBox 
            title="Activas" 
            value={stats.activas} 
            icon={Zap} 
            colorClass="text-blue-500" 
            tabDestino="campanas"
          />
          <StatBox 
            title="Con Alertas" 
            value={stats.alertas} 
            icon={AlertTriangle} 
            colorClass="text-rose-500" 
            tabDestino="alertas"
          />
          <StatBox 
            title="Planificando" 
            value={stats.planificando} 
            icon={Clock} 
            colorClass="text-amber-500" 
            tabDestino="campanas"
          />
          <StatBox 
            title="Completadas" 
            value={stats.total - (stats.activas + stats.planificando + stats.alertas)} 
            icon={CheckCircle2} 
            colorClass="text-emerald-500" 
            tabDestino="campanas"
          />
        </div>
      </NeumoCard>

      {/* CUMPLIMIENTO GLOBAL */}
      <NeumoCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Cumplimiento Global
          </h3>
          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">
            +{Math.round(stats.cumplimientoPromedio / 10)}%
          </span>
        </div>
        
        <div className="flex items-end gap-2 mb-2">
          <span className="text-4xl font-black text-gray-800 tracking-tight">
            {stats.cumplimientoPromedio}%
          </span>
          <span className="text-sm text-gray-500 mb-1 font-medium">promedio</span>
        </div>
        
        {/* Barra de progreso neuromórfica */}
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${stats.cumplimientoPromedio}%` }}
          />
        </div>
      </NeumoCard>

      {/* VALOR TOTAL */}
      <NeumoCard className="bg-gradient-to-br from-blue-600 to-indigo-700 border-none">
        <div className="text-blue-100 text-sm font-medium mb-1">Valor Total Gestionado</div>
        <div className="text-3xl font-black text-white flex items-center gap-2">
          <span className="text-blue-300">$</span>
          {(stats.valorTotal / 1000000).toFixed(1)}M
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-xs text-blue-200">
          <span>{stats.total} campañas en total</span>
          <span className="flex items-center gap-1 text-emerald-300">
            <TrendingUp className="w-3 h-3" /> +12% vs mes ant.
          </span>
        </div>
      </NeumoCard>
    </div>
  );
}
