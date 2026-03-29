'use client'

import { useState } from 'react';

export default function SincronizacionContratosView() {
   const [confirmado, setConfirmado] = useState(false);

  return (
    <div className="space-y-6">
      {/* HEADER PRINCIPAL */}
      <div className="flex justify-between items-center bg-white/70 p-5 rounded-2xl border border-gray-200/50 backdrop-blur-md">
         <div>
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
               <span className="text-2xl animate-spin-slow">🔄</span> SINCRONIZACIÓN DE CONTRATOS TIER 0
            </h2>
            <p className="text-gray-500 text-xs mt-1 ml-9">Pipeline Inteligente Bidireccional propulsado por <strong className="text-indigo-600">Cortex-Flow</strong></p>
         </div>
         <div className="flex gap-2">
            <button className="bg-slate-800 hover:bg-slate-700 text-gray-600 border border-gray-200 px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-[10px] transition-colors flex items-center gap-2">
               📊 Ver Historial
            </button>
            <button className="bg-indigo-500/10 hover:bg-indigo-50 text-indigo-600 border border-indigo-500/30 px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-[10px] transition-colors flex items-center gap-2">
               🚀 Forzar Sync
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-gray-600 border border-gray-200 px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-[10px] transition-colors">
               ⚙️ Configurar
            </button>
         </div>
      </div>

      {/* PIPELINE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
         
         {/* CONECTOR VERTICAL/HORIZONTAL (Visual) */}
         <div className="hidden md:block absolute top-[50%] left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500/20 via-indigo-500/50 to-amber-500/20 -z-10 translate-y-[-50%]"></div>
         <div className="hidden md:block absolute top-0 left-[50%] w-[2px] h-full bg-gradient-to-b from-emerald-500/20 via-indigo-500/50 to-amber-500/20 -z-10 translate-x-[-50%]"></div>

         {/* PASO 1: DETECCIÓN AUTOMÁTICA */}
         <div className="rounded-2xl border border-emerald-500/30 bg-white/80/60 p-6 relative backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100%] blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-5">
               <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-500 flex items-center justify-center text-emerald-600 font-black">1</div>
               <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest">INGESTA DE DATOS</h3>
            </div>

            <div className="bg-[#ECEFF8]/80 rounded-xl border border-gray-200/50 p-4 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
               <p className="text-[10px] text-emerald-500 font-bold uppercase mb-2 flex items-center gap-2"><span className="animate-pulse h-1.5 w-1.5 bg-emerald-500 rounded-full inline-block"></span> Cortex ha detectado 1 nuevo contrato</p>
               
               <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs mt-3">
                  <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Contrato ID</span><span className="text-gray-800 font-mono">CON-2025-00234</span></div>
                  <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Cliente</span><span className="text-gray-800 font-bold">AutoMax Chile SpA</span></div>
                  <div className="col-span-2"><span className="text-gray-500 block text-[9px] uppercase font-bold">Target Comercial</span><span className="text-amber-600">Mesa Central Matinal - Tipo A</span></div>
                  <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Período</span><span className="text-gray-800">01-Mar a 31-May</span></div>
                  <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Valor (Neto)</span><span className="text-emerald-600 font-black">$13,500,000</span></div>
               </div>
            </div>
         </div>

         {/* PASO 2: VALIDACIÓN INTELIGENTE (CORTEX) */}
         <div className="rounded-2xl border border-indigo-500/40 bg-white/80/60 p-6 relative backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.1)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-[100%] blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-5">
               <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-500 flex items-center justify-center text-indigo-600 font-black">2</div>
               <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest">ANÁLISIS CORTEX-FLOW</h3>
            </div>

            <div className="bg-indigo-950/30 rounded-xl border border-indigo-500/20 p-4">
               <ul className="space-y-2 mb-4">
                  <li className="flex gap-2 text-xs"><span className="text-emerald-600">✅</span><span className="text-gray-600">Cupo <strong className="text-gray-800">#7</strong> disponible para inyección.</span></li>
                  <li className="flex gap-2 text-xs"><span className="text-emerald-600">✅</span><span className="text-gray-600">Sin monopolio de Exclusividad (Automotriz).</span></li>
                  <li className="flex gap-2 text-xs"><span className="text-amber-600">⚠️</span><span className="text-amber-100">Chevrolet ya presente desde 01-Feb.</span></li>
               </ul>

               <div className="bg-indigo-500/10 border border-indigo-500/30 p-3 rounded-lg">
                  <p className="text-[10px] text-indigo-600 font-bold uppercase mb-1">💡 Veredicto IA</p>
                  <p className="text-xs text-gray-800">Aprobar con separación temporal. El overlap de meses (Marzo) es aceptable al ser sub-marcas de diferentes holdings.</p>
               </div>
            </div>
         </div>

         {/* PASO 3: CONFIRMACIÓN PROGRAMADOR */}
         <div className={`rounded-2xl border ${confirmado ? 'border-emerald-500/30 bg-emerald-900/10' : 'border-amber-500/40 bg-white/80/60'} p-6 relative backdrop-blur-md transition-all duration-500`}>
            <div className="flex items-center gap-3 mb-5">
               {confirmado ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-500 flex items-center justify-center text-emerald-600 font-black">✓</div>
               ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-500 flex items-center justify-center text-amber-600 font-black animate-pulse">3</div>
               )}
               <h3 className={`text-sm font-black ${confirmado ? 'text-emerald-600' : 'text-amber-600'} uppercase tracking-widest`}>ACCIÓN REQUERIDA</h3>
            </div>

            {!confirmado ? (
               <div className="space-y-4">
                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-center">
                     <p className="text-amber-200 text-sm font-medium mb-1">Se requiere tu autorización para anclar el contrato <strong className="text-gray-800">CON-2025-00234</strong> en el inventario activo de Mesa Central.</p>
                  </div>
                  
                  <textarea 
                     className="w-full bg-[#ECEFF8]/50 border border-gray-200 rounded-lg p-3 text-xs text-gray-800 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                     placeholder="Notas u observaciones (Opcional)..."
                     rows={2}
                  ></textarea>

                  <div className="grid grid-cols-2 gap-3">
                     <button className="bg-slate-800 hover:bg-slate-700 text-gray-600 border border-gray-200/50 py-3 rounded-xl font-bold uppercase text-[10px] transition-colors">
                        ❌ Rechazar
                     </button>
                     <button 
                        onClick={() => setConfirmado(true)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.3)] py-3 rounded-xl font-black uppercase text-[10px] transition-colors border border-emerald-400">
                        ✅ Confirmar & Sincronizar
                     </button>
                  </div>
               </div>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center text-3xl mb-2">⚡</div>
                  <h4 className="text-emerald-600 font-bold text-lg">OPERACIÓN AUTORIZADA</h4>
                  <p className="text-gray-500 text-xs">Cortex está despachando los Webhooks...</p>
               </div>
            )}
         </div>

         {/* PASO 4: ACTUALIZACIÓN AUTOMÁTICA (LOGS) */}
         <div className={`rounded-2xl border ${confirmado ? 'border-indigo-500/40 bg-white/80/80' : 'border-gray-200/50 bg-white/80/30 opacity-50 grayscale'} p-6 relative backdrop-blur-md transition-all duration-700`}>
            <div className="flex items-center gap-3 mb-5">
               <div className={`w-8 h-8 rounded-full ${confirmado ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-slate-800 border-slate-600 text-gray-500'} border flex items-center justify-center font-black`}>4</div>
               <h3 className={`text-sm font-black ${confirmado ? 'text-indigo-600' : 'text-gray-500'} uppercase tracking-widest`}>REGISTRO DE EJECUCIÓN</h3>
            </div>

            <div className="space-y-3 font-mono text-[10px] h-[160px] overflow-y-auto pr-2 custom-scrollbar">
               {confirmado ? (
                  <>
                     <div className="text-emerald-600 flex gap-2"><span className="text-gray-500">[10:42:01]</span> <span>Reserva cupo #7 consolidada en DB.</span></div>
                     <div className="text-emerald-600 flex gap-2"><span className="text-gray-500">[10:42:01]</span> <span>Sincronización Bidireccional: Status Contrato {'>'} ACTIVADO.</span></div>
                     <div className="text-indigo-600 flex gap-2"><span className="text-gray-500">[10:42:02]</span> <span>Notificación Push enviada al ejecutivo Carlos Mendoza.</span></div>
                     <div className="text-amber-600 flex gap-2"><span className="text-gray-500">[10:42:02]</span> <span>Regla de Alerta de Inicio creada para 01-Mar.</span></div>
                     <div className="text-emerald-600 flex gap-2"><span className="text-gray-500">[10:42:03]</span> <span>Métricas de ocupación global recalculadas (+1.2%).</span></div>
                     <div className="text-gray-600 flex gap-2"><span className="text-gray-500">[10:42:03]</span> <span className="animate-pulse">Esperando subida de material creativo...</span></div>
                  </>
               ) : (
                  <div className="text-gray-500 text-center h-full flex items-center justify-center flex-col gap-2">
                     <span>[ Esperando confirmación en Paso 3 ]</span>
                     <span className="text-4xl opacity-20 mt-2">⏳</span>
                  </div>
               )}
            </div>
         </div>

      </div>
    </div>
  )
}
