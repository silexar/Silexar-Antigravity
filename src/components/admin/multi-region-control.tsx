'use client'

/**
 * ðŸŒ SILEXAR PULSE - Multi-Region Control
 * Control de despliegue multi-región
 *
 * @description Gestión de infraestructura:
 * - Regiones activas
 * - Latencia y health
 * - Failover automático
 * - Distribución de carga
 *
 * @version 2025.4.2
 * @tier TIER_0_FORTUNE_10
 * @design NEUMORPHISM_TIER_0
 */

import { useState, useEffect, useCallback } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
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
        location: 'SÁ£o Paulo, Brasil',
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

  const getStatusOpacity = (status: string) => {
    switch (status) {
      case 'healthy': return 1
      case 'degraded': return 0.7
      case 'down': return 0.5
      case 'maintenance': return 0.6
      default: return 0.7
    }
  }

  const getLatencyOpacity = (latency: number) => {
    if (latency < 50) return 1
    if (latency < 100) return 0.85
    if (latency < 200) return 0.7
    return 0.5
  }

  const triggerFailover = (ruleId: string) => {
    const rule = failoverRules.find(r => r.id === ruleId)
    if (rule) {
      alert(`Failover ejecutado: ${rule.sourceRegion} †’ ${rule.targetRegion}`)
    }
  }

  const totalRequests = regions.reduce((sum, r) => sum + r.requests, 0)
  const avgLatency = regions.reduce((sum, r) => sum + r.latency, 0) / regions.length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#bec8de] border-t-[#6888ff] rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: N.textSub }}>Cargando Multi-Region...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: N.text }}>
          <Globe className="w-5 h-5" style={{ color: N.accent }} />
          Multi-Region Control
        </h3>
        <NeuButton variant="primary">
          <RefreshCw className="w-4 h-4 mr-1" />
          Sync All
        </NeuButton>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 rounded-xl text-center" style={{ background: N.base, boxShadow: getSmallShadow() }}>
          <p className="text-2xl font-bold" style={{ color: N.text }}>{regions.length}</p>
          <p className="text-xs" style={{ color: N.textSub }}>Regiones</p>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ background: N.base, boxShadow: getSmallShadow() }}>
          <p className="text-2xl font-bold" style={{ color: N.accent }}>
            {regions.filter(r => r.status === 'healthy').length}
          </p>
          <p className="text-xs" style={{ color: N.textSub }}>Healthy</p>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ background: N.base, boxShadow: getSmallShadow() }}>
          <p className="text-2xl font-bold" style={{ color: N.accent }}>{Math.round(avgLatency)}ms</p>
          <p className="text-xs" style={{ color: N.textSub }}>Latencia Prom</p>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ background: N.base, boxShadow: getSmallShadow() }}>
          <p className="text-2xl font-bold" style={{ color: N.accent }}>
            {(totalRequests / 1000).toFixed(0)}K
          </p>
          <p className="text-xs" style={{ color: N.textSub }}>Requests/min</p>
        </div>
      </div>

      {/* Alert for Degraded Regions */}
      {regions.some(r => r.status === 'degraded' || r.status === 'down') && (
        <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: `${N.accent}10`, border: `1px solid ${N.dark}40` }}>
          <AlertTriangle className="w-5 h-5" style={{ color: N.accent }} />
          <span className="text-sm font-bold" style={{ color: N.accent }}>
            {regions.filter(r => r.status !== 'healthy').length} región(es) con problemas detectados
          </span>
        </div>
      )}

      {/* Regions Grid */}
      <div className="grid grid-cols-3 gap-4">
        {regions.map(region => (
          <NeuCard
            key={region.id}
            style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color: N.accent }} />
                <div>
                  <span className="font-medium block" style={{ color: N.text }}>{region.name}</span>
                  <span className="text-xs" style={{ color: N.textSub }}>{region.code}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {region.isPrimary && (
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${N.accent}15`, color: N.accent }}>
                    Primary
                  </span>
                )}
                <span
                  className="text-xs px-2 py-0.5 rounded font-bold"
                  style={{
                    background: `${N.accent}15`,
                    color: N.accent,
                    opacity: getStatusOpacity(region.status)
                  }}
                >
                  {region.status}
                </span>
              </div>
            </div>

            <p className="text-xs mb-3" style={{ color: N.textSub }}>{region.location}</p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="p-2 rounded-xl text-center" style={{ background: N.base, boxShadow: getSmallShadow(true) }}>
                <p className="text-lg font-bold" style={{ color: N.accent, opacity: getLatencyOpacity(region.latency) }}>
                  {Math.round(region.latency)}ms
                </p>
                <p className="text-xs" style={{ color: N.textSub }}>Latencia</p>
              </div>
              <div className="p-2 rounded-xl text-center" style={{ background: N.base, boxShadow: getSmallShadow(true) }}>
                <p className="text-lg font-bold" style={{ color: N.text }}>{region.nodes}</p>
                <p className="text-xs" style={{ color: N.textSub }}>Nodos</p>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: N.textSub }}>CPU</span>
                  <span style={{ color: N.text }}>{Math.round(region.cpu)}%</span>
                </div>
                <div className="w-full rounded-full h-1.5" style={{ background: N.base, boxShadow: getSmallShadow(true) }}>
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${region.cpu}%`,
                      background: N.accent,
                      opacity: region.cpu > 80 ? 0.5 : region.cpu > 60 ? 0.7 : 1
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: N.textSub }}>Memory</span>
                  <span style={{ color: N.text }}>{Math.round(region.memory)}%</span>
                </div>
                <div className="w-full rounded-full h-1.5" style={{ background: N.base, boxShadow: getSmallShadow(true) }}>
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${region.memory}%`,
                      background: N.accent,
                      opacity: region.memory > 80 ? 0.5 : region.memory > 60 ? 0.7 : 1
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs" style={{ color: N.textSub }}>
              <span>{(region.requests / 1000).toFixed(1)}K req/min</span>
              <span>Sync: {region.lastSync.toLocaleTimeString()}</span>
            </div>
          </NeuCard>
        ))}
      </div>

      {/* Failover Rules */}
      <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }} className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2" style={{ color: N.text }}>
          <Zap className="w-4 h-4" style={{ color: N.accent }} />
          Reglas de Failover
        </h4>
        <div className="space-y-2">
          {failoverRules.map(rule => (
            <div key={rule.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: N.base, boxShadow: getSmallShadow(true) }}>
              <div className="flex items-center gap-3">
                <span className="font-medium" style={{ color: N.text }}>{rule.sourceRegion}</span>
                <ArrowRight className="w-4 h-4" style={{ color: N.textSub }} />
                <span className="font-medium" style={{ color: N.text }}>{rule.targetRegion}</span>
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${N.accent}10`, color: N.accent }}>
                  {rule.trigger === 'latency' ? `Latencia > ${rule.threshold}ms` :
                    rule.trigger === 'health' ? `Health < ${rule.threshold}%` : rule.trigger}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: rule.active ? N.accent : N.textSub }}
                />
                <NeuButton
                  variant="secondary"
                  onClick={() => triggerFailover(rule.id)}
                >
                  Ejecutar
                </NeuButton>
              </div>
            </div>
          ))}
        </div>
      </NeuCard>
    </div>
  )
}

export default MultiRegionControl
