'use client'

/**
 * ðŸ”Œ SILEXAR PULSE - Integration Hub (Client)
 * Hub de integraciones para clientes
 * 
 * @description Integrations:
 * - Conectar APIs externas
 * - Meta, Google, etc.
 * - Webhooks salientes
 * - API Keys
 * 
 * @version 2025.1.0
 * @tier CLIENT_ADMIN
 */

import { useState, useEffect } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  Plug,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  ExternalLink,
  Key,
  Trash2
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  provider: string
  icon: string
  status: 'Conectado' | 'Desconectado' | 'Error'
  lastSync?: Date
  features: string[]
  config?: Record<string, unknown>
}

interface AvailableIntegration {
  id: string
  name: string
  provider: string
  icon: string
  description: string
  category: 'advertising' | 'crm' | 'analytics' | 'communication' | 'storage'
}

export function IntegrationHub() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [available, setAvailable] = useState<AvailableIntegration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  useEffect(() => {
    loadIntegrations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadIntegrations = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setIntegrations([
      {
        id: 'int_001',
        name: 'Meta Marketing API',
        provider: 'Meta',
        icon: 'ðŸ“˜',
        status: 'Conectado',
        lastSync: new Date(Date.now() - 15 * 60 * 1000),
        features: ['Ads Management', 'Insights', 'Audiences']
      },
      {
        id: 'int_002',
        name: 'Google Ads',
        provider: 'Google',
        icon: 'ðŸ”',
        status: 'Conectado',
        lastSync: new Date(Date.now() - 30 * 60 * 1000),
        features: ['Campaigns', 'Keywords', 'Reports']
      },
      {
        id: 'int_003',
        name: 'HubSpot CRM',
        provider: 'HubSpot',
        icon: 'ðŸ§¡',
        status: 'Error',
        features: ['Contacts', 'Deals', 'Companies']
      }
    ])

    setAvailable([
      { id: 'avail_001', name: 'TikTok Ads', provider: 'TikTok', icon: 'ðŸŽµ', description: 'Gestiona campañas en TikTok', category: 'advertising' },
      { id: 'avail_002', name: 'LinkedIn Ads', provider: 'LinkedIn', icon: 'ðŸ’¼', description: 'Publicidad B2B en LinkedIn', category: 'advertising' },
      { id: 'avail_003', name: 'Salesforce', provider: 'Salesforce', icon: '˜ï¸', description: 'Sincroniza leads y oportunidades', category: 'crm' },
      { id: 'avail_004', name: 'Slack', provider: 'Slack', icon: 'ðŸ’¬', description: 'Notificaciones en tiempo real', category: 'communication' },
      { id: 'avail_005', name: 'Google Analytics', provider: 'Google', icon: 'ðŸ“Š', description: 'Analytics y conversiones', category: 'analytics' },
      { id: 'avail_006', name: 'AWS S3', provider: 'AWS', icon: 'ðŸ“¦', description: 'Almacenamiento de archivos', category: 'storage' }
    ])

    setIsLoading(false)
  }

  const connectIntegration = (id: string) => {
    const available_int = available.find(a => a.id === id)
    if (available_int) {
      const newInt: Integration = {
        id: `int_${Date.now()}`,
        name: available_int.name,
        provider: available_int.provider,
        icon: available_int.icon,
        status: 'Conectado',
        lastSync: new Date(),
        features: []
      }
      setIntegrations(prev => [...prev, newInt])
      setAvailable(prev => prev.filter(a => a.id !== id))
    }
  }

  const disconnectIntegration = (id: string) => {
    if (confirm('¿Desconectar esta integración?')) {
      setIntegrations(prev => prev.filter(i => i.id !== id))
    }
  }

  const syncIntegration = (id: string) => {
    setIntegrations(prev => prev.map(i =>
      i.id === id ? { ...i, lastSync: new Date(), status: 'Conectado' as const } : i
    ))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Conectado': return <CheckCircle className="w-4 h-4 text-[#6888ff]" />
      case 'Error': return <AlertTriangle className="w-4 h-4 text-[#6888ff]" />
      default: return <XCircle className="w-4 h-4 text-[#9aa3b8]" />
    }
  }

  const categories = ['all', 'advertising', 'crm', 'analytics', 'communication', 'storage']
  const filteredAvailable = activeCategory === 'all'
    ? available
    : available.filter(a => a.category === activeCategory)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6888ff]/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando Integration Hub...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2">
          <Plug className="w-5 h-5 text-[#6888ff]" />
          Integration Hub
        </h3>
        <NeuButton variant="secondary" onClick={loadIntegrations}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </NeuButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{integrations.filter(i => i.status === 'Conectado').length}</p>
          <p className="text-xs text-[#9aa3b8]">Conectadas</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{integrations.filter(i => i.status === 'Error').length}</p>
          <p className="text-xs text-[#9aa3b8]">Con Error</p>
        </div>
        <div className="p-3 bg-[#dfeaff]/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#69738c]">{available.length}</p>
          <p className="text-xs text-[#9aa3b8]">Disponibles</p>
        </div>
      </div>

      {/* Connected Integrations */}
      <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
        <h4 className="text-[#69738c] font-medium mb-3">Integraciones Conectadas</h4>
        <div className="space-y-2">
          {integrations.map(int => (
            <div key={int.id} className="flex items-center justify-between p-3 bg-[#dfeaff]/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{int.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#69738c] font-medium">{int.name}</span>
                    {getStatusIcon(int.status)}
                  </div>
                  <p className="text-xs text-[#9aa3b8]">
                    {int.provider}
                    {int.lastSync && ` • Sync: ${int.lastSync.toLocaleTimeString()}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => syncIntegration(int.id)} className="p-1 hover:bg-[#dfeaff] rounded">
                  <RefreshCw className="w-4 h-4 text-[#6888ff]" />
                </button>
                <button className="p-1 hover:bg-[#dfeaff] rounded">
                  <Settings className="w-4 h-4 text-[#9aa3b8]" />
                </button>
                <button onClick={() => disconnectIntegration(int.id)} className="p-1 hover:bg-[#dfeaff] rounded">
                  <Trash2 className="w-4 h-4 text-[#6888ff]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </NeuCard>

      {/* Available Integrations */}
      <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
        <h4 className="text-[#69738c] font-medium mb-3">Integraciones Disponibles</h4>

        {/* Category Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 text-xs rounded capitalize whitespace-nowrap ${activeCategory === cat ? 'bg-[#6888ff] text-white' : 'bg-[#dfeaff] text-[#9aa3b8]'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredAvailable.map(av => (
            <div key={av.id} className="p-3 bg-[#dfeaff]/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{av.icon}</span>
                  <span className="text-[#69738c] font-medium">{av.name}</span>
                </div>
                <NeuButton variant="secondary" onClick={() => connectIntegration(av.id)}>
                  <Plus className="w-4 h-4" />
                </NeuButton>
              </div>
              <p className="text-xs text-[#9aa3b8]">{av.description}</p>
            </div>
          ))}
        </div>
      </NeuCard>
    </div>
  )
}

export default IntegrationHub