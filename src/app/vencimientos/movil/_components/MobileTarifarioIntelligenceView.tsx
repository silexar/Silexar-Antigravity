'use client'

import { useState } from 'react';
import { useVencimientosAPI } from '../../_hooks/useVencimientosAPI';

export default function MobileTarifarioIntelligenceView() {
  const { isLoading, optimizarPrecio } = useVencimientosAPI();
  const [metricas, setMetricas] = useState<{ franja: string, factor: number } | null>(null);

  const handleOptimization = async (franja: string, base: number) => {
    const data = await optimizarPrecio('PRG_GEN_MOVIL', franja, base);
    if (data) setMetricas({ franja, factor: data.nuevoFactorTarifa });
  };

  return (
    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500 pb-8">
       <div className="bg-white/80/80 border border-gray-200/50 p-4 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-200">🤖 Cortex Pricing</h3>
            <p className="text-[10px] text-gray-500">Optimización Dinámica Mobile</p>
          </div>
          {metricas && (
             <div className="bg-emerald-50 border border-emerald-500/30 px-3 py-1 rounded-lg">
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest leading-tight text-center">Factor<br/><span className="text-base text-emerald-600">x{metricas.factor}</span></p>
             </div>
          )}
       </div>

       <div className="grid grid-cols-2 gap-3">
          {[
            { tag: 'Prime', val: 85, c1: 'from-orange-500', c2: 'to-amber-500' },
            { tag: 'Valle', val: 30, c1: 'from-blue-500', c2: 'to-cyan-500' },
            { tag: 'Noche', val: 60, c1: 'from-emerald-500', c2: 'to-teal-500' }
          ].map((f, i) => (
             <button 
                key={`${f}-${i}`} 
                className={`${i === 2 ? 'col-span-2' : ''} bg-white/70 border border-gray-200/50 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group active:scale-95 transition-all`}
                onClick={() => handleOptimization(f.tag, f.val)}
                disabled={isLoading}
             >
                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${f.c1} ${f.c2} opacity-10 rounded-bl-full`}></div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{f.tag}</p>
                <p className="text-2xl text-slate-100 font-black mb-2">{f.val}%</p>
                <div className="text-[9px] bg-[#ECEFF8] px-2 py-1 rounded-full text-gray-600 border border-gray-200/50 uppercase font-bold tracking-widest">
                   {isLoading ? 'Analizando...' : '⚡ Re-Calcular'}
                </div>
             </button>
          ))}
       </div>
    </div>
  )
}
