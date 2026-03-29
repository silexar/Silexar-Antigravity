'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
interface Aprobacion { id: string; estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'; }
export const SistemaAprobacionesWeb: React.FC<{ aprobaciones?: Aprobacion[]; className?: string }> = ({ aprobaciones = [], className = '' }) => {
    const getIcon = (e: string) => e === 'APROBADO' ? <CheckCircle className="w-4 h-4 text-green-500" /> : e === 'RECHAZADO' ? <XCircle className="w-4 h-4 text-red-500" /> : <Clock className="w-4 h-4 text-yellow-500" />;
    return (
        <Card className={className}>
            <CardHeader><CardTitle>Sistema de Aprobaciones</CardTitle></CardHeader>
            <CardContent>{aprobaciones.length === 0 ? <p className="text-gray-500 text-sm">Sin aprobaciones pendientes</p> : aprobaciones.map(a => <div key={a.id} className="flex items-center gap-2">{getIcon(a.estado)}<span>{a.id}</span></div>)}</CardContent>
        </Card>
    );
};
export default SistemaAprobacionesWeb;