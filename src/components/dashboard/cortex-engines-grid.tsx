'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Activity, Zap, Shield } from 'lucide-react';

const engines = [
    { name: 'Audience', icon: <Activity className="w-5 h-5" />, status: 'ACTIVE' },
    { name: 'Creative', icon: <Zap className="w-5 h-5" />, status: 'ACTIVE' },
    { name: 'Risk', icon: <Shield className="w-5 h-5" />, status: 'ACTIVE' },
];

export const CortexEnginesGrid: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5" />Cortex Engines</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
            {engines.map(e => (
                <div key={e.name} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    {e.icon}<span className="font-medium">{e.name}</span>
                </div>
            ))}
        </CardContent>
    </Card>
);
export default CortexEnginesGrid;