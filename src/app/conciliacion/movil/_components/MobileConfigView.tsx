"use client";

import React, { useState } from 'react';

export default function MobileConfigView({ onBack }: { onBack: () => void }) {
  const [station, setStation] = useState('Radio Corazón');

  return (
    <div className="space-y-6 pb-24 animate-in slide-in-from-right-10 duration-500">
      {/* HEADER MÓVIL */}
      <header className="flex justify-between items-center bg-slate-900 -mx-4 px-4 py-3 border-b border-white/5 sticky top-[-16px] z-[60]">
         <button onClick={onBack} className="text-slate-400 text-xs font-bold uppercase tracking-widest">← Volver</button>
         <div className="text-center">
            <div className="text-xs font-black text-blue-400 uppercase">SETUP OPERATIVO</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{station}</div>
         </div>
         <div className="w-8"></div>
      </header>

      {/* SELECTOR EMISORA MÓVIL */}
      <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl shadow-xl">
         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Emisora a Configurar</label>
         <select 
           value={station}
           onChange={(e) => setStation(e.target.value)}
           className="w-full bg-slate-800 border-none rounded-xl text-sm font-bold text-white py-3 px-4 outline-none ring-1 ring-white/5 focus:ring-blue-500"
         >
            <option>Radio Corazón</option>
            <option>Play FM</option>
            <option>Sonar FM</option>
         </select>
      </div>

      {/* RUTA SECCIÓN MÓVIL */}
      <div className="bg-slate-900 p-5 rounded-3xl border border-white/5 space-y-4">
         <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📁</span>
            <span className="text-[10px] font-black text-slate-100 uppercase tracking-widest">Ruta y Sincronización</span>
         </div>
         <div className="space-y-4">
            <div className="space-y-1">
               <label className="text-[8px] font-black text-slate-500 uppercase">Ruta Base</label>
               <input type="text" defaultValue="\\dalet-server\exports\radio_corazon\" className="w-full bg-slate-800 border border-white/5 rounded-xl py-3 px-4 text-[11px] text-slate-300" />
            </div>
            <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-500 uppercase">Sync Cada</label>
                  <select className="w-full bg-slate-800 border border-white/5 rounded-xl py-3 px-4 text-[11px] text-white">
                     <option>15 min</option>
                     <option>30 min</option>
                  </select>
               </div>
               <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-500 uppercase">Tolerancia</label>
                  <input type="number" defaultValue="30" className="w-full bg-slate-800 border border-white/5 rounded-xl py-3 px-4 text-[11px] text-white" />
               </div>
            </div>
         </div>
         <button className="w-full bg-blue-600/10 border border-blue-500/30 text-blue-400 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">🧪 TEST CONEXIÓN</button>
      </div>

      {/* IA CONFIG MÓVIL */}
      <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-3xl p-5 space-y-4">
         <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🤖</span>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">IA & Automatización</span>
         </div>
         <div className="space-y-2">
            {[
              { l: 'Recuperación Auto.', active: true },
              { l: 'Distribución Inteligente', active: true },
              { l: 'Filtros Exclusividad', active: true }
            ].map((ia, i) => (
               <div key={i} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl">
                  <span className="text-xs text-slate-300 font-bold">{ia.l}</span>
                  <input type="checkbox" defaultChecked={ia.active} className="w-8 h-4 bg-slate-700 rounded-full appearance-none checked:bg-indigo-500 transition-colors" />
               </div>
            ))}
         </div>
      </div>

       {/* ALERTAS MÓVIL */}
       <div className="bg-slate-900 p-5 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <span className="text-lg">🔔</span>
             <span className="text-[10px] font-black text-slate-100 uppercase tracking-widest">Alertas Críticas</span>
          </div>
          <div className="space-y-4">
             <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 uppercase">Slack Channel</label>
                <input type="text" defaultValue="#radio-corazon-alerts" className="w-full bg-slate-800 border border-white/5 rounded-xl py-3 px-4 text-[11px] text-slate-300" />
             </div>
          </div>
       </div>

       <button className="w-full bg-blue-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">💾 GUARDAR CONFIGURACIÓN</button>
    </div>
  );
}
