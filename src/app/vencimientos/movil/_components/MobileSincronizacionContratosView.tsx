'use client'

import { useState } from 'react';

export default function MobileSincronizacionContratosView() {
   const [confirmado, setConfirmado] = useState(false);

  return (
    <div className="space-y-4 pb-6 relative">
      {/* LÍNEA DE PIPELINE VERTICAL BACKGROUND */}
      <div className="absolute top-20 bottom-10 left-6 w-0.5 bg-gradient-to-b from-emerald-500/20 via-indigo-500/50 to-amber-500/20 -z-10"></div>

      {/* HEADER MOBILE */}
      <div className="flex justify-between items-center bg-white/70 p-3 rounded-xl border border-gray-200/50">
         <div>
            <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
               <span className="animate-spin-slow">🔄</span> SYNC CONTRATOS
            </h2>
            <p className="text-[9px] text-indigo-600 mt-0.5 font-bold">Cortex-Flow Pipeline</p>
         </div>
      </div>

      {/* PASO 1: DETECCIÓN MOBILE */}
      <div className="ml-10 relative">
         <div className="absolute top-4 -left-10 w-6 h-6 rounded-full bg-emerald-50 border border-emerald-500 flex items-center justify-center text-[10px] text-emerald-600 font-black shadow-[0_0_10px_rgba(16,185,129,0.2)]">1</div>
         <div className="bg-white/80/60 p-4 rounded-xl border border-emerald-500/30 backdrop-blur-sm relative overflow-hidden">
            <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">INGESTA DE DATOS</h3>
            
            <div className="bg-[#ECEFF8]/80 rounded-lg p-3 border border-gray-200/50 border-l-2 border-l-emerald-500">
               <p className="text-[8px] text-emerald-500 font-bold uppercase mb-2">1 NUEVO CONTRATO DETECTADO</p>
               <div className="space-y-1.5 text-[10px]">
                  <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500 font-bold">ID</span><span className="text-gray-800 font-mono">CON-2025-00234</span></div>
                  <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500 font-bold">Cliente</span><span className="text-gray-800 font-bold text-right leading-tight">AutoMax Chile</span></div>
                  <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500 font-bold">Período</span><span className="text-amber-600 font-bold">01-Mar a 31-May</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-bold">Valor</span><span className="text-emerald-600 font-black">$13.5M</span></div>
               </div>
            </div>
         </div>
      </div>

      {/* PASO 2: CORTEX MOBILE */}
      <div className="ml-10 relative">
         <div className="absolute top-4 -left-10 w-6 h-6 rounded-full bg-indigo-50 border border-indigo-500 flex items-center justify-center text-[10px] text-indigo-600 font-black shadow-[0_0_10px_rgba(99,102,241,0.2)]">2</div>
         <div className="bg-white/80/60 p-4 rounded-xl border border-indigo-500/40 backdrop-blur-sm">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">MOTOR PREDICTIVO</h3>
            
            <div className="bg-indigo-950/30 rounded-lg border border-indigo-500/20 p-3">
               <ul className="space-y-1.5 mb-3 text-[10px]">
                  <li className="flex gap-1.5"><span className="text-emerald-600">✅</span><span className="text-gray-600">Cupo 7 OK.</span></li>
                  <li className="flex gap-1.5"><span className="text-emerald-600">✅</span><span className="text-gray-600">Exclusividad automotriz OK.</span></li>
                  <li className="flex gap-1.5"><span className="text-amber-600">⚠️</span><span className="text-amber-200 leading-tight">Chevrolet presente desde Feb.</span></li>
               </ul>
               <div className="bg-indigo-500/10 border border-indigo-500/30 p-2 rounded">
                  <p className="text-[8px] text-indigo-600 font-bold uppercase mb-1">💡 Veredicto Cortex</p>
                  <p className="text-[9px] text-gray-800 leading-snug">Separación temporal en Mar. Overlap aceptable.</p>
               </div>
            </div>
         </div>
      </div>

      {/* PASO 3: CONFIRMACIÓN MOBILE */}
      <div className="ml-10 relative">
         {confirmado ? (
            <div className="absolute top-4 -left-10 w-6 h-6 rounded-full bg-emerald-50 border border-emerald-500 flex items-center justify-center text-[10px] text-emerald-600 font-black shadow-[0_0_10px_rgba(16,185,129,0.2)]">✓</div>
         ) : (
            <div className="absolute top-4 -left-10 w-6 h-6 rounded-full bg-amber-50 border border-amber-500 flex items-center justify-center text-[10px] text-amber-600 font-black shadow-[0_0_10px_rgba(245,158,11,0.2)] animate-pulse">3</div>
         )}
         
         <div className={`p-4 rounded-xl border ${confirmado ? 'border-emerald-500/30 bg-emerald-900/10' : 'border-amber-500/40 bg-white/80/60'} backdrop-blur-sm transition-all duration-500`}>
            <h3 className={`text-[10px] font-black ${confirmado ? 'text-emerald-600' : 'text-amber-600'} uppercase tracking-widest mb-3`}>ACCIÓN REQUERIDA</h3>
            
            {!confirmado ? (
               <div className="space-y-3">
                  <p className="text-amber-200 text-[10px] leading-snug font-medium text-center bg-amber-500/10 p-2 rounded border border-amber-500/20">Autoriza anclar CON-2025-00234 a Mesa Central.</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                     <button className="bg-slate-800 text-gray-600 py-3 rounded-lg font-bold uppercase text-[9px]">❌ Rechazar</button>
                     <button onClick={() => setConfirmado(true)} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.3)] py-3 rounded-lg font-black uppercase text-[9px] border border-emerald-400">✅ Confirmar</button>
                  </div>
               </div>
            ) : (
               <div className="text-center py-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-500 flex items-center justify-center text-xl mx-auto mb-2">⚡</div>
                  <h4 className="text-emerald-600 font-bold text-xs">OPERACIÓN AUTORIZADA</h4>
               </div>
            )}
         </div>
      </div>

      {/* PASO 4: LOGS MOBILE */}
      <div className="ml-10 relative">
         <div className={`absolute top-4 -left-10 w-6 h-6 rounded-full ${confirmado ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-slate-800 border-slate-600 text-gray-500'} border flex items-center justify-center text-[10px] font-black`}>4</div>
         
         <div className={`p-4 rounded-xl border ${confirmado ? 'border-indigo-500/40 bg-white/80/80' : 'border-gray-200/50 bg-white/80/30 opacity-60'} backdrop-blur-sm transition-all duration-700`}>
            <h3 className={`text-[10px] font-black ${confirmado ? 'text-indigo-600' : 'text-gray-500'} uppercase tracking-widest mb-3`}>REGISTRO DE SALIDA</h3>
            
            <div className="font-mono text-[8px] space-y-2 max-h-[100px] overflow-y-auto">
               {confirmado ? (
                  <>
                     <div className="text-emerald-600">» Reserva cupo #7 consolidada.</div>
                     <div className="text-emerald-600">» Status Contrato {'>'} ACTIVADO.</div>
                     <div className="text-indigo-600">» Notificación Push enviada.</div>
                     <div className="text-amber-600">» Regla Alerta Inicio creada.</div>
                     <div className="text-emerald-600">» Ocupación global +1.2%.</div>
                     <div className="text-gray-500 animate-pulse mt-1">Esperando material...</div>
                  </>
               ) : (
                  <div className="text-gray-500 text-center py-4">Esperando confirmación... ⏳</div>
               )}
            </div>
         </div>
      </div>

    </div>
  )
}
