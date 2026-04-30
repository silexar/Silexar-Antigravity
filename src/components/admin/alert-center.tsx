'use client'

/**
 * ðŸ”” SILEXAR PULSE - Centro de Alertas CEO
 * Sistema de alertas multicanal con IA
 * 
 * @description Centro de alertas proactivo con:
 * - Alertas por WhatsApp/Telegram
 * - Resumen diario automático
 * - Escalamiento de incidentes
 * - SLA tracking
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 * 
 * @last_modified 2025-04-27 - Migrated to AdminDesignSystem pattern
 */

import { useState, useEffect } from 'react'
import { N, NeuCard, NeuButton, StatusBadge, NeuProgress, getShadow, getSmallShadow } from './_sdk/AdminDesignSystem'
import {
  Bell,
  MessageCircle,
  Mail,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Settings,
  Send,
  RefreshCw,
  Volume2,
  VolumeX,
  Zap
} from 'lucide-react'

interface Alert {
  id: string
  type: 'critical' | 'warning' | 'info' | 'success'
  category: 'security' | 'performance' | 'license' | 'system' | 'commercial'
  title: string
  message: string
  timestamp: Date
  acknowledged: boolean
  escalated: boolean
  channels: ('email' | 'whatsapp' | 'telegram' | 'sms')[]
  actionRequired: boolean
  suggestedAction?: string
}

interface AlertChannel {
  id: string
  name: string
  type: 'whatsapp' | 'telegram' | 'email' | 'sms'
  enabled: boolean
  target: string
  icon: React.ReactNode
}

interface DailySummary {
  date: Date
  criticalAlerts: number
  warningAlerts: number
  resolvedAlerts: number
  avgResponseTime: number
  slaCompliance: number
}

export function AlertCenter() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [channels, setChannels] = useState<AlertChannel[]>([])
  const [summary, setSummary] = useState<DailySummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'critical' | 'unacknowledged'>('all')
  const [muteAll, setMuteAll] = useState(false)

  useEffect(() => {
    loadAlertData()
  }, [])

  const loadAlertData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    // Demo alerts
    setAlerts([
      {
        id: 'alert_001',
        type: 'critical',
        category: 'security',
        title: 'Intento de acceso no autorizado',
        message: 'Se detectaron 15 intentos fallidos de login desde IP 192.168.1.100',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        acknowledged: false,
        escalated: true,
        channels: ['email', 'whatsapp', 'telegram'],
        actionRequired: true,
        suggestedAction: 'Bloquear IP y revisar logs de seguridad'
      },
      {
        id: 'alert_002',
        type: 'warning',
        category: 'license',
        title: 'Licencia por expirar',
        message: 'Mega Media: Licencia expira en 7 días - $299.000/mes en riesgo',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        acknowledged: false,
        escalated: false,
        channels: ['email', 'telegram'],
        actionRequired: true,
        suggestedAction: 'Contactar cliente para renovación'
      },
      {
        id: 'alert_003',
        type: 'warning',
        category: 'performance',
        title: 'Alto uso de CPU',
        message: 'Servidor principal al 92% de CPU durante los últimos 15 minutos',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        acknowledged: true,
        escalated: false,
        channels: ['email'],
        actionRequired: false,
        suggestedAction: 'Considerar escalado de recursos'
      },
      {
        id: 'alert_004',
        type: 'info',
        category: 'commercial',
        title: 'Nuevo lead calificado',
        message: 'TVN Chile pasó a etapa de negociación - $999.000 potencial',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        acknowledged: true,
        escalated: false,
        channels: ['telegram'],
        actionRequired: false
      },
      {
        id: 'alert_005',
        type: 'success',
        category: 'commercial',
        title: 'Nuevo cliente cerrado',
        message: 'Publimetro firmó contrato Professional por 12 meses',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        acknowledged: true,
        escalated: false,
        channels: ['email', 'whatsapp'],
        actionRequired: false
      }
    ])

    // Demo channels
    setChannels([
      {
        id: 'ch_001',
        name: 'WhatsApp CEO',
        type: 'whatsapp',
        enabled: true,
        target: '+56 9 8765 4321',
        icon: <MessageCircle style={{ width: 20, height: 20, color: '#6888ff' }} />
      },
      {
        id: 'ch_002',
        name: 'Telegram Alertas',
        type: 'telegram',
        enabled: true,
        target: '@silexar_alerts',
        icon: <Send style={{ width: 20, height: 20, color: '#6888ff' }} />
      },
      {
        id: 'ch_003',
        name: 'Email CEO',
        type: 'email',
        enabled: true,
        target: 'ceo@silexar.com',
        icon: <Mail style={{ width: 20, height: 20, color: '#6888ff' }} />
      },
      {
        id: 'ch_004',
        name: 'SMS Emergencia',
        type: 'sms',
        enabled: false,
        target: '+56 9 8765 4321',
        icon: <Smartphone style={{ width: 20, height: 20, color: '#6888ff' }} />
      }
    ])

    // Demo summary
    setSummary({
      date: new Date(),
      criticalAlerts: 2,
      warningAlerts: 5,
      resolvedAlerts: 12,
      avgResponseTime: 8.5,
      slaCompliance: 97.3
    })

    setIsLoading(false)
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, acknowledged: true } : a
    ))
  }

  const toggleChannel = (channelId: string) => {
    setChannels(prev => prev.map(c =>
      c.id === channelId ? { ...c, enabled: !c.enabled } : c
    ))
  }

  const sendTestAlert = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId)
    // Aquí iría la integración real
  }

  const getAlertIcon = (type: Alert['type']) => {
    const color = type === 'critical' ? '#6888ff' :
      type === 'warning' ? '#6888ff' :
        type === 'info' ? '#6888ff' : '#6888ff'
    switch (type) {
      case 'critical': return <XCircle style={{ width: 20, height: 20, color }} />
      case 'warning': return <AlertTriangle style={{ width: 20, height: 20, color }} />
      case 'info': return <Bell style={{ width: 20, height: 20, color }} />
      case 'success': return <CheckCircle style={{ width: 20, height: 20, color }} />
    }
  }

  const getAlertBg = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return '#6888ff10'
      case 'warning': return '#6888ff10'
      case 'info': return '#6888ff10'
      case 'success': return '#6888ff10'
    }
  }

  const getAlertBorder = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return '#6888ff50'
      case 'warning': return '#6888ff50'
      case 'info': return '#6888ff50'
      case 'success': return '#6888ff50'
    }
  }

  const getAlertTypeBadge = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return <StatusBadge status="danger" label={type} />
      case 'warning': return <StatusBadge status="warning" label={type} />
      case 'info': return <StatusBadge status="info" label={type} />
      case 'success': return <StatusBadge status="success" label={type} />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    if (minutes < 60) return `Hace ${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Hace ${hours}h`
    return `Hace ${Math.floor(hours / 24)}d`
  }

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'critical') return a.type === 'critical'
    if (filter === 'unacknowledged') return !a.acknowledged
    return true
  })

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48,
            height: 48,
            border: '4px solid #6888ff30',
            borderTopColor: '#6888ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: N.textSub }}>Cargando Centro de Alertas...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ color: N.text, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell style={{ color: '#6888ff', width: 24, height: 24 }} />
            Centro de Alertas
          </h2>
          <p style={{ color: N.textSub, fontSize: '0.875rem' }}>Monitoreo proactivo multicanal</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setMuteAll(!muteAll)}
            style={{
              padding: '0.5rem',
              borderRadius: 8,
              background: muteAll ? '#6888ff20' : `${N.dark}70`,
              color: muteAll ? '#6888ff' : N.textSub,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {muteAll ? <VolumeX style={{ width: 20, height: 20 }} /> : <Volume2 style={{ width: 20, height: 20 }} />}
          </button>
          <NeuButton variant="secondary" onClick={loadAlertData}>
            <RefreshCw style={{ width: 16, height: 16, marginRight: 4 }} />
            Actualizar
          </NeuButton>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Críticas Hoy</p>
              <p style={{ color: '#6888ff', fontSize: '1.5rem', fontWeight: 700 }}>{summary?.criticalAlerts}</p>
            </div>
            <XCircle style={{ width: 32, height: 32, color: '#6888ff50' }} />
          </div>
        </NeuCard>

        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Advertencias</p>
              <p style={{ color: '#6888ff', fontSize: '1.5rem', fontWeight: 700 }}>{summary?.warningAlerts}</p>
            </div>
            <AlertTriangle style={{ width: 32, height: 32, color: '#6888ff50' }} />
          </div>
        </NeuCard>

        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Resueltas</p>
              <p style={{ color: '#6888ff', fontSize: '1.5rem', fontWeight: 700 }}>{summary?.resolvedAlerts}</p>
            </div>
            <CheckCircle style={{ width: 32, height: 32, color: '#6888ff50' }} />
          </div>
        </NeuCard>

        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Tiempo Resp.</p>
              <p style={{ color: N.text, fontSize: '1.5rem', fontWeight: 700 }}>{summary?.avgResponseTime}m</p>
            </div>
            <Clock style={{ width: 32, height: 32, color: '#6888ff50' }} />
          </div>
        </NeuCard>

        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: N.textSub, fontSize: '0.75rem' }}>SLA</p>
              <p style={{ color: '#6888ff', fontSize: '1.5rem', fontWeight: 700 }}>{summary?.slaCompliance}%</p>
            </div>
            <Shield style={{ width: 32, height: 32, color: '#6888ff50' }} />
          </div>
        </NeuCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        {/* Alert List */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600 }}>Alertas Recientes</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: `${N.dark}50`, borderRadius: 8, padding: '0.25rem' }}>
              {(['all', 'critical', 'unacknowledged'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.75rem',
                    borderRadius: 6,
                    border: 'none',
                    cursor: 'pointer',
                    background: filter === f ? '#6888ff' : 'transparent',
                    color: filter === f ? N.base : N.textSub,
                    fontWeight: filter === f ? 600 : 400
                  }}
                >
                  {f === 'all' ? 'Todas' : f === 'critical' ? 'Críticas' : 'Pendientes'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredAlerts.map(alert => (
              <NeuCard
                key={alert.id}
                style={{
                  boxShadow: getShadow(),
                  background: getAlertBg(alert.type),
                  border: `1px solid ${getAlertBorder(alert.type)}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  {getAlertIcon(alert.type)}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ color: N.text, fontWeight: 500 }}>{alert.title}</p>
                        <p style={{ color: N.textSub, fontSize: '0.875rem', marginTop: '0.25rem' }}>{alert.message}</p>
                      </div>
                      <span style={{ color: N.textSub, fontSize: '0.75rem' }}>{formatTimeAgo(alert.timestamp)}</span>
                    </div>

                    {alert.suggestedAction && (
                      <p style={{ color: '#6888ff', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                        ðŸ’¡ {alert.suggestedAction}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {alert.channels.map(ch => (
                          <span key={ch} style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', background: `${N.dark}70`, color: N.textSub, borderRadius: 4 }}>
                            {ch}
                          </span>
                        ))}
                        {alert.escalated && (
                          <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', background: '#6888ff20', color: '#6888ff', borderRadius: 4 }}>
                            Escalada
                          </span>
                        )}
                      </div>

                      {!alert.acknowledged && (
                        <NeuButton
                          variant="secondary"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          <CheckCircle style={{ width: 12, height: 12, marginRight: 4 }} />
                          Reconocer
                        </NeuButton>
                      )}
                    </div>
                  </div>
                </div>
              </NeuCard>
            ))}
          </div>
        </div>

        {/* Channels Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings style={{ color: N.textSub, width: 20, height: 20 }} />
            Canales de Notificación
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {channels.map(channel => (
              <NeuCard key={channel.id} style={{ boxShadow: getShadow() }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {channel.icon}
                    <div>
                      <p style={{ color: N.text, fontWeight: 500 }}>{channel.name}</p>
                      <p style={{ color: N.textSub, fontSize: '0.75rem' }}>{channel.target}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleChannel(channel.id)}
                    style={{
                      width: 40,
                      height: 24,
                      borderRadius: 12,
                      transition: 'colors 0.2s',
                      background: channel.enabled ? '#6888ff' : `${N.dark}70`,
                      border: 'none',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: N.base,
                      position: 'absolute',
                      top: 4,
                      left: channel.enabled ? 20 : 4,
                      transition: 'left 0.2s'
                    }} />
                  </button>
                </div>

                {channel.enabled && (
                  <div style={{ width: '100%' }}>
                    <NeuButton
                      variant="secondary"
                      onClick={() => sendTestAlert(channel.id)}
                    >
                      <Zap style={{ width: 12, height: 12, marginRight: 4 }} />
                      Enviar Prueba
                    </NeuButton>
                  </div>
                )}
              </NeuCard>
            ))}
          </div>

          {/* Alert Rules */}
          <NeuCard style={{ boxShadow: getShadow() }}>
            <h4 style={{ color: N.text, fontWeight: 500, marginBottom: '0.75rem' }}>Reglas de Escalamiento</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: N.textSub }}>Críticas †’ WhatsApp inmediato</span>
                <StatusBadge status="success" label="Activo" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: N.textSub }}>Sin respuesta 5min †’ SMS</span>
                <StatusBadge status="success" label="Activo" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: N.textSub }}>Licencias †’ Email diario</span>
                <StatusBadge status="success" label="Activo" />
              </div>
            </div>
          </NeuCard>

          {/* Daily Summary Toggle */}
          <NeuCard style={{ boxShadow: getShadow(), background: '#6888ff15' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: N.text, fontWeight: 500 }}>Resumen Diario</p>
                <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Email a las 08:00</p>
              </div>
              <StatusBadge status="success" label="Activo" />
            </div>
          </NeuCard>
        </div>
      </div>
    </div>
  )
}

export default AlertCenter
