/**
 * 🔧 SILEXAR PULSE QUANTUM - MICROSERVICES MONITOR TIER 0
 * 
 * Monitor de microservicios enterprise con service mesh y health monitoring
 * Visualización en tiempo real de arquitectura distribuida
 * 
 * @version 2040.1.0
 * @author Silexar Pulse Quantum Team
 * @classification TIER 0 - ENTERPRISE MICROSERVICES MONITOR
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Zap,
  Shield,
  Network,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw
} from 'lucide-react';

// 🔧 Service Status
type ServiceStatus = 'HEALTHY' | 'UNHEALTHY' | 'DEGRADED' | 'STARTING' | 'STOPPING';

// 🎯 Service Instance
interface ServiceInstance {
  id: string;
  name: string;
  version: string;
  host: string;
  port: number;
  status: ServiceStatus;
  healthScore: number;
  responseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  lastHealthCheck: Date;
  uptime: number;
  tags: string[];
}

// 📊 Service Metrics
interface ServiceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
}

// 🔗 Service Dependency
interface ServiceDependency {
  from: string;
  to: string;
  type: 'HTTP' | 'GRPC' | 'MESSAGE_QUEUE' | 'DATABASE';
  status: 'HEALTHY' | 'DEGRADED' | 'BROKEN';
  latency: number;
  errorRate: number;
}

// 🚨 Service Alert
interface ServiceAlert {
  id: string;
  service: string;
  type: 'HEALTH' | 'PERFORMANCE' | 'ERROR_RATE' | 'DEPENDENCY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

/**
 * 🔧 Microservices Monitor Component
 */
export default function MicroservicesMonitor() {
  const [services, setServices] = useState<ServiceInstance[]>([]);
  const [dependencies, setDependencies] = useState<ServiceDependency[]>([]);
  const [alerts, setAlerts] = useState<ServiceAlert[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceInstance | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'topology' | 'metrics'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 Load services data
  useEffect(() => {
    loadServicesData();
    const interval = setInterval(loadServicesData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  /**
   * 📊 Load Services Data
   */
  const loadServicesData = async () => {
    try {
      // Simulate API call to get services data
      const mockServices: ServiceInstance[] = [
        {
          id: 'api-gateway-001',
          name: 'API Gateway',
          version: '2.1.0',
          host: 'api-gateway.default.svc.cluster.local',
          port: 8080,
          status: 'HEALTHY',
          healthScore: 98.5,
          responseTime: 45,
          requestsPerSecond: 1250,
          errorRate: 0.2,
          cpuUsage: 35,
          memoryUsage: 512,
          lastHealthCheck: new Date(),
          uptime: 2592000, // 30 days
          tags: ['gateway', 'public', 'critical']
        },
        {
          id: 'auth-service-001',
          name: 'Auth Service',
          version: '1.8.2',
          host: 'auth-service.default.svc.cluster.local',
          port: 3001,
          status: 'HEALTHY',
          healthScore: 96.2,
          responseTime: 78,
          requestsPerSecond: 450,
          errorRate: 0.5,
          cpuUsage: 28,
          memoryUsage: 256,
          lastHealthCheck: new Date(),
          uptime: 1728000, // 20 days
          tags: ['auth', 'security', 'critical']
        },
        {
          id: 'crm-service-001',
          name: 'CRM Service',
          version: '3.2.1',
          host: 'crm-service.default.svc.cluster.local',
          port: 3002,
          status: 'HEALTHY',
          healthScore: 94.8,
          responseTime: 125,
          requestsPerSecond: 320,
          errorRate: 1.2,
          cpuUsage: 42,
          memoryUsage: 768,
          lastHealthCheck: new Date(),
          uptime: 864000, // 10 days
          tags: ['crm', 'business', 'high']
        },
        {
          id: 'inventory-service-001',
          name: 'Inventory Service',
          version: '2.5.0',
          host: 'inventory-service.default.svc.cluster.local',
          port: 3003,
          status: 'DEGRADED',
          healthScore: 82.1,
          responseTime: 245,
          requestsPerSecond: 180,
          errorRate: 3.8,
          cpuUsage: 68,
          memoryUsage: 1024,
          lastHealthCheck: new Date(),
          uptime: 432000, // 5 days
          tags: ['inventory', 'business', 'medium']
        },
        {
          id: 'contracts-service-001',
          name: 'Contracts Service',
          version: '1.9.5',
          host: 'contracts-service.default.svc.cluster.local',
          port: 3004,
          status: 'HEALTHY',
          healthScore: 97.3,
          responseTime: 89,
          requestsPerSecond: 95,
          errorRate: 0.8,
          cpuUsage: 22,
          memoryUsage: 384,
          lastHealthCheck: new Date(),
          uptime: 1296000, // 15 days
          tags: ['contracts', 'business', 'medium']
        },
        {
          id: 'notification-service-001',
          name: 'Notification Service',
          version: '1.4.3',
          host: 'notification-service.default.svc.cluster.local',
          port: 3005,
          status: 'UNHEALTHY',
          healthScore: 45.2,
          responseTime: 1250,
          requestsPerSecond: 25,
          errorRate: 15.6,
          cpuUsage: 85,
          memoryUsage: 512,
          lastHealthCheck: new Date(Date.now() - 300000), // 5 minutes ago
          uptime: 86400, // 1 day
          tags: ['notification', 'communication', 'low']
        }
      ];

      const mockDependencies: ServiceDependency[] = [
        {
          from: 'API Gateway',
          to: 'Auth Service',
          type: 'HTTP',
          status: 'HEALTHY',
          latency: 12,
          errorRate: 0.1
        },
        {
          from: 'API Gateway',
          to: 'CRM Service',
          type: 'HTTP',
          status: 'HEALTHY',
          latency: 18,
          errorRate: 0.3
        },
        {
          from: 'CRM Service',
          to: 'Inventory Service',
          type: 'GRPC',
          status: 'DEGRADED',
          latency: 45,
          errorRate: 2.1
        },
        {
          from: 'Contracts Service',
          to: 'Notification Service',
          type: 'MESSAGE_QUEUE',
          status: 'BROKEN',
          latency: 850,
          errorRate: 12.5
        }
      ];

      const mockAlerts: ServiceAlert[] = [
        {
          id: 'alert-001',
          service: 'Notification Service',
          type: 'HEALTH',
          severity: 'CRITICAL',
          message: 'Service is unhealthy - high error rate and response time',
          timestamp: new Date(Date.now() - 180000),
          acknowledged: false
        },
        {
          id: 'alert-002',
          service: 'Inventory Service',
          type: 'PERFORMANCE',
          severity: 'HIGH',
          message: 'Response time exceeding threshold: 245ms > 200ms',
          timestamp: new Date(Date.now() - 600000),
          acknowledged: false
        },
        {
          id: 'alert-003',
          service: 'CRM Service',
          type: 'ERROR_RATE',
          severity: 'MEDIUM',
          message: 'Error rate slightly elevated: 1.2% > 1.0%',
          timestamp: new Date(Date.now() - 900000),
          acknowledged: true
        }
      ];

      setServices(mockServices);
      setDependencies(mockDependencies);
      setAlerts(mockAlerts);
      setIsLoading(false);

    } catch (error) {
      console.error('Failed to load services data:', error);
      setIsLoading(false);
    }
  };

  /**
   * 🎨 Get Status Icon
   */
  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case 'HEALTHY':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'DEGRADED':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'UNHEALTHY':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'STARTING':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'STOPPING':
        return <Clock className="w-5 h-5 text-gray-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  /**
   * 🎨 Get Status Color
   */
  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'HEALTHY':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DEGRADED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'UNHEALTHY':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'STARTING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'STOPPING':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  /**
   * 🎨 Get Health Score Color
   */
  const getHealthScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  /**
   * 📊 Format Uptime
   */
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  /**
   * 🚨 Acknowledge Alert
   */
  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Service Mesh Overview</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {services.filter(s => s.status === 'HEALTHY').length} healthy
            </span>
            <span className="text-sm text-gray-600">•</span>
            <span className="text-sm text-gray-600">
              {services.filter(s => s.status === 'DEGRADED').length} degraded
            </span>
            <span className="text-sm text-gray-600">•</span>
            <span className="text-sm text-gray-600">
              {services.filter(s => s.status === 'UNHEALTHY').length} unhealthy
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { id: 'grid', name: 'Grid', icon: BarChart3 },
              { id: 'topology', name: 'Topology', icon: Network },
              { id: 'metrics', name: 'Metrics', icon: Activity }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium ${
                  viewMode === mode.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <mode.icon className="w-4 h-4" />
                {mode.name}
              </button>
            ))}
          </div>
          
          <button
            onClick={loadServicesData}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.filter(a => !a.acknowledged).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-medium text-red-900">Active Alerts</h3>
          </div>
          <div className="space-y-2">
            {alerts.filter(a => !a.acknowledged).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between bg-white p-3 rounded border">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    alert.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="font-medium text-gray-900">{alert.service}</span>
                  <span className="text-gray-600">{alert.message}</span>
                </div>
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Acknowledge
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedService(service)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Server className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-600">v{service.version}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Health Score</span>
                  <span className={`font-semibold ${getHealthScoreColor(service.healthScore)}`}>
                    {service.healthScore.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="font-medium text-gray-900">{service.responseTime}ms</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Requests/sec</span>
                  <span className="font-medium text-gray-900">{service.requestsPerSecond}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className={`font-medium ${service.errorRate > 2 ? 'text-red-600' : 'text-green-600'}`}>
                    {service.errorRate.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Uptime</span>
                  <span className="font-medium text-gray-900">{formatUptime(service.uptime)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-1">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Topology View */}
      {viewMode === 'topology' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center py-12">
            <Network className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Service Topology</h3>
            <p className="text-gray-600 mb-4">
              Interactive service mesh topology visualization
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {dependencies.map((dep, index) => (
                <div key={index} className="text-center">
                  <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                    dep.status === 'HEALTHY' ? 'bg-green-500' :
                    dep.status === 'DEGRADED' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div className="text-xs text-gray-600">
                    {dep.from} → {dep.to}
                  </div>
                  <div className="text-xs text-gray-500">
                    {dep.latency}ms
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Metrics View */}
      {viewMode === 'metrics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Trends</h3>
            <div className="space-y-4">
              {services.slice(0, 4).map((service) => (
                <div key={service.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      service.status === 'HEALTHY' ? 'bg-green-500' :
                      service.status === 'DEGRADED' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{service.responseTime}ms</span>
                    {service.responseTime < 100 ? (
                      <TrendingDown className="w-4 h-4 text-green-500" />
                    ) : service.responseTime > 200 ? (
                      <TrendingUp className="w-4 h-4 text-red-500" />
                    ) : (
                      <Minus className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Throughput Analysis</h3>
            <div className="space-y-4">
              {services.slice(0, 4).map((service) => (
                <div key={service.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-900">{service.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {service.requestsPerSecond} RPS
                    </div>
                    <div className="text-xs text-gray-600">
                      {service.errorRate.toFixed(1)}% errors
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Server className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedService.name}</h3>
                    <p className="text-gray-600">Version {selectedService.version}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedService.status)}
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(selectedService.status)}`}>
                      {selectedService.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Health Score</label>
                  <div className={`text-lg font-semibold mt-1 ${getHealthScoreColor(selectedService.healthScore)}`}>
                    {selectedService.healthScore.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Host</label>
                  <div className="text-sm text-gray-900 mt-1">{selectedService.host}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Port</label>
                  <div className="text-sm text-gray-900 mt-1">{selectedService.port}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Response Time</label>
                  <div className="text-lg font-semibold text-gray-900 mt-1">{selectedService.responseTime}ms</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Requests/sec</label>
                  <div className="text-lg font-semibold text-gray-900 mt-1">{selectedService.requestsPerSecond}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">CPU Usage</label>
                  <div className="text-lg font-semibold text-gray-900 mt-1">{selectedService.cpuUsage}%</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Memory Usage</label>
                  <div className="text-lg font-semibold text-gray-900 mt-1">{selectedService.memoryUsage}MB</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Tags</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedService.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}