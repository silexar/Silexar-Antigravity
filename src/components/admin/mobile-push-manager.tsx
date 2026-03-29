'use client'

/**
 * 📱 SILEXAR PULSE - Mobile Push Manager
 * Gestión de notificaciones push móviles
 * 
 * @description Sistema de push notifications:
 * - iOS y Android
 * - Segmentación de usuarios
 * - Programación de envíos
 * - Analytics de engagement
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect } from 'react'
import { 
  NeuromorphicCard, 
  NeuromorphicButton 
} from '@/components/ui/neuromorphic'
import {
  Smartphone,
  Bell,
  Send,
  Users,
  Target,
  Calendar,
  Plus,
  Trash2,
  Copy
} from 'lucide-react'

interface PushNotification {
  id: string
  title: string
  body: string
  imageUrl?: string
  targetAudience: 'all' | 'segment' | 'tenant'
  targetValue?: string
  platform: 'all' | 'ios' | 'android'
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  scheduledAt?: Date
  sentAt?: Date
  stats?: {
    sent: number
    delivered: number
    opened: number
    clicked: number
  }
  createdBy: string
  createdAt: Date
}

interface PushSegment {
  id: string
  name: string
  description: string
  usersCount: number
  criteria: string
}

export function MobilePushManager() {
  const [notifications, setNotifications] = useState<PushNotification[]>([])
  const [segments, setSegments] = useState<PushSegment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedNotification, setSelectedNotification] = useState<PushNotification | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadPushData()
  }, [])

  const loadPushData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setNotifications([
      {
        id: 'push_001',
        title: '🚀 Nueva Campaña Disponible',
        body: 'Se ha creado una nueva campaña de alto impacto. Revisa los detalles ahora.',
        targetAudience: 'all',
        platform: 'all',
        status: 'sent',
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        stats: { sent: 15420, delivered: 14890, opened: 8540, clicked: 2340 },
        createdBy: 'CEO',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: 'push_002',
        title: '⚡ Optimización Completada',
        body: 'Tu campaña ha sido optimizada con IA. CTR mejorado en un 23%.',
        targetAudience: 'segment',
        targetValue: 'premium_users',
        platform: 'all',
        status: 'sent',
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        stats: { sent: 5200, delivered: 5100, opened: 3200, clicked: 1450 },
        createdBy: 'CEO',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
      },
      {
        id: 'push_003',
        title: '📊 Reporte Semanal Listo',
        body: 'Tu reporte semanal de performance está disponible.',
        targetAudience: 'tenant',
        targetValue: 'RDF Media',
        platform: 'all',
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
        createdBy: 'CEO',
        createdAt: new Date()
      },
      {
        id: 'push_004',
        title: '🔔 Alerta de Presupuesto',
        body: 'Tu campaña está cerca del límite de presupuesto diario.',
        targetAudience: 'segment',
        targetValue: 'active_campaigns',
        platform: 'ios',
        status: 'draft',
        createdBy: 'CEO',
        createdAt: new Date()
      },
      {
        id: 'push_005',
        title: '🎉 ¡Objetivo Alcanzado!',
        body: 'Tu campaña superó el objetivo de conversiones. ¡Felicitaciones!',
        targetAudience: 'all',
        platform: 'android',
        status: 'failed',
        sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        stats: { sent: 0, delivered: 0, opened: 0, clicked: 0 },
        createdBy: 'CEO',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ])

    setSegments([
      { id: 'seg_001', name: 'Usuarios Premium', description: 'Usuarios con plan Enterprise o superior', usersCount: 5200, criteria: 'plan = enterprise OR plan = enterprise_plus' },
      { id: 'seg_002', name: 'Campañas Activas', description: 'Usuarios con al menos 1 campaña activa', usersCount: 8900, criteria: 'active_campaigns > 0' },
      { id: 'seg_003', name: 'Nuevos Usuarios', description: 'Registrados en los últimos 7 días', usersCount: 340, criteria: 'created_at > now() - 7 days' },
      { id: 'seg_004', name: 'Inactivos 30+ días', description: 'Sin login en 30 días', usersCount: 1250, criteria: 'last_login < now() - 30 days' }
    ])

    setIsLoading(false)
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-500/20 text-green-400'
      case 'scheduled': return 'bg-blue-500/20 text-blue-400'
      case 'draft': return 'bg-slate-500/20 text-slate-400'
      case 'failed': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getPlatformIcon = (_platform: string) => {
    return <Smartphone className="w-4 h-4 text-slate-400" />
  }

  const calculateRate = (numerator: number, denominator: number) => {
    if (denominator === 0) return 0
    return ((numerator / denominator) * 100).toFixed(1)
  }

  const sendNow = (notification: PushNotification) => {
    
    setNotifications(prev => prev.map(n => 
      n.id === notification.id ? { ...n, status: 'sent', sentAt: new Date() } : n
    ))
  }

  const duplicateNotification = (notification: PushNotification) => {
    const newNotification: PushNotification = {
      ...notification,
      id: `push_${Date.now()}`,
      title: `${notification.title} (Copia)`,
      status: 'draft',
      stats: undefined,
      sentAt: undefined,
      createdAt: new Date()
    }
    setNotifications(prev => [...prev, newNotification])
  }

  const deleteNotification = (id: string) => {
    if (confirm('¿Eliminar esta notificación?')) {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }
  }

  const filteredNotifications = notifications.filter(n => 
    statusFilter === 'all' || n.status === statusFilter
  )

  const totalSent = notifications.reduce((sum, n) => sum + (n.stats?.sent || 0), 0)
  const totalOpened = notifications.reduce((sum, n) => sum + (n.stats?.opened || 0), 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Push Manager...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-orange-400" />
          Mobile Push Manager
        </h3>
        <NeuromorphicButton variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Nueva Notificación
        </NeuromorphicButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-white">{notifications.length}</p>
          <p className="text-xs text-slate-400">Total</p>
        </div>
        <div className="p-3 bg-green-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-400">
            {notifications.filter(n => n.status === 'sent').length}
          </p>
          <p className="text-xs text-slate-400">Enviadas</p>
        </div>
        <div className="p-3 bg-blue-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-400">
            {notifications.filter(n => n.status === 'scheduled').length}
          </p>
          <p className="text-xs text-slate-400">Programadas</p>
        </div>
        <div className="p-3 bg-purple-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-purple-400">
            {(totalSent / 1000).toFixed(1)}K
          </p>
          <p className="text-xs text-slate-400">Enviados</p>
        </div>
        <div className="p-3 bg-orange-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-orange-400">
            {totalSent > 0 ? calculateRate(totalOpened, totalSent) : 0}%
          </p>
          <p className="text-xs text-slate-400">Open Rate</p>
        </div>
      </div>

      {/* Segments */}
      <NeuromorphicCard variant="embossed" className="p-4">
        <h4 className="text-sm text-slate-400 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Segmentos de Audiencia
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {segments.map(segment => (
            <div key={segment.id} className="p-3 bg-slate-800/50 rounded-lg">
              <p className="text-white text-sm font-medium">{segment.name}</p>
              <p className="text-xs text-slate-500 mb-1">{segment.description}</p>
              <p className="text-lg font-bold text-orange-400">{segment.usersCount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </NeuromorphicCard>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {['all', 'sent', 'scheduled', 'draft', 'failed'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
              statusFilter === status 
                ? 'bg-orange-600 text-white' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {status === 'all' ? 'Todas' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map(notification => (
          <NeuromorphicCard 
            key={notification.id}
            variant="embossed" 
            className={`p-4 cursor-pointer hover:border-orange-500/30 transition-all ${
              selectedNotification?.id === notification.id ? 'ring-1 ring-orange-500/50' : ''
            }`}
            onClick={() => setSelectedNotification(notification)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="w-4 h-4 text-orange-400" />
                  <span className="text-white font-medium">{notification.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${getStatusStyle(notification.status)}`}>
                    {notification.status}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-2">{notification.body}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {notification.targetAudience === 'all' ? 'Todos' : notification.targetValue}
                  </span>
                  <span className="flex items-center gap-1">
                    {getPlatformIcon(notification.platform)}
                    {notification.platform}
                  </span>
                  {notification.scheduledAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {notification.scheduledAt.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {notification.stats && (
                <div className="grid grid-cols-4 gap-3 text-center ml-4">
                  <div>
                    <p className="text-sm font-bold text-white">{(notification.stats.sent / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-slate-500">Sent</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-400">{calculateRate(notification.stats.delivered, notification.stats.sent)}%</p>
                    <p className="text-xs text-slate-500">Delivered</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-400">{calculateRate(notification.stats.opened, notification.stats.delivered)}%</p>
                    <p className="text-xs text-slate-500">Opened</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-orange-400">{calculateRate(notification.stats.clicked, notification.stats.opened)}%</p>
                    <p className="text-xs text-slate-500">CTR</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1 ml-4">
                {notification.status === 'draft' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); sendNow(notification); }}
                    className="p-1.5 text-slate-400 hover:text-green-400"
                    title="Enviar ahora"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); duplicateNotification(notification); }}
                  className="p-1.5 text-slate-400 hover:text-blue-400"
                  title="Duplicar"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                  className="p-1.5 text-slate-400 hover:text-red-400"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </NeuromorphicCard>
        ))}
      </div>
    </div>
  )
}

export default MobilePushManager
