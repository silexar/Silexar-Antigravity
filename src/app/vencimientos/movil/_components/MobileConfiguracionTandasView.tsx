'use client'

export default function MobileConfiguracionTandasView() {
  return (
    <div className="space-y-4 pb-6">
      {/* HEADER TANDAS MOBILE */}
      <div className="flex justify-between items-center bg-white/70 p-3 rounded-xl border border-gray-200/50">
         <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
            <span>💰</span> GESTIÓN TARIFAS
         </h2>
         <div className="flex gap-2">
            <button className="bg-slate-800 text-gray-600 border border-gray-200 px-2 py-1.5 rounded font-bold uppercase text-[9px]">📊 Analytics</button>
            <button className="bg-emerald-50 text-emerald-600 border border-emerald-500/30 px-2 py-1.5 rounded font-bold uppercase text-[9px]">💾 Guardar</button>
         </div>
      </div>

      {/* BLOQUE PRIME AM MOBILE */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 relative overflow-hidden backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.05)]">
         <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-[100%] blur-2xl pointer-events-none"></div>
         
         <div className="flex justify-between items-center mb-3">
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
               <span className="text-sm">🏆</span> PRIME AM (07-10)
            </h3>
            <span className="text-[9px] bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded font-black border border-amber-400">2.5X</span>
         </div>

         <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-[#ECEFF8]/40 p-2 rounded-lg border border-gray-200/50">
               <p className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Audiencia</p>
               <p className="text-xs text-gray-800 font-black">45K <span className="text-[8px] text-gray-500">oyts</span></p>
            </div>
            <div className="bg-[#ECEFF8]/40 p-2 rounded-lg border border-gray-200/50">
               <p className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Rating</p>
               <p className="text-xs text-gray-800 font-black">12.5 <span className="text-[8px] text-gray-500">pts</span></p>
            </div>
         </div>

         <div className="bg-white/80/80 rounded-lg p-2.5">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[9px]">
               <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500">5"</span><span className="font-bold text-gray-800">$95K</span></div>
               <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500">10"</span><span className="font-bold text-gray-800">$180K</span></div>
               <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500">15"</span><span className="font-bold text-gray-800">$265K</span></div>
               <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500">20"</span><span className="font-bold text-gray-800">$350K</span></div>
               <div className="flex justify-between border-b border-amber-500/20 pb-1"><span className="text-gray-500">30"</span><span className="font-black text-amber-600">$520K</span></div>
               <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500">45"</span><span className="font-bold text-gray-800">$775K</span></div>
            </div>
         </div>
      </div>

      {/* BLOQUE PRIME PM MOBILE */}
      <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 relative overflow-hidden backdrop-blur-md">
         <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-[100%] blur-2xl pointer-events-none"></div>
         
         <div className="flex justify-between items-center mb-3">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
               <span className="text-sm">🥇</span> PRIME PM (17-20)
            </h3>
            <span className="text-[9px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-black border border-indigo-400">2.2X</span>
         </div>

         <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-[#ECEFF8]/40 p-2 rounded-lg border border-gray-200/50">
               <p className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Audiencia</p>
               <p className="text-xs text-gray-800 font-black">38K <span className="text-[8px] text-gray-500">oyts</span></p>
            </div>
            <div className="bg-[#ECEFF8]/40 p-2 rounded-lg border border-gray-200/50">
               <p className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Rating</p>
               <p className="text-xs text-gray-800 font-black">10.8 <span className="text-[8px] text-gray-500">pts</span></p>
            </div>
         </div>

         <div className="bg-white/80/80 rounded-lg p-2.5">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[9px]">
               <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500">5"</span><span className="font-bold text-gray-800">$84K</span></div>
               <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500">10"</span><span className="font-bold text-gray-800">$158K</span></div>
               <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500">15"</span><span className="font-bold text-gray-800">$233K</span></div>
               <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500">20"</span><span className="font-bold text-gray-800">$308K</span></div>
               <div className="flex justify-between border-b border-indigo-500/20 pb-1"><span className="text-gray-500">30"</span><span className="font-black text-indigo-600">$458K</span></div>
               <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500">45"</span><span className="font-bold text-gray-800">$683K</span></div>
            </div>
         </div>
      </div>

      {/* BLOQUE REPARTIDA ESTÁNDAR MOBILE */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 relative overflow-hidden backdrop-blur-md">
         <div className="flex justify-between items-center mb-3">
            <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
               <span className="text-sm">📊</span> REPARTIDA (10-17)
            </h3>
            <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-black border border-emerald-500/30">BASE 1.0X</span>
         </div>

         <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-[#ECEFF8]/40 p-2 rounded-lg border border-gray-200/50">
               <p className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Audiencia</p>
               <p className="text-xs text-gray-800 font-black">22K <span className="text-[8px] text-gray-500">oyts</span></p>
            </div>
            <div className="bg-[#ECEFF8]/40 p-2 rounded-lg border border-gray-200/50">
               <p className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Rating</p>
               <p className="text-xs text-gray-800 font-black">6.5 <span className="text-[8px] text-gray-500">pts</span></p>
            </div>
         </div>

         <div className="bg-white/80/80 rounded-lg p-2.5">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[9px]">
               <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500">5"</span><span className="font-bold text-gray-800">$38K</span></div>
               <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500">10"</span><span className="font-bold text-gray-800">$72K</span></div>
               <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500">15"</span><span className="font-bold text-gray-800">$106K</span></div>
               <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500">20"</span><span className="font-bold text-gray-800">$140K</span></div>
               <div className="flex justify-between border-b border-emerald-500/20 pb-1"><span className="text-gray-500">30"</span><span className="font-black text-emerald-600">$208K</span></div>
               <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500">45"</span><span className="font-bold text-gray-800">$310K</span></div>
            </div>
         </div>
      </div>

      {/* BLOQUE NOCHE MOBILE */}
      <div className="rounded-xl border border-slate-500/30 bg-slate-800/20 p-4 relative overflow-hidden backdrop-blur-md opacity-90">
         <div className="flex justify-between items-center mb-3">
            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5">
               <span className="text-sm">🌙</span> NOCHE (20-00)
            </h3>
            <span className="text-[9px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-black border border-red-500/30">0.7X</span>
         </div>

         <div className="bg-white/80/80 rounded-lg p-2.5">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[9px] text-gray-600">
               <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500">5"</span><span>$26.6K</span></div>
               <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500">10"</span><span>$50.4K</span></div>
               <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500">15"</span><span>$74.2K</span></div>
               <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500">20"</span><span>$98K</span></div>
               <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500">30"</span><span className="font-black text-gray-800">$145K</span></div>
               <div className="flex justify-between border-b border-gray-200/50 pb-1"><span className="text-gray-500">45"</span><span>$217K</span></div>
            </div>
         </div>
      </div>

    </div>
  )
}
