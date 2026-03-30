'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Activity } from 'lucide-react';
export const MLDashboard: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5" />ML Dashboard</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-2 text-green-600"><Activity className="w-5 h-5" /><span>Modelos activos</span></CardContent>
    </Card>
);
export default MLDashboard;