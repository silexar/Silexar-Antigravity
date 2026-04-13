'use client'

/**
 * MOBILE: VENCIMIENTOS DASHBOARD EJECUTIVO
 * TIER 0 ENTERPRISE FASE 2
 */

import { useState } from 'react'
import MobileTarifarioIntelligenceView from './MobileTarifarioIntelligenceView'
import MobileEmisoraDetailView from './MobileEmisoraDetailView'
import MobileWizardCrearPrograma from './MobileWizardCrearPrograma'
import MobileBusinessIntelligenceView from './MobileBusinessIntelligenceView'
import MobileDisponibilidadBuscador from './MobileDisponibilidadBuscador'
import MobileSecurityComplianceDashboard from './MobileSecurityComplianceDashboard'
import MobileCentroAlertasProgramadoresView from './MobileCentroAlertasProgramadoresView'

const EMISORAS = [
  { id: 'emi_1', nombre: 'Radio Futuro FM', frecuencia: '88.9', ocupacion: 81, revenue: 45_000_000, alertas: 3 },
  { id: 'emi_2', nombre: 'Radio Infinita AM', frecuencia: '910', ocupacion: 66, revenue: 22_000_000, alertas: 1 },
  { id: 'emi_3', nombre: 'Stream Digital HD', frecuencia: 'Online', ocupacion: 94, revenue: 18_000_000, alertas: 0 }
]



// Data encapsulada en MobileEmisoraDetailView.tsx
const formatCLP = (n: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(n)

export default function MobileVencimientosDashboard() {
  const [tab, setTab] = useState<'resumen' | 'alertas' | 'programas' | 'pricing' | 'analytics' | 'cupos' | 'compliance' | 'hub'>('resumen')
  const [emisoraId, setEmisoraId] = useState('emi_1')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const emisora = EMISORAS.find(e => e.id === emisoraId)!

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/30 text-gray-800 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-[#ECEFF8]/90 px-4 py-3" style={{ backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Vencimientos</h1>
            <p className="text-[10px] text-gray-400">Centro de Comando Móvil</p>
          </div>
          <select value={emisoraId} onChange={e => setEmisoraId(e.target.value)}
            className="bg-white/70 border border-gray-200 text-gray-800 text-xs rounded-lg px-2 py-1.5 outline-none">
            {EMISORAS.map(e => <option key={e.id} value={e.id} className="bg-white/80">{e.nombre}</option>)}
          </select>
        </div>
      </header>

      {/* Cortex Search & Filtros */}
      <div className="px-4 mt-4">
         <div className="bg-white/70 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-gray-500">🔍</span>
            <input type="text" placeholder="Búsqueda Cortex..." aria-label="Búsqueda Cortex" className="bg-transparent border-none text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-0 w-full font-medium" />
            <div className="w-px h-6 bg-white/60 mx-1"></div>
            <button onClick={() => setMostrarFiltros(!mostrarFiltros)} className={`text-xl transition-all ${mostrarFiltros ? 'text-amber-500' : 'text-gray-500'}`}>
               🎛️
            </button>
         </div>
         {mostrarFiltros && (
            <div className="mt-3 bg-white/80/80 rounded-xl p-4 border border-gray-200/50 shadow-2xl animate-in fade-in slide-in-from-top-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-3">Filtros Comerciales</p>
                <div className="flex flex-wrap gap-2 mb-3">
                   <span className="bg-amber-50 text-amber-600 border border-amber-500/30 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest">Este Mes</span>
                   <span className="bg-white/70 text-gray-400 border border-gray-200/50 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest">Próx. Mes</span>
                </div>
                <div className="flex flex-wrap gap-2">
                   <span className="bg-emerald-50 text-emerald-600 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest">Prime AM / PM</span>
                   <span className="bg-white/70 text-gray-400 border border-gray-200/50 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest">Noche</span>
                </div>
            </div>
         )}
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-3 gap-2 px-4 py-3">
        {[
          { label: 'Ocupación', value: `${emisora.ocupacion}%`, color: emisora.ocupacion >= 70 ? 'text-emerald-600' : 'text-amber-600' },
          { label: 'Revenue', value: formatCLP(emisora.revenue), color: 'text-gray-800' },
          { label: 'Alertas', value: `${emisora.alertas}`, color: emisora.alertas > 0 ? 'text-red-600' : 'text-emerald-600' }
        ].map((k, i) => (
          <div key={`${k}-${i}`} className="rounded-xl border border-gray-200 bg-white/70 p-3 text-center">
            <p className="text-[10px] text-gray-400">{k.label}</p>
            <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      {tab === 'resumen' && (
      <div className="flex gap-1 px-4 mb-3 overflow-x-auto no-scrollbar pb-1">
        {(['resumen', 'alertas', 'programas', 'pricing', 'analytics', 'cupos'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`whitespace-nowrap flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${tab === t ? 'bg-amber-50 text-amber-600' : 'text-gray-400 border border-gray-200/50'}`}>
            {t === 'resumen' ? '📊 Resumen' : t === 'alertas' ? `🚨 Alertas` : t === 'programas' ? '📻 Prog.' : t === 'pricing' ? '🤖 Pricing' : t === 'analytics' ? '📈 KPI' : '🎯 Cupos'}
          </button>
        ))}
      </div>
      )}

      <main className="px-4 space-y-3 pb-24">
        {tab === 'resumen' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Acciones Rápidas */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <button onClick={() => setTab('cupos')} className="bg-emerald-50 border border-emerald-500/20 rounded-xl p-3 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
                 <span className="text-xl">🎯</span><span className="text-[9px] font-bold text-emerald-600">Cupos</span>
              </button>
              <button onClick={() => setTab('analytics')} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
                 <span className="text-xl">📊</span><span className="text-[9px] font-bold text-amber-600">Analytics</span>
              </button>
              <button onClick={() => setTab('hub')} className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
                 <span className="text-xl">⚙️</span><span className="text-[9px] font-bold text-indigo-600">Settings</span>
              </button>
              <button onClick={() => setTab('alertas')} className="bg-red-50 border border-red-500/20 rounded-xl p-3 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
                 <span className="text-xl">🚨</span><span className="text-[9px] font-bold text-red-600">Alertas</span>
              </button>
            </div>

            {/* Semáforo emisoras */}
            {EMISORAS.map(em => {
              const color = em.ocupacion >= 80 ? 'bg-emerald-500' : em.ocupacion >= 60 ? 'bg-amber-500' : 'bg-red-500'
              return (
                <button key={em.id} onClick={() => setEmisoraId(em.id)}
                  className={`w-full rounded-xl p-4 border text-left transition-all ${em.id === emisoraId ? 'border-amber-500/30 bg-amber-500/5' : 'border-gray-200/50 bg-white/3'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${color} animate-pulse`} />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{em.nombre}</p>
                        <p className="text-[10px] text-gray-400">{em.frecuencia}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">{em.ocupacion}%</p>
                      <p className="text-[10px] text-gray-400">{formatCLP(em.revenue)}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {tab === 'alertas' && (
           <div className="animate-in fade-in slide-in-from-right-2 mt-2 -mx-4">
             <MobileCentroAlertasProgramadoresView />
           </div>
        )}

        {tab === 'programas' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
              <MobileEmisoraDetailView />

              <div className="pt-6 border-t border-gray-200 mt-6">
                 <MobileWizardCrearPrograma />
              </div>
           </div>
        )}

        {tab === 'pricing' && (
           <MobileTarifarioIntelligenceView />
        )}

        {tab === 'analytics' && (
           <div className="-mx-4">
              <MobileBusinessIntelligenceView />
           </div>
        )}

        {tab === 'cupos' && (
           <div className="-mx-4">
              <MobileDisponibilidadBuscador />
           </div>
        )}

        {tab === 'compliance' && (
           <div className="-mx-4">
              <MobileSecurityComplianceDashboard />
           </div>
        )}

        {tab === 'hub' && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in">
             <div onClick={() => setTab('compliance')} className="bg-white/80 border border-indigo-500/30 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-90 transition-transform cursor-pointer">
                <span className="text-3xl">🛡️</span><span className="text-xs font-bold text-indigo-600">Security & RBAC</span>
             </div>
             <div className="bg-white/80 border border-gray-200 p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
                <span className="text-3xl">🔄</span><span className="text-[10px] font-bold text-gray-500 text-center">Sync Contratos<br/>(Próximamente)</span>
             </div>
             <div className="bg-white/80 border border-gray-200 p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
                <span className="text-3xl">📻</span><span className="text-[10px] font-bold text-gray-500 text-center">Config Tandas<br/>(Próximamente)</span>
             </div>
             <div className="bg-white/80 border border-gray-200 p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
                <span className="text-3xl">🔔</span><span className="text-[10px] font-bold text-gray-500 text-center">Señales<br/>(Próximamente)</span>
             </div>
          </div>
        )}
      </main>

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#ECEFF8]/95 border-t border-gray-200 px-6 py-4 flex justify-between items-center z-50" style={{ backdropFilter: 'blur(20px)' }}>
         {[ 
            { id: 'resumen', icon: '🏠', label: 'Home' },
            { id: 'cupos', icon: '🎯', label: 'Cupos' },
            { id: 'programas', icon: '📻', label: 'Progs' },
            { id: 'hub', icon: '⚙️', label: 'Hub' }
         ].map((n: { id: string, icon: string, label: string }) => (
            <button key={n.id} onClick={() => setTab(n.id as "resumen" | "alertas" | "programas" | "pricing" | "analytics" | "cupos" | "compliance" | "hub")} className={`flex flex-col items-center transition-all ${tab === n.id ? 'scale-110' : 'opacity-50'}`}>
               <span className="text-2xl mb-1">{n.icon}</span>
               <span className={`text-[9px] font-bold ${tab === n.id ? 'text-amber-500' : 'text-gray-800'}`}>{n.label}</span>
            </button>
         ))}
      </nav>
    </div>
  )
}
