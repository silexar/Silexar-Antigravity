'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, DollarSign, FileText } from 'lucide-react';
export const DashboardEjecutivo: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" />Dashboard Ejecutivo</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 rounded-lg"><DollarSign className="w-5 h-5 text-green-600 mb-1" /><p className="text-sm text-gray-500">Valor Total</p><p className="font-bold">$2.5M</p></div>
            <div className="p-3 bg-blue-50 rounded-lg"><FileText className="w-5 h-5 text-blue-600 mb-1" /><p className="text-sm text-gray-500">Contratos</p><p className="font-bold">156</p></div>
        </CardContent>
    </Card>
);
export default DashboardEjecutivo;