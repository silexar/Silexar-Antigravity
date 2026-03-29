'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu } from 'lucide-react';
export const EdgeComputingDashboard: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="w-5 h-5" />Edge Computing</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-gray-500">Procesamiento en el borde de la red</p></CardContent>
    </Card>
);
export default EdgeComputingDashboard;