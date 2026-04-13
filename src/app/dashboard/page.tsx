'use client'

/**
 * /dashboard — Silexar Pulse Main Dashboard
 *
 * Shows real-time system metrics, module status, and key business KPIs.
 * Fetches from /api/health and /api/dashboard/metrics using apiClient.
 * Falls back to skeleton UI when data is loading.
 */

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  Activity, Database, Shield, Zap, TrendingUp, Users,
  FileText, Radio, Building2, BarChart3, RefreshCw,
  CheckCircle, AlertTriangle, XCircle, Clock, ArrowUpRight,
} from 'lucide-react'
import { useAuth } from '@/components/security-initializer'
import apiClient from '@/lib/api/client'

// ─── Types ───────────────────────────────────────────────────

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  environment: string
  uptime: number
  timestamp: string
  checks: Record<string, { status: string; latencyMs?: number; error?: string }>
}

interface DashboardMetrics {
  campanas:    { total: number; activas: number; valorTotal: number }
  contratos:   { total: number; activos: number }
  anunciantes: { total: number; activos: number }
  emisoras:    { total: number }
  facturas:    { total: number; pendiente: number }
  vendedores:  { total: number }
}

// ─── Helpers ─────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === 'healthy') return (
    <span className="flex items-center gap-1 text-xs text-emerald-400">
      <CheckCircle className="w-3.5 h-3.5" /> OK
    </span>
  )
  if (status === 'degraded' || status === 'not_configured') return (
    <span className="flex items-center gap-1 text-xs text-yellow-400">
      <AlertTriangle className="w-3.5 h-3.5" /> Degradado
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-xs text-red-400">
      <XCircle className="w-3.5 h-3.5" /> Error
    </span>
  )
}

function MetricCard({
  icon: Icon, label, value, sub, color, href,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color: string
  href?: string
}) {
  const router = useRouter()
  return (
    <button
      onClick={() => href && router.push(href)}
      className={`group p-5 bg-slate-800/60 border border-slate-700/50 rounded-2xl hover:border-slate-600 transition-all text-left w-full ${href ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl bg-${color}-500/10`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        {href && <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />}
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </button>
  )
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-700/50 rounded-lg ${className}`} />
}

// ─── Main Component ───────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth()

  // React Query — replaces useState(health/metrics/loading) + two useEffect fetch pattern
  const {
    data: health,
    isLoading: healthLoading,
    refetch: refetchHealth,
    dataUpdatedAt: healthUpdatedAt,
  } = useQuery({
    queryKey: ['dashboard-health'],
    queryFn: async () => {
      const res = await apiClient.get<SystemHealth>('/api/health')
      if (!res.data) throw new Error('Failed to fetch system health')
      return res.data
    },
    staleTime: 60_000,    // 1 minute per CLAUDE.md
    refetchInterval: 60_000,
  })

  const {
    data: metrics,
    isLoading: metricsLoading,
    refetch: refetchMetrics,
  } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const res = await apiClient.get<DashboardMetrics>('/api/dashboard/metrics')
      if (!res.data) throw new Error('Failed to fetch dashboard metrics')
      return res.data
    },
    staleTime: 60_000,    // 1 minute per CLAUDE.md
    refetchInterval: 60_000,
  })

  const loading = healthLoading || metricsLoading
  const lastRefresh = new Date(healthUpdatedAt || Date.now())

  const load = () => {
    refetchHealth()
    refetchMetrics()
  }

  const systemOk = health?.status === 'healthy'
  const dbOk     = health?.checks?.database?.status === 'healthy'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-500/10">
                <Zap className="w-7 h-7 text-orange-400" />
              </div>
              Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {user ? `Bienvenido, ${user.name || user.email}` : 'Silexar Pulse Enterprise Platform'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              {lastRefresh.toLocaleTimeString()}
            </span>
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700/60 border border-slate-600 rounded-xl text-slate-300 text-sm hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>

        {/* System Health */}
        <div className="p-5 bg-slate-800/60 border border-slate-700/50 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4" /> Estado del Sistema
            </h2>
            {health && (
              <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
                systemOk
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
              }`}>
                {systemOk ? 'Operativo' : 'Degradado'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={`${_}-${i}`} className="h-14" />)
              : health
              ? Object.entries(health.checks).map(([key, check]) => (
                  <div key={key} className="p-3 bg-slate-700/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      {key === 'database'    && <Database className="w-3.5 h-3.5 text-slate-400" />}
                      {key === 'environment' && <Shield className="w-3.5 h-3.5 text-slate-400" />}
                      {!['database','environment'].includes(key) && <Activity className="w-3.5 h-3.5 text-slate-400" />}
                      <span className="text-xs text-slate-400 capitalize">{key}</span>
                    </div>
                    <StatusBadge status={check.status} />
                    {check.latencyMs !== undefined && (
                      <span className="text-xs text-slate-600 mt-1 block">{check.latencyMs}ms</span>
                    )}
                  </div>
                ))
              : (
                <div className="col-span-4 text-center text-slate-500 text-sm py-4">
                  No se pudo obtener el estado del sistema
                </div>
              )
            }
          </div>

          {!dbOk && health && (
            <div className="mt-3 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-yellow-400 text-xs">
                Base de datos no conectada — los módulos muestran datos de demostración.
                Configura <code className="bg-slate-700 px-1 rounded text-yellow-300">DATABASE_URL</code> en
                {' '}<code className="bg-slate-700 px-1 rounded text-yellow-300">.env.local</code> para activar datos reales.
              </p>
            </div>
          )}
        </div>

        {/* Module KPIs */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Módulos del Sistema
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={`${_}-${i}`} className="h-32" />)
              : (
              <>
                <MetricCard icon={BarChart3}  label="Campañas"    value={metrics?.campanas?.total ?? '—'}    sub={metrics?.campanas?.activas ? `${metrics.campanas.activas} activas` : undefined}      color="orange"  href="/campanas" />
                <MetricCard icon={FileText}   label="Contratos"   value={metrics?.contratos?.total ?? '—'}   sub={metrics?.contratos?.activos ? `${metrics.contratos.activos} activos` : undefined}   color="blue"    href="/contratos" />
                <MetricCard icon={Building2}  label="Anunciantes" value={metrics?.anunciantes?.total ?? '—'} color="purple"  href="/anunciantes" />
                <MetricCard icon={Radio}      label="Emisoras"    value={metrics?.emisoras?.total ?? '—'}    color="pink"    href="/emisoras" />
                <MetricCard icon={TrendingUp} label="Facturación" value={metrics?.facturas?.total ?? '—'}    sub={metrics?.facturas?.pendiente ? `${metrics.facturas.pendiente} pendientes` : undefined} color="emerald" href="/facturacion" />
                <MetricCard icon={Users}      label="Vendedores"  value={metrics?.vendedores?.total ?? '—'}  color="cyan"    href="/vendedores" />
              </>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Registro de Emisión',  icon: Radio,     href: '/registro-emision',  desc: 'Verificación de pauta en aire' },
            { label: 'Agencias Creativas',   icon: Building2, href: '/agencias-creativas', desc: 'Gestión de agencias y comisiones' },
            { label: 'Equipos de Ventas',    icon: Users,     href: '/equipos-ventas',     desc: 'Performance y objetivos' },
          ].map(({ label, icon: Icon, href, desc }) => (
            <a key={href} href={href}
              className="group flex items-center gap-4 p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl hover:border-slate-600 hover:bg-slate-800/70 transition-all"
            >
              <div className="p-2.5 rounded-xl bg-slate-700/50 group-hover:bg-slate-700">
                <Icon className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 ml-auto transition-colors" />
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-slate-600 text-xs">
            Silexar Pulse v{health?.version ?? '1.0.0'} · {health?.environment ?? 'development'} ·
            Uptime: {health ? `${Math.floor(health.uptime / 3600)}h` : '—'}
          </p>
        </div>

      </div>
    </div>
  )
}
