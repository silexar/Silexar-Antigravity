"use client";

import React from 'react';

export default function CortexSchedulingConfig({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* HEADER IA CONFIG */}
      <div className="flex justify-between items-center bg-slate-800/50 p-6 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="flex items-center gap-6 relative z-10">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center hover:bg-slate-700 transition-all border border-slate-700 text-xl"
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">🤖 Cortex-Scheduling Config</h2>
            <p className="text-xs text-indigo-400 font-black tracking-widest uppercase italic">Algoritmos de Redistribución Avanzada TIER 0</p>
          </div>
        </div>
        <div className="flex gap-3 relative z-10">
           <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-xl shadow-blue-600/20 hover:scale-105 transition-all">💾 GUARDAR CONFIGURACIÓN</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* PARÁMETROS DE DISTRIBUCIÓN */}
         <div className="bg-slate-900 border border-indigo-500/20 rounded-3xl p-8 space-y-8 shadow-2xl">
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest flex items-center gap-3">
               <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
               Parámetros de Distribución
            </h3>
            
            <div className="space-y-6">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Franjas Horarias Preferidas</label>
                  <div className="grid grid-cols-2 gap-3">
                     {[
                        { l: 'Prime Matinal', t: '06:00-10:00', v: true },
                        { l: 'Repartido Día', t: '10:00-18:00', v: true },
                        { l: 'Prime Vespertino', t: '18:00-22:00', v: true },
                        { l: 'Madrugada', t: '22:00-06:00', v: false }
                     ].map((f, i) => (
                        <label key={i} className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 ${f.v ? 'bg-indigo-600/10 border-indigo-500/40' : 'bg-slate-950/50 border-white/5 opacity-40'}`}>
                           <div className="flex justify-between items-center text-[10px] font-black text-white uppercase tracking-tighter">
                              {f.l}
                              <input type="checkbox" defaultChecked={f.v} className="w-3.5 h-3.5 rounded bg-slate-700 border-none text-indigo-500" />
                           </div>
                           <div className="text-[9px] text-slate-500 font-bold">{f.t}</div>
                        </label>
                     ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pesos de Optimización</label>
                  {[
                    { l: 'Horario similar original', v: 80 },
                    { l: 'Distribución equitativa', v: 70 },
                    { l: 'Evitar conflictos', v: 95 },
                    { l: 'Satisfacción cliente', v: 85 }
                  ].map((p, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between text-[10px] font-bold text-slate-400">
                          <span>{p.l}</span>
                          <span className="text-indigo-400">{p.v}%</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.v}%` }}></div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* RESTRICCIONES Y EXCLUSIVIDADES */}
         <div className="space-y-6">
            <div className="bg-slate-900 border border-red-500/10 rounded-3xl p-8 space-y-6 shadow-2xl">
               <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
                  Restricciones Críticas
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase">Separación Mín (Cliente)</label>
                     <input type="text" defaultValue="15 min" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase">Máx spots por hora</label>
                     <input type="number" defaultValue="8" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase">Tolerancia Timing Original</label>
                     <select className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white">
                        <option>± 30 minutos</option>
                        <option>± 1 hora</option>
                        <option selected>± 2 horas</option>
                        <option>Día completo</option>
                     </select>
                  </div>
               </div>
            </div>

            <div className="bg-emerald-600/5 border border-emerald-500/20 rounded-3xl p-8 space-y-6 shadow-2xl">
               <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                  Exclusividades por Categoría
               </h3>
               <div className="space-y-4">
                  {[
                     { l: 'Automotriz', t: '30 min separación', v: true },
                     { l: 'Telecomunicaciones', t: '15 min separación', v: true },
                     { l: 'Bancos', t: '20 min separación', v: true },
                     { l: 'Retail', t: '10 min separación', v: true }
                  ].map((e, i) => (
                     <div key={i} className="flex justify-between items-center bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                        <div>
                           <div className="text-xs font-black text-white uppercase tracking-tighter">{e.l}</div>
                           <div className="text-[9px] text-slate-500 font-bold">{e.t}</div>
                        </div>
                        <input type="checkbox" defaultChecked={e.v} className="w-10 h-5 bg-slate-800 rounded-full appearance-none checked:bg-emerald-500 transition-colors cursor-pointer" />
                     </div>
                  ))}
               </div>
               <button className="w-full bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-all mt-4">🧪 TEST ALGORITMO DE COLISIÓN</button>
            </div>
         </div>
      </div>
    </div>
  );
}
