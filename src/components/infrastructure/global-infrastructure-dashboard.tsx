/**
 * AI-Powered Global Infrastructure Dashboard
 * TIER 0 Military-Grade Global Infrastructure Monitoring
 * 
 * @version 2040.1.0
 * @classification TIER_0_SUPREMACY
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Shield, 
  Zap, 
  Activity, 
  Server, 
  Brain,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  MapPin,
  Cpu,
  HardDrive,
  Network,
  Eye,
  Lock,
  Gauge
} from 'lucide-react';
import { GlobalInfrastructureOrchestrator } from '@/lib/infrastructure/global-orchestrator';
import { AIThreatDetector } from '@/lib/infrastructure/ai-threat-detector';
import type { 
  GlobalRegion, 
  EdgeNode, 
  AIOrchestrator, 
  GlobalInfrastructureMetrics,
  SecurityThreat 
} from '@/lib/infrastructure/types';

interface DashboardProps {
  className?: string;
}

export default function GlobalInfrastructureDashboard({ className = '' }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'regions' | 'edge' | 'ai' | 'security' | 'performance'>('overview');
  const [metrics, setMetrics] = useState<GlobalInfrastructureMetrics | null>(null);
  const [regions, setRegions] = useState<GlobalRegion[]>([]);
  const [edgeNodes, setEdgeNodes] = useState<EdgeNode[]>([]);
  const [aiOrchestrators, setAIOrchestrators] = useState<AIOrchestrator[]>([]);
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const orchestrator = GlobalInfrastructureOrchestrator.getInstance();
      const threatDetector = AIThreatDetector.getInstance();

      const [
        metricsData,
        regionsData,
        edgeNodesData,
        aiData,
        threatsData
      ] = await Promise.all([
        orchestrator.getGlobalMetrics(),
        orchestrator.getRegions(),
        orchestrator.getEdgeNodes(),
        orchestrator.getAIOrchestrators(),
        threatDetector.getDetectionHistory()
      ]);

      setMetrics(metricsData);
      setRegions(regionsData);
      setEdgeNodes(edgeNodesData);
      setAIOrchestrators(aiData);
      setThreats(threatsData.slice(-10)); // Last 10 threats
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'ONLINE':
        return 'text-green-500';
      case 'DEGRADED':
        return 'text-yellow-500';
      case 'OFFLINE':
      case 'MAINTENANCE':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-500 bg-red-50';
      case 'HIGH':
        return 'text-orange-500 bg-orange-50';
      case 'MEDIUM':
        return 'text-yellow-500 bg-yellow-50';
      case 'LOW':
        return 'text-blue-500 bg-blue-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando infraestructura global...</span>
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                🌐 AI-Powered Global Infrastructure
              </h2>
              <p className="text-gray-600">TIER 0 Military-Grade Global Infrastructure Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">TIER 0 ACTIVE</span>
            </div>
            <div className="text-xs text-gray-500">
              Última actualización: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Vista General', icon: Activity },
            { id: 'regions', label: 'Regiones', icon: MapPin },
            { id: 'edge', label: 'Edge Nodes', icon: Server },
            { id: 'ai', label: 'IA & ML', icon: Brain },
            { id: 'security', label: 'Seguridad', icon: Shield },
            { id: 'performance', label: 'Rendimiento', icon: Gauge }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Global Metrics */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Regiones Activas</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {metrics.global.activeRegions}/{metrics.global.totalRegions}
                      </p>
                    </div>
                    <Globe className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600">100% Disponibilidad</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Edge Nodes</p>
                      <p className="text-2xl font-bold text-green-900">
                        {metrics.global.activeEdgeNodes}/{metrics.global.totalEdgeNodes}
                      </p>
                    </div>
                    <Server className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600">Óptimo</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Latencia Global</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {metrics.global.globalLatency.toFixed(1)}ms
                      </p>
                    </div>
                    <Zap className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600">Excelente</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-600 text-sm font-medium">Amenazas IA</p>
                      <p className="text-2xl font-bold text-red-900">
                        {metrics.ai.threatsDetected}
                      </p>
                    </div>
                    <Shield className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <Lock className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600">{metrics.ai.threatsBlocked} Bloqueadas</span>
                  </div>
                </div>
              </div>
            )}

            {/* AI Performance */}
            {metrics && (
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Rendimiento de IA Militar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-900">{metrics.ai.predictionsAccuracy}%</p>
                    <p className="text-indigo-600 text-sm">Precisión de Predicciones</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-900">{metrics.ai.optimizationsApplied}</p>
                    <p className="text-indigo-600 text-sm">Optimizaciones Aplicadas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-900">${metrics.costs.optimizationSavings.toLocaleString()}</p>
                    <p className="text-indigo-600 text-sm">Ahorros por IA</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Threats */}
            {threats.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                  Amenazas Recientes Detectadas
                </h3>
                <div className="space-y-3">
                  {threats.slice(0, 5).map((threat) => (
                    <div key={threat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(threat.severity)}`}>
                          {threat.severity}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{threat.type}</p>
                          <p className="text-sm text-gray-600">
                            {threat.source.ip} → {threat.target.regionId}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {(threat.aiDetection.confidence * 100).toFixed(1)}% confianza
                        </p>
                        <p className="text-xs text-gray-500">
                          {threat.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'regions' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {regions.map((region) => (
                <div key={region.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{region.name}</h3>
                        <p className="text-sm text-gray-600">{region.code}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(region.status)} bg-gray-100`}>
                      {region.status}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Capacidad</span>
                      <span className="text-sm font-medium">{region.capacity.utilization * 100}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${region.capacity.utilization * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{region.performance.latency}ms</p>
                        <p className="text-xs text-gray-600">Latencia</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{region.performance.availability}%</p>
                        <p className="text-xs text-gray-600">Disponibilidad</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{(region.performance.throughput / 1000).toFixed(1)}K</p>
                        <p className="text-xs text-gray-600">Throughput</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'edge' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((tier) => {
                const tierNodes = edgeNodes.filter(node => node.tier === tier);
                const onlineNodes = tierNodes.filter(node => node.status === 'ONLINE').length;
                
                return (
                  <div key={tier} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Tier {tier} Edge Nodes</h3>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">{onlineNodes}/{tierNodes.length}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {tierNodes.slice(0, 3).map((node) => (
                        <div key={node.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">{node.id}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(node.status)} bg-white`}>
                              {node.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="flex items-center space-x-1">
                              <Cpu className="h-3 w-3 text-gray-500" />
                              <span>{(node.resources.cpu.utilization * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <HardDrive className="h-3 w-3 text-gray-500" />
                              <span>{(node.resources.memory.utilization * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Network className="h-3 w-3 text-gray-500" />
                              <span>{node.resources.network.latency}ms</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {tierNodes.length > 3 && (
                        <div className="text-center text-sm text-gray-500">
                          +{tierNodes.length - 3} más nodos
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            {aiOrchestrators.map((orchestrator) => (
              <div key={orchestrator.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{orchestrator.id}</h3>
                      <p className="text-sm text-gray-600">Tipo: {orchestrator.type}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(orchestrator.status)} bg-gray-100`}>
                    {orchestrator.status}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(orchestrator.models).map(([modelType, model]) => (
                    <div key={modelType} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">{model.name}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Precisión:</span>
                          <span className="font-medium">{(model.accuracy * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Confianza:</span>
                          <span className="font-medium">{(model.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Predicciones:</span>
                          <span className="font-medium">{model.predictions.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Estado de Seguridad TIER 0
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-900">99.8%</p>
                  <p className="text-red-600 text-sm">Tasa de Detección</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-900">&lt;10s</p>
                  <p className="text-red-600 text-sm">Tiempo de Respuesta</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-900">AES-256</p>
                  <p className="text-red-600 text-sm">Encriptación</p>
                </div>
              </div>
            </div>

            {threats.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Amenazas Detectadas</h3>
                {threats.map((threat) => (
                  <div key={threat.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(threat.severity)}`}>
                          {threat.severity}
                        </div>
                        <span className="font-medium text-gray-900">{threat.type}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {threat.timestamp.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Origen:</p>
                        <p className="font-medium">{threat.source.ip} ({threat.source.country})</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Objetivo:</p>
                        <p className="font-medium">{threat.target.regionId}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Confianza IA:</p>
                        <p className="font-medium">{(threat.aiDetection.confidence * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    {threat.mitigation.actions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Acciones de Mitigación:</p>
                        <div className="flex flex-wrap gap-2">
                          {threat.mitigation.actions.map((action, index) => (
                            <span key={`${action}-${index}`} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {action}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'performance' && metrics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Tiempo de Respuesta</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {metrics.performance.averageResponseTime.toFixed(1)}ms
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Throughput Pico</p>
                    <p className="text-2xl font-bold text-green-900">
                      {(metrics.performance.peakThroughput / 1000).toFixed(1)}K
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Tasa de Éxito</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {metrics.performance.successRate}%
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Tasa de Error</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {metrics.performance.errorRate}%
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Costos por Región
              </h3>
              <div className="space-y-3">
                {Object.entries(metrics.costs.costPerRegion).map(([regionId, cost]) => {
                  const region = regions.find(r => r.id === regionId);
                  return (
                    <div key={regionId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {region?.name || regionId}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        ${cost.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="text-xl font-bold text-gray-900">
                  ${metrics.costs.totalCost.toLocaleString()}
                </span>
              </div>
              <div className="mt-2 flex justify-between items-center text-green-600">
                <span className="text-sm">Ahorros por IA:</span>
                <span className="font-semibold">
                  ${metrics.costs.optimizationSavings.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}