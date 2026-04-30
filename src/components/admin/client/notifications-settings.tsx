'use client'

/**
 * ðŸ”” SILEXAR PULSE - Notifications Settings (Client)
 * Configuración de notificaciones para clientes
 * 
 * @description Notifications:
 * - Preferencias de alertas
 * - Canales de notificación
 * - Schedule de alertas
 * - Filtros por tipo
 * 
 * @version 2025.1.0
 * @tier CLIENT_ADMIN
 */

import { useState, useEffect } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Save,
  RefreshCw,
  Clock,
  Volume2,
  VolumeX
} from 'lucide-react'

interface NotificationPreference {
  id: string
  category: string
  name: string
  description: string
  channels: {
    email: boolean
    push: boolean
    sms: boolean
    slack: boolean
  }
  enabled: boolean
}

interface NotificationSchedule {
  quietHoursEnabled: boolean
  quietHoursStart: string
  quietHoursEnd: string
  timezone: string
  weekendNotifications: boolean
}

export function NotificationsSettings() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([])
  const [schedule, setSchedule] = useState<NotificationSchedule | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setPreferences([
      {
        id: 'pref_001',
        category: 'Campañas',
        name: 'Rendimiento de Campañas',
        description: 'Alertas sobre métricas y performance de campañas',
        channels: { email: true, push: true, sms: false, slack: true },
        enabled: true
      },
      {
        id: 'pref_002',
        category: 'Campañas',
        name: 'Presupuesto Agotado',
        description: 'Notificar cuando el presupuesto llegue al límite',
        channels: { email: true, push: true, sms: true, slack: true },
        enabled: true
      },
      {
        id: 'pref_003',
        category: 'Sistema',
        name: 'Actualizaciones del Sistema',
        description: 'Nuevas funcionalidades y cambios en la plataforma',
        channels: { email: true, push: false, sms: false, slack: false },
        enabled: true
      },
      {
        id: 'pref_004',
        category: 'Sistema',
        name: 'Mantenimiento Programado',
        description: 'Avisos de mantenimiento y downtime planificado',
        channels: { email: true, push: true, sms: false, slack: true },
        enabled: true
      },
      {
        id: 'pref_005',
        category: 'Equipo',
        name: 'Actividad del Equipo',
        description: 'Notificaciones sobre acciones de miembros del equipo',
        channels: { email: false, push: true, sms: false, slack: true },
        enabled: false
      },
      {
        id: 'pref_006',
        category: 'Seguridad',
        name: 'Alertas de Seguridad',
        description: 'Inicios de sesión sospechosos y cambios críticos',
        channels: { email: true, push: true, sms: true, slack: true },
        enabled: true
      }
    ])

    setSchedule({
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      timezone: 'America/Santiago',
      weekendNotifications: false
    })

    setIsLoading(false)
  }

  const togglePreference = (id: string) => {
    setPreferences(prev => prev.map(p =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ))
    setHasChanges(true)
  }

  const toggleChannel = (id: string, channel: keyof NotificationPreference['channels']) => {
    setPreferences(prev => prev.map(p =>
      p.id === id ? { ...p, channels: { ...p.channels, [channel]: !p.channels[channel] } } : p
    ))
    setHasChanges(true)
  }

  const saveSettings = () => {
    setHasChanges(false)
    alert('Configuración guardada exitosamente!')
  }

  const categories = [...new Set(preferences.map(p => p.category))]

  if (isLoading || !schedule) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando Notifications Settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#6888ff]" />
          Notifications Settings
        </h3>
        <div className="flex items-center gap-2">
          <NeuButton variant="secondary" onClick={loadSettings}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Reset
          </NeuButton>
          <NeuButton variant="primary" onClick={saveSettings} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-1" />
            Guardar
          </NeuButton>
        </div>
      </div>

      {/* Schedule */}
      <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
        <h4 className="text-[#69738c] font-medium mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#9aa3b8]" />
          Horario de Notificaciones
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-[#dfeaff]/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#69738c]">Horas Silenciosas</span>
              <button
                onClick={() => {
                  setSchedule({ ...schedule, quietHoursEnabled: !schedule.quietHoursEnabled })
                  setHasChanges(true)
                }}
                className={`p-2 rounded ${schedule.quietHoursEnabled ? 'bg-[#6888ff]/20 text-[#6888ff]' : 'bg-[#dfeaff] text-[#9aa3b8]'}`}
              >
                {schedule.quietHoursEnabled ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
            {schedule.quietHoursEnabled && (
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="Hora"
                  value={schedule.quietHoursStart}
                  onChange={(e) => {
                    setSchedule({ ...schedule, quietHoursStart: e.target.value })
                    setHasChanges(true)
                  }}
                  className="px-2 py-1 bg-[#dfeaff] border border-slate-600 rounded text-[#69738c]"
                />
                <span className="text-[#9aa3b8]">a</span>
                <input
                  type="Hora"
                  value={schedule.quietHoursEnd}
                  onChange={(e) => {
                    setSchedule({ ...schedule, quietHoursEnd: e.target.value })
                    setHasChanges(true)
                  }}
                  className="px-2 py-1 bg-[#dfeaff] border border-slate-600 rounded text-[#69738c]"
                />
              </div>
            )}
          </div>
          <div className="p-3 bg-[#dfeaff]/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-[#69738c]">Notificaciones fin de semana</span>
              <button
                onClick={() => {
                  setSchedule({ ...schedule, weekendNotifications: !schedule.weekendNotifications })
                  setHasChanges(true)
                }}
                className={`px-3 py-1 text-xs rounded ${schedule.weekendNotifications ? 'bg-[#6888ff]/20 text-[#6888ff]' : 'bg-[#dfeaff] text-[#9aa3b8]'}`}
              >
                {schedule.weekendNotifications ? 'Activado' : 'Desactivado'}
              </button>
            </div>
          </div>
        </div>
      </NeuCard>

      {/* Preferences by Category */}
      {categories.map(category => (
        <NeuCard key={category} style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
          <h4 className="text-[#69738c] font-medium mb-3">{category}</h4>
          <div className="space-y-3">
            {preferences.filter(p => p.category === category).map(pref => (
              <div key={pref.id} className={`p-3 rounded-lg ${pref.enabled ? 'bg-[#dfeaff]/50' : 'bg-[#dfeaff]/20'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => togglePreference(pref.id)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${pref.enabled ? 'bg-[#6888ff]' : 'bg-slate-600'}`}
                    >
                      <div className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform ${pref.enabled ? 'left-5' : 'left-0.5'}`} />
                    </button>
                    <div>
                      <span className={`text-sm ${pref.enabled ? 'text-[#69738c]' : 'text-[#9aa3b8]'}`}>{pref.name}</span>
                      <p className="text-xs text-[#9aa3b8]">{pref.description}</p>
                    </div>
                  </div>
                </div>
                {pref.enabled && (
                  <div className="flex items-center gap-2 ml-12">
                    <button
                      onClick={() => toggleChannel(pref.id, 'email')}
                      className={`p-1.5 rounded ${pref.channels.email ? 'bg-[#6888ff]/20 text-[#6888ff]' : 'bg-[#dfeaff] text-[#9aa3b8]'}`}
                      title="Email"
                    >
                      <Mail className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => toggleChannel(pref.id, 'push')}
                      className={`p-1.5 rounded ${pref.channels.push ? 'bg-[#6888ff]/20 text-[#6888ff]' : 'bg-[#dfeaff] text-[#9aa3b8]'}`}
                      title="Push"
                    >
                      <Smartphone className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => toggleChannel(pref.id, 'sms')}
                      className={`p-1.5 rounded ${pref.channels.sms ? 'bg-[#6888ff]/20 text-[#6888ff]' : 'bg-[#dfeaff] text-[#9aa3b8]'}`}
                      title="SMS"
                    >
                      <MessageSquare className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => toggleChannel(pref.id, 'slack')}
                      className={`p-1.5 rounded ${pref.channels.slack ? 'bg-[#6888ff]/20 text-[#6888ff]' : 'bg-[#dfeaff] text-[#9aa3b8]'}`}
                      title="Slack"
                    >
                      <MessageSquare className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </NeuCard>
      ))}
    </div>
  )
}

export default NotificationsSettings