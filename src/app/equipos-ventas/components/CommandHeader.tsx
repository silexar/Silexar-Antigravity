/**
 * COMPONENT: COMMAND HEADER (AI INTELLIGENCE)
 */

import React from 'react';
import { Sparkles, Target } from 'lucide-react';

export const CommandHeader = () => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-700">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="text-orange-400" /> INTELIGENCIA DE FUERZA DE VENTAS
          </h2>
          <p className="text-slate-400 text-sm mt-1">Análisis en Tiempo Real • Última actualización hace 2 min</p>
        </div>
        <div className="flex gap-4">
           {/* Quick Stats Grid */}
           <div className="flex gap-8 text-center pr-8 border-r border-slate-700">
              <div>
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Equipos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">89</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Vendedores</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">$847M</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Pipeline</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">156%</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Quota</p>
              </div>
           </div>
           
           <div className="flex gap-8 text-center pl-4">
               <div>
                  <p className="text-xl font-semibold text-white">94%</p>
                  <p className="text-xs text-slate-400">Retention</p>
               </div>
               <div>
                  <p className="text-xl font-semibold text-white">$2.3M</p>
                  <p className="text-xs text-slate-400">ARR/Rep</p>
               </div>
           </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 flex items-center gap-3">
           <div className="bg-orange-500/20 p-2 rounded-lg">
             <Target className="text-orange-400" size={20} />
           </div>
           <div>
             <p className="text-orange-200 text-xs font-bold uppercase">Top Acción Recomendada</p>
             <p className="text-white font-medium text-sm">Equipo Digital necesita <span className="text-orange-400 font-bold">2 SDRs HOY</span> (94% load efficiency)</p>
           </div>
           <button className="ml-auto bg-orange-600 hover:bg-orange-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors">
             Aprobar
           </button>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 flex items-center gap-3">
           <div className="bg-blue-500/20 p-2 rounded-lg">
             <Sparkles className="text-blue-400" size={20} />
           </div>
           <div>
             <p className="text-blue-200 text-xs font-bold uppercase">Predicción IA Cortex</p>
             <p className="text-white font-medium text-sm">Detectados <span className="text-red-400 font-bold">5 reps en riesgo</span> y <span className="text-emerald-400 font-bold">12 listos para promotion</span></p>
           </div>
           <button className="ml-auto bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors">
             Ver detalles
           </button>
        </div>
      </div>
    </div>
  );
};
