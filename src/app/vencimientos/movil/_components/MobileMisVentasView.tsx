'use client'

/**
 * COMPONENT: MOBILE MIS VENTAS VIEW - TIER 0 FASE 4
 *
 * @description Versión móvil del radar personal del ejecutivo.
 * "Tinder de Ventas" con leads IA y aprobaciones 1-click urgentes.
 */

import { useState } from 'react'
import CotizadorInteractivoView from '../../_components/CotizadorInteractivoView'

const OPORTUNIDADES_CORTEX = [
  { id: 'op1', cliente: 'Coca-Cola', tipo: 'Upsell', prob: 85, revenue: 1200000, desc: 'Ofrecer paquete Premium' },
  { id: 'op2', cliente: 'Santander', tipo: 'Cross-sell', prob: 60, revenue: 3500000, desc: 'Extender a Infinita AM' }
]

const ALERTAS_R1 = [
  { id: 'a1', cliente: 'Entel', programa: 'Buenos Días R.', h: 14 },
  { id: 'a2', cliente: 'Samsung', programa: 'Drive Time', h: 36 }
]

export default function MobileMisVentasView() {
  const [tab, setTab] = useState<'radar' | 'leads' | 'cotizar'>('radar')
  const [verGlobal, setVerGlobal] = useState(false)

  if (verGlobal) {
    return (
      <div className="min-h-screen bg-[#ECEFF8] flex flex-col items-center justify-center p-6 text-center">
        <span className="text-6xl mb-4 opacity-50">🌐</span>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Tablero Global de Emisora</h2>
        <p className="text-gray-500 text-sm mb-8">Aquí podrías ver la ocupación de toda la radio. Tu rol actual es Ejecutivo de Ventas (lectura).</p>
        <button 
          onClick={() => setVerGlobal(false)}
          className="px-6 py-3 bg-indigo-600 font-bold text-gray-800 rounded-xl shadow-lg shadow-indigo-500/20">
          Volver a Mis Ventas
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#ECEFF8] text-gray-800 pb-20 overflow-x-hidden">
      {/* Header Mis Ventas */}
      <header className="sticky top-0 z-50 bg-[#ECEFF8]/90 border-b border-indigo-500/20 px-4 py-3 flex justify-between items-center" style={{ backdropFilter: 'blur(12px)' }}>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">Mis Ventas</h1>
          <p className="text-[10px] text-gray-500">Modo Ejecutivo de Terreno</p>
        </div>
        <button 
          onClick={() => setVerGlobal(true)}
          className="bg-slate-800 border border-slate-700 p-2 rounded-lg text-xs font-bold w-10 h-10 flex items-center justify-center shadow-lg">
          🌐
        </button>
      </header>

      {/* Tabs */}
      <div className="flex px-4 py-3 gap-2 sticky top-[60px] z-40 bg-[#ECEFF8]">
        {(['radar', 'leads', 'cotizar'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${tab === t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/80 text-gray-500'}`}>
            {t}
          </button>
        ))}
      </div>

      <main className="px-4 space-y-4 pt-2">
        {tab === 'radar' && (
          <>
            {/* Resumen KPIs */}
            <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/20 rounded-xl p-4">
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1">Comisión Mes (81%)</p>
              <div className="flex items-end gap-2 mb-3">
                <p className="text-3xl font-black text-gray-800">$2.45M</p>
                <p className="text-xs text-gray-500 mb-1">/ $3.0M Meta</p>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '81%' }} />
              </div>
            </div>

            {/* Fricción Crítica R1 */}
            <h2 className="text-sm font-bold text-gray-600 mt-6 mb-2 flex items-center gap-2">
              <span className="text-red-500 animate-pulse">●</span> En Peligro (Regla R1)
            </h2>
            <div className="space-y-3">
              {ALERTAS_R1.map(alerta => (
                <div key={alerta.id} className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-800 text-base">{alerta.cliente}</h3>
                      <p className="text-[10px] text-gray-500">{alerta.programa}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-black px-2 py-1 rounded bg-red-50 ${alerta.h < 24 ? 'text-red-600' : 'text-amber-600'}`}>
                        {alerta.h} hrs left
                      </span>
                    </div>
                  </div>
                  <button className="w-full py-2.5 bg-white/80 hover:bg-slate-800 text-indigo-600 border border-slate-700/50 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                    ⚡ Pedir Extensión 24h
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'leads' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-indigo-600 mt-2 mb-4 flex items-center gap-2">
              <span className="text-xl">🔥</span> Tinder de Ventas
            </h2>
            {OPORTUNIDADES_CORTEX.map(op => (
              <div key={op.id} className="bg-white/80 border border-indigo-500/20 rounded-xl p-5 shadow-lg relative cursor-pointer active:scale-95 transition-transform">
                <div className="absolute top-0 right-0 m-4 w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
                  <span className="text-xs font-bold text-indigo-600">{op.prob}%</span>
                </div>
                
                <span className="px-2.5 py-1 bg-slate-800 text-gray-600 text-[10px] font-bold uppercase rounded-md border border-slate-700">
                  {op.tipo}
                </span>
                
                <h3 className="text-lg font-black text-gray-800 mt-3 mb-1">{op.cliente}</h3>
                <p className="text-xs text-gray-500 mb-5 pr-12">{op.desc}</p>
                
                <div className="flex justify-between items-center bg-[#ECEFF8] p-3 rounded-lg border border-slate-800">
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase font-bold">Ganancia Est.</p>
                    <p className="text-base font-bold text-emerald-600">+${(op.revenue / 1000000).toFixed(1)}M</p>
                  </div>
                  <button className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'cotizar' && (
          <div className="-mx-4 flex flex-col pt-2">
            <CotizadorInteractivoView />
          </div>
        )}
      </main>
    </div>
  )
}
