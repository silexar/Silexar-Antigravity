'use client'

/**
 * ðŸ”‘ SILEXAR PULSE - API Keys Manager
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
 * @last_modified 2025-04-28 - Migrated to AdminDesignSystem pattern
 */

import { useState, useEffect } from 'react'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import { N, getShadow, getSmallShadow } from '@/components/admin/_sdk/AdminDesignSystem'
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
        permissions: ['read', 'write', 'Eliminar'],
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
        permissions: ['read', 'write', 'Eliminar'],
        usage: { requests: 12000, limit: 50000 }
      }
    ])

    setIsLoading(false)
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return { background: `${N.accent}20`, color: N.accent }
      case 'expired': return { background: `${N.accent}20`, color: N.accent }
      case 'revoked': return { background: `${N.dark}20`, color: N.textSub }
      default: return { background: `${N.dark}20`, color: N.textSub }
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid ${N.dark}30',
            borderTopColor: N.accent,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: N.textSub }}>Cargando API Keys...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Key style={{ width: 20, height: 20, color: N.accent }} />
          API Keys Manager
        </h3>
        <NeuButton variant="primary">
          <Plus style={{ width: 16, height: 16, marginRight: 4 }} />
          Crear Nueva Key
        </NeuButton>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        <div style={{ padding: '12px', background: `${N.accent}10`, borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ color: N.accent, fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{activeKeys}</p>
          <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Keys Activas</p>
        </div>
        <div style={{ padding: '12px', background: `${N.dark}30`, borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ color: N.text, fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{keys.length}</p>
          <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Total Keys</p>
        </div>
        <div style={{ padding: '12px', background: `${N.accent}10`, borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ color: N.accent, fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{expiringKeys.length}</p>
          <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Por Expirar</p>
        </div>
      </div>

      {/* Expiring Warning */}
      {expiringKeys.length > 0 && (
        <div style={{ padding: '1rem', background: `${N.accent}10`, border: `1px solid ${N.accent}30`, borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertTriangle style={{ width: 20, height: 20, color: N.accent }} />
            <span style={{ color: N.accent, fontWeight: 500 }}>Keys por expirar</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {expiringKeys.map(key => (
              <p key={key.id} style={{ color: N.text, fontSize: '0.875rem' }}>
                {key.name} expira en {Math.ceil((key.expiresAt!.getTime() - Date.now()) / (24 * 60 * 60 * 1000))} días
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Keys List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {keys.map(key => (
          <NeuCard key={key.id} style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Shield style={{ width: 20, height: 20, color: key.status === 'active' ? N.accent : N.textSub }} />
                <div>
                  <span style={{ color: N.text, fontWeight: 500 }}>{key.name}</span>
                  {key.tenant && (
                    <span style={{ fontSize: '0.75rem', marginLeft: '8px', padding: '2px 8px', background: `${N.dark}50`, color: N.textSub, borderRadius: '4px' }}>
                      {key.tenant}
                    </span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <code style={{ color: N.textSub, fontSize: '0.75rem' }}>{key.keyPrefix}</code>
                    <button onClick={() => copyKey(key.id)} style={{ background: 'none', border: 'none', color: N.textSub, cursor: 'pointer' }} aria-label="Copiar">
                      <Copy style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', ...getStatusStyle(key.status) }}>
                {key.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '12px' }}>
              <div>
                <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Permisos</p>
                <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                  {key.permissions.map(p => (
                    <span key={p} style={{ fontSize: '0.75rem', padding: '2px 6px', background: `${N.dark}50`, color: N.textSub, borderRadius: '4px', textTransform: 'capitalize' }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Uso</p>
                <p style={{ color: N.text, fontSize: '0.875rem' }}>
                  {(key.usage.requests / 1000).toFixed(0)}K / {(key.usage.limit / 1000).toFixed(0)}K
                </p>
              </div>
              <div>
                <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Ášltimo uso</p>
                <p style={{ color: N.text, fontSize: '0.875rem' }}>
                  {key.lastUsed ? key.lastUsed.toLocaleDateString() : 'Nunca'}
                </p>
              </div>
              <div>
                <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Expira</p>
                <p style={{
                  fontSize: '0.875rem',
                  color: key.expiresAt && key.expiresAt.getTime() < Date.now() + 7 * 24 * 60 * 60 * 1000
                    ? N.accent : N.text
                }}>
                  {key.expiresAt ? key.expiresAt.toLocaleDateString() : 'Nunca'}
                </p>
              </div>
            </div>

            {key.status === 'active' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <NeuButton variant="secondary" onClick={() => rotateKey(key.id)}>
                  <RefreshCw style={{ width: 12, height: 12, marginRight: 4 }} />
                  Rotar
                </NeuButton>
                <NeuButton variant="secondary" onClick={() => revokeKey(key.id)}>
                  <Trash2 style={{ width: 12, height: 12, marginRight: 4 }} />
                  Revocar
                </NeuButton>
              </div>
            )}
          </NeuCard>
        ))}
      </div>
    </div>
  )
}

export default APIKeysManager
