'use client'

/**
 * ðŸ“± SILEXAR PULSE - CEO Mobile Command
 * Métricas críticas para móvil
 * 
 * @description Comando móvil del CEO:
 * - KPIs críticos
 * - Alertas prioritarias
 * - Aprobaciones rápidas
 * - Briefing ejecutivo
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 * @security MILITARY_GRADE
 */

import { useState, useEffect } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  Smartphone,
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Zap,
  Activity
} from 'lucide-react'

interface MobileKPI {
  label: string
  value: string
  change: number
  trend: 'up' | 'down' | 'stable'
  priority: 'high' | 'normal'
}

interface PendingApproval {
  id: string
  type: 'expense' | 'access' | 'deployment' | 'contract'
  title: string
  requester: string
  amount?: number
  urgency: 'high' | 'medium' | 'low'
  createdAt: Date
}

interface CriticalAlert {
  id: string
  type: 'security' | 'revenue' | 'system' | 'customer'
  title: string
  description: string
  timestamp: Date
  acknowledged: boolean
}

export function CEOMobileCommand() {
  const [kpis, setKpis] = useState<MobileKPI[]>([])
  const [approvals, setApprovals] = useState<PendingApproval[]>([])
  const [alerts, setAlerts] = useState<CriticalAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMobileData()
  }, [])

  const loadMobileData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setKpis([
      { label: 'Revenue Hoy', value: '$28.5K', change: 12.3, trend: 'up', priority: 'high' },
      { label: 'MRR', value: '$847K', change: 8.5, trend: 'up', priority: 'high' },
      { label: 'Usuarios Activos', value: '12,456', change: 5.2, trend: 'up', priority: 'normal' },
      { label: 'Uptime', value: '99.97%', change: 0, trend: 'stable', priority: 'normal' },
      { label: 'NPS', value: '72', change: -2, trend: 'down', priority: 'normal' },
      { label: 'Tickets Abiertos', value: '23', change: 15, trend: 'up', priority: 'high' }
    ])

    setApprovals([
      {
        id: 'apr_001',
        type: 'expense',
        title: 'AWS Infrastructure Upgrade',
        requester: 'CTO',
        amount: 15000,
        urgency: 'high',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'apr_002',
        type: 'access',
        title: 'Acceso Admin para nuevo DevOps',
        requester: 'VP Engineering',
        urgency: 'medium',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: 'apr_003',
        type: 'contract',
        title: 'Renovación Enterprise - RDF Media',
        requester: 'VP Sales',
        amount: 54000,
        urgency: 'high',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        id: 'apr_004',
        type: 'deployment',
        title: 'Release v2.5.0 a Producción',
        requester: 'CTO',
        urgency: 'medium',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ])

    setAlerts([
      {
        id: 'alt_001',
        type: 'revenue',
        title: 'Cliente Enterprise en riesgo de churn',
        description: 'Mega Media no ha usado la plataforma en 14 días',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        acknowledged: false
      },
      {
        id: 'alt_002',
        type: 'security',
        title: 'Intento de acceso sospechoso',
        description: '147 intentos fallidos desde IP en China',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        acknowledged: true
      }
    ])

    setIsLoading(false)
  }

  const handleApproval = (id: string, approved: boolean) => {

    setApprovals(prev => prev.filter(a => a.id !== id))
  }

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'expense': return <DollarSign className="w-4 h-4 text-[#6888ff]" />
      case 'access': return <Shield className="w-4 h-4 text-[#6888ff]" />
      case 'deployment': return <Zap className="w-4 h-4 text-[#6888ff]" />
      case 'contract': return <Users className="w-4 h-4 text-[#6888ff]" />
      default: return <Activity className="w-4 h-4 text-[#9aa3b8]" />
    }
  }

  const getUrgencyStyle = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-[#6888ff]/20 text-[#6888ff] border-[#6888ff]/30'
      case 'medium': return 'bg-[#6888ff]/20 text-[#6888ff] border-yellow-500/30'
      case 'low': return 'bg-[#6888ff]/20 text-[#6888ff] border-[#6888ff]/30'
      default: return 'bg-slate-500/20 text-[#9aa3b8]'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6888ff]/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando Mobile Command...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-[#6888ff]" />
          CEO Mobile Command
          <span className="text-xs px-2 py-0.5 bg-[#6888ff]/20 text-[#6888ff] rounded">LIVE</span>
        </h3>
        <span className="text-xs text-[#9aa3b8]">
          Ášltima actualización: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* Critical Alerts */}
      {alerts.filter(a => !a.acknowledged).length > 0 && (
        <div className="space-y-2">
          {alerts.filter(a => !a.acknowledged).map(alert => (
            <div key={alert.id} className="p-4 bg-[#6888ff]/10 border border-[#6888ff]/30 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#6888ff]" />
                  <div>
                    <span className="text-[#69738c] font-medium">{alert.title}</span>
                    <p className="text-sm text-[#9aa3b8]">{alert.description}</p>
                  </div>
                </div>
                <NeuButton variant="secondary" onClick={() => acknowledgeAlert(alert.id)}>
                  <CheckCircle className="w-4 h-4" />
                </NeuButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPIs Grid */}
      <div className="grid grid-cols-3 gap-3">
        {kpis.map((kpi, i) => (
          <NeuCard
            key={kpi.label}
            style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}
            className={`p-4 ${kpi.priority === 'high' ? 'ring-1 ring-yellow-500/30' : ''}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#9aa3b8]">{kpi.label}</span>
              {kpi.trend === 'up' && <TrendingUp className="w-4 h-4 text-[#6888ff]" />}
              {kpi.trend === 'down' && <TrendingUp className="w-4 h-4 text-[#6888ff] rotate-180" />}
            </div>
            <p className="text-xl font-bold text-[#69738c]">{kpi.value}</p>
            <span className={`text-xs ${kpi.change >= 0 ? 'text-[#6888ff]' : 'text-[#6888ff]'}`}>
              {kpi.change >= 0 ? '+' : ''}{kpi.change}%
            </span>
          </NeuCard>
        ))}
      </div>

      {/* Pending Approvals */}
      <NeuCard style={{ boxShadow: getFloatingShadow(), padding: '1rem', background: N.base }}>
        <h4 className="text-[#69738c] font-medium mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#6888ff]" />
          Aprobaciones Pendientes ({approvals.length})
        </h4>

        <div className="space-y-3">
          {approvals.map(approval => (
            <div key={approval.id} className="p-4 bg-[#dfeaff]/50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(approval.type)}
                  <div>
                    <span className="text-[#69738c] font-medium">{approval.title}</span>
                    <p className="text-xs text-[#9aa3b8]">Solicitado por: {approval.requester}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded border ${getUrgencyStyle(approval.urgency)}`}>
                  {approval.urgency}
                </span>
              </div>

              {approval.amount && (
                <p className="text-lg font-bold text-[#6888ff] mb-2">
                  ${approval.amount.toLocaleString()}
                </p>
              )}

              <div className="flex items-center gap-2">
                <NeuButton
                  variant="primary"
                  onClick={() => handleApproval(approval.id, true)}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Aprobar
                </NeuButton>
                <NeuButton
                  variant="secondary"
                  onClick={() => handleApproval(approval.id, false)}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Rechazar
                </NeuButton>
              </div>
            </div>
          ))}
        </div>
      </NeuCard>

      {/* Quick Status Indicators */}
      <div className="grid grid-cols-4 gap-2">
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <div className="w-3 h-3 bg-[#6888ff] rounded-full mx-auto mb-1 animate-pulse" />
          <p className="text-xs text-[#9aa3b8]">Sistemas</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <div className="w-3 h-3 bg-[#6888ff] rounded-full mx-auto mb-1" />
          <p className="text-xs text-[#9aa3b8]">Database</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <div className="w-3 h-3 bg-[#6888ff] rounded-full mx-auto mb-1" />
          <p className="text-xs text-[#9aa3b8]">APIs</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <div className="w-3 h-3 bg-[#6888ff] rounded-full mx-auto mb-1" />
          <p className="text-xs text-[#9aa3b8]">Security</p>
        </div>
      </div>
    </div>
  )
}

export default CEOMobileCommand