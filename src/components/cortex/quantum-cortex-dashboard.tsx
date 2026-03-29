'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
export const QuantumCortexDashboard: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5" />Quantum Cortex</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-gray-500">Procesamiento cuántico activo</p></CardContent>
    </Card>
);
export default QuantumCortexDashboard;