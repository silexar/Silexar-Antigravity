'use client'

/**
 * 🔔 SILEXAR PULSE - Alert Escalation Manager
 * Sistema de escalación automática de alertas
 * 
 * @description Escalation:
 * - Políticas de escalación
 * - Cadena de contactos
 * - Tiempos de respuesta
 * - On-call schedules
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
  Bell,
  Plus,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  PhoneCall,
  Mail,
  MessageSquare,
  Edit,
  Trash2
} from 'lucide-react'

interface EscalationPolicy {
  id: string
  name: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  levels: EscalationLevel[]
  status: 'active' | 'paused'
  activeIncidents: number
}

interface EscalationLevel {
  level: number
  delayMinutes: number
  contacts: Contact[]
  channels: ('email' | 'sms' | 'phone' | 'slack')[]
}

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  onCall: boolean
}

interface ActiveAlert {
  id: string
  title: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  currentLevel: number
  startedAt: Date
  lastEscalated?: Date
  acknowledgedBy?: string
  status: 'active' | 'acknowledged' | 'resolved'
}

export function AlertEscalation() {
  const [policies, setPolicies] = useState<EscalationPolicy[]>([])
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setContacts([
      { id: 'contact_001', name: 'CEO', email: 'ceo@company.com', phone: '+56912345678', role: 'CEO', onCall: true },
      { id: 'contact_002', name: 'CTO', email: 'cto@company.com', phone: '+56987654321', role: 'CTO', onCall: false },
      { id: 'contact_003', name: 'DevOps Lead', email: 'devops@company.com', phone: '+56911111111', role: 'DevOps', onCall: true },
      { id: 'contact_004', name: 'Support Lead', email: 'support@company.com', role: 'Support', onCall: true }
    ])

    setPolicies([
      {
        id: 'policy_001',
        name: 'Critical Infrastructure',
        description: 'Para incidentes críticos de infraestructura',
        severity: 'critical',
        levels: [
          { level: 1, delayMinutes: 0, contacts: [], channels: ['slack', 'email'] },
          { level: 2, delayMinutes: 5, contacts: [], channels: ['sms', 'phone'] },
          { level: 3, delayMinutes: 15, contacts: [], channels: ['phone'] }
        ],
        status: 'active',
        activeIncidents: 0
      },
      {
        id: 'policy_002',
        name: 'High Priority',
        description: 'Para incidentes de alta prioridad',
        severity: 'high',
        levels: [
          { level: 1, delayMinutes: 0, contacts: [], channels: ['slack'] },
          { level: 2, delayMinutes: 15, contacts: [], channels: ['email', 'sms'] },
          { level: 3, delayMinutes: 30, contacts: [], channels: ['phone'] }
        ],
        status: 'active',
        activeIncidents: 1
      },
      {
        id: 'policy_003',
        name: 'Medium Priority',
        description: 'Para incidentes de prioridad media',
        severity: 'medium',
        levels: [
          { level: 1, delayMinutes: 0, contacts: [], channels: ['slack'] },
          { level: 2, delayMinutes: 30, contacts: [], channels: ['email'] }
        ],
        status: 'active',
        activeIncidents: 2
      }
    ])

    setActiveAlerts([
      {
        id: 'alert_001',
        title: 'Meta API degraded performance',
        severity: 'high',
        currentLevel: 2,
        startedAt: new Date(Date.now() - 25 * 60 * 1000),
        lastEscalated: new Date(Date.now() - 10 * 60 * 1000),
        status: 'active'
      },
      {
        id: 'alert_002',
        title: 'Slow database queries',
        severity: 'medium',
        currentLevel: 1,
        startedAt: new Date(Date.now() - 10 * 60 * 1000),
        status: 'acknowledged',
        acknowledgedBy: 'DevOps Lead'
      },
      {
        id: 'alert_003',
        title: 'Email delivery delayed',
        severity: 'medium',
        currentLevel: 1,
        startedAt: new Date(Date.now() - 15 * 60 * 1000),
        status: 'active'
      }
    ])

    setIsLoading(false)
  }

  const acknowledgeAlert = (id: string) => {
    setActiveAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'acknowledged', acknowledgedBy: 'CEO' } : a
    ))
  }

  const resolveAlert = (id: string) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== id))
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600/20 text-red-300 border-red-500/50'
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="w-3 h-3" />
      case 'sms': return <MessageSquare className="w-3 h-3" />
      case 'phone': return <PhoneCall className="w-3 h-3" />
      case 'slack': return <MessageSquare className="w-3 h-3" />
      default: return <Bell className="w-3 h-3" />
    }
  }

  const onCallCount = contacts.filter(c => c.onCall).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Alert Escalation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-red-400" />
          Alert Escalation
          {activeAlerts.filter(a => a.status === 'active').length > 0 && (
            <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded animate-pulse">
              {activeAlerts.filter(a => a.status === 'active').length} Active
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <NeuromorphicButton variant="secondary" size="sm" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </NeuromorphicButton>
          <NeuromorphicButton variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            New Policy
          </NeuromorphicButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-white">{policies.length}</p>
          <p className="text-xs text-slate-400">Policies</p>
        </div>
        <div className="p-3 bg-red-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-red-400">{activeAlerts.filter(a => a.status === 'active').length}</p>
          <p className="text-xs text-slate-400">Active Alerts</p>
        </div>
        <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-yellow-400">{activeAlerts.filter(a => a.status === 'acknowledged').length}</p>
          <p className="text-xs text-slate-400">Acknowledged</p>
        </div>
        <div className="p-3 bg-green-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-400">{onCallCount}</p>
          <p className="text-xs text-slate-400">On-Call</p>
        </div>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <NeuromorphicCard variant="glow" className="p-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Alertas Activas
          </h4>
          <div className="space-y-2">
            {activeAlerts.map(alert => (
              <div key={alert.id} className={`flex items-center justify-between p-3 rounded-lg border ${getSeverityStyle(alert.severity)}`}>
                <div className="flex items-center gap-3">
                  {alert.status === 'active' && <AlertTriangle className="w-5 h-5 animate-pulse" />}
                  {alert.status === 'acknowledged' && <Clock className="w-5 h-5" />}
                  <div>
                    <span className="text-white">{alert.title}</span>
                    <p className="text-xs text-slate-400">
                      Level {alert.currentLevel} • Started {Math.round((Date.now() - alert.startedAt.getTime()) / 60000)} min ago
                      {alert.acknowledgedBy && ` • ACK by ${alert.acknowledgedBy}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alert.status === 'active' && (
                    <NeuromorphicButton variant="secondary" size="sm" onClick={() => acknowledgeAlert(alert.id)}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      ACK
                    </NeuromorphicButton>
                  )}
                  <NeuromorphicButton variant="secondary" size="sm" onClick={() => resolveAlert(alert.id)}>
                    <XCircle className="w-3 h-3 mr-1" />
                    Resolve
                  </NeuromorphicButton>
                </div>
              </div>
            ))}
          </div>
        </NeuromorphicCard>
      )}

      {/* Escalation Policies */}
      <NeuromorphicCard variant="embossed" className="p-4">
        <h4 className="text-white font-medium mb-3">Políticas de Escalación</h4>
        <div className="space-y-3">
          {policies.map(policy => (
            <div key={policy.id} className="p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${policy.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  <div>
                    <span className="text-white font-medium">{policy.name}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded ${getSeverityStyle(policy.severity)}`}>
                      {policy.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1 hover:bg-slate-700 rounded">
                    <Edit className="w-4 h-4 text-blue-400" />
                  </button>
                  <button className="p-1 hover:bg-slate-700 rounded">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-3">{policy.description}</p>
              <div className="flex items-center gap-4">
                {policy.levels.map(level => (
                  <div key={level.level} className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">L{level.level}:</span>
                    <span className="text-white">{level.delayMinutes}m</span>
                    <div className="flex gap-1">
                      {level.channels.map(ch => (
                        <span key={ch} className="text-slate-400">{getChannelIcon(ch)}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </NeuromorphicCard>

      {/* On-Call Contacts */}
      <NeuromorphicCard variant="embossed" className="p-4">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          Contactos On-Call
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {contacts.map(contact => (
            <div key={contact.id} className={`flex items-center justify-between p-3 rounded-lg ${contact.onCall ? 'bg-green-500/10' : 'bg-slate-800/50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${contact.onCall ? 'bg-green-500' : 'bg-slate-600'}`}>
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-white text-sm">{contact.name}</span>
                  <p className="text-xs text-slate-500">{contact.role}</p>
                </div>
              </div>
              {contact.onCall && (
                <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">ON-CALL</span>
              )}
            </div>
          ))}
        </div>
      </NeuromorphicCard>
    </div>
  )
}

export default AlertEscalation
