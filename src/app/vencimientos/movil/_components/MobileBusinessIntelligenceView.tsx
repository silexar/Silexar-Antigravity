'use client'

export default function MobileBusinessIntelligenceView() {
  return (
    <div className="space-y-4 pb-6">
      {/* HEADER MOBILE */}
      <div className="bg-white/70 p-4 rounded-xl border border-gray-200/50 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 blur-xl rounded-bl-full pointer-events-none"></div>
         <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
            <span className="text-xl animate-spin-slow">📊</span> BUSINESS INTEL
         </h2>
         <p className="text-[10px] text-emerald-600 mt-1 font-bold">PERFORMANCE ENERO 2025</p>
         
         <div className="flex gap-2 mt-3 flex-wrap">
            <button className="bg-slate-800 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg font-bold uppercase text-[9px] flex-1">
               🎯 Oportunidades
            </button>
            <button className="bg-slate-800 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg font-bold uppercase text-[9px] flex-1">
               📈 Análisis
            </button>
         </div>
      </div>

      {/* MÉTRICAS FINANCIERAS */}
      <div className="bg-white/80/60 rounded-xl border border-gray-200/50 p-4 relative overflow-hidden">
         <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="text-emerald-500">🎯</span> PERFORMANCE GLOBAL
         </h3>

         <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-[#ECEFF8]/50 p-2.5 rounded-lg border border-gray-200/50">
               <p className="text-[8px] uppercase font-bold text-gray-500">Revenue</p>
               <p className="text-sm font-black text-emerald-600">$847M</p>
               <p className="text-[8px] text-gray-500">70.6% Ocup.</p>
            </div>
            <div className="bg-[#ECEFF8]/50 p-2.5 rounded-lg border border-gray-200/50">
               <p className="text-[8px] uppercase font-bold text-gray-500">Precio Promedio</p>
               <p className="text-sm font-black text-indigo-600">$3.6M</p>
               <p className="text-[8px] text-gray-500">Por cupo/mes</p>
            </div>
         </div>

         {/* BARRAS DE HORARIO MOBILE */}
         <div className="space-y-2 mt-4 pt-4 border-t border-gray-200/50">
            <h4 className="text-[9px] font-bold text-gray-500 mb-2 uppercase">Concentración Horaria</h4>
            <div>
               <div className="flex justify-between text-[9px] mb-1"><span className="text-gray-800">Prime AM</span><span className="text-emerald-600 font-bold">50%</span></div>
               <div className="h-1.5 w-full bg-slate-800 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{width: '50%'}}></div></div>
            </div>
            <div>
               <div className="flex justify-between text-[9px] mb-1"><span className="text-gray-800">Prime PM</span><span className="text-indigo-600 font-bold">32%</span></div>
               <div className="h-1.5 w-full bg-slate-800 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{width: '32%'}}></div></div>
            </div>
         </div>
      </div>

      {/* PREDICCIONES CORTEX MOBILE */}
      <div className="bg-indigo-950/20 rounded-xl border border-indigo-500/30 p-4 relative overflow-hidden backdrop-blur-sm">
         <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 blur-xl pointer-events-none"></div>
         <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span>🔮</span> PREDICCIONES Q1
         </h3>

         <div className="space-y-3">
            <div className="flex justify-between items-end border-b border-indigo-500/20 pb-2">
               <div>
                  <p className="text-[9px] text-gray-500 uppercase font-bold">Revenue Q1</p>
                  <p className="text-lg font-black text-indigo-600">$2.8B</p>
               </div>
               <div className="text-right">
                  <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">+15% YoY</span>
               </div>
            </div>
            
            <div className="flex justify-between items-center bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/20 mt-2">
               <div className="flex items-center gap-2">
                  <span className="animate-pulse text-amber-500">⚠️</span>
                  <div>
                     <p className="text-[9px] text-amber-600 font-bold uppercase">Riesgo Fuga</p>
                     <p className="text-[8px] text-gray-500">Proceso competitivo</p>
                  </div>
               </div>
               <p className="text-sm font-black text-amber-500">$45M</p>
            </div>
         </div>
      </div>

      {/* RANKING EMISORAS MOBILE */}
      <div className="bg-white/80/60 rounded-xl border border-gray-200/50 p-4">
         <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="text-emerald-500">📻</span> RANKING EMISORAS
         </h3>

         <div className="space-y-2">
            {[
               { id: "T13 RADIO", val: "$312M", rank: "🏆", pct: "37%" },
               { id: "SONAR FM", val: "$245M", rank: "🥈", pct: "29%" },
               { id: "RADIO 103.3", val: "$198M", rank: "🥉", pct: "23%" }
            ].map(emi => (
               <div key={emi.id} className="bg-[#ECEFF8]/40 border border-gray-200/50 p-2 rounded-lg flex justify-between items-center">
                  <div className="flex items-center gap-2">
                     <span className="text-sm">{emi.rank}</span>
                     <span className="text-[10px] font-bold text-gray-800">{emi.id}</span>
                  </div>
                  <div className="text-right">
                     <p className="text-xs font-black text-emerald-600">{emi.val}</p>
                     <p className="text-[8px] text-gray-500">{emi.pct}</p>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* TOP CLIENTES MOBILE */}
      <div className="bg-white/80/60 rounded-xl border border-gray-200/50 p-4">
         <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="text-amber-500">🏢</span> TOP CLIENTES
         </h3>

         <div className="space-y-3">
            {[
               { name: "Clínica Alemana", rev: "$145M", color: "text-amber-600" },
               { name: "Banco de Chile", rev: "$89M", color: "text-gray-600" },
               { name: "Movistar", rev: "$67M", color: "text-gray-500" }
            ].map((c, i) => (
               <div key={`${c}-${i}`} className="flex justify-between items-center border-b border-gray-200/50 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                     <span className={`text-[10px] font-black w-4 text-center ${i === 0 ? 'text-amber-500' : 'text-slate-600'}`}>{i+1}</span>
                     <p className={`text-[10px] font-bold ${i === 0 ? 'text-gray-800' : 'text-gray-600'}`}>{c.name}</p>
                  </div>
                  <span className={`text-xs font-black ${c.color}`}>{c.rev}</span>
               </div>
            ))}
         </div>
      </div>

    </div>
  )
}
