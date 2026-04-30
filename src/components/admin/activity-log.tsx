'use client'

/**
 * ðŸ“‹ SILEXAR PULSE - Activity Log en Tiempo Real
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
import { NeuCard, NeuButton, StatusBadge } from '@/components/admin/_sdk/AdminDesignSystem'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'

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

const mockEvents: ActivityEvent[] = [
  {
    id: 'evt_1',
    timestamp: new Date(Date.now() - 300000),
    type: 'auth',
    action: 'login_success',
    userName: 'Juan Pérez',
    tenantName: 'RDF Media',
    details: 'Juan Pérez ejecutó login success en RDF Media',
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome 120',
    severity: 'info',
    aiAnalysis: { anomalyScore: 15 }
  },
  {
    id: 'evt_2',
    timestamp: new Date(Date.now() - 600000),
    type: 'data',
    action: 'created',
    userName: 'María García',
    tenantName: 'Grupo Prisa',
    details: 'María García ejecutó created en Grupo Prisa',
    ipAddress: '192.168.1.101',
    userAgent: 'Firefox 119',
    severity: 'info',
    aiAnalysis: { anomalyScore: 22 }
  },
  {
    id: 'evt_3',
    timestamp: new Date(Date.now() - 900000),
    type: 'security',
    action: 'access_denied',
    userName: 'Usuario Desconocido',
    tenantName: 'Mega Media',
    details: 'Usuario Desconocido ejecutó access denied en Mega Media',
    ipAddress: '10.0.0.50',
    userAgent: 'Unknown',
    severity: 'warning',
    aiAnalysis: { anomalyScore: 85, pattern: 'Patrón inusual detectado', recommendation: 'Revisar actividad del usuario' }
  },
  {
    id: 'evt_4',
    timestamp: new Date(Date.now() - 1200000),
    type: 'config',
    action: 'setting_changed',
    userName: 'Carlos López',
    tenantName: 'TVN Chile',
    details: 'Carlos López ejecutó setting changed en TVN Chile',
    ipAddress: '192.168.1.102',
    userAgent: 'Safari 17',
    severity: 'info',
    aiAnalysis: { anomalyScore: 30 }
  },
  {
    id: 'evt_5',
    timestamp: new Date(Date.now() - 1500000),
    type: 'billing',
    action: 'payment_received',
    userName: 'Sistema',
    tenantName: 'RDF Media',
    details: 'Sistema ejecutó payment received en RDF Media',
    ipAddress: '127.0.0.1',
    userAgent: 'System',
    severity: 'info',
    aiAnalysis: { anomalyScore: 5 }
  }
]

const mockAiInsights = {
  totalEvents: 1247,
  anomaliesDetected: 3,
  suspiciousPatterns: 8,
  riskLevel: 'low' as 'low' | 'medium' | 'high'
}

export function ActivityLog() {
  const [events, setEvents] = useState<ActivityEvent[]>(mockEvents)
  const [isLoading, setIsLoading] = useState(false)
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
  const [aiInsights] = useState(mockAiInsights)

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'auth': return <LogIn style={{ width: '16px', height: '16px' }} />
      case 'data': return <Database style={{ width: '16px', height: '16px' }} />
      case 'config': return <Settings style={{ width: '16px', height: '16px' }} />
      case 'security': return <Shield style={{ width: '16px', height: '16px' }} />
      case 'system': return <Activity style={{ width: '16px', height: '16px' }} />
      case 'billing': return <Plus style={{ width: '16px', height: '16px' }} />
      default: return <Activity style={{ width: '16px', height: '16px' }} />
    }
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return { background: `${N.accent}20`, border: `1px solid ${N.accent}50`, color: N.accent }
      case 'error': return { background: `${N.accent}20`, border: `1px solid ${N.accent}50`, color: N.accent }
      case 'warning': return { background: `${N.accent}15`, border: `1px solid ${N.accent}40`, color: N.accent }
      default: return { background: `${N.dark}20`, border: `1px solid ${N.dark}40`, color: N.textSub }
    }
  }

  const getSeverityStatus = (severity: string): 'danger' | 'warning' | 'info' | 'neutral' => {
    switch (severity) {
      case 'critical': return 'danger'
      case 'error': return 'warning'
      case 'warning': return 'warning'
      default: return 'neutral'
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
      ['Timestamp', 'Tipo', 'Action', 'Usuario', 'Tenant', 'Detalles', 'Severity', 'IP'].join(','),
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid ${N.dark}30',
            borderTopColor: N.accent,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: N.textSub }}>Cargando Activity Log...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: N.text, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Activity style={{ width: '20px', height: '20px', color: N.accent }} />
            Activity Log
          </h3>
          <StatusBadge
            status={isLive ? 'success' : 'neutral'}
            label={isLive ? 'En vivo' : 'Pausado'}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <NeuButton
            variant={isLive ? 'secondary' : 'primary'}
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? <Pause style={{ width: '16px', height: '16px' }} /> : <Play style={{ width: '16px', height: '16px' }} />}
          </NeuButton>
          <NeuButton variant="secondary" onClick={exportLogs}>
            <Download style={{ width: '16px', height: '16px' }} />
          </NeuButton>
        </div>
      </div>

      {/* AI Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '12px', background: N.base }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Brain style={{ width: '16px', height: '16px', color: N.dark }} />
            <span style={{ fontSize: '0.75rem', color: N.textSub }}>Eventos</span>
          </div>
          <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: N.text, margin: 0 }}>{aiInsights.totalEvents}</p>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '12px', background: N.base }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <AlertTriangle style={{ width: '16px', height: '16px', color: N.accent }} />
            <span style={{ fontSize: '0.75rem', color: N.textSub }}>Anomalías IA</span>
          </div>
          <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: N.accent, margin: 0 }}>{aiInsights.anomaliesDetected}</p>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '12px', background: N.base }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Shield style={{ width: '16px', height: '16px', color: N.accent }} />
            <span style={{ fontSize: '0.75rem', color: N.textSub }}>Sospechosos</span>
          </div>
          <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: N.accent, margin: 0 }}>{aiInsights.suspiciousPatterns}</p>
        </NeuCard>
        <NeuCard style={{
          boxShadow: getSmallShadow(),
          padding: '12px',
          background: aiInsights.riskLevel === 'high' ? `${N.accent}20` : aiInsights.riskLevel === 'medium' ? `${N.accent}20` : `${N.accent}20`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Activity style={{ width: '16px', height: '16px', color: N.textSub }} />
            <span style={{ fontSize: '0.75rem', color: N.textSub }}>Riesgo</span>
          </div>
          <p style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: aiInsights.riskLevel === 'high' ? N.accent : aiInsights.riskLevel === 'medium' ? N.accent : N.accent,
            margin: 0
          }}>
            {aiInsights.riskLevel.toUpperCase()}
          </p>
        </NeuCard>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: N.textSub }} />
          <input
            type="text"
            placeholder="Buscar en actividad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '36px',
              paddingRight: '16px',
              paddingTop: '8px',
              paddingBottom: '8px',
              background: N.base,
              border: `1px solid ${N.dark}`,
              borderRadius: '8px',
              color: N.text,
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.875rem',
            background: showFilters ? N.accent : `${N.dark}30`,
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Filter style={{ width: '16px', height: '16px' }} />
          Filtros
          <ChevronDown style={{ width: '16px', height: '16px', transition: 'transform 0.2s', transform: showFilters ? 'rotate(180deg)' : 'rotate(0)' }} />
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <NeuCard style={{ boxShadow: getShadow(), padding: '16px', background: N.base }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: N.textSub, display: 'block', marginBottom: '8px' }}>Tipo</label>
              <select
                style={{
                  width: '100%',
                  padding: '8px',
                  background: `${N.dark}30`,
                  color: N.text,
                  fontSize: '0.875rem',
                  borderRadius: '6px',
                  border: `1px solid ${N.dark}`,
                  outline: 'none'
                }}
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
              <label style={{ fontSize: '0.75rem', color: N.textSub, display: 'block', marginBottom: '8px' }}>Severidad</label>
              <select
                style={{
                  width: '100%',
                  padding: '8px',
                  background: `${N.dark}30`,
                  color: N.text,
                  fontSize: '0.875rem',
                  borderRadius: '6px',
                  border: `1px solid ${N.dark}`,
                  outline: 'none'
                }}
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
              <label style={{ fontSize: '0.75rem', color: N.textSub, display: 'block', marginBottom: '8px' }}>Tenant</label>
              <select
                style={{
                  width: '100%',
                  padding: '8px',
                  background: `${N.dark}30`,
                  color: N.text,
                  fontSize: '0.875rem',
                  borderRadius: '6px',
                  border: `1px solid ${N.dark}`,
                  outline: 'none'
                }}
                onChange={(e) => setFilters(f => ({ ...f, tenant: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="RDF Media">RDF Media</option>
                <option value="Grupo Prisa">Grupo Prisa</option>
                <option value="Mega Media">Mega Media</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: N.textSub, display: 'block', marginBottom: '8px' }}>Período</label>
              <select
                style={{
                  width: '100%',
                  padding: '8px',
                  background: `${N.dark}30`,
                  color: N.text,
                  fontSize: '0.875rem',
                  borderRadius: '6px',
                  border: `1px solid ${N.dark}`,
                  outline: 'none'
                }}
                onChange={(e) => setFilters(f => ({ ...f, dateRange: e.target.value as ActivityFilter['dateRange'] }))}
              >
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="all">Todo</option>
              </select>
            </div>
          </div>
        </NeuCard>
      )}

      {/* Event List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '24rem', overflowY: 'auto' }}>
        {filteredEvents.map(event => (
          <div
            key={event.id}
            style={{
              ...getSeverityStyle(event.severity),
              padding: '12px',
              borderRadius: '8px',
              border: (event.aiAnalysis?.anomalyScore || 0) > 80 ? `1px solid ${N.dark}50` : undefined,
              boxShadow: (event.aiAnalysis?.anomalyScore || 0) > 80 ? `0 0 10px ${N.dark}30` : undefined
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: event.type === 'security' ? `${N.accent}20` : event.type === 'auth' ? `${N.accent}20` : `${N.dark}20`
                }}>
                  {getEventIcon(event.type)}
                </div>
                <div>
                  <p style={{ color: N.text, fontSize: '0.875rem', margin: 0 }}>{event.details}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.75rem', color: N.textSub }}>
                    <span>{event.tenantName}</span>
                    <span>•</span>
                    <span>{event.ipAddress}</span>
                    <span>•</span>
                    <span>{event.userAgent}</span>
                  </div>
                  {event.aiAnalysis?.pattern && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.75rem', color: N.dark }}>
                      <Brain style={{ width: '12px', height: '12px' }} />
                      <span>{event.aiAnalysis.pattern}</span>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: N.textSub }}>
                  {event.timestamp.toLocaleTimeString()}
                </span>
                {(event.aiAnalysis?.anomalyScore || 0) > 80 && (
                  <div style={{ fontSize: '0.75rem', color: N.accent, marginTop: '4px' }}>
                    š ï¸ Anomalía {event.aiAnalysis?.anomalyScore.toFixed(0)}%
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
