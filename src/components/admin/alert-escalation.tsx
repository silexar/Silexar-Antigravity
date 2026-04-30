'use client'

/**
 * ðŸ”” SILEXAR PULSE - Alert Escalation Manager
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

import { useState } from 'react'
import { NeuCard, NeuButton, StatusBadge } from '@/components/admin/_sdk/AdminDesignSystem'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
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

const mockPolicies: EscalationPolicy[] = [
  {
    id: 'pol_001',
    name: 'Seguridad Crítica',
    description: 'Alertas de seguridad que requieren atención inmediata',
    severity: 'critical',
    levels: [
      { level: 1, delayMinutes: 0, contacts: [], channels: ['sms', 'phone'] },
      { level: 2, delayMinutes: 5, contacts: [], channels: ['phone'] }
    ],
    status: 'active',
    activeIncidents: 2
  },
  {
    id: 'pol_002',
    name: 'Rendimiento',
    description: 'Alertas de performance y disponibilidad',
    severity: 'high',
    levels: [
      { level: 1, delayMinutes: 15, contacts: [], channels: ['slack'] },
      { level: 2, delayMinutes: 30, contacts: [], channels: ['email'] }
    ],
    status: 'active',
    activeIncidents: 0
  },
  {
    id: 'pol_003',
    name: 'Licencias',
    description: 'Vencimientos y renovación de licencias',
    severity: 'medium',
    levels: [
      { level: 1, delayMinutes: 1440, contacts: [], channels: ['email'] }
    ],
    status: 'active',
    activeIncidents: 1
  }
]

const mockContacts: Contact[] = [
  { id: 'cnt_001', name: 'Carlos CEO', email: 'ceo@silexar.com', phone: '+56912345678', role: 'CTO', onCall: true },
  { id: 'cnt_002', name: 'María Garcia', email: 'maria@silexar.com', role: 'DevOps Lead', onCall: false },
  { id: 'cnt_003', name: 'Juan Pérez', email: 'juan@silexar.com', phone: '+56987654321', role: 'Security Lead', onCall: true }
]

const mockActiveAlerts: ActiveAlert[] = [
  {
    id: 'alert_001',
    title: 'Acceso no autorizado detectado',
    severity: 'critical',
    currentLevel: 2,
    startedAt: new Date(Date.now() - 10 * 60 * 1000),
    lastEscalated: new Date(Date.now() - 5 * 60 * 1000),
    status: 'active'
  },
  {
    id: 'alert_002',
    title: 'CPU al 95% - Servidor Principal',
    severity: 'high',
    currentLevel: 1,
    startedAt: new Date(Date.now() - 30 * 60 * 1000),
    status: 'acknowledged',
    acknowledgedBy: 'María Garcia'
  }
]

export function AlertEscalation() {
  const [policies] = useState<EscalationPolicy[]>(mockPolicies)
  const [activeAlerts] = useState<ActiveAlert[]>(mockActiveAlerts)
  const [contacts] = useState<Contact[]>(mockContacts)
  const [isLoading] = useState(false)

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return { color: N.accent, bg: `${N.accent}15` }
      case 'high': return { color: N.accent, bg: `${N.accent}15` }
      case 'medium': return { color: N.accent, bg: `${N.accent}15` }
      default: return { color: N.textSub, bg: `${N.dark}15` }
    }
  }

  const getSeverityBadge = (severity: string): 'danger' | 'warning' | 'info' | 'neutral' => {
    switch (severity) {
      case 'critical': return 'danger'
      case 'high': return 'warning'
      case 'medium': return 'info'
      default: return 'neutral'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    return `${Math.floor(hours / 24)}d`
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
          <p style={{ color: N.textSub }}>Cargando Escalamiento...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ color: N.text, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Bell style={{ color: N.accent, width: 24, height: 24 }} />
            Alert Escalation
          </h2>
          <p style={{ color: N.textSub, fontSize: '0.875rem' }}>Gestión de escalamiento automático</p>
        </div>
        <NeuButton variant="primary">
          <Plus style={{ width: 16, height: 16, marginRight: 4 }} />
          Nueva Política
        </NeuButton>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '16px', background: N.base }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: N.accent, fontSize: '2rem', fontWeight: 700, margin: 0 }}>
              {activeAlerts.filter(a => a.severity === 'critical').length}
            </p>
            <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Críticas Activas</p>
          </div>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '16px', background: N.base }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: N.accent, fontSize: '2rem', fontWeight: 700, margin: 0 }}>
              {activeAlerts.filter(a => a.status === 'active').length}
            </p>
            <p style={{ color: N.textSub, fontSize: '0.75rem' }}>En Escalamiento</p>
          </div>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '16px', background: N.base }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: N.text, fontSize: '2rem', fontWeight: 700, margin: 0 }}>
              {contacts.filter(c => c.onCall).length}
            </p>
            <p style={{ color: N.textSub, fontSize: '0.75rem' }}>On-Call</p>
          </div>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '16px', background: N.base }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: N.accent, fontSize: '2rem', fontWeight: 700, margin: 0 }}>
              {policies.filter(p => p.status === 'active').length}
            </p>
            <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Políticas Activas</p>
          </div>
        </NeuCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        {/* Active Alerts */}
        <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
          <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
            Alertas Activas
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activeAlerts.map(alert => (
              <div
                key={alert.id}
                style={{
                  padding: '12px',
                  background: getSeverityStyle(alert.severity).bg,
                  border: `1px solid ${getSeverityStyle(alert.severity).color}30`,
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <p style={{ color: N.text, fontWeight: 500, margin: 0 }}>{alert.title}</p>
                    <StatusBadge status={getSeverityBadge(alert.severity)} label={alert.severity} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: N.textSub }}>
                    {formatTimeAgo(alert.startedAt)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: N.textSub }}>
                    <span>Nivel {alert.currentLevel}</span>
                    {alert.acknowledgedBy && (
                      <span>Ack: {alert.acknowledgedBy}</span>
                    )}
                  </div>
                  {alert.status === 'active' && (
                    <NeuButton variant="secondary">
                      <CheckCircle style={{ width: 12, height: 12 }} />
                      Ack
                    </NeuButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        </NeuCard>

        {/* Policies */}
        <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
          <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
            Políticas de Escalamiento
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {policies.map(policy => (
              <div
                key={policy.id}
                style={{
                  padding: '12px',
                  background: `${N.dark}15`,
                  borderRadius: '8px',
                  border: `1px solid ${N.dark}30`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <p style={{ color: N.text, fontWeight: 500, margin: 0 }}>{policy.name}</p>
                    <p style={{ color: N.textSub, fontSize: '0.75rem', marginTop: '4px' }}>{policy.description}</p>
                  </div>
                  <StatusBadge
                    status={policy.status === 'active' ? 'success' : 'neutral'}
                    label={policy.status}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem', color: N.textSub }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock style={{ width: 12, height: 12 }} />
                      {policy.levels[0]?.delayMinutes || 0}m delay
                    </span>
                    <span>{policy.levels.length} niveles</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <NeuButton variant="ghost">
                      <Edit style={{ width: 12, height: 12 }} />
                    </NeuButton>
                    <NeuButton variant="ghost">
                      <Trash2 style={{ width: 12, height: 12 }} />
                    </NeuButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </NeuCard>
      </div>

      {/* Contacts */}
      <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600 }}>
            Contactos de Escalamiento
          </h3>
          <NeuButton variant="secondary">
            <Plus style={{ width: 12, height: 12, marginRight: 4 }} />
            Agregar
          </NeuButton>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {contacts.map(contact => (
            <div
              key={contact.id}
              style={{
                padding: '12px',
                background: contact.onCall ? `${N.accent}15` : `${N.dark}15`,
                borderRadius: '8px',
                border: `1px solid ${contact.onCall ? N.accent : N.dark}30`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: N.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User style={{ width: 16, height: 16, color: '#fff' }} />
                </div>
                <div>
                  <p style={{ color: N.text, fontWeight: 500, margin: 0 }}>{contact.name}</p>
                  <p style={{ color: N.textSub, fontSize: '0.75rem' }}>{contact.role}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: N.textSub }}>{contact.email}</span>
                <StatusBadge
                  status={contact.onCall ? 'success' : 'neutral'}
                  label={contact.onCall ? 'On-Call' : 'Off'}
                />
              </div>
            </div>
          ))}
        </div>
      </NeuCard>
    </div>
  )
}

export default AlertEscalation
