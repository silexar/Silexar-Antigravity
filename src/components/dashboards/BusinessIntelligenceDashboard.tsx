'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Eye, Clock, Target, Zap, type LucideIcon } from 'lucide-react';
import { NarrativeFlowDiagram } from './NarrativeFlowDiagram';
import { MetricsFilters } from './MetricsFilters';
import { useSystemMonitor } from '@/hooks/use-system-monitor';
import ExecutiveReportsDashboard from './ExecutiveReportsDashboard';

interface DashboardMetrics {
  totalRevenue: number;
  totalInteractions: number;
  avgAttentionTime: number;
  conversionRate: number;
  revenueGrowth: number;
  interactionGrowth: number;
}

interface AttentionMetric {
  date: string;
  attention: number;
  engagement: number;
  conversion: number;
}

interface UtilityMetric {
  model: string;
  revenue: number;
  roi: number;
  interactions: number;
  avgValue: number;
}

interface NarrativeNode {
  id: string;
  name: string;
  stage: string;
  interactions: number;
  dropoff: number;
  completion: number;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export function BusinessIntelligenceDashboard() {
  const { recordAPICall, recordError, recordInteraction } = useSystemMonitor();
  
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [attentionData, setAttentionData] = useState<AttentionMetric[]>([]);
  const [utilityData, setUtilityData] = useState<UtilityMetric[]>([]);
  const [narrativeData, setNarrativeData] = useState<NarrativeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedContract, setSelectedContract] = useState('all');

  useEffect(() => {
    const abortController = new AbortController();
    
    fetchDashboardData(abortController.signal);
    
    return () => {
      abortController.abort();
    };
  }, [selectedTimeRange, selectedContract]);

  const fetchDashboardData = async (signal?: AbortSignal) => {
    const startTime = Date.now();
    
    try {
      setLoading(true);
      
      // Fetch main metrics
      const metricsStartTime = Date.now();
      const metricsResponse = await fetch(`/api/v2/reports/attention?timeRange=${selectedTimeRange}&contractId=${selectedContract}`, { signal });
      const metricsResponseTime = Date.now() - metricsStartTime;
      recordAPICall('/api/v2/reports/attention', metricsResponseTime, metricsResponse.ok);
      
      if (!metricsResponse.ok) throw new Error('Failed to fetch metrics');
      const metricsData = await metricsResponse.json();
      
      // Fetch utility metrics
      const utilityStartTime = Date.now();
      const utilityResponse = await fetch(`/api/v2/reports/utility?timeRange=${selectedTimeRange}&contractId=${selectedContract}`, { signal });
      const utilityResponseTime = Date.now() - utilityStartTime;
      recordAPICall('/api/v2/reports/utility', utilityResponseTime, utilityResponse.ok);
      
      if (!utilityResponse.ok) throw new Error('Failed to fetch utility data');
      const utilityResult = await utilityResponse.json();
      
      // Fetch narrative flow data
      const narrativeStartTime = Date.now();
      const narrativeResponse = await fetch(`/api/v2/reports/narrative-flow?timeRange=${selectedTimeRange}&contractId=${selectedContract}`, { signal });
      const narrativeResponseTime = Date.now() - narrativeStartTime;
      recordAPICall('/api/v2/reports/narrative-flow', narrativeResponseTime, narrativeResponse.ok);
      
      if (!narrativeResponse.ok) throw new Error('Failed to fetch narrative data');
      const narrativeResult = await narrativeResponse.json();

      // Process attention data for charts
      const processedAttention = metricsData.metrics.map((item: Record<string, unknown>) => ({
        date: new Date(item.date as string).toLocaleDateString(),
        attention: (item.attention_score as number) * 100,
        engagement: (item.engagement_rate as number) * 100,
        conversion: (item.conversion_rate as number) * 100
      }));

      // Process utility data
      const processedUtility = utilityResult.metrics.map((item: Record<string, unknown>) => ({
        model: item.billing_model as string,
        revenue: item.total_revenue as number,
        roi: item.roi_percentage as number,
        interactions: item.total_interactions as number,
        avgValue: item.avg_value_generated as number
      }));

      setMetrics({
        totalRevenue: metricsData.summary.total_revenue,
        totalInteractions: metricsData.summary.total_interactions,
        avgAttentionTime: metricsData.summary.avg_attention_time,
        conversionRate: metricsData.summary.conversion_rate,
        revenueGrowth: metricsData.summary.revenue_growth,
        interactionGrowth: metricsData.summary.interaction_growth
      });

      setAttentionData(processedAttention);
      setUtilityData(processedUtility);
      setNarrativeData(narrativeResult.nodes || []);
      
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        
      } else {
        recordError('Error fetching dashboard data', error as Error | undefined);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        const totalResponseTime = Date.now() - startTime;
        recordInteraction(totalResponseTime);
      }
    }
  };

  const MetricCard = ({ title, value, icon: Icon, trend, trendValue, prefix = '', suffix = '' }: { title: string; value: string | number; icon: LucideIcon; trend?: number; trendValue?: number; prefix?: string; suffix?: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {Math.abs(trend)}% {trend >= 0 ? 'incremento' : 'decremento'}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inteligencia de Negocios</h1>
          <p className="text-muted-foreground">
            Dashboard interactivo para análisis de métricas narrativas y facturación inteligente
          </p>
        </div>
        <MetricsFilters
          timeRange={selectedTimeRange}
          onTimeRangeChange={setSelectedTimeRange}
          contractId={selectedContract}
          onContractChange={setSelectedContract}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Ingresos Totales"
          value={metrics?.totalRevenue ?? 0}
          icon={DollarSign}
          trend={metrics?.revenueGrowth}
          prefix="$"
        />
        <MetricCard
          title="Interacciones Totales"
          value={metrics?.totalInteractions ?? 0}
          icon={Users}
          trend={metrics?.interactionGrowth}
        />
        <MetricCard
          title="Tiempo de Atención Promedio"
          value={metrics?.avgAttentionTime ?? 0}
          icon={Clock}
          suffix="s"
        />
        <MetricCard
          title="Tasa de Conversión"
          value={metrics?.conversionRate ?? 0}
          icon={Target}
          suffix="%"
        />
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="attention" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attention">Métricas de Atención</TabsTrigger>
          <TabsTrigger value="utility">Análisis de Utilidad</TabsTrigger>
          <TabsTrigger value="narrative">Flujo Narrativo</TabsTrigger>
          <TabsTrigger value="billing">Modelos de Facturación</TabsTrigger>
          <TabsTrigger value="executive">Reportes Ejecutivos</TabsTrigger>
        </TabsList>

        <TabsContent value="attention" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tendencias de Atención</CardTitle>
                <CardDescription>Evolución temporal de métricas de atención</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={attentionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="attention" stroke="#3b82f6" name="Atención %" />
                    <Line type="monotone" dataKey="engagement" stroke="#10b981" name="Engagement %" />
                    <Line type="monotone" dataKey="conversion" stroke="#f59e0b" name="Conversión %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Engagement</CardTitle>
                <CardDescription>Análisis de engagement por tipo de interacción</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={attentionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="engagement" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="attention" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="utility" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ingresos por Modelo de Facturación</CardTitle>
                <CardDescription>Comparación de ingresos entre modelos CPVI y CPCN</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={utilityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="model" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Ingresos ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ROI por Modelo</CardTitle>
                <CardDescription>Análisis de retorno de inversión</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={utilityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="interactions" name="Interacciones" />
                    <YAxis dataKey="roi" name="ROI %" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter dataKey="roi" fill="#10b981" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="narrative" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flujo Narrativo Completo</CardTitle>
              <CardDescription>Visualización interactiva del recorrido narrativo con diagrama de Sankey</CardDescription>
            </CardHeader>
            <CardContent>
              <NarrativeFlowDiagram data={narrativeData} />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {narrativeData.map((node, index) => (
              <Card key={node.id}>
                <CardHeader>
                  <CardTitle className="text-sm">{node.name}</CardTitle>
                  <CardDescription className="text-xs">{node.stage}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Interacciones:</span>
                      <Badge variant="outline">{node.interactions.toLocaleString()}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Abandono:</span>
                      <Badge variant="destructive">{node.dropoff}%</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Completitud:</span>
                      <Badge variant="default">{node.completion}%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Modelos de Facturación</CardTitle>
                <CardDescription>Uso de diferentes modelos de facturación</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={utilityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {utilityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valor Promedio por Interacción</CardTitle>
                <CardDescription>Comparación de valor generado por modelo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={utilityData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="model" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgValue" fill="#8b5cf6" name="Valor Promedio ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="executive" className="space-y-4">
          <ExecutiveReportsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}