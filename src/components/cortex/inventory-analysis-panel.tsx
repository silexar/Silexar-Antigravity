'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
export const InventoryAnalysisPanel: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Package className="w-5 h-5" />Análisis de Inventario</CardTitle></CardHeader>
        <CardContent><p className="text-gray-500">Panel de análisis de inventario Cortex</p></CardContent>
    </Card>
);
export default InventoryAnalysisPanel;