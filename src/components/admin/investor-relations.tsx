'use client'

/**
 * 👥 SILEXAR PULSE - Investor Relations Dashboard
 * Métricas e informes para inversores
 * 
 * @description Gestión de IR:
 * - Métricas para board
 * - Cap table management
 * - Runway tracking
 * - Preparación de decks
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
  TrendingUp,
  DollarSign,
  Calendar,
  PieChart,
  Download,
  AlertTriangle,
  Target,
  Briefcase
} from 'lucide-react'

interface InvestorMetrics {
  runway: number
  monthlyBurn: number
  cashBalance: number
  lastRoundValuation: number
  currentMRR: number
  growthRate: number
  employeeCount: number
  customersCount: number
}

interface Shareholder {
  name: string
  type: 'founder' | 'investor' | 'employee' | 'advisor'
  shares: number
  percentage: number
  investmentDate?: Date
  investmentAmount?: number
}

interface BoardMeeting {
  id: string
  date: Date
  title: string
  status: 'scheduled' | 'completed' | 'cancelled'
  attendees: string[]
  deckReady: boolean
}

export function InvestorRelations() {
  const [metrics, setMetrics] = useState<InvestorMetrics | null>(null)
  const [shareholders, setShareholders] = useState<Shareholder[]>([])
  const [meetings, setMeetings] = useState<BoardMeeting[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadIRData()
  }, [])

  const loadIRData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setMetrics({
      runway: 24,
      monthlyBurn: 185000,
      cashBalance: 4500000,
      lastRoundValuation: 25000000,
      currentMRR: 847500,
      growthRate: 12.5,
      employeeCount: 47,
      customersCount: 156
    })

    setShareholders([
      { name: 'Fundador & CEO', type: 'founder', shares: 5000000, percentage: 45.0, investmentDate: new Date('2021-01-01') },
      { name: 'Sequoia Capital', type: 'investor', shares: 2000000, percentage: 18.0, investmentDate: new Date('2022-06-15'), investmentAmount: 5000000 },
      { name: 'a16z', type: 'investor', shares: 1500000, percentage: 13.5, investmentDate: new Date('2023-03-20'), investmentAmount: 8000000 },
      { name: 'Employee Pool', type: 'employee', shares: 1500000, percentage: 13.5 },
      { name: 'Angel Investors', type: 'investor', shares: 800000, percentage: 7.2, investmentAmount: 500000 },
      { name: 'Advisors', type: 'advisor', shares: 300000, percentage: 2.8 }
    ])

    setMeetings([
      {
        id: 'bm_001',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        title: 'Board Meeting Q4 2024',
        status: 'scheduled',
        attendees: ['CEO', 'CFO', 'Sequoia Partner', 'a16z Partner'],
        deckReady: false
      },
      {
        id: 'bm_002',
        date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        title: 'Board Meeting Q3 2024',
        status: 'completed',
        attendees: ['CEO', 'CFO', 'Sequoia Partner', 'a16z Partner'],
        deckReady: true
      }
    ])

    setIsLoading(false)
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'founder': return 'bg-purple-500/20 text-purple-400'
      case 'investor': return 'bg-blue-500/20 text-blue-400'
      case 'employee': return 'bg-green-500/20 text-green-400'
      case 'advisor': return 'bg-yellow-500/20 text-yellow-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Investor Relations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-400" />
          Investor Relations Dashboard
        </h3>
        <NeuromorphicButton variant="primary" size="sm">
          <Download className="w-4 h-4 mr-1" />
          Export Board Deck
        </NeuromorphicButton>
      </div>

      {/* Key Metrics for Investors */}
      <div className="grid grid-cols-4 gap-4">
        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-green-400" />
            <span className={`text-xs ${metrics.runway > 18 ? 'text-green-400' : 'text-yellow-400'}`}>
              {metrics.runway > 18 ? '✓ Healthy' : '⚠️ Monitor'}
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.runway} meses</p>
          <p className="text-xs text-slate-400">Runway</p>
        </NeuromorphicCard>

        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(metrics.cashBalance)}</p>
          <p className="text-xs text-slate-400">Cash Balance</p>
        </NeuromorphicCard>

        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-green-400">+{metrics.growthRate}% MoM</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(metrics.currentMRR)}</p>
          <p className="text-xs text-slate-400">MRR</p>
        </NeuromorphicCard>

        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(metrics.lastRoundValuation)}</p>
          <p className="text-xs text-slate-400">Last Valuation</p>
        </NeuromorphicCard>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-red-500/10 rounded-lg text-center">
          <p className="text-lg font-bold text-red-400">{formatCurrency(metrics.monthlyBurn)}</p>
          <p className="text-xs text-slate-400">Monthly Burn</p>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <p className="text-lg font-bold text-white">{metrics.employeeCount}</p>
          <p className="text-xs text-slate-400">Empleados</p>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <p className="text-lg font-bold text-white">{metrics.customersCount}</p>
          <p className="text-xs text-slate-400">Clientes</p>
        </div>
      </div>

      {/* Upcoming Board Meeting Alert */}
      {meetings.filter(m => m.status === 'scheduled').map(meeting => (
        <div key={meeting.id} className={`p-4 rounded-lg border ${
          meeting.deckReady ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-400" />
              <div>
                <span className="text-white font-medium">{meeting.title}</span>
                <p className="text-xs text-slate-400">{meeting.date.toLocaleDateString()}</p>
              </div>
            </div>
            {!meeting.deckReady && (
              <span className="text-xs px-2 py-1 bg-yellow-500 text-black rounded flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Deck pendiente
              </span>
            )}
          </div>
        </div>
      ))}

      {/* Cap Table */}
      <NeuromorphicCard variant="embossed" className="p-4">
        <h4 className="text-white font-medium mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-purple-400" />
          Cap Table
        </h4>
        <div className="space-y-2">
          {shareholders.map((sh, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded ${getTypeColor(sh.type)}`}>
                  {sh.type}
                </span>
                <span className="text-white">{sh.name}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-slate-400 text-sm">{sh.shares.toLocaleString()} shares</span>
                <span className="text-white font-bold">{sh.percentage}%</span>
                <div className="w-24 bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${sh.percentage * 2}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </NeuromorphicCard>
    </div>
  )
}

export default InvestorRelations
