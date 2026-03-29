'use client'

/**
 * 🔔 SILEXAR PULSE - Centro de Alertas CEO
 * Sistema de alertas multicanal con IA
 * 
 * @description Centro de alertas proactivo con:
 * - Alertas por WhatsApp/Telegram
 * - Resumen diario automático
 * - Escalamiento de incidentes
 * - SLA tracking
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect } from 'react'
import { 
  NeuromorphicCard, 
  NeuromorphicButton,
  NeuromorphicStatus
} from '@/components/ui/neuromorphic'
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
        icon: <MessageCircle className="w-5 h-5 text-green-400" />
      },
      {
        id: 'ch_002',
        name: 'Telegram Alertas',
        type: 'telegram',
        enabled: true,
        target: '@silexar_alerts',
        icon: <Send className="w-5 h-5 text-blue-400" />
      },
      {
        id: 'ch_003',
        name: 'Email CEO',
        type: 'email',
        enabled: true,
        target: 'ceo@silexar.com',
        icon: <Mail className="w-5 h-5 text-purple-400" />
      },
      {
        id: 'ch_004',
        name: 'SMS Emergencia',
        type: 'sms',
        enabled: false,
        target: '+56 9 8765 4321',
        icon: <Smartphone className="w-5 h-5 text-orange-400" />
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
    switch (type) {
      case 'critical': return <XCircle className="w-5 h-5 text-red-400" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'info': return <Bell className="w-5 h-5 text-blue-400" />
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />
    }
  }

  const getAlertBg = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return 'bg-red-500/10 border-red-500/30'
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30'
      case 'info': return 'bg-blue-500/10 border-blue-500/30'
      case 'success': return 'bg-green-500/10 border-green-500/30'
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Centro de Alertas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-orange-400" />
            Centro de Alertas
          </h2>
          <p className="text-slate-400">Monitoreo proactivo multicanal</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMuteAll(!muteAll)}
            className={`p-2 rounded-lg ${muteAll ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'}`}
          >
            {muteAll ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <NeuromorphicButton variant="secondary" size="sm" onClick={loadAlertData}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Actualizar
          </NeuromorphicButton>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Críticas Hoy</p>
              <p className="text-2xl font-bold text-red-400">{summary?.criticalAlerts}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400/50" />
          </div>
        </NeuromorphicCard>

        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Advertencias</p>
              <p className="text-2xl font-bold text-yellow-400">{summary?.warningAlerts}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-400/50" />
          </div>
        </NeuromorphicCard>

        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Resueltas</p>
              <p className="text-2xl font-bold text-green-400">{summary?.resolvedAlerts}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400/50" />
          </div>
        </NeuromorphicCard>

        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Tiempo Resp.</p>
              <p className="text-2xl font-bold text-white">{summary?.avgResponseTime}m</p>
            </div>
            <Clock className="w-8 h-8 text-blue-400/50" />
          </div>
        </NeuromorphicCard>

        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">SLA</p>
              <p className="text-2xl font-bold text-green-400">{summary?.slaCompliance}%</p>
            </div>
            <Shield className="w-8 h-8 text-green-400/50" />
          </div>
        </NeuromorphicCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alert List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Alertas Recientes</h3>
            <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
              {(['all', 'critical', 'unacknowledged'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs rounded ${
                    filter === f ? 'bg-orange-600 text-white' : 'text-slate-400'
                  }`}
                >
                  {f === 'all' ? 'Todas' : f === 'critical' ? 'Críticas' : 'Pendientes'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredAlerts.map(alert => (
              <NeuromorphicCard 
                key={alert.id}
                variant="embossed" 
                className={`p-4 border ${getAlertBg(alert.type)}`}
              >
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-medium">{alert.title}</p>
                        <p className="text-sm text-slate-400 mt-1">{alert.message}</p>
                      </div>
                      <span className="text-xs text-slate-500">{formatTimeAgo(alert.timestamp)}</span>
                    </div>

                    {alert.suggestedAction && (
                      <p className="text-xs text-blue-400 mt-2">
                        💡 {alert.suggestedAction}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        {alert.channels.map(ch => (
                          <span key={ch} className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded">
                            {ch}
                          </span>
                        ))}
                        {alert.escalated && (
                          <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">
                            Escalada
                          </span>
                        )}
                      </div>

                      {!alert.acknowledged && (
                        <NeuromorphicButton
                          variant="secondary"
                          size="sm"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Reconocer
                        </NeuromorphicButton>
                      )}
                    </div>
                  </div>
                </div>
              </NeuromorphicCard>
            ))}
          </div>
        </div>

        {/* Channels Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-400" />
            Canales de Notificación
          </h3>

          <div className="space-y-3">
            {channels.map(channel => (
              <NeuromorphicCard key={channel.id} variant="embossed" className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {channel.icon}
                    <div>
                      <p className="text-white font-medium">{channel.name}</p>
                      <p className="text-xs text-slate-400">{channel.target}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleChannel(channel.id)}
                    className={`w-10 h-6 rounded-full transition-colors ${
                      channel.enabled ? 'bg-green-600' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      channel.enabled ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {channel.enabled && (
                  <NeuromorphicButton
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => sendTestAlert(channel.id)}
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Enviar Prueba
                  </NeuromorphicButton>
                )}
              </NeuromorphicCard>
            ))}
          </div>

          {/* Alert Rules */}
          <NeuromorphicCard variant="embossed" className="p-4">
            <h4 className="text-white font-medium mb-3">Reglas de Escalamiento</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Críticas → WhatsApp inmediato</span>
                <NeuromorphicStatus status="online" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Sin respuesta 5min → SMS</span>
                <NeuromorphicStatus status="online" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Licencias → Email diario</span>
                <NeuromorphicStatus status="online" size="sm" />
              </div>
            </div>
          </NeuromorphicCard>

          {/* Daily Summary Toggle */}
          <NeuromorphicCard variant="glow" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Resumen Diario</p>
                <p className="text-xs text-slate-400">Email a las 08:00</p>
              </div>
              <NeuromorphicStatus status="online" pulse />
            </div>
          </NeuromorphicCard>
        </div>
      </div>
    </div>
  )
}

export default AlertCenter
