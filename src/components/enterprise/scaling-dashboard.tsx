/**
 * 🔄 SILEXAR PULSE QUANTUM - SCALING DASHBOARD TIER 0
 * 
 * Dashboard de auto-scaling enterprise con HPA/VPA y ML predictions
 * Monitoreo inteligente de escalamiento automático
 * 
 * @version 2040.1.0
 * @author Silexar Pulse Quantum Team
 * @classification TIER 0 - ENTERPRISE SCALING DASHBOARD
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Zap,
  Target,
  Activity,
  Clock,
  Cpu,
  MemoryStick,
  Server,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Brain,
  Gauge
} from 'lucide-react';

// 🔄 HPA Status
interface HPAStatus {
  name: string;
  namespace: string;
  currentReplicas: number;
  desiredReplicas: number;
  minReplicas: number;
  maxReplicas: number;
  targetCPU: number;
  currentCPU: number;
  targetMemory: number;
  currentMemory: number;
  status: 'SCALING_UP' | 'SCALING_DOWN' | 'STABLE' | 'ERROR';
  lastScaleTime: Date;
  scalingEvents: ScalingEvent[];
}

// 📊 Scaling Event
interface ScalingEvent {
  timestamp: Date;
  type: 'SCALE_UP' | 'SCALE_DOWN' | 'NO_SCALE';
  fromReplicas: number;
  toReplicas: number;
  reason: string;
  trigger: 'CPU' | 'MEMORY' | 'CUSTOM' | 'ML_PREDICTION';
}

// 🤖 ML Prediction
interface MLPrediction {
  service: string;
  predictedLoad: number;
  confidence: number;
  timeHorizon: number;
  recommendedReplicas: number;
  factors: {
    historical: number;
    seasonal: number;
    trend: number;
    external: number;
  };
}

// 📈 Scaling Metrics
interface ScalingMetrics {
  totalHPAs: number;
  activeScaling: number;
  totalReplicas: number;
  averageUtilization: number;
  scalingEfficiency: number;
  costOptimization: number;
  predictiveAccuracy: number;
  timestamp: Date;
}

/**
 * 🔄 Scaling Dashboard Component
 */
export default function ScalingDashboard() {
  const [hpaStatuses, setHpaStatuses] = useState<HPAStatus[]>([]);
  const [mlPredictions, setMlPredictions] = useState<MLPrediction[]>([]);
  const [scalingMetrics, setScalingMetrics] = useState<ScalingMetrics | null>(null);
  const [selectedHPA, setSelectedHPA] = useState<HPAStatus | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'predictions' | 'events'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 Load scaling data
  useEffect(() => {
    loadScalingData();
    const interval = setInterval(loadScalingData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  /**
   * 📊 Load Scaling Data
   */
  const loadScalingData = async () => {
    try {
      // Simulate API call to get scaling data
      const mockHPAStatuses: HPAStatus[] = [
        {
          name: 'api-gateway-hpa',
          namespace: 'default',
          currentReplicas: 8,
          desiredReplicas: 10,
          minReplicas: 3,
          maxReplicas: 20,
          targetCPU: 70,
          currentCPU: 82,
          targetMemory: 80,
          currentMemory: 65,
          status: 'SCALING_UP',
          lastScaleTime: new Date(Date.now() - 120000), // 2 minutes ago
          scalingEvents: [
            {
              timestamp: new Date(Date.now() - 120000),
              type: 'SCALE_UP',
              fromReplicas: 6,
              toReplicas: 8,
              reason: 'CPU utilization above target: 82% > 70%',
              trigger: 'CPU'
            },
            {
              timestamp: new Date(Date.now() - 600000),
              type: 'SCALE_UP',
              fromReplicas: 5,
              toReplicas: 6,
              reason: 'ML prediction indicates high load incoming',
              trigger: 'ML_PREDICTION'
            }
          ]
        },
        {
          name: 'crm-service-hpa',
          namespace: 'default',
          currentReplicas: 4,
          desiredReplicas: 4,
          minReplicas: 2,
          maxReplicas: 15,
          targetCPU: 75,
          currentCPU: 68,
          targetMemory: 85,
          currentMemory: 72,
          status: 'STABLE',
          lastScaleTime: new Date(Date.now() - 1800000), // 30 minutes ago
          scalingEvents: [
            {
              timestamp: new Date(Date.now() - 1800000),
              type: 'SCALE_DOWN',
              fromReplicas: 5,
              toReplicas: 4,
              reason: 'CPU utilization below target: 68% < 75%',
              trigger: 'CPU'
            }
          ]
        },
        {
          name: 'inventory-service-hpa',
          namespace: 'default',
          currentReplicas: 6,
          desiredReplicas: 4,
          minReplicas: 2,
          maxReplicas: 12,
          targetCPU: 70,
          currentCPU: 45,
          targetMemory: 80,
          currentMemory: 58,
          status: 'SCALING_DOWN',
          lastScaleTime: new Date(Date.now() - 300000), // 5 minutes ago
          scalingEvents: [
            {
              timestamp: new Date(Date.now() - 300000),
              type: 'SCALE_DOWN',
              fromReplicas: 6,
              toReplicas: 5,
              reason: 'Low utilization detected: CPU 45%, Memory 58%',
              trigger: 'CPU'
            }
          ]
        },
        {
          name: 'auth-service-hpa',
          namespace: 'default',
          currentReplicas: 3,
          desiredReplicas: 3,
          minReplicas: 2,
          maxReplicas: 10,
          targetCPU: 80,
          currentCPU: 78,
          targetMemory: 75,
          currentMemory: 71,
          status: 'STABLE',
          lastScaleTime: new Date(Date.now() - 3600000), // 1 hour ago
          scalingEvents: []
        }
      ];

      const mockMLPredictions: MLPrediction[] = [
        {
          service: 'api-gateway',
          predictedLoad: 95,
          confidence: 0.87,
          timeHorizon: 300, // 5 minutes
          recommendedReplicas: 12,
          factors: {
            historical: 0.4,
            seasonal: 0.2,
            trend: 0.3,
            external: 0.1
          }
        },
        {
          service: 'crm-service',
          predictedLoad: 72,
          confidence: 0.92,
          timeHorizon: 600, // 10 minutes
          recommendedReplicas: 4,
          factors: {
            historical: 0.5,
            seasonal: 0.15,
            trend: 0.25,
            external: 0.1
          }
        },
        {
          service: 'inventory-service',
          predictedLoad: 38,
          confidence: 0.78,
          timeHorizon: 900, // 15 minutes
          recommendedReplicas: 3,
          factors: {
            historical: 0.6,
            seasonal: 0.1,
            trend: 0.2,
            external: 0.1
          }
        }
      ];

      const mockScalingMetrics: ScalingMetrics = {
        totalHPAs: mockHPAStatuses.length,
        activeScaling: mockHPAStatuses.filter(h => h.status !== 'STABLE').length,
        totalReplicas: mockHPAStatuses.reduce((sum, h) => sum + h.currentReplicas, 0),
        averageUtilization: 68.5,
        scalingEfficiency: 94.2,
        costOptimization: 87.8,
        predictiveAccuracy: 89.3,
        timestamp: new Date()
      };

      setHpaStatuses(mockHPAStatuses);
      setMlPredictions(mockMLPredictions);
      setScalingMetrics(mockScalingMetrics);
      setIsLoading(false);

    } catch (error) {
      console.error('Failed to load scaling data:', error);
      setIsLoading(false);
    }
  };

  /**
   * 🎨 Get Status Icon
   */
  const getStatusIcon = (status: HPAStatus['status']) => {
    switch (status) {
      case 'SCALING_UP':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'SCALING_DOWN':
        return <TrendingDown className="w-5 h-5 text-blue-500" />;
      case 'STABLE':
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
      case 'ERROR':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  /**
   * 🎨 Get Status Color
   */
  const getStatusColor = (status: HPAStatus['status']) => {
    switch (status) {
      case 'SCALING_UP':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SCALING_DOWN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'STABLE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'ERROR':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  /**
   * 🎨 Get Utilization Color
   */
  const getUtilizationColor = (current: number, target: number) => {
    const ratio = current / target;
    if (ratio > 1.2) return 'text-red-600';
    if (ratio > 1.0) return 'text-orange-600';
    if (ratio > 0.8) return 'text-green-600';
    return 'text-blue-600';
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
          <h2 className="text-lg font-semibold text-gray-900">Auto-Scaling Overview</h2>
          {scalingMetrics && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{scalingMetrics.totalHPAs} HPAs</span>
              <span>•</span>
              <span>{scalingMetrics.activeScaling} scaling</span>
              <span>•</span>
              <span>{scalingMetrics.totalReplicas} replicas</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'predictions', name: 'ML Predictions', icon: Brain },
              { id: 'events', name: 'Events', icon: Clock }
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
            onClick={loadScalingData}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Scaling Metrics Cards */}
      {scalingMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Avg Utilization</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {scalingMetrics.averageUtilization.toFixed(1)}%
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Efficiency</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {scalingMetrics.scalingEfficiency.toFixed(1)}%
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Cost Optimization</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {scalingMetrics.costOptimization.toFixed(1)}%
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">ML Accuracy</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {scalingMetrics.predictiveAccuracy.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hpaStatuses.map((hpa) => (
            <div
              key={`${hpa.namespace}/${hpa.name}`}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedHPA(hpa)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Server className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{hpa.name}</h3>
                    <p className="text-sm text-gray-600">{hpa.namespace}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(hpa.status)}
                  <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(hpa.status)}`}>
                    {hpa.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Replicas</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {hpa.currentReplicas} / {hpa.desiredReplicas}
                  </div>
                  <div className="text-xs text-gray-500">
                    Min: {hpa.minReplicas}, Max: {hpa.maxReplicas}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Last Scale</div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatTimeAgo(hpa.lastScaleTime)}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">CPU</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-medium ${getUtilizationColor(hpa.currentCPU, hpa.targetCPU)}`}>
                      {hpa.currentCPU}%
                    </span>
                    <span className="text-gray-500 text-sm"> / {hpa.targetCPU}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MemoryStick className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">Memory</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-medium ${getUtilizationColor(hpa.currentMemory, hpa.targetMemory)}`}>
                      {hpa.currentMemory}%
                    </span>
                    <span className="text-gray-500 text-sm"> / {hpa.targetMemory}%</span>
                  </div>
                </div>
              </div>

              {hpa.scalingEvents.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Recent Event</div>
                  <div className="text-sm text-gray-900">
                    {hpa.scalingEvents[0].reason}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ML Predictions Tab */}
      {viewMode === 'predictions' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Machine Learning Predictions</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {mlPredictions.map((prediction) => (
                <div key={prediction.service} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-purple-500" />
                    <h4 className="font-medium text-gray-900">{prediction.service}</h4>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Predicted Load</span>
                      <span className="font-semibold text-gray-900">{prediction.predictedLoad}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Confidence</span>
                      <span className="font-semibold text-green-600">
                        {(prediction.confidence * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Recommended Replicas</span>
                      <span className="font-semibold text-blue-600">{prediction.recommendedReplicas}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Time Horizon</span>
                      <span className="text-sm text-gray-900">{Math.floor(prediction.timeHorizon / 60)}m</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Prediction Factors</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Historical</span>
                        <span>{(prediction.factors.historical * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Trend</span>
                        <span>{(prediction.factors.trend * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Seasonal</span>
                        <span>{(prediction.factors.seasonal * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {viewMode === 'events' && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Scaling Events</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {hpaStatuses.flatMap(hpa => 
              hpa.scalingEvents.map(event => ({
                ...event,
                hpaName: hpa.name,
                namespace: hpa.namespace
              }))
            ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10).map((event, index) => (
              <div key={index} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      event.type === 'SCALE_UP' ? 'bg-green-500' :
                      event.type === 'SCALE_DOWN' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}></div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {event.hpaName} - {event.type.replace('_', ' ')}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{event.reason}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        {event.timestamp.toLocaleString()} • Trigger: {event.trigger}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {event.fromReplicas} → {event.toReplicas}
                    </div>
                    <div className="text-xs text-gray-500">replicas</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HPA Detail Modal */}
      {selectedHPA && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Server className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedHPA.name}</h3>
                    <p className="text-gray-600">Namespace: {selectedHPA.namespace}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedHPA(null)}
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
                    {getStatusIcon(selectedHPA.status)}
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(selectedHPA.status)}`}>
                      {selectedHPA.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Scale Time</label>
                  <div className="text-sm text-gray-900 mt-1">{formatTimeAgo(selectedHPA.lastScaleTime)}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Current Replicas</label>
                  <div className="text-lg font-semibold text-gray-900 mt-1">{selectedHPA.currentReplicas}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Desired Replicas</label>
                  <div className="text-lg font-semibold text-blue-600 mt-1">{selectedHPA.desiredReplicas}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Range</label>
                  <div className="text-sm text-gray-900 mt-1">
                    {selectedHPA.minReplicas} - {selectedHPA.maxReplicas}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">CPU Utilization</label>
                  <div className="mt-1">
                    <div className={`text-lg font-semibold ${getUtilizationColor(selectedHPA.currentCPU, selectedHPA.targetCPU)}`}>
                      {selectedHPA.currentCPU}% / {selectedHPA.targetCPU}%
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Memory Utilization</label>
                  <div className="mt-1">
                    <div className={`text-lg font-semibold ${getUtilizationColor(selectedHPA.currentMemory, selectedHPA.targetMemory)}`}>
                      {selectedHPA.currentMemory}% / {selectedHPA.targetMemory}%
                    </div>
                  </div>
                </div>
              </div>

              {selectedHPA.scalingEvents.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Recent Events</label>
                  <div className="mt-2 space-y-2">
                    {selectedHPA.scalingEvents.slice(0, 5).map((event, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {event.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(event.timestamp)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">{event.reason}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {event.fromReplicas} → {event.toReplicas} replicas
                        </div>
                      </div>
                    ))}
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