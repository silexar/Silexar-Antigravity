/**
 * SILEXAR PULSE - TIER0+ ML PREDICTIVE DASHBOARD
 * Dashboard de Predicciones de Machine Learning
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface PredictionMetric {
    readonly label: string;
    readonly value: number;
    readonly trend: 'up' | 'down' | 'stable';
    readonly confidence: number;
}

interface MLPredictiveDashboardProps {
    readonly className?: string;
}

const MLPredictiveDashboard: React.FC<MLPredictiveDashboardProps> = ({ className = '' }) => {
    const metrics: PredictionMetric[] = [
        { label: 'Predicción de Carga', value: 75, trend: 'up', confidence: 0.92 },
        { label: 'Anomalías Detectadas', value: 2, trend: 'down', confidence: 0.88 },
        { label: 'Rendimiento Esperado', value: 95, trend: 'stable', confidence: 0.95 },
        { label: 'Salud del Sistema', value: 98, trend: 'up', confidence: 0.97 },
    ];

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'down': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            default: return <CheckCircle className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Dashboard Predictivo ML</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.map((metric, index) => (
                    <Card key={`${metric}-${index}`} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                {metric.label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold">{metric.value}</span>
                                {getTrendIcon(metric.trend)}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                Confianza: {(metric.confidence * 100).toFixed(0)}%
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default MLPredictiveDashboard;