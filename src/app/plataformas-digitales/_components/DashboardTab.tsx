'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Globe, TrendingUp, Eye, MousePointer, DollarSign, Target, Activity, Zap, Bot } from 'lucide-react';
import type { PlatformConnection, TotalMetrics, PerformanceMetrics } from '../_types';
import { getStatusColor, formatCurrency, formatNumber, formatPercentage } from '../_utils';

interface DashboardTabProps {
  platformConnections: PlatformConnection[];
  totalMetrics: TotalMetrics;
  performanceMetrics: PerformanceMetrics;
}

export function DashboardTab({ platformConnections, totalMetrics, performanceMetrics }: DashboardTabProps) {
  return (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Impresiones Totales</p>
                <p className="text-2xl font-bold text-slate-900">{formatNumber(totalMetrics.impressions)}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+12.5%</span>
              <span className="text-slate-500 ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Clics Totales</p>
                <p className="text-2xl font-bold text-slate-900">{formatNumber(totalMetrics.clicks)}</p>
              </div>
              <MousePointer className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+8.3%</span>
              <span className="text-slate-500 ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Inversión Total</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalMetrics.spend)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+5.7%</span>
              <span className="text-slate-500 ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Conversiones</p>
                <p className="text-2xl font-bold text-slate-900">{formatNumber(totalMetrics.conversions)}</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+15.2%</span>
              <span className="text-slate-500 ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">CTR Promedio</p>
                <p className="text-xl font-bold text-slate-900">{formatPercentage(performanceMetrics.avgCtr)}</p>
              </div>
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">CPC Promedio</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(performanceMetrics.avgCpc)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Costo por Conversión</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(performanceMetrics.avgCostPerConversion)}</p>
              </div>
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Consciousness Efficiency</p>
                <p className="text-xl font-bold text-blue-900">{performanceMetrics.consciousnessEfficiency.toFixed(2)}</p>
                <Badge variant="outline" className="mt-1 text-xs bg-blue-100 text-blue-700 border-blue-300">TIER 0</Badge>
              </div>
              <Bot className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Quantum ROAS</p>
                <p className="text-xl font-bold text-purple-900">{performanceMetrics.quantumROAS.toFixed(2)}</p>
                <Badge variant="outline" className="mt-1 text-xs bg-purple-100 text-purple-700 border-purple-300">QUANTUM</Badge>
              </div>
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estado de plataformas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Estado de Plataformas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformConnections.map((platform) => (
              <div
                key={platform.platform}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  platform.tier0Compliance
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{platform.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{platform.name}</p>
                      {platform.tier0Compliance && (
                        <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">TIER 0</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      {platform.campaignCount} campañas • {formatCurrency(platform.totalSpend)}
                    </p>
                    {platform.connected && (
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
                        <span>Consciousness: {platform.consciousness.level.toFixed(1)}%</span>
                        <span>Performance: {platform.quantumPerformance.renderTime.toFixed(1)}ms</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(platform.status)}`} />
                    <span className="text-sm text-slate-600 capitalize">{platform.status}</span>
                  </div>
                  {platform.connected && (
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">Pentagon++</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
