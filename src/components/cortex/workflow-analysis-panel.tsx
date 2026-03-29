'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Workflow } from 'lucide-react';
export const WorkflowAnalysisPanel: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Workflow className="w-5 h-5" />Análisis de Workflow</CardTitle></CardHeader>
        <CardContent><p className="text-gray-500">Panel de análisis de flujos de trabajo</p></CardContent>
    </Card>
);
export default WorkflowAnalysisPanel;