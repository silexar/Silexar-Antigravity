"use client";

import React, { useState } from 'react';

interface Discrepancia {
  id: string;
  spotId: string;
  cliente: string;
  horaProgramada: string;
  tipo: 'FALLA_TECNICA' | 'TIMING' | 'CAMBIO_PROG';
  valor: string;
  riesgo: 'CRÍTICO' | 'MEDIO' | 'BAJO';
  sugerenciaIA: string;
  bloque: string;
}

export default function MobileDetalleDiscrepanciasView({ onBack, sessionId }: { onBack: () => void, sessionId: string }) {
  const [selectedSpot, setSelectedSpot] = useState<Discrepancia | null>(null);

  const discrepancias: Discrepancia[] = [
    {
      id: "1",
      spotId: "SP_TOY_01",
      cliente: "Toyota Chile",
      horaProgramada: "08:15:00",
      tipo: "FALLA_TECNICA",
      valor: "$1.2M",
      riesgo: "CRÍTICO",
      sugerenciaIA: "Recuperar en bloque 16:00-18:00 (Espacios disponibles)",
      bloque: "Mañana"
    },
    {
      id: "2",
      spotId: "SP_MOV_05",
      cliente: "Movistar",
      horaProgramada: "09:45:30",
      tipo: "TIMING",
      valor: "$850K",
      riesgo: "MEDIO",
      sugerenciaIA: "Consultar a ventas: Cambio de material detectado",
      bloque: "Mañana"
    }
  ];

  return (
    <div className="space-y-6 pb-24 animate-in slide-in-from-right-10 duration-500">
      {/* HEADER MÓVIL */}
      <header className="flex justify-between items-center bg-[#F0EDE8] -mx-4 px-4 py-3 border-b border-white/5 sticky top-[-16px] z-[60]">
         <button onClick={onBack} className="text-slate-400 text-xs font-bold uppercase tracking-widest">← Volver</button>
         <div className="text-center">
            <div className="text-xs font-black text-red-400">DETALLE DISCREPANCIAS</div>
            <div className="text-[10px] text-slate-500 font-mono tracking-tighter">{sessionId}</div>
         </div>
         <div className="w-8"></div> {/* Spacer */}
      </header>

      {/* MÉTRICAS RÁPIDAS */}
      <div className="grid grid-cols-2 gap-3">
         <div className="bg-[#F0EDE8] p-4 rounded-2xl border border-red-500/20">
            <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Total Críticos</div>
            <div className="text-xl font-black text-red-500">33 spots</div>
         </div>
         <div className="bg-[#F0EDE8] p-4 rounded-2xl border border-indigo-500/20">
            <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Impacto Pend.</div>
            <div className="text-xl font-black text-indigo-400">$2.4M</div>
         </div>
      </div>

      {/* LISTA DE CARDS */}
      <div className="space-y-3">
         {discrepancias.map((spot) => (
            <div 
              key={spot.id} 
              onClick={() => setSelectedSpot(selectedSpot?.id === spot.id ? null : spot)}
              className={`bg-[#F0EDE8] border rounded-2xl p-4 transition-all ${
                selectedSpot?.id === spot.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-white/5'
              }`}
            >
               <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${spot.riesgo === 'CRÍTICO' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                     <span className="text-sm font-bold text-slate-100">{spot.cliente}</span>
                  </div>
                  <span className="text-[10px] font-black text-white">{spot.valor}</span>
               </div>
               
               <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mb-3">
                  <span>{spot.spotId}</span>
                  <span>{spot.horaProgramada}</span>
               </div>

               {selectedSpot?.id === spot.id && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2">
                     <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
                        <div className="text-[9px] font-black text-indigo-400 uppercase mb-1 flex items-center gap-1">
                           <span>🤖</span> Sugerencia Cortex
                        </div>
                        <p className="text-[11px] text-slate-200 leading-relaxed italic">"{spot.sugerenciaIA}"</p>
                     </div>
                     
                     <div className="flex gap-2">
                        <button className="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-[10px] font-black shadow-lg">⚡ RECUPERAR</button>
                        <button className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-xl text-[10px] font-bold border border-white/5">📩 CONSULTAR</button>
                     </div>
                  </div>
               )}
            </div>
         ))}
      </div>

      {/* ACCIÓN GLOBAL */}
      <button className="w-full bg-red-600/20 border border-red-500/30 text-red-500 py-4 rounded-2xl text-xs font-black shadow-xl animate-pulse">
         ⚠️ RECUPERAR TODA LA FECHA (URGENTE)
      </button>

    </div>
  );
}
