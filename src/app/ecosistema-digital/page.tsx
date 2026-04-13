'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Globe, Server, Zap, Target, BarChart3,
  TrendingUp, DollarSign, Eye, MousePointer,
  Gauge, CheckCircle, Settings, Volume2,
} from 'lucide-react'
import { AdServerTab } from './_components/AdServerTab'
import { ProgrammaticTab } from './_components/ProgrammaticTab'

const DIGITAL_CAMPAIGNS = [
  {
    id: '1',
    name: 'Retail Summer Campaign',
    type: 'Display + Audio',
    status: 'active',
    budget: 25000000,
    spent: 18750000,
    impressions: 2450000,
    clicks: 73500,
    ctr: 3.0,
    cpm: 7650,
    targeting: ['Edad: 25-45', 'Intereses: Shopping', 'Ubicación: Santiago'],
    formats: ['Banner 728x90', 'Audio 30s', 'Native'],
  },
  {
    id: '2',
    name: 'Tech Product Launch',
    type: 'Video + Programmatic',
    status: 'active',
    budget: 40000000,
    spent: 32000000,
    impressions: 1850000,
    clicks: 92500,
    ctr: 5.0,
    cpm: 17300,
    targeting: ['Edad: 28-50', 'Intereses: Technology', 'Comportamiento: Early Adopters'],
    formats: ['Video Pre-roll', 'Display Rich Media', 'Audio Streaming'],
  },
  {
    id: '3',
    name: 'Financial Services Awareness',
    type: 'Audio + Native',
    status: 'paused',
    budget: 15000000,
    spent: 8250000,
    impressions: 980000,
    clicks: 29400,
    ctr: 3.0,
    cpm: 8420,
    targeting: ['Edad: 35-55', 'Ingresos: Alto', 'Intereses: Inversiones'],
    formats: ['Audio 15s', 'Native Article', 'Podcast Sponsorship'],
  },
]

export default function EcosistemaDigital() {
  const [activeTab, setActiveTab] = useState('adserver')
  const [isServerRunning, setIsServerRunning] = useState(true)
  const [realTimeStats, setRealTimeStats] = useState({
    requests: 2847392,
    impressions: 2654821,
    clicks: 89247,
    revenue: 45892000,
    fillRate: 94.2,
    latency: 12.5,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeStats(prev => ({
        ...prev,
        requests: prev.requests + Math.floor(Math.random() * 1000),
        impressions: prev.impressions + Math.floor(Math.random() * 800),
        clicks: prev.clicks + Math.floor(Math.random() * 50),
        revenue: prev.revenue + Math.floor(Math.random() * 10000),
        latency: 10 + Math.random() * 10,
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const kpis = [
    { label: 'Requests', value: `${(realTimeStats.requests / 1000000).toFixed(1)}M`, icon: Server, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'from-blue-900/30 to-cyan-900/30', trend: TrendingUp },
    { label: 'Impressions', value: `${(realTimeStats.impressions / 1000000).toFixed(1)}M`, icon: Eye, color: 'text-green-400', border: 'border-green-500/30', bg: 'from-green-900/30 to-emerald-900/30', trend: TrendingUp },
    { label: 'Clicks', value: `${(realTimeStats.clicks / 1000).toFixed(0)}K`, icon: MousePointer, color: 'text-purple-400', border: 'border-purple-500/30', bg: 'from-purple-900/30 to-violet-900/30', trend: TrendingUp },
    { label: 'Revenue', value: `$${(realTimeStats.revenue / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'text-orange-400', border: 'border-orange-500/30', bg: 'from-orange-900/30 to-amber-900/30', trend: TrendingUp },
    { label: 'Fill Rate', value: `${realTimeStats.fillRate}%`, icon: Target, color: 'text-pink-400', border: 'border-pink-500/30', bg: 'from-pink-900/30 to-rose-900/30', trend: CheckCircle },
    { label: 'Latency', value: `${realTimeStats.latency.toFixed(0)}ms`, icon: Zap, color: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'from-indigo-900/30 to-blue-900/30', trend: Gauge },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              <Globe className="inline h-8 w-8 mr-2 text-blue-400" />
              Ecosistema Digital TIER 0
            </h1>
            <p className="text-slate-300">
              Ad Server nativo, programmatic advertising y audio inteligente unificado
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isServerRunning ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm text-slate-300">
                Ad Server {isServerRunning ? 'Online' : 'Offline'}
              </span>
            </div>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              ⚡ {realTimeStats.latency.toFixed(1)}ms latencia
            </Badge>
            <Button variant="outline" className="border-slate-500 text-slate-300">
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </div>
        </div>

        {/* KPIs en Tiempo Real */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon
            const Trend = kpi.trend
            return (
              <Card key={kpi.label} className={`bg-gradient-to-br ${kpi.bg} ${kpi.border}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-5 w-5 ${kpi.color}`} />
                    <Trend className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{kpi.value}</div>
                  <div className={`text-xs ${kpi.color}`}>{kpi.label}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Tabs Principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
            <TabsTrigger value="adserver" className="data-[state=active]:bg-blue-600">
              🖥️ Ad Server Nativo
            </TabsTrigger>
            <TabsTrigger value="programmatic" className="data-[state=active]:bg-purple-600">
              🎯 Programmatic
            </TabsTrigger>
            <TabsTrigger value="audio" className="data-[state=active]:bg-green-600">
              🎵 Audio Inteligente
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-600">
              📊 Analytics Digital
            </TabsTrigger>
          </TabsList>

          <TabsContent value="adserver" className="space-y-6">
            <AdServerTab
              isServerRunning={isServerRunning}
              onToggleServer={() => setIsServerRunning(v => !v)}
              digitalCampaigns={DIGITAL_CAMPAIGNS}
            />
          </TabsContent>

          <TabsContent value="programmatic" className="space-y-6">
            <ProgrammaticTab />
          </TabsContent>

          <TabsContent value="audio" className="space-y-6">
            <div className="text-center py-12">
              <Volume2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-400 mb-2">Audio Inteligente</h3>
              <p className="text-slate-500">Plataforma de audio con personalización extrema</p>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-400 mb-2">Analytics Digital</h3>
              <p className="text-slate-500">Measurement & Attribution avanzado</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-slate-400 text-sm">
          <p>🌐 ECOSISTEMA DIGITAL TIER 0 - Powered by Native Ad Server</p>
          <p>High-Performance Serving • Advanced Targeting • Real-Time Analytics</p>
        </div>
      </div>
    </div>
  )
}
