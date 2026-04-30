'use client'

/**
 * ðŸŒ SILEXAR PULSE - Domain Manager
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
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
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
  status: 'active' | 'Pendiente' | 'Fallido' | 'verifying'
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
  status: 'active' | 'Pendiente'
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
        status: 'Pendiente',
        tenantId: 'tenant_002',
        tenantName: 'Grupo Prisa',
        ssl: false,
        verified: false,
        createdAt: new Date('2024-12-01'),
        dnsRecords: [
          { type: 'CNAME', name: 'ads', value: 'app.silexarpulse.com', ttl: 3600, status: 'Pendiente' }
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
      case 'active': return <CheckCircle className="w-4 h-4 text-[#6888ff]" />
      case 'Pendiente': return <Clock className="w-4 h-4 text-[#6888ff]" />
      case 'verifying': return <RefreshCw className="w-4 h-4 text-[#6888ff] animate-spin" />
      case 'Fallido': return <XCircle className="w-4 h-4 text-[#6888ff]" />
      default: return <Clock className="w-4 h-4 text-[#9aa3b8]" />
    }
  }

  const activeCount = domains.filter(d => d.status === 'active').length
  const pendingCount = domains.filter(d => d.status === 'Pendiente' || d.status === 'verifying').length
  const customCount = domains.filter(d => d.type === 'custom').length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6888ff]/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando Domain Manager...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#6888ff]" />
          Domain Manager
        </h3>
        <div className="flex items-center gap-2">
          <NeuButton variant="secondary" onClick={loadDomains}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </NeuButton>
          <NeuButton variant="primary">
            <Plus className="w-4 h-4 mr-1" />
            Add Domain
          </NeuButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-[#dfeaff]/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#69738c]">{domains.length}</p>
          <p className="text-xs text-[#9aa3b8]">Total</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{activeCount}</p>
          <p className="text-xs text-[#9aa3b8]">Activos</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{pendingCount}</p>
          <p className="text-xs text-[#9aa3b8]">Pendientes</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{customCount}</p>
          <p className="text-xs text-[#9aa3b8]">Custom</p>
        </div>
      </div>

      {/* Domains List */}
      <div className="grid grid-cols-2 gap-3">
        {domains.map(domain => (
          <NeuCard
            key={domain.id}
            style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(domain.status)}
                <span className="text-[#69738c] font-medium">{domain.domain}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${domain.type === 'primary' ? 'bg-[#6888ff]/20 text-[#6888ff]' :
                  domain.type === 'alias' ? 'bg-[#6888ff]/20 text-[#6888ff]' :
                    'bg-[#6888ff]/20 text-[#6888ff]'
                  }`}>
                  {domain.type}
                </span>
                {domain.ssl && (
                  <span className="text-xs px-2 py-0.5 bg-[#6888ff]/20 text-[#6888ff] rounded">SSL</span>
                )}
              </div>
            </div>

            {domain.tenantName && (
              <p className="text-xs text-[#9aa3b8] mb-2">Tenant: {domain.tenantName}</p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9aa3b8]">
                Creado: {domain.createdAt.toLocaleDateString()}
              </span>
              <div className="flex items-center gap-1">
                {!domain.verified && (
                  <button onClick={(e) => { e.stopPropagation(); verifyDomain(domain.id); }} className="text-xs text-[#6888ff] hover:underline">
                    Verificar
                  </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); window.open(`https://${domain.domain}`, '_blank'); }} className="p-1 hover:bg-[#dfeaff] rounded">
                  <ExternalLink className="w-3 h-3 text-[#9aa3b8]" />
                </button>
                {domain.type === 'custom' && (
                  <button onClick={(e) => { e.stopPropagation(); deleteDomain(domain.id); }} className="p-1 hover:bg-[#dfeaff] rounded">
                    <Trash2 className="w-3 h-3 text-[#6888ff]" />
                  </button>
                )}
              </div>
            </div>
          </NeuCard>
        ))}
      </div>

      {/* DNS Records */}
      {selectedDomain && (
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
          <h4 className="text-[#69738c] font-medium mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#9aa3b8]" />
            DNS Records: {selectedDomain.domain}
          </h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#9aa3b8] text-left">
                <th className="pb-2">Tipo</th>
                <th className="pb-2">Nombre</th>
                <th className="pb-2">Valor</th>
                <th className="pb-2">TTL</th>
                <th className="pb-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {selectedDomain.dnsRecords.map((record, i) => (
                <tr key={record.name} className="border-t border-slate-800">
                  <td className="py-2 font-mono text-[#6888ff]">{record.type}</td>
                  <td className="py-2 text-[#69738c]">{record.name}</td>
                  <td className="py-2 text-[#69738c] font-mono text-xs">{record.value}</td>
                  <td className="py-2 text-[#9aa3b8]">{record.ttl}s</td>
                  <td className="py-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${record.status === 'active' ? 'bg-[#6888ff]/20 text-[#6888ff]' : 'bg-[#6888ff]/20 text-[#6888ff]'
                      }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </NeuCard>
      )}
    </div>
  )
}

export default DomainManager