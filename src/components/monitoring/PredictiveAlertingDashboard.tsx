/**
 * SILEXAR PULSE - TIER0+ PREDICTIVE ALERTING DASHBOARD
 * Dashboard de Alertas Predictivas
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { usePredictiveAlerting } from '@/hooks/usePredictiveAlerting';

interface PredictiveAlertingDashboardProps {
    readonly className?: string;
}

const PredictiveAlertingDashboard: React.FC<PredictiveAlertingDashboardProps> = ({ className = '' }) => {
    const { alerts, loading } = usePredictiveAlerting();

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Alertas Predictivas</h2>
            </div>
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full" />
                </div>
            ) : alerts.length === 0 ? (
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="flex items-center gap-3 p-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                        <div>
                            <p className="font-medium text-green-700">Sistema Saludable</p>
                            <p className="text-sm text-green-600">No hay alertas activas</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {alerts.map((alert) => (
                        <Card key={alert.id} className="border-l-4 border-l-yellow-400">
                            <CardContent className="flex items-center gap-3 p-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                <div className="flex-1">
                                    <p className="font-medium">{alert.message}</p>
                                    <p className="text-xs text-gray-500">
                                        Confianza: {(alert.confidence * 100).toFixed(0)}%
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PredictiveAlertingDashboard;