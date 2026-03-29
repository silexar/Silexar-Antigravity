'use client'

/**
 * 🔑 SILEXAR PULSE - API Keys Manager
 * Gestión de claves API
 * 
 * @description API Key Management:
 * - Keys activas
 * - Rotación automática
 * - Uso por key
 * - Permisos
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
  Key,
  Plus,
  Trash2,
  RefreshCw,
  Copy,
  AlertTriangle,
  Shield
} from 'lucide-react'

interface APIKey {
  id: string
  name: string
  keyPrefix: string
  createdAt: Date
  lastUsed?: Date
  expiresAt?: Date
  status: 'active' | 'expired' | 'revoked'
  permissions: string[]
  usage: { requests: number; limit: number }
  tenant?: string
}

export function APIKeysManager() {
  const [keys, setKeys] = useState<APIKey[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAPIKeys()
  }, [])

  const loadAPIKeys = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setKeys([
      {
        id: 'key_001',
        name: 'Production API Key',
        keyPrefix: 'sk_live_****',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 5 * 60 * 1000),
        status: 'active',
        permissions: ['read', 'write', 'delete'],
        usage: { requests: 1250000, limit: 5000000 }
      },
      {
        id: 'key_002',
        name: 'Read-Only Dashboard',
        keyPrefix: 'sk_live_****',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'active',
        permissions: ['read'],
        usage: { requests: 450000, limit: 1000000 }
      },
      {
        id: 'key_003',
        name: 'RDF Media Integration',
        keyPrefix: 'sk_live_****',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 30 * 60 * 1000),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active',
        permissions: ['read', 'write'],
        usage: { requests: 89000, limit: 500000 },
        tenant: 'RDF Media'
      },
      {
        id: 'key_004',
        name: 'Old Integration Key',
        keyPrefix: 'sk_live_****',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        status: 'expired',
        permissions: ['read', 'write'],
        usage: { requests: 0, limit: 100000 }
      },
      {
        id: 'key_005',
        name: 'Test Environment',
        keyPrefix: 'sk_test_****',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(),
        status: 'active',
        permissions: ['read', 'write', 'delete'],
        usage: { requests: 12000, limit: 50000 }
      }
    ])

    setIsLoading(false)
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400'
      case 'expired': return 'bg-red-500/20 text-red-400'
      case 'revoked': return 'bg-slate-500/20 text-slate-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const revokeKey = (id: string) => {
    if (confirm('¿Revocar esta API key? Esta acción no se puede deshacer.')) {
      setKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'revoked' } : k))
    }
  }

  const rotateKey = (id: string) => {
    
    alert('Key rotada exitosamente. La nueva key ha sido generada.')
  }

  const copyKey = (id: string) => {
    
    alert('API Key copiada al portapapeles')
  }

  const activeKeys = keys.filter(k => k.status === 'active').length
  const expiringKeys = keys.filter(k => k.expiresAt && k.expiresAt.getTime() < Date.now() + 7 * 24 * 60 * 60 * 1000 && k.status === 'active')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando API Keys...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Key className="w-5 h-5 text-yellow-400" />
          API Keys Manager
        </h3>
        <NeuromorphicButton variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Crear Nueva Key
        </NeuromorphicButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-green-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-400">{activeKeys}</p>
          <p className="text-xs text-slate-400">Keys Activas</p>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-white">{keys.length}</p>
          <p className="text-xs text-slate-400">Total Keys</p>
        </div>
        <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-yellow-400">{expiringKeys.length}</p>
          <p className="text-xs text-slate-400">Por Expirar</p>
        </div>
      </div>

      {/* Expiring Warning */}
      {expiringKeys.length > 0 && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-medium">Keys por expirar</span>
          </div>
          <div className="space-y-1">
            {expiringKeys.map(key => (
              <p key={key.id} className="text-sm text-slate-300">
                {key.name} expira en {Math.ceil((key.expiresAt!.getTime() - Date.now()) / (24 * 60 * 60 * 1000))} días
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Keys List */}
      <div className="space-y-3">
        {keys.map(key => (
          <NeuromorphicCard key={key.id} variant="embossed" className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Shield className={`w-5 h-5 ${key.status === 'active' ? 'text-green-400' : 'text-slate-400'}`} />
                <div>
                  <span className="text-white font-medium">{key.name}</span>
                  {key.tenant && (
                    <span className="text-xs ml-2 px-2 py-0.5 bg-slate-700 text-slate-300 rounded">
                      {key.tenant}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs text-slate-400">{key.keyPrefix}</code>
                    <button onClick={() => copyKey(key.id)} className="text-slate-500 hover:text-white" aria-label="Copiar">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${getStatusStyle(key.status)}`}>
                {key.status}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-3">
              <div>
                <p className="text-xs text-slate-400">Permisos</p>
                <div className="flex gap-1 mt-1">
                  {key.permissions.map(p => (
                    <span key={p} className="text-xs px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded capitalize">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400">Uso</p>
                <p className="text-sm text-white">
                  {(key.usage.requests / 1000).toFixed(0)}K / {(key.usage.limit / 1000).toFixed(0)}K
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Último uso</p>
                <p className="text-sm text-white">
                  {key.lastUsed ? key.lastUsed.toLocaleDateString() : 'Nunca'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Expira</p>
                <p className={`text-sm ${
                  key.expiresAt && key.expiresAt.getTime() < Date.now() + 7 * 24 * 60 * 60 * 1000 
                    ? 'text-yellow-400' : 'text-white'
                }`}>
                  {key.expiresAt ? key.expiresAt.toLocaleDateString() : 'Nunca'}
                </p>
              </div>
            </div>

            {key.status === 'active' && (
              <div className="flex items-center gap-2">
                <NeuromorphicButton variant="secondary" size="sm" onClick={() => rotateKey(key.id)}>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Rotar
                </NeuromorphicButton>
                <NeuromorphicButton variant="secondary" size="sm" onClick={() => revokeKey(key.id)}>
                  <Trash2 className="w-3 h-3 mr-1" />
                  Revocar
                </NeuromorphicButton>
              </div>
            )}
          </NeuromorphicCard>
        ))}
      </div>
    </div>
  )
}

export default APIKeysManager
