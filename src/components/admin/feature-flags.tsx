'use client'

/**
 * 🚩 SILEXAR PULSE - Feature Flags
 * Control de características con rollout gradual
 * 
 * @description Sistema de feature flags con:
 * - Activación por tenant o global
 * - Rollout porcentual
 * - A/B testing integrado
 * - Historial de cambios
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect } from 'react'
import { 
  NeuromorphicCard, 
  NeuromorphicButton
} from '@/components/ui/neuromorphic'
import {
  Flag,
  ToggleLeft,
  ToggleRight,
  Percent,
  Clock,
  AlertTriangle,
  CheckCircle,
  Beaker,
  Zap,
  Globe,
  Building2,
  Search
} from 'lucide-react'

interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string
  enabled: boolean
  rolloutPercentage: number
  targetType: 'all' | 'tenants' | 'users'
  targetIds: string[]
  category: 'core' | 'beta' | 'experimental' | 'deprecated'
  createdAt: Date
  lastModified: Date
  modifiedBy: string
  aiRecommendation?: {
    suggestedAction: 'enable' | 'disable' | 'rollout'
    confidence: number
    reason: string
  }
}

export function FeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  useEffect(() => {
    loadFlags()
  }, [])

  const loadFlags = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setFlags([
      {
        id: 'ff_001',
        key: 'new_dashboard_v2',
        name: 'Nuevo Dashboard V2',
        description: 'Interfaz renovada del dashboard principal con métricas en tiempo real',
        enabled: true,
        rolloutPercentage: 75,
        targetType: 'all',
        targetIds: [],
        category: 'beta',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        modifiedBy: 'CEO',
        aiRecommendation: {
          suggestedAction: 'rollout',
          confidence: 92,
          reason: 'Métricas positivas: 15% mejora en engagement, sin errores reportados'
        }
      },
      {
        id: 'ff_002',
        key: 'ai_assistant_v3',
        name: 'Asistente IA v3',
        description: 'Nueva versión del asistente con capacidades GPT-4 mejoradas',
        enabled: true,
        rolloutPercentage: 50,
        targetType: 'tenants',
        targetIds: ['tnt_rdf', 'tnt_prisa'],
        category: 'beta',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        lastModified: new Date(),
        modifiedBy: 'CEO',
        aiRecommendation: {
          suggestedAction: 'enable',
          confidence: 88,
          reason: 'Feedback positivo de tenants piloto, listo para más rollout'
        }
      },
      {
        id: 'ff_003',
        key: 'predictive_analytics',
        name: 'Analytics Predictivo',
        description: 'Módulo de predicción de campañas con ML avanzado',
        enabled: false,
        rolloutPercentage: 0,
        targetType: 'all',
        targetIds: [],
        category: 'experimental',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        modifiedBy: 'CEO'
      },
      {
        id: 'ff_004',
        key: 'dark_mode_v2',
        name: 'Modo Oscuro V2',
        description: 'Nueva paleta de colores para modo oscuro',
        enabled: true,
        rolloutPercentage: 100,
        targetType: 'all',
        targetIds: [],
        category: 'core',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        lastModified: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        modifiedBy: 'CEO'
      },
      {
        id: 'ff_005',
        key: 'legacy_reports',
        name: 'Reportes Legacy',
        description: 'Sistema de reportes antiguo - marcar para deprecación',
        enabled: true,
        rolloutPercentage: 100,
        targetType: 'all',
        targetIds: [],
        category: 'deprecated',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        lastModified: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        modifiedBy: 'System',
        aiRecommendation: {
          suggestedAction: 'disable',
          confidence: 85,
          reason: 'Solo 3% de usuarios utilizan esta función. Recomendado migrar'
        }
      }
    ])

    setIsLoading(false)
  }

  const toggleFlag = (flagId: string) => {
    setFlags(prev => prev.map(f => {
      if (f.id !== flagId) return f
      const newEnabled = !f.enabled
      return {
        ...f,
        enabled: newEnabled,
        rolloutPercentage: newEnabled ? (f.rolloutPercentage || 100) : 0,
        lastModified: new Date(),
        modifiedBy: 'CEO'
      }
    }))
  }

  const updateRollout = (flagId: string, percentage: number) => {
    setFlags(prev => prev.map(f => {
      if (f.id !== flagId) return f
      return {
        ...f,
        rolloutPercentage: percentage,
        lastModified: new Date(),
        modifiedBy: 'CEO'
      }
    }))
  }

  const applyAiRecommendation = (flagId: string) => {
    const flag = flags.find(f => f.id === flagId)
    if (!flag?.aiRecommendation) return

    switch (flag.aiRecommendation.suggestedAction) {
      case 'enable':
        setFlags(prev => prev.map(f => 
          f.id === flagId ? { ...f, enabled: true, lastModified: new Date() } : f
        ))
        break
      case 'disable':
        setFlags(prev => prev.map(f => 
          f.id === flagId ? { ...f, enabled: false, rolloutPercentage: 0, lastModified: new Date() } : f
        ))
        break
      case 'rollout':
        setFlags(prev => prev.map(f => 
          f.id === flagId ? { ...f, rolloutPercentage: 100, lastModified: new Date() } : f
        ))
        break
    }
  }

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'core': return 'bg-green-500/20 text-green-400'
      case 'beta': return 'bg-blue-500/20 text-blue-400'
      case 'experimental': return 'bg-purple-500/20 text-purple-400'
      case 'deprecated': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const filteredFlags = flags.filter(flag => {
    if (searchTerm && !flag.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !flag.key.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (categoryFilter !== 'all' && flag.category !== categoryFilter) return false
    return true
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Feature Flags...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Flag className="w-5 h-5 text-purple-400" />
          Feature Flags
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {flags.filter(f => f.enabled).length}/{flags.length} activos
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-green-500/10 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-slate-400">Core</span>
          </div>
          <p className="text-xl font-bold text-green-400">
            {flags.filter(f => f.category === 'core').length}
          </p>
        </div>
        <div className="p-3 bg-blue-500/10 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Beaker className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-400">Beta</span>
          </div>
          <p className="text-xl font-bold text-blue-400">
            {flags.filter(f => f.category === 'beta').length}
          </p>
        </div>
        <div className="p-3 bg-purple-500/10 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-400">Experimental</span>
          </div>
          <p className="text-xl font-bold text-purple-400">
            {flags.filter(f => f.category === 'experimental').length}
          </p>
        </div>
        <div className="p-3 bg-red-500/10 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-slate-400">Deprecated</span>
          </div>
          <p className="text-xl font-bold text-red-400">
            {flags.filter(f => f.category === 'deprecated').length}
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar flag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-800 text-white text-sm rounded-lg px-3 py-2"
        >
          <option value="all">Todas</option>
          <option value="core">Core</option>
          <option value="beta">Beta</option>
          <option value="experimental">Experimental</option>
          <option value="deprecated">Deprecated</option>
        </select>
      </div>

      {/* Flags List */}
      <div className="space-y-3">
        {filteredFlags.map(flag => (
          <NeuromorphicCard 
            key={flag.id}
            variant="embossed" 
            className={`p-4 ${flag.aiRecommendation ? 'ring-1 ring-purple-500/30' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium">{flag.name}</span>
                  <code className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                    {flag.key}
                  </code>
                  <span className={`text-xs px-2 py-0.5 rounded ${getCategoryStyle(flag.category)}`}>
                    {flag.category}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{flag.description}</p>
                
                {/* AI Recommendation */}
                {flag.aiRecommendation && (
                  <div className="mt-2 p-2 bg-purple-500/10 rounded flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span className="text-xs text-purple-400">
                        IA sugiere: {flag.aiRecommendation.suggestedAction.toUpperCase()} 
                        ({flag.aiRecommendation.confidence}% confianza) - {flag.aiRecommendation.reason}
                      </span>
                    </div>
                    <NeuromorphicButton
                      variant="primary"
                      size="sm"
                      onClick={() => applyAiRecommendation(flag.id)}
                    >
                      Aplicar
                    </NeuromorphicButton>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Rollout Slider */}
                {flag.enabled && (
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-slate-400" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={flag.rolloutPercentage}
                      onChange={(e) => updateRollout(flag.id, parseInt(e.target.value))}
                      className="w-24 accent-purple-500"
                    />
                    <span className="text-sm text-white w-10">{flag.rolloutPercentage}%</span>
                  </div>
                )}

                {/* Toggle */}
                <button
                  onClick={() => toggleFlag(flag.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    flag.enabled ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {flag.enabled ? (
                    <ToggleRight className="w-6 h-6" />
                  ) : (
                    <ToggleLeft className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-700/50 text-xs text-slate-500">
              <span>
                {flag.targetType === 'all' ? (
                  <Globe className="w-3 h-3 inline mr-1" />
                ) : (
                  <Building2 className="w-3 h-3 inline mr-1" />
                )}
                {flag.targetType === 'all' ? 'Global' : `${flag.targetIds.length} tenants`}
              </span>
              <span>
                <Clock className="w-3 h-3 inline mr-1" />
                Modificado: {flag.lastModified.toLocaleDateString()}
              </span>
              <span>Por: {flag.modifiedBy}</span>
            </div>
          </NeuromorphicCard>
        ))}
      </div>
    </div>
  )
}

export default FeatureFlags
