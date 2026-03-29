'use client'

export default function TopPerformersCard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
         <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <span className="text-emerald-500 text-lg">📈</span> RANKING DE PROGRAMAS (ROI)
         </h3>
         <button className="text-[10px] text-indigo-600 font-bold hover:text-indigo-600 uppercase tracking-widest flex items-center gap-1">
            Ver Listado Completo <span>→</span>
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         
         {/* TOP PERFORMERS */}
         <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-emerald-600 uppercase border-b border-gray-200/50 pb-2">🏆 LÍDERES EN RENTABILIDAD</h4>
            
            <div className="bg-white/80/60 rounded-xl border border-emerald-500/20 p-4 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
               <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full blur-xl"></div>
               <div className="flex justify-between items-start mb-3">
                  <div>
                     <h5 className="text-sm font-black text-gray-800 flex items-center gap-2"><span className="text-emerald-600">1️⃣</span> Mesa Central</h5>
                     <p className="text-[10px] text-gray-500">T13 Radio • $4.8M Promedio</p>
                  </div>
                  <div className="text-right">
                     <p className="text-lg font-black text-emerald-600">$125M</p>
                     <p className="text-[9px] font-bold text-emerald-500/70">ROI 340%</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#ECEFF8]/40 p-2 rounded-lg border border-gray-200/50">
                  <div className="flex justify-between"><span className="text-gray-500">Ocupación</span><span className="text-gray-800 font-bold">95%</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Lista Espera</span><span className="text-amber-600 font-bold">12 Clientes</span></div>
               </div>
               <div className="mt-3 text-[10px] text-emerald-200/70 bg-emerald-900/20 p-2 rounded flex gap-2 items-start">
                  <span>💡</span> <span>Cortex sugiere aumentar precio 15% por saturación de demanda.</span>
               </div>
            </div>

            <div className="bg-white/70 rounded-xl border border-gray-200/50 p-4 relative hover:border-gray-200 transition-colors">
               <div className="flex justify-between items-start mb-3">
                  <div>
                     <h5 className="text-xs font-black text-gray-800 flex items-center gap-2"><span className="text-gray-500">2️⃣</span> Buenos Días Chile</h5>
                     <p className="text-[10px] text-gray-500">Sonar FM • $3.5M Promedio</p>
                  </div>
                  <div className="text-right">
                     <p className="text-md font-black text-gray-800">$78M</p>
                     <p className="text-[9px] font-bold text-emerald-500/70">ROI 285%</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#ECEFF8]/40 p-2 rounded-lg border border-gray-200/50">
                  <div className="flex justify-between"><span className="text-gray-500">Ocupación</span><span className="text-emerald-600 font-bold">100% (Sold Out)</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Lista Espera</span><span className="text-amber-600 font-bold">8 Clientes</span></div>
               </div>
            </div>

            <div className="bg-white/70 rounded-xl border border-gray-200/50 p-4 relative hover:border-gray-200 transition-colors">
               <div className="flex justify-between items-start mb-3">
                  <div>
                     <h5 className="text-xs font-black text-gray-800 flex items-center gap-2"><span className="text-gray-500">3️⃣</span> Tarde Deportiva</h5>
                     <p className="text-[10px] text-gray-500">Radio 103.3 • $4.2M Promedio</p>
                  </div>
                  <div className="text-right">
                     <p className="text-md font-black text-gray-800">$67M</p>
                     <p className="text-[9px] font-bold text-emerald-500/70">ROI 245%</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#ECEFF8]/40 p-2 rounded-lg border border-gray-200/50">
                  <div className="flex justify-between"><span className="text-gray-500">Ocupación</span><span className="text-gray-800 font-bold">85%</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Disponibles</span><span className="text-emerald-600 font-bold">3 Cupos</span></div>
               </div>
            </div>
         </div>

         {/* RIESGOS Y OPORTUNIDADES (SUB-UTILIZADOS) */}
         <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-amber-500 uppercase border-b border-gray-200/50 pb-2">⚠️ ATENCIÓN REQUERIDA (Riesgo)</h4>
            
            <div className="bg-white/80/60 rounded-xl border border-amber-500/20 p-4 relative overflow-hidden group hover:border-amber-500/40 transition-colors">
               <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full blur-xl"></div>
               <div className="flex justify-between items-start mb-3">
                  <div>
                     <h5 className="text-sm font-black text-gray-800 flex items-center gap-2"><span className="text-amber-500 animate-pulse">🔻</span> Noche Cultural</h5>
                     <p className="text-[10px] text-gray-500">Radio 103.3 • $1.8M Promedio</p>
                  </div>
                  <div className="text-right">
                     <p className="text-lg font-black text-amber-600">$12M</p>
                     <p className="text-[9px] font-bold text-gray-500">Rating Crítico</p>
                  </div>
               </div>
               
               <div className="bg-amber-950/30 p-3 rounded-lg border border-amber-500/10 space-y-2">
                  <div className="flex justify-between text-[10px] border-b border-gray-200/50 pb-1">
                     <span className="text-gray-500 font-bold">Ocupación Actual</span>
                     <span className="text-amber-600 font-black">35%</span>
                  </div>
                  <div className="text-[10px]">
                     <span className="text-amber-500 font-bold block mb-0.5">Diagnóstico</span>
                     <p className="text-gray-600">Bajo rating general, audiencia demasiado nicho para el pricing actual.</p>
                  </div>
                  <div className="text-[10px] pt-1 pt-2 border-t border-amber-500/20">
                     <span className="text-emerald-600 font-bold flex items-center gap-1">💡 Solución IA</span>
                     <p className="text-emerald-100/70 mt-0.5">Re-posicionar como producto cultural premium (Auspicios exclusivos) o reducir cupos.</p>
                  </div>
               </div>
            </div>

            <div className="bg-white/80/60 rounded-xl border border-amber-500/20 p-4 relative overflow-hidden group hover:border-amber-500/40 transition-colors">
               <div className="flex justify-between items-start mb-3">
                  <div>
                     <h5 className="text-xs font-black text-gray-800 flex items-center gap-2"><span className="text-amber-500">🔻</span> Madrugada Info.</h5>
                     <p className="text-[10px] text-gray-500">Sonar FM • $1.2M Promedio</p>
                  </div>
                  <div className="text-right">
                     <p className="text-md font-black text-amber-600">$8M</p>
                  </div>
               </div>
               
               <div className="bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/10 space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                     <span className="text-gray-500 font-bold">Ocupación Actual</span>
                     <span className="text-red-600 font-black">25%</span>
                  </div>
                  <div className="text-[10px] pt-1">
                     <span className="text-emerald-600 font-bold flex items-center gap-1">💡 Solución IA</span>
                     <p className="text-emerald-100/70">Convertir a formato Podcast + targeting digital híbrido.</p>
                  </div>
               </div>
            </div>

         </div>

      </div>
    </div>
  )
}
