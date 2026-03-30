/**
 * 🎯 SILEXAR PULSE — Cuñas Mobile: Dashboard View
 * 
 * Vista de métricas y resumen operativo para móviles.
 * 
 * @module cunas/movil/components
 * @version 2026.3.0
 */

import React from 'react';
import { 
  Activity, AlertTriangle, CheckCircle2, 
  Radio, Clock, TrendingUp
} from 'lucide-react';
import { MetricasOperativas, AlertaOperativa } from '../../_lib/types';

interface MobileCunasDashboardProps {
  metricas: MetricasOperativas;
  alertas: AlertaOperativa[];
}

export function MobileCunasDashboard({ metricas, alertas }: MobileCunasDashboardProps) {
  const NeumoCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`
      bg-white rounded-3xl p-5
      shadow-[8px_8px_16px_#e6e9ef,-8px_-8px_16px_#ffffff]
      border border-white/40 ${className}
    `}>
      {children}
    </div>
  );

  const StatBox = ({ title, value, icon: Icon, colorClass }: { title: string; value: number | string; icon: React.ElementType; colorClass: string }) => (
    <div className="
      bg-white/50 rounded-2xl p-4
      shadow-[inset_4px_4px_8px_#e6e9ef,inset_-4px_-4px_8px_#ffffff]
      flex flex-col gap-2
    ">
      <div className="flex justify-between items-start">
        <Icon className={`w-5 h-5 ${colorClass}`} />
        <span className="text-2xl font-bold text-gray-800">{value}</span>
      </div>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</span>
    </div>
  );

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Centro de Operaciones</h2>
          <p className="text-sm text-gray-500">Métricas en tiempo real</p>
        </div>
        <div className="relative">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shadow-[4px_4px_8px_#e6e9ef,-4px_-4px_8px_#ffffff]">
            <Radio className="w-5 h-5 text-blue-600" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 border-2 border-white"></span>
          </span>
        </div>
      </div>

      {alertas.length > 0 && (
        <div className="bg-rose-50 border border-rose-100/50 p-4 rounded-3xl shadow-[4px_4px_10px_#fde2e4,-4px_-4px_10px_#ffffff]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <h3 className="font-bold text-rose-900">Alertas Operativas ({alertas.length})</h3>
          </div>
          <div className="space-y-2">
            {alertas.map(a => (
              <div key={a.id} className="bg-white/60 p-3 rounded-2xl flex justify-between items-center shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-rose-600 uppercase mb-0.5 block">{a.cunaCodigo || a.tipo}</span>
                  <p className="text-xs text-rose-900 font-medium leading-tight">{a.mensaje}</p>
                </div>
                <button className="px-3 py-1.5 bg-rose-600 text-white text-[10px] font-bold rounded-lg ml-2 shrink-0 shadow-md">
                  {a.accion}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <NeumoCard>
        <div className="grid grid-cols-2 gap-4">
          <StatBox title="En Aire (FM)" value={metricas.enAire} icon={Activity} colorClass="text-emerald-500" />
          <StatBox title="Por Validar" value={metricas.pendientesValidacion} icon={Clock} colorClass="text-amber-500" />
          <StatBox title="Por Vencer" value={metricas.porVencer} icon={AlertTriangle} colorClass="text-rose-500" />
          <StatBox title="Aprobación" value={`${metricas.tasaAprobacion}%`} icon={CheckCircle2} colorClass="text-blue-500" />
        </div>
      </NeumoCard>

      <NeumoCard className="bg-gradient-to-br from-indigo-600 to-purple-700 border-none">
        <div className="text-indigo-100 text-sm font-medium mb-1">Total Emisiones Hoy</div>
        <div className="text-3xl font-black text-white flex items-center gap-2">
          {metricas.emisionesHoy.toLocaleString()}
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-xs text-indigo-200">
          <span>{metricas.totalCunas} cuñas activas</span>
          <span className="flex items-center gap-1 text-emerald-300">
            <TrendingUp className="w-3 h-3" /> +{metricas.cambioVsAyer}% vs ayer
          </span>
        </div>
      </NeumoCard>
    </div>
  );
}
