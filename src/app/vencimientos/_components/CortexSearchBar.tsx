'use client'

import { useState } from 'react';

export default function CortexSearchBar() {
  const [foco, setFoco] = useState(false);
  const [val, setVal] = useState('');

  return (
    <div className="relative z-40 w-full mb-6 max-w-4xl mx-auto">
      <div className={`flex items-center gap-3 bg-[#ECEFF8]/80 backdrop-blur-xl border ${foco ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]' : 'border-gray-200'} rounded-2xl px-5 py-4 transition-all`}>
         <span className={`text-2xl transition-colors ${foco ? 'text-amber-600' : 'text-gray-500'}`}>🔍</span>
         <input
            type="text"
            aria-label="Buscar vencimientos"
            className="flex-1 bg-transparent border-none text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-0 font-medium"
            placeholder="Ej: 'Mesa Central', 'cupos agosto', 'prime disponible'"
            onFocus={() => setFoco(true)}
            onBlur={() => setTimeout(() => setFoco(false), 200)}
            value={val}
            onChange={e => setVal(e.target.value)}
         />
         <div className="bg-amber-500/10 px-3 py-1 rounded border border-amber-500/20 flex items-center gap-2">
            <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase">Cortex Search</span>
         </div>
      </div>

      {foco && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white/80/95 backdrop-blur-2xl border border-gray-200 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-2">
           <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
             <span className="text-amber-500">🤖</span> SUGERENCIAS CORTEX
           </h4>
           <div className="space-y-1">
              {[
                '🔎 Programas con cupos disponibles próximo mes',
                '🔎 Auspicios venciendo esta semana',
                '🔎 Oportunidades prime horario matinal',
                '🔎 Conflictos de exclusividad detectados'
              ].map((s, i) => (
                 <button key={`${s}-${i}`} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/90 text-sm text-gray-600 font-medium transition-colors">
                    {s}
                 </button>
              ))}
           </div>
        </div>
      )}
    </div>
  )
}
