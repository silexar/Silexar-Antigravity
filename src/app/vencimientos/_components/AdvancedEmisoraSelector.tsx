'use client'

import { useState } from 'react'

export default function AdvancedEmisoraSelector({ embolado, setEmbolado }: { embolado: string, setEmbolado: (val: string) => void }) {
  const [vistaA, setVistaA] = useState<'individual' | 'comparativa' | 'global'>('individual')

  const emisoras = [
    { id: 'emi_1', nom: 'SONAR FM', on: true, oc: 82, rev: '$245M', pa: 15, al: 2, cpd: 12 },
    { id: 'emi_2', nom: 'RADIO 103.3 FM', on: true, oc: 75, rev: '$198M', pa: 12, al: 0, cpd: 8 },
    { id: 'emi_3', nom: 'T13 RADIO', on: true, oc: 88, rev: '$312M', pa: 18, al: 1, cpd: 5 }
  ]

  return (
    <div className="rounded-2xl border border-gray-200 p-5 bg-white/70 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">📻 SELECTOR MULTIEMISOR</h3>
        <div className="flex bg-[#ECEFF8]/80 p-1 rounded-lg border border-gray-200/50">
           {['individual', 'comparativa', 'global'].map(v => (
              <button 
                 key={v} onClick={() => setVistaA(v as 'individual' | 'comparativa' | 'global')}
                 className={`px-3 py-1 rounded-md text-xs font-bold transition-all uppercase tracking-wider ${vistaA === v ? 'bg-amber-50 text-amber-600' : 'text-gray-500 hover:text-gray-600'}`}
              >
                 {v === 'individual' ? '🎯 Ind' : v === 'comparativa' ? '📊 Comp' : '🌍 Glob'}
              </button>
           ))}
        </div>
      </div>

      <div className="space-y-3">
         {emisoras.map(e => (
            <button 
               key={e.id} onClick={() => setEmbolado(e.id)}
               className={`w-full text-left p-4 rounded-xl border transition-all ${embolado === e.id ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-[#ECEFF8]/50 border-gray-200/50 hover:border-gray-200'}`}
            >
               <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-slate-100 flex items-center gap-2">
                     <span className="text-lg">📻</span> {e.nom}
                  </p>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-500/20 text-[10px] text-emerald-600 font-bold uppercase tracking-widest"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> {e.on ? 'Online' : 'Offline'}</span>
               </div>
               
               <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">
                 Ocupación: {e.oc}% • Revenue: {e.rev} • {e.pa} programas activos
               </p>
               
               <div className="flex items-center gap-3 mt-2 text-[10px] font-bold">
                 {e.al > 0 ? (
                    <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-sm">🚨 {e.al} {e.al === 1 ? 'alerta crítica' : 'alertas'}</span>
                 ) : (
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm">✅ Sin alertas</span>
                 )}
                 <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-sm">💰 {e.cpd} cupos premium disp.</span>
               </div>
            </button>
         ))}
      </div>
    </div>
  )
}
