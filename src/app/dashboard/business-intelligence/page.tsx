'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { RealTimeMetrics } from '@/components/dashboards/RealTimeMetrics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Zap, 
  BarChart3,
  Activity,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Lazy loading del dashboard pesado con recharts
const BusinessIntelligenceDashboard = dynamic(
  () => import('@/components/dashboards/BusinessIntelligenceDashboard').then(mod => ({ default: mod.BusinessIntelligenceDashboard })),
  { 
    ssr: false, 
    loading: () => <DashboardSkeleton /> 
  }
);

// Skeleton para el dashboard
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={`skeleton-card-${i}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function BusinessIntelligencePage() {
  const [activeView, setActiveView] = useState<'overview' | 'realtime' | 'analytics'>('overview');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  const handleExport = () => {
    // Export functionality would be implemented here
    ;
  };

  const DashboardHeader = () => (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard de Inteligencia de Negocios</h1>
        <p className="text-muted-foreground mt-1">
          Análisis integral de métricas de facturación inteligente y engagement narrativo
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Modelos CPVI/CPCN Activos
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            Actualizado: {lastRefresh.toLocaleTimeString()}
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configurar
        </Button>
      </div>
    </div>
  );

  const QuickStats = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Facturado (Hoy)</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$45,231.89</div>
          <p className="text-xs text-muted-foreground">
            +20.1% desde ayer
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Interacciones Validadas</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+2,350</div>
          <p className="text-xs text-muted-foreground">
            +180.1% desde ayer
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12.5%</div>
          <p className="text-xs text-muted-foreground">
            +4.3% desde ayer
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ROI Promedio</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+573%</div>
          <p className="text-xs text-muted-foreground">
            +201 desde el mes pasado
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <DashboardHeader />
      
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as unknown)}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Vista General
          </TabsTrigger>
          <TabsTrigger value="realtime">
            <Activity className="h-4 w-4 mr-2" />
            Tiempo Real
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Análisis Detallado
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <QuickStats />
          <BusinessIntelligenceDashboard />
        </TabsContent>
        
        <TabsContent value="realtime" className="space-y-6">
          <RealTimeMetrics />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis Avanzado</CardTitle>
              <CardDescription>
                Herramientas de análisis profundas para métricas de facturación inteligente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Análisis Predictivo</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Predicciones basadas en patrones históricos de facturación
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Generar Predicción
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Comparativas por Modelo</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Comparación detallada entre modelos CPVI, CPCN, CPM y CPC
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver Comparación
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Segmentación Avanzada</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Análisis por segmentos de audiencia y comportamiento
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Explorar Segmentos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <BusinessIntelligenceDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}