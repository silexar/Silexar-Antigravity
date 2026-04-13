'use client'

/**
 * 🔑 SILEXAR PULSE - API Access (Client)
 * Gestión de API Keys para clientes
 * 
 * @description API Access:
 * - Generar API Keys
 * - Documentación
 * - Rate limits
 * - Logs de uso
 * 
 * @version 2025.1.0
 * @tier CLIENT_ADMIN
 */

import { useState, useEffect } from 'react'
import { 
  NeuromorphicCard, 
  NeuromorphicButton 
} from '@/components/ui/neuromorphic'
import {
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Shield,
  ExternalLink
} from 'lucide-react'

interface APIKey {
  id: string
  name: string
  key: string
  prefix: string
  permissions: string[]
  createdAt: Date
  lastUsed?: Date
  expiresAt?: Date
  status: 'active' | 'expired' | 'revoked'
  usageCount: number
  rateLimit: number
}

export function ClientAPIAccess() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewKeyForm, setShowNewKeyForm] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadKeys()
  }, [])

  const loadKeys = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setApiKeys([
      {
        id: 'key_001',
        name: 'Production API',
        key: 'sk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
        prefix: 'sk_live',
        permissions: ['campaigns:read', 'campaigns:write', 'analytics:read'],
        createdAt: new Date('2024-06-15'),
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'active',
        usageCount: 15420,
        rateLimit: 1000
      },
      {
        id: 'key_002',
        name: 'Development API',
        key: 'sk_test_q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6',
        prefix: 'sk_test',
        permissions: ['campaigns:read', 'analytics:read'],
        createdAt: new Date('2024-09-01'),
        lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'active',
        usageCount: 3250,
        rateLimit: 100
      },
      {
        id: 'key_003',
        name: 'Old Integration',
        key: 'sk_live_z1x2c3v4b5n6m7k8j9h0g1f2d3s4a5q6',
        prefix: 'sk_live',
        permissions: ['campaigns:read'],
        createdAt: new Date('2024-01-10'),
        expiresAt: new Date('2024-12-31'),
        status: 'expired',
        usageCount: 8900,
        rateLimit: 500
      }
    ])

    setIsLoading(false)
  }

  const createKey = () => {
    if (!newKeyName.trim()) return
    
    const newKey: APIKey = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      key: `sk_live_${Math.random().toString(36).substr(2, 32)}`,
      prefix: 'sk_live',
      permissions: ['campaigns:read', 'analytics:read'],
      createdAt: new Date(),
      status: 'active',
      usageCount: 0,
      rateLimit: 1000
    }
    
    setApiKeys(prev => [newKey, ...prev])
    setNewKeyName('')
    setShowNewKeyForm(false)
    setVisibleKeys(prev => new Set([...prev, newKey.id]))
  }

  const revokeKey = (id: string) => {
    if (confirm('¿Revocar esta API Key? No podrás deshacer esta acción.')) {
      setApiKeys(prev => prev.map(k => 
        k.id === id ? { ...k, status: 'revoked' as const } : k
      ))
    }
  }

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    alert('API Key copiada al portapapeles')
  }

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400'
      case 'expired': return 'bg-yellow-500/20 text-yellow-400'
      case 'revoked': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const activeKeys = apiKeys.filter(k => k.status === 'active')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando API Access...</p>
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
          API Access
        </h3>
        <div className="flex items-center gap-2">
          <NeuromorphicButton variant="secondary" size="sm">
            <ExternalLink className="w-4 h-4 mr-1" />
            Docs
          </NeuromorphicButton>
          <NeuromorphicButton variant="primary" size="sm" onClick={() => setShowNewKeyForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            New API Key
          </NeuromorphicButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-white">{apiKeys.length}</p>
          <p className="text-xs text-slate-400">Total Keys</p>
        </div>
        <div className="p-3 bg-green-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-400">{activeKeys.length}</p>
          <p className="text-xs text-slate-400">Active</p>
        </div>
        <div className="p-3 bg-blue-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-400">{apiKeys.reduce((sum, k) => sum + k.usageCount, 0).toLocaleString()}</p>
          <p className="text-xs text-slate-400">Total Requests</p>
        </div>
        <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
          <Shield className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
          <p className="text-xs text-slate-400">Secured</p>
        </div>
      </div>

      {/* New Key Form */}
      {showNewKeyForm && (
        <NeuromorphicCard variant="glow" className="p-4">
          <h4 className="text-white font-medium mb-3">Create New API Key</h4>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Key Name (e.g., Production, Mobile App)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
            />
            <NeuromorphicButton variant="primary" size="sm" onClick={createKey}>
              Create
            </NeuromorphicButton>
            <NeuromorphicButton variant="secondary" size="sm" onClick={() => setShowNewKeyForm(false)}>
              Cancel
            </NeuromorphicButton>
          </div>
          <p className="text-xs text-slate-500 mt-2">La API Key solo será visible una vez. Guárdala en un lugar seguro.</p>
        </NeuromorphicCard>
      )}

      {/* API Keys List */}
      <NeuromorphicCard variant="embossed" className="p-4">
        <h4 className="text-white font-medium mb-3">API Keys</h4>
        <div className="space-y-3">
          {apiKeys.map(apiKey => (
            <div key={apiKey.id} className="p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-yellow-400" />
                  <div>
                    <span className="text-white font-medium">{apiKey.name}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded ${getStatusStyle(apiKey.status)}`}>
                      {apiKey.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {apiKey.status === 'active' && (
                    <button 
                      onClick={() => revokeKey(apiKey.id)} 
                      className="p-1 hover:bg-slate-700 rounded text-red-400"
                      title="Revoke"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <code className="flex-1 px-3 py-2 bg-[#F0EDE8] rounded font-mono text-sm text-slate-300">
                  {visibleKeys.has(apiKey.id) ? apiKey.key : `${apiKey.prefix}_${'•'.repeat(32)}`}
                </code>
                <button
                  onClick={() => toggleKeyVisibility(apiKey.id)}
                  className="p-2 hover:bg-slate-700 rounded"
                  aria-label={visibleKeys.has(apiKey.id) ? "Ocultar clave" : "Ver clave"}
                >
                  {visibleKeys.has(apiKey.id) ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
                <button onClick={() => copyKey(apiKey.key)} className="p-2 hover:bg-slate-700 rounded" aria-label="Copiar">
                  <Copy className="w-4 h-4 text-blue-400" />
                </button>
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-400">
                <span>Created: {apiKey.createdAt.toLocaleDateString()}</span>
                {apiKey.lastUsed && (
                  <span>Last used: {apiKey.lastUsed.toLocaleDateString()}</span>
                )}
                <span>Requests: {apiKey.usageCount.toLocaleString()}</span>
                <span>Rate limit: {apiKey.rateLimit}/min</span>
              </div>

              <div className="flex flex-wrap gap-1 mt-2">
                {apiKey.permissions.map(perm => (
                  <span key={perm} className="text-xs px-2 py-0.5 bg-slate-700 rounded text-slate-300">
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </NeuromorphicCard>
    </div>
  )
}

export default ClientAPIAccess
