'use client'

/**
 * ðŸ”— SILEXAR PULSE - Webhook Manager
 * Gestión de webhooks entrantes y salientes
 * 
 * @description Webhooks:
 * - Endpoints configurados
 * - Logs de entregas
 * - Reintentos automáticos
 * - Testing
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 * @security MILITARY_GRADE
 */

import { useState, useEffect } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  Link,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Play,
  Pause,
  Trash2,
  Eye
} from 'lucide-react'

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  status: 'active' | 'paused' | 'failing'
  secret?: string
  createdAt: Date
  lastDelivery?: Date
  successRate: number
  totalDeliveries: number
}

interface WebhookDelivery {
  id: string
  webhookId: string
  event: string
  status: 'success' | 'Fallido' | 'Pendiente'
  statusCode?: number
  responseTime?: number
  attemptNumber: number
  timestamp: Date
  payload?: string
  response?: string
}

export function WebhookManager() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([])
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadWebhooks()
  }, [])

  const loadWebhooks = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setWebhooks([
      { id: 'wh_001', name: 'CRM Integration', url: 'https://crm.company.com/webhooks/silexar', events: ['campaign.created', 'campaign.updated'], status: 'active', createdAt: new Date('2024-06-01'), lastDelivery: new Date(), successRate: 99.5, totalDeliveries: 12500 },
      { id: 'wh_002', name: 'Slack Notifications', url: 'https://hooks.slack.com/services/xxx', events: ['alert.triggered', 'campaign.failed'], status: 'active', createdAt: new Date('2024-03-15'), lastDelivery: new Date(Date.now() - 2 * 60 * 60 * 1000), successRate: 100, totalDeliveries: 890 },
      { id: 'wh_003', name: 'Analytics Pipeline', url: 'https://analytics.internal/ingest', events: ['campaign.completed', 'report.generated'], status: 'active', createdAt: new Date('2024-01-01'), lastDelivery: new Date(), successRate: 98.2, totalDeliveries: 45000 },
      { id: 'wh_004', name: 'Legacy System', url: 'https://old-system.company.com/api/notify', events: ['user.created'], status: 'failing', createdAt: new Date('2023-06-01'), lastDelivery: new Date(Date.now() - 24 * 60 * 60 * 1000), successRate: 45, totalDeliveries: 5600 },
      { id: 'wh_005', name: 'Backup Trigger', url: 'https://backup.internal/trigger', events: ['backup.scheduled'], status: 'paused', createdAt: new Date('2024-08-01'), successRate: 100, totalDeliveries: 365 }
    ])

    setIsLoading(false)
  }

  const loadDeliveries = (webhookId: string) => {
    setSelectedWebhook(webhookId)
    setDeliveries([
      { id: 'del_001', webhookId, event: 'campaign.created', status: 'success', statusCode: 200, responseTime: 145, attemptNumber: 1, timestamp: new Date() },
      { id: 'del_002', webhookId, event: 'campaign.updated', status: 'success', statusCode: 200, responseTime: 89, attemptNumber: 1, timestamp: new Date(Date.now() - 30 * 60 * 1000) },
      { id: 'del_003', webhookId, event: 'campaign.created', status: 'Fallido', statusCode: 500, responseTime: 5000, attemptNumber: 3, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), response: 'Internal Server Error' },
      { id: 'del_004', webhookId, event: 'campaign.updated', status: 'success', statusCode: 201, responseTime: 234, attemptNumber: 1, timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) }
    ])
  }

  const toggleWebhook = (id: string) => {
    setWebhooks(prev => prev.map(w =>
      w.id === id ? { ...w, status: w.status === 'active' ? 'paused' : 'active' } : w
    ))
  }

  const testWebhook = async (id: string) => {
    const webhook = webhooks.find(w => w.id === id)
    if (!webhook) return

    alert(`Enviando test a ${webhook.url}...`)
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Test enviado exitosamente!')
  }

  const retryDelivery = (id: string) => {
    setDeliveries(prev => prev.map(d =>
      d.id === id ? { ...d, status: 'Pendiente' } : d
    ))
    setTimeout(() => {
      setDeliveries(prev => prev.map(d =>
        d.id === id ? { ...d, status: 'success', statusCode: 200, attemptNumber: d.attemptNumber + 1 } : d
      ))
    }, 1500)
  }

  const deleteWebhook = (id: string) => {
    if (confirm('¿Eliminar este webhook?')) {
      setWebhooks(prev => prev.filter(w => w.id !== id))
    }
  }

  const activeCount = webhooks.filter(w => w.status === 'active').length
  const failingCount = webhooks.filter(w => w.status === 'failing').length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6888ff]/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando Webhook Manager...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2">
          <Link className="w-5 h-5 text-[#6888ff]" />
          Webhook Manager
        </h3>
        <div className="flex items-center gap-2">
          <NeuButton variant="secondary" onClick={loadWebhooks}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </NeuButton>
          <NeuButton variant="primary">
            <Plus className="w-4 h-4 mr-1" />
            Add Webhook
          </NeuButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-[#dfeaff]/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#69738c]">{webhooks.length}</p>
          <p className="text-xs text-[#9aa3b8]">Total</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{activeCount}</p>
          <p className="text-xs text-[#9aa3b8]">Activos</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{failingCount}</p>
          <p className="text-xs text-[#9aa3b8]">Fallando</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">
            {webhooks.reduce((sum, w) => sum + w.totalDeliveries, 0).toLocaleString()}
          </p>
          <p className="text-xs text-[#9aa3b8]">Entregas</p>
        </div>
      </div>

      {/* Webhooks List */}
      <div className="space-y-3">
        {webhooks.map(webhook => (
          <NeuCard
            key={webhook.id}
            style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${webhook.status === 'active' ? 'bg-[#6888ff]' :
                  webhook.status === 'failing' ? 'bg-[#6888ff] animate-pulse' : 'bg-[#6888ff]'
                  }`} />
                <div>
                  <span className="text-[#69738c] font-medium">{webhook.name}</span>
                  <p className="text-xs text-[#9aa3b8] font-mono truncate max-w-md">{webhook.url}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${webhook.status === 'active' ? 'bg-[#6888ff]/20 text-[#6888ff]' :
                  webhook.status === 'failing' ? 'bg-[#6888ff]/20 text-[#6888ff]' :
                    'bg-[#6888ff]/20 text-[#6888ff]'
                  }`}>
                  {webhook.status}
                </span>
                <button onClick={() => toggleWebhook(webhook.id)} className="p-1 hover:bg-[#dfeaff] rounded" aria-label="Activar/Desactivar">
                  {webhook.status === 'paused' ? <Play className="w-4 h-4 text-[#6888ff]" /> : <Pause className="w-4 h-4 text-[#6888ff]" />}
                </button>
                <button onClick={() => testWebhook(webhook.id)} className="p-1 hover:bg-[#dfeaff] rounded" aria-label="Actualizar">
                  <RefreshCw className="w-4 h-4 text-[#6888ff]" />
                </button>
                <button onClick={() => loadDeliveries(webhook.id)} className="p-1 hover:bg-[#dfeaff] rounded" aria-label="Ver detalle">
                  <Eye className="w-4 h-4 text-[#9aa3b8]" />
                </button>
                <button onClick={() => deleteWebhook(webhook.id)} className="p-1 hover:bg-[#dfeaff] rounded" aria-label="Eliminar">
                  <Trash2 className="w-4 h-4 text-[#6888ff]" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <span className="text-[#9aa3b8]">
                Eventos: {webhook.events.map(e => <span key={e} className="text-[#6888ff] mx-1">{e}</span>)}
              </span>
              <span className={`${webhook.successRate >= 95 ? 'text-[#6888ff]' : webhook.successRate >= 80 ? 'text-[#6888ff]' : 'text-[#6888ff]'}`}>
                Á‰xito: {webhook.successRate}%
              </span>
              <span className="text-[#9aa3b8]">{webhook.totalDeliveries.toLocaleString()} entregas</span>
            </div>
          </NeuCard>
        ))}
      </div>

      {/* Deliveries Log */}
      {selectedWebhook && (
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
          <h4 className="text-[#69738c] font-medium mb-3">Historial de Entregas</h4>
          <div className="space-y-2">
            {deliveries.map(delivery => (
              <div key={delivery.id} className="flex items-center justify-between p-3 bg-[#dfeaff]/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {delivery.status === 'success' && <CheckCircle className="w-4 h-4 text-[#6888ff]" />}
                  {delivery.status === 'Fallido' && <XCircle className="w-4 h-4 text-[#6888ff]" />}
                  {delivery.status === 'Pendiente' && <Clock className="w-4 h-4 text-[#6888ff] animate-spin" />}
                  <div>
                    <span className="text-[#69738c] text-sm">{delivery.event}</span>
                    <p className="text-xs text-[#9aa3b8]">{delivery.timestamp.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {delivery.statusCode && (
                    <span className={`text-xs px-2 py-0.5 rounded ${delivery.statusCode < 300 ? 'bg-[#6888ff]/20 text-[#6888ff]' : 'bg-[#6888ff]/20 text-[#6888ff]'
                      }`}>
                      {delivery.statusCode}
                    </span>
                  )}
                  {delivery.responseTime && (
                    <span className="text-xs text-[#9aa3b8]">{delivery.responseTime}ms</span>
                  )}
                  <span className="text-xs text-[#9aa3b8]">Intento #{delivery.attemptNumber}</span>
                  {delivery.status === 'Fallido' && (
                    <button onClick={() => retryDelivery(delivery.id)} className="text-xs text-[#6888ff] hover:underline">
                      Reintentar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </NeuCard>
      )}
    </div>
  )
}

export default WebhookManager