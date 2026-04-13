'use client'

import { useState } from 'react';

export default function CommercialFiltersPanel() {
  const [filtros, setFiltros] = useState({
    periodo: 'este_mes',
    disponibilidad: 'con_cupos',
    tipo: ['a', 'b', 'menciones'],
    horario: ['prime_am', 'prime_pm'],
    estado: ['activos']
  })

  // Helper toggle array lists - safe implementation
  const t = (k: keyof typeof filtros, val: string) => {
    setFiltros(prev => {
      const newPrev = { ...prev };
      // Seguro: usamos if/else explícito para evitar Object Injection Sink
      if (k === 'tipo') {
        const currentArr = newPrev.tipo;
        const newArr = currentArr.includes(val) 
          ? currentArr.filter(x => x !== val) 
          : [...currentArr, val];
        newPrev.tipo = newArr;
      } else if (k === 'horario') {
        const currentArr = newPrev.horario;
        const newArr = currentArr.includes(val) 
          ? currentArr.filter(x => x !== val) 
          : [...currentArr, val];
        newPrev.horario = newArr;
      } else if (k === 'estado') {
        const currentArr = newPrev.estado;
        const newArr = currentArr.includes(val) 
          ? currentArr.filter(x => x !== val) 
          : [...currentArr, val];
        newPrev.estado = newArr;
      }
      return newPrev;
    });
  }

  return (
    <div className="rounded-2xl border border-gray-200 p-5 bg-white/70 backdrop-blur-md h-full flex flex-col">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest flex items-center gap-2 mb-6">
        <span className="text-amber-500">🎛️</span> FILTROS COMERCIALES
      </h3>

      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div>
          <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3">📅 Período</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'este_mes', lbl: 'Este Mes' }, { id: 'prox_mes', lbl: 'Próx. Mes' },
              { id: 'trimestre', lbl: 'Trimestre' }, { id: 'custom', lbl: 'Custom' }
            ].map(f => (
               <button 
                  key={f.id} onClick={() => setFiltros({...filtros, periodo: f.id})}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${filtros.periodo === f.id ? 'bg-amber-50 text-amber-600 border border-amber-500/30' : 'bg-[#ECEFF8]/50 text-gray-500 border border-gray-200/50 hover:bg-white/90'}`}
               >{f.lbl}</button>
            ))}
          </div>
        </div>

        <div>
           <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3">🎯 Disponibilidad</h4>
           <div className="flex flex-col gap-2">
             {[
               { id: 'con_cupos', lbl: 'Con Cupos Disponibles' }, 
               { id: 'sin_cupos', lbl: 'Sin Cupos (Lleno)' }, 
               { id: 'todos', lbl: 'Todos los Programas' }
             ].map(f => (
               <label key={f.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${filtros.disponibilidad === f.id ? 'bg-amber-500 border-amber-500' : 'bg-[#ECEFF8] border-gray-200 group-hover:border-white/40'}`}>
                     {filtros.disponibilidad === f.id && <span className="text-slate-900 text-xs font-black">✓</span>}
                  </div>
                  <span className={`text-sm font-medium ${filtros.disponibilidad === f.id ? 'text-slate-200' : 'text-gray-500'}`}>{f.lbl}</span>
                  <input type="radio" className="hidden" onChange={() => setFiltros({...filtros, disponibilidad: f.id})} checked={filtros.disponibilidad === f.id} />
               </label>
             ))}
           </div>
        </div>

        <div>
           <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3">💰 Tipo Auspicio</h4>
           <div className="flex flex-wrap gap-2">
              {[
                { id: 'a', lbl: 'General' }, { id: 'b', lbl: 'Menciones' }, { id: 'menciones', lbl: 'Especial' }
              ].map(f => (
                 <button 
                    key={f.id} onClick={() => t('tipo', f.id)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${filtros.tipo.includes(f.id) ? 'bg-emerald-50 text-emerald-600 border border-emerald-500/30' : 'bg-[#ECEFF8]/50 text-gray-500 border border-gray-200/50 hover:text-gray-600'}`}
                 >{f.lbl}</button>
              ))}
           </div>
        </div>

        <div>
           <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3">⏰ Horario</h4>
           <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'prime_am', lbl: 'Prime AM' }, { id: 'prime_pm', lbl: 'Prime PM' }, 
                { id: 'regular', lbl: 'Regular' }, { id: 'noche', lbl: 'Noche' }
              ].map(f => (
                 <button 
                    key={f.id} onClick={() => t('horario', f.id)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${filtros.horario.includes(f.id) ? 'bg-blue-50 text-blue-600 border border-blue-500/30' : 'bg-[#ECEFF8]/50 text-gray-500 border border-gray-200/50 hover:bg-white/90'}`}
                 >{f.lbl}</button>
              ))}
           </div>
        </div>

      </div>
    </div>
  )
}
