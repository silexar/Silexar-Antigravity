"use client";

import React from 'react';

export default function MobileAnalyticsView({ onBack }: { onBack: () => void }) {
  const metrics = [
    { l: 'Cumplimiento', v: '98.4%', sub: '▲ 1.2%', c: 'text-emerald-400' },
    { l: 'No Emitidos', v: '1,076', sub: '1.6%', c: 'text-red-400' },
    { l: 'Recup. IA', v: '94.3%', sub: 'Exitoso', c: 'text-indigo-400' }
  ];

  return (
    <div className="space-y-6 pb-24 animate-in slide-in-from-right-10 duration-500">
      {/* HEADER MÓVIL */}
      <header className="flex justify-between items-center bg-slate-900 -mx-4 px-4 py-3 border-b border-white/5 sticky top-[-16px] z-[60]">
         <button onClick={onBack} className="text-slate-400 text-xs font-bold uppercase tracking-widest">← Volver</button>
         <div className="text-center">
            <div className="text-xs font-black text-indigo-400 uppercase">ANALYTICS EMISIÓN</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Últimos 30 Días</div>
         </div>
         <div className="w-8"></div>
      </header>

      {/* METRICAS KPI MÓVIL */}
      <div className="grid grid-cols-3 gap-2">
         {metrics.map((m, i) => (
            <div key={i} className="bg-slate-900 border border-white/5 p-3 rounded-2xl text-center">
               <div className="text-[8px] font-black text-slate-500 uppercase mb-1">{m.l}</div>
               <div className={`text-sm font-black ${m.c}`}>{m.v}</div>
               <div className="text-[8px] text-slate-600 font-bold">{m.sub}</div>
            </div>
         ))}
      </div>

      {/* PERFORMANCE POR EMISORA MÓVIL */}
      <div className="space-y-3">
         <h3 className="text-[10px] font-black text-slate-100 uppercase tracking-widest pl-1">Performance por Emisora</h3>
         {[
           { n: 'Corazón', p: '99.1%', s: '🥇', c: 'text-emerald-400' },
           { n: 'Play FM', p: '98.2%', s: '🥈', c: 'text-amber-400' },
           { n: 'Sonar FM', p: '97.8%', s: '🥉', c: 'text-blue-400' }
         ].map((e, i) => (
            <div key={i} className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <span className="text-xl">{e.s}</span>
                  <span className="text-xs font-bold text-white">{e.n}</span>
               </div>
               <div className={`text-xs font-black ${e.c}`}>{e.p}</div>
            </div>
         ))}
      </div>

      {/* INSIGHTS IA MÓVIL */}
      <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-5 space-y-4">
         <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🤖</span>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Cortex IA Insights</span>
         </div>
         <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5">
            <div className="text-[9px] font-bold text-amber-500 uppercase mb-1">Patrón Crítico</div>
            <p className="text-[10px] text-slate-300 leading-relaxed italic">"Fallas recurrentes en Sonar FM viernes 14h-16h detectadas."</p>
         </div>
         <button className="w-full bg-indigo-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">VER PLAN DE MEJORA</button>
      </div>

       {/* CAUSAS RAÍZ MÓVIL SIMPLIFICADO */}
       <div className="bg-slate-900 p-5 rounded-3xl border border-white/5 space-y-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Distribución de Fallas</h3>
          <div className="space-y-3">
             {[
               { l: 'Fallas Técnicas', p: '45%', c: 'bg-indigo-500' },
               { l: 'Errores Progr.', p: '32%', c: 'bg-amber-500' },
               { l: 'Humanos/Ed.', p: '23%', c: 'bg-red-500' }
             ].map((c, i) => (
                <div key={i} className="space-y-1">
                   <div className="flex justify-between text-[9px] font-bold text-slate-300">
                      <span>{c.l}</span>
                      <span>{c.p}</span>
                   </div>
                   <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${c.c}`} style={{ width: c.p }}></div>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
}
