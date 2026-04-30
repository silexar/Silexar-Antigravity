'use client'

/**
 * ðŸ’¼ SILEXAR PULSE - CRM Comercial
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
import { formatCurrency } from '@/lib/utils'
import { NeuCard, NeuButton, StatusBadge } from './_sdk/AdminDesignSystem'
import { getShadow } from './_sdk/AdminDesignSystem'
import { N } from './_sdk/AdminDesignSystem'
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
  new: { name: 'Nuevo', color: '#64748b', textColor: '#cbd5e1' },
  contacted: { name: 'Contactado', color: '#6888ff', textColor: '#93c5fd' },
  qualified: { name: 'Calificado', color: '#6888ff', textColor: '#d8b4fe' },
  proposal: { name: 'Propuesta', color: '#ea580c', textColor: '#fdba74' },
  negotiation: { name: 'Negociación', color: '#ca8a04', textColor: '#fde047' },
  closed_won: { name: 'Ganado', color: '#6888ff', textColor: '#86efac' },
  closed_lost: { name: 'Perdido', color: '#6888ff', textColor: '#fca5a5' }
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

  const getLeadsByStage = (stage: Lead['stage']) => {
    return leads.filter(l => l.stage === stage)
  }

  const getPlanBadge = (plan: Lead['plan']) => {
    const planColors = {
      starter: { bg: '#6888ff20', text: '#60a5fa' },
      professional: { bg: '#6888ff20', text: '#60a5fa' },
      enterprise: { bg: '#6888ff20', text: '#c084fc' },
      enterprise_plus: { bg: '#6888ff20', text: '#facc15' }
    }
    const colors = planColors[plan]
    return (
      <span style={{
        fontSize: '0.75rem',
        padding: '0.125rem 0.5rem',
        borderRadius: '0.25rem',
        background: colors.bg,
        color: colors.text
      }}>
        {plan.replace('_', '+')}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '4px solid rgba(59, 130, 246, 0.3)',
            borderTopColor: '#6888ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: N.textSub }}>Cargando CRM...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: N.text }}>CRM Comercial</h2>
          <p style={{ color: N.textSub }}>Pipeline de ventas y gestión de leads</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: N.textSub }} />
            <input
              type="text"
              placeholder="Buscar lead..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                paddingLeft: '2.25rem',
                paddingRight: '1rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                background: N.base,
                border: `1px solid ${N.dark}`,
                borderRadius: '0.5rem',
                color: N.text,
                fontSize: '0.875rem',
                width: '12rem'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: N.base, borderRadius: '0.5rem', padding: '0.25rem' }}>
            <button
              onClick={() => setViewMode('pipeline')}
              style={{
                padding: '0.25rem 0.75rem',
                fontSize: '0.875rem',
                borderRadius: '0.25rem',
                background: viewMode === 'pipeline' ? '#6888ff' : 'transparent',
                color: viewMode === 'pipeline' ? '#fff' : N.textSub,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Pipeline
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '0.25rem 0.75rem',
                fontSize: '0.875rem',
                borderRadius: '0.25rem',
                background: viewMode === 'list' ? '#6888ff' : 'transparent',
                color: viewMode === 'list' ? '#fff' : N.textSub,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Lista
            </button>
          </div>
          <NeuButton variant="primary" onClick={() => { }}>
            <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
            Nuevo Lead
          </NeuButton>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        <NeuCard style={{ boxShadow: getShadow(), padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: N.textSub }}>Leads Activos</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: N.text }}>{stats?.totalLeads}</p>
            </div>
            <Users style={{ width: '2rem', height: '2rem', color: '#60a5fa' }} />
          </div>
        </NeuCard>

        <NeuCard style={{ boxShadow: getShadow(), padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: N.textSub }}>Valor Pipeline</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: N.text }}>{formatCurrency(stats?.totalValue || 0)}</p>
            </div>
            <DollarSign style={{ width: '2rem', height: '2rem', color: '#4ade80' }} />
          </div>
        </NeuCard>

        <NeuCard style={{ boxShadow: getShadow(), padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: N.textSub }}>Valor Ponderado</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: N.text }}>{formatCurrency(stats?.weightedValue || 0)}</p>
            </div>
            <Target style={{ width: '2rem', height: '2rem', color: '#c084fc' }} />
          </div>
        </NeuCard>

        <NeuCard style={{ boxShadow: getShadow(), padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: N.textSub }}>Tasa Conversión</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: N.text }}>{stats?.conversionRate.toFixed(0)}%</p>
            </div>
            <TrendingUp style={{ width: '2rem', height: '2rem', color: '#fb923c' }} />
          </div>
        </NeuCard>

        <NeuCard style={{ boxShadow: getShadow(), padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: N.textSub }}>Ciclo Promedio</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: N.text }}>{stats?.avgCycleTime} días</p>
            </div>
            <Clock style={{ width: '2rem', height: '2rem', color: '#22d3ee' }} />
          </div>
        </NeuCard>
      </div>

      {/* Pipeline View */}
      {viewMode === 'pipeline' && (
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: '1rem', minWidth: 'max-content', paddingBottom: '1rem' }}>
            {(['new', 'contacted', 'qualified', 'proposal', 'negotiation'] as Lead['stage'][]).map(stage => {
              const stageLeads = getLeadsByStage(stage)
              const stageValue = stageLeads.reduce((sum, l) => sum + l.value, 0)
              const config = STAGE_CONFIG[stage]

              return (
                <div key={stage} style={{ width: '18rem', flexShrink: 0 }}>
                  {/* Stage Header */}
                  <div style={{ padding: '0.75rem', borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem', background: config.color }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: '#fff', fontWeight: 500 }}>{config.name}</span>
                      <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>{stageLeads.length}</span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {formatCurrency(stageValue)} en pipeline
                    </p>
                  </div>

                  {/* Stage Cards */}
                  <div style={{ background: 'rgba(30,41,59,0.3)', borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem', padding: '0.5rem', minHeight: '25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {stageLeads.map(lead => (
                      <div
                        key={lead.id}
                        style={{
                          padding: '0.75rem',
                          background: N.base,
                          borderRadius: '0.5rem',
                          border: `1px solid ${N.dark}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = N.dark}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <div>
                            <p style={{ color: N.text, fontWeight: 500, fontSize: '0.875rem' }}>{lead.companyName}</p>
                            <p style={{ fontSize: '0.75rem', color: N.textSub }}>{lead.contactName}</p>
                          </div>
                          {getPlanBadge(lead.plan)}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                          <span style={{ color: '#4ade80', fontWeight: 500 }}>{formatCurrency(lead.value)}</span>
                          <span style={{ color: N.textSub }}>{lead.probability}% prob.</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', color: N.textSub }}>
                            {Math.floor((Date.now() - lead.lastActivity.getTime()) / (1000 * 60 * 60 * 24))}d sin actividad
                          </span>
                          <button
                            onClick={() => moveLeadStage(lead.id, 'forward')}
                            style={{ padding: '0.25rem', color: N.textSub, background: 'none', border: 'none', cursor: 'pointer' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#60a5fa'}
                            onMouseLeave={(e) => e.currentTarget.style.color = N.textSub}
                          >
                            <ArrowRight style={{ width: '1rem', height: '1rem' }} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {stageLeads.length === 0 && (
                      <div style={{ textAlign: 'center', paddingTop: '2rem', color: N.textSub, fontSize: '0.875rem' }}>
                        Sin leads en esta etapa
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Won Column */}
            <div style={{ width: '18rem', flexShrink: 0 }}>
              <div style={{ padding: '0.75rem', borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem', background: '#6888ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#fff', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Award style={{ width: '1rem', height: '1rem' }} />
                    Ganados
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>{getLeadsByStage('closed_won').length}</span>
                </div>
              </div>
              <div style={{ background: 'rgba(34,197,94,0.1)', borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem', padding: '0.5rem', minHeight: '25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {getLeadsByStage('closed_won').map(lead => (
                  <div
                    key={lead.id}
                    style={{
                      padding: '0.75rem',
                      background: 'rgba(34,197,94,0.2)',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(34,197,94,0.3)'
                    }}
                  >
                    <p style={{ color: N.text, fontWeight: 500, fontSize: '0.875rem' }}>{lead.companyName}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                      <span style={{ color: '#4ade80', fontWeight: 500, fontSize: '0.875rem' }}>{formatCurrency(lead.value)}</span>
                      <CheckCircle style={{ width: '1rem', height: '1rem', color: '#4ade80' }} />
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
        <NeuCard style={{ boxShadow: getShadow(), padding: '1rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${N.dark}` }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: N.textSub, fontSize: '0.875rem', fontWeight: 500 }}>Empresa</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: N.textSub, fontSize: '0.875rem', fontWeight: 500 }}>Contacto</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: N.textSub, fontSize: '0.875rem', fontWeight: 500 }}>Etapa</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: N.textSub, fontSize: '0.875rem', fontWeight: 500 }}>Valor</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: N.textSub, fontSize: '0.875rem', fontWeight: 500 }}>Prob.</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: N.textSub, fontSize: '0.875rem', fontWeight: 500 }}>Asignado</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: N.textSub, fontSize: '0.875rem', fontWeight: 500 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {leads.filter(l =>
                  l.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  l.contactName.toLowerCase().includes(searchTerm.toLowerCase())
                ).map(lead => {
                  const config = STAGE_CONFIG[lead.stage]
                  return (
                    <tr key={lead.id} style={{ borderBottom: `1px solid ${N.dark}50`, transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30,41,59,0.3)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.75rem' }}>
                        <p style={{ color: N.text, fontWeight: 500 }}>{lead.companyName}</p>
                        <p style={{ fontSize: '0.75rem', color: N.textSub }}>{lead.plan.replace('_', '+')}</p>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <p style={{ color: N.text, fontSize: '0.875rem' }}>{lead.contactName}</p>
                        <p style={{ fontSize: '0.75rem', color: N.textSub }}>{lead.contactEmail}</p>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <StatusBadge status={lead.stage === 'closed_won' ? 'success' : lead.stage === 'closed_lost' ? 'danger' : 'neutral'} label={STAGE_CONFIG[lead.stage].name} />
                      </td>
                      <td style={{ padding: '0.75rem', color: '#4ade80', fontWeight: 500 }}>{formatCurrency(lead.value)}</td>
                      <td style={{ padding: '0.75rem', color: N.text }}>{lead.probability}%</td>
                      <td style={{ padding: '0.75rem', color: N.textSub, fontSize: '0.875rem' }}>{lead.assignedTo}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <button style={{ padding: '0.375rem', color: N.textSub, background: 'none', border: 'none', cursor: 'pointer' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#60a5fa'}
                            onMouseLeave={(e) => e.currentTarget.style.color = N.textSub}
                          >
                            <Phone style={{ width: '1rem', height: '1rem' }} />
                          </button>
                          <button style={{ padding: '0.375rem', color: N.textSub, background: 'none', border: 'none', cursor: 'pointer' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#4ade80'}
                            onMouseLeave={(e) => e.currentTarget.style.color = N.textSub}
                          >
                            <Mail style={{ width: '1rem', height: '1rem' }} />
                          </button>
                          <button style={{ padding: '0.375rem', color: N.textSub, background: 'none', border: 'none', cursor: 'pointer' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#c084fc'}
                            onMouseLeave={(e) => e.currentTarget.style.color = N.textSub}
                          >
                            <MessageSquare style={{ width: '1rem', height: '1rem' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </NeuCard>
      )}
    </div>
  )
}

export default CommercialCRM
