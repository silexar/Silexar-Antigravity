import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Zap, 
  Shield, 
  Server, 
  Database, 
  Network, 
  Cpu, 
  MemoryStick,
  HardDrive,
  Wifi,
  AlertCircle,
  Bell,
  Settings,
  Filter,
  Download,
  RefreshCw,
  Play,
  Pause,
  Eye,
  EyeOff
} from 'lucide-react';
import { NeuromorphicCard, NeuromorphicButton, NeuromorphicStatus, NeuromorphicGrid } from '@/components/ui/neuromorphic';
import { cn } from '@/lib/utils';
import * as d3 from 'd3';

// System metrics interface
interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  threshold: number;
  history: Array<{ time: Date; value: number }>;
}

// Alert interface
interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  component: string;
  acknowledged: boolean;
}

// Component status interface
interface ComponentStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  uptime: number;
  responseTime: number;
  lastHeartbeat: Date;
  version: string;
}

const RealTimeMonitoringDashboard: React.FC = () => {
  const [isLive, setIsLive] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');
  const [alertsFilter, setAlertsFilter] = useState<'all' | 'unacknowledged' | 'critical'>('all');
  const [showSettings, setShowSettings] = useState(false);
  
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    {
      name: 'CPU Usage',
      value: 45.2,
      unit: '%',
      status: 'normal',
      trend: 'stable',
      threshold: 80,
      history: []
    },
    {
      name: 'Memory Usage',
      value: 67.8,
      unit: '%',
      status: 'normal',
      trend: 'up',
      threshold: 85,
      history: []
    },
    {
      name: 'Response Time',
      value: 124,
      unit: 'ms',
      status: 'normal',
      trend: 'down',
      threshold: 200,
      history: []
    },
    {
      name: 'Error Rate',
      value: 0.12,
      unit: '%',
      status: 'normal',
      trend: 'stable',
      threshold: 1.0,
      history: []
    },
    {
      name: 'Active Users',
      value: 15420,
      unit: '',
      status: 'normal',
      trend: 'up',
      threshold: 20000,
      history: []
    },
    {
      name: 'Throughput',
      value: 847,
      unit: 'req/s',
      status: 'normal',
      trend: 'stable',
      threshold: 1000,
      history: []
    }
  ]);

  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: '1',
      type: 'critical',
      title: 'Database Connection Timeout',
      message: 'Primary database connection exceeded 30s timeout threshold',
      timestamp: new Date(Date.now() - 300000),
      component: 'Database',
      acknowledged: false
    },
    {
      id: '2',
      type: 'warning',
      title: 'High Memory Usage',
      message: 'Memory usage reached 85% threshold',
      timestamp: new Date(Date.now() - 600000),
      component: 'Memory',
      acknowledged: false
    },
    {
      id: '3',
      type: 'info',
      title: 'Deployment Completed',
      message: 'Version 2.0.4 successfully deployed to production',
      timestamp: new Date(Date.now() - 1800000),
      component: 'Deployment',
      acknowledged: true
    }
  ]);

  const [componentStatus, setComponentStatus] = useState<ComponentStatus[]>([
    {
      id: 'cortex-audience',
      name: 'Cortex-Audience',
      status: 'online',
      uptime: 99.97,
      responseTime: 45,
      lastHeartbeat: new Date(),
      version: '2.0.1'
    },
    {
      id: 'cortex-orchestrator',
      name: 'Cortex-Orchestrator',
      status: 'online',
      uptime: 99.95,
      responseTime: 67,
      lastHeartbeat: new Date(),
      version: '2.0.3'
    },
    {
      id: 'cortex-context',
      name: 'Cortex-Context',
      status: 'online',
      uptime: 99.98,
      responseTime: 34,
      lastHeartbeat: new Date(),
      version: '2.0.2'
    },
    {
      id: 'kafka-broker',
      name: 'Kafka Broker',
      status: 'degraded',
      uptime: 98.5,
      responseTime: 234,
      lastHeartbeat: new Date(Date.now() - 120000),
      version: '3.5.0'
    }
  ]);

  const [systemHealth, setSystemHealth] = useState({
    overall: 94.5,
    status: 'warning' as 'normal' | 'warning' | 'critical',
    components: {
      online: 3,
      warning: 1,
      critical: 0,
      offline: 0
    }
  });

  const metricsRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);

  // Simulate real-time data updates
  useEffect(() => {
    if (!isLive || !autoRefresh) return;

    const interval = setInterval(() => {
      // Update system metrics
      setSystemMetrics(prev => prev.map(metric => {
        const variation = (Math.random() - 0.5) * 10;
        const newValue = Math.max(0, metric.value + variation);
        
        // Update status based on thresholds
        let status: 'normal' | 'warning' | 'critical' = 'normal';
        if (newValue > metric.threshold * 0.9) status = 'warning';
        if (newValue > metric.threshold) status = 'critical';

        // Generate new alert if critical
        if (status === 'critical' && metric.status !== 'critical') {
          const newAlert: SystemAlert = {
            id: Date.now().toString(),
            type: 'critical',
            title: `${metric.name} Critical Threshold`,
            message: `${metric.name} has exceeded critical threshold of ${metric.threshold}${metric.unit}`,
            timestamp: new Date(),
            component: metric.name,
            acknowledged: false
          };
          setAlerts(prev => [newAlert, ...prev.slice(0, 50)]);
        }

        return {
          ...metric,
          value: newValue,
          status,
          trend: variation > 0 ? 'up' : variation < 0 ? 'down' : 'stable',
          history: [...metric.history.slice(-59), { time: new Date(), value: newValue }]
        };
      }));

      // Update component status randomly
      if (Math.random() < 0.1) { // 10% chance to update component status
        setComponentStatus(prev => prev.map(component => {
          if (Math.random() < 0.05) { // 5% chance to change status
            const statuses: ComponentStatus['status'][] = ['online', 'degraded', 'maintenance'];
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
            return {
              ...component,
              status: newStatus,
              lastHeartbeat: new Date()
            };
          }
          return component;
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive, autoRefresh]);

  // Update system health based on components
  useEffect(() => {
    const online = componentStatus.filter(c => c.status === 'online').length;
    const warning = componentStatus.filter(c => c.status === 'degraded').length;
    const critical = componentStatus.filter(c => c.status === 'offline').length;
    const offline = componentStatus.filter(c => c.status === 'offline').length;

    const overall = (online * 100 + warning * 70 + critical * 30) / componentStatus.length;
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    if (overall < 90) status = 'warning';
    if (overall < 70 || critical > 0) status = 'critical';

    setSystemHealth({
      overall,
      status,
      components: { online, warning, critical, offline }
    });
  }, [componentStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
      case 'online': return 'text-green-400';
      case 'warning':
      case 'degraded': return 'text-yellow-400';
      case 'critical':
      case 'offline': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'normal':
      case 'online': return 'bg-green-500/20 border-green-500/30';
      case 'warning':
      case 'degraded': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'critical':
      case 'offline': return 'bg-red-500/20 border-red-500/30';
      default: return 'bg-slate-500/20 border-slate-500/30';
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const filteredAlerts = alerts.filter(alert => {
    if (alertsFilter === 'unacknowledged') return !alert.acknowledged;
    if (alertsFilter === 'critical') return alert.type === 'critical';
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)]">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Real-Time Monitoring</h1>
              <p className="text-slate-400">SILEXAR PULSE - System Health Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">System Health:</span>
              <span className={cn("text-sm font-semibold", getStatusColor(systemHealth.status))}>
                {systemHealth.overall.toFixed(1)}% - {systemHealth.status.toUpperCase()}
              </span>
            </div>
            
            <select
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>

            <NeuromorphicButton
              variant={isLive ? 'success' : 'secondary'}
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isLive ? 'Live' : 'Paused'}
            </NeuromorphicButton>

            <NeuromorphicButton
              variant={autoRefresh ? 'success' : 'secondary'}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Auto Refresh
            </NeuromorphicButton>
          </div>
        </div>
      </div>

      {/* System Overview */}
      <NeuromorphicGrid columns={3}>
        {systemMetrics.map((metric, index) => (
          <NeuromorphicCard key={index} variant="embossed" borderAccent={metric.status === 'critical' ? 'red' : metric.status === 'warning' ? 'yellow' : 'blue'}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {metric.name === 'CPU Usage' && <Cpu className="w-5 h-5 text-blue-400" />}
                  {metric.name === 'Memory Usage' && <MemoryStick className="w-5 h-5 text-blue-400" />}
                  {metric.name === 'Response Time' && <Clock className="w-5 h-5 text-blue-400" />}
                  {metric.name === 'Error Rate' && <AlertCircle className="w-5 h-5 text-blue-400" />}
                  {metric.name === 'Active Users' && <Activity className="w-5 h-5 text-blue-400" />}
                  {metric.name === 'Throughput' && <TrendingUp className="w-5 h-5 text-blue-400" />}
                  <h3 className="text-slate-300 font-medium">{metric.name}</h3>
                </div>
                <div className={cn("flex items-center space-x-2", getStatusColor(metric.status))}>
                  <NeuromorphicStatus 
                    status={metric.status === 'normal' ? 'online' : metric.status === 'warning' ? 'warning' : 'error'} 
                    size="sm" 
                    pulse={metric.status === 'critical'}
                  />
                  <span className="text-sm font-medium">{metric.status.toUpperCase()}</span>
                </div>
              </div>
              
              <div className="flex items-baseline space-x-2 mb-4">
                <span className="text-3xl font-bold text-white">
                  {metric.value.toLocaleString()}
                </span>
                <span className="text-sm text-slate-400">{metric.unit}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className={cn("flex items-center space-x-1", 
                  metric.trend === 'up' ? 'text-green-400' : 
                  metric.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                )}>
                  <TrendingUp className={cn("w-4 h-4", metric.trend === 'down' && 'rotate-180')} />
                  <span>{metric.trend}</span>
                </span>
                <span className="text-slate-400">
                  Threshold: {metric.threshold}{metric.unit}
                </span>
              </div>
            </div>
          </NeuromorphicCard>
        ))}
      </NeuromorphicGrid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Component Status */}
        <NeuromorphicCard variant="embossed">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Component Status</h2>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-slate-400">{systemHealth.components.online} Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="text-slate-400">{systemHealth.components.warning} Warning</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-slate-400">{systemHealth.components.critical} Critical</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {componentStatus.map((component) => (
                <div key={component.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <NeuromorphicStatus 
                      status={component.status === 'online' ? 'online' : 
                              component.status === 'degraded' ? 'warning' : 
                              component.status === 'maintenance' ? 'warning' : 'error'} 
                      size="md" 
                      pulse={component.status === 'online'}
                    />
                    <div>
                      <h3 className="text-white font-medium">{component.name}</h3>
                      <p className="text-slate-400 text-sm">Version {component.version}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">{component.uptime}%</div>
                    <div className="text-slate-400 text-sm">{component.responseTime}ms</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </NeuromorphicCard>

        {/* Alerts */}
        <NeuromorphicCard variant="embossed">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold text-white">System Alerts</h2>
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-medium border",
                  filteredAlerts.filter(a => !a.acknowledged).length > 0 
                    ? 'bg-red-900/20 text-red-400 border-red-500/30'
                    : 'bg-green-900/20 text-green-400 border-green-500/30'
                )}>
                  {filteredAlerts.filter(a => !a.acknowledged).length} Unacknowledged
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-white text-sm"
                  value={alertsFilter}
                  onChange={(e) => setAlertsFilter(e.target.value as any)}
                >
                  <option value="all">All Alerts</option>
                  <option value="unacknowledged">Unacknowledged</option>
                  <option value="critical">Critical Only</option>
                </select>
                <NeuromorphicButton variant="secondary" size="sm">
                  <Settings className="w-4 h-4" />
                </NeuromorphicButton>
              </div>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No alerts to display</p>
                </div>
              ) : (
                filteredAlerts.map((alert) => (
                  <div key={alert.id} className={cn(
                    "p-4 rounded-lg border",
                    alert.type === 'critical' ? 'bg-red-900/10 border-red-500/20' :
                    alert.type === 'warning' ? 'bg-yellow-900/10 border-yellow-500/20' :
                    'bg-blue-900/10 border-blue-500/20'
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={cn(
                          "mt-1",
                          alert.type === 'critical' ? 'text-red-400' :
                          alert.type === 'warning' ? 'text-yellow-400' :
                          'text-blue-400'
                        )}>
                          {alert.type === 'critical' ? <AlertTriangle className="w-5 h-5" /> :
                           alert.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
                           <CheckCircle className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-white font-medium">{alert.title}</h4>
                            <span className={cn(
                              "px-2 py-1 rounded text-xs font-medium border",
                              alert.type === 'critical' ? 'bg-red-900/20 text-red-400 border-red-500/30' :
                              alert.type === 'warning' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30' :
                              'bg-blue-900/20 text-blue-400 border-blue-500/30'
                            )}>
                              {alert.type.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm mb-2">{alert.message}</p>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-slate-400">
                              {alert.component} • {alert.timestamp.toLocaleTimeString()}
                            </div>
                            {!alert.acknowledged && (
                              <NeuromorphicButton
                                variant="secondary"
                                size="sm"
                                onClick={() => acknowledgeAlert(alert.id)}
                              >
                                Acknowledge
                              </NeuromorphicButton>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </NeuromorphicCard>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <NeuromorphicCard variant="embossed" className="max-w-2xl w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Monitoring Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <EyeOff className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-medium mb-3">Alert Thresholds</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {systemMetrics.map((metric) => (
                      <div key={metric.name} className="space-y-2">
                        <label className="text-slate-300 text-sm">{metric.name} Threshold</label>
                        <input
                          type="number"
                          className="w-full bg-slate-900/80 border border-slate-700/50 rounded-lg px-3 py-2 text-white"
                          defaultValue={metric.threshold}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-3">Notification Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Email Notifications</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Slack Integration</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">SMS for Critical Alerts</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <NeuromorphicButton
                    variant="secondary"
                    onClick={() => setShowSettings(false)}
                  >
                    Cancel
                  </NeuromorphicButton>
                  <NeuromorphicButton
                    variant="primary"
                    onClick={() => setShowSettings(false)}
                  >
                    Save Settings
                  </NeuromorphicButton>
                </div>
              </div>
            </div>
          </NeuromorphicCard>
        </div>
      )}
    </div>
  );
};

export default RealTimeMonitoringDashboard;