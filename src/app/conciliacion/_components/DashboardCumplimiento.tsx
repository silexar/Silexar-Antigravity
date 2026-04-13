"use client";

import React from 'react';

export default function DashboardCumplimiento({ onBack }: { onBack: () => void }) {
  const emisoras = [
    { name: "Radio Corazón", metrics: "99.1% cumplimiento", total: "28,456", noEmit: "256 (0.9%)", cause: "Fallas técnicas sistema", score: "🥇" },
    { name: "Play FM", metrics: "98.2% cumplimiento", total: "23,112", noEmit: "416 (1.8%)", cause: "Cambios programación", score: "🥈" },
    { name: "Sonar FM", metrics: "97.8% cumplimiento", total: "15,666", noEmit: "344 (2.2%)", cause: "Conflictos timing", score: "🥉" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* HEADER ANALYTICS */}
      <div className="flex justify-between items-center bg-[#E8E5E0]/50 p-6 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="flex items-center gap-6 relative z-10">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-xl bg-[#F0EDE8] flex items-center justify-center hover:bg-[#D4D1CC] transition-all border border-[#D4D1CC] text-xl"
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl font-black text-[#2C2C2A] uppercase tracking-tighter">📊 Analytics Cumplimiento Emisión</h2>
            <p className="text-xs text-indigo-400 font-black tracking-widest uppercase">Últimos 30 Días • Vista Ejecutiva TIER 0</p>
          </div>
        </div>
        <div className="flex gap-3 relative z-10">
           <button className="bg-[#F0EDE8] border border-[#D4D1CC] text-[#5F5E5A] px-6 py-2.5 rounded-xl text-xs font-black hover:bg-[#E8E5E0] transition-all">EXPORTAR DATA</button>
           <button className="bg-indigo-600 text-[#2C2C2A] px-6 py-2.5 rounded-xl text-xs font-black shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all">PROGRAMAR REPORTE</button>
        </div>
      </div>

      {/* MÉTRICAS GENERALES HI-DENSITY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
         {[
           { label: 'Cumplimiento Promedio', val: '98.4%', sub: '▲ 1.2% vs mes anterior', color: 'text-emerald-400' },
           { label: 'Spots Analizados', val: '67,234', sub: 'Histórico Mensual', color: 'text-blue-400' },
           { label: 'Spots No Emitidos', val: '1,076', sub: '1.6% del total', color: 'text-red-400' },
           { label: 'Recuperación Auto', val: '94.3%', sub: 'Efectividad Cortex IA', color: 'text-indigo-400' },
           { label: 'Intervención Manual', val: '5.7%', sub: 'Requerido por Traffic', color: 'text-amber-400' }
         ].map((m) => (
            <div key={m.label} className="bg-[#F0EDE8]/80 border border-white/5 p-5 rounded-2xl shadow-xl hover:border-indigo-500/30 transition-all group">
               <div className="text-[10px] font-black text-[#888780] uppercase tracking-widest mb-2 group-hover:text-indigo-400 transition-colors">{m.label}</div>
               <div className={`text-2xl font-black ${m.color} mb-1`}>{m.val}</div>
               <div className="text-[10px] text-slate-600 font-bold">{m.sub}</div>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* PERFORMANCE POR EMISORA (TABLA NEUROMÓRFICA) */}
         <div className="lg:col-span-2 bg-[#F0EDE8]/50 border border-[#D4D1CC] rounded-3xl p-6 shadow-2xl">
            <h3 className="text-sm font-black text-[#2C2C2A] uppercase tracking-widest mb-6 flex items-center gap-3">
               <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
               Performance por Emisora
            </h3>
            <div className="space-y-4">
               {emisoras.map((e, idx) => (
                  <div key={e.name} className="bg-[#E8E5E0]/30 border border-white/5 rounded-2xl p-5 hover:bg-[#E8E5E0]/50 transition-all flex items-center justify-between">
                     <div className="flex items-center gap-6">
                        <span className="text-3xl">{e.score}</span>
                        <div>
                           <div className="text-lg font-black text-[#2C2C2A]">{e.name}</div>
                           <div className="text-xs text-[#888780] font-bold uppercase tracking-tighter">Spots: {e.total}</div>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-8 text-right">
                        <div>
                           <div className="text-sm font-black text-emerald-400">{e.metrics}</div>
                           <div className="text-[10px] text-[#888780] font-bold uppercase tracking-widest">Cumplimiento</div>
                        </div>
                        <div>
                           <div className="text-sm font-black text-red-500">{e.noEmit}</div>
                           <div className={`text-[9px] font-black px-2 py-0.5 rounded-full mt-1 inline-block ${idx === 0 ? 'bg-red-500/10 text-red-400' : idx === 1 ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                              CAUSA: {e.cause}
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* IA INSIGHTS & ALERTAS */}
         <div className="space-y-6">
            <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
               <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                  <span>🚨</span> ALERTAS PROACTIVAS IA
               </h3>
               <div className="space-y-4 relative z-10">
                  <div className="bg-[#F0EDE8]/80 p-4 rounded-2xl border-l-4 border-amber-500 shadow-lg">
                     <div className="text-[10px] font-bold text-amber-500 mb-1">PATRÓN DETECTADO</div>
                     <p className="text-xs text-[#2C2C2A]">Incremento de fallas en Sonar FM los viernes (14:00-16:00).</p>
                  </div>
                  <div className="bg-[#F0EDE8]/80 p-4 rounded-2xl border-l-4 border-red-500 shadow-lg">
                     <div className="text-[10px] font-bold text-red-500 mb-1">EXCLUSIVIDAD RIESGO</div>
                     <p className="text-xs text-[#2C2C2A]">Conflictos sector automotriz superan el umbral en 15%.</p>
                  </div>
                  <button className="w-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-[#2C2C2A] transition-all">
                     VER RECOMENDACIONES DETALLADAS
                  </button>
               </div>
            </div>

            <div className="bg-[#F0EDE8] p-6 rounded-3xl border border-white/5 shadow-2xl">
               <h3 className="text-[10px] font-black text-[#888780] uppercase tracking-widest mb-4">📈 TENDENCIAS DETECTADAS</h3>
               <div className="space-y-3">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-black">▲</div>
                     <div className="text-xs text-[#5F5E5A]">Mejoría sostenida últimas 2 semanas.</div>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-black">▲</div>
                     <div className="text-xs text-[#5F5E5A]">Reducción 40% fallas técnicas vs Q1.</div>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-black">✨</div>
                     <div className="text-xs text-[#5F5E5A]">+15% efectividad en recuperación IA.</div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
