'use client'

export default function ConfiguracionSenalesEspecialesView() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
            <span className="text-2xl">🌡️</span> CONFIGURACIÓN DE SEÑALES ESPECIALES
         </h2>
         <div className="flex gap-2">
            <button className="bg-slate-800 hover:bg-slate-700 text-gray-600 border border-gray-200 px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs transition-colors">➕ Crear Señal</button>
            <button className="bg-slate-800 hover:bg-slate-700 text-gray-600 border border-gray-200 px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs transition-colors">💰 Editar Precios</button>
            <button className="bg-indigo-500/10 hover:bg-indigo-50 text-indigo-600 border border-indigo-500/30 px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs transition-colors">📊 Performance</button>
            <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.3)] px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs transition-colors">💾 Guardar</button>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
         
         {/* SEÑALES DE TEMPERATURA */}
         <div className="rounded-2xl border border-red-500/20 bg-white/70 p-6 relative overflow-hidden backdrop-blur-md">
            <h3 className="text-sm font-black text-red-600 uppercase tracking-widest flex items-center gap-2 mb-5">
               <span className="text-xl">🌡️</span> SEÑALES DE TEMPERATURA
            </h3>

            <div className="space-y-4">
               {/* Temperatura 1 */}
               <div className="bg-[#ECEFF8]/60 p-4 rounded-xl border border-red-500/30 relative">
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded bg-red-50 border border-red-500/20">
                     <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>
                     <span className="text-[9px] text-red-600 font-bold uppercase">CANAL 13 - TELETECE</span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-gray-800 mb-3">TEMPERATURA 1 (Mañanas)</h4>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                     <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Horarios</span><span className="text-gray-600">07:30, 08:30, 09:30</span></div>
                     <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Duración</span><span className="text-gray-600">5 segs fijos</span></div>
                     <div className="col-span-2"><span className="text-gray-500 block text-[9px] uppercase font-bold">Formato</span><span className="text-gray-500 italic">"La temperatura actual es X grados"</span></div>
                     <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Exclusividad</span><span className="text-gray-600">1 Cliente</span></div>
                     <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Tarifa Base</span><span className="text-red-600 font-black">$1,500,000/mes</span></div>
                  </div>
               </div>

               {/* Temperatura 2 */}
               <div className="bg-[#ECEFF8]/40 p-4 rounded-xl border border-emerald-500/30 relative shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-50 border border-emerald-500/20">
                     <span className="text-emerald-500">💎</span><span className="text-[9px] text-emerald-600 font-bold uppercase">DISPONIBLE</span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-gray-800 mb-3">TEMPERATURA 2 (Tardes)</h4>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                     <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Horarios</span><span className="text-gray-600">12:30, 14:30, 16:30</span></div>
                     <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Duración</span><span className="text-gray-600">5 segs fijos</span></div>
                     <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Exclusividad</span><span className="text-gray-600">1 Cliente</span></div>
                     <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Tarifa Base</span><span className="text-emerald-600 font-black">$1,200,000/mes</span></div>
                  </div>
                  <button className="w-full mt-3 py-1.5 bg-emerald-50 hover:bg-emerald-50 text-emerald-600 font-bold text-xs uppercase rounded transition-colors border border-emerald-500/30">Vender Cupo</button>
               </div>

               {/* Temperatura 3 */}
               <div className="bg-[#ECEFF8]/40 p-4 rounded-xl border border-emerald-500/30 relative">
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-50 border border-emerald-500/20">
                     <span className="text-emerald-500">💎</span><span className="text-[9px] text-emerald-600 font-bold uppercase">DISPONIBLE</span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-gray-800 mb-3">TEMPERATURA 3 (Noches)</h4>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                     <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Horarios</span><span className="text-gray-600">18:30, 19:30</span></div>
                     <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Duración</span><span className="text-gray-600">5 segs fijos</span></div>
                     <div className="col-span-2"><span className="text-gray-500 block text-[9px] uppercase font-bold">Tarifa Base</span><span className="text-emerald-600 font-black">$1,300,000/mes</span></div>
                  </div>
               </div>
            </div>
         </div>

         {/* MICROS ESPECIALES */}
         <div className="rounded-2xl border border-indigo-500/20 bg-white/70 p-6 relative overflow-hidden backdrop-blur-md">
            <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mb-5">
               <span className="text-xl">🎙️</span> MICROS ESPECIALES
            </h3>

            <div className="space-y-4">
               {/* Micro Informativo */}
               <div className="bg-[#ECEFF8]/40 p-4 rounded-xl border border-gray-200/50 relative">
                  <h4 className="text-sm font-bold text-gray-800 mb-1"><span className="text-amber-500">📻</span> MICRO INFORMATIVO</h4>
                  <p className="text-[10px] text-gray-500 italic mb-4">Información útil + mención cliente integrada.</p>
                  
                  <div className="grid grid-cols-2 gap-y-3 text-xs mb-4">
                     <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Duración</span><span className="text-gray-600">10-15 segundos</span></div>
                     <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Frecuencia</span><span className="text-gray-600">3 veces / día</span></div>
                     <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Cupos Globales</span><span className="text-gray-600">3 Marcas Simultáneas</span></div>
                     <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Tarifa</span><span className="text-indigo-600 font-black">$800,000/mes</span></div>
                  </div>

                  <div className="bg-white/80 rounded p-2 border border-gray-200/50 flex gap-1">
                     <div className="h-1.5 flex-1 bg-red-500 rounded-full" title="Ocupado"></div>
                     <div className="h-1.5 flex-1 bg-emerald-500 rounded-full" title="Disponible"></div>
                     <div className="h-1.5 flex-1 bg-emerald-500 rounded-full" title="Disponible"></div>
                  </div>
                  <p className="text-[9px] text-right mt-1 text-gray-500 font-bold">1 Ocupado • <span className="text-emerald-500">2 Disponibles</span></p>
               </div>

               {/* Micro Entretenimiento */}
               <div className="bg-[#ECEFF8]/40 p-4 rounded-xl border border-gray-200/50 relative">
                  <h4 className="text-sm font-bold text-gray-800 mb-1"><span className="text-amber-500">🎭</span> MICRO ENTRETE</h4>
                  <p className="text-[10px] text-gray-500 italic mb-4">Dato curioso + mención breve.</p>
                  
                  <div className="grid grid-cols-2 gap-y-3 text-xs mb-4">
                     <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Duración</span><span className="text-gray-600">15 segundos fijos</span></div>
                     <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Frecuencia</span><span className="text-gray-600">2 veces / día</span></div>
                     <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Cupos Globales</span><span className="text-gray-600">4 Marcas Simultáneas</span></div>
                     <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Tarifa</span><span className="text-indigo-600 font-black">$600,000/mes</span></div>
                  </div>

                  <div className="bg-white/80 rounded p-2 border border-gray-200/50 flex gap-1">
                     <div className="h-1.5 flex-1 bg-red-500 rounded-full"></div>
                     <div className="h-1.5 flex-1 bg-red-500 rounded-full"></div>
                     <div className="h-1.5 flex-1 bg-emerald-500 rounded-full"></div>
                     <div className="h-1.5 flex-1 bg-emerald-500 rounded-full"></div>
                  </div>
                  <p className="text-[9px] text-right mt-1 text-gray-500 font-bold">2 Ocupados • <span className="text-emerald-500">2 Disponibles</span></p>
               </div>
            </div>
         </div>

         {/* CORTINAS MUSICALES */}
         <div className="rounded-2xl border border-amber-500/20 bg-white/70 p-6 relative overflow-hidden backdrop-blur-md">
            <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 mb-5">
               <span className="text-xl">🎵</span> CORTINAS PATROCINADAS
            </h3>

            <div className="space-y-4">
               {/* Cortina Entrada */}
               <div className="bg-[#ECEFF8]/60 p-4 rounded-xl border border-red-500/30 relative">
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded bg-red-50 border border-red-500/20">
                     <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>
                     <span className="text-[9px] text-red-600 font-bold uppercase">Clínica Alemana</span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-gray-800 mb-2"><span className="text-gray-500">🎼</span> APERTURA PROGRAMA</h4>
                  
                  <div className="bg-white/80 p-2 rounded border border-gray-200/50 mb-3">
                     <p className="text-gray-500 italic text-[10px] text-center">"Con el auspicio de [CLIENTE]"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                     <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Duración</span><span className="text-gray-600">8 segs</span></div>
                     <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Exclusividad</span><span className="text-gray-600 text-amber-600">Total (1 Cliente)</span></div>
                     <div className="col-span-2"><span className="text-gray-500 block text-[9px] uppercase font-bold">Tarifa Base</span><span className="text-red-600 font-black">$2,500,000/mes</span></div>
                  </div>
               </div>

               {/* Cortina Cierre */}
               <div className="bg-[#ECEFF8]/40 p-4 rounded-xl border border-emerald-500/30 relative shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-50 border border-emerald-500/20">
                     <span className="text-emerald-500">💎</span><span className="text-[9px] text-emerald-600 font-bold uppercase">DISPONIBLE</span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-gray-800 mb-2"><span className="text-gray-500">🎼</span> CIERRE PROGRAMA</h4>
                  
                  <div className="bg-white/80 p-2 rounded border border-gray-200/50 mb-3">
                     <p className="text-gray-500 italic text-[10px] text-center">"...Esto fue posible gracias a [CLIENTE]"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                     <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Duración</span><span className="text-gray-600">6 segs</span></div>
                     <div><span className="text-gray-500 block text-[9px] uppercase font-bold">Exclusividad</span><span className="text-gray-600 text-amber-600">Total (1 Cliente)</span></div>
                     <div className="col-span-2"><span className="text-gray-500 block text-[9px] uppercase font-bold">Tarifa Base</span><span className="text-emerald-600 font-black">$2,000,000/mes</span></div>
                  </div>
                  <button className="w-full mt-3 py-1.5 bg-emerald-50 hover:bg-emerald-50 text-emerald-600 font-bold text-xs uppercase rounded transition-colors border border-emerald-500/30">Vender Naming</button>
               </div>
            </div>
         </div>

      </div>
    </div>
  )
}
