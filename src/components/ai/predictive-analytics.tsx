/**
 * Quantum AI Dashboard Evolution - Predictive Analytics Component
 * TIER 0 Military-Grade Predictive Analytics Dashboard
 * 
 * @version 2040.1.0
 * @classification TIER_0_SUPREMACY
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  DollarSign, 
  Server, 
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Target,
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  Gauge,
  Eye,
  Lightbulb,
  Cpu,
  Database
} from 'lucide-react';
import { QuantumPredictiveEngine } from '@/lib/ai/predictive-engine';
import type { 
  PredictiveAnalytics, 
  AIInsight,
  PerformancePrediction,
  SecurityPrediction,
  BusinessPrediction,
  InfrastructurePrediction,
  UserBehaviorPrediction
} from '@/lib/ai/types';

interface PredictiveAnalyticsProps {
  className?: string;
}

export default function PredictiveAnalyticsComponent({ className = '' }: PredictiveAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'security' | 'business' | 'infrastructure' | 'users'>('overview');
  const [predictions, setPredictions] = useState<PredictiveAnalytics | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [modelPerformance, setModelPerformance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadPredictiveData();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadPredictiveData, 120000); // Update every 2 minutes
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadPredictiveData = async () => {
    try {
      const engine = QuantumPredictiveEngine.getInstance();
      
      const [
        predictionsData,
        insightsData,
        performanceData
      ] = await Promise.all([
        engine.getLatestPredictions() || engine.forcePredictionUpdate(),
        engine.getAIInsights(),
        engine.getModelPerformance()
      ]);

      setPredictions(predictionsData);
      setInsights(insightsData);
      setModelPerformance(performanceData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading predictive data:', error);
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-50';
    if (confidence >= 0.8) return 'text-blue-600 bg-blue-50';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'CRITICAL': return 'text-red-600 bg-red-50';
      case 'HIGH': return 'text-orange-600 bg-orange-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'LOW': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'IMPROVING': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'DEGRADING': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Cargando análisis predictivo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                🔮 Quantum Predictive Analytics
              </h2>
              <p className="text-gray-600">TIER 0 Military-Grade AI Predictions & Insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                autoRefresh 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>
            <button
              onClick={loadPredictiveData}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Actualizar Predicciones
            </button>
          </div>
        </div>
      </div>

      {/* Model Performance Overview */}
      {modelPerformance && (
        <div className="border-b border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{modelPerformance.totalModels}</div>
              <div className="text-sm text-gray-600">Modelos Activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {(modelPerformance.averageAccuracy * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Precisión Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(modelPerformance.averageConfidence * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Confianza Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {modelPerformance.totalPredictions.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Predicciones Totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {predictions ? (predictions.confidence * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-600">Confianza Actual</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Vista General', icon: Eye },
            { id: 'performance', label: 'Rendimiento', icon: Gauge },
            { id: 'security', label: 'Seguridad', icon: Shield },
            { id: 'business', label: 'Negocio', icon: DollarSign },
            { id: 'infrastructure', label: 'Infraestructura', icon: Server },
            { id: 'users', label: 'Usuarios', icon: Users }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && predictions && (
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Insights de IA en Tiempo Real
              </h3>
              <div className="space-y-3">
                {insights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="bg-white p-4 rounded-lg border border-purple-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                            {insight.impact}
                          </span>
                          <span className="text-sm text-gray-600">{insight.category}</span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                        {insight.actionable && insight.actions && (
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium text-green-700">
                              {insight.actions.primary}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                          {(insight.confidence * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {insight.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Predictions Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Performance Quick View */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-blue-900">Rendimiento</h3>
                  <Gauge className="h-5 w-5 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Próxima hora:</span>
                    <span className="font-medium text-blue-900">
                      {predictions.predictions.performance.nextHour.latency.toFixed(1)}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Disponibilidad:</span>
                    <span className="font-medium text-blue-900">
                      {predictions.predictions.performance.nextHour.availability.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    {getTrendIcon(predictions.predictions.performance.nextWeek.performanceTrend)}
                    <span className="text-sm text-blue-700">
                      {predictions.predictions.performance.nextWeek.performanceTrend}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Quick View */}
              <div className="bg-red-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-red-900">Seguridad</h3>
                  <Shield className="h-5 w-5 text-red-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-red-700">Nivel de Amenaza:</span>
                    <span className={`font-medium px-2 py-1 rounded text-xs ${
                      predictions.predictions.security.threatLevel === 'HIGH' ? 'bg-red-200 text-red-800' :
                      predictions.predictions.security.threatLevel === 'MEDIUM' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {predictions.predictions.security.threatLevel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-red-700">Amenazas Predichas:</span>
                    <span className="font-medium text-red-900">
                      {predictions.predictions.security.predictedThreats.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-red-700">Score Vulnerabilidad:</span>
                    <span className="font-medium text-red-900">
                      {predictions.predictions.security.vulnerabilityScore.toFixed(0)}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Business Quick View */}
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-green-900">Negocio</h3>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Próximo Mes:</span>
                    <span className="font-medium text-green-900">
                      ${predictions.predictions.business.revenue.nextMonth.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Nuevos Usuarios:</span>
                    <span className="font-medium text-green-900">
                      {predictions.predictions.business.userGrowth.newUsers.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Sentimiento:</span>
                    <span className={`font-medium px-2 py-1 rounded text-xs ${
                      predictions.predictions.business.marketTrends.sentiment === 'POSITIVE' ? 'bg-green-200 text-green-800' :
                      predictions.predictions.business.marketTrends.sentiment === 'NEUTRAL' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {predictions.predictions.business.marketTrends.sentiment}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && predictions && (
          <PerformancePredictionView prediction={predictions.predictions.performance} />
        )}

        {activeTab === 'security' && predictions && (
          <SecurityPredictionView prediction={predictions.predictions.security} />
        )}

        {activeTab === 'business' && predictions && (
          <BusinessPredictionView prediction={predictions.predictions.business} />
        )}

        {activeTab === 'infrastructure' && predictions && (
          <InfrastructurePredictionView prediction={predictions.predictions.infrastructure} />
        )}

        {activeTab === 'users' && predictions && (
          <UserBehaviorPredictionView prediction={predictions.predictions.user} />
        )}
      </div>
    </div>
  );
}

// Performance Prediction View Component
function PerformancePredictionView({ prediction }: { prediction: PerformancePrediction }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Next Hour */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Próxima Hora
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-blue-700">Latencia:</span>
              <span className="font-bold text-blue-900">{prediction.nextHour.latency.toFixed(1)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Throughput:</span>
              <span className="font-bold text-blue-900">{(prediction.nextHour.throughput / 1000).toFixed(1)}K req/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Error Rate:</span>
              <span className="font-bold text-blue-900">{(prediction.nextHour.errorRate * 100).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Disponibilidad:</span>
              <span className="font-bold text-blue-900">{prediction.nextHour.availability.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Next 24 Hours */}
        <div className="bg-indigo-50 p-6 rounded-lg">
          <h3 className="font-semibold text-indigo-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Próximas 24 Horas
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-indigo-700">Carga Pico:</span>
              <span className="font-bold text-indigo-900">{(prediction.next24Hours.peakLoad / 1000).toFixed(1)}K req/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-indigo-700">Latencia Promedio:</span>
              <span className="font-bold text-indigo-900">{prediction.next24Hours.averageLatency.toFixed(1)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-indigo-700">Downtime Esperado:</span>
              <span className="font-bold text-indigo-900">{prediction.next24Hours.expectedDowntime.toFixed(1)}min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-indigo-700">Utilización:</span>
              <span className="font-bold text-indigo-900">{(prediction.next24Hours.resourceUtilization * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Next Week */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Próxima Semana
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-purple-700">Crecimiento Tráfico:</span>
              <span className="font-bold text-purple-900">{prediction.nextWeek.trafficGrowth.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-700">Tendencia:</span>
              <span className={`font-bold px-2 py-1 rounded text-xs ${
                prediction.nextWeek.performanceTrend === 'IMPROVING' ? 'bg-green-200 text-green-800' :
                prediction.nextWeek.performanceTrend === 'STABLE' ? 'bg-blue-200 text-blue-800' :
                'bg-red-200 text-red-800'
              }`}>
                {prediction.nextWeek.performanceTrend}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-700">Ventanas Mantenimiento:</span>
              <span className="font-bold text-purple-900">{prediction.nextWeek.maintenanceWindows.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-700">Capacidad Requerida:</span>
              <span className="font-bold text-purple-900">{(prediction.nextWeek.capacityRequirements * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Security Prediction View Component
function SecurityPredictionView({ prediction }: { prediction: SecurityPrediction }) {
  return (
    <div className="space-y-6">
      {/* Threat Level Overview */}
      <div className="bg-red-50 p-6 rounded-lg">
        <h3 className="font-semibold text-red-900 mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Estado de Seguridad Actual
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${
              prediction.threatLevel === 'CRITICAL' ? 'text-red-600' :
              prediction.threatLevel === 'HIGH' ? 'text-orange-600' :
              prediction.threatLevel === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {prediction.threatLevel}
            </div>
            <div className="text-sm text-red-700">Nivel de Amenaza</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">{prediction.vulnerabilityScore.toFixed(0)}</div>
            <div className="text-sm text-red-700">Score Vulnerabilidad</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">{prediction.complianceRisk.toFixed(0)}</div>
            <div className="text-sm text-red-700">Riesgo Compliance</div>
          </div>
        </div>
      </div>

      {/* Predicted Threats */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
          Amenazas Predichas
        </h3>
        <div className="space-y-4">
          {prediction.predictedThreats.map((threat, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{threat.type}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    threat.estimatedImpact === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                    threat.estimatedImpact === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    threat.estimatedImpact === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {threat.estimatedImpact}
                  </span>
                  <span className="text-sm text-gray-600">{(threat.probability * 100).toFixed(0)}% probabilidad</span>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                <strong>Timeframe:</strong> {threat.timeframe}
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Sugerencias de Mitigación:</div>
                <div className="flex flex-wrap gap-2">
                  {threat.mitigationSuggestions.map((suggestion, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {suggestion}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Acciones Recomendadas
        </h3>
        <div className="space-y-2">
          {prediction.recommendedActions.map((action, index) => (
            <div key={index} className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-blue-800">{action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Business Prediction View Component
function BusinessPredictionView({ prediction }: { prediction: BusinessPrediction }) {
  return (
    <div className="space-y-6">
      {/* Revenue Predictions */}
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Predicciones de Revenue
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              ${prediction.revenue.nextMonth.toLocaleString()}
            </div>
            <div className="text-sm text-green-700">Próximo Mes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              ${prediction.revenue.nextQuarter.toLocaleString()}
            </div>
            <div className="text-sm text-green-700">Próximo Trimestre</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              ${prediction.revenue.yearEnd.toLocaleString()}
            </div>
            <div className="text-sm text-green-700">Fin de Año</div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <span className="text-sm text-green-700">
            Confianza: {(prediction.revenue.confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* User Growth */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Crecimiento de Usuarios
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600 mb-2">
              {prediction.userGrowth.newUsers.toLocaleString()}
            </div>
            <div className="text-sm text-blue-700">Nuevos Usuarios</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600 mb-2">
              {(prediction.userGrowth.churnRate * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-blue-700">Tasa de Churn</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600 mb-2">
              {(prediction.userGrowth.retentionRate * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-blue-700">Retención</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600 mb-2">
              ${prediction.userGrowth.lifetimeValue.toFixed(0)}
            </div>
            <div className="text-sm text-blue-700">LTV</div>
          </div>
        </div>
      </div>

      {/* Market Trends */}
      <div className="bg-purple-50 p-6 rounded-lg">
        <h3 className="font-semibold text-purple-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Tendencias de Mercado
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-purple-800">Sentimiento del Mercado:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                prediction.marketTrends.sentiment === 'POSITIVE' ? 'bg-green-200 text-green-800' :
                prediction.marketTrends.sentiment === 'NEUTRAL' ? 'bg-yellow-200 text-yellow-800' :
                'bg-red-200 text-red-800'
              }`}>
                {prediction.marketTrends.sentiment}
              </span>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-purple-800 mb-2">Análisis de Competencia:</h4>
            <div className="space-y-1">
              {prediction.marketTrends.competitorAnalysis.map((analysis, index) => (
                <div key={index} className="text-sm text-purple-700">• {analysis}</div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-purple-800 mb-2">Oportunidades:</h4>
              <div className="space-y-1">
                {prediction.marketTrends.opportunities.map((opportunity, index) => (
                  <div key={index} className="text-sm text-green-700">• {opportunity}</div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-purple-800 mb-2">Riesgos:</h4>
              <div className="space-y-1">
                {prediction.marketTrends.risks.map((risk, index) => (
                  <div key={index} className="text-sm text-red-700">• {risk}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Infrastructure Prediction View Component
function InfrastructurePredictionView({ prediction }: { prediction: InfrastructurePrediction }) {
  return (
    <div className="space-y-6">
      {/* Scaling Recommendations */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
          <Server className="h-5 w-5 mr-2" />
          Recomendaciones de Escalamiento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              ${prediction.scaling.costImpact.toLocaleString()}
            </div>
            <div className="text-sm text-blue-700">Impacto en Costos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              +{prediction.scaling.performanceImpact}%
            </div>
            <div className="text-sm text-blue-700">Mejora Performance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {prediction.scaling.timeline}
            </div>
            <div className="text-sm text-blue-700">Timeline</div>
          </div>
        </div>
        
        <div className="space-y-3">
          {prediction.scaling.recommendedActions.map((action, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{action.component}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  action.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                  action.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                  action.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {action.priority}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">{action.reason}</div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  <strong>{action.type}</strong> - Impacto: +{action.impact}%
                </span>
                <span className="text-gray-700">
                  ${action.cost} - {action.timeline}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance Predictions */}
      <div className="bg-orange-50 p-6 rounded-lg">
        <h3 className="font-semibold text-orange-900 mb-4 flex items-center">
          <Cpu className="h-5 w-5 mr-2" />
          Mantenimiento Predictivo
        </h3>
        <div className="space-y-4">
          {prediction.maintenance.predictedFailures.map((failure, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{failure.component}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  failure.impact === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                  failure.impact === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                  failure.impact === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {failure.impact}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Probabilidad de Fallo:</span>
                  <div className="font-medium text-orange-800">
                    {(failure.failureProbability * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Fecha Estimada:</span>
                  <div className="font-medium text-orange-800">
                    {failure.estimatedFailureDate.toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Costo:</span>
                  <div className="font-medium text-orange-800">
                    ${failure.cost.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-700">
                <strong>Acción Recomendada:</strong> {failure.recommendedAction}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-green-100 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-green-800 mb-1">
              ${prediction.maintenance.costOptimization.toLocaleString()}/mes
            </div>
            <div className="text-sm text-green-700">Ahorros por Mantenimiento Predictivo</div>
          </div>
        </div>
      </div>

      {/* Capacity Analysis */}
      <div className="bg-purple-50 p-6 rounded-lg">
        <h3 className="font-semibold text-purple-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Análisis de Capacidad
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-purple-800 mb-3">Utilización Actual vs Predicha</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-purple-700">Actual</span>
                  <span className="text-sm font-medium text-purple-900">
                    {(prediction.capacity.currentUtilization * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${prediction.capacity.currentUtilization * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-purple-700">Predicha</span>
                  <span className="text-sm font-medium text-purple-900">
                    {(prediction.capacity.predictedUtilization * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div 
                    className="bg-purple-800 h-2 rounded-full" 
                    style={{ width: `${prediction.capacity.predictedUtilization * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-purple-800 mb-3">Cuellos de Botella Identificados</h4>
            <div className="space-y-2">
              {prediction.capacity.bottlenecks.map((bottleneck, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-purple-700">{bottleneck}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <div className={`p-3 rounded-lg ${
                prediction.capacity.expansionNeeded 
                  ? 'bg-red-100 border border-red-200' 
                  : 'bg-green-100 border border-green-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {prediction.capacity.expansionNeeded ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  <span className={`font-medium ${
                    prediction.capacity.expansionNeeded ? 'text-red-800' : 'text-green-800'
                  }`}>
                    {prediction.capacity.expansionNeeded 
                      ? 'Expansión de Capacidad Requerida' 
                      : 'Capacidad Actual Suficiente'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// User Behavior Prediction View Component
function UserBehaviorPredictionView({ prediction }: { prediction: UserBehaviorPrediction }) {
  return (
    <div className="space-y-6">
      {/* Engagement Metrics */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Métricas de Engagement
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {prediction.engagement.activeUsers.toLocaleString()}
            </div>
            <div className="text-sm text-blue-700">Usuarios Activos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {prediction.engagement.sessionDuration.toFixed(1)}min
            </div>
            <div className="text-sm text-blue-700">Duración Sesión</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {Object.keys(prediction.engagement.featureUsage).length}
            </div>
            <div className="text-sm text-blue-700">Features Activas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {prediction.engagement.dropoffPoints.length}
            </div>
            <div className="text-sm text-blue-700">Puntos de Abandono</div>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="font-medium text-blue-800 mb-3">Uso de Features</h4>
          <div className="space-y-2">
            {Object.entries(prediction.engagement.featureUsage).map(([feature, usage]) => (
              <div key={feature} className="flex items-center justify-between">
                <span className="text-sm text-blue-700">{feature}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${usage * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-blue-900">
                    {(usage * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Preferences */}
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Preferencias de Usuario
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-800 mb-3">Features Populares</h4>
            <div className="space-y-2">
              {prediction.preferences.popularFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-green-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-green-800 mb-3">Patrones de Uso</h4>
            <div className="space-y-2">
              {prediction.preferences.usagePatterns.map((pattern, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">{pattern}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-800 mb-3">Preferencias de Dispositivo</h4>
            <div className="space-y-2">
              {prediction.preferences.devicePreferences.map((device, index) => (
                <div key={index} className="text-sm text-green-700">{device}</div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-green-800 mb-3">Patrones Temporales</h4>
            <div className="space-y-2">
              {prediction.preferences.timePatterns.map((pattern, index) => (
                <div key={index} className="text-sm text-green-700">{pattern}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Churn Analysis */}
      <div className="bg-red-50 p-6 rounded-lg">
        <h3 className="font-semibold text-red-900 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Análisis de Churn
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {prediction.churn.riskScore.toFixed(0)}
            </div>
            <div className="text-sm text-red-700">Risk Score (0-100)</div>
            <div className="mt-2">
              <div className="w-full bg-red-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{ width: `${prediction.churn.riskScore}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-red-800 mb-3">Factores de Riesgo</h4>
            <div className="space-y-2">
              {prediction.churn.riskFactors.map((factor, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">{factor}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-red-800 mb-3">Estrategias de Retención</h4>
            <div className="space-y-2">
              {prediction.churn.retentionStrategies.map((strategy, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-red-700">{strategy}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {prediction.churn.predictedChurnDate && (
          <div className="mt-4 p-4 bg-red-100 rounded-lg border border-red-200">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">
                Fecha Predicha de Churn: {prediction.churn.predictedChurnDate.toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}