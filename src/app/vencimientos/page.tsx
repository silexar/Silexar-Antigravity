'use client'

/**
 * VENCIMIENTOS — CENTRO DE COMANDO DE INVENTARIO COMERCIAL
 * 
 * @description Dashboard principal TIER 0 con selector de emisora dinámico,
 * métricas en tiempo real, alertas inteligentes y acciones rápidas.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useMemo, useCallback } from 'react'
import EmisoraDetailView from './_components/EmisoraDetailView'
import WizardCrearPrograma from './_components/WizardCrearPrograma'
import TarifarioIntelligenceView from './_components/TarifarioIntelligenceView'
import GlobalMetricsBanner from './_components/GlobalMetricsBanner'
import AdvancedEmisoraSelector from './_components/AdvancedEmisoraSelector'
import CortexSearchBar from './_components/CortexSearchBar'
import CommercialFiltersPanel from './_components/CommercialFiltersPanel'
import QuickActionBar from './_components/QuickActionBar'
import DashboardDisponibilidadInteligente from './_components/DashboardDisponibilidadInteligente'
import CentroAlertasProgramadoresView from './_components/CentroAlertasProgramadoresView'
import ConfiguracionTandasView from './_components/ConfiguracionTandasView'
import ConfiguracionSenalesEspecialesView from './_components/ConfiguracionSenalesEspecialesView'
import SincronizacionContratosView from './_components/SincronizacionContratosView'
import BusinessIntelligenceView from './_components/BusinessIntelligenceView'
import SecurityComplianceDashboard from './_components/SecurityComplianceDashboard'

// ═══════════════════════════════════════════════════════════════
// TIPOS DE DATOS MOCK
// ═══════════════════════════════════════════════════════════════

interface EmisoraMock {
  id: string
  nombre: string
  tipo: 'fm' | 'am' | 'digital'
  frecuencia: string
  estado: 'activa' | 'inactiva'
  operadorTrafico: string
  totalProgramas: number
  totalCupos: number
  cuposOcupados: number
  ocupacion: number
  revenue: number
  revenuePotencial: number
  alertasCriticas: number
  oportunidades: number
}

interface VencimientoAlerta {
  id: string
  cliente: string
  programa: string
  emisora: string
  ejecutivo: string
  diasRestantes: number
  tipo: 'vencimiento' | 'no_iniciado' | 'fin_manana' | 'fin_hoy' | 'extension'
  urgencia: 'baja' | 'media' | 'alta' | 'critica'
  accion: string
  countdown48h?: number
}

interface ProgramaResumen {
  id: string
  nombre: string
  conductores: string
  horario: string
  franja: string
  cuposTipoA: { total: number; ocupados: number }
  cuposTipoB: { total: number; ocupados: number }
  cuposMenciones: { total: number; ocupados: number }
  ocupacion: number
  revenue: number
  estado: string
}

// ═══════════════════════════════════════════════════════════════
// DATOS DEMO
// ═══════════════════════════════════════════════════════════════

const EMISORAS_DEMO: EmisoraMock[] = [
  {
    id: 'emi_1', nombre: 'Radio Futuro FM', tipo: 'fm', frecuencia: '88.9',
    estado: 'activa', operadorTrafico: 'Ana García',
    totalProgramas: 12, totalCupos: 96, cuposOcupados: 78,
    ocupacion: 81, revenue: 45_000_000, revenuePotencial: 55_500_000,
    alertasCriticas: 3, oportunidades: 8
  },
  {
    id: 'emi_2', nombre: 'Radio Infinita AM', tipo: 'am', frecuencia: '910',
    estado: 'activa', operadorTrafico: 'Carlos Muñoz',
    totalProgramas: 8, totalCupos: 64, cuposOcupados: 42,
    ocupacion: 66, revenue: 22_000_000, revenuePotencial: 33_500_000,
    alertasCriticas: 1, oportunidades: 14
  },
  {
    id: 'emi_3', nombre: 'Stream Digital HD', tipo: 'digital', frecuencia: 'Online',
    estado: 'activa', operadorTrafico: 'María López',
    totalProgramas: 6, totalCupos: 48, cuposOcupados: 45,
    ocupacion: 94, revenue: 18_000_000, revenuePotencial: 19_200_000,
    alertasCriticas: 0, oportunidades: 2
  }
]

const ALERTAS_DEMO: VencimientoAlerta[] = [
  { id: 'a1', cliente: 'Coca-Cola Chile', programa: 'Buenos Días Radio', emisora: 'Radio Futuro FM', ejecutivo: 'Pedro Soto', diasRestantes: 0, tipo: 'fin_hoy', urgencia: 'critica', accion: 'Confirmar retiro materiales' },
  { id: 'a2', cliente: 'Banco Santander', programa: 'Noticiero Central', emisora: 'Radio Futuro FM', ejecutivo: 'María Ruiz', diasRestantes: 1, tipo: 'fin_manana', urgencia: 'alta', accion: 'Alertar operador tráfico' },
  { id: 'a3', cliente: 'Entel', programa: 'Tarde Deportiva', emisora: 'Radio Infinita AM', ejecutivo: 'Juan Torres', diasRestantes: -2, tipo: 'no_iniciado', urgencia: 'critica', accion: 'Countdown 48h activo', countdown48h: 22 },
  { id: 'a4', cliente: 'Falabella', programa: 'Magazine AM', emisora: 'Radio Infinita AM', ejecutivo: 'Ana Torres', diasRestantes: 5, tipo: 'vencimiento', urgencia: 'alta', accion: 'Contactar para renovación' },
  { id: 'a5', cliente: 'Paris', programa: 'Noche Digital', emisora: 'Stream Digital HD', ejecutivo: 'Luis Vega', diasRestantes: 12, tipo: 'vencimiento', urgencia: 'media', accion: 'Generar propuesta' },
  { id: 'a6', cliente: 'Samsung', programa: 'Buenos Días Radio', emisora: 'Radio Futuro FM', ejecutivo: 'Pedro Soto', diasRestantes: -1, tipo: 'extension', urgencia: 'alta', accion: 'Pendiente aprobación Jefe Comercial (2ª extensión)' }
]

const PROGRAMAS_DEMO: ProgramaResumen[] = [
  { id: 'p1', nombre: 'Buenos Días Radio', conductores: 'Roberto Silva, Ana Morales', horario: '06:00-10:00', franja: 'Prime AM', cuposTipoA: { total: 4, ocupados: 4 }, cuposTipoB: { total: 3, ocupados: 2 }, cuposMenciones: { total: 20, ocupados: 18 }, ocupacion: 89, revenue: 12_500_000, estado: 'activo' },
  { id: 'p2', nombre: 'Noticiero Central', conductores: 'Carlos Gómez', horario: '13:00-14:30', franja: 'Repartida', cuposTipoA: { total: 3, ocupados: 3 }, cuposTipoB: { total: 2, ocupados: 1 }, cuposMenciones: { total: 15, ocupados: 10 }, ocupacion: 70, revenue: 8_200_000, estado: 'activo' },
  { id: 'p3', nombre: 'Drive Time PM', conductores: 'Laura Pérez, Matías Díaz', horario: '17:00-20:00', franja: 'Prime PM', cuposTipoA: { total: 4, ocupados: 3 }, cuposTipoB: { total: 3, ocupados: 3 }, cuposMenciones: { total: 20, ocupados: 15 }, ocupacion: 78, revenue: 11_000_000, estado: 'activo' },
  { id: 'p4', nombre: 'Noche Musical', conductores: 'Diego Fuentes', horario: '22:00-00:00', franja: 'Noche', cuposTipoA: { total: 2, ocupados: 1 }, cuposTipoB: { total: 2, ocupados: 0 }, cuposMenciones: { total: 10, ocupados: 3 }, ocupacion: 29, revenue: 2_800_000, estado: 'activo' }
]

// ═══════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════



function AlertaRow({ alerta }: { alerta: VencimientoAlerta }) {
  const urgenciaColors: Record<string, string> = {
    'critica': 'border-l-red-500 bg-red-50',
    'alta': 'border-l-orange-500 bg-orange-50',
    'media': 'border-l-yellow-500 bg-amber-50',
    'baja': 'border-l-blue-500 bg-blue-50'
  }
  const tipoIcons: Record<string, string> = {
    'fin_hoy': '🚨', 'fin_manana': '⚠️', 'no_iniciado': '⏱️',
    'vencimiento': '📅', 'extension': '🔄'
  }
  return (
    <div className={`flex items-center gap-4 border-l-4 rounded-2xl p-4 ${urgenciaColors[alerta.urgencia]} transition-all hover:shadow-md shadow-sm`}>
      <span className="text-2xl">{tipoIcons[alerta.tipo]}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-800 truncate">{alerta.cliente}</p>
          {alerta.countdown48h !== undefined && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold animate-pulse">
              ⏱️ {alerta.countdown48h}h restantes
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">{alerta.programa} — {alerta.emisora}</p>
        <p className="text-xs text-gray-400">{alerta.ejecutivo} | {alerta.accion}</p>
      </div>
      <div className="text-right">
        {alerta.diasRestantes >= 0 ? (
          <p className="text-lg font-bold text-gray-800">{alerta.diasRestantes}d</p>
        ) : (
          <p className="text-lg font-bold text-red-400">{Math.abs(alerta.diasRestantes)}d atraso</p>
        )}
      </div>
    </div>
  )
}

function CupoBar({ label, total, ocupados }: { label: string; total: number; ocupados: number }) {
  const pct = total > 0 ? Math.round((ocupados / total) * 100) : 0
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-12">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-600 w-14 text-right">{ocupados}/{total}</span>
    </div>
  )
}

function SemaforoSalud({ ocupacion }: { ocupacion: number }) {
  const color = ocupacion >= 60 ? 'bg-emerald-500' : ocupacion >= 40 ? 'bg-amber-500' : 'bg-red-500'
  const label = ocupacion >= 60 ? 'Saludable' : ocupacion >= 40 ? 'Atención' : 'Crítico'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${color === 'bg-emerald-500' ? 'bg-emerald-50 text-emerald-700' : color === 'bg-amber-500' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
      <span className={`w-2 h-2 rounded-full ${color} animate-pulse`} />
      {label} {ocupacion}%
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════
// PAGE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function VencimientosPage() {
  const [emisoraSeleccionada, setEmisoraSeleccionada] = useState<string>('emi_1')
  const [vistaActiva, setVistaActiva] = useState<'dashboard' | 'programas' | 'cupos' | 'tarifario' | 'tandas' | 'senales' | 'alertas' | 'sincronizacion' | 'analytics' | 'compliance'>('dashboard')
  const [filtroAlerta] = useState<string>('todas')

  const emisora = useMemo(() => EMISORAS_DEMO.find(e => e.id === emisoraSeleccionada), [emisoraSeleccionada])

  const alertasFiltradas = useMemo(() => {
    if (!emisora) return ALERTAS_DEMO
    let filtradas = ALERTAS_DEMO.filter(a => a.emisora === emisora.nombre)
    if (filtradas.length === 0) filtradas = ALERTAS_DEMO
    if (filtroAlerta !== 'todas') filtradas = filtradas.filter(a => a.tipo === filtroAlerta)
    return filtradas.sort((a, b) => {
      const urgencias: Record<string, number> = { 'critica': 4, 'alta': 3, 'media': 2, 'baja': 1 }
      return (urgencias[b.urgencia] || 0) - (urgencias[a.urgencia] || 0)
    })
  }, [emisora, filtroAlerta])

  const metricas = useMemo(() => {
    if (!emisora) return null
    return {
      ocupacion: emisora.ocupacion,
      revenue: emisora.revenue,
      cuposLibres: emisora.totalCupos - emisora.cuposOcupados,
      alertas: emisora.alertasCriticas,
      oportunidades: emisora.oportunidades,
      revenuePerdido: emisora.revenuePotencial - emisora.revenue
    }
  }, [emisora])

  const formatCLP = useCallback((n: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(n)
  }, [])

  // ── Vista de tabs ──
  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'programas', label: 'Programas', icon: '📻' },
    { key: 'cupos', label: 'Cupos', icon: '🎯' },
    { key: 'tarifario', label: 'Tarifario', icon: '💰' },
    { key: 'tandas', label: 'Tandas', icon: '📐' },
    { key: 'senales', label: 'Señales', icon: '🔔' },
    { key: 'alertas', label: 'Alertas', icon: '🚨' },
    { key: 'sincronizacion', label: 'Contratos', icon: '🔄' },
    { key: 'analytics', label: 'Analytics', icon: '📈' },
    { key: 'compliance', label: 'Security', icon: '🛡️' }
  ] as const

  return (
    <div className="min-h-screen bg-[#ECEFF8] text-gray-800">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 shadow-sm" style={{ backdropFilter: 'blur(20px)' }}>
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl">📡</span>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-gray-800">
                    Centro de Comando — Inventario Comercial
                  </h1>
                  <p className="text-xs text-gray-400">Módulo Vencimientos TIER 0 | Silexar Pulse</p>
                </div>
              </div>
            </div>

            {/* Selector de Emisora */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white/70 shadow-sm">
                <span className="text-sm text-gray-500">Emisora:</span>
                <select
                  value={emisoraSeleccionada}
                  onChange={e => setEmisoraSeleccionada(e.target.value)}
                  className="bg-transparent text-gray-800 font-semibold text-sm outline-none cursor-pointer"
                >
                  {EMISORAS_DEMO.map(e => (
                    <option key={e.id} value={e.id} className="bg-white">
                      {e.nombre} ({e.frecuencia})
                    </option>
                  ))}
                </select>
              </div>
              {emisora && <SemaforoSalud ocupacion={emisora.ocupacion} />}
            </div>
          </div>

          {/* ── TABS ── */}
          <nav className="flex gap-1 mt-4 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setVistaActiva(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${vistaActiva === tab.key ? 'bg-blue-600 text-white shadow-md shadow-blue-200/50' : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'}`}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {tab.key === 'alertas' && emisora && emisora.alertasCriticas > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse shadow-sm">
                    {emisora.alertasCriticas}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className="max-w-[1920px] mx-auto px-6 py-6 space-y-6">
        {vistaActiva === 'dashboard' && metricas && emisora && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <CortexSearchBar />
               <GlobalMetricsBanner />
               
               <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                  {/* Sidebar Izquierdo */}
                  <div className="flex flex-col gap-6 xl:col-span-1">
                     <AdvancedEmisoraSelector embolado={emisoraSeleccionada} setEmbolado={setEmisoraSeleccionada} />
                     <CommercialFiltersPanel />
                  </div>

                  {/* Body Principal */}
                  <div className="flex flex-col gap-6 xl:col-span-3">
                     <QuickActionBar />

                     {/* Panel Alertas Residual */}
                     <div className="rounded-2xl border border-white/40 bg-white/70 p-5 shadow-lg shadow-gray-200/50" style={{ backdropFilter: 'blur(16px)' }}>
                        <div className="flex items-center justify-between mb-4">
                           <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Alertas Urgentes — {emisora.nombre}</h3>
                        </div>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                           {alertasFiltradas.slice(0, 3).map(a => <AlertaRow key={a.id} alerta={a} />)}
                           {alertasFiltradas.length === 0 && (
                               <div className="text-center py-8 text-gray-400">
                                 <span className="text-3xl">✅</span>
                                 <p className="mt-2 text-xs">Sin alertas operativas</p>
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Programas */}
                     <div className="rounded-2xl border border-white/40 bg-white/70 p-5 shadow-lg shadow-gray-200/50" style={{ backdropFilter: 'blur(16px)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Programas — {emisora.nombre}
                </h3>
                <button className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold shadow-md shadow-blue-200/50 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
                  + Crear Programa
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 text-xs uppercase tracking-widest">
                      <th className="text-left py-3 px-3">Programa</th>
                      <th className="text-left py-3 px-3">Horario</th>
                      <th className="text-left py-3 px-3">Franja</th>
                      <th className="text-center py-3 px-3">Tipo A</th>
                      <th className="text-center py-3 px-3">Tipo B</th>
                      <th className="text-center py-3 px-3">Menciones</th>
                      <th className="text-center py-3 px-3">Ocupación</th>
                      <th className="text-right py-3 px-3">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PROGRAMAS_DEMO.map(prog => (
                      <tr key={prog.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors cursor-pointer">
                        <td className="py-3 px-3">
                          <p className="font-semibold text-gray-800">{prog.nombre}</p>
                          <p className="text-xs text-gray-400">{prog.conductores}</p>
                        </td>
                        <td className="py-3 px-3 text-gray-600">{prog.horario}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${prog.franja.includes('Prime') ? 'bg-amber-50 text-amber-600 border border-amber-200' : prog.franja === 'Noche' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
                            {prog.franja}
                          </span>
                        </td>
                        <td className="py-3 px-3"><CupoBar label="" total={prog.cuposTipoA.total} ocupados={prog.cuposTipoA.ocupados} /></td>
                        <td className="py-3 px-3"><CupoBar label="" total={prog.cuposTipoB.total} ocupados={prog.cuposTipoB.ocupados} /></td>
                        <td className="py-3 px-3"><CupoBar label="" total={prog.cuposMenciones.total} ocupados={prog.cuposMenciones.ocupados} /></td>
                        <td className="py-3 px-3 text-center"><SemaforoSalud ocupacion={prog.ocupacion} /></td>
                        <td className="py-3 px-3 text-right font-semibold text-gray-800">{formatCLP(prog.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

        {vistaActiva === 'alertas' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CentroAlertasProgramadoresView />
          </div>
        )}

        {vistaActiva === 'programas' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
             <EmisoraDetailView />
             <div className="pt-8 border-t border-gray-200 mt-12">
                <WizardCrearPrograma />
             </div>
          </div>
        )}

        {vistaActiva === 'cupos' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DashboardDisponibilidadInteligente />
          </div>
        )}

        {vistaActiva === 'tarifario' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <TarifarioIntelligenceView />
          </div>
        )}

        {vistaActiva === 'tandas' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <ConfiguracionTandasView />
          </div>
        )}

        {vistaActiva === 'senales' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ConfiguracionSenalesEspecialesView />
          </div>
        )}

        {vistaActiva === 'sincronizacion' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SincronizacionContratosView />
          </div>
        )}

        {vistaActiva === 'analytics' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <BusinessIntelligenceView />
          </div>
        )}

        {vistaActiva === 'compliance' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SecurityComplianceDashboard />
          </div>
        )}
      </main>
    </div>
  )
}
