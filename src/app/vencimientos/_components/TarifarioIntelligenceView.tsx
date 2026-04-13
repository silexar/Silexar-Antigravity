'use client'

import { useState } from 'react';
import { useVencimientosAPI } from '../_hooks/useVencimientosAPI';

export default function TarifarioIntelligenceView() {
  const { isLoading, optimizarPrecio } = useVencimientosAPI();
  const [demandas] = useState({ prime: 85, valle: 30, noche: 60 });
  const [metricas, setMetricas] = useState<{ franja: string, factor: number } | null>(null);

  const handleOptimization = async (franja: string, base: number) => {
    const data = await optimizarPrecio('PRG_GEN', franja, base);
    if (data) {
      setMetricas({ franja, factor: data.nuevoFactorTarifa });
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-6" style={{ backdropFilter: 'blur(10px)' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🧠 Cortex Intelligence: <span className="bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">Pricing Dinámico</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">El modelo IA analiza la ocupación y recomienda recargos en tiempo real.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap Section */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { tag: 'Prime (Alta Demanda)', val: demandas.prime, cl: 'from-orange-500/20 to-red-500/10 border-orange-500/30' },
            { tag: 'Valle (Baja Demanda)', val: demandas.valle, cl: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30' },
            { tag: 'Noche (Creciente)', val: demandas.noche, cl: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30' }
          ].map((f, i) => (
             <div key={`${f}-${i}`} className={`bg-gradient-to-b ${f.cl} p-5 rounded-xl border relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 p-3 opacity-50 group-hover:opacity-100 transition-opacity">
                  <span className="text-2xl">🔥</span>
                </div>
                <p className="text-xs font-black text-gray-600 uppercase tracking-widest">{f.tag}</p>
                <div className="my-4">
                  <p className="text-3xl font-black text-gray-800">{f.val}% <span className="text-xs font-normal text-gray-500">Ocupación</span></p>
                </div>
                <button 
                  onClick={() => handleOptimization(f.tag, f.val)}
                  disabled={isLoading}
                  className="w-full py-2 bg-[#ECEFF8]/50 hover:bg-white/80 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 transition-all active:scale-95"
                >
                  {isLoading ? 'Analizando...' : '⚡ Re-Calcular Precio'}
                </button>
             </div>
          ))}
        </div>

        {/* Console AI */}
        <div className="bg-[#ECEFF8]/80 rounded-xl border border-gray-200/50 p-5 flex flex-col justify-center">
            {metricas ? (
               <div className="text-center animate-in zoom-in slide-in-from-bottom-4 duration-500">
                  <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                     <span className="text-3xl text-gray-800 font-black">X</span>
                  </div>
                  <h4 className="text-lg font-black text-gray-800 mb-1">Pricing Multiplier</h4>
                  <p className="text-emerald-600 text-4xl font-black">{metricas.factor}</p>
                  <p className="text-xs text-gray-500 mt-4 uppercase tracking-widest leading-relaxed">Factor aplicado exitosamente a todo el tarifario de <strong className="text-gray-800">{metricas.franja}</strong>.</p>
               </div>
            ) : (
               <div className="text-center opacity-30">
                  <span className="text-5xl mb-4 block">🤖</span>
                  <p className="text-xs font-black uppercase tracking-widest">Esperando Parámetros</p>
               </div>
            )}
        </div>
      </div>
    </div>
  );
}
