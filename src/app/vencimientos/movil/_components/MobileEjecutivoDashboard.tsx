'use client'

export default function MobileEjecutivoDashboard() {
  return (
    <div className="space-y-5 pb-24 relative min-h-screen">
      
      {/* HEADER EJECUTIVO (MI PERFORMANCE HOY) */}
      <div className="bg-white/70 p-5 rounded-2xl border border-gray-200/50 relative overflow-hidden backdrop-blur-md">
         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full blur-2xl pointer-events-none"></div>
         <div className="flex justify-between items-center mb-4">
            <div>
               <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                  <span>👋</span> Hola, Carlos M.
               </h2>
               <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-1">Dashboard Ejecutivo TIER 0</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-indigo-500/50 flex items-center justify-center text-xs overflow-hidden">
               <span className="text-gray-800 font-bold">CM</span>
            </div>
         </div>

         <div className="bg-[#ECEFF8]/40 rounded-xl p-4 border border-gray-200/50 space-y-3">
            <h3 className="text-[10px] text-gray-500 uppercase font-black tracking-widest border-b border-gray-200/50 pb-2">📊 Mi Performance Hoy</h3>
            
            <div className="grid grid-cols-2 gap-3">
               <div>
                  <p className="text-[9px] text-gray-500">Cupos Asignados</p>
                  <p className="text-lg font-black text-gray-800">45</p>
               </div>
               <div>
                  <p className="text-[9px] text-gray-500">Ocupación</p>
                  <p className="text-lg font-black text-emerald-600">87% <span className="text-[9px] font-bold text-gray-500">(39/45)</span></p>
               </div>
               <div>
                  <p className="text-[9px] text-gray-500">Revenue YTD</p>
                  <p className="text-lg font-black text-indigo-600">$234M</p>
               </div>
               <div>
                  <p className="text-[9px] text-gray-500">Logro Meta Mes</p>
                  <div className="flex items-center gap-2 mt-1">
                     <div className="flex-1 h-1.5 bg-slate-800 rounded-full">
                        <div className="h-full bg-emerald-500 rounded-full" style={{width: '92%'}}></div>
                     </div>
                     <span className="text-xs font-black text-emerald-600">92%</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* QUICK ACTIONS GRID */}
      <h3 className="text-[10px] text-gray-500 uppercase font-black tracking-widest px-2">⚡ Acciones Rápidas</h3>
      <div className="grid grid-cols-2 gap-3 px-1">
         <button className="bg-emerald-900/20 hover:bg-emerald-900/30 border border-emerald-500/30 p-3 rounded-xl transition-all text-left flex flex-col gap-2 group">
            <span className="text-xl">🎯</span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase">Consultar Disp.</span>
         </button>
         <button className="bg-white/80/60 hover:bg-slate-800 border border-gray-200/50 p-3 rounded-xl transition-all text-left flex flex-col gap-2">
            <span className="text-xl">💰</span>
            <span className="text-[10px] font-bold text-gray-600 uppercase">Ver Tarifas</span>
         </button>
         <button className="bg-white/80/60 hover:bg-slate-800 border border-gray-200/50 p-3 rounded-xl transition-all text-left flex flex-col gap-2">
            <span className="text-xl">📅</span>
            <span className="text-[10px] font-bold text-gray-600 uppercase">Vencimientos</span>
         </button>
         <button className="bg-amber-900/20 hover:bg-amber-900/30 border border-amber-500/30 p-3 rounded-xl transition-all text-left flex flex-col gap-2">
            <span className="text-xl">🚨</span>
            <span className="text-[10px] font-bold text-amber-500 uppercase">Opportunities</span>
         </button>
      </div>

      {/* OPORTUNIDADES HOT Y ALERTAS */}
      <div className="space-y-4 px-1">
         
         <div className="bg-white/70 rounded-xl border border-amber-500/20 p-4">
            <h3 className="text-[10px] text-amber-500 uppercase font-black tracking-widest mb-3 flex items-center gap-2">
               <span className="animate-pulse">🔥</span> OPORTUNIDADES HOT
            </h3>
            <ul className="space-y-2">
               <li className="flex items-start gap-2 text-[10px] border-b border-gray-200/50 pb-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <div>
                     <span className="text-gray-800 font-bold block">Mesa Central:</span>
                     <span className="text-gray-500">1 cupo premium recuperado (Desde marzo)</span>
                  </div>
               </li>
               <li className="flex items-start gap-2 text-[10px] border-b border-gray-200/50 pb-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <div>
                     <span className="text-gray-800 font-bold block">Deportiva PM:</span>
                     <span className="text-emerald-600 font-bold">Disponible Inmediato</span>
                  </div>
               </li>
               <li className="flex items-start gap-2 text-[10px]">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <div>
                     <span className="text-gray-800 font-bold block">Temperatura 2 (13C):</span>
                     <span className="text-gray-500">Señal exclusiva liberada</span>
                  </div>
               </li>
            </ul>
         </div>

         <div className="bg-white/70 rounded-xl border border-red-500/20 p-4">
            <h3 className="text-[10px] text-red-500 uppercase font-black tracking-widest mb-3 flex items-center gap-2">
               <span>🚨</span> MIS ALERTAS
            </h3>
            <ul className="space-y-2">
               <li className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50">
                  <div>
                     <p className="text-[10px] font-bold text-gray-800">Banco XYZ</p>
                     <p className="text-[8px] text-gray-500">Contrato N° 892</p>
                  </div>
                  <span className="text-[9px] bg-amber-50 text-amber-600 px-2 py-1 rounded font-bold">Vence en 15 días</span>
               </li>
               <li className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50">
                  <div>
                     <p className="text-[10px] font-bold text-gray-800">AutoMax</p>
                     <p className="text-[8px] text-gray-500">Mesa Central</p>
                  </div>
                  <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold">Conf. Pendiente</span>
               </li>
            </ul>
         </div>

      </div>

      {/* FLOATING ACTION BAR (Buscador Rápido) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#ECEFF8]/90 backdrop-blur-xl border-t border-gray-200 z-50">
         <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
               <input 
                  type="text" 
                  placeholder="Ej: TechStart SpA..."
                  className="w-full bg-white/80 border border-gray-200 rounded-lg pl-3 pr-10 py-3 text-xs text-gray-800 focus:outline-none focus:border-indigo-500/50 transition-colors"
               />
               <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800">
                  🔍
               </button>
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-3 rounded-lg text-xs shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all whitespace-nowrap">
               🚀 Ver Disp.
            </button>
         </div>
         <div className="flex justify-between items-center px-4 pt-2 border-t border-gray-200/50 text-[10px] text-gray-500">
            <button className="flex flex-col items-center gap-1 hover:text-gray-800 transition-colors"><span>🏠</span> Inicio</button>
            <button className="flex flex-col items-center gap-1 hover:text-gray-800 transition-colors"><span>📅</span> Reservas</button>
            <button className="flex flex-col items-center gap-1 hover:text-gray-800 transition-colors"><span>📊</span> Pipeline</button>
            <button className="flex flex-col items-center gap-1 hover:text-gray-800 transition-colors"><span>⚙️</span> Ajustes</button>
         </div>
      </div>

    </div>
  )
}
