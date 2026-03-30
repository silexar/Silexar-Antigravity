'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
export const ExecutiveDashboard: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" />Dashboard Ejecutivo</CardTitle></CardHeader>
        <CardContent><p className="text-gray-500">Vista ejecutiva de campañas predictivas</p></CardContent>
    </Card>
);
export default ExecutiveDashboard;