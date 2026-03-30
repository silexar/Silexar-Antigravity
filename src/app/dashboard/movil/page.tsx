'use client'

/**
 * /dashboard/movil — Silexar Pulse Mobile Dashboard
 *
 * Mobile-optimized version of the main dashboard.
 * Shows the same key metrics in a stacked card layout
 * with sticky header, pull-to-refresh feel, and skeleton loading.
 * Fetches from /api/health and /api/dashboard/metrics via apiClient.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity, Database, Shield, Zap, TrendingUp, Users,
  FileText, Radio, Building2, BarChart3, RefreshCw,
  CheckCircle, AlertTriangle, XCircle, Clock, ArrowUpRight,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '@/components/security-initializer'
import apiClient from '@/lib/api/client'
import { NeuromorphicCard } from '@/components/ui/neuromorphic'

// ---- Types ----------------------------------------------------------------

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

interface MetricItem {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color: string
  accent: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | undefined
  href: string
}

// ---- Helpers ---------------------------------------------------------------

function StatusDot({ status }: { status: string }) {
  if (status === 'healthy') {
    return (
      <span className="flex items-center gap-1 text-xs text-emerald-400">
        <CheckCircle className="w-3 h-3" /> OK
      </span>
    )
  }
  if (status === 'degraded' || status === 'not_configured') {
    return (
      <span className="flex items-center gap-1 text-xs text-yellow-400">
        <AlertTriangle className="w-3 h-3" /> Degradado
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-xs text-red-400">
      <XCircle className="w-3 h-3" /> Error
    </span>
  )
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-700/50 rounded-xl ${className}`} />
}

// ---- Main Component --------------------------------------------------------

export default function MobileDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [systemExpanded, setSystemExpanded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [healthRes, metricsRes] = await Promise.all([
      apiClient.get<SystemHealth>('/api/health'),
      apiClient.get<DashboardMetrics>('/api/dashboard/metrics'),
    ])
    if (healthRes.data) setHealth(healthRes.data)
    if (metricsRes.data) setMetrics(metricsRes.data)
    setLastRefresh(new Date())
    setLoading(false)
  }, [])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }, [load])

  useEffect(() => { load() }, [load])

  // Auto-refresh every 60s
  useEffect(() => {
    const id = setInterval(() => { void load() }, 60_000)
    return () => clearInterval(id)
  }, [load])

  const systemOk = health?.status === 'healthy'
  const dbOk = health?.checks?.database?.status === 'healthy'

  const metricItems: MetricItem[] = [
    {
      icon: BarChart3, label: 'Campanas', color: 'orange', accent: undefined,
      value: metrics?.campanas?.total ?? '--',
      sub: metrics?.campanas?.activas ? `${metrics.campanas.activas} activas` : undefined,
      href: '/campanas',
    },
    {
      icon: FileText, label: 'Contratos', color: 'blue', accent: 'blue',
      value: metrics?.contratos?.total ?? '--',
      sub: metrics?.contratos?.activos ? `${metrics.contratos.activos} activos` : undefined,
      href: '/contratos',
    },
    {
      icon: Building2, label: 'Anunciantes', color: 'purple', accent: 'purple',
      value: metrics?.anunciantes?.total ?? '--',
      href: '/anunciantes',
    },
    {
      icon: Radio, label: 'Emisoras', color: 'pink', accent: undefined,
      value: metrics?.emisoras?.total ?? '--',
      href: '/emisoras',
    },
    {
      icon: TrendingUp, label: 'Facturacion', color: 'emerald', accent: 'green',
      value: metrics?.facturas?.total ?? '--',
      sub: metrics?.facturas?.pendiente ? `${metrics.facturas.pendiente} pendientes` : undefined,
      href: '/facturacion',
    },
    {
      icon: Users, label: 'Vendedores', color: 'cyan', accent: 'blue',
      value: metrics?.vendedores?.total ?? '--',
      href: '/vendedores',
    },
  ]

  const quickLinks = [
    { label: 'Registro de Emision', icon: Radio, href: '/registro-emision', desc: 'Verificacion de pauta en aire' },
    { label: 'Agencias Creativas', icon: Building2, href: '/agencias-creativas', desc: 'Gestion de agencias' },
    { label: 'Equipos de Ventas', icon: Users, href: '/equipos-ventas', desc: 'Performance y objetivos' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sticky Header with Blur */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-slate-700/50 px-4 py-3 safe-area-inset-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-orange-500/10">
              <Zap className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Dashboard</h1>
              <p className="text-xs text-slate-500 leading-tight">
                {user ? `${user.name || user.email}` : 'Silexar Pulse'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-slate-600">
              <Clock className="w-3 h-3" />
              {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-slate-800/80 border border-slate-700/50 rounded-xl text-slate-400 active:scale-95 transition-transform disabled:opacity-50"
              aria-label="Actualizar"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Scrollable Content with overscroll for pull-to-refresh feel */}
      <div
        ref={scrollRef}
        className="overflow-y-auto overscroll-y-contain scroll-smooth px-4 pb-8 pt-4 space-y-4"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* System Health - Collapsible */}
        <NeuromorphicCard variant="embossed" className="p-4">
          <button
            onClick={() => setSystemExpanded((prev) => !prev)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Sistema
              </span>
            </div>
            <div className="flex items-center gap-2">
              {health && (
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                    systemOk
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  }`}
                >
                  {systemOk ? 'OK' : 'Degradado'}
                </span>
              )}
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                  systemExpanded ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {systemExpanded && (
            <div className="mt-3 space-y-2">
              {loading ? (
                <>
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </>
              ) : health ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(health.checks).map(([key, check]) => (
                      <div key={key} className="p-2.5 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center gap-1.5 mb-1">
                          {key === 'database' && <Database className="w-3 h-3 text-slate-400" />}
                          {key === 'environment' && <Shield className="w-3 h-3 text-slate-400" />}
                          {!['database', 'environment'].includes(key) && (
                            <Activity className="w-3 h-3 text-slate-400" />
                          )}
                          <span className="text-xs text-slate-400 capitalize">{key}</span>
                        </div>
                        <StatusDot status={check.status} />
                        {check.latencyMs !== undefined && (
                          <span className="text-xs text-slate-600 mt-0.5 block">
                            {check.latencyMs}ms
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {!dbOk && (
                    <div className="p-2.5 bg-yellow-500/5 border border-yellow-500/20 rounded-lg flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                      <p className="text-yellow-400 text-xs leading-relaxed">
                        Base de datos no conectada. Configura{' '}
                        <code className="bg-slate-700 px-1 rounded text-yellow-300">DATABASE_URL</code>{' '}
                        en <code className="bg-slate-700 px-1 rounded text-yellow-300">.env.local</code>.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-slate-500 text-xs text-center py-3">
                  No se pudo obtener el estado del sistema
                </p>
              )}
            </div>
          )}
        </NeuromorphicCard>

        {/* Metric Cards - Stacked */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            Modulos
          </h2>

          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={`metric-skeleton-${i}`} className="h-20" />
              ))
            : metricItems.map((item) => {
                const Icon = item.icon
                return (
                  <NeuromorphicCard
                    key={item.label}
                    variant="embossed"
                    borderAccent={item.accent}
                    className="p-4 active:scale-[0.98] transition-transform cursor-pointer"
                    onClick={() => router.push(item.href)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Ver ${item.label}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl bg-${item.color}-500/10 shrink-0`}>
                        <Icon className={`w-5 h-5 text-${item.color}-400`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400">{item.label}</p>
                        <p className="text-xl font-bold text-white">{item.value}</p>
                        {item.sub && (
                          <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                        )}
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-600 shrink-0" />
                    </div>
                  </NeuromorphicCard>
                )
              })}
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            Accesos Rapidos
          </h2>

          {quickLinks.map(({ label, icon: Icon, href, desc }) => (
            <NeuromorphicCard
              key={href}
              variant="embossed"
              className="p-3.5 active:scale-[0.98] transition-transform cursor-pointer"
              onClick={() => router.push(href)}
              role="button"
              tabIndex={0}
              aria-label={label}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-700/50 shrink-0">
                  <Icon className="w-4 h-4 text-slate-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-600 shrink-0" />
              </div>
            </NeuromorphicCard>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 pb-6 text-center">
          <p className="text-slate-600 text-xs">
            Silexar Pulse v{health?.version ?? '1.0.0'} · {health?.environment ?? 'dev'} ·
            Uptime: {health ? `${Math.floor(health.uptime / 3600)}h` : '--'}
          </p>
        </div>
      </div>
    </div>
  )
}
