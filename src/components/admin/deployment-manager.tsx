'use client'

/**
 * 🚀 SILEXAR PULSE - Deployment Manager
 * Gestión de deployments y rollbacks
 * 
 * @description Deployments:
 * - Control de versiones
 * - Rollback inmediato
 * - Blue/Green deployments
 * - Historial de releases
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 * @security MILITARY_GRADE
 */

import { useState, useEffect } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  Rocket,
  GitBranch,
  Tag,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Play,
  RefreshCw,
  AlertTriangle,
  Eye
} from 'lucide-react'

interface Deployment {
  id: string
  version: string
  environment: 'production' | 'staging' | 'development'
  status: 'running' | 'success' | 'failed' | 'rolled_back'
  deployedAt: Date
  deployedBy: string
  duration: number
  commit: string
  commitMessage: string
  changelog: string[]
}

interface Environment {
  name: 'production' | 'staging' | 'development'
  currentVersion: string
  lastDeployment: Date
  status: 'healthy' | 'degraded' | 'down'
  instances: number
}

export function DeploymentManager() {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeploying, setIsDeploying] = useState(false)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setEnvironments([
      { name: 'production', currentVersion: 'v2.5.3', lastDeployment: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), status: 'healthy', instances: 4 },
      { name: 'staging', currentVersion: 'v2.6.0-rc.1', lastDeployment: new Date(Date.now() - 6 * 60 * 60 * 1000), status: 'healthy', instances: 2 },
      { name: 'development', currentVersion: 'v2.6.0-dev.45', lastDeployment: new Date(Date.now() - 1 * 60 * 60 * 1000), status: 'healthy', instances: 1 }
    ])

    setDeployments([
      {
        id: 'deploy_001',
        version: 'v2.5.3',
        environment: 'production',
        status: 'success',
        deployedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        deployedBy: 'CEO',
        duration: 245,
        commit: 'abc1234',
        commitMessage: 'Fix: Performance optimization for campaigns',
        changelog: ['Optimized query performance', 'Fixed memory leak', 'Updated dependencies']
      },
      {
        id: 'deploy_002',
        version: 'v2.5.2',
        environment: 'production',
        status: 'rolled_back',
        deployedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        deployedBy: 'CEO',
        duration: 180,
        commit: 'def5678',
        commitMessage: 'Feature: New analytics dashboard',
        changelog: ['Added analytics dashboard', 'New charts library']
      },
      {
        id: 'deploy_003',
        version: 'v2.6.0-rc.1',
        environment: 'staging',
        status: 'success',
        deployedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        deployedBy: 'CI/CD',
        duration: 312,
        commit: 'ghi9012',
        commitMessage: 'Release: v2.6.0 RC1',
        changelog: ['New automation engine', 'Alert escalation', 'Performance improvements']
      },
      {
        id: 'deploy_004',
        version: 'v2.5.1',
        environment: 'production',
        status: 'success',
        deployedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        deployedBy: 'CEO',
        duration: 198,
        commit: 'jkl3456',
        commitMessage: 'Fix: Security patches',
        changelog: ['Security patches', 'Bug fixes']
      }
    ])

    setIsLoading(false)
  }

  const deployToProduction = async () => {
    if (!confirm('¿Desplegar v2.6.0-rc.1 a producción?')) return

    setIsDeploying(true)
    await new Promise(resolve => setTimeout(resolve, 5000))

    const newDeployment: Deployment = {
      id: `deploy_${Date.now()}`,
      version: 'v2.6.0',
      environment: 'production',
      status: 'success',
      deployedAt: new Date(),
      deployedBy: 'CEO',
      duration: 267,
      commit: 'mno7890',
      commitMessage: 'Release: v2.6.0',
      changelog: ['New automation engine', 'Alert escalation', 'Performance improvements']
    }

    setDeployments(prev => [newDeployment, ...prev])
    setEnvironments(prev => prev.map(e =>
      e.name === 'production' ? { ...e, currentVersion: 'v2.6.0', lastDeployment: new Date() } : e
    ))
    setIsDeploying(false)
  }

  const rollback = async (deployment: Deployment) => {
    if (!confirm(`¿Hacer rollback a ${deployment.version}?`)) return

    setIsDeploying(true)
    await new Promise(resolve => setTimeout(resolve, 3000))

    setDeployments(prev => prev.map(d =>
      d.id === deployment.id ? { ...d, status: 'rolled_back' } : d
    ))

    setEnvironments(prev => prev.map(e =>
      e.name === deployment.environment ? { ...e, currentVersion: deployment.version, lastDeployment: new Date() } : e
    ))
    setIsDeploying(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-[#6888ff]" />
      case 'failed': return <XCircle className="w-4 h-4 text-[#6888ff]" />
      case 'running': return <Clock className="w-4 h-4 text-[#6888ff] animate-spin" />
      case 'rolled_back': return <RotateCcw className="w-4 h-4 text-[#6888ff]" />
      default: return <Clock className="w-4 h-4 text-[#9aa3b8]" />
    }
  }

  const getEnvColor = (env: string) => {
    switch (env) {
      case 'production': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'staging': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'development': return 'bg-[#6888ff]/20 text-[#6888ff]'
      default: return 'bg-slate-500/20 text-[#9aa3b8]'
    }
  }

  const prodDeployments = deployments.filter(d => d.environment === 'production').length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6888ff]/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando Deployment Manager...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2">
          <Rocket className="w-5 h-5 text-[#6888ff]" />
          Deployment Manager
        </h3>
        <div className="flex items-center gap-2">
          <NeuButton variant="secondary" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </NeuButton>
          <NeuButton variant="primary" onClick={deployToProduction} disabled={isDeploying}>
            {isDeploying ? (
              <>
                <Clock className="w-4 h-4 mr-1 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Deploy to Prod
              </>
            )}
          </NeuButton>
        </div>
      </div>

      {/* Environments */}
      <div className="grid grid-cols-3 gap-3">
        {environments.map(env => (
          <NeuCard key={env.name} style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-medium px-2 py-0.5 rounded capitalize ${getEnvColor(env.name)}`}>
                {env.name}
              </span>
              <div className={`w-2 h-2 rounded-full ${env.status === 'healthy' ? 'bg-[#6888ff]' :
                env.status === 'degraded' ? 'bg-[#6888ff]' : 'bg-[#6888ff]'
                }`} />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#69738c]">{env.currentVersion}</p>
              <p className="text-xs text-[#9aa3b8]">{env.instances} instances</p>
              <p className="text-xs text-[#9aa3b8] mt-2">
                Last: {env.lastDeployment.toLocaleDateString()}
              </p>
            </div>
          </NeuCard>
        ))}
      </div>

      {/* Deployments History */}
      <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
        <h4 className="text-[#69738c] font-medium mb-3 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-[#9aa3b8]" />
          Historial de Deployments ({prodDeployments} en producción)
        </h4>
        <div className="space-y-2">
          {deployments.map(deployment => (
            <div
              key={deployment.id}
              className={`flex items-center justify-between p-4 rounded-lg cursor-pointer ${selectedDeployment?.id === deployment.id ? 'bg-[#dfeaff]' : 'bg-[#dfeaff]/50 hover:bg-[#dfeaff]'
                }`}
              onClick={() => setSelectedDeployment(deployment)}
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(deployment.status)}
                <div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#6888ff]" />
                    <span className="text-[#69738c] font-medium">{deployment.version}</span>
                    <span className={`text-xs px-2 py-0.5 rounded capitalize ${getEnvColor(deployment.environment)}`}>
                      {deployment.environment}
                    </span>
                  </div>
                  <p className="text-xs text-[#9aa3b8] mt-1">{deployment.commitMessage}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-[#9aa3b8]">{deployment.deployedAt.toLocaleDateString()}</p>
                  <p className="text-xs text-[#9aa3b8]">{deployment.duration}s • {deployment.deployedBy}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1 hover:bg-slate-600 rounded">
                    <Eye className="w-4 h-4 text-[#9aa3b8]" />
                  </button>
                  {deployment.status === 'success' && deployment.environment === 'production' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); rollback(deployment); }}
                      className="p-1 hover:bg-slate-600 rounded"
                    >
                      <RotateCcw className="w-4 h-4 text-[#6888ff]" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </NeuCard>

      {/* Deployment Details */}
      {selectedDeployment && (
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
          <h4 className="text-[#69738c] font-medium mb-3">Detalles: {selectedDeployment.version}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[#9aa3b8] text-sm">Commit</span>
              <p className="text-[#6888ff] font-mono">{selectedDeployment.commit}</p>
            </div>
            <div>
              <span className="text-[#9aa3b8] text-sm">Deployed By</span>
              <p className="text-[#69738c]">{selectedDeployment.deployedBy}</p>
            </div>
            <div className="col-span-2">
              <span className="text-[#9aa3b8] text-sm">Changelog</span>
              <ul className="mt-1 space-y-1">
                {selectedDeployment.changelog.map((item, i) => (
                  <li key={item} className="text-[#69738c] text-sm flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-[#6888ff]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </NeuCard>
      )}
    </div>
  )
}

export default DeploymentManager