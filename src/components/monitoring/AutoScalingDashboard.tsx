/**
 * SILEXAR PULSE - TIER0+ AUTO-SCALING DASHBOARD
 * Dashboard de Auto-Escalado
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, Server, Gauge } from 'lucide-react';

interface AutoScalingDashboardProps {
    readonly className?: string;
}

const AutoScalingDashboard: React.FC<AutoScalingDashboardProps> = ({ className = '' }) => {
    const metrics = {
        currentInstances: 3,
        targetInstances: 3,
        cpuUtilization: 45,
        memoryUtilization: 62,
        requestsPerSecond: 150,
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Auto-Escalado</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-gray-500 flex items-center gap-1">
                            <Server className="w-3 h-3" />
                            Instancias
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-2xl font-bold">{metrics.currentInstances}</span>
                        <span className="text-sm text-gray-400">/{metrics.targetInstances}</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-gray-500 flex items-center gap-1">
                            <Gauge className="w-3 h-3" />
                            CPU
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-2xl font-bold text-green-600">{metrics.cpuUtilization}%</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-gray-500">Memoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-2xl font-bold text-yellow-600">{metrics.memoryUtilization}%</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-gray-500 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            RPS
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-2xl font-bold">{metrics.requestsPerSecond}</span>
                    </CardContent>
                </Card>
                <Card className="bg-green-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-green-600">Estado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-lg font-bold text-green-600">Óptimo</span>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AutoScalingDashboard;