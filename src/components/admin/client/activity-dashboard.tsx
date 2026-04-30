'use client'

/**
 * ðŸ“Š SILEXAR PULSE - Activity Dashboard (Client)
 * Dashboard de actividad del tenant
 * 
 * @description Activity:
 * - Resumen de actividad
 * - Acciones recientes
 * - Uso del sistema
 * - Trends
 * 
 * @version 2025.1.0
 * @tier CLIENT_ADMIN
 */

import { useState, useEffect } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  Activity,
  Users,
  TrendingUp,
  Clock,
  BarChart3,
  Calendar,
  RefreshCw
} from 'lucide-react'

interface ActivityEvent {
  id: string
  user: string
  action: string
  resource: string
  timestamp: Date
  type: 'create' | 'Actualizar' | 'Eliminar' | 'view' | 'login'
}

interface DailyStats {
  date: string
  logins: number
  actions: number
  campaigns: number
}

export function ClientActivityDashboard() {
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [stats, setStats] = useState<DailyStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today')

  useEffect(() => {
    loadData()
  }, [timeframe])

  const loadData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setActivities([
      { id: 'act_001', user: 'María González', action: 'Creó campaña', resource: 'Black Friday 2025', timestamp: new Date(Date.now() - 5 * 60 * 1000), type: 'create' },
      { id: 'act_002', user: 'Carlos López', action: 'Editó configuración', resource: 'Notificaciones', timestamp: new Date(Date.now() - 15 * 60 * 1000), type: 'Actualizar' },
      { id: 'act_003', user: 'Ana Silva', action: 'Descargó reporte', resource: 'Analytics Enero', timestamp: new Date(Date.now() - 30 * 60 * 1000), type: 'view' },
      { id: 'act_004', user: 'Pedro Martínez', action: 'Inició sesión', resource: 'Sistema', timestamp: new Date(Date.now() - 45 * 60 * 1000), type: 'login' },
      { id: 'act_005', user: 'María González', action: 'Pausó campaña', resource: 'Navidad 2024', timestamp: new Date(Date.now() - 60 * 60 * 1000), type: 'Actualizar' },
      { id: 'act_006', user: 'Carlos López', action: 'Eliminó lead', resource: 'Lead duplicado', timestamp: new Date(Date.now() - 90 * 60 * 1000), type: 'Eliminar' },
      { id: 'act_007', user: 'Ana Silva', action: 'Creó equipo', resource: 'Ventas Norte', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), type: 'create' }
    ])

    setStats([
      { date: '2025-01-08', logins: 12, actions: 145, campaigns: 3 },
      { date: '2025-01-07', logins: 15, actions: 189, campaigns: 5 },
      { date: '2025-01-06', logins: 10, actions: 134, campaigns: 2 },
      { date: '2025-01-05', logins: 8, actions: 98, campaigns: 1 },
      { date: '2025-01-04', logins: 5, actions: 67, campaigns: 0 },
      { date: '2025-01-03', logins: 14, actions: 178, campaigns: 4 },
      { date: '2025-01-02', logins: 11, actions: 156, campaigns: 2 }
    ])

    setIsLoading(false)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'create': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'Actualizar': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'Eliminar': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'view': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'login': return 'bg-[#6888ff]/20 text-[#6888ff]'
      default: return 'bg-slate-500/20 text-[#9aa3b8]'
    }
  }

  const todayStats = stats[0] || { logins: 0, actions: 0, campaigns: 0 }
  const maxActions = Math.max(...stats.map(s => s.actions))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6888ff]/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando Activity Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#6888ff]" />
          Activity Dashboard
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex bg-[#dfeaff] rounded-lg p-1">
            {(['today', 'week', 'month'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-sm rounded capitalize ${timeframe === tf ? 'bg-[#6888ff] text-white' : 'text-[#9aa3b8]'}`}
              >
                {tf === 'today' ? 'Hoy' : tf === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
          <NeuButton variant="secondary" onClick={loadData}>
            <RefreshCw className="w-4 h-4" />
          </NeuButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base, textAlign: 'center' }}>
          <Users className="w-6 h-6 text-[#6888ff] mx-auto mb-2" />
          <p className="text-2xl font-bold text-[#69738c]">{todayStats.logins}</p>
          <p className="text-xs text-[#9aa3b8]">Logins Hoy</p>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base, textAlign: 'center' }}>
          <Activity className="w-6 h-6 text-[#6888ff] mx-auto mb-2" />
          <p className="text-2xl font-bold text-[#69738c]">{todayStats.actions}</p>
          <p className="text-xs text-[#9aa3b8]">Acciones Hoy</p>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base, textAlign: 'center' }}>
          <BarChart3 className="w-6 h-6 text-[#6888ff] mx-auto mb-2" />
          <p className="text-2xl font-bold text-[#69738c]">{todayStats.campaigns}</p>
          <p className="text-xs text-[#9aa3b8]">Campañas Creadas</p>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base, textAlign: 'center' }}>
          <TrendingUp className="w-6 h-6 text-[#6888ff] mx-auto mb-2" />
          <p className="text-2xl font-bold text-[#6888ff]">+12%</p>
          <p className="text-xs text-[#9aa3b8]">vs Ayer</p>
        </NeuCard>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Activity Chart */}
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
          <h4 className="text-[#69738c] font-medium mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#9aa3b8]" />
            Actividad Ášltimos 7 Días
          </h4>
          <div className="h-40 flex items-end gap-2">
            {stats.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-[#6888ff]/50 hover:bg-[#6888ff] transition-colors rounded-t"
                  style={{ height: `${(day.actions / maxActions) * 100}%` }}
                  title={`${day.actions} acciones`}
                />
                <span className="text-xs text-[#9aa3b8] mt-1">
                  {new Date(day.date).toLocaleDateString('es', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </NeuCard>

        {/* Recent Activity */}
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
          <h4 className="text-[#69738c] font-medium mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#9aa3b8]" />
            Actividad Reciente
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {activities.map(act => (
              <div key={act.id} className="flex items-center justify-between p-2 bg-[#dfeaff]/50 rounded">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded capitalize ${getTypeColor(act.type)}`}>
                    {act.type}
                  </span>
                  <div>
                    <span className="text-[#69738c] text-sm">{act.user}</span>
                    <p className="text-xs text-[#9aa3b8]">{act.action}: {act.resource}</p>
                  </div>
                </div>
                <span className="text-xs text-[#9aa3b8]">
                  {Math.round((Date.now() - act.timestamp.getTime()) / 60000)}m
                </span>
              </div>
            ))}
          </div>
        </NeuCard>
      </div>
    </div>
  )
}

export default ClientActivityDashboard