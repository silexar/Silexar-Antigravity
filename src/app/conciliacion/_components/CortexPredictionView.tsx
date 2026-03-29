"use client";

import React from 'react';

export default function CortexPredictionView({ onBack }: { onBack: () => void }) {
  const predictions = [
    { station: 'Sonar FM', time: 'Viernes 14:00', prob: '85%', cause: 'Falla Técnica Recurrente', recommendation: 'Mantenimiento Preventivo Dalet Sector 4' },
    { station: 'Radio Corazón', time: 'Hoy 18:30', prob: '65%', cause: 'Conflicto Exclusividad Automotriz', recommendation: 'Mover spot Chevrolet 15 min después' },
    { station: 'Play FM', time: 'Mañana 09:15', prob: '40%', cause: 'Timing Ajustado Bloque Prime', recommendation: 'Revisar duración jingle promocional' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
      {/* HEADER PREDICCIÓN */}
      <div className="flex justify-between items-center bg-indigo-950/30 p-6 rounded-2xl border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="flex items-center gap-6 relative z-10">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center hover:bg-slate-700 transition-all border border-slate-700 text-xl"
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">✨ Cortex-Prediction IA</h2>
            <p className="text-xs text-indigo-400 font-black tracking-widest uppercase">Monitoreo Proactivo de Fallas (48h)</p>
          </div>
        </div>
        <div className="text-right relative z-10">
           <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Estado de Inteligencia</div>
           <div className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">ESCANEANDO GRID ✅</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* MÉTRICAS DE RIESGO */}
         <div className="space-y-4">
            <div className="bg-slate-900 p-8 rounded-3xl border border-white/5 shadow-2xl text-center">
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Nivel de Riesgo Global</div>
               <div className="text-6xl font-black text-amber-500 mb-2">3.4</div>
               <div className="text-xs font-bold text-slate-400 uppercase">MODERADO</div>
               <div className="w-full h-2 bg-slate-800 rounded-full mt-6 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full" style={{ width: '34%' }}></div>
               </div>
            </div>

            <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
               <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Capacidad Predictiva</h3>
               <div className="flex justify-between items-end border-b border-indigo-500/20 pb-4">
                  <div>
                     <div className="text-3xl font-black text-white">92%</div>
                     <div className="text-[9px] text-slate-500 font-bold uppercase">Precisión Histórica</div>
                  </div>
                  <div className="w-20 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                     <div className="w-16 h-1 bg-indigo-500 rounded-full group-hover:bg-white animate-pulse"></div>
                  </div>
               </div>
               <p className="text-[10px] text-slate-400 leading-relaxed italic">"El motor ha analizado 2.4M de registros históricos de Dalet para identificar correlaciones entre hardware y errores de emisión."</p>
            </div>
         </div>

         {/* LISTA DE PREDICCIONES */}
         <div className="lg:col-span-2 space-y-6">
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest flex items-center gap-3">
               <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
               Fallas Potenciales Detectadas
            </h3>
            <div className="space-y-4">
               {predictions.map((p, i) => (
                  <div key={i} className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row gap-6 hover:bg-slate-900 transition-all border-l-4 border-l-indigo-500">
                     <div className="md:w-48 shrink-0">
                        <div className="text-lg font-black text-white uppercase">{p.station}</div>
                        <div className="text-xs text-indigo-400 font-bold">{p.time}</div>
                     </div>
                     <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-center mb-1">
                           <div className="text-[10px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded uppercase">{p.cause}</div>
                           <div className="text-xl font-black text-white">{p.prob} <span className="text-[10px] text-slate-500 uppercase">Probabilidad</span></div>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                           <div className="text-xl">✨</div>
                           <div>
                              <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Recomendación IA</div>
                              <p className="text-xs text-slate-300 font-medium">{p.recommendation}</p>
                           </div>
                        </div>
                     </div>
                     <div className="flex flex-col justify-center">
                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-2xl transition-all shadow-lg active:scale-95">
                           APLICAR FIX
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
