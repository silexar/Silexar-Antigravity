'use client'

export default function BusinessIntelligenceView() {
  return (
    <div className="space-y-6">
      {/* GLOBAL HEADER */}
      <div className="flex justify-between items-center bg-white/70 p-5 rounded-2xl border border-gray-200/50 backdrop-blur-md">
         <div>
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
               <span className="text-2xl animate-spin-slow">📊</span> BUSINESS INTELLIGENCE
            </h2>
            <p className="text-gray-500 text-xs mt-1 ml-9">INVENTARIO COMERCIAL • <strong className="text-emerald-600">ENERO 2025</strong></p>
         </div>
         <div className="flex gap-2">
            <button className="bg-slate-800 hover:bg-slate-700 text-gray-600 border border-gray-200 px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-[10px] transition-colors flex items-center gap-2">
               🎯 Oportunidades
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-gray-600 border border-gray-200 px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-[10px] transition-colors flex items-center gap-2">
               📈 Proyecciones
            </button>
            <button className="bg-indigo-500/10 hover:bg-indigo-50 text-indigo-600 border border-indigo-500/30 px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-[10px] transition-colors">
               📊 Análisis Detallado
            </button>
         </div>
      </div>

      {/* METRICAS Y PROYECCIONES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* PERFORMANCE GLOBAL */}
         <div className="rounded-2xl border border-gray-200/50 bg-white/80/60 p-6 backdrop-blur-md col-span-1 lg:col-span-2 shadow-lg">
            <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
               <span className="text-emerald-500 text-lg">🎯</span> PERFORMANCE GLOBAL
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
               <div className="bg-[#ECEFF8]/50 p-3 rounded-lg border border-gray-200/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-50 blur-xl"></div>
                  <p className="text-[9px] uppercase font-bold text-gray-500">Revenue</p>
                  <p className="text-xl font-black text-emerald-600">$847M</p>
                  <p className="text-[9px] text-gray-500">de $1.2B (70.6%)</p>
               </div>
               <div className="bg-[#ECEFF8]/50 p-3 rounded-lg border border-gray-200/50 relative overflow-hidden">
                  <p className="text-[9px] uppercase font-bold text-gray-500">Ocupación</p>
                  <p className="text-xl font-black text-gray-800">78%</p>
                  <p className="text-[9px] text-gray-500">234/300 cupos</p>
               </div>
               <div className="bg-[#ECEFF8]/50 p-3 rounded-lg border border-gray-200/50 relative overflow-hidden">
                  <p className="text-[9px] uppercase font-bold text-gray-500">Precio Prom.</p>
                  <p className="text-xl font-black text-indigo-600">$3.6M</p>
                  <p className="text-[9px] text-gray-500">Por cupo / mes</p>
               </div>
               <div className="bg-[#ECEFF8]/50 p-3 rounded-lg border border-gray-200/50 relative overflow-hidden">
                  <p className="text-[9px] uppercase font-bold text-gray-500">Crecimiento</p>
                  <p className="text-xl font-black text-emerald-600">+23%</p>
                  <p className="text-[9px] text-gray-500">Vs Ene-2024</p>
               </div>
            </div>

            {/* BREAKDOWN TIPO Y HORARIO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                  <h4 className="text-[10px] font-bold text-gray-500 mb-2 uppercase">💰 Por Tipo de Auspicio</h4>
                  <div className="space-y-2">
                     <div>
                        <div className="flex justify-between text-[10px] mb-1"><span className="text-gray-800">Tipo A (Completo)</span><span className="text-emerald-600 font-bold">$567M (67%)</span></div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{width: '67%'}}></div></div>
                     </div>
                     <div>
                        <div className="flex justify-between text-[10px] mb-1"><span className="text-gray-800">Tipo B (Medio)</span><span className="text-indigo-600 font-bold">$189M (22%)</span></div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{width: '22%'}}></div></div>
                     </div>
                     <div>
                        <div className="flex justify-between text-[10px] mb-1"><span className="text-gray-800">Menciones</span><span className="text-amber-600 font-bold">$91M (11%)</span></div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full"><div className="h-full bg-amber-500 rounded-full" style={{width: '11%'}}></div></div>
                     </div>
                  </div>
               </div>
               <div>
                  <h4 className="text-[10px] font-bold text-gray-500 mb-2 uppercase">⏰ Por Horario</h4>
                  <div className="space-y-2">
                     <div>
                        <div className="flex justify-between text-[10px] mb-1"><span className="text-gray-800">Prime AM</span><span className="text-emerald-600 font-bold">$423M (50%)</span></div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{width: '50%'}}></div></div>
                     </div>
                     <div>
                        <div className="flex justify-between text-[10px] mb-1"><span className="text-gray-800">Prime PM</span><span className="text-indigo-600 font-bold">$268M (32%)</span></div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{width: '32%'}}></div></div>
                     </div>
                     <div>
                        <div className="flex justify-between text-[10px] mb-1"><span className="text-gray-800">Regular</span><span className="text-amber-600 font-bold">$108M (13%)</span></div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full"><div className="h-full bg-amber-500 rounded-full" style={{width: '13%'}}></div></div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* PREDICCIONES CORTEX (AI PANEL) */}
         <div className="rounded-2xl border border-indigo-500/40 bg-indigo-950/20 p-6 relative overflow-hidden backdrop-blur-xl shadow-[0_0_30px_rgba(99,102,241,0.1)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100%] blur-3xl pointer-events-none"></div>
            
            <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
               <span className="text-xl">🔮</span> PREDICCIONES CORTEX
               <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-[8px] animate-pulse">LIVE</span>
            </h3>

            <p className="text-[9px] text-gray-500 mb-4 border-b border-indigo-500/20 pb-2">Proyección algorítmica a 90 días (Q1)</p>

            <div className="space-y-4">
               <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Revenue Proyectado</p>
                  <p className="text-2xl font-black text-indigo-600">$2.8B <span className="text-[10px] text-emerald-600 font-bold align-top">+15% vs Q1-24</span></p>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-indigo-900/30 p-2.5 rounded-lg border border-indigo-500/20">
                     <p className="text-[9px] text-gray-500 uppercase font-bold">Renovaciones</p>
                     <p className="text-lg font-black text-emerald-600">89% <span className="text-[8px] text-emerald-500">seguras</span></p>
                  </div>
                  <div className="bg-indigo-900/30 p-2.5 rounded-lg border border-indigo-500/20">
                     <p className="text-[9px] text-gray-500 uppercase font-bold">New Pipeline</p>
                     <p className="text-lg font-black text-emerald-600">$340M</p>
                  </div>
               </div>

               <div className="bg-amber-950/30 p-3 rounded-lg border border-amber-500/30">
                  <p className="text-[9px] text-amber-500 flex items-center gap-1.5 font-bold uppercase mb-1">
                     <span className="animate-pulse">⚠️</span> RIESGO DE FUGA
                  </p>
                  <p className="text-lg font-black text-amber-600">$45M</p>
                  <p className="text-[9px] text-gray-500 leading-tight">Clientes en procesos competitivos o con low-engagement.</p>
               </div>
            </div>
         </div>

      </div>

      {/* CLASIFICACIÓN DE EMISORAS Y TOP CLIENTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         
         {/* DESEMPEÑO POR EMISORA */}
         <div className="rounded-2xl border border-gray-200/50 bg-white/80/60 p-6 backdrop-blur-md">
            <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
               <span className="text-emerald-500 text-lg">📻</span> RANKING DE EMISORAS
            </h3>

            <div className="space-y-3">
               <div className="bg-[#ECEFF8]/40 border border-emerald-500/20 rounded-xl p-3 flex justify-between items-center group hover:bg-white/80 transition-colors">
                  <div className="flex items-center gap-3">
                     <div className="text-xl">🏆</div>
                     <div>
                        <h4 className="text-xs font-black text-gray-800">T13 RADIO</h4>
                        <p className="text-[9px] text-gray-500">88% Ocupación • 18 Programas • Prom: $4.2M</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-sm font-black text-emerald-600">$312M</p>
                     <p className="text-[9px] text-emerald-500/50">37% del Total</p>
                  </div>
               </div>

               <div className="bg-[#ECEFF8]/40 border border-gray-200/50 rounded-xl p-3 flex justify-between items-center group hover:bg-white/80 transition-colors">
                  <div className="flex items-center gap-3">
                     <div className="text-xl">🥈</div>
                     <div>
                        <h4 className="text-xs font-black text-gray-800">SONAR FM</h4>
                        <p className="text-[9px] text-gray-500">82% Ocupación • 15 Programas • Prom: $3.8M</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-sm font-black text-indigo-600">$245M</p>
                     <p className="text-[9px] text-gray-500">29% del Total</p>
                  </div>
               </div>

               <div className="bg-[#ECEFF8]/40 border border-gray-200/50 rounded-xl p-3 flex justify-between items-center group hover:bg-white/80 transition-colors">
                  <div className="flex items-center gap-3">
                     <div className="text-xl">🥉</div>
                     <div>
                        <h4 className="text-xs font-black text-gray-800">RADIO 103.3</h4>
                        <p className="text-[9px] text-gray-500">75% Ocupación • 12 Programas • Prom: $3.2M</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-sm font-black text-gray-800">$198M</p>
                     <p className="text-[9px] text-gray-500">23% del Total</p>
                  </div>
               </div>

               <div className="bg-[#ECEFF8]/20 border border-gray-200/50 rounded-xl p-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="w-6 text-center text-gray-500 font-bold">#4</div>
                     <div>
                        <h4 className="text-[10px] font-bold text-gray-500">OTRAS (Agrupadas)</h4>
                        <p className="text-[9px] text-gray-500">65% Ocupación • 8 Programas</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-sm font-bold text-gray-600">$92M</p>
                     <p className="text-[9px] text-gray-500">11% del Total</p>
                  </div>
               </div>
            </div>
         </div>

         {/* TOP CLIENTES */}
         <div className="rounded-2xl border border-gray-200/50 bg-white/80/60 p-6 backdrop-blur-md">
            <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
               <span className="text-amber-500 text-lg">🏢</span> TOP CLIENTES (REVENUE)
            </h3>

            <div className="space-y-3">
               {[
                  { rank: 1, name: "Clínica Alemana", rev: "$145M", sub: "Contratos anuales múltiples", color: "text-amber-600" },
                  { rank: 2, name: "Banco de Chile", rev: "$89M", sub: "Portfolio completo", color: "text-gray-600" },
                  { rank: 3, name: "Movistar", rev: "$67M", sub: "Campañas estacionales", color: "text-gray-600" },
                  { rank: 4, name: "Chevrolet", rev: "$54M", sub: "Lanzamientos productos", color: "text-gray-500" },
                  { rank: 5, name: "Cencosud", rev: "$45M", sub: "Promociones regulares", color: "text-gray-500" },
               ].map((c) => (
                  <div key={c.rank} className="flex justify-between items-center border-b border-gray-200/50 pb-2 last:border-0 last:pb-0">
                     <div className="flex items-center gap-3">
                        <span className={`font-black ${c.rank === 1 ? 'text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded' : 'text-slate-600'}`}>{c.rank}</span>
                        <div>
                           <p className={`text-xs font-bold ${c.rank === 1 ? 'text-gray-800' : 'text-gray-600'}`}>{c.name}</p>
                           <p className="text-[9px] text-gray-500">{c.sub}</p>
                        </div>
                     </div>
                     <span className={`text-sm font-black ${c.color}`}>{c.rev}</span>
                  </div>
               ))}
            </div>
         </div>

      </div>
    </div>
  )
}
