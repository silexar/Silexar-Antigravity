'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User } from 'lucide-react';
interface AuditEntry { id: string; accion: string; usuario: string; fecha: string; }
export const HistorialAuditTrailTier0: React.FC<{ historial?: AuditEntry[]; className?: string }> = ({ historial = [], className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" />Historial de Cambios</CardTitle></CardHeader>
        <CardContent>{historial.length === 0 ? <p className="text-gray-500 text-sm">Sin cambios registrados</p> : historial.map(e => <div key={e.id} className="flex items-center gap-2 p-2 border-b"><User className="w-4 h-4" /><span className="text-sm">{e.accion}</span></div>)}</CardContent>
    </Card>
);
export default HistorialAuditTrailTier0;
