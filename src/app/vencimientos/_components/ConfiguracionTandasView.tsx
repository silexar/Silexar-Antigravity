'use client'

export default function ConfiguracionTandasView() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
            <span className="text-2xl">💰</span> CONFIGURACIÓN MAESTRA DE TANDAS Y TARIFARIO
         </h2>
         <div className="flex gap-2">
            <button className="bg-slate-800 hover:bg-slate-700 text-gray-600 border border-gray-200 px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs transition-colors">📊 Analytics</button>
            <button className="bg-slate-800 hover:bg-slate-700 text-gray-600 border border-gray-200 px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs transition-colors">🔄 Actualizar</button>
            <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.3)] px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs transition-colors">💾 Guardar</button>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 relative z-10 w-full">
         
         {/* PRIME AM */}
         <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 relative overflow-hidden backdrop-blur-md shadow-[0_0_30px_rgba(245,158,11,0.05)]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-bl-[100%] blur-3xl pointer-events-none"></div>
            
            <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 mb-6">
               <span className="text-xl">🏆</span> PRIME AM (07:00-10:00)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 relative z-10">
               <div className="bg-[#ECEFF8]/40 p-3 rounded-xl border border-gray-200/50">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Multiplicador</p>
                  <p className="text-lg text-emerald-600 font-black">2.5x <span className="text-[10px] text-gray-500 font-medium tracking-normal">base</span></p>
               </div>
               <div className="bg-[#ECEFF8]/40 p-3 rounded-xl border border-gray-200/50">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Audiencia Prom.</p>
                  <p className="text-lg text-gray-800 font-black">45,000 <span className="text-[10px] text-gray-500 font-medium tracking-normal">oyentes</span></p>
               </div>
               <div className="bg-[#ECEFF8]/40 p-3 rounded-xl border border-gray-200/50">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Rating Prom.</p>
                  <p className="text-lg text-gray-800 font-black">12.5 <span className="text-[10px] text-gray-500 font-medium tracking-normal">pts</span></p>
               </div>
            </div>

            <div className="bg-white/80/60 rounded-xl border border-amber-500/10 p-4 relative z-10">
               <h4 className="text-[10px] text-amber-500/80 font-black uppercase tracking-widest mb-3">💰 TARIFAS POR DURACIÓN (CLP)</h4>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50"><span className="text-[10px] text-gray-500">5"</span><span className="text-xs font-bold text-gray-800">$95,000</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50"><span className="text-[10px] text-gray-500">10"</span><span className="text-xs font-bold text-gray-800">$180,000</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50"><span className="text-[10px] text-gray-500">15"</span><span className="text-xs font-bold text-gray-800">$265,000</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50"><span className="text-[10px] text-gray-500">20"</span><span className="text-xs font-bold text-gray-800">$350,000</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50"><span className="text-[10px] text-gray-500">30"</span><span className="text-xs font-black text-amber-600">$520,000</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50"><span className="text-[10px] text-gray-500">45"</span><span className="text-xs font-bold text-gray-800">$775,000</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50"><span className="text-[10px] text-gray-500">60"</span><span className="text-xs font-bold text-gray-800">$1,030,000</span></div>
                  <div className="flex justify-center items-center"><button className="text-[10px] text-amber-500 border-b border-amber-500/30 uppercase font-black hover:text-amber-600">Editar ▸</button></div>
               </div>
            </div>
         </div>

         {/* PRIME PM */}
         <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-6 relative overflow-hidden backdrop-blur-md">
            <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mb-6">
               <span className="text-xl">🥇</span> PRIME PM (17:00-20:00)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
               <div className="bg-[#ECEFF8]/40 p-3 rounded-xl border border-gray-200/50">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Multiplicador</p>
                  <p className="text-lg text-emerald-600 font-black">2.2x <span className="text-[10px] text-gray-500 font-medium tracking-normal">base</span></p>
               </div>
               <div className="bg-[#ECEFF8]/40 p-3 rounded-xl border border-gray-200/50">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Audiencia Prom.</p>
                  <p className="text-lg text-gray-800 font-black">38,000 <span className="text-[10px] text-gray-500 font-medium tracking-normal">oyentes</span></p>
               </div>
               <div className="bg-[#ECEFF8]/40 p-3 rounded-xl border border-gray-200/50">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Rating Prom.</p>
                  <p className="text-lg text-gray-800 font-black">10.8 <span className="text-[10px] text-gray-500 font-medium tracking-normal">pts</span></p>
               </div>
            </div>

            <div className="bg-white/80/60 rounded-xl border border-indigo-500/10 p-4">
               <h4 className="text-[10px] text-indigo-600/80 font-black uppercase tracking-widest mb-3">💰 TARIFAS POR DURACIÓN (CLP)</h4>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50"><span className="text-[10px] text-gray-500">5"</span><span className="text-xs font-bold text-gray-800">$84,000</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50"><span className="text-[10px] text-gray-500">10"</span><span className="text-xs font-bold text-gray-800">$158,000</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50"><span className="text-[10px] text-gray-500">15"</span><span className="text-xs font-bold text-gray-800">$233,000</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50"><span className="text-[10px] text-gray-500">20"</span><span className="text-xs font-bold text-gray-800">$308,000</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50"><span className="text-[10px] text-gray-500">30"</span><span className="text-xs font-black text-indigo-600">$458,000</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50"><span className="text-[10px] text-gray-500">45"</span><span className="text-xs font-bold text-gray-800">$683,000</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50"><span className="text-[10px] text-gray-500">60"</span><span className="text-xs font-bold text-gray-800">$908,000</span></div>
                  <div className="flex justify-center items-center"><button className="text-[10px] text-indigo-600 border-b border-indigo-500/30 uppercase font-black hover:text-indigo-600">Editar ▸</button></div>
               </div>
            </div>
         </div>

         {/* REPARTIDA ESTÁNDAR */}
         <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 relative overflow-hidden backdrop-blur-md">
            <h3 className="text-sm font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 mb-6">
               <span className="text-xl">📊</span> REPARTIDA ESTÁNDAR (10:00-17:00)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
               <div className="bg-[#ECEFF8]/40 p-3 rounded-xl border border-gray-200/50">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Multiplicador</p>
                  <p className="text-lg text-emerald-600 font-black">1.0x <span className="text-[10px] text-gray-500 font-medium tracking-normal">base</span></p>
               </div>
               <div className="bg-[#ECEFF8]/40 p-3 rounded-xl border border-gray-200/50">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Audiencia Prom.</p>
                  <p className="text-lg text-gray-800 font-black">22,000 <span className="text-[10px] text-gray-500 font-medium tracking-normal">oyentes</span></p>
               </div>
               <div className="bg-[#ECEFF8]/40 p-3 rounded-xl border border-gray-200/50">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Rating Prom.</p>
                  <p className="text-lg text-gray-800 font-black">6.5 <span className="text-[10px] text-gray-500 font-medium tracking-normal">pts</span></p>
               </div>
            </div>

            <div className="bg-white/80/60 rounded-xl border border-emerald-500/10 p-4">
               <h4 className="text-[10px] text-emerald-500/80 font-black uppercase tracking-widest mb-3">💰 TARIFAS POR DURACIÓN (CLP) - <span className="text-gray-800">LAS BASES</span></h4>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50"><span className="text-[10px] text-gray-500">5"</span><span className="text-xs font-bold text-gray-800">$38,000</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50"><span className="text-[10px] text-gray-500">10"</span><span className="text-xs font-bold text-gray-800">$72,000</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50"><span className="text-[10px] text-gray-500">15"</span><span className="text-xs font-bold text-gray-800">$106,000</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50"><span className="text-[10px] text-gray-500">20"</span><span className="text-xs font-bold text-gray-800">$140,000</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-emerald-500/30"><span className="text-[10px] text-gray-500">30"</span><span className="text-xs font-black text-emerald-600">$208,000</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50"><span className="text-[10px] text-gray-500">45"</span><span className="text-xs font-bold text-gray-800">$310,000</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50"><span className="text-[10px] text-gray-500">60"</span><span className="text-xs font-bold text-gray-800">$412,000</span></div>
                  <div className="flex justify-center items-center"><button className="text-[10px] text-emerald-500 border-b border-emerald-500/30 uppercase font-black hover:text-emerald-600">Editar ▸</button></div>
               </div>
            </div>
         </div>

         {/* NOCHE */}
         <div className="rounded-2xl border border-slate-500/30 bg-slate-800/20 p-6 relative overflow-hidden backdrop-blur-md">
            <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest flex items-center gap-2 mb-6">
               <span className="text-xl">🌙</span> NOCHE (20:00-00:00)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
               <div className="bg-[#ECEFF8]/40 p-3 rounded-xl border border-gray-200/50">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Multiplicador</p>
                  <p className="text-lg text-red-600 font-black">0.7x <span className="text-[10px] text-gray-500 font-medium tracking-normal">base</span></p>
               </div>
               <div className="bg-[#ECEFF8]/40 p-3 rounded-xl border border-gray-200/50">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Audiencia Prom.</p>
                  <p className="text-lg text-gray-800 font-black">15,000 <span className="text-[10px] text-gray-500 font-medium tracking-normal">oyentes</span></p>
               </div>
               <div className="bg-[#ECEFF8]/40 p-3 rounded-xl border border-gray-200/50">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Rating Prom.</p>
                  <p className="text-lg text-gray-800 font-black">4.2 <span className="text-[10px] text-gray-500 font-medium tracking-normal">pts</span></p>
               </div>
            </div>

            <div className="bg-white/80/60 rounded-xl border border-slate-500/10 p-4">
               <h4 className="text-[10px] text-gray-500/80 font-black uppercase tracking-widest mb-3">💰 TARIFAS POR DURACIÓN (CLP)</h4>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50 opacity-70"><span className="text-[10px] text-gray-500">5"</span><span className="text-xs font-bold text-gray-800">$26,600</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50 opacity-70"><span className="text-[10px] text-gray-500">10"</span><span className="text-xs font-bold text-gray-800">$50,400</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50 opacity-70"><span className="text-[10px] text-gray-500">15"</span><span className="text-xs font-bold text-gray-800">$74,200</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50 opacity-70"><span className="text-[10px] text-gray-500">20"</span><span className="text-xs font-bold text-gray-800">$98,000</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-slate-500/30"><span className="text-[10px] text-gray-500">30"</span><span className="text-xs font-black text-gray-600">$145,600</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50 opacity-70"><span className="text-[10px] text-gray-500">45"</span><span className="text-xs font-bold text-gray-800">$217,000</span></div>
                  <div className="flex justify-between items-center bg-[#ECEFF8]/50 p-2 rounded border border-gray-200/50 opacity-70"><span className="text-[10px] text-gray-500">60"</span><span className="text-xs font-bold text-gray-800">$288,400</span></div>
                  <div className="flex justify-center items-center"><button className="text-[10px] text-gray-500 border-b border-slate-500/30 uppercase font-black hover:text-gray-800">Editar ▸</button></div>
               </div>
            </div>
         </div>

      </div>
    </div>
  )
}
