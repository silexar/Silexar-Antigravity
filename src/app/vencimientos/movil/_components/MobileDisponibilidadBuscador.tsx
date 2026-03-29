'use client'

export default function MobileDisponibilidadBuscador() {
  return (
    <div className="space-y-4 pb-20 mt-4">

      {/* RESULTADO DE BÚSQUEDA - HEADER DEL CLIENTE */}
      <div className="flex justify-between items-center mb-2 px-1">
         <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <span className="text-emerald-500">🎯</span> DISPONIBILIDAD CLIENTE
         </h3>
         <button className="text-[10px] bg-slate-800 text-white px-2 py-1 rounded border border-gray-200/50 font-bold flex items-center gap-1">
            <span>🔄</span> Nueva
         </button>
      </div>

      {/* CONTEXTO DEL LEAD */}
      <div className="bg-white/80/60 p-4 rounded-xl border border-gray-200/50 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full blur-xl pointer-events-none"></div>
         <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-indigo-500/30">
               <span className="text-xl">🏢</span>
            </div>
            <div>
               <h2 className="text-sm font-black text-gray-800">TechStart SpA</h2>
               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Tecnología & SaaS</p>
            </div>
         </div>
         <div className="flex gap-2">
            <span className="bg-[#ECEFF8]/50 text-emerald-600 px-2 py-1 rounded-md text-[9px] font-bold border border-gray-200/50">
               Ppto Ojetivo: $15M
            </span>
            <span className="bg-[#ECEFF8]/50 text-indigo-600 px-2 py-1 rounded-md text-[9px] font-bold border border-gray-200/50">
               Audiencia Joven
            </span>
         </div>
      </div>

      <div className="flex items-center gap-2 px-1 mt-6 mb-3">
         <span className="animate-pulse text-indigo-500 text-lg">💡</span>
         <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Cortex Recomienda:</h3>
      </div>

      {/* TIER 1: MEJOR OPCIÓN */}
      <div className="bg-white/70 rounded-xl border border-emerald-500/30 p-4 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full blur-2xl pointer-events-none"></div>
         
         <div className="flex justify-between items-start mb-3">
            <div>
               <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">🏆</span>
                  <span className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">Top Match</span>
               </div>
               <h4 className="text-sm font-black text-gray-800">Mesa Central Matinal</h4>
               <p className="text-[10px] text-gray-500">T13 Radio • Tipo A (Completo)</p>
            </div>
            <div className="text-right">
               <div className="inline-block bg-emerald-50 px-2 py-1 rounded text-[10px] font-black text-emerald-600 border border-emerald-500/30">
                  95% Match
               </div>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-2 text-[10px] mb-4">
            <div className="bg-[#ECEFF8]/40 p-2 rounded-lg border border-gray-200/50">
               <p className="text-gray-500 font-bold mb-0.5">Disponibilidad</p>
               <p className="text-gray-800 font-black">Desde 01-Marzo</p>
            </div>
            <div className="bg-[#ECEFF8]/40 p-2 rounded-lg border border-gray-200/50">
               <p className="text-gray-500 font-bold mb-0.5">Rate Sugerido</p>
               <p className="text-emerald-600 font-black">$4.5M/mes</p>
            </div>
         </div>

         <p className="text-[9px] text-gray-500 mb-4 bg-[#ECEFF8]/30 p-2 rounded border border-gray-200/50">
            <span className="text-emerald-600 font-bold">🎯 Perfil Audiencia:</span> Perfect fit con el brief. ~45K ejecutivos ABC1 en horario de traslado.
         </p>

         <div className="flex gap-2">
            <button className="flex-1 bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-[10px] transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
               💸 Reservar Now
            </button>
            <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-lg text-[10px] border border-gray-200 transition-colors">
               📧 Enviar Brief
            </button>
         </div>
      </div>

      {/* TIER 2: ALTERNATIVA */}
      <div className="bg-white/70 rounded-xl border border-gray-200 p-4">
         <div className="flex justify-between items-start mb-3">
            <div>
               <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">🥈</span>
                  <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Alternativa</span>
               </div>
               <h4 className="text-xs font-black text-gray-800">Tarde Deportiva</h4>
               <p className="text-[9px] text-gray-500">Radio 103.3 • Tipo B</p>
            </div>
            <div className="text-right">
               <div className="inline-block bg-slate-800 px-2 py-1 rounded text-[10px] font-black text-gray-800 border border-gray-200">
                  75% Match
               </div>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-2 text-[10px] mb-4">
            <div className="flex justify-between bg-[#ECEFF8]/40 px-2 py-1.5 rounded border border-gray-200/50">
               <span className="text-gray-500 font-bold">Disp.</span>
               <span className="text-emerald-600 font-black">Inmediato</span>
            </div>
            <div className="flex justify-between bg-[#ECEFF8]/40 px-2 py-1.5 rounded border border-gray-200/50">
               <span className="text-gray-500 font-bold">Precio</span>
               <span className="text-gray-800 font-black">$3.2M/mes</span>
            </div>
         </div>

         <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-lg text-[10px] border border-gray-200 transition-colors">
            Ver Detalles y Reservar
         </button>
      </div>

      {/* TIER 3: ECONÓMICA */}
      <div className="bg-white/70 rounded-xl border border-blue-500/20 p-4">
         <div className="flex justify-between items-start mb-3">
            <div>
               <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">💰</span>
                  <span className="text-[9px] text-blue-600 font-black uppercase tracking-widest">Económica / Volumen</span>
               </div>
               <h4 className="text-xs font-black text-gray-800">Multi-Menciones (Bools)</h4>
               <p className="text-[9px] text-gray-500">Cross-Emisora</p>
            </div>
         </div>

         <div className="bg-blue-950/20 p-2 rounded-lg border border-blue-500/10 text-[10px] mb-4 space-y-1">
            <div className="flex justify-between">
               <span className="text-gray-500">Unitario</span>
               <span className="text-gray-600 font-bold">Desde $180K / mención</span>
            </div>
            <div className="flex justify-between border-t border-gray-200/50 pt-1 mt-1">
               <span className="text-blue-600 font-bold">Sugerencia (15x)</span>
               <span className="text-blue-600 font-black">$2.43M Total</span>
            </div>
         </div>

         <button className="w-full bg-slate-800 hover:bg-slate-700 text-blue-600 font-bold py-2 rounded-lg text-[10px] border border-blue-500/20 transition-colors">
            📋 Configurar Paquete
         </button>
      </div>

    </div>
  )
}
