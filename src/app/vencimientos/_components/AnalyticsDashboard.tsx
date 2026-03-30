'use client'

/**
 * COMPONENTE: ANALYTICS DASHBOARD
 * TIER 0 ENTERPRISE FASE 2
 *
 * @description Business Intelligence dashboard con KPIs, tendencias,
 * top performers, semáforo de inventario (Mejora 8),
 * revenue perdido (Mejora 9), y comparador (Mejora 10).
 */

import { useState } from 'react'

// ── KPIs Mock ──
const KPIs = {
  ocupacionGlobal: 76,
  revenueTotal: 85_000_000,
  revenuePotencial: 108_000_000,
  revenuePerdido: 23_000_000,
  tasaRenovacion: 72,
  tiempoPromedioVenta: 5.2,
  clientesUnicos: 42,
  cuposEnListaEspera: 8,
  extensionesSolicitadas: 12,
  extensionesAprobadas: 10
}

const TOP_PROGRAMAS = [
  { nombre: 'Buenos Días Radio', ocupacion: 89, revenue: 12_500_000, tendencia: 'up' },
  { nombre: 'Drive Time PM', ocupacion: 78, revenue: 11_000_000, tendencia: 'up' },
  { nombre: 'Noticiero Central', ocupacion: 70, revenue: 8_200_000, tendencia: 'stable' },
  { nombre: 'Noche Musical', ocupacion: 29, revenue: 2_800_000, tendencia: 'down' }
]

const TENDENCIA_MENSUAL = [
  { mes: 'Sep 2025', ocupacion: 62, revenue: 58_000_000 },
  { mes: 'Oct 2025', ocupacion: 65, revenue: 64_000_000 },
  { mes: 'Nov 2025', ocupacion: 71, revenue: 72_000_000 },
  { mes: 'Dic 2025', ocupacion: 82, revenue: 95_000_000 },
  { mes: 'Ene 2026', ocupacion: 68, revenue: 67_000_000 },
  { mes: 'Feb 2026', ocupacion: 74, revenue: 80_000_000 },
  { mes: 'Mar 2026', ocupacion: 76, revenue: 85_000_000 }
]

const formatCLP = (n: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(n)

export default function AnalyticsDashboard() {
  const [vistaKPI, setVistaKPI] = useState<'kpis' | 'tendencias' | 'comparador'>('kpis')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">📊 Analytics & Business Intelligence</h2>
          <p className="text-xs text-gray-400">KPIs en tiempo real, tendencias y comparador de períodos</p>
        </div>
        <div className="flex gap-1">
          {(['kpis', 'tendencias', 'comparador'] as const).map(v => (
            <button key={v} onClick={() => setVistaKPI(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${vistaKPI === v ? 'bg-cyan-500/20 text-cyan-600' : 'text-gray-500 hover:text-gray-800'}`}>
              {v === 'kpis' ? '📊 KPIs' : v === 'tendencias' ? '📈 Tendencias' : '🔄 Comparador'}
            </button>
          ))}
        </div>
      </div>

      {vistaKPI === 'kpis' && (
        <>
          {/* KPIs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Ocupación Global', value: `${KPIs.ocupacionGlobal}%`, icon: '📊', color: KPIs.ocupacionGlobal >= 70 ? 'text-emerald-600' : 'text-amber-600' },
              { label: 'Revenue Total', value: formatCLP(KPIs.revenueTotal), icon: '💰', color: 'text-emerald-600' },
              { label: 'Revenue Perdido', value: formatCLP(KPIs.revenuePerdido), icon: '📉', color: 'text-red-600' },
              { label: 'Tasa Renovación', value: `${KPIs.tasaRenovacion}%`, icon: '🔄', color: 'text-blue-600' },
              { label: 'Clientes Únicos', value: `${KPIs.clientesUnicos}`, icon: '👥', color: 'text-purple-600' }
            ].map((kpi, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white/70 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span>{kpi.icon}</span>
                  <span className="text-xs text-gray-500">{kpi.label}</span>
                </div>
                <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Métricas secundarias */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Tiempo Medio Venta', value: `${KPIs.tiempoPromedioVenta} días`, icon: '⏱️' },
              { label: 'Lista de Espera', value: `${KPIs.cuposEnListaEspera} clientes`, icon: '📋' },
              { label: 'Extensiones Solicitadas', value: `${KPIs.extensionesSolicitadas}`, icon: '🔄' },
              { label: 'Extensiones Aprobadas', value: `${KPIs.extensionesAprobadas} (${Math.round(KPIs.extensionesAprobadas / KPIs.extensionesSolicitadas * 100)}%)`, icon: '✅' }
            ].map((m, i) => (
              <div key={i} className="rounded-xl border border-gray-200/50 bg-white/3 p-3">
                <span className="text-xs text-gray-400">{m.icon} {m.label}</span>
                <p className="text-sm font-semibold text-gray-800 mt-1">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Top Programas + Semáforo de Salud */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <div className="rounded-2xl border border-gray-200 bg-white/70 p-5">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">🏆 Ranking de Programas</h3>
              <div className="space-y-3">
                {TOP_PROGRAMAS.map((prog, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-lg w-8 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-800">{prog.nombre}</p>
                        <span className={`text-xs ${prog.tendencia === 'up' ? 'text-emerald-600' : prog.tendencia === 'down' ? 'text-red-600' : 'text-gray-400'}`}>
                          {prog.tendencia === 'up' ? '↑' : prog.tendencia === 'down' ? '↓' : '→'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex-1 h-1.5 rounded-full bg-white/60 overflow-hidden">
                          <div className={`h-full rounded-full ${prog.ocupacion >= 70 ? 'bg-emerald-500' : prog.ocupacion >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${prog.ocupacion}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-10">{prog.ocupacion}%</span>
                        <span className="text-xs text-gray-500 w-24 text-right">{formatCLP(prog.revenue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Semáforo de Salud (Mejora 8) */}
            <div className="rounded-2xl border border-gray-200 bg-white/70 p-5">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">🚦 Semáforo de Inventario (Mejora 8)</h3>
              <div className="space-y-4">
                {[
                  { label: 'Radio Futuro FM', ocupacion: 81, revenue: 45_000_000 },
                  { label: 'Radio Infinita AM', ocupacion: 66, revenue: 22_000_000 },
                  { label: 'Stream Digital HD', ocupacion: 94, revenue: 18_000_000 }
                ].map((em, i) => {
                  const color = em.ocupacion >= 80 ? 'bg-emerald-500' : em.ocupacion >= 60 ? 'bg-emerald-400' : em.ocupacion >= 40 ? 'bg-amber-500' : 'bg-red-500'
                  const label = em.ocupacion >= 80 ? 'Óptimo' : em.ocupacion >= 60 ? 'Saludable' : em.ocupacion >= 40 ? 'Atención' : 'Crítico'
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <span className={`w-4 h-4 rounded-full ${color} animate-pulse`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-800">{em.label}</p>
                          <span className="text-xs text-gray-500">{label} {em.ocupacion}%</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 rounded-full bg-white/60 overflow-hidden">
                            <div className={`h-full rounded-full ${color}`} style={{ width: `${em.ocupacion}%` }} />
                          </div>
                          <span className="text-xs text-gray-400">{formatCLP(em.revenue)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Revenue Perdido (Mejora 9) */}
              <div className="mt-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                <h4 className="text-xs font-semibold text-red-600 uppercase">💸 Revenue Perdido (Mejora 9)</h4>
                <p className="text-xl font-bold text-red-600 mt-1">{formatCLP(KPIs.revenuePerdido)}</p>
                <p className="text-xs text-gray-400 mt-1">{Math.round((KPIs.revenuePerdido / KPIs.revenuePotencial) * 100)}% del revenue potencial no realizado</p>
              </div>
            </div>
          </div>
        </>
      )}

      {vistaKPI === 'tendencias' && (
        <div className="rounded-2xl border border-gray-200 bg-white/70 p-6">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">📈 Tendencias Mensuales</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-xs text-gray-500">Mes</th>
                  <th className="text-right py-3 text-xs text-gray-500">Ocupación</th>
                  <th className="text-center py-3 text-xs text-gray-500">Gráfico</th>
                  <th className="text-right py-3 text-xs text-gray-500">Revenue</th>
                  <th className="text-center py-3 text-xs text-gray-500">Tendencia</th>
                </tr>
              </thead>
              <tbody>
                {TENDENCIA_MENSUAL.map((m, i) => {
                  const prevOcup = i > 0 ? TENDENCIA_MENSUAL[i - 1].ocupacion : m.ocupacion
                  const delta = m.ocupacion - prevOcup
                  return (
                    <tr key={i} className="border-b border-gray-200/50">
                      <td className="py-3 text-gray-800 font-medium">{m.mes}</td>
                      <td className="py-3 text-right text-gray-800">{m.ocupacion}%</td>
                      <td className="py-3 px-4">
                        <div className="h-2 rounded-full bg-white/60 overflow-hidden">
                          <div className={`h-full rounded-full ${m.ocupacion >= 70 ? 'bg-emerald-500' : m.ocupacion >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${m.ocupacion}%` }} />
                        </div>
                      </td>
                      <td className="py-3 text-right text-gray-800">{formatCLP(m.revenue)}</td>
                      <td className="py-3 text-center">
                        <span className={`text-xs font-bold ${delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                          {delta > 0 ? `↑ +${delta}%` : delta < 0 ? `↓ ${delta}%` : '→ 0%'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {vistaKPI === 'comparador' && (
        <div className="rounded-2xl border border-gray-200 bg-white/70 p-6">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">🔄 Comparador de Períodos (Mejora 10)</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Período 1 */}
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5 text-center">
              <p className="text-xs text-blue-600 uppercase font-semibold">Período 1</p>
              <p className="text-lg font-bold text-gray-800 mt-2">Dic 2025</p>
              <div className="mt-4 space-y-3">
                <div><span className="text-xs text-gray-500">Ocupación</span><p className="text-2xl font-bold text-blue-600">82%</p></div>
                <div><span className="text-xs text-gray-500">Revenue</span><p className="text-lg font-bold text-gray-800">{formatCLP(95_000_000)}</p></div>
              </div>
            </div>
            {/* Delta */}
            <div className="rounded-xl border border-gray-200 bg-white/70 p-5 flex flex-col items-center justify-center">
              <p className="text-xs text-gray-500 uppercase font-semibold">Comparación</p>
              <div className="mt-4 space-y-4 text-center">
                <div>
                  <span className="text-xs text-gray-500">Δ Ocupación</span>
                  <p className="text-2xl font-bold text-red-600">-6%</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Δ Revenue</span>
                  <p className="text-lg font-bold text-red-600">{formatCLP(-10_000_000)}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold">📉 Decrecimiento</span>
              </div>
            </div>
            {/* Período 2 */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-center">
              <p className="text-xs text-emerald-600 uppercase font-semibold">Período 2</p>
              <p className="text-lg font-bold text-gray-800 mt-2">Mar 2026</p>
              <div className="mt-4 space-y-3">
                <div><span className="text-xs text-gray-500">Ocupación</span><p className="text-2xl font-bold text-emerald-600">76%</p></div>
                <div><span className="text-xs text-gray-500">Revenue</span><p className="text-lg font-bold text-gray-800">{formatCLP(85_000_000)}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
