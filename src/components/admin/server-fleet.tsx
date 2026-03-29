'use client'

/**
 * 🖥️ SILEXAR PULSE - Server Fleet Manager
 * Gestión de infraestructura de servidores
 * 
 * @description Fleet Management:
 * - Estado de servidores
 * - Métricas en tiempo real
 * - Containers y VMs
 * - Health monitoring
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
  Server,
  HardDrive,
  Activity,
  RefreshCw,
  Wifi,
  Cloud,
  Terminal
} from 'lucide-react'

interface ServerNode {
  id: string
  name: string
  type: 'web' | 'api' | 'database' | 'cache' | 'worker'
  provider: 'aws' | 'gcp' | 'azure'
  region: string
  status: 'running' | 'warning' | 'critical' | 'stopped'
  cpu: number
  memory: number
  disk: number
  network: { in: number; out: number }
  uptime: number
  containers?: number
  lastHealthCheck: Date
}

export function ServerFleet() {
  const [servers, setServers] = useState<ServerNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedServer, setSelectedServer] = useState<ServerNode | null>(null)

  useEffect(() => {
    loadServerData()
    const interval = setInterval(loadServerData, 5000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadServerData = async () => {
    if (servers.length === 0) {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    const baseServers: ServerNode[] = [
      { id: 'srv_001', name: 'web-prod-01', type: 'web', provider: 'aws', region: 'sa-east-1', status: 'running', cpu: 45, memory: 62, disk: 55, network: { in: 125, out: 340 }, uptime: 99.99, containers: 8, lastHealthCheck: new Date() },
      { id: 'srv_002', name: 'web-prod-02', type: 'web', provider: 'aws', region: 'sa-east-1', status: 'running', cpu: 38, memory: 58, disk: 52, network: { in: 110, out: 290 }, uptime: 99.98, containers: 8, lastHealthCheck: new Date() },
      { id: 'srv_003', name: 'api-prod-01', type: 'api', provider: 'aws', region: 'sa-east-1', status: 'running', cpu: 52, memory: 71, disk: 48, network: { in: 450, out: 890 }, uptime: 99.97, containers: 12, lastHealthCheck: new Date() },
      { id: 'srv_004', name: 'api-prod-02', type: 'api', provider: 'aws', region: 'us-east-1', status: 'running', cpu: 48, memory: 65, disk: 45, network: { in: 380, out: 720 }, uptime: 99.99, containers: 12, lastHealthCheck: new Date() },
      { id: 'srv_005', name: 'db-primary', type: 'database', provider: 'aws', region: 'sa-east-1', status: 'running', cpu: 35, memory: 78, disk: 72, network: { in: 890, out: 450 }, uptime: 99.999, lastHealthCheck: new Date() },
      { id: 'srv_006', name: 'db-replica', type: 'database', provider: 'aws', region: 'us-east-1', status: 'running', cpu: 28, memory: 72, disk: 68, network: { in: 220, out: 180 }, uptime: 99.99, lastHealthCheck: new Date() },
      { id: 'srv_007', name: 'redis-cluster', type: 'cache', provider: 'aws', region: 'sa-east-1', status: 'running', cpu: 18, memory: 45, disk: 22, network: { in: 1200, out: 1150 }, uptime: 99.999, lastHealthCheck: new Date() },
      { id: 'srv_008', name: 'worker-01', type: 'worker', provider: 'aws', region: 'sa-east-1', status: 'warning', cpu: 85, memory: 82, disk: 35, network: { in: 50, out: 120 }, uptime: 99.95, containers: 4, lastHealthCheck: new Date() }
    ]

    // Simular variación en métricas
    setServers(baseServers.map(s => ({
      ...s,
      cpu: Math.min(100, Math.max(10, s.cpu + (Math.random() - 0.5) * 5)),
      memory: Math.min(100, Math.max(20, s.memory + (Math.random() - 0.5) * 3)),
      network: {
        in: Math.max(0, s.network.in + (Math.random() - 0.5) * 20),
        out: Math.max(0, s.network.out + (Math.random() - 0.5) * 30)
      }
    })))

    setIsLoading(false)
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500/20 text-green-400'
      case 'warning': return 'bg-yellow-500/20 text-yellow-400'
      case 'critical': return 'bg-red-500/20 text-red-400'
      case 'stopped': return 'bg-slate-500/20 text-slate-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'web': return <Cloud className="w-4 h-4 text-blue-400" />
      case 'api': return <Activity className="w-4 h-4 text-green-400" />
      case 'database': return <HardDrive className="w-4 h-4 text-purple-400" />
      case 'cache': return <Wifi className="w-4 h-4 text-cyan-400" />
      case 'worker': return <Terminal className="w-4 h-4 text-orange-400" />
      default: return <Server className="w-4 h-4 text-slate-400" />
    }
  }

  const getMetricColor = (value: number) => {
    if (value >= 80) return 'bg-red-500'
    if (value >= 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const totalContainers = servers.reduce((sum, s) => sum + (s.containers || 0), 0)
  const avgCpu = servers.reduce((sum, s) => sum + s.cpu, 0) / servers.length
  const avgMemory = servers.reduce((sum, s) => sum + s.memory, 0) / servers.length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Conectando a Server Fleet...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-green-400" />
          Server Fleet Manager
          <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">LIVE</span>
        </h3>
        <NeuromorphicButton variant="secondary" size="sm" onClick={loadServerData}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </NeuromorphicButton>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-5 gap-3">
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-white">{servers.length}</p>
          <p className="text-xs text-slate-400">Servidores</p>
        </div>
        <div className="p-3 bg-green-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-400">
            {servers.filter(s => s.status === 'running').length}
          </p>
          <p className="text-xs text-slate-400">Running</p>
        </div>
        <div className="p-3 bg-cyan-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-cyan-400">{totalContainers}</p>
          <p className="text-xs text-slate-400">Containers</p>
        </div>
        <div className="p-3 bg-blue-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-400">{avgCpu.toFixed(0)}%</p>
          <p className="text-xs text-slate-400">CPU Promedio</p>
        </div>
        <div className="p-3 bg-purple-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-purple-400">{avgMemory.toFixed(0)}%</p>
          <p className="text-xs text-slate-400">RAM Promedio</p>
        </div>
      </div>

      {/* Server Grid */}
      <div className="grid grid-cols-2 gap-3">
        {servers.map(server => (
          <NeuromorphicCard 
            key={server.id}
            variant="embossed" 
            className={`p-4 cursor-pointer transition-all ${
              selectedServer?.id === server.id ? 'ring-1 ring-green-500/50' : ''
            }`}
            onClick={() => setSelectedServer(server)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getTypeIcon(server.type)}
                <div>
                  <span className="text-white font-medium">{server.name}</span>
                  <p className="text-xs text-slate-500">{server.provider} • {server.region}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {server.containers && (
                  <span className="text-xs text-slate-400">{server.containers} containers</span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded ${getStatusStyle(server.status)}`}>
                  {server.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">CPU</span>
                  <span className="text-white">{server.cpu.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${getMetricColor(server.cpu)}`} style={{ width: `${server.cpu}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">RAM</span>
                  <span className="text-white">{server.memory.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${getMetricColor(server.memory)}`} style={{ width: `${server.memory}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Disk</span>
                  <span className="text-white">{server.disk}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${getMetricColor(server.disk)}`} style={{ width: `${server.disk}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>⬇️ {server.network.in.toFixed(0)} MB/s ⬆️ {server.network.out.toFixed(0)} MB/s</span>
              <span>Uptime: {server.uptime}%</span>
            </div>
          </NeuromorphicCard>
        ))}
      </div>
    </div>
  )
}

export default ServerFleet
