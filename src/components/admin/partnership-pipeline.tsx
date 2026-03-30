'use client'

/**
 * 🤝 SILEXAR PULSE - Partnership Pipeline
 * Gestión de partnerships y deals
 * 
 * @description Pipeline de partnerships:
 * - Tracking de deals estratégicos
 * - Due diligence automatizado
 * - ROI de partnerships
 * - Pipeline stages
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
  Handshake,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Plus
} from 'lucide-react'

interface Partnership {
  id: string
  companyName: string
  type: 'integration' | 'reseller' | 'strategic' | 'technology'
  stage: 'prospect' | 'negotiation' | 'due-diligence' | 'signed' | 'active'
  dealValue: number
  roi?: number
  startDate?: Date
  contactName: string
  nextAction: string
  nextActionDate: Date
  healthScore: number
}

export function PartnershipPipeline() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stageFilter, setStageFilter] = useState<string>('all')

  useEffect(() => {
    loadPartnershipData()
  }, [])

  const loadPartnershipData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setPartnerships([
      {
        id: 'part_001',
        companyName: 'Google Cloud',
        type: 'technology',
        stage: 'negotiation',
        dealValue: 500000,
        contactName: 'Sarah Chen',
        nextAction: 'Llamada de pricing',
        nextActionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        healthScore: 85
      },
      {
        id: 'part_002',
        companyName: 'Salesforce',
        type: 'integration',
        stage: 'active',
        dealValue: 250000,
        roi: 340,
        startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        contactName: 'Mike Johnson',
        nextAction: 'Review trimestral',
        nextActionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        healthScore: 92
      },
      {
        id: 'part_003',
        companyName: 'Accenture LatAm',
        type: 'reseller',
        stage: 'due-diligence',
        dealValue: 1200000,
        contactName: 'Carlos Mendez',
        nextAction: 'Enviar documentación legal',
        nextActionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        healthScore: 72
      },
      {
        id: 'part_004',
        companyName: 'Meta Business',
        type: 'technology',
        stage: 'prospect',
        dealValue: 350000,
        contactName: 'Lisa Wang',
        nextAction: 'Primera reunión',
        nextActionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        healthScore: 60
      },
      {
        id: 'part_005',
        companyName: 'HubSpot',
        type: 'integration',
        stage: 'signed',
        dealValue: 180000,
        contactName: 'David Park',
        nextAction: 'Kickoff técnico',
        nextActionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        healthScore: 88
      }
    ])

    setIsLoading(false)
  }

  const getStageStyle = (stage: string) => {
    switch (stage) {
      case 'prospect': return 'bg-slate-500/20 text-slate-400'
      case 'negotiation': return 'bg-blue-500/20 text-blue-400'
      case 'due-diligence': return 'bg-yellow-500/20 text-yellow-400'
      case 'signed': return 'bg-purple-500/20 text-purple-400'
      case 'active': return 'bg-green-500/20 text-green-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'integration': return '🔌'
      case 'reseller': return '🏪'
      case 'strategic': return '🎯'
      case 'technology': return '⚡'
      default: return '🤝'
    }
  }

  const stages = ['prospect', 'negotiation', 'due-diligence', 'signed', 'active']
  
  const filteredPartnerships = partnerships.filter(p => 
    stageFilter === 'all' || p.stage === stageFilter
  )

  const totalPipelineValue = partnerships.filter(p => p.stage !== 'active').reduce((sum, p) => sum + p.dealValue, 0)
  const activeRevenue = partnerships.filter(p => p.stage === 'active').reduce((sum, p) => sum + p.dealValue, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Partnership Pipeline...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Handshake className="w-5 h-5 text-cyan-400" />
          Partnership & Deals Pipeline
        </h3>
        <NeuromorphicButton variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Nuevo Partnership
        </NeuromorphicButton>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-4 gap-3">
        <NeuromorphicCard variant="embossed" className="p-4 text-center">
          <p className="text-2xl font-bold text-white">{partnerships.length}</p>
          <p className="text-xs text-slate-400">Total Partners</p>
        </NeuromorphicCard>
        <NeuromorphicCard variant="embossed" className="p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">${(totalPipelineValue / 1000000).toFixed(2)}M</p>
          <p className="text-xs text-slate-400">Pipeline Value</p>
        </NeuromorphicCard>
        <NeuromorphicCard variant="embossed" className="p-4 text-center">
          <p className="text-2xl font-bold text-green-400">${(activeRevenue / 1000).toFixed(0)}K</p>
          <p className="text-xs text-slate-400">Active Revenue</p>
        </NeuromorphicCard>
        <NeuromorphicCard variant="embossed" className="p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">
            {partnerships.filter(p => p.roi).reduce((sum, p) => sum + (p.roi || 0), 0) / partnerships.filter(p => p.roi).length || 0}%
          </p>
          <p className="text-xs text-slate-400">Avg ROI</p>
        </NeuromorphicCard>
      </div>

      {/* Stage Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setStageFilter('all')}
          className={`px-3 py-1.5 text-sm rounded whitespace-nowrap ${
            stageFilter === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
          }`}
        >
          Todos ({partnerships.length})
        </button>
        {stages.map(stage => (
          <button
            key={stage}
            onClick={() => setStageFilter(stage)}
            className={`px-3 py-1.5 text-sm rounded whitespace-nowrap ${
              stageFilter === stage ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {stage} ({partnerships.filter(p => p.stage === stage).length})
          </button>
        ))}
      </div>

      {/* Pipeline Visualization */}
      <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
        {stages.map((stage, i) => (
          <div key={stage} className="flex items-center">
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-1 ${getStageStyle(stage)}`}>
                {partnerships.filter(p => p.stage === stage).length}
              </div>
              <p className="text-xs text-slate-400 capitalize">{stage}</p>
            </div>
            {i < stages.length - 1 && (
              <ArrowRight className="w-6 h-6 text-slate-600 mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Partnerships List */}
      <div className="space-y-3">
        {filteredPartnerships.map(partner => (
          <NeuromorphicCard key={partner.id} variant="embossed" className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-2xl">
                  {getTypeIcon(partner.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{partner.companyName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getStageStyle(partner.stage)}`}>
                      {partner.stage}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="capitalize">{partner.type}</span>
                    <span>Contacto: {partner.contactName}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-lg font-bold text-white">${(partner.dealValue / 1000).toFixed(0)}K</p>
                  {partner.roi && (
                    <p className="text-xs text-green-400">ROI: {partner.roi}%</p>
                  )}
                </div>

                <div className="text-right">
                  <div className={`flex items-center gap-1 text-xs ${
                    partner.healthScore >= 80 ? 'text-green-400' :
                    partner.healthScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {partner.healthScore >= 80 ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    Health: {partner.healthScore}%
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400">Próxima acción:</span>
                <span className="text-white">{partner.nextAction}</span>
              </div>
              <span className="text-xs text-slate-500">
                {partner.nextActionDate.toLocaleDateString()}
              </span>
            </div>
          </NeuromorphicCard>
        ))}
      </div>
    </div>
  )
}

export default PartnershipPipeline
