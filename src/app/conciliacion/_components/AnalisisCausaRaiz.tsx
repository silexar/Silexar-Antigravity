"use client";

import React from 'react';

export default function AnalisisCausaRaiz({ onBack }: { onBack: () => void }) {
  const causas = [
    { title: '🔧 FALLAS TÉCNICAS', pct: '45%', spots: '485', sub: [
      { l: 'Sistema Dalet Galaxy', val: '21.8%' },
      { l: 'Cortes energía', val: '8.3%' },
      { l: 'Problemas audio', val: '6.2%' }
    ], color: 'indigo' },
    { title: '⏰ ERRORES PROGRAMACIÓN', pct: '32%', spots: '344', sub: [
      { l: 'Cambios last-minute', val: '14.5%' },
      { l: 'Conflictos timing', val: '8.3%' },
      { l: 'Errores exclusividad', val: '6.2%' }
    ], color: 'amber' },
    { title: '👤 ERRORES HUMANOS', pct: '18%', spots: '194', sub: [
      { l: 'Error carga programación', val: '8.3%' },
      { l: 'Modificaciones incorrectas', val: '5.2%' }
    ], color: 'red' },
    { title: '📻 DECISIONES EDITORIALES', pct: '5%', spots: '53', sub: [
      { l: 'Noticias urgentes', val: '3.2%' },
      { l: 'Contenido especial', val: '1.8%' }
    ], color: 'emerald' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* HEADER CAUSA RAÍZ */}
      <div className="flex justify-between items-center bg-slate-800/50 p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center hover:bg-slate-700 transition-all border border-slate-700 text-xl"
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">🔍 Análisis Causas Raíz</h2>
            <p className="text-xs text-red-400 font-black tracking-widest uppercase italic">Inteligencia Operativa para Mejora Continua</p>
          </div>
        </div>
        <div className="text-right">
           <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Periodo Actual</div>
           <div className="text-sm font-bold text-slate-200">Últimos 30 Días</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* DISTRIBUCIÓN POR TIPO (CARDS) */}
         <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest mb-4 flex items-center gap-3">
               <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
               Distribución por Causa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {causas.map((c, i) => (
                  <div key={i} className="bg-slate-900/50 border border-white/5 p-5 rounded-3xl hover:border-slate-700 transition-all group">
                     <div className="flex justify-between items-start mb-4">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{c.title}</div>
                        <div className="text-xl font-black text-white">{c.pct}</div>
                     </div>
                     <div className="w-full h-1.5 bg-slate-800 rounded-full mb-4 overflow-hidden">
                        <div 
                           className={`h-full rounded-full ${c.color === 'indigo' ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : c.color === 'amber' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : c.color === 'red' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} 
                           style={{ width: c.pct }}
                        ></div>
                     </div>
                     <div className="text-[10px] text-slate-500 font-black mb-3">TOTAL: {c.spots} spots</div>
                     <div className="space-y-2">
                        {c.sub.map((s, j) => (
                           <div key={j} className="flex justify-between text-[10px]">
                              <span className="text-slate-400">{s.l}</span>
                              <span className="text-slate-200 font-bold">{s.val}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* RECOMENDACIONES IA ACCIONABLES */}
         <div className="bg-slate-900 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div>
               <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-8 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                  Estrategia de Optimización IA
               </h3>

               <div className="space-y-6">
                  <div className="flex gap-4 group">
                     <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">🔧</div>
                     <div>
                        <div className="text-xs font-black text-slate-200 uppercase tracking-tighter mb-1">Técnica</div>
                        <p className="text-xs text-slate-500 leading-relaxed italic">"Implementar redundancia en sistema Dalet y UPS backup para equipos críticos."</p>
                     </div>
                  </div>
                  <div className="flex gap-4 group">
                     <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">⏰</div>
                     <div>
                        <div className="text-xs font-black text-slate-200 uppercase tracking-tighter mb-1">Operacional</div>
                        <p className="text-xs text-slate-500 leading-relaxed italic">"Workflow de aprobación para cambios menores a 2h de emisión y check automático de exclusividad."</p>
                     </div>
                  </div>
                  <div className="flex gap-4 group">
                     <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">👤</div>
                     <div>
                        <div className="text-xs font-black text-slate-200 uppercase tracking-tighter mb-1">Capacitación</div>
                        <p className="text-xs text-slate-500 leading-relaxed italic">"Entrenamiento avanzado para equipo Traffic en procedimientos estandarizados de carga."</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-slate-950/80 border border-white/5 p-6 rounded-2xl mt-8">
               <div className="flex justify-between items-center mb-4">
                  <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">IMPACTO PROYECTADO MEJORAS</div>
                  <div className="text-xs font-black text-white bg-emerald-500/20 px-3 py-1 rounded-full">+99.2% Goal</div>
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-slate-500">Reducción Fallas Técnicas</span> <span className="text-emerald-400 font-black">60%</span></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-500">Ahorro Anual en Recuperaciones</span> <span className="text-emerald-400 font-black">$2.4M</span></div>
               </div>
               <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-6 py-4 rounded-xl text-xs font-black shadow-xl shadow-emerald-600/20 transition-all active:scale-95">
                  🚀 IMPLEMENTAR PLAN DE MEJORA
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
