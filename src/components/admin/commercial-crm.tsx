'use client'

/**
 * 💼 SILEXAR PULSE - CRM Comercial
 * Pipeline de ventas, leads y gestión comercial
 * 
 * @description CRM integrado para el CEO con:
 * - Pipeline de ventas visual
 * - Gestión de leads
 * - Seguimiento de oportunidades
 * - Métricas comerciales
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
  Users,
  DollarSign,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  ArrowRight,
  Plus,
  Search,
  TrendingUp,
  Target,
  MessageSquare,
  Award
} from 'lucide-react'

interface Lead {
  id: string
  companyName: string
  contactName: string
  contactEmail: string
  contactPhone: string
  source: 'website' | 'referral' | 'cold_call' | 'event' | 'linkedin'
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  value: number
  probability: number
  expectedCloseDate: Date
  assignedTo: string
  lastActivity: Date
  notes: string
  plan: 'starter' | 'professional' | 'enterprise' | 'enterprise_plus'
}

interface PipelineStats {
  totalLeads: number
  totalValue: number
  weightedValue: number
  avgDealSize: number
  conversionRate: number
  avgCycleTime: number
}

const STAGE_CONFIG = {
  new: { name: 'Nuevo', color: 'bg-slate-600', textColor: 'text-slate-300' },
  contacted: { name: 'Contactado', color: 'bg-blue-600', textColor: 'text-blue-300' },
  qualified: { name: 'Calificado', color: 'bg-purple-600', textColor: 'text-purple-300' },
  proposal: { name: 'Propuesta', color: 'bg-orange-600', textColor: 'text-orange-300' },
  negotiation: { name: 'Negociación', color: 'bg-yellow-600', textColor: 'text-yellow-300' },
  closed_won: { name: 'Ganado', color: 'bg-green-600', textColor: 'text-green-300' },
  closed_lost: { name: 'Perdido', color: 'bg-red-600', textColor: 'text-red-300' }
}

export function CommercialCRM() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<PipelineStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadCRMData()
  }, [])

  const loadCRMData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    // Demo leads
    const demoLeads: Lead[] = [
      {
        id: 'lead_001',
        companyName: 'TVN Chile',
        contactName: 'Roberto Méndez',
        contactEmail: 'rmendez@tvn.cl',
        contactPhone: '+56 9 8765 4321',
        source: 'referral',
        stage: 'negotiation',
        value: 999000,
        probability: 80,
        expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        assignedTo: 'Carlos Silva',
        lastActivity: new Date(),
        notes: 'Muy interesados en Enterprise+. Reunión final agendada.',
        plan: 'enterprise_plus'
      },
      {
        id: 'lead_002',
        companyName: 'Radio ADN',
        contactName: 'Ana Martínez',
        contactEmail: 'amartinez@radioadn.cl',
        contactPhone: '+56 9 1234 5678',
        source: 'website',
        stage: 'proposal',
        value: 599000,
        probability: 60,
        expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        assignedTo: 'María González',
        lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        notes: 'Propuesta enviada. Esperando respuesta del directorio.',
        plan: 'enterprise'
      },
      {
        id: 'lead_003',
        companyName: 'Canal 13',
        contactName: 'Jorge Pérez',
        contactEmail: 'jperez@canal13.cl',
        contactPhone: '+56 9 9876 5432',
        source: 'event',
        stage: 'qualified',
        value: 999000,
        probability: 40,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        assignedTo: 'Carlos Silva',
        lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        notes: 'Calificado como Enterprise+. Preparar demo personalizada.',
        plan: 'enterprise_plus'
      },
      {
        id: 'lead_004',
        companyName: 'Diario El Mercurio',
        contactName: 'Patricia Soto',
        contactEmail: 'psoto@elmercurio.cl',
        contactPhone: '+56 9 5555 1234',
        source: 'linkedin',
        stage: 'contacted',
        value: 299000,
        probability: 20,
        expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        assignedTo: 'María González',
        lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        notes: 'Primer contacto realizado. Agendar call de discovery.',
        plan: 'professional'
      },
      {
        id: 'lead_005',
        companyName: 'Radio Biobío',
        contactName: 'Fernando Ortiz',
        contactEmail: 'fortiz@biobio.cl',
        contactPhone: '+56 9 4444 5555',
        source: 'cold_call',
        stage: 'new',
        value: 599000,
        probability: 10,
        expectedCloseDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        assignedTo: 'Carlos Silva',
        lastActivity: new Date(),
        notes: 'Lead recién ingresado. Investigar necesidades.',
        plan: 'enterprise'
      },
      {
        id: 'lead_006',
        companyName: 'Publimetro',
        contactName: 'Carmen Vidal',
        contactEmail: 'cvidal@publimetro.cl',
        contactPhone: '+56 9 6666 7777',
        source: 'website',
        stage: 'closed_won',
        value: 299000,
        probability: 100,
        expectedCloseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        assignedTo: 'María González',
        lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        notes: 'Contrato firmado! Plan Professional por 12 meses.',
        plan: 'professional'
      }
    ]

    setLeads(demoLeads)

    // Calculate stats
    const activeLeads = demoLeads.filter(l => !['closed_won', 'closed_lost'].includes(l.stage))
    const wonLeads = demoLeads.filter(l => l.stage === 'closed_won')
    
    setStats({
      totalLeads: activeLeads.length,
      totalValue: activeLeads.reduce((sum, l) => sum + l.value, 0),
      weightedValue: activeLeads.reduce((sum, l) => sum + (l.value * l.probability / 100), 0),
      avgDealSize: activeLeads.length > 0 ? activeLeads.reduce((sum, l) => sum + l.value, 0) / activeLeads.length : 0,
      conversionRate: demoLeads.length > 0 ? (wonLeads.length / demoLeads.length) * 100 : 0,
      avgCycleTime: 28 // días promedio
    })

    setIsLoading(false)
  }

  const moveLeadStage = (leadId: string, direction: 'forward' | 'back') => {
    const stages: Lead['stage'][] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won']
    
    setLeads(prev => prev.map(lead => {
      if (lead.id !== leadId) return lead
      
      const currentIndex = stages.indexOf(lead.stage)
      if (direction === 'forward' && currentIndex < stages.length - 1) {
        const newStage = stages[currentIndex + 1]
        const newProbability = 
          newStage === 'contacted' ? 20 :
          newStage === 'qualified' ? 40 :
          newStage === 'proposal' ? 60 :
          newStage === 'negotiation' ? 80 :
          newStage === 'closed_won' ? 100 : lead.probability
        
        return { ...lead, stage: newStage, probability: newProbability, lastActivity: new Date() }
      }
      if (direction === 'back' && currentIndex > 0) {
        return { ...lead, stage: stages[currentIndex - 1], lastActivity: new Date() }
      }
      return lead
    }))
  }

  const formatCurrency = (value: number) => {
    return `$${(value / 1000).toFixed(0)}K`
  }

  const getLeadsByStage = (stage: Lead['stage']) => {
    return leads.filter(l => l.stage === stage)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando CRM...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">CRM Comercial</h2>
          <p className="text-slate-400">Pipeline de ventas y gestión de leads</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar lead..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-3 py-1 text-sm rounded ${viewMode === 'pipeline' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
            >
              Lista
            </button>
          </div>
          <NeuromorphicButton variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Nuevo Lead
          </NeuromorphicButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Leads Activos</p>
              <p className="text-2xl font-bold text-white">{stats?.totalLeads}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </NeuromorphicCard>

        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Valor Pipeline</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats?.totalValue || 0)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </NeuromorphicCard>

        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Valor Ponderado</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats?.weightedValue || 0)}</p>
            </div>
            <Target className="w-8 h-8 text-purple-400" />
          </div>
        </NeuromorphicCard>

        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Tasa Conversión</p>
              <p className="text-2xl font-bold text-white">{stats?.conversionRate.toFixed(0)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-400" />
          </div>
        </NeuromorphicCard>

        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Ciclo Promedio</p>
              <p className="text-2xl font-bold text-white">{stats?.avgCycleTime} días</p>
            </div>
            <Clock className="w-8 h-8 text-cyan-400" />
          </div>
        </NeuromorphicCard>
      </div>

      {/* Pipeline View */}
      {viewMode === 'pipeline' && (
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-4">
            {(['new', 'contacted', 'qualified', 'proposal', 'negotiation'] as Lead['stage'][]).map(stage => {
              const stageLeads = getLeadsByStage(stage)
              const stageValue = stageLeads.reduce((sum, l) => sum + l.value, 0)
              const config = STAGE_CONFIG[stage]
              
              return (
                <div key={stage} className="w-72 flex-shrink-0">
                  {/* Stage Header */}
                  <div className={`p-3 rounded-t-lg ${config.color}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{config.name}</span>
                      <span className="text-white/80 text-sm">{stageLeads.length}</span>
                    </div>
                    <p className="text-white/60 text-xs mt-1">
                      {formatCurrency(stageValue)} en pipeline
                    </p>
                  </div>

                  {/* Stage Cards */}
                  <div className="bg-slate-800/30 rounded-b-lg p-2 min-h-[400px] space-y-2">
                    {stageLeads.map(lead => (
                      <div
                        key={lead.id}
                        className="p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-white font-medium text-sm">{lead.companyName}</p>
                            <p className="text-xs text-slate-400">{lead.contactName}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            lead.plan === 'enterprise_plus' ? 'bg-yellow-500/20 text-yellow-400' :
                            lead.plan === 'enterprise' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {lead.plan.replace('_', '+')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-green-400 font-medium">{formatCurrency(lead.value)}</span>
                          <span className="text-slate-400">{lead.probability}% prob.</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            {Math.floor((Date.now() - lead.lastActivity.getTime()) / (1000 * 60 * 60 * 24))}d sin actividad
                          </span>
                          <button
                            onClick={() => moveLeadStage(lead.id, 'forward')}
                            className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {stageLeads.length === 0 && (
                      <div className="text-center py-8 text-slate-500 text-sm">
                        Sin leads en esta etapa
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Won Column */}
            <div className="w-72 flex-shrink-0">
              <div className="p-3 rounded-t-lg bg-green-600">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Ganados
                  </span>
                  <span className="text-white/80 text-sm">{getLeadsByStage('closed_won').length}</span>
                </div>
              </div>
              <div className="bg-green-500/10 rounded-b-lg p-2 min-h-[400px] space-y-2">
                {getLeadsByStage('closed_won').map(lead => (
                  <div
                    key={lead.id}
                    className="p-3 bg-green-500/20 rounded-lg border border-green-500/30"
                  >
                    <p className="text-white font-medium text-sm">{lead.companyName}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-green-400 font-medium text-sm">{formatCurrency(lead.value)}</span>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-3 text-slate-400 text-sm font-medium">Empresa</th>
                  <th className="text-left p-3 text-slate-400 text-sm font-medium">Contacto</th>
                  <th className="text-left p-3 text-slate-400 text-sm font-medium">Etapa</th>
                  <th className="text-left p-3 text-slate-400 text-sm font-medium">Valor</th>
                  <th className="text-left p-3 text-slate-400 text-sm font-medium">Prob.</th>
                  <th className="text-left p-3 text-slate-400 text-sm font-medium">Asignado</th>
                  <th className="text-left p-3 text-slate-400 text-sm font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {leads.filter(l => 
                  l.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  l.contactName.toLowerCase().includes(searchTerm.toLowerCase())
                ).map(lead => {
                  const config = STAGE_CONFIG[lead.stage]
                  return (
                    <tr key={lead.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                      <td className="p-3">
                        <p className="text-white font-medium">{lead.companyName}</p>
                        <p className="text-xs text-slate-400">{lead.plan.replace('_', '+')}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-white text-sm">{lead.contactName}</p>
                        <p className="text-xs text-slate-400">{lead.contactEmail}</p>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${config.color} text-white`}>
                          {config.name}
                        </span>
                      </td>
                      <td className="p-3 text-green-400 font-medium">{formatCurrency(lead.value)}</td>
                      <td className="p-3 text-white">{lead.probability}%</td>
                      <td className="p-3 text-slate-300 text-sm">{lead.assignedTo}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 text-slate-400 hover:text-blue-400">
                            <Phone className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-green-400">
                            <Mail className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-purple-400">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </NeuromorphicCard>
      )}
    </div>
  )
}

export default CommercialCRM
