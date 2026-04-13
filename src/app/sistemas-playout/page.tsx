"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Server, Radio, Zap, CheckCircle, TrendingUp, Activity, RefreshCw, Monitor, Settings,
} from 'lucide-react';
import type { PlayoutSystem, SyncJob, SystemLog } from './_types';
import { OverviewTab } from './_components/OverviewTab';
import { SystemsTab } from './_components/SystemsTab';
import { SyncTab } from './_components/SyncTab';
import { MonitoringTab } from './_components/MonitoringTab';
import { ConfigTab } from './_components/ConfigTab';

/**
 * MÓDULO: SISTEMAS DE PLAYOUT (BROADCASTING)
 * @version 2025.3.0 - TIER0 FORTUNE 10
 */

export default function SistemasPlayoutPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [playoutSystems, setPlayoutSystems] = useState<PlayoutSystem[]>([]);
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<string>('');

  useEffect(() => {
    loadInitialData();
    const interval = setInterval(updateSystemMetrics, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInitialData = () => {
    setPlayoutSystems([
      {
        id: 'sys_001',
        name: 'Dalet Galaxy - Radio Uno',
        type: 'dalet',
        version: '12.5.3',
        status: 'online',
        lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        stationId: 'radio_1',
        connectionConfig: { host: '192.168.1.100', port: 21, protocol: 'ftp', credentials: { username: 'dalet_user', password: '***' } },
        features: { import: true, export: true, monitoring: true, realtime: true },
        metrics: { uptime: 99.8, latency: 45, successRate: 98.5 },
      },
      {
        id: 'sys_002',
        name: 'WideOrbit - Radio Dos',
        type: 'wideorbit',
        version: '8.2.1',
        status: 'online',
        lastSync: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        stationId: 'radio_2',
        connectionConfig: { host: '192.168.1.101', port: 8080, protocol: 'http', credentials: { username: 'wo_admin', password: '***' } },
        features: { import: true, export: true, monitoring: true, realtime: false },
        metrics: { uptime: 97.2, latency: 120, successRate: 96.8 },
      },
      {
        id: 'sys_003',
        name: 'Sara Automation - Radio Tres',
        type: 'sara',
        version: '5.1.0',
        status: 'maintenance',
        lastSync: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        stationId: 'radio_3',
        connectionConfig: { host: '192.168.1.102', port: 3306, protocol: 'tcp', credentials: { username: 'sara_sync', password: '***' } },
        features: { import: true, export: true, monitoring: false, realtime: true },
        metrics: { uptime: 94.5, latency: 200, successRate: 94.2, lastError: 'Connection timeout during maintenance window' },
      },
    ]);

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
        errors: [],
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
        errors: [],
      },
    ]);

    setSystemLogs([
      {
        id: 'log_001',
        systemId: 'sys_001',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        level: 'info',
        message: 'Playlist exported successfully',
        details: { items: 247, duration: '2m 15s' },
      },
      {
        id: 'log_002',
        systemId: 'sys_003',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        level: 'warning',
        message: 'System entering maintenance mode',
        details: { scheduledDuration: '2 hours', reason: 'Scheduled update' },
      },
    ]);
  };

  const updateSystemMetrics = () => {
    setPlayoutSystems(prev => prev.map(system => ({
      ...system,
      metrics: {
        ...system.metrics,
        latency: system.metrics.latency + (Math.random() - 0.5) * 20,
        uptime: Math.min(99.9, system.metrics.uptime + Math.random() * 0.1),
      },
    })));
  };

  const handleSystemTest = async (systemId: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPlayoutSystems(prev => prev.map(sys =>
        sys.id === systemId ? { ...sys, status: 'online', lastSync: new Date().toISOString() } : sys
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncStart = (systemId: string, type: 'import' | 'export') => {
    const newJob: SyncJob = {
      id: `job_${Date.now()}`,
      systemId,
      type,
      status: 'running',
      progress: 0,
      startTime: new Date().toISOString(),
      itemsProcessed: 0,
      totalItems: Math.floor(Math.random() * 300) + 100,
      errors: [],
    };

    setSyncJobs(prev => [newJob, ...prev]);

    const progressInterval = setInterval(() => {
      setSyncJobs(prev => prev.map(job => {
        if (job.id !== newJob.id || job.status !== 'running') return job;
        const newProgress = Math.min(100, job.progress + Math.random() * 15);
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          return { ...job, status: 'completed', progress: 100, itemsProcessed: job.totalItems, endTime: new Date().toISOString() };
        }
        return { ...job, progress: newProgress, itemsProcessed: Math.floor((newProgress / 100) * job.totalItems) };
      }));
    }, 1000);
  };

  const onlineSystems = playoutSystems.filter(s => s.status === 'online').length;
  const avgUptime = playoutSystems.length > 0
    ? (playoutSystems.reduce((acc, sys) => acc + sys.metrics.uptime, 0) / playoutSystems.length).toFixed(1)
    : '0.0';
  const avgLatency = playoutSystems.length > 0
    ? Math.round(playoutSystems.reduce((acc, sys) => acc + sys.metrics.latency, 0) / playoutSystems.length)
    : 0;
  const activeJobs = syncJobs.filter(j => j.status === 'running').length;

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
              {onlineSystems} SISTEMAS ACTIVOS
            </Badge>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Sistemas Conectados', value: `${onlineSystems}/${playoutSystems.length}`, color: 'text-green-400', bg: 'bg-green-500/20', Icon: CheckCircle },
            { label: 'Uptime Promedio', value: `${avgUptime}%`, color: 'text-blue-400', bg: 'bg-blue-500/20', Icon: TrendingUp },
            { label: 'Latencia Promedio', value: `${avgLatency}ms`, color: 'text-purple-400', bg: 'bg-purple-500/20', Icon: Activity },
            { label: 'Trabajos Activos', value: String(activeJobs), color: 'text-orange-400', bg: 'bg-orange-500/20', Icon: RefreshCw },
          ].map(({ label, value, color, bg, Icon }) => (
            <Card key={label} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{label}</p>
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  </div>
                  <div className={`p-3 ${bg} rounded-lg`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
              <Monitor className="h-4 w-4 mr-2" />Vista General
            </TabsTrigger>
            <TabsTrigger value="systems" className="data-[state=active]:bg-green-600">
              <Server className="h-4 w-4 mr-2" />Sistemas
            </TabsTrigger>
            <TabsTrigger value="sync" className="data-[state=active]:bg-purple-600">
              <RefreshCw className="h-4 w-4 mr-2" />Sincronización
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-orange-600">
              <Activity className="h-4 w-4 mr-2" />Monitoreo
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-red-600">
              <Settings className="h-4 w-4 mr-2" />Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab
              playoutSystems={playoutSystems}
              syncJobs={syncJobs}
              selectedSystem={selectedSystem}
              isLoading={isLoading}
              onSystemTest={handleSystemTest}
              onSyncStart={handleSyncStart}
            />
          </TabsContent>

          <TabsContent value="systems">
            <SystemsTab
              playoutSystems={playoutSystems}
              isLoading={isLoading}
              onSystemTest={handleSystemTest}
              onSyncStart={handleSyncStart}
            />
          </TabsContent>

          <TabsContent value="sync">
            <SyncTab syncJobs={syncJobs} playoutSystems={playoutSystems} />
          </TabsContent>

          <TabsContent value="monitoring">
            <MonitoringTab systemLogs={systemLogs} playoutSystems={playoutSystems} />
          </TabsContent>

          <TabsContent value="config">
            <ConfigTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
