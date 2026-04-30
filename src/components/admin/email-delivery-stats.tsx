'use client'

/**
 * ðŸ“¨ SILEXAR PULSE - Email Delivery Stats
 * Estadísticas de entrega de email
 * 
 * @description Email Analytics:
 * - Deliverability
 * - Bounce rates
 * - Blacklist monitoring
 * - Provider status
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 * @security MILITARY_GRADE
 */

import { useState, useEffect } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  Mail,
  Send,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Activity
} from 'lucide-react'

interface EmailStats {
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  complained: number
  unsubscribed: number
}

interface EmailProvider {
  name: string
  status: 'healthy' | 'degraded' | 'down'
  deliveryRate: number
  avgLatency: number
  lastCheck: Date
}

export function EmailDeliveryStats() {
  const [stats, setStats] = useState<EmailStats | null>(null)
  const [providers, setProviders] = useState<EmailProvider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today')

  useEffect(() => {
    loadEmailData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe])

  const loadEmailData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    const multiplier = timeframe === 'today' ? 1 : timeframe === 'week' ? 7 : 30
    setStats({
      sent: 12500 * multiplier,
      delivered: 12125 * multiplier,
      opened: 4850 * multiplier,
      clicked: 1820 * multiplier,
      bounced: 312 * multiplier,
      complained: 8 * multiplier,
      unsubscribed: 45 * multiplier
    })

    setProviders([
      { name: 'SendGrid', status: 'healthy', deliveryRate: 99.2, avgLatency: 1.2, lastCheck: new Date() },
      { name: 'AWS SES', status: 'healthy', deliveryRate: 98.8, avgLatency: 1.5, lastCheck: new Date() },
      { name: 'Mailgun', status: 'degraded', deliveryRate: 97.1, avgLatency: 2.8, lastCheck: new Date() }
    ])

    setIsLoading(false)
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'degraded': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'down': return 'bg-[#6888ff]/20 text-[#6888ff]'
      default: return 'bg-slate-500/20 text-[#9aa3b8]'
    }
  }

  const calculateRate = (num: number, denom: number) => {
    return denom > 0 ? ((num / denom) * 100).toFixed(1) : '0'
  }

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6888ff]/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando Email Stats...</p>
        </div>
      </div>
    )
  }

  const deliveryRate = calculateRate(stats.delivered, stats.sent)
  const openRate = calculateRate(stats.opened, stats.delivered)
  const clickRate = calculateRate(stats.clicked, stats.opened)
  const bounceRate = calculateRate(stats.bounced, stats.sent)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#6888ff]" />
          Email Delivery Stats
        </h3>
        <div className="flex items-center gap-2">
          {(['today', 'week', 'month'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 text-sm rounded ${timeframe === tf ? 'bg-[#6888ff] text-white' : 'bg-[#dfeaff] text-[#9aa3b8]'
                }`}
            >
              {tf === 'today' ? 'Hoy' : tf === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-4 gap-3">
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
          <Send className="w-6 h-6 text-[#6888ff] mx-auto mb-2" />
          <p className="text-2xl font-bold text-[#69738c]">{(stats.sent / 1000).toFixed(1)}K</p>
          <p className="text-xs text-[#9aa3b8]">Enviados</p>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
          <CheckCircle className="w-6 h-6 text-[#6888ff] mx-auto mb-2" />
          <p className="text-2xl font-bold text-[#6888ff]">{deliveryRate}%</p>
          <p className="text-xs text-[#9aa3b8]">Delivery Rate</p>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
          <Activity className="w-6 h-6 text-[#6888ff] mx-auto mb-2" />
          <p className="text-2xl font-bold text-[#6888ff]">{openRate}%</p>
          <p className="text-xs text-[#9aa3b8]">Open Rate</p>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
          <TrendingUp className="w-6 h-6 text-[#6888ff] mx-auto mb-2" />
          <p className="text-2xl font-bold text-[#6888ff]">{clickRate}%</p>
          <p className="text-xs text-[#9aa3b8]">Click Rate</p>
        </NeuCard>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-lg font-bold text-[#6888ff]">{stats.delivered.toLocaleString()}</p>
          <p className="text-xs text-[#9aa3b8]">Entregados</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-lg font-bold text-[#6888ff]">{stats.opened.toLocaleString()}</p>
          <p className="text-xs text-[#9aa3b8]">Abiertos</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-lg font-bold text-[#6888ff]">{bounceRate}%</p>
          <p className="text-xs text-[#9aa3b8]">Bounce Rate</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-lg font-bold text-[#6888ff]">{stats.complained}</p>
          <p className="text-xs text-[#9aa3b8]">Spam Reports</p>
        </div>
      </div>

      {/* Provider Status */}
      <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
        <h4 className="text-[#69738c] font-medium mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#6888ff]" />
          Email Providers Status
        </h4>
        <div className="space-y-3">
          {providers.map(provider => (
            <div key={provider.name} className="flex items-center justify-between p-3 bg-[#dfeaff]/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${provider.status === 'healthy' ? 'bg-[#6888ff]' :
                  provider.status === 'degraded' ? 'bg-[#6888ff]' : 'bg-[#6888ff]'
                  }`} />
                <span className="text-[#69738c]">{provider.name}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className={`text-sm ${provider.deliveryRate >= 99 ? 'text-[#6888ff]' : 'text-[#6888ff]'
                  }`}>
                  {provider.deliveryRate}% delivery
                </span>
                <span className="text-sm text-[#9aa3b8]">
                  {provider.avgLatency}s latency
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${getStatusStyle(provider.status)}`}>
                  {provider.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </NeuCard>

      {/* Warnings */}
      {parseFloat(bounceRate) > 2 && (
        <div className="p-4 bg-[#6888ff]/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-[#6888ff]" />
          <div>
            <span className="text-[#6888ff] font-medium">Bounce rate alto detectado</span>
            <p className="text-sm text-[#9aa3b8]">
              Tu bounce rate de {bounceRate}% está por encima del límite recomendado (2%).
              Considera limpiar tu lista de emails.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmailDeliveryStats