'use client'

/**
 * ðŸ—„ï¸ SILEXAR PULSE - Database Health Monitor
 * Monitoreo de bases de datos
 * 
 * @description Database Monitoring:
 * - Queries lentas
 * - Conexiones activas
 * - Replication status
 * - Performance metrics
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
  RefreshCw,
  Clock
} from 'lucide-react'

interface DatabaseInstance {
  id: string
  name: string
  type: 'postgresql' | 'redis' | 'elasticsearch' | 'mongodb'
  role: 'primary' | 'replica' | 'standalone'
  status: 'healthy' | 'warning' | 'critical'
  connections: { active: number; max: number }
  queryTime: number
  replicationLag?: number
  storage: { used: number; total: number }
  uptime: number
  qps: number
}

interface SlowQuery {
  query: string
  duration: number
  table: string
  timestamp: Date
  count: number
}

export function DatabaseHealth() {
  const [databases, setDatabases] = useState<DatabaseInstance[]>([])
  const [slowQueries, setSlowQueries] = useState<SlowQuery[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDatabaseData()
    const interval = setInterval(loadDatabaseData, 5000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadDatabaseData = async () => {
    if (databases.length === 0) {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setDatabases([
      { id: 'db_001', name: 'postgres-primary', type: 'postgresql', role: 'primary', status: 'healthy', connections: { active: 45, max: 200 }, queryTime: 8, storage: { used: 156, total: 500 }, uptime: 99.999, qps: 1250 },
      { id: 'db_002', name: 'postgres-replica-1', type: 'postgresql', role: 'replica', status: 'healthy', connections: { active: 28, max: 200 }, queryTime: 12, replicationLag: 0.5, storage: { used: 152, total: 500 }, uptime: 99.99, qps: 890 },
      { id: 'db_003', name: 'postgres-replica-2', type: 'postgresql', role: 'replica', status: 'warning', connections: { active: 35, max: 200 }, queryTime: 18, replicationLag: 2.3, storage: { used: 154, total: 500 }, uptime: 99.95, qps: 720 },
      { id: 'db_004', name: 'redis-cluster', type: 'redis', role: 'standalone', status: 'healthy', connections: { active: 120, max: 1000 }, queryTime: 0.5, storage: { used: 8, total: 64 }, uptime: 99.999, qps: 45000 },
      { id: 'db_005', name: 'elasticsearch', type: 'elasticsearch', role: 'standalone', status: 'healthy', connections: { active: 15, max: 100 }, queryTime: 25, storage: { used: 78, total: 200 }, uptime: 99.98, qps: 350 }
    ])

    setSlowQueries([
      { query: 'SELECT * FROM campaigns WHERE status = active', duration: 2500, table: 'campaigns', timestamp: new Date(Date.now() - 5 * 60 * 1000), count: 147 },
      { query: 'SELECT COUNT(*) FROM events GROUP BY tenant_id', duration: 1800, table: 'events', timestamp: new Date(Date.now() - 15 * 60 * 1000), count: 23 },
      { query: 'UPDATE users SET last_login = NOW()', duration: 1200, table: 'users', timestamp: new Date(Date.now() - 30 * 60 * 1000), count: 12 }
    ])

    setIsLoading(false)
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'warning': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'critical': return 'bg-[#6888ff]/20 text-[#6888ff]'
      default: return 'bg-slate-500/20 text-[#9aa3b8]'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'postgresql': return 'ðŸ˜'
      case 'redis': return 'š¡'
      case 'elasticsearch': return 'ðŸ”'
      case 'mongodb': return 'ðŸƒ'
      default: return 'ðŸ’¾'
    }
  }

  const totalQPS = databases.reduce((sum, d) => sum + d.qps, 0)
  const totalConnections = databases.reduce((sum, d) => sum + d.connections.active, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6888ff]/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Conectando a Databases...</p>
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
          Database Health Monitor
          <span className="text-xs px-2 py-0.5 bg-[#6888ff]/20 text-[#6888ff] rounded">LIVE</span>
        </h3>
        <NeuButton variant="secondary" onClick={loadDatabaseData}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </NeuButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        <div className="p-3 bg-[#dfeaff]/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#69738c]">{databases.length}</p>
          <p className="text-xs text-[#9aa3b8]">Instancias</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">
            {databases.filter(d => d.status === 'healthy').length}
          </p>
          <p className="text-xs text-[#9aa3b8]">Healthy</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{totalConnections}</p>
          <p className="text-xs text-[#9aa3b8]">Conexiones</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{(totalQPS / 1000).toFixed(1)}K</p>
          <p className="text-xs text-[#9aa3b8]">QPS Total</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{slowQueries.length}</p>
          <p className="text-xs text-[#9aa3b8]">Slow Queries</p>
        </div>
      </div>

      {/* Databases Grid */}
      <div className="grid grid-cols-2 gap-3">
        {databases.map(db => (
          <NeuCard key={db.id} style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getTypeIcon(db.type)}</span>
                <div>
                  <span className="text-[#69738c] font-medium">{db.name}</span>
                  <p className="text-xs text-[#9aa3b8] capitalize">{db.role}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${getStatusStyle(db.status)}`}>
                {db.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center">
                <p className="text-lg font-bold text-[#69738c]">{db.connections.active}</p>
                <p className="text-xs text-[#9aa3b8]">Conexiones</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[#6888ff]">{db.queryTime}ms</p>
                <p className="text-xs text-[#9aa3b8]">Latencia</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[#6888ff]">{db.qps}</p>
                <p className="text-xs text-[#9aa3b8]">QPS</p>
              </div>
            </div>

            {db.replicationLag !== undefined && (
              <div className={`p-2 rounded text-center text-xs ${db.replicationLag > 1 ? 'bg-[#6888ff]/10 text-[#6888ff]' : 'bg-[#6888ff]/10 text-[#6888ff]'
                }`}>
                Replication Lag: {db.replicationLag}s
              </div>
            )}

            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#9aa3b8]">Storage</span>
                <span className="text-[#69738c]">{db.storage.used}GB / {db.storage.total}GB</span>
              </div>
              <div className="w-full bg-[#dfeaff] rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${(db.storage.used / db.storage.total) > 0.8 ? 'bg-[#6888ff]' : 'bg-[#6888ff]'
                    }`}
                  style={{ width: `${(db.storage.used / db.storage.total) * 100}%` }}
                />
              </div>
            </div>
          </NeuCard>
        ))}
      </div>

      {/* Slow Queries */}
      {slowQueries.length > 0 && (
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
          <h4 className="text-[#69738c] font-medium mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#6888ff]" />
            Slow Queries ({'>'}1000ms)
          </h4>
          <div className="space-y-2">
            {slowQueries.map((sq, i) => (
              <div key={sq.query} className="p-3 bg-[#6888ff]/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <code className="text-sm text-[#6888ff] truncate max-w-[70%]">{sq.query}</code>
                  <span className="text-[#6888ff] font-bold">{sq.duration}ms</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#9aa3b8]">
                  <span>Table: {sq.table}</span>
                  <span>Llamadas: {sq.count}x</span>
                  <span>{sq.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </NeuCard>
      )}
    </div>
  )
}

export default DatabaseHealth