'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, TrendingUp } from 'lucide-react';
export const ExecutiveReportsDashboard: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />Reportes Ejecutivos</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-500" /><span>Performance óptimo</span></CardContent>
    </Card>
);
export default ExecutiveReportsDashboard;