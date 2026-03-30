/**
 * 👁️ SILEXAR PULSE QUANTUM - OBSERVABILITY CENTER TIER 0
 * 
 * Centro de observabilidad enterprise con distributed tracing y metrics
 * Monitoreo completo de arquitectura distribuida
 * 
 * @version 2040.1.0
 * @author Silexar Pulse Quantum Team
 * @classification TIER 0 - ENTERPRISE OBSERVABILITY CENTER
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Activity, 
  BarChart3, 
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  RefreshCw,
  Network,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

// 🔍 Trace
interface Trace {
  traceId: string;
  operationName: string;
  serviceName: string;
  duration: number;
  startTime: Date;
  status: 'OK' | 'ERROR' | 'TIMEOUT';
  spanCount: number;
  serviceCount: number;
  errorCount: number;
}

// 📊 Span
interface Span {
  spanId: string;
  traceId: string;
  operationName: string;
  serviceName: string;
  duration: number;
  startTime: Date;
  status: 'OK' | 'ERROR' | 'TIMEOUT';
  tags: Record<string, string>;
}

// 📈 Metric
interface Metric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  labels: Record<string, string>;
  trend: 'UP' | 'DOWN' | 'STABLE';
  changeRate: number;
}

// 🚨 Alert
interface ObservabilityAlert {
  id: string;
  type: 'TRACE' | 'METRIC' | 'LOG' | 'SLA';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  service: string;
  timestamp: Date;
  acknowledged: boolean;
}

// 📊 Observability Metrics
interface ObservabilityMetrics {
  totalTraces: number;
  errorTraces: number;
  averageLatency: number;
  throughput: number;
  serviceCount: number;
  alertCount: number;
  slaCompliance: number;
  timestamp: Date;
}

/**
 * 👁️ Observability Center Component
 */
export default function ObservabilityCenter() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [alerts, setAlerts] = useState<ObservabilityAlert[]>([]);
  const [observabilityMetrics, setObservabilityMetrics] = useState<ObservabilityMetrics | null>(null);
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
  const [viewMode, setViewMode] = useState<'traces' | 'metrics' | 'alerts' | 'topology'>('traces');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 Load observability data
  useEffect(() => {
    loadObservabilityData();
    const interval = setInterval(loadObservabilityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  /**
   * 📊 Load Observability Data
   */
  const loadObservabilityData = async () => {
    try {
      // Simulate API call to get observability data
      const mockTraces: Trace[] = [
        {
          traceId: 'trace-001',
          operationName: 'GET /api/crm/anunciantes',
          serviceName: 'api-gateway',
          duration: 245,
          startTime: new Date(Date.now() - 120000),
          status: 'OK',
          spanCount: 8,
          serviceCount: 4,
          errorCount: 0
        },
        {
          traceId: 'trace-002',
          operationName: 'POST /api/auth/login',
          serviceName: 'auth-service',
          duration: 89,
          startTime: new Date(Date.now() - 180000),
          status: 'OK',
          spanCount: 5,
          serviceCount: 2,
          errorCount: 0
        },
        {
          traceId: 'trace-003',
          operationName: 'GET /api/inventory/auspicios',
          serviceName: 'inventory-service',
          duration: 1250,
          startTime: new Date(Date.now() - 300000),
          status: 'ERROR',
          spanCount: 12,
          serviceCount: 5,
          errorCount: 2
        },
        {
          traceId: 'trace-004',
          operationName: 'PUT /api/contracts/update',
          serviceName: 'contracts-service',
          duration: 156,
          startTime: new Date(Date.now() - 420000),
          status: 'OK',
          spanCount: 6,
          serviceCount: 3,
          errorCount: 0
        },
        {
          traceId: 'trace-005',
          operationName: 'POST /api/notifications/send',
          serviceName: 'notification-service',
          duration: 2100,
          startTime: new Date(Date.now() - 600000),
          status: 'TIMEOUT',
          spanCount: 4,
          serviceCount: 2,
          errorCount: 1
        }
      ];

      const mockMetrics: Metric[] = [
        {
          name: 'http_requests_total',
          value: 15420,
          unit: 'requests',
          timestamp: new Date(),
          labels: { service: 'api-gateway', method: 'GET' },
          trend: 'UP',
          changeRate: 12.5
        },
        {
          name: 'http_request_duration_seconds',
          value: 0.245,
          unit: 'seconds',
          timestamp: new Date(),
          labels: { service: 'api-gateway', quantile: '0.95' },
          trend: 'DOWN',
          changeRate: -8.2
        },
        {
          name: 'cpu_usage_percent',
          value: 68.5,
          unit: 'percent',
          timestamp: new Date(),
          labels: { service: 'crm-service', instance: 'crm-001' },
          trend: 'UP',
          changeRate: 5.3
        },
        {
          name: 'memory_usage_bytes',
          value: 536870912,
          unit: 'bytes',
          timestamp: new Date(),
          labels: { service: 'auth-service', instance: 'auth-001' },
          trend: 'STABLE',
          changeRate: 0.8
        },
        {
          name: 'error_rate_percent',
          value: 2.1,
          unit: 'percent',
          timestamp: new Date(),
          labels: { service: 'inventory-service' },
          trend: 'UP',
          changeRate: 15.6
        }
      ];

      const mockAlerts: ObservabilityAlert[] = [
        {
          id: 'alert-obs-001',
          type: 'TRACE',
          severity: 'HIGH',
          title: 'High Error Rate Detected',
          message: 'Inventory service showing 15% error rate in last 5 minutes',
          service: 'inventory-service',
          timestamp: new Date(Date.now() - 300000),
          acknowledged: false
        },
        {
          id: 'alert-obs-002',
          type: 'METRIC',
          severity: 'CRITICAL',
          title: 'Response Time Threshold Exceeded',
          message: 'Notification service P95 latency > 2000ms',
          service: 'notification-service',
          timestamp: new Date(Date.now() - 180000),
          acknowledged: false
        },
        {
          id: 'alert-obs-003',
          type: 'SLA',
          severity: 'MEDIUM',
          title: 'SLA Compliance Warning',
          message: 'API Gateway SLA compliance dropped to 98.5%',
          service: 'api-gateway',
          timestamp: new Date(Date.now() - 600000),
          acknowledged: true
        }
      ];

      const mockObservabilityMetrics: ObservabilityMetrics = {
        totalTraces: 1250,
        errorTraces: 45,
        averageLatency: 185,
        throughput: 850,
        serviceCount: 12,
        alertCount: mockAlerts.filter(a => !a.acknowledged).length,
        slaCompliance: 99.2,
        timestamp: new Date()
      };

      setTraces(mockTraces);
      setMetrics(mockMetrics);
      setAlerts(mockAlerts);
      setObservabilityMetrics(mockObservabilityMetrics);
      setIsLoading(false);

    } catch (error) {
      console.error('Failed to load observability data:', error);
      setIsLoading(false);
    }
  };

  /**
   * 🎨 Get Status Icon
   */
  const getStatusIcon = (status: 'OK' | 'ERROR' | 'TIMEOUT') => {
    switch (status) {
      case 'OK':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'ERROR':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'TIMEOUT':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  /**
   * 🎨 Get Status Color
   */
  const getStatusColor = (status: 'OK' | 'ERROR' | 'TIMEOUT') => {
    switch (status) {
      case 'OK':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ERROR':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'TIMEOUT':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  /**
   * 🎨 Get Trend Icon
   */
  const getTrendIcon = (trend: 'UP' | 'DOWN' | 'STABLE') => {
    switch (trend) {
      case 'UP':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'DOWN':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'STABLE':
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  /**
   * 📊 Format Duration
   */
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  /**
   * 📊 Format Metric Value
   */
  const formatMetricValue = (value: number, unit: string) => {
    switch (unit) {
      case 'bytes':
        return `${(value / 1024 / 1024).toFixed(1)}MB`;
      case 'seconds':
        return `${(value * 1000).toFixed(0)}ms`;
      case 'percent':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  /**
   * 📊 Format Time Ago
   */
  const formatTimeAgo = (date: Date) => {
    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  /**
   * 🚨 Acknowledge Alert
   */
  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  /**
   * 🔍 Filter Traces
   */
  const filteredTraces = traces.filter(trace => 
    trace.operationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trace.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trace.traceId.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h2 className="text-lg font-semibold text-gray-900">Observability Overview</h2>
          {observabilityMetrics && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{observabilityMetrics.totalTraces} traces</span>
              <span>•</span>
              <span>{observabilityMetrics.serviceCount} services</span>
              <span>•</span>
              <span>{observabilityMetrics.slaCompliance.toFixed(1)}% SLA</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { id: 'traces', name: 'Traces', icon: Eye },
              { id: 'metrics', name: 'Metrics', icon: BarChart3 },
              { id: 'alerts', name: 'Alerts', icon: AlertTriangle },
              { id: 'topology', name: 'Topology', icon: Network }
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
                {mode.id === 'alerts' && alerts.filter(a => !a.acknowledged).length > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs px-1 py-0.5 rounded-full">
                    {alerts.filter(a => !a.acknowledged).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          <button
            onClick={loadObservabilityData}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Observability Metrics Cards */}
      {observabilityMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Total Traces</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {observabilityMetrics.totalTraces.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              {observabilityMetrics.errorTraces} errors
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Avg Latency</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {observabilityMetrics.averageLatency}ms
            </div>
            <div className="text-sm text-gray-500">
              {observabilityMetrics.throughput} req/s
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">SLA Compliance</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {observabilityMetrics.slaCompliance.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">
              {observabilityMetrics.serviceCount} services
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Active Alerts</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {observabilityMetrics.alertCount}
            </div>
            <div className="text-sm text-gray-500">
              Needs attention
            </div>
          </div>
        </div>
      )}

      {/* Traces Tab */}
      {viewMode === 'traces' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search traces by operation, service, or trace ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>

          {/* Traces List */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Recent Traces</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredTraces.map((trace) => (
                <div
                  key={trace.traceId}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedTrace(trace)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(trace.status)}
                      <div>
                        <div className="font-medium text-gray-900">{trace.operationName}</div>
                        <div className="text-sm text-gray-600">{trace.serviceName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{formatDuration(trace.duration)}</div>
                      <div className="text-sm text-gray-600">{formatTimeAgo(trace.startTime)}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                    <span>Trace ID: {trace.traceId}</span>
                    <span>•</span>
                    <span>{trace.spanCount} spans</span>
                    <span>•</span>
                    <span>{trace.serviceCount} services</span>
                    {trace.errorCount > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-red-600">{trace.errorCount} errors</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Metrics Tab */}
      {viewMode === 'metrics' && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">System Metrics</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {metrics.map((metric, index) => (
              <div key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium text-gray-900">{metric.name}</div>
                      <div className="text-sm text-gray-600">
                        Service: {metric.labels.service}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {formatMetricValue(metric.value, metric.unit)}
                      </span>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {metric.changeRate > 0 ? '+' : ''}{metric.changeRate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {viewMode === 'alerts' && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Observability Alerts</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                      alert.severity === 'CRITICAL' ? 'text-red-500' :
                      alert.severity === 'HIGH' ? 'text-orange-500' :
                      alert.severity === 'MEDIUM' ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                    <div>
                      <div className="font-medium text-gray-900">{alert.title}</div>
                      <div className="text-sm text-gray-600 mt-1">{alert.message}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        {alert.service} • {formatTimeAgo(alert.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      alert.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity}
                    </span>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Acknowledge
                      </button>
                    )}
                    {alert.acknowledged && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topology Tab */}
      {viewMode === 'topology' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center py-12">
            <Network className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Service Topology</h3>
            <p className="text-gray-600 mb-4">
              Interactive service dependency graph with real-time metrics
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {['API Gateway', 'Auth Service', 'CRM Service', 'Inventory Service'].map((service, index) => (
                <div key={service} className="text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    index === 0 ? 'bg-blue-100 text-blue-600' :
                    index === 1 ? 'bg-green-100 text-green-600' :
                    index === 2 ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    <Activity className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-medium text-gray-900">{service}</div>
                  <div className="text-xs text-gray-500">
                    {Math.floor(Math.random() * 100 + 50)}ms
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trace Detail Modal */}
      {selectedTrace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedTrace.operationName}</h3>
                    <p className="text-gray-600">Trace ID: {selectedTrace.traceId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTrace(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedTrace.status)}
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(selectedTrace.status)}`}>
                      {selectedTrace.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Duration</label>
                  <div className="text-lg font-semibold text-gray-900 mt-1">
                    {formatDuration(selectedTrace.duration)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Spans</label>
                  <div className="text-lg font-semibold text-gray-900 mt-1">
                    {selectedTrace.spanCount}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Services</label>
                  <div className="text-lg font-semibold text-gray-900 mt-1">
                    {selectedTrace.serviceCount}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Service</label>
                <div className="text-lg font-semibold text-gray-900 mt-1">{selectedTrace.serviceName}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Start Time</label>
                <div className="text-sm text-gray-900 mt-1">
                  {selectedTrace.startTime.toLocaleString()}
                </div>
              </div>

              {selectedTrace.errorCount > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Errors</label>
                  <div className="text-lg font-semibold text-red-600 mt-1">
                    {selectedTrace.errorCount} error{selectedTrace.errorCount > 1 ? 's' : ''} detected
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}