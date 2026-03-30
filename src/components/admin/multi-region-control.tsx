'use client'

/**
 * 🌐 SILEXAR PULSE - Multi-Region Control
 * Control de despliegue multi-región
 * 
 * @description Gestión de infraestructura:
 * - Regiones activas
 * - Latencia y health
 * - Failover automático
 * - Distribución de carga
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect, useCallback } from 'react'
import { 
  NeuromorphicCard, 
  NeuromorphicButton 
} from '@/components/ui/neuromorphic'
import {
  Globe,
  Zap,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  MapPin
} from 'lucide-react'

interface Region {
  id: string
  name: string
  code: string
  location: string
  status: 'healthy' | 'degraded' | 'down' | 'maintenance'
  latency: number
  cpu: number
  memory: number
  requests: number
  isPrimary: boolean
  lastSync: Date
  nodes: number
}

interface FailoverRule {
  id: string
  sourceRegion: string
  targetRegion: string
  trigger: 'latency' | 'error_rate' | 'health' | 'manual'
  threshold: number
  active: boolean
}

export function MultiRegionControl() {
  const [regions, setRegions] = useState<Region[]>([])
  const [failoverRules, setFailoverRules] = useState<FailoverRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)

  useEffect(() => {
    loadRegionData()
    const interval = setInterval(loadRegionData, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadRegionData = async () => {
    if (!isLoading) {
      // Solo simular cambios en latencia
      setRegions(prev => prev.map(r => ({
        ...r,
        latency: Math.max(10, r.latency + (Math.random() - 0.5) * 5),
        cpu: Math.min(100, Math.max(0, r.cpu + (Math.random() - 0.5) * 3)),
        requests: r.requests + Math.floor(Math.random() * 100)
      })))
      return
    }

    await new Promise(resolve => setTimeout(resolve, 500))

    setRegions([
      {
        id: 'reg_001',
        name: 'South America East',
        code: 'sa-east-1',
        location: 'São Paulo, Brasil',
        status: 'healthy',
        latency: 25,
        cpu: 45,
        memory: 62,
        requests: 125000,
        isPrimary: true,
        lastSync: new Date(),
        nodes: 4
      },
      {
        id: 'reg_002',
        name: 'South America West',
        code: 'sa-west-1',
        location: 'Santiago, Chile',
        status: 'healthy',
        latency: 18,
        cpu: 38,
        memory: 55,
        requests: 89000,
        isPrimary: false,
        lastSync: new Date(),
        nodes: 3
      },
      {
        id: 'reg_003',
        name: 'US East',
        code: 'us-east-1',
        location: 'Virginia, USA',
        status: 'healthy',
        latency: 85,
        cpu: 52,
        memory: 71,
        requests: 210000,
        isPrimary: false,
        lastSync: new Date(),
        nodes: 6
      },
      {
        id: 'reg_004',
        name: 'Europe West',
        code: 'eu-west-1',
        location: 'Frankfurt, Alemania',
        status: 'degraded',
        latency: 145,
        cpu: 78,
        memory: 85,
        requests: 156000,
        isPrimary: false,
        lastSync: new Date(Date.now() - 30000),
        nodes: 4
      },
      {
        id: 'reg_005',
        name: 'Asia Pacific',
        code: 'ap-east-1',
        location: 'Tokio, Japón',
        status: 'healthy',
        latency: 220,
        cpu: 35,
        memory: 48,
        requests: 78000,
        isPrimary: false,
        lastSync: new Date(),
        nodes: 3
      }
    ])

    setFailoverRules([
      {
        id: 'fr_001',
        sourceRegion: 'sa-east-1',
        targetRegion: 'sa-west-1',
        trigger: 'health',
        threshold: 50,
        active: true
      },
      {
        id: 'fr_002',
        sourceRegion: 'eu-west-1',
        targetRegion: 'us-east-1',
        trigger: 'latency',
        threshold: 200,
        active: true
      }
    ])

    setIsLoading(false)
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/20 text-green-400'
      case 'degraded': return 'bg-yellow-500/20 text-yellow-400'
      case 'down': return 'bg-red-500/20 text-red-400'
      case 'maintenance': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getLatencyColor = (latency: number) => {
    if (latency < 50) return 'text-green-400'
    if (latency < 100) return 'text-yellow-400'
    if (latency < 200) return 'text-orange-400'
    return 'text-red-400'
  }

  const triggerFailover = (ruleId: string) => {
    const rule = failoverRules.find(r => r.id === ruleId)
    if (rule) {
      
      alert(`Failover ejecutado: ${rule.sourceRegion} → ${rule.targetRegion}`)
    }
  }

  const totalRequests = regions.reduce((sum, r) => sum + r.requests, 0)
  const avgLatency = regions.reduce((sum, r) => sum + r.latency, 0) / regions.length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Multi-Region...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          Multi-Region Control
        </h3>
        <NeuromorphicButton variant="primary" size="sm">
          <RefreshCw className="w-4 h-4 mr-1" />
          Sync All
        </NeuromorphicButton>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-white">{regions.length}</p>
          <p className="text-xs text-slate-400">Regiones</p>
        </div>
        <div className="p-3 bg-green-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-400">
            {regions.filter(r => r.status === 'healthy').length}
          </p>
          <p className="text-xs text-slate-400">Healthy</p>
        </div>
        <div className="p-3 bg-cyan-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-cyan-400">{Math.round(avgLatency)}ms</p>
          <p className="text-xs text-slate-400">Latencia Prom</p>
        </div>
        <div className="p-3 bg-purple-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-purple-400">
            {(totalRequests / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-slate-400">Requests/min</p>
        </div>
      </div>

      {/* Alert for Degraded Regions */}
      {regions.some(r => r.status === 'degraded' || r.status === 'down') && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-400 text-sm">
            {regions.filter(r => r.status !== 'healthy').length} región(es) con problemas detectados
          </span>
        </div>
      )}

      {/* Regions Grid */}
      <div className="grid grid-cols-3 gap-4">
        {regions.map(region => (
          <NeuromorphicCard 
            key={region.id}
            variant="embossed" 
            className={`p-4 cursor-pointer hover:border-cyan-500/30 transition-all ${
              selectedRegion?.id === region.id ? 'ring-1 ring-cyan-500/50' : ''
            }`}
            onClick={() => setSelectedRegion(region)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-white font-medium block">{region.name}</span>
                  <span className="text-xs text-slate-500">{region.code}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {region.isPrimary && (
                  <span className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                    Primary
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded ${getStatusStyle(region.status)}`}>
                  {region.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-3">{region.location}</p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="p-2 bg-slate-800/30 rounded text-center">
                <p className={`text-lg font-bold ${getLatencyColor(region.latency)}`}>
                  {Math.round(region.latency)}ms
                </p>
                <p className="text-xs text-slate-500">Latencia</p>
              </div>
              <div className="p-2 bg-slate-800/30 rounded text-center">
                <p className="text-lg font-bold text-white">{region.nodes}</p>
                <p className="text-xs text-slate-500">Nodos</p>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">CPU</span>
                  <span className="text-white">{Math.round(region.cpu)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${region.cpu > 80 ? 'bg-red-500' : region.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${region.cpu}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Memory</span>
                  <span className="text-white">{Math.round(region.memory)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${region.memory > 80 ? 'bg-red-500' : region.memory > 60 ? 'bg-yellow-500' : 'bg-cyan-500'}`}
                    style={{ width: `${region.memory}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>{(region.requests / 1000).toFixed(1)}K req/min</span>
              <span>Sync: {region.lastSync.toLocaleTimeString()}</span>
            </div>
          </NeuromorphicCard>
        ))}
      </div>

      {/* Failover Rules */}
      <NeuromorphicCard variant="embossed" className="p-4">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          Reglas de Failover
        </h4>
        <div className="space-y-2">
          {failoverRules.map(rule => (
            <div key={rule.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-white font-medium">{rule.sourceRegion}</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <span className="text-white font-medium">{rule.targetRegion}</span>
                <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded">
                  {rule.trigger === 'latency' ? `Latencia > ${rule.threshold}ms` : 
                   rule.trigger === 'health' ? `Health < ${rule.threshold}%` : rule.trigger}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${rule.active ? 'bg-green-400' : 'bg-slate-500'}`} />
                <NeuromorphicButton 
                  variant="secondary" 
                  size="sm"
                  onClick={() => triggerFailover(rule.id)}
                >
                  Ejecutar
                </NeuromorphicButton>
              </div>
            </div>
          ))}
        </div>
      </NeuromorphicCard>
    </div>
  )
}

export default MultiRegionControl
