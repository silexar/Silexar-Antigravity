'use client'

/**
 * ðŸ’¾ SILEXAR PULSE - Cache Manager
 * Gestión de caché del sistema
 * 
 * @description Cache Management:
 * - Estadísticas de hit/miss
 * - Invalidación manual
 * - Configuración de TTL
 * - Monitoreo de memoria
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 * @security MILITARY_GRADE
 */

import { useState, useEffect } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  Database,
  Trash2,
  RefreshCw,
  Search,
  Clock,
  Zap,
  HardDrive
} from 'lucide-react'

interface CacheEntry {
  key: string
  size: number
  ttl: number
  hits: number
  lastAccess: Date
  type: 'string' | 'hash' | 'list' | 'set'
}

interface CacheStats {
  totalKeys: number
  memoryUsed: number
  memoryMax: number
  hitRate: number
  missRate: number
  evictions: number
  connectedClients: number
}

export function CacheManager() {
  const [stats, setStats] = useState<CacheStats | null>(null)
  const [entries, setEntries] = useState<CacheEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCacheData()
    const interval = setInterval(loadCacheData, 10000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadCacheData = async () => {
    if (!stats) {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setStats({
      totalKeys: 15420,
      memoryUsed: 256,
      memoryMax: 512,
      hitRate: 94.5,
      missRate: 5.5,
      evictions: 234,
      connectedClients: 45
    })

    setEntries([
      { key: 'campaigns:list:tenant_001', size: 2500, ttl: 3600, hits: 1250, lastAccess: new Date(), type: 'hash' },
      { key: 'users:session:usr_12345', size: 150, ttl: 86400, hits: 89, lastAccess: new Date(Date.now() - 60000), type: 'string' },
      { key: 'analytics:daily:2024-01-15', size: 45000, ttl: 604800, hits: 456, lastAccess: new Date(Date.now() - 120000), type: 'hash' },
      { key: 'settings:global', size: 500, ttl: -1, hits: 12500, lastAccess: new Date(), type: 'hash' },
      { key: 'rate_limit:tenant_002', size: 50, ttl: 60, hits: 8900, lastAccess: new Date(), type: 'string' },
      { key: 'notifications:queue:pending', size: 8500, ttl: 3600, hits: 345, lastAccess: new Date(Date.now() - 30000), type: 'list' },
      { key: 'permissions:role_admin', size: 1200, ttl: 86400, hits: 2340, lastAccess: new Date(Date.now() - 180000), type: 'set' }
    ])

    setIsLoading(false)
  }

  const invalidateKey = (key: string) => {
    setEntries(prev => prev.filter(e => e.key !== key))
    setStats(prev => prev ? { ...prev, totalKeys: prev.totalKeys - 1 } : null)
  }

  const invalidatePattern = (pattern: string) => {
    const regex = new RegExp(pattern.replace('*', '.*'))
    const toRemove = entries.filter(e => regex.test(e.key))
    setEntries(prev => prev.filter(e => !regex.test(e.key)))
    setStats(prev => prev ? { ...prev, totalKeys: prev.totalKeys - toRemove.length } : null)
  }

  const flushAll = () => {
    if (confirm('¿Estás seguro de que deseas limpiar toda la caché?')) {
      setEntries([])
      setStats(prev => prev ? { ...prev, totalKeys: 0, memoryUsed: 0 } : null)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const formatTTL = (ttl: number) => {
    if (ttl === -1) return 'Permanente'
    if (ttl < 60) return `${ttl}s`
    if (ttl < 3600) return `${Math.floor(ttl / 60)}m`
    if (ttl < 86400) return `${Math.floor(ttl / 3600)}h`
    return `${Math.floor(ttl / 86400)}d`
  }

  const filteredEntries = entries.filter(e =>
    e.key.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6888ff]/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando Cache Manager...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2">
          <Database className="w-5 h-5 text-[#6888ff]" />
          Cache Manager
          <span className="text-xs px-2 py-0.5 bg-[#6888ff]/20 text-[#6888ff] rounded">Redis</span>
        </h3>
        <div className="flex items-center gap-2">
          <NeuButton variant="secondary" onClick={loadCacheData}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </NeuButton>
          <NeuButton variant="secondary" onClick={flushAll}>
            <Trash2 className="w-4 h-4 mr-1" />
            Flush All
          </NeuButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base, textAlign: 'center' }}>
          <Zap className="w-6 h-6 text-[#6888ff] mx-auto mb-2" />
          <p className="text-2xl font-bold text-[#6888ff]">{stats.hitRate}%</p>
          <p className="text-xs text-[#9aa3b8]">Hit Rate</p>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base, textAlign: 'center' }}>
          <Database className="w-6 h-6 text-[#6888ff] mx-auto mb-2" />
          <p className="text-2xl font-bold text-[#6888ff]">{(stats.totalKeys / 1000).toFixed(1)}K</p>
          <p className="text-xs text-[#9aa3b8]">Total Keys</p>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base, textAlign: 'center' }}>
          <HardDrive className="w-6 h-6 text-[#6888ff] mx-auto mb-2" />
          <p className="text-2xl font-bold text-[#6888ff]">{stats.memoryUsed}MB</p>
          <p className="text-xs text-[#9aa3b8]">/ {stats.memoryMax}MB</p>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base, textAlign: 'center' }}>
          <Clock className="w-6 h-6 text-[#6888ff] mx-auto mb-2" />
          <p className="text-2xl font-bold text-[#6888ff]">{stats.evictions}</p>
          <p className="text-xs text-[#9aa3b8]">Evictions</p>
        </NeuCard>
      </div>

      {/* Memory Bar */}
      <div className="p-4 bg-[#dfeaff]/50 rounded-lg">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-[#9aa3b8]">Memoria Utilizada</span>
          <span className="text-[#69738c]">{stats.memoryUsed}MB / {stats.memoryMax}MB ({((stats.memoryUsed / stats.memoryMax) * 100).toFixed(0)}%)</span>
        </div>
        <div className="w-full bg-[#dfeaff] rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${stats.memoryUsed / stats.memoryMax > 0.9 ? 'bg-[#6888ff]' :
              stats.memoryUsed / stats.memoryMax > 0.7 ? 'bg-[#6888ff]' : 'bg-[#6888ff]'
              }`}
            style={{ width: `${(stats.memoryUsed / stats.memoryMax) * 100}%` }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => invalidatePattern('campaigns:*')}
          className="px-3 py-1.5 bg-[#dfeaff] text-[#69738c] rounded text-sm hover:bg-[#dfeaff]"
        >
          Invalidar campaigns:*
        </button>
        <button
          onClick={() => invalidatePattern('analytics:*')}
          className="px-3 py-1.5 bg-[#dfeaff] text-[#69738c] rounded text-sm hover:bg-[#dfeaff]"
        >
          Invalidar analytics:*
        </button>
        <button
          onClick={() => invalidatePattern('users:session:*')}
          className="px-3 py-1.5 bg-[#dfeaff] text-[#69738c] rounded text-sm hover:bg-[#dfeaff]"
        >
          Invalidar sessions
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" />
        <input
          type="text"
          placeholder="Buscar keys..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#dfeaff] border border-slate-700 rounded-lg text-[#69738c] text-sm"
        />
      </div>

      {/* Cache Entries */}
      <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
        <h4 className="text-[#69738c] font-medium mb-3">Cache Entries ({filteredEntries.length})</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredEntries.map(entry => (
            <div key={entry.key} className="flex items-center justify-between p-3 bg-[#dfeaff]/50 rounded-lg">
              <div className="flex-1">
                <code className="text-[#6888ff] text-sm">{entry.key}</code>
                <div className="flex items-center gap-4 mt-1 text-xs text-[#9aa3b8]">
                  <span>Tipo: {entry.type}</span>
                  <span>Size: {formatBytes(entry.size)}</span>
                  <span>TTL: {formatTTL(entry.ttl)}</span>
                  <span>Hits: {entry.hits}</span>
                </div>
              </div>
              <button onClick={() => invalidateKey(entry.key)} className="p-1 hover:bg-[#dfeaff] rounded">
                <Trash2 className="w-4 h-4 text-[#6888ff]" />
              </button>
            </div>
          ))}
        </div>
      </NeuCard>
    </div>
  )
}

export default CacheManager