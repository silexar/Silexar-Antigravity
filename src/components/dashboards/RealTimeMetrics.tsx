'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp } from 'lucide-react';
export const RealTimeMetrics: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" />Real-Time Metrics</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-2 text-green-600"><TrendingUp className="w-5 h-5" /><span>En vivo</span></CardContent>
    </Card>
);
export default RealTimeMetrics;