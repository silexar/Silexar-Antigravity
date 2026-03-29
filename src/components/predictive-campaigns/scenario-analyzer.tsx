'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
export const ScenarioAnalyzer: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" />Analizador de Escenarios</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-gray-500">Simulación de múltiples escenarios de campaña</p></CardContent>
    </Card>
);
export default ScenarioAnalyzer;