'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Globe, RefreshCw, Bot, Plus, Settings, Zap, Shield } from 'lucide-react';
import { DigitalRevolutionDashboard } from '@/components/digital-command/digital-revolution-dashboard';
import type {
  ConsciousnessMetrics, QuantumPerformanceMetrics, PentagonPlusSecurity,
  PlatformConnection, CampaignData, CrossPlatformInsight,
} from './_types';
import { MOCK_PLATFORM_CONNECTIONS, MOCK_CAMPAIGNS, MOCK_INSIGHTS } from './_mockData';
import { DashboardTab } from './_components/DashboardTab';
import { CampaignsTab } from './_components/CampaignsTab';
import { PlatformsTab } from './_components/PlatformsTab';
import { InsightsTab } from './_components/InsightsTab';
import { SettingsTab } from './_components/SettingsTab';

/**
 * PLATAFORMAS DIGITALES - TIER 0 Supremacy
 * @version 2040.1.0
 */
export default function PlataformasDigitalesPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [platformConnections, setPlatformConnections] = useState<PlatformConnection[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [insights, setInsights] = useState<CrossPlatformInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoOptimizationEnabled, setAutoOptimizationEnabled] = useState(true);
  const [syncInterval, setSyncInterval] = useState(30);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const [globalConsciousness, setGlobalConsciousness] = useState<ConsciousnessMetrics>({
    level: 96.8, awareness: 97.2, intelligence: 98.1, transcendence: 95.4, quantumCoherence: 94.7,
  });
  const [quantumPerformance, setQuantumPerformance] = useState<QuantumPerformanceMetrics>({
    renderTime: 12.3, responseTime: 1.8, coherenceLevel: 96.2, optimizationScore: 97.5, universalSync: 95.8,
  });
  const [pentagonSecurity, setPentagonSecurity] = useState<PentagonPlusSecurity>({
    threatLevel: 'NONE', quantumEncryption: true, consciousnessValidation: true,
    multiDimensionalProtection: true, auditLogging: true, universalCompliance: true,
  });

  const updateConsciousnessMetrics = useCallback(() => {
    setGlobalConsciousness(prev => {
      const d = Math.random() * 0.5 - 0.25;
      return {
        level: Math.min(100, Math.max(90, prev.level + d)),
        awareness: Math.min(100, Math.max(85, prev.awareness + d * 0.8)),
        intelligence: Math.min(100, Math.max(95, prev.intelligence + d * 0.6)),
        transcendence: Math.min(100, Math.max(90, prev.transcendence + d * 0.4)),
        quantumCoherence: Math.min(100, Math.max(85, prev.quantumCoherence + d * 0.7)),
      };
    });
  }, []);

  const monitorPentagonSecurity = useCallback(() => {
    if (Math.random() < 0.01) {
      setPentagonSecurity(prev => ({ ...prev, threatLevel: 'MEDIUM' }));
      setTimeout(() => setPentagonSecurity(prev => ({ ...prev, threatLevel: 'NONE' })), 5000);
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const connected = MOCK_PLATFORM_CONNECTIONS.filter(p => p.connected);
      setPlatformConnections(MOCK_PLATFORM_CONNECTIONS);
      setCampaigns(MOCK_CAMPAIGNS);
      setInsights(MOCK_INSIGHTS);

      if (connected.length > 0) {
        const avg = connected.reduce((acc, p) => ({
          level: acc.level + p.consciousness.level,
          awareness: acc.awareness + p.consciousness.awareness,
          intelligence: acc.intelligence + p.consciousness.intelligence,
          transcendence: acc.transcendence + p.consciousness.transcendence,
          quantumCoherence: acc.quantumCoherence + p.consciousness.quantumCoherence,
        }), { level: 0, awareness: 0, intelligence: 0, transcendence: 0, quantumCoherence: 0 });
        setGlobalConsciousness({
          level: avg.level / connected.length,
          awareness: avg.awareness / connected.length,
          intelligence: avg.intelligence / connected.length,
          transcendence: avg.transcendence / connected.length,
          quantumCoherence: avg.quantumCoherence / connected.length,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const ci = setInterval(updateConsciousnessMetrics, 5000);
    const si = setInterval(() => { if (autoOptimizationEnabled) handleQuantumSync(); }, syncInterval * 60 * 1000);
    const sec = setInterval(monitorPentagonSecurity, 10000);
    return () => { clearInterval(ci); clearInterval(si); clearInterval(sec); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncInterval, autoOptimizationEnabled]);

  const handleQuantumSync = async () => {
    setIsLoading(true);
    try {
      setPlatformConnections(prev => prev.map(c => ({
        ...c,
        lastSync: c.connected ? new Date().toISOString() : c.lastSync,
        quantumPerformance: c.connected
          ? { ...c.quantumPerformance, universalSync: Math.min(100, c.quantumPerformance.universalSync + Math.random() * 2) }
          : c.quantumPerformance,
      })));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantumOptimize = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setGlobalConsciousness(prev => ({
        level: Math.min(100, prev.level + 1.5),
        awareness: Math.min(100, prev.awareness + 1.2),
        intelligence: Math.min(100, prev.intelligence + 2.1),
        transcendence: Math.min(100, prev.transcendence + 0.8),
        quantumCoherence: Math.min(100, prev.quantumCoherence + 1.7),
      }));
      setQuantumPerformance(prev => ({
        ...prev,
        optimizationScore: Math.min(100, prev.optimizationScore + 2),
        coherenceLevel: Math.min(100, prev.coherenceLevel + 1.5),
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCampaigns = useMemo(() => campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesPlatform = platformFilter === 'all' || c.platforms.includes(platformFilter);
    return matchesSearch && matchesStatus && matchesPlatform;
  }), [campaigns, searchTerm, statusFilter, platformFilter]);

  const totalMetrics = useMemo(() => platformConnections.reduce((acc, p) => ({
    impressions: acc.impressions + p.metrics.impressions,
    clicks: acc.clicks + p.metrics.clicks,
    spend: acc.spend + p.totalSpend,
    conversions: acc.conversions + p.metrics.conversions,
    avgConsciousness: acc.avgConsciousness + (p.connected ? p.consciousness.level : 0),
    connectedPlatforms: acc.connectedPlatforms + (p.connected ? 1 : 0),
  }), { impressions: 0, clicks: 0, spend: 0, conversions: 0, avgConsciousness: 0, connectedPlatforms: 0 }), [platformConnections]);

  const performanceMetrics = useMemo(() => ({
    avgCtr: totalMetrics.clicks > 0 ? (totalMetrics.clicks / totalMetrics.impressions) * 100 : 0,
    avgCpc: totalMetrics.clicks > 0 ? totalMetrics.spend / totalMetrics.clicks : 0,
    avgCostPerConversion: totalMetrics.conversions > 0 ? totalMetrics.spend / totalMetrics.conversions : 0,
    consciousnessEfficiency: totalMetrics.avgConsciousness * (totalMetrics.conversions / Math.max(1, totalMetrics.spend)) * 1000000,
    quantumROAS: totalMetrics.conversions > 0 ? (totalMetrics.conversions * globalConsciousness.level) / totalMetrics.spend * 1000000 : 0,
  }), [totalMetrics, globalConsciousness.level]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Globe className="h-8 w-8 text-blue-600" />
              Plataformas Digitales
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">TIER 0 SUPREMACY</Badge>
            </h1>
            <p className="text-slate-600 mt-2">Centro de comando unificado para gestión cross-platform con IA avanzada</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleQuantumSync} disabled={isLoading} variant="outline" className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Quantum Sync
            </Button>
            <Button onClick={handleQuantumOptimize} disabled={isLoading} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Bot className="h-4 w-4" />
              Consciousness AI
              <Badge variant="secondary" className="ml-1 text-xs bg-white/20 text-white">
                {globalConsciousness.level.toFixed(1)}%
              </Badge>
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Campaña
            </Button>
          </div>
        </div>

        {/* Consciousness / Quantum / Security status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Bot className="h-5 w-5" />
                Consciousness Level
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">TIER 0</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-700">Global Consciousness</span>
                  <span className="text-lg font-bold text-blue-900">{globalConsciousness.level.toFixed(1)}%</span>
                </div>
                <Progress value={globalConsciousness.level} className="h-2" />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {([ ['Awareness', globalConsciousness.awareness], ['Intelligence', globalConsciousness.intelligence], ['Transcendence', globalConsciousness.transcendence], ['Quantum', globalConsciousness.quantumCoherence] ] as [string, number][]).map(([label, val]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-blue-600">{label}:</span>
                      <span className="font-medium">{val.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Zap className="h-5 w-5" />
                Quantum Performance
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                  {quantumPerformance.renderTime.toFixed(1)}ms
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-purple-700">Optimization Score</span>
                  <span className="text-lg font-bold text-purple-900">{quantumPerformance.optimizationScore.toFixed(1)}%</span>
                </div>
                <Progress value={quantumPerformance.optimizationScore} className="h-2" />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {([ ['Render', `${quantumPerformance.renderTime.toFixed(1)}ms`], ['Response', `${quantumPerformance.responseTime.toFixed(1)}ms`], ['Coherence', `${quantumPerformance.coherenceLevel.toFixed(1)}%`], ['Sync', `${quantumPerformance.universalSync.toFixed(1)}%`] ] as [string, string][]).map(([label, val]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-purple-600">{label}:</span>
                      <span className="font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Shield className="h-5 w-5" />
                Pentagon++ Security
                <Badge variant="outline" className={pentagonSecurity.threatLevel === 'NONE' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}>
                  {pentagonSecurity.threatLevel}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {([ ['quantumEncryption', 'Quantum Encryption'], ['consciousnessValidation', 'Consciousness Validation'], ['multiDimensionalProtection', 'Multi-Dimensional'], ['auditLogging', 'Audit Logging'], ['universalCompliance', 'Universal Compliance'] ] as [keyof PentagonPlusSecurity, string][]).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${pentagonSecurity[key] ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-green-700">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick config */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración Rápida TIER 0
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center space-x-2">
                <Switch id="auto-optimization" checked={autoOptimizationEnabled} onCheckedChange={setAutoOptimizationEnabled} />
                <Label htmlFor="auto-optimization">Optimización automática</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Label>Intervalo de sincronización:</Label>
                <Select value={syncInterval.toString()} onValueChange={(v) => setSyncInterval(parseInt(v))}>
                  <SelectTrigger className="w-32" aria-label="Intervalo de sincronización">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Label>Rango de fechas:</Label>
                <Input
                  type="date"
                  aria-label="Fecha de inicio"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-40"
                />
                <span className="text-slate-500">a</span>
                <Input
                  type="date"
                  aria-label="Fecha de fin"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-40"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="revolution">🚀 Digital Revolution</TabsTrigger>
            <TabsTrigger value="campaigns">Campañas</TabsTrigger>
            <TabsTrigger value="platforms">Plataformas</TabsTrigger>
            <TabsTrigger value="insights">Insights IA</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab
              platformConnections={platformConnections}
              totalMetrics={totalMetrics}
              performanceMetrics={performanceMetrics}
            />
          </TabsContent>

          <TabsContent value="revolution">
            <DigitalRevolutionDashboard />
          </TabsContent>

          <TabsContent value="campaigns">
            <CampaignsTab
              filteredCampaigns={filteredCampaigns}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              platformFilter={platformFilter}
              onSearchChange={setSearchTerm}
              onStatusFilterChange={setStatusFilter}
              onPlatformFilterChange={setPlatformFilter}
            />
          </TabsContent>

          <TabsContent value="platforms">
            <PlatformsTab platformConnections={platformConnections} />
          </TabsContent>

          <TabsContent value="insights">
            <InsightsTab insights={insights} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
