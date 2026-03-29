'use client'

export default function MobileTopPerformersCard() {
  return (
    <div className="space-y-6 pb-6 mt-4">
      <div className="flex justify-between items-center mb-2 px-1">
         <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <span className="text-emerald-500">📈</span> RANKING DE PROGRAMAS
         </h3>
      </div>

      <div className="space-y-6">
         
         {/* LÍDERES (TOP PERFORMERS) MOBILE */}
         <div className="space-y-3">
            <h4 className="text-[9px] font-bold text-emerald-600 uppercase pl-1 border-l-2 border-emerald-500">🏆 LÍDERES RENTABILIDAD</h4>
            
            <div className="bg-white/80/60 rounded-xl border border-emerald-500/20 p-4 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full blur-xl"></div>
               <div className="flex justify-between items-start mb-3">
                  <div>
                     <h5 className="text-xs font-black text-gray-800 flex items-center gap-1.5"><span className="text-emerald-600">1️⃣</span> Mesa Central</h5>
                     <p className="text-[9px] text-gray-500">T13 Radio</p>
                  </div>
                  <div className="text-right">
                     <p className="text-md font-black text-emerald-600">$125M</p>
                     <p className="text-[8px] font-bold text-emerald-500/70">ROI 340%</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-2 text-[9px] bg-[#ECEFF8]/40 p-2 rounded-lg border border-gray-200/50 mb-3">
                  <div className="flex justify-between"><span className="text-gray-500">Ocupación</span><span className="text-gray-800 font-bold">95%</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Precio prom</span><span className="text-indigo-600 font-bold">$4.8M</span></div>
               </div>
               <div className="text-[9px] text-emerald-200/70 bg-emerald-900/20 px-2 py-1.5 rounded flex gap-1.5 items-start">
                  <span>💡</span> <span>Subir precio 15% por saturación de demanda (Cortex).</span>
               </div>
            </div>

            <div className="bg-white/70 rounded-xl border border-gray-200/50 p-4 relative">
               <div className="flex justify-between items-start mb-3">
                  <div>
                     <h5 className="text-[11px] font-black text-gray-800 flex items-center gap-1.5"><span className="text-gray-500">2️⃣</span> Buenos Días Chile</h5>
                     <p className="text-[9px] text-gray-500">Sonar FM</p>
                  </div>
                  <div className="text-right">
                     <p className="text-sm font-black text-gray-800">$78M</p>
                     <p className="text-[8px] font-bold text-emerald-500/70">ROI 285%</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-2 text-[9px] bg-[#ECEFF8]/40 p-2 rounded-lg border border-gray-200/50">
                  <div className="flex justify-between"><span className="text-gray-500">Ocupación</span><span className="text-emerald-600 font-bold">100%</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Lista Espera</span><span className="text-amber-600 font-bold">8 Clientes</span></div>
               </div>
            </div>
            
            <div className="bg-white/70 rounded-xl border border-gray-200/50 p-4 relative">
               <div className="flex justify-between items-start mb-3">
                  <div>
                     <h5 className="text-[11px] font-black text-gray-800 flex items-center gap-1.5"><span className="text-gray-500">3️⃣</span> Tarde Deportiva</h5>
                     <p className="text-[9px] text-gray-500">Radio 103.3</p>
                  </div>
                  <div className="text-right">
                     <p className="text-sm font-black text-gray-800">$67M</p>
                     <p className="text-[8px] font-bold text-emerald-500/70">ROI 245%</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-2 text-[9px] bg-[#ECEFF8]/40 p-2 rounded-lg border border-gray-200/50">
                  <div className="flex justify-between"><span className="text-gray-500">Ocupación</span><span className="text-gray-800 font-bold">85%</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Disponibles</span><span className="text-emerald-600 font-bold">3 Cupos</span></div>
               </div>
            </div>
         </div>

         {/* RIESGOS (SUB-UTILIZADOS) MOBILE */}
         <div className="space-y-3 mt-6">
            <h4 className="text-[9px] font-bold text-amber-500 uppercase pl-1 border-l-2 border-amber-500">⚠️ RIESGOS INVENTARIO</h4>
            
            <div className="bg-white/80/60 rounded-xl border border-amber-500/20 p-4 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full blur-xl"></div>
               <div className="flex justify-between items-start mb-3">
                  <div>
                     <h5 className="text-xs font-black text-gray-800 flex items-center gap-1.5"><span className="text-amber-500 animate-pulse">🔻</span> Noche Cultural</h5>
                     <p className="text-[9px] text-gray-500">Radio 103.3</p>
                  </div>
                  <div className="text-right">
                     <p className="text-md font-black text-amber-600">$12M</p>
                  </div>
               </div>
               
               <div className="bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/10 space-y-2">
                  <div className="flex justify-between text-[9px] border-b border-gray-200/50 pb-1">
                     <span className="text-gray-500 font-bold">Ocupación Histórica</span>
                     <span className="text-amber-600 font-black">35%</span>
                  </div>
                  <div className="text-[9px]">
                     <span className="text-amber-500 font-bold block mb-0.5">Diagnóstico</span>
                     <p className="text-gray-600">Bajo rating general, demasiado nicho para el markup actual.</p>
                  </div>
                  <div className="text-[9px] pt-1">
                     <span className="text-emerald-600 font-bold flex items-center gap-1 mb-0.5">💡 Pivot Action</span>
                     <p className="text-emerald-100/70">Re-posicionar a Premium exclusivo o reducir cuota horaria.</p>
                  </div>
               </div>
            </div>

            <div className="bg-white/80/60 rounded-xl border border-amber-500/20 p-4 relative overflow-hidden">
               <div className="flex justify-between items-start mb-3">
                  <div>
                     <h5 className="text-[11px] font-black text-gray-800 flex items-center gap-1.5"><span className="text-amber-500">🔻</span> Madrugada Info.</h5>
                     <p className="text-[9px] text-gray-500">Sonar FM</p>
                  </div>
                  <div className="text-right">
                     <span className="text-[8px] bg-red-50 text-red-600 px-1 rounded font-bold">25% OCUP</span>
                  </div>
               </div>
               
               <div className="bg-amber-950/30 p-2 rounded-lg border border-amber-500/10 text-[9px]">
                  <span className="text-emerald-600 font-bold block mb-0.5">💡 Recomendación Cortex</span>
                  <p className="text-emerald-100/70">Convertir a formato Podcast + targeting digital híbrido.</p>
               </div>
            </div>

         </div>

      </div>
    </div>
  )
}
