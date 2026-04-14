/**
 * Quantum AI Dashboard Evolution - Anomaly Detection Component
 * TIER 0 Military-Grade Anomaly Detection Interface
 * 
 * @version 2040.1.0
 * @classification TIER_0_SUPREMACY
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Target,
  Brain,
  Search,
  Filter,
  RefreshCw,
  Bell,
  BellOff,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  Gauge,
  Users,
  Server,
  DollarSign,
  Lightbulb
} from 'lucide-react';
import { getAnomalyData } from '@/app/actions/anomaly-actions';
import type { 
  AnomalyDetection,
  DetectedAnomaly, 
  PatternAnalysis, 
  AnomalyAlert, 
  AnomalyRecommendation,
  SystemHealthScore
} from '@/lib/ai/types';

interface AnomalyDetectorProps {
  className?: string;
}

export default function AnomalyDetectorComponent({ className = '' }: AnomalyDetectorProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'anomalies' | 'patterns' | 'alerts' | 'recommendations'>('overview');
  const [detection, setDetection] = useState<AnomalyDetection | null>(null);
  const [anomalies, setAnomalies] = useState<DetectedAnomaly[]>([]);
  const [patterns, setPatterns] = useState<PatternAnalysis[]>([]);
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [recommendations, setRecommendations] = useState<AnomalyRecommendation[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealthScore | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    loadAnomalyData();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadAnomalyData, 30000); // Update every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadAnomalyData = async () => {
    try {
      const {
        latestDetection,
        allAnomalies,
        patternAnalysis,
        allAlerts,
        allRecommendations,
        healthScore,
        stats
      } = await getAnomalyData();

      setDetection(latestDetection);
      setAnomalies(allAnomalies);
      setPatterns(patternAnalysis);
      setAlerts(allAlerts);
      setRecommendations(allRecommendations);
      setSystemHealth(healthScore);
      setStatistics(stats);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: DetectedAnomaly['type']) => {
    switch (type) {
      case 'PERFORMANCE': return <Gauge className="h-4 w-4" />;
      case 'SECURITY': return <Shield className="h-4 w-4" />;
      case 'BUSINESS': return <DollarSign className="h-4 w-4" />;
      case 'USER_BEHAVIOR': return <Users className="h-4 w-4" />;
      case 'INFRASTRUCTURE': return <Server className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getPatternIcon = (patternType: PatternAnalysis['patternType']) => {
    switch (patternType) {
      case 'SEASONAL': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'TRENDING': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'CYCLICAL': return <RefreshCw className="h-4 w-4 text-purple-500" />;
      case 'IRREGULAR': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const filteredAnomalies = anomalies.filter(anomaly => {
    const severityMatch = filterSeverity === 'ALL' || anomaly.severity === filterSeverity;
    const typeMatch = filterType === 'ALL' || anomaly.type === filterType;
    return severityMatch && typeMatch;
  });

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <span className="ml-3 text-gray-600">Cargando detector de anomalías...</span>
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
            <div className="p-2 bg-red-100 rounded-lg">
              <Search className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                🔍 Quantum Anomaly Detection
              </h2>
              <p className="text-gray-600">TIER 0 Military-Grade Anomaly Detection & Pattern Analysis</p>
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
              onClick={loadAnomalyData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Detectar Anomalías
            </button>
          </div>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <div className="border-b border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getHealthScoreColor(systemHealth.overall)}`}>
                {systemHealth.overall.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Health Score</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthScoreColor(systemHealth.categories.performance)}`}>
                {systemHealth.categories.performance.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Performance</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthScoreColor(systemHealth.categories.security)}`}>
                {systemHealth.categories.security.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Security</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthScoreColor(systemHealth.categories.reliability)}`}>
                {systemHealth.categories.reliability.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Reliability</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthScoreColor(systemHealth.categories.scalability)}`}>
                {systemHealth.categories.scalability.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Scalability</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                {systemHealth.trends.direction === 'IMPROVING' ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : systemHealth.trends.direction === 'DEGRADING' ? (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                ) : (
                  <Activity className="h-5 w-5 text-blue-500" />
                )}
                <span className={`text-sm font-medium ${
                  systemHealth.trends.direction === 'IMPROVING' ? 'text-green-600' :
                  systemHealth.trends.direction === 'DEGRADING' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  {systemHealth.trends.direction}
                </span>
              </div>
              <div className="text-sm text-gray-600">Trend</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Vista General', icon: Eye },
            { id: 'anomalies', label: 'Anomalías', icon: AlertTriangle },
            { id: 'patterns', label: 'Patrones', icon: BarChart3 },
            { id: 'alerts', label: 'Alertas', icon: Bell },
            { id: 'recommendations', label: 'Recomendaciones', icon: Lightbulb }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as unknown)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {id === 'alerts' && alerts.filter(a => a.status === 'ACTIVE').length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {alerts.filter(a => a.status === 'ACTIVE').length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && statistics && (
          <div className="space-y-6">
            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-medium">Total Anomalías</p>
                    <p className="text-2xl font-bold text-red-900">{statistics.total}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <Clock className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-red-600">{statistics.last24Hours} en 24h</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Alertas Activas</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {alerts.filter(a => a.status === 'ACTIVE').length}
                    </p>
                  </div>
                  <Bell className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <Shield className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-blue-600">Monitoreo Activo</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Confianza IA</p>
                    <p className="text-2xl font-bold text-green-900">
                      {(statistics.averageConfidence * 100).toFixed(1)}%
                    </p>
                  </div>
                  <Brain className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <Target className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">Alta Precisión</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Patrones</p>
                    <p className="text-2xl font-bold text-purple-900">{patterns.length}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <Eye className="h-4 w-4 text-purple-500 mr-1" />
                  <span className="text-purple-600">Análisis Activo</span>
                </div>
              </div>
            </div>

            {/* Anomalies by Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Anomalías por Tipo</h3>
                <div className="space-y-3">
                  {Object.entries(statistics.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(type as DetectedAnomaly['type'])}
                        <span className="text-sm text-gray-700">{type}</span>
                      </div>
                      <span className="font-medium text-gray-900">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Anomalías por Severidad</h3>
                <div className="space-y-3">
                  {Object.entries(statistics.bySeverity).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          severity === 'CRITICAL' ? 'bg-red-500' :
                          severity === 'HIGH' ? 'bg-orange-500' :
                          severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}></div>
                        <span className="text-sm text-gray-700">{severity}</span>
                      </div>
                      <span className="font-medium text-gray-900">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Anomalies */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Anomalías Recientes</h3>
              <div className="space-y-3">
                {anomalies.slice(-5).map((anomaly) => (
                  <div key={anomaly.id} className={`p-4 rounded-lg border ${getSeverityColor(anomaly.severity)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getTypeIcon(anomaly.type)}
                        <div>
                          <h4 className="font-medium text-gray-900">{anomaly.description}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Componentes afectados: {anomaly.affectedComponents.join(', ')}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Confianza: {(anomaly.confidence * 100).toFixed(0)}%</span>
                            <span>Detectado: {anomaly.detectionTime.toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                        {anomaly.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'anomalies' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="ALL">Todas las severidades</option>
                  <option value="CRITICAL">Crítica</option>
                  <option value="HIGH">Alta</option>
                  <option value="MEDIUM">Media</option>
                  <option value="LOW">Baja</option>
                </select>
              </div>
              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="ALL">Todos los tipos</option>
                  <option value="PERFORMANCE">Rendimiento</option>
                  <option value="SECURITY">Seguridad</option>
                  <option value="BUSINESS">Negocio</option>
                  <option value="USER_BEHAVIOR">Comportamiento</option>
                  <option value="INFRASTRUCTURE">Infraestructura</option>
                </select>
              </div>
            </div>

            {/* Anomalies List */}
            <div className="space-y-4">
              {filteredAnomalies.map((anomaly) => (
                <div key={anomaly.id} className={`p-6 rounded-lg border ${getSeverityColor(anomaly.severity)}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      {getTypeIcon(anomaly.type)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{anomaly.description}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Tipo: {anomaly.type} | Detectado: {anomaly.detectionTime.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(anomaly.severity)}`}>
                      {anomaly.severity}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Componentes Afectados</h5>
                      <div className="flex flex-wrap gap-2">
                        {anomaly.affectedComponents.map((component, index) => (
                          <span key={component} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                            {component}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Impacto</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Usuarios: {anomaly.impact.users.toLocaleString()}</div>
                        <div>Revenue: ${anomaly.impact.revenue.toLocaleString()}</div>
                        <div>Performance: {anomaly.impact.performance}%</div>
                        <div>Security: {anomaly.impact.security}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Contexto Histórico</h5>
                      <div className="text-sm text-gray-600">
                        <p>Primera vez visto: {anomaly.historicalContext.firstSeen.toLocaleDateString()}</p>
                        <p>Frecuencia: {anomaly.historicalContext.frequency} veces</p>
                        <p>Ocurrencias previas: {anomaly.historicalContext.previousOccurrences}</p>
                      </div>
                    </div>
                    {anomaly.rootCause && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Causa Raíz</h5>
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">{anomaly.rootCause.cause}</p>
                          <p>Confianza: {(anomaly.rootCause.confidence * 100).toFixed(0)}%</p>
                          <div className="mt-2">
                            <p className="font-medium">Evidencia:</p>
                            <ul className="list-disc list-inside">
                              {anomaly.rootCause.evidence.map((evidence, index) => (
                                <li key={evidence}>{evidence}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Confianza de detección: {(anomaly.confidence * 100).toFixed(1)}%
                    </span>
                    <span className="text-gray-600">
                      ID: {anomaly.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {patterns.map((pattern) => (
                <div key={pattern.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      {getPatternIcon(pattern.patternType)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{pattern.description}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Tipo: {pattern.patternType} | Timeframe: {pattern.timeframe}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {(pattern.confidence * 100).toFixed(0)}% confianza
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-gray-900">Evolución Predicha</h5>
                      <p className="text-sm text-gray-600">{pattern.predictedEvolution}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">Impacto en el Negocio</h5>
                      <p className="text-sm text-gray-600">{pattern.businessImpact}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">Recomendaciones</h5>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {pattern.recommendations.map((rec, index) => (
                          <li key={rec}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-6 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <Bell className="h-5 w-5 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      alert.status === 'ACTIVE' ? 'bg-red-100 text-red-800' :
                      alert.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {alert.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Timestamp:</span>
                    <div className="font-medium">{alert.timestamp.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Escalation Level:</span>
                    <div className="font-medium">{alert.escalationLevel}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Anomaly ID:</span>
                    <div className="font-medium text-xs">{alert.anomalyId}</div>
                  </div>
                </div>

                {alert.autoResolution && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Auto-resolución</h5>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className={`flex items-center space-x-1 ${
                        alert.autoResolution.successful ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {alert.autoResolution.successful ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span>{alert.autoResolution.successful ? 'Exitosa' : 'Fallida'}</span>
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 font-medium">Acciones tomadas:</p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {alert.autoResolution.actions.map((action, index) => (
                          <li key={action}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {recommendations.map((recommendation) => (
              <div key={recommendation.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="h-5 w-5 mt-1 text-yellow-500" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(recommendation.priority)}`}>
                      {recommendation.priority}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      recommendation.type === 'IMMEDIATE' ? 'bg-red-100 text-red-800' :
                      recommendation.type === 'SHORT_TERM' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {recommendation.type}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Impacto Estimado</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Performance:</span>
                        <span className="font-medium">+{recommendation.estimatedImpact.performance.toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Costo:</span>
                        <span className="font-medium">${recommendation.estimatedImpact.cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reducción de Riesgo:</span>
                        <span className="font-medium">{recommendation.estimatedImpact.risk.toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Esfuerzo:</span>
                        <span className="font-medium">{recommendation.estimatedImpact.effort.toFixed(0)}h</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Implementación</h5>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Timeline:</span>
                        <span className="font-medium ml-2">{recommendation.implementation.timeline}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Recursos:</span>
                        <div className="mt-1">
                          {recommendation.implementation.resources.map((resource, index) => (
                            <span key={`${resource}-${index}`} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                              {resource}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Pasos de Implementación</h5>
                    <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                      {recommendation.implementation.steps.map((step, index) => (
                        <li key={`${step}-${index}`}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Métricas de Éxito</h5>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      {recommendation.success_metrics.map((metric, index) => (
                        <li key={`${metric}-${index}`}>{metric}</li>
                      ))}
                    </ul>
                  </div>

                  {recommendation.implementation.dependencies.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Dependencias</h5>
                      <div className="flex flex-wrap gap-2">
                        {recommendation.implementation.dependencies.map((dependency, index) => (
                          <span key={`${dependency}-${index}`} className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded">
                            {dependency}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}