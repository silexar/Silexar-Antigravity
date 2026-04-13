"use client";

import React, { useState } from 'react';

export default function MobileConfigView({ onBack }: { onBack: () => void }) {
  const [station, setStation] = useState('Radio Corazón');

  return (
    <div className="space-y-6 pb-24 animate-in slide-in-from-right-10 duration-500">
      {/* HEADER MÓVIL */}
      <header className="flex justify-between items-center bg-[#F0EDE8] -mx-4 px-4 py-3 border-b border-white/5 sticky top-[-16px] z-[60]">
         <button onClick={onBack} className="text-[#888780] text-xs font-bold uppercase tracking-widest">← Volver</button>
         <div className="text-center">
            <div className="text-xs font-black text-blue-400 uppercase">SETUP OPERATIVO</div>
            <div className="text-[10px] text-[#888780] font-bold uppercase tracking-widest">{station}</div>
         </div>
         <div className="w-8"></div>
      </header>

      {/* SELECTOR EMISORA MÓVIL */}
      <div className="bg-[#F0EDE8] border border-white/5 p-4 rounded-2xl shadow-xl">
         <label className="text-[10px] font-black text-[#888780] uppercase tracking-widest mb-2 block">Emisora a Configurar</label>
         <select 
           value={station}
           onChange={(e) => setStation(e.target.value)}
           className="w-full bg-[#E8E5E0] border-none rounded-xl text-sm font-bold text-[#2C2C2A] py-3 px-4 outline-none ring-1 ring-white/5 focus:ring-blue-500"
         >
            <option>Radio Corazón</option>
            <option>Play FM</option>
            <option>Sonar FM</option>
         </select>
      </div>

      {/* RUTA SECCIÓN MÓVIL */}
      <div className="bg-[#F0EDE8] p-5 rounded-3xl border border-white/5 space-y-4">
         <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📁</span>
            <span className="text-[10px] font-black text-[#2C2C2A] uppercase tracking-widest">Ruta y Sincronización</span>
         </div>
         <div className="space-y-4">
            <div className="space-y-1">
               <label className="text-[8px] font-black text-[#888780] uppercase">Ruta Base</label>
               <input type="text" defaultValue="\\dalet-server\exports\radio_corazon\" aria-label="Ruta Base" className="w-full bg-[#E8E5E0] border border-white/5 rounded-xl py-3 px-4 text-[11px] text-[#5F5E5A]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1">
                  <label className="text-[8px] font-black text-[#888780] uppercase">Sync Cada</label>
                  <select className="w-full bg-[#E8E5E0] border border-white/5 rounded-xl py-3 px-4 text-[11px] text-[#2C2C2A]">
                     <option>15 min</option>
                     <option>30 min</option>
                  </select>
               </div>
               <div className="space-y-1">
                  <label className="text-[8px] font-black text-[#888780] uppercase">Tolerancia</label>
                  <input type="number" defaultValue="30" aria-label="Tolerancia en minutos" className="w-full bg-[#E8E5E0] border border-white/5 rounded-xl py-3 px-4 text-[11px] text-[#2C2C2A]" />
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
            ].map((ia) => (
               <div key={ia.l} className="flex justify-between items-center bg-[#F0EDE8]/50 p-3 rounded-xl">
                  <span className="text-xs text-[#5F5E5A] font-bold">{ia.l}</span>
                  <input type="checkbox" defaultChecked={ia.active} className="w-8 h-4 bg-[#D4D1CC] rounded-full appearance-none checked:bg-indigo-500 transition-colors" />
               </div>
            ))}
         </div>
      </div>

       {/* ALERTAS MÓVIL */}
       <div className="bg-[#F0EDE8] p-5 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <span className="text-lg">🔔</span>
             <span className="text-[10px] font-black text-[#2C2C2A] uppercase tracking-widest">Alertas Críticas</span>
          </div>
          <div className="space-y-4">
             <div className="space-y-1">
                <label className="text-[8px] font-black text-[#888780] uppercase">Slack Channel</label>
                <input type="text" defaultValue="#radio-corazon-alerts" aria-label="Slack Channel" className="w-full bg-[#E8E5E0] border border-white/5 rounded-xl py-3 px-4 text-[11px] text-[#5F5E5A]" />
             </div>
          </div>
       </div>

       <button className="w-full bg-blue-600 text-[#2C2C2A] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">💾 GUARDAR CONFIGURACIÓN</button>
    </div>
  );
}
