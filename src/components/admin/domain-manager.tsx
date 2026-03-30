'use client'

/**
 * 🌐 SILEXAR PULSE - Domain Manager
 * Gestión de dominios y DNS
 * 
 * @description Domain Management:
 * - Dominios configurados
 * - DNS records
 * - Mapeo de tenants
 * - Custom domains
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
  Globe,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Settings,
  Trash2
} from 'lucide-react'

interface Domain {
  id: string
  domain: string
  type: 'primary' | 'alias' | 'custom'
  status: 'active' | 'pending' | 'failed' | 'verifying'
  tenantId?: string
  tenantName?: string
  ssl: boolean
  verified: boolean
  createdAt: Date
  dnsRecords: DNSRecord[]
}

interface DNSRecord {
  type: 'A' | 'CNAME' | 'TXT' | 'MX'
  name: string
  value: string
  ttl: number
  status: 'active' | 'pending'
}

export function DomainManager() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDomains()
  }, [])

  const loadDomains = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setDomains([
      {
        id: 'dom_001',
        domain: 'silexarpulse.com',
        type: 'primary',
        status: 'active',
        ssl: true,
        verified: true,
        createdAt: new Date('2024-01-01'),
        dnsRecords: [
          { type: 'A', name: '@', value: '104.21.45.123', ttl: 3600, status: 'active' },
          { type: 'CNAME', name: 'www', value: 'silexarpulse.com', ttl: 3600, status: 'active' },
          { type: 'TXT', name: '@', value: 'v=spf1 include:_spf.google.com ~all', ttl: 3600, status: 'active' },
          { type: 'MX', name: '@', value: 'mail.silexarpulse.com', ttl: 3600, status: 'active' }
        ]
      },
      {
        id: 'dom_002',
        domain: 'app.silexarpulse.com',
        type: 'alias',
        status: 'active',
        ssl: true,
        verified: true,
        createdAt: new Date('2024-01-15'),
        dnsRecords: [
          { type: 'CNAME', name: 'app', value: 'silexarpulse.com', ttl: 3600, status: 'active' }
        ]
      },
      {
        id: 'dom_003',
        domain: 'rdfmedia.silexarpulse.com',
        type: 'custom',
        status: 'active',
        tenantId: 'tenant_001',
        tenantName: 'RDF Media',
        ssl: true,
        verified: true,
        createdAt: new Date('2024-03-01'),
        dnsRecords: [
          { type: 'CNAME', name: 'rdfmedia', value: 'app.silexarpulse.com', ttl: 3600, status: 'active' }
        ]
      },
      {
        id: 'dom_004',
        domain: 'ads.prisa.com',
        type: 'custom',
        status: 'pending',
        tenantId: 'tenant_002',
        tenantName: 'Grupo Prisa',
        ssl: false,
        verified: false,
        createdAt: new Date('2024-12-01'),
        dnsRecords: [
          { type: 'CNAME', name: 'ads', value: 'app.silexarpulse.com', ttl: 3600, status: 'pending' }
        ]
      }
    ])

    setIsLoading(false)
  }

  const verifyDomain = async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    setDomains(prev => prev.map(d => 
      d.id === id ? { ...d, verified: true, status: 'active' } : d
    ))
  }

  const deleteDomain = (id: string) => {
    if (confirm('¿Eliminar este dominio?')) {
      setDomains(prev => prev.filter(d => d.id !== id))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />
      case 'verifying': return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />
      default: return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const activeCount = domains.filter(d => d.status === 'active').length
  const pendingCount = domains.filter(d => d.status === 'pending' || d.status === 'verifying').length
  const customCount = domains.filter(d => d.type === 'custom').length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Domain Manager...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-400" />
          Domain Manager
        </h3>
        <div className="flex items-center gap-2">
          <NeuromorphicButton variant="secondary" size="sm" onClick={loadDomains}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </NeuromorphicButton>
          <NeuromorphicButton variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Domain
          </NeuromorphicButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-white">{domains.length}</p>
          <p className="text-xs text-slate-400">Total</p>
        </div>
        <div className="p-3 bg-green-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-400">{activeCount}</p>
          <p className="text-xs text-slate-400">Activos</p>
        </div>
        <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
          <p className="text-xs text-slate-400">Pendientes</p>
        </div>
        <div className="p-3 bg-purple-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-purple-400">{customCount}</p>
          <p className="text-xs text-slate-400">Custom</p>
        </div>
      </div>

      {/* Domains List */}
      <div className="grid grid-cols-2 gap-3">
        {domains.map(domain => (
          <NeuromorphicCard 
            key={domain.id}
            variant="embossed" 
            className={`p-4 cursor-pointer ${selectedDomain?.id === domain.id ? 'ring-1 ring-blue-500/50' : ''}`}
            onClick={() => setSelectedDomain(domain)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(domain.status)}
                <span className="text-white font-medium">{domain.domain}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  domain.type === 'primary' ? 'bg-purple-500/20 text-purple-400' :
                  domain.type === 'alias' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-cyan-500/20 text-cyan-400'
                }`}>
                  {domain.type}
                </span>
                {domain.ssl && (
                  <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">SSL</span>
                )}
              </div>
            </div>

            {domain.tenantName && (
              <p className="text-xs text-slate-400 mb-2">Tenant: {domain.tenantName}</p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Creado: {domain.createdAt.toLocaleDateString()}
              </span>
              <div className="flex items-center gap-1">
                {!domain.verified && (
                  <button onClick={(e) => { e.stopPropagation(); verifyDomain(domain.id); }} className="text-xs text-yellow-400 hover:underline">
                    Verificar
                  </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); window.open(`https://${domain.domain}`, '_blank'); }} className="p-1 hover:bg-slate-700 rounded">
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>
                {domain.type === 'custom' && (
                  <button onClick={(e) => { e.stopPropagation(); deleteDomain(domain.id); }} className="p-1 hover:bg-slate-700 rounded">
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                )}
              </div>
            </div>
          </NeuromorphicCard>
        ))}
      </div>

      {/* DNS Records */}
      {selectedDomain && (
        <NeuromorphicCard variant="embossed" className="p-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            DNS Records: {selectedDomain.domain}
          </h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-left">
                <th className="pb-2">Tipo</th>
                <th className="pb-2">Nombre</th>
                <th className="pb-2">Valor</th>
                <th className="pb-2">TTL</th>
                <th className="pb-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {selectedDomain.dnsRecords.map((record, i) => (
                <tr key={i} className="border-t border-slate-800">
                  <td className="py-2 font-mono text-cyan-400">{record.type}</td>
                  <td className="py-2 text-white">{record.name}</td>
                  <td className="py-2 text-slate-300 font-mono text-xs">{record.value}</td>
                  <td className="py-2 text-slate-400">{record.ttl}s</td>
                  <td className="py-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      record.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </NeuromorphicCard>
      )}
    </div>
  )
}

export default DomainManager
