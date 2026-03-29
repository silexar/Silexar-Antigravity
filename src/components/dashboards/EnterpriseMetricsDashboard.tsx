'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Activity } from 'lucide-react';
export const EnterpriseMetricsDashboard: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" />Métricas Enterprise</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-2 text-green-600"><Activity className="w-5 h-5" /><span>99.9% uptime</span></CardContent>
    </Card>
);
export default EnterpriseMetricsDashboard;