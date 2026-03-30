'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, AlertTriangle } from 'lucide-react';
interface Alerta { id: string; mensaje: string; prioridad: 'BAJA' | 'MEDIA' | 'ALTA'; }
export const CentroAlertas: React.FC<{ alertas?: Alerta[]; className?: string }> = ({ alertas = [], className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" />Centro de Alertas</CardTitle></CardHeader>
        <CardContent>{alertas.length === 0 ? <p className="text-gray-500 text-sm">Sin alertas activas</p> : alertas.map(a => <div key={a.id} className="flex items-center gap-2 p-2 bg-yellow-50 rounded"><AlertTriangle className="w-4 h-4 text-yellow-500" /><span className="text-sm">{a.mensaje}</span></div>)}</CardContent>
    </Card>
);
export default CentroAlertas;