'use client'

/**
 * COMPONENT: MIS VENTAS DASHBOARD - TIER 0 FASE 4
 *
 * @description El radar personal del ejecutivo. Oculta el ruido global y
 * se enfoca en sus leads, sus vencimientos en riesgo, y comisiones.
 */

import { useState } from 'react'
import CotizadorInteractivoView from './CotizadorInteractivoView'
import ConfiguradorTarifasAdmin from './ConfiguradorTarifasAdmin'
import PropuestasCortexManager from './PropuestasCortexManager'
import { TarifasProvider } from '../../../modules/vencimientos/application/store/MatrizTarifasStore'
import { BusinessRulesProvider } from '../../../modules/vencimientos/application/store/BusinessRulesStore'

export default function MisVentasDashboard() {
  const [tab, setTab] = useState<'radar' | 'cotizador' | 'config' | 'ai_rules'>('radar')

  const MIS_KPIS = {
    comisionMes: 2450000,
    metaMes: 3000000,
    renovacionesExitosas: 8,
    renovacionesPerdidas: 1,
    cuposEnRiesgo: 2
  }

  const OPORTUNIDADES_CORTEX = [
    { id: 'op1', cliente: 'Coca-Cola', tipo: 'Upsell', recomendacion: 'Ofrecer paquete Premium', prob: 85, revenue: 1200000 },
    { id: 'op2', cliente: 'Banco Santander', tipo: 'Cross-sell', recomendacion: 'Extender a Radio Infinita', prob: 60, revenue: 3500000 }
  ]

  const MIS_ALERTAS_R1 = [
    { id: 'a1', cliente: 'Entel', programa: 'Buenos Días Radio', countdown: 14, estado: 'critico' },
    { id: 'a2', cliente: 'Samsung', programa: 'Drive Time PM', countdown: 36, estado: 'advertencia' }
  ]

  return (
    <BusinessRulesProvider>
      <TarifasProvider>
        <div className="w-full h-full flex flex-col space-y-6">
          <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Mi Escritorio</h1>
          <p className="text-gray-500 mt-1">Tu radar comercial y generador de negocios (Modo Ventas).</p>
        </div>
        
        <div className="flex bg-slate-800/50 p-1 border border-slate-700/50 rounded-lg">
          <button 
            onClick={() => setTab('radar')}
            className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${tab === 'radar' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-800'}`}>
            🎯 Radar de Oportunidades
          </button>
          <button 
            onClick={() => setTab('cotizador')}
            className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${tab === 'cotizador' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-800'}`}>
            💸 Cotizador Dinámico
          </button>
          {/* BOTONES GERENCIALES TIER 0 */}
          <button 
            onClick={() => setTab('ai_rules')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${tab === 'ai_rules' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-indigo-600/70 hover:text-indigo-600'}`}>
            <span className="animate-pulse">✨</span> Cortex Rules
          </button>
          <button 
            onClick={() => setTab('config')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${tab === 'config' ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-500/50 hover:text-emerald-600'}`}>
            <span>⚙️</span> Matriz (GG)
          </button>
        </div>
      </div>

      {tab === 'radar' && (
        <div className="grid grid-cols-12 gap-6 pb-12">
          {/* Col 1: KPIs y Tracción */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white/80 border border-slate-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Tracción del Mes</h3>
              
              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-1">Comisión Estimada Actual</p>
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-black text-emerald-600">${new Intl.NumberFormat('es-CL').format(MIS_KPIS.comisionMes)}</p>
                  <p className="text-sm font-medium text-gray-500 mb-1">/ ${new Intl.NumberFormat('es-CL').format(MIS_KPIS.metaMes)}</p>
                </div>
                {/* ProgressBar */}
                <div className="w-full bg-slate-800 h-2 mt-4 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(MIS_KPIS.comisionMes / MIS_KPIS.metaMes) * 100}%` }} />
                </div>
                <p className="text-xs text-emerald-500 mt-2 font-medium">Estás a un 81% de tu meta. ¡Sigue así!</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#ECEFF8] p-4 rounded-lg border border-slate-800/50">
                  <p className="text-3xl font-bold text-gray-800">{MIS_KPIS.renovacionesExitosas}</p>
                  <p className="text-xs text-gray-500 mt-1">Renovaciones</p>
                </div>
                <div className="bg-[#ECEFF8] p-4 rounded-lg border border-slate-800/50">
                  <p className="text-3xl font-bold text-red-600">{MIS_KPIS.renovacionesPerdidas}</p>
                  <p className="text-xs text-gray-500 mt-1">Churn (Pérdidas)</p>
                </div>
              </div>
            </div>

            {/* Fricción: Regla 1 */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>
              <h3 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span>⏱️</span> Riesgo No-Inicio (R1)
              </h3>
              <p className="text-xs text-gray-500 mb-4">Clientes en peligro de auto-eliminación por falta de material comercial.</p>
              
              <div className="space-y-3">
                {MIS_ALERTAS_R1.map(alerta => (
                  <div key={alerta.id} className="bg-white/80 border border-slate-800 p-4 rounded-lg flex justify-between items-center group hover:bg-slate-800 transition-colors">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{alerta.cliente}</p>
                      <p className="text-[10px] text-gray-500">{alerta.programa}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className={`text-xs font-black ${alerta.countdown < 24 ? 'text-red-500' : 'text-amber-500'}`}>
                        {alerta.countdown} hrs
                      </span>
                      <button className="text-[10px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity mt-1 hover:text-indigo-600">
                        ⚡ Pedir 24h Extra
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Col 2: Cortex Opportunities (Tinder Ventas) */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-xl p-6 shadow-xl h-full">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-xl">✨</span> Cortex IA: Leads Diarios
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Oportunidades pre-calculadas para maximizar tus ingresos hoy.</p>
                </div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full border border-indigo-500/30">
                  {OPORTUNIDADES_CORTEX.length} Oportunidades
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {OPORTUNIDADES_CORTEX.map(op => (
                  <div key={op.id} className="bg-[#ECEFF8]/50 border border-slate-800 hover:border-indigo-500/50 p-5 rounded-xl transition-all relative group cursor-pointer">
                    {/* Tarjeta IA */}
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-2.5 py-1 bg-slate-800 text-gray-600 text-[10px] font-bold uppercase rounded-md border border-slate-700">
                        {op.tipo}
                      </span>
                      <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-[10px] font-bold border border-emerald-500/20">
                        <span>🎯</span> {op.prob}% Match
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">{op.cliente}</h4>
                    <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed">{op.recomendacion}</p>
                    
                    <div className="flex justify-between items-end mt-auto">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-0.5">Potencial Venta</p>
                        <p className="text-lg font-black text-emerald-600 bg-clip-text">
                          +${new Intl.NumberFormat('es-CL').format(op.revenue)}
                        </p>
                      </div>
                      <button className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-lg shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'cotizador' && (
        <div className="pb-12 h-full">
          <CotizadorInteractivoView />
        </div>
      )}

      {tab === 'config' && (
        <div className="pb-12 h-full">
          <ConfiguradorTarifasAdmin />
        </div>
      )}

      {tab === 'ai_rules' && (
        <div className="pb-12 h-full">
          <PropuestasCortexManager />
        </div>
      )}
        </div>
      </TarifasProvider>
    </BusinessRulesProvider>
  )
}
