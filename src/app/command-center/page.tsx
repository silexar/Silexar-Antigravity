'use client';
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Shield, 
  Zap, 
  BarChart3, 
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Target,
  Brain,
  Network,
  Lock
} from 'lucide-react';
import { NeuromorphicCard, NeuromorphicButton, NeuromorphicStatus, NeuromorphicGrid } from '@/components/ui/neuromorphic';
import { cn } from '@/lib/utils';

// System Health Metrics
interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'optimal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

// Cortex Engine Status
interface CortexEngine {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  load: number;
  lastHeartbeat: Date;
  version: string;
}

// Security Alert
interface SecurityAlert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  source: string;
}

const CommandCenter: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    {
      name: 'System Uptime',
      value: 99.97,
      unit: '%',
      status: 'optimal',
      trend: 'stable',
      icon: <Clock className="w-5 h-5" />
    },
    {
      name: 'Cortex Load',
      value: 73.2,
      unit: '%',
      status: 'optimal',
      trend: 'up',
      icon: <Brain className="w-5 h-5" />
    },
    {
      name: 'Revenue Today',
      value: 284750,
      unit: 'USD',
      status: 'optimal',
      trend: 'up',
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      name: 'Active Users',
      value: 15420,
      unit: '',
      status: 'optimal',
      trend: 'up',
      icon: <Users className="w-5 h-5" />
    },
    {
      name: 'Campaign Performance',
      value: 87.5,
      unit: '%',
      status: 'optimal',
      trend: 'stable',
      icon: <Target className="w-5 h-5" />
    },
    {
      name: 'Security Score',
      value: 98.5,
      unit: '%',
      status: 'optimal',
      trend: 'stable',
      icon: <Shield className="w-5 h-5" />
    }
  ]);

  const [cortexEngines, setCortexEngines] = useState<CortexEngine[]>([
    {
      id: 'cortex-audience',
      name: 'Cortex-Audience',
      status: 'online',
      load: 68,
      lastHeartbeat: new Date(),
      version: '2.0.1'
    },
    {
      id: 'cortex-orchestrator',
      name: 'Cortex-Orchestrator',
      status: 'online',
      load: 82,
      lastHeartbeat: new Date(),
      version: '2.0.3'
    },
    {
      id: 'cortex-context',
      name: 'Cortex-Context',
      status: 'online',
      load: 45,
      lastHeartbeat: new Date(),
      version: '2.0.2'
    },
    {
      id: 'cortex-voice',
      name: 'Cortex-Voice',
      status: 'maintenance',
      load: 0,
      lastHeartbeat: new Date(Date.now() - 300000),
      version: '2.0.1'
    }
  ]);

  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([
    {
      id: '1',
      level: 'info',
      message: 'Backup automático completado exitosamente',
      timestamp: new Date(Date.now() - 3600000),
      source: 'Backup System'
    },
    {
      id: '2',
      level: 'warning',
      message: 'Intento de acceso no autorizado detectado',
      timestamp: new Date(Date.now() - 1800000),
      source: 'Security Gateway'
    }
  ]);

  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'engines' | 'security' | 'billing'>('overview');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.name === 'Cortex Load' 
          ? Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 5))
          : metric.value
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
      default: return <div className="w-4 h-4 border-t border-slate-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <NeuromorphicStatus status="online" size="sm" pulse />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">SILEXAR PULSE</h1>
              <p className="text-slate-400">Command Center - Neural Operations</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <NeuromorphicButton
              variant={isEmergencyMode ? 'danger' : 'secondary'}
              onClick={() => setIsEmergencyMode(!isEmergencyMode)}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {isEmergencyMode ? 'EMERGENCY ACTIVE' : 'EMERGENCY MODE'}
            </NeuromorphicButton>
            <NeuromorphicButton variant="secondary">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </NeuromorphicButton>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-slate-800">
          {[
            { id: 'overview', label: 'System Overview', icon: <Activity className="w-4 h-4" /> },
            { id: 'engines', label: 'Cortex Engines', icon: <Brain className="w-4 h-4" /> },
            { id: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> },
            { id: 'billing', label: 'Value Billing', icon: <DollarSign className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as unknown)}
              className={cn(
                'flex items-center space-x-2 px-4 py-3 font-medium transition-all duration-200',
                'border-b-2',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <NeuromorphicGrid columns={3}>
            {metrics.map((metric) => (
              <NeuromorphicCard key={metric.name} variant="embossed" borderAccent="blue">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-400">{metric.icon}</div>
                      <h3 className="text-slate-300 font-medium">{metric.name}</h3>
                    </div>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-white">
                      {metric.value.toLocaleString()}
                    </span>
                    <span className={cn("text-sm font-medium", getStatusColor(metric.status))}>
                      {metric.unit}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center space-x-2">
                    <NeuromorphicStatus 
                      status={metric.status === 'optimal' ? 'online' : metric.status === 'warning' ? 'warning' : 'error'} 
                      size="sm" 
                    />
                    <span className={cn("text-sm capitalize", getStatusColor(metric.status))}>
                      {metric.status}
                    </span>
                  </div>
                </div>
              </NeuromorphicCard>
            ))}
          </NeuromorphicGrid>

          {/* Quick Actions */}
          <NeuromorphicCard variant="debossed">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <NeuromorphicButton variant="primary" size="lg">
                  <Zap className="w-5 h-5 mr-2" />
                  Deploy Campaign
                </NeuromorphicButton>
                <NeuromorphicButton variant="secondary" size="lg">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Generate Report
                </NeuromorphicButton>
                <NeuromorphicButton variant="secondary" size="lg">
                  <Network className="w-5 h-5 mr-2" />
                  Monitor Network
                </NeuromorphicButton>
                <NeuromorphicButton variant="success" size="lg">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  System Check
                </NeuromorphicButton>
              </div>
            </div>
          </NeuromorphicCard>
        </div>
      )}

      {activeTab === 'engines' && (
        <div className="space-y-6">
          <NeuromorphicCard variant="embossed">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Cortex Engine Status</h2>
              <div className="space-y-4">
                {cortexEngines.map((engine) => (
                  <div key={engine.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <NeuromorphicStatus 
                        status={engine.status === 'online' ? 'online' : engine.status === 'maintenance' ? 'warning' : 'error'} 
                        size="md" 
                        pulse={engine.status === 'online'}
                      />
                      <div>
                        <h3 className="text-white font-medium">{engine.name}</h3>
                        <p className="text-slate-400 text-sm">Version {engine.version}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-slate-300 text-sm">Load</p>
                        <p className="text-white font-semibold">{engine.load}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-300 text-sm">Status</p>
                        <p className={cn("font-semibold capitalize", 
                          engine.status === 'online' ? 'text-green-400' : 
                          engine.status === 'maintenance' ? 'text-yellow-400' : 'text-red-400'
                        )}>
                          {engine.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </NeuromorphicCard>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <NeuromorphicCard variant="embossed">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Security Alerts</h2>
              <div className="space-y-3">
                {securityAlerts.map((alert) => (
                  <div key={alert.id} className={cn(
                    "p-4 rounded-lg border",
                    alert.level === 'critical' ? 'bg-red-900/20 border-red-500/30' :
                    alert.level === 'warning' ? 'bg-yellow-900/20 border-yellow-500/30' :
                    'bg-blue-900/20 border-blue-500/30'
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={cn(
                          "mt-1",
                          alert.level === 'critical' ? 'text-red-400' :
                          alert.level === 'warning' ? 'text-yellow-400' :
                          'text-blue-400'
                        )}>
                          {alert.level === 'critical' ? <AlertTriangle className="w-5 h-5" /> :
                           alert.level === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                           <CheckCircle className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-white font-medium">{alert.message}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
                            <span>Source: {alert.source}</span>
                            <span>{alert.timestamp.toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </NeuromorphicCard>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NeuromorphicCard variant="embossed">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Value-Based Billing</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">CPVI Events Today</span>
                    <span className="text-white font-semibold">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">CPCN Completions</span>
                    <span className="text-white font-semibold">892</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Revenue from Value Models</span>
                    <span className="text-green-400 font-semibold">$45,230</span>
                  </div>
                </div>
              </div>
            </NeuromorphicCard>
            
            <NeuromorphicCard variant="embossed">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Kafka Integration</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <NeuromorphicStatus status="online" size="sm" pulse />
                    <span className="text-slate-300">user_interactions topic</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <NeuromorphicStatus status="online" size="sm" pulse />
                    <span className="text-slate-300">narrative_progress topic</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <NeuromorphicStatus status="online" size="sm" pulse />
                    <span className="text-slate-300">billing_events topic</span>
                  </div>
                </div>
              </div>
            </NeuromorphicCard>
          </div>
        </div>
      )}

      {/* Emergency Mode Overlay */}
      {isEmergencyMode && (
        <div className="fixed inset-0 bg-red-900/20 backdrop-blur-sm flex items-center justify-center z-50">
          <NeuromorphicCard variant="embossed" borderAccent="red">
            <div className="p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-400 mb-2">EMERGENCY MODE ACTIVE</h2>
              <p className="text-slate-300 mb-6">System is operating under emergency protocols</p>
              <NeuromorphicButton 
                variant="danger" 
                size="lg"
                onClick={() => setIsEmergencyMode(false)}
              >
                Deactivate Emergency Mode
              </NeuromorphicButton>
            </div>
          </NeuromorphicCard>
        </div>
      )}
    </div>
  );
};

export default CommandCenter;