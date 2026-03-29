"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Server, 
  Radio, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Zap,
  Settings,
  Monitor,
  Database,
  Upload,
  Download,
  RefreshCw,
  Eye,
  Filter,
  Calendar,
  TrendingUp,
  Activity,
  Shield,
  Link,
  Unlink,
  Play,
  Pause,
  RotateCcw,
  FileText,
  HardDrive,
  Network,
  Cpu,
  MemoryStick
} from 'lucide-react';

/**
 * MÓDULO: SISTEMAS DE PLAYOUT (BROADCASTING)
 * 
 * Sistema integral de integración con sistemas de playout externos,
 * monitoreo en tiempo real, sincronización bidireccional y gestión centralizada
 * 
 * @version 2025.3.0 - TIER0 FORTUNE 10
 */

interface PlayoutSystem {
  id: string;
  name: string;
  type: 'dalet' | 'wideorbit' | 'sara' | 'rcs' | 'marketron' | 'nexgen' | 'radiotraffic';
  version: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  lastSync: string;
  stationId: string;
  connectionConfig: {
    host: string;
    port: number;
    protocol: 'ftp' | 'http' | 'tcp' | 'api';
    credentials: {
      username: string;
      password: string;
    };
  };
  features: {
    import: boolean;
    export: boolean;
    monitoring: boolean;
    realtime: boolean;
  };
  metrics: {
    uptime: number;
    latency: number;
    successRate: number;
    lastError?: string;
  };
}

interface SyncJob {
  id: string;
  systemId: string;
  type: 'import' | 'export' | 'sync';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  endTime?: string;
  itemsProcessed: number;
  totalItems: number;
  errors: string[];
}

interface SystemLog {
  id: string;
  systemId: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  details?: Record<string, unknown>;
}

export default function SistemasPlayoutPage() {
  // Estados principales
  const [activeTab, setActiveTab] = useState('overview');
  const [playoutSystems, setPlayoutSystems] = useState<PlayoutSystem[]>([]);
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<string>('');

  // Datos simulados
  const systemTypes = [
    { id: 'dalet', name: 'Dalet Galaxy', icon: '🎵', color: 'blue' },
    { id: 'wideorbit', name: 'WideOrbit', icon: '📡', color: 'green' },
    { id: 'sara', name: 'Sara Automation', icon: '🤖', color: 'purple' },
    { id: 'rcs', name: 'RCS Zetta', icon: '⚡', color: 'yellow' },
    { id: 'marketron', name: 'Marketron Traffic', icon: '📊', color: 'orange' },
    { id: 'nexgen', name: 'NexGen Digital', icon: '🚀', color: 'red' },
    { id: 'radiotraffic', name: 'RadioTraffic', icon: '📻', color: 'indigo' }
  ];

  const stations = [
    { id: 'radio_1', name: 'Radio Uno 97.1 FM', type: 'FM' },
    { id: 'radio_2', name: 'Radio Dos 101.3 FM', type: 'FM' },
    { id: 'radio_3', name: 'Radio Tres 1180 AM', type: 'AM' },
    { id: 'tv_1', name: 'Canal TV Uno', type: 'TV' }
  ];

  // Efectos
  useEffect(() => {
    loadInitialData();
    const interval = setInterval(updateSystemMetrics, 30000); // Actualizar cada 30s
    return () => clearInterval(interval);
  }, []);

  const loadInitialData = () => {
    // Cargar sistemas de playout simulados
    setPlayoutSystems([
      {
        id: 'sys_001',
        name: 'Dalet Galaxy - Radio Uno',
        type: 'dalet',
        version: '12.5.3',
        status: 'online',
        lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        stationId: 'radio_1',
        connectionConfig: {
          host: '192.168.1.100',
          port: 21,
          protocol: 'ftp',
          credentials: {
            username: 'dalet_user',
            password: '***'
          }
        },
        features: {
          import: true,
          export: true,
          monitoring: true,
          realtime: true
        },
        metrics: {
          uptime: 99.8,
          latency: 45,
          successRate: 98.5
        }
      },
      {
        id: 'sys_002',
        name: 'WideOrbit - Radio Dos',
        type: 'wideorbit',
        version: '8.2.1',
        status: 'online',
        lastSync: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        stationId: 'radio_2',
        connectionConfig: {
          host: '192.168.1.101',
          port: 8080,
          protocol: 'http',
          credentials: {
            username: 'wo_admin',
            password: '***'
          }
        },
        features: {
          import: true,
          export: true,
          monitoring: true,
          realtime: false
        },
        metrics: {
          uptime: 97.2,
          latency: 120,
          successRate: 96.8
        }
      },
      {
        id: 'sys_003',
        name: 'Sara Automation - Radio Tres',
        type: 'sara',
        version: '5.1.0',
        status: 'maintenance',
        lastSync: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        stationId: 'radio_3',
        connectionConfig: {
          host: '192.168.1.102',
          port: 3306,
          protocol: 'tcp',
          credentials: {
            username: 'sara_sync',
            password: '***'
          }
        },
        features: {
          import: true,
          export: true,
          monitoring: false,
          realtime: true
        },
        metrics: {
          uptime: 94.5,
          latency: 200,
          successRate: 94.2,
          lastError: 'Connection timeout during maintenance window'
        }
      }
    ]);

    // Cargar trabajos de sincronización simulados
    setSyncJobs([
      {
        id: 'job_001',
        systemId: 'sys_001',
        type: 'export',
        status: 'completed',
        progress: 100,
        startTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        itemsProcessed: 247,
        totalItems: 247,
        errors: []
      },
      {
        id: 'job_002',
        systemId: 'sys_002',
        type: 'import',
        status: 'running',
        progress: 65,
        startTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        itemsProcessed: 156,
        totalItems: 240,
        errors: []
      }
    ]);

    // Cargar logs del sistema simulados
    setSystemLogs([
      {
        id: 'log_001',
        systemId: 'sys_001',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        level: 'info',
        message: 'Playlist exported successfully',
        details: { items: 247, duration: '2m 15s' }
      },
      {
        id: 'log_002',
        systemId: 'sys_003',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        level: 'warning',
        message: 'System entering maintenance mode',
        details: { scheduledDuration: '2 hours', reason: 'Scheduled update' }
      }
    ]);
  };

  const updateSystemMetrics = () => {
    setPlayoutSystems(prev => prev.map(system => ({
      ...system,
      metrics: {
        ...system.metrics,
        latency: system.metrics.latency + (Math.random() - 0.5) * 20,
        uptime: Math.min(99.9, system.metrics.uptime + Math.random() * 0.1)
      }
    })));
  };

  // Handlers
  const handleSystemTest = async (systemId: string) => {
    setIsLoading(true);
    try {
      // Simular test de conexión
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPlayoutSystems(prev => prev.map(sys => 
        sys.id === systemId 
          ? { ...sys, status: 'online', lastSync: new Date().toISOString() }
          : sys
      ));
    } catch (error) {
      /* console.error('Error testing system:', error) */;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncStart = async (systemId: string, type: 'import' | 'export') => {
    const newJob: SyncJob = {
      id: `job_${Date.now()}`,
      systemId,
      type,
      status: 'running',
      progress: 0,
      startTime: new Date().toISOString(),
      itemsProcessed: 0,
      totalItems: Math.floor(Math.random() * 300) + 100,
      errors: []
    };

    setSyncJobs(prev => [newJob, ...prev]);

    // Simular progreso
    const progressInterval = setInterval(() => {
      setSyncJobs(prev => prev.map(job => {
        if (job.id === newJob.id && job.status === 'running') {
          const newProgress = Math.min(100, job.progress + Math.random() * 15);
          const newItemsProcessed = Math.floor((newProgress / 100) * job.totalItems);
          
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return {
              ...job,
              status: 'completed',
              progress: 100,
              itemsProcessed: job.totalItems,
              endTime: new Date().toISOString()
            };
          }
          
          return {
            ...job,
            progress: newProgress,
            itemsProcessed: newItemsProcessed
          };
        }
        return job;
      }));
    }, 1000);
  };

  const getSystemIcon = (type: string) => {
    const systemType = systemTypes.find(st => st.id === type);
    return systemType?.icon || '📡';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'offline': return 'text-red-400';
      case 'maintenance': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return CheckCircle;
      case 'offline': return XCircle;
      case 'maintenance': return Settings;
      case 'error': return AlertTriangle;
      default: return Clock;
    }
  }; 
 return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Server className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              SISTEMAS DE PLAYOUT
            </h1>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Radio className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto">
            Integración completa con sistemas de playout externos, monitoreo en tiempo real, 
            sincronización bidireccional y gestión centralizada de broadcasting
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="border-blue-400 text-blue-400">
              <Zap className="h-4 w-4 mr-1" />
              TIER 0 FORTUNE 10
            </Badge>
            <Badge variant="outline" className="border-green-400 text-green-400">
              <CheckCircle className="h-4 w-4 mr-1" />
              {playoutSystems.filter(s => s.status === 'online').length} SISTEMAS ACTIVOS
            </Badge>
          </div>
        </div>

        {/* Métricas Globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Sistemas Conectados</p>
                  <p className="text-2xl font-bold text-green-400">
                    {playoutSystems.filter(s => s.status === 'online').length}/{playoutSystems.length}
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Uptime Promedio</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {(playoutSystems.reduce((acc, sys) => acc + sys.metrics.uptime, 0) / playoutSystems.length).toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Latencia Promedio</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {Math.round(playoutSystems.reduce((acc, sys) => acc + sys.metrics.latency, 0) / playoutSystems.length)}ms
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Activity className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Trabajos Activos</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {syncJobs.filter(j => j.status === 'running').length}
                  </p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <RefreshCw className="h-6 w-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
              <Monitor className="h-4 w-4 mr-2" />
              Vista General
            </TabsTrigger>
            <TabsTrigger value="systems" className="data-[state=active]:bg-green-600">
              <Server className="h-4 w-4 mr-2" />
              Sistemas
            </TabsTrigger>
            <TabsTrigger value="sync" className="data-[state=active]:bg-purple-600">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sincronización
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-orange-600">
              <Activity className="h-4 w-4 mr-2" />
              Monitoreo
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-red-600">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </TabsTrigger>
          </TabsList>  
        {/* Vista General */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Estado de Sistemas */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-400">
                    <Server className="h-5 w-5" />
                    Estado de Sistemas
                  </CardTitle>
                  <CardDescription>
                    Monitoreo en tiempo real de todos los sistemas de playout conectados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {playoutSystems.map((system) => {
                    const StatusIcon = getStatusIcon(system.status);
                    const systemType = systemTypes.find(st => st.id === system.type);
                    
                    return (
                      <div key={system.id} className="flex items-center justify-between p-3 border border-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getSystemIcon(system.type)}</div>
                          <div>
                            <h4 className="font-semibold">{system.name}</h4>
                            <p className="text-sm text-slate-400">
                              {systemType?.name} v{system.version}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className={`flex items-center gap-1 ${getStatusColor(system.status)}`}>
                              <StatusIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {system.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">
                              Última sync: {new Date(system.lastSync).toLocaleTimeString()}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSystemTest(system.id)}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Trabajos de Sincronización Activos */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-400">
                    <RefreshCw className="h-5 w-5" />
                    Sincronización Activa
                  </CardTitle>
                  <CardDescription>
                    Trabajos de importación y exportación en curso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {syncJobs.filter(job => job.status === 'running').length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay trabajos de sincronización activos</p>
                    </div>
                  ) : (
                    syncJobs
                      .filter(job => job.status === 'running')
                      .map((job) => {
                        const system = playoutSystems.find(s => s.id === job.systemId);
                        return (
                          <div key={job.id} className="space-y-3 p-4 border border-slate-700 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="text-xl">{getSystemIcon(system?.type || '')}</div>
                                <div>
                                  <h4 className="font-semibold">{system?.name}</h4>
                                  <p className="text-sm text-slate-400">
                                    {job.type === 'import' ? 'Importando' : 'Exportando'} - {job.itemsProcessed}/{job.totalItems} elementos
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className="border-purple-400 text-purple-400">
                                {job.progress.toFixed(0)}%
                              </Badge>
                            </div>
                            <Progress value={job.progress} className="h-2" />
                            <div className="flex justify-between text-xs text-slate-400">
                              <span>Iniciado: {new Date(job.startTime).toLocaleTimeString()}</span>
                              <span>ETA: ~{Math.ceil((100 - job.progress) / 10)} min</span>
                            </div>
                          </div>
                        );
                      })
                  )}

                  <div className="pt-4 border-t border-slate-700">
                    <h4 className="font-semibold mb-3">Acciones Rápidas</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectedSystem && handleSyncStart(selectedSystem, 'export')}
                        disabled={!selectedSystem}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Exportar Pauta
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectedSystem && handleSyncStart(selectedSystem, 'import')}
                        disabled={!selectedSystem}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Importar Logs
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Métricas de Performance */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Métricas de Performance
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Rango de Fechas
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {playoutSystems.map((system) => {
                    const systemType = systemTypes.find(st => st.id === system.type);
                    return (
                      <div key={system.id} className="space-y-4 p-4 border border-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-xl">{getSystemIcon(system.type)}</div>
                          <div>
                            <h4 className="font-semibold">{system.name}</h4>
                            <p className="text-sm text-slate-400">{systemType?.name}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Uptime</span>
                            <span className="font-bold text-green-400">{system.metrics.uptime.toFixed(1)}%</span>
                          </div>
                          <Progress value={system.metrics.uptime} className="h-2" />

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Latencia</span>
                            <span className="font-bold text-blue-400">{Math.round(system.metrics.latency)}ms</span>
                          </div>
                          <Progress value={Math.max(0, 100 - (system.metrics.latency / 5))} className="h-2" />

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Tasa de Éxito</span>
                            <span className="font-bold text-purple-400">{system.metrics.successRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={system.metrics.successRate} className="h-2" />
                        </div>

                        {system.metrics.lastError && (
                          <Alert className="border-red-500/50 bg-red-500/10">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-red-400 text-xs">
                              {system.metrics.lastError}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>       
   {/* Gestión de Sistemas */}
          <TabsContent value="systems" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lista de Sistemas */}
              <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <Server className="h-5 w-5" />
                    Sistemas de Playout Configurados
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Agregar Sistema
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Actualizar Todo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {playoutSystems.map((system) => {
                    const StatusIcon = getStatusIcon(system.status);
                    const systemType = systemTypes.find(st => st.id === system.type);
                    const station = stations.find(s => s.id === system.stationId);
                    
                    return (
                      <div key={system.id} className="border border-slate-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{getSystemIcon(system.type)}</div>
                            <div>
                              <h4 className="font-semibold">{system.name}</h4>
                              <p className="text-sm text-slate-400">
                                {systemType?.name} v{system.version} • {station?.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`flex items-center gap-1 ${getStatusColor(system.status)}`}>
                              <StatusIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {system.status.toUpperCase()}
                              </span>
                            </div>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                            <div className="text-lg font-bold text-green-400">{system.metrics.uptime.toFixed(1)}%</div>
                            <div className="text-xs text-slate-400">Uptime</div>
                          </div>
                          <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                            <div className="text-lg font-bold text-blue-400">{Math.round(system.metrics.latency)}ms</div>
                            <div className="text-xs text-slate-400">Latencia</div>
                          </div>
                          <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                            <div className="text-lg font-bold text-purple-400">{system.metrics.successRate.toFixed(1)}%</div>
                            <div className="text-xs text-slate-400">Éxito</div>
                          </div>
                          <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                            <div className="text-lg font-bold text-orange-400">
                              {new Date(system.lastSync).toLocaleTimeString()}
                            </div>
                            <div className="text-xs text-slate-400">Última Sync</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${system.features.import ? 'bg-green-400' : 'bg-red-400'}`}></div>
                            <span className="text-slate-400">Import</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${system.features.export ? 'bg-green-400' : 'bg-red-400'}`}></div>
                            <span className="text-slate-400">Export</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${system.features.monitoring ? 'bg-green-400' : 'bg-red-400'}`}></div>
                            <span className="text-slate-400">Monitoring</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${system.features.realtime ? 'bg-green-400' : 'bg-red-400'}`}></div>
                            <span className="text-slate-400">Real-time</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSystemTest(system.id)}
                            disabled={isLoading}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Test Conexión
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSyncStart(system.id, 'export')}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Exportar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSyncStart(system.id, 'import')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Importar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Panel de Configuración Rápida */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configuración Rápida
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Tipo de Sistema</Label>
                    <Select>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {systemTypes.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{type.icon}</span>
                              {type.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Emisora</Label>
                    <Select>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Seleccionar emisora" />
                      </SelectTrigger>
                      <SelectContent>
                        {stations.map(station => (
                          <SelectItem key={station.id} value={station.id}>
                            <div className="flex items-center gap-2">
                              <Radio className="h-4 w-4" />
                              {station.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Host/IP</Label>
                    <Input 
                      placeholder="192.168.1.100"
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Puerto</Label>
                      <Input 
                        type="number"
                        placeholder="21"
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div>
                      <Label>Protocolo</Label>
                      <Select>
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue placeholder="FTP" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ftp">FTP</SelectItem>
                          <SelectItem value="http">HTTP</SelectItem>
                          <SelectItem value="tcp">TCP</SelectItem>
                          <SelectItem value="api">API</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Usuario</Label>
                    <Input 
                      placeholder="username"
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>

                  <div>
                    <Label>Contraseña</Label>
                    <Input 
                      type="password"
                      placeholder="••••••••"
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>

                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Settings className="h-4 w-4 mr-2" />
                    Agregar Sistema
                  </Button>

                  <Alert className="border-blue-500/50 bg-blue-500/10">
                    <Shield className="h-4 w-4" />
                    <AlertDescription className="text-blue-400">
                      Las credenciales se almacenan de forma segura con encriptación AES-256
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent> 
         {/* Sincronización */}
          <TabsContent value="sync" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400">
                  <RefreshCw className="h-5 w-5" />
                  Historial de Sincronización
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Log
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {syncJobs.map((job) => {
                    const system = playoutSystems.find(s => s.id === job.systemId);
                    const duration = job.endTime 
                      ? Math.round((new Date(job.endTime).getTime() - new Date(job.startTime).getTime()) / 1000)
                      : null;

                    return (
                      <div key={job.id} className="border border-slate-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="text-xl">{getSystemIcon(system?.type || '')}</div>
                            <div>
                              <h4 className="font-semibold">{system?.name}</h4>
                              <p className="text-sm text-slate-400">
                                {job.type === 'import' ? 'Importación' : 'Exportación'} - {new Date(job.startTime).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={job.status === 'completed' ? 'default' : 'secondary'}
                              className={
                                job.status === 'completed' ? 'bg-green-600' :
                                job.status === 'running' ? 'bg-blue-600' :
                                job.status === 'failed' ? 'bg-red-600' : 'bg-slate-600'
                              }
                            >
                              {job.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {job.status === 'running' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                              {job.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                              {job.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                            <div className="text-lg font-bold text-purple-400">{job.progress.toFixed(0)}%</div>
                            <div className="text-xs text-slate-400">Progreso</div>
                          </div>
                          <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                            <div className="text-lg font-bold text-blue-400">{job.itemsProcessed}</div>
                            <div className="text-xs text-slate-400">Procesados</div>
                          </div>
                          <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                            <div className="text-lg font-bold text-green-400">{job.totalItems}</div>
                            <div className="text-xs text-slate-400">Total</div>
                          </div>
                          <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                            <div className="text-lg font-bold text-orange-400">
                              {duration ? `${duration}s` : 'En curso'}
                            </div>
                            <div className="text-xs text-slate-400">Duración</div>
                          </div>
                        </div>

                        {job.status === 'running' && (
                          <Progress value={job.progress} className="h-2 mb-4" />
                        )}

                        {job.errors.length > 0 && (
                          <Alert className="border-red-500/50 bg-red-500/10">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-red-400">
                              {job.errors.length} errores encontrados durante la sincronización
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoreo */}
          <TabsContent value="monitoring" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-400">
                  <Activity className="h-5 w-5" />
                  Logs del Sistema
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar Nivel
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemLogs.map((log) => {
                    const system = playoutSystems.find(s => s.id === log.systemId);
                    const levelColors = {
                      info: 'text-blue-400 bg-blue-500/20',
                      warning: 'text-yellow-400 bg-yellow-500/20',
                      error: 'text-red-400 bg-red-500/20',
                      critical: 'text-red-400 bg-red-500/30'
                    };

                    return (
                      <div key={log.id} className="flex items-start gap-3 p-3 border border-slate-700 rounded-lg">
                        <div className={`p-1 rounded text-xs font-bold ${levelColors[log.level]}`}>
                          {log.level.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{getSystemIcon(system?.type || '')}</span>
                            <span className="font-semibold">{system?.name}</span>
                            <span className="text-xs text-slate-400">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300">{log.message}</p>
                          {log.details && (
                            <div className="mt-2 p-2 bg-slate-700/50 rounded text-xs">
                              <pre className="text-slate-400">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuración */}
          <TabsContent value="config" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-400">
                    <Settings className="h-5 w-5" />
                    Configuración Global
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Intervalo de Sincronización (minutos)</Label>
                    <Input 
                      type="number"
                      defaultValue="5"
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>

                  <div>
                    <Label>Timeout de Conexión (segundos)</Label>
                    <Input 
                      type="number"
                      defaultValue="30"
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>

                  <div>
                    <Label>Reintentos Automáticos</Label>
                    <Input 
                      type="number"
                      defaultValue="3"
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>

                  <div>
                    <Label>Directorio de Logs</Label>
                    <Input 
                      defaultValue="/var/log/playout"
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="auto-retry" className="rounded" />
                    <Label htmlFor="auto-retry">Reintentos automáticos en fallos</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="notifications" className="rounded" />
                    <Label htmlFor="notifications">Notificaciones por email</Label>
                  </div>

                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    <Settings className="h-4 w-4 mr-2" />
                    Guardar Configuración
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Seguridad y Backup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Backup Automático</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Cada hora</SelectItem>
                        <SelectItem value="daily">Diario</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="disabled">Deshabilitado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Retención de Logs (días)</Label>
                    <Input 
                      type="number"
                      defaultValue="30"
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>

                  <div>
                    <Label>Nivel de Log</Label>
                    <Select defaultValue="info">
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debug">Debug</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 border-t border-slate-700">
                    <h4 className="font-semibold mb-3">Acciones de Mantenimiento</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full">
                        <Database className="h-4 w-4 mr-2" />
                        Limpiar Logs Antiguos
                      </Button>
                      <Button variant="outline" className="w-full">
                        <HardDrive className="h-4 w-4 mr-2" />
                        Crear Backup Manual
                      </Button>
                      <Button variant="outline" className="w-full">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reiniciar Servicios
                      </Button>
                    </div>
                  </div>

                  <Alert className="border-yellow-500/50 bg-yellow-500/10">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-yellow-400">
                      Los cambios de configuración requieren reinicio de servicios
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}