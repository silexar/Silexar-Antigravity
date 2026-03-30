'use client'

/**
 * 📋 SILEXAR PULSE - Activity Log en Tiempo Real
 * Registro de actividad con análisis IA
 * 
 * @description Log de actividad empresarial con:
 * - Streaming de eventos en tiempo real
 * - Análisis de patrones con IA
 * - Detección de anomalías automática
 * - Filtros avanzados y exportación
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 * @security MILITARY_GRADE
 */

import { useState, useEffect, useCallback } from 'react'
import { 
  NeuromorphicButton,
  NeuromorphicStatus
} from '@/components/ui/neuromorphic'
import {
  Activity,
  Search,
  Filter,
  Download,
  Shield,
  Database,
  Settings,
  LogIn,
  Plus,
  AlertTriangle,
  Brain,
  Pause,
  Play,
  ChevronDown
} from 'lucide-react'

interface ActivityEvent {
  id: string
  timestamp: Date
  type: 'auth' | 'data' | 'config' | 'security' | 'system' | 'billing'
  action: string
  userId?: string
  userName?: string
  tenantId?: string
  tenantName?: string
  resourceType?: string
  resourceId?: string
  details: string
  ipAddress?: string
  userAgent?: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  aiAnalysis?: {
    anomalyScore: number
    pattern?: string
    recommendation?: string
  }
}

interface ActivityFilter {
  type: string[]
  severity: string[]
  tenant: string
  user: string
  dateRange: 'today' | 'week' | 'month' | 'all'
}

export function ActivityLog() {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLive, setIsLive] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<ActivityFilter>({
    type: [],
    severity: [],
    tenant: '',
    user: '',
    dateRange: 'today'
  })
  const [aiInsights, setAiInsights] = useState({
    totalEvents: 0,
    anomaliesDetected: 0,
    suspiciousPatterns: 0,
    riskLevel: 'low' as 'low' | 'medium' | 'high'
  })

  // Generate demo events
  const generateEvent = useCallback((): ActivityEvent => {
    const types = ['auth', 'data', 'config', 'security', 'system', 'billing'] as const
    const actions = {
      auth: ['login_success', 'login_failed', 'logout', 'password_changed', 'mfa_enabled'],
      data: ['created', 'updated', 'deleted', 'exported', 'imported'],
      config: ['setting_changed', 'module_toggled', 'ai_mode_changed', 'plan_upgraded'],
      security: ['access_denied', 'suspicious_activity', 'ip_blocked', 'session_terminated'],
      system: ['backup_completed', 'maintenance_started', 'cache_cleared', 'api_error'],
      billing: ['invoice_created', 'payment_received', 'subscription_renewed', 'refund_processed']
    }
    const users = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'CEO Silexar']
    const tenants = ['RDF Media', 'Grupo Prisa', 'Mega Media', 'TVN Chile', 'Sistema']
    const severities = ['info', 'warning', 'error', 'critical'] as const

    const type = types[Math.floor(Math.random() * types.length)]
    const action = actions[type][Math.floor(Math.random() * actions[type].length)]
    const severity = severities[Math.floor(Math.random() * 10) < 7 ? 0 : Math.floor(Math.random() * 4)]
    const user = users[Math.floor(Math.random() * users.length)]
    const tenant = tenants[Math.floor(Math.random() * tenants.length)]

    const anomalyScore = Math.random() * 100
    const hasAnomaly = anomalyScore > 80

    return {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      action,
      userId: `usr_${Math.random().toString(36).substr(2, 6)}`,
      userName: user,
      tenantId: `tnt_${Math.random().toString(36).substr(2, 6)}`,
      tenantName: tenant,
      resourceType: type === 'data' ? 'campaign' : undefined,
      resourceId: type === 'data' ? `res_${Math.random().toString(36).substr(2, 8)}` : undefined,
      details: `${user} ejecutó ${action.replace('_', ' ')} en ${tenant}`,
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: ['Chrome 120', 'Firefox 119', 'Safari 17', 'Edge 120'][Math.floor(Math.random() * 4)],
      severity,
      aiAnalysis: {
        anomalyScore,
        pattern: hasAnomaly ? 'Patrón inusual detectado' : undefined,
        recommendation: hasAnomaly ? 'Revisar actividad del usuario' : undefined
      }
    }
  }, [])

  // Load initial events
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const initialEvents: ActivityEvent[] = Array.from({ length: 20 }, () => {
        const event = generateEvent()
        event.timestamp = new Date(Date.now() - Math.random() * 3600000 * 24)
        return event
      }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      
      setEvents(initialEvents)
      updateAiInsights(initialEvents)
      setIsLoading(false)
    }
    
    loadEvents()
  }, [generateEvent])

  // Live streaming
  useEffect(() => {
    if (!isLive) return
    
    const interval = setInterval(() => {
      const newEvent = generateEvent()
      setEvents(prev => {
        const updated = [newEvent, ...prev].slice(0, 100)
        updateAiInsights(updated)
        return updated
      })
    }, 5000 + Math.random() * 5000)
    
    return () => clearInterval(interval)
  }, [isLive, generateEvent])

  const updateAiInsights = (eventList: ActivityEvent[]) => {
    const anomalies = eventList.filter(e => (e.aiAnalysis?.anomalyScore || 0) > 80).length
    const suspicious = eventList.filter(e => e.severity === 'warning' || e.severity === 'error').length
    
    setAiInsights({
      totalEvents: eventList.length,
      anomaliesDetected: anomalies,
      suspiciousPatterns: suspicious,
      riskLevel: anomalies > 5 ? 'high' : anomalies > 2 ? 'medium' : 'low'
    })
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'auth': return <LogIn className="w-4 h-4" />
      case 'data': return <Database className="w-4 h-4" />
      case 'config': return <Settings className="w-4 h-4" />
      case 'security': return <Shield className="w-4 h-4" />
      case 'system': return <Activity className="w-4 h-4" />
      case 'billing': return <Plus className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'error': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const filteredEvents = events.filter(event => {
    if (searchTerm && !event.details.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (filters.type.length && !filters.type.includes(event.type)) return false
    if (filters.severity.length && !filters.severity.includes(event.severity)) return false
    if (filters.tenant && event.tenantName !== filters.tenant) return false
    return true
  })

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'Type', 'Action', 'User', 'Tenant', 'Details', 'Severity', 'IP'].join(','),
      ...filteredEvents.map(e => [
        e.timestamp.toISOString(),
        e.type,
        e.action,
        e.userName || '',
        e.tenantName || '',
        `"${e.details}"`,
        e.severity,
        e.ipAddress || ''
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `activity_log_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Activity Log...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Activity Log
          </h3>
          <NeuromorphicStatus 
            status={isLive ? 'online' : 'offline'} 
            pulse={isLive}
          />
          <span className="text-xs text-slate-400">
            {isLive ? 'En vivo' : 'Pausado'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <NeuromorphicButton
            variant={isLive ? 'danger' : 'success'}
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </NeuromorphicButton>
          <NeuromorphicButton variant="secondary" size="sm" onClick={exportLogs}>
            <Download className="w-4 h-4" />
          </NeuromorphicButton>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-400">Eventos</span>
          </div>
          <p className="text-xl font-bold text-white">{aiInsights.totalEvents}</p>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-slate-400">Anomalías IA</span>
          </div>
          <p className="text-xl font-bold text-yellow-400">{aiInsights.anomaliesDetected}</p>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-slate-400">Sospechosos</span>
          </div>
          <p className="text-xl font-bold text-orange-400">{aiInsights.suspiciousPatterns}</p>
        </div>
        <div className={`p-3 rounded-lg ${
          aiInsights.riskLevel === 'high' ? 'bg-red-500/20' :
          aiInsights.riskLevel === 'medium' ? 'bg-yellow-500/20' : 'bg-green-500/20'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4" />
            <span className="text-xs text-slate-400">Riesgo</span>
          </div>
          <p className={`text-xl font-bold ${
            aiInsights.riskLevel === 'high' ? 'text-red-400' :
            aiInsights.riskLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {aiInsights.riskLevel.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar en actividad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
            showFilters ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 bg-slate-800/50 rounded-lg grid grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-2">Tipo</label>
            <select 
              className="w-full bg-slate-700 text-white text-sm rounded px-2 py-1"
              onChange={(e) => setFilters(f => ({ ...f, type: e.target.value ? [e.target.value] : [] }))}
            >
              <option value="">Todos</option>
              <option value="auth">Autenticación</option>
              <option value="data">Datos</option>
              <option value="config">Configuración</option>
              <option value="security">Seguridad</option>
              <option value="system">Sistema</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-2">Severidad</label>
            <select 
              className="w-full bg-slate-700 text-white text-sm rounded px-2 py-1"
              onChange={(e) => setFilters(f => ({ ...f, severity: e.target.value ? [e.target.value] : [] }))}
            >
              <option value="">Todas</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Crítico</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-2">Tenant</label>
            <select 
              className="w-full bg-slate-700 text-white text-sm rounded px-2 py-1"
              onChange={(e) => setFilters(f => ({ ...f, tenant: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="RDF Media">RDF Media</option>
              <option value="Grupo Prisa">Grupo Prisa</option>
              <option value="Mega Media">Mega Media</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-2">Período</label>
            <select 
              className="w-full bg-slate-700 text-white text-sm rounded px-2 py-1"
              onChange={(e) => setFilters(f => ({ ...f, dateRange: e.target.value as ActivityFilter['dateRange'] }))}
            >
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="all">Todo</option>
            </select>
          </div>
        </div>
      )}

      {/* Event List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredEvents.map(event => (
          <div 
            key={event.id}
            className={`p-3 rounded-lg border ${getSeverityStyle(event.severity)} ${
              (event.aiAnalysis?.anomalyScore || 0) > 80 ? 'ring-1 ring-purple-500/50' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded ${
                  event.type === 'security' ? 'bg-red-500/20' :
                  event.type === 'auth' ? 'bg-blue-500/20' :
                  event.type === 'data' ? 'bg-green-500/20' : 'bg-slate-500/20'
                }`}>
                  {getEventIcon(event.type)}
                </div>
                <div>
                  <p className="text-white text-sm">{event.details}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span>{event.tenantName}</span>
                    <span>•</span>
                    <span>{event.ipAddress}</span>
                    <span>•</span>
                    <span>{event.userAgent}</span>
                  </div>
                  {event.aiAnalysis?.pattern && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-purple-400">
                      <Brain className="w-3 h-3" />
                      <span>{event.aiAnalysis.pattern}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">
                  {event.timestamp.toLocaleTimeString()}
                </span>
                {(event.aiAnalysis?.anomalyScore || 0) > 80 && (
                  <div className="text-xs text-purple-400 mt-1">
                    ⚠️ Anomalía {event.aiAnalysis?.anomalyScore.toFixed(0)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActivityLog
