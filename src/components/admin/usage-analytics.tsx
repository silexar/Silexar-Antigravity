'use client'

/**
 * 📊 SILEXAR PULSE - Usage Analytics
 * Analytics de uso del sistema
 * 
 * @description Usage Analytics:
 * - Uso por feature
 * - Usuarios activos
 * - Tendencias
 * - Engagement metrics
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 * @security MILITARY_GRADE
 */

import { useState, useEffect } from 'react'
import { 
  NeuromorphicCard, 
  NeuromorphicButton 
} from '@/components/ui/neuromorphic'
import {
  BarChart3,
  Users,
  Activity,
  Clock,
  TrendingUp,
  Calendar,
  RefreshCw,
  Download
} from 'lucide-react'

interface UsageMetric {
  name: string
  value: number
  change: number
  unit: string
  period: '24h' | '7d' | '30d'
}

interface FeatureUsage {
  feature: string
  dailyActive: number
  weeklyActive: number
  monthlyActive: number
  trend: 'up' | 'down' | 'stable'
  engagement: number
}

interface UserActivity {
  hour: number
  sessions: number
  actions: number
}

interface TopUser {
  name: string
  organization: string
  sessions: number
  actions: number
  lastActive: Date
}

export function UsageAnalytics() {
  const [metrics, setMetrics] = useState<UsageMetric[]>([])
  const [features, setFeatures] = useState<FeatureUsage[]>([])
  const [activity, setActivity] = useState<UserActivity[]>([])
  const [topUsers, setTopUsers] = useState<TopUser[]>([])
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('7d')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period])

  const loadData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setMetrics([
      { name: 'Active Users', value: 1245, change: 12.5, unit: 'users', period },
      { name: 'Sessions', value: 8560, change: 8.2, unit: 'sessions', period },
      { name: 'Actions', value: 156000, change: 15.8, unit: 'actions', period },
      { name: 'Avg. Session', value: 12.5, change: -2.3, unit: 'min', period },
      { name: 'Page Views', value: 425000, change: 22.1, unit: 'views', period },
      { name: 'API Calls', value: 2.5, change: 18.5, unit: 'M calls', period }
    ])

    setFeatures([
      { feature: 'Campaign Dashboard', dailyActive: 850, weeklyActive: 1120, monthlyActive: 1245, trend: 'up', engagement: 92 },
      { feature: 'Analytics', dailyActive: 620, weeklyActive: 890, monthlyActive: 1050, trend: 'up', engagement: 85 },
      { feature: 'Reports', dailyActive: 340, weeklyActive: 680, monthlyActive: 920, trend: 'stable', engagement: 78 },
      { feature: 'User Management', dailyActive: 120, weeklyActive: 280, monthlyActive: 450, trend: 'stable', engagement: 65 },
      { feature: 'Settings', dailyActive: 85, weeklyActive: 210, monthlyActive: 380, trend: 'down', engagement: 45 },
      { feature: 'Integrations', dailyActive: 180, weeklyActive: 420, monthlyActive: 650, trend: 'up', engagement: 72 }
    ])

    setActivity([
      { hour: 0, sessions: 45, actions: 890 },
      { hour: 1, sessions: 32, actions: 640 },
      { hour: 2, sessions: 28, actions: 560 },
      { hour: 3, sessions: 25, actions: 500 },
      { hour: 4, sessions: 30, actions: 600 },
      { hour: 5, sessions: 42, actions: 840 },
      { hour: 6, sessions: 85, actions: 1700 },
      { hour: 7, sessions: 145, actions: 2900 },
      { hour: 8, sessions: 280, actions: 5600 },
      { hour: 9, sessions: 420, actions: 8400 },
      { hour: 10, sessions: 480, actions: 9600 },
      { hour: 11, sessions: 520, actions: 10400 },
      { hour: 12, sessions: 380, actions: 7600 },
      { hour: 13, sessions: 450, actions: 9000 },
      { hour: 14, sessions: 510, actions: 10200 },
      { hour: 15, sessions: 490, actions: 9800 },
      { hour: 16, sessions: 420, actions: 8400 },
      { hour: 17, sessions: 350, actions: 7000 },
      { hour: 18, sessions: 280, actions: 5600 },
      { hour: 19, sessions: 220, actions: 4400 },
      { hour: 20, sessions: 180, actions: 3600 },
      { hour: 21, sessions: 140, actions: 2800 },
      { hour: 22, sessions: 95, actions: 1900 },
      { hour: 23, sessions: 65, actions: 1300 }
    ])

    setTopUsers([
      { name: 'María García', organization: 'RDF Media', sessions: 245, actions: 4890, lastActive: new Date() },
      { name: 'Carlos López', organization: 'Grupo Prisa', sessions: 198, actions: 3960, lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { name: 'Ana Martínez', organization: 'RDF Media', sessions: 167, actions: 3340, lastActive: new Date(Date.now() - 30 * 60 * 1000) },
      { name: 'Pedro Sánchez', organization: 'MediaSet', sessions: 145, actions: 2900, lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000) },
      { name: 'Laura Rodríguez', organization: 'Telefonica', sessions: 132, actions: 2640, lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000) }
    ])

    setIsLoading(false)
  }

  const exportReport = () => {
    alert('Exporting usage report...')
  }

  const maxSessions = Math.max(...activity.map(a => a.sessions))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Usage Analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          Usage Analytics
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800 rounded-lg p-1">
            {(['24h', '7d', '30d'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-sm rounded ${period === p ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <NeuromorphicButton variant="secondary" size="sm" onClick={loadData}>
            <RefreshCw className="w-4 h-4" />
          </NeuromorphicButton>
          <NeuromorphicButton variant="secondary" size="sm" onClick={exportReport}>
            <Download className="w-4 h-4" />
          </NeuromorphicButton>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-6 gap-3">
        {metrics.map(metric => (
          <NeuromorphicCard key={metric.name} variant="embossed" className="p-3 text-center">
            <p className="text-xl font-bold text-white">{metric.value.toLocaleString()}{metric.unit.includes('M') ? '' : ''}</p>
            <p className="text-xs text-slate-500">{metric.name}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <TrendingUp className={`w-3 h-3 ${metric.change >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              <span className={`text-xs ${metric.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metric.change >= 0 ? '+' : ''}{metric.change}%
              </span>
            </div>
          </NeuromorphicCard>
        ))}
      </div>

      {/* Activity Chart */}
      <NeuromorphicCard variant="embossed" className="p-4">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          Activity by Hour (Today)
        </h4>
        <div className="h-32 flex items-end gap-1">
          {activity.map(item => (
            <div key={item.hour} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-cyan-500/50 hover:bg-cyan-500 transition-colors rounded-t"
                style={{ height: `${(item.sessions / maxSessions) * 100}%` }}
                title={`${item.hour}:00 - ${item.sessions} sessions`}
              />
              {item.hour % 4 === 0 && (
                <span className="text-xs text-slate-500 mt-1">{item.hour}h</span>
              )}
            </div>
          ))}
        </div>
      </NeuromorphicCard>

      <div className="grid grid-cols-2 gap-4">
        {/* Feature Usage */}
        <NeuromorphicCard variant="embossed" className="p-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" />
            Feature Usage
          </h4>
          <div className="space-y-3">
            {features.map(feature => (
              <div key={feature.feature}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm">{feature.feature}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">DAU: {feature.dailyActive}</span>
                    <span className={`text-xs ${
                      feature.trend === 'up' ? 'text-green-400' : 
                      feature.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {feature.trend === 'up' ? '↑' : feature.trend === 'down' ? '↓' : '→'}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{ width: `${feature.engagement}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </NeuromorphicCard>

        {/* Top Users */}
        <NeuromorphicCard variant="embossed" className="p-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            Top Users ({period})
          </h4>
          <div className="space-y-2">
            {topUsers.map((user, i) => (
              <div key={user.name} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-slate-500">#{i + 1}</span>
                  <div>
                    <span className="text-white text-sm">{user.name}</span>
                    <p className="text-xs text-slate-500">{user.organization}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-cyan-400 text-sm">{user.sessions} sessions</span>
                  <p className="text-xs text-slate-500">{user.actions.toLocaleString()} actions</p>
                </div>
              </div>
            ))}
          </div>
        </NeuromorphicCard>
      </div>

      {/* Calendar Heatmap */}
      <NeuromorphicCard variant="embossed" className="p-4">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          Activity Heatmap (Last 4 weeks)
        </h4>
        <div className="grid grid-cols-7 gap-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <span key={day} className="text-center text-xs text-slate-500">{day}</span>
          ))}
          {Array.from({ length: 28 }).map((_, i) => {
            const intensity = Math.random()
            return (
              <div
                key={i}
                className={`h-6 rounded ${
                  intensity > 0.8 ? 'bg-cyan-400' :
                  intensity > 0.6 ? 'bg-cyan-500/70' :
                  intensity > 0.4 ? 'bg-cyan-600/50' :
                  intensity > 0.2 ? 'bg-cyan-700/30' :
                  'bg-slate-800'
                }`}
                title={`Day ${i + 1}`}
              />
            )
          })}
        </div>
      </NeuromorphicCard>
    </div>
  )
}

export default UsageAnalytics
