'use client'

/**
 * 🚨 SILEXAR PULSE - Error Tracking Center
 * Seguimiento de errores en tiempo real
 * 
 * @description Error Tracking:
 * - Errores JS y Backend
 * - Stack traces
 * - Impacto por usuarios
 * - Trends de errores
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
  AlertTriangle,
  Bug,
  Code,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react'

interface ErrorEvent {
  id: string
  type: 'frontend' | 'backend' | 'api'
  message: string
  stack?: string
  file?: string
  line?: number
  occurrences: number
  usersAffected: number
  firstSeen: Date
  lastSeen: Date
  status: 'new' | 'investigating' | 'resolved' | 'ignored'
  severity: 'critical' | 'high' | 'medium' | 'low'
  tenant?: string
}

export function ErrorTracking() {
  const [errors, setErrors] = useState<ErrorEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'new' | 'critical'>('all')
  const [selectedError, setSelectedError] = useState<ErrorEvent | null>(null)

  useEffect(() => {
    loadErrorData()
  }, [])

  const loadErrorData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setErrors([
      {
        id: 'err_001',
        type: 'frontend',
        message: "Cannot read property 'map' of undefined",
        stack: "TypeError: Cannot read property 'map' of undefined\n    at CampaignList (/src/components/campaigns/list.tsx:45)\n    at renderWithHooks...",
        file: 'src/components/campaigns/list.tsx',
        line: 45,
        occurrences: 147,
        usersAffected: 23,
        firstSeen: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(Date.now() - 30 * 60 * 1000),
        status: 'investigating',
        severity: 'high'
      },
      {
        id: 'err_002',
        type: 'api',
        message: 'ECONNREFUSED: Connection refused to Redis',
        occurrences: 89,
        usersAffected: 156,
        firstSeen: new Date(Date.now() - 4 * 60 * 60 * 1000),
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'resolved',
        severity: 'critical'
      },
      {
        id: 'err_003',
        type: 'backend',
        message: 'Timeout waiting for lock on campaigns table',
        file: 'src/services/campaign.service.ts',
        line: 234,
        occurrences: 34,
        usersAffected: 8,
        firstSeen: new Date(Date.now() - 24 * 60 * 60 * 1000),
        lastSeen: new Date(Date.now() - 6 * 60 * 60 * 1000),
        status: 'new',
        severity: 'medium',
        tenant: 'RDF Media'
      },
      {
        id: 'err_004',
        type: 'frontend',
        message: 'ChunkLoadError: Loading chunk X failed',
        occurrences: 67,
        usersAffected: 45,
        firstSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(Date.now() - 12 * 60 * 60 * 1000),
        status: 'ignored',
        severity: 'low'
      },
      {
        id: 'err_005',
        type: 'api',
        message: '429 Too Many Requests from external API',
        occurrences: 234,
        usersAffected: 12,
        firstSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(Date.now() - 1 * 60 * 60 * 1000),
        status: 'investigating',
        severity: 'medium'
      }
    ])

    setIsLoading(false)
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertTriangle className="w-4 h-4 text-red-400" />
      case 'investigating': return <Eye className="w-4 h-4 text-yellow-400" />
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'ignored': return <XCircle className="w-4 h-4 text-slate-400" />
      default: return <Bug className="w-4 h-4 text-slate-400" />
    }
  }

  const updateStatus = (id: string, status: ErrorEvent['status']) => {
    setErrors(prev => prev.map(e => e.id === id ? { ...e, status } : e))
  }

  const filteredErrors = errors.filter(e => {
    switch (filter) {
      case 'new': return e.status === 'new'
      case 'critical': return e.severity === 'critical' || e.severity === 'high'
      default: return true
    }
  })

  const totalErrors = errors.reduce((sum, e) => sum + e.occurrences, 0)
  const activeErrors = errors.filter(e => e.status !== 'resolved' && e.status !== 'ignored')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Error Tracking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Bug className="w-5 h-5 text-red-400" />
          Error Tracking Center
        </h3>
        <div className="flex items-center gap-2">
          {(['all', 'new', 'critical'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded ${
                filter === f ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'new' ? 'Nuevos' : 'Críticos'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-red-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-red-400">{activeErrors.length}</p>
          <p className="text-xs text-slate-400">Errores Activos</p>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-white">{totalErrors}</p>
          <p className="text-xs text-slate-400">Ocurrencias</p>
        </div>
        <div className="p-3 bg-orange-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-orange-400">
            {errors.reduce((sum, e) => sum + e.usersAffected, 0)}
          </p>
          <p className="text-xs text-slate-400">Usuarios Afectados</p>
        </div>
        <div className="p-3 bg-green-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-400">
            {errors.filter(e => e.status === 'resolved').length}
          </p>
          <p className="text-xs text-slate-400">Resueltos</p>
        </div>
      </div>

      {/* Error List */}
      <div className="space-y-3">
        {filteredErrors.map(error => (
          <NeuromorphicCard 
            key={error.id}
            variant="embossed" 
            className={`p-4 cursor-pointer ${getSeverityStyle(error.severity)} border`}
            onClick={() => setSelectedError(error)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(error.status)}
                <div>
                  <span className="text-white font-medium">{error.message}</span>
                  {error.file && (
                    <p className="text-xs text-slate-400">
                      <Code className="w-3 h-3 inline mr-1" />
                      {error.file}:{error.line}
                    </p>
                  )}
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded uppercase ${getSeverityStyle(error.severity)}`}>
                {error.severity}
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-1 text-slate-400">
                <TrendingUp className="w-3 h-3" />
                {error.occurrences}x
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Users className="w-3 h-3" />
                {error.usersAffected} usuarios
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3" />
                Última: {error.lastSeen.toLocaleTimeString()}
              </span>
              {error.tenant && (
                <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded">
                  {error.tenant}
                </span>
              )}
            </div>

            {error.status === 'new' && (
              <div className="mt-3 flex items-center gap-2">
                <NeuromorphicButton 
                  variant="secondary" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); updateStatus(error.id, 'investigating'); }}
                >
                  Investigar
                </NeuromorphicButton>
                <NeuromorphicButton 
                  variant="secondary" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); updateStatus(error.id, 'resolved'); }}
                >
                  Marcar Resuelto
                </NeuromorphicButton>
              </div>
            )}
          </NeuromorphicCard>
        ))}
      </div>

      {/* Stack Trace Modal */}
      {selectedError?.stack && (
        <NeuromorphicCard variant="glow" className="p-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Code className="w-4 h-4 text-red-400" />
            Stack Trace
          </h4>
          <pre className="bg-[#F0EDE8] p-4 rounded text-xs text-slate-300 overflow-x-auto">
            {selectedError.stack}
          </pre>
        </NeuromorphicCard>
      )}
    </div>
  )
}

export default ErrorTracking
