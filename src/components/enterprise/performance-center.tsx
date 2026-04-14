/**
 * ⚡ SILEXAR PULSE QUANTUM - PERFORMANCE CENTER TIER 0
 * 
 * Centro de performance enterprise con monitoreo en tiempo real
 * Optimización automática y análisis de rendimiento avanzado
 * 
 * @version 2040.1.0
 * @author Silexar Pulse Quantum Team
 * @classification TIER 0 - ENTERPRISE PERFORMANCE CENTER
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Activity, 
  Gauge, 
  Clock,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Target,
  BarChart3
} from 'lucide-react';

// ⚡ Performance Metric
interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'GOOD' | 'WARNING' | 'CRITICAL';
  trend: 'UP' | 'DOWN' | 'STABLE';
  changeRate: number;
  timestamp: Date;
}

// 🎯 Performance Target
interface PerformanceTarget {
  metric: string;
  target: number;
  current: number;
  achievement: number;
  status: 'MET' | 'NEAR' | 'MISSED';
}

// 📊 Service Performance
interface ServicePerformance {
  serviceName: string;
  responseTime: PerformanceMetric;
  throughput: PerformanceMetric;
  errorRate: PerformanceMetric;
  cpuUsage: PerformanceMetric;
  memoryUsage: PerformanceMetric;
  availability: PerformanceMetric;
}

// 🔧 Performance Optimization
interface PerformanceOptimization {
  id: string;
  type: 'CPU' | 'MEMORY' | 'NETWORK' | 'DATABASE' | 'CACHE';
  service: string;
  recommendation: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedImprovement: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

// 📈 Performance Summary
interface PerformanceSummary {
  overallScore: number;
  responseTimeP95: number;
  throughput: number;
  errorRate: number;
  availability: number;
  optimizationsActive: number;
  slaCompliance: number;
  timestamp: Date;
}

/**
 * ⚡ Performance Center Component
 */
export default function PerformanceCenter() {
  const [servicePerformances, setServicePerformances] = useState<ServicePerformance[]>([]);
  const [performanceTargets, setPerformanceTargets] = useState<PerformanceTarget[]>([]);
  const [optimizations, setOptimizations] = useState<PerformanceOptimization[]>([]);
  const [performanceSummary, setPerformanceSummary] = useState<PerformanceSummary | null>(null);
  const [selectedService, setSelectedService] = useState<ServicePerformance | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'targets' | 'optimizations' | 'trends'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 Load performance data
  useEffect(() => {
    loadPerformanceData();
    const interval = setInterval(loadPerformanceData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  /**
   * 📊 Load Performance Data
   */
  const loadPerformanceData = async () => {
    try {
      // Simulate API call to get performance data
      const mockServicePerformances: ServicePerformance[] = [
        {
          serviceName: 'api-gateway',
          responseTime: {
            name: 'Response Time',
            value: 47,
            unit: 'ms',
            threshold: 100,
            status: 'GOOD',
            trend: 'DOWN',
            changeRate: -12.5,
            timestamp: new Date()
          },
          throughput: {
            name: 'Throughput',
            value: 1250,
            unit: 'req/s',
            threshold: 1000,
            status: 'GOOD',
            trend: 'UP',
            changeRate: 8.3,
            timestamp: new Date()
          },
          errorRate: {
            name: 'Error Rate',
            value: 0.2,
            unit: '%',
            threshold: 1.0,
            status: 'GOOD',
            trend: 'STABLE',
            changeRate: 0.1,
            timestamp: new Date()
          },
          cpuUsage: {
            name: 'CPU Usage',
            value: 35,
            unit: '%',
            threshold: 80,
            status: 'GOOD',
            trend: 'STABLE',
            changeRate: 2.1,
            timestamp: new Date()
          },
          memoryUsage: {
            name: 'Memory Usage',
            value: 512,
            unit: 'MB',
            threshold: 1024,
            status: 'GOOD',
            trend: 'UP',
            changeRate: 5.2,
            timestamp: new Date()
          },
          availability: {
            name: 'Availability',
            value: 99.95,
            unit: '%',
            threshold: 99.9,
            status: 'GOOD',
            trend: 'STABLE',
            changeRate: 0.02,
            timestamp: new Date()
          }
        },
        {
          serviceName: 'crm-service',
          responseTime: {
            name: 'Response Time',
            value: 125,
            unit: 'ms',
            threshold: 200,
            status: 'GOOD',
            trend: 'UP',
            changeRate: 15.2,
            timestamp: new Date()
          },
          throughput: {
            name: 'Throughput',
            value: 320,
            unit: 'req/s',
            threshold: 500,
            status: 'GOOD',
            trend: 'UP',
            changeRate: 12.8,
            timestamp: new Date()
          },
          errorRate: {
            name: 'Error Rate',
            value: 1.2,
            unit: '%',
            threshold: 2.0,
            status: 'WARNING',
            trend: 'UP',
            changeRate: 25.6,
            timestamp: new Date()
          },
          cpuUsage: {
            name: 'CPU Usage',
            value: 68,
            unit: '%',
            threshold: 80,
            status: 'WARNING',
            trend: 'UP',
            changeRate: 18.5,
            timestamp: new Date()
          },
          memoryUsage: {
            name: 'Memory Usage',
            value: 768,
            unit: 'MB',
            threshold: 1024,
            status: 'WARNING',
            trend: 'UP',
            changeRate: 22.1,
            timestamp: new Date()
          },
          availability: {
            name: 'Availability',
            value: 99.2,
            unit: '%',
            threshold: 99.5,
            status: 'WARNING',
            trend: 'DOWN',
            changeRate: -0.8,
            timestamp: new Date()
          }
        },
        {
          serviceName: 'notification-service',
          responseTime: {
            name: 'Response Time',
            value: 1250,
            unit: 'ms',
            threshold: 500,
            status: 'CRITICAL',
            trend: 'UP',
            changeRate: 85.2,
            timestamp: new Date()
          },
          throughput: {
            name: 'Throughput',
            value: 25,
            unit: 'req/s',
            threshold: 100,
            status: 'CRITICAL',
            trend: 'DOWN',
            changeRate: -65.8,
            timestamp: new Date()
          },
          errorRate: {
            name: 'Error Rate',
            value: 15.6,
            unit: '%',
            threshold: 2.0,
            status: 'CRITICAL',
            trend: 'UP',
            changeRate: 125.6,
            timestamp: new Date()
          },
          cpuUsage: {
            name: 'CPU Usage',
            value: 95,
            unit: '%',
            threshold: 80,
            status: 'CRITICAL',
            trend: 'UP',
            changeRate: 45.2,
            timestamp: new Date()
          },
          memoryUsage: {
            name: 'Memory Usage',
            value: 1536,
            unit: 'MB',
            threshold: 1024,
            status: 'CRITICAL',
            trend: 'UP',
            changeRate: 68.5,
            timestamp: new Date()
          },
          availability: {
            name: 'Availability',
            value: 85.2,
            unit: '%',
            threshold: 99.0,
            status: 'CRITICAL',
            trend: 'DOWN',
            changeRate: -15.8,
            timestamp: new Date()
          }
        }
      ];

      const mockPerformanceTargets: PerformanceTarget[] = [
        {
          metric: 'Response Time P95',
          target: 100,
          current: 125,
          achievement: 80,
          status: 'NEAR'
        },
        {
          metric: 'Throughput',
          target: 2000,
          current: 1595,
          achievement: 79.75,
          status: 'NEAR'
        },
        {
          metric: 'Error Rate',
          target: 0.5,
          current: 5.67,
          achievement: 8.8,
          status: 'MISSED'
        },
        {
          metric: 'Availability',
          target: 99.9,
          current: 94.79,
          achievement: 94.9,
          status: 'MISSED'
        },
        {
          metric: 'CPU Efficiency',
          target: 70,
          current: 66,
          achievement: 94.3,
          status: 'NEAR'
        }
      ];

      const mockOptimizations: PerformanceOptimization[] = [
        {
          id: 'opt-001',
          type: 'MEMORY',
          service: 'notification-service',
          recommendation: 'Implement connection pooling to reduce memory leaks',
          impact: 'HIGH',
          effort: 'MEDIUM',
          estimatedImprovement: 40,
          status: 'PENDING'
        },
        {
          id: 'opt-002',
          type: 'CPU',
          service: 'crm-service',
          recommendation: 'Optimize database queries to reduce CPU usage',
          impact: 'MEDIUM',
          effort: 'LOW',
          estimatedImprovement: 25,
          status: 'IN_PROGRESS'
        },
        {
          id: 'opt-003',
          type: 'CACHE',
          service: 'api-gateway',
          recommendation: 'Implement Redis caching for frequently accessed data',
          impact: 'HIGH',
          effort: 'HIGH',
          estimatedImprovement: 60,
          status: 'COMPLETED'
        },
        {
          id: 'opt-004',
          type: 'NETWORK',
          service: 'inventory-service',
          recommendation: 'Enable HTTP/2 and compression for better network performance',
          impact: 'MEDIUM',
          effort: 'LOW',
          estimatedImprovement: 30,
          status: 'PENDING'
        }
      ];

      const mockPerformanceSummary: PerformanceSummary = {
        overallScore: 78.5,
        responseTimeP95: 125,
        throughput: 1595,
        errorRate: 5.67,
        availability: 94.79,
        optimizationsActive: mockOptimizations.filter(o => o.status === 'IN_PROGRESS').length,
        slaCompliance: 92.3,
        timestamp: new Date()
      };

      setServicePerformances(mockServicePerformances);
      setPerformanceTargets(mockPerformanceTargets);
      setOptimizations(mockOptimizations);
      setPerformanceSummary(mockPerformanceSummary);
      setIsLoading(false);

    } catch (error) {
      setIsLoading(false);
    }
  };

  /**
   * 🎨 Get Status Icon
   */
  const getStatusIcon = (status: 'GOOD' | 'WARNING' | 'CRITICAL') => {
    switch (status) {
      case 'GOOD':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'CRITICAL':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  /**
   * 🎨 Get Status Color
   */
  const getStatusColor = (status: 'GOOD' | 'WARNING' | 'CRITICAL') => {
    switch (status) {
      case 'GOOD':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-[#F0EDE8] text-gray-800 border-gray-200';
    }
  };

  /**
   * 🎨 Get Trend Icon
   */
  const getTrendIcon = (trend: 'UP' | 'DOWN' | 'STABLE') => {
    switch (trend) {
      case 'UP':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'DOWN':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'STABLE':
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  /**
   * 🎨 Get Target Status Color
   */
  const getTargetStatusColor = (status: 'MET' | 'NEAR' | 'MISSED') => {
    switch (status) {
      case 'MET':
        return 'text-green-600';
      case 'NEAR':
        return 'text-yellow-600';
      case 'MISSED':
        return 'text-red-600';
    }
  };

  /**
   * 🎨 Get Optimization Status Color
   */
  const getOptimizationStatusColor = (status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    switch (status) {
      case 'PENDING':
        return 'bg-[#F0EDE8] text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
    }
  };

  /**
   * 📊 Format Metric Value
   */
  const formatMetricValue = (value: number, unit: string) => {
    switch (unit) {
      case 'ms':
        return `${value}ms`;
      case 'req/s':
        return `${value.toLocaleString()} req/s`;
      case '%':
        return `${value.toFixed(1)}%`;
      case 'MB':
        return `${value}MB`;
      default:
        return value.toLocaleString();
    }
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
          <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
          {performanceSummary && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Score: {performanceSummary.overallScore.toFixed(1)}/100</span>
              <span>•</span>
              <span>SLA: {performanceSummary.slaCompliance.toFixed(1)}%</span>
              <span>•</span>
              <span>{performanceSummary.optimizationsActive} optimizations active</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-[#F0EDE8] rounded-lg p-1">
            {[
              { id: 'overview', name: 'Overview', icon: Gauge },
              { id: 'targets', name: 'Targets', icon: Target },
              { id: 'optimizations', name: 'Optimizations', icon: Zap },
              { id: 'trends', name: 'Trends', icon: BarChart3 }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium ${
                  viewMode === mode.id
                    ? 'bg-white text-blue-600 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <mode.icon className="w-4 h-4" />
                {mode.name}
              </button>
            ))}
          </div>
          
          <button
            onClick={loadPerformanceData}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Performance Summary Cards */}
      {performanceSummary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Overall Score</span>
            </div>
            <div className={`text-2xl font-bold ${
              performanceSummary.overallScore >= 90 ? 'text-green-600' :
              performanceSummary.overallScore >= 70 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {performanceSummary.overallScore.toFixed(1)}
            </div>
            <div className="text-sm text-gray-500">/ 100</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Response Time</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {performanceSummary.responseTimeP95}ms
            </div>
            <div className="text-sm text-gray-500">P95</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Throughput</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {performanceSummary.throughput.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">req/s</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Error Rate</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {performanceSummary.errorRate.toFixed(2)}%
            </div>
            <div className="text-sm text-gray-500">Errors</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-medium text-gray-700">Availability</span>
            </div>
            <div className="text-2xl font-bold text-indigo-600">
              {performanceSummary.availability.toFixed(2)}%
            </div>
            <div className="text-sm text-gray-500">Uptime</div>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {servicePerformances.map((service) => (
            <div
              key={service.serviceName}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-[12px_12px_24px_#d1d5db,-12px_-12px_24px_#ffffff] transition-shadow cursor-pointer"
              onClick={() => setSelectedService(service)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.serviceName}</h3>
                    <p className="text-sm text-gray-600">Performance Metrics</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(service.responseTime.status)}
                  {getStatusIcon(service.cpuUsage.status)}
                  {getStatusIcon(service.availability.status)}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Response Time</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${
                      service.responseTime.status === 'GOOD' ? 'text-green-600' :
                      service.responseTime.status === 'WARNING' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {formatMetricValue(service.responseTime.value, service.responseTime.unit)}
                    </span>
                    {getTrendIcon(service.responseTime.trend)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-600">Throughput</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {formatMetricValue(service.throughput.value, service.throughput.unit)}
                    </span>
                    {getTrendIcon(service.throughput.trend)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-600">CPU Usage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${
                      service.cpuUsage.status === 'GOOD' ? 'text-green-600' :
                      service.cpuUsage.status === 'WARNING' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {formatMetricValue(service.cpuUsage.value, service.cpuUsage.unit)}
                    </span>
                    {getTrendIcon(service.cpuUsage.trend)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">Availability</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${
                      service.availability.status === 'GOOD' ? 'text-green-600' :
                      service.availability.status === 'WARNING' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {formatMetricValue(service.availability.value, service.availability.unit)}
                    </span>
                    {getTrendIcon(service.availability.trend)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Targets Tab */}
      {viewMode === 'targets' && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Performance Targets</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {performanceTargets.map((target, index) => (
              <div key={`${target}-${index}`} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium text-gray-900">{target.metric}</div>
                      <div className="text-sm text-gray-600">
                        Target: {target.target} | Current: {target.current}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${getTargetStatusColor(target.status)}`}>
                      {target.achievement.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">{target.status}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        target.status === 'MET' ? 'bg-green-500' :
                        target.status === 'NEAR' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, target.achievement)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optimizations Tab */}
      {viewMode === 'optimizations' && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Performance Optimizations</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {optimizations.map((optimization) => (
              <div key={optimization.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">{optimization.service}</div>
                      <div className="text-sm text-gray-600 mt-1">{optimization.recommendation}</div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Type: {optimization.type}</span>
                        <span>Impact: {optimization.impact}</span>
                        <span>Effort: {optimization.effort}</span>
                        <span>Improvement: +{optimization.estimatedImprovement}%</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getOptimizationStatusColor(optimization.status)}`}>
                    {optimization.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {viewMode === 'trends' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Trends</h3>
            <p className="text-gray-600 mb-4">
              Historical performance data and trend analysis
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {['Response Time', 'Throughput', 'Error Rate', 'Availability'].map((metric, index) => (
                <div key={metric} className="text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    index === 0 ? 'bg-blue-100 text-blue-600' :
                    index === 1 ? 'bg-green-100 text-green-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {index === 0 ? <Clock className="w-6 h-6" /> :
                     index === 1 ? <Zap className="w-6 h-6" /> :
                     index === 2 ? <AlertTriangle className="w-6 h-6" /> :
                     <CheckCircle className="w-6 h-6" />}
                  </div>
                  <div className="text-sm font-medium text-gray-900">{metric}</div>
                  <div className="text-xs text-gray-500">
                    {index === 0 ? '↓ 12.5%' :
                     index === 1 ? '↑ 8.3%' :
                     index === 2 ? '↑ 25.6%' :
                     '↓ 0.8%'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-[#F0EDE8] bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedService.serviceName}</h3>
                    <p className="text-gray-600">Detailed Performance Metrics</p>
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { metric: selectedService.responseTime, icon: Clock, color: 'blue' },
                  { metric: selectedService.throughput, icon: Zap, color: 'purple' },
                  { metric: selectedService.errorRate, icon: AlertTriangle, color: 'orange' },
                  { metric: selectedService.cpuUsage, icon: Cpu, color: 'red' },
                  { metric: selectedService.memoryUsage, icon: MemoryStick, color: 'green' },
                  { metric: selectedService.availability, icon: CheckCircle, color: 'indigo' }
                ].map(({ metric, icon: Icon, color }, index) => (
                  <div key={`${metric}-${index}`} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={`w-5 h-5 text-${color}-500`} />
                      <h4 className="font-medium text-gray-900">{metric.name}</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Current</span>
                        <span className={`font-semibold ${
                          metric.status === 'GOOD' ? 'text-green-600' :
                          metric.status === 'WARNING' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {formatMetricValue(metric.value, metric.unit)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Threshold</span>
                        <span className="text-sm text-gray-900">
                          {formatMetricValue(metric.threshold, metric.unit)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Trend</span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(metric.trend)}
                          <span className="text-sm text-gray-900">
                            {metric.changeRate > 0 ? '+' : ''}{metric.changeRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(metric.status)}`}>
                          {metric.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}