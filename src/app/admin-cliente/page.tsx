'use client'

/**
 * 🏢 SILEXAR PULSE - Admin Cliente Dashboard Page
 * Dashboard principal para Administradores de Cliente (Tenant Admin)
 * 
 * @route /admin-cliente
 * @access Tenant Admin Only
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect } from 'react'
import { 
  NeuromorphicCard, 
  NeuromorphicButton 
} from '@/components/ui/neuromorphic'
import {
  Users, UserPlus, Shield, Settings, Bell, Activity, BarChart3,
  Ticket, Zap, Building, TrendingUp, Clock, CheckCircle,
  AlertTriangle, ChevronRight, RefreshCw, Search, Menu,
  Key, Mail, CreditCard, Database, Megaphone
} from 'lucide-react'

// Import client admin modules
import { UserManagement } from '@/components/admin/client/user-management'
import { SupportTickets } from '@/components/admin/client/support-tickets'

interface TenantInfo {
  name: string
  plan: string
  usersCount: number
  maxUsers: number
  daysRemaining: number
}

interface DashboardMetric {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
  trend?: number
}

type ActiveModule = 'dashboard' | 'users' | 'tickets' | 'teams' | 'billing' | 'settings' | 'integrations' | 'branding'

export default function AdminClienteDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard')
  const [tenant, setTenant] = useState<TenantInfo | null>(null)
  const [metrics, setMetrics] = useState<DashboardMetric[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 500))

    setTenant({
      name: 'Tech Solutions Inc',
      plan: 'Enterprise',
      usersCount: 45,
      maxUsers: 100,
      daysRemaining: 285
    })

    setMetrics([
      { label: 'Usuarios Activos', value: 42, icon: <Users className="w-5 h-5" />, color: 'green', trend: 5 },
      { label: 'Tickets Abiertos', value: 3, icon: <Ticket className="w-5 h-5" />, color: 'orange', trend: -2 },
      { label: 'Integraciones', value: 8, icon: <Zap className="w-5 h-5" />, color: 'purple' },
      { label: 'Plan', value: 'Enterprise', icon: <CreditCard className="w-5 h-5" />, color: 'blue' }
    ])

    setIsLoading(false)
  }

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'users', name: 'Usuarios', icon: <Users className="w-5 h-5" /> },
    { id: 'tickets', name: 'Soporte', icon: <Ticket className="w-5 h-5" /> },
    { id: 'teams', name: 'Equipos', icon: <Shield className="w-5 h-5" /> },
    { id: 'billing', name: 'Facturación', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'integrations', name: 'Integraciones', icon: <Zap className="w-5 h-5" /> },
    { id: 'branding', name: 'Branding', icon: <Megaphone className="w-5 h-5" /> },
    { id: 'settings', name: 'Configuración', icon: <Settings className="w-5 h-5" /> }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Admin Cliente...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-800/90 border-r border-slate-700 transition-all duration-300`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
              <Building className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <p className="text-white font-bold text-sm">{tenant?.name}</p>
                <p className="text-xs text-slate-500">{tenant?.plan}</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id as ActiveModule)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                activeModule === item.id 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                  : 'text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              {item.icon}
              {sidebarOpen && <span className="text-sm">{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* User Count */}
        {sidebarOpen && tenant && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">Usuarios</span>
                <span className="text-white">{tenant.usersCount}/{tenant.maxUsers}</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${(tenant.usersCount / tenant.maxUsers) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar */}
        <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-700 rounded-lg">
                <Menu className="w-5 h-5 text-slate-400" />
              </button>
              <h1 className="text-lg font-bold text-white">
                {menuItems.find(m => m.id === activeModule)?.name}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  aria-label="Buscar"
                  className="w-64 pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-blue-500/50 focus:outline-none"
                />
              </div>
              <button aria-label="Notificaciones" className="relative p-2 hover:bg-slate-700 rounded-lg">
                <Bell className="w-5 h-5 text-slate-400" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
                <div className="text-right">
                  <p className="text-white text-sm font-medium">Admin</p>
                  <p className="text-xs text-slate-500">Administrador</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  A
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Dashboard View */}
          {activeModule === 'dashboard' && (
            <div className="space-y-6">
              {/* Metrics */}
              <div className="grid grid-cols-4 gap-4">
                {metrics.map((metric, i) => (
                  <NeuromorphicCard key={i} variant="embossed" className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg bg-${metric.color}-500/20 text-${metric.color}-400`}>
                        {metric.icon}
                      </div>
                      {metric.trend !== undefined && (
                        <span className={`text-xs ${metric.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {metric.trend > 0 ? '+' : ''}{metric.trend}%
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                    <p className="text-xs text-slate-500">{metric.label}</p>
                  </NeuromorphicCard>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Quick Actions */}
                <NeuromorphicCard variant="glow" className="p-6">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Acciones Rápidas
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'Nuevo Usuario', icon: <UserPlus className="w-5 h-5" />, action: () => setActiveModule('users') },
                      { name: 'Ver Tickets', icon: <Ticket className="w-5 h-5" />, action: () => setActiveModule('tickets') },
                      { name: 'Invitar Equipo', icon: <Mail className="w-5 h-5" />, action: () => {} },
                      { name: 'API Keys', icon: <Key className="w-5 h-5" />, action: () => {} }
                    ].map((action, i) => (
                      <button 
                        key={i}
                        onClick={action.action}
                        className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all flex items-center gap-3"
                      >
                        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                          {action.icon}
                        </div>
                        <span className="text-white text-sm">{action.name}</span>
                      </button>
                    ))}
                  </div>
                </NeuromorphicCard>

                {/* Recent Activity */}
                <NeuromorphicCard variant="embossed" className="p-6">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    Actividad Reciente
                  </h3>
                  <div className="space-y-3">
                    {[
                      { action: 'Usuario Ana Silva agregado', time: '10 min', type: 'success' },
                      { action: 'Ticket #123 creado', time: '30 min', type: 'info' },
                      { action: 'Integración Meta conectada', time: '2 horas', type: 'success' },
                      { action: 'Usuario suspendido por admin', time: '1 día', type: 'warning' }
                    ].map((activity, i) => (
                      <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800/50">
                        {activity.type === 'success' && <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />}
                        {activity.type === 'info' && <Clock className="w-4 h-4 text-blue-400 mt-0.5" />}
                        {activity.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />}
                        <div className="flex-1">
                          <p className="text-sm text-slate-300">{activity.action}</p>
                          <p className="text-xs text-slate-500">Hace {activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </NeuromorphicCard>
              </div>

              {/* Connection Status */}
              <NeuromorphicCard variant="embossed" className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-white">Conectado a Silexar Pulse</span>
                  </div>
                  <span className="text-xs text-slate-500">Último sync: hace 2 min</span>
                </div>
              </NeuromorphicCard>
            </div>
          )}

          {/* Users Module */}
          {activeModule === 'users' && <UserManagement />}

          {/* Tickets Module */}
          {activeModule === 'tickets' && <SupportTickets />}

          {/* Other Modules (Placeholder) */}
          {['teams', 'billing', 'settings', 'integrations', 'branding'].includes(activeModule) && (
            <NeuromorphicCard variant="embossed" className="p-8 text-center">
              <Settings className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-white text-xl font-medium mb-2">
                Módulo {menuItems.find(m => m.id === activeModule)?.name}
              </h3>
              <p className="text-slate-400">Este módulo está en desarrollo</p>
            </NeuromorphicCard>
          )}
        </div>
      </div>
    </div>
  )
}
