'use client'

export default function MobileConfiguracionSenalesEspecialesView() {
  return (
    <div className="space-y-4 pb-6">
      {/* HEADER MOBILE */}
      <div className="flex justify-between items-center bg-white/70 p-3 rounded-xl border border-gray-200/50">
         <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
            <span>🌡️</span> SEÑALES ESPECIALES
         </h2>
         <button className="bg-emerald-50 text-emerald-600 border border-emerald-500/30 px-2 py-1.5 rounded font-bold uppercase text-[9px]">💾 Guardar</button>
      </div>

      {/* BLOQUE TEMPERATURAS MOBILE */}
      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-4">
         SEÑALES DE TEMPERATURA
      </h3>
      
      <div className="space-y-3">
         {/* T1 */}
         <div className="bg-white/70 p-3 rounded-xl border border-red-500/20 relative backdrop-blur-sm">
            <div className="flex justify-between items-start mb-2">
               <div>
                  <h4 className="text-xs font-bold text-gray-800 leading-tight">TEMPERATURA 1</h4>
                  <p className="text-[9px] text-gray-500">07:30, 08:30, 09:30 (5s)</p>
               </div>
               <span className="text-[8px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-bold border border-red-500/20">CANAL 13</span>
            </div>
            <div className="flex justify-between items-end mt-2">
               <span className="text-[8px] text-gray-500 uppercase font-bold">Base: <span className="text-[10px] text-red-600 font-black">$1.5M/mes</span></span>
            </div>
         </div>

         {/* T2 */}
         <div className="bg-white/70 p-3 rounded-xl border border-emerald-500/20 relative backdrop-blur-sm">
            <div className="flex justify-between items-start mb-2">
               <div>
                  <h4 className="text-xs font-bold text-gray-800 leading-tight">TEMPERATURA 2</h4>
                  <p className="text-[9px] text-gray-500">12:30, 14:30, 16:30 (5s)</p>
               </div>
               <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold border border-emerald-500/20">DISPONIBLE</span>
            </div>
            <div className="flex justify-between items-end mt-2">
               <span className="text-[8px] text-gray-500 uppercase font-bold">Base: <span className="text-[10px] text-emerald-600 font-black">$1.2M/mes</span></span>
               <button className="bg-emerald-50 text-emerald-600 border border-emerald-500/30 px-3 py-1 rounded font-bold uppercase text-[9px]">Vender</button>
            </div>
         </div>
      </div>

      {/* BLOQUE MICROS MOBILE */}
      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-6">
         MICROS ESPECIALES
      </h3>

      <div className="space-y-3">
         {/* Micro Info */}
         <div className="bg-white/70 p-3 rounded-xl border border-gray-200/50 relative backdrop-blur-sm">
            <h4 className="text-xs font-bold text-gray-800 mb-0.5"><span className="text-amber-500">📻</span> M. INFORMATIVO</h4>
            <p className="text-[9px] text-gray-500 mb-2">3 V/Día • 10-15s (Info + Mención)</p>
            
            <div className="bg-[#ECEFF8]/50 rounded-lg p-2 mb-2 flex gap-1">
               <div className="h-1 flex-1 bg-red-500 rounded-full"></div>
               <div className="h-1 flex-1 bg-emerald-500 rounded-full"></div>
               <div className="h-1 flex-1 bg-emerald-500 rounded-full"></div>
            </div>
            
            <div className="flex justify-between items-end mt-1">
               <span className="text-[8px] text-gray-500 uppercase font-bold">Tarifa: <span className="text-[10px] text-indigo-600 font-black">$800K/mes</span></span>
               <span className="text-[8px] text-emerald-600 font-bold">2 Disponibles</span>
            </div>
         </div>

         {/* Micro Entrete */}
         <div className="bg-white/70 p-3 rounded-xl border border-gray-200/50 relative backdrop-blur-sm">
            <h4 className="text-xs font-bold text-gray-800 mb-0.5"><span className="text-amber-500">🎭</span> M. ENTRETE</h4>
            <p className="text-[9px] text-gray-500 mb-2">2 V/Día • 15s fijos (Dato + Mención)</p>
            
            <div className="bg-[#ECEFF8]/50 rounded-lg p-2 mb-2 flex gap-1">
               <div className="h-1 flex-1 bg-red-500 rounded-full"></div>
               <div className="h-1 flex-1 bg-red-500 rounded-full"></div>
               <div className="h-1 flex-1 bg-emerald-500 rounded-full"></div>
               <div className="h-1 flex-1 bg-emerald-500 rounded-full"></div>
            </div>
            
            <div className="flex justify-between items-end mt-1">
               <span className="text-[8px] text-gray-500 uppercase font-bold">Tarifa: <span className="text-[10px] text-indigo-600 font-black">$600K/mes</span></span>
               <span className="text-[8px] text-emerald-600 font-bold">2 Disponibles</span>
            </div>
         </div>
      </div>

      {/* BLOQUE CORTINAS MOBILE */}
      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-6">
         CORTINAS MUSICALES
      </h3>

      <div className="space-y-3">
         {/* Entrada */}
         <div className="bg-white/70 p-3 rounded-xl border border-red-500/20 relative backdrop-blur-sm">
            <div className="flex justify-between items-start mb-2">
               <div>
                  <h4 className="text-xs font-bold text-gray-800 leading-tight">🎼 APERTURA</h4>
                  <p className="text-[9px] text-gray-500">"Con el auspicio de..." (8s)</p>
               </div>
               <span className="text-[8px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-bold border border-red-500/20">CLÍNICA ALEMANA</span>
            </div>
            <div className="flex justify-between items-end mt-2">
               <span className="text-[8px] text-gray-500 uppercase font-bold">Base: <span className="text-[10px] text-red-600 font-black">$2.5M/mes</span></span>
            </div>
         </div>

         {/* Cierre */}
         <div className="bg-white/70 p-3 rounded-xl border border-emerald-500/20 relative backdrop-blur-sm">
            <div className="flex justify-between items-start mb-2">
               <div>
                  <h4 className="text-xs font-bold text-gray-800 leading-tight">🎼 CIERRE</h4>
                  <p className="text-[9px] text-gray-500">"...gracias a..." (6s)</p>
               </div>
               <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold border border-emerald-500/20">DISPONIBLE</span>
            </div>
            <div className="flex justify-between items-end mt-2">
               <span className="text-[8px] text-gray-500 uppercase font-bold">Base: <span className="text-[10px] text-emerald-600 font-black">$2.0M/mes</span></span>
               <button className="bg-emerald-50 text-emerald-600 border border-emerald-500/30 px-3 py-1 rounded font-bold uppercase text-[9px]">Vender</button>
            </div>
         </div>
      </div>
    </div>
  )
}
