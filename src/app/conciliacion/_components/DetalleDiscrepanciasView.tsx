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

export default function DetalleDiscrepanciasView({ onBack, sessionId }: { onBack: () => void, sessionId: string }) {
  const [selectedSpot, setSelectedSpot] = useState<Discrepancia | null>(null);
  const [_showOverrideModal, _setShowOverrideModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [_isForced, _setIsForced] = useState<boolean>(false);

  const _handleForceOverride = () => {
    if (pinInput === '1234') {
        _setIsForced(true);
        _setShowOverrideModal(false);
        setPinInput('');
        alert('✅ Bypass Comercial Aprobado. Spot enviado a cola de emisión forzada.');
    } else {
        alert('❌ PIN Incorrecto. Solicitud denegada.');
    }
  };

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
    },
    {
      id: "3",
      spotId: "SP_CC_22",
      cliente: "Coca Cola",
      horaProgramada: "10:20:00",
      tipo: "CAMBIO_PROG",
      valor: "$600K",
      riesgo: "BAJO",
      sugerenciaIA: "Ignorar: Compensado en bloque siguiente",
      bloque: "Mañana"
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* HEADER DE COMANDO DETALLADO */}
      <div className="flex justify-between items-center bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-all border border-slate-200 text-slate-600 shadow-sm"
          >
            ←
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">🚨 Detalle de Discrepancias</h2>
            <p className="text-xs text-slate-500 font-mono font-medium">ID Proceso: {sessionId} • Radio Corazón</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold border border-rose-200 transition-colors shadow-sm">RECUPERAR TODO CRÍTICO</button>
           <button className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:-translate-y-0.5">NOTIFICAR EJECUTIVOS</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LISTA DE DISCREPANCIAS (LADO IZQUIERDO) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4">
             <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Spots no emitidos (3)</span>
                <div className="flex gap-2">
                   <select className="bg-white border border-slate-200 text-[10px] text-slate-600 font-medium rounded-lg px-2 py-1 outline-none shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer">
                      <option>Todos los Riesgos</option>
                      <option>Crítico</option>
                   </select>
                </div>
             </div>

             <div className="space-y-2">
                {discrepancias.map((spot) => (
                   <div 
                     key={spot.id}
                     onClick={() => setSelectedSpot(spot)}
                     className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                       selectedSpot?.id === spot.id 
                       ? 'bg-indigo-50 border-indigo-200 shadow-md ring-1 ring-indigo-500 scale-[1.01]' 
                       : 'bg-white/40 border-slate-100 shadow-sm hover:border-slate-300 hover:shadow-md'
                     }`}
                   >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                           <div className={`w-2 h-2 rounded-full shadow-sm ${
                             spot.riesgo === 'CRÍTICO' ? 'bg-rose-500 animate-pulse shadow-rose-200' : 
                             spot.riesgo === 'MEDIO' ? 'bg-amber-500 shadow-amber-200' : 'bg-emerald-500 shadow-emerald-200'
                           }`}></div>
                           <div>
                              <div className="text-sm font-bold text-slate-800">{spot.cliente}</div>
                              <div className="text-[10px] text-slate-500 font-mono uppercase bg-slate-100 px-1.5 py-0.5 rounded-md mt-0.5 inline-block border border-slate-200">{spot.spotId} • {spot.horaProgramada}</div>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="text-sm font-black text-slate-800">{spot.valor}</div>
                           <div className="text-[9px] font-bold text-indigo-600 uppercase mt-0.5">{spot.tipo.replace('_', ' ')}</div>
                        </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* PANEL DE ACCIÓN IA (LADO DERECHO) */}
        <div className="space-y-6">
           {selectedSpot ? (
              <div className="bg-white/80 backdrop-blur-xl border border-indigo-200 rounded-3xl p-6 shadow-xl shadow-indigo-100/50 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                 
                 <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                       <span className="text-2xl drop-shadow-sm">🤖</span>
                       <div>
                          <div className="text-xs font-black text-indigo-600 uppercase tracking-widest">Cortex-Compliance Hub</div>
                          <div className="text-[10px] text-slate-500 font-medium">Sugerencia de Recuperación IA</div>
                       </div>
                    </div>

                    <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 mb-6 shadow-inner">
                       <div className="text-[10px] text-indigo-400/80 uppercase font-bold mb-2 tracking-wide">Análisis de Impacto</div>
                       <p className="text-sm text-slate-700 font-medium italic">"{selectedSpot.sugerenciaIA}"</p>
                    </div>

                    <div className="space-y-4 mb-8">
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Probabilidad de Éxito</span>
                          <span className="text-emerald-600 font-bold">94%</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full w-[94%] shadow-sm shadow-emerald-200"></div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 mt-auto">
                       <button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 py-4 rounded-2xl text-white font-black text-sm shadow-md shadow-indigo-200 active:scale-95 transition-all">
                          ⚡ RECUPERAR AHORA
                       </button>
                       <button className="w-full bg-white hover:bg-slate-50 py-3 rounded-2xl text-slate-600 font-bold text-xs active:scale-95 transition-all border border-slate-200 shadow-sm">
                          📩 CONSULTAR A VENTAS
                       </button>
                       <button className="w-full py-2 text-slate-400 hover:text-rose-600 text-[10px] font-bold uppercase transition-colors">
                          Marcar como pérdida justificada
                       </button>
                    </div>
                 </div>
              </div>
           ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 bg-white/40 backdrop-blur-sm border border-slate-200 border-dashed rounded-3xl text-center space-y-4 shadow-sm">
                 <div className="text-5xl opacity-80 drop-shadow-sm grayscale contrast-125">🎯</div>
                 <div>
                    <div className="text-slate-700 font-bold text-sm">Selecciona un spot</div>
                    <div className="text-[10px] text-slate-500 font-medium">Para ver análisis IA y tomar acciones</div>
                 </div>
              </div>
           )}

           {/* WIDGET DE COBERTURA RÁPIDA */}
           <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-sm space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                 <span className="w-1.5 h-3 bg-emerald-500 rounded-full shadow-sm"></span>
                 Disponibilidad de Bloques
              </h4>
              <div className="space-y-2">
                 {['Tarde', 'Noche', 'Trasnoch'].map((b) => (
                    <div key={b} className="flex justify-between items-center text-xs">
                       <span className="text-slate-600 font-medium">{b}</span>
                       <span className="text-emerald-600 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">15% libre</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
