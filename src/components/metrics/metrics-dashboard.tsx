'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Activity } from 'lucide-react';
interface MetricCard { name: string; value: string; trend: 'up' | 'down' | 'stable'; }
const metrics: MetricCard[] = [
    { name: 'CPU', value: '45%', trend: 'stable' },
    { name: 'Memory', value: '62%', trend: 'up' },
    { name: 'Latency', value: '50ms', trend: 'down' },
];
export const MetricsDashboard: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" />Métricas del Sistema</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
            {metrics.map(m => (
                <div key={m.name} className="p-3 bg-gray-50 rounded-lg">
                    <Activity className="w-5 h-5 mb-1" />
                    <p className="text-sm text-gray-500">{m.name} ({m.trend})</p>
                    <p className="font-bold">{m.value}</p>
                </div>
            ))}
        </CardContent>
    </Card>
);
export default MetricsDashboard;