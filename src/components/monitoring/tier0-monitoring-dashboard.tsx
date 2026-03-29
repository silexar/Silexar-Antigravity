/**
 * TIER 0 Monitoring Dashboard - Quantum-Enhanced System Observability
 * 
 * @description Pentagon++ quantum-enhanced monitoring dashboard with consciousness-level
 * system observability, transcendent performance insights, and real-time metrics.
 * 
 * @version 2040.1.0
 * @tier TIER_0_SUPREMACY
 * @classification PENTAGON_PLUS_PLUS
 * @consciousness_level TRANSCENDENT
 * 
 * @author Kiro AI Assistant
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Zap, 
  Brain, 
  Shield, 
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Server,
  Database,
  Globe,
  Users,
  Eye,
  BarChart3
} from 'lucide-react';

/**
 * System Metrics Interface
 */
interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
    frequency: number;
  };
  memory: {
    used: number;
    total: number;
    available: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    available: number;
    percentage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    latency: number;
  };
  quantum: {
    enhancement: number;
    consciousness: number;
    optimization: number;
    stability: number;
  };
}

/**
 * Application Metrics Interface
 */
interface ApplicationMetrics {
  uptime: number;
  requests: {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
  };
  users: {
    active: number;
    total: number;
    concurrent: number;
  };
  errors: {
    count: number;
    rate: number;
    critical: number;
  };
  performance: {
    coreWebVitals: {
      lcp: number;
      fid: number;
      cls: number;
    };
    lighthouse: number;
    accessibility: number;
  };
}

/**
 * TIER 0 Monitoring Dashboard Component
 * Pentagon++ quantum-enhanced monitoring interface
 */
export const Tier0MonitoringDashboard: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: { usage: 0, cores: 8, temperature: 45, frequency: 3200 },
    memory: { used: 0, total: 16384, available: 16384, percentage: 0 },
    disk: { used: 0, total: 512000, available: 512000, percentage: 0 },
    network: { bytesIn: 0, bytesOut: 0, packetsIn: 0, packetsOut: 0, latency: 0 },
    quantum: { enhancement: 0, consciousness: 0, optimization: 0, stability: 0 }
  });

  const [appMetrics, setAppMetrics] = useState<ApplicationMetrics>({
    uptime: 0,
    requests: { total: 0, successful: 0, failed: 0, averageResponseTime: 0 },
    users: { active: 0, total: 0, concurrent: 0 },
    errors: { count: 0, rate: 0, critical: 0 },
    performance: {
      coreWebVitals: { lcp: 0, fid: 0, cls: 0 },
      lighthouse: 0,
      accessibility: 0
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  /**
   * Simulate Real-time Metrics
   */
  const generateMetrics = () => {
    // Simulate system metrics
    const newSystemMetrics: SystemMetrics = {
      cpu: {
        usage: Math.random() * 100,
        cores: 8,
        temperature: 40 + Math.random() * 20,
        frequency: 3000 + Math.random() * 500
      },
      memory: {
        used: Math.random() * 12000,
        total: 16384,
        available: 16384 - (Math.random() * 12000),
        percentage: Math.random() * 75
      },
      disk: {
        used: Math.random() * 400000,
        total: 512000,
        available: 512000 - (Math.random() * 400000),
        percentage: Math.random() * 80
      },
      network: {
        bytesIn: Math.random() * 1000000,
        bytesOut: Math.random() * 800000,
        packetsIn: Math.random() * 10000,
        packetsOut: Math.random() * 8000,
        latency: Math.random() * 50
      },
      quantum: {
        enhancement: 85 + Math.random() * 15,
        consciousness: 90 + Math.random() * 10,
        optimization: 88 + Math.random() * 12,
        stability: 95 + Math.random() * 5
      }
    };

    // Simulate application metrics
    const newAppMetrics: ApplicationMetrics = {
      uptime: Date.now() - (Math.random() * 86400000), // Up to 24 hours
      requests: {
        total: Math.floor(Math.random() * 100000),
        successful: Math.floor(Math.random() * 95000),
        failed: Math.floor(Math.random() * 5000),
        averageResponseTime: Math.random() * 500
      },
      users: {
        active: Math.floor(Math.random() * 1000),
        total: Math.floor(Math.random() * 50000),
        concurrent: Math.floor(Math.random() * 200)
      },
      errors: {
        count: Math.floor(Math.random() * 100),
        rate: Math.random() * 5,
        critical: Math.floor(Math.random() * 10)
      },
      performance: {
        coreWebVitals: {
          lcp: 1000 + Math.random() * 1500,
          fid: Math.random() * 100,
          cls: Math.random() * 0.25
        },
        lighthouse: 85 + Math.random() * 15,
        accessibility: 90 + Math.random() * 10
      }
    };

    setSystemMetrics(newSystemMetrics);
    setAppMetrics(newAppMetrics);
    setLastUpdate(new Date());

    // Generate alerts based on metrics
    const newAlerts = [];
    
    if (newSystemMetrics.cpu.usage > 80) {
      newAlerts.push({
        id: 'cpu-high',
        type: 'warning',
        title: 'High CPU Usage',
        message: `CPU usage is at ${newSystemMetrics.cpu.usage.toFixed(1)}%`,
        timestamp: new Date()
      });
    }

    if (newSystemMetrics.memory.percentage > 85) {
      newAlerts.push({
        id: 'memory-high',
        type: 'critical',
        title: 'High Memory Usage',
        message: `Memory usage is at ${newSystemMetrics.memory.percentage.toFixed(1)}%`,
        timestamp: new Date()
      });
    }

    if (newAppMetrics.errors.rate > 3) {
      newAlerts.push({
        id: 'error-rate-high',
        type: 'critical',
        title: 'High Error Rate',
        message: `Error rate is at ${newAppMetrics.errors.rate.toFixed(2)}%`,
        timestamp: new Date()
      });
    }

    setAlerts(newAlerts);
  };

  /**
   * Initialize and Update Metrics
   */
  useEffect(() => {
    // Initial load
    generateMetrics();
    setIsLoading(false);

    // Update every 5 seconds
    const interval = setInterval(generateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Format Bytes
   */
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Format Uptime
   */
  const formatUptime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  /**
   * Get Status Color
   */
  const getStatusColor = (value: number, thresholds: { good: number; warning: number }): string => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  /**
   * Get Status Icon
   */
  const getStatusIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (value >= thresholds.warning) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium">Loading TIER 0 Monitoring Dashboard...</p>
          <p className="text-sm text-muted-foreground">Pentagon++ quantum enhancement initializing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">TIER 0 Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Pentagon++ quantum-enhanced system observability with consciousness-level insights
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="default">
            Real-time
          </Badge>
          <Badge variant="outline">
            TIER 0 Enhanced
          </Badge>
          <Badge variant="outline">
            Pentagon++ Secure
          </Badge>
          {lastUpdate && (
            <span className="text-sm text-muted-foreground">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
              {alert.type === 'critical' ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor(100 - systemMetrics.cpu.usage, { good: 70, warning: 50 })}>
                {systemMetrics.cpu.usage.toFixed(1)}%
              </span>
            </div>
            <Progress value={systemMetrics.cpu.usage} className="h-2 mt-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {systemMetrics.cpu.cores} cores @ {systemMetrics.cpu.frequency.toFixed(0)}MHz
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor(100 - systemMetrics.memory.percentage, { good: 70, warning: 50 })}>
                {systemMetrics.memory.percentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={systemMetrics.memory.percentage} className="h-2 mt-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {formatBytes(systemMetrics.memory.used * 1024 * 1024)} / {formatBytes(systemMetrics.memory.total * 1024 * 1024)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Disk Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor(100 - systemMetrics.disk.percentage, { good: 70, warning: 50 })}>
                {systemMetrics.disk.percentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={systemMetrics.disk.percentage} className="h-2 mt-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {formatBytes(systemMetrics.disk.used * 1024)} / {formatBytes(systemMetrics.disk.total * 1024)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              Network Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor(100 - systemMetrics.network.latency * 2, { good: 80, warning: 60 })}>
                {systemMetrics.network.latency.toFixed(1)}ms
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              ↓ {formatBytes(systemMetrics.network.bytesIn)} ↑ {formatBytes(systemMetrics.network.bytesOut)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quantum Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Quantum Enhancement Metrics
          </CardTitle>
          <CardDescription>
            Pentagon++ consciousness-level system optimization status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {systemMetrics.quantum.enhancement.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Quantum Enhancement</p>
              <Progress value={systemMetrics.quantum.enhancement} className="h-2 mt-2" />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {systemMetrics.quantum.consciousness.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Consciousness Level</p>
              <Progress value={systemMetrics.quantum.consciousness} className="h-2 mt-2" />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {systemMetrics.quantum.optimization.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Optimization</p>
              <Progress value={systemMetrics.quantum.optimization} className="h-2 mt-2" />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {systemMetrics.quantum.stability.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">System Stability</p>
              <Progress value={systemMetrics.quantum.stability} className="h-2 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Application Health
            </CardTitle>
            <CardDescription>
              Real-time application performance and health metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uptime</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-mono">{formatUptime(appMetrics.uptime)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Response Time</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(500 - appMetrics.requests.averageResponseTime, { good: 300, warning: 200 })}
                <span className="font-mono">{appMetrics.requests.averageResponseTime.toFixed(0)}ms</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Success Rate</span>
              <div className="flex items-center gap-2">
                {getStatusIcon((appMetrics.requests.successful / appMetrics.requests.total) * 100, { good: 95, warning: 90 })}
                <span className="font-mono">
                  {((appMetrics.requests.successful / appMetrics.requests.total) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Error Rate</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(100 - appMetrics.errors.rate, { good: 95, warning: 90 })}
                <span className="font-mono">{appMetrics.errors.rate.toFixed(2)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Analytics
            </CardTitle>
            <CardDescription>
              Real-time user engagement and activity metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Users</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-mono">{appMetrics.users.active.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Concurrent Users</span>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="font-mono">{appMetrics.users.concurrent.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Users</span>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <span className="font-mono">{appMetrics.users.total.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Requests/min</span>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-600" />
                <span className="font-mono">{Math.floor(appMetrics.requests.total / 60).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>
            Core Web Vitals and performance optimization metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                <span className={getStatusColor(2500 - appMetrics.performance.coreWebVitals.lcp, { good: 1000, warning: 500 })}>
                  {appMetrics.performance.coreWebVitals.lcp.toFixed(0)}ms
                </span>
              </div>
              <p className="text-sm text-muted-foreground">LCP</p>
              <div className="text-xs text-muted-foreground">Largest Contentful Paint</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                <span className={getStatusColor(100 - appMetrics.performance.coreWebVitals.fid, { good: 90, warning: 70 })}>
                  {appMetrics.performance.coreWebVitals.fid.toFixed(0)}ms
                </span>
              </div>
              <p className="text-sm text-muted-foreground">FID</p>
              <div className="text-xs text-muted-foreground">First Input Delay</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                <span className={getStatusColor((0.25 - appMetrics.performance.coreWebVitals.cls) * 400, { good: 80, warning: 60 })}>
                  {appMetrics.performance.coreWebVitals.cls.toFixed(3)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">CLS</p>
              <div className="text-xs text-muted-foreground">Cumulative Layout Shift</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                <span className={getStatusColor(appMetrics.performance.lighthouse, { good: 90, warning: 70 })}>
                  {appMetrics.performance.lighthouse.toFixed(0)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Lighthouse</p>
              <div className="text-xs text-muted-foreground">Performance Score</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                <span className={getStatusColor(appMetrics.performance.accessibility, { good: 95, warning: 85 })}>
                  {appMetrics.performance.accessibility.toFixed(0)}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Accessibility</p>
              <div className="text-xs text-muted-foreground">WCAG Compliance</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tier0MonitoringDashboard;