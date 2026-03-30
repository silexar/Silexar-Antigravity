/**
 * SILEXAR PULSE - TIER0+ SYSTEM OVERVIEW
 * Componente de Vista General del Sistema
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Server, Database, Shield } from 'lucide-react';

interface SystemMetric {
    readonly name: string;
    readonly value: string;
    readonly status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    readonly icon: React.ReactNode;
}

interface SystemOverviewProps {
    readonly className?: string;
}

export const SystemOverview: React.FC<SystemOverviewProps> = ({ className = '' }) => {
    const metrics: SystemMetric[] = [
        { name: 'CPU', value: '45%', status: 'HEALTHY', icon: <Activity className="w-5 h-5" /> },
        { name: 'Memoria', value: '62%', status: 'HEALTHY', icon: <Server className="w-5 h-5" /> },
        { name: 'Base de Datos', value: 'Operativa', status: 'HEALTHY', icon: <Database className="w-5 h-5" /> },
        { name: 'Seguridad', value: 'Activa', status: 'HEALTHY', icon: <Shield className="w-5 h-5" /> },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'HEALTHY': return 'text-green-600 bg-green-50';
            case 'WARNING': return 'text-yellow-600 bg-yellow-50';
            case 'CRITICAL': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Vista General del Sistema
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {metrics.map((metric) => (
                        <div
                            key={metric.name}
                            className={`p-4 rounded-lg ${getStatusColor(metric.status)}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                {metric.icon}
                                <span className="font-medium">{metric.name}</span>
                            </div>
                            <p className="text-xl font-bold">{metric.value}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default SystemOverview;