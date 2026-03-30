'use client'

/**
 * 🏠 SILEXAR PULSE - Super Admin Dashboard Page
 * Página principal para Super Administradores de Silexar
 * 
 * @route /super-admin
 * @access Super Admin Only
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect } from 'react'
import { 
  NeuromorphicCard, 
  NeuromorphicButton 
} from '@/components/ui/neuromorphic'
import {
  Zap, Building, Users, Ticket, Shield, Activity, TrendingUp,
  AlertTriangle, CheckCircle, Globe, Server, BarChart3,
  Settings, Bell, Search, ChevronRight, RefreshCw, Plus
} from 'lucide-react'

// Mock data types
interface TenantOverview {
  id: string
  name: string
  plan: string
  status: 'active' | 'trial' | 'suspended'
  usersCount: number
  ticketsOpen: number
}

interface SystemMetric {
  label: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color: string
}

export default function SuperAdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [tenants, setTenants] = useState<TenantOverview[]>([])
  const [metrics, setMetrics] = useState<SystemMetric[]>([])
  const activeAlerts = 3 // Alertas activas (mock)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 500))

    setMetrics([
      { label: 'Tenants Activos', value: 127, change: 8, icon: <Building className="w-5 h-5" />, color: 'blue' },
      { label: 'Usuarios Totales', value: '2,458', change: 12, icon: <Users className="w-5 h-5" />, color: 'green' },
      { label: 'Tickets Abiertos', value: 23, change: -5, icon: <Ticket className="w-5 h-5" />, color: 'orange' },
      { label: 'Uptime', value: '99.99%', icon: <Server className="w-5 h-5" />, color: 'emerald' },
      { label: 'CPU', value: '42%', icon: <Activity className="w-5 h-5" />, color: 'purple' },
      { label: 'Revenue MRR', value: '$125K', change: 15, icon: <TrendingUp className="w-5 h-5" />, color: 'yellow' }
    ])

    setTenants([
      { id: 't1', name: 'Tech Solutions Inc', plan: 'Enterprise', status: 'active', usersCount: 45, ticketsOpen: 2 },
      { id: 't2', name: 'Media Corp', plan: 'Professional', status: 'active', usersCount: 23, ticketsOpen: 0 },
      { id: 't3', name: 'Retail Plus', plan: 'Starter', status: 'trial', usersCount: 5, ticketsOpen: 1 },
      { id: 't4', name: 'Finance Pro', plan: 'Enterprise', status: 'active', usersCount: 67, ticketsOpen: 3 },
      { id: 't5', name: 'Health Systems', plan: 'Professional', status: 'active', usersCount: 34, ticketsOpen: 0 }
    ])

    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Super Admin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Top Bar */}
      <div className="bg-slate-800/80 border-b border-red-500/30 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-lg">Silexar Pulse</span>
                <span className="ml-2 text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">SUPER ADMIN</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar tenants, usuarios..."
                aria-label="Buscar tenants o usuarios"
                className="w-80 pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-red-500/50 focus:outline-none"
              />
            </div>
            <button aria-label="Notificaciones" className="relative p-2 hover:bg-slate-700 rounded-lg">
              <Bell className="w-5 h-5 text-slate-400" />
              {activeAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {activeAlerts}
                </span>
              )}
            </button>
            <button aria-label="Configuración" className="p-2 hover:bg-slate-700 rounded-lg">
              <Settings className="w-5 h-5 text-slate-400" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold">
                SA
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">👑 Super Admin Dashboard</h1>
            <p className="text-slate-400">Control total del sistema Silexar Pulse</p>
          </div>
          <div className="flex gap-2">
            <NeuromorphicButton variant="secondary" size="sm" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Actualizar
            </NeuromorphicButton>
            <NeuromorphicButton variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Nuevo Tenant
            </NeuromorphicButton>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          {metrics.map((metric, i) => (
            <NeuromorphicCard key={i} variant="embossed" className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-${metric.color}-500/20 text-${metric.color}-400`}>
                  {metric.icon}
                </div>
                {metric.change !== undefined && (
                  <span className={`text-xs ${metric.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-white">{metric.value}</p>
              <p className="text-xs text-slate-500">{metric.label}</p>
            </NeuromorphicCard>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-8 space-y-6">
            {/* Quick Actions */}
            <NeuromorphicCard variant="glow" className="p-6">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Acciones Rápidas
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { name: 'Gestionar Tenants', icon: <Building className="w-5 h-5" />, color: 'blue' },
                  { name: 'Bandeja de Tickets', icon: <Ticket className="w-5 h-5" />, color: 'orange' },
                  { name: 'Usuarios del Sistema', icon: <Users className="w-5 h-5" />, color: 'green' },
                  { name: 'Seguridad', icon: <Shield className="w-5 h-5" />, color: 'red' },
                  { name: 'Monitoreo', icon: <Activity className="w-5 h-5" />, color: 'purple' },
                  { name: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, color: 'cyan' },
                  { name: 'Configuración', icon: <Settings className="w-5 h-5" />, color: 'slate' },
                  { name: 'Multi-Región', icon: <Globe className="w-5 h-5" />, color: 'emerald' }
                ].map((action, i) => (
                  <button 
                    key={i}
                    className={`p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700 hover:border-${action.color}-500/50 transition-all group`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-${action.color}-500/20 text-${action.color}-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                      {action.icon}
                    </div>
                    <p className="text-white text-sm">{action.name}</p>
                  </button>
                ))}
              </div>
            </NeuromorphicCard>

            {/* Recent Tenants */}
            <NeuromorphicCard variant="embossed" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-400" />
                  Tenants Recientes
                </h3>
                <button className="text-sm text-orange-400 hover:underline">Ver todos →</button>
              </div>
              <div className="space-y-3">
                {tenants.map(tenant => (
                  <div key={tenant.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{tenant.name}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500">{tenant.plan}</span>
                          <span className={`px-1.5 py-0.5 rounded ${
                            tenant.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            tenant.status === 'trial' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {tenant.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-white font-medium">{tenant.usersCount}</p>
                        <p className="text-xs text-slate-500">usuarios</p>
                      </div>
                      <div className="text-center">
                        <p className={`font-medium ${tenant.ticketsOpen > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                          {tenant.ticketsOpen}
                        </p>
                        <p className="text-xs text-slate-500">tickets</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            </NeuromorphicCard>
          </div>

          {/* Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* System Status */}
            <NeuromorphicCard variant="embossed" className="p-6">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Server className="w-5 h-5 text-green-400" />
                Estado del Sistema
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'API Server', status: 'online' },
                  { name: 'Database Cluster', status: 'online' },
                  { name: 'Redis Cache', status: 'online' },
                  { name: 'CDN', status: 'online' },
                  { name: 'AI Services', status: 'degraded' }
                ].map((service, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg">
                    <span className="text-slate-300 text-sm">{service.name}</span>
                    <span className={`flex items-center gap-1 text-xs ${
                      service.status === 'online' ? 'text-green-400' :
                      service.status === 'degraded' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        service.status === 'online' ? 'bg-green-400' :
                        service.status === 'degraded' ? 'bg-yellow-400' :
                        'bg-red-400'
                      } animate-pulse`} />
                      {service.status}
                    </span>
                  </div>
                ))}
              </div>
            </NeuromorphicCard>

            {/* Alerts */}
            <NeuromorphicCard variant="embossed" className="p-6">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                Alertas Activas
              </h3>
              <div className="space-y-2">
                {[
                  { message: 'Tenant "Retail Plus" trial expira en 3 días', type: 'warning' },
                  { message: 'AI Services con latencia elevada', type: 'warning' },
                  { message: '2 tickets críticos sin atender', type: 'error' }
                ].map((alert, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${
                    alert.type === 'error' ? 'bg-red-500/10 border-red-500/30' :
                    'bg-yellow-500/10 border-yellow-500/30'
                  }`}>
                    <p className={`text-sm ${alert.type === 'error' ? 'text-red-400' : 'text-yellow-400'}`}>
                      {alert.message}
                    </p>
                  </div>
                ))}
              </div>
            </NeuromorphicCard>

            {/* Activity */}
            <NeuromorphicCard variant="embossed" className="p-6">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Actividad Reciente
              </h3>
              <div className="space-y-3">
                {[
                  { action: 'Nuevo tenant creado: Finance Pro', time: '5 min' },
                  { action: 'Usuario suspendido en Media Corp', time: '15 min' },
                  { action: 'Ticket #5432 resuelto', time: '1 hora' },
                  { action: 'Backup completado', time: '2 horas' }
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-300">{activity.action}</p>
                      <p className="text-xs text-slate-500">Hace {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </NeuromorphicCard>
          </div>
        </div>
      </div>
    </div>
  )
}